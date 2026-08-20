import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { consultarMisDenuncias, type ExpedienteDenunciaResponse } from '../services/denunciaApi'
import ModalPresentarDenuncia from '../components/ModalPresentarDenuncia'

export default function BandejaDenunciasEfector() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [denuncias, setDenuncias] = useState<ExpedienteDenunciaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [criterioBusqueda, setCriterioBusqueda] = useState('')

  const userCuit = user?.cuil || '20-33445566-7'

  const cargarDenuncias = async () => {
    setLoading(true)
    try {
      const res = await consultarMisDenuncias(userCuit)
      if (res.ok && res.data) {
        setDenuncias(res.data)
      } else {
        // Mock fallback en caso de servidor offline
        setDenuncias([
          {
            id_denuncia: 'DEN-001',
            numero_expediente: 'DEN-2026-00014',
            denunciante: { cuit_cuil: userCuit, nombre_completo: 'Efector Sanitario', correo: 'efector@salud.gob.ar', es_anonima: false },
            establecimiento_denunciado: {
              es_registrado: false,
              razon_social_o_nombre: 'Consultorio Odontológico Sin Cartel',
              cuit_titular_presunto: '20-99887766-5',
              domicilio: { calle: 'Av. Colón', numero: '1420', localidad: 'Córdoba' },
              tipologia_estimada: 'Consultorio'
            },
            motivo_denuncia: 'FALTA_HABILITACION',
            descripcion_detallada: 'Funcionamiento de consultorio odontológico en domicilio particular sin habilitación sanitaria.',
            adjuntos_evidencia: [],
            estado: 'EXPEDIENTE_GENERADO',
            createdAt: new Date().toISOString()
          }
        ])
      }
    } catch (e) {
      console.warn('Backend API offline, cargando mock local')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDenuncias()
  }, [userCuit])

  const denunciasFiltradas = denuncias.filter(d => 
    d.numero_expediente.toLowerCase().includes(criterioBusqueda.toLowerCase()) ||
    d.establecimiento_denunciado.razon_social_o_nombre.toLowerCase().includes(criterioBusqueda.toLowerCase()) ||
    d.motivo_denuncia.toLowerCase().includes(criterioBusqueda.toLowerCase())
  )

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case 'RECIBIDA': return 'badge-info'
      case 'EXPEDIENTE_GENERADO': return 'badge-warning'
      case 'INSPECCIONADA': return 'badge-success'
      default: return 'badge-secondary'
    }
  }

  return (
    <div className="page-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/${user?.rol?.toLowerCase() || 'inspector'}/home`)}
            style={{ padding: 0, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gray-600)' }}
          >
            <span className="material-icons" style={{ fontSize: '16px' }}>arrow_back</span>
            Volver al Inicio
          </button>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--color-gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ color: '#e11d48' }}>report_problem</span>
            Mis Denuncias Sanitarias Presentadas
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-gray-600)' }}>
            Consulta el historial, estado administrativo y seguimiento de expedientes `DEN-2026`
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '13.5px',
            fontWeight: 750,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
          }}
        >
          <span className="material-icons">add</span>
          Presentar Nueva Denuncia
        </button>
      </div>

      {/* BUSCADOR */}
      <div style={{ display: 'flex', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <span className="material-icons" style={{ color: 'var(--color-gray-400)' }}>search</span>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por N° de Expediente, razón social o motivo..."
          value={criterioBusqueda}
          onChange={(e) => setCriterioBusqueda(e.target.value)}
          style={{ border: 'none', padding: 0, fontSize: '13.5px', width: '100%', outline: 'none' }}
        />
      </div>

      {/* TABLA / LISTADO */}
      <div className="card" style={{ padding: 0, borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
            Cargando denuncias...
          </div>
        ) : denunciasFiltradas.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-gray-300)', marginBottom: '12px' }}>folder_off</span>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--color-gray-700)' }}>No tienes denuncias registradas</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-gray-500)' }}>Puedes realizar una presentación haciendo clic en "Presentar Nueva Denuncia".</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc' }}>N° Expediente</th>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc' }}>Establecimiento Denunciado</th>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc' }}>Ubicación</th>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc' }}>Motivo</th>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc', textAlign: 'center' }}>Reserva</th>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc', textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {denunciasFiltradas.map((d) => (
                  <tr key={d.numero_expediente}>
                    <td style={{ fontSize: '13px', fontWeight: 800, padding: '14px 16px', color: '#0284c7' }}>
                      {d.numero_expediente}
                    </td>
                    <td style={{ fontSize: '13px', fontWeight: 700, padding: '14px 16px', color: 'var(--color-gray-900)' }}>
                      {d.establecimiento_denunciado.razon_social_o_nombre}
                    </td>
                    <td style={{ fontSize: '12.5px', padding: '14px 16px', color: 'var(--color-gray-600)' }}>
                      {d.establecimiento_denunciado.domicilio.calle} {d.establecimiento_denunciado.domicilio.numero}, {d.establecimiento_denunciado.domicilio.localidad}
                    </td>
                    <td style={{ fontSize: '12px', padding: '14px 16px', color: 'var(--color-gray-700)' }}>
                      {d.motivo_denuncia.replace('_', ' ')}
                    </td>
                    <td style={{ fontSize: '12px', padding: '14px 16px', textAlign: 'center' }}>
                      {d.denunciante.es_anonima ? (
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>Anónima</span>
                      ) : (
                        <span className="badge badge-secondary" style={{ fontSize: '10px' }}>Pública</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', padding: '14px 16px', textAlign: 'center' }}>
                      <span className={`badge ${getBadgeColor(d.estado)}`} style={{ fontSize: '10.5px', padding: '4px 10px' }}>
                        {d.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalPresentarDenuncia
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          cargarDenuncias()
        }}
      />
    </div>
  )
}
