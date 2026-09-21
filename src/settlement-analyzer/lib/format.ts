import type { Locale } from '@/lib/i18n'

const numberFormatters = new Map<string, Intl.NumberFormat>()

function localeTag(locale: Locale = 'bg') {
  return locale === 'en' ? 'en-GB' : 'bg-BG'
}

function formatter(maximumFractionDigits: number, locale: Locale = 'bg') {
  const key = `${localeTag(locale)}:${maximumFractionDigits}`
  if (!numberFormatters.has(key)) {
    numberFormatters.set(key, new Intl.NumberFormat(localeTag(locale), { maximumFractionDigits, minimumFractionDigits: 0 }))
  }
  return numberFormatters.get(key)!
}

export function formatNumber(value: number, digits = 1, locale: Locale = 'bg') {
  return formatter(digits, locale).format(Number.isFinite(value) ? value : 0)
}

export function formatAreaM2(value: number, locale: Locale = 'bg') {
  return `${formatNumber(value, value < 100 ? 1 : 0, locale)} ${locale === 'en' ? 'm²' : 'м²'}`
}

export function formatAreaHa(value: number, locale: Locale = 'bg') {
  return `${formatNumber(value, 2, locale)} ${locale === 'en' ? 'ha' : 'ха'}`
}

export function formatPercent(value: number, locale: Locale = 'bg') {
  return `${formatNumber(value, 1, locale)}%`
}

export function formatDistanceKm(value: number, locale: Locale = 'bg') {
  return `${formatNumber(value, 2, locale)} ${locale === 'en' ? 'km' : 'км'}`
}

export function formatDate(date: string, locale: Locale = 'bg') {
  return new Intl.DateTimeFormat(localeTag(locale), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}
