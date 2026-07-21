import React, { useState } from 'react'
import type { StepProps } from '../InspeccionShell'
import { DIRECTORES } from '../../../data/mockData'

export default function DirectorTecnicoStep({ onNext, onPrev }: StepProps) {
  const [valores, setValores] = useState<Record<string, number | undefined>>({})

  const getEstado = (id: string, declarado: number) => {
    const obs = valores[id]
    if (obs === undefined) return 'neutral'
    if (obs < declarado) return 'danger'
    return 'ok'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div className="ios-section-header">Dirección Técnica</div>

      <div className="ios-card-group">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px', padding: '8px var(--space-4)', background: 'var(--ios-gray6)', borderBottom: '1px solid var(--ios-gray5)' }}>
          {['Rol', 'Decl.', 'Obs.'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--ios-gray)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
          ))}
        </div>

        {DIRECTORES.map((d, idx) => {
          const estado = getEstado(d.id, d.declarado)
          return (
            <div key={d.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 70px 70px', alignItems: 'center',
              padding: '14px var(--space-4)',
              borderBottom: idx < DIRECTORES.length - 1 ? '1px solid var(--ios-gray5)' : 'none',
              background: estado === 'danger' ? 'rgba(255,59,48,0.04)' : 'white',
            }}>
              <div>
                <div style={{ fontSize: 15, color: 'var(--color-gray-800)', fontWeight: 500 }}>{d.rol}</div>
                <div style={{ fontSize: 11, color: 'var(--ios-purple)', fontWeight: 700, marginTop: 2 }}>{d.servicio}</div>
                {estado === 'danger' && <div style={{ fontSize: 11, color: 'var(--ios-red)', fontWeight: 600, marginTop: 2 }}>Director no designado — Irregularidad</div>}
              </div>
              <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, color: 'var(--color-gray-600)' }}>{d.declarado}</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="number" min={0}
                  value={valores[d.id] ?? ''}
                  onChange={e => setValores(prev => ({ ...prev, [d.id]: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  placeholder={String(d.declarado)}
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

      <div className="ios-card-group" style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontSize: 14, color: 'var(--ios-gray)', lineHeight: 1.5 }}>
          ℹ️ La ausencia de designación de uno o más directores técnicos implica una <strong>irregularidad</strong>, independientemente de la cantidad de personal operativo verificado.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button className="btn-ios btn-ios-gray" onClick={onPrev} style={{ width: 'auto', padding: '14px 24px' }}>← Anterior</button>
        <button className="btn-ios btn-ios-primary" onClick={onNext} style={{ flex: 1 }}>Continuar →</button>
      </div>
    </div>
  )
}
