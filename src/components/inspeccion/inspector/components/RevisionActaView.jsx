import React, { useState, useMemo } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  ChatBubble as ChatBubbleIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  ReportProblem as ReportProblemIcon,
  Message as MessageIcon,
  PhotoCamera,
} from "@mui/icons-material";
import ReporteInspeccionPDF from "../../../../ReporteInspeccion.pdf";

const RevisionActaView = ({
  obsGenerales = [],
  obsTramite = [],
  onIniciarNuevaActa,
  onEmplazarFinalizado,
  onAceptarReinspeccion,
  onValidate,
  onVolver,
  onIrAInspeccion,
  showIrAInspeccion = false,
  rol = null,
}) => {
  // Pestañas: 0 = ACTA 1, 1 = ACTA 2 (Respuesta Emplazamiento), 2 = ACTA 3 (Aprobada)
  const [activeTab, setActiveTab] = useState(1);
  const [statuses, setStatuses] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [openActaPopup, setOpenActaPopup] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState(null);
  const [emplazarDialog, setEmplazarDialog] = useState(false);
  const [reinspeccionModalOpen, setReinspeccionModalOpen] = useState(false);
  const [diasEmplazamiento, setDiasEmplazamiento] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [commentDialog, setCommentDialog] = useState({ open: false, id: null, text: "" });
  const [obsDialog, setObsDialog] = useState({ open: false, text: "" });

  const getFechaVencimiento = (plazoStr) => {
    if (!plazoStr) return null;
    const parts = plazoStr.trim().split(" ");
    if (parts.length < 2) return null;
    const amount = parseInt(parts[0], 10);
    const unit = parts[1].toLowerCase();
    
    if (isNaN(amount)) return null;

    const fecha = new Date();
    const feriados = [
      "01-01", "02-16", "02-17", "03-24", "04-02", "04-03", "05-01", "05-25", 
      "06-17", "06-20", "07-09", "08-17", "10-12", "11-20", "12-08", "12-25"
    ];

    const isFeriadoDate = (d) => {
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return feriados.includes(`${month}-${day}`);
    };

    const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

    if (unit.startsWith("hora")) {
      fecha.setHours(fecha.getHours() + amount);
      while (isWeekend(fecha) || isFeriadoDate(fecha)) {
        fecha.setDate(fecha.getDate() + 1);
      }
    } else if (unit.startsWith("día") || unit.startsWith("dia")) {
      let daysAdded = 0;
      while (daysAdded < amount) {
        fecha.setDate(fecha.getDate() + 1);
        if (!isWeekend(fecha) && !isFeriadoDate(fecha)) {
          daysAdded++;
        }
      }
    } else if (unit.startsWith("semana")) {
      let daysAdded = 0;
      const totalDays = amount * 5;
      while (daysAdded < totalDays) {
        fecha.setDate(fecha.getDate() + 1);
        if (!isWeekend(fecha) && !isFeriadoDate(fecha)) {
          daysAdded++;
        }
      }
    } else {
      return null;
    }

    return { fecha };
  };

  const vencimiento = getFechaVencimiento(diasEmplazamiento);

  const handleUpdateStatus = (id, status) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  };

  // 1. DATOS ESTRUCTURADOS ESTRICTAMENTE SEGÚN CADA ROL:
  // - INSPECTOR: Datos Generales
  // - ARQUITECTURA: Planos
  // - AUDITOR: Resto de los steps del trámite
  const dataActa2 = useMemo(() => {
    if (rol === "ARQUITECTO") {
      return {
        mainTitle: "Planos y Arquitectura",
        otherTitle: "DATOS TRAMITE Y GENERALES",
        otherCount: 28,
        otherHelp: "Competencia evaluada por Auditoría e Inspección",
        sections: [
          {
            category: "PLANO GENERAL DE ARQUITECTURA",
            items: [
              {
                id: "DISTRIBUCIÓN DE ÁREAS Y CIRCULACIONES",
                elemento: "DISTRIBUCIÓN DE ÁREAS Y CIRCULACIONES",
                statusObs: "NO CUMPLE",
                obs: "El plano de edificación presentado no coincide con la distribución espacial actual de consultorios y circulaciones asistenciales.",
                respuesta: "Se adjunta plano digital visado por el Colegio de Arquitectos con firma digital oficial válida y distribución conforme a obra.",
                evidence: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
              },
            ],
          },
          {
            category: "PLANO DE EVACUACIÓN Y SALIDAS DE EMERGENCIA",
            items: [
              {
                id: "VÍAS DE ESCAPE Y ANCHO DE PASILLOS",
                elemento: "VÍAS DE ESCAPE Y ANCHO DE PASILLOS",
                statusObs: "NO CUMPLE",
                obs: "Ancho libre de pasillo de evacuación inferior al estándar reglamentario y fecha de plano de evacuación vencida.",
                respuesta: "Se removieron tabiques provisorios y se amplió el pasillo central a 2.40 metros libres conforme a plano de evacuación aprobado.",
                evidence: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
              },
            ],
          },
          {
            category: "PLANO DE QUIRÓFANOS Y METRAJE DE CAMAS",
            items: [
              {
                id: "METRAJE REGLAMENTARIO DE INTERNACIÓN (M² POR CAMA)",
                elemento: "METRAJE REGLAMENTARIO DE INTERNACIÓN (M² POR CAMA)",
                statusObs: "NO CUMPLE",
                obs: "Excedente de camas transitorias que no respeta los metros cuadrados mínimos por cama exigidos por Ley 9847.",
                respuesta: "Se retiraron 4 camas excedentes ajustando la superficie reglamentaria a 7.5 m² mínimos por unidad en plano adjunto.",
                evidence: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
              },
            ],
          },
          {
            category: "RADIOFÍSICA: BLINDAJE Y MEMORIA TÉCNICA",
            items: [
              {
                id: "PLANO DE BLINDAJE PLOMADO EN RAYOS X (2MM PB)",
                elemento: "PLANO DE BLINDAJE PLOMADO EN RAYOS X (2MM PB)",
                statusObs: "NO CUMPLE",
                obs: "Falta cálculo de blindaje y especificación técnica en plano de lámina de plomo en puerta de acceso y panel de comando.",
                respuesta: "Se instaló revestimiento de plomo de 2mm Pb con certificado de conformidad técnica y plano de radiofísica visado.",
                evidence: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
              },
            ],
          },
        ],
      };
    }

    if (rol === "AUDITOR") {
      return {
        mainTitle: "Datos Trámite (Auditoría Técnica)",
        otherTitle: "DATOS GENERALES Y PLANOS",
        otherCount: 10,
        otherHelp: "Competencia evaluada por Inspector y Arquitectura",
        sections: [
          {
            category: "SECTOR DE INTERNACIÓN CUMPLE Y AREA DE RESIDUOS",
            items: [
              {
                id: "CONTRATO DE RESIDUOS PATÓGENOS Y ÚLTIMO MANIFIESTO",
                elemento: "CONTRATO DE RESIDUOS PATÓGENOS Y ÚLTIMO MANIFIESTO",
                statusObs: "NO CUMPLE",
                obs: "Contrato de servicio de recolección de residuos patógenos vencido o sin comprobante de última recolección.",
                respuesta: "Se adjunta prórroga de contrato con empresa recolectora habilitada y último manifiesto ambiental de retiro de residuos.",
                evidence: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800",
              },
            ],
          },
          {
            category: "SERVICIOS Y ÁREA QUIRÚRGICA",
            items: [
              {
                id: "HABILITACIÓN OPERATIVA DE QUIRÓFANOS",
                elemento: "HABILITACIÓN OPERATIVA DE QUIRÓFANOS",
                statusObs: "NO CUMPLE",
                obs: "No se constatan 6 quirófanos operativos con equipamiento biomédico y anestesiología activa (declarados 11, operativos 5).",
                respuesta: "Los 6 quirófanos restantes finalizaron obras de reacondicionamiento y cuentan con aparatología calibrada; se adjuntan actas.",
                evidence: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
              },
            ],
          },
          {
            category: "RECURSOS HUMANOS Y DIRECCIÓN MÉDICA",
            items: [
              {
                id: "DESIGNACIÓN FORMAL DE DIRECTOR MÉDICO Y MATRÍCULAS",
                elemento: "DESIGNACIÓN FORMAL DE DIRECTOR MÉDICO Y MATRÍCULAS",
                statusObs: "NO CUMPLE",
                obs: "Falta constancia de designación formal de Director Médico y nómina de cobertura de enfermería para el sector de guardia.",
                respuesta: "Se adjunta acta de designación formal, aceptación del cargo, matrícula provincial habilitante y cronograma mensual de guardias.",
                evidence: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
              },
            ],
          },
          {
            category: "EQUIPAMIENTO BIOMÉDICO",
            items: [
              {
                id: "DESFIBRILADORES DEA Y RESPIRADORES DE ALTA COMPLEJIDAD",
                elemento: "DESFIBRILADORES DEA Y RESPIRADORES DE ALTA COMPLEJIDAD",
                statusObs: "NO CUMPLE",
                obs: "Falta un cardiodesfibrilador operativo en consultorios y dos respiradores declarados se encontraban fuera de servicio.",
                respuesta: "Se incorporó DEA nuevo en sector de consultorios y se adjuntan certificados de calibración y service oficial de respiradores.",
                evidence: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800",
              },
            ],
          },
          {
            category: "LABORATORIO",
            items: [
              {
                id: "HABILITACIÓN POR COBICO Y CONTROL DE CALIDAD",
                elemento: "HABILITACIÓN POR COBICO Y CONTROL DE CALIDAD",
                statusObs: "NO CUMPLE",
                obs: "Falta constancia de habilitación ante COBICO y protocolo de control de calidad analítico interlaboratorio.",
                respuesta: "Se adjunta acreditación ante COBICO y reportes del programa de evaluación externa de calidad.",
                evidence: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800",
              },
            ],
          },
        ],
      };
    }

    // INSPECTOR (Default): Datos Generales exactamente como en la imagen
    return {
      mainTitle: "Datos Generales",
      otherTitle: "DATOS TRAMITE",
      otherCount: 30,
      otherHelp: "Competencia evaluada en trámite de Auditoría y Arquitectura",
      sections: [
        {
          category: "SECTOR DE INTERNACIÓN CUMPLE Y AREA DE RESIDUOS",
          items: [
            {
              id: "CONDICIONES EDILICIAS",
              elemento: "CONDICIONES EDILICIAS",
              statusObs: "NO CUMPLE",
              obs: "Condiciones edilicias deficientes en el sector de internación general y falta de delimitación del área de residuos patógenos.",
              respuesta: "Se realizaron reparaciones edilicias, pintura sanitizante y se delimitó adecuadamente el depósito transitorio de residuos patógenos.",
              evidence: null,
            },
          ],
        },
        {
          category: "LABORATORIO",
          items: [
            {
              id: "HABILITACIÓN POR COBICO",
              elemento: "HABILITACIÓN POR COBICO",
              statusObs: "NO CUMPLE",
              obs: "Falta comprobante de habilitación técnica del laboratorio expedida por el Colegio de Bioquímicos de Córdoba (COBICO).",
              respuesta: "Se adjunta certificado de habilitación y renovación COBICO con matrícula institucional vigente.",
              evidence: null,
            },
          ],
        },
      ],
    };
  }, [rol]);

  // Apartados del Trámite evaluados por otros agentes (Arquitectura y Auditoría)
  const apartadosOtrosAgentes = useMemo(() => [
    {
      id: "step_arq",
      stepNumber: 1,
      apartado: "Paso 1: Planos y Arquitectura",
      area: "Arquitectura y Edificación",
      rolResponsable: "ARQUITECTO",
      agenteNombre: "Arq. Gonzalo Morales",
      estadoGeneral: "VALIDADO",
      totalItems: 4,
      validados: 4,
      items: [
        {
          id: "DISTRIBUCIÓN DE ÁREAS Y CIRCULACIONES",
          elemento: "DISTRIBUCIÓN DE ÁREAS Y CIRCULACIONES",
          statusObs: "NO CUMPLE",
          obs: "El plano de edificación presentado no coincide con la distribución espacial actual de consultorios y circulaciones asistenciales.",
          respuesta: "Se adjunta plano digital visado por el Colegio de Arquitectos con firma digital oficial válida y distribución conforme a obra.",
          evidence: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
          evaluador: "Arq. Gonzalo Morales (Arquitectura)",
          estado: "VALIDADO",
          fecha: "Hoy, 10:15 hs",
        },
        {
          id: "VÍAS DE ESCAPE Y ANCHO DE PASILLOS",
          elemento: "VÍAS DE ESCAPE Y ANCHO DE PASILLOS",
          statusObs: "NO CUMPLE",
          obs: "Ancho libre de pasillo de evacuación inferior al estándar reglamentario y fecha de plano de evacuación vencida.",
          respuesta: "Se removieron tabiques provisorios y se amplió el pasillo central a 2.40 metros libres conforme a plano de evacuación aprobado.",
          evidence: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
          evaluador: "Arq. Gonzalo Morales (Arquitectura)",
          estado: "VALIDADO",
          fecha: "Hoy, 10:20 hs",
        },
        {
          id: "METRAJE REGLAMENTARIO DE INTERNACIÓN (M² POR CAMA)",
          elemento: "METRAJE REGLAMENTARIO DE INTERNACIÓN (M² POR CAMA)",
          statusObs: "NO CUMPLE",
          obs: "Excedente de camas transitorias que no respeta los metros cuadrados mínimos por cama exigidos por Ley 9847.",
          respuesta: "Se retiraron 4 camas excedentes ajustando la superficie reglamentaria a 7.5 m² mínimos por unidad en plano adjunto.",
          evidence: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
          evaluador: "Arq. Gonzalo Morales (Arquitectura)",
          estado: "VALIDADO",
          fecha: "Hoy, 10:35 hs",
        },
        {
          id: "PLANO DE BLINDAJE PLOMADO EN RAYOS X (2MM PB)",
          elemento: "PLANO DE BLINDAJE PLOMADO EN RAYOS X (2MM PB)",
          statusObs: "NO CUMPLE",
          obs: "Falta cálculo de blindaje y especificación técnica en plano de lámina de plomo en puerta de acceso y panel de comando.",
          respuesta: "Se instaló revestimiento de plomo de 2mm Pb con certificado de conformidad técnica y plano de radiofísica visado.",
          evidence: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
          evaluador: "Arq. Gonzalo Morales (Arquitectura)",
          estado: "VALIDADO",
          fecha: "Hoy, 10:50 hs",
        },
      ],
    },
    {
      id: "step_servicios",
      stepNumber: 4,
      apartado: "Paso 4: Servicios y Quirófanos",
      area: "Auditoría Médica y Asistencial",
      rolResponsable: "AUDITOR",
      agenteNombre: "Dr. Carlos Medina",
      estadoGeneral: "VALIDADO",
      totalItems: 1,
      validados: 1,
      items: [
        {
          id: "HABILITACIÓN OPERATIVA DE QUIRÓFANOS",
          elemento: "HABILITACIÓN OPERATIVA DE QUIRÓFANOS",
          statusObs: "NO CUMPLE",
          obs: "No se constatan 6 quirófanos operativos con equipamiento biomédico y anestesiología activa (declarados 11, operativos 5).",
          respuesta: "Los 6 quirófanos restantes finalizaron obras de reacondicionamiento y cuentan con aparatología calibrada; se adjuntan actas.",
          evidence: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
          evaluador: "Dr. Carlos Medina (Auditoría Médica)",
          estado: "VALIDADO",
          fecha: "Ayer, 16:40 hs",
        },
      ],
    },
    {
      id: "step_rrhh",
      stepNumber: 5,
      apartado: "Paso 5: Recursos Humanos y Dirección Médica",
      area: "Auditoría Sanitaria",
      rolResponsable: "AUDITOR",
      agenteNombre: "Dra. Silvina Romero",
      estadoGeneral: "VALIDADO",
      totalItems: 1,
      validados: 1,
      items: [
        {
          id: "DESIGNACIÓN FORMAL DE DIRECTOR MÉDICO Y MATRÍCULAS",
          elemento: "DESIGNACIÓN FORMAL DE DIRECTOR MÉDICO Y MATRÍCULAS",
          statusObs: "NO CUMPLE",
          obs: "Falta constancia de designación formal de Director Médico y nómina de cobertura de enfermería para el sector de guardia.",
          respuesta: "Se adjunta acta de designación formal, aceptación del cargo, matrícula provincial habilitante y cronograma mensual de guardias.",
          evidence: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
          evaluador: "Dra. Silvina Romero (Auditoría Central)",
          estado: "VALIDADO",
          fecha: "Ayer, 17:15 hs",
        },
      ],
    },
    {
      id: "step_equipos",
      stepNumber: 7,
      apartado: "Paso 7: Equipamiento Biomédico",
      area: "Ingeniería Biomédica",
      rolResponsable: "AUDITOR",
      agenteNombre: "Ing. Marcelo Rossi",
      estadoGeneral: "VALIDADO",
      totalItems: 1,
      validados: 1,
      items: [
        {
          id: "DESFIBRILADORES DEA Y RESPIRADORES DE ALTA COMPLEJIDAD",
          elemento: "DESFIBRILADORES DEA Y RESPIRADORES DE ALTA COMPLEJIDAD",
          statusObs: "NO CUMPLE",
          obs: "Falta un cardiodesfibrilador operativo en consultorios y dos respiradores declarados se encontraban fuera de servicio.",
          respuesta: "Se incorporó DEA nuevo en sector de consultorios y se adjuntan certificados de calibración y service oficial de respiradores.",
          evidence: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800",
          evaluador: "Ing. Marcelo Rossi (Biomédica Rugepresa)",
          estado: "VALIDADO",
          fecha: "Hoy, 09:20 hs",
        },
      ],
    },
    {
      id: "step_residuos",
      stepNumber: 8,
      apartado: "Paso 8: Documentación, Residuos y Bioquímica",
      area: "Auditoría Ambiental y Bioquímica",
      rolResponsable: "AUDITOR",
      agenteNombre: "Auditoría Central Rugepresa",
      estadoGeneral: "VALIDADO",
      totalItems: 2,
      validados: 2,
      items: [
        {
          id: "CONTRATO DE RESIDUOS PATÓGENOS Y ÚLTIMO MANIFIESTO",
          elemento: "CONTRATO DE RESIDUOS PATÓGENOS Y ÚLTIMO MANIFIESTO",
          statusObs: "NO CUMPLE",
          obs: "Contrato de servicio de recolección de residuos patógenos vencido o sin comprobante de última recolección.",
          respuesta: "Se adjunta prórroga de contrato con empresa recolectora habilitada y último manifiesto ambiental de retiro de residuos.",
          evidence: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800",
          evaluador: "Auditoría Ambiental (Rugepresa)",
          estado: "VALIDADO",
          fecha: "Hoy, 11:05 hs",
        },
        {
          id: "HABILITACIÓN POR COBICO Y CONTROL DE CALIDAD",
          elemento: "HABILITACIÓN POR COBICO Y CONTROL DE CALIDAD",
          statusObs: "NO CUMPLE",
          obs: "Falta constancia de habilitación ante COBICO y protocolo de control de calidad analítico interlaboratorio.",
          respuesta: "Se adjunta acreditación ante COBICO y reportes del programa de evaluación externa de calidad.",
          evidence: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800",
          evaluador: "Auditoría Bioquímica (Rugepresa)",
          estado: "VALIDADO",
          fecha: "Hoy, 11:30 hs",
        },
      ],
    },
  ], []);

  const totalOtrosItems = useMemo(() => apartadosOtrosAgentes.reduce((acc, a) => acc + a.totalItems, 0), [apartadosOtrosAgentes]);
  const totalOtrosValidados = useMemo(() => apartadosOtrosAgentes.reduce((acc, a) => acc + a.validados, 0), [apartadosOtrosAgentes]);

  // Cómputo de ítems del rol actual
  const allCurrentItems = useMemo(() => {
    return dataActa2.sections.flatMap((s) => s.items);
  }, [dataActa2]);

  const totalItems = allCurrentItems.length;
  const validadosCount = allCurrentItems.filter((i) => statuses[i.id] === "VALIDADO").length;
  const rechazadosCount = allCurrentItems.filter((i) => statuses[i.id] === "RECHAZADO").length;
  const isAllValidado = totalItems > 0 && validadosCount === totalItems;
  const hasRechazado = rechazadosCount > 0;

  // Render cabecera común de botones PDF y Acta de Inspección
  const renderTopActions = () => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3, gap: 2, flexWrap: "wrap" }}>
      <Button
        variant="outlined"
        onClick={() => window.open(ReporteInspeccionPDF, "_blank")}
        startIcon={<DescriptionIcon sx={{ fontSize: 18 }} />}
        sx={{
          fontWeight: 800,
          borderRadius: 2.5,
          px: 2.5,
          py: 0.8,
          textTransform: "none",
          color: "#005596",
          borderColor: "#005596",
          bgcolor: "#ffffff",
          "&:hover": { bgcolor: "rgba(0, 85, 150, 0.04)", borderColor: "#00447a" },
        }}
      >
        Ver Reporte de Inspección (PDF)
      </Button>
      <Button
        variant="contained"
        onClick={() => setOpenActaPopup(true)}
        startIcon={<AssignmentIcon sx={{ fontSize: 18 }} />}
        sx={{
          fontWeight: 800,
          borderRadius: 2.5,
          px: 2.5,
          py: 0.8,
          textTransform: "none",
          bgcolor: "#005596",
          boxShadow: "0 2px 6px rgba(0, 85, 150, 0.3)",
          "&:hover": { bgcolor: "#00447a" },
        }}
      >
        Ver Acta de Inspección
      </Button>
    </Box>
  );

  // TAB 0: ACTA 1 (Historial inicial)
  const renderActa1 = () => (
    <Box>
      {renderTopActions()}
      <Alert severity="warning" sx={{ mb: 4, borderRadius: 3, borderLeft: "8px solid #f59e0b", fontWeight: 700 }}>
        HISTORIAL ACTA 1: Estos hallazgos corresponden a la inspección inicial. A continuación se presentan los emplazamientos requeridos.
      </Alert>

      <Accordion
        defaultExpanded
        sx={{
          mb: 4,
          borderRadius: "16px !important",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          "&:before": { display: "none" },
          overflow: "hidden",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#0ea5e9" }} />}>
          <Typography sx={{ fontWeight: 900, color: "#005596", fontSize: "1.15rem", py: 0.5 }}>
            RESPUESTA EMPLAZAMIENTO (ACTA 1)
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 4, bgcolor: "#f8fafc" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "white", borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 850, color: "#1e293b", mb: 1 }}>
                REGISTROS Y CONDICIONES INICIALES CONSTATADAS
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Durante la visita de inspección inicial se formularon emplazamientos respecto a condiciones de habilitación, señalización de seguridad y libros sanitarios obligatorios.
              </Typography>
            </Paper>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  // TAB 1: ACTA 2 (Respuesta Emplazamiento - Exacto a la Foto 2)
  const renderActa2 = () => {
    return (
      <Box>
        {renderTopActions()}

        {/* ACCORDION PRINCIPAL: RESPUESTA EMPLAZAMIENTO (ACTA 2) */}
        <Accordion
          defaultExpanded
          sx={{
            mb: 3,
            borderRadius: "16px !important",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            "&:before": { display: "none" },
            overflow: "hidden",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#0ea5e9" }} />}>
            <Typography sx={{ fontWeight: 900, color: "#005596", fontSize: "1.15rem", py: 0.5 }}>
              RESPUESTA EMPLAZAMIENTO (ACTA 2)
            </Typography>
          </AccordionSummary>

          <AccordionDetails sx={{ px: { xs: 1.5, sm: 3 }, pb: 4, bgcolor: "#ffffff" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              
              {/* GRUPO PRINCIPAL CON PILL DE CONTEO (Ej: Datos Generales 0/2 (0%)) */}
              <Accordion
                defaultExpanded
                variant="outlined"
                sx={{
                  borderRadius: "12px !important",
                  borderColor: "#e2e8f0",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#64748b" }} />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: "0.95rem" }}>
                      {dataActa2.mainTitle}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        bgcolor: "#0284c7",
                        color: "white",
                        borderRadius: "12px",
                        px: 1.2,
                        py: 0.1,
                        fontWeight: 900,
                        fontSize: "0.72rem",
                        letterSpacing: 0.3,
                      }}
                    >
                      {validadosCount}/{totalItems} ({Math.round((validadosCount / (totalItems || 1)) * 100)}%)
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: { xs: 1, sm: 2 }, pt: 0, bgcolor: "#ffffff" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {dataActa2.sections.map((section) => {
                      const secValidados = section.items.filter((i) => statuses[i.id] === "VALIDADO").length;
                      const secTotal = section.items.length;
                      const secPercent = Math.round((secValidados / (secTotal || 1)) * 100);

                      return (
                        <Accordion
                          key={section.category}
                          defaultExpanded
                          variant="outlined"
                          sx={{
                            borderRadius: "10px !important",
                            borderColor: "#cbd5e1",
                            overflow: "hidden",
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#64748b" }} />}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Typography sx={{ fontWeight: 850, color: "#005596", fontSize: "0.85rem", textTransform: "uppercase" }}>
                                {section.category}
                              </Typography>
                              <Box
                                component="span"
                                sx={{
                                  bgcolor: "#0284c7",
                                  color: "white",
                                  borderRadius: "12px",
                                  px: 1,
                                  py: 0.05,
                                  fontWeight: 850,
                                  fontSize: "0.68rem",
                                }}
                              >
                                {secValidados}/{secTotal} ({secPercent}%)
                              </Box>
                            </Box>
                          </AccordionSummary>

                          <AccordionDetails sx={{ p: 0 }}>
                            {/* Cabecera de la tabla idéntica a la Foto 2 */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                bgcolor: "#f1f5f9",
                                py: 1.2,
                                px: 2,
                                borderBottom: "1px solid #cbd5e1",
                              }}
                            >
                              <Typography sx={{ fontWeight: 750, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                OBSERVACIÓN / REQUISITO
                              </Typography>
                              <Stack direction="row" spacing={2} sx={{ width: 280, justifyContent: "flex-end", pr: 1 }}>
                                <Typography sx={{ fontWeight: 750, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", width: 110, textAlign: "center" }}>
                                  VER EVIDENCIA
                                </Typography>
                                <Typography sx={{ fontWeight: 750, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", width: 150, textAlign: "center" }}>
                                  SUBIR RESPUESTA
                                </Typography>
                              </Stack>
                            </Box>

                            {/* Filas de la tabla */}
                            {section.items.map((row) => {
                              const currentStatus = statuses[row.id];
                              return (
                                <Box
                                  key={row.id}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    borderTop: "1px solid #f1f5f9",
                                    py: 2.2,
                                    px: 2,
                                    transition: "background-color 0.2s",
                                    "&:hover": { bgcolor: "#f8fafc" },
                                  }}
                                >
                                  {/* Columna 1: Nombre de Requisito + Estado NO CUMPLE en rojo */}
                                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, flex: 1, pr: 2 }}>
                                    <Typography sx={{ fontWeight: 850, color: "#1e293b", fontSize: "0.88rem", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                                      {row.elemento}
                                    </Typography>
                                    
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                      <ErrorIcon sx={{ color: "#dc2626", fontSize: 16 }} />
                                      <Typography sx={{ color: "#dc2626", fontWeight: 850, fontSize: "0.78rem" }}>
                                        {row.statusObs}
                                      </Typography>
                                    </Box>

                                    {/* Detalle de observación del inspector y descargo del efector */}
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mt: 0.4 }}>
                                      <b>Obs:</b> {row.obs}
                                    </Typography>
                                    {row.respuesta && (
                                      <Typography variant="caption" sx={{ color: "#0f766e", fontWeight: 600, bgcolor: "#f0fdfa", p: 0.8, borderRadius: 1.5, border: "1px solid #ccfbf1", mt: 0.2 }}>
                                        <b>Descargo Efector:</b> "{row.respuesta}"
                                      </Typography>
                                    )}
                                  </Box>

                                  {/* Columnas 2 y 3: Ver Evidencia + Subir Respuesta / Evaluación */}
                                  <Stack direction="row" spacing={2} sx={{ width: 280, justifyContent: "flex-end", alignItems: "center" }}>
                                    {/* Ver evidencia */}
                                    <Box sx={{ width: 110, display: "flex", justifyContent: "center" }}>
                                      {row.evidence ? (
                                        <Tooltip title="Ver comprobante adjunto">
                                          <IconButton
                                            size="small"
                                            onClick={() => setViewerPhoto(row.evidence)}
                                            sx={{ color: "#0ea5e9", bgcolor: "rgba(14, 165, 233, 0.08)", "&:hover": { bgcolor: "rgba(14, 165, 233, 0.16)" } }}
                                          >
                                            <VisibilityIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      ) : (
                                        <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 700 }}>
                                          -
                                        </Typography>
                                      )}
                                    </Box>

                                    {/* Subir respuesta / Evaluación por el Agente */}
                                    <Box sx={{ width: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8 }}>
                                      {/* Icono de nube azul (como en la Foto 2) */}
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CloudUploadIcon sx={{ color: "#005596", fontSize: 22 }} />
                                        
                                        {/* Botones de acción del agente evaluador */}
                                        <Tooltip title="Validar observación">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleUpdateStatus(row.id, "VALIDADO")}
                                            sx={{
                                              color: currentStatus === "VALIDADO" ? "white" : "#16a34a",
                                              bgcolor: currentStatus === "VALIDADO" ? "#16a34a" : "#f0fdf4",
                                              border: `1px solid ${currentStatus === "VALIDADO" ? "#15803d" : "#bbf7d0"}`,
                                              p: 0.5,
                                              "&:hover": { bgcolor: currentStatus === "VALIDADO" ? "#15803d" : "#dcfce7" },
                                            }}
                                          >
                                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                                          </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Rechazar observación">
                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              handleUpdateStatus(row.id, "RECHAZADO");
                                              if (!comentarios[row.id]) {
                                                setCommentDialog({ open: true, id: row.id, text: "" });
                                              }
                                            }}
                                            sx={{
                                              color: currentStatus === "RECHAZADO" ? "white" : "#dc2626",
                                              bgcolor: currentStatus === "RECHAZADO" ? "#dc2626" : "#fef2f2",
                                              border: `1px solid ${currentStatus === "RECHAZADO" ? "#b91c1c" : "#fecaca"}`,
                                              p: 0.5,
                                              "&:hover": { bgcolor: currentStatus === "RECHAZADO" ? "#b91c1c" : "#fee2e2" },
                                            }}
                                          >
                                            <CloseIcon sx={{ fontSize: 16 }} />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>

                                      {/* Badge de estado de validación */}
                                      {currentStatus === "VALIDADO" && (
                                        <Chip label="VALIDADO" size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 900, bgcolor: "#dcfce7", color: "#15803d" }} />
                                      )}
                                      {currentStatus === "RECHAZADO" && (
                                        <Chip label="RECHAZADO" size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 900, bgcolor: "#fee2e2", color: "#b91c1c" }} />
                                      )}
                                    </Box>
                                  </Stack>
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

              {/* GRUPO SECUNDARIO: DATOS DEL TRÁMITE (PROGRESO DE OTROS AGENTES) */}
              <Accordion
                defaultExpanded={false}
                variant="outlined"
                sx={{
                  borderRadius: "12px !important",
                  borderColor: "#e2e8f0",
                  "&:before": { display: "none" },
                  overflow: "hidden",
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#64748b" }} />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: "0.95rem" }}>
                      {rol === "ARQUITECTO"
                        ? "DATOS TRAMITE Y GENERALES"
                        : rol === "AUDITOR"
                        ? "DATOS GENERALES Y PLANOS"
                        : "DATOS DEL TRÁMITE (PROGRESO DE OTROS AGENTES)"}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        bgcolor: "#059669",
                        color: "white",
                        borderRadius: "12px",
                        px: 1.2,
                        py: 0.1,
                        fontWeight: 900,
                        fontSize: "0.72rem",
                        letterSpacing: 0.3,
                      }}
                    >
                      {totalOtrosValidados}/{totalOtrosItems} ({Math.round((totalOtrosValidados / (totalOtrosItems || 1)) * 100)}%)
                    </Box>
                    <Chip
                      label="Arquitectura: 4/4 (100%)"
                      size="small"
                      sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 750, fontSize: "0.68rem", height: 20 }}
                    />
                    <Chip
                      label="Auditoría: 5/5 (100%)"
                      size="small"
                      sx={{ bgcolor: "#f0fdf4", color: "#15803d", fontWeight: 750, fontSize: "0.68rem", height: 20 }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: "#f8fafc" }}>
                  {/* Banner explicativo para el Inspector */}
                  <Alert
                    severity="info"
                    icon={<InfoIcon sx={{ color: "#0284c7" }} />}
                    sx={{
                      mb: 2.5,
                      borderRadius: 2.5,
                      bgcolor: "#f0f9ff",
                      border: "1px solid #bae6fd",
                      "& .MuiAlert-message": { fontSize: "0.85rem", color: "#0369a1", lineHeight: 1.5 },
                    }}
                  >
                    <b>Control de Competencia y Progreso del Trámite:</b> Los apartados a continuación corresponden a los requisitos técnicos y documentales evaluados por el <b>Agente Arquitecto</b> y el <b>Agente Auditor</b>. Como Inspector, puede consultar las evidencias y el estado de validación de cada área para constatar el avance integral antes de solicitar la re-inspección en terreno.
                  </Alert>

                  {/* Tarjetas resumen por Agente Interviniente */}
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: "#bfdbfe", bgcolor: "#ffffff" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <DescriptionIcon sx={{ color: "#2563eb", fontSize: 20 }} />
                          <Typography sx={{ fontWeight: 850, fontSize: "0.9rem", color: "#1e293b" }}>
                            Agente Arquitecto
                          </Typography>
                        </Box>
                        <Chip label="4/4 VALIDADO" size="small" sx={{ bgcolor: "#dbeafe", color: "#1e40af", fontWeight: 850, fontSize: "0.68rem", height: 20 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1.2 }}>
                        Responsable: <b>Arq. Gonzalo Morales</b> · Planos, distribución espacial, vías de escape y radiofísica.
                      </Typography>
                      <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3, bgcolor: "#e2e8f0", "& .MuiLinearProgress-bar": { bgcolor: "#2563eb" } }} />
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: "#bbf7d0", bgcolor: "#ffffff" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                          <Typography sx={{ fontWeight: 850, fontSize: "0.9rem", color: "#1e293b" }}>
                            Agente Auditor
                          </Typography>
                        </Box>
                        <Chip label="5/5 VALIDADO" size="small" sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 850, fontSize: "0.68rem", height: 20 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1.2 }}>
                        Responsable: <b>Auditoría Técnica Rugepresa</b> · Quirófanos, RRHH, equipamiento biomédico y residuos.
                      </Typography>
                      <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3, bgcolor: "#e2e8f0", "& .MuiLinearProgress-bar": { bgcolor: "#16a34a" } }} />
                    </Paper>
                  </Box>

                  {/* Desglose detallado por Apartados / Steps del Trámite */}
                  <Typography sx={{ fontWeight: 900, color: "#334155", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
                    Apartados del Trámite ({apartadosOtrosAgentes.length} apartados evaluados)
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {apartadosOtrosAgentes.map((ap) => (
                      <Accordion
                        key={ap.id}
                        defaultExpanded={false}
                        variant="outlined"
                        sx={{
                          borderRadius: "10px !important",
                          borderColor: "#cbd5e1",
                          overflow: "hidden",
                          bgcolor: "#ffffff",
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#64748b" }} />}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", width: "100%", pr: 1 }}>
                            <Typography sx={{ fontWeight: 850, color: "#0f172a", fontSize: "0.88rem" }}>
                              {ap.apartado}
                            </Typography>
                            <Chip
                              label={ap.rolResponsable === "ARQUITECTO" ? "ARQUITECTURA" : "AUDITORÍA"}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                fontWeight: 850,
                                bgcolor: ap.rolResponsable === "ARQUITECTO" ? "#eff6ff" : "#f0fdf4",
                                color: ap.rolResponsable === "ARQUITECTO" ? "#1d4ed8" : "#15803d",
                                border: `1px solid ${ap.rolResponsable === "ARQUITECTO" ? "#bfdbfe" : "#bbf7d0"}`
                              }}
                            />
                            <Chip
                              label={`${ap.validados}/${ap.totalItems} Validado`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                fontWeight: 850,
                                bgcolor: "#dcfce7",
                                color: "#15803d",
                                ml: "auto"
                              }}
                            />
                          </Box>
                        </AccordionSummary>

                        <AccordionDetails sx={{ p: 0 }}>
                          {/* Cabecera de la tabla */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              bgcolor: "#f1f5f9",
                              py: 1,
                              px: 2,
                              borderBottom: "1px solid #cbd5e1",
                            }}
                          >
                            <Typography sx={{ fontWeight: 750, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              OBSERVACIÓN / REQUISITO
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ width: 320, justifyContent: "flex-end", pr: 1 }}>
                              <Typography sx={{ fontWeight: 750, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", width: 110, textAlign: "center" }}>
                                VER EVIDENCIA
                              </Typography>
                              <Typography sx={{ fontWeight: 750, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", width: 190, textAlign: "center" }}>
                                EVALUACIÓN DEL AGENTE
                              </Typography>
                            </Stack>
                          </Box>

                          {/* Filas de requisitos */}
                          {ap.items.map((item) => (
                            <Box
                              key={item.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderTop: "1px solid #f1f5f9",
                                py: 2,
                                px: 2,
                                "&:hover": { bgcolor: "#f8fafc" },
                              }}
                            >
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1, pr: 2 }}>
                                <Typography sx={{ fontWeight: 850, color: "#1e293b", fontSize: "0.85rem", textTransform: "uppercase" }}>
                                  {item.elemento}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                  <ErrorIcon sx={{ color: "#dc2626", fontSize: 16 }} />
                                  <Typography sx={{ color: "#dc2626", fontWeight: 850, fontSize: "0.75rem" }}>
                                    {item.statusObs}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mt: 0.3 }}>
                                  <b>Obs:</b> {item.obs}
                                </Typography>
                                {item.respuesta && (
                                  <Typography variant="caption" sx={{ color: "#0f766e", fontWeight: 600, bgcolor: "#f0fdfa", p: 0.8, borderRadius: 1.5, border: "1px solid #ccfbf1", mt: 0.2 }}>
                                    <b>Descargo Efector:</b> "{item.respuesta}"
                                  </Typography>
                                )}
                              </Box>

                              <Stack direction="row" spacing={2} sx={{ width: 320, justifyContent: "flex-end", alignItems: "center" }}>
                                <Box sx={{ width: 110, display: "flex", justifyContent: "center" }}>
                                  {item.evidence ? (
                                    <Tooltip title="Ver comprobante o plano adjunto">
                                      <IconButton
                                        size="small"
                                        onClick={() => setViewerPhoto(item.evidence)}
                                        sx={{ color: "#0ea5e9", bgcolor: "rgba(14, 165, 233, 0.08)", "&:hover": { bgcolor: "rgba(14, 165, 233, 0.16)" } }}
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  ) : (
                                    <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 700 }}>
                                      -
                                    </Typography>
                                  )}
                                </Box>

                                <Box sx={{ width: 190, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.3 }}>
                                  <Chip
                                    icon={<CheckCircleIcon sx={{ fontSize: "14px !important", color: "#15803d !important" }} />}
                                    label="VALIDADO"
                                    size="small"
                                    sx={{ height: 22, fontSize: "0.68rem", fontWeight: 900, bgcolor: "#dcfce7", color: "#15803d" }}
                                  />
                                  <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "#64748b", textAlign: "center", lineHeight: 1.2 }}>
                                    {item.evaluador}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>

            </Box>
          </AccordionDetails>
        </Accordion>

        {/* CONCLUSIÓN GENERAL DE LA INSPECCIÓN (Idéntico a la Foto 2) */}
        <Box sx={{ mt: 3, mb: 4 }}>
          <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: "0.95rem", textTransform: "uppercase", mb: 1 }}>
            CONCLUSIÓN GENERAL DE LA INSPECCIÓN
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2.2,
              bgcolor: "#fffbeb",
              border: "1.5px solid #fef3c7",
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: "#d97706", fontWeight: 750, fontSize: "0.9rem" }}>
              Corregir
            </Typography>
          </Paper>
        </Box>

        {/* BARRA INFERIOR DE ACCIONES */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #e2e8f0",
            pt: 3,
            mt: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={onVolver}
            sx={{
              fontWeight: 850,
              borderRadius: 3,
              px: 4,
              py: 1,
              textTransform: "none",
              borderColor: "#005596",
              color: "#005596",
              "&:hover": { borderColor: "#00447a", bgcolor: "rgba(0, 85, 150, 0.04)" },
            }}
          >
            Volver
          </Button>

          <Stack direction="row" spacing={2}>
            {showIrAInspeccion && onIrAInspeccion && (
              <Button
                variant="outlined"
                onClick={onIrAInspeccion}
                sx={{
                  fontWeight: 800,
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  borderColor: "#0ea5e9",
                  color: "#0ea5e9",
                }}
              >
                Ir a Formulario de Inspección
              </Button>
            )}

            <Button
              variant="contained"
              disabled={!hasRechazado}
              onClick={() => setEmplazarDialog(true)}
              sx={{
                fontWeight: 900,
                fontSize: "0.9rem",
                px: 4,
                py: 1.2,
                borderRadius: 3,
                bgcolor: "#dc2626",
                boxShadow: hasRechazado ? "0 4px 14px rgba(220, 38, 38, 0.35)" : "none",
                "&:hover": { bgcolor: "#b91c1c" },
                "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
              }}
            >
              EMPLAZAR
            </Button>

            <Button
              variant="contained"
              disabled={!isAllValidado}
              onClick={() => setReinspeccionModalOpen(true)}
              startIcon={rol === "ARQUITECTO" || rol === "AUDITOR" ? <CheckCircleIcon /> : <AssignmentIcon />}
              sx={{
                fontWeight: 900,
                fontSize: "0.9rem",
                px: 4,
                py: 1.2,
                borderRadius: 3,
                bgcolor: "#059669",
                boxShadow: isAllValidado ? "0 4px 14px rgba(5, 150, 105, 0.35)" : "none",
                "&:hover": { bgcolor: "#047857" },
                "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
              }}
            >
              {rol === "ARQUITECTO" || rol === "AUDITOR" ? "APROBAR EVALUACIÓN" : "SOLICITUD DE REINSPECCIÓN"}
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  };

  // TAB 2: ACTA 3 (Aprobada - Exacto a la Foto 1)
  const renderActa3 = () => (
    <Box>
      {renderTopActions()}

      {/* Banner Verde: INSPECCIÓN APROBADA (Idéntico a la Foto 1) */}
      <Alert
        severity="success"
        icon={<CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 26 }} />}
        sx={{
          mb: 4,
          borderRadius: 3,
          bgcolor: "#edf7ed",
          borderLeft: "8px solid #2e7d32",
          py: 1.5,
          "& .MuiAlert-message": { p: 0 },
        }}
      >
        <Typography sx={{ fontWeight: 950, color: "#1b5e20", fontSize: "1.05rem", textTransform: "uppercase" }}>
          INSPECCIÓN APROBADA
        </Typography>
        <Typography variant="body2" sx={{ color: "#1b5e20", fontWeight: 650, mt: 0.3 }}>
          El proceso de inspección fue aprobado, su trámite puede continuar.
        </Typography>
      </Alert>

      {/* Acordeón: CONCLUSIÓN FINAL DEL ACTA (Idéntico a la Foto 1) */}
      <Accordion
        defaultExpanded
        sx={{
          mb: 4,
          borderRadius: "16px !important",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          "&:before": { display: "none" },
          overflow: "hidden",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#0ea5e9" }} />}>
          <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: "1.15rem", py: 0.5 }}>
            CONCLUSIÓN FINAL DEL ACTA
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 4, bgcolor: "#ffffff" }}>
          <Box sx={{ pt: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 900,
                color: "#1e293b",
                mb: 1.5,
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ChatBubbleIcon sx={{ color: "#0ea5e9", fontSize: 20 }} /> OBSERVACIÓN GENERAL
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                bgcolor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 3,
              }}
            >
              <Typography variant="body2" sx={{ color: "#166534", fontWeight: 700, fontStyle: "italic", fontSize: "0.95rem" }}>
                "Se aprueba la inspección. El establecimiento cumple con las normativas vigentes."
              </Typography>
            </Paper>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Botón Volver (Idéntico a la Foto 1) */}
      <Box sx={{ borderTop: "2px solid #e2e8f0", pt: 3, mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onVolver}
          sx={{
            fontWeight: 850,
            borderRadius: 3,
            px: 4,
            py: 1,
            textTransform: "none",
            borderColor: "#005596",
            color: "#005596",
            "&:hover": { borderColor: "#00447a", bgcolor: "rgba(0, 85, 150, 0.04)" },
          }}
        >
          Volver
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", animation: "fadeIn 0.25s ease-in-out" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Título: Acta de Inspección (Idéntico a las Fotos 1 y 2) */}
      <Box sx={{ mb: 3.5, borderBottom: "3px solid #005596", pb: 1.5 }}>
        <Typography variant="h3" sx={{ color: "#005596", fontWeight: 950, letterSpacing: -2 }}>
          Acta de Inspección
        </Typography>
      </Box>

      {/* Pestañas: ACTA 1, ACTA 2, ACTA 3 (Idéntico a las Fotos 1 y 2) */}
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": { height: 4, borderRadius: 2, bgcolor: "#005596" },
          "& .MuiTab-root": {
            fontWeight: 900,
            fontSize: "0.95rem",
            textTransform: "uppercase",
            color: "#64748b",
            minHeight: 48,
            "&.Mui-selected": { color: "#005596" },
          },
        }}
      >
        <Tab label="ACTA 1" icon={<AssignmentIcon />} iconPosition="start" />
        <Tab label="ACTA 2" icon={<SettingsIcon />} iconPosition="start" />
        <Tab label="ACTA 3" icon={<CheckCircleIcon />} iconPosition="start" />
      </Tabs>

      {/* Contenido según pestaña */}
      {activeTab === 0 ? renderActa1() : activeTab === 1 ? renderActa2() : renderActa3()}

      {/* Diálogo de Comentario al Rechazo */}
      <Dialog
        open={commentDialog.open}
        onClose={() => setCommentDialog({ ...commentDialog, open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Fundamentación del Rechazo
          <IconButton onClick={() => setCommentDialog({ ...commentDialog, open: false })} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Indique las causas técnicas por las que la subsanación o documentación presentada no satisface el requisito exigido.
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Escriba el motivo técnico del rechazo..."
            value={commentDialog.text}
            onChange={(e) => setCommentDialog({ ...commentDialog, text: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#f8fafc" } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: "space-between" }}>
          <Button onClick={() => setCommentDialog({ ...commentDialog, open: false })} sx={{ fontWeight: 800, color: "#64748b" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setComentarios((prev) => ({ ...prev, [commentDialog.id]: commentDialog.text }));
              setCommentDialog({ ...commentDialog, open: false });
            }}
            sx={{ fontWeight: 900, borderRadius: 2, px: 3, bgcolor: "#005596" }}
          >
            Guardar Motivo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Emplazamiento */}
      <Dialog
        open={emplazarDialog}
        onClose={() => setEmplazarDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: "flex", alignItems: "center", gap: 1.5, color: "#1e293b" }}>
          <Box sx={{ bgcolor: "#fee2e2", color: "#dc2626", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ReportProblemIcon sx={{ fontSize: 20 }} />
          </Box>
          Emplazar al Efector
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: "#475569", mb: 3 }}>
            Seleccione el nuevo plazo reglamentario otorgado al efector para subsanar los puntos rechazados.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4, flexWrap: "wrap", gap: 1.5 }}>
            {[
              { label: "24", sub: "horas", value: "24 horas" },
              { label: "48", sub: "horas", value: "48 horas" },
              { label: "5", sub: "días", value: "5 días" },
              { label: "10", sub: "días", value: "10 días" },
              { label: "15", sub: "días", value: "15 días" },
              { label: "+", sub: "manual", value: "custom" },
            ].map((option) => (
              <Button
                key={option.value}
                variant={(diasEmplazamiento === option.value && !isCustom) || (option.value === "custom" && isCustom) ? "contained" : "outlined"}
                color={option.sub === "horas" ? "warning" : "primary"}
                onClick={() => {
                  if (option.value === "custom") {
                    setIsCustom(true);
                    if (customValue && customUnit) {
                      setDiasEmplazamiento(`${customValue} ${customUnit}`);
                    } else {
                      setDiasEmplazamiento("");
                    }
                  } else {
                    setIsCustom(false);
                    setDiasEmplazamiento(option.value);
                    setCustomValue("");
                    setCustomUnit("");
                  }
                }}
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  minWidth: 0,
                  fontWeight: 900,
                  fontSize: "1.3rem",
                  lineHeight: 1,
                  display: "flex",
                  flexDirection: "column",
                  textTransform: "none",
                  p: 0,
                  borderWidth: 2,
                }}
              >
                {option.label}
                <Typography variant="caption" sx={{ fontSize: "0.62rem", fontWeight: 800, mt: -0.2, textTransform: "lowercase" }}>
                  {option.sub}
                </Typography>
              </Button>
            ))}
          </Stack>

          {isCustom && (
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <TextField
                type="number"
                placeholder="Cantidad"
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value);
                  if (e.target.value && customUnit) {
                    setDiasEmplazamiento(`${e.target.value} ${customUnit}`);
                  }
                }}
                sx={{ flex: 1 }}
              />
              <ToggleButtonGroup
                value={customUnit}
                exclusive
                onChange={(_, val) => {
                  if (val) {
                    setCustomUnit(val);
                    if (customValue) {
                      setDiasEmplazamiento(`${customValue} ${val}`);
                    }
                  }
                }}
              >
                <ToggleButton value="horas">Horas</ToggleButton>
                <ToggleButton value="días">Días</ToggleButton>
                <ToggleButton value="semanas">Semanas</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          )}

          {vencimiento && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "#f0fdf4", borderRadius: 3, border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 1.5 }}>
              <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 24 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#15803d", textTransform: "uppercase", display: "block" }}>
                  Fecha Límite Calculada (Días Hábiles)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 850, color: "#166534", textTransform: "capitalize" }}>
                  {vencimiento.fecha.toLocaleString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} h.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: "space-between" }}>
          <Button onClick={() => setEmplazarDialog(false)} sx={{ fontWeight: 800, color: "#64748b" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!diasEmplazamiento}
            onClick={() => {
              setEmplazarDialog(false);
              if (onEmplazarFinalizado) onEmplazarFinalizado(diasEmplazamiento);
            }}
            sx={{ fontWeight: 900, borderRadius: 2.5, px: 3, py: 1.2, bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }}
          >
            Confirmar Emplazamiento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmación de Aprobación */}
      <Dialog
        open={reinspeccionModalOpen}
        onClose={() => setReinspeccionModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#1e293b", pb: 1, textAlign: "center" }}>
          {rol === "ARQUITECTO"
            ? "Aprobar Planos y Arquitectura"
            : rol === "AUDITOR"
            ? "Aprobar Auditoría de Trámite"
            : "Confirmar Solicitud de Reinspección"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#475569", textAlign: "center", fontSize: "1rem", fontWeight: 600, my: 2 }}>
            {rol === "ARQUITECTO"
              ? "¿Desea dar por aprobados los planos y correcciones edilicias presentadas? El expediente pasará a Auditoría."
              : rol === "AUDITOR"
              ? "¿Desea dar por aprobada la auditoría técnica de los requisitos del trámite? El trámite quedará habilitado para inspección."
              : "¿Desea confirmar la validación favorable de los datos generales y enviar la Solicitud de Re-Inspección presencial al coordinador?"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, justifyContent: "space-between", gap: 2 }}>
          <Button
            onClick={() => setReinspeccionModalOpen(false)}
            sx={{ flex: 1, fontWeight: 800, color: "#64748b", borderRadius: 2, py: 1.2, bgcolor: "#f1f5f9" }}
          >
            CANCELAR
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setReinspeccionModalOpen(false);
              if (onAceptarReinspeccion) onAceptarReinspeccion();
            }}
            sx={{ flex: 1, fontWeight: 900, bgcolor: "#059669", borderRadius: 2, py: 1.2, "&:hover": { bgcolor: "#047857" } }}
          >
            {rol === "ARQUITECTO" || rol === "AUDITOR" ? "CONFIRMAR" : "SOLICITAR REINSPECCIÓN"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Visor de Comprobantes y Fotos */}
      <Dialog open={!!viewerPhoto} onClose={() => setViewerPhoto(null)} maxWidth="md">
        <Box sx={{ position: "relative", bgcolor: "black", p: 1 }}>
          <Button onClick={() => setViewerPhoto(null)} sx={{ position: "absolute", top: 10, right: 10, color: "white", zIndex: 10 }}>
            Cerrar
          </Button>
          <img src={viewerPhoto} alt="Evidencia" style={{ maxWidth: "100%", maxHeight: "80vh", display: "block", margin: "auto" }} />
        </Box>
      </Dialog>

      {/* Modal de Vista Previa del Acta */}
      <Dialog
        open={openActaPopup}
        onClose={() => setOpenActaPopup(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: "#005596", color: "white", fontWeight: 900, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          VISTA PREVIA DEL ACTA DE INSPECCIÓN
          <IconButton onClick={() => setOpenActaPopup(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, bgcolor: "#f8fafc" }}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "white" }}>
            <Typography variant="h5" sx={{ fontWeight: 950, color: "#005596", mb: 2 }}>
              Acta Oficial de Inspección y Constatación
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              Ministerio de Salud de la Provincia de Córdoba - Dirección de Jurisdicción de Farmacia y Establecimientos Sanitarios.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 850, mb: 1 }}>
              Estado del Procedimiento:
            </Typography>
            <Chip label="ACTA N° 2 - EN PROCESO DE SUBSANACIÓN" color="primary" sx={{ fontWeight: 900 }} />
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#f1f5f9" }}>
          <Button onClick={() => setOpenActaPopup(false)} sx={{ fontWeight: 850 }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RevisionActaView;
