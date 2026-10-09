import React, { useState, useEffect, useMemo } from "react";
import { type Tramite, type EstadoTramite, USUARIOS } from "../data/mockData";

interface ModalNuevoEstablecimientoRutinaProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (nuevo: Tramite) => void;
  inspectorLogueado?: string;
  listaInspectoresDisponibles?: string[];
}

export const TIPOLOGIAS_SALUD = [
  "CLÍNICA, SANATORIO U HOSPITAL PRIVADO",
  "CENTRO MÉDICO CON INTERNACIÓN",
  "CENTRO DE SALUD AMBULATORIA",
  "CENTRO DE CIRUGÍA AMBULATORIA",
  "ESTABLECIMIENTOS GERIÁTRICOS / RESIDENCIA",
  "LABORATORIO DE ANÁLISIS CLÍNICOS",
  "CENTRO DE DIAGNÓSTICO POR IMÁGENES",
  "RADIOFÍSICA SANITARIA",
  "FARMACIA / VACUNATORIO",
  "CONSULTORIOS ODONTOLÓGICOS",
  "OTRO ESTABLECIMIENTO DE SALUD",
];

export const DEPARTAMENTOS_CORDOBA = [
  "Capital",
  "Colón",
  "Punilla",
  "Río Cuarto",
  "San Justo",
  "General San Martín",
  "Santa María",
  "Tercero Arriba",
  "Unión",
  "Marcos Juárez",
  "Calamuchita",
  "Cruz del Eje",
  "Ischilín",
  "Juárez Celman",
  "Río Segundo",
  "San Javier",
];

const generarNroTramiteAuto = () =>
  `2026-RUT-${Math.floor(10000 + Math.random() * 90000)}`;

const generarNroExpedienteAuto = () =>
  `EX-2026-${Math.floor(10000000 + Math.random() * 90000000)}- -GDEBA-MSGP`;

const generarCuilAuto = () =>
  `30-${Math.floor(10000000 + Math.random() * 90000000)}-${Math.floor(1 + Math.random() * 9)}`;

/**
 * Calcula automáticamente el plazo de rutina.
 * Para geriátricos: se compara exclusivamente con la Fecha de Habilitación (3 inspecciones al año / cuatrimestral).
 * Para demás establecimientos: se compara con la Fecha de Última Inspección (ciclo anual de 1 año).
 */
export const calcularPlazoRutina = (
  fechaStr: string,
  sinFecha: boolean = false,
  isGeriatrico: boolean = false
) => {
  if (sinFecha || !fechaStr || fechaStr.trim() === "") {
    return {
      alertaRutina: "SIN_FECHA" as const,
      diasRestantes: 0,
      fechaVencimientoStr: "Sin fecha registrada",
      label: "SIN FECHA HABILITACIÓN",
      color: "#475569",
      bg: "#F1F5F9",
      border: "#CBD5E1",
      icon: "event_busy",
      descripcion: isGeriatrico
        ? "Establecimiento geriátrico sin fecha de habilitación registrada."
        : "Establecimiento sin fecha de habilitación / última inspección previa registrada.",
    };
  }

  const parts = fechaStr.split("-");
  const anio = parseInt(parts[0], 10);
  const mes = parseInt(parts[1], 10) - 1;
  const dia = parseInt(parts[2], 10);
  const fechaBase = new Date(anio, mes, dia);

  // Vencimiento periódico de rutina:
  // Para geriátricos únicamente, la fecha con la que compara es la de habilitación (ciclo cuatrimestral para 3 inspecciones anuales)
  // Para demás establecimientos: 1 año después de la última inspección
  let fechaVenc = new Date(fechaBase);
  if (isGeriatrico) {
    fechaVenc.setMonth(fechaVenc.getMonth() + 4);
  } else {
    fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaVenc.setHours(0, 0, 0, 0);

  const diffTime = fechaVenc.getTime() - hoy.getTime();
  const diasRestantes = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const vParts = [
    String(fechaVenc.getDate()).padStart(2, "0"),
    String(fechaVenc.getMonth() + 1).padStart(2, "0"),
    fechaVenc.getFullYear(),
  ];
  const fechaVencimientoStr = `${vParts[0]}/${vParts[1]}/${vParts[2]}`;

  const contextoStr = isGeriatrico
    ? "comparado con Fecha de Habilitación"
    : "comparado con Última Inspección";

  if (diasRestantes <= 0) {
    const diasVencido = Math.abs(diasRestantes);
    return {
      alertaRutina: "CRITICO_VENCIDO" as const,
      diasRestantes,
      fechaVencimientoStr,
      label: "VENCIDO (Asignado)",
      color: "#DC2626",
      bg: "#FEE2E2",
      border: "#FCA5A5",
      icon: "error_outline",
      descripcion:
        diasVencido === 0
          ? `El ciclo de rutina vence hoy (${contextoStr}).`
          : `El ciclo de rutina venció hace ${diasVencido} día${diasVencido > 1 ? "s" : ""} (${contextoStr}).`,
    };
  }

  if (diasRestantes <= 15) {
    return {
      alertaRutina: "ALERTA_T15" as const,
      diasRestantes,
      fechaVencimientoStr,
      label: "PRÓXIMOS (< 15 días)",
      color: "#B45309",
      bg: "#FEF3C7",
      border: "#FCD34D",
      icon: "warning_amber",
      descripcion: `Vence en ${diasRestantes} día${diasRestantes > 1 ? "s" : ""} (${contextoStr}).`,
    };
  }

  if (diasRestantes <= 30) {
    return {
      alertaRutina: "ALERTA_T30" as const,
      diasRestantes,
      fechaVencimientoStr,
      label: "EN PLAZO (< 30 días)",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      border: "#93C5FD",
      icon: "schedule",
      descripcion: `Vence en ${diasRestantes} día${diasRestantes > 1 ? "s" : ""} (${contextoStr}).`,
    };
  }

  return {
    alertaRutina: "AL_DIA" as const,
    diasRestantes,
    fechaVencimientoStr,
    label: "AL DÍA (> 30 días)",
    color: "#15803D",
    bg: "#DCFCE7",
    border: "#86EFAC",
    icon: "check_circle",
    descripcion: `Vence en ${diasRestantes} días (${contextoStr}).`,
  };
};

export default function ModalNuevoEstablecimientoRutina({
  isOpen,
  onClose,
  onGuardar,
  inspectorLogueado,
  listaInspectoresDisponibles,
}: ModalNuevoEstablecimientoRutinaProps) {
  // Lista de inspectores disponibles
  const inspectores =
    listaInspectoresDisponibles && listaInspectoresDisponibles.length > 0
      ? listaInspectoresDisponibles
      : USUARIOS.filter((u) => u.rol === "INSPECTOR").map(
          (u) => `${u.nombre} ${u.apellido}`,
        );

  const defaultInspector =
    inspectorLogueado ||
    inspectores[0] ||
    "Lic. Martín Gómez";

  // Fecha sugerida por defecto: hace 3 meses
  const fechaDefecto = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().split("T")[0];
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    denominacion: "",
    cuit: generarCuilAuto(),
    tipologia: TIPOLOGIAS_SALUD[0],
    domicilio: "",
    departamento: "Capital",
    localidad: "Córdoba",
    fechaUltimaInspeccion: fechaDefecto,
    directorTecnico: "",
    telefono: "",
    email: "",
    // Auto-generados
    nroTramite: generarNroTramiteAuto(),
    nroExpediente: generarNroExpedienteAuto(),
    inspectorAsignado: "",
  });

  // Checkbox para permitir cargar sin fecha de habilitación
  const [sinFechaHabilitacion, setSinFechaHabilitacion] = useState(false);

  const [errores, setErrores] = useState<{ denominacion?: string; cuit?: string }>({});

  // Reset y regeneración al abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        denominacion: "",
        cuit: generarCuilAuto(),
        tipologia: TIPOLOGIAS_SALUD[0],
        domicilio: "",
        departamento: "Capital",
        localidad: "Córdoba",
        fechaUltimaInspeccion: fechaDefecto,
        directorTecnico: "",
        telefono: "",
        email: "",
        nroTramite: generarNroTramiteAuto(),
        nroExpediente: generarNroExpedienteAuto(),
        inspectorAsignado: "",
      });
      setSinFechaHabilitacion(false);
      setErrores({});
    }
  }, [isOpen, defaultInspector, fechaDefecto]);

  const isGeriatrico = useMemo(() => {
    const tip = (formData.tipologia || "").toLowerCase();
    const den = (formData.denominacion || "").toLowerCase();
    return (
      tip.includes("geriátrico") ||
      tip.includes("geriatrico") ||
      tip.includes("residencia") ||
      den.includes("geriátrico") ||
      den.includes("geriatrico") ||
      den.includes("residencia")
    );
  }, [formData.tipologia, formData.denominacion]);

  // Cálculo en vivo del plazo a partir de la fecha seleccionada o si es sin fecha
  const plazoCalculado = useMemo(() => {
    return calcularPlazoRutina(
      formData.fechaUltimaInspeccion,
      sinFechaHabilitacion,
      isGeriatrico
    );
  }, [formData.fechaUltimaInspeccion, sinFechaHabilitacion, isGeriatrico]);

  if (!isOpen) return null;

  const handleRegenerarCodigos = () => {
    setFormData((prev) => ({
      ...prev,
      nroTramite: generarNroTramiteAuto(),
      nroExpediente: generarNroExpedienteAuto(),
      cuit: generarCuilAuto(),
    }));
  };

  // Atajos rápidos para probar fechas de las categorías
  const aplicarAtajoDias = (diasAtras: number) => {
    setSinFechaHabilitacion(false);
    let diasEfectivos = diasAtras;
    if (isGeriatrico) {
      // Para geriátricos, la fecha con la que compara es la de habilitación (ciclo cuatrimestral de 120 días)
      if (diasAtras === 420) diasEfectivos = 140; // Vencido
      else if (diasAtras === 355) diasEfectivos = 110; // < 15 días
      else if (diasAtras === 342) diasEfectivos = 95; // < 30 días
      else if (diasAtras === 90) diasEfectivos = 30; // > 30 días
    }
    const d = new Date();
    d.setDate(d.getDate() - diasEfectivos);
    const str = d.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, fechaUltimaInspeccion: str }));
  };

  const aplicarAtajoSinFecha = () => {
    setSinFechaHabilitacion(true);
    setFormData((prev) => ({ ...prev, fechaUltimaInspeccion: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevosErrores: { denominacion?: string; cuit?: string } = {};
    if (!formData.denominacion.trim()) {
      nuevosErrores.denominacion = "La denominación / razón social es obligatoria";
    }

    const cuitFinal = formData.cuit.trim() || generarCuilAuto();

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const sinFecha =
      sinFechaHabilitacion ||
      !formData.fechaUltimaInspeccion ||
      formData.fechaUltimaInspeccion.trim() === "";

    // Formateo de fecha DD/MM/AAAA si tiene fecha
    let fechaFinal = "";
    if (!sinFecha) {
      const fParts = formData.fechaUltimaInspeccion.split("-");
      fechaFinal =
        fParts.length === 3 ? `${fParts[2]}/${fParts[1]}/${fParts[0]}` : formData.fechaUltimaInspeccion;
    }

    const isGer =
      formData.tipologia?.toLowerCase().includes("geriátrico") ||
      formData.tipologia?.toLowerCase().includes("geriatrico") ||
      formData.tipologia?.toLowerCase().includes("residencia") ||
      formData.denominacion?.toLowerCase().includes("geriátrico") ||
      formData.denominacion?.toLowerCase().includes("geriatrico") ||
      formData.denominacion?.toLowerCase().includes("residencia");

    const nuevoTramite: Tramite = {
      id: `TRM-RUT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      nroTramite: sinFecha ? "" : formData.nroTramite,
      nroExpediente: formData.nroExpediente,
      denominacion: formData.denominacion.trim(),
      cuit: cuitFinal,
      tipologia: formData.tipologia,
      domicilio: formData.domicilio.trim() || "Av. Colón 1200",
      localidad: formData.localidad.trim() || "Córdoba",
      departamento: formData.departamento.trim() || "Capital",
      // Estado fijado a FINALIZADO según requerimiento
      estado: "FINALIZADO" as EstadoTramite,
      fechaIngreso: new Date().toISOString().split("T")[0],
      fechaUltimaInspeccion: fechaFinal,
      fechaHabilitacion: isGer ? fechaFinal : undefined,
      inspectorAsignado: "",
      inspectoresAsignados: [],
      agenteAsignado: "",
      ordenEmitida: false,
      tipoInspeccion: "RUTINA",
      formatoInspeccion: "PRESENCIAL",
      // Plazo calculado automáticamente (o SIN_FECHA si no tiene fecha de habilitación)
      alertaRutina: plazoCalculado.alertaRutina,
      nroActa: Math.floor(10 + Math.random() * 90),
      frecuenciaRutinaAnual: isGer ? 3 : 1,
      inspeccionesRealizadasAno: isGer ? 1 : undefined,
    };

    onGuardar(nuevoTramite);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          maxWidth: 780,
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #CBD5E1",
          overflow: "hidden",
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            background: "linear-gradient(135deg, #004B87 0%, #003366 100%)",
            color: "#FFFFFF",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="material-icons" style={{ fontSize: 26, color: "#FFFFFF" }}>
                add_business
              </span>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.2px" }}>
                Registrar Establecimiento Habilitado
              </div>
              <div style={{ fontSize: 12.5, color: "#BAE6FD", marginTop: 2 }}>
                Inspección Periódica por Rutina — CUIT automático, trámite finalizado y opción sin fecha
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              border: "none",
              color: "#FFFFFF",
              borderRadius: "50%",
              width: 34,
              height: 34,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            <span className="material-icons" style={{ fontSize: 20 }}>
              close
            </span>
          </button>
        </div>

        {/* Form Body con Scroll */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* 1. SECCIÓN: DATOS GENERADOS AUTOMÁTICAMENTE */}
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 12,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="material-icons"
                  style={{ fontSize: 18, color: "#16A34A" }}
                >
                  auto_awesome
                </span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: "#166534",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Generado Automáticamente por el Sistema
                </span>
              </div>
              <button
                type="button"
                onClick={handleRegenerarCodigos}
                title="Regenerar N° de Trámite, Expediente y CUIL"
                style={{
                  background: "#DCFCE7",
                  border: "1px solid #86EFAC",
                  color: "#15803D",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span className="material-icons" style={{ fontSize: 14 }}>
                  refresh
                </span>
                Regenerar Códigos y CUIL
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr 1.3fr",
                gap: 12,
              }}
            >
              {/* N° Trámite */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color:
                      sinFechaHabilitacion || !formData.fechaUltimaInspeccion
                        ? "#64748B"
                        : "#166534",
                    marginBottom: 4,
                    textTransform: "uppercase",
                  }}
                >
                  Trámite Rutina
                </label>
                <div
                  style={{
                    background:
                      sinFechaHabilitacion || !formData.fechaUltimaInspeccion
                        ? "#F8FAFC"
                        : "#FFFFFF",
                    border:
                      sinFechaHabilitacion || !formData.fechaUltimaInspeccion
                        ? "1px dashed #CBD5E1"
                        : "1px solid #86EFAC",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontFamily:
                      sinFechaHabilitacion || !formData.fechaUltimaInspeccion
                        ? "inherit"
                        : "monospace",
                    fontSize:
                      sinFechaHabilitacion || !formData.fechaUltimaInspeccion
                        ? 12
                        : 13,
                    fontWeight:
                      sinFechaHabilitacion || !formData.fechaUltimaInspeccion
                        ? 600
                        : 800,
                    color:
                      sinFechaHabilitacion || !formData.fechaUltimaInspeccion
                        ? "#94A3B8"
                        : "#166534",
                  }}
                >
                  {sinFechaHabilitacion || !formData.fechaUltimaInspeccion
                    ? "Sin número de trámite"
                    : formData.nroTramite}
                </div>
              </div>

              {/* N° Expediente */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#166534",
                    marginBottom: 4,
                    textTransform: "uppercase",
                  }}
                >
                  Expediente GDEBA / Provincial
                </label>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #86EFAC",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontFamily: "monospace",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#166534",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={formData.nroExpediente}
                >
                  {formData.nroExpediente}
                </div>
              </div>

              {/* Inspector Responsable: pendiente de emisión de orden */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#166534",
                    marginBottom: 4,
                    textTransform: "uppercase",
                  }}
                >
                  Inspector Responsable
                </label>
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px dashed #CBD5E1",
                    borderRadius: 8,
                    padding: "9px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    className="material-icons"
                    style={{ fontSize: 18, color: "#64748B" }}
                  >
                    assignment_ind
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#64748B",
                      fontWeight: 600,
                    }}
                  >
                    Se asigna al emitir la orden de inspección
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SECCIÓN: DATOS DEL ESTABLECIMIENTO */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#0F172A",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span className="material-icons" style={{ fontSize: 18, color: "#004B87" }}>
                apartment
              </span>
              Identificación del Establecimiento
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
              {/* Razón Social / Denominación */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 5,
                  }}
                >
                  Denominación / Razón Social <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sanatorio Privado Parque de la Salud"
                  value={formData.denominacion}
                  onChange={(e) =>
                    setFormData({ ...formData, denominacion: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: errores.denominacion ? "1.5px solid #EF4444" : "1px solid #CBD5E1",
                    borderRadius: 8,
                    fontSize: 13.5,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errores.denominacion && (
                  <span style={{ fontSize: 11, color: "#DC2626", marginTop: 3, display: "block" }}>
                    {errores.denominacion}
                  </span>
                )}
              </div>

              {/* CUIL / CUIT (Generado Automáticamente) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                    }}
                  >
                    CUIL / CUIT
                  </label>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 750,
                      color: "#166534",
                      background: "#DCFCE7",
                      padding: "1px 6px",
                      borderRadius: 4,
                    }}
                  >
                    ✨ Auto-cargado
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="30-71829340-5"
                  value={formData.cuit}
                  onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #CBD5E1",
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontFamily: "monospace",
                    fontWeight: 750,
                    color: "#0F172A",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#F8FAFC",
                  }}
                />
              </div>
            </div>

            {/* Tipología */}
            <div style={{ marginTop: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: 5,
                }}
              >
                Tipología / Rubro Sanitario
              </label>
              <select
                value={formData.tipologia}
                onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #CBD5E1",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1E293B",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                {TIPOLOGIAS_SALUD.map((tip) => (
                  <option key={tip} value={tip}>
                    {tip}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. SECCIÓN: UBICACIÓN Y DOMICILIO */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#0F172A",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span className="material-icons" style={{ fontSize: 18, color: "#004B87" }}>
                place
              </span>
              Ubicación Geográfica
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 12 }}>
              {/* Domicilio */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 5,
                  }}
                >
                  Domicilio (Calle y N°)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. Colón 1250"
                  value={formData.domicilio}
                  onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #CBD5E1",
                    borderRadius: 8,
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Departamento */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 5,
                  }}
                >
                  Departamento
                </label>
                <select
                  value={formData.departamento}
                  onChange={(e) =>
                    setFormData({ ...formData, departamento: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "9px 10px",
                    border: "1px solid #CBD5E1",
                    borderRadius: 8,
                    fontSize: 12.5,
                    boxSizing: "border-box",
                  }}
                >
                  {DEPARTAMENTOS_CORDOBA.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              {/* Localidad */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 5,
                  }}
                >
                  Localidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: Córdoba"
                  value={formData.localidad}
                  onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #CBD5E1",
                    borderRadius: 8,
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          {/* 4. SECCIÓN: CICLO DE RUTINA (FECHA DE ÚLTIMA INSPECCIÓN / SIN FECHA) */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#0F172A",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span className="material-icons" style={{ fontSize: 18, color: "#004B87" }}>
                schedule
              </span>
              Control de Rutina — Ciclo de Habilitación
            </div>

            {/* Selector de Fecha con opción 'Sin fecha de habilitación' */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 750,
                      color: "#1E293B",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>
                      {isGeriatrico ? "Fecha de Habilitación" : "Fecha de Última Inspección"}
                    </span>
                    {isGeriatrico && (
                      <span
                        style={{
                          background: "#EFF6FF",
                          border: "1px solid #BFDBFE",
                          color: "#1D4ED8",
                          fontSize: 10.5,
                          fontWeight: 750,
                          padding: "1px 7px",
                          borderRadius: 8,
                        }}
                      >
                        Geriátricos: compara con Habilitación
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: isGeriatrico ? "#0284C7" : "#64748B",
                      marginTop: 2,
                      fontWeight: 500,
                    }}
                  >
                    {isGeriatrico
                      ? "Para geriátricos únicamente: la fecha con la que se compara el ciclo es la de habilitación (3 inspecciones anuales)."
                      : "Fecha base con la que se calcula el ciclo anual de rutina (1 inspección anual)."}
                  </div>
                </div>

                {/* Opción Sin Fecha de Habilitación */}
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 750,
                    color: sinFechaHabilitacion ? "#004B87" : "#475569",
                    background: sinFechaHabilitacion ? "#E0F2FE" : "#F1F5F9",
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: `1px solid ${sinFechaHabilitacion ? "#7DD3FC" : "#CBD5E1"}`,
                    transition: "all 0.15s ease",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sinFechaHabilitacion}
                    onChange={(e) => {
                      setSinFechaHabilitacion(e.target.checked);
                      if (e.target.checked) {
                        setFormData((prev) => ({ ...prev, fechaUltimaInspeccion: "" }));
                      } else {
                        setFormData((prev) => ({ ...prev, fechaUltimaInspeccion: fechaDefecto }));
                      }
                    }}
                    style={{ cursor: "pointer", width: 15, height: 15 }}
                  />
                  <span>Cargar sin fecha de habilitación</span>
                </label>
              </div>

              {!sinFechaHabilitacion ? (
                <>
                  <input
                    type="date"
                    value={formData.fechaUltimaInspeccion}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaUltimaInspeccion: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid #CBD5E1",
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 650,
                      color: "#0F172A",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />

                  {/* Botones de atajo rápido para simular categorías */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>
                      Atajos rápidos:
                    </span>
                    <button
                      type="button"
                      onClick={() => aplicarAtajoDias(420)}
                      style={{
                        background: "#FEE2E2",
                        border: "1px solid #FCA5A5",
                        color: "#DC2626",
                        fontSize: 11,
                        fontWeight: 750,
                        padding: "3px 8px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      🔴 Vencido {isGeriatrico ? "(> 4 meses)" : "(> 1 año)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarAtajoDias(355)}
                      style={{
                        background: "#FEF3C7",
                        border: "1px solid #FCD34D",
                        color: "#B45309",
                        fontSize: 11,
                        fontWeight: 750,
                        padding: "3px 8px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      🟡 Próximos (&lt; 15 días)
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarAtajoDias(342)}
                      style={{
                        background: "#EFF6FF",
                        border: "1px solid #93C5FD",
                        color: "#1D4ED8",
                        fontSize: 11,
                        fontWeight: 750,
                        padding: "3px 8px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      🔵 En Plazo (&lt; 30 días)
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarAtajoDias(90)}
                      style={{
                        background: "#DCFCE7",
                        border: "1px solid #86EFAC",
                        color: "#15803D",
                        fontSize: 11,
                        fontWeight: 750,
                        padding: "3px 8px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      🟢 Al Día (&gt; 30 días)
                    </button>
                    <button
                      type="button"
                      onClick={aplicarAtajoSinFecha}
                      style={{
                        background: "#F1F5F9",
                        border: "1px solid #CBD5E1",
                        color: "#475569",
                        fontSize: 11,
                        fontWeight: 750,
                        padding: "3px 8px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      ⚪ Sin Fecha
                    </button>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    background: "#F1F5F9",
                    border: "1.5px dashed #CBD5E1",
                    borderRadius: 8,
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 22, color: "#64748B" }}>
                    event_busy
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 750, color: "#334155" }}>
                      Establecimiento sin fecha de habilitación registrada
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                      Se incorporará a la grilla con ciclo pendiente y quedará clasificado bajo el filtro <strong>"Sin fecha habilitación"</strong>.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comparador Visual de Plazo Calculado y Estado Finalizado */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr", gap: 14 }}>
              {/* 1. Plazo Calculado Automáticamente */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11.5,
                    fontWeight: 750,
                    color: "#475569",
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  Plazo de Rutina
                </label>
                <div
                  style={{
                    background: plazoCalculado.bg,
                    border: `1.5px solid ${plazoCalculado.border}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        className="material-icons"
                        style={{ fontSize: 18, color: plazoCalculado.color }}
                      >
                        {plazoCalculado.icon}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: plazoCalculado.color,
                        }}
                      >
                        {plazoCalculado.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: plazoCalculado.color,
                        background: "rgba(255,255,255,0.6)",
                        padding: "2px 7px",
                        borderRadius: 6,
                      }}
                    >
                      {plazoCalculado.fechaVencimientoStr}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: plazoCalculado.color,
                      marginTop: 4,
                      fontWeight: 600,
                      opacity: 0.9,
                    }}
                  >
                    {plazoCalculado.descripcion}
                  </div>
                </div>
              </div>

              {/* 2. Estado del Trámite: Fijado a FINALIZADO */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11.5,
                    fontWeight: 750,
                    color: "#475569",
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  Estado del Trámite
                </label>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1.5px solid #CBD5E1",
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    minHeight: 52,
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          background: "#DCFCE7",
                          border: "1px solid #86EFAC",
                          color: "#166534",
                          fontWeight: 800,
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 6,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 12 }}>
                          verified
                        </span>
                        FINALIZADO
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#15803D",
                          fontWeight: 750,
                        }}
                      >
                        Aprobada
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        background: "#F1F5F9",
                        color: "#475569",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontWeight: 700,
                      }}
                    >
                      Automático
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>
                    Establecimiento habilitado con inspección anterior concluida favorablemente.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 10,
              paddingTop: 16,
              borderTop: "1px solid #E2E8F0",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#F1F5F9",
                border: "1px solid #CBD5E1",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                background: "#004B87",
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                fontSize: 13.5,
                fontWeight: 800,
                color: "#FFFFFF",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 6px rgba(0, 75, 135, 0.3)",
              }}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>
                save
              </span>
              Guardar Establecimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
