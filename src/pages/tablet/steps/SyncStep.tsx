import React, { useState } from 'react'
import type { StepProps } from '../InspeccionShell'
import { useApp } from '../../../context/AppContext'

export default function SyncStep({ tramiteId, onNext }: StepProps) {
  const { tramites } = useApp()
  const tramite = tramites.find(t => t.id === tramiteId)!
  const [synced, setSynced] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setSynced(true)
    }, 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      {/* Header info */}
      <div className="ios-card-group" style={{ overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ padding: 'var(--space-4) var(--space-4)', background: 'var(--color-brand-600)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            Trámite a inspeccionar
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 4 }}>{tramite.denominacion}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
            {tramite.domicilio} · {tramite.localidad}
          </div>
        </div>
        <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', background: 'white' }}>
          {[
            { label: 'Trámite', val: tramite.nroTramite },
            { label: 'Acta N°', val: String(tramite.nroActa) },
            { label: 'Tipología', val: tramite.tipologia },
            { label: 'Formato', val: tramite.formatoInspeccion },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: 'var(--ios-gray)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-gray-800)', marginTop: 2 }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync card */}
      <div className="ios-section-header">Preparación para inspección offline</div>
      <div className="ios-card-group">
        <div style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 'var(--space-4)', filter: syncing ? 'grayscale(0)' : synced ? 'none' : 'grayscale(0.3)' }}>
            {syncing ? '⏳' : synced ? '✅' : '📡'}
          </div>

          {!synced && !syncing && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                Sincronizar datos
              </div>
              <div style={{ fontSize: 14, color: 'var(--ios-gray)', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
                Descargá la declaración jurada del efector y la configuración de plantilla para poder trabajar sin conexión durante la inspección.
              </div>
              <button className="btn-ios btn-ios-primary" onClick={handleSync} style={{ maxWidth: 280, margin: '0 auto' }}>
                📡 Sincronizar datos
              </button>
            </>
          )}

          {syncing && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ios-blue)', marginBottom: 'var(--space-2)' }}>
                Descargando...
              </div>
              <div style={{ height: 6, background: 'var(--ios-gray5)', borderRadius: 'var(--radius-full)', overflow: 'hidden', maxWidth: 280, margin: '0 auto' }}>
                <div style={{
                  height: '100%',
                  background: 'var(--ios-blue)',
                  borderRadius: 'var(--radius-full)',
                  animation: 'shimmer 1.5s infinite',
                  width: '70%',
                }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--ios-gray)', marginTop: 'var(--space-3)' }}>Descargando declaración del efector...</div>
            </>
          )}

          {synced && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ios-green)', marginBottom: 'var(--space-2)' }}>
                ¡Listo para inspeccionar!
              </div>
              <div style={{ fontSize: 14, color: 'var(--ios-gray)', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
                Los datos están cargados localmente. Podés continuar sin conexión a internet.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', textAlign: 'left', maxWidth: 300, margin: '0 auto var(--space-5)' }}>
                {[
                  '✓ Declaración jurada del efector',
                  '✓ Configuración de plantilla del acta',
                  '✓ Servicios, equipamiento y personal declarado',
                  '✓ Documentos adjuntos referenciados',
                ].map(item => (
                  <div key={item} style={{ fontSize: 14, color: 'var(--color-gray-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--ios-green)', fontWeight: 700 }}>✓</span>
                    <span>{item.replace('✓ ', '')}</span>
                  </div>
                ))}
              </div>

              <button className="btn-ios btn-ios-primary" onClick={onNext} style={{ maxWidth: 280, margin: '0 auto' }}>
                Comenzar Inspección →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
