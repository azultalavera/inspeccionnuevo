/**
 * @file inspeccionRoutes.js
 * @description Rutas API REST para el módulo de Inspecciones de Oficio y Actuaciones Sanitarias.
 */

const express = require('express');
const router = express.Router();

const inspeccionController = require('../controllers/inspeccionController');
const {
  validateInspeccionRutina,
  validateInspeccionDenuncia,
  validateCierreActa
} = require('../middlewares/validationMiddleware');
const { enforceActaImmutability } = require('../middlewares/immutabilityMiddleware');
const inspeccionService = require('../services/inspeccionService');

// Middleware para inmutabilidad sobre IDs
const checkImmutability = enforceActaImmutability((id) => inspeccionService.obtenerPorId(id));

/**
 * @route   POST /api/inspecciones/oficio/rutina
 * @desc    Flujo 1: Iniciar inspección de rutina para un establecimiento registrado
 * @access  Inspector / Coordinador / Admin
 */
router.post('/oficio/rutina', validateInspeccionRutina, inspeccionController.iniciarRutina);

/**
 * @route   POST /api/inspecciones/oficio/denuncia
 * @desc    Flujo 2: Iniciar inspección por denuncia o local clandestino (Expediente Obligatorio + CUIT)
 * @access  Inspector / Coordinador / Admin
 */
router.post('/oficio/denuncia', validateInspeccionDenuncia, inspeccionController.iniciarDenuncia);

/**
 * @route   POST /api/inspecciones/:id/cierre-acta
 * @desc    Cierre in situ del acta con firma CiDi o registro de refuso + Hash inmutable
 * @access  Inspector in situ
 */
router.post('/:id/cierre-acta', checkImmutability, validateCierreActa, inspeccionController.cerrarActaInSitu);

/**
 * @route   POST /api/inspecciones/:id/handoff-habilitacion
 * @desc    Flujo 3: Hand-off a Habilitación/Enmienda (Traspaso al Efector)
 * @access  Coordinador / Inspector
 */
router.post('/:id/handoff-habilitacion', checkImmutability, inspeccionController.handoffHabilitacion);

/**
 * @route   GET /api/inspecciones/:id
 * @desc    Obtener detalles de una actuación por ID
 * @access  Autenticado
 */
router.get('/:id', inspeccionController.obtenerPorId);

module.exports = router;
