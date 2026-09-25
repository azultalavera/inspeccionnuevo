import React, { useState } from "react";
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
  IconButton,
  Chip,
  Alert,
  AlertTitle,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Grid,
  Collapse,
  Switch,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import DescriptionIcon from "@mui/icons-material/Description";
import DomainIcon from "@mui/icons-material/Domain";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PhoneIcon from "@mui/icons-material/Phone";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import EngineeringIcon from "@mui/icons-material/Engineering";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

// Contenedor Card idéntico al diseño de la imagen de referencia
const EstablecimientoCard = ({
  id,
  title,
  icon,
  obs = "",
  onOpenObs = null,
  headerAction = null,
  noGrid = false,
  children,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "#ffffff",
      }}
    >
      <Box
        sx={{
          bgcolor: "#f8fafc",
          px: 2.5,
          py: 1.5,
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon}
          <Typography
            sx={{
              fontWeight: 800,
              color: "#1e293b",
              fontSize: "0.88rem",
              textTransform: "uppercase",
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {headerAction}
          {onOpenObs && (
            <Tooltip title={obs ? `Observación: ${obs}` : `Observar ${title}`}>
              <IconButton
                size="small"
                onClick={() => onOpenObs(id, title, obs, "TRAMITE")}
                sx={{ color: obs ? "#0ea5e9" : "#94a3b8" }}
              >
                {obs ? (
                  <ChatBubbleIcon fontSize="small" />
                ) : (
                  <ChatBubbleOutlineIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Box
        sx={
          noGrid
            ? { p: 0 }
            : {
              p: 2.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: 2.5,
            }
        }
      >
        {children}
      </Box>
    </Paper>
  );
};

// Item de campo simple sin contenedor gris alrededor
const CardFieldItem = ({
  id,
  label,
  value,
  obs = "",
  onOpenObs = null,
}) => {
  const isNoDeclarado =
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-" ||
    value === "No declarado";

  const displayVal = isNoDeclarado ? "No declarado" : value;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography
          variant="caption"
          sx={{
            color: "#64748b",
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </Typography>
        {onOpenObs && (
          <Tooltip title={obs ? `Observación: ${obs}` : `Observar ${label}`}>
            <IconButton
              size="small"
              onClick={() => onOpenObs(id, label, obs, "TRAMITE")}
              sx={{
                p: 0.2,
                color: obs ? "#0ea5e9" : "#94a3b8",
                opacity: obs ? 1 : 0.35,
                "&:hover": { opacity: 1, color: "#0ea5e9" },
              }}
            >
              {obs ? (
                <ChatBubbleIcon sx={{ fontSize: 15 }} />
              ) : (
                <ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Typography
        sx={{
          fontWeight: isNoDeclarado ? 500 : 700,
          color: isNoDeclarado ? "#94a3b8" : "#1e293b",
          fontSize: "0.95rem",
          fontStyle: isNoDeclarado ? "italic" : "normal",
          mt: 0.3,
        }}
      >
        {displayVal}
      </Typography>
    </Box>
  );
};

// Item de campo con Check de observación que alimenta a la observación general
const CardFieldCheckItem = ({
  id,
  label,
  value,
  isObserved,
  onToggleObs,
  noCheck = false,
}) => {
  const isNoDeclarado =
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-" ||
    value === "No declarado";

  const displayVal = isNoDeclarado ? "No declarado" : value;

  return (
    <Box sx={{ py: 0.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.4, minHeight: 24 }}>
        <Typography
          variant="caption"
          sx={{
            color: isObserved && !noCheck ? "#0369a1" : "#64748b",
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </Typography>
        {!noCheck && (
          <Tooltip title={isObserved ? `Quitar observación de ${label}` : `Observar ${label}`}>
            <Box
              onClick={() => onToggleObs(id, label, value)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.4,
                cursor: "pointer",
                px: 0.7,
                py: 0.2,
                borderRadius: 1.5,
                bgcolor: isObserved ? "#e0f2fe" : "transparent",
                border: "1px solid",
                borderColor: isObserved ? "#7dd3fc" : "#e2e8f0",
                "&:hover": {
                  bgcolor: isObserved ? "#bae6fd" : "#f1f5f9",
                  borderColor: isObserved ? "#38bdf8" : "#cbd5e1",
                },
                transition: "all 0.15s ease",
                userSelect: "none",
              }}
            >
              <Checkbox
                size="small"
                checked={isObserved}
                sx={{
                  p: 0,
                  color: "#94a3b8",
                  "&.Mui-checked": { color: "#0284c7" },
                  "& .MuiSvgIcon-root": { fontSize: 16 },
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: isObserved ? "#0369a1" : "#64748b",
                  letterSpacing: 0.5,
                }}
              >
                OBS
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>
      <Typography
        sx={{
          fontWeight: isNoDeclarado ? 500 : 700,
          color: isNoDeclarado ? "#94a3b8" : "#1e293b",
          fontSize: "0.95rem",
          fontStyle: isNoDeclarado ? "italic" : "normal",
        }}
      >
        {displayVal}
      </Typography>
    </Box>
  );
};

const DatosTramiteRadiofisica = ({
  category,
  subservicio,
  tipoServicio,
  inspectorData,
  onChange,
  onOpenObs,
  onOpenViewer,
}) => {
  const [expandedEpp, setExpandedEpp] = useState({ mampara_plomada: true });
  const [subTabResp, setSubTabResp] = useState("TODOS");
  const [expandedRespInst, setExpandedRespInst] = useState({ 1: true, 2: false, 3: false });
  const [expandedRespUso, setExpandedRespUso] = useState({ 1: true, 2: false, 3: false });
  const [expandedPadre, setExpandedPadre] = useState(true);
  const [expandedHijo, setExpandedHijo] = useState(true);
  const [collapsedSubCards, setCollapsedSubCards] = useState({});

  const toggleSubCard = (cardKey) => {
    setCollapsedSubCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  // Helper para leer valor u objeto { value, obs }
  const getValue = (fieldId, defaultVal = null) => {
    const item = inspectorData[fieldId];
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return item.value !== undefined ? item.value : defaultVal;
    }
    return item !== undefined ? item : defaultVal;
  };

  const getObs = (fieldId) => {
    const item = inspectorData[fieldId];
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return item.obs || "";
    }
    return "";
  };

  const handleToggle = (fieldId, val) => {
    const currentItem = inspectorData[fieldId];
    const obs = currentItem && typeof currentItem === "object" ? currentItem.obs : "";
    onChange(fieldId, { value: val, obs });
  };

  // ────────────────────────────────────────────────────────────
  // 1. STEP: ESTABLECIMIENTO
  // ────────────────────────────────────────────────────────────
  if (category === "ESTABLECIMIENTO") {
    const renderTableVal = (val) => {
      const isNoDeclarado =
        val === null ||
        val === undefined ||
        val === "" ||
        val === "-" ||
        val === "No declarado" ||
        val === "No informado";

      if (isNoDeclarado) {
        return (
          <Typography sx={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.85rem" }}>
            No informado
          </Typography>
        );
      }

      return (
        <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.88rem" }}>
          {val}
        </Typography>
      );
    };

    const renderPisoDepto = (piso, depto) => {
      const p = piso && piso !== "-" && piso !== "No informado" ? `Piso ${piso}` : "";
      const d = depto && depto !== "-" && depto !== "No informado" ? `Dpto ${depto}` : "";
      const combined = [p, d].filter(Boolean).join(" - ");

      if (!combined) {
        return (
          <Typography sx={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.85rem" }}>
            -
          </Typography>
        );
      }

      return (
        <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.88rem" }}>
          {combined}
        </Typography>
      );
    };

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        {/* ──────────────────────────────────────────────────────────── */}
        {/* ACORDEÓN: DATOS DEL TRÁMITE PADRE (ESTABLECIMIENTO BASE) */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 3.5,
            overflow: "hidden",
            bgcolor: "#ffffff",
          }}
        >
          {/* Header desplegable Trámite Padre */}
          <Box
            onClick={() => setExpandedPadre((prev) => !prev)}
            sx={{
              bgcolor: "#f8fafc",
              px: 2.5,
              py: 1.8,
              borderBottom: expandedPadre ? "1px solid #e2e8f0" : "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <DomainIcon sx={{ color: "#475569", fontSize: 24 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#1e293b",
                    fontSize: "0.95rem",
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  Datos del Trámite [PADRE]
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: { xs: "none", sm: "block" } }}>
                5 apartados
              </Typography>
              <IconButton size="small" sx={{ color: "#64748b" }}>
                {expandedPadre ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Contenido desplegable Trámite Padre: las 5 tablas */}
          <Collapse in={expandedPadre}>
            <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: "#ffffff", display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Contenedor 1: Datos generales */}
              <EstablecimientoCard
                id="rad_sec_datos_generales"
                title="Datos generales"
                icon={<ApartmentIcon sx={{ color: "#64748b", fontSize: 20 }} />}
                obs={getObs("rad_sec_datos_generales")}
                onOpenObs={onOpenObs}
                noGrid={true}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", py: 1.4, letterSpacing: 0.3 }}>
                          DENOMINACIÓN
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          TIPO DEPENDENCIA
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          PROPIEDAD
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          CUIT
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          HABILITACIÓN MUNICIPAL
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ py: 1.6 }}>
                          <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.90rem" }}>
                            {getValue("rad_est_denominacion", "Hola")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          <Chip
                            label={getValue("rad_est_tipo_dependencia", "PÚBLICA")}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: "0.72rem", bgcolor: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.86rem" }}>
                            {getValue("rad_est_propiedad", "Molina Martin Roberto")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.86rem" }}>
                            {getValue("rad_est_cuit", "20-39624236-3")}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.6 }}>
                          <Chip
                            label={getValue("rad_est_hab_municipal", "Sí")}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.72rem",
                              bgcolor: "#f1f5f9",
                              color: "#334155",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </EstablecimientoCard>

              {/* Contenedor 2: Datos de contacto del establecimiento */}
              <EstablecimientoCard
                id="rad_sec_contacto_establecimiento"
                title="Datos de contacto del establecimiento"
                icon={<PhoneIcon sx={{ color: "#64748b", fontSize: 20 }} />}
                obs={getObs("rad_sec_contacto_establecimiento")}
                onOpenObs={onOpenObs}
                noGrid={true}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", py: 1.4, letterSpacing: 0.3 }}>
                          CELULAR
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          TELÉFONO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          CORREO ELECTRÓNICO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          CELULAR ALTERNATIVO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          TELÉFONO ALTERNATIVO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          CORREO ALTERNATIVO
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_celular", "3516123456"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_telefono", null))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_correo", "aaaa@gmail.com"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_celular_alt", null))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_telefono_alt", null))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_correo_alt", null))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </EstablecimientoCard>

              {/* Contenedor 3: Domicilio del establecimiento */}
              <EstablecimientoCard
                id="rad_sec_domicilio_establecimiento"
                title="Domicilio del establecimiento"
                icon={<PlaceIcon sx={{ color: "#64748b", fontSize: 20 }} />}
                obs={getObs("rad_sec_domicilio_establecimiento")}
                onOpenObs={onOpenObs}
                noGrid={true}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", py: 1.4, letterSpacing: 0.3 }}>
                          CALLE Y NÚMERO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          BARRIO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          PISO / DEPTO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          CÓDIGO POSTAL
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          LOCALIDAD
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          DEPARTAMENTO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          PROVINCIA
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ py: 1.6 }}>
                          <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                            {getValue("rad_est_calle", "Chacabuco")} {getValue("rad_est_numero", "10")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_barrio", "Centro"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderPisoDepto(getValue("rad_est_piso", null), getValue("rad_est_depto", null))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_cp", "5000"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_localidad", "CORDOBA"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_departamento", "CAPITAL"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_est_provincia", "CORDOBA"))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </EstablecimientoCard>

              {/* Contenedor 4: Datos de contacto del propietario */}
              <EstablecimientoCard
                id="rad_sec_contacto_propietario"
                title="Datos de contacto del propietario"
                icon={<PersonIcon sx={{ color: "#64748b", fontSize: 20 }} />}
                obs={getObs("rad_sec_contacto_propietario")}
                onOpenObs={onOpenObs}
                noGrid={true}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", py: 1.4, letterSpacing: 0.3 }}>
                          CELULAR
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          TELÉFONO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          CORREO ELECTRÓNICO
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prop_celular", "000000"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prop_telefono", null))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prop_correo", "martinmolina1379@gmail.com"))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </EstablecimientoCard>

              {/* Contenedor 5: Domicilio del propietario */}
              <EstablecimientoCard
                id="rad_sec_domicilio_propietario"
                title="Domicilio del propietario"
                icon={<PlaceIcon sx={{ color: "#64748b", fontSize: 20 }} />}
                obs={getObs("rad_sec_domicilio_propietario")}
                onOpenObs={onOpenObs}
                noGrid={true}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", py: 1.4, letterSpacing: 0.3 }}>
                          CALLE Y NÚMERO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          BARRIO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          PISO / DEPTO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          CÓDIGO POSTAL
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          LOCALIDAD
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          DEPARTAMENTO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          PROVINCIA
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ py: 1.6 }}>
                          <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                            {getValue("rad_prop_calle", "Moyano")} {getValue("rad_prop_numero", "1182")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prop_barrio", "Nueva Córdoba"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderPisoDepto(getValue("rad_prop_piso", null), getValue("rad_prop_depto", null))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prop_cp", "5016"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prop_localidad", "CORDOBA"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prop_departamento", "CAPITAL"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prop_provincia", "CORDOBA"))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </EstablecimientoCard>
            </Box>
          </Collapse>
        </Paper>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* ACORDEÓN: DATOS DEL TRÁMITE HIJO (PRESTADOR DE SERVICIO)   */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 3.5,
            overflow: "hidden",
            bgcolor: "#ffffff",
          }}
        >
          {/* Header desplegable Trámite Hijo */}
          <Box
            onClick={() => setExpandedHijo((prev) => !prev)}
            sx={{
              bgcolor: "#f8fafc",
              px: 2.5,
              py: 1.8,
              borderBottom: expandedHijo ? "1px solid #e2e8f0" : "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ApartmentIcon sx={{ color: "#475569", fontSize: 24 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#1e293b",
                    fontSize: "0.95rem",
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  Datos del Trámite [HIJO]
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Tooltip title={getObs("rad_sec_prestador_servicio") ? "Ver / Editar observación" : "Observar Prestador de servicio"}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenObs(
                      "rad_sec_prestador_servicio",
                      "Prestador de servicio",
                      getObs("rad_sec_prestador_servicio"),
                      "TRAMITE"
                    );
                  }}
                  sx={{ color: getObs("rad_sec_prestador_servicio") ? "#1e293b" : "#94a3b8" }}
                >
                  {getObs("rad_sec_prestador_servicio") ? (
                    <ChatBubbleIcon fontSize="small" />
                  ) : (
                    <ChatBubbleOutlineIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <IconButton size="small" sx={{ color: "#64748b" }}>
                {expandedHijo ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Contenido desplegable Trámite Hijo: las 2 tablas */}
          <Collapse in={expandedHijo}>
            <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: "#ffffff", display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Tabla 1: Datos generales del prestador del servicio */}
              <EstablecimientoCard
                id="rad_prest_gen"
                title="Datos generales del prestador del servicio"
                icon={<PersonIcon sx={{ color: "#64748b", fontSize: 20 }} />}
                obs={getObs("rad_prest_gen")}
                onOpenObs={onOpenObs}
                noGrid={true}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", py: 1.4, letterSpacing: 0.3 }}>
                          NOMBRE/S
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          APELLIDO/S
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          CUIL
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ py: 1.6 }}>
                          <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.90rem" }}>
                            {getValue("rad_prest_nombre", "Maximo Samir")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.90rem" }}>
                            {getValue("rad_prest_apellido", "Tabares")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.86rem" }}>
                            {getValue("rad_prest_cuil", "20460337691")}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </EstablecimientoCard>

              {/* Tabla 2: Domicilio del prestador del servicio */}
              <EstablecimientoCard
                id="rad_prest_dom"
                title="Domicilio del prestador del servicio"
                icon={<PlaceIcon sx={{ color: "#64748b", fontSize: 20 }} />}
                obs={getObs("rad_prest_dom")}
                onOpenObs={onOpenObs}
                noGrid={true}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", py: 1.4, letterSpacing: 0.3 }}>
                          CALLE Y NÚMERO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          BARRIO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          PISO / DEPTO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          CÓDIGO POSTAL
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          LOCALIDAD
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          DEPARTAMENTO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.76rem", letterSpacing: 0.3 }}>
                          PROVINCIA
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ py: 1.6 }}>
                          <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                            {getValue("rad_prest_calle", "No informado") !== "No informado"
                              ? `${getValue("rad_prest_calle", "")} ${getValue("rad_prest_numero", "")}`.trim()
                              : "No informado"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prest_barrio", "No informado"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderPisoDepto(getValue("rad_prest_piso", null), getValue("rad_prest_depto", null))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prest_cp", "No informado"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prest_localidad", "No informado"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prest_departamento", "No informado"))}
                        </TableCell>
                        <TableCell sx={{ py: 1.6 }}>
                          {renderTableVal(getValue("rad_prest_provincia", "No informado"))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </EstablecimientoCard>
            </Box>
          </Collapse>
        </Paper>
      </Box>
    );
  }



  // ────────────────────────────────────────────────────────────
  // STEP: RESPONSABLE (ex RESPONSABLE DE USO / DIRECTOR TÉCNICO)
  // ────────────────────────────────────────────────────────────
  if (
    category === "DIRECTOR_TECNICO" ||
    category === "DIRECTOR TECNICO" ||
    category === "RESPONSABLE_DE_USO" ||
    category === "RESPONSABLE DE USO" ||
    category === "RESPONSABLE"
  ) {
    const dtDocFieldId = "rad_est_dt_autorizacion_pdf";
    const dtDocStatus = getValue(dtDocFieldId);
    const dtDocObs = getObs(dtDocFieldId);

    const toggleRespInst = (id) => {
      setExpandedRespInst((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    const toggleRespUso = (id) => {
      setExpandedRespUso((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    const RESPONSABLES_USO = [
      {
        id: 1,
        titulo: "Responsable de uso 1",
        nombre: "Rodrigo",
        apellido: "Tosco",
        cuil: "20394442594",
        matricula: "1212",
        autorizacion: "3333333333",
        usoEquipos: "Radiodiagnóstico dental",
        pdfDoc: "autorizacion_individual_arn.pdf",
        docStatusId: "rad_dt_resp_uso_1_doc_status",
      },
      {
        id: 2,
        titulo: "Responsable de uso 2",
        nombre: "Martín S.",
        apellido: "Benítez",
        cuil: "20284509123",
        matricula: "MP-84920",
        autorizacion: "ARN-2024-8450-TX",
        usoEquipos: "Radiodiagnóstico Médico Convencional",
        pdfDoc: "autorizacion_individual_arn.pdf",
        docStatusId: "rad_dt_resp_uso_2_doc_status",
      },
      {
        id: 3,
        titulo: "Responsable de uso 3",
        nombre: "Valeria Inés",
        apellido: "Navarro",
        cuil: "27341208952",
        matricula: "MP-55102",
        autorizacion: "ARN-2025-1102-TX",
        usoEquipos: "Radiología General e Intervencionismo",
        pdfDoc: "autorizacion_individual_arn.pdf",
        docStatusId: "rad_dt_resp_uso_3_doc_status",
      },
    ];

    const RESPONSABLES_INSTALACION = [
      {
        id: 1,
        titulo: "Responsable de instalación 1",
        nombre: "Luciana",
        apellido: "Castro Barrionuevo",
        cuil: "27435597586",
        celular: "*******7408",
        email: "cast*******@gmail.com",
      },
      {
        id: 2,
        titulo: "Responsable de instalación 2",
        nombre: "Carlos Alberto",
        apellido: "Varela",
        cuil: "20245892113",
        celular: "*******3120",
        email: "cvarela*******@gmail.com",
      },
      {
        id: 3,
        titulo: "Responsable de instalación 3",
        nombre: "Mariana Soledad",
        apellido: "Benítez Gómez",
        cuil: "27319842554",
        celular: "*******8821",
        email: "marianab*******@hotmail.com",
      },
    ];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        {/* Cabecera con selector de subsecciones */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            borderBottom: "1px solid #e2e8f0",
            pb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon sx={{ color: "#0284c7", fontSize: 26 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", fontSize: "1.2rem" }}>
              Responsable
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, bgcolor: "#f1f5f9", p: 0.5, borderRadius: 2 }}>
            <Button
              size="small"
              onClick={() => setSubTabResp("TODOS")}
              sx={{
                fontWeight: 800,
                fontSize: "0.8rem",
                borderRadius: 1.5,
                px: 2,
                py: 0.5,
                bgcolor: subTabResp === "TODOS" ? "#ffffff" : "transparent",
                color: subTabResp === "TODOS" ? "#0284c7" : "#64748b",
                boxShadow: subTabResp === "TODOS" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                "&:hover": { bgcolor: subTabResp === "TODOS" ? "#ffffff" : "rgba(0,0,0,0.04)" },
              }}
            >
              Ver Ambos
            </Button>
            <Button
              size="small"
              onClick={() => setSubTabResp("INSTALACION")}
              sx={{
                fontWeight: 800,
                fontSize: "0.8rem",
                borderRadius: 1.5,
                px: 2,
                py: 0.5,
                bgcolor: subTabResp === "INSTALACION" ? "#ffffff" : "transparent",
                color: subTabResp === "INSTALACION" ? "#0284c7" : "#64748b",
                boxShadow: subTabResp === "INSTALACION" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                "&:hover": { bgcolor: subTabResp === "INSTALACION" ? "#ffffff" : "rgba(0,0,0,0.04)" },
              }}
            >
              Responsable de Instalación - [TRÁMITE PADRE] (3)
            </Button>
            <Button
              size="small"
              onClick={() => setSubTabResp("USO")}
              sx={{
                fontWeight: 800,
                fontSize: "0.8rem",
                borderRadius: 1.5,
                px: 2,
                py: 0.5,
                bgcolor: subTabResp === "USO" ? "#ffffff" : "transparent",
                color: subTabResp === "USO" ? "#0284c7" : "#64748b",
                boxShadow: subTabResp === "USO" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                "&:hover": { bgcolor: subTabResp === "USO" ? "#ffffff" : "rgba(0,0,0,0.04)" },
              }}
            >
              Responsable de Uso (3)
            </Button>
          </Box>
        </Box>

        {/* SUBSECCIÓN 1: RESPONSABLE DE INSTALACIÓN */}
        {(subTabResp === "TODOS" || subTabResp === "INSTALACION") && (
          <EstablecimientoCard
            id="rad_sub_resp_instalacion"
            title="Responsable de Instalación - [TRÁMITE PADRE]"
            icon={<EngineeringIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
            obs={getObs("rad_sub_resp_instalacion")}
            onOpenObs={onOpenObs}
            noGrid={true}
          >
            <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                Nómina de profesionales responsables de la instalación declarados en el trámite.
              </Typography>

              {RESPONSABLES_INSTALACION.map((resp) => {
                const isExpanded = !!expandedRespInst[resp.id];

                return (
                  <Paper
                    key={resp.id}
                    elevation={0}
                    sx={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 3,
                      overflow: "hidden",
                      bgcolor: "#ffffff",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#cbd5e1",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    {/* Header del Desplegable */}
                    <Box
                      onClick={() => toggleRespInst(resp.id)}
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        bgcolor: isExpanded ? "#f8fafc" : "#ffffff",
                        cursor: "pointer",
                        borderBottom: isExpanded ? "1px solid #e2e8f0" : "none",
                        userSelect: "none",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: isExpanded ? "#e0f2fe" : "#f1f5f9",
                            color: isExpanded ? "#0369a1" : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: "0.85rem",
                          }}
                        >
                          {resp.id}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                            {resp.titulo}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                            {resp.nombre} {resp.apellido} • CUIL: {resp.cuil}
                          </Typography>
                        </Box>
                      </Box>

                      <IconButton size="small" sx={{ color: "#64748b" }}>
                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </Box>

                    {/* Contenido desplegable: Mini card idéntica a la imagen de referencia */}
                    <Collapse in={isExpanded}>
                      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fafc" }}>
                        <Box sx={{ width: "100%" }}>
                          {/* Mini header "Datos personales" */}
                          <Box
                            onClick={() => toggleSubCard(`${resp.id}_inst_pers`)}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1.5,
                              px: 0.5,
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: "#0284c7",
                                fontSize: "1.02rem",
                              }}
                            >
                              Datos personales
                            </Typography>
                            <IconButton size="small" sx={{ color: "#0284c7", p: 0.5 }}>
                              {collapsedSubCards[`${resp.id}_inst_pers`] ? (
                                <KeyboardArrowDownIcon />
                              ) : (
                                <KeyboardArrowUpIcon />
                              )}
                            </IconButton>
                          </Box>

                          {/* Mini Card blanca con bordes redondeados y campos con subrayado discontinuo */}
                          <Collapse in={!collapsedSubCards[`${resp.id}_inst_pers`]}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: { xs: 2, sm: 3 },
                                border: "1px solid #e2e8f0",
                                borderRadius: 2.5,
                                bgcolor: "#ffffff",
                              }}
                            >
                              {/* Fila 1: Nombre/s *, Apellido/s *, CUIL * */}
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                                  gap: { xs: 2, sm: 3 },
                                  mb: 3,
                                }}
                              >
                                {/* Nombre/s */}
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 600,
                                      fontSize: "0.78rem",
                                      display: "block",
                                      mb: 0.8,
                                    }}
                                  >
                                    Nombre/s *
                                  </Typography>
                                  <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                                    <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                      {resp.nombre}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Apellido/s */}
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 600,
                                      fontSize: "0.78rem",
                                      display: "block",
                                      mb: 0.8,
                                    }}
                                  >
                                    Apellido/s *
                                  </Typography>
                                  <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                                    <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                      {resp.apellido}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* CUIL */}
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 600,
                                      fontSize: "0.78rem",
                                      display: "block",
                                      mb: 0.8,
                                    }}
                                  >
                                    CUIL *
                                  </Typography>
                                  <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                                    <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                      {resp.cuil}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>

                              {/* Fila 2: Celular *, Correo Electrónico * */}
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                                  gap: { xs: 2, sm: 3 },
                                }}
                              >
                                {/* Celular */}
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 600,
                                      fontSize: "0.78rem",
                                      display: "block",
                                      mb: 0.8,
                                    }}
                                  >
                                    Celular *
                                  </Typography>
                                  <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                                    <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                      {resp.celular}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Correo Electrónico */}
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 600,
                                      fontSize: "0.78rem",
                                      display: "block",
                                      mb: 0.8,
                                    }}
                                  >
                                    Correo Electrónico *
                                  </Typography>
                                  <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                                    <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                      {resp.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Paper>
                          </Collapse>
                        </Box>
                      </Box>
                    </Collapse>
                  </Paper>
                );
              })}
            </Box>
          </EstablecimientoCard>
        )}

        {/* SUBSECCIÓN 2: RESPONSABLE DE USO */}
        {(subTabResp === "TODOS" || subTabResp === "USO") && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0284c7", fontSize: "1.15rem" }}>
                Responsable de Uso
              </Typography>
            </Box>

            {/* Listado de Responsables de Uso (máximo 3) con desplegables */}
            <EstablecimientoCard
              id="rad_sub_resp_uso_container"
              title="Responsable de Uso"
              icon={<PersonIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
              obs={getObs("rad_sub_resp_uso_container")}
              onOpenObs={onOpenObs}
              noGrid={true}
            >
              <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Nómina de profesionales responsables del uso de equipos declarados en el trámite (máximo 3).
                </Typography>

                {RESPONSABLES_USO.map((resp) => {
                  const isExpanded = !!expandedRespUso[resp.id];
                  const presenteFieldId = `rad_resp_uso_${resp.id}_presente`;
                  const presenteVal = getValue(presenteFieldId, null);

                  return (
                    <Paper
                      key={resp.id}
                      elevation={0}
                      sx={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 3,
                        overflow: "hidden",
                        bgcolor: "#ffffff",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          borderColor: "#cbd5e1",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      {/* Header del Desplegable */}
                      <Box
                        onClick={() => toggleRespUso(resp.id)}
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          bgcolor: isExpanded ? "#f8fafc" : "#ffffff",
                          cursor: "pointer",
                          borderBottom: isExpanded ? "1px solid #e2e8f0" : "none",
                          userSelect: "none",
                          flexWrap: "wrap",
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: isExpanded ? "#e2e8f0" : "#f1f5f9",
                              color: "#334155",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 900,
                              fontSize: "0.85rem",
                            }}
                          >
                            {resp.id}
                          </Box>
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                              <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                                {resp.titulo}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                              {resp.nombre} {resp.apellido} • Matrícula: {resp.matricula} • CUIL: {resp.cuil}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton size="small" sx={{ color: "#64748b" }}>
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Contenido desplegable: Mini cards según la imagen */}
                      <Collapse in={isExpanded}>
                        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fafc", display: "flex", flexDirection: "column", gap: 2.5 }}>

                          {/* 1. Datos personales responsable de uso */}
                          <Box sx={{ width: "100%" }}>
                            <Box
                              onClick={() => toggleSubCard(`${resp.id}_pers`)}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1.5,
                                px: 0.5,
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  color: "#0284c7",
                                  fontSize: "1.02rem",
                                }}
                              >
                                Datos personales responsable de uso
                              </Typography>
                              <IconButton size="small" sx={{ color: "#0284c7", p: 0.5 }}>
                                {collapsedSubCards[`${resp.id}_pers`] ? (
                                  <KeyboardArrowDownIcon />
                                ) : (
                                  <KeyboardArrowUpIcon />
                                )}
                              </IconButton>
                            </Box>

                            <Collapse in={!collapsedSubCards[`${resp.id}_pers`]}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: { xs: 2, sm: 3 },
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 2.5,
                                  bgcolor: "#ffffff",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                                    gap: { xs: 2, sm: 3 },
                                  }}
                                >
                                  {/* Nombre/a */}
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#64748b",
                                        fontWeight: 600,
                                        fontSize: "0.78rem",
                                        display: "block",
                                        mb: 0.8,
                                      }}
                                    >
                                      Nombre/a
                                    </Typography>
                                    <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                                      <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                        {resp.nombre}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Apellido/a */}
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#64748b",
                                        fontWeight: 600,
                                        fontSize: "0.78rem",
                                        display: "block",
                                        mb: 0.8,
                                      }}
                                    >
                                      Apellido/a
                                    </Typography>
                                    <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                                      <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                        {resp.apellido}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* CUIL */}
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#64748b",
                                        fontWeight: 600,
                                        fontSize: "0.78rem",
                                        display: "block",
                                        mb: 0.8,
                                      }}
                                    >
                                      CUIL
                                    </Typography>
                                    <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                                      <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                        {resp.cuil}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Paper>
                            </Collapse>
                          </Box>

                          {/* 2. Datos académicos responsable de uso */}
                          <Box sx={{ width: "100%" }}>
                            <Box
                              onClick={() => toggleSubCard(`${resp.id}_acad`)}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1.5,
                                px: 0.5,
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  color: "#0284c7",
                                  fontSize: "1.02rem",
                                }}
                              >
                                Datos académicos responsable de uso
                              </Typography>
                              <IconButton size="small" sx={{ color: "#0284c7", p: 0.5 }}>
                                {collapsedSubCards[`${resp.id}_acad`] ? (
                                  <KeyboardArrowDownIcon />
                                ) : (
                                  <KeyboardArrowUpIcon />
                                )}
                              </IconButton>
                            </Box>

                            <Collapse in={!collapsedSubCards[`${resp.id}_acad`]}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: { xs: 2, sm: 3 },
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 2.5,
                                  bgcolor: "#ffffff",
                                }}
                              >
                                {/* Fila 1: Nº de matrícula *, Nº autorización individual * */}
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                                    gap: { xs: 2, sm: 3 },
                                    mb: 3,
                                  }}
                                >
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#64748b",
                                        fontWeight: 600,
                                        fontSize: "0.78rem",
                                        display: "block",
                                        mb: 0.8,
                                      }}
                                    >
                                      Nº de matrícula *
                                    </Typography>
                                    <Box sx={{ borderBottom: "1px solid #64748b", pb: 0.8 }}>
                                      <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                        {resp.matricula}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#64748b",
                                        fontWeight: 600,
                                        fontSize: "0.78rem",
                                        display: "block",
                                        mb: 0.8,
                                      }}
                                    >
                                      Nº autorización individual *
                                    </Typography>
                                    <Box sx={{ borderBottom: "1px solid #64748b", pb: 0.8 }}>
                                      <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                        {resp.autorizacion}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>

                                {/* Fila 2: Uso de equipos para * */}
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 600,
                                      fontSize: "0.78rem",
                                      display: "block",
                                      mb: 0.8,
                                    }}
                                  >
                                    Uso de equipos para *
                                  </Typography>
                                  <Box
                                    sx={{
                                      borderBottom: "1px solid #64748b",
                                      pb: 0.8,
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                                      {resp.usoEquipos}
                                    </Typography>
                                    <ArrowDropDownIcon sx={{ color: "#64748b" }} />
                                  </Box>
                                </Box>
                              </Paper>
                            </Collapse>
                          </Box>

                          {/* 3. Autorización Individual (Documento PDF) */}
                          <Box sx={{ width: "100%" }}>
                            <Box sx={{ mb: 1.5, px: 0.5 }}>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  color: "#1e293b",
                                  fontSize: "1.02rem",
                                }}
                              >
                                Autorización Individual
                              </Typography>
                            </Box>

                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                border: "1px solid #e2e8f0",
                                borderRadius: 2.5,
                                bgcolor: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 2,
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <DescriptionIcon sx={{ color: "#0ea5e9", fontSize: 28 }} />
                                <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.90rem" }}>
                                  Autorización Individual
                                </Typography>
                              </Box>

                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Tooltip title="Visualizar Autorización Individual (PDF)">
                                  <IconButton
                                    size="small"
                                    onClick={() => onOpenViewer && onOpenViewer(resp.pdfDoc)}
                                    sx={{ color: "#0284c7", bgcolor: "#e0f2fe", "&:hover": { bgcolor: "#bae6fd" } }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Paper>
                          </Box>

                          {/* 4. Verificación de Presencia en Inspección */}
                          <Box sx={{ width: "100%" }}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                border: "1px solid #e2e8f0",
                                borderRadius: 2.5,
                                bgcolor: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 2,
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <CheckCircleIcon
                                  sx={{
                                    color: presenteVal === "SI" ? "#16a34a" : presenteVal === "NO" ? "#dc2626" : "#94a3b8",
                                    fontSize: 26,
                                  }}
                                />
                                <Box>
                                  <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.92rem" }}>
                                    Constatación de presencia en la inspección
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                                    ¿El profesional responsable de uso se encuentra presente al momento de la inspección?
                                  </Typography>
                                </Box>
                              </Box>

                              <ToggleButtonGroup
                                size="small"
                                value={presenteVal}
                                exclusive
                                onChange={(e, val) => {
                                  handleToggle(presenteFieldId, val);
                                }}
                                sx={{
                                  height: 36,
                                  bgcolor: "#f8fafc",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: 2,
                                  "& .MuiToggleButton-root": {
                                    px: 2.5,
                                    fontSize: "0.80rem",
                                    fontWeight: 800,
                                    border: "none",
                                    color: "#64748b",
                                    "&.Mui-selected": {
                                      bgcolor: presenteVal === "SI" ? "#dcfce7" : "#fee2e2",
                                      color: presenteVal === "SI" ? "#166534" : "#991b1b",
                                      "&:hover": {
                                        bgcolor: presenteVal === "SI" ? "#bbf7d0" : "#fecaca",
                                      },
                                    },
                                  },
                                }}
                              >
                                <ToggleButton value="SI">SÍ</ToggleButton>
                                <ToggleButton value="NO">NO</ToggleButton>
                              </ToggleButtonGroup>
                            </Paper>
                          </Box>

                        </Box>
                      </Collapse>
                    </Paper>
                  );
                })}
              </Box>
            </EstablecimientoCard>
          </Box>
        )}
      </Box>
    );
  }

  // ────────────────────────────────────────────────────────────
  // 2. STEP: PERSONAL
  // ────────────────────────────────────────────────────────────
  if (category === "PERSONAL" || category === "PLANTEL" || category === "RECURSOS HUMANOS") {
    const staffList = [
      {
        id: "staff-1",
        nombre: "Lic. Martín S. Benítez",
        titulo: "Lic. en Producción de Bioimágenes",
        especialidad: "Radiofísica y Protección Radiológica",
        cuil: "20284509123",
        matricula: "MP-84920",
        dosimetro: "SI",
      },
      {
        id: "staff-2",
        nombre: "Tec. Andrea Romero",
        titulo: "Técnica Radióloga",
        especialidad: "Operadora de Equipo de Rayos X",
        cuil: "27341204504",
        matricula: "MP-12480",
        dosimetro: "SI",
      },
      {
        id: "staff-3",
        nombre: "Dr. Gustavo F. Morales",
        titulo: "Médico Cirujano",
        especialidad: "Especialista en Diagnóstico por Imágenes",
        cuil: "20229813407",
        matricula: "ME-7412",
        dosimetro: "SI",
      },
    ];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}>
        <EstablecimientoCard
          id="rad_sec_plantel"
          title="Plantel"
          icon={<PeopleIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
          obs={getObs("rad_sec_plantel") || getObs("rad_personal_general")}
          onOpenObs={onOpenObs}
          noGrid={true}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", py: 2 }}>
                    DATOS PERSONALES
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                    TITULO/ESPECIALIDAD
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                    CUIL/MATRICULA
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 140 }}>
                    DOSIMETRO
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffList.map((person) => {
                  return (
                    <TableRow key={person.id} hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                      <TableCell sx={{ py: 1.8 }}>
                        <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                          {person.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.8 }}>
                        <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.85rem" }}>
                          {person.titulo}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: "block" }}>
                          {person.especialidad}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.8 }}>
                        <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.85rem" }}>
                          CUIL: {person.cuil || person.dni}
                        </Typography>
                        <Chip
                          label={person.matricula}
                          size="small"
                          sx={{ height: 20, fontSize: "11px", fontWeight: 800, bgcolor: "#f1f5f9", color: "#334155", mt: 0.3 }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.8 }}>
                        {person.dosimetro === "SI" ? (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: "16px !important", color: "#15803d !important" }} />}
                            label="SÍ"
                            size="small"
                            sx={{
                              bgcolor: "#dcfce7",
                              color: "#166534",
                              fontWeight: 800,
                              fontSize: "12px",
                              border: "1px solid #bbf7d0",
                              px: 0.8,
                              py: 0.2,
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<CancelIcon sx={{ fontSize: "16px !important", color: "#b91c1c !important" }} />}
                            label="NO"
                            size="small"
                            sx={{
                              bgcolor: "#fee2e2",
                              color: "#991b1b",
                              fontWeight: 800,
                              fontSize: "12px",
                              border: "1px solid #fecaca",
                              px: 0.8,
                              py: 0.2,
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </EstablecimientoCard>
      </Box>
    );
  }

  // ────────────────────────────────────────────────────────────
  // 5. STEP: EQUIPAMIENTO
  // ────────────────────────────────────────────────────────────
  if (category === "EQUIPAMIENTO") {
    const fieldId = "rad_equipo_rx";

    const getFieldObs = (id, fallbackObs = "") => {
      const item = inspectorData[id];
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return item.obs !== undefined ? item.obs : fallbackObs;
      }
      return fallbackObs;
    };

    const equipoFieldsConfig = [
      { id: "rad_eq_marca", label: "Marca", defaultVal: "SIEMENS" },
      { id: "rad_eq_modelo", label: "Modelo", defaultVal: "Multix Impact" },
      { id: "rad_eq_serie", label: "Serie", defaultVal: "SN-684291-DE" },
      { id: "rad_eq_condicion", label: "Condición", defaultVal: "Propio" },
      { id: "rad_eq_ano_fab", label: "Año fabricación", defaultVal: "2022" },
      { id: "rad_eq_tipo", label: "Tipo de equipo", defaultVal: "Radiología Digital Directa (DR)" },
      { id: "rad_eq_movilidad", label: "Movilidad", defaultVal: "Fijo" },
      { id: "rad_eq_corriente_max", label: "Corriente max", defaultVal: "630 mA" },
      { id: "rad_eq_tension_max", label: "Tensión max", defaultVal: "150 kV" },
      { id: "rad_eq_tipo_revelado", label: "Tipo revelado", defaultVal: "DIGITAL" },
      { id: "rad_eq_pm_declarado", label: "Número de PM declarado", defaultVal: "PM-1458-42", noCheck: true },
    ];

    const getEquipoValue = (id, fallback) => {
      const item = inspectorData[id];
      let val = undefined;
      if (item && typeof item === "object" && !Array.isArray(item)) {
        val = item.value;
      } else if (item !== undefined) {
        val = item;
      }

      // Descartar placeholders genéricos antiguos guardados en localStorage
      const isPlaceholder =
        val === "marca" ||
        val === "modelo" ||
        val === "12345" ||
        val === "condicion" ||
        val === "tipo" ||
        val === "SONY" ||
        val === "UP-DF550" ||
        val === "SN-849201";

      if (val === undefined || val === null || val === "" || isPlaceholder) {
        return fallback;
      }

      return val;
    };

    const computeGeneralObs = (observedFields) => {
      if (observedFields.length === 0) {
        return "";
      }
      return observedFields.map((f) => `${f.label}: ${f.value}`).join(", ");
    };

    const activeObsCount = equipoFieldsConfig
      .filter((f) => !f.noCheck && Boolean(getFieldObs(f.id, "")))
      .length;

    // Si no tiene nada seleccionado (activeObsCount === 0), la observación queda vacía
    const storedObs = getFieldObs(fieldId, "");
    const obsVal = activeObsCount === 0
      ? ""
      : (storedObs || computeGeneralObs(
          equipoFieldsConfig
            .filter((f) => !f.noCheck && Boolean(getFieldObs(f.id, "")))
            .map((f) => ({ label: f.label, value: getEquipoValue(f.id, f.defaultVal) }))
        ));

    const pmObservadoVal = getValue("rad_equipo_pm_observado", "");

    const handleToggleFieldObs = (targetId, targetLabel, currentVal) => {
      const isCurrentlyObs = Boolean(getFieldObs(targetId, ""));
      const willBeObs = !isCurrentlyObs;

      onChange(targetId, {
        value: currentVal !== undefined ? currentVal : getEquipoValue(targetId, ""),
        obs: willBeObs ? `Observado: ${targetLabel}` : "",
      });

      const allFields = equipoFieldsConfig
        .filter((f) => !f.noCheck)
        .map((f) => {
          const isObs = f.id === targetId ? willBeObs : Boolean(getFieldObs(f.id, ""));
          const val = getEquipoValue(f.id, f.defaultVal);
          return {
            label: f.label,
            value: val,
            isObs,
          };
        });

      const observedFields = allFields.filter((f) => f.isObs);

      onChange(fieldId, {
        value: getValue(fieldId, ""),
        obs: computeGeneralObs(observedFields),
      });
    };

    const handlePmObservadoChange = (newVal) => {
      onChange("rad_equipo_pm_observado", {
        value: newVal,
        obs: "",
      });
    };

    const eppList = [
      {
        id: "mampara_plomada",
        nombre: "Mampara plomada",
        declarada: 8,
        unidades: [
          { unidad: "#1", marca: "Bar-Ray", antiguedad: "4", cantidad: 5 },
          { unidad: "#2", marca: "Mavig", antiguedad: "2", cantidad: 3 },
        ],
      },
      {
        id: "chalecos_plomados",
        nombre: "Chalecos plomados (0.5 mm Pb eq)",
        declarada: 3,
        unidades: [
          { unidad: "#1", marca: "Wolf X-Ray", antiguedad: "3", cantidad: 2 },
          { unidad: "#2", marca: "Bar-Ray", antiguedad: "1", cantidad: 1 },
        ],
      },
      {
        id: "protectores_tiroideos",
        nombre: "Protectores tiroideos (0.5 mm Pb eq)",
        declarada: 3,
        unidades: [
          { unidad: "#1", marca: "Mavig", antiguedad: "2", cantidad: 3 },
        ],
      },
      {
        id: "protectores_gonadales",
        nombre: "Protectores gonadales (0.5 mm Pb eq)",
        declarada: 2,
        unidades: [
          { unidad: "#1", marca: "Infab", antiguedad: "4", cantidad: 2 },
        ],
      },
      {
        id: "antiparras_plomadas",
        nombre: "Antiparras / Lentes plomados con protección lateral",
        declarada: 2,
        unidades: [
          { unidad: "#1", marca: "ProtecX", antiguedad: "1", cantidad: 2 },
        ],
      },
      {
        id: "guantes_plomados",
        nombre: "Guantes plomados (0.5 mm Pb eq)",
        declarada: 1,
        unidades: [
          { unidad: "#1", marca: "KAV Medical", antiguedad: "2", cantidad: 1 },
        ],
      },
    ];

    const toggleEppExpanded = (id) => {
      setExpandedEpp((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        {/* Card 1: Equipos generadores de rayos X */}
        <EstablecimientoCard
          id={fieldId}
          title="Equipos generadores de rayos X"
          icon={
            <Typography
              component="span"
              sx={{
                fontWeight: 900,
                color: "#0284c7",
                bgcolor: "#e0f2fe",
                px: 1,
                py: 0.2,
                borderRadius: 1.5,
                fontSize: "0.85rem",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              #1
            </Typography>
          }
          obs={obsVal}
        >
          {equipoFieldsConfig.map((field) => {
            const isObs = Boolean(getFieldObs(field.id, ""));
            return (
              <CardFieldCheckItem
                key={field.id}
                id={field.id}
                label={field.label}
                value={getEquipoValue(field.id, field.defaultVal)}
                isObserved={isObs}
                onToggleObs={handleToggleFieldObs}
                noCheck={field.noCheck}
              />
            );
          })}

          <Box sx={{ py: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.4, minHeight: 24 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                Número de PM observado
              </Typography>
            </Box>
            <TextField
              size="small"
              fullWidth
              variant="standard"
              placeholder="No declarado"
              value={pmObservadoVal}
              onChange={(e) => handlePmObservadoChange(e.target.value)}
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                mt: 0.2,
                "& .MuiInputBase-input": {
                  fontWeight: pmObservadoVal ? 700 : 500,
                  color: pmObservadoVal ? "#1e293b" : "#94a3b8",
                  fontSize: "0.95rem",
                  fontStyle: pmObservadoVal ? "normal" : "italic",
                  p: 0,
                },
              }}
            />
          </Box>

          {/* Observación general que se alimenta automáticamente de los checks */}
          <Box sx={{ mt: 1.5, pt: 2.5, borderTop: "1px solid #e2e8f0", gridColumn: { xs: "1fr", sm: "1 / -1" } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
              <ChatBubbleIcon sx={{ fontSize: 18, color: obsVal ? "#0284c7" : "#94a3b8" }} />
              <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: obsVal ? "#0369a1" : "#475569", textTransform: "uppercase", letterSpacing: 0.3 }}>
                Observación general del equipo
              </Typography>
              {activeObsCount > 0 && (
                <Chip
                  label={`${activeObsCount} campo${activeObsCount > 1 ? "s" : ""} marcado${activeObsCount > 1 ? "s" : ""}`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    bgcolor: "#e0f2fe",
                    color: "#0369a1",
                    border: "1px solid #bae6fd",
                  }}
                />
              )}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              placeholder="Al tildar el check OBS en los campos, se completará aquí la observación general..."
              value={obsVal}
              onChange={(e) => {
                onChange(fieldId, {
                  value: getValue(fieldId, ""),
                  obs: e.target.value,
                });
              }}
              sx={{
                bgcolor: obsVal ? "#f0f9ff" : "#f8fafc",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  borderColor: obsVal ? "#7dd3fc" : "#e2e8f0",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: obsVal ? "#0284c7" : "#cbd5e1",
                  },
                  fontSize: "0.85rem",
                  color: "#1e293b",
                },
              }}
            />
          </Box>
        </EstablecimientoCard>

        {/* Card 2: Elementos de protección personal */}
        <EstablecimientoCard
          id="rad_sec_epp"
          title="Elementos de protección personal"
          icon={<SecurityIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
          obs={getObs("rad_sec_epp")}
          onOpenObs={onOpenObs}
          noGrid={true}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#004884" }}>
                  <TableCell sx={{ fontWeight: 800, color: "#ffffff", fontSize: "0.78rem", py: 1.5, px: 3, letterSpacing: 0.5 }}>
                    ELEMENTO
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: "#ffffff", fontSize: "0.78rem", py: 1.5, letterSpacing: 0.5 }}>
                    CANTIDAD DECLARADA
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: "#ffffff", fontSize: "0.78rem", py: 1.5, letterSpacing: 0.5 }}>
                    CANTIDAD OBSERVADA
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: "#ffffff", fontSize: "0.78rem", py: 1.5, width: 80 }}>
                    OBS.
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: "#ffffff", fontSize: "0.78rem", py: 1.5, width: 60 }}>
                    DETALLE
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <TableCell colSpan={5} sx={{ py: 1.2, px: 3 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.76rem", color: "#004884", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      ELEMENTO DE PROTECCION PERSONAL REQUERIDOS
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, mt: 0.2 }}>
                      - MARCA/ANTIGÜEDAD/CANTIDAD
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {eppList.map((epp) => {
                  const eppFieldId = `rad_epp_${epp.id}`;
                  const obsQtyFieldId = `rad_epp_${epp.id}_obs_qty`;
                  const isExpanded = !!expandedEpp[epp.id];
                  const currentObsQty = getValue(obsQtyFieldId, epp.declarada);
                  const eppObs = getObs(eppFieldId);

                  return (
                    <React.Fragment key={epp.id}>
                      <TableRow
                        hover
                        onClick={() => toggleEppExpanded(epp.id)}
                        sx={{
                          cursor: "pointer",
                          bgcolor: isExpanded ? "#f8fafc" : "#ffffff",
                          "&:hover": { bgcolor: "#f1f5f9" },
                        }}
                      >
                        <TableCell sx={{ py: 1.8, px: 3 }}>
                          <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>
                            {epp.nombre}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#1e293b" }}>
                            {epp.declarada}
                          </Typography>
                        </TableCell>

                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <TextField
                            size="small"
                            type="number"
                            value={currentObsQty}
                            onChange={(e) => {
                              const newQty = e.target.value;
                              const isDiff = newQty !== "" && Number(newQty) !== Number(epp.declarada);
                              const autoObs = isDiff
                                ? `Cantidad observada (${newQty}) no coincide con la declarada (${epp.declarada})`
                                : "";
                              onChange(obsQtyFieldId, {
                                value: newQty,
                                obs: autoObs,
                              });
                              if (isDiff) {
                                onChange(eppFieldId, {
                                  value: getValue(eppFieldId, "observado"),
                                  obs: autoObs,
                                });
                              }
                            }}
                            sx={{
                              width: 80,
                              "& .MuiInputBase-input": {
                                textAlign: "center",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                py: 0.8,
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title={eppObs ? `Observación: ${eppObs}` : `Observar ${epp.nombre}`}>
                            <IconButton
                              size="small"
                              onClick={() => onOpenObs(eppFieldId, epp.nombre, eppObs, "TRAMITE")}
                              sx={{ color: eppObs ? "#0ea5e9" : "#94a3b8" }}
                            >
                              {eppObs ? (
                                <ChatBubbleIcon fontSize="small" />
                              ) : (
                                <ChatBubbleOutlineIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>

                        <TableCell align="center">
                          <IconButton size="small" sx={{ color: "#64748b" }}>
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Desplegable con los datos de cada una de las unidades (Unidad, Marca, Antigüedad, Cantidad) */}
                      <TableRow>
                        <TableCell colSpan={5} sx={{ p: 0, bgcolor: "#ffffff" }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 1.5, px: 3, bgcolor: "#ffffff" }}>
                              <Table
                                size="small"
                                sx={{
                                  bgcolor: "#ffffff",
                                  "& th": {
                                    color: "#004884",
                                    fontWeight: 800,
                                    fontSize: "0.75rem",
                                    py: 1,
                                    px: 2,
                                    borderBottom: "1.5px solid #e2e8f0",
                                  },
                                  "& td": {
                                    py: 1,
                                    px: 2,
                                    fontSize: "0.82rem",
                                    color: "#475569",
                                    borderBottom: "1px solid #f1f5f9",
                                  },
                                }}
                              >
                                <TableHead>
                                  <TableRow>
                                    <TableCell>UNIDAD</TableCell>
                                    <TableCell>MARCA</TableCell>
                                    <TableCell>ANTIGÜEDAD</TableCell>
                                    <TableCell>CANTIDAD</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {epp.unidades.map((u, uIdx) => (
                                    <TableRow key={uIdx} hover>
                                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                                        {u.unidad}
                                      </TableCell>
                                      <TableCell sx={{ color: "#64748b" }}>{u.marca}</TableCell>
                                      <TableCell sx={{ color: "#64748b" }}>{u.antiguedad}</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                                        {u.cantidad}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </EstablecimientoCard>
      </Box>
    );
  }

  // ────────────────────────────────────────────────────────────
  // 6. STEP: DOCUMENTOS ADJUNTOS
  // ────────────────────────────────────────────────────────────
  if (category === "DOCUMENTACION") {
    const documentTypes = [
      {
        id: "tipo-plano-blindaje",
        title: "Plano estructural con cálculo de blindaje",
        emisor: "Especialista en Radiofísica Médica Matriculado",
        detalle: "Memoria descriptiva, cálculo analítico de blindajes y certificación técnica de espesores de plomo / baritado.",
        files: [
          {
            id: "plano-1",
            name: "Memoria_Descriptiva_Calculo_Blindaje_RX.pdf",
            detalle: "Cálculo de blindaje analítico y barreras de protección de sala de Rayos X",
            size: "3.4 MB",
            fecha: "12/03/2026",
            pdf: "plano_blindaje.pdf",
            fieldId: "rad_doc_plano_blindaje_1",
            legacyFieldId: "rad_arq_plano_blindaje",
          },
          {
            id: "plano-2",
            name: "Plano_Planta_Cortes_Espesor_Plomo.pdf",
            detalle: "Planos arquitectónicos con cortes y blindaje de plomo/baritado certificado",
            size: "4.8 MB",
            fecha: "14/03/2026",
            pdf: "plano_blindaje.pdf",
            fieldId: "rad_doc_plano_blindaje_2",
          },
        ],
      },
      {
        id: "tipo-tasa-retributiva",
        title: "Tasa retributiva de servicios",
        emisor: "Dirección de Jurisdicción Farmacia y Radiofísica",
        detalle: "Arancel oficial y comprobantes de liquidación para habilitación de equipos generadores de radiación.",
        files: [
          {
            id: "tasa-1",
            name: "Comprobante_Pago_Tasa_Retributiva.pdf",
            detalle: "Comprobante de pago arancelario habilitación de equipo RX",
            size: "850 KB",
            fecha: "20/03/2026",
            pdf: "tasa_retributiva.pdf",
            fieldId: "rad_doc_tasa_retributiva_1",
            legacyFieldId: "rad_doc_tasa_retributiva",
          },
          {
            id: "tasa-2",
            name: "Constancia_Liquidacion_DGR_Timbrado.pdf",
            detalle: "Formulario de liquidación tributaria oficial DGR con timbrado",
            size: "620 KB",
            fecha: "20/03/2026",
            pdf: "tasa_retributiva.pdf",
            fieldId: "rad_doc_tasa_retributiva_2",
          },
        ],
      },
      {
        id: "tipo-constancia-dosimetria",
        title: "Constancia de prestación de dosimetría",
        emisor: "Empresa de Dosimetría Acreditada (CNEA / ARN)",
        detalle: "Contrato de vigilancia radiológica y registros dosimétricos para el personal expuesto.",
        files: [
          {
            id: "dosimetria-1",
            name: "Contrato_Vigente_Servicio_Dosimetria.pdf",
            detalle: "Contrato vigente de servicio dosimétrico individual para el plantel",
            size: "1.2 MB",
            fecha: "05/01/2026",
            pdf: "constancia_dosimetria.pdf",
            fieldId: "rad_doc_constancia_dosimetria_1",
            legacyFieldId: "rad_doc_constancia_dosimetria",
          },
          {
            id: "dosimetria-2",
            name: "Ultimo_Informe_Dosimetrico_Trimestral.pdf",
            detalle: "Reporte y lectura dosimétrica acumulada del último trimestre",
            size: "980 KB",
            fecha: "10/03/2026",
            pdf: "constancia_dosimetria.pdf",
            fieldId: "rad_doc_constancia_dosimetria_2",
          },
        ],
      },
      {
        id: "tipo-residuos-peligrosos",
        title: "Convenio actualizado de residuos peligrosos",
        emisor: "Operador de Residuos Peligrosos Autorizado",
        detalle: "Convenio y certificaciones ambientales para la gestión de efluentes fotográficos y residuos químicos.",
        files: [
          {
            id: "residuos-1",
            name: "Convenio_Recoleccion_Residuos_Peligrosos.pdf",
            detalle: "Convenio con empresa de recolección y tratamiento de residuos biopatogénicos y químicos",
            size: "1.5 MB",
            fecha: "15/02/2026",
            pdf: "convenio_residuos.pdf",
            fieldId: "rad_doc_residuos_peligrosos_1",
            legacyFieldId: "rad_doc_residuos_peligrosos",
          },
          {
            id: "residuos-2",
            name: "Certificado_Ambiental_Disposicion_Final.pdf",
            detalle: "Certificado de tratamiento y disposición ambiental de líquidos fijadores/reveladores",
            size: "740 KB",
            fecha: "18/02/2026",
            pdf: "convenio_residuos.pdf",
            fieldId: "rad_doc_residuos_peligrosos_2",
          },
        ],
      },
      {
        id: "tipo-manual-usuario",
        title: "Manual de usuario",
        emisor: "Fabricante / Proveedor del Equipamiento RX (Siemens Healthineers)",
        detalle: "Documentación técnica oficial, especificaciones del fabricante y protocolos de calibración y seguridad.",
        files: [
          {
            id: "manual-1",
            name: "Manual_Operacion_Tecnica_Siemens_Multix_Impact.pdf",
            detalle: "Manual de usuario y especificaciones de operación técnica del equipamiento SIEMENS Multix Impact",
            size: "5.1 MB",
            fecha: "08/11/2025",
            pdf: "manual_usuario.pdf",
            fieldId: "rad_doc_manual_usuario_1",
            legacyFieldId: "rad_doc_manual_usuario",
          },
          {
            id: "manual-2",
            name: "Guia_Seguridad_Radiologica_Mantenimiento.pdf",
            detalle: "Protocolo de mantenimiento preventivo, seguridad y tolerancias radiológicas",
            size: "2.8 MB",
            fecha: "12/01/2026",
            pdf: "manual_usuario.pdf",
            fieldId: "rad_doc_manual_usuario_2",
          },
        ],
      },
      {
        id: "tipo-documentacion-general",
        title: "Documentación general",
        emisor: "Establecimiento / Titular",
        detalle: "Constancias institucionales, habilitaciones locales y coberturas de seguro vigentes.",
        files: [
          {
            id: "gral-1",
            name: "Habilitacion_Municipal_Vigente.pdf",
            detalle: "Certificado de habilitación municipal del establecimiento",
            size: "1.1 MB",
            fecha: "10/01/2026",
            pdf: "documentacion_general.pdf",
            fieldId: "rad_doc_documentacion_general_1",
            legacyFieldId: "rad_doc_documentacion_general",
          },
          {
            id: "gral-2",
            name: "Poliza_Seguro_Responsabilidad_Civil.pdf",
            detalle: "Póliza de seguro vigente de responsabilidad civil y coberturas",
            size: "1.7 MB",
            fecha: "01/02/2026",
            pdf: "documentacion_general.pdf",
            fieldId: "rad_doc_documentacion_general_2",
          },
        ],
      },
    ];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        {documentTypes.map((tipo) => (
          <Paper
            key={tipo.id}
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 3.5,
              overflow: "hidden",
              bgcolor: "#ffffff",
            }}
          >
            {/* Subtítulo del tipo de documento */}
            <Box
              sx={{
                bgcolor: "#f8fafc",
                px: 2.5,
                py: 1.8,
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <DescriptionIcon sx={{ color: "#0284c7", fontSize: 22 }} />
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "#1e293b",
                      fontSize: "0.92rem",
                      textTransform: "uppercase",
                      letterSpacing: 0.3,
                    }}
                  >
                    {tipo.title}
                  </Typography>
                  {tipo.detalle && (
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, display: "block", mt: 0.2 }}>
                      {tipo.detalle}
                    </Typography>
                  )}
                </Box>
              </Box>

              {tipo.emisor && (
                <Chip
                  label={tipo.emisor}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.70rem",
                    bgcolor: "#ffffff",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    height: 24,
                  }}
                />
              )}
            </Box>

            {/* 2 ejemplos de archivos dentro de este subtítulo */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#ffffff" }}>
                    <TableCell sx={{ fontWeight: 800, color: "#64748b", fontSize: "0.74rem", py: 1.2, letterSpacing: 0.2 }}>
                      ARCHIVO ADJUNTO
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#64748b", fontSize: "0.74rem", letterSpacing: 0.2, width: 160 }}>
                      DETALLE / TAMAÑO
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "#64748b", fontSize: "0.74rem", letterSpacing: 0.2, width: 110 }}>
                      VISUALIZAR
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "#64748b", fontSize: "0.74rem", letterSpacing: 0.2, width: 70 }}>
                      OBS.
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tipo.files.map((file) => {
                    const fileObs = getObs(file.fieldId) || (file.legacyFieldId ? getObs(file.legacyFieldId) : "");
                    return (
                      <TableRow key={file.id} hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                            <Box
                              sx={{
                                p: 0.7,
                                borderRadius: 1.5,
                                bgcolor: "#f0f9ff",
                                color: "#0284c7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mt: 0.2,
                              }}
                            >
                              <DescriptionIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.86rem" }}>
                                {file.name}
                              </Typography>
                              {file.detalle && (
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, display: "block", mt: 0.2 }}>
                                  {file.detalle}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography sx={{ color: "#475569", fontSize: "0.80rem", fontWeight: 600 }}>
                            {file.size}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                            {file.fecha}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={`Visualizar ${file.name}`}>
                            <IconButton
                              size="small"
                              onClick={() => onOpenViewer && onOpenViewer(file.pdf)}
                              sx={{ color: "#0284c7", bgcolor: "#e0f2fe", "&:hover": { bgcolor: "#bae6fd" } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={fileObs ? "Ver / Editar observación" : "Agregar observación"}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                onOpenObs &&
                                onOpenObs(file.fieldId, file.name, fileObs, "TRAMITE")
                              }
                              sx={{ color: fileObs ? "#0ea5e9" : "#94a3b8" }}
                            >
                              {fileObs ? <ChatBubbleIcon fontSize="small" /> : <ChatBubbleOutlineIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))}
      </Box>
    );
  }

  return null;
};

export default DatosTramiteRadiofisica;
