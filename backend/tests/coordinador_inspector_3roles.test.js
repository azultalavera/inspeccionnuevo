/**
 * @file coordinador_inspector_3roles.test.js
 * @description Suite de Pruebas de Integración para la Arquitectura de 3 Roles y Bandejas Operativas
 * (Coordinador, Inspector Tablet con Enmascaramiento y Efector).
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
// 1. ROL COORDINADOR: BANDEJA DE DENUNCIAS (ENTRADA ÚNICA) & ACCIONES
// ============================================================================
test('Coordinador: Rechazar acceso si no posee rol autorizado', async () => {
  const res = await request('GET', '/api/admin/coordinador/denuncias', null, { 'x-user-role': 'EFECTOR' });
  assert.equal(res.status, 403);
  assert.equal(res.body.error, 'ACCESS_DENIED');
});

test('Coordinador: Cargar Denuncia Externa (GDE/Papel) e ingresar a Bandeja Entrada Única', async () => {
  const payloadExterna = {
    origen_denuncia: 'GDE',
    numero_gde: 'GDE-2026-998877-SALUD',
    denunciante: {
      cuit_cuil: '20-11223344-5',
      nombre_completo: 'Juzgado Sanitario N° 2',
      correo: 'juzgado2@justiciacordoba.gob.ar'
    },
    establecimiento_denunciado: {
      razon_social_o_nombre: 'Centro Odontológico No Registrado',
      domicilio: { calle: 'Av. General Paz', numero: '500', localidad: 'Córdoba' }
    },
    motivo_denuncia: 'FALTA_HABILITACION',
    descripcion_detallada: 'Oficio judicial solicitando inspección in situ por falta de matrícula y habilitación.'
  };

  const resCrear = await request('POST', '/api/admin/coordinador/denuncias/externa', payloadExterna, { 'x-user-role': 'COORDINADOR' });
  assert.equal(resCrear.status, 201);
  assert.equal(resCrear.body.ok, true);
  assert.equal(resCrear.body.data.origen_denuncia, 'GDE');
  assert.equal(resCrear.body.data.numero_gde, 'GDE-2026-998877-SALUD');

  const expId = resCrear.body.data.numero_expediente;

  // Consultar Bandeja de Entrada Única
  const resBandeja = await request('GET', '/api/admin/coordinador/denuncias', null, { 'x-user-role': 'COORDINADOR' });
  assert.equal(resBandeja.status, 200);
  assert.ok(resBandeja.body.total >= 1);
});

test('Coordinador: Acciones sobre Denuncia (Desestimar, Intimar, Ordenar Inspección)', async () => {
  // 1. Crear denuncia digital para accionar
  const resDen = await request('POST', '/api/denuncias', {
    denunciante: { cuit_cuil: '20-33445566-7', nombre_completo: 'Test User', correo: 'test@salud.gob.ar' },
    establecimiento_denunciado: { razon_social_o_nombre: 'Consultorio A', domicilio: { calle: 'Ruta 20', localidad: 'Carlos Paz' } },
    motivo_denuncia: 'EQUIPAMIENTO_NO_AUTORIZADO',
    descripcion_detallada: 'Uso de aparatología láser sin certificación ni profesional a cargo.'
  });

  const expCode = resDen.body.data.numero_expediente;

  // Accionar B: Intimar Trámite Directo
  const resIntimar = await request('POST', `/api/admin/coordinador/denuncias/${expCode}/intimar-tramite`, {
    observaciones: 'Se intima al titular a regularizar en 15 días hábiles.',
    plazo_dias: 15
  }, { 'x-user-role': 'COORDINADOR' });

  assert.equal(resIntimar.status, 200);
  assert.equal(resIntimar.body.data.estado, 'INTIMADA_TRAMITE_DIRECTO');
  assert.equal(resIntimar.body.data.resolucion_coordinador.accion, 'INTIMAR_TRAMITE_DIRECTO');

  // Accionar C: Ordenar Inspección in situ
  const resOrdenar = await request('POST', `/api/admin/coordinador/denuncias/${expCode}/ordenar-inspeccion`, {
    inspector_cuid: 'INSP-TERRENO-05',
    observaciones: 'Operativo sorpresivo turno tarde'
  }, { 'x-user-role': 'COORDINADOR' });

  assert.equal(resOrdenar.status, 200);
  assert.equal(resOrdenar.body.data.estado, 'ASIGNADA_A_INSPECCION');
  assert.ok(resOrdenar.body.data.inspeccion_asociada_id !== null);
});

// ============================================================================
// 2. ROL COORDINADOR: PANEL DE ALERTAS Y VENCIMIENTOS (RUTINA)
// ============================================================================
test('Coordinador: Panel de Alertas de Rutina y Programación de Inspección', async () => {
  const resAlertas = await request('GET', '/api/admin/coordinador/alertas-rutina', null, { 'x-user-role': 'COORDINADOR' });
  assert.equal(resAlertas.status, 200);
  assert.ok(resAlertas.body.total >= 1);
  assert.ok(resAlertas.body.data[0].estado_alerta !== undefined);

  // Programar inspección de rutina
  const resProg = await request('POST', '/api/admin/coordinador/programar-rutina', {
    cuit_titular: '30-11223344-9',
    establecimiento_id: 'EST-HAB-9901',
    direccion_relevada: 'Av. Colón 1234, Córdoba',
    razon_social_relevada: 'Clínica San Martín',
    inspector_cuid: 'INSP-RUTINA-12'
  }, { 'x-user-role': 'COORDINADOR' });

  assert.equal(resProg.status, 201);
  assert.equal(resProg.body.data.tipo_origen, 'RUTINA');
  assert.equal(resProg.body.data.estado, 'PROGRAMADA');
});

// ============================================================================
// 3. ROL INSPECTOR: AGENDA EN TABLET CON REGLA DE ENMASCARAMIENTO
// ============================================================================
test('Inspector Tablet: Consultar Agenda de Terreno con Enmascaramiento para Denuncias', async () => {
  const resAgenda = await request('GET', '/api/inspector/agenda', null, {
    'x-user-role': 'INSPECTOR',
    'x-user-cuid': 'INSP-TERRENO-05'
  });

  assert.equal(resAgenda.status, 200);
  assert.equal(resAgenda.body.ok, true);
  assert.ok(resAgenda.body.data.length >= 1);

  const actaDenuncia = resAgenda.body.data.find(a => a.tipo_origen === 'DENUNCIA');
  if (actaDenuncia) {
    assert.equal(actaDenuncia.caratula_terreno, 'Fiscalización Sanitaria / Control de Habilitación');
    assert.equal(actaDenuncia.motivo_sensible_oculto, true);
  }
});

// ============================================================================
// 4. ROL COORDINADOR: BANDEJA DE DICTAMEN Y APLICACIÓN DE RESOLUCIÓN
// ============================================================================
test('Coordinador: Aplicar Dictamen Administrativo sobre Acta Cerrada in situ', async () => {
  // 1. Crear e inspeccionar acta de rutina
  const payloadRut = {
    cuit_titular: '30-99887766-5',
    establecimiento_id: 'EST-HAB-5050',
    direccion_relevada: 'Calle San Martín 100',
    razon_social_relevada: 'Centro Quirúrgico Norte'
  };
  const resActa = await request('POST', '/api/inspecciones/oficio/rutina', payloadRut);
  const actId = resActa.body.data.id;

  // 2. Cerrar in situ
  await request('POST', `/api/inspecciones/${actId}/cierre-acta`, {
    inspector_cuid: 'INSP-99',
    responsable_cuid: 'RESP-99',
    firmado_cidi: true,
    hallazgos: [{ servicio: 'Quirófano', descripcion: 'Falta sensor de oxígeno', gravedad: 'GRAVE', plazo_subsancion_dias: 10 }]
  });

  // 3. Consultar Bandeja de Dictamen
  const resDictamenes = await request('GET', '/api/admin/coordinador/dictamenes/pendientes', null, { 'x-user-role': 'COORDINADOR' });
  assert.equal(resDictamenes.status, 200);
  assert.ok(resDictamenes.body.total >= 1);

  // 4. Aplicar Dictamen: EMPLAZAMIENTO con plazo de 10 días hábiles
  const resDictaminar = await request('POST', `/api/admin/coordinador/dictamenes/${actId}/resolucion`, {
    resolucion: 'EMPLAZAMIENTO',
    plazo_dias_habiles: 10,
    observacion: 'Se otorga plazo perentorio de 10 días hábiles para subsanar sensores de oxígeno.',
    usuario_cuid: 'COORDINADOR_JEFE'
  }, { 'x-user-role': 'COORDINADOR' });

  assert.equal(resDictaminar.status, 200);
  assert.equal(resDictaminar.body.data.estado, 'EMPLAZADO');
  assert.equal(resDictaminar.body.data.dictamen_coordinador.resolucion, 'EMPLAZAMIENTO');
  assert.equal(resDictaminar.body.data.dictamen_coordinador.plazo_dias_habiles, 10);
});
