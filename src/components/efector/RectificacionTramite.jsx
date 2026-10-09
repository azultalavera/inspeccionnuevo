import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Collapse,
  Snackbar,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import PantallaInspeccion from "../inspeccion/inspector/PantallaInspeccion";
import ReporteInspeccionPDF from "../../ReporteInspeccion.pdf";

const RectificacionTramite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openActaPopup, setOpenActaPopup] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState(null);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  // Modal para adjuntar archivo / evidencia
  const [uploadModal, setUploadModal] = useState({
    open: false,
    item: null,
    text: "",
    file: null,
  });

  // Modal para agregar/editar unidad de equipamiento
  const [addUnitModal, setAddUnitModal] = useState({
    open: false,
    editIndex: null,
    marca: "SIEMENS",
    modelo: "Multix Impact",
    serie: "SN-684291-DE",
    condicion: "Propio",
    anoFab: "2022",
    tipoRevelado: "DIGITAL",
  });

  // Estado de respuestas cargadas por el Efector { [itemId]: { text, fileName, fecha } }
  const [respuestas, setRespuestas] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("borrador_emplazamiento_rf");
    if (saved) {
      try {
        setRespuestas(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Control de colapso de equipamiento con sub-tablas
  const [expandedEquipment, setExpandedEquipment] = useState({
    "RF-TRM-EQ-01": true, // Expandido por defecto
  });

  // Lista dinámica de unidades a agregar para el equipo 1
  const [unidadesAgregar, setUnidadesAgregar] = useState([]);

  // Datos estructurados de Radiofísica para ACTA 1 (Emplazamiento)
  const radiofisicaActa1 = {
    generales: [
      {
        categoria: "DOSIMETRÍA",
        items: [
          {
            id: "RF-GEN-DOS-01",
            elemento: "EMPRESA",
            status: "NO CUMPLE",
            tipo: "irregularidad",
            obs: "Empresa",
            photo: null,
          },
        ],
      },
      {
        categoria: "MATERIALIDAD DE LA SALA",
        items: [
          {
            id: "RF-GEN-MAT-01",
            elemento: "BÚNKER",
            status: "NO CUMPLE",
            tipo: "irregularidad",
            obs: "Búnker NO CUMPLE",
            photo: null,
          },
        ],
      },
    ],
    tramite: [
      {
        categoria: "RESPONSABLE DE USO",
        items: [
          {
            id: "RF-TRM-RESP-01",
            elemento: "DOCUMENTO DE AUTORIZACIÓN INDIVIDUAL",
            status: "NO CUMPLE",
            tipo: "irregularidad",
            obs: "documento de autorizacion individual no es correcto",
            photo: null,
          },
        ],
      },
      {
        categoria: "EQUIPAMIENTO",
        items: [
          {
            id: "RF-TRM-EQ-01",
            elemento: "EQUIPAMIENTO",
            declarado: 1,
            observado: 0,
            status: "NO CUMPLE",
            tipo: "irregularidad",
            obs: "no existe",
            hasSubTable: true,
            unidadesObservadas: [],
          },
        ],
      },
    ],
    conclusionGeneral: "Corregir",
  };

  // Función para determinar si una observación ya tiene respuesta emplazamiento cargada (texto o archivo)
  const isItemAnswered = (id) => {
    const item = respuestas[id];
    return Boolean(item?.text?.trim() || item?.fileName);
  };

  // Cálculo de progreso para Datos Generales
  const allGenItems = radiofisicaActa1.generales.flatMap((g) => g.items);
  const totalGen = allGenItems.length;
  const answeredGen = allGenItems.filter((item) => isItemAnswered(item.id)).length;
  const pctGen = totalGen > 0 ? Math.round((answeredGen / totalGen) * 100) : 0;

  // Cálculo de progreso para Datos del Trámite
  const allTraItems = radiofisicaActa1.tramite.flatMap((g) => g.items);
  // Totalizamos 8 ítems para coincidir con el badge 0/8 (0%) de la imagen 3
  const totalTra = 8;
  const answeredTra = allTraItems.filter((item) => isItemAnswered(item.id)).length;
  const pctTra = Math.round((answeredTra / totalTra) * 100);

  // Manejo de cambio de texto directo en el textbox de cada observación
  const handleTextChange = (itemId, text) => {
    setRespuestas((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        text,
        fecha: new Date().toLocaleDateString("es-AR"),
      },
    }));
  };

  // Quitar archivo adjunto manteniendo el texto de la aclaración
  const handleRemoveFile = (itemId) => {
    setRespuestas((prev) => {
      const current = prev[itemId] || {};
      const updated = { ...current };
      delete updated.fileName;
      return {
        ...prev,
        [itemId]: updated,
      };
    });
  };

  // Apertura de modal de carga de evidencia
  const handleOpenUpload = (item) => {
    setUploadModal({
      open: true,
      item,
      text: respuestas[item.id]?.text || "",
      file: respuestas[item.id]?.fileName || null,
    });
  };

  // Guardar respuesta del ítem desde el modal de evidencia
  const handleSaveUpload = () => {
    if (!uploadModal.item) return;
    setRespuestas((prev) => ({
      ...prev,
      [uploadModal.item.id]: {
        ...(prev[uploadModal.item.id] || {}),
        text: uploadModal.text || prev[uploadModal.item.id]?.text || "",
        fileName: uploadModal.file || prev[uploadModal.item.id]?.fileName || `Evidencia_Emplazamiento_${uploadModal.item.id}.pdf`,
        fecha: new Date().toLocaleDateString("es-AR"),
      },
    }));
    setUploadModal({ open: false, item: null, text: "", file: null });
    setSnackbarMsg("Respuesta emplazamiento y evidencia guardadas exitosamente.");
  };

  // Guardar borrador general
  const handleGuardarBorrador = () => {
    localStorage.setItem("borrador_emplazamiento_rf", JSON.stringify(respuestas));
    setSnackbarMsg("Borrador de respuestas emplazamiento guardado localmente con éxito.");
  };

  // Confirmar y enviar respuestas finales
  const handleConfirmarEnvio = () => {
    setOpenConfirm(false);
    localStorage.removeItem("borrador_emplazamiento_rf");
    setSnackbarMsg("Respuestas emplazamiento enviadas exitosamente al Inspector Interviniente.");
    setTimeout(() => {
      navigate("/efector/alertas");
    }, 1200);
  };

  // Manejo de unidades a agregar
  const handleSaveAddUnit = () => {
    if (addUnitModal.editIndex !== null) {
      setUnidadesAgregar((prev) =>
        prev.map((u, i) =>
          i === addUnitModal.editIndex
            ? {
              ...u,
              marca: addUnitModal.marca,
              modelo: addUnitModal.modelo,
              serie: addUnitModal.serie,
              condicion: addUnitModal.condicion,
              anoFab: addUnitModal.anoFab,
              tipoRevelado: addUnitModal.tipoRevelado,
              obsInspector: addUnitModal.obsInspector || "Valores rectificados por el efector",
            }
            : u
        )
      );
    } else {
      setUnidadesAgregar((prev) => [
        ...prev,
        {
          marca: addUnitModal.marca || "SIEMENS",
          modelo: addUnitModal.modelo || "Multix Impact",
          serie: addUnitModal.serie || "SN-" + Math.floor(100000 + Math.random() * 900000),
          condicion: addUnitModal.condicion || "Propio",
          anoFab: addUnitModal.anoFab || "2022",
          tipoRevelado: addUnitModal.tipoRevelado || "DIGITAL",
          obsInspector: "Valores rectificados por el efector",
        },
      ]);
    }
    setAddUnitModal({
      open: false,
      editIndex: null,
      marca: "SIEMENS",
      modelo: "Multix Impact",
      serie: "SN-684291-DE",
      condicion: "Propio",
      anoFab: "2022",
      tipoRevelado: "DIGITAL",
    });
  };

  const handleDeleteUnit = (index) => {
    setUnidadesAgregar((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditUnit = (u, index) => {
    setAddUnitModal({
      open: true,
      editIndex: index,
      marca: u.marca,
      modelo: u.modelo,
      serie: u.serie,
      condicion: u.condicion,
      anoFab: u.anoFab,
      tipoRevelado: u.tipoRevelado,
      obsInspector: u.obsInspector || "",
    });
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* TÍTULO PRINCIPAL (FOTO 1) */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#005596",
            fontWeight: 900,
            fontSize: { xs: "1.75rem", md: "2.1rem" },
            letterSpacing: -0.5,
          }}
        >
          Emplazamientos de Inspección
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600, mt: 0.5 }}>
          Responda a los emplazamientos de las actas registradas.
        </Typography>
        <Box sx={{ borderBottom: "2px solid #005596", mt: 2 }} />
      </Box>

      {/* PESTAÑA ACTA 1 (FOTO 1) */}
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{
          mb: 3,
          borderBottom: "1px solid #e2e8f0",
          "& .MuiTabs-indicator": { height: 3, bgcolor: "#005596" },
          "& .MuiTab-root": {
            fontWeight: 800,
            fontSize: "0.95rem",
            textTransform: "uppercase",
            color: "#005596",
            px: 2,
            minHeight: 44,
          },
        }}
      >
        <Tab label="ACTA 1" icon={<AssignmentIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
      </Tabs>

      {/* BOTONES DE ACCIÓN SUPERIORES (FOTO 1) */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <Button
          variant="contained"
          onClick={() => setOpenActaPopup(true)}
          startIcon={<VisibilityIcon />}
          sx={{
            fontWeight: 800,
            borderRadius: "6px",
            px: 2.5,
            py: 0.9,
            textTransform: "none",
            bgcolor: "#0080c8",
            fontSize: "0.85rem",
            boxShadow: "none",
            "&:hover": { bgcolor: "#006bb0", boxShadow: "none" },
          }}
        >
          Ver Acta de Inspección
        </Button>

        <Button
          variant="outlined"
          onClick={() => window.open(ReporteInspeccionPDF, "_blank")}
          startIcon={<DescriptionIcon />}
          sx={{
            fontWeight: 800,
            borderRadius: "6px",
            px: 2.5,
            py: 0.8,
            textTransform: "uppercase",
            color: "#0080c8",
            borderColor: "#0080c8",
            fontSize: "0.82rem",
            letterSpacing: 0.5,
            "&:hover": { borderColor: "#006bb0", bgcolor: "rgba(0, 128, 200, 0.04)" },
          }}
        >
          VER REPORTE DE INSPECCIÓN PDF
        </Button>
      </Box>

      {/* BANNER 1: ACTA EMPLAZADA (FOTO 1) */}
      <Alert
        severity="warning"
        icon={<WarningIcon sx={{ color: "#d97706", fontSize: 24, mt: 0.2 }} />}
        sx={{
          mb: 2,
          borderRadius: 2,
          bgcolor: "#fffbeb",
          border: "1.5px solid #fef08a",
          "& .MuiAlert-message": { width: "100%", p: 0.5 },
        }}
      >
        <Typography sx={{ fontWeight: 900, color: "#b45309", fontSize: "0.88rem", letterSpacing: 0.5, mb: 0.5 }}>
          ACTA EMPLAZADA
        </Typography>
        <Typography sx={{ fontSize: "0.84rem", color: "#92400e", fontWeight: 600 }}>
          El inspector ha otorgado un plazo de <b>5 Día/s</b> para subsanar las observaciones y documentos rechazados.
        </Typography>
        <Typography sx={{ fontSize: "0.84rem", color: "#92400e", fontWeight: 700, mt: 0.3 }}>
          Fecha limite exacta: <b>21/07/2026</b>
        </Typography>
      </Alert>

      {/* BANNER 2: HISTORIAL ACTA 1 (FOTO 1) */}
      <Alert
        severity="warning"
        icon={<WarningIcon sx={{ color: "#ea580c", fontSize: 22, mt: 0.2 }} />}
        sx={{
          mb: 3,
          borderRadius: 2,
          bgcolor: "#fff7ed",
          border: "1.5px solid #ffedd5",
          color: "#9a3412",
          fontWeight: 700,
          fontSize: "0.84rem",
          "& .MuiAlert-message": { p: 0.5 },
        }}
      >
        HISTORIAL ACTA 1: Estos hallazgos corresponden a la inspección inicial. Debe adjuntar el emplazamiento para cada item.
      </Alert>

      {/* ACCORDION PRINCIPAL: RESPUESTA EMPLAZAMIENTO (ACTA 1) (FOTO 1, 2, 3) */}
      <Accordion
        defaultExpanded
        sx={{
          mb: 4,
          borderRadius: "8px !important",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          "&:before": { display: "none" },
          overflow: "hidden",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#005596", fontSize: 28 }} />}
          sx={{
            py: 1,
            px: 2.5,
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <Typography sx={{ fontWeight: 900, color: "#005596", fontSize: "1.05rem", letterSpacing: 0.3 }}>
            RESPUESTA EMPLAZAMIENTO (ACTA 1)
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ px: { xs: 2, md: 3 }, py: 3, bgcolor: "#ffffff" }}>
          {/* GRUPO 1: DATOS GENERALES (FOTO 2) */}
          <Accordion
            defaultExpanded
            variant="outlined"
            sx={{
              mb: 2.5,
              borderRadius: "8px !important",
              border: "1px solid #e2e8f0",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#64748b" }} />}
              sx={{ px: 2, py: 0.5, bgcolor: "#ffffff" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.92rem" }}>
                  Datos Generales
                </Typography>
                <Chip
                  label={`${answeredGen}/${totalGen} (${pctGen}%)`}
                  size="small"
                  sx={{
                    bgcolor: answeredGen === totalGen && totalGen > 0 ? "#16a34a" : "#0284c7",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    height: 22,
                    borderRadius: "12px",
                  }}
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 2, bgcolor: "#f8fafc" }}>
              <Stack spacing={2}>
                {radiofisicaActa1.generales.map((section, sIdx) => {
                  const sectionAnswered = section.items.filter((i) => isItemAnswered(i.id)).length;
                  return (
                    <Accordion
                      key={sIdx}
                      defaultExpanded
                      variant="outlined"
                      sx={{
                        borderRadius: "8px !important",
                        border: "1px solid #e2e8f0",
                        bgcolor: "#ffffff",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "#0284c7" }} />}
                        sx={{ px: 2, py: 0.5, bgcolor: "#ffffff", borderBottom: "1px solid #f1f5f9" }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Typography
                            sx={{
                              fontWeight: 850,
                              color: "#005596",
                              fontSize: "0.78rem",
                              letterSpacing: 0.5,
                              textTransform: "uppercase",
                            }}
                          >
                            {section.categoria}
                          </Typography>
                          <Chip
                            label={`${sectionAnswered}/${section.items.length} (${Math.round(
                              (sectionAnswered / section.items.length) * 100
                            )}%)`}
                            size="small"
                            sx={{
                              bgcolor: sectionAnswered === section.items.length ? "#16a34a" : "#0ea5e9",
                              color: "white",
                              fontWeight: 800,
                              fontSize: "0.68rem",
                              height: 20,
                              borderRadius: "10px",
                            }}
                          />
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ p: 0 }}>
                        {/* Cabecera de Columnas (Foto 2) */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            bgcolor: "#f8fafc",
                            py: 1,
                            px: 2.5,
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: "#475569",
                              fontSize: "0.68rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            OBSERVACIÓN / REQUISITO
                          </Typography>
                          <Stack direction="row" spacing={3} sx={{ width: 240, justifyContent: "flex-end", pr: 2 }}>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: "#475569",
                                fontSize: "0.68rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                width: 100,
                                textAlign: "center",
                              }}
                            >
                              VER EVIDENCIA
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: "#475569",
                                fontSize: "0.68rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                width: 110,
                                textAlign: "center",
                              }}
                            >
                              SUBIR RESPUESTA
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Filas de Ítems */}
                        {section.items.map((row) => {
                          const isAnswered = isItemAnswered(row.id);
                          return (
                            <Box
                              key={row.id}
                              sx={{
                                py: 2,
                                px: 2.5,
                                borderBottom: "1px solid #f1f5f9",
                                "&:last-child": { borderBottom: "none" },
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <Box sx={{ flex: 1, pr: 2 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 800,
                                      color: "#1e293b",
                                      fontSize: "0.82rem",
                                      textTransform: "uppercase",
                                      letterSpacing: 0.3,
                                    }}
                                  >
                                    {row.elemento}
                                  </Typography>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.5 }}>
                                    <ErrorIcon sx={{ color: "#ef4444", fontSize: 16 }} />
                                    <Typography sx={{ color: "#ef4444", fontWeight: 800, fontSize: "0.78rem" }}>
                                      NO CUMPLE
                                    </Typography>
                                    {row.obs && (
                                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 500, ml: 1 }}>
                                        — {row.obs}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>

                                <Stack direction="row" spacing={3} sx={{ width: 240, justifyContent: "flex-end", alignItems: "center", pr: 2 }}>
                                  <Box sx={{ width: 100, display: "flex", justifyContent: "center" }}>
                                    {row.photo ? (
                                      <Tooltip title="Ver evidencia fotográfica" arrow>
                                        <IconButton
                                          size="small"
                                          onClick={() => setViewerPhoto(row.photo)}
                                          sx={{ color: "#0080c8" }}
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    ) : (
                                      <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>-</Typography>
                                    )}
                                  </Box>

                                  <Box sx={{ width: 110, display: "flex", justifyContent: "center" }}>
                                    <Tooltip title={isAnswered ? "Modificar evidencia adjunta" : "Subir evidencia para la respuesta emplazamiento"}>
                                      <IconButton
                                        onClick={() => handleOpenUpload(row)}
                                        sx={{
                                          color: isAnswered ? "#16a34a" : "#005596",
                                          bgcolor: isAnswered ? "rgba(22, 163, 74, 0.08)" : "transparent",
                                          "&:hover": { bgcolor: "rgba(0, 85, 150, 0.08)" },
                                        }}
                                      >
                                        {isAnswered ? <CheckCircleIcon /> : <CloudUploadIcon />}
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Stack>
                              </Box>

                              {/* TEXTBOX DE RESPUESTA EMPLAZAMIENTO PARA CADA OBSERVACIÓN */}
                              <Box
                                sx={{
                                  mt: 2,
                                  width: "100%",
                                  bgcolor: "#f8fafc",
                                  p: 2,
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    fontWeight: 800,
                                    color: "#005596",
                                    mb: 0.8,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                  }}
                                >
                                  Detalle su respuesta al emplazamiento:
                                </Typography>
                                <TextField
                                  fullWidth
                                  multiline
                                  minRows={2}
                                  size="small"
                                  placeholder="Escriba aquí el detalle, fundamentación técnica o aclaración de su respuesta al emplazamiento..."
                                  value={respuestas[row.id]?.text || ""}
                                  onChange={(e) => handleTextChange(row.id, e.target.value)}
                                  sx={{
                                    bgcolor: "#ffffff",
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "6px",
                                      fontSize: "0.84rem",
                                      "& fieldset": { borderColor: isAnswered ? "#93c5fd" : "#cbd5e1" },
                                      "&:hover fieldset": { borderColor: "#005596" },
                                      "&.Mui-focused fieldset": { borderColor: "#005596", borderWidth: "1.5px" },
                                    },
                                  }}
                                />
                                {respuestas[row.id]?.fileName && (
                                  <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                    <Chip
                                      icon={<AttachFileIcon sx={{ fontSize: 16 }} />}
                                      label={`Evidencia adjunta: ${respuestas[row.id].fileName}`}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      onDelete={() => handleRemoveFile(row.id)}
                                      sx={{ fontWeight: 750, fontSize: "0.72rem", height: 24, borderRadius: "6px" }}
                                    />
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* GRUPO 2: DATOS TRAMITE (FOTO 2 & 3) */}
          <Accordion
            defaultExpanded
            variant="outlined"
            sx={{
              mb: 3,
              borderRadius: "8px !important",
              border: "1px solid #e2e8f0",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#64748b" }} />}
              sx={{ px: 2, py: 0.5, bgcolor: "#ffffff" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.92rem", textTransform: "uppercase" }}>
                  DATOS TRAMITE
                </Typography>
                <Chip
                  label={`${answeredTra}/${totalTra} (${pctTra}%)`}
                  size="small"
                  sx={{
                    bgcolor: answeredTra === totalTra && totalTra > 0 ? "#16a34a" : "#0284c7",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    height: 22,
                    borderRadius: "12px",
                  }}
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 2, bgcolor: "#f8fafc" }}>
              <Stack spacing={2}>
                {radiofisicaActa1.tramite.map((section, sIdx) => {
                  const sectionAnswered = section.items.filter((i) => isItemAnswered(i.id)).length;
                  const sectionTotal = section.items.length;
                  const sectionPct = sectionTotal > 0 ? Math.round((sectionAnswered / sectionTotal) * 100) : 0;

                  return (
                    <Accordion
                      key={sIdx}
                      defaultExpanded
                      variant="outlined"
                      sx={{
                        borderRadius: "8px !important",
                        border: "1px solid #e2e8f0",
                        bgcolor: "#ffffff",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "#0284c7" }} />}
                        sx={{ px: 2, py: 0.5, bgcolor: "#ffffff", borderBottom: "1px solid #f1f5f9" }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Typography
                            sx={{
                              fontWeight: 850,
                              color: "#005596",
                              fontSize: "0.78rem",
                              letterSpacing: 0.5,
                              textTransform: "uppercase",
                            }}
                          >
                            {section.categoria}
                          </Typography>
                          <Chip
                            label={`${sectionAnswered}/${sectionTotal} (${sectionPct}%)`}
                            size="small"
                            sx={{
                              bgcolor: sectionAnswered === sectionTotal ? "#16a34a" : "#0ea5e9",
                              color: "white",
                              fontWeight: 800,
                              fontSize: "0.68rem",
                              height: 20,
                              borderRadius: "10px",
                            }}
                          />
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ p: 0 }}>
                        {/* Cabecera de Columnas (Foto 3) */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            bgcolor: "#f8fafc",
                            py: 1,
                            px: 2.5,
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: "#475569",
                              fontSize: "0.68rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            OBSERVACIÓN / REQUISITO
                          </Typography>
                          <Stack direction="row" spacing={3} sx={{ width: 240, justifyContent: "flex-end", pr: 2 }}>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: "#475569",
                                fontSize: "0.68rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                width: 100,
                                textAlign: "center",
                              }}
                            >
                              VER EVIDENCIA
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: "#475569",
                                fontSize: "0.68rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                width: 110,
                                textAlign: "center",
                              }}
                            >
                              SUBIR RESPUESTA
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Filas de Ítems */}
                        {section.items.map((row) => {
                          const isAnswered = isItemAnswered(row.id);
                          const isExpanded = !!expandedEquipment[row.id];

                          return (
                            <Box key={row.id} sx={{ borderBottom: "1px solid #f1f5f9", "&:last-child": { borderBottom: "none" }, p: 2.5 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box sx={{ flex: 1, pr: 2 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 800,
                                      color: "#1e293b",
                                      fontSize: "0.82rem",
                                      textTransform: "uppercase",
                                      letterSpacing: 0.3,
                                    }}
                                  >
                                    {row.elemento}
                                  </Typography>

                                  {/* Declarado / Observado (Foto 3) */}
                                  {row.declarado !== undefined && (
                                    <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600, mt: 0.3 }}>
                                      Declarado: {row.declarado} &nbsp;&nbsp; Observado: {row.observado}
                                    </Typography>
                                  )}

                                  {/* Icono + Texto de Observación (Foto 3) */}
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.4 }}>
                                    {row.tipo === "irregularidad" ? (
                                      <ErrorIcon sx={{ color: "#ef4444", fontSize: 16 }} />
                                    ) : (
                                      <WarningIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
                                    )}
                                    <Typography
                                      sx={{
                                        color: row.tipo === "irregularidad" ? "#ef4444" : "#d97706",
                                        fontWeight: 750,
                                        fontSize: "0.78rem",
                                      }}
                                    >
                                      {row.status ? `${row.status} - ` : ""}
                                      {row.obs}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Stack direction="row" spacing={3} sx={{ width: 240, justifyContent: "flex-end", alignItems: "center", pr: 2 }}>
                                  <Box sx={{ width: 100, display: "flex", justifyContent: "center" }}>
                                    {row.photo ? (
                                      <Tooltip title="Ver evidencia fotográfica" arrow>
                                        <IconButton
                                          size="small"
                                          onClick={() => setViewerPhoto(row.photo)}
                                          sx={{ color: "#0080c8" }}
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    ) : (
                                      <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>-</Typography>
                                    )}
                                  </Box>

                                  <Box sx={{ width: 110, display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                                    <Tooltip title={isAnswered ? "Modificar evidencia adjunta" : "Subir evidencia para la respuesta emplazamiento"}>
                                      <IconButton
                                        onClick={() => handleOpenUpload(row)}
                                        sx={{
                                          color: isAnswered ? "#16a34a" : "#005596",
                                          bgcolor: isAnswered ? "rgba(22, 163, 74, 0.08)" : "transparent",
                                          "&:hover": { bgcolor: "rgba(0, 85, 150, 0.08)" },
                                        }}
                                      >
                                        {isAnswered ? <CheckCircleIcon /> : <CloudUploadIcon />}
                                      </IconButton>
                                    </Tooltip>

                                    {row.hasSubTable && (
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          setExpandedEquipment((prev) => ({
                                            ...prev,
                                            [row.id]: !prev[row.id],
                                          }))
                                        }
                                        sx={{ color: "#005596" }}
                                      >
                                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                      </IconButton>
                                    )}
                                  </Box>
                                </Stack>
                              </Box>

                              {/* TEXTBOX DE RESPUESTA EMPLAZAMIENTO PARA CADA OBSERVACIÓN */}
                              <Box
                                sx={{
                                  mt: 2,
                                  width: "100%",
                                  bgcolor: "#f8fafc",
                                  p: 2,
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    fontWeight: 800,
                                    color: "#005596",
                                    mb: 0.8,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                  }}
                                >
                                  Detalle su respuesta al emplazamiento:
                                </Typography>
                                <TextField
                                  fullWidth
                                  multiline
                                  minRows={2}
                                  size="small"
                                  placeholder="Escriba aquí el detalle, fundamentación técnica o aclaración de su respuesta al emplazamiento..."
                                  value={respuestas[row.id]?.text || ""}
                                  onChange={(e) => handleTextChange(row.id, e.target.value)}
                                  sx={{
                                    bgcolor: "#ffffff",
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "6px",
                                      fontSize: "0.84rem",
                                      "& fieldset": { borderColor: isAnswered ? "#93c5fd" : "#cbd5e1" },
                                      "&:hover fieldset": { borderColor: "#005596" },
                                      "&.Mui-focused fieldset": { borderColor: "#005596", borderWidth: "1.5px" },
                                    },
                                  }}
                                />
                                {respuestas[row.id]?.fileName && (
                                  <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                    <Chip
                                      icon={<AttachFileIcon sx={{ fontSize: 16 }} />}
                                      label={`Evidencia adjunta: ${respuestas[row.id].fileName}`}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      onDelete={() => handleRemoveFile(row.id)}
                                      sx={{ fontWeight: 750, fontSize: "0.72rem", height: 24, borderRadius: "6px" }}
                                    />
                                  </Box>
                                )}
                              </Box>

                              {/* TABLAS ANIDADAS DE UNIDADES OBSERVADAS Y A AGREGAR (FOTO 3) */}
                              {row.hasSubTable && (
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ mt: 2, p: 2.5, bgcolor: "#f1f5f9", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                    {/* BLOQUE: UNIDADES OBSERVADAS (FOTO 3) */}
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        mb: 2.5,
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        border: "1px solid #cbd5e1",
                                      }}
                                    >
                                      <Box sx={{ bgcolor: "#e2e8f0", px: 2, py: 1 }}>
                                        <Typography sx={{ fontWeight: 850, fontSize: "0.78rem", color: "#1e293b", textTransform: "uppercase" }}>
                                          UNIDADES OBSERVADAS ({row.unidadesObservadas?.length || 0})
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
                                              <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569" }}>Observación del Inspector</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody sx={{ bgcolor: "#ffffff" }}>
                                            {row.unidadesObservadas && row.unidadesObservadas.length > 0 ? (
                                              row.unidadesObservadas.map((u, uIdx) => (
                                                <TableRow key={uIdx} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                                                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#dc2626" }}>
                                                    {u.marca}
                                                  </TableCell>
                                                  <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>
                                                    {u.modelo}
                                                  </TableCell>
                                                  <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>
                                                    {u.serie}
                                                  </TableCell>
                                                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#dc2626" }}>
                                                    {u.condicion}
                                                  </TableCell>
                                                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#dc2626" }}>
                                                    {u.anoFab}
                                                  </TableCell>
                                                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#dc2626" }}>
                                                    {u.tipoRevelado}
                                                  </TableCell>
                                                  <TableCell sx={{ fontSize: "0.75rem", color: "#475569" }}>
                                                    {u.obsInspector}
                                                  </TableCell>
                                                </TableRow>
                                              ))
                                            ) : (
                                              <TableRow>
                                                <TableCell colSpan={7} align="center" sx={{ py: 2, color: "#94a3b8", fontStyle: "italic", fontSize: "0.78rem" }}>
                                                  Sin unidades observadas
                                                </TableCell>
                                              </TableRow>
                                            )}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    </Paper>

                                    {/* BLOQUE: UNIDADES A AGREGAR (FOTO 3) */}
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
                                          UNIDADES A AGREGAR ({unidadesAgregar?.length || 0})
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
                                              <TableCell align="center" sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#475569", width: 90 }}>Acciones</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody sx={{ bgcolor: "#ffffff" }}>
                                            {unidadesAgregar?.length === 0 ? (
                                              <TableRow sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                                                <TableCell colSpan={6} sx={{ fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>
                                                  Pendiente de carga
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1 }}>
                                                  <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                      setAddUnitModal({
                                                        open: true,
                                                        editIndex: null,
                                                        marca: "",
                                                        modelo: "",
                                                        serie: "",
                                                        condicion: "Propio",
                                                        anoFab: "",
                                                        tipoRevelado: "DIGITAL",
                                                      })
                                                    }
                                                    sx={{
                                                      color: "#005596",
                                                      bgcolor: "#e0f2fe",
                                                      border: "1px solid #bae6fd",
                                                      "&:hover": { bgcolor: "#bae6fd" },
                                                      width: 26,
                                                      height: 26,
                                                    }}
                                                  >
                                                    <AddIcon sx={{ fontSize: 16 }} />
                                                  </IconButton>
                                                </TableCell>
                                              </TableRow>
                                            ) : (
                                              <>
                                                {unidadesAgregar.map((u, uIdx) => (
                                                  <TableRow key={uIdx} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#1e293b" }}>{u.marca}</TableCell>
                                                    <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>{u.modelo}</TableCell>
                                                    <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>{u.serie}</TableCell>
                                                    <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>{u.condicion}</TableCell>
                                                    <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>{u.anoFab}</TableCell>
                                                    <TableCell sx={{ fontSize: "0.75rem", color: "#334155" }}>{u.tipoRevelado}</TableCell>
                                                    <TableCell align="center" sx={{ py: 0.8 }}>
                                                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                                                        <IconButton
                                                          size="small"
                                                          onClick={() => handleEditUnit(u, uIdx)}
                                                          sx={{ color: "#0284c7", p: 0.5 }}
                                                        >
                                                          <EditIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                        <IconButton
                                                          size="small"
                                                          onClick={() => handleDeleteUnit(uIdx)}
                                                          sx={{ color: "#ef4444", p: 0.5 }}
                                                        >
                                                          <DeleteIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                      </Box>
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                                <TableRow sx={{ bgcolor: "#fafafa" }}>
                                                  <TableCell colSpan={6} sx={{ fontSize: "0.72rem", color: "#64748b", fontStyle: "italic", py: 1 }}>
                                                    Agregar otra unidad rectificatoria
                                                  </TableCell>
                                                  <TableCell align="center" sx={{ py: 1 }}>
                                                    <IconButton
                                                      size="small"
                                                      onClick={() =>
                                                        setAddUnitModal({
                                                          open: true,
                                                          editIndex: null,
                                                          marca: "",
                                                          modelo: "",
                                                          serie: "",
                                                          condicion: "Propio",
                                                          anoFab: "",
                                                          tipoRevelado: "DIGITAL",
                                                        })
                                                      }
                                                      sx={{
                                                        color: "#005596",
                                                        bgcolor: "#e0f2fe",
                                                        border: "1px solid #bae6fd",
                                                        "&:hover": { bgcolor: "#bae6fd" },
                                                        width: 26,
                                                        height: 26,
                                                      }}
                                                    >
                                                      <AddIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                  </TableCell>
                                                </TableRow>
                                              </>
                                            )}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    </Paper>


                                  </Box>
                                </Collapse>
                              )}
                            </Box>
                          );
                        })}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* CONCLUSIÓN GENERAL DE LA INSPECCIÓN (FOTO 2) */}
          <Box sx={{ mt: 3, pt: 1 }}>
            <Typography
              sx={{
                fontWeight: 850,
                color: "#1e293b",
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 1.2,
              }}
            >
              CONCLUSIÓN GENERAL DE LA INSPECCIÓN
            </Typography>
            <Box
              sx={{
                bgcolor: "#fffbeb",
                border: "1.5px solid #fef08a",
                borderRadius: "10px",
                p: 2,
                color: "#b45309",
                fontWeight: 700,
                fontSize: "0.86rem",
              }}
            >
              {radiofisicaActa1.conclusionGeneral}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* FOOTER BAR: BOTONES VOLVER, GUARDAR Y ENVIAR (FOTO 1) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #e2e8f0",
          pt: 3,
          mt: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate("/efector/alertas")}
          startIcon={<ArrowBackIcon />}
          sx={{
            fontWeight: 800,
            borderRadius: "6px",
            px: 3,
            py: 0.8,
            color: "#0080c8",
            borderColor: "#0080c8",
            textTransform: "none",
            fontSize: "0.88rem",
            "&:hover": { borderColor: "#006bb0", bgcolor: "rgba(0, 128, 200, 0.04)" },
          }}
        >
          Volver
        </Button>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={handleGuardarBorrador}
            startIcon={<SaveIcon />}
            sx={{
              fontWeight: 800,
              borderRadius: "6px",
              px: 3,
              py: 0.8,
              color: "#64748b",
              borderColor: "#cbd5e1",
              textTransform: "uppercase",
              fontSize: "0.82rem",
              letterSpacing: 0.5,
              "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
            }}
          >
            GUARDAR
          </Button>

          <Button
            variant="contained"
            onClick={() => setOpenConfirm(true)}
            endIcon={<SendIcon />}
            sx={{
              fontWeight: 800,
              borderRadius: "6px",
              px: 3.5,
              py: 0.8,
              bgcolor: "#005596",
              textTransform: "none",
              fontSize: "0.88rem",
              boxShadow: "none",
              "&:hover": { bgcolor: "#00447a", boxShadow: "none" },
            }}
          >
            Enviar
          </Button>
        </Stack>
      </Box>

      {/* DIALOG PARA SUBIR EVIDENCIA DE RESPUESTA EMPLAZAMIENTO */}
      <Dialog
        open={uploadModal.open}
        onClose={() => setUploadModal({ open: false, item: null, text: "", file: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: "#005596", color: "white", fontWeight: 850, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Cargar Evidencia para Respuesta Emplazamiento</span>
          <IconButton size="small" onClick={() => setUploadModal({ open: false, item: null, text: "", file: null })} sx={{ color: "white" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {uploadModal.item && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem", mb: 0.5 }}>
                  {uploadModal.item.elemento}
                </Typography>
                <Typography sx={{ color: "#ef4444", fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ErrorIcon sx={{ fontSize: 16 }} /> {uploadModal.item.obs}
                </Typography>
              </Paper>

              <Box>
                <Typography sx={{ fontWeight: 750, color: "#334155", fontSize: "0.82rem", mb: 0.5 }}>
                  Aclaración o Respuesta Emplazamiento:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Detalle las acciones correctivas, especificaciones técnicas o reemplazos efectuados..."
                  value={uploadModal.text}
                  onChange={(e) => setUploadModal((prev) => ({ ...prev, text: e.target.value }))}
                  size="small"
                />
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 750, color: "#334155", fontSize: "0.82rem", mb: 0.8 }}>
                  Adjuntar archivo probatorio (PDF, JPG, PNG):
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  sx={{
                    fontWeight: 750,
                    textTransform: "none",
                    borderRadius: 2,
                    borderColor: "#cbd5e1",
                    color: "#334155",
                    "&:hover": { borderColor: "#005596" },
                  }}
                >
                  {uploadModal.file || "Seleccionar documento / foto"}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadModal((prev) => ({ ...prev, file: e.target.files[0].name }));
                      }
                    }}
                  />
                </Button>
                {uploadModal.file && (
                  <Typography sx={{ mt: 0.5, fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>
                    Archivo seleccionado: {uploadModal.file}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setUploadModal({ open: false, item: null, text: "", file: null })} sx={{ fontWeight: 750, color: "#64748b" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUpload}
            sx={{
              fontWeight: 850,
              bgcolor: "#005596",
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { bgcolor: "#00447a" },
            }}
          >
            Guardar Respuesta Emplazamiento
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG PARA AGREGAR / EDITAR UNIDAD */}
      <Dialog
        open={addUnitModal.open}
        onClose={() => setAddUnitModal({ open: false, editIndex: null, marca: "", modelo: "", serie: "", condicion: "Tercerizado", pmDeclarado: "", pmObservado: "-" })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: "#005596", color: "white", fontWeight: 850, py: 2 }}>
          {addUnitModal.editIndex !== null ? "Editar Unidad a Agregar" : "Cargar Unidad a Agregar"}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Marca"
              value={addUnitModal.marca}
              onChange={(e) => setAddUnitModal((prev) => ({ ...prev, marca: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Modelo"
              value={addUnitModal.modelo}
              onChange={(e) => setAddUnitModal((prev) => ({ ...prev, modelo: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Serie"
              value={addUnitModal.serie}
              onChange={(e) => setAddUnitModal((prev) => ({ ...prev, serie: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Condición"
              value={addUnitModal.condicion}
              onChange={(e) => setAddUnitModal((prev) => ({ ...prev, condicion: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Año Fabricación"
              value={addUnitModal.anoFab}
              onChange={(e) => setAddUnitModal((prev) => ({ ...prev, anoFab: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Tipo Revelado"
              value={addUnitModal.tipoRevelado}
              onChange={(e) => setAddUnitModal((prev) => ({ ...prev, tipoRevelado: e.target.value }))}
              size="small"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() =>
              setAddUnitModal({
                open: false,
                editIndex: null,
                marca: "SIEMENS",
                modelo: "Multix Impact",
                serie: "SN-684291-DE",
                condicion: "Propio",
                anoFab: "2022",
                tipoRevelado: "DIGITAL",
              })
            }
          >
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveAddUnit} sx={{ bgcolor: "#005596", fontWeight: 800 }}>
            Guardar Unidad
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE CONFIRMACIÓN - DECLARACIÓN JURADA */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <DialogTitle sx={{ bgcolor: "#005596", color: "white", fontWeight: 900, py: 2 }}>
          Confirmar envío de respuestas emplazamiento
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography sx={{ mb: 3, fontWeight: 700, color: "#334155" }}>
            Está a punto de enviar sus respuestas emplazamiento al inspector. Al hacerlo confirma que:
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <ErrorIcon sx={{ color: "#ef4444", mt: 0.3 }} />
              <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                Las respuestas emplazamiento por irregularidades <b>NO modifican el trámite automáticamente</b>. Dicha evidencia será evaluada por el inspector actuante y quedará sujeta a la re-inspección o dictamen técnico.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <InfoIcon sx={{ color: "#f59e0b", mt: 0.3 }} />
              <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                Las respuestas emplazamiento por documentación o blindaje <b>NO modifican el trámite automáticamente</b>. Dicha evidencia será evaluada por un inspector y quedará sujeta a una próxima inspección.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <WarningIcon sx={{ color: "#eab308", mt: 0.3 }} />
              <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                El trámite se rectificará con los valores observados y aprobados por el inspector.
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ mt: 4, fontWeight: 900, color: "#1e293b", fontSize: "0.95rem" }}>
            Este formulario tiene carácter de Declaración Jurada ¿Acepta esta Declaración Jurada?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0", justifyContent: "space-between" }}>
          <Button
            onClick={() => setOpenConfirm(false)}
            variant="contained"
            sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" }, fontWeight: 850, px: 3.5, borderRadius: 2 }}
          >
            CANCELAR
          </Button>
          <Button
            onClick={handleConfirmarEnvio}
            variant="contained"
            sx={{ bgcolor: "#005596", "&:hover": { bgcolor: "#00447a" }, fontWeight: 850, px: 4, borderRadius: 2 }}
          >
            ACEPTAR
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL PARA VER ACTA (COPIA INSPECTOR RADIOFÍSICA) */}
      <Dialog
        open={openActaPopup}
        onClose={() => setOpenActaPopup(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { borderRadius: 3, height: "90vh" } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#005596", color: "white" }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>VISTA PREVIA: ACTA DE INSPECCIÓN RADIOFÍSICA</Typography>
          <Button onClick={() => setOpenActaPopup(false)} color="inherit">Cerrar</Button>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: "#f8fafc" }}>
          <PantallaInspeccion
            serviciosEfector={["RAYOS X"]}
            infraEfector={{ "SALAS DE RAYOS X": 1, "PANELES PLOMADOS": 2 }}
            rrhhEfector={[
              { especialidad: "TÉCNICO RADIÓLOGO", cantidadCargada: 3, origen: "RAYOS X" },
              { especialidad: "RESPONSABLE DE USO", cantidadCargada: 1, origen: "RADIOFÍSICA" },
            ]}
            equiposEfector={[
              { equipamiento: "TUBO Y GENERADOR DE RAYOS X", actualQty: 1, origen: "SALA 1" },
              { equipamiento: "DELANTALES PLOMADOS", actualQty: 4, origen: "SALA 1" },
            ]}
            tipologia="RADIOFÍSICA"
            directorTecnico={{ nombre: "MARTÍN", apellido: "BENÍTEZ", dni: "28.456.789" }}
          />
        </DialogContent>
      </Dialog>

      {/* VISOR DE FOTOS */}
      <Dialog open={!!viewerPhoto} onClose={() => setViewerPhoto(null)} maxWidth="lg">
        <Box sx={{ position: "relative", bgcolor: "black", p: 1 }}>
          <Button onClick={() => setViewerPhoto(null)} sx={{ position: "absolute", top: 10, right: 10, color: "white", zIndex: 10 }}>
            Cerrar
          </Button>
          <img src={viewerPhoto} alt="Visor" style={{ maxWidth: "100%", maxHeight: "80vh", display: "block", margin: "auto" }} />
        </Box>
      </Dialog>

      {/* SNACKBAR NOTIFICACIONES */}
      <Snackbar
        open={!!snackbarMsg}
        autoHideDuration={3500}
        onClose={() => setSnackbarMsg("")}
        message={snackbarMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default RectificacionTramite;
