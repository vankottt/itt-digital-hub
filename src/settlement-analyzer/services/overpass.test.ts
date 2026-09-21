import { afterEach, describe, expect, it, vi } from 'vitest'
import { featureCollection } from '@turf/turf'
import { downloadPackGeodata, fetchSettlementGeodata } from './overpass'
import { clearLocalPackMemory, saveLocalPack } from './pack-store'
import type { PackDownloadProgress } from '../types'

const empty = featureCollection([])

describe('fetchSettlementGeodata packs', () => {
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.sessionStorage

  afterEach(() => {
    globalThis.fetch = originalFetch
    globalThis.sessionStorage = originalStorage
    clearLocalPackMemory()
  })

  it('зарежда локален пакет преди файлов и Overpass', async () => {
    globalThis.sessionStorage = {
      getItem: () => null,
      setItem() {},
      removeItem() {},
      clear() {},
      key: () => null,
      length: 0,
    } as unknown as Storage
    await saveLocalPack({
      ekatte: '43952',
      name: 'Ловеч',
      municipality: 'Ловеч',
      region: 'Ловеч',
      type: 'city',
      lat: 43.137,
      lon: 24.714,
      radiusM: 6000,
      fetchedAt: '2026-02-02T00:00:00.000Z',
      sourceEndpoint: 'local',
      raw: {
        buildings: empty,
        roads: empty,
        landuse: empty,
        pois: empty,
        sourceEndpoint: 'local',
        source: 'pack',
      },
    })
    const fetchMock = vi.fn(async () => {
      throw new Error('network should not be used')
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const result = await fetchSettlementGeodata(43.137, 24.714, undefined, 6000, undefined, '43952')
    expect(result.source).toBe('pack')
    expect(result.fetchedAt).toBe('2026-02-02T00:00:00.000Z')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('зарежда файлов пакет преди Overpass', async () => {
    globalThis.sessionStorage = {
      getItem: () => null,
      setItem() {},
      removeItem() {},
      clear() {},
      key: () => null,
      length: 0,
    } as unknown as Storage
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/settlement-packs/43952.json')) {
        return new Response(JSON.stringify({
          ekatte: '43952',
          radiusM: 6000,
          fetchedAt: '2026-01-01T00:00:00.000Z',
          raw: {
            buildings: empty,
            roads: empty,
            landuse: empty,
            pois: empty,
            sourceEndpoint: 'pack',
          },
        }), { status: 200 })
      }
      throw new Error(`unexpected fetch ${url}`)
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await fetchSettlementGeodata(43.137, 24.714, undefined, 6000, undefined, '43952')
    expect(result.source).toBe('pack')
    expect(result.fetchedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('при над 20 000 елемента сваля частта на плочки и ги обединява', async () => {
    globalThis.sessionStorage = {
      getItem: () => null,
      setItem() {},
      removeItem() {},
      clear() {},
      key: () => null,
      length: 0,
    } as unknown as Storage
    let nextId = 1
    globalThis.fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const rawBody = init?.body
      const query = rawBody instanceof URLSearchParams
        ? rawBody.get('data') ?? ''
        : decodeURIComponent(String(rawBody ?? '').replace(/^data=/, '').replace(/\+/g, ' '))
      if (query.includes('around:')) {
        const elements = Array.from({ length: 20_001 }, (_, index) => ({ type: 'way', id: index + 1 }))
        return new Response(JSON.stringify({ elements }), { status: 200 })
      }
      const id = nextId
      nextId += 1
      const lat = 42.42
      const lon = 25.63
      return new Response(JSON.stringify({
        elements: [{
          type: 'way',
          id,
          geometry: [
            { lat, lon },
            { lat: lat + 0.0002, lon },
            { lat: lat + 0.0002, lon: lon + 0.0002 },
            { lat, lon: lon + 0.0002 },
            { lat, lon },
          ],
          tags: { building: 'yes' },
        }],
      }), { status: 200 })
    }) as unknown as typeof fetch

    const result = await fetchSettlementGeodata(42.42, 25.63, undefined, 2800)
    expect(result.buildings.features.length).toBeGreaterThan(0)
    expect(result.queryRadiusM).toBe(2800)
  })
})

describe('downloadPackGeodata', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('не връща резултат, ако задължителна част остане неуспешна', async () => {
    globalThis.fetch = vi.fn(async () => new Response('no', { status: 429 })) as unknown as typeof fetch
    const ticks: PackDownloadProgress[] = []
    await expect(downloadPackGeodata(
      42.42,
      25.63,
      6000,
      (progress) => ticks.push(progress),
      AbortSignal.timeout(120),
    )).rejects.toThrow()
    expect(ticks.some((tick) => tick.part === 'landuse')).toBe(true)
    expect(ticks.some((tick) => tick.part === 'save')).toBe(false)
  })
})
