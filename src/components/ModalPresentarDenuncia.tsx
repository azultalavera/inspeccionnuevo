import React, { useState } from 'react'
import { presentarDenunciaSanitaria, type MotivoDenunciaEnum, type AdjuntoEvidenciaPayload } from '../services/denunciaApi'
import { useAuth } from '../context/AuthContext'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (expediente: string) => void
}

const TIPOLOGIAS_OPCIONES = [
  'Consultorio / Centro Médico',
  'Clínica, Sanatorio u Hospital Privado',
  'Residencia Geriátrica',
  'Centro de Estética / Cosmiatría',
  'Laboratorio de Análisis Clínicos',
  'Óptica y Contactología',
  'Tatuadores y Perforadores',
  'Servicio de Diálisis / Nefrología',
  'Farmacia / Droguería',
  'Otro Establecimiento Sanitario'
]

export default function ModalPresentarDenuncia({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth()

  // Pasos del Wizard: 1 = Establecimiento, 2 = Motivo y Evidencia, 3 = Confirmación y Resguardo
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Paso 1: Datos del Establecimiento
  const [razonSocial, setRazonSocial] = useState('')
  const [calle, setCalle] = useState('')
  const [numero, setNumero] = useState('')
  const [localidad, setLocalidad] = useState('Córdoba')
  const [departamento, setDepartamento] = useState('Capital')
  const [tipologia, setTipologia] = useState('Consultorio / Centro Médico')

  // Paso 2: Motivo, Descripción y Evidencias
  const [motivo, setMotivo] = useState<MotivoDenunciaEnum>('FALTA_HABILITACION')
  const [descripcion, setDescripcion] = useState('')
  const [adjuntos, setAdjuntos] = useState<Array<{ id: string; nombre: string; tamaño: string; tipo: 'IMAGEN' | 'PDF' | 'DOCUMENTO'; url: string }>>([])

  // Paso 3: Identidad
  const [esAnonima, setEsAnonima] = useState(false)
  const [cuitDenunciante] = useState(user?.cuil || '20-33445566-7')
  const [nombreDenunciante] = useState(`${user?.nombre || 'Efector'} ${user?.apellido || 'Sanitario'}`)
  const [correoDenunciante] = useState('contacto@efector.gob.ar')

  // Estados de proceso y feedback
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [exitoExpediente, setExitoExpediente] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  if (!isOpen) return null

  // Validación por paso
  const validarPaso1 = () => {
    if (!razonSocial.trim()) {
      setErrorMsg('Debes ingresar la Razón Social o Nombre del establecimiento.')
      return false
    }
    if (!calle.trim()) {
      setErrorMsg('Debes ingresar la calle del domicilio.')
      return false
    }
    if (!localidad.trim()) {
      setErrorMsg('Debes ingresar la localidad.')
      return false
    }
    setErrorMsg('')
    return true
  }

  const validarPaso2 = () => {
    if (descripcion.trim().length < 10) {
      setErrorMsg('La descripción detallada debe contener al menos 10 caracteres explicativos.')
      return false
    }
    setErrorMsg('')
    return true
  }

  const handleSiguiente = () => {
    if (step === 1 && validarPaso1()) {
      setStep(2)
    } else if (step === 2 && validarPaso2()) {
      setStep(3)
    }
  }

  const handleAnterior = () => {
    setErrorMsg('')
    if (step === 3) setStep(2)
    else if (step === 2) setStep(1)
  }

  // Manejo de carga de archivos de evidencia (Simulación interactiva con FileReader)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      let tipo: 'IMAGEN' | 'PDF' | 'DOCUMENTO' = 'DOCUMENTO'
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
        tipo = 'IMAGEN'
      } else if (extension === 'pdf') {
        tipo = 'PDF'
      }

      const sizeKb = (file.size / 1024).toFixed(1)
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKb} KB`

      const reader = new FileReader()
      reader.onload = () => {
        const nuevoAdjunto = {
          id: Math.random().toString(36).substr(2, 9),
          nombre: file.name,
          tamaño: sizeStr,
          tipo,
          url: reader.result as string || 'https://storage.clicsalud.gob.ar/denuncias/evidencia-sample.png'
        }
        setAdjuntos((prev) => [...prev, nuevoAdjunto])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleEliminarAdjunto = (id: string) => {
    setAdjuntos((prev) => prev.filter((a) => a.id !== id))
  }

  // Envío final del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarPaso1() || !validarPaso2()) return

    setErrorMsg('')
    setLoading(true)

    try {
      const payloadAdjuntos: AdjuntoEvidenciaPayload[] = adjuntos.map((adj) => ({
        url: adj.url,
        tipo: adj.tipo,
        hash_sha256: `sha256_${Math.random().toString(36).substr(2, 16)}`
      }))

      const res = await presentarDenunciaSanitaria({
        denunciante: {
          cuit_cuil: cuitDenunciante,
          nombre_completo: nombreDenunciante,
          correo: correoDenunciante,
          es_anonima: esAnonima
        },
        establecimiento_denunciado: {
          razon_social_o_nombre: razonSocial,
          domicilio: {
            calle,
            numero: numero || 'S/N',
            localidad,
            departamento: departamento || 'Capital',
            provincia: 'Córdoba'
          },
          tipologia_estimada: tipologia
        },
        motivo_denuncia: motivo,
        descripcion_detallada: descripcion,
        adjuntos_evidencia: payloadAdjuntos
      })

      if (res.ok) {
        setExitoExpediente(res.data.numero_expediente)
        if (onSuccess) onSuccess(res.data.numero_expediente)
      } else {
        setErrorMsg(res.mensaje || 'Error al procesar el expediente de denuncia.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo conectar con el servidor de denuncias.')
    } finally {
      setLoading(false)
    }
  }

  const handleCerrar = () => {
    setExitoExpediente(null)
    setErrorMsg('')
    setStep(1)
    setRazonSocial('')
    setCalle('')
    setNumero('')
    setDescripcion('')
    setAdjuntos([])
    setEsAnonima(false)
    setCopiado(false)
    onClose()
  }

  const handleCopiarExpediente = () => {
    if (exitoExpediente) {
      navigator.clipboard.writeText(exitoExpediente)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    }
  }

  const getMotivoLabel = (m: MotivoDenunciaEnum) => {
    switch (m) {
      case 'FALTA_HABILITACION': return 'Falta de Habilitación / Local Clandestino'
      case 'EJERCICIO_ILEGAL': return 'Ejercicio Ilegal / Personal Sin Matrícula'
      case 'CONDICIONES_HIGIENICO_SANITARIAS': return 'Deficiencias Higiénico-Sanitarias Graves'
      case 'EQUIPAMIENTO_NO_AUTORIZADO': return 'Equipamiento o Insumos No Autorizados'
      default: return 'Otro Incumplimiento Normativo'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* ENCABEZADO MODAL */}
        <div style={{
          padding: '24px 28px 20px 28px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)',
          color: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(251, 191, 36, 0.2)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                color: '#fef08a',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}>
                <span className="material-icons" style={{ fontSize: '14px' }}>gavel</span>
                FISCALIZACIÓN SANITARIA CONSTITUTIVA
              </div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Presentar Denuncia Sanitaria
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', opacity: 0.9, lineHeight: '1.4' }}>
                Registro oficial de hechos anómalos o de clandestinidad para actuación sumarial e inspección in situ.
              </p>
            </div>
            <button
              onClick={handleCerrar}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Cerrar ventana"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* STEPPER INDICATOR (Solo si no terminó con éxito) */}
          {!exitoExpediente && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              {/* Paso 1 Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: step === 1 ? 1 : 0.65,
                background: step === 1 ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                padding: '6px 10px',
                borderRadius: '10px'
              }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: step >= 1 ? '#00b4d8' : 'rgba(255,255,255,0.3)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  {step > 1 ? <span className="material-icons" style={{ fontSize: '14px' }}>check</span> : '1'}
                </div>
                <span style={{ fontSize: '12px', fontWeight: step === 1 ? 700 : 500 }}>Establecimiento</span>
              </div>

              {/* Paso 2 Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: step === 2 ? 1 : 0.65,
                background: step === 2 ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                padding: '6px 10px',
                borderRadius: '10px'
              }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: step >= 2 ? '#00b4d8' : 'rgba(255,255,255,0.3)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  {step > 2 ? <span className="material-icons" style={{ fontSize: '14px' }}>check</span> : '2'}
                </div>
                <span style={{ fontSize: '12px', fontWeight: step === 2 ? 700 : 500 }}>Motivo & Fotos</span>
              </div>

              {/* Paso 3 Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: step === 3 ? 1 : 0.65,
                background: step === 3 ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                padding: '6px 10px',
                borderRadius: '10px'
              }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: step === 3 ? '#00b4d8' : 'rgba(255,255,255,0.3)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  3
                </div>
                <span style={{ fontSize: '12px', fontWeight: step === 3 ? 700 : 500 }}>Confirmación</span>
              </div>
            </div>
          )}
        </div>

        {/* CUERPO DEL MODAL */}
        <div style={{ padding: '24px' }}>
          {exitoExpediente ? (
            /* PANTALLA DE ÉXITO */
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 10px 20px rgba(22, 163, 74, 0.2)'
              }}>
                <span className="material-icons" style={{ fontSize: '42px' }}>verified</span>
              </div>

              <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                ¡Denuncia Sanitaria Registrada!
              </h4>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                Se ha firmado e inmutabilizado el expediente digital para la intervención del cuerpo fiscalizador.
              </p>

              {/* CARD EXPEDIENTE DIGITAL */}
              <div style={{
                background: '#f8fafc',
                border: '2px dashed #38bdf8',
                borderRadius: '16px',
                padding: '20px',
                maxWidth: '440px',
                margin: '0 auto 20px auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px' }}>
                  Número de Expediente Electrónico
                </div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0284c7',
                  margin: '8px 0 12px 0',
                  letterSpacing: '1.5px',
                  fontFamily: 'monospace'
                }}>
                  {exitoExpediente}
                </div>

                <button
                  type="button"
                  onClick={handleCopiarExpediente}
                  style={{
                    background: copiado ? '#16a34a' : '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '16px' }}>
                    {copiado ? 'check' : 'content_copy'}
                  </span>
                  {copiado ? '¡Expediente Copiado!' : 'Copiar Número de Expediente'}
                </button>
              </div>

              {/* DETALLES RESUMIDOS */}
              <div style={{
                background: '#eff6ff',
                borderRadius: '12px',
                padding: '14px 18px',
                textAlign: 'left',
                fontSize: '12px',
                color: '#1e3a8a',
                border: '1px solid #bfdbfe',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span className="material-icons" style={{ color: '#2563eb', fontSize: '20px', marginTop: '2px' }}>info</span>
                <div>
                  <strong>Próximos Pasos:</strong> La denuncia ingresa inmediatamente a la bandeja de derivación prioritaria del Ministerio de Salud. Si registraste la denuncia con resguardo de identidad, tus datos no figurarán en la orden de inspección física.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleCerrar}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontWeight: 700,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)',
                    fontSize: '14px'
                  }}
                >
                  Finalizar y Cerrar
                </button>
              </div>
            </div>
          ) : (
            /* FORMULARIO POR PASOS */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {errorMsg && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span className="material-icons" style={{ fontSize: '20px', color: '#dc2626' }}>error_outline</span>
                  <div style={{ fontWeight: 600 }}>{errorMsg}</div>
                </div>
              )}

              {/* ==================== PASO 1: ESTABLECIMIENTO ==================== */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    borderLeft: '4px solid #0284c7',
                    paddingLeft: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        Paso 1: Identificación del Establecimiento Denunciado
                      </h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Indica los datos de ubicación del local o prestador no regularizado.
                      </p>
                    </div>
                  </div>

                  {/* Campo Razón Social */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Razón Social o Nombre Fantasía *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Clínica San Martín / Consultorio Odontológico Sin Cartel"
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      style={{ borderRadius: '10px', padding: '10px 14px', fontSize: '14px' }}
                      required
                    />
                  </div>

                  {/* Campos Calle y Número */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                        Calle / Domicilio *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Av. Colón"
                        value={calle}
                        onChange={(e) => setCalle(e.target.value)}
                        style={{ borderRadius: '10px', padding: '10px 14px', fontSize: '14px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                        Número / Altura
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: 1234 o S/N"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        style={{ borderRadius: '10px', padding: '10px 14px', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  {/* Campos Localidad y Departamento */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                        Localidad *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Córdoba"
                        value={localidad}
                        onChange={(e) => setLocalidad(e.target.value)}
                        style={{ borderRadius: '10px', padding: '10px 14px', fontSize: '14px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                        Departamento / Zonal
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Capital / Punilla"
                        value={departamento}
                        onChange={(e) => setDepartamento(e.target.value)}
                        style={{ borderRadius: '10px', padding: '10px 14px', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  {/* Tipología Estimada */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Tipología Sanitaria Estimada
                    </label>
                    <select
                      className="form-control"
                      value={tipologia}
                      onChange={(e) => setTipologia(e.target.value)}
                      style={{ borderRadius: '10px', padding: '10px 14px', fontSize: '14px' }}
                    >
                      {TIPOLOGIAS_OPCIONES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ==================== PASO 2: MOTIVO, DETALLE Y EVIDENCIAS ==================== */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    borderLeft: '4px solid #0284c7',
                    paddingLeft: '12px'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      Paso 2: Motivo y Evidencia Documental
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      Describe la infracción observada y adjunta fotografías o comprobantes si dispones de ellos.
                    </p>
                  </div>

                  {/* Selección de Motivo Principal */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Motivo Principal de la Denuncia *
                    </label>
                    <select
                      className="form-control"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value as MotivoDenunciaEnum)}
                      style={{ borderRadius: '10px', padding: '10px 14px', fontSize: '14px' }}
                    >
                      <option value="FALTA_HABILITACION">Falta de Habilitación Sanitaria / Local Clandestino</option>
                      <option value="EJERCICIO_ILEGAL">Ejercicio Ilegal de la Medicina / Personal Sin Matrícula</option>
                      <option value="CONDICIONES_HIGIENICO_SANITARIAS">Deficiencias Higiénico-Sanitarias Graves</option>
                      <option value="EQUIPAMIENTO_NO_AUTORIZADO">Equipamiento o Insumos No Autorizados</option>
                      <option value="OTRO">Otro Incumplimiento Normativo</option>
                    </select>
                  </div>

                  {/* Área de Descripción */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                        Descripción Detallada de los Hechos *
                      </label>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: descripcion.trim().length >= 10 ? '#16a34a' : '#ef4444'
                      }}>
                        {descripcion.trim().length} / mín. 10 caract.
                      </span>
                    </div>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Describa detalladamente lo observado: horarios de atención, profesionales involucrados, instrumental, falta de desinfección o elementos irregulares..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      style={{ borderRadius: '12px', padding: '12px', fontSize: '13px', lineHeight: '1.5' }}
                      required
                    ></textarea>
                  </div>

                  {/* CARGA DE EVIDENCIA ADJUNTA */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Adjuntar Evidencia (Fotografías / Recibos / Documentos)
                    </label>

                    <div style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '14px',
                      padding: '16px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="file"
                        id="fileInput"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}>
                        <span className="material-icons" style={{ fontSize: '32px', color: '#0284c7', marginBottom: '4px' }}>cloud_upload</span>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                          Haz clic o arrastra archivos aquí para adjuntar
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          Formatos admitidos: JPG, PNG, WEBP, PDF (Máx. 10 MB por archivo)
                        </div>
                      </label>
                    </div>

                    {/* LISTA DE ARCHIVOS ADJUNTOS */}
                    {adjuntos.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Archivos Adjuntos ({adjuntos.length}):
                        </div>
                        {adjuntos.map((adj) => (
                          <div key={adj.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            fontSize: '12px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="material-icons" style={{ color: adj.tipo === 'IMAGEN' ? '#0284c7' : '#ef4444', fontSize: '20px' }}>
                                {adj.tipo === 'IMAGEN' ? 'image' : 'picture_as_pdf'}
                              </span>
                              <div>
                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{adj.nombre}</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>{adj.tamaño}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleEliminarAdjunto(adj.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex'
                              }}
                              title="Eliminar archivo"
                            >
                              <span className="material-icons" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== PASO 3: CONFIRMACIÓN Y ANONIMATO ==================== */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    borderLeft: '4px solid #0284c7',
                    paddingLeft: '12px'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      Paso 3: Confirmación y Resguardo de Identidad
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      Revisa la información antes de generar el acta de denuncia digital.
                    </p>
                  </div>

                  {/* CARDA DE RESGUARDO DE IDENTIDAD */}
                  <div style={{
                    background: esAnonima ? '#f0fdf4' : '#eff6ff',
                    border: `1.5px solid ${esAnonima ? '#86efac' : '#bfdbfe'}`,
                    borderRadius: '16px',
                    padding: '16px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: esAnonima ? '#dcfce7' : '#dbeafe',
                          color: esAnonima ? '#16a34a' : '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <span className="material-icons" style={{ fontSize: '24px' }}>
                            {esAnonima ? 'lock' : 'security'}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: esAnonima ? '#14532d' : '#1e3a8a' }}>
                            {esAnonima ? 'Resguardo de Identidad Activado (Denuncia Anónima)' : 'Denuncia con Identidad Registrada'}
                          </div>
                          <div style={{ fontSize: '12px', color: esAnonima ? '#15803d' : '#1d4ed8', marginTop: '2px' }}>
                            {esAnonima
                              ? 'Tus datos personales quedarán encriptados y no se revelarán en la orden de inspección in situ.'
                              : 'La denuncia incluirá tu firma digital de efector sanitario para mayor validez legal.'}
                          </div>
                        </div>
                      </div>

                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        background: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid #cbd5e1',
                        fontWeight: 700,
                        fontSize: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                        userSelect: 'none'
                      }}>
                        <input
                          type="checkbox"
                          checked={esAnonima}
                          onChange={(e) => setEsAnonima(e.target.checked)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#16a34a' }}
                        />
                        Hacer Anónima
                      </label>
                    </div>
                  </div>

                  {/* RESUMEN PRE-ENVÍO */}
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '14px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                      Resumen del Expediente a Firmar:
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Denunciado:</span>
                        <strong style={{ color: '#0f172a' }}>{razonSocial}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Ubicación:</span>
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{calle} {numero}, {localidad}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Motivo Infracción:</span>
                        <strong style={{ color: '#0284c7' }}>{getMotivoLabel(motivo)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Evidencias Adjuntas:</span>
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{adjuntos.length} archivo(s)</span>
                      </div>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Detalle de lo observado:</span>
                      <p style={{ margin: '4px 0 0 0', color: '#334155', fontStyle: 'italic', fontSize: '12px' }}>
                        "{descripcion}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BOTONES DE NAVEGACIÓN Y ACCIÓN */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0'
              }}>
                {step > 1 ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleAnterior}
                    disabled={loading}
                    style={{ borderRadius: '10px', padding: '10px 18px', fontWeight: 600 }}
                  >
                    ← Anterior
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleCerrar}
                    disabled={loading}
                    style={{ borderRadius: '10px', padding: '10px 18px', fontWeight: 600 }}
                  >
                    Cancelar
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSiguiente}
                    style={{
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)',
                      border: 'none',
                      padding: '10px 22px',
                      fontWeight: 700,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      border: 'none',
                      padding: '12px 28px',
                      fontWeight: 800,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="material-icons spin" style={{ fontSize: '18px' }}>refresh</span>
                        Generando Expediente...
                      </>
                    ) : (
                      <>
                        <span className="material-icons" style={{ fontSize: '20px' }}>gavel</span>
                        Firmar y Registrar Denuncia
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
