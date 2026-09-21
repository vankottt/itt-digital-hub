import type { StoredSettlementPack } from '../types'

const DB_NAME = 'itt-settlement-packs'
const STORE = 'packs'
const VERSION = 1
const memoryFallback = new Map<string, StoredSettlementPack>()

function hasIndexedDb() {
  return typeof indexedDB !== 'undefined'
}

function openDb(): Promise<IDBDatabase | null> {
  if (!hasIndexedDb()) return Promise.resolve(null)
  return new Promise((resolve) => {
    let settled = false
    const finish = (value: IDBDatabase | null) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const timer = setTimeout(() => finish(null), 400)
    try {
      const request = indexedDB.open(DB_NAME, VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'ekatte' })
      }
      request.onsuccess = () => {
        clearTimeout(timer)
        finish(request.result)
      }
      request.onerror = () => {
        clearTimeout(timer)
        finish(null)
      }
    } catch {
      clearTimeout(timer)
      finish(null)
    }
  })
}

function storeRead(db: IDBDatabase, ekatte: string): Promise<StoredSettlementPack | null> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(ekatte)
    request.onsuccess = () => resolve((request.result as StoredSettlementPack | undefined) ?? null)
    request.onerror = () => reject(request.error)
  })
}

function storeAll(db: IDBDatabase): Promise<StoredSettlementPack[]> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    request.onsuccess = () => resolve((request.result as StoredSettlementPack[]) ?? [])
    request.onerror = () => reject(request.error)
  })
}

function storePut(db: IDBDatabase, pack: StoredSettlementPack): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(pack)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function readLocalPack(ekatte: string): Promise<StoredSettlementPack | null> {
  const db = await openDb()
  if (!db) return memoryFallback.get(ekatte) ?? null
  try {
    return await storeRead(db, ekatte)
  } catch {
    return memoryFallback.get(ekatte) ?? null
  }
}

export async function listLocalPacks(): Promise<StoredSettlementPack[]> {
  const db = await openDb()
  if (!db) return [...memoryFallback.values()]
  try {
    return await storeAll(db)
  } catch {
    return [...memoryFallback.values()]
  }
}

export async function saveLocalPack(pack: StoredSettlementPack): Promise<void> {
  if (!pack.raw.buildings?.features || !pack.raw.roads?.features || !pack.raw.landuse?.features) {
    throw new Error('Incomplete pack')
  }
  memoryFallback.set(pack.ekatte, pack)
  const db = await openDb()
  if (!db) return
  try {
    await storePut(db, pack)
  } catch {
    // Memory fallback still holds the complete pack for this session.
  }
}

export function clearLocalPackMemory() {
  memoryFallback.clear()
}
