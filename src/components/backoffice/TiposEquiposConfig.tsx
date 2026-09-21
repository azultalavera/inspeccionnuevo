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
  Autocomplete,
  Snackbar,
  Alert,
  Checkbox,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Tune as TuneIcon,
  DoneAll as DoneAllIcon,
  RemoveDone as RemoveDoneIcon,
  RestartAlt as RestartAltIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
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
  { key: "cargaMarca", label: "Marca", shortLabel: "MARCA", categoria: "IDENTIFICACION" },
  { key: "cargaModelo", label: "Modelo", shortLabel: "MODELO", categoria: "IDENTIFICACION" },
  { key: "cargaSerie", label: "Serie", shortLabel: "SERIE", categoria: "IDENTIFICACION" },
  { key: "numeroPM", label: "Número de PM", shortLabel: "N° PM", categoria: "IDENTIFICACION" },
  { key: "anoFabricacion", label: "Año fabricación", shortLabel: "AÑO FAB.", categoria: "IDENTIFICACION" },
  { key: "antiguedad", label: "Antigüedad", shortLabel: "ANTIGÜEDAD", categoria: "IDENTIFICACION" },

  // 2. Operativos
  { key: "cantidad", label: "Cantidad", shortLabel: "CANTIDAD", categoria: "OPERATIVO" },
  { key: "condicion", label: "Condición (Propio / Tercerizado)", shortLabel: "CONDICIÓN", categoria: "OPERATIVO" },
  { key: "movilidad", label: "Movilidad (Fijo / Rodante)", shortLabel: "MOVILIDAD", categoria: "OPERATIVO" },
  { key: "usoEquipo", label: "Uso del equipo (Facial / Corporal)", shortLabel: "USO EQUIPO", categoria: "OPERATIVO" },
  { key: "tipoRevelado", label: "Tipo de revelado", shortLabel: "TIPO REVELADO", categoria: "OPERATIVO" },

  // 3. Electromédicos
  { key: "tesla", label: "Tesla", shortLabel: "TESLA", categoria: "ELECTROMEDICO" },
  { key: "tensionMax", label: "Tensión Max (kV)", shortLabel: "TENSIÓN MÁX", categoria: "ELECTROMEDICO" },
  { key: "corrienteMax", label: "Corriente Max (mA)", shortLabel: "CORRIENTE MÁX", categoria: "ELECTROMEDICO" },
  { key: "potencia", label: "Potencia (Watt)", shortLabel: "POTENCIA", categoria: "ELECTROMEDICO" },
  { key: "energia", label: "Energía (Joule)", shortLabel: "ENERGÍA", categoria: "ELECTROMEDICO" },
  { key: "fluencia", label: "Fluencia (Joule/cm2)", shortLabel: "FLUENCIA", categoria: "ELECTROMEDICO" },
  { key: "longitudOnda", label: "Longitud de onda (nanómetro)", shortLabel: "LONG. ONDA", categoria: "ELECTROMEDICO" },
  { key: "cantidadFuentes", label: "Cantidad de fuentes", shortLabel: "CANT. FUENTES", categoria: "ELECTROMEDICO" },
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
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: "85%", md: 800 },
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "4px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column" as const,
};

export default function TiposEquiposConfig() {
  const navigate = useNavigate();

  const [data, setData] = useState<TipoEquipo[]>(() => {
    try {
      const saved = localStorage.getItem("TIPOS_EQUIPOS_DATABASE");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: TipoEquipo) => ({
            ...item,
            booleanos: {
              ...initialBooleanos,
              ...item.booleanos,
            },
          }));
        }
      }
    } catch (e) {
      console.error("Error al leer TIPOS_EQUIPOS_DATABASE de localStorage", e);
    }
    return TIPOS_EQUIPOS_DATABASE;
  });

  // Lista dinámica de características
  const [caracteristicas, setCaracteristicas] = useState<CampoBooleanoDef[]>(() => {
    try {
      const saved = localStorage.getItem("CAMPOS_CARACTERISTICAS_CONFIG");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const baseKeys = CAMPOS_BOOLEANOS_CONFIG.map((b) => b.key);
          const customOnly = parsed.filter(
            (p: CampoBooleanoDef) => !baseKeys.includes(p.key) && p.key !== "unidad"
          );
          return [...CAMPOS_BOOLEANOS_CONFIG, ...customOnly];
        }
      }
    } catch (e) {
      console.error("Error al leer CAMPOS_CARACTERISTICAS_CONFIG", e);
    }
    return CAMPOS_BOOLEANOS_CONFIG;
  });

  // Filtros de búsqueda estilo EquipamientosConfig
  const [filtroTipologia, setFiltroTipologia] = useState<string | null>(null);
  const [filtroServicio, setFiltroServicio] = useState<string | null>(null);
  const [filtroCaracteristicas, setFiltroCaracteristicas] = useState<CampoBooleanoDef[]>([]);
  const [criterioCaract, setCriterioCaract] = useState<"todas" | "alguna">("todas");

  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    tipologia: string | null;
    servicio: string | null;
    caracteristicas: CampoBooleanoDef[];
    criterioCaract: "todas" | "alguna";
  }>({
    tipologia: null,
    servicio: null,
    caracteristicas: [],
    criterioCaract: "todas",
  });

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<TipoEquipo, "id">>(initialItemState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Agregar característica personalizada dentro del modal
  const [showAddCaract, setShowAddCaract] = useState(false);
  const [newCaractLabel, setNewCaractLabel] = useState("");
  const [newCaractCat, setNewCaractCat] = useState<"IDENTIFICACION" | "OPERATIVO" | "ELECTROMEDICO">("IDENTIFICACION");
  const [newCaractActiva, setNewCaractActiva] = useState(true);

  // Notificaciones
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // Filtro de datos para la grilla
  const dataFiltrada = useMemo(() => {
    return data.filter((item) => {
      const matchTipologia =
        !filtrosAplicados.tipologia || item.tipologia === filtrosAplicados.tipologia;
      const matchServicio =
        !filtrosAplicados.servicio ||
        item.nombre.toUpperCase().includes(filtrosAplicados.servicio.toUpperCase());
      const matchCaracteristicas =
        filtrosAplicados.caracteristicas.length === 0 ||
        (filtrosAplicados.criterioCaract === "alguna"
          ? filtrosAplicados.caracteristicas.some(
            (c) => Boolean(item.booleanos && item.booleanos[c.key])
          )
          : filtrosAplicados.caracteristicas.every(
            (c) => Boolean(item.booleanos && item.booleanos[c.key])
          ));
      return matchTipologia && matchServicio && matchCaracteristicas;
    });
  }, [data, filtrosAplicados]);

  // Manejo de Filtros
  const handleLimpiarFiltros = () => {
    setFiltroTipologia(null);
    setFiltroServicio(null);
    setFiltroCaracteristicas([]);
    setCriterioCaract("todas");
    setFiltrosAplicados({
      tipologia: null,
      servicio: null,
      caracteristicas: [],
      criterioCaract: "todas",
    });
  };

  const handleConsultar = () => {
    setFiltrosAplicados({
      tipologia: filtroTipologia,
      servicio: filtroServicio,
      caracteristicas: filtroCaracteristicas,
      criterioCaract: criterioCaract,
    });
  };

  // Apertura de Modal
  const handleOpenNuevo = () => {
    const initialBools: CamposBooleanos = { ...initialBooleanos };
    caracteristicas.forEach((c) => {
      if (initialBools[c.key] === undefined) {
        initialBools[c.key] = false;
      }
    });
    setFormData({
      ...initialItemState,
      tipologia: filtroTipologia || "RADIOFÍSICA",
      nombre: "",
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
    if (window.confirm("¿Confirma que desea eliminar este tipo de servicio / equipo?")) {
      const updated = data.filter((it) => it.id !== id);
      setData(updated);
      localStorage.setItem("TIPOS_EQUIPOS_DATABASE", JSON.stringify(updated));
      setSnackbar({ open: true, message: "Servicio eliminado correctamente" });
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("¿Desea restablecer los requerimientos y características por defecto?")) {
      setData(TIPOS_EQUIPOS_DATABASE);
      setCaracteristicas(CAMPOS_BOOLEANOS_CONFIG);
      localStorage.removeItem("TIPOS_EQUIPOS_DATABASE");
      localStorage.removeItem("CAMPOS_CARACTERISTICAS_CONFIG");
      setSnackbar({ open: true, message: "Valores por defecto restablecidos con éxito" });
    }
  };

  // Manejo de Switches en el Modal
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

    const cleanKey =
      "caract_" +
      nombreLimpio.toLowerCase().replace(/[^a-z0-9]/g, "_") +
      "_" +
      Date.now();
    const nuevaDef: CampoBooleanoDef = {
      key: cleanKey,
      label: nombreLimpio,
      shortLabel: nombreLimpio.toUpperCase(),
      categoria: newCaractCat,
    };

    const updatedDefs = [...caracteristicas, nuevaDef];
    setCaracteristicas(updatedDefs);
    localStorage.setItem("CAMPOS_CARACTERISTICAS_CONFIG", JSON.stringify(updatedDefs));

    setFormData((prev) => ({
      ...prev,
      booleanos: {
        ...prev.booleanos,
        [cleanKey]: newCaractActiva,
      },
    }));

    setData((prev) => {
      const updated = prev.map((it) => ({
        ...it,
        booleanos: {
          ...it.booleanos,
          [cleanKey]: it.id === editingId ? newCaractActiva : false,
        },
      }));
      localStorage.setItem("TIPOS_EQUIPOS_DATABASE", JSON.stringify(updated));
      return updated;
    });

    setNewCaractLabel("");
    setShowAddCaract(false);
    setNewCaractActiva(true);
  };

  const handleEliminarCaracteristica = (keyToDelete: string) => {
    if (window.confirm("¿Desea eliminar esta característica personalizada?")) {
      const updatedDefs = caracteristicas.filter((c) => c.key !== keyToDelete);
      setCaracteristicas(updatedDefs);
      localStorage.setItem("CAMPOS_CARACTERISTICAS_CONFIG", JSON.stringify(updatedDefs));

      setFormData((prev) => {
        const copy = { ...prev.booleanos };
        delete copy[keyToDelete];
        return { ...prev, booleanos: copy };
      });

      setData((prev) => {
        const updated = prev.map((it) => {
          const copy = { ...it.booleanos };
          delete copy[keyToDelete];
          return { ...it, booleanos: copy };
        });
        localStorage.setItem("TIPOS_EQUIPOS_DATABASE", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.tipologia) errors.tipologia = "El servicio externo es obligatorio.";
    if (!formData.nombre.trim())
      errors.nombre = "El nombre del servicio es obligatorio.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGuardarModal = () => {
    if (!validateForm()) return;

    let updatedData: TipoEquipo[];
    const nombreNormalizado = formData.nombre.trim().toUpperCase();

    if (isEditing && editingId) {
      updatedData = data.map((it) =>
        it.id === editingId
          ? { ...formData, id: editingId, nombre: nombreNormalizado }
          : it
      );
    } else {
      const nuevo: TipoEquipo = {
        ...formData,
        id: Date.now(),
        nombre: nombreNormalizado,
      };
      updatedData = [...data, nuevo];
    }

    setData(updatedData);
    localStorage.setItem("TIPOS_EQUIPOS_DATABASE", JSON.stringify(updatedData));
    setOpenModal(false);
    setSnackbar({
      open: true,
      message: `Requerimientos guardados para "${nombreNormalizado}"`,
    });
  };

  // Opciones únicas para filtros y combos
  const opcionesTipologia = useMemo(
    () => [...new Set(data.map((i) => i.tipologia))].filter(Boolean).sort(),
    [data]
  );
  const opcionesServicio = useMemo(
    () => [...new Set(data.map((i) => i.nombre))].filter(Boolean).sort(),
    [data]
  );
  const opcionesNombresServicio = useMemo(() => {
    const base = [
      "RESONANCIA MAGNÉTICA",
      "RAYOS X",
      "LÁSER",
      "LÁSER / IPL",
      "ULTRAVIOLETA",
      "ELEMENTOS DE PROTECCIÓN PERSONAL",
      "TODOS LOS SERVICIOS",
    ];
    const fromData = data.map((d) => d.nombre.trim().toUpperCase()).filter(Boolean);
    return [...new Set([...base, ...fromData])].sort();
  }, [data]);

  return (
    <Layout>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "4px",
          border: "1px solid #e0e0e0",
          mb: 4,
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Cabecera Azul */}
        <Box
          sx={{
            backgroundColor: "#005596",
            color: "white",
            py: 2,
            position: "relative",
            textAlign: "center",
          }}
        >
          <IconButton
            size="small"
            onClick={() => navigate("/admin/gestion-recursos")}
            sx={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Gestión de Características por Equipo
          </Typography>
        </Box>

        <Box sx={{ p: 4, bgcolor: "white" }}>
          {/* Panel de Filtros */}
          <Paper
            variant="outlined"
            sx={{ p: 3, mb: 4, borderRadius: "4px", borderColor: "#e0e0e0" }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#0090d0", mb: 4, fontWeight: "bold" }}
            >
              Filtros de configuración de requerimientos de equipamiento
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  width: "100%",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ flex: "1 1 50%", width: "100%" }}>
                  <Autocomplete
                    options={opcionesTipologia}
                    value={filtroTipologia}
                    onChange={(_, v) => setFiltroTipologia(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Servicio Externo"
                        variant="standard"
                        fullWidth
                      />
                    )}
                  />
                </Box>

                <Box sx={{ flex: "1 1 50%", width: "100%" }}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={caracteristicas}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.key === value.key}
                    value={filtroCaracteristicas}
                    onChange={(_, v) => setFiltroCaracteristicas(v)}
                    renderOption={(props, option, { selected }) => {
                      const { key, ...optionProps } = props;
                      return (
                        <li key={key} {...optionProps}>
                          <Checkbox
                            size="small"
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2">{option.label}</Typography>
                            <Chip
                              label={
                                option.categoria === "IDENTIFICACION"
                                  ? "Identificación"
                                  : option.categoria === "OPERATIVO"
                                    ? "Operativo"
                                    : "Electromédico"
                              }
                              size="small"
                              sx={{
                                fontSize: "0.65rem",
                                height: 18,
                                bgcolor:
                                  option.categoria === "IDENTIFICACION"
                                    ? "#e3f2fd"
                                    : option.categoria === "OPERATIVO"
                                      ? "#fff3e0"
                                      : "#ede7f6",
                                color:
                                  option.categoria === "IDENTIFICACION"
                                    ? "#0d47a1"
                                    : option.categoria === "OPERATIVO"
                                      ? "#e65100"
                                      : "#4a148c",
                              }}
                            />
                          </Box>
                        </li>
                      );
                    }}
                    renderValue={(value: CampoBooleanoDef[], getItemProps) =>
                      value.map((option: CampoBooleanoDef, index: number) => {
                        const { key, ...itemProps } = getItemProps({ index });
                        return (
                          <Chip
                            key={key}
                            label={option.label}
                            size="small"
                            sx={{
                              fontSize: "0.75rem",
                              height: 24,
                              bgcolor: "#e0f2fe",
                              color: "#005596",
                              fontWeight: 500,
                            }}
                            {...itemProps}
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Características"
                        placeholder={
                          filtroCaracteristicas.length === 0
                            ? "Seleccionar características..."
                            : ""
                        }
                        fullWidth
                      />
                    )}
                  />

                  {filtroCaracteristicas.length > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", fontWeight: 500 }}
                      >
                        Criterio:
                      </Typography>
                      <Chip
                        label="Contiene todas"
                        size="small"
                        clickable
                        onClick={() => setCriterioCaract("todas")}
                        color={criterioCaract === "todas" ? "primary" : "default"}
                        variant={criterioCaract === "todas" ? "filled" : "outlined"}
                        sx={{ fontSize: "0.7rem", height: 22 }}
                      />
                      <Chip
                        label="Al menos una"
                        size="small"
                        clickable
                        onClick={() => setCriterioCaract("alguna")}
                        color={criterioCaract === "alguna" ? "primary" : "default"}
                        variant={criterioCaract === "alguna" ? "filled" : "outlined"}
                        sx={{ fontSize: "0.7rem", height: 22 }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                  width: "100%",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleLimpiarFiltros}
                  sx={{
                    color: "#29b6f6",
                    borderColor: "#29b6f6",
                    px: 5,
                    fontWeight: "bold",
                  }}
                >
                  LIMPIAR
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleConsultar}
                  sx={{ backgroundColor: "#29b6f6", px: 5, fontWeight: "bold" }}
                >
                  CONSULTAR
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Barra Superior de la Tabla */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#0090d0", fontWeight: "bold" }}
            >
              REQUERIMIENTOS POR SERVICIO EXTERNO
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ bgcolor: "#29b6f6", fontWeight: "bold" }}
                onClick={handleOpenNuevo}
              >
                NUEVO SUBSERVICIO
              </Button>
            </Box>
          </Box>

          {/* Tabla idéntica a EquipamientosConfig */}
          <TableContainer
            sx={{ border: "1px solid #eee", borderRadius: "4px" }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      backgroundColor: "white",
                      borderBottom: "2px solid #005596",
                      color: "#005596",
                      fontWeight: "bold",
                      py: 2,
                    },
                  }}
                >
                  <TableCell sx={{ minWidth: "250px" }}>SUBSERVICIO</TableCell>
                  <TableCell sx={{ minWidth: "350px" }}>
                    CARACTERÍSTICAS ACTIVAS
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: "120px" }}>
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataFiltrada.map((row) => {
                  const activeFeatures = caracteristicas.filter(
                    (c) => !!row.booleanos[c.key]
                  );
                  return (
                    <TableRow key={row.id} hover>
                      {/* TIPO DE SERVICIO (Ej: RESONANCIA MAGNÉTICA) */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: "#1e293b",
                            letterSpacing: "0.2px",
                          }}
                        >
                          {row.nombre}
                        </Typography>
                      </TableCell>

                      {/* CARACTERÍSTICAS ACTIVAS (CAMPOS ELEGIDOS CON TOOLTIP) */}
                      <TableCell>
                        {activeFeatures.length === 0 ? (
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                            Sin características requeridas
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.8,
                              flexWrap: "wrap",
                              alignItems: "center",
                              py: 0.5,
                            }}
                          >
                            {activeFeatures.map((f) => {
                              const isMatchInFilter = filtrosAplicados.caracteristicas.some(
                                (fc) => fc.key === f.key
                              );
                              return (
                                <Tooltip
                                  key={f.key}
                                  title={`Campo requerido: ${f.label}${isMatchInFilter ? " (Coincide con filtro)" : ""
                                    }`}
                                  arrow
                                  placement="top"
                                >
                                  <Chip
                                    label={f.shortLabel || f.label}
                                    size="small"
                                    variant={isMatchInFilter ? "filled" : "outlined"}
                                    sx={{
                                      fontSize: "0.7rem",
                                      height: 22,
                                      borderColor: isMatchInFilter ? "#0284c7" : "#cbd5e1",
                                      color: isMatchInFilter ? "#ffffff" : "#334155",
                                      bgcolor: isMatchInFilter ? "#0284c7" : "#f8fafc",
                                      fontWeight: isMatchInFilter ? 700 : 400,
                                      cursor: "pointer",
                                      "&:hover": {
                                        bgcolor: isMatchInFilter ? "#0369a1" : "#e2e8f0",
                                        borderColor: isMatchInFilter ? "#0369a1" : "#94a3b8",
                                      },
                                    }}
                                  />
                                </Tooltip>
                              );
                            })}
                          </Box>
                        )}
                      </TableCell>

                      {/* ACCIONES (CON BOTÓN Y MODAL CON SWITCHES) */}
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: "center", alignItems: "center" }}
                        >
                          <Tooltip title="Configurar requerimientos">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditar(row)}
                              sx={{
                                color: "#005596",
                                bgcolor: "rgba(0, 85, 150, 0.08)",
                                border: "1px solid rgba(0, 85, 150, 0.2)",
                                borderRadius: "8px",
                                p: 0.8,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "#005596",
                                  color: "white",
                                  borderColor: "#005596",
                                },
                              }}
                            >
                              <TuneIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            onClick={() => handleEliminar(row.id)}
                            color="error"
                            size="small"
                            title="Eliminar este tipo de servicio"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {dataFiltrada.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      sx={{
                        textAlign: "center",
                        py: 6,
                        color: "rgba(0, 0, 0, 0.38)",
                        fontWeight: "bold",
                      }}
                    >
                      NO SE ENCUENTRAN RESULTADOS PARA MOSTRAR
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* ── MODAL CON TODOS LOS SWITCHES ───────────────────────────────────── */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={styleModal}>
          {/* Header del Modal */}
          <Box
            sx={{
              bgcolor: "#005596",
              color: "white",
              p: 2,
              px: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              {isEditing
                ? `CONFIGURACIÓN DE CARACTERÍSTICAS: ${formData.nombre}`
                : "NUEVO SERVICIO EXTERNO"}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setOpenModal(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Cuerpo Scrollable del Modal */}
          <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
            {/* Paso 1: Tipología y Nombre del Servicio */}
            <Typography
              variant="subtitle2"
              sx={{
                color: "#0090d0",
                fontWeight: "bold",
                mb: 1.5,
                textTransform: "uppercase",
              }}
            >
              1. Identificación del Servicio Externo / Equipo
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
                mb: 3,
              }}
            >
              <FormControl
                variant="standard"
                fullWidth
                required
                error={!!formErrors.tipologia}
              >
                <InputLabel>Servicio Externo</InputLabel>
                <Select
                  value={formData.tipologia}
                  onChange={(e) =>
                    setFormData({ ...formData, tipologia: e.target.value })
                  }
                >
                  <MenuItem value="RADIOFÍSICA">RADIOFÍSICA</MenuItem>
                  <MenuItem value="CLÍNICAS">CLÍNICAS</MenuItem>
                  {OPCIONES_TIPOLOGIA.filter(
                    (t) => t !== "RADIOFÍSICA" && t !== "CLÍNICAS"
                  ).map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                freeSolo
                openOnFocus
                options={opcionesNombresServicio}
                value={formData.nombre}
                onChange={(_, newValue) => {
                  const val = typeof newValue === "string" ? newValue : newValue || "";
                  setFormData((prev) => ({ ...prev, nombre: val.toUpperCase() }));
                  if (formErrors.nombre) {
                    setFormErrors((prev) => ({ ...prev, nombre: "" }));
                  }
                }}
                onInputChange={(_, newInputValue) => {
                  setFormData((prev) => ({ ...prev, nombre: (newInputValue || "").toUpperCase() }));
                  if (formErrors.nombre) {
                    setFormErrors((prev) => ({ ...prev, nombre: "" }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Subservicio"
                    variant="standard"
                    placeholder="Ej. RESONANCIA MAGNÉTICA, RAYOS X..."
                    fullWidth
                    required
                    error={!!formErrors.nombre}
                    helperText={formErrors.nombre}
                  />
                )}
              />
            </Box>

            <Divider sx={{ my: 2.5 }} />

            {/* Paso 2: Todos los switches de características */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#0090d0",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                2. Requerimientos de Datos
              </Typography>

            </Box>

            {/* Grupos de características con todos sus switches */}
            <Stack spacing={2.5}>
              {GRUPOS_CARACTERISTICAS.map((grupo) => {
                const itemsGrupo = caracteristicas.filter(
                  (c) => c.categoria === grupo.id
                );
                if (itemsGrupo.length === 0) return null;

                return (
                  <Box key={grupo.id}>
                    <Typography
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: "bold",
                        color: "#475569",
                        bgcolor: "#f8fafc",
                        p: 1,
                        px: 1.5,
                        borderRadius: "4px",
                        borderLeft: "3px solid #005596",
                        mb: 1.2,
                      }}
                    >
                      {grupo.titulo}
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 1.2,
                      }}
                    >
                      {itemsGrupo.map((c) => {
                        const isCustom = c.key.startsWith("caract_");
                        const activa = !!formData.booleanos[c.key];
                        return (
                          <Paper
                            key={c.key}
                            variant="outlined"
                            sx={{
                              p: 1,
                              px: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderColor: activa ? "#93c5fd" : "#e2e8f0",
                              bgcolor: activa ? "#f0f9ff" : "#ffffff",
                              borderRadius: "4px",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                                overflow: "hidden",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.82rem",
                                  fontWeight: activa ? 700 : 500,
                                  color: activa ? "#0369a1" : "#334155",
                                }}
                                noWrap
                              >
                                {c.label}
                              </Typography>
                              {isCustom && (
                                <Tooltip title="Eliminar característica personalizada">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleEliminarCaracteristica(c.key)
                                    }
                                    sx={{
                                      color: "#ef4444",
                                      p: 0.2,
                                      "&:hover": { bgcolor: "#fee2e2" },
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={activa}
                                  onChange={() => handleToggleBooleano(c.key)}
                                  color="primary"
                                  size="small"
                                />
                              }
                              label={
                                <Typography
                                  sx={{
                                    fontSize: "0.75rem",
                                    fontWeight: "bold",
                                    color: activa ? "#0284c7" : "#94a3b8",
                                    minWidth: 24,
                                  }}
                                >
                                  {activa ? "SÍ" : "NO"}
                                </Typography>
                              }
                              labelPlacement="start"
                              sx={{ m: 0 }}
                            />
                          </Paper>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Botones de Acción del Modal */}
          <Box
            sx={{
              p: 2,
              px: 3,
              bgcolor: "#f8fafc",
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setOpenModal(false)}
              sx={{
                color: "#64748b",
                borderColor: "#cbd5e1",
                fontWeight: "bold",
                px: 3,
              }}
            >
              CANCELAR
            </Button>
            <Button
              variant="contained"
              onClick={handleGuardarModal}
              sx={{
                bgcolor: "#005596",
                fontWeight: "bold",
                px: 4,
                "&:hover": { bgcolor: "#003b66" },
              }}
            >
              GUARDAR
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar de Notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="success"
          variant="filled"
          sx={{ width: "100%", fontWeight: "bold" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
