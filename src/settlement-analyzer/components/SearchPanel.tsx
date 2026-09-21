'use client'

import { MapPin, Search, X } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { APP_CONFIG } from '../config'
import { sa } from '../copy'
import type { SettlementResult } from '../types'

interface Props {
  locale: Locale
  query: string
  onQueryChange: (value: string) => void
  results: SettlementResult[]
  selected: SettlementResult | null
  loading: boolean
  error: string | null
  onSelect: (result: SettlementResult) => void
}

export function SearchPanel({ locale, query, onQueryChange, results, selected, loading, error, onSelect }: Props) {
  const copy = sa(locale)
  const showResults = query.trim().length >= APP_CONFIG.search.minQueryLength && !selected
  return (
    <div className="search-area">
      <div className={`search-field ${selected ? 'search-field--selected' : ''}`}>
        <Search size={21} aria-hidden="true" />
        <label className="sr-only" htmlFor="settlement-search">{copy.searchPlaceholder}</label>
        <input
          id="settlement-search"
          value={selected ? selected.name : query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={copy.searchPlaceholder}
          autoComplete="off"
          disabled={Boolean(selected)}
        />
        {query && !selected && (
          <button type="button" className="icon-button" aria-label={copy.clearSearch} onClick={() => onQueryChange('')}>
            <X size={19} />
          </button>
        )}
      </div>
      {showResults && (
        <div className="search-results" role="listbox" aria-label={copy.foundSettlements}>
          {loading && <div className="search-state"><span className="spinner" />{copy.searching}</div>}
          {!loading && error && <div className="search-state search-state--error">{error}</div>}
          {!loading && !error && results.length === 0 && <div className="search-state">{copy.noResults}</div>}
          {!loading && results.map((item) => (
            <button key={item.placeId} type="button" className="search-result" role="option" aria-selected="false" onClick={() => onSelect(item)}>
              <MapPin size={19} aria-hidden="true" />
              <span>
                <strong>{item.displayName.split(',')[0]}, {item.region || copy.bulgaria}</strong>
                <small>{[item.municipality && `${copy.municipality} ${item.municipality.replace(/^Община\s+/i, '')}`, item.region && `${copy.region} ${item.region.replace(/^Област\s+/i, '')}`].filter(Boolean).join(', ') || item.displayName}</small>
              </span>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="selected-place" aria-live="polite">
          <MapPin size={20} aria-hidden="true" />
          <span><strong>{selected.name.trim()}, {(selected.region || copy.bulgaria).trim()}</strong><small>{selected.municipality ? `${copy.municipality} ${selected.municipality.replace(/^Община\s+/i, '').trim()}` : selected.displayName}</small></span>
          <button type="button" className="icon-button" aria-label={copy.clearSearch} onClick={() => onQueryChange('')}>
            <X size={19} />
          </button>
        </div>
      )}
    </div>
  )
}
