import React, { useState } from 'react'
import type { StepProps } from '../InspeccionShell'
import { PERSONAL } from '../../../data/mockData'

export default function PlantelStep({ onNext, onPrev }: StepProps) {
  const [valores, setValores] = useState<Record<string, number | undefined>>({})
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const servicios = [...new Set(PERSONAL.map(p => p.servicio))]

  const getEstado = (id: string, declarado: number, esJefe: boolean) => {
    const obs = valores[id]
    if (obs === undefined) return 'neutral'
    if (esJefe && obs < 1) return 'danger'
    if (obs < declarado) return 'danger'
    return 'ok'
  }

  const countIrregs = PERSONAL.filter(p => {
    const obs = valores[p.id]
    if (obs === undefined) return false
    return (p.esJefe && obs < 1) || obs < p.declarado
  }).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {countIrregs > 0 && (
        <div className="alert alert-danger" style={{ borderRadius: 'var(--radius-xl)' }}>
          <span className="alert-icon">👥</span>
          <div>
            <div className="alert-title">{countIrregs} irregularidad{countIrregs > 1 ? 'es' : ''} de personal</div>
            <div style={{ fontSize: 13 }}>Falta de personal mínimo declarado</div>
          </div>
        </div>
      )}

      <div className="ios-section-header">Plantel por Servicio</div>

      {servicios.map(svc => {
        const items = PERSONAL.filter(p => p.servicio === svc)
        const irregsEnSvc = items.filter(p => getEstado(p.id, p.declarado, p.esJefe) === 'danger').length

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
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)' }}
            >
              <div style={{ fontSize: 22 }}>👥</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)' }}>{svc}</div>
                <div style={{ fontSize: 12, color: 'var(--ios-gray)', marginTop: 2 }}>{items.length} rol{items.length > 1 ? 'es' : ''}</div>
              </div>
              {irregsEnSvc > 0 && <span className="badge badge-danger">{irregsEnSvc} irregularidad{irregsEnSvc > 1 ? 'es' : ''}</span>}
              <span style={{ fontSize: 14, color: 'var(--ios-gray)', transform: openAccordion === svc ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s ease', display: 'inline-block' }}>▶</span>
            </button>

            {openAccordion === svc && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px', padding: '8px var(--space-4)', background: 'var(--ios-gray6)', borderTop: '1px solid var(--ios-gray5)' }}>
                  {['Rol', 'Decl.', 'Obs.'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--ios-gray)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                  ))}
                </div>

                {items.map((p, idx) => {
                  const estado = getEstado(p.id, p.declarado, p.esJefe)
                  return (
                    <div key={p.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 70px 70px',
                      alignItems: 'center',
                      padding: '12px var(--space-4)',
                      borderTop: '1px solid var(--ios-gray5)',
                      background: estado === 'danger' ? 'rgba(255,59,48,0.04)' : 'white',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, color: 'var(--color-gray-800)' }}>
                          {p.rol}
                          {p.esJefe && <span style={{ marginLeft: 5, fontSize: 10, background: 'rgba(175,82,222,0.12)', color: 'var(--ios-purple)', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>JEFE</span>}
                        </div>
                        {estado === 'danger' && (
                          <div style={{ fontSize: 11, color: 'var(--ios-red)', fontWeight: 600, marginTop: 2 }}>
                            {p.esJefe && valores[p.id] === 0 ? 'Jefe de servicio no designado' : 'Cantidad insuficiente'}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, color: 'var(--color-gray-600)' }}>{p.declarado}</div>

                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <input
                          type="number"
                          min={0}
                          value={valores[p.id] ?? ''}
                          onChange={e => {
                            const v = e.target.value === '' ? undefined : Number(e.target.value)
                            setValores(prev => ({ ...prev, [p.id]: v }))
                          }}
                          placeholder={String(p.declarado)}
                          style={{
                            width: 60, textAlign: 'center', padding: '6px 4px',
                            border: `2px solid ${estado === 'danger' ? 'var(--ios-red)' : estado === 'ok' ? 'var(--ios-green)' : 'var(--ios-gray4)'}`,
                            borderRadius: 10, fontFamily: 'var(--font-family)', fontSize: 17, fontWeight: 700, outline: 'none', background: 'white',
                            color: estado === 'danger' ? 'var(--ios-red)' : estado === 'ok' ? 'var(--ios-green)' : 'var(--color-gray-800)',
                          }}
                        />
                      </div>
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
