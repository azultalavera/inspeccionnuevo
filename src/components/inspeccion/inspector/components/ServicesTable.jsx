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
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";

const ServicesTable = ({ inspectorData, onChange, onOpenObs, serviciosEfector }) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden", mb: 2 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8fafc" }}>
            <TableCell
              sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", py: 2 }}
            >
              SERVICIO
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {serviciosEfector.map((srvName) => {
            const fieldId = `srv_auth_${srvName.replace(/\s+/g, "_")}`;
            const currentVal = inspectorData[fieldId] || {};
            const isObserved = currentVal.observado || false;
            const obsText = currentVal.obs || "";

            return (
              <TableRow key={srvName} hover sx={{ "&:last-child td": { border: 0 } }}>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b", py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {srvName}
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (!currentVal.observado) {
                          onChange(fieldId, { ...currentVal, observado: true });
                        }
                        onOpenObs(fieldId, `[SERVICIO] ${srvName}`, obsText);
                      }}
                      sx={{ color: (obsText || isObserved) ? "#0ea5e9" : "#cbd5e1" }}
                    >
                      {(obsText || isObserved) ? <ChatBubbleIcon sx={{ fontSize: 18 }} /> : <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ServicesTable;
