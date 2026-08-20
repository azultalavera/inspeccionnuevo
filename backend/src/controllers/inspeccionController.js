/**
 * @file inspeccionController.js
 * @description Controlador HTTP (Express) para el módulo de Inspección de Oficio y Cierre de Actas.
 */

const inspeccionService = require('../services/inspeccionService');

/**
 * POST /api/inspecciones/oficio/rutina
 * Iniciar inspección de rutina para un establecimiento registrado
 */
async function iniciarRutina(req, res) {
  try {
    const nuevaActuacion = await inspeccionService.crearInspeccionRutina(req.body);
    return res.status(201).json({
      ok: true,
      mensaje: 'Inspección de oficio por rutina iniciada correctamente con establecimiento vinculado.',
      data: nuevaActuacion
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'SERVER_ERROR',
      mensaje: 'Error al iniciar la inspección de rutina.',
      detalles: err.message
    });
  }
}

/**
 * POST /api/inspecciones/oficio/denuncia
 * Iniciar inspección por denuncia o hallazgo de local clandestino (requiere Expediente + CUIT)
 */
async function iniciarDenuncia(req, res) {
  try {
    const nuevaActuacion = await inspeccionService.crearInspeccionDenuncia(req.body);
    return res.status(201).json({
      ok: true,
      mensaje: 'Inspección de oficio por denuncia registrada de forma latente con Expediente de Fiscalización.',
      data: nuevaActuacion
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'SERVER_ERROR',
      mensaje: 'Error al registrar la inspección por denuncia.',
      detalles: err.message
    });
  }
}

/**
 * POST /api/inspecciones/:id/cierre-acta
 * Cierre in situ con firma CiDi o refuso/negativa, generando hash inmutable SHA-256
 */
async function cerrarActaInSitu(req, res) {
  try {
    const { id } = req.params;
    const actuacionCerrada = await inspeccionService.cerrarActa(id, req.body);
    return res.status(200).json({
      ok: true,
      mensaje: `Acta in situ cerrada exitosamente. Estado: ${actuacionCerrada.estado}. Hash inmutable generado.`,
      data: actuacionCerrada
    });
  } catch (err) {
    const isImmutabilityErr = err.message.includes('INMUTABILIDAD');
    return res.status(isImmutabilityErr ? 403 : 400).json({
      ok: false,
      error: isImmutabilityErr ? 'IMMUTABLE_RECORD' : 'CIERRE_ACTA_ERROR',
      mensaje: err.message
    });
  }
}

/**
 * POST /api/inspecciones/:id/handoff-habilitacion
 * Transicionar el acta aprobada/emplazada a la bandeja del Efector para iniciar enmienda/habilitación
 */
async function handoffHabilitacion(req, res) {
  try {
    const { id } = req.params;
    const usuarioCuid = req.body.usuario_cuid || 'COORDINADOR_SYSTEM';
    const actuacionHandoff = await inspeccionService.handoffHabilitacion(id, usuarioCuid);
    return res.status(200).json({
      ok: true,
      mensaje: 'Hand-off a Habilitación completado. El expediente ha sido derivado a la bandeja del Efector para la enmienda.',
      data: actuacionHandoff
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      error: 'HANDOFF_ERROR',
      mensaje: err.message
    });
  }
}

/**
 * GET /api/inspecciones/:id
 * Consultar detalle de una actuación por ID
 */
async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const actuacion = await inspeccionService.obtenerPorId(id);
    if (!actuacion) {
      return res.status(404).json({
        ok: false,
        error: 'NOT_FOUND',
        mensaje: `No se encontró ninguna actuación con ID: ${id}`
      });
    }
    return res.status(200).json({
      ok: true,
      data: actuacion
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'SERVER_ERROR',
      mensaje: err.message
    });
  }
}

module.exports = {
  iniciarRutina,
  iniciarDenuncia,
  cerrarActaInSitu,
  handoffHabilitacion,
  obtenerPorId
};
