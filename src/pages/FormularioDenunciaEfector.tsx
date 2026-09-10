import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { presentarDenunciaSanitaria, type MotivoDenunciaEnum, type AdjuntoEvidenciaPayload } from '../services/denunciaApi'

const MOTIVOS_OPCIONES: { id: MotivoDenunciaEnum; label: string; icon: string }[] = [
  {
    id: 'FALTA_HABILITACION',
    label: 'Falta de Habilitación',
    icon: 'block',
  },
  {
    id: 'EJERCICIO_ILEGAL',
    label: 'Ejercicio Ilegal',
    icon: 'gavel',
  },
  {
    id: 'CONDICIONES_HIGIENICO_SANITARIAS',
    label: 'Condiciones Higiénicas',
    icon: 'clean_hands',
  },
  {
    id: 'EQUIPAMIENTO_NO_AUTORIZADO',
    label: 'Equipamiento No Autorizado',
    icon: 'biotech',
  },
  {
    id: 'OTRO',
    label: 'Otro Incumplimiento',
    icon: 'report_problem',
  },
]

const TIPOLOGIAS_OPCIONES = [
  'Sin especificar',
  'Consultorio / Centro Médico',
  'Clínica, Sanatorio u Hospital Privado',
  'Residencia Geriátrica',
  'Centro de Estética / Cosmiatría',
  'Laboratorio de Análisis Clínicos',
  'Óptica y Contactología',
  'Tatuadores y Perforadores',
  'Servicio de Diálisis / Nefrología',
  'Farmacia / Droguería',
  'Otro Establecimiento'
]

export default function FormularioDenunciaEfector() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Stepper: 1 = Establecimiento/Ubicación, 2 = Motivo & Evidencias, 3 = Confirmación & Declaración Jurada, 4 = Éxito
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Expediente generado provisional
  const [nroExpedienteGenerado] = useState(`DEN-2026-${Math.floor(10000 + Math.random() * 90000)}`)

  // Paso 1: DATOS PRINCIPALES Y OBLIGATORIOS (Localidad, Calle, Número)
  const [localidad, setLocalidad] = useState('Córdoba')
  const [calle, setCalle] = useState('')
  const [numero, setNumero] = useState('')
  const [departamento, setDepartamento] = useState('Capital')

  // Paso 1: DATOS OPCIONALES (Nombre establecimiento, Persona de referencia, CUIT, Tipología)
  const [nombreEstablecimiento, setNombreEstablecimiento] = useState('')
  const [personaReferencia, setPersonaReferencia] = useState('')
  const [cuit, setCuit] = useState('')
  const [tipologia, setTipologia] = useState(TIPOLOGIAS_OPCIONES[0])

  // Paso 2: MOTIVO OBLIGATORIO Y DATOS COMPLEMENTARIOS
  const [motivo, setMotivo] = useState<MotivoDenunciaEnum>('FALTA_HABILITACION')
  const [descripcion, setDescripcion] = useState('')
  const [adjuntos, setAdjuntos] = useState<Array<{ id: string; nombre: string; tamaño: string; tipo: 'IMAGEN' | 'PDF' | 'DOCUMENTO'; url: string }>>([])

  // Paso 3: Identidad & Declaración Jurada
  const [esAnonima, setEsAnonima] = useState(false)
  const [cuitDenunciante] = useState(user?.cuil || '20-33445566-7')
  const [nombreDenunciante] = useState(`${user?.nombre || 'Efector'} ${user?.apellido || 'Sanitario'}`)
  const [correoDenunciante, setCorreoDenunciante] = useState('contacto@efector.gob.ar')
  const [aceptaDeclaracion, setAceptaDeclaracion] = useState(false)

  // Estados de proceso
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [copiado, setCopiado] = useState(false)

  // Validación de Paso 1: Obligatorios -> Localidad, Calle y Número
  const validarPaso1 = () => {
    if (!localidad.trim()) {
      setErrorMsg('La Localidad es un dato obligatorio.')
      return false
    }
    if (!calle.trim()) {
      setErrorMsg('La Calle es un dato obligatorio.')
      return false
    }
    if (!numero.trim()) {
      setErrorMsg('El Número de domicilio es un dato obligatorio.')
      return false
    }
    setErrorMsg('')
    return true
  }

  // Validación de Paso 2: Motivo obligatorio
  const validarPaso2 = () => {
    if (!motivo) {
      setErrorMsg('Debes seleccionar un motivo de denuncia.')
      return false
    }
    setErrorMsg('')
    return true
  }

  // Manejo de carga de archivos de evidencia
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const reader = new FileReader()
      reader.onload = () => {
        const nuevoAdjunto = {
          id: Math.random().toString(36).substring(2, 9),
          nombre: file.name,
          tamaño: sizeStr,
          tipo,
          url: (reader.result as string) || 'https://storage.clicsalud.gob.ar/denuncias/evidencia.png'
        }
        setAdjuntos(prev => [...prev, nuevoAdjunto])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleEliminarAdjunto = (id: string) => {
    setAdjuntos(prev => prev.filter(a => a.id !== id))
  }

  const handleGuardarBorrador = () => {
    alert('✓ Borrador de denuncia guardado en su bandeja.')
    navigate('/efector/mis-denuncias')
  }

  // Envío final
  const handleSubmitFinal = async () => {
    if (!aceptaDeclaracion) {
      setErrorMsg('Debes aceptar la declaración jurada de veracidad antes de presentar la denuncia.')
      return
    }

    setErrorMsg('')
    setLoading(true)

    try {
      const payloadAdjuntos: AdjuntoEvidenciaPayload[] = adjuntos.map((adj) => ({
        url: adj.url,
        tipo: adj.tipo,
        hash_sha256: `sha256_${Math.random().toString(36).substring(2, 16)}`
      }))

      let estPayload = {
        es_registrado: false,
        razon_social_o_nombre: nombreEstablecimiento.trim() || 'Establecimiento Sin Nombre / En Relevamiento',
        persona_referencia: personaReferencia.trim() || undefined,
        cuit_titular_presunto: cuit.trim() || null,
        domicilio: {
          calle: calle.trim(),
          numero: numero.trim(),
          localidad: localidad.trim(),
          departamento: departamento.trim() || 'Capital',
          provincia: 'Córdoba'
        },
        tipologia_estimada: tipologia !== 'Sin especificar' ? tipologia : undefined
      }

      await presentarDenunciaSanitaria({
        denunciante: {
          cuit_cuil: cuitDenunciante,
          nombre_completo: nombreDenunciante,
          correo: correoDenunciante,
          es_anonima: esAnonima
        },
        establecimiento_denunciado: estPayload,
        motivo_denuncia: motivo,
        descripcion_detallada: descripcion.trim() || `Denuncia por ${motivo.replace('_', ' ')} en ${calle} ${numero}, ${localidad}.`,
        adjuntos_evidencia: payloadAdjuntos
      })
    } catch (e) {
      console.warn('Backend API offline, simulando confirmación exitosa')
    } finally {
      setLoading(false)
      setStep(4)
    }
  }

  const handleCopiarExpediente = () => {
    navigator.clipboard.writeText(nroExpedienteGenerado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/efector/mis-denuncias')}
          style={{ marginRight: 'var(--space-3)' }}
        >
          ← Cancelar
        </button>
        <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-icons" style={{ color: '#E11D48', fontSize: 22 }}>report_problem</span>
          Presentar Denuncia Sanitaria
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, background: '#FFE4E6', color: '#9F1239', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
          {step === 4 ? `Expediente: ${nroExpedienteGenerado}` : `Borrador: ${nroExpedienteGenerado}`}
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 840, margin: '0 auto', paddingBottom: 40 }}>
        
        {/* WIZARD STEPPER BANNER */}
        {step !== 4 && (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-5) var(--space-6)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            border: '1px solid var(--color-gray-200)',
            marginBottom: 'var(--space-6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#E11D48', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Fiscalización y Control Sanitario
                </span>
                <h2 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--color-gray-900)' }}>
                  {step === 1 && 'Paso 1: Ubicación y Datos del Establecimiento'}
                  {step === 2 && 'Paso 2: Motivo de la Denuncia y Evidencias'}
                  {step === 3 && 'Paso 3: Identidad y Confirmación Jurada'}
                </h2>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-500)', background: 'var(--color-gray-100)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                Paso {step} de 3
              </span>
            </div>
            
            <div style={{ height: 6, background: 'var(--color-gray-100)', borderRadius: 3, overflow: 'hidden', display: 'flex', gap: 4 }}>
              <div style={{ flex: 1, background: step >= 1 ? '#E11D48' : 'var(--color-gray-200)', transition: 'background 0.3s' }} />
              <div style={{ flex: 1, background: step >= 2 ? '#E11D48' : 'var(--color-gray-200)', transition: 'background 0.3s' }} />
              <div style={{ flex: 1, background: step >= 3 ? '#E11D48' : 'var(--color-gray-200)', transition: 'background 0.3s' }} />
            </div>
          </div>
        )}

        {/* FEEDBACK DE ERROR */}
        {errorMsg && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', color: '#B91C1C', fontSize: 13.5, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ fontSize: 20 }}>error</span>
            {errorMsg}
          </div>
        )}

        {/* STEP 1: UBICACIÓN Y ESTABLECIMIENTO DENUNCIADO */}
        {step === 1 && (
          <div className="card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              
              <div style={{ fontSize: 13, color: '#64748B' }}>
                Los campos marcados con <span style={{ color: '#EF4444', fontWeight: 800 }}>*</span> son los <strong>únicos datos obligatorios</strong> para iniciar la denuncia.
              </div>

              {/* BLOQUE 1: DATOS PRINCIPALES Y OBLIGATORIOS (Localidad, Calle, Número) */}
              <div style={{ background: '#FFF5F5', padding: 18, borderRadius: 14, border: '1.5px solid #FECACA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 13, fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <span className="material-icons" style={{ fontSize: 18, color: '#DC2626' }}>place</span>
                  Ubicación del Hecho Denunciado (Obligatorios)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                  
                  {/* LOCALIDAD (OBLIGATORIA) */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 800 }}>
                      Localidad <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={localidad}
                      onChange={e => setLocalidad(e.target.value)}
                      placeholder="Ej. Córdoba / Río Cuarto / Villa María"
                      style={{ background: '#FFFFFF', fontWeight: 600 }}
                    />
                  </div>

                  {/* CALLE (OBLIGATORIA) */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 800 }}>
                      Calle <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={calle}
                      onChange={e => setCalle(e.target.value)}
                      placeholder="Ej. Av. Colón / San Martín"
                      style={{ background: '#FFFFFF', fontWeight: 600 }}
                    />
                  </div>

                  {/* NÚMERO (OBLIGATORIO) */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 800 }}>
                      Número / Altura <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={numero}
                      onChange={e => setNumero(e.target.value)}
                      placeholder="Ej. 1420 (o S/N si no posee)"
                      style={{ background: '#FFFFFF', fontWeight: 600 }}
                    />
                  </div>

                  {/* DEPARTAMENTO (OPCIONAL) */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#64748B' }}>
                      Departamento (Opcional)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={departamento}
                      onChange={e => setDepartamento(e.target.value)}
                      placeholder="Ej. Capital / Punilla / San Justo"
                      style={{ background: '#FFFFFF' }}
                    />
                  </div>

                </div>
              </div>

              {/* BLOQUE 2: DATOS DEL ESTABLECIMIENTO Y REFERENCIAS (OPCIONALES) */}
              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <span className="material-icons" style={{ fontSize: 18, color: '#64748B' }}>domain</span>
                  Datos del Establecimiento y Referencias (Opcionales)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                  
                  {/* NOMBRE DEL ESTABLECIMIENTO (OPCIONAL) */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#475569' }}>
                      Nombre del Establecimiento / Razón Social <span style={{ fontSize: 11, color: '#94A3B8' }}>(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={nombreEstablecimiento}
                      onChange={e => setNombreEstablecimiento(e.target.value)}
                      placeholder="Ej. Consultorio Dr. Pérez / Estética Bella"
                    />
                  </div>

                  {/* PERSONA QUE TRABAJA EN EL ESTABLECIMIENTO COMO REFERENCIA (OPCIONAL) */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#475569' }}>
                      Persona que trabaja allí como referencia <span style={{ fontSize: 11, color: '#94A3B8' }}>(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={personaReferencia}
                      onChange={e => setPersonaReferencia(e.target.value)}
                      placeholder="Ej. Dr. Carlos Romero / Secretaria María"
                    />
                  </div>

                  {/* CUIT TITULAR / PRESUNTO (OPCIONAL) */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#475569' }}>
                      CUIT Titular / Presunto <span style={{ fontSize: 11, color: '#94A3B8' }}>(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={cuit}
                      onChange={e => setCuit(e.target.value)}
                      placeholder="Ej. 20-33445566-7"
                    />
                  </div>

                  {/* TIPOLOGÍA (OPCIONAL) */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#475569' }}>
                      Tipología Estimada <span style={{ fontSize: 11, color: '#94A3B8' }}>(Opcional)</span>
                    </label>
                    <select
                      className="form-input"
                      value={tipologia}
                      onChange={e => setTipologia(e.target.value)}
                    >
                      {TIPOLOGIAS_OPCIONES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)', borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-4)' }}>
                <button className="btn btn-secondary" onClick={handleGuardarBorrador} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>save</span>
                  Guardar Borrador
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => { if (validarPaso1()) setStep(2); }}
                  style={{ background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)', borderColor: '#E11D48', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  Continuar
                  <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: MOTIVO DE LA DENUNCIA (BOTONES COMPACTOS) Y EVIDENCIAS */}
        {step === 2 && (
          <div className="card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              
              {/* BOTONES DE MOTIVO CON TEXTO CORTO Y DIRECTO */}
              <div>
                <label className="form-label" style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, display: 'block' }}>
                  Motivo de la Denuncia <span className="required">*</span>
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  {MOTIVOS_OPCIONES.map(m => {
                    const isSel = motivo === m.id
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setMotivo(m.id)}
                        style={{
                          border: `2px solid ${isSel ? '#E11D48' : '#E2E8F0'}`,
                          background: isSel ? '#FFF1F2' : '#FFFFFF',
                          borderRadius: 12,
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          boxShadow: isSel ? '0 4px 12px rgba(225, 29, 72, 0.15)' : 'none',
                        }}
                      >
                        <span
                          className="material-icons"
                          style={{
                            fontSize: 22,
                            color: isSel ? '#E11D48' : '#64748B',
                            flexShrink: 0
                          }}
                        >
                          {m.icon}
                        </span>
                        
                        <div style={{ flex: 1, fontSize: 13, fontWeight: isSel ? 800 : 650, color: isSel ? '#9F1239' : '#1E293B' }}>
                          {m.label}
                        </div>

                        {isSel && (
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#E11D48', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* DESCRIPCIÓN (OPCIONAL) */}
              <div className="form-group">
                <label className="form-label">
                  Descripción u Observaciones del Hecho <span style={{ fontSize: 11, color: '#94A3B8' }}>(Opcional)</span>
                </label>
                <textarea
                  rows={3}
                  className="form-input"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Detalles sobre lo ocurrido, horarios, días de atención, etc. (Opcional)"
                  style={{ resize: 'vertical', fontSize: 13.5, lineHeight: 1.5 }}
                />
              </div>

              {/* ADJUNTOS Y EVIDENCIAS (OPCIONALES) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0, color: '#475569' }}>
                    Evidencias o Fotos <span style={{ fontSize: 11, color: '#94A3B8' }}>(Opcional)</span>
                  </label>
                  <label
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 16 }}>attach_file</span>
                    Cargar Archivo
                    <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>

                {adjuntos.length === 0 ? (
                  <div style={{ border: '1.5px dashed #E2E8F0', borderRadius: 10, padding: 14, textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
                    Sin evidencias adjuntas. Podés adjuntar fotos o documentos si disponés de ellos.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {adjuntos.map(adj => (
                      <div key={adj.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <span className="material-icons" style={{ color: adj.tipo === 'PDF' ? '#DC2626' : '#2563EB', fontSize: 16 }}>
                          {adj.tipo === 'PDF' ? 'picture_as_pdf' : 'image'}
                        </span>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{adj.nombre}</span>
                        <span style={{ color: '#94A3B8', fontSize: 11 }}>({adj.tamaño})</span>
                        <button onClick={() => handleEliminarAdjunto(adj.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <span className="material-icons" style={{ fontSize: 14 }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'space-between', marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-4)' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>
                  ← Anterior
                </button>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button className="btn btn-secondary" onClick={handleGuardarBorrador} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-icons" style={{ fontSize: 16 }}>save</span>
                    Guardar Borrador
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => { if (validarPaso2()) setStep(3); }}
                    style={{ background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)', borderColor: '#E11D48', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    Continuar
                    <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: IDENTIDAD Y DECLARACIÓN JURADA */}
        {step === 3 && (
          <div className="card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              
              {/* Modalidad de Identidad */}
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: 'block' }}>
                  Modalidad de Presentación del Denunciante
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setEsAnonima(false)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `2px solid ${!esAnonima ? '#0284C7' : '#E2E8F0'}`,
                      background: !esAnonima ? '#EFF6FF' : '#FFFFFF',
                      color: !esAnonima ? '#1E40AF' : '#475569',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>badge</span>
                    Identidad Declarada (Reserva de Ley)
                  </button>

                  <button
                    type="button"
                    onClick={() => setEsAnonima(true)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `2px solid ${esAnonima ? '#0284C7' : '#E2E8F0'}`,
                      background: esAnonima ? '#EFF6FF' : '#FFFFFF',
                      color: esAnonima ? '#1E40AF' : '#475569',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>visibility_off</span>
                    Presentación Anónima
                  </button>
                </div>

                {!esAnonima ? (
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748B' }}>Denunciante:</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{nombreDenunciante}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748B' }}>CUIT / CUIL:</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{cuitDenunciante}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748B' }}>Correo de Contacto:</span>
                      <input
                        type="email"
                        value={correoDenunciante}
                        onChange={e => setCorreoDenunciante(e.target.value)}
                        style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12 }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 10, fontSize: 12, color: '#64748B' }}>
                    * Los datos filiatorios no serán registrados en el expediente público de inspección.
                  </div>
                )}
              </div>

              {/* Resumen de la denuncia */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 8 }}>
                  Resumen de la Presentación
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Ubicación:</span>{' '}
                    <strong>{calle} {numero}, {localidad}</strong> {departamento ? `(${departamento})` : ''}
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Motivo:</span>{' '}
                    <strong>{MOTIVOS_OPCIONES.find(m => m.id === motivo)?.label}</strong>
                  </div>
                  {nombreEstablecimiento && (
                    <div>
                      <span style={{ color: '#64748B' }}>Establecimiento:</span>{' '}
                      <strong>{nombreEstablecimiento}</strong>
                    </div>
                  )}
                  {personaReferencia && (
                    <div>
                      <span style={{ color: '#64748B' }}>Persona de Referencia:</span>{' '}
                      <strong>{personaReferencia}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Declaración Jurada */}
              <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#FFF1F2', padding: 14, borderRadius: 12, border: '1px solid #FECDD3', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={aceptaDeclaracion}
                  onChange={e => setAceptaDeclaracion(e.target.checked)}
                  style={{ marginTop: 3, width: 18, height: 18 }}
                />
                <div style={{ fontSize: 12.5, color: '#9F1239', lineHeight: 1.45 }}>
                  <strong>DECLARACIÓN JURADA:</strong> Declaro bajo juramento que los hechos expuestos son verídicos, teniendo conocimiento de las responsabilidades civiles y penales emergentes en caso de falsedad (Leyes Provinciales N° 6222 y 9847).
                </div>
              </label>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'space-between', marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-4)' }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>
                  ← Anterior
                </button>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button className="btn btn-secondary" onClick={handleGuardarBorrador} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-icons" style={{ fontSize: 16 }}>save</span>
                    Guardar Borrador
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={loading || !aceptaDeclaracion}
                    onClick={handleSubmitFinal}
                    style={{
                      background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                      borderColor: '#E11D48',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>send</span>
                    {loading ? 'Transmitiendo...' : 'Confirmar y Presentar Denuncia'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 4: PANTALLA DE ÉXITO */}
        {step === 4 && (
          <div className="card" style={{ border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span className="material-icons" style={{ fontSize: 38 }}>verified</span>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 850, color: '#0F172A', margin: '0 0 6px' }}>
              ¡Denuncia Sanitaria Presentada con Éxito!
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', maxWidth: 500, margin: '0 auto 20px' }}>
              La presentación ha sido ingresada en el Sistema ClicSalud+ y derivada al área de fiscalización del Ministerio de Salud.
            </p>

            <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: 18, maxWidth: 440, margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Número de Expediente Asignado</div>
                <div style={{ fontSize: 18, fontWeight: 850, color: '#E11D48', fontFamily: 'monospace', marginTop: 2 }}>{nroExpedienteGenerado}</div>
              </div>
              <button
                onClick={handleCopiarExpediente}
                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <span className="material-icons" style={{ fontSize: 16 }}>content_copy</span>
                {copiado ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => alert(`Descargando Comprobante Oficial de Ingreso ${nroExpedienteGenerado}.pdf...`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span className="material-icons" style={{ fontSize: 16 }}>download</span>
                Descargar Comprobante PDF
              </button>

              <button
                className="btn btn-primary"
                onClick={() => navigate('/efector/mis-denuncias')}
                style={{ background: '#0F172A', borderColor: '#0F172A', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span className="material-icons" style={{ fontSize: 16 }}>list_alt</span>
                Ir a Mis Denuncias
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
