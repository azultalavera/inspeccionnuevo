import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Paper,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PhotoViewer from "./PhotoViewer";

const MAX_PHOTOS = 5;

export default function CalidadImagenSection({
  fields = [],
  inspectorData = {},
  onChange,
}) {
  const fileInputRef = useRef(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fieldId = fields[0]?.id || "f-cal-img-fotos";

  // Extraer fotos actuales guardadas
  const rawData = inspectorData[fieldId];
  let photos = [];
  if (Array.isArray(rawData)) {
    photos = rawData;
  } else if (rawData && typeof rawData === "object" && Array.isArray(rawData.value)) {
    photos = rawData.value;
  } else if (typeof rawData === "string" && rawData.startsWith("[")) {
    try {
      photos = JSON.parse(rawData);
    } catch {
      photos = [];
    }
  }

  const isMaxReached = photos.length >= MAX_PHOTOS;

  // Disparar input de cámara / archivo
  const handleOpenPicker = () => {
    if (isMaxReached) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Compresión y guardado de archivos seleccionados
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = MAX_PHOTOS - photos.length;
    const filesToProcess = files.slice(0, availableSlots);

    const processedPhotos = await Promise.all(
      filesToProcess.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_DIM = 1200;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > MAX_DIM) {
                  height = Math.round((height * MAX_DIM) / width);
                  width = MAX_DIM;
                }
              } else {
                if (height > MAX_DIM) {
                  width = Math.round((width * MAX_DIM) / height);
                  height = MAX_DIM;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, width, height);
              const compressedUrl = canvas.toDataURL("image/jpeg", 0.82);
              resolve({
                id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                url: compressedUrl,
                name: file.name || `Foto_${photos.length + 1}.jpg`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              });
            };
            img.onerror = () => {
              resolve({
                id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                url: event.target.result,
                name: file.name || `Foto_${photos.length + 1}.jpg`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              });
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      })
    );

    const updated = [...photos, ...processedPhotos].slice(0, MAX_PHOTOS);
    if (onChange) {
      onChange(fieldId, updated);
    }
  };



  // Eliminar foto específica
  const handleRemovePhoto = (indexToRemove) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    if (onChange) {
      onChange(fieldId, updated);
    }
  };

  return (
    <Box sx={{ width: "100%", py: 1 }}>
      {/* Input nativo oculto para cámara/archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Barra superior de acciones */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          {/* Botón exacto al provisto en la referencia */}
          <Button
            variant="outlined"
            onClick={handleOpenPicker}
            disabled={isMaxReached}
            startIcon={
              <PhotoCamera
                sx={{
                  color: isMaxReached ? "#94a3b8" : "#374151",
                  fontSize: 20,
                }}
              />
            }
            sx={{
              bgcolor: "#ffffff",
              border: "1.5px solid #d1d5db",
              borderRadius: "10px",
              color: "#374151",
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.95rem",
              px: 2.5,
              py: 0.9,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease-in-out",
              "&:hover": {
                borderColor: "#9ca3af",
                bgcolor: "#f9fafb",
                boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
              },
              "&.Mui-disabled": {
                bgcolor: "#f8fafc",
                borderColor: "#e2e8f0",
                color: "#94a3b8",
              },
            }}
          >
            Abrir Cámara
          </Button>

          {/* Chip de contador de fotos */}
          <Chip
            label={`${photos.length} / ${MAX_PHOTOS} fotos`}
            size="medium"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: "8px",
              bgcolor: photos.length >= 2 ? "#ecfdf5" : "#f1f5f9",
              color: photos.length >= 2 ? "#059669" : "#475569",
              border: `1px solid ${photos.length >= 2 ? "#a7f3d0" : "#e2e8f0"}`,
            }}
          />

          {/* Chip de porcentaje */}
          <Chip
            label={photos.length >= 2 ? "100% Completado" : photos.length === 1 ? "50% (Falta 1 foto)" : "0%"}
            size="medium"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: "8px",
              bgcolor: photos.length >= 2 ? "#def7ed" : photos.length === 1 ? "#fef3c7" : "#f1f5f9",
              color: photos.length >= 2 ? "#065f46" : photos.length === 1 ? "#92400e" : "#64748b",
              border: `1px solid ${photos.length >= 2 ? "#a7f3d0" : photos.length === 1 ? "#fde68a" : "#e2e8f0"}`,
            }}
          />
        </Box>

        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
          {photos.length >= 2
            ? `100% completado (${photos.length} fotos cargadas). Podés agregar hasta ${MAX_PHOTOS} fotos si deseás.`
            : photos.length === 1
            ? "50% completado. Cargá 1 foto más para alcanzar el 100%."
            : "Se requieren 2 fotos para alcanzar el 100% (hasta un máximo de 5)."}
        </Typography>
      </Box>

      {/* Grid de Fotos / Estado Vacío */}
      {photos.length === 0 ? (
        <Paper
          elevation={0}
          onClick={handleOpenPicker}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: "14px",
            border: "2px dashed #cbd5e1",
            bgcolor: "#f8fafc",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "#0284c7",
              bgcolor: "#f0f9ff",
            },
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "#e2e8f0",
              color: "#475569",
              mb: 1.5,
            }}
          >
            <PhotoCamera sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5 }}>
            Sin fotografías de calidad de imagen
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 460, mx: "auto" }}>
            Hacé clic en <strong>«Abrir Cámara»</strong> para registrar fotos de control de calidad (con 2 fotos se alcanza el 100%, admitiendo hasta 5 fotos).
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 2,
          }}
        >
          {photos.map((item, index) => {
            const photoUrl = typeof item === "string" ? item : item.url;
            const photoName = typeof item === "object" ? item.name : `Foto ${index + 1}`;
            const photoTime = typeof item === "object" ? item.timestamp : "";

            return (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1.5px solid #e2e8f0",
                  bgcolor: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    "& .overlay-actions": {
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* Badge número de foto */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    bgcolor: "rgba(15, 23, 42, 0.75)",
                    backdropFilter: "blur(4px)",
                    color: "#ffffff",
                    px: 1,
                    py: 0.3,
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                  }}
                >
                  Foto {index + 1}
                </Box>

                {/* Botón eliminar en esquina superior derecha */}
                <Tooltip title="Eliminar foto">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(index);
                    }}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 3,
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      color: "#ef4444",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                      p: 0.6,
                      "&:hover": {
                        bgcolor: "#ef4444",
                        color: "#ffffff",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Contenedor de la imagen */}
                <Box
                  onClick={() => setSelectedPhoto(photoUrl)}
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: 145,
                    cursor: "pointer",
                    overflow: "hidden",
                    bgcolor: "#0f172a",
                  }}
                >
                  <Box
                    component="img"
                    src={photoUrl}
                    alt={photoName}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.04)",
                      },
                    }}
                  />

                  {/* Overlay al pasar el mouse con icono de zoom */}
                  <Box
                    className="overlay-actions"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(15, 23, 42, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.9)",
                        color: "#0f172a",
                        display: "flex",
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </Box>
                  </Box>
                </Box>

                {/* Pie de la tarjeta */}
                <Box sx={{ p: 1.2, borderTop: "1px solid #f1f5f9" }}>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      display: "block",
                      fontWeight: 700,
                      color: "#334155",
                      fontSize: "0.78rem",
                    }}
                  >
                    {photoName}
                  </Typography>
                  {photoTime && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "#94a3b8",
                        fontSize: "0.7rem",
                      }}
                    >
                      Capturada {photoTime}
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}

          {/* Slot de agregar adicional si no se alcanzó el tope de 5 */}
          {!isMaxReached && (
            <Paper
              elevation={0}
              onClick={handleOpenPicker}
              sx={{
                height: 195,
                borderRadius: "12px",
                border: "2px dashed #cbd5e1",
                bgcolor: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "#0284c7",
                  bgcolor: "#f0f9ff",
                  "& .add-icon": {
                    transform: "scale(1.1)",
                    color: "#0284c7",
                  },
                },
              }}
            >
              <AddPhotoAlternateIcon
                className="add-icon"
                sx={{
                  fontSize: 32,
                  color: "#94a3b8",
                  mb: 1,
                  transition: "all 0.2s ease",
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#475569" }}>
                Agregar foto
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem" }}>
                ({MAX_PHOTOS - photos.length} restante{MAX_PHOTOS - photos.length === 1 ? "" : "s"})
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Modal visor de foto ampliada */}
      <PhotoViewer
        open={Boolean(selectedPhoto)}
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </Box>
  );
}
