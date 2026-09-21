import type { CategoryResult } from '../types'

export function DonutChart({ categories }: { categories: CategoryResult[] }) {
  let accumulated = 0
  const stops = categories.map((category) => {
    const start = accumulated
    accumulated += category.percent
    return `${category.color} ${start.toFixed(2)}% ${Math.min(100, accumulated).toFixed(2)}%`
  })
  return (
    <div className="donut" role="img" aria-label="Диаграма на териториалното разпределение" style={{ background: `conic-gradient(${stops.join(',')})` }}>
      <div className="donut__center"><strong>100%</strong><span>общо</span></div>
    </div>
  )
}

