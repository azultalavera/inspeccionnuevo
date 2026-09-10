export interface CamposBooleanos {
  [key: string]: boolean;
  unidad: boolean;
  cargaMarca: boolean;
  cargaModelo: boolean;
  cargaSerie: boolean;
  condicion: boolean;
  numeroPM: boolean;
  movilidad: boolean;
  usoEquipo: boolean;
  anoFabricacion: boolean;
  antiguedad: boolean;
  cantidad: boolean;
  tesla: boolean;
  tensionMax: boolean;
  corrienteMax: boolean;
  potencia: boolean;
  energia: boolean;
  fluencia: boolean;
  longitudOnda: boolean;
  cantidadFuentes: boolean;
  tipoRevelado: boolean;
}

export interface TipoEquipo {
  id: number;
  tipologia: string;
  nombre: string;
  booleanos: CamposBooleanos;
}

export const OPCIONES_TIPOLOGIA = [
  "RADIOFÍSICA",
  "CLÍNICAS",
  "UNIDAD O SERVICIO DE DIÁLISIS",
  "CENTRO DE ESTÉTICA CORPORAL",
  "CENTRO DE SALUD AMBULATORIA",
  "CENTRO CIRUGÍA AMBULATORIA",
  "CSH - CLÍNICAS, SANATORIOS Y HOSPITALES",
  "CONSULTORIO",
  "ESTABLECIMIENTO / UNIDAD DE CUIDADOS PALIATIVOS CON INTERNACIÓN",
  "SERVICIO DE ATENCIÓN EXTRAHOSPITALARIO MÓVIL",
  "ESTABLECIMIENTOS GERIÁTRICOS (GER.)",
  "HOSPITAL DE DÍA ONCOLÓGICO. CENTRO Y/O SERVICIO DE QUIMIOTERAPIA",
  "LABORATORIO DE ANÁLISIS CLÍNICOS",
  "ÓPTICA Y CONTACTOLOGÍA",
  "SERVICIO DE INTERNACIÓN DOMICILIARIA",
  "TATUADORES Y PERFORADORES",
];

// ─── Base de Datos Oficial ──────────────────────────────────────────────────
export const TIPOS_EQUIPOS_DATABASE: TipoEquipo[] = [
  // ── RADIOFÍSICA (Servicios Específicos) ──────────────────────────────────
  {
    id: 1,
    tipologia: "RADIOFÍSICA",
    nombre: "RESONANCIA MAGNÉTICA",
    booleanos: {
      unidad: false,
      cargaMarca: true,
      cargaModelo: true,
      cargaSerie: true,
      condicion: true,
      numeroPM: true,
      movilidad: false,
      usoEquipo: false,
      anoFabricacion: true,
      antiguedad: false,
      cantidad: false,
      tesla: true,
      tensionMax: false,
      corrienteMax: false,
      potencia: false,
      energia: false,
      fluencia: false,
      longitudOnda: false,
      cantidadFuentes: false,
      tipoRevelado: true,
    },
  },
  {
    id: 2,
    tipologia: "RADIOFÍSICA",
    nombre: "LÁSER",
    booleanos: {
      unidad: false,
      cargaMarca: true,
      cargaModelo: true,
      cargaSerie: true,
      condicion: true,
      numeroPM: true,
      movilidad: true,
      usoEquipo: false,
      anoFabricacion: true,
      antiguedad: false,
      cantidad: false,
      tesla: false,
      tensionMax: false,
      corrienteMax: false,
      potencia: true,
      energia: true,
      fluencia: true,
      longitudOnda: true,
      cantidadFuentes: false,
      tipoRevelado: true,
    },
  },
  {
    id: 3,
    tipologia: "RADIOFÍSICA",
    nombre: "RAYOS X",
    booleanos: {
      unidad: false,
      cargaMarca: true,
      cargaModelo: true,
      cargaSerie: true,
      condicion: true,
      numeroPM: true,
      movilidad: true,
      usoEquipo: false,
      anoFabricacion: true,
      antiguedad: false,
      cantidad: false,
      tesla: false,
      tensionMax: true,
      corrienteMax: true,
      potencia: false,
      energia: false,
      fluencia: false,
      longitudOnda: false,
      cantidadFuentes: false,
      tipoRevelado: true,
    },
  },
  {
    id: 4,
    tipologia: "RADIOFÍSICA",
    nombre: "ULTRAVIOLETA",
    booleanos: {
      unidad: false,
      cargaMarca: true,
      cargaModelo: true,
      cargaSerie: true,
      condicion: true,
      numeroPM: true,
      movilidad: false,
      usoEquipo: true,
      anoFabricacion: true,
      antiguedad: false,
      cantidad: false,
      tesla: false,
      tensionMax: false,
      corrienteMax: false,
      potencia: true,
      energia: false,
      fluencia: false,
      longitudOnda: false,
      cantidadFuentes: true,
      tipoRevelado: true,
    },
  },
  {
    id: 5,
    tipologia: "RADIOFÍSICA",
    nombre: "ELEMENTOS DE PROTECCIÓN PERSONAL",
    booleanos: {
      unidad: true,
      cargaMarca: true,
      cargaModelo: false,
      cargaSerie: false,
      condicion: false,
      numeroPM: false,
      movilidad: false,
      usoEquipo: false,
      anoFabricacion: false,
      antiguedad: true,
      cantidad: true,
      tesla: false,
      tensionMax: false,
      corrienteMax: false,
      potencia: false,
      energia: false,
      fluencia: false,
      longitudOnda: false,
      cantidadFuentes: false,
      tipoRevelado: false,
    },
  },

  // ── CLÍNICAS (Aplica para TODOS LOS SERVICIOS y ELEMENTOS DE PROTECCIÓN PERSONAL) ──
  {
    id: 6,
    tipologia: "CLÍNICAS",
    nombre: "TODOS LOS SERVICIOS",
    booleanos: {
      unidad: false,
      cargaMarca: true,
      cargaModelo: true,
      cargaSerie: true,
      condicion: false,
      numeroPM: false,
      movilidad: false,
      usoEquipo: false,
      anoFabricacion: false,
      antiguedad: false,
      cantidad: false,
      tesla: false,
      tensionMax: false,
      corrienteMax: false,
      potencia: false,
      energia: false,
      fluencia: false,
      longitudOnda: false,
      cantidadFuentes: false,
      tipoRevelado: false,
    },
  },
  {
    id: 7,
    tipologia: "CLÍNICAS",
    nombre: "ELEMENTOS DE PROTECCIÓN PERSONAL",
    booleanos: {
      unidad: true,
      cargaMarca: true,
      cargaModelo: false,
      cargaSerie: false,
      condicion: false,
      numeroPM: false,
      movilidad: false,
      usoEquipo: false,
      anoFabricacion: false,
      antiguedad: true,
      cantidad: true,
      tesla: false,
      tensionMax: false,
      corrienteMax: false,
      potencia: false,
      energia: false,
      fluencia: false,
      longitudOnda: false,
      cantidadFuentes: false,
      tipoRevelado: false,
    },
  },
];
