import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function FormularioHabilitacion() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tramites } = useApp()

  // Find the trámite or mock fallback
  const tramite = tramites.find(t => t.id === id) || {
    id: 'TRM-NEW',
    nroTramite: 'TR-PENDIENTE',
    nroExpediente: 'EXP-PENDIENTE',
    denominacion: 'Establecimiento Nuevo (Borrador)',
    cuit: '30-99999999-9',
    tipologia: 'Consultorio',
    domicilio: 'Calle Falsa 123',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'PENDIENTE_ARQUITECTURA',
    tipoTramite: 'HABILITACION' as const,
  }

  const TIPO_LABELS: Record<string, string> = {
    ALTA_DIGITAL: 'Alta Digital',
    HABILITACION: 'Habilitación',
    RENOVACION: 'Renovación',
    MODIFICACION: 'Modificación',
    ADECUACION: 'Adecuación',
  }
  const tipoLabel = TIPO_LABELS[tramite.tipoTramite || ''] || 'Habilitación'

  // Wizard Step State: 1 | 2 | 3
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Form State
  const [denominacion, setDenominacion] = useState(tramite.denominacion)
  const [cuit, setCuit] = useState(tramite.cuit)
  const [domicilio, setDomicilio] = useState(tramite.domicilio)
  const [localidad, setLocalidad] = useState(tramite.localidad)
  const [departamento, setDepartamento] = useState(tramite.departamento || 'Capital')

  // Mock Upload state for Step 2
  const [docs, setDocs] = useState<Record<string, boolean>>({
    planos: false,
    bomberos: false,
    responsable: false,
  })

  const handleGuardarBorrador = () => {
    alert('✓ Borrador guardado localmente en su bandeja.')
    navigate('/efector/bandeja')
  }

  const handleEnviarTramite = () => {
    alert('✓ Trámite de habilitación enviado al Ministerio de Salud con éxito.')
    navigate('/efector/bandeja')
  }

  return (
    <>
      <div className="topbar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/efector/home')} style={{ marginRight: 'var(--space-3)' }}>
          ← Cancelar
        </button>
        <div className="topbar-title">Iniciar {tipoLabel}</div>
        <div style={{ fontSize: 13, color: 'var(--color-gray-500)', fontWeight: 600, background: 'var(--color-gray-150)', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
          Borrador: {tramite.nroTramite}
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Wizard Stepper Banner */}
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
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-brand-600)', textTransform: 'uppercase' }}>Habilitación Sanitaria</span>
              <h2 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800 }}>
                {step === 1 && 'Paso 1: Datos del Establecimiento'}
                {step === 2 && 'Paso 2: Adjuntar Documentación Obligatoria'}
                {step === 3 && 'Paso 3: Confirmación y Declaración Jurada'}
              </h2>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-500)', background: 'var(--color-gray-100)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
              Paso {step} de 3
            </span>
          </div>
          
          <div style={{ height: 6, background: 'var(--color-gray-100)', borderRadius: 3, overflow: 'hidden', display: 'flex', gap: 4 }}>
            <div style={{ flex: 1, background: step >= 1 ? 'var(--color-brand-600)' : 'var(--color-gray-200)', transition: 'background 0.3s' }} />
            <div style={{ flex: 1, background: step >= 2 ? 'var(--color-brand-600)' : 'var(--color-gray-200)', transition: 'background 0.3s' }} />
            <div style={{ flex: 1, background: step >= 3 ? 'var(--color-brand-600)' : 'var(--color-gray-200)', transition: 'background 0.3s' }} />
          </div>
        </div>

        {/* STEP 1: DATOS DEL ESTABLECIMIENTO */}
        {step === 1 && (
          <div className="card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              
              <div style={{ padding: 'var(--space-4)', background: 'var(--color-brand-50)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-brand-100)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <span className="material-icons" style={{ color: 'var(--color-brand-600)' }}>info</span>
                  <div style={{ fontSize: 13, color: 'var(--color-brand-800)', lineHeight: 1.5 }}>
                    Los datos ingresados corresponden al trámite preventivo de habilitación. Verificá que la tipología declarada sea la correspondiente antes de avanzar.
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Denominación del Establecimiento <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={denominacion}
                    onChange={e => setDenominacion(e.target.value)}
                    placeholder="Ej. Consultorio Médico San Martín"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CUIT Titular / Razón Social <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={cuit}
                    onChange={e => setCuit(e.target.value)}
                    placeholder="30-XXXXXXXX-X"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Trámite (Bloqueado)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={tipoLabel}
                      disabled
                      style={{
                        background: 'var(--color-gray-100)',
                        color: 'var(--color-gray-600)',
                        border: '1.5px solid var(--color-gray-300)',
                        cursor: 'not-allowed',
                        paddingRight: '40px',
                        fontWeight: 600
                      }}
                    />
                    <span className="material-icons" style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-gray-400)',
                      fontSize: 20
                    }}>
                      lock
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipología de Habilitación (Bloqueada)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={tramite.tipologia}
                      disabled
                      style={{
                        background: 'var(--color-gray-100)',
                        color: 'var(--color-gray-600)',
                        border: '1.5px solid var(--color-gray-300)',
                        cursor: 'not-allowed',
                        paddingRight: '40px',
                        fontWeight: 600
                      }}
                    />
                    <span className="material-icons" style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-gray-400)',
                      fontSize: 20
                    }}>
                      lock
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-gray-500)', marginTop: 4 }}>
                    El tipo de trámite y tipología no se pueden editar. Si desea cambiarlos, cancele el borrador e inicie uno nuevo.
                  </span>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Domicilio Real (Calle, Número, Piso, Dpto) <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={domicilio}
                    onChange={e => setDomicilio(e.target.value)}
                    placeholder="Ej. Av. Colón 1250, Piso 3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Localidad <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={localidad}
                    onChange={e => setLocalidad(e.target.value)}
                    placeholder="Ej. Córdoba"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Departamento <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={departamento}
                    onChange={e => setDepartamento(e.target.value)}
                    placeholder="Ej. Capital"
                  />
                </div>

              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-4)' }}>
                <button className="btn btn-secondary" onClick={handleGuardarBorrador} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>save</span>
                  Guardar
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!denominacion.trim() || !cuit.trim() || !domicilio.trim() || !localidad.trim() || !departamento.trim()}
                  onClick={() => setStep(2)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  Continuar
                  <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: ADJUNTAR DOCUMENTACIÓN */}
        {step === 2 && (
          <div className="card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              
              <div style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>
                Cargá la documentación requerida obligatoria correspondiente a la tipología <strong>{tramite.tipologia}</strong>. Los archivos deben estar en formato PDF o imagen.
              </div>

              {[
                { key: 'planos', label: 'Planos de Arquitectura aprobados por el Municipio o Colegio profesional', desc: 'Obligatorio. Planos de escala o croquis reglamentario.' },
                { key: 'bomberos', label: 'Certificación / Informe de Bomberos vigente', desc: 'Obligatorio. Aprobación de seguridad contra incendios.' },
                { key: 'responsable', label: 'Título del Responsable Técnico / Habilitación Profesional', desc: 'Obligatorio. Matrícula habilitante del director médico / técnico.' },
              ].map(item => (
                <div key={item.key} style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1.5px solid var(--color-gray-200)',
                  background: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 'var(--space-4)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-gray-800)' }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <div>
                    {docs[item.key] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-icons" style={{ fontSize: 14 }}>check_circle</span>
                          Cargado
                        </span>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDocs(p => ({ ...p, [item.key]: false }))}>✕ Quitar</button>
                      </div>
                    ) : (
                      <button className="btn btn-secondary btn-sm" onClick={() => setDocs(p => ({ ...p, [item.key]: true }))} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span className="material-icons" style={{ fontSize: 16 }}>attach_file</span>
                        Adjuntar
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-4)' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>
                  Atrás
                </button>
                <button className="btn btn-secondary" onClick={handleGuardarBorrador} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>save</span>
                  Guardar
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!docs.planos || !docs.bomberos || !docs.responsable}
                  onClick={() => setStep(3)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  Continuar
                  <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMACIÓN Y DECLARACIÓN JURADA */}
        {step === 3 && (
          <div className="card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              
              <div style={{ padding: 'var(--space-4)', background: '#fffbeb', borderRadius: 'var(--radius-xl)', border: '1px solid #fef3c7' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons">gavel</span>
                  Declaración Jurada de Habilitación
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
                  Al presionar "Enviar Trámite", declaro bajo juramento que los datos de infraestructura provistos, el domicilio real y la documentación anexa son fidedignos y se adecúan a los requerimientos de la tipología <strong>{tramite.tipologia}</strong> del Ministerio de Salud. La falsedad de los mismos anulará automáticamente el trámite.
                </p>
              </div>

              <div className="card" style={{ border: '1px solid var(--color-gray-200)' }}>
                <div className="card-header">
                  <h3>Resumen del Establecimiento</h3>
                </div>
                <div className="card-body" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 13 }}>
                    <div><strong>Nombre:</strong> {denominacion}</div>
                    <div><strong>CUIT:</strong> {cuit}</div>
                    <div><strong>Tipología:</strong> {tramite.tipologia}</div>
                    <div><strong>Localidad:</strong> {localidad} ({departamento})</div>
                    <div style={{ gridColumn: 'span 2' }}><strong>Domicilio:</strong> {domicilio}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-4)' }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>
                  Atrás
                </button>
                <button className="btn btn-secondary" onClick={handleGuardarBorrador} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>save</span>
                  Guardar
                </button>
                <button className="btn btn-primary" onClick={handleEnviarTramite} style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>send</span>
                  Enviar Trámite
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  )
}
