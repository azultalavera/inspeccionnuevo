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
import ModalTramiteEnCursoDetectado from "../components/ModalTramiteEnCursoDetectado";
import ModalNuevoEstablecimientoRutina from "../components/ModalNuevoEstablecimientoRutina";

export default function BandejaInspecciones() {
  const { user } = useAuth();
  const { tramites, iniciarInspeccion, agregarTramite, actualizarTramite, eliminarTramite } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const STORAGE_KEY_RUTINA = "clicsalud_establecimientos_rutina";

  // Trámite de Radiofísica con respuesta de emplazamiento para revisión por parte del inspector
  const TRAMITE_RADIOFISICA_DESCARGO_DEFAULT: Tramite = {
    id: "TRM-RAD-002",
    nroTramite: "2026-HAB-009102",
    nroExpediente: "EX-2026-0091020-APN-MS#CBA",
    denominacion: "Centro Radiológico San Francisco - Radiofísica",
    cuit: "30-71829340-5",
    tipologia: "RADIOFÍSICA",
    tipoServicio: "Rayos X",
    subservicio: "Radiología Convencional Simple",
    domicilio: "Av. Vélez Sarsfield 1450",
    localidad: "Córdoba",
    departamento: "Capital",
    estado: "DESCARGO_INSP",
    estadoActa: "RESPUESTA EMPLAZAMIENTO",
    fechaIngreso: "2026-06-15",
    fechaUltimaInspeccion: "15/07/2026",
    inspectorAsignado: "Valeria Romero",
    agenteAsignado: "Valeria Romero",
    inspectoresAsignados: ["Valeria Romero"],
    tipoInspeccion: "RUTINA",
    formatoInspeccion: "PRESENCIAL",
    tipoTramite: "HABILITACION",
    nroActa: 105,
    alertaRutina: "CRITICO_VENCIDO",
    emplazamiento: {
      actaNumero: "105/2026",
      diasRestantes: 5,
      fechaVencimiento: "21/07/2026",
      faltasCriticasCount: 4,
      observaciones: [
        "Dosimetría: Empresa",
        "Materialidad de la sala: Búnker NO CUMPLE",
        "Responsable de uso: documento de autorizacion individual no es correcto",
        "Equipamiento: no corresponden Marca: SIEMENS, Condición: Propio, Año fabricación: 2000, Tipo revelado: DIGITAL",
      ],
      respuestaEmplazamientoRealizada: true,
    },
  };

  // Grilla de rutina: incluye el trámite de radiofísica con descargo para revisión del inspector
  const [establecimientosRutina, setEstablecimientosRutina] = useState<Tramite[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RUTINA);
    let list: Tramite[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {
        console.error(e);
      }
    }

    const tieneRadiofisicaDescargo = list.some(
      (t) =>
        t.id === "TRM-RAD-002" ||
        ((t.tipologia?.toUpperCase().includes("RADIOFÍSICA") ||
          t.tipologia?.toUpperCase().includes("RADIOFISICA") ||
          t.denominacion?.toUpperCase().includes("RADIOFÍSICA") ||
          t.denominacion?.toUpperCase().includes("RADIOFISICA")) &&
          (t.estado === "DESCARGO_INSP" || t.estadoActa === "RESPUESTA EMPLAZAMIENTO"))
    );

    if (!tieneRadiofisicaDescargo) {
      list = [...list, TRAMITE_RADIOFISICA_DESCARGO_DEFAULT];
      localStorage.setItem(STORAGE_KEY_RUTINA, JSON.stringify(list));
    }

    return list;
  });

  const guardarEstablecimientos = (lista: Tramite[]) => {
    setEstablecimientosRutina(lista);
    localStorage.setItem(STORAGE_KEY_RUTINA, JSON.stringify(lista));
  };

  // Sincronizar cambios desde AppContext si algún trámite fue actualizado (ej. tras cierre de acta)
  useEffect(() => {
    if (tramites && tramites.length > 0 && establecimientosRutina.length > 0) {
      setEstablecimientosRutina((prev) =>
        prev.map((est) => {
          const found = tramites.find((t) => t.id === est.id);
          return found ? { ...est, ...found } : est;
        })
      );
    }
  }, [tramites]);

  const [modalNuevoEstablecimientoOpen, setModalNuevoEstablecimientoOpen] = useState(false);
  const [tipoModalNuevo, setTipoModalNuevo] = useState<"ESTABLECIMIENTO" | "SERVICIO_DIFERENCIADO">("ESTABLECIMIENTO");
  const [menuAgregarOpen, setMenuAgregarOpen] = useState(false);
  const menuAgregarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuAgregarRef.current &&
        !menuAgregarRef.current.contains(event.target as Node)
      ) {
        setMenuAgregarOpen(false);
      }
    };
    if (menuAgregarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuAgregarOpen]);

  const handleGuardarNuevoEstablecimiento = (nuevo: Tramite) => {
    const updated = [nuevo, ...establecimientosRutina];
    guardarEstablecimientos(updated);
    agregarTramite(nuevo);
    setModalNuevoEstablecimientoOpen(false);
  };

  const handleEliminarEstablecimiento = (id: string, denominacion: string) => {
    if (window.confirm(`¿Está seguro de eliminar "${denominacion}" de la grilla?`)) {
      const updated = establecimientosRutina.filter((t) => t.id !== id);
      guardarEstablecimientos(updated);
      eliminarTramite(id);
    }
  };

  const handleVaciarGrilla = () => {
    if (
      window.confirm(
        "¿Está seguro de que desea vaciar todos los establecimientos de la grilla?"
      )
    ) {
      establecimientosRutina.forEach((t) => eliminarTramite(t.id));
      guardarEstablecimientos([]);
    }
  };

  const [localTramites, setLocalTramites] = useState<Tramite[]>(TRAMITES);

  useEffect(() => {
    if (tramites && tramites.length > 0) {
      setLocalTramites(tramites);
    }
  }, [tramites]);

  // Scope Filter: esta pantalla de control y gestión queda exclusivamente para Rutina
  const [filtroRutina, setFiltroRutina] = useState<
    "TODOS" | "ORDENES" | "VENCIDOS" | "PROXIMOS" | "EN_PLAZO" | "AL_DIA" | "SIN_FECHA"
  >("TODOS");

  useEffect(() => {
    if (location.state?.filtroRutina) {
      setFiltroRutina(location.state.filtroRutina);
    } else if (location.state?.filtroVentanaRutina) {
      if (location.state.filtroVentanaRutina === "CRITICO_VENCIDO") setFiltroRutina("VENCIDOS");
      else if (location.state.filtroVentanaRutina === "ALERTA_T15") setFiltroRutina("PROXIMOS");
      else if (location.state.filtroVentanaRutina === "ALERTA_T30") setFiltroRutina("EN_PLAZO");
      else if (location.state.filtroVentanaRutina === "AL_DIA") setFiltroRutina("AL_DIA");
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
  const [soloGeriatricos, setSoloGeriatricos] = useState<boolean>(false);

  const [paginaSeleccionada, setPaginaSeleccionada] = useState(1);
  const [cantidadFilasPorPagina, setCantidadFilasPorPagina] = useState(10);

  // Coordinator Modal States: true only when Coordinator role/route and NOT explicitly Inspector route
  const isCoordinador =
    location.pathname.includes("/coordinador") ||
    (user?.rol === "COORDINADOR" && !location.pathname.includes("/inspector"));
  const [tramiteEmitirOrden, setTramiteEmitirOrden] = useState<Tramite | null>(
    null,
  );
  const [tramiteSolapamientoDetectado, setTramiteSolapamientoDetectado] =
    useState<Tramite | null>(null);

  const handleSolicitarEmitirOrden = (t: Tramite) => {
    if (
      t.nroExpediente === "0425-014523/2026" ||
      t.tramiteActivoEnCurso ||
      t.solapamientoTramiteId
    ) {
      setTramiteSolapamientoDetectado(t);
    } else {
      setTramiteEmitirOrden(t);
    }
  };

  // Radiofísica Modal States
  const [modalRadiofisicaOpen, setModalRadiofisicaOpen] = useState(false);
  const [tramiteRadiofisica, setTramiteRadiofisica] = useState<Tramite | null>(null);

  const handleIniciar = (t: Tramite) => {
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

    iniciarInspeccion(t.id);
    const basePath = isCoordinador ? "/coordinador/inspeccion" : "/inspector/inspeccion";
    navigate(`${basePath}/${t.id}`);
  };

  const handleContinuar = (t: Tramite) => {
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

    const basePath = isCoordinador ? "/coordinador/inspeccion" : "/inspector/inspeccion";
    navigate(`${basePath}/${t.id}`);
  };

  const handleRevisar = (t: Tramite) => {
    navigate(`/inspector/revision-acta/${t.id}`);
  };

  const handleVisualizar = (t: Tramite) => {
    const basePath = isCoordinador ? "/coordinador/ver-tramite" : "/inspector/ver-tramite";
    navigate(`${basePath}/${t.id}`);
  };

  const handleIniciarOContinuar = (t: Tramite) => {
    if (t.estado === "ACEPTADO_DOC_AUD") {
      handleIniciar(t);
    } else if (t.estado === "DESCARGO_INSP") {
      handleRevisar(t);
    } else if (t.estado === "EN_ANALISIS_AUD" || t.estado === "RE_INSP_SOLICITADA") {
      handleContinuar(t);
    } else {
      handleVisualizar(t);
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
    if (!f || f.trim() === "" || f === "-") return "Sin registrar";
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

  useEffect(() => {
    setPaginaSeleccionada(1);
  }, [
    filtroRutina,
    soloGeriatricos,
    filtroNombre,
    filtroCuit,
    filtroExpediente,
    filtroDepartamento,
    filtroLocalidad,
    inspectorFiltro,
  ]);

  // Inspecciones base: exclusivamente Rutina sobre Establecimientos Habilitados (inicia vacía)
  const inspeccionesBase = useMemo(() => {
    return establecimientosRutina;
  }, [establecimientosRutina]);

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
    const den = (t.denominacion || "").toLowerCase();
    return (
      tip.includes("geriátrico") ||
      tip.includes("geriatrico") ||
      tip.includes("geriátricos") ||
      tip.includes("geriatricos") ||
      tip.includes("residencia") ||
      den.includes("geriátrico") ||
      den.includes("geriatrico") ||
      den.includes("geriátricos") ||
      den.includes("geriatricos") ||
      den.includes("residencia") ||
      den.includes("hogar") ||
      t.frecuenciaRutinaAnual === 3
    );
  };

  const getCantidadInspeccionesStr = (t: Tramite) => {
    if (t.inspeccionesRealizadasAno !== undefined && t.inspeccionesRealizadasAno !== null) {
      return `${t.inspeccionesRealizadasAno}/3`;
    }
    const hash = (t.id || t.denominacion || "")
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = hash % 2 === 0 ? 2 : 1;
    return `${count}/3`;
  };

  // Filtrado final sobre Rutina
  const filtradas = inspeccionesPorInspector.filter((t) => {
    // 0. Filtro Solo Geriátricos
    if (soloGeriatricos && !isGeriatrico(t)) {
      return false;
    }

    // 1. Filtro de Rutina seleccionado por las tarjetas
    if (filtroRutina === "ORDENES") {
      if (
        !["ACEPTADO_DOC_AUD", "EN_ANALISIS_AUD", "OBSERVADO_INSP", "DESCARGO_INSP", "RE_INSP_SOLICITADA"].includes(
          t.estado
        )
      )
        return false;
    } else if (filtroRutina === "VENCIDOS") {
      if (t.alertaRutina !== "CRITICO_VENCIDO") return false;
    } else if (filtroRutina === "PROXIMOS") {
      if (t.alertaRutina !== "ALERTA_T15") return false;
    } else if (filtroRutina === "EN_PLAZO") {
      if (t.alertaRutina !== "ALERTA_T30") return false;
    } else if (filtroRutina === "AL_DIA") {
      if (t.alertaRutina !== "AL_DIA") return false;
    } else if (filtroRutina === "SIN_FECHA") {
      const isGer = isGeriatrico(t);
      const tieneSinFecha =
        t.alertaRutina === "SIN_FECHA" ||
        (!isGer && (!t.fechaUltimaInspeccion || t.fechaUltimaInspeccion.trim() === "" || t.fechaUltimaInspeccion === "-")) ||
        (isGer && !t.fechaHabilitacion && (!t.fechaUltimaInspeccion || t.fechaUltimaInspeccion.trim() === "" || t.fechaUltimaInspeccion === "-"));
      if (!tieneSinFecha) return false;
    }

    // 2. Filtros divididos individuales
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
    inspectorFiltro !== "" ||
    soloGeriatricos;

  const hasActiveFilters =
    filtroRutina !== "TODOS" ||
    hasInputFilters;

  const handleLimpiarFiltros = () => {
    setFiltroRutina("TODOS");
    setSoloGeriatricos(false);
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
            Control y Gestión de Inspecciones de Rutina
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "rgba(255, 255, 255, 0.88)",
              marginTop: 2,
              fontWeight: 500,
            }}
          >
            Inspecciones de Rutina — Establecimientos Habilitados
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
        {/* Sección de Métricas de Rutina (6 Tarjetas de Filtro) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {/* 1. ORDENES - En proceso */}
          <div
            onClick={() =>
              setFiltroRutina((prev) => (prev === "ORDENES" ? "TODOS" : "ORDENES"))
            }
            style={{
              background: filtroRutina === "ORDENES" ? "#EFF6FF" : "#FFFFFF",
              border: `2px solid ${filtroRutina === "ORDENES" ? "#2563EB" : "#E2E8F0"
                }`,
              borderRadius: 12,
              padding: "14px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              transition: "all 0.18s ease",
              boxShadow:
                filtroRutina === "ORDENES"
                  ? "0 4px 14px rgba(37, 99, 235, 0.16)"
                  : "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
            onMouseEnter={(e) => {
              if (filtroRutina !== "ORDENES") {
                e.currentTarget.style.borderColor = "#93C5FD";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (filtroRutina !== "ORDENES") {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.transform = "none";
              }
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
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: filtroRutina === "ORDENES" ? "#1D4ED8" : "#1E293B",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                ORDENES
              </span>
              <span
                className="material-icons"
                style={{ fontSize: 22, color: "#2563EB" }}
              >
                pending_actions
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  color: "#475569",
                  fontWeight: 650,
                }}
              >
                En proceso
              </span>
              {filtroRutina === "ORDENES" && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 750,
                    color: "#2563EB",
                    background: "#DBEAFE",
                    padding: "1px 6px",
                    borderRadius: 10,
                  }}
                >
                  Activo
                </span>
              )}
            </div>
          </div>

          {/* 2. VENCIDOS - Asignados */}
          <div
            onClick={() =>
              setFiltroRutina((prev) => (prev === "VENCIDOS" ? "TODOS" : "VENCIDOS"))
            }
            style={{
              background: filtroRutina === "VENCIDOS" ? "#FEF2F2" : "#FFFFFF",
              border: `2px solid ${filtroRutina === "VENCIDOS" ? "#DC2626" : "#E2E8F0"
                }`,
              borderRadius: 12,
              padding: "14px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              transition: "all 0.18s ease",
              boxShadow:
                filtroRutina === "VENCIDOS"
                  ? "0 4px 14px rgba(220, 38, 38, 0.16)"
                  : "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
            onMouseEnter={(e) => {
              if (filtroRutina !== "VENCIDOS") {
                e.currentTarget.style.borderColor = "#FCA5A5";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (filtroRutina !== "VENCIDOS") {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.transform = "none";
              }
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
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: filtroRutina === "VENCIDOS" ? "#B91C1C" : "#1E293B",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                VENCIDOS
              </span>
              <span
                className="material-icons"
                style={{ fontSize: 22, color: "#DC2626" }}
              >
                error_outline
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  color: "#475569",
                  fontWeight: 650,
                }}
              >
                Asignados
              </span>
              {filtroRutina === "VENCIDOS" && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 750,
                    color: "#DC2626",
                    background: "#FEE2E2",
                    padding: "1px 6px",
                    borderRadius: 10,
                  }}
                >
                  Activo
                </span>
              )}
            </div>
          </div>

          {/* 3. PRÓXIMOS - < 15 días */}
          <div
            onClick={() =>
              setFiltroRutina((prev) => (prev === "PROXIMOS" ? "TODOS" : "PROXIMOS"))
            }
            style={{
              background: filtroRutina === "PROXIMOS" ? "#FFFBEB" : "#FFFFFF",
              border: `2px solid ${filtroRutina === "PROXIMOS" ? "#D97706" : "#E2E8F0"
                }`,
              borderRadius: 12,
              padding: "14px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              transition: "all 0.18s ease",
              boxShadow:
                filtroRutina === "PROXIMOS"
                  ? "0 4px 14px rgba(217, 119, 6, 0.16)"
                  : "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
            onMouseEnter={(e) => {
              if (filtroRutina !== "PROXIMOS") {
                e.currentTarget.style.borderColor = "#FCD34D";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (filtroRutina !== "PROXIMOS") {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.transform = "none";
              }
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
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: filtroRutina === "PROXIMOS" ? "#B45309" : "#1E293B",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                PRÓXIMOS
              </span>
              <span
                className="material-icons"
                style={{ fontSize: 22, color: "#D97706" }}
              >
                warning_amber
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  color: "#475569",
                  fontWeight: 650,
                }}
              >
                &lt; 15 días
              </span>
              {filtroRutina === "PROXIMOS" && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 750,
                    color: "#D97706",
                    background: "#FEF3C7",
                    padding: "1px 6px",
                    borderRadius: 10,
                  }}
                >
                  Activo
                </span>
              )}
            </div>
          </div>

          {/* 4. EN PLAZO - < 30 días */}
          <div
            onClick={() =>
              setFiltroRutina((prev) => (prev === "EN_PLAZO" ? "TODOS" : "EN_PLAZO"))
            }
            style={{
              background: filtroRutina === "EN_PLAZO" ? "#F0F9FF" : "#FFFFFF",
              border: `2px solid ${filtroRutina === "EN_PLAZO" ? "#0284C7" : "#E2E8F0"
                }`,
              borderRadius: 12,
              padding: "14px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              transition: "all 0.18s ease",
              boxShadow:
                filtroRutina === "EN_PLAZO"
                  ? "0 4px 14px rgba(2, 132, 199, 0.16)"
                  : "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
            onMouseEnter={(e) => {
              if (filtroRutina !== "EN_PLAZO") {
                e.currentTarget.style.borderColor = "#7DD3FC";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (filtroRutina !== "EN_PLAZO") {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.transform = "none";
              }
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
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: filtroRutina === "EN_PLAZO" ? "#0369A1" : "#1E293B",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                EN PLAZO
              </span>
              <span
                className="material-icons"
                style={{ fontSize: 22, color: "#0284C7" }}
              >
                schedule
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  color: "#475569",
                  fontWeight: 650,
                }}
              >
                &lt; 30 días
              </span>
              {filtroRutina === "EN_PLAZO" && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 750,
                    color: "#0284C7",
                    background: "#E0F2FE",
                    padding: "1px 6px",
                    borderRadius: 10,
                  }}
                >
                  Activo
                </span>
              )}
            </div>
          </div>

          {/* 5. AL DÍA - > 30 días */}
          <div
            onClick={() =>
              setFiltroRutina((prev) => (prev === "AL_DIA" ? "TODOS" : "AL_DIA"))
            }
            style={{
              background: filtroRutina === "AL_DIA" ? "#F0FDF4" : "#FFFFFF",
              border: `2px solid ${filtroRutina === "AL_DIA" ? "#16A34A" : "#E2E8F0"
                }`,
              borderRadius: 12,
              padding: "14px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              transition: "all 0.18s ease",
              boxShadow:
                filtroRutina === "AL_DIA"
                  ? "0 4px 14px rgba(22, 163, 74, 0.16)"
                  : "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
            onMouseEnter={(e) => {
              if (filtroRutina !== "AL_DIA") {
                e.currentTarget.style.borderColor = "#86EFAC";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (filtroRutina !== "AL_DIA") {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.transform = "none";
              }
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
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: filtroRutina === "AL_DIA" ? "#15803D" : "#1E293B",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                AL DÍA
              </span>
              <span
                className="material-icons"
                style={{ fontSize: 22, color: "#16A34A" }}
              >
                check_circle
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  color: "#475569",
                  fontWeight: 650,
                }}
              >
                &gt; 30 días
              </span>
              {filtroRutina === "AL_DIA" && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 750,
                    color: "#16A34A",
                    background: "#DCFCE7",
                    padding: "1px 6px",
                    borderRadius: 10,
                  }}
                >
                  Activo
                </span>
              )}
            </div>
          </div>

          {/* 6. SIN FECHA - Sin fecha habilitación */}
          <div
            onClick={() =>
              setFiltroRutina((prev) => (prev === "SIN_FECHA" ? "TODOS" : "SIN_FECHA"))
            }
            style={{
              background: filtroRutina === "SIN_FECHA" ? "#F8FAFC" : "#FFFFFF",
              border: `2px solid ${filtroRutina === "SIN_FECHA" ? "#64748B" : "#E2E8F0"
                }`,
              borderRadius: 12,
              padding: "14px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              transition: "all 0.18s ease",
              boxShadow:
                filtroRutina === "SIN_FECHA"
                  ? "0 4px 14px rgba(100, 116, 139, 0.18)"
                  : "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
            onMouseEnter={(e) => {
              if (filtroRutina !== "SIN_FECHA") {
                e.currentTarget.style.borderColor = "#94A3B8";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (filtroRutina !== "SIN_FECHA") {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.transform = "none";
              }
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
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: filtroRutina === "SIN_FECHA" ? "#334155" : "#1E293B",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                SIN FECHA
              </span>
              <span
                className="material-icons"
                style={{ fontSize: 22, color: "#64748B" }}
              >
                event_busy
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#475569",
                  fontWeight: 650,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title="Sin fecha habilitación"
              >
                Sin fecha habilitación
              </span>
              {filtroRutina === "SIN_FECHA" && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 750,
                    color: "#475569",
                    background: "#E2E8F0",
                    padding: "1px 6px",
                    borderRadius: 10,
                    flexShrink: 0,
                  }}
                >
                  Activo
                </span>
              )}
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
                      borderBottom: `1.5px solid ${filtroNombre ? "#0284C7" : "#CBD5E1"
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
                      borderBottom: `1.5px solid ${filtroExpediente ? "#0284C7" : "#CBD5E1"
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
                      borderBottom: `1.5px solid ${filtroCuit ? "#0284C7" : "#CBD5E1"
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
                      borderBottom: `1.5px solid ${filtroDepartamento ? "#0284C7" : "#CBD5E1"
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
                      borderBottom: `1.5px solid ${filtroLocalidad ? "#0284C7" : "#CBD5E1"
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

                {/* 2. Inspector Asignado (Solo Coordinador) */}
                {isCoordinador && (
                  <div style={{ position: "relative" }}>
                    <select
                      value={inspectorFiltro}
                      onChange={(e) => setInspectorFiltro(e.target.value)}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: `1.5px solid ${inspectorFiltro ? "#0284C7" : "#CBD5E1"
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
                )}
              </div>

              {/* Botones de acción */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 6,
                  flexWrap: "wrap",
                }}
              >
                {/* Botón Solo Geriátricos */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSoloGeriatricos((prev) => !prev);
                      setPaginaSeleccionada(1);
                    }}
                    style={{
                      background: soloGeriatricos ? "#EFF6FF" : "#FFFFFF",
                      border: `1.5px solid ${soloGeriatricos ? "#0284C7" : "#CBD5E1"}`,
                      borderRadius: 8,
                      padding: "7px 16px",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: soloGeriatricos ? "#0369A1" : "#334155",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      boxShadow: soloGeriatricos
                        ? "0 2px 8px rgba(2, 132, 199, 0.22)"
                        : "0 1px 2px rgba(0, 0, 0, 0.04)",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!soloGeriatricos) e.currentTarget.style.background = "#F8FAFC";
                    }}
                    onMouseLeave={(e) => {
                      if (!soloGeriatricos) e.currentTarget.style.background = "#FFFFFF";
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{
                        fontSize: 18,
                        color: soloGeriatricos ? "#0284C7" : "#64748B",
                      }}
                    >
                      {soloGeriatricos ? "check_circle" : "elderly"}
                    </span>
                    Solo geriátricos
                    {soloGeriatricos && (
                      <span
                        style={{
                          background: "#0284C7",
                          color: "#FFFFFF",
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "1px 7px",
                          borderRadius: 10,
                          marginLeft: 2,
                        }}
                      >
                        Activo
                      </span>
                    )}
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            </div>
          )}
        </div>

        {/* Tabla de Establecimientos Habilitados */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)",
          }}
        >
          {/* Cabecera superior de la grilla */}
          <div
            style={{
              padding: "16px 22px",
              borderBottom: "1px solid #E2E8F0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#FAFAFA",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className="material-icons"
                style={{ fontSize: 22, color: "#004B87" }}
              >
                apartment
              </span>
              <div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#64748B",
                    fontWeight: 500,
                    marginTop: 1,
                  }}
                >
                  Inspección Periódica por Rutina • Total:{" "}
                  <strong>{filtradas.length}</strong> establecimientos
                  {soloGeriatricos && (
                    <span
                      style={{
                        marginLeft: 8,
                        background: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        color: "#1D4ED8",
                        fontSize: 11,
                        fontWeight: 750,
                        padding: "2px 8px",
                        borderRadius: 10,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3.5,
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 13, color: "#2563EB" }}>
                        elderly
                      </span>
                      Solo geriátricos
                    </span>
                  )}
                  {filtroRutina !== "TODOS" && (
                    <span
                      style={{
                        marginLeft: 8,
                        background: "#E0F2FE",
                        color: "#0369A1",
                        fontSize: 11,
                        fontWeight: 750,
                        padding: "2px 8px",
                        borderRadius: 10,
                      }}
                    >
                      Filtro activo:{" "}
                      {filtroRutina === "ORDENES"
                        ? "ORDENES (En proceso)"
                        : filtroRutina === "VENCIDOS"
                          ? "VENCIDOS (Asignados)"
                          : filtroRutina === "PROXIMOS"
                            ? "PRÓXIMOS (< 15 días)"
                            : filtroRutina === "EN_PLAZO"
                              ? "EN PLAZO (< 30 días)"
                              : filtroRutina === "AL_DIA"
                                ? "AL DÍA (> 30 días)"
                                : "Sin fecha habilitación"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setSoloGeriatricos(!soloGeriatricos);
                  setPaginaSeleccionada(1);
                }}
                style={{
                  background: soloGeriatricos ? "#EFF6FF" : "#FFFFFF",
                  border: `1.5px solid ${soloGeriatricos ? "#0284C7" : "#CBD5E1"}`,
                  borderRadius: 8,
                  padding: "6px 13px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: soloGeriatricos ? "#0369A1" : "#475569",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
                title="Filtrar solo establecimientos geriátricos"
              >
                <span
                  className="material-icons"
                  style={{
                    fontSize: 16,
                    color: soloGeriatricos ? "#0284C7" : "#64748B",
                  }}
                >
                  {soloGeriatricos ? "check_circle" : "elderly"}
                </span>
                Solo geriátricos
                {soloGeriatricos && (
                  <span
                    style={{
                      background: "#0284C7",
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: 10,
                    }}
                  >
                    Activo
                  </span>
                )}
              </button>

              {filtroRutina !== "TODOS" && (
                <button
                  type="button"
                  onClick={() => setFiltroRutina("TODOS")}
                  style={{
                    background: "#F1F5F9",
                    border: "1px solid #CBD5E1",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 650,
                    color: "#475569",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 14 }}>
                    close
                  </span>
                  Ver todos
                </button>
              )}

              {establecimientosRutina.length > 0 && (
                <button
                  type="button"
                  onClick={handleVaciarGrilla}
                  title="Vaciar la grilla completa de establecimientos"
                  style={{
                    background: "#FFF1F2",
                    border: "1px solid #FECDD3",
                    color: "#BE123C",
                    borderRadius: 8,
                    padding: "7px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>
                    delete_sweep
                  </span>
                  Vaciar grilla
                </button>
              )}

              <div ref={menuAgregarRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setMenuAgregarOpen((prev) => !prev)}
                  style={{
                    background: "#004B87",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 750,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    boxShadow: "0 2px 4px rgba(0, 75, 135, 0.25)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#003865")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#004B87")
                  }
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>
                    add_business
                  </span>
                  <span>Agregar Establecimiento</span>
                  <span
                    className="material-icons"
                    style={{
                      fontSize: 18,
                      transition: "transform 0.2s ease",
                      transform: menuAgregarOpen ? "rotate(180deg)" : "none",
                    }}
                  >
                    arrow_drop_down
                  </span>
                </button>

                {/* Menú Desplegable del Combo */}
                {menuAgregarOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      background: "#FFFFFF",
                      borderRadius: 10,
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #E2E8F0",
                      minWidth: 320,
                      zIndex: 1000,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px 8px 14px",
                        background: "#F8FAFC",
                        borderBottom: "1px solid #E2E8F0",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#64748B",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Seleccione Modalidad de Registro
                    </div>

                    {/* Opción 1: Establecimiento de Salud */}
                    <button
                      type="button"
                      onClick={() => {
                        setTipoModalNuevo("ESTABLECIMIENTO");
                        setModalNuevoEstablecimientoOpen(true);
                        setMenuAgregarOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F1F5F9")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "#E0F2FE",
                          color: "#0284C7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 20 }}>
                          local_hospital
                        </span>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 750,
                            color: "#0F172A",
                          }}
                        >
                          Establecimiento de Salud
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "#64748B",
                            marginTop: 2,
                            lineHeight: 1.35,
                          }}
                        >
                          Clínicas, sanatorios, centros médicos, geriátricos y laboratorios.
                        </div>
                      </div>
                    </button>

                    <div
                      style={{
                        height: 1,
                        background: "#E2E8F0",
                        margin: "0 10px",
                      }}
                    />

                    {/* Opción 2: Trámite de Servicios Diferenciados (RADIOFÍSICA) */}
                    <button
                      type="button"
                      onClick={() => {
                        setTipoModalNuevo("SERVICIO_DIFERENCIADO");
                        setModalNuevoEstablecimientoOpen(true);
                        setMenuAgregarOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#EFF6FF")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "#FEF3C7",
                          color: "#D97706",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 20 }}>
                          sensors
                        </span>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 750,
                            color: "#0F172A",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          Servicios Diferenciados
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              color: "#B45309",
                              background: "#FEF3C7",
                              border: "1px solid #FCD34D",
                              padding: "1px 5px",
                              borderRadius: 4,
                            }}
                          >
                            RADIOFÍSICA
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "#64748B",
                            marginTop: 2,
                            lineHeight: 1.35,
                          }}
                        >
                          Trámite de Radiofísica Sanitaria y equipamientos emisores de radiación.
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                  Establecimientos Habilitados / CUIT / Tipología
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
                  {soloGeriatricos ? "Fecha de Habilitación / Ciclo" : "Última Inspección / Ciclo"}
                </th>
                {soloGeriatricos && (
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
                      whiteSpace: "nowrap",
                    }}
                  >
                    Cantidad de Inspecciones
                  </th>
                )}
                {isCoordinador && (
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
                )}
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
              {inspeccionesBase.length === 0 ? (
                <tr>
                  <td
                    colSpan={(isCoordinador ? 5 : 4) + (soloGeriatricos ? 1 : 0)}
                    style={{
                      textAlign: "center",
                      padding: "56px 20px",
                      background: "#F8FAFC",
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: "#E0F2FE",
                        color: "#004B87",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 14,
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 32 }}>
                        domain_add
                      </span>
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: "#0F172A",
                        marginBottom: 6,
                      }}
                    >
                      La grilla de establecimientos habilitados está vacía
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#64748B",
                        maxWidth: 480,
                        margin: "0 auto 18px auto",
                        lineHeight: 1.5,
                      }}
                    >
                      Podés incorporar establecimientos habilitados de forma manual con todos sus datos técnicos. El sistema generará automáticamente el número de trámite, expediente e inspector responsable asignado.
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setTipoModalNuevo("ESTABLECIMIENTO");
                          setModalNuevoEstablecimientoOpen(true);
                        }}
                        style={{
                          background: "#004B87",
                          border: "none",
                          color: "#FFFFFF",
                          padding: "10px 20px",
                          borderRadius: 8,
                          fontSize: 13.5,
                          fontWeight: 750,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          boxShadow: "0 2px 6px rgba(0, 75, 135, 0.25)",
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 18 }}>
                          add_business
                        </span>
                        Agregar Establecimiento de Salud
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTipoModalNuevo("SERVICIO_DIFERENCIADO");
                          setModalNuevoEstablecimientoOpen(true);
                        }}
                        style={{
                          background: "#EFF6FF",
                          border: "1.5px solid #93C5FD",
                          color: "#1D4ED8",
                          padding: "10px 20px",
                          borderRadius: 8,
                          fontSize: 13.5,
                          fontWeight: 750,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 18, color: "#2563EB" }}>
                          sensors
                        </span>
                        Agregar Servicio Diferenciado (Radiofísica)
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={(isCoordinador ? 5 : 4) + (soloGeriatricos ? 1 : 0)}
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
                  const ordenEmitida = Boolean(
                    t.ordenEmitida ||
                    ["ACEPTADO_DOC_AUD", "EN_ANALISIS_AUD", "OBSERVADO_INSP", "DESCARGO_INSP", "RE_INSP_SOLICITADA"].includes(t.estado)
                  );
                  const emitirOrdenHabilitado = !ordenEmitida || !t.inspectorAsignado;
                  const rawAssigned = t.inspectorAsignado || "";
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
                  const isGer = isGeriatrico(t);
                  const esSinFecha =
                    t.alertaRutina === "SIN_FECHA" ||
                    (!isGer && (!t.fechaUltimaInspeccion || t.fechaUltimaInspeccion === "" || t.fechaUltimaInspeccion === "-")) ||
                    (isGer && !t.fechaHabilitacion && (!t.fechaUltimaInspeccion || t.fechaUltimaInspeccion === "" || t.fechaUltimaInspeccion === "-"));
                  const fechaRaw = esSinFecha
                    ? ""
                    : isGer
                      ? (t.fechaHabilitacion || t.fechaUltimaInspeccion || t.ultimaInspeccionFecha)
                      : (t.fechaUltimaInspeccion || t.ultimaInspeccionFecha);
                  const fechaFormatted = esSinFecha ? "Sin registrar" : formatFecha(fechaRaw);

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
                      {/* 1. Establecimiento Habilitado / CUIT / Tipología */}
                      <td
                        style={{
                          padding: "16px 20px",
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 750,
                              color: "#0F172A",
                              fontSize: 13.5,
                            }}
                          >
                            {t.denominacion}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11.5,
                            color: "#64748B",
                            fontFamily: "monospace",
                            marginTop: 3,
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
                          t.tipologia.toUpperCase().includes("RADIOF") ? (
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                background: "#EFF6FF",
                                border: "1px solid #BFDBFE",
                                color: "#1D4ED8",
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: 5,
                                letterSpacing: 0.3,
                                textTransform: "uppercase",
                                marginTop: 4,
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 12 }}>
                                sensors
                              </span>
                              Servicio Diferenciado: Radiofísica
                              {t.subservicio && (
                                <span
                                  style={{
                                    color: "#475569",
                                    fontWeight: 650,
                                    textTransform: "none",
                                    marginLeft: 2,
                                  }}
                                >
                                  ({t.subservicio})
                                </span>
                              )}
                            </div>
                          ) : (
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
                          )
                        )}
                        {(t.estadoActa === "RESPUESTA EMPLAZAMIENTO" || t.estado === "DESCARGO_INSP") && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              background: "#FFEDD5",
                              border: "1px solid #FDBA74",
                              color: "#C2410C",
                              fontSize: 10.5,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 5,
                              letterSpacing: 0.3,
                              textTransform: "uppercase",
                              marginTop: 4,
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: 12 }}>
                              rate_review
                            </span>
                            Respuesta Emplazamiento
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
                        {t.nroTramite && t.nroTramite.trim() !== "" ? (
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
                        ) : (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#94A3B8",
                              fontStyle: "italic",
                              fontWeight: 500,
                            }}
                          >
                            Sin número de trámite
                          </div>
                        )}
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

                      {/* 3. Última Inspección / Ciclo */}
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
                            color: esSinFecha ? "#64748B" : "#334155",
                          }}
                        >
                          <span
                            className="material-icons"
                            style={{
                              fontSize: 14,
                              color: esSinFecha ? "#94A3B8" : isGer ? "#0284C7" : "#64748B",
                            }}
                          >
                            {esSinFecha ? "event_busy" : isGer ? "verified" : "calendar_today"}
                          </span>
                          <span>{fechaFormatted}</span>
                        </div>
                        {isGer && !esSinFecha && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "#0284C7",
                              fontWeight: 700,
                              marginTop: 2,
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: 11 }}>
                              verified
                            </span>
                            Fecha Habilitación
                          </div>
                        )}
                        {!isGer && !esSinFecha && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "#64748B",
                              fontWeight: 600,
                              marginTop: 2,
                            }}
                          >
                            Última inspección
                          </div>
                        )}
                        <div style={{ marginTop: 4 }}>
                          {(() => {
                            const badge = (() => {
                              if (esSinFecha || t.alertaRutina === "SIN_FECHA") {
                                return {
                                  label: "Sin fecha",
                                  bg: "#F1F5F9",
                                  border: "#CBD5E1",
                                  color: "#475569",
                                  icon: "event_busy",
                                };
                              }
                              if (t.alertaRutina === "CRITICO_VENCIDO") {
                                return {
                                  label: "Vencido",
                                  bg: "#FEE2E2",
                                  border: "#FCA5A5",
                                  color: "#DC2626",
                                  icon: "error_outline",
                                };
                              }
                              if (t.alertaRutina === "ALERTA_T15") {
                                return {
                                  label: "< 15 días",
                                  bg: "#FEF3C7",
                                  border: "#FCD34D",
                                  color: "#B45309",
                                  icon: "warning_amber",
                                };
                              }
                              if (t.alertaRutina === "ALERTA_T30") {
                                return {
                                  label: "< 30 días",
                                  bg: "#EFF6FF",
                                  border: "#93C5FD",
                                  color: "#1D4ED8",
                                  icon: "schedule",
                                };
                              }
                              return {
                                label: "> 30 días",
                                bg: "#DCFCE7",
                                border: "#86EFAC",
                                color: "#15803D",
                                icon: "check_circle",
                              };
                            })();
                            return (
                              <span
                                style={{
                                  background: badge.bg,
                                  border: `1px solid ${badge.border}`,
                                  color: badge.color,
                                  fontWeight: 750,
                                  fontSize: 10.5,
                                  padding: "2px 8px",
                                  borderRadius: 12,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3.5,
                                }}
                              >
                                <span
                                  className="material-icons"
                                  style={{ fontSize: 12 }}
                                >
                                  {badge.icon}
                                </span>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Cantidad de Inspecciones (Solo visible con filtro Solo Geriátricos) */}
                      {soloGeriatricos && (
                        <td
                          style={{
                            padding: "16px 20px",
                            verticalAlign: "top",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4.5,
                                background: "#EFF6FF",
                                border: "1px solid #BFDBFE",
                                color: "#1D4ED8",
                                fontSize: 13,
                                fontWeight: 800,
                                padding: "4px 10px",
                                borderRadius: 14,
                                fontFamily: "monospace",
                                letterSpacing: 0.5,
                              }}
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: 14, color: "#2563EB" }}
                              >
                                event_repeat
                              </span>
                              {getCantidadInspeccionesStr(t)}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                color: "#64748B",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: 0.3,
                              }}
                            >
                              anuales
                            </span>
                          </div>
                        </td>
                      )}

                      {/* 4. Inspector Responsable (Solo Coordinador) */}
                      {isCoordinador && (
                        <td
                          style={{
                            padding: "16px 20px",
                            verticalAlign: "top",
                          }}
                        >
                          {emitirOrdenHabilitado || isUnassigned ? (
                            <span
                              style={{
                                color: "#94A3B8",
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              —
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
                                  Inspector de Salud
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      )}

                      {/* 5. Acciones */}
                      <td
                        style={{
                          padding: "16px 20px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          {isCoordinador ? (
                            emitirOrdenHabilitado ? (
                              <button
                                type="button"
                                onClick={() => handleSolicitarEmitirOrden(t)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  background: "#004B87",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: 6,
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 750,
                                  cursor: "pointer",
                                  boxShadow: "0 1px 3px rgba(0, 75, 135, 0.25)",
                                  transition: "all 0.15s ease",
                                  whiteSpace: "nowrap",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.transform = "translateY(-1px)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.transform = "translateY(0)")
                                }
                                title="Emitir Orden de Inspección"
                              >
                                <span
                                  className="material-icons"
                                  style={{ fontSize: 16 }}
                                >
                                  schedule_send
                                </span>
                                Emitir Orden
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  background: "#F1F5F9",
                                  color: "#94A3B8",
                                  border: "1px solid #CBD5E1",
                                  borderRadius: 6,
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 750,
                                  cursor: "not-allowed",
                                  boxShadow: "none",
                                  whiteSpace: "nowrap",
                                  opacity: 0.75,
                                }}
                                title="La orden de inspección ya se encuentra emitida"
                              >
                                <span
                                  className="material-icons"
                                  style={{ fontSize: 16, color: "#94A3B8" }}
                                >
                                  schedule_send
                                </span>
                                Emitir Orden
                              </button>
                            )
                          ) : (
                            (() => {
                              // ROL INSPECTOR: Los botones son Iniciar, Continuar, Revisar, Visualizar
                              if (
                                t.estado === "ACEPTADO_DOC_AUD" ||
                                (t.ordenEmitida &&
                                  t.estado !== "EN_ANALISIS_AUD" &&
                                  t.estado !== "RE_INSP_SOLICITADA" &&
                                  t.estado !== "OBSERVADO_INSP" &&
                                  t.estado !== "DESCARGO_INSP")
                              ) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleIniciar(t)}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5,
                                      background: "#10B981",
                                      color: "#FFFFFF",
                                      border: "none",
                                      borderRadius: 6,
                                      padding: "6px 14px",
                                      fontSize: 12,
                                      fontWeight: 750,
                                      cursor: "pointer",
                                      boxShadow:
                                        "0 1px 3px rgba(16, 185, 129, 0.25)",
                                      transition: "all 0.15s ease",
                                      whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(-1px)")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(0)")
                                    }
                                    title="Iniciar Inspección"
                                  >
                                    <span
                                      className="material-icons"
                                      style={{ fontSize: 16 }}
                                    >
                                      play_arrow
                                    </span>
                                    Iniciar
                                  </button>
                                );
                              }

                              if (
                                t.estado === "EN_ANALISIS_AUD" ||
                                t.estado === "RE_INSP_SOLICITADA" ||
                                t.estado === "OBSERVADO_INSP" ||
                                t.estado === "EN_INSPECCION"
                              ) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleContinuar(t)}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5,
                                      background: "#004B87",
                                      color: "#FFFFFF",
                                      border: "none",
                                      borderRadius: 6,
                                      padding: "6px 14px",
                                      fontSize: 12,
                                      fontWeight: 750,
                                      cursor: "pointer",
                                      boxShadow:
                                        "0 1px 3px rgba(0, 75, 135, 0.25)",
                                      transition: "all 0.15s ease",
                                      whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(-1px)")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(0)")
                                    }
                                    title="Continuar Inspección"
                                  >
                                    <span
                                      className="material-icons"
                                      style={{ fontSize: 16 }}
                                    >
                                      edit
                                    </span>
                                    Continuar
                                  </button>
                                );
                              }

                              if (t.estado === "DESCARGO_INSP" || t.estadoActa === "RESPUESTA EMPLAZAMIENTO") {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleRevisar(t)}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5,
                                      background: "#EA580C",
                                      color: "#FFFFFF",
                                      border: "none",
                                      borderRadius: 6,
                                      padding: "6px 14px",
                                      fontSize: 12,
                                      fontWeight: 750,
                                      cursor: "pointer",
                                      boxShadow:
                                        "0 1px 3px rgba(234, 88, 12, 0.25)",
                                      transition: "all 0.15s ease",
                                      whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(-1px)")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(0)")
                                    }
                                    title="Revisar Respuestas / Descargo"
                                  >
                                    <span
                                      className="material-icons"
                                      style={{ fontSize: 16 }}
                                    >
                                      rate_review
                                    </span>
                                    Revisar
                                  </button>
                                );
                              }

                              return (
                                <button
                                  type="button"
                                  onClick={() => handleVisualizar(t)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    background: "#F8FAFC",
                                    color: "#334155",
                                    border: "1px solid #CBD5E1",
                                    borderRadius: 6,
                                    padding: "6px 14px",
                                    fontSize: 12,
                                    fontWeight: 750,
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    whiteSpace: "nowrap",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "#F1F5F9")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      "#F8FAFC")
                                  }
                                  title="Visualizar Trámite / Acta"
                                >
                                  <span
                                    className="material-icons"
                                    style={{ fontSize: 16, color: "#64748B" }}
                                  >
                                    visibility
                                  </span>
                                  Visualizar
                                </button>
                              );
                            })()
                          )}

                          <TableActionsMenu
                            options={[
                              {
                                label: "Ver trámite",
                                icon: "visibility",
                                onClick: () => handleVisualizar(t),
                              },
                              ...(t.estado === "DESCARGO_INSP" || t.estadoActa === "RESPUESTA EMPLAZAMIENTO"
                                ? [
                                    {
                                      label: "Revisar Respuestas a Emplazamiento",
                                      icon: "rate_review",
                                      onClick: () => handleRevisar(t),
                                    },
                                  ]
                                : []),
                              ...(!isCoordinador &&
                              t.estado !== "EN_ANALISIS_AUD" &&
                              t.estado !== "DESCARGO_INSP" &&
                              t.estadoActa !== "RESPUESTA EMPLAZAMIENTO"
                                ? [
                                    {
                                      label: "Iniciar inspección",
                                      icon: "play_arrow",
                                      onClick: () => handleIniciar(t),
                                    },
                                  ]
                                : []),
                              ...(isCoordinador && emitirOrdenHabilitado
                                ? [
                                    {
                                      label: "Emitir Orden de Rutina",
                                      icon: "schedule_send",
                                      onClick: () =>
                                        handleSolicitarEmitirOrden(t),
                                    },
                                  ]
                                : []),
                              {
                                label: "Descargar Acta (PDF)",
                                icon: "download",
                                onClick: () =>
                                  alert(
                                    `Descargando Acta del Trámite ${t.nroTramite || t.id}...`,
                                  ),
                              },
                              {
                                label: "Eliminar de la grilla",
                                icon: "delete",
                                danger: true,
                                onClick: () =>
                                  handleEliminarEstablecimiento(t.id, t.denominacion),
                              },
                            ]}
                          />
                        </div>
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

      {/* Modal Trámite en Curso Detectado (Anti-Collision Guard) */}
      {tramiteSolapamientoDetectado && (
        <ModalTramiteEnCursoDetectado
          tramite={tramiteSolapamientoDetectado}
          onClose={() => setTramiteSolapamientoDetectado(null)}
          onEmitirDeTodasFormas={() => {
            const target = tramiteSolapamientoDetectado;
            setTramiteSolapamientoDetectado(null);
            setTramiteEmitirOrden(target);
          }}
        />
      )}

      {/* Modal Emitir Orden Rutina */}
      {tramiteEmitirOrden && (
        <ModalEmitirOrdenRutina
          tramite={tramiteEmitirOrden}
          listaInspectoresDisponibles={listaInspectores}
          onClose={() => setTramiteEmitirOrden(null)}
          onSuccess={(actualizado) => {
            const exists = establecimientosRutina.some((t) => t.id === actualizado.id);
            const finalLista = exists
              ? establecimientosRutina.map((t) => (t.id === actualizado.id ? actualizado : t))
              : [actualizado, ...establecimientosRutina];
            guardarEstablecimientos(finalLista);
            if (actualizarTramite) {
              actualizarTramite(actualizado);
            }
            setLocalTramites((prev) =>
              prev.map((t) => (t.id === actualizado.id ? actualizado : t))
            );
            setTramiteEmitirOrden(null);
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
        initialTipo={tramiteRadiofisica?.tipoServicio}
        initialSubservicio={tramiteRadiofisica?.subservicio}
        onConfirm={handleConfirmRadiofisica}
      />

      {/* Modal Nuevo Establecimiento Habilitado (Rutina) */}
      <ModalNuevoEstablecimientoRutina
        isOpen={modalNuevoEstablecimientoOpen}
        onClose={() => setModalNuevoEstablecimientoOpen(false)}
        onGuardar={handleGuardarNuevoEstablecimiento}
        inspectorLogueado={miNombreInspector}
        listaInspectoresDisponibles={listaInspectores}
        modoInicial={tipoModalNuevo}
      />
    </>
  );
}
