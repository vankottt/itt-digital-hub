import { packRadiusForSettlement } from './analysis'
import { downloadPackGeodata } from './overpass'
import { packDownloadProgress } from '../lib/pack-progress'
import { saveLocalPack } from './pack-store'
import type { PackDownloadProgress, SettlementResult, StoredSettlementPack } from '../types'

export async function downloadAndStorePack(
  settlement: SettlementResult,
  onProgress: (progress: PackDownloadProgress) => void,
  signal?: AbortSignal,
): Promise<StoredSettlementPack> {
  if (!settlement.ekatte) throw new Error('Missing EKATTE')
  const radiusM = packRadiusForSettlement(settlement)
  const raw = await downloadPackGeodata(settlement.lat, settlement.lon, radiusM, onProgress, signal)
  onProgress(packDownloadProgress('save', 'start'))
  const pack: StoredSettlementPack = {
    ekatte: settlement.ekatte,
    name: settlement.name,
    municipality: settlement.municipality,
    region: settlement.region,
    type: settlement.type,
    lat: settlement.lat,
    lon: settlement.lon,
    radiusM,
    fetchedAt: raw.fetchedAt ?? new Date().toISOString(),
    sourceEndpoint: raw.sourceEndpoint,
    raw: { ...raw, source: 'pack' },
  }
  await saveLocalPack(pack)
  onProgress(packDownloadProgress('save', 'done'))
  return pack
}
