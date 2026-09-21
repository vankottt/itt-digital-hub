import type { CategoryKey } from './types'

export const APP_CONFIG = {
  search: {
    debounceMs: 700,
    minQueryLength: 3,
    minRequestIntervalMs: 1100,
    cacheTtlMs: 24 * 60 * 60 * 1000,
    limit: 7,
  },
  overpass: {
    radiusM: 2800,
    townRadiusM: 4400,
    cityRadiusM: 6000,
    editedBoundaryPaddingM: 350,
    maximumEditedRadiusM: 8000,
    timeoutSeconds: 70,
    cacheTtlMs: 6 * 60 * 60 * 1000,
    endpoints: [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
    ],
  },
  boundary: {
    clusterDistanceM: 260,
    clusterBridgeDistanceM: 560,
    minimumClusterSize: 6,
    secondaryClusterMinSize: 4,
    secondaryClusterMinRatio: 0.06,
    buildingBufferM: 115,
    landuseBufferM: 120,
    landuseBridgeDistanceM: 450,
    landuseCenterPreferenceM: 1800,
    centerPreferenceM: 1800,
    maximumAreaKm2: 40,
    minimumAreaKm2: 0.025,
    maximumCentroidOffsetM: 2600,
    cityMaximumAreaKm2: 85,
    cityMaximumCentroidOffsetM: 6500,
    simplifyTolerance: 0.00008,
    fallbackRadiusM: 650,
  },
  residential: { buildingBufferM: 24 },
  industrial: { buildingBufferM: 32 },
  roads: {
    defaultWidthM: {
      motorway: 18,
      trunk: 14,
      primary: 11,
      secondary: 9,
      tertiary: 7,
      unclassified: 5.5,
      residential: 5,
      living_street: 4,
      service: 3.5,
    } as Record<string, number>,
  },
  profiles: {
    veryLowBuiltUpMax: 4,
    lowBuiltUpMax: 9,
    mediumBuiltUpMax: 17,
    agriculturalDominantMin: 38,
    mixedIndustrialMin: 16,
  },
  confidence: {
    highScoreMin: 72,
    mediumScoreMin: 43,
  },
} as const

export const CATEGORY_META: Record<CategoryKey, { label: string; color: string }> = {
  residential: { label: 'Жилищни площи', color: '#df7048' },
  industrial: { label: 'Индустриални / търговски площи', color: '#8d73ad' },
  roads: { label: 'Улици / транспорт', color: '#777b7d' },
  green: { label: 'Зелени площи', color: '#5d9861' },
  water: { label: 'Водни площи', color: '#4b9bd0' },
  agricultural: { label: 'Земеделски площи', color: '#e3b43e' },
  other: { label: 'Други', color: '#d7d8d4' },
}

export const CATEGORY_ORDER: CategoryKey[] = [
  'residential',
  'industrial',
  'roads',
  'green',
  'water',
  'agricultural',
  'other',
]

export const CATEGORY_PRIORITY: Exclude<CategoryKey, 'other'>[] = [
  'water',
  'roads',
  'industrial',
  'residential',
  'agricultural',
  'green',
]

export const STAGE_LABELS = {
  idle: '',
  boundary: 'Определяне на границата...',
  buildings: 'Зареждане на сградите...',
  roads: 'Зареждане на уличната мрежа...',
  landuse: 'Анализ на предназначението на територията...',
  geometry: 'Обработка на площите...',
  metrics: 'Изчисляване на показателите...',
  map: 'Подготовка на картата...',
  complete: 'Анализът е завършен.',
} as const
