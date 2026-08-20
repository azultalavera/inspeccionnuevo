import React, { useState, useRef } from 'react'
import type { StepProps } from '../InspeccionShell'

interface Evidencia {
  id: string
  tipo: 'foto' | 'obs'
  contenido: string
  vinculo?: string
  timestamp: string
}

export default function EvidenciaStep({ onNext, onPrev }: StepProps) {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([])
  const [obsGeneral, setObsGeneral] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const nueva: Evidencia = {
        id: Date.now().toString(),
        tipo: 'foto',
        contenido: ev.target?.result as string,
        vinculo: 'Observación General',
        timestamp: new Date().toLocaleTimeString('es-AR'),
      }
      setEvidencias(prev => [...prev, nueva])
    }
    reader.readAsDataURL(file)
  }

  const agregarObs = () => {
    if (!obsGeneral.trim()) return
    const nueva: Evidencia = {
      id: Date.now().toString(),
      tipo: 'obs',
      contenido: obsGeneral,
      timestamp: new Date().toLocaleTimeString('es-AR'),
    }
    setEvidencias(prev => [...prev, nueva])
    setObsGeneral('')
  }

  const eliminar = (id: string) => {
    setEvidencias(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Camera & Photo upload */}
      <div className="ios-section-header">Evidencia Fotográfica</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-5)',
            background: '#F8FAFC',
            border: '1.5px dashed #CBD5E1',
            borderRadius: 'var(--radius-xl)',
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
          }}
        >
          <span className="material-icons" style={{ fontSize: 32, color: '#0055A5' }}>photo_camera</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ios-blue)' }}>Tomar Foto</span>
          <span style={{ fontSize: 12, color: 'var(--ios-gray)', textAlign: 'center' }}>Cámara nativa del dispositivo</span>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-5)',
            background: '#F8FAFC',
            border: '1.5px dashed #CBD5E1',
            borderRadius: 'var(--radius-xl)',
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
          }}
        >
          <span className="material-icons" style={{ fontSize: 32, color: '#475569' }}>collections</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Desde Galería</span>
          <span style={{ fontSize: 12, color: 'var(--ios-gray)', textAlign: 'center' }}>Seleccionar imagen existente</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFoto}
      />

      {/* Quick Chips para observaciones in situ */}
      <div className="ios-section-header">Observaciones Frecuentes (Quick Chips)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {[
          'Matafuegos Vencidos',
          'Falta Libro de Actas',
          'DT Ausente en Horario',
          'Camas Exceden Habilitación',
          'Falta Cert. Residuos Patógenos',
          'Alteración Edilicia Sin Declarar',
          'Salida de Emergencia Obstruida',
        ].map(chip => (
          <button
            key={chip}
            type="button"
            onClick={() => setObsGeneral(prev => prev ? `${prev}. ${chip}` : chip)}
            style={{
              background: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: 6,
              padding: '5px 10px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span className="material-icons" style={{ fontSize: 14 }}>add</span> {chip}
          </button>
        ))}
      </div>

      {/* Observación general */}
      <div className="ios-section-header">Observación General del Acta</div>
      <div className="ios-card-group" style={{ padding: 'var(--space-4)' }}>
        <textarea
          rows={4}
          value={obsGeneral}
          onChange={e => setObsGeneral(e.target.value)}
          placeholder="Agregá una observación general sobre la inspección o seleccioná Quick Chips..."
          style={{
            width: '100%', padding: 'var(--space-3)', borderRadius: 12,
            border: '1.5px solid var(--ios-gray5)', fontFamily: 'var(--font-family)', fontSize: 15,
            background: 'var(--ios-gray6)', resize: 'none', outline: 'none', marginBottom: 'var(--space-3)',
          }}
        />
        <button
          onClick={agregarObs}
          disabled={!obsGeneral.trim()}
          className="btn-ios btn-ios-primary"
          style={{ padding: '12px', opacity: obsGeneral.trim() ? 1 : 0.4 }}
        >
          + Agregar Observación
        </button>
      </div>

      {/* Gallery */}
      {evidencias.length > 0 && (
        <>
          <div className="ios-section-header">Registros ({evidencias.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {evidencias.map(ev => (
              <div key={ev.id} style={{
                background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid var(--ios-gray5)',
              }}>
                {ev.tipo === 'foto' ? (
                  <div>
                    <img src={ev.contenido} alt="Evidencia" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)' }}>
                      <span style={{ fontSize: 20 }}>📷</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-gray-700)' }}>{ev.vinculo}</div>
                        <div style={{ fontSize: 11, color: 'var(--ios-gray)' }}>{ev.timestamp}</div>
                      </div>
                      <button onClick={() => eliminar(ev.id)} style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ios-red)' }}>🗑</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-4)' }}>
                    <span style={{ fontSize: 20 }}>📝</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: 'var(--color-gray-700)', lineHeight: 1.5 }}>{ev.contenido}</div>
                      <div style={{ fontSize: 11, color: 'var(--ios-gray)', marginTop: 4 }}>{ev.timestamp}</div>
                    </div>
                    <button onClick={() => eliminar(ev.id)} style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ios-red)' }}>🗑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button className="btn-ios btn-ios-gray" onClick={onPrev} style={{ width: 'auto', padding: '14px 24px' }}>← Anterior</button>
        <button className="btn-ios btn-ios-primary" onClick={onNext} style={{ flex: 1 }}>Ir a Cierre →</button>
      </div>
    </div>
  )
}
