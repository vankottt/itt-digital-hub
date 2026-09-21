import { describe, expect, it } from 'vitest'
import { packDownloadProgress } from './pack-progress'

describe('packDownloadProgress', () => {
  it('върви от 0 към 100 по задължителните части без да скача назад', () => {
    const steps = [
      packDownloadProgress('landuse', 'start'),
      packDownloadProgress('landuse', 'done'),
      packDownloadProgress('buildings', 'start'),
      packDownloadProgress('buildings', 'retry', 2),
      packDownloadProgress('buildings', 'done'),
      packDownloadProgress('roads', 'done'),
      packDownloadProgress('pois', 'done'),
      packDownloadProgress('save', 'done'),
    ]
    expect(steps[0]?.percent).toBeGreaterThan(0)
    expect(steps[3]?.percent).toBe(steps[2]?.percent)
    expect(steps[3]?.status).toBe('retry')
    expect(steps[3]?.attempt).toBe(2)
    for (let index = 1; index < steps.length; index += 1) {
      expect(steps[index]!.percent).toBeGreaterThanOrEqual(steps[index - 1]!.percent)
    }
    expect(steps.at(-1)?.percent).toBe(100)
  })
})
