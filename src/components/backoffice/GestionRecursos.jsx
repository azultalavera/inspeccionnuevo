import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardActionArea, 
  IconButton, 
  Divider, 
  Chip, 
  Stack, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Business as BusinessIcon,
  HomeRepairService as HomeRepairServiceIcon,
  People as PeopleIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  SettingsSuggest as SettingsSuggestIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Tune as TuneIcon,
  Sensors as SensorsIcon,
  Engineering as EngineeringIcon,
  ArrowForward as ArrowForwardIcon,
  InfoOutlined as InfoOutlinedIcon,
  CheckCircle as CheckCircleIcon,
  Construction as ConstructionIcon
} from "@mui/icons-material";
import Layout from '../ui/Layout';

const GestionRecursos = () => {
  const navigate = useNavigate();

  // Modal para módulos en análisis sin ruta funcional activa todavía (ej: Actas)
  const [modalAnalisis, setModalAnalisis] = useState({
    open: false,
    titulo: "",
    descripcion: ""
  });

  const handleOpenAnalisisModal = (titulo, descripcion) => {
    setModalAnalisis({
      open: true,
      titulo,
      descripcion
    });
  };

  const handleCloseModal = () => {
    setModalAnalisis(prev => ({ ...prev, open: false }));
  };

  return (
    <Layout>
      <Box sx={{ width: "100%", boxSizing: "border-box", p: { xs: 1.5, md: 3 }, fontFamily: "Roboto, sans-serif" }}>
        
        {/* CONTAINER CON FONDO BLANCO */}
        <Box 
          sx={{ 
            backgroundColor: "#ffffff", 
            p: { xs: 2.5, md: 4, lg: 5 }, 
            borderRadius: 4, 
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)", 
            border: "1px solid #e2e8f0", 
            minHeight: "calc(100vh - 120px)" 
          }}
        >

          {/* BREADCRUMB / BACK ARROW */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton onClick={() => navigate("/admin/dashboard")} sx={{ backgroundColor: "#f1f5f9", mr: 1.5 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 750, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Volver al Panel Administrador
            </Typography>
          </Box>

          {/* HEADER SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
              <Box 
                sx={{ 
                  p: 1.8, 
                  borderRadius: "14px", 
                  backgroundColor: "rgba(0, 85, 150, 0.08)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "#005596",
                }}
              >
                <SettingsSuggestIcon sx={{ fontSize: 40 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", fontSize: { xs: "1.5rem", md: "1.85rem" } }}>
                  Configuración de Recursos
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                  Gestione las reglas de negocio, catálogos, matrices técnicas de radiofísica y módulos en análisis.
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Chip 
                icon={<CheckCircleIcon sx={{ "&&": { color: "#16a34a", fontSize: 16 } }} />} 
                label="2 Módulos Operativos" 
                size="small" 
                sx={{ bgcolor: "#f0fdf4", color: "#166534", fontWeight: 700, border: "1px solid #bbf7d0" }} 
              />
              <Chip 
                icon={<SensorsIcon sx={{ "&&": { color: "#0284c7", fontSize: 16 } }} />} 
                label="Radiofísica (2 sub-áreas)" 
                size="small" 
                sx={{ bgcolor: "#f0f9ff", color: "#0369a1", fontWeight: 700, border: "1px solid #bae6fd" }} 
              />
              <Chip 
                icon={<ConstructionIcon sx={{ "&&": { color: "#d97706", fontSize: 16 } }} />} 
                label="5 en Análisis" 
                size="small" 
                sx={{ bgcolor: "#fffbeb", color: "#b45309", fontWeight: 700, border: "1px solid #fde68a" }} 
              />
            </Stack>
          </Box>
          
          <Divider sx={{ mb: 4, borderColor: "#e2e8f0" }} />

          {/* GRID PRINCIPAL DE LAS 4 CARDS SOLICITADAS */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >

            {/* ── CARD 1: INFRAESTRUCTURA ─────────────────────────────── */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: "18px", 
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  borderColor: "#0B85C4",
                  boxShadow: "0 14px 28px -6px rgba(11, 133, 196, 0.2)",
                  transform: "translateY(-4px)",
                  "& .card-icon-box": {
                    transform: "scale(1.08)",
                  },
                },
              }}
            >
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, bgcolor: "#0B85C4" }} />

              <CardActionArea 
                onClick={() => navigate("/clicsalud-backoffice/gestion-recursos/infraestructura")}
                sx={{ 
                  flex: 1, 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "flex-start", 
                  justifyContent: "space-between", 
                  p: 3,
                  boxSizing: "border-box",
                  textAlign: "left"
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box 
                      className="card-icon-box"
                      sx={{ 
                        width: 62,
                        height: 62,
                        borderRadius: "16px",
                        bgcolor: "rgba(11, 133, 196, 0.1)",
                        color: "#0B85C4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.25s ease",
                        border: "1px solid rgba(11, 133, 196, 0.2)",
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: 34 }} />
                    </Box>

                    <Chip 
                      label="Operativo" 
                      size="small" 
                      sx={{ bgcolor: "#f0fdf4", color: "#166534", fontWeight: 750, fontSize: "0.72rem", border: "1px solid #bbf7d0" }} 
                    />
                  </Box>

                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 800, 
                      color: "#0f172a", 
                      fontSize: "1.18rem",
                      lineHeight: 1.25,
                      mb: 1,
                    }}
                  >
                    Infraestructura
                  </Typography>

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: "#64748b", 
                      fontSize: "0.85rem", 
                      lineHeight: 1.45,
                      mb: 2.5
                    }}
                  >
                    Parámetros edilicios, áreas, dependencias y reglas de cálculo de superficies mínimas requeridas.
                  </Typography>

                  <Stack spacing={0.8} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#0B85C4" }} />
                      <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600 }}>Superficies y dimensiones mínimas</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#0B85C4" }} />
                      <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600 }}>Dependencias asistenciales y edilicias</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", pt: 2, borderTop: "1px solid #f1f5f9" }}>
                  <Typography variant="caption" sx={{ fontWeight: 750, color: "#0B85C4", fontSize: "0.82rem" }}>
                    Configurar Infraestructura
                  </Typography>
                  <ArrowForwardIcon sx={{ color: "#0B85C4", fontSize: 18 }} />
                </Box>
              </CardActionArea>
            </Card>

            {/* ── CARD 2: EQUIPAMIENTOS ───────────────────────────────── */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: "18px", 
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  borderColor: "#7c3aed",
                  boxShadow: "0 14px 28px -6px rgba(124, 58, 237, 0.2)",
                  transform: "translateY(-4px)",
                  "& .card-icon-box": {
                    transform: "scale(1.08)",
                  },
                },
              }}
            >
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, bgcolor: "#7c3aed" }} />

              <CardActionArea 
                onClick={() => navigate("/clicsalud-backoffice/gestion-recursos/equipamientos")}
                sx={{ 
                  flex: 1, 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "flex-start", 
                  justifyContent: "space-between", 
                  p: 3,
                  boxSizing: "border-box",
                  textAlign: "left"
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box 
                      className="card-icon-box"
                      sx={{ 
                        width: 62,
                        height: 62,
                        borderRadius: "16px",
                        bgcolor: "rgba(124, 58, 237, 0.1)",
                        color: "#7c3aed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.25s ease",
                        border: "1px solid rgba(124, 58, 237, 0.2)",
                      }}
                    >
                      <HomeRepairServiceIcon sx={{ fontSize: 34 }} />
                    </Box>

                    <Chip 
                      label="Operativo" 
                      size="small" 
                      sx={{ bgcolor: "#f0fdf4", color: "#166534", fontWeight: 750, fontSize: "0.72rem", border: "1px solid #bbf7d0" }} 
                    />
                  </Box>

                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 800, 
                      color: "#0f172a", 
                      fontSize: "1.18rem",
                      lineHeight: 1.25,
                      mb: 1,
                    }}
                  >
                    Equipamientos
                  </Typography>

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: "#64748b", 
                      fontSize: "0.85rem", 
                      lineHeight: 1.45,
                      mb: 2.5
                    }}
                  >
                    Fórmulas de dotación general, asignación por servicio asistencial y criterios de trazabilidad técnica.
                  </Typography>

                  <Stack spacing={0.8} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#7c3aed" }} />
                      <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600 }}>Reglas: Único, Lineal y Proporcional</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#7c3aed" }} />
                      <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600 }}>Trazabilidad: Marca, Modelo y Serie</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", pt: 2, borderTop: "1px solid #f1f5f9" }}>
                  <Typography variant="caption" sx={{ fontWeight: 750, color: "#7c3aed", fontSize: "0.82rem" }}>
                    Configurar Equipamientos
                  </Typography>
                  <ArrowForwardIcon sx={{ color: "#7c3aed", fontSize: 18 }} />
                </Box>
              </CardActionArea>
            </Card>

            {/* ── CARD 3: RADIOFÍSICA (CON 2 SUB-ITEMS) ───────────────── */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: "18px", 
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  borderColor: "#0284c7",
                  boxShadow: "0 14px 28px -6px rgba(2, 132, 199, 0.2)",
                  transform: "translateY(-4px)",
                  "& .card-icon-box": {
                    transform: "scale(1.08)",
                  },
                },
              }}
            >
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, bgcolor: "#0284c7" }} />

              <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
                
                {/* Header de Radiofísica */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box 
                    className="card-icon-box"
                    sx={{ 
                      width: 62,
                      height: 62,
                      borderRadius: "16px",
                      bgcolor: "rgba(2, 132, 199, 0.1)",
                      color: "#0284c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.25s ease",
                      border: "1px solid rgba(2, 132, 199, 0.2)",
                    }}
                  >
                    <SensorsIcon sx={{ fontSize: 34 }} />
                  </Box>

                  <Chip 
                    label="2 Opciones" 
                    size="small" 
                    sx={{ bgcolor: "#f0f9ff", color: "#0369a1", fontWeight: 750, fontSize: "0.72rem", border: "1px solid #bae6fd" }} 
                  />
                </Box>

                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 800, 
                    color: "#0f172a", 
                    fontSize: "1.18rem",
                    lineHeight: 1.25,
                    mb: 1,
                  }}
                >
                  Radiofísica
                </Typography>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "#64748b", 
                    fontSize: "0.85rem", 
                    lineHeight: 1.45,
                    mb: 2.5
                  }}
                >
                  Parámetros técnicos y dotación específica para equipos radiológicos y electromédicos.
                </Typography>

                {/* SUB-ITEMS DE RADIOFÍSICA */}
                <Stack spacing={1.5} sx={{ mt: "auto" }}>
                  
                  {/* Subitem 1: Características por Equipos */}
                  <Box
                    onClick={() => navigate("/admin/gestion-recursos/requerimientos-equipos")}
                    sx={{
                      p: 1.6,
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      bgcolor: "#f8fafc",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#f0f9ff",
                        borderColor: "#0284c7",
                        transform: "translateX(3px)",
                        boxShadow: "0 2px 8px rgba(2, 132, 199, 0.12)"
                      }
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: "10px", 
                          bgcolor: "rgba(2, 132, 199, 0.12)", 
                          color: "#0284c7",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center" 
                        }}
                      >
                        <TuneIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 750, color: "#0f172a", fontSize: "0.88rem", lineHeight: 1.2 }}>
                          Características por Equipos
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                          Matriz técnica y atributos booleanos
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIcon sx={{ color: "#0284c7", fontSize: 18 }} />
                  </Box>

                  {/* Subitem 2: Equipamientos Radiofísica */}
                  <Box
                    onClick={() => navigate("/clicsalud-backoffice/gestion-recursos/equipamientos?tipologia=RADIOF%C3%8DSICA")}
                    sx={{
                      p: 1.6,
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      bgcolor: "#f8fafc",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#f0f9ff",
                        borderColor: "#0284c7",
                        transform: "translateX(3px)",
                        boxShadow: "0 2px 8px rgba(2, 132, 199, 0.12)"
                      }
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: "10px", 
                          bgcolor: "rgba(2, 132, 199, 0.12)", 
                          color: "#0284c7",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center" 
                        }}
                      >
                        <PrecisionManufacturingIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 750, color: "#0f172a", fontSize: "0.88rem", lineHeight: 1.2 }}>
                          Equipamientos Radiofísica
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                          Dotación y catálogo específico
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIcon sx={{ color: "#0284c7", fontSize: 18 }} />
                  </Box>

                </Stack>
              </Box>
            </Card>

            {/* ── CARD 4: FUNCIONALIDADES EN ANÁLISIS (SPAN TOTAL / 5 SUB-ITEMS) ── */}
            <Card 
              elevation={0}
              sx={{ 
                gridColumn: { xs: "1fr", lg: "span 3" },
                borderRadius: "18px", 
                border: "1px solid #fde68a",
                backgroundColor: "#fffdfa",
                p: { xs: 2.5, md: 3.5 },
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(217, 119, 6, 0.06)",
                "&:hover": {
                  borderColor: "#d97706",
                  boxShadow: "0 10px 24px rgba(217, 119, 6, 0.12)",
                }
              }}
            >
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, bgcolor: "#d97706" }} />

              {/* Header de Funcionalidades en Análisis */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box 
                    sx={{ 
                      width: 54,
                      height: 54,
                      borderRadius: "14px",
                      bgcolor: "rgba(217, 119, 6, 0.12)",
                      color: "#d97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(217, 119, 6, 0.25)",
                    }}
                  >
                    <EngineeringIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 800, 
                        color: "#0f172a", 
                        fontSize: "1.22rem",
                        lineHeight: 1.25,
                      }}
                    >
                      Funcionalidades en Análisis
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "#78350f", 
                        fontSize: "0.86rem", 
                        lineHeight: 1.4,
                      }}
                    >
                      Módulos y normativas en proceso de relevamiento, análisis técnico y especificación funcional.
                    </Typography>
                  </Box>
                </Box>

                <Chip 
                  label="5 Módulos en Proceso" 
                  size="small" 
                  sx={{ 
                    bgcolor: "#fffbeb", 
                    color: "#b45309", 
                    fontWeight: 750, 
                    fontSize: "0.75rem", 
                    border: "1px solid #fde68a" 
                  }} 
                />
              </Box>

              {/* GRID DE LAS 5 FUNCIONALIDADES EN ANÁLISIS */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(5, 1fr)"
                  },
                  gap: 2,
                }}
              >
                
                {/* 1. Recursos Humanos */}
                <Box
                  onClick={() => navigate("/clicsalud-backoffice/gestion-recursos/recursos-humanos")}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 150,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#16a34a",
                      transform: "translateY(-3px)",
                      boxShadow: "0 6px 14px rgba(22, 163, 74, 0.12)",
                      "& .sub-icon": { bgcolor: "rgba(22, 163, 74, 0.15)", color: "#16a34a" }
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                      <Box 
                        className="sub-icon"
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: "10px", 
                          bgcolor: "rgba(22, 163, 74, 0.1)", 
                          color: "#16a34a",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <PeopleIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Chip label="En Análisis" size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem", mb: 0.5 }}>
                      Recursos Humanos
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem", lineHeight: 1.3, display: "block" }}>
                      Perfiles profesionales y cálculos de dotación
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", pt: 1 }}>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                  </Box>
                </Box>

                {/* 2. Jefe de Servicio */}
                <Box
                  onClick={() => navigate("/clicsalud-backoffice/gestion-recursos/jefe-servicio")}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 150,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#d97706",
                      transform: "translateY(-3px)",
                      boxShadow: "0 6px 14px rgba(217, 119, 6, 0.12)",
                      "& .sub-icon": { bgcolor: "rgba(217, 119, 6, 0.15)", color: "#d97706" }
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                      <Box 
                        className="sub-icon"
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: "10px", 
                          bgcolor: "rgba(217, 119, 6, 0.1)", 
                          color: "#d97706",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <SupervisorAccountIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Chip label="En Análisis" size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem", mb: 0.5 }}>
                      Jefe de Servicio
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem", lineHeight: 1.3, display: "block" }}>
                      Requisitos de matrícula y especialidades
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", pt: 1 }}>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: "#d97706" }} />
                  </Box>
                </Box>

                {/* 3. Actas de Inspección */}
                <Box
                  onClick={() => handleOpenAnalisisModal(
                    "Actas de Inspección",
                    "El módulo de configuración de Actas de Inspección (modelos, apartados e ítems de verificación técnica) se encuentra actualmente en proceso de especificación y análisis normativo con el equipo de coordinación de fiscalización sanitaria."
                  )}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 150,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#dc2626",
                      transform: "translateY(-3px)",
                      boxShadow: "0 6px 14px rgba(220, 38, 38, 0.12)",
                      "& .sub-icon": { bgcolor: "rgba(220, 38, 38, 0.15)", color: "#dc2626" }
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                      <Box 
                        className="sub-icon"
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: "10px", 
                          bgcolor: "rgba(220, 38, 38, 0.1)", 
                          color: "#dc2626",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <AssignmentIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Chip label="En Análisis" size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem", mb: 0.5 }}>
                      Actas de Inspección
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem", lineHeight: 1.3, display: "block" }}>
                      Modelos, apartados e ítems de verificación
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", pt: 1 }}>
                    <InfoOutlinedIcon sx={{ fontSize: 16, color: "#dc2626" }} />
                  </Box>
                </Box>

                {/* 4. Servicios */}
                <Box
                  onClick={() => navigate("/clicsalud-backoffice/gestion-recursos/servicios")}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 150,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#0d9488",
                      transform: "translateY(-3px)",
                      boxShadow: "0 6px 14px rgba(13, 148, 136, 0.12)",
                      "& .sub-icon": { bgcolor: "rgba(13, 148, 136, 0.15)", color: "#0d9488" }
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                      <Box 
                        className="sub-icon"
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: "10px", 
                          bgcolor: "rgba(13, 148, 136, 0.1)", 
                          color: "#0d9488",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <SettingsSuggestIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Chip label="En Análisis" size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem", mb: 0.5 }}>
                      Servicios
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem", lineHeight: 1.3, display: "block" }}>
                      Especialidades asistenciales habilitables
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", pt: 1 }}>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: "#0d9488" }} />
                  </Box>
                </Box>

                {/* 5. Tipos de Equipos */}
                <Box
                  onClick={() => navigate("/admin/gestion-recursos/tipos-equipos")}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 150,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#0284c7",
                      transform: "translateY(-3px)",
                      boxShadow: "0 6px 14px rgba(2, 132, 199, 0.12)",
                      "& .sub-icon": { bgcolor: "rgba(2, 132, 199, 0.15)", color: "#0284c7" }
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                      <Box 
                        className="sub-icon"
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: "10px", 
                          bgcolor: "rgba(2, 132, 199, 0.1)", 
                          color: "#0284c7",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <PrecisionManufacturingIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Chip label="En Análisis" size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem", mb: 0.5 }}>
                      Tipos de Equipos
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem", lineHeight: 1.3, display: "block" }}>
                      Catálogo oficial y altas de nombres
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", pt: 1 }}>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: "#0284c7" }} />
                  </Box>
                </Box>

              </Box>
            </Card>

          </Box>

        </Box>
      </Box>

      {/* DIÁLOGO INFORMATIVO PARA MÓDULOS EN ANÁLISIS */}
      <Dialog 
        open={modalAnalisis.open} 
        onClose={handleCloseModal}
        PaperProps={{
          sx: { borderRadius: "14px", p: 1, maxWidth: "480px" }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <InfoOutlinedIcon sx={{ color: "#d97706", fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
            {modalAnalisis.titulo}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Chip 
            label="Funcionalidad en Análisis" 
            size="small" 
            sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 750, mb: 2 }} 
          />
          <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
            {modalAnalisis.descripcion}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseModal} 
            variant="contained" 
            sx={{ bgcolor: "#005596", textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default GestionRecursos;