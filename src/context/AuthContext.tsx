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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('clicsalud_user')
    return saved ? JSON.parse(saved) : null
  })

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
