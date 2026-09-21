import { describe, expect, it } from 'vitest'
import { cleanEmail, cleanStringArray, cleanText, normalizeCompanyName, safeJson } from './security'

describe('conference input security', () => {
  it('normalizes business identifiers without storing raw formatting variants', () => {
    expect(normalizeCompanyName('  „Аква–Проект“ ООД  ')).toBe('аква проект оод')
  })

  it('validates and bounds submitted values', () => {
    expect(cleanEmail('  NAME@Example.COM ')).toBe('name@example.com')
    expect(cleanEmail('not-an-email')).toBe('')
    expect(cleanText('  много   празни места ', 50)).toBe('много празни места')
    expect(cleanStringArray(['A', 'A', 'B', 'X'], ['A', 'B'])).toEqual(['A', 'B'])
    expect(safeJson({ value: 'x'.repeat(2100) })).toBe('{}')
  })
})
