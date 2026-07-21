import React, { useEffect, useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserAvatarMenu from '../components/UserAvatarMenu'
import logoMinisterio from '../assets/logo-ministerio.webp'
import logoClicSalud from '../assets/logo-clicsalud.webp'
import isologoCordoba from '../assets/isologo-cordoba.webp'

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth < 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isTablet
}

export default function DesktopLayout() {
  const { user } = useAuth()
  const isTablet = useIsTablet()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar_collapsed')
    return stored !== null ? stored === 'true' : true
  })
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nueva inspección asignada para mañana", time: "Hace 10 min", read: false },
    { id: 2, text: "El trámite del efector Centro Médico Sur ha sido presentado", time: "Hace 1 hora", read: false },
    { id: 3, text: "Vencimiento próximo de establecimiento Habilitación Express", time: "Hace 1 día", read: true },
  ])

  useEffect(() => {
    if (!showNotifications) return;
    const handleClose = () => setShowNotifications(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [showNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getNavItems = () => {
    switch (user?.rol) {
      case 'INSPECTOR':
        return [
          { to: '/inspector/home', icon: 'home', label: 'Inicio' },
          { to: '/inspector/expedientes', icon: 'folder', label: 'Expedientes Abiertos' },
          { to: '/inspector/inspecciones', icon: 'fact_check', label: 'Bandeja de Inspecciones' },
          { to: '/inspector/bandeja', icon: 'assignment', label: 'Bandeja de Trámites' },
          { to: '/inspector/establecimientos', icon: 'business', label: 'Consulta Establecimientos' },
        ]
      case 'ARQUITECTO':
        return [
          { to: '/arquitecto/home', icon: 'home', label: 'Inicio' },
          { to: '/arquitecto/expedientes', icon: 'folder', label: 'Expedientes Abiertos' },
          { to: '/arquitecto/bandeja', icon: 'assignment', label: 'Consulta de Trámites' },
        ]
      case 'AUDITOR':
        return [
          { to: '/auditor/home', icon: 'home', label: 'Inicio' },
          { to: '/auditor/expedientes', icon: 'folder', label: 'Expedientes Abiertos' },
          { to: '/auditor/bandeja', icon: 'assignment', label: 'Consulta de Trámites' },
          { to: '/auditor/establecimientos', icon: 'business', label: 'Consulta Establecimientos' },
        ]
      case 'COORDINADOR':
        return [
          { to: '/coordinador/home', icon: 'home', label: 'Inicio' },
          { to: '/coordinador/asignacion', icon: 'people', label: 'Asignación de Trámites' },
          { to: '/coordinador/adecuacion', icon: 'assignment', label: 'Consultar Adecuación' },
        ]
      case 'PROTOCOLIZADOR':
        return [
          { to: '/protocolizador/home', icon: 'home', label: 'Inicio' },
          { to: '/protocolizador/expedientes', icon: 'folder', label: 'Expedientes Abiertos' },
          { to: '/protocolizador/bandeja', icon: 'assignment', label: 'Consulta de Trámites' },
          { to: '/protocolizador/establecimientos', icon: 'business', label: 'Consulta Establecimientos' },
        ]
      case 'EFECTOR':
        return [
          { to: '/efector/home', icon: 'home', label: 'Inicio' },
          { to: '/efector/establecimientos', icon: 'business', label: 'Mis Establecimientos' },
          { to: '/efector/bandeja', icon: 'assignment', label: 'Mis Trámites' },
        ]
      case 'CONSULTOR':
        return [
          { to: '/consultor/establecimientos', icon: 'business', label: 'Bandeja Establecimientos' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  // On tablet: render just the Outlet — the child page owns its full layout
  if (isTablet) {
    return <Outlet />
  }

  return (
    <div className={`desktop-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Global Header spanning the full horizontal width */}
      <header style={{
        background: 'var(--surface-sidebar)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        boxShadow: 'var(--shadow-sm)',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => {
              const next = !isCollapsed;
              setIsCollapsed(next);
              localStorage.setItem('sidebar_collapsed', String(next));
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
              marginRight: '8px'
            }}
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <span className="material-icons" style={{ fontSize: 24 }}>
              menu
            </span>
          </button>
          
          <img src={logoMinisterio} alt="Ministerio de Salud" style={{ height: '40px', objectFit: 'contain' }} />
          <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.2)' }} />
          <img src={logoClicSalud} alt="ClicSalud" style={{ height: '36px', objectFit: 'contain' }} />
        </div>

        {/* Center Greeting */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Bienvenido a ClicSalud
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginTop: '2px' }}>
            ¡Hola, {user?.nombre} {user?.apellido}!
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '8px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s',
              }}
              title="Notificaciones"
            >
              <span className="material-icons" style={{ fontSize: '24px' }}>notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: '#EF4444',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  width: '320px',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  border: '1px solid var(--color-gray-200)',
                  zIndex: 1000,
                  padding: '12px 0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 8px 16px', borderBottom: '1px solid var(--color-gray-200)' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--color-gray-800)' }}>Notificaciones</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-brand-600)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        padding: 0,
                      }}
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: '13px' }}>
                      No tienes notificaciones
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: '10px 16px',
                          borderBottom: '1px solid var(--color-gray-100)',
                          background: n.read ? 'transparent' : 'rgba(0, 85, 165, 0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                      >
                        <div style={{ fontSize: '13px', color: 'var(--color-gray-800)', fontWeight: n.read ? 400 : 600 }}>
                          {n.text}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                          {n.time}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <UserAvatarMenu size={40} />
        </div>
      </header>

      {/* Sidebar starts below the header */}
      <aside className="sidebar" style={{ 
        overflow: 'visible',
        top: '64px',
        height: 'calc(100vh - 64px)'
      }}>
        <div style={{ height: '16px' }} />

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="material-icons sidebar-nav-icon" style={{ fontSize: 20 }}>{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content starts below the header */}
      <main className="main-content" style={{ marginTop: '64px' }}>
        {/* Page Content Panel (White 25% Transparent) */}
        <div style={{
          flex: 1,
          margin: '24px',
          background: 'rgba(255, 255, 255, 0.75)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <Outlet />
        </div>

        {/* Global Footer */}
        <footer style={{
          background: 'rgb(0, 81, 155)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.85)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={isologoCordoba} alt="Gobierno de Córdoba" style={{ height: '32px', objectFit: 'contain' }} />
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            <strong style={{ color: 'white' }}>Versión:</strong> 1.4.2
          </div>
        </footer>
      </main>
    </div>
  )
}
