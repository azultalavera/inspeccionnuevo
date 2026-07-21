import React, { useState } from 'react'
import type { StepProps } from '../InspeccionShell'
import { DATOS_GENERALES, type ItemDatosGenerales } from '../../../data/mockData'

interface ObsModalState {
  itemId: string | null
  label: string
  observacion: string
}

export default function DatosGeneralesStep({ onNext, onPrev }: StepProps) {
  const [valores, setValores] = useState<Record<string, boolean | undefined>>({})
  const [observaciones, setObservaciones] = useState<Record<string, string>>({})
  const [obsModal, setObsModal] = useState<ObsModalState>({ itemId: null, label: '', observacion: '' })

  const items = DATOS_GENERALES.filter(d => d.tipo === 'SI_NO')
  const subsecciones = DATOS_GENERALES.filter(d => d.tipo === 'SUBSECCION')

  const secciones = subsecciones.map(sub => ({
    sub,
    items: items.filter(i => i.seccion === sub.seccion),
  }))

  const handleToggle = (id: string, val: boolean) => {
    setValores(prev => ({ ...prev, [id]: val }))
    if (!val) {
      // Abrir modal de obs si marca NO
      const item = DATOS_GENERALES.find(d => d.id === id)!
      setObsModal({ itemId: id, label: item.label, observacion: observaciones[id] ?? '' })
    }
  }

  const countIrregularidades = items.filter(i => valores[i.id] === false).length
  const countCriticas = items.filter(i => i.esCritico && valores[i.id] === false).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Summary badge */}
      {countIrregularidades > 0 && (
        <div className="alert alert-danger" style={{ borderRadius: 'var(--radius-xl)' }}>
          <span className="alert-icon">⚠️</span>
          <div>
            <div className="alert-title">{countIrregularidades} irregularidad{countIrregularidades > 1 ? 'es' : ''} detectada{countIrregularidades > 1 ? 's' : ''}</div>
            {countCriticas > 0 && <div style={{ fontSize: 13 }}>{countCriticas} ítem{countCriticas > 1 ? 's' : ''} crítico{countCriticas > 1 ? 's' : ''} — dictamen sugerido: <strong>No Aprueba</strong></div>}
          </div>
        </div>
      )}

      {/* Secciones */}
      {secciones.map(({ sub, items: secItems }) => (
        <div key={sub.id}>
          <div className="ios-section-header">{sub.label}</div>

          <div className="ios-card-group">
            {secItems.map((item, idx) => {
              const val = valores[item.id]
              const hasObs = !!observaciones[item.id]
              const isIrregular = val === false

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: '14px var(--space-4)',
                    borderBottom: idx < secItems.length - 1 ? '1px solid var(--ios-gray5)' : 'none',
                    background: isIrregular ? 'rgba(255, 59, 48, 0.04)' : 'white',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Status icon */}
                  <div className={`irreg-icon ${
                    val === undefined ? 'irreg-icon-neutral' :
                    val === true ? 'irreg-icon-success' :
                    item.esCritico ? 'irreg-icon-danger' : 'irreg-icon-warning'
                  }`}>
                    {val === undefined ? '—' : val ? '✓' : item.esCritico ? '🔴' : '⚠️'}
                  </div>

                  {/* Label */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 15,
                      color: 'var(--color-gray-800)',
                      fontWeight: isIrregular ? 600 : 400,
                      marginBottom: 2,
                    }}>
                      {item.label}
                      {item.esCritico && (
                        <span style={{
                          display: 'inline-block',
                          marginLeft: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          background: 'var(--color-danger-light)',
                          color: 'var(--color-danger)',
                          borderRadius: 4,
                          padding: '1px 5px',
                          verticalAlign: 'middle',
                        }}>
                          CRÍTICO
                        </span>
                      )}
                    </div>
                    {hasObs && (
                      <div style={{ fontSize: 12, color: 'var(--ios-gray)', fontStyle: 'italic' }}>
                        📝 {observaciones[item.id]}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                    {/* Obs button */}
                    <button
                      onClick={() => setObsModal({ itemId: item.id, label: item.label, observacion: observaciones[item.id] ?? '' })}
                      style={{
                        width: 32, height: 32,
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: hasObs ? 'rgba(0,122,255,0.12)' : 'var(--ios-gray6)',
                        color: hasObs ? 'var(--ios-blue)' : 'var(--ios-gray)',
                        cursor: 'pointer',
                        fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      title="Agregar observación"
                    >
                      💬
                    </button>

                    {/* SI/NO toggle */}
                    <div className="sn-toggle">
                      <button
                        className={val === true ? 'active-si' : ''}
                        onClick={() => handleToggle(item.id, true)}
                      >
                        SÍ
                      </button>
                      <button
                        className={val === false ? 'active-no' : ''}
                        onClick={() => handleToggle(item.id, false)}
                      >
                        NO
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
        <button className="btn-ios btn-ios-gray" onClick={onPrev} style={{ width: 'auto', padding: '14px 24px' }}>
          ← Anterior
        </button>
        <button className="btn-ios btn-ios-primary" onClick={onNext} style={{ flex: 1 }}>
          Continuar →
        </button>
      </div>

      {/* Observation Modal */}
      {obsModal.itemId !== null && (
        <div className="ios-sheet-overlay" onClick={() => setObsModal(prev => ({ ...prev, itemId: null }))}>
          <div className="ios-sheet" onClick={e => e.stopPropagation()}>
            <div className="ios-sheet-handle" />
            <div className="ios-sheet-header">
              <div className="ios-sheet-title">💬 Observación</div>
              <div style={{ fontSize: 13, color: 'var(--ios-gray)', marginTop: 4 }}>{obsModal.label}</div>
            </div>
            <div className="ios-sheet-body">
              <textarea
                className="ios-input"
                rows={5}
                placeholder="Ingresá la observación para este ítem..."
                value={obsModal.observacion}
                onChange={e => setObsModal(prev => ({ ...prev, observacion: e.target.value }))}
                style={{
                  borderRadius: 'var(--radius-xl)',
                  resize: 'none',
                  fontSize: 16,
                  fontFamily: 'var(--font-family)',
                  padding: 'var(--space-4)',
                  border: 'none',
                  width: '100%',
                  background: 'white',
                  outline: 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              />
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button
                  className="btn-ios btn-ios-gray"
                  onClick={() => setObsModal(prev => ({ ...prev, itemId: null }))}
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancelar
                </button>
                <button
                  className="btn-ios btn-ios-primary"
                  onClick={() => {
                    if (obsModal.itemId) {
                      setObservaciones(prev => ({ ...prev, [obsModal.itemId!]: obsModal.observacion }))
                    }
                    setObsModal(prev => ({ ...prev, itemId: null }))
                  }}
                  style={{ flex: 2, padding: '12px' }}
                >
                  Guardar Observación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
