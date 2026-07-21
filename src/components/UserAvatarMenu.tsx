import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import type { Rol } from '../data/mockData'

interface UserAvatarMenuProps {
  size?: number;
  align?: 'left' | 'right' | 'top-right' | 'bottom-right';
}

const ROLES_INFO: { id: Rol; icon: string; label: string; route: string }[] = [
  { id: 'INSPECTOR',       icon: '🔍', label: 'Inspector',       route: '/inspector/home' },
  { id: 'ARQUITECTO',      icon: '🏗️', label: 'Arquitecto',      route: '/arquitecto/home' },
  { id: 'AUDITOR',         icon: '🩺', label: 'Auditor',         route: '/auditor/home' },
  { id: 'COORDINADOR',     icon: '🤝', label: 'Coordinador',     route: '/coordinador/home' },
  { id: 'PROTOCOLIZADOR',  icon: '📜', label: 'Protocolizador',  route: '/protocolizador/home' },
  { id: 'EFECTOR',         icon: '🏨', label: 'Efector',         route: '/efector/home' },
  { id: 'CONSULTOR',       icon: '🕵️', label: 'Agente Consultor', route: '/consultor/establecimientos' },
]

export default function UserAvatarMenu({ size = 36, align = 'right' }: UserAvatarMenuProps) {
  const { user, logout, switchRole } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSwitch = (rol: Rol) => {
    switchRole(rol)
    setIsOpen(false)
    const target = ROLES_INFO.find(r => r.id === rol)?.route ?? '/'
    navigate(target)
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    navigate('/')
  }

  let menuStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--ios-gray5)',
    minWidth: 210,
    zIndex: 1000,
    padding: '6px',
    animation: 'slideUp 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
  }

  if (align === 'right') {
    menuStyle = { ...menuStyle, top: 'calc(100% + 8px)', right: 0 }
  } else if (align === 'left') {
    menuStyle = { ...menuStyle, top: 'calc(100% + 8px)', left: 0 }
  } else if (align === 'top-right') {
    menuStyle = { ...menuStyle, bottom: 'calc(100% + 8px)', left: 0 }
  } else if (align === 'bottom-right') {
    menuStyle = { ...menuStyle, top: 0, left: 'calc(100% + 12px)' }
  }

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))',
          border: isOpen ? '2px solid white' : 'none',
          boxShadow: isOpen ? '0 0 0 2px var(--ios-blue)' : '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 800,
          fontSize: size * 0.38,
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
          transition: 'all 0.15s ease',
        }}
      >
        {user?.avatar}
      </button>

      {isOpen && (
        <div style={menuStyle}>
          <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--ios-gray6)', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-900)' }}>
              {user?.nombre} {user?.apellido}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ios-gray)', marginTop: 2 }}>
              Rol: <strong>{ROLES_INFO.find(r => r.id === user?.rol)?.label}</strong>
            </div>
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ios-gray)', textTransform: 'uppercase', letterSpacing: 0.5, padding: '6px 12px 2px' }}>
            Cambiar Rol
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ROLES_INFO.map(r => (
              <button
                key={r.id}
                onClick={() => handleSwitch(r.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 10px',
                  border: 'none',
                  background: user?.rol === r.id ? 'rgba(0,122,255,0.08)' : 'transparent',
                  color: user?.rol === r.id ? 'var(--ios-blue)' : 'var(--color-gray-700)',
                  fontSize: 12.5,
                  fontWeight: user?.rol === r.id ? 700 : 500,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{r.icon} {r.label}</span>
                {user?.rol === r.id && <span>✓</span>}
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--ios-gray6)', margin: '6px 0' }} />

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              color: 'var(--ios-red)',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>↩</span> Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}
