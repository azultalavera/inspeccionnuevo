/**
 * @file denunciaValidationMiddleware.js
 * @description Middleware de sanitización de inputs y validación estricta para la presentación de denuncias sanitarias.
 */

const { MOTIVO_DENUNCIA_ENUM } = require('../models/ExpedienteDenuncia');

/**
 * Función helper para sanitizar texto contra inyecciones XSS e HTML desinfectando etiquetas.
 * @param {string} str 
 * @returns {string} Texto limpio
 */
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, '') // Elimina etiquetas HTML
    .trim();
}

/**
 * Middleware para validar y sanitizar el payload de la denuncia antes de procesarlo
 */
function validateCrearDenuncia(req, res, next) {
  const { denunciante, establecimiento_denunciado, motivo_denuncia, descripcion_detallada } = req.body;

  const errors = [];

  // 1. Validar Denunciante
  if (!denunciante || typeof denunciante !== 'object') {
    errors.push('Los datos del denunciante son requeridos.');
  } else {
    if (!denunciante.cuit_cuil || typeof denunciante.cuit_cuil !== 'string' || denunciante.cuit_cuil.trim().length === 0) {
      errors.push('El CUIT/CUIL del denunciante es obligatorio.');
    }
    if (!denunciante.nombre_completo || typeof denunciante.nombre_completo !== 'string' || denunciante.nombre_completo.trim().length === 0) {
      errors.push('El nombre completo del denunciante es obligatorio.');
    }
    if (!denunciante.correo || !denunciante.correo.includes('@')) {
      errors.push('Se debe proporcionar un correo electrónico válido.');
    }
  }

  // 2. Validar Establecimiento Denunciado
  if (!establecimiento_denunciado || typeof establecimiento_denunciado !== 'object') {
    errors.push('Los datos del establecimiento denunciado son requeridos.');
  } else {
    if (!establecimiento_denunciado.razon_social_o_nombre || typeof establecimiento_denunciado.razon_social_o_nombre !== 'string' || establecimiento_denunciado.razon_social_o_nombre.trim().length === 0) {
      errors.push('La razón social o nombre del establecimiento denunciado es obligatoria.');
    }
    if (!establecimiento_denunciado.domicilio || !establecimiento_denunciado.domicilio.calle || !establecimiento_denunciado.domicilio.localidad) {
      errors.push('El domicilio (calle y localidad) del establecimiento es obligatorio.');
    }
  }

  // 3. Validar Motivo y Descripción
  if (!motivo_denuncia || !MOTIVO_DENUNCIA_ENUM.includes(motivo_denuncia)) {
    errors.push(`El motivo de denuncia no es válido. Opciones permitidas: ${MOTIVO_DENUNCIA_ENUM.join(', ')}`);
  }

  if (!descripcion_detallada || typeof descripcion_detallada !== 'string' || descripcion_detallada.trim().length < 10) {
    errors.push('La descripción detallada del hecho es obligatoria y debe contener al menos 10 caracteres.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'VALIDATION_ERROR',
      mensaje: 'Faltan parámetros o la estructura de la denuncia es inválida.',
      detalles: errors
    });
  }

  // Sanitización de inputs
  req.body.descripcion_detallada = sanitizeText(descripcion_detallada);
  req.body.denunciante.nombre_completo = sanitizeText(denunciante.nombre_completo);
  req.body.establecimiento_denunciado.razon_social_o_nombre = sanitizeText(establecimiento_denunciado.razon_social_o_nombre);

  if (req.body.establecimiento_denunciado.domicilio) {
    req.body.establecimiento_denunciado.domicilio.calle = sanitizeText(req.body.establecimiento_denunciado.domicilio.calle);
    req.body.establecimiento_denunciado.domicilio.localidad = sanitizeText(req.body.establecimiento_denunciado.domicilio.localidad);
  }

  next();
}

module.exports = {
  sanitizeText,
  validateCrearDenuncia
};
