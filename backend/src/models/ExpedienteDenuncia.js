/**
 * @file ExpedienteDenuncia.js
 * @description Modelo Mongoose / Entidad de Datos para Denuncias Sanitarias en ClicSalud+.
 * Soporta Denuncias Digitales (Ciudadano/Efector) y Denuncias Externas (GDE, Papel, Mail, Oficio Judicial).
 */

const MOTIVO_DENUNCIA_ENUM = [
  'EJERCICIO_ILEGAL',
  'FALTA_HABILITACION',
  'CONDICIONES_HIGIENICO_SANITARIAS',
  'EQUIPAMIENTO_NO_AUTORIZADO',
  'OTRO'
];

const ORIGEN_DENUNCIA_ENUM = [
  'DIGITAL',
  'GDE',
  'PAPEL',
  'MAIL',
  'OFICIO_JUDICIAL'
];

const ESTADO_DENUNCIA_ENUM = [
  'RECIBIDA',
  'EN_REVISIÓN_ADMINISTRATIVA',
  'EXPEDIENTE_GENERADO',
  'ASIGNADA_A_INSPECCION',
  'INTIMADA_TRAMITE_DIRECTO',
  'INSPECCIONADA',
  'ARCHIVADA',
  'DESESTIMADA'
];

let ExpedienteDenunciaSchema;
let mongoose;

try {
  mongoose = require('mongoose');
  const Schema = mongoose.Schema;

  const DomicilioSchema = new Schema({
    calle: { type: String, required: true },
    numero: { type: String, default: 'S/N' },
    localidad: { type: String, required: true },
    departamento: { type: String, default: 'Capital' },
    provincia: { type: String, default: 'Córdoba' }
  }, { _id: false });

  const AdjuntoEvidenciaSchema = new Schema({
    url: { type: String, required: true },
    tipo: { type: String, default: 'IMAGEN' }, // IMAGEN, PDF, DOCUMENTO
    hash_sha256: { type: String }
  }, { _id: false });

  const DenuncianteSchema = new Schema({
    cuit_cuil: { type: String, required: true },
    nombre_completo: { type: String, required: true },
    correo: { type: String, required: true },
    es_anonima: { type: Boolean, default: false }
  }, { _id: false });

  const EstablecimientoDenunciadoSchema = new Schema({
    es_registrado: { type: Boolean, default: false },
    establecimiento_id: { type: String, default: null },
    razon_social_o_nombre: { type: String, required: true },
    cuit_titular_presunto: { type: String, default: null },
    domicilio: { type: DomicilioSchema, required: true },
    tipologia_estimada: { type: String, default: 'No Especificado' }
  }, { _id: false });

  const ResolucionCoordinadorSchema = new Schema({
    accion: { type: String, enum: ['DESESTIMAR', 'INTIMAR_TRAMITE_DIRECTO', 'ORDENAR_INSPECCION'] },
    observacion: { type: String },
    fecha: { type: Date, default: Date.now },
    usuario_cuid: { type: String },
    plazo_dias: { type: Number, default: null },
    inspector_asignado_cuid: { type: String, default: null }
  }, { _id: false });

  ExpedienteDenunciaSchema = new Schema({
    numero_expediente: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    origen_denuncia: {
      type: String,
      enum: ORIGEN_DENUNCIA_ENUM,
      default: 'DIGITAL'
    },
    numero_gde: {
      type: String,
      default: null
    },
    denunciante: {
      type: DenuncianteSchema,
      required: true
    },
    establecimiento_denunciado: {
      type: EstablecimientoDenunciadoSchema,
      required: true
    },
    motivo_denuncia: {
      type: String,
      required: true,
      enum: MOTIVO_DENUNCIA_ENUM
    },
    descripcion_detallada: {
      type: String,
      required: true
    },
    adjuntos_evidencia: [AdjuntoEvidenciaSchema],
    estado: {
      type: String,
      required: true,
      enum: ESTADO_DENUNCIA_ENUM,
      default: 'RECIBIDA'
    },
    resolucion_coordinador: {
      type: ResolucionCoordinadorSchema,
      default: null
    },
    inspeccion_asociada_id: {
      type: String,
      default: null
    }
  }, {
    timestamps: true
  });

  ExpedienteDenunciaSchema.index({ 'denunciante.cuit_cuil': 1 });
  ExpedienteDenunciaSchema.index({ estado: 1 });
  ExpedienteDenunciaSchema.index({ origen_denuncia: 1 });

} catch (e) {
  // Mongoose fallback
}

module.exports = {
  MOTIVO_DENUNCIA_ENUM,
  ORIGEN_DENUNCIA_ENUM,
  ESTADO_DENUNCIA_ENUM,
  ExpedienteDenunciaSchema,
  getModel: () => {
    if (mongoose && mongoose.models && mongoose.models.ExpedienteDenuncia) {
      return mongoose.models.ExpedienteDenuncia;
    }
    if (mongoose && ExpedienteDenunciaSchema) {
      return mongoose.model('ExpedienteDenuncia', ExpedienteDenunciaSchema);
    }
    return null;
  }
};
