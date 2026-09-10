import React, { useState } from 'react'
import {
  type OrdenDenuncia,
  type EstadoOrdenDenuncia,
  type PrioridadDenuncia,
  type OrigenDenuncia,
  ESTADO_ORDEN_DENUNCIA_CONFIG,
} from '../data/mockData'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const PRIORIDAD_CONFIG: Record<
  PrioridadDenuncia,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  CRITICA: {
    label: 'CRÍTICA',
    color: '#991B1B',
    bg: '#FEE2E2',
    border: '#FECACA',
    icon: 'crisis_alert',
  },
  URGENTE: {
    label: 'URGENTE',
    color: '#92400E',
    bg: '#FEF3C7',
    border: '#FDE68A',
    icon: 'priority_high',
  },
  NORMAL: {
    label: 'NORMAL',
    color: '#1E3A5F',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'report',
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

export default function BandejaDenunciasAgente() {
  const { ordenesDenuncia, actualizarEstadoOrdenDenuncia } = useApp()
  const navigate = useNavigate()

  // Modales
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenDenuncia | null>(null)
  const [cambiarEstadoOrden, setCambiarEstadoOrden] = useState<OrdenDenuncia | null>(null)
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState<EstadoOrdenDenuncia>('EN_INSPECCION')
  const [motivoCambioEstado, setMotivoCambioEstado] = useState('')

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoOrdenDenuncia | 'TODOS'>('TODOS')
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadDenuncia | 'TODAS'>('TODAS')
  const [filtroOrigen, setFiltroOrigen] = useState<OrigenDenuncia | 'TODOS'>('TODOS')

  // Notificación toast
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4000)
  }

  // Conteos para KPI cards
  const countTotal = ordenesDenuncia.length
  const countAsignadaCoordinador = ordenesDenuncia.filter(o => o.estado === 'ASIGNADA_A_COORDINADOR').length
  const countEnInspeccion = ordenesDenuncia.filter(o => o.estado === 'EN_INSPECCION').length
  const countAceptada = ordenesDenuncia.filter(o => o.estado === 'ACEPTADA').length
  const countRechazada = ordenesDenuncia.filter(o => o.estado === 'RECHAZADA').length

  // Filtrado
  const ordenesFiltradas = ordenesDenuncia.filter(ord => {
    const term = busqueda.toLowerCase()
    const matchBusqueda =
      busqueda === '' ||
      ord.nroOrden.toLowerCase().includes(term) ||
      ord.nroExpedienteDenuncia.toLowerCase().includes(term) ||
      ord.nroExpediente.toLowerCase().includes(term) ||
      ord.establecimiento.denominacion.toLowerCase().includes(term) ||
      ord.establecimiento.localidad.toLowerCase().includes(term) ||
      ord.descripcionMotivo.toLowerCase().includes(term)

    const matchEstado = filtroEstado === 'TODOS' || ord.estado === filtroEstado
    const matchPrioridad = filtroPrioridad === 'TODAS' || ord.prioridad === filtroPrioridad
    const matchOrigen = filtroOrigen === 'TODOS' || ord.origen === filtroOrigen

    return matchBusqueda && matchEstado && matchPrioridad && matchOrigen
  })

  const countFiltrosActivos = [
    filtroEstado !== 'TODOS',
    filtroPrioridad !== 'TODAS',
    filtroOrigen !== 'TODOS',
    busqueda !== '',
  ].filter(Boolean).length

  const handleLimpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('TODOS')
    setFiltroPrioridad('TODAS')
    setFiltroOrigen('TODOS')
  }

  const handleConfirmarCambioEstado = () => {
    if (!cambiarEstadoOrden) return
    actualizarEstadoOrdenDenuncia(cambiarEstadoOrden.id, nuevoEstadoSeleccionado, {
      motivoRechazo: nuevoEstadoSeleccionado === 'RECHAZADA' ? motivoCambioEstado : undefined,
      observaciones: nuevoEstadoSeleccionado !== 'RECHAZADA' && motivoCambioEstado ? motivoCambioEstado : undefined,
    })
    showToast(`Estado de la orden ${cambiarEstadoOrden.nroOrden} actualizado a "${ESTADO_ORDEN_DENUNCIA_CONFIG[nuevoEstadoSeleccionado].label}".`)
    setCambiarEstadoOrden(null)
    setMotivoCambioEstado('')
  }

  return (
    <div className="page-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            right: 24,
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13.5,
            fontWeight: 600,
            borderLeft: '4px solid #10B981',
            animation: 'slideInRight 0.25s ease-out',
          }}
        >
          <span className="material-icons" style={{ color: '#10B981', fontSize: 20 }}>check_circle</span>
          {toastMsg}
        </div>
      )}

      {/* HEADER DE LA BANDEJA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: 'white',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: 6,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span className="material-icons" style={{ fontSize: 13 }}>shield</span>
              Agente Denuncias
            </span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>• Bandeja Exclusiva de Gestión</span>
          </div>

          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 850, color: '#0F172A', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-icons" style={{ fontSize: 30, color: '#DC2626' }}>report</span>
            Bandeja de Denuncias y Órdenes Sanitarias
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748B' }}>
            Recepción, calificación, admisión técnica y emisión de órdenes de inspección por denuncia
          </p>
        </div>

        {/* BOTÓN PRINCIPAL NUEVA ORDEN DE DENUNCIA */}
        <button
          id="btn-nueva-orden-denuncia"
          onClick={() => navigate('/agente-denuncias/nueva-denuncia')}
          style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            padding: '12px 22px',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.35)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span className="material-icons" style={{ fontSize: 20 }}>add_circle</span>
          Nueva orden de denuncia
        </button>
      </div>

      {/* KPI METRIC CARDS / ESTADOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        
        {/* Total */}
        <div
          onClick={() => setFiltroEstado('TODOS')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '14px 16px',
            border: `1.5px solid ${filtroEstado === 'TODOS' ? '#0F172A' : '#E2E8F0'}`,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: filtroEstado === 'TODOS' ? '0 0 0 3px rgba(15,23,42,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Órdenes
            </div>
            <div style={{ fontSize: 24, fontWeight: 850, color: '#0F172A', marginTop: 2 }}>
              {countTotal}
            </div>
          </div>
          <span className="material-icons" style={{ fontSize: 28, color: '#94A3B8' }}>folder</span>
        </div>

        {/* Asignada a Coordinador */}
        <div
          onClick={() => setFiltroEstado(filtroEstado === 'ASIGNADA_A_COORDINADOR' ? 'TODOS' : 'ASIGNADA_A_COORDINADOR')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '14px 16px',
            border: `1.5px solid ${filtroEstado === 'ASIGNADA_A_COORDINADOR' ? '#0284C7' : '#E2E8F0'}`,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: filtroEstado === 'ASIGNADA_A_COORDINADOR' ? '0 0 0 3px #BAE6FD' : '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 750, color: '#0284C7', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Asignada Coordinador
            </div>
            <div style={{ fontSize: 24, fontWeight: 850, color: '#0284C7', marginTop: 2 }}>
              {countAsignadaCoordinador}
            </div>
          </div>
          <span className="material-icons" style={{ fontSize: 28, color: '#38BDF8' }}>people</span>
        </div>

        {/* En Inspección */}
        <div
          onClick={() => setFiltroEstado(filtroEstado === 'EN_INSPECCION' ? 'TODOS' : 'EN_INSPECCION')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '14px 16px',
            border: `1.5px solid ${filtroEstado === 'EN_INSPECCION' ? '#D97706' : '#E2E8F0'}`,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: filtroEstado === 'EN_INSPECCION' ? '0 0 0 3px #FDE68A' : '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 750, color: '#D97706', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              En Inspección
            </div>
            <div style={{ fontSize: 24, fontWeight: 850, color: '#D97706', marginTop: 2 }}>
              {countEnInspeccion}
            </div>
          </div>
          <span className="material-icons" style={{ fontSize: 28, color: '#FBBF24' }}>search</span>
        </div>

        {/* Aceptada */}
        <div
          onClick={() => setFiltroEstado(filtroEstado === 'ACEPTADA' ? 'TODOS' : 'ACEPTADA')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '14px 16px',
            border: `1.5px solid ${filtroEstado === 'ACEPTADA' ? '#16A34A' : '#E2E8F0'}`,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: filtroEstado === 'ACEPTADA' ? '0 0 0 3px #BBF7D0' : '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 750, color: '#16A34A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Aceptadas
            </div>
            <div style={{ fontSize: 24, fontWeight: 850, color: '#16A34A', marginTop: 2 }}>
              {countAceptada}
            </div>
          </div>
          <span className="material-icons" style={{ fontSize: 28, color: '#4ADE80' }}>check_circle</span>
        </div>

        {/* Rechazada */}
        <div
          onClick={() => setFiltroEstado(filtroEstado === 'RECHAZADA' ? 'TODOS' : 'RECHAZADA')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '14px 16px',
            border: `1.5px solid ${filtroEstado === 'RECHAZADA' ? '#DC2626' : '#E2E8F0'}`,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: filtroEstado === 'RECHAZADA' ? '0 0 0 3px #FECACA' : '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 750, color: '#DC2626', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Rechazadas
            </div>
            <div style={{ fontSize: 24, fontWeight: 850, color: '#DC2626', marginTop: 2 }}>
              {countRechazada}
            </div>
          </div>
          <span className="material-icons" style={{ fontSize: 28, color: '#F87171' }}>cancel</span>
        </div>

      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 14,
          padding: '12px 16px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {/* Buscador de texto */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <span
            className="material-icons"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#94A3B8' }}
          >
            search
          </span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por N° Orden, N° Expediente, establecimiento, localidad..."
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

        {/* Filtro Estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoOrdenDenuncia | 'TODOS')}
          style={{
            padding: '8px 12px',
            border: '1.5px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 13,
            color: '#334155',
            background: '#F8FAFC',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <option value="TODOS">Todos los Estados</option>
          <option value="ASIGNADA_A_COORDINADOR">Asignada a Coordinador</option>
          <option value="EN_INSPECCION">En Inspección</option>
          <option value="ACEPTADA">Aceptada</option>
          <option value="RECHAZADA">Rechazada</option>
        </select>

        {/* Filtro Prioridad */}
        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value as PrioridadDenuncia | 'TODAS')}
          style={{
            padding: '8px 12px',
            border: '1.5px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 13,
            color: '#334155',
            background: '#F8FAFC',
            cursor: 'pointer',
          }}
        >
          <option value="TODAS">Todas las Prioridades</option>
          <option value="CRITICA">Crítica</option>
          <option value="URGENTE">Urgente</option>
          <option value="NORMAL">Normal</option>
        </select>

        {/* Filtro Origen */}
        <select
          value={filtroOrigen}
          onChange={(e) => setFiltroOrigen(e.target.value as OrigenDenuncia | 'TODOS')}
          style={{
            padding: '8px 12px',
            border: '1.5px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 13,
            color: '#334155',
            background: '#F8FAFC',
            cursor: 'pointer',
          }}
        >
          <option value="TODOS">Todos los Orígenes</option>
          <option value="CIUDADANA">Denuncia Ciudadana</option>
          <option value="JUDICIAL">Requerimiento Judicial</option>
          <option value="AUTORIDAD">Autoridad Sanitaria</option>
        </select>

        {/* Botón Limpiar */}
        {countFiltrosActivos > 0 && (
          <button
            onClick={handleLimpiarFiltros}
            style={{
              padding: '8px 12px',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              fontSize: 12,
              color: '#EF4444',
              background: '#FEF2F2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 700,
            }}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>filter_list_off</span>
            Limpiar ({countFiltrosActivos})
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 12.5, color: '#64748B', whiteSpace: 'nowrap', fontWeight: 600 }}>
          {ordenesFiltradas.length} de {ordenesDenuncia.length} órdenes
        </div>
      </div>

      {/* TABLA PRINCIPAL DE ÓRDENES */}
      <div
        className="card"
        style={{
          padding: 0,
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          background: '#FFFFFF',
        }}
      >
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase' }}>
                  N° Orden / Exp.
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase' }}>
                  Establecimiento Denunciado
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase' }}>
                  Origen & Prioridad
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase' }}>
                  Motivo / Hecho
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase' }}>
                  Estado de Orden
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase' }}>
                  Asignado
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11.5, fontWeight: 750, color: '#475569', textTransform: 'uppercase' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <span className="material-icons" style={{ fontSize: 48, color: '#CBD5E1' }}>folder_off</span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#334155' }}>
                        No se encontraron órdenes de denuncia
                      </div>
                      <div style={{ fontSize: 13, color: '#64748B', maxWidth: 360 }}>
                        No hay registros que coincidan con los filtros aplicados o aún no se han emitido órdenes.
                      </div>
                      <button
                        onClick={() => setModalNuevoOpen(true)}
                        style={{
                          marginTop: 8,
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>add</span>
                        Crear Nueva Orden
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                ordenesFiltradas.map((ord) => {
                  const cfgEstado = ESTADO_ORDEN_DENUNCIA_CONFIG[ord.estado]
                  const cfgPrio = PRIORIDAD_CONFIG[ord.prioridad]
                  const cfgOrigen = ORIGEN_CONFIG[ord.origen]

                  return (
                    <tr
                      key={ord.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* N° Orden / Exp */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                          {ord.nroOrden}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: '#E11D48', marginTop: 2 }}>
                          {ord.nroExpedienteDenuncia}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 2 }}>
                          {ord.fechaCreacion}
                        </div>
                      </td>

                      {/* Establecimiento */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: 220 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 750, fontSize: 13.5, color: '#0F172A' }}>
                            {ord.establecimiento.denominacion}
                          </span>
                          {!ord.establecimiento.esRegistrado && (
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 800,
                                color: '#991B1B',
                                background: '#FEE2E2',
                                padding: '1px 5px',
                                borderRadius: 4,
                              }}
                            >
                              CLANDESTINO
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                          {ord.establecimiento.tipologia}
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                          📍 {ord.establecimiento.domicilio} ({ord.establecimiento.localidad})
                        </div>
                      </td>

                      {/* Origen & Prioridad */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 750,
                              color: cfgPrio.color,
                              background: cfgPrio.bg,
                              border: `1px solid ${cfgPrio.border}`,
                              padding: '2px 7px',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: 12 }}>{cfgPrio.icon}</span>
                            {cfgPrio.label}
                          </span>

                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 600,
                              color: cfgOrigen.color,
                              background: cfgOrigen.bg,
                              padding: '2px 7px',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: 11 }}>{cfgOrigen.icon}</span>
                            {cfgOrigen.label}
                          </span>
                        </div>
                      </td>

                      {/* Motivo / Hecho */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: 220 }}>
                        <div style={{ fontSize: 12, color: '#334155', fontWeight: 500, lineHeight: 1.35 }}>
                          "{ord.descripcionMotivo.length > 90 ? `${ord.descripcionMotivo.substring(0, 90)}...` : ord.descripcionMotivo}"
                        </div>
                        {ord.adjuntos && ord.adjuntos.length > 0 && (
                          <div style={{ fontSize: 11, color: '#2563EB', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <span className="material-icons" style={{ fontSize: 13 }}>attach_file</span>
                            {ord.adjuntos.length} {ord.adjuntos.length === 1 ? 'evidencia' : 'evidencias'}
                          </div>
                        )}
                      </td>

                      {/* Estado de Orden */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 750,
                            color: cfgEstado.color,
                            background: cfgEstado.bg,
                            border: `1px solid ${cfgEstado.border}`,
                            padding: '4px 10px',
                            borderRadius: 8,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 14 }}>{cfgEstado.icon}</span>
                          {cfgEstado.label}
                        </span>
                        {ord.motivoRechazo && (
                          <div style={{ fontSize: 10.5, color: '#991B1B', fontStyle: 'italic', marginTop: 4, maxWidth: 160 }}>
                            Motivo: {ord.motivoRechazo.substring(0, 45)}...
                          </div>
                        )}
                      </td>

                      {/* Asignado */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        {ord.inspectorAsignado ? (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>
                              {ord.inspectorAsignado}
                            </div>
                            <div style={{ fontSize: 10.5, color: '#64748B' }}>
                              Inspector ({ord.modalidad})
                            </div>
                          </div>
                        ) : ord.coordinadorAsignado ? (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>
                              {ord.coordinadorAsignado}
                            </div>
                            <div style={{ fontSize: 10.5, color: '#64748B' }}>
                              Coordinación Central
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11.5, color: '#94A3B8', fontStyle: 'italic' }}>
                            Sin Asignar
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => setOrdenSeleccionada(ord)}
                            title="Ver Detalle de la Orden"
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              borderRadius: 8,
                              padding: '6px 10px',
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: 15 }}>visibility</span>
                            Detalle
                          </button>

                          <button
                            onClick={() => {
                              setCambiarEstadoOrden(ord)
                              setNuevoEstadoSeleccionado(ord.estado)
                              setMotivoCambioEstado(ord.motivoRechazo || ord.observaciones || '')
                            }}
                            title="Gestionar / Cambiar Estado"
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: 8,
                              padding: '6px 8px',
                              fontSize: 12,
                              color: '#64748B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: 16 }}>tune</span>
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
      </div>

      {/* MODAL CREAR NUEVA ORDEN DE DENUNCIA - Reemplazado por navegación a /nueva-denuncia */}
      {/* DRAWER / MODAL DE DETALLE DE LA ORDEN */}
      {ordenSeleccionada && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOrdenSeleccionada(null)
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              width: '100%',
              maxWidth: 640,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Header Detalle */}
            <div style={{ padding: '20px 24px', background: '#0F172A', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Expediente de Orden de Denuncia</div>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800 }}>{ordenSeleccionada.nroOrden} · {ordenSeleccionada.nroExpedienteDenuncia}</h3>
              </div>
              <button
                onClick={() => setOrdenSeleccionada(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Body Detalle */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Estado Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: ESTADO_ORDEN_DENUNCIA_CONFIG[ordenSeleccionada.estado].color,
                    background: ESTADO_ORDEN_DENUNCIA_CONFIG[ordenSeleccionada.estado].bg,
                    border: `1px solid ${ESTADO_ORDEN_DENUNCIA_CONFIG[ordenSeleccionada.estado].border}`,
                    padding: '6px 14px',
                    borderRadius: 8,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>{ESTADO_ORDEN_DENUNCIA_CONFIG[ordenSeleccionada.estado].icon}</span>
                  {ESTADO_ORDEN_DENUNCIA_CONFIG[ordenSeleccionada.estado].label}
                </span>
                <span style={{ fontSize: 12, color: '#64748B' }}>Fecha: {ordenSeleccionada.fechaCreacion}</span>
              </div>

              {/* Establecimiento */}
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Establecimiento</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{ordenSeleccionada.establecimiento.denominacion}</div>
                <div style={{ fontSize: 12.5, color: '#475569', marginTop: 2 }}>CUIT: {ordenSeleccionada.establecimiento.cuit} · {ordenSeleccionada.establecimiento.tipologia}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>📍 {ordenSeleccionada.establecimiento.domicilio}, {ordenSeleccionada.establecimiento.localidad} ({ordenSeleccionada.establecimiento.departamento})</div>
              </div>

              {/* Hecho / Fundamentación */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 750, color: '#1E293B', marginBottom: 4 }}>Descripción de los Hechos Denunciados</div>
                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                  {ordenSeleccionada.descripcionMotivo}
                </div>
              </div>

              {/* Motivo de rechazo si aplica */}
              {ordenSeleccionada.motivoRechazo && (
                <div style={{ background: '#FEF2F2', padding: 12, borderRadius: 10, border: '1px solid #FECACA', color: '#991B1B' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>Fundamentación del Rechazo</div>
                  <div style={{ fontSize: 13 }}>{ordenSeleccionada.motivoRechazo}</div>
                </div>
              )}

              {/* Asignación */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#F1F5F9', padding: 12, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Inspector Asignado</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>
                    {ordenSeleccionada.inspectorAsignado || 'Sin designar'}
                  </div>
                </div>
                <div style={{ background: '#F1F5F9', padding: 12, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Coordinador</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>
                    {ordenSeleccionada.coordinadorAsignado || 'Juan Gomez'}
                  </div>
                </div>
              </div>

              {/* Evidencias */}
              {ordenSeleccionada.adjuntos && ordenSeleccionada.adjuntos.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 750, color: '#1E293B', marginBottom: 6 }}>Evidencias y Documentos Adjuntos</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ordenSeleccionada.adjuntos.map(adj => (
                      <div key={adj.id} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '6px 10px', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="material-icons" style={{ fontSize: 16, color: '#0284C7' }}>attach_file</span>
                        <span style={{ fontWeight: 600 }}>{adj.nombre}</span>
                        <span style={{ color: '#94A3B8' }}>({adj.tamaño})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creado por */}
              <div style={{ fontSize: 11.5, color: '#94A3B8', borderTop: '1px solid #E2E8F0', paddingTop: 12 }}>
                Emitido por: <strong>{ordenSeleccionada.creadoPor}</strong>
              </div>
            </div>

            {/* Footer Detalle */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => {
                  alert(`Descargando Orden de Inspección ${ordenSeleccionada.nroOrden} (PDF Oficial)...`)
                }}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span className="material-icons" style={{ fontSize: 16 }}>download</span>
                Descargar Orden
              </button>
              <button
                onClick={() => setOrdenSeleccionada(null)}
                style={{
                  background: '#0F172A',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR ESTADO DE LA ORDEN */}
      {cambiarEstadoOrden && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCambiarEstadoOrden(null)
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              width: '100%',
              maxWidth: 520,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 22px', background: '#0F172A', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Actualizar Estado de la Orden</h3>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{cambiarEstadoOrden.nroOrden} · {cambiarEstadoOrden.establecimiento.denominacion}</div>
              </div>
              <button
                onClick={() => setCambiarEstadoOrden(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: 'white', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1E293B', marginBottom: 8, textTransform: 'uppercase' }}>
                  Seleccione el Nuevo Estado
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {(['ASIGNADA_A_COORDINADOR', 'EN_INSPECCION', 'ACEPTADA', 'RECHAZADA'] as EstadoOrdenDenuncia[]).map(st => {
                    const cfg = ESTADO_ORDEN_DENUNCIA_CONFIG[st]
                    const isSelected = nuevoEstadoSeleccionado === st
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNuevoEstadoSeleccionado(st)}
                        style={{
                          border: `2px solid ${isSelected ? cfg.color : '#E2E8F0'}`,
                          background: isSelected ? cfg.bg : '#FFFFFF',
                          borderRadius: 10,
                          padding: '10px 12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 750,
                          color: isSelected ? cfg.color : '#334155',
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 16, color: cfg.color }}>{cfg.icon}</span>
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  {nuevoEstadoSeleccionado === 'RECHAZADA' ? 'Motivo de Rechazo (Obligatorio)' : 'Observaciones / Notas de Transición'}
                </label>
                <textarea
                  rows={3}
                  value={motivoCambioEstado}
                  onChange={(e) => setMotivoCambioEstado(e.target.value)}
                  placeholder={nuevoEstadoSeleccionado === 'RECHAZADA' ? 'Ingrese la fundamentación legal del rechazo...' : 'Notas adicionales sobre la gestión...'}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setCambiarEstadoOrden(null)}
                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarCambioEstado}
                style={{ background: '#0F172A', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 750, cursor: 'pointer' }}
              >
                Guardar Cambio
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
