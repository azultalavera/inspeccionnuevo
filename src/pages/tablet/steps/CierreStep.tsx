import React, { useState, useRef, useEffect } from 'react'
import type { StepProps } from '../InspeccionShell'
import { useNavigate } from 'react-router-dom'
import { OPCIONES_EMPLAZAMIENTO } from '../../../data/mockData'
import { useApp } from '../../../context/AppContext'

const OPCIONES_EMPLAZAMIENTO_RUTINA = [
  { id: 'E24H', label: '24 hs', horas: 24 },
  { id: 'E48H', label: '48 hs', horas: 48 },
  { id: 'E3D',  label: '3 días',  horas: 72 },
  { id: 'E5D',  label: '5 días',  horas: 120 },
  { id: 'E10D', label: '10 días', horas: 240 },
  { id: 'E15D', label: '15 días', horas: 360 },
]

type Dictamen = 'APRUEBA' | 'APRUEBA_OBS' | 'NO_APRUEBA'

interface FirmaState {
  responsable: string | null
  inspector: string | null
}

function SignaturePad({ label, onSign }: { label: string; onSign: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [signed, setSigned] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.strokeStyle = '#1C1C1E'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current!
    const pos = getPos(e, canvas)
    setDrawing(true)
    lastPos.current = pos
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    if (!drawing || !lastPos.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
    setSigned(true)
  }

  const stopDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    setDrawing(false)
    lastPos.current = null
    if (signed) {
      onSign(canvasRef.current!.toDataURL())
    }
  }

  const clear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSigned(false)
    onSign('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-gray-700)' }}>{label}</div>
        <button onClick={clear} style={{ fontSize: 12, color: 'var(--ios-red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', fontWeight: 600 }}>
          Limpiar
        </button>
      </div>
      <div className={`signature-pad-wrap ${signed ? 'signed' : ''}`} style={{ height: 130 }}>
        <canvas
          ref={canvasRef}
          width={680}
          height={130}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        <div className="signature-pad-hint">✍️ Firmá aquí</div>
      </div>
    </div>
  )
}

export default function CierreStep({ onPrev, tramiteId }: StepProps) {
  const navigate = useNavigate()
  const { tramites } = useApp()
  const tramite = tramites.find(t => t.id === tramiteId)
  const esRutina = tramite?.tipoInspeccion === 'RUTINA'

  const [cuil, setCuil] = useState('')
  const [cuilValido, setCuilValido] = useState<boolean | null>(null)
  const [cargo, setCargo] = useState('')
  const [formatoInsp] = useState<'PRESENCIAL' | 'VIRTUAL'>('PRESENCIAL')
  const [firmas, setFirmas] = useState<FirmaState>({ responsable: null, inspector: null })
  const [notas, setNotas] = useState('')
  const [dictamen, setDictamen] = useState<Dictamen | null>(null)

  // No Aprobación Modal
  const [showNoAprobacionModal, setShowNoAprobacionModal] = useState(false)
  const [noAprobacionAccion, setNoAprobacionAccion] = useState<'COORDINADOR' | 'EFECTOR' | null>(null)
  const [showNoAprobacionExito, setShowNoAprobacionExito] = useState(false)

  // Pantallas de confirmación
  const [showAprobacionExito, setShowAprobacionExito] = useState(false)

  const validarCuil = () => {
    if (cuil.replace(/-/g, '').length >= 11) {
      setCuilValido(true)
    } else {
      setCuilValido(false)
    }
  }



  // ── PANTALLA DE ÉXITO: APROBACIÓN ──────────────────────────────────
  if (showAprobacionExito) {
    const esConObs = dictamen === 'APRUEBA_OBS'
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 'var(--space-5)', padding: 'var(--space-6)',
        textAlign: 'center'
      }}>
        {/* Ícono de éxito */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: esConObs ? 'rgba(255,149,0,0.12)' : 'rgba(52,199,89,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 1.5s ease-in-out'
        }}>
          <span className="material-icons" style={{
            fontSize: 44,
            color: esConObs ? 'var(--ios-orange)' : 'var(--ios-green)'
          }}>
            {esConObs ? 'check_circle_outline' : 'check_circle'}
          </span>
        </div>

        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: 6 }}>
            {esConObs ? 'Aprobado con Observaciones' : esRutina ? 'Inspección por Rutina Correcta' : 'Inspección Aprobada'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--ios-gray)', lineHeight: 1.5 }}>
            {esRutina 
              ? 'El acta fue firmada y cerrada correctamente. La inspección por rutina es correcta.' 
              : 'El acta fue firmada y cerrada correctamente.'}
            {esConObs && ' Se registraron observaciones menores.'}
          </div>
        </div>

        {/* Resumen */}
        <div style={{
          width: '100%', background: 'var(--ios-gray6)', borderRadius: 16,
          padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 10,
          textAlign: 'left'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ios-gray)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Resumen del Acta
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--ios-gray)' }}>Dictamen:</span>
            <span style={{ fontWeight: 700, color: esConObs ? 'var(--ios-orange)' : 'var(--ios-green)' }}>
              {esConObs ? 'Aprueba con Observaciones' : esRutina ? 'Aprobada (Correcta)' : 'Aprueba'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--ios-gray)' }}>Fecha y hora:</span>
            <span style={{ fontWeight: 600 }}>
              {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--ios-gray)' }}>Firmantes:</span>
            <span style={{ fontWeight: 600 }}>Juan Martín García · Dra. Valeria Romero</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--ios-gray)' }}>Próximo estado:</span>
            <span style={{ fontWeight: 700, color: '#059669' }}>Aceptado Inspección</span>
          </div>
        </div>

        {notas.trim() && (
          <div style={{
            width: '100%', background: 'white', borderRadius: 12,
            border: '1px solid var(--ios-gray5)', padding: 'var(--space-3)',
            textAlign: 'left', fontSize: 13, color: 'var(--color-gray-700)', lineHeight: 1.5
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ios-gray)', textTransform: 'uppercase', marginBottom: 6 }}>
              Notas del Inspector
            </div>
            {notas}
          </div>
        )}

        <button
          className="btn-ios btn-ios-primary"
          onClick={() => navigate('/inspector/inspecciones')}
          style={{ width: '100%', fontSize: 16, fontWeight: 700 }}
        >
          <span className="material-icons" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>home</span>
          Volver a Bandeja
        </button>
      </div>
    )
  }

  // ── PANTALLA DE ÉXITO: NO APROBACIÓN CONFIRMADA ─────────────────────
  if (showNoAprobacionExito) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 'var(--space-5)', padding: 'var(--space-6)',
        textAlign: 'center'
      }}>
        {/* Ícono */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,59,48,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span className="material-icons" style={{ fontSize: 44, color: 'var(--ios-red)' }}>
            {noAprobacionAccion === 'COORDINADOR' ? 'gavel' : 'autorenew'}
          </span>
        </div>

        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: 6 }}>
            Inspección No Aprobada
          </div>
          <div style={{ fontSize: 14, color: 'var(--ios-gray)', lineHeight: 1.5 }}>
            El acta fue cerrada correctamente.
            <br />
            {noAprobacionAccion === 'COORDINADOR' 
              ? 'Se ha derivado el caso al Coordinador para iniciar la baja del establecimiento.' 
              : 'Se ha notificado al efector para que inicie un trámite de Renovación / Modificación.'}
          </div>
        </div>

        {/* Resumen */}
        <div style={{
          width: '100%', background: '#FEF2F2', borderRadius: 16,
          border: '1px solid rgba(255,59,48,0.2)',
          padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 10,
          textAlign: 'left'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ios-red)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Detalle de Derivación
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--ios-gray)' }}>Dictamen:</span>
            <span style={{ fontWeight: 700, color: 'var(--ios-red)' }}>
              No Aprobada
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--ios-gray)' }}>Derivado a:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-gray-800)' }}>
              {noAprobacionAccion === 'COORDINADOR' ? 'Coordinador' : 'Efector'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--ios-gray)' }}>Acción requerida:</span>
            <span style={{ fontWeight: 700, color: 'var(--ios-red)' }}>
              {noAprobacionAccion === 'COORDINADOR' 
                ? 'Dar de baja el establecimiento' 
                : 'Iniciar trámite de Renovación / Modificación'}
            </span>
          </div>
        </div>

        <button
          className="btn-ios btn-ios-primary"
          onClick={() => navigate('/inspector/inspecciones')}
          style={{ width: '100%', fontSize: 16, fontWeight: 700 }}
        >
          <span className="material-icons" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>home</span>
          Volver a Bandeja
        </button>
      </div>
    )
  }

  // ── FORMULARIO PRINCIPAL ────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      {/* Step 1: CUIL */}
      <div className="ios-section-header">1. Identificación del Responsable</div>
      <div className="ios-card-group" style={{ padding: 'var(--space-4)' }}>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ fontSize: 14, color: 'var(--color-gray-700)', marginBottom: 'var(--space-2)', fontWeight: 500 }}>CUIL del Responsable del Establecimiento</div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              className="ios-input"
              value={cuil}
              onChange={e => { setCuil(e.target.value); setCuilValido(null) }}
              placeholder="20-12345678-9"
              style={{ flex: 1, background: 'var(--ios-gray6)', border: cuilValido === false ? '2px solid var(--ios-red)' : cuilValido === true ? '2px solid var(--ios-green)' : 'none' }}
            />
            <button
              onClick={validarCuil}
              className="btn-ios btn-ios-primary"
              style={{ width: 'auto', padding: '14px 20px', flexShrink: 0 }}
            >
              Validar
            </button>
          </div>
          {cuilValido === false && (
            <div style={{ color: 'var(--ios-red)', fontSize: 13, marginTop: 'var(--space-2)' }}>
              ⚠️ El Responsable debe contar con CiDi Nivel 2 verificado para firmar el acta.
            </div>
          )}
          {cuilValido === true && (
            <div style={{ color: 'var(--ios-green)', fontSize: 13, marginTop: 'var(--space-2)' }}>
              ✓ CUIL con CiDi Nivel 2 verificado — <strong>Juan Martín García</strong>
            </div>
          )}
        </div>

        {cuilValido === true && (
          <div>
            <div style={{ fontSize: 14, color: 'var(--color-gray-700)', marginBottom: 'var(--space-2)', fontWeight: 500 }}>Cargo / Carácter</div>
            <input
              className="ios-input"
              value={cargo}
              onChange={e => setCargo(e.target.value)}
              placeholder="Ej: Director Médico, Apoderado, Representante Legal..."
              style={{ background: 'var(--ios-gray6)', border: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Firmas */}
      {cuilValido === true && cargo && formatoInsp === 'PRESENCIAL' && (
        <>
          <div className="ios-section-header">2. Firma del Responsable del Establecimiento</div>
          <div className="ios-card-group" style={{ padding: 'var(--space-4)' }}>
            <SignaturePad label="Responsable: Juan Martín García" onSign={sig => { setFirmas(p => ({ ...p, responsable: sig || null })) }} />
          </div>

          {firmas.responsable && (
            <>
              <div className="ios-section-header">3. Firma del Inspector Interviniente</div>
              <div className="ios-card-group" style={{ padding: 'var(--space-4)' }}>
                <SignaturePad label="Inspector: Dra. Valeria Romero" onSign={sig => { setFirmas(p => ({ ...p, inspector: sig || null })) }} />
              </div>
            </>
          )}
        </>
      )}

      {/* Dictamen */}
      {(firmas.inspector || formatoInsp === 'VIRTUAL') && (
        <>
          <div className="ios-section-header">4. Dictamen</div>

          <div className="ios-card-group" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ fontSize: 14, color: 'var(--color-gray-700)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>Notas de Cierre</div>
            <textarea
              rows={3}
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Conclusión final y observaciones del inspector..."
              style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 12, border: '1.5px solid var(--ios-gray5)', fontFamily: 'var(--font-family)', fontSize: 14, resize: 'none', outline: 'none', background: 'var(--ios-gray6)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { id: 'APRUEBA' as Dictamen, iconName: 'check_circle', label: 'Aprobar', desc: esRutina ? 'La inspección por rutina es correcta.' : 'Sin irregularidades. El trámite pasa a ACEPTADO INSPECCIÓN.', color: 'var(--ios-green)', bg: 'rgba(52,199,89,0.08)', border: 'rgba(52,199,89,0.3)' },
              { id: 'NO_APRUEBA' as Dictamen, iconName: 'cancel', label: 'No Aprobar', desc: 'El acta se cierra sin aprobación y requiere derivación.', color: 'var(--ios-red)', bg: 'rgba(255,59,48,0.08)', border: 'rgba(255,59,48,0.3)' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setDictamen(opt.id)
                  if (opt.id === 'NO_APRUEBA') {
                    setShowNoAprobacionModal(true)
                  } else {
                    setShowAprobacionExito(true)
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-xl)',
                  border: `2px solid ${dictamen === opt.id ? opt.color : 'var(--ios-gray5)'}`,
                  background: dictamen === opt.id ? opt.bg : 'white',
                  cursor: 'pointer', fontFamily: 'var(--font-family)', textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: dictamen === opt.id ? `0 4px 12px ${opt.color}25` : 'none',
                }}
              >
                <span className="material-icons" style={{ fontSize: 28, color: opt.color, flexShrink: 0 }}>{opt.iconName}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: dictamen === opt.id ? opt.color : 'var(--color-gray-800)' }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ios-gray)', marginTop: 2 }}>{opt.desc}</div>
                </div>
                {dictamen === opt.id && <span style={{ color: opt.color, fontSize: 22 }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── MODAL: Opciones de No Aprobación ── */}
      {showNoAprobacionModal && (
        <div className="ios-sheet-overlay" onClick={() => setShowNoAprobacionModal(false)}>
          <div className="ios-sheet" onClick={e => e.stopPropagation()}>
            <div className="ios-sheet-handle" />
            <div className="ios-sheet-header">
              <div className="ios-sheet-title" style={{ color: 'var(--ios-red)' }}>
                ⚠️ Acta No Aprobada
              </div>
              <div style={{ fontSize: 13, color: 'var(--ios-gray)', marginTop: 4 }}>
                Seleccioná el destino y la acción administrativa para continuar:
              </div>
            </div>
            <div className="ios-sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

              <button
                onClick={() => setNoAprobacionAccion('COORDINADOR')}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)',
                  border: `2px solid ${noAprobacionAccion === 'COORDINADOR' ? 'var(--ios-red)' : 'var(--ios-gray5)'}`,
                  background: noAprobacionAccion === 'COORDINADOR' ? 'rgba(255,59,48,0.06)' : 'white',
                  cursor: 'pointer', fontFamily: 'var(--font-family)', textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-icons" style={{ color: 'var(--ios-red)', fontSize: 22 }}>gavel</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-800)' }}>Mandar a Coordinador</span>
                  </div>
                  {noAprobacionAccion === 'COORDINADOR' && <span style={{ color: 'var(--ios-red)', fontSize: 20 }}>✓</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ios-gray)', marginTop: 4, marginLeft: 32 }}>
                  Para dar de baja el establecimiento.
                </div>
              </button>

              <button
                onClick={() => setNoAprobacionAccion('EFECTOR')}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)',
                  border: `2px solid ${noAprobacionAccion === 'EFECTOR' ? 'var(--ios-red)' : 'var(--ios-gray5)'}`,
                  background: noAprobacionAccion === 'EFECTOR' ? 'rgba(255,59,48,0.06)' : 'white',
                  cursor: 'pointer', fontFamily: 'var(--font-family)', textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-icons" style={{ color: 'var(--ios-red)', fontSize: 22 }}>autorenew</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-800)' }}>Enviar a efector (Modificacion/Renovacion)</span>
                  </div>
                  {noAprobacionAccion === 'EFECTOR' && <span style={{ color: 'var(--ios-red)', fontSize: 20 }}>✓</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ios-gray)', marginTop: 4, marginLeft: 32 }}>
                  Para que inicie un trámite de renovación o modificación del establecimiento.
                </div>
              </button>

              <button
                className="btn-ios btn-ios-danger"
                disabled={!noAprobacionAccion}
                onClick={() => {
                  setShowNoAprobacionModal(false)
                  setShowNoAprobacionExito(true)
                }}
                style={{ marginTop: 'var(--space-2)', opacity: noAprobacionAccion ? 1 : 0.4 }}
              >
                Confirmar Acción
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ paddingBottom: 'var(--space-4)' }}>
        <button className="btn-ios btn-ios-gray" onClick={onPrev} style={{ width: 'auto', padding: '14px 24px' }}>← Anterior</button>
      </div>
    </div>
  )
}
