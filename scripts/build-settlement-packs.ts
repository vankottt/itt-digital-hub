import { mkdir, readFile, readdir, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { PACK_EKATTE } from './settlement-pack-list'
import registryJson from '../src/settlement-analyzer/data/settlements.json'

interface RegistryRow {
  ekatte: string
  name: string
  type: 'city' | 'town' | 'village' | 'hamlet'
  municipality: string
  region: string
  lat: number
  lon: number
}

globalThis.sessionStorage = {
  getItem: () => null,
  setItem() {},
  removeItem() {},
  clear() {},
  key: () => null,
  length: 0,
} as unknown as Storage

const OUT_DIR = path.resolve('public/settlement-packs')
const registry = registryJson as RegistryRow[]

function roundNumbers(_key: string, value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value * 1_000_000) / 1_000_000 : value
}

async function writeManifest() {
  const files = (await readdir(OUT_DIR)).filter((file) => file.endsWith('.json') && file !== 'manifest.json')
  const packs = []
  for (const file of files) {
    const ekatte = file.replace(/\.json$/, '')
    const row = registry.find((item) => item.ekatte === ekatte)
    const payload = JSON.parse(await readFile(path.join(OUT_DIR, file), 'utf8')) as {
      name?: string
      radiusM?: number
      fetchedAt?: string
    }
    if (!row) continue
    packs.push({
      ekatte,
      name: row.name,
      municipality: row.municipality,
      region: row.region,
      type: row.type,
      lat: row.lat,
      lon: row.lon,
      radiusM: payload.radiusM ?? 0,
      fetchedAt: payload.fetchedAt ?? '',
    })
  }
  packs.sort((a, b) => a.name.localeCompare(b.name, 'bg'))
  await writeFile(path.join(OUT_DIR, 'manifest.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), packs }, null, 2)}\n`)
  console.log(`Wrote manifest with ${packs.length} pack(s)`)
}

async function main() {
      const { packRadiusForSettlement } = await import('../src/settlement-analyzer/services/analysis')
  const { downloadPackGeodata } = await import('../src/settlement-analyzer/services/overpass')
  await mkdir(OUT_DIR, { recursive: true })
  const failed: string[] = []

  for (const [index, ekatte] of PACK_EKATTE.entries()) {
    const row = registry.find((item) => item.ekatte === ekatte)
    if (!row) {
      console.error(`Missing registry row for ${ekatte}`)
      failed.push(ekatte)
      continue
    }
    const file = path.join(OUT_DIR, `${ekatte}.json`)
    try {
      await access(file)
      console.log(`Skip existing pack ${row.name} (${ekatte})`)
      continue
    } catch {
      // File is missing; download it.
    }
    try {
      const radiusM = packRadiusForSettlement({ type: row.type })
      const raw = await downloadPackGeodata(row.lat, row.lon, radiusM, () => {})
      raw.source = 'pack'
      const payload = {
        ekatte,
        name: row.name,
        radiusM,
        fetchedAt: raw.fetchedAt ?? new Date().toISOString(),
        sourceEndpoint: raw.sourceEndpoint,
        raw,
      }
      const body = JSON.stringify(payload, roundNumbers)
      await writeFile(file, body)
      console.log(`${row.name} (${ekatte}): ${(Buffer.byteLength(body) / 1_048_576).toFixed(2)} MB`)
    } catch (error) {
      failed.push(ekatte)
      console.error(`Failed ${ekatte}:`, error)
    }
    if (index < PACK_EKATTE.length - 1) await new Promise((resolve) => setTimeout(resolve, 8000))
  }

  await writeManifest()
  if (failed.length > 0) {
    console.error(`Failed packs: ${failed.join(', ')}`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
