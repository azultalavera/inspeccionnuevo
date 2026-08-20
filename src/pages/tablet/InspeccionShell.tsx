import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

// Steps
import SyncStep from './steps/SyncStep'
import DatosGeneralesStep from './steps/DatosGeneralesStep'
import ServiciosStep from './steps/ServiciosStep'
import EquipamientoStep from './steps/EquipamientoStep'
import SalasCamasStep from './steps/SalasCamasStep'
import PlantelStep from './steps/PlantelStep'
import DirectorTecnicoStep from './steps/DirectorTecnicoStep'
import ArquitecturaStep from './steps/ArquitecturaStep'
import DocumentosStep from './steps/DocumentosStep'
import EvidenciaStep from './steps/EvidenciaStep'
import CierreStep from './steps/CierreStep'

interface Step {
  id: string
  icon: string
  label: string
  shortLabel: string
  component: React.ComponentType<StepProps>
}

export interface StepProps {
  tramiteId: string
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}

const STEPS: Step[] = [
  { id: 'sync',        icon: 'sync',               label: 'Sincronización',        shortLabel: 'Sync',       component: SyncStep },
  { id: 'datos',       icon: 'assignment',         label: 'Datos Generales',       shortLabel: 'Datos',      component: DatosGeneralesStep },
  { id: 'arquitectura',icon: 'domain',             label: 'Arquitectura',          shortLabel: 'Arq.',       component: ArquitecturaStep },
  { id: 'servicios',   icon: 'local_hospital',     label: 'Servicios',             shortLabel: 'Servicios',  component: ServiciosStep },
  { id: 'salas',       icon: 'king_bed',           label: 'Salas y Camas',         shortLabel: 'Salas',      component: SalasCamasStep },
  { id: 'plantel',     icon: 'groups',             label: 'Plantel',               shortLabel: 'Plantel',    component: PlantelStep },
  { id: 'director',    icon: 'medical_services',   label: 'Director Técnico',     shortLabel: 'Director',   component: DirectorTecnicoStep },
  { id: 'equipamiento',icon: 'biotech',            label: 'Equipamiento',          shortLabel: 'Equip.',     component: EquipamientoStep },
  { id: 'documentos',  icon: 'description',        label: 'Documentos',            shortLabel: 'Docs',       component: DocumentosStep },
  { id: 'evidencia',   icon: 'photo_camera',       label: 'Evidencia',             shortLabel: 'Fotos',      component: EvidenciaStep },
  { id: 'cierre',      icon: 'draw',               label: 'Cierre y Firma',        shortLabel: 'Cierre',     component: CierreStep },
]

export default function InspeccionShell() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tramites, actualizarInspeccion } = useApp()
  const [currentStep, setCurrentStep] = useState(0)

  const tramite = tramites.find(t => t.id === id)
  if (!tramite) return <div>Trámite no encontrado</div>

  const step = STEPS[currentStep]
  const StepComponent = step.component
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleGuardar = () => {
    // Save progress - state is managed in each step component
    const btn = document.getElementById('btn-guardar-tablet')
    if (btn) {
      btn.textContent = '✓ Guardado'
      setTimeout(() => { if (btn) btn.textContent = 'Guardar' }, 1500)
    }
  }

  const handleSalir = () => {
    if (confirm('¿Salir de la inspección? El progreso guardado se conservará.')) {
      navigate('/inspector/bandeja')
    }
  }

  return (
    <div className="tablet-layout" style={{ background: 'var(--ios-gray6)' }}>
      {/* Top Navigation Bar */}
      <div className="tablet-topbar">
        <button className="tablet-topbar-action" onClick={handleSalir}>
          ← Salir
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="tablet-topbar-title" style={{ fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span className="material-icons">{step.icon}</span> {step.label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ios-gray)', textAlign: 'center', marginTop: 1 }}>
            {tramite.denominacion}
          </div>
        </div>
        <button
          id="btn-guardar-tablet"
          className="tablet-topbar-action"
          onClick={handleGuardar}
          style={{ color: 'var(--ios-green)' }}
        >
          Guardar
        </button>
      </div>

      {/* Progress Bar */}
      <div className="step-progress-bar">
        <div className="step-progress-label">
          <span className="step-progress-title">Paso {currentStep + 1} de {STEPS.length}</span>
          <span className="step-progress-count">{Math.round(progress)}% completado</span>
        </div>
        <div className="step-progress-track">
          <div className="step-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step Selector (scrollable chips) */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) var(--space-4)',
        overflowX: 'auto',
        background: 'var(--color-white)',
        borderBottom: '1px solid var(--ios-gray5)',
        scrollbarWidth: 'none',
      }}>
        {STEPS.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: idx === currentStep
                ? 'var(--ios-blue)'
                : idx < currentStep
                  ? 'rgba(52, 199, 89, 0.15)'
                  : 'var(--ios-gray6)',
              color: idx === currentStep
                ? 'white'
                : idx < currentStep
                  ? 'var(--ios-green)'
                  : 'var(--ios-gray)',
              fontFamily: 'var(--font-family)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            {idx < currentStep
              ? <span className="material-icons" style={{ fontSize: 14 }}>check</span>
              : <span className="material-icons" style={{ fontSize: 14 }}>{s.icon}</span>}
            <span>{s.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="tablet-content" key={currentStep} style={{ animation: 'slideIn 0.2s ease' }}>
        <StepComponent
          tramiteId={id!}
          onNext={handleNext}
          onPrev={handlePrev}
          isFirst={currentStep === 0}
          isLast={currentStep === STEPS.length - 1}
        />
      </div>

      {/* iOS Tab Bar (Navigation) */}
      <div className="ios-tab-bar" style={{ gap: 4, padding: '4px 8px' }}>
        <button
          className="ios-tab-item"
          onClick={handlePrev}
          disabled={currentStep === 0}
          style={{ opacity: currentStep === 0 ? 0.3 : 1, minWidth: 0, padding: '4px 2px' }}
        >
          <div className="ios-tab-icon"><span className="material-icons" style={{ fontSize: 20 }}>arrow_back</span></div>
          <div className="ios-tab-label" style={{ fontSize: 9 }}>Anterior</div>
        </button>

        <button className="ios-tab-item" onClick={() => setCurrentStep(0)} style={{ minWidth: 0, padding: '4px 2px' }}>
          <div className="ios-tab-icon"><span className="material-icons" style={{ fontSize: 20 }}>home</span></div>
          <div className="ios-tab-label" style={{ fontSize: 9 }}>Inicio</div>
        </button>

        <button
          className="ios-tab-item"
          style={{ flex: 1.4, minWidth: 0, padding: '2px 0' }}
          onClick={handleNext}
          disabled={currentStep === STEPS.length - 1}
        >
          <div style={{
            background: currentStep === STEPS.length - 1 ? 'var(--ios-gray4)' : '#0055A5',
            color: 'white',
            borderRadius: 8,
            padding: '6px 8px',
            fontFamily: 'var(--font-family)',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}>
            {currentStep === STEPS.length - 2 ? 'Ir a Cierre' : 'Continuar'} <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
          </div>
        </button>

        <button className="ios-tab-item" style={{ minWidth: 0, padding: '4px 2px' }}>
          <div className="ios-tab-icon">
            <span className="material-icons" style={{ fontSize: 20 }}>warning</span>
            <span className="ios-tab-badge" style={{ display: 'none' }}>0</span>
          </div>
          <div className="ios-tab-label" style={{ fontSize: 9 }}>Hallazgos</div>
        </button>

        <button className="ios-tab-item" onClick={handleGuardar} style={{ minWidth: 0, padding: '4px 2px' }}>
          <div className="ios-tab-icon"><span className="material-icons" style={{ fontSize: 20 }}>save</span></div>
          <div className="ios-tab-label" style={{ fontSize: 9 }}>Guardar</div>
        </button>
      </div>
    </div>
  )
}
