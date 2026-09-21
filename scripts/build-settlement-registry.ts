import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const LAYER_URL = 'https://spp.api.bg/arcgis/rest/services/Public/CadBaseMap/MapServer/0/query'
const PAGE_SIZE = 2000
const EXPECTED_TOTAL = 5256
const OUT_FILE = path.resolve('src/settlement-analyzer/data/settlements.json')

const PREFIX: Record<number, string> = {
  1: 'гр.',
  2: 'с.',
  3: 'ман.',
  4: 'мах.',
  5: 'кв.',
  6: 'к.',
  7: 'к.к.',
  8: 'в.с.',
  9: 'лет.',
  10: 'сел. обр.',
  11: 'кол.',
}

interface CadastreFeature {
  geometry?: { type?: string; coordinates?: [number, number] }
  properties?: {
    EKATTE?: string | number
    Name?: string
    NameLat?: string
    PrefixType?: string | number
    SizeType?: string | number
    MunName?: string
    RegionName?: string
  }
}

interface RegistryRow {
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

function settlementType(prefixType: number, sizeType: number): RegistryRow['type'] {
  if (prefixType === 3 || prefixType === 4 || prefixType === 11) return 'hamlet'
  if (sizeType >= 1 && sizeType <= 3) return 'city'
  if (sizeType >= 4 && sizeType <= 6) return 'town'
  return 'village'
}

function round6(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000
}

async function fetchPage(offset: number): Promise<CadastreFeature[]> {
  const url = new URL(LAYER_URL)
  url.searchParams.set('where', '1=1')
  url.searchParams.set('outFields', 'EKATTE,Name,NameLat,PrefixType,SettlementType,SizeType,MunName,RegionName')
  url.searchParams.set('outSR', '4326')
  url.searchParams.set('f', 'geojson')
  url.searchParams.set('resultRecordCount', String(PAGE_SIZE))
  url.searchParams.set('resultOffset', String(offset))
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Cadastre layer 0 failed: ${response.status} at offset ${offset}`)
  const payload = await response.json() as { features?: CadastreFeature[] }
  return payload.features ?? []
}

function toRow(feature: CadastreFeature): RegistryRow | null {
  const properties = feature.properties ?? {}
  const coordinates = feature.geometry?.coordinates
  if (!coordinates || coordinates.length < 2) return null
  const [lon, lat] = coordinates
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null
  const ekatte = String(properties.EKATTE ?? '').trim()
  const name = String(properties.Name ?? '').trim()
  if (!ekatte || !name) return null
  const prefixType = Number(properties.PrefixType)
  const sizeType = Number(properties.SizeType)
  return {
    ekatte,
    name,
    nameLat: String(properties.NameLat ?? '').trim(),
    prefix: PREFIX[prefixType] ?? '',
    type: settlementType(prefixType, sizeType),
    municipality: String(properties.MunName ?? '').trim(),
    region: String(properties.RegionName ?? '').trim(),
    lat: round6(lat),
    lon: round6(lon),
  }
}

async function main() {
  const rows: RegistryRow[] = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const features = await fetchPage(offset)
    rows.push(...features.map(toRow).filter((row): row is RegistryRow => row !== null))
    console.log(`Fetched ${features.length} features at offset ${offset}; total rows ${rows.length}`)
    if (features.length < PAGE_SIZE) break
  }
  if (rows.length !== EXPECTED_TOTAL) {
    throw new Error(`Expected ${EXPECTED_TOTAL} settlements, got ${rows.length}`)
  }
  rows.sort((a, b) => a.name.localeCompare(b.name, 'bg') || a.municipality.localeCompare(b.municipality, 'bg'))
  await mkdir(path.dirname(OUT_FILE), { recursive: true })
  await writeFile(OUT_FILE, `${JSON.stringify(rows)}\n`)
  const lovech = rows.find((row) => row.ekatte === '43952')
  console.log(`Wrote ${rows.length} rows to ${OUT_FILE}`)
  console.log('Lovech 43952:', lovech)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
