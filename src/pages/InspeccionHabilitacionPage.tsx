import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRAMITES, type Tramite, type EstadoTramite, ESTADO_CONFIG } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import TableActionsMenu from '../components/TableActionsMenu'

export default function InspeccionHabilitacionPage() {
  const { user } = useAuth()
  const { tramites, iniciarInspeccion } = useApp()
  const navigate = useNavigate()

  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES)

  useEffect(() => {
    setLocalTramites(tramites)
  }, [tramites])

  const handleAbrirInspeccion = (id: string, estado: EstadoTramite) => {
    if (estado === 'ACEPTADO_DOC_AUD') iniciarInspeccion(id)
    navigate(`/inspector/inspeccion/${id}`)
  }

  const handleVerValidacion = (id: string) => navigate(`/inspector/validacion/${id}`)

  // Base filter: only inspection phase + HABILITACION type
  const filtrados = localTramites.filter(t => {
    const esEstadoInspeccion = [
      'ACEPTADO_DOC_AUD',
      'OBSERVADO_INSP',
      'DESCARGO_INSP',
      'ACEPTADO_INSP',
      'RE_INSP_SOLICITADA',
      'EN_PROTOCOLIZACION',
      'FINALIZADO'
    ].includes(t.estado)
    return esEstadoInspeccion && t.tipoInspeccion === 'HABILITACION'
  })

  const backPath = user?.rol === 'COORDINADOR' ? '/coordinador/inspecciones' : '/inspector/inspecciones'

  return (
    <>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(backPath)}
            style={{
              background: '#FFFFFF',
              color: '#27AE60',
              border: '1.5px solid #27AE60',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 750,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
            Volver
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ fontSize: 24, color: '#27AE60' }}>verified</span>
            <div className="topbar-title">Inspección por Habilitación</div>
          </div>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Establecimiento</th>
                <th>Trámite / Expediente</th>
                <th>Formato</th>
                <th>Inspector Asignado</th>
                <th>Estado Actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                    <span className="material-icons" style={{ fontSize: 48, color: '#27AE60', opacity: 0.3 }}>verified</span>
                    <div style={{ fontWeight: 600, marginTop: 8 }}>No hay inspecciones por habilitación registradas.</div>
                  </td>
                </tr>
              ) : filtrados.map(t => {
                const conf = ESTADO_CONFIG[t.estado]
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 4, height: 32, borderRadius: 2, background: '#27AE60', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{t.denominacion}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginTop: 2 }}>{t.tipologia}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--color-gray-900)' }}>{t.nroTramite}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>{t.nroExpediente}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ padding: '3px 8px', fontWeight: 600 }}>
                        {t.formatoInspeccion}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-gray-700)' }}>
                      {t.inspectorAsignado || t.agenteAsignado || 'Sin Asignar'}
                    </td>
                    <td>
                      <span className={`badge ${conf?.badge || 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px' }}>
                        {conf?.label || t.estado}
                      </span>
                    </td>
                    <td>
                      <TableActionsMenu
                        options={[
                          ...(t.estado === 'ACEPTADO_DOC_AUD' || t.estado === 'RE_INSP_SOLICITADA' ? [{
                            label: t.estado === 'ACEPTADO_DOC_AUD' ? 'Iniciar Inspección' : 'Continuar Inspección',
                            icon: 'search',
                            onClick: () => handleAbrirInspeccion(t.id, t.estado)
                          }] : []),
                          ...(t.estado === 'DESCARGO_INSP' ? [{
                            label: 'Revisar Respuestas',
                            icon: 'rate_review',
                            onClick: () => handleVerValidacion(t.id)
                          }] : []),
                          {
                            label: 'Ver Historial',
                            icon: 'history',
                            onClick: () => alert(`Historial de Inspección N° ${t.nroTramite}`)
                          },
                          {
                            label: 'Descargar Acta',
                            icon: 'download',
                            onClick: () => alert(`Descargando Acta del Trámite ${t.nroTramite}...`)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
