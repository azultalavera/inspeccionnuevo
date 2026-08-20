/**
 * @file server.js
 * @description Punto de entrada para el servidor HTTP Express.
 */

const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor ClicSalud+ (Inspección de Oficio) Activo`);
  console.log(`📡 Escuchando en http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
