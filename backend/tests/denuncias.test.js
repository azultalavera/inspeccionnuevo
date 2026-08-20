/**
 * @file denuncias.test.js
 * @description Suite de Pruebas de Integración para el Módulo de Presentación e Inicio de Denuncias Sanitarias.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../src/app');

let server;
let BASE_URL;

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
// TESTS DE PRESENTACIÓN DE DENUNCIAS SANITARIAS
// ============================================================================
test('Denuncias: Rechazar creación si la descripción es insuficiente o insana', async () => {
  const payloadInvalido = {
    denunciante: {
      cuit_cuil: '20-11223344-5',
      nombre_completo: 'Juan Pérez',
      correo: 'juan@ejemplo.com'
    },
    establecimiento_denunciado: {
      razon_social_o_nombre: 'Estética Clandestina',
      domicilio: { calle: 'Belgrano', numero: '100', localidad: 'Córdoba' }
    },
    motivo_denuncia: 'FALTA_HABILITACION',
    descripcion_detallada: 'Corta' // Menos de 10 caracteres
  };

  const res = await request('POST', '/api/denuncias', payloadInvalido);
  assert.equal(res.status, 400);
  assert.equal(res.body.ok, false);
  assert.equal(res.body.error, 'VALIDATION_ERROR');
});

test('Denuncias: Crear Denuncia Sanitaria y Auto-generar N° de Expediente DEN-YYYY-XXXXX', async () => {
  const payloadValido = {
    denunciante: {
      cuit_cuil: '20-99999999-9',
      nombre_completo: 'María González',
      correo: 'maria@ejemplo.com',
      es_anonima: false
    },
    establecimiento_denunciado: {
      es_registrado: false,
      razon_social_o_nombre: 'Geriátrico No Registrado Sol Naciente <script>alert("xss")</script>',
      cuit_titular_presunto: '30-99887766-1',
      domicilio: {
        calle: 'Av. Vélez Sarsfield',
        numero: '3500',
        localidad: 'Córdoba',
        departamento: 'Capital'
      },
      tipologia_estimada: 'Geriátrico'
    },
    motivo_denuncia: 'FALTA_HABILITACION',
    descripcion_detallada: 'Se observa funcionamiento de residencia geriátrica sin cartel indicador ni habilitación del Ministerio de Salud.',
    adjuntos_evidencia: [
      { url: 'https://clicsalud.gob.ar/evidencia1.jpg', tipo: 'IMAGEN' }
    ]
  };

  const res = await request('POST', '/api/denuncias', payloadValido);

  assert.equal(res.status, 201);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.data.numero_expediente.startsWith('DEN-2026-'));
  // Sanitización de XSS comprobada
  assert.equal(res.body.data.establecimiento_denunciado.razon_social_o_nombre, 'Geriátrico No Registrado Sol Naciente');
  assert.ok(res.body.data.inspeccion_asociada_id !== null);

  const numExpedienteGenerado = res.body.data.numero_expediente;

  // Consultar mis denuncias desde el perfil Efector/Ciudadano
  const resMisDenuncias = await request('GET', '/api/efector/mis-denuncias?cuit_cuil=20-99999999-9');
  assert.equal(resMisDenuncias.status, 200);
  assert.equal(resMisDenuncias.body.ok, true);
  assert.equal(resMisDenuncias.body.total, 1);
  assert.equal(resMisDenuncias.body.data[0].numero_expediente, numExpedienteGenerado);

  // Consultar denuncias pendientes para bandeja administrativa del Ministerio
  const resAdmin = await request('GET', '/api/admin/denuncias/pendientes', null, { 'x-user-role': 'ADMIN_MINISTERIO' });
  assert.equal(resAdmin.status, 200);
  assert.equal(resAdmin.body.ok, true);
  assert.ok(resAdmin.body.total >= 1);
});

test('Denuncias: Resguardo de Confidencialidad y Anonimato', async () => {
  const payloadAnonimo = {
    denunciante: {
      cuit_cuil: '27-55667788-9',
      nombre_completo: 'Anonimizado Test',
      correo: 'secreto@ejemplo.com',
      es_anonima: true
    },
    establecimiento_denunciado: {
      razon_social_o_nombre: 'Consultorio Odontológico Ilegal',
      domicilio: { calle: 'Ruta 9', numero: 'Km 50', localidad: 'Jesús María' }
    },
    motivo_denuncia: 'EJERCICIO_ILEGAL',
    descripcion_detallada: 'Atención odontológica realizada por persona sin matrícula profesional sanitaria.'
  };

  const res = await request('POST', '/api/denuncias', payloadAnonimo, { 'x-user-role': 'EFECTOR' });

  assert.equal(res.status, 201);
  assert.equal(res.body.data.denunciante.es_anonima, true);
  assert.equal(res.body.data.denunciante.cuit_cuil, 'RESERVADO_ANONIMO');
  assert.ok(res.body.data.denunciante.nombre_completo.includes('Denunciante Anónimo'));
});
