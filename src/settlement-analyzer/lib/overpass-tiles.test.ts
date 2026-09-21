import { describe, expect, it } from 'vitest'
import { coveringTiles, mergeOsmElements, osmElementKey, splitBbox } from './overpass-tiles'

describe('Overpass плочки', () => {
  it('покрива кръга с припокриващи се клетки', () => {
    const tiles = coveringTiles(42.43, 25.63, 6000, 2500)
    expect(tiles.length).toBeGreaterThan(8)
    expect(tiles.length).toBeLessThan(50)
    expect(tiles.every((tile) => tile.north > tile.south && tile.east > tile.west)).toBe(true)
  })

  it('разделя клетка на четири квадранта', () => {
    const parts = splitBbox({ south: 42, west: 25, north: 42.02, east: 25.02 })
    expect(parts).toHaveLength(4)
  })

  it('обединява OSM елементи по type/id', () => {
    const merged = mergeOsmElements([
      { elements: [{ type: 'way', id: 1 }, { type: 'way', id: 2 }] },
      { elements: [{ type: 'way', id: 2 }, { type: 'way', id: 3 }] },
    ])
    expect(merged.elements).toHaveLength(3)
    expect(osmElementKey({ type: 'way', id: 2 })).toBe('way/2')
  })
})
