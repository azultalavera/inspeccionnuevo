import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { ESTABLECIMIENTOS, Tramite } from '../data/mockData'
import ModalIniciarTramite from '../components/ModalIniciarTramite'
import ModalPresentarDenuncia from '../components/ModalPresentarDenuncia'
import ModalResponderEmplazamiento from '../components/ModalResponderEmplazamiento'
import { consultarMisDenuncias, consultarDenunciasPendientesAdmin } from '../services/denunciaApi'
import { consultarAntecedentesEfector } from '../services/inspeccionApi'

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth < 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

export default function HomeDashboard() {
  const { user } = useAuth()
  const { tramites, crearNuevoTramite } = useApp()
  const navigate = useNavigate()
  const isTablet = useIsTablet()

  const [modalTramiteOpen, setModalTramiteOpen] = useState(false)
  const [modalDenunciaOpen, setModalDenunciaOpen] = useState(false)
  const [selectedEmplazamientoTramite, setSelectedEmplazamientoTramite] = useState<Tramite | null>(null)

  // Real API state integration
  const [misDenunciasCount, setMisDenunciasCount] = useState(0)
  const [misAntecedentesCount, setMisAntecedentesCount] = useState(0)
  const [denunciasPendientesAdminCount, setDenunciasPendientesAdminCount] = useState(0)
  const [alertaExito, setAlertaExito] = useState<string | null>(null)

  const userCuit = user?.cuil || '30-71234567-8'

  // Fetch real counts from API on mount
  useEffect(() => {
    async function loadApiCounts() {
      try {
        if (user?.rol === 'EFECTOR') {
          const resDen = await consultarMisDenuncias(userCuit)
          if (resDen.ok) setMisDenunciasCount(resDen.total)

          const resAnt = await consultarAntecedentesEfector(userCuit)
          if (resAnt.ok) setMisAntecedentesCount(resAnt.data.total_actuaciones)
        } else if (['INSPECTOR', 'COORDINADOR', 'ADMINISTRADOR'].includes(user?.rol || '')) {
          const resAdmin = await consultarDenunciasPendientesAdmin()
          if (resAdmin.ok) setDenunciasPendientesAdminCount(resAdmin.total)
        }
      } catch (err) {
        console.log('Modo mockup activo / Servidor API no disponible:', err)
      }
    }
    loadApiCounts()
  }, [user, userCuit])

  const misTramites = user?.rol === 'EFECTOR'
    ? tramites.filter(t => t.cuit === userCuit || t.cuit === '30-71234567-8')
    : tramites

  const tramitesObservadosCount = misTramites.filter(t => ['OBSERVADO_INSP', 'DESCARGO_INSP', 'OBSERVADO_ARQ', 'OBSERVADO_AUD'].includes(t.estado)).length

  // Counts for the requested inspection metrics
  const isEstadoInspeccion = (estado: string) => [
    'ACEPTADO_DOC_AUD',
    'OBSERVADO_INSP',
    'DESCARGO_INSP',
    'ACEPTADO_INSP',
    'EN_PROTOCOLIZACION',
    'FINALIZADO'
  ].includes(estado)

  const countDenuncia = tramites.filter(t => isEstadoInspeccion(t.estado) && t.tipoInspeccion === 'DENUNCIA').length
  const countRutina = tramites.filter(t => isEstadoInspeccion(t.estado) && t.tipoInspeccion === 'RUTINA').length
  const countHabilitacion = tramites.filter(t => isEstadoInspeccion(t.estado) && t.tipoInspeccion === 'HABILITACION').length
  const countRespuestasEmplazamiento = tramites.filter(t => t.estado === 'DESCARGO_INSP').length

  // Time alert count for expired / overdue emplazamientos
  const actualEmplazamientosVencidosCount = tramites.filter(t => {
    if (t.alertaRutina === 'CRITICO_VENCIDO') return true
    if (t.emplazamiento && t.emplazamiento.diasRestantes <= 0) return true
    if (t.estado === 'OBSERVADO_INSP') return true
    return false
  }).length

  const countEmplazamientosVencidos = actualEmplazamientosVencidosCount > 0 ? actualEmplazamientosVencidosCount : 2

  const handleIniciarTramite = (tipo: 'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION', tipologia: string, establecimientoId?: string) => {
    const nuevo = crearNuevoTramite(tipo, tipologia, establecimientoId)
    setModalTramiteOpen(false)
    navigate(`/efector/alta-habilitacion/${nuevo.id}`)
  }

  const handleOpenResponderEmplazamiento = () => {
    const tramiteParaEmplazamiento: Tramite = misTramites.find(t => t.estado === 'OBSERVADO_INSP' || t.estado === 'DESCARGO_INSP') || {
      id: 'TRM002',
      nroTramite: '2026-8812',
      nroExpediente: 'EX-2026-0045672-APN-MS#CBA',
      denominacion: 'Sanatorio Allende N.V.',
      cuit: userCuit,
      tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
      domicilio: 'Av. Rafael Núñez 4750',
      localidad: 'Córdoba',
      departamento: 'Capital',
      estado: 'OBSERVADO_INSP',
      fechaIngreso: '2026-06-10',
      tipoInspeccion: 'INICIAL',
      formatoInspeccion: 'PRESENCIAL',
      inspectorAsignado: 'Dr. Marcelo Juárez',
      nroActa: 102,
      emplazamiento: {
        actaNumero: '102/2026',
        diasRestantes: 8,
        fechaVencimiento: '12/08/2026',
        faltasCriticasCount: 2,
        observaciones: ['Falta de firma en protocolo de emergencias', 'Ajuste en plano de sala de procedimientos']
      }
    }
    setSelectedEmplazamientoTramite(tramiteParaEmplazamiento)
  }

  const handleOpenIniciarModificacionEmplazamiento = () => {
    setModalTramiteOpen(true)
  }

  return (
    <>
      <div className="page-content" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        paddingBottom: isTablet ? 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px) + 20px)' : 'var(--space-6)',
        boxSizing: 'border-box'
      }}>

        {/* ALERTA DE ÉXITO TEMPORAL */}
        {alertaExito && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #6ee7b7',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13.5px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-icons" style={{ color: '#10b981' }}>check_circle</span>
              {alertaExito}
            </div>
            <button onClick={() => setAlertaExito(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}>
              <span className="material-icons">close</span>
            </button>
          </div>
        )}

        {/* LAYOUT COMPACTO CON BORDES DE URGENCIA Y DISEÑO ENRIQUECIDO PARA EFECTOR */}
        {user?.rol === 'EFECTOR' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header y Resumen de Estado en 1 Sola Fila */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0055A5', marginBottom: '2px' }}>
                  Plataforma Sanitaria ClicSalud+
                </div>
                <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 850, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
                  Bienvenido, {user?.nombre || 'Efector'} {user?.apellido || ''}
                  <span style={{ fontSize: 11, fontWeight: 750, background: '#F1F5F9', color: '#475569', padding: '3px 9px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    CUIT: {userCuit}
                  </span>
                </h1>
              </div>

              {/* Botones de Acción Inmediata */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setModalTramiteOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontSize: '12.5px',
                    fontWeight: 750,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '16px' }}>add</span>
                  Iniciar Trámite
                </button>

                <button
                  onClick={() => setModalDenunciaOpen(true)}
                  style={{
                    background: '#FFFFFF',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontSize: '12.5px',
                    fontWeight: 750,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '16px', color: '#DC2626' }}>report_problem</span>
                  Presentar Denuncia
                </button>
              </div>
            </div>

            {/* Layout en 2 Columnas Lado a Lado (Sin Scroll) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isTablet ? '1fr' : '1.15fr 1fr',
              gap: '14px',
              alignItems: 'stretch'
            }}>
              {/* Columna Izquierda: Alertas de Emplazamientos Sanitarios (Bordes de Urgencia Codificados) */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ fontSize: '20px', color: '#DC2626' }}>warning</span>
                    <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 850, color: '#0f172a' }}>
                      Alertas de Emplazamientos Sanitarios
                    </h3>
                  </div>
                  <span style={{
                    background: '#FEF2F2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '12px'
                  }}>
                    2 Emplazamientos Pendientes
                  </span>
                </div>

                {/* ALERTA 1: RUTA DE MODIFICACIÓN - URGENCIA MÁXIMA (ROJO) */}
                <div style={{
                  background: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)',
                  border: '1px solid #FCA5A5',
                  borderLeft: '6px solid #DC2626',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Urgencia Máxima
                      </span>
                      <span style={{ fontSize: '13.5px', fontWeight: 850, color: '#7F1D1D' }}>
                        Acta N° 108/2026 — Sierra Bella
                      </span>
                    </div>
                    <span style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', fontSize: '11.5px', fontWeight: 800, padding: '3px 9px', borderRadius: '10px' }}>
                      5 Días Hábiles (Vence: 09/08)
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: '#450A0A', lineHeight: 1.4, fontWeight: 500 }}>
                    La fiscalización in situ registró modificaciones edilicias no declaradas. Debes vincular el Acta N° 108/2026 e iniciar formalmente un <strong>Trámite de Modificación</strong>.
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
                    <button
                      onClick={handleOpenIniciarModificacionEmplazamiento}
                      style={{
                        background: '#DC2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 750,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)'
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '15px' }}>edit_note</span>
                      Iniciar Trámite Modificación
                    </button>
                  </div>
                </div>

                {/* ALERTA 2: TRÁMITE DE HABILITACIÓN - ADVERTENCIA (AMARILLO / ÁMBAR) */}
                <div style={{
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)',
                  border: '1px solid #FDE68A',
                  borderLeft: '6px solid #D97706',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: '#D97706', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Plazo Vigente
                      </span>
                      <span style={{ fontSize: '13.5px', fontWeight: 850, color: '#78350F' }}>
                        Acta N° 102/2026 — Sanatorio Allende
                      </span>
                    </div>
                    <span style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', fontSize: '11.5px', fontWeight: 800, padding: '3px 9px', borderRadius: '10px' }}>
                      8 Días Hábiles (Vence: 12/08)
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: '#451A03', lineHeight: 1.4, fontWeight: 500 }}>
                    Observaciones en verificación presencial de habilitación. Debes presentar la documentación rectificativa o respuesta emplazamiento firmada antes del vencimiento legal.
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
                    <button
                      onClick={handleOpenResponderEmplazamiento}
                      style={{
                        background: '#D97706',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 750,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(217, 119, 6, 0.2)'
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '15px' }}>rate_review</span>
                      Responder Emplazamiento
                    </button>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Funcionalidades del Sistema (Grid 2x2 Enriquecido) */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ fontSize: '20px', color: '#0055A5' }}>apps</span>
                    <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 850, color: '#0f172a' }}>
                      Funcionalidades
                    </h3>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                    Accesos rápidos
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                  {/* Card 1: Bandeja de Trámites */}
                  <div
                    onClick={() => navigate('/efector/bandeja')}
                    style={{
                      background: 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)',
                      border: '1px solid #BAE6FD',
                      borderTop: '4px solid #0284C7',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-icons" style={{ fontSize: '18px', color: '#0284C7' }}>assignment</span>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#0369A1' }}>{misTramites.length}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>Trámites en Curso</div>
                    <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>
                      {tramitesObservadosCount > 0 ? `${tramitesObservadosCount} con observaciones` : 'Estado de expedientes'}
                    </div>
                  </div>

                  {/* Card 2: Mis Denuncias */}
                  <div
                    onClick={() => navigate('/efector/mis-denuncias')}
                    style={{
                      background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)',
                      border: '1px solid #FECDD3',
                      borderTop: '4px solid #E11D48',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 6px rgba(225, 29, 72, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-icons" style={{ fontSize: '18px', color: '#E11D48' }}>folder_special</span>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#BE123C' }}>{misDenunciasCount}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>Mis Denuncias</div>
                    <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>Historial DEN-2026</div>
                  </div>

                  {/* Card 3: Antecedentes */}
                  <div
                    onClick={() => navigate('/efector/antecedentes')}
                    style={{
                      background: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)',
                      border: '1px solid #FDE68A',
                      borderTop: '4px solid #D97706',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-icons" style={{ fontSize: '18px', color: '#D97706' }}>gavel</span>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#B45309' }}>{misAntecedentesCount}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>Actas e Historial</div>
                    <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>Histórico de fiscalización</div>
                  </div>

                  {/* Card 4: Mis Establecimientos */}
                  <div
                    onClick={() => navigate('/efector/establecimientos')}
                    style={{
                      background: 'linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 100%)',
                      border: '1px solid #DDD6FE',
                      borderTop: '4px solid #7C3AED',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 6px rgba(124, 58, 237, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-icons" style={{ fontSize: '18px', color: '#7C3AED' }}>domain</span>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#6D28D9' }}>
                        {ESTABLECIMIENTOS.length}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>Mis Establecimientos</div>
                    <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>Padrón y domicilios</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* SECCIÓN DE RESUMEN DE CANTIDADES DE INSPECCIÓN Y EMPLAZAMIENTOS (PARA INSPECTOR / ROLES DE FISCALIZACIÓN) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--color-gray-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: '20px' }}>assessment</span>
                Resumen de Inspecciones y Emplazamientos
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>
                Cantidades en sistema
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px'
            }}>
              {/* KPI 1: DENUNCIA */}
              <div
                onClick={() => {
                  const target = user?.rol === 'COORDINADOR' ? '/coordinador/inspeccion/denuncia' : '/inspector/inspeccion-tipo/denuncia'
                  navigate(target)
                }}
                className="card animate-fadein"
                style={{
                  background: '#ffffff',
                  border: '1px solid #fee2e2',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.05)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(239, 68, 68, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.05)'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 750, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Inspecciones por Denuncia
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#991b1b', marginTop: '2px' }}>
                    {countDenuncia}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '1px' }}>
                    Operativos denuncias
                  </div>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                  <span className="material-icons" style={{ fontSize: '22px' }}>report</span>
                </div>
              </div>

              {/* KPI 2: RUTINA */}
              <div
                onClick={() => {
                  const target = user?.rol === 'COORDINADOR' ? '/coordinador/inspeccion/rutina' : '/inspector/inspeccion-tipo/rutina'
                  navigate(target)
                }}
                className="card animate-fadein"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e0f2fe',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.05)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(2, 132, 199, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(2, 132, 199, 0.05)'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 750, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Inspecciones por Rutina
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#075985', marginTop: '2px' }}>
                    {countRutina}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0c4a6e', marginTop: '1px' }}>
                    Monitoreo e Alertas
                  </div>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <span className="material-icons" style={{ fontSize: '22px' }}>schedule</span>
                </div>
              </div>

              {/* KPI 3: HABILITACIÓN */}
              <div
                onClick={() => {
                  const target = user?.rol === 'COORDINADOR' ? '/coordinador/inspeccion/habilitacion' : '/inspector/inspeccion-tipo/habilitacion'
                  navigate(target)
                }}
                className="card animate-fadein"
                style={{
                  background: '#ffffff',
                  border: '1px solid #dcfce7',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.05)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(22, 163, 74, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(22, 163, 74, 0.05)'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 750, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Inspecciones por Habilitación
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#14532d', marginTop: '2px' }}>
                    {countHabilitacion}
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534', marginTop: '1px' }}>
                    Solicitudes iniciales
                  </div>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                  <span className="material-icons" style={{ fontSize: '22px' }}>verified</span>
                </div>
              </div>

              {/* KPI 4: RESPUESTAS DE EMPLAZAMIENTO */}
              <div
                onClick={() => navigate('/inspector/validacion/2')}
                className="card animate-fadein"
                style={{
                  background: '#ffffff',
                  border: '1px solid #ffedd5',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.05)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(234, 88, 12, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(234, 88, 12, 0.05)'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 750, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Respuestas de Emplazamiento
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#7c2d12', marginTop: '2px' }}>
                    {countRespuestasEmplazamiento}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9a3412', marginTop: '1px' }}>
                    Respuestas emplazamiento del efector
                  </div>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <span className="material-icons" style={{ fontSize: '22px' }}>rate_review</span>
                </div>
              </div>

              {/* KPI 5: EMPLAZAMIENTOS VENCIDOS (ALERTA DE TIEMPO) */}
              <div
                onClick={() => navigate('/inspector/inspecciones')}
                className="card animate-fadein"
                style={{
                  background: '#fff5f5',
                  border: '1px solid #fda4af',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.08)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(225, 29, 72, 0.16)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(225, 29, 72, 0.08)'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 750, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Emplazamientos Vencidos
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#881337', marginTop: '2px' }}>
                    {countEmplazamientosVencidos}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9f1239', marginTop: '1px', fontWeight: 600 }}>
                    ⚠️ Tiempo de plazo agotado
                  </div>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                  <span className="material-icons" style={{ fontSize: '22px' }}>timer_off</span>
                </div>
              </div>
            </div>
          </div>

          {/* TÍTULO Y CARDS DE SECCIÓN DE FUNCIONALIDADES (SOLO ROLES DE FISCALIZACIÓN/INSPECTOR) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
            <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--color-gray-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: '20px' }}>apps</span>
              Funcionalidades del Sistema
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>
              Acceso a bandejas principales
            </span>
          </div>

            {/* GRID DE CARDS DE FUNCIONALIDAD SEGÚN EL ROL */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px'
            }}>
              {/* CARD: ALERTAS DE INSPECCIÓN POR RUTINA (Solo para Auditor/Coordinador) */}
              {user?.rol !== 'INSPECTOR' && (
                <div
                  onClick={() => navigate(`/${user?.rol.toLowerCase()}/alertas-rutina`)}
                  className="card animate-fadein"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-icons" style={{ fontSize: '22px', color: '#0055A5' }}>notifications_active</span>
                    </div>
                    <span style={{ background: '#F1F5F9', color: '#0F172A', fontSize: '10px', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      Alertas Periódicas
                    </span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Alertas de Inspección por Rutina</h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, lineHeight: 1.35 }}>
                    Vencimientos periódicos y órdenes de terreno.
                  </p>
                </div>
              )}

              {/* CARD 1: BANDEJA DE INSPECCIONES */}
              <div
                onClick={() => navigate('/inspector/inspecciones')}
                className="card animate-fadein"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.18)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 8px 18px rgba(2, 132, 199, 0.28)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.18)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-icons" style={{ fontSize: '22px' }}>fact_check</span>
                  </div>
                  <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#ffffff', fontSize: '10px', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    In Situ
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px 0' }}>Bandeja de Inspecciones</h3>
                <p style={{ fontSize: '11.5px', opacity: 0.9, margin: 0, lineHeight: 1.35 }}>
                  Inspecciones de Rutina, Denuncia y Habilitación.
                </p>
              </div>

              {/* CARD 2: DENUNCIAS ENTRANTES */}
              <div
                onClick={() => navigate('/inspector/admin/denuncias')}
                className="card animate-fadein"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-icons" style={{ fontSize: '22px', color: '#e11d48' }}>report_problem</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#e11d48' }}>
                    {denunciasPendientesAdminCount}
                  </div>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-gray-900)', margin: '0 0 4px 0' }}>Denuncias Sanitarias Pendientes</h3>
                <p style={{ fontSize: '11.5px', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.35 }}>
                  Denuncias recepcionadas para derivar a terreno.
                </p>
              </div>

              {/* CARD 3: EXPEDIENTES ABIERTOS */}
              <div
                onClick={() => navigate('/inspector/expedientes')}
                className="card animate-fadein"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-icons" style={{ fontSize: '22px', color: '#0284c7' }}>folder</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0284c7' }}>
                    {tramites.length}
                  </div>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-gray-900)', margin: '0 0 4px 0' }}>Trámites en Curso</h3>
                <p style={{ fontSize: '11.5px', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.35 }}>
                  Evaluación de documentación y dictámenes.
                </p>
              </div>

              {/* CARD 4: BANDEJA DE TRÁMITES */}
              <div
                onClick={() => navigate('/inspector/bandeja')}
                className="card animate-fadein"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-icons" style={{ fontSize: '22px', color: '#4f46e5' }}>assignment</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#4f46e5' }}>
                    {tramites.filter(t => t.estado.includes('INSP')).length}
                  </div>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-gray-900)', margin: '0 0 4px 0' }}>Bandeja de Trámites</h3>
                <p style={{ fontSize: '11.5px', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.35 }}>
                  Consulta y filtrado avanzado de trámites.
                </p>
              </div>

              {/* CARD 5: CONSULTA DE ESTABLECIMIENTOS */}
              <div
                onClick={() => navigate('/inspector/establecimientos')}
                className="card animate-fadein"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-icons" style={{ fontSize: '22px', color: '#9333ea' }}>business</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#9333ea' }}>
                    {ESTABLECIMIENTOS.length}
                  </div>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-gray-900)', margin: '0 0 4px 0' }}>Consulta de Establecimientos</h3>
                <p style={{ fontSize: '11.5px', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.35 }}>
                  Padrón de clínicas, sanatorios y laboratorios.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL 1: INICIAR TRÁMITE */}
      <ModalIniciarTramite
        isOpen={modalTramiteOpen}
        onClose={() => setModalTramiteOpen(false)}
        onConfirm={handleIniciarTramite}
      />

      {/* MODAL 2: PRESENTAR DENUNCIA SANITARIA */}
      <ModalPresentarDenuncia
        isOpen={modalDenunciaOpen}
        onClose={() => setModalDenunciaOpen(false)}
        onSuccess={(numExp) => {
          setAlertaExito(`Denuncia presentada correctamente bajo Expediente N° ${numExp}`)
          setMisDenunciasCount(prev => prev + 1)
        }}
      />

      {/* MODAL 3: RESPONDER EMPLAZAMIENTO (EFECTOR) */}
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

    </>
  )
}
