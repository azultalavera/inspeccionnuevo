import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from "@mui/material";

const ObservationDialog = ({ open, label, value, onClose, onSave }) => {
  const [text, setText] = useState(value);

  // Sincronizar texto cuando se abre para un campo nuevo
  useEffect(() => {
    setText(value);
  }, [value, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 4, p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 900, color: "#1e293b", pb: 1 }}>
        Observación: {label}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 2, fontWeight: 500 }}>
          Ingrese el detalle de la observación encontrada para este ítem.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={5}
          variant="outlined"
          placeholder="Escriba el detalle aquí..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              bgcolor: "#f8fafc",
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          sx={{ fontWeight: 700, color: "#64748b", textTransform: "none" }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave(text)}
          sx={{
            borderRadius: 3,
            fontWeight: 800,
            textTransform: "none",
            px: 4,
            bgcolor: "#0ea5e9",
            "&:hover": { bgcolor: "#0284c7" }
          }}
        >
          Guardar Observación
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ObservationDialog;
