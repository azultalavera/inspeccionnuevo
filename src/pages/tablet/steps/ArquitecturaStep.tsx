import React, { useState } from 'react'
import type { StepProps } from '../InspeccionShell'

const DOCUMENTOS_ARCH = [
  { id: 'A1', servicio: 'Guardia Médica', url: 'plano_guardia.pdf' },
  { id: 'A2', servicio: 'Internación General', url: 'plano_internacion.pdf' },
  { id: 'A3', servicio: 'Diagnóstico por Imágenes', url: 'plano_dxi.pdf' },
]

const ITEMS_ARCH = [
  { id: 'AQ1', servicio: 'Guardia Médica', label: 'Corresponde con plano declarado' },
  { id: 'AQ2', servicio: 'Guardia Médica', label: 'Dimensiones reglamentarias' },
  { id: 'AQ3', servicio: 'Internación General', label: 'Circulación adecuada entre camas' },
  { id: 'AQ4', servicio: 'Diagnóstico por Imágenes', label: 'Sala plomada según plano' },
  { id: 'AQ5', servicio: 'Diagnóstico por Imágenes', label: 'Ventilación declarada instalada' },
]

export default function ArquitecturaStep({ onNext, onPrev }: StepProps) {
  const [valores, setValores] = useState<Record<string, boolean | undefined>>({})
  const [openSvc, setOpenSvc] = useState<string | null>(null)

  const servicios = [...new Set(ITEMS_ARCH.map(i => i.servicio))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Documents table */}
      <div className="ios-section-header">Planos Declarados</div>
      <div className="ios-card-group">
        {DOCUMENTOS_ARCH.map((doc, idx) => (
          <div key={doc.id} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: '12px var(--space-4)',
            borderBottom: idx < DOCUMENTOS_ARCH.length - 1 ? '1px solid var(--ios-gray5)' : 'none',
          }}>
            <div style={{ fontSize: 22 }}>📐</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: 'var(--color-gray-800)' }}>{doc.servicio}</div>
              <div style={{ fontSize: 12, color: 'var(--ios-gray)' }}>{doc.url}</div>
            </div>
            <button style={{
              padding: '8px 14px', borderRadius: 10, border: 'none',
              background: 'rgba(0,122,255,0.1)', color: 'var(--ios-blue)',
              fontFamily: 'var(--font-family)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              👁 Ver
            </button>
          </div>
        ))}
      </div>

      {/* Architecture items per service */}
      <div className="ios-section-header">Verificación por Servicio</div>

      {servicios.map(svc => {
        const items = ITEMS_ARCH.filter(i => i.servicio === svc)
        const irregs = items.filter(i => valores[i.id] === false).length
        return (
          <div key={svc} style={{
            background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: irregs > 0 ? '1.5px solid var(--color-danger-light)' : '1px solid var(--ios-gray5)',
          }}>
            <button onClick={() => setOpenSvc(openSvc === svc ? null : svc)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)',
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)',
            }}>
              <span style={{ fontSize: 20 }}>🏗️</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{svc}</div>
                <div style={{ fontSize: 12, color: 'var(--ios-gray)', marginTop: 2 }}>{items.length} criterio{items.length > 1 ? 's' : ''}</div>
              </div>
              {irregs > 0 && <span className="badge badge-danger">{irregs} irregularidad{irregs > 1 ? 'es' : ''}</span>}
              <span style={{ fontSize: 14, color: 'var(--ios-gray)', transform: openSvc === svc ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s ease', display: 'inline-block' }}>▶</span>
            </button>

            {openSvc === svc && items.map((item, idx) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: '12px var(--space-4)',
                borderTop: '1px solid var(--ios-gray5)',
                background: valores[item.id] === false ? 'rgba(255,59,48,0.04)' : 'white',
              }}>
                <div className={`irreg-icon ${valores[item.id] === undefined ? 'irreg-icon-neutral' : valores[item.id] ? 'irreg-icon-success' : 'irreg-icon-danger'}`} style={{ width: 24, height: 24, fontSize: 12 }}>
                  {valores[item.id] === undefined ? '—' : valores[item.id] ? '✓' : '✗'}
                </div>
                <div style={{ flex: 1, fontSize: 14, color: 'var(--color-gray-800)' }}>{item.label}</div>
                <div className="sn-toggle" style={{ transform: 'scale(0.85)' }}>
                  <button className={valores[item.id] === true ? 'active-si' : ''} onClick={() => setValores(p => ({ ...p, [item.id]: true }))}>SÍ</button>
                  <button className={valores[item.id] === false ? 'active-no' : ''} onClick={() => setValores(p => ({ ...p, [item.id]: false }))}>NO</button>
                </div>
              </div>
            ))}
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
