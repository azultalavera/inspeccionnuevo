import React, { useState, useEffect } from 'react'
import { TRAMITES, USUARIOS, ESTADO_CONFIG, type Tramite } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import UserAvatarMenu from '../components/UserAvatarMenu'
import TableActionsMenu from '../components/TableActionsMenu'
import FiltrosBusqueda, { FilterFieldConfig } from '../components/FiltrosBusqueda'

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth < 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

export default function BandejaAsignacion() {
  const { user } = useAuth()
  const { tramites } = useApp()
  const isTablet = useIsTablet()

  // State managed locally or read from context
  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES)
  const [busqueda, setBusqueda] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Modal State
  const [selectedTramite, setSelectedTramite] = useState<Tramite | null>(null)
  const [selectedAgente, setSelectedAgente] = useState('')
  const [selectedRol, setSelectedRol] = useState('')
  const [motivo, setMotivo] = useState('')
  const [isMasivo, setIsMasivo] = useState(false)

  // Advanced Filters
  const [filtroTipoTramite, setFiltroTipoTramite] = useState('')
  const [filtroTipologia, setFiltroTipologia] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroFechaCambioDesde, setFiltroFechaCambioDesde] = useState('')
  const [filtroFechaCambioHasta, setFiltroFechaCambioHasta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroAgente, setFiltroAgente] = useState('')

  const handleLimpiarFiltros = () => {
    setBusqueda('')
    setFiltroTipoTramite('')
    setFiltroTipologia('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setFiltroFechaCambioDesde('')
    setFiltroFechaCambioHasta('')
    setFiltroEstado('')
    setFiltroAgente('')
  }

  // Sync state if context changes
  useEffect(() => {
    setLocalTramites(tramites)
  }, [tramites])

  // Agents list (Inspectors, Auditors, Architects)
  const agentesDisponibles = USUARIOS.filter(u => u.rol !== 'EFECTOR' && u.rol !== 'COORDINADOR')

  const handleOpenAsignar = (t: Tramite) => {
    setSelectedTramite(t)
    setSelectedAgente(t.agenteAsignado ?? '')
    setSelectedRol('')
    setMotivo('')
    setIsMasivo(false)
  }

  const handleOpenAsignarMasivo = () => {
    if (selectedIds.size === 0) {
      alert('Seleccione al menos un trámite para asignación masiva')
      return
    }
    setSelectedTramite({ id: 'masivo' } as Tramite)
    setSelectedAgente('')
    setSelectedRol('')
    setMotivo('')
    setIsMasivo(true)
  }

  const handleConfirmarAsignacion = () => {
    if (!selectedTramite) return
    if (isMasivo) {
      setLocalTramites(prev => prev.map(t =>
        selectedIds.has(t.id)
          ? { ...t, agenteAsignado: selectedAgente, inspectorAsignado: selectedAgente || 'Sin asignar' }
          : t
      ))
      alert(`✓ ${selectedIds.size} trámite(s) asignado(s) con éxito a: ${selectedAgente || 'Sin asignar'}`)
      setSelectedIds(new Set())
    } else {
      setLocalTramites(prev => prev.map(t =>
        t.id === selectedTramite.id
          ? { ...t, agenteAsignado: selectedAgente, inspectorAsignado: selectedAgente || 'Sin asignar' }
          : t
      ))
      alert(`✓ Trámite asignado con éxito a: ${selectedAgente || 'Sin asignar'}`)
    }
    setSelectedTramite(null)
  }

  // Filter items
  const filtrados = localTramites.filter(t => {
    const matchBusqueda = busqueda === '' ||
      t.denominacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.cuit.includes(busqueda) ||
      t.nroTramite.includes(busqueda) ||
      t.localidad.toLowerCase().includes(busqueda.toLowerCase())

    const matchTipoTramite = filtroTipoTramite === '' || t.tipoTramite === filtroTipoTramite
    const matchTipologia = filtroTipologia === '' || t.tipologia === filtroTipologia
    const matchEstado = filtroEstado === '' || t.estado === filtroEstado
    const matchAgente = filtroAgente === '' || t.agenteAsignado === filtroAgente

    // Parse date for comparison
    const parseDate = (dStr: string) => {
      const parts = dStr.split('/')
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
      return dStr
    }
    const ingreso = parseDate(t.fechaIngreso)
    const matchFechaInicio = (!filtroFechaDesde || ingreso >= filtroFechaDesde) &&
                             (!filtroFechaHasta || ingreso <= filtroFechaHasta)
    const matchFechaCambio = (!filtroFechaCambioDesde || ingreso >= filtroFechaCambioDesde) &&
                             (!filtroFechaCambioHasta || ingreso <= filtroFechaCambioHasta)

    return matchBusqueda && matchTipoTramite && matchTipologia && matchEstado && matchAgente && matchFechaInicio && matchFechaCambio
  })

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
              <div style={{ fontSize: 13, color: 'var(--ios-gray)', lineHeight: 1 }}>Coordinador</div>
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
              placeholder="Buscar trámite..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ background: 'var(--ios-gray5)', border: 'none', fontSize: 15, padding: '12px 16px' }}
            />
          )}
        </div>

        {/* Scrollable List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {filtrados.map(t => (
              <div key={t.id} style={{
                background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--ios-gray5)',
                padding: 'var(--space-4) var(--space-5)'
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
                </div>

                <div style={{ background: 'var(--ios-gray6)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--ios-gray)' }}>Estado:</span>
                    <span style={{ fontWeight: 600 }}>{t.estado}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ios-gray)' }}>Agente asignado:</span>
                    <span style={{ fontWeight: 700, color: t.agenteAsignado ? 'var(--ios-blue)' : 'var(--ios-orange)' }}>
                      {t.agenteAsignado || (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-icons" style={{ fontSize: 14 }}>warning</span>
                          Sin Asignar
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAsignar(t)}
                  className="btn-ios btn-ios-primary"
                  style={{ width: '100%', padding: '12px', fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>assignment_ind</span>
                  Asignar Agente
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── DESKTOP VIEW ───────────────────────────────────────────────────

  const TIPO_TRAMITE_LABELS: Record<string, string> = {
    ALTA_DIGITAL: 'Alta Digital',
    HABILITACION: 'Habilitación',
    RENOVACION: 'Renovación',
    MODIFICACION: 'Modificación',
    ADECUACION: 'Adecuación'
  }

  const getEtapaLabel = (estado: string) => {
    switch (estado) {
      case 'BORRADOR_ARQ':
      case 'PENDIENTE_EVAL_ARQ':
      case 'EN_ANALISIS_ARQ':
      case 'OBSERVADO_ARQ':
      case 'RECTIFICADO_ARQ':
      case 'ADECUADO_ARQ':
      case 'ADECUADO_OBS_ARQ':
      case 'RECHAZADO_ARQ':
        return 'ARQUITECTURA';
      case 'BORRADOR_AUD':
      case 'PENDIENTE_EVAL_AUD':
      case 'EN_ANALISIS_AUD':
      case 'OBSERVADO_AUD':
      case 'RECTIFICADO_AUD':
      case 'ACEPTADO_DOC_AUD':
        return 'AUDITORÍA';
      case 'OBSERVADO_INSP':
      case 'DESCARGO_INSP':
      case 'ACEPTADO_INSP':
        return 'INSPECCIÓN';
      case 'EN_PROTOCOLIZACION':
        return 'PROTOCOLIZACIÓN';
      case 'FINALIZADO':
        return 'FINALIZADO';
      default:
        return 'MESA DE ENTRADAS';
    }
  }

  // Selection state for mass assignment
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtrados.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtrados.map(t => t.id)))
    }
  }

  // Historial modals
  const [showHistorialEstados, setShowHistorialEstados] = useState<Tramite | null>(null)
  const [showHistorialAsignacion, setShowHistorialAsignacion] = useState<Tramite | null>(null)

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
      onChange: setFiltroEstado,
      options: [
        { value: '', label: 'Todos' },
        ...Object.entries(ESTADO_CONFIG).map(([key, val]) => ({ value: key, label: val.label }))
      ]
    },
    {
      id: 'agente',
      label: 'Agente Asignado',
      type: 'select',
      value: filtroAgente,
      onChange: setFiltroAgente,
      options: [
        { value: '', label: 'Todos' },
        ...agentesDisponibles.map(ag => ({ value: `${ag.nombre} ${ag.apellido}`, label: `${ag.nombre} ${ag.apellido}` }))
      ]
    }
  ]

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Asignación de Trámites</div>
        <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>
          {filtrados.length} trámite{filtrados.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="page-content">
        {/* Filters Component */}
        <FiltrosBusqueda
          fields={filterFieldsConfig}
          onLimpiar={handleLimpiarFiltros}
        />

        {/* Table Header Controls / Tabs Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12
        }}>
          {/* List title & count badge */}
          <div style={{ fontSize: 15, fontWeight: 750, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Trámites Sanitarios</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0055A5', background: '#E0F2FE', padding: '2px 10px', borderRadius: 20 }}>
              {filtrados.length}
            </span>
          </div>

          {/* Right Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {selectedIds.size > 0 && (
              <span style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: '#0055A5',
                background: '#E0F2FE',
                padding: '4px 12px',
                borderRadius: 20
              }}>
                {selectedIds.size} seleccionado(s)
              </span>
            )}

            <button
              onClick={handleOpenAsignarMasivo}
              style={{
                height: 38,
                padding: '0 20px',
                borderRadius: 10,
                background: selectedIds.size > 0 ? '#0055A5' : '#FFFFFF',
                border: selectedIds.size > 0 ? 'none' : '1.5px solid #0055A5',
                color: selectedIds.size > 0 ? '#FFFFFF' : '#0055A5',
                fontWeight: 700,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: selectedIds.size > 0 ? '0 4px 12px rgba(0, 85, 165, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>group_add</span>
              Asignación Masiva
            </button>
          </div>
        </div>

        {/* Premium Table Card */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                  <th style={{ width: 48, padding: '14px 16px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtrados.length && filtrados.length > 0}
                      onChange={toggleSelectAll}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#0055A5' }}
                    />
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    Trámite / Expediente
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    Establecimiento
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    Tipo / Fecha
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    Ubicación
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    Estado / Etapa
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    Agente Asignado
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748B' }}>
                      <span className="material-icons" style={{ fontSize: 44, color: '#CBD5E1', marginBottom: 8, display: 'block' }}>inbox</span>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1E293B' }}>No hay trámites que coincidan con los filtros</div>
                    </td>
                  </tr>
                ) : filtrados.map(t => {
                  const conf = ESTADO_CONFIG[t.estado]
                  const labelTipoTramite = TIPO_TRAMITE_LABELS[t.tipoTramite || ''] || 'Habilitación'
                  const etapa = getEtapaLabel(t.estado)
                  const isSelected = selectedIds.has(t.id)

                  const getInitials = (name: string) => {
                    const parts = name.trim().split(' ')
                    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                    return name.slice(0, 2).toUpperCase()
                  }

                  return (
                    <tr
                      key={t.id}
                      style={{
                        background: isSelected ? '#F0F7FF' : 'white',
                        borderBottom: '1px solid #F1F5F9',
                        borderLeft: isSelected ? '4px solid #0055A5' : '4px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.background = '#F8FAFC'
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.background = 'white'
                      }}
                    >
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(t.id)}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#0055A5' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{
                          fontFamily: 'SFMono-Regular, Consolas, monospace',
                          fontSize: 12.5,
                          fontWeight: 750,
                          color: '#0F172A',
                          background: '#F1F5F9',
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'inline-block'
                        }}>
                          {t.nroTramite}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-icons" style={{ fontSize: 13, color: '#94A3B8' }}>description</span>
                          {t.nroExpediente || 'EXP-HAB-10042'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 750, fontSize: 14, color: '#0F172A', marginBottom: 3 }}>
                          {t.denominacion}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          {t.tipologia} <span style={{ color: '#CBD5E1' }}>•</span> CUIT: <span style={{ fontFamily: 'monospace' }}>{t.cuit}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 750,
                          padding: '3px 9px',
                          borderRadius: 6,
                          background: t.tipoTramite === 'ADECUACION' ? '#FFEDD5' : t.tipoTramite === 'RENOVACION' ? '#DCFCE7' : t.tipoTramite === 'MODIFICACION' ? '#F3E8FF' : '#E0F2FE',
                          color: t.tipoTramite === 'ADECUACION' ? '#C2410C' : t.tipoTramite === 'RENOVACION' ? '#15803D' : t.tipoTramite === 'MODIFICACION' ? '#7E22CE' : '#0369A1',
                          display: 'inline-block',
                          marginBottom: 4
                        }}>
                          {labelTipoTramite}
                        </span>
                        <div style={{ fontSize: 11.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-icons" style={{ fontSize: 13, color: '#94A3B8' }}>calendar_today</span>
                          {t.fechaIngreso}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 650, fontSize: 13, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-icons" style={{ fontSize: 14, color: '#0055A5' }}>place</span>
                          {t.localidad}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, paddingLeft: 18 }}>
                          {t.departamento || 'Capital'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ marginBottom: 4 }}>
                          <span className={`badge ${conf?.badge || 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 9999, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            <span className="material-icons" style={{ fontSize: 14 }}>{conf?.icon || 'help'}</span>
                            <span>{conf?.label || t.estado}</span>
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0055A5', display: 'inline-block' }} />
                          Etapa: <strong style={{ color: '#0F172A', fontWeight: 700 }}>{etapa}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {t.agenteAsignado ? (
                          <span style={{ fontWeight: 650, fontSize: 13, color: '#0F172A' }}>
                            {t.agenteAsignado}
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: '#FEF3C7',
                            color: '#D97706',
                            padding: '4px 10px',
                            borderRadius: 9999,
                            fontSize: 11.5,
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}>
                            <span className="material-icons" style={{ fontSize: 14 }}>warning_amber</span>
                            Sin Asignar
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <TableActionsMenu
                          options={[
                            {
                              label: 'ASIGNAR',
                              icon: 'assignment_ind',
                              onClick: () => handleOpenAsignar(t)
                            },
                            {
                              label: 'HISTORIAL TRAMITE',
                              icon: 'history',
                              onClick: () => setShowHistorialEstados(t)
                            },
                            {
                              label: 'HISTORIAL ASIGNACION',
                              icon: 'schedule',
                              onClick: () => setShowHistorialAsignacion(t)
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
    </div>

      {/* Modal Asignar */}
      {selectedTramite && (
        <div className="modal-overlay" onClick={() => setSelectedTramite(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, borderRadius: 20, padding: 0, overflow: 'hidden' }}>
            <div className="modal-header" style={{ background: '#0055A5', padding: '18px 24px' }}>
              <div className="modal-title" style={{ color: 'white', fontSize: 17, fontWeight: 800 }}>
                {isMasivo
                  ? `Asignar ${selectedIds.size} Trámite(s)`
                  : `Asignar Trámite N° ${selectedTramite.nroTramite}`
                }
              </div>
              <button className="btn-icon" onClick={() => setSelectedTramite(null)} style={{ color: 'white', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 6, display: 'block' }}>Agente Asignado <span style={{ color: '#EF4444' }}>*</span></label>
                <select
                  value={selectedAgente}
                  onChange={e => setSelectedAgente(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', height: 40, borderRadius: 10, border: '1.5px solid #CBD5E1', background: 'white', padding: '8px 12px', fontSize: 13 }}
                >
                  <option value="">Seleccionar agente...</option>
                  {agentesDisponibles.map(ag => (
                    <option key={ag.id} value={`${ag.nombre} ${ag.apellido}`}>
                      {ag.nombre} {ag.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 6, display: 'block' }}>Rol <span style={{ color: '#EF4444' }}>*</span></label>
                <select
                  value={selectedRol}
                  onChange={e => setSelectedRol(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', height: 40, borderRadius: 10, border: '1.5px solid #CBD5E1', background: 'white', padding: '8px 12px', fontSize: 13 }}
                >
                  <option value="">Seleccionar rol...</option>
                  <option value="ARQUITECTO">Arquitecto</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="INSPECTOR">Inspector</option>
                  <option value="PROTOCOLIZADOR">Protocolizador</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 6, display: 'block' }}>Motivo <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  rows={4}
                  className="form-input"
                  placeholder="Ingrese el motivo de la asignación..."
                  style={{ width: '100%', borderRadius: 10, border: '1.5px solid #CBD5E1', background: 'white', padding: '10px 12px', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setSelectedTramite(null)} style={{ height: 38, padding: '0 18px', borderRadius: 10, background: 'white', border: '1.5px solid #CBD5E1', color: '#475569', fontWeight: 600 }}>
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAsignacion}
                disabled={!selectedAgente}
                className="btn btn-primary"
                style={{ height: 38, padding: '0 22px', borderRadius: 10, background: '#0055A5', border: 'none', color: 'white', fontWeight: 700, opacity: selectedAgente ? 1 : 0.5 }}
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial de Estados */}
      {showHistorialEstados && (
        <div className="modal-overlay" onClick={() => setShowHistorialEstados(null)}>
          <div className="modal animate-fadein" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, borderRadius: 20, padding: 0, overflow: 'hidden', width: '100%' }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FFFFFF'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>Historial de estados</h3>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3, fontWeight: 500 }}>
                  {showHistorialEstados.denominacion} · Trámite N° {showHistorialEstados.nroTramite}
                </div>
              </div>
              <button
                onClick={() => setShowHistorialEstados(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <span className="material-icons" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            {/* Modal Body with Timeline */}
            <div style={{ padding: '28px 24px', background: '#FFFFFF', maxHeight: '65vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                
                {/* Timeline Item 2 */}
                <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#E67E22',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      flexShrink: 0
                    }}>
                      2
                    </div>
                    <div style={{ width: 2, height: 54, background: '#E2E8F0', margin: '4px 0' }} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                      {ESTADO_CONFIG[showHistorialEstados.estado]?.label || 'Pendiente De Evaluación Arquitectura'}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                      15/05/2026 18:56 | EFECTOR - Maria Azul Talavera (27-41600547-3)
                    </div>
                    <div style={{ fontSize: 13, color: '#1E293B', marginTop: 6, fontWeight: 500 }}>
                      <strong style={{ fontWeight: 700 }}>Observaciones:</strong> Trámite enviado a agente
                    </div>
                  </div>
                </div>

                {/* Timeline Item 1 */}
                <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#0055A5',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span className="material-icons" style={{ fontSize: 18, fontWeight: 'bold' }}>check</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                      Borrador Arquitectura
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                      15/05/2026 18:55 | EFECTOR - Maria Azul Talavera (27-41600547-3)
                    </div>
                    <div style={{ fontSize: 13, color: '#1E293B', marginTop: 6, fontWeight: 500 }}>
                      <strong style={{ fontWeight: 700 }}>Observaciones:</strong> CAMBIO A BORRADOR ARQUITECTURA
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowHistorialEstados(null)}
                style={{
                  height: 38,
                  padding: '0 24px',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial de Asignación */}
      {showHistorialAsignacion && (
        <div className="modal-overlay" onClick={() => setShowHistorialAsignacion(null)}>
          <div className="modal animate-fadein" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, borderRadius: 20, padding: 0, overflow: 'hidden', width: '100%' }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FFFFFF'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>Historial de asignación</h3>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3, fontWeight: 500 }}>
                  {showHistorialAsignacion.denominacion} · Trámite N° {showHistorialAsignacion.nroTramite}
                </div>
              </div>
              <button
                onClick={() => setShowHistorialAsignacion(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <span className="material-icons" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            {/* Modal Body with Timeline */}
            <div style={{ padding: '28px 24px', background: '#FFFFFF', maxHeight: '65vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {showHistorialAsignacion.agenteAsignado ? (
                  <>
                    {/* Item 2 */}
                    <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#E67E22',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 13,
                          flexShrink: 0
                        }}>
                          2
                        </div>
                        <div style={{ width: 2, height: 54, background: '#E2E8F0', margin: '4px 0' }} />
                      </div>
                      <div style={{ flex: 1, paddingBottom: 24 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                          Asignación a: {showHistorialAsignacion.agenteAsignado}
                        </div>
                        <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                          16/05/2026 10:15 | COORDINADOR - Juan Carlos (20-12345678-9)
                        </div>
                        <div style={{ fontSize: 13, color: '#1E293B', marginTop: 6, fontWeight: 500 }}>
                          <strong style={{ fontWeight: 700 }}>Observaciones:</strong> Trámite asignado para evaluación técnica.
                        </div>
                      </div>
                    </div>

                    {/* Item 1 */}
                    <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#0055A5',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <span className="material-icons" style={{ fontSize: 18, fontWeight: 'bold' }}>check</span>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                          Ingreso a Mesa de Entrada (Sin Asignar)
                        </div>
                        <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                          15/05/2026 18:56 | SISTEMA - Registro Automático
                        </div>
                        <div style={{ fontSize: 13, color: '#1E293B', marginTop: 6, fontWeight: 500 }}>
                          <strong style={{ fontWeight: 700 }}>Observaciones:</strong> Solicitud recibida y en espera de asignación de responsable.
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748B' }}>
                    <span className="material-icons" style={{ fontSize: 36, color: '#94A3B8', marginBottom: 8, display: 'block' }}>history</span>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1E293B' }}>Sin asignaciones registradas</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>El trámite aún no posee historial de asignaciones previas.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowHistorialAsignacion(null)}
                style={{
                  height: 38,
                  padding: '0 24px',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

