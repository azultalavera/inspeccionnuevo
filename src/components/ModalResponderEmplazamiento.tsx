import React, { useState } from 'react'
import type { Tramite } from '../data/mockData'
import { useApp } from '../context/AppContext'

interface Props {
  tramite: Tramite
  onClose: () => void
  onOpenIniciarModificacion: (actaPadreId: string) => void
  mode?: 'respuesta' | 'emision'
  isRadiofisica?: boolean
  observacionesIniciales?: string[]
  onEmitirFinalizado?: () => void
}

export default function ModalResponderEmplazamiento({
  tramite,
  onClose,
  onOpenIniciarModificacion,
  mode = 'respuesta',
  isRadiofisica = false,
  observacionesIniciales = [],
  onEmitirFinalizado,
}: Props) {
  const { responderEmplazamiento, emplazarTramite, actualizarTramite } = useApp()
  const [opcion, setOpcion] = useState<'DOCUMENTAL' | 'MODIFICACION' | null>(null)
  const [observacion, setObservacion] = useState(() => mode === 'emision' ? observacionesIniciales.join('\n') : '')
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [archivos, setArchivos] = useState<string[]>([])
  const [completado, setCompletado] = useState(false)
  const [accionEmision, setAccionEmision] = useState<'EMPLAZAMIENTO' | 'RECHAZO'>('EMPLAZAMIENTO')
  const [plazoEmision, setPlazoEmision] = useState('10 días')
  const [plazoManual, setPlazoManual] = useState('1')
  const [unidadPlazoManual, setUnidadPlazoManual] = useState<'horas' | 'días'>('días')

  const plazoFinal = plazoEmision === 'MANUAL'
    ? `${plazoManual} ${unidadPlazoManual}`
    : plazoEmision

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

  const handleConfirmarEmision = () => {
    if (accionEmision === 'RECHAZO') {
      actualizarTramite({
        ...tramite,
        estado: 'RECHAZADO_INSP',
        motivoRechazoActa: motivoRechazo.trim(),
      })
    } else {
      const observaciones = observacion.split('\n').map(line => line.trim()).filter(Boolean)
      emplazarTramite(
        tramite.id,
        plazoFinal,
        observaciones.length > 0 ? observaciones : ['Observaciones registradas en el acta de inspección'],
      )
    }

    setCompletado(true)
    window.setTimeout(() => {
      onClose()
      onEmitirFinalizado?.()
    }, 1200)
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
        borderRadius: mode === 'emision' ? 24 : 8,
        maxWidth: mode === 'emision' ? 820 : 560,
        width: '100%',
        padding: mode === 'emision' ? 12 : 24,
        border: '1px solid #CBD5E1',
        boxSizing: 'border-box',
        maxHeight: mode === 'emision' ? 'calc(100vh - 32px)' : undefined,
        overflowY: mode === 'emision' ? 'auto' : undefined,
      }}>
        {/* Header */}
        {mode === 'respuesta' && (
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
        )}

        {mode === 'respuesta' && <div style={{
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
        </div>}

        {completado ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <span className="material-icons" style={{ fontSize: 40, color: '#16A34A', marginBottom: 8 }}>check_circle</span>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
              {mode === 'emision'
                ? accionEmision === 'RECHAZO' ? 'Acta rechazada' : 'Emplazamiento emitido'
                : 'Respuesta Emplazamiento Registrada Exitosamente'}
            </h4>
            <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>
              {mode === 'emision'
                ? accionEmision === 'RECHAZO'
                  ? 'El trámite quedó registrado como rechazado.'
                  : 'El efector podrá consultar las observaciones y el plazo otorgado.'
                : 'Las evidencias han sido notificadas al equipo auditor para su revisión.'}
            </p>
          </div>
        ) : mode === 'emision' ? (
          <div style={{ padding: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                display: 'grid', placeItems: 'center',
                background: accionEmision === 'RECHAZO' ? '#FEE2E2' : '#E0F7FA',
                color: accionEmision === 'RECHAZO' ? '#DC2626' : '#06A6C8',
              }}>
                <span className="material-icons" style={{ fontSize: 22 }}>
                  {accionEmision === 'RECHAZO' ? 'cancel' : 'schedule'}
                </span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.2, fontWeight: 800, color: '#111827' }}>
                  {accionEmision === 'RECHAZO' ? 'Rechazo Definitivo del Trámite' : 'Plazo de Emplazamiento'}
                </h3>
                <div style={{ marginTop: 4, fontSize: 11, lineHeight: 1.4, color: '#718096' }}>
                  {accionEmision === 'RECHAZO'
                    ? 'Indique la fundamentación técnica para desestimar el trámite.'
                    : 'Seleccione el plazo otorgado para regularizar las observaciones.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, padding: 3, marginBottom: 14, borderRadius: 12, background: '#F1F5F9' }}>
              {([
                { id: 'EMPLAZAMIENTO' as const, label: 'Emplazar con plazo', icon: 'schedule' },
                { id: 'RECHAZO' as const, label: 'Rechazar trámite', icon: 'cancel' },
              ]).map((accion) => {
                const selected = accionEmision === accion.id
                const color = accion.id === 'RECHAZO' ? '#DC2626' : '#0284C7'
                return (
                  <button
                    key={accion.id}
                    type="button"
                    onClick={() => setAccionEmision(accion.id)}
                    style={{
                      minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      border: 0, borderRadius: 10, background: selected ? '#FFFFFF' : 'transparent',
                      boxShadow: selected ? '0 2px 8px rgba(15, 23, 42, 0.10)' : 'none',
                      color: selected ? color : '#718096', fontSize: 12, fontWeight: 750, cursor: 'pointer',
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 16 }}>{accion.icon}</span>
                    {accion.label}
                  </button>
                )
              })}
            </div>

            {accionEmision === 'EMPLAZAMIENTO' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginBottom: 14 }}>
                  {[
                    { value: '24 horas', label: '24 horas' },
                    { value: '48 horas', label: '48 horas' },
                    { value: '5 días', label: '5 días' },
                    { value: '10 días', label: '10 días' },
                    { value: '15 días', label: '15 días' },
                    { value: 'MANUAL', label: 'Manual' },
                  ].map(option => {
                    const selected = plazoEmision === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPlazoEmision(option.value)}
                        style={{
                          minHeight: 42, borderRadius: 12,
                          border: `1.5px solid ${selected ? '#0EA5E9' : '#E2E8F0'}`,
                          background: selected ? '#F0F9FF' : '#FFFFFF',
                          color: '#1E293B', fontSize: 13, fontWeight: 750, cursor: 'pointer',
                        }}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>

                {plazoEmision === 'MANUAL' && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <input
                      type="number"
                      min="1"
                      value={plazoManual}
                      onChange={event => setPlazoManual(event.target.value)}
                      aria-label="Cantidad de plazo manual"
                      style={{ flex: 1, minWidth: 0, padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12 }}
                    />
                    <select
                      value={unidadPlazoManual}
                      onChange={event => setUnidadPlazoManual(event.target.value as 'horas' | 'días')}
                      aria-label="Unidad de plazo manual"
                      style={{ padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: 12 }}
                    >
                      <option value="horas">Horas</option>
                      <option value="días">Días</option>
                    </select>
                  </div>
                )}

                <label style={{ display: 'block', color: '#718096', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                  Observaciones del emplazamiento (opcional):
                </label>
                <textarea
                  rows={3}
                  value={observacion}
                  onChange={event => setObservacion(event.target.value)}
                  placeholder="Detalle instrucciones de regularización para el efector..."
                  style={{
                    display: 'block', width: '100%', boxSizing: 'border-box', resize: 'vertical',
                    padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 10,
                    background: '#F8FAFC', color: '#334155', fontSize: 12, lineHeight: 1.5,
                  }}
                />
              </>
            ) : (
              <>
                <div style={{ padding: '12px 14px', marginBottom: 14, borderRadius: 12, border: '1px solid #FECdd3', background: '#FFF1F2' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, color: '#BE123C' }}>
                    <span className="material-icons" style={{ marginTop: 2, fontSize: 16 }}>warning</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 3 }}>Dictamen de Rechazo Definitivo</div>
                      <div style={{ fontSize: 11, lineHeight: 1.5 }}>
                        Esta acción finalizará la inspección desestimando el trámite. No se otorgará plazo para regularizar observaciones.
                      </div>
                    </div>
                  </div>
                </div>
                <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 750, marginBottom: 6 }}>
                  Fundamentación técnica del rechazo <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={motivoRechazo}
                  onChange={event => setMotivoRechazo(event.target.value)}
                  placeholder="Escriba los motivos o infracciones graves que justifican el rechazo definitivo..."
                  style={{
                    display: 'block', width: '100%', boxSizing: 'border-box', resize: 'vertical',
                    padding: '8px 10px', border: '1.5px solid #0284C7', borderRadius: 10,
                    background: '#FFFFFF', color: '#334155', fontSize: 12, lineHeight: 1.5,
                  }}
                />
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '8px 14px', border: 0, borderRadius: 8, background: 'transparent', color: '#64748B', fontSize: 12, fontWeight: 750, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={accionEmision === 'RECHAZO' ? !motivoRechazo.trim() : (plazoEmision === 'MANUAL' && (!Number(plazoManual) || Number(plazoManual) < 1))}
                onClick={handleConfirmarEmision}
                style={{
                  minWidth: 120, padding: '8px 14px', border: 0, borderRadius: 10,
                  background: accionEmision === 'RECHAZO' ? '#DC2626' : '#0EA5E9',
                  color: '#FFFFFF', fontSize: 12, fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {accionEmision === 'RECHAZO' ? 'Confirmar Rechazo' : 'Emplazar'}
              </button>
            </div>
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
