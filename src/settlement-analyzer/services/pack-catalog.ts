import type { PackCatalogItem, StoredSettlementPack } from '../types'
import { listLocalPacks } from './pack-store'

interface ShippedManifest {
  packs?: Array<{
    ekatte: string
    name: string
    municipality: string
    region: string
    type: string
    lat: number
    lon: number
    radiusM: number
    fetchedAt: string
  }>
}

function asCatalogItem(row: StoredSettlementPack, origin: PackCatalogItem['origin']): PackCatalogItem {
  return {
    ekatte: row.ekatte,
    name: row.name,
    municipality: row.municipality,
    region: row.region,
    type: row.type,
    lat: row.lat,
    lon: row.lon,
    radiusM: row.radiusM,
    fetchedAt: row.fetchedAt,
    origin,
  }
}

export async function loadShippedPackCatalog(): Promise<PackCatalogItem[]> {
  try {
    const response = await fetch('/settlement-packs/manifest.json', { signal: AbortSignal.timeout(5000) })
    if (!response.ok) return []
    const payload = await response.json() as ShippedManifest
    return (payload.packs ?? []).map((item) => ({ ...item, origin: 'shipped' as const }))
  } catch {
    return []
  }
}

export async function loadPackCatalog(): Promise<PackCatalogItem[]> {
  const shipped = await loadShippedPackCatalog()
  const local = await Promise.race([
    listLocalPacks().catch(() => [] as StoredSettlementPack[]),
    new Promise<StoredSettlementPack[]>((resolve) => setTimeout(() => resolve([]), 800)),
  ]).catch(() => [] as StoredSettlementPack[])
  const byEkatte = new Map<string, PackCatalogItem>()
  for (const item of shipped) byEkatte.set(item.ekatte, item)
  for (const pack of local) byEkatte.set(pack.ekatte, asCatalogItem(pack, 'local'))
  return [...byEkatte.values()].sort((a, b) => a.name.localeCompare(b.name, 'bg'))
}

export function catalogHas(catalog: PackCatalogItem[], ekatte?: string) {
  return Boolean(ekatte && catalog.some((item) => item.ekatte === ekatte))
}
