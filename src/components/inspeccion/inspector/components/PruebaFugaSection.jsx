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

export default function PruebaFugaSection({
  fields = [],
  inspectorData = {},
  onChange,
  onOpenObs,
}) {
  // Helper para leer valor (si es primitivo o { value, obs })
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

  // 1. Condiciones de la prueba (4 condiciones)
  const maVal = getValue("f-fuga-ma", "150 mA");
  const kvVal = getValue("f-fuga-kv", "120 kV");
  const tVal = getValue("f-fuga-t", "1.0 Seg");
  const fondoVal = Number(getValue("f-fuga-fondo", 0.12));
  const fondoUnit = getValue("f-fuga-fondo-unit", "µSv/h");

  // Calcular valor corregido = medido - fondo
  const calcCorregido = (medido, fondo) => {
    if (medido === "" || medido === null || isNaN(Number(medido))) return 0;
    const res = Number(medido) - (isNaN(Number(fondo)) ? 0 : Number(fondo));
    return Math.max(0, parseFloat(res.toFixed(3)));
  };

  // Definición fija de las 4 mediciones cardinales a 1 metro
  const medicionesFijas = [
    {
      id: "frontal",
      lugar: "Fuga frontal a 1mt",
      medId: "f-fuga-front-med",
      corrId: "f-fuga-front-corr",
      unitId: "f-fuga-front-unit",
      defaultMed: 0.45,
      defaultCorr: 0.33,
    },
    {
      id: "lateral_derecha",
      lugar: "Fuga lateral derecha a 1mt",
      medId: "f-fuga-der-med",
      corrId: "f-fuga-der-corr",
      unitId: "f-fuga-der-unit",
      defaultMed: 0.38,
      defaultCorr: 0.26,
    },
    {
      id: "lateral_izquierda",
      lugar: "Fuga lateral izquierda a 1mt",
      medId: "f-fuga-izq-med",
      corrId: "f-fuga-izq-corr",
      unitId: "f-fuga-izq-unit",
      defaultMed: 0.41,
      defaultCorr: 0.29,
    },
    {
      id: "posterior",
      lugar: "Fuga posterior a 1mt",
      medId: "f-fuga-post-med",
      corrId: "f-fuga-post-corr",
      unitId: "f-fuga-post-unit",
      defaultMed: 0.25,
      defaultCorr: 0.13,
    },
  ];

  // Modificar una condición de prueba
  const handleConditionChange = (fieldId, val) => {
    if (!onChange) return;
    onChange(fieldId, val);

    // Si cambia el fondo de radiación, recalcular valores corregidos de las 4 mediciones
    if (fieldId === "f-fuga-fondo") {
      const nuevoFondo = Number(val) || 0;
      medicionesFijas.forEach((m) => {
        const medidoActual = Number(getValue(m.medId, m.defaultMed));
        const nuevoCorr = calcCorregido(medidoActual, nuevoFondo);
        onChange(m.corrId, nuevoCorr);
      });
    }
  };

  // Modificar valor medido de una fila
  const handleMedidoChange = (medId, corrId, newMedVal) => {
    if (!onChange) return;
    onChange(medId, newMedVal);
    if (newMedVal !== "" && !isNaN(Number(newMedVal))) {
      const nuevoCorr = calcCorregido(newMedVal, fondoVal);
      onChange(corrId, nuevoCorr);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%" }}>
      {/* 1. Panel de Condiciones de la Prueba (las 4 condiciones) */}
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
          {/* Condición 1: mA */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
              mA:
            </Typography>
            <TextField
              size="small"
              fullWidth
              value={maVal}
              onChange={(e) => handleConditionChange("f-fuga-ma", e.target.value)}
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
              onChange={(e) => handleConditionChange("f-fuga-kv", e.target.value)}
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
              onChange={(e) => handleConditionChange("f-fuga-t", e.target.value)}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>

          {/* Condición 4: Radiación de fondo */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
              Radiación de fondo ({fondoUnit}):
            </Typography>
            <TextField
              size="small"
              type="number"
              slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
              fullWidth
              value={fondoVal}
              onChange={(e) => handleConditionChange("f-fuga-fondo", e.target.value)}
              sx={{ bgcolor: "#ffffff", borderRadius: 1.5 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 2. Tabla con las 4 mediciones fijas */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          overflowX: "auto",
        }}
      >
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", py: 1.8 }}>
                Lugar de la medición
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 170 }}>
                Valor medido
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 170 }}>
                Valor corregido
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 130 }}>
                Unidad
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {medicionesFijas.map((row) => {
              const medidoVal = getValue(row.medId, row.defaultMed);
              const corregidoVal = getValue(row.corrId, row.defaultCorr);
              const unidadVal = getValue(row.unitId, "µSv/h");

              return (
                <TableRow key={row.id} hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                  {/* Columna 1: Lugar de la medición */}
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                      {row.lugar}
                    </Typography>
                  </TableCell>

                  {/* Columna 2: Valor medido */}
                  <TableCell sx={{ py: 1.5 }}>
                    <TextField
                      size="small"
                      type="number"
                      slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
                      value={medidoVal}
                      onChange={(e) => handleMedidoChange(row.medId, row.corrId, e.target.value)}
                      sx={{
                        width: 140,
                        "& .MuiInputBase-input": {
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          py: 0.8,
                        },
                      }}
                    />
                  </TableCell>

                  {/* Columna 3: Valor corregido */}
                  <TableCell sx={{ py: 1.5 }}>
                    <TextField
                      size="small"
                      type="number"
                      slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
                      value={corregidoVal}
                      onChange={(e) => onChange && onChange(row.corrId, e.target.value)}
                      sx={{
                        width: 140,
                        "& .MuiInputBase-input": {
                          fontWeight: 800,
                          color: "#0369a1",
                          fontSize: "0.88rem",
                          py: 0.8,
                        },
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#f0f9ff",
                        },
                      }}
                    />
                  </TableCell>

                  {/* Columna 4: Unidad */}
                  <TableCell sx={{ py: 1.5 }}>
                    <Select
                      size="small"
                      value={unidadVal}
                      onChange={(e) => onChange && onChange(row.unitId, e.target.value)}
                      sx={{
                        width: 110,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        height: 36,
                      }}
                    >
                      <MenuItem value="µSv/h">µSv/h</MenuItem>
                      <MenuItem value="mSv/h">mSv/h</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
