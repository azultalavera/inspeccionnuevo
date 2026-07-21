import React, { useState } from 'react'
import type { StepProps } from '../InspeccionShell'
import { SERVICIOS } from '../../../data/mockData'

export default function ServiciosStep({ onNext, onPrev }: StepProps) {
  const [servicios, setServicios] = useState(SERVICIOS.map(s => ({ ...s, observado: s.declarado, subareas: (s.subareas ?? []).map(sa => ({ ...sa })) })))
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [obsModal, setObsModal] = useState<{ id: string; label: string; obs: string } | null>(null)
  const [observaciones, setObservaciones] = useState<Record<string, string>>({})

  const irregularidades = servicios.filter(s => s.declarado && !s.observado).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {irregularidades > 0 && (
        <div className="alert alert-danger" style={{ borderRadius: 'var(--radius-xl)' }}>
          <span className="alert-icon">⚠️</span>
          <div>
            <div className="alert-title">{irregularidades} servicio{irregularidades > 1 ? 's' : ''} no encontrado{irregularidades > 1 ? 's' : ''}</div>
            <div style={{ fontSize: 13 }}>Los servicios declarados no presentes físicamente son irregularidades.</div>
          </div>
        </div>
      )}

      {/* Tabla de servicios */}
      <div className="ios-section-header">Existencia de Servicios Declarados</div>

      <div className="ios-card-group">
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 80px 44px',
          gap: 'var(--space-2)',
          padding: '10px var(--space-4)',
          background: 'var(--ios-gray6)',
          borderBottom: '1px solid var(--ios-gray5)',
        }}>
          {['Servicio', 'Declarado', 'Observado', 'Obs.'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--ios-gray)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
          ))}
        </div>

        {servicios.map((srv, idx) => {
          const isIrregular = srv.declarado && !srv.observado
          const hasObs = !!observaciones[srv.id]
          return (
            <div key={srv.id} style={{ borderBottom: idx < servicios.length - 1 ? '1px solid var(--ios-gray5)' : 'none' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px 44px',
                gap: 'var(--space-2)',
                padding: '12px var(--space-4)',
                alignItems: 'center',
                background: isIrregular ? 'rgba(255, 59, 48, 0.04)' : 'white',
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: isIrregular ? 600 : 400, color: 'var(--color-gray-800)' }}>
                    {srv.nombre}
                  </div>
                  {hasObs && (
                    <div style={{ fontSize: 11, color: 'var(--ios-gray)', fontStyle: 'italic', marginTop: 2 }}>
                      📝 {observaciones[srv.id]}
                    </div>
                  )}
                </div>

                {/* Declarado badge */}
                <div style={{ textAlign: 'center' }}>
                  <span className={`badge ${srv.declarado ? 'badge-success' : 'badge-neutral'}`}>
                    {srv.declarado ? 'SÍ' : 'NO'}
                  </span>
                </div>

                {/* Observado toggle */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {srv.declarado ? (
                    <div className="sn-toggle" style={{ transform: 'scale(0.85)' }}>
                      <button
                        className={srv.observado ? 'active-si' : ''}
                        onClick={() => setServicios(prev => prev.map(s => s.id === srv.id ? { ...s, observado: true } : s))}
                      >SÍ</button>
                      <button
                        className={!srv.observado ? 'active-no' : ''}
                        onClick={() => {
                          setServicios(prev => prev.map(s => s.id === srv.id ? { ...s, observado: false } : s))
                          setObsModal({ id: srv.id, label: srv.nombre, obs: observaciones[srv.id] ?? '' })
                        }}
                      >NO</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--ios-gray)' }}>N/A</span>
                  )}
                </div>

                {/* Obs button */}
                <button
                  onClick={() => setObsModal({ id: srv.id, label: srv.nombre, obs: observaciones[srv.id] ?? '' })}
                  style={{
                    width: 36, height: 36,
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: hasObs ? 'rgba(0,122,255,0.12)' : 'var(--ios-gray6)',
                    color: hasObs ? 'var(--ios-blue)' : 'var(--ios-gray)',
                    cursor: 'pointer',
                    fontSize: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  💬
                </button>
              </div>

              {/* Acordeón de sub-áreas */}
              {srv.tieneSubareas && srv.subareas && srv.subareas.length > 0 && (
                <div style={{ borderTop: '1px solid var(--ios-gray5)', background: 'var(--ios-gray6)' }}>
                  <button
                    onClick={() => setOpenAccordion(openAccordion === srv.id ? null : srv.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: '10px var(--space-4)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-family)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--ios-blue)',
                    }}
                  >
                    <span style={{ transform: openAccordion === srv.id ? 'rotate(90deg)' : 'rotate(0)', display: 'inline-block', transition: 'transform 0.2s ease' }}>▶</span>
                    Sub-áreas técnicas ({srv.subareas.length} ítems)
                  </button>

                  {openAccordion === srv.id && (
                    <div style={{ padding: '0 var(--space-4) var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {srv.subareas.map(sa => (
                        <div key={sa.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-3)',
                          background: 'white',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--ios-gray5)',
                        }}>
                          <div style={{ flex: 1, fontSize: 14, color: 'var(--color-gray-700)' }}>
                            {sa.nombre}
                            {sa.esCritico && <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 4, padding: '1px 4px', fontWeight: 700 }}>CRÍTICO</span>}
                          </div>
                          {sa.tipo === 'SI_NO' ? (
                            <div className="sn-toggle" style={{ transform: 'scale(0.8)' }}>
                              <button className={sa.cumple === true ? 'active-si' : ''}>SÍ</button>
                              <button className={sa.cumple === false ? 'active-no' : ''}>NO</button>
                            </div>
                          ) : (
                            <div className="num-input-wrap">
                              <span style={{ fontSize: 12, color: 'var(--ios-gray)' }}>Decl: {sa.declarado}</span>
                              <input type="number" defaultValue={sa.declarado} min={0} style={{ width: 56 }} className="form-input form-input-sm" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button className="btn-ios btn-ios-gray" onClick={onPrev} style={{ width: 'auto', padding: '14px 24px' }}>← Anterior</button>
        <button className="btn-ios btn-ios-primary" onClick={onNext} style={{ flex: 1 }}>Continuar →</button>
      </div>

      {/* Obs Modal */}
      {obsModal && (
        <div className="ios-sheet-overlay" onClick={() => setObsModal(null)}>
          <div className="ios-sheet" onClick={e => e.stopPropagation()}>
            <div className="ios-sheet-handle" />
            <div className="ios-sheet-header">
              <div className="ios-sheet-title">💬 Observación</div>
              <div style={{ fontSize: 13, color: 'var(--ios-gray)', marginTop: 4 }}>{obsModal.label}</div>
            </div>
            <div className="ios-sheet-body">
              <textarea
                rows={4}
                value={obsModal.obs}
                onChange={e => setObsModal(prev => prev ? { ...prev, obs: e.target.value } : null)}
                placeholder="Observación del inspector..."
                style={{ width: '100%', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', border: 'none', background: 'white', fontFamily: 'var(--font-family)', fontSize: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', resize: 'none', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button className="btn-ios btn-ios-gray" onClick={() => setObsModal(null)} style={{ flex: 1, padding: '12px' }}>Cancelar</button>
                <button className="btn-ios btn-ios-primary" onClick={() => {
                  setObservaciones(prev => ({ ...prev, [obsModal.id]: obsModal.obs }))
                  setObsModal(null)
                }} style={{ flex: 2, padding: '12px' }}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
