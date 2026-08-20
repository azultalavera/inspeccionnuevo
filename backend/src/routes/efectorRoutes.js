/**
 * @file efectorRoutes.js
 * @description Rutas API REST para el perfil Efector, mis denuncias y hooks de Login/SSO.
 */

const express = require('express');
const router = express.Router();

const efectorController = require('../controllers/efectorController');
const denunciaController = require('../controllers/denunciaController');

/**
 * @route   GET /api/efector/antecedentes/:cuit
 * @desc    Hook/Consulta al login del Efector (CiDi/SSO) para recuperar actas históricas y vincular antecedentes latentes
 * @access  Efector / Autenticado
 */
router.get('/antecedentes/:cuit', efectorController.obtenerAntecedentes);

/**
 * @route   GET /api/efector/mis-denuncias
 * @desc    Consultar el historial y estado de las denuncias presentadas por el efector autenticado
 * @access  Efector / Ciudadano Autenticado
 */
router.get('/mis-denuncias', denunciaController.obtenerMisDenuncias);

module.exports = router;
