import React, { useState, useEffect, useMemo } from "react";
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
  CircularProgress,
  Modal,
  TextField,
  Stack,
  IconButton,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Autocomplete,
  Chip,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Edit as EditIcon } from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Cancel as CancelIcon } from "@mui/icons-material";
import { Check as CheckIcon } from "@mui/icons-material";
import { Search as SearchIcon } from "@mui/icons-material";
import Layout from "../ui/Layout";

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

const equiposSoloExistencia = [
  "CARRO DE PARO COMPLETO",
  "EQUIPO PARA NEBULIZACIONES",
  "MESA DE CATETERISMO CON PLANO DESLIZANTE",
  "TUBO DE RAYOS X",
  "BALANZA DE USO CLÍNICO",
  "COLCHÓN ANTIESCARAS DE CORRESPONDER",
  "ESTETOSCOPIO",
  "OXÍMETRO DE PULSO",
  "SILLÓN DE ONCOLOGÍA",
  "CAJA DE TRAQUEOTOMÍA",
  "CAMA O CAMILLA QUIRÚRGICA REGULABLE",
  "LARINGOSCOPIO Y TUBOS ENDOTRAQUEALES",
  "MESA DE CIRUGÍA TIPO \"MAYO\" O SIMILAR",
  "SISTEMA DE ASPIRACIÓN AUTOMÁTICA",
  "BALANZA PARA RECIÉN NACIDO",
  "CAMA DE PARTOS CON RUEDAS (GINECOLÓGICA/OBSTÉTRICA)",
  "MESA AUXILIAR",
  "MESA DE INSTRUMENTAL OBSTÉTRICO",
  "MESA PARA ANESTESISTA",
  "CARRO DE URGENCIA CON EQUIPOS DE INTUBACIÓN COMPLETO",
  "EQUIPO COMPLETO PARA INTUBACIÓN/SONDAJE/CANALIZACIÓN",
  "MARCAPASO TRANSITORIO CON 2 CATÉTERES",
  "RESPIRADOR MECÁNICO DE RESGUARDO",
  "SISTEMA PORTÁTIL DE ASPIRACIÓN PARA DRENAJE",
  "ASPIRACIÓN AUTOMÁTICA",
  "ASPIRADOR REGULABLE CON MANÓMETRO",
  "BALANZA ELECTRÓNICA",
  "BALANZA PARA PAÑALES",
  "COLCHÓN TÉRMICO NEONATAL",
  "CUNA",
  "ELECTROBISTURÍ",
  "EQUIPO DE REANIMACIÓN",
  "MESA CENTRAL",
  "PEDIÓMETRO",
  "RESPIRADOR AUTOMÁTICO NEONATAL",
  "RESPIRADOR NEONATAL SINCRONIZADO (SIMV/INV)",
  "TENSIÓMETRO NEONATAL (EFECTO DOPPLER)",
  "CARRO DE URGENCIA",
  "EQUIPO DE INTUBACIÓN TRAQUEAL",
  "MARCAPASO TRANSITORIO",
  "NEBULIZADOR",
  "OXÍMETRO DE PULSO PORTÁTIL",
  "RESPIRADOR MECÁNICO VOLUMÉTRICO CON PRESIÓN POSITIVA",
  "TENSIÓMETRO"
];

const checkSoloExistencia = (nombreEquipo) => {
  if (!nombreEquipo) return false;
  const normalize = (s) =>
    s.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\"\']/g, "");
  
  const normInput = normalize(nombreEquipo);
  return equiposSoloExistencia.some((eq) => {
    const normEq = normalize(eq);
    return normInput === normEq || normInput.includes(normEq) || normEq.includes(normInput);
  });
};

const EquipamientosConfig = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // OPCIONES PARA EL MULTISELECT DE TRAZABILIDAD
  const opcionesTrazabilidad = [
    { label: "SÓLO EXISTENCIA", value: "soloExistencia" },
    { label: "MARCA", value: "requiereMarca" },
    { label: "MODELO", value: "requiereModelo" },
    { label: "SERIE", value: "requiereSerie" },
  ];

  const opcionesRegla = ["UNICO", "LINEAL", "PROPORCIONAL"];

  // FILTROS
  const [filtroTipologia, setFiltroTipologia] = useState(null);
  const [filtroTipoOrigen, setFiltroTipoOrigen] = useState(null);
  const [filtroOrigen, setFiltroOrigen] = useState(null);
  const [filtroEquipamiento, setFiltroEquipamiento] = useState(null);
  const [filtroRegla, setFiltroRegla] = useState(null);
  const [serviciosMaster, setServiciosMaster] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(true);
  const [filtrosAplicados, setFiltrosAplicados] = useState({});

  const [currentItem, setCurrentItem] = useState({
    tipologia: "",
    origen: "",
    tipo: "",
    equipamiento: "",
    tipoRegla: "UNICO",
    base: 1,
    cantidadMinima: 1,
    requiereMarca: false,
    requiereModelo: false,
    requiereSerie: false,
    soloExistencia: false,
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resEq, resSrv] = await Promise.all([
        fetch("http://localhost:3001/equipamientos"),
        fetch("http://localhost:3001/configuraciones_maestras")
      ]);
      const jsonEq = await resEq.json();
      const jsonSrv = await resSrv.json();
      setData(Array.isArray(jsonEq) ? jsonEq : []);
      setServiciosMaster(Array.isArray(jsonSrv) ? jsonSrv : []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const dataFiltrada = useMemo(() => {
    if (!mostrarResultados) return [];
    return data.filter((item) => {
      return (
        (!filtrosAplicados.tipologia ||
          item.tipologia === filtrosAplicados.tipologia) &&
        (!filtrosAplicados.tipoOrigen ||
          item.tipo === filtrosAplicados.tipoOrigen) &&
        (!filtrosAplicados.origen || item.origen === filtrosAplicados.origen) &&
        (!filtrosAplicados.equipamiento ||
          item.equipamiento === filtrosAplicados.equipamiento) &&
        (!filtrosAplicados.regla || item.tipoRegla === filtrosAplicados.regla)
      );
    });
  }, [data, mostrarResultados, filtrosAplicados]);

  const formatTrazabilidad = (row) => {
    if (row.soloExistencia) return "SÓLO EXISTENCIA";
    const m1 = row.requiereMarca ? "M" : "-";
    const m2 = row.requiereModelo ? "M" : "-";
    const s = row.requiereSerie ? "S" : "-";
    return `${m1}/${m2}/${s}`;
  };

  const handleBorrar = async (id) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    try {
      await fetch(`http://localhost:3001/equipamientos/${id}`, {
        method: "DELETE",
      });
      cargarDatos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuardar = async () => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:3001/equipamientos/${currentItem.id}`
      : "http://localhost:3001/equipamientos";

    const finalPayload = {
      ...currentItem,
      tipologia: currentItem.tipologia?.trim().toUpperCase(),
      tipo: currentItem.tipo?.trim().toUpperCase(),
      origen: currentItem.origen?.trim().toUpperCase(),
      equipamiento: currentItem.equipamiento?.trim().toUpperCase(),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });
      if (response.ok) {
        setOpen(false);
        cargarDatos();
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // LOGICA DEL MULTISELECT
  const handleTrazabilidadChange = (event, newValue) => {
    const lastSelected =
      newValue.length > 0 ? newValue[newValue.length - 1].value : null;

    let update = {
      soloExistencia: false,
      requiereMarca: false,
      requiereModelo: false,
      requiereSerie: false,
    };

    if (lastSelected === "soloExistencia") {
      update.soloExistencia = true;
    } else {
      newValue.forEach((item) => {
        if (item.value !== "soloExistencia") {
          update[item.value] = true;
        }
      });
    }
    setCurrentItem({ ...currentItem, ...update });
  };

  const getSelectedTrazabilidad = () => {
    const selected = [];
    if (currentItem.soloExistencia) selected.push(opcionesTrazabilidad[0]);
    if (currentItem.requiereMarca) selected.push(opcionesTrazabilidad[1]);
    if (currentItem.requiereModelo) selected.push(opcionesTrazabilidad[2]);
    if (currentItem.requiereSerie) selected.push(opcionesTrazabilidad[3]);
    return selected;
  };

  return (
    <Layout>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "4px",
          border: "1px solid #e0e0e0",
          mb: 4,
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#005596",
            color: "white",
            py: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Gestión de Equipamientos
          </Typography>
        </Box>

        <Box sx={{ p: 4, bgcolor: "white" }}>
          <Paper
            variant="outlined"
            sx={{ p: 3, mb: 4, borderRadius: "4px", borderColor: "#e0e0e0" }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#0090d0", mb: 4, fontWeight: "bold" }}
            >
              Filtros de configuración de equipamiento
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", gap: 4, width: "100%" }}>
                <Box sx={{ flex: "1 1 50%" }}>
                  <Autocomplete
                    options={[...new Set((serviciosMaster || []).map((i) => i.tipologia))]
                      .filter(Boolean)
                      .sort()}
                    value={filtroTipologia}
                    onChange={(e, v) => {
                      setFiltroTipologia(v);
                      setFiltroOrigen(null);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipología"
                        variant="standard"
                        sx={{ maxWidth: "100%" }}
                      />
                    )}
                  />
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 4, width: "100%" }}>
                <Box sx={{ flex: "1 1 50%" }}>
                  <Autocomplete
                    options={["SERVICIO", "SALA", "CAMA", "OTRO"]}
                    value={filtroTipoOrigen}
                    onChange={(e, v) => setFiltroTipoOrigen(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo de Origen"
                        variant="standard"
                        fullWidth
                      />
                    )}
                  />
                </Box>
                <Box sx={{ flex: "1 1 50%" }}>
                  <Autocomplete
                    options={[...new Set(
                      (serviciosMaster || [])
                        .filter(s => !filtroTipologia || s.tipologia === filtroTipologia)
                        .flatMap(s => s.servicios || [])
                        .flatMap(s => [s.name, ...(s.sections?.map(sec => sec.name) || [])])
                    )].filter(Boolean).sort()}
                    value={filtroOrigen}
                    onChange={(e, v) => setFiltroOrigen(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Origen"
                        variant="standard"
                        fullWidth
                      />
                    )}
                  />
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 4, width: "100%" }}>
                <Box sx={{ flex: "1 1 50%" }}>
                  <Autocomplete
                    options={[...new Set(data.map((i) => i.equipamiento))]
                      .filter(Boolean)
                      .sort()}
                    value={filtroEquipamiento}
                    onChange={(e, v) => setFiltroEquipamiento(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo de Equipo"
                        variant="standard"
                        fullWidth
                      />
                    )}
                  />
                </Box>
                <Box sx={{ flex: "1 1 50%" }}>
                  <Autocomplete
                    options={opcionesRegla}
                    value={filtroRegla}
                    onChange={(e, v) => setFiltroRegla(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Regla"
                        variant="standard"
                        fullWidth
                      />
                    )}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                  width: "100%",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFiltroTipologia(null);
                    setFiltroTipoOrigen(null);
                    setFiltroOrigen(null);
                    setFiltroEquipamiento(null);
                    setFiltroRegla(null);
                    setFiltrosAplicados({});
                    setMostrarResultados(true);
                  }}
                  sx={{
                    color: "#29b6f6",
                    borderColor: "#29b6f6",
                    px: 5,
                    fontWeight: "bold",
                  }}
                >
                  LIMPIAR
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={() => {
                    setFiltrosAplicados({
                      tipologia: filtroTipologia,
                      tipoOrigen: filtroTipoOrigen,
                      origen: filtroOrigen,
                      equipamiento: filtroEquipamiento,
                      regla: filtroRegla,
                    });
                    setMostrarResultados(true);
                  }}
                  sx={{ backgroundColor: "#29b6f6", px: 5, fontWeight: "bold" }}
                >
                  CONSULTAR
                </Button>
              </Box>
            </Box>
          </Paper>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#0090d0", fontWeight: "bold" }}
            >
              EQUIPOS
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ bgcolor: "#29b6f6", fontWeight: "bold" }}
              onClick={() => {
                setCurrentItem({
                  tipologia: "",
                  origen: "",
                  tipo: "",
                  equipamiento: "",
                  tipoRegla: "UNICO",
                  base: 1,
                  cantidadMinima: 1,
                  requiereMarca: false,
                  requiereModelo: false,
                  requiereSerie: false,
                  soloExistencia: false,
                });
                setIsEditing(false);
                setOpen(true);
              }}
            >
              {" "}
              NUEVO EQUIPO{" "}
            </Button>
          </Box>

          <TableContainer
            sx={{ border: "1px solid #eee", borderRadius: "4px" }}
          >
            <Table size="small" stickyHeader>
              {dataFiltrada.length > 0 && (
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        backgroundColor: "white",
                        borderBottom: "2px solid #005596",
                        color: "#005596",
                        fontWeight: "bold",
                        py: 2,
                      },
                    }}
                  >
                    <TableCell>TIPOLOGÍA</TableCell>
                    <TableCell>ORIGEN</TableCell>
                    <TableCell>TIPO DE EQUIPO</TableCell>
                    <TableCell align="center">REGLA</TableCell>
                    <TableCell align="center">MÍNIMO</TableCell>
                    <TableCell align="center">TRAZABILIDAD</TableCell>
                    <TableCell align="center">ACCIONES</TableCell>
                  </TableRow>
                </TableHead>
              )}
              <TableBody>
                {dataFiltrada.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontSize: "0.75rem", color: "#666" }}>
                      {row.tipologia || "-"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {row.origen}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {row.tipo}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.equipamiento}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.tipoRegla}
                        size="small"
                        sx={{
                          fontSize: "0.65rem",
                          fontWeight: "bold",
                          bgcolor: "#e3f2fd",
                          color: "#005596",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">{row.cantidadMinima}</TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: row.soloExistencia ? "#2e7d32" : "#666",
                      }}
                    >
                      {formatTrazabilidad(row)}
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                      >
                        <IconButton
                          onClick={() => {
                            setIsEditing(true);
                            setCurrentItem(row);
                            setOpen(true);
                          }}
                          color="primary"
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleBorrar(row.id)}
                          color="error"
                          size="small"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {dataFiltrada.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      sx={{
                        textAlign: "center",
                        py: 6,
                        color: "rgba(0, 0, 0, 0.3)",
                        fontWeight: "bold",
                      }}
                    >
                      NO SE ENCUENTRAN RESULTADOS PARA MOSTRAR
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={styleModal}>
          <Box
            sx={{
              bgcolor: "#005596",
              color: "white",
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {isEditing ? "EDITAR EQUIPO" : "NUEVO EQUIPO"}
            </Typography>
          </Box>
          <Box sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              <Autocomplete
                freeSolo
                forcePopupIcon
                options={[...new Set((serviciosMaster || []).map((i) => i.tipologia))]
                  .filter(Boolean)
                  .sort()}
                value={currentItem.tipologia || ""}
                onChange={(e, newValue) =>
                  setCurrentItem({ ...currentItem, tipologia: newValue || "" })
                }
                onInputChange={(e, newInputValue) =>
                  setCurrentItem({
                    ...currentItem,
                    tipologia: newInputValue || "",
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipología"
                    variant="standard"
                    fullWidth
                    required
                  />
                )}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ flex: "1 1 50%" }}>
                  <Autocomplete
                    freeSolo
                    forcePopupIcon
                    disabled={!currentItem.tipologia}
                    options={["SERVICIO", "SALA", "CAMA", "OTRO"]}
                    value={currentItem.tipo || ""}
                    onChange={(e, newValue) =>
                      setCurrentItem({ ...currentItem, tipo: newValue || "" })
                    }
                    onInputChange={(e, newInputValue) =>
                      setCurrentItem({ ...currentItem, tipo: newInputValue || "" })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo de Origen"
                        variant="standard"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Box>
                <Box sx={{ flex: "1 1 50%" }}>
                  <Autocomplete
                    freeSolo
                    forcePopupIcon
                    disabled={!currentItem.tipologia}
                    options={[...new Set(
                      (serviciosMaster || [])
                        .filter(s => !currentItem.tipologia || s.tipologia === currentItem.tipologia)
                        .flatMap(s => s.servicios || [])
                        .flatMap(s => [s.name, ...(s.sections?.map(sec => sec.name) || [])])
                    )].filter(Boolean).sort()}
                    value={currentItem.origen || ""}
                    onChange={(e, newValue) =>
                      setCurrentItem({ ...currentItem, origen: newValue || "" })
                    }
                    onInputChange={(e, newInputValue) =>
                      setCurrentItem({ ...currentItem, origen: newInputValue || "" })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Origen"
                        variant="standard"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Box>
              </Box>
              <Autocomplete
                freeSolo
                forcePopupIcon
                disabled={!currentItem.tipologia}
                options={[...new Set(data.map((i) => i.equipamiento))]
                  .filter(Boolean)
                  .sort()}
                value={currentItem.equipamiento || ""}
                onChange={(e, newValue) => {
                  const val = newValue || "";
                  const esSoloExistencia = checkSoloExistencia(val);
                  setCurrentItem({
                    ...currentItem,
                    equipamiento: val,
                    ...(esSoloExistencia
                      ? {
                          requiereMarca: false,
                          requiereModelo: false,
                          requiereSerie: false,
                          soloExistencia: true,
                        }
                      : {}),
                  });
                }}
                onInputChange={(e, newInputValue) => {
                  const val = newInputValue || "";
                  const esSoloExistencia = checkSoloExistencia(val);
                  setCurrentItem({
                    ...currentItem,
                    equipamiento: val,
                    ...(esSoloExistencia
                      ? {
                          requiereMarca: false,
                          requiereModelo: false,
                          requiereSerie: false,
                          soloExistencia: true,
                        }
                      : {}),
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo de Equipo"
                    variant="standard"
                    fullWidth
                  />
                )}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <Autocomplete
                  disabled={!currentItem.tipologia}
                  options={opcionesRegla}
                  value={currentItem.tipoRegla || "UNICO"}
                  onChange={(e, newValue) =>
                    setCurrentItem({
                      ...currentItem,
                      tipoRegla: newValue || "UNICO",
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Regla"
                      variant="standard"
                      fullWidth
                    />
                  )}
                  sx={{ flexGrow: 1 }}
                />
                {currentItem.tipoRegla === "PROPORCIONAL" && (
                  <TextField
                    disabled={!currentItem.tipologia}
                    label="Base"
                    type="number"
                    variant="standard"
                    sx={{ width: 100 }}
                    value={currentItem.base}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, base: e.target.value })
                    }
                  />
                )}
                <TextField
                  disabled={!currentItem.tipologia}
                  label="Mínimo"
                  type="number"
                  variant="standard"
                  sx={{ width: 100 }}
                  value={currentItem.cantidadMinima}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      cantidadMinima: e.target.value,
                    })
                  }
                />
              </Box>

              <Box sx={{ mt: 1 }}>
                <Autocomplete
                  disabled={!currentItem.tipologia}
                  multiple
                  options={opcionesTrazabilidad}
                  getOptionLabel={(option) => option.label}
                  value={getSelectedTrazabilidad()}
                  onChange={handleTrazabilidadChange}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  disableCloseOnSelect
                  /* Renderizamos el valor seleccionado como un String simple separado por comas */
                  renderTags={(tagValue) => tagValue.map((option) => option.label).join(", ")}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <Checkbox
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.label}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Configuración de Trazabilidad"
                      placeholder={getSelectedTrazabilidad().length === 0 ? "Seleccione..." : ""}
                      sx={{
                        "& .MuiInputBase-root": {
                          fontSize: "0.9rem",
                          py: 1
                        }
                      }}
                    />
                  )}
                />
              </Box>
            </Stack>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}
            >
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setOpen(false)}
              >
                CANCELAR
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={handleGuardar}
                sx={{ bgcolor: "#005596" }}
              >
                {isEditing ? "ACTUALIZAR" : "GUARDAR"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Layout>
  );
};

export default EquipamientosConfig;
