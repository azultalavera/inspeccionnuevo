/**
 * @file immutabilityMiddleware.js
 * @description Middleware para garantizar la inmutabilidad de las actuaciones y actas cerradas.
 */

const ESTADOS_INMUTABLES = ['ACTA_CERRADA', 'EMPLAZADO', 'HANDOFF_EFECTOR', 'FINALIZADO'];

/**
 * Middleware que verifica si la actuación ya fue cerrada y prohíbe modificaciones posteriores
 */
function enforceActaImmutability(getActaByIdFn) {
  return async (req, res, next) => {
    try {
      const id = req.params.id;
      if (!id) return next();

      const acta = await getActaByIdFn(id);
      if (!acta) {
        return res.status(404).json({
          ok: false,
          error: 'NOT_FOUND',
          mensaje: `No se encontró la actuación con ID: ${id}`
        });
      }

      // Si el estado actual ya es inmutable
      if (ESTADOS_INMUTABLES.includes(acta.estado)) {
        // Excepción: permitir el traspaso Hand-off a Habilitación o la asignación de establecimiento_id si estaba latente
        const isHandoffRoute = req.path.includes('/handoff-habilitacion');
        const isBindingRoute = req.path.includes('/vincular-establecimiento');

        if (!isHandoffRoute && !isBindingRoute) {
          return res.status(403).json({
            ok: false,
            error: 'IMMUTABLE_RECORD',
            mensaje: `INMUTABILIDAD: El acta de inspección (ID: ${id}) está en estado ${acta.estado} y no admite modificaciones a su contenido ni firmas. Hash de integridad: ${acta.acta_pdf_hash || 'SELLADO'}`
          });
        }
      }

      req.actaActual = acta;
      next();
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: 'SERVER_ERROR',
        mensaje: 'Error verificando inmutabilidad del acta',
        detalles: err.message
      });
    }
  };
}

module.exports = {
  ESTADOS_INMUTABLES,
  enforceActaImmutability
};
