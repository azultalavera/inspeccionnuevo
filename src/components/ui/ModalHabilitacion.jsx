import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  NoteAdd as NoteAddIcon,
  HighlightOff as HighlightOffIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  borderRadius: "4px",
  boxShadow: 24,
  overflow: "hidden",
};

const ModalHabilitacion = ({ open, onClose }) => {
  const [tipologia, setTipologia] = React.useState("");

  const requisitos = {
    a: {
      // Consultorio
      tiene:
        "Sala de Procedimientos mínima, hasta 4 profesionales de una misma rama.",
      noTiene:
        "Unidad funcional, camas de internación, prácticas intervencionistas.",
    },
    b: {
      // Salud Ambulatoria
      tiene:
        "Sala de Procedimientos, Endoscopía y camas de Uso Transitorio (Observación).",
      noTiene: "Quirófanos de cualquier tipo, camas de Internación General.",
    },
    c: {
      // Cirugía Ambulatoria
      tiene: "Quirófano, Sala de Endoscopía y recuperación de Uso Transitorio.",
      noTiene:
        "Camas de Internación General, Terapia Intensiva (UTI), Neonatología.",
    },
    d: {
      // Clínica / Sanatorio
      tiene:
        "Quirófanos, Salas de Parto, Terapias (UTI/UCO/Neo), Shock Room e Internación General.",
      noTiene: "Ninguna.",
    },
    f: {
      // Geriátrico
      tiene: "Camas de Internación Prolongada y Sala de Procedimientos.",
      noTiene: "Quirófanos, UTI, UCO, UTIP, NEO.",
    },
    g: {
      // Diálisis
      tiene:
        "Sala de hemodiálisis, tratamiento de agua y área de recuperación..",
      noTiene:
        "Quirófanos, Internación General fuera de la específica del tratamiento.",
    },
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* HEADER INSTITUCIONAL */}
        <Box
          sx={{
            bgcolor: "#005596",
            color: "white",
            p: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <NoteAddIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Iniciar habilitación
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
            Elija la <strong>tipología</strong> del establecimiento para validar
            los requisitos:
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel id="tipologia-label">Tipología</InputLabel>
            <Select
              labelId="tipologia-label"
              value={tipologia}
              label="Tipología"
              onChange={(e) => setTipologia(e.target.value)}
              variant="standard"
            >
              <MenuItem value="a">Consultorio</MenuItem>
              <MenuItem value="b">Centro de Salud Ambulatoria</MenuItem>
              <MenuItem value="c">Centro Cirugía Ambulatoria</MenuItem>
              <MenuItem value="d">
                Clínica, Sanatorio u Hospital Privado
              </MenuItem>
              <MenuItem value="f">Geriátrico</MenuItem>
              <MenuItem value="g">Diálisis</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ color: "#555" }}>
            {" "}
          </Typography>

          {/* ALERTAS DE AYUDA TÉCNICA */}
          {tipologia && requisitos[tipologia] && (
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: "#555" }}>
                Antes de iniciar, revisar la información con respecto a la
                infraestructura requerida y la <strong>NO requerida</strong>{" "}
                correspondiente a dicha tipología para evitar que su trámite sea
                rechazado:{" "}
              </Typography>

              <Alert
                severity="success"
                variant="outlined"
                sx={{ bgcolor: "#f1f8e9", borderColor: "#a5d6a7" }}
              >
                <AlertTitle sx={{ fontWeight: "bold" }}>
                  INFRAESTRUCTURA REQUERIDA / PERMITIDA
                </AlertTitle>
                <Typography variant="caption" sx={{ color: "#1b5e20" }}>
                  {requisitos[tipologia].tiene}
                </Typography>
              </Alert>

              <Alert
                severity="error"
                variant="outlined"
                sx={{ bgcolor: "#ffebee", borderColor: "#ef9a9a" }}
              >
                <AlertTitle sx={{ fontWeight: "bold" }}>
                  RESTRICCIONES (NO DEBE POSEER)
                </AlertTitle>
                <Typography variant="caption" sx={{ color: "#b71c1c" }}>
                  {requisitos[tipologia].noTiene}
                </Typography>
              </Alert>
            </Stack>
          )}

          {/* BOTONES DE ACCIÓN */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              color="error"
              startIcon={<HighlightOffIcon />}
              sx={{ fontWeight: "bold" }}
            >
              CANCELAR
            </Button>
            <Button
              variant="contained"
              disabled={!tipologia}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: tipologia ? "#005596" : "#e0e0e0",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#003a66" },
              }}
            >
              INICIAR
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalHabilitacion;
