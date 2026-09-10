import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  TextField,
  Stack,
  IconButton,
  Chip,
  Tooltip,
  InputAdornment,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Autocomplete,
  Tabs,
  Tab,
  Fab,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  CheckCircle as CheckCircleIcon,
  FilterListOff as FilterListOffIcon,
  LocalHospital as LocalHospitalIcon,
  Tune as TuneIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Layout from "../ui/Layout";

export interface ItemTipoEquipo {
  id: number;
  nombre: string;
  tipologias: string[];
  activo: boolean;
  fechaAlta: string;
}

export const TIPOLOGIAS_ESTABLECIMIENTOS = [
  "CLÍNICA, SANATORIO U HOSPITAL PRIVADO",
  "CENTRO DE ESTÉTICA CORPORAL",
  "CENTRO DE SALUD AMBULATORIO",
  "CENTRO CIRUGÍA AMBULATORIA",
];

export const SERVICIOS_EXTERNOS = [
  "RADIOFÍSICA",
  "UNIDAD O SERVICIO DE DIÁLISIS",
];

export const OPCIONES_TODAS = [
  ...TIPOLOGIAS_ESTABLECIMIENTOS,
  ...SERVICIOS_EXTERNOS,
];

export const getTipologiaChipStyle = (tip: string) => {
  switch (tip) {
    case "CLÍNICA, SANATORIO U HOSPITAL PRIVADO":
      return { bgcolor: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc" };
    case "CENTRO DE ESTÉTICA CORPORAL":
      return { bgcolor: "#fce7f3", color: "#be185d", border: "1px solid #f472b6" };
    case "CENTRO DE SALUD AMBULATORIO":
      return { bgcolor: "#dcfce7", color: "#15803d", border: "1px solid #86efac" };
    case "CENTRO CIRUGÍA AMBULATORIA":
      return { bgcolor: "#ffedd5", color: "#c2410c", border: "1px solid #fdba74" };
    case "RADIOFÍSICA":
      return { bgcolor: "#ede9fe", color: "#6d28d9", border: "1px solid #c4b5fd" };
    case "UNIDAD O SERVICIO DE DIÁLISIS":
      return { bgcolor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" };
    default:
      return { bgcolor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" };
  }
};

export const LISTADO_TIPOS_EQUIPOS_INICIAL: ItemTipoEquipo[] = [
  { id: 0, nombre: "Elementos de protección personal", tipologias: ["RADIOFÍSICA", "CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 1, nombre: "Carro de paro completo", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 2, nombre: "Equipo para nebulizaciones", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 3, nombre: "Oxímetro de pulso/monitor multiparamétrico", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 4, nombre: "Arco en C o paralelogramo deformable", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 5, nombre: "Cardiodesfibrilador", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 6, nombre: "Electrocardiógrafo", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 7, nombre: "Generadores pulsados por tetrodos y/o microprocesadores", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 8, nombre: "Intensificador de imágenes o detector plano", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 9, nombre: "Inyectora de contraste", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 10, nombre: "Mesa de Cateterismo con plano deslizante", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 11, nombre: "Monitor digital", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 12, nombre: "Tubo de rayos X", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "RADIOFÍSICA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 13, nombre: "Balanza de uso clínico", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO", "CENTRO DE ESTÉTICA CORPORAL"], activo: true, fechaAlta: "01/09/2026" },
  { id: 14, nombre: "Campana de flujo laminar", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 15, nombre: "Colchón antiescaras de corresponder", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 16, nombre: "Equipo de monitoreo presión arterial no invasivo", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 17, nombre: "Estetoscopio", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 18, nombre: "Oxímetro de pulso", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 19, nombre: "Sillón de Oncología", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 20, nombre: "Caja de traqueotomía", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 21, nombre: "Cama o camilla quirúrgica regulable", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 22, nombre: "Lámpara ciálitica", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 23, nombre: "Laringoscopio y tubos endotraqueales", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 24, nombre: "Máquina de anestesia", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 25, nombre: "Mesa de Cirugía tipo \"Mayo\" o similar", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 26, nombre: "Monitor multiparamétrico", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 27, nombre: "Sistema de aspiración automática", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 28, nombre: "Balanza para recién nacido", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 29, nombre: "Cama de partos con ruedas (ginecológica/obstétrica)", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 30, nombre: "Lámpara portátil de altura regulable", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 31, nombre: "Mesa auxiliar", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 32, nombre: "Mesa de instrumental obstétrico", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 33, nombre: "Mesa para anestesista", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 34, nombre: "Monitor fetal portátil", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 35, nombre: "Carro de urgencia con equipos de intubación completo", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 36, nombre: "Equipo completo para intubación/sondaje/canalización", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 37, nombre: "Ecocardiógrafo", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 38, nombre: "Marcapaso transitorio con 2 catéteres", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 39, nombre: "Respirador mecánico de resguardo", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 40, nombre: "Sistema portátil de aspiración para drenaje", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 41, nombre: "Bomba de infusión continua (drogas IV)", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 42, nombre: "Aspiración automática", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 43, nombre: "Aspirador regulable con manómetro", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 44, nombre: "Balanza electrónica", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO", "CENTRO DE ESTÉTICA CORPORAL"], activo: true, fechaAlta: "01/09/2026" },
  { id: 45, nombre: "Balanza para pañales", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 46, nombre: "Bomba de perfusión continua", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 47, nombre: "Bomba de perfusión de jeringa", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 48, nombre: "Colchón térmico neonatal", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 49, nombre: "Cuna", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 50, nombre: "Ecógrafo portátil para ecografías ECO Doppler color", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 51, nombre: "Electrobisturí", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 52, nombre: "Electroencefalógrafo portátil", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 53, nombre: "Equipo de reanimación", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 54, nombre: "Incubadora a servocontrol de circuito cerrado", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 55, nombre: "Incubadora a servocontrol de reserva", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 56, nombre: "Incubadora de transporte", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 57, nombre: "Incubadora servocuna", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 58, nombre: "Lámpara portátil", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 59, nombre: "Mesa central", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 60, nombre: "Mezclador de oxígeno - aire comprimido (Blender)", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 61, nombre: "Monitor cardiorrespiratorio con alarma de apnea", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 62, nombre: "Monitor transcutáneo de oxígeno", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 63, nombre: "Pediómetro", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 64, nombre: "Respirador automático neonatal", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 65, nombre: "Respirador neonatal sincronizado (SIMV/INV)", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 66, nombre: "Sincronizador desfibrilador neonatal", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 67, nombre: "Spot de luminoterapia", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE ESTÉTICA CORPORAL"], activo: true, fechaAlta: "01/09/2026" },
  { id: 68, nombre: "Tensiómetro neonatal (efecto Doppler)", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 69, nombre: "Cámara cefálica de Gregory", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 70, nombre: "Carro de urgencia", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 71, nombre: "Equipo de aspiración", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 72, nombre: "Equipo de desfibrilación y sincronizador", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 73, nombre: "Equipo de intubación traqueal", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 74, nombre: "Equipo de luminoterapia", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE ESTÉTICA CORPORAL"], activo: true, fechaAlta: "01/09/2026" },
  { id: 75, nombre: "Incubadora portatil", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 76, nombre: "Marcapaso transitorio", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 77, nombre: "Nebulizador", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 78, nombre: "Oxímetro de pulso portátil", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 79, nombre: "Respirador mecánico volumétrico con presión positiva", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 80, nombre: "Tensiómetro", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO DE SALUD AMBULATORIO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 81, nombre: "Bomba de infusión", tipologias: ["CLÍNICA, SANATORIO U HOSPITAL PRIVADO", "CENTRO CIRUGÍA AMBULATORIA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 82, nombre: "Resonancia Magnética", tipologias: ["RADIOFÍSICA"], activo: true, fechaAlta: "01/09/2026" },
  { id: 83, nombre: "Láser", tipologias: ["RADIOFÍSICA", "CENTRO DE ESTÉTICA CORPORAL"], activo: true, fechaAlta: "01/09/2026" },
  { id: 84, nombre: "Rayos X", tipologias: ["RADIOFÍSICA", "CLÍNICA, SANATORIO U HOSPITAL PRIVADO"], activo: true, fechaAlta: "01/09/2026" },
  { id: 85, nombre: "Ultravioleta", tipologias: ["RADIOFÍSICA", "CENTRO DE ESTÉTICA CORPORAL"], activo: true, fechaAlta: "01/09/2026" },
];

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: "560px" },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  overflow: "hidden",
  p: 0,
};

export default function CatalogoTiposEquipos() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemTipoEquipo[]>(LISTADO_TIPOS_EQUIPOS_INICIAL);
  
  // 0: TIPOLOGÍAS, 1: SERVICIOS EXTERNOS (RADIOFÍSICA. DIÁLISIS)
  const [tabCategoria, setTabCategoria] = useState<number>(0);

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipologia, setFiltroTipologia] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombreForm, setNombreForm] = useState("");
  const [tipologiasForm, setTipologiasForm] = useState<string[]>(["CLÍNICA, SANATORIO U HOSPITAL PRIVADO"]);
  const [errorNombre, setErrorNombre] = useState("");
  const [errorTipologia, setErrorTipologia] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleGuardarCambiosGlobal = () => {
    localStorage.setItem("CATALOGO_TIPOS_EQUIPOS", JSON.stringify(items));
    setSnackbarOpen(true);
  };

  const opcionesDropdown = useMemo(() => {
    return tabCategoria === 0 ? TIPOLOGIAS_ESTABLECIMIENTOS : SERVICIOS_EXTERNOS;
  }, [tabCategoria]);

  const itemsFiltrados = useMemo(() => {
    return items.filter((item) => {
      // Filtro por Tab
      if (tabCategoria === 0) {
        // TIPOLOGÍAS
        const perteneceATipologia = item.tipologias.some((t) =>
          TIPOLOGIAS_ESTABLECIMIENTOS.includes(t)
        );
        if (!perteneceATipologia) return false;
      } else if (tabCategoria === 1) {
        // SERVICIOS EXTERNOS (RADIOFÍSICA. DIÁLISIS)
        const perteneceAServicioExterno = item.tipologias.some((t) =>
          SERVICIOS_EXTERNOS.includes(t)
        );
        if (!perteneceAServicioExterno) return false;
      }

      if (filtroTexto.trim() && !item.nombre.toLowerCase().includes(filtroTexto.toLowerCase())) {
        return false;
      }
      if (filtroTipologia && !item.tipologias.includes(filtroTipologia)) {
        return false;
      }
      return true;
    });
  }, [items, tabCategoria, filtroTexto, filtroTipologia]);

  const itemsPaginados = useMemo(() => {
    const start = page * rowsPerPage;
    return itemsFiltrados.slice(start, start + rowsPerPage);
  }, [itemsFiltrados, page, rowsPerPage]);

  const handleOpenNuevo = () => {
    setNombreForm("");
    const defaultTip = tabCategoria === 0 ? "CLÍNICA, SANATORIO U HOSPITAL PRIVADO" : "RADIOFÍSICA";
    setTipologiasForm(filtroTipologia ? [filtroTipologia] : [defaultTip]);
    setErrorNombre("");
    setErrorTipologia("");
    setIsEditing(false);
    setEditingId(null);
    setOpenModal(true);
  };

  const handleOpenEditar = (item: ItemTipoEquipo) => {
    setNombreForm(item.nombre);
    setTipologiasForm(item.tipologias || []);
    setErrorNombre("");
    setErrorTipologia("");
    setIsEditing(true);
    setEditingId(item.id);
    setOpenModal(true);
  };

  const handleEliminar = (id: number) => {
    if (window.confirm("¿Confirma que desea eliminar este tipo de equipo?")) {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const handleGuardar = () => {
    let hasError = false;
    if (!nombreForm.trim()) {
      setErrorNombre("El nombre del tipo de equipo es obligatorio.");
      hasError = true;
    }
    if (tipologiasForm.length === 0) {
      setErrorTipologia("Debe seleccionar al menos una tipología.");
      hasError = true;
    }
    if (hasError) return;

    if (isEditing && editingId) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? { ...it, nombre: nombreForm.trim(), tipologias: tipologiasForm }
            : it
        )
      );
    } else {
      const nuevo: ItemTipoEquipo = {
        id: Date.now(),
        nombre: nombreForm.trim(),
        tipologias: tipologiasForm,
        activo: true,
        fechaAlta: new Date().toLocaleDateString("es-AR"),
      };
      setItems((prev) => [nuevo, ...prev]);
    }
    setOpenModal(false);
  };

  return (
    <Layout>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          mb: 4,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Encabezado Azul */}
        <Box
          sx={{
            backgroundColor: "#005596",
            color: "white",
            py: 2.2,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              size="small"
              onClick={() => navigate("/admin/gestion-recursos")}
              sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "1.35rem" }}>
                Tipo de Equipos
              </Typography>
              <Typography variant="caption" sx={{ color: "#e2e8f0", fontSize: "0.8rem" }}>
                Catálogo de nombres oficiales con tipología asignada ({items.length} registrados)
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenNuevo}
            sx={{
              bgcolor: "#0284c7",
              fontWeight: 750,
              textTransform: "none",
              fontSize: "0.85rem",
              "&:hover": { bgcolor: "#0369a1" },
            }}
          >
            Nuevo Tipo de Equipo
          </Button>
        </Box>

        {/* SELECTOR DE PESTAÑAS: TIPOLOGÍAS vs SERVICIOS EXTERNOS */}
        <Box sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", px: 3, pt: 1.5 }}>
          <Tabs
            value={tabCategoria}
            onChange={(_, val) => {
              setTabCategoria(val);
              setFiltroTipologia(null);
              setPage(0);
            }}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 750,
                fontSize: "0.95rem",
                minHeight: 48,
                px: 2.5,
              },
            }}
          >
            <Tab
              icon={<LocalHospitalIcon fontSize="small" />}
              iconPosition="start"
              label="TIPOLOGÍAS"
            />
            <Tab
              icon={<TuneIcon fontSize="small" />}
              iconPosition="start"
              label="SERVICIOS EXTERNOS (RADIOFÍSICA. DIÁLISIS)"
            />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: "white" }}>
          
          {/* BARRA DE FILTRO Y BÚSQUEDA */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: "6px",
              borderColor: "#e2e8f0",
              bgcolor: "#f8fafc",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.6fr 1.6fr auto" },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              placeholder="Buscar por nombre de equipo..."
              size="small"
              value={filtroTexto}
              onChange={(e) => {
                setFiltroTexto(e.target.value);
                setPage(0);
              }}
              sx={{ bgcolor: "white" }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Autocomplete
              options={opcionesDropdown}
              value={filtroTipologia}
              onChange={(_, val) => {
                setFiltroTipologia(val);
                setPage(0);
              }}
              renderInput={(params) => (
                <TextField {...params} label={tabCategoria === 0 ? "Filtrar por Tipología" : "Filtrar por Servicio Externo"} size="small" sx={{ bgcolor: "white" }} />
              )}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: "flex-end" }}>
              {(filtroTexto || filtroTipologia) && (
                <Button
                  size="small"
                  startIcon={<FilterListOffIcon />}
                  onClick={() => {
                    setFiltroTexto("");
                    setFiltroTipologia(null);
                    setPage(0);
                  }}
                  sx={{ textTransform: "none", color: "#64748b", fontWeight: 700 }}
                >
                  Limpiar
                </Button>
              )}
              <Chip
                icon={<PrecisionManufacturingIcon fontSize="small" />}
                label={`${itemsFiltrados.length} equipos`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            </Box>
          </Paper>

          {/* TABLA DE TIPOS DE EQUIPOS CON COLUMNA TIPOLOGÍA */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#005596" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 850, color: "white", width: "70px", py: 1.5 }}>N°</TableCell>
                  <TableCell sx={{ fontWeight: 850, color: "white", minWidth: "260px", py: 1.5 }}>TIPO DE EQUIPO</TableCell>
                  <TableCell sx={{ fontWeight: 850, color: "white", minWidth: "280px", py: 1.5 }}>TIPOLOGÍA</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 850, color: "white", width: "110px", py: 1.5 }}>ESTADO</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 850, color: "white", width: "130px", py: 1.5 }}>FECHA ALTA</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 850, color: "white", width: "110px", py: 1.5 }}>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemsPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#64748b" }}>
                      No se encontraron tipos de equipos con los filtros aplicados en esta categoría.
                    </TableCell>
                  </TableRow>
                ) : (
                  itemsPaginados.map((item, index) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        bgcolor: index % 2 === 0 ? "white" : "#f8fafc",
                        "&:hover": { bgcolor: "#f1f5f9" },
                      }}
                    >
                      <TableCell sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.82rem" }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 750, color: "#0f172a", fontSize: "0.88rem" }}>
                        {item.nombre}
                      </TableCell>
                      
                      {/* COLUMNA TIPOLOGÍA */}
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                          {item.tipologias.map((tip) => {
                            const style = getTipologiaChipStyle(tip);
                            return (
                              <Chip
                                key={tip}
                                label={tip}
                                size="small"
                                sx={{
                                  bgcolor: style.bgcolor,
                                  color: style.color,
                                  border: style.border,
                                  fontWeight: 800,
                                  fontSize: "0.68rem",
                                  height: 22,
                                }}
                              />
                            );
                          })}
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                          label="Activo"
                          size="small"
                          color="success"
                          sx={{ height: 22, fontSize: "0.72rem", fontWeight: 750 }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600 }}>
                        {item.fechaAlta}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "center" }}>
                          <Tooltip title="Editar">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEditar(item)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" color="error" onClick={() => handleEliminar(item.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={itemsFiltrados.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 15, 25, 50, 100]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </TableContainer>

        </Box>
      </Paper>

      {/* ── MODAL NUEVO / EDITAR TIPO DE EQUIPO ──────────────────────────────── */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={styleModal}>
          <Box sx={{ bgcolor: "#005596", color: "white", py: 2, px: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
              {isEditing ? "Editar Tipo de Equipo" : "Nuevo Tipo de Equipo"}
            </Typography>
            <IconButton size="small" onClick={() => setOpenModal(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Nombre del Tipo de Equipo *"
              variant="standard"
              value={nombreForm}
              onChange={(e) => {
                setNombreForm(e.target.value);
                if (errorNombre) setErrorNombre("");
              }}
              placeholder="Ej. Resonancia Magnética, Cardiodesfibrilador..."
              fullWidth
              autoFocus
              error={!!errorNombre}
              helperText={errorNombre || "Nombre oficial del equipo"}
            />

            <FormControl variant="standard" fullWidth error={!!errorTipologia}>
              <InputLabel>Tipología(s) / Servicio(s) *</InputLabel>
              <Select
                multiple
                value={tipologiasForm}
                onChange={(e) => {
                  const val = typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value;
                  setTipologiasForm(val);
                  if (errorTipologia) setErrorTipologia("");
                }}
                input={<OutlinedInput label="Tipología(s) / Servicio(s)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" sx={{ fontSize: "0.72rem", height: 22 }} />
                    ))}
                  </Box>
                )}
              >
                {OPCIONES_TODAS.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={tipologiasForm.indexOf(name) > -1} size="small" />
                    <ListItemText primary={<Typography sx={{ fontSize: "0.85rem", fontWeight: 650 }}>{name}</Typography>} />
                  </MenuItem>
                ))}
              </Select>
              {errorTipologia && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errorTipologia}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Box sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenModal(false)}
              sx={{ color: "#64748b", borderColor: "#cbd5e1", textTransform: "none", fontWeight: 700 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleGuardar}
              sx={{ bgcolor: "#005596", textTransform: "none", fontWeight: 750, "&:hover": { bgcolor: "#003b66" } }}
            >
              Guardar Tipo de Equipo
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* BOTÓN GUARDAR FLOTANTE */}
      <Fab
        variant="extended"
        onClick={handleGuardarCambiosGlobal}
        sx={{
          position: "fixed",
          bottom: 28,
          right: 32,
          zIndex: 1200,
          backgroundColor: "#005596",
          color: "white",
          fontWeight: 800,
          fontSize: "0.92rem",
          letterSpacing: "0.5px",
          px: 3.5,
          py: 1.5,
          boxShadow: "0 10px 25px -5px rgba(0, 85, 150, 0.5), 0 8px 10px -6px rgba(0, 85, 150, 0.3)",
          textTransform: "none",
          transition: "all 0.25s ease",
          "&:hover": {
            backgroundColor: "#003b66",
            transform: "translateY(-3px)",
            boxShadow: "0 14px 28px -5px rgba(0, 85, 150, 0.6)",
          },
        }}
      >
        <SaveIcon sx={{ mr: 1, fontSize: 22 }} />
        GUARDAR
      </Fab>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled" sx={{ width: "100%", fontWeight: 700 }}>
          ¡Cambios guardados exitosamente en el catálogo de Tipos de Equipos!
        </Alert>
      </Snackbar>
    </Layout>
  );
}
