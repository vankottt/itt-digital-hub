import {
  Building2,
  Download,
  Gauge,
  MapPinned,
  Pencil,
  Route,
  Save,
  SquareDashed,
  Warehouse,
  X,
} from 'lucide-react'
import { formatAreaHa, formatAreaM2, formatDistanceKm, formatNumber, formatPercent } from '../lib/format'
import type { AnalysisResult } from '../types'
import { DonutChart } from './DonutChart'

interface Props {
  result: AnalysisResult
  editing: boolean
  onStartEditing: () => void
  onCancelEditing: () => void
  onRecalculate: () => void
  onExportCsv: () => void
  onExportGeoJson: () => void
}

export function ResultsPanel({ result, editing, onStartEditing, onCancelEditing, onRecalculate, onExportCsv, onExportGeoJson }: Props) {
  const totalPercent = result.categories.reduce((total, category) => total + category.percent, 0)
  const confidenceClass = result.confidence.level === 'Висока' ? 'high' : result.confidence.level === 'Средна' ? 'medium' : 'low'
  return (
    <aside className="results-panel" aria-label="Резултати от анализа">
      <div className="results-scroll">
        <header className="results-header">
          <p className="eyebrow">Резултат от анализа</p>
          <h2>{result.settlement.name}{result.settlement.region ? `, ${result.settlement.region}` : ''}</h2>
          <span className="profile-label">Ориентировъчен профил на населеното място</span>
          <strong className="profile-value">{result.profile}</strong>
          <details className="confidence-details">
            <summary>Надеждност на данните: <strong className={`confidence confidence--${confidenceClass}`}>{result.confidence.level}</strong></summary>
            <p>Оценката показва доколко отворените данни са достатъчни за този резултат.</p>
            <ul>{result.confidence.reasons.map((reason) => <li key={reason}>{reason.replace('.', ',')}</li>)}</ul>
            <p><strong>Метод за границата:</strong> {result.boundaryReason}</p>
          </details>
        </header>

        {result.warnings.length > 0 && <div className="warning-box">{result.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}

        <section className="result-section">
          <h3>Разпределение на територията</h3>
          <div className="distribution-grid">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Категория</th><th>Площ (м²)</th><th>Площ (ха)</th><th>%</th></tr></thead>
                <tbody>
                  {result.categories.map((category) => (
                    <tr key={category.key}>
                      <td><span className="table-swatch" style={{ background: category.color }} />{category.label}</td>
                      <td>{formatNumber(category.areaM2, 0)}</td>
                      <td>{formatNumber(category.areaHa, 2)}</td>
                      <td>{formatNumber(category.percent, 1)}%</td>
                    </tr>
                  ))}
                  <tr className="total-row"><td>ОБЩО</td><td>{formatNumber(result.analysisAreaM2, 0)}</td><td>{formatNumber(result.analysisAreaHa, 2)}</td><td>{formatNumber(totalPercent, 1)}%</td></tr>
                </tbody>
              </table>
            </div>
            <DonutChart categories={result.categories} />
          </div>
        </section>

        <section className="result-section">
          <h3>Ключови показатели</h3>
          <div className="kpi-grid">
            <Kpi icon={<SquareDashed />} label="Анализирана площ" value={formatAreaHa(result.analysisAreaHa)} secondary={`${formatNumber(result.analysisAreaKm2, 3)} км²`} />
            <Kpi icon={<Route />} label="Улична мрежа" value={formatDistanceKm(result.roadMetrics.lengthKm)} secondary={`${formatNumber(result.roadMetrics.densityKmPerKm2, 2)} км/км²`} />
            <Kpi icon={<Building2 />} label="Сгради" value={formatNumber(result.buildingMetrics.total, 0)} secondary={`${formatNumber(result.buildingMetrics.perHa, 2)} / ха`} />
            <Kpi icon={<Warehouse />} label="Площ на сградите" value={formatAreaM2(result.buildingMetrics.footprintM2)} secondary={`Застрояване ${formatPercent(result.buildingMetrics.builtUpPercent)}`} />
            <Kpi icon={<Gauge />} label="Средна площ на сграда" value={formatAreaM2(result.buildingMetrics.averageFootprintM2)} secondary={`${formatNumber(result.buildingMetrics.residential, 0)} вероятно жилищни`} />
            <Kpi icon={<MapPinned />} label="Обществени и важни обекти" value={formatNumber(result.poiCount, 0)} secondary={`${formatNumber(result.buildingMetrics.unknown, 0)} неопределени сгради`} />
          </div>
        </section>

        <section className="result-section compact-details">
          <details>
            <summary>Подробни показатели за сгради и улици</summary>
            <dl>
              <div><dt>Вероятно жилищни сгради</dt><dd>{formatNumber(result.buildingMetrics.residential, 0)}</dd></div>
              <div><dt>Индустриални / търговски</dt><dd>{formatNumber(result.buildingMetrics.industrial, 0)}</dd></div>
              <div><dt>Други известни сгради</dt><dd>{formatNumber(result.buildingMetrics.other, 0)}</dd></div>
              <div><dt>Неопределени сгради</dt><dd>{formatNumber(result.buildingMetrics.unknown, 0)}</dd></div>
              <div><dt>Жилищни сгради / ха</dt><dd>{formatNumber(result.buildingMetrics.residentialPerHa, 2)}</dd></div>
              <div><dt>Приблизителна площ на улиците</dt><dd>{formatAreaM2(result.roadMetrics.areaM2)}</dd></div>
            </dl>
          </details>
        </section>
      </div>

      <footer className="results-actions">
        {editing ? (
          <>
            <button type="button" className="button button--primary" onClick={onRecalculate}><Save size={17} /> Преизчисли</button>
            <button type="button" className="button" onClick={onCancelEditing}><X size={17} /> Отказ</button>
          </>
        ) : (
          <button type="button" className="button" onClick={onStartEditing}><Pencil size={17} /> Редактирай границата</button>
        )}
        <button type="button" className="button" onClick={onExportCsv} disabled={editing}><Download size={17} /> Изтегли CSV</button>
        <button type="button" className="button" onClick={onExportGeoJson} disabled={editing}><Download size={17} /> Изтегли GeoJSON</button>
      </footer>
    </aside>
  )
}

function Kpi({ icon, label, value, secondary }: { icon: React.ReactNode; label: string; value: string; secondary: string }) {
  return <div className="kpi"><span className="kpi__icon">{icon}</span><span><small>{label}</small><strong>{value}</strong><em>{secondary}</em></span></div>
}
