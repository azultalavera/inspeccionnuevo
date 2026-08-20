import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRAMITES, type Tramite, type EstadoTramite, ESTADO_CONFIG } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import UserAvatarMenu from '../components/UserAvatarMenu'

const getEtapaLabel = (estado: string) => {
  switch (estado) {
    case 'BORRADOR_ARQ':
    case 'PENDIENTE_EVAL_ARQ':
    case 'EN_ANALISIS_ARQ':
    case 'OBSERVADO_ARQ':
    case 'RECTIFICADO_ARQ':
    case 'RECHAZADO_ARQ':
      return 'ARQUITECTURA'

    case 'ADECUADO_ARQ':
    case 'ADECUADO_OBS_ARQ':
      return 'ESTABLECIMIENTO'

    case 'BORRADOR_AUD':
    case 'PENDIENTE_EVAL_AUD':
    case 'EN_ANALISIS_AUD':
    case 'OBSERVADO_AUD':
    case 'RECTIFICADO_AUD':
    case 'ACEPTADO_DOC_AUD':
    case 'ACEPTADO_INSP':
    case 'OBSERVADO_INSP':
    case 'DESCARGO_INSP':
      return 'DOCUMENTOS ADJUNTOS'

    case 'EN_PROTOCOLIZACION':
      return 'PROTOCOLIZACIÓN'

    case 'FINALIZADO':
      return 'FINALIZADO'

    default:
      return 'DOCUMENTOS ADJUNTOS'
  }
}

const getTipoLabel = (tipo?: string) => {
  switch (tipo) {
    case 'HABILITACION': return 'Habilitación'
    case 'RENOVACION': return 'Renovación'
    case 'MODIFICACION': return 'Modificación'
    case 'ADECUACION': return 'Adecuación'
    default: return 'Habilitación'
  }
}

const getTipoBadgeStyle = (tipo?: string) => {
  switch (tipo) {
    case 'HABILITACION':
      return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD', icon: 'verified', accent: '#0284C7' }
    case 'RENOVACION':
      return { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0', icon: 'autorenew', accent: '#16A34A' }
    case 'MODIFICACION':
      return { bg: '#F3E8FF', color: '#7E22CE', border: '#E9D5FF', icon: 'edit', accent: '#9333EA' }
    case 'ADECUACION':
      return { bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA', icon: 'build', accent: '#EA580C' }
    default:
      return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD', icon: 'folder', accent: '#0055A5' }
  }
}

const getTipologiaIcon = (tipologia?: string) => {
  if (!tipologia) return 'medical_services'
  const t = tipologia.toUpperCase()
  if (t.includes('GERIÁTRIC') || t.includes('GERIATRICO')) return 'elderly'
  if (t.includes('CIRUG')) return 'medical_services'
  if (t.includes('AMBULATORI')) return 'health_and_safety'
  if (t.includes('CLÍNICA') || t.includes('CLINICA') || t.includes('SANATORIO') || t.includes('HOSPITAL')) return 'local_hospital'
  if (t.includes('LABORATORIO')) return 'biotech'
  if (t.includes('CONSULTORIO')) return 'sanitizer'
  return 'medical_services'
}

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth < 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

export default function BandejaExpedientesAbiertos() {
  const { user } = useAuth()
  const { tramites, iniciarInspeccion } = useApp()
  const navigate = useNavigate()
  const isTablet = useIsTablet()

  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES)
  const [evaluatingTramite, setEvaluatingTramite] = useState<Tramite | null>(null)

  // Sync locally
  useEffect(() => {
    setLocalTramites(tramites)
  }, [tramites])

  // Get active state for filtering open files based on active agent role
  const matchOpenState = (t: Tramite): boolean => {
    if (user?.rol === 'INSPECTOR') {
      return t.estado === 'ACEPTADO_DOC_AUD' || t.estado === 'DESCARGO_INSP' || t.estado === 'OBSERVADO_INSP'
    }
    if (user?.rol === 'ARQUITECTO') return t.estado === 'PENDIENTE_EVAL_ARQ' || t.estado === 'EN_ANALISIS_ARQ'
    if (user?.rol === 'AUDITOR') return t.estado === 'PENDIENTE_EVAL_AUD' || t.estado === 'EN_ANALISIS_AUD'
    return t.estado === 'EN_PROTOCOLIZACION'
  }

  // Filter list to assigned open tramites for current role
  const filtrados = localTramites.filter(matchOpenState)

  // Handle selecting a row directly
  const handleSelectRow = (t: Tramite) => {
    if (user?.rol === 'INSPECTOR') {
      if (t.estado === 'DESCARGO_INSP') {
        navigate(`/inspector/validacion/${t.id}`)
      } else {
        if (t.estado === 'ACEPTADO_DOC_AUD') iniciarInspeccion(t.id)
        navigate(`/inspector/inspeccion/${t.id}`)
      }
    } else {
      setEvaluatingTramite(t)
    }
  }

  const handleConfirmarEvaluacion = (aprobado: boolean) => {
    if (!evaluatingTramite) return
    let nuevoEstado: EstadoTramite = evaluatingTramite.estado
    
    if (evaluatingTramite.estado === 'PENDIENTE_EVAL_ARQ' || evaluatingTramite.estado === 'EN_ANALISIS_ARQ') {
      nuevoEstado = aprobado ? 'PENDIENTE_EVAL_AUD' : 'RECHAZADO_ARQ'
    } else if (evaluatingTramite.estado === 'PENDIENTE_EVAL_AUD' || evaluatingTramite.estado === 'EN_ANALISIS_AUD') {
      nuevoEstado = aprobado ? 'ACEPTADO_DOC_AUD' : 'RECHAZADO_ARQ'
    } else if (evaluatingTramite.estado === 'EN_PROTOCOLIZACION') {
      nuevoEstado = aprobado ? 'FINALIZADO' : 'RECHAZADO_ARQ'
    }

    setLocalTramites(prev => prev.map(t =>
      t.id === evaluatingTramite.id ? { ...t, estado: nuevoEstado } : t
    ))
    alert(`✓ Trámite evaluado y cambiado a estado: ${nuevoEstado}`)
    setEvaluatingTramite(null)
  }

  const TIPOS_ORDEN: ('HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION')[] = [
    'HABILITACION',
    'RENOVACION',
    'MODIFICACION',
    'ADECUACION'
  ]

  const groupedTramites = TIPOS_ORDEN.map(tipoKey => {
    const list = filtrados.filter(t => (t.tipoTramite || 'HABILITACION') === tipoKey)
    return {
      tipoKey,
      label: getTipoLabel(tipoKey),
      style: getTipoBadgeStyle(tipoKey),
      items: list
    }
  }).filter(group => group.items.length > 0)

  // ── TABLET VIEW ────────────────────────────────────────────────────
  if (isTablet) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 768,
        margin: '0 auto',
        paddingBottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))',
      }}>
        {/* Topbar */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: 'var(--space-3) var(--space-4)',
          position: 'sticky',
          top: 0,
          zIndex: 200,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <UserAvatarMenu size={34} align="right" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--ios-gray)', lineHeight: 1 }}>
                {user?.rol === 'INSPECTOR' ? 'Inspector' : user?.rol === 'ARQUITECTO' ? 'Arquitecto' : user?.rol === 'AUDITOR' ? 'Auditor' : 'Protocolizador'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', lineHeight: 1.2, marginTop: 1 }}>
                {user?.nombre} {user?.apellido}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable list seamless cards without borders */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px' }}>
              Trámites en curso
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              Bandeja de validaciones y seguimiento rápido ({filtrados.length})
            </div>
          </div>

          {filtrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ios-gray)' }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>📥</div>
              <div style={{ fontWeight: 700, color: 'var(--color-gray-700)', fontSize: 13 }}>Sin trámites asignados</div>
            </div>
          ) : (
            groupedTramites.map(group => (
              <div key={group.tipoKey} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingLeft: 2 }}>
                  <span className="material-icons" style={{ fontSize: 16, color: group.style.color }}>{group.style.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    {group.label} ({group.items.length})
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {group.items.map(t => {
                    const conf = ESTADO_CONFIG[t.estado]
                    const etapa = getEtapaLabel(t.estado)
                    const iconName = getTipologiaIcon(t.tipologia)

                    return (
                      <div
                        key={t.id}
                        onClick={() => handleSelectRow(t)}
                        style={{
                          background: 'white',
                          borderRadius: 16,
                          border: 'none',
                          padding: '14px 16px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: group.style.bg,
                            color: group.style.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <span className="material-icons" style={{ fontSize: 20 }}>{iconName}</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', lineHeight: 1.25 }}>
                              {t.denominacion}
                            </div>
                            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, fontWeight: 600 }}>
                              {t.tipologia}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Etapa:</span>
                          <span style={{ fontSize: 11.5, fontWeight: 750, color: '#0055A5', background: '#F0F7FF', padding: '2px 8px', borderRadius: 6 }}>
                            {etapa}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #F8FAFC' }}>
                          <span className={`badge ${conf?.badge || 'badge-neutral'}`} style={{ fontSize: 10.5, padding: '3px 9px', borderRadius: 9999 }}>
                            {conf?.label || t.estado}
                          </span>
                          <span className="material-icons" style={{ fontSize: 18, color: '#94A3B8' }}>chevron_right</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // ── DESKTOP VIEW ───────────────────────────────────────────────────
  return (
    <>
      <div className="topbar" style={{ height: 48, padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Trámites en curso</span>
          <span style={{ fontSize: 12, color: '#64748B', borderLeft: '1px solid #CBD5E1', paddingLeft: 12 }}>
            Bandeja de validaciones y seguimiento rápido ({filtrados.length})
          </span>
        </div>
      </div>

      <div className="page-content" style={{ padding: '20px' }}>
        {filtrados.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 16,
            border: 'none',
            padding: '40px 16px',
            textAlign: 'center',
            color: '#64748B',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <span className="material-icons" style={{ fontSize: 36, color: '#CBD5E1', marginBottom: 6, display: 'block' }}>inbox</span>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1E293B' }}>No hay trámites asignados en este momento</div>
          </div>
        ) : (
          groupedTramites.map(group => (
            <div key={group.tipoKey} style={{ marginBottom: 24 }}>
              {/* Group Section Header Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
                paddingBottom: 6,
                borderBottom: '2px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-icons" style={{ fontSize: 20, color: group.style.color }}>
                    {group.style.icon}
                  </span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Trámites de {group.label}
                  </h3>
                  <span style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    padding: '2px 9px',
                    borderRadius: 9999,
                    background: group.style.bg,
                    color: group.style.color,
                  }}>
                    {group.items.length}
                  </span>
                </div>
              </div>

              {/* Minimalist Cards Grid (NO BORDERS) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                gap: 16
              }}>
                {group.items.map(t => {
                  const conf = ESTADO_CONFIG[t.estado]
                  const etapa = getEtapaLabel(t.estado)
                  const iconName = getTipologiaIcon(t.tipologia)

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectRow(t)}
                      style={{
                        background: 'white',
                        borderRadius: 16,
                        border: 'none',
                        padding: '16px 18px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                        transition: 'all 0.2s ease-in-out',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 130
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.07)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.03)'
                      }}
                    >
                      {/* Top: Icon + Nombre del Establecimiento + Tipología */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                          <div style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            background: group.style.bg,
                            color: group.style.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <span className="material-icons" style={{ fontSize: 22 }}>{iconName}</span>
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                              {t.denominacion}
                            </h4>
                            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, fontWeight: 600 }}>
                              {t.tipologia}
                            </div>
                          </div>
                        </div>

                        {/* Etapa */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                          <span style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>Etapa:</span>
                          <span style={{
                            fontSize: 11.5,
                            fontWeight: 750,
                            color: '#0055A5',
                            background: '#F0F7FF',
                            padding: '3px 10px',
                            borderRadius: 6
                          }}>
                            {etapa}
                          </span>
                        </div>
                      </div>

                      {/* Footer: Estado + Arrow */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 10,
                        borderTop: '1px solid #F8FAFC'
                      }}>
                        <span className={`badge ${conf?.badge || 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          <span className="material-icons" style={{ fontSize: 13 }}>{conf?.icon || 'help'}</span>
                          <span>{conf?.label || t.estado}</span>
                        </span>
                        <span className="material-icons" style={{ fontSize: 18, color: '#94A3B8' }}>
                          chevron_right
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Evaluar */}
      {evaluatingTramite && (
        <div className="modal-overlay" onClick={() => setEvaluatingTramite(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="material-icons" style={{ color: 'var(--color-brand-600)' }}>edit_note</span>
                Evaluación de Carpeta Técnica
              </div>
              <button className="btn-icon" onClick={() => setEvaluatingTramite(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 12 }}>
                <h4 style={{ margin: 0 }}>{evaluatingTramite.denominacion}</h4>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-gray-500)' }}>
                  Trámite N° {evaluatingTramite.nroTramite} · {evaluatingTramite.tipologia}
                </p>
              </div>

              <p style={{ fontSize: 14, color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
                Revisá los planos, la documentación declarada y las habilitaciones adjuntas. Si el expediente cumple con todos los requisitos regulatorios vigentes, aprobá la etapa para que pase al siguiente agente del flujo de control.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn-secondary" onClick={() => setEvaluatingTramite(null)}>Cerrar</button>
              <button onClick={() => handleConfirmarEvaluacion(false)} className="btn btn-danger">
                ✗ Observar
              </button>
              <button onClick={() => handleConfirmarEvaluacion(true)} className="btn btn-success" style={{ flex: 1 }}>
                ✓ Aprobar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
