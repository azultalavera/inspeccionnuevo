import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  Button,
  Stack,
  Chip,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
} from "@mui/material";
import {
  Map as MapIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  Groups as GroupsIcon,
  AccountTree as AccountTreeIcon,
  HomeRepairService as HomeRepairServiceIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBackIos as ArrowBackIosIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

import { useApp } from "../../context/AppContext";
import { DEFAULT_EFECTOR_DATA } from "../../data/masterConfig";
import ServicesStep from "./steps/ServicesStep";
import RRHHStep from "./steps/RRHHStep";
import JefeServicioStep from "./steps/JefeServicioStep";
import Equipamientos from "./steps/Equipamientos";
import FileViewerModal from "../inspeccion/inspector/components/FileViewerModal";

// --- ESTILOS STEPPER PROTOTIPO ORIGINAL ---
const QontoConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#29b6f6",
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

const StepIconRoot = styled("div")(({ ownerState }) => ({
  backgroundColor: ownerState.active ? "#005596" : "#29b6f6",
  zIndex: 1,
  color: "#fff",
  width: 45,
  height: 45,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  transition: "0.3s",
  cursor: "pointer",
  "&:hover": { transform: "scale(1.1)", backgroundColor: "#005596" },
}));

function StepIconCustom(props) {
  const { active, completed, icon, onClick } = props;
  const icons = {
    1: <MapIcon />,
    2: <BusinessIcon />,
    3: <PersonIcon />,
    4: <MedicalServicesIcon />,
    5: <GroupsIcon />,
    6: <AccountTreeIcon />,
    7: <HomeRepairServiceIcon />,
    8: <CloudUploadIcon />,
  };
  return (
    <StepIconRoot ownerState={{ active, completed }} onClick={onClick}>
      {icons[String(icon)]}
    </StepIconRoot>
  );
}

const STEPS = [
  { label: "Arquitectura", path: "arquitectura", icon: 1 },
  { label: "Establecimiento", path: "establecimiento", icon: 2 },
  { label: "Director Técnico", path: "director", icon: 3 },
  { label: "Servicios", path: "servicios", icon: 4 },
  { label: "Recursos Humanos", path: "rrhh", icon: 5 },
  { label: "Jefe de Servicio", path: "jefes", icon: 6 },
  { label: "Equipamientos", path: "equipamientos", icon: 7 },
  { label: "Documentos", path: "documentos", icon: 8 },
];

export default function VerTramitePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tramites } = useApp();

  const tramite = tramites.find((t) => t.id === id) || {
    id: id || "TRM-001",
    nroTramite: "2026-HAB-000101",
    nroExpediente: "170-2026",
    denominacion: "Clínica Privada San Jerónimo",
    cuit: "30-71554433-2",
    tipologia: "CLÍNICAS, SANATORIOS Y HOSPITALES",
    domicilio: "Av. Colón 2800",
    localidad: "Córdoba",
    departamento: "Capital",
    estado: "ACEPTADO_DOC_AUD",
    tipoTramite: "HABILITACION",
    tipoInspeccion: "HABILITACION",
  };

  const [activeStep, setActiveStep] = useState(0);
  const [viewerFile, setViewerFile] = useState(null);

  // Estados de datos declarados del efector (inicializados con mock / master)
  const selectedServices = useMemo(() => {
    const obj = {};
    DEFAULT_EFECTOR_DATA.servicios.forEach((s) => {
      obj[s] = { thirdParty: false };
    });
    return obj;
  }, []);

  const infraSelection = useMemo(() => {
    return DEFAULT_EFECTOR_DATA.infraestructura;
  }, []);

  const rrhhCargado = useMemo(() => {
    return DEFAULT_EFECTOR_DATA.rrhh;
  }, []);

  const jefesCargados = useMemo(() => {
    return DEFAULT_EFECTOR_DATA.jefes.map((j) => ({
      id: j.id,
      servicio: j.origen,
      especialidad: j.especialidad,
      nombre: j.nombre,
      cuil: "20-12345678-9",
      matricula: "MP-1234",
    }));
  }, []);

  const equiposCargados = useMemo(() => {
    return DEFAULT_EFECTOR_DATA.equipamientos.map((e) => ({
      id: e.id,
      origen: e.origen,
      equipamiento: e.equipamiento,
      marca: "Siemens / Philips",
      modelo: "MD-2026",
      serie: `SN-${e.id}09485`,
    }));
  }, []);

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const backPath = "/inspector/inspeccion-tipo/habilitacion";

  return (
    <Box sx={{ bgcolor: "#f1f5f9", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      {/* Botón superior de regreso y badge de solo lectura */}
      <Box sx={{ maxWidth: "1600px", mx: "auto", mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          onClick={() => navigate(backPath)}
          startIcon={<CancelIcon sx={{ fontSize: 18 }} />}
          sx={{
            background: "#FFFFFF",
            color: "#005596",
            border: "1.5px solid #005596",
            borderRadius: 2,
            px: 2.5,
            py: 0.8,
            fontSize: "0.85rem",
            fontWeight: 800,
            textTransform: "none",
            "&:hover": { bgcolor: "#f0f9ff", borderColor: "#003b66" },
          }}
        >
          Volver a Bandeja de Inspección
        </Button>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<LockIcon sx={{ fontSize: "14px !important", color: "#92400e !important" }} />}
            label="MODO CONSULTA (SOLO LECTURA - DESHABILITADO PARA EDICIÓN)"
            size="small"
            sx={{
              fontWeight: 900,
              bgcolor: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fde68a",
              height: 28,
              px: 0.5,
            }}
          />
          <Chip
            label={`Trámite: ${tramite.nroTramite}`}
            size="small"
            sx={{ fontWeight: 800, bgcolor: "#ffffff", color: "#1e293b", border: "1px solid #cbd5e1", height: 28 }}
          />
          <Chip
            label="ACEPTADO DOC. AUDITORÍA"
            size="small"
            color="success"
            sx={{ fontWeight: 850, height: 28 }}
          />
        </Stack>
      </Box>

      {/* Tarjeta Principal del Trámite idéntica al prototipo */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: "8px",
          overflow: "hidden",
          mb: 2,
          mx: "auto",
          maxWidth: "1600px",
          backgroundColor: "white",
        }}
      >
        {/* Banner Azul Superior */}
        <Box
          sx={{
            backgroundColor: "#005596",
            color: "white",
            py: 2.5,
            px: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
            Expediente N° {tramite.nroExpediente || "170-2026"} | Habilitación
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, opacity: 0.95, mt: 0.5, textTransform: "uppercase", letterSpacing: 1.5 }}
          >
            {STEPS[activeStep].label}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
            {tramite.denominacion} — {tramite.tipologia}
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: "white" }}>
          {/* Stepper con íconos originales */}
          <Box sx={{ mb: 5 }}>
            <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
              {STEPS.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={(props) => (
                      <StepIconCustom {...props} icon={step.icon} onClick={() => setActiveStep(index)} />
                    )}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: activeStep === index ? "900" : "bold",
                        color: activeStep === index ? "#005596" : "#333",
                        display: "block",
                        mt: 1,
                        fontSize: "0.8rem",
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* CONTENIDO ESPECÍFICO DE CADA PASO */}
          <Box sx={{ minHeight: "450px" }}>
            {/* PASO 0: ARQUITECTURA */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" color="#005596" mb={2} fontWeight="bold">
                  Documentación y Planos de Arquitectura
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 850 }}>TIPO DE PLANO</TableCell>
                        <TableCell sx={{ fontWeight: 850 }}>ARCHIVO DECLARADO</TableCell>
                        <TableCell sx={{ fontWeight: 850 }}>FECHA DE CARGA</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 850 }}>ESTADO</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 850 }}>ACCIONES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { id: "p1", tipo: "Plano General de Edificación y Distribución", file: "plano_general_sanatorio.pdf", fecha: "15/08/2026" },
                        { id: "p2", tipo: "Plano de Evacuación y Seguridad contra Incendio", file: "plano_evacuacion_bomberos.pdf", fecha: "15/08/2026" },
                        { id: "p3", tipo: "Protocolo de Instalación Eléctrica", file: "protocolo_electrico_colegiado.pdf", fecha: "15/08/2026" },
                        { id: "p4", tipo: "Certificado de Puesta a Tierra (PAT)", file: "medicion_pat_2026.pdf", fecha: "15/08/2026" },
                      ].map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ fontWeight: 750 }}>{row.tipo}</TableCell>
                          <TableCell sx={{ color: "#005596", fontWeight: 600 }}>{row.file}</TableCell>
                          <TableCell>{row.fecha}</TableCell>
                          <TableCell align="center">
                            <Chip label="APROBADO ARQ." size="small" color="success" sx={{ fontWeight: 800, fontSize: "0.65rem" }} />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => setViewerFile({ name: row.file, url: "/src/assets/archivos/planos/plano1.pdf" })}
                              sx={{ textTransform: "none", fontWeight: 800 }}
                            >
                              Ver Plano
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* PASO 1: ESTABLECIMIENTO */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" color="#005596" mb={2} fontWeight="bold">
                  Datos del Establecimiento
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      disabled
                      label="Denominación o Nombre de Fantasía"
                      value={tramite.denominacion}
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      disabled
                      label="CUIT"
                      value={tramite.cuit}
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Tipología Sanitaria"
                      value={tramite.tipologia}
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Domicilio Real (Calle y Número)"
                      value={tramite.domicilio}
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      disabled
                      label="Localidad"
                      value={tramite.localidad}
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      disabled
                      label="Departamento"
                      value={tramite.departamento}
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      disabled
                      label="Teléfono"
                      value="0351-4567890"
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* PASO 2: DIRECTOR TÉCNICO */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" color="#005596" mb={2} fontWeight="bold">
                  Datos del Director Técnico
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Nombre y Apellido"
                      value={`${DEFAULT_EFECTOR_DATA.directorTecnico.nombre} ${DEFAULT_EFECTOR_DATA.directorTecnico.apellido}`}
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      disabled
                      label="DNI"
                      value={DEFAULT_EFECTOR_DATA.directorTecnico.dni}
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      disabled
                      label="Matrícula Profesional"
                      value={DEFAULT_EFECTOR_DATA.directorTecnico.matricula}
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Especialidad"
                      value="Clínica Médica / Terapia Intensiva Adultos"
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Carga Horaria"
                      value="35 Horas Semanales"
                      sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#1e293b", fontWeight: 700 } }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* PASO 3: SERVICIOS (COMPONENTE ORIGINAL CON READONLY) */}
            {activeStep === 3 && (
              <Box>
                <ServicesStep
                  selectedServices={selectedServices}
                  setSelectedServices={() => {}}
                  infraSelection={infraSelection}
                  setInfraSelection={() => {}}
                  onValidationChange={() => {}}
                  readOnly={true}
                />
              </Box>
            )}

            {/* PASO 4: RECURSOS HUMANOS (COMPONENTE ORIGINAL CON READONLY) */}
            {activeStep === 4 && (
              <Box>
                <RRHHStep
                  selectedServices={selectedServices}
                  rrhhCargado={rrhhCargado}
                  setRrhhCargado={() => {}}
                  onValidationSuccess={() => {}}
                  readOnly={true}
                />
              </Box>
            )}

            {/* PASO 5: JEFE DE SERVICIO (COMPONENTE ORIGINAL CON READONLY) */}
            {activeStep === 5 && (
              <Box>
                <JefeServicioStep
                  selectedServices={selectedServices}
                  cargados={jefesCargados}
                  setCargados={() => {}}
                  readOnly={true}
                />
              </Box>
            )}

            {/* PASO 6: EQUIPAMIENTOS (COMPONENTE ORIGINAL CON READONLY) */}
            {activeStep === 6 && (
              <Box>
                <Equipamientos
                  selectedServices={selectedServices}
                  infraSelection={infraSelection}
                  equiposCargados={equiposCargados}
                  setEquiposCargados={() => {}}
                  onValidationChange={() => {}}
                  readOnly={true}
                />
              </Box>
            )}

            {/* PASO 7: DOCUMENTOS */}
            {activeStep === 7 && (
              <Box>
                <Typography variant="h6" color="#005596" mb={2} fontWeight="bold">
                  Documentación Adjunta
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 850 }}>DOCUMENTO</TableCell>
                        <TableCell sx={{ fontWeight: 850 }}>ARCHIVO DECLARADO</TableCell>
                        <TableCell sx={{ fontWeight: 850 }}>VENCIMIENTO</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 850 }}>ACCIONES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { id: "d1", req: "Estatuto Social / Contrato de Constitución", file: "estatuto_social.pdf", venc: "Sin Vto." },
                        { id: "d2", req: "Título de Propiedad o Contrato de Locación", file: "escritura_inmueble.pdf", venc: "Sin Vto." },
                        { id: "d3", req: "Póliza de Seguro de Responsabilidad Civil (Mala Praxis)", file: "poliza_seguro_2026.pdf", venc: "31/12/2026" },
                        { id: "d4", req: "Contrato con Empresa de Residuos Patógenos", file: "contrato_residuos.pdf", venc: "30/11/2026" },
                        { id: "d5", req: "Certificado de Habilitación de Bomberos", file: "certificado_bomberos.pdf", venc: "15/09/2026" },
                      ].map((doc) => (
                        <TableRow key={doc.id} hover>
                          <TableCell sx={{ fontWeight: 750 }}>{doc.req}</TableCell>
                          <TableCell sx={{ color: "#005596", fontWeight: 600 }}>{doc.file}</TableCell>
                          <TableCell>{doc.venc}</TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => setViewerFile({ name: doc.file, url: "/src/assets/archivos/planos/plano1.pdf" })}
                              sx={{ textTransform: "none", fontWeight: 800 }}
                            >
                              Ver PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>

          {/* BOTONERA INFERIOR IDÉNTICA AL PROTOTIPO */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => navigate(backPath)}
              sx={{ fontWeight: "bold" }}
            >
              VOLVER A BANDEJA
            </Button>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIosIcon />}
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{ fontWeight: "bold" }}
              >
                ANTERIOR
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                disabled={true}
                sx={{ fontWeight: "bold" }}
              >
                GUARDAR
              </Button>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleNext}
                disabled={activeStep === STEPS.length - 1}
                sx={{ backgroundColor: "#29b6f6", fontWeight: "bold", "&:hover": { backgroundColor: "#0288d1" } }}
              >
                SIGUIENTE
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Modal de Previsualización de Archivos */}
      <FileViewerModal file={viewerFile} onClose={() => setViewerFile(null)} />
    </Box>
  );
}
