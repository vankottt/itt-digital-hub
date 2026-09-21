import { describe, expect, it } from 'vitest'
import { APP_CONFIG } from '../config'
import { pickNominatimPlacePolygon, searchSettlements } from './search'

describe('searchSettlements', () => {
  it('връща Ловеч първи за „Лов“', async () => {
    const results = await searchSettlements('Лов')
    expect(results[0]?.ekatte).toBe('43952')
    expect(results[0]?.name).toBe('Ловеч')
  })

  it('подрежда град Троян преди село Троян', async () => {
    const results = await searchSettlements('троян')
    const troyans = results.filter((item) => item.name.toLocaleLowerCase('bg-BG') === 'троян')
    expect(troyans.length).toBeGreaterThanOrEqual(2)
    expect(['city', 'town']).toContain(troyans[0]?.type)
    expect(troyans.some((item) => item.type === 'village')).toBe(true)
  })

  it('намира Ловеч по латинско име', async () => {
    const results = await searchSettlements('lovech')
    expect(results.some((item) => item.ekatte === '43952')).toBe(true)
  })

  it('не надхвърля лимита за търсене', async () => {
    const results = await searchSettlements('с')
    expect(results.length).toBeLessThanOrEqual(APP_CONFIG.search.limit)
  })
})

const placePolygon = {
  type: 'Polygon' as const,
  coordinates: [[[25.5, 43.1], [25.6, 43.1], [25.6, 43.2], [25.5, 43.2], [25.5, 43.1]]],
}
const oblastPolygon = {
  type: 'Polygon' as const,
  coordinates: [[[24, 42], [27, 42], [27, 44], [24, 44], [24, 42]]],
}

describe('pickNominatimPlacePolygon', () => {
  it('пропуска точка и полигон на област, когато няма геометрия на населеното място', () => {
    expect(pickNominatimPlacePolygon([
      { addresstype: 'city', category: 'place', type: 'city', geojson: { type: 'Point', coordinates: [24.72, 43.13] } },
      { addresstype: 'state', category: 'boundary', type: 'administrative', geojson: oblastPolygon },
    ])).toBeUndefined()
  })

  it('взима полигона на населеното място, а не областта', () => {
    const picked = pickNominatimPlacePolygon([
      { addresstype: 'city', category: 'place', type: 'city', geojson: { type: 'Point', coordinates: [24.72, 43.13] } },
      { addresstype: 'state', category: 'boundary', type: 'administrative', geojson: oblastPolygon },
      { addresstype: 'city', category: 'place', type: 'city', geojson: placePolygon },
    ])
    expect(picked).toEqual(placePolygon)
  })
})
