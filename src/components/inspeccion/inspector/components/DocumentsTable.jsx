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
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";

const DocumentsTable = ({ inspectorData, onChange, onOpenViewer, onOpenObs }) => {
  const docGroups = [
    {
      category: "Documentación Institucional",
      files: [
        "Tasa retributiva de servicios",
        "Constancia ARCA",
        "Certificado registro deudores alimentarios morosos"
      ]
    },
    {
      category: "Habilitaciones y Seguridad",
      files: [
        "Certificado de bomberos",
        "Plan de evacuación vigente"
      ]
    }
  ];

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
              DOCUMENTACIÓN REQUERIDA
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}
            >
              VISUALIZAR
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {docGroups.map((group) => (
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
              {group.files.map((doc) => {
                const fieldId = `doc_auth_${doc.replace(/\s+/g, "_")}`;
                const currentVal = inspectorData[fieldId] || {};
                const isObserved = currentVal.observado || false;
                const obsText = currentVal.obs || "";

                return (
                  <TableRow key={doc} hover sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.85rem" }}>
                          {doc}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (!currentVal.observado) {
                              onChange(fieldId, { ...currentVal, observado: true });
                            }
                            onOpenObs(fieldId, `[DOC] ${doc}`, obsText);
                          }}
                          sx={{ color: (obsText || isObserved) ? "#0ea5e9" : "#cbd5e1" }}
                        >
                          {(obsText || isObserved) ? <ChatBubbleIcon sx={{ fontSize: 18 }} /> : <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        sx={{ color: "#0ea5e9" }}
                        onClick={() => onOpenViewer(`${doc.replace(/\s+/g, "_")}.pdf`)}
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

export default DocumentsTable;
