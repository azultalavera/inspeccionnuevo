/**
 * @file inspectorController.js
 * @description Controlador HTTP / REST API para la Agenda de Campo del Inspector en Tablet con Enmascaramiento de Denunciante.
 */

const inspeccionService = require('../services/inspeccionService');

/**
 * BANDEJA DE INSPECCIONES (AGENDA DE CAMPO)
 * GET /api/inspector/agenda
 */
async function obtenerAgendaTerreno(req, res) {
  try {
    const inspectorCuid = req.headers['x-user-cuid'] || req.query.inspector_cuid || null;
    const agenda = await inspeccionService.obtenerAgendaInspector(inspectorCuid);

    return res.status(200).json({
      ok: true,
      total: agenda.length,
      inspector_cuid: inspectorCuid || 'TODOS_LOS_INSPECTORES',
      data: agenda
    });
  } catch (error) {
    console.error('Error al obtener agenda del inspector:', error);
    return res.status(500).json({
      ok: false,
      error: 'AGENDA_INSPECTOR_ERROR',
      mensaje: error.message
    });
  }
}

module.exports = {
  obtenerAgendaTerreno
};
