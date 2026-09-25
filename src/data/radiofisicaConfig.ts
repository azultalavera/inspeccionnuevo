// ============================================================
// CLICSALUD+ — CONFIGURACIÓN Y CATÁLOGO DE RADIOFÍSICA
// Servicios, Subservicios y Plantillas Dinámicas de Inspección
// ============================================================

import type { MasterConfig, MasterConfigService, MasterConfigSection, MasterConfigSectionField } from './masterConfig';

export interface SubservicioRadiofisica {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  icono: string;
  normativa: string;
  camposEspecificos?: MasterConfigSectionField[];
}

export interface TipoServicioRadiofisica {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
  camposGeneralesTipo?: MasterConfigSectionField[];
  subservicios: SubservicioRadiofisica[];
}

export const RADIOFISICA_CATALOG: TipoServicioRadiofisica[] = [
  // ────────────────────────────────────────────────────────────
  // 1. RAYOS X
  // ────────────────────────────────────────────────────────────
  {
    id: "rayos-x",
    nombre: "Rayos X",
    icono: "electric_bolt",
    color: "#0284C7",
    descripcion: "Equipamiento emisor de radiación ionizante para diagnóstico e intervención.",
    subservicios: [
      {
        id: "rad-convencional-simple",
        nombre: "Radiología Convencional Simple",
        tipo: "Rayos X",
        descripcion: "Estudios radiológicos estándar en estativo de pared y mesa radiográfica.",
        icono: "medical_information",
        normativa: "Res. Min. 2680/68 y Ley Nac. 17.557"
      },
      {
        id: "rad-industrial",
        nombre: "Radiología Industrial",
        tipo: "Rayos X",
        descripcion: "Ensayos no destructivos y control de materiales mediante rayos X industriales.",
        icono: "precision_manufacturing",
        normativa: "Norma AR 10.1.1 - ARN"
      },
      {
        id: "rad-convencional-contrastada",
        nombre: "Radiología Convencional Contrastada",
        tipo: "Rayos X",
        descripcion: "Estudios radiológicos con administración de medios de contraste orales o endovenosos.",
        icono: "medication",
        normativa: "Ley 17.557 / Reg. Sanitario Prov."
      },
      {
        id: "tomografia-pet",
        nombre: "Tomografía Computada / PET",
        tipo: "Rayos X",
        descripcion: "Tomógrafo Multislice / PET-CT de alta resolución con emisión híbrida.",
        icono: "scanner",
        normativa: "Normas ARN / Min. Salud Cba"
      },
      {
        id: "rad-rodante-terapia",
        nombre: "Radiología Rodante en Terapia",
        tipo: "Rayos X",
        descripcion: "Equipos móviles desplazables para camas de internación y cuidados intensivos.",
        icono: "airport_shuttle",
        normativa: "Ley Nac. 17.557"
      },
      {
        id: "mamografia",
        nombre: "Mamografía",
        tipo: "Rayos X",
        descripcion: "Mamógrafo digital directo para detección y diagnóstico de patología mamaria.",
        icono: "vital_signs",
        normativa: "Norma Técnica Nacional de Mamografía y Calidad"
      },
      {
        id: "rad-unidad-movil",
        nombre: "Radiología en Unidad Móvil",
        tipo: "Rayos X",
        descripcion: "Vehículo sanitario equipado con sala de rayos X móvil y blindajes vehiculares.",
        icono: "rv_hookup",
        normativa: "Ley 17.557 / Certificación Vehicular"
      },
      {
        id: "rad-dental-periapical",
        nombre: "Radiología Dental: Periapical",
        tipo: "Rayos X",
        descripcion: "Equipo odontológico intraoral de 60-70 kVp con colimador cilíndrico.",
        icono: "dentistry",
        normativa: "Resolución Ministerial 2680/68 y disp. odontológicas"
      },
      {
        id: "rad-intervencionista-arco-c",
        nombre: "Radiología Intervencionista: Arco en C",
        tipo: "Rayos X",
        descripcion: "Equipo fluoroscópico móvil para cirugías traumatológicas, cardiovasculares y generales.",
        icono: "all_inclusive",
        normativa: "Normas de Radioprotección en Quirófano"
      },
      {
        id: "ortopantomografia",
        nombre: "Ortopantomografía",
        tipo: "Rayos X",
        descripcion: "Equipo panorámico dental y telerradiografía craneal / CBCT odontológico.",
        icono: "mood",
        normativa: "Reglamentación Odontológica y Radiológica"
      },
      {
        id: "rad-intervencionista-hemodinamia",
        nombre: "Radiología Intervencionista: Hemodinamia",
        tipo: "Rayos X",
        descripcion: "Angiógrafo digital monoplano o biplano para cateterismo y procedimientos endovasculares.",
        icono: "monitor_heart",
        normativa: "Norma ARN y Normas Ministeriales de Alta Complejidad"
      },
      {
        id: "litotricia",
        nombre: "Litotricia",
        tipo: "Rayos X",
        descripcion: "Litotriptor extracorpóreo guiado por radioscopía con rayos X y/o ecografía.",
        icono: "adjust",
        normativa: "Ley 17.557 y Requisitos Quirúrgicos"
      },
      {
        id: "rad-investigacion",
        nombre: "Radiología de Investigación",
        tipo: "Rayos X",
        descripcion: "Instalaciones para ensayos biomédicos y proyectos científicos con radiación ionizante.",
        icono: "science",
        normativa: "Regulaciones ARN de Instalaciones Clase II"
      },
      {
        id: "densitometria-osea",
        nombre: "Densitometría Ósea",
        tipo: "Rayos X",
        descripcion: "Equipo DEXA de absorciometría dual de rayos X para densidad mineral ósea.",
        icono: "accessibility_new",
        normativa: "Normas de Radiofísica Médica"
      },
      {
        id: "rad-veterinaria",
        nombre: "Radiología Veterinaria",
        tipo: "Rayos X",
        descripcion: "Instalaciones y equipos de radiodiagnóstico para animales pequeños y mayores.",
        icono: "pets",
        normativa: "Ley 17.557 y Reg. de Veterinaria"
      },
      {
        id: "acelerador-lineal",
        nombre: "Acelerador Lineal de Electrones",
        tipo: "Rayos X",
        descripcion: "Radioterapia de alta energía (fotones y electrones) para tratamiento oncológico.",
        icono: "radioactive",
        normativa: "Licencia de Operación ARN - Instalación Clase I"
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  // 2. LÁSER / IPL
  // ────────────────────────────────────────────────────────────
  {
    id: "laser-ipl",
    nombre: "Láser / IPL",
    icono: "blur_on",
    color: "#E11D48",
    descripcion: "Equipamientos emisores de radiación electromagnética coherente y luz pulsada intensa.",
    subservicios: [
      {
        id: "laser-dermatologia",
        nombre: "Dermatología",
        tipo: "Láser / IPL",
        descripcion: "Láseres ablativos y vasculares para lesiones dermatológicas (CO2, Erbium, Colorante pulsado).",
        icono: "healing",
        normativa: "Norma IRAM-IEC 60825 / Disposición ANMAT"
      },
      {
        id: "laser-depilacion",
        nombre: "Depilación",
        tipo: "Láser / IPL",
        descripcion: "Equipos de depilación por fototermólisis selectiva (Alexandrita, Diodo, Nd:YAG, Luz Pulsada).",
        icono: "face",
        normativa: "Resolución Ministerial y Certificado ANMAT"
      },
      {
        id: "laser-oftalmologia",
        nombre: "Oftalmología",
        tipo: "Láser / IPL",
        descripcion: "Cirugía refractiva y fotocoagulación retiniana (Excimer, Femtosegundo, Argón, YAG).",
        icono: "visibility",
        normativa: "Normativa Oftalmológica de Seguridad Láser"
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  // 3. RESONANCIA MAGNÉTICA
  // ────────────────────────────────────────────────────────────
  {
    id: "resonancia-magnetica",
    nombre: "Resonancia Magnética",
    icono: "radio",
    color: "#7C3AED",
    descripcion: "Equipamiento diagnóstico de campos magnéticos elevados y radiofrecuencia no ionizante.",
    subservicios: [
      {
        id: "rm-nuclear",
        nombre: "Resonancia Magnética Nuclear",
        tipo: "Resonancia Magnética",
        descripcion: "Resonador magnético superconductivo de alto o bajo campo para imágenes corporales.",
        icono: "settings_input_antenna",
        normativa: "Norma de Seguridad ACR y Ministerio de Salud"
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  // 4. RADIACIÓN ULTRAVIOLETA
  // ────────────────────────────────────────────────────────────
  {
    id: "radiacion-ultravioleta",
    nombre: "Radiación Ultravioleta",
    icono: "wb_sunny",
    color: "#EA580C",
    descripcion: "Dispositivos emisores de radiación UV con fines estéticos o dermatológicos.",
    subservicios: [
      {
        id: "uv-cama-solar",
        nombre: "Cama Solar",
        tipo: "Radiación Ultravioleta",
        descripcion: "Cama horizontal con tubos UV-A y UV-B para bronceado y fototerapia.",
        icono: "hotel",
        normativa: "Resolución Ministerio de Salud de Córdoba / Normas CEC"
      },
      {
        id: "uv-cabina-solar",
        nombre: "Cabina Solar",
        tipo: "Radiación Ultravioleta",
        descripcion: "Cabina vertical de alta potencia con circulación y ventilación forzada.",
        icono: "meeting_room",
        normativa: "Resolución Ministerial y Normas de Seguridad Eléctrica"
      },
      {
        id: "uv-sillon-facial",
        nombre: "Sillón Facial",
        tipo: "Radiación Ultravioleta",
        descripcion: "Equipo compacto focalizado para bronceado y radiación UV del área facial.",
        icono: "chair",
        normativa: "Reglamentación de Instalaciones de Bronceado Facial"
      }
    ]
  }
];

export function findSubservicio(tipoNombre?: string, subservicioNombre?: string): { tipo: TipoServicioRadiofisica; sub: SubservicioRadiofisica } {
  let matchedTipo = RADIOFISICA_CATALOG.find(t =>
    tipoNombre && (t.nombre.toLowerCase().includes(tipoNombre.toLowerCase()) || tipoNombre.toLowerCase().includes(t.nombre.toLowerCase()))
  ) || RADIOFISICA_CATALOG[0];

  let matchedSub = matchedTipo.subservicios.find(s =>
    subservicioNombre && (s.nombre.toLowerCase().includes(subservicioNombre.toLowerCase()) || subservicioNombre.toLowerCase().includes(s.nombre.toLowerCase()))
  ) || matchedTipo.subservicios[0];

  return { tipo: matchedTipo, sub: matchedSub };
}

// ────────────────────────────────────────────────────────────
// PLANTILLA ESPECÍFICA: RADIOLOGÍA CONVENCIONAL SIMPLE
// ────────────────────────────────────────────────────────────
function getRadiologiaConvencionalSimpleGeneralSections(): MasterConfigSection[] {
  return [
    // 1. DATOS DEL ESTABLECIMIENTO
    {
      id: "sec-rad-cs-est",
      name: "DATOS DEL ESTABLECIMIENTO",
      fields: [
        { id: "f-nom-est", label: "NOMBRE DEL ESTABLECIMIENTO", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Nombre", valorTramiteMock: "HABILITACION - RADIOFÍSICA" },
        { id: "f-razon-social", label: "Razón Social", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Razón Social", valorTramiteMock: "Centro de Radiofísica Médica S.A." },
        { id: "f-fecha-hora", label: "Fecha y hora", type: "date", valorTramiteMock: new Date().toISOString().split("T")[0] },
        { id: "f-exp-digital", label: "Nro Expediente Digital", type: "text", origin: "TRÁMITE", tramiteField: "TRÁMITE > Nro Expediente", valorTramiteMock: "EX-2026-0091010-APN-MS#CBA" },
        { id: "f-formato-insp", label: "FORMATO INSPECCIÓN", type: "button_group", options: "VIRTUAL, PRESENCIAL", valorTramiteMock: "PRESENCIAL" },
        { id: "f-direccion", label: "DIRECCIÓN", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Dirección", valorTramiteMock: "Av. Vélez Sarsfield 1450" },
        { id: "f-departamento", label: "DEPARTAMENTO", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Departamento", valorTramiteMock: "Capital" },
        { id: "f-localidad", label: "LOCALIDAD", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Localidad", valorTramiteMock: "Córdoba" },
        { id: "f-servicio", label: "SERVICIO", type: "text", origin: "TRÁMITE", tramiteField: "TRÁMITE > Servicio", valorTramiteMock: "Radiología Convencional Simple" },
        { id: "f-sala", label: "SALA", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Sala", valorTramiteMock: "Sala RX 01" },
        { id: "f-email", label: "EMAIL", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Email", valorTramiteMock: "radiofisica.salud@cordoba.gob.ar" },
        { id: "f-telefono", label: "TELÉFONO", type: "number", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Teléfono", valorTramiteMock: "3514289000" },
        { id: "f-denominacion", label: "Denominación", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Denominación", valorTramiteMock: "Centro Radiológico Córdoba" },
        { id: "f-resp-inst", label: "Responsable de instalación", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Responsable de Instalación", valorTramiteMock: "Ing. Biomédico Carlos A. Varela" },
        { id: "f-resp-uso", label: "Responsable de uso", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Responsable de Uso", valorTramiteMock: "Lic. Martín S. Benítez" },
        { id: "f-fec-hab", label: "Fecha de Habilitación", type: "date", origin: "TRÁMITE", tramiteField: "TRÁMITE MODIF/RENOV > Fecha de Habilitación", valorTramiteMock: "2024-03-15" },
        { id: "f-res-num", label: "Resolución Nº", type: "number", origin: "TRÁMITE", tramiteField: "TRÁMITE MODIF/RENOV > Resolución Nº", valorTramiteMock: 845 },
        { id: "f-tipo-insp", label: "Tipo de Inspección", type: "chip", origin: "TRÁMITE", tramiteField: "TRÁMITE > Tipo de Inspección", valorTramiteMock: "HABILITACIÓN" }
      ]
    },

    // 2. EQUIPOS GENERADORES DE RAYOS X
    {
      id: "sec-rad-cs-equipos",
      name: "EQUIPOS GENERADORES DE RAYOS X",
      fields: [
        { id: "f-rx-rev-digital", label: "Revelado Digital", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "SI" },
        { id: "f-rx-cr", label: "CR", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "SI" },
        { id: "f-rx-dr", label: "DR", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "NO" },
        {
          id: "f-rx-rev-pelicula",
          label: "Revelado por película",
          type: "sino_na",
          options: "SI, NO, NO APLICA",
          disabledWhen: { fieldId: "f-rx-rev-digital", value: "SI", label: "Revelado digital = SI" },
          valorTramiteMock: "SI"
        },
        {
          id: "f-rx-marca",
          label: "Marca",
          type: "text",
          disabledWhen: { fieldId: "f-rx-rev-digital", value: "SI", label: "Revelado digital = SI" },
          valorTramiteMock: "Kodak Medical"
        },
        {
          id: "f-rx-modelo",
          label: "Modelo",
          type: "text",
          disabledWhen: { fieldId: "f-rx-rev-digital", value: "SI", label: "Revelado digital = SI" },
          valorTramiteMock: "M35-X OMAT"
        },
        {
          id: "f-rx-cuarto-rev",
          label: "Cuarto de revelado",
          type: "sino_na",
          options: "SI, NO, NO APLICA",
          disabledWhen: { fieldId: "f-rx-rev-digital", value: "SI", label: "Revelado digital = SI" },
          valorTramiteMock: "SI"
        },
        {
          id: "f-rx-contrato-liq",
          label: "Contrato de recolección de líquidos peligrosos",
          type: "sino_na",
          options: "SI, NO, NO APLICA",
          disabledWhen: { fieldId: "f-rx-rev-digital", value: "SI", label: "Revelado digital = SI" },
          valorTramiteMock: "SI"
        },
        {
          id: "f-rx-emp-residuos",
          label: "Empresa residuos",
          type: "text",
          disabledWhen: { fieldId: "f-rx-rev-digital", value: "SI", label: "Revelado digital = SI" },
          valorTramiteMock: "Hábitat Ecológico S.A."
        }
      ]
    },

    // 3. DOSIMETRÍA
    {
      id: "sec-rad-cs-dosimetria",
      name: "DOSIMETRÍA",
      fields: [
        { id: "f-dos-empresa", label: "Empresa", type: "text", valorTramiteMock: "Tecnodosis S.R.L." },
        { id: "f-dos-cuerpo-entero", label: "Cuerpo entero", type: "text", valorTramiteMock: "Dosímetro TLD tórax mensual" },
        { id: "f-dos-cristalino", label: "Cristalino", type: "text", valorTramiteMock: "Dosímetro de anillo / gafas plomadas" },
        { id: "f-dos-cant-personal", label: "Cantidad de personal declarado en el servicio", type: "number", valorTramiteMock: 4 }
      ]
    },

    // 4. MATERIALIDAD DE LA SALA
    {
      id: "sec-rad-cs-materialidad",
      name: "MATERIALIDAD DE LA SALA",
      fields: [
        { id: "f-mat-muros-blindados", label: "Muros con blindaje", type: "text", valorTramiteMock: "Plomo 2.0 mm equivalente hasta 2.10 m" },
        { id: "f-mat-muros-sin-blindaje", label: "Muros sin blindaje", type: "text", valorTramiteMock: "Pared exterior ladrillo macizo 30 cm" },
        { id: "f-mat-aberturas-blindadas", label: "Aberturas con blindaje", type: "text", valorTramiteMock: "Puerta batiente con lámina de 1.5 mm Pb" },
        { id: "f-mat-aberturas-sin-blindaje", label: "Aberturas sin blindaje", type: "text", valorTramiteMock: "Ventiluz exterior a 3.20 m de altura" },
        { id: "f-mat-cant-vidrios", label: "Cantidad de vidrios", type: "number", valorTramiteMock: 1 },
        { id: "f-mat-bunker", label: "Búnker", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "NO" },
        { id: "f-mat-carteles", label: "Carteles de seguridad RX", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "SI" }
      ]
    }
  ];
}

function getRadiologiaConvencionalSimpleMedicionesSections(): MasterConfigSection[] {
  return [
    // 5. REPETIBILIDAD DEL TUBO
    {
      id: "sec-rad-cs-repetibilidad",
      name: "REPETIBILIDAD DEL TUBO",
      fields: [
        { id: "f-rep-ma", label: "Condiciones de la prueba - mA", type: "text", valorTramiteMock: "100 mA" },
        { id: "f-rep-kv", label: "Condiciones de la prueba - kV", type: "text", valorTramiteMock: "80 kV" },
        { id: "f-rep-t", label: "Condiciones de la prueba - T", type: "text", valorTramiteMock: "0.1 Seg" },
        { id: "f-rep-kv-medido", label: "1 - kV medido", type: "number", valorTramiteMock: 79.8 },
        { id: "f-rep-t-medido", label: "1 - Tiempo medido", type: "number", valorTramiteMock: 100.2 },
        { id: "f-rep-t-unidad", label: "1 - Unidad", type: "select", options: "µSeg, mSeg, Seg", valorTramiteMock: "mSeg" },
        { id: "f-rep-dosis-medida", label: "1 - Dosis medida", type: "number", valorTramiteMock: 2.38 },
        { id: "f-rep-dosis-unidad", label: "1 - Unidad", type: "select", options: "nGy, µGy, mGy, Gy", valorTramiteMock: "mGy" },
        { id: "f-rep-2-kv-medido", label: "2 - kV medido", type: "number", valorTramiteMock: 80.1 },
        { id: "f-rep-2-t-medido", label: "2 - Tiempo medido", type: "number", valorTramiteMock: 100.0 },
        { id: "f-rep-2-t-unidad", label: "2 - Unidad", type: "select", options: "µSeg, mSeg, Seg", valorTramiteMock: "mSeg" },
        { id: "f-rep-2-dosis-medida", label: "2 - Dosis medida", type: "number", valorTramiteMock: 2.39 },
        { id: "f-rep-2-dosis-unidad", label: "2 - Unidad", type: "select", options: "nGy, µGy, mGy, Gy", valorTramiteMock: "mGy" },
        { id: "f-rep-3-kv-medido", label: "3 - kV medido", type: "number", valorTramiteMock: 79.9 },
        { id: "f-rep-3-t-medido", label: "3 - Tiempo medido", type: "number", valorTramiteMock: 100.4 },
        { id: "f-rep-3-t-unidad", label: "3 - Unidad", type: "select", options: "µSeg, mSeg, Seg", valorTramiteMock: "mSeg" },
        { id: "f-rep-3-dosis-medida", label: "3 - Dosis medida", type: "number", valorTramiteMock: 2.37 },
        { id: "f-rep-3-dosis-unidad", label: "3 - Unidad", type: "select", options: "nGy, µGy, mGy, Gy", valorTramiteMock: "mGy" },
        // Media
        { id: "f-rep-media-kv", label: "Media - kV medido", type: "number", valorTramiteMock: 79.93 },
        { id: "f-rep-media-t", label: "Media - Tiempo medido", type: "number", valorTramiteMock: 100.20 },
        { id: "f-rep-media-t-unidad", label: "Media - Tiempo Unidad", type: "select", options: "µSeg, mSeg, Seg", valorTramiteMock: "mSeg" },
        { id: "f-rep-media-dosis", label: "Media - Dosis medida", type: "number", valorTramiteMock: 2.38 },
        { id: "f-rep-media-dosis-unidad", label: "Media - Dosis Unidad", type: "select", options: "nGy, µGy, mGy, Gy", valorTramiteMock: "mGy" },
        // Desviación Estándar
        { id: "f-rep-desv-kv", label: "Desviación Estándar - kV medido", type: "number", valorTramiteMock: 0.15 },
        { id: "f-rep-desv-t", label: "Desviación Estándar - Tiempo medido", type: "number", valorTramiteMock: 0.20 },
        { id: "f-rep-desv-t-unidad", label: "Desviación Estándar - Tiempo Unidad", type: "select", options: "µSeg, mSeg, Seg", valorTramiteMock: "mSeg" },
        { id: "f-rep-desv-dosis", label: "Desviación Estándar - Dosis medida", type: "number", valorTramiteMock: 0.01 },
        { id: "f-rep-desv-dosis-unidad", label: "Desviación Estándar - Dosis Unidad", type: "select", options: "nGy, µGy, mGy, Gy", valorTramiteMock: "mGy" }
      ]
    },

    // 6. PRUEBA DE FUGA
    {
      id: "sec-rad-cs-fuga",
      name: "PRUEBA DE FUGA",
      fields: [
        { id: "f-fuga-ma", label: "Condiciones de la prueba - mA", type: "text", valorTramiteMock: "150 mA" },
        { id: "f-fuga-kv", label: "Condiciones de la prueba - kV", type: "text", valorTramiteMock: "120 kV" },
        { id: "f-fuga-t", label: "Condiciones de la prueba - T", type: "text", valorTramiteMock: "1.0 Seg" },
        { id: "f-fuga-fondo", label: "Condiciones de la prueba - Radiación de fondo", type: "number", valorTramiteMock: 0.12 },
        { id: "f-fuga-fondo-unit", label: "Condiciones de la prueba - Radiación de fondo - Unidad", type: "button_group", options: "µSv/h, mSv/h", valorTramiteMock: "µSv/h" },
        { id: "f-fuga-front-med", label: "Fuga frontal a 1mt - Valor medido", type: "number", valorTramiteMock: 0.45 },
        { id: "f-fuga-front-corr", label: "Fuga frontal a 1mt - Valor corregido", type: "number", valorTramiteMock: 0.33 },
        { id: "f-fuga-front-unit", label: "Fuga frontal a 1mt - Unidad", type: "button_group", options: "µSv/h, mSv/h", valorTramiteMock: "µSv/h" },
        { id: "f-fuga-der-med", label: "Fuga lateral derecha a 1mt - Valor medido", type: "number", valorTramiteMock: 0.38 },
        { id: "f-fuga-der-corr", label: "Fuga lateral derecha a 1mt - Valor corregido", type: "number", valorTramiteMock: 0.26 },
        { id: "f-fuga-der-unit", label: "Fuga lateral derecha a 1mt - Unidad", type: "button_group", options: "µSv/h, mSv/h", valorTramiteMock: "µSv/h" },
        { id: "f-fuga-izq-med", label: "Fuga lateral izquierda a 1mt - Valor medido", type: "number", valorTramiteMock: 0.41 },
        { id: "f-fuga-izq-corr", label: "Fuga lateral izquierda a 1mt - Valor corregido", type: "number", valorTramiteMock: 0.29 },
        { id: "f-fuga-izq-unit", label: "Fuga lateral izquierda a 1mt - Unidad", type: "button_group", options: "µSv/h, mSv/h", valorTramiteMock: "µSv/h" },
        { id: "f-fuga-post-med", label: "Fuga posterior a 1mt - Valor medido", type: "number", valorTramiteMock: 0.25 },
        { id: "f-fuga-post-corr", label: "Fuga posterior a 1mt - Valor corregido", type: "number", valorTramiteMock: 0.13 },
        { id: "f-fuga-post-unit", label: "Fuga posterior a 1mt - Unidad", type: "button_group", options: "µSv/h, mSv/h", valorTramiteMock: "µSv/h" }
      ]
    },

    // 7. RADIACIÓN DISPERSA
    {
      id: "sec-rad-cs-dispersa",
      name: "RADIACIÓN DISPERSA",
      fields: [
        { id: "f-disp-ma", label: "Condiciones de la prueba - mA", type: "text", valorTramiteMock: "100 mA" },
        { id: "f-disp-kv", label: "Condiciones de la prueba - kV", type: "text", valorTramiteMock: "80 kV" },
        { id: "f-disp-t", label: "Condiciones de la prueba - T", type: "text", valorTramiteMock: "0.2 Seg" },
        { id: "f-disp-fondo", label: "Condiciones de la prueba - Radiación de fondo", type: "number", valorTramiteMock: 0.10 },
        { id: "f-disp-fondo-unit", label: "Condiciones de la prueba - Radiación de fondo - Unidad", type: "button_group", options: "µSv/h, mSv/h", valorTramiteMock: "µSv/h" }
      ]
    },

    // 8. DOSIS ANUAL ESTIMADA
    {
      id: "sec-rad-cs-dosis-anual",
      name: "DOSIS ANUAL ESTIMADA",
      fields: [
        { id: "f-dosis-disparos-dia", label: "Disparos por día", type: "number", valorTramiteMock: 25 },
        { id: "f-dosis-dias-sem", label: "Días trabajados en la semana", type: "number", valorTramiteMock: 5 },
        { id: "f-dosis-duracion-disp", label: "Duración del disparo (Seg)", type: "number", valorTramiteMock: 0.1 },
        { id: "f-dosis-recibida-lic", label: "Dosis recibida por el licenciado (µSv/h)", type: "number", valorTramiteMock: 1.2 },
        { id: "f-dosis-anual-estimada", label: "Dosis anual estimada (µSv/Año)", type: "number", valorTramiteMock: 156.0 }
      ]
    },

    // 9. CALIDAD DE IMAGEN
    {
      id: "sec-rad-cs-calidad-imagen",
      name: "CALIDAD DE IMAGEN",
      fields: [
        {
          id: "f-cal-img-fotos",
          label: "Fotos de Calidad de Imagen",
          type: "text",
          valorTramiteMock: ""
        }
      ]
    }
  ];
}

function getRadiologiaConvencionalSimpleSections(): MasterConfigSection[] {
  return [
    ...getRadiologiaConvencionalSimpleGeneralSections(),
    ...getRadiologiaConvencionalSimpleMedicionesSections()
  ];
}

// ────────────────────────────────────────────────────────────
// PLANTILLAS GENÉRICAS PARA OTROS SUBSERVICIOS
// ────────────────────────────────────────────────────────────
function getGenericRadiofisicaSections(tipo: TipoServicioRadiofisica, sub: SubservicioRadiofisica): MasterConfigSection[] {
  return [
    {
      id: "sec-rad-gen-est",
      name: "DATOS DEL ESTABLECIMIENTO",
      fields: [
        { id: "f-nom-est", label: "NOMBRE DEL ESTABLECIMIENTO", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Nombre", valorTramiteMock: "HABILITACION - RADIOFÍSICA" },
        { id: "f-razon-social", label: "Razón Social", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Razón Social", valorTramiteMock: "Centro de Radiofísica Médica S.A." },
        { id: "f-fecha-hora", label: "Fecha y hora", type: "date", valorTramiteMock: new Date().toISOString().split("T")[0] },
        { id: "f-exp-digital", label: "Nro Expediente Digital", type: "text", origin: "TRÁMITE", tramiteField: "TRÁMITE > Nro Expediente", valorTramiteMock: "EX-2026-0091010-APN-MS#CBA" },
        { id: "f-formato-insp", label: "FORMATO INSPECCIÓN", type: "button_group", options: "VIRTUAL, PRESENCIAL", valorTramiteMock: "PRESENCIAL" },
        { id: "f-direccion", label: "DIRECCIÓN", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Dirección", valorTramiteMock: "Av. Vélez Sarsfield 1450" },
        { id: "f-departamento", label: "DEPARTAMENTO", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Departamento", valorTramiteMock: "Capital" },
        { id: "f-localidad", label: "LOCALIDAD", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Localidad", valorTramiteMock: "Córdoba" },
        { id: "f-servicio", label: "SERVICIO", type: "text", origin: "TRÁMITE", tramiteField: "TRÁMITE > Servicio", valorTramiteMock: sub.nombre },
        { id: "f-sala", label: "SALA", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Sala", valorTramiteMock: `Sector ${sub.nombre}` },
        { id: "f-email", label: "EMAIL", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Email", valorTramiteMock: "radiofisica.salud@cordoba.gob.ar" },
        { id: "f-telefono", label: "TELÉFONO", type: "number", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Teléfono", valorTramiteMock: "3514289000" },
        { id: "f-denominacion", label: "Denominación", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Denominación", valorTramiteMock: "Centro Radiológico Córdoba" },
        { id: "f-resp-inst", label: "Responsable de instalación", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Responsable de Instalación", valorTramiteMock: "Ing. Biomédico Carlos A. Varela" },
        { id: "f-resp-uso", label: "Responsable de uso", type: "text", origin: "TRÁMITE", tramiteField: "ESTABLECIMIENTO > Responsable de Uso", valorTramiteMock: "Lic. Martín S. Benítez" },
        { id: "f-fec-hab", label: "Fecha de Habilitación", type: "date", origin: "TRÁMITE", tramiteField: "TRÁMITE MODIF/RENOV > Fecha de Habilitación", valorTramiteMock: "2024-03-15" },
        { id: "f-res-num", label: "Resolución Nº", type: "number", origin: "TRÁMITE", tramiteField: "TRÁMITE MODIF/RENOV > Resolución Nº", valorTramiteMock: 845 },
        { id: "f-tipo-insp", label: "Tipo de Inspección", type: "chip", origin: "TRÁMITE", tramiteField: "TRÁMITE > Tipo de Inspección", valorTramiteMock: "HABILITACIÓN" }
      ]
    },
    {
      id: `sec-rad-req-${tipo.id}`,
      name: `REQUISITOS GENERALES: ${tipo.nombre.toUpperCase()}`,
      fields: [
        { id: `f-${tipo.id}-hab`, label: "Habilitación y Permiso ARN / Sanitario Vigente", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "SI" },
        { id: `f-${tipo.id}-epp`, label: "Elementos de Protección Personal Conforme", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "SI" },
        { id: `f-${tipo.id}-calib`, label: "Calibración y Control de Calidad al Día", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "SI" },
        { id: `f-${tipo.id}-senal`, label: "Señalización de Seguridad Reglamentaria", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "SI" }
      ]
    },
    {
      id: `sec-rad-sub-${sub.id}`,
      name: `VERIFICACIÓN ESPECÍFICA: ${sub.nombre.toUpperCase()}`,
      fields: [
        { id: `f-${sub.id}-equipo`, label: "Identificación de Equipo (Marca / Modelo / Serie)", type: "text", valorTramiteMock: `${sub.nombre} Modelo Tech-2026` },
        { id: `f-${sub.id}-operativo`, label: "Equipo en Condiciones Operativas", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "SI" },
        { id: `f-${sub.id}-mantenimiento`, label: "Libro de Mantenimiento y Service Oficial", type: "sino_na", options: "SI, NO, NO APLICA", valorTramiteMock: "SI" },
        { id: `f-${sub.id}-observaciones`, label: "Observaciones Técnicas", type: "textarea", valorTramiteMock: `Inspección satisfactoria para el área de ${sub.nombre}.` }
      ]
    }
  ];
}

function getGenericRadiofisicaMedicionesSections(tipo: TipoServicioRadiofisica, sub: SubservicioRadiofisica): MasterConfigSection[] {
  return getRadiologiaConvencionalSimpleMedicionesSections();
}

// Generador de MasterConfig dinámico para Radiofísica
export function getRadiofisicaConfig(tipoServicioNombre = "Rayos X", subservicioNombre = "Radiología Convencional Simple"): MasterConfig {
  const { tipo, sub } = findSubservicio(tipoServicioNombre, subservicioNombre);

  const isConvencionalSimple = sub.id === "rad-convencional-simple" || sub.nombre.toLowerCase().includes("convencional simple");

  const generalSections = isConvencionalSimple
    ? getRadiologiaConvencionalSimpleGeneralSections()
    : getGenericRadiofisicaSections(tipo, sub);

  const medicionesSections = isConvencionalSimple
    ? getRadiologiaConvencionalSimpleMedicionesSections()
    : getGenericRadiofisicaMedicionesSections(tipo, sub);

  const datosGeneralesService: MasterConfigService = {
    id: `srv-gen-rad-${sub.id}`,
    name: "DATOS GENERALES",
    sections: generalSections
  };

  const registroMedicionesService: MasterConfigService = {
    id: `srv-med-rad-${sub.id}`,
    name: "REGISTRO DE MEDICIONES",
    sections: medicionesSections
  };

  return {
    id: `config-rad-${tipo.id}-${sub.id}`,
    tipologia: "RADIOFÍSICA",
    servicios: [datosGeneralesService, registroMedicionesService]
  };
}
