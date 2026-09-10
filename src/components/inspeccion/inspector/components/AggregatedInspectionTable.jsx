import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DomainIcon from "@mui/icons-material/Domain";
import BedIcon from "@mui/icons-material/Bed";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PeopleIcon from "@mui/icons-material/People";
import { Chip } from "@mui/material";
import { getCompletionStats, normalize } from "./utils";
import FieldRow from "./FieldRow";

const AggregatedInspectionTable = ({ category, services, inspectorData, infraEfector, equiposEfector, rrhhEfector, onChange, onOpenObs }) => {
  const isBeds = category === "SALAS Y CAMAS";

  const renderProgressBar = (stats) => {
    return (
      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
        <Chip
          label={`${stats.percent}%`}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: "0.7rem",
            bgcolor: stats.percent === 100 ? "#def7ed" : "#f1f5f9",
            color: stats.percent === 100 ? "#065f46" : "#64748b",
            height: 18,
            "& .MuiChip-label": { px: 1 }
          }}
        />
      </Box>
    );
  };

  const aggregatedFields = React.useMemo(() => {
    if (isBeds) {
      const items = [];
      const seen = new Set();
      Object.keys(infraEfector || {}).forEach(k => {
        const val = infraEfector[k];
        if (val > 0) {
          const uKey = k.toUpperCase();
          const type = (uKey.includes("CAMA") || uKey.includes("PUESTO")) ? "CAMA" : "SALA";
          items.push({
            id: `infra_literal_${k.replace(/\s+/g, "_")}`,
            name: k,
            label: k,
            _srvName: type === "SALA" ? "INFRAESTRUCTURA" : "CAPACIDAD",
            _type: type,
            declarado: val
          });
          seen.add(uKey);
        }
      });
      (services || []).forEach(srv => {
        const uSrv = srv.name.toUpperCase();
        if (!seen.has(uSrv)) {
          items.push({
            id: `srv_literal_${srv.id}`,
            name: srv.name,
            label: srv.name,
            _srvName: "SERVICIO",
            _type: "CAMA",
            declarado: infraEfector[srv.name] || 0
          });
        }
      });
      return items;
    }

    if (!services) return [];
    let fields = [];
    services.forEach(srv => {
      (srv.sections || []).forEach(sec => {
        const n = sec.name.toUpperCase();
        if (category === "EQUIPAMIENTO") {
          if (n.includes("EQUIP") || n.includes("INSTRUMENTAL")) {
            (sec.fields || []).forEach(f => {
              fields.push({ ...f, _srvName: srv.name, _type: "EQUIP" });
            });
          }
        } else if (category === "RECURSOS HUMANOS") {
          const isJefeSec = n.includes("JEFE");
          if (n.includes("RECURSOS") || n.includes("RRHH") || isJefeSec) {
            if (isJefeSec && (sec.fields || []).length === 0) {
              fields.push({
                id: `req_jefe_${srv.id}`,
                label: "JEFE DE SERVICIO",
                name: "JEFE DE SERVICIO",
                _srvName: srv.name,
                _type: "JEFES DE SERVICIO",
                isExtra: true
              });
            } else {
              (sec.fields || []).forEach(f => {
                const isJefeFld = normalize(f.label || f.name).includes("JEFE");
                fields.push({ 
                  ...f, 
                  _srvName: srv.name, 
                  _type: (isJefeSec || isJefeFld) ? "JEFES DE SERVICIO" : "RECURSOS HUMANOS", 
                  isExtra: true 
                });
              });
            }
          }
        }
      });
    });

    // Agregar RRHH declarados (Agrupados)
    if (category === "RECURSOS HUMANOS" && rrhhEfector) {
      const configuredKeys = new Set(fields.map(f => `${normalize(f._srvName)}|${normalize(f.label || f.name)}`));
      const activeSrvNames = new Set((services || []).map(s => normalize(s.name)));
      
      const extrasMap = {};

      rrhhEfector.forEach(r => {
        const isMatchedSrv = activeSrvNames.has(normalize(r.origen));
        const srvName = isMatchedSrv ? r.origen : "OTROS (FUERA DE SERVICIO)";
        
        const isJefe = r.isJefe || normalize(r.especialidad || "").includes("JEFE") || normalize(r.tipoPlantel || "").includes("JEFE");
        const label = isJefe ? "JEFE DE SERVICIO" : (r.especialidad || r.tipoPlantel);
        const key = `${normalize(srvName)}|${normalize(label)}`;
        
        if (!configuredKeys.has(key)) {
          if (!extrasMap[key]) {
            extrasMap[key] = {
              id: `extra_rrhh_${(srvName + "_" + label).replace(/\s+/g, "_")}`,
              label: label,
              name: label,
              especialidad: isJefe ? "" : r.especialidad,
              tipoPlantel: isJefe ? "" : r.tipoPlantel,
              _srvName: srvName,
              _originalSrv: r.origen,
              _type: isJefe ? "JEFES DE SERVICIO" : "RECURSOS HUMANOS",
              isExtra: true,
              isFromOtherSrv: !isMatchedSrv
            };
          }
        }
      });
      
      Object.values(extrasMap).forEach(f => fields.push(f));
    }

    return fields;
  }, [isBeds, services, infraEfector, category, rrhhEfector]);

  const otherEquipments = React.useMemo(() => {
    if (category !== "EQUIPAMIENTO" || !equiposEfector) return [];

    // Conjunto de pares (origen, equipamiento) que ya están en la configuración
    const configuredPairs = new Set();
    aggregatedFields.forEach(f => {
      configuredPairs.add(`${f._srvName}|${f.label || f.name}`);
    });

    // Filtrar equipos que no están en la configuración
    return equiposEfector.filter(e => !configuredPairs.has(`${e.origen}|${e.equipamiento}`));
  }, [category, equiposEfector, aggregatedFields]);

  const groups = React.useMemo(() => {
    if (isBeds) {
      return [
        { label: "SALAS", fields: aggregatedFields.filter(f => f._type === "SALA"), icon: <DomainIcon /> },
        { label: "CAMAS Y PUESTOS", fields: aggregatedFields.filter(f => f._type === "CAMA"), icon: <BedIcon /> }
      ];
    }

    if (category === "EQUIPAMIENTO") {
      const grouped = {};
      aggregatedFields.forEach(f => {
        const srvName = f._srvName || "GENERAL";
        if (!grouped[srvName]) grouped[srvName] = [];
        grouped[srvName].push(f);
      });

      const mainGroups = Object.entries(grouped).map(([srvName, fields]) => ({
        label: srvName,
        fields,
        icon: <MedicalServicesIcon />
      }));

      // Agregar grupo OTROS si hay equipos fuera de configuración
      if (otherEquipments.length > 0) {
        const otherFields = otherEquipments.map(e => ({
          id: `extra_eq_${e.id || (e.origen + "_" + e.equipamiento).replace(/\s+/g, "_")}`,
          label: e.equipamiento,
          name: e.equipamiento,
          _srvName: e.origen,
          _type: "EQUIP",
          declarado: e.actualQty || 1,
          isExtra: true
        }));

        mainGroups.push({
          label: "OTROS (FUERA DE CONFIGURACIÓN)",
          fields: otherFields,
          icon: <MedicalServicesIcon />,
          isExtra: true
        });
      }

      return mainGroups;
    }

    if (category === "RECURSOS HUMANOS") {
      const grouped = {};
      aggregatedFields.forEach(f => {
        const srvName = f._srvName || "GENERAL";
        if (!grouped[srvName]) grouped[srvName] = [];
        grouped[srvName].push(f);
      });

      return Object.entries(grouped).map(([srvName, fields]) => {
        const isExtraGroup = srvName.includes("OTROS");
        return {
          label: srvName,
          fields: fields.sort((a, b) => {
            const aLabel = normalize(a.label || a.name);
            const bLabel = normalize(b.label || b.name);
            const aIsJefe = a._type === "JEFES DE SERVICIO";
            const bIsJefe = b._type === "JEFES DE SERVICIO";
            
            if (aIsJefe && !bIsJefe) return -1;
            if (!aIsJefe && bIsJefe) return 1;
            
            const aIsMed = aLabel.includes("MEDIC");
            const bIsMed = bLabel.includes("MEDIC");
            if (aIsMed && !bIsMed) return -1;
            if (!aIsMed && bIsMed) return 1;
            
            return aLabel.localeCompare(bLabel);
          }),
          icon: <PeopleIcon />,
          isExtra: isExtraGroup
        };
      });
    }

    return [{ label: "EQUIPAMIENTO E INSTRUMENTAL", fields: aggregatedFields, icon: <MedicalServicesIcon /> }];
  }, [aggregatedFields, isBeds, category, otherEquipments]);

  if (isBeds || category === "EQUIPAMIENTO" || category === "RECURSOS HUMANOS") {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {groups.map((group) => (
          <Accordion
            key={group.label}
            defaultExpanded={!group.isExtra}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '16px !important',
              boxShadow: 'none',
              '&:before': { display: 'none' },
              ...(group.isExtra && {
                mt: 4,
                border: '1px dashed #cbd5e1',
                bgcolor: '#f8fafc'
              })
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#0ea5e9' }} />}
              sx={{
                bgcolor: group.isExtra ? '#f1f5f9' : '#f8fafc',
                borderRadius: '16px',
                "& .MuiAccordionSummary-content": {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  pr: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {group.icon && React.cloneElement(group.icon, { sx: { color: group.isExtra ? '#94a3b8' : '#64748b', fontSize: 20 } })}
                <Typography sx={{
                  fontWeight: 900,
                  color: group.isExtra ? '#64748b' : '#1e293b',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}>
                  {group.label}
                </Typography>
              </Box>
              {renderProgressBar(getCompletionStats(group.fields, inspectorData))}
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc", borderTop: '1px solid #e2e8f0' }}>
                    <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.75rem", py: 1.5, pl: 3 }}>
                      {category === "RECURSOS HUMANOS" ? "Elemento a Inspeccionar" : (group.isExtra ? "ORIGEN / EQUIPAMIENTO" : (category === "EQUIPAMIENTO" ? "EQUIPAMIENTO" : "ELEMENTO"))}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.75rem" }}>DECLARADO (TRÁMITE)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.75rem" }}>DECLARADO (INSPECCIÓN)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.fields.map((field) => (
                    <FieldRow
                      key={field.id}
                      field={field}
                      currentSrvName={field._srvName}
                      inspectorData={inspectorData}
                      infraEfector={infraEfector}
                      equiposEfector={equiposEfector}
                      rrhhEfector={rrhhEfector}
                      onChange={onChange}
                      onOpenObs={onOpenObs}
                    />
                  ))}
                  {group.fields.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#94a3b8', fontStyle: 'italic' }}>
                        No hay elementos declarados en esta categoría
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8fafc" }}>
            <TableCell sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem", py: 2 }}>ELEMENTO / SERVICIO</TableCell>
            <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>DECLARADO (TRÁMITE)</TableCell>
            <TableCell align="center" sx={{ fontWeight: 900, color: "#0369a1", fontSize: "0.80rem" }}>DECLARADO (INSPECCIÓN)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group) => (
            <React.Fragment key={group.label}>
              {group.fields.length > 0 && (
                <>
                  <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 900, color: "#475569", py: 1, fontSize: "0.75rem", letterSpacing: 1 }}>
                      {group.label}
                    </TableCell>
                  </TableRow>
                  {group.fields.map((field) => (
                    <FieldRow
                      key={field.id}
                      field={field}
                      currentSrvName={field._srvName}
                      inspectorData={inspectorData}
                      infraEfector={infraEfector}
                      equiposEfector={equiposEfector}
                      rrhhEfector={rrhhEfector}
                      onChange={onChange}
                      onOpenObs={onOpenObs}
                    />
                  ))}
                </>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AggregatedInspectionTable;
