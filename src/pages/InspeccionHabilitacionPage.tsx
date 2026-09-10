import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRAMITES, type Tramite, type EstadoTramite, ESTADO_CONFIG } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import TableActionsMenu from '../components/TableActionsMenu'
import ModalEmitirOrdenRutina from '../components/ModalEmitirOrdenRutina'

const getTipologiaIcon = (tipologia?: string) => {
  if (!tipologia) return 'local_hospital'
  const t = tipologia.toUpperCase()
  if (t.includes('HOSPITAL') || t.includes('CLÍNICA') || t.includes('SANATORIO')) return 'local_hospital'
  if (t.includes('FARMACIA')) return 'medication'
  if (t.includes('GERIÁTRIC') || t.includes('RESIDENCIA') || t.includes('HOGAR')) return 'elderly'
  if (t.includes('LABORATORIO')) return 'biotech'
  if (t.includes('DIÁLISIS')) return 'water_drop'
  if (t.includes('ODONTOL') || t.includes('DENTAL')) return 'dentistry'
  if (t.includes('CONSULTORIO')) return 'medical_services'
  if (t.includes('CIRUGÍA')) return 'healing'
  return 'domain'
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

export default function InspeccionHabilitacionPage() {
  const { user } = useAuth()
  const { tramites, iniciarInspeccion } = useApp()
  const navigate = useNavigate()
  const isTablet = useIsTablet()

  const isCoordinador = user?.rol === 'COORDINADOR'
  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('TODOS')
  const [filterFormato, setFilterFormato] = useState<string>('TODOS')
  const [tramiteEmitirOrden, setTramiteEmitirOrden] = useState<Tramite | null>(null)

  useEffect(() => {
    setLocalTramites(tramites)
  }, [tramites])

  const basePathInspeccion = user?.rol === 'COORDINADOR' ? '/coordinador/inspeccion' : '/inspector/inspeccion'

  const handleAbrirInspeccion = (id: string, estado: EstadoTramite) => {
    if (estado === 'ACEPTADO_DOC_AUD') iniciarInspeccion(id)
    navigate(`${basePathInspeccion}/${id}`)
  }

  const handleRevisarDescargo = (id: string) => {
    navigate(`${basePathInspeccion}/${id}?view=revision`)
  }

  // Base filter: only inspection phase + HABILITACION type
  const baseHabilitaciones = useMemo(() => {
    const esEstadoInspeccion = [
      'ACEPTADO_DOC_AUD',
      'EN_ANALISIS_AUD',
      'OBSERVADO_INSP',
      'DESCARGO_INSP',
      'ACEPTADO_INSP',
      'RE_INSP_SOLICITADA',
      'EN_PROTOCOLIZACION',
      'FINALIZADO'
    ]
    return localTramites.filter(t => esEstadoInspeccion.includes(t.estado) && t.tipoInspeccion === 'HABILITACION')
  }, [localTramites])

  // Filtered by search and chips
  const filtrados = useMemo(() => {
    return baseHabilitaciones.filter(t => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const matchName = t.denominacion?.toLowerCase().includes(query)
        const matchTramite = t.nroTramite?.toLowerCase().includes(query)
        const matchExp = t.nroExpediente?.toLowerCase().includes(query)
        const matchLoc = t.localidad?.toLowerCase().includes(query)
        const matchTipologia = t.tipologia?.toLowerCase().includes(query)
        const matchInspector = (t.inspectorAsignado || t.agenteAsignado)?.toLowerCase().includes(query)
        if (!matchName && !matchTramite && !matchExp && !matchLoc && !matchTipologia && !matchInspector) {
          return false
        }
      }

      // Filter by estado category
      if (filterEstado !== 'TODOS') {
        if (filterEstado === 'INICIAR' && t.estado !== 'ACEPTADO_DOC_AUD') return false
        if (filterEstado === 'EN_CURSO' && !['EN_ANALISIS_AUD', 'RE_INSP_SOLICITADA'].includes(t.estado)) return false
        if (filterEstado === 'DESCARGO' && t.estado !== 'DESCARGO_INSP') return false
        if (filterEstado === 'OBSERVADOS' && t.estado !== 'OBSERVADO_INSP') return false
        if (filterEstado === 'FINALIZADOS' && !['ACEPTADO_INSP', 'EN_PROTOCOLIZACION', 'FINALIZADO'].includes(t.estado)) return false
      }

      // Filter by formato
      if (filterFormato !== 'TODOS' && t.formatoInspeccion !== filterFormato) {
        return false
      }

      return true
    })
  }, [baseHabilitaciones, searchTerm, filterEstado, filterFormato])

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      total: baseHabilitaciones.length,
      iniciar: baseHabilitaciones.filter(t => t.estado === 'ACEPTADO_DOC_AUD').length,
      enCurso: baseHabilitaciones.filter(t => ['EN_ANALISIS_AUD', 'RE_INSP_SOLICITADA'].includes(t.estado)).length,
      descargo: baseHabilitaciones.filter(t => t.estado === 'DESCARGO_INSP').length,
      observados: baseHabilitaciones.filter(t => t.estado === 'OBSERVADO_INSP').length,
    }
  }, [baseHabilitaciones])

  const backPath = user?.rol === 'COORDINADOR' ? '/coordinador/inspecciones' : '/inspector/inspecciones'

  return (
    <>
      {/* Topbar */}
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(backPath)}
            style={{
              background: '#FFFFFF',
              color: '#27AE60',
              border: '1.5px solid #27AE60',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#ECFDF5'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#FFFFFF'
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
            Volver
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#27AE60'
            }}>
              <span className="material-icons" style={{ fontSize: 22 }}>verified</span>
            </div>
            <div>
              <div className="topbar-title" style={{ margin: 0, lineHeight: 1.2 }}>Inspección por Habilitación</div>
              <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 2 }}>
                Gestión de actas y habilitaciones iniciales de establecimientos
              </div>
            </div>
          </div>
        </div>

        {/* Topbar right items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Badge count */}
          <span style={{
            background: '#F1F5F9',
            color: '#334155',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27AE60' }} />
            {counts.total} trámites
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Filter and Search Bar */}
        <div style={{
          background: '#FFFFFF',
          padding: '14px 18px',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{
              position: 'relative',
              flex: '1 1 280px',
              maxWidth: 420
            }}>
              <span className="material-icons" style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 18,
                color: '#94A3B8'
              }}>
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por establecimiento, expediente, trámite, localidad..."
                style={{
                  width: '100%',
                  padding: '9px 36px 9px 38px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  background: '#F8FAFC'
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#27AE60'
                  e.currentTarget.style.background = '#FFFFFF'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#CBD5E1'
                  e.currentTarget.style.background = '#F8FAFC'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>close</span>
                </button>
              )}
            </div>

            {/* Quick format filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Formato:</span>
              <select
                value={filterFormato}
                onChange={e => setFilterFormato(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#334155',
                  background: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="TODOS">Todos los formatos</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="VIRTUAL">Virtual</option>
              </select>
            </div>
          </div>

          {/* Estado Chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginRight: 4 }}>Estado:</span>
            {[
              { id: 'TODOS', label: 'Todos', count: counts.total },
              { id: 'INICIAR', label: 'Por Iniciar Acta', count: counts.iniciar, color: '#27AE60' },
              { id: 'EN_CURSO', label: 'En Curso', count: counts.enCurso, color: '#0284C7' },
              { id: 'DESCARGO', label: 'Con Descargo', count: counts.descargo, color: '#D97706' },
              { id: 'OBSERVADOS', label: 'Observados', count: counts.observados, color: '#DC2626' },
            ].map(tab => {
              const active = filterEstado === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterEstado(tab.id)}
                  style={{
                    border: active ? '1px solid #27AE60' : '1px solid #E2E8F0',
                    background: active ? '#ECFDF5' : '#FFFFFF',
                    color: active ? '#15803D' : '#475569',
                    borderRadius: 20,
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.background = '#F8FAFC'
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.background = '#FFFFFF'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    background: active ? '#27AE60' : '#E2E8F0',
                    color: active ? '#FFFFFF' : '#475569',
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700
                  }}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* VISTA RESPONSIVA: TARJETAS EN MOBILE / TABLA EN DESKTOP */}
        {isTablet ? (
          <>
            {filtrados.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                textAlign: 'center',
                padding: '48px 24px',
                color: '#64748B'
              }}>
                <span className="material-icons" style={{ fontSize: 54, color: '#27AE60', opacity: 0.35 }}>
                  search_off
                </span>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1E293B', marginTop: 12 }}>
                  No se encontraron inspecciones por habilitación
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  Intente ajustando los términos de búsqueda o los filtros aplicados.
                </div>
                {(searchTerm || filterEstado !== 'TODOS' || filterFormato !== 'TODOS') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterEstado('TODOS')
                      setFilterFormato('TODOS')
                    }}
                    style={{
                      marginTop: 16,
                      background: '#ECFDF5',
                      color: '#27AE60',
                      border: '1px solid #27AE60',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Restablecer filtros
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: 18
              }}>
                {filtrados.map(t => {
                  const conf = ESTADO_CONFIG[t.estado]
                  const tipologiaIcon = getTipologiaIcon(t.tipologia)
                  const hasEmplazamiento = Boolean(t.emplazamiento)

                  // Accent bar color based on status
                  let accentColor = '#27AE60'
                  if (t.estado === 'DESCARGO_INSP') accentColor = '#F59E0B'
                  else if (t.estado === 'OBSERVADO_INSP') accentColor = '#EF4444'
                  else if (t.estado === 'EN_ANALISIS_AUD' || t.estado === 'RE_INSP_SOLICITADA') accentColor = '#0284C7'

                  return (
                    <div
                      key={t.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: 14,
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.boxShadow = '0 10px 24px -4px rgba(0, 0, 0, 0.08)'
                        e.currentTarget.style.borderColor = '#CBD5E1'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
                        e.currentTarget.style.borderColor = '#E2E8F0'
                      }}
                    >
                      {/* Top Accent Bar */}
                      <div style={{ height: 4, background: accentColor }} />

                      {/* Card Content */}
                      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                        
                        {/* Header: Icon + Name + State Badge */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                              <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: 10,
                                background: '#ECFDF5',
                                color: '#059669',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <span className="material-icons" style={{ fontSize: 24 }}>{tipologiaIcon}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  title={t.denominacion}
                                  style={{
                                    fontSize: 15,
                                    fontWeight: 750,
                                    color: '#0F172A',
                                    lineHeight: 1.3,
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {t.denominacion}
                                </div>
                                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, fontWeight: 500 }}>
                                  {t.tipologia}
                                </div>
                              </div>
                            </div>

                            {/* Estado Badge */}
                            <span
                              className={`badge ${conf?.badge || 'badge-neutral'}`}
                              style={{
                                flexShrink: 0,
                                fontSize: 11,
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 8px'
                              }}
                            >
                              {conf?.label || t.estado}
                            </span>
                          </div>

                          {/* Address & CUIT */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#64748B', flexWrap: 'wrap', marginTop: 6 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span className="material-icons" style={{ fontSize: 15, color: '#94A3B8' }}>place</span>
                              {t.domicilio ? `${t.domicilio}, ${t.localidad}` : (t.localidad || 'Córdoba')}
                            </span>
                            {t.cuit && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <span className="material-icons" style={{ fontSize: 14, color: '#94A3B8' }}>badge</span>
                                <span style={{ fontFamily: 'monospace', fontSize: 11.5 }}>{t.cuit}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle Info Box: Trámite, Expediente, Inspector, Formato */}
                        <div style={{
                          background: '#F8FAFC',
                          borderRadius: 10,
                          border: '1px solid #F1F5F9',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8
                        }}>
                          {/* Row 1: Trámite & Expediente */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
                            <div>
                              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                Trámite
                              </div>
                              <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 750, color: '#1E293B', marginTop: 2 }}>
                                {t.nroTramite}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                Expediente
                              </div>
                              <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#475569', marginTop: 2 }}>
                                {t.nroExpediente}
                              </div>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px dashed #E2E8F0', margin: '2px 0' }} />

                          {/* Row 2: Formato, Acta, Inspector */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              {/* Formato Pill */}
                              <span style={{
                                background: t.formatoInspeccion === 'VIRTUAL' ? '#EFF6FF' : '#F1F5F9',
                                color: t.formatoInspeccion === 'VIRTUAL' ? '#1D4ED8' : '#334155',
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                <span className="material-icons" style={{ fontSize: 13 }}>
                                  {t.formatoInspeccion === 'VIRTUAL' ? 'videocam' : 'storefront'}
                                </span>
                                {t.formatoInspeccion}
                              </span>

                              {/* Acta Pill */}
                              <span style={{
                                background: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                color: '#475569',
                                padding: '2px 7px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600
                              }}>
                                Acta N° {t.nroActa ?? 1}
                              </span>
                            </div>

                            {/* Inspector asignado */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#475569', fontSize: 12, textAlign: 'right' }}>
                              <span className="material-icons" style={{ fontSize: 15, color: '#27AE60' }}>person</span>
                              <span style={{ fontWeight: 600 }}>{t.inspectorAsignado || t.agenteAsignado || 'Sin Asignar'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Emplazamiento notification if any */}
                        {hasEmplazamiento && (
                          <div style={{
                            background: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            borderRadius: 8,
                            padding: '8px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            color: '#92400E'
                          }}>
                            <span className="material-icons" style={{ fontSize: 18, color: '#D97706', flexShrink: 0 }}>
                              warning_amber
                            </span>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 700 }}>Emplazamiento activo:</span> {t.emplazamiento?.faltasCriticasCount ?? 0} faltas críticas ({t.emplazamiento?.diasRestantes ?? 0} días restantes).
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Primary CTA + TableActionsMenu */}
                      <div style={{
                        padding: '12px 18px',
                        borderTop: '1px solid #F1F5F9',
                        background: '#FAFAFA',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        {/* Secondary Quick Action: Ver trámite */}
                        <button
                          onClick={() => navigate(user?.rol === 'COORDINADOR' ? `/coordinador/ver-tramite/${t.id}` : `/inspector/ver-tramite/${t.id}`)}
                          style={{
                            border: '1px solid #CBD5E1',
                            background: '#FFFFFF',
                            color: '#475569',
                            borderRadius: 8,
                            padding: '7px 12px',
                            fontSize: 12,
                            fontWeight: 650,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#F1F5F9'
                            e.currentTarget.style.color = '#1E293B'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#FFFFFF'
                            e.currentTarget.style.color = '#475569'
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 16 }}>visibility</span>
                          Ver Trámite
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* Primary CTA based on state */}
                          {(t.estado === 'ACEPTADO_DOC_AUD' || t.estado === 'EN_ANALISIS_AUD' || t.estado === 'RE_INSP_SOLICITADA') && (
                            <button
                              onClick={() => handleAbrirInspeccion(t.id, t.estado)}
                              style={{
                                background: '#27AE60',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 8,
                                padding: '7px 14px',
                                fontSize: 12.5,
                                fontWeight: 750,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 1px 3px rgba(39, 174, 96, 0.3)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#219653'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = '#27AE60'
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 17 }}>play_arrow</span>
                              {t.estado === 'ACEPTADO_DOC_AUD' ? 'Iniciar Acta' : 'Continuar Acta'}
                            </button>
                          )}

                          {t.estado === 'DESCARGO_INSP' && (
                            <button
                              onClick={() => handleRevisarDescargo(t.id)}
                              style={{
                                background: '#059669',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 8,
                                padding: '7px 14px',
                                fontSize: 12.5,
                                fontWeight: 750,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 1px 3px rgba(5, 150, 105, 0.3)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#047857'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = '#059669'
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 17 }}>rate_review</span>
                              Revisar Descargo
                            </button>
                          )}

                          {/* Menu with all actions */}
                          <TableActionsMenu
                            options={[
                              ...(t.estado === 'ACEPTADO_DOC_AUD' || t.estado === 'EN_ANALISIS_AUD' || t.estado === 'RE_INSP_SOLICITADA' ? [{
                                label: t.estado === 'ACEPTADO_DOC_AUD' ? 'Iniciar Acta' : 'Continuar Acta',
                                icon: 'search',
                                onClick: () => handleAbrirInspeccion(t.id, t.estado)
                              }] : []),
                              ...(t.estado === 'DESCARGO_INSP' ? [{
                                label: 'Revisar Descargo',
                                icon: 'rate_review',
                                onClick: () => handleRevisarDescargo(t.id)
                              }] : []),
                              {
                                label: 'Ver Trámite Completo',
                                icon: 'visibility',
                                onClick: () => navigate(user?.rol === 'COORDINADOR' ? `/coordinador/ver-tramite/${t.id}` : `/inspector/ver-tramite/${t.id}`)
                              },
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
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* TABLE VIEW (Desktop) */
          <div className="table-wrapper" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
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
                      <div style={{ fontWeight: 600, marginTop: 8 }}>No hay inspecciones por habilitación que coincidan con la búsqueda.</div>
                    </td>
                  </tr>
                ) : filtrados.map(t => {
                  const conf = ESTADO_CONFIG[t.estado]
                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 4, height: 32, borderRadius: 2, background: '#27AE60', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-gray-900)' }}>{t.denominacion}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--color-gray-500)', marginTop: 2 }}>{t.tipologia}</div>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {(t.estado === 'ACEPTADO_DOC_AUD' || t.estado === 'EN_ANALISIS_AUD' || t.estado === 'RE_INSP_SOLICITADA') && (
                            <button
                              onClick={() => handleAbrirInspeccion(t.id, t.estado)}
                              style={{
                                background: '#27AE60',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 15 }}>play_arrow</span>
                              {t.estado === 'ACEPTADO_DOC_AUD' ? 'Iniciar' : 'Continuar'}
                            </button>
                          )}
                          {t.estado === 'DESCARGO_INSP' && (
                            <button
                              onClick={() => handleRevisarDescargo(t.id)}
                              style={{
                                background: '#059669',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 15 }}>rate_review</span>
                              Revisar
                            </button>
                          )}
                          <TableActionsMenu
                            options={[
                              ...(t.estado === 'ACEPTADO_DOC_AUD' || t.estado === 'EN_ANALISIS_AUD' || t.estado === 'RE_INSP_SOLICITADA' ? [{
                                label: t.estado === 'ACEPTADO_DOC_AUD' ? 'Iniciar Acta' : 'Continuar Acta',
                                icon: 'search',
                                onClick: () => handleAbrirInspeccion(t.id, t.estado)
                              }] : []),
                              ...(t.estado === 'DESCARGO_INSP' ? [{
                                label: 'Revisar Descargo',
                                icon: 'rate_review',
                                onClick: () => handleRevisarDescargo(t.id)
                              }] : []),
                              {
                                label: 'Ver trámite',
                                icon: 'visibility',
                                onClick: () => navigate(user?.rol === 'COORDINADOR' ? `/coordinador/ver-tramite/${t.id}` : `/inspector/ver-tramite/${t.id}`)
                              },
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
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Emitir Orden Rutina */}
      {tramiteEmitirOrden && (
        <ModalEmitirOrdenRutina
          tramite={tramiteEmitirOrden}
          onClose={() => setTramiteEmitirOrden(null)}
          onSuccess={(nuevo) => {
            setLocalTramites(prev => [nuevo, ...prev])
          }}
        />
      )}
    </>
  )
}
