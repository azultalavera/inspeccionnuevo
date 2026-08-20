/**
 * @file denunciaApi.ts
 * @description Cliente API TypeScript para consumir los endpoints de Presentación e Inicio de Denuncias Sanitarias en ClicSalud+.
 */

export type MotivoDenunciaEnum =
  | 'EJERCICIO_ILEGAL'
  | 'FALTA_HABILITACION'
  | 'CONDICIONES_HIGIENICO_SANITARIAS'
  | 'EQUIPAMIENTO_NO_AUTORIZADO'
  | 'OTRO';

export type EstadoDenunciaEnum =
  | 'RECIBIDA'
  | 'EN_REVISIÓN_ADMINISTRATIVA'
  | 'EXPEDIENTE_GENERADO'
  | 'ASIGNADA_A_INSPECCION'
  | 'INSPECCIONADA'
  | 'ARCHIVADA';

export interface DenunciantePayload {
  cuit_cuil: string;
  nombre_completo: string;
  correo: string;
  es_anonima?: boolean;
}

export interface DomicilioPayload {
  calle: string;
  numero?: string;
  localidad: string;
  departamento?: string;
  provincia?: string;
}

export interface EstablecimientoDenunciadoPayload {
  es_registrado?: boolean;
  establecimiento_id?: string | null;
  razon_social_o_nombre: string;
  cuit_titular_presunto?: string | null;
  domicilio: DomicilioPayload;
  tipologia_estimada?: string;
}

export interface AdjuntoEvidenciaPayload {
  url: string;
  tipo?: 'IMAGEN' | 'PDF' | 'DOCUMENTO';
  hash_sha256?: string;
}

export interface ExpedienteDenunciaResponse {
  id_denuncia: string;
  numero_expediente: string;
  denunciante: DenunciantePayload;
  establecimiento_denunciado: EstablecimientoDenunciadoPayload;
  motivo_denuncia: MotivoDenunciaEnum;
  descripcion_detallada: string;
  adjuntos_evidencia: AdjuntoEvidenciaPayload[];
  estado: EstadoDenunciaEnum;
  inspeccion_asociada_id?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = 'http://localhost:3001/api';

/**
 * Presentar/Crear una nueva denuncia sanitaria (Efector / Ciudadano)
 */
export async function presentarDenunciaSanitaria(data: {
  denunciante: DenunciantePayload;
  establecimiento_denunciado: EstablecimientoDenunciadoPayload;
  motivo_denuncia: MotivoDenunciaEnum;
  descripcion_detallada: string;
  adjuntos_evidencia?: AdjuntoEvidenciaPayload[];
}): Promise<{ ok: boolean; mensaje: string; data: ExpedienteDenunciaResponse }> {
  const res = await fetch(`${API_BASE}/denuncias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

/**
 * Consultar las denuncias presentadas por el usuario autenticado (Efector / Ciudadano)
 */
export async function consultarMisDenuncias(cuitCuil: string): Promise<{
  ok: boolean;
  total: number;
  data: ExpedienteDenunciaResponse[];
}> {
  const res = await fetch(`${API_BASE}/efector/mis-denuncias?cuit_cuil=${encodeURIComponent(cuitCuil)}`, {
    headers: { 'x-user-cuit': cuitCuil }
  });
  return await res.json();
}

/**
 * Consultar la bandeja de denuncias pendientes para el equipo administrativo del Ministerio
 */
export async function consultarDenunciasPendientesAdmin(): Promise<{
  ok: boolean;
  total: number;
  data: ExpedienteDenunciaResponse[];
}> {
  const res = await fetch(`${API_BASE}/admin/denuncias/pendientes`, {
    headers: { 'x-user-role': 'ADMIN_MINISTERIO' }
  });
  return await res.json();
}
