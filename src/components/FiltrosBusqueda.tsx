import React, { useState } from 'react'

export interface FilterFieldOption {
  value: string
  label: string
}

export interface FilterFieldConfig {
  id: string
  label: string
  type?: 'text' | 'select' | 'date'
  placeholder?: string
  value: string
  onChange: (val: string) => void
  options?: FilterFieldOption[]
  gridSpan?: number
}

export interface FiltrosBusquedaProps {
  title?: string
  fields: FilterFieldConfig[]
  onBuscar?: () => void
  onLimpiar: () => void
  defaultExpanded?: boolean
  children?: React.ReactNode
  style?: React.CSSProperties
}

export default function FiltrosBusqueda({
  title = 'Filtros de Búsqueda',
  fields,
  onBuscar,
  onLimpiar,
  defaultExpanded = false,
  children,
  style
}: FiltrosBusquedaProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        marginBottom: '20px',
        ...style
      }}
    >
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(prev => !prev)}
        style={{
          padding: '14px 20px',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          borderBottom: expanded ? '1px solid #E2E8F0' : 'none',
          transition: 'background 0.15s ease'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-icons" style={{ color: '#0055A5', fontSize: 20 }}>tune</span>
          <span style={{ fontSize: 14.5, fontWeight: 750, color: '#1E293B' }}>
            {title}
          </span>
        </div>
        <span
          className="material-icons"
          style={{
            color: '#64748B',
            fontSize: 22,
            transition: 'transform 0.2s ease',
            transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
        >
          expand_less
        </span>
      </div>

      {/* Content Body */}
      {expanded && (
        <div style={{ padding: '20px', background: '#FFFFFF' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '16px 20px'
            }}
          >
            {fields.map(f => (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  gridColumn: f.gridSpan ? `span ${f.gridSpan}` : 'auto'
                }}
              >
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', letterSpacing: 0.2 }}>
                  {f.label}
                </label>
                {f.type === 'select' ? (
                  <select
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    style={{
                      width: '100%',
                      height: 40,
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      background: '#FFFFFF',
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#1E293B',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {f.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'date' ? (
                  <input
                    type="date"
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    placeholder={f.placeholder || 'dd/mm/aaaa'}
                    style={{
                      width: '100%',
                      height: 40,
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      background: '#FFFFFF',
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: f.value ? '#1E293B' : '#94A3B8',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    placeholder={f.placeholder || ''}
                    style={{
                      width: '100%',
                      height: 40,
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      background: '#FFFFFF',
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#1E293B',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                )}
              </div>
            ))}
            {children}
          </div>

          {/* Action Buttons Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 12,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid #F1F5F9'
            }}
          >
            <button
              type="button"
              onClick={onLimpiar}
              style={{
                height: 40,
                padding: '0 22px',
                borderRadius: 10,
                background: '#FFFFFF',
                border: '1.5px solid #0055A5',
                color: '#0055A5',
                fontSize: 13.5,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F0F7FF' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>autorenew</span>
              Limpiar
            </button>

            <button
              type="button"
              onClick={onBuscar}
              style={{
                height: 40,
                padding: '0 26px',
                borderRadius: 10,
                background: '#0055A5',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 13.5,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 85, 165, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#004282' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0055A5' }}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>search</span>
              Buscar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
