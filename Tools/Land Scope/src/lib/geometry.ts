import {
  area,
  along,
  bbox,
  bboxPolygon,
  buffer,
  booleanPointInPolygon,
  centerOfMass,
  cleanCoords,
  concave,
  destination,
  difference,
  distance,
  featureCollection,
  flattenEach,
  intersect,
  length,
  lineSplit,
  point,
  polygon,
  simplify,
  union,
} from '@turf/turf'
import type { Feature, FeatureCollection, LineString, MultiLineString, MultiPolygon, Point, Polygon, Position } from 'geojson'
import { APP_CONFIG } from '../config'
import type { LineFeature, PolygonFeature } from '../types'

export function asPolygonFeature(feature: Feature<Polygon | MultiPolygon>): PolygonFeature {
  return feature as PolygonFeature
}

export function safeArea(feature: Feature<Polygon | MultiPolygon> | null | undefined) {
  if (!feature) return 0
  try { return area(feature) } catch { return 0 }
}

export function safeUnion(features: Array<Feature<Polygon | MultiPolygon> | null | undefined>): PolygonFeature | null {
  const valid = features.filter((feature): feature is Feature<Polygon | MultiPolygon> => Boolean(feature && safeArea(feature) > 0.01))
  if (valid.length === 0) return null
  if (valid.length === 1) return asPolygonFeature(valid[0])
  try {
    return union(featureCollection(valid)) as PolygonFeature | null
  } catch {
    let current: PolygonFeature | null = asPolygonFeature(valid[0])
    for (const feature of valid.slice(1)) {
      if (!current) { current = asPolygonFeature(feature); continue }
      try { current = union(featureCollection([current, feature])) as PolygonFeature | null } catch { /* preserve usable geometry */ }
    }
    return current
  }
}

export function safeIntersect(a: Feature<Polygon | MultiPolygon> | null, b: Feature<Polygon | MultiPolygon> | null): PolygonFeature | null {
  if (!a || !b) return null
  try { return intersect(featureCollection([a, b])) as PolygonFeature | null } catch { return null }
}

export function safeDifference(a: Feature<Polygon | MultiPolygon> | null, b: Feature<Polygon | MultiPolygon> | null): PolygonFeature | null {
  if (!a) return null
  if (!b) return asPolygonFeature(a)
  try { return difference(featureCollection([a, b])) as PolygonFeature | null } catch { return asPolygonFeature(a) }
}

export function safeBuffer(feature: Feature, radiusM: number): PolygonFeature | null {
  try { return buffer(feature, radiusM, { units: 'meters', steps: 6 }) as PolygonFeature | null } catch { return null }
}

export function clipPolygon(feature: Feature<Polygon | MultiPolygon> | null, boundary: PolygonFeature) {
  return safeIntersect(feature, boundary)
}

export function clipLines(
  collection: FeatureCollection<LineString | MultiLineString, Record<string, unknown>>,
  boundary: PolygonFeature,
) {
  const boundaryBox = bbox(boundary)
  const clipped: Feature<LineString, Record<string, unknown>>[] = []
  collection.features.forEach((feature) => {
    const lineBox = bbox(feature)
    if (lineBox[2] < boundaryBox[0] || lineBox[0] > boundaryBox[2] || lineBox[3] < boundaryBox[1] || lineBox[1] > boundaryBox[3]) return
    flattenEach(feature, (line) => {
      try {
        const lineFeature = line as Feature<LineString, Record<string, unknown>>
        const segments = lineSplit(lineFeature, boundary)
        if (segments.features.length === 0) {
          const mid = along(lineFeature, length(lineFeature, { units: 'kilometers' }) / 2, { units: 'kilometers' })
          if (booleanPointInPolygon(mid, boundary)) clipped.push(lineFeature)
          return
        }
        segments.features.forEach((segment) => {
          const segmentLength = length(segment, { units: 'kilometers' })
          const mid = along(segment, segmentLength / 2, { units: 'kilometers' })
          if (booleanPointInPolygon(mid, boundary)) {
            segment.properties = feature.properties ?? {}
            clipped.push(segment as Feature<LineString, Record<string, unknown>>)
          }
        })
      } catch {
        // Invalid lines are ignored instead of aborting the entire settlement analysis.
      }
    })
  })
  return featureCollection(clipped)
}

export function safeLength(feature: LineFeature) {
  try { return length(feature, { units: 'kilometers' }) * 1000 } catch { return 0 }
}

function featureCenter(feature: Feature<Polygon | MultiPolygon>): Feature<Point> {
  try { return centerOfMass(feature) } catch { return point(bbox(feature).slice(0, 2) as Position) }
}

export function clusterBuildings(
  buildings: FeatureCollection<Polygon | MultiPolygon, Record<string, unknown>>,
  settlementCenter: Feature<Point>,
) {
  const centers = buildings.features.map((feature, index) => ({ feature, center: featureCenter(feature), index }))
  const visited = new Set<number>()
  const clusters: typeof centers[] = []

  for (const item of centers) {
    if (visited.has(item.index)) continue
    const cluster: typeof centers = []
    const queue = [item]
    visited.add(item.index)
    while (queue.length) {
      const current = queue.shift()!
      cluster.push(current)
      for (const candidate of centers) {
        if (visited.has(candidate.index)) continue
        if (distance(current.center, candidate.center, { units: 'meters' }) <= APP_CONFIG.boundary.clusterDistanceM) {
          visited.add(candidate.index)
          queue.push(candidate)
        }
      }
    }
    clusters.push(cluster)
  }

  const ranked = (clusters.length ? clusters : [])
    .map((cluster) => ({
      cluster,
      nearestToSettlementM: Math.min(...cluster.map((item) => distance(item.center, settlementCenter, { units: 'meters' }))),
    }))
    .filter(({ nearestToSettlementM }) => nearestToSettlementM <= APP_CONFIG.boundary.centerPreferenceM)
    .sort((a, b) => b.cluster.length - a.cluster.length || a.nearestToSettlementM - b.nearestToSettlementM)

  const eligible = ranked.filter(({ cluster }) => cluster.length >= APP_CONFIG.boundary.minimumClusterSize)
  const primary = (eligible[0] ?? ranked[0])?.cluster ?? []
  if (primary.length === 0) return []

  const minimumSecondarySize = Math.max(
    APP_CONFIG.boundary.secondaryClusterMinSize,
    Math.ceil(primary.length * APP_CONFIG.boundary.secondaryClusterMinRatio),
  )
  const merged = [...primary]
  const remaining = ranked.filter(({ cluster }) => cluster !== primary && cluster.length >= minimumSecondarySize)

  // A settlement can have several built-up neighbourhoods separated by a wider
  // road, river or undeveloped strip. Join only substantial nearby clusters;
  // isolated farms and single buildings remain excluded.
  let added = true
  while (added) {
    added = false
    for (let index = remaining.length - 1; index >= 0; index -= 1) {
      const candidate = remaining[index].cluster
      const bridgeDistance = Math.min(...candidate.flatMap((item) =>
        merged.map((member) => distance(item.center, member.center, { units: 'meters' }))))
      if (bridgeDistance <= APP_CONFIG.boundary.clusterBridgeDistanceM) {
        merged.push(...candidate)
        remaining.splice(index, 1)
        added = true
      }
    }
  }
  return merged
}

export function dataRadiusForBoundary(boundary: PolygonFeature, lat: number, lon: number) {
  const [west, south, east, north] = bbox(boundary)
  const center = point([lon, lat])
  const farthestCornerM = Math.max(
    distance(center, point([west, south]), { units: 'meters' }),
    distance(center, point([west, north]), { units: 'meters' }),
    distance(center, point([east, south]), { units: 'meters' }),
    distance(center, point([east, north]), { units: 'meters' }),
  )
  return Math.ceil((farthestCornerM + APP_CONFIG.overpass.editedBoundaryPaddingM) / 100) * 100
}

export function boundaryFromBuildingCluster(
  buildings: FeatureCollection<Polygon | MultiPolygon, Record<string, unknown>>,
  lat: number,
  lon: number,
): PolygonFeature | null {
  const center = point([lon, lat])
  const cluster = clusterBuildings(buildings, center)
  if (cluster.length < 3) return null
  const centers = featureCollection(cluster.map((item) => item.center))
  let hull: PolygonFeature | null = null
  try { hull = concave(centers, { maxEdge: APP_CONFIG.boundary.clusterDistanceM * 2.4, units: 'meters' }) as PolygonFeature | null } catch { hull = null }
  if (!hull) {
    const box = bbox(centers)
    hull = bboxPolygon(box) as PolygonFeature
  }
  const buffered = safeBuffer(hull, APP_CONFIG.boundary.buildingBufferM)
  if (!buffered) return null
  try {
    return cleanCoords(simplify(buffered, { tolerance: APP_CONFIG.boundary.simplifyTolerance, highQuality: true })) as PolygonFeature
  } catch {
    return buffered
  }
}

export function fallbackBoundary(lat: number, lon: number): PolygonFeature {
  const center = point([lon, lat])
  const bearings = Array.from({ length: 48 }, (_, index) => index * 7.5)
  const ring = bearings.map((bearing) => destination(center, APP_CONFIG.boundary.fallbackRadiusM, bearing, { units: 'meters' }).geometry.coordinates)
  ring.push(ring[0])
  return polygon([ring]) as PolygonFeature
}

export function validateSettlementPolygon(
  geometry: GeoJSON.Geometry | undefined,
  lat: number,
  lon: number,
  limits?: { maximumAreaKm2?: number; maximumCentroidOffsetM?: number },
): PolygonFeature | null {
  if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) return null
  const feature = { type: 'Feature', properties: {}, geometry } as PolygonFeature
  const areaKm2 = safeArea(feature) / 1_000_000
  const maximumAreaKm2 = limits?.maximumAreaKm2 ?? APP_CONFIG.boundary.maximumAreaKm2
  const maximumCentroidOffsetM = limits?.maximumCentroidOffsetM ?? APP_CONFIG.boundary.maximumCentroidOffsetM
  if (areaKm2 < APP_CONFIG.boundary.minimumAreaKm2 || areaKm2 > maximumAreaKm2) return null
  try {
    const offset = distance(centerOfMass(feature), point([lon, lat]), { units: 'meters' })
    if (offset > maximumCentroidOffsetM) return null
  } catch { return null }
  return feature
}

export function roadArea(
  roads: FeatureCollection<LineString | MultiLineString, Record<string, unknown>>,
): PolygonFeature | null {
  const buffers = roads.features.map((road) => {
    const properties = road.properties ?? {}
    const tags = (properties.tags as Record<string, string> | undefined) ?? properties as Record<string, string>
    const explicitWidth = Number.parseFloat(tags.width)
    const width = Number.isFinite(explicitWidth) && explicitWidth > 1 && explicitWidth < 40
      ? explicitWidth
      : APP_CONFIG.roads.defaultWidthM[tags.highway] ?? 5
    return safeBuffer(road, width / 2)
  })
  return safeUnion(buffers)
}
