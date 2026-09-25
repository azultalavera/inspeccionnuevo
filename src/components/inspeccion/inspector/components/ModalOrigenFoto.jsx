import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraRounded from "@mui/icons-material/PhotoCameraRounded";
import AddPhotoAlternateRounded from "@mui/icons-material/AddPhotoAlternateRounded";

export default function ModalOrigenFoto({
  open,
  onClose,
  onSelectCamera,
  onSelectGallery,
  title = "Adjuntar fotografía",
  description = "Seleccione cómo desea agregar la evidencia fotográfica:",
}) {
  const handleCamera = () => {
    onClose();
    if (onSelectCamera) onSelectCamera();
  };

  const handleGallery = () => {
    onClose();
    if (onSelectGallery) onSelectGallery();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          pt: 1.5,
          px: 2,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#1e293b" }}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#94a3b8",
            "&:hover": { color: "#475569", bgcolor: "#f1f5f9" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1.5 }}>
        <Typography
          variant="body2"
          sx={{ color: "#64748b", fontWeight: 500, mb: 2.5 }}
        >
          {description}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
          {/* Opción 1: Sacar foto con cámara */}
          <Paper
            elevation={0}
            onClick={handleCamera}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1.5px solid #e2e8f0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.18s ease-in-out",
              bgcolor: "#ffffff",
              "&:hover": {
                borderColor: "#0284c7",
                bgcolor: "#f0f9ff",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.08)",
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0284c7",
                flexShrink: 0,
              }}
            >
              <PhotoCameraRounded sx={{ fontSize: 26 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                Sacar foto
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, display: "block" }}>
                Tomar una fotografía con la cámara
              </Typography>
            </Box>
          </Paper>

          {/* Opción 2: Adjuntar imagen desde archivos/galería */}
          <Paper
            elevation={0}
            onClick={handleGallery}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1.5px solid #e2e8f0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.18s ease-in-out",
              bgcolor: "#ffffff",
              "&:hover": {
                borderColor: "#059669",
                bgcolor: "#f0fdf4",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(5, 150, 105, 0.08)",
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#059669",
                flexShrink: 0,
              }}
            >
              <AddPhotoAlternateRounded sx={{ fontSize: 26 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                Adjuntar imagen
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, display: "block" }}>
                Seleccionar archivo desde la galería o dispositivo
              </Typography>
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1.5, pt: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 700,
            color: "#64748b",
            textTransform: "none",
            borderRadius: 2,
            px: 2,
            "&:hover": { bgcolor: "#f1f5f9" },
          }}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
