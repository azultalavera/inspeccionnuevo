import React, { useState, useEffect } from 'react'
import { TRAMITES, ESTADO_CONFIG, type Tramite } from '../data/mockData'
import { useApp } from '../context/AppContext'
import TableActionsMenu from '../components/TableActionsMenu'
import FiltrosBusqueda, { FilterFieldConfig } from '../components/FiltrosBusqueda'

export default function BandejaAdecuacion() {
  const { tramites } = useApp()
  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES)

  useEffect(() => {
    setLocalTramites(tramites)
  }, [tramites])

  // Search & filters
  const [busqueda, setBusqueda] = useState('')
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false)
  const [filtroNroTramite, setFiltroNroTramite] = useState('')
  const [filtroNroExpediente, setFiltroNroExpediente] = useState('')
  const [filtroCuit, setFiltroCuit] = useState('')
  const [filtroTipologia, setFiltroTipologia] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroLocalidad, setFiltroLocalidad] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleLimpiarFiltros = () => {
    setBusqueda('')
    setFiltroNroTramite('')
    setFiltroNroExpediente('')
    setFiltroCuit('')
    setFiltroTipologia('')
    setFiltroEstado('')
    setFiltroLocalidad('')
    setFiltroDepartamento('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
  }

  // Show only adecuación tramites (or all as fallback for demo)
  const filtrados = localTramites.filter(t => {
    const matchAdecuacion = t.esAdecuacion || t.tipoTramite === 'ADECUACION'
    const matchBusqueda = busqueda === '' ||
      t.denominacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.nroTramite.includes(busqueda) ||
      t.localidad.toLowerCase().includes(busqueda.toLowerCase())
    const matchNro = filtroNroTramite === '' || t.nroTramite.includes(filtroNroTramite)
    const matchExp = filtroNroExpediente === '' || (t.nroExpediente || '').includes(filtroNroExpediente)
    const matchCuit = filtroCuit === '' || t.cuit.includes(filtroCuit)
    const matchTipologia = filtroTipologia === '' || t.tipologia === filtroTipologia
    const matchEstado = filtroEstado === '' || t.estado === filtroEstado
    const matchLocalidad = filtroLocalidad === '' || t.localidad === filtroLocalidad
    return matchAdecuacion && matchBusqueda && matchNro && matchExp && matchCuit && matchTipologia && matchEstado && matchLocalidad
  })

  // If no adecuación tramites, show all for demo
  const displayData = filtrados.length > 0 ? filtrados : localTramites

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === displayData.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(displayData.map(t => t.id)))
    }
  }

  const TIPO_TRAMITE_LABELS: Record<string, string> = {
    ALTA_DIGITAL: 'Alta Digital',
    HABILITACION: 'Habilitación',
    RENOVACION: 'Renovación',
    MODIFICACION: 'Modificación',
    ADECUACION: 'Adecuación'
  }

  const filterFieldsConfig: FilterFieldConfig[] = [
    {
      id: 'nombreCuit',
      label: 'Nombre del Establecimiento / CUIT',
      type: 'text',
      placeholder: 'Buscar por nombre o CUIT...',
      value: busqueda,
      onChange: setBusqueda
    },
    {
      id: 'nroTramite',
      label: 'N° Trámite',
      type: 'text',
      placeholder: 'Ej: 4958',
      value: filtroNroTramite,
      onChange: setFiltroNroTramite
    },
    {
      id: 'nroExpediente',
      label: 'N° Expediente',
      type: 'text',
      placeholder: 'Ej: EX-2024...',
      value: filtroNroExpediente,
      onChange: setFiltroNroExpediente
    },
    {
      id: 'tipologia',
      label: 'Tipología',
      type: 'select',
      value: filtroTipologia,
      onChange: setFiltroTipologia,
      options: [
        { value: '', label: 'Todas' },
        { value: 'Consultorio', label: 'Consultorio' },
        { value: 'Centro de diagnóstico', label: 'Centro de diagnóstico' },
        { value: 'Clínica con internación', label: 'Clínica con internación' },
        { value: 'Sanatorio', label: 'Sanatorio' },
        { value: 'Geriátrico', label: 'Geriátrico' }
      ]
    },
    {
      id: 'estado',
      label: 'Estado del Trámite',
      type: 'select',
      value: filtroEstado,
      onChange: setFiltroEstado,
      options: [
        { value: '', label: 'Todos' },
        ...Object.entries(ESTADO_CONFIG).map(([key, val]) => ({ value: key, label: val.label }))
      ]
    },
    {
      id: 'departamento',
      label: 'Departamento',
      type: 'select',
      value: filtroDepartamento,
      onChange: setFiltroDepartamento,
      options: [
        { value: '', label: 'Todos' },
        { value: 'Capital', label: 'Capital' },
        { value: 'General San Martín', label: 'General San Martín' },
        { value: 'Río Cuarto', label: 'Río Cuarto' },
        { value: 'Punilla', label: 'Punilla' }
      ]
    },
    {
      id: 'localidad',
      label: 'Localidad',
      type: 'select',
      value: filtroLocalidad,
      onChange: setFiltroLocalidad,
      options: [
        { value: '', label: 'Todas' },
        { value: 'Córdoba', label: 'Córdoba' },
        { value: 'Río Cuarto', label: 'Río Cuarto' },
        { value: 'Villa Carlos Paz', label: 'Villa Carlos Paz' },
        { value: 'Jesús María', label: 'Jesús María' }
      ]
    },
    {
      id: 'fechaDesde',
      label: 'Fecha Inicio Desde',
      type: 'date',
      value: filtroFechaDesde,
      onChange: setFiltroFechaDesde
    },
    {
      id: 'fechaHasta',
      label: 'Fecha Inicio Hasta',
      type: 'date',
      value: filtroFechaHasta,
      onChange: setFiltroFechaHasta
    }
  ]

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Consultar Trámites de Adecuación</div>
        <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>
          {displayData.length} trámite{displayData.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="page-content">
        {/* Filters Component */}
        <FiltrosBusqueda
          fields={filterFieldsConfig}
          onLimpiar={handleLimpiarFiltros}
        />

        {/* Selection actions */}
        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--color-gray-600)', marginRight: 'auto' }}>
              {selectedIds.size} seleccionado(s)
            </span>
            <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => alert(`Descargando ${selectedIds.size} trámite(s)...`)}>
              <span className="material-icons" style={{ fontSize: 16, marginRight: 4 }}>download</span>
              Descargar
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 12, color: 'var(--color-warning)' }} onClick={() => alert(`Dar de baja ${selectedIds.size} trámite(s)...`)}>
              <span className="material-icons" style={{ fontSize: 16, marginRight: 4 }}>block</span>
              Dar de baja
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => alert(`Protocolizar ${selectedIds.size} trámite(s)...`)}>
              <span className="material-icons" style={{ fontSize: 16, marginRight: 4 }}>gavel</span>
              Protocolizar
            </button>
          </div>
        )}

        {/* Table */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === displayData.length && displayData.length > 0}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Trámite / Expediente</th>
                <th>Establecimiento</th>
                <th>Tipo / Fecha</th>
                <th>Ubicación</th>
                <th>Tipo Establecimiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                      <span className="material-icons" style={{ fontSize: 48, color: 'var(--color-gray-400)' }}>inbox</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>No se encontraron trámites de adecuación</div>
                  </td>
                </tr>
              ) : displayData.map(t => {
                const conf = ESTADO_CONFIG[t.estado]
                const isSelected = selectedIds.has(t.id)
                const labelTipoTramite = TIPO_TRAMITE_LABELS[t.tipoTramite || ''] || 'Habilitación'
                const tipoEstab = t.tipoTramite === 'HABILITACION' || t.tipoTramite === 'RENOVACION' ? 'Con Habilitación' : 'Sin Habilitación'

                return (
                  <tr key={t.id} style={{ background: isSelected ? 'var(--color-brand-50, rgba(0,81,155,0.04))' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(t.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--color-gray-900)' }}>{t.nroTramite}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>{t.nroExpediente || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 2 }}>{t.denominacion}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-500)' }}>{t.tipologia} · CUIT: {t.cuit}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-gray-800)', fontSize: 12 }}>{labelTipoTramite}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>Iniciado: {t.fechaIngreso}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-gray-800)', fontSize: 12 }}>{t.localidad}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>{t.departamento || 'Capital'}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-gray-700)' }}>{tipoEstab}</span>
                    </td>
                    <td>
                      <span className={`badge ${conf.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px' }}>
                        <span className="material-icons" style={{ fontSize: 13 }}>{conf.icon}</span>
                        <span style={{ fontSize: 11 }}>{conf.label}</span>
                      </span>
                    </td>
                    <td>
                      <TableActionsMenu
                        options={[
                          {
                            label: 'Ver Detalles',
                            icon: 'visibility',
                            onClick: () => alert(`Visualizando trámite ${t.nroTramite}`)
                          },
                          {
                            label: 'Descargar',
                            icon: 'download',
                            onClick: () => alert(`Descargando trámite ${t.nroTramite}...`)
                          },
                          {
                            label: 'Dar de Baja',
                            icon: 'block',
                            onClick: () => alert(`Dar de baja trámite ${t.nroTramite}`)
                          },
                          {
                            label: 'Protocolizar',
                            icon: 'gavel',
                            onClick: () => alert(`Protocolizar trámite ${t.nroTramite}`)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
