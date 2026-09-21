import { featureCollection } from '@turf/turf'
import type { Feature, GeoJsonProperties, Geometry } from 'geojson'
import type { Locale } from '@/lib/i18n'
import { sa } from '../copy'
import type { AnalysisResult, CategoryKey, CategoryResult } from '../types'

function quoteCsv(value: string | number) {
  const stringValue = String(value)
  return /[",\n]/.test(stringValue) ? `"${stringValue.replaceAll('"', '""')}"` : stringValue
}

function categoryMap(result: AnalysisResult): Record<CategoryKey, CategoryResult> {
  return Object.fromEntries(result.categories.map((item) => [item.key, item])) as Record<CategoryKey, CategoryResult>
}

export function analysisToCsv(result: AnalysisResult, locale: Locale = 'bg') {
  const copy = sa(locale)
  const category = categoryMap(result)
  const data: Record<string, string | number> = {
    settlement_name: result.settlement.name,
    municipality: result.settlement.municipality,
    region: result.settlement.region,
    country: result.settlement.country,
    analysis_area_m2: result.analysisAreaM2,
    analysis_area_ha: result.analysisAreaHa,
    analysis_area_km2: result.analysisAreaKm2,
    residential_m2: category.residential.areaM2,
    residential_ha: category.residential.areaHa,
    residential_percent: category.residential.percent,
    industrial_commercial_m2: category.industrial.areaM2,
    industrial_commercial_ha: category.industrial.areaHa,
    industrial_commercial_percent: category.industrial.percent,
    roads_m2: category.roads.areaM2,
    roads_ha: category.roads.areaHa,
    roads_percent: category.roads.percent,
    road_length_m: result.roadMetrics.lengthM,
    road_length_km: result.roadMetrics.lengthKm,
    road_density_km_per_km2: result.roadMetrics.densityKmPerKm2,
    green_m2: category.green.areaM2,
    green_ha: category.green.areaHa,
    green_percent: category.green.percent,
    water_m2: category.water.areaM2,
    water_ha: category.water.areaHa,
    water_percent: category.water.percent,
    agricultural_m2: category.agricultural.areaM2,
    agricultural_ha: category.agricultural.areaHa,
    agricultural_percent: category.agricultural.percent,
    other_m2: category.other.areaM2,
    other_ha: category.other.areaHa,
    other_percent: category.other.percent,
    total_buildings: result.buildingMetrics.total,
    likely_residential_buildings: result.buildingMetrics.residential,
    industrial_commercial_buildings: result.buildingMetrics.industrial,
    other_buildings: result.buildingMetrics.other,
    unknown_buildings: result.buildingMetrics.unknown,
    building_footprint_m2: result.buildingMetrics.footprintM2,
    built_up_coverage_percent: result.buildingMetrics.builtUpPercent,
    buildings_per_ha: result.buildingMetrics.perHa,
    residential_buildings_per_ha: result.buildingMetrics.residentialPerHa,
    average_building_footprint_m2: result.buildingMetrics.averageFootprintM2,
    poi_count: result.poiCount,
    settlement_profile: result.profile,
    data_confidence: result.confidence.level,
    classified_building_percent: result.buildingMetrics.classifiedPercent,
    explicit_landuse_coverage_percent: result.confidence.explicitLandusePercent,
    analysis_date: result.createdAt,
    locale,
    profile_label: copy.profiles[result.profile],
    confidence_label: copy.confidenceLevels[result.confidence.level],
  }
  const headers = Object.keys(data)
  return `\uFEFF${headers.join(',')}\n${headers.map((header) => quoteCsv(data[header] ?? '')).join(',')}\n`
}

export function analysisToGeoJson(result: AnalysisResult, locale: Locale = 'bg') {
  const copy = sa(locale)
  const features: Feature<Geometry, GeoJsonProperties>[] = []
  features.push({
    ...result.boundary,
    properties: {
      layer: 'analysis_boundary',
      layer_label: copy.analysisBoundary,
      settlement: result.settlement.name,
    },
  })
  result.categories.forEach((category) => {
    if (!category.geometry) return
    features.push({
      ...category.geometry,
      properties: {
        layer: category.key,
        layer_label: copy.categories[category.key],
        area_m2: category.areaM2,
        area_ha: category.areaHa,
        percent: category.percent,
      },
    })
  })
  result.buildings.features.forEach((feature) => features.push({ ...feature, properties: { ...feature.properties, layer: 'buildings', layer_label: copy.buildings } }))
  result.roads.features.forEach((feature) => features.push({ ...feature, properties: { ...feature.properties, layer: 'road_centerlines', layer_label: copy.roadNetwork } }))
  result.pois.features.forEach((feature) => features.push({ ...feature, properties: { ...feature.properties, layer: 'pois', layer_label: copy.pois } }))
  return featureCollection(features)
}

export function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function safeFilename(value: string) {
  return value.toLocaleLowerCase('bg-BG').replaceAll(/[^\p{L}\p{N}]+/gu, '-').replaceAll(/^-|-$/g, '') || 'analysis'
}
