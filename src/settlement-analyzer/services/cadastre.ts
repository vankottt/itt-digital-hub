import type { FeatureCollection } from 'geojson'

const LAYER_URL = 'https://spp.api.bg/arcgis/rest/services/Public/CadBaseMap/MapServer/2/query'
const PAGE_SIZE = 2000
const MAX_FEATURES = 6000
const OVERALL_TIMEOUT_MS = 20_000

function combinedSignal(signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(OVERALL_TIMEOUT_MS)
  if (!signal) return timeout
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([signal, timeout])
  return timeout
}

// Public cadastre layer 2 is a sample (verified: ~26 parcels per km² in Lovech centre).
// Visual comparison only — never feed these geometries into analysis numbers.
export async function fetchUrbanizedParcels(ekatte: string, signal?: AbortSignal): Promise<FeatureCollection | null> {
  const code = ekatte.trim()
  if (!/^\d+$/.test(code)) return null
  try {
    const combined = combinedSignal(signal)
    const features: FeatureCollection['features'] = []
    let offset = 0
    let exceeded = true
    while (exceeded && features.length < MAX_FEATURES) {
      const url = new URL(LAYER_URL)
      url.searchParams.set('where', `ekatte='${code}' AND nterrtype='1'`)
      url.searchParams.set('outFields', 'id,nusetype')
      url.searchParams.set('outSR', '4326')
      url.searchParams.set('f', 'geojson')
      url.searchParams.set('resultRecordCount', String(PAGE_SIZE))
      url.searchParams.set('resultOffset', String(offset))
      const response = await fetch(url, { signal: combined, headers: { Accept: 'application/json' } })
      if (!response.ok) return null
      const payload = await response.json() as { features?: FeatureCollection['features']; exceededTransferLimit?: boolean }
      const page = payload.features ?? []
      features.push(...page)
      exceeded = payload.exceededTransferLimit === true && page.length > 0
      offset += PAGE_SIZE
      if (page.length < PAGE_SIZE) break
    }
    return { type: 'FeatureCollection', features: features.slice(0, MAX_FEATURES) }
  } catch {
    return null
  }
}
