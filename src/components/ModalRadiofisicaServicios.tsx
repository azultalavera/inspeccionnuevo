import React, { useState, useEffect } from "react";
import {
  RADIOFISICA_CATALOG,
  type TipoServicioRadiofisica,
  type SubservicioRadiofisica,
} from "../data/radiofisicaConfig";
import type { Tramite } from "../data/mockData";

interface ModalRadiofisicaServiciosProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (tipoServicio: string, subservicio: string) => void;
  tramite?: Tramite | null;
  initialTipo?: string;
  initialSubservicio?: string;
}

export default function ModalRadiofisicaServicios({
  open,
  onClose,
  onConfirm,
  tramite,
  initialTipo,
  initialSubservicio,
}: ModalRadiofisicaServiciosProps) {
  const [selectedTipoId, setSelectedTipoId] = useState<string>("rayos-x");
  const [selectedSubId, setSelectedSubId] = useState<string>("rad-convencional-simple");

  useEffect(() => {
    if (initialTipo) {
      const foundTipo = RADIOFISICA_CATALOG.find(
        (t) => t.nombre.toLowerCase() === initialTipo.toLowerCase() || t.id === initialTipo.toLowerCase()
      );
      if (foundTipo) {
        setSelectedTipoId(foundTipo.id);
        if (initialSubservicio) {
          const foundSub = foundTipo.subservicios.find(
            (s) => s.nombre.toLowerCase() === initialSubservicio.toLowerCase() || s.id === initialSubservicio.toLowerCase()
          );
          if (foundSub) {
            setSelectedSubId(foundSub.id);
            return;
          }
        }
        setSelectedSubId(foundTipo.subservicios[0]?.id || "");
      }
    }
  }, [initialTipo, initialSubservicio, open]);

  if (!open) return null;

  const currentTipo = RADIOFISICA_CATALOG.find((t) => t.id === selectedTipoId) || RADIOFISICA_CATALOG[0];
  const currentSub = currentTipo.subservicios.find((s) => s.id === selectedSubId) || currentTipo.subservicios[0];

  const handleSelectTipo = (tipo: TipoServicioRadiofisica) => {
    setSelectedTipoId(tipo.id);
    setSelectedSubId(tipo.subservicios[0]?.id || "");
  };

  const handleSelectSub = (sub: SubservicioRadiofisica) => {
    setSelectedSubId(sub.id);
  };

  const handleConfirm = () => {
    if (currentTipo && currentSub) {
      onConfirm(currentTipo.nombre, currentSub.nombre);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          width: "100%",
          maxWidth: 820,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          animation: "modalFadeIn 0.2s ease-out",
        }}
      >
        {/* Header Institucional */}
        <div
          style={{
            background: "linear-gradient(135deg, #004B87 0%, #0066B3 100%)",
            color: "#FFFFFF",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.18)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="material-icons" style={{ fontSize: 26, color: "#FFFFFF" }}>
                health_and_safety
              </span>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.2px" }}>
                Habilitación - Radiofísica: Iniciar Inspección
              </div>
              <div style={{ fontSize: 12.5, color: "rgba(255, 255, 255, 0.85)", marginTop: 2 }}>
                {tramite?.denominacion || "HABILITACION - RADIOFÍSICA"} · Expediente {tramite?.nroExpediente || "EX-2026-0089100"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "22px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Instrucción */}
          <div
            style={{
              background: "#F0F9FF",
              border: "1px solid #BAE6FD",
              borderRadius: 10,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span className="material-icons" style={{ color: "#0284C7", fontSize: 22 }}>
              info
            </span>
            <div style={{ fontSize: 13, color: "#0369A1", lineHeight: 1.4 }}>
              Seleccione el <strong>Tipo de Servicio</strong> y luego el <strong>Servicio / Subservicio</strong> específico para generar el acta de inspección con sus datos generales y requerimientos normativos.
            </div>
          </div>

          {/* PASO 1: Tipo de Servicio */}
          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  background: "#004B87",
                  color: "#FFFFFF",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                }}
              >
                1
              </span>
              Tipo de Servicio (4 opciones)
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 10,
              }}
            >
              {RADIOFISICA_CATALOG.map((tipo) => {
                const isSelected = selectedTipoId === tipo.id;
                return (
                  <div
                    key={tipo.id}
                    onClick={() => handleSelectTipo(tipo)}
                    style={{
                      border: isSelected ? `2px solid ${tipo.color}` : "1.5px solid #E2E8F0",
                      background: isSelected ? `${tipo.color}10` : "#FFFFFF",
                      borderRadius: 12,
                      padding: "14px 12px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: 8,
                      position: "relative",
                      boxShadow: isSelected ? `0 4px 12px ${tipo.color}25` : "none",
                    }}
                  >
                    {isSelected && (
                      <span
                        className="material-icons"
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          fontSize: 18,
                          color: tipo.color,
                        }}
                      >
                        check_circle
                      </span>
                    )}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: isSelected ? tipo.color : "#F1F5F9",
                        color: isSelected ? "#FFFFFF" : "#64748B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 22 }}>
                        {tipo.icono}
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 750,
                          fontSize: 13.5,
                          color: isSelected ? tipo.color : "#1E293B",
                        }}
                      >
                        {tipo.nombre}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                        {tipo.subservicios.length} {tipo.subservicios.length === 1 ? "servicio" : "servicios"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PASO 2: Servicio / Subservicio para el tipo elegido */}
          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  background: "#004B87",
                  color: "#FFFFFF",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                }}
              >
                2
              </span>
              Servicio para {currentTipo.nombre} ({currentTipo.subservicios.length} disponibles)
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 8,
                maxHeight: 280,
                overflowY: "auto",
                padding: "2px",
              }}
            >
              {currentTipo.subservicios.map((sub) => {
                const isSelected = selectedSubId === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSub(sub)}
                    style={{
                      border: isSelected ? "2px solid #004B87" : "1px solid #E2E8F0",
                      background: isSelected ? "#F0F7FF" : "#FFFFFF",
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      transition: "all 0.12s ease",
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{
                        fontSize: 20,
                        color: isSelected ? "#004B87" : "#64748B",
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    >
                      {isSelected ? "radio_button_checked" : "radio_button_unchecked"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 750,
                          color: isSelected ? "#004B87" : "#1E293B",
                          lineHeight: 1.25,
                        }}
                      >
                        {sub.nombre}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748B",
                          marginTop: 3,
                          lineHeight: 1.3,
                        }}
                      >
                        {sub.descripcion}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen de Selección */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Configuración del Acta Seleccionada
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                {currentTipo.nombre} <span style={{ color: "#94A3B8" }}>›</span> {currentSub.nombre}
              </div>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#DCFCE7",
                color: "#15803D",
                fontSize: 11.5,
                fontWeight: 750,
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              <span className="material-icons" style={{ fontSize: 14 }}>verified</span>
              {currentSub.normativa}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #E2E8F0",
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              color: "#475569",
              fontSize: 13,
              fontWeight: 650,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              padding: "9px 22px",
              borderRadius: 8,
              border: "none",
              background: "#004B87",
              color: "#FFFFFF",
              fontSize: 13.5,
              fontWeight: 750,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 6px rgba(0, 75, 135, 0.3)",
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>play_circle</span>
            Iniciar Inspección del Servicio
          </button>
        </div>
      </div>
    </div>
  );
}
