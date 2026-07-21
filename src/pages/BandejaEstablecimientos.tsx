import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ESTABLECIMIENTOS, TRAMITES, type Establecimiento, type Tramite } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import UserAvatarMenu from '../components/UserAvatarMenu'
import { TIPOLOGIAS_DATA } from '../components/ModalIniciarTramite'
import TableActionsMenu from '../components/TableActionsMenu'
import FiltrosBusqueda, { type FilterFieldConfig } from '../components/FiltrosBusqueda'

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth < 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

export default function BandejaEstablecimientos() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isTablet = useIsTablet()

  const [busqueda, setBusqueda] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedEst, setSelectedEst] = useState<Establecimiento | null>(null)
  const [modalMode, setModalMode] = useState<'HISTORIAL' | 'DOCUMENTOS' | null>(null)

  // Advanced Filters
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false)
  const [filtroNroExpediente, setFiltroNroExpediente] = useState('')
  const [filtroCuit, setFiltroCuit] = useState('')
  const [filtroTipologia, setFiltroTipologia] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [filtroLocalidad, setFiltroLocalidad] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  const handleLimpiarFiltros = () => {
    setFiltroNroExpediente('')
    setFiltroCuit('')
    setFiltroTipologia('')
    setFiltroDepartamento('')
    setFiltroLocalidad('')
    setFiltroEstado('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setBusqueda('')
  }

  const getLocalidades = () => {
    switch (filtroDepartamento) {
      case 'Capital': return ['Córdoba']
      case 'Punilla': return ['Villa Carlos Paz']
      case 'General San Martín': return ['Villa María']
      case 'Río Cuarto': return ['Río Cuarto']
      default: return []
    }
  }

  // Sort alphabetically by default
  const estOrdenados = [...ESTABLECIMIENTOS].sort((a, b) => a.denominacion.localeCompare(b.denominacion))

  const filtrados = estOrdenados.filter(e => {
    const matchBusqueda = busqueda === '' ||
      e.denominacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cuit.includes(busqueda) ||
      e.localidad.toLowerCase().includes(busqueda.toLowerCase())

    const matchNroExpediente = filtroNroExpediente === '' || e.nroExpediente.toLowerCase().includes(filtroNroExpediente.toLowerCase())
    const matchCuit = filtroCuit === '' || e.cuit.includes(filtroCuit)
    const matchTipologia = filtroTipologia === '' || e.tipologia === filtroTipologia
    const matchDepartamento = filtroDepartamento === '' || e.departamento === filtroDepartamento
    const matchLocalidad = filtroLocalidad === '' || e.localidad === filtroLocalidad
    const matchEstado = filtroEstado === '' || e.estado === filtroEstado
    
    // We parse mock creation date DD/MM/YYYY into YYYY-MM-DD for date comparisons
    const parseDate = (dStr: string) => {
      const parts = dStr.split('/')
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
      return dStr
    }
    const creationDate = parseDate(e.fechaCreacion)
    const matchFecha = (!filtroFechaDesde || creationDate >= filtroFechaDesde) &&
                       (!filtroFechaHasta || creationDate <= filtroFechaHasta)

    return matchBusqueda && matchNroExpediente && matchCuit && matchTipologia && matchDepartamento && matchLocalidad && matchEstado && matchFecha
  })

  const handleOpenHistorial = (est: Establecimiento) => {
    setSelectedEst(est)
    setModalMode('HISTORIAL')
  }

  const handleOpenDocumentos = (est: Establecimiento) => {
    setSelectedEst(est)
    setModalMode('DOCUMENTOS')
  }

  const handleVerTramite = (t: Tramite) => {
    // If assigned to current user, we can resolve/inspect, else view-only mode
    const isAssigned = t.agenteAsignado === `${user?.nombre} ${user?.apellido}`
    if (isAssigned) {
      if (t.estado === 'ACEPTADO_DOC_AUD') {
        navigate(`/inspector/inspeccion/${t.id}`)
        return
      }
      if (t.estado === 'DESCARGO_INSP') {
        navigate(`/inspector/validacion/${t.id}`)
        return
      }
    }
    // Read only consultation
    alert(`Visualizando Trámite ${t.nroTramite} en MODO CONSULTA (Solo lectura).\nEstablecimiento: ${t.denominacion}\nEstado: ${t.estado}`)
  }

  // Filtered mock documents for the selected establishment
  const mockDocs = [
    { nombre: 'Resolución de Habilitación Sanitaria.pdf', fechaEmision: '15/03/2023', fechaFin: '15/03/2028' },
    { nombre: 'Certificado de Trámite en Curso.pdf', fechaEmision: '10/06/2024', fechaFin: '10/09/2024' },
  ]

  // Filtered mock history for the selected establishment
  const getHistorialTramites = (est: Establecimiento) => {
    // Find matching mock tramites by cuit or name similarity
    return TRAMITES.filter(t => t.cuit === est.cuit)
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: showSearch ? 'var(--space-3)' : 0 }}>
            <UserAvatarMenu size={36} align="right" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--ios-gray)', lineHeight: 1 }}>{user?.rol}</div>
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
              placeholder="Buscar establecimiento..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ background: 'var(--ios-gray5)', border: 'none', fontSize: 15, padding: '12px 16px' }}
            />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-4)' }}>
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-gray-900)', letterSpacing: '-0.5px' }}>
              Establecimientos
            </div>
            <div style={{ fontSize: 14, color: 'var(--ios-gray)', marginTop: 4 }}>
              {filtrados.length} establecimientos registrados
            </div>
          </div>

          {/* Cards list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {filtrados.map(est => (
              <div key={est.id} style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--ios-gray5)',
                padding: 'var(--space-4) var(--space-5)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-gray-900)' }}>
                      {est.denominacion}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ios-gray)', marginTop: 2 }}>
                      CUIT: {est.cuit} · Exp: {est.nroExpediente}
                    </div>
                  </div>
                  <span className={`badge ${est.estado === 'Habilitado' ? 'badge-success' : 'badge-warning'}`}>
                    {est.estado}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)' }}>
                  📍 {est.localidad} ({est.departamento}) · 🏢 {est.tipologia}
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    onClick={() => handleOpenHistorial(est)}
                    className="btn-ios btn-ios-gray"
                    style={{ flex: 1, padding: '10px', fontSize: 13 }}
                  >
                    📂 Ver Historial
                  </button>
                  <button
                    onClick={() => handleOpenDocumentos(est)}
                    className="btn-ios btn-ios-gray"
                    style={{ flex: 1, padding: '10px', fontSize: 13 }}
                  >
                    📄 Documentos
                  </button>
                </div>
              </div>
            ))}
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
          {user?.rol === 'INSPECTOR' ? (
            [
              { icon: 'home', label: 'Inicio', active: false, path: '/inspector/home' },
              { icon: 'folder', label: 'Abiertos', active: false, path: '/inspector/expedientes' },
              { icon: 'assignment', label: 'Trámites', active: false, path: '/inspector/bandeja' },
              { icon: 'business', label: 'Locales', active: true, path: '/inspector/establecimientos' },
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
              { icon: 'home', label: 'Inicio', active: false, path: '/efector/home' },
              { icon: 'business', label: 'Locales', active: true, path: '/efector/establecimientos' },
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
      placeholder: 'Buscar por nombre o CUIT...',
      value: busqueda,
      onChange: setBusqueda
    },
    {
      id: 'nroExpediente',
      label: 'N° Expediente',
      type: 'text',
      placeholder: 'Ej: 0425...',
      value: filtroNroExpediente,
      onChange: setFiltroNroExpediente
    },
    {
      id: 'cuit',
      label: 'CUIT',
      type: 'text',
      placeholder: 'Ej: 30-545...',
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
        ...Object.keys(TIPOLOGIAS_DATA).map(key => ({ value: key, label: key }))
      ]
    },
    {
      id: 'estado',
      label: 'Estado',
      type: 'select',
      value: filtroEstado,
      onChange: setFiltroEstado,
      options: [
        { value: '', label: 'Todos' },
        { value: 'Habilitado', label: 'Habilitado' },
        { value: 'En Proceso', label: 'En Proceso' },
        { value: 'Rechazado', label: 'Rechazado' },
        { value: 'Próximo a Vencer', label: 'Próximo a Vencer' }
      ]
    },
    {
      id: 'fechaDesde',
      label: 'Fecha Creación Desde',
      type: 'date',
      value: filtroFechaDesde,
      onChange: setFiltroFechaDesde
    },
    {
      id: 'fechaHasta',
      label: 'Fecha Creación Hasta',
      type: 'date',
      value: filtroFechaHasta,
      onChange: setFiltroFechaHasta
    }
  ]

  // ── DESKTOP VIEW ───────────────────────────────────────────────────
  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Consulta de Establecimientos</div>
        <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>
          {filtrados.length} establecimientos registrados
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
                <th>Establecimiento</th>
                <th>CUIT</th>
                <th>N° Expediente</th>
                <th>Localidad</th>
                <th>Tipología</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                      <span className="material-icons" style={{ fontSize: 48, color: 'var(--color-gray-400)' }}>inbox</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>No hay establecimientos registrados.</div>
                  </td>
                </tr>
              ) : filtrados.map(est => (
                <tr key={est.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{est.denominacion}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>Creado el {est.fechaCreacion}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{est.cuit}</td>
                  <td style={{ fontFamily: 'monospace' }}>{est.nroExpediente}</td>
                  <td>{est.localidad}</td>
                  <td>{est.tipologia}</td>
                  <td>
                    <span className={`badge ${est.estado === 'Habilitado' ? 'badge-success' : 'badge-warning'}`}>
                      {est.estado}
                    </span>
                  </td>
                  <td>
                    <TableActionsMenu
                      options={[
                        {
                          label: 'Ver Historial',
                          icon: 'history',
                          onClick: () => handleOpenHistorial(est)
                        },
                        {
                          label: 'Ver Documentos',
                          icon: 'folder_open',
                          onClick: () => handleOpenDocumentos(est)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popups Modales */}
      {modalMode && selectedEst && (
        <div className="modal-overlay" onClick={() => { setModalMode(null); setSelectedEst(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <div className="modal-title">
                {modalMode === 'HISTORIAL' ? '📂 Historial de Trámites' : '📄 Documentos Solicitados'}
              </div>
              <button className="btn-icon" onClick={() => { setModalMode(null); setSelectedEst(null); }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 12 }}>
                <h4 style={{ margin: 0, fontWeight: 700 }}>{selectedEst.denominacion}</h4>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-gray-500)' }}>
                  Exp: {selectedEst.nroExpediente} · CUIT: {selectedEst.cuit}
                </p>
              </div>

              {modalMode === 'HISTORIAL' ? (
                <div className="table-wrapper" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>N° Trámite</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getHistorialTramites(selectedEst).length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-gray-400)' }}>
                            No hay trámites registrados.
                          </td>
                        </tr>
                      ) : getHistorialTramites(selectedEst).map(t => (
                        <tr key={t.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.nroTramite}</td>
                          <td>{t.tipoInspeccion === 'INICIAL' ? 'Habilitación Inicial' : 'Re-inspección'}</td>
                          <td>
                            <span className="badge badge-neutral">{t.estado}</span>
                          </td>
                          <td>
                            <button onClick={() => { setModalMode(null); handleVerTramite(t); }} className="btn btn-primary btn-sm">
                              👁 Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre del Archivo</th>
                        <th>Emisión</th>
                        <th>Vencimiento</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockDocs.map(doc => (
                        <tr key={doc.nombre}>
                          <td style={{ fontWeight: 500 }}>{doc.nombre}</td>
                          <td>{doc.fechaEmision}</td>
                          <td>{doc.fechaFin}</td>
                          <td>
                            <button onClick={() => alert(`Descargando ${doc.nombre}...`)} className="btn btn-ghost btn-sm">
                              ⬇ Descargar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setModalMode(null); setSelectedEst(null); }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
