import { APP_CONFIG } from '../config'
import type { SettlementResult } from '../types'
import type { Locale } from '@/lib/i18n'
import registryJson from '../data/settlements.json'

export interface NominatimItem {
  geojson?: GeoJSON.Geometry
  category?: string
  type?: string
  addresstype?: string
}

const PLACE_ADDRESS_TYPES = new Set(['city', 'town', 'village', 'hamlet', 'suburb', 'neighbourhood', 'municipality'])
const SKIP_ADDRESS_TYPES = new Set(['state', 'state_district', 'region', 'country', 'county'])

export function pickNominatimPlacePolygon(items: NominatimItem[]): GeoJSON.Geometry | undefined {
  const polygons = items.filter((item) => {
    const geometry = item.geojson
    if (geometry?.type !== 'Polygon' && geometry?.type !== 'MultiPolygon') return false
    if (SKIP_ADDRESS_TYPES.has(item.addresstype ?? '')) return false
    return item.category === 'place' || PLACE_ADDRESS_TYPES.has(item.addresstype ?? '')
  })
  polygons.sort((a, b) => {
    const rank = (item: NominatimItem) => {
      if (item.category === 'place') return 3
      if (item.addresstype === 'city' || item.addresstype === 'town' || item.addresstype === 'village') return 2
      return 1
    }
    return rank(b) - rank(a)
  })
  return polygons[0]?.geojson
}

export async function attachOpenPolygon(settlement: SettlementResult): Promise<GeoJSON.Geometry | undefined> {
  try {
    const query = `${settlement.name}, ${settlement.municipality}, България`
    const response = await fetch(`/api/settlement-analyzer/search?q=${encodeURIComponent(query)}&limit=5&lang=bg`, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return undefined
    const payload = await response.json() as unknown
    const items = Array.isArray(payload) ? payload as NominatimItem[] : []
    return pickNominatimPlacePolygon(items)
  } catch {
    return undefined
  }
}

export interface SettlementRegistryRow {
  ekatte: string
  name: string
  nameLat: string
  prefix: string
  type: 'city' | 'town' | 'village' | 'hamlet'
  municipality: string
  region: string
  lat: number
  lon: number
}

const registry = registryJson as SettlementRegistryRow[]
const TYPE_RANK: Record<SettlementRegistryRow['type'], number> = {
  city: 0,
  town: 1,
  village: 2,
  hamlet: 3,
}

export function toSettlement(row: SettlementRegistryRow): SettlementResult {
  return {
    placeId: Number(row.ekatte),
    osmType: 'node',
    osmId: 0,
    lat: row.lat,
    lon: row.lon,
    displayName: `${row.prefix} ${row.name}, общ. ${row.municipality}, обл. ${row.region}`,
    name: row.name,
    municipality: row.municipality,
    region: row.region,
    country: 'България',
    category: 'place',
    type: row.type,
    boundingBox: [row.lat - 0.05, row.lat + 0.05, row.lon - 0.05, row.lon + 0.05],
    geojson: undefined,
    ekatte: row.ekatte,
  }
}

function rankRows(a: SettlementRegistryRow, b: SettlementRegistryRow) {
  const typeDiff = TYPE_RANK[a.type] - TYPE_RANK[b.type]
  if (typeDiff !== 0) return typeDiff
  return a.name.localeCompare(b.name, 'bg')
}

export async function searchSettlements(query: string, signal?: AbortSignal, locale: Locale = 'bg'): Promise<SettlementResult[]> {
  void signal
  void locale
  const normalized = query.trim().toLocaleLowerCase('bg-BG')
  if (normalized.length < APP_CONFIG.search.minQueryLength) return []

  const starts: SettlementRegistryRow[] = []
  const includes: SettlementRegistryRow[] = []
  for (const row of registry) {
    const name = row.name.toLocaleLowerCase('bg-BG')
    const nameLat = row.nameLat.toLocaleLowerCase('en-US')
    const isStart = name.startsWith(normalized) || nameLat.startsWith(normalized)
    if (isStart) starts.push(row)
    else if (name.includes(normalized) || nameLat.includes(normalized)) includes.push(row)
  }

  starts.sort(rankRows)
  includes.sort(rankRows)
  return [...starts, ...includes].slice(0, APP_CONFIG.search.limit).map(toSettlement)
}

export function settlementByEkatte(ekatte: string): SettlementResult | undefined {
  const row = registry.find((item) => item.ekatte === ekatte)
  return row ? toSettlement(row) : undefined
}

export function clearSettlementCache() {
  try {
    Object.keys(localStorage).filter((key) => key.startsWith('settlement-search:')).forEach((key) => localStorage.removeItem(key))
  } catch {
    // localStorage is optional
  }
}

export class SettlementSearchError extends Error {
  constructor(readonly code: 'rate_limited' | 'unavailable') {
    super(code)
    this.name = 'SettlementSearchError'
  }
}
