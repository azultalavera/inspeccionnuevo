import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { Tramite, ESTABLECIMIENTOS } from '../data/mockData'
import ModalResponderEmplazamiento from '../components/ModalResponderEmplazamiento'
import ModalIniciarTramite from '../components/ModalIniciarTramite'

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

  // Metric counts
  const countHabilitacion = alertas.filter(a => a.tipoOrigen === 'HABILITACION').length
  const countRutina = alertas.filter(a => a.tipoOrigen === 'RUTINA').length
  const countUrgentes = alertas.filter(a => a.estadoVentana === 'URGENTE').length

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
            Bandeja de Alertas
          </div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
            Control de plazos legales para respuesta a observaciones de habilitación e inicio de trámites de modificación por rutina
          </div>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Metric Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14
        }}>
          {/* KPI 1: TODAS */}
          <div
            onClick={() => { setFiltroTipoOrigen('TODOS'); setFiltroEstadoVentana('TODAS'); }}
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${filtroTipoOrigen === 'TODOS' && filtroEstadoVentana === 'TODAS' ? '#0284c7' : '#E2E8F0'}`,
              borderRadius: 12,
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
                Emplazamientos Totales
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#075985', marginTop: 2 }}>
                {alertas.length}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 28, color: '#0284c7' }}>notifications</span>
          </div>

          {/* KPI 2: HABILITACIÓN */}
          <div
            onClick={() => setFiltroTipoOrigen(filtroTipoOrigen === 'HABILITACION' ? 'TODOS' : 'HABILITACION')}
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${filtroTipoOrigen === 'HABILITACION' ? '#ea580c' : '#E2E8F0'}`,
              borderRadius: 12,
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
                Habilitación / Respuesta Emplazamiento
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#ea580c', marginTop: 2 }}>
                {countHabilitacion}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 28, color: '#fdba74' }}>rate_review</span>
          </div>

          {/* KPI 3: RUTINA (MODIFICACIÓN) */}
          <div
            onClick={() => setFiltroTipoOrigen(filtroTipoOrigen === 'RUTINA' ? 'TODOS' : 'RUTINA')}
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${filtroTipoOrigen === 'RUTINA' ? '#dc2626' : '#E2E8F0'}`,
              borderRadius: 12,
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
                Rutina / Trámite Modificación
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#dc2626', marginTop: 2 }}>
                {countRutina}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 28, color: '#fca5a5' }}>edit_note</span>
          </div>

          {/* KPI 4: URGENTES */}
          <div
            onClick={() => setFiltroEstadoVentana(filtroEstadoVentana === 'URGENTE' ? 'TODAS' : 'URGENTE')}
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${filtroEstadoVentana === 'URGENTE' ? '#be123c' : '#E2E8F0'}`,
              borderRadius: 12,
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
                Urgentes (&lt; 5 días)
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#be123c', marginTop: 2 }}>
                {countUrgentes}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 28, color: '#fda4af' }}>timer_off</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          padding: '14px 18px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <span className="material-icons" style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8', fontSize: 18 }}>search</span>
            <input
              type="text"
              placeholder="Buscar por establecimiento, CUIT, expediente o N° de acta..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Origen:</span>
            <select
              value={filtroTipoOrigen}
              onChange={e => setFiltroTipoOrigen(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, background: 'white' }}
            >
              <option value="TODOS">Todos los Orígenes</option>
              <option value="HABILITACION">Trámite de Habilitación</option>
              <option value="RUTINA">Inspección de Rutina (Modificación)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Plazo:</span>
            <select
              value={filtroEstadoVentana}
              onChange={e => setFiltroEstadoVentana(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, background: 'white' }}
            >
              <option value="TODAS">Todos los Plazos</option>
              <option value="URGENTE">Urgentes (&lt; 5 días)</option>
              <option value="PROXIMO">Próximos (&lt; 10 días)</option>
            </select>
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
                    <span className="material-icons" style={{ fontSize: 40, color: '#CBD5E1', marginBottom: 8, display: 'block' }}>notifications_off</span>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Sin alertas de emplazamiento pendientes</div>
                    <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 2 }}>Tus establecimientos se encuentran al día.</div>
                  </td>
                </tr>
              ) : (
                filtradas.map(alerta => (
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
