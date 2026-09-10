import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

const RevisionActa = ({ efectorResponses = {}, onValidate = () => {} } = {}) => {
  // Estado local para manejar las validaciones interactivas
  const [statuses, setStatuses] = React.useState({
    "Quirófanos": "PENDIENTE",
    "Camas Uso Transitorio": "PENDIENTE",
    "Libro de Quejas": "PENDIENTE",
    "Plan de Evacuación": "PENDIENTE",
    "Habilitación Bomberos": "PENDIENTE",
    "Blindaje Plomo": "PENDIENTE",
    "Dosimetría": "PENDIENTE",
    "Señalética": "PENDIENTE",
    "Plano Arquitectura": "PENDIENTE",
    "Contrato Residuos": "PENDIENTE",
  });

  const [emplazarDialog, setEmplazarDialog] = React.useState(false);
  const [diasEmplazamiento, setDiasEmplazamiento] = React.useState("");
  const [customValue, setCustomValue] = React.useState("");
  const [customUnit, setCustomUnit] = React.useState("días");
  const [comentarios, setComentarios] = React.useState({});
  const [commentDialog, setCommentDialog] = React.useState({ open: false, id: null, text: "" });

  const getFechaVencimiento = (plazoStr) => {
    if (!plazoStr) return null;
    const parts = plazoStr.trim().split(" ");
    if (parts.length < 2) return null;
    const amount = parseInt(parts[0], 10);
    const unit = parts[1].toLowerCase();
    
    if (isNaN(amount)) return null;

    const fecha = new Date();
    if (unit.startsWith("hora")) {
      fecha.setHours(fecha.getHours() + amount);
    } else if (unit.startsWith("día") || unit.startsWith("dia")) {
      fecha.setDate(fecha.getDate() + amount);
    } else if (unit.startsWith("semana")) {
      fecha.setDate(fecha.getDate() + (amount * 7));
    } else {
      return null;
    }

    const feriados = [
      "01-01", "02-16", "02-17", "03-24", "04-02", "04-03", "05-01", "05-25", 
      "06-17", "06-20", "07-09", "08-17", "10-12", "11-20", "12-08", "12-25"
    ];

    const isWeekend = fecha.getDay() === 0 || fecha.getDay() === 6;
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const dateStr = `${month}-${day}`;
    const isFeriado = feriados.includes(dateStr);

    return { fecha, isWeekend, isFeriado };
  };

  const vencimiento = getFechaVencimiento(diasEmplazamiento);

  const handleUpdateStatus = (elemento, newStatus) => {
    setStatuses(prev => ({ ...prev, [elemento]: newStatus }));
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "VALIDADO": return <Chip label="VALIDADO" size="small" color="success" sx={{ fontWeight: 900, fontSize: '0.6rem' }} />;
      case "RECHAZADO": return <Chip label="RECHAZADO" size="small" color="error" sx={{ fontWeight: 900, fontSize: '0.6rem' }} />;
      default: return <Chip label="PENDIENTE" size="small" sx={{ fontWeight: 900, fontSize: '0.6rem', bgcolor: '#fef3c7', color: '#b45309' }} />;
    }
  };

  const irregularidadesTramite = [
    { id: "Quirófanos", seccion: "CIRUGÍA", elemento: "Quirófanos", declarado: 11, constatado: 5, obs: "IRREGULARIDAD: No se constatan 6 quirófanos." },
    { id: "Camas Uso Transitorio", seccion: "INTERNACIÓN", elemento: "Camas Uso Transitorio", declarado: 5, constatado: 9, obs: "RECTIFICACIÓN: Excedente de 4 camas." },
  ];

  const obsGenerales = [
    { id: "Libro de Quejas", seccion: "REGISTROS", elemento: "Libro de Quejas", obs: "No se presenta libro de quejas foliado." },
    { id: "Plan de Evacuación", seccion: "REVISIÓN", elemento: "Plan de Evacuación", obs: "Vencimiento 10/03/2026." },
    { id: "Habilitación Bomberos", seccion: "REVISIÓN", elemento: "Habilitación Bomberos", obs: "Certificado vencido Enero 2026." },
    { id: "Blindaje Plomo", seccion: "RADIOFÍSICA", elemento: "Radiofísica: Blindaje", obs: "Falta blindaje en puerta Rayos X." },
    { id: "Dosimetría", seccion: "RADIOFÍSICA", elemento: "Radiofísica: Dosimetría", obs: "Registros incompletos." },
    { id: "Señalética", seccion: "RADIOFÍSICA", elemento: "Radiofísica: Señalética", obs: "Falta luz roja de advertencia." }
  ];

  const documentosObservados = [
    { id: "Plano Arquitectura", seccion: "ARQUITECTURA", elemento: "Plano de Arquitectura", obs: "Falta firma de profesional interviniente." },
    { id: "Contrato Residuos", seccion: "DOCUMENTACIÓN", elemento: "Contrato Recolección Residuos", obs: "Contrato vencido." },
  ];

  const isAllValidado = Object.values(statuses).every(s => s === "VALIDADO");
  const hasRechazado = Object.values(statuses).some(s => s === "RECHAZADO");

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: '#f8fafc', minHeight: '100%' }}>

      {/* Cuadro de Conclusión General (Estilo Acta 1/3) */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #FFE0B2', bgcolor: '#FFF9E6', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <DescriptionIcon sx={{ color: '#92400e', mt: 0.5 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 950, color: '#92400e', mb: 0.5, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            RESUMEN DE OBSERVACIONES (ACTA DE REVISIÓN)
          </Typography>
          <Typography variant="body1" sx={{ color: '#92400e', fontWeight: 600, lineHeight: 1.6, fontSize: '0.95rem' }}>
            "Se detectaron múltiples irregularidades en la documentación técnica y en la infraestructura de los servicios críticos. El efector ha respondido a los emplazamientos y se procede a la validación final."
          </Typography>
        </Box>
      </Paper>

      {/* SECCIÓN 1: DATOS GENERALES */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ bgcolor: '#0ea5e9', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <InfoIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#1e293b", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>
          OBSERVACIONES DATOS GENERALES
        </Typography>
      </Box>

      <Paper sx={{ p: 0, mb: 5, borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>ORIGEN</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>CATEGORÍA</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>OBSERVACIONES</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>ESTADO</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {obsGenerales.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Chip label={row.seccion} size="small" sx={{ fontWeight: 900, fontSize: '0.6rem', height: 18 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{row.elemento}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: '#475569' }}>{row.obs}</TableCell>
                  <TableCell>{getStatusChip(statuses[row.id])}</TableCell>
                  <TableCell align="center">
                     <Stack direction="row" spacing={1} justifyContent="center">
                        <Button 
                          size="small" 
                          variant={statuses[row.id] === "VALIDADO" ? "contained" : "outlined"} 
                          color="success" 
                          onClick={() => handleUpdateStatus(row.id, "VALIDADO")}
                          sx={{ fontSize: '0.65rem', fontWeight: 900, borderRadius: 2 }}
                        >
                          VALIDAR
                        </Button>
                        <Button 
                          size="small" 
                          variant={statuses[row.id] === "RECHAZADO" ? "contained" : "outlined"} 
                          color="error" 
                          onClick={() => handleUpdateStatus(row.id, "RECHAZADO")}
                          sx={{ fontSize: '0.65rem', fontWeight: 900, borderRadius: 2 }}
                        >
                          RECHAZAR
                        </Button>
                        {statuses[row.id] === "RECHAZADO" && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setCommentDialog({ open: true, id: row.id, text: comentarios[row.id] || "" })}
                            sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5, borderColor: '#bfdbfe', color: '#3b82f6' }}
                          >
                            <ChatBubbleIcon sx={{ fontSize: 18 }} />
                          </Button>
                        )}
                     </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* SECCIÓN 2: DATOS DEL TRÁMITE */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ bgcolor: '#ef4444', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ErrorIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#1e293b", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>
          IRREGULARIDADES DATOS DEL TRÁMITE
        </Typography>
      </Box>
      
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", mb: 1, ml: 1, fontSize: '0.8rem' }}>
        Diferencias Constatadas
      </Typography>
      <Paper sx={{ p: 0, mb: 3, borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>ORIGEN</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>CATEGORÍA</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>OBSERVACIONES</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>ESTADO</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {irregularidadesTramite.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Chip label={row.seccion} size="small" sx={{ fontWeight: 900, fontSize: '0.6rem', height: 18, bgcolor: '#f1f5f9', color: '#475569', textTransform: 'uppercase' }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{row.elemento}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: '#475569' }}>
                    DECLARADO: {row.declarado}, OBSERVADO: {row.constatado}
                  </TableCell>
                  <TableCell>{getStatusChip(statuses[row.id])}</TableCell>
                  <TableCell align="center">
                     <Stack direction="row" spacing={1} justifyContent="center">
                        <Button 
                          size="small" 
                          variant={statuses[row.id] === "VALIDADO" ? "contained" : "outlined"} 
                          color="success" 
                          onClick={() => handleUpdateStatus(row.id, "VALIDADO")}
                          sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5 }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 18 }} />
                        </Button>
                        <Button 
                          size="small" 
                          variant={statuses[row.id] === "RECHAZADO" ? "contained" : "outlined"} 
                          color="error" 
                          onClick={() => handleUpdateStatus(row.id, "RECHAZADO")}
                          sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5 }}
                        >
                          <ErrorIcon sx={{ fontSize: 18 }} />
                        </Button>
                     </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", mb: 1, ml: 1, fontSize: '0.8rem' }}>
        Documentos Observados
      </Typography>
      <Paper sx={{ p: 0, mb: 3, borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>ORIGEN</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>CATEGORÍA</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>OBSERVACIONES</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>ESTADO</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#64748b' }}>ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentosObservados.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Chip label={row.seccion} size="small" sx={{ fontWeight: 900, fontSize: '0.6rem', height: 18, bgcolor: '#f1f5f9', color: '#475569', textTransform: 'uppercase' }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{row.elemento}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: '#475569' }}>{row.obs}</TableCell>
                  <TableCell>{getStatusChip(statuses[row.id])}</TableCell>
                  <TableCell align="center">
                     <Stack direction="row" spacing={1} justifyContent="center">
                        <Button 
                          size="small" 
                          variant={statuses[row.id] === "VALIDADO" ? "contained" : "outlined"} 
                          color="success" 
                          onClick={() => handleUpdateStatus(row.id, "VALIDADO")}
                          sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5 }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 18 }} />
                        </Button>
                        <Button 
                          size="small" 
                          variant={statuses[row.id] === "RECHAZADO" ? "contained" : "outlined"} 
                          color="error" 
                          onClick={() => handleUpdateStatus(row.id, "RECHAZADO")}
                          sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5 }}
                        >
                          <ErrorIcon sx={{ fontSize: 18 }} />
                        </Button>
                     </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={commentDialog.open}
        onClose={() => setCommentDialog({ ...commentDialog, open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Agregar comentario al rechazo
          <IconButton onClick={() => setCommentDialog({ ...commentDialog, open: false })} size="small">
            <ErrorIcon sx={{ display: 'none' }} /> {/* placeholder for close icon since it's not imported */}
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Escriba aquí la aclaración del rechazo para que el efector la vea..."
            value={commentDialog.text}
            onChange={(e) => setCommentDialog({ ...commentDialog, text: e.target.value })}
            sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCommentDialog({ ...commentDialog, open: false })} sx={{ fontWeight: 800 }}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setComentarios(prev => ({ ...prev, [commentDialog.id]: commentDialog.text }));
              setCommentDialog({ ...commentDialog, open: false });
            }}
            sx={{ fontWeight: 900, borderRadius: 2 }}
          >
            Guardar Comentario
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={emplazarDialog}
        onClose={() => setEmplazarDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ bgcolor: '#d1fae5', color: '#059669', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 20 }} />
          </Box>
          Opciones de Emplazamiento
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#475569', mb: 3 }}>
            Seleccione el plazo otorgado al efector para regularizar las observaciones.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            {[
              { label: "24", sub: "horas", value: "24 horas" },
              { label: "48", sub: "horas", value: "48 horas" },
              { label: "5", sub: "días", value: "5 días" },
              { label: "10", sub: "días", value: "10 días" },
              { label: "15", sub: "días", value: "15 días" },
            ].map((option) => (
              <Button
                key={option.value}
                variant={diasEmplazamiento === option.value && !customValue ? "contained" : "outlined"}
                color={option.sub === "horas" ? "warning" : "primary"}
                onClick={() => {
                  setDiasEmplazamiento(option.value);
                  setCustomValue("");
                }}
                sx={{
                  width: 65,
                  height: 65,
                  borderRadius: '50%',
                  minWidth: 0,
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  lineHeight: 1.1,
                  display: 'flex',
                  flexDirection: 'column',
                  textTransform: 'none'
                }}
              >
                {option.label}
                <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                  {option.sub}
                </Typography>
              </Button>
            ))}
          </Stack>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
            O ingrese un plazo personalizado:
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              placeholder="Ej: 30"
              value={customValue}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setCustomValue(val);
                setDiasEmplazamiento(val ? `${val} ${customUnit}` : "");
              }}
              sx={{
                width: 100,
                "& .MuiOutlinedInput-root": { borderRadius: 3 }
              }}
            />
            <ToggleButtonGroup
              value={customUnit}
              exclusive
              onChange={(e, newUnit) => {
                if (newUnit) {
                  setCustomUnit(newUnit);
                  if (customValue) {
                     setDiasEmplazamiento(`${customValue} ${newUnit}`);
                  }
                }
              }}
              sx={{
                "& .MuiToggleButtonGroup-grouped": {
                   borderRadius: 3,
                },
                "& .MuiToggleButton-root": {
                   fontWeight: 800,
                   px: 2,
                   textTransform: 'none'
                }
              }}
            >
              <ToggleButton value="horas">Horas</ToggleButton>
              <ToggleButton value="días">Días</ToggleButton>
              <ToggleButton value="semanas">Semanas</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {vencimiento && (
            <Box sx={{ mt: 3, p: 1.5, bgcolor: vencimiento.isWeekend || vencimiento.isFeriado ? '#fff1f2' : '#f0fdf4', borderRadius: 2, border: '1px solid', borderColor: vencimiento.isWeekend || vencimiento.isFeriado ? '#fecdd3' : '#bbf7d0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {vencimiento.isWeekend || vencimiento.isFeriado ? <ReportProblemIcon sx={{ color: '#e11d48', fontSize: 24 }} /> : <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 24 }} />}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: vencimiento.isWeekend || vencimiento.isFeriado ? '#be123c' : '#16a34a' }}>
                  Vencimiento: {vencimiento.fecha.toLocaleString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })} hs.
                </Typography>
                {(vencimiento.isWeekend || vencimiento.isFeriado) && (
                  <Typography variant="caption" sx={{ color: '#e11d48', fontWeight: 600 }}>
                    ⚠️ Atención: La fecha cae en {vencimiento.isWeekend ? 'fin de semana' : ''} {vencimiento.isWeekend && vencimiento.isFeriado ? 'y ' : ''}{vencimiento.isFeriado ? 'feriado' : ''}.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setEmplazarDialog(false)} 
            sx={{ fontWeight: 800, color: '#64748b' }}
          >
            Volver
          </Button>
          <Button 
            variant="contained"
            color="success"
            disabled={!diasEmplazamiento}
            onClick={() => {
              setEmplazarDialog(false);
            }}
            sx={{ fontWeight: 900, borderRadius: 2, px: 3, py: 1, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
          >
            Finalizar y Aprobar
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 6, mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="contained" 
          color="error" 
          disabled={!hasRechazado}
          onClick={() => setEmplazarDialog(true)}
          sx={{ fontWeight: 900, px: 4, py: 1.5, borderRadius: 3, boxShadow: hasRechazado ? '0 4px 14px 0 rgba(239, 68, 68, 0.39)' : 'none' }}
        >
          EMPLAZAR
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          disabled={!isAllValidado}
          sx={{ fontWeight: 900, px: 4, py: 1.5, borderRadius: 3, boxShadow: isAllValidado ? '0 4px 14px 0 rgba(14, 165, 233, 0.39)' : 'none' }}
        >
          INICIAR NUEVA ACTA
        </Button>
      </Box>

    </Box>
  );
};

export default RevisionActa;
