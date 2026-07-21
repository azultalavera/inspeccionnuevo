import React, { useState, useEffect } from 'react'

// Mapping of inspection type codes to user-friendly labels
const TIPO_INSPECCION_LABEL: Record<string, string> = {
  INICIAL: 'Inicial',
  RE_INSPECCION: 'Re-Inspección',
  RUTINA: 'Rutina',
  DENUNCIA: 'Denuncia',
  HABILITACION: 'Habilitación',
};
import { useNavigate } from 'react-router-dom'
import { TRAMITES, type Tramite, type EstadoTramite, ESTADO_CONFIG } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import UserAvatarMenu from '../components/UserAvatarMenu'
import TableActionsMenu from '../components/TableActionsMenu'

// ── Tab configuration for inspection types ──
// Config for each inspection type
const TIPO_CONFIG: Record<string, { label: string; icon: string; color: string; bgLight: string; bgActive: string }> = {
  DENUNCIA: { label: 'Denuncia', icon: 'report', color: '#E74C3C', bgLight: 'rgba(231, 76, 60, 0.08)', bgActive: 'rgba(231, 76, 60, 0.12)' },
  RUTINA: { label: 'Rutina', icon: 'schedule', color: '#2980B9', bgLight: 'rgba(41, 128, 185, 0.08)', bgActive: 'rgba(41, 128, 185, 0.12)' },
  HABILITACION: { label: 'Habilitación', icon: 'verified', color: '#27AE60', bgLight: 'rgba(39, 174, 96, 0.08)', bgActive: 'rgba(39, 174, 96, 0.12)' },
}

const TABS_TIPO = [
  { key: 'TODAS' as const, label: 'Todas', icon: 'fact_check', color: '#5B6ABF', bgLight: 'rgba(91, 106, 191, 0.08)', bgActive: 'rgba(91, 106, 191, 0.12)' },
  { key: 'DENUNCIA' as const, ...TIPO_CONFIG.DENUNCIA },
  { key: 'RUTINA' as const, ...TIPO_CONFIG.RUTINA },
  { key: 'HABILITACION' as const, ...TIPO_CONFIG.HABILITACION },
] as const

type TabTipo = typeof TABS_TIPO[number]['key']
const TIPOS_INSPECCION: string[] = ['DENUNCIA', 'RUTINA', 'HABILITACION']

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth < 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

export default function BandejaInspecciones() {
  const { user } = useAuth()
  const { tramites, iniciarInspeccion } = useApp()
  const navigate = useNavigate()
  const isTablet = useIsTablet()

  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES)
  const [busqueda, setBusqueda] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filterMisInspecciones, setFilterMisInspecciones] = useState(true)

  // Tab state for inspection type
  const [activeTab, setActiveTab] = useState<TabTipo>('TODAS')

  // Advanced filters
  const [filtroFormato, setFiltroFormato] = useState('')

  // Sync locally
  useEffect(() => {
    setLocalTramites(tramites)
  }, [tramites])

  // Helper route triggers
  const handleAbrirInspeccion = (id: string, estado: EstadoTramite) => {
    if (estado === 'ACEPTADO_DOC_AUD') iniciarInspeccion(id)
    navigate(`/inspector/inspeccion/${id}`)
  }

  const handleVerValidacion = (id: string) => navigate(`/inspector/validacion/${id}`)

  // Base filter: only inspection-phase states + only the 3 relevant types
  const baseFilter = (t: Tramite) => {
    const esEstadoInspeccion = [
      'ACEPTADO_DOC_AUD',
      'OBSERVADO_INSP',
      'DESCARGO_INSP',
      'ACEPTADO_INSP',
      'EN_PROTOCOLIZACION',
      'FINALIZADO'
    ].includes(t.estado)
    const esTipoRelevante = TIPOS_INSPECCION.includes(t.tipoInspeccion)
    return esEstadoInspeccion && esTipoRelevante
  }

  // Count per tab (before user-specific filters)
  const totalCount = localTramites.filter(t => baseFilter(t)).length
  const countsByTab = TABS_TIPO.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'TODAS'
      ? totalCount
      : localTramites.filter(t => baseFilter(t) && t.tipoInspeccion === tab.key).length
    return acc
  }, {} as Record<TabTipo, number>)

  // Filtering inspections logic
  const filtrados = localTramites.filter(t => {
    if (!baseFilter(t)) return false

    // Filter by active tab (TODAS = show all 3 types)
    if (activeTab !== 'TODAS' && t.tipoInspeccion !== activeTab) return false

    // Filter by assignee if "Mis Inspecciones" is checked
    const matchAsignado = !filterMisInspecciones || 
      t.inspectorAsignado === `${user?.nombre} ${user?.apellido}` ||
      t.agenteAsignado === `${user?.nombre} ${user?.apellido}`

    const matchBusqueda = busqueda === '' ||
      t.denominacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.nroTramite.includes(busqueda) ||
      t.localidad.toLowerCase().includes(busqueda.toLowerCase())

    const matchFormato = filtroFormato === '' || t.formatoInspeccion === filtroFormato

    return matchAsignado && matchBusqueda && matchFormato
  })

  const activeTabConfig = TABS_TIPO.find(t => t.key === activeTab)!

  // Helper: get the color config for a given tramite's type
  const getTypeConfig = (tipo: string) => TIPO_CONFIG[tipo] || { label: tipo, icon: 'assignment', color: '#888', bgLight: 'rgba(0,0,0,0.05)', bgActive: 'rgba(0,0,0,0.08)' }

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
        paddingBottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px) + 16px)',
      }}>
        {/* Topbar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <UserAvatarMenu size={36} align="right" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--ios-gray)', lineHeight: 1 }}>Bandeja de Inspecciones</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', lineHeight: 1.3, marginTop: 1 }}>
                {filterMisInspecciones ? 'Mis Inspecciones' : 'Todas las Inspecciones'}
              </div>
            </div>
            <button
              onClick={() => setFilterMisInspecciones(!filterMisInspecciones)}
              style={{
                background: 'none', border: 'none', color: 'var(--ios-blue)', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginRight: 10
              }}
            >
              {filterMisInspecciones ? 'Ver Todas' : 'Ver Mías'}
            </button>
            <button
              onClick={() => setShowSearch(s => !s)}
              style={{
                width: 36, height: 36,
                borderRadius: 'var(--radius-full)',
                background: showSearch ? 'var(--ios-blue)' : 'var(--ios-gray5)',
                border: 'none', cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
                color: showSearch ? 'white' : 'var(--color-gray-700)'
              }}
            >
              <span className="material-icons" style={{ fontSize: 20 }}>search</span>
            </button>
          </div>

          {showSearch && (
            <input
              autoFocus
              className="ios-input"
              placeholder="Buscar por establecimiento, trámite, localidad..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ background: 'var(--ios-gray5)', border: 'none', fontSize: 15, padding: '12px 16px', width: '100%', borderRadius: 10, marginBottom: 'var(--space-3)' }}
            />
          )}

          {/* ── Type Tabs (Tablet) ── */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--ios-gray5)', borderRadius: 10, padding: 3 }}>
            {TABS_TIPO.map(tab => {
              const isActive = activeTab === tab.key
              const count = countsByTab[tab.key]
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    padding: '9px 6px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'white' : 'transparent',
                    color: isActive ? tab.color : 'var(--ios-gray)',
                    boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>{tab.icon}</span>
                  {tab.label}
                  {count > 0 && (
                    <span style={{
                      background: isActive ? tab.color : 'var(--ios-gray4)',
                      color: isActive ? 'white' : 'var(--ios-gray)',
                      borderRadius: 20,
                      padding: '1px 7px',
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 20,
                      textAlign: 'center',
                    }}>{count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Scrollable list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {filtrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--ios-gray)' }}>
                <span className="material-icons" style={{ fontSize: 48, color: '#bdc3c7', marginBottom: 8 }}>inbox</span>
                <div>No se encontraron inspecciones de tipo <strong>{activeTabConfig.label}</strong>.</div>
              </div>
            ) : filtrados.map(t => {
              const tc = getTypeConfig(t.tipoInspeccion)
              return (
              <div key={t.id} style={{
                background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--ios-gray5)',
                padding: 'var(--space-4) var(--space-5)',
                borderLeft: `3px solid ${tc.color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)' }}>
                      {t.denominacion}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ios-gray)', marginTop: 2 }}>
                      Trámite: {t.nroTramite} · {t.localidad}
                    </div>
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: tc.bgLight, color: tc.color,
                  }}>
                    <span className="material-icons" style={{ fontSize: 13 }}>{tc.icon}</span>
                    {tc.label}
                  </span>
                </div>

                <div style={{ background: 'var(--ios-gray6)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--ios-gray)' }}>Formato:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-brand-700)' }}>
                      {t.formatoInspeccion}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ios-gray)' }}>Estado:</span>
                    <span style={{ fontWeight: 600 }}>
                      {ESTADO_CONFIG[t.estado]?.label || t.estado}
                    </span>
                  </div>
                </div>

                {t.estado === 'DESCARGO_INSP' ? (
                  <button
                    onClick={() => handleVerValidacion(t.id)}
                    className="btn-ios btn-ios-primary"
                    style={{ width: '100%', padding: '12px', fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#E67E22' }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>rate_review</span>
                    Revisar Respuestas
                  </button>
                ) : t.estado === 'ACEPTADO_DOC_AUD' ? (
                  <button
                    onClick={() => handleAbrirInspeccion(t.id, t.estado)}
                    className="btn-ios btn-ios-primary"
                    style={{ width: '100%', padding: '12px', fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>search</span>
                    {t.estado === 'ACEPTADO_DOC_AUD' ? 'Iniciar Inspección' : 'Continuar Inspección'}
                  </button>
                ) : (
                  <button
                    onClick={() => alert(`Visualizando inspección de ${t.denominacion} (Solo lectura)`)}
                    className="btn-ios btn-ios-gray"
                    style={{ width: '100%', padding: '12px', fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>visibility</span>
                    Ver Detalles
                  </button>
                )}
              </div>
              )
            })}
          </div>
        </div>

        {/* Tab Bar */}
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
            { icon: 'home', label: 'Inicio', active: false, path: '/inspector/home' },
            { icon: 'folder', label: 'Abiertos', active: false, path: '/inspector/expedientes' },
            { icon: 'fact_check', label: 'Inspecciones', active: true, path: '/inspector/inspecciones' },
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
          ))}
        </div>
      </div>
    )
  }

  // ── DESKTOP VIEW ───────────────────────────────────────────────────
  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Bandeja de Inspecciones Sanitarias</div>
      </div>

      <div className="page-content">
        {/* Navigation / Filter Tab */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <button
            onClick={() => setFilterMisInspecciones(true)}
            className={`btn ${filterMisInspecciones ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>person</span>
            Mis Inspecciones Asignadas
          </button>
          <button
            onClick={() => setFilterMisInspecciones(false)}
            className={`btn ${!filterMisInspecciones ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>group</span>
            Todas las Inspecciones
          </button>
        </div>

        {/* ── Type Tabs (Desktop) ── */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}>
          {TABS_TIPO.map(tab => {
            const isActive = activeTab === tab.key
            const count = countsByTab[tab.key]
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-xl)',
                  border: isActive ? `2px solid ${tab.color}` : '2px solid var(--color-gray-200)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? tab.bgActive : 'white',
                  color: isActive ? tab.color : 'var(--color-gray-600)',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 2px 12px ${tab.color}22` : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <span className="material-icons" style={{ fontSize: 22 }}>{tab.icon}</span>
                <span>{tab.label}</span>
                <span style={{
                  background: isActive ? tab.color : 'var(--color-gray-200)',
                  color: isActive ? 'white' : 'var(--color-gray-600)',
                  borderRadius: 20,
                  padding: '2px 10px',
                  fontSize: 13,
                  fontWeight: 700,
                  minWidth: 28,
                  textAlign: 'center',
                }}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-body" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span className="material-icons" style={{ position: 'absolute', left: 12, color: 'var(--color-gray-400)' }}>search</span>
              <input
                className="form-input"
                placeholder="Buscar por establecimiento, CUIT..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ paddingLeft: 38, width: '100%', background: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <div style={{ width: 180 }}>
                <select
                  className="form-select"
                  value={filtroFormato}
                  onChange={e => setFiltroFormato(e.target.value)}
                  style={{ background: 'white' }}
                >
                  <option value="">Formato</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                </select>
              </div>

              {(busqueda || filtroFormato) && (
                <button className="btn btn-ghost" onClick={() => { setBusqueda(''); setFiltroFormato('') }} style={{ color: 'var(--color-danger)' }}>
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Establecimiento</th>
                <th>Trámite / Expediente</th>
                <th>Tipo</th>
                <th>Formato</th>
                <th>Inspector Asignado</th>
                <th>Estado Actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                      <span className="material-icons" style={{ fontSize: 48, color: activeTabConfig.color, opacity: 0.3 }}>{activeTabConfig.icon}</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>No hay inspecciones{activeTab !== 'TODAS' ? <> de tipo <span style={{ color: activeTabConfig.color }}>{activeTabConfig.label}</span></> : ''} registradas.</div>
                  </td>
                </tr>
              ) : filtrados.map(t => {
                const conf = ESTADO_CONFIG[t.estado]
                const tc = getTypeConfig(t.tipoInspeccion)
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 4, height: 32, borderRadius: 2,
                          background: tc.color, flexShrink: 0,
                        }} />
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
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                        background: tc.bgLight, color: tc.color,
                      }}>
                        <span className="material-icons" style={{ fontSize: 14 }}>{tc.icon}</span>
                        {tc.label}
                      </span>
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
                            onClick: () => alert(`Historial de Inspección N° ${t.nroTramite}`)
                          },
                          {
                            label: 'Descargar Acta',
                            icon: 'download',
                            onClick: () => alert(`Descargando Acta de Inspección del Trámite ${t.nroTramite}...`)
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
