import React, { useState } from 'react'
import type { Tramite } from '../data/mockData'
import { useApp } from '../context/AppContext'

interface Props {
  tramite: Tramite
  onClose: () => void
  onOpenIniciarModificacion: (actaPadreId: string) => void
}

export default function ModalResponderEmplazamiento({ tramite, onClose, onOpenIniciarModificacion }: Props) {
  const { responderEmplazamiento } = useApp()
  const [opcion, setOpcion] = useState<'DOCUMENTAL' | 'MODIFICACION' | null>(null)
  const [observacion, setObservacion] = useState('')
  const [archivos, setArchivos] = useState<string[]>([])
  const [completado, setCompletado] = useState(false)

  const emplazamiento = tramite.emplazamiento || {
    diasRestantes: 8,
    fechaVencimiento: '10/08/2026',
    faltasCriticasCount: 2,
    actaNumero: 'ACTA-8831'
  }

  const handleSimularArchivo = () => {
    const nuevoDoc = `Evidencia_RespuestaEmplazamiento_${archivos.length + 1}.pdf`
    setArchivos(prev => [...prev, nuevoDoc])
  }

  const handleConfirmarRespuestaEmplazamiento = () => {
    if (opcion === 'MODIFICACION') {
      responderEmplazamiento(tramite.id, { observacion, derivadoAModificacion: true })
      onClose()
      onOpenIniciarModificacion(tramite.id)
      return
    }

    responderEmplazamiento(tramite.id, { observacion, adjuntos: archivos, derivadoAModificacion: false })
    setCompletado(true)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 8,
        maxWidth: 560,
        width: '100%',
        padding: 24,
        border: '1px solid #CBD5E1'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-icons" style={{ fontSize: 16, color: '#DC2626' }}>warning</span>
              Emplazamiento de Inspección
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
              Responder Emplazamiento {emplazamiento.actaNumero || `Acta N° ${tramite.nroActa || '102'}`}
            </h3>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              Establecimiento: <strong>{tramite.denominacion}</strong>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Timer Bar - Simple neutral border */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #CBD5E1',
          borderRadius: 6,
          padding: '10px 14px',
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
              Plazo Restante: {emplazamiento.diasRestantes} Días Hábiles
            </div>
            <div style={{ fontSize: 11.5, color: '#64748B' }}>
              Fecha límite: {emplazamiento.fechaVencimiento}
            </div>
          </div>
          <span className="material-icons" style={{ fontSize: 22, color: '#475569' }}>timer</span>
        </div>

        {completado ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <span className="material-icons" style={{ fontSize: 40, color: '#16A34A', marginBottom: 8 }}>check_circle</span>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Respuesta Emplazamiento Registrada Exitosamente</h4>
            <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>
              Las evidencias han sido notificadas al equipo auditor para su revisión.
            </p>
          </div>
        ) : (
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 10 }}>
              Seleccionar modalidad de respuesta:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {/* Opcion A */}
              <button
                type="button"
                onClick={() => setOpcion('DOCUMENTAL')}
                style={{
                  padding: 14,
                  borderRadius: 6,
                  border: `1.5px solid ${opcion === 'DOCUMENTAL' ? '#0055A5' : '#CBD5E1'}`,
                  background: opcion === 'DOCUMENTAL' ? '#F8FAFC' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span className="material-icons" style={{ fontSize: 24, color: opcion === 'DOCUMENTAL' ? '#0055A5' : '#64748B', marginBottom: 4, display: 'block' }}>upload_file</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: opcion === 'DOCUMENTAL' ? '#0055A5' : '#0F172A' }}>
                  A. Evidencia Digital
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                  Cargar documentación o fotos probatorias.
                </div>
              </button>

              {/* Opcion B */}
              <button
                type="button"
                onClick={() => setOpcion('MODIFICACION')}
                style={{
                  padding: 14,
                  borderRadius: 6,
                  border: `1.5px solid ${opcion === 'MODIFICACION' ? '#0055A5' : '#CBD5E1'}`,
                  background: opcion === 'MODIFICACION' ? '#F8FAFC' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span className="material-icons" style={{ fontSize: 24, color: opcion === 'MODIFICACION' ? '#0055A5' : '#64748B', marginBottom: 4, display: 'block' }}>build</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: opcion === 'MODIFICACION' ? '#0055A5' : '#0F172A' }}>
                  B. Trámite Modificación
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                  Iniciar Trámite de Modificación Vinculado.
                </div>
              </button>
            </div>

            {/* Opcion A Details */}
            {opcion === 'DOCUMENTAL' && (
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 6, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Detalle de la Respuesta Emplazamiento:
                </label>
                <textarea
                  rows={3}
                  value={observacion}
                  onChange={e => setObservacion(e.target.value)}
                  placeholder="Escriba las aclaraciones respecto al emplazamiento..."
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, resize: 'none', marginBottom: 10 }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleSimularArchivo}
                    style={{
                      background: 'white',
                      border: '1px solid #0055A5',
                      color: '#0055A5',
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 16 }}>attach_file</span>
                    Adjuntar Archivo
                  </button>

                  <span style={{ fontSize: 11.5, color: '#64748B' }}>
                    {archivos.length} adjunto(s)
                  </span>
                </div>

                {archivos.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {archivos.map((file, idx) => (
                      <div key={idx} style={{ fontSize: 11.5, color: '#334155', background: '#E2E8F0', padding: '3px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-icons" style={{ fontSize: 14 }}>description</span> {file}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Opcion B Details */}
            {opcion === 'MODIFICACION' && (
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 6, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  Derivación a Trámite de Modificación Vinculado
                </div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                  Se creará un Trámite de Modificación vinculando el número de Acta Padre ({emplazamiento.actaNumero}).
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #CBD5E1', background: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!opcion}
                onClick={handleConfirmarRespuestaEmplazamiento}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#0055A5',
                  color: 'white',
                  fontWeight: 700,
                  cursor: opcion ? 'pointer' : 'not-allowed',
                  opacity: opcion ? 1 : 0.4,
                  fontSize: 12
                }}
              >
                Confirmar Respuesta Emplazamiento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
