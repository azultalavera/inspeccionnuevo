import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TRAMITES, HALLAZGOS, OPCIONES_EMPLAZAMIENTO, type Hallazgo } from '../data/mockData'

type RevisionEstado = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'

// ── Modal 2.1: Solicitar Re-Inspección ─────────────────────────────
function ModalReInspeccion({ onConfirm, onCancel }: { onConfirm: (motivo: string) => void; onCancel: () => void }) {
  const [motivo, setMotivo] = useState('')
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ color: '#D97706', fontSize: 22 }}>assignment_return</span>
            Solicitar Re-Inspección al Coordinador
          </div>
          <button className="btn-icon" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
            fontSize: 13, color: '#92400E', lineHeight: 1.5,
            display: 'flex', gap: 8, alignItems: 'flex-start'
          }}>
            <span className="material-icons" style={{ fontSize: 18, color: '#D97706', flexShrink: 0, marginTop: 1 }}>info</span>
            <span>
              La documentación enviada por el efector es correcta. Se solicitará al coordinador que asigne una nueva inspección con fecha límite.
            </span>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-700)', display: 'block', marginBottom: 6 }}>
              Justificación / Motivo de Re-Inspección:
            </label>
            <textarea
              rows={4}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Describí los puntos que deben verificarse en la re-inspección..."
              style={{
                width: '100%', padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-gray-300)',
                fontFamily: 'var(--font-family)', fontSize: 14, resize: 'none', outline: 'none',
                background: 'var(--color-gray-50)'
              }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button
            className="btn btn-warning"
            disabled={!motivo.trim()}
            style={{ opacity: motivo.trim() ? 1 : 0.4, background: '#D97706', color: 'white', border: 'none' }}
            onClick={() => onConfirm(motivo)}
          >
            <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>send</span>
            Enviar al Coordinador
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal 2.2: Nuevo Emplazamiento ─────────────────────────────────
function ModalNuevoEmplazamiento({ onConfirm, onCancel }: { onConfirm: (fecha: string) => void; onCancel: () => void }) {
  const [plazoSeleccionado, setPlazoSeleccionado] = useState<string | null>(null)
  const [plazoManual, setPlazoManual] = useState('')
  const [plazoUnidad, setPlazoUnidad] = useState<'Horas' | 'Días' | 'Semanas'>('Días')

  const calcFecha = (opId: string | null) => {
    if (!opId) return null
    let horas = 0
    if (opId === 'MANUAL') {
      const val = Number(plazoManual)
      horas = plazoUnidad === 'Horas' ? val : plazoUnidad === 'Días' ? val * 24 : val * 24 * 7
    } else {
      horas = OPCIONES_EMPLAZAMIENTO.find(o => o.id === opId)?.horas ?? 0
    }
    const fecha = new Date()
    let diasAgregados = 0
    const diasTotal = Math.ceil(horas / 24)
    while (diasAgregados < diasTotal) {
      fecha.setDate(fecha.getDate() + 1)
      const dow = fecha.getDay()
      if (dow !== 0 && dow !== 6) diasAgregados++
    }
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const fechaCalculada = calcFecha(plazoSeleccionado)
  const puedeConfirmar = plazoSeleccionado && !(plazoSeleccionado === 'MANUAL' && !plazoManual)

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ color: 'var(--color-danger)', fontSize: 22 }}>gavel</span>
            Nuevo Emplazamiento
          </div>
          <button className="btn-icon" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
            fontSize: 13, color: '#991B1B', lineHeight: 1.5,
            display: 'flex', gap: 8, alignItems: 'flex-start'
          }}>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--color-danger)', flexShrink: 0, marginTop: 1 }}>warning</span>
            <span>
              La documentación enviada no es correcta. El efector deberá volver a cargar la documentación en el nuevo plazo asignado.
            </span>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-700)', marginBottom: 10 }}>
              Seleccioná el nuevo plazo:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {OPCIONES_EMPLAZAMIENTO.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPlazoSeleccionado(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    border: `2px solid ${plazoSeleccionado === opt.id ? 'var(--color-danger)' : 'var(--color-gray-200)'}`,
                    background: plazoSeleccionado === opt.id ? 'rgba(220,53,69,0.05)' : 'white',
                    cursor: 'pointer', fontFamily: 'var(--font-family)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: plazoSeleccionado === opt.id ? 'var(--color-danger)' : 'var(--color-gray-800)' }}>
                    {opt.label}
                  </span>
                  {plazoSeleccionado === opt.id && <span style={{ color: 'var(--color-danger)' }}>✓</span>}
                </button>
              ))}
              <button
                onClick={() => setPlazoSeleccionado('MANUAL')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${plazoSeleccionado === 'MANUAL' ? 'var(--color-warning)' : 'var(--color-gray-200)'}`,
                  background: plazoSeleccionado === 'MANUAL' ? 'rgba(255,193,7,0.06)' : 'white',
                  cursor: 'pointer', fontFamily: 'var(--font-family)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: plazoSeleccionado === 'MANUAL' ? '#92400E' : 'var(--color-gray-700)' }}>
                  + Manual
                </span>
                {plazoSeleccionado === 'MANUAL' && <span style={{ color: '#92400E' }}>✓</span>}
              </button>
            </div>
          </div>

          {plazoSeleccionado === 'MANUAL' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number" min={1}
                value={plazoManual}
                onChange={e => setPlazoManual(e.target.value)}
                placeholder="Cantidad"
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--color-gray-300)', fontFamily: 'var(--font-family)', fontSize: 16, outline: 'none' }}
              />
              <select
                value={plazoUnidad}
                onChange={e => setPlazoUnidad(e.target.value as typeof plazoUnidad)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--color-gray-300)', fontFamily: 'var(--font-family)', fontSize: 14, outline: 'none', background: 'white' }}
              >
                <option>Horas</option>
                <option>Días</option>
                <option>Semanas</option>
              </select>
            </div>
          )}

          {fechaCalculada && (
            <div style={{
              background: 'rgba(220,53,69,0.06)', border: '1.5px solid rgba(220,53,69,0.2)',
              borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, color: 'var(--color-gray-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                Nueva fecha límite
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-danger)' }}>{fechaCalculada}</div>
              <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 4 }}>No incluye sábados, domingos ni feriados</div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button
            className="btn btn-danger"
            disabled={!puedeConfirmar}
            style={{ opacity: puedeConfirmar ? 1 : 0.4 }}
            onClick={() => puedeConfirmar && fechaCalculada && onConfirm(fechaCalculada)}
          >
            <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>gavel</span>
            Confirmar Nuevo Emplazamiento
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pantalla de confirmación genérica ─────────────────────────────
type SuccessScreen = 'RE_INSPECCION' | 'NUEVO_EMPLAZAMIENTO'

export default function ValidacionRespuestas() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tramite = TRAMITES.find(t => t.id === id) ?? TRAMITES[1]
  const [revisiones, setRevisiones] = useState<Record<string, RevisionEstado>>({})
  const [visorId, setVisorId] = useState<string | null>(null)

  // Modal state
  const [showReInspeccion, setShowReInspeccion] = useState(false)
  const [showNuevoEmplaz, setShowNuevoEmplaz] = useState(false)

  // Success screens
  const [successScreen, setSuccessScreen] = useState<SuccessScreen | null>(null)
  const [successData, setSuccessData] = useState<string>('') // motivo or fecha

  const hallazgos = HALLAZGOS
  const total = hallazgos.length
  const revisados = Object.keys(revisiones).filter(id => revisiones[id] !== 'PENDIENTE').length
  const todosAceptados = hallazgos.every(h => revisiones[h.id] === 'ACEPTADO')
  const algunoRechazado = hallazgos.some(h => revisiones[h.id] === 'RECHAZADO')
  const todosRevisados = hallazgos.every(h => revisiones[h.id] !== undefined && revisiones[h.id] !== 'PENDIENTE')

  const revisar = (id: string, estado: 'ACEPTADO' | 'RECHAZADO') => {
    setRevisiones(prev => ({ ...prev, [id]: estado }))
  }

  const hallazgosGeneral = hallazgos.filter(h => h.seccion === 'DATOS_GENERALES')
  const diferencias = hallazgos.filter(h => h.tipo === 'DIFERENCIA_CONSTATADA')
  const documentos = hallazgos.filter(h => h.tipo === 'DOCUMENTO_OBSERVADO')
  const inconsistencias = hallazgos.filter(h => h.tipo === 'INCONSISTENCIA')

  const RevisionRow = ({ h }: { h: Hallazgo }) => {
    const est = revisiones[h.id]
    return (
      <tr style={{ background: est === 'ACEPTADO' ? 'rgba(25,135,84,0.04)' : est === 'RECHAZADO' ? 'rgba(220,53,69,0.04)' : 'white' }}>
        <td style={{ fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{h.origen}</div>
        </td>
        <td style={{ fontSize: 13 }}>{h.categoria}</td>
        <td style={{ fontSize: 12, color: 'var(--color-gray-600)', maxWidth: 200 }}>
          {h.observacion}
          {h.declarado !== undefined && (
            <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-neutral">Decl: {h.declarado}</span>
              <span className="badge badge-danger">Obs: {h.observado}</span>
            </div>
          )}
        </td>
        <td>
          <button onClick={() => setVisorId(h.id)} style={{ fontSize: 12, color: 'var(--ios-blue)', background: 'rgba(0,122,255,0.08)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-family)', fontWeight: 600, marginBottom: 6, display: 'block' }}>
            👁 Ver respuesta
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => revisar(h.id, 'ACEPTADO')}
              className={`btn btn-sm ${est === 'ACEPTADO' ? 'btn-success' : 'btn-secondary'}`}
              style={{ flex: 1, fontSize: 12 }}
            >
              ✓ Aceptado
            </button>
            <button
              onClick={() => revisar(h.id, 'RECHAZADO')}
              className={`btn btn-sm ${est === 'RECHAZADO' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ flex: 1, fontSize: 12 }}
            >
              ✗ Rechazado
            </button>
          </div>
        </td>
      </tr>
    )
  }

  const Section = ({ title, items, badge }: { title: string; items: Hallazgo[]; badge?: string }) => {
    if (items.length === 0) {
      return (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-gray-700)', marginBottom: 'var(--space-3)' }}>{title}</div>
          <div style={{ color: 'var(--color-gray-400)', fontSize: 13, fontStyle: 'italic', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
            No hay observaciones registradas en esta sección.
          </div>
        </div>
      )
    }
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-gray-700)' }}>{title}</div>
          {badge && <span className="badge badge-danger">{badge}</span>}
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Origen</th><th>Categoría</th><th>Observaciones</th><th style={{ minWidth: 180 }}>Acciones</th></tr></thead>
            <tbody>{items.map(h => <RevisionRow key={h.id} h={h} />)}</tbody>
          </table>
        </div>
      </div>
    )
  }

  // ── PANTALLA DE ÉXITO ────────────────────────────────────────────
  if (successScreen === 'RE_INSPECCION') {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title" style={{ flex: 1, textAlign: 'center' }}>Revisión de Respuestas de Emplazamiento</div>
        </div>
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24, maxWidth: 500, margin: '0 auto' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="material-icons" style={{ fontSize: 44, color: '#D97706' }}>assignment_return</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: 6 }}>
              Re-Inspección Solicitada
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-gray-500)', lineHeight: 1.6 }}>
              La solicitud fue enviada al coordinador. Una vez que asigne un inspector y una fecha límite, el trámite continuará su curso.
            </div>
          </div>
          <div style={{
            width: '100%', background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: 12, padding: 16, fontSize: 13, color: '#92400E', lineHeight: 1.6
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Motivo enviado:</div>
            {successData}
          </div>
          <div style={{
            width: '100%', background: 'var(--color-gray-50)', borderRadius: 12,
            padding: 14, fontSize: 13, color: 'var(--color-gray-600)', lineHeight: 1.5,
            display: 'flex', gap: 8, alignItems: 'flex-start'
          }}>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--color-gray-400)', flexShrink: 0, marginTop: 1 }}>info</span>
            El coordinador recibirá la solicitud y asignará inspector y fecha límite para la re-inspección.
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/inspector/inspecciones')}>
            Volver a Bandeja
          </button>
        </div>
      </>
    )
  }

  if (successScreen === 'NUEVO_EMPLAZAMIENTO') {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title" style={{ flex: 1, textAlign: 'center' }}>Revisión de Respuestas de Emplazamiento</div>
        </div>
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24, maxWidth: 500, margin: '0 auto' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="material-icons" style={{ fontSize: 44, color: 'var(--color-danger)' }}>gavel</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: 6 }}>
              Nuevo Emplazamiento Emitido
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-gray-500)', lineHeight: 1.6 }}>
              El establecimiento fue emplazado nuevamente. Deberá cargar la documentación corregida antes de la fecha límite.
            </div>
          </div>
          <div style={{
            width: '100%', background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 12, padding: 16, textAlign: 'center'
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Nueva fecha límite
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-danger)' }}>{successData}</div>
          </div>
          <div style={{
            width: '100%', background: 'var(--color-gray-50)', borderRadius: 12,
            padding: 14, fontSize: 13, color: 'var(--color-gray-600)', lineHeight: 1.5,
            display: 'flex', gap: 8, alignItems: 'flex-start'
          }}>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--color-gray-400)', flexShrink: 0, marginTop: 1 }}>info</span>
            Una vez que el efector cargue la nueva respuesta, recibirás la notificación para revisarla. El proceso de revisión se repite con los mismos escenarios.
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/inspector/inspecciones')}>
            Volver a Bandeja
          </button>
        </div>
      </>
    )
  }

  // ── VISTA PRINCIPAL ──────────────────────────────────────────────
  return (
    <>
      <div className="topbar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inspector/inspecciones')}>← Volver</button>
        <div className="topbar-title" style={{ flex: 1, textAlign: 'center' }}>Revisión de Respuestas de Emplazamiento</div>
      </div>

      <div className="page-content">
        {/* Header */}
        <div className="card" style={{ marginBottom: 'var(--space-5)', borderLeft: '4px solid var(--color-brand-600)' }}>
          <div className="card-body">
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: 4 }}>{tramite.denominacion}</div>
            <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>N° {tramite.nroTramite} · {tramite.localidad}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontWeight: 600 }}>Ítems revisados</span>
              <span style={{ color: 'var(--color-gray-500)', fontWeight: 700 }}>{revisados} / {total}</span>
            </div>
            <div style={{ height: 8, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
              <div style={{ height: '100%', width: `${(revisados / total) * 100}%`, background: todosAceptados ? 'var(--color-success)' : algunoRechazado ? 'var(--color-danger)' : 'var(--color-brand-600)', borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
            </div>
            {!todosRevisados && (
              <div style={{ fontSize: 12, color: 'var(--color-gray-400)', fontStyle: 'italic' }}>Revisá todos los ítems para habilitar las acciones</div>
            )}
          </div>
        </div>

        {/* Sección Datos Generales */}
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-header">
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0, fontSize: 15 }}>
              <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 20 }}>assignment</span>
              Datos Generales
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Section title="Inconsistencias Observadas" items={hallazgosGeneral} badge={hallazgosGeneral.length > 0 ? String(hallazgosGeneral.length) : undefined} />
          </div>
        </div>

        {/* Sección Datos del Trámite */}
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-header">
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0, fontSize: 15 }}>
              <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 20 }}>search</span>
              Datos del Trámite
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Section title="Diferencias Constatadas" items={diferencias} badge={diferencias.length > 0 ? String(diferencias.length) : undefined} />
            <Section title="Documentos Observados" items={documentos} badge={documentos.length > 0 ? String(documentos.length) : undefined} />
            <Section title="Inconsistencias Observadas" items={inconsistencias} />
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {!todosRevisados && (
            <div className="alert alert-warning" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="material-icons" style={{ color: '#b91c1c', fontSize: 18 }}>warning</span>
              <div>Revisá todos los ítems para habilitar los botones de acción.</div>
            </div>
          )}

          {todosRevisados && (
            <div style={{
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', flexDirection: 'column', gap: 10
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-700)', marginBottom: 2 }}>
                Resultado de la revisión:
              </div>

              {/* 2.1 — Documentación correcta → pedir re-inspección */}
              {todosAceptados && (
                <>
                  <div style={{
                    background: '#FFFBEB', border: '1px solid #FDE68A',
                    borderRadius: 8, padding: '10px 14px',
                    fontSize: 13, color: '#92400E', lineHeight: 1.5
                  }}>
                    ✓ Toda la documentación fue aceptada. Podés solicitar una re-inspección al coordinador para verificar in situ.
                  </div>
                  <button
                    className="btn btn-lg"
                    style={{
                      background: '#D97706', color: 'white', border: 'none',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                    onClick={() => setShowReInspeccion(true)}
                  >
                    <span className="material-icons" style={{ fontSize: 20 }}>assignment_return</span>
                    Solicitar Re-Inspección al Coordinador
                  </button>
                </>
              )}

              {/* 2.2 — Documentación incorrecta → nuevo emplazamiento */}
              {algunoRechazado && (
                <>
                  <div style={{
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    borderRadius: 8, padding: '10px 14px',
                    fontSize: 13, color: '#991B1B', lineHeight: 1.5
                  }}>
                    ✗ Hay documentación rechazada. Debés volver a emplazar al establecimiento para que corrija y reenvíe.
                  </div>
                  <button
                    className="btn btn-danger btn-lg"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={() => setShowNuevoEmplaz(true)}
                  >
                    <span className="material-icons" style={{ fontSize: 20 }}>gavel</span>
                    Volver a Emplazar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visor modal */}
      {visorId && (
        <div className="modal-overlay" onClick={() => setVisorId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="material-icons" style={{ color: 'var(--color-brand-600)' }}>visibility</span>
                Respuesta del Efector
              </div>
              <button className="btn-icon" onClick={() => setVisorId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', fontSize: 13 }}>
                <strong>Hallazgo original:</strong> {HALLAZGOS.find(h => h.id === visorId)?.observacion}
              </div>
              <div style={{ padding: 'var(--space-4)', background: 'var(--color-success-light)', borderRadius: 'var(--radius-lg)', color: 'var(--color-success)', fontSize: 14, lineHeight: 1.6 }}>
                <strong>Respuesta del establecimiento:</strong><br />
                Se realizó la actualización del Plan de Evacuación con fecha 20/06/2024. Adjuntamos el plan firmado por el titular y aprobado por Defensa Civil. El extinguidor fue reemplazado y se tiene el comprobante de recarga vigente.
              </div>
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-brand-50)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-brand-700)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="material-icons" style={{ fontSize: 16 }}>attach_file</span>
                <span>Documentos adjuntos: plan_evacuacion_2024.pdf, comprobante_extinguidor.pdf</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-success" onClick={() => { revisar(visorId, 'ACEPTADO'); setVisorId(null) }}>Aceptar</button>
              <button className="btn btn-danger" onClick={() => { revisar(visorId, 'RECHAZADO'); setVisorId(null) }}>Rechazar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2.1: Re-Inspección */}
      {showReInspeccion && (
        <ModalReInspeccion
          onConfirm={(motivo) => {
            setSuccessData(motivo)
            setShowReInspeccion(false)
            setSuccessScreen('RE_INSPECCION')
          }}
          onCancel={() => setShowReInspeccion(false)}
        />
      )}

      {/* Modal 2.2: Nuevo Emplazamiento */}
      {showNuevoEmplaz && (
        <ModalNuevoEmplazamiento
          onConfirm={(fecha) => {
            setSuccessData(fecha)
            setShowNuevoEmplaz(false)
            setSuccessScreen('NUEVO_EMPLAZAMIENTO')
          }}
          onCancel={() => setShowNuevoEmplaz(false)}
        />
      )}
    </>
  )
}
