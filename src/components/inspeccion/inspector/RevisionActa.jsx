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
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Collapse,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  PriorityHigh as PriorityHighIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ReportProblem as ReportProblemIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Warning as WarningIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import ReporteInspeccionPDF from "../../../ReporteInspeccion.pdf";

const RevisionActa = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados de validación por ítem: "PENDIENTE" | "VALIDADO" | "RECHAZADO"
  const [statuses, setStatuses] = useState({
    "RF-DOS-01": "VALIDADO",
    "RF-MAT-01": "PENDIENTE",
    "RF-RESP-01": "PENDIENTE",
    "RF-EQ-01": "PENDIENTE",
  });

  // Comentarios de rechazo cargados por el inspector
  const [comentarios, setComentarios] = useState({});
  const [commentDialog, setCommentDialog] = useState({ open: false, id: null, text: "" });

  // Modal para ver respuesta y evidencia del efector
  const [viewResponseDialog, setViewResponseDialog] = useState({
    open: false,
    item: null,
  });

  // Modal para ver PDF
  const [openPdfViewer, setOpenPdfViewer] = useState(false);

  // Modal de Emplazamiento
  const [emplazarDialog, setEmplazarDialog] = useState(false);
  const [diasEmplazamiento, setDiasEmplazamiento] = useState("5 días");
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState("días");

  // Modal de confirmación final
  const [confirmFinalizarOpen, setConfirmFinalizarOpen] = useState(false);

  // Control de filas desplegables (arrancan todas cerradas)
  const [expandedRows, setExpandedRows] = useState({});

  const handleToggleExpand = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const RESPUESTAS_EFECTOR_TEXTO = {
    "RF-DOS-01": "Se contrató a la empresa de dosimetría habilitada y se adjunta el comprobante de servicio vigente.",
    "RF-MAT-01": "Se realizó el refuerzo del búnker con plomo de 2 mm; se adjunta informe técnico del arquitecto.",
    "RF-RESP-01": "Se adjunta el documento de autorización individual corregido y firmado por el responsable.",
    "RF-EQ-01": "Se corrigieron los datos del equipo y se agrega la unidad con los datos correctos.",
  };

  // 1. DATOS GENERALES (Exacto según las observaciones tratadas)
  const obsGenerales = [
    {
      id: "RF-DOS-01",
      origen: "DOSIMETRÍA",
      categoria: "Empresa",
      obs: "Empresa",
      respuestaEfector:
        "Se adjunta contrato de prestación de servicio dosimétrico vigente celebrado con la empresa TECNODOSIS S.R.L., acreditada y habilitada ante la Autoridad Regulatoria Nuclear (ARN). Se regulariza la constancia de cobertura para todo el personal operativo.",
      archivoAdjunto: "Contrato_Servicio_Dosimetria_Vigente.pdf",
      fechaRespuesta: "02/10/2026",
    },
    {
      id: "RF-MAT-01",
      origen: "MATERIALIDAD DE LA SALA",
      categoria: "Búnker",
      obs: "Búnker NO CUMPLE",
      respuestaEfector:
        "Se remite memoria de cálculo de blindaje y planos de adecuación del búnker con atenuación equivalente certificada de 2.0 mm Pb en tabique sur y carpinterías plomadas, visado por especialista en física médica matriculado.",
      archivoAdjunto: "Memoria_Calculo_Blindaje_Bunker.pdf",
      fechaRespuesta: "02/10/2026",
    },
  ];

  // 2. DATOS DEL TRÁMITE (Exacto según las observaciones tratadas)
  const obsTramite = [
    {
      id: "RF-RESP-01",
      origen: "RESPONSABLE DE USO",
      categoria: "Documento de autorización individual",
      obs: "documento de autorizacion individual no es correcto",
      respuestaEfector:
        "Se adjunta carnet y constancia digital vigente de Autorización Individual para Diagnóstico Médico con Rayos X emitida por la ARN a nombre del Responsable de Uso Lic. Martín S. Benítez (Resolución ARN N° PI-84920/26, vigencia 2026-2030).",
      archivoAdjunto: "Autorizacion_Individual_ARN_Vigente.pdf",
      fechaRespuesta: "02/10/2026",
    },
    {
      id: "RF-EQ-01",
      origen: "EQUIPAMIENTO",
      categoria: "Equipamiento",
      obs: "no corresponden los siguientes campos Marca: SIEMENS, Condición: Propio, Año fabricación: 2000, Tipo revelado: DIGITAL",
      respuestaEfector:
        "Se rectifican los datos técnicos del equipo generador de rayos X conforme a la placa del fabricante: Marca: SIEMENS, Condición: Propio, Año fabricación: 2022, Tipo revelado: DIGITAL directo (DR). Se adjunta manual, certificado técnico de calibración y factura.",
      archivoAdjunto: "Certificado_Equipo_Siemens.pdf",
      fechaRespuesta: "02/10/2026",
      camposRectificados: [
        { campo: "Marca", declarado: "SIEMENS", observado: "SIEMENS", rectificado: "PHILIPS", estado: "RECTIFICADO" },
        { campo: "Condición", declarado: "Propio", observado: "Propio", rectificado: "Tercerizado", estado: "RECTIFICADO" },
        { campo: "Año fabricación", declarado: "2000", observado: "2000", rectificado: "2015", estado: "RECTIFICADO" },
        { campo: "Tipo revelado", declarado: "DIGITAL", observado: "DIGITAL", rectificado: "DIGITAL", estado: "CORRECTO" },
      ],
    },
  ];

  const handleUpdateStatus = (itemId, newStatus) => {
    setStatuses((prev) => ({
      ...prev,
      [itemId]: prev[itemId] === newStatus ? "PENDIENTE" : newStatus,
    }));
  };

  const handleOpenRejectDialog = (item) => {
    setCommentDialog({
      open: true,
      id: item.id,
      text: comentarios[item.id] || "",
    });
  };

  const handleSaveRejection = () => {
    if (commentDialog.id) {
      setComentarios((prev) => ({ ...prev, [commentDialog.id]: commentDialog.text }));
      setStatuses((prev) => ({ ...prev, [commentDialog.id]: "RECHAZADO" }));
    }
    setCommentDialog({ open: false, id: null, text: "" });
  };

  // Cálculos de avance
  const countValidadosGen = obsGenerales.filter((i) => statuses[i.id] === "VALIDADO").length;
  const pctValidadosGen = Math.round((countValidadosGen / obsGenerales.length) * 100);

  const countValidadosTra = obsTramite.filter((i) => statuses[i.id] === "VALIDADO").length;
  const pctValidadosTra = Math.round((countValidadosTra / obsTramite.length) * 100);

  const allItems = [...obsGenerales, ...obsTramite];
  const totalItems = allItems.length;
  const totalValidados = allItems.filter((i) => statuses[i.id] === "VALIDADO").length;
  const totalRechazados = allItems.filter((i) => statuses[i.id] === "RECHAZADO").length;
  const isAllValidado = totalValidados === totalItems;
  const hasRechazado = totalRechazados > 0;

  // Cálculo de vencimiento para el modal de emplazamiento
  const getFechaVencimiento = (plazoStr) => {
    if (!plazoStr) return null;
    const parts = plazoStr.trim().split(" ");
    if (parts.length < 2) return null;
    const amount = parseInt(parts[0], 10);
    const unit = parts[1].toLowerCase();
    if (isNaN(amount)) return null;

    const fecha = new Date();
    if (unit.startsWith("hora")) {
      fecha.setHours(fecha.getHours() + amount);
    } else if (unit.startsWith("día") || unit.startsWith("dia")) {
      fecha.setDate(fecha.getDate() + amount);
    } else if (unit.startsWith("semana")) {
      fecha.setDate(fecha.getDate() + amount * 7);
    } else {
      return null;
    }
    return fecha;
  };

  const vencimiento = getFechaVencimiento(diasEmplazamiento);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh", maxWidth: 1200, mx: "auto" }}>
      {/* BOTÓN VOLVER Y ENCABEZADO */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/inspector/inspecciones")}
          sx={{
            color: "#005596",
            fontWeight: 800,
            fontSize: "0.85rem",
            textTransform: "none",
            p: 0,
            mb: 1.5,
            "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
          }}
        >
          Volver a Inspecciones
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#002B49", fontSize: { xs: "1.6rem", md: "2rem" }, letterSpacing: -0.5 }}>
              Revisión de Respuestas a Emplazamientos
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600, mt: 0.5 }}>
              Trámite {id || "TRM-RAD-002"}: <b>Centro Radiológico San Francisco - Radiofísica</b> • Acta Nº <b>105/2026</b>
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={`${totalValidados}/${totalItems} VALIDADOS`}
              sx={{
                bgcolor: isAllValidado ? "#16a34a" : "#0284c7",
                color: "white",
                fontWeight: 900,
                fontSize: "0.78rem",
                height: 28,
              }}
            />
            {totalRechazados > 0 && (
              <Chip
                label={`${totalRechazados} RECHAZADOS`}
                sx={{
                  bgcolor: "#ef4444",
                  color: "white",
                  fontWeight: 900,
                  fontSize: "0.78rem",
                  height: 28,
                }}
              />
            )}
          </Stack>
        </Box>
      </Box>

      {/* ALERTA INFORMATIVA: RESPUESTAS RECIBIDAS */}
      <Alert
        severity="info"
        icon={<AssignmentTurnedInIcon sx={{ color: "#0284c7" }} />}
        sx={{
          mb: 4,
          borderRadius: 2.5,
          bgcolor: "#f0f9ff",
          border: "1px solid #bae6fd",
          color: "#0369a1",
          fontWeight: 600,
          fontSize: "0.85rem",
        }}
      >
        El efector ha remitido sus respuestas y descargos técnicos correspondientes al emplazamiento del Acta 105/2026. Revise cada observación, inspeccione la documentación adjunta mediante el botón <b>(👁)</b> y valide <b>(✔)</b> o rechace <b>(!)</b> cada punto.
      </Alert>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: OBSERVACIONES DATOS GENERALES (Estilo exacto de la imagen) */}
      {/* ========================================================================= */}
      <Box sx={{ mb: 5 }}>
        {/* TÍTULO CON BARRA LATERAL AZUL */}
        <Box sx={{ borderLeft: "5px solid #0080c8", pl: 1.5, py: 0.2, mb: 1.5 }}>
          <Typography sx={{ fontWeight: 900, color: "#002B49", fontSize: "1.25rem", letterSpacing: 0.2, textTransform: "uppercase" }}>
            OBSERVACIONES DATOS GENERALES
          </Typography>
        </Box>

        {/* PILL SUB-BADGE: [ % ] OBSERVACIONES GENERALES */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "16px",
            px: 1.5,
            py: 0.4,
            mb: 2,
          }}
        >
          <Chip
            label={`${pctValidadosGen}%`}
            size="small"
            sx={{
              bgcolor: pctValidadosGen === 100 ? "#16a34a" : "#e0f2fe",
              color: pctValidadosGen === 100 ? "#ffffff" : "#0284c7",
              fontWeight: 900,
              fontSize: "0.72rem",
              height: 20,
              borderRadius: "10px",
            }}
          />
          <Typography sx={{ fontWeight: 800, color: "#0369a1", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
            OBSERVACIONES GENERALES
          </Typography>
        </Box>

        {/* TABLA DATOS GENERALES */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 850, fontSize: "0.74rem", color: "#64748b", py: 1.5, width: "22%" }}>
                    ORIGEN
                  </TableCell>
                  <TableCell sx={{ fontWeight: 850, fontSize: "0.74rem", color: "#64748b", py: 1.5, width: "25%" }}>
                    CATEGORÍA
                  </TableCell>
                  <TableCell sx={{ fontWeight: 850, fontSize: "0.74rem", color: "#64748b", py: 1.5, width: "35%" }}>
                    OBSERVACIONES
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 850, fontSize: "0.74rem", color: "#64748b", py: 1.5, width: "18%" }}>
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {obsGenerales.map((row) => {
                  const status = statuses[row.id];
                  const isValidado = status === "VALIDADO";
                  const isRechazado = status === "RECHAZADO";
                  const isExpanded = !!expandedRows[row.id];

                  return (
                    <React.Fragment key={row.id}>
                      <TableRow hover sx={{ "&:last-child td": { borderBottom: isExpanded ? "1px solid #e2e8f0" : 0 } }}>
                        {/* ORIGEN CON CHEVRON */}
                        <TableCell sx={{ py: 1.8 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Tooltip title={isExpanded ? "Ocultar detalle" : "Ver detalle"}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleExpand(row.id)}
                                sx={{
                                  p: 0.5,
                                  color: "#005596",
                                  transition: "transform 0.25s ease",
                                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                }}
                              >
                                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </Tooltip>
                            <Chip
                              label={row.origen}
                              size="small"
                              sx={{
                                bgcolor: "#e0f2fe",
                                color: "#0284c7",
                                fontWeight: 850,
                                fontSize: "0.7rem",
                                borderRadius: "12px",
                                height: 22,
                                letterSpacing: 0.3,
                              }}
                            />
                          </Box>
                        </TableCell>

                        {/* CATEGORÍA */}
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.86rem", color: "#1e293b", py: 1.8 }}>
                          {row.categoria}
                        </TableCell>

                        {/* OBSERVACIONES */}
                        <TableCell sx={{ fontSize: "0.82rem", color: "#475569", py: 1.8 }}>
                          {row.obs}
                        </TableCell>

                        {/* ACCIONES (👁️) (✔) (!) */}
                        <TableCell align="center" sx={{ py: 1.8 }}>
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            {/* BOTÓN OJO: VER RESPUESTA */}
                            <Tooltip title="Ver respuesta y evidencia del efector" arrow>
                              <IconButton
                                size="small"
                                onClick={() => setViewResponseDialog({ open: true, item: row })}
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: "#f1f5f9",
                                  color: "#475569",
                                  border: "1px solid #cbd5e1",
                                  "&:hover": { bgcolor: "#e2e8f0" },
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>

                            {/* BOTÓN VALIDAR: CHECK VERDE */}
                            <Tooltip title="Aceptar / Validar respuesta" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateStatus(row.id, "VALIDADO")}
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: isValidado ? "#059669" : "transparent",
                                  color: isValidado ? "#ffffff" : "#059669",
                                  border: `1.5px solid ${isValidado ? "#059669" : "#10b981"}`,
                                  "&:hover": {
                                    bgcolor: isValidado ? "#047857" : "rgba(16, 185, 129, 0.1)",
                                  },
                                }}
                              >
                                <CheckIcon sx={{ fontSize: 18, fontWeight: 900 }} />
                              </IconButton>
                            </Tooltip>

                            {/* BOTÓN RECHAZAR: EXCLAMACIÓN ROJA */}
                            <Tooltip title="Rechazar con motivo" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenRejectDialog(row)}
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: isRechazado ? "#dc2626" : "transparent",
                                  color: isRechazado ? "#ffffff" : "#dc2626",
                                  border: `1.5px solid ${isRechazado ? "#dc2626" : "#ef4444"}`,
                                  "&:hover": {
                                    bgcolor: isRechazado ? "#b91c1c" : "rgba(239, 68, 68, 0.1)",
                                  },
                                }}
                              >
                                <PriorityHighIcon sx={{ fontSize: 18, fontWeight: 900 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* CONTENIDO DESPLEGABLE */}
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell colSpan={4} sx={{ p: 0, borderBottom: isExpanded ? "1px solid #e2e8f0" : "none" }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px dashed #cbd5e1" }}>
                              <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.82rem", mb: 0.8 }}>
                                Respuesta del efector ante la observación
                              </Typography>
                              <TextField
                                fullWidth
                                multiline
                                disabled
                                rows={2}
                                value={RESPUESTAS_EFECTOR_TEXTO[row.id] || row.respuestaEfector}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    bgcolor: "#f1f5f9",
                                    borderRadius: "8px",
                                    fontSize: "0.85rem",
                                    "& fieldset": { borderColor: "#cbd5e1" },
                                  },
                                  "& .MuiInputBase-input.Mui-disabled": {
                                    WebkitTextFillColor: "#334155",
                                    fontWeight: 500,
                                  },
                                }}
                              />
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
        </Paper>
      </Box>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: OBSERVACIONES DATOS DEL TRÁMITE (Estilo exacto de la imagen) */}
      {/* ========================================================================= */}
      <Box sx={{ mb: 5 }}>
        {/* TÍTULO CON BARRA LATERAL AZUL */}
        <Box sx={{ borderLeft: "5px solid #0080c8", pl: 1.5, py: 0.2, mb: 1.5 }}>
          <Typography sx={{ fontWeight: 900, color: "#002B49", fontSize: "1.25rem", letterSpacing: 0.2, textTransform: "uppercase" }}>
            OBSERVACIONES DATOS DEL TRÁMITE
          </Typography>
        </Box>

        {/* PILL SUB-BADGE: [ % ] OBSERVACIONES DEL TRÁMITE */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "16px",
            px: 1.5,
            py: 0.4,
            mb: 2,
          }}
        >
          <Chip
            label={`${pctValidadosTra}%`}
            size="small"
            sx={{
              bgcolor: pctValidadosTra === 100 ? "#16a34a" : "#e0f2fe",
              color: pctValidadosTra === 100 ? "#ffffff" : "#0284c7",
              fontWeight: 900,
              fontSize: "0.72rem",
              height: 20,
              borderRadius: "10px",
            }}
          />
          <Typography sx={{ fontWeight: 800, color: "#0369a1", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
            OBSERVACIONES DEL TRÁMITE
          </Typography>
        </Box>

        {/* TABLA DATOS DEL TRÁMITE */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 850, fontSize: "0.74rem", color: "#64748b", py: 1.5, width: "22%" }}>
                    ORIGEN
                  </TableCell>
                  <TableCell sx={{ fontWeight: 850, fontSize: "0.74rem", color: "#64748b", py: 1.5, width: "25%" }}>
                    CATEGORÍA
                  </TableCell>
                  <TableCell sx={{ fontWeight: 850, fontSize: "0.74rem", color: "#64748b", py: 1.5, width: "35%" }}>
                    OBSERVACIONES
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 850, fontSize: "0.74rem", color: "#64748b", py: 1.5, width: "18%" }}>
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {obsTramite.map((row) => {
                  const status = statuses[row.id];
                  const isValidado = status === "VALIDADO";
                  const isRechazado = status === "RECHAZADO";
                  const isExpanded = !!expandedRows[row.id];
                  const isEquipamiento = row.id === "RF-EQ-01";

                  return (
                    <React.Fragment key={row.id}>
                      <TableRow hover sx={{ "&:last-child td": { borderBottom: isExpanded ? "1px solid #e2e8f0" : 0 } }}>
                        {/* ORIGEN CON CHEVRON */}
                        <TableCell sx={{ py: 1.8 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Tooltip title={isExpanded ? "Ocultar detalle" : "Ver detalle"}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleExpand(row.id)}
                                sx={{
                                  p: 0.5,
                                  color: "#005596",
                                  transition: "transform 0.25s ease",
                                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                }}
                              >
                                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </Tooltip>
                            <Chip
                              label={row.origen}
                              size="small"
                              sx={{
                                bgcolor: "#e0f2fe",
                                color: "#0284c7",
                                fontWeight: 850,
                                fontSize: "0.7rem",
                                borderRadius: "12px",
                                height: 22,
                                letterSpacing: 0.3,
                              }}
                            />
                          </Box>
                        </TableCell>

                        {/* CATEGORÍA */}
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.86rem", color: "#1e293b", py: 1.8 }}>
                          {row.categoria}
                        </TableCell>

                        {/* OBSERVACIONES */}
                        <TableCell sx={{ fontSize: "0.82rem", color: "#475569", py: 1.8 }}>
                          {row.obs}
                        </TableCell>

                        {/* ACCIONES (👁️) (✔) (!) */}
                        <TableCell align="center" sx={{ py: 1.8 }}>
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            {/* BOTÓN OJO: VER RESPUESTA */}
                            <Tooltip title="Ver respuesta y evidencia del efector" arrow>
                              <IconButton
                                size="small"
                                onClick={() => setViewResponseDialog({ open: true, item: row })}
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: "#f1f5f9",
                                  color: "#475569",
                                  border: "1px solid #cbd5e1",
                                  "&:hover": { bgcolor: "#e2e8f0" },
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>

                            {/* BOTÓN VALIDAR: CHECK VERDE */}
                            <Tooltip title="Aceptar / Validar respuesta" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateStatus(row.id, "VALIDADO")}
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: isValidado ? "#059669" : "transparent",
                                  color: isValidado ? "#ffffff" : "#059669",
                                  border: `1.5px solid ${isValidado ? "#059669" : "#10b981"}`,
                                  "&:hover": {
                                    bgcolor: isValidado ? "#047857" : "rgba(16, 185, 129, 0.1)",
                                  },
                                }}
                              >
                                <CheckIcon sx={{ fontSize: 18, fontWeight: 900 }} />
                              </IconButton>
                            </Tooltip>

                            {/* BOTÓN RECHAZAR: EXCLAMACIÓN ROJA */}
                            <Tooltip title="Rechazar con motivo" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenRejectDialog(row)}
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: isRechazado ? "#dc2626" : "transparent",
                                  color: isRechazado ? "#ffffff" : "#dc2626",
                                  border: `1.5px solid ${isRechazado ? "#dc2626" : "#ef4444"}`,
                                  "&:hover": {
                                    bgcolor: isRechazado ? "#b91c1c" : "rgba(239, 68, 68, 0.1)",
                                  },
                                }}
                              >
                                <PriorityHighIcon sx={{ fontSize: 18, fontWeight: 900 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* CONTENIDO DESPLEGABLE */}
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell colSpan={4} sx={{ p: 0, borderBottom: isExpanded ? "1px solid #e2e8f0" : "none" }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px dashed #cbd5e1" }}>
                              {/* EXTRA SOLO EN EQUIPAMIENTO: 2 TABLAS */}
                              {isEquipamiento && (
                                <Box sx={{ mb: 2.5 }}>
                                  {/* TABLA 1: UNIDADES OBSERVADAS (1) */}
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      mb: 2,
                                      borderRadius: "8px",
                                      overflow: "hidden",
                                      border: "1px solid #cbd5e1",
                                    }}
                                  >
                                    <Box sx={{ bgcolor: "#e2e8f0", px: 2, py: 1 }}>
                                      <Typography sx={{ fontWeight: 850, fontSize: "0.78rem", color: "#1e293b", textTransform: "uppercase" }}>
                                        UNIDADES OBSERVADAS (1)
                                      </Typography>
                                    </Box>
                                    <TableContainer>
                                      <Table size="small">
                                        <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                          <TableRow>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Marca</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Modelo</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Serie</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Condición</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Año Fab.</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Tipo Revelado</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody sx={{ bgcolor: "#ffffff" }}>
                                          <TableRow sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#dc2626" }}>SIEMENS</TableCell>
                                            <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>Multix Impact</TableCell>
                                            <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>SN-684291-DE</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#dc2626" }}>Propio</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#dc2626" }}>2000</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#dc2626" }}>DIGITAL</TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Paper>

                                  {/* TABLA 2: UNIDADES AGREGADAS (1) */}
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      borderRadius: "8px",
                                      overflow: "hidden",
                                      border: "1px solid #cbd5e1",
                                    }}
                                  >
                                    <Box sx={{ bgcolor: "#e2e8f0", px: 2, py: 1 }}>
                                      <Typography sx={{ fontWeight: 850, fontSize: "0.78rem", color: "#1e293b", textTransform: "uppercase" }}>
                                        UNIDADES AGREGADAS (1)
                                      </Typography>
                                    </Box>
                                    <TableContainer>
                                      <Table size="small">
                                        <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                          <TableRow>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Marca</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Modelo</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Serie</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Condición</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Año Fab.</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Tipo Revelado</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody sx={{ bgcolor: "#ffffff" }}>
                                          <TableRow sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#16a34a" }}>PHILIPS</TableCell>
                                            <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>Multix Impact</TableCell>
                                            <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>SN-684291-DE</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#16a34a" }}>Tercerizado</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#16a34a" }}>2015</TableCell>
                                            <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>DIGITAL</TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Paper>
                                </Box>
                              )}

                              {/* CONTENEDOR: RESPUESTA DEL EFECTOR */}
                              <Box>
                                <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.82rem", mb: 0.8 }}>
                                  Respuesta del efector ante la observación
                                </Typography>
                                <TextField
                                  fullWidth
                                  multiline
                                  disabled
                                  rows={2}
                                  value={RESPUESTAS_EFECTOR_TEXTO[row.id] || row.respuestaEfector}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      bgcolor: "#f1f5f9",
                                      borderRadius: "8px",
                                      fontSize: "0.85rem",
                                      "& fieldset": { borderColor: "#cbd5e1" },
                                    },
                                    "& .MuiInputBase-input.Mui-disabled": {
                                      WebkitTextFillColor: "#334155",
                                      fontWeight: 500,
                                    },
                                  }}
                                />
                              </Box>
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
        </Paper>
      </Box>

      {/* BARRA INFERIOR DE ACCIONES FINALES */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mt: 4,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.9rem" }}>
            Dictamen del Inspector: {totalValidados} de {totalItems} requisitos subsanados
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {hasRechazado
              ? "Existen observaciones rechazadas. Puede generar un nuevo emplazamiento otorgando plazo adicional."
              : isAllValidado
              ? "Todos los requisitos han sido validados favorablemente. Puede concluir y aprobar el acta de inspección."
              : "Complete la revisión de todos los ítems para finalizar el dictamen."}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          {hasRechazado && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setEmplazarDialog(true)}
              sx={{ fontWeight: 900, px: 3, py: 1, borderRadius: 2 }}
            >
              GENERAR NUEVO EMPLAZAMIENTO
            </Button>
          )}

          <Button
            variant="contained"
            disabled={!isAllValidado}
            onClick={() => setConfirmFinalizarOpen(true)}
            sx={{
              bgcolor: isAllValidado ? "#059669" : undefined,
              "&:hover": { bgcolor: "#047857" },
              fontWeight: 900,
              px: 3,
              py: 1,
              borderRadius: 2,
            }}
          >
            FINALIZAR Y APROBAR ACTA
          </Button>
        </Stack>
      </Paper>

      {/* ========================================================================= */}
      {/* MODAL (👁️): VER RESPUESTA Y EVIDENCIA DEL EFECTOR */}
      {/* ========================================================================= */}
      <Dialog
        open={viewResponseDialog.open}
        onClose={() => setViewResponseDialog({ open: false, item: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {viewResponseDialog.item && (
          <>
            <DialogTitle
              sx={{
                bgcolor: "#005596",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: "1.05rem" }}>
                  Respuesta del Efector al Emplazamiento
                </Typography>
                <Typography variant="caption" sx={{ color: "#e0f2fe", fontWeight: 600 }}>
                  {viewResponseDialog.item.origen} • {viewResponseDialog.item.categoria}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setViewResponseDialog({ open: false, item: null })} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                {/* 1. OBSERVACIÓN INICIAL */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fff1f2", borderColor: "#fecdd3", borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#be123c", textTransform: "uppercase" }}>
                    Observación Inicial del Inspector (Acta 105/2026):
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#9f1239", fontSize: "0.9rem", mt: 0.5 }}>
                    {viewResponseDialog.item.obs}
                  </Typography>
                </Paper>

                {/* 2. TEXTO DE RESPUESTA ENVIADO POR EL EFECTOR */}
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#005596", fontSize: "0.85rem", mb: 0.8, textTransform: "uppercase" }}>
                    Aclaración / Fundamentación redactada por el Efector ({viewResponseDialog.item.fechaRespuesta}):
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderColor: "#cbd5e1",
                      borderRadius: 2,
                      borderLeft: "4px solid #005596",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.88rem", color: "#1e293b", lineHeight: 1.6, fontStyle: "italic" }}>
                      "{viewResponseDialog.item.respuestaEfector}"
                    </Typography>
                  </Paper>
                </Box>

                {/* 3. CAMPOS RECTIFICADOS (SI ES EQUIPAMIENTO) */}
                {viewResponseDialog.item.camposRectificados && (
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: "#005596", fontSize: "0.85rem", mb: 0.8, textTransform: "uppercase" }}>
                      Campos Técnicos Rectificados en el Trámite:
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Campo</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Declarado Inicial</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Observado Inspector</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#16a34a" }}>Rectificado Efector</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {viewResponseDialog.item.camposRectificados.map((c, cIdx) => (
                            <TableRow key={cIdx}>
                              <TableCell sx={{ fontWeight: 750, fontSize: "0.78rem" }}>{c.campo}</TableCell>
                              <TableCell sx={{ fontSize: "0.78rem" }}>{c.declarado}</TableCell>
                              <TableCell sx={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: 700 }}>{c.observado}</TableCell>
                              <TableCell sx={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 800 }}>{c.rectificado}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* 4. ARCHIVO ADJUNTO */}
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#475569", fontSize: "0.82rem", mb: 0.8, textTransform: "uppercase" }}>
                    Evidencia documental adjunta por el efector:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <PictureAsPdfIcon sx={{ color: "#dc2626", fontSize: 26 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.84rem", color: "#1e293b" }}>
                          {viewResponseDialog.item.archivoAdjunto}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          Archivo PDF firmado digitalmente por el responsable técnico
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setOpenPdfViewer(true)}
                      sx={{ textTransform: "none", fontWeight: 750, borderRadius: 2 }}
                    >
                      Ver PDF
                    </Button>
                  </Paper>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0", justifyContent: "space-between" }}>
              <Button onClick={() => setViewResponseDialog({ open: false, item: null })}>
                Cerrar
              </Button>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<PriorityHighIcon />}
                  onClick={() => {
                    const item = viewResponseDialog.item;
                    setViewResponseDialog({ open: false, item: null });
                    handleOpenRejectDialog(item);
                  }}
                  sx={{ fontWeight: 800 }}
                >
                  Rechazar Subsanación
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => {
                    handleUpdateStatus(viewResponseDialog.item.id, "VALIDADO");
                    setViewResponseDialog({ open: false, item: null });
                  }}
                  sx={{ fontWeight: 900, bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}
                >
                  Validar / Aceptar
                </Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL COMENTARIOS DE RECHAZO */}
      {/* ========================================================================= */}
      <Dialog
        open={commentDialog.open}
        onClose={() => setCommentDialog({ open: false, id: null, text: "" })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          Rechazar Respuesta de Emplazamiento
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Indique las observaciones técnicas o motivos por los cuales la respuesta y documentación remitida por el efector no subsanan la irregularidad:
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Ej: La memoria de cálculo no incluye el factor de ocupación de la sala contigua..."
            value={commentDialog.text}
            onChange={(e) => setCommentDialog((prev) => ({ ...prev, text: e.target.value }))}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setCommentDialog({ open: false, id: null, text: "" })}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSaveRejection}
            sx={{ fontWeight: 850, borderRadius: 2 }}
          >
            Confirmar Rechazo
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL NUEVO EMPLAZAMIENTO */}
      {/* ========================================================================= */}
      <Dialog
        open={emplazarDialog}
        onClose={() => setEmplazarDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#fff7ed", color: "#9a3412" }}>
          <WarningIcon sx={{ color: "#ea580c" }} />
          Generar Nuevo Emplazamiento
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: "#475569", mb: 3 }}>
            Se notificará al efector el rechazo de las observaciones señaladas y se le otorgará un nuevo plazo legal para presentar las correcciones.
          </Typography>

          <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 3 }}>
            {[
              { label: "24", sub: "horas", value: "24 horas" },
              { label: "48", sub: "horas", value: "48 horas" },
              { label: "5", sub: "días", value: "5 días" },
              { label: "10", sub: "días", value: "10 días" },
              { label: "15", sub: "días", value: "15 días" },
            ].map((option) => (
              <Button
                key={option.value}
                variant={diasEmplazamiento === option.value && !customValue ? "contained" : "outlined"}
                onClick={() => {
                  setDiasEmplazamiento(option.value);
                  setCustomValue("");
                }}
                sx={{
                  width: 62,
                  height: 62,
                  borderRadius: "50%",
                  minWidth: 0,
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  lineHeight: 1.1,
                  display: "flex",
                  flexDirection: "column",
                  textTransform: "none",
                }}
              >
                {option.label}
                <Typography variant="caption" sx={{ fontSize: "0.62rem", fontWeight: 700 }}>
                  {option.sub}
                </Typography>
              </Button>
            ))}
          </Stack>

          {vencimiento && (
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#f0fdf4", borderColor: "#bbf7d0", borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "#16a34a" }}>
                Nueva fecha límite: {vencimiento.toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setEmplazarDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setEmplazarDialog(false);
              navigate("/inspector/inspecciones");
            }}
            sx={{ fontWeight: 900, borderRadius: 2 }}
          >
            Emitir Emplazamiento
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL VISOR PDF */}
      <Dialog open={openPdfViewer} onClose={() => setOpenPdfViewer(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#005596", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>Vista Previa de Evidencia Adjunta</Typography>
          <Button onClick={() => setOpenPdfViewer(false)} color="inherit">Cerrar</Button>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: "70vh" }}>
          <iframe src={ReporteInspeccionPDF} title="Evidencia PDF" width="100%" height="100%" style={{ border: "none" }} />
        </DialogContent>
      </Dialog>

      {/* MODAL CONFIRMAR FINALIZAR */}
      <Dialog open={confirmFinalizarOpen} onClose={() => setConfirmFinalizarOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, bgcolor: "#059669", color: "white" }}>
          ¿Aprobar y Concluir Acta?
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 4 }}>
          <Typography sx={{ fontSize: "0.9rem", color: "#334155" }}>
            Se registrará la conformidad técnica de todas las subsanaciones presentadas por el efector para el trámite <b>TRM-RAD-002</b>. El acta quedará aprobada.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setConfirmFinalizarOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setConfirmFinalizarOpen(false);
              navigate("/inspector/inspecciones");
            }}
            sx={{ fontWeight: 900, bgcolor: "#059669" }}
          >
            Confirmar Aprobación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RevisionActa;
