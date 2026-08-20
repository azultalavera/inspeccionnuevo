/**
 * @file coordinadorRoutes.js
 * @description Rutas API REST para el Rol Coordinador de Fiscalización Sanitaria.
 */

const express = require('express');
const router = express.Router();

const coordinadorController = require('../controllers/coordinadorController');
const { authorizeRoles } = require('../middlewares/authRoleMiddleware');

// Aplicar restricción de Rol Coordinador a todas las rutas de este módulo
router.use(authorizeRoles('COORDINADOR', 'ADMIN_MINISTERIO'));

/**
 * 1. BANDEJA DE DENUNCIAS (ENTRADA ÚNICA)
 */
router.get('/denuncias', coordinadorController.obtenerBandejaEntradaUnica);
router.get('/denuncias/efector-justicia', coordinadorController.obtenerBandejaEfectorJusticia);
router.post('/denuncias/externa', coordinadorController.crearDenunciaExterna);
router.post('/denuncias/:id/desestimar', coordinadorController.desestimarDenuncia);
router.post('/denuncias/:id/intimar-tramite', coordinadorController.intimarTramiteDirecto);
router.post('/denuncias/:id/ordenar-inspeccion', coordinadorController.ordenarInspeccion);

/**
 * 2. PANEL DE ALERTAS Y VENCIMIENTOS (INSPECCIONES DE RUTINA)
 */
router.get('/alertas-rutina', coordinadorController.obtenerAlertasYVencimientosRutina);
router.post('/programar-rutina', coordinadorController.programarInspeccionRutina);

/**
 * 3. BANDEJA DE DICTAMEN Y RESOLUCIÓN
 */
router.get('/dictamenes/pendientes', coordinadorController.obtenerDictamenesPendientes);
router.post('/dictamenes/:id/resolucion', coordinadorController.aplicarDictamenResolucion);

module.exports = router;
