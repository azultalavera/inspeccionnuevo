import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { Usuario, Rol } from '../data/mockData'
import { USUARIOS } from '../data/mockData'

interface AuthContextType {
  user: Usuario | null;
  login: (rol: Rol) => void;
  logout: () => void;
  switchRole: (rol: Rol) => void;
}

const AuthContext = createContext<AuthContextType | null>(null)

const PATH_ROLE_MAP: { prefix: string; rol: Rol }[] = [
  { prefix: '/coordinador', rol: 'COORDINADOR' },
  { prefix: '/inspector', rol: 'INSPECTOR' },
  { prefix: '/auditor', rol: 'AUDITOR' },
  { prefix: '/arquitecto', rol: 'ARQUITECTO' },
  { prefix: '/protocolizador', rol: 'PROTOCOLIZADOR' },
  { prefix: '/efector', rol: 'EFECTOR' },
  { prefix: '/consultor', rol: 'CONSULTOR' },
  { prefix: '/agente-denuncias', rol: 'AGENTE_DENUNCIAS' },
  { prefix: '/admin', rol: 'ADMINISTRADOR' },
]

function getRoleFromPath(): Rol | null {
  if (typeof window === 'undefined') return null
  const path = window.location.pathname.toLowerCase()
  const match = PATH_ROLE_MAP.find(item => path.startsWith(item.prefix))
  return match ? match.rol : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(() => {
    // 1. Detectar rol desde la URL para permitir acceso directo por enlace
    const roleFromPath = getRoleFromPath()
    if (roleFromPath) {
      const u = USUARIOS.find(usr => usr.rol === roleFromPath)
      if (u) {
        localStorage.setItem('clicsalud_user', JSON.stringify(u))
        return u
      }
    }

    const saved = localStorage.getItem('clicsalud_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // ignore parse error
      }
    }
    // Por defecto inicia como EFECTOR para saltar la pantalla de selección
    const efectorUser = USUARIOS.find(u => u.rol === 'EFECTOR') ?? null
    if (efectorUser) {
      localStorage.setItem('clicsalud_user', JSON.stringify(efectorUser))
    }
    return efectorUser
  })

  React.useEffect(() => {
    const handleLocationCheck = () => {
      const roleFromPath = getRoleFromPath()
      if (roleFromPath && user?.rol !== roleFromPath) {
        const u = USUARIOS.find(usr => usr.rol === roleFromPath)
        if (u) {
          setUser(u)
          localStorage.setItem('clicsalud_user', JSON.stringify(u))
        }
      }
    }

    handleLocationCheck()
    window.addEventListener('popstate', handleLocationCheck)
    return () => window.removeEventListener('popstate', handleLocationCheck)
  }, [user?.rol])

  const login = (rol: Rol) => {
    const u = USUARIOS.find(u => u.rol === rol) ?? USUARIOS[0]
    setUser(u)
    localStorage.setItem('clicsalud_user', JSON.stringify(u))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('clicsalud_user')
  }

  const switchRole = (rol: Rol) => {
    const u = USUARIOS.find(u => u.rol === rol) ?? USUARIOS[0]
    setUser(u)
    localStorage.setItem('clicsalud_user', JSON.stringify(u))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
