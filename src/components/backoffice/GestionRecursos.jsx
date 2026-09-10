import React from 'react';
import { Box, Typography, Card, CardActionArea, IconButton, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Business as BusinessIcon } from "@mui/icons-material";
import { HomeRepairService as HomeRepairServiceIcon } from "@mui/icons-material";
import { People as PeopleIcon } from "@mui/icons-material"; 
import { SupervisorAccount as SupervisorAccountIcon } from "@mui/icons-material";
import { Assignment as AssignmentIcon } from "@mui/icons-material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { SettingsSuggest as SettingsSuggestIcon } from "@mui/icons-material";
import { PrecisionManufacturing as PrecisionManufacturingIcon } from "@mui/icons-material";
import { Tune as TuneIcon } from "@mui/icons-material";
import Layout from '../ui/Layout';

const categorias = [
  { 
    id: 'tipos-equipos',
    title: "Tipo de Equipos",
    desc: "Catálogo oficial y altas de nombres de equipos", 
    path: "/admin/gestion-recursos/tipos-equipos", 
    icon: <PrecisionManufacturingIcon sx={{ fontSize: 36 }} />,
    color: "#0284c7",
  },
  { 
    id: 'requerimientos-equipos',
    title: "Características por Equipos",
    desc: "Matriz técnica y características por tipología", 
    path: "/admin/gestion-recursos/requerimientos-equipos", 
    icon: <TuneIcon sx={{ fontSize: 36 }} />,
    color: "#0ea5e9",
  },
  { 
    id: 'infra',
    title: "Infraestructura",
    desc: "Parámetros edilicios, áreas y dependencias", 
    path: "/clicsalud-backoffice/gestion-recursos/infraestructura", 
    icon: <BusinessIcon sx={{ fontSize: 36 }} />,
    color: "#0B85C4",
  },
  { 
    id: 'equip',
    title: "Equipamientos",
    desc: "Fórmulas de dotación y asignación por servicio", 
    path: "/clicsalud-backoffice/gestion-recursos/equipamientos", 
    icon: <HomeRepairServiceIcon sx={{ fontSize: 36 }} />,
    color: "#8b5cf6",
  },
  { 
    id: 'rrhh',
    title: "Recursos Humanos",
    desc: "Perfiles profesionales y cálculos de dotación", 
    path: "/clicsalud-backoffice/gestion-recursos/recursos-humanos", 
    icon: <PeopleIcon sx={{ fontSize: 36 }} />,
    color: "#16a34a",
  },
  { 
    id: 'jefes',
    title: "Jefe de Servicio",
    desc: "Requisitos de matrícula y especialidades", 
    path: "/clicsalud-backoffice/gestion-recursos/jefe-servicio", 
    icon: <SupervisorAccountIcon sx={{ fontSize: 36 }} />,
    color: "#d97706",
  },
  { 
    id: 'acta',
    title: "Actas de Inspección",
    desc: "Modelos, apartados e ítems de verificación", 
    path: "/clicsalud-backoffice/gestion-recursos/acta-inpeccion", 
    icon: <AssignmentIcon sx={{ fontSize: 36 }} />,
    color: "#dc2626",
  },
  { 
    id: 'servicios',
    title: "Servicios",
    desc: "Especialidades asistenciales habilitables", 
    path: "/clicsalud-backoffice/gestion-recursos/servicios", 
    icon: <SettingsSuggestIcon sx={{ fontSize: 36 }} />,
    color: "#0d9488",
  }
];

const GestionRecursos = () => {
  const navigate = useNavigate();

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 3 }}>
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
                Gestione las reglas de negocio, catálogos, matrices técnicas y parámetros de habilitación sanitaria.
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 4, borderColor: "#e2e8f0" }} />

          {/* GRID DE CARDS CON TAMAÑO 100% UNIFORME */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {categorias.map((item) => (
              <Card 
                key={item.id}
                elevation={0}
                sx={{ 
                  borderRadius: "16px", 
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  height: 220,
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    borderColor: item.color,
                    boxShadow: `0 14px 28px -6px ${item.color}25, 0 8px 12px -6px ${item.color}15`,
                    transform: "translateY(-4px)",
                    "& .card-icon-box": {
                      transform: "scale(1.08)",
                    },
                  },
                }}
              >
                {/* Indicador de color en borde superior */}
                <Box 
                  sx={{ 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: 4, 
                    bgcolor: item.color,
                  }} 
                />

                <CardActionArea 
                  onClick={() => navigate(item.path)}
                  sx={{ 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    p: 3,
                    boxSizing: "border-box",
                  }}
                >
                  {/* Contenedor del Icono con tamaño fijo y centrado */}
                  <Box 
                    className="card-icon-box"
                    sx={{ 
                      width: 68,
                      height: 68,
                      borderRadius: "18px",
                      bgcolor: `${item.color}12`,
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      transition: "transform 0.25s ease",
                      border: `1px solid ${item.color}22`,
                    }}
                  >
                    {item.icon}
                  </Box>

                  {/* Título con altura uniforme para evitar desalineación */}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 800, 
                      color: "#0f172a", 
                      textAlign: "center", 
                      fontSize: "1rem",
                      lineHeight: 1.25,
                      mb: 0.8,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      height: "2.5em",
                      alignItems: "center",
                    }}
                  >
                    {item.title}
                  </Typography>

                  {/* Descripción corta */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "#64748b", 
                      fontSize: "0.76rem", 
                      textAlign: "center",
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      height: "2.6em",
                    }}
                  >
                    {item.desc}
                  </Typography>
                </CardActionArea>
              </Card>
            ))}
          </Box>

        </Box>
      </Box>
    </Layout>
  );
};

export default GestionRecursos;