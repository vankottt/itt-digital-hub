import type { PackDownloadPart, PackDownloadProgress } from '../types'

const PART_BOUNDS: Record<PackDownloadPart, { start: number; done: number }> = {
  landuse: { start: 4, done: 20 },
  buildings: { start: 22, done: 50 },
  roads: { start: 52, done: 75 },
  pois: { start: 77, done: 88 },
  save: { start: 92, done: 100 },
}

export function packDownloadProgress(
  part: PackDownloadPart,
  status: PackDownloadProgress['status'],
  attempt = 1,
): PackDownloadProgress {
  const bounds = PART_BOUNDS[part]
  const percent = status === 'done' ? bounds.done : bounds.start
  return { percent, part, attempt, status }
}
