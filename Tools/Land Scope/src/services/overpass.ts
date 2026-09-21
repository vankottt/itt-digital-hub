import osmtogeojson from 'osmtogeojson'
import { centroid, featureCollection } from '@turf/turf'
import { APP_CONFIG } from '../config'
import type { RawGeodata } from '../types'
import type { Feature, Geometry, LineString, MultiLineString, MultiPolygon, Point, Polygon } from 'geojson'

interface CacheEntry<T> { value: T; createdAt: number }

function buildQuery(lat: number, lon: number, radius: number) {
  return `[out:json][timeout:${APP_CONFIG.overpass.timeoutSeconds}];
(
  nwr["building"](around:${radius},${lat},${lon});
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service)$"](around:${radius},${lat},${lon});
  nwr["landuse"](around:${radius},${lat},${lon});
  nwr["natural"~"^(water|wood|scrub|grassland|wetland)$"](around:${radius},${lat},${lon});
  nwr["leisure"~"^(park|recreation_ground|garden|nature_reserve)$"](around:${radius},${lat},${lon});
  nwr["waterway"~"^(riverbank|dock|canal)$"](around:${radius},${lat},${lon});
  nwr["amenity"~"^(school|kindergarten|townhall|clinic|doctors|hospital|pharmacy|place_of_worship|community_centre|library|sports_centre|parking|grave_yard)$"](around:${radius},${lat},${lon});
  nwr["sport"](around:${radius},${lat},${lon});
);out body geom qt;`
}

function readCache(key: string): RawGeodata | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<RawGeodata>
    if (Date.now() - entry.createdAt > APP_CONFIG.overpass.cacheTtlMs) return null
    return entry.value
  } catch {
    return null
  }
}

function writeCache(key: string, value: RawGeodata) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ value, createdAt: Date.now() }))
  } catch {
    // Large responses can exceed browser storage; analysis still works without cache.
  }
}

function tagsOf(feature: Feature<Geometry, Record<string, unknown>>): Record<string, string> {
  const properties = feature.properties ?? {}
  return (properties.tags as Record<string, string> | undefined) ?? (properties as Record<string, string>)
}

function polygonFeatures(features: Feature<Geometry, Record<string, unknown>>[]) {
  return features.filter((feature): feature is Feature<Polygon | MultiPolygon, Record<string, unknown>> =>
    feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon')
}

function lineFeatures(features: Feature<Geometry, Record<string, unknown>>[]) {
  return features.filter((feature): feature is Feature<LineString | MultiLineString, Record<string, unknown>> =>
    feature.geometry?.type === 'LineString' || feature.geometry?.type === 'MultiLineString')
}

function poiPoint(feature: Feature<Geometry, Record<string, unknown>>): Feature<Point, Record<string, unknown>> | null {
  if (feature.geometry.type === 'Point') return feature as Feature<Point, Record<string, unknown>>
  try {
    return centroid(feature, { properties: feature.properties ?? {} }) as Feature<Point, Record<string, unknown>>
  } catch {
    return null
  }
}

function parse(data: unknown, endpoint: string): RawGeodata {
  const converted = osmtogeojson(data as Parameters<typeof osmtogeojson>[0]) as GeoJSON.FeatureCollection<Geometry, Record<string, unknown>>
  const features = converted.features.filter((feature) => feature.geometry)
  const polygons = polygonFeatures(features)
  const lines = lineFeatures(features)
  const buildings = polygons.filter((feature) => Boolean(tagsOf(feature).building))
  const roads = lines.filter((feature) => Boolean(tagsOf(feature).highway))
  const landuse = polygons.filter((feature) => {
    const tags = tagsOf(feature)
    return Boolean(tags.landuse || tags.natural || tags.leisure || tags.water || tags.waterway)
  })
  const pois = features
    .filter((feature) => {
      const tags = tagsOf(feature)
      return Boolean(tags.amenity || tags.sport)
    })
    .map(poiPoint)
    .filter((feature): feature is Feature<Point, Record<string, unknown>> => feature !== null)

  return {
    all: featureCollection(features),
    buildings: featureCollection(buildings),
    roads: featureCollection(roads),
    landuse: featureCollection(landuse),
    pois: featureCollection(pois),
    sourceEndpoint: endpoint,
  } as RawGeodata
}

export async function fetchSettlementGeodata(
  lat: number,
  lon: number,
  signal?: AbortSignal,
  radiusM: number = APP_CONFIG.overpass.radiusM,
): Promise<RawGeodata> {
  const radius = Math.round(radiusM / 100) * 100
  const cacheKey = `settlement-data:v3:r${radius}:${lat.toFixed(4)}:${lon.toFixed(4)}`
  const cached = readCache(cacheKey)
  if (cached) return cached
  const query = buildQuery(lat, lon, radius)
  const errors: string[] = []

  for (const endpoint of APP_CONFIG.overpass.endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', Accept: 'application/json' },
        body: new URLSearchParams({ data: query }),
      })
      if (!response.ok) {
        errors.push(`${new URL(endpoint).host}: ${response.status}`)
        continue
      }
      const result = parse(await response.json(), endpoint)
      writeCache(cacheKey, result)
      return result
    } catch (error) {
      if (signal?.aborted) throw error
      errors.push(`${new URL(endpoint).host}: ${error instanceof Error ? error.message : 'неизвестна грешка'}`)
    }
  }
  throw new Error(`Отворените географски данни временно не са достъпни. Опитани източници: ${errors.join('; ')}`)
}
