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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.4 }}>
        <Typography
          variant="caption"
          sx={{
            color: isObserved ? "#0369a1" : "#64748b",
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </Typography>
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
  const [expandedPrestador, setExpandedPrestador] = useState(true);
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
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        {/* Contenedor 1: Datos generales */}
        <EstablecimientoCard
          id="rad_sec_datos_generales"
          title="Datos generales"
          icon={<ApartmentIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
          obs={getObs("rad_sec_datos_generales")}
          onOpenObs={onOpenObs}
        >
          <CardFieldItem
            id="rad_est_tipo_dependencia"
            label="Tipo dependencia"
            value={getValue("rad_est_tipo_dependencia", "PÚBLICA")}
          />
          <CardFieldItem
            id="rad_est_denominacion"
            label="Denominación"
            value={getValue("rad_est_denominacion", "Hola")}
          />
          <CardFieldItem
            id="rad_est_propiedad"
            label="Propiedad"
            value={getValue("rad_est_propiedad", "Molina Martin Roberto")}
          />
          <CardFieldItem
            id="rad_est_cuit"
            label="CUIT"
            value={getValue("rad_est_cuit", "20-39624236-3")}
          />
          <CardFieldItem
            id="rad_est_hab_municipal"
            label="Posee habilitación municipal"
            value={getValue("rad_est_hab_municipal", "Sí")}
          />
        </EstablecimientoCard>

        {/* Contenedor 2: Datos de contacto del establecimiento */}
        <EstablecimientoCard
          id="rad_sec_contacto_establecimiento"
          title="Datos de contacto del establecimiento"
          icon={<PhoneIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
          obs={getObs("rad_sec_contacto_establecimiento")}
          onOpenObs={onOpenObs}
        >
          <CardFieldItem
            id="rad_est_celular"
            label="Celular"
            value={getValue("rad_est_celular", "3516123456")}
          />
          <CardFieldItem
            id="rad_est_telefono"
            label="Teléfono"
            value={getValue("rad_est_telefono", null)}
          />
          <CardFieldItem
            id="rad_est_correo"
            label="Correo Electrónico"
            value={getValue("rad_est_correo", "aaaa@gmail.com")}
          />
          <CardFieldItem
            id="rad_est_celular_alt"
            label="Celular Alternativo"
            value={getValue("rad_est_celular_alt", null)}
          />
          <CardFieldItem
            id="rad_est_telefono_alt"
            label="Teléfono Alternativo"
            value={getValue("rad_est_telefono_alt", null)}
          />
          <CardFieldItem
            id="rad_est_correo_alt"
            label="Correo Electrónico Alternativo"
            value={getValue("rad_est_correo_alt", null)}
          />
        </EstablecimientoCard>

        {/* Contenedor 3: Domicilio del establecimiento */}
        <EstablecimientoCard
          id="rad_sec_domicilio_establecimiento"
          title="Domicilio del establecimiento"
          icon={<PlaceIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
          obs={getObs("rad_sec_domicilio_establecimiento")}
          onOpenObs={onOpenObs}
        >
          <CardFieldItem
            id="rad_est_calle"
            label="Calle"
            value={getValue("rad_est_calle", "Chacabuco")}
          />
          <CardFieldItem
            id="rad_est_numero"
            label="Número"
            value={getValue("rad_est_numero", "10")}
          />
          <CardFieldItem
            id="rad_est_barrio"
            label="Barrio"
            value={getValue("rad_est_barrio", "Centro")}
          />
          <CardFieldItem
            id="rad_est_piso"
            label="Piso"
            value={getValue("rad_est_piso", null)}
          />
          <CardFieldItem
            id="rad_est_depto"
            label="Depto"
            value={getValue("rad_est_depto", null)}
          />
          <CardFieldItem
            id="rad_est_cp"
            label="Código Postal"
            value={getValue("rad_est_cp", "5000")}
          />
          <CardFieldItem
            id="rad_est_provincia"
            label="Provincia"
            value={getValue("rad_est_provincia", "CORDOBA")}
          />
          <CardFieldItem
            id="rad_est_departamento"
            label="Departamento"
            value={getValue("rad_est_departamento", "CAPITAL")}
          />
          <CardFieldItem
            id="rad_est_localidad"
            label="Localidad"
            value={getValue("rad_est_localidad", "CORDOBA")}
          />
        </EstablecimientoCard>

        {/* Contenedor 4: Datos de contacto del propietario */}
        <EstablecimientoCard
          id="rad_sec_contacto_propietario"
          title="Datos de contacto del propietario"
          icon={<PersonIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
          obs={getObs("rad_sec_contacto_propietario")}
          onOpenObs={onOpenObs}
        >
          <CardFieldItem
            id="rad_prop_celular"
            label="Celular"
            value={getValue("rad_prop_celular", "000000")}
          />
          <CardFieldItem
            id="rad_prop_telefono"
            label="Teléfono"
            value={getValue("rad_prop_telefono", null)}
          />
          <CardFieldItem
            id="rad_prop_correo"
            label="Correo Electrónico"
            value={getValue("rad_prop_correo", "martinmolina1379@gmail.com")}
          />
        </EstablecimientoCard>

        {/* Contenedor 5: Domicilio del propietario */}
        <EstablecimientoCard
          id="rad_sec_domicilio_propietario"
          title="Domicilio del propietario"
          icon={<PlaceIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
          obs={getObs("rad_sec_domicilio_propietario")}
          onOpenObs={onOpenObs}
        >
          <CardFieldItem
            id="rad_prop_calle"
            label="Calle"
            value={getValue("rad_prop_calle", "Moyano")}
          />
          <CardFieldItem
            id="rad_prop_numero"
            label="Número"
            value={getValue("rad_prop_numero", "1182")}
          />
          <CardFieldItem
            id="rad_prop_barrio"
            label="Barrio"
            value={getValue("rad_prop_barrio", "Nueva Córdoba")}
          />
          <CardFieldItem
            id="rad_prop_piso"
            label="Piso"
            value={getValue("rad_prop_piso", null)}
          />
          <CardFieldItem
            id="rad_prop_depto"
            label="Depto"
            value={getValue("rad_prop_depto", null)}
          />
          <CardFieldItem
            id="rad_prop_cp"
            label="Código Postal"
            value={getValue("rad_prop_cp", "5016")}
          />
          <CardFieldItem
            id="rad_prop_provincia"
            label="Provincia"
            value={getValue("rad_prop_provincia", "CORDOBA")}
          />
          <CardFieldItem
            id="rad_prop_departamento"
            label="Departamento"
            value={getValue("rad_prop_departamento", "CAPITAL")}
          />
          <CardFieldItem
            id="rad_prop_localidad"
            label="Localidad"
            value={getValue("rad_prop_localidad", "CORDOBA")}
          />
        </EstablecimientoCard>

        {/* Contenedor 6: Prestador de servicio (desplegable) */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "#ffffff",
          }}
        >
          {/* Header del desplegable Prestador de servicio */}
          <Box
            onClick={() => setExpandedPrestador((prev) => !prev)}
            sx={{
              bgcolor: expandedPrestador ? "#f8fafc" : "#ffffff",
              px: 2.5,
              py: 1.8,
              borderBottom: expandedPrestador ? "1px solid #e2e8f0" : "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ApartmentIcon sx={{ color: "#0ea5e9", fontSize: 24 }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  color: "#1e293b",
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                }}
              >
                Prestador de servicio
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title={getObs("rad_sec_prestador_servicio") ? "Ver / Editar observación" : "Observar Prestador de servicio"}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenObs &&
                      onOpenObs(
                        "rad_sec_prestador_servicio",
                        "Prestador de servicio",
                        getObs("rad_sec_prestador_servicio"),
                        "ESTABLECIMIENTO"
                      );
                  }}
                  sx={{ color: getObs("rad_sec_prestador_servicio") ? "#0ea5e9" : "#94a3b8" }}
                >
                  {getObs("rad_sec_prestador_servicio") ? (
                    <ChatBubbleIcon fontSize="small" />
                  ) : (
                    <ChatBubbleOutlineIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <IconButton size="small" sx={{ color: "#64748b" }}>
                {expandedPrestador ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Contenido desplegable: las 2 cards según la foto */}
          <Collapse in={expandedPrestador}>
            <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fafc", display: "flex", flexDirection: "column", gap: 3 }}>
              
              {/* Card 1: Datos generales del prestador del servicio */}
              <Box sx={{ width: "100%" }}>
                <Box
                  onClick={() => toggleSubCard("prest_gen")}
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
                    Datos generales del prestador del servicio
                  </Typography>
                  <IconButton size="small" sx={{ color: "#0284c7", p: 0.5 }}>
                    {collapsedSubCards["prest_gen"] ? (
                      <KeyboardArrowDownIcon />
                    ) : (
                      <KeyboardArrowUpIcon />
                    )}
                  </IconButton>
                </Box>

                <Collapse in={!collapsedSubCards["prest_gen"]}>
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
                          Nombre/s
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_nombre", "Maximo Samir")}
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
                          Apellido/s
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_apellido", "Tabares")}
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
                            {getValue("rad_prest_cuil", "20460337691")}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Collapse>
              </Box>

              {/* Card 2: Domicilio del prestador del servicio */}
              <Box sx={{ width: "100%" }}>
                <Box
                  onClick={() => toggleSubCard("prest_dom")}
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
                    Domicilio del prestador del servicio
                  </Typography>
                  <IconButton size="small" sx={{ color: "#0284c7", p: 0.5 }}>
                    {collapsedSubCards["prest_dom"] ? (
                      <KeyboardArrowDownIcon />
                    ) : (
                      <KeyboardArrowUpIcon />
                    )}
                  </IconButton>
                </Box>

                <Collapse in={!collapsedSubCards["prest_dom"]}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      border: "1px solid #e2e8f0",
                      borderRadius: 2.5,
                      bgcolor: "#ffffff",
                    }}
                  >
                    {/* Fila 1: Calle, Número, Barrio */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
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
                          Calle
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_calle", "No informado")}
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
                          Número
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_numero", "No informado")}
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
                          Barrio
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_barrio", "No informado")}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Fila 2: Piso, Depto, Código postal */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
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
                          Piso
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_piso", "No informado")}
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
                          Depto
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_depto", "No informado")}
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
                          Código postal
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_cp", "No informado")}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Fila 3: Provincia, Departamento, Localidad */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                        gap: { xs: 2, sm: 3 },
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
                          Provincia
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_provincia", "No informado")}
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
                          Departamento
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_departamento", "No informado")}
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
                          Localidad
                        </Typography>
                        <Box sx={{ borderBottom: "1px dashed #cbd5e1", pb: 0.8 }}>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.92rem" }}>
                            {getValue("rad_prest_localidad", "No informado")}
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
              Responsable de Instalación (3)
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
            title="Responsable de Instalación"
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
                  const docObsKey = `rad_resp_uso_${resp.id}_doc_obs`;
                  const docObs = getObs(docObsKey);

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
                              {resp.nombre} {resp.apellido} • Matrícula: {resp.matricula} • CUIL: {resp.cuil}
                            </Typography>
                          </Box>
                        </Box>

                        <IconButton size="small" sx={{ color: "#64748b" }}>
                          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
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

                                <Tooltip title={docObs ? "Ver / Editar observación" : "Agregar observación"}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      onOpenObs &&
                                      onOpenObs(
                                        docObsKey,
                                        `Autorización Individual - ${resp.nombre} ${resp.apellido}`,
                                        docObs,
                                        "TRAMITE"
                                      )
                                    }
                                    sx={{ color: docObs ? "#0ea5e9" : "#94a3b8" }}
                                  >
                                    {docObs ? <ChatBubbleIcon fontSize="small" /> : <ChatBubbleOutlineIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                              </Box>
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
        dni: "28.450.912",
        matricula: "MP-84920",
        dosimetro: "SI",
      },
      {
        id: "staff-2",
        nombre: "Tec. Andrea Romero",
        titulo: "Técnica Radióloga",
        especialidad: "Operadora de Equipo de Rayos X",
        dni: "34.120.450",
        matricula: "MP-12480",
        dosimetro: "SI",
      },
      {
        id: "staff-3",
        nombre: "Dr. Gustavo F. Morales",
        titulo: "Médico Cirujano",
        especialidad: "Especialista en Diagnóstico por Imágenes",
        dni: "22.981.340",
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
                    DNI/MATRICULA
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
                          DNI: {person.dni}
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
    const obsVal = getObs(fieldId);
    const pmObservadoVal = getValue("rad_equipo_pm_observado", "");

    const equipoFieldsConfig = [
      { id: "rad_eq_marca", label: "Marca", defaultVal: "marca" },
      { id: "rad_eq_modelo", label: "Modelo", defaultVal: "modelo" },
      { id: "rad_eq_serie", label: "Serie", defaultVal: "12345" },
      { id: "rad_eq_condicion", label: "Condición", defaultVal: "Propio" },
      { id: "rad_eq_ano_fab", label: "Año fabricación", defaultVal: "2000" },
      { id: "rad_eq_tipo", label: "Tipo de equipo", defaultVal: "Fijo" },
      { id: "rad_eq_corriente_max", label: "Corriente max", defaultVal: "50" },
      { id: "rad_eq_tension_max", label: "Tensión max", defaultVal: "50" },
      { id: "rad_eq_tipo_revelado", label: "Tipo revelado", defaultVal: "DIGITAL" },
      { id: "rad_eq_pm_declarado", label: "Número de PM declarado", defaultVal: "-" },
    ];

    const computeGeneralObs = (observedLabels, existingObs = "") => {
      if (observedLabels.length === 0) {
        if (!existingObs || existingObs.startsWith("Se observan los siguientes campos del equipo:")) {
          return "";
        }
        return existingObs;
      }
      const baseText = `Se observan los siguientes campos del equipo: ${observedLabels.join(", ")}.`;
      if (!existingObs || existingObs.startsWith("Se observan los siguientes campos del equipo:")) {
        const match = existingObs.match(/^Se observan los siguientes campos del equipo:[^.]*\.\s*(.*)$/);
        const extra = match && match[1] ? ` ${match[1]}` : "";
        return `${baseText}${extra}`;
      }
      return `${baseText} ${existingObs}`;
    };

    const handleToggleFieldObs = (targetId, targetLabel, currentVal) => {
      const isCurrentlyObs = Boolean(getObs(targetId));
      const willBeObs = !isCurrentlyObs;

      onChange(targetId, {
        value: currentVal !== undefined ? currentVal : getValue(targetId, ""),
        obs: willBeObs ? `Observado: ${targetLabel}` : "",
      });

      const allFields = [
        ...equipoFieldsConfig.map((f) => ({
          label: f.label,
          isObs: f.id === targetId ? willBeObs : Boolean(getObs(f.id)),
        })),
        {
          label: "Número de PM observado",
          isObs:
            "rad_equipo_pm_observado" === targetId
              ? willBeObs
              : Boolean(getObs("rad_equipo_pm_observado")),
        },
      ];

      const observedLabels = allFields.filter((f) => f.isObs).map((f) => f.label);

      onChange(fieldId, {
        value: getValue(fieldId, ""),
        obs: computeGeneralObs(observedLabels, getObs(fieldId)),
      });
    };

    const handlePmObservadoChange = (newVal) => {
      const pmDeclarado = getValue("rad_eq_pm_declarado", "-");
      const hasValue = newVal && newVal.trim() !== "";
      const isDiff = hasValue && pmDeclarado !== "-" && newVal.trim() !== pmDeclarado;
      const willBeObs = isDiff || Boolean(getObs("rad_equipo_pm_observado"));

      onChange("rad_equipo_pm_observado", {
        value: newVal,
        obs: willBeObs ? "El número de PM observado no coincide con el declarado" : "",
      });

      const allFields = [
        ...equipoFieldsConfig.map((f) => ({
          label: f.label,
          isObs: Boolean(getObs(f.id)),
        })),
        {
          label: "Número de PM observado",
          isObs: willBeObs,
        },
      ];

      const observedLabels = allFields.filter((f) => f.isObs).map((f) => f.label);

      onChange(fieldId, {
        value: getValue(fieldId, ""),
        obs: computeGeneralObs(observedLabels, getObs(fieldId)),
      });
    };

    const activeObsCount = [
      ...equipoFieldsConfig.filter((f) => Boolean(getObs(f.id))),
      ...(Boolean(getObs("rad_equipo_pm_observado")) ? [{ label: "PM" }] : []),
    ].length;

    const eppList = [
      {
        id: "mampara_plomada",
        nombre: "Mampara plomada",
        declarada: 8,
        unidades: [
          { unidad: "#1", marca: "marca", antiguedad: "10", cantidad: 5 },
          { unidad: "#2", marca: "marca", antiguedad: "2", cantidad: 3 },
        ],
      },
      {
        id: "chalecos_plomados",
        nombre: "Chalecos plomados (0.5 mm Pb eq)",
        declarada: 3,
        unidades: [
          { unidad: "#1", marca: "marca", antiguedad: "3", cantidad: 2 },
          { unidad: "#2", marca: "marca", antiguedad: "1", cantidad: 1 },
        ],
      },
      {
        id: "protectores_tiroideos",
        nombre: "Protectores tiroideos (0.5 mm Pb eq)",
        declarada: 3,
        unidades: [
          { unidad: "#1", marca: "marca", antiguedad: "2", cantidad: 3 },
        ],
      },
      {
        id: "protectores_gonadales",
        nombre: "Protectores gonadales (0.5 mm Pb eq)",
        declarada: 2,
        unidades: [
          { unidad: "#1", marca: "marca", antiguedad: "4", cantidad: 2 },
        ],
      },
      {
        id: "antiparras_plomadas",
        nombre: "Antiparras / Lentes plomados con protección lateral",
        declarada: 2,
        unidades: [
          { unidad: "#1", marca: "marca", antiguedad: "1", cantidad: 2 },
        ],
      },
      {
        id: "guantes_plomados",
        nombre: "Guantes plomados (0.5 mm Pb eq)",
        declarada: 1,
        unidades: [
          { unidad: "#1", marca: "marca", antiguedad: "2", cantidad: 1 },
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
          {equipoFieldsConfig.map((field) => (
            <CardFieldCheckItem
              key={field.id}
              id={field.id}
              label={field.label}
              value={getValue(field.id, field.defaultVal)}
              isObserved={Boolean(getObs(field.id))}
              onToggleObs={handleToggleFieldObs}
            />
          ))}

          <Box sx={{ py: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.4 }}>
              <Typography
                variant="caption"
                sx={{
                  color: Boolean(getObs("rad_equipo_pm_observado")) ? "#0369a1" : "#64748b",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                Número de PM observado
              </Typography>
              <Tooltip
                title={
                  Boolean(getObs("rad_equipo_pm_observado"))
                    ? "Quitar observación de PM observado"
                    : "Observar PM observado"
                }
              >
                <Box
                  onClick={() =>
                    handleToggleFieldObs(
                      "rad_equipo_pm_observado",
                      "Número de PM observado",
                      pmObservadoVal
                    )
                  }
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.4,
                    cursor: "pointer",
                    px: 0.7,
                    py: 0.2,
                    borderRadius: 1.5,
                    bgcolor: Boolean(getObs("rad_equipo_pm_observado")) ? "#e0f2fe" : "transparent",
                    border: "1px solid",
                    borderColor: Boolean(getObs("rad_equipo_pm_observado")) ? "#7dd3fc" : "#e2e8f0",
                    "&:hover": {
                      bgcolor: Boolean(getObs("rad_equipo_pm_observado")) ? "#bae6fd" : "#f1f5f9",
                      borderColor: Boolean(getObs("rad_equipo_pm_observado")) ? "#38bdf8" : "#cbd5e1",
                    },
                    transition: "all 0.15s ease",
                    userSelect: "none",
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={Boolean(getObs("rad_equipo_pm_observado"))}
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
                      color: Boolean(getObs("rad_equipo_pm_observado")) ? "#0369a1" : "#64748b",
                      letterSpacing: 0.5,
                    }}
                  >
                    OBS
                  </Typography>
                </Box>
              </Tooltip>
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
    const radioDocs = [
      {
        id: "plano-blindaje",
        fieldId: "rad_arq_plano_blindaje",
        name: "Plano estructural con cálculo de blindaje",
        emisor: "Especialista en Radiofísica Médica Matriculado",
        detalle: "Memoria descriptiva, planos con espesor de plomo / baritado y certificación del responsable de instalación.",
        pdf: "plano_blindaje.pdf",
      },
      {
        id: "tasa-retributiva",
        fieldId: "rad_doc_tasa_retributiva",
        name: "Tasa retributiva de servicios",
        emisor: "Dirección de Jurisdicción Farmacia y Radiofísica",
        pdf: "tasa_retributiva.pdf",
      },
      {
        id: "constancia-dosimetria",
        fieldId: "rad_doc_constancia_dosimetria",
        name: "Constancia de prestación de dosimetría",
        emisor: "Empresa de Dosimetría Acreditada",
        pdf: "constancia_dosimetria.pdf",
      },
      {
        id: "residuos-peligrosos",
        fieldId: "rad_doc_residuos_peligrosos",
        name: "Convenio actualizado de residuos peligrosos",
        emisor: "Operador de Residuos Peligrosos",
        pdf: "convenio_residuos.pdf",
      },
      {
        id: "manual-usuario",
        fieldId: "rad_doc_manual_usuario",
        name: "Manual de usuario",
        emisor: "Fabricante / Proveedor del Equipamiento RX",
        pdf: "manual_usuario.pdf",
      },
      {
        id: "documentacion-general",
        fieldId: "rad_doc_documentacion_general",
        name: "Documentación general",
        emisor: "Establecimiento / Titular",
        pdf: "documentacion_general.pdf",
      },
    ];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", py: 2 }}>
                  DOCUMENTO PARTICULAR DE RADIOFÍSICA
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                  VISUALIZAR DOCUMENTO
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 70 }}>
                  OBS.
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {radioDocs.map((doc) => {
                const fieldId = doc.fieldId || `rad_doc_${doc.id}`;
                const obsVal = getObs(fieldId);

                return (
                  <TableRow key={doc.id} hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                    <TableCell sx={{ py: 1.8 }}>
                      <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                        {doc.name}
                      </Typography>
                      {doc.detalle && (
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: "block", mt: 0.3 }}>
                          {doc.detalle}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`Ver ${doc.name}`}>
                        <IconButton
                          size="small"
                          onClick={() => onOpenViewer && onOpenViewer(doc.pdf)}
                          sx={{ color: "#0284c7", bgcolor: "#e0f2fe", "&:hover": { bgcolor: "#bae6fd" } }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={obsVal ? "Ver / Editar observación" : "Agregar observación"}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            onOpenObs &&
                            onOpenObs(fieldId, doc.name, obsVal, "TRAMITE")
                          }
                          sx={{ color: obsVal ? "#0ea5e9" : "#94a3b8" }}
                        >
                          {obsVal ? <ChatBubbleIcon fontSize="small" /> : <ChatBubbleOutlineIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
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

  return null;
};

export default DatosTramiteRadiofisica;
