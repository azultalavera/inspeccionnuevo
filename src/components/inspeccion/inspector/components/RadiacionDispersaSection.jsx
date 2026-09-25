import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
  Tooltip,
  MenuItem,
  Select,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TuneIcon from "@mui/icons-material/Tune";
import SensorsIcon from "@mui/icons-material/Sensors";
import CloseIcon from "@mui/icons-material/Close";

export default function RadiacionDispersaSection({
  fields = [],
  inspectorData = {},
  onChange,
  onOpenObs,
}) {
  // Helper para leer valor de campos de inspección
  const getFieldValue = (fieldId, fallback = "") => {
    const item = inspectorData[fieldId];
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return item.value !== undefined && item.value !== null ? item.value : fallback;
    }
    return item !== undefined && item !== null ? item : fallback;
  };

  // Helper para limpiar unidades si vinieran en el string
  const stripUnit = (val, unit) => {
    if (val === null || val === undefined) return "";
    let str = String(val).trim();
    if (unit && str.toLowerCase().endsWith(unit.toLowerCase())) {
      str = str.slice(0, -unit.length).trim();
    }
    return str;
  };

  // Condiciones de la prueba (inician vacíos, con unidad automática)
  const maVal = stripUnit(getFieldValue("f-disp-ma", ""), "mA");
  const kvVal = stripUnit(getFieldValue("f-disp-kv", ""), "kV");
  const tVal = stripUnit(getFieldValue("f-disp-t", ""), "Seg");
  const fondoRaw = getFieldValue("f-disp-fondo", "");
  const fondoVal = stripUnit(fondoRaw, "µSv/h");
  const fondoNum = fondoVal !== "" && !isNaN(Number(fondoVal)) ? Number(fondoVal) : 0;

  // Mediciones actuales (inicia sin filas por defecto)
  const mediciones = useMemo(() => {
    const raw = inspectorData["f-disp-mediciones"];
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && Array.isArray(raw.value)) return raw.value;
    return [];
  }, [inspectorData]);

  // Actualizar lista de mediciones
  const updateMediciones = (newList) => {
    if (onChange) {
      onChange("f-disp-mediciones", newList);
    }
  };

  // Calcular valor corregido = medido - fondo
  const calcCorregido = (medido, fondo) => {
    if (medido === "" || medido === null || medido === undefined || isNaN(Number(medido))) return "";
    const fondoParsed = isNaN(Number(fondo)) ? 0 : Number(fondo);
    const res = Number(medido) - fondoParsed;
    return Math.max(0, parseFloat(res.toFixed(3)));
  };

  // Modificar una condición de prueba
  const handleConditionChange = (fieldId, val) => {
    if (onChange) {
      onChange(fieldId, val);
      // Si cambia el fondo, recalcular valores corregidos automáticos
      if (fieldId === "f-disp-fondo") {
        const nuevoFondo = val !== "" && !isNaN(Number(val)) ? Number(val) : 0;
        const actualizadas = mediciones.map((m) => {
          if (m.manualCorregido) return m;
          const nuevoCorregido = calcCorregido(m.medido, nuevoFondo);
          return {
            ...m,
            corregido: nuevoCorregido !== "" ? Number(nuevoCorregido) : 0,
          };
        });
        onChange("f-disp-mediciones", actualizadas);
      }
    }
  };

  // Estado del Modal (para Agregar y Editar, inicia vacío)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLugar, setFormLugar] = useState("");
  const [formMedido, setFormMedido] = useState("");
  const [formCorregido, setFormCorregido] = useState("");
  const [formUnidad, setFormUnidad] = useState("µSv/h");
  const [formManualCorregido, setFormManualCorregido] = useState(false);
  const [formError, setFormError] = useState("");

  // Abrir modal para Agregar (inicia vacío y unidad automática)
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormLugar("");
    setFormMedido("");
    setFormCorregido("");
    setFormUnidad("µSv/h");
    setFormManualCorregido(false);
    setFormError("");
    setModalOpen(true);
  };

  // Abrir modal para Editar
  const handleOpenEditModal = (row) => {
    setEditingId(row.id);
    setFormLugar(row.lugar || "");
    setFormMedido(row.medido !== undefined && row.medido !== null ? row.medido : "");
    setFormCorregido(row.corregido !== undefined && row.corregido !== null ? row.corregido : "");
    setFormUnidad(row.unidad || "µSv/h");
    setFormManualCorregido(Boolean(row.manualCorregido));
    setFormError("");
    setModalOpen(true);
  };

  // Al escribir valor medido en el modal
  const handleFormMedidoChange = (val) => {
    setFormMedido(val);
    if (!formManualCorregido) {
      if (val === "" || isNaN(Number(val))) {
        setFormCorregido("");
      } else {
        setFormCorregido(calcCorregido(val, fondoNum));
      }
    }
  };

  // Al editar valor corregido en el modal
  const handleFormCorregidoChange = (val) => {
    setFormCorregido(val);
    setFormManualCorregido(true);
  };

  // Restablecer fórmula automática en el modal
  const handleResetFormFormula = () => {
    if (formMedido === "" || isNaN(Number(formMedido))) {
      setFormCorregido("");
    } else {
      setFormCorregido(calcCorregido(formMedido, fondoNum));
    }
    setFormManualCorregido(false);
  };

  // Guardar en el modal (crear o actualizar)
  const handleSaveModal = () => {
    if (!formLugar.trim()) {
      setFormError("Debe indicar el lugar o posición de la medición.");
      return;
    }
    if (formMedido === "" || isNaN(Number(formMedido))) {
      setFormError("Debe ingresar un valor medido numérico válido.");
      return;
    }

    const medidoNum = Number(formMedido);
    const corregidoCalculado = calcCorregido(medidoNum, fondoNum);
    const corregidoNum = formCorregido !== "" && !isNaN(Number(formCorregido))
      ? Number(formCorregido)
      : (corregidoCalculado !== "" ? Number(corregidoCalculado) : 0);

    const unidadFinal = formUnidad || "µSv/h";

    if (editingId) {
      // Editar medición existente
      const updated = mediciones.map((m) =>
        m.id === editingId
          ? {
              ...m,
              lugar: formLugar.trim(),
              medido: medidoNum,
              corregido: corregidoNum,
              unidad: unidadFinal,
              manualCorregido: formManualCorregido,
            }
          : m
      );
      updateMediciones(updated);
    } else {
      // Agregar nueva medición
      const newId = `disp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newRow = {
        id: newId,
        lugar: formLugar.trim(),
        medido: medidoNum,
        corregido: corregidoNum,
        unidad: unidadFinal,
        manualCorregido: formManualCorregido,
      };
      updateMediciones([...mediciones, newRow]);
    }

    setModalOpen(false);
  };

  // Eliminar medición
  const handleDeleteMedicion = (idToRemove) => {
    const filtered = mediciones.filter((m) => m.id !== idToRemove);
    updateMediciones(filtered);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%" }}>
      {/* 1. Panel de Condiciones de la Prueba */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <TuneIcon sx={{ color: "#0284c7", fontSize: 20 }} />
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              color: "#1e293b",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            Condiciones de la Prueba
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
              mA:
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="0"
              value={maVal}
              onChange={(e) => handleConditionChange("f-disp-ma", e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontWeight: 800, color: "#64748b", fontSize: "0.82rem" }}>
                        mA
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
              kV:
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="0"
              value={kvVal}
              onChange={(e) => handleConditionChange("f-disp-kv", e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontWeight: 800, color: "#64748b", fontSize: "0.82rem" }}>
                        kV
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
              T:
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="0.0"
              value={tVal}
              onChange={(e) => handleConditionChange("f-disp-t", e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontWeight: 800, color: "#64748b", fontSize: "0.82rem" }}>
                        Seg
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
              Radiación de fondo:
            </Typography>
            <TextField
              size="small"
              type="number"
              slotProps={{
                htmlInput: { step: "0.01", min: "0" },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontWeight: 800, color: "#64748b", fontSize: "0.82rem" }}>
                        µSv/h
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
              fullWidth
              placeholder="0.00"
              value={fondoVal}
              onChange={(e) => handleConditionChange("f-disp-fondo", e.target.value)}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 2. Cabecera de Mediciones con botón Agregar Medición */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SensorsIcon sx={{ color: "#0284c7" }} />
          <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
            Mediciones de Radiación Dispersa
          </Typography>
          {mediciones.length > 0 && (
            <Chip
              size="small"
              label={`${mediciones.length} ${mediciones.length === 1 ? "medición" : "mediciones"}`}
              sx={{ bgcolor: "#e0f2fe", color: "#0369a1", fontWeight: 800, fontSize: "11px" }}
            />
          )}
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
          sx={{
            bgcolor: "#0284c7",
            color: "#ffffff",
            fontWeight: 800,
            textTransform: "none",
            borderRadius: 2,
            px: 2,
            "&:hover": { bgcolor: "#0369a1" },
          }}
        >
          Agregar medición
        </Button>
      </Box>

      {/* 3. Tabla Fija de Mediciones con acciones Editar y Borrar */}
      {mediciones.length === 0 ? (
        <Box
          sx={{
            py: 4,
            px: 2,
            textAlign: "center",
            bgcolor: "#f8fafc",
            border: "1px dashed #cbd5e1",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Typography sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.9rem" }}>
            No hay mediciones registradas en este apartado.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            sx={{
              borderColor: "#0284c7",
              color: "#0284c7",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { borderColor: "#0369a1", bgcolor: "#f0f9ff" },
            }}
          >
            Agregar primera medición
          </Button>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#ffffff",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.78rem", py: 1.5, width: 50 }}>
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.78rem", minWidth: 240 }}>
                  LUGAR DE LA MEDICIÓN
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.78rem", width: 150 }}>
                  VALOR MEDIDO
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.78rem", width: 180 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    VALOR CORREGIDO
                    <Tooltip title="Calculado automáticamente: Valor medido - Radiación de fondo.">
                      <CalculateIcon sx={{ fontSize: 16, color: "#64748b" }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.78rem", width: 110 }}>
                  UNIDAD
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#334155", fontSize: "0.78rem", width: 110 }}>
                  ACCIONES
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {mediciones.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  hover
                  sx={{
                    "&:nth-of-type(even)": { bgcolor: "#fbfcfe" },
                    "&:hover": { bgcolor: "#f1f5f9" },
                  }}
                >
                  {/* # */}
                  <TableCell sx={{ color: "#64748b", fontWeight: 800, fontSize: "0.82rem" }}>
                    #{index + 1}
                  </TableCell>

                  {/* Lugar de la medición (Fijo / Texto) */}
                  <TableCell sx={{ py: 1.6 }}>
                    <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>
                      {row.lugar || "Sin especificar"}
                    </Typography>
                  </TableCell>

                  {/* Valor medido (Fijo / Texto) */}
                  <TableCell sx={{ py: 1.6 }}>
                    <Typography sx={{ fontWeight: 800, color: "#0369a1", fontSize: "0.88rem" }}>
                      {Number(row.medido).toFixed(2)} {row.unidad || "µSv/h"}
                    </Typography>
                  </TableCell>

                  {/* Valor corregido (Fijo / Texto con chip si es manual) */}
                  <TableCell sx={{ py: 1.6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Typography sx={{ fontWeight: 800, color: "#059669", fontSize: "0.88rem" }}>
                        {Number(row.corregido).toFixed(2)} {row.unidad || "µSv/h"}
                      </Typography>
                      {row.manualCorregido && (
                        <Tooltip title="Valor ajustado manualmente">
                          <Chip
                            label="Manual"
                            size="small"
                            sx={{ height: 18, fontSize: "10px", fontWeight: 800, bgcolor: "#fef3c7", color: "#b45309" }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>

                  {/* Unidad */}
                  <TableCell sx={{ py: 1.6 }}>
                    <Chip
                      label={row.unidad || "µSv/h"}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        bgcolor: "#f1f5f9",
                        color: "#334155",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </TableCell>

                  {/* Acciones: Editar y Borrar */}
                  <TableCell align="center" sx={{ py: 1.6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8 }}>
                      <Tooltip title="Editar medición">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditModal(row)}
                          sx={{
                            color: "#0284c7",
                            bgcolor: "#e0f2fe",
                            "&:hover": { bgcolor: "#bae6fd" },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Borrar medición">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteMedicion(row.id)}
                          sx={{
                            color: "#ef4444",
                            bgcolor: "#fee2e2",
                            "&:hover": { bgcolor: "#fecaca" },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 4. Modal para Agregar y Editar Medición */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: 1,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            pt: 1.5,
            px: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SensorsIcon sx={{ color: "#0284c7", fontSize: 24 }} />
            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#1e293b" }}>
              {editingId ? "Editar Medición de Radiación Dispersa" : "Agregar Medición de Radiación Dispersa"}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setModalOpen(false)}
            sx={{ color: "#94a3b8", "&:hover": { color: "#475569", bgcolor: "#f1f5f9" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2, py: 2 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontWeight: 600 }}>
              {formError}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 0.5 }}>
            {/* Input 1: Lugar de la medición */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", display: "block", mb: 0.6 }}>
                Lugar de la medición *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Ej: Comando / Detrás del biombo plomado, Puerta de acceso..."
                value={formLugar}
                onChange={(e) => {
                  setFormLugar(e.target.value);
                  if (formError) setFormError("");
                }}
                sx={{
                  bgcolor: "#ffffff",
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Box>

            {/* Input 2 & 3: Valor medido y Unidad */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", display: "block", mb: 0.6 }}>
                  Valor medido *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="0.00"
                  slotProps={{
                    htmlInput: { step: "0.01", min: "0" },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography sx={{ fontWeight: 800, color: "#0284c7", fontSize: "0.82rem" }}>
                            {formUnidad}
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                  value={formMedido}
                  onChange={(e) => handleFormMedidoChange(e.target.value)}
                  sx={{
                    bgcolor: "#ffffff",
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", display: "block", mb: 0.6 }}>
                  Unidad (automática)
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  value={formUnidad}
                  onChange={(e) => setFormUnidad(e.target.value)}
                  sx={{
                    bgcolor: "#ffffff",
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  <MenuItem value="µSv/h" sx={{ fontWeight: 700 }}>
                    µSv/h (Automática)
                  </MenuItem>
                  <MenuItem value="mSv/h" sx={{ fontWeight: 700 }}>
                    mSv/h
                  </MenuItem>
                </Select>
              </Box>
            </Box>

            {/* Banner informativo de Radiación de fondo */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" sx={{ color: "#0369a1", fontWeight: 700 }}>
                Radiación de fondo actual de la prueba:
              </Typography>
              <Chip
                label={fondoVal !== "" ? `${fondoVal} ${formUnidad}` : `0 ${formUnidad} (Sin valor definido)`}
                size="small"
                sx={{ bgcolor: "#ffffff", color: "#0284c7", fontWeight: 800, border: "1px solid #7dd3fc" }}
              />
            </Box>

            {/* Input 4: Valor corregido */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155" }}>
                  Valor corregido (Medido - Fondo)
                </Typography>
                {formManualCorregido && (
                  <Button
                    size="small"
                    startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
                    onClick={handleResetFormFormula}
                    sx={{
                      fontSize: "0.72rem",
                      textTransform: "none",
                      fontWeight: 700,
                      py: 0,
                      color: "#b45309",
                    }}
                  >
                    Volver a cálculo automático
                  </Button>
                )}
              </Box>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="0.00"
                slotProps={{
                  htmlInput: { step: "0.01", min: "0" },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ fontWeight: 800, color: "#059669", fontSize: "0.82rem" }}>
                          {formUnidad}
                        </Typography>
                      </InputAdornment>
                    ),
                  },
                }}
                value={formCorregido}
                onChange={(e) => handleFormCorregidoChange(e.target.value)}
                helperText={
                  formManualCorregido
                    ? "Modificado manualmente. Se conservará este valor."
                    : formMedido !== ""
                    ? `Calculado automáticamente: ${Number(formMedido) || 0} - ${fondoNum} = ${formCorregido} ${formUnidad}`
                    : `Se calculará automáticamente: Medido - ${fondoNum} ${formUnidad}`
                }
                sx={{
                  bgcolor: formManualCorregido ? "#fffbeb" : "#ffffff",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    borderColor: formManualCorregido ? "#f59e0b" : "#e2e8f0",
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 1.5, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setModalOpen(false)}
            sx={{
              fontWeight: 700,
              color: "#64748b",
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveModal}
            sx={{
              bgcolor: "#0284c7",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              "&:hover": { bgcolor: "#0369a1" },
            }}
          >
            {editingId ? "Guardar cambios" : "Agregar medición"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
