import { booleanPointInPolygon, featureCollection, point, polygon } from '@turf/turf'
import { describe, expect, it } from 'vitest'
import { boundaryFromBuildingCluster, clusterBuildings, dataRadiusForBoundary, safeArea, safeDifference, safeIntersect, safeUnion } from './geometry'
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
