import React, { useMemo } from "react";
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
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TuneIcon from "@mui/icons-material/Tune";
import SensorsIcon from "@mui/icons-material/Sensors";

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

  // Condiciones de la prueba
  const maVal = getFieldValue("f-disp-ma", "100 mA");
  const kvVal = getFieldValue("f-disp-kv", "80 kV");
  const tVal = getFieldValue("f-disp-t", "0.2 Seg");
  const fondoVal = Number(getFieldValue("f-disp-fondo", 0.10));

  // Mediciones actuales (inicia vacío)
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
    if (medido === "" || medido === null || isNaN(Number(medido))) return 0;
    const res = Number(medido) - (isNaN(Number(fondo)) ? 0 : Number(fondo));
    return Math.max(0, parseFloat(res.toFixed(3)));
  };

  // Modificar una condición de prueba
  const handleConditionChange = (fieldId, val) => {
    if (onChange) {
      onChange(fieldId, val);
      // Si cambia el fondo, recalcular valores corregidos automáticos
      if (fieldId === "f-disp-fondo") {
        const nuevoFondo = Number(val) || 0;
        const actualizadas = mediciones.map((m) => {
          if (m.manualCorregido) return m;
          return {
            ...m,
            corregido: calcCorregido(m.medido, nuevoFondo),
          };
        });
        onChange("f-disp-mediciones", actualizadas);
      }
    }
  };

  // Agregar fila de medición
  const handleAddMedicion = () => {
    const newId = `disp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRow = {
      id: newId,
      lugar: "",
      medido: "",
      corregido: 0,
      unidad: "µSv/h",
      manualCorregido: false,
    };
    updateMediciones([...mediciones, newRow]);
  };

  // Eliminar fila
  const handleDeleteMedicion = (idToRemove) => {
    const filtered = mediciones.filter((m) => m.id !== idToRemove);
    updateMediciones(filtered);
  };

  // Modificar campo de una fila
  const handleRowChange = (id, fieldName, value) => {
    const updated = mediciones.map((row) => {
      if (row.id !== id) return row;

      if (fieldName === "medido") {
        const medidoNum = value === "" ? "" : Number(value);
        return {
          ...row,
          medido: value,
          corregido: row.manualCorregido ? row.corregido : calcCorregido(medidoNum, fondoVal),
        };
      }

      if (fieldName === "corregido") {
        return {
          ...row,
          corregido: value === "" ? "" : Number(value),
          manualCorregido: true,
        };
      }

      return { ...row, [fieldName]: value };
    });

    updateMediciones(updated);
  };

  // Restablecer cálculo automático de valor corregido para una fila
  const handleResetFormula = (id) => {
    const updated = mediciones.map((row) => {
      if (row.id !== id) return row;
      return {
        ...row,
        corregido: calcCorregido(row.medido, fondoVal),
        manualCorregido: false,
      };
    });
    updateMediciones(updated);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%" }}>
      {/* 1. Panel de Condiciones de la Prueba (Sin amarillo, estilo neutral) */}
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
              value={maVal}
              onChange={(e) => handleConditionChange("f-disp-ma", e.target.value)}
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
              value={kvVal}
              onChange={(e) => handleConditionChange("f-disp-kv", e.target.value)}
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
              value={tVal}
              onChange={(e) => handleConditionChange("f-disp-t", e.target.value)}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
              Radiación de fondo (µSv/h):
            </Typography>
            <TextField
              size="small"
              type="number"
              slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
              fullWidth
              value={fondoVal}
              onChange={(e) => handleConditionChange("f-disp-fondo", e.target.value)}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 2. Cabecera de Mediciones */}
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
          onClick={() => handleAddMedicion()}
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

      {/* 3. Tabla de Mediciones (aparece al agregar mediciones) */}
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
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.80rem", py: 1.5, width: 45 }}>
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.80rem", minWidth: 260 }}>
                  Lugar de la medición
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.80rem", width: 160 }}>
                  Valor medido
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.80rem", width: 170 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Valor corregido
                    <Tooltip title="Calculado automáticamente: Valor medido - Radiación de fondo. Puede editarse manualmente si es necesario.">
                      <CalculateIcon sx={{ fontSize: 16, color: "#64748b" }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#334155", fontSize: "0.80rem", width: 130 }}>
                  Unidad
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#334155", fontSize: "0.80rem", width: 60 }}>
                  Acción
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
                  <TableCell sx={{ color: "#64748b", fontWeight: 800, fontSize: "0.80rem" }}>
                    {index + 1}
                  </TableCell>

                  {/* Lugar de la medición */}
                  <TableCell sx={{ py: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Lugar de la medición..."
                      value={row.lugar || ""}
                      onChange={(e) => handleRowChange(row.id, "lugar", e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-input": {
                          fontWeight: 700,
                          color: "#1e293b",
                          fontSize: "0.88rem",
                          py: 0.8,
                        },
                      }}
                    />
                  </TableCell>

                  {/* Valor medido */}
                  <TableCell sx={{ py: 1 }}>
                    <TextField
                      size="small"
                      type="number"
                      slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
                      placeholder="0.00"
                      value={row.medido !== undefined ? row.medido : ""}
                      onChange={(e) => handleRowChange(row.id, "medido", e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-input": {
                          fontWeight: 800,
                          color: "#0369a1",
                          fontSize: "0.90rem",
                          py: 0.8,
                        },
                      }}
                    />
                  </TableCell>

                  {/* Valor corregido */}
                  <TableCell sx={{ py: 1 }}>
                    <TextField
                      size="small"
                      type="number"
                      value={row.corregido !== undefined ? row.corregido : 0}
                      onChange={(e) => handleRowChange(row.id, "corregido", e.target.value)}
                      slotProps={{
                        htmlInput: { step: "0.01", min: "0" },
                        input: {
                          endAdornment: row.manualCorregido ? (
                            <InputAdornment position="end">
                              <Tooltip title="Valor manual. Clic para volver a la fórmula (medido - fondo)">
                                <IconButton
                                  size="small"
                                  onClick={() => handleResetFormula(row.id)}
                                  sx={{ p: 0.2, color: "#f59e0b" }}
                                >
                                  <RestartAltIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ) : null,
                        },
                      }}
                      sx={{
                        bgcolor: row.manualCorregido ? "#fffbeb" : "#f8fafc",
                        borderRadius: 1,
                        "& .MuiOutlinedInput-input": {
                          fontWeight: 800,
                          color: row.manualCorregido ? "#b45309" : "#334155",
                          fontSize: "0.90rem",
                          py: 0.8,
                        },
                      }}
                    />
                  </TableCell>

                  {/* Unidad */}
                  <TableCell sx={{ py: 1 }}>
                    <Select
                      size="small"
                      fullWidth
                      value={row.unidad || "µSv/h"}
                      onChange={(e) => handleRowChange(row.id, "unidad", e.target.value)}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "#334155",
                        bgcolor: "#ffffff",
                        "& .MuiSelect-select": { py: 0.8 },
                      }}
                    >
                      <MenuItem value="µSv/h" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                        µSv/h
                      </MenuItem>
                      <MenuItem value="mSv/h" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                        mSv/h
                      </MenuItem>
                    </Select>
                  </TableCell>

                  {/* Acción Eliminar */}
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Tooltip title="Eliminar medición">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteMedicion(row.id)}
                        sx={{
                          color: "#94a3b8",
                          "&:hover": { color: "#ef4444", bgcolor: "#fee2e2" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
