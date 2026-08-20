import React, { useState, useEffect } from 'react'
import {
  ALERTAS_DENUNCIA,
  USUARIOS,
  type AlertaDenunciaItem,
  type PrioridadDenuncia,
  type OrigenDenuncia,
} from '../data/mockData'

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth <= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const PRIORIDAD_CONFIG: Record<
  PrioridadDenuncia,
  { label: string; color: string; bg: string; border: string; icon: string; rowBg: string }
> = {
  CRITICA: {
    label: 'CRÍTICA',
    color: '#991B1B',
    bg: '#FEE2E2',
    border: '#FECACA',
    icon: 'crisis_alert',
    rowBg: '#FFF5F5',
  },
  URGENTE: {
    label: 'URGENTE',
    color: '#92400E',
    bg: '#FEF3C7',
    border: '#FDE68A',
    icon: 'priority_high',
    rowBg: '#FFFBEB',
  },
  NORMAL: {
    label: 'NORMAL',
    color: '#1E3A5F',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'report',
    rowBg: '#F8FAFF',
  },
}

const ORIGEN_CONFIG: Record<
  OrigenDenuncia,
  { label: string; color: string; bg: string; icon: string }
> = {
  JUDICIAL: {
    label: 'Requerimiento Judicial',
    color: '#6B21A8',
    bg: '#F3E8FF',
    icon: 'gavel',
  },
  AUTORIDAD: {
    label: 'Autoridad Sanitaria',
    color: '#0E4F87',
    bg: '#DBEAFE',
    icon: 'account_balance',
  },
  CIUDADANA: {
    label: 'Denuncia Ciudadana',
    color: '#065F46',
    bg: '#D1FAE5',
    icon: 'people',
  },
}

function PrioridadBadge({ prioridad }: { prioridad: PrioridadDenuncia }) {
  const cfg = PRIORIDAD_CONFIG[prioridad]
  return (
    <span
      style={{
        fontWeight: 700,
        fontSize: 11,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        padding: '3px 9px',
        borderRadius: 6,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        letterSpacing: 0.3,
      }}
    >
      <span className="material-icons" style={{ fontSize: 13 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

function OrigenBadge({ origen }: { origen: OrigenDenuncia }) {
  const cfg = ORIGEN_CONFIG[origen]
  return (
    <span
      style={{
        fontWeight: 600,
        fontSize: 11,
        color: cfg.color,
        background: cfg.bg,
        padding: '3px 9px',
        borderRadius: 6,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span className="material-icons" style={{ fontSize: 12 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export default function BandejaAlertasDenuncia({ hideTopbar = false }: { hideTopbar?: boolean } = {}) {
  const isTablet = useIsTablet()
  const [alertas, setAlertas] = useState<AlertaDenunciaItem[]>(ALERTAS_DENUNCIA)

  // Filters
  const [busqueda, setBusqueda] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('TODAS')
  const [filtroOrigen, setFiltroOrigen] = useState<string>('TODOS')
  const [filtroSinAsignar, setFiltroSinAsignar] = useState(false)

  // Modal
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaDenunciaItem | null>(null)
  const [inspectorSeleccionado, setInspectorSeleccionado] = useState('')
  const [modalidad, setModalidad] = useState<'PRESENCIAL' | 'VIRTUAL'>('PRESENCIAL')
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [modalMode, setModalMode] = useState<'EMITIR' | 'RECHAZAR'>('EMITIR')

  const agentesDisponibles = USUARIOS.filter(u => u.rol === 'INSPECTOR' || u.rol === 'AUDITOR')

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtradas = alertas.filter(a => {
    const matchBusqueda =
      busqueda === '' ||
      a.denominacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.nroExpedienteDenuncia.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.localidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.tipologia.toLowerCase().includes(busqueda.toLowerCase())

    const matchPrioridad = filtroPrioridad === 'TODAS' || a.prioridad === filtroPrioridad
    const matchOrigen = filtroOrigen === 'TODOS' || a.origen === filtroOrigen
    const matchSinAsignar = !filtroSinAsignar || a.sinAsignar

    return matchBusqueda && matchPrioridad && matchOrigen && matchSinAsignar
  })

  // ── Priority sort: CRITICA -> URGENTE -> NORMAL, then by diasSinAtencion desc
  const prioOrder: Record<PrioridadDenuncia, number> = { CRITICA: 1, URGENTE: 2, NORMAL: 3 }
  const ordenadas = [...filtradas].sort((a, b) => {
    const pA = prioOrder[a.prioridad]
    const pB = prioOrder[b.prioridad]
    if (pA !== pB) return pA - pB
    return b.diasSinAtencion - a.diasSinAtencion
  })

  // ── Metrics ──────────────────────────────────────────────────────────────
  const countCritica = alertas.filter(a => a.prioridad === 'CRITICA').length
  const countUrgente = alertas.filter(a => a.prioridad === 'URGENTE').length
  const countNormal = alertas.filter(a => a.prioridad === 'NORMAL').length
  const countSinAsignar = alertas.filter(a => a.sinAsignar).length

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenModal = (alerta: AlertaDenunciaItem, mode: 'EMITIR' | 'RECHAZAR') => {
    setSelectedAlerta(alerta)
    setInspectorSeleccionado(alerta.inspectorSugerido || '')
    setModalidad('PRESENCIAL')
    setMotivoRechazo('')
    setModalMode(mode)
  }

  const handleEmitirOrden = () => {
    if (!selectedAlerta) return
    const inspector = inspectorSeleccionado || selectedAlerta.inspectorSugerido || 'Sin asignar'
    alert(
      `Orden de Inspeccion por Denuncia emitida.\n` +
      `Establecimiento: ${selectedAlerta.denominacion}\n` +
      `Inspector: ${inspector} - Modalidad: ${modalidad}`
    )
    setAlertas(prev => prev.filter(a => a.id !== selectedAlerta.id))
    setSelectedAlerta(null)
  }

  const handleRechazar = () => {
    if (!selectedAlerta) return
    alert(
      `Denuncia rechazada por inadmisibilidad.\n` +
      `N: ${selectedAlerta.nroExpedienteDenuncia} - ${selectedAlerta.denominacion}\n` +
      `Motivo: ${motivoRechazo}`
    )
    setAlertas(prev => prev.filter(a => a.id !== selectedAlerta.id))
    setSelectedAlerta(null)
  }

  const handleLimpiarFiltros = () => {
    setBusqueda('')
    setFiltroPrioridad('TODAS')
    setFiltroOrigen('TODOS')
    setFiltroSinAsignar(false)
  }

  const countFiltrosActivos = [
    filtroPrioridad !== 'TODAS',
    filtroOrigen !== 'TODOS',
    filtroSinAsignar,
  ].filter(Boolean).length

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {!hideTopbar && (
        <div className="topbar">
          <div>
            <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons" style={{ fontSize: 24, color: '#E74C3C' }}>notifications_active</span>
              Alertas de Denuncia
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              Denuncias ciudadanas, judiciales y requerimientos de autoridad pendientes de admision
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {/* Critica */}
          <div
            onClick={() => setFiltroPrioridad(filtroPrioridad === 'CRITICA' ? 'TODAS' : 'CRITICA')}
            style={{
              background: '#FFF',
              border: `1.5px solid ${filtroPrioridad === 'CRITICA' ? '#EF4444' : '#E2E8F0'}`,
              borderRadius: 10,
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: filtroPrioridad === 'CRITICA' ? '0 0 0 3px #FECACA' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Prioridad Critica
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#DC2626', marginTop: 2 }}>
                {countCritica}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 30, color: '#FCA5A5' }}>crisis_alert</span>
          </div>

          {/* Urgente */}
          <div
            onClick={() => setFiltroPrioridad(filtroPrioridad === 'URGENTE' ? 'TODAS' : 'URGENTE')}
            style={{
              background: '#FFF',
              border: `1.5px solid ${filtroPrioridad === 'URGENTE' ? '#F59E0B' : '#E2E8F0'}`,
              borderRadius: 10,
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: filtroPrioridad === 'URGENTE' ? '0 0 0 3px #FDE68A' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Prioridad Urgente
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#D97706', marginTop: 2 }}>
                {countUrgente}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 30, color: '#FDE68A' }}>warning_amber</span>
          </div>

          {/* Normal */}
          <div
            onClick={() => setFiltroPrioridad(filtroPrioridad === 'NORMAL' ? 'TODAS' : 'NORMAL')}
            style={{
              background: '#FFF',
              border: `1.5px solid ${filtroPrioridad === 'NORMAL' ? '#3B82F6' : '#E2E8F0'}`,
              borderRadius: 10,
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: filtroPrioridad === 'NORMAL' ? '0 0 0 3px #BFDBFE' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Prioridad Normal
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#2563EB', marginTop: 2 }}>
                {countNormal}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 30, color: '#BFDBFE' }}>report</span>
          </div>

          {/* Sin Asignar */}
          <div
            onClick={() => setFiltroSinAsignar(prev => !prev)}
            style={{
              background: '#FFF',
              border: `1.5px solid ${filtroSinAsignar ? '#7C3AED' : '#E2E8F0'}`,
              borderRadius: 10,
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: filtroSinAsignar ? '0 0 0 3px #DDD6FE' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Sin Inspector
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#7C3AED', marginTop: 2 }}>
                {countSinAsignar}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 30, color: '#C4B5FD' }}>person_off</span>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            background: '#FFF',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <span
              className="material-icons"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#94A3B8' }}
            >
              search
            </span>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por establecimiento, expediente, localidad..."
              style={{
                width: '100%',
                padding: '8px 10px 8px 34px',
                border: '1.5px solid #E2E8F0',
                borderRadius: 8,
                fontSize: 13,
                color: '#1E293B',
                outline: 'none',
                background: '#F8FAFC',
              }}
            />
          </div>

          {/* Filtro Prioridad */}
          <select
            value={filtroPrioridad}
            onChange={e => setFiltroPrioridad(e.target.value)}
            style={{
              padding: '8px 10px',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              fontSize: 13,
              color: '#334155',
              background: '#F8FAFC',
              cursor: 'pointer',
            }}
          >
            <option value="TODAS">Todas las prioridades</option>
            <option value="CRITICA">Critica</option>
            <option value="URGENTE">Urgente</option>
            <option value="NORMAL">Normal</option>
          </select>

          {/* Filtro Origen */}
          <select
            value={filtroOrigen}
            onChange={e => setFiltroOrigen(e.target.value)}
            style={{
              padding: '8px 10px',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              fontSize: 13,
              color: '#334155',
              background: '#F8FAFC',
              cursor: 'pointer',
            }}
          >
            <option value="TODOS">Todos los origenes</option>
            <option value="JUDICIAL">Judicial</option>
            <option value="AUTORIDAD">Autoridad</option>
            <option value="CIUDADANA">Ciudadana</option>
          </select>

          {/* Limpiar */}
          {countFiltrosActivos > 0 && (
            <button
              onClick={handleLimpiarFiltros}
              style={{
                padding: '8px 12px',
                border: '1.5px solid #E2E8F0',
                borderRadius: 8,
                fontSize: 12,
                color: '#E74C3C',
                background: '#FFF5F5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
              }}
            >
              <span className="material-icons" style={{ fontSize: 15 }}>filter_list_off</span>
              Limpiar ({countFiltrosActivos})
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>
            {ordenadas.length} de {alertas.length} denuncias
          </div>
        </div>

        {/* Data List / Table or Responsive Cards */}
        {isTablet ? (
          /* Responsive Cards for Tablet/Mobile */
          ordenadas.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                <span className="material-icons" style={{ fontSize: 48, color: '#E74C3C', opacity: 0.25 }}>report_off</span>
                <div style={{ fontWeight: 600, marginTop: 8 }}>No hay alertas de denuncia que coincidan con los filtros.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {ordenadas.map(a => {
                const cfg = PRIORIDAD_CONFIG[a.prioridad]
                return (
                  <div
                    key={a.id}
                    className="card"
                    style={{
                      padding: 'var(--space-4)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      borderLeft: `4px solid ${cfg.color}`,
                      background: cfg.rowBg,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <PrioridadBadge prioridad={a.prioridad} />
                        <OrigenBadge origen={a.origen} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 22,
                            color: a.diasSinAtencion >= 5 ? '#DC2626' : a.diasSinAtencion >= 2 ? '#D97706' : '#16A34A',
                            display: 'block',
                            lineHeight: 1,
                          }}
                        >
                          {a.diasSinAtencion}
                        </span>
                        <span style={{ fontSize: 10, color: '#94A3B8', display: 'block', marginTop: 2 }}>
                          {a.diasSinAtencion === 1 ? 'día sin atención' : 'días sin atención'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-gray-900)', fontSize: 15 }}>{a.denominacion}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginTop: 2 }}>{a.tipologia}</div>
                      <div style={{ fontSize: 11.5, color: '#64748B', fontStyle: 'italic', marginTop: 6 }}>
                        "{a.descripcionMotivo}"
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>Expediente</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#E74C3C', marginTop: 2 }}>
                          {a.nroExpedienteDenuncia}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>Inspector Sugerido</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginTop: 2 }}>
                          {a.sinAsignar ? 'Sin Asignar' : a.inspectorSugerido}
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenModal(a, 'RECHAZAR')}
                        style={{
                          background: '#FFF',
                          color: '#64748B',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: 7,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 15 }}>block</span>
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleOpenModal(a, 'EMITIR')}
                        style={{
                          background: '#E74C3C',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: 7,
                          padding: '6px 14px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 15 }}>assignment_turned_in</span>
                        Emitir Orden
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          /* Desktop Table View */
          <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 4, padding: 0 }}></th>
                <th>Establecimiento</th>
                <th>Expediente Denuncia</th>
                <th>Prioridad</th>
                <th>Origen</th>
                <th>Inspector Sugerido</th>
                <th>Dias sin Atencion</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenadas.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                    <span className="material-icons" style={{ fontSize: 48, color: '#E74C3C', opacity: 0.25 }}>report_off</span>
                    <div style={{ fontWeight: 600, marginTop: 8 }}>No hay alertas de denuncia que coincidan con los filtros.</div>
                  </td>
                </tr>
              ) : (
                ordenadas.map(a => {
                  const cfg = PRIORIDAD_CONFIG[a.prioridad]
                  return (
                    <tr key={a.id} style={{ background: cfg.rowBg }}>
                      {/* Indicador de prioridad lateral */}
                      <td style={{ padding: 0, width: 4 }}>
                        <div style={{ width: 4, background: cfg.color, minHeight: 52 }} />
                      </td>

                      {/* Establecimiento */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-gray-900)', fontSize: 13 }}>{a.denominacion}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginTop: 2 }}>{a.tipologia}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <span className="material-icons" style={{ fontSize: 11 }}>place</span>
                          {a.localidad}, {a.departamento}
                        </div>
                      </td>

                      {/* Expediente */}
                      <td>
                        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#E74C3C' }}>
                          {a.nroExpedienteDenuncia}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>
                          Ingreso: {new Date(a.fechaIngresoDenuncia).toLocaleDateString('es-AR')}
                        </div>
                      </td>

                      {/* Prioridad */}
                      <td>
                        <PrioridadBadge prioridad={a.prioridad} />
                      </td>

                      {/* Origen */}
                      <td>
                        <OrigenBadge origen={a.origen} />
                        <div
                          title={a.descripcionMotivo}
                          style={{
                            fontSize: 11,
                            color: '#64748B',
                            marginTop: 4,
                            maxWidth: 220,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'help',
                          }}
                        >
                          {a.descripcionMotivo}
                        </div>
                      </td>

                      {/* Inspector Sugerido */}
                      <td>
                        {a.sinAsignar ? (
                          <span style={{
                            fontSize: 12,
                            color: '#7C3AED',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <span className="material-icons" style={{ fontSize: 15 }}>person_off</span>
                            Sin Asignar
                          </span>
                        ) : (
                          <span style={{ fontSize: 13, color: '#334155' }}>{a.inspectorSugerido}</span>
                        )}
                      </td>

                      {/* Dias sin atencion */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 22,
                            color: a.diasSinAtencion >= 5 ? '#DC2626' : a.diasSinAtencion >= 2 ? '#D97706' : '#16A34A',
                            display: 'block',
                            lineHeight: 1,
                          }}
                        >
                          {a.diasSinAtencion}
                        </span>
                        <span style={{ fontSize: 10, color: '#94A3B8', display: 'block', marginTop: 2 }}>
                          {a.diasSinAtencion === 1 ? 'dia' : 'dias'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleOpenModal(a, 'EMITIR')}
                            title="Emitir Orden de Inspeccion"
                            style={{
                              background: '#E74C3C',
                              color: '#FFF',
                              border: 'none',
                              borderRadius: 7,
                              padding: '6px 10px',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              transition: 'opacity 0.15s ease',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: 15 }}>assignment_turned_in</span>
                            Emitir Orden
                          </button>
                          <button
                            onClick={() => handleOpenModal(a, 'RECHAZAR')}
                            title="Rechazar denuncia por inadmisibilidad"
                            style={{
                              background: '#FFF',
                              color: '#64748B',
                              border: '1.5px solid #E2E8F0',
                              borderRadius: 7,
                              padding: '6px 8px',
                              fontSize: 12,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              transition: 'border-color 0.15s ease',
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: 15 }}>block</span>
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>

      {/* Modal: Emitir Orden / Rechazar */}
      {selectedAlerta && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedAlerta(null) }}
        >
          <div
            style={{
              background: '#FFF',
              borderRadius: 14,
              width: '100%',
              maxWidth: 540,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: modalMode === 'EMITIR' ? '#E74C3C' : '#475569',
                color: '#FFF',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span className="material-icons" style={{ fontSize: 22 }}>
                {modalMode === 'EMITIR' ? 'assignment_turned_in' : 'block'}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {modalMode === 'EMITIR' ? 'Emitir Orden de Inspeccion Eventual' : 'Rechazar Denuncia por Inadmisibilidad'}
                </div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 1 }}>
                  {selectedAlerta.nroExpedienteDenuncia} &mdash; {selectedAlerta.denominacion}
                </div>
              </div>
              <button
                onClick={() => setSelectedAlerta(null)}
                style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: 20, display: 'flex' }}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Alert Summary Box */}
            <div style={{ padding: '14px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <PrioridadBadge prioridad={selectedAlerta.prioridad} />
                <OrigenBadge origen={selectedAlerta.origen} />
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#475569', fontStyle: 'italic' }}>
                "{selectedAlerta.descripcionMotivo}"
              </div>
            </div>

            {/* Form */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {modalMode === 'EMITIR' ? (
                <>
                  {/* Inspector */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                      Inspector Asignado *
                    </label>
                    <select
                      value={inspectorSeleccionado}
                      onChange={e => setInspectorSeleccionado(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: 8,
                        fontSize: 13,
                        background: '#F8FAFC',
                        color: '#1E293B',
                      }}
                    >
                      <option value="">Seleccionar inspector</option>
                      {agentesDisponibles.map(u => (
                        <option key={u.id} value={`${u.nombre} ${u.apellido}`}>
                          {u.nombre} {u.apellido} ({u.rol})
                          {selectedAlerta.inspectorSugerido === `${u.nombre} ${u.apellido}` ? ' - Sugerido' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Modalidad */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                      Modalidad de Inspeccion
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['PRESENCIAL', 'VIRTUAL'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setModalidad(m)}
                          style={{
                            flex: 1,
                            padding: '9px 12px',
                            border: `1.5px solid ${modalidad === m ? '#E74C3C' : '#E2E8F0'}`,
                            borderRadius: 8,
                            background: modalidad === m ? '#FFF5F5' : '#F8FAFC',
                            color: modalidad === m ? '#C0392B' : '#64748B',
                            fontWeight: modalidad === m ? 700 : 400,
                            fontSize: 13,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 16 }}>
                            {m === 'PRESENCIAL' ? 'directions_walk' : 'videocam'}
                          </span>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Rechazar Mode */
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Motivo de Rechazo por Inadmisibilidad *
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={e => setMotivoRechazo(e.target.value)}
                    placeholder="Descripcion del motivo de rechazo (denuncia infundada, duplicada, fuera de jurisdiccion, etc.)..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 8,
                      fontSize: 13,
                      background: '#F8FAFC',
                      color: '#1E293B',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  onClick={() => setSelectedAlerta(null)}
                  style={{
                    padding: '9px 18px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 8,
                    background: '#FFF',
                    color: '#64748B',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
                {modalMode === 'EMITIR' ? (
                  <button
                    onClick={handleEmitirOrden}
                    disabled={!inspectorSeleccionado}
                    style={{
                      padding: '9px 18px',
                      border: 'none',
                      borderRadius: 8,
                      background: inspectorSeleccionado ? '#E74C3C' : '#CBD5E1',
                      color: '#FFF',
                      fontSize: 13,
                      cursor: inspectorSeleccionado ? 'pointer' : 'not-allowed',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 16 }}>assignment_turned_in</span>
                    Emitir Orden
                  </button>
                ) : (
                  <button
                    onClick={handleRechazar}
                    disabled={!motivoRechazo.trim()}
                    style={{
                      padding: '9px 18px',
                      border: 'none',
                      borderRadius: 8,
                      background: motivoRechazo.trim() ? '#475569' : '#CBD5E1',
                      color: '#FFF',
                      fontSize: 13,
                      cursor: motivoRechazo.trim() ? 'pointer' : 'not-allowed',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 16 }}>block</span>
                    Confirmar Rechazo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
