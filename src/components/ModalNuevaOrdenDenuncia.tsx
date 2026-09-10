import React, { useState, useRef, useEffect } from 'react'
import {
  ESTABLECIMIENTOS,
  USUARIOS,
  type EstadoOrdenDenuncia,
  type OrigenDenuncia,
  type PrioridadDenuncia,
  type OrdenDenuncia,
  type EvidenciaOrdenDenuncia,
  type Establecimiento,
} from '../data/mockData'
import { useApp } from '../context/AppContext'

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orden: OrdenDenuncia) => void;
}

const MOTIVOS_DENUNCIA = [
  { id: 'FALTA_HABILITACION', label: 'Falta de Habilitación / Clandestinidad' },
  { id: 'EJERCICIO_ILEGAL', label: 'Ejercicio Ilegal de la Medicina o Profesiones de Salud' },
  { id: 'CONDICIONES_HIGIENICO_SANITARIAS', label: 'Condiciones Higiénico-Sanitarias Deficientes' },
  { id: 'EQUIPAMIENTO_NO_AUTORIZADO', label: 'Equipamiento o Prácticas No Autorizadas' },
  { id: 'FALTA_PERSONAL_DIRECTOR', label: 'Falta de Director Médico / Personal en Horario Operativo' },
  { id: 'OTRO', label: 'Otro Incumplimiento Sanitario' },
]

const TIPOLOGIAS_OPCIONES = [
  'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
  'ESTABLECIMIENTOS GERIÁTRICOS',
  'CONSULTORIO',
  'CENTRO DE SALUD AMBULATORIA',
  'CENTRO CIRUGÍA AMBULATORIA',
  'CENTRO DE ESTÉTICA CORPORAL',
  'FARMACIA',
  'CENTRO DE DIÁLISIS',
  'LABORATORIO DE ANÁLISIS CLÍNICOS',
  'ÓPTICA Y CONTACTOLOGÍA',
  'TATUADORES Y PERFORADORES',
  'OTRO ESTABLECIMIENTO'
]

export default function ModalNuevaOrdenDenuncia({ isOpen, onClose, onSuccess }: Props) {
  const { crearOrdenDenuncia } = useApp()

  // 1. Establecimiento
  const [modoEstablecimiento, setModoEstablecimiento] = useState<'EXISTENTE' | 'NO_REGISTRADO'>('EXISTENTE')
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState<Establecimiento | null>(() => ESTABLECIMIENTOS[0] || null)
  const [textoBusquedaEstablecimiento, setTextoBusquedaEstablecimiento] = useState(
    ESTABLECIMIENTOS[0] ? `${ESTABLECIMIENTOS[0].denominacion} — CUIT: ${ESTABLECIMIENTOS[0].cuit}` : ''
  )
  const [comboAbierto, setComboAbierto] = useState(false)
  const comboRef = useRef<HTMLDivElement>(null)

  // Datos para establecimiento manual / no registrado
  const [denominacionManual, setDenominacionManual] = useState('')
  const [cuitManual, setCuitManual] = useState('')
  const [tipologiaManual, setTipologiaManual] = useState(TIPOLOGIAS_OPCIONES[0])
  const [domicilioManual, setDomicilioManual] = useState('')
  const [localidadManual, setLocalidadManual] = useState('Córdoba')
  const [departamentoManual, setDepartamentoManual] = useState('Capital')

  // 2. Datos de la denuncia
  const [nroExpedienteDenuncia, setNroExpedienteDenuncia] = useState(`DEN-2026-${Math.floor(1000 + Math.random() * 9000)}`)
  const [nroExpediente, setNroExpediente] = useState(`EX-2026-0${Math.floor(100000 + Math.random() * 900000)}-APN-MS#CBA`)
  const [origen, setOrigen] = useState<OrigenDenuncia>('CIUDADANA')
  const [prioridad, setPrioridad] = useState<PrioridadDenuncia>('URGENTE')
  const [motivo, setMotivo] = useState(MOTIVOS_DENUNCIA[0].id)
  const [descripcionMotivo, setDescripcionMotivo] = useState('')

  // 3. Coordinación y Asignación Operativa
  const [coordinadorAsignado, setCoordinadorAsignado] = useState('Juan Gomez')
  const [modalidad, setModalidad] = useState<'PRESENCIAL' | 'VIRTUAL'>('PRESENCIAL')
  const [fechaInspeccionSugerida, setFechaInspeccionSugerida] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })
  const [observaciones, setObservaciones] = useState('')

  // 4. Adjuntos / Evidencias
  const [adjuntos, setAdjuntos] = useState<EvidenciaOrdenDenuncia[]>([])

  // Validaciones y feedback
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cerrar combo al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(event.target as Node)) {
        setComboAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen) return null

  // Filtrado de establecimientos en tiempo real mientras el usuario escribe
  const establecimientosFiltrados = ESTABLECIMIENTOS.filter(e => {
    const term = textoBusquedaEstablecimiento.toLowerCase().trim()
    if (!term) return true
    return (
      e.denominacion.toLowerCase().includes(term) ||
      e.cuit.toLowerCase().includes(term) ||
      e.tipologia.toLowerCase().includes(term) ||
      e.localidad.toLowerCase().includes(term) ||
      e.nroExpediente.toLowerCase().includes(term)
    )
  })

  const coordinadores = USUARIOS.filter(u => u.rol === 'COORDINADOR')

  const handleSeleccionarEstablecimiento = (est: Establecimiento) => {
    setEstablecimientoSeleccionado(est)
    setTextoBusquedaEstablecimiento(`${est.denominacion} — CUIT: ${est.cuit}`)
    setComboAbierto(false)
  }

  const handleLimpiarBusquedaEstablecimiento = () => {
    setEstablecimientoSeleccionado(null)
    setTextoBusquedaEstablecimiento('')
    setComboAbierto(true)
  }

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      let tipo: 'IMAGEN' | 'PDF' | 'DOCUMENTO' = 'DOCUMENTO'
      if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) {
        tipo = 'IMAGEN'
      } else if (extension === 'pdf') {
        tipo = 'PDF'
      }

      const sizeKb = (file.size / 1024).toFixed(1)
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKb} KB`

      const nuevo: EvidenciaOrdenDenuncia = {
        id: `ADJ-${Math.random().toString(36).substring(2, 7)}`,
        nombre: file.name,
        tamaño: sizeStr,
        tipo,
      }
      setAdjuntos(prev => [...prev, nuevo])
    })
    e.target.value = ''
  }

  const handleFileRemove = (id: string) => {
    setAdjuntos(prev => prev.filter(a => a.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    // Validar establecimiento
    let estInfo = {
      id: undefined as string | undefined,
      denominacion: '',
      cuit: '',
      tipologia: '',
      domicilio: '',
      localidad: '',
      departamento: '',
      esRegistrado: false,
    }

    if (modoEstablecimiento === 'EXISTENTE') {
      if (!establecimientoSeleccionado) {
        setErrorMsg('Seleccione un establecimiento de la lista utilizando el buscador.')
        return
      }
      estInfo = {
        id: establecimientoSeleccionado.id,
        denominacion: establecimientoSeleccionado.denominacion,
        cuit: establecimientoSeleccionado.cuit,
        tipologia: establecimientoSeleccionado.tipologia,
        domicilio: 'Av. Colón 1250',
        localidad: establecimientoSeleccionado.localidad,
        departamento: establecimientoSeleccionado.departamento || 'Capital',
        esRegistrado: true,
      }
    } else {
      if (!denominacionManual.trim()) {
        setErrorMsg('Ingrese la denominación o razón social del establecimiento.')
        return
      }
      if (!domicilioManual.trim()) {
        setErrorMsg('Ingrese el domicilio del establecimiento.')
        return
      }
      estInfo = {
        id: undefined,
        denominacion: denominacionManual.trim(),
        cuit: cuitManual.trim() || '30-00000000-0',
        tipologia: tipologiaManual,
        domicilio: domicilioManual.trim(),
        localidad: localidadManual.trim() || 'Córdoba',
        departamento: departamentoManual.trim() || 'Capital',
        esRegistrado: false,
      }
    }

    // Validar descripción del hecho
    if (descripcionMotivo.trim().length < 5) {
      setErrorMsg('Debe ingresar una descripción circunstanciada del hecho denunciado.')
      return
    }

    setIsSubmitting(true)

    // Estado inicial por defecto de la orden emitida: ASIGNADA_A_COORDINADOR
    const estadoInicial: EstadoOrdenDenuncia = 'ASIGNADA_A_COORDINADOR'

    const nueva = crearOrdenDenuncia({
      nroExpediente,
      nroExpedienteDenuncia,
      establecimiento: estInfo,
      origen,
      prioridad,
      motivo,
      descripcionMotivo: descripcionMotivo.trim(),
      estado: estadoInicial,
      coordinadorAsignado,
      modalidad,
      observaciones: observaciones.trim() || undefined,
      fechaInspeccionSugerida,
      adjuntos,
    })

    setTimeout(() => {
      setIsSubmitting(false)
      if (onSuccess) onSuccess(nueva)
      onClose()
    }, 200)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          width: '100%',
          maxWidth: 760,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
              }}
            >
              <span className="material-icons" style={{ fontSize: 24, color: 'white' }}>
                assignment_add
              </span>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>
                Nueva Orden de Denuncia Sanitaria
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#94A3B8' }}>
                Emisión administrativa y asignación para operativo de fiscalización
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {errorMsg && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#B91C1C',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>error</span>
              {errorMsg}
            </div>
          )}

          {/* 1. ESTABLECIMIENTO DENUNCIADO CON COMBO FILTRABLE AL ESCRIBIR */}
          <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-icons" style={{ fontSize: 18, color: '#DC2626' }}>domain</span>
                Establecimiento Denunciado <span style={{ color: '#EF4444' }}>*</span>
              </label>
              
              {/* Toggle Registrado / Clandestino */}
              <div style={{ display: 'flex', background: '#E2E8F0', padding: 3, borderRadius: 8, gap: 2 }}>
                <button
                  type="button"
                  onClick={() => setModoEstablecimiento('EXISTENTE')}
                  style={{
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: modoEstablecimiento === 'EXISTENTE' ? '#FFFFFF' : 'transparent',
                    color: modoEstablecimiento === 'EXISTENTE' ? '#0F172A' : '#64748B',
                    boxShadow: modoEstablecimiento === 'EXISTENTE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 14 }}>search</span>
                  Buscar en Base ClicSalud+
                </button>
                <button
                  type="button"
                  onClick={() => setModoEstablecimiento('NO_REGISTRADO')}
                  style={{
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: modoEstablecimiento === 'NO_REGISTRADO' ? '#EF4444' : 'transparent',
                    color: modoEstablecimiento === 'NO_REGISTRADO' ? '#FFFFFF' : '#64748B',
                    boxShadow: modoEstablecimiento === 'NO_REGISTRADO' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 14 }}>add_location_alt</span>
                  No Registrado / Clandestino
                </button>
              </div>
            </div>

            {modoEstablecimiento === 'EXISTENTE' ? (
              <div ref={comboRef} style={{ position: 'relative' }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>
                  Escribí el nombre, CUIT, tipología o localidad para filtrar:
                </label>
                
                {/* Input Buscador / Combobox */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    className="material-icons"
                    style={{ position: 'absolute', left: 12, fontSize: 19, color: '#64748B', pointerEvents: 'none' }}
                  >
                    search
                  </span>
                  
                  <input
                    type="text"
                    value={textoBusquedaEstablecimiento}
                    onChange={(e) => {
                      setTextoBusquedaEstablecimiento(e.target.value)
                      setComboAbierto(true)
                    }}
                    onFocus={() => setComboAbierto(true)}
                    placeholder="Escribí para buscar (ej. Clínica, 30-71, Río Cuarto, Geriátrico)..."
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 38px',
                      border: `1.5px solid ${comboAbierto ? '#0284C7' : '#CBD5E1'}`,
                      borderRadius: 10,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: '#1E293B',
                      background: '#FFFFFF',
                      outline: 'none',
                      boxShadow: comboAbierto ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  />

                  {textoBusquedaEstablecimiento && (
                    <button
                      type="button"
                      onClick={handleLimpiarBusquedaEstablecimiento}
                      style={{
                        position: 'absolute',
                        right: 34,
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4,
                      }}
                      title="Limpiar búsqueda"
                    >
                      <span className="material-icons" style={{ fontSize: 16 }}>close</span>
                    </button>
                  )}

                  <span
                    onClick={() => setComboAbierto(!comboAbierto)}
                    className="material-icons"
                    style={{
                      position: 'absolute',
                      right: 10,
                      fontSize: 20,
                      color: '#64748B',
                      cursor: 'pointer',
                      transform: comboAbierto ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    expand_more
                  </span>
                </div>

                {/* Dropdown flotante con los resultados filtrados */}
                {comboAbierto && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      maxHeight: 250,
                      overflowY: 'auto',
                      background: '#FFFFFF',
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {establecimientosFiltrados.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: 13 }}>
                        <span className="material-icons" style={{ fontSize: 24, color: '#94A3B8', marginBottom: 4, display: 'block' }}>search_off</span>
                        No se encontraron establecimientos que coincidan con <strong>"{textoBusquedaEstablecimiento}"</strong>.
                        <div style={{ marginTop: 6, fontSize: 11.5, color: '#94A3B8' }}>
                          Podés cargarlo como <em>"No Registrado / Clandestino"</em> con el botón superior.
                        </div>
                      </div>
                    ) : (
                      establecimientosFiltrados.map((est) => {
                        const isSelected = establecimientoSeleccionado?.id === est.id
                        return (
                          <div
                            key={est.id}
                            onClick={() => handleSeleccionarEstablecimiento(est)}
                            style={{
                              padding: '10px 14px',
                              borderBottom: '1px solid #F1F5F9',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(2, 132, 199, 0.08)' : '#FFFFFF',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'background 0.1s ease',
                            }}
                            onMouseOver={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC'
                            }}
                            onMouseOut={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 750, color: isSelected ? '#0284C7' : '#0F172A' }}>
                                {est.denominacion}
                              </div>
                              <div style={{ fontSize: 11.5, color: '#475569', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <span>CUIT: <strong>{est.cuit}</strong></span>
                                <span>•</span>
                                <span>{est.tipologia}</span>
                                <span>•</span>
                                <span>📍 {est.localidad}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="material-icons" style={{ fontSize: 20, color: '#0284C7' }}>check</span>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {/* Badge de confirmación del establecimiento seleccionado */}
                {establecimientoSeleccionado && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '8px 12px',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 12,
                      color: '#1E3A8A',
                    }}
                  >
                    <div>
                      Establecimiento seleccionado: <strong>{establecimientoSeleccionado.denominacion}</strong> ({establecimientoSeleccionado.localidad})
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB' }}>
                      Exp. {establecimientoSeleccionado.nroExpediente}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                    Razón Social / Nombre de Fantasía Denunciado *
                  </label>
                  <input
                    type="text"
                    value={denominacionManual}
                    onChange={(e) => setDenominacionManual(e.target.value)}
                    placeholder="Ej. Consultorio Médico San Lucas / Estética Bella"
                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, background: '#FFFFFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                    CUIT Titular / Responsable Presunto
                  </label>
                  <input
                    type="text"
                    value={cuitManual}
                    onChange={(e) => setCuitManual(e.target.value)}
                    placeholder="Ej. 20-33445566-7"
                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, background: '#FFFFFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                    Tipología Estimada
                  </label>
                  <select
                    value={tipologiaManual}
                    onChange={(e) => setTipologiaManual(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, background: '#FFFFFF' }}
                  >
                    {TIPOLOGIAS_OPCIONES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                    Domicilio Relevado / Declarado *
                  </label>
                  <input
                    type="text"
                    value={domicilioManual}
                    onChange={(e) => setDomicilioManual(e.target.value)}
                    placeholder="Calle y N° / Piso"
                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, background: '#FFFFFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                    Localidad
                  </label>
                  <input
                    type="text"
                    value={localidadManual}
                    onChange={(e) => setLocalidadManual(e.target.value)}
                    placeholder="Córdoba / Río Cuarto / etc."
                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, background: '#FFFFFF' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. DATOS DE LA DENUNCIA Y MOTIVO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-icons" style={{ fontSize: 18, color: '#DC2626' }}>description</span>
              Datos y Fundamentación de la Denuncia <span style={{ color: '#EF4444' }}>*</span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                  N° Expediente Denuncia
                </label>
                <input
                  type="text"
                  value={nroExpedienteDenuncia}
                  onChange={(e) => setNroExpedienteDenuncia(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 12.5, fontFamily: 'monospace', fontWeight: 700, color: '#E11D48', background: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                  Origen de la Denuncia
                </label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value as OrigenDenuncia)}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 12.5, background: '#FFF' }}
                >
                  <option value="CIUDADANA">Denuncia Ciudadana</option>
                  <option value="JUDICIAL">Requerimiento Judicial</option>
                  <option value="AUTORIDAD">Autoridad Sanitaria</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                  Prioridad
                </label>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value as PrioridadDenuncia)}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 12.5, background: '#FFF', fontWeight: 700 }}
                >
                  <option value="CRITICA">Crítica (Riesgo Inminente)</option>
                  <option value="URGENTE">Urgente</option>
                  <option value="NORMAL">Normal</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                  Motivo Tipificado
                </label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 12.5, background: '#FFF' }}
                >
                  {MOTIVOS_DENUNCIA.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                Descripción Detallada del Hecho / Objeto de la Denuncia *
              </label>
              <textarea
                rows={3}
                value={descripcionMotivo}
                onChange={(e) => setDescripcionMotivo(e.target.value)}
                placeholder="Describa con precisión los hechos constatados o denunciados, servicios afectados, horarios de infracción, etc."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* 3. COORDINACIÓN Y ASIGNACIÓN OPERATIVA */}
          <div style={{ background: '#F1F5F9', padding: 16, borderRadius: 14, border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-icons" style={{ fontSize: 18, color: '#0284C7' }}>people</span>
              Coordinación y Plazos Operativos
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                  Coordinador Asignado
                </label>
                <select
                  value={coordinadorAsignado}
                  onChange={(e) => setCoordinadorAsignado(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, background: '#FFF' }}
                >
                  {coordinadores.map(c => (
                    <option key={c.id} value={`${c.nombre} ${c.apellido}`}>
                      {c.nombre} {c.apellido} (Coordinación)
                    </option>
                  ))}
                  <option value="Juan Gomez">Juan Gomez (Coordinación Central)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                  Modalidad Sugerida
                </label>
                <select
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value as 'PRESENCIAL' | 'VIRTUAL')}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, background: '#FFF' }}
                >
                  <option value="PRESENCIAL">Presencial (In Situ)</option>
                  <option value="VIRTUAL">Virtual (Documental)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                  Fecha Sugerida de Operativo
                </label>
                <input
                  type="date"
                  value={fechaInspeccionSugerida}
                  onChange={(e) => setFechaInspeccionSugerida(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, background: '#FFF' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                Observaciones / Instrucciones de Admisión
              </label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Instrucciones para el equipo de inspección u observaciones preliminares..."
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, background: '#FFF' }}
              />
            </div>
          </div>

          {/* 4. EVIDENCIAS / DOCUMENTACIÓN ADJUNTA */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-icons" style={{ fontSize: 18, color: '#64748B' }}>attach_file</span>
                Evidencias y Documentos Adjuntos
              </label>
              <label
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span className="material-icons" style={{ fontSize: 16 }}>attach_file</span>
                Adjuntar Archivo
                <input type="file" multiple onChange={handleFileAdd} style={{ display: 'none' }} />
              </label>
            </div>

            {adjuntos.length === 0 ? (
              <div style={{ border: '2px dashed #CBD5E1', borderRadius: 10, padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
                No se adjuntaron documentos o evidencias fotográficas.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {adjuntos.map(adj => (
                  <div
                    key={adj.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 16, color: adj.tipo === 'PDF' ? '#DC2626' : '#2563EB' }}>
                      {adj.tipo === 'PDF' ? 'picture_as_pdf' : adj.tipo === 'IMAGEN' ? 'image' : 'description'}
                    </span>
                    <span style={{ fontWeight: 600, color: '#334155', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {adj.nombre}
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: 11 }}>({adj.tamaño})</span>
                    <button
                      type="button"
                      onClick={() => handleFileRemove(adj.id)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <span className="material-icons" style={{ fontSize: 14 }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MODAL FOOTER */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              borderTop: '1px solid #E2E8F0',
              paddingTop: 16,
              marginTop: 8,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                borderRadius: 10,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                border: 'none',
                borderRadius: 10,
                padding: '10px 24px',
                fontSize: 13.5,
                fontWeight: 750,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              }}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>
                {isSubmitting ? 'sync' : 'check_circle'}
              </span>
              {isSubmitting ? 'Emitiendo...' : 'Emitir Orden de Denuncia'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
