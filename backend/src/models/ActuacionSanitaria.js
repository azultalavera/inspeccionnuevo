/**
 * @file ActuacionSanitaria.js
 * @description Modelo Mongoose / Entidad de Datos para Actuaciones Sanitarias e Inspecciones de Oficio en ClicSalud+.
 * Soporta la Bandeja del Inspector con enmascaramiento de carátula y la Bandeja de Dictamen del Coordinador.
 */

const crypto = require('crypto');

// Enums de Dominio
const TIPO_ORIGEN_ENUM = ['RUTINA', 'DENUNCIA', 'HABILITACION', 'REINSPECCION'];
const ESTADO_INSPECCION_ENUM = [
  'BORRADOR',
  'PROGRAMADA',
  'EN_TERRENO',
  'ACTA_CERRADA',
  'EMPLAZADO',
  'DICTAMINADO',
  'HANDOFF_EFECTOR',
  'FINALIZADO',
  'EN_SUMARIO',
  'CLAUSURADO'
];

/**
 * Función utilitaria para calcular el hash SHA-256 inmutable del acta
 * @param {Object} actData 
 * @returns {string} Hash SHA-256 hexadecimal
 */
function calcularHashActa(actData) {
  const payloadCanonical = JSON.stringify({
    id: actData._id || actData.id,
    tipo_origen: actData.tipo_origen,
    numero_expediente: actData.numero_expediente || null,
    cuit_titular: actData.cuit_titular,
    establecimiento_id: actData.establecimiento_id || null,
    direccion_relevada: actData.direccion_relevada || null,
    hallazgos: actData.hallazgos || [],
    firmas: actData.firmas || {},
    fecha_cierre: actData.fecha_cierre || new Date().toISOString()
  });

  return crypto.createHash('sha256').update(payloadCanonical).digest('hex');
}

/**
 * Esquema de Mongoose para ActuacionSanitaria / Inspeccion
 */
let ActuacionSanitariaSchema;
let mongoose;

try {
  mongoose = require('mongoose');
  const Schema = mongoose.Schema;

  const FirmaSchema = new Schema({
    inspector_cuid: { type: String, required: true },
    responsable_cuid: { type: String, default: null },
    fecha: { type: Date, default: Date.now },
    firmado_cidi: { type: Boolean, default: false },
    motivo_negativa: { type: String, default: null }
  }, { _id: false });

  const HallazgoSchema = new Schema({
    servicio: { type: String, required: true },
    subarea: { type: String },
    descripcion: { type: String, required: true },
    gravedad: { type: String, enum: ['LEVE', 'MODERADA', 'GRAVE', 'CRITICA'], default: 'MODERADA' },
    plazo_subsancion_dias: { type: Number, default: 10 },
    subsanado: { type: Boolean, default: false }
  }, { _id: true });

  const HistorialEstadoSchema = new Schema({
    estado_previo: { type: String },
    estado_nuevo: { type: String, required: true },
    usuario_cuid: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    observacion: { type: String }
  }, { _id: false });

  const DictamenCoordinadorSchema = new Schema({
    resolucion: {
      type: String,
      enum: ['APROBADO', 'EMPLAZAMIENTO', 'SUMARIO', 'CLAUSURA'],
      required: true
    },
    plazo_dias_habiles: { type: Number, default: null },
    observacion: { type: String },
    fecha_dictamen: { type: Date, default: Date.now },
    usuario_coordinador_cuid: { type: String, required: true }
  }, { _id: false });

  ActuacionSanitariaSchema = new Schema({
    tipo_origen: {
      type: String,
      required: [true, 'El tipo_origen es obligatorio'],
      enum: TIPO_ORIGEN_ENUM
    },
    numero_expediente: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (this.tipo_origen === 'DENUNCIA') {
            return typeof v === 'string' && v.trim().length > 0;
          }
          return true;
        },
        message: 'El número de expediente es obligatorio para inspecciones de origen DENUNCIA'
      }
    },
    cuit_titular: {
      type: String,
      required: [true, 'El CUIT del titular es obligatorio'],
      index: true,
      trim: true
    },
    establecimiento_id: {
      type: String,
      default: null,
      index: true
    },
    direccion_relevada: {
      type: String,
      trim: true
    },
    razon_social_relevada: {
      type: String,
      trim: true
    },
    inspector_asignado_cuid: {
      type: String,
      default: 'INSPECTOR_GENERICO',
      index: true
    },
    fecha_programada: {
      type: Date,
      default: Date.now
    },
    caratula_enmascarada: {
      type: String,
      default: 'Fiscalización Sanitaria / Control de Habilitación'
    },
    estado: {
      type: String,
      required: true,
      enum: ESTADO_INSPECCION_ENUM,
      default: 'BORRADOR'
    },
    hallazgos: [HallazgoSchema],
    firmas: {
      type: FirmaSchema,
      default: null
    },
    dictamen_coordinador: {
      type: DictamenCoordinadorSchema,
      default: null
    },
    acta_pdf_hash: {
      type: String,
      default: null
    },
    es_latente: {
      type: Boolean,
      default: function () {
        return this.tipo_origen === 'DENUNCIA' && !this.establecimiento_id;
      }
    },
    historial_estados: [HistorialEstadoSchema]
  }, {
    timestamps: true
  });

  ActuacionSanitariaSchema.index({ cuit_titular: 1, es_latente: 1 });
  ActuacionSanitariaSchema.index({ inspector_asignado_cuid: 1, estado: 1 });

  ActuacionSanitariaSchema.methods.esInmutable = function () {
    return ['ACTA_CERRADA', 'EMPLAZADO', 'DICTAMINADO', 'HANDOFF_EFECTOR', 'FINALIZADO', 'EN_SUMARIO', 'CLAUSURADO'].includes(this.estado);
  };

} catch (err) {
  // Mongoose fallback
}

module.exports = {
  TIPO_ORIGEN_ENUM,
  ESTADO_INSPECCION_ENUM,
  calcularHashActa,
  ActuacionSanitariaSchema,
  getModel: () => {
    if (mongoose && mongoose.models && mongoose.models.ActuacionSanitaria) {
      return mongoose.models.ActuacionSanitaria;
    }
    if (mongoose && ActuacionSanitariaSchema) {
      return mongoose.model('ActuacionSanitaria', ActuacionSanitariaSchema);
    }
    return null;
  }
};
