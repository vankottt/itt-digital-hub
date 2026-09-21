import { Building2, Layers3, MapPin } from 'lucide-react'
import { CATEGORY_META, CATEGORY_ORDER } from '../config'
import type { LayerVisibility } from './MapView'

interface Props {
  visible: LayerVisibility
  onChange: (visible: LayerVisibility) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function LayerPanel({ visible, onChange, collapsed, onToggleCollapsed }: Props) {
  const toggle = (key: keyof LayerVisibility) => onChange({ ...visible, [key]: !visible[key] })
  return (
    <aside className={`layer-panel ${collapsed ? 'layer-panel--collapsed' : ''}`} aria-label="Слоеве на картата">
      <button type="button" className="layer-panel__heading" onClick={onToggleCollapsed} aria-expanded={!collapsed}>
        <span><Layers3 size={19} /> Слоеве</span><span aria-hidden="true">{collapsed ? '+' : '−'}</span>
      </button>
      {!collapsed && (
        <div className="layer-list">
          <LayerRow checked={visible.boundary} onChange={() => toggle('boundary')} color="#17683a" label="Граница на анализа" />
          {CATEGORY_ORDER.map((key) => <LayerRow key={key} checked={visible[key]} onChange={() => toggle(key)} color={CATEGORY_META[key].color} label={CATEGORY_META[key].label} />)}
          <div className="layer-divider" />
          <LayerRow checked={visible.buildings} onChange={() => toggle('buildings')} color="#f3f1e8" label="Сгради" icon={<Building2 size={17} />} />
          <LayerRow checked={visible.pois} onChange={() => toggle('pois')} color="#17683a" label="Обществени и важни обекти" icon={<MapPin size={17} />} />
        </div>
      )}
    </aside>
  )
}

function LayerRow({ checked, onChange, color, label, icon }: { checked: boolean; onChange: () => void; color: string; label: string; icon?: React.ReactNode }) {
  return (
    <label className="layer-row">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="layer-check" aria-hidden="true">✓</span>
      {icon ?? <span className="layer-color" style={{ background: color }} />}
      <span>{label}</span>
    </label>
  )
}

