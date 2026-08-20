/**
 * @file validationMiddleware.js
 * @description Middlewares de validación de negocio para los 3 flujos de Inspección de Oficio.
 */

const { TIPO_ORIGEN_ENUM } = require('../models/ActuacionSanitaria');

/**
 * Validar inicio de Inspección de Oficio: RUTINA
 */
function validateInspeccionRutina(req, res, next) {
  const { cuit_titular, establecimiento_id } = req.body;

  const errors = [];
  if (!cuit_titular || typeof cuit_titular !== 'string' || cuit_titular.trim().length === 0) {
    errors.push('El campo "cuit_titular" es obligatorio.');
  }
  if (!establecimiento_id || typeof establecimiento_id !== 'string' || establecimiento_id.trim().length === 0) {
    errors.push('El campo "establecimiento_id" (ID/Expediente de establecimiento habilitado/registrado) es obligatorio para inspecciones de rutina.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'VALIDATION_ERROR',
      mensaje: 'Faltan parámetros requeridos para iniciar Inspección de Oficio por Rutina.',
      detalles: errors
    });
  }

  req.body.tipo_origen = 'RUTINA';
  next();
}

/**
 * Validar inicio de Inspección de Oficio: DENUNCIA / CLANDESTINO
 */
function validateInspeccionDenuncia(req, res, next) {
  const { numero_expediente, cuit_titular } = req.body;

  const errors = [];
  if (!numero_expediente || typeof numero_expediente !== 'string' || numero_expediente.trim().length === 0) {
    errors.push('REGLA DE NEGOCIO: El "numero_expediente" (Expediente de Denuncia / Fiscalización) es OBLIGATORIO para iniciar una inspección por denuncia o hallazgo de clandestinidad.');
  }
  if (!cuit_titular || typeof cuit_titular !== 'string' || cuit_titular.trim().length === 0) {
    errors.push('El CUIT del titular/responsable relevado en terreno ("cuit_titular") es obligatorio.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'VALIDATION_ERROR',
      mensaje: 'Validación de Inspección por Denuncia fallida.',
      detalles: errors
    });
  }

  req.body.tipo_origen = 'DENUNCIA';
  next();
}

/**
 * Validar Cierre In Situ de Acta
 */
function validateCierreActa(req, res, next) {
  const { inspector_cuid, responsable_cuid, motivo_negativa, firmado_cidi } = req.body;

  const errors = [];
  if (!inspector_cuid) {
    errors.push('Se requiere el CUID del Inspector para rubricar la actuación.');
  }

  // Debe contar con firma del responsable o un motivo explícito de negativa de firma in situ
  if (!responsable_cuid && !motivo_negativa) {
    errors.push('Se debe incluir el CUID/DNI del responsable que firma o registrar el "motivo_negativa" en caso de rehuso a la notificación.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'VALIDATION_ERROR',
      mensaje: 'Error de firma y cierre de acta.',
      detalles: errors
    });
  }

  next();
}

module.exports = {
  validateInspeccionRutina,
  validateInspeccionDenuncia,
  validateCierreActa
};
