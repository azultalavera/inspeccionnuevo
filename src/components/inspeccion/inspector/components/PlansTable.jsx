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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";

const PlansTable = ({ inspectorData, onChange, onOpenViewer, onOpenObs }) => {
  const plansData = [
    { category: "Plano General", files: ["plano1.pdf", "plano2.pdf"] },
    { category: "Plano General - Anexo", files: ["plano3.pdf"] },
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
          {plansData.map((group) => (
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
              {group.files.map((file) => {
                const fieldId = `plan_auth_${file.replace(".", "_")}`;
                const currentVal = inspectorData[fieldId] || {};
                const isObserved = currentVal.observado || false;
                const obsText = currentVal.obs || "";

                return (
                  <TableRow key={file} hover sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b", py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {file}
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (!currentVal.observado) {
                              onChange(fieldId, { ...currentVal, observado: true });
                            }
                            onOpenObs(fieldId, `[PLANO] ${file}`, obsText);
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
                        onClick={() => onOpenViewer(file)}
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
