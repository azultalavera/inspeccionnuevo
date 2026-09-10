import React, { useState } from "react";
import {
  Box, Typography, Paper, Button, TextField, MenuItem,
  Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { MOCK_ESTABLECIMIENTOS } from "../../../data/mockData";


const ESTABLECIMIENTOS = MOCK_ESTABLECIMIENTOS;

const ESTADO_COLORS = {
  "HABILITADO":                  { bg: "#e8f5e9", color: "#2e7d32" },
  "PRÓXIMO A VENCER":            { bg: "#fff8e1", color: "#f57f17" },
  "VENCIDO":                     { bg: "#ffebee", color: "#c62828" },
  "EN PROCESO DE MODIFICACIÓN":  { bg: "#f3e5f5", color: "#6a1b9a" },
  "NO VIGENTE":                  { bg: "#e3f2fd", color: "#1565c0" },
};

const VistaProtocolizador = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({ expediente: "", nombre: "", cuit: "", estado: "", tipologia: "", departamento: "", localidad: "" });

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => setFilters({ expediente: "", nombre: "", cuit: "", estado: "", tipologia: "", departamento: "", localidad: "" });

  const filteredData = ESTABLECIMIENTOS.filter((est) => {
    if (filters.nombre      && !est.nombre.toLowerCase().includes(filters.nombre.toLowerCase()))           return false;
    if (filters.expediente  && !est.expediente.toLowerCase().includes(filters.expediente.toLowerCase()))   return false;
    if (filters.cuit        && !est.cuit.includes(filters.cuit))                                           return false;
    if (filters.tipologia   && est.tipologia !== filters.tipologia)                                        return false;
    if (filters.departamento && est.departamento !== filters.departamento)                                  return false;
    if (filters.localidad   && !est.localidad.toLowerCase().includes(filters.localidad.toLowerCase()))     return false;
    if (filters.estado      && est.estado !== filters.estado)                                              return false;
    return true;
  });

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
          Bandeja de Establecimientos (Protocolización)
        </Typography>
      </Paper>

      {/* Filtros */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ width: 4, height: 22, borderRadius: "4px", bgcolor: "#e65100" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Trámites para protocolizar
            </Typography>
          </Box>
          <Chip label="Agente Protocolizador" size="small" sx={{ bgcolor: "#e6510015", color: "#e65100", fontWeight: 700, border: "1px solid #e6510030" }} />
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Fila 1 */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 32px", mb: 3 }}>
            <TextField variant="standard" label="N° Expediente"              name="expediente"  value={filters.expediente}  onChange={handleFilterChange} placeholder="Ej: 0425-382230/2026" />
            <TextField variant="standard" label="Nombre del establecimiento" name="nombre"       value={filters.nombre}       onChange={handleFilterChange} placeholder="Buscar por nombre..." />
            <TextField variant="standard" label="CUIT"                       name="cuit"         value={filters.cuit}         onChange={handleFilterChange} placeholder="Ej: 30-12345678-9" />
          </Box>
          {/* Fila 2 */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 32px", mb: 3 }}>
            <TextField variant="standard" select label="Estado" name="estado" value={filters.estado} onChange={handleFilterChange}>
              <MenuItem value="">Todos los estados</MenuItem>
              <MenuItem value="HABILITADO">Habilitado</MenuItem>
              <MenuItem value="PRÓXIMO A VENCER">Próximo a Vencer</MenuItem>
              <MenuItem value="VENCIDO">Vencido</MenuItem>
              <MenuItem value="EN PROCESO DE MODIFICACIÓN">En Proceso de Modificación</MenuItem>
            </TextField>
            <TextField variant="standard" select label="Tipología" name="tipologia" value={filters.tipologia} onChange={handleFilterChange}>
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
            <TextField variant="standard" select label="Departamento" name="departamento" value={filters.departamento} onChange={handleFilterChange}>
              <MenuItem value="">Todos los departamentos</MenuItem>
              <MenuItem value="Capital">Capital</MenuItem>
              <MenuItem value="Río Cuarto">Río Cuarto</MenuItem>
              <MenuItem value="Punilla">Punilla</MenuItem>
              <MenuItem value="General San Martín">General San Martín</MenuItem>
            </TextField>
          </Box>
          {/* Botones */}
          <Box display="flex" justifyContent="flex-end" gap={1.5} mt={2}>
            <Button variant="outlined" onClick={clearFilters} startIcon={<RefreshIcon />} sx={{ borderColor: "#cbd5e1", color: "#64748b", borderRadius: "8px", textTransform: "none", fontWeight: 600 }}>Limpiar</Button>
            <Button variant="contained" startIcon={<SearchIcon />} sx={{ bgcolor: "#e65100", "&:hover": { bgcolor: "#bf360c" }, textTransform: "none", fontWeight: 700, borderRadius: "8px", boxShadow: "none", px: 3 }}>Buscar</Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabla */}
      <Paper elevation={0} sx={{ borderRadius: "8px", border: "1px solid #e0e0e0", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 900 }} size="medium">
            <TableHead>
              <TableRow sx={{ bgcolor: "#005596" }}>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>EXPEDIENTE</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>ESTABLECIMIENTO</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>ESTADO</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>FECHA INGRESO</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>TIPOLOGÍA</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>UBICACIÓN</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "white", fontSize: "0.75rem" }}>ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                const ec = ESTADO_COLORS[row.estado] || { bg: "#f5f5f5", color: "#333" };
                return (
                  <TableRow key={row.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.expediente}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.nSolicitud}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">CUIT: {row.cuit}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.estado} size="small" sx={{ bgcolor: ec.bg, color: ec.color, fontWeight: 700, fontSize: "0.7rem" }} />
                    </TableCell>
                    <TableCell><Typography variant="body2">{row.fechaCreacion}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{row.tipologia}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.localidad}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.departamento}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Button size="small" startIcon={<VisibilityIcon />}     sx={{ textTransform: "none", color: "#64748b" }}>Ver</Button>
                        <Button size="small" startIcon={<CloudDownloadIcon />}  sx={{ textTransform: "none", color: "#00796b" }}>Descargar</Button>
                        <Button size="small" startIcon={<CheckCircleIcon />}    sx={{ textTransform: "none", color: "#e65100", fontWeight: 700 }}>Protocolizar</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          labelRowsPerPage="Filas por página"
        />
      </Paper>
    </Box>
  );
};

export default VistaProtocolizador;
