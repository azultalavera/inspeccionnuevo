import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  ListItemIcon,
  ListItemText,
  Popover,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDownload as CloudDownloadIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  AddCircleOutlineOutlined as AddCircleOutlineIcon,
  MoreVert as MoreVertIcon,
  Build as BuildIcon,
  Autorenew as AutorenewIcon,
  CheckCircleOutlineOutlined as CheckCircleOutlineIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ModalHabilitacion from "../ui/ModalHabilitacion";
import VistaAuditor from "./vistas/VistaAuditor";
import VistaInspector from "./vistas/VistaInspector";
import VistaProtocolizador from "./vistas/VistaProtocolizador";
import { useRole } from "../../context/RoleContext";
import { MOCK_ESTABLECIMIENTOS } from "../../data/mockData";


const ESTABLECIMIENTOS = MOCK_ESTABLECIMIENTOS;

// Acciones contextuales según estado
const ACCIONES_POR_ESTADO = {
  "EN PROCESO DE MODIFICACIÓN": [
    { label: "Continuar", icon: <EditIcon fontSize="small" />, color: "rgb(9, 155, 227)", primary: true },
    { label: "Visualizar", icon: <VisibilityIcon fontSize="small" />, color: "rgb(254, 222, 39)" },
    { label: "Historial", icon: <HistoryIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
  ],
  "HABILITADO": [
    { label: "Visualizar", icon: <VisibilityIcon fontSize="small" />, color: "rgb(254, 222, 39)", primary: true },
    { label: "Descargar", icon: <CloudDownloadIcon fontSize="small" />, color: "rgb(9, 155, 227)" },
    { label: "Ver Resolución", icon: <DescriptionIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
    { label: "Certificado", icon: <AssignmentIcon fontSize="small" />, color: "rgb(175, 65, 120)" },
    { label: "Historial", icon: <HistoryIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
  ],
  "PRÓXIMO A VENCER": [
    { label: "Iniciar Renovación", icon: <EditIcon fontSize="small" />, color: "rgb(9, 155, 227)", primary: true },
    { label: "Visualizar", icon: <VisibilityIcon fontSize="small" />, color: "rgb(254, 222, 39)" },
    { label: "Descargar", icon: <CloudDownloadIcon fontSize="small" />, color: "rgb(9, 155, 227)" },
    { label: "Historial", icon: <HistoryIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
  ],
  "VENCIDO": [
    { label: "Continuar", icon: <EditIcon fontSize="small" />, color: "rgb(9, 155, 227)", primary: true },
    { label: "Visualizar", icon: <VisibilityIcon fontSize="small" />, color: "rgb(254, 222, 39)" },
    { label: "Historial", icon: <HistoryIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
  ],
  "NO VIGENTE": [
    { label: "Visualizar", icon: <VisibilityIcon fontSize="small" />, color: "rgb(254, 222, 39)", primary: true },
    { label: "Ver Resolución", icon: <DescriptionIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
    { label: "Historial", icon: <HistoryIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
  ],
};

// Componente de acciones contextuales con menú desplegable
const AccionesCell = ({ row, onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const acciones = ACCIONES_POR_ESTADO[row.estado] || [];
  const primaryAction = acciones.find((a) => a.primary);
  const secondaryActions = acciones.filter((a) => !a.primary);

  return (
    <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
      {/* Acción primaria como botón */}
      {primaryAction && (
        <Tooltip title={primaryAction.label} arrow>
          <IconButton
            size="small"
            onClick={() => onAction(row, primaryAction.label)}
            sx={{ color: primaryAction.color }}
          >
            {primaryAction.icon}
          </IconButton>
        </Tooltip>
      )}

      {/* Acciones secundarias en menú */}
      {secondaryActions.length > 0 && (
        <>
          <Tooltip title="Más acciones" arrow>
            <IconButton size="small" sx={{ color: "#888" }} onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ elevation: 3, sx: { borderRadius: "8px", minWidth: 180, mt: 0.5 } }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {secondaryActions.map((accion) => (
              <MenuItem
                key={accion.label}
                onClick={() => { setAnchorEl(null); onAction(row, accion.label); }}
                sx={{ py: 1, fontSize: "0.875rem", "&:hover": { bgcolor: "#f8fafc" } }}
              >
                <ListItemIcon sx={{ color: accion.color, minWidth: 32 }}>
                  {accion.icon}
                </ListItemIcon>
                <ListItemText primary={accion.label} />
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Stack>
  );
};

const MisEstablecimientos = () => {
  const navigate = useNavigate();
  const isEfector = localStorage.getItem("clicsalud_role") === "efector"
    || !localStorage.getItem("clicsalud_role");
  const [generalSearch, setGeneralSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [filters, setFilters] = useState({
    nombre: "",
    expediente: "",
    tipologia: "",
    tipoTramite: "",
    departamento: "",
    localidad: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const handleAction = (est) => {
    navigate("/home-efector/servicios");
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      nombre: "",
      expediente: "",
      cuit: "",
      tipologia: "",
      tipoTramite: "",
      departamento: "",
      localidad: "",
      estado: "",
      fechaDesde: "",
      fechaHasta: "",
    });
    setGeneralSearch("");
  };

  const filteredData = ESTABLECIMIENTOS.filter((est) => {
    if (filters.nombre && !est.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    if (filters.expediente && !est.expediente.toLowerCase().includes(filters.expediente.toLowerCase())) return false;
    if (filters.cuit && !est.cuit.toLowerCase().includes(filters.cuit.toLowerCase())) return false;
    if (filters.tipologia && est.tipologia !== filters.tipologia) return false;
    if (filters.tipoTramite && est.tipoTramite !== filters.tipoTramite) return false;
    if (filters.departamento && est.departamento !== filters.departamento) return false;
    if (filters.localidad && !est.localidad.toLowerCase().includes(filters.localidad.toLowerCase())) return false;
    if (filters.estado && est.estado !== filters.estado) return false;
    if (filters.fechaDesde) {
      const d = est.fechaCreacion.split('/').reverse().join('-');
      if (d < filters.fechaDesde) return false;
    }
    if (filters.fechaHasta) {
      const d = est.fechaCreacion.split('/').reverse().join('-');
      if (d > filters.fechaHasta) return false;
    }
    return true;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ maxWidth: "1600px", mx: "auto" }}>


      {/* === SECCIÓN FILTROS === */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: "12px",
          border: "1px solid #e2e8f0",

        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 900, color: "#005596", letterSpacing: -1, p: 2 }}>
          Bandeja de Establecimientos
        </Typography>
        {/* Header de filtros */}
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 4,
                height: 22,
                borderRadius: "4px",
                bgcolor: "#005596",
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Filtros de búsqueda
            </Typography>
          </Box>
        </Box>



        {/* Campos de filtros — 3 filas de 3 */}
        <Box sx={{ p: 3 }}>
          {/* Fila 1: N° Expediente · Nombre · CUIT */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 32px", mb: 3 }}>
            <TextField variant="standard" label="N° Expediente" name="expediente"
              value={filters.expediente} onChange={handleFilterChange} placeholder="Ej: 0425-382230/2026" />
            <TextField variant="standard" label="Nombre del establecimiento" name="nombre"
              value={filters.nombre} onChange={handleFilterChange} placeholder="Buscar por nombre..." />
            <TextField variant="standard" label="CUIT" name="cuit"
              value={filters.cuit} onChange={handleFilterChange} placeholder="Ej: 30-12345678-9" />
          </Box>

          {/* Fila 2: Estado · Fecha desde · Tipología */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 32px", mb: 3 }}>
            <TextField variant="standard" select label="Estado" name="estado"
              value={filters.estado} onChange={handleFilterChange}>
              <MenuItem value="">Todos los estados</MenuItem>
              <MenuItem value="EN PROCESO DE MODIFICACIÓN">En Proceso de Modificación</MenuItem>
              <MenuItem value="HABILITADO">Habilitado</MenuItem>
              <MenuItem value="PRÓXIMO A VENCER">Próximo a Vencer</MenuItem>
              <MenuItem value="VENCIDO">Vencido</MenuItem>
              <MenuItem value="NO VIGENTE">No Vigente</MenuItem>
            </TextField>
            <TextField variant="standard" label="Fecha desde" name="fechaDesde" type="date"
              InputLabelProps={{ shrink: true }} value={filters.fechaDesde} onChange={handleFilterChange} />
            <TextField variant="standard" select label="Tipología" name="tipologia"
              value={filters.tipologia} onChange={handleFilterChange}>
                            <MenuItem value="">Todas las tipologías</MenuItem>
              <MenuItem value="UNIDAD O SERVICIO DE DIÁLISIS">Unidad o Servicio de Diálisis</MenuItem>
              <MenuItem value="CENTRO DE ESTÉTICA CORPORAL">Centro de Estética Corporal</MenuItem>
              <MenuItem value="CENTRO DE SALUD AMBULATORIO">Centro de Salud Ambulatorio</MenuItem>
              <MenuItem value="CENTRO CIRUGÍA AMBULATORIA">Centro Cirugía Ambulatoria</MenuItem>
              <MenuItem value="CLÍNICAS, SANATORIO U HOSPITAL PRIVADO">Clínicas, Sanatorio u Hospital Privado</MenuItem>
              <MenuItem value="CONSULTORIO">Consultorio</MenuItem>
              <MenuItem value="ESTABLECIMIENTO / UNIDAD DE CUIDADOS PALIATIVOS CON INTERNACIÓN">Establecimiento / Unidad de Cuidados Paliativos con Internación</MenuItem>
              <MenuItem value="SERVICIO DE ATENCIÓN EXTRAHOSPITALARIO MÓVIL">Servicio de Atención Extrahospitalario Móvil</MenuItem>
              <MenuItem value="ESTABLECIMIENTOS GERIÁTRICOS">Establecimientos Geriátricos</MenuItem>
              <MenuItem value="HOSPITAL DE DÍA ONCOLÓGICO. CENTRO Y/O SERVICIO DE QUIMIOTERAPIA">Hospital de Día Oncológico. Centro y/o Servicio de Quimioterapia</MenuItem>
              <MenuItem value="LABORATORIO DE ANÁLISIS CLÍNICOS">Laboratorio de Análisis Clínicos</MenuItem>
              <MenuItem value="ÓPTICA Y CONTACTOLOGÍA">Óptica y Contactología</MenuItem>
              <MenuItem value="RADIOFÍSICA">Radiofísica</MenuItem>
              <MenuItem value="SERVICIO DE INTERNACIÓN DOMICILIARIA">Servicio de Internación Domiciliaria</MenuItem>
              <MenuItem value="TATUADORES Y PERFORADORES">Tatuadores y Perforadores</MenuItem>
            </TextField>
          </Box>

          {/* Fila 3: Tipo de Trámite · Departamento · Localidad */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 32px" }}>
            <TextField variant="standard" select label="Tipo de Trámite" name="tipoTramite"
              value={filters.tipoTramite} onChange={handleFilterChange}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Habilitación">Habilitación</MenuItem>
              <MenuItem value="Renovación">Renovación</MenuItem>
              <MenuItem value="Modificación">Modificación</MenuItem>
            </TextField>
            <TextField variant="standard" select label="Departamento" name="departamento"
              value={filters.departamento} onChange={handleFilterChange}>
              <MenuItem value="">Todos los departamentos</MenuItem>
              <MenuItem value="Capital">Capital</MenuItem>
              <MenuItem value="Río Cuarto">Río Cuarto</MenuItem>
              <MenuItem value="Punilla">Punilla</MenuItem>
              <MenuItem value="Colón">Colón</MenuItem>
              <MenuItem value="General San Martín">General San Martín</MenuItem>
            </TextField>
            <TextField variant="standard" label="Localidad" name="localidad"
              value={filters.localidad} onChange={handleFilterChange} placeholder="Ej: Córdoba" />
          </Box>

          {/* Botones */}
          <Box display="flex" justifyContent="flex-end" gap={1.5} mt={4}>
            <Button variant="outlined" onClick={clearFilters} startIcon={<RefreshIcon />}
              sx={{
                borderColor: "#cbd5e1", color: "#64748b", borderRadius: "8px",
                textTransform: "none", fontWeight: 600,
                "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" }
              }}>
              Limpiar
            </Button>
            <Button variant="contained" startIcon={<SearchIcon />}
              sx={{
                bgcolor: "#005596", "&:hover": { bgcolor: "#003b6b" },
                textTransform: "none", fontWeight: 700, borderRadius: "8px",
                boxShadow: "none", px: 3
              }}>
              Buscar
            </Button>
          </Box>
        </Box>
      </Paper >

      {/* Tabla Principal */}
      < Paper elevation={0} sx={{ borderRadius: "8px", border: "1px solid #e0e0e0", overflow: "hidden" }}>


        < TableContainer >
          <Table sx={{ minWidth: 1000 }} size="medium">
            <TableHead>
              <TableRow sx={{ bgcolor: "#005596" }}>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>EXPEDIENTE</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>ESTABLECIMIENTO</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>ESTADO</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>FECHA DE INGRESO</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>TIPOLOGÍA</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>UBICACIÓN</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>{row.expediente}</Typography>
                    <Typography variant="caption" sx={{ color: "#777" }}>Sol: {row.nSolicitud}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>{row.nombre}</Typography>
                    <Typography variant="caption" sx={{ color: "#777" }}>CUIT: {row.cuit}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.estado}
                      size="small"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.7rem",
                        bgcolor: `${row.color}15`,
                        color: row.color,
                        borderRadius: '4px',
                        border: `1px solid ${row.color}30`
                      }}
                    />
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: "#666" }}>
                      {row.etapa}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#333" }}>{row.fechaCreacion}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#333" }}>{row.tipologia}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#333" }}>{row.localidad}</Typography>
                    <Typography variant="caption" sx={{ color: "#777" }}>{row.departamento}</Typography>
                  </TableCell>

                  <TableCell align="center">
                    <AccionesCell row={row} onAction={handleAction} />
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron resultados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer >
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
        />
      </Paper >

      {/* Modal Habilitación */}
      <ModalHabilitacion open={openModal} onClose={() => setOpenModal(false)} />

    </Box >
  );
};

export default MisEstablecimientos;

// ─── Router de roles ─────────────────────────────────────────────────────────
const MisEstablecimientosPorRol = () => {
  const { role } = useRole(); // reactivo: cambia cuando el navbar chip cambia
  if (role === "auditor") return <VistaAuditor />;
  if (role === "inspector") return <VistaInspector />;
  if (role === "protocolizador") return <VistaProtocolizador />;
  return <MisEstablecimientos />; // efector (default)
};

export { MisEstablecimientosPorRol };
