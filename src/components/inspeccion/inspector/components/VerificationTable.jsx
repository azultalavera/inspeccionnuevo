import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ErrorIcon from "@mui/icons-material/Error";
import { normalize } from "./utils";

const VerificationTable = ({
  fields,
  inspectorData,
  onChange,
  onOpenObs,
  infraEfector,
  rrhhEfector,
  equiposEfector,
  currentSrvName,
  serviciosEfector,
}) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflowX: "auto" }}
    >
      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
          <TableRow>
            <TableCell
              sx={{ fontWeight: 900, color: "#334155", width: "40%", py: 2 }}
            >
              Elemento a Inspeccionar
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: 900, color: "#334155", py: 2 }}
            >
              DECLARADO (TRÁMITE)
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: 900, color: "#334155", py: 2, width: 200 }}
            >
              DECLARADO (INSPECCIÓN)
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fields?.map((field) => {
            const currentVal = inspectorData[field.id] || {};
            const obsText = currentVal.obs || "";
            const displayValue = currentVal.value !== undefined ? currentVal.value : "";

            let valorDeclarado =
              (field.valorTramite || field.valorTramiteMock) ?? field.cantidadMinima ?? field.valorDeclarado ?? 1;

            // 0. DATOS ESPECIALES DEL TRÁMITE
            if (field.origin === "TRÁMITE") {
              const upperLabel = normalize(field.label || "");
              if (upperLabel.includes("TOTAL DE CAMAS")) {
                valorDeclarado = Object.values(infraEfector || {}).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
              } else if (upperLabel.includes("SERVICIOS SELECCIONADOS")) {
                valorDeclarado = (serviciosEfector || []).join(", ");
              }
            }

            // 1. INFRAESTRUCTURA (Camas/Salas)
            const name = field.label || field.name;
            if (infraEfector) {
              if (infraEfector[name] !== undefined) {
                valorDeclarado = infraEfector[name];
              } else if (currentSrvName) {
                const upperLabel = normalize(name);
                const isGeneric = upperLabel.includes("CAMA") || upperLabel.includes("SALA") || upperLabel.includes("HABITACION") || (upperLabel.includes("N") && upperLabel.includes("DE"));

                if (isGeneric) {
                  if (infraEfector[currentSrvName] !== undefined) {
                    valorDeclarado = infraEfector[currentSrvName];
                  } else {
                    const foundKey = Object.keys(infraEfector).find(k =>
                      normalize(k).includes(normalize(currentSrvName)) ||
                      normalize(currentSrvName).includes(normalize(k))
                    );
                    if (foundKey) valorDeclarado = infraEfector[foundKey];
                  }
                }
              }
            }

            // 2. RECURSOS HUMANOS
            if (rrhhEfector && rrhhEfector.length > 0) {
              const rrhhMatch = rrhhEfector.find(
                (r) =>
                  (r.especialidad === field.especialidad ||
                    r.especialidad === field.label ||
                    r.tipoPlantel === field.tipoPlantel ||
                    r.tipoPlantel === field.label) &&
                  r.origen === currentSrvName,
              );
              if (rrhhMatch) valorDeclarado = rrhhMatch.cantidadCargada;
            }

            // 3. EQUIPAMIENTO
            const isQuirofano = currentSrvName?.toUpperCase().includes("QUIROFANO");
            if (isQuirofano || (equiposEfector && equiposEfector.length > 0)) {
              const equipoMatch = equiposEfector?.filter(
                (e) => (e.equipamiento === field.equipamiento || e.equipamiento === field.label) && e.origen === currentSrvName
              ) || [];

              if (isQuirofano) {
                const orCount = Number(infraEfector["QUIRÓFANO"] || infraEfector["QUIROFANO"] || 1);
                const actualSum = equipoMatch.reduce((acc, curr) => acc + (curr.actualQty || 1), 0);
                valorDeclarado = Math.max(orCount, actualSum);
                if (equipoMatch.length === 0) valorDeclarado = orCount;
              } else if (equipoMatch.length > 0) {
                valorDeclarado = equipoMatch.reduce((acc, curr) => acc + (curr.actualQty || 1), 0);
              }
            }

            const vDec = Number(valorDeclarado);
            const vObs = (displayValue !== "") ? Number(displayValue) : vDec;
            const isMatch = vObs === vDec;
            const hasError = !isMatch;

            // Lógica de Validación de Iconos (HU)
            const getStatusIndicator = () => {
              const upperSrv = currentSrvName?.toUpperCase() || "";
              const upperLabel = (field.label || "").toUpperCase();

              const isJefe = upperLabel.includes("JEFE") || upperSrv.includes("JEFE");
              const isServiciosCamas = upperLabel.includes("CAMA") || upperLabel.includes("SALA") || upperLabel.includes("PUESTO") || upperSrv.includes("CAMA") || upperSrv.includes("SALA");
              const isRrhhEquip = !isJefe && !isServiciosCamas;

              if (isMatch) return <CheckCircleIcon sx={{ color: "#cbd5e1", fontSize: 20 }} />;

              if (isServiciosCamas) {
                return vObs < vDec
                  ? <ReportProblemIcon sx={{ color: "#f59e0b", fontSize: 20 }} /> // Naranja
                  : <ErrorIcon sx={{ color: "#ef4444", fontSize: 20 }} />; // Rojo
              }

              if (isJefe) {
                return vObs < vDec
                  ? <ErrorIcon sx={{ color: "#ef4444", fontSize: 20 }} /> // Rojo
                  : <ReportProblemIcon sx={{ color: "#f59e0b", fontSize: 20 }} />; // Naranja
              }

              if (isRrhhEquip) {
                return vObs < vDec
                  ? <ErrorIcon sx={{ color: "#ef4444", fontSize: 20 }} /> // Rojo
                  : null;
              }
              return null;
            };

            return (
              <TableRow
                key={field.id}
                hover
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  bgcolor: hasError ? "#fff5f5" : "inherit",
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: "0.85rem",
                    py: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {field.label || field.name || field.equipamiento || field.especialidad || "Elemento Sin Nombre"}
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (!currentVal.observado) {
                          onChange(field.id, { observado: true });
                        }
                        onOpenObs(field.id, `[${currentSrvName}] ${field.label || field.name}`, obsText);
                      }}
                      sx={{ color: (obsText || !isMatch) ? "#0ea5e9" : "#cbd5e1" }}
                    >
                      {(obsText || !isMatch) ? <ChatBubbleIcon sx={{ fontSize: 18 }} /> : <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  <Box
                    sx={{
                      bgcolor: "#e2e8f0",
                      color: "#0f172a",
                      display: "inline-block",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                    }}
                  >
                    {valorDeclarado}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <TextField
                      size="small"
                      type="number"
                      placeholder={String(valorDeclarado)}
                      disabled={field.origin === "TRÁMITE"}
                      value={displayValue}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        const numericVal = newVal === "" ? vDec : Number(newVal);
                        const autoObs = numericVal !== vDec || obsText !== "";
                        onChange(field.id, {
                          value: newVal,
                          observado: autoObs,
                          valorDeclarado: valorDeclarado
                        });
                      }}
                      sx={{
                        width: 80,
                        "& .MuiInputBase-root": {
                          bgcolor: field.origin === "TRÁMITE" ? "#f1f5f9" : "white",
                          fontWeight: 800,
                          height: 38,
                        },
                        "& .MuiInputBase-input::placeholder": { color: "#cbd5e1", opacity: 1 }
                      }}
                    />
                    {getStatusIndicator()}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VerificationTable;
