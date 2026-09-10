import React, { useState, useMemo, useEffect } from "react";
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
  Tooltip,
  Fab,
  Tabs,
  Tab,
  Divider,
  Popover,
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
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBackIos as ArrowBackIosIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Build as BuildIcon,
  Autorenew as AutorenewIcon,
  CheckCircleOutlineOutlined as CheckCircleOutlineIcon,
} from "@mui/icons-material";

import { useNavigate, useLocation, Navigate, Link, Routes, Route } from "react-router-dom";
import { useRole } from "../../context/RoleContext";

// Componentes
import Layout from "../ui/Layout";
import ServicesStep from "./steps/ServicesStep";
import Equipamientos from "./steps/Equipamientos"; // Asegúrate que el archivo se llame así
import RRHHStep from "./steps/RRHHStep";
import JefeServicioStep from "./steps/JefeServicioStep";
import ModalHabilitacion from "../ui/ModalHabilitacion";
import PantallaInspeccion from "../inspeccion/inspector/PantallaInspeccion";
import TramitesEnCurso from "./TramitesEnCurso";
import MisEstablecimientos, { MisEstablecimientosPorRol } from "./MisEstablecimientos";
import RectificacionTramite from "./RectificacionTramite";

// --- ESTILOS STEPPER ---
const QontoConnector = styled(StepConnector)(() => ({
  // Quitamos 'theme' porque no se usaba
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

const HomeEfector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const baseRoute = "/home-efector";

  // --- ESTADOS GLOBALES ---
  const [selectedServices, setSelectedServices] = useState(() => {
    const saved = localStorage.getItem("efector_servicios");
    if (saved && saved !== "[]") {
      try {
        const arr = JSON.parse(saved);
        if (arr.length > 0) {
          const obj = {};
          arr.forEach(k => { obj[k] = { thirdParty: false }; });
          return obj;
        }
      } catch (e) {}
    }
    // Fallback: Recuperar configuraciones del acta/trámite (master_config)
    try {
      const actaStr = localStorage.getItem("acta_inspeccion_actual");
      const configStr = localStorage.getItem("master_config");
      const config = actaStr ? JSON.parse(actaStr).config : (configStr ? JSON.parse(configStr) : null);
      if (config && config.servicios) {
        const obj = {};
        config.servicios.forEach(s => {
          if (s.name && !s.name.toUpperCase().includes("DATOS GENERALES")) {
            obj[s.name] = { thirdParty: false };
          }
        });
        if (Object.keys(obj).length > 0) return obj;
      }
    } catch(e) {}
    
    return {};
  });

  const [infraSelection, setInfraSelection] = useState(() => {
    const saved = localStorage.getItem("efector_infra");
    return saved ? JSON.parse(saved) : {};
  });

  const [equiposCargados, setEquiposCargados] = useState(() => {
    const saved = localStorage.getItem("efector_equipos");
    return saved ? JSON.parse(saved) : [];
  });

  const [rrhhCargado, setRrhhCargado] = useState(() => {
    const saved = localStorage.getItem("efector_rrhh");
    return saved ? JSON.parse(saved) : [];
  });

  const [jefesCargados, setJefesCargados] = useState(() => {
    const saved = localStorage.getItem("efector_jefes");
    return saved ? JSON.parse(saved) : [];
  });

  const [isServiceValid, setIsServiceValid] = useState(false);
  const [isEquipamientoValid, setIsEquipamientoValid] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [tramiteAnchor, setTramiteAnchor] = useState(null);
  const { role } = useRole();
  const isEfector = role === "efector" && location.pathname.includes("mis-tramites");

  // EFECTOR -> INSPECTOR SYNC
  useEffect(() => {
    const activeServices = Object.keys(selectedServices).filter(k => !!selectedServices[k]);
    localStorage.setItem("efector_servicios", JSON.stringify(activeServices));
    localStorage.setItem("efector_infra", JSON.stringify(infraSelection));
    localStorage.setItem("efector_equipos", JSON.stringify(equiposCargados));
    localStorage.setItem("efector_rrhh", JSON.stringify(rrhhCargado));
    localStorage.setItem("efector_jefes", JSON.stringify(jefesCargados));
  }, [selectedServices, infraSelection, equiposCargados, rrhhCargado, jefesCargados]);

  // Moví 'steps' fuera o aseguro su referencia para el useMemo
  const steps = useMemo(
    () => [
      { label: "Arquitectura", path: "arquitectura" },
      { label: "Establecimiento", path: "establecimiento" },
      { label: "Director Técnico", path: "director" },
      { label: "Servicios", path: "servicios" },
      { label: "Recursos Humanos", path: "rrhh" },
      { label: "Jefe de Servicio", path: "jefes" },
      { label: "Equipamientos", path: "equipamientos" },
      { label: "Documentos", path: "documentos" },
    ],
    [],
  );

  const currentPath = location.pathname;

  const activeStep = useMemo(() => {
    const lastPart = location.pathname.split("/").filter(Boolean).pop();
    const idx = steps.findIndex((s) => s.path === lastPart);
    return idx >= 0 ? idx : -1; // -1 if not in a step
  }, [location.pathname, steps]); // Agregado 'steps' como dependencia

  const handleNext = () =>
    activeStep < steps.length - 1 &&
    navigate(`${baseRoute}/${steps[activeStep + 1].path}`);

  const isDashboard = activeStep === -1 && !currentPath.includes("actainspeccion") && !currentPath.includes("rectificacion") && !currentPath.includes("respuesta-emplazamiento");

  const handleBack = () =>
    activeStep > 0 && navigate(`${baseRoute}/${steps[activeStep - 1].path}`);



  return (
    <Layout>
      {!isDashboard && (
        <Box
          sx={{
            bgcolor: "#fff",
            borderBottom: "1px solid #e0e0e0",
            mx: -4,
            mt: -4,
            mb: 4,
            px: 4,
          }}
        >
          <Tabs
            value={
              currentPath.includes("actainspeccion") || currentPath.includes("respuesta-emplazamiento")
                ? "inspeccion"
                : "vertramite"
            }
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label="VER TRÁMITE"
              value="vertramite"
              component={Link}
              to={`${baseRoute}/vertramite`}
              sx={{ fontWeight: "bold" }}
            />
            <Tab
              label="INSPECCIÓN"
              value="inspeccion"
              component={Link}
              to={`${baseRoute}/respuesta-emplazamiento`}
              sx={{ fontWeight: "bold" }}
            />
          </Tabs>
        </Box>
      )}

      <Paper
        elevation={isDashboard ? 0 : 2}
        sx={{
          borderRadius: "8px",
          overflow: "hidden",
          mb: 2,
          mx: "auto",
          maxWidth: "1600px",
          backgroundColor: isDashboard ? "transparent" : "white",
        }}
      >
        {!currentPath.includes("actainspeccion") && !currentPath.includes("respuesta-emplazamiento") && !isDashboard && (
          <Box
            sx={{
              backgroundColor: "#005596",
              color: "white",
              py: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
              Expediente N° 170-2026 | Habilitación
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, opacity: 0.9, mt: 0.5, textTransform: "uppercase", letterSpacing: 1.5 }}>
              {activeStep !== -1 ? steps[activeStep].label : ""}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>Azul Talavera - CIDS</Typography>
          </Box>
        )}

        <Box sx={{ p: isDashboard ? 0 : 4, backgroundColor: isDashboard ? "transparent" : "white" }}>
        {!currentPath.includes("actainspeccion") && !currentPath.includes("respuesta-emplazamiento") && !isDashboard && (
          <Box sx={{ mb: 6 }}>
            <Stepper
              alternativeLabel
              activeStep={activeStep}
              connector={<QontoConnector />}
            >
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={(props) => (
                      <StepIconCustom
                        {...props}
                        onClick={() =>
                          navigate(`${baseRoute}/${steps[index].path}`)
                        }
                      />
                    )}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "bold",
                        color: "#333",
                        display: "block",
                        mt: 1,
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

          <Box sx={{ minHeight: "450px" }}>
            <Routes>
              <Route path="/" element={<Navigate to="mis-tramites" replace />} />
              <Route path="mis-establecimientos" element={<MisEstablecimientosPorRol />} />
              <Route path="mis-tramites" element={<TramitesEnCurso />} />
              <Route path="rectificacion" element={<Navigate to={`${baseRoute}/respuesta-emplazamiento`} replace />} />
              <Route path="respuesta-emplazamiento" element={<RectificacionTramite />} />
              <Route
                path="actainspeccion"
                element={
                  <PantallaInspeccion 
                    serviciosEfector={Object.keys(selectedServices).filter(k => !!selectedServices[k])} 
                    infraEfector={infraSelection}
                    rrhhEfector={rrhhCargado}
                    jefesEfector={jefesCargados}
                    equiposEfector={equiposCargados}
                  />
                }
              />
              <Route
                path="servicios"
                element={
                  <ServicesStep
                    selectedServices={selectedServices}
                    setSelectedServices={setSelectedServices}
                    infraSelection={infraSelection}
                    setInfraSelection={setInfraSelection}
                    onValidationChange={setIsServiceValid}
                  />
                }
              />
              <Route
                path="rrhh"
                element={<RRHHStep 
                  selectedServices={selectedServices} 
                  rrhhCargado={rrhhCargado} 
                  setRrhhCargado={setRrhhCargado}
                />}
              />
              <Route
                path="jefes"
                element={
                  <JefeServicioStep 
                    selectedServices={selectedServices} 
                    cargados={jefesCargados} 
                    setCargados={setJefesCargados}
                  />
                }
              />
              <Route
                path="equipamientos"
                element={
                  <Equipamientos
                    selectedServices={selectedServices}
                    infraSelection={infraSelection}
                    equiposCargados={equiposCargados}
                    setEquiposCargados={setEquiposCargados}
                    onValidationChange={setIsEquipamientoValid}
                  />
                }
              />
              <Route path="actainspeccion" element={<PantallaInspeccion />} />
              <Route path="vertramite" element={<Navigate to="/home-efector/servicios" replace />} />
            </Routes>
          </Box>

          {!currentPath.includes("actainspeccion") && !currentPath.includes("respuesta-emplazamiento") && !isDashboard && (
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => navigate("/")}
              >
                CANCELAR
              </Button>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIosIcon />}
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  ANTERIOR
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={() => alert("Cambios guardados localmente")}
                >
                  GUARDAR
                </Button>
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleNext}
                  disabled={
                    (activeStep === 3 && !isServiceValid) ||
                    (activeStep === 6 && !isEquipamientoValid) ||
                    activeStep === steps.length - 1
                  }
                  sx={{ backgroundColor: "#29b6f6" }}
                >
                  SIGUIENTE
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Paper>

      <ModalHabilitacion open={openModal} onClose={() => setOpenModal(false)} />
    </Layout>
  );
};

export default HomeEfector;
