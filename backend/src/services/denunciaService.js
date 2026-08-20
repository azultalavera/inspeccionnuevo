/**
 * @file denunciaService.js
 * @description Servicio de Lógica de Negocio para la Gestión de Denuncias Sanitarias (Digitales y Externas)
 * y Acciones del Rol Coordinador de Fiscalización.
 */

const crypto = require('crypto');
const { getModel } = require('../models/ExpedienteDenuncia');
const inspeccionService = require('./inspeccionService');

let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  mongoose = null;
}

// Repositorio en memoria para fallback / testing sin base de datos activa
const denunciaMemoryStore = new Map();
let contadorExpediente = 1;

class DenunciaService {
  constructor() {
    this.ExpedienteModel = getModel();
  }

  _isMongooseReady() {
    return this.ExpedienteModel && mongoose && mongoose.connection && mongoose.connection.readyState === 1;
  }

  /**
   * Generador seguro y libre de colisiones de N° de Expediente (Ej: DEN-2026-00042)
   */
  async generarNumeroExpediente() {
    const anio = new Date().getFullYear();
    let correlativo = 1;

    if (this._isMongooseReady()) {
      const ultima = await this.ExpedienteModel.findOne({
        numero_expediente: new RegExp(`^DEN-${anio}-`)
      }).sort({ createdAt: -1 });

      if (ultima && ultima.numero_expediente) {
        const partes = ultima.numero_expediente.split('-');
        const ultNum = parseInt(partes[2], 10);
        if (!isNaN(ultNum)) correlativo = ultNum + 1;
      }
    } else {
      correlativo = contadorExpediente++;
    }

    const correlativoPad = String(correlativo).padStart(5, '0');
    return `DEN-${anio}-${correlativoPad}`;
  }

  /**
   * 1. CREAR DENUNCIA DIGITAL (Portal Ciudadano / Efector)
   */
  async crearDenuncia(data) {
    const { denunciante, establecimiento_denunciado, motivo_denuncia, descripcion_detallada, adjuntos_evidencia } = data;

    const numeroExpediente = await this.generarNumeroExpediente();

    const adjuntosProcesados = (adjuntos_evidencia || []).map(adj => ({
      url: adj.url,
      tipo: adj.tipo || 'DOCUMENTO',
      hash_sha256: adj.hash_sha256 || crypto.createHash('sha256').update(adj.url + Date.now()).digest('hex')
    }));

    const nuevaDenuncia = {
      id_denuncia: `DEN-ID-${Date.now()}`,
      numero_expediente: numeroExpediente,
      origen_denuncia: 'DIGITAL',
      numero_gde: null,
      denunciante: {
        cuit_cuil: denunciante.cuit_cuil.trim(),
        nombre_completo: denunciante.nombre_completo.trim(),
        correo: denunciante.correo.trim(),
        es_anonima: Boolean(denunciante.es_anonima)
      },
      establecimiento_denunciado: {
        es_registrado: Boolean(establecimiento_denunciado.es_registrado),
        establecimiento_id: establecimiento_denunciado.establecimiento_id || null,
        razon_social_o_nombre: establecimiento_denunciado.razon_social_o_nombre.trim(),
        cuit_titular_presunto: establecimiento_denunciado.cuit_titular_presunto || 'DESCONOCIDO',
        domicilio: establecimiento_denunciado.domicilio,
        tipologia_estimada: establecimiento_denunciado.tipologia_estimada || 'No Especificado'
      },
      motivo_denuncia,
      descripcion_detallada,
      adjuntos_evidencia: adjuntosProcesados,
      estado: 'RECIBIDA',
      resolucion_coordinador: null,
      inspeccion_asociada_id: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let denunciaGuardada;
    if (this._isMongooseReady()) {
      const doc = new this.ExpedienteModel(nuevaDenuncia);
      denunciaGuardada = await doc.save();
    } else {
      denunciaMemoryStore.set(nuevaDenuncia.numero_expediente, nuevaDenuncia);
      denunciaGuardada = nuevaDenuncia;
    }

    // TRIGGER DE INTEGRACIÓN: Prepara la Actuación de Fiscalización por Denuncia
    try {
      const domicilioStr = `${nuevaDenuncia.establecimiento_denunciado.domicilio.calle} ${nuevaDenuncia.establecimiento_denunciado.domicilio.numero || ''}, ${nuevaDenuncia.establecimiento_denunciado.domicilio.localidad}`;
      
      const inspeccionGatillada = await inspeccionService.crearInspeccionDenuncia({
        numero_expediente: nuevaDenuncia.numero_expediente,
        cuit_titular: nuevaDenuncia.establecimiento_denunciado.cuit_titular_presunto || '20-00000000-0',
        direccion_relevada: domicilioStr,
        razon_social_relevada: nuevaDenuncia.establecimiento_denunciado.razon_social_o_nombre,
        inspector_cuid: 'SISTEMA_DISPARADOR_DENUNCIAS',
        hallazgos: [
          {
            servicio: nuevaDenuncia.establecimiento_denunciado.tipologia_estimada,
            descripcion: `Fiscalización derivada de denuncia Expediente N° ${nuevaDenuncia.numero_expediente}. Motivo: ${nuevaDenuncia.motivo_denuncia}`,
            gravedad: 'GRAVE',
            plazo_subsancion_dias: 10
          }
        ]
      });

      denunciaGuardada.inspeccion_asociada_id = inspeccionGatillada.id || inspeccionGatillada._id;
      denunciaGuardada.estado = 'EXPEDIENTE_GENERADO';

      if (this._isMongooseReady() && typeof denunciaGuardada.save === 'function') {
        await denunciaGuardada.save();
      } else {
        denunciaMemoryStore.set(denunciaGuardada.numero_expediente, denunciaGuardada);
      }
    } catch (errTrigger) {
      console.warn('Advertencia al gatillar inspección por denuncia:', errTrigger.message);
    }

    return denunciaGuardada;
  }

  /**
   * 2. CREAR DENUNCIA EXTERNA (Cargada manualmente por agentes vía GDE, Papel, Mail, Oficio Judicial)
   */
  async crearDenunciaExterna(data) {
    const {
      origen_denuncia,
      numero_gde,
      denunciante,
      establecimiento_denunciado,
      motivo_denuncia,
      descripcion_detallada,
      adjuntos_evidencia
    } = data;

    const numeroExpediente = await this.generarNumeroExpediente();

    const nuevaDenunciaExterna = {
      id_denuncia: `DEN-EXT-${Date.now()}`,
      numero_expediente: numeroExpediente,
      origen_denuncia: origen_denuncia || 'GDE',
      numero_gde: numero_gde ? numero_gde.trim() : null,
      denunciante: {
        cuit_cuil: denunciante?.cuit_cuil ? denunciante.cuit_cuil.trim() : '20-00000000-0',
        nombre_completo: denunciante?.nombre_completo ? denunciante.nombre_completo.trim() : 'Mesa de Entrada / Cargo Oficial',
        correo: denunciante?.correo ? denunciante.correo.trim() : 'mesadeentrada@salud.gob.ar',
        es_anonima: Boolean(denunciante?.es_anonima)
      },
      establecimiento_denunciado: {
        es_registrado: Boolean(establecimiento_denunciado.es_registrado),
        establecimiento_id: establecimiento_denunciado.establecimiento_id || null,
        razon_social_o_nombre: establecimiento_denunciado.razon_social_o_nombre.trim(),
        cuit_titular_presunto: establecimiento_denunciado.cuit_titular_presunto || 'DESCONOCIDO',
        domicilio: establecimiento_denunciado.domicilio,
        tipologia_estimada: establecimiento_denunciado.tipologia_estimada || 'No Especificado'
      },
      motivo_denuncia,
      descripcion_detallada,
      adjuntos_evidencia: adjuntos_evidencia || [],
      estado: 'EN_REVISIÓN_ADMINISTRATIVA',
      resolucion_coordinador: null,
      inspeccion_asociada_id: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this._isMongooseReady()) {
      const doc = new this.ExpedienteModel(nuevaDenunciaExterna);
      return await doc.save();
    } else {
      denunciaMemoryStore.set(nuevaDenunciaExterna.numero_expediente, nuevaDenunciaExterna);
      return nuevaDenunciaExterna;
    }
  }

  /**
   * ACCIÓN A: DESESTIMAR / ARCHIVAR DENUNCIA (Coordinador)
   */
  async desestimarDenuncia(idOExpediente, motivoArchivado, usuarioCuid = 'COORDINADOR_MINISTERIO') {
    const denuncia = await this.obtenerPorIdOExpediente(idOExpediente);
    if (!denuncia) {
      throw new Error(`Denuncia no encontrada: ${idOExpediente}`);
    }

    denuncia.estado = 'DESESTIMADA';
    denuncia.resolucion_coordinador = {
      accion: 'DESESTIMAR',
      observacion: motivoArchivado || 'Falta de mérito o desestimación por no corresponder a la jurisdicción sanitaria.',
      fecha: new Date().toISOString(),
      usuario_cuid: usuarioCuid
    };
    denuncia.updatedAt = new Date().toISOString();

    if (this._isMongooseReady() && typeof denuncia.save === 'function') {
      return await denuncia.save();
    } else {
      denunciaMemoryStore.set(denuncia.numero_expediente, denuncia);
      return denuncia;
    }
  }

  /**
   * ACCIÓN B: INTIMAR A TRÁMITE DIRECTO (Coordinador)
   */
  async intimarTramiteDirecto(idOExpediente, observaciones, plazoDias = 15, usuarioCuid = 'COORDINADOR_MINISTERIO') {
    const denuncia = await this.obtenerPorIdOExpediente(idOExpediente);
    if (!denuncia) {
      throw new Error(`Denuncia no encontrada: ${idOExpediente}`);
    }

    denuncia.estado = 'INTIMADA_TRAMITE_DIRECTO';
    denuncia.resolucion_coordinador = {
      accion: 'INTIMAR_TRAMITE_DIRECTO',
      observacion: observaciones || 'Se intima al efector a iniciar trámite digital de adecuación/modificación sin inspección in situ.',
      fecha: new Date().toISOString(),
      usuario_cuid: usuarioCuid,
      plazo_dias: plazoDias
    };
    denuncia.updatedAt = new Date().toISOString();

    if (this._isMongooseReady() && typeof denuncia.save === 'function') {
      return await denuncia.save();
    } else {
      denunciaMemoryStore.set(denuncia.numero_expediente, denuncia);
      return denuncia;
    }
  }

  /**
   * ACCIÓN C: ORDENAR INSPECCIÓN IN SITU (Coordinador)
   */
  async ordenarInspeccion(idOExpediente, dataInspeccion, usuarioCuid = 'COORDINADOR_MINISTERIO') {
    const denuncia = await this.obtenerPorIdOExpediente(idOExpediente);
    if (!denuncia) {
      throw new Error(`Denuncia no encontrada: ${idOExpediente}`);
    }

    const { inspector_cuid, fecha_visita, observaciones } = dataInspeccion;
    const domicilioStr = `${denuncia.establecimiento_denunciado.domicilio.calle} ${denuncia.establecimiento_denunciado.domicilio.numero || ''}, ${denuncia.establecimiento_denunciado.domicilio.localidad}`;

    const inspeccionGatillada = await inspeccionService.crearInspeccionDenuncia({
      numero_expediente: denuncia.numero_expediente,
      cuit_titular: denuncia.establecimiento_denunciado.cuit_titular_presunto || '20-00000000-0',
      direccion_relevada: domicilioStr,
      razon_social_relevada: denuncia.establecimiento_denunciado.razon_social_o_nombre,
      inspector_cuid: inspector_cuid || 'INSPECTOR_FIELD_01',
      fecha_programada: fecha_visita || new Date().toISOString(),
      hallazgos: [
        {
          servicio: denuncia.establecimiento_denunciado.tipologia_estimada || 'Fiscalización Sanitaria',
          descripcion: `Inspección de oficio ordenada por Coordinador (Exp. N° ${denuncia.numero_expediente}). Detalle: ${observaciones || denuncia.descripcion_detallada}`,
          gravedad: 'GRAVE',
          plazo_subsancion_dias: 10
        }
      ]
    });

    denuncia.inspeccion_asociada_id = inspeccionGatillada.id || inspeccionGatillada._id;
    denuncia.estado = 'ASIGNADA_A_INSPECCION';
    denuncia.resolucion_coordinador = {
      accion: 'ORDENAR_INSPECCION',
      observacion: observaciones || 'Inspección in situ despachada a la agenda de terreno del inspector.',
      fecha: new Date().toISOString(),
      usuario_cuid: usuarioCuid,
      inspector_asignado_cuid: inspector_cuid || 'INSPECTOR_FIELD_01'
    };
    denuncia.updatedAt = new Date().toISOString();

    if (this._isMongooseReady() && typeof denuncia.save === 'function') {
      return await denuncia.save();
    } else {
      denunciaMemoryStore.set(denuncia.numero_expediente, denuncia);
      return denuncia;
    }
  }

  /**
   * BANDEJA DE ENTRADA ÚNICA (COORDINADOR)
   * Consolida denuncias Digitales + Externas (GDE/Papel/Mail/Judicial)
   */
  async obtenerTodasBandejaCoordinador() {
    let denuncias = [];

    if (this._isMongooseReady()) {
      denuncias = await this.ExpedienteModel.find().sort({ createdAt: -1 }).lean();
    } else {
      denuncias = Array.from(denunciaMemoryStore.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return denuncias.map(d => this.sanitizarDenuncianteSegunRol(d, 'COORDINADOR'));
  }

  /**
   * BANDEJA DE DENUNCIAS EFECTOR Y JUSTICIA (COORDINADOR)
   * Filtra por origen de denuncia Efector (DIGITAL) y Justicia (JUDICIAL, JUSTICIA, EFECTOR)
   */
  async obtenerDenunciasEfectorJusticia() {
    let denuncias = [];
    const origenesFiltro = ['EFECTOR', 'JUSTICIA', 'DIGITAL', 'JUDICIAL'];

    if (this._isMongooseReady()) {
      denuncias = await this.ExpedienteModel.find({ origen_denuncia: { $in: origenesFiltro } }).sort({ createdAt: -1 }).lean();
    } else {
      denuncias = Array.from(denunciaMemoryStore.values())
        .filter(d => origenesFiltro.includes(d.origen_denuncia))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return denuncias.map(d => this.sanitizarDenuncianteSegunRol(d, 'COORDINADOR'));
  }

  /**
   * MIS DENUNCIAS (EFECTOR / CIUDADANO)
   */
  async obtenerDenunciasPorDenunciante(cuitCuil) {
    const cuitLimpio = cuitCuil.trim();
    let denuncias = [];

    if (this._isMongooseReady()) {
      denuncias = await this.ExpedienteModel.find({ 'denunciante.cuit_cuil': cuitLimpio }).lean();
    } else {
      for (const item of denunciaMemoryStore.values()) {
        if (item.denunciante.cuit_cuil === cuitLimpio) {
          denuncias.push(item);
        }
      }
    }

    return denuncias.map(d => this.sanitizarDenuncianteSegunRol(d, 'EFECTOR'));
  }

  /**
   * BANDEJA DE DENUNCIAS PENDIENTES ADMIN (Compatibilidad retrocompatible)
   */
  async obtenerDenunciasPendientesAdmin() {
    let denuncias = [];

    if (this._isMongooseReady()) {
      denuncias = await this.ExpedienteModel.find({
        estado: { $in: ['RECIBIDA', 'EN_REVISIÓN_ADMINISTRATIVA', 'EXPEDIENTE_GENERADO'] }
      }).sort({ createdAt: -1 }).lean();
    } else {
      for (const item of denunciaMemoryStore.values()) {
        if (['RECIBIDA', 'EN_REVISIÓN_ADMINISTRATIVA', 'EXPEDIENTE_GENERADO'].includes(item.estado)) {
          denuncias.push(item);
        }
      }
    }

    return denuncias.map(d => this.sanitizarDenuncianteSegunRol(d, 'ADMIN_MINISTERIO'));
  }

  /**
   * Helper para buscar por ID o N° de Expediente
   */
  async obtenerPorIdOExpediente(idOExpediente) {
    if (this._isMongooseReady()) {
      return await this.ExpedienteModel.findOne({
        $or: [{ numero_expediente: idOExpediente }, { id_denuncia: idOExpediente }, { _id: idOExpediente }]
      });
    } else {
      return (
        denunciaMemoryStore.get(idOExpediente) ||
        Array.from(denunciaMemoryStore.values()).find(
          d => d.id_denuncia === idOExpediente || d.numero_expediente === idOExpediente
        ) ||
        null
      );
    }
  }

  /**
   * Helper para sanitizar y enmascarar datos personales si la denuncia es anónima
   */
  sanitizarDenuncianteSegunRol(denuncia, rolSolicitante = 'EFECTOR') {
    if (!denuncia) return null;
    const copia = JSON.parse(JSON.stringify(denuncia));

    if (copia.denunciante && copia.denunciante.es_anonima && rolSolicitante !== 'COORDINADOR' && rolSolicitante !== 'ADMIN_MINISTERIO') {
      copia.denunciante = {
        cuit_cuil: 'RESERVADO_ANONIMO',
        nombre_completo: 'Denunciante Anónimo (Identidad Resguardada Ley 25.326)',
        correo: 'anonimo@resguardado.gob.ar',
        es_anonima: true
      };
    }
    return copia;
  }
}

module.exports = new DenunciaService();
