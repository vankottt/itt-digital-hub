import { Check, MapPin, Search, X } from 'lucide-react'
import type { SettlementResult } from '../types'

interface Props {
  query: string
  onQueryChange: (value: string) => void
  results: SettlementResult[]
  selected: SettlementResult | null
  loading: boolean
  error: string | null
  onSelect: (result: SettlementResult) => void
}

export function SearchPanel({ query, onQueryChange, results, selected, loading, error, onSelect }: Props) {
  const showResults = query.trim().length >= 3 && !selected
  return (
    <div className="search-area">
      <div className={`search-field ${selected ? 'search-field--selected' : ''}`}>
        <Search size={21} aria-hidden="true" />
        <label className="sr-only" htmlFor="settlement-search">Търсене на населено място</label>
        <input
          id="settlement-search"
          value={selected ? selected.name : query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Търсене на населено място"
          autoComplete="off"
          disabled={Boolean(selected)}
        />
        {(query || selected) && (
          <button type="button" className="icon-button" aria-label="Изчисти търсенето" onClick={() => onQueryChange('')}>
            <X size={19} />
          </button>
        )}
      </div>
      {showResults && (
        <div className="search-results" role="listbox" aria-label="Намерени населени места">
          {loading && <div className="search-state"><span className="spinner" />Търсене на населено място...</div>}
          {!loading && error && <div className="search-state search-state--error">{error}</div>}
          {!loading && !error && results.length === 0 && <div className="search-state">Няма намерени населени места.</div>}
          {!loading && results.map((item) => (
            <button key={item.placeId} type="button" className="search-result" role="option" aria-selected="false" onClick={() => onSelect(item)}>
              <MapPin size={19} aria-hidden="true" />
              <span>
                <strong>{item.name}, {item.region || 'България'}</strong>
                <small>{[item.municipality && `Община ${item.municipality.replace(/^Община\s+/i, '')}`, item.region && `Област ${item.region.replace(/^Област\s+/i, '')}`].filter(Boolean).join(', ') || item.displayName}</small>
              </span>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="selected-place" aria-live="polite">
          <MapPin size={20} />
          <span><strong>{selected.name}, {selected.region || 'България'}</strong><small>{selected.municipality ? `Община ${selected.municipality.replace(/^Община\s+/i, '')}` : selected.displayName}</small></span>
          <Check size={20} className="selected-check" />
        </div>
      )}
    </div>
  )
}

