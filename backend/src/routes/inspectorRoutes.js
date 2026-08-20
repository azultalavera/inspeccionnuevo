/**
 * @file inspectorRoutes.js
 * @description Rutas API REST para el Rol Inspector (Tablet / App Terreno).
 */

const express = require('express');
const router = express.Router();

const inspectorController = require('../controllers/inspectorController');
const { authorizeRoles } = require('../middlewares/authRoleMiddleware');

// Aplicar restricción de Rol Inspector (o Coordinador / Admin)
router.use(authorizeRoles('INSPECTOR', 'COORDINADOR', 'ADMIN_MINISTERIO'));

/**
 * BANDEJA DE INSPECCIONES (AGENDA DE CAMPO)
 * Retorna las inspecciones de la agenda con regla de enmascaramiento de carátula aplicada.
 */
router.get('/agenda', inspectorController.obtenerAgendaTerreno);

module.exports = router;
