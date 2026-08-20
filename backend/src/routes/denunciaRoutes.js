/**
 * @file denunciaRoutes.js
 * @description Rutas API REST para la Presentación de Denuncias Sanitarias y Bandeja Administrativa.
 */

const express = require('express');
const router = express.Router();

const denunciaController = require('../controllers/denunciaController');
const { validateCrearDenuncia } = require('../middlewares/denunciaValidationMiddleware');

/**
 * @route   POST /api/denuncias
 * @desc    Crear una nueva denuncia sanitaria (Efector / Ciudadano)
 * @access  Autenticado (SSO / CiDi)
 */
router.post('/', validateCrearDenuncia, denunciaController.crearDenuncia);

/**
 * @route   GET /api/admin/denuncias/pendientes
 * @desc    Bandeja administrativa del Ministerio para consultar denuncias entrantes y derivar
 * @access  Admin Ministerio / Fiscalización
 */
router.get('/admin/pendientes', denunciaController.obtenerPendientesAdmin);

module.exports = router;
