/**
 * @file inspeccionApi.ts
 * @description Cliente API TypeScript para consumir el backend de Inspección de Oficio (3 Flujos) y Hook de Antecedentes Efector.
 */

export type TipoOrigenInspeccion = 'RUTINA' | 'DENUNCIA' | 'HABILITACION';

export type EstadoInspeccionBackend =
  | 'BORRADOR'
  | 'EN_TERRENO'
  | 'ACTA_CERRADA'
  | 'EMPLAZADO'
  | 'HANDOFF_EFECTOR'
  | 'FINALIZADO';

export interface HallazgoPayload {
  servicio: string;
  subarea?: string;
  descripcion: string;
  gravedad?: 'LEVE' | 'MODERADA' | 'GRAVE' | 'CRITICA';
  plazo_subsancion_dias?: number;
  subsanado?: boolean;
}

export interface FirmasActaPayload {
  inspector_cuid: string;
  responsable_cuid?: string | null;
  fecha?: string;
  firmado_cidi?: boolean;
  motivo_negativa?: string | null;
}

export interface ActuacionSanitariaResponse {
  id: string;
  tipo_origen: TipoOrigenInspeccion;
  numero_expediente?: string;
  cuit_titular: string;
  establecimiento_id?: string | null;
  direccion_relevada?: string;
  razon_social_relevada?: string;
  estado: EstadoInspeccionBackend;
  hallazgos: HallazgoPayload[];
  firmas?: FirmasActaPayload | null;
  acta_pdf_hash?: string | null;
  es_latente?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = 'http://localhost:3001/api';

/**
 * Flujo 1: Iniciar Inspección de Oficio por Rutina (Establecimiento habilitado)
 */
export async function iniciarInspeccionRutina(data: {
  cuit_titular: string;
  establecimiento_id: string;
  direccion_relevada?: string;
  razon_social_relevada?: string;
  inspector_cuid?: string;
}): Promise<{ ok: boolean; mensaje: string; data: ActuacionSanitariaResponse }> {
  const res = await fetch(`${API_BASE}/inspecciones/oficio/rutina`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

/**
 * Flujo 2: Iniciar Inspección de Oficio por Denuncia / Clandestino (Expediente Obligatorio)
 */
export async function iniciarInspeccionDenuncia(data: {
  numero_expediente: string;
  cuit_titular: string;
  direccion_relevada?: string;
  razon_social_relevada?: string;
  inspector_cuid?: string;
  hallazgos?: HallazgoPayload[];
}): Promise<{ ok: boolean; mensaje: string; data: ActuacionSanitariaResponse }> {
  const res = await fetch(`${API_BASE}/inspecciones/oficio/denuncia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

/**
 * Cierre In Situ de Acta (con Firma o Refuso)
 */
export async function cerrarActaInSitu(
  idActa: string,
  payload: {
    inspector_cuid: string;
    responsable_cuid?: string;
    firmado_cidi?: boolean;
    motivo_negativa?: string;
    hallazgos?: HallazgoPayload[];
    observaciones?: string;
  }
): Promise<{ ok: boolean; mensaje: string; data: ActuacionSanitariaResponse }> {
  const res = await fetch(`${API_BASE}/inspecciones/${idActa}/cierre-acta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

/**
 * Flujo 3: Hand-off a Habilitación / Enmienda (Traspaso al Efector)
 */
export async function handoffHabilitacion(
  idActa: string,
  usuarioCuid?: string
): Promise<{ ok: boolean; mensaje: string; data: ActuacionSanitariaResponse }> {
  const res = await fetch(`${API_BASE}/inspecciones/${idActa}/handoff-habilitacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_cuid: usuarioCuid })
  });
  return await res.json();
}

/**
 * Hook de Login Efector: GET /api/efector/antecedentes/:cuit
 * Recupera actas asociadas y vincula automáticamente antecedentes latentes
 */
export async function consultarAntecedentesEfector(
  cuit: string,
  establecimientoId?: string
): Promise<{
  ok: boolean;
  mensaje: string;
  data: {
    cuit: string;
    total_actuaciones: number;
    actas_latentes_vinculadas: number;
    actuaciones: ActuacionSanitariaResponse[];
  };
}> {
  const query = establecimientoId ? `?establecimiento_id=${encodeURIComponent(establecimientoId)}` : '';
  const res = await fetch(`${API_BASE}/efector/antecedentes/${encodeURIComponent(cuit)}${query}`);
  return await res.json();
}
