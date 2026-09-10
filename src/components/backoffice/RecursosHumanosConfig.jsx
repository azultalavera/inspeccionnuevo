import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Modal, TextField, Stack, IconButton,
  Autocomplete, Chip 
} from '@mui/material';
import { Add as AddIcon } from "@mui/icons-material";
import { Edit as EditIcon } from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Search as SearchIcon } from "@mui/icons-material";
import { Cancel as CancelIcon } from "@mui/icons-material";
import { Check as CheckIcon } from "@mui/icons-material";
import Layout from '../ui/Layout';

const styleModal = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 650, bgcolor: 'background.paper', boxShadow: 24, borderRadius: '4px', overflow: 'hidden'
};

const RecursosHumanosConfig = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Estados de Filtros específicos para RRHH
  const [filtroTipologia, setFiltroTipologia] = useState(null);
  const [filtroOrigen, setFiltroOrigen] = useState(null);
  const [filtroTipoPlantel, setFiltroTipoPlantel] = useState(null);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState(null);

  const opcionesTipologia = [
    "UNIDAD O SERVICIO DE DIÁLISIS",
    "CENTRO DE ESTÉTICA CORPORAL",
    "CENTRO DE SALUD AMBULATORIO",
    "CENTRO CIRUGÍA AMBULATORIA",
    "CLÍNICAS, SANATORIO U HOSPITAL PRIVADO",
    "CONSULTORIO",
    "ESTABLECIMIENTO / UNIDAD DE CUIDADOS PALIATIVOS CON INTERNACIÓN",
    "SERVICIO DE ATENCIÓN EXTRAHOSPITALARIO MÓVIL",
    "ESTABLECIMIENTOS GERIÁTRICOS",
    "HOSPITAL DE DÍA ONCOLÓGICO. CENTRO Y/O SERVICIO DE QUIMIOTERAPIA",
    "LABORATORIO DE ANÁLISIS CLÍNICOS",
    "ÓPTICA Y CONTACTOLOGÍA",
    "RADIOFÍSICA",
    "SERVICIO DE INTERNACIÓN DOMICILIARIA",
    "TATUADORES Y PERFORADORES"
  ];
  const opcionesTipoPlantel = ["MÉDICO", "ENFERMERÍA", "TÉCNICO", "ADMINISTRATIVO"];

  const [currentItem, setCurrentItem] = useState({
    tipologia: 'CLÍNICAS, SANATORIOS Y HOSPITALES',
    origen: '',
    tipoPlantel: '',
    especialidad: '',
    minimo: ''
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Ajusta la URL según tu db.json o API
      const res = await fetch('http://localhost:3001/recursos-humanos');
      const json = await res.json();
      setData(json);
    } catch (err) { console.error("Error:", err); }
    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const dataFiltrada = useMemo(() => {
    return data.filter(item => {
      return (!filtroTipologia || item.tipologia === filtroTipologia) &&
             (!filtroOrigen || item.origen === filtroOrigen) &&
             (!filtroTipoPlantel || item.tipoPlantel === filtroTipoPlantel) &&
             (!filtroEspecialidad || item.especialidad === filtroEspecialidad);
    });
  }, [data, filtroTipologia, filtroOrigen, filtroTipoPlantel, filtroEspecialidad]);

  const handleGuardar = async () => {
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `http://localhost:3001/recursos-humanos/${currentItem.id}` : 'http://localhost:3001/recursos-humanos';
    await fetch(url, {
      method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentItem)
    });
    setOpen(false);
    cargarDatos();
  };

  const handleBorrar = async (id) => {
    if (window.confirm("¿Desea eliminar esta regla de RRHH?")) {
      await fetch(`http://localhost:3001/recursos-humanos/${id}`, { method: 'DELETE' });
      cargarDatos();
    }
  };

  return (
    <Layout>
      <Paper elevation={0} sx={{ borderRadius: '4px', border: '1px solid #e0e0e0', overflow: 'hidden', mb: 4, width: '100%', boxSizing: 'border-box' }}>
        <Box sx={{ backgroundColor: '#005596', color: 'white', py: 2, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>Gestión de Recursos Humanos</Typography>
        </Box>

        <Box sx={{ p: 4, backgroundColor: 'white' }}>
          
          {/* SECCIÓN FILTROS */}
          <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: '4px', borderColor: '#e0e0e0' }}>
            <Typography variant="h6" sx={{ color: '#0090d0', mb: 4, fontWeight: 'bold' }}>
              Filtros de recursos humanos
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* FILA 1: Tipología y Origen */}
              <Box sx={{ display: 'flex', gap: 4, width: '100%' }}>
                <Box sx={{ flex: '1 1 50%' }}>
                  <Autocomplete
                    options={opcionesTipologia}
                    value={filtroTipologia}
                    onChange={(e, v) => setFiltroTipologia(v)}
                    renderInput={(params) => <TextField {...params} label="Tipología" variant="standard" fullWidth />}
                  />
                </Box>
                <Box sx={{ flex: '1 1 50%' }}>
                  <Autocomplete
                    options={[...new Set(data.map(i => i.origen))].sort()}
                    value={filtroOrigen}
                    onChange={(e, v) => setFiltroOrigen(v)}
                    renderInput={(params) => <TextField {...params} label="Origen (Servicio/Sala)" variant="standard" fullWidth />}
                  />
                </Box>
              </Box>

              {/* FILA 2: Tipo Plantel y Especialidad */}
              <Box sx={{ display: 'flex', gap: 4, width: '100%' }}>
                <Box sx={{ flex: '1 1 50%' }}>
                  <Autocomplete
                    options={opcionesTipoPlantel}
                    value={filtroTipoPlantel}
                    onChange={(e, v) => setFiltroTipoPlantel(v)}
                    renderInput={(params) => <TextField {...params} label="Tipo de Plantel" variant="standard" fullWidth />}
                  />
                </Box>
                <Box sx={{ flex: '1 1 50%' }}>
                  <Autocomplete
                    options={[...new Set(data.map(i => i.especialidad))].sort()}
                    value={filtroEspecialidad}
                    onChange={(e, v) => setFiltroEspecialidad(v)}
                    renderInput={(params) => <TextField {...params} label="Especialidad" variant="standard" fullWidth />}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2, width: '100%' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => { setFiltroTipologia(null); setFiltroOrigen(null); setFiltroTipoPlantel(null); setFiltroEspecialidad(null); }}
                  sx={{ color: '#29b6f6', borderColor: '#29b6f6', px: 5, fontWeight: 'bold' }}
                >
                  LIMPIAR
                </Button>
                <Button variant="contained" startIcon={<SearchIcon />} sx={{ backgroundColor: '#29b6f6', px: 5, fontWeight: 'bold' }}>
                  CONSULTAR
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* BOTÓN AGREGAR */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} 
              onClick={() => { 
                setCurrentItem({ tipologia: 'CLÍNICAS, SANATORIOS Y HOSPITALES', origen: '', tipoPlantel: '', especialidad: '', minimo: '' }); 
                setIsEditing(false); 
                setOpen(true); 
              }} 
              sx={{ backgroundColor: '#29b6f6', fontWeight: 'bold' }}
            >
              AGREGAR REQUISITO RRHH
            </Button>
          </Box>

          {/* TABLA DE RRHH */}
          {loading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', my: 5 }} />
          ) : (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { backgroundColor: 'white', borderBottom: '2px solid #005596', color: '#005596', fontWeight: 'bold', py: 2 } }}>
                    <TableCell>TIPOLOGÍA</TableCell>
                    <TableCell>ORIGEN (SERVICIO/SALA)</TableCell>
                    <TableCell>TIPO PLANTEL</TableCell>
                    <TableCell>ESPECIALIDAD</TableCell>
                    <TableCell>MÍNIMO</TableCell>
                    <TableCell align="center">ACCIONES</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataFiltrada.map((row) => (
                    <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#666' }}>{row.tipologia}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333' }}>{row.origen}</TableCell>
                      <TableCell>
                        <Chip label={row.tipoPlantel} size="small" sx={{ fontSize: '0.65rem', fontWeight: 'bold', bgcolor: '#e3f2fd', color: '#005596' }} />
                      </TableCell>
                      <TableCell>{row.especialidad}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#0090d0' }}>{row.minimo}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton onClick={() => { setCurrentItem(row); setIsEditing(true); setOpen(true); }} color="primary" size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => handleBorrar(row.id)} color="error" size="small">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={styleModal}>
          <Box sx={{ bgcolor: '#005596', color: 'white', p: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
              {isEditing ? 'Editar Requisito RRHH' : 'Nuevo Requisito RRHH'}
            </Typography>
          </Box>
          <Box sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Autocomplete options={opcionesTipologia} value={currentItem.tipologia} onChange={(e, v) => setCurrentItem({...currentItem, tipologia: v})} renderInput={(params) => <TextField {...params} label="Tipología" variant="standard" fullWidth />} />
              <TextField label="Origen (Servicio/Sala)" variant="standard" fullWidth value={currentItem.origen} onChange={(e) => setCurrentItem({...currentItem, origen: e.target.value.toUpperCase()})} />
              <Autocomplete options={opcionesTipoPlantel} value={currentItem.tipoPlantel} onChange={(e, v) => setCurrentItem({...currentItem, tipoPlantel: v})} renderInput={(params) => <TextField {...params} label="Tipo de Plantel" variant="standard" fullWidth />} />
              <TextField label="Especialidad" variant="standard" fullWidth value={currentItem.especialidad} onChange={(e) => setCurrentItem({...currentItem, especialidad: e.target.value.toUpperCase()})} />
              <TextField label="Cantidad Mínima" variant="standard" fullWidth value={currentItem.minimo} onChange={(e) => setCurrentItem({...currentItem, minimo: e.target.value})} />
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 5 }}>
              <Button variant="contained" color="error" startIcon={<CancelIcon />} onClick={() => setOpen(false)}>CANCELAR</Button>
              <Button variant="contained" startIcon={<CheckIcon />} onClick={handleGuardar} sx={{ bgcolor: '#005596' }}>{isEditing ? 'ACTUALIZAR' : 'AGREGAR'}</Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Layout>
  );
};

export default RecursosHumanosConfig;