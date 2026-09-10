import React, { useState, useMemo, useEffect } from "react";
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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

import { useApp } from "../context/AppContext";
import { DEFAULT_EFECTOR_DATA } from "../data/masterConfig";
import ServicesStep from "../components/efector/steps/ServicesStep";
import RRHHStep from "../components/efector/steps/RRHHStep";
import JefeServicioStep from "../components/efector/steps/JefeServicioStep";
import Equipamientos from "../components/efector/steps/Equipamientos";
import FileViewerModal from "../components/inspeccion/inspector/components/FileViewerModal";

// ─── Estilos Stepper Conectado Qonto ──────────────────────────────────────────
const QontoConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#29b6f6",
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

const StepIconRoot = styled("div")<{ ownerState: { active?: boolean; completed?: boolean } }>(
  ({ ownerState }) => ({
    backgroundColor: ownerState.active ? "#005596" : "#29b6f6",
    zIndex: 1,
    color: "#fff",
    width: 44,
    height: 44,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    transition: "0.3s",
    boxShadow: ownerState.active ? "0 4px 14px rgba(0, 85, 150, 0.4)" : "none",
    "&:hover": { transform: "scale(1.1)", backgroundColor: "#005596" },
    cursor: "pointer",
  })
);

function StepIconCustom(props: any) {
  const { active, completed, icon, onClick } = props;
  const icons: Record<string, React.ReactNode> = {
    1: <MapIcon sx={{ fontSize: 22 }} />,
    2: <BusinessIcon sx={{ fontSize: 22 }} />,
    3: <PersonIcon sx={{ fontSize: 22 }} />,
    4: <MedicalServicesIcon sx={{ fontSize: 22 }} />,
    5: <GroupsIcon sx={{ fontSize: 22 }} />,
    6: <AccountTreeIcon sx={{ fontSize: 22 }} />,
    7: <HomeRepairServiceIcon sx={{ fontSize: 22 }} />,
    8: <CloudUploadIcon sx={{ fontSize: 22 }} />,
  };
  return (
    <StepIconRoot ownerState={{ active, completed }} onClick={onClick}>
      {icons[String(icon)]}
    </StepIconRoot>
  );
}

const STEPS = [
  { label: "Arquitectura", icon: 1 },
  { label: "Establecimiento", icon: 2 },
  { label: "Director Técnico", icon: 3 },
  { label: "Servicios", icon: 4 },
  { label: "Recursos Humanos", icon: 5 },
  { label: "Jefe de Servicio", icon: 6 },
  { label: "Equipamientos", icon: 7 },
  { label: "Documentos", icon: 8 },
];

export default function FormularioHabilitacion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tramites } = useApp();

  const tramite = useMemo(() => {
    return tramites.find((t) => t.id === id) || {
      id: id || "TRM-NEW",
      nroTramite: "2026-8840",
      nroExpediente: "EX-2026-0045672-APN-MS#CBA",
      denominacion: "Sanatorio Allende N.V.",
      cuit: "30-54678901-4",
      tipologia: "CLÍNICA, SANATORIO U HOSPITAL PRIVADO",
      domicilio: "Av. Rafael Núñez 4750",
      localidad: "Córdoba",
      departamento: "Capital",
      estado: "PENDIENTE_ARQUITECTURA" as const,
      tipoTramite: "HABILITACION" as const,
    };
  }, [tramites, id]);

  const [activeStep, setActiveStep] = useState(0);
  const [viewerFile, setViewerFile] = useState<{ name: string; url: string } | null>(null);

  // ─── Estados Editables del Trámite ──────────────────────────────────────────
  // Paso 0: Planos
  const [planos, setPlanos] = useState([
    { id: "p1", tipo: "Plano General de Edificación y Distribución", file: "plano_general_sanatorio.pdf", fecha: "15/08/2026" },
    { id: "p2", tipo: "Plano de Evacuación y Seguridad contra Incendio", file: "plano_evacuacion_bomberos.pdf", fecha: "15/08/2026" },
    { id: "p3", tipo: "Protocolo de Instalación Eléctrica", file: "protocolo_electrico_colegiado.pdf", fecha: "15/08/2026" },
    { id: "p4", tipo: "Certificado de Puesta a Tierra (PAT)", file: "medicion_pat_2026.pdf", fecha: "15/08/2026" },
  ]);

  // Paso 1: Establecimiento
  const [denominacion, setDenominacion] = useState(tramite.denominacion);
  const [cuit, setCuit] = useState(tramite.cuit);
  const [tipologia, setTipologia] = useState(tramite.tipologia);
  const [domicilio, setDomicilio] = useState(tramite.domicilio);
  const [localidad, setLocalidad] = useState(tramite.localidad);
  const [departamento, setDepartamento] = useState(tramite.departamento || "Capital");
  const [telefono, setTelefono] = useState("0351-4567890");

  // Paso 2: Director Técnico
  const [dtNombre, setDtNombre] = useState(`${DEFAULT_EFECTOR_DATA.directorTecnico.nombre} ${DEFAULT_EFECTOR_DATA.directorTecnico.apellido}`);
  const [dtDni, setDtDni] = useState(DEFAULT_EFECTOR_DATA.directorTecnico.dni);
  const [dtMatricula, setDtMatricula] = useState(DEFAULT_EFECTOR_DATA.directorTecnico.matricula);
  const [dtEspecialidad, setDtEspecialidad] = useState("Clínica Médica / Terapia Intensiva Adultos");
  const [dtCargaHoraria, setDtCargaHoraria] = useState("35 Horas Semanales");

  // Paso 3: Servicios
  const [selectedServices, setSelectedServices] = useState<Record<string, { thirdParty: boolean }>>(() => {
    const saved = localStorage.getItem(`efector_servicios_${tramite.id}`);
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) {
          const obj: Record<string, { thirdParty: boolean }> = {};
          arr.forEach((k: string) => { obj[k] = { thirdParty: false }; });
          return obj;
        }
      } catch (e) {}
    }
    const defaultServices: Record<string, { thirdParty: boolean }> = {};
    DEFAULT_EFECTOR_DATA.servicios.forEach((nombre) => {
      defaultServices[nombre] = { thirdParty: false };
    });
    return defaultServices;
  });

  const [infraSelection, setInfraSelection] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem(`efector_infra_${tramite.id}`);
    return saved ? JSON.parse(saved) : DEFAULT_EFECTOR_DATA.infraestructura;
  });

  // Paso 4: Recursos Humanos
  const [rrhhCargado, setRrhhCargado] = useState<any[]>(() => {
    const saved = localStorage.getItem(`efector_rrhh_${tramite.id}`);
    return saved ? JSON.parse(saved) : DEFAULT_EFECTOR_DATA.rrhh;
  });

  // Paso 5: Jefe de Servicio
  const [jefesCargados, setJefesCargados] = useState<any[]>(() => {
    const saved = localStorage.getItem(`efector_jefes_${tramite.id}`);
    return saved ? JSON.parse(saved) : DEFAULT_EFECTOR_DATA.jefes;
  });

  // Paso 6: Equipamientos
  const [equiposCargados, setEquiposCargados] = useState<any[]>(() => {
    const saved = localStorage.getItem(`efector_equipos_${tramite.id}`);
    return saved ? JSON.parse(saved) : DEFAULT_EFECTOR_DATA.equipamientos;
  });

  // Paso 7: Documentación
  const [documentos] = useState([
    { id: "d1", req: "Estatuto Social / Contrato de Constitución", file: "estatuto_social.pdf", venc: "Sin Vto." },
    { id: "d2", req: "Título de Propiedad o Contrato de Locación", file: "escritura_inmueble.pdf", venc: "Sin Vto." },
    { id: "d3", req: "Póliza de Seguro de Responsabilidad Civil (Mala Praxis)", file: "poliza_seguro_2026.pdf", venc: "31/12/2026" },
    { id: "d4", req: "Contrato con Empresa de Residuos Patógenos", file: "contrato_residuos.pdf", venc: "30/11/2026" },
    { id: "d5", req: "Certificado de Habilitación de Bomberos", file: "certificado_bomberos.pdf", venc: "15/09/2026" },
  ]);

  // Persistencia en LocalStorage
  useEffect(() => {
    if (!tramite.id) return;
    const activeServicesList = Object.keys(selectedServices).filter((k) => !!selectedServices[k]);
    localStorage.setItem(`efector_servicios_${tramite.id}`, JSON.stringify(activeServicesList));
    localStorage.setItem(`efector_infra_${tramite.id}`, JSON.stringify(infraSelection));
    localStorage.setItem(`efector_equipos_${tramite.id}`, JSON.stringify(equiposCargados));
    localStorage.setItem(`efector_rrhh_${tramite.id}`, JSON.stringify(rrhhCargado));
    localStorage.setItem(`efector_jefes_${tramite.id}`, JSON.stringify(jefesCargados));
  }, [selectedServices, infraSelection, equiposCargados, rrhhCargado, jefesCargados, tramite.id]);

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleGuardarBorrador = () => {
    alert("✓ Borrador de trámite guardado exitosamente.");
  };

  const handleFinalizarYPresentar = () => {
    alert("✓ Trámite de Habilitación presentado exitosamente ante el Ministerio de Salud. El expediente ha sido ingresado para evaluación técnica.");
    navigate("/efector/bandeja");
  };

  const handleAgregarPlano = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.dwg,.jpg,.png";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setPlanos((prev) => [
          ...prev,
          {
            id: `p${Date.now()}`,
            tipo: "Plano Complementario / Memoria Descriptiva",
            file: file.name,
            fecha: new Date().toLocaleDateString("es-AR"),
          },
        ]);
      }
    };
    input.click();
  };

  const handleEliminarPlano = (idPlano: string) => {
    setPlanos((prev) => prev.filter((p) => p.id !== idPlano));
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
      
      {/* Barra Superior con Navegación y Chips Informativos */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIosIcon />}
          onClick={() => navigate("/efector/bandeja")}
          sx={{
            color: "#005596",
            borderColor: "#005596",
            fontWeight: 800,
            textTransform: "none",
            "&:hover": { bgcolor: "#f0f9ff", borderColor: "#003b66" },
          }}
        >
          Volver a Mis Trámites
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: "14px !important", color: "#005596 !important" }} />}
            label="MODO EDICIÓN TRÁMITE SANITARIO"
            size="small"
            sx={{
              fontWeight: 800,
              bgcolor: "#e0f2fe",
              color: "#0369a1",
              border: "1px solid #bae6fd",
              height: 28,
            }}
          />
          <Chip
            label={`Trámite: ${tramite.nroTramite}`}
            size="small"
            sx={{ fontWeight: 800, bgcolor: "#ffffff", color: "#1e293b", border: "1px solid #cbd5e1", height: 28 }}
          />
          <Chip
            label="EN CARGA"
            size="small"
            color="primary"
            sx={{ fontWeight: 850, height: 28 }}
          />
        </Box>
      </Box>

      {/* Tarjeta Principal del Trámite */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: "8px",
          overflow: "hidden",
          mb: 2,
          mx: "auto",
          width: "100%",
          backgroundColor: "white",
        }}
      >
        {/* Banner Azul Superior */}
        <Box
          sx={{
            backgroundColor: "#005596",
            color: "white",
            py: 2.2,
            px: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5, fontSize: "1.35rem" }}>
            Expediente N° {tramite.nroExpediente || "170-2026"} | Habilitación
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, opacity: 0.95, mt: 0.5, textTransform: "uppercase", letterSpacing: 1.5, fontSize: "1rem" }}
          >
            {STEPS[activeStep].label}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, fontSize: "0.88rem" }}>
            {denominacion} — {tipologia}
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3.5 }, backgroundColor: "white" }}>
          
          {/* Stepper Oficial Conectado */}
          <Box sx={{ mb: 4 }}>
            <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
              {STEPS.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    slots={{
                      stepIcon: (props) => (
                        <StepIconCustom {...props} icon={step.icon} onClick={() => setActiveStep(index)} />
                      ),
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: activeStep === index ? "900" : "bold",
                        color: activeStep === index ? "#005596" : "#4B5563",
                        display: "block",
                        mt: 0.8,
                        fontSize: "0.78rem",
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* ── CONTENIDO DEL PASO ACTIVO ───────────────────────────────────── */}
          <Box sx={{ minHeight: "380px" }}>

            {/* PASO 0: ARQUITECTURA */}
            {activeStep === 0 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ color: "#005596", fontWeight: "bold", fontSize: "1.1rem" }}>
                    Documentación y Planos de Arquitectura
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAgregarPlano}
                    sx={{ backgroundColor: "#005596", fontWeight: 700, textTransform: "none" }}
                  >
                    Adjuntar Nuevo Plano
                  </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
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
                      {planos.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ fontWeight: 750 }}>{row.tipo}</TableCell>
                          <TableCell sx={{ color: "#005596", fontWeight: 600 }}>{row.file}</TableCell>
                          <TableCell>{row.fecha}</TableCell>
                          <TableCell align="center">
                            <Chip label="CARGADO" size="small" color="primary" sx={{ fontWeight: 800, fontSize: "0.65rem" }} />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                                onClick={() => setViewerFile({ name: row.file, url: "/src/assets/archivos/planos/plano1.pdf" })}
                                sx={{ textTransform: "none", fontWeight: 800, fontSize: "0.75rem" }}
                              >
                                Ver
                              </Button>
                              <IconButton size="small" color="error" onClick={() => handleEliminarPlano(row.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
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
                <Typography variant="h6" sx={{ color: "#005596", mb: 2, fontWeight: "bold", fontSize: "1.1rem" }}>
                  Datos del Establecimiento
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 2.5, mb: 2.5 }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Denominación o Nombre de Fantasía *"
                    value={denominacion}
                    onChange={(e) => setDenominacion(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label="CUIT *"
                    value={cuit}
                    onChange={(e) => setCuit(e.target.value)}
                  />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Tipología Sanitaria *"
                    value={tipologia}
                    onChange={(e) => setTipologia(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Domicilio Real (Calle y Número) *"
                    value={domicilio}
                    onChange={(e) => setDomicilio(e.target.value)}
                  />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2.5 }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Localidad *"
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Departamento *"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Teléfono de Contacto"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </Box>
              </Box>
            )}

            {/* PASO 2: DIRECTOR TÉCNICO */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ color: "#005596", mb: 2, fontWeight: "bold", fontSize: "1.1rem" }}>
                  Datos del Director Técnico
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Nombre y Apellido *"
                    value={dtNombre}
                    onChange={(e) => setDtNombre(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label="DNI *"
                    value={dtDni}
                    onChange={(e) => setDtDni(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Matrícula Profesional *"
                    value={dtMatricula}
                    onChange={(e) => setDtMatricula(e.target.value)}
                  />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Especialidad *"
                    value={dtEspecialidad}
                    onChange={(e) => setDtEspecialidad(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Carga Horaria Semanal *"
                    value={dtCargaHoraria}
                    onChange={(e) => setDtCargaHoraria(e.target.value)}
                  />
                </Box>
              </Box>
            )}

            {/* PASO 3: SERVICIOS */}
            {activeStep === 3 && (
              <Box>
                <ServicesStep
                  selectedServices={selectedServices}
                  setSelectedServices={setSelectedServices}
                  infraSelection={infraSelection}
                  setInfraSelection={setInfraSelection}
                  onValidationChange={() => {}}
                />
              </Box>
            )}

            {/* PASO 4: RECURSOS HUMANOS */}
            {activeStep === 4 && (
              <Box>
                <RRHHStep
                  selectedServices={selectedServices}
                  rrhhCargado={rrhhCargado}
                  setRrhhCargado={setRrhhCargado}
                  onValidationSuccess={() => {}}
                />
              </Box>
            )}

            {/* PASO 5: JEFE DE SERVICIO */}
            {activeStep === 5 && (
              <Box>
                <JefeServicioStep
                  selectedServices={selectedServices}
                  cargados={jefesCargados}
                  setCargados={setJefesCargados}
                />
              </Box>
            )}

            {/* PASO 6: EQUIPAMIENTOS */}
            {activeStep === 6 && (
              <Box>
                {React.createElement(Equipamientos as any, {
                  selectedServices,
                  infraSelection,
                  equiposCargados,
                  setEquiposCargados,
                  onValidationChange: () => {},
                })}
              </Box>
            )}

            {/* PASO 7: DOCUMENTOS */}
            {activeStep === 7 && (
              <Box>
                <Typography variant="h6" sx={{ color: "#005596", mb: 2, fontWeight: "bold", fontSize: "1.1rem" }}>
                  Documentación Adjunta
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 850 }}>DOCUMENTO</TableCell>
                        <TableCell sx={{ fontWeight: 850 }}>ARCHIVO DECLARADO</TableCell>
                        <TableCell sx={{ fontWeight: 850 }}>VENCIMIENTO</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 850 }}>ACCIONES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documentos.map((doc) => (
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
                              sx={{ textTransform: "none", fontWeight: 800, fontSize: "0.75rem" }}
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

          {/* ── BOTONERA INFERIOR ───────────────────────────────────────────── */}
          <Box
            sx={{
              mt: 4,
              pt: 2.5,
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => navigate("/efector/bandeja")}
              sx={{ fontWeight: "bold", textTransform: "none" }}
            >
              VOLVER A BANDEJA
            </Button>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIosIcon />}
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{ fontWeight: "bold", textTransform: "none" }}
              >
                ANTERIOR
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleGuardarBorrador}
                sx={{ fontWeight: "bold", textTransform: "none" }}
              >
                GUARDAR BORRADOR
              </Button>

              {activeStep < STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleNext}
                  sx={{ backgroundColor: "#29b6f6", fontWeight: "bold", textTransform: "none", "&:hover": { backgroundColor: "#0288d1" } }}
                >
                  SIGUIENTE
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleFinalizarYPresentar}
                  sx={{ backgroundColor: "#005596", fontWeight: "bold", textTransform: "none", "&:hover": { backgroundColor: "#003b66" } }}
                >
                  FINALIZAR Y PRESENTAR TRÁMITE
                </Button>
              )}
            </Stack>
          </Box>

        </Box>
      </Paper>

      {/* Modal de Previsualización de Archivos */}
      <FileViewerModal file={viewerFile} onClose={() => setViewerFile(null)} />
    </Box>
  );
}
