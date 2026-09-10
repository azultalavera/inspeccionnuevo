import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const FileViewerModal = ({ file, onClose }) => {
  if (!file) return null;

  const filePath = `/src/assets/archivos/planos/${file}`;

  return (
    <Dialog
      open={!!file}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 4,
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          py: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, color: "#1e293b" }}>
          VISUALIZADOR: {file}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            title="Abrir en nueva pestaña"
            onClick={() => window.open(filePath, "_blank")}
          >
            <OpenInNewIcon />
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: "#64748b" }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, flexGrow: 1, overflow: "hidden" }}>
        <iframe
          src={filePath}
          title="File Viewer"
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerModal;
