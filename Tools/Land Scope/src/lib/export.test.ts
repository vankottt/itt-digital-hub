import { featureCollection, polygon } from '@turf/turf'
import { describe, expect, it } from 'vitest'
import { analyzeSettlement } from '../services/analysis'
import type { PolygonFeature, RawGeodata, SettlementResult } from '../types'
import { analysisToCsv, analysisToGeoJson } from './export'

const boundary = polygon([[[25, 42], [25.01, 42], [25.01, 42.01], [25, 42.01], [25, 42]]]) as PolygonFeature
const settlement: SettlementResult = { placeId: 1, osmType: 'node', osmId: 1, lat: 42.005, lon: 25.005, displayName: 'Тестово', name: 'Тестово', municipality: '', region: '', country: 'България', category: 'place', type: 'village', boundingBox: [42, 42.01, 25, 25.01] }
const raw: RawGeodata = { all: featureCollection([]), buildings: featureCollection([]), roads: featureCollection([]), landuse: featureCollection([]), pois: featureCollection([]), sourceEndpoint: 'test' }

describe('експорт', () => {
  const result = analyzeSettlement(settlement, raw, boundary)

  it('създава CSV с изисканите machine-friendly колони', () => {
    const csv = analysisToCsv(result)
    expect(csv).toContain('settlement_name')
    expect(csv).toContain('residential_percent')
    expect(csv).toContain('data_confidence')
    expect(csv).toContain('Тестово')
  })

  it('създава валиден GeoJSON FeatureCollection с граница и категории', () => {
    const geojson = analysisToGeoJson(result)
    expect(geojson.type).toBe('FeatureCollection')
    expect(geojson.features.some((feature) => feature.properties?.layer === 'analysis_boundary')).toBe(true)
    expect(geojson.features.some((feature) => feature.properties?.layer === 'other')).toBe(true)
  })
})
