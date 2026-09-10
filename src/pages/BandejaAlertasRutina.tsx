import React, { useState, useEffect } from 'react'
import { ALERTAS_RUTINA, USUARIOS, type AlertaRutinaItem } from '../data/mockData'
import { useApp } from '../context/AppContext'

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth <= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

export default function BandejaAlertasRutina({ hideTopbar = false }: { hideTopbar?: boolean } = {}) {
  const { generarOrdenRutina, unificarTramiteRutina } = useApp()
  const isTablet = useIsTablet()

  const [alertas, setAlertas] = useState<AlertaRutinaItem[]>(ALERTAS_RUTINA)
  
  // Basic & Advanced Filter State
  const [busqueda, setBusqueda] = useState('')
  const [filtroVentana, setFiltroVentana] = useState<string>('TODAS')
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('')
  const [filtroTipologia, setFiltroTipologia] = useState<string>('')
  const [filtroFrecuencia, setFiltroFrecuencia] = useState<string>('')
  const [ordenamiento, setOrdenamiento] = useState<string>('URGENCIA')
  
  // Expandable Panel Toggle State
  const [filtrosExpandidos, setFiltrosExpandidos] = useState(false)

  // Modal State
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaRutinaItem | null>(null)
  const [inspectorSeleccionado, setInspectorSeleccionado] = useState('')
  const [modalidad, setModalidad] = useState<'PRESENCIAL' | 'VIRTUAL'>('PRESENCIAL')

  const agentesDisponibles = USUARIOS.filter(u => u.rol === 'INSPECTOR' || u.rol === 'AUDITOR')

  // Filtering
  const filtradas = alertas.filter(a => {
    const matchBusqueda = busqueda === '' ||
      a.denominacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.nroExpediente.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.cuit.includes(busqueda) ||
      a.localidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.domicilio.toLowerCase().includes(busqueda.toLowerCase())

    const matchVentana = filtroVentana === 'TODAS' || a.ventanaAlerta === filtroVentana
    const matchDepto = filtroDepartamento === '' || a.departamento === filtroDepartamento
    const matchTipo = filtroTipologia === '' || a.tipologia.toLowerCase().includes(filtroTipologia.toLowerCase())
    const matchFrec = filtroFrecuencia === '' || a.frecuenciaAnual.toString() === filtroFrecuencia

    return matchBusqueda && matchVentana && matchDepto && matchTipo && matchFrec
  })

  // Priority Sort: CRITICO_VENCIDO (1) -> ROJO_T15 (2) -> AMARILLO_T30 (3) -> VERDE (4)
  const ventanaPriority: Record<string, number> = {
    'CRITICO_VENCIDO': 1,
    'ROJO_T15': 2,
    'AMARILLO_T30': 3,
    'VERDE': 4
  }

  const ordenadas = [...filtradas].sort((a, b) => {
    if (ordenamiento === 'URGENCIA') {
      const prioA = ventanaPriority[a.ventanaAlerta] || 99
      const prioB = ventanaPriority[b.ventanaAlerta] || 99
      return prioA - prioB
    } else if (ordenamiento === 'DENOMINACION') {
      return a.denominacion.localeCompare(b.denominacion)
    } else if (ordenamiento === 'EXPEDIENTE') {
      return a.nroExpediente.localeCompare(b.nroExpediente)
    }
    return 0
  })

  // Metric counts
  const countVencidos = alertas.filter(a => a.ventanaAlerta === 'CRITICO_VENCIDO').length
  const countT15 = alertas.filter(a => a.ventanaAlerta === 'ROJO_T15').length
  const countT30 = alertas.filter(a => a.ventanaAlerta === 'AMARILLO_T30').length
  const countFiltrosActivos = [
    filtroVentana !== 'TODAS',
    filtroDepartamento !== '',
    filtroTipologia !== '',
    filtroFrecuencia !== ''
  ].filter(Boolean).length

  const handleLimpiarFiltros = () => {
    setBusqueda('')
    setFiltroVentana('TODAS')
    setFiltroDepartamento('')
    setFiltroTipologia('')
    setFiltroFrecuencia('')
    setOrdenamiento('URGENCIA')
  }

  const handleEmitirOrden = () => {
    if (!selectedAlerta) return
    const inspector = inspectorSeleccionado || selectedAlerta.inspectorSugerido || 'Dra. Valeria Romero'
    generarOrdenRutina(selectedAlerta.establecimientoId, inspector, modalidad)
    alert(`Orden de Inspección por Rutina emitida para "${selectedAlerta.denominacion}" y asignada a ${inspector}.`)
    setAlertas(prev => prev.filter(a => a.id !== selectedAlerta.id))
    setSelectedAlerta(null)
  }

  const handleUnificar = (alerta: AlertaRutinaItem) => {
    if (!alerta.tramiteActivoEnCurso) return
    unificarTramiteRutina(alerta.id, alerta.tramiteActivoEnCurso.id)
    alert(`Inspección de Rutina unificada con el trámite activo N° ${alerta.tramiteActivoEnCurso.nroTramite}`)
    setAlertas(prev => prev.filter(a => a.id !== alerta.id))
  }

  const getVentanaBadge = (ventana: string) => {
    switch (ventana) {
      case 'CRITICO_VENCIDO':
        return (
          <span style={{
            fontWeight: 700,
            fontSize: 11,
            color: '#B91C1C',
            background: '#FEE2E2',
            padding: '4px 10px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span className="material-icons" style={{ fontSize: 14 }}>error</span>
            Vencido Sin Orden
          </span>
        )
      case 'ROJO_T15':
        return (
          <span style={{
            fontWeight: 700,
            fontSize: 11,
            color: '#B45309',
            background: '#FEF3C7',
            padding: '4px 10px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span className="material-icons" style={{ fontSize: 14 }}>warning</span>
            Próximo a vencer (&lt; 15 días)
          </span>
        )
      default:
        return (
          <span style={{
            fontWeight: 700,
            fontSize: 11,
            color: '#334155',
            background: '#F1F5F9',
            padding: '4px 10px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span className="material-icons" style={{ fontSize: 14 }}>schedule</span>
            En plazo (&lt; 30 días)
          </span>
        )
    }
  }

  return (
    <>
      {/* Top Title Bar */}
      {!hideTopbar && (
        <div className="topbar">
          <div>
            <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons" style={{ fontSize: 24, color: '#0055A5' }}>notifications_active</span>
              Alertas de Inspección por Rutina
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              Monitoreo continuo de fiscalización periódica (1/año en clínicas, 3/año en geriátricos)
            </div>
          </div>
        </div>
      )}

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Metric Summary Bar - Interactive & Modern */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12
        }}>
          {/* Vencidos Metric */}
          <div
            onClick={() => setFiltroVentana(filtroVentana === 'CRITICO_VENCIDO' ? 'TODAS' : 'CRITICO_VENCIDO')}
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${filtroVentana === 'CRITICO_VENCIDO' ? '#EF4444' : '#E2E8F0'}`,
              borderRadius: 10,
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
                Vencidos Sin Orden
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#DC2626', marginTop: 2 }}>
                {countVencidos}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 28, color: '#FCA5A5' }}>error_outline</span>
          </div>

          {/* T-15 Metric */}
          <div
            onClick={() => setFiltroVentana(filtroVentana === 'ROJO_T15' ? 'TODAS' : 'ROJO_T15')}
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${filtroVentana === 'ROJO_T15' ? '#F59E0B' : '#E2E8F0'}`,
              borderRadius: 10,
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
                Próximos (&lt; 15 días)
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706', marginTop: 2 }}>
                {countT15}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 28, color: '#FDE68A' }}>warning_amber</span>
          </div>

          {/* T-30 Metric */}
          <div
            onClick={() => setFiltroVentana(filtroVentana === 'AMARILLO_T30' ? 'TODAS' : 'AMARILLO_T30')}
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${filtroVentana === 'AMARILLO_T30' ? '#0055A5' : '#E2E8F0'}`,
              borderRadius: 10,
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
                En plazo (&lt; 30 días)
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#334155', marginTop: 2 }}>
                {countT30}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 28, color: '#CBD5E1' }}>schedule</span>
          </div>

          {/* Geriátricos Metric */}
          <div
            onClick={() => setFiltroTipologia(filtroTipologia === 'Geriátrico' ? '' : 'Geriátrico')}
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${filtroTipologia === 'Geriátrico' ? '#D97706' : '#E2E8F0'}`,
              borderRadius: 10,
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
                Geriátricos (3/año)
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706', marginTop: 2 }}>
                {alertas.filter(a => a.tipologia.toLowerCase().includes('geriátrico') || a.frecuenciaAnual === 3).length}
              </div>
            </div>
            <span className="material-icons" style={{ fontSize: 28, color: '#FDE68A' }}>local_hospital</span>
          </div>
        </div>

        {/* Search & Expandable Filters Container */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 10,
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
        }}>
          {/* Top Search Row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
              <span className="material-icons" style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8', fontSize: 18 }}>search</span>
              <input
                type="text"
                placeholder="Buscar por establecimiento, CUIT, expediente o domicilio..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>

            {/* Quick Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Ordenar por:</span>
              <select
                value={ordenamiento}
                onChange={e => setOrdenamiento(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, background: 'white' }}
              >
                <option value="URGENCIA">Vencimiento (Más urgente primero)</option>
                <option value="DENOMINACION">Establecimiento (A-Z)</option>
                <option value="EXPEDIENTE">N° Expediente</option>
              </select>
            </div>

            {/* Expand / Collapse Filters Button */}
            <button
              type="button"
              onClick={() => setFiltrosExpandidos(!filtrosExpandidos)}
              style={{
                background: filtrosExpandidos ? '#F1F5F9' : '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#334155',
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
              <span className="material-icons" style={{ fontSize: 18 }}>tune</span>
              Filtros Avanzados
              {countFiltrosActivos > 0 && (
                <span style={{ background: '#0055A5', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 10 }}>
                  {countFiltrosActivos}
                </span>
              )}
              <span className="material-icons" style={{ fontSize: 18 }}>
                {filtrosExpandidos ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {/* Active Filter Badges Strip */}
          {countFiltrosActivos > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', paddingTop: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Filtros activos:</span>
              {filtroVentana !== 'TODAS' && (
                <span style={{ fontSize: 11, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Ventana: {filtroVentana === 'CRITICO_VENCIDO' ? 'Vencidos' : filtroVentana === 'ROJO_T15' ? '< 15 días' : '< 30 días'}
                  <span className="material-icons" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => setFiltroVentana('TODAS')}>close</span>
                </span>
              )}
              {filtroDepartamento && (
                <span style={{ fontSize: 11, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Depto: {filtroDepartamento}
                  <span className="material-icons" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => setFiltroDepartamento('')}>close</span>
                </span>
              )}
              {filtroTipologia && (
                <span style={{ fontSize: 11, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Tipo: {filtroTipologia}
                  <span className="material-icons" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => setFiltroTipologia('')}>close</span>
                </span>
              )}
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                style={{ border: 'none', background: 'none', color: '#0055A5', fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Expandable Advanced Filters Panel */}
          {filtrosExpandidos && (
            <div style={{
              paddingTop: 14,
              borderTop: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14,
              alignItems: 'flex-end'
            }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Ventana de Alerta:
                </label>
                <select
                  value={filtroVentana}
                  onChange={e => setFiltroVentana(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, background: 'white' }}
                >
                  <option value="TODAS">Todas las Ventanas</option>
                  <option value="CRITICO_VENCIDO">Vencidos sin fiscalizar</option>
                  <option value="ROJO_T15">Próximos a vencer (&lt; 15 días)</option>
                  <option value="AMARILLO_T30">En plazo (&lt; 30 días)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Departamento:
                </label>
                <select
                  value={filtroDepartamento}
                  onChange={e => setFiltroDepartamento(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, background: 'white' }}
                >
                  <option value="">Todos los Departamentos</option>
                  <option value="Capital">Capital</option>
                  <option value="Punilla">Punilla</option>
                  <option value="Río Cuarto">Río Cuarto</option>
                  <option value="General San Martín">General San Martín</option>
                  <option value="Colón">Colón</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Tipología:
                </label>
                <select
                  value={filtroTipologia}
                  onChange={e => setFiltroTipologia(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, background: 'white' }}
                >
                  <option value="">Todas las Tipologías</option>
                  <option value="Clínica">Clínicas y Hospitales</option>
                  <option value="Geriátrico">Geriátricos y Residencias</option>
                  <option value="Sanatorio">Sanatorios</option>
                  <option value="Centro Médico">Centros Médicos</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Frecuencia Anual:
                </label>
                <select
                  value={filtroFrecuencia}
                  onChange={e => setFiltroFrecuencia(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, background: 'white' }}
                >
                  <option value="">Todas las Frecuencias</option>
                  <option value="1">1 al año (Clínicas/Sanatorios)</option>
                  <option value="3">3 al año (Geriátricos/Residencias)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#64748B',
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>restart_alt</span>
                  Restablecer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data List / Table or Responsive Cards */}
        {isTablet ? (
          /* Responsive Cards for Tablet/Mobile */
          ordenadas.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {ordenadas.map(alerta => (
                <div key={alerta.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      {getVentanaBadge(alerta.ventanaAlerta)}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--color-gray-500)' }}>
                      Exp: {alerta.nroExpediente}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>{alerta.denominacion}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: 'monospace', marginTop: 2 }}>CUIT: {alerta.cuit}</div>
                  </div>
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>{alerta.tipologia}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#1E293B' }}>{alerta.localidad}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{alerta.departamento}</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setSelectedAlerta(alerta)
                        setInspectorSeleccionado(alerta.inspectorSugerido || 'Dra. Valeria Romero')
                      }}
                      style={{
                        background: '#EFF6FF',
                        border: 'none',
                        color: '#0055A5',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 16 }}>assignment_ind</span>
                      Asignar Inspector
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
              <div className="card" style={{ textAlign: 'center', padding: 48, color: '#64748B' }}>
                <span className="material-icons" style={{ fontSize: 40, color: '#CBD5E1', marginBottom: 8, display: 'block' }}>notifications_off</span>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>No se encontraron alertas</div>
                <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 2 }}>Prueba ajustando los filtros de búsqueda.</div>
              </div>
            </div>
          )
        ) : (
          /* Desktop Table View */
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}>
            {(() => {
              const isFilteringGeriatricos = filtroTipologia.toLowerCase().includes('geriátrico') || filtroFrecuencia === '3';
              return (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Estado Ventana</th>
                      <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Establecimiento / CUIT</th>
                      <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>N° Expediente</th>
                      <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tipología</th>
                      <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ubicación</th>
                      <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenadas.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#64748B' }}>
                          <span className="material-icons" style={{ fontSize: 40, color: '#CBD5E1', marginBottom: 8, display: 'block' }}>notifications_off</span>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>No se encontraron alertas</div>
                          <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 2 }}>Prueba ajustando los filtros de búsqueda.</div>
                        </td>
                      </tr>
                    ) : (
                      ordenadas.map(alerta => (
                        <tr key={alerta.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                            {getVentanaBadge(alerta.ventanaAlerta)}
                          </td>

                          <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{alerta.denominacion}</div>
                            <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: 'monospace', marginTop: 2 }}>CUIT: {alerta.cuit}</div>
                          </td>

                          <td style={{ padding: '14px 18px', verticalAlign: 'top', fontFamily: 'monospace', fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                            {alerta.nroExpediente}
                          </td>

                          <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 600, color: '#1E293B' }}>{alerta.tipologia}</div>
                          </td>

                          <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                            <div style={{ color: '#1E293B' }}>{alerta.localidad}</div>
                            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{alerta.departamento}</div>
                          </td>

                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'center', width: 100 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap' }}>
                          <button
                            onClick={() => {
                              setSelectedAlerta(alerta)
                              setInspectorSeleccionado(alerta.inspectorSugerido || 'Dra. Valeria Romero')
                            }}
                            title="Emitir Orden de Inspección por Rutina"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#0055A5',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                          >
                            <span className="material-icons" style={{ fontSize: 20 }}>assignment_ind</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
              )
            })()}
          </div>
        )}

        {/* Modal Emitir Orden */}
        {selectedAlerta && (() => {
          const tramite = selectedAlerta.tramiteActivoEnCurso
          const estadoSim = tramite?.estadoSimultaneo
          const isIniciado = estadoSim === 'INICIADO'
          const isEnviado = estadoSim === 'ENVIADO'
          const tipoTramiteLabel = tramite?.tipo === 'RENOVACION' ? 'renovación'
            : tramite?.tipo === 'MODIFICACION' ? 'modificación'
            : 'habilitación'

          return (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20
            }}>
              <div style={{
                background: 'white',
                borderRadius: 14,
                maxWidth: 520,
                width: '100%',
                padding: 28,
                border: '1px solid #CBD5E1',
                boxShadow: '0 20px 40px rgba(15,23,42,0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 750, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-icons" style={{ fontSize: 22, color: '#0055A5' }}>assignment_ind</span>
                    Emitir Orden de Inspección por Rutina
                  </h3>
                  <button onClick={() => setSelectedAlerta(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
                    <span className="material-icons">close</span>
                  </button>
                </div>

                {/* Establecimiento Info */}
                <div style={{ fontSize: 13, color: '#475569', padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <strong>{selectedAlerta.denominacion}</strong>
                  <span style={{ color: '#94A3B8', marginLeft: 8 }}>{selectedAlerta.localidad} · {selectedAlerta.tipologia}</span>
                </div>

                {/* ─── WARNING BANNER: Trámite Simultáneo ─── */}
                {(isIniciado || isEnviado) && (
                  <div style={{
                    borderRadius: 8,
                    border: `1.5px solid ${isEnviado ? '#F97316' : '#F59E0B'}`,
                    background: isEnviado ? '#FFF7ED' : '#FFFBEB',
                    padding: '10px 14px',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center'
                  }}>
                    <span className="material-icons" style={{
                      fontSize: 20,
                      color: isEnviado ? '#EA580C' : '#D97706',
                      flexShrink: 0
                    }}>
                      {isEnviado ? 'send' : 'info'}
                    </span>
                    <span style={{ fontSize: 13, color: isEnviado ? '#9A3412' : '#92400E' }}>
                      Tiene un trámite de <strong>{tipoTramiteLabel}</strong>{' '}
                      {isEnviado ? 'enviado' : 'iniciado'} el{' '}
                      <strong>{tramite!.fechaEstado ?? tramite!.estado}</strong>
                    </span>
                  </div>
                )}

                {/* Inspector Asignado */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Inspector Asignado:
                  </label>
                  <select
                    value={inspectorSeleccionado}
                    onChange={e => setInspectorSeleccionado(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    {agentesDisponibles.map(ag => (
                      <option key={ag.id} value={`${ag.nombre} ${ag.apellido}`}>
                        {ag.nombre} {ag.apellido} ({ag.rol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Modalidad */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Modalidad de Operativo:
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setModalidad('PRESENCIAL')}
                      style={{
                        flex: 1, padding: '10px 12px', borderRadius: 6,
                        border: modalidad === 'PRESENCIAL' ? '1.5px solid #0055A5' : '1px solid #CBD5E1',
                        background: modalidad === 'PRESENCIAL' ? '#EFF6FF' : 'white',
                        fontWeight: 700, color: modalidad === 'PRESENCIAL' ? '#0055A5' : '#475569',
                        cursor: 'pointer', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>place</span> Presencial In Situ
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalidad('VIRTUAL')}
                      style={{
                        flex: 1, padding: '10px 12px', borderRadius: 6,
                        border: modalidad === 'VIRTUAL' ? '1.5px solid #0055A5' : '1px solid #CBD5E1',
                        background: modalidad === 'VIRTUAL' ? '#EFF6FF' : 'white',
                        fontWeight: 700, color: modalidad === 'VIRTUAL' ? '#0055A5' : '#475569',
                        cursor: 'pointer', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>laptop</span> Virtual
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4, borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => setSelectedAlerta(null)}
                    style={{ padding: '9px 16px', borderRadius: 6, border: '1px solid #CBD5E1', background: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12.5, color: '#475569' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEmitirOrden}
                    style={{
                      padding: '9px 20px', borderRadius: 6, border: 'none',
                      background: (isIniciado || isEnviado) ? '#D97706' : '#0055A5',
                      color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12.5,
                      display: 'inline-flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 17 }}>
                      {(isIniciado || isEnviado) ? 'warning' : 'check'}
                    </span>
                    {(isIniciado || isEnviado) ? 'Emitir de todas formas' : 'Confirmar Orden'}
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </>
  )
}
