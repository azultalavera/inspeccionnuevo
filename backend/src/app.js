/**
 * @file app.js
 * @description Aplicación Principal Express.js para la API REST de ClicSalud+ - Inspecciones de Oficio y Denuncias Sanitarias.
 */

const express = require('express');
const inspeccionRoutes = require('./routes/inspeccionRoutes');
const efectorRoutes = require('./routes/efectorRoutes');
const denunciaRoutes = require('./routes/denunciaRoutes');
const coordinadorRoutes = require('./routes/coordinadorRoutes');
const inspectorRoutes = require('./routes/inspectorRoutes');
const denunciaController = require('./controllers/denunciaController');

const app = express();

// Middlewares Globales
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Header CORS simple para desarrollo / integración con Vite frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-establecimiento-id, x-user-cuit, x-user-role, x-user-cuid');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Endpoint de Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    servicio: 'ClicSalud+ API REST - Inspecciones y Denuncias Sanitarias',
    timestamp: new Date().toISOString(),
    status: 'ONLINE'
  });
});

// Montar Rutas de la API REST por Módulo
app.use('/api/inspecciones', inspeccionRoutes);
app.use('/api/efector', efectorRoutes);
app.use('/api/denuncias', denunciaRoutes);
app.use('/api/admin/coordinador', coordinadorRoutes);
app.use('/api/inspector', inspectorRoutes);

// Endpoint específico de compatibilidad previa para Administración del Ministerio
app.get('/api/admin/denuncias/pendientes', denunciaController.obtenerPendientesAdmin);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'NOT_FOUND',
    mensaje: `La ruta '${req.originalUrl}' no existe en esta API.`
  });
});

// Manejador global de errores (500)
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({
    ok: false,
    error: 'INTERNAL_SERVER_ERROR',
    mensaje: 'Ha ocurrido un error inesperado en el servidor.',
    detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
