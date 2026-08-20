/**
 * @file coordinadorController.js
 * @description Controlador HTTP / REST API para las Operaciones del Rol Coordinador de Fiscalización Sanitaria.
 */

const denunciaService = require('../services/denunciaService');
const inspeccionService = require('../services/inspeccionService');

/**
 * 1. BANDEJA DE DENUNCIAS (ENTRADA ÚNICA)
 * GET /api/admin/coordinador/denuncias
 */
async function obtenerBandejaEntradaUnica(req, res) {
  try {
    const denuncias = await denunciaService.obtenerTodasBandejaCoordinador();
    return res.status(200).json({
      ok: true,
      total: denuncias.length,
      data: denuncias
    });
  } catch (error) {
    console.error('Error al obtener bandeja de entrada única de denuncias:', error);
    return res.status(500).json({
      ok: false,
      error: 'SERVER_ERROR',
      mensaje: error.message
    });
  }
}

/**
 * BANDEJA DE DENUNCIAS EFECTOR Y JUSTICIA (COORDINADOR)
 * GET /api/admin/coordinador/denuncias/efector-justicia
 */
async function obtenerBandejaEfectorJusticia(req, res) {
  try {
    const denuncias = await denunciaService.obtenerDenunciasEfectorJusticia();
    return res.status(200).json({
      ok: true,
      total: denuncias.length,
      data: denuncias
    });
  } catch (error) {
    console.error('Error al obtener bandeja de denuncias de efector y justicia:', error);
    return res.status(500).json({
      ok: false,
      error: 'SERVER_ERROR',
      mensaje: error.message
    });
  }
}

/**
 * CARGAR DENUNCIA EXTERNA (GDE, Papel, Mail, Oficio Judicial)
 * POST /api/admin/coordinador/denuncias/externa
 */
async function crearDenunciaExterna(req, res) {
  try {
    const nuevaDenuncia = await denunciaService.crearDenunciaExterna(req.body);
    return res.status(201).json({
      ok: true,
      mensaje: 'Denuncia externa registrada correctamente en la bandeja única.',
      data: nuevaDenuncia
    });
  } catch (error) {
    console.error('Error al crear denuncia externa:', error);
    return res.status(400).json({
      ok: false,
      error: 'DENUNCIA_EXTERNA_ERROR',
      mensaje: error.message
    });
  }
}

/**
 * ACCIÓN A: DESESTIMAR / ARCHIVAR DENUNCIA
 * POST /api/admin/coordinador/denuncias/:id/desestimar
 */
async function desestimarDenuncia(req, res) {
  try {
    const { id } = req.params;
    const { motivo_archivado, usuario_cuid } = req.body;
    const denuncia = await denunciaService.desestimarDenuncia(id, motivo_archivado, usuario_cuid);

    return res.status(200).json({
      ok: true,
      mensaje: 'Expediente de denuncia desestimado y archivado por falta de mérito.',
      data: denuncia
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: 'DESESTIMAR_ERROR',
      mensaje: error.message
    });
  }
}

/**
 * ACCIÓN B: INTIMAR A TRÁMITE DIRECTO
 * POST /api/admin/coordinador/denuncias/:id/intimar-tramite
 */
async function intimarTramiteDirecto(req, res) {
  try {
    const { id } = req.params;
    const { observaciones, plazo_dias, usuario_cuid } = req.body;
    const denuncia = await denunciaService.intimarTramiteDirecto(id, observaciones, plazo_dias, usuario_cuid);

    return res.status(200).json({
      ok: true,
      mensaje: 'Notificación de intimación a trámite directo enviada al efector.',
      data: denuncia
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: 'INTIMAR_TRAMITE_ERROR',
      mensaje: error.message
    });
  }
}

/**
 * ACCIÓN C: ORDENAR INSPECCIÓN IN SITU
 * POST /api/admin/coordinador/denuncias/:id/ordenar-inspeccion
 */
async function ordenarInspeccion(req, res) {
  try {
    const { id } = req.params;
    const { inspector_cuid, fecha_visita, observaciones, usuario_cuid } = req.body;
    const denuncia = await denunciaService.ordenarInspeccion(id, { inspector_cuid, fecha_visita, observaciones }, usuario_cuid);

    return res.status(200).json({
      ok: true,
      mensaje: 'Inspección de oficio despachada exitosamente a la agenda del inspector.',
      data: denuncia
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: 'ORDENAR_INSPECCION_ERROR',
      mensaje: error.message
    });
  }
}

/**
 * 2. PANEL DE ALERTAS Y VENCIMIENTOS (INSPECCIONES DE RUTINA)
 * GET /api/admin/coordinador/alertas-rutina
 */
async function obtenerAlertasYVencimientosRutina(req, res) {
  try {
    const alertas = await inspeccionService.obtenerAlertasYVencimientosRutina();
    return res.status(200).json({
      ok: true,
      total: alertas.length,
      data: alertas
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'ALERTAS_RUTINA_ERROR',
      mensaje: error.message
    });
  }
}

/**
 * PROGRAMAR INSPECCIÓN DE RUTINA
 * POST /api/admin/coordinador/programar-rutina
 */
async function programarInspeccionRutina(req, res) {
  try {
    const nuevaActuacion = await inspeccionService.programarInspeccionRutina(req.body);
    return res.status(201).json({
      ok: true,
      mensaje: 'Inspección de rutina programada exitosamente.',
      data: nuevaActuacion
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: 'PROGRAMAR_RUTINA_ERROR',
      mensaje: error.message
    });
  }
}

/**
 * 3. BANDEJA DE DICTAMEN Y RESOLUCIÓN
 * GET /api/admin/coordinador/dictamenes/pendientes
 */
async function obtenerDictamenesPendientes(req, res) {
  try {
    const dictamenes = await inspeccionService.obtenerBandejaDictamenCoordinador();
    return res.status(200).json({
      ok: true,
      total: dictamenes.length,
      data: dictamenes
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'DICTAMENES_PENDIENTES_ERROR',
      mensaje: error.message
    });
  }
}

/**
 * APLICAR DICTAMEN ADMINISTRATIVO Y RESOLUCIÓN
 * POST /api/admin/coordinador/dictamenes/:id/resolucion
 */
async function aplicarDictamenResolucion(req, res) {
  try {
    const { id } = req.params;
    const actuacionDictaminada = await inspeccionService.aplicarDictamenCoordinador(id, req.body);
    return res.status(200).json({
      ok: true,
      mensaje: `Dictamen administrativo '${req.body.resolucion}' aplicado exitosamente al acta.`,
      data: actuacionDictaminada
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: 'DICTAMEN_APLICAR_ERROR',
      mensaje: error.message
    });
  }
}

module.exports = {
  obtenerBandejaEntradaUnica,
  obtenerBandejaEfectorJusticia,
  crearDenunciaExterna,
  desestimarDenuncia,
  intimarTramiteDirecto,
  ordenarInspeccion,
  obtenerAlertasYVencimientosRutina,
  programarInspeccionRutina,
  obtenerDictamenesPendientes,
  aplicarDictamenResolucion
};
