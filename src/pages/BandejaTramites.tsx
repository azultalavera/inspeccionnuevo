import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ESTADO_CONFIG, type EstadoTramite, type Tramite } from '../data/mockData'
import UserAvatarMenu from '../components/UserAvatarMenu'
import TableActionsMenu from '../components/TableActionsMenu'
import FiltrosBusqueda, { type FilterFieldConfig } from '../components/FiltrosBusqueda'

const ESTADO_FILTROS: { value: EstadoTramite | 'TODOS'; label: string; icon: string }[] = [
  { value: 'TODOS',                    label: 'Todos',              icon: 'apps' },
  { value: 'ACEPTADO_DOC_AUD',         label: 'Para Inspeccionar',  icon: 'assignment' },
  { value: 'EN_ANALISIS_AUD',          label: 'En Inspección',      icon: 'search' },
  { value: 'DESCARGO_INSP',            label: 'Emplazados',         icon: 'warning' },
  { value: 'ACEPTADO_INSP',            label: 'Aprobados',          icon: 'check_circle' },
]

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth < 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

// ── Tablet: Card de trámite ──────────────────────────────────────
function TramiteCard({ t, onAction }: { t: Tramite; onAction: () => void }) {
  const conf = ESTADO_CONFIG[t.estado]
  const canInspect = t.estado === 'ACEPTADO_DOC_AUD'
  const needsReview = t.estado === 'DESCARGO_INSP'
  const closed = t.estado === 'ACEPTADO_INSP'

  const accentColor = canInspect
    ? 'var(--ios-blue)'
    : needsReview
    ? 'var(--ios-orange)'
    : closed
    ? 'var(--ios-green)'
    : 'var(--ios-gray)'

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        border: '1px solid var(--ios-gray5)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Color accent bar */}
      <div style={{ height: 4, background: accentColor }} />

      <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 'var(--space-3)' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 3, lineHeight: 1.3 }}>
              {t.denominacion}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ios-gray)' }}>{t.cuit}</div>
          </div>
          <span className={`badge ${conf.badge}`} style={{ flexShrink: 0, fontSize: 11, display: 'inline-flex', alignItems: 'center' }}>
            {conf.label}
          </span>
        </div>

        {/* Details grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'var(--ios-gray6)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-4)',
        }}>
          {[
            { label: 'N° Trámite', value: t.nroTramite, mono: true },
            { label: 'Acta',       value: `N° ${t.nroActa}`, mono: false },
            { label: 'Tipología',  value: t.tipologia, mono: false },
            { label: 'Localidad',  value: t.localidad, mono: false },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ios-gray)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                {item.label}
              </div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-gray-800)',
                fontFamily: item.mono ? 'monospace' : 'inherit',
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Type badge + Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className={`badge ${t.tipoInspeccion === 'INICIAL' ? 'badge-brand' : 'badge-warning'}`}>
            {t.tipoInspeccion === 'INICIAL' ? 'Inicial' : 'Re-inspección'}
          </span>
          <span className="badge badge-neutral">
            {t.formatoInspeccion}
          </span>
          <div style={{ flex: 1 }} />

          {canInspect && (
            <button
              onClick={onAction}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px',
                background: 'var(--ios-blue)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-xl)',
                fontFamily: 'var(--font-family)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 12px rgba(0,122,255,0.30)',
              }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>search</span>
              {t.estado === 'ACEPTADO_DOC_AUD' ? 'Iniciar' : 'Continuar'}
            </button>
          )}
          {needsReview && (
            <button
              onClick={onAction}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px',
                background: 'rgba(255,149,0,0.12)',
                color: 'var(--ios-orange)',
                border: '1.5px solid rgba(255,149,0,0.35)',
                borderRadius: 'var(--radius-xl)',
                fontFamily: 'var(--font-family)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>rate_review</span>
              Revisar
            </button>
          )}
          {closed && (
            <span style={{ fontSize: 13, color: 'var(--ios-gray)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-icons" style={{ fontSize: 16, color: 'var(--ios-green)' }}>check_circle</span>
              Cerrado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function BandejaTramites() {
  const { tramites, iniciarInspeccion } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isTablet = useIsTablet()
  
  // Basic states
  const [filtroEstado, setFiltroEstado] = useState<EstadoTramite | 'TODOS'>('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Advanced Filter states
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false)
  const [filtroNroTramite, setFiltroNroTramite] = useState('')
  const [filtroNroExpediente, setFiltroNroExpediente] = useState('')
  const [filtroCuit, setFiltroCuit] = useState('')
  const [filtroTipologia, setFiltroTipologia] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [filtroLocalidad, setFiltroLocalidad] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  const handleLimpiarFiltros = () => {
    setFiltroNroTramite('')
    setFiltroNroExpediente('')
    setFiltroCuit('')
    setFiltroTipologia('')
    setFiltroDepartamento('')
    setFiltroLocalidad('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setFiltroEstado('TODOS')
    setBusqueda('')
  }

  // Get localities by department
  const getLocalidades = () => {
    switch (filtroDepartamento) {
      case 'Capital': return ['Córdoba']
      case 'Punilla': return ['Villa Carlos Paz']
      case 'General San Martín': return ['Villa María']
      case 'Río Cuarto': return ['Río Cuarto']
      default: return []
    }
  }

  const tramitesFiltrados = tramites.filter(t => {
    const matchEstado = filtroEstado === 'TODOS' || t.estado === filtroEstado
    const matchBusqueda = busqueda === '' ||
      t.denominacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.nroTramite.includes(busqueda) ||
      t.localidad.toLowerCase().includes(busqueda.toLowerCase())

    const matchNroTramite = filtroNroTramite === '' || t.nroTramite.includes(filtroNroTramite)
    const matchNroExpediente = filtroNroExpediente === '' || t.nroExpediente.toLowerCase().includes(filtroNroExpediente.toLowerCase())
    const matchCuit = filtroCuit === '' || t.cuit.includes(filtroCuit)
    const matchTipologia = filtroTipologia === '' || t.tipologia === filtroTipologia
    const matchDepartamento = filtroDepartamento === '' || t.departamento === filtroDepartamento
    const matchLocalidad = filtroLocalidad === '' || t.localidad === filtroLocalidad
    const matchFecha = (!filtroFechaDesde || t.fechaIngreso >= filtroFechaDesde) &&
                       (!filtroFechaHasta || t.fechaIngreso <= filtroFechaHasta)

    return matchEstado && matchBusqueda && matchNroTramite && matchNroExpediente && matchCuit && matchTipologia && matchDepartamento && matchLocalidad && matchFecha
  })

  const handleAbrirInspeccion = (id: string, estado: EstadoTramite) => {
    if (estado === 'ACEPTADO_DOC_AUD') iniciarInspeccion(id)
    navigate(`/inspector/inspeccion/${id}`)
  }

  const handleVerValidacion = (id: string) => navigate(`/inspector/validacion/${id}`)

  const statsCount = (est: EstadoTramite | EstadoTramite[]) => {
    if (Array.isArray(est)) {
      return tramites.filter(t => est.includes(t.estado)).length
    }
    return tramites.filter(t => t.estado === est).length
  }

  const STATS = [
    { label: 'Para Inspeccionar', count: statsCount('ACEPTADO_DOC_AUD'), icon: 'assignment', color: '#0dcaf0', bg: 'var(--color-info-light)' },
    { label: 'En Inspección',     count: statsCount('EN_ANALISIS_AUD'),           icon: 'search', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
    { label: 'Con Emplazamiento', count: statsCount(['OBSERVADO_INSP', 'DESCARGO_INSP']),  icon: 'warning', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
    { label: 'Aprobados',         count: statsCount('ACEPTADO_INSP'),     icon: 'check_circle', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  ]

  // ── TABLET VIEW ──────────────────────────────────────────────────
  if (isTablet) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--ios-gray6)',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 768,
        margin: '0 auto',
        // Safe area for notch devices
        paddingBottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))',
      }}>
        {/* iOS-style top bar */}
        <div style={{
          background: 'rgba(248,248,248,0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          padding: 'var(--space-4) var(--space-5)',
          position: 'sticky',
          top: 0,
          zIndex: 200,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: showSearch ? 'var(--space-3)' : 0 }}>
            {/* Interactive User Avatar Menu */}
            <UserAvatarMenu size={36} align="right" />
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--ios-gray)', lineHeight: 1 }}>Inspector</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', lineHeight: 1.3, marginTop: 1 }}>
                {user?.nombre} {user?.apellido}
              </div>
            </div>
            <button
              onClick={() => setShowSearch(s => !s)}
              style={{
                width: 36, height: 36,
                borderRadius: 'var(--radius-full)',
                background: showSearch ? 'var(--ios-blue)' : 'var(--ios-gray5)',
                border: 'none', cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
                color: showSearch ? 'white' : 'var(--ios-gray)',
              }}
            >
              🔎
            </button>
          </div>

          {/* Expandable search */}
          {showSearch && (
            <input
              autoFocus
              className="ios-input"
              placeholder="Buscar establecimiento, trámite..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ background: 'var(--ios-gray5)', border: 'none', fontSize: 15, padding: '12px 16px' }}
            />
          )}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-4)' }}>

          {/* Large title */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-gray-900)', letterSpacing: '-0.5px' }}>
              Bandeja de Trámites
            </div>
            <div style={{ fontSize: 14, color: 'var(--ios-gray)', marginTop: 4 }}>
              {tramitesFiltrados.length} trámite{tramitesFiltrados.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
          }}>
            {STATS.map(stat => (
              <div
                key={stat.label}
                onClick={() => {
                  const map: Record<string, EstadoTramite> = {
                    'Para Inspeccionar': 'ACEPTADO_DOC_AUD',
                    'En Inspección': 'EN_ANALISIS_AUD',
                    'Con Emplazamiento': 'DESCARGO_INSP',
                    'Aprobados': 'ACEPTADO_INSP',
                  }
                  setFiltroEstado(map[stat.label] ?? 'TODOS')
                }}
                style={{
                  background: stat.bg,
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-4)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  border: '1.5px solid transparent',
                  ...(filtroEstado === Object.entries({ 'Para Inspeccionar': 'ACEPTADO_DOC_AUDITORIA', 'En Inspección': 'EN_INSPECCION', 'Con Emplazamiento': 'RESPUESTA_EMPLAZAMIENTO', 'Aprobados': 'ACEPTADO_INSPECCION' }).find(([k]) => k === stat.label)?.[1] ? { boxShadow: `0 4px 16px ${stat.color}30`, border: `1.5px solid ${stat.color}60` } : {}),
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="material-icons" style={{ fontSize: 24, color: stat.color }}>{stat.icon}</span>
                  <span style={{ fontSize: 30, fontWeight: 800, color: stat.color }}>{stat.count}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: stat.color, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Filter chips - horizontal scroll */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            overflowX: 'auto',
            paddingBottom: 'var(--space-2)',
            marginBottom: 'var(--space-4)',
            scrollbarWidth: 'none',
          }}>
            {ESTADO_FILTROS.map(f => (
              <button
                key={f.value}
                onClick={() => setFiltroEstado(f.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: filtroEstado === f.value ? 'var(--ios-blue)' : 'white',
                  color: filtroEstado === f.value ? 'white' : 'var(--ios-gray)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  transition: 'all 0.15s ease',
                }}
              >
                {filtroEstado === f.value && '✓ '}{f.label}
              </button>
            ))}
          </div>

          {/* Cards list */}
          {tramitesFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)', color: 'var(--ios-gray)' }}>
              <div style={{ fontSize: 56, marginBottom: 'var(--space-4)' }}>📭</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-gray-700)', marginBottom: 'var(--space-2)' }}>Sin resultados</div>
              <div style={{ fontSize: 14 }}>No hay trámites que coincidan con el filtro.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {tramitesFiltrados.map(t => (
                <TramiteCard
                  key={t.id}
                  t={t}
                  onAction={() => {
                    if (t.estado === 'ACEPTADO_DOC_AUD') {
                      handleAbrirInspeccion(t.id, t.estado)
                    } else if (t.estado === 'DESCARGO_INSP') {
                      handleVerValidacion(t.id)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* iOS-style bottom tab bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: 'var(--tab-bar-height)',
          background: 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 12px)',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          maxWidth: 768,
          margin: '0 auto',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
        }}>
          {user?.rol === 'INSPECTOR' ? (
            [
              { icon: 'home', label: 'Inicio', active: false, path: '/inspector/home' },
              { icon: 'folder', label: 'Abiertos', active: false, path: '/inspector/expedientes' },
              { icon: 'assignment', label: 'Trámites', active: true, path: '/inspector/bandeja' },
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
          ) : (
            [
              { icon: 'assignment', label: 'Trámites', active: true },
              { icon: 'search', label: 'Inspección', active: false },
              { icon: 'analytics', label: 'Reportes', active: false },
            ].map(tab => (
              <button key={tab.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', flex: 1, height: '100%', padding: '8px 0' }}>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 32, borderRadius: 16, background: tab.active ? 'rgba(0, 122, 255, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}>
                  <span className="material-icons" style={{ fontSize: 26, color: tab.active ? 'var(--ios-blue)' : '#7f8c8d', transition: 'all 0.2s ease', transform: tab.active ? 'scale(1.05)' : 'scale(1)' }}>{tab.icon}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: tab.active ? 700 : 500, color: tab.active ? 'var(--ios-blue)' : '#7f8c8d', lineHeight: 1.2, letterSpacing: '0.2px' }}>
                  {tab.label}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    )
  }

  const filterFieldsConfig: FilterFieldConfig[] = [
    {
      id: 'nombreCuit',
      label: 'Nombre del Establecimiento / CUIT',
      type: 'text',
      placeholder: 'Buscar por nombre, N° trámite o CUIT...',
      value: busqueda,
      onChange: setBusqueda
    },
    {
      id: 'nroTramite',
      label: 'N° Trámite',
      type: 'text',
      placeholder: 'Ej: 2024-000123',
      value: filtroNroTramite,
      onChange: setFiltroNroTramite
    },
    {
      id: 'nroExpediente',
      label: 'N° Expediente',
      type: 'text',
      placeholder: 'Ej: EX-2024...',
      value: filtroNroExpediente,
      onChange: setFiltroNroExpediente
    },
    {
      id: 'cuit',
      label: 'CUIT',
      type: 'text',
      placeholder: 'Ej: 30-7123...',
      value: filtroCuit,
      onChange: setFiltroCuit
    },
    {
      id: 'tipologia',
      label: 'Tipología',
      type: 'select',
      value: filtroTipologia,
      onChange: setFiltroTipologia,
      options: [
        { value: '', label: 'Todas' },
        { value: 'Clínica con internación', label: 'Clínica con internación' },
        { value: 'Sanatorio', label: 'Sanatorio' },
        { value: 'Geriátrico', label: 'Geriátrico' },
        { value: 'Centro de diagnóstico', label: 'Centro de diagnóstico' },
        { value: 'Consultorio', label: 'Consultorio' }
      ]
    },
    {
      id: 'fechaDesde',
      label: 'Fecha Inicio Desde',
      type: 'date',
      value: filtroFechaDesde,
      onChange: setFiltroFechaDesde
    },
    {
      id: 'fechaHasta',
      label: 'Fecha Inicio Hasta',
      type: 'date',
      value: filtroFechaHasta,
      onChange: setFiltroFechaHasta
    },
    {
      id: 'estado',
      label: 'Estado del Trámite',
      type: 'select',
      value: filtroEstado,
      onChange: val => setFiltroEstado(val as any),
      options: [
        { value: 'TODOS', label: 'Todos' },
        { value: 'ACEPTADO_DOC_AUD', label: 'Para Inspeccionar' },
        { value: 'EN_ANALISIS_AUD', label: 'En Inspección' },
        { value: 'DESCARGO_INSP', label: 'Emplazados' },
        { value: 'ACEPTADO_INSP', label: 'Aprobados' }
      ]
    }
  ]

  // ── DESKTOP VIEW ─────────────────────────────────────────────────
  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Bandeja de Trámites</div>
        <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>
          {tramitesFiltrados.length} trámite{tramitesFiltrados.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="page-content">
        {/* Filters Component */}
        <FiltrosBusqueda
          fields={filterFieldsConfig}
          onLimpiar={handleLimpiarFiltros}
        />

        {/* Table */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Trámite / Expediente</th>
                <th>Establecimiento</th>
                <th>Tipo / Fecha</th>
                <th>Ubicación</th>
                <th>Estado / Etapa</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tramitesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                      <span className="material-icons" style={{ fontSize: 48, color: 'var(--color-gray-400)' }}>inbox</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>No hay trámites que coincidan</div>
                  </td>
                </tr>
              ) : tramitesFiltrados.map(t => {
                const conf = ESTADO_CONFIG[t.estado]

                const TIPO_TRAMITE_LABELS: Record<string, string> = {
                  ALTA_DIGITAL: 'Alta Digital',
                  HABILITACION: 'Habilitación',
                  RENOVACION: 'Renovación',
                  MODIFICACION: 'Modificación',
                  ADECUACION: 'Adecuación'
                }
                const labelTipoTramite = TIPO_TRAMITE_LABELS[t.tipoTramite || ''] || 'Habilitación'

                const getEtapaLabel = (estado: string) => {
                  switch (estado) {
                    case 'PENDIENTE_ARQUITECTURA': return 'Arquitectura';
                    case 'RESPUESTA_EMPLAZAMIENTO': return 'Emplazamiento';
                    case 'ACEPTADO_DOC_AUDITORIA':
                    case 'EN_INSPECCION':
                      return 'Inspección';
                    case 'PENDIENTE_PROTOCOLIZAR': return 'Protocolización';
                    case 'ACEPTADO_INSPECCION': return 'Finalizado';
                    default: return 'Mesa de Entradas';
                  }
                }

                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--color-gray-900)' }}>{t.nroTramite}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>{t.nroExpediente}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 2 }}>{t.denominacion}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-500)' }}>{t.tipologia} · CUIT: {t.cuit}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-gray-800)', fontSize: 12 }}>{labelTipoTramite}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>Iniciado: {t.fechaIngreso}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-gray-800)', fontSize: 12 }}>{t.localidad}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>{t.departamento || 'Capital'}</div>
                    </td>
                    <td>
                      <div style={{ marginBottom: 4 }}>
                        <span className={`badge ${conf.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px' }}>
                          <span className="material-icons" style={{ fontSize: 13 }}>{conf.icon}</span>
                          <span style={{ fontSize: 11 }}>{conf.label}</span>
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-500)' }}>
                        Etapa: <strong style={{ color: 'var(--color-brand-700)' }}>{getEtapaLabel(t.estado)}</strong>
                      </div>
                    </td>
                    <td>
                      <TableActionsMenu
                        options={[
                          ...(t.estado === 'ACEPTADO_DOC_AUD' ? [{
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
                            onClick: () => alert(`Historial de Trámite N° ${t.nroTramite}`)
                          },
                          {
                            label: 'Descargar PDF',
                            icon: 'download',
                            onClick: () => alert(`Descargando PDF del Trámite ${t.nroTramite}...`)
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
