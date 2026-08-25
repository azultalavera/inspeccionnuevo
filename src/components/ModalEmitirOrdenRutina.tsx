import React, { useState } from 'react'
import { USUARIOS, ESTABLECIMIENTOS, type Tramite } from '../data/mockData'
import { useApp } from '../context/AppContext'

interface ModalEmitirOrdenRutinaProps {
  tramite?: Tramite | null;
  establecimientoId?: string;
  denominacionPrevia?: string;
  cuitPrevio?: string;
  tipologiaPrevia?: string;
  localidadPrevia?: string;
  onClose: () => void;
  onSuccess?: (nuevoTramite: Tramite) => void;
}

export default function ModalEmitirOrdenRutina({
  tramite,
  establecimientoId,
  denominacionPrevia,
  cuitPrevio,
  tipologiaPrevia,
  localidadPrevia,
  onClose,
  onSuccess
}: ModalEmitirOrdenRutinaProps) {
  const { generarOrdenRutina } = useApp()

  const agentesDisponibles = USUARIOS.filter(u => u.rol !== 'EFECTOR' && u.rol !== 'COORDINADOR')

  const denominacion = tramite?.denominacion || denominacionPrevia || 'Establecimiento Sanitario'
  const localidad = tramite?.localidad || localidadPrevia || 'Córdoba'
  const tipologia = tramite?.tipologia || tipologiaPrevia || 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO'
  const cuit = tramite?.cuit || cuitPrevio || '30-70000000-1'

  const [inspectorSeleccionado, setInspectorSeleccionado] = useState<string>(
    tramite?.inspectorAsignado || 'Dra. Valeria Romero'
  )
  const [modalidad, setModalidad] = useState<'PRESENCIAL' | 'VIRTUAL'>('PRESENCIAL')

  const handleEmitirOrden = () => {
    const estId = establecimientoId || (ESTABLECIMIENTOS.find(e => e.cuit === cuit || e.denominacion.toLowerCase() === denominacion.toLowerCase())?.id || 'EST001')
    const inspector = inspectorSeleccionado || 'Dra. Valeria Romero'
    const nuevo = generarOrdenRutina(estId, inspector, modalidad)
    alert(`Orden de Inspección por Rutina emitida para "${denominacion}" y asignada a ${inspector}.`)
    if (onSuccess) onSuccess(nuevo)
    onClose()
  }

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
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Establecimiento Info */}
        <div style={{ fontSize: 13, color: '#475569', padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <strong>{denominacion}</strong>
          <span style={{ color: '#94A3B8', marginLeft: 8 }}>{localidad} · {tipologia}</span>
        </div>

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
            onClick={onClose}
            style={{ padding: '9px 16px', borderRadius: 6, border: '1px solid #CBD5E1', background: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12.5, color: '#475569' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleEmitirOrden}
            style={{
              padding: '9px 20px', borderRadius: 6, border: 'none',
              background: '#0055A5',
              color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12.5,
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}
          >
            <span className="material-icons" style={{ fontSize: 17 }}>check</span>
            Confirmar Orden
          </button>
        </div>
      </div>
    </div>
  )
}
