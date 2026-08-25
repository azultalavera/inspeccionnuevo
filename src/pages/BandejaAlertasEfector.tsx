import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { Tramite, ESTABLECIMIENTOS } from '../data/mockData'
import ModalResponderEmplazamiento from '../components/ModalResponderEmplazamiento'
import ModalIniciarTramite from '../components/ModalIniciarTramite'
import MiPagination from '../components/MiPagination'

export interface AlertaEfectorItem {
  id: string
  actaNumero: string
  nroExpediente: string
  denominacion: string
  cuit: string
  tipologia: string
  localidad: string
  departamento: string
  tipoOrigen: 'HABILITACION' | 'RUTINA'
  frecuenciaAnual: number
  diasRestantes: number
  fechaVencimiento: string
  estadoVentana: 'URGENTE' | 'PROXIMO' | 'EN_PLAZO'
  motivos: string[]
  accionRequerida?: 'RESPONDER_EMPLAZAMIENTO' | 'INICIAR_RENOVACION' | 'INICIAR_MODIFICACION'
}

export const ALERTAS_EFECTOR_MOCK: AlertaEfectorItem[] = [
  {
    id: 'ALR-EF-001',
    actaNumero: '102/2026',
    nroExpediente: 'EX-2026-0045672-APN-MS#CBA',
    denominacion: 'Sanatorio Allende N.V.',
    cuit: '30-71234567-8',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    localidad: 'Córdoba',
    departamento: 'Capital',
    tipoOrigen: 'HABILITACION',
    frecuenciaAnual: 1,
    diasRestantes: 8,
    fechaVencimiento: '12/08/2026',
    estadoVentana: 'PROXIMO',
    motivos: [
      'Ajustes en planos de Sala de Procedimientos',
      'Falta de firma en protocolo de emergencias'
    ]
  },
  {
    id: 'ALR-EF-002',
    actaNumero: '108/2026',
    nroExpediente: 'EX-2026-0158900-APN-MS#CBA',
    denominacion: 'Sanatorio Sierra Bella S.A.',
    cuit: '30-71882233-9',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    localidad: 'Córdoba',
    departamento: 'Capital',
    tipoOrigen: 'RUTINA',
    frecuenciaAnual: 1,
    diasRestantes: 5,
    fechaVencimiento: '09/08/2026',
    estadoVentana: 'URGENTE',
    motivos: [
      'Ampliación física de 2 consultorios no declarada',
      'Relocalización de farmacia exige Trámite de Modificación'
    ]
  },
  {
    id: 'ALR-EF-003',
    actaNumero: '112/2026',
    nroExpediente: 'EX-2026-0158901-APN-MS#CBA',
    denominacion: 'Geriátrico Nueva Esperanza',
    cuit: '30-71445566-3',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    localidad: 'Córdoba',
    departamento: 'Capital',
    tipoOrigen: 'RUTINA',
    frecuenciaAnual: 3,
    diasRestantes: 3,
    fechaVencimiento: '07/08/2026',
    estadoVentana: 'URGENTE',
    motivos: [
      'Ausencia de Director Médico en horario de inspección presencial',
      'Adecuación de enfermería 24hs'
    ]
  },
  {
    id: 'ALR-EF-004',
    actaNumero: '120/2026',
    nroExpediente: '0425-112233/2023',
    denominacion: 'Clínica de la Cañada',
    cuit: '30-66655544-1',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    localidad: 'Córdoba',
    departamento: 'Capital',
    tipoOrigen: 'HABILITACION',
    frecuenciaAnual: 1,
    diasRestantes: 9,
    fechaVencimiento: '29/08/2026',
    estadoVentana: 'PROXIMO',
    motivos: [
      'Habilitación próxima a expirar, requiere iniciar trámite de renovación.'
    ],
    accionRequerida: 'INICIAR_RENOVACION'
  }
]

export default function BandejaAlertasEfector() {
  const { user } = useAuth()
  const { tramites, crearNuevoTramite } = useApp()
  const navigate = useNavigate()

  const [alertas, setAlertas] = useState<AlertaEfectorItem[]>(ALERTAS_EFECTOR_MOCK)
  
  // Filter state
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipoOrigen, setFiltroTipoOrigen] = useState<string>('TODOS')
  const [filtroEstadoVentana, setFiltroEstadoVentana] = useState<string>('TODAS')

  // Pagination state
  const [paginaSeleccionada, setPaginaSeleccionada] = useState(1)
  const [cantidadFilasPorPagina, setCantidadFilasPorPagina] = useState(5)

  useEffect(() => {
    setPaginaSeleccionada(1)
  }, [busqueda, filtroTipoOrigen, filtroEstadoVentana])

  // Modals state
  const [selectedEmplazamientoTramite, setSelectedEmplazamientoTramite] = useState<Tramite | null>(null)
  const [modalTramiteOpen, setModalTramiteOpen] = useState(false)
  const [defaultTipo, setDefaultTipo] = useState<'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION' | ''>('')
  const [defaultEstId, setDefaultEstId] = useState('')

  const userCuit = user?.cuil || '30-71234567-8'

  // Filtering & Sorting (earliest to latest)
  const filtradas = alertas.filter(a => {
    const matchBusqueda = busqueda === '' ||
      a.denominacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.nroExpediente.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.actaNumero.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.cuit.includes(busqueda)

    const matchOrigen = filtroTipoOrigen === 'TODOS' || a.tipoOrigen === filtroTipoOrigen
    const matchVentana = filtroEstadoVentana === 'TODAS' || a.estadoVentana === filtroEstadoVentana

    return matchBusqueda && matchOrigen && matchVentana
  }).sort((a, b) => a.diasRestantes - b.diasRestantes)

  // Pagination slicing
  const cantidadPaginas = Math.max(1, Math.ceil(filtradas.length / cantidadFilasPorPagina))
  const alertasPaginadas = filtradas.slice(
    (paginaSeleccionada - 1) * cantidadFilasPorPagina,
    paginaSeleccionada * cantidadFilasPorPagina
  )

  // Metric counts
  const countHabilitacion = alertas.filter(a => a.tipoOrigen === 'HABILITACION').length
  const countRutina = alertas.filter(a => a.tipoOrigen === 'RUTINA').length
  const countUrgentes = alertas.filter(a => a.estadoVentana === 'URGENTE').length
  const countProximos = alertas.filter(a => a.estadoVentana === 'PROXIMO').length

  const hasActiveFilters = busqueda.trim() !== '' || filtroTipoOrigen !== 'TODOS' || filtroEstadoVentana !== 'TODAS'

  const handleLimpiarFiltros = () => {
    setBusqueda('')
    setFiltroTipoOrigen('TODOS')
    setFiltroEstadoVentana('TODAS')
    setPaginaSeleccionada(1)
  }

  const handleOpenResponderEmplazamiento = (alerta: AlertaEfectorItem) => {
    const tramiteObj: Tramite = tramites.find(t => t.cuit === alerta.cuit) || {
      id: 'TRM-HAB-102',
      nroTramite: '2026-8812',
      nroExpediente: alerta.nroExpediente,
      denominacion: alerta.denominacion,
      cuit: alerta.cuit,
      tipologia: alerta.tipologia,
      domicilio: 'Av. Rafael Núñez 4750',
      localidad: alerta.localidad,
      departamento: alerta.departamento,
      estado: 'OBSERVADO_INSP',
      fechaIngreso: '2026-06-10',
      inspectorAsignado: 'Dr. Marcelo Juárez',
      tipoInspeccion: 'INICIAL',
      formatoInspeccion: 'PRESENCIAL',
      nroActa: 102,
      emplazamiento: {
        actaNumero: alerta.actaNumero,
        diasRestantes: alerta.diasRestantes,
        fechaVencimiento: alerta.fechaVencimiento,
        faltasCriticasCount: alerta.motivos.length,
        observaciones: alerta.motivos
      }
    }
    setSelectedEmplazamientoTramite(tramiteObj)
  }

  const handleOpenIniciarModificacion = () => {
    setModalTramiteOpen(true)
  }

  const handleOpenIniciarRenovacion = (alerta: AlertaEfectorItem) => {
    const est = ESTABLECIMIENTOS.find(e => e.cuit === alerta.cuit)
    setDefaultTipo('RENOVACION')
    setDefaultEstId(est ? est.id : '')
    setModalTramiteOpen(true)
  }

  const handleConfirmarModificacion = (tipo: 'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION', tipologia: string, establecimientoId?: string) => {
    const nuevo = crearNuevoTramite(tipo, tipologia, establecimientoId)
    setModalTramiteOpen(false)
    navigate(`/efector/alta-habilitacion/${nuevo.id}`)
  }

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ fontSize: 24, color: '#ea580c' }}>notifications_active</span>
            Bandeja de Alertas Sanitarias
          </div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
            Control de plazos legales para respuesta a emplazamientos e inicio de trámites por inspección
          </div>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Two Filter Groups with 2 Cards Each */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16
        }}>
          {/* GRUPO 1: ORIGEN DEL REQUERIMIENTO */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
          }}>
            {/* Header Grupo 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-icons" style={{ fontSize: 18, color: '#0284C7' }}>category</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Origen del Requerimiento
                </span>
              </div>
              {filtroTipoOrigen !== 'TODOS' && (
                <button
                  onClick={() => setFiltroTipoOrigen('TODOS')}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    color: '#0284C7',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                  title="Ver todos los orígenes"
                >
                  <span className="material-icons" style={{ fontSize: 13 }}>clear</span>
                  Ver todos
                </button>
              )}
            </div>

            {/* 2 Botones Grupo 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Botón 1.1: HABILITACIÓN */}
              <div
                onClick={() => setFiltroTipoOrigen(prev => prev === 'HABILITACION' ? 'TODOS' : 'HABILITACION')}
                style={{
                  background: filtroTipoOrigen === 'HABILITACION' ? '#FFF7ED' : '#FFFFFF',
                  border: `2px solid ${filtroTipoOrigen === 'HABILITACION' ? '#EA580C' : '#E2E8F0'}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  position: 'relative',
                  boxShadow: filtroTipoOrigen === 'HABILITACION' ? '0 4px 14px rgba(234, 88, 12, 0.16)' : '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: filtroTipoOrigen === 'HABILITACION' ? '#C2410C' : '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: 0.4
                  }}>
                    Habilitación
                  </span>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: filtroTipoOrigen === 'HABILITACION' ? '#FED7AA' : '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span className="material-icons" style={{ fontSize: 18, color: '#EA580C' }}>rate_review</span>
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#EA580C', lineHeight: 1 }}>
                  {countHabilitacion}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 550 }}>
                  Respuesta Emplazamiento
                </div>
              </div>

              {/* Botón 1.2: RUTINA */}
              <div
                onClick={() => setFiltroTipoOrigen(prev => prev === 'RUTINA' ? 'TODOS' : 'RUTINA')}
                style={{
                  background: filtroTipoOrigen === 'RUTINA' ? '#FEF2F2' : '#FFFFFF',
                  border: `2px solid ${filtroTipoOrigen === 'RUTINA' ? '#DC2626' : '#E2E8F0'}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  position: 'relative',
                  boxShadow: filtroTipoOrigen === 'RUTINA' ? '0 4px 14px rgba(220, 38, 38, 0.16)' : '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: filtroTipoOrigen === 'RUTINA' ? '#991B1B' : '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: 0.4
                  }}>
                    Rutina
                  </span>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: filtroTipoOrigen === 'RUTINA' ? '#FECACA' : '#FEF2F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span className="material-icons" style={{ fontSize: 18, color: '#DC2626' }}>edit_note</span>
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#DC2626', lineHeight: 1 }}>
                  {countRutina}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 550 }}>
                  Trámite Modificación
                </div>
              </div>
            </div>
          </div>

          {/* GRUPO 2: PLAZO DE VENCIMIENTO */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
          }}>
            {/* Header Grupo 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-icons" style={{ fontSize: 18, color: '#BE123C' }}>alarm</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Plazo de Vencimiento
                </span>
              </div>
              {filtroEstadoVentana !== 'TODAS' && (
                <button
                  onClick={() => setFiltroEstadoVentana('TODAS')}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    color: '#BE123C',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                  title="Ver todos los plazos"
                >
                  <span className="material-icons" style={{ fontSize: 13 }}>clear</span>
                  Ver todos
                </button>
              )}
            </div>

            {/* 2 Botones Grupo 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Botón 2.1: URGENTES */}
              <div
                onClick={() => setFiltroEstadoVentana(prev => prev === 'URGENTE' ? 'TODAS' : 'URGENTE')}
                style={{
                  background: filtroEstadoVentana === 'URGENTE' ? '#FFF1F2' : '#FFFFFF',
                  border: `2px solid ${filtroEstadoVentana === 'URGENTE' ? '#BE123C' : '#E2E8F0'}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  position: 'relative',
                  boxShadow: filtroEstadoVentana === 'URGENTE' ? '0 4px 14px rgba(190, 18, 60, 0.16)' : '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: filtroEstadoVentana === 'URGENTE' ? '#9F1239' : '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: 0.4
                  }}>
                    Urgentes
                  </span>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: filtroEstadoVentana === 'URGENTE' ? '#FECDD3' : '#FFF1F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span className="material-icons" style={{ fontSize: 18, color: '#BE123C' }}>timer_off</span>
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#BE123C', lineHeight: 1 }}>
                  {countUrgentes}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 550 }}>
                  Menos de 5 días
                </div>
              </div>

              {/* Botón 2.2: PRÓXIMOS */}
              <div
                onClick={() => setFiltroEstadoVentana(prev => prev === 'PROXIMO' ? 'TODAS' : 'PROXIMO')}
                style={{
                  background: filtroEstadoVentana === 'PROXIMO' ? '#FEF3C7' : '#FFFFFF',
                  border: `2px solid ${filtroEstadoVentana === 'PROXIMO' ? '#D97706' : '#E2E8F0'}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  position: 'relative',
                  boxShadow: filtroEstadoVentana === 'PROXIMO' ? '0 4px 14px rgba(217, 119, 6, 0.16)' : '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: filtroEstadoVentana === 'PROXIMO' ? '#92400E' : '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: 0.4
                  }}>
                    Próximos
                  </span>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: filtroEstadoVentana === 'PROXIMO' ? '#FDE68A' : '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span className="material-icons" style={{ fontSize: 18, color: '#D97706' }}>timer</span>
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#D97706', lineHeight: 1 }}>
                  {countProximos}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 550 }}>
                  Entre 5 y 10 días
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 14,
          padding: '12px 16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
        }}>
          {/* Input Search */}
          <div style={{ position: 'relative' }}>
            <span className="material-icons" style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8', fontSize: 18 }}>search</span>
            <input
              type="text"
              placeholder="Buscar por establecimiento, CUIT, expediente o N° de acta..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 36px 9px 38px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                outline: 'none',
                background: '#F8FAFC',
                transition: 'all 0.2s ease'
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#FFFFFF'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; }}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
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
                  padding: 2
                }}
                title="Borrar búsqueda"
              >
                <span className="material-icons" style={{ fontSize: 18 }}>cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Alerts Table */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Plazo</th>
                <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Establecimiento / CUIT</th>
                <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>N° Expediente</th>
                <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Origen</th>
                <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Acción Requerida</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#64748B' }}>
                    <span className="material-icons" style={{ fontSize: 40, color: '#CBD5E1', marginBottom: 8, display: 'block' }}>
                      {hasActiveFilters ? 'filter_list_off' : 'notifications_off'}
                    </span>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                      {hasActiveFilters ? 'No se encontraron alertas con los filtros aplicados' : 'Sin alertas de emplazamiento pendientes'}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 4, marginBottom: hasActiveFilters ? 14 : 0 }}>
                      {hasActiveFilters ? 'Probá modificando el término de búsqueda o seleccionando otro filtro.' : 'Tus establecimientos se encuentran al día.'}
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={handleLimpiarFiltros}
                        style={{
                          background: '#0284c7',
                          border: 'none',
                          color: 'white',
                          padding: '7px 16px',
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>restart_alt</span>
                        Restablecer todos los filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                alertasPaginadas.map(alerta => (
                  <tr key={alerta.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {/* Plazo */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{
                          background: alerta.estadoVentana === 'URGENTE' ? '#FEE2E2' : '#FEF3C7',
                          color: alerta.estadoVentana === 'URGENTE' ? '#991B1B' : '#9A3412',
                          fontWeight: 800,
                          fontSize: 11.5,
                          padding: '4px 10px',
                          borderRadius: 8,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          <span className="material-icons" style={{ fontSize: 15 }}>{alerta.estadoVentana === 'URGENTE' ? 'warning' : 'timer'}</span>
                          {alerta.diasRestantes} días restantes
                        </span>
                        <div style={{
                          fontSize: 11,
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          paddingLeft: 4,
                          fontWeight: 500
                        }}>
                          <span className="material-icons" style={{ fontSize: 13, color: '#94A3B8' }}>event</span>
                          vence: <span style={{ fontWeight: 700, color: '#475569' }}>{alerta.fechaVencimiento}</span>
                        </div>
                      </div>
                    </td>

                    {/* Establecimiento */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{alerta.denominacion}</div>
                      <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: 'monospace', marginTop: 2 }}>CUIT: {alerta.cuit}</div>
                    </td>

                    {/* Expediente */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#0055A5' }}>
                        {alerta.nroExpediente}
                      </div>
                    </td>

                    {/* Origen */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                      <span style={{
                        background: alerta.tipoOrigen === 'HABILITACION' ? '#E0F2FE' : '#FEE2E2',
                        color: alerta.tipoOrigen === 'HABILITACION' ? '#0369A1' : '#991B1B',
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 12,
                        textTransform: 'uppercase'
                      }}>
                        {alerta.tipoOrigen === 'HABILITACION' ? 'Habilitación' : 'Inspección por Rutina'}
                      </span>
                    </td>

                    {/* Acción Requerida */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'top', textAlign: 'center' }}>
                      {alerta.accionRequerida === 'INICIAR_RENOVACION' ? (
                        <button
                          onClick={() => handleOpenIniciarRenovacion(alerta)}
                          style={{
                            background: '#16a34a',
                            border: 'none',
                            color: 'white',
                            padding: '8px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 750,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 16 }}>sync</span>
                          Iniciar Trámite Renovación
                        </button>
                      ) : alerta.tipoOrigen === 'HABILITACION' ? (
                        <button
                          onClick={() => handleOpenResponderEmplazamiento(alerta)}
                          style={{
                            background: '#ea580c',
                            border: 'none',
                            color: 'white',
                            padding: '8px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 750,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 16 }}>rate_review</span>
                          Responder Emplazamiento
                        </button>
                      ) : (
                        <button
                          onClick={handleOpenIniciarModificacion}
                          style={{
                            background: '#dc2626',
                            border: 'none',
                            color: 'white',
                            padding: '8px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 750,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 16 }}>edit_note</span>
                          Iniciar Modificación
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {filtradas.length > 0 && (
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #E2E8F0',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <div style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                Mostrando <strong style={{ color: '#0F172A', fontWeight: 700 }}>{alertasPaginadas.length}</strong> de <strong style={{ color: '#0F172A', fontWeight: 700 }}>{filtradas.length}</strong> {filtradas.length === 1 ? 'alerta' : 'alertas'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MiPagination
                  cantidadFilasPorPagina={cantidadFilasPorPagina}
                  cantidadPaginas={cantidadPaginas}
                  paginaSeleccionada={paginaSeleccionada}
                  setCantidadFilasPorPagina={setCantidadFilasPorPagina}
                  setPaginaSeleccionada={setPaginaSeleccionada}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal Responder Emplazamiento */}
      {selectedEmplazamientoTramite && (
        <ModalResponderEmplazamiento
          tramite={selectedEmplazamientoTramite}
          onClose={() => setSelectedEmplazamientoTramite(null)}
          onOpenIniciarModificacion={() => {
            setSelectedEmplazamientoTramite(null)
            setModalTramiteOpen(true)
          }}
        />
      )}

      {/* Modal Iniciar Trámite de Modificación */}
      <ModalIniciarTramite
        isOpen={modalTramiteOpen}
        onClose={() => {
          setModalTramiteOpen(false)
          setDefaultTipo('')
          setDefaultEstId('')
        }}
        onConfirm={handleConfirmarModificacion}
        defaultTipo={defaultTipo}
        defaultEstablecimientoId={defaultEstId}
      />
    </>
  )
}
