/**
 * @file efectorController.js
 * @description Controlador HTTP para consultas y hooks de la bandeja/SSO del Efector.
 */

const inspeccionService = require('../services/inspeccionService');

/**
 * GET /api/efector/antecedentes/:cuit
 * Hook de consulta ejecutado al login del Efector (vía CiDi / SSO) para recuperar actas históricas
 * y asociar automáticamente antecedentes latentes de denuncias de oficio.
 */
async function obtenerAntecedentes(req, res) {
  try {
    const { cuit } = req.params;
    const establecimientoIdActual = req.query.establecimiento_id || req.headers['x-establecimiento-id'] || null;

    if (!cuit || typeof cuit !== 'string' || cuit.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        mensaje: 'El CUIT del Efector es un parámetro requerido.'
      });
    }

    const resultado = await inspeccionService.obtenerAntecedentesEfector(cuit, establecimientoIdActual);

    return res.status(200).json({
      ok: true,
      mensaje: `Antecedentes recuperados exitosamente para el CUIT ${cuit}. Actas vinculadas en esta sesión: ${resultado.actas_latentes_vinculadas}`,
      data: resultado
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'SERVER_ERROR',
      mensaje: 'Error al consultar antecedentes del efector.',
      detalles: err.message
    });
  }
}

module.exports = {
  obtenerAntecedentes
};
