import { useCallback, useEffect, useRef, useState } from 'react'
import { BarChart3, CheckCircle2, MapPinned, Menu, Play, Plus, RotateCcw, TriangleAlert } from 'lucide-react'
import { APP_CONFIG, STAGE_LABELS } from './config'
import { LayerPanel } from './components/LayerPanel'
import { MapView, type LayerVisibility } from './components/MapView'
import { ResultsPanel } from './components/ResultsPanel'
import { SearchPanel } from './components/SearchPanel'
import { analysisToCsv, analysisToGeoJson, downloadText, safeFilename } from './lib/export'
import { formatDate } from './lib/format'
import { dataRadiusForBoundary } from './lib/geometry'
import { analysisRadiusForSettlement, analyzeSettlement } from './services/analysis'
import { fetchSettlementGeodata } from './services/overpass'
import { searchSettlements } from './services/search'
import type { AnalysisResult, AnalysisStage, PolygonFeature, RawGeodata, SettlementResult } from './types'

interface AppProps {
  ownerMode?: boolean
  analysisCount?: number
  onAnalysisStarted?: (isSecond: boolean) => void
  onAnalysisCompleted?: (result: AnalysisResult) => void
  onFeatureUsed?: (featureName: string) => void
}

function App({ ownerMode = false, analysisCount = 0, onAnalysisStarted, onAnalysisCompleted, onFeatureUsed }: AppProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SettlementResult[]>([])
  const [selected, setSelected] = useState<SettlementResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [rawData, setRawData] = useState<RawGeodata | null>(null)
  const [rawDataRadiusM, setRawDataRadiusM] = useState(0)
  const [stage, setStage] = useState<AnalysisStage>('idle')
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [visible, setVisible] = useState<LayerVisibility>(createDefaultLayerVisibility)
  const [layersCollapsed, setLayersCollapsed] = useState(() => window.innerWidth <= 540)
  const [infoOpen, setInfoOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedBoundary, setEditedBoundary] = useState<PolygonFeature | null>(null)
  const analysisAbort = useRef<AbortController | null>(null)

  useEffect(() => {
    if (selected || query.trim().length < 3) {
      setSearchResults([])
      setSearchError(null)
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearchLoading(true)
      setSearchError(null)
      try {
        setSearchResults(await searchSettlements(query, controller.signal))
      } catch (error) {
        if (!controller.signal.aborted) setSearchError(error instanceof Error ? error.message : 'Търсенето не бе успешно.')
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false)
      }
    }, 700)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query, selected])

  useEffect(() => {
    const handleResize = () => setLayersCollapsed(window.innerWidth <= 540)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleQueryChange = (value: string) => {
    setSelected(null)
    setResult(null)
    setRawData(null)
    setRawDataRadiusM(0)
    setEditing(false)
    setEditedBoundary(null)
    setAnalysisError(null)
    setStage('idle')
    setQuery(value)
  }

  const handleSelect = (settlement: SettlementResult) => {
    setSelected(settlement)
    setQuery(settlement.name)
    setSearchResults([])
    setSearchError(null)
  }

  const runAnalysis = async () => {
    if (!selected) return
    onAnalysisStarted?.(analysisCount >= 1)
    analysisAbort.current?.abort()
    const controller = new AbortController()
    analysisAbort.current = controller
    setAnalysisError(null)
    setResult(null)
    setStage('boundary')
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 120))
      setStage('buildings')
      const analysisRadiusM = analysisRadiusForSettlement(selected)
      const raw = await fetchSettlementGeodata(selected.lat, selected.lon, controller.signal, analysisRadiusM)
      if (controller.signal.aborted) return
      setRawData(raw)
      setRawDataRadiusM(analysisRadiusM)
      setStage('roads')
      await new Promise((resolve) => window.setTimeout(resolve, 80))
      setStage('landuse')
      await new Promise((resolve) => window.setTimeout(resolve, 80))
      setStage('geometry')
      const analysis = analyzeSettlement(selected, raw)
      setStage('metrics')
      await new Promise((resolve) => window.setTimeout(resolve, 80))
      setResult(analysis)
      onAnalysisCompleted?.(analysis)
      setStage('map')
      await new Promise((resolve) => window.setTimeout(resolve, 120))
      setStage('complete')
    } catch (error) {
      if (controller.signal.aborted) return
      setAnalysisError(error instanceof Error ? error.message : 'Анализът не бе завършен поради неочаквана грешка.')
      setStage('idle')
    }
  }

  const newAnalysis = () => {
    analysisAbort.current?.abort()
    setQuery('')
    setSearchResults([])
    setSelected(null)
    setResult(null)
    setRawData(null)
    setRawDataRadiusM(0)
    setStage('idle')
    setAnalysisError(null)
    setEditing(false)
    setEditedBoundary(null)
    setVisible(createDefaultLayerVisibility())
  }

  const startEditing = () => {
    if (!result) return
    onFeatureUsed?.('редактиране на граница')
    setEditedBoundary(result.boundary)
    setEditing(true)
  }
  const cancelEditing = () => { setEditing(false); setEditedBoundary(null) }
  const recalculate = async () => {
    if (!selected || !rawData || !editedBoundary) return
    const boundary = editedBoundary
    const requiredRadiusM = dataRadiusForBoundary(boundary, selected.lat, selected.lon)
    if (requiredRadiusM > APP_CONFIG.overpass.maximumEditedRadiusM) {
      setAnalysisError('Коригираната зона е прекалено голяма или отдалечена. Намалете границата и опитайте отново.')
      return
    }
    setAnalysisError(null)
    setEditing(false)
    try {
      let currentRaw = rawData
      if (requiredRadiusM > rawDataRadiusM) {
        setStage('buildings')
        currentRaw = await fetchSettlementGeodata(selected.lat, selected.lon, undefined, requiredRadiusM)
        setRawData(currentRaw)
        setRawDataRadiusM(requiredRadiusM)
      }
      setStage('geometry')
      setResult(analyzeSettlement(selected, currentRaw, boundary))
      setEditedBoundary(null)
      setStage('complete')
    } catch {
      setEditing(true)
      setStage('complete')
      setAnalysisError('Коригираната граница не може да бъде обработена. Върнете се назад и опитайте с по-проста форма.')
    }
  }

  const exportCsv = () => {
    if (!result) return
    onFeatureUsed?.('експорт CSV')
    downloadText(analysisToCsv(result), `${safeFilename(result.settlement.name)}-анализ.csv`, 'text/csv;charset=utf-8')
  }
  const exportGeoJson = () => {
    if (!result) return
    onFeatureUsed?.('експорт GeoJSON')
    downloadText(JSON.stringify(analysisToGeoJson(result), null, 2), `${safeFilename(result.settlement.name)}-анализ.geojson`, 'application/geo+json;charset=utf-8')
  }

  const handleBoundaryEdited = useCallback((boundary: PolygonFeature) => setEditedBoundary(boundary), [])
  const analyzing = !['idle', 'complete'].includes(stage)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand"><span className="brand-mark"><MapPinned /></span><span><strong>Анализатор на населени места</strong><small>Ориентировъчен пространствен анализ</small></span></div>
        {ownerMode && <a className="button admin-link" href="/admin">Администрация</a>}
        <button type="button" className="button new-analysis" onClick={newAnalysis}><Plus size={18} /> Нов анализ</button>
        <button type="button" className="menu-button" aria-label="Информация за приложението" aria-expanded={infoOpen} onClick={() => setInfoOpen((value) => !value)}><Menu /></button>
        {infoOpen && (
          <aside className="info-popover">
            <strong>За анализа</strong>
            <p>Данните идват от OpenStreetMap и може да са непълни.</p>
            <p>Резултатът е ориентировъчен и не замества кадастрално или геодезическо измерване.</p>
            <button type="button" className="button" onClick={() => setInfoOpen(false)}>Затвори</button>
          </aside>
        )}
      </header>

      <section className="command-bar" aria-label="Управление на анализа">
        <SearchPanel
          query={query}
          onQueryChange={handleQueryChange}
          results={searchResults}
          selected={selected}
          loading={searchLoading}
          error={searchError}
          onSelect={handleSelect}
        />
        <button type="button" className="analyze-button" disabled={!selected || analyzing} onClick={runAnalysis}>
          {analyzing ? <span className="spinner spinner--light" /> : <Play size={21} fill="currentColor" />}
          {analyzing ? 'Анализиране...' : 'Анализирай'}
        </button>
        <div className={`status-card ${analysisError ? 'status-card--error' : result ? 'status-card--success' : ''}`} aria-live="polite">
          {analysisError ? <TriangleAlert /> : result ? <CheckCircle2 /> : <BarChart3 />}
          <span>
            <strong>{analysisError ? 'Анализът не бе завършен' : result ? 'Анализът е готов' : 'Готово за анализ'}</strong>
            <small>{analysisError || (result ? formatDate(result.createdAt) : 'Изберете населено място')}</small>
          </span>
          {analysisError && <button type="button" className="retry-button" onClick={runAnalysis}><RotateCcw size={16} /> Опитай отново</button>}
        </div>
      </section>

      <main className={`workspace ${result ? 'workspace--with-results' : ''}`}>
        <section className="map-region" aria-label="Интерактивна карта">
          <MapView selected={selected} result={result} visible={visible} editing={editing} onBoundaryEdited={handleBoundaryEdited} />
          <LayerPanel visible={visible} onChange={setVisible} collapsed={layersCollapsed} onToggleCollapsed={() => setLayersCollapsed((value) => !value)} />
          {analyzing && <div className="analysis-overlay"><span className="analysis-loader" /><strong>{STAGE_LABELS[stage]}</strong><small>Използват се реални отворени географски данни.</small></div>}
          <div className="map-disclaimer">Ориентировъчни отворени данни · Не е официално измерване</div>
        </section>

        {result ? (
          <ResultsPanel
            result={result}
            editing={editing}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onRecalculate={recalculate}
            onExportCsv={exportCsv}
            onExportGeoJson={exportGeoJson}
          />
        ) : (
          <aside className="empty-panel">
            <div className="empty-illustration"><BarChart3 /></div>
            <h2>Анализирайте населено място</h2>
            <p>Потърсете място в България, изберете правилния резултат и натиснете „Анализирай“.</p>
            <ol><li>Разумна граница на застроената зона</li><li>Сгради, улици и територии</li><li>Седем категории с общ сбор 100%</li><li>Карта, показатели и файлове за изтегляне</li></ol>
          </aside>
        )}
      </main>
    </div>
  )
}

export default App

function createDefaultLayerVisibility(): LayerVisibility {
  return {
    boundary: true,
    residential: true,
    industrial: true,
    roads: true,
    green: true,
    water: true,
    agricultural: true,
    other: true,
    buildings: true,
    pois: true,
  }
}
