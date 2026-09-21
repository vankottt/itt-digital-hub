import { area, booleanIntersects, booleanPointInPolygon, centerOfMass, distance, featureCollection, point } from '@turf/turf'
import type { Feature, MultiPolygon, Point, Polygon } from 'geojson'
import { APP_CONFIG, CATEGORY_META, CATEGORY_ORDER, CATEGORY_PRIORITY } from '../config'
import { classifyBuilding, classifyLanduse } from '../lib/classification'
import {
  boundaryFromBuildingCluster,
  clipLines,
  clipPolygon,
  fallbackBoundary,
  roadArea,
  safeArea,
  safeBuffer,
  safeDifference,
  safeLength,
  safeUnion,
  validateSettlementPolygon,
} from '../lib/geometry'
import type {
  AnalysisResult,
  BuildingMetrics,
  CategoryKey,
  CategoryResult,
  ConfidenceResult,
  OsmFeatureProperties,
  PolygonFeature,
  RawGeodata,
  SettlementResult,
} from '../types'

function insideBoundary<T extends Polygon | MultiPolygon>(feature: Feature<T>, boundary: PolygonFeature) {
  try { return booleanPointInPolygon(centerOfMass(feature), boundary) } catch { return false }
}

function bufferedBuildings(
  features: Feature<Polygon | MultiPolygon, OsmFeatureProperties>[],
  radiusM: number,
) {
  return safeUnion(features.map((feature) => safeBuffer(feature, radiusM)))
}

export function analysisRadiusForSettlement(settlement: Pick<SettlementResult, 'type'>) {
  if (settlement.type === 'city') return APP_CONFIG.overpass.cityRadiusM
  if (settlement.type === 'town') return APP_CONFIG.overpass.townRadiusM
  return APP_CONFIG.overpass.radiusM
}

function polygonValidationLimits(settlement: SettlementResult) {
  if (settlement.type !== 'city') return undefined
  return {
    maximumAreaKm2: APP_CONFIG.boundary.cityMaximumAreaKm2,
    maximumCentroidOffsetM: APP_CONFIG.boundary.cityMaximumCentroidOffsetM,
  }
}

function boundaryFromResidentialLanduse(settlement: SettlementResult, raw: RawGeodata) {
  const settlementCenter = point([settlement.lon, settlement.lat])
  const residential = raw.landuse.features.filter((feature) => classifyLanduse(feature) === 'residential')
  const selected = residential.filter((feature) => {
    try {
      return booleanPointInPolygon(settlementCenter, feature)
        || distance(centerOfMass(feature), settlementCenter, { units: 'meters' }) <= APP_CONFIG.boundary.landuseCenterPreferenceM
    } catch {
      return false
    }
  })

  // Grow from the central residential areas across short gaps caused by roads,
  // rivers or unmapped strips. This keeps connected city districts while
  // excluding detached villages that merely fall inside the data radius.
  const remaining = residential.filter((feature) => !selected.includes(feature))
  let expanded = true
  while (expanded && remaining.length) {
    expanded = false
    const envelope = safeUnion(selected)
    const bridge = envelope ? safeBuffer(envelope, APP_CONFIG.boundary.landuseBridgeDistanceM) : null
    if (!bridge) break
    for (let index = remaining.length - 1; index >= 0; index -= 1) {
      try {
        if (booleanIntersects(remaining[index], bridge)) {
          selected.push(remaining[index])
          remaining.splice(index, 1)
          expanded = true
        }
      } catch { /* ignore invalid source geometry */ }
    }
  }

  const envelope = safeUnion(selected)
  const buffered = envelope ? safeBuffer(envelope, APP_CONFIG.boundary.landuseBufferM) : null
  return validateSettlementPolygon(buffered?.geometry, settlement.lat, settlement.lon, polygonValidationLimits(settlement))
}

function chooseBoundary(settlement: SettlementResult, raw: RawGeodata, manual?: PolygonFeature) {
  if (manual) return { boundary: manual, method: 'open-polygon' as const, reason: 'Ръчно коригирана граница' }
  const openPolygon = validateSettlementPolygon(settlement.geojson, settlement.lat, settlement.lon, polygonValidationLimits(settlement))
  const landusePolygon = boundaryFromResidentialLanduse(settlement, raw)
  const clusterPolygon = boundaryFromBuildingCluster(raw.buildings, settlement.lat, settlement.lon)
  const minimumPlausibleAreaM2 = settlement.type === 'hamlet' || settlement.type === 'isolated_dwelling' ? 40_000 : 200_000

  if (openPolygon && safeArea(openPolygon) >= minimumPlausibleAreaM2) {
    const openArea = safeArea(openPolygon)
    const clusterArea = safeArea(clusterPolygon)
    const proportionate = clusterArea === 0 || (openArea >= clusterArea * 0.55 && openArea <= Math.max(clusterArea * 3.2, 3_000_000))
    if (proportionate) {
      return { boundary: openPolygon, method: 'open-polygon' as const, reason: 'Подходяща отворена геометрия на населеното място' }
    }
  }
  if (landusePolygon && safeArea(landusePolygon) >= minimumPlausibleAreaM2) {
    return { boundary: landusePolygon, method: 'open-polygon' as const, reason: 'Картографирана жилищна зона с контролиран периферен буфер' }
  }
  if (clusterPolygon && safeArea(clusterPolygon) >= minimumPlausibleAreaM2) {
    return { boundary: clusterPolygon, method: 'dominant-building-cluster' as const, reason: 'Граница от основния клъстер сгради с отстранени пространствени отклонения' }
  }
  return {
    boundary: fallbackBoundary(settlement.lat, settlement.lon),
    method: 'center-buffer' as const,
    reason: 'Резервна компактна зона поради недостатъчни или прекалено разредени данни за сгради',
  }
}

function buildingMetrics(
  buildings: Feature<Polygon | MultiPolygon, OsmFeatureProperties>[],
  analysisAreaM2: number,
): BuildingMetrics {
  const counts = { residential: 0, industrial: 0, other: 0, unknown: 0 }
  let footprintM2 = 0
  buildings.forEach((building) => {
    counts[classifyBuilding(building)] += 1
    footprintM2 += safeArea(building)
  })
  const total = buildings.length
  const areaHa = analysisAreaM2 / 10_000
  const classified = total - counts.unknown
  return {
    total,
    ...counts,
    footprintM2,
    builtUpPercent: analysisAreaM2 ? footprintM2 / analysisAreaM2 * 100 : 0,
    perHa: areaHa ? total / areaHa : 0,
    residentialPerHa: areaHa ? counts.residential / areaHa : 0,
    averageFootprintM2: total ? footprintM2 / total : 0,
    classifiedPercent: total ? classified / total * 100 : 0,
  }
}

function settlementProfile(categories: CategoryResult[], builtUpPercent: number) {
  const byKey = Object.fromEntries(categories.map((category) => [category.key, category.percent])) as Record<CategoryKey, number>
  if (byKey.agricultural >= APP_CONFIG.profiles.agriculturalDominantMin) return 'Преобладаващо земеделска структура'
  if (byKey.industrial >= APP_CONFIG.profiles.mixedIndustrialMin && byKey.residential >= 12) return 'Смесена жилищно-индустриална структура'
  if (builtUpPercent < APP_CONFIG.profiles.veryLowBuiltUpMax) return 'Много ниска плътност на застрояване'
  if (builtUpPercent < APP_CONFIG.profiles.lowBuiltUpMax) return 'Ниска плътност на застрояване'
  if (builtUpPercent < APP_CONFIG.profiles.mediumBuiltUpMax) return 'Средна плътност на застрояване'
  return 'Висока плътност на застрояване'
}

function confidence(
  metrics: BuildingMetrics,
  categories: CategoryResult[],
  rawExplicitAreaM2: number,
  analysisAreaM2: number,
  method: AnalysisResult['boundaryMethod'],
): ConfidenceResult {
  const otherPercent = categories.find((category) => category.key === 'other')?.percent ?? 100
  const explicitLandusePercent = analysisAreaM2 ? Math.min(100, rawExplicitAreaM2 / analysisAreaM2 * 100) : 0
  const unknownBuildingsPercent = metrics.total ? metrics.unknown / metrics.total * 100 : 100
  const buildingCoverageScore = metrics.total === 0 ? 0 : Math.min(35, 10 + Math.log10(metrics.total + 1) * 12)
  const landuseScore = Math.min(35, explicitLandusePercent * 0.42)
  const unknownScore = Math.max(0, 20 - unknownBuildingsPercent * 0.2)
  const boundaryScore = method === 'open-polygon' ? 10 : method === 'dominant-building-cluster' ? 8 : 2
  const score = Math.max(0, Math.min(100, buildingCoverageScore + landuseScore + unknownScore + boundaryScore - Math.max(0, otherPercent - 45) * 0.18))
  const level = score >= APP_CONFIG.confidence.highScoreMin ? 'Висока' : score >= APP_CONFIG.confidence.mediumScoreMin ? 'Средна' : 'Ниска'
  const reasons = [
    `Класифицирани сгради: ${metrics.classifiedPercent.toFixed(1)}%`,
    `Територия с изрично предназначение: ${explicitLandusePercent.toFixed(1)}%`,
    `Други / некласифицирани площи: ${otherPercent.toFixed(1)}%`,
    `Неопределени сгради: ${unknownBuildingsPercent.toFixed(1)}%`,
  ]
  return { level, score, reasons, explicitLandusePercent, otherPercent, unknownBuildingsPercent }
}

export function analyzeSettlement(
  settlement: SettlementResult,
  raw: RawGeodata,
  manualBoundary?: PolygonFeature,
): AnalysisResult {
  const warnings: string[] = []
  const boundaryChoice = chooseBoundary(settlement, raw, manualBoundary)
  const boundary = boundaryChoice.boundary
  const analysisAreaM2 = area(boundary)
  const analysisAreaHa = analysisAreaM2 / 10_000

  const buildings = raw.buildings.features.filter((feature) => insideBoundary(feature, boundary))
  const clippedRoads = clipLines(raw.roads, boundary)
  const pois = raw.pois.features.filter((feature) => {
    try { return booleanPointInPolygon(feature as Feature<Point>, boundary) } catch { return false }
  })

  if (buildings.length === 0) warnings.push('В зоната не са намерени картографирани сгради.')
  if (clippedRoads.features.length === 0) warnings.push('В зоната не е намерена картографирана улична мрежа.')

  const rawByCategory: Partial<Record<Exclude<CategoryKey, 'roads' | 'other'>, PolygonFeature | null>> = {}
  const explicitLanduse = raw.landuse.features.filter((feature) => insideBoundary(feature, boundary) || clipPolygon(feature, boundary))
  for (const key of ['water', 'industrial', 'residential', 'agricultural', 'green'] as const) {
    rawByCategory[key] = safeUnion(explicitLanduse.filter((feature) => classifyLanduse(feature) === key))
  }

  const residentialBuildings = buildings.filter((feature) => classifyBuilding(feature) === 'residential')
  const industrialBuildings = buildings.filter((feature) => classifyBuilding(feature) === 'industrial')
  rawByCategory.residential = safeUnion([
    rawByCategory.residential,
    bufferedBuildings(residentialBuildings, APP_CONFIG.residential.buildingBufferM),
  ])
  rawByCategory.industrial = safeUnion([
    rawByCategory.industrial,
    bufferedBuildings(industrialBuildings, APP_CONFIG.industrial.buildingBufferM),
  ])
  const roadsGeometry = roadArea(clippedRoads)

  const geometries: Partial<Record<CategoryKey, PolygonFeature | null>> = { roads: roadsGeometry }
  let occupied: PolygonFeature | null = null
  for (const key of CATEGORY_PRIORITY) {
    const rawGeometry = key === 'roads' ? roadsGeometry : rawByCategory[key]
    const clipped = clipPolygon(rawGeometry ?? null, boundary)
    const exclusive = safeDifference(clipped, occupied)
    geometries[key] = exclusive
    occupied = safeUnion([occupied, exclusive])
  }
  const calculatedOther = safeDifference(boundary, occupied)
  const explicitAreaM2 = CATEGORY_ORDER
    .filter((key) => key !== 'other')
    .reduce((total, key) => total + safeArea(geometries[key]), 0)
  const explicitScale = explicitAreaM2 > analysisAreaM2 && explicitAreaM2 > 0
    ? analysisAreaM2 / explicitAreaM2
    : 1
  const otherAreaM2 = Math.max(0, analysisAreaM2 - explicitAreaM2 * explicitScale)
  const calculatedOtherAreaM2 = safeArea(calculatedOther)
  // Turf can fail to subtract very complex city geometries and return the full
  // boundary. Do not draw that misleading fallback over every other layer.
  geometries.other = otherAreaM2 > 1 && calculatedOtherAreaM2 <= otherAreaM2 * 1.05
    ? calculatedOther
    : null

  const categories = CATEGORY_ORDER.map((key): CategoryResult => {
    const geometry = geometries[key] ?? null
    const areaM2 = key === 'other' ? otherAreaM2 : safeArea(geometry) * explicitScale
    return {
      key,
      ...CATEGORY_META[key],
      areaM2,
      areaHa: areaM2 / 10_000,
      percent: analysisAreaM2 ? areaM2 / analysisAreaM2 * 100 : 0,
      geometry,
    }
  })

  const metrics = buildingMetrics(buildings, analysisAreaM2)
  const roadLengthM = clippedRoads.features.reduce((total, road) => total + safeLength(road), 0)
  const roadMetrics = {
    lengthM: roadLengthM,
    lengthKm: roadLengthM / 1000,
    areaM2: categories.find((category) => category.key === 'roads')?.areaM2 ?? 0,
    densityKmPerKm2: analysisAreaM2 ? (roadLengthM / 1000) / (analysisAreaM2 / 1_000_000) : 0,
  }
  const explicitUnion = safeUnion(explicitLanduse.map((feature) => clipPolygon(feature, boundary)))
  const confidenceResult = confidence(metrics, categories, safeArea(explicitUnion), analysisAreaM2, boundaryChoice.method)

  if (confidenceResult.level === 'Ниска') warnings.push('Отворените данни за това населено място са непълни; резултатите са силно ориентировъчни.')

  return {
    settlement,
    boundary,
    boundaryMethod: boundaryChoice.method,
    boundaryReason: boundaryChoice.reason,
    categories,
    buildings: featureCollection(buildings),
    roads: clippedRoads,
    pois: featureCollection(pois),
    buildingMetrics: metrics,
    roadMetrics,
    analysisAreaM2,
    analysisAreaHa,
    analysisAreaKm2: analysisAreaM2 / 1_000_000,
    poiCount: pois.length,
    profile: settlementProfile(categories, metrics.builtUpPercent),
    confidence: confidenceResult,
    sourceEndpoint: raw.sourceEndpoint,
    createdAt: new Date().toISOString(),
    warnings,
  }
}
