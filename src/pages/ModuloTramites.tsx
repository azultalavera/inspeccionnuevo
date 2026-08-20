import React from 'react'
import { useNavigate } from 'react-router-dom'
import UserAvatarMenu from '../components/UserAvatarMenu'

export default function ModuloTramites() {
  const navigate = useNavigate()

  return (
    <>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-icons" style={{ fontSize: 24, color: '#0055A5' }}>assignment</span>
          <div className="topbar-title">Módulo Trámites</div>
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
          {/* CARD 1: ASIGNACIÓN DE TRÁMITES */}
          <div
            onClick={() => navigate('/coordinador/asignacion')}
            style={{
              background: '#FFFFFF',
              border: '2px solid #0055A5',
              borderRadius: 16,
              padding: '32px 24px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              boxShadow: '0 4px 14px rgba(0, 85, 165, 0.08)',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 85, 165, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 85, 165, 0.08)'
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#E0F2FE',
              color: '#0055A5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-icons" style={{ fontSize: 36 }}>people</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
              Asignación de Trámites
            </span>
          </div>

          {/* CARD 2: CONSULTAR ADECUACIÓN */}
          <div
            onClick={() => navigate('/coordinador/adecuacion')}
            style={{
              background: '#FFFFFF',
              border: '2px solid #8E44AD',
              borderRadius: 16,
              padding: '32px 24px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              boxShadow: '0 4px 14px rgba(142, 68, 173, 0.08)',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(142, 68, 173, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(142, 68, 173, 0.08)'
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#F3E8FF',
              color: '#8E44AD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-icons" style={{ fontSize: 36 }}>rule</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#581C87' }}>
              Consultar Adecuación
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
