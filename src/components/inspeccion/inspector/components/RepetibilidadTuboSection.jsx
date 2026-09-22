import React from "react";
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
  Tooltip,
  MenuItem,
  Select,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import FunctionsIcon from "@mui/icons-material/Functions";
import AnalyticsIcon from "@mui/icons-material/Analytics";

export default function RepetibilidadTuboSection({
  fields = [],
  inspectorData = {},
  onChange,
  onOpenObs,
}) {
  // Helper para leer valor (primitivo o { value, obs })
  const getValue = (fieldId, fallback = "") => {
    const item = inspectorData[fieldId];
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return item.value !== undefined && item.value !== null ? item.value : fallback;
    }
    return item !== undefined && item !== null ? item : fallback;
  };

  // Helper para leer observación
  const getObs = (fieldId) => {
    const item = inspectorData[fieldId];
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return item.obs || "";
    }
    return "";
  };

  // 1. Condiciones de la prueba (arriba)
  const maVal = getValue("f-rep-ma", "100 mA");
  const kvVal = getValue("f-rep-kv", "80 kV");
  const tVal = getValue("f-rep-t", "0.1 Seg");

  // 2. Definición fija de las 3 filas de medición
  const filasFijas = [
    {
      id: "1",
      label: "Medición 1",
      kvId: "f-rep-kv-medido",
      tId: "f-rep-t-medido",
      tUnitId: "f-rep-t-unidad",
      dosisId: "f-rep-dosis-medida",
      dosisUnitId: "f-rep-dosis-unidad",
      defaultKv: 79.8,
      defaultT: 100.2,
      defaultTUnit: "mSeg",
      defaultDosis: 2.38,
      defaultDosisUnit: "mGy",
    },
    {
      id: "2",
      label: "Medición 2",
      kvId: "f-rep-2-kv-medido",
      tId: "f-rep-2-t-medido",
      tUnitId: "f-rep-2-t-unidad",
      dosisId: "f-rep-2-dosis-medida",
      dosisUnitId: "f-rep-2-dosis-unidad",
      defaultKv: 80.1,
      defaultT: 100.0,
      defaultTUnit: "mSeg",
      defaultDosis: 2.39,
      defaultDosisUnit: "mGy",
    },
    {
      id: "3",
      label: "Medición 3",
      kvId: "f-rep-3-kv-medido",
      tId: "f-rep-3-t-medido",
      tUnitId: "f-rep-3-t-unidad",
      dosisId: "f-rep-3-dosis-medida",
      dosisUnitId: "f-rep-3-dosis-unidad",
      defaultKv: 79.9,
      defaultT: 100.4,
      defaultTUnit: "mSeg",
      defaultDosis: 2.37,
      defaultDosisUnit: "mGy",
    },
  ];

  // Función para cálculo de Media y Desviación Estándar muestral (Excel STDEV.S)
  const calculateStats = (values) => {
    const nums = values
      .map((v) => (v !== "" && v !== null && !isNaN(Number(v)) ? Number(v) : null))
      .filter((v) => v !== null);

    if (nums.length === 0) {
      return { mean: "-", stdDev: "-" };
    }

    const sum = nums.reduce((acc, curr) => acc + curr, 0);
    const meanVal = sum / nums.length;

    if (nums.length === 1) {
      return {
        mean: Number(meanVal.toFixed(2)).toString(),
        stdDev: "0.00",
      };
    }

    const variance =
      nums.reduce((acc, curr) => acc + Math.pow(curr - meanVal, 2), 0) /
      (nums.length - 1);
    const stdDevVal = Math.sqrt(variance);

    const formatNum = (n) => {
      if (Math.abs(n) > 0 && Math.abs(n) < 0.01) {
        return n.toFixed(3);
      }
      return n.toFixed(2);
    };

    return {
      mean: formatNum(meanVal),
      stdDev: formatNum(stdDevVal),
    };
  };

  // Cálculo en tiempo real de estadísticas
  const statsKv = React.useMemo(() => {
    return calculateStats([
      getValue("f-rep-kv-medido", 79.8),
      getValue("f-rep-2-kv-medido", 80.1),
      getValue("f-rep-3-kv-medido", 79.9),
    ]);
  }, [inspectorData]);

  const statsT = React.useMemo(() => {
    return calculateStats([
      getValue("f-rep-t-medido", 100.2),
      getValue("f-rep-2-t-medido", 100.0),
      getValue("f-rep-3-t-medido", 100.4),
    ]);
  }, [inspectorData]);

  const statsDosis = React.useMemo(() => {
    return calculateStats([
      getValue("f-rep-dosis-medida", 2.38),
      getValue("f-rep-2-dosis-medida", 2.39),
      getValue("f-rep-3-dosis-medida", 2.37),
    ]);
  }, [inspectorData]);

  // Unidades sincronizadas por defecto con la primera medición
  const tUnitDefault = getValue("f-rep-t-unidad", "mSeg");
  const dosisUnitDefault = getValue("f-rep-dosis-unidad", "mGy");

  const mediaTUnit = getValue("f-rep-media-t-unidad", tUnitDefault);
  const mediaDosisUnit = getValue("f-rep-media-dosis-unidad", dosisUnitDefault);

  const desvTUnit = getValue("f-rep-desv-t-unidad", tUnitDefault);
  const desvDosisUnit = getValue("f-rep-desv-dosis-unidad", dosisUnitDefault);

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
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {/* Condición 1: mA */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
              mA:
            </Typography>
            <TextField
              size="small"
              fullWidth
              value={maVal}
              onChange={(e) => onChange && onChange("f-rep-ma", e.target.value)}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>

          {/* Condición 2: kV */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
              kV:
            </Typography>
            <TextField
              size="small"
              fullWidth
              value={kvVal}
              onChange={(e) => onChange && onChange("f-rep-kv", e.target.value)}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>

          {/* Condición 3: T */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
              T:
            </Typography>
            <TextField
              size="small"
              fullWidth
              value={tVal}
              onChange={(e) => onChange && onChange("f-rep-t", e.target.value)}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 2. Tabla con 3 filas de medición + Media + Desviación Estándar */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          overflowX: "auto",
        }}
      >
        <Table size="small" sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", py: 1.8, width: 170 }}>
                Medición
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                kV medido
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                Tiempo medido
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 130 }}>
                Unidad
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                Dosis medida
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 130 }}>
                Unidad
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 70 }}>
                Obs.
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filasFijas.map((row) => {
              const kvMedidoVal = getValue(row.kvId, row.defaultKv);
              const tMedidoVal = getValue(row.tId, row.defaultT);
              const tUnidadVal = getValue(row.tUnitId, row.defaultTUnit);
              const dosisMedidaVal = getValue(row.dosisId, row.defaultDosis);
              const dosisUnidadVal = getValue(row.dosisUnitId, row.defaultDosisUnit);
              const obsVal = getObs(row.kvId) || getObs(row.dosisId) || getObs(row.tId);

              return (
                <TableRow key={row.id} hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                  {/* Etiqueta de la Medición (Fila 1, 2, 3) */}
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                      {row.label}
                    </Typography>
                  </TableCell>

                  {/* Columna 1: kV medido */}
                  <TableCell sx={{ py: 1.5 }}>
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ step: "0.1", min: "0" }}
                      value={kvMedidoVal}
                      onChange={(e) => onChange && onChange(row.kvId, e.target.value)}
                      sx={{
                        width: 120,
                        "& .MuiInputBase-input": {
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          py: 0.8,
                        },
                      }}
                    />
                  </TableCell>

                  {/* Columna 2: Tiempo medido */}
                  <TableCell sx={{ py: 1.5 }}>
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ step: "0.1", min: "0" }}
                      value={tMedidoVal}
                      onChange={(e) => onChange && onChange(row.tId, e.target.value)}
                      sx={{
                        width: 120,
                        "& .MuiInputBase-input": {
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          py: 0.8,
                        },
                      }}
                    />
                  </TableCell>

                  {/* Columna 3: Unidad (Tiempo) */}
                  <TableCell sx={{ py: 1.5 }}>
                    <Select
                      size="small"
                      value={tUnidadVal}
                      onChange={(e) => onChange && onChange(row.tUnitId, e.target.value)}
                      sx={{
                        width: 110,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        height: 36,
                      }}
                    >
                      <MenuItem value="µSeg">µSeg</MenuItem>
                      <MenuItem value="mSeg">mSeg</MenuItem>
                      <MenuItem value="Seg">Seg</MenuItem>
                    </Select>
                  </TableCell>

                  {/* Columna 4: Dosis medida */}
                  <TableCell sx={{ py: 1.5 }}>
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ step: "0.01", min: "0" }}
                      value={dosisMedidaVal}
                      onChange={(e) => onChange && onChange(row.dosisId, e.target.value)}
                      sx={{
                        width: 120,
                        "& .MuiInputBase-input": {
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          py: 0.8,
                        },
                      }}
                    />
                  </TableCell>

                  {/* Columna 5: Unidad (Dosis) */}
                  <TableCell sx={{ py: 1.5 }}>
                    <Select
                      size="small"
                      value={dosisUnidadVal}
                      onChange={(e) => onChange && onChange(row.dosisUnitId, e.target.value)}
                      sx={{
                        width: 110,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        height: 36,
                      }}
                    >
                      <MenuItem value="nGy">nGy</MenuItem>
                      <MenuItem value="µGy">µGy</MenuItem>
                      <MenuItem value="mGy">mGy</MenuItem>
                      <MenuItem value="Gy">Gy</MenuItem>
                    </Select>
                  </TableCell>

                  {/* Observación */}
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <Tooltip title={obsVal ? `Observación: ${obsVal}` : `Observar ${row.label}`}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          onOpenObs &&
                          onOpenObs(row.kvId, `Repetibilidad - ${row.label}`, obsVal, "GENERAL")
                        }
                        sx={{ color: obsVal ? "#0ea5e9" : "#94a3b8" }}
                      >
                        {obsVal ? (
                          <ChatBubbleIcon fontSize="small" />
                        ) : (
                          <ChatBubbleOutlineIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Fila 4: MEDIA */}
            <TableRow sx={{ bgcolor: "#fff1f2", borderTop: "2px solid #fecdd3", "&:hover": { bgcolor: "#ffe4e6" } }}>
              <TableCell sx={{ py: 1.5, borderTop: "2px solid #fecdd3" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <FunctionsIcon sx={{ fontSize: 18, color: "#be123c" }} />
                  <Typography sx={{ fontWeight: 900, color: "#9f1239", fontSize: "0.88rem" }}>
                    Media
                  </Typography>
                </Box>
              </TableCell>

              {/* Media kV */}
              <TableCell sx={{ py: 1.5, borderTop: "2px solid #fecdd3" }}>
                <TextField
                  size="small"
                  value={statsKv.mean}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    width: 120,
                    "& .MuiInputBase-root": {
                      bgcolor: "#ffffff",
                    },
                    "& .MuiInputBase-input": {
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      py: 0.8,
                      color: "#9f1239",
                    },
                  }}
                />
              </TableCell>

              {/* Media Tiempo */}
              <TableCell sx={{ py: 1.5, borderTop: "2px solid #fecdd3" }}>
                <TextField
                  size="small"
                  value={statsT.mean}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    width: 120,
                    "& .MuiInputBase-root": {
                      bgcolor: "#ffffff",
                    },
                    "& .MuiInputBase-input": {
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      py: 0.8,
                      color: "#9f1239",
                    },
                  }}
                />
              </TableCell>

              {/* Media Unidad Tiempo */}
              <TableCell sx={{ py: 1.5, borderTop: "2px solid #fecdd3" }}>
                <Select
                  size="small"
                  value={mediaTUnit}
                  onChange={(e) => onChange && onChange("f-rep-media-t-unidad", e.target.value)}
                  sx={{
                    width: 110,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    height: 36,
                    bgcolor: "#ffffff",
                    color: "#9f1239",
                  }}
                >
                  <MenuItem value="µSeg">µSeg</MenuItem>
                  <MenuItem value="mSeg">mSeg</MenuItem>
                  <MenuItem value="Seg">Seg</MenuItem>
                </Select>
              </TableCell>

              {/* Media Dosis */}
              <TableCell sx={{ py: 1.5, borderTop: "2px solid #fecdd3" }}>
                <TextField
                  size="small"
                  value={statsDosis.mean}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    width: 120,
                    "& .MuiInputBase-root": {
                      bgcolor: "#ffffff",
                    },
                    "& .MuiInputBase-input": {
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      py: 0.8,
                      color: "#9f1239",
                    },
                  }}
                />
              </TableCell>

              {/* Media Unidad Dosis */}
              <TableCell sx={{ py: 1.5, borderTop: "2px solid #fecdd3" }}>
                <Select
                  size="small"
                  value={mediaDosisUnit}
                  onChange={(e) => onChange && onChange("f-rep-media-dosis-unidad", e.target.value)}
                  sx={{
                    width: 110,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    height: 36,
                    bgcolor: "#ffffff",
                    color: "#9f1239",
                  }}
                >
                  <MenuItem value="nGy">nGy</MenuItem>
                  <MenuItem value="µGy">µGy</MenuItem>
                  <MenuItem value="mGy">mGy</MenuItem>
                  <MenuItem value="Gy">Gy</MenuItem>
                </Select>
              </TableCell>

              {/* Media Obs */}
              <TableCell align="center" sx={{ py: 1.5, borderTop: "2px solid #fecdd3" }}>
                <Tooltip title="Promedio calculado automáticamente">
                  <IconButton size="small" disabled sx={{ color: "#fda4af" }}>
                    <FunctionsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>

            {/* Fila 5: DESVIACIÓN ESTÁNDAR */}
            <TableRow sx={{ bgcolor: "#fff1f2", "&:hover": { bgcolor: "#ffe4e6" } }}>
              <TableCell sx={{ py: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <AnalyticsIcon sx={{ fontSize: 18, color: "#be123c" }} />
                  <Typography sx={{ fontWeight: 900, color: "#9f1239", fontSize: "0.88rem" }}>
                    Desviación Estándar
                  </Typography>
                </Box>
              </TableCell>

              {/* Desv kV */}
              <TableCell sx={{ py: 1.5 }}>
                <TextField
                  size="small"
                  value={statsKv.stdDev}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    width: 120,
                    "& .MuiInputBase-root": {
                      bgcolor: "#ffffff",
                    },
                    "& .MuiInputBase-input": {
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      py: 0.8,
                      color: "#9f1239",
                    },
                  }}
                />
              </TableCell>

              {/* Desv Tiempo */}
              <TableCell sx={{ py: 1.5 }}>
                <TextField
                  size="small"
                  value={statsT.stdDev}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    width: 120,
                    "& .MuiInputBase-root": {
                      bgcolor: "#ffffff",
                    },
                    "& .MuiInputBase-input": {
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      py: 0.8,
                      color: "#9f1239",
                    },
                  }}
                />
              </TableCell>

              {/* Desv Unidad Tiempo */}
              <TableCell sx={{ py: 1.5 }}>
                <Select
                  size="small"
                  value={desvTUnit}
                  onChange={(e) => onChange && onChange("f-rep-desv-t-unidad", e.target.value)}
                  sx={{
                    width: 110,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    height: 36,
                    bgcolor: "#ffffff",
                    color: "#9f1239",
                  }}
                >
                  <MenuItem value="µSeg">µSeg</MenuItem>
                  <MenuItem value="mSeg">mSeg</MenuItem>
                  <MenuItem value="Seg">Seg</MenuItem>
                </Select>
              </TableCell>

              {/* Desv Dosis */}
              <TableCell sx={{ py: 1.5 }}>
                <TextField
                  size="small"
                  value={statsDosis.stdDev}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    width: 120,
                    "& .MuiInputBase-root": {
                      bgcolor: "#ffffff",
                    },
                    "& .MuiInputBase-input": {
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      py: 0.8,
                      color: "#9f1239",
                    },
                  }}
                />
              </TableCell>

              {/* Desv Unidad Dosis */}
              <TableCell sx={{ py: 1.5 }}>
                <Select
                  size="small"
                  value={desvDosisUnit}
                  onChange={(e) => onChange && onChange("f-rep-desv-dosis-unidad", e.target.value)}
                  sx={{
                    width: 110,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    height: 36,
                    bgcolor: "#ffffff",
                    color: "#9f1239",
                  }}
                >
                  <MenuItem value="nGy">nGy</MenuItem>
                  <MenuItem value="µGy">µGy</MenuItem>
                  <MenuItem value="mGy">mGy</MenuItem>
                  <MenuItem value="Gy">Gy</MenuItem>
                </Select>
              </TableCell>

              {/* Desv Obs */}
              <TableCell align="center" sx={{ py: 1.5 }}>
                <Tooltip title="Desviación estándar calculada automáticamente">
                  <IconButton size="small" disabled sx={{ color: "#fda4af" }}>
                    <AnalyticsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
