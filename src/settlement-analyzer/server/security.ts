import type { NextRequest } from 'next/server'

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return
  if (new URL(origin).origin !== new URL(request.url).origin) throw new Error('Невалидна заявка.')
}

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().replaceAll(/\s+/g, ' ').slice(0, maxLength) : ''
}

export function cleanEmail(value: unknown) {
  const email = cleanText(value, 180).toLocaleLowerCase('en-US')
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : ''
}

export function cleanStringArray(value: unknown, allowed: readonly string[], maxItems = 12) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && allowed.includes(item)))].slice(0, maxItems)
}

export function safeJson(value: unknown, maxLength = 2000) {
  const serialized = JSON.stringify(value ?? {})
  return serialized.length <= maxLength ? serialized : '{}'
}

export function normalizeCompanyName(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase('bg-BG').replaceAll(/[^\p{L}\p{N}]+/gu, ' ').trim()
}
