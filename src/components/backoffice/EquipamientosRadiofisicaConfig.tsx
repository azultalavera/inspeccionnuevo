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
  Tooltip,
  Autocomplete,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Sensors as SensorsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Layout from "../ui/Layout";
import { RADIOFISICA_CATALOG } from "../../data/radiofisicaConfig";

const styleModal = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxWidth: "95vw",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  overflow: "hidden",
};

export interface EquipamientoRadiofisicaItem {
  id: string | number;
  servicio: string;
  subservicio: string;
  equipamiento: string;
  minimo: number;
}

const INITIAL_RADIOFISICA_DATA: EquipamientoRadiofisicaItem[] = [
  {
    id: "rf-1",
    servicio: "Rayos X",
    subservicio: "Radiología Convencional Simple",
    equipamiento: "TUBO DE RAYOS X Y GENERADOR DE ALTA FRECUENCIA",
    minimo: 1,
  },
  {
    id: "rf-2",
    servicio: "Rayos X",
    subservicio: "Radiología Convencional Simple",
    equipamiento: "ESTATIVO DE PARED CON BUCKY VERTICAL",
    minimo: 1,
  },
  {
    id: "rf-3",
    servicio: "Rayos X",
    subservicio: "Mamografía",
    equipamiento: "MAMÓGRAFO DIGITAL DIRECTO (FFDM)",
    minimo: 1,
  },
  {
    id: "rf-4",
    servicio: "Rayos X",
    subservicio: "Tomografía Computada / PET",
    equipamiento: "TOMÓGRAFO COMPUTADO MULTISLICE",
    minimo: 1,
  },
  {
    id: "rf-5",
    servicio: "Rayos X",
    subservicio: "Tomografía Computada / PET",
    equipamiento: "INVERSOR / INYECTOR AUTOMÁTICO DE CONTRASTE",
    minimo: 1,
  },
  {
    id: "rf-6",
    servicio: "Rayos X",
    subservicio: "Radiología Intervencionista: Arco en C",
    equipamiento: "ARCO EN C CON INTENSIFICADOR DE IMAGEN / DETECTOR PLANO",
    minimo: 1,
  },
  {
    id: "rf-7",
    servicio: "Rayos X",
    subservicio: "Ortopantomografía",
    equipamiento: "ORTOPANTOMÓGRAFO PANORÁMICO DIGITAL (OPG)",
    minimo: 1,
  },
  {
    id: "rf-8",
    servicio: "Rayos X",
    subservicio: "Radiología Dental: Periapical",
    equipamiento: "EQUIPO DE RAYOS X DENTAL PERIAPICAL",
    minimo: 1,
  },
  {
    id: "rf-9",
    servicio: "Rayos X",
    subservicio: "Densitometría Ósea",
    equipamiento: "DENSITÓMETRO ÓSEO DEXA",
    minimo: 1,
  },
  {
    id: "rf-10",
    servicio: "Rayos X",
    subservicio: "Radiología Rodante en Terapia",
    equipamiento: "EQUIPO DE RAYOS X RODANTE PORTÁTIL",
    minimo: 1,
  },
  {
    id: "rf-11",
    servicio: "Rayos X",
    subservicio: "Acelerador Lineal de Electrones",
    equipamiento: "ACELERADOR LINEAL DE ALTA ENERGÍA (LINAC)",
    minimo: 1,
  },
  {
    id: "rf-12",
    servicio: "Láser / IPL",
    subservicio: "Dermatología",
    equipamiento: "EQUIPO LÁSER DERMATOLÓGICO CLASE 4 (CO2 / ND:YAG / ERBIO)",
    minimo: 1,
  },
  {
    id: "rf-13",
    servicio: "Láser / IPL",
    subservicio: "Depilación",
    equipamiento: "SISTEMA LÁSER DE DEPILACIÓN MÉDICA / DIODO",
    minimo: 1,
  },
  {
    id: "rf-14",
    servicio: "Láser / IPL",
    subservicio: "Oftalmología",
    equipamiento: "LÁSER OFTALMOLÓGICO DE FOTOCOAGULACIÓN (ARGÓN / SLT / YAG)",
    minimo: 1,
  },
  {
    id: "rf-15",
    servicio: "Resonancia Magnética",
    subservicio: "Resonancia Magnética Nuclear",
    equipamiento: "RESONADOR MAGNÉTICO NUCLEAR DE ALTO CAMPO (1.5T / 3T)",
    minimo: 1,
  },
  {
    id: "rf-16",
    servicio: "Radiación Ultravioleta",
    subservicio: "Cama Solar",
    equipamiento: "CAMA SOLAR EMISORA DE RADIACIÓN ULTRAVIOLETA (UVA)",
    minimo: 1,
  },
  {
    id: "rf-17",
    servicio: "Radiación Ultravioleta",
    subservicio: "Cabina Solar",
    equipamiento: "CABINA SOLAR VERTICAL EMISORA UV",
    minimo: 1,
  },
];

const LOCAL_STORAGE_KEY = "EQUIPAMIENTOS_RADIOFISICA_DATA_V2";

export default function EquipamientosRadiofisicaConfig() {
  const navigate = useNavigate();

  const [data, setData] = useState<EquipamientoRadiofisicaItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            id: item.id,
            servicio: item.servicio || item.categoria || "Rayos X",
            subservicio: item.subservicio || item.origen || "",
            equipamiento: item.equipamiento || "",
            minimo: Number(item.minimo ?? item.cantidadMinima ?? 1),
          }));
        }
      }
    } catch (e) {
      console.error("Error reading localStorage for Equipamientos Radiofísica", e);
    }
    return INITIAL_RADIOFISICA_DATA;
  });

  const saveToStorage = (newData: EquipamientoRadiofisicaItem[]) => {
    setData(newData);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error("Error saving Equipamientos Radiofísica to localStorage", e);
    }
  };

  // Opciones de Servicio
  const opcionesServicio = useMemo(() => {
    const fromCatalog = RADIOFISICA_CATALOG.map((c) => c.nombre);
    const fromData = data.map((d) => d.servicio).filter(Boolean);
    return Array.from(new Set([...fromCatalog, ...fromData])).sort();
  }, [data]);

  // Opciones de Subservicio
  const opcionesSubservicio = useMemo(() => {
    const fromCatalog = RADIOFISICA_CATALOG.flatMap((c) =>
      c.subservicios.map((s) => s.nombre)
    );
    const fromData = data.map((d) => d.subservicio).filter(Boolean);
    return Array.from(new Set([...fromCatalog, ...fromData])).sort();
  }, [data]);

  // Filtros
  const [filtroServicio, setFiltroServicio] = useState<string | null>(null);
  const [filtroSubservicio, setFiltroSubservicio] = useState<string | null>(null);
  const [filtroEquipamiento, setFiltroEquipamiento] = useState<string | null>(null);

  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    servicio: string | null;
    subservicio: string | null;
    equipamiento: string | null;
  }>({
    servicio: null,
    subservicio: null,
    equipamiento: null,
  });

  // Modal de alta / edición
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<EquipamientoRadiofisicaItem>({
    id: "",
    servicio: "Rayos X",
    subservicio: "",
    equipamiento: "",
    minimo: 1,
  });

  const dataFiltrada = useMemo(() => {
    return data.filter((item) => {
      return (
        (!filtrosAplicados.servicio ||
          item.servicio === filtrosAplicados.servicio) &&
        (!filtrosAplicados.subservicio ||
          item.subservicio === filtrosAplicados.subservicio) &&
        (!filtrosAplicados.equipamiento ||
          item.equipamiento
            ?.toLowerCase()
            .includes(filtrosAplicados.equipamiento.toLowerCase()))
      );
    });
  }, [data, filtrosAplicados]);

  const handleBorrar = (id: string | number) => {
    if (!window.confirm("¿Desea eliminar este equipamiento de Radiofísica?")) return;
    const updated = data.filter((item) => item.id !== id);
    saveToStorage(updated);
  };

  const handleGuardar = () => {
    if (!currentItem.servicio?.trim()) {
      alert("Por favor seleccione o ingrese el Tipo de Servicio");
      return;
    }
    if (!currentItem.subservicio?.trim()) {
      alert("Por favor seleccione o ingrese el Servicio");
      return;
    }
    if (!currentItem.equipamiento?.trim()) {
      alert("Por favor ingrese el nombre del equipamiento");
      return;
    }

    const payload: EquipamientoRadiofisicaItem = {
      ...currentItem,
      servicio: currentItem.servicio.trim(),
      subservicio: currentItem.subservicio.trim(),
      equipamiento: currentItem.equipamiento.trim().toUpperCase(),
      minimo: Math.max(1, Number(currentItem.minimo) || 1),
    };

    if (isEditing) {
      const updated = data.map((item) => (item.id === payload.id ? payload : item));
      saveToStorage(updated);
    } else {
      payload.id = `rf-${Date.now()}`;
      saveToStorage([payload, ...data]);
    }
    setOpen(false);
  };

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
            px: 3,
            textAlign: "center",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            size="small"
            onClick={() => navigate("/admin/gestion-recursos")}
            sx={{
              position: "absolute",
              left: 20,
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SensorsIcon sx={{ fontSize: 26, opacity: 0.9 }} />
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Gestión de Equipamientos de Radiofísica
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 4, bgcolor: "white" }}>
          {/* Panel de Filtros */}
          <Paper
            variant="outlined"
            sx={{ p: 3, mb: 4, borderRadius: "4px", borderColor: "#e0e0e0" }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#0090d0", mb: 3, fontWeight: "bold" }}
            >
              Filtros de configuración de equipamiento de radiofísica
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", gap: 4, width: "100%" }}>
                <Box sx={{ flex: "1 1 50%" }}>
                  <Autocomplete
                    options={opcionesServicio}
                    value={filtroServicio}
                    onChange={(_, v) => {
                      setFiltroServicio(v);
                      setFiltroSubservicio(null);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo de Servicio"
                        variant="standard"
                        fullWidth
                      />
                    )}
                  />
                </Box>
                <Box sx={{ flex: "1 1 50%" }}>
                  <Autocomplete
                    options={
                      filtroServicio
                        ? RADIOFISICA_CATALOG.find((c) => c.nombre === filtroServicio)
                            ?.subservicios.map((s) => s.nombre) || opcionesSubservicio
                        : opcionesSubservicio
                    }
                    value={filtroSubservicio}
                    onChange={(_, v) => setFiltroSubservicio(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Servicio"
                        variant="standard"
                        fullWidth
                      />
                    )}
                  />
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 4, width: "100%" }}>
                <Box sx={{ flex: "1 1 50%" }}>
                  <TextField
                    label="Equipamiento"
                    variant="standard"
                    fullWidth
                    value={filtroEquipamiento || ""}
                    onChange={(e) => setFiltroEquipamiento(e.target.value || null)}
                    placeholder="Buscar por nombre de equipamiento..."
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 1,
                  width: "100%",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFiltroServicio(null);
                    setFiltroSubservicio(null);
                    setFiltroEquipamiento(null);
                    setFiltrosAplicados({
                      servicio: null,
                      subservicio: null,
                      equipamiento: null,
                    });
                  }}
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
                  onClick={() => {
                    setFiltrosAplicados({
                      servicio: filtroServicio,
                      subservicio: filtroSubservicio,
                      equipamiento: filtroEquipamiento,
                    });
                  }}
                  sx={{ backgroundColor: "#29b6f6", px: 5, fontWeight: "bold" }}
                >
                  CONSULTAR
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Listado y Botón Nuevo */}
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
              EQUIPOS ({dataFiltrada.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ bgcolor: "#29b6f6", fontWeight: "bold" }}
              onClick={() => {
                setCurrentItem({
                  id: "",
                  servicio: "Rayos X",
                  subservicio: "",
                  equipamiento: "",
                  minimo: 1,
                });
                setIsEditing(false);
                setOpen(true);
              }}
            >
              NUEVO EQUIPO
            </Button>
          </Box>

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
                  <TableCell sx={{ width: "22%" }}>TIPO DE SERVICIO</TableCell>
                  <TableCell sx={{ width: "28%" }}>SERVICIO</TableCell>
                  <TableCell sx={{ width: "35%" }}>EQUIPAMIENTO</TableCell>
                  <TableCell align="center" sx={{ width: "10%" }}>MÍNIMO</TableCell>
                  <TableCell align="center" sx={{ width: "15%" }}>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataFiltrada.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0369a1" }}>
                      <Chip
                        label={row.servicio}
                        size="small"
                        sx={{
                          bgcolor: "#e0f2fe",
                          color: "#0369a1",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {row.subservicio}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {row.equipamiento}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: "#f1f5f9",
                          color: "#0f172a",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        {row.minimo}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setCurrentItem(row);
                              setIsEditing(true);
                              setOpen(true);
                            }}
                            sx={{ color: "#0284c7" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => handleBorrar(row.id)}
                            sx={{ color: "#ef4444" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {dataFiltrada.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      sx={{
                        textAlign: "center",
                        py: 6,
                        color: "rgba(0, 0, 0, 0.4)",
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

      {/* Modal de Nuevo / Editar */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={styleModal}>
          <Box
            sx={{
              bgcolor: "#005596",
              color: "white",
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {isEditing ? "EDITAR EQUIPO" : "NUEVO EQUIPO"}
            </Typography>
          </Box>
          <Box sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Autocomplete
                freeSolo
                options={opcionesServicio}
                value={currentItem.servicio || ""}
                onChange={(_, val) =>
                  setCurrentItem((prev) => ({
                    ...prev,
                    servicio: val || "",
                    subservicio: "",
                  }))
                }
                onInputChange={(_, val) =>
                  setCurrentItem((prev) => ({
                    ...prev,
                    servicio: val || "",
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo de Servicio"
                    variant="standard"
                    fullWidth
                    required
                  />
                )}
              />

              <Autocomplete
                freeSolo
                options={
                  RADIOFISICA_CATALOG.find(
                    (c) => c.nombre === currentItem.servicio
                  )?.subservicios.map((s) => s.nombre) || opcionesSubservicio
                }
                value={currentItem.subservicio || ""}
                onChange={(_, val) =>
                  setCurrentItem((prev) => ({ ...prev, subservicio: val || "" }))
                }
                onInputChange={(_, val) =>
                  setCurrentItem((prev) => ({ ...prev, subservicio: val || "" }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Servicio"
                    variant="standard"
                    fullWidth
                    required
                  />
                )}
              />

              <TextField
                label="Equipamiento"
                variant="standard"
                fullWidth
                required
                value={currentItem.equipamiento}
                onChange={(e) =>
                  setCurrentItem((prev) => ({
                    ...prev,
                    equipamiento: e.target.value,
                  }))
                }
                placeholder="Ej: TUBO DE RAYOS X..."
              />

              <TextField
                label="Mínimo"
                type="number"
                variant="standard"
                fullWidth
                required
                slotProps={{ htmlInput: { min: 1 } }}
                value={currentItem.minimo}
                onChange={(e) =>
                  setCurrentItem((prev) => ({
                    ...prev,
                    minimo: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
              />
            </Stack>

            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}
            >
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setOpen(false)}
              >
                CANCELAR
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={handleGuardar}
                sx={{ bgcolor: "#005596" }}
              >
                {isEditing ? "ACTUALIZAR" : "GUARDAR"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Layout>
  );
}
