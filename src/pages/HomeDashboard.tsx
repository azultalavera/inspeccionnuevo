import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { ESTABLECIMIENTOS, EstadoTramite, type Tramite } from '../data/mockData'
import ModalIniciarTramite from '../components/ModalIniciarTramite'

const ESTADO_CONFIG: Record<string, { label: string; badge: string }> = {
  ACEPTADO_DOC_AUDITORIA: { label: 'Doc. Aceptada', badge: 'badge-info' },
  EN_INSPECCION: { label: 'En Inspección', badge: 'badge-warning' },
  RESPUESTA_EMPLAZAMIENTO: { label: 'Resp. Emplazamiento', badge: 'badge-danger' },
  ACEPTADO_INSPECCION: { label: 'Insp. Aprobada', badge: 'badge-success' },
  PENDIENTE_ARQUITECTURA: { label: 'Pend. Arquitectura', badge: 'badge-info' },
  PENDIENTE_PROTOCOLIZAR: { label: 'Pend. Protocolizar', badge: 'badge-success' }
}

function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState(window.innerWidth < 1024)
  React.useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth < 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

const TIPO_TRAMITE_LABELS: Record<string, string> = {
  HABILITACION: 'Habilitación',
  RENOVACION: 'Renovación',
  MODIFICACION: 'Modificación',
  ADECUACION: 'Adecuación',
}

export default function HomeDashboard() {
  const { user } = useAuth()
  const { tramites, crearNuevoTramite } = useApp()
  const navigate = useNavigate()
  const isTablet = useIsTablet()
  const [modalOpen, setModalOpen] = useState(false)

  const misTramites = user?.rol === 'EFECTOR'
    ? tramites.filter(t => t.cuit === '30-71234567-8')
    : tramites

  const sortedTramites = [...misTramites].sort((a, b) => b.fechaIngreso.localeCompare(a.fechaIngreso))

  // Calculate statistics based on role
  const getStats = () => {
    const statsCount = (est: EstadoTramite | EstadoTramite[]) => {
      if (Array.isArray(est)) {
        return tramites.filter((t: Tramite) => est.includes(t.estado)).length
      }
      return tramites.filter((t: Tramite) => t.estado === est).length
    }

    switch (user?.rol) {
      case 'INSPECTOR':
      case 'AUDITOR':
        return [
          {
            label: 'Para Inspeccionar',
            count: statsCount('ACEPTADO_DOC_AUD'),
            icon: 'assignment',
            color: '#0dcaf0',
            bg: 'rgba(13, 202, 240, 0.1)',
            estado: 'ACEPTADO_DOC_AUD',
            targetPath: `/${user.rol.toLowerCase()}/bandeja`
          },
          {
            label: 'En Inspección',
            count: statsCount('EN_ANALISIS_AUD'),
            icon: 'search',
            color: 'var(--color-warning)',
            bg: 'rgba(255, 193, 7, 0.1)',
            estado: 'EN_ANALISIS_AUD',
            targetPath: `/${user.rol.toLowerCase()}/bandeja`
          },
          {
            label: 'Con Emplazamiento',
            count: statsCount(['OBSERVADO_INSP', 'DESCARGO_INSP']),
            icon: 'report_problem',
            color: 'var(--color-danger)',
            bg: 'rgba(220, 53, 69, 0.1)',
            estado: 'OBSERVADO_INSP',
            targetPath: `/${user.rol.toLowerCase()}/bandeja`
          },
          {
            label: 'Aprobados',
            count: statsCount('ACEPTADO_INSP'),
            icon: 'check_circle',
            color: 'var(--color-success)',
            bg: 'rgba(40, 167, 69, 0.1)',
            estado: 'ACEPTADO_INSP',
            targetPath: `/${user.rol.toLowerCase()}/bandeja`
          }
        ]
      case 'ARQUITECTO':
        return [
          {
            label: 'Eval. Arquitectura',
            count: statsCount('PENDIENTE_EVAL_ARQ'),
            icon: 'architecture',
            color: 'var(--color-brand-600)',
            bg: 'rgba(0, 85, 165, 0.1)',
            estado: 'PENDIENTE_EVAL_ARQ',
            targetPath: '/arquitecto/expedientes'
          },
          {
            label: 'Mis Asignaciones',
            count: tramites.filter((t: Tramite) => t.agenteAsignado === `${user?.nombre} ${user?.apellido}`).length,
            icon: 'badge',
            color: '#6f42c1',
            bg: 'rgba(111, 66, 193, 0.1)',
            estado: '',
            targetPath: '/arquitecto/expedientes'
          }
        ]
      case 'COORDINADOR':
        return [
          {
            label: 'Trámites Sin Asignar',
            count: tramites.filter((t: Tramite) => !t.agenteAsignado).length,
            icon: 'assignment_late',
            color: 'var(--color-warning)',
            bg: 'rgba(255, 193, 7, 0.1)',
            estado: '',
            targetPath: '/coordinador/asignacion'
          },
          {
            label: 'Planes de Adecuación',
            count: tramites.filter((t: Tramite) => t.esAdecuacion).length,
            icon: 'gavel',
            color: 'var(--color-brand-600)',
            bg: 'rgba(0, 85, 165, 0.1)',
            estado: '',
            targetPath: '/coordinador/asignacion'
          }
        ]
      case 'PROTOCOLIZADOR':
        return [
          {
            label: 'Pendiente Protocolizar',
            count: statsCount('EN_PROTOCOLIZACION'),
            icon: 'history_edu',
            color: 'var(--color-success)',
            bg: 'rgba(40, 167, 69, 0.1)',
            estado: 'EN_PROTOCOLIZACION',
            targetPath: '/protocolizador/expedientes'
          }
        ]
      case 'EFECTOR':
        return [
          {
            label: 'Trámites Activos',
            count: tramites.length,
            icon: 'business',
            color: 'var(--color-brand-600)',
            bg: 'rgba(0, 85, 165, 0.1)',
            estado: '',
            targetPath: '/efector/bandeja'
          },
          {
            label: 'Respuestas Solicitadas',
            count: statsCount(['OBSERVADO_INSP', 'DESCARGO_INSP']),
            icon: 'rate_review',
            color: 'var(--color-danger)',
            bg: 'rgba(220, 53, 69, 0.1)',
            estado: '',
            targetPath: '/efector/bandeja'
          }
        ]
      default:
        return []
    }
  }

  const stats = getStats()

  // Shortcuts based on user role matching the sidebar functionalities
  const getShortcuts = () => {
    switch (user?.rol) {
      case 'INSPECTOR':
        return [
          { label: 'Expedientes Abiertos', icon: 'folder', desc: 'Consulta y gestión de expedientes abiertos', path: '/inspector/expedientes' },
          { label: 'Bandeja de Inspecciones', icon: 'fact_check', desc: 'Bandeja de Inspecciones sanitarias', path: '/inspector/inspecciones' },
          { label: 'Bandeja de Trámites', icon: 'assignment', desc: 'Bandeja general de trámites de inspección', path: '/inspector/bandeja' },
          { label: 'Consulta Establecimientos', icon: 'business', desc: 'Consulta e historial de establecimientos', path: '/inspector/establecimientos' }
        ]
      case 'ARQUITECTO':
        return [
          { label: 'Expedientes Abiertos', icon: 'folder', desc: 'Evaluar planos y carpetas técnicas de arquitectura', path: '/arquitecto/expedientes' },
          { label: 'Consulta de Trámites', icon: 'assignment', desc: 'Consulta general y búsqueda de trámites', path: '/arquitecto/bandeja' }
        ]
      case 'AUDITOR':
        return [
          { label: 'Expedientes Abiertos', icon: 'folder', desc: 'Evaluar informes médicos y de auditoría', path: '/auditor/expedientes' },
          { label: 'Consulta de Trámites', icon: 'assignment', desc: 'Panel de consulta general de trámites', path: '/auditor/bandeja' },
          { label: 'Consulta Establecimientos', icon: 'business', desc: 'Historial y registros de establecimientos', path: '/auditor/establecimientos' }
        ]
      case 'COORDINADOR':
        return [
          { label: 'Asignación de Trámites', icon: 'people', desc: 'Asignar inspectores, arquitectos y coordinar control', path: '/coordinador/asignacion' }
        ]
      case 'PROTOCOLIZADOR':
        return [
          { label: 'Expedientes Abiertos', icon: 'folder', desc: 'Firmar resoluciones y protocolizar expedientes', path: '/protocolizador/expedientes' },
          { label: 'Consulta de Trámites', icon: 'assignment', desc: 'Historial y resoluciones del ministerio', path: '/protocolizador/bandeja' },
          { label: 'Consulta Establecimientos', icon: 'business', desc: 'Ver establecimientos de salud habilitados', path: '/protocolizador/establecimientos' }
        ]
      case 'EFECTOR':
        return [
          {
            label: 'Iniciar Trámite',
            icon: 'add_circle',
            desc: 'Habilitación, Renovación o Modificación',
            path: '',
            isAction: true
          },
          { label: 'Mis Establecimientos', icon: 'business', desc: 'Consulta de mis establecimientos registrados', path: '/efector/establecimientos' },
          { label: 'Mis Trámites', icon: 'assignment', desc: 'Ver estado de mis trámites y habilitaciones', path: '/efector/bandeja' }
        ]
      case 'CONSULTOR':
        return [
          { label: 'Bandeja Establecimientos', icon: 'business', desc: 'Consulta de establecimientos habilitados', path: '/consultor/establecimientos' }
        ]
      default:
        return []
    }
  }

  const shortcuts = getShortcuts()

  // Latest activities mock list
  const getRecentActivities = () => {
    return tramites.slice(0, 3).map((t: Tramite) => {
      const conf = ESTADO_CONFIG[t.estado] || { label: t.estado, badge: 'badge-secondary' }
      return {
        id: t.id,
        title: t.denominacion,
        subtitle: `Trámite N° ${t.nroTramite}`,
        badgeText: conf.label,
        badgeStyle: conf.badge,
        date: t.fechaIngreso
      }
    })
  }

  const activities = getRecentActivities()

  const handleIniciarTramite = (tipo: 'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION', tipologia: string, establecimientoId?: string) => {
    const nuevo = crearNuevoTramite(tipo, tipologia, establecimientoId)
    setModalOpen(false)
    navigate(`/efector/alta-habilitacion/${nuevo.id}`)
  }

  return (
    <>
      <div className="page-content" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '24px',
        paddingBottom: isTablet ? 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px) + 20px)' : 'var(--space-6)',
        boxSizing: 'border-box'
      }}>
        
        {/* ROW 1: RESUMEN DE ESTADO & ACCESOS RAPIDOS (Side-by-Side with aligned height) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          alignItems: 'start'
        }}>
          {/* LEFT: RESUMEN DE ESTADO E INDICADORES */}
          {stats.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--color-gray-800)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 18 }}>analytics</span>
                  Resumen de Estado e Indicadores
                </h3>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(130px, 1fr))`,
                gap: '10px'
              }}>
                {stats.map(st => (
                  <div
                    key={st.label}
                    onClick={() => navigate(st.targetPath)}
                    className="card animate-fadein"
                    style={{
                      border: 'none',
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      margin: 0,
                      height: '56px',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-gray-900)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{st.count}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-500)', fontWeight: 650, marginTop: 2, lineHeight: 1.1 }}>{st.label}</div>
                    </div>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: st.bg || 'rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span className="material-icons" style={{ color: st.color, fontSize: 18 }}>{st.icon}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RIGHT: ACCESOS RAPIDOS */}
          {shortcuts.length > 0 && (
            <div>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--color-gray-800)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6, marginTop: 0 }}>
                <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 18 }}>shortcut</span>
                Accesos Rápidos
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))`,
                gap: '10px'
              }}>
                {shortcuts.map(sc => {
                  const isAction = (sc as any).isAction
                  return (
                    <div
                      key={sc.label}
                      onClick={() => {
                        if (isAction) {
                          setModalOpen(true)
                        } else {
                          navigate(sc.path)
                        }
                      }}
                      className="card animate-fadein"
                      style={{
                        border: 'none',
                        background: isAction ? 'var(--color-brand-600)' : '#ffffff',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: isAction ? '0 4px 12px rgba(0, 85, 165, 0.22)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                        margin: 0,
                        height: '56px',
                        boxSizing: 'border-box'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = isAction ? '0 8px 20px rgba(0, 85, 165, 0.35)' : '0 6px 16px rgba(0, 0, 0, 0.06)'
                        if (isAction) {
                          e.currentTarget.style.background = 'var(--color-brand-700)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none'
                        e.currentTarget.style.boxShadow = isAction ? '0 4px 12px rgba(0, 85, 165, 0.22)' : '0 2px 8px rgba(0, 0, 0, 0.02)'
                        if (isAction) {
                          e.currentTarget.style.background = 'var(--color-brand-600)'
                        } else {
                          e.currentTarget.style.background = '#ffffff'
                        }
                      }}
                    >
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        background: isAction ? 'rgba(255, 255, 255, 0.2)' : 'var(--color-brand-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <span className="material-icons" style={{ color: isAction ? 'white' : 'var(--color-brand-600)', fontSize: 18 }}>{sc.icon}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 750, color: isAction ? 'white' : 'var(--color-gray-900)' }}>{sc.label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ROW 2: RESUMEN DE TRAMITES & RESUMEN DE ESTABLECIMIENTOS */}
        {user?.rol === 'EFECTOR' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px',
            alignItems: 'stretch'
          }}>
            {/* LEFT: RESUMEN DE TRAMITES */}
            <div className="card" style={{
              border: 'none',
              background: '#ffffff',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 750, color: 'var(--color-gray-800)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 18 }}>assignment</span>
                  Resumen de Trámites
                </h3>
                
                <div className="table-responsive" style={{ border: '1px solid var(--color-gray-150)', borderRadius: '12px', overflowY: 'auto', maxHeight: '320px' }}>
                  <table className="table table-hover" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)' }}>Nro. Trámite</th>
                        <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)' }}>Establecimiento</th>
                        <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)' }}>Tipo</th>
                        <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)', textAlign: 'center' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTramites.map(t => {
                        const conf = ESTADO_CONFIG[t.estado] || { label: t.estado, badge: 'badge-secondary' }
                        return (
                          <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/efector/bandeja')}>
                            <td style={{ fontSize: 12.5, padding: '10px 16px', fontWeight: 600 }}>{t.nroTramite}</td>
                            <td style={{ fontSize: 12, padding: '10px 16px', color: 'var(--color-gray-800)', fontWeight: 600 }}>{t.denominacion}</td>
                            <td style={{ fontSize: 12, padding: '10px 16px', color: 'var(--color-gray-600)' }}>{TIPO_TRAMITE_LABELS[t.tipoTramite || ''] || t.tipoTramite || 'Habilitación'}</td>
                            <td style={{ fontSize: 12, padding: '10px 16px', textAlign: 'center' }}>
                              <span className={`badge ${conf.badge}`} style={{ fontSize: 9.5, padding: '2px 8px' }}>
                                {conf.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate('/efector/bandeja')}
                  style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-brand-600)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                >
                  Ver todos los trámites ({misTramites.length})
                  <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
                </button>
              </div>
            </div>

            {/* RIGHT: RESUMEN DE ESTABLECIMIENTOS */}
            <div className="card" style={{
              border: 'none',
              background: '#ffffff',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 750, color: 'var(--color-gray-800)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 18 }}>business</span>
                  Resumen de Establecimientos
                </h3>
                
                <div className="table-responsive" style={{ border: '1px solid var(--color-gray-150)', borderRadius: '12px', overflow: 'hidden' }}>
                  <table className="table table-hover" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)' }}>Establecimiento</th>
                        <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)' }}>CUIT</th>
                        <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)' }}>Tipología</th>
                        <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)' }}>Ubicación</th>
                        <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)', textAlign: 'center' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ESTABLECIMIENTOS.slice(0, 3).map(est => (
                        <tr key={est.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/efector/establecimientos')}>
                          <td style={{ fontSize: 12.5, padding: '10px 16px', fontWeight: 600 }}>{est.denominacion}</td>
                          <td style={{ fontSize: 12, padding: '10px 16px', color: 'var(--color-gray-500)' }}>{est.cuit}</td>
                          <td style={{ fontSize: 12, padding: '10px 16px', color: 'var(--color-gray-600)' }}>{est.tipologia}</td>
                          <td style={{ fontSize: 12, padding: '10px 16px', color: 'var(--color-gray-600)' }}>{est.localidad} ({est.departamento})</td>
                          <td style={{ fontSize: 12, padding: '10px 16px', textAlign: 'center' }}>
                            <span className={`badge ${est.estado === 'Habilitado' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 9.5, padding: '2px 8px' }}>
                              {est.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate('/efector/establecimientos')}
                  style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-brand-600)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                >
                  Ver todos los establecimientos (15)
                  <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* NON-EFECTOR: RESUMEN DE TRAMITES ONLY (Full Width) */
          <div className="card" style={{ border: 'none', background: '#ffffff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', margin: 0 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 750, color: 'var(--color-gray-800)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 18 }}>assignment</span>
              Resumen de Trámites
            </h3>
            
            <div className="table-responsive" style={{ border: '1px solid var(--color-gray-150)', borderRadius: '12px', overflowY: 'auto', maxHeight: '320px' }}>
              <table className="table table-hover" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)' }}>Nro. Trámite</th>
                    <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)' }}>Establecimiento</th>
                    <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)' }}>Tipo</th>
                    <th style={{ fontSize: 11, padding: '10px 16px', background: 'var(--color-gray-5)', textAlign: 'center' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTramites.map(t => {
                    const conf = ESTADO_CONFIG[t.estado] || { label: t.estado, badge: 'badge-secondary' }
                    const path = `/${user?.rol?.toLowerCase()}/bandeja`
                    return (
                      <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(path)}>
                        <td style={{ fontSize: 12.5, padding: '10px 16px', fontWeight: 600 }}>{t.nroTramite}</td>
                        <td style={{ fontSize: 12, padding: '10px 16px', color: 'var(--color-gray-800)', fontWeight: 600 }}>{t.denominacion}</td>
                        <td style={{ fontSize: 12, padding: '10px 16px', color: 'var(--color-gray-600)' }}>{TIPO_TRAMITE_LABELS[t.tipoTramite || ''] || t.tipoTramite || 'Habilitación'}</td>
                        <td style={{ fontSize: 12, padding: '10px 16px', textAlign: 'center' }}>
                          <span className={`badge ${conf.badge}`} style={{ fontSize: 9.5, padding: '2px 8px' }}>
                            {conf.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/${user?.rol?.toLowerCase()}/bandeja`)}
                style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-brand-600)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
              >
                Ver todos los trámites ({misTramites.length})
                <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* SECTION 4: ACTIVIDAD RECIENTE (At the very bottom, Full Width) */}
        {activities.length > 0 && (
          <div className="card" style={{ border: 'none', background: '#ffffff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', margin: 0 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 750, color: 'var(--color-gray-800)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 18 }}>update</span>
              Actividad Reciente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activities.map((act: any) => (
                <div key={act.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-icons" style={{ color: 'var(--color-gray-400)', fontSize: 18 }}>assignment</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-gray-800)' }}>
                        {act.title}
                      </span>
                    </div>
                    <span className={`badge ${act.badgeStyle}`} style={{ fontSize: 8.5, padding: '2px 6px' }}>
                      {act.badgeText}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-gray-500)', paddingLeft: '26px' }}>
                    <span>{act.subtitle}</span>
                    <span>{act.date}</span>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--color-gray-150)', paddingTop: 4 }}></div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal Iniciar Trámite */}
      <ModalIniciarTramite
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleIniciarTramite}
      />

      {isTablet && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          height: 'var(--tab-bar-height)',
          background: 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 12px)',
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          maxWidth: 768, margin: '0 auto',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
        }}>
          {user?.rol === 'INSPECTOR' ? (
            [
              { icon: 'home', label: 'Inicio', active: true, path: '/inspector/home' },
              { icon: 'folder', label: 'Abiertos', active: false, path: '/inspector/expedientes' },
              { icon: 'assignment', label: 'Trámites', active: false, path: '/inspector/bandeja' },
              { icon: 'business', label: 'Locales', active: false, path: '/inspector/establecimientos' },
            ].map(tab => (
              <button key={tab.label} onClick={() => navigate(tab.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', flex: 1, height: '100%', padding: '8px 0' }}>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 32, borderRadius: 16, background: tab.active ? 'rgba(0, 122, 255, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}>
                  <span className="material-icons" style={{ fontSize: 26, color: tab.active ? 'var(--ios-blue)' : '#7f8c8d', transition: 'all 0.2s ease', transform: tab.active ? 'scale(1.05)' : 'scale(1)' }}>{tab.icon}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: tab.active ? 700 : 500, color: tab.active ? 'var(--ios-blue)' : '#7f8c8d', lineHeight: 1.2, letterSpacing: '0.2px' }}>
                  {tab.label}
                </span>
              </button>
            ))
          ) : user?.rol === 'EFECTOR' ? (
            [
              { icon: 'home', label: 'Inicio', active: true, path: '/efector/home' },
              { icon: 'business', label: 'Locales', active: false, path: '/efector/establecimientos' },
              { icon: 'assignment', label: 'Trámites', active: false, path: '/efector/bandeja' },
            ].map(tab => (
              <button key={tab.label} onClick={() => navigate(tab.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', flex: 1, height: '100%', padding: '8px 0' }}>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 32, borderRadius: 16, background: tab.active ? 'rgba(0, 122, 255, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}>
                  <span className="material-icons" style={{ fontSize: 26, color: tab.active ? 'var(--ios-blue)' : '#7f8c8d', transition: 'all 0.2s ease', transform: tab.active ? 'scale(1.05)' : 'scale(1)' }}>{tab.icon}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: tab.active ? 700 : 500, color: tab.active ? 'var(--ios-blue)' : '#7f8c8d', lineHeight: 1.2, letterSpacing: '0.2px' }}>
                  {tab.label}
                </span>
              </button>
            ))
          ) : null}
        </div>
      )}
    </>
  )
}
