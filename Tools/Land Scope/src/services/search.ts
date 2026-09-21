import { APP_CONFIG } from '../config'
import type { SettlementResult } from '../types'

interface NominatimItem {
  place_id: number
  osm_type: 'node' | 'way' | 'relation'
  osm_id: number
  lat: string
  lon: string
  display_name: string
  category: string
  type: string
  boundingbox: [string, string, string, string]
  geojson?: GeoJSON.Geometry
  address?: Record<string, string>
  name?: string
}

interface CacheEntry<T> { value: T; createdAt: number }
let lastRequestAt = 0

function readCache<T>(key: string, ttl: number): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() - entry.createdAt > ttl) return null
    return entry.value
  } catch {
    return null
  }
}

function writeCache<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, createdAt: Date.now() }))
  } catch {
    // Storage is an optional optimization.
  }
}

function settlementName(item: NominatimItem) {
  const address = item.address ?? {}
  return item.name || address.village || address.town || address.city || address.hamlet || item.display_name.split(',')[0]
}

function normalize(item: NominatimItem): SettlementResult {
  const address = item.address ?? {}
  return {
    placeId: item.place_id,
    osmType: item.osm_type,
    osmId: item.osm_id,
    lat: Number(item.lat),
    lon: Number(item.lon),
    displayName: item.display_name,
    name: settlementName(item),
    municipality: address.municipality || address.county || '',
    region: address.state || address.county || '',
    country: address.country || 'България',
    category: item.category,
    type: item.type,
    boundingBox: item.boundingbox.map(Number) as [number, number, number, number],
    geojson: item.geojson,
  }
}

export async function searchSettlements(query: string, signal?: AbortSignal): Promise<SettlementResult[]> {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < APP_CONFIG.search.minQueryLength) return []
  const cacheKey = `settlement-search:v2:${normalizedQuery.toLocaleLowerCase('bg-BG')}`
  const cached = readCache<SettlementResult[]>(cacheKey, APP_CONFIG.search.cacheTtlMs)
  if (cached) return cached

  const waitMs = APP_CONFIG.search.minRequestIntervalMs - (Date.now() - lastRequestAt)
  if (waitMs > 0) await new Promise((resolve) => window.setTimeout(resolve, waitMs))
  lastRequestAt = Date.now()

  const params = new URLSearchParams({
    q: normalizedQuery,
    format: 'jsonv2',
    countrycodes: 'bg',
    addressdetails: '1',
    polygon_geojson: '1',
    limit: String(APP_CONFIG.search.limit),
    dedupe: '1',
    'accept-language': 'bg',
  })
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    signal,
    headers: { Accept: 'application/json', 'Accept-Language': 'bg-BG,bg;q=0.9' },
  })
  if (response.status === 429) throw new Error('Услугата за търсене е временно натоварена. Изчакайте малко и опитайте отново.')
  if (!response.ok) throw new Error('Търсенето временно не е достъпно. Опитайте отново.')

  const allowedTypes = new Set(['village', 'hamlet', 'town', 'municipality', 'isolated_dwelling'])
  const items = (await response.json()) as NominatimItem[]
  const results = items
    .filter((item) => {
      const address = item.address ?? {}
      const hasSettlementAddress = Boolean(address.village || address.town || address.city || address.hamlet || address.isolated_dwelling)
      return item.category === 'place' || allowedTypes.has(item.type) || (item.category === 'boundary' && item.type === 'administrative' && hasSettlementAddress)
    })
    .map(normalize)
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon))
  writeCache(cacheKey, results)
  return results
}

export function clearSettlementCache() {
  Object.keys(localStorage).filter((key) => key.startsWith('settlement-search:')).forEach((key) => localStorage.removeItem(key))
}
