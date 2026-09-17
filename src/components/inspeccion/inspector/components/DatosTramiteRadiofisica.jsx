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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import DescriptionIcon from "@mui/icons-material/Description";
import DomainIcon from "@mui/icons-material/Domain";
import ApartmentIcon from "@mui/icons-material/Apartment";

const DatosTramiteRadiofisica = ({
  category,
  subservicio,
  tipoServicio,
  inspectorData,
  onChange,
  onOpenObs,
  onOpenViewer,
}) => {
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
  // 1. STEP: ARQUITECTURA
  // ────────────────────────────────────────────────────────────
  if (category === "ARQUITECTURA") {
    const fieldId = "rad_arq_plano_blindaje";
    const statusVal = getValue(fieldId);
    const obsVal = getObs(fieldId);

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}>
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="medium" />}
          sx={{
            borderRadius: 3,
            bgcolor: "#f0f9ff",
            border: "1px solid #bae6fd",
            color: "#0369a1",
            "& .MuiAlert-icon": { color: "#0284c7" },
          }}
        >
          <AlertTitle sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
            Observación de Arquitectura
          </AlertTitle>
          Sólo si se observa este documento. Los otros documentos de arquitectura van para la inspección del trámite de habilitación.
        </Alert>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", py: 2 }}>
                  DOCUMENTO ARQUITECTÓNICO DE RADIOFÍSICA
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                  DOCUMENTO
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 140 }}>
                  ESTADO
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 70 }}>
                  OBS.
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                <TableCell sx={{ py: 2 }}>
                  <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.9rem" }}>
                    Plano estructural con cálculo de blindaje
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Memoria descriptiva, planos con espesor de plomo / baritado y certificación del responsable de instalación.
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Visualizar Plano Estructural con Cálculo de Blindaje">
                    <IconButton
                      size="small"
                      onClick={() => onOpenViewer && onOpenViewer("plano_blindaje.pdf")}
                      sx={{
                        color: "#0284c7",
                        bgcolor: "#e0f2fe",
                        "&:hover": { bgcolor: "#bae6fd" },
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <ToggleButtonGroup
                    value={statusVal}
                    exclusive
                    onChange={(e, val) => val !== null && handleToggle(fieldId, val)}
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
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={obsVal ? "Ver / Editar observación" : "Agregar observación"}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        onOpenObs &&
                        onOpenObs(
                          fieldId,
                          "Plano estructural con cálculo de blindaje",
                          obsVal,
                          "TRAMITE"
                        )
                      }
                      sx={{ color: obsVal ? "#0ea5e9" : "#94a3b8" }}
                    >
                      {obsVal ? <ChatBubbleIcon fontSize="small" /> : <ChatBubbleOutlineIcon fontSize="small" />}
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

  // ────────────────────────────────────────────────────────────
  // 2. STEP: ESTABLECIMIENTO
  // ────────────────────────────────────────────────────────────
  if (category === "ESTABLECIMIENTO") {
    const dtDocFieldId = "rad_est_dt_autorizacion_pdf";
    const dtDocStatus = getValue(dtDocFieldId);
    const dtDocObs = getObs(dtDocFieldId);

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        {/* Sub-tarjeta 1: Datos generales del prestador del servicio */}
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
              <ApartmentIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem", textTransform: "uppercase" }}>
                Datos generales del prestador del servicio
              </Typography>
            </Box>
            <Tooltip title="Observar datos generales del prestador">
              <IconButton
                size="small"
                onClick={() =>
                  onOpenObs &&
                  onOpenObs(
                    "rad_est_datos_generales",
                    "Datos generales del prestador del servicio",
                    getObs("rad_est_datos_generales"),
                    "TRAMITE"
                  )
                }
                sx={{ color: getObs("rad_est_datos_generales") ? "#0ea5e9" : "#94a3b8" }}
              >
                {getObs("rad_est_datos_generales") ? <ChatBubbleIcon fontSize="small" /> : <ChatBubbleOutlineIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ p: 2.5, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                NOMBRE DEL ESTABLECIMIENTO
              </Typography>
              <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                HABILITACION - RADIOFÍSICA
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                RAZÓN SOCIAL
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.95rem" }}>
                Centro de Radiofísica Médica S.A.
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                CUIT DEL PRESTADOR
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.95rem" }}>
                30-71829340-5
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                EMAIL INSTITUCIONAL
              </Typography>
              <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>
                radiofisica.salud@cordoba.gob.ar
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                TELÉFONO DE CONTACTO
              </Typography>
              <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>
                (0351) 428-9000
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                TIPO DE TRÁMITE
              </Typography>
              <Box sx={{ mt: 0.3 }}>
                <Chip size="small" label="HABILITACIÓN" sx={{ bgcolor: "#e0f2fe", color: "#0369a1", fontWeight: 800 }} />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Sub-tarjeta 2: Domicilio del prestador del servicio */}
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
              <PlaceIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem", textTransform: "uppercase" }}>
                Domicilio del prestador del servicio
              </Typography>
            </Box>
            <Tooltip title="Observar domicilio del prestador">
              <IconButton
                size="small"
                onClick={() =>
                  onOpenObs &&
                  onOpenObs(
                    "rad_est_domicilio",
                    "Domicilio del prestador del servicio",
                    getObs("rad_est_domicilio"),
                    "TRAMITE"
                  )
                }
                sx={{ color: getObs("rad_est_domicilio") ? "#0ea5e9" : "#94a3b8" }}
              >
                {getObs("rad_est_domicilio") ? <ChatBubbleIcon fontSize="small" /> : <ChatBubbleOutlineIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ p: 2.5, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                DIRECCIÓN / CALLE Y NÚMERO
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                Av. Vélez Sarsfield 1450
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                LOCALIDAD
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.95rem" }}>
                Córdoba
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                DEPARTAMENTO
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.95rem" }}>
                Capital
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                CÓDIGO POSTAL
              </Typography>
              <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>
                X5000JJM
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                GEOREFERENCIACIÓN
              </Typography>
              <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>
                -31.4287, -64.1921
              </Typography>
            </Box>
          </Box>
        </Paper>

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
  // 3. STEP: SERVICIOS
  // ────────────────────────────────────────────────────────────
  if (category === "SERVICIOS") {
    const srvFieldId = "rad_srv_horarios";
    const srvStatus = getValue(srvFieldId);
    const srvObs = getObs(srvFieldId);

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}>
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
              <AccessTimeIcon sx={{ color: "#0ea5e9", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem", textTransform: "uppercase" }}>
                Horarios del servicio seleccionado
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ToggleButtonGroup
                value={srvStatus}
                exclusive
                onChange={(e, val) => val !== null && handleToggle(srvFieldId, val)}
                size="small"
                sx={{ height: 32 }}
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
              <Tooltip title={srvObs ? "Ver / Editar observación" : "Agregar observación"}>
                <IconButton
                  size="small"
                  onClick={() =>
                    onOpenObs &&
                    onOpenObs(
                      srvFieldId,
                      "Horarios del servicio seleccionado",
                      srvObs,
                      "TRAMITE"
                    )
                  }
                  sx={{ color: srvObs ? "#0ea5e9" : "#94a3b8" }}
                >
                  {srvObs ? <ChatBubbleIcon fontSize="small" /> : <ChatBubbleOutlineIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={`SERVICIO: ${tipoServicio || "Rayos X"} — ${subservicio || "Radiología Convencional Simple"}`}
                sx={{ fontWeight: 800, fontSize: "12px", bgcolor: "#e0f2fe", color: "#0369a1", mb: 2 }}
              />
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #f1f5f9", borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.8rem" }}>DÍA / PERÍODO</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.8rem" }}>HORARIO OPERATIVO</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.8rem" }}>MODALIDAD DE ATENCIÓN</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: "0.8rem" }}>COBERTURA RESPONSABLE DE USO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Lunes a Viernes</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0284c7" }}>08:00 a 20:00 hs</TableCell>
                    <TableCell sx={{ color: "#475569" }}>Programada y Demanda Espontánea</TableCell>
                    <TableCell sx={{ color: "#166534", fontWeight: 700 }}>Presente / Supervisión continua</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Sábados</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0284c7" }}>08:00 a 13:00 hs</TableCell>
                    <TableCell sx={{ color: "#475569" }}>Atención ambulatoria programada</TableCell>
                    <TableCell sx={{ color: "#166534", fontWeight: 700 }}>Presente</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Domingos y Feriados</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Guardia Pasiva</TableCell>
                    <TableCell sx={{ color: "#475569" }}>Urgencias radiológicas</TableCell>
                    <TableCell sx={{ color: "#64748b" }}>Guardia pasiva de retén</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </Box>
    );
  }

  // ────────────────────────────────────────────────────────────
  // 4. STEP: PERSONAL
  // ────────────────────────────────────────────────────────────
  if (category === "PERSONAL" || category === "RECURSOS HUMANOS") {
    const staffList = [
      {
        id: "staff-1",
        nombre: "Lic. Martín S. Benítez",
        funcion: "Responsable de Uso / Licenciado en Bioimágenes",
        dni: "28.450.912",
        cuil: "20-28450912-3",
        matricula: "MP-84920",
        pdfName: "matricula_benitez.pdf",
      },
      {
        id: "staff-2",
        nombre: "Tec. Andrea Romero",
        funcion: "Técnica Radióloga Operadora de Equipo",
        dni: "34.120.450",
        cuil: "27-34120450-4",
        matricula: "MP-12480",
        pdfName: "matricula_romero.pdf",
      },
      {
        id: "staff-3",
        nombre: "Dr. Gustavo F. Morales",
        funcion: "Médico Especialista en Radiodiagnóstico",
        dni: "22.981.340",
        cuil: "20-22981340-8",
        matricula: "ME-7412",
        pdfName: "matricula_morales.pdf",
      },
    ];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}>
        <Alert
          severity="warning"
          icon={<InfoOutlinedIcon fontSize="medium" />}
          sx={{
            borderRadius: 3,
            bgcolor: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            "& .MuiAlert-icon": { color: "#b45309" },
          }}
        >
          <AlertTitle sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
            Verificación de Personal Declarado
          </AlertTitle>
          Carga nominal de RRHH (Datos personales) y constancia de matrícula activa del RRHH (PDF).
          <Typography variant="caption" sx={{ display: "block", mt: 0.5, fontWeight: 700, color: "#b45309" }}>
            * Consultar si lo muestra caso de ser observado o siempre.
          </Typography>
        </Alert>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", py: 2 }}>
                  CARGA NOMINAL DE RRHH (DATOS PERSONALES)
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                  FUNCIÓN / ROL
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                  DNI / MATRÍCULA
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                  CONSTANCIA DE MATRÍCULA ACTIVA (PDF)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 140 }}>
                  ESTADO
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 70 }}>
                  OBS.
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffList.map((person) => {
                const fieldId = `rad_personal_${person.id}`;
                const statusVal = getValue(fieldId);
                const obsVal = getObs(fieldId);

                return (
                  <TableRow key={person.id} hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                    <TableCell sx={{ py: 1.8 }}>
                      <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                        {person.nombre}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        CUIL: {person.cuil}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "#334155", fontWeight: 600, fontSize: "0.85rem" }}>
                      {person.funcion}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.85rem" }}>
                        DNI: {person.dni}
                      </Typography>
                      <Chip
                        label={person.matricula}
                        size="small"
                        sx={{ height: 20, fontSize: "11px", fontWeight: 800, bgcolor: "#f1f5f9", color: "#334155" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`Ver Constancia de Matrícula de ${person.nombre}`}>
                        <IconButton
                          size="small"
                          onClick={() => onOpenViewer && onOpenViewer(person.pdfName)}
                          sx={{ color: "#0284c7", bgcolor: "#e0f2fe", "&:hover": { bgcolor: "#bae6fd" } }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <ToggleButtonGroup
                        value={statusVal}
                        exclusive
                        onChange={(e, val) => val !== null && handleToggle(fieldId, val)}
                        size="small"
                        sx={{ height: 32 }}
                      >
                        <ToggleButton
                          value="conforme"
                          sx={{
                            px: 1.2,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            "&.Mui-selected": { bgcolor: "#dcfce7", color: "#166534" },
                          }}
                        >
                          Conforme
                        </ToggleButton>
                        <ToggleButton
                          value="observado"
                          sx={{
                            px: 1.2,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            "&.Mui-selected": { bgcolor: "#fee2e2", color: "#991b1b" },
                          }}
                        >
                          Observado
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={obsVal ? "Ver / Editar observación" : "Agregar observación"}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            onOpenObs &&
                            onOpenObs(fieldId, `Personal: ${person.nombre}`, obsVal, "TRAMITE")
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

  // ────────────────────────────────────────────────────────────
  // 5. STEP: EQUIPAMIENTO
  // ────────────────────────────────────────────────────────────
  if (category === "EQUIPAMIENTO") {
    const eppItems = [
      { id: "chalecos", name: "Chalecos plomados (espesor mínimo 0.5 mm Pb eq)", cantidad: "3 unidades", estado: "Con soporte/percha adecuada" },
      { id: "tiroideos", name: "Protectores tiroideos (0.5 mm Pb eq)", cantidad: "3 unidades", estado: "Integridad física verificada" },
      { id: "gonadales", name: "Protectores gonadales (0.5 mm Pb eq)", cantidad: "2 unidades", estado: "Integridad física verificada" },
      { id: "antiparras", name: "Antiparras / Lentes plomados con protección lateral", cantidad: "2 pares", estado: "Cristales sin fisuras" },
      { id: "guantes", name: "Guantes plomados (0.5 mm Pb eq)", cantidad: "1 par", estado: "Óptimo estado" },
      { id: "biombo", name: "Biombo móvil plomado con visor de vidrio plumbífero", cantidad: "1 unidad", estado: "Espesor equivalente conforme" },
    ];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}>
        {/* Banner destacado: APARTADO EN ANÁLISIS */}
        <Alert
          severity="warning"
          icon={<SecurityIcon fontSize="medium" />}
          sx={{
            borderRadius: 3,
            bgcolor: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            "& .MuiAlert-icon": { color: "#d97706" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Chip
              label="APARTADO EN ANÁLISIS"
              size="small"
              sx={{
                fontWeight: 900,
                fontSize: "11px",
                bgcolor: "#f59e0b",
                color: "white",
                letterSpacing: "0.03em",
              }}
            />
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#92400e" }}>
              Elementos de protección personal
            </Typography>
          </Box>
          Verificación de disponibilidad, estado de conservación y cantidad de elementos de protección radiológica personal reglamentarios.
        </Alert>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", py: 2 }}>
                  ELEMENTO DE PROTECCIÓN PERSONAL (EPP)
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                  CANTIDAD DECLARADA
                </TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                  REQUISITO / DISPONIBILIDAD
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 140 }}>
                  ESTADO
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 70 }}>
                  OBS.
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eppItems.map((item) => {
                const fieldId = `rad_epp_${item.id}`;
                const statusVal = getValue(fieldId);
                const obsVal = getObs(fieldId);

                return (
                  <TableRow key={item.id} hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                    <TableCell sx={{ py: 1.8 }}>
                      <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0369a1", fontSize: "0.85rem" }}>
                      {item.cantidad}
                    </TableCell>
                    <TableCell sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.82rem" }}>
                      {item.estado}
                    </TableCell>
                    <TableCell align="center">
                      <ToggleButtonGroup
                        value={statusVal}
                        exclusive
                        onChange={(e, val) => val !== null && handleToggle(fieldId, val)}
                        size="small"
                        sx={{ height: 32 }}
                      >
                        <ToggleButton
                          value="conforme"
                          sx={{
                            px: 1.2,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            "&.Mui-selected": { bgcolor: "#dcfce7", color: "#166534" },
                          }}
                        >
                          Conforme
                        </ToggleButton>
                        <ToggleButton
                          value="observado"
                          sx={{
                            px: 1.2,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            "&.Mui-selected": { bgcolor: "#fee2e2", color: "#991b1b" },
                          }}
                        >
                          Observado
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={obsVal ? "Ver / Editar observación" : "Agregar observación"}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            onOpenObs &&
                            onOpenObs(fieldId, `EPP: ${item.name}`, obsVal, "TRAMITE")
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

  // ────────────────────────────────────────────────────────────
  // 6. STEP: DOCUMENTOS ADJUNTOS
  // ────────────────────────────────────────────────────────────
  if (category === "DOCUMENTACION") {
    const radioDocs = [
      {
        id: "doc-arn-licencia",
        name: "Autorización de Instalación / Licencia de Operación ARN",
        emisor: "Autoridad Regulatoria Nuclear (ARN)",
        pdf: "licencia_operacion_arn.pdf",
      },
      {
        id: "doc-memoria-blindaje",
        name: "Memoria Técnica y Memoria de Cálculo de Blindajes Estructurales",
        emisor: "Especialista en Radiofísica Médica Matriculado",
        pdf: "memoria_blindajes.pdf",
      },
      {
        id: "doc-control-calidad",
        name: "Protocolo de Pruebas de Aceptación y Control de Calidad del Equipo RX",
        emisor: "Físico Médico / Servicio Técnico Certificado",
        pdf: "control_calidad_rx.pdf",
      },
      {
        id: "doc-calibracion-detectores",
        name: "Certificados de Calibración Vigente de Detectores y Dosímetros de Área",
        emisor: "Laboratorio Nacional de Metrología de Radiaciones",
        pdf: "calibracion_detectores.pdf",
      },
      {
        id: "doc-dosimetria-personal",
        name: "Constancia de Contratación de Servicio de Dosimetría Personal Activa",
        emisor: "Empresa de Dosimetría Acreditada",
        pdf: "contrato_dosimetria.pdf",
      },
      {
        id: "doc-plan-emergencia",
        name: "Plan de Emergencia y Contingencia Radiológica",
        emisor: "Responsable de Uso y Protección Radiológica",
        pdf: "plan_emergencia_radiologica.pdf",
      },
    ];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}>
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="medium" />}
          sx={{
            borderRadius: 3,
            bgcolor: "#f0f9ff",
            border: "1px solid #bae6fd",
            color: "#0369a1",
            "& .MuiAlert-icon": { color: "#0284c7" },
          }}
        >
          <AlertTitle sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
            Observación de Documentos Adjuntos
          </AlertTitle>
          Sólo si se observan los documentos particulares de radiofísica.
        </Alert>

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
                <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                  ORGANISMO / EMISOR
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>
                  VISUALIZAR DOCUMENTO
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 140 }}>
                  ESTADO
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", width: 70 }}>
                  OBS.
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {radioDocs.map((doc) => {
                const fieldId = `rad_doc_${doc.id}`;
                const statusVal = getValue(fieldId);
                const obsVal = getObs(fieldId);

                return (
                  <TableRow key={doc.id} hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                    <TableCell sx={{ py: 1.8 }}>
                      <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                        {doc.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.82rem" }}>
                      {doc.emisor}
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
                      <ToggleButtonGroup
                        value={statusVal}
                        exclusive
                        onChange={(e, val) => val !== null && handleToggle(fieldId, val)}
                        size="small"
                        sx={{ height: 32 }}
                      >
                        <ToggleButton
                          value="conforme"
                          sx={{
                            px: 1.2,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            "&.Mui-selected": { bgcolor: "#dcfce7", color: "#166534" },
                          }}
                        >
                          Conforme
                        </ToggleButton>
                        <ToggleButton
                          value="observado"
                          sx={{
                            px: 1.2,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            "&.Mui-selected": { bgcolor: "#fee2e2", color: "#991b1b" },
                          }}
                        >
                          Observado
                        </ToggleButton>
                      </ToggleButtonGroup>
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
