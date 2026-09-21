import type { Feature, FeatureCollection, Geometry, LineString, MultiLineString, MultiPolygon, Point, Polygon } from 'geojson'

export type PolygonFeature = Feature<Polygon | MultiPolygon, Record<string, unknown>>
export type LineFeature = Feature<LineString | MultiLineString, Record<string, unknown>>
export type PointFeature = Feature<Point, Record<string, unknown>>

export type CategoryKey = 'water' | 'roads' | 'industrial' | 'residential' | 'agricultural' | 'green' | 'other'

export interface SettlementResult {
  placeId: number
  osmType: 'node' | 'way' | 'relation'
  osmId: number
  lat: number
  lon: number
  displayName: string
  name: string
  municipality: string
  region: string
  country: string
  category: string
  type: string
  boundingBox: [number, number, number, number]
  geojson?: Geometry
}

export interface OsmFeatureProperties {
  id?: string
  type?: string
  tags?: Record<string, string>
  [key: string]: unknown
}

export interface RawGeodata {
  all: FeatureCollection<Geometry, OsmFeatureProperties>
  buildings: FeatureCollection<Polygon | MultiPolygon, OsmFeatureProperties>
  roads: FeatureCollection<LineString | MultiLineString, OsmFeatureProperties>
  landuse: FeatureCollection<Polygon | MultiPolygon, OsmFeatureProperties>
  pois: FeatureCollection<Point, OsmFeatureProperties>
  sourceEndpoint: string
}

export interface CategoryResult {
  key: CategoryKey
  label: string
  color: string
  areaM2: number
  areaHa: number
  percent: number
  geometry: PolygonFeature | null
}

export interface BuildingMetrics {
  total: number
  residential: number
  industrial: number
  other: number
  unknown: number
  footprintM2: number
  builtUpPercent: number
  perHa: number
  residentialPerHa: number
  averageFootprintM2: number
  classifiedPercent: number
}

export interface RoadMetrics {
  lengthM: number
  lengthKm: number
  areaM2: number
  densityKmPerKm2: number
}

export interface ConfidenceResult {
  level: 'Висока' | 'Средна' | 'Ниска'
  score: number
  reasons: string[]
  explicitLandusePercent: number
  otherPercent: number
  unknownBuildingsPercent: number
}

export interface AnalysisResult {
  settlement: SettlementResult
  boundary: PolygonFeature
  boundaryMethod: 'open-polygon' | 'dominant-building-cluster' | 'center-buffer'
  boundaryReason: string
  categories: CategoryResult[]
  buildings: FeatureCollection<Polygon | MultiPolygon, OsmFeatureProperties>
  roads: FeatureCollection<LineString | MultiLineString, OsmFeatureProperties>
  pois: FeatureCollection<Point, OsmFeatureProperties>
  buildingMetrics: BuildingMetrics
  roadMetrics: RoadMetrics
  analysisAreaM2: number
  analysisAreaHa: number
  analysisAreaKm2: number
  poiCount: number
  profile: string
  confidence: ConfidenceResult
  sourceEndpoint: string
  createdAt: string
  warnings: string[]
}

export type AnalysisStage =
  | 'idle'
  | 'boundary'
  | 'buildings'
  | 'roads'
  | 'landuse'
  | 'geometry'
  | 'metrics'
  | 'map'
  | 'complete'

