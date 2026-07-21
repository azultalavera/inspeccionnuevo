import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Rol } from '../data/mockData'

export default function LoginPage() {
  const { login } = useAuth()
  const [selected, setSelected] = useState<Rol | null>(null)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D1B3E 0%, #0055A5 50%, #00B4D8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0,180,216,0.15) 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 440,
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: 80, height: 80,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.25)',
            margin: '0 auto var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <span className="material-icons" style={{ fontSize: 40, color: 'white' }}>local_hospital</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
            ClicSalud
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, fontWeight: 400 }}>
            Sistema de Inspección de Establecimientos
          </p>
          <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 12, marginTop: 4 }}>
            Ministerio de Salud · Provincia de Córdoba
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 24,
          padding: 'var(--space-8) var(--space-6)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 6, textAlign: 'center' }}>
            Ingresar al sistema
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-gray-500)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            Seleccioná tu rol para continuar
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            {[
              {
                rol: 'INSPECTOR' as Rol,
                icon: 'search',
                title: 'Inspector',
                desc: 'Auditoría de establecimientos y dictamen de inspecciones',
                color: 'var(--color-brand-600)',
                bgColor: 'var(--color-brand-50)',
                borderColor: 'var(--color-brand-200)',
              },
              {
                rol: 'EFECTOR' as Rol,
                icon: 'business',
                title: 'Efector',
                desc: 'Respuesta a emplazamientos y subsanación de observaciones',
                color: '#E67E22',
                bgColor: '#FFF8F0',
                borderColor: '#FDDDB0',
              },
            ].map(opt => (
              <button
                key={opt.rol}
                onClick={() => setSelected(opt.rol)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4) var(--space-4)',
                  border: `2px solid ${selected === opt.rol ? opt.color : 'var(--color-gray-200)'}`,
                  borderRadius: 14,
                  background: selected === opt.rol ? opt.bgColor : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                  transform: selected === opt.rol ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: selected === opt.rol ? `0 4px 16px ${opt.color}25` : 'none',
                }}
              >
                <span className="material-icons" style={{
                  width: 48, height: 48,
                  background: selected === opt.rol ? opt.bgColor : 'var(--color-gray-50)',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                  border: `1.5px solid ${selected === opt.rol ? opt.color + '40' : 'var(--color-gray-200)'}`,
                  color: selected === opt.rol ? opt.color : 'var(--color-gray-600)'
                }}>
                  {opt.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: selected === opt.rol ? opt.color : 'var(--color-gray-800)', marginBottom: 2 }}>
                    {opt.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-500)', lineHeight: 1.4 }}>
                    {opt.desc}
                  </div>
                </div>
                {selected === opt.rol && (
                  <span style={{ color: opt.color, fontSize: 20 }}>✓</span>
                )}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary btn-lg"
            disabled={!selected}
            onClick={() => selected && login(selected)}
            style={{ width: '100%', fontSize: 16, height: 52 }}
          >
            Ingresar como {selected === 'INSPECTOR' ? 'Inspector' : selected === 'EFECTOR' ? 'Efector' : '—'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 11, color: 'var(--color-gray-400)' }}>
            Acceso mediante identidad digital CiDi Nivel 2
          </p>
        </div>
      </div>
    </div>
  )
}
