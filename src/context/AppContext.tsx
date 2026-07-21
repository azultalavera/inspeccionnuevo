import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { Tramite } from '../data/mockData'
import { TRAMITES, HALLAZGOS, ESTABLECIMIENTOS, type Hallazgo } from '../data/mockData'

interface InspeccionData {
  tramiteId: string;
  datosGenerales: Record<string, { valor?: boolean | string; observacion?: string }>;
  servicios: Record<string, { observado?: boolean; observacion?: string; subareas?: Record<string, { valor?: boolean | number; observacion?: string }> }>;
  equipamiento: Record<string, { observado?: number; observacion?: string }>;
  personal: Record<string, { observado?: number; observacion?: string }>;
  directores: Record<string, { observado?: number; observacion?: string }>;
  salas: Record<string, { observado?: number }>;
  camas: Record<string, { observado?: number }>;
  documentos: Record<string, { validez?: boolean; observacion?: string }>;
  evidencias: { foto?: string; observacion?: string }[];
  cierre: {
    cuil?: string;
    cargo?: string;
    firmaResponsable?: string;
    firmaInspector?: string;
    dictamen?: 'APRUEBA' | 'APRUEBA_OBS' | 'NO_APRUEBA';
    plazoEmplazamiento?: string;
    notasCierre?: string;
  };
}

interface AppContextType {
  tramites: Tramite[];
  hallazgos: Hallazgo[];
  inspeccionActiva: InspeccionData | null;
  iniciarInspeccion: (tramiteId: string) => void;
  actualizarInspeccion: (data: Partial<InspeccionData>) => void;
  finalizarInspeccion: () => void;
  getIrregularidades: () => number;
  crearNuevoTramite: (tipo: 'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION', tipologia: string, establecimientoId?: string) => Tramite;
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [tramites, setTramites] = useState<Tramite[]>(TRAMITES)
  const [hallazgos] = useState<Hallazgo[]>(HALLAZGOS)
  const [inspeccionActiva, setInspeccionActiva] = useState<InspeccionData | null>(() => {
    const saved = localStorage.getItem('clicsalud_inspeccion')
    return saved ? JSON.parse(saved) : null
  })

  const iniciarInspeccion = (tramiteId: string) => {
    const nueva: InspeccionData = {
      tramiteId,
      datosGenerales: {},
      servicios: {},
      equipamiento: {},
      personal: {},
      directores: {},
      salas: {},
      camas: {},
      documentos: {},
      evidencias: [],
      cierre: {},
    }
    setInspeccionActiva(nueva)
    localStorage.setItem('clicsalud_inspeccion', JSON.stringify(nueva))
    // Cambiar estado del trámite
    setTramites(prev => prev.map(t => t.id === tramiteId ? { ...t, estado: 'EN_ANALISIS_AUD' as const } : t))
  }

  const actualizarInspeccion = (data: Partial<InspeccionData>) => {
    setInspeccionActiva(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...data }
      localStorage.setItem('clicsalud_inspeccion', JSON.stringify(updated))
      return updated
    })
  }

  const finalizarInspeccion = () => {
    if (!inspeccionActiva) return
    const { tramiteId, cierre } = inspeccionActiva
    const nuevoEstado = cierre.dictamen === 'APRUEBA' || cierre.dictamen === 'APRUEBA_OBS'
      ? 'ACEPTADO_INSP' as const
      : 'OBSERVADO_INSP' as const
    setTramites(prev => prev.map(t => t.id === tramiteId ? { ...t, estado: nuevoEstado } : t))
    setInspeccionActiva(null)
    localStorage.removeItem('clicsalud_inspeccion')
  }

  const getIrregularidades = () => {
    if (!inspeccionActiva) return 0
    let count = 0
    // Equipamiento
    Object.values(inspeccionActiva.equipamiento).forEach(e => {
      if (e.observado !== undefined) count += e.observado < 0 ? 1 : 0
    })
    // Datos generales con valor = false
    Object.values(inspeccionActiva.datosGenerales).forEach(d => {
      if (d.valor === false) count++
    })
    return count
  }

  const crearNuevoTramite = (
    tipo: 'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION',
    tipologia: string,
    establecimientoId?: string
  ): Tramite => {
    let denominacion = 'Establecimiento Nuevo (Borrador)';
    let cuit = '30-99999999-9';
    let domicilio = 'Calle Falsa 123';
    let localidad = 'Córdoba';
    let departamento = 'Capital';
    let resolvedTipologia = tipologia;

    if (establecimientoId) {
      const est = ESTABLECIMIENTOS.find(e => e.id === establecimientoId);
      if (est) {
        denominacion = est.denominacion;
        cuit = est.cuit;
        resolvedTipologia = est.tipologia;
        domicilio = 'Av. Colón 1250';
        localidad = est.localidad;
        departamento = est.departamento || 'Capital';
      }
    }

    const nuevoId = `TRM${Math.floor(100000 + Math.random() * 900000)}`;
    const nuevoTramite: Tramite = {
      id: nuevoId,
      nroTramite: `TR-${Math.floor(100000 + Math.random() * 900000)}`,
      nroExpediente: `EXP-HAB-${Math.floor(10000 + Math.random() * 90000)}`,
      denominacion,
      cuit,
      tipologia: resolvedTipologia,
      domicilio,
      localidad,
      departamento,
      estado: 'PENDIENTE_EVAL_ARQ',
      fechaIngreso: new Date().toLocaleDateString('es-AR'),
      inspectorAsignado: 'Sin Asignar',
      tipoInspeccion: 'INICIAL',
      formatoInspeccion: 'PRESENCIAL',
      tipoTramite: tipo,
      esAdecuacion: tipo === 'ADECUACION',
    };
    setTramites(prev => [nuevoTramite, ...prev]);
    return nuevoTramite;
  };

  return (
    <AppContext.Provider value={{
      tramites,
      hallazgos,
      inspeccionActiva,
      iniciarInspeccion,
      actualizarInspeccion,
      finalizarInspeccion,
      getIrregularidades,
      crearNuevoTramite,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
