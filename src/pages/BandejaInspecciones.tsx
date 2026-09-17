import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import {
  TRAMITES,
  USUARIOS,
  type Tramite,
  type EstadoTramite,
  ESTADO_CONFIG,
} from "../data/mockData";
import TableActionsMenu from "../components/TableActionsMenu";
import MiPagination from "../components/MiPagination";
import ModalEmitirOrdenRutina from "../components/ModalEmitirOrdenRutina";
import ModalRadiofisicaServicios from "../components/ModalRadiofisicaServicios";

export default function BandejaInspecciones() {
  const { user } = useAuth();
  const { tramites, iniciarInspeccion } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES);

  useEffect(() => {
    if (tramites && tramites.length > 0) {
      setLocalTramites(tramites);
    }
  }, [tramites]);

  // Scope Filter (Tipo de Inspección)
  const [tipoFiltro, setTipoFiltro] = useState<
    "TODOS" | "HABILITACION" | "RUTINA" | "DENUNCIA"
  >("TODOS");

  // Contextual Sub-filters
  const [filtroEstado, setFiltroEstado] = useState<
    | "TODOS"
    | "PENDIENTES"
    | "OBSERVADAS"
    | "RESPUESTA_EMPLAZAMIENTO"
    | "APROBADAS"
  >("TODOS");
  const [filtroVentanaRutina, setFiltroVentanaRutina] =
    useState<string>("TODAS");
  const [filtroGeriatricos, setFiltroGeriatricos] = useState<boolean>(false);

  useEffect(() => {
    if (location.state?.filtroEstado) {
      setFiltroEstado(location.state.filtroEstado);
    }
    if (location.state?.tipoFiltro) {
      setTipoFiltro(location.state.tipoFiltro);
    }
    if (location.state?.filtroVentanaRutina) {
      setFiltroVentanaRutina(location.state.filtroVentanaRutina);
    }
  }, [location.state]);

  // Inspector Autocomplete Filter
  const [inspectorFiltro, setInspectorFiltro] = useState<string>("");
  const [inspectorSearchText, setInspectorSearchText] = useState<string>("");
  const [isInspectorMenuOpen, setIsInspectorMenuOpen] =
    useState<boolean>(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Search & Individual Filter States
  const [filtroNombre, setFiltroNombre] = useState<string>("");
  const [filtroCuit, setFiltroCuit] = useState<string>("");
  const [filtroExpediente, setFiltroExpediente] = useState<string>("");
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>("");
  const [filtroLocalidad, setFiltroLocalidad] = useState<string>("");

  const [paginaSeleccionada, setPaginaSeleccionada] = useState(1);
  const [cantidadFilasPorPagina, setCantidadFilasPorPagina] = useState(10);

  // Coordinator Modal States
  const isCoordinador = user?.rol === "COORDINADOR";
  const [tramiteEmitirOrden, setTramiteEmitirOrden] = useState<Tramite | null>(
    null,
  );

  // Radiofísica Modal States
  const [modalRadiofisicaOpen, setModalRadiofisicaOpen] = useState(false);
  const [tramiteRadiofisica, setTramiteRadiofisica] = useState<Tramite | null>(null);

  const handleIniciarOContinuar = (t: Tramite) => {
    const isRadiofisica =
      t.tipologia?.toUpperCase().includes("RADIOFÍSICA") ||
      t.tipologia?.toUpperCase().includes("RADIOFISICA") ||
      t.denominacion?.toUpperCase().includes("RADIOFÍSICA") ||
      t.denominacion?.toUpperCase().includes("RADIOFISICA");

    if (isRadiofisica) {
      setTramiteRadiofisica(t);
      setModalRadiofisicaOpen(true);
      return;
    }

    if (t.estado === "ACEPTADO_DOC_AUD") {
      iniciarInspeccion(t.id);
    }
    if (isCoordinador) {
      navigate(`/coordinador/inspeccion/${t.id}`);
    } else {
      navigate(`/inspector/inspeccion/${t.id}`);
    }
  };

  const handleConfirmRadiofisica = (tipoServicio: string, subservicio: string) => {
    if (!tramiteRadiofisica) return;
    if (tramiteRadiofisica.estado === "ACEPTADO_DOC_AUD") {
      iniciarInspeccion(tramiteRadiofisica.id);
    }
    setModalRadiofisicaOpen(false);
    const basePath = isCoordinador ? "/coordinador/inspeccion" : "/inspector/inspeccion";
    navigate(
      `${basePath}/${tramiteRadiofisica.id}?tipoServicio=${encodeURIComponent(tipoServicio)}&subservicio=${encodeURIComponent(subservicio)}`
    );
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const [isFiltrosOpen, setIsFiltrosOpen] = useState<boolean>(true);

  const formatFecha = (f?: string) => {
    if (!f) return "11/08/2025";
    if (f.includes("-")) {
      const parts = f.split("T")[0].split("-");
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return f;
  };

  // Cerrar Autocomplete al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node)
      ) {
        setIsInspectorMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset contextual sub-filters when main type changes
  const handleCambiarTipo = (
    nuevoTipo: "TODOS" | "HABILITACION" | "RUTINA" | "DENUNCIA",
  ) => {
    setTipoFiltro(nuevoTipo);
    setFiltroEstado("TODOS");
    setFiltroVentanaRutina("TODAS");
    setFiltroGeriatricos(false);
    setPaginaSeleccionada(1);
  };

  useEffect(() => {
    setPaginaSeleccionada(1);
  }, [
    tipoFiltro,
    filtroEstado,
    filtroVentanaRutina,
    filtroGeriatricos,
    filtroNombre,
    filtroCuit,
    filtroExpediente,
    filtroDepartamento,
    filtroLocalidad,
    inspectorFiltro,
  ]);

  const inInspectionPhase = (t: Tramite) =>
    [
      "ACEPTADO_DOC_AUD",
      "EN_ANALISIS_AUD",
      "OBSERVADO_INSP",
      "DESCARGO_INSP",
      "ACEPTADO_INSP",
      "RE_INSP_SOLICITADA",
      "EN_PROTOCOLIZACION",
      "FINALIZADO",
    ].includes(t.estado);

  // Inspecciones base (en fase de inspección, rutina o denuncia)
  const inspeccionesBase = useMemo(() => {
    return localTramites.filter((t) => {
      return (
        inInspectionPhase(t) ||
        t.tipoInspeccion === "RUTINA" ||
        t.tipoInspeccion === "DENUNCIA"
      );
    });
  }, [localTramites]);

  const getInspectoresTramite = (t: Tramite): string[] => {
    if (t.inspectoresAsignados && t.inspectoresAsignados.length > 0) {
      return t.inspectoresAsignados;
    }
    const raw = t.inspectorAsignado || t.agenteAsignado || "";
    if (!raw || raw.toLowerCase() === "sin asignar") return [];
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  // Departamentos y Localidades disponibles
  const departamentosDisponibles = useMemo(() => {
    const set = new Set<string>();
    inspeccionesBase.forEach((t) => {
      if (t.departamento) set.add(t.departamento);
    });
    return Array.from(set).sort();
  }, [inspeccionesBase]);

  const localidadesDisponibles = useMemo(() => {
    const set = new Set<string>();
    inspeccionesBase.forEach((t) => {
      if (filtroDepartamento && t.departamento !== filtroDepartamento) return;
      if (t.localidad) set.add(t.localidad);
    });
    return Array.from(set).sort();
  }, [inspeccionesBase, filtroDepartamento]);

  // Lista única de inspectores
  const listaInspectores = useMemo(() => {
    const nombresSet = new Set<string>();
    localTramites.forEach((t) => {
      const list = getInspectoresTramite(t);
      list.forEach((n) => {
        if (n && n.toLowerCase() !== "sin asignar") nombresSet.add(n);
      });
    });
    USUARIOS.filter((u) => u.rol === "INSPECTOR").forEach((u) => {
      nombresSet.add(`${u.nombre} ${u.apellido}`);
    });
    return Array.from(nombresSet).sort();
  }, [localTramites]);

  // Identificar el usuario logueado en la lista
  const miNombreInspector = useMemo(() => {
    if (!user) return "";
    const encontrado = listaInspectores.find(
      (n) =>
        n.toLowerCase().includes((user.apellido || "").toLowerCase()) ||
        n.toLowerCase().includes((user.nombre || "").toLowerCase()),
    );
    return encontrado || "";
  }, [listaInspectores, user]);

  // Resto de inspectores excluyendo al usuario logueado
  const restoInspectores = useMemo(() => {
    if (!miNombreInspector) return listaInspectores;
    return listaInspectores.filter((n) => n !== miNombreInspector);
  }, [listaInspectores, miNombreInspector]);

  // Total de trámites asignados a un inspector
  const getInspectorCount = (nombre: string): number => {
    return inspeccionesBase.filter((t) => {
      const list = getInspectoresTramite(t);
      return list.includes(nombre);
    }).length;
  };

  // Filtrado de trámites por inspector seleccionado
  const inspeccionesPorInspector = useMemo(() => {
    if (!inspectorFiltro) return inspeccionesBase;
    return inspeccionesBase.filter((t) => {
      const list = getInspectoresTramite(t);
      return list.includes(inspectorFiltro);
    });
  }, [inspeccionesBase, inspectorFiltro]);

  // Trámites de rutina para métricas de nivel 2
  const inspeccionesRutina = useMemo(() => {
    return inspeccionesPorInspector.filter(
      (t) => t.tipoInspeccion === "RUTINA",
    );
  }, [inspeccionesPorInspector]);

  const esEstadoOrdenado = (estado: EstadoTramite) =>
    [
      "ACEPTADO_DOC_AUD",
      "EN_ANALISIS_AUD",
      "RE_INSP_SOLICITADA",
      "ACEPTADO_INSP",
      "RECHAZADO_INSP",
      "OBSERVADO_INSP",
      "DESCARGO_INSP",
    ].includes(estado);

  // Métricas del Nivel 1 (Tipos de Trámite principales)
  const countTotal = inspeccionesPorInspector.length;
  const countHabilitacion = inspeccionesPorInspector.filter(
    (t) => t.tipoInspeccion === "HABILITACION" || t.tipoInspeccion === "INICIAL" || t.tipoInspeccion === "RE_INSPECCION",
  ).length;
  const countRutina = inspeccionesRutina.length;
  const countRutinaTotal = countRutina;
  const countDenuncia = inspeccionesPorInspector.filter(
    (t) => t.tipoInspeccion === "DENUNCIA",
  ).length;

  const isGeriatrico = (t: Tramite) => {
    const tip = (t.tipologia || "").toLowerCase();
    return (
      tip.includes("geriátrico") ||
      tip.includes("geriatrico") ||
      tip.includes("geriátricos") ||
      tip.includes("geriatricos")
    );
  };

  // Métricas del Nivel 2 para Rutina (General)
  const countRutinasOrdenadas = inspeccionesRutina.filter((t) =>
    esEstadoOrdenado(t.estado),
  ).length;
  const countFaltantes = inspeccionesRutina.filter(
    (t) => t.alertaRutina === "CRITICO_VENCIDO",
  ).length;
  const countVencidos = countFaltantes;
  const countProximos = inspeccionesRutina.filter(
    (t) => t.alertaRutina === "ALERTA_T15",
  ).length;
  const countEnPlazo = inspeccionesRutina.filter(
    (t) => t.alertaRutina === "ALERTA_T30",
  ).length;
  const countMayor30 = inspeccionesRutina.filter(
    (t) =>
      t.alertaRutina === "AL_DIA" ||
      (!t.alertaRutina && t.tipoInspeccion === "RUTINA"),
  ).length;

  // Métricas del Nivel 2 para Rutina (Geriátricos)
  const countGeriatricos = inspeccionesRutina.filter((t) => isGeriatrico(t)).length;
  const countGeriatricosFaltantes = inspeccionesRutina.filter(
    (t) => isGeriatrico(t) && t.alertaRutina === "CRITICO_VENCIDO",
  ).length;
  const countGeriatricosEnPlazo = inspeccionesRutina.filter(
    (t) => isGeriatrico(t) && t.alertaRutina !== "CRITICO_VENCIDO",
  ).length;

  // Métricas del Nivel 2 para Habilitación / Denuncias / Contexto
  const inspeccionesContexto =
    tipoFiltro !== "TODOS"
      ? inspeccionesPorInspector.filter((t) => {
          if (tipoFiltro === "HABILITACION") {
            return (
              t.tipoInspeccion === "HABILITACION" ||
              t.tipoInspeccion === "INICIAL" ||
              t.tipoInspeccion === "RE_INSPECCION"
            );
          }
          return t.tipoInspeccion === tipoFiltro;
        })
      : inspeccionesPorInspector;

  const countPendientes = inspeccionesContexto.filter(
    (t) => t.estado === "ACEPTADO_DOC_AUD",
  ).length;
  const countObservadas = inspeccionesContexto.filter(
    (t) => t.estado === "OBSERVADO_INSP",
  ).length;
  const countRespuestaEmplazamiento = inspeccionesContexto.filter(
    (t) => t.estado === "DESCARGO_INSP",
  ).length;
  const countAprobadas = inspeccionesContexto.filter((t) =>
    ["ACEPTADO_INSP", "EN_PROTOCOLIZACION", "FINALIZADO"].includes(t.estado),
  ).length;

  // Filtrado final
  const filtradas = inspeccionesPorInspector.filter((t) => {
    // 1. Tipo principal
    if (tipoFiltro !== "TODOS") {
      if (tipoFiltro === "HABILITACION") {
        if (
          t.tipoInspeccion !== "HABILITACION" &&
          t.tipoInspeccion !== "INICIAL" &&
          t.tipoInspeccion !== "RE_INSPECCION"
        )
          return false;
      } else if (t.tipoInspeccion !== tipoFiltro) {
        return false;
      }
    }

    // 2. Sub-filtros contextuales
    if (tipoFiltro === "RUTINA") {
      if (filtroGeriatricos) {
        if (!isGeriatrico(t)) return false;

        if (
          filtroVentanaRutina === "CRITICO_VENCIDO" ||
          filtroVentanaRutina === "FALTANTES"
        ) {
          if (t.alertaRutina !== "CRITICO_VENCIDO") return false;
        } else if (
          filtroVentanaRutina === "ALERTA_T30" ||
          filtroVentanaRutina === "EN_PLAZO"
        ) {
          if (t.alertaRutina === "CRITICO_VENCIDO") return false;
        }
      } else {
        if (filtroVentanaRutina !== "TODAS") {
          if (
            filtroVentanaRutina === "FALTANTES" ||
            filtroVentanaRutina === "CRITICO_VENCIDO"
          ) {
            if (t.alertaRutina !== "CRITICO_VENCIDO") return false;
          } else if (
            filtroVentanaRutina === "EN_PLAZO" ||
            filtroVentanaRutina === "ALERTA_T30"
          ) {
            if (t.alertaRutina !== "ALERTA_T30") return false;
          } else if (filtroVentanaRutina === "ORDENADAS") {
            if (!esEstadoOrdenado(t.estado)) return false;
          } else if (filtroVentanaRutina === "AL_DIA") {
            if (t.alertaRutina !== "AL_DIA" && t.alertaRutina) return false;
          } else {
            if (t.alertaRutina !== filtroVentanaRutina) return false;
          }
        }
      }
    } else {
      if (filtroEstado !== "TODOS") {
        if (filtroEstado === "PENDIENTES" && t.estado !== "ACEPTADO_DOC_AUD")
          return false;
        if (filtroEstado === "OBSERVADAS" && t.estado !== "OBSERVADO_INSP")
          return false;
        if (
          filtroEstado === "RESPUESTA_EMPLAZAMIENTO" &&
          t.estado !== "DESCARGO_INSP"
        )
          return false;
        if (
          filtroEstado === "APROBADAS" &&
          !["ACEPTADO_INSP", "EN_PROTOCOLIZACION", "FINALIZADO"].includes(
            t.estado,
          )
        )
          return false;
      }
    }

    // 3. Filtros divididos individuales
    if (filtroNombre.trim() !== "") {
      const q = filtroNombre.toLowerCase();
      if (!(t.denominacion || "").toLowerCase().includes(q)) return false;
    }
    if (filtroCuit.trim() !== "") {
      const q = filtroCuit.toLowerCase();
      if (!(t.cuit || "").toLowerCase().includes(q)) return false;
    }
    if (filtroExpediente.trim() !== "") {
      const q = filtroExpediente.toLowerCase();
      const matchExp = (t.nroExpediente || "").toLowerCase().includes(q);
      const matchTramite = (t.nroTramite || "").toLowerCase().includes(q);
      if (!matchExp && !matchTramite) return false;
    }
    if (filtroDepartamento !== "") {
      if ((t.departamento || "") !== filtroDepartamento) return false;
    }
    if (filtroLocalidad !== "") {
      if ((t.localidad || "") !== filtroLocalidad) return false;
    }

    return true;
  });

  // Paginado
  const cantidadPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / cantidadFilasPorPagina),
  );
  const inspeccionesPaginadas = filtradas.slice(
    (paginaSeleccionada - 1) * cantidadFilasPorPagina,
    paginaSeleccionada * cantidadFilasPorPagina,
  );

  const hasInputFilters =
    filtroNombre.trim() !== "" ||
    filtroCuit.trim() !== "" ||
    filtroExpediente.trim() !== "" ||
    filtroDepartamento !== "" ||
    filtroLocalidad !== "" ||
    inspectorFiltro !== "";

  const hasActiveFilters =
    tipoFiltro !== "TODOS" ||
    filtroEstado !== "TODOS" ||
    filtroVentanaRutina !== "TODAS" ||
    filtroGeriatricos ||
    hasInputFilters;

  const handleLimpiarFiltros = () => {
    setTipoFiltro("TODOS");
    setFiltroEstado("TODOS");
    setFiltroVentanaRutina("TODAS");
    setFiltroGeriatricos(false);
    setFiltroNombre("");
    setFiltroCuit("");
    setFiltroExpediente("");
    setFiltroDepartamento("");
    setFiltroLocalidad("");
    setInspectorFiltro("");
    setInspectorSearchText("");
    setPaginaSeleccionada(1);
  };

  const handleAbrirInspeccion = (id: string, estado: EstadoTramite) => {
    if (estado === "ACEPTADO_DOC_AUD") iniciarInspeccion(id);
    navigate(`/inspector/inspeccion/${id}`);
  };

  const handleVerValidacion = (id: string) => {
    navigate(`/inspector/validacion/${id}`);
  };

  return (
    <>
      {/* Top Header Banner Institucional */}
      <div
        style={{
          background: "#004B87",
          color: "#FFFFFF",
          padding: "18px 26px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 2px 8px rgba(0, 75, 135, 0.15)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span className="material-icons" style={{ fontSize: 22, color: "#FFFFFF" }}>
            fact_check
          </span>
        </div>
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.2px",
              lineHeight: 1.2,
            }}
          >
            Control y Gestión de Inspecciones
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "rgba(255, 255, 255, 0.82)",
              marginTop: 2,
              fontWeight: 500,
            }}
          >
            Coordinador General
          </div>
        </div>
      </div>

      <div
        className="page-content"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          padding: "20px 24px",
          background: "#F8FAFC",
          minHeight: "calc(100vh - 140px)",
        }}
      >
        {/* Sección de Métricas (2 Cajas Superiores) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 1fr) minmax(520px, 1.65fr)",
            gap: 16,
          }}
        >
          {/* CAJA 1: TIPO DE INSPECCIÓN */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                className="material-icons"
                style={{ fontSize: 18, color: "#0284C7" }}
              >
                category
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#0F172A",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Tipo de Inspección
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {/* Card Habilitación */}
              <div
                onClick={() =>
                  handleCambiarTipo(
                    tipoFiltro === "HABILITACION" ? "TODOS" : "HABILITACION",
                  )
                }
                style={{
                  background:
                    tipoFiltro === "HABILITACION" ? "#F0FDF4" : "#FFFFFF",
                  border: `1.5px solid ${
                    tipoFiltro === "HABILITACION" ? "#10B981" : "#E2E8F0"
                  }`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transition: "all 0.18s ease",
                  boxShadow:
                    tipoFiltro === "HABILITACION"
                      ? "0 4px 12px rgba(16, 185, 129, 0.12)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Habilitación
                  </span>
                  <span
                    className="material-icons"
                    style={{ fontSize: 18, color: "#10B981" }}
                  >
                    check_circle
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: "#10B981",
                    lineHeight: 1,
                  }}
                >
                  {countHabilitacion}
                </div>
                <div
                  style={{ fontSize: 11.5, color: "#64748B", fontWeight: 500 }}
                >
                  Trámites en Curso
                </div>
              </div>

              {/* Card Rutina */}
              <div
                onClick={() =>
                  handleCambiarTipo(
                    tipoFiltro === "RUTINA" ? "TODOS" : "RUTINA",
                  )
                }
                style={{
                  background: tipoFiltro === "RUTINA" ? "#F0F9FF" : "#FFFFFF",
                  border: `1.5px solid ${
                    tipoFiltro === "RUTINA" ? "#0284C7" : "#E2E8F0"
                  }`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transition: "all 0.18s ease",
                  boxShadow:
                    tipoFiltro === "RUTINA"
                      ? "0 4px 12px rgba(2, 132, 199, 0.12)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Rutina
                  </span>
                  <span
                    className="material-icons"
                    style={{ fontSize: 18, color: "#0284C7" }}
                  >
                    schedule
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: "#0284C7",
                    lineHeight: 1,
                  }}
                >
                  {countRutina}
                </div>
                <div
                  style={{ fontSize: 11.5, color: "#64748B", fontWeight: 500 }}
                >
                  Periódicas / Programadas
                </div>
              </div>
            </div>
          </div>

          {/* CAJA 2: ESTADOS DE INSPECCIÓN */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                className="material-icons"
                style={{ fontSize: 18, color: "#1E293B" }}
              >
                filter_alt
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#0F172A",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Estados de Inspección
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
              }}
            >
              {/* 1. Por Iniciar */}
              <div
                onClick={() =>
                  setFiltroEstado((prev) =>
                    prev === "PENDIENTES" ? "TODOS" : "PENDIENTES",
                  )
                }
                style={{
                  background:
                    filtroEstado === "PENDIENTES" ? "#F0F9FF" : "#FFFFFF",
                  border: `1.5px solid ${
                    filtroEstado === "PENDIENTES" ? "#0284C7" : "#E2E8F0"
                  }`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  transition: "all 0.18s ease",
                  boxShadow:
                    filtroEstado === "PENDIENTES"
                      ? "0 3px 10px rgba(2, 132, 199, 0.12)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 750,
                      color: "#475569",
                      textTransform: "uppercase",
                    }}
                  >
                    Por Iniciar
                  </span>
                  <span
                    className="material-icons"
                    style={{ fontSize: 17, color: "#0284C7" }}
                  >
                    play_circle_outline
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#0284C7",
                    lineHeight: 1,
                  }}
                >
                  {countPendientes}
                </div>
                <div style={{ fontSize: 10.5, color: "#94A3B8" }}>
                  Listas para acta
                </div>
              </div>

              {/* 2. Observadas */}
              <div
                onClick={() =>
                  setFiltroEstado((prev) =>
                    prev === "OBSERVADAS" ? "TODOS" : "OBSERVADAS",
                  )
                }
                style={{
                  background:
                    filtroEstado === "OBSERVADAS" ? "#FFF7ED" : "#FFFFFF",
                  border: `1.5px solid ${
                    filtroEstado === "OBSERVADAS" ? "#EA580C" : "#E2E8F0"
                  }`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  transition: "all 0.18s ease",
                  boxShadow:
                    filtroEstado === "OBSERVADAS"
                      ? "0 3px 10px rgba(234, 88, 12, 0.12)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 750,
                      color: "#475569",
                      textTransform: "uppercase",
                    }}
                  >
                    Observadas
                  </span>
                  <span
                    className="material-icons"
                    style={{ fontSize: 17, color: "#EA580C" }}
                  >
                    edit_note
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#EA580C",
                    lineHeight: 1,
                  }}
                >
                  {countObservadas}
                </div>
                <div style={{ fontSize: 10.5, color: "#94A3B8" }}>
                  Acta observada
                </div>
              </div>

              {/* 3. Resp. Emplazamiento */}
              <div
                onClick={() =>
                  setFiltroEstado((prev) =>
                    prev === "RESPUESTA_EMPLAZAMIENTO"
                      ? "TODOS"
                      : "RESPUESTA_EMPLAZAMIENTO",
                  )
                }
                style={{
                  background:
                    filtroEstado === "RESPUESTA_EMPLAZAMIENTO"
                      ? "#FEF3C7"
                      : "#FFFFFF",
                  border: `1.5px solid ${
                    filtroEstado === "RESPUESTA_EMPLAZAMIENTO"
                      ? "#D97706"
                      : "#E2E8F0"
                  }`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  transition: "all 0.18s ease",
                  boxShadow:
                    filtroEstado === "RESPUESTA_EMPLAZAMIENTO"
                      ? "0 3px 10px rgba(217, 119, 6, 0.12)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 750,
                      color: "#475569",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title="Resp. Emplazamiento"
                  >
                    Resp. Emplazamiento
                  </span>
                  <span
                    className="material-icons"
                    style={{ fontSize: 17, color: "#D97706" }}
                  >
                    move_to_inbox
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#D97706",
                    lineHeight: 1,
                  }}
                >
                  {countRespuestaEmplazamiento}
                </div>
                <div style={{ fontSize: 10.5, color: "#94A3B8" }}>
                  Revisar respuestas
                </div>
              </div>

              {/* 4. Aprobadas */}
              <div
                onClick={() =>
                  setFiltroEstado((prev) =>
                    prev === "APROBADAS" ? "TODOS" : "APROBADAS",
                  )
                }
                style={{
                  background:
                    filtroEstado === "APROBADAS" ? "#F0FDF4" : "#FFFFFF",
                  border: `1.5px solid ${
                    filtroEstado === "APROBADAS" ? "#10B981" : "#E2E8F0"
                  }`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  transition: "all 0.18s ease",
                  boxShadow:
                    filtroEstado === "APROBADAS"
                      ? "0 3px 10px rgba(16, 185, 129, 0.12)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 750,
                      color: "#475569",
                      textTransform: "uppercase",
                    }}
                  >
                    Aprobadas
                  </span>
                  <span
                    className="material-icons"
                    style={{ fontSize: 17, color: "#10B981" }}
                  >
                    check_circle
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#10B981",
                    lineHeight: 1,
                  }}
                >
                  {countAprobadas}
                </div>
                <div style={{ fontSize: 10.5, color: "#94A3B8" }}>
                  Favorables
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros de búsqueda avanzados */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            padding: "18px 24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            onClick={() => setIsFiltrosOpen(!isFiltrosOpen)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 750,
                color: "#0284C7",
              }}
            >
              Filtros de búsqueda avanzados
            </span>
            <span
              className="material-icons"
              style={{ fontSize: 22, color: "#64748B" }}
            >
              {isFiltrosOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
            </span>
          </div>

          {isFiltrosOpen && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                paddingTop: 4,
              }}
            >
              {/* Fila 1: 4 columnas */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                {/* 1. Nombre de establecimiento */}
                <div>
                  <input
                    type="text"
                    placeholder="Nombre de establecimiento"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: `1.5px solid ${
                        filtroNombre ? "#0284C7" : "#CBD5E1"
                      }`,
                      padding: "8px 2px",
                      fontSize: 13.5,
                      color: "#0F172A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* 2. N° Expediente */}
                <div>
                  <input
                    type="text"
                    placeholder="N° Expediente"
                    value={filtroExpediente}
                    onChange={(e) => setFiltroExpediente(e.target.value)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: `1.5px solid ${
                        filtroExpediente ? "#0284C7" : "#CBD5E1"
                      }`,
                      padding: "8px 2px",
                      fontSize: 13.5,
                      color: "#0F172A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* 3. CUIT */}
                <div>
                  <input
                    type="text"
                    placeholder="CUIT"
                    value={filtroCuit}
                    onChange={(e) => setFiltroCuit(e.target.value)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: `1.5px solid ${
                        filtroCuit ? "#0284C7" : "#CBD5E1"
                      }`,
                      padding: "8px 2px",
                      fontSize: 13.5,
                      color: "#0F172A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* 4. Departamento */}
                <div style={{ position: "relative" }}>
                  <select
                    value={filtroDepartamento}
                    onChange={(e) => {
                      setFiltroDepartamento(e.target.value);
                      setFiltroLocalidad("");
                    }}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: `1.5px solid ${
                        filtroDepartamento ? "#0284C7" : "#CBD5E1"
                      }`,
                      padding: "8px 26px 8px 2px",
                      fontSize: 13.5,
                      color: filtroDepartamento ? "#0F172A" : "#64748B",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Departamento</option>
                    {departamentosDisponibles.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                  <span
                    className="material-icons"
                    style={{
                      position: "absolute",
                      right: 2,
                      top: 8,
                      fontSize: 20,
                      color: "#64748B",
                      pointerEvents: "none",
                    }}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {/* Fila 2: 4 columnas (Localidad, Inspector Asignado) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                {/* 1. Localidad */}
                <div style={{ position: "relative" }}>
                  <select
                    value={filtroLocalidad}
                    onChange={(e) => setFiltroLocalidad(e.target.value)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: `1.5px solid ${
                        filtroLocalidad ? "#0284C7" : "#CBD5E1"
                      }`,
                      padding: "8px 26px 8px 2px",
                      fontSize: 13.5,
                      color: filtroLocalidad ? "#0F172A" : "#64748B",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Localidad</option>
                    {localidadesDisponibles.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <span
                    className="material-icons"
                    style={{
                      position: "absolute",
                      right: 2,
                      top: 8,
                      fontSize: 20,
                      color: "#64748B",
                      pointerEvents: "none",
                    }}
                  >
                    expand_more
                  </span>
                </div>

                {/* 2. Inspector Asignado */}
                <div style={{ position: "relative" }}>
                  <select
                    value={inspectorFiltro}
                    onChange={(e) => setInspectorFiltro(e.target.value)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: `1.5px solid ${
                        inspectorFiltro ? "#0284C7" : "#CBD5E1"
                      }`,
                      padding: "8px 26px 8px 2px",
                      fontSize: 13.5,
                      color: inspectorFiltro ? "#0F172A" : "#64748B",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Inspector Asignado</option>
                    {listaInspectores.map((insp) => (
                      <option key={insp} value={insp}>
                        {insp}
                      </option>
                    ))}
                  </select>
                  <span
                    className="material-icons"
                    style={{
                      position: "absolute",
                      right: 2,
                      top: 8,
                      fontSize: 20,
                      color: "#64748B",
                      pointerEvents: "none",
                    }}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {/* Botones de acción alineados a la derecha */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 6,
                }}
              >
                <button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #475569",
                    borderRadius: 8,
                    padding: "7px 16px",
                    fontSize: 12.5,
                    fontWeight: 650,
                    color: "#1E293B",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F1F5F9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#FFFFFF")
                  }
                >
                  <span
                    className="material-icons"
                    style={{ fontSize: 16, color: "#1E293B" }}
                  >
                    restart_alt
                  </span>
                  Limpiar Filtros
                </button>

                <button
                  type="button"
                  onClick={() => setPaginaSeleccionada(1)}
                  style={{
                    background: "#0284C7",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 20px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#0369A1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#0284C7")
                  }
                >
                  <span
                    className="material-icons"
                    style={{ fontSize: 16, color: "#FFFFFF" }}
                  >
                    search
                  </span>
                  Buscar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabla Unificada de Inspecciones */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)",
          }}
        >
          <table
            className="table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: "#004B87" }}>
                <th
                  style={{
                    background: "#004B87",
                    borderBottom: "none",
                    padding: "13px 20px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Establecimiento / CUIT / Tipología
                </th>
                <th
                  style={{
                    background: "#004B87",
                    borderBottom: "none",
                    padding: "13px 20px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Trámite / Expediente
                </th>
                <th
                  style={{
                    background: "#004B87",
                    borderBottom: "none",
                    padding: "13px 20px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Última Inspección
                </th>
                <th
                  style={{
                    background: "#004B87",
                    borderBottom: "none",
                    padding: "13px 20px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Inspector Responsable
                </th>
                <th
                  style={{
                    background: "#004B87",
                    borderBottom: "none",
                    padding: "13px 20px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Estado (Trámite / Acta)
                </th>
                <th
                  style={{
                    background: "#004B87",
                    borderBottom: "none",
                    padding: "13px 20px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    textAlign: "center",
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: 48,
                      color: "#64748B",
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{
                        fontSize: 40,
                        color: "#CBD5E1",
                        marginBottom: 8,
                        display: "block",
                      }}
                    >
                      fact_check
                    </span>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#0F172A",
                      }}
                    >
                      No se encontraron inspecciones con los filtros aplicados
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "#94A3B8",
                        marginTop: 4,
                        marginBottom: 14,
                      }}
                    >
                      Probá modificando el término de búsqueda o restableciendo
                      los filtros.
                    </div>
                    <button
                      onClick={handleLimpiarFiltros}
                      style={{
                        background: "#0284C7",
                        border: "none",
                        color: "white",
                        padding: "7px 16px",
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        className="material-icons"
                        style={{ fontSize: 16 }}
                      >
                        restart_alt
                      </span>
                      Restablecer filtros
                    </button>
                  </td>
                </tr>
              ) : (
                inspeccionesPaginadas.map((t) => {
                  const conf = ESTADO_CONFIG[t.estado];
                  const rawAssigned =
                    t.inspectorAsignado || t.agenteAsignado || "";
                  const isUnassigned =
                    !rawAssigned || rawAssigned.toLowerCase() === "sin asignar";
                  const cleanName = rawAssigned.replace(
                    /^Dra\.\s*|^Dr\.\s*|^Lic\.\s*/i,
                    "",
                  );
                  const initials = cleanName
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const fechaRaw =
                    t.fechaUltimaInspeccion ||
                    t.ultimaInspeccionFecha ||
                    t.fechaIngreso;
                  const fechaFormatted = formatFecha(fechaRaw);

                  return (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F8FAFC")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#FFFFFF")
                      }
                    >
                      {/* 1. Establecimiento / CUIT / Tipología */}
                      <td
                        style={{
                          padding: "16px 20px",
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 750,
                            color: "#0F172A",
                            fontSize: 13.5,
                          }}
                        >
                          {t.denominacion}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11.5,
                            color: "#64748B",
                            fontFamily: "monospace",
                            marginTop: 2,
                          }}
                        >
                          <span>CUIT: {t.cuit}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(t.cuit, `cuit-${t.id}`)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                            title="Copiar CUIT"
                          >
                            <span
                              className="material-icons"
                              style={{
                                fontSize: 13,
                                color:
                                  copiedId === `cuit-${t.id}`
                                    ? "#10B981"
                                    : "#94A3B8",
                              }}
                            >
                              {copiedId === `cuit-${t.id}`
                                ? "check"
                                : "content_copy"}
                            </span>
                          </button>
                        </div>
                        {t.tipologia && (
                          <div
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              color: "#0284C7",
                              textTransform: "uppercase",
                              letterSpacing: 0.3,
                              marginTop: 3,
                            }}
                          >
                            {t.tipologia}
                          </div>
                        )}
                      </td>

                      {/* 2. Trámite / Expediente */}
                      <td
                        style={{
                          padding: "16px 20px",
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 750,
                            color: "#0F172A",
                            fontSize: 13,
                          }}
                        >
                          Trámite #
                          {t.nroTramite?.startsWith("2024-") ||
                          t.nroTramite?.startsWith("2026-")
                            ? t.nroTramite.split("-").pop()
                            : t.nroTramite}
                        </div>
                        {t.nroExpediente && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 11.5,
                              color: "#64748B",
                              fontFamily: "monospace",
                              marginTop: 2,
                            }}
                          >
                            <span>Exp: {t.nroExpediente}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(t.nroExpediente!, `exp-${t.id}`)
                              }
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                              }}
                              title="Copiar Expediente"
                            >
                              <span
                                className="material-icons"
                                style={{
                                  fontSize: 13,
                                  color:
                                    copiedId === `exp-${t.id}`
                                      ? "#10B981"
                                      : "#94A3B8",
                                }}
                              >
                                {copiedId === `exp-${t.id}`
                                  ? "check"
                                  : "content_copy"}
                              </span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 3. Última Inspección */}
                      <td
                        style={{
                          padding: "16px 20px",
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#334155",
                          }}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: 14, color: "#64748B" }}
                          >
                            calendar_today
                          </span>
                          <span>{fechaFormatted}</span>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <span
                            style={{
                              background: "#FEE2E2",
                              border: "1px solid #FCA5A5",
                              color: "#DC2626",
                              fontWeight: 750,
                              fontSize: 10,
                              padding: "1px 7px",
                              borderRadius: 12,
                              display: "inline-block",
                            }}
                          >
                            Vencida
                          </span>
                        </div>
                      </td>

                      {/* 4. Inspector Responsable */}
                      <td
                        style={{
                          padding: "16px 20px",
                          verticalAlign: "top",
                        }}
                      >
                        {isUnassigned ? (
                          <span
                            style={{
                              background: "#F8FAFC",
                              border: "1px solid #CBD5E1",
                              color: "#64748B",
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 10px",
                              borderRadius: 12,
                              display: "inline-block",
                            }}
                          >
                            Sin asignar
                          </span>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                background: "#E0F2FE",
                                color: "#0284C7",
                                fontSize: 10,
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: 12.5,
                                  color: "#0F172A",
                                  lineHeight: 1.2,
                                }}
                              >
                                {cleanName}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#64748B",
                                  marginTop: 2,
                                }}
                              >
                                CUIL: 27-31456789-4
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 5. Estado (Trámite / Acta) */}
                      <td
                        style={{
                          padding: "16px 20px",
                          verticalAlign: "top",
                        }}
                      >
                        {(() => {
                          if (t.estado === "OBSERVADO_INSP") {
                            return (
                              <div>
                                <span
                                  style={{
                                    background: "#FFEDD5",
                                    color: "#C2410C",
                                    fontWeight: 750,
                                    fontSize: 11,
                                    padding: "2px 8px",
                                    borderRadius: 10,
                                    display: "inline-block",
                                  }}
                                >
                                  Observada
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    marginTop: 4,
                                  }}
                                >
                                  <span
                                    className="material-icons"
                                    style={{ fontSize: 13, color: "#B45309" }}
                                  >
                                    description
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: "#B45309",
                                    }}
                                  >
                                    Acta: Observado inspección
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          if (
                            t.estado === "ACEPTADO_DOC_AUD" ||
                            t.estado === "EN_ANALISIS_AUD"
                          ) {
                            return (
                              <div>
                                <span
                                  style={{
                                    background: "#F3E8FF",
                                    color: "#7E22CE",
                                    fontWeight: 750,
                                    fontSize: 11,
                                    padding: "2px 8px",
                                    borderRadius: 10,
                                    display: "inline-block",
                                  }}
                                >
                                  Ordenada
                                </span>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#94A3B8",
                                    fontStyle: "italic",
                                    marginTop: 4,
                                  }}
                                >
                                  Sin acta labrada
                                </div>
                              </div>
                            );
                          }
                          if (
                            [
                              "ACEPTADO_INSP",
                              "EN_PROTOCOLIZACION",
                              "FINALIZADO",
                            ].includes(t.estado)
                          ) {
                            return (
                              <div>
                                <span
                                  style={{
                                    background: "#DCFCE7",
                                    color: "#15803D",
                                    fontWeight: 750,
                                    fontSize: 11,
                                    padding: "2px 8px",
                                    borderRadius: 10,
                                    display: "inline-block",
                                  }}
                                >
                                  Aprobada
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    marginTop: 4,
                                  }}
                                >
                                  <span
                                    className="material-icons"
                                    style={{ fontSize: 13, color: "#15803D" }}
                                  >
                                    verified
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: "#15803D",
                                    }}
                                  >
                                    Acta: Inspección favorable
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          if (t.estado === "DESCARGO_INSP") {
                            return (
                              <div>
                                <span
                                  style={{
                                    background: "#FEF3C7",
                                    color: "#B45309",
                                    fontWeight: 750,
                                    fontSize: 11,
                                    padding: "2px 8px",
                                    borderRadius: 10,
                                    display: "inline-block",
                                  }}
                                >
                                  Resp. Emplazamiento
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    marginTop: 4,
                                  }}
                                >
                                  <span
                                    className="material-icons"
                                    style={{ fontSize: 13, color: "#B45309" }}
                                  >
                                    assignment_late
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: "#B45309",
                                    }}
                                  >
                                    Descargo presentado
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <span
                              className={`badge ${conf?.badge || "badge-neutral"}`}
                              style={{
                                fontWeight: 750,
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 10,
                              }}
                            >
                              {conf?.label || t.estado}
                            </span>
                          );
                        })()}
                      </td>

                      {/* 6. Acciones */}
                      <td
                        style={{
                          padding: "16px 20px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {t.tipologia?.includes("RADIOFÍSICA") || t.denominacion?.includes("RADIOFÍSICA") ? (
                          <button
                            type="button"
                            onClick={() => handleIniciarOContinuar(t)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              background: "#004B87",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: 8,
                              padding: "7px 14px",
                              fontSize: 12,
                              fontWeight: 750,
                              cursor: "pointer",
                              boxShadow: "0 2px 6px rgba(0, 75, 135, 0.25)",
                              transition: "all 0.15s ease",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.05)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                            title="Iniciar Inspección - Radiofísica"
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: 16, color: "#FFFFFF" }}
                            >
                              play_circle
                            </span>
                            Iniciar Inspección
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleIniciarOContinuar(t)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "#004B87",
                              border: "none",
                              color: "#FFFFFF",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: "0 2px 5px rgba(0, 75, 135, 0.25)",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.08)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                            title="Gestionar inspección"
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: 17, color: "#FFFFFF" }}
                            >
                              policy
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {filtradas.length > 0 && (
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #E2E8F0",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#64748B",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                Mostrando{" "}
                <strong style={{ color: "#0F172A", fontWeight: 700 }}>
                  {inspeccionesPaginadas.length}
                </strong>{" "}
                de{" "}
                <strong style={{ color: "#0F172A", fontWeight: 700 }}>
                  {filtradas.length}
                </strong>{" "}
                {filtradas.length === 1 ? "inspección" : "inspecciones"}
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <MiPagination
                  cantidadFilasPorPagina={cantidadFilasPorPagina}
                  cantidadPaginas={cantidadPaginas}
                  paginaSeleccionada={paginaSeleccionada}
                  setCantidadFilasPorPagina={setCantidadFilasPorPagina}
                  setPaginaSeleccionada={setPaginaSeleccionada}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Emitir Orden Rutina */}
      {tramiteEmitirOrden && (
        <ModalEmitirOrdenRutina
          tramite={tramiteEmitirOrden}
          onClose={() => setTramiteEmitirOrden(null)}
          onSuccess={(nuevo) => {
            setLocalTramites((prev) => [nuevo, ...prev]);
          }}
        />
      )}

      {/* Modal Selección Radiofísica */}
      <ModalRadiofisicaServicios
        open={modalRadiofisicaOpen}
        onClose={() => {
          setModalRadiofisicaOpen(false);
          setTramiteRadiofisica(null);
        }}
        tramite={tramiteRadiofisica}
        onConfirm={handleConfirmRadiofisica}
      />
    </>
  );
}
