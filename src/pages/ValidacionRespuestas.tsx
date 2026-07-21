import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TRAMITES, HALLAZGOS, type Hallazgo } from '../data/mockData'

type RevisionEstado = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'

export default function ValidacionRespuestas() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tramite = TRAMITES.find(t => t.id === id) ?? TRAMITES[1]
  const [revisiones, setRevisiones] = useState<Record<string, RevisionEstado>>({})
  const [visorId, setVisorId] = useState<string | null>(null)

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
          {/* Respuesta del efector (simulada) */}
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

  return (
    <>
      <div className="topbar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inspector/bandeja')}>← Volver</button>
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

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          {!todosRevisados && (
            <div className="alert alert-warning" style={{ flex: 1, marginBottom: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="material-icons" style={{ color: '#b91c1c', fontSize: 18 }}>warning</span>
              <div>Revisá todos los ítems para habilitar los botones de acción.</div>
            </div>
          )}
          <button
            className="btn btn-success btn-lg"
            disabled={!todosRevisados || !todosAceptados}
            style={{ opacity: (todosRevisados && todosAceptados) ? 1 : 0.4 }}
            onClick={() => navigate('/inspector/bandeja')}
          >
            Crear Acta
          </button>
          <button
            className="btn btn-danger btn-lg"
            disabled={!todosRevisados || !algunoRechazado}
            style={{ opacity: (todosRevisados && algunoRechazado) ? 1 : 0.4 }}
            onClick={() => navigate('/inspector/bandeja')}
          >
            Rechazar
          </button>
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
    </>
  )
}
