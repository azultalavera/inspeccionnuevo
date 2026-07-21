import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TRAMITES, HALLAZGOS, ESTADO_CONFIG, type Hallazgo } from '../data/mockData'
import TableActionsMenu from '../components/TableActionsMenu'

export default function BandejaEfector() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tramite = TRAMITES.find(t => t.id === id)

  if (!tramite) {
    return <div style={{ padding: 24 }}>Trámite no encontrado</div>
  }

  const conf = ESTADO_CONFIG[tramite.estado]

  const hallazgos = HALLAZGOS
  
  // Local state for answers loaded
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [resModalId, setResModalId] = useState<string | null>(null)
  const [modalText, setModalText] = useState('')

  const hallazgosGeneral = hallazgos.filter(h => h.seccion === 'DATOS_GENERALES')
  const hallazgosTramite = hallazgos.filter(h => h.seccion === 'DATOS_TRAMITE')

  const handleEnviar = () => {
    alert('Respuestas enviadas con éxito al Inspector Interviniente.')
    navigate('/efector/bandeja')
  }

  const handleGuardarBorrador = () => {
    alert('Borrador guardado localmente.')
    navigate('/efector/bandeja')
  }

  const allResponded = hallazgos.length > 0 && Object.keys(respuestas).length === hallazgos.length

  const HallazgoRow = ({ h }: { h: Hallazgo }) => {
    const tiene = !!respuestas[h.id]
    return (
      <tr>
        <td>
          <span className={`badge ${
            h.tipo === 'DIFERENCIA_CONSTATADA' ? 'badge-warning' :
            h.tipo === 'DOCUMENTO_OBSERVADO' ? 'badge-info' :
            'badge-danger'
          }`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span className="material-icons" style={{ fontSize: 14 }}>
              {h.tipo === 'DIFERENCIA_CONSTATADA' ? 'analytics' :
               h.tipo === 'DOCUMENTO_OBSERVADO' ? 'description' : 'warning'}
            </span>
            {h.tipo === 'DIFERENCIA_CONSTATADA' ? 'Diferencia' :
             h.tipo === 'DOCUMENTO_OBSERVADO' ? 'Documento' : 'Inconsistencia'}
          </span>
        </td>
        <td>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{h.origen}</div>
          <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>{h.categoria}</div>
        </td>
        <td style={{ fontSize: 13, color: 'var(--color-gray-600)', maxWidth: 220 }}>
          {h.observacion}
          {h.declarado !== undefined && (
            <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
              <span className="badge badge-neutral">Declarado: {h.declarado}</span>
              <span className="badge badge-danger">Observado: {h.observado}</span>
            </div>
          )}
        </td>
        <td>
          {tiene ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span className="material-icons" style={{ fontSize: 14 }}>check_circle</span>
                Respondido
              </span>
              <button
                onClick={() => { setResModalId(h.id); setModalText(respuestas[h.id]) }}
                className="btn btn-ghost btn-sm"
              >
                Editar
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setResModalId(h.id); setModalText('') }}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <span className="material-icons" style={{ fontSize: 14 }}>edit</span>
              Responder
            </button>
          )}
        </td>
      </tr>
    )
  }

  return (
    <>
      <div className="topbar">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/efector/bandeja')}
          style={{ marginRight: 'var(--space-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>
          Volver
        </button>
        <div className="topbar-title">Respuestas de Emplazamiento</div>
      </div>

      <div className="page-content">
        {/* Acta Info */}
        <div className="card" style={{ marginBottom: 'var(--space-5)', borderLeft: '4px solid var(--color-danger)' }}>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 12, color: 'var(--color-gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Establecimiento</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-gray-900)' }}>{tramite.denominacion}</div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 2 }}>{tramite.cuit} · {tramite.localidad}</div>
              </div>
              <div>
                <span className={`badge ${conf.badge}`} style={{ fontSize: 13, padding: '6px 14px', display: 'inline-flex', alignItems: 'center' }}>
                  {conf.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert de emplazamiento */}
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-5)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span className="material-icons" style={{ color: '#b91c1c', fontSize: 22, marginTop: 2 }}>warning</span>
          <div>
            <div className="alert-title">ACTA EMPLAZADA</div>
            <div>El inspector ha otorgado un plazo de <strong>5 días</strong> para subsanar las observaciones y documentos rechazados.</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>Fecha límite: <span style={{ color: 'var(--color-danger)' }}>28/06/2024 17:00</span></div>
          </div>
        </div>

        {/* Progreso de respuestas */}
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontWeight: 600 }}>Progreso de respuestas</span>
              <span style={{ color: 'var(--color-gray-500)' }}>{Object.keys(respuestas).length} / {hallazgos.length}</span>
            </div>
            <div style={{ height: 8, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(Object.keys(respuestas).length / hallazgos.length) * 100}%`,
                background: allResponded ? 'var(--color-success)' : 'var(--color-brand-600)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        </div>

        {/* Datos Generales */}
        {hallazgosGeneral.length > 0 && (
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0, fontSize: 15 }}>
                <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 20 }}>assignment</span>
                Datos Generales
              </h3>
              <span className="badge badge-danger">{hallazgosGeneral.length} ítem{hallazgosGeneral.length > 1 ? 's' : ''}</span>
            </div>
            <div className="table-wrapper" style={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
              <table className="table">
                <thead><tr><th>Tipo</th><th>Origen</th><th>Observación Inspector</th><th>Acción</th></tr></thead>
                <tbody>{hallazgosGeneral.map(h => <HallazgoRow key={h.id} h={h} />)}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Datos del Trámite */}
        {hallazgosTramite.length > 0 && (
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0, fontSize: 15 }}>
                <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 20 }}>search</span>
                Datos del Trámite
              </h3>
              <span className="badge badge-danger">{hallazgosTramite.length} ítem{hallazgosTramite.length > 1 ? 's' : ''}</span>
            </div>
            <div className="table-wrapper" style={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
              <table className="table">
                <thead><tr><th>Tipo</th><th>Origen / Categoría</th><th>Detalle</th><th>Acción</th></tr></thead>
                <tbody>{hallazgosTramite.map(h => <HallazgoRow key={h.id} h={h} />)}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
          <button
            className="btn btn-secondary"
            onClick={handleGuardarBorrador}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>save</span>
            Guardar
          </button>
          <button
            className="btn btn-primary"
            disabled={!allResponded}
            onClick={handleEnviar}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: allResponded ? 1 : 0.5 }}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>send</span>
            Enviar
          </button>
        </div>
      </div>

      {/* Modal respuesta */}
      {resModalId && (
        <div className="modal-overlay" onClick={() => setResModalId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="material-icons" style={{ color: 'var(--color-brand-600)' }}>edit_note</span>
                Cargar Respuesta de Emplazamiento
              </div>
              <button className="btn-icon" onClick={() => setResModalId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-gray-600)' }}>
                <strong>Hallazgo:</strong> {HALLAZGOS.find(h => h.id === resModalId)?.observacion}
              </div>
              <div className="form-group">
                <label className="form-label">Respuesta de emplazamiento <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  value={modalText}
                  onChange={e => setModalText(e.target.value)}
                  placeholder="Describí las acciones tomadas para subsanar este hallazgo..."
                />
              </div>
              <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
                <label className="form-label">Documentación adjunta</label>
                <div style={{
                  border: '2px dashed var(--color-gray-300)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-5)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-gray-500)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}>
                  <span className="material-icons" style={{ fontSize: 24 }}>attach_file</span>
                  <span>Hacer clic para adjuntar archivo (PDF, JPG, PNG)</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setResModalId(null)}>Cancelar</button>
              <button
                className="btn btn-primary"
                disabled={!modalText.trim()}
                onClick={() => {
                  setRespuestas(prev => ({ ...prev, [resModalId]: modalText }))
                  setResModalId(null)
                }}
              >
                Guardar Respuesta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
