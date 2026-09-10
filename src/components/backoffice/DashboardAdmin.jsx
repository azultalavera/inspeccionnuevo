import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Fab,
  Divider,
  Avatar,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Icons
import { Add as AddIcon } from "@mui/icons-material";
import { Description as DescriptionIcon } from "@mui/icons-material";
import { CorporateFare as CorporateFareIcon } from "@mui/icons-material";
import { LocalHospital as LocalHospitalIcon } from "@mui/icons-material";
import { Security as SecurityIcon } from "@mui/icons-material";
import { MonitorHeart as MonitorHeartIcon } from "@mui/icons-material";
import { Rule as RuleIcon } from "@mui/icons-material";
import { ArrowForwardIos as ArrowForwardIosIcon } from "@mui/icons-material";

import Layout from "../ui/Layout";
import ModalHabilitacion from "../ui/ModalHabilitacion";

const kpis = [
  {
    label: "Establecimientos",
    value: "1,204",
    growth: "+14 este mes",
    color: "#0B85C4",
    bg: "#0B85C415",
    icon: <CorporateFareIcon fontSize="medium" />,
  },
  {
    label: "Trámites en Curso",
    value: "185",
    growth: "-12% vs ant.",
    color: "#f59e0b",
    bg: "#f59e0b15",
    icon: <DescriptionIcon fontSize="medium" />,
  },
  {
    label: "Inspecciones",
    value: "43",
    growth: "+8% vs ant.",
    color: "#32A430",
    bg: "#32A43015",
    icon: <RuleIcon fontSize="medium" />,
  },
  {
    label: "Alta Demanda UTI",
    value: "9",
    growth: "Nivel Crítico",
    color: "#E2464C",
    bg: "#E2464C15",
    icon: <MonitorHeartIcon fontSize="medium" />,
  },
];

const mainModules = [
  {
    id: "recursos",
    title: "Configuración de Recursos y Plantillas",
    subtitle: "Motor de Inspecciones",
    description:
      "Configurador avanzado de tipologías, carga paramétrica de recursos humanos, servicios a inspeccionar y reglas de equipamiento.",
    path: "/clicsalud-backoffice/gestion-recursos",
    icon: <LocalHospitalIcon sx={{ fontSize: 48 }} />,
    color: "#0B85C4",
    bg: "linear-gradient(135deg, #0B85C4 0%, #086a9f 100%)",
  },
  {
    id: "roles",
    title: "Gestión de Roles y Control de Acceso",
    subtitle: "Seguridad Institucional",
    description:
      "Administración integral de usuarios, asignación de permisos para inspectores, auditores y responsables de establecimiento.",
    path: "/clicsalud-backoffice/asignar-rol",
    icon: <SecurityIcon sx={{ fontSize: 48 }} />,
    color: "#32A430",
    bg: "linear-gradient(135deg, #32A430 0%, #257e24 100%)",
  },
];

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  return (
    <Layout>
      <Box
        sx={{
          width: "100%",
          boxSizing: "border-box",
          p: { xs: 2, md: 3 },
          fontFamily: "Roboto, sans-serif",
        }}
      >
        {/* MAIN MODULES */}
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#1e293b", mb: 4 }}
        >
          Módulos del Sistema
        </Typography>

        <Grid container spacing={4}>
          {mainModules.map((mod) => (
            <Grid item xs={12} md={6} key={mod.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    borderColor: mod.color,
                    boxShadow: `0 20px 25px -5px ${mod.color}20, 0 8px 10px -6px ${mod.color}20`,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(mod.path)}
                  sx={{
                    p: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: mod.bg,
                        color: "#ffffff",
                        display: "flex",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    >
                      {mod.icon}
                    </Box>
                    <IconButton
                      sx={{ backgroundColor: "#f8fafc", color: mod.color }}
                    >
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="overline"
                      sx={{
                        color: mod.color,
                        fontWeight: 800,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      {mod.subtitle}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 900,
                        color: "#0f172a",
                        mb: 1,
                        lineHeight: 1.2,
                      }}
                    >
                      {mod.title}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{ color: "#64748b", flexGrow: 1, lineHeight: 1.6 }}
                  >
                    {mod.description}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <ModalHabilitacion open={openModal} onClose={() => setOpenModal(false)} />
    </Layout>
  );
};

export default DashboardAdmin;
