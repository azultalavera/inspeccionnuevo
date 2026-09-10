import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  MenuItem,
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  AddCircleOutlineOutlined as AddCircleOutlineIcon,
  ArrowForward as ArrowForwardIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { MOCK_TRAMITES } from "../../data/mockData";


const TRAMITES = MOCK_TRAMITES;

// Acciones contextuales por estado del trámite
const ACCIONES_POR_ESTADO = {
  "BORRADOR AUDITORÍA": [
    { label: "Continuar", icon: <ArrowForwardIcon fontSize="small" />, color: "rgb(9, 155, 227)", primary: true },
    { label: "Historial", icon: <HistoryIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
  ],
  "RESPUESTA EMPLAZAMIENTO": [
    { label: "Responder", icon: <EditIcon fontSize="small" />, color: "rgb(9, 155, 227)", primary: true },
    { label: "Visualizar", icon: <VisibilityIcon fontSize="small" />, color: "rgb(254, 222, 39)" },
    { label: "Historial", icon: <HistoryIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
  ],
  "EN ANÁLISIS ARQUITECTURA": [
    { label: "Visualizar", icon: <VisibilityIcon fontSize="small" />, color: "rgb(254, 222, 39)", primary: true },
    { label: "Historial", icon: <HistoryIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
  ],
  "PENDIENTE EVALUACIÓN ARQUITECTURA": [
    { label: "Visualizar", icon: <VisibilityIcon fontSize="small" />, color: "rgb(254, 222, 39)", primary: true },
    { label: "Historial", icon: <HistoryIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
  ],
  "ACEPTADO DOCUMENTACIÓN": [
    { label: "Continuar", icon: <ArrowForwardIcon fontSize="small" />, color: "rgb(9, 155, 227)", primary: true },
    { label: "Visualizar", icon: <VisibilityIcon fontSize="small" />, color: "rgb(254, 222, 39)" },
    { label: "Ver Resolución", icon: <DescriptionIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
    { label: "Historial", icon: <HistoryIcon fontSize="small" />, color: "rgb(46, 125, 50)" },
  ],
};

// Componente de acciones contextuales con menú desplegable
const AccionesCell = ({ row, onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const acciones = ACCIONES_POR_ESTADO[row.estado] || [
    { label: "Visualizar", icon: <VisibilityIcon fontSize="small" />, color: "rgb(254, 222, 39)", primary: true },
  ];
  const primaryAction = acciones.find((a) => a.primary);
  const secondaryActions = acciones.filter((a) => !a.primary);

  return (
    <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
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

const TramitesEnCurso = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    expediente: "",
    nombre: "",
    cuit: "",
    estado: "",
    fechaDesde: "",
    tipologia: "",
    tipo: "",
    departamento: "",
    localidad: "",
  });

  const handleAction = (tramite, accionLabel) => {
    if (accionLabel === "Continuar" || accionLabel === "Responder") {
      if (tramite.id === 2) {
        navigate("/home-efector/respuesta-emplazamiento");
      } else {
        navigate("/home-efector/servicios");
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      expediente: "",
      nombre: "",
      cuit: "",
      estado: "",
      fechaDesde: "",
      tipologia: "",
      tipo: "",
      departamento: "",
      localidad: "",
    });
  };

  const filteredData = TRAMITES.filter((tramite) => {
    if (filters.expediente && !tramite.expediente.toLowerCase().includes(filters.expediente.toLowerCase())) return false;
    if (filters.nombre && !tramite.servicio.toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    if (filters.tipo && tramite.tipo !== filters.tipo) return false;
    if (filters.estado && tramite.estado !== filters.estado) return false;
    if (filters.fechaDesde) {
      const estDateStr = tramite.fechaIngreso.split("/").reverse().join("-");
      if (estDateStr < filters.fechaDesde) return false;
    }
    // Nota: cuit, tipologia, departamento y localidad no están en el mock TRAMITES,
    // se agregan los filtros para consistencia visual con MisEstablecimientos
    return true;
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ maxWidth: "1600px", mx: "auto" }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: 2.5
        }}
      >
        <Box sx={{ width: 6, height: 36, bgcolor: "#005596", borderRadius: "4px" }} />
        <Typography variant="h4" sx={{ fontWeight: 900, color: "#005596", letterSpacing: -1 }}>
          Bandeja de Trámites en Curso
        </Typography>
      </Paper>

      {/* === SECCIÓN FILTROS === */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
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
            <Box sx={{ width: 4, height: 22, borderRadius: "4px", bgcolor: "#005596" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Filtros de búsqueda
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              bgcolor: "#005596",
              "&:hover": { bgcolor: "#003b6b" },
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "none",
              px: 2.5,
            }}
          >
            Iniciar Nuevo Trámite
          </Button>
        </Box>

        {/* Campos de filtros — 3 filas de 3 */}
        <Box sx={{ p: 3 }}>
          {/* Fila 1: N° Expediente · Nombre · CUIT */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 32px", mb: 3 }}>
            <TextField variant="standard" label="N° Trámite" name="expediente"
              value={filters.expediente} onChange={handleFilterChange} placeholder="Ej: 170-2026" />
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
              <MenuItem value="BORRADOR AUDITORÍA">Borrador Auditoría</MenuItem>
              <MenuItem value="RESPUESTA EMPLAZAMIENTO">Respuesta Emplazamiento</MenuItem>
              <MenuItem value="EN ANÁLISIS ARQUITECTURA">En Análisis Arquitectura</MenuItem>
              <MenuItem value="PENDIENTE EVALUACIÓN ARQUITECTURA">Pendiente Evaluación Arquitectura</MenuItem>
              <MenuItem value="ACEPTADO DOCUMENTACIÓN">Aceptado Documentación</MenuItem>
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
            <TextField variant="standard" select label="Tipo de Trámite" name="tipo"
              value={filters.tipo} onChange={handleFilterChange}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="HABILITACIÓN">Habilitación</MenuItem>
              <MenuItem value="RENOVACIÓN">Renovación</MenuItem>
              <MenuItem value="MODIFICACIÓN">Modificación</MenuItem>
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

          {/* Botones de acción */}
          <Box display="flex" justifyContent="flex-end" gap={1.5} mt={4}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<RefreshIcon />}
              sx={{
                borderColor: "#cbd5e1",
                color: "#64748b",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
              }}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{
                bgcolor: "#005596",
                "&:hover": { bgcolor: "#003b6b" },
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
                boxShadow: "none",
                px: 3,
              }}
            >
              Buscar
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabla Principal */}
      <Paper elevation={0} sx={{ borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>


        <TableContainer>
          <Table sx={{ minWidth: 900 }} size="medium">
            <TableHead>
              <TableRow sx={{ bgcolor: "#005596" }}>
                <TableCell sx={{ fontWeight: 700, color: "white", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nro. Trámite</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "white", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Establecimiento</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "white", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "white", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Estado Actual</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "white", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fecha Ingreso</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: "white", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ 
                    "&:last-child td, &:last-child th": { border: 0 }, 
                    "&:hover": { bgcolor: row.id === 2 ? "#fff3e0" : "#f8fafc" },
                    bgcolor: row.id === 2 ? "#fff8e1" : "inherit"
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>{row.expediente}</Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>Sol: {row.nSolicitud}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>{row.servicio}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#334155", fontWeight: 500 }}>{row.tipo}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.estado}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        bgcolor: `${row.color}15`,
                        color: row.color,
                        borderRadius: "4px",
                        border: `1px solid ${row.color}30`,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#334155" }}>{row.fechaIngreso}</Typography>
                  </TableCell>

                  <TableCell align="center">
                    <AccionesCell row={row} onAction={handleAction} />
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                      No se encontraron resultados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
      </Paper>
    </Box>
  );
};

export default TramitesEnCurso;
