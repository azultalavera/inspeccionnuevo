import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Stack,
  IconButton,
  CircularProgress,
  Checkbox,
  Switch,
  Button,
  Grid,
  Chip,
  Divider,
} from "@mui/material";

import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  WarningAmber as WarningAmberIcon,
  FactCheck as FactCheckIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon,
} from "@mui/icons-material";


const QuantitySelector = ({ value, onChange }) => {
  const hasValue = value > 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: `1px solid ${hasValue ? "#005596" : "#ccc"}`,
          borderRadius: "4px",
          height: "28px",
          bgcolor: "white",
        }}
      >
        <IconButton
          size="small"
          onClick={() => onChange(Math.max(0, value - 1))}
          sx={{ borderRadius: 0, p: 0.2, borderRight: "1px solid #ccc" }}
        >
          <RemoveIcon fontSize="inherit" />
        </IconButton>
        <Typography
          sx={{
            width: "30px",
            textAlign: "center",
            fontSize: "0.75rem",
            fontWeight: hasValue ? "bold" : "normal",
          }}
        >
          {value}
        </Typography>
        <IconButton
          size="small"
          onClick={() => onChange(value + 1)}
          sx={{ borderRadius: 0, p: 0.2, borderLeft: "1px solid #ccc" }}
        >
          <AddIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </Box>
  );
};

const getRecognitionColor = (type) => {
  switch (type) {
    case "nacional":
      return "#2196f3";
    case "provincial":
      return "#4caf50";
    case "ambos":
      return "#ff9800";
    default:
      return "#005596";
  }
};

const ServicesStep = ({
  selectedServices,
  setSelectedServices,
  infraSelection,
  setInfraSelection,
  onValidationChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [masterData, setMasterData] = useState({
    SERVICIO: [],
    COMPLEMENTARIO: [],
    INTERNACION: [],
    SALA: [],
    CAMA: [],
  });

  const [anexoI, setAnexoI] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isReviewed, setIsReviewed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resOrigenes, resAnexo] = await Promise.all([
          fetch("http://localhost:3001/origenes"),
          fetch("http://localhost:3001/infraestructura"),
        ]);
        const data = await resOrigenes.json();
        const rules = await resAnexo.json();

        const sortAlpha = (arr) =>
          arr.sort((a, b) => a.nombre.localeCompare(b.nombre));

        setAnexoI(rules);
        setMasterData({
          SERVICIO: sortAlpha(data.filter((o) => o.categoriaId === "SERVICIO")),
          COMPLEMENTARIO: sortAlpha(
            data.filter((o) => o.categoriaId === "COMPLEMENTARIO"),
          ),
          INTERNACION: sortAlpha(
            data.filter((o) => o.categoriaId === "INTERNACION"),
          ),
          SALA: sortAlpha(data.filter((o) => o.categoriaId === "SALA")),
          CAMA: sortAlpha(data.filter((o) => o.categoriaId === "CAMA")),
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Función para eliminar desde el resumen
  const handleRemoveFromSummary = (name, key) => {
    setIsReviewed(false);
    setValidationErrors([]);
    if (onValidationChange) onValidationChange(false);

    if (key === "SALA" || key === "CAMA") {
      setInfraSelection((prev) => ({ ...prev, [name]: 0 }));
    } else {
      setSelectedServices((prev) => {
        const newState = { ...prev };
        delete newState[name];
        return newState;
      });
    }
  };

  const cartCategories = useMemo(() => {
    const categories = [
      { label: "Servicios", items: [], key: "SERVICIO" },
      { label: "Servicios Complementarios", items: [], key: "COMPLEMENTARIO" },
      { label: "Servicios con Internación", items: [], key: "INTERNACION" },
      { label: "Salas", items: [], key: "SALA" },
      { label: "Camas", items: [], key: "CAMA" },
    ];

    Object.keys(selectedServices).forEach((name) => {
      const original = [
        ...masterData.SERVICIO,
        ...masterData.COMPLEMENTARIO,
        ...masterData.INTERNACION,
      ].find((i) => i.nombre === name);
      if (original) {
        const catIndex = categories.findIndex(
          (c) => c.key === original.categoriaId,
        );
        categories[catIndex].items.push({
          name,
          qty: null,
          key: original.categoriaId,
        });
      }
    });

    Object.entries(infraSelection)
      .filter(([_, qty]) => qty > 0)
      .forEach(([name, qty]) => {
        const original = [...masterData.SALA, ...masterData.CAMA].find(
          (i) => i.nombre === name,
        );
        if (original) {
          const catIndex = categories.findIndex(
            (c) => c.key === original.categoriaId,
          );
          categories[catIndex].items.push({
            name,
            qty,
            key: original.categoriaId,
          });
        }
      });

    return categories.filter((c) => c.items.length > 0);
  }, [selectedServices, infraSelection, masterData]);

  const currentCategory = [
    "SERVICIO",
    "COMPLEMENTARIO",
    "INTERNACION",
    "SALA",
    "CAMA",
  ][activeTab];

  const groupedData = useMemo(() => {
    const list = masterData[currentCategory] || [];
    const filtered = list.filter((item) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return filtered.reduce((groups, item) => {
      const letter = item.nombre[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(item);
      return groups;
    }, {});
  }, [currentCategory, masterData, searchTerm]);

  const toggleService = (name) => {
    setIsReviewed(false);
    setValidationErrors([]);
    if (onValidationChange) onValidationChange(false);
    setSelectedServices((prev) => {
      const newState = { ...prev };
      if (newState[name]) delete newState[name];
      else newState[name] = { thirdParty: false };
      return newState;
    });
  };

  const handleReview = () => {
    const errors = [];
    const allSelectedNames = [
      ...Object.keys(selectedServices),
      ...Object.keys(infraSelection).filter((n) => infraSelection[n] > 0),
    ];

    if (allSelectedNames.length === 0) {
      errors.push(
        "Tiene que seleccionar por lo menos un servicio, sala o cama para revisar datos",
      );
    }

    allSelectedNames.forEach((name) => {
      const serviceName = name.trim().toUpperCase();
      const requirements = anexoI.filter(
        (rule) => rule.origen.trim().toUpperCase() === serviceName,
      );
      requirements.forEach((req) => {
        const target = req.requerida.trim().toUpperCase();
        if (
          req.tipoInfra.toUpperCase() === "CAMA" ||
          req.tipoInfra.toUpperCase() === "SALA"
        ) {
          if (
            (infraSelection[req.requerida] || 0) < (parseInt(req.minimo) || 1)
          ) {
            errors.push(
              `${name} requiere al menos ${req.minimo} de ${req.requerida}`,
            );
          }
        } else {
          if (
            !Object.keys(selectedServices).some(
              (s) => s.trim().toUpperCase() === target,
            )
          ) {
            errors.push(
              `${name} requiere declarar el servicio ${req.requerida}`,
            );
          }
        }
      });
    });

    setValidationErrors(errors);
    setIsReviewed(true);
    if (onValidationChange)
      onValidationChange(errors.length === 0 && allSelectedNames.length > 0);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#25ade6" }}>
        SERVICIOS
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
        }}
      >
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* REFERENCIAS */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: "#666",
                textTransform: "uppercase",
              }}
            >
              Reconocimiento:
            </Typography>
            <Stack direction="row" spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Chip
                  label="Nacional"
                  size="small"
                  sx={{
                    bgcolor: "#2196f3",
                    color: "white",
                    fontSize: "0.65rem",
                    height: 20,
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Chip
                  label="Provincial"
                  size="small"
                  sx={{
                    bgcolor: "#4caf50",
                    color: "white",
                    fontSize: "0.65rem",
                    height: 20,
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Chip
                  label="Nacional y Provincial"
                  size="small"
                  sx={{
                    bgcolor: "#ff9800",
                    color: "white",
                    fontSize: "0.65rem",
                    height: 20,
                  }}
                />
              </Box>
            </Stack>
          </Paper>

          <Tabs
            value={activeTab}
            onChange={(e, v) => {
              setActiveTab(v);
              setSearchTerm("");
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Servicios" />
            <Tab label="Servicios Complementarios" />
            <Tab label="Servicios con Internación" />
            <Tab label="Salas" />
            <Tab label="Camas" />
          </Tabs>

          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2, bgcolor: "white" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ maxHeight: "550px", overflowY: "auto", pr: 1 }}>
            {Object.keys(groupedData)
              .sort()
              .map((letter) => (
                <Box key={letter} sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      bgcolor: "#f5f5f5",
                      px: 2,
                      py: 0.5,
                      mb: 1,
                      borderRadius: "4px",
                      fontWeight: "bold",
                      color: "#777",
                    }}
                  >
                    {letter}
                  </Typography>
                  <Grid container spacing={1}>
                    {groupedData[letter].map((item) => {
                      const isSelected =
                        activeTab < 3
                          ? !!selectedServices[item.nombre]
                          : infraSelection[item.nombre] > 0;
                      return (
                        <Grid item xs={12} md={4} key={item.id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 0.5,
                              borderRadius: "4px",
                              backgroundColor: "transparent",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {activeTab < 3 && (
                                <Checkbox
                                  size="small"
                                  checked={isSelected}
                                  onChange={() => toggleService(item.nombre)}
                                  sx={{
                                    color: getRecognitionColor(item.reconocimiento),
                                    "&.Mui-checked": {
                                      color: getRecognitionColor(
                                        item.reconocimiento,
                                      ),
                                    },
                                  }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                  fontWeight: isSelected ? "bold" : "normal",
                                  fontSize: "0.7rem",
                                  ml: activeTab >= 3 ? 1 : 0,
                                }}
                              >
                                {item.nombre}
                              </Typography>
                            </Box>
                            {activeTab >= 3 && (
                              <QuantitySelector
                                value={infraSelection[item.nombre] || 0}
                                onChange={(val) => {
                                  setIsReviewed(false);
                                  setInfraSelection((p) => ({
                                    ...p,
                                    [item.nombre]: val,
                                  }));
                                }}
                              />
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ))}
          </Box>
        </Box>

        <Box
          sx={{
            width: { xs: "100%", lg: "350px" },
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* RESUMEN DE SELECCIÓN (CARRITO) */}
          <Paper
            elevation={0}
            sx={{
              border: "2px solid #005596",
              borderRadius: "4px",
              overflow: "hidden",
              bgcolor: "white",
            }}
          >
            <Box sx={{ p: 1.5, backgroundColor: "#005596", color: "white" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                RESUMEN DE SELECCIÓN
              </Typography>
            </Box>
            <Box sx={{ p: 1, maxHeight: "350px", overflowY: "auto" }}>
              {cartCategories.length === 0 ? (
                <Typography
                  variant="caption"
                  sx={{
                    p: 2,
                    display: "block",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  No hay selecciones
                </Typography>
              ) : (
                cartCategories.map((cat) => (
                  <Box key={cat.key} sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "bold",
                        color: "#005596",
                        textTransform: "uppercase",
                        fontSize: "0.65rem",
                        mb: 1,
                        display: "block",
                        px: 0.5,
                      }}
                    >
                      {cat.label}
                    </Typography>
                    <Stack spacing={0.5}>
                      {cat.items.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: "4px 8px",
                            bgcolor: "white",
                            borderRadius: "4px",
                            border: `1px solid #ccc`,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.68rem",
                              fontWeight: 500,
                              color: "#333",
                              maxWidth: "70%",
                            }}
                            noWrap
                          >
                            {item.name}{" "}
                            {item.qty !== null ? `(x${item.qty})` : ""}
                          </Typography>
                          {/* BOTÓN ELIMINAR DESDE CARRITO */}
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleRemoveFromSummary(item.name, item.key)
                            }
                            sx={{ p: 0, color: "#d32f2f" }}
                          >
                            <CloseIcon sx={{ fontSize: "14px" }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ))
              )}
            </Box>
          </Paper>

          {/* PANEL DE REVISIÓN */}
          <Paper
            elevation={0}
            sx={{
              border: "2px solid #005596",
              borderRadius: "4px",
              position: "sticky",
              top: 20,
            }}
          >
            <Box sx={{ p: 1.5, backgroundColor: "#005596", color: "white" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                REVISIÓN DE DATOS CARGADOS
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {isReviewed && validationErrors.length === 0 && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1,
                    bgcolor: "#e8f5e9",
                    border: "1px solid #4caf50",
                    borderRadius: "4px",
                    textAlign: "center",
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ fontWeight: "bold", color: "#2e7d32" }}
                  >
                    LISTO PARA AVANZAR
                  </Typography>
                </Box>
              )}
              {validationErrors.length > 0 && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1,
                    bgcolor: "#fff3e0",
                    border: "1px solid #ff9800",
                    borderRadius: "4px",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color: "#e65100",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <WarningAmberIcon fontSize="inherit" /> FALTANTES:
                  </Typography>
                  {validationErrors.map((err, i) => (
                    <Typography
                      key={i}
                      variant="caption"
                      display="block"
                      sx={{ fontSize: "0.62rem", mb: 0.5 }}
                    >
                      • {err}
                    </Typography>
                  ))}
                </Box>
              )}
              <Button
                fullWidth
                variant="contained"
                startIcon={<FactCheckIcon />}
                onClick={handleReview}
                sx={{ bgcolor: "#005596", fontWeight: "bold" }}
              >
                REVISAR DATOS
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ServicesStep;
