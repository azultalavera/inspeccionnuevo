// ============================================================
// CLICSALUD+ — MOCK DATA
// Datos de ejemplo para demostración
// ============================================================

export type EstadoTramite =
  | 'BORRADOR_ARQ'
  | 'PENDIENTE_EVAL_ARQ'
  | 'EN_ANALISIS_ARQ'
  | 'OBSERVADO_ARQ'
  | 'RECTIFICADO_ARQ'
  | 'ADECUADO_ARQ'
  | 'ADECUADO_OBS_ARQ'
  | 'RECHAZADO_ARQ'
  | 'BORRADOR_AUD'
  | 'PENDIENTE_EVAL_AUD'
  | 'EN_ANALISIS_AUD'
  | 'OBSERVADO_AUD'
  | 'RECTIFICADO_AUD'
  | 'ACEPTADO_DOC_AUD'
  | 'OBSERVADO_INSP'
  | 'DESCARGO_INSP'
  | 'ACEPTADO_INSP'
  | 'RECHAZADO_INSP'
  | 'RE_INSP_SOLICITADA'
  | 'EN_PROTOCOLIZACION'
  | 'FINALIZADO';

export interface EmplazamientoRutina {
  diasRestantes: number;
  fechaVencimiento: string;
  faltasCriticasCount: number;
  derivadoAModificacion?: boolean;
  respuestaEmplazamientoRealizada?: boolean;
  actaNumero?: string;
  observaciones?: string[];
}

export interface Tramite {
  id: string;
  nroTramite: string;
  nroExpediente: string;
  denominacion: string;
  cuit: string;
  tipologia: string;
  domicilio: string;
  localidad: string;
  departamento?: string;
  estado: EstadoTramite;
  fechaIngreso: string;
  inspectorAsignado: string;
  inspectoresAsignados?: string[];
  tipoInspeccion: 'INICIAL' | 'RE_INSPECCION' | 'RUTINA' | 'DENUNCIA' | 'HABILITACION';
  formatoInspeccion: 'PRESENCIAL' | 'VIRTUAL';
  nroActa?: number;
  agenteAsignado?: string; // Para asignación del coordinador
  esAdecuacion?: boolean; // Para bandeja de adecuación del coordinador
  tipoTramite?: 'ALTA_DIGITAL' | 'HABILITACION' | 'RENOVACION' | 'MODIFICACION' | 'ADECUACION';
  alertaRutina?: 'ALERTA_T30' | 'ALERTA_T15' | 'CRITICO_VENCIDO' | 'AL_DIA';
  solapamientoTramiteId?: string;
  solapamientoTramiteNro?: string;
  emplazamiento?: EmplazamientoRutina;
  actaPadreId?: string;
  /** Fecha límite asignada por el coordinador para la re-inspección (DD/MM/AAAA) */
  fechaLimiteReInspeccion?: string;
  /** Motivo enviado por el inspector al solicitar re-inspección */
  motivoReInspeccion?: string;
  prioridadDenuncia?: 'CRITICA' | 'URGENTE' | 'NORMAL';
  origenDenuncia?: 'CIUDADANA' | 'JUDICIAL' | 'AUTORIDAD';
  fechaUltimaInspeccion?: string;
  ultimaInspeccionFecha?: string;
}

export interface Establecimiento {
  id: string;
  nroExpediente: string;
  denominacion: string;
  cuit: string;
  fechaCreacion: string;
  departamento: string;
  localidad: string;
  tipologia: string;
  estado: 'Habilitado' | 'En Proceso' | 'Rechazado' | 'Próximo a Vencer';
  proximoAVencer?: boolean;
  estadoRutina?: 'AL_DIA' | 'ALERTA_T30' | 'ALERTA_T15' | 'VENCIDO_SIN_ORDEN' | 'EMPLAZADO';
  frecuenciaRutinaAnual?: number; // 1 (clínicas) o 3 (geriátricos)
  ultimaInspeccionFecha?: string;
  diasParaProximoCiclo?: number;
  subEstadoRegistral?: string;
}

export interface AlertaRutinaItem {
  id: string;
  establecimientoId: string;
  denominacion: string;
  nroExpediente: string;
  cuit: string;
  tipologia: string;
  localidad: string;
  departamento: string;
  domicilio: string;
  ultimaInspeccionFecha: string;
  frecuenciaAnual: number; // 1 o 3
  ventanaAlerta: 'VERDE' | 'AMARILLO_T30' | 'ROJO_T15' | 'CRITICO_VENCIDO';
  diasParaVencimiento: number;
  tramiteActivoEnCurso?: {
    id: string;
    nroTramite: string;
    tipo: 'RENOVACION' | 'MODIFICACION' | 'HABILITACION';
    estado: string;
    /** Estado del trámite desde la perspectiva de simultaneidad con rutina */
    estadoSimultaneo?: 'INICIADO' | 'ENVIADO';
    /** Fecha en que se inició o se envió el trámite (DD/MM/AAAA) */
    fechaEstado?: string;
  };
  inspeccionesRealizadasAno?: number;
  proximaInspeccionSugeridaFecha?: string;
  diasParaProximaInspeccionSugerida?: number;
  inspectorSugerido?: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  declarado: boolean;
  observado?: boolean;
  tieneSubareas: boolean;
  subareas?: SubareaServicio[];
}

export interface SubareaServicio {
  id: string;
  nombre: string;
  tipo: 'SI_NO' | 'NUMERICO';
  declarado?: number;
  observado?: number;
  cumple?: boolean;
  observacion?: string;
  esCritico?: boolean;
  irregularidad?: boolean;
}

export interface ItemEquipamiento {
  id: string;
  servicio: string;
  nombre: string;
  declarado: number;
  observado?: number;
  irregularidad?: boolean;
  observacion?: string;
}

export interface ItemPersonal {
  id: string;
  servicio: string;
  rol: string;
  esJefe: boolean;
  declarado: number;
  observado?: number;
  irregularidad?: boolean;
}

export interface ItemSala {
  id: string;
  nombre: string;
  tipo: 'SALA' | 'CAMA';
  declarado: number;
  observado?: number;
  estado?: 'OK' | 'IRREGULARIDAD' | 'RECTIFICACION';
}

export interface ItemDatosGenerales {
  id: string;
  seccion: string;
  subseccion?: string;
  label: string;
  tipo: 'SI_NO' | 'TEXTO' | 'SUBSECCION';
  valor?: boolean | string;
  observacion?: string;
  esCritico?: boolean;
  irregularidad?: boolean;
}

export interface DocumentoAdjunto {
  id: string;
  categoria: string;
  nombre: string;
  url?: string;
  validez?: boolean;
  observacion?: string;
}

// ── TRÁMITES MOCK ──────────────────────────────────────────────

export const TRAMITES: Tramite[] = [
  {
    id: 'TRM001',
    nroTramite: '2024-000123',
    nroExpediente: 'EX-2024-0045672-APN-MS#CBA',
    denominacion: 'Clínica del Parque S.A.',
    cuit: '30-71234567-8',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    domicilio: 'Av. Rafael Núñez 4750',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'ACEPTADO_DOC_AUD',
    fechaIngreso: '2024-06-10',
    fechaUltimaInspeccion: '15/11/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'INICIAL',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 1,
    agenteAsignado: 'Dra. Valeria Romero',
  },
  {
    id: 'TRM002',
    nroTramite: '2024-000089',
    nroExpediente: 'EX-2024-0039841-APN-MS#CBA',
    denominacion: 'Sanatorio San Martín',
    cuit: '30-65432198-7',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    domicilio: 'Bv. San Juan 1200',
    localidad: 'Villa María',
    departamento: 'General San Martín',
    estado: 'ACEPTADO_DOC_AUD',
    fechaIngreso: '2024-05-28',
    fechaUltimaInspeccion: '20/08/2025',
    inspectorAsignado: 'Dr. Marcelo Juárez, Dra. Valeria Romero',
    inspectoresAsignados: ['Dr. Marcelo Juárez', 'Dra. Valeria Romero'],
    tipoInspeccion: 'RE_INSPECCION',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 2,
    agenteAsignado: 'Dr. Marcelo Juárez',
    fechaLimiteReInspeccion: '2026-08-20',
    motivoReInspeccion: 'Verificación in situ de las correcciones edilicias solicitadas en el emplazamiento.',
  },
  {
    id: 'TRM003',
    nroTramite: '2024-000201',
    nroExpediente: 'EX-2024-0052100-APN-MS#CBA',
    denominacion: 'Geriátrico El Sosiego',
    cuit: '30-78901234-5',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    domicilio: 'Calle Rioja 890',
    localidad: 'Río Cuarto',
    departamento: 'Río Cuarto',
    estado: 'ACEPTADO_INSP',
    fechaIngreso: '2024-06-01',
    fechaUltimaInspeccion: '10/05/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'INICIAL',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 1,
    agenteAsignado: 'Dra. Valeria Romero',
  },
  {
    id: 'TRM004',
    nroTramite: '2024-000302',
    nroExpediente: 'EX-2024-0061099-APN-MS#CBA',
    denominacion: 'Centro Médico Integral',
    cuit: '30-87654321-0',
    tipologia: 'LABORATORIO DE ANÁLISIS CLÍNICOS',
    domicilio: 'Av. Colón 3400',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'ACEPTADO_DOC_AUD',
    fechaIngreso: '2024-06-14',
    fechaUltimaInspeccion: '01/09/2025',
    inspectorAsignado: 'Dr. Marcelo Juárez',
    tipoInspeccion: 'INICIAL',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 1,
    agenteAsignado: 'Dr. Marcelo Juárez',
  },
  {
    id: 'TRM005',
    nroTramite: '2024-000456',
    nroExpediente: 'EX-2024-0099881-APN-MS#CBA',
    denominacion: 'Hospital Privado Cerro',
    cuit: '30-50000123-4',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    domicilio: 'Av. Rafael Núñez 5200',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'PENDIENTE_EVAL_ARQ',
    fechaIngreso: '2024-06-18',
    fechaUltimaInspeccion: '12/07/2025',
    inspectorAsignado: 'Sin asignar',
    tipoInspeccion: 'INICIAL',
    formatoInspeccion: 'PRESENCIAL',
  },
  {
    id: 'TRM006',
    nroTramite: '2024-000457',
    nroExpediente: 'EX-2024-0099882-APN-MS#CBA',
    denominacion: 'Centro Médico Punilla',
    cuit: '30-77788899-2',
    tipologia: 'CENTRO DE SALUD AMBULATORIA',
    domicilio: 'Av. San Martín 150',
    localidad: 'Villa Carlos Paz',
    departamento: 'Punilla',
    estado: 'PENDIENTE_EVAL_AUD',
    fechaIngreso: '2024-06-19',
    fechaUltimaInspeccion: '05/07/2025',
    inspectorAsignado: 'Sin asignar',
    tipoInspeccion: 'INICIAL',
    formatoInspeccion: 'PRESENCIAL',
    esAdecuacion: true,
  },
  {
    id: 'TRM007',
    nroTramite: '2024-000458',
    nroExpediente: 'EX-2024-0099883-APN-MS#CBA',
    denominacion: 'Consultorio Odontológico Sur',
    cuit: '30-12341234-9',
    tipologia: 'CONSULTORIO',
    domicilio: 'Calle Vélez Sarsfield 2200',
    localidad: 'Río Cuarto',
    departamento: 'Río Cuarto',
    estado: 'EN_PROTOCOLIZACION',
    fechaIngreso: '2024-06-20',
    fechaUltimaInspeccion: '20/07/2025',
    inspectorAsignado: 'Dra. Valeria Romero, Lic. Mariana Silva',
    inspectoresAsignados: ['Dra. Valeria Romero', 'Lic. Mariana Silva'],
    tipoInspeccion: 'INICIAL',
    formatoInspeccion: 'VIRTUAL',
  },
  {
    id: 'TRM008',
    nroTramite: '2024-000500',
    nroExpediente: 'EX-2024-0100001-APN-MS#CBA',
    denominacion: 'Centro de Salud Rural',
    cuit: '30-11111111-1',
    tipologia: 'CENTRO DE SALUD AMBULATORIA',
    domicilio: 'Ruta 9 km 45',
    localidad: 'San Luis',
    departamento: 'San Luis',
    estado: 'ACEPTADO_DOC_AUD',
    fechaIngreso: '2024-07-01',
    fechaUltimaInspeccion: '14/06/2025',
    inspectorAsignado: 'Dra. Valeria Romero, Dr. Marcelo Juárez',
    inspectoresAsignados: ['Dra. Valeria Romero', 'Dr. Marcelo Juárez'],
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 3,
    agenteAsignado: 'Dra. Valeria Romero',
  },
  {
    id: 'TRM009',
    nroTramite: '2024-000501',
    nroExpediente: 'EX-2024-0100002-APN-MS#CBA',
    denominacion: 'Clínica Dental Sonrisa',
    cuit: '30-22222222-2',
    tipologia: 'CONSULTORIO',
    domicilio: 'Av. Libertad 123',
    localidad: 'Mendoza',
    departamento: 'Mendoza',
    estado: 'DESCARGO_INSP',
    fechaIngreso: '2024-07-02',
    fechaUltimaInspeccion: '28/05/2025',
    inspectorAsignado: 'Dr. Marcelo Juárez',
    tipoInspeccion: 'DENUNCIA',
    formatoInspeccion: 'VIRTUAL',
    nroActa: 4,
    agenteAsignado: 'Dr. Marcelo Juárez',
    motivoReInspeccion: 'La documentación presentada por el efector fue aceptada. Sin embargo, la inspección fue realizada en formato virtual y se requiere verificación presencial de las condiciones edilicias y del libro de guardia, que no pudieron constatarse en la instancia anterior.',
    prioridadDenuncia: 'NORMAL',
    origenDenuncia: 'CIUDADANA',
  },
  {
    id: 'TRM010',
    nroTramite: '2024-000610',
    nroExpediente: 'EX-2024-0110201-APN-MS#CBA',
    denominacion: 'Residencia Senior Los Olivos',
    cuit: '30-71998877-4',
    tipologia: 'GERIÁTRICOS',
    domicilio: 'Av. Valparaíso 3200',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'PENDIENTE_EVAL_AUD',
    fechaIngreso: '2024-07-10',
    fechaUltimaInspeccion: '15/05/2025',
    inspectorAsignado: 'Lic. Mariana Silva',
    tipoInspeccion: 'HABILITACION',
    formatoInspeccion: 'PRESENCIAL',
    agenteAsignado: 'Lic. Mariana Silva',
    tipoTramite: 'HABILITACION'
  },
  {
    id: 'TRM011',
    nroTramite: '2024-000611',
    nroExpediente: 'EX-2024-0110202-APN-MS#CBA',
    denominacion: 'Centro de Salud Ambulatorio San Francisco',
    cuit: '30-66554433-2',
    tipologia: 'CENTRO DE SALUD AMBULATORIO',
    domicilio: 'Bv. Chacabuco 850',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'EN_ANALISIS_AUD',
    fechaIngreso: '2024-07-12',
    fechaUltimaInspeccion: '05/07/2025',
    inspectorAsignado: 'Lic. Mariana Silva',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    agenteAsignado: 'Lic. Mariana Silva',
    tipoTramite: 'RENOVACION'
  },
  {
    id: 'TRM012',
    nroTramite: '2024-000612',
    nroExpediente: 'EX-2024-0110203-APN-MS#CBA',
    denominacion: 'Unidad de Cirugía Ambulatoria Córdoba',
    cuit: '30-88776655-1',
    tipologia: 'CENTRO DE CIRUGIA AMBULATORIA',
    domicilio: 'Calle Santa Rosa 1420',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'PENDIENTE_EVAL_AUD',
    fechaIngreso: '2024-07-14',
    fechaUltimaInspeccion: '06/07/2025',
    inspectorAsignado: 'Lic. Mariana Silva',
    tipoInspeccion: 'HABILITACION',
    formatoInspeccion: 'PRESENCIAL',
    agenteAsignado: 'Lic. Mariana Silva',
    tipoTramite: 'MODIFICACION'
  },
  {
    id: 'TRM013',
    nroTramite: '2024-000613',
    nroExpediente: 'EX-2024-0110204-APN-MS#CBA',
    denominacion: 'Hogar Residencia Sol de Otoño',
    cuit: '30-55443322-8',
    tipologia: 'GERIÁTRICOS',
    domicilio: 'Av. Colón 4100',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'EN_ANALISIS_AUD',
    fechaIngreso: '2024-07-15',
    fechaUltimaInspeccion: '08/07/2025',
    inspectorAsignado: 'Lic. Mariana Silva',
    tipoInspeccion: 'HABILITACION',
    formatoInspeccion: 'PRESENCIAL',
    agenteAsignado: 'Lic. Mariana Silva',
    tipoTramite: 'HABILITACION'
  },
  {
    id: 'TRM014',
    nroTramite: '2024-000614',
    nroExpediente: 'EX-2024-0110205-APN-MS#CBA',
    denominacion: 'Centro Médico Ambulatorio Nueva Córdoba',
    cuit: '30-44332211-7',
    tipologia: 'CENTRO DE SALUD AMBULATORIO',
    domicilio: 'Calle Estrada 350',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'PENDIENTE_EVAL_AUD',
    fechaIngreso: '2024-07-16',
    fechaUltimaInspeccion: '09/07/2025',
    inspectorAsignado: 'Lic. Mariana Silva',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    agenteAsignado: 'Lic. Mariana Silva',
    tipoTramite: 'RENOVACION'
  },
  {
    id: 'TRM015',
    nroTramite: '2024-000502',
    nroExpediente: 'EX-2024-0100003-APN-MS#CBA',
    denominacion: 'Hospital Nuevo Horizonte',
    cuit: '30-33333333-3',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    domicilio: 'Calle Principal 500',
    localidad: 'Buenos Aires',
    departamento: 'Capital',
    estado: 'ACEPTADO_DOC_AUD',
    fechaIngreso: '2024-07-03',
    fechaUltimaInspeccion: '10/07/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'HABILITACION',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 5,
    agenteAsignado: 'Dra. Valeria Romero',
  },
  // ── EMPLAZAMIENTOS VENCIDOS / TIEMPO CRÍTICO ──
  {
    id: 'TRM098',
    nroTramite: '2024-000998',
    nroExpediente: 'EX-2024-0158900-APN-MS#CBA',
    denominacion: 'Sanatorio Sierra Bella S.A.',
    cuit: '30-71882233-9',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    domicilio: 'Av. Colón 4500',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'OBSERVADO_INSP',
    fechaIngreso: '2024-05-10',
    fechaUltimaInspeccion: '15/07/2025',
    inspectorAsignado: 'Dr. Marcelo Juárez',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 108,
    agenteAsignado: 'Dr. Marcelo Juárez',
    alertaRutina: 'CRITICO_VENCIDO',
    emplazamiento: {
      actaNumero: '108/2026',
      faltasCriticasCount: 2,
      diasRestantes: 0,
      fechaVencimiento: '2026-07-15',
      observaciones: ['Falta de Matafuegos Vencidos', 'Personal sin Matrícula Al Día']
    }
  },
  {
    id: 'TRM099',
    nroTramite: '2024-000999',
    nroExpediente: 'EX-2024-0158901-APN-MS#CBA',
    denominacion: 'Geriátrico Nueva Esperanza',
    cuit: '30-71445566-3',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    domicilio: 'Av. Patria 890',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'OBSERVADO_INSP',
    fechaIngreso: '2024-05-15',
    fechaUltimaInspeccion: '05/07/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'DENUNCIA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 112,
    agenteAsignado: 'Dra. Valeria Romero',
    alertaRutina: 'CRITICO_VENCIDO',
    emplazamiento: {
      actaNumero: '112/2026',
      faltasCriticasCount: 1,
      diasRestantes: 0,
      fechaVencimiento: '2026-07-05',
      observaciones: ['Ausencia de Director Médico en Horario Operativo']
    },
    prioridadDenuncia: 'CRITICA',
    origenDenuncia: 'AUTORIDAD',
  },
  // ── Más inspecciones DENUNCIA ──
  {
    id: 'TRM011',
    nroTramite: '2024-000510',
    nroExpediente: 'EX-2024-0100010-APN-MS#CBA',
    denominacion: 'Farmacia del Centro',
    cuit: '30-44444444-4',
    tipologia: 'FARMACIA',
    domicilio: 'Av. General Paz 320',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'ACEPTADO_DOC_AUD',
    fechaIngreso: '2024-07-05',
    fechaUltimaInspeccion: '05/07/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'DENUNCIA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 6,
    agenteAsignado: 'Dra. Valeria Romero',
    prioridadDenuncia: 'URGENTE',
    origenDenuncia: 'CIUDADANA',
  },
  {
    id: 'TRM012',
    nroTramite: '2024-000511',
    nroExpediente: 'EX-2024-0100011-APN-MS#CBA',
    denominacion: 'Residencia Geriátrica Los Pinos',
    cuit: '30-55555555-5',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    domicilio: 'Calle Los Aromos 150',
    localidad: 'Villa Allende',
    departamento: 'Colón',
    estado: 'ACEPTADO_DOC_AUD',
    fechaIngreso: '2024-07-06',
    fechaUltimaInspeccion: '06/07/2025',
    inspectorAsignado: 'Dr. Marcelo Juárez',
    tipoInspeccion: 'DENUNCIA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 7,
    agenteAsignado: 'Dr. Marcelo Juárez',
    prioridadDenuncia: 'URGENTE',
    origenDenuncia: 'CIUDADANA',
  },
  // ── Más inspecciones RUTINA ──
  {
    id: 'TRM013',
    nroTramite: '2024-000520',
    nroExpediente: 'EX-2024-0100020-APN-MS#CBA',
    denominacion: 'Centro de Diálisis Norte',
    cuit: '30-66666666-6',
    tipologia: 'CENTRO DE DIÁLISIS',
    domicilio: 'Bv. Los Alemanes 800',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'ACEPTADO_DOC_AUD',
    fechaIngreso: '2024-07-08',
    fechaUltimaInspeccion: '08/07/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 8,
    agenteAsignado: 'Dra. Valeria Romero',
  },
  {
    id: 'TRM014',
    nroTramite: '2024-000521',
    nroExpediente: 'EX-2024-0100021-APN-MS#CBA',
    denominacion: 'Laboratorio BioSalud',
    cuit: '30-77777777-7',
    tipologia: 'LABORATORIO DE ANÁLISIS CLÍNICOS',
    domicilio: 'Av. Vélez Sarsfield 1500',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'DESCARGO_INSP',
    fechaIngreso: '2024-07-09',
    fechaUltimaInspeccion: '09/07/2025',
    inspectorAsignado: 'Dr. Marcelo Juárez',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'VIRTUAL',
    nroActa: 9,
    agenteAsignado: 'Dr. Marcelo Juárez',
    motivoReInspeccion: 'La respuesta emplazamiento fue aceptada. Se solicita re-inspección presencial para verificar que el equipamiento de análisis clínicos declarado coincide con lo existente en el laboratorio y constatar el alta del nuevo director técnico habilitante.',
  },
  // ── Más inspecciones HABILITACION ──
  {
    id: 'TRM015',
    nroTramite: '2024-000530',
    nroExpediente: 'EX-2024-0100030-APN-MS#CBA',
    denominacion: 'Clínica Maternidad del Sol',
    cuit: '30-88888888-8',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    domicilio: 'Av. Hipólito Yrigoyen 2000',
    localidad: 'Río Cuarto',
    departamento: 'Río Cuarto',
    estado: 'ACEPTADO_DOC_AUD',
    fechaIngreso: '2024-07-10',
    fechaUltimaInspeccion: '10/07/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'HABILITACION',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 10,
    agenteAsignado: 'Dra. Valeria Romero',
  },
  {
    id: 'TRM016',
    nroTramite: '2024-000531',
    nroExpediente: 'EX-2024-0100031-APN-MS#CBA',
    denominacion: 'Consultorio Psicológico Armonía',
    cuit: '30-99999999-9',
    tipologia: 'CONSULTORIO',
    domicilio: 'Calle Deán Funes 400',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'ACEPTADO_INSP',
    fechaIngreso: '2024-07-11',
    fechaUltimaInspeccion: '11/07/2025',
    inspectorAsignado: 'Dr. Marcelo Juárez',
    tipoInspeccion: 'HABILITACION',
    formatoInspeccion: 'VIRTUAL',
    nroActa: 11,
    agenteAsignado: 'Dr. Marcelo Juárez',
  },
  // ── RE-INSPECCIÓN SOLICITADA (demo para coordinador) ──
  {
    id: 'TRM017',
    nroTramite: '2024-000540',
    nroExpediente: 'EX-2024-0100040-APN-MS#CBA',
    denominacion: 'Centro Oftalmológico del Sur',
    cuit: '30-12398765-2',
    tipologia: 'CONSULTORIO',
    domicilio: 'Av. Sabattini 1100',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'RE_INSP_SOLICITADA',
    fechaIngreso: '2024-07-15',
    fechaUltimaInspeccion: '12/07/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 12,
    agenteAsignado: 'Dra. Valeria Romero',
    motivoReInspeccion: 'La documentación presentada fue aceptada. Se requiere verificación in situ de los matafuegos reemplazados y la habilitación del nuevo director médico.',
  },
  // ── INSPECCIONES ORDENADAS ADICIONALES ──
  {
    id: 'TRM018',
    nroTramite: '2024-000550',
    nroExpediente: 'EX-2024-0100050-APN-MS#CBA',
    denominacion: 'Sanatorio Allende Cerro',
    cuit: '30-71234567-8',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    domicilio: 'Av. Rafael Núñez 5200',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'ACEPTADO_INSP',
    fechaIngreso: '2024-07-18',
    fechaUltimaInspeccion: '18/07/2025',
    inspectorAsignado: 'Dr. Marcelo Juárez',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 13,
    agenteAsignado: 'Dr. Marcelo Juárez',
  },
  {
    id: 'TRM019',
    nroTramite: '2024-000560',
    nroExpediente: 'EX-2024-0100060-APN-MS#CBA',
    denominacion: 'Clínica Privada Vélez Sarsfield',
    cuit: '30-55443322-1',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    domicilio: 'Naciones Unidas 984',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'RECHAZADO_INSP',
    fechaIngreso: '2024-07-20',
    fechaUltimaInspeccion: '20/07/2025',
    inspectorAsignado: 'Lic. Mariana Silva',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 14,
    agenteAsignado: 'Lic. Mariana Silva',
  },
  {
    id: 'TRM101',
    nroTramite: '2024-001001',
    nroExpediente: 'EX-2024-0160001-APN-MS#CBA',
    denominacion: 'Geriátrico Otoño Feliz',
    cuit: '30-71556677-4',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    domicilio: 'Av. Rafael Núñez 3200',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'OBSERVADO_INSP',
    fechaIngreso: '2024-06-01',
    fechaUltimaInspeccion: '01/08/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 101,
    agenteAsignado: 'Dra. Valeria Romero',
    alertaRutina: 'CRITICO_VENCIDO',
    emplazamiento: {
      actaNumero: '101/2026',
      faltasCriticasCount: 3,
      diasRestantes: 0,
      fechaVencimiento: '2026-08-01',
      observaciones: ['Salidas de emergencia obstruidas', 'Instalación eléctrica precaria']
    }
  },
  {
    id: 'TRM102',
    nroTramite: '2024-001002',
    nroExpediente: 'EX-2024-0160002-APN-MS#CBA',
    denominacion: 'Clínica de la Visión',
    cuit: '30-71667788-5',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    domicilio: 'Av. Colón 1200',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'ACEPTADO_INSP',
    fechaIngreso: '2024-06-05',
    fechaUltimaInspeccion: '05/06/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 102,
    agenteAsignado: 'Dra. Valeria Romero',
    alertaRutina: 'ALERTA_T15'
  },
  {
    id: 'TRM103',
    nroTramite: '2024-001003',
    nroExpediente: 'EX-2024-0160003-APN-MS#CBA',
    denominacion: 'Geriátrico Santa Lucía',
    cuit: '30-71778899-6',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    domicilio: 'Av. Castro Barros 540',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'DESCARGO_INSP',
    fechaIngreso: '2024-06-10',
    fechaUltimaInspeccion: '10/06/2025',
    inspectorAsignado: 'Dra. Valeria Romero, Dr. Marcelo Juárez',
    inspectoresAsignados: ['Dra. Valeria Romero', 'Dr. Marcelo Juárez'],
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'VIRTUAL',
    nroActa: 103,
    agenteAsignado: 'Dra. Valeria Romero',
    alertaRutina: 'ALERTA_T30'
  },
  {
    id: 'TRM104',
    nroTramite: '2024-001004',
    nroExpediente: 'EX-2024-0160004-APN-MS#CBA',
    denominacion: 'Laboratorio Central Córdoba',
    cuit: '30-71889900-7',
    tipologia: 'LABORATORIO DE ANÁLISIS CLÍNICOS',
    domicilio: 'Bv. Chacabuco 120',
    localidad: 'Córdoba',
    departamento: 'Capital',
    estado: 'ACEPTADO_INSP',
    fechaIngreso: '2024-06-15',
    fechaUltimaInspeccion: '15/06/2025',
    inspectorAsignado: 'Dra. Valeria Romero',
    tipoInspeccion: 'RUTINA',
    formatoInspeccion: 'PRESENCIAL',
    nroActa: 104,
    agenteAsignado: 'Dra. Valeria Romero',
    alertaRutina: 'AL_DIA'
  }
];

// ── ESTABLECIMIENTOS MOCK ──────────────────────────────────────

export const ESTABLECIMIENTOS: Establecimiento[] = [
  {
    id: 'EST001',
    nroExpediente: '0425-010203/2023',
    denominacion: 'Sanatorio Allende Cerro',
    cuit: '30-54587142-0',
    fechaCreacion: '12/03/2023',
    departamento: 'Capital',
    localidad: 'Córdoba',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    estado: 'Habilitado',
    ultimaInspeccionFecha: '12/03/2025',
  },
  {
    id: 'EST002',
    nroExpediente: '0425-055667/2022',
    denominacion: 'Hospital Privado Córdoba',
    cuit: '30-50000123-4',
    fechaCreacion: '08/11/2022',
    departamento: 'Capital',
    localidad: 'Córdoba',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    estado: 'Habilitado',
    proximoAVencer: true,
    ultimaInspeccionFecha: '08/11/2024',
  },
  {
    id: 'EST003',
    nroExpediente: '0425-998877/2024',
    denominacion: 'Centro de Salud Ambulatorio Centro',
    cuit: '30-77788899-2',
    fechaCreacion: '15/01/2024',
    departamento: 'Punilla',
    localidad: 'Villa Carlos Paz',
    tipologia: 'CENTRO DE SALUD AMBULATORIA',
    estado: 'En Proceso',
    ultimaInspeccionFecha: '15/01/2025',
  },
  {
    id: 'EST004',
    nroExpediente: '0425-112233/2023',
    denominacion: 'Clínica de la Cañada',
    cuit: '30-66655544-1',
    fechaCreacion: '05/06/2023',
    departamento: 'Capital',
    localidad: 'Córdoba',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    estado: 'Próximo a Vencer',
    proximoAVencer: true,
    ultimaInspeccionFecha: '05/06/2024',
  },
];

// ── SERVICIOS MOCK ─────────────────────────────────────────────

export const SERVICIOS: Servicio[] = [
  {
    id: 'SVC001',
    nombre: 'Guardia Médica',
    declarado: true,
    tieneSubareas: true,
    subareas: [
      { id: 'SA001', nombre: 'Sala de espera adecuada', tipo: 'SI_NO', esCritico: false },
      { id: 'SA002', nombre: 'Boxes de atención', tipo: 'NUMERICO', declarado: 4 },
      { id: 'SA003', nombre: 'Equipo de reanimación', tipo: 'SI_NO', esCritico: true },
    ]
  },
  {
    id: 'SVC002',
    nombre: 'Internación General',
    declarado: true,
    tieneSubareas: true,
    subareas: [
      { id: 'SA004', nombre: 'Camas habilitadas', tipo: 'NUMERICO', declarado: 34 },
      { id: 'SA005', nombre: 'Enfermería 24hs', tipo: 'SI_NO', esCritico: true },
      { id: 'SA006', nombre: 'Sector residuos diferenciados', tipo: 'SI_NO', esCritico: false },
    ]
  },
  {
    id: 'SVC003',
    nombre: 'Laboratorio',
    declarado: true,
    tieneSubareas: false,
  },
];

export const EQUIPAMIENTO: ItemEquipamiento[] = [
  { id: 'EQ001', servicio: 'Guardia Médica', nombre: 'Cardiodesfibrilador portátil', declarado: 2 },
  { id: 'EQ002', servicio: 'Guardia Médica', nombre: 'Monitor multiparamétrico', declarado: 4 },
  { id: 'EQ003', servicio: 'Internación General', nombre: 'Bomba de infusión continua', declarado: 12 },
  { id: 'EQ004', servicio: 'Otros', nombre: 'Autoclave de esterilización', declarado: 1 },
];

export const PERSONAL: ItemPersonal[] = [
  { id: 'PS001', servicio: 'Guardia Médica', rol: 'Médico Emergentólogo', esJefe: false, declarado: 6 },
  { id: 'PS002', servicio: 'Guardia Médica', rol: 'Jefe de Guardia', esJefe: true, declarado: 1 },
  { id: 'PS003', servicio: 'Internación General', rol: 'Enfermero Profesional', esJefe: false, declarado: 18 },
  { id: 'PS004', servicio: 'Internación General', rol: 'Médico Clínico de Guardia', esJefe: false, declarado: 4 },
];

export const DIRECTORES = [
  { id: 'DIR001', servicio: 'Dirección Médica General', rol: 'Director Médico', declarado: 1 },
  { id: 'DIR002', servicio: 'Farmacia del Establecimiento', rol: 'Director de Farmacia / Farmacéutico', declarado: 1 },
];

export const SALAS: ItemSala[] = [
  { id: 'SAL001', nombre: 'Sala de Shockroom (Guardia)', tipo: 'SALA', declarado: 1 },
  { id: 'SAL002', nombre: 'Consultorios de Guardia', tipo: 'SALA', declarado: 4 },
  { id: 'SAL003', nombre: 'Habitaciones de Internación General', tipo: 'SALA', declarado: 17 },
];

export const CAMAS: ItemSala[] = [
  { id: 'CAM001', nombre: 'Camas de Shockroom', tipo: 'CAMA', declarado: 2 },
  { id: 'CAM002', nombre: 'Camas de internación general (adultos)', tipo: 'CAMA', declarado: 34 },
];

export const DATOS_GENERALES: ItemDatosGenerales[] = [
  { id: 'DG_SUB1', seccion: 'Seguridad e Infraestructura', label: 'Seguridad contra incendios y evacuación', tipo: 'SUBSECCION' },
  { id: 'DG001', seccion: 'Seguridad e Infraestructura', subseccion: 'Seguridad contra incendios y evacuación', label: 'Plan de Evacuación vigente y aprobado', tipo: 'SI_NO', esCritico: true },
  { id: 'DG002', seccion: 'Seguridad e Infraestructura', subseccion: 'Seguridad contra incendios y evacuación', label: 'Extintores con carga vigente (vencimiento visible)', tipo: 'SI_NO', esCritico: true },
  { id: 'DG003', seccion: 'Seguridad e Infraestructura', subseccion: 'Seguridad contra incendios y evacuación', label: 'Luces de emergencia funcionales en vías de escape', tipo: 'SI_NO', esCritico: false },
  
  { id: 'DG_SUB2', seccion: 'Gestión de Residuos', label: 'Residuos patógenos', tipo: 'SUBSECCION' },
  { id: 'DG004', seccion: 'Gestión de Residuos', subseccion: 'Residuos patógenos', label: 'Depósito intermedio de residuos diferenciados', tipo: 'SI_NO', esCritico: false },
  { id: 'DG005', seccion: 'Gestión de Residuos', subseccion: 'Residuos patógenos', label: 'Contrato vigente con empresa recolectora de patógenos', tipo: 'SI_NO', esCritico: true },
];

export const DOCUMENTOS: DocumentoAdjunto[] = [
  { id: 'DOC001', categoria: 'Documentación Institucional', nombre: 'Tasa Retributiva de Servicios', url: '#' },
  { id: 'DOC002', categoria: 'Documentación Institucional', nombre: 'Estatuto Social / Contrato Constitutivo', url: '#' },
  { id: 'DOC003', categoria: 'Habilitaciones y Seguridad', nombre: 'Certificado de Bomberos', url: '#' },
  { id: 'DOC004', categoria: 'Habilitaciones y Seguridad', nombre: 'Habilitación municipal vigente', url: '#' },
  { id: 'DOC005', categoria: 'Habilitaciones y Seguridad', nombre: 'Certificado de calderas y ascensores', url: '#' },
  { id: 'DOC006', categoria: 'Radiofísica', nombre: 'Habilitación de equipos emisores de radiación ionizante', url: '#' },
  { id: 'DOC007', categoria: 'Radiofísica', nombre: 'Dosimetría del personal expuesto', url: '#' },
];

// ── HALLAZGOS MOCK (para módulo Efector) ──────────────────────

export interface Hallazgo {
  id: string;
  seccion: 'DATOS_GENERALES' | 'DATOS_TRAMITE';
  tipo: 'DIFERENCIA_CONSTATADA' | 'DOCUMENTO_OBSERVADO' | 'INCONSISTENCIA';
  origen: string;
  categoria: string;
  observacion: string;
  declarado?: number | string;
  observado?: number | string;
  fotografia?: string;
  respuesta?: string;
  documentoAdjunto?: string;
  estadoRevision?: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
}

export const HALLAZGOS: Hallazgo[] = [
  {
    id: 'H001',
    seccion: 'DATOS_GENERALES',
    tipo: 'INCONSISTENCIA',
    origen: 'Seguridad e Infraestructura',
    categoria: 'Plan de Evacuación vigente',
    observacion: 'NO CUMPLE — El plan de evacuación no se encuentra actualizado ni firmado por autoridad competente.',
    estadoRevision: 'PENDIENTE',
  },
  {
    id: 'H002',
    seccion: 'DATOS_TRAMITE',
    tipo: 'DIFERENCIA_CONSTATADA',
    origen: 'Guardia Médica',
    categoria: 'Cardiodesfibrilador',
    observacion: 'DECLARADO: 2, OBSERVADO: 1',
    declarado: 2,
    observado: 1,
    estadoRevision: 'PENDIENTE',
  },
  {
    id: 'H003',
    seccion: 'DATOS_TRAMITE',
    tipo: 'DIFERENCIA_CONSTATADA',
    origen: 'Internación General',
    categoria: 'Camas de internación general',
    observacion: 'DECLARADO: 34, OBSERVADO: 40 (excede habilitación)',
    declarado: 34,
    observado: 40,
    estadoRevision: 'PENDIENTE',
  },
  {
    id: 'H004',
    seccion: 'DATOS_TRAMITE',
    tipo: 'DOCUMENTO_OBSERVADO',
    origen: 'Habilitaciones y Seguridad',
    categoria: 'Certificado de Bomberos',
    observacion: 'El certificado presentado se encuentra vencido desde el 15/01/2024.',
    estadoRevision: 'PENDIENTE',
  },
];

// ── USUARIOS MOCK ─────────────────────────────────────────────

export type Rol = 'INSPECTOR' | 'ARQUITECTO' | 'AUDITOR' | 'COORDINADOR' | 'PROTOCOLIZADOR' | 'EFECTOR' | 'CONSULTOR';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  cuil: string;
  rol: Rol;
  avatar: string;
}

export const USUARIOS: Usuario[] = [
  {
    id: 'USR001',
    nombre: 'Valeria',
    apellido: 'Romero',
    cuil: '27-33445566-7',
    rol: 'INSPECTOR',
    avatar: 'VR',
  },
  {
    id: 'USR002',
    nombre: 'Carlos',
    apellido: 'Pérez',
    cuil: '20-22334455-1',
    rol: 'EFECTOR',
    avatar: 'CP',
  },
  {
    id: 'USR003',
    nombre: 'Mateo',
    apellido: 'Soler',
    cuil: '20-31122334-5',
    rol: 'ARQUITECTO',
    avatar: 'MS',
  },
  {
    id: 'USR004',
    nombre: 'Ana',
    apellido: 'Blanco',
    cuil: '27-44556677-8',
    rol: 'AUDITOR',
    avatar: 'AB',
  },
  {
    id: 'USR005',
    nombre: 'Juan',
    apellido: 'Gomez',
    cuil: '20-55667788-9',
    rol: 'COORDINADOR',
    avatar: 'JG',
  },
  {
    id: 'USR006',
    nombre: 'Sofía',
    apellido: 'Díaz',
    cuil: '27-66778899-0',
    rol: 'PROTOCOLIZADOR',
    avatar: 'SD',
  },
  {
    id: 'USR007',
    nombre: 'Laura',
    apellido: 'Martínez',
    cuil: '27-77889900-1',
    rol: 'CONSULTOR',
    avatar: 'LM',
  },
];

// ── OPCIONES EMPLAZAMIENTO ─────────────────────────────────────

export const OPCIONES_EMPLAZAMIENTO = [
  { id: 'E24H', label: '24 horas', horas: 24 },
  { id: 'E48H', label: '48 horas', horas: 48 },
  { id: 'E5D',  label: '5 días',   horas: 120 },
  { id: 'E10D', label: '10 días',  horas: 240 },
  { id: 'E15D', label: '15 días',  horas: 360 },
];

// ── ESTADO BADGE CONFIG ────────────────────────────────────────

export const ESTADO_CONFIG: Record<EstadoTramite, { label: string; badge: string; icon: string }> = {
  BORRADOR_ARQ: { label: 'Borrador Arquitectura', badge: 'badge-neutral', icon: 'drafts' },
  PENDIENTE_EVAL_ARQ: { label: 'Pendiente Evaluación Arquitectura', badge: 'badge-info', icon: 'hourglass_empty' },
  EN_ANALISIS_ARQ: { label: 'En Análisis Arquitectura', badge: 'badge-info', icon: 'search' },
  OBSERVADO_ARQ: { label: 'Observado Arquitectura', badge: 'badge-danger', icon: 'warning' },
  RECTIFICADO_ARQ: { label: 'Rectificado Arquitectura', badge: 'badge-warning', icon: 'edit_note' },
  ADECUADO_ARQ: { label: 'Adecuado Arquitectura', badge: 'badge-success', icon: 'check_circle' },
  ADECUADO_OBS_ARQ: { label: 'Adecuado con Obs. Arquitectura', badge: 'badge-warning', icon: 'report_problem' },
  RECHAZADO_ARQ: { label: 'Rechazado Arquitectura', badge: 'badge-danger', icon: 'cancel' },
  BORRADOR_AUD: { label: 'Borrador Auditoría', badge: 'badge-neutral', icon: 'drafts' },
  PENDIENTE_EVAL_AUD: { label: 'Pendiente Evaluación Auditoría', badge: 'badge-info', icon: 'hourglass_empty' },
  EN_ANALISIS_AUD: { label: 'En Análisis Auditoría', badge: 'badge-info', icon: 'search' },
  OBSERVADO_AUD: { label: 'Observado Auditoría', badge: 'badge-danger', icon: 'warning' },
  RECTIFICADO_AUD: { label: 'Rectificado Auditoría', badge: 'badge-warning', icon: 'edit_note' },
  ACEPTADO_DOC_AUD: { label: 'Aceptado Doc. Auditoría', badge: 'badge-success', icon: 'check_circle' },
  OBSERVADO_INSP: { label: 'Observado Inspección', badge: 'badge-danger', icon: 'warning' },
  DESCARGO_INSP: { label: 'Respuesta Emplazamiento', badge: 'badge-warning', icon: 'assignment_returned' },
  ACEPTADO_INSP: { label: 'Aceptado Inspección', badge: 'badge-success', icon: 'check_circle' },
  RECHAZADO_INSP: { label: 'Rechazado Inspección', badge: 'badge-danger', icon: 'cancel' },
  RE_INSP_SOLICITADA: { label: 'Re-Inspección Solicitada', badge: 'badge-warning', icon: 'assignment_return' },
  EN_PROTOCOLIZACION: { label: 'En Protocolización', badge: 'badge-info', icon: 'history_edu' },
  FINALIZADO: { label: 'Finalizado', badge: 'badge-success', icon: 'verified' },
};
(ESTADO_CONFIG as any)['RECHAZADO_INSPECCION'] = ESTADO_CONFIG.RECHAZADO_INSP;
// Fallback alias mappings for backward compatibility
(ESTADO_CONFIG as any)['PENDIENTE_ARQUITECTURA'] = ESTADO_CONFIG.PENDIENTE_EVAL_ARQ;
(ESTADO_CONFIG as any)['PENDIENTE_AUDITORIA'] = ESTADO_CONFIG.PENDIENTE_EVAL_AUD;
(ESTADO_CONFIG as any)['ACEPTADO_DOC_AUDITORIA'] = ESTADO_CONFIG.ACEPTADO_DOC_AUD;
(ESTADO_CONFIG as any)['EN_INSPECCION'] = ESTADO_CONFIG.ACEPTADO_DOC_AUD;
(ESTADO_CONFIG as any)['RESPUESTA_EMPLAZAMIENTO'] = ESTADO_CONFIG.DESCARGO_INSP;
(ESTADO_CONFIG as any)['ACEPTADO_INSPECCION'] = ESTADO_CONFIG.ACEPTADO_INSP;
(ESTADO_CONFIG as any)['NO_APRUEBA'] = ESTADO_CONFIG.RECHAZADO_ARQ;
(ESTADO_CONFIG as any)['PENDIENTE_PROTOCOLIZAR'] = ESTADO_CONFIG.EN_PROTOCOLIZACION;

// ── ALERTAS DE INSPECCIÓN POR DENUNCIA ────────────────────────────

export type PrioridadDenuncia = 'CRITICA' | 'URGENTE' | 'NORMAL';
export type OrigenDenuncia = 'CIUDADANA' | 'JUDICIAL' | 'AUTORIDAD';

export interface AlertaDenunciaItem {
  id: string;
  establecimientoId: string;
  denominacion: string;
  nroExpediente: string;
  nroExpedienteDenuncia: string;
  cuit: string;
  tipologia: string;
  localidad: string;
  departamento: string;
  domicilio: string;
  fechaIngresoDenuncia: string;        // ISO date
  diasSinAtencion: number;             // días desde ingreso
  prioridad: PrioridadDenuncia;
  origen: OrigenDenuncia;
  descripcionMotivo: string;
  inspectorSugerido?: string;
  sinAsignar: boolean;
}

export const ALERTAS_DENUNCIA: AlertaDenunciaItem[] = [
  {
    id: 'ALT-DEN-001',
    establecimientoId: 'EST010',
    denominacion: 'Sanatorio Sierra Bella S.A.',
    nroExpediente: 'EX-2024-0158900-APN-MS#CBA',
    nroExpedienteDenuncia: 'DEN-2026-0041',
    cuit: '30-71882233-9',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    localidad: 'Córdoba',
    departamento: 'Capital',
    domicilio: 'Av. Colón 4500',
    fechaIngresoDenuncia: '2026-07-30',
    diasSinAtencion: 7,
    prioridad: 'CRITICA',
    origen: 'JUDICIAL',
    descripcionMotivo: 'Requerimiento judicial por presunto abandono de paciente en guardia. Juez Federal oficio N° 1204/2026.',
    inspectorSugerido: 'Dr. Marcelo Juárez',
    sinAsignar: false,
  },
  {
    id: 'ALT-DEN-002',
    establecimientoId: 'EST011',
    denominacion: 'Geriátrico Nueva Esperanza',
    nroExpediente: 'EX-2024-0158901-APN-MS#CBA',
    nroExpedienteDenuncia: 'DEN-2026-0042',
    cuit: '30-71445566-3',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    localidad: 'Córdoba',
    departamento: 'Capital',
    domicilio: 'Av. Patria 890',
    fechaIngresoDenuncia: '2026-08-01',
    diasSinAtencion: 5,
    prioridad: 'CRITICA',
    origen: 'AUTORIDAD',
    descripcionMotivo: 'Disposición de la Dirección de Legales por mal manejo de residuos patológicos. Acción inmediata requerida.',
    inspectorSugerido: undefined,
    sinAsignar: true,
  },
  {
    id: 'ALT-DEN-003',
    establecimientoId: 'EST012',
    denominacion: 'Farmacia del Centro',
    nroExpediente: 'EX-2024-0100010-APN-MS#CBA',
    nroExpedienteDenuncia: 'DEN-2026-0038',
    cuit: '30-44444444-4',
    tipologia: 'FARMACIA',
    localidad: 'Córdoba',
    departamento: 'Capital',
    domicilio: 'Av. General Paz 320',
    fechaIngresoDenuncia: '2026-08-03',
    diasSinAtencion: 3,
    prioridad: 'URGENTE',
    origen: 'CIUDADANA',
    descripcionMotivo: 'Denuncia ciudadana por despacho de medicamentos sin receta y sin habilitación actualizada de farmacéutico director.',
    inspectorSugerido: 'Dra. Valeria Romero',
    sinAsignar: false,
  },
  {
    id: 'ALT-DEN-004',
    establecimientoId: 'EST013',
    denominacion: 'Residencia Geriátrica Los Pinos',
    nroExpediente: 'EX-2024-0100011-APN-MS#CBA',
    nroExpedienteDenuncia: 'DEN-2026-0039',
    cuit: '30-55555555-5',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    localidad: 'Villa Allende',
    departamento: 'Colón',
    domicilio: 'Calle Los Aromos 150',
    fechaIngresoDenuncia: '2026-08-04',
    diasSinAtencion: 2,
    prioridad: 'URGENTE',
    origen: 'CIUDADANA',
    descripcionMotivo: 'Denuncia de familiar por condiciones de higiene deficientes y falta de personal nocturno en pabellón de mayor dependencia.',
    inspectorSugerido: undefined,
    sinAsignar: true,
  },
  {
    id: 'ALT-DEN-005',
    establecimientoId: 'EST014',
    denominacion: 'Clínica Dental Sonrisa',
    nroExpediente: 'EX-2024-0100002-APN-MS#CBA',
    nroExpedienteDenuncia: 'DEN-2026-0035',
    cuit: '30-22222222-2',
    tipologia: 'CONSULTORIO',
    localidad: 'Mendoza',
    departamento: 'Mendoza',
    domicilio: 'Av. Libertad 123',
    fechaIngresoDenuncia: '2026-08-05',
    diasSinAtencion: 1,
    prioridad: 'NORMAL',
    origen: 'CIUDADANA',
    descripcionMotivo: 'Denuncia por consulta no registrada en libro y cobro de práctica no declarada en arancelamiento.',
    inspectorSugerido: 'Dr. Marcelo Juárez',
    sinAsignar: false,
  },
  {
    id: 'ALT-DEN-006',
    establecimientoId: 'EST015',
    denominacion: 'Centro de Diálisis Norte',
    nroExpediente: 'EX-2024-0100020-APN-MS#CBA',
    nroExpedienteDenuncia: 'DEN-2026-0040',
    cuit: '30-66666666-6',
    tipologia: 'CENTRO DE DIÁLISIS',
    localidad: 'Córdoba',
    departamento: 'Capital',
    domicilio: 'Bv. Los Alemanes 800',
    fechaIngresoDenuncia: '2026-08-06',
    diasSinAtencion: 0,
    prioridad: 'URGENTE',
    origen: 'AUTORIDAD',
    descripcionMotivo: 'Requerimiento de la Secretaría de Salud por presunto incumplimiento en ratio paciente/máquina de diálisis.',
    inspectorSugerido: undefined,
    sinAsignar: true,
  },
];

// ── ALERTAS DE INSPECCIÓN POR RUTINA ──────────────────────────────

export const ALERTAS_RUTINA: AlertaRutinaItem[] = [
  {
    id: 'ALT-RUT-001',
    establecimientoId: 'EST003',
    denominacion: 'Geriátrico El Sosiego',
    nroExpediente: 'EX-2024-0052100-APN-MS#CBA',
    cuit: '30-78901234-5',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    localidad: 'Río Cuarto',
    departamento: 'Río Cuarto',
    domicilio: 'Calle Rioja 890',
    ultimaInspeccionFecha: '2025-11-15',
    frecuenciaAnual: 3,
    inspeccionesRealizadasAno: 2,
    proximaInspeccionSugeridaFecha: '2026-08-18',
    diasParaProximaInspeccionSugerida: 14,
    ventanaAlerta: 'ROJO_T15',
    diasParaVencimiento: 12,
    inspectorSugerido: 'Dra. Valeria Romero',
    tramiteActivoEnCurso: {
      id: 'TRM002',
      nroTramite: '2024-000089',
      tipo: 'RENOVACION',
      estado: 'DESCARGO_INSP',
    },
  },
  {
    id: 'ALT-RUT-002',
    establecimientoId: 'EST001',
    denominacion: 'Clínica del Parque S.A.',
    nroExpediente: 'EX-2024-0045672-APN-MS#CBA',
    cuit: '30-71234567-8',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    localidad: 'Córdoba',
    departamento: 'Capital',
    domicilio: 'Av. Rafael Núñez 4750',
    ultimaInspeccionFecha: '2025-08-20',
    frecuenciaAnual: 1,
    inspeccionesRealizadasAno: 1,
    ventanaAlerta: 'AMARILLO_T30',
    diasParaVencimiento: 28,
    inspectorSugerido: 'Dra. Valeria Romero',
  },
  {
    id: 'ALT-RUT-003',
    establecimientoId: 'EST006',
    denominacion: 'Residencia Senior Los Olivos',
    nroExpediente: 'EX-2024-0110201-APN-MS#CBA',
    cuit: '30-71998877-4',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    localidad: 'Córdoba',
    departamento: 'Capital',
    domicilio: 'Av. Valparaíso 3200',
    ultimaInspeccionFecha: '2025-05-10',
    frecuenciaAnual: 3,
    inspeccionesRealizadasAno: 1,
    proximaInspeccionSugeridaFecha: '2026-07-20',
    diasParaProximaInspeccionSugerida: -15,
    ventanaAlerta: 'CRITICO_VENCIDO',
    diasParaVencimiento: -14,
    inspectorSugerido: 'Lic. Mariana Silva',
  },
  {
    id: 'ALT-RUT-004',
    establecimientoId: 'EST002',
    denominacion: 'Sanatorio San Martín',
    nroExpediente: 'EX-2024-0039841-APN-MS#CBA',
    cuit: '30-65432198-7',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    localidad: 'Villa María',
    departamento: 'General San Martín',
    domicilio: 'Bv. San Juan 1200',
    ultimaInspeccionFecha: '2025-09-01',
    frecuenciaAnual: 1,
    ventanaAlerta: 'AMARILLO_T30',
    diasParaVencimiento: 22,
    inspectorSugerido: 'Dr. Marcelo Juárez',
  },
  {
    id: 'ALT-RUT-005',
    establecimientoId: 'EST004',
    denominacion: 'Centro Médico Punilla',
    nroExpediente: 'EX-2024-0099883-APN-MS#CBA',
    cuit: '30-77788899-2',
    tipologia: 'CENTRO DE SALUD AMBULATORIA',
    localidad: 'Villa Carlos Paz',
    departamento: 'Punilla',
    domicilio: 'Av. San Martín 150',
    ultimaInspeccionFecha: '2025-07-12',
    frecuenciaAnual: 1,
    ventanaAlerta: 'ROJO_T15',
    diasParaVencimiento: 8,
    inspectorSugerido: 'Lic. Mariana Silva',
  },
  {
    id: 'ALT-RUT-006',
    establecimientoId: 'EST008',
    denominacion: 'Clínica Santa Rosa de Lima',
    nroExpediente: 'EX-2024-0112345-APN-MS#CBA',
    cuit: '30-80112233-9',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    localidad: 'Río Cuarto',
    departamento: 'Río Cuarto',
    domicilio: 'Av. Constitución 1800',
    ultimaInspeccionFecha: '2025-07-05',
    frecuenciaAnual: 1,
    ventanaAlerta: 'ROJO_T15',
    diasParaVencimiento: 10,
    inspectorSugerido: 'Dr. Marcelo Juárez',
    tramiteActivoEnCurso: {
      id: 'TRM010',
      nroTramite: '2024-000210',
      tipo: 'MODIFICACION',
      estado: 'INICIADO',
      estadoSimultaneo: 'INICIADO',
      fechaEstado: '28/07/2026',
    },
  },
  {
    id: 'ALT-RUT-007',
    establecimientoId: 'EST009',
    denominacion: 'Sanatorio Nuestra Señora del Rosario',
    nroExpediente: 'EX-2024-0123456-APN-MS#CBA',
    cuit: '30-90223344-1',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    localidad: 'Córdoba',
    departamento: 'Capital',
    domicilio: 'Bv. Chacabuco 3300',
    ultimaInspeccionFecha: '2025-07-20',
    frecuenciaAnual: 1,
    ventanaAlerta: 'CRITICO_VENCIDO',
    diasParaVencimiento: -5,
    inspectorSugerido: 'Dra. Valeria Romero',
    tramiteActivoEnCurso: {
      id: 'TRM011',
      nroTramite: '2024-000335',
      tipo: 'RENOVACION',
      estado: 'ENVIADO',
      estadoSimultaneo: 'ENVIADO',
      fechaEstado: '01/08/2026',
    },
  },
];

