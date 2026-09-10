import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  TextField,
  MenuItem,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  Tooltip,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DomainIcon from "@mui/icons-material/Domain";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import BedIcon from "@mui/icons-material/Bed";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Close from "@mui/icons-material/Close";
import DriveFileRenameOutline from "@mui/icons-material/DriveFileRenameOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import InfoIcon from "@mui/icons-material/Info";
import HistoryIcon from "@mui/icons-material/History";
import { Message as MessageIcon } from "@mui/icons-material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useApp } from "../../../context/AppContext";
import { useAuth } from "../../../context/AuthContext";
import { getMasterConfig, DEFAULT_EFECTOR_DATA } from "../../../data/masterConfig";

import {
  normalize,
  getFlatFields,
  getCompletionStats,
} from "./components/utils";

import FieldItem from "./components/FieldItem";
import VerificationTable from "./components/VerificationTable";
import ServicesTable from "./components/ServicesTable";
import PlansTable from "./components/PlansTable";
import DocumentsTable from "./components/DocumentsTable";
import AggregatedInspectionTable from "./components/AggregatedInspectionTable";
import ObservationDialog from "./components/ObservationDialog";
import FileViewerModal from "./components/FileViewerModal";
import PhotoViewer from "./components/PhotoViewer";
import RevisionActaView from "./components/RevisionActaView";
import SignatureModal from "./components/SignatureModal";

const PantallaInspeccion = ({
  serviciosEfector: propsServicios = null,
  infraEfector: propsInfra = null,
  rrhhEfector: propsRrhh = null,
  jefesEfector: propsJefes = null,
  equiposEfector: propsEquipos = null,
} = {}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tramites, finalizarInspeccion, actualizarInspeccion, responderEmplazamiento, solicitarReInspeccion, emplazarTramite, actualizarEstadoTramite } = useApp();
  const { user } = useAuth();

  const tramiteActual = React.useMemo(() => {
    return tramites.find(t => t.id === id) || null;
  }, [tramites, id]);

  const isAgentEvaluation = user?.rol === 'ARQUITECTO' || user?.rol === 'AUDITOR';
  const isDescargo = tramiteActual?.estado === 'DESCARGO_INSP' || isAgentEvaluation;
  const isAceptadoDoc = tramiteActual?.estado === 'ACEPTADO_DOC_AUD';
  const currentActaNum = tramiteActual?.nroActa || 1;
  const paramView = searchParams.get('view');

  const [loading, setLoading] = useState(false);
  const [tipologia, setTipologia] = useState(tramiteActual?.tipologia || "CLÍNICAS, SANATORIOS Y HOSPITALES");
  const [config, setConfig] = useState(() => getMasterConfig(tramiteActual?.tipologia || "CLÍNICAS, SANATORIOS Y HOSPITALES"));
  const [inspectorData, setInspectorData] = useState({});
  const [viewerFile, setViewerFile] = useState(null);
  const [obsDatosGenerales, setObsDatosGenerales] = useState([]);
  const [obsDatosTramite, setObsDatosTramite] = useState([]);
  const [generalObs, setGeneralObs] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureStep, setSignatureStep] = useState(0); // 0: cerrado, 1: responsable, 2: inspector
  const [signatures, setSignatures] = useState({
    representative: { data: null, name: "" },
    inspector: { data: null, name: "" },
  });

  const handleOpenSignatureModal = () => {
    setSignatureStep(1);
    setSignatureModalOpen(true);
  };

  const defaultView = paramView === 'revision' || isDescargo ? 'REVISION' : 'INSPECCION';
  const [activeView, setActiveView] = useState(defaultView);

  useEffect(() => {
    if (paramView === 'revision' || isDescargo) {
      setActiveView('REVISION');
    } else {
      setActiveView('INSPECCION');
    }
  }, [paramView, isDescargo]);
  const [historyAnchorEl, setHistoryAnchorEl] = useState(null);
  const historyMenuOpen = Boolean(historyAnchorEl);

  const [autoFillAnchorEl, setAutoFillAnchorEl] = useState(null);
  const autoFillMenuOpen = Boolean(autoFillAnchorEl);

  const [closeActaModalOpen, setCloseActaModalOpen] = useState(false);
  const [closeActaAction, setCloseActaAction] = useState("");
  const [closeActaNote, setCloseActaNote] = useState("");

  const [expandedSectionsGenerales, setExpandedSectionsGenerales] = useState({});
  const [expandedSectionsTramite, setExpandedSectionsTramite] = useState({});
  const [allGeneralesExpanded, setAllGeneralesExpanded] = useState(true);
  const [allTramiteExpanded, setAllTramiteExpanded] = useState(true);

  const isGeneralesExpanded = (secId) => expandedSectionsGenerales[secId] !== false;
  const isTramiteExpanded = (secId) => expandedSectionsTramite[secId] !== false;

  const handleToggleAllGenerales = () => {
    const expand = !allGeneralesExpanded;
    setAllGeneralesExpanded(expand);
    const newState = {};
    if (config?.servicios) {
      const gen = config.servicios.find(s => s.name === "DATOS GENERALES");
      if (gen?.sections) {
        gen.sections.forEach((s, index) => {
          const sectionKey = s.id || `gen_sec_${index}`;
          newState[sectionKey] = expand;
        });
      }
    }
    setExpandedSectionsGenerales(newState);
  };

  const handleToggleAllTramite = (e) => {
    e.stopPropagation();
    const expand = !allTramiteExpanded;
    setAllTramiteExpanded(expand);
    const newState = {};
    if (config?.servicios) {
      const other = config.servicios.filter(s => s.name !== "DATOS GENERALES");
      other.forEach((s, index) => {
        const sectionKey = s.id || `other_sec_${index}`;
        newState[sectionKey] = expand;
      });
    }
    setExpandedSectionsTramite(newState);
  };

  const handleOpenCloseActa = (action) => {
    setCloseActaAction(action);
    setCloseActaNote("");
    setCloseActaModalOpen(true);
  };

  const handleHistoryClick = (event) => {
    setHistoryAnchorEl(event.currentTarget);
  };
  const handleHistoryClose = () => {
    setHistoryAnchorEl(null);
  };

  const [obsDialog, setObsDialog] = useState({
    open: false,
    fieldId: null,
    label: "",
    value: "",
    category: "TRAMITE",
  });

  const handleOpenObsDialog = (fieldId, label, currentValue, category = "TRAMITE") => {
    setObsDialog({
      open: true,
      fieldId,
      label,
      value: currentValue || "",
      category,
    });
  };

  const handleSaveObs = (text) => {
    const currentData = inspectorData[obsDialog.fieldId];
    const isObject = currentData && typeof currentData === 'object' && !Array.isArray(currentData);

    handleFieldChange(obsDialog.fieldId, {
      ...(isObject ? currentData : { value: currentData }),
      obs: text,
    });

    setObsDialog({ ...obsDialog, open: false });
  };

  const [viewerPhoto, setViewerPhoto] = useState(null);
  const [targetPhotoField, setTargetPhotoField] = useState(null);

  const photoInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;

      if (targetPhotoField) {
        handleFieldChange(targetPhotoField, {
          ...(typeof inspectorData[targetPhotoField] === 'object' ? inspectorData[targetPhotoField] : { value: inspectorData[targetPhotoField] }),
          photo: base64String
        });
        setTargetPhotoField(null);
      } else {
        setAttachments((prev) => [...prev, file]);
        const currentPhotos = JSON.parse(localStorage.getItem(`inspector_photos_${id || 'default'}`) || "[]");
        localStorage.setItem(`inspector_photos_${id || 'default'}`, JSON.stringify([...currentPhotos, { name: file.name, data: base64String }]));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleSaveSignature = (dataUrl, name = "") => {
    if (signatureStep === 1) {
      setSignatures((prev) => ({ ...prev, representative: { data: dataUrl, name } }));
      setSignatureStep(2);
    } else {
      setSignatures((prev) => ({ ...prev, inspector: { data: dataUrl, name: name || user?.nombre || "ING. GUSTAVO SOSA" } }));
      setSignatureStep(0);
      setSignatureModalOpen(false);
    }
  };

  const [expandedEstablecimiento, setExpandedEstablecimiento] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ARQUITECTURA");
  const [serviciosEfector, setServiciosEfector] = useState(DEFAULT_EFECTOR_DATA.servicios);
  const [infraEfector, setInfraEfector] = useState(DEFAULT_EFECTOR_DATA.infraestructura);
  const [rrhhEfector, setRrhhEfector] = useState([
    ...DEFAULT_EFECTOR_DATA.rrhh,
    ...DEFAULT_EFECTOR_DATA.jefes.map(j => ({ ...j, isJefe: true }))
  ]);
  const [equiposEfector, setEquiposEfector] = useState(DEFAULT_EFECTOR_DATA.equipamientos);
  const [directorTecnico, setDirectorTecnico] = useState(DEFAULT_EFECTOR_DATA.directorTecnico);

  const denominacionEstablecimiento = tramiteActual?.denominacion || inspectorData["f-nomtcemx"] || "SANATORIO ALLENDE";

  const datosGeneralesSrv = React.useMemo(() =>
    config?.servicios?.find((s) => normalize(s.name).includes("DATOS GENERALES")),
    [config]
  );

  const otherServices = React.useMemo(() => {
    return config?.servicios?.filter((s) => {
      const isGeneral = normalize(s.name).includes("DATOS GENERALES");
      if (isGeneral) return false;

      const allEfectorSelection = [
        ...(serviciosEfector || []),
        ...Object.keys(infraEfector || {}).filter((k) => (infraEfector[k] || 0) > 0)
      ];

      return allEfectorSelection.some((effSrv) => {
        const nSrvName = normalize(s.name || "");
        const nEffSrv = normalize(effSrv || "");

        if (nSrvName === nEffSrv) return true;
        
        if (nSrvName.includes(nEffSrv) || nEffSrv.includes(nSrvName)) {
           const isPed = (str) => str.includes("PEDIAT") || str.includes("UTIP");
           const isNeo = (str) => str.includes("NEONAT") || str.includes("UTIN");
           const isUco = (str) => str.includes("CORONARI") || str.includes("UCO");
           
           if (isPed(nSrvName) !== isPed(nEffSrv)) return false;
           if (isNeo(nSrvName) !== isNeo(nEffSrv)) return false;
           if (isUco(nSrvName) !== isUco(nEffSrv)) return false;

           return true;
        }

        const isQuir = (str) => str.includes("QUIR") || str.includes("PABELLON");
        if (isQuir(nSrvName) && isQuir(nEffSrv)) return true;
        
        return false;
      });
    }) || [];
  }, [config, serviciosEfector, infraEfector]);

  useEffect(() => {
    const storageKey = id ? `inspector_data_${id}` : "inspector_data";
    const savedData = localStorage.getItem(storageKey);
    const savedGenObs = localStorage.getItem(`obs_datos_generales_${id || 'default'}`);
    const savedTraObs = localStorage.getItem(`obs_datos_tramite_${id || 'default'}`);
    const savedManualObs = localStorage.getItem(`general_obs_${id || 'default'}`);

    if (savedData) {
      setInspectorData(JSON.parse(savedData));
    } else {
      setInspectorData({
        "f-fecqs7p6": new Date().toISOString().split("T")[0],
        "f-nomtcemx": tramiteActual?.denominacion || "SANATORIO ALLENDE",
        "f-n56ha4": tramiteActual?.nroExpediente || "EX-2026-0039841-APN-MS#CBA",
        "f-dirs7pux": tramiteActual?.domicilio || "Av. Rafael Núñez 4750",
        "f-locojjjz": tramiteActual?.localidad || "Córdoba",
        "f-foro7rdj": tramiteActual?.formatoInspeccion || "PRESENCIAL",
      });
    }

    if (savedGenObs) {
      try { setObsDatosGenerales(JSON.parse(savedGenObs)); } catch { setObsDatosGenerales([]); }
    }
    if (savedTraObs) {
      try { setObsDatosTramite(JSON.parse(savedTraObs)); } catch { setObsDatosTramite([]); }
    }
    if (savedManualObs) setGeneralObs(savedManualObs);

    if (propsServicios) {
      setServiciosEfector(propsServicios);
      setInfraEfector(propsInfra || {});
      let rrhhList = propsRrhh || [];
      if (propsJefes) {
        rrhhList = [...rrhhList, ...propsJefes.map(j => ({ ...j, isJefe: true }))];
      }
      setRrhhEfector(rrhhList);
      setEquiposEfector(propsEquipos || []);
    }
  }, [propsServicios, propsInfra, propsRrhh, propsEquipos, id, tramiteActual]);

  useEffect(() => {
    if (Object.keys(inspectorData).length > 0) {
      const storageKey = id ? `inspector_data_${id}` : "inspector_data";
      localStorage.setItem(storageKey, JSON.stringify(inspectorData));
    }
  }, [inspectorData, id]);

  useEffect(() => {
    localStorage.setItem(`general_obs_${id || 'default'}`, generalObs);
  }, [generalObs, id]);

  // Sincronización de sumarios de observaciones
  useEffect(() => {
    if (!config) return;

    const extractValue = (val) => (val && typeof val === 'object' && !Array.isArray(val) ? val.value : val);
    const extractObs = (val) => (val && typeof val === 'object' && !Array.isArray(val) ? val.obs : "");
    const extractPhoto = (val) => (val && typeof val === 'object' && !Array.isArray(val) ? val.photo : null);

    // 1. Datos Generales
    let genSummary = [];
    const genFields = datosGeneralesSrv?.sections
      ? getFlatFields(datosGeneralesSrv.sections)
      : datosGeneralesSrv?.fields || [];

    genFields.forEach(f => {
      const fieldData = inspectorData[f.id];
      const val = extractValue(fieldData);
      const obs = extractObs(fieldData);
      const photo = extractPhoto(fieldData);

      if ((f.type === 'boolean' || f.type === 'checkbox') && val === false) {
        genSummary.push({ id: f.id, label: f.label, text: `NO CUMPLE${obs ? ` (${obs})` : ''}`, type: 'ERROR', hasPhoto: !!photo, photo });
      } else if (obs) {
        genSummary.push({ id: f.id, label: f.label, text: obs, type: 'OBS', hasPhoto: !!photo, photo });
      }
    });
    setObsDatosGenerales(genSummary);

    // 2. Datos Trámite
    let traSummary = [];
    let emplazamientos = [];

    (config.servicios || []).forEach(srv => {
      const isGeneralSrv = normalize(srv.name).includes("DATOS GENERALES");
      if (isGeneralSrv) return;

      const srvFields = srv.sections ? getFlatFields(srv.sections) : srv.fields || [];
      srvFields.forEach(f => {
        const fieldData = inspectorData[f.id];
        const val = extractValue(fieldData);
        const obs = extractObs(fieldData);
        const isDoc = f.id?.includes('doc') || f.label?.toUpperCase().includes('DOCUMENTO');
        let isIrregularidadTramite = false;
        let razonIrregular = "";
        const photo = extractPhoto(fieldData);

        if ((f.type === 'boolean' || f.type === 'checkbox') && val === false) {
          traSummary.push({ id: f.id, label: f.label, service: srv.name, text: `NO CUMPLE${obs ? ` (${obs})` : ''}`, type: 'ERROR', hasPhoto: !!photo, photo });
        } else if (obs && !isDoc) {
          traSummary.push({ id: f.id, label: f.label, service: srv.name, text: obs, type: 'OBS', hasPhoto: !!photo, photo });
        }

        const isCamaSala = f.label?.toUpperCase().includes('CAMA') || f.label?.toUpperCase().includes('SALA') || f.label?.toUpperCase().includes('HABITACIÓN');
        if (isCamaSala && typeof val === 'number') {
          const declarado = infraEfector[f.label] || 0;
          if (val > declarado) {
            isIrregularidadTramite = true;
            razonIrregular = `Cantidad superior a la declarada (${val} vs ${declarado})`;
          }
        }

        const isEquip = f.label?.toUpperCase().includes('EQUIPO') || f.label?.toUpperCase().includes('EQUIPAMIENTO') || f.id?.includes('eq');
        if (isEquip && typeof val === 'number') {
          const equipoMatch = equiposEfector?.filter(e => e.equipamiento === f.label && e.origen === srv.name) || [];
          const declarado = equipoMatch.reduce((acc, curr) => acc + (curr.actualQty || 1), 0);
          if (val < declarado) {
            isIrregularidadTramite = true;
            razonIrregular = `Faltante de equipamiento (${val} de ${declarado} requeridos)`;
          }
        }

        if (isDoc && obs) {
          isIrregularidadTramite = true;
          razonIrregular = obs;
        }

        if (isIrregularidadTramite) {
          emplazamientos.push({
            etapa: "Inspección",
            servicio: srv.name,
            item: f.label,
            observacion: razonIrregular,
            valorObservado: val,
            tipoObs: "IRREGULARIDAD",
            estado: "PENDIENTE DE SUBIR"
          });
        }
      });
    });

    Object.keys(inspectorData).forEach(key => {
      if (key.startsWith('plan_auth_') || key.startsWith('doc_auth_') || key.startsWith('infra_literal_')) {
        const data = inspectorData[key];
        const isPlan = key.startsWith('plan_auth_');
        const isDoc = key.startsWith('doc_auth_');
        const isInfra = key.startsWith('infra_literal_');

        if (data && (data.observado || data.obs)) {
          if (traSummary.find(item => item.id === key)) return;

          let label = "";
          let service = "";

          if (isPlan) {
            label = `PLANO: ${key.replace('plan_auth_', '').replace('_', '.')}`;
            service = "ARQUITECTURA";
          } else if (isDoc) {
            label = `DOCUMENTO: ${key.replace('doc_auth_', '').replace(/_/g, ' ')}`;
            service = "DOCUMENTACIÓN";
          } else if (isInfra) {
            label = key.replace('infra_literal_', '').replace(/_/g, ' ');
            service = "SALAS Y CAMAS";
          }

          traSummary.push({
            id: key,
            label,
            service,
            text: data.obs || "NO CUMPLE",
            type: 'OBS',
            hasPhoto: !!data.photo,
            photo: data.photo
          });
        }
      }
    });

    setObsDatosTramite(traSummary);

    localStorage.setItem(`obs_datos_generales_${id || 'default'}`, JSON.stringify(genSummary));
    localStorage.setItem(`obs_datos_tramite_${id || 'default'}`, JSON.stringify(traSummary));
    localStorage.setItem(`inspector_emplazamientos_${id || 'default'}`, JSON.stringify(emplazamientos));
  }, [inspectorData, config, datosGeneralesSrv, otherServices, infraEfector, equiposEfector, id]);

  const hasObservations =
    (obsDatosGenerales?.length || 0) > 0 ||
    (obsDatosTramite?.length || 0) > 0 ||
    (generalObs || "").trim().length > 0;

  const getFormatoInspeccion = () => {
    if (tramiteActual?.formatoInspeccion) return tramiteActual.formatoInspeccion.toUpperCase();
    if (!config) return "PRESENCIAL";
    let formatoId = null;
    config.servicios?.forEach(srv => {
      const srvFields = srv.sections ? getFlatFields(srv.sections) : srv.fields || [];
      srvFields.forEach(f => {
        if (f.label && f.label.toUpperCase().includes("FORMATO INSPECCIÓN")) {
          formatoId = f.id;
        }
      });
    });
    
    if (formatoId && inspectorData[formatoId]) {
       const val = typeof inspectorData[formatoId] === 'object' ? inspectorData[formatoId].value : inspectorData[formatoId];
       if (typeof val === 'string') return val.toUpperCase();
    }
    return "PRESENCIAL";
  };

  const actualFormatoInspeccion = getFormatoInspeccion();
  const allSigned = actualFormatoInspeccion === "VIRTUAL" || Boolean(signatures?.representative?.data && signatures?.inspector?.data);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Cargar localmente primero
        const localCfg = getMasterConfig(tipologia);
        if (localCfg) {
          setConfig(localCfg);
          localStorage.setItem("master_config", JSON.stringify(localCfg));
        }

        // 2. Intentar API externa si estuviese levantada
        try {
          const res = await fetch(
            `http://localhost:3001/configuraciones_maestras?tipologia=${encodeURIComponent(
              tipologia,
            )}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setConfig(data[0]);
              localStorage.setItem("master_config", JSON.stringify(data[0]));
            }
          }
        } catch {
          // Si no hay json-server, usamos el masterConfig local
        }
      } catch (err) {
        console.error("Error al cargar configuración", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tipologia]);

  const handleFieldChange = (fieldId, newValue) => {
    setInspectorData((prev) => {
      const current = prev[fieldId] || {};
      if (newValue && typeof newValue === 'object' && !Array.isArray(newValue)) {
        return { ...prev, [fieldId]: { ...current, ...newValue } };
      }
      return { ...prev, [fieldId]: { ...current, value: newValue } };
    });
  };

  const handleConfirmCierre = () => {
    setCloseActaModalOpen(false);
    
    const esAprobacion = closeActaAction === "APROBAR";
    const esRechazo = closeActaAction === "RECHAZAR";
    if (id) {
      actualizarInspeccion({
        tramiteId: id,
        cierre: {
          dictamen: esAprobacion ? 'APRUEBA' : 'NO_APRUEBA',
          notasCierre: esRechazo ? `[ACTA RECHAZADA] ${closeActaNote}` : closeActaNote,
          firmaInspector: signatures.inspector.data || undefined,
          firmaResponsable: signatures.representative.data || undefined,
        }
      });
      finalizarInspeccion();
    }
    
    alert(esRechazo 
      ? `Acta rechazada con éxito.\nMotivo: ${closeActaNote || 'Sin observaciones adicionales'}`
      : `Acta cerrada (${closeActaAction}) con éxito.\nNota: ${closeActaNote || 'Sin notas adicionales'}`
    );
    navigate(user?.rol === 'COORDINADOR' ? '/coordinador/inspeccion/habilitacion' : '/inspector/inspeccion-tipo/habilitacion');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#ffffff",
        }}
      >
        <CircularProgress size={80} thickness={4} />
      </Box>
    );
  }

  const PESTAÑAS = [
    {
      id: "ARQUITECTURA",
      label: "ARQUITECTURA",
      icon: <DomainIcon sx={{ fontSize: 28 }} />,
    },
    {
      id: "SERVICIOS",
      label: "SERVICIOS",
      icon: <LocalHospitalIcon sx={{ fontSize: 28 }} />,
    },
    {
      id: "SALAS Y CAMAS",
      label: "SALAS Y CAMAS",
      icon: <BedIcon sx={{ fontSize: 28 }} />,
    },
    {
      id: "RECURSOS HUMANOS",
      label: "RRHH y JS",
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
    },
    {
      id: "EQUIPAMIENTO",
      label: "EQUIPAMIENTO",
      icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />,
    },
    {
      id: "DOCUMENTACION",
      label: "DOCUMENTOS ADJUNTOS",
      icon: <DescriptionIcon sx={{ fontSize: 28 }} />,
    },
  ];

  const renderProgressBar = (stats) => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 0.5,
        }}
      >
        <Chip
          label={`${stats.percent}%`}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: "0.75rem",
            bgcolor: stats.percent === 100 ? "#def7ed" : "#f1f5f9",
            color: stats.percent === 100 ? "#065f46" : "#64748b",
            height: 20,
            "& .MuiChip-label": { px: 1 }
          }}
        />
      </Box>
    );
  };

  const handleAutoFillClick = (event) => {
    setAutoFillAnchorEl(event.currentTarget);
  };

  const handleAutoFillClose = () => {
    setAutoFillAnchorEl(null);
  };

  const handleAutoFill = (mode) => {
    if (!config) return;
    handleAutoFillClose();
    
    const newInspectorData = { ...inspectorData };
    let hasOneObs = false;

    const fillFields = (fields) => {
      fields.forEach((f, idx) => {
        let value = null;
        let obs = "";

        if (f.type === "boolean" || f.type === "checkbox") {
          value = true;
          if (mode === "many" && idx % 7 === 0) {
            value = false;
            obs = "No cumple con el requerimiento de habilitación.";
          } else if (mode === "one" && !hasOneObs) {
            value = false;
            obs = "Observación constatada in situ.";
            hasOneObs = true;
          }
        } else if (f.type === "text" || f.type === "textarea") {
          value = "Verificado conforme según normativa sanitaria vigente.";
          if (mode === "many" && idx % 5 === 0) {
             obs = "Observación técnica requerida.";
          }
        } else if (f.type === "number") {
          value = 3;
        } else if (f.type === "select" || f.type === "radio" || f.type === "toggle") {
          if (Array.isArray(f.options) && f.options.length > 0) {
            value = typeof f.options[0] === 'object' ? f.options[0].value : f.options[0];
          } else if (typeof f.options === 'string') {
            value = f.options.split(',')[0].trim();
          } else {
            value = "Opción A";
          }
        } else if (f.type === "date") {
          value = new Date().toISOString().split('T')[0];
        } else {
          value = "Valor constatado";
        }

        if (value !== null) {
          newInspectorData[f.id] = { value, obs };
        }
      });
    };

    if (datosGeneralesSrv) {
      const genFields = datosGeneralesSrv.sections
        ? getFlatFields(datosGeneralesSrv.sections)
        : datosGeneralesSrv.fields || [];
      fillFields(genFields);
    }

    otherServices.forEach(srv => {
      const srvFields = srv.sections
        ? getFlatFields(srv.sections)
        : srv.fields || [];
      fillFields(srvFields);
    });

    setInspectorData(newInspectorData);
  };

  const backPath = user?.rol === 'COORDINADOR'
    ? '/coordinador/inspeccion/habilitacion'
    : user?.rol === 'ARQUITECTO'
    ? '/arquitecto/expedientes'
    : user?.rol === 'AUDITOR'
    ? '/auditor/expedientes'
    : '/inspector/inspeccion-tipo/habilitacion';

  if (activeView === "REVISION") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100%",
          maxWidth: 1200,
          bgcolor: "#ffffff",
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          pt: 3,
          pb: 8,
        }}
      >
        <RevisionActaView
          obsGenerales={obsDatosGenerales}
          obsTramite={obsDatosTramite}
          rol={user?.rol}
          onVolver={() => navigate(backPath)}
          onAceptarReinspeccion={() => {
            if (id) {
              if (user?.rol === 'ARQUITECTO') {
                actualizarEstadoTramite(id, 'PENDIENTE_EVAL_AUD');
                alert("✓ Subsanación de arquitectura aprobada con éxito. El expediente pasa a la etapa de Auditoría.");
              } else if (user?.rol === 'AUDITOR') {
                actualizarEstadoTramite(id, 'ACEPTADO_DOC_AUD');
                alert("✓ Auditoría de descargo aprobada con éxito. El trámite queda habilitado para inspección.");
              } else {
                solicitarReInspeccion(id);
                alert("Pedido de re-inspección enviado con éxito al coordinador.");
              }
            }
            navigate(backPath);
          }}
          onEmplazarFinalizado={(dias) => {
            if (id) {
              emplazarTramite(id, dias, obsDatosTramite.map(o => o.text || o.label));
            }
            alert(`Emplazamiento de ${dias} aplicado con éxito. El efector deberá enviar un nuevo descargo.`);
            navigate(backPath);
          }}
          onIrAInspeccion={() => setActiveView("INSPECCION")}
          showIrAInspeccion={user?.rol === 'INSPECTOR'}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        maxWidth: { xs: "100%", md: 1280, lg: 1440, xl: 1580 },
        bgcolor: "#ffffff",
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4, lg: 5 },
        pt: 2.5,
        pb: 8,
      }}
    >
      {/* Botón Volver a la Bandeja */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          onClick={() => navigate(backPath)}
          startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
          sx={{
            background: '#FFFFFF',
            color: '#27AE60',
            border: '1.5px solid #27AE60',
            borderRadius: 2,
            px: 2,
            py: 0.8,
            fontSize: '0.85rem',
            fontWeight: 800,
            textTransform: 'none',
            '&:hover': { bgcolor: '#f0fdf4', borderColor: '#219653' }
          }}
        >
          {user?.rol === 'ARQUITECTO' || user?.rol === 'AUDITOR' ? 'Volver a Expedientes' : user?.rol === 'COORDINADOR' ? 'Volver a Coordinación' : 'Volver a Habilitación'}
        </Button>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {user?.rol === 'ARQUITECTO' && (
            <Chip
              label="Agente Arquitecto"
              size="small"
              sx={{ fontWeight: 850, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
            />
          )}
          {user?.rol === 'AUDITOR' && (
            <Chip
              label="Agente Auditor"
              size="small"
              sx={{ fontWeight: 850, bgcolor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
            />
          )}
          {tramiteActual && (
            <>
              <Chip
                label={`Trámite: ${tramiteActual.nroTramite}`}
                size="small"
                sx={{ fontWeight: 800, bgcolor: '#f1f5f9', color: '#1e293b' }}
              />
              <Chip
                label={`Expediente: ${tramiteActual.nroExpediente}`}
                size="small"
                sx={{ fontWeight: 700, bgcolor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}
              />
            </>
          )}
          <Chip
            label={actualFormatoInspeccion}
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 800 }}
          />
        </Stack>
      </Box>

      {/* Tarjeta de Cabecera del Establecimiento */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          borderLeft: '8px solid #0090d0',
          bgcolor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 950, color: '#0f172a', mb: 1, letterSpacing: -1 }}>
              {denominacionEstablecimiento}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ bgcolor: '#0090d0', color: 'white', borderRadius: 1.5, p: 0.4, display: 'flex' }}>
                <LocalHospitalIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 850, color: '#64748b', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                {tipologia}
              </Typography>

              <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 18, my: 'auto' }} />

              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>
                DIRECTOR TÉCNICO: <Box component="span" sx={{ color: '#0f172a', fontWeight: 900 }}>{directorTecnico.nombre} {directorTecnico.apellido}</Box>
              </Typography>

              <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 18, my: 'auto' }} />

              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>
                DNI: <Box component="span" sx={{ color: '#0f172a', fontWeight: 900 }}>{directorTecnico.dni}</Box>
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleAutoFillClick}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ fontWeight: 'bold', borderRadius: 2 }}
            >
              Auto-Completar
            </Button>
            <Menu
              anchorEl={autoFillAnchorEl}
              open={autoFillMenuOpen}
              onClose={handleAutoFillClose}
            >
              <MenuItem onClick={() => handleAutoFill("none")}>Ninguna observación (Aprobado)</MenuItem>
              <MenuItem onClick={() => handleAutoFill("one")}>Una observación de prueba</MenuItem>
              <MenuItem onClick={() => handleAutoFill("many")}>Múltiples observaciones</MenuItem>
            </Menu>

            <Button
              variant="contained"
              onClick={() => handleOpenCloseActa("RECHAZAR")}
              sx={{
                fontWeight: 900,
                borderRadius: 2,
                bgcolor: "#dc2626",
                color: "white",
                px: 2.5,
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
                "&:hover": { bgcolor: "#b91c1c" }
              }}
            >
              Rechazar Acta
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Selector de Acta / Revisión / Historial */}
      <Box
        sx={{
          bgcolor: '#ebeef2',
          borderRadius: 6,
          p: 0.8,
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        {currentActaNum > 1 && (
          <>
            <Button
              onClick={handleHistoryClick}
              startIcon={<HistoryIcon sx={{ color: '#0ea5e9' }} />}
              endIcon={historyMenuOpen ? <KeyboardArrowUpIcon sx={{ color: '#0ea5e9' }} /> : <KeyboardArrowDownIcon sx={{ color: '#0ea5e9' }} />}
              sx={{
                bgcolor: historyMenuOpen ? 'white' : 'transparent',
                borderRadius: 5,
                px: 3,
                py: 1,
                fontWeight: 900,
                color: '#0ea5e9',
                boxShadow: historyMenuOpen ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                letterSpacing: '0.02em',
                '&:hover': { bgcolor: historyMenuOpen ? '#ffffff' : 'rgba(0,0,0,0.04)' }
              }}
            >
              HISTORIAL ({currentActaNum - 1})
            </Button>

            <Menu
              anchorEl={historyAnchorEl}
              open={historyMenuOpen}
              onClose={handleHistoryClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1.5,
                  borderRadius: 4,
                  minWidth: 180,
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  border: '1px solid #f1f5f9',
                  '& .MuiMenuItem-root': {
                    fontWeight: 800,
                    color: '#64748b',
                    fontSize: '0.9rem',
                    py: 1.5,
                    px: 3,
                    mx: 1,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: '#f0f9ff',
                      color: '#0ea5e9'
                    }
                  }
                }
              }}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
              {Array.from({ length: Math.max(0, currentActaNum - 1) }, (_, i) => (
                <MenuItem key={i} onClick={handleHistoryClose}>
                  ACTA {i + 1} {i === 0 ? '(INICIAL)' : ''}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        {(isDescargo || currentActaNum > 1) && (
          <Button
            variant="text"
            onClick={() => setActiveView("REVISION")}
            sx={{
              flex: 1,
              borderRadius: 5,
              fontWeight: 900,
              py: 1,
              color: activeView === "REVISION" ? "#0f172a" : "#64748b",
              bgcolor: activeView === "REVISION" ? "white" : "transparent",
              boxShadow: activeView === "REVISION" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              textTransform: 'none',
              fontSize: '0.85rem',
              '&:hover': { bgcolor: activeView === "REVISION" ? 'white' : 'rgba(0,0,0,0.04)' }
            }}
          >
            {isAgentEvaluation
              ? "RESPUESTA EMPLAZAMIENTO: REVISIÓN DE DESCARGO"
              : isDescargo && currentActaNum === 1
              ? "ACTA 1: REVISIÓN"
              : `ACTA ${currentActaNum - 1}: REVISIÓN`}
          </Button>
        )}

        {!isDescargo && (
          <Button
            variant="text"
            onClick={() => setActiveView("INSPECCION")}
            sx={{
              flex: 1,
              borderRadius: 5,
              fontWeight: 900,
              py: 1,
              color: activeView === "INSPECCION" ? "#0f172a" : "#64748b",
              bgcolor: activeView === "INSPECCION" ? "white" : "transparent",
              boxShadow: activeView === "INSPECCION" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              textTransform: 'none',
              fontSize: '0.85rem',
              '&:hover': { bgcolor: activeView === "INSPECCION" ? 'white' : 'rgba(0,0,0,0.04)' }
            }}
          >
            ACTA {currentActaNum}: INSPECCIÓN
          </Button>
        )}
      </Box>

      {activeView === "REVISION" ? (
        <RevisionActaView
          obsGenerales={obsDatosGenerales}
          obsTramite={obsDatosTramite}
          rol={user?.rol}
          onAceptarReinspeccion={() => {
            if (id) {
              if (user?.rol === 'ARQUITECTO') {
                actualizarEstadoTramite(id, 'PENDIENTE_EVAL_AUD');
                alert("✓ Subsanación de arquitectura aprobada con éxito. El expediente pasa a la etapa de Auditoría.");
              } else if (user?.rol === 'AUDITOR') {
                actualizarEstadoTramite(id, 'ACEPTADO_DOC_AUD');
                alert("✓ Auditoría de descargo aprobada con éxito. El trámite queda habilitado para inspección.");
              } else {
                solicitarReInspeccion(id);
                alert("Pedido de re-inspección enviado con éxito al coordinador.");
              }
            }
            navigate(backPath);
          }}
          onEmplazarFinalizado={(dias) => {
            if (id) {
              emplazarTramite(id, dias, obsDatosTramite.map(o => o.text || o.label));
            }
            alert(`Emplazamiento de ${dias} aplicado con éxito. El efector deberá enviar un nuevo descargo.`);
            navigate(backPath);
          }}
        />
      ) : (
        <>
          {/* SECCIÓN 1: DATOS GENERALES */}
          {datosGeneralesSrv && (
            <Paper
              sx={{
                mb: 4,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                overflow: "hidden"
              }}
            >
              <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <Box sx={{ display: "flex", flexDirection: "column", width: "100%", pr: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#1e293b", textTransform: "uppercase" }}>
                      DATOS GENERALES
                    </Typography>
                    <Box>
                      <Tooltip title={allGeneralesExpanded ? "Contraer todos" : "Desplegar todos"}>
                        <IconButton size="small" onClick={handleToggleAllGenerales} sx={{ color: '#64748b' }}>
                          {allGeneralesExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  {renderProgressBar(
                    getCompletionStats(
                      datosGeneralesSrv.sections
                        ? getFlatFields(datosGeneralesSrv.sections)
                        : datosGeneralesSrv.fields,
                      inspectorData
                    ),
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 3,
                  bgcolor: "#ffffff",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {datosGeneralesSrv.sections
                    ? datosGeneralesSrv.sections.map((sec, index) => {
                      const sectionStats = getCompletionStats(sec.fields, inspectorData);
                      const sectionKey = sec.id || `gen_sec_${index}`;
                      if (index === 0) {
                        return (
                          <Box
                            key={sectionKey}
                            sx={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              overflow: "hidden",
                              bgcolor: "#ffffff",
                            }}
                          >
                            <Box sx={{ bgcolor: "#f8fafc", px: 2, py: 1.5, borderBottom: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 800,
                                  color: "#475569",
                                  textTransform: "uppercase",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {sec.name}
                              </Typography>
                              {renderProgressBar(sectionStats)}
                            </Box>
                            <Box sx={{ py: 2, px: 2 }}>
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                  gap: 2,
                                }}
                              >
                                {sec.fields.map((field) => (
                                  <FieldItem
                                    key={field.id}
                                    field={field}
                                    value={inspectorData[field.id]}
                                    onChange={handleFieldChange}
                                    onOpenObs={(fid, lbl, val) => handleOpenObsDialog(fid, lbl, val, "GENERAL")}
                                    infraEfector={infraEfector}
                                    serviciosEfector={serviciosEfector}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        );
                      }
                      return (
                        <Accordion
                          key={sectionKey}
                          elevation={0}
                          expanded={isGeneralesExpanded(sectionKey)}
                          onChange={() => setExpandedSectionsGenerales(prev => ({ ...prev, [sectionKey]: !isGeneralesExpanded(sectionKey) }))}
                          sx={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px !important",
                            overflow: "hidden",
                            "&:before": { display: "none" },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{ color: "#0ea5e9" }} />}
                            sx={{
                              bgcolor: "#f8fafc",
                              "& .MuiAccordionSummary-content": {
                                flexDirection: "column",
                              },
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 800,
                                color: "#475569",
                                textTransform: "uppercase",
                                fontSize: "0.8rem",
                              }}
                            >
                              {sec.name}
                            </Typography>
                            {renderProgressBar(sectionStats)}
                          </AccordionSummary>
                          <AccordionDetails sx={{ py: 2 }}>
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: 2,
                              }}
                            >
                              {sec.fields.map((field) => (
                                <FieldItem
                                  key={field.id}
                                  field={field}
                                  value={inspectorData[field.id]}
                                  onChange={handleFieldChange}
                                  onOpenObs={(fid, lbl, val) => handleOpenObsDialog(fid, lbl, val, "GENERAL")}
                                  infraEfector={infraEfector}
                                  serviciosEfector={serviciosEfector}
                                />
                              ))}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })
                    : (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: 2,
                        }}
                      >
                        {datosGeneralesSrv.fields?.map((field) => (
                          <FieldItem
                            key={field.id}
                            field={field}
                            value={inspectorData[field.id]}
                            onChange={handleFieldChange}
                            onOpenObs={(fid, lbl, val) => handleOpenObsDialog(fid, lbl, val, "GENERAL")}
                            infraEfector={infraEfector}
                            serviciosEfector={serviciosEfector}
                          />
                        ))}
                      </Box>
                    )}
                </Box>
              </Box>
            </Paper>
          )}

          {/* SECCIÓN 2: DATOS DEL TRÁMITE CON CATEGORÍAS */}
          <Accordion
            expanded={expandedEstablecimiento}
            onChange={() => setExpandedEstablecimiento(!expandedEstablecimiento)}
            sx={{
              mb: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              borderRadius: "12px !important",
              "&:before": { display: "none" },
              border: "1px solid #e2e8f0",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#0ea5e9" }} />}
              sx={{ px: { xs: 2, sm: 3 }, py: 0.5 }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  pr: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 900, color: "#1e293b" }}
                  >
                    DATOS DEL TRÁMITE
                  </Typography>
                  <Box>
                    <Tooltip title={allTramiteExpanded ? "Contraer todos" : "Desplegar todos"}>
                      <Box
                        onClick={handleToggleAllTramite}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 0.5,
                          borderRadius: '50%',
                          color: '#64748b',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                      >
                        {allTramiteExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mt: 0.5 }}>
                  Valores declarados en el trámite
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
              {/* Selector de Categorías (Pestañas Circulares) */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 3,
                  px: { xs: 1, sm: 4 },
                  width: "100%",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 24,
                    left: 40,
                    right: 40,
                    height: 2,
                    bgcolor: "#e2e8f0",
                    zIndex: 0,
                  }}
                />

                {PESTAÑAS.map((tab) => {
                  const isSelected = selectedCategory === tab.id;
                  return (
                    <Box
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id)}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        zIndex: 1,
                        flex: 1,
                        minWidth: 0,
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          bgcolor: isSelected ? "#0ea5e9" : "#ffffff",
                          color: isSelected ? "white" : "#64748b",
                          border: "2px solid",
                          borderColor: isSelected ? "#0ea5e9" : "#cbd5e1",
                          boxShadow: isSelected
                            ? "0 4px 10px rgba(14,165,233,0.3)"
                            : "none",
                          transition: "all 0.2s",
                        }}
                      >
                        {tab.icon}
                      </Box>
                      <Typography
                        align="center"
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.8rem" },
                          color: isSelected ? "#0f172a" : "#64748b",
                          lineHeight: 1.1,
                        }}
                      >
                        {tab.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
                {selectedCategory === "ARQUITECTURA" && (
                  <Box sx={{ mb: 4 }}>
                    <PlansTable
                      inspectorData={inspectorData}
                      onChange={handleFieldChange}
                      onOpenObs={handleOpenObsDialog}
                      onOpenViewer={setViewerFile}
                    />
                  </Box>
                )}

                {selectedCategory === "DOCUMENTACION" && (
                  <Box sx={{ mb: 4 }}>
                    <DocumentsTable
                      inspectorData={inspectorData}
                      onChange={handleFieldChange}
                      onOpenObs={handleOpenObsDialog}
                      onOpenViewer={setViewerFile}
                    />
                  </Box>
                )}

                {selectedCategory === "SERVICIOS" && (
                  <Box sx={{ mb: 4 }}>
                    <ServicesTable
                      inspectorData={inspectorData}
                      onChange={handleFieldChange}
                      onOpenObs={handleOpenObsDialog}
                      serviciosEfector={serviciosEfector}
                    />
                  </Box>
                )}

                {(selectedCategory === "EQUIPAMIENTO" || selectedCategory === "SALAS Y CAMAS" || selectedCategory === "RECURSOS HUMANOS") && (
                  <Box sx={{ mb: 4 }}>
                    <AggregatedInspectionTable
                      category={selectedCategory}
                      services={otherServices}
                      inspectorData={inspectorData}
                      infraEfector={infraEfector}
                      equiposEfector={equiposEfector}
                      rrhhEfector={rrhhEfector}
                      onChange={handleFieldChange}
                      onOpenObs={handleOpenObsDialog}
                    />
                  </Box>
                )}

                <FileViewerModal
                  file={viewerFile}
                  onClose={() => setViewerFile(null)}
                />

                {otherServices.map((srv, index) => {
                  let matchedSections = [];

                  if (selectedCategory === "SERVICIOS") {
                    if (srv.sections) {
                      matchedSections = srv.sections.filter((sec) => {
                        const n = sec.name.toUpperCase();
                        return (
                          !n.includes("ARQUITECTURA") &&
                          !n.includes("EQUIPAMIENTO") &&
                          !n.includes("RECURSOS") &&
                          !n.includes("RRHH") &&
                          !n.includes("JEFE")
                        );
                      });
                    }
                  } else {
                    if (srv.sections) {
                      const keyword =
                        selectedCategory === "RECURSOS HUMANOS"
                          ? "RECURSOS"
                          : selectedCategory === "SALAS Y CAMAS"
                            ? "SALA"
                            : selectedCategory === "DOCUMENTACION"
                              ? "DOCUMENTO"
                              : selectedCategory;
                      
                      matchedSections = srv.sections.filter((sec) => {
                        const n = sec.name.toUpperCase();
                        const isMatch =
                          n.includes(keyword) ||
                          (selectedCategory === "DOCUMENTACION" && n.includes("DOCUMENTA")) ||
                          (selectedCategory === "RECURSOS HUMANOS" && n.includes("JEFE")) ||
                          (selectedCategory === "SALAS Y CAMAS" && n.includes("CAMA"));

                        if (!isMatch || ["DOCUMENTACION", "EQUIPAMIENTO", "SALAS Y CAMAS", "RECURSOS HUMANOS"].includes(selectedCategory)) return false;
                        return sec.fields && sec.fields.length > 0;
                      });
                    }
                  }

                  if (!matchedSections || matchedSections.length === 0) return null;

                  const sectionKey = srv.id || `other_sec_${index}`;
                  return (
                    <Accordion
                      key={sectionKey}
                      expanded={isTramiteExpanded(sectionKey)}
                      onChange={() => setExpandedSectionsTramite(prev => ({ ...prev, [sectionKey]: !isTramiteExpanded(sectionKey) }))}
                      sx={{
                        mb: 1,
                        boxShadow: "none",
                        borderRadius: "12px !important",
                        border: "1px solid #e2e8f0",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "#475569" }} />}
                        sx={{
                          bgcolor: "#f8fafc",
                          px: 3,
                          "&.Mui-expanded": {
                            borderBottom: "1px solid #e2e8f0",
                          },
                          "& .MuiAccordionSummary-content": {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            pr: 2
                          }
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <LocalHospitalIcon sx={{ color: "#64748b", fontSize: 20 }} />
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 900,
                              color: "#1e293b",
                              fontSize: "1rem",
                              textTransform: "uppercase"
                            }}
                          >
                            {srv.name}
                          </Typography>
                        </Box>
                        {renderProgressBar(getCompletionStats(getFlatFields(matchedSections), inspectorData))}
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 3 }}>
                        {matchedSections.map((section) => {
                          const sectionFields = section.fields.filter((f) => {
                            if (section.name.toUpperCase().includes("SALA") || section.name.toUpperCase().includes("CAMA")) {
                              const label = f.label || f.name;
                              const uLabel = label.toUpperCase();
                              const isGenericLabel = uLabel.includes("CAMAS") || uLabel.includes("SALAS") || uLabel.includes("HABITACION") || (uLabel.includes("N") && uLabel.includes("DE"));
                              if (isGenericLabel && infraEfector && (infraEfector[srv.name] || infraEfector[srv.id])) return true;
                              return infraEfector && (infraEfector[label] > 0);
                            }
                            return true;
                          });
                          const sectionStats = getCompletionStats(sectionFields, inspectorData);

                          return (
                            <Box key={section.id} sx={{ mb: 4 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: "1px solid #f1f5f9", pb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                                  {section.name}
                                </Typography>
                                {renderProgressBar(sectionStats)}
                              </Box>

                              {(section.name.includes("EQUIPAMIENTO") ||
                                section.name.includes("RECURSOS") ||
                                section.name.includes("RRHH") ||
                                section.name.includes("SALA") ||
                                section.name.includes("CAMA")) ? (
                                <VerificationTable
                                  fields={sectionFields}
                                  inspectorData={inspectorData}
                                  onChange={handleFieldChange}
                                  onOpenObs={handleOpenObsDialog}
                                  infraEfector={infraEfector}
                                  rrhhEfector={rrhhEfector}
                                  equiposEfector={equiposEfector}
                                  currentSrvName={srv.name}
                                  serviciosEfector={serviciosEfector}
                                />
                              ) : (
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 3 }}>
                                  {section.fields?.map((field) => (
                                    <FieldItem
                                      key={field.id}
                                      field={field}
                                      value={inspectorData[field.id]}
                                      onChange={handleFieldChange}
                                      infraEfector={infraEfector}
                                      serviciosEfector={serviciosEfector}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>

          <ObservationDialog
            open={obsDialog.open}
            label={obsDialog.label}
            value={obsDialog.value}
            onClose={() => setObsDialog({ ...obsDialog, open: false })}
            onSave={handleSaveObs}
          />

          <PhotoViewer
            open={!!viewerPhoto}
            photo={viewerPhoto}
            onClose={() => setViewerPhoto(null)}
          />

          {/* Resumen de Observaciones en Acordeón */}
          <Accordion
            defaultExpanded
            sx={{
              mt: 4,
              borderRadius: '16px !important',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#0ea5e9' }} />}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: "100%", pr: 2 }}>
                <Typography sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.25rem' }}>
                  RESUMEN DE OBSERVACIONES
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 4, bgcolor: '#fcfcfc' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

                {generalObs && (
                  <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #FFE0B2', bgcolor: '#FFF9E6', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <MessageIcon sx={{ color: '#92400e', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 950, color: '#92400e', mb: 0.5, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Conclusión General de la Inspección
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#92400e', fontWeight: 600, lineHeight: 1.6, fontSize: '0.95rem' }}>
                        "{generalObs}"
                      </Typography>
                    </Box>
                  </Paper>
                )}

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ bgcolor: '#0ea5e9', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <InfoIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#1e293b", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                      OBSERVACIONES DE DATOS GENERALES
                    </Typography>
                  </Box>

                  <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr auto', px: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b' }}>DETALLE DEL HALLAZGO / ELEMENTO</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b' }}>EVIDENCIA</Typography>
                    </Box>
                    <Box sx={{ p: 0 }}>
                      {obsDatosGenerales.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography sx={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.85rem" }}>No hay observaciones pendientes.</Typography>
                        </Box>
                      ) : (
                        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                          {obsDatosGenerales.map((obs, idx) => (
                            <Box component="li" key={idx} sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderBottom: idx === obsDatosGenerales.length - 1 ? 'none' : '1px solid #f1f5f9',
                              py: 2,
                              px: 3,
                              '&:hover': { bgcolor: '#f8fafc' }
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography sx={{ fontWeight: 800, color: obs.type === 'ERROR' ? '#ef4444' : '#475569', fontSize: '0.85rem' }}>{obs.label}</Typography>
                                <Typography sx={{ fontWeight: 500, color: '#64748b', fontSize: '0.85rem' }}>: {obs.text}</Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (obs.hasPhoto) {
                                    setViewerPhoto(obs.photo);
                                  } else {
                                    setTargetPhotoField(obs.id);
                                    if (photoInputRef.current) photoInputRef.current.click();
                                  }
                                }}
                                sx={{ ml: 1, color: obs.hasPhoto ? '#0ea5e9' : '#94a3b8', '&:hover': { color: '#0ea5e9' } }}
                              >
                                {obs.hasPhoto ? <VisibilityIcon sx={{ fontSize: 18 }} /> : <PhotoCamera sx={{ fontSize: 18 }} />}
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ bgcolor: '#ef4444', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ReportProblemIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#1e293b", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                      OBSERVACIONES DE DATOS DEL TRÁMITE
                    </Typography>
                  </Box>

                  <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr auto', px: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b' }}>DETALLE TÉCNICO / SERVICIO</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b' }}>EVIDENCIA</Typography>
                    </Box>
                    <Box sx={{ p: 0 }}>
                      {obsDatosTramite.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography sx={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.85rem" }}>No hay observaciones pendientes.</Typography>
                        </Box>
                      ) : (
                        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                          {obsDatosTramite.map((obs, idx) => (
                            <Box component="li" key={idx} sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderBottom: idx === obsDatosTramite.length - 1 ? 'none' : '1px solid #f1f5f9',
                              py: 2,
                              px: 3,
                              '&:hover': { bgcolor: '#f8fafc' }
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Chip
                                  label={obs.service}
                                  size="small"
                                  sx={{
                                    fontWeight: 900,
                                    fontSize: '0.6rem',
                                    bgcolor: '#f1f5f9',
                                    color: '#475569',
                                    height: 18,
                                    borderRadius: 1
                                  }}
                                />
                                <Typography sx={{ fontWeight: 800, color: obs.type === 'ERROR' ? '#ef4444' : '#475569', fontSize: '0.85rem' }}>{obs.label}</Typography>
                                <Typography sx={{ fontWeight: 500, color: '#64748b', fontSize: '0.85rem' }}>: {obs.text}</Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (obs.hasPhoto) {
                                    setViewerPhoto(obs.photo);
                                  } else {
                                    setTargetPhotoField(obs.id);
                                    if (photoInputRef.current) photoInputRef.current.click();
                                  }
                                }}
                                sx={{ ml: 1, color: obs.hasPhoto ? '#0ea5e9' : '#94a3b8', '&:hover': { color: '#0ea5e9' } }}
                              >
                                {obs.hasPhoto ? <VisibilityIcon sx={{ fontSize: 18 }} /> : <PhotoCamera sx={{ fontSize: 18 }} />}
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>

              </Box>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 5, mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 950, color: "#1e293b", mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}
            >
              Observaciones Generales del Acta
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              placeholder="Escriba aquí la conclusión general de la inspección..."
              value={generalObs}
              onChange={(e) => setGeneralObs(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                  bgcolor: "#f8fafc",
                  border: "2px solid #e2e8f0",
                  fontSize: '1rem',
                  fontWeight: 500,
                  "&:hover": { borderColor: "#cbd5e1" },
                  "&.Mui-focused": { borderColor: "#0ea5e9" },
                },
              }}
            />
          </Box>

          <Box sx={{ mt: 4, mb: 5 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Button
                variant="outlined"
                onClick={() => photoInputRef.current?.click()}
                startIcon={<PhotoCamera />}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                  py: 1.5,
                  borderColor: "#e2e8f0",
                  color: "#475569",
                  "&:hover": { bgcolor: "#f1f5f9", borderColor: "#cbd5e1" },
                }}
              >
                Abrir Cámara / Adjuntar Evidencia
              </Button>
              <input
                ref={photoInputRef}
                type="file"
                hidden
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
              />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
              {attachments.map((file, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 0.5,
                    borderRadius: 3,
                    position: "relative",
                    width: 110,
                    height: 110,
                    border: "2px solid #e2e8f0",
                    bgcolor: "#f8fafc",
                    overflow: "visible",
                  }}
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        p: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "#64748b",
                          wordBreak: "break-all",
                          fontSize: "0.65rem",
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    onClick={() =>
                      setAttachments(attachments.filter((_, i) => i !== idx))
                    }
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      bgcolor: "#ef4444",
                      color: "white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      "&:hover": { bgcolor: "#dc2626" },
                      "& .MuiSvgIcon-root": { fontSize: 16 },
                    }}
                  >
                    <Close />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* Visualización de Firmas */}
          {actualFormatoInspeccion !== "VIRTUAL" && (signatures.representative.data || signatures.inspector.data) && (
            <Box
              sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 3,
                p: 3,
                bgcolor: "#f8fafc",
                borderRadius: 4,
                border: "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: 'block', mb: 1 }}
                >
                  Firma Responsable
                </Typography>
                <Box sx={{ height: 100, bgcolor: "white", borderRadius: 3, border: "1px solid #e2e8f0", overflow: 'hidden', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {signatures.representative.data && <img src={signatures.representative.data} alt="firma responsable" style={{ maxHeight: '100%' }} />}
                </Box>
                <Typography sx={{ fontWeight: 900, color: '#1e293b', fontSize: '0.85rem' }}>
                  {signatures.representative.name || "---"}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                  Aclaración Responsable
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: 'block', mb: 1 }}
                >
                  Firma Inspector
                </Typography>
                <Box sx={{ height: 100, bgcolor: "white", borderRadius: 3, border: "1px solid #e2e8f0", overflow: 'hidden', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {signatures.inspector.data && <img src={signatures.inspector.data} alt="firma inspector" style={{ maxHeight: '100%' }} />}
                </Box>
                <Typography sx={{ fontWeight: 900, color: '#1e293b', fontSize: '0.85rem' }}>
                  {signatures.inspector.name || "---"}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                  Inspector Interviniente
                </Typography>
              </Box>
            </Box>
          )}

          {/* Botones de Acción de Cierre */}
          <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
            {actualFormatoInspeccion !== "VIRTUAL" && !(signatures.representative.data && signatures.inspector.data) ? (
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => {
                  setSignatureStep(1);
                  setSignatureModalOpen(true);
                }}
                startIcon={<DriveFileRenameOutline />}
                sx={{
                  py: 2,
                  borderRadius: 4,
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  color: "#0ea5e9",
                  border: "2.5px solid #0ea5e9",
                  "&:hover": {
                    border: "2.5px solid #0284c7",
                    bgcolor: "#f0f9ff",
                  },
                }}
              >
                FIRMAR ACTA (DIGITAL / TÁCTIL)
              </Button>
            ) : (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => handleOpenCloseActa("RECHAZAR")}
                  sx={{
                    py: 2,
                    borderRadius: 4,
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    bgcolor: "#dc2626",
                    boxShadow: "0 10px 15px -3px rgba(220, 38, 38, 0.3)",
                    "&:hover": { bgcolor: "#b91c1c" },
                  }}
                >
                  RECHAZAR ACTA
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => handleOpenCloseActa("APROBAR")}
                  sx={{
                    py: 2,
                    borderRadius: 4,
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    bgcolor: "#059669",
                    boxShadow: "0 10px 15px -3px rgba(5, 150, 105, 0.3)",
                    "&:hover": { bgcolor: "#047857" },
                  }}
                >
                  APROBAR ACTA
                </Button>

                {hasObservations && (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => handleOpenCloseActa("NO APROBAR")}
                    sx={{
                      py: 2,
                      borderRadius: 4,
                      fontWeight: 900,
                      fontSize: "1.1rem",
                      bgcolor: "#ef4444",
                      boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)",
                      "&:hover": { bgcolor: "#dc2626" },
                    }}
                  >
                    OBSERVAR / NO APROBAR
                  </Button>
                )}
              </>
            )}
          </Stack>

          {/* Barra Flotante Inferior Siempre Visible */}
          <Paper
            elevation={6}
            sx={{
              position: "sticky",
              bottom: 20,
              zIndex: 1000,
              p: 2,
              mt: 4,
              borderRadius: 4,
              bgcolor: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(8px)",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Chip
                label={`ACTA ${currentActaNum}`}
                size="small"
                sx={{ fontWeight: 900, bgcolor: "#0090d0", color: "white" }}
              />
              <Typography variant="body2" sx={{ fontWeight: 800, color: "#1e293b" }}>
                {hasObservations 
                  ? `⚠️ ${obsCount} observación${obsCount > 1 ? 'es' : ''} registrada${obsCount > 1 ? 's' : ''}` 
                  : "✓ Sin observaciones registradas"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
              <Button
                variant="contained"
                onClick={() => handleOpenCloseActa("RECHAZAR")}
                sx={{
                  fontWeight: 900,
                  px: 3,
                  py: 1.2,
                  borderRadius: 2.5,
                  bgcolor: "#dc2626",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.35)",
                  "&:hover": { bgcolor: "#b91c1c" },
                }}
              >
                RECHAZAR ACTA
              </Button>

              {!allSigned ? (
                <Button
                  variant="outlined"
                  onClick={handleOpenSignatureModal}
                  sx={{
                    fontWeight: 900,
                    px: 3,
                    py: 1.2,
                    borderRadius: 2.5,
                    color: "#0284c7",
                    borderColor: "#0284c7",
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2, bgcolor: "#f0f9ff" },
                  }}
                >
                  FIRMAR ACTA
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => handleOpenCloseActa(hasObservations ? "NO APROBAR" : "APROBAR")}
                  sx={{
                    fontWeight: 900,
                    px: 3,
                    py: 1.2,
                    borderRadius: 2.5,
                    bgcolor: hasObservations ? "#ea580c" : "#059669",
                    "&:hover": { bgcolor: hasObservations ? "#c2410c" : "#047857" },
                  }}
                >
                  {hasObservations ? "OBSERVAR" : "APROBAR"}
                </Button>
              )}
            </Stack>
          </Paper>
        </>
      )}

      {/* Modal de Firmas */}
      <SignatureModal
        open={signatureModalOpen}
        step={signatureStep}
        onClose={() => {
          setSignatureModalOpen(false);
          setSignatureStep(0);
        }}
        onSave={handleSaveSignature}
      />

      {/* Diálogo de Cierre / Nota Final / Rechazo */}
      <Dialog
        open={closeActaModalOpen}
        onClose={() => setCloseActaModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: closeActaAction === "RECHAZAR" ? '#dc2626' : '#1e293b', pb: 1 }}>
          {closeActaAction === "RECHAZAR" ? "Rechazar Acta de Inspección" : `Nota de Cierre - ${closeActaAction}`}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748b', mb: 3 }}>
            {closeActaAction === "RECHAZAR"
              ? "Indique la fundamentación o motivo técnico del rechazo del acta. Esta acción finalizará la inspección con dictamen de rechazo:"
              : `Ingrese una nota o dictamen final antes de ${closeActaAction.toLowerCase()} la inspección.`}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={closeActaAction === "RECHAZAR" ? "Escriba los motivos del rechazo del acta..." : "Escriba el dictamen o nota de cierre..."}
            value={closeActaNote}
            onChange={(e) => setCloseActaNote(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "#f8fafc",
                "&.Mui-focused": { bgcolor: "white" }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ pt: 2, px: 3, pb: 2 }}>
          <Button 
            onClick={() => setCloseActaModalOpen(false)} 
            sx={{ color: '#64748b', fontWeight: 700 }}
          >
            CANCELAR
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmCierre}
            sx={{
              bgcolor: closeActaAction === "APROBAR" ? "#059669" : "#dc2626",
              fontWeight: 800,
              borderRadius: 2,
              px: 3,
              "&:hover": {
                bgcolor: closeActaAction === "APROBAR" ? "#047857" : "#b91c1c"
              }
            }}
          >
            {closeActaAction === "RECHAZAR" ? "CONFIRMAR RECHAZO" : "CONFIRMAR CIERRE"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PantallaInspeccion;
