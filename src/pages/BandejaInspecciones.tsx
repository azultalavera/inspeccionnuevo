import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import UserAvatarMenu from '../components/UserAvatarMenu'

export default function BandejaInspecciones() {
  const { user } = useAuth()
  const { tramites } = useApp()
  const navigate = useNavigate()

  const isCoordinador = user?.rol === 'COORDINADOR'
  const basePath = isCoordinador ? '/coordinador/inspeccion' : '/inspector/inspeccion-tipo'

  const inInspectionPhase = (t: any) => [
    'ACEPTADO_DOC_AUD',
    'OBSERVADO_INSP',
    'DESCARGO_INSP',
    'ACEPTADO_INSP',
    'RE_INSP_SOLICITADA',
    'EN_PROTOCOLIZACION',
    'FINALIZADO'
  ].includes(t.estado)

  const countTotal = tramites.filter(inInspectionPhase).length
  const countHabilitacion = tramites.filter(t => inInspectionPhase(t) && t.tipoInspeccion === 'HABILITACION').length
  const countRutina = tramites.filter(t => t.tipoInspeccion === 'RUTINA').length
  const countDenuncia = tramites.filter(t => inInspectionPhase(t) && t.tipoInspeccion === 'DENUNCIA').length

  const cardStyle = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: '32px 24px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 12,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-4px)'
    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)'
    e.currentTarget.style.borderColor = '#94A3B8'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'none'
    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)'
    e.currentTarget.style.borderColor = '#E2E8F0'
  }

  return (
    <>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-icons" style={{ fontSize: 24, color: '#0055A5' }}>fact_check</span>
          <div className="topbar-title">Módulo Inspección</div>
        </div>
        <UserAvatarMenu size={36} align="right" />
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px' }}>
        
        {/* Grid de Tarjetas Minimalistas (Solo Ícono + Nombre) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20
        }}>
          {/* CARD 0: BANDEJA INSPECCIÓN CONSOLIDADA */}
          <div
            onClick={() => navigate(`${basePath}/bandeja`)}
            style={cardStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#F1F5F9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-icons" style={{ fontSize: 28 }}>fact_check</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#1E293B', marginTop: 4 }}>
              {countTotal}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#475569' }}>
              Bandeja Inspección
            </span>
          </div>

          {/* CARD 1: HABILITACIÓN */}
          <div
            onClick={() => navigate(`${basePath}/habilitacion`)}
            style={cardStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#F1F5F9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-icons" style={{ fontSize: 28 }}>verified</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#1E293B', marginTop: 4 }}>
              {countHabilitacion}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#475569' }}>
              Inspección por Habilitación
            </span>
          </div>

          {/* CARD 2: RUTINA */}
          <div
            onClick={() => navigate(`${basePath}/rutina`)}
            style={cardStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#F1F5F9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-icons" style={{ fontSize: 28 }}>schedule</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#1E293B', marginTop: 4 }}>
              {countRutina}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#475569' }}>
              Inspección por Rutina
            </span>
          </div>

          {/* CARD 3: DENUNCIA */}
          <div
            onClick={() => navigate(`${basePath}/denuncia`)}
            style={cardStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#F1F5F9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-icons" style={{ fontSize: 28 }}>report</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#1E293B', marginTop: 4 }}>
              {countDenuncia}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#475569' }}>
              Inspección por Denuncia
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
