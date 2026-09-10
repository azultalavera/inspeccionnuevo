import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const SignatureModal = ({ open, step, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Estados para verificación de CUIL
  const [cuil, setCuil] = useState("");
  const [verifiedPerson, setVerifiedPerson] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (open && canvasRef.current) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = "#1e293b";
        // Limpiar por si acaso al abrir
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 100);
    }
    // Resetear verificación al cambiar de paso o cerrar
    if (!open) {
      setCuil("");
      setVerifiedPerson(null);
    }
  }, [open, step]);

  const handleVerifyCuil = () => {
    if (!cuil) return;
    setIsVerifying(true);
    // Simulación de búsqueda en padrón
    setTimeout(() => {
      setVerifiedPerson({
        nombre: "JUAN CARLOS",
        apellido: "PÉREZ",
        dni: cuil.slice(2, 10)
      });
      setIsVerifying(false);
    }, 1200);
  };

  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getPointerPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    if (e.touches) e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPointerPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
    if (e.touches) e.preventDefault();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      canvasRef.current.getContext("2d").closePath();
      setIsDrawing(false);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current;
    const name = step === 1 && verifiedPerson 
      ? `${verifiedPerson.nombre} ${verifiedPerson.apellido}` 
      : (step === 2 ? "ING. GUSTAVO SOSA" : "");
    onSave(canvas.toDataURL(), name);
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 8,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 950,
          textAlign: "center",
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          py: 3,
          color: "#1e293b",
          fontSize: "1.2rem",
        }}
      >
        {step === 1 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box sx={{ bgcolor: '#0ea5e9', color: 'white', px: 2, py: 0.5, borderRadius: 2, fontSize: '0.7rem', fontWeight: 900 }}>PASO 1 DE 2</Box>
            FIRMA: RESPONSABLE ESTABLECIMIENTO
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box sx={{ bgcolor: '#059669', color: 'white', px: 2, py: 0.5, borderRadius: 2, fontSize: '0.7rem', fontWeight: 900 }}>PASO 2 DE 2</Box>
            FIRMA: INSPECTOR INTERVINIENTE
          </Box>
        )}
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        {step === 1 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#64748b", mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
              Validación de Identidad
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <TextField
                fullWidth
                placeholder="Ingrese CUIL del responsable"
                value={cuil}
                onChange={(e) => setCuil(e.target.value)}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f1f5f9' } }}
              />
              <Button
                variant="contained"
                onClick={handleVerifyCuil}
                disabled={isVerifying || !cuil}
                sx={{ borderRadius: 3, fontWeight: 900, px: 3, bgcolor: '#1e293b' }}
              >
                {isVerifying ? <CircularProgress size={20} color="inherit" /> : "Verificar"}
              </Button>
            </Box>

            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 2, fontStyle: 'italic' }}>
              * El responsable debe contar con <Box component="span" sx={{ fontWeight: 800, color: '#0369a1' }}>CiDi Nivel 2</Box> para que la firma sea válida.
            </Typography>

            {verifiedPerson && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ color: '#0369a1' }} />
                <Box>
                  <Typography sx={{ fontWeight: 950, color: '#0369a1', fontSize: '0.9rem' }}>
                    {verifiedPerson.nombre} {verifiedPerson.apellido}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 700 }}>
                    DNI: {verifiedPerson.dni}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        <Box
          sx={{
            border: "3px dashed #cbd5e1",
            borderRadius: 6,
            height: 350,
            bgcolor: "#ffffff",
            cursor: "crosshair",
            touchAction: "none",
            overflow: "hidden",
            position: "relative",
            "&:hover": { borderColor: "#94a3b8" },
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        >
          <canvas
            ref={canvasRef}
            width={512} // Ajustar al ancho del dialogo aprox
            height={350}
            style={{ width: "100%", height: "100%" }}
          />
          <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>
              ESCRIBA SU FIRMA AQUÍ
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: 4,
          pt: 1,
          justifyContent: "space-between",
          bgcolor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 800,
            borderRadius: 3,
            color: "#64748b",
            px: 3,
          }}
        >
          Cancelar
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={clear}
            variant="outlined"
            color="error"
            sx={{
              fontWeight: 800,
              borderRadius: 3,
              px: 3,
              borderWidth: "2px",
              "&:hover": { borderWidth: "2px" },
            }}
          >
            Limpiar
          </Button>
          <Button
            onClick={save}
            variant="contained"
            sx={{
              fontWeight: 900,
              borderRadius: 3,
              px: 4,
              bgcolor: step === 1 ? "#0ea5e9" : "#059669",
              boxShadow: step === 1
                ? "0 4px 10px rgba(14,165,233,0.3)"
                : "0 4px 10px rgba(5,150,105,0.3)",
            }}
          >
            {step === 1 ? "Siguiente Firma" : "Confirmar Firma"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SignatureModal;
