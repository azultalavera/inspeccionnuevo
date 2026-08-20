import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRAMITES, type Tramite, type EstadoTramite, ESTADO_CONFIG } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import TableActionsMenu from '../components/TableActionsMenu'
import BandejaAlertasDenuncia from './BandejaAlertasDenuncia'

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components / Config
// ──────────────────────────────────────────────────────────────────────────────

const PRIORIDAD_BADGE_STYLE: Record<string, { color: string; bg: string; border: string; label: string; icon: string }> = {
  CRITICA: { label: 'CRÍTICA', color: '#991B1B', bg: '#FEE2E2', border: '#FECACA', icon: 'crisis_alert' },
  URGENTE: { label: 'URGENTE', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', icon: 'priority_high' },
  NORMAL: { label: 'NORMAL', color: '#1E3A5F', bg: '#EFF6FF', border: '#BFDBFE', icon: 'report' },
}

const ORIGEN_BADGE_STYLE: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  JUDICIAL: { label: 'Judicial', color: '#6B21A8', bg: '#F3E8FF', icon: 'gavel' },
  AUTORIDAD: { label: 'Autoridad', color: '#0E4F87', bg: '#DBEAFE', icon: 'account_balance' },
  CIUDADANA: { label: 'Ciudadana', color: '#065F46', bg: '#D1FAE5', icon: 'people' },
}

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth <= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

export default function InspeccionDenunciaPage() {
  const { user } = useAuth()
  const { tramites, iniciarInspeccion } = useApp()
  const navigate = useNavigate()
  const isTablet = useIsTablet()

  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES)
  const [subTab, setSubTab] = useState<'ALERTAS' | 'EN_CURSO'>('ALERTAS')

  useEffect(() => {
    setLocalTramites(tramites)
  }, [tramites])

  const handleAbrirInspeccion = (id: string, estado: EstadoTramite) => {
    if (estado === 'ACEPTADO_DOC_AUD') iniciarInspeccion(id)
    navigate(`/inspector/inspeccion/${id}`)
  }

  const handleVerValidacion = (id: string) => navigate(`/inspector/validacion/${id}`)

  // Base filter: only inspection phase + DENUNCIA type
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
    return esEstadoInspeccion && t.tipoInspeccion === 'DENUNCIA'
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
              color: '#E74C3C',
              border: '1.5px solid #E74C3C',
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
            <span className="material-icons" style={{ fontSize: 24, color: '#E74C3C' }}>report</span>
            <div className="topbar-title">Inspección por Denuncia</div>
          </div>
        </div>

        {/* Subtab Toggle */}
        <div style={{ display: 'flex', gap: 8, background: '#F1F5F9', padding: 4, borderRadius: 8 }}>
          <button
            onClick={() => setSubTab('ALERTAS')}
            style={{
              background: subTab === 'ALERTAS' ? '#E74C3C' : 'transparent',
              color: subTab === 'ALERTAS' ? 'white' : '#475569',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span className="material-icons" style={{ fontSize: 15 }}>notifications_active</span>
            Bandeja de Alertas
          </button>

          <button
            onClick={() => setSubTab('EN_CURSO')}
            style={{
              background: subTab === 'EN_CURSO' ? '#E74C3C' : 'transparent',
              color: subTab === 'EN_CURSO' ? 'white' : '#475569',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span className="material-icons" style={{ fontSize: 15 }}>assignment</span>
            Inspecciones en Curso ({filtrados.length})
          </button>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {subTab === 'ALERTAS' ? (
          <BandejaAlertasDenuncia hideTopbar={true} />
        ) : isTablet ? (
          /* Responsive Cards for Tablet/Mobile */
          filtrados.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                <span className="material-icons" style={{ fontSize: 48, color: '#E74C3C', opacity: 0.3 }}>report</span>
                <div style={{ fontWeight: 600, marginTop: 8 }}>No hay inspecciones por denuncia en curso.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {filtrados.map(t => {
                const conf = ESTADO_CONFIG[t.estado]
                const prio = t.prioridadDenuncia ? PRIORIDAD_BADGE_STYLE[t.prioridadDenuncia] : null
                const orig = t.origenDenuncia ? ORIGEN_BADGE_STYLE[t.origenDenuncia] : null
                return (
                  <div
                    key={t.id}
                    className="card"
                    style={{
                      padding: 'var(--space-4)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      borderLeft: `4px solid ${prio ? prio.color : '#E2E8F0'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className={`badge ${conf?.badge || 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px' }}>
                        {conf?.label || t.estado}
                      </span>
                      <span className="badge badge-neutral" style={{ padding: '3px 8px', fontWeight: 600 }}>
                        {t.formatoInspeccion}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {prio && (
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 10,
                            color: prio.color,
                            background: prio.bg,
                            border: `1px solid ${prio.border}`,
                            padding: '2px 6px',
                            borderRadius: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 12 }}>{prio.icon}</span>
                          {prio.label}
                        </span>
                      )}
                      {orig && (
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 10,
                            color: orig.color,
                            background: orig.bg,
                            padding: '2px 6px',
                            borderRadius: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 11 }}>{orig.icon}</span>
                          {orig.label}
                        </span>
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 4, height: 24, borderRadius: 2, background: prio ? prio.color : '#E74C3C', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-gray-900)', fontSize: 15 }}>{t.denominacion}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginTop: 2 }}>{t.tipologia}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>Trámite / Expediente</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--color-gray-900)', marginTop: 2 }}>{t.nroTramite}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>{t.nroExpediente}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>Inspector Asignado</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-gray-700)', marginTop: 2 }}>
                          {t.inspectorAsignado || t.agenteAsignado || 'Sin Asignar'}
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          /* Desktop Table View */
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 4, padding: 0 }}></th>
                  <th>Establecimiento</th>
                  <th>Trámite / Expediente</th>
                  <th>Prioridad</th>
                  <th>Origen</th>
                  <th>Formato</th>
                  <th>Inspector Asignado</th>
                  <th>Estado Actual</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                      <span className="material-icons" style={{ fontSize: 48, color: '#E74C3C', opacity: 0.3 }}>report</span>
                      <div style={{ fontWeight: 600, marginTop: 8 }}>No hay inspecciones por denuncia en curso.</div>
                    </td>
                  </tr>
                ) : (
                  filtrados.map(t => {
                    const conf = ESTADO_CONFIG[t.estado]
                    const prio = t.prioridadDenuncia ? PRIORIDAD_BADGE_STYLE[t.prioridadDenuncia] : null
                    const orig = t.origenDenuncia ? ORIGEN_BADGE_STYLE[t.origenDenuncia] : null

                    return (
                      <tr key={t.id}>
                        {/* Priority strip indicator */}
                        <td style={{ padding: 0, width: 4 }}>
                          <div style={{ width: 4, background: prio ? prio.color : '#E2E8F0', minHeight: 48 }} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 4, height: 32, borderRadius: 2, background: prio ? prio.color : '#E74C3C', flexShrink: 0 }} />
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
                          {prio ? (
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 10,
                                color: prio.color,
                                background: prio.bg,
                                border: `1px solid ${prio.border}`,
                                padding: '2px 6px',
                                borderRadius: 4,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 12 }}>{prio.icon}</span>
                              {prio.label}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>—</span>
                          )}
                        </td>
                        <td>
                          {orig ? (
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: 10,
                                color: orig.color,
                                background: orig.bg,
                                padding: '2px 6px',
                                borderRadius: 4,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 11 }}>{orig.icon}</span>
                              {orig.label}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>—</span>
                          )}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

