import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ESTADO_CONFIG, type EstadoTramite, type Tramite } from '../data/mockData'
import UserAvatarMenu from '../components/UserAvatarMenu'
import TableActionsMenu from '../components/TableActionsMenu'
import ModalIniciarTramite, { TIPOLOGIAS_DATA } from '../components/ModalIniciarTramite'
import FiltrosBusqueda, { FilterFieldConfig } from '../components/FiltrosBusqueda'

const ESTADO_FILTROS: { value: EstadoTramite | 'TODOS'; label: string; icon: string }[] = [
  { value: 'TODOS', label: 'Todos', icon: 'apps' },
  { value: 'ACEPTADO_DOC_AUD', label: 'Para Inspeccionar', icon: 'assignment' },
  { value: 'OBSERVADO_INSP', label: 'Observado Inspección', icon: 'warning' },
  { value: 'ACEPTADO_INSP', label: 'Aprobados', icon: 'check_circle' },
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

// ── Tablet: Card de trámite del Efector ─────────────────────────────
function TramiteEfectorCard({ t, onAction }: { t: Tramite; onAction: () => void }) {
  const conf = ESTADO_CONFIG[t.estado]
  const isEmplazado = t.estado === 'OBSERVADO_INSP' || t.estado === 'DESCARGO_INSP'
  const isAprobado = t.estado === 'ACEPTADO_INSP' || t.estado === 'FINALIZADO'

  const accentColor = isEmplazado
    ? 'var(--ios-red)'
    : isAprobado
    ? 'var(--ios-green)'
    : 'var(--ios-blue)'

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
      <div style={{ height: 4, background: accentColor }} />

      <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
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

        {/* Details Grid */}
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
            { label: 'Acta',       value: `N° ${t.nroActa ?? '—'}`, mono: false },
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

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className={`badge ${t.tipoInspeccion === 'INICIAL' ? 'badge-brand' : 'badge-warning'}`}>
            {t.tipoInspeccion === 'INICIAL' ? 'Inicial' : 'Re-inspección'}
          </span>
          <span className="badge badge-neutral">{t.formatoInspeccion}</span>
          <div style={{ flex: 1 }} />

          {isEmplazado ? (
            <button
              onClick={onAction}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px',
                background: 'var(--ios-red)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-xl)',
                fontFamily: 'var(--font-family)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 12px rgba(255,59,48,0.30)',
              }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>edit</span>
              Responder
            </button>
          ) : isAprobado ? (
            <span style={{ fontSize: 13, color: 'var(--ios-green)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span className="material-icons" style={{ fontSize: 16 }}>check_circle</span>
              Aprobado
            </span>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--ios-gray)', fontStyle: 'italic' }}>En Evaluación</span>
          )}
        </div>
      </div>
    </div>
  )
}

import ModalResponderEmplazamiento from '../components/ModalResponderEmplazamiento'

export default function BandejaTramitesEfector() {
  const { tramites } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isTablet = useIsTablet()

  // States for starting a new trámite
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEmplazamientoTramite, setSelectedEmplazamientoTramite] = useState<Tramite | null>(null)
  const { crearNuevoTramite } = useApp()

  const handleIniciarTramite = (tipo: 'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION', tipologia: string, establecimientoId?: string, actaPadreId?: string) => {
    const nuevo = crearNuevoTramite(tipo, tipologia, establecimientoId, actaPadreId)
    setModalOpen(false)
    navigate(`/efector/alta-habilitacion/${nuevo.id}`)
  }

  // Basic search/chips state
  const [filtroEstado, setFiltroEstado] = useState<EstadoTramite | 'TODOS'>('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Advanced filters state
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false)
  const [filtroTipoTramite, setFiltroTipoTramite] = useState('')
  const [filtroTipologia, setFiltroTipologia] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroFechaCambioDesde, setFiltroFechaCambioDesde] = useState('')
  const [filtroFechaCambioHasta, setFiltroFechaCambioHasta] = useState('')

  const handleLimpiarFiltros = () => {
    setFiltroTipoTramite('')
    setFiltroTipologia('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setFiltroFechaCambioDesde('')
    setFiltroFechaCambioHasta('')
    setFiltroEstado('TODOS')
    setBusqueda('')
  }

  const tramitesFiltrados = tramites.filter(t => {
    // 1. Nombre del Establecimiento / CUIT
    const matchBusqueda = busqueda === '' ||
      t.denominacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.cuit.includes(busqueda)

    // 2. Tipo de Trámite
    const matchTipoTramite = filtroTipoTramite === '' || t.tipoTramite === filtroTipoTramite

    // 3. Tipología
    const matchTipologia = filtroTipologia === '' || t.tipologia === filtroTipologia

    // 4. Fecha Inicio
    const matchFechaInicio = (!filtroFechaDesde || t.fechaIngreso >= filtroFechaDesde) &&
                             (!filtroFechaHasta || t.fechaIngreso <= filtroFechaHasta)

    // 5. Fecha Último Cambio de Estado (re-using fechaIngreso for mock purposes)
    const matchFechaCambio = (!filtroFechaCambioDesde || t.fechaIngreso >= filtroFechaCambioDesde) &&
                             (!filtroFechaCambioHasta || t.fechaIngreso <= filtroFechaCambioHasta)

    // 6. Estado del Trámite
    const matchEstado = filtroEstado === 'TODOS' || t.estado === filtroEstado

    return matchBusqueda && matchTipoTramite && matchTipologia && matchFechaInicio && matchFechaCambio && matchEstado
  })

  const handleResponder = (id: string) => {
    const tr = tramites.find(t => t.id === id)
    if (tr) setSelectedEmplazamientoTramite(tr)
    else navigate(`/efector/responder/${id}`)
  }

  const STATS = [
    { label: 'Para Inspeccionar', count: tramites.filter(t => t.estado === 'ACEPTADO_DOC_AUD').length, icon: 'assignment', color: '#0dcaf0', bg: 'var(--color-info-light)' },
    { label: 'En Inspección',     count: tramites.filter(t => t.estado === 'EN_ANALISIS_AUD').length,           icon: 'search', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
    { label: 'Con Emplazamiento', count: tramites.filter(t => t.estado === 'OBSERVADO_INSP' || t.estado === 'DESCARGO_INSP').length,  icon: 'warning', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
    { label: 'Aprobados',         count: tramites.filter(t => t.estado === 'ACEPTADO_INSP').length,     icon: 'check_circle', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  ]

  // ── TABLET VIEW ────────────────────────────────────────────────────
  if (isTablet) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--ios-gray6)',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 768,
        margin: '0 auto',
        paddingBottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))',
      }}>
        {/* iOS-style Top Bar */}
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
              <div style={{ fontSize: 13, color: 'var(--ios-gray)', lineHeight: 1 }}>Efector</div>
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

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-4)' }}>
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-gray-900)', letterSpacing: '-0.5px' }}>
              Mis Trámites
            </div>
            <div style={{ fontSize: 14, color: 'var(--ios-gray)', marginTop: 4 }}>
              {tramitesFiltrados.length} trámite{tramitesFiltrados.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
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
                  border: '1.5px solid transparent',
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

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-4)', scrollbarWidth: 'none' }}>
            {ESTADO_FILTROS.map(f => (
              <button
                key={f.value}
                onClick={() => setFiltroEstado(f.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 16px', borderRadius: 'var(--radius-full)', border: 'none',
                  background: filtroEstado === f.value ? 'var(--ios-blue)' : 'white',
                  color: filtroEstado === f.value ? 'white' : 'var(--ios-gray)',
                  fontFamily: 'var(--font-family)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards List */}
          {tramitesFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)', color: 'var(--ios-gray)' }}>
              <div style={{ fontSize: 56, marginBottom: 'var(--space-4)' }}>📭</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-gray-700)', marginBottom: 'var(--space-2)' }}>Sin resultados</div>
              <div style={{ fontSize: 14 }}>No tenés trámites que coincidan con el filtro.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {tramitesFiltrados.map(t => (
                <TramiteEfectorCard
                  key={t.id}
                  t={t}
                  onAction={() => handleResponder(t.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* iOS Bottom Tab Bar */}
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
          {[
            { icon: 'home', label: 'Inicio', active: false, path: '/efector/home' },
            { icon: 'business', label: 'Locales', active: false, path: '/efector/establecimientos' },
            { icon: 'assignment', label: 'Trámites', active: true, path: '/efector/bandeja' },
          ].map(tab => (
            <button key={tab.label} onClick={() => navigate(tab.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', flex: 1, height: '100%', padding: '8px 0' }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 32, borderRadius: 16, background: tab.active ? 'rgba(0, 122, 255, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}>
                <span className="material-icons" style={{ fontSize: 26, color: tab.active ? 'var(--ios-blue)' : '#7f8c8d', transition: 'all 0.2s ease', transform: tab.active ? 'scale(1.05)' : 'scale(1)' }}>{tab.icon}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: tab.active ? 700 : 500, color: tab.active ? 'var(--ios-blue)' : '#7f8c8d', lineHeight: 1.2, letterSpacing: '0.2px' }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── DESKTOP VIEW ───────────────────────────────────────────────────
  const filterFieldsConfig: FilterFieldConfig[] = [
    {
      id: 'nombreCuit',
      label: 'Nombre del Establecimiento / CUIT',
      type: 'text',
      placeholder: 'Buscar por nombre o CUIT...',
      value: busqueda,
      onChange: setBusqueda
    },
    {
      id: 'tipoTramite',
      label: 'Tipo de Trámite',
      type: 'select',
      value: filtroTipoTramite,
      onChange: setFiltroTipoTramite,
      options: [
        { value: '', label: 'Todos' },
        { value: 'HABILITACION', label: 'Habilitación' },
        { value: 'RENOVACION', label: 'Renovación' },
        { value: 'MODIFICACION', label: 'Modificación' },
        { value: 'ADECUACION', label: 'Adecuación' }
      ]
    },
    {
      id: 'tipologia',
      label: 'Tipología',
      type: 'select',
      value: filtroTipologia,
      onChange: setFiltroTipologia,
      options: [
        { value: '', label: 'Todas' },
        ...Object.keys(TIPOLOGIAS_DATA).map(key => ({ value: key, label: key }))
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
      id: 'fechaCambioDesde',
      label: 'Último Cambio Desde',
      type: 'date',
      value: filtroFechaCambioDesde,
      onChange: setFiltroFechaCambioDesde
    },
    {
      id: 'fechaCambioHasta',
      label: 'Último Cambio Hasta',
      type: 'date',
      value: filtroFechaCambioHasta,
      onChange: setFiltroFechaCambioHasta
    },
    {
      id: 'estado',
      label: 'Estado del Trámite',
      type: 'select',
      value: filtroEstado,
      onChange: val => setFiltroEstado(val as any),
      options: [
        { value: 'TODOS', label: 'Todos' },
        { value: 'BORRADOR_ARQ', label: 'Borrador Arquitectura' },
        { value: 'PENDIENTE_EVAL_ARQ', label: 'Pendiente de Evaluación Arquitectura' },
        { value: 'EN_ANALISIS_ARQ', label: 'En Análisis Arquitectura' },
        { value: 'OBSERVADO_ARQ', label: 'Observado Arquitectura' },
        { value: 'RECTIFICADO_ARQ', label: 'Rectificado Arquitectura' },
        { value: 'ADECUADO_ARQ', label: 'Adecuado Arquitectura' },
        { value: 'ADECUADO_OBS_ARQ', label: 'Adecuado con Obs. Arquitectura' },
        { value: 'RECHAZADO_ARQ', label: 'Rechazado Arquitectura' },
        { value: 'BORRADOR_AUD', label: 'Borrador Auditoría' },
        { value: 'PENDIENTE_EVAL_AUD', label: 'Pendiente de Evaluación Auditoría' },
        { value: 'EN_ANALISIS_AUD', label: 'En Análisis Auditoría' },
        { value: 'OBSERVADO_AUD', label: 'Observado Auditoría' },
        { value: 'RECTIFICADO_AUD', label: 'Rectificado Auditoría' },
        { value: 'ACEPTADO_DOC_AUD', label: 'Aceptado Doc. Auditoría' },
        { value: 'OBSERVADO_INSP', label: 'Observado Inspección' },
        { value: 'DESCARGO_INSP', label: 'Respuesta Emplazamiento' },
        { value: 'ACEPTADO_INSP', label: 'Aceptado Inspección' },
        { value: 'EN_PROTOCOLIZACION', label: 'En Protocolización' },
        { value: 'FINALIZADO', label: 'Finalizado' }
      ]
    }
  ]

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Bandeja de Trámites</div>
          <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 2 }}>
            Gestión y seguimiento de solicitudes de habilitación y adecuación
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span className="material-icons">add_business</span>
            Iniciar Trámite
          </button>
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
          <table className="table table-wide">
            <thead>
              <tr>
                <th>Nombre del<br/>Establecimiento</th>
                <th>Tipo de<br/>Trámite</th>
                <th>Tipología</th>
                <th>Fecha Inicio</th>
                <th>Fecha Último<br/>Cambio de Estado</th>
                <th>Estado del<br/>Trámite</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tramitesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                      <span className="material-icons" style={{ fontSize: 48, color: 'var(--color-gray-400)' }}>inbox</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>No hay trámites que coincidan</div>
                  </td>
                </tr>
              ) : tramitesFiltrados.map(t => {
                const conf = ESTADO_CONFIG[t.estado]
                const isEmplazado = t.estado === 'OBSERVADO_INSP'

                const TIPO_TRAMITE_LABELS: Record<string, string> = {
                  ALTA_DIGITAL: 'Alta Digital',
                  HABILITACION: 'Habilitación',
                  RENOVACION: 'Renovación',
                  MODIFICACION: 'Modificación',
                  ADECUACION: 'Adecuación'
                }
                const labelTipoTramite = TIPO_TRAMITE_LABELS[t.tipoTramite || ''] || 'Habilitación'

                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 2 }}>{t.denominacion}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>CUIT: {t.cuit}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      <span className="badge badge-neutral" style={{ padding: '4px 8px', fontWeight: 600 }}>
                        {labelTipoTramite}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{t.tipologia}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>{t.fechaIngreso}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>{t.fechaIngreso}</td>
                    <td>
                      <span className={`badge ${conf.badge}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {conf.label}
                      </span>
                    </td>
                    <td>
                      <TableActionsMenu
                        options={[
                          ...(isEmplazado ? [{
                            label: 'Cargar Respuesta',
                            icon: 'edit',
                            onClick: () => handleResponder(t.id)
                          }] : []),
                          {
                            label: 'Ver Historial',
                            icon: 'history',
                            onClick: () => alert(`Historial de Trámite N° ${t.nroTramite}`)
                          },
                          {
                            label: 'Visualizar Trámite',
                            icon: 'visibility',
                            onClick: () => alert(`Visualizando trámite ${t.nroTramite} en modo consulta`)
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
      {/* Modal Iniciar Trámite */}
      <ModalIniciarTramite
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleIniciarTramite}
      />

      {/* Modal Responder Emplazamiento */}
      {selectedEmplazamientoTramite && (
        <ModalResponderEmplazamiento
          tramite={selectedEmplazamientoTramite}
          onClose={() => setSelectedEmplazamientoTramite(null)}
          onOpenIniciarModificacion={(actaPadreId) => {
            handleIniciarTramite('MODIFICACION', selectedEmplazamientoTramite.tipologia, undefined, actaPadreId)
          }}
        />
      )}
    </>
  )
}
