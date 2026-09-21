const numberFormatters = new Map<string, Intl.NumberFormat>()

function formatter(maximumFractionDigits: number) {
  const key = String(maximumFractionDigits)
  if (!numberFormatters.has(key)) {
    numberFormatters.set(key, new Intl.NumberFormat('bg-BG', { maximumFractionDigits, minimumFractionDigits: 0 }))
  }
  return numberFormatters.get(key)!
}

export function formatNumber(value: number, digits = 1) {
  return formatter(digits).format(Number.isFinite(value) ? value : 0)
}

export function formatAreaM2(value: number) {
  return `${formatNumber(value, value < 100 ? 1 : 0)} м²`
}

export function formatAreaHa(value: number) {
  return `${formatNumber(value, 2)} ха`
}

export function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`
}

export function formatDistanceKm(value: number) {
  return `${formatNumber(value, 2)} км`
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('bg-BG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}
