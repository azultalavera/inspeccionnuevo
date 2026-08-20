/**
 * @file authRoleMiddleware.js
 * @description Middleware de Control de Acceso Basado en Roles (RBAC) para ClicSalud+.
 */

/**
 * Genera un middleware que verifica que el usuario autenticado posea al menos uno de los roles autorizados.
 * @param {Array<string>} rolesPermitidos Lista de roles autorizados ('COORDINADOR', 'INSPECTOR', 'EFECTOR', 'ADMIN_MINISTERIO')
 */
function authorizeRoles(...rolesPermitidos) {
  return (req, res, next) => {
    // Extraer rol del header 'x-user-role' o req.user (fallback de SSO/CiDi)
    const userRole = req.headers['x-user-role'] || (req.user && req.user.rol) || 'EFECTOR';

    // Normalizar para comparación
    const normalizedRole = userRole.toUpperCase().trim();
    const normalizedAllowed = rolesPermitidos.map(r => r.toUpperCase().trim());

    // ADMIN_MINISTERIO y COORDINADOR son equivalentes para funciones administrativas
    if (normalizedRole === 'ADMIN_MINISTERIO' && normalizedAllowed.includes('COORDINADOR')) {
      return next();
    }

    if (!normalizedAllowed.includes(normalizedRole)) {
      return res.status(403).json({
        ok: false,
        error: 'ACCESS_DENIED',
        mensaje: `Acceso no autorizado. Se requiere uno de los siguientes roles: [${rolesPermitidos.join(', ')}]. Rol actual: '${userRole}'`
      });
    }

    next();
  };
}

module.exports = {
  authorizeRoles
};
