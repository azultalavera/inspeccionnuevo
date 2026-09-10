import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, 
  Stack, IconButton, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  DeleteOutlineOutlined as DeleteOutlineIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const JefeServicioStep = ({ selectedServices, cargados, setCargados }) => {
  const [requeridos, setRequeridos] = useState([]);
  const [busqueda, setBusqueda] = useState({ 
    cuil: '', 
    nombre: '', 
    apellido: '', 
    servicio: '', 
    especialidad: '', 
    matricula: '' 
  });

  // Función para normalizar texto (quita tildes, espacios y pasa a mayúsculas)
  const normalizarTexto = (texto) => {
    return texto
      ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase()
      : "";
  };

  // 1. Carga y Filtrado dinámico según servicios seleccionados
// 1. Carga y Filtrado dinámico corregido
  useEffect(() => {
    const fetchRequerimientos = async () => {
      try {
        const res = await fetch('http://localhost:3001/jefe-servicio');
        const data = await res.json();

        // Extraemos solo los nombres de los servicios que están REALMENTE seleccionados
        // Verificamos si el valor es true o si es un objeto que tiene una propiedad de selección
        const activos = Object.keys(selectedServices || {}).filter(key => {
          const serviceData = selectedServices[key];
          // Ajustamos para detectar si está checkeado (asumiendo que si existe el objeto es porque se interactuó con él)
          // Si tu objeto tiene una propiedad interna como 'checked', usala aquí: serviceData.checked
          return serviceData !== null && serviceData !== false; 
        });
        
        console.log("Servicios detectados REALMENTE activos:", activos);

        const filtrados = data.filter(item => 
          activos.some(activo => normalizarTexto(activo) === normalizarTexto(item.origen))
        );

        setRequeridos(filtrados);
      } catch (err) {
        console.error("Error cargando requerimientos:", err);
      }
    };

    fetchRequerimientos();
  }, [selectedServices]);

  const handleAgregarJefe = () => {
    if (!busqueda.cuil || !busqueda.servicio) return;
    
    const nuevoJefe = {
      id: Date.now(),
      ...busqueda,
      nombre: busqueda.nombre || "NOMBRE", // Aquí iría la lógica del fetch por CUIL
      apellido: busqueda.apellido || "APELLIDO"
    };
    setCargados([...cargados, nuevoJefe]);
    setBusqueda({ cuil: '', nombre: '', apellido: '', servicio: '', especialidad: '', matricula: '' });
  };

  return (
    <Box>
      <Typography variant="h6" color="#005596" mb={3} fontWeight="bold">
        Jefaturas de Servicio Requeridas (Anexo I)
      </Typography>

      {/* 1. TARJETAS DE REQUERIMIENTOS (Basadas en Servicios seleccionados) */}
      {requeridos.length > 0 ? (
        <Grid container spacing={2} mb={5}>
          {requeridos.map((req) => {
            const yaCargado = cargados.some(c => normalizarTexto(c.servicio) === normalizarTexto(req.origen));
            return (
              <Grid item xs={12} md={4} key={req.id}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderLeft: `6px solid ${yaCargado ? '#10B981' : '#F59E0B'}`,
                    bgcolor: yaCargado ? '#f0fff4' : '#fff9f0',
                    transition: '0.3s'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">REQUERIMIENTO</Typography>
                      <Typography variant="body1" fontWeight="bold">{req.origen}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                        Especialidad: {req.especialidad}
                      </Typography>
                    </Box>
                    {yaCargado ? <CheckCircleIcon color="success" /> : <InfoIcon color="warning" />}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          No se detectaron servicios que requieran jefaturas obligatorias. Puede realizar cargas adicionales.
        </Alert>
      )}

      {/* 2. FORMULARIO DE VINCULACIÓN */}
      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: '4px', mb: 4, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#f8fafc', p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle1" fontWeight="bold" color="#005596">Asignar Jefe de Servicio</Typography>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Seleccionar Servicio *" 
                fullWidth variant="standard" 
                select 
                SelectProps={{ native: true }}
                value={busqueda.servicio}
                onChange={(e) => setBusqueda({...busqueda, servicio: e.target.value})}
              >
                <option value=""></option>
                {Object.keys(selectedServices || {}).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Especialidad Certificada *" 
                fullWidth variant="standard" 
                value={busqueda.especialidad}
                onChange={(e) => setBusqueda({...busqueda, especialidad: e.target.value.toUpperCase()})}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: '4px', display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField 
                  label="CUIL del Profesional *" 
                  variant="standard" 
                  sx={{ width: '300px' }} 
                  value={busqueda.cuil}
                  onChange={(e) => setBusqueda({...busqueda, cuil: e.target.value})}
                />
                <Button variant="contained" startIcon={<SearchIcon />} sx={{ bgcolor: '#29b6f6' }}>BUSCAR</Button>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleAgregarJefe}
              disabled={!busqueda.servicio || !busqueda.cuil}
              sx={{ bgcolor: '#005596', fontWeight: 'bold' }}
            >
              VINCULAR JEFE
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 3. TABLA DE RESUMEN */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#005596' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>PROFESIONAL</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>SERVICIO ASIGNADO</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ESPECIALIDAD</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cargados.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{row.apellido}, {row.nombre}</Typography>
                  <Typography variant="caption">CUIL: {row.cuil}</Typography>
                </TableCell>
                <TableCell><Chip label={row.servicio} size="small" variant="outlined" color="primary" /></TableCell>
                <TableCell>{row.especialidad}</TableCell>
                <TableCell align="center">
                  <IconButton color="error" onClick={() => setCargados(cargados.filter(c => c.id !== row.id))}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {cargados.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No se han vinculado jefes de servicio.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default JefeServicioStep;