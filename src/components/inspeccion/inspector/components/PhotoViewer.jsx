import React from "react";
import {
  Dialog,
  Box,
  IconButton,
} from "@mui/material";
import Close from "@mui/icons-material/Close";

const PhotoViewer = ({ open, photo, onClose }) => {
  if (!photo) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, overflow: 'hidden' }
      }}
    >
      <Box sx={{ position: 'relative', bgcolor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 16, right: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
        >
          <Close />
        </IconButton>
        <img
          src={photo}
          alt="Evidencia de inspección"
          style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
        />
      </Box>
    </Dialog>
  );
};

export default PhotoViewer;
