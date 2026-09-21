import { booleanPointInPolygon, featureCollection, point, polygon } from '@turf/turf'
import { describe, expect, it } from 'vitest'
import { boundaryFromBuildingCluster, boundaryFromBuildingSample, boundaryFromConnectedBuildings, clipCollectionToBoundary, clusterBuildings, dataRadiusForBoundary, safeArea, safeDifference, safeIntersect, safeUnion } from './geometry'
import type { OsmFeatureProperties } from '../types'
import type { Feature, Polygon } from 'geojson'

function building(lon: number, lat: number): Feature<Polygon, OsmFeatureProperties> {
  const d = 0.00008
  return polygon([[[lon - d, lat - d], [lon + d, lat - d], [lon + d, lat + d], [lon - d, lat + d], [lon - d, lat - d]]], { tags: { building: 'house' } }) as Feature<Polygon, OsmFeatureProperties>
}

describe('автоматична граница', () => {
  it('избира dominant cluster и изключва отдалечена ферма', () => {
    const compact = Array.from({ length: 9 }, (_, index) => building(25 + (index % 3) * 0.001, 42 + Math.floor(index / 3) * 0.001))
    const outlier = building(25.03, 42.03)
    const collection = featureCollection([...compact, outlier])
    const cluster = clusterBuildings(collection, point([25.001, 42.001]))
    expect(cluster).toHaveLength(9)
    const boundary = boundaryFromBuildingCluster(collection, 42.001, 25.001)
    expect(boundary).not.toBeNull()
    expect(booleanPointInPolygon(point([25.03, 42.03]), boundary!)).toBe(false)
  })

  it('обединява близки значими квартали, но не и единичен outlier', () => {
    const west = Array.from({ length: 9 }, (_, index) => building(25 + (index % 3) * 0.001, 42 + Math.floor(index / 3) * 0.001))
    const east = Array.from({ length: 5 }, (_, index) => building(25.0062 + (index % 2) * 0.001, 42.0004 + Math.floor(index / 2) * 0.001))
    const outlier = building(25.025, 42.025)
    const cluster = clusterBuildings(featureCollection([...west, ...east, outlier]), point([25.001, 42.001]))
    expect(cluster).toHaveLength(14)
    expect(cluster.some(({ feature }) => feature === outlier)).toBe(false)
  })

  it('клъстерира много сгради за ограничено време', () => {
    const compact = Array.from({ length: 900 }, (_, index) => (
      building(25 + (index % 30) * 0.0004, 42 + Math.floor(index / 30) * 0.0004)
    ))
    const outlier = building(25.04, 42.04)
    const started = Date.now()
    const cluster = clusterBuildings(featureCollection([...compact, outlier]), point([25.006, 42.006]))
    expect(Date.now() - started).toBeLessThan(1500)
    expect(cluster.length).toBeGreaterThan(200)
    expect(cluster.some(({ feature }) => feature === outlier)).toBe(false)
  })

  it('обвивка от извадка покрива близките сгради и изключва далечен outlier', () => {
    const compact = Array.from({ length: 90 }, (_, index) => (
      building(25 + (index % 10) * 0.0012, 42 + Math.floor(index / 10) * 0.001)
    ))
    const outlier = building(25.08, 42.08)
    const boundary = boundaryFromBuildingSample(featureCollection([...compact, outlier]), 42.004, 25.005, 4200)
    expect(boundary).not.toBeNull()
    expect(booleanPointInPolygon(point([25.004, 42.004]), boundary!)).toBe(true)
    expect(booleanPointInPolygon(point([25.08, 42.08]), boundary!)).toBe(false)
    expect(safeArea(boundary!) / 10_000).toBeGreaterThan(40)
  })

  it('включва свързани квартали отвъд 4.2 km и оставя отделно село навън', () => {
    const connected = []
    for (let step = 0; step < 7; step += 1) {
      const originLon = 25 + step * 0.009
      for (let n = 0; n < 8; n += 1) {
        connected.push(building(originLon + (n % 3) * 0.0003, 42 + Math.floor(n / 3) * 0.0003))
      }
    }
    const village = Array.from({ length: 9 }, (_, n) => building(25.09 + (n % 3) * 0.0003, 42.04 + Math.floor(n / 3) * 0.0003))
    const boundary = boundaryFromConnectedBuildings(featureCollection([...connected, ...village]), 42.0004, 25.0004, 1100)
    expect(boundary).not.toBeNull()
    expect(booleanPointInPolygon(point([25.054, 42.0004]), boundary!)).toBe(true)
    expect(booleanPointInPolygon(point([25.09, 42.04]), boundary!)).toBe(false)
  })

  it('изрязва кадастъра по границата на анализа', () => {
    const boundary = polygon([[[25, 42], [25.01, 42], [25.01, 42.01], [25, 42.01], [25, 42]]]) as Feature<Polygon, Record<string, unknown>>
    const inside = polygon([[[25.002, 42.002], [25.004, 42.002], [25.004, 42.004], [25.002, 42.004], [25.002, 42.002]]])
    const outside = polygon([[[25.04, 42.04], [25.05, 42.04], [25.05, 42.05], [25.04, 42.05], [25.04, 42.04]]])
    const clipped = clipCollectionToBoundary(featureCollection([inside, outside]), boundary)
    expect(clipped?.features).toHaveLength(1)
  })

  it('изчислява достатъчен радиус за редактирана граница', () => {
    const edited = polygon([[[25, 42], [25.04, 42], [25.04, 42.03], [25, 42.03], [25, 42]]]) as Feature<Polygon, Record<string, unknown>>
    expect(dataRadiusForBoundary(edited, 42.015, 25.02)).toBeGreaterThan(2000)
  })
})

describe('геометрични операции', () => {
  const a = polygon([[[25, 42], [25.01, 42], [25.01, 42.01], [25, 42.01], [25, 42]]])
  const b = polygon([[[25.005, 42.005], [25.015, 42.005], [25.015, 42.015], [25.005, 42.015], [25.005, 42.005]]])

  it('изпълнява union, intersection и difference с валидна площ', () => {
    const merged = safeUnion([a, b])
    const overlap = safeIntersect(a, b)
    const remainder = safeDifference(a, b)
    expect(safeArea(merged)).toBeGreaterThan(safeArea(a))
    expect(safeArea(overlap)).toBeGreaterThan(0)
    expect(safeArea(remainder) + safeArea(overlap)).toBeCloseTo(safeArea(a), -1)
  })
})
