/**
 * @file inspeccionService.js
 * @description Servicio de Lógica de Negocio para Inspecciones de Oficio, Panel de Alertas de Rutina,
 * Bandeja de Campo del Inspector con Enmascaramiento y Bandeja de Dictamen del Coordinador.
 */

const { getModel, calcularHashActa } = require('../models/ActuacionSanitaria');
let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  mongoose = null;
}

// Repositorio en memoria para fallback / testing sin base de datos activa
const memoryStore = new Map();

// Periodicidades por tipología (en meses) para el Motor de Alertas de Rutina
const PERIODICIDAD_TIPOLOGIAS_MESES = {
  'CLÍNICA, SANATORIO U HOSPITAL PRIVADO': 12,
  'ESTABLECIMIENTOS GERIÁTRICOS': 4,
  'CENTRO CIRUGÍA AMBULATORIA': 6,
  'CENTRO DE ESTÉTICA CORPORAL': 6,
  'LABORATORIO DE ANÁLISIS CLINICOS': 12,
  'UNIDAD O SERVICIO DE DIÁLISIS': 6,
  'CONSULTORIO': 24,
  'TATUADORES Y PERFORADORES': 12,
  'DEFAULT': 12
};

// Padron Mock de Establecimientos para el Motor de Alertas de Rutina
const PADRON_ESTABLECIMIENTOS_MOCK = [
  {
    id: 'EST-HAB-9901',
    razon_social: 'Clínica San Martín',
    cuit: '30-11223344-9',
    tipologia: 'CLÍNICA, SANATORIO U HOSPITAL PRIVADO',
    domicilio: 'Av. Colón 1234, Córdoba',
    fecha_ultima_inspeccion: '2025-05-10T10:00:00.000Z' // Vencida o por vencer
  },
  {
    id: 'EST-HAB-9902',
    razon_social: 'Residencia Sol de Otoño',
    cuit: '30-44556677-8',
    tipologia: 'ESTABLECIMIENTOS GERIÁTRICOS',
    domicilio: 'Calle Independencia 540, Córdoba',
    fecha_ultima_inspeccion: '2026-02-15T09:00:00.000Z' // Geriátrico (periodicidad 4 meses, por vencer)
  },
  {
    id: 'EST-HAB-9903',
    razon_social: 'Centro Médico Nueva Córdoba',
    cuit: '30-88776655-4',
    tipologia: 'CONSULTORIO',
    domicilio: 'Calle Rondeau 220, Córdoba',
    fecha_ultima_inspeccion: '2025-11-20T14:30:00.000Z'
  }
];

class InspeccionService {
  constructor() {
    this.ActuacionModel = getModel();
  }

  _isMongooseReady() {
    return this.ActuacionModel && mongoose && mongoose.connection && mongoose.connection.readyState === 1;
  }

  /**
   * 1. PANEL DE ALERTAS Y VENCIMIENTOS (MOTOR DE CÁLCULO DE RUTINA PARA COORDINADOR)
   */
  async obtenerAlertasYVencimientosRutina() {
    const ahora = new Date();

    const alertas = PADRON_ESTABLECIMIENTOS_MOCK.map((est) => {
      const mesesIntervalo = PERIODICIDAD_TIPOLOGIAS_MESES[est.tipologia] || PERIODICIDAD_TIPOLOGIAS_MESES['DEFAULT'];
      const fechaUltima = new Date(est.fecha_ultima_inspeccion);

      const fechaProximoVencimiento = new Date(fechaUltima);
      fechaProximoVencimiento.setMonth(fechaProximoVencimiento.getMonth() + mesesIntervalo);

      const diffTime = fechaProximoVencimiento.getTime() - ahora.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let estadoAlerta = 'VIGENTE';
      let urgencia = 'NORMAL';

      if (diasRestantes <= 0) {
        estadoAlerta = 'VENCIDO';
        urgencia = 'ALTISIMA';
      } else if (diasRestantes <= 15) {
        estadoAlerta = 'CRITICO';
        urgencia = 'ALTA';
      } else if (diasRestantes <= 30) {
        estadoAlerta = 'PREVENTIVO';
        urgencia = 'MEDIA';
      }

      return {
        establecimiento_id: est.id,
        razon_social: est.razon_social,
        cuit_titular: est.cuit,
        tipologia: est.tipologia,
        domicilio: est.domicilio,
        periodicidad_meses: mesesIntervalo,
        fecha_ultima_inspeccion: est.fecha_ultima_inspeccion,
        fecha_proximo_vencimiento: fechaProximoVencimiento.toISOString(),
        dias_restantes: diasRestantes,
        estado_alerta: estadoAlerta,
        urgencia
      };
    });

    return alertas.sort((a, b) => a.dias_restantes - b.dias_restantes);
  }

  /**
   * PROGRAMAR INSPECCIÓN DE RUTINA (COORDINADOR)
   */
  async programarInspeccionRutina(data) {
    const { cuit_titular, establecimiento_id, direccion_relevada, razon_social_relevada, inspector_cuid, fecha_programada } = data;

    const nuevaActuacion = {
      id: `INSP-RUT-${Date.now()}`,
      tipo_origen: 'RUTINA',
      numero_expediente: `EX-RUT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      cuit_titular: cuit_titular.trim(),
      establecimiento_id: establecimiento_id ? establecimiento_id.trim() : 'EST-HAB-GENERAL',
      direccion_relevada: direccion_relevada || 'Domicilio Declarado en Padrón Activo',
      razon_social_relevada: razon_social_relevada || 'Establecimiento Habilitado',
      inspector_asignado_cuid: inspector_cuid || 'INSPECTOR_FIELD_01',
      fecha_programada: fecha_programada || new Date().toISOString(),
      caratula_enmascarada: 'Fiscalización Sanitaria de Rutina / Control Periódico',
      estado: 'PROGRAMADA',
      hallazgos: [],
      firmas: null,
      dictamen_coordinador: null,
      acta_pdf_hash: null,
      es_latente: false,
      historial_estados: [
        {
          estado_previo: 'BORRADOR',
          estado_nuevo: 'PROGRAMADA',
          usuario_cuid: 'COORDINADOR_MINISTERIO',
          fecha: new Date().toISOString(),
          observacion: 'Programación de inspección periódica de rutina por alerta de vencimiento.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this._isMongooseReady()) {
      const doc = new this.ActuacionModel(nuevaActuacion);
      return await doc.save();
    } else {
      memoryStore.set(nuevaActuacion.id, nuevaActuacion);
      return nuevaActuacion;
    }
  }

  /**
   * 2. BANDEJA DE CAMPO DEL INSPECTOR (TABLET / APP TERRENO)
   * Aplica la REGLA DE ENMASCARAMIENTO para Inspecciones por Denuncia.
   */
  async obtenerAgendaInspector(inspectorCuid = null) {
    let lista = [];

    if (this._isMongooseReady()) {
      const query = inspectorCuid ? { inspector_asignado_cuid: inspectorCuid } : {};
      lista = await this.ActuacionModel.find(query).lean();
    } else {
      for (const item of memoryStore.values()) {
        if (!inspectorCuid || item.inspector_asignado_cuid === inspectorCuid || item.inspector_cuid === inspectorCuid) {
          lista.push(item);
        }
      }
    }

    // Regla de Enmascaramiento para la tablet:
    return lista.map((acta) => {
      const copia = JSON.parse(JSON.stringify(acta));
      if (copia.tipo_origen === 'DENUNCIA') {
        copia.caratula_terreno = 'Fiscalización Sanitaria / Control de Habilitación';
        copia.denunciante_info = 'DATOS_RESERVADOS_RESGUARDO_LEY_25326';
        copia.motivo_sensible_oculto = true;
      } else {
        copia.caratula_terreno = `Inspección de ${copia.tipo_origen}`;
        copia.motivo_sensible_oculto = false;
      }
      return copia;
    });
  }

  /**
   * 3. BANDEJA DE DICTAMEN Y RESOLUCIÓN (COORDINADOR)
   * Muestra las actas en estado ACTA_CERRADA o EMPLAZADO para la aplicación de dictamen administrativo.
   */
  async obtenerBandejaDictamenCoordinador() {
    let lista = [];

    if (this._isMongooseReady()) {
      lista = await this.ActuacionModel.find({
        estado: { $in: ['ACTA_CERRADA', 'EMPLAZADO', 'DICTAMINADO'] }
      }).sort({ updatedAt: -1 }).lean();
    } else {
      for (const item of memoryStore.values()) {
        if (['ACTA_CERRADA', 'EMPLAZADO', 'DICTAMINADO'].includes(item.estado)) {
          lista.push(item);
        }
      }
    }

    return lista;
  }

  /**
   * APLICAR DICTAMEN ADMINISTRATIVO Y RESOLUCIÓN (COORDINADOR)
   * Resoluciones permitidas: 'APROBADO', 'EMPLAZAMIENTO', 'SUMARIO', 'CLAUSURA'
   */
  async aplicarDictamenCoordinador(id, payloadDictamen) {
    const { resolucion, plazo_dias_habiles, observacion, usuario_cuid } = payloadDictamen;

    const acta = await this.obtenerPorId(id);
    if (!acta) {
      throw new Error(`Actuación no encontrada con ID: ${id}`);
    }

    let nuevoEstado = 'DICTAMINADO';
    if (resolucion === 'APROBADO') nuevoEstado = 'FINALIZADO';
    else if (resolucion === 'EMPLAZAMIENTO') nuevoEstado = 'EMPLAZADO';
    else if (resolucion === 'SUMARIO') nuevoEstado = 'EN_SUMARIO';
    else if (resolucion === 'CLAUSURA') nuevoEstado = 'CLAUSURADO';

    const estructuraDictamen = {
      resolucion,
      plazo_dias_habiles: plazo_dias_habiles || null,
      observacion: observacion || `Dictamen dictaminado: ${resolucion}`,
      fecha_dictamen: new Date().toISOString(),
      usuario_coordinador_cuid: usuario_cuid || 'COORDINADOR_MINISTERIO'
    };

    const estadoPrevio = acta.estado;
    acta.estado = nuevoEstado;
    acta.dictamen_coordinador = estructuraDictamen;

    const entradaHistorial = {
      estado_previo: estadoPrevio,
      estado_nuevo: nuevoEstado,
      usuario_cuid: usuario_cuid || 'COORDINADOR_MINISTERIO',
      fecha: new Date().toISOString(),
      observacion: `Dictamen Administrativo Emitido: ${resolucion}. ${observacion || ''}`
    };

    if (!acta.historial_estados) acta.historial_estados = [];
    acta.historial_estados.push(entradaHistorial);
    acta.updatedAt = new Date().toISOString();

    if (this._isMongooseReady() && typeof acta.save === 'function') {
      return await acta.save();
    } else {
      memoryStore.set(acta.id || acta._id, acta);
      return acta;
    }
  }

  /**
   * INICIAR INSPECCIÓN DE OFICIO: RUTINA
   */
  async crearInspeccionRutina(data) {
    const { cuit_titular, establecimiento_id, direccion_relevada, razon_social_relevada, inspector_cuid } = data;

    const nuevaActuacion = {
      id: `INSP-RUT-${Date.now()}`,
      tipo_origen: 'RUTINA',
      numero_expediente: `EX-RUT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      cuit_titular: cuit_titular.trim(),
      establecimiento_id: establecimiento_id.trim(),
      direccion_relevada: direccion_relevada || 'Domicilio Declarado en Padrón Activo',
      razon_social_relevada: razon_social_relevada || 'Establecimiento Habilitado',
      inspector_asignado_cuid: inspector_cuid || 'INSPECTOR_SISTEMA',
      estado: 'EN_TERRENO',
      hallazgos: [],
      firmas: null,
      dictamen_coordinador: null,
      acta_pdf_hash: null,
      es_latente: false,
      historial_estados: [
        {
          estado_previo: 'BORRADOR',
          estado_nuevo: 'EN_TERRENO',
          usuario_cuid: inspector_cuid || 'INSPECTOR_SISTEMA',
          fecha: new Date().toISOString(),
          observacion: 'Inicio de operativo de inspección de rutina en terreno'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this._isMongooseReady()) {
      const doc = new this.ActuacionModel(nuevaActuacion);
      return await doc.save();
    } else {
      memoryStore.set(nuevaActuacion.id, nuevaActuacion);
      return nuevaActuacion;
    }
  }

  /**
   * INICIAR INSPECCIÓN DE OFICIO: DENUNCIA / CLANDESTINO
   */
  async crearInspeccionDenuncia(data) {
    const { numero_expediente, cuit_titular, direccion_relevada, razon_social_relevada, inspector_cuid, fecha_programada, hallazgos } = data;

    if (!numero_expediente) {
      throw new Error('REGLA DE NEGOCIO: N° de Expediente es requerido obligatoriamente para denuncias/clandestinidad.');
    }

    const nuevaActuacion = {
      id: `INSP-DEN-${Date.now()}`,
      tipo_origen: 'DENUNCIA',
      numero_expediente: numero_expediente.trim(),
      cuit_titular: cuit_titular.trim(),
      establecimiento_id: null,
      direccion_relevada: direccion_relevada || 'Dirección Relevada en Terreno',
      razon_social_relevada: razon_social_relevada || 'Establecimiento No Registrado',
      inspector_asignado_cuid: inspector_cuid || 'INSPECTOR_SISTEMA',
      fecha_programada: fecha_programada || new Date().toISOString(),
      caratula_enmascarada: 'Fiscalización Sanitaria / Control de Habilitación',
      estado: 'EN_TERRENO',
      hallazgos: hallazgos || [],
      firmas: null,
      dictamen_coordinador: null,
      acta_pdf_hash: null,
      es_latente: true,
      historial_estados: [
        {
          estado_previo: 'BORRADOR',
          estado_nuevo: 'EN_TERRENO',
          usuario_cuid: inspector_cuid || 'INSPECTOR_SISTEMA',
          fecha: new Date().toISOString(),
          observacion: `Inicio de inspección por denuncia bajo Expediente N° ${numero_expediente}`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this._isMongooseReady()) {
      const doc = new this.ActuacionModel(nuevaActuacion);
      return await doc.save();
    } else {
      memoryStore.set(nuevaActuacion.id, nuevaActuacion);
      return nuevaActuacion;
    }
  }

  /**
   * CERRAR ACTA IN SITU (INSPECTOR)
   */
  async cerrarActa(id, payloadCierre) {
    const { inspector_cuid, responsable_cuid, motivo_negativa, firmado_cidi, hallazgos, observaciones } = payloadCierre;

    const acta = await this.obtenerPorId(id);
    if (!acta) {
      throw new Error(`Actuación no encontrada con ID: ${id}`);
    }

    if (['ACTA_CERRADA', 'EMPLAZADO', 'DICTAMINADO', 'HANDOFF_EFECTOR', 'FINALIZADO', 'EN_SUMARIO', 'CLAUSURADO'].includes(acta.estado)) {
      throw new Error(`INMUTABILIDAD: El acta ${id} ya fue cerrada previamente y no se puede re-cerrar.`);
    }

    const tieneIrregularidades = (hallazgos && hallazgos.length > 0) || (acta.hallazgos && acta.hallazgos.length > 0);
    const nuevoEstado = tieneIrregularidades ? 'EMPLAZADO' : 'ACTA_CERRADA';

    const estructuraFirmas = {
      inspector_cuid: inspector_cuid || 'INSP-OPERATIVO-01',
      responsable_cuid: responsable_cuid || null,
      fecha: new Date().toISOString(),
      firmado_cidi: Boolean(firmado_cidi),
      motivo_negativa: motivo_negativa || null
    };

    if (hallazgos) {
      acta.hallazgos = hallazgos;
    }

    acta.firmas = estructuraFirmas;
    acta.fecha_cierre = new Date().toISOString();
    acta.acta_pdf_hash = calcularHashActa(acta);

    const estadoPrevio = acta.estado;
    acta.estado = nuevoEstado;

    const entradaHistorial = {
      estado_previo: estadoPrevio,
      estado_nuevo: nuevoEstado,
      usuario_cuid: inspector_cuid || 'INSPECT-SYS',
      fecha: new Date().toISOString(),
      observacion: observaciones || (motivo_negativa ? `Cierre con refuso de firma: ${motivo_negativa}` : 'Cierre de acta in situ exitoso')
    };

    if (!acta.historial_estados) acta.historial_estados = [];
    acta.historial_estados.push(entradaHistorial);
    acta.updatedAt = new Date().toISOString();

    if (this._isMongooseReady() && typeof acta.save === 'function') {
      return await acta.save();
    } else {
      memoryStore.set(acta.id || acta._id, acta);
      return acta;
    }
  }

  /**
   * HAND-OFF A HABILITACIÓN / ENMIENDA (Traspaso al Efector)
   */
  async handoffHabilitacion(id, usuarioCuid = 'COORDINADOR_INSP') {
    const acta = await this.obtenerPorId(id);
    if (!acta) {
      throw new Error(`Actuación no encontrada con ID: ${id}`);
    }

    if (!['ACTA_CERRADA', 'EMPLAZADO', 'DICTAMINADO'].includes(acta.estado)) {
      throw new Error(`El acta debe estar en estado 'ACTA_CERRADA' o 'EMPLAZADO' para realizar el Hand-off a Habilitación. Estado actual: ${acta.estado}`);
    }

    const estadoPrevio = acta.estado;
    acta.estado = 'HANDOFF_EFECTOR';

    const entradaHistorial = {
      estado_previo: estadoPrevio,
      estado_nuevo: 'HANDOFF_EFECTOR',
      usuario_cuid: usuarioCuid,
      fecha: new Date().toISOString(),
      observacion: 'Hand-off a Habilitación/Enmienda completado. Actuación derivada a bandeja del Efector para subsanación.'
    };

    if (!acta.historial_estados) acta.historial_estados = [];
    acta.historial_estados.push(entradaHistorial);
    acta.updatedAt = new Date().toISOString();

    if (this._isMongooseReady() && typeof acta.save === 'function') {
      return await acta.save();
    } else {
      memoryStore.set(acta.id || acta._id, acta);
      return acta;
    }
  }

  /**
   * HOOK DE LOGIN / LOGIN ANTECEDENTES EFECTOR
   */
  async obtenerAntecedentesEfector(cuit, establecimientoIdActual = null) {
    const cuitLimpio = cuit.trim();
    let listaActas = [];

    if (this._isMongooseReady()) {
      listaActas = await this.ActuacionModel.find({ cuit_titular: cuitLimpio }).lean();
    } else {
      for (const item of memoryStore.values()) {
        if (item.cuit_titular === cuitLimpio) {
          listaActas.push(item);
        }
      }
    }

    const actasLatentes = listaActas.filter(a => a.es_latente || !a.establecimiento_id);
    if (actasLatentes.length > 0 && establecimientoIdActual) {
      for (const act of actasLatentes) {
        act.establecimiento_id = establecimientoIdActual;
        act.es_latente = false;
        act.updatedAt = new Date().toISOString();
        if (this._isMongooseReady()) {
          await this.ActuacionModel.updateOne(
            { _id: act._id || act.id },
            { $set: { establecimiento_id: establecimientoIdActual, es_latente: false } }
          );
        } else {
          memoryStore.set(act.id || act._id, act);
        }
      }
    }

    return {
      cuit: cuitLimpio,
      total_actuaciones: listaActas.length,
      actas_latentes_vinculadas: actasLatentes.length,
      actuaciones: listaActas
    };
  }

  /**
   * Helper para obtener actuación por ID
   */
  async obtenerPorId(id) {
    if (this._isMongooseReady()) {
      return await this.ActuacionModel.findOne({ $or: [{ _id: id }, { id: id }] });
    } else {
      return (
        memoryStore.get(id) ||
        Array.from(memoryStore.values()).find(a => a.id === id || String(a._id) === String(id)) ||
        null
      );
    }
  }
}

module.exports = new InspeccionService();
