import React from "react";
import {
  Box,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Chip,
  TextField,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ErrorIcon from "@mui/icons-material/Error";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import { normalize } from "./utils";

const FieldRow = ({ field, currentSrvName, inspectorData, infraEfector, equiposEfector, rrhhEfector, onChange, onOpenObs }) => {
  const currentVal = inspectorData[field.id] || {};
  const isObservado = currentVal.observado || false;
  const valorObj = currentVal.value;
  const obsText = currentVal.obs || "";

  let valorDeclarado = "0";

  const name = field.label || field.name;
  if (field.declarado !== undefined) {
    valorDeclarado = field.declarado;
  } else if (infraEfector && (infraEfector[name] !== undefined || infraEfector[currentSrvName] !== undefined)) {
    const isGeneric = normalize(name).includes("CAMA") || normalize(name).includes("SALA");
    valorDeclarado = isGeneric ? (infraEfector[currentSrvName] || 0) : (infraEfector[name] || 0);
  } else if (equiposEfector && field._type === "EQUIP") {
    const eq = equiposEfector.find(e => (e.equipamiento === name || e.equipamiento === field.label) && e.origen === currentSrvName);
    if (eq) valorDeclarado = eq.actualQty || 1;
  } else if (rrhhEfector && (field._type === "JEFES DE SERVICIO" || field._type === "RECURSOS HUMANOS")) {
    const matches = rrhhEfector.filter(r =>
      (normalize(r.especialidad) === normalize(field.especialidad) ||
        normalize(r.especialidad) === normalize(field.label) ||
        normalize(r.tipoPlantel) === normalize(field.tipoPlantel) ||
        normalize(r.tipoPlantel) === normalize(field.label) ||
        (field._type === "JEFES DE SERVICIO" && r.isJefe)) &&
      (normalize(r.origen) === normalize(currentSrvName) || (field._originalSrv && normalize(r.origen) === normalize(field._originalSrv)))
    );
    
    if (matches.length > 0) {
      valorDeclarado = matches.reduce((acc, curr) => acc + (Number(curr.cantidadCargada) || 1), 0);
    }
  }

  const displayValue = valorObj !== undefined ? valorObj : "";
  const vObs = (valorObj !== undefined && valorObj !== "") ? Number(valorObj) : Number(valorDeclarado);
  const vDec = Number(valorDeclarado);
  const isMatch = vObs === vDec;

  const getStatusIndicator = () => {
    if (isMatch) return <CheckCircleIcon sx={{ color: "#cbd5e1", fontSize: 20 }} />;
    return vObs > vDec
      ? <ErrorIcon sx={{ color: "#ef4444", fontSize: 20 }} />
      : <ReportProblemIcon sx={{ color: "#f59e0b", fontSize: 20 }} />;
  };

  const isJefe = field._type === "JEFES DE SERVICIO";

  return (
    <TableRow hover sx={{ bgcolor: isJefe ? "rgba(14, 165, 233, 0.04)" : "transparent" }}>
      <TableCell sx={{ py: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: isJefe ? 900 : 700, color: isJefe ? "#0369a1" : "#1e293b", fontSize: "0.85rem" }}>
              {name}
            </Typography>
            {isJefe && <Chip label="JEFE" size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900, bgcolor: "#0ea5e9", color: "white" }} />}
            <IconButton
              size="small"
              onClick={() => {
                const autoObs = true;
                if (!currentVal.observado) {
                  onChange(field.id, { ...currentVal, observado: autoObs });
                }
                onOpenObs(field.id, `[${currentSrvName}] ${name}`, obsText);
              }}
              sx={{ color: (obsText || !isMatch) ? "#0ea5e9" : "#cbd5e1" }}
            >
              {(obsText || !isMatch) ? <ChatBubbleIcon sx={{ fontSize: 18 }} /> : <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>
          {(field.isExtra || field._originalSrv) && (
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, mt: -0.5, textTransform: 'uppercase', fontSize: '0.65rem' }}>
              {field._originalSrv || currentSrvName}
            </Typography>
          )}
        </Box>
      </TableCell>
      <TableCell align="center">
        <Chip label={valorDeclarado} size="small" sx={{ fontWeight: 800, bgcolor: isJefe ? "#e0f2fe" : "#f1f5f9", color: isJefe ? "#0369a1" : "inherit" }} />
      </TableCell>
      <TableCell align="center">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <TextField
            size="small"
            type="number"
            placeholder={String(valorDeclarado)}
            value={displayValue}
            onChange={(e) => {
              const newVal = e.target.value;
              const numericVal = newVal === "" ? Number(valorDeclarado) : Number(newVal);
              const autoObs = numericVal !== vDec || obsText !== "";

              onChange(field.id, {
                value: newVal,
                observado: autoObs,
                valorDeclarado: valorDeclarado
              });
            }}
            sx={{
              width: 60,
              "& .MuiInputBase-root": { height: 30, fontWeight: 800, fontSize: '0.8rem', bgcolor: isJefe ? "white" : "transparent" },
              "& .MuiInputBase-input::placeholder": { color: "#cbd5e1", opacity: 1 }
            }}
          />
          {getStatusIndicator()}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default FieldRow;
