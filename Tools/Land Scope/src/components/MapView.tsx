import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet-draw'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { tagsOf } from '../lib/classification'
import type { AnalysisResult, PolygonFeature, SettlementResult } from '../types'

export interface LayerVisibility {
  boundary: boolean
  residential: boolean
  industrial: boolean
  roads: boolean
  green: boolean
  water: boolean
  agricultural: boolean
  other: boolean
  buildings: boolean
  pois: boolean
}

interface Props {
  selected: SettlementResult | null
  result: AnalysisResult | null
  visible: LayerVisibility
  editing: boolean
  onBoundaryEdited: (boundary: PolygonFeature) => void
}

function FitMap({ selected, result }: { selected: SettlementResult | null; result: AnalysisResult | null }) {
  const map = useMap()
  const previousKey = useRef('')
  useEffect(() => {
    L.drawLocal.edit.handlers.edit.tooltip.text = 'Преместете точките, за да коригирате границата.'
    L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Изберете „Отказ“, за да отмените промените.'
    const key = result ? `result:${result.createdAt}` : selected ? `selected:${selected.placeId}` : 'default'
    if (key === previousKey.current) return
    previousKey.current = key
    if (result) {
      const layer = L.geoJSON(result.boundary)
      map.fitBounds(layer.getBounds(), { padding: [28, 28], maxZoom: 16 })
    } else if (selected) {
      map.flyTo([selected.lat, selected.lon], 14, { duration: 0.8 })
    } else {
      map.setView([42.72, 25.48], 7)
    }
  }, [map, result, selected])
  return null
}

function BoundaryEditor({ boundary, onChange }: { boundary: PolygonFeature; onChange: (boundary: PolygonFeature) => void }) {
  const map = useMap()
  useEffect(() => {
    const group = new L.FeatureGroup()
    L.geoJSON(boundary).eachLayer((layer) => group.addLayer(layer))
    group.addTo(map)
    const editor = new L.EditToolbar.Edit(map as unknown as L.DrawMap, { featureGroup: group })
    editor.enable()
    const publishBoundary = () => {
      const edited = group.toGeoJSON() as GeoJSON.FeatureCollection
      const feature = edited.features[0]
      if (feature && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) onChange(feature as PolygonFeature)
    }
    map.on(L.Draw.Event.EDITVERTEX, publishBoundary)
    map.on(L.Draw.Event.EDITMOVE, publishBoundary)
    map.on(L.Draw.Event.EDITRESIZE, publishBoundary)
    map.on(L.Draw.Event.EDITED, publishBoundary)
    return () => {
      editor.disable()
      map.off(L.Draw.Event.EDITVERTEX, publishBoundary)
      map.off(L.Draw.Event.EDITMOVE, publishBoundary)
      map.off(L.Draw.Event.EDITRESIZE, publishBoundary)
      map.off(L.Draw.Event.EDITED, publishBoundary)
      group.removeFrom(map)
    }
  }, [boundary, map, onChange])
  return null
}

function poiLabel(tags: Record<string, string>) {
  if (tags.name) return tags.name
  const labels: Record<string, string> = {
    school: 'Училище', kindergarten: 'Детска градина', townhall: 'Кметство', clinic: 'Медицински обект',
    doctors: 'Лекарски кабинет', hospital: 'Болница', pharmacy: 'Аптека', place_of_worship: 'Храм',
    community_centre: 'Читалище / обществен център', library: 'Библиотека', sports_centre: 'Спортен обект',
    parking: 'Обществен паркинг', grave_yard: 'Гробище',
  }
  return labels[tags.amenity] || (tags.sport ? 'Спортен обект' : 'Обществен обект')
}

export function MapView({ selected, result, visible, editing, onBoundaryEdited }: Props) {
  const layers = useMemo(() => result?.categories.filter((category) => visible[category.key]) ?? [], [result, visible])
  return (
    <MapContainer className="map" center={[42.72, 25.48]} zoom={7} zoomControl={false} preferCanvas>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <ZoomControl position="topright" zoomInTitle="Увеличи мащаба" zoomOutTitle="Намали мащаба" />
      <FitMap selected={selected} result={result} />
      {layers.map((category) => category.geometry && (
        <GeoJSON
          key={`${result?.createdAt}-${category.key}`}
          data={category.geometry}
          style={{ color: category.color, fillColor: category.color, fillOpacity: category.key === 'roads' ? 0.82 : 0.62, weight: category.key === 'roads' ? 1 : 0.7 }}
        />
      ))}
      {result && visible.buildings && (
        <GeoJSON key={`buildings-${result.createdAt}`} data={result.buildings} style={{ color: '#545b57', fillColor: '#f3f1e8', fillOpacity: 0.86, weight: 0.55 }} />
      )}
      {result && visible.boundary && !editing && (
        <GeoJSON key={`boundary-${result.createdAt}`} data={result.boundary} style={{ color: '#17683a', fillOpacity: 0, weight: 3 }} />
      )}
      {result && visible.pois && result.pois.features.map((feature, index) => {
        const [lon, lat] = feature.geometry.coordinates
        const tags = tagsOf(feature)
        return (
          <CircleMarker key={`poi-${index}`} center={[lat, lon]} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: '#17683a', fillOpacity: 1 }}>
            <Popup><strong>{poiLabel(tags)}</strong>{tags['addr:street'] ? <><br />{tags['addr:street']}</> : null}</Popup>
          </CircleMarker>
        )
      })}
      {!result && selected && (
        <CircleMarker center={[selected.lat, selected.lon]} radius={8} pathOptions={{ color: '#fff', weight: 3, fillColor: '#17683a', fillOpacity: 1 }}>
          <Popup>{selected.name}</Popup>
        </CircleMarker>
      )}
      {result && editing && <BoundaryEditor boundary={result.boundary} onChange={onBoundaryEdited} />}
    </MapContainer>
  )
}
