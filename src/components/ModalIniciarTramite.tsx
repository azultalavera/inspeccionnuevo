import React, { useState, useEffect } from 'react'
import { ESTABLECIMIENTOS } from '../data/mockData'

interface ModalIniciarTramiteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tipo: 'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION', tipologia: string, establecimientoId?: string) => void;
  defaultTipo?: 'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION' | '';
  defaultEstablecimientoId?: string;
}

// 15 Standard tipologías requested by the user
export const TIPOLOGIAS_DATA: Record<string, { label: string; icon: string; requerida: string; restricciones: string }> = {
  'CENTRO CIRUGÍA AMBULATORIA': {
    label: 'CENTRO CIRUGÍA AMBULATORIA',
    icon: 'biotech',
    requerida: 'Quirófano, Sala de Procedimiento y recuperación de Uso Transitorio.',
    restricciones: 'Camas de Internación General, Terapia Intensiva (UTI), Neonatología.'
  },
  'CENTRO DE SALUD AMBULATORIA': {
    label: 'CENTRO DE SALUD AMBULATORIA',
    icon: 'local_hospital',
    requerida: 'Sala de Procedimientos y camas de Uso Transitorio (Observación).',
    restricciones: 'Quirófanos de cualquier tipo, camas de Internación General.'
  },
  'CENTRO DE ESTÉTICA CORPORAL': {
    label: 'CENTRO DE ESTÉTICA CORPORAL',
    icon: 'spa',
    requerida: 'Gabinete habilitado, lavamanos y camillas adecuadas.',
    restricciones: 'Uso de instrumental quirúrgico, prácticas invasivas mayores.'
  },
  'CLÍNICA, SANATORIO U HOSPITAL PRIVADO': {
    label: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    icon: 'domain',
    requerida: 'Quirófanos, Salas de Parto, Terapias (UTI/UCO/UTIP/Neo), Shock Room e Internación General.',
    restricciones: 'Ninguna'
  },
  'CONSULTORIO': {
    label: 'CONSULTORIO',
    icon: 'medical_services',
    requerida: 'Sala de Procedimientos mínima, hasta 4 profesionales de una misma rama.',
    restricciones: 'Unidad funcional, camas de internación, prácticas intervencionistas.'
  },
  'ESTABLECIMIENTO / UNIDAD DE CUIDADOS PALIATIVOS CON INTERNACIÓN': {
    label: 'ESTABLECIMIENTO / UNIDAD DE CUIDADOS PALIATIVOS CON INTERNACIÓN',
    icon: 'hotel',
    requerida: 'Camas de internación de media/larga estadía, enfermería 24hs, área de apoyo psicológico.',
    restricciones: 'Quirófano de alta complejidad.'
  },
  'ESTABLECIMIENTOS GERIÁTRICOS': {
    label: 'ESTABLECIMIENTOS GERIÁTRICOS',
    icon: 'home_emergency',
    requerida: 'Camas de Internación Prolongada, Sala de Procedimientos y accesibilidad completa.',
    restricciones: 'Quirófanos, UTI, UCO, UTIP, NEO.'
  },
  'HOSPITAL DE DÍA ONCOLÓGICO, CENTRO Y/O SERVICIO DE QUIMIOTERAPIA': {
    label: 'HOSPITAL DE DÍA ONCOLÓGICO, CENTRO Y/O SERVICIO DE QUIMIOTERAPIA',
    icon: 'vaccines',
    requerida: 'Sillones de infusión, campana de flujo laminar para preparación, área de reanimación.',
    restricciones: 'Internación general, cirugías complejas.'
  },
  'LABORATORIO DE ANÁLISIS CLÍNICOS': {
    label: 'LABORATORIO DE ANÁLISIS CLÍNICOS',
    icon: 'science',
    requerida: 'Boxes de extracción, área técnica de procesamiento de muestras, depósito de reactivos.',
    restricciones: 'Internación, áreas de consulta médica no vinculadas al laboratorio.'
  },
  'ÓPTICA Y CONTACTOLOGÍA': {
    label: 'ÓPTICA Y CONTACTOLOGÍA',
    icon: 'visibility',
    requerida: 'Gabinete de contactología separado, instrumental óptico de medición, muestrario.',
    restricciones: 'Prácticas médicas oftalmológicas de carácter quirúrgico.'
  },
  'RADIOFISICA': {
    label: 'RADIOFISICA',
    icon: 'radar',
    requerida: 'Blindaje de plomo en paredes, dosímetros personales, área técnica aislada.',
    restricciones: 'Acceso irrestricto de público en zonas de radiación.'
  },
  'SERVICIO DE ATENCIÓN EXTRAHOSPITALARIO MÓVIL': {
    label: 'SERVICIO DE ATENCIÓN EXTRAHOSPITALARIO MÓVIL',
    icon: 'local_shipping',
    requerida: 'Ambulancias de traslado/UTIM equipadas, central de comunicaciones, base de operaciones.',
    restricciones: 'Internación física de pacientes en la base.'
  },
  'SERVICIO DE INTERNACIÓN DOMICILIARIA': {
    label: 'SERVICIO DE INTERNACIÓN DOMICILIARIA',
    icon: 'house',
    requerida: 'Coordinación central, equipamiento de traslado médico domiciliario, legajos digitales.',
    restricciones: 'Camas de internación propias de carácter sanatorial.'
  },
  'TATUADORES Y PERFORADORES': {
    label: 'TATUADORES Y PERFORADORES',
    icon: 'brush',
    requerida: 'Gabinete con revestimientos lavables, autoclave o esterilizador aprobado, consentimiento informado.',
    restricciones: 'Uso de anestesia inyectable, realización de cirugías menores.'
  },
  'UNIDAD O SERVICIO DE DIÁLISIS': {
    label: 'UNIDAD O SERVICIO DE DIÁLISIS',
    icon: 'water_drop',
    requerida: 'Sala de hemodiálisis, tratamiento de agua por ósmosis inversa, área de recuperación.',
    restricciones: 'Quirófanos, Internación General fuera de la específica del tratamiento.'
  }
}

// Normalizes legacy establishment tipology to matching uppercase system tipology
export const normalizarTipologia = (tip: string): string => {
  const t = tip.trim().toLowerCase();
  if (t.includes('clínica con internación') || t.includes('sanatorio') || t.includes('hospital')) {
    return 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO';
  }
  if (t.includes('salud ambulatorio') || t.includes('salud ambulatoria')) {
    return 'CENTRO DE SALUD AMBULATORIA';
  }
  if (t.includes('cirugía ambulatoria') || t.includes('cirugía')) {
    return 'CENTRO CIRUGÍA AMBULATORIA';
  }
  if (t.includes('geriátrico') || t.includes('ger.')) {
    return 'ESTABLECIMIENTOS GERIÁTRICOS';
  }
  if (t.includes('diálisis') || t.includes('dialisis')) {
    return 'UNIDAD O SERVICIO DE DIÁLISIS';
  }
  if (t.includes('diagnóstico') || t.includes('laboratorio')) {
    return 'LABORATORIO DE ANÁLISIS CLÍNICOS';
  }
  if (t.includes('estética') || t.includes('estetica')) {
    return 'CENTRO DE ESTÉTICA CORPORAL';
  }
  if (t.includes('paliativo')) {
    return 'ESTABLECIMIENTO / UNIDAD DE CUIDADOS PALIATIVOS CON INTERNACIÓN';
  }
  if (t.includes('oncológico') || t.includes('quimio')) {
    return 'HOSPITAL DE DÍA ONCOLÓGICO, CENTRO Y/O SERVICIO DE QUIMIOTERAPIA';
  }
  if (t.includes('óptica') || t.includes('optica')) {
    return 'ÓPTICA Y CONTACTOLOGÍA';
  }
  if (t.includes('radiofísica') || t.includes('radiofisica')) {
    return 'RADIOFISICA';
  }
  if (t.includes('extrahospitalario') || t.includes('ambulancia')) {
    return 'SERVICIO DE ATENCIÓN EXTRAHOSPITALARIO MÓVIL';
  }
  if (t.includes('domiciliaria')) {
    return 'SERVICIO DE INTERNACIÓN DOMICILIARIA';
  }
  if (t.includes('tatuador') || t.includes('tatuaje')) {
    return 'TATUADORES Y PERFORADORES';
  }
  return 'CONSULTORIO';
}

const TIPO_TRAMITES = [
  { key: 'HABILITACION', label: 'HABILITACIÓN', icon: 'gavel', desc: 'Alta de habilitación sanitaria y control edilicio' },
  { key: 'RENOVACION', label: 'RENOVACIÓN', icon: 'sync', desc: 'Renovación periódica de la licencia sanitaria' },
  { key: 'MODIFICACION', label: 'MODIFICACIÓN', icon: 'edit_note', desc: 'Ampliaciones, cambio de firma o de director técnico' },
  { key: 'ADECUACION', label: 'ADECUACIÓN', icon: 'verified', desc: 'Plan de adecuación sanitaria y regularización normativa' },
] as const

export default function ModalIniciarTramite({ isOpen, onClose, onConfirm, defaultTipo, defaultEstablecimientoId }: ModalIniciarTramiteProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTipo, setSelectedTipo] = useState<'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION' | ''>('')
  const [selectedTipologia, setSelectedTipologia] = useState('')
  const [selectedEstId, setSelectedEstId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const isNewEstablishment = selectedTipo === 'ALTA_DIGITAL' || selectedTipo === 'HABILITACION'

  const getFilteredEstablecimientos = () => {
    if (selectedTipo === 'RENOVACION') {
      return ESTABLECIMIENTOS.filter(est => est.estado === 'Próximo a Vencer' || (est as any).proximoAVencer)
    }
    if (selectedTipo === 'MODIFICACION') {
      return ESTABLECIMIENTOS.filter(est => est.estado === 'Habilitado')
    }
    if (selectedTipo === 'ADECUACION') {
      return ESTABLECIMIENTOS
    }
    return ESTABLECIMIENTOS
  }

  const handleConfirmar = () => {
    if (!selectedTipo) return

    if (isNewEstablishment) {
      if (selectedTipologia) {
        onConfirm(selectedTipo, selectedTipologia)
        handleReset()
      }
    } else {
      if (selectedEstId) {
        const est = ESTABLECIMIENTOS.find(e => e.id === selectedEstId)
        // Pass establishment's tipology resolved via mapping
        const resolvedTip = normalizarTipologia(est?.tipologia || 'Consultorio')
        onConfirm(selectedTipo, resolvedTip, selectedEstId)
        handleReset()
      }
    }
  }

  const handleReset = () => {
    setStep(1)
    setSelectedTipo('')
    setSelectedTipologia('')
    setSelectedEstId('')
    setSearchQuery('')
  }

  useEffect(() => {
    if (isOpen) {
      if (defaultTipo) {
        setSelectedTipo(defaultTipo)
        setStep(2)
      }
      if (defaultEstablecimientoId) {
        setSelectedEstId(defaultEstablecimientoId)
      }
    } else {
      handleReset()
    }
  }, [isOpen, defaultTipo, defaultEstablecimientoId])

  const handleCancelar = () => {
    handleReset()
    onClose()
  }

  const handleBack = () => {
    setStep(1)
  }

  const filteredTipologias = Object.keys(TIPOLOGIAS_DATA).filter(key =>
    key.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-4)',
      animation: 'fadeIn 0.25s ease'
    }} onClick={handleCancelar}>
      
      <div className="modal" style={{
        background: 'white',
        borderRadius: 24,
        width: '100%',
        maxWidth: 680,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--color-gray-100)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to bottom, var(--color-gray-50), white)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              background: 'var(--color-brand-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 22 }}>add_business</span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--color-gray-900)' }}>Iniciar Trámite</h3>
              <span style={{ fontSize: 11, color: 'var(--color-gray-500)', fontWeight: 500 }}>
                {step === 1 ? 'Paso 1: Clasificación de Solicitud' : 'Paso 2: Especificar Parámetros'}
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={handleCancelar} style={{
            background: 'var(--color-gray-100)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            <span className="material-icons" style={{ fontSize: 16, color: 'var(--color-gray-600)' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: 'var(--space-6)',
          maxHeight: '70vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)'
        }}>
          
          {/* STEP 1: SELECT TIPO DE TRAMITE */}
          {step === 1 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-gray-500)', textTransform: 'uppercase', display: 'block', marginBottom: 14, letterSpacing: 0.5 }}>
                Elija el tipo de trámite a iniciar
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {TIPO_TRAMITES.map(tipo => {
                  const isSelected = selectedTipo === tipo.key
                  return (
                    <div
                      key={tipo.key}
                      onClick={() => setSelectedTipo(tipo.key)}
                      style={{
                        border: isSelected ? '2px solid var(--color-brand-600)' : '1.5px solid var(--color-gray-200)',
                        background: isSelected ? 'var(--color-brand-50)' : 'white',
                        borderRadius: '16px',
                        padding: 'var(--space-4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(0, 85, 165, 0.08)' : 'none'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-brand-300)'
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-gray-200)'
                      }}
                    >
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        background: isSelected ? 'white' : 'var(--color-gray-5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? 'var(--color-brand-600)' : 'var(--color-gray-600)',
                        boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                        flexShrink: 0
                      }}>
                        <span className="material-icons" style={{ fontSize: 20 }}>{tipo.icon}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: isSelected ? 'var(--color-brand-900)' : 'var(--color-gray-800)' }}>
                          {tipo.label}
                        </div>
                        <div style={{ fontSize: 11, color: isSelected ? 'var(--color-brand-700)' : 'var(--color-gray-500)', lineHeight: 1.35 }}>
                          {tipo.desc}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS (TIPOLOGY FOR NEW OR ESTABLISHMENT LIST FOR EXISTING) */}
          {step === 2 && (
            <>
              {isNewEstablishment ? (
                /* OPTION A: ASK FOR TIPOLOGY */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-gray-500)', textTransform: 'uppercase', display: 'block', marginBottom: 10, letterSpacing: 0.5 }}>
                      Seleccione la Tipología del Establecimiento
                    </label>

                    {/* Search filter for 15 tipologies */}
                    <div style={{ position: 'relative', marginBottom: 12 }}>
                      <span className="material-icons" style={{ position: 'absolute', left: 12, top: 11, color: 'var(--color-gray-400)', fontSize: 18 }}>search</span>
                      <input
                        type="text"
                        placeholder="Buscar tipología por nombre..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 38px',
                          borderRadius: '10px',
                          border: '1.5px solid var(--color-gray-250)',
                          fontSize: 13,
                          fontWeight: 500,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      border: '1px solid var(--color-gray-200)',
                      borderRadius: '14px',
                      padding: 6,
                      background: 'var(--color-gray-50)'
                    }}>
                      {filteredTipologias.length === 0 ? (
                        <div style={{ fontSize: 12, color: 'var(--color-gray-400)', textAlign: 'center', padding: '16px 0' }}>
                          No se encontraron tipologías
                        </div>
                      ) : filteredTipologias.map(key => {
                        const item = TIPOLOGIAS_DATA[key]
                        const isSelected = selectedTipologia === key
                        return (
                          <div
                            key={key}
                            onClick={() => setSelectedTipologia(key)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '8px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: isSelected ? 'var(--color-brand-600)' : 'white',
                              color: isSelected ? 'white' : 'var(--color-gray-800)',
                              border: isSelected ? '1px solid var(--color-brand-700)' : '1px solid var(--color-gray-200)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span className="material-icons" style={{
                              fontSize: 18,
                              color: isSelected ? 'white' : 'var(--color-brand-600)'
                            }}>{item.icon}</span>
                            <span style={{ fontSize: 11.5, fontWeight: 700 }}>{item.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {selectedTipologia && TIPOLOGIAS_DATA[selectedTipologia] && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      background: 'var(--color-gray-50)',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      border: '1px solid var(--color-gray-200)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 16 }}>security_update_good</span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-gray-600)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Requisitos de Tipología</span>
                      </div>

                      {/* Green Alert (Infrastructure Required) */}
                      <div style={{
                        padding: '10px 14px',
                        background: 'white',
                        border: '1.5px solid #a7f3d0',
                        borderRadius: '10px',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'flex-start'
                      }}>
                        <span className="material-icons" style={{ color: '#10b981', fontSize: 16, marginTop: 1 }}>check_circle</span>
                        <div>
                          <div style={{ fontSize: 9.5, fontWeight: 800, color: '#047857', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 1 }}>Requerido / Permitido</div>
                          <div style={{ fontSize: 11.5, color: '#065f46', lineHeight: 1.35, fontWeight: 550 }}>
                            {TIPOLOGIAS_DATA[selectedTipologia].requerida}
                          </div>
                        </div>
                      </div>

                      {/* Red Alert (Infrastructure Prohibited) */}
                      <div style={{
                        padding: '10px 14px',
                        background: 'white',
                        border: '1.5px solid #fecaca',
                        borderRadius: '10px',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'flex-start'
                      }}>
                        <span className="material-icons" style={{ color: '#ef4444', fontSize: 16, marginTop: 1 }}>cancel</span>
                        <div>
                          <div style={{ fontSize: 9.5, fontWeight: 800, color: '#b91c1c', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 1 }}>Restricción (No debe poseer)</div>
                          <div style={{ fontSize: 11.5, color: '#991b1b', lineHeight: 1.35, fontWeight: 550 }}>
                            {TIPOLOGIAS_DATA[selectedTipologia].restricciones}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* OPTION B: CHOOSE AN EXISTING ESTABLISHMENT */
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-gray-500)', textTransform: 'uppercase', display: 'block', marginBottom: 10, letterSpacing: 0.5 }}>
                    Seleccione uno de sus Establecimientos Registrados
                  </label>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    maxHeight: '40vh',
                    overflowY: 'auto',
                    paddingRight: 4
                  }}>
                    {getFilteredEstablecimientos().length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: 13.5, background: 'var(--color-gray-50)', borderRadius: '12px', border: '1px dashed var(--color-gray-300)' }}>
                        No hay establecimientos disponibles para este tipo de trámite.
                      </div>
                    ) : (
                      getFilteredEstablecimientos().map(est => {
                        const isSelected = selectedEstId === est.id
                        return (
                          <div
                            key={est.id}
                            onClick={() => setSelectedEstId(est.id)}
                            style={{
                              border: isSelected ? '2px solid var(--color-brand-600)' : '1.5px solid var(--color-gray-200)',
                              background: isSelected ? 'var(--color-brand-50)' : 'white',
                              borderRadius: '14px',
                              padding: '12px var(--space-4)',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? '0 2px 8px rgba(0, 85, 165, 0.04)' : 'none'
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-brand-300)'
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-gray-200)'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13.5, color: isSelected ? 'var(--color-brand-900)' : 'var(--color-gray-800)' }}>
                                {est.denominacion}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginTop: 2 }}>
                                CUIT: {est.cuit} • Expediente: {est.nroExpediente} • {est.localidad}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                background: est.estado === 'Habilitado' ? '#e6f4ea' : est.estado === 'Próximo a Vencer' ? '#fce8e6' : '#fef7e0',
                                color: est.estado === 'Habilitado' ? '#137333' : est.estado === 'Próximo a Vencer' ? '#c5221f' : '#b06000',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)'
                              }}>
                                {est.estado}
                              </span>
                              {isSelected ? (
                                <span className="material-icons" style={{ color: 'var(--color-brand-600)', fontSize: 20 }}>check_circle</span>
                              ) : (
                                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--color-gray-300)', background: 'white' }} />
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderTop: '1px solid var(--color-gray-100)',
          background: 'var(--color-gray-50)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            {step === 2 && (
              <button
                className="btn"
                onClick={handleBack}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontSize: 13.5,
                  fontWeight: 650,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-gray-600)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
                Atrás
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn"
              onClick={handleCancelar}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: 13.5,
                fontWeight: 650,
                background: 'white',
                border: '1.5px solid var(--color-gray-300)',
                color: 'var(--color-gray-700)',
                transition: 'all 0.2s'
              }}
            >
              CANCELAR
            </button>
            
            {step === 1 ? (
              <button
                className="btn btn-primary"
                disabled={!selectedTipo}
                onClick={() => setStep(2)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                CONTINUAR
                <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={isNewEstablishment ? !selectedTipologia : !selectedEstId}
                onClick={handleConfirmar}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: (isNewEstablishment ? !selectedTipologia : !selectedEstId) ? 'none' : '0 4px 12px rgba(0, 85, 165, 0.25)'
                }}
              >
                INICIAR TRÁMITE
                <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
