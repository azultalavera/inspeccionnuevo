import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import BandejaAlertasRutina from './BandejaAlertasRutina'
import { TRAMITES, type Tramite, type EstadoTramite, ESTADO_CONFIG } from '../data/mockData'
import TableActionsMenu from '../components/TableActionsMenu'
import ModalEmitirOrdenRutina from '../components/ModalEmitirOrdenRutina'

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
  const location = useLocation()
  const isTablet = useIsTablet()

  const isInspector = user?.rol === 'INSPECTOR'
  const isCoordinador = user?.rol === 'COORDINADOR'
  const initialSubTab = location.state?.subTab || (isInspector ? 'ORDENADAS' : 'MENU')
  const [subTab, setSubTab] = useState<'MENU' | 'ALERTAS' | 'ORDENADAS'>(initialSubTab)
  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES)

  // Coordinator Modal States
  const [tramiteEmitirOrden, setTramiteEmitirOrden] = useState<Tramite | null>(null)

  useEffect(() => {
    if (location.state?.subTab) {
      setSubTab(location.state.subTab)
    }
  }, [location.state])

  useEffect(() => {
    if (tramites && tramites.length > 0) {
      setLocalTramites(tramites)
    }
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

  // Helper para tipología geriátricos
  const isGeriatrico = (tipologia: string) => {
    const tip = (tipologia || '').toLowerCase()
    return tip.includes('geriátrico') || tip.includes('geriatrico') || tip.includes('geriátricos') || tip.includes('geriatricos')
  }

  // Estado para filtrado interactivo por tarjetas del Inspector
  const [filtroVentana, setFiltroVentana] = useState<string>('TODAS')
  const [filtroGeriatricos, setFiltroGeriatricos] = useState(false)

  // Estados para filtros divididos
  const [filtroNombre, setFiltroNombre] = useState<string>('')
  const [filtroCuit, setFiltroCuit] = useState<string>('')
  const [filtroExpediente, setFiltroExpediente] = useState<string>('')
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('')
  const [filtroLocalidad, setFiltroLocalidad] = useState<string>('')

  // Departamentos y Localidades disponibles
  const departamentosDisponibles = useMemo(() => {
    const set = new Set<string>()
    rutinasOrdenadas.forEach(t => {
      if (t.departamento) set.add(t.departamento)
    })
    return Array.from(set).sort()
  }, [rutinasOrdenadas])

  const localidadesDisponibles = useMemo(() => {
    const set = new Set<string>()
    rutinasOrdenadas.forEach(t => {
      if (filtroDepartamento && t.departamento !== filtroDepartamento) return
      if (t.localidad) set.add(t.localidad)
    })
    return Array.from(set).sort()
  }, [rutinasOrdenadas, filtroDepartamento])

  // Conteos para las tarjetas de métricas basados en todas las asignadas
  const countVencidos = rutinasOrdenadas.filter(t => t.alertaRutina === 'CRITICO_VENCIDO').length
  const countProximos = rutinasOrdenadas.filter(t => t.alertaRutina === 'ALERTA_T15').length
  const countEnPlazo = rutinasOrdenadas.filter(t => t.alertaRutina === 'ALERTA_T30').length
  const countMayor30 = rutinasOrdenadas.filter(t => t.alertaRutina === 'AL_DIA' || (!t.alertaRutina && t.tipoInspeccion === 'RUTINA')).length
  const countGeriatricos = rutinasOrdenadas.filter(t => isGeriatrico(t.tipologia)).length

  // Conteos específicos cuando se activa el filtro Geriátricos (Vencidos y En plazo)
  const countGeriatricosVencidos = rutinasOrdenadas.filter(t => isGeriatrico(t.tipologia) && t.alertaRutina === 'CRITICO_VENCIDO').length
  const countGeriatricosEnPlazo = rutinasOrdenadas.filter(t => isGeriatrico(t.tipologia) && t.alertaRutina !== 'CRITICO_VENCIDO').length

  const hasInputFilters =
    filtroNombre.trim() !== '' ||
    filtroCuit.trim() !== '' ||
    filtroExpediente.trim() !== '' ||
    filtroDepartamento !== '' ||
    filtroLocalidad !== ''

  // Aplicar filtros de las tarjetas y filtros divididos
  const filteredRutinas = rutinasOrdenadas.filter(t => {
    if (filtroGeriatricos) {
      if (!isGeriatrico(t.tipologia)) return false
      if (filtroVentana === 'CRITICO_VENCIDO' || filtroVentana === 'VENCIDOS') {
        if (t.alertaRutina !== 'CRITICO_VENCIDO') return false
      } else if (filtroVentana === 'EN_PLAZO') {
        if (t.alertaRutina === 'CRITICO_VENCIDO') return false
      }
    } else {
      let matchVentana = filtroVentana === 'TODAS'
      if (filtroVentana === 'AL_DIA') {
        matchVentana = t.alertaRutina === 'AL_DIA' || (!t.alertaRutina && t.tipoInspeccion === 'RUTINA')
      } else if (filtroVentana !== 'TODAS') {
        matchVentana = t.alertaRutina === filtroVentana
      }
      if (!matchVentana) return false
    }

    if (filtroNombre.trim() !== '') {
      if (!(t.denominacion || '').toLowerCase().includes(filtroNombre.toLowerCase())) return false
    }
    if (filtroCuit.trim() !== '') {
      if (!(t.cuit || '').toLowerCase().includes(filtroCuit.toLowerCase())) return false
    }
    if (filtroExpediente.trim() !== '') {
      const q = filtroExpediente.toLowerCase()
      const matchExp = (t.nroExpediente || '').toLowerCase().includes(q)
      const matchTram = (t.nroTramite || '').toLowerCase().includes(q)
      if (!matchExp && !matchTram) return false
    }
    if (filtroDepartamento !== '') {
      if ((t.departamento || '') !== filtroDepartamento) return false
    }
    if (filtroLocalidad !== '') {
      if ((t.localidad || '') !== filtroLocalidad) return false
    }

    return true
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
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(backPath)}
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
              {isInspector ? 'Inspecciones por Rutina' : (subTab === 'MENU' ? 'Inspección por Rutina' : subTab === 'ALERTAS' ? 'Bandeja de Alertas' : 'Órdenes')}
            </div>
          </div>
        </div>

        {/* Acciones Rápidas de Cabecera para Coordinador */}
        {isCoordinador && subTab !== 'ORDENADAS' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setSubTab('ORDENADAS')}
              style={{
                background: '#F0F9FF',
                color: '#0369A1',
                border: '1.5px solid #BAE6FD',
                borderRadius: 8,
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 750,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>playlist_add_check</span>
              Ver Órdenes ({rutinasOrdenadas.length})
            </button>
          </div>
        )}
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
              onClick={() => {
                if (filtroGeriatricos) {
                  setFiltroVentana(filtroVentana === 'VENCIDOS' ? 'TODAS' : 'VENCIDOS')
                } else {
                  setFiltroVentana(filtroVentana === 'CRITICO_VENCIDO' ? 'TODAS' : 'CRITICO_VENCIDO')
                }
              }}
              style={{
                background: '#FFFFFF',
                border: `1.5px solid ${(filtroGeriatricos ? filtroVentana === 'VENCIDOS' : filtroVentana === 'CRITICO_VENCIDO') ? '#EF4444' : '#E2E8F0'}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: (filtroGeriatricos ? filtroVentana === 'VENCIDOS' : filtroVentana === 'CRITICO_VENCIDO') ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {filtroGeriatricos ? 'Vencidos' : 'Vencidos asignados'}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#DC2626', marginTop: 2 }}>
                  {filtroGeriatricos ? countGeriatricosVencidos : countVencidos}
                </div>
              </div>
              <span className="material-icons" style={{ fontSize: 28, color: '#FCA5A5' }}>error_outline</span>
            </div>

            {/* Próximos Card - Se oculta cuando se selecciona Geriátricos */}
            {!filtroGeriatricos && (
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
                  justifyContent: 'space-between',
                  boxShadow: filtroVentana === 'ALERTA_T15' ? '0 0 0 3px rgba(245, 158, 11, 0.15)' : 'none'
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
            )}

            {/* En Plazo Card */}
            <div
              onClick={() => {
                if (filtroGeriatricos) {
                  setFiltroVentana(filtroVentana === 'EN_PLAZO' ? 'TODAS' : 'EN_PLAZO')
                } else {
                  setFiltroVentana(filtroVentana === 'ALERTA_T30' ? 'TODAS' : 'ALERTA_T30')
                }
              }}
              style={{
                background: '#FFFFFF',
                border: `1.5px solid ${(filtroGeriatricos ? filtroVentana === 'EN_PLAZO' : filtroVentana === 'ALERTA_T30') ? '#2980B9' : '#E2E8F0'}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: (filtroGeriatricos ? filtroVentana === 'EN_PLAZO' : filtroVentana === 'ALERTA_T30') ? '0 0 0 3px rgba(41, 128, 185, 0.15)' : 'none'
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {filtroGeriatricos ? 'En plazo' : 'En plazo (< 30 días)'}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#2980B9', marginTop: 2 }}>
                  {filtroGeriatricos ? countGeriatricosEnPlazo : countEnPlazo}
                </div>
              </div>
              <span className="material-icons" style={{ fontSize: 28, color: '#AED6F1' }}>schedule</span>
            </div>

            {/* Mayor a 30 días Card */}
            <div
              onClick={() => setFiltroVentana(filtroVentana === 'AL_DIA' ? 'TODAS' : 'AL_DIA')}
              style={{
                background: '#FFFFFF',
                border: `1.5px solid ${filtroVentana === 'AL_DIA' ? '#10B981' : '#E2E8F0'}`,
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
                  Al día (&gt; 30 días)
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                  {countMayor30}
                </div>
              </div>
              <span className="material-icons" style={{ fontSize: 28, color: '#A7F3D0' }}>event_available</span>
            </div>

            {/* Geriátricos Card */}
            <div
              onClick={() => {
                setFiltroGeriatricos(!filtroGeriatricos)
                setFiltroVentana('TODAS')
              }}
              style={{
                background: filtroGeriatricos ? '#FFFBEB' : '#FFFFFF',
                border: `1.5px solid ${filtroGeriatricos ? '#D97706' : '#E2E8F0'}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: filtroGeriatricos ? '0 0 0 3px rgba(217, 119, 6, 0.15)' : 'none'
              }}
              onMouseEnter={e => {
                if (!filtroGeriatricos) e.currentTarget.style.borderColor = '#D97706'
              }}
              onMouseLeave={e => {
                if (!filtroGeriatricos) e.currentTarget.style.borderColor = '#E2E8F0'
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 750, color: filtroGeriatricos ? '#B45309' : '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Geriátricos (3/año)
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706', marginTop: 2 }}>
                  {countGeriatricos}
                </div>
              </div>
              <span className="material-icons" style={{ fontSize: 28, color: '#FDE68A' }}>local_hospital</span>
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
                  Órdenes
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
                Ver órdenes ({rutinasOrdenadas.length})
                <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
              </div>
            </div>
          </div>
        ) : subTab === 'ALERTAS' ? (
          <BandejaAlertasRutina hideTopbar={true} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Barra de Filtros Dividida */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                {/* 1. Nombre Establecimiento */}
                <div style={{ position: 'relative' }}>
                  <span
                    className="material-icons"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: 10,
                      color: filtroNombre ? '#0284c7' : '#94A3B8',
                      fontSize: 18,
                    }}
                  >
                    business
                  </span>
                  <input
                    type="text"
                    placeholder="Establecimiento..."
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 34px 9px 38px',
                      borderRadius: 8,
                      border: `1.5px solid ${filtroNombre ? '#0284c7' : '#CBD5E1'}`,
                      fontSize: 13,
                      outline: 'none',
                      background: filtroNombre ? '#F0F9FF' : '#F8FAFC',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                  {filtroNombre && (
                    <button
                      onClick={() => setFiltroNombre('')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 2,
                      }}
                      title="Borrar"
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>
                        cancel
                      </span>
                    </button>
                  )}
                </div>

                {/* 2. CUIT */}
                <div style={{ position: 'relative' }}>
                  <span
                    className="material-icons"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: 10,
                      color: filtroCuit ? '#0284c7' : '#94A3B8',
                      fontSize: 18,
                    }}
                  >
                    badge
                  </span>
                  <input
                    type="text"
                    placeholder="CUIT..."
                    value={filtroCuit}
                    onChange={(e) => setFiltroCuit(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 34px 9px 38px',
                      borderRadius: 8,
                      border: `1.5px solid ${filtroCuit ? '#0284c7' : '#CBD5E1'}`,
                      fontSize: 13,
                      outline: 'none',
                      background: filtroCuit ? '#F0F9FF' : '#F8FAFC',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                  {filtroCuit && (
                    <button
                      onClick={() => setFiltroCuit('')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 2,
                      }}
                      title="Borrar"
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>
                        cancel
                      </span>
                    </button>
                  )}
                </div>

                {/* 3. Nro. Expediente / Trámite */}
                <div style={{ position: 'relative' }}>
                  <span
                    className="material-icons"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: 10,
                      color: filtroExpediente ? '#0284c7' : '#94A3B8',
                      fontSize: 18,
                    }}
                  >
                    description
                  </span>
                  <input
                    type="text"
                    placeholder="N° Expediente o Trámite..."
                    value={filtroExpediente}
                    onChange={(e) => setFiltroExpediente(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 34px 9px 38px',
                      borderRadius: 8,
                      border: `1.5px solid ${filtroExpediente ? '#0284c7' : '#CBD5E1'}`,
                      fontSize: 13,
                      outline: 'none',
                      background: filtroExpediente ? '#F0F9FF' : '#F8FAFC',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                  {filtroExpediente && (
                    <button
                      onClick={() => setFiltroExpediente('')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 2,
                      }}
                      title="Borrar"
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>
                        cancel
                      </span>
                    </button>
                  )}
                </div>

                {/* 4. Select Departamento */}
                <div style={{ position: 'relative' }}>
                  <span
                    className="material-icons"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: 10,
                      color: filtroDepartamento ? '#0284c7' : '#94A3B8',
                      fontSize: 18,
                      pointerEvents: 'none',
                    }}
                  >
                    place
                  </span>
                  <select
                    value={filtroDepartamento}
                    onChange={(e) => {
                      setFiltroDepartamento(e.target.value);
                      setFiltroLocalidad('');
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 30px 9px 38px',
                      borderRadius: 8,
                      border: `1.5px solid ${filtroDepartamento ? '#0284c7' : '#CBD5E1'}`,
                      fontSize: 13,
                      fontWeight: filtroDepartamento ? 650 : 400,
                      outline: 'none',
                      background: filtroDepartamento ? '#F0F9FF' : '#F8FAFC',
                      color: filtroDepartamento ? '#0369A1' : '#0F172A',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Todos los Departamentos</option>
                    {departamentosDisponibles.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Select Localidad */}
                <div style={{ position: 'relative' }}>
                  <span
                    className="material-icons"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: 10,
                      color: filtroLocalidad ? '#0284c7' : '#94A3B8',
                      fontSize: 18,
                      pointerEvents: 'none',
                    }}
                  >
                    location_on
                  </span>
                  <select
                    value={filtroLocalidad}
                    onChange={(e) => setFiltroLocalidad(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 30px 9px 38px',
                      borderRadius: 8,
                      border: `1.5px solid ${filtroLocalidad ? '#0284c7' : '#CBD5E1'}`,
                      fontSize: 13,
                      fontWeight: filtroLocalidad ? 650 : 400,
                      outline: 'none',
                      background: filtroLocalidad ? '#F0F9FF' : '#F8FAFC',
                      color: filtroLocalidad ? '#0369A1' : '#0F172A',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Todas las Localidades</option>
                    {localidadesDisponibles.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón de limpiar filtros activos si hay alguno */}
              {hasInputFilters && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    paddingTop: 2,
                  }}
                >
                  <button
                    onClick={() => {
                      setFiltroNombre('');
                      setFiltroCuit('');
                      setFiltroExpediente('');
                      setFiltroDepartamento('');
                      setFiltroLocalidad('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 6px',
                      textDecoration: 'underline',
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 15 }}>
                      restart_alt
                    </span>
                    Limpiar búsqueda y filtros
                  </button>
                </div>
              )}
            </div>

            {isTablet ? (
              /* Vista de Cards Responsivas (Tablet/Móvil) */
              sortedFilteredRutinas.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {sortedFilteredRutinas.map(t => {
                const conf = ESTADO_CONFIG[t.estado]
                return (
                  <div key={t.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {filtroGeriatricos ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            borderRadius: 14,
                            fontWeight: 750,
                            fontSize: 12,
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE'
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 15, color: '#2563EB' }}>event_repeat</span>
                          Inspecciones: {t.inspeccionesRealizadasAno ?? 2}/{t.frecuenciaRutinaAnual ?? 3}
                        </span>
                      ) : (
                        <span className={`badge ${conf?.badge || 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px' }}>
                          {conf?.label || t.estado}
                        </span>
                      )}
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

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => handleAbrirInspeccion(t.id, t.estado)}
                        title="Iniciar orden de inspección"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2980B9',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.15s ease, color 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.2)'
                          e.currentTarget.style.color = '#1F618D'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'none'
                          e.currentTarget.style.color = '#2980B9'
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 24 }}>play_circle</span>
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
                  {filtroGeriatricos ? (
                    <th style={{ textAlign: 'center' }}>Inspecciones por rutina en el año</th>
                  ) : (
                    <th>Estado Actual</th>
                  )}
                  <th style={{ textAlign: 'center' }}>Acciones</th>
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
                      {filtroGeriatricos ? (
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 12px',
                              borderRadius: 20,
                              fontWeight: 750,
                              fontSize: 13,
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1.5px solid #BFDBFE'
                            }}
                            title="Cantidad de inspecciones de rutina realizadas en el año"
                          >
                            <span className="material-icons" style={{ fontSize: 16, color: '#2563EB' }}>event_repeat</span>
                            {t.inspeccionesRealizadasAno ?? 2}/{t.frecuenciaRutinaAnual ?? 3}
                          </span>
                        </td>
                      ) : (
                        <td>
                          <span className={`badge ${conf?.badge || 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px' }}>
                            {conf?.label || t.estado}
                          </span>
                        </td>
                      )}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleAbrirInspeccion(t.id, t.estado)}
                          title="Iniciar orden de inspección"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#2980B9',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.15s ease, color 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.2)'
                            e.currentTarget.style.color = '#1F618D'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'none'
                            e.currentTarget.style.color = '#2980B9'
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 22 }}>play_circle</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
          </div>
        )}
      </div>

      {/* Modal Emitir Orden Rutina (Desde fila) */}
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

