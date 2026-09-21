import { afterEach, describe, expect, it, vi } from 'vitest'
import { featureCollection } from '@turf/turf'
import { catalogHas, loadPackCatalog } from './pack-catalog'
import { clearLocalPackMemory, saveLocalPack } from './pack-store'
import type { StoredSettlementPack } from '../types'

const empty = featureCollection([])

function pack(ekatte: string, name: string): StoredSettlementPack {
  return {
    ekatte,
    name,
    municipality: name,
    region: name,
    type: 'city',
    lat: 42,
    lon: 25,
    radiusM: 6000,
    fetchedAt: '2026-01-01T00:00:00.000Z',
    sourceEndpoint: 'https://example.test',
    raw: {
      buildings: empty,
      roads: empty,
      landuse: empty,
      pois: empty,
      sourceEndpoint: 'https://example.test',
      source: 'pack',
    },
  }
}

describe('pack catalog', () => {
  afterEach(() => {
    clearLocalPackMemory()
    vi.unstubAllGlobals()
  })

  it('слива локален пакет върху shipped манифеста и не записва непълен пакет', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      packs: [{
        ekatte: '43952',
        name: 'Ловеч',
        municipality: 'Ловеч',
        region: 'Ловеч',
        type: 'city',
        lat: 43.13,
        lon: 24.71,
        radiusM: 6000,
        fetchedAt: '2026-01-01T00:00:00.000Z',
      }],
    }), { status: 200 })))

    await saveLocalPack(pack('68850', 'Стара Загора'))
    await expect(saveLocalPack({
      ...pack('00000', 'Празен'),
      raw: { ...pack('00000', 'Празен').raw, buildings: undefined as never },
    })).rejects.toThrow('Incomplete pack')

    const catalog = await loadPackCatalog()
    expect(catalogHas(catalog, '43952')).toBe(true)
    expect(catalogHas(catalog, '68850')).toBe(true)
    expect(catalog.find((item) => item.ekatte === '68850')?.origin).toBe('local')
  })
})
