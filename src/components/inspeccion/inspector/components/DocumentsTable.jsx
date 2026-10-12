import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  Stack,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VerifiedIcon from "@mui/icons-material/Verified";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const DOCUMENTOS_EXPEDIENTE_CLINICA = [
  // ── 1. DOCUMENTOS AGREGADOS COMO RESPUESTA A EMPLAZAMIENTO (VALIDADOS ✓) ──
  {
    id: "doc_sub_bomberos",
    nombre: "Certificado de Bomberos Renovado",
    tipo: "RESPUESTA_EMPLAZAMIENTO",
    tipoLabel: "Respuesta Emplazamiento",
    categoria: "Habilitaciones y Seguridad",
    estadoSubsanacion: "VALIDADO",
    estadoLabel: "Validado en Acta 1 ✓",
    estadoDetalle: "Documentación técnica conforme. Queda en observación para constatación in situ en esta 2ª Acta.",
    fecha: "15/09/2026",
    nroDocumento: "CB-48920/26",
    emisor: "Dirección de Bomberos - Policía de Córdoba",
    archivo: "Certificado_Bomberos_Policia_Cba.pdf",
    observacionInicial: "Certificado anterior vencido en Enero 2026 (Falta crítica de Acta 1). Subsanado con habilitación definitiva.",
    constatacionInSitu: false,
  },
  {
    id: "doc_sub_plan_evac",
    nombre: "Plan de Evacuación y Autoprotección Visado",
    tipo: "RESPUESTA_EMPLAZAMIENTO",
    tipoLabel: "Respuesta Emplazamiento",
    categoria: "Habilitaciones y Seguridad",
    estadoSubsanacion: "VALIDADO",
    estadoLabel: "Validado en Acta 1 ✓",
    estadoDetalle: "Planos y memoria visados. Queda en observación para cotejo de salidas y luces de emergencia in situ.",
    fecha: "15/09/2026",
    nroDocumento: "CPIC-2026/894",
    emisor: "Colegio Profesional de Higiene y Seguridad",
    archivo: "Plan_Evacuacion_Visado_CPIC.pdf",
    observacionInicial: "Plan anterior desactualizado y sin visado profesional de matriculado.",
    constatacionInSitu: false,
  },
  {
    id: "doc_sub_poliza",
    nombre: "Póliza de Responsabilidad Civil Comprensiva y Cirugía Ambulatoria",
    tipo: "RESPUESTA_EMPLAZAMIENTO",
    tipoLabel: "Respuesta Emplazamiento",
    categoria: "Seguros y Régimen Legal",
    estadoSubsanacion: "VALIDADO",
    estadoLabel: "Validado en Acta 1 ✓",
    estadoDetalle: "Póliza con endoso quirúrgico aprobada. Vigencia acreditada hasta Septiembre 2027.",
    fecha: "16/09/2026",
    nroDocumento: "POL-8492041",
    emisor: "La Segunda Seguros S.A.",
    archivo: "Poliza_Responsabilidad_Civil_Ambulatoria.pdf",
    observacionInicial: "Póliza inicial carecía de cláusula de cobertura quirúrgica específica.",
    constatacionInSitu: false,
  },
  {
    id: "doc_sub_esterilizacion",
    nombre: "Protocolo de Validación Técnica y Calibración de Autoclaves (IRAM 37012)",
    tipo: "RESPUESTA_EMPLAZAMIENTO",
    tipoLabel: "Respuesta Emplazamiento",
    categoria: "Equipamiento Biomédico y Quirófano",
    estadoSubsanacion: "VALIDADO",
    estadoLabel: "Validado en Acta 1 ✓",
    estadoDetalle: "Protocolo técnico de ensayos biológicos conforme. Queda en observación para verificación física en central de esterilización.",
    fecha: "16/09/2026",
    nroDocumento: "VAL-BIO-2026-102",
    emisor: "BioService Ingeniería Médica",
    archivo: "Protocolo_Validacion_Autoclaves_IRAM.pdf",
    observacionInicial: "Falta de ensayos biológicos y calibración periódica de autoclaves.",
    constatacionInSitu: false,
  },
  {
    id: "doc_sub_patogenos",
    nombre: "Contrato de Residuos Patógenos y Manifiesto Ambiental de Retiro",
    tipo: "RESPUESTA_EMPLAZAMIENTO",
    tipoLabel: "Respuesta Emplazamiento",
    categoria: "Gestión Ambiental y Residuos",
    estadoSubsanacion: "VALIDADO",
    estadoLabel: "Validado en Acta 1 ✓",
    estadoDetalle: "Contrato y manifiestos conformes. Queda en observación para inspección del depósito intermedio y balanza.",
    fecha: "17/09/2026",
    nroDocumento: "MAN-2026-00441",
    emisor: "Hábitat Ecológico S.A. / Secretaría de Ambiente",
    archivo: "Contrato_Manifiesto_Residuos_Patogenos.pdf",
    observacionInicial: "Contrato vencido y falta de comprobantes de los últimos retiros mensuales.",
    constatacionInSitu: false,
  },

  // ── 2. DOCUMENTOS ORIGINALES (EXPEDIENTE INICIAL) ──
  {
    id: "doc_orig_tasa",
    nombre: "Tasa Retributiva de Servicios (Ley Impositiva Provincial)",
    tipo: "ORIGINAL",
    tipoLabel: "Original Expediente",
    categoria: "Documentación Institucional",
    estadoSubsanacion: "CONFORME",
    estadoLabel: "Presentado Inicial",
    estadoDetalle: "Comprobante timbrado de pago del canon arancelario de inspección.",
    fecha: "22/07/2025",
    nroDocumento: "TIM-2025-09148",
    emisor: "Dirección General de Rentas Córdoba",
    archivo: "Tasa_Retributiva_Servicios.pdf",
    observacionInicial: null,
    constatacionInSitu: true,
  },
  {
    id: "doc_orig_estatuto",
    nombre: "Estatuto Social / Contrato Constitutivo de Sociedad",
    tipo: "ORIGINAL",
    tipoLabel: "Original Expediente",
    categoria: "Documentación Institucional",
    estadoSubsanacion: "CONFORME",
    estadoLabel: "Presentado Inicial",
    estadoDetalle: "Inscripción en Inspección de Personas Jurídicas (IPJ de Córdoba).",
    fecha: "22/07/2025",
    nroDocumento: "IPJ-CBA-94812",
    emisor: "Inspección de Personas Jurídicas",
    archivo: "Estatuto_Social_Constitutivo.pdf",
    observacionInicial: null,
    constatacionInSitu: true,
  },
  {
    id: "doc_orig_arca",
    nombre: "Constancia de Inscripción ARCA (Ex-AFIP)",
    tipo: "ORIGINAL",
    tipoLabel: "Original Expediente",
    categoria: "Documentación Institucional",
    estadoSubsanacion: "CONFORME",
    estadoLabel: "Presentado Inicial",
    estadoDetalle: "CUIT 30-71456321-0 - Actividad Médica y Quirúrgica Ambulatoria.",
    fecha: "22/07/2025",
    nroDocumento: "30-71456321-0",
    emisor: "ARCA - Agencia de Recaudación y Control Aduanero",
    archivo: "Constancia_Inscripcion_ARCA.pdf",
    observacionInicial: null,
    constatacionInSitu: true,
  },
  {
    id: "doc_orig_deudores",
    nombre: "Certificado del Registro de Deudores Alimentarios Morosos",
    tipo: "ORIGINAL",
    tipoLabel: "Original Expediente",
    categoria: "Documentación Institucional",
    estadoSubsanacion: "CONFORME",
    estadoLabel: "Presentado Inicial",
    estadoDetalle: "Certificado de directores y socios sin registros de morosidad.",
    fecha: "22/07/2025",
    nroDocumento: "RDAM-2025-4512",
    emisor: "Poder Judicial de la Provincia de Córdoba",
    archivo: "Certificado_Deudores_Alimentarios.pdf",
    observacionInicial: null,
    constatacionInSitu: true,
  },
  {
    id: "doc_orig_bomberos_vencido",
    nombre: "Certificado de Bomberos (Inicial - Histórico Vencido)",
    tipo: "ORIGINAL",
    tipoLabel: "Original Expediente",
    categoria: "Habilitaciones y Seguridad",
    estadoSubsanacion: "OBSERVADO_REEMPLAZADO",
    estadoLabel: "Observado en Acta 1 (Vencido)",
    estadoDetalle: "Vencido en Enero 2026. Reemplazado por certificado renovado en respuesta a emplazamiento.",
    fecha: "22/07/2025",
    nroDocumento: "CB-2024-11029",
    emisor: "Dirección de Bomberos de Córdoba",
    archivo: "Certificado_Bomberos_Vencido.pdf",
    observacionInicial: "Falta crítica constatada en Acta 1. Reemplazado por documento renovado válido.",
    constatacionInSitu: false,
  },
];

const DocumentsTable = ({
  inspectorData = {},
  onChange,
  onOpenViewer,
  onOpenObs,
  tramite = null,
  nroActa = 1,
}) => {
  const [filterTab, setFilterTab] = useState(0); // 0: Todos, 1: Originales, 2: Emplazamiento Validados
  const [inSituChecks, setInSituChecks] = useState({
    doc_sub_bomberos: true,
    doc_sub_plan_evac: true,
    doc_sub_poliza: true,
    doc_sub_esterilizacion: false,
    doc_sub_patogenos: true,
    doc_orig_tasa: true,
    doc_orig_estatuto: true,
    doc_orig_arca: true,
    doc_orig_deudores: true,
    doc_orig_bomberos_vencido: false,
  });

  const handleToggleInSitu = (id) => {
    setInSituChecks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const docs = DOCUMENTOS_EXPEDIENTE_CLINICA;

  const filteredDocs = docs.filter((d) => {
    if (filterTab === 1) return d.tipo === "ORIGINAL";
    if (filterTab === 2) return d.tipo === "RESPUESTA_EMPLAZAMIENTO";
    return true;
  });

  const countOriginales = docs.filter((d) => d.tipo === "ORIGINAL").length;
  const countEmplazamiento = docs.filter((d) => d.tipo === "RESPUESTA_EMPLAZAMIENTO").length;
  const countValidados = docs.filter((d) => d.estadoSubsanacion === "VALIDADO").length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* ── Banner Explicativo de Escenario Acta 2 y Distinción Documental ── */}
      <Alert
        severity="info"
        icon={<FactCheckIcon sx={{ fontSize: 26, color: "#0284c7" }} />}
        sx={{
          borderRadius: 3,
          bgcolor: "#f0f9ff",
          border: "1.5px solid #bae6fd",
          color: "#0369a1",
          p: 2,
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: "#0c4a6e" }}>
              ACTA 2 EN CURSO — TRÁMITE CON RESPUESTA A EMPLAZAMIENTO VALIDADA
            </Typography>
            <Typography variant="body2" sx={{ color: "#0369a1", mt: 0.5, lineHeight: 1.5, fontSize: "0.85rem" }}>
              El establecimiento subsanó las observaciones de Acta 1. Se distinguen a continuación los documentos{" "}
              <strong>Originales del Expediente</strong> y los incorporados como{" "}
              <strong>Respuesta a Emplazamiento (ya validados)</strong> que quedan en observación para constatación in situ durante esta 2ª Acta.
            </Typography>
          </Box>
          <Chip
            label="ACTA 2: INSPECCIÓN"
            size="small"
            sx={{
              bgcolor: "#0284c7",
              color: "white",
              fontWeight: 800,
              fontSize: "0.75rem",
              letterSpacing: 0.5,
            }}
          />
        </Box>
      </Alert>

      {/* ── KPI Resumen de Distinción de Documentos ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: "#e2e8f0",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InsertDriveFileIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
              Documentos Originales
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#1e293b", lineHeight: 1.1 }}>
              {countOriginales}
            </Typography>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: "1px solid #bbf7d0",
            bgcolor: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: "#dcfce7",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AssignmentTurnedInIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#15803d", textTransform: "uppercase" }}>
              Respuesta Emplazamiento
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#166534", lineHeight: 1.1 }}>
              {countEmplazamiento}
            </Typography>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: "1px solid #bbf7d0",
            bgcolor: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: "#16a34a",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <VerifiedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#15803d", textTransform: "uppercase" }}>
              Subsanaciones Validadas
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#166534", lineHeight: 1.1 }}>
              {countValidados} / {countEmplazamiento} (100%)
            </Typography>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: "1px solid #fed7aa",
            bgcolor: "#fffaf5",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: "#ffedd5",
              color: "#ea580c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#c2410c", textTransform: "uppercase" }}>
              Condición en Acta 2
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 900, color: "#9a3412", lineHeight: 1.1, fontSize: "0.80rem" }}>
              En Observación (In Situ)
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* ── Filtros por Tipo de Documento ── */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Tabs
          value={filterTab}
          onChange={(_, newVal) => setFilterTab(newVal)}
          sx={{
            "& .MuiTab-root": {
              fontWeight: 800,
              fontSize: "0.85rem",
              textTransform: "none",
              minHeight: 44,
              color: "#64748b",
              "&.Mui-selected": { color: "#0284c7" },
            },
            "& .MuiTabs-indicator": {
              bgcolor: "#0284c7",
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab label={`TODOS LOS DOCUMENTOS (${docs.length})`} />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <InsertDriveFileIcon sx={{ fontSize: 16 }} />
                <span>ORIGINALES ({countOriginales})</span>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <AssignmentTurnedInIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                <span>RESPUESTA EMPLAZAMIENTO - VALIDADOS ({countEmplazamiento})</span>
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* ── Tabla de Documentos ── */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1.5px solid #e2e8f0", borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.78rem", py: 2, width: "190px" }}>
                PROCEDENCIA / TIPO
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.78rem", py: 2 }}>
                DOCUMENTO Y DETALLE TÉCNICO
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.78rem", py: 2, width: "130px" }}>
                FECHA
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.78rem", py: 2, width: "210px" }}>
                ESTADO / VALIDACIÓN
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.78rem", py: 2, width: "150px" }}>
                COTEJO IN SITU
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.78rem", width: "90px" }}>
                ACCIONES
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDocs.map((doc) => {
              const fieldId = `doc_${doc.id}`;
              const currentVal = inspectorData[fieldId] || {};
              const isObserved = currentVal.observado || false;
              const obsText = currentVal.obs || "";
              const isInSituChecked = inSituChecks[doc.id] || false;
              const isEmplazamiento = doc.tipo === "RESPUESTA_EMPLAZAMIENTO";

              return (
                <TableRow
                  key={doc.id}
                  hover
                  sx={{
                    bgcolor: isEmplazamiento ? "rgba(240, 253, 244, 0.45)" : "inherit",
                    "&:hover": { bgcolor: isEmplazamiento ? "#f0fdf4 !important" : "#f8fafc !important" },
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {/* Columna: Procedencia / Tipo */}
                  <TableCell sx={{ py: 2, verticalAlign: "top" }}>
                    {isEmplazamiento ? (
                      <Stack spacing={0.5}>
                        <Chip
                          icon={<AssignmentTurnedInIcon sx={{ fontSize: "14px !important", color: "#047857 !important" }} />}
                          label="RESPUESTA EMPLAZ."
                          size="small"
                          sx={{
                            bgcolor: "#dcfce7",
                            color: "#047857",
                            fontWeight: 900,
                            fontSize: "0.68rem",
                            border: "1px solid #86efac",
                            height: 24,
                            justifyContent: "flex-start",
                          }}
                        />
                        <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700, fontSize: "0.72rem" }}>
                          Agregado en Acta 1
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={0.5}>
                        <Chip
                          icon={<InsertDriveFileIcon sx={{ fontSize: "14px !important", color: "#475569 !important" }} />}
                          label="ORIGINAL"
                          size="small"
                          sx={{
                            bgcolor: "#f1f5f9",
                            color: "#475569",
                            fontWeight: 900,
                            fontSize: "0.68rem",
                            border: "1px solid #cbd5e1",
                            height: 24,
                            justifyContent: "flex-start",
                          }}
                        />
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.72rem" }}>
                          Expediente Inicial
                        </Typography>
                      </Stack>
                    )}
                  </TableCell>

                  {/* Columna: Documento y Detalle */}
                  <TableCell sx={{ py: 2, verticalAlign: "top" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem" }}>
                          {doc.nombre}
                        </Typography>
                        {doc.nroDocumento && (
                          <Chip
                            label={`N° ${doc.nroDocumento}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderColor: "#cbd5e1" }}
                          />
                        )}
                      </Box>

                      <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem", lineHeight: 1.4 }}>
                        <strong>Emisor:</strong> {doc.emisor} — <em>{doc.categoria}</em>
                      </Typography>

                      {doc.observacionInicial && (
                        <Box
                          sx={{
                            mt: 0.5,
                            p: 0.8,
                            bgcolor: isEmplazamiento ? "#ecfdf5" : "#fff7ed",
                            borderLeft: isEmplazamiento ? "3px solid #10b981" : "3px solid #f97316",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: isEmplazamiento ? "#065f46" : "#9a3412",
                              fontSize: "0.72rem",
                              display: "block",
                            }}
                          >
                            <strong>Antecedente Acta 1:</strong> {doc.observacionInicial}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  {/* Columna: Fecha */}
                  <TableCell sx={{ py: 2, verticalAlign: "top" }}>
                    <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.80rem" }}>
                      {doc.fecha}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.70rem" }}>
                      {isEmplazamiento ? "Subsanación" : "Ingreso"}
                    </Typography>
                  </TableCell>

                  {/* Columna: Estado / Validación */}
                  <TableCell sx={{ py: 2, verticalAlign: "top" }}>
                    {isEmplazamiento ? (
                      <Stack spacing={0.6}>
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: "14px !important", color: "white !important" }} />}
                          label={doc.estadoLabel}
                          size="small"
                          sx={{
                            bgcolor: "#16a34a",
                            color: "white",
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            height: 24,
                            justifyContent: "flex-start",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#15803d",
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            lineHeight: 1.3,
                            display: "block",
                          }}
                        >
                          {doc.estadoDetalle}
                        </Typography>
                      </Stack>
                    ) : doc.estadoSubsanacion === "OBSERVADO_REEMPLAZADO" ? (
                      <Stack spacing={0.6}>
                        <Chip
                          icon={<WarningAmberIcon sx={{ fontSize: "14px !important", color: "#c2410c !important" }} />}
                          label={doc.estadoLabel}
                          size="small"
                          sx={{
                            bgcolor: "#ffedd5",
                            color: "#c2410c",
                            border: "1px solid #fed7aa",
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            height: 24,
                            justifyContent: "flex-start",
                          }}
                        />
                        <Typography variant="caption" sx={{ color: "#9a3412", fontSize: "0.72rem", lineHeight: 1.3 }}>
                          Reemplazado por versión subsanada
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={0.6}>
                        <Chip
                          label={doc.estadoLabel}
                          size="small"
                          sx={{
                            bgcolor: "#e2e8f0",
                            color: "#334155",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            height: 24,
                            justifyContent: "flex-start",
                          }}
                        />
                        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem", lineHeight: 1.3 }}>
                          Conforme sin observaciones
                        </Typography>
                      </Stack>
                    )}
                  </TableCell>

                  {/* Columna: Cotejo In Situ en Acta 2 */}
                  <TableCell align="center" sx={{ py: 2, verticalAlign: "top" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={isInSituChecked}
                            onChange={() => handleToggleInSitu(doc.id)}
                            color="success"
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: isInSituChecked ? 800 : 500,
                              color: isInSituChecked ? "#15803d" : "#64748b",
                            }}
                          >
                            {isInSituChecked ? "Constatado" : "Pendiente"}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                      {isInSituChecked && (
                        <Typography variant="caption" sx={{ color: "#16a34a", fontSize: "0.68rem", fontWeight: 700 }}>
                          ✓ Verificado in situ
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  {/* Columna: Acciones */}
                  <TableCell align="center" sx={{ py: 2, verticalAlign: "top" }}>
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Visualizar documento PDF">
                        <IconButton
                          size="small"
                          sx={{
                            color: "#0284c7",
                            bgcolor: "#f0f9ff",
                            border: "1px solid #bae6fd",
                            "&:hover": { bgcolor: "#e0f2fe" },
                          }}
                          onClick={() => onOpenViewer(doc.archivo)}
                        >
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={obsText ? "Ver / Editar observación" : "Agregar observación al acta"}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (!currentVal.observado) {
                              onChange(fieldId, { ...currentVal, observado: true });
                            }
                            onOpenObs(fieldId, `[DOC] ${doc.nombre}`, obsText);
                          }}
                          sx={{
                            color: obsText || isObserved ? "#f97316" : "#94a3b8",
                            bgcolor: obsText || isObserved ? "#fff7ed" : "transparent",
                            border: obsText || isObserved ? "1px solid #fdba74" : "none",
                            "&:hover": { bgcolor: "#f8fafc" },
                          }}
                        >
                          {obsText || isObserved ? (
                            <ChatBubbleIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DocumentsTable;
