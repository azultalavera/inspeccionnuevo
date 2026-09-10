import masterDb from './masterDb.json'

export interface MasterConfigSectionField {
  id: string;
  label: string;
  name?: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'checkbox' | 'date' | 'select' | 'toggle' | 'radio';
  options?: string;
  origin?: string;
  tramiteField?: string;
  valorTramite?: string | number | boolean;
  valorTramiteMock?: string | number | boolean;
  cantidadMinima?: number;
  valorDeclarado?: number | string;
  especialidad?: string;
  tipoPlantel?: string;
  isExtra?: boolean;
  _srvName?: string;
  _type?: string;
  _originalSrv?: string;
}

export interface MasterConfigSection {
  id: string;
  name: string;
  fields: MasterConfigSectionField[];
}

export interface MasterConfigService {
  id: string;
  name: string;
  sections?: MasterConfigSection[];
  fields?: MasterConfigSectionField[];
}

export interface MasterConfig {
  id: string;
  tipologia: string;
  servicios: MasterConfigService[];
}

export function getMasterConfig(tipologia?: string): MasterConfig {
  const configs = masterDb.configuraciones_maestras as unknown as MasterConfig[];
  if (!configs || configs.length === 0) {
    throw new Error('No master configurations found');
  }

  if (tipologia) {
    const norm = tipologia.trim().toUpperCase();
    const found = configs.find(c => c.tipologia.toUpperCase() === norm || norm.includes(c.tipologia.toUpperCase()) || c.tipologia.toUpperCase().includes(norm));
    if (found) return found;
  }

  return configs[0];
}

export const DEFAULT_EFECTOR_DATA = {
  servicios: [
    "GUARDIA",
    "INTERNACIÓN GENERAL",
    "UCI (CUIDADOS INTERMEDIOS)",
    "UTI (TERAPIA INTENSIVA ADULTOS)",
    "UNIDAD CORONARIA",
    "CIRUGÍA GENERAL",
    "ESTERILIZACIÓN",
    "DIAGNÓSTICO POR IMÁGENES",
    "LABORATORIO DE ANÁLISIS CLÍNICOS",
    "HEMOTERAPIA",
    "FARMACIA",
    "ALIMENTACIÓN"
  ],
  infraestructura: {
    "Camas de Internación General": 45,
    "Camas de Terapia Intensiva (UTI)": 8,
    "Camas de Unidad Coronaria (UCO)": 6,
    "Camas de Cuidados Intermedios (UCI)": 10,
    "Camas de Observación en Guardia": 6,
    "Quirófanos": 3,
    "Salas de Parto": 1,
    "Consultorios Externos": 12,
    "Salas de Rayos X": 2,
    "Salas de Tomografía": 1
  },
  rrhh: [
    { id: "1", especialidad: "GUARDIA ACTIVA", tipoPlantel: "MÉDICO", origen: "GUARDIA", cantidadCargada: 2 },
    { id: "2", especialidad: "TURNO DIURNO", tipoPlantel: "ENFERMERÍA", origen: "INTERNACIÓN GENERAL", cantidadCargada: 4 },
    { id: "3", especialidad: "TURNO NOCTURNO", tipoPlantel: "ENFERMERÍA", origen: "INTERNACIÓN GENERAL", cantidadCargada: 3 },
    { id: "4", especialidad: "GUARDIA ACTIVA", tipoPlantel: "MÉDICO", origen: "UTI (TERAPIA INTENSIVA ADULTOS)", cantidadCargada: 2 },
    { id: "5", especialidad: "ENFERMERO PROFESIONAL", tipoPlantel: "ENFERMERÍA", origen: "UTI (TERAPIA INTENSIVA ADULTOS)", cantidadCargada: 2 },
    { id: "6", especialidad: "ASISTENTE", tipoPlantel: "MÉDICO", origen: "UNIDAD CORONARIA", cantidadCargada: 1 },
    { id: "7", especialidad: "NUTRICIONISTA", tipoPlantel: "TÉCNICO", origen: "ALIMENTACIÓN", cantidadCargada: 1 }
  ],
  jefes: [
    { id: "1", especialidad: "ESPECIALISTA TERAPIA INTENSIVA", tipoPlantel: "MÉDICO", origen: "UCI (CUIDADOS INTERMEDIOS)", nombre: "Dr. Roberto Gómez" },
    { id: "2", especialidad: "ESPECIALISTA TERAPIA INTENSIVA (3HS DIARIAS)", tipoPlantel: "MÉDICO", origen: "UTI (TERAPIA INTENSIVA ADULTOS)", nombre: "Dra. Silvina Romero" },
    { id: "3", especialidad: "CARDIOLOGÍA", tipoPlantel: "MÉDICO", origen: "UNIDAD CORONARIA", nombre: "Dr. Carlos Menéndez" }
  ],
  equipamientos: [
    { id: "1", equipamiento: "CARDIODESFIBRILADOR", origen: "GUARDIA", actualQty: 1 },
    { id: "2", equipamiento: "ELECTROCARDIÓGRAFO", origen: "GUARDIA", actualQty: 1 },
    { id: "3", equipamiento: "RESPIRADOR MICROPROCESADO", origen: "UTI (TERAPIA INTENSIVA ADULTOS)", actualQty: 8 },
    { id: "4", equipamiento: "MONITOR MULTIPARAMÉTRICO", origen: "UTI (TERAPIA INTENSIVA ADULTOS)", actualQty: 8 },
    { id: "5", equipamiento: "BOMBA DE INFUSIÓN", origen: "UTI (TERAPIA INTENSIVA ADULTOS)", actualQty: 16 },
    { id: "6", equipamiento: "MONITOR MULTIPARAMÉTRICO CON CAPNOGRAFÍA", origen: "UNIDAD CORONARIA", actualQty: 6 },
    { id: "7", equipamiento: "EQUIPO DE RAYOS X RODANTE", origen: "DIAGNÓSTICO POR IMÁGENES", actualQty: 1 }
  ],
  directorTecnico: {
    nombre: "JUAN CARLOS",
    apellido: "PÉREZ",
    dni: "20.455.123",
    matricula: "MP-14892"
  }
};
