import React, { useState } from 'react'
import type { StepProps } from '../InspeccionShell'
import { SALAS, CAMAS } from '../../../data/mockData'

type EstadoItem = 'OK' | 'IRREGULARIDAD' | 'RECTIFICACION' | undefined

function getEstado(declarado: number, observado?: number): EstadoItem {
  if (observado === undefined) return undefined
  if (observado > declarado) return 'IRREGULARIDAD'
  if (observado < declarado) return 'RECTIFICACION'
  return 'OK'
}

interface RowState { observado?: number }

export default function SalasCamasStep({ onNext, onPrev }: StepProps) {
  const [salas, setSalas] = useState<Record<string, RowState>>({})
  const [camas, setCamas] = useState<Record<string, RowState>>({})

  const countIrregs = [
    ...SALAS.map(s => getEstado(s.declarado, salas[s.id]?.observado)),
    ...CAMAS.map(c => getEstado(c.declarado, camas[c.id]?.observado)),
  ].filter(e => e === 'IRREGULARIDAD').length

  const countRect = [
    ...SALAS.map(s => getEstado(s.declarado, salas[s.id]?.observado)),
    ...CAMAS.map(c => getEstado(c.declarado, camas[c.id]?.observado)),
  ].filter(e => e === 'RECTIFICACION').length

  const renderTable = (
    items: typeof SALAS,
    state: Record<string, RowState>,
    setState: React.Dispatch<React.SetStateAction<Record<string, RowState>>>,
    label: string
  ) => (
    <div>
      <div className="ios-section-header">{label}</div>
      <div className="ios-card-group">
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 70px 70px 36px',
          padding: '8px var(--space-4)',
          background: 'var(--ios-gray6)',
          borderBottom: '1px solid var(--ios-gray5)',
        }}>
          {['Nombre', 'Decl.', 'Obs.', ''].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--ios-gray)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
          ))}
        </div>

        {items.map((item, idx) => {
          const obs = state[item.id]?.observado
          const estado = getEstado(item.declarado, obs)
          return (
            <div key={item.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px 70px 36px',
              alignItems: 'center',
              padding: '12px var(--space-4)',
              borderBottom: idx < items.length - 1 ? '1px solid var(--ios-gray5)' : 'none',
              background:
                estado === 'IRREGULARIDAD' ? 'rgba(255,59,48,0.04)' :
                estado === 'RECTIFICACION' ? 'rgba(255,149,0,0.04)' : 'white',
            }}>
              {/* Name + status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div className={`irreg-icon ${
                  estado === 'IRREGULARIDAD' ? 'irreg-icon-danger' :
                  estado === 'RECTIFICACION' ? 'irreg-icon-warning' :
                  estado === 'OK' ? 'irreg-icon-success' : 'irreg-icon-neutral'
                }`} style={{ width: 24, height: 24, fontSize: 12, flexShrink: 0 }}>
                  {estado === 'IRREGULARIDAD' ? '🔺' : estado === 'RECTIFICACION' ? '🔽' : estado === 'OK' ? '✓' : '—'}
                </div>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--color-gray-800)' }}>{item.nombre}</div>
                  {estado === 'IRREGULARIDAD' && (
                    <div style={{ fontSize: 11, color: 'var(--ios-red)', fontWeight: 600 }}>Excede habilitación</div>
                  )}
                  {estado === 'RECTIFICACION' && (
                    <div style={{ fontSize: 11, color: 'var(--ios-orange)', fontWeight: 600 }}>Rectificación</div>
                  )}
                </div>
              </div>

              {/* Declarado */}
              <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, color: 'var(--color-gray-600)' }}>
                {item.declarado}
              </div>

              {/* Observado input */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="number"
                  min={0}
                  value={obs ?? ''}
                  onChange={e => {
                    const v = e.target.value === '' ? undefined : Number(e.target.value)
                    setState(prev => ({ ...prev, [item.id]: { ...prev[item.id], observado: v } }))
                  }}
                  placeholder={String(item.declarado)}
                  style={{
                    width: 60,
                    textAlign: 'center',
                    padding: '6px 4px',
                    border: `2px solid ${
                      estado === 'IRREGULARIDAD' ? 'var(--ios-red)' :
                      estado === 'RECTIFICACION' ? 'var(--ios-orange)' :
                      estado === 'OK' ? 'var(--ios-green)' : 'var(--ios-gray4)'
                    }`,
                    borderRadius: 10,
                    fontFamily: 'var(--font-family)',
                    fontSize: 17,
                    fontWeight: 700,
                    outline: 'none',
                    background: 'white',
                    color:
                      estado === 'IRREGULARIDAD' ? 'var(--ios-red)' :
                      estado === 'RECTIFICACION' ? 'var(--ios-orange)' :
                      estado === 'OK' ? 'var(--ios-green)' : 'var(--color-gray-800)',
                  }}
                />
              </div>

              {/* Obs icon */}
              <button style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--ios-gray6)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                💬
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Summary */}
      {(countIrregs > 0 || countRect > 0) && (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {countIrregs > 0 && (
            <div className="alert alert-danger" style={{ flex: 1, borderRadius: 'var(--radius-xl)' }}>
              <span>🔺</span>
              <div><div className="alert-title">{countIrregs} irregularidad{countIrregs > 1 ? 'es' : ''}</div><div style={{ fontSize: 12 }}>Excede habilitación</div></div>
            </div>
          )}
          {countRect > 0 && (
            <div className="alert alert-warning" style={{ flex: 1, borderRadius: 'var(--radius-xl)' }}>
              <span>🔽</span>
              <div><div className="alert-title">{countRect} rectificación{countRect > 1 ? 'es' : ''}</div><div style={{ fontSize: 12 }}>Menos de lo declarado</div></div>
            </div>
          )}
        </div>
      )}

      {renderTable(SALAS, salas, setSalas, 'Salas')}
      {renderTable(CAMAS, camas, setCamas, 'Camas y Puestos')}

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button className="btn-ios btn-ios-gray" onClick={onPrev} style={{ width: 'auto', padding: '14px 24px' }}>← Anterior</button>
        <button className="btn-ios btn-ios-primary" onClick={onNext} style={{ flex: 1 }}>Continuar →</button>
      </div>
    </div>
  )
}
