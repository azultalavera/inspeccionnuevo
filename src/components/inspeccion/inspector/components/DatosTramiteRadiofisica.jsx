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
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";

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
            obs={getObs("rad_est_tipo_dependencia")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_denominacion"
            label="Denominación"
            value={getValue("rad_est_denominacion", "Hola")}
            obs={getObs("rad_est_denominacion")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_propiedad"
            label="Propiedad"
            value={getValue("rad_est_propiedad", "Molina Martin Roberto")}
            obs={getObs("rad_est_propiedad")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_cuit"
            label="CUIT"
            value={getValue("rad_est_cuit", "20-39624236-3")}
            obs={getObs("rad_est_cuit")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_hab_municipal"
            label="Posee habilitación municipal"
            value={getValue("rad_est_hab_municipal", "Sí")}
            obs={getObs("rad_est_hab_municipal")}
            onOpenObs={onOpenObs}
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
            obs={getObs("rad_est_celular")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_telefono"
            label="Teléfono"
            value={getValue("rad_est_telefono", null)}
            obs={getObs("rad_est_telefono")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_correo"
            label="Correo Electrónico"
            value={getValue("rad_est_correo", "aaaa@gmail.com")}
            obs={getObs("rad_est_correo")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_celular_alt"
            label="Celular Alternativo"
            value={getValue("rad_est_celular_alt", null)}
            obs={getObs("rad_est_celular_alt")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_telefono_alt"
            label="Teléfono Alternativo"
            value={getValue("rad_est_telefono_alt", null)}
            obs={getObs("rad_est_telefono_alt")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_correo_alt"
            label="Correo Electrónico Alternativo"
            value={getValue("rad_est_correo_alt", null)}
            obs={getObs("rad_est_correo_alt")}
            onOpenObs={onOpenObs}
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
            obs={getObs("rad_est_calle")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_numero"
            label="Número"
            value={getValue("rad_est_numero", "10")}
            obs={getObs("rad_est_numero")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_barrio"
            label="Barrio"
            value={getValue("rad_est_barrio", "Centro")}
            obs={getObs("rad_est_barrio")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_piso"
            label="Piso"
            value={getValue("rad_est_piso", null)}
            obs={getObs("rad_est_piso")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_depto"
            label="Depto"
            value={getValue("rad_est_depto", null)}
            obs={getObs("rad_est_depto")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_cp"
            label="Código Postal"
            value={getValue("rad_est_cp", "5000")}
            obs={getObs("rad_est_cp")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_provincia"
            label="Provincia"
            value={getValue("rad_est_provincia", "CORDOBA")}
            obs={getObs("rad_est_provincia")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_departamento"
            label="Departamento"
            value={getValue("rad_est_departamento", "CAPITAL")}
            obs={getObs("rad_est_departamento")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_est_localidad"
            label="Localidad"
            value={getValue("rad_est_localidad", "CORDOBA")}
            obs={getObs("rad_est_localidad")}
            onOpenObs={onOpenObs}
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
            obs={getObs("rad_prop_celular")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prop_telefono"
            label="Teléfono"
            value={getValue("rad_prop_telefono", null)}
            obs={getObs("rad_prop_telefono")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prop_correo"
            label="Correo Electrónico"
            value={getValue("rad_prop_correo", "martinmolina1379@gmail.com")}
            obs={getObs("rad_prop_correo")}
            onOpenObs={onOpenObs}
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
            obs={getObs("rad_prop_calle")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prop_numero"
            label="Número"
            value={getValue("rad_prop_numero", "1182")}
            obs={getObs("rad_prop_numero")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prop_barrio"
            label="Barrio"
            value={getValue("rad_prop_barrio", "Nueva Córdoba")}
            obs={getObs("rad_prop_barrio")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prop_piso"
            label="Piso"
            value={getValue("rad_prop_piso", null)}
            obs={getObs("rad_prop_piso")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prop_depto"
            label="Depto"
            value={getValue("rad_prop_depto", null)}
            obs={getObs("rad_prop_depto")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prop_cp"
            label="Código Postal"
            value={getValue("rad_prop_cp", "5016")}
            obs={getObs("rad_prop_cp")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prop_provincia"
            label="Provincia"
            value={getValue("rad_prop_provincia", "CORDOBA")}
            obs={getObs("rad_prop_provincia")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prop_departamento"
            label="Departamento"
            value={getValue("rad_prop_departamento", "CAPITAL")}
            obs={getObs("rad_prop_departamento")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prop_localidad"
            label="Localidad"
            value={getValue("rad_prop_localidad", "CORDOBA")}
            obs={getObs("rad_prop_localidad")}
            onOpenObs={onOpenObs}
          />
        </EstablecimientoCard>
      </Box>
    );
  }

  // ────────────────────────────────────────────────────────────
  // STEP: DIRECTOR TÉCNICO
  // ────────────────────────────────────────────────────────────
  if (category === "DIRECTOR_TECNICO" || category === "DIRECTOR TECNICO") {
    const dtDocFieldId = "rad_est_dt_autorizacion_pdf";
    const dtDocStatus = getValue(dtDocFieldId);
    const dtDocObs = getObs(dtDocFieldId);

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0284c7", fontSize: "1.15rem" }}>
            Director Técnico
          </Typography>
        </Box>

        {/* Sub-tarjeta 1: Datos generales del prestador del servicio */}
        <EstablecimientoCard
          id="rad_dt_datos_prestador"
          title="Datos generales del prestador del servicio"
          icon={<ApartmentIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
          obs={getObs("rad_dt_datos_prestador")}
          onOpenObs={onOpenObs}
        >
          <CardFieldItem
            id="rad_prest_nombre"
            label="Nombre"
            value={getValue("rad_prest_nombre", "Martín S.")}
            obs={getObs("rad_prest_nombre")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prest_apellido"
            label="Apellido"
            value={getValue("rad_prest_apellido", "Benítez")}
            obs={getObs("rad_prest_apellido")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prest_cuil"
            label="CUIL"
            value={getValue("rad_prest_cuil", "20-28450912-3")}
            obs={getObs("rad_prest_cuil")}
            onOpenObs={onOpenObs}
          />
        </EstablecimientoCard>

        {/* Sub-tarjeta 2: Domicilio del prestador del servicio */}
        <EstablecimientoCard
          id="rad_dt_domicilio_prestador"
          title="Domicilio del prestador del servicio"
          icon={<PlaceIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />}
          obs={getObs("rad_dt_domicilio_prestador")}
          onOpenObs={onOpenObs}
        >
          <CardFieldItem
            id="rad_prest_calle"
            label="Calle"
            value={getValue("rad_prest_calle", "Av. Vélez Sarsfield")}
            obs={getObs("rad_prest_calle")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prest_numero"
            label="Número"
            value={getValue("rad_prest_numero", "1450")}
            obs={getObs("rad_prest_numero")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prest_barrio"
            label="Barrio"
            value={getValue("rad_prest_barrio", "Nueva Córdoba")}
            obs={getObs("rad_prest_barrio")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prest_piso"
            label="Piso"
            value={getValue("rad_prest_piso", null)}
            obs={getObs("rad_prest_piso")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prest_depto"
            label="Depto"
            value={getValue("rad_prest_depto", null)}
            obs={getObs("rad_prest_depto")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prest_cp"
            label="Código Postal"
            value={getValue("rad_prest_cp", "X5000JJM")}
            obs={getObs("rad_prest_cp")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prest_provincia"
            label="Provincia"
            value={getValue("rad_prest_provincia", "CORDOBA")}
            obs={getObs("rad_prest_provincia")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prest_departamento"
            label="Departamento"
            value={getValue("rad_prest_departamento", "CAPITAL")}
            obs={getObs("rad_prest_departamento")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_prest_localidad"
            label="Localidad"
            value={getValue("rad_prest_localidad", "CORDOBA")}
            obs={getObs("rad_prest_localidad")}
            onOpenObs={onOpenObs}
          />
        </EstablecimientoCard>

        {/* Sub-tarjeta 3: Director Técnico (Responsable de uso) */}
        <Paper
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}
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
              <PersonIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem", textTransform: "uppercase" }}>
                Director Técnico (Responsable de uso)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* 3.1 Datos personales */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#0369a1",
                  fontSize: "0.82rem",
                  textTransform: "uppercase",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <PersonIcon sx={{ fontSize: 18 }} />
                Datos personales de responsable de uso
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                    NOMBRE Y APELLIDO
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                    Lic. Martín S. Benítez
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                    DNI / CUIL
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.95rem" }}>
                    28.450.912 / 20-28450912-3
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                    CONTACTO
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>
                    mbenitez@radiofisica.org.ar | 351-5551234
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ height: 1, bgcolor: "#f1f5f9" }} />

            {/* 3.2 Datos académicos */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#0369a1",
                  fontSize: "0.82rem",
                  textTransform: "uppercase",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <SchoolIcon sx={{ fontSize: 18 }} />
                Datos académicos de responsable de uso
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                    TÍTULO HABILITANTE
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                    Licenciado en Producción de Bioimágenes
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                    MATRÍCULA PROFESIONAL
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.95rem" }}>
                    MP-84920
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                    ESPECIALIDAD / CAPACITACIÓN
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>
                    Radiofísica y Protección Radiológica
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ height: 1, bgcolor: "#f1f5f9" }} />

            {/* 3.3 Autorización Individual (PDF) */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, bgcolor: "#f8fafc", p: 2, borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <DescriptionIcon sx={{ color: "#0284c7", fontSize: 26 }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.9rem" }}>
                    Autorización Individual (PDF)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Permiso individual emitido por la Autoridad Regulatoria Nuclear (ARN) para el uso de equipos generadores.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Tooltip title="Visualizar Autorización Individual (PDF)">
                  <IconButton
                    size="small"
                    onClick={() => onOpenViewer && onOpenViewer("autorizacion_individual_arn.pdf")}
                    sx={{ color: "#0284c7", bgcolor: "#e0f2fe", "&:hover": { bgcolor: "#bae6fd" } }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <ToggleButtonGroup
                  value={dtDocStatus}
                  exclusive
                  onChange={(e, val) => val !== null && handleToggle(dtDocFieldId, val)}
                  size="small"
                  sx={{ height: 34 }}
                >
                  <ToggleButton
                    value="conforme"
                    sx={{
                      px: 1.5,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      "&.Mui-selected": { bgcolor: "#dcfce7", color: "#166534" },
                    }}
                  >
                    Conforme
                  </ToggleButton>
                  <ToggleButton
                    value="observado"
                    sx={{
                      px: 1.5,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      "&.Mui-selected": { bgcolor: "#fee2e2", color: "#991b1b" },
                    }}
                  >
                    Observado
                  </ToggleButton>
                </ToggleButtonGroup>
                <Tooltip title={dtDocObs ? "Ver / Editar observación" : "Agregar observación"}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      onOpenObs &&
                      onOpenObs(
                        dtDocFieldId,
                        "Autorización Individual (PDF) - Responsable de uso",
                        dtDocObs,
                        "TRAMITE"
                      )
                    }
                    sx={{ color: dtDocObs ? "#0ea5e9" : "#94a3b8" }}
                  >
                    {dtDocObs ? <ChatBubbleIcon fontSize="small" /> : <ChatBubbleOutlineIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Paper>
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
          onOpenObs={onOpenObs}
        >
          <CardFieldItem
            id="rad_eq_marca"
            label="Marca"
            value={getValue("rad_eq_marca", "marca")}
            obs={getObs("rad_eq_marca")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_eq_modelo"
            label="Modelo"
            value={getValue("rad_eq_modelo", "modelo")}
            obs={getObs("rad_eq_modelo")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_eq_serie"
            label="Serie"
            value={getValue("rad_eq_serie", "12345")}
            obs={getObs("rad_eq_serie")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_eq_condicion"
            label="Condición"
            value={getValue("rad_eq_condicion", "Propio")}
            obs={getObs("rad_eq_condicion")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_eq_ano_fab"
            label="Año fabricación"
            value={getValue("rad_eq_ano_fab", "2000")}
            obs={getObs("rad_eq_ano_fab")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_eq_tipo"
            label="Tipo de equipo"
            value={getValue("rad_eq_tipo", "Fijo")}
            obs={getObs("rad_eq_tipo")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_eq_corriente_max"
            label="Corriente max"
            value={getValue("rad_eq_corriente_max", "50")}
            obs={getObs("rad_eq_corriente_max")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_eq_tension_max"
            label="Tensión max"
            value={getValue("rad_eq_tension_max", "50")}
            obs={getObs("rad_eq_tension_max")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_eq_tipo_revelado"
            label="Tipo revelado"
            value={getValue("rad_eq_tipo_revelado", "DIGITAL")}
            obs={getObs("rad_eq_tipo_revelado")}
            onOpenObs={onOpenObs}
          />
          <CardFieldItem
            id="rad_eq_pm_declarado"
            label="Número de PM declarado"
            value={getValue("rad_eq_pm_declarado", "-")}
            obs={getObs("rad_eq_pm_declarado")}
            onOpenObs={onOpenObs}
          />
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
                Número de PM observado
              </Typography>
              {onOpenObs && (
                <Tooltip
                  title={
                    getObs("rad_equipo_pm_observado")
                      ? `Observación: ${getObs("rad_equipo_pm_observado")}`
                      : "Observar Número de PM observado"
                  }
                >
                  <IconButton
                    size="small"
                    onClick={() =>
                      onOpenObs(
                        "rad_equipo_pm_observado",
                        "Número de PM observado",
                        getObs("rad_equipo_pm_observado"),
                        "TRAMITE"
                      )
                    }
                    sx={{
                      p: 0.2,
                      color: getObs("rad_equipo_pm_observado") ? "#0ea5e9" : "#94a3b8",
                      opacity: getObs("rad_equipo_pm_observado") ? 1 : 0.35,
                      "&:hover": { opacity: 1, color: "#0ea5e9" },
                    }}
                  >
                    {getObs("rad_equipo_pm_observado") ? (
                      <ChatBubbleIcon sx={{ fontSize: 15 }} />
                    ) : (
                      <ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <TextField
              size="small"
              fullWidth
              variant="standard"
              placeholder="No declarado"
              value={pmObservadoVal}
              onChange={(e) => {
                const newVal = e.target.value;
                const hasValue = newVal && newVal.trim() !== "";
                const autoObs = hasValue ? "El número de PM no es igual al declarado" : "";
                onChange("rad_equipo_pm_observado", {
                  value: newVal,
                  obs: autoObs,
                });
                onChange("rad_equipo_rx", {
                  value: getValue("rad_equipo_rx", ""),
                  obs: autoObs,
                });
              }}
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                mt: 0.2,
                "& .MuiInputBase-root": {
                  borderRadius: 1,
                  "&:hover": { bgcolor: "#f8fafc" },
                  px: 0.5,
                  mx: -0.5,
                },
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
