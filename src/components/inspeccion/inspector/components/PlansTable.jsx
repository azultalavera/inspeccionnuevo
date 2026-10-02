import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";

const plansDataActa2 = [
  {
    category: "Plano General",
    files: [
      { name: "plano1.pdf", tipo: "Original" },
      { name: "planoReemplazo.pdf", tipo: "Respuesta Emplazamiento" },
      { name: "plano2.pdf", tipo: "Original" },
    ],
  },
  {
    category: "Plano General - Anexo",
    files: [
      { name: "plano3.pdf", tipo: "Original" },
    ],
  },
];

const plansDataActa1 = [
  {
    category: "Plano General",
    files: [
      {
        name: "plano1.pdf",
        tipo: "OBSERVADO",
        obs: "No cumple ancho reglamentario de pasillos de evacuación (medido in situ 1.80m vs 2.40m reglamentarios según Ley 9847). Falta plano visado conforme a obra.",
      },
    ],
  },
];

const PlansTable = ({
  inspectorData = {},
  onChange,
  onOpenViewer,
  onOpenObs,
  isActa1 = false,
}) => {
  const data = isActa1 ? plansDataActa1 : plansDataActa2;

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8fafc" }}>
            <TableCell
              sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", py: 2 }}
            >
              DOCUMENTO
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}
            >
              VISUALIZAR DOCUMENTO
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((group) => (
            <React.Fragment key={group.category}>
              <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                <TableCell
                  colSpan={2}
                  sx={{
                    fontWeight: 900,
                    color: "#475569",
                    py: 1,
                    fontSize: "0.85rem",
                    letterSpacing: "0.025em",
                  }}
                >
                  {group.category}
                </TableCell>
              </TableRow>
              {group.files.map((fileObj) => {
                const fileName = fileObj.name;
                const fieldId = `plan_auth_${fileName.replace(".", "_")}`;
                const currentVal = inspectorData[fieldId] || {};
                const isObserved = fileObj.tipo === "OBSERVADO" || currentVal.observado || false;
                const obsText = fileObj.obs || currentVal.obs || "";
                const isEmplazamiento = fileObj.tipo === "Respuesta Emplazamiento";
                const isObsChip = fileObj.tipo === "OBSERVADO";

                return (
                  <TableRow key={fileName} hover sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b", py: 1.5 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>{fileName}</span>

                          <Chip
                            label={fileObj.tipo}
                            size="small"
                            sx={{
                              bgcolor: isObsChip
                                ? "#fee2e2"
                                : isEmplazamiento
                                ? "#dcfce7"
                                : "#f1f5f9",
                              color: isObsChip
                                ? "#b91c1c"
                                : isEmplazamiento
                                ? "#15803d"
                                : "#475569",
                              fontWeight: 800,
                              fontSize: "0.72rem",
                              height: 22,
                              border: isObsChip
                                ? "1px solid #fca5a5"
                                : isEmplazamiento
                                ? "1px solid #86efac"
                                : "1px solid #cbd5e1",
                            }}
                          />

                          <IconButton
                            size="small"
                            onClick={() => {
                              if (onChange && !currentVal.observado) {
                                onChange(fieldId, { ...currentVal, observado: true });
                              }
                              if (onOpenObs) {
                                onOpenObs(fieldId, `[PLANO] ${fileName}`, obsText);
                              }
                            }}
                            sx={{ color: obsText || isObserved ? "#0ea5e9" : "#cbd5e1" }}
                          >
                            {obsText || isObserved ? (
                              <ChatBubbleIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </Box>

                        {/* Detalle de observación en Acta 1 */}
                        {isObsChip && fileObj.obs && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#b91c1c",
                              bgcolor: "#fef2f2",
                              p: 1,
                              borderRadius: 1.5,
                              borderLeft: "3px solid #ef4444",
                              fontSize: "0.75rem",
                              lineHeight: 1.4,
                              mt: 0.5,
                            }}
                          >
                            <strong>Observación:</strong> {fileObj.obs}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        sx={{ color: "#0ea5e9" }}
                        onClick={() => onOpenViewer && onOpenViewer(fileName)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PlansTable;
