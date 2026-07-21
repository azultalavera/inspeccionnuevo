import React, { useState, useRef, useEffect } from 'react'

export interface ActionOption {
  label: string;
  icon: string; // Material Icon name, e.g. 'visibility', 'edit', etc.
  onClick: () => void;
  danger?: boolean;
}

interface TableActionsMenuProps {
  options: ActionOption[];
}

export default function TableActionsMenu({ options }: TableActionsMenuProps) {
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

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button (three vertical dots) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-full)',
          background: isOpen ? 'var(--color-gray-100)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          transition: 'all 0.15s ease',
        }}
        title="Acciones"
      >
        <span className="material-icons" style={{ fontSize: 20, color: 'var(--color-gray-600)' }}>
          more_vert
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          border: '1px solid var(--color-gray-200)',
          minWidth: 160,
          zIndex: 500,
          padding: '4px',
          animation: 'slideUp 0.1s ease-out',
        }}>
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                opt.onClick()
                setIsOpen(false)
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                fontSize: 13,
                fontWeight: 500,
                color: opt.danger ? 'var(--color-danger)' : 'var(--color-gray-700)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = opt.danger ? 'var(--color-danger-light)' : 'var(--color-gray-50)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <span className="material-icons" style={{ fontSize: 16, color: opt.danger ? 'var(--color-danger)' : 'var(--color-gray-500)' }}>
                {opt.icon}
              </span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
