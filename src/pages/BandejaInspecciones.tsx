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
    "TODOS" | "HABILITACION" | "RUTINA"
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

  // Search & Pagination States
  const [busqueda, setBusqueda] = useState<string>("");
  const [paginaSeleccionada, setPaginaSeleccionada] = useState(1);
  const [cantidadFilasPorPagina, setCantidadFilasPorPagina] = useState(10);

  // Coordinator Modal States
  const isCoordinador = user?.rol === "COORDINADOR";
  const [tramiteEmitirOrden, setTramiteEmitirOrden] = useState<Tramite | null>(
    null,
  );

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
    nuevoTipo: "TODOS" | "HABILITACION" | "RUTINA",
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
    busqueda,
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

  // Inspecciones base (en fase de inspección o de rutina, excluyendo denuncias)
  const inspeccionesBase = useMemo(() => {
    return localTramites.filter((t) => {
      const esFase = inInspectionPhase(t) || t.tipoInspeccion === "RUTINA";
      const noDenuncia = t.tipoInspeccion !== "DENUNCIA";
      return esFase && noDenuncia;
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
    return (
      encontrado ||
      (user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : "")
    );
  }, [user, listaInspectores]);

  // Resto de inspectores
  const restoInspectores = useMemo(() => {
    return listaInspectores.filter(
      (n) => n.toLowerCase() !== miNombreInspector.toLowerCase(),
    );
  }, [listaInspectores, miNombreInspector]);

  const getInspectorCount = (nombre: string) => {
    const target = nombre.toLowerCase();
    return inspeccionesBase.filter((t) => {
      const list = getInspectoresTramite(t);
      return (
        list.some((n) => n.toLowerCase().includes(target)) ||
        (t.inspectorAsignado || "").toLowerCase().includes(target)
      );
    }).length;
  };

  // Filtrado por inspector seleccionado en el autocomplete
  const inspeccionesPorInspector = useMemo(() => {
    if (!inspectorFiltro || inspectorFiltro === "TODOS")
      return inspeccionesBase;
    const target = inspectorFiltro.toLowerCase();
    return inspeccionesBase.filter((t) => {
      const list = getInspectoresTramite(t);
      return (
        list.some((n) => n.toLowerCase().includes(target)) ||
        (t.inspectorAsignado || "").toLowerCase().includes(target)
      );
    });
  }, [inspeccionesBase, inspectorFiltro]);

  const esEstadoOrdenado = (estado: string) =>
    [
      "ACEPTADO_DOC_AUD",
      "EN_ANALISIS_AUD",
      "RE_INSP_SOLICITADA",
      "ACEPTADO_INSP",
      "RECHAZADO_INSP",
      "OBSERVADO_INSP",
      "DESCARGO_INSP",
    ].includes(estado);

  // Conteo Grupo 1 (Tipos)
  const countTotal = inspeccionesPorInspector.length;
  const countHabilitacion = inspeccionesPorInspector.filter(
    (t) => t.tipoInspeccion === "HABILITACION",
  ).length;
  const countRutina = inspeccionesPorInspector.filter(
    (t) => t.tipoInspeccion === "RUTINA",
  ).length;

  // Métricas contextuales para Grupo 2 (Rutina)
  const inspeccionesRutina = inspeccionesPorInspector.filter(
    (t) => t.tipoInspeccion === "RUTINA",
  );
  const countRutinasOrdenadas = inspeccionesRutina.filter((t) =>
    esEstadoOrdenado(t.estado),
  ).length;
  const countVencidos = inspeccionesRutina.filter(
    (t) => t.alertaRutina === "CRITICO_VENCIDO",
  ).length;
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
  const countGeriatricos = inspeccionesRutina.filter(
    (t) =>
      (t.tipologia || "").toLowerCase().includes("geriátrico") ||
      (t.tipologia || "").toLowerCase().includes("geriátricos"),
  ).length;

  // Habilitación / Todos:
  const inspeccionesContexto =
    tipoFiltro === "HABILITACION"
      ? inspeccionesPorInspector.filter(
          (t) => t.tipoInspeccion === "HABILITACION",
        )
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
    if (tipoFiltro !== "TODOS" && t.tipoInspeccion !== tipoFiltro) return false;

    // 2. Sub-filtros contextuales
    if (tipoFiltro === "RUTINA") {
      if (filtroVentanaRutina !== "TODAS") {
        if (filtroVentanaRutina === "ORDENADAS") {
          if (!esEstadoOrdenado(t.estado)) return false;
        } else if (filtroVentanaRutina === "AL_DIA") {
          if (t.alertaRutina !== "AL_DIA" && t.alertaRutina) return false;
        } else {
          if (t.alertaRutina !== filtroVentanaRutina) return false;
        }
      }
      if (
        filtroGeriatricos &&
        !(
          (t.tipologia || "").toLowerCase().includes("geriátrico") ||
          (t.tipologia || "").toLowerCase().includes("geriátricos")
        )
      )
        return false;
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

    // 3. Búsqueda de texto
    if (busqueda.trim() !== "") {
      const q = busqueda.toLowerCase();
      const matchDenom = (t.denominacion || "").toLowerCase().includes(q);
      const matchExp = (t.nroExpediente || "").toLowerCase().includes(q);
      const matchTramite = (t.nroTramite || "").toLowerCase().includes(q);
      const matchCuit = (t.cuit || "").includes(q);
      const matchInsp = (t.inspectorAsignado || t.agenteAsignado || "")
        .toLowerCase()
        .includes(q);
      const matchLoc = (t.localidad || "").toLowerCase().includes(q);
      if (
        !matchDenom &&
        !matchExp &&
        !matchTramite &&
        !matchCuit &&
        !matchInsp &&
        !matchLoc
      ) {
        return false;
      }
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

  const hasActiveFilters =
    tipoFiltro !== "TODOS" ||
    filtroEstado !== "TODOS" ||
    filtroVentanaRutina !== "TODAS" ||
    filtroGeriatricos ||
    busqueda.trim() !== "" ||
    inspectorFiltro !== "";

  const handleLimpiarFiltros = () => {
    setTipoFiltro("TODOS");
    setFiltroEstado("TODOS");
    setFiltroVentanaRutina("TODAS");
    setFiltroGeriatricos(false);
    setBusqueda("");
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
      {/* Topbar */}
      <div
        className="topbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="material-icons"
            style={{ fontSize: 24, color: "#0055A5" }}
          >
            fact_check
          </span>
          <div>
            <div className="topbar-title">Bandeja de Inspecciones</div>
            <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 1 }}>
              Control y seguimiento unificado de inspecciones por habilitación y
              de rutina
            </div>
          </div>
        </div>
      </div>

      <div
        className="page-content"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          padding: "20px",
        }}
      >
        {/* Sección de Filtros Adaptativa (2 Grupos de Tarjetas Grandes) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 16,
          }}
        >
          {/* GRUPO 1: TIPO DE INSPECCIÓN */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
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
              {tipoFiltro !== "TODOS" && (
                <button
                  onClick={() => handleCambiarTipo("TODOS")}
                  style={{
                    background: "#F1F5F9",
                    border: "none",
                    color: "#0284C7",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 13 }}>
                    clear
                  </span>
                  Ver todas ({countTotal})
                </button>
              )}
            </div>

            {/* 2 Botones Grupo 1 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {/* Botón 1.1: HABILITACIÓN */}
              <div
                onClick={() =>
                  handleCambiarTipo(
                    tipoFiltro === "HABILITACION" ? "TODOS" : "HABILITACION",
                  )
                }
                style={{
                  background:
                    tipoFiltro === "HABILITACION" ? "#ECFDF5" : "#FFFFFF",
                  border: `2px solid ${tipoFiltro === "HABILITACION" ? "#10B981" : "#E2E8F0"}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  boxShadow:
                    tipoFiltro === "HABILITACION"
                      ? "0 4px 14px rgba(16, 185, 129, 0.16)"
                      : "0 1px 2px rgba(0,0,0,0.02)",
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
                      color:
                        tipoFiltro === "HABILITACION" ? "#047857" : "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Habilitación
                  </span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background:
                        tipoFiltro === "HABILITACION" ? "#A7F3D0" : "#ECFDF5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: 18, color: "#059669" }}
                    >
                      verified
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#059669",
                    lineHeight: 1,
                  }}
                >
                  {countHabilitacion}
                </div>
                <div
                  style={{ fontSize: 11, color: "#64748B", fontWeight: 550 }}
                >
                  Trámites en Curso
                </div>
              </div>

              {/* Botón 1.2: RUTINA */}
              <div
                onClick={() =>
                  handleCambiarTipo(
                    tipoFiltro === "RUTINA" ? "TODOS" : "RUTINA",
                  )
                }
                style={{
                  background: tipoFiltro === "RUTINA" ? "#F0F9FF" : "#FFFFFF",
                  border: `2px solid ${tipoFiltro === "RUTINA" ? "#0284C7" : "#E2E8F0"}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  boxShadow:
                    tipoFiltro === "RUTINA"
                      ? "0 4px 14px rgba(2, 132, 199, 0.16)"
                      : "0 1px 2px rgba(0,0,0,0.02)",
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
                      color: tipoFiltro === "RUTINA" ? "#0369A1" : "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Rutina
                  </span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background:
                        tipoFiltro === "RUTINA" ? "#BAE6FD" : "#F0F9FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: 18, color: "#0284C7" }}
                    >
                      schedule
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#0284C7",
                    lineHeight: 1,
                  }}
                >
                  {countRutina}
                </div>
                <div
                  style={{ fontSize: 11, color: "#64748B", fontWeight: 550 }}
                >
                  Periódicas / Programadas
                </div>
              </div>
            </div>
          </div>

          {/* GRUPO 2: CONTEXTUAL SEGÚN EL TIPO SELECCIONADO */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  className="material-icons"
                  style={{
                    fontSize: 18,
                    color:
                      tipoFiltro === "RUTINA"
                        ? "#D97706"
                        : tipoFiltro === "HABILITACION"
                          ? "#059669"
                          : "#475569",
                  }}
                >
                  {tipoFiltro === "RUTINA" ? "alarm" : "filter_alt"}
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
                  {tipoFiltro === "RUTINA"
                    ? "Estados y Alertas de Rutina"
                    : tipoFiltro === "HABILITACION"
                      ? "Estados de Habilitación"
                      : "Estados de Inspección"}
                </span>
              </div>
              {((tipoFiltro === "RUTINA" &&
                (filtroVentanaRutina !== "TODAS" || filtroGeriatricos)) ||
                (tipoFiltro !== "RUTINA" && filtroEstado !== "TODOS")) && (
                <button
                  onClick={() => {
                    setFiltroEstado("TODOS");
                    setFiltroVentanaRutina("TODAS");
                    setFiltroGeriatricos(false);
                  }}
                  style={{
                    background: "#F1F5F9",
                    border: "none",
                    color: "#0284C7",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 13 }}>
                    clear
                  </span>
                  Ver todos
                </button>
              )}
            </div>

            {/* Sub-tarjetas dinámicas de Grupo 2 */}
            {tipoFiltro === "RUTINA" ? (
              /* Tarjetas para Rutina: Inspecciones Ordenadas + 4 Plazos + Refinamiento de Tipología */
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                    gap: 10,
                  }}
                >
                  {/* Botón Rutina 2.0: Inspecciones Ordenadas */}
                  <div
                    onClick={() =>
                      setFiltroVentanaRutina((prev) =>
                        prev === "ORDENADAS" ? "TODAS" : "ORDENADAS",
                      )
                    }
                    style={{
                      background:
                        filtroVentanaRutina === "ORDENADAS"
                          ? "#ECFDF5"
                          : "#FFFFFF",
                      border: `1.5px solid ${filtroVentanaRutina === "ORDENADAS" ? "#059669" : "#E2E8F0"}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      boxShadow:
                        filtroVentanaRutina === "ORDENADAS"
                          ? "0 3px 10px rgba(5, 150, 105, 0.15)"
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
                          color:
                            filtroVentanaRutina === "ORDENADAS"
                              ? "#047857"
                              : "#64748B",
                          textTransform: "uppercase",
                        }}
                      >
                        Ordenadas
                      </span>
                      <span
                        className="material-icons"
                        style={{
                          fontSize: 16,
                          color:
                            filtroVentanaRutina === "ORDENADAS"
                              ? "#047857"
                              : "#059669",
                        }}
                      >
                        playlist_add_check
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: "#059669",
                      }}
                    >
                      {countRutinasOrdenadas}
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>
                      En proceso
                    </div>
                  </div>
                  {/* Botón Rutina: Vencidos */}
                  <div
                    onClick={() =>
                      setFiltroVentanaRutina((prev) =>
                        prev === "CRITICO_VENCIDO"
                          ? "TODAS"
                          : "CRITICO_VENCIDO",
                      )
                    }
                    style={{
                      background:
                        filtroVentanaRutina === "CRITICO_VENCIDO"
                          ? "#FEF2F2"
                          : "#FFFFFF",
                      border: `1.5px solid ${filtroVentanaRutina === "CRITICO_VENCIDO" ? "#EF4444" : "#E2E8F0"}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      boxShadow:
                        filtroVentanaRutina === "CRITICO_VENCIDO"
                          ? "0 3px 10px rgba(239, 68, 68, 0.15)"
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
                          color: "#64748B",
                          textTransform: "uppercase",
                        }}
                      >
                        Vencidos
                      </span>
                      <span
                        className="material-icons"
                        style={{ fontSize: 16, color: "#EF4444" }}
                      >
                        error_outline
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: "#DC2626",
                      }}
                    >
                      {countVencidos}
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>
                      Asignados
                    </div>
                  </div>

                  {/* Botón Rutina: Próximos */}
                  <div
                    onClick={() =>
                      setFiltroVentanaRutina((prev) =>
                        prev === "ALERTA_T15" ? "TODAS" : "ALERTA_T15",
                      )
                    }
                    style={{
                      background:
                        filtroVentanaRutina === "ALERTA_T15"
                          ? "#FEF3C7"
                          : "#FFFFFF",
                      border: `1.5px solid ${filtroVentanaRutina === "ALERTA_T15" ? "#F59E0B" : "#E2E8F0"}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      boxShadow:
                        filtroVentanaRutina === "ALERTA_T15"
                          ? "0 3px 10px rgba(245, 158, 11, 0.15)"
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
                          color: "#64748B",
                          textTransform: "uppercase",
                        }}
                      >
                        Próximos
                      </span>
                      <span
                        className="material-icons"
                        style={{ fontSize: 16, color: "#D97706" }}
                      >
                        warning_amber
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: "#D97706",
                      }}
                    >
                      {countProximos}
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>
                      &lt; 15 días
                    </div>
                  </div>

                  {/* Botón Rutina: En Plazo */}
                  <div
                    onClick={() =>
                      setFiltroVentanaRutina((prev) =>
                        prev === "ALERTA_T30" ? "TODAS" : "ALERTA_T30",
                      )
                    }
                    style={{
                      background:
                        filtroVentanaRutina === "ALERTA_T30"
                          ? "#EFF6FF"
                          : "#FFFFFF",
                      border: `1.5px solid ${filtroVentanaRutina === "ALERTA_T30" ? "#3B82F6" : "#E2E8F0"}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      boxShadow:
                        filtroVentanaRutina === "ALERTA_T30"
                          ? "0 3px 10px rgba(59, 130, 246, 0.15)"
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
                          color: "#64748B",
                          textTransform: "uppercase",
                        }}
                      >
                        En Plazo
                      </span>
                      <span
                        className="material-icons"
                        style={{ fontSize: 16, color: "#2563EB" }}
                      >
                        schedule
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: "#2563EB",
                      }}
                    >
                      {countEnPlazo}
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>
                      &lt; 30 días
                    </div>
                  </div>

                  {/* Botón Rutina: Mayor a 30 días (> 30 días) */}
                  <div
                    onClick={() =>
                      setFiltroVentanaRutina((prev) =>
                        prev === "AL_DIA" ? "TODAS" : "AL_DIA",
                      )
                    }
                    style={{
                      background:
                        filtroVentanaRutina === "AL_DIA"
                          ? "#ECFDF5"
                          : "#FFFFFF",
                      border: `1.5px solid ${filtroVentanaRutina === "AL_DIA" ? "#10B981" : "#E2E8F0"}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      boxShadow:
                        filtroVentanaRutina === "AL_DIA"
                          ? "0 3px 10px rgba(16, 185, 129, 0.15)"
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
                          color: "#64748B",
                          textTransform: "uppercase",
                        }}
                      >
                        Al Día
                      </span>
                      <span
                        className="material-icons"
                        style={{ fontSize: 16, color: "#059669" }}
                      >
                        event_available
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: "#059669",
                      }}
                    >
                      {countMayor30}
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>
                      &gt; 30 días
                    </div>
                  </div>
                </div>

                {/* Modificador / Refinamiento de Tipología (Geriátricos) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTop: "1px solid #F1F5F9",
                    marginTop: 2,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#64748B",
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      Refinar:
                    </span>
                    <button
                      type="button"
                      onClick={() => setFiltroGeriatricos(!filtroGeriatricos)}
                      style={{
                        background: filtroGeriatricos ? "#7C3AED" : "#F5F3FF",
                        color: filtroGeriatricos ? "#FFFFFF" : "#6D28D9",
                        border: `1.5px solid ${filtroGeriatricos ? "#7C3AED" : "#DDD6FE"}`,
                        borderRadius: 20,
                        padding: "4px 10px",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxSizing: "border-box",
                        transition:
                          "background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
                        boxShadow: filtroGeriatricos
                          ? "0 2px 6px rgba(124, 58, 237, 0.25)"
                          : "none",
                      }}
                    >
                      <span
                        className="material-icons"
                        style={{
                          fontSize: 15,
                          width: 15,
                          height: 15,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        local_hospital
                      </span>
                      <span style={{ whiteSpace: "nowrap" }}>
                        Solo Geriátricos
                      </span>
                      <span
                        style={{
                          background: filtroGeriatricos
                            ? "rgba(255,255,255,0.25)"
                            : "#EDE9FE",
                          color: filtroGeriatricos ? "#FFFFFF" : "#7C3AED",
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: "1px 6px",
                          borderRadius: 10,
                          minWidth: 18,
                          textAlign: "center",
                          boxSizing: "border-box",
                          display: "inline-block",
                        }}
                      >
                        {countGeriatricos}
                      </span>
                    </button>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#94A3B8",
                      fontStyle: "italic",
                    }}
                  >
                    3 por año
                  </span>
                </div>
              </div>
            ) : (
              /* Tarjetas para Habilitación o Todas */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: 10,
                }}
              >
                {/* Botón Estado: Pendientes */}
                <div
                  onClick={() =>
                    setFiltroEstado((prev) =>
                      prev === "PENDIENTES" ? "TODOS" : "PENDIENTES",
                    )
                  }
                  style={{
                    background:
                      filtroEstado === "PENDIENTES" ? "#F0F9FF" : "#FFFFFF",
                    border: `1.5px solid ${filtroEstado === "PENDIENTES" ? "#0284C7" : "#E2E8F0"}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    boxShadow:
                      filtroEstado === "PENDIENTES"
                        ? "0 3px 10px rgba(2, 132, 199, 0.15)"
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
                        color: "#64748B",
                        textTransform: "uppercase",
                      }}
                    >
                      Por Iniciar
                    </span>
                    <span
                      className="material-icons"
                      style={{ fontSize: 16, color: "#0284C7" }}
                    >
                      play_circle_outline
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 20, fontWeight: 900, color: "#0284C7" }}
                  >
                    {countPendientes}
                  </div>
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>
                    Listas para acta
                  </div>
                </div>

                {/* Botón Estado: Observadas */}
                <div
                  onClick={() =>
                    setFiltroEstado((prev) =>
                      prev === "OBSERVADAS" ? "TODOS" : "OBSERVADAS",
                    )
                  }
                  style={{
                    background:
                      filtroEstado === "OBSERVADAS" ? "#FFF7ED" : "#FFFFFF",
                    border: `1.5px solid ${filtroEstado === "OBSERVADAS" ? "#EA580C" : "#E2E8F0"}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    boxShadow:
                      filtroEstado === "OBSERVADAS"
                        ? "0 3px 10px rgba(234, 88, 12, 0.15)"
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
                        color: "#64748B",
                        textTransform: "uppercase",
                      }}
                    >
                      Observadas
                    </span>
                    <span
                      className="material-icons"
                      style={{ fontSize: 16, color: "#EA580C" }}
                    >
                      rate_review
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 20, fontWeight: 900, color: "#EA580C" }}
                  >
                    {countObservadas}
                  </div>
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>
                    Acta observada
                  </div>
                </div>

                {/* Botón Estado: Respuesta Emplazamiento */}
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
                    border: `1.5px solid ${filtroEstado === "RESPUESTA_EMPLAZAMIENTO" ? "#D97706" : "#E2E8F0"}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    boxShadow:
                      filtroEstado === "RESPUESTA_EMPLAZAMIENTO"
                        ? "0 3px 10px rgba(217, 119, 6, 0.15)"
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
                        color: "#64748B",
                        textTransform: "uppercase",
                      }}
                    >
                      Resp. Emplazamiento
                    </span>
                    <span
                      className="material-icons"
                      style={{ fontSize: 16, color: "#D97706" }}
                    >
                      assignment_returned
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 20, fontWeight: 900, color: "#D97706" }}
                  >
                    {countRespuestaEmplazamiento}
                  </div>
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>
                    Revisar respuestas
                  </div>
                </div>

                {/* Botón Estado: Aprobadas */}
                <div
                  onClick={() =>
                    setFiltroEstado((prev) =>
                      prev === "APROBADAS" ? "TODOS" : "APROBADAS",
                    )
                  }
                  style={{
                    background:
                      filtroEstado === "APROBADAS" ? "#ECFDF5" : "#FFFFFF",
                    border: `1.5px solid ${filtroEstado === "APROBADAS" ? "#10B981" : "#E2E8F0"}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    boxShadow:
                      filtroEstado === "APROBADAS"
                        ? "0 3px 10px rgba(16, 185, 129, 0.15)"
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
                        color: "#64748B",
                        textTransform: "uppercase",
                      }}
                    >
                      Aprobadas
                    </span>
                    <span
                      className="material-icons"
                      style={{ fontSize: 16, color: "#059669" }}
                    >
                      verified
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 20, fontWeight: 900, color: "#059669" }}
                  >
                    {countAprobadas}
                  </div>
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>
                    Favorables
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Barra de Búsqueda y Filtro de Inspector (Autocomplete) */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            padding: "12px 16px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
            display: "grid",
            gridTemplateColumns: "minmax(280px, 1fr) minmax(260px, 340px)",
            gap: 14,
            alignItems: "center",
          }}
        >
          {/* Buscador de texto */}
          <div style={{ position: "relative" }}>
            <span
              className="material-icons"
              style={{
                position: "absolute",
                left: 12,
                top: 10,
                color: "#94A3B8",
                fontSize: 18,
              }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por establecimiento, CUIT, expediente, inspector o localidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 36px 9px 38px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
                outline: "none",
                background: "#F8FAFC",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#0284c7";
                e.currentTarget.style.background = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#CBD5E1";
                e.currentTarget.style.background = "#F8FAFC";
              }}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 2,
                }}
                title="Borrar búsqueda"
              >
                <span className="material-icons" style={{ fontSize: 18 }}>
                  cancel
                </span>
              </button>
            )}
          </div>

          {/* Autocomplete de Inspector */}
          <div ref={autocompleteRef} style={{ position: "relative" }}>
            <div style={{ position: "relative" }}>
              <span
                className="material-icons"
                style={{
                  position: "absolute",
                  left: 12,
                  top: 10,
                  color: inspectorFiltro ? "#0055A5" : "#94A3B8",
                  fontSize: 18,
                }}
              >
                person_search
              </span>
              <input
                type="text"
                placeholder="Filtrar por inspector..."
                value={
                  isInspectorMenuOpen
                    ? inspectorSearchText
                    : inspectorFiltro
                      ? inspectorFiltro
                      : ""
                }
                onChange={(e) => {
                  setInspectorSearchText(e.target.value);
                  if (!isInspectorMenuOpen) setIsInspectorMenuOpen(true);
                }}
                onFocus={() => {
                  setIsInspectorMenuOpen(true);
                  setInspectorSearchText("");
                }}
                style={{
                  width: "100%",
                  padding: "9px 34px 9px 38px",
                  borderRadius: 8,
                  border: `1.5px solid ${inspectorFiltro ? "#0055A5" : "#CBD5E1"}`,
                  fontSize: 13,
                  fontWeight: inspectorFiltro ? 650 : 400,
                  outline: "none",
                  background: inspectorFiltro ? "#F0F9FF" : "#F8FAFC",
                  color: inspectorFiltro ? "#0055A5" : "#0F172A",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                  cursor: "pointer",
                }}
              />
              {inspectorFiltro ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectorFiltro("");
                    setInspectorSearchText("");
                  }}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    background: "transparent",
                    border: "none",
                    color: "#64748B",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 2,
                  }}
                  title="Ver todos los inspectores"
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>
                    cancel
                  </span>
                </button>
              ) : (
                <span
                  className="material-icons"
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    color: "#94A3B8",
                    fontSize: 18,
                    pointerEvents: "none",
                    transform: isInspectorMenuOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                >
                  expand_more
                </span>
              )}
            </div>

            {/* Dropdown Menu Autocomplete */}
            {isInspectorMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                  zIndex: 50,
                  maxHeight: 280,
                  overflowY: "auto",
                  padding: "6px",
                }}
              >
                {/* Opción 0: Todos los Inspectores */}
                <div
                  onClick={() => {
                    setInspectorFiltro("");
                    setInspectorSearchText("");
                    setIsInspectorMenuOpen(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background:
                      inspectorFiltro === "" ? "#F1F5F9" : "transparent",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F8FAFC")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      inspectorFiltro === "" ? "#F1F5F9" : "transparent")
                  }
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: 18, color: "#64748B" }}
                    >
                      groups
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: inspectorFiltro === "" ? 700 : 500,
                        color: "#1E293B",
                      }}
                    >
                      Todos los Inspectores
                    </span>
                  </div>
                  <span
                    style={{
                      background: "#E2E8F0",
                      color: "#475569",
                      fontSize: 11,
                      fontWeight: 750,
                      padding: "2px 7px",
                      borderRadius: 10,
                    }}
                  >
                    {inspeccionesBase.length}
                  </span>
                </div>

                {/* Opción 1: Usuario Logueado (Primera opción destacada) */}
                {miNombreInspector &&
                  (!inspectorSearchText ||
                    miNombreInspector
                      .toLowerCase()
                      .includes(inspectorSearchText.toLowerCase())) && (
                    <div
                      onClick={() => {
                        setInspectorFiltro(miNombreInspector);
                        setInspectorSearchText(miNombreInspector);
                        setIsInspectorMenuOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background:
                          inspectorFiltro === miNombreInspector
                            ? "#E0F2FE"
                            : "#F0F9FF",
                        border: "1px solid #BAE6FD",
                        margin: "3px 0",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#E0F2FE")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          inspectorFiltro === miNombreInspector
                            ? "#E0F2FE"
                            : "#F0F9FF")
                      }
                    >
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
                            background: "#0284C7",
                            color: "white",
                            fontSize: 11,
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {user?.avatar ||
                            (user
                              ? `${user.nombre?.[0] || ""}${user.apellido?.[0] || ""}`
                              : "YO")}
                        </div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 750,
                                color: "#0369A1",
                              }}
                            >
                              {miNombreInspector}
                            </span>
                            <span
                              style={{
                                background: "#0284C7",
                                color: "#FFFFFF",
                                fontSize: 9.5,
                                fontWeight: 800,
                                padding: "1px 6px",
                                borderRadius: 6,
                                textTransform: "uppercase",
                                letterSpacing: 0.3,
                              }}
                            >
                              Mi usuario
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "#0284C7" }}>
                            Tus inspecciones asignadas
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          background: "#BAE6FD",
                          color: "#0369A1",
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 10,
                        }}
                      >
                        {getInspectorCount(miNombreInspector)}
                      </span>
                    </div>
                  )}

                {/* Línea divisoria que separa al usuario logueado del resto */}
                <div
                  style={{
                    height: 1,
                    background: "#E2E8F0",
                    margin: "6px 4px 4px 4px",
                  }}
                />

                {/* Resto de inspectores */}
                {restoInspectores
                  .filter(
                    (n) =>
                      !inspectorSearchText ||
                      n
                        .toLowerCase()
                        .includes(inspectorSearchText.toLowerCase()),
                  )
                  .map((nombre) => {
                    const count = getInspectorCount(nombre);
                    const isSelected = inspectorFiltro === nombre;
                    return (
                      <div
                        key={nombre}
                        onClick={() => {
                          setInspectorFiltro(nombre);
                          setInspectorSearchText(nombre);
                          setIsInspectorMenuOpen(false);
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: isSelected ? "#F1F5F9" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#F8FAFC")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = isSelected
                            ? "#F1F5F9"
                            : "transparent")
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "#F1F5F9",
                              color: "#64748B",
                              fontSize: 10.5,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: isSelected ? 700 : 500,
                              color: "#334155",
                            }}
                          >
                            {nombre}
                          </span>
                        </div>
                        <span
                          style={{
                            background: "#F1F5F9",
                            color: "#64748B",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 10,
                          }}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}

                {/* Mensaje de no coincidencias */}
                {inspectorSearchText &&
                  !miNombreInspector
                    .toLowerCase()
                    .includes(inspectorSearchText.toLowerCase()) &&
                  restoInspectores.filter((n) =>
                    n.toLowerCase().includes(inspectorSearchText.toLowerCase()),
                  ).length === 0 && (
                    <div
                      style={{
                        padding: "14px",
                        textAlign: "center",
                        color: "#94A3B8",
                        fontSize: 12.5,
                      }}
                    >
                      No se encontraron inspectores con "{inspectorSearchText}"
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Tabla Unificada de Inspecciones */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
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
              <tr
                style={{
                  background: "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: 11,
                    fontWeight: 750,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Establecimiento / CUIT
                </th>
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: 11,
                    fontWeight: 750,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Trámite / Expediente
                </th>
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: 11,
                    fontWeight: 750,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Tipo / Formato
                </th>
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: 11,
                    fontWeight: 750,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Fecha última inspección
                </th>
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: 11,
                    fontWeight: 750,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Inspector
                </th>
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: 11,
                    fontWeight: 750,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Estado
                </th>
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: 11,
                    fontWeight: 750,
                    color: "#475569",
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
                    colSpan={7}
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
                      {hasActiveFilters ? "filter_list_off" : "fact_check"}
                    </span>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#0F172A",
                      }}
                    >
                      {hasActiveFilters
                        ? "No se encontraron inspecciones con los filtros aplicados"
                        : "No hay inspecciones registradas"}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "#94A3B8",
                        marginTop: 4,
                        marginBottom: hasActiveFilters ? 14 : 0,
                      }}
                    >
                      {hasActiveFilters
                        ? "Probá modificando el término de búsqueda o restableciendo los filtros."
                        : "Todas las inspecciones se encuentran completas."}
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={handleLimpiarFiltros}
                        style={{
                          background: "#0284c7",
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
                          boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)",
                        }}
                      >
                        <span
                          className="material-icons"
                          style={{ fontSize: 16 }}
                        >
                          restart_alt
                        </span>
                        Restablecer todos los filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                inspeccionesPaginadas.map((t) => {
                  const conf = ESTADO_CONFIG[t.estado];
                  const esRutina = t.tipoInspeccion === "RUTINA";
                  const assignedName =
                    t.inspectorAsignado || t.agenteAsignado || "Sin asignar";
                  const esMiAsignacion =
                    (user?.apellido &&
                      assignedName
                        .toLowerCase()
                        .includes(user.apellido.toLowerCase())) ||
                    (user?.nombre &&
                      assignedName
                        .toLowerCase()
                        .includes(user.nombre.toLowerCase()));

                  return (
                    <tr
                      key={t.id}
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      {/* Establecimiento */}
                      <td
                        style={{ padding: "14px 18px", verticalAlign: "top" }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#0F172A",
                            fontSize: 13.5,
                          }}
                        >
                          {t.denominacion}
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "#64748B",
                            fontFamily: "monospace",
                            marginTop: 2,
                          }}
                        >
                          CUIT: {t.cuit}
                        </div>
                        {t.tipologia && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#94A3B8",
                              marginTop: 2,
                            }}
                          >
                            {t.tipologia}
                          </div>
                        )}
                      </td>

                      {/* Trámite / Expediente */}
                      <td
                        style={{ padding: "14px 18px", verticalAlign: "top" }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#0055A5",
                            fontSize: 13,
                          }}
                        >
                          {t.nroTramite}
                        </div>
                        {t.nroExpediente && (
                          <div
                            style={{
                              fontSize: 11.5,
                              color: "#64748B",
                              fontFamily: "monospace",
                              marginTop: 2,
                            }}
                          >
                            {t.nroExpediente}
                          </div>
                        )}
                      </td>

                      {/* Tipo y Formato Unificados */}
                      <td
                        style={{ padding: "14px 18px", verticalAlign: "top" }}
                      >
                        <div>
                          <span
                            style={{
                              background: esRutina ? "#E0F2FE" : "#ECFDF5",
                              color: esRutina ? "#0369A1" : "#047857",
                              fontWeight: 800,
                              fontSize: 11,
                              padding: "3px 8px",
                              borderRadius: 7,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: 13 }}
                            >
                              {esRutina ? "schedule" : "verified"}
                            </span>
                            {esRutina ? "Rutina" : "Habilitación"}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "#64748B",
                            fontWeight: 550,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 6,
                          }}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: 15, color: "#94A3B8" }}
                          >
                            {t.formatoInspeccion === "VIRTUAL"
                              ? "devices"
                              : "business"}
                          </span>
                          {t.formatoInspeccion === "VIRTUAL"
                            ? "Virtual"
                            : "Presencial"}
                        </div>
                      </td>

                      {/* Fecha última inspección */}
                      <td
                        style={{ padding: "14px 18px", verticalAlign: "top" }}
                      >
                        {(() => {
                          const fecha =
                            t.fechaUltimaInspeccion ||
                            t.ultimaInspeccionFecha ||
                            (t.tipoInspeccion === "RUTINA"
                              ? t.fechaIngreso
                              : undefined);

                          if (!fecha) {
                            return (
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "#94A3B8",
                                  fontStyle: "italic",
                                }}
                              >
                                Sin registro previo
                              </span>
                            );
                          }

                          const formatted = fecha.includes("-")
                            ? fecha.split("-").reverse().join("/")
                            : fecha;

                          return (
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                padding: "4px 8px",
                                borderRadius: 6,
                                fontSize: 12.5,
                                fontWeight: 650,
                                color: "#334155",
                              }}
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: 15, color: "#64748B" }}
                              >
                                event
                              </span>
                              <span>{formatted}</span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Inspector (Soporte Multi-Inspector) */}
                      <td
                        style={{ padding: "14px 18px", verticalAlign: "top" }}
                      >
                        {(() => {
                          const inspectores = getInspectoresTramite(t);
                          if (inspectores.length === 0) {
                            return (
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "#94A3B8",
                                  fontStyle: "italic",
                                }}
                              >
                                Sin asignar
                              </span>
                            );
                          }

                          return (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                              }}
                            >
                              {inspectores.map((nombre, idx) => {
                                const esMiAsig =
                                  (user?.apellido &&
                                    nombre
                                      .toLowerCase()
                                      .includes(user.apellido.toLowerCase())) ||
                                  (user?.nombre &&
                                    nombre
                                      .toLowerCase()
                                      .includes(user.nombre.toLowerCase()));

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 7,
                                      fontSize: 12.5,
                                      fontWeight: 650,
                                      color: "#334155",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        background: esMiAsig
                                          ? "#E0F2FE"
                                          : "#F1F5F9",
                                        color: esMiAsig ? "#0284C7" : "#64748B",
                                        border: `1px solid ${esMiAsig ? "#BAE6FD" : "#E2E8F0"}`,
                                        fontSize: 9.5,
                                        fontWeight: 800,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {nombre.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span style={{ lineHeight: 1.2 }}>
                                      {nombre}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Estado */}
                      <td
                        style={{ padding: "14px 18px", verticalAlign: "top" }}
                      >
                        <span
                          className={`badge ${conf?.badge || "badge-neutral"}`}
                          style={{
                            fontWeight: 750,
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 12,
                            display: "inline-block",
                          }}
                        >
                          {conf?.label || t.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td
                        style={{
                          padding: "14px 18px",
                          verticalAlign: "top",
                          textAlign: "center",
                        }}
                      >
                        {isCoordinador ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                            }}
                          >
                            {/* Botón 1 Coordinador: Ver Acta */}
                            <button
                              onClick={() => {}}
                              title="Ver Acta de Inspección Completa"
                              style={{
                                background: "#EFF6FF",
                                color: "#0055A5",
                                border: "1.5px solid #BAE6FD",
                                borderRadius: 7,
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 750,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#0055A5";
                                e.currentTarget.style.color = "#FFFFFF";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#EFF6FF";
                                e.currentTarget.style.color = "#0055A5";
                              }}
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: 15 }}
                              >
                                article
                              </span>
                              Ver Acta
                            </button>

                            {/* Botón 2 Coordinador: Emitir orden de inspección por rutina */}
                            <button
                              onClick={() => setTramiteEmitirOrden(t)}
                              title="Emitir orden de inspección por rutina"
                              style={{
                                background: "#10B981",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: 7,
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 750,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                boxShadow: "0 2px 4px rgba(16, 185, 129, 0.25)",
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#059669")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "#10B981")
                              }
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: 15 }}
                              >
                                schedule_send
                              </span>
                              Emitir Orden Rutina
                            </button>

                            <TableActionsMenu
                              options={[
                                {
                                  label: "Descargar Acta",
                                  icon: "download",
                                  onClick: () =>
                                    alert(
                                      `Descargando Acta de Inspección de ${t.denominacion}...`,
                                    ),
                                },
                              ]}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                            }}
                          >
                            {t.estado === "ACEPTADO_DOC_AUD" ? (
                              <button
                                onClick={() =>
                                  handleAbrirInspeccion(t.id, t.estado)
                                }
                                style={{
                                  background: "#0055A5",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 7,
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  boxShadow: "0 2px 4px rgba(0, 85, 165, 0.2)",
                                }}
                              >
                                <span
                                  className="material-icons"
                                  style={{ fontSize: 15 }}
                                >
                                  play_arrow
                                </span>
                                Iniciar
                              </button>
                            ) : t.estado === "DESCARGO_INSP" ? (
                              <button
                                onClick={() => handleVerValidacion(t.id)}
                                style={{
                                  background: "#D97706",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 7,
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  boxShadow:
                                    "0 2px 4px rgba(217, 119, 6, 0.25)",
                                }}
                              >
                                <span
                                  className="material-icons"
                                  style={{ fontSize: 15 }}
                                >
                                  fact_check
                                </span>
                                Revisar
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleAbrirInspeccion(t.id, t.estado)
                                }
                                style={{
                                  background: "#F8FAFC",
                                  color: "#0055A5",
                                  border: "1px solid #CBD5E1",
                                  borderRadius: 7,
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <span
                                  className="material-icons"
                                  style={{ fontSize: 15 }}
                                >
                                  visibility
                                </span>
                                Ver
                              </button>
                            )}

                            <TableActionsMenu
                              options={[
                                {
                                  label:
                                    t.estado === "DESCARGO_INSP"
                                      ? "Revisar Respuestas"
                                      : "Ver Validación",
                                  icon: "fact_check",
                                  onClick: () => handleVerValidacion(t.id),
                                },
                                {
                                  label: "Ir a Inspección",
                                  icon: "edit_note",
                                  onClick: () =>
                                    handleAbrirInspeccion(t.id, t.estado),
                                },
                              ]}
                            />
                          </div>
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
    </>
  );
}
