/**
 * @file denunciaController.js
 * @description Controlador HTTP (Express) para el módulo de Presentación e Inicio de Denuncias Sanitarias.
 */

const denunciaService = require('../services/denunciaService');

/**
 * POST /api/denuncias
 * Crear una nueva denuncia sanitaria por parte de un Efector o Ciudadano
 */
async function crearDenuncia(req, res) {
  try {
    const nuevaDenuncia = await denunciaService.crearDenuncia(req.body);
    const denunciaSanitizada = denunciaService.sanitizarDenuncianteSegunRol(nuevaDenuncia, req.headers['x-user-role'] || 'EFECTOR');

    return res.status(201).json({
      ok: true,
      mensaje: `Denuncia sanitaria registrada exitosamente. N° de Expediente asignado: ${nuevaDenuncia.numero_expediente}`,
      data: denunciaSanitizada
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'SERVER_ERROR',
      mensaje: 'Error al registrar la denuncia sanitaria.',
      detalles: err.message
    });
  }
}

/**
 * GET /api/efector/mis-denuncias
 * Consultar las denuncias realizadas por el usuario autenticado (Efector / Ciudadano)
 */
async function obtenerMisDenuncias(req, res) {
  try {
    const cuitCuil = req.query.cuit_cuil || req.headers['x-user-cuit'];

    if (!cuitCuil) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        mensaje: 'Se requiere el CUIT/CUIL del usuario (vía query cuit_cuil o header x-user-cuit).'
      });
    }

    const denuncias = await denunciaService.obtenerDenunciasPorDenunciante(cuitCuil);
    const denunciasSanitizadas = denuncias.map(d => denunciaService.sanitizarDenuncianteSegunRol(d, 'EFECTOR'));

    return res.status(200).json({
      ok: true,
      total: denunciasSanitizadas.length,
      data: denunciasSanitizadas
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'SERVER_ERROR',
      mensaje: 'Error al recuperar mis denuncias.',
      detalles: err.message
    });
  }
}

/**
 * GET /api/admin/denuncias/pendientes
 * Consultar la bandeja de denuncias entrantes del Ministerio para derivar a fiscalización
 */
async function obtenerPendientesAdmin(req, res) {
  try {
    const rol = req.headers['x-user-role'] || 'ADMIN_MINISTERIO';
    const denuncias = await denunciaService.obtenerDenunciasPendientesAdmin();
    const denunciasSanitizadas = denuncias.map(d => denunciaService.sanitizarDenuncianteSegunRol(d, rol));

    return res.status(200).json({
      ok: true,
      total: denunciasSanitizadas.length,
      data: denunciasSanitizadas
    });
  } catch (err) {
    console.error('Error en obtenerPendientesAdmin:', err);
    return res.status(500).json({
      ok: false,
      error: 'SERVER_ERROR',
      mensaje: 'Error al recuperar la bandeja de denuncias pendientes.',
      detalles: err.message
    });
  }
}

module.exports = {
  crearDenuncia,
  obtenerMisDenuncias,
  obtenerPendientesAdmin
};
