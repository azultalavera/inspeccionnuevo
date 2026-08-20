import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { consultarAntecedentesEfector, type ActuacionSanitariaResponse } from '../services/inspeccionApi'

export default function BandejaAntecedentesEfector() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [actuaciones, setActuaciones] = useState<ActuacionSanitariaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [actasLatentesVinculadas, setActasLatentesVinculadas] = useState(0)

  const userCuit = user?.cuil || '30-71234567-8'

  useEffect(() => {
    async function loadAntecedentes() {
      setLoading(true)
      try {
        const res = await consultarAntecedentesEfector(userCuit, 'EST-HAB-9901')
        if (res.ok && res.data) {
          setActuaciones(res.data.actuaciones)
          setActasLatentesVinculadas(res.data.actas_latentes_vinculadas)
        } else {
          // Mock fallback
          setActuaciones([
            {
              id: 'INSP-DEN-001',
              tipo_origen: 'DENUNCIA',
              numero_expediente: 'EX-2026-98765-DEN',
              cuit_titular: userCuit,
              establecimiento_id: 'EST-HAB-9901',
              direccion_relevada: 'Calle 5 N° 432, Villa María',
              razon_social_relevada: 'Consultorio Odontológico',
              estado: 'EMPLAZADO',
              acta_pdf_hash: '8f9b2c4e1a0d3f7e9b2c4e1a0d3f7e9b2c4e1a0d3f7e9b2c4e1a0d3f7e9b2c4e',
              es_latente: false,
              hallazgos: [
                { servicio: 'Odontología General', descripcion: 'Falta de esterilizador certificado', gravedad: 'GRAVE', plazo_subsancion_dias: 15 }
              ],
              firmas: { inspector_cuid: 'INSP-2044', firmado_cidi: true },
              createdAt: new Date().toISOString()
            }
          ])
        }
      } catch (e) {
        console.warn('API Offline')
      } finally {
        setLoading(false)
      }
    }
    loadAntecedentes()
  }, [userCuit])

  return (
    <div className="page-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER */}
      <div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/efector/home')}
          style={{ padding: 0, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gray-600)' }}
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>arrow_back</span>
          Volver al Inicio
        </button>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--color-gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons" style={{ color: '#d97706' }}>gavel</span>
          Mis Antecedentes y Actas de Inspección de Oficio
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-gray-600)' }}>
          Historial inmutable de actuaciones de fiscalización, actas rubricadas in situ y hallazgos heredados atados al CUIT {userCuit}
        </p>
      </div>

      {/* NOTIFICACIÓN DE BINDING LATENTE */}
      {actasLatentesVinculadas > 0 && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          color: '#92400e',
          padding: '14px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 700
        }}>
          <span className="material-icons" style={{ color: '#d97706' }}>link</span>
          Se han vinculado automáticamente {actasLatentesVinculadas} antecedentes latentes de oficio provenientes de expedientes de fiscalización a tu CUIT.
        </div>
      )}

      {/* TABLA DE ANTECEDENTES */}
      <div className="card" style={{ padding: 0, borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
            Cargando antecedentes e inspecciones de oficio...
          </div>
        ) : actuaciones.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-gray-300)', marginBottom: '12px' }}>verified</span>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--color-gray-700)' }}>Sin Antecedentes de Inspección de Oficio</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-gray-500)' }}>No registras actas cerradas ni emplazamientos de fiscalización asociados a tu CUIT.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc' }}>N° Expediente</th>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc' }}>Origen</th>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc' }}>Dirección Relevada</th>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc', textAlign: 'center' }}>Hash Criptográfico SHA-256</th>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc', textAlign: 'center' }}>Estado</th>
                  <th style={{ fontSize: '11px', padding: '12px 16px', background: '#f8fafc', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {actuaciones.map((act) => (
                  <tr key={act.id}>
                    <td style={{ fontSize: '13px', fontWeight: 800, padding: '14px 16px', color: '#0284c7' }}>
                      {act.numero_expediente || act.id}
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 700, padding: '14px 16px' }}>
                      <span className={`badge ${act.tipo_origen === 'DENUNCIA' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '10px' }}>
                        {act.tipo_origen}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', padding: '14px 16px', color: 'var(--color-gray-700)' }}>
                      {act.direccion_relevada || 'Terreno'}
                    </td>
                    <td style={{ fontSize: '11px', fontFamily: 'monospace', padding: '14px 16px', textAlign: 'center', color: '#64748b' }}>
                      {act.acta_pdf_hash ? `${act.acta_pdf_hash.substring(0, 16)}...` : 'En proceso'}
                    </td>
                    <td style={{ fontSize: '12px', padding: '14px 16px', textAlign: 'center' }}>
                      <span className={`badge ${['HANDOFF_EFECTOR', 'EMPLAZADO'].includes(act.estado) ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '10.5px', padding: '4px 10px' }}>
                        {act.estado}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', padding: '14px 16px', textAlign: 'center' }}>
                      {['EMPLAZADO', 'HANDOFF_EFECTOR'].includes(act.estado) ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/efector/responder/${act.id}`)}
                          style={{ fontSize: '11.5px', padding: '4px 10px', borderRadius: '8px' }}
                        >
                          Subsanar / Enmienda
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>Verificado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
