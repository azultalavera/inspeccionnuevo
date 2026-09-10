import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Modal, TextField, Stack, IconButton, Autocomplete, Chip, Divider
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Edit as EditIcon } from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Search as SearchIcon } from "@mui/icons-material";
import { Cancel as CancelIcon } from "@mui/icons-material";
import { Check as CheckIcon } from "@mui/icons-material";
import Layout from "../ui/Layout";

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

const opcionesTipoServicio = [
  "SERVICIO",
  "SERVICIOS COMPLEMENTARIOS",
  "SERVICIOS CON INTERNACIÓN",
  "CONSULTORIO",
  "SALA",
  "CAMAS-PUESTOS"
];

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 750,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "4px",
  overflow: "hidden",
};

const ServiciosConfig = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Filtros
  const [filtroTipoServicio, setFiltroTipoServicio] = useState(null);
  const [filtroServicio, setFiltroServicio] = useState("");
  const [filtroTipologia, setFiltroTipologia] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(true);
  const [filtrosAplicados, setFiltrosAplicados] = useState({});

  const [currentItem, setCurrentItem] = useState({
    tipoServicio: null,
    servicio: "",
    tipologias: []
  });

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/servicios");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const dataFiltrada = useMemo(() => {
    if (!mostrarResultados || !Array.isArray(data)) return [];
    return data.filter((item) => {
      return (
        (!filtrosAplicados.tipoServicio || item.tipoServicio === filtrosAplicados.tipoServicio) &&
        (!filtrosAplicados.servicio || item.servicio.toLowerCase().includes(filtrosAplicados.servicio.toLowerCase())) &&
        (!filtrosAplicados.tipologia || item.tipologias.includes(filtrosAplicados.tipologia))
      );
    });
  }, [data, mostrarResultados, filtrosAplicados]);

  const handleGuardar = async () => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:3001/servicios/${currentItem.id}`
      : "http://localhost:3001/servicios";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentItem,
        servicio: currentItem.servicio?.toUpperCase()
      }),
    });
    setOpen(false);
    cargarTodo();
  };

  return (
    <Layout>
      <Paper elevation={0} sx={{ borderRadius: "4px", border: "1px solid #e0e0e0", overflow: "hidden", mb: 4, width: "100%", boxSizing: "border-box" }}>
        <Box sx={{ backgroundColor: "#00796b", color: "white", py: 2, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Gestión de Servicios
          </Typography>
        </Box>

        <Box sx={{ p: 4, backgroundColor: "white" }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: "4px", borderColor: "#e0e0e0" }}>
            <Typography variant="h6" sx={{ color: "#00796b", mb: 3, fontWeight: "bold" }}>
              Filtros de configuración de servicios
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={4}>
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={opcionesTipoServicio}
                  value={filtroTipoServicio}
                  onChange={(e, v) => setFiltroTipoServicio(v)}
                  renderInput={(params) => <TextField {...params} label="Tipo de Servicio" variant="standard" />}
                />
                <TextField
                  sx={{ flex: 2 }}
                  label="Nombre del Servicio"
                  variant="standard"
                  value={filtroServicio}
                  onChange={(e) => setFiltroServicio(e.target.value)}
                />
              </Stack>
              <Autocomplete
                options={opcionesTipologia}
                value={filtroTipologia}
                onChange={(e, v) => setFiltroTipologia(v)}
                renderInput={(params) => <TextField {...params} label="Aplica a Tipología" variant="standard" sx={{ maxWidth: "50%" }} />}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFiltroTipoServicio(null);
                    setFiltroServicio("");
                    setFiltroTipologia(null);
                    setFiltrosAplicados({});
                    setMostrarResultados(true);
                  }}
                  sx={{ color: "#00796b", borderColor: "#00796b", px: 4, fontWeight: "bold" }}
                >
                  LIMPIAR
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={() => {
                    setFiltrosAplicados({
                      tipoServicio: filtroTipoServicio,
                      servicio: filtroServicio,
                      tipologia: filtroTipologia
                    });
                    setMostrarResultados(true);
                  }}
                  sx={{ backgroundColor: "#00796b", "&:hover": { backgroundColor: "#005a4f" }, px: 4, fontWeight: "bold" }}
                >
                  CONSULTAR
                </Button>
              </Box>
            </Stack>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ color: "#00796b", fontWeight: "bold" }}>
              Servicios Existentes
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setCurrentItem({ tipoServicio: null, servicio: "", tipologias: [] });
                setIsEditing(false);
                setOpen(true);
              }}
              sx={{ backgroundColor: "#00796b", "&:hover": { backgroundColor: "#005a4f" }, fontWeight: "bold" }}
            >
              AGREGAR SERVICIO
            </Button>
          </Box>

          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ "& th": { backgroundColor: "white", borderBottom: "2px solid #00796b", color: "#00796b", fontWeight: "bold", py: 2 } }}>
                  <TableCell>TIPO DE SERVICIO</TableCell>
                  <TableCell>NOMBRE DEL SERVICIO</TableCell>
                  <TableCell>TIPOLOGÍAS APLICABLES</TableCell>
                  <TableCell align="center">ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataFiltrada.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell><Typography variant="body2" fontWeight="bold">{row.tipoServicio}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{row.servicio}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {row.tipologias && row.tipologias.map(t => (
                          <Chip key={t} label={t} size="small" variant="outlined" sx={{ color: "#00796b", borderColor: "#00796b" }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          onClick={() => {
                            setCurrentItem(row);
                            setIsEditing(true);
                            setOpen(true);
                          }}
                          sx={{ color: "#00796b" }} size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            if (window.confirm("¿Eliminar servicio?"))
                              fetch(`http://localhost:3001/servicios/${row.id}`, { method: "DELETE" }).then(() => cargarTodo());
                          }}
                          color="error" size="small"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {dataFiltrada.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 6, color: "rgba(0, 0, 0, 0.3)", fontWeight: "bold" }}>
                      NO SE ENCUENTRAN RESULTADOS PARA MOSTRAR
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={styleModal}>
          <Box sx={{ bgcolor: "#00796b", color: "white", p: 2, textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>{isEditing ? "EDITAR SERVICIO" : "NUEVO SERVICIO"}</Typography>
          </Box>
          <Box sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Autocomplete
                options={opcionesTipoServicio}
                value={currentItem.tipoServicio}
                onChange={(e, v) => setCurrentItem({ ...currentItem, tipoServicio: v })}
                renderInput={(params) => <TextField {...params} label="Tipo de Servicio *" variant="standard" fullWidth />}
              />
              <TextField
                label="Nombre del Servicio *"
                variant="standard"
                value={currentItem.servicio}
                onChange={(e) => setCurrentItem({ ...currentItem, servicio: e.target.value.toUpperCase() })}
              />
              <Autocomplete
                multiple
                options={opcionesTipologia}
                value={currentItem.tipologias || []}
                onChange={(e, v) => setCurrentItem({ ...currentItem, tipologias: v })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return <Chip key={key} variant="outlined" label={option} size="small" {...tagProps} />;
                  })
                }
                renderInput={(params) => <TextField {...params} variant="standard" label="Tipologías Aplicables" />}
              />
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 5 }}>
              <Button variant="contained" color="error" startIcon={<CancelIcon />} onClick={() => setOpen(false)}>CANCELAR</Button>
              <Button variant="contained" startIcon={<CheckIcon />} onClick={handleGuardar} sx={{ bgcolor: "#00796b" }}>
                {isEditing ? "ACTUALIZAR" : "AGREGAR"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Layout>
  );
};

export default ServiciosConfig;
