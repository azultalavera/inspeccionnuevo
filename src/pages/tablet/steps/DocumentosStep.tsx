import React, { useState } from 'react'
import type { StepProps } from '../InspeccionShell'
import { DOCUMENTOS } from '../../../data/mockData'

export default function DocumentosStep({ onNext, onPrev }: StepProps) {
  const [estados, setEstados] = useState<Record<string, boolean | undefined>>({})
  const [notas, setNotas] = useState<Record<string, string>>({})
  const [notaOpen, setNotaOpen] = useState<string | null>(null)

  const categorias = [...new Set(DOCUMENTOS.map(d => d.categoria))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div className="ios-section-header">Validación de Documentos Adjuntos</div>

      {categorias.map(cat => {
        const docs = DOCUMENTOS.filter(d => d.categoria === cat)
        return (
          <div key={cat}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-gray-700)', padding: 'var(--space-2) var(--space-2)', marginBottom: 'var(--space-2)' }}>
              {cat}
            </div>
            <div className="ios-card-group">
              {docs.map((doc, idx) => {
                const estado = estados[doc.id]
                const nota = notas[doc.id]
                return (
                  <div key={doc.id}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      padding: '12px var(--space-4)',
                      borderBottom: (notaOpen === doc.id || idx < docs.length - 1) ? '1px solid var(--ios-gray5)' : 'none',
                      background: estado === false ? 'rgba(255,59,48,0.04)' : 'white',
                    }}>
                      <div style={{ fontSize: 22 }}>📄</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: 'var(--color-gray-800)', fontWeight: estado === false ? 600 : 400 }}>{doc.nombre}</div>
                        {nota && <div style={{ fontSize: 11, color: 'var(--ios-gray)', fontStyle: 'italic', marginTop: 2 }}>📝 {nota}</div>}
                      </div>

                      <button style={{
                        padding: '6px 10px', borderRadius: 8, border: 'none',
                        background: 'rgba(0,122,255,0.1)', color: 'var(--ios-blue)',
                        fontFamily: 'var(--font-family)', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                      }}>
                        👁
                      </button>

                      <button onClick={() => setNotaOpen(notaOpen === doc.id ? null : doc.id)} style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none',
                        background: nota ? 'rgba(0,122,255,0.12)' : 'var(--ios-gray6)',
                        color: nota ? 'var(--ios-blue)' : 'var(--ios-gray)',
                        cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>💬</button>

                      <div className="sn-toggle" style={{ transform: 'scale(0.8)', flexShrink: 0 }}>
                        <button className={estado === true ? 'active-si' : ''} onClick={() => setEstados(p => ({ ...p, [doc.id]: true }))}>SÍ</button>
                        <button className={estado === false ? 'active-no' : ''} onClick={() => setEstados(p => ({ ...p, [doc.id]: false }))}>NO</button>
                      </div>
                    </div>

                    {notaOpen === doc.id && (
                      <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--ios-gray6)', borderBottom: '1px solid var(--ios-gray5)' }}>
                        <textarea
                          rows={3}
                          value={notas[doc.id] ?? ''}
                          onChange={e => setNotas(p => ({ ...p, [doc.id]: e.target.value }))}
                          placeholder="Motivo de rechazo o notas..."
                          style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 12, border: 'none', fontFamily: 'var(--font-family)', fontSize: 14, background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', resize: 'none', outline: 'none' }}
                        />
                        <button onClick={() => setNotaOpen(null)} style={{ marginTop: 8, padding: '6px 16px', borderRadius: 8, border: 'none', background: 'var(--ios-blue)', color: 'white', fontFamily: 'var(--font-family)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          Guardar nota
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
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
