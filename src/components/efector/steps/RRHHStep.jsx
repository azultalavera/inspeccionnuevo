import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TextField, 
  Button, IconButton, Chip, Alert, Stack
} from '@mui/material';
import {
  DeleteOutlineOutlined as DeleteOutlineIcon,
  AddCircleOutlineOutlined as AddCircleOutlineIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const RRHHStep = ({ selectedServices, rrhhCargado, setRrhhCargado, onValidationSuccess }) => {
  const [minimos, setMinimos] = useState(rrhhCargado || []);
  const [adicionales, setAdicionales] = useState([]);
  const [revisionEjecutada, setRevisionEjecutada] = useState(false);

  // 1. Carga y Filtrado dinámico según servicios seleccionados
  useEffect(() => {
    const fetchYFiltrarRRHH = async () => {
      try {
        const res = await fetch('http://localhost:3001/recursos-humanos');
        const data = await res.json();

        // Extraemos las llaves (nombres de servicios) del objeto que viene del Step 3
        const activos = Object.keys(selectedServices || {});
        
        console.log("Servicios detectados para filtrar RRHH:", activos);

        // Filtramos la base de datos normalizando a mayúsculas
        const requeridosFiltrados = data.filter(item => {
          return activos.some(activo => 
            activo.trim().toUpperCase() === item.origen.trim().toUpperCase()
          );
        });

        console.log("Registros de RRHH encontrados:", requeridosFiltrados);

        const dataMapped = requeridosFiltrados.map(item => ({ 
          ...item, 
          cantidadCargada: '' 
        }));
        
        setMinimos(dataMapped);
      } catch (err) {
        console.error("Error filtrando RRHH:", err);
      }
    };

    if (selectedServices && Object.keys(selectedServices).length > 0 && (!rrhhCargado || rrhhCargado.length === 0)) {
      fetchYFiltrarRRHH();
    } else if (rrhhCargado && rrhhCargado.length > 0) {
      setMinimos(rrhhCargado);
    } else {
      setMinimos([]);
    }
  }, [selectedServices]);

  // Sincronizar minimos locales con el padre
  useEffect(() => {
    if (setRrhhCargado) {
       setRrhhCargado(minimos);
    }
  }, [minimos]);

  // --- FUNCIONES DE MANEJO DE ESTADO ---

  const handleMinimoChange = (id, value) => {
    setMinimos(minimos.map(m => m.id === id ? { ...m, cantidadCargada: value } : m));
  };

  const agregarAdicional = () => {
    setAdicionales([...adicionales, { 
      id: Date.now(), 
      tipoPlantel: '', 
      origen: '', 
      especialidad: '', 
      cantidadCargada: '' 
    }]);
  };

  const handleAdicionalChange = (id, field, value) => {
    setAdicionales(adicionales.map(a => 
      a.id === id ? { ...a, [field]: value.toUpperCase() } : a
    ));
  };

  const eliminarAdicional = (id) => {
    setAdicionales(adicionales.filter(a => a.id !== id));
  };

  const ejecutarRevision = () => {
    // Validamos que todos los campos requeridos tengan un valor numérico
    const todosCompletos = minimos.every(m => m.cantidadCargada !== '' && parseInt(m.cantidadCargada) >= 0);
    setRevisionEjecutada(true);
    if (onValidationSuccess) onValidationSuccess(todosCompletos);
  };

  return (
    <Box>
      <Typography variant="h6" color="#005596" mb={3} fontWeight="bold">
        Dotación de Personal Requerida (Anexo I)
      </Typography>

      {minimos.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, borderRadius: '8px' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#005596' }}>SERVICIO (ORIGEN)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#005596' }}>TIPO PLANTEL</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#005596' }}>ESPECIALIDAD REQUERIDA</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#005596' }} width="120px">CANTIDAD</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#005596' }}>ESTADO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* FILAS REQUERIDAS */}
              {minimos.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{row.origen}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.tipoPlantel} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.especialidad}</Typography>
                    <Typography variant="caption" display="block" color="secondary">
                      Mínimo ley: {row.minimo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField 
                      type="number" size="small" variant="standard"
                      value={row.cantidadCargada}
                      onChange={(e) => handleMinimoChange(row.id, e.target.value)}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {row.cantidadCargada !== '' ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <Box sx={{ width: 10, height: 10, bgcolor: '#eee', borderRadius: '50%', mx: 'auto' }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* FILAS ADICIONALES */}
              {adicionales.map((row) => (
                <TableRow key={row.id} sx={{ bgcolor: '#fffde7' }}>
                  <TableCell>
                    <TextField size="small" variant="standard" placeholder="Área" value={row.origen} onChange={(e) => handleAdicionalChange(row.id, 'origen', e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" variant="standard" placeholder="Tipo" value={row.tipoPlantel} onChange={(e) => handleAdicionalChange(row.id, 'tipoPlantel', e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" variant="standard" placeholder="Especialidad" value={row.especialidad} onChange={(e) => handleAdicionalChange(row.id, 'especialidad', e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <TextField type="number" size="small" variant="standard" value={row.cantidadCargada} onChange={(e) => handleAdicionalChange(row.id, 'cantidadCargada', e.target.value)} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => eliminarAdicional(row.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid #eee' }}>
            <Button 
              startIcon={<AddCircleOutlineIcon />} 
              onClick={agregarAdicional} 
              sx={{ color: '#0090d0', fontWeight: 'bold' }}
            >
              AGREGAR OTRO RECURSO HUMANO
            </Button>
          </Box>
        </TableContainer>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Los servicios seleccionados no tienen requerimientos mínimos de personal específicos.
        </Alert>
      )}

      {/* PANEL DE ACCIÓN FINAL */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f0f7ff', borderLeft: '6px solid #005596' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">Validación de Plantel</Typography>
            <Typography variant="caption" color="text.secondary">
              Debe completar los requerimientos obligatorios para poder avanzar al siguiente paso.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            onClick={ejecutarRevision} 
            sx={{ bgcolor: '#005596', '&:hover': { bgcolor: '#003e6e' } }}
          >
            REVISAR CARGA
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default RRHHStep;