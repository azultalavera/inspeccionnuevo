import React from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Switch, Select, MenuItem, FormControl
} from '@mui/material';
import { Add as AddIcon } from "@mui/icons-material";
import Layout from '../ui/Layout';

const GestionRecursos = () => {
  const rows = [
    { cuil: '27214016090', nombre: 'Marcela De Lourdes', apellido: 'Valle', rol: 'AGENTE ARQUITECTURA', activo: true },
    { cuil: '20394442594', nombre: 'Rodrigo', apellido: 'Tosco', rol: 'AGENTE AUDITORÍA', activo: true },
  ];

  return (
    <Layout>
      <Paper elevation={0} sx={{ borderRadius: '4px', border: '1px solid #e0e0e0', overflow: 'hidden', mb: 4, width: '100%', boxSizing: 'border-box' }}>
        {/* Encabezado Azul */}
        <Box sx={{ backgroundColor: '#005596', color: 'white', py: 2, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>Asignación de roles</Typography>
        </Box>

        <Box sx={{ p: 4, backgroundColor: 'white' }}>
          {/* Filtros de usuarios */}
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '4px', p: 2, mb: 4 }}>
            <Typography sx={{ color: '#0090d0', fontWeight: 'bold', fontSize: '1.2rem' }}>
              Filtros de usuarios
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: '#29b6f6' }}>
              AGREGAR USUARIO
            </Button>
          </Box>

          <TableContainer>
            <Table sx={{ '& .MuiTableCell-head': { color: '#005596', fontWeight: 'bold', borderBottom: '2px solid #005596', textAlign: 'center' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>CUIL</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Activo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{row.cuil}</TableCell>
                    <TableCell align="center">{row.nombre}</TableCell>
                    <TableCell align="center">{row.apellido}</TableCell>
                    <TableCell align="center">
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select value={row.rol}>
                          <MenuItem value={row.rol}>{row.rol}</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center">
                      <Switch checked={row.activo} color="primary" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Layout>
  );
};

// ESTA LÍNEA ES LA QUE SOLUCIONA EL ERROR:
export default GestionRecursos;