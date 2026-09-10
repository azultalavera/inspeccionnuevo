import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  TextField,
  Stack,
  IconButton,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  FormHelperText,
  Tabs,
  Tab,
  Alert,
  Fab,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Tune as TuneIcon,
  DoneAll as DoneAllIcon,
  RemoveDone as RemoveDoneIcon,
  Check as CheckIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalInformation as MedicalInformationIcon,
  RestartAlt as RestartAltIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Layout from "../ui/Layout";
import {
  TIPOS_EQUIPOS_DATABASE,
  OPCIONES_TIPOLOGIA,
  type CamposBooleanos,
  type TipoEquipo,
} from "../../data/tiposEquiposData";

export { OPCIONES_TIPOLOGIA };
export type { CamposBooleanos, TipoEquipo };

export interface CampoBooleanoDef {
  key: string;
  label: string;
  shortLabel: string;
  categoria: "IDENTIFICACION" | "OPERATIVO" | "ELECTROMEDICO";
}

// ─── Secuencia y Categorización de Características ───────────────────────────
export const GRUPOS_CARACTERISTICAS = [
  { id: "IDENTIFICACION", titulo: "📋 Identificación y Trazabilidad" },
  { id: "OPERATIVO", titulo: "⚙️ Condiciones y Parámetros Operativos" },
  { id: "ELECTROMEDICO", titulo: "⚡ Parámetros Técnicos y Electromédicos" },
];

export const CAMPOS_BOOLEANOS_CONFIG: CampoBooleanoDef[] = [
  // 1. Identificación y Trazabilidad
  { key: "unidad", label: "Unidad *", shortLabel: "UNIDAD", categoria: "IDENTIFICACION" },
  { key: "cargaMarca", label: "Marca *", shortLabel: "MARCA", categoria: "IDENTIFICACION" },
  { key: "cargaModelo", label: "Modelo *", shortLabel: "MODELO", categoria: "IDENTIFICACION" },
  { key: "cargaSerie", label: "Serie *", shortLabel: "SERIE", categoria: "IDENTIFICACION" },
  { key: "numeroPM", label: "Número de PM", shortLabel: "N° PM", categoria: "IDENTIFICACION" },
  { key: "anoFabricacion", label: "Año fabricación *", shortLabel: "AÑO FAB.", categoria: "IDENTIFICACION" },
  { key: "antiguedad", label: "Antigüedad *", shortLabel: "ANTIGÜEDAD", categoria: "IDENTIFICACION" },

  // 2. Operativos
  { key: "cantidad", label: "Cantidad *", shortLabel: "CANTIDAD", categoria: "OPERATIVO" },
  { key: "condicion", label: "Condición * (Propio / Tercerizado)", shortLabel: "CONDICIÓN", categoria: "OPERATIVO" },
  { key: "movilidad", label: "Movilidad * (Fijo / Rodante)", shortLabel: "MOVILIDAD", categoria: "OPERATIVO" },
  { key: "usoEquipo", label: "Uso del equipo * (Facial / Corporal)", shortLabel: "USO EQUIPO", categoria: "OPERATIVO" },
  { key: "tipoRevelado", label: "Tipo de revelado *", shortLabel: "TIPO REVELADO", categoria: "OPERATIVO" },

  // 3. Electromédicos
  { key: "tesla", label: "Tesla *", shortLabel: "TESLA", categoria: "ELECTROMEDICO" },
  { key: "tensionMax", label: "Tensión Max (kV) *", shortLabel: "TENSIÓN MÁX", categoria: "ELECTROMEDICO" },
  { key: "corrienteMax", label: "Corriente Max (mA) *", shortLabel: "CORRIENTE MÁX", categoria: "ELECTROMEDICO" },
  { key: "potencia", label: "Potencia (Watt) *", shortLabel: "POTENCIA", categoria: "ELECTROMEDICO" },
  { key: "energia", label: "Energía (Joule) *", shortLabel: "ENERGÍA", categoria: "ELECTROMEDICO" },
  { key: "fluencia", label: "Fluencia (Joule/cm2) *", shortLabel: "FLUENCIA", categoria: "ELECTROMEDICO" },
  { key: "longitudOnda", label: "Longitud de onda (nanómetro) *", shortLabel: "LONG. ONDA", categoria: "ELECTROMEDICO" },
  { key: "cantidadFuentes", label: "Cantidad de fuentes *", shortLabel: "CANT. FUENTES", categoria: "ELECTROMEDICO" },
];

const initialBooleanos: CamposBooleanos = {
  unidad: false,
  cargaMarca: true,
  cargaModelo: true,
  cargaSerie: true,
  condicion: false,
  numeroPM: false,
  movilidad: false,
  usoEquipo: false,
  anoFabricacion: false,
  antiguedad: false,
  cantidad: false,
  tesla: false,
  tensionMax: false,
  corrienteMax: false,
  potencia: false,
  energia: false,
  fluencia: false,
  longitudOnda: false,
  cantidadFuentes: false,
  tipoRevelado: false,
};

const initialItemState: Omit<TipoEquipo, "id"> = {
  tipologia: "RADIOFÍSICA",
  nombre: "",
  booleanos: initialBooleanos,
};

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: "88%", md: "860px" },
  maxHeight: "92vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  overflowY: "auto",
  p: 0,
};

export default function TiposEquiposConfig() {
  const navigate = useNavigate();
  const [data, setData] = useState<TipoEquipo[]>(() => {
    try {
      const saved = localStorage.getItem("TIPOS_EQUIPOS_DATABASE");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasEPP = parsed.some((it: TipoEquipo) =>
            it.nombre.toUpperCase().includes("PROTECCI")
          );
          if (hasEPP) {
            return parsed.map((item: TipoEquipo) => ({
              ...item,
              booleanos: {
                ...initialBooleanos,
                ...item.booleanos,
              },
            }));
          }
        }
      }
    } catch (e) {
      console.error("Error al leer TIPOS_EQUIPOS_DATABASE de localStorage", e);
    }
    return TIPOS_EQUIPOS_DATABASE;
  });

  // Lista dinámica de características (permite agregar nuevas características)
  const [caracteristicas, setCaracteristicas] = useState<CampoBooleanoDef[]>(() => {
    try {
      const saved = localStorage.getItem("CAMPOS_CARACTERISTICAS_CONFIG");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const baseKeys = CAMPOS_BOOLEANOS_CONFIG.map((b) => b.key);
          const customOnly = parsed.filter((p: CampoBooleanoDef) => !baseKeys.includes(p.key));
          return [...CAMPOS_BOOLEANOS_CONFIG, ...customOnly];
        }
      }
    } catch (e) {
      console.error("Error al leer CAMPOS_CARACTERISTICAS_CONFIG", e);
    }
    return CAMPOS_BOOLEANOS_CONFIG;
  });

  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado para el panel de agregar característica dentro del modal
  const [showAddCaract, setShowAddCaract] = useState(false);
  const [newCaractLabel, setNewCaractLabel] = useState("");
  const [newCaractCat, setNewCaractCat] = useState<"IDENTIFICACION" | "OPERATIVO" | "ELECTROMEDICO">("IDENTIFICACION");
  const [newCaractActiva, setNewCaractActiva] = useState(true);

  // 0: TIPOLOGÍAS, 1: SERVICIOS EXTERNOS (RADIOFÍSICA. DIÁLISIS), 2: VISTA COMPARATIVA GENERAL
  const [currentTab, setCurrentTab] = useState<number>(0);

  // Form State
  const [formData, setFormData] = useState<Omit<TipoEquipo, "id">>(initialItemState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleGuardarCambiosGlobal = () => {
    localStorage.setItem("TIPOS_EQUIPOS_DATABASE", JSON.stringify(data));
    localStorage.setItem("CAMPOS_CARACTERISTICAS_CONFIG", JSON.stringify(caracteristicas));
    setSnackbarOpen(true);
  };

  // Equipos a mostrar según la pestaña activa
  const dataFiltrada = useMemo(() => {
    if (currentTab === 0) {
      return data.filter((item) => item.tipologia !== "RADIOFÍSICA");
    }
    if (currentTab === 1) {
      return data.filter((item) => item.tipologia === "RADIOFÍSICA");
    }
    return data; // Tab 2: Todas
  }, [data, currentTab]);

  const handleOpenNuevo = () => {
    const tipDefault = currentTab === 0 ? "CLÍNICAS" : "RADIOFÍSICA";
    const initialBools: CamposBooleanos = { ...initialBooleanos };
    caracteristicas.forEach((c) => {
      if (initialBools[c.key] === undefined) {
        initialBools[c.key] = false;
      }
    });
    setFormData({
      ...initialItemState,
      tipologia: tipDefault,
      nombre: tipDefault === "CLÍNICAS" ? "TODOS LOS SERVICIOS" : "",
      booleanos: initialBools,
    });
    setFormErrors({});
    setIsEditing(false);
    setEditingId(null);
    setShowAddCaract(false);
    setOpenModal(true);
  };

  const handleOpenEditar = (item: TipoEquipo) => {
    const editBools: CamposBooleanos = { ...initialBooleanos, ...item.booleanos };
    caracteristicas.forEach((c) => {
      if (editBools[c.key] === undefined) {
        editBools[c.key] = false;
      }
    });
    setFormData({
      tipologia: item.tipologia,
      nombre: item.nombre,
      booleanos: editBools,
    });
    setFormErrors({});
    setIsEditing(true);
    setEditingId(item.id);
    setShowAddCaract(false);
    setOpenModal(true);
  };

  const handleEliminar = (id: number) => {
    if (window.confirm("¿Confirma que desea eliminar este servicio/equipo de la matriz?")) {
      setData((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const handleQuickToggleCell = (equipoId: number, key: string) => {
    setData((prev) =>
      prev.map((eq) =>
        eq.id === equipoId
          ? {
            ...eq,
            booleanos: {
              ...eq.booleanos,
              [key]: !eq.booleanos[key],
            },
          }
          : eq
      )
    );
  };

  const handleResetDefaults = () => {
    if (window.confirm("¿Desea restablecer la matriz oficial y características por defecto?")) {
      setData(TIPOS_EQUIPOS_DATABASE);
      setCaracteristicas(CAMPOS_BOOLEANOS_CONFIG);
      localStorage.removeItem("TIPOS_EQUIPOS_DATABASE");
      localStorage.removeItem("CAMPOS_CARACTERISTICAS_CONFIG");
    }
  };

  const handleToggleBooleano = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      booleanos: {
        ...prev.booleanos,
        [key]: !prev.booleanos[key],
      },
    }));
  };

  const handleMarcarTodosBooleanos = (valor: boolean) => {
    const updated: any = {};
    caracteristicas.forEach((c) => {
      updated[c.key] = valor;
    });
    setFormData((prev) => ({ ...prev, booleanos: updated }));
  };

  const handleAgregarCaracteristica = () => {
    const nombreLimpio = newCaractLabel.trim();
    if (!nombreLimpio) {
      alert("Por favor ingrese el nombre de la característica.");
      return;
    }

    const cleanKey = "caract_" + nombreLimpio.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();
    const nuevaDef: CampoBooleanoDef = {
      key: cleanKey,
      label: nombreLimpio,
      shortLabel: nombreLimpio.toUpperCase(),
      categoria: newCaractCat,
    };

    const updatedDefs = [...caracteristicas, nuevaDef];
    setCaracteristicas(updatedDefs);
    localStorage.setItem("CAMPOS_CARACTERISTICAS_CONFIG", JSON.stringify(updatedDefs));

    // Activar en el formulario actual según el switch
    setFormData((prev) => ({
      ...prev,
      booleanos: {
        ...prev.booleanos,
        [cleanKey]: newCaractActiva,
      },
    }));

    // Asegurar que la nueva clave exista en los equipos registrados en `data`
    setData((prev) =>
      prev.map((it) => ({
        ...it,
        booleanos: {
          ...it.booleanos,
          [cleanKey]: it.id === editingId ? newCaractActiva : false,
        },
      }))
    );

    setNewCaractLabel("");
    setShowAddCaract(false);
    setNewCaractActiva(true);
  };

  const handleEliminarCaracteristica = (keyToDelete: string) => {
    if (window.confirm("¿Desea eliminar esta característica personalizada de la matriz?")) {
      const updatedDefs = caracteristicas.filter((c) => c.key !== keyToDelete);
      setCaracteristicas(updatedDefs);
      localStorage.setItem("CAMPOS_CARACTERISTICAS_CONFIG", JSON.stringify(updatedDefs));

      setFormData((prev) => {
        const copy = { ...prev.booleanos };
        delete copy[keyToDelete];
        return { ...prev, booleanos: copy };
      });

      setData((prev) =>
        prev.map((it) => {
          const copy = { ...it.booleanos };
          delete copy[keyToDelete];
          return { ...it, booleanos: copy };
        })
      );
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.tipologia) errors.tipologia = "La tipología es obligatoria.";
    if (!formData.nombre.trim()) errors.nombre = "El nombre del servicio/equipo es obligatorio.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGuardar = () => {
    if (!validateForm()) {
      alert("Por favor complete los campos obligatorios.");
      return;
    }

    if (isEditing && editingId) {
      setData((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? { ...formData, id: editingId, nombre: formData.nombre.trim().toUpperCase() }
            : it
        )
      );
    } else {
      const nuevo: TipoEquipo = {
        ...formData,
        id: Date.now(),
        nombre: formData.nombre.trim().toUpperCase(),
      };
      setData((prev) => [...prev, nuevo]);
    }
    setOpenModal(false);
  };

  return (
    <Layout>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          mb: 4,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Encabezado Azul */}
        <Box
          sx={{
            backgroundColor: "#005596",
            color: "white",
            py: 2.2,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              size="small"
              onClick={() => navigate("/admin/gestion-recursos")}
              sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.3px" }}>
                Características por Equipos
              </Typography>
              <Typography variant="caption" sx={{ color: "#e2e8f0", fontSize: "0.8rem" }}>
                Matriz de características y campos solicitados al efector al registrar equipamientos según tipología y servicio
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleResetDefaults}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.35)",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.78rem",
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)", borderColor: "white" },
              }}
            >
              Restablecer Valores
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenNuevo}
              sx={{
                bgcolor: "#0284c7",
                color: "white",
                textTransform: "none",
                fontWeight: 750,
                fontSize: "0.78rem",
                "&:hover": { bgcolor: "#0369a1" },
              }}
            >
              Nuevo Servicio
            </Button>
          </Box>
        </Box>

        {/* SELECTOR DE PESTAÑAS PRINCIPALES (UX CLARA Y LIMPIA) */}
        <Box sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", px: 3, pt: 1.5 }}>
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 750,
                fontSize: "0.95rem",
                minHeight: 48,
                px: 2.5,
              },
            }}
          >
            <Tab
              icon={<LocalHospitalIcon fontSize="small" />}
              iconPosition="start"
              label="TIPOLOGÍAS"
            />
            <Tab
              icon={<TuneIcon fontSize="small" />}
              iconPosition="start"
              label="SERVICIOS EXTERNOS (RADIOFÍSICA. DIÁLISIS)"
            />
            <Tab
              icon={<MedicalInformationIcon fontSize="small" />}
              iconPosition="start"
              label="VISTA COMPARATIVA GENERAL"
            />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: "white" }}>
          
          {/* BANNER EXPLICATIVO SEGÚN PESTAÑA */}
          {currentTab === 0 && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{ mb: 3, bgcolor: "#eff6ff", borderColor: "#93c5fd", color: "#1e40af", alignItems: "center" }}
            >
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 650 }}>
                <strong>TIPOLOGÍAS (CLÍNICAS, SANATORIOS Y HOSPITALES):</strong> Configuración transversal para <strong>TODOS LOS SERVICIOS</strong> y <strong>ELEMENTOS DE PROTECCIÓN PERSONAL</strong>. Podés hacer clic en cualquier celda para alternar la característica.
              </Typography>
            </Alert>
          )}

          {currentTab === 1 && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{ mb: 3, bgcolor: "#f0fdf4", borderColor: "#86efac", color: "#166534", alignItems: "center" }}
            >
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 650 }}>
                <strong>SERVICIOS EXTERNOS (RADIOFÍSICA. DIÁLISIS):</strong> Cada tecnología electromédica (Resonancia, Láser, Rayos X, Ultravioleta) y los <strong>Elementos de Protección Personal</strong> exigen parámetros particulares. Podés hacer clic en cualquier celda para alternar la característica.
              </Typography>
            </Alert>
          )}

          {currentTab === 2 && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{ mb: 3, bgcolor: "#f8fafc", borderColor: "#cbd5e1", color: "#334155", alignItems: "center" }}
            >
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 650 }}>
                <strong>VISTA COMPARATIVA GENERAL:</strong> Comparativa lado a lado entre las características de Tipologías y Servicios Externos.
              </Typography>
            </Alert>
          )}

          {/* TABLA MATRIZ: CARACTERÍSTICAS AGRUPADAS EN FILAS, SERVICIOS EN COLUMNAS */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "8px", overflowX: "auto", border: "1px solid #cbd5e1", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Table size="medium">
              <TableHead sx={{ bgcolor: "#0f172a" }}>
                <TableRow>
                  {/* Columna Izquierda: Características */}
                  <TableCell
                    sx={{
                      fontWeight: 850,
                      color: "white",
                      width: "340px",
                      minWidth: "300px",
                      fontSize: "0.9rem",
                      borderRight: "2px solid rgba(255,255,255,0.2)",
                      py: 2,
                    }}
                  >
                    CARACTERÍSTICAS / CAMPOS
                  </TableCell>

                  {/* Columnas de Servicios */}
                  {dataFiltrada.map((eq) => (
                    <TableCell
                      key={eq.id}
                      align="center"
                      sx={{
                        color: "white",
                        minWidth: "190px",
                        borderRight: "1px solid rgba(255,255,255,0.15)",
                        py: 2,
                        bgcolor: eq.tipologia === "CLÍNICAS" ? "#1e293b" : "#0f172a",
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.6 }}>
                        <Chip
                          label={eq.tipologia}
                          size="small"
                          sx={{
                            bgcolor: eq.tipologia === "RADIOFÍSICA" ? "#0284c7" : "#059669",
                            color: "white",
                            fontWeight: 850,
                            fontSize: "0.68rem",
                            height: 20,
                          }}
                        />
                        <Typography sx={{ fontWeight: 850, fontSize: "0.92rem", color: "white", textAlign: "center" }}>
                          {eq.nombre}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                          <Tooltip title={`Editar ${eq.nombre}`}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditar(eq)}
                              sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)", p: 0.5, "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}
                            >
                              <EditIcon sx={{ fontSize: "14px" }} />
                            </IconButton>
                          </Tooltip>
                          {dataFiltrada.length > 1 && (
                            <Tooltip title={`Eliminar ${eq.nombre}`}>
                              <IconButton
                                size="small"
                                onClick={() => handleEliminar(eq.id)}
                                sx={{ color: "#fca5a5", bgcolor: "rgba(255,255,255,0.15)", p: 0.5, "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}
                              >
                                <DeleteIcon sx={{ fontSize: "14px" }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {/* FILA FIJA 1: TIPO DE EQUIPO */}
                <TableRow sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <TableCell sx={{ fontWeight: 850, color: "#0f172a", borderRight: "2px solid #e2e8f0", py: 1.4 }}>
                    Tipo de Equipo
                  </TableCell>
                  {dataFiltrada.map((eq) => (
                    <TableCell key={eq.id} align="center" sx={{ borderRight: "1px solid #e2e8f0", py: 1.4 }}>
                      <Chip
                        icon={<CheckIcon sx={{ fontSize: "14px !important", color: "#15803d !important" }} />}
                        label="SÍ"
                        size="small"
                        sx={{
                          bgcolor: "#dcfce7",
                          color: "#15803d",
                          fontWeight: 850,
                          border: "1px solid #86efac",
                          height: 24,
                          minWidth: 55,
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>

                {/* GRUPOS DE CARACTERÍSTICAS CON ENCABEZADOS DE SECCIÓN */}
                {GRUPOS_CARACTERISTICAS.map((grupo) => {
                  const camposDelGrupo = caracteristicas.filter((c) => c.categoria === grupo.id);
                  if (camposDelGrupo.length === 0) return null;

                  return (
                    <React.Fragment key={grupo.id}>
                      {/* Cabecera de Categoría */}
                      <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                        <TableCell
                          colSpan={dataFiltrada.length + 1}
                          sx={{
                            fontWeight: 850,
                            color: "#005596",
                            fontSize: "0.84rem",
                            py: 1,
                            px: 2,
                            letterSpacing: "0.3px",
                            borderTop: "2px solid #cbd5e1",
                            borderBottom: "1px solid #cbd5e1",
                          }}
                        >
                          {grupo.titulo}
                        </TableCell>
                      </TableRow>

                      {/* Filas de características del grupo */}
                      {camposDelGrupo.map((campo, idx) => (
                        <TableRow
                          key={campo.key}
                          hover
                          sx={{
                            bgcolor: idx % 2 === 0 ? "white" : "#fafafa",
                            "&:hover": { bgcolor: "#f8fafc" },
                          }}
                        >
                          {/* Etiqueta del Requisito */}
                          <TableCell sx={{ fontWeight: 650, color: "#334155", borderRight: "2px solid #e2e8f0", py: 1.2, fontSize: "0.85rem" }}>
                            {campo.label}
                          </TableCell>

                          {/* Celdas por Servicio */}
                          {dataFiltrada.map((eq) => {
                            const isChecked = eq.booleanos[campo.key];
                            return (
                              <TableCell
                                key={eq.id}
                                align="center"
                                onClick={() => handleQuickToggleCell(eq.id, campo.key)}
                                sx={{
                                  borderRight: "1px solid #e2e8f0",
                                  py: 1.2,
                                  cursor: "pointer",
                                  transition: "background-color 0.15s",
                                  "&:hover": { bgcolor: isChecked ? "#f0fdf4" : "#fef2f2" },
                                }}
                              >
                                {isChecked ? (
                                  <Tooltip title={`${campo.label} para ${eq.nombre}: ACTIVO (Clic para desactivar)`}>
                                    <Chip
                                      icon={<CheckIcon sx={{ fontSize: "14px !important", color: "#15803d !important" }} />}
                                      label="SÍ"
                                      size="small"
                                      sx={{
                                        bgcolor: "#dcfce7",
                                        color: "#15803d",
                                        fontWeight: 850,
                                        border: "1px solid #86efac",
                                        height: 24,
                                        minWidth: 55,
                                        cursor: "pointer",
                                      }}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Tooltip title={`${campo.label} para ${eq.nombre}: NO APLICA (Clic para activar)`}>
                                    <Typography sx={{ color: "#94a3b8", fontWeight: 750, fontSize: "1.2rem", lineHeight: 1 }}>
                                      —
                                    </Typography>
                                  </Tooltip>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

        </Box>
      </Paper>

      {/* ── MODAL NUEVO / EDITAR SERVICIO (EQUIPO) ─────────────────────────── */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={styleModal}>
          <Box sx={{ bgcolor: "#005596", color: "white", py: 2, px: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {isEditing ? `Editar ${formData.nombre}` : "Nuevo Servicio / Tipo de Equipo"}
            </Typography>
            <IconButton size="small" onClick={() => setOpenModal(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "#0090d0", fontWeight: 800, mb: 1.5, textTransform: "uppercase" }}>
              1. Identificación
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2.5 }}>
              <FormControl variant="standard" fullWidth required error={!!formErrors.tipologia}>
                <InputLabel>Tipología Sanitaria *</InputLabel>
                <Select
                  value={formData.tipologia}
                  onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })}
                >
                  <MenuItem value="RADIOFÍSICA">RADIOFÍSICA</MenuItem>
                  <MenuItem value="CLÍNICAS">CLÍNICAS</MenuItem>
                  {OPCIONES_TIPOLOGIA.filter((t) => t !== "RADIOFÍSICA" && t !== "CLÍNICAS").map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
                {formErrors.tipologia && <FormHelperText>{formErrors.tipologia}</FormHelperText>}
              </FormControl>

              <TextField
                label="Nombre de Servicio / Opción *"
                variant="standard"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. TODOS LOS SERVICIOS, RESONANCIA MAGNÉTICA..."
                fullWidth
                required
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
              <Typography variant="subtitle2" sx={{ color: "#0090d0", fontWeight: 800, textTransform: "uppercase" }}>
                2. Características para este Servicio
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddCaract((prev) => !prev)}
                  sx={{
                    bgcolor: showAddCaract ? "#64748b" : "#0284c7",
                    color: "white",
                    textTransform: "none",
                    fontSize: "0.75rem",
                    fontWeight: 750,
                    "&:hover": { bgcolor: showAddCaract ? "#475569" : "#0369a1" },
                  }}
                >
                  {showAddCaract ? "Cerrar Panel" : "Agregar Característica"}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DoneAllIcon />}
                  onClick={() => handleMarcarTodosBooleanos(true)}
                  sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700 }}
                >
                  Marcar Todas
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<RemoveDoneIcon />}
                  onClick={() => handleMarcarTodosBooleanos(false)}
                  sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700 }}
                >
                  Desmarcar Todas
                </Button>
              </Box>
            </Box>

            {/* PANEL PARA AGREGAR NUEVA CARACTERÍSTICA */}
            {showAddCaract && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: "#f0fdf4",
                  borderColor: "#86efac",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                }}
              >
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#166534", mb: 1.5 }}>
                  ➕ Agregar Nueva Característica a la Matriz
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1.5fr 1.5fr auto" }, gap: 2, alignItems: "center" }}>
                  <TextField
                    label="Nombre de la Característica *"
                    size="small"
                    variant="outlined"
                    placeholder="Ej. Certificado de calibración, Antigüedad máxima..."
                    value={newCaractLabel}
                    onChange={(e) => setNewCaractLabel(e.target.value)}
                    sx={{ bgcolor: "white" }}
                  />
                  <FormControl size="small" sx={{ bgcolor: "white" }}>
                    <InputLabel>Categoría *</InputLabel>
                    <Select
                      value={newCaractCat}
                      label="Categoría *"
                      onChange={(e) => setNewCaractCat(e.target.value as any)}
                    >
                      <MenuItem value="IDENTIFICACION">📋 Identificación y Trazabilidad</MenuItem>
                      <MenuItem value="OPERATIVO">⚙️ Condiciones y Parámetros Operativos</MenuItem>
                      <MenuItem value="ELECTROMEDICO">⚡ Parámetros Técnicos y Electromédicos</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newCaractActiva}
                          onChange={(e) => setNewCaractActiva(e.target.checked)}
                          color="primary"
                          size="small"
                        />
                      }
                      label={<Typography sx={{ fontSize: "0.78rem", fontWeight: 700 }}>Activar</Typography>}
                      sx={{ m: 0 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleAgregarCaracteristica}
                      sx={{ bgcolor: "#166534", textTransform: "none", fontWeight: 750, "&:hover": { bgcolor: "#14532d" } }}
                    >
                      Guardar
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, bgcolor: "#f8fafc", p: 2, borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              {caracteristicas.map((c) => {
                const isCustom = c.key.startsWith("caract_");
                return (
                  <Box
                    key={c.key}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1,
                      px: 1.5,
                      bgcolor: "white",
                      borderRadius: "4px",
                      border: isCustom ? "1px solid #86efac" : "1px solid #e2e8f0",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, overflow: "hidden" }}>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: formData.booleanos[c.key] ? 750 : 500 }} noWrap>
                        {c.label}
                      </Typography>
                      {isCustom && (
                        <Tooltip title="Eliminar característica personalizada">
                          <IconButton
                            size="small"
                            onClick={() => handleEliminarCaracteristica(c.key)}
                            sx={{ color: "#ef4444", p: 0.2, "&:hover": { bgcolor: "#fee2e2" } }}
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!formData.booleanos[c.key]}
                          onChange={() => handleToggleBooleano(c.key)}
                          color="primary"
                          size="small"
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: formData.booleanos[c.key] ? "#15803d" : "#94a3b8", minWidth: 24 }}>
                          {formData.booleanos[c.key] ? "SÍ" : "NO"}
                        </Typography>
                      }
                      labelPlacement="start"
                      sx={{ m: 0 }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenModal(false)}
              sx={{ color: "#64748b", borderColor: "#cbd5e1", textTransform: "none", fontWeight: 700 }}
            >
              CANCELAR
            </Button>
            <Button
              variant="contained"
              onClick={handleGuardar}
              sx={{ bgcolor: "#005596", textTransform: "none", fontWeight: 750, "&:hover": { bgcolor: "#003b66" } }}
            >
              GUARDAR SERVICIO
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* BOTÓN GUARDAR FLOTANTE */}
      <Fab
        variant="extended"
        onClick={handleGuardarCambiosGlobal}
        sx={{
          position: "fixed",
          bottom: 28,
          right: 32,
          zIndex: 1200,
          backgroundColor: "#005596",
          color: "white",
          fontWeight: 800,
          fontSize: "0.92rem",
          letterSpacing: "0.5px",
          px: 3.5,
          py: 1.5,
          boxShadow: "0 10px 25px -5px rgba(0, 85, 150, 0.5), 0 8px 10px -6px rgba(0, 85, 150, 0.3)",
          textTransform: "none",
          transition: "all 0.25s ease",
          "&:hover": {
            backgroundColor: "#003b66",
            transform: "translateY(-3px)",
            boxShadow: "0 14px 28px -5px rgba(0, 85, 150, 0.6)",
          },
        }}
      >
        <SaveIcon sx={{ mr: 1, fontSize: 22 }} />
        GUARDAR
      </Fab>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled" sx={{ width: "100%", fontWeight: 700 }}>
          ¡Cambios guardados exitosamente en la matriz de Características por Equipos!
        </Alert>
      </Snackbar>
    </Layout>
  );
}
