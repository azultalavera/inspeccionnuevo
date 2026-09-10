import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Stack,
  Autocomplete,
  Divider,
  Chip,
  Checkbox,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { TIPOS_EQUIPOS_DATABASE } from "../../../data/tiposEquiposData";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  PlaylistAdd as PlaylistAddIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutlineOutlined as ErrorOutlineIcon,
  Check as CheckIcon,
  PriorityHigh as PriorityHighIcon,
  Cancel as CancelIcon,
  ContentPasteOffOutlined as ContentPasteOffIcon,
  AssignmentTurnedInOutlined as AssignmentTurnedInIcon,
} from "@mui/icons-material";

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: "620px", md: "720px" },
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  overflowY: "auto",
};

const initialFormValues = {
  id: null,
  subId: null,
  origen: "",
  equipamiento: "",
  otroEquipo: "",
  marca: "",
  modelo: "",
  serie: "",
  condicion: "Propio",
  numeroPM: "",
  movilidad: "Fijo",
  usoEquipo: "Facial",
  anoFabricacion: "",
  tesla: "",
  tensionMax: "",
  corrienteMax: "",
  potencia: "",
  energia: "",
  fluencia: "",
  longitudOnda: "",
  cantidadFuentes: "1",
  tipoRevelado: "Digital DR",
  soloExistencia: false,
};

const EquipamientosLabV3 = ({
  selectedServices = {},
  infraSelection = {},
  equiposCargados = [],
  setEquiposCargados,
  onValidationChange,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [isExtraMode, setIsExtraMode] = useState(false);
  const [requisitosDB, setRequisitosDB] = useState([]);
  const [todosLosEquiposDB, setTodosLosEquiposDB] = useState([]);
  const [todosLosEquiposFullDB, setTodosLosEquiposFullDB] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedRevision, setExpandedRevision] = useState({});

  const [form, setForm] = useState(initialFormValues);

  const serviceNames = useMemo(() => {
    const servicios = Object.keys(selectedServices).filter(
      (k) => !!selectedServices[k],
    );
    const infra = Object.keys(infraSelection).filter(
      (k) => !!infraSelection[k],
    );
    return [...new Set([...servicios, ...infra])];
  }, [selectedServices, infraSelection]);

  // Lista de equipos para el modal (filtra los que ya son requeridos en el origen actual)
  const listaEquiposDisponiblesExtra = useMemo(() => {
    const origenActual = serviceNames[activeIdx] || "";
    const requeridosNombres = requisitosDB
      .filter((r) => r.origen === origenActual)
      .map((r) => r.equipamiento);

    const nombresRadiofisica = TIPOS_EQUIPOS_DATABASE.map((t) => t.nombre);

    const combinados = [...new Set([...nombresRadiofisica, ...todosLosEquiposDB])];

    return combinados
      .filter((nome) => !requeridosNombres.includes(nome))
      .concat("OTRO");
  }, [requisitosDB, todosLosEquiposDB, activeIdx, serviceNames]);

  useEffect(() => {
    const fetchEquipamientos = async () => {
      try {
        const res = await fetch("http://localhost:3001/equipamientos");
        const data = await res.json();

        const nombresTotales = [
          ...new Set(data.map((item) => item.equipamiento)),
        ];
        setTodosLosEquiposDB(nombresTotales);
        setTodosLosEquiposFullDB(data);

        const limpiar = (t) =>
          t
            ? t
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
            : "";

        const calculados = data
          .filter((eq) =>
            serviceNames.some((s) => limpiar(s) === limpiar(eq.origen)),
          )
          .map((eq) => {
            const cantidadInfra = parseInt(infraSelection[eq.origen]) || 1;
            let totalNecesario = 0;
            if (eq.tipoRegla === "PROPORCIONAL") {
              totalNecesario =
                Math.ceil(cantidadInfra / eq.base) * eq.cantidadMinima;
            } else if (eq.tipoRegla === "LINEAL") {
              totalNecesario = cantidadInfra * eq.cantidadMinima;
            } else {
              totalNecesario = eq.cantidadMinima || 1;
            }
            return { ...eq, cantidadFinalCalculada: totalNecesario };
          });
        setRequisitosDB(calculados);
      } catch (err) {
        console.error(err);
      }
    };
    if (serviceNames.length > 0) fetchEquipamientos();
  }, [serviceNames, infraSelection]);

  const datosRevisionPorOrigen = useMemo(() => {
    const agrupado = {};
    serviceNames.forEach((origen) => {
      const requisitosDeEsteOrigen = requisitosDB.filter(
        (r) => r.origen === origen,
      );
      const items = requisitosDeEsteOrigen.map((req) => {
        const actual = equiposCargados.filter(
          (c) =>
            (c.id === req.id ||
              (c.isExtra &&
                c.equipamiento === req.equipamiento &&
                c.origen === req.origen)) &&
            c.marca?.trim() !== "",
        ).length;
        return {
          nombre: req.equipamiento,
          actual,
          total: req.cantidadFinalCalculada,
          completo: actual >= req.cantidadFinalCalculada,
        };
      });
      agrupado[origen] = items.sort((a, b) =>
        a.completo === b.completo ? 0 : a.completo ? 1 : -1,
      );
    });
    return agrupado;
  }, [requisitosDB, equiposCargados, serviceNames]);

  useEffect(() => {
    const todosLosOrigenes = Object.values(datosRevisionPorOrigen).flat();
    const todoOk =
      todosLosOrigenes.length > 0 && todosLosOrigenes.every((i) => i.completo);
    onValidationChange(todoOk);
  }, [datosRevisionPorOrigen, onValidationChange]);

  const handleOpenForm = (req, subIndex, esExtra = false) => {
    const isNewRequest = !req;
    const targetOrigen = serviceNames[activeIdx] || "";

    setForm({
      id: isNewRequest ? `extra-${Date.now()}` : req.id,
      subId: subIndex,
      origen: isNewRequest ? targetOrigen : req.origen,
      equipamiento: isNewRequest ? "" : req.equipamiento,
      otroEquipo: "",
      marca: req?.marca || "",
      modelo: req?.modelo || "",
      serie: req?.serie || "",
      condicion: req?.condicion || "Propio",
      numeroPM: req?.numeroPM || "",
      movilidad: req?.movilidad || "Fijo",
      usoEquipo: req?.usoEquipo || "Facial",
      anoFabricacion: req?.anoFabricacion || "",
      tesla: req?.tesla || "",
      tensionMax: req?.tensionMax || "",
      corrienteMax: req?.corrienteMax || "",
      potencia: req?.potencia || "",
      energia: req?.energia || "",
      fluencia: req?.fluencia || "",
      longitudOnda: req?.longitudOnda || "",
      cantidadFuentes: req?.cantidadFuentes || "1",
      tipoRevelado: req?.tipoRevelado || "Digital DR",
      soloExistencia: !!req?.soloExistencia,
    });
    setIsExtraMode(esExtra || isNewRequest);
    setOpenModal(true);
  };

  const addOneExistencia = (req, subIndex) => {
    setEquiposCargados((prev) => [
      ...prev,
      {
        id: req.id,
        subId: subIndex,
        origen: req.origen,
        equipamiento: req.equipamiento,
        marca: "SÓLO EXISTENCIA",
        modelo: "-",
        serie: "-",
        isExtra: false,
      },
    ]);
  };

  const handleDirectConfirm = (req, subIndex) => {
    addOneExistencia(req, subIndex);
  };

  const removeOneExistencia = (req) => {
    setEquiposCargados((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].id === req.id && copy[i].origen === req.origen) {
          copy.splice(i, 1);
          return copy;
        }
      }
      return prev;
    });
  };

  const handleSave = () => {
    const finalEquipamiento =
      form.equipamiento === "OTRO" ? form.otroEquipo : form.equipamiento;

    if (!finalEquipamiento) {
      alert("Debe indicar el nombre del equipo");
      return;
    }

    const config = TIPOS_EQUIPOS_DATABASE.find(
      (t) => t.nombre.toUpperCase() === finalEquipamiento.toUpperCase()
    )?.booleanos;

    if (config) {
      if (config.unidad && !form.unidad?.trim()) {
        alert("La Unidad es obligatoria para este elemento");
        return;
      }
      if (config.cargaMarca && !form.marca?.trim()) {
        alert("La Marca es obligatoria para este tipo de equipo");
        return;
      }
      if (config.antiguedad && !form.antiguedad) {
        alert("La Antigüedad es obligatoria para este elemento");
        return;
      }
      if (config.cantidad && (!form.cantidad || Number(form.cantidad) <= 0)) {
        alert("La Cantidad es obligatoria y debe ser mayor a 0");
        return;
      }
      if (config.cargaModelo && !form.modelo?.trim()) {
        alert("El Modelo es obligatorio para este tipo de equipo");
        return;
      }
      if (config.cargaSerie && !form.serie?.trim()) {
        alert("El Número de Serie es obligatorio para este tipo de equipo");
        return;
      }
      if (config.condicion && !form.condicion) {
        alert("La Condición es obligatoria");
        return;
      }
      if (config.movilidad && !form.movilidad) {
        alert("La Movilidad es obligatoria");
        return;
      }
      if (config.usoEquipo && !form.usoEquipo) {
        alert("El Uso del equipo es obligatorio");
        return;
      }
      if (config.anoFabricacion && (!form.anoFabricacion || form.anoFabricacion.toString().length !== 4)) {
        alert("El Año de fabricación debe ser un número de 4 dígitos");
        return;
      }
      if (config.tipoRevelado && !form.tipoRevelado) {
        alert("El Tipo de revelado es obligatorio");
        return;
      }

      const numFields = [
        { key: "tesla", label: "Tesla" },
        { key: "tensionMax", label: "Tensión Max (kV)" },
        { key: "corrienteMax", label: "Corriente Max (mA)" },
        { key: "potencia", label: "Potencia (Watt)" },
        { key: "energia", label: "Energía (Joule)" },
        { key: "fluencia", label: "Fluencia (Joule/cm2)" },
        { key: "longitudOnda", label: "Longitud de onda (nm)" },
        { key: "cantidadFuentes", label: "Cantidad de fuentes" },
      ];

      for (const f of numFields) {
        if (config[f.key]) {
          const val = Number(form[f.key]);
          if (!form[f.key] || isNaN(val) || val <= 0 || form[f.key].toString().length > 6) {
            alert(`${f.label} es obligatorio, debe ser un valor numérico mayor a 0 y de hasta 6 dígitos`);
            return;
          }
        }
      }
    } else {
      if (
        !form.soloExistencia &&
        !form.marca &&
        !form.modelo &&
        !form.serie
      ) {
        alert(
          "Debe completar al menos un dato técnico (Marca, Modelo o Serie) o marcar 'Sólo existencia'",
        );
        return;
      }
    }

    setEquiposCargados((prev) => {
      const sinEste = prev.filter(
        (c) => !(c.id === form.id && c.subId === form.subId),
      );
      return [
        ...sinEste,
        {
          ...form,
          equipamiento: finalEquipamiento,
          marca: form.soloExistencia ? "SÓLO EXISTENCIA" : form.marca,
          modelo: form.soloExistencia ? "-" : form.modelo,
          serie: form.soloExistencia ? "-" : form.serie,
          isExtra: isExtraMode,
        },
      ];
    });
    setOpenModal(false);
    setForm(initialFormValues);
  };

  const handleLimpiarFila = (id, subId) => {
    setEquiposCargados((prev) =>
      prev.map((c) =>
        c.id === id && c.subId === subId
          ? { ...c, marca: "", modelo: "", serie: "" }
          : c,
      ),
    );
  };

  const itemsAMostrar = useMemo(() => {
    const origenSel = serviceNames[activeIdx];
    const obligatorios = requisitosDB.filter((r) => r.origen === origenSel);
    const extrasCargados = equiposCargados.filter(
      (c) =>
        c.origen === origenSel &&
        c.isExtra &&
        !obligatorios.some((ob) => ob.equipamiento === c.equipamiento),
    );
    const extrasAgrupados = extrasCargados.reduce((acc, curr) => {
      if (!acc[curr.equipamiento]) {
        const fullInfo = todosLosEquiposFullDB.find(
          (eq) => eq.equipamiento === curr.equipamiento,
        );
        acc[curr.equipamiento] = {
          id: curr.id,
          equipamiento: curr.equipamiento,
          cantidadFinalCalculada: 0,
          isExtra: true,
          origen: origenSel,
          soloExistencia: curr.soloExistencia || fullInfo?.soloExistencia || false,
        };
      }
      return acc;
    }, {});
    const combined = [...obligatorios, ...Object.values(extrasAgrupados)];
    return combined.sort((a, b) => {
      // 1. Requeridos primero, Extras al último
      if (!a.isExtra && b.isExtra) return -1;
      if (a.isExtra && !b.isExtra) return 1;

      // 2. SoloExistencia: true primero
      if (a.soloExistencia && !b.soloExistencia) return -1;
      if (!a.soloExistencia && b.soloExistencia) return 1;

      // 3. Empate: alfabético
      return a.equipamiento.localeCompare(b.equipamiento);
    });
  }, [requisitosDB, serviceNames, activeIdx, equiposCargados]);

  return (
    <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", color: "#25ade6", mb: 1 }}
      >
        EQUIPAMIENTOS
      </Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        {/* PANEL LATERAL ORIGENES */}
        <Paper
          variant="outlined"
          sx={{
            width: 350,
            height: "58vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              bgcolor: "#00386f",
              color: "white",
              p: 1,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ORIGENES
          </Box>
          <List dense sx={{ flex: 1, overflow: "auto" }}>
            {serviceNames.map((s, i) => {
              const items = datosRevisionPorOrigen[s] || [];
              const isCompleto =
                items.length === 0 || items.every((req) => req.completo);

              return (
                <ListItemButton
                  key={s}
                  selected={activeIdx === i}
                  onClick={() => setActiveIdx(i)}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "#e3f2fd",
                      color: "#005596",
                    },
                  }}
                >
                  <ListItemText
                    primary={infraSelection[s] > 0 ? `${s} (x${infraSelection[s]})` : s}
                    primaryTypographyProps={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    label={isCompleto ? "COMPLETO" : "INCOMPLETO"}
                    variant="outlined"
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: "0.65rem",
                      fontWeight: "bold",
                      borderRadius: "12px",
                      color: isCompleto ? "#4caf50" : "#ef5350",
                      borderColor: isCompleto ? "#4caf50" : "#ef5350",
                      bgcolor: "transparent",
                      ml: 1
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>

        {/* TABLA CENTRAL */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            flex: 1,
            height: "58vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    bgcolor: "#00386f",
                    color: "white",
                    fontWeight: "bold",
                  },
                }}
              >
                <TableCell>EQUIPOS</TableCell>
                <TableCell align="center">
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    py: 0.5,
                    borderRadius: 1
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>CANTIDAD</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">REQUERIDO</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {itemsAMostrar.map((req, idx) => {
                const prev = itemsAMostrar[idx - 1];
                const isFirstOfMainGroup = !prev || prev.isExtra !== req.isExtra;
                const isFirstOfSubGroup =
                  isFirstOfMainGroup || prev.soloExistencia !== req.soloExistencia;

                const mainTitle = req.isExtra
                  ? "EQUIPOS EXTRA"
                  : "EQUIPOS REQUERIDOS";
                const subTitle = req.soloExistencia
                  ? "Sólo existencia"
                  : "MARCA/MODELO/SERIE";

                const cargadosEnEste = equiposCargados.filter(
                  (c) =>
                    (c.id === req.id ||
                      (c.isExtra && c.equipamiento === req.equipamiento)) &&
                    c.origen === serviceNames[activeIdx],
                );
                const actualCount = cargadosEnEste.length;
                const isComplete =
                  actualCount >= (req.cantidadFinalCalculada || 0);

                return (
                  <React.Fragment key={req.id}>
                    {isFirstOfMainGroup && (
                      <TableRow sx={{ bgcolor: "#F1F5F9" }}>
                        <TableCell colSpan={4} sx={{ py: 1.5, px: 2 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: "900",
                              color: "#005596",
                              fontSize: "0.9rem",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {mainTitle}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {isFirstOfSubGroup && (
                      <TableRow sx={{ bgcolor: "transparent" }}>
                        <TableCell
                          colSpan={4}
                          sx={{
                            py: 0.5,
                            px: 3,
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <Typography
                            variant="overline"
                            sx={{
                              fontWeight: "700",
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              fontSize: "0.7rem",
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 2,
                                bgcolor: "#94a3b8",
                                borderRadius: 1,
                              }}
                            />
                            {subTitle}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow
                      hover={!req.soloExistencia}
                      onClick={() => {
                        if (!req.soloExistencia) {
                          setExpandedRow(expandedRow === req.id ? null : req.id);
                        }
                      }}
                      sx={{ cursor: req.soloExistencia ? "default" : "pointer" }}
                    >
                      <TableCell sx={{ fontWeight: 700 }}>
                        {req.equipamiento}{" "}
                        {req.isExtra && (
                          <Chip
                            label="EXTRA"
                            size="small"
                            variant="outlined"
                            sx={{
                              ml: 1,
                              height: 18,
                              fontSize: "0.65rem",
                              color: "#0B85C4",
                              borderColor: "#0B85C4",
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {req.soloExistencia ? (
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              border: `1px solid ${actualCount > 0 ? "#005596" : "#ccc"}`,
                              borderRadius: "4px",
                              height: "28px",
                              bgcolor: "white",
                              overflow: "hidden"
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeOneExistencia(req);
                              }}
                              disabled={actualCount === 0}
                              sx={{
                                borderRadius: 0,
                                p: 0,
                                width: 28,
                                height: 28,
                                borderRight: "1px solid #ccc"
                              }}
                            >
                              <RemoveIcon fontSize="inherit" />
                            </IconButton>
                            <Typography
                              sx={{
                                width: "30px",
                                textAlign: "center",
                                fontSize: "0.75rem",
                                fontWeight: actualCount > 0 ? "bold" : "normal",
                                color: actualCount > 0 ? "#005596" : "inherit"
                              }}
                            >
                              {actualCount}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                addOneExistencia(req, actualCount);
                              }}
                              sx={{
                                borderRadius: 0,
                                p: 0,
                                width: 28,
                                height: 28,
                                borderLeft: "1px solid #ccc"
                              }}
                            >
                              <AddIcon fontSize="inherit" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "28px",
                              width: "30px",
                              fontSize: "0.75rem",
                              fontWeight: actualCount > 0 ? "bold" : "normal",
                              color: "#000"
                            }}
                          >
                            {actualCount}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          sx={{ fontWeight: "regular", fontSize: "0.85rem", color: "#000000ff" }}
                        >
                          {req.isExtra ? "-" : (req.cantidadFinalCalculada || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {!req.soloExistencia && (
                          <IconButton size="small">
                            {expandedRow === req.id ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                    {!req.soloExistencia && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ p: 0 }}>
                          <Collapse in={expandedRow === req.id}>
                            <Box sx={{ p: 2, bgcolor: "#ffffffff" }}>
                              <Table
                                size="small"
                                sx={{
                                  bgcolor: "white",
                                  border: "1px solid #cbd5e1",
                                }}
                              >
                                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                  <TableRow
                                    sx={{
                                      "& th": {
                                        fontWeight: "bold",
                                        fontSize: "0.65rem",
                                        color: "#64748b",
                                      },
                                    }}
                                  >
                                    <TableCell sx={{ width: 140 }}>
                                      UNIDAD
                                    </TableCell>
                                    <TableCell>MARCA</TableCell>
                                    <TableCell>MODELO</TableCell>
                                    <TableCell>SERIE</TableCell>
                                    <TableCell align="center">
                                      ACCIONES
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {cargadosEnEste.map((unit, uIdx) => (
                                    <TableRow
                                      key={uIdx}
                                      sx={{ bgcolor: "#ffffffff" }}
                                    >
                                      <TableCell
                                        size="small"
                                        sx={{
                                          fontSize: "0.75rem",
                                          fontWeight: 600,
                                        }}
                                      >
                                        #{uIdx + 1}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: "0.75rem" }}>
                                        {unit.marca}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: "0.75rem" }}>
                                        {unit.modelo}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: "0.75rem" }}>
                                        {unit.serie}
                                      </TableCell>
                                      <TableCell align="center">
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          justifyContent="center"
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              handleOpenForm(
                                                unit,
                                                unit.subId,
                                                unit.isExtra,
                                              )
                                            }
                                            disabled={req.soloExistencia}
                                          >
                                            <EditIcon
                                              fontSize="inherit"
                                              color={
                                                req.soloExistencia
                                                  ? "disabled"
                                                  : "primary"
                                              }
                                            />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              unit.isExtra
                                                ? setEquiposCargados((prev) =>
                                                  prev.filter(
                                                    (c) =>
                                                      !(
                                                        c.id === unit.id &&
                                                        c.subId === unit.subId
                                                      ),
                                                  ),
                                                )
                                                : handleLimpiarFila(
                                                  unit.id,
                                                  unit.subId,
                                                )
                                            }
                                          >
                                            {unit.isExtra ? (
                                              <CloseIcon
                                                fontSize="small"
                                                sx={{ color: "#d32f2f" }}
                                              />
                                            ) : (
                                              <DeleteIcon
                                                fontSize="small"
                                                color="action"
                                              />
                                            )}
                                          </IconButton>
                                        </Stack>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {!req.isExtra &&
                                    actualCount <
                                    req.cantidadFinalCalculada && (
                                      <TableRow>
                                        <TableCell
                                          sx={{
                                            fontStyle: "italic",
                                            color: "#b0b0b0ff",
                                            fontSize: "0.75rem",
                                          }}
                                        >
                                          Pendiente de carga
                                        </TableCell>
                                        <TableCell colSpan={3} />
                                        <TableCell align="center">
                                          {req.soloExistencia ? (
                                            <Stack
                                              direction="row"
                                              spacing={1}
                                              justifyContent="center"
                                            >
                                              <Button
                                                variant="contained"
                                                size="small"
                                                color="success"
                                                onClick={() =>
                                                  handleDirectConfirm(
                                                    req,
                                                    actualCount,
                                                  )
                                                }
                                                sx={{
                                                  fontSize: "0.65rem",
                                                  fontWeight: "bold",
                                                }}
                                              >
                                                CONFIRMAR 1
                                              </Button>
                                              {req.cantidadFinalCalculada -
                                                actualCount >
                                                1 && (
                                                  <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="success"
                                                    onClick={() => {
                                                      const faltantes =
                                                        req.cantidadFinalCalculada -
                                                        actualCount;
                                                      const nuevos = Array.from({
                                                        length: faltantes,
                                                      }).map((_, i) => ({
                                                        id: req.id,
                                                        subId: actualCount + i,
                                                        origen: req.origen,
                                                        equipamiento:
                                                          req.equipamiento,
                                                        marca: "SÓLO EXISTENCIA",
                                                        modelo: "-",
                                                        serie: "-",
                                                        isExtra: false,
                                                      }));
                                                      setEquiposCargados(
                                                        (prev) => [
                                                          ...prev,
                                                          ...nuevos,
                                                        ],
                                                      );
                                                    }}
                                                    sx={{
                                                      fontSize: "0.65rem",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    CONFIRMAR FALTANTES (
                                                    {req.cantidadFinalCalculada -
                                                      actualCount}
                                                    )
                                                  </Button>
                                                )}
                                            </Stack>
                                          ) : (
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                handleOpenForm(
                                                  req,
                                                  actualCount,
                                                  false,
                                                )
                                              }
                                            >
                                              <AddIcon color="error" />
                                            </IconButton>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  {isComplete && !req.isExtra && (
                                    <TableRow
                                      sx={{ borderTop: "1px dashed #ccc" }}
                                    >
                                      <TableCell
                                        sx={{
                                          color: "#94a3b8",
                                          fontStyle: "italic",
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        Opcional
                                      </TableCell>
                                      <TableCell colSpan={3} />
                                      <TableCell align="center">
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleOpenForm(
                                              req,
                                              Date.now(),
                                              true,
                                            )
                                          }
                                        >
                                          <AddIcon
                                            fontSize="small"
                                            sx={{ color: "#94a3b8" }}
                                          />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          <Box
            sx={{
              p: 2,
              mt: "auto",
              bgcolor: "#f8fafc",
              textAlign: "center",
              borderTop: "1px solid #eee",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<PlaylistAddIcon />}
              onClick={() => handleOpenForm(null, 0, true)}
            >
              AGREGAR EQUIPO NO REQUERIDO
            </Button>
          </Box>
        </TableContainer>
      </Box>

      {/* MODAL */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={styleModal}>
          <Box
            sx={{
              bgcolor: "#005596",
              color: "white",
              py: 2,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
            >
              {isExtraMode && !requisitosDB.find((r) => r.id === form.id)
                ? "NUEVO EQUIPO"
                : "EDITAR EQUIPO"}
            </Typography>
          </Box>
          <Box sx={{ p: 4 }}>
            <Stack spacing={3}>
              <TextField
                label="Origen"
                value={form.origen}
                disabled
                fullWidth
                variant="standard"
              />

              {isExtraMode && !requisitosDB.find((r) => r.id === form.id) ? (
                <Autocomplete
                  freeSolo
                  options={listaEquiposDisponiblesExtra}
                  value={form.equipamiento || null}
                  onChange={(e, v) => {
                    const isSolo = todosLosEquiposFullDB.find(eq => eq.equipamiento === v)?.soloExistencia || false;
                    setForm({ ...form, equipamiento: v, soloExistencia: isSolo });
                  }}
                  onInputChange={(e, v) => {
                    const isSolo = todosLosEquiposFullDB.find(eq => eq.equipamiento === v)?.soloExistencia || false;
                    setForm({ ...form, equipamiento: v, soloExistencia: isSolo });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Equipo"
                      variant="standard"
                      placeholder="Escriba o seleccione"
                    />
                  )}
                />
              ) : (
                <TextField
                  label="Tipo de Equipo"
                  value={form.equipamiento}
                  disabled
                  fullWidth
                  variant="standard"
                />
              )}

              {form.equipamiento === "OTRO" && (
                <TextField
                  label="Nombre Equipo"
                  fullWidth
                  variant="standard"
                  value={form.otroEquipo}
                  onChange={(e) => setForm({ ...form, otroEquipo: e.target.value.toUpperCase() })}
                  autoFocus
                />
              )}

              {(() => {
                const finalEq = form.equipamiento === "OTRO" ? form.otroEquipo : form.equipamiento;
                const config = TIPOS_EQUIPOS_DATABASE.find(
                  (t) => t.nombre.toUpperCase() === (finalEq || "").toUpperCase()
                )?.booleanos;

                if (config) {
                  return (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                      {config.unidad && (
                        <TextField
                          label="Unidad *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.unidad || ""}
                          placeholder="Ej. UNIDAD, PAR, CHALECO"
                          onChange={(e) => setForm({ ...form, unidad: e.target.value.toUpperCase() })}
                        />
                      )}
                      {config.cargaMarca && (
                        <TextField
                          label="Marca *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.marca}
                          onChange={(e) => setForm({ ...form, marca: e.target.value.toUpperCase() })}
                        />
                      )}
                      {config.antiguedad && (
                        <TextField
                          label="Antigüedad (años) *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.antiguedad || ""}
                          slotProps={{ htmlInput: { maxLength: 3 } }}
                          placeholder="Ej. 2"
                          helperText="Años de antigüedad"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            if (val.length <= 3) setForm({ ...form, antiguedad: val });
                          }}
                        />
                      )}
                      {config.cantidad && (
                        <TextField
                          label="Cantidad *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.cantidad || ""}
                          placeholder="Ej. 4"
                          helperText="Cantidad de elementos"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setForm({ ...form, cantidad: val });
                          }}
                        />
                      )}
                      {config.cargaModelo && (
                        <TextField
                          label="Modelo *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.modelo}
                          onChange={(e) => setForm({ ...form, modelo: e.target.value.toUpperCase() })}
                        />
                      )}
                      {config.cargaSerie && (
                        <TextField
                          label="Serie *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.serie}
                          onChange={(e) => setForm({ ...form, serie: e.target.value.toUpperCase() })}
                        />
                      )}
                      {config.condicion && (
                        <FormControl variant="standard" fullWidth required>
                          <InputLabel>Condición *</InputLabel>
                          <Select
                            value={form.condicion}
                            onChange={(e) => setForm({ ...form, condicion: e.target.value })}
                          >
                            <MenuItem value="Propio">Propio</MenuItem>
                            <MenuItem value="Tercerizado">Tercerizado</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                      {config.numeroPM && (
                        <TextField
                          label="Número de PM (Opcional)"
                          fullWidth
                          variant="standard"
                          value={form.numeroPM}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                          helperText={`${(form.numeroPM || "").length}/6 caracteres (Alfanumérico)`}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                            if (val.length <= 6) setForm({ ...form, numeroPM: val });
                          }}
                        />
                      )}
                      {config.movilidad && (
                        <FormControl variant="standard" fullWidth required>
                          <InputLabel>Movilidad *</InputLabel>
                          <Select
                            value={form.movilidad}
                            onChange={(e) => setForm({ ...form, movilidad: e.target.value })}
                          >
                            <MenuItem value="Fijo">Fijo</MenuItem>
                            <MenuItem value="Rodante">Rodante</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                      {config.usoEquipo && (
                        <FormControl variant="standard" fullWidth required>
                          <InputLabel>Uso del equipo *</InputLabel>
                          <Select
                            value={form.usoEquipo}
                            onChange={(e) => setForm({ ...form, usoEquipo: e.target.value })}
                          >
                            <MenuItem value="Facial">Facial</MenuItem>
                            <MenuItem value="Corporal">Corporal</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                      {config.anoFabricacion && (
                        <TextField
                          label="Año de fabricación *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.anoFabricacion}
                          slotProps={{ htmlInput: { maxLength: 4 } }}
                          placeholder="Ej. 2023"
                          helperText="4 dígitos numéricos"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            if (val.length <= 4) setForm({ ...form, anoFabricacion: val });
                          }}
                        />
                      )}
                      {config.tesla && (
                        <TextField
                          label="Tesla *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.tesla}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                          placeholder="Ej. 1.5, 3"
                          helperText="Numérico > 0 (máx 6 caracteres)"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            if (val.length <= 6) setForm({ ...form, tesla: val });
                          }}
                        />
                      )}
                      {config.tensionMax && (
                        <TextField
                          label="Tensión Max (kV) *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.tensionMax}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                          placeholder="Ej. 150"
                          helperText="Numérico > 0 (máx 6 caracteres)"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            if (val.length <= 6) setForm({ ...form, tensionMax: val });
                          }}
                        />
                      )}
                      {config.corrienteMax && (
                        <TextField
                          label="Corriente Max (mA) *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.corrienteMax}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                          placeholder="Ej. 500"
                          helperText="Numérico > 0 (máx 6 caracteres)"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            if (val.length <= 6) setForm({ ...form, corrienteMax: val });
                          }}
                        />
                      )}
                      {config.potencia && (
                        <TextField
                          label="Potencia (Watt) *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.potencia}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                          placeholder="Ej. 2500"
                          helperText="Numérico > 0 (máx 6 caracteres)"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            if (val.length <= 6) setForm({ ...form, potencia: val });
                          }}
                        />
                      )}
                      {config.energia && (
                        <TextField
                          label="Energía (Joule) *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.energia}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                          placeholder="Ej. 50"
                          helperText="Numérico > 0 (máx 6 caracteres)"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            if (val.length <= 6) setForm({ ...form, energia: val });
                          }}
                        />
                      )}
                      {config.fluencia && (
                        <TextField
                          label="Fluencia (Joule/cm2) *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.fluencia}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                          placeholder="Ej. 40"
                          helperText="Numérico > 0 (máx 6 caracteres)"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            if (val.length <= 6) setForm({ ...form, fluencia: val });
                          }}
                        />
                      )}
                      {config.longitudOnda && (
                        <TextField
                          label="Longitud de onda (nm) *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.longitudOnda}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                          placeholder="Ej. 1064"
                          helperText="Numérico > 0 (máx 6 caracteres)"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            if (val.length <= 6) setForm({ ...form, longitudOnda: val });
                          }}
                        />
                      )}
                      {config.cantidadFuentes && (
                        <TextField
                          label="Cantidad de fuentes *"
                          fullWidth
                          variant="standard"
                          required
                          value={form.cantidadFuentes}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                          placeholder="Ej. 1, 2"
                          helperText="Numérico > 0 (máx 6 caracteres)"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            if (val.length <= 6) setForm({ ...form, cantidadFuentes: val });
                          }}
                        />
                      )}
                      {config.tipoRevelado && (
                        <FormControl variant="standard" fullWidth required sx={{ gridColumn: { sm: "span 2" } }}>
                          <InputLabel>Tipo de revelado *</InputLabel>
                          <Select
                            value={form.tipoRevelado}
                            onChange={(e) => setForm({ ...form, tipoRevelado: e.target.value })}
                          >
                            <MenuItem value="Digital DR">Digital DR</MenuItem>
                            <MenuItem value="Digital CR">Digital CR</MenuItem>
                            <MenuItem value="Manual">Manual</MenuItem>
                            <MenuItem value="Procesadora Automática">Procesadora Automática</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  );
                }

                const canEditFields = !!form.equipamiento && (form.equipamiento !== "OTRO" || !!form.otroEquipo);
                const isSoloExistencia = form.soloExistencia;

                return (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: canEditFields ? 1 : 0.5 }}>
                      <Checkbox
                        checked={form.soloExistencia}
                        onChange={(e) => setForm({ ...form, soloExistencia: e.target.checked })}
                        size="small"
                        disabled={!isExtraMode || !canEditFields}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: isExtraMode ? "#64748b" : "rgba(100, 116, 139, 0.5)"
                        }}
                      >
                        Sólo existencia
                      </Typography>
                    </Box>

                    <TextField
                      label="Marca"
                      fullWidth
                      variant="standard"
                      disabled={!canEditFields || isSoloExistencia}
                      value={isSoloExistencia ? "" : form.marca}
                      onChange={(e) =>
                        setForm({ ...form, marca: e.target.value.toUpperCase() })
                      }
                    />
                    <TextField
                      label="Modelo"
                      fullWidth
                      variant="standard"
                      disabled={!canEditFields || isSoloExistencia}
                      value={isSoloExistencia ? "" : form.modelo}
                      onChange={(e) =>
                        setForm({ ...form, modelo: e.target.value.toUpperCase() })
                      }
                    />
                    <TextField
                      label="Serie"
                      fullWidth
                      variant="standard"
                      disabled={!canEditFields || isSoloExistencia}
                      value={isSoloExistencia ? "" : form.serie}
                      onChange={(e) =>
                        setForm({ ...form, serie: e.target.value.toUpperCase() })
                      }
                    />
                  </>
                );
              })()}
            </Stack>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                gap: 2,
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                onClick={() => setOpenModal(false)}
                sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" } }}
                startIcon={<CancelIcon />}
              >
                CANCELAR
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{ bgcolor: "#005596", "&:hover": { bgcolor: "#00386f" } }}
                startIcon={<CheckIcon />}
              >
                AGREGAR
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EquipamientosLabV3;
