/**
 * @file inspecciones.test.js
 * @description Suite de Pruebas de Integración para los 3 Flujos de Inspección de Oficio,
 * Inmutabilidad de Actas y Hook de Login/Antecedentes del Efector.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../src/app');

let server;
let BASE_URL;

// Helper para realizar peticiones HTTP
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : '';
    
    const reqOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

test.before((t, done) => {
  server = app.listen(0, () => {
    const port = server.address().port;
    BASE_URL = `http://localhost:${port}`;
    done();
  });
});

test.after((t, done) => {
  server.close(done);
});

// ============================================================================
// SUITE DE TESTS: FLUJO 1 - INSPECCIÓN DE OFICIO: RUTINA
// ============================================================================
test('Flujo 1: Crear Inspección de Oficio RUTINA con CUIT y Establecimiento Activo', async () => {
  const payload = {
    cuit_titular: '30-11223344-9',
    establecimiento_id: 'EST-HAB-9901',
    direccion_relevada: 'Av. Colón 1234, Córdoba',
    razon_social_relevada: 'Clínica San Martín'
  };

  const res = await request('POST', '/api/inspecciones/oficio/rutina', payload);
  
  assert.equal(res.status, 201);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.data.tipo_origen, 'RUTINA');
  assert.equal(res.body.data.establecimiento_id, 'EST-HAB-9901');
  assert.equal(res.body.data.es_latente, false);
});

test('Flujo 1 (Error): Rechazar RUTINA si falta establecimiento_id', async () => {
  const payload = {
    cuit_titular: '30-11223344-9'
    // Falta establecimiento_id
  };

  const res = await request('POST', '/api/inspecciones/oficio/rutina', payload);
  
  assert.equal(res.status, 400);
  assert.equal(res.body.ok, false);
  assert.equal(res.body.error, 'VALIDATION_ERROR');
});

// ============================================================================
// SUITE DE TESTS: FLUJO 2 - INSPECCIÓN DE OFICIO: DENUNCIA / CLANDESTINO
// ============================================================================
test('Flujo 2 (Error): Rechazar DENUNCIA si no se incluye N° de Expediente', async () => {
  const payload = {
    cuit_titular: '20-33445566-7',
    direccion_relevada: 'Local Clandestino sin Cartel'
    // Falta numero_expediente
  };

  const res = await request('POST', '/api/inspecciones/oficio/denuncia', payload);
  
  assert.equal(res.status, 400);
  assert.equal(res.body.ok, false);
  assert.equal(res.body.error, 'VALIDATION_ERROR');
});

test('Flujo 2: Crear Inspección DENUNCIA con N° Expediente + CUIT Relevado en Terreno', async () => {
  const payload = {
    numero_expediente: 'EX-2026-98765-DEN',
    cuit_titular: '20-33445566-7',
    direccion_relevada: 'Calle 5 N° 432, Villa María',
    razon_social_relevada: 'Consultorio Odontológico No Registrado',
    hallazgos: [
      {
        servicio: 'Odontología General',
        descripcion: 'Falta de habilitación sanitaria y esterilizador vencido',
        gravedad: 'GRAVE',
        plazo_subsancion_dias: 15
      }
    ]
  };

  const res = await request('POST', '/api/inspecciones/oficio/denuncia', payload);
  
  assert.equal(res.status, 201);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.data.tipo_origen, 'DENUNCIA');
  assert.equal(res.body.data.numero_expediente, 'EX-2026-98765-DEN');
  assert.equal(res.body.data.es_latente, true);
  assert.equal(res.body.data.establecimiento_id, null);

  const idActaDenuncia = res.body.data.id;

  // Cierre In Situ de la Denuncia
  const payloadCierre = {
    inspector_cuid: 'INSP-2044',
    responsable_cuid: 'RESP-TERRENO-99',
    firmado_cidi: true,
    observaciones: 'Acta notificada in situ al responsable relevado en terreno.'
  };

  const resCierre = await request('POST', `/api/inspecciones/${idActaDenuncia}/cierre-acta`, payloadCierre);
  
  assert.equal(resCierre.status, 200);
  assert.equal(resCierre.body.ok, true);
  assert.equal(resCierre.body.data.estado, 'EMPLAZADO');
  assert.notEqual(resCierre.body.data.acta_pdf_hash, null);
  assert.ok(resCierre.body.data.acta_pdf_hash.length >= 32);

  // ============================================================================
  // SUITE DE TESTS: FLUJO 3 - HAND-OFF A HABILITACIÓN / ENMIENDA (Traspaso Efector)
  // ============================================================================
  const resHandoff = await request('POST', `/api/inspecciones/${idActaDenuncia}/handoff-habilitacion`, { usuario_cuid: 'COORD-SANIDAD' });
  
  assert.equal(resHandoff.status, 200);
  assert.equal(resHandoff.body.ok, true);
  assert.equal(resHandoff.body.data.estado, 'HANDOFF_EFECTOR');

  // Verificar Regla de Inmutabilidad post-cierre/handoff
  const resReCierre = await request('POST', `/api/inspecciones/${idActaDenuncia}/cierre-acta`, payloadCierre);
  assert.equal(resReCierre.status, 403);
  assert.equal(resReCierre.body.error, 'IMMUTABLE_RECORD');

  // ============================================================================
  // SUITE DE TESTS: LOGIN ANTECEDENTES HOOK / VINCULACIÓN AUTOMÁTICA LATENTE
  // ============================================================================
  const resAntecedentes = await request('GET', `/api/efector/antecedentes/20-33445566-7?establecimiento_id=EST-NUEVO-VINCULADO-2026`);
  
  assert.equal(resAntecedentes.status, 200);
  assert.equal(resAntecedentes.body.ok, true);
  assert.equal(resAntecedentes.body.data.actas_latentes_vinculadas, 1);
  assert.equal(resAntecedentes.body.data.actuaciones[0].establecimiento_id, 'EST-NUEVO-VINCULADO-2026');
  assert.equal(resAntecedentes.body.data.actuaciones[0].es_latente, false);
});
