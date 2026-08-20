import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import BandejaAlertasRutina from './BandejaAlertasRutina'
import { TRAMITES, type Tramite, type EstadoTramite, ESTADO_CONFIG } from '../data/mockData'
import TableActionsMenu from '../components/TableActionsMenu'

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth <= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

export default function InspeccionRutinaPage() {
  const { user } = useAuth()
  const { tramites, iniciarInspeccion } = useApp()
  const navigate = useNavigate()
  const isTablet = useIsTablet()

  const isInspector = user?.rol === 'INSPECTOR'
  const [subTab, setSubTab] = useState<'MENU' | 'ALERTAS' | 'ORDENADAS'>(isInspector ? 'ORDENADAS' : 'MENU')
  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES)

  useEffect(() => {
    setLocalTramites(tramites)
  }, [tramites])

  const handleAbrirInspeccion = (id: string, estado: EstadoTramite) => {
    if (estado === 'ACEPTADO_DOC_AUD') iniciarInspeccion(id)
    navigate(`/inspector/inspeccion/${id}`)
  }

  const handleVerValidacion = (id: string) => navigate(`/inspector/validacion/${id}`)

  const backPath = user?.rol === 'COORDINADOR' ? '/coordinador/inspecciones' : '/inspector/inspecciones'

  // Filtrado base de trámites de rutina en estados de inspección específicos (ordenadas)
  const rutinasOrdenadas = localTramites.filter(t => {
    const esEstadoOrdenado = [
      'ACEPTADO_DOC_AUD',
      'EN_ANALISIS_AUD',
      'RE_INSP_SOLICITADA',
      'ACEPTADO_INSP',
      'RECHAZADO_INSP',
      'OBSERVADO_INSP',
      'DESCARGO_INSP'
    ].includes(t.estado)

    const esTipoRutina = t.tipoInspeccion === 'RUTINA'

    if (isInspector) {
      const assigned = (t.inspectorAsignado || t.agenteAsignado || '').toLowerCase()
      const lUser = user.apellido.toLowerCase()
      return esEstadoOrdenado && esTipoRutina && assigned.includes(lUser)
    }

    // El coordinador ve todas las inspecciones de rutina ordenadas
    return esEstadoOrdenado && esTipoRutina
  })

  // Estado para filtrado interactivo por tarjetas del Inspector
  const [filtroVentana, setFiltroVentana] = useState<string>('TODAS')
  const [filtroGeriatricos, setFiltroGeriatricos] = useState(false)

  // Conteos para las tarjetas de métricas basados en todas las asignadas
  const countVencidos = rutinasOrdenadas.filter(t => t.alertaRutina === 'CRITICO_VENCIDO').length
  const countProximos = rutinasOrdenadas.filter(t => t.alertaRutina === 'ALERTA_T15').length
  const countEnPlazo = rutinasOrdenadas.filter(t => t.alertaRutina === 'ALERTA_T30').length
  const countGeriatricos = rutinasOrdenadas.filter(t => t.tipologia.toLowerCase().includes('geriátrico') || t.tipologia.toLowerCase().includes('geriátricos')).length

  // Aplicar filtros de las tarjetas
  const filteredRutinas = rutinasOrdenadas.filter(t => {
    const matchVentana = filtroVentana === 'TODAS' || t.alertaRutina === filtroVentana
    const matchGeri = !filtroGeriatricos || (t.tipologia.toLowerCase().includes('geriátrico') || t.tipologia.toLowerCase().includes('geriátricos'))
    return matchVentana && matchGeri
  })

  // Orden de prioridad: Vencidos -> Próximos -> En Plazo -> Otros
  const sortPriority: Record<string, number> = {
    'CRITICO_VENCIDO': 1,
    'ALERTA_T15': 2,
    'ALERTA_T30': 3,
    'AL_DIA': 4
  }

  const sortedFilteredRutinas = [...filteredRutinas].sort((a, b) => {
    const prioA = sortPriority[a.alertaRutina || 'AL_DIA'] || 99
    const prioB = sortPriority[b.alertaRutina || 'AL_DIA'] || 99
    return prioA - prioB
  })

  return (
    <>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => {
              if (isInspector || subTab === 'MENU') {
                navigate(backPath)
              } else {
                setSubTab('MENU')
              }
            }}
            style={{
              background: '#FFFFFF',
              color: '#2980B9',
              border: '1.5px solid #2980B9',
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
            <span className="material-icons" style={{ fontSize: 24, color: '#2980B9' }}>schedule</span>
            <div className="topbar-title">
              {isInspector ? 'Inspecciones por Rutina' : (subTab === 'MENU' ? 'Inspección por Rutina' : subTab === 'ALERTAS' ? 'Bandeja de Alertas' : 'Inspecciones Ordenadas')}
            </div>
          </div>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Cabecera de Tarjetas de Filtros para Inspectores */}
        {isInspector && subTab === 'ORDENADAS' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginBottom: 8
          }}>
            {/* Vencidos Card */}
            <div
              onClick={() => setFiltroVentana(filtroVentana === 'CRITICO_VENCIDO' ? 'TODAS' : 'CRITICO_VENCIDO')}
              style={{
                background: '#FFFFFF',
                border: `1.5px solid ${filtroVentana === 'CRITICO_VENCIDO' ? '#EF4444' : '#E2E8F0'}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Vencidos asignados
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#DC2626', marginTop: 2 }}>
                  {countVencidos}
                </div>
              </div>
              <span className="material-icons" style={{ fontSize: 28, color: '#FCA5A5' }}>error_outline</span>
            </div>

            {/* Próximos Card */}
            <div
              onClick={() => setFiltroVentana(filtroVentana === 'ALERTA_T15' ? 'TODAS' : 'ALERTA_T15')}
              style={{
                background: '#FFFFFF',
                border: `1.5px solid ${filtroVentana === 'ALERTA_T15' ? '#F59E0B' : '#E2E8F0'}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Próximos (&lt; 15 días)
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706', marginTop: 2 }}>
                  {countProximos}
                </div>
              </div>
              <span className="material-icons" style={{ fontSize: 28, color: '#FDE68A' }}>warning_amber</span>
            </div>

            {/* En Plazo Card */}
            <div
              onClick={() => setFiltroVentana(filtroVentana === 'ALERTA_T30' ? 'TODAS' : 'ALERTA_T30')}
              style={{
                background: '#FFFFFF',
                border: `1.5px solid ${filtroVentana === 'ALERTA_T30' ? '#2980B9' : '#E2E8F0'}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  En plazo (&lt; 30 días)
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#2980B9', marginTop: 2 }}>
                  {countEnPlazo}
                </div>
              </div>
              <span className="material-icons" style={{ fontSize: 28, color: '#AED6F1' }}>schedule</span>
            </div>

            {/* Geriátricos Card */}
            <div
              onClick={() => setFiltroGeriatricos(!filtroGeriatricos)}
              style={{
                background: '#FFFFFF',
                border: `1.5px solid ${filtroGeriatricos ? '#D97706' : '#E2E8F0'}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Geriátricos (3/año)
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706', marginTop: 2 }}>
                  {countGeriatricos}
                </div>
              </div>
              <span className="material-icons" style={{ fontSize: 28, color: '#FDE68A' }}>home_emergency</span>
            </div>
          </div>
        )}

        {subTab === 'MENU' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            maxWidth: 900,
            margin: '24px auto 0 auto',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Card 1: Bandeja de Alertas */}
            <div
              onClick={() => setSubTab('ALERTAS')}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 20,
                padding: 32,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#2980B9'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 20px -3px rgba(41, 128, 185, 0.12), 0 4px 8px -2px rgba(41, 128, 185, 0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2E8F0'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: '#E0F2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2980B9'
              }}>
                <span className="material-icons" style={{ fontSize: 30 }}>notifications_active</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                  Bandeja de Alertas
                </h3>
                <p style={{ margin: 0, fontSize: 13.5, color: '#64748B', lineHeight: 1.5 }}>
                  Monitoreo de plazos y vencimientos para habilitaciones periódicas de efectores sanitarios.
                </p>
              </div>
              <div style={{
                marginTop: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontWeight: 750,
                color: '#2980B9'
              }}>
                Acceder a Alertas
                <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
              </div>
            </div>

            {/* Card 2: Inspecciones Ordenadas */}
            <div
              onClick={() => setSubTab('ORDENADAS')}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 20,
                padding: 32,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#10B981'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 20px -3px rgba(16, 185, 129, 0.12), 0 4px 8px -2px rgba(16, 185, 129, 0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2E8F0'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981'
              }}>
                <span className="material-icons" style={{ fontSize: 30 }}>assignment</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                  Inspecciones Ordenadas
                </h3>
                <p style={{ margin: 0, fontSize: 13.5, color: '#64748B', lineHeight: 1.5 }}>
                  Control y seguimiento de inspecciones en estados: Aceptado, Rechazado, Observado y Respuesta Emplazamiento.
                </p>
              </div>
              <div style={{
                marginTop: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontWeight: 750,
                color: '#10B981'
              }}>
                Ver inspecciones ({rutinasOrdenadas.length})
                <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
              </div>
            </div>
          </div>
        ) : subTab === 'ALERTAS' ? (
          <BandejaAlertasRutina hideTopbar={true} />
        ) : isTablet ? (
          /* Vista de Cards Responsivas (Tablet/Móvil) */
          sortedFilteredRutinas.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {sortedFilteredRutinas.map(t => {
                const conf = ESTADO_CONFIG[t.estado]
                return (
                  <div key={t.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className={`badge ${conf?.badge || 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px' }}>
                        {conf?.label || t.estado}
                      </span>
                      <span className="badge badge-neutral" style={{ padding: '3px 8px', fontWeight: 600 }}>
                        {t.formatoInspeccion}
                      </span>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 4, height: 24, borderRadius: 2, background: '#2980B9', flexShrink: 0 }} />
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

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                      {(t.estado === 'ACEPTADO_DOC_AUD' || t.estado === 'EN_ANALISIS_AUD' || t.estado === 'RE_INSP_SOLICITADA') && (
                        <button
                          onClick={() => handleAbrirInspeccion(t.id, t.estado)}
                          style={{
                            background: '#2980B9',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1F618D'}
                          onMouseLeave={e => e.currentTarget.style.background = '#2980B9'}
                        >
                          <span className="material-icons" style={{ fontSize: 16 }}>play_arrow</span>
                          {t.estado === 'ACEPTADO_DOC_AUD' ? 'Iniciar Acta' : 'Continuar Acta'}
                        </button>
                      )}
                      {t.estado === 'DESCARGO_INSP' && (
                        <button
                          onClick={() => handleVerValidacion(t.id)}
                          style={{
                            background: '#10B981',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                          onMouseLeave={e => e.currentTarget.style.background = '#10B981'}
                        >
                          <span className="material-icons" style={{ fontSize: 16 }}>rate_review</span>
                          Revisar Respuestas
                        </button>
                      )}
                      <button
                        onClick={() => alert(`Historial de Inspección N° ${t.nroTramite}`)}
                        title="Ver Historial"
                        style={{
                          background: '#F1F5F9',
                          color: '#475569',
                          border: 'none',
                          borderRadius: 6,
                          width: 32,
                          height: 32,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#E2E8F0'
                          e.currentTarget.style.color = '#1E293B'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#F1F5F9'
                          e.currentTarget.style.color = '#475569'
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 18 }}>history</span>
                      </button>
                      <button
                        onClick={() => alert(`Descargando Acta de Inspección del Trámite ${t.nroTramite}...`)}
                        title="Descargar Acta"
                        style={{
                          background: '#F1F5F9',
                          color: '#475569',
                          border: 'none',
                          borderRadius: 6,
                          width: 32,
                          height: 32,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#E2E8F0'
                          e.currentTarget.style.color = '#1E293B'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#F1F5F9'
                          e.currentTarget.style.color = '#475569'
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 18 }}>download</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                <span className="material-icons" style={{ fontSize: 48, color: '#2980B9', opacity: 0.3 }}>schedule</span>
                <div style={{ fontWeight: 600, marginTop: 8 }}>No se encontraron inspecciones por rutina.</div>
              </div>
            </div>
          )
        ) : (
          /* Vista de Tabla Escritorio */
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
                {sortedFilteredRutinas.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                      <span className="material-icons" style={{ fontSize: 48, color: '#2980B9', opacity: 0.3 }}>schedule</span>
                      <div style={{ fontWeight: 600, marginTop: 8 }}>No se encontraron inspecciones por rutina.</div>
                    </td>
                  </tr>
                ) : sortedFilteredRutinas.map(t => {
                  const conf = ESTADO_CONFIG[t.estado]
                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 4, height: 32, borderRadius: 2, background: '#2980B9', flexShrink: 0 }} />
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {(t.estado === 'ACEPTADO_DOC_AUD' || t.estado === 'EN_ANALISIS_AUD' || t.estado === 'RE_INSP_SOLICITADA') && (
                            <button
                              onClick={() => handleAbrirInspeccion(t.id, t.estado)}
                              style={{
                                background: '#2980B9',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#1F618D'}
                              onMouseLeave={e => e.currentTarget.style.background = '#2980B9'}
                            >
                              <span className="material-icons" style={{ fontSize: 16 }}>play_arrow</span>
                              {t.estado === 'ACEPTADO_DOC_AUD' ? 'Iniciar Acta' : 'Continuar Acta'}
                            </button>
                          )}
                          {t.estado === 'DESCARGO_INSP' && (
                            <button
                              onClick={() => handleVerValidacion(t.id)}
                              style={{
                                background: '#10B981',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                              onMouseLeave={e => e.currentTarget.style.background = '#10B981'}
                            >
                              <span className="material-icons" style={{ fontSize: 16 }}>rate_review</span>
                              Revisar Respuestas
                            </button>
                          )}
                          <button
                            onClick={() => alert(`Historial de Inspección N° ${t.nroTramite}`)}
                            title="Ver Historial"
                            style={{
                              background: '#F1F5F9',
                              color: '#475569',
                              border: 'none',
                              borderRadius: 6,
                              width: 32,
                              height: 32,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#E2E8F0'
                              e.currentTarget.style.color = '#1E293B'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#F1F5F9'
                              e.currentTarget.style.color = '#475569'
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: 18 }}>history</span>
                          </button>
                          <button
                            onClick={() => alert(`Descargando Acta de Inspección del Trámite ${t.nroTramite}...`)}
                            title="Descargar Acta"
                            style={{
                              background: '#F1F5F9',
                              color: '#475569',
                              border: 'none',
                              borderRadius: 6,
                              width: 32,
                              height: 32,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#E2E8F0'
                              e.currentTarget.style.color = '#1E293B'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#F1F5F9'
                              e.currentTarget.style.color = '#475569'
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 18 }}>download</span>
                      </button>
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
    </>
  )
}

