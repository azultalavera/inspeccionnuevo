import React, { useState } from 'react'
import type { StepProps } from '../InspeccionShell'
import { EQUIPAMIENTO } from '../../../data/mockData'

export default function EquipamientoStep({ onNext, onPrev }: StepProps) {
  const [valores, setValores] = useState<Record<string, number | undefined>>({})
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const servicios = [...new Set(EQUIPAMIENTO.map(e => e.servicio))]

  const getEstado = (id: string, declarado: number) => {
    const obs = valores[id]
    if (obs === undefined) return 'neutral'
    if (obs < declarado) return 'danger'
    return 'ok'
  }

  const countIrregs = EQUIPAMIENTO.filter(e => {
    const obs = valores[e.id]
    return obs !== undefined && obs < e.declarado
  }).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {countIrregs > 0 && (
        <div className="alert alert-danger" style={{ borderRadius: 'var(--radius-xl)' }}>
          <span className="alert-icon">🩺</span>
          <div>
            <div className="alert-title">{countIrregs} faltante{countIrregs > 1 ? 's' : ''} de equipamiento detectado{countIrregs > 1 ? 's' : ''}</div>
          </div>
        </div>
      )}

      <div className="ios-section-header">Equipamiento por Servicio</div>

      {servicios.map(svc => {
        const items = EQUIPAMIENTO.filter(e => e.servicio === svc)
        const irregsEnSvc = items.filter(e => getEstado(e.id, e.declarado) === 'danger').length
        return (
          <div key={svc} style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: irregsEnSvc > 0 ? '1.5px solid var(--color-danger-light)' : '1px solid var(--ios-gray5)',
          }}>
            <button
              onClick={() => setOpenAccordion(openAccordion === svc ? null : svc)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-family)',
              }}
            >
              <div style={{ fontSize: 20 }}>{svc === 'Otros' ? '📦' : '🏥'}</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)' }}>{svc}</div>
                <div style={{ fontSize: 12, color: 'var(--ios-gray)', marginTop: 2 }}>{items.length} ítem{items.length > 1 ? 's' : ''}</div>
              </div>
              {irregsEnSvc > 0 && (
                <span className="badge badge-danger">{irregsEnSvc} faltante{irregsEnSvc > 1 ? 's' : ''}</span>
              )}
              <span style={{
                fontSize: 14, color: 'var(--ios-gray)',
                transform: openAccordion === svc ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease',
                display: 'inline-block',
              }}>▶</span>
            </button>

            {openAccordion === svc && (
              <div>
                {/* Table header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 80px 36px',
                  padding: '8px var(--space-4)',
                  background: 'var(--ios-gray6)',
                  borderTop: '1px solid var(--ios-gray5)',
                }}>
                  {['Equipo', 'Decl.', 'Obs.', ''].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--ios-gray)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                  ))}
                </div>

                {items.map((eq, idx) => {
                  const estado = getEstado(eq.id, eq.declarado)
                  return (
                    <div key={eq.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px 80px 36px',
                      alignItems: 'center',
                      padding: '12px var(--space-4)',
                      borderTop: '1px solid var(--ios-gray5)',
                      background: estado === 'danger' ? 'rgba(255,59,48,0.04)' : 'white',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div className={`irreg-icon ${estado === 'danger' ? 'irreg-icon-danger' : estado === 'ok' ? 'irreg-icon-success' : 'irreg-icon-neutral'}`} style={{ width: 24, height: 24, fontSize: 12 }}>
                          {estado === 'danger' ? '✗' : estado === 'ok' ? '✓' : '—'}
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--color-gray-800)' }}>{eq.nombre}</span>
                      </div>

                      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 16, color: 'var(--color-gray-700)' }}>
                        {eq.declarado}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <input
                          type="number"
                          min={0}
                          value={valores[eq.id] ?? ''}
                          onChange={e => {
                            const v = e.target.value === '' ? undefined : Number(e.target.value)
                            setValores(prev => ({ ...prev, [eq.id]: v }))
                          }}
                          placeholder={String(eq.declarado)}
                          style={{
                            width: 60,
                            textAlign: 'center',
                            padding: '6px 4px',
                            border: `2px solid ${estado === 'danger' ? 'var(--ios-red)' : estado === 'ok' ? 'var(--ios-green)' : 'var(--ios-gray4)'}`,
                            borderRadius: 10,
                            fontFamily: 'var(--font-family)',
                            fontSize: 16,
                            fontWeight: 700,
                            background: estado === 'danger' ? 'rgba(255,59,48,0.08)' : estado === 'ok' ? 'rgba(52,199,89,0.08)' : 'white',
                            color: estado === 'danger' ? 'var(--ios-red)' : estado === 'ok' ? 'var(--ios-green)' : 'var(--color-gray-800)',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <button style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--ios-gray6)', cursor: 'pointer', fontSize: 14, color: 'var(--ios-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        💬
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button className="btn-ios btn-ios-gray" onClick={onPrev} style={{ width: 'auto', padding: '14px 24px' }}>← Anterior</button>
        <button className="btn-ios btn-ios-primary" onClick={onNext} style={{ flex: 1 }}>Continuar →</button>
      </div>
    </div>
  )
}
