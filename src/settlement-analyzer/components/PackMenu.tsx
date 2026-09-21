import type { Locale } from '@/lib/i18n'
import { sa } from '../copy'
import type { PackCatalogItem } from '../types'

interface Props {
  locale: Locale
  catalog: PackCatalogItem[]
  selectedEkatte?: string
  disabled?: boolean
  onSelect: (item: PackCatalogItem) => void
}

export function PackMenu({ locale, catalog, selectedEkatte, disabled, onSelect }: Props) {
  const copy = sa(locale)
  const selectedInCatalog = catalog.some((item) => item.ekatte === selectedEkatte)
  const label = catalog.length === 0
    ? copy.readyPacksEmpty
    : copy.readyPacksCount.replace('{count}', String(catalog.length))

  return (
    <label className="pack-menu">
      <span className="sr-only">{copy.readyPacks}</span>
      <select
        value={selectedInCatalog ? selectedEkatte : ''}
        disabled={disabled || catalog.length === 0}
        aria-label={copy.readyPacks}
        onChange={(event) => {
          const item = catalog.find((entry) => entry.ekatte === event.target.value)
          if (item) onSelect(item)
        }}
      >
        <option value="">{label}</option>
        {catalog.map((item) => (
          <option key={item.ekatte} value={item.ekatte}>
            {item.name}, {item.municipality}
          </option>
        ))}
      </select>
    </label>
  )
}
