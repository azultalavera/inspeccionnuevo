import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
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
  Grid,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  Chat as ChatIcon,
  ArrowBack as ArrowBackIcon,
  ReportProblem as ReportProblemIcon,
  LocalHospital as LocalHospitalIcon,
  Description as DescriptionIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PhotoCamera,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PantallaInspeccion from "../inspeccion/inspector/PantallaInspeccion";
import ReporteInspeccionPDF from "../../ReporteInspeccion.pdf";

const RectificacionTramite = () => {
  const navigate = useNavigate();
  const [acta, setActa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openActaPopup, setOpenActaPopup] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState(null);
  const [photoPage, setPhotoPage] = useState(1);
  const [generalObsText, setGeneralObsText] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800", 
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800", 
    "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800", 
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800", 
    "https://images.unsplash.com/photo-1504813184591-015556152144?w=800", 
    "https://images.unsplash.com/photo-1551076805-e1869f363f9d?w=800", 
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800", 
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800", 
  ]);

  const handleAddPhoto = () => {
    const mockPhotos = [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
      "https://images.unsplash.com/photo-1583912267670-65355b6dbafb?w=800",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800"
    ];
    const randomImg = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    setUploadedPhotos(prev => [...prev, randomImg]);
  };

  const handleDeletePhoto = (idx) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== idx));
    const newTotal = uploadedPhotos.length - 1;
    const newPages = Math.ceil(newTotal / 5) || 1;
    if (photoPage > newPages) {
      setPhotoPage(newPages);
    }
  };

  // Datos hardcodeados para ACTA 1 (Baseline) Categorizados
  const acta1Data = {
    generales: {
      "DATOS DEL ESTABLECIMIENTO Y DE LA INSPECCION": [],
      "REGISTROS": [
        { id: "L-Quejas", elemento: "Libro de Quejas", tipo: "irregularidad", obs: "Falta libro de quejas foliado." }
      ],
      "REVISION": [],
      "DATOS": [],
      "RADIOFÍSICA": [
        { id: "R-Blind", elemento: "Radiofísica: Blindaje", tipo: "irregularidad", obs: "Falta blindaje en puerta de Rayos X." },
        { id: "R-Dosim", elemento: "Radiofísica: Dosimetría", tipo: "irregularidad", obs: "Registros de dosimetría de personal incompletos." },
        { id: "R-Senal", elemento: "Radiofísica: Señalética", tipo: "irregularidad", obs: "Falta luz roja de advertencia exterior." }
      ],
      "SECTOR DE INTERNACION CUMPLE Y AREA DE RESIDUOS": [],
      "LABORATORIO": []
    },
    tramite: {
      "ARQUITECTURA": [
        { id: "P-Evac", elemento: "Plan de Evacuación", tipo: "irregularidad", obs: "Fecha de vencimiento operada el 10/03/2026." },
        { id: "P-PlanoEdif", elemento: "Plano de Edificación y Distribución", tipo: "irregularidad", obs: "El plano de edificación no coincide con la distribución actual.", photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800" },
        { id: "P-Electrico", elemento: "Certificado de Instalación Eléctrica", tipo: "irregularidad", obs: "Falta firma o matrícula del profesional en el protocolo." }
      ],
      "SERVICIOS": [
        { id: "Quir", elemento: "Quirófanos", declarado: 6, observado: 5, tipo: "rectificacion", obs: "No se constatan 6 quirófanos en funcionamiento." },
      ],
      "SALAS Y CAMAS": [
        { id: "SC-Camas", elemento: "Camas de Terapia Intensiva", declarado: 12, observado: 10, tipo: "rectificacion", obs: "Faltan 2 unidades.", photo: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800" },
        { id: "SC-Salas", elemento: "Salas de Aislamiento", declarado: 2, observado: 1, tipo: "rectificacion", obs: "Falta acondicionar una de las salas declaradas." }
      ],
      "RRHH Y JS": [
        { id: "RH-Enf", elemento: "Enfermeros (Guardia)", declarado: 15, observado: 12, tipo: "rectificacion", obs: "Personal de enfermería insuficiente para el sector de guardia." },
        { id: "JS-Guardia", elemento: "Jefe de Servicio (Guardia)", declarado: 1, observado: 0, tipo: "rectificacion", obs: "Sin Jefe de Servicio presente ni designado en el sector." }
      ],
      "EQUIPAMIENTO": [
        { id: "EQ-Desfib", elemento: "DEA (Desfibrilador)", declarado: 5, observado: 4, tipo: "irregularidad", obs: "Falta un cardiodesfibrilador en el sector de consultorios.", photo: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800" },
        { id: "EQ-Respirador", elemento: "Respiradores de Alta Complejidad", declarado: 8, observado: 6, tipo: "rectificacion", obs: "Dos respiradores declarados están fuera de servicio." }
      ],
      "DOCUMENTOS ADJUNTOS": [
        { id: "H-Bomb", elemento: "Habilitación Bomberos", tipo: "irregularidad", obs: "Habilitación vencida en Enero 2026.", photo: "https://images.unsplash.com/photo-1599740831138-095cf07f62d8?w=800" },
        { id: "Doc-Residuos", elemento: "Contrato Residuos Patógenos", tipo: "irregularidad", obs: "Contrato vencido o sin comprobante de última recolección." },
        { id: "Doc-Seguro", elemento: "Seguro Responsabilidad Civil", tipo: "irregularidad", obs: "Póliza presentada cuenta con cobertura insuficiente." }
      ]
    }
  };

  // Datos hardcodeados para ACTA 3 (Aprobada sin observaciones o con observación general)
  const acta3Data = {
    estado: "APROBADA FINALIZADA",
    obsInspector: "Se aprueba la inspección. El establecimiento cumple con las normativas vigentes.",
    hallazgos: []
  };

  useEffect(() => {
    const loadData = () => {
      const storedActa = localStorage.getItem("acta_inspeccion_actual");
      if (storedActa) {
        setActa(JSON.parse(storedActa));
      } else {
        const liveData = localStorage.getItem("inspector_data");
        const liveConfig = localStorage.getItem("master_config");
        const liveGenObs = localStorage.getItem("obs_datos_generales");
        const liveTraObs = localStorage.getItem("obs_datos_tramite");
        const liveManualObs = localStorage.getItem("general_obs");

        if (liveData) {
          setActa({
            id: "BORRADOR-AUTO",
            fecha: new Date().toLocaleDateString(),
            estado: "EN PROCESO",
            inspectorData: JSON.parse(liveData),
            generalObs: liveManualObs || "",
            obsDatosGenerales: liveGenObs ? JSON.parse(liveGenObs) : [],
            obsDatosTramite: liveTraObs ? JSON.parse(liveTraObs) : [],
            generalPhotos: localStorage.getItem("general_photos") ? JSON.parse(localStorage.getItem("general_photos")) : [],
            config: liveConfig ? JSON.parse(liveConfig) : null,
            isDraft: true
          });
        } else {
          setActa(null);
        }
      }
      setLoading(false);
    };

    loadData();
    const handleStorageChange = (e) => {
      if (["acta_inspeccion_actual", "inspector_data", "obs_datos_generales", "obs_datos_tramite", "general_obs"].includes(e.key)) {
        loadData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (loading) return <Typography sx={{ p: 4 }}>Cargando acta...</Typography>;

  // Lógica dinámica para ACTA 2 Categorizada
  const dataGroupsActa2 = {
    generales: {
      "DATOS DEL ESTABLECIMIENTO Y DE LA INSPECCION": [],
      "REGISTROS": [],
      "REVISION": [],
      "DATOS": [],
      "RADIOFÍSICA": [],
      "SECTOR DE INTERNACION CUMPLE Y AREA DE RESIDUOS": [],
      "LABORATORIO": []
    },
    tramite: {
      "ARQUITECTURA": [],
      "SERVICIOS": [],
      "SALAS Y CAMAS": [],
      "RRHH Y JS": [],
      "EQUIPAMIENTO": [],
      "DOCUMENTOS ADJUNTOS": []
    }
  };

  if (acta?.inspectorData) {
    Object.entries(acta.inspectorData).forEach(([fieldId, data]) => {
      if (data.observado) {
        let category = "OTROS";
        let group = "tramite";
        
        // Mapeo simple basado en palabras clave o IDs (esto debería ser más robusto en prod)
        const idUpper = fieldId.toUpperCase();
        if (idUpper.includes("LIBRO") || idUpper.includes("REGISTRO")) category = "REGISTROS";
        else if (idUpper.includes("RADIO") || idUpper.includes("BLINDAJE")) category = "RADIOFÍSICA";
        else if (idUpper.includes("LABORATORIO")) category = "LABORATORIO";
        else if (idUpper.includes("RESIDUOS") || idUpper.includes("INTERNACION")) category = "SECTOR DE INTERNACION CUMPLE Y AREA DE RESIDUOS";
        else if (idUpper.includes("ESTABLECIMIENTO") || idUpper.includes("INSPECCION")) category = "DATOS DEL ESTABLECIMIENTO Y DE LA INSPECCION";
        else if (idUpper.includes("ARQUITECTURA") || idUpper.includes("PLANO")) category = "ARQUITECTURA";
        else if (idUpper.includes("SERVICIO")) category = "SERVICIOS";
        else if (idUpper.includes("SALA") || idUpper.includes("CAMA")) category = "SALAS Y CAMAS";
        else if (idUpper.includes("RRHH") || idUpper.includes("RESPONSABLE") || idUpper.includes("JS")) category = "RRHH Y JS";
        else if (idUpper.includes("EQUIPO") || idUpper.includes("APARATO")) category = "EQUIPAMIENTO";
        else if (idUpper.includes("DOC") || idUpper.includes("ADJUNTO")) category = "DOCUMENTOS ADJUNTOS";

        // Determinar si es general o tramite basándose en la categoría
        if (dataGroupsActa2.generales[category] !== undefined) group = "generales";
        else if (dataGroupsActa2.tramite[category] !== undefined) group = "tramite";
        else category = "SERVICIOS"; // Default for tramite

        let fieldLabel = fieldId;
        if (acta.config?.servicios) {
          acta.config.servicios.forEach(srv => {
            const field = srv.sections?.flatMap(sec => sec.fields || []).find(f => f.id === fieldId) || srv.fields?.find(f => f.id === fieldId);
            if (field) fieldLabel = field.label || field.name;
          });
        }
        
        const item = { id: fieldId, label: fieldLabel, valorObservado: data.valor, obs: data.obs };
        if (dataGroupsActa2[group][category]) {
          dataGroupsActa2[group][category].push(item);
        } else {
          dataGroupsActa2.tramite["SERVICIOS"].push(item);
        }
      }
    });
  }

  const renderActa1 = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setOpenActaPopup(true)} 
          startIcon={<AssignmentIcon />}
          sx={{ fontWeight: 900, borderRadius: 3, px: 3, textTransform: 'none', bgcolor: '#005596' }}
        >
          Ver Acta de Inspección
        </Button>
      </Box>
      <Alert severity="warning" sx={{ mb: 4, borderRadius: 3, borderLeft: '8px solid #f59e0b', fontWeight: 700 }}>
        HISTORIAL ACTA 1: Estos hallazgos corresponden a la inspección inicial. Debe adjuntar el emplazamiento para cada ítem.
      </Alert>

      <Accordion
        defaultExpanded
        sx={{
          mb: 4,
          borderRadius: '16px !important',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          '&:before': { display: 'none' },
          overflow: 'hidden'
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#0ea5e9' }} />}>
          <Typography sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.25rem', py: 1 }}>
            RESPUESTA EMPLAZAMIENTO (ACTA 1)
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 4, bgcolor: '#f8fafc' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* GRUPO DATOS GENERALES */}
            <Box>
              {Object.values(acta1Data.generales).some(items => items.length > 0) && (
                <Typography variant="overline" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1, display: 'block' }}>DATOS GENERALES</Typography>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(acta1Data.generales).map(([category, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <Accordion key={category} variant="outlined" sx={{ borderRadius: '12px !important', bgcolor: 'white' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: '0.85rem' }}>{category}</Typography>
                        <Chip label={items.length} size="small" color="error" sx={{ ml: 2, height: 20, fontWeight: 900, fontSize: '0.7rem' }} />
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        {/* Cabecera de Columnas */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f1f5f9', py: 1, px: 2, borderBottom: '1px solid #cbd5e1' }}>
                          <Typography sx={{ fontWeight: 750, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Observación / Requisito</Typography>
                          <Stack direction="row" spacing={2} sx={{ width: 220, justifyContent: 'flex-end', pr: 1 }}>
                            <Typography sx={{ fontWeight: 750, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: 90, textAlign: 'center' }}>Ver Evidencia</Typography>
                            <Typography sx={{ fontWeight: 750, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: 110, textAlign: 'center' }}>Subir Respuesta</Typography>
                          </Stack>
                        </Box>
                        {items.map((row) => (
                          <Box 
                            key={row.id} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              borderTop: '1px solid #f1f5f9', 
                              py: 2, 
                              px: 2,
                              transition: 'all 0.2s',
                              '&:hover': { 
                                bgcolor: row.tipo === 'irregularidad' ? '#fef2f2' : '#fffbeb', 
                                boxShadow: `inset 4px 0 0 ${row.tipo === 'irregularidad' ? '#ef4444' : '#f59e0b'}` 
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, pr: 2 }}>
                              {/* 1. REQUISITO */}
                              <Typography sx={{ fontWeight: 850, color: '#1e293b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                {row.elemento}
                              </Typography>

                              {/* 2. DECLARADO / OBSERVADO */}
                              {row.declarado !== undefined && (
                                <Box sx={{ display: 'flex', gap: 3, my: 0.2 }}>
                                  <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem' }}>
                                    Declarado: <span style={{ color: '#005596', fontWeight: 900 }}>{row.declarado}</span>
                                  </Typography>
                                  <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem' }}>
                                    Observado: <span style={{ color: '#c2410c', fontWeight: 900 }}>{row.observado}</span>
                                  </Typography>
                                </Box>
                              )}

                              {/* 3. ICONO + OBSERVACIÓN */}
                              {row.obs && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                                  {row.tipo === "irregularidad" ? (
                                    <ErrorIcon sx={{ color: '#ef4444', fontSize: '0.95rem' }} />
                                  ) : (
                                    <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>⚠️</span>
                                  )}
                                  <Typography 
                                    sx={{ 
                                      color: row.tipo === 'irregularidad' ? '#ef4444' : '#d97706', 
                                      fontWeight: 650, 
                                      fontSize: '0.8rem' 
                                    }}
                                  >
                                    {row.obs}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            <Stack direction="row" spacing={2} sx={{ width: 220, justifyContent: 'flex-end', alignItems: 'center' }}>
                              <Box sx={{ width: 90, display: 'flex', justifyContent: 'center' }}>
                                {row.photo ? (
                                  <Tooltip title="Ver evidencia fotográfica (Inspector)" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => setViewerPhoto(row.photo)}
                                      sx={{ color: '#0ea5e9', '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.08)' } }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>-</Typography>
                                )}
                              </Box>
                              <Box sx={{ width: 110, display: 'flex', justifyContent: 'center' }}>
                                <Button variant="outlined" size="small" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 1.5, fontSize: '0.65rem', fontWeight: 900, textTransform: 'none' }}>ADJUNTAR</Button>
                              </Box>
                            </Stack>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </Box>

            {/* GRUPO DATOS DEL TRAMITE */}
            <Box sx={{ mt: 2 }}>
              {Object.values(acta1Data.tramite).some(items => items.length > 0) && (
                <Typography variant="overline" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1, display: 'block' }}>DATOS DEL TRÁMITE</Typography>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(acta1Data.tramite).map(([category, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <Accordion key={category} variant="outlined" sx={{ borderRadius: '12px !important', bgcolor: 'white' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: '0.85rem' }}>{category}</Typography>
                        <Chip label={items.length} size="small" color="error" sx={{ ml: 2, height: 20, fontWeight: 900, fontSize: '0.7rem' }} />
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        {/* Cabecera de Columnas */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f1f5f9', py: 1, px: 2, borderBottom: '1px solid #cbd5e1' }}>
                          <Typography sx={{ fontWeight: 750, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Observación / Requisito</Typography>
                          <Stack direction="row" spacing={2} sx={{ width: 220, justifyContent: 'flex-end', pr: 1 }}>
                            <Typography sx={{ fontWeight: 750, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: 90, textAlign: 'center' }}>Ver Evidencia</Typography>
                            <Typography sx={{ fontWeight: 750, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: 110, textAlign: 'center' }}>Subir Respuesta</Typography>
                          </Stack>
                        </Box>
                        {items.map((row) => (
                          <Box 
                            key={row.id} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              borderTop: '1px solid #f1f5f9', 
                              py: 2, 
                              px: 2,
                              transition: 'all 0.2s',
                              '&:hover': { 
                                bgcolor: row.tipo === 'irregularidad' ? '#fef2f2' : '#fffbeb', 
                                boxShadow: `inset 4px 0 0 ${row.tipo === 'irregularidad' ? '#ef4444' : '#f59e0b'}` 
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, pr: 2 }}>
                              {/* 1. REQUISITO */}
                              <Typography sx={{ fontWeight: 850, color: '#1e293b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                {row.elemento}
                              </Typography>

                              {/* 2. DECLARADO / OBSERVADO */}
                              {row.declarado !== undefined && (
                                <Box sx={{ display: 'flex', gap: 3, my: 0.2 }}>
                                  <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem' }}>
                                    Declarado: <span style={{ color: '#005596', fontWeight: 900 }}>{row.declarado}</span>
                                  </Typography>
                                  <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem' }}>
                                    Observado: <span style={{ color: '#c2410c', fontWeight: 900 }}>{row.observado}</span>
                                  </Typography>
                                </Box>
                              )}

                              {/* 3. ICONO + OBSERVACIÓN */}
                              {row.obs && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                                  {row.tipo === "irregularidad" ? (
                                    <ErrorIcon sx={{ color: '#ef4444', fontSize: '0.95rem' }} />
                                  ) : (
                                    <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>⚠️</span>
                                  )}
                                  <Typography 
                                    sx={{ 
                                      color: row.tipo === 'irregularidad' ? '#ef4444' : '#d97706', 
                                      fontWeight: 650, 
                                      fontSize: '0.8rem' 
                                    }}
                                  >
                                    {row.obs}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            <Stack direction="row" spacing={2} sx={{ width: 220, justifyContent: 'flex-end', alignItems: 'center' }}>
                              <Box sx={{ width: 90, display: 'flex', justifyContent: 'center' }}>
                                {row.photo ? (
                                  <Tooltip title="Ver evidencia fotográfica (Inspector)" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => setViewerPhoto(row.photo)}
                                      sx={{ color: '#0ea5e9', '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.08)' } }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>-</Typography>
                                )}
                              </Box>
                              <Box sx={{ width: 110, display: 'flex', justifyContent: 'center' }}>
                                <Button variant="contained" size="small" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 1.5, fontSize: '0.65rem', fontWeight: 900, bgcolor: '#005596', textTransform: 'none' }}>SUBIR</Button>
                              </Box>
                            </Stack>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </Box>

            {/* SECCIÓN FINAL: CONCLUSIÓN Y FOTOS */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px dashed #cbd5e1' }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 950, color: "#1e293b", mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageIcon sx={{ color: '#0ea5e9' }} /> OBSERVACIONES GENERALES
                </Typography>
                <textarea
                  placeholder="Escriba aquí cualquier observación general sobre la inspección..."
                  value={generalObsText}
                  onChange={(e) => setGeneralObsText(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#1e293b',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#005596'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 950, color: "#1e293b", mb: 2, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhotoCamera sx={{ color: '#64748b' }} /> Evidencia Fotográfica General
                </Typography>
                
                {/* Botón Abrir Cámara */}
                <Button
                  variant="outlined"
                  onClick={handleAddPhoto}
                  startIcon={<PhotoCamera />}
                  sx={{
                    borderRadius: 3,
                    border: '1.5px solid #cbd5e1',
                    color: '#334155',
                    fontWeight: 800,
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    mb: 3,
                    '&:hover': {
                      border: '1.5px solid #005596',
                      bgcolor: 'rgba(0, 85, 150, 0.04)'
                    }
                  }}
                >
                  Abrir Cámara
                </Button>

                {uploadedPhotos.length > 0 ? (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'nowrap', overflowX: 'auto', pb: 2 }}>
                      {uploadedPhotos.slice((photoPage - 1) * 5, photoPage * 5).map((photo, i) => {
                        const actualIdx = (photoPage - 1) * 5 + i;
                        return (
                          <Box 
                            key={actualIdx} 
                            sx={{ 
                              position: 'relative', 
                              minWidth: 140, 
                              width: 140,
                              height: 100, 
                              borderRadius: 3, 
                              border: '1.5px solid #e2e8f0',
                              boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
                              overflow: 'visible',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.02)' }
                            }}
                          >
                            <img 
                              src={photo} 
                              alt={`Evidencia ${actualIdx + 1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} 
                              onClick={() => setViewerPhoto(photo)}
                            />
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Paginador */}
                    {Math.ceil(uploadedPhotos.length / 5) > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mt: 3 }}>
                        <IconButton 
                          disabled={photoPage === 1} 
                          onClick={() => setPhotoPage(prev => Math.max(prev - 1, 1))}
                          sx={{ 
                            color: '#1e293b', 
                            '&.Mui-disabled': { color: '#cbd5e1' },
                            fontSize: '1.25rem',
                            fontWeight: 900
                          }}
                        >
                          &lt;
                        </IconButton>
                        
                        {Array.from({ length: Math.ceil(uploadedPhotos.length / 5) }, (_, idx) => {
                          const pageNum = idx + 1;
                          const isActive = photoPage === pageNum;
                          return (
                            <Box
                              key={pageNum}
                              onClick={() => setPhotoPage(pageNum)}
                              sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: isActive ? '#005596' : '#cbd5e1',
                                bgcolor: isActive ? '#005596' : 'transparent',
                                color: isActive ? 'white' : '#1e293b',
                                fontWeight: 900,
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: '#005596',
                                  bgcolor: isActive ? '#005596' : '#f1f5f9'
                                }
                              }}
                            >
                              {pageNum}
                            </Box>
                          );
                        })}
                        
                        <IconButton 
                          disabled={photoPage === Math.ceil(uploadedPhotos.length / 5)} 
                          onClick={() => setPhotoPage(prev => Math.min(prev + 1, Math.ceil(uploadedPhotos.length / 5)))}
                          sx={{ 
                            color: '#1e293b', 
                            '&.Mui-disabled': { color: '#cbd5e1' },
                            fontSize: '1.25rem',
                            fontWeight: 900
                          }}
                        >
                          &gt;
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', display: 'block', mt: 1 }}>
                    No se adjuntaron fotos generales.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const renderActa2 = () => {
    const hasGenerales = Object.values(dataGroupsActa2.generales).some(items => items.length > 0);
    const hasTramite = Object.values(dataGroupsActa2.tramite).some(items => items.length > 0);

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setOpenActaPopup(true)} 
            startIcon={<AssignmentIcon />}
            sx={{ fontWeight: 900, borderRadius: 3, px: 3, textTransform: 'none', bgcolor: '#005596' }}
          >
            Ver Acta de Inspección
          </Button>
        </Box>
        <Alert severity="info" sx={{ mb: 4, borderRadius: 3, borderLeft: '8px solid #0ea5e9', fontWeight: 700 }}>
          EN TIEMPO REAL: Estas observaciones se están cargando actualmente en la tablet del inspector.
        </Alert>

        {acta?.generalObs && (
          <Paper sx={{ mb: 4, borderRadius: 4, p: 3, border: '1px solid #FFE0B2', bgcolor: '#FFF9E6', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <MessageIcon sx={{ color: '#92400e', mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 950, color: '#92400e', mb: 0.5, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Conclusión General de la Inspección
              </Typography>
              <Typography variant="body1" sx={{ color: '#92400e', fontWeight: 600, lineHeight: 1.6, fontSize: '0.95rem' }}>
                "{acta.generalObs}"
              </Typography>
            </Box>
          </Paper>
        )}

        <Accordion
          defaultExpanded
          sx={{
            mb: 4,
            borderRadius: '16px !important',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            '&:before': { display: 'none' },
            overflow: 'hidden'
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#0ea5e9' }} />}>
            <Typography sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.25rem', py: 1 }}>
              RESPUESTA EMPLAZAMIENTO (TIEMPO REAL)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 4, bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* GRUPO DATOS GENERALES (REAL-TIME) */}
              <Box>
                {Object.values(dataGroupsActa2.generales).some(items => items.length > 0) && (
                  <Typography variant="overline" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1, display: 'block' }}>DATOS GENERALES</Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(dataGroupsActa2.generales).map(([category, items]) => {
                    if (items.length === 0) return null;
                    return (
                      <Accordion key={category} variant="outlined" sx={{ borderRadius: '12px !important', bgcolor: 'white' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: '0.85rem' }}>{category}</Typography>
                          <Chip label={items.length} size="small" color="error" sx={{ ml: 2, height: 20, fontWeight: 900, fontSize: '0.7rem' }} />
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                          {items.map((item, idx) => {
                            const isIrregularidad = ["REGISTROS", "RADIOFÍSICA", "ARQUITECTURA", "DOCUMENTOS ADJUNTOS"].includes(category);
                            return (
                              <Box 
                                key={idx} 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  borderTop: '1px solid #f1f5f9', 
                                  py: 2, 
                                  px: 2,
                                  transition: 'all 0.2s',
                                  '&:hover': { 
                                    bgcolor: isIrregularidad ? '#fef2f2' : '#fffbeb', 
                                    boxShadow: `inset 4px 0 0 ${isIrregularidad ? '#ef4444' : '#f59e0b'}` 
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, pr: 2 }}>
                                  {/* 1. REQUISITO */}
                                  <Typography sx={{ fontWeight: 850, color: '#1e293b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                    {item.label}
                                  </Typography>
                                  
                                  {/* 3. ICONO + OBSERVACIÓN */}
                                  {item.obs && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                                      {isIrregularidad ? (
                                        <ErrorIcon sx={{ color: '#ef4444', fontSize: '0.95rem' }} />
                                      ) : (
                                        <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>⚠️</span>
                                      )}
                                      <Typography 
                                        sx={{ 
                                          color: isIrregularidad ? '#ef4444' : '#d97706', 
                                          fontWeight: 650, 
                                          fontSize: '0.8rem' 
                                        }}
                                      >
                                        {item.obs}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                <Chip 
                                  label={`Observado: ${item.valorObservado}`} 
                                  size="small" 
                                  color="warning" 
                                  sx={{ fontWeight: 800, height: 22, fontSize: '0.72rem' }} 
                                />
                              </Box>
                            );
                          })}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              </Box>

              {/* GRUPO DATOS DEL TRAMITE (REAL-TIME) */}
              <Box sx={{ mt: 2 }}>
                {Object.values(dataGroupsActa2.tramite).some(items => items.length > 0) && (
                  <Typography variant="overline" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1, display: 'block' }}>DATOS DEL TRÁMITE</Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(dataGroupsActa2.tramite).map(([category, items]) => {
                    if (items.length === 0) return null;
                    return (
                      <Accordion key={category} variant="outlined" sx={{ borderRadius: '12px !important', bgcolor: 'white' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: '0.85rem' }}>{category}</Typography>
                          <Chip label={items.length} size="small" color="error" sx={{ ml: 2, height: 20, fontWeight: 900, fontSize: '0.7rem' }} />
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                          {items.map((item, idx) => {
                            const isIrregularidad = ["REGISTROS", "RADIOFÍSICA", "ARQUITECTURA", "DOCUMENTOS ADJUNTOS"].includes(category);
                            return (
                              <Box 
                                key={idx} 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  borderTop: '1px solid #f1f5f9', 
                                  py: 2, 
                                  px: 2,
                                  transition: 'all 0.2s',
                                  '&:hover': { 
                                    bgcolor: isIrregularidad ? '#fef2f2' : '#fffbeb', 
                                    boxShadow: `inset 4px 0 0 ${isIrregularidad ? '#ef4444' : '#f59e0b'}` 
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, pr: 2 }}>
                                  {/* 1. REQUISITO */}
                                  <Typography sx={{ fontWeight: 850, color: '#1e293b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                    {item.label}
                                  </Typography>
                                  
                                  {/* 3. ICONO + OBSERVACIÓN */}
                                  {item.obs && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                                      {isIrregularidad ? (
                                        <ErrorIcon sx={{ color: '#ef4444', fontSize: '0.95rem' }} />
                                      ) : (
                                        <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>⚠️</span>
                                      )}
                                      <Typography 
                                        sx={{ 
                                          color: isIrregularidad ? '#ef4444' : '#d97706', 
                                          fontWeight: 650, 
                                          fontSize: '0.8rem' 
                                        }}
                                      >
                                        {item.obs}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                <Chip 
                                  label={`Observado: ${item.valorObservado}`} 
                                  size="small" 
                                  color="warning" 
                                  sx={{ fontWeight: 800, height: 22, fontSize: '0.72rem' }} 
                                />
                              </Box>
                            );
                          })}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              </Box>

              {/* SECCIÓN FINAL: CONCLUSIÓN Y FOTOS (REAL-TIME) */}
              <Box sx={{ mt: 2, pt: 3, borderTop: '1px dashed #cbd5e1' }}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#1e293b", mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MessageIcon sx={{ color: '#f59e0b' }} /> Conclusión General del Acta
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 3 }}>
                    <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{acta?.generalObs || "Aún no se ha redactado la conclusión final."}"
                    </Typography>
                  </Paper>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#1e293b", mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhotoCamera sx={{ color: '#64748b' }} /> Evidencia Fotográfica del Inspector
                  </Typography>
                  {acta?.generalPhotos?.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                      {acta.generalPhotos.map((photo, i) => (
                        <Paper key={i} variant="outlined" sx={{ minWidth: 140, height: 100, borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setViewerPhoto(photo)}>
                          <img src={photo} alt="Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay fotos registradas en tiempo real.</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {!hasGenerales && !hasTramite && (
          <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 4, border: '2px dashed #e2e8f0' }}>
             <AssignmentIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
             <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 700 }}>No hay observaciones cargadas en el Acta 2 aún.</Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderActa3 = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => window.open(ReporteInspeccionPDF, '_blank')} 
          startIcon={<DescriptionIcon />}
          sx={{ fontWeight: 900, borderRadius: 3, px: 3, textTransform: 'none' }}
        >
          Ver Reporte de Inspección (PDF)
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setOpenActaPopup(true)} 
          startIcon={<AssignmentIcon />}
          sx={{ fontWeight: 900, borderRadius: 3, px: 3, textTransform: 'none', bgcolor: '#005596' }}
        >
          Ver Acta de Inspección
        </Button>
      </Box>
      <Alert 
        severity="success" 
        icon={<CheckCircleIcon fontSize="inherit" />}
        sx={{ mb: 4, borderRadius: 3, borderLeft: '8px solid #2e7d32', fontWeight: 700 }}
      >
        <AlertTitle sx={{ fontWeight: 950 }}>{acta3Data.estado}</AlertTitle>
        El inspector ha aprobado la habilitación sin observaciones. El trámite de inspección ha sido completado exitosamente.
      </Alert>

      <Accordion
        defaultExpanded
        sx={{
          mb: 4,
          borderRadius: '16px !important',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          '&:before': { display: 'none' },
          overflow: 'hidden'
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#0ea5e9' }} />}>
          <Typography sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.25rem', py: 1 }}>
            CONCLUSIÓN FINAL DEL ACTA
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 4, bgcolor: '#f8fafc' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Box sx={{ pt: 1 }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#1e293b", mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageIcon sx={{ color: '#0ea5e9' }} /> Observación General
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 3 }}>
                  <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.6 }}>
                    "{acta3Data.obsInspector}"
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#1e293b", mb: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhotoCamera sx={{ color: '#64748b' }} /> Galería de Evidencias Consolidadas
                </Typography>
                {acta?.generalPhotos?.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                    {acta.generalPhotos.map((photo, i) => (
                      <Paper key={i} variant="outlined" sx={{ minWidth: 140, height: 100, borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setViewerPhoto(photo)}>
                        <img src={photo} alt="Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin galería de fotos generales.</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  return (
    <Box sx={{ width: "100%", p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, borderBottom: '3px solid #005596', pb: 2 }}>
        <Typography variant="h3" sx={{ color: "#005596", fontWeight: 950, letterSpacing: -2 }}>
          Emplazamientos de Inspección
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Responda a los emplazamientos de las actas registradas.
        </Typography>
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)} 
        sx={{ 
          mb: 4, 
          '& .MuiTabs-indicator': { height: 4, borderRadius: 2, bgcolor: '#005596' },
          '& .MuiTab-root': { fontWeight: 900, fontSize: '1rem', textTransform: 'none' }
        }}
      >
        <Tab label="ACTA 1" icon={<AssignmentIcon />} iconPosition="start" />
        <Tab label="ACTA 2" icon={<SettingsIcon />} iconPosition="start" />
        <Tab label="ACTA 3" icon={<CheckCircleIcon />} iconPosition="start" />
      </Tabs>

      {activeTab === 0 ? renderActa1() : (activeTab === 1 ? renderActa2() : renderActa3())}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '3px solid #e2e8f0', pt: 4, mt: 4 }}>
        <Button variant="outlined" onClick={() => navigate("/home-efector")} sx={{ fontWeight: 900, borderRadius: 3, px: 4, textTransform: 'none' }}>Volver</Button>
        <Button 
          variant="contained" 
          onClick={() => setOpenConfirm(true)}
          sx={{ bgcolor: "#059669", fontWeight: 950, px: 6, borderRadius: 3, textTransform: 'none', '&:hover': { bgcolor: '#047857' } }}
        >
          Enviar Respuestas
        </Button>
      </Box>

      {/* MODAL DE CONFIRMACIÓN - DECLARACIÓN JURADA */}
      <Dialog 
        open={openConfirm} 
        onClose={() => setOpenConfirm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ bgcolor: '#00447a', color: 'white', fontWeight: 900, py: 2 }}>
          Confirmar envío de respuestas
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography sx={{ mb: 3, fontWeight: 700, color: '#334155' }}>
            Está a punto de enviar sus respuestas al inspector. Al hacerlo confirma que:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ErrorIcon sx={{ color: '#ef4444', mt: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                Las respuestas de emplazamiento por irregularidades <b>NO modifica el trámite automáticamente</b>. Dicha evidencia será evaluada por un inspector y quedará sujeta a una próxima inspección.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <InfoIcon sx={{ color: '#f59e0b', mt: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                Las respuestas de emplazamiento por documentos observados <b>NO modifican el trámite automáticamente</b>. Dicha evidencia será evaluada por un inspector y quedará sujeta a una próxima inspección.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <WarningIcon sx={{ color: '#eab308', mt: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                El trámite se rectificará con los valores observados por el inspector.
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ mt: 4, fontWeight: 900, color: '#1e293b' }}>
            Este formulario tiene carácter de Declaración Jurada ¿Acepta esta Declaración Jurada?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setOpenConfirm(false)}
            variant="contained" 
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' }, fontWeight: 900, px: 4 }}
          >
            CANCELAR
          </Button>
          <Button 
            onClick={() => {
              setOpenConfirm(false);
              navigate("/home-efector");
            }}
            variant="contained" 
            sx={{ bgcolor: '#0288d1', '&:hover': { bgcolor: '#01579b' }, fontWeight: 900, px: 4 }}
          >
            ACEPTAR
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL PARA VER ACTA (COPIA DE INSPECTOR) */}
      <Dialog
        open={openActaPopup}
        onClose={() => setOpenActaPopup(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: { borderRadius: 4, height: "90vh" }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#005596', color: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 950 }}>VISTA PREVIA: ACTA DE INSPECCIÓN</Typography>
          <Button onClick={() => setOpenActaPopup(false)} color="inherit">Cerrar</Button>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
          <PantallaInspeccion 
            serviciosEfector={["GUARDIA", "QUIROFANO", "INTERNACION"]}
            infraEfector={{ "CAMAS": 12, "QUIRÓFANO": 1 }}
            rrhhEfector={[
              { especialidad: "MEDICINA GENERAL", cantidadCargada: 4, origen: "GUARDIA" },
              { especialidad: "CIRUGIA", cantidadCargada: 2, origen: "QUIROFANO" }
            ]}
            equiposEfector={[
              { equipamiento: "DESFIBRILADOR", actualQty: 1, origen: "GUARDIA" },
              { equipamiento: "MESA DE CIRUGIA", actualQty: 1, origen: "QUIROFANO" }
            ]}
            tipologia="CLÍNICAS, SANATORIOS Y HOSPITALES"
            directorTecnico={{ nombre: "JUAN", apellido: "PÉREZ", dni: "20.123.456" }}
          />
        </DialogContent>
      </Dialog>

      {/* VISOR DE FOTOS */}
      <Dialog open={!!viewerPhoto} onClose={() => setViewerPhoto(null)} maxWidth="lg">
        <Box sx={{ position: 'relative', bgcolor: 'black', p: 1 }}>
          <Button onClick={() => setViewerPhoto(null)} sx={{ position: 'absolute', top: 10, right: 10, color: 'white', zIndex: 10 }}>Cerrar</Button>
          <img src={viewerPhoto} alt="Visor" style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', margin: 'auto' }} />
        </Box>
      </Dialog>
    </Box>
  );
};

export default RectificacionTramite;
