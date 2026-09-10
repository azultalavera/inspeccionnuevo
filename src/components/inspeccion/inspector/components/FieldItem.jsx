import React from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ScienceIcon from "@mui/icons-material/Science";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

const normalize = (str) =>
  str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim() || "";

const FieldItem = ({ field, value, onChange, onOpenObs, infraEfector, serviciosEfector }) => {
  const isObj = value && typeof value === 'object' && !Array.isArray(value);
  const realValue = isObj ? value.value : value;
  const obsText = isObj ? value.obs : "";

  let specialValue = undefined;
  if (field.origin === "TRÁMITE") {
    const upperLabel = normalize(field.label || "");
    if (upperLabel.includes("TOTAL DE CAMAS")) {
      specialValue = Object.values(infraEfector || {}).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    } else if (upperLabel.includes("SERVICIOS SELECCIONADOS")) {
      specialValue = (serviciosEfector || []).join(", ");
    }
  }

  const renderInput = () => {
    const hasRealValue = realValue !== undefined && realValue !== null;
    const isTramite = field.origin === "TRÁMITE";
    const tramiteVal = field.valorTramite || field.valorTramiteMock;

    switch (field.type) {
      case "boolean":
      case "checkbox":
        const effectiveBool = hasRealValue ? realValue : (isTramite ? (tramiteVal === "si" || tramiteVal === "true") : undefined);
        return (
          <ToggleButtonGroup
            value={effectiveBool === undefined ? null : (effectiveBool ? "si" : "no")}
            exclusive
            disabled={field.origin === "TRÁMITE"}
            onChange={(e, val) => {
              if (val !== null) onChange(field.id, val === "si");
            }}
            fullWidth
            sx={{ height: 48 }}
          >
            <ToggleButton
              value="si"
              sx={{
                flex: 1,
                borderRadius: "8px 0 0 8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: 700,
                color: "#64748b",
                "&.Mui-selected": {
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontWeight: 900,
                },
              }}
            >
              SÍ
            </ToggleButton>
            <ToggleButton
              value="no"
              sx={{
                flex: 1,
                borderRadius: "0 8px 8px 0",
                border: "1px solid #cbd5e1",
                borderLeft: "none",
                fontSize: "14px",
                fontWeight: 700,
                color: "#64748b",
                "&.Mui-selected": {
                  bgcolor: "#fee2e2",
                  color: "#991b1b",
                  fontWeight: 900,
                },
              }}
            >
              NO
            </ToggleButton>
          </ToggleButtonGroup>
        );
      case "date":
        return (
          <TextField
            type="date"
            fullWidth
            variant="outlined"
            size="small"
            disabled={field.origin === "TRÁMITE"}
            value={hasRealValue ? realValue : (specialValue !== undefined ? specialValue : (isTramite ? tramiteVal : ""))}
            onChange={(e) => onChange(field.id, e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: 2,
                fontSize: "14px",
                height: 48,
                fontWeight: 600,
              },
            }}
          />
        );
      case "toggle":
        return (
          <ToggleButtonGroup
            value={hasRealValue ? realValue : (isTramite ? tramiteVal : null)}
            exclusive
            disabled={field.origin === "TRÁMITE"}
            onChange={(e, val) => {
              if (val !== null) onChange(field.id, val);
            }}
            fullWidth
            sx={{ height: 48 }}
          >
            {field.options?.split(",").map((opt) => (
              <ToggleButton
                key={opt}
                value={opt.trim()}
                sx={{
                  flex: 1,
                  fontSize: "13px",
                  fontWeight: 700,
                  "&.Mui-selected": {
                    bgcolor: "#e0f2fe",
                    color: "#0369a1",
                    fontWeight: 900,
                  },
                }}
              >
                {opt.trim()}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        );
      case "select":
        return (
          <TextField
            select
            fullWidth
            variant="outlined"
            size="small"
            disabled={field.origin === "TRÁMITE"}
            value={hasRealValue ? realValue : (specialValue !== undefined ? specialValue : (isTramite ? tramiteVal : ""))}
            onChange={(e) => onChange(field.id, e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: 2,
                fontSize: "14px",
                fontWeight: 500,
                height: 48,
              },
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    borderRadius: 2,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  },
                },
              },
            }}
          >
            {field.options?.split(",").map((opt) => (
              <MenuItem
                key={opt}
                value={opt.trim()}
                sx={{
                  py: 1,
                  fontSize: "0.9rem",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {opt.trim()}
              </MenuItem>
            ))}
          </TextField>
        );
      case "number":
        return (
          <TextField
            type="number"
            fullWidth
            variant="outlined"
            size="small"
            placeholder="0"
            disabled={field.origin === "TRÁMITE"}
            value={hasRealValue ? realValue : (specialValue !== undefined ? specialValue : (isTramite ? tramiteVal : ""))}
            onChange={(e) => onChange(field.id, e.target.value)}
            InputProps={{
              sx: {
                borderRadius: 2,
                fontSize: "14px",
                height: 48,
                fontWeight: 600,
              },
            }}
          />
        );
      default:
        return (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Escriba aquí..."
            disabled={field.origin === "TRÁMITE"}
            value={hasRealValue ? realValue : (specialValue !== undefined ? specialValue : (isTramite ? tramiteVal : ""))}
            multiline={field.type === "textarea"}
            rows={field.type === "textarea" ? 3 : 1}
            onChange={(e) => onChange(field.id, e.target.value)}
            InputProps={{
              sx: {
                borderRadius: 2,
                fontSize: "14px",
                fontWeight: 500,
                minHeight: 48,
                bgcolor: field.origin === "TRÁMITE" ? "#f8fafc" : "white",
                color: field.origin === "TRÁMITE" ? "#64748b" : "inherit",
              },
            }}
          />
        );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              color: field.origin === "TRÁMITE" ? "#64748b" : "#334155",
              lineHeight: 1.2,
              fontSize: "13px",
              textTransform: "uppercase",
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            {field.label}
            {field.origin === "TRÁMITE" && (
              <Tooltip title="Dato del trámite (No editable)">
                <LockIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
              </Tooltip>
            )}
            {(field.valorTramite || field.valorTramiteMock) && (
              <Tooltip title={`Valor simulado: ${field.valorTramite || field.valorTramiteMock}`}>
                <ScienceIcon sx={{ fontSize: 14, color: '#0ea5e9' }} />
              </Tooltip>
            )}
          </Typography>
          {onOpenObs && (
            <IconButton
              size="small"
              onClick={() => onOpenObs(field.id, field.label, obsText)}
              sx={{
                ml: 0.5,
                mb: 1,
                p: 0.5,
                color: obsText ? "#0ea5e9" : "#94a3b8",
                "&:hover": { color: "#0ea5e9", backgroundColor: "rgba(14, 165, 233, 0.05)" }
              }}
            >
              {obsText ? <ChatBubbleIcon sx={{ fontSize: 16 }} /> : <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          )}
        </Box>
        {renderInput()}
      </Box>
    </Box>
  );
};

export default FieldItem;
