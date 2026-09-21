'use client'

import type { Locale } from '@/lib/i18n'
import { sa } from '../copy'
import type { CategoryResult } from '../types'

export function DonutChart({ locale, categories }: { locale: Locale; categories: CategoryResult[] }) {
  const copy = sa(locale)
  const stops = categories.reduce<string[]>((list, category) => {
    const start = list.length === 0 ? 0 : categories.slice(0, list.length).reduce((sum, item) => sum + item.percent, 0)
    const end = Math.min(100, start + category.percent)
    return [...list, `${category.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`]
  }, [])
  return (
    <div className="donut" role="img" aria-label={copy.distribution} style={{ background: `conic-gradient(${stops.join(',')})` }}>
      <div className="donut__center"><strong>100%</strong><span>{copy.total}</span></div>
    </div>
  )
}
