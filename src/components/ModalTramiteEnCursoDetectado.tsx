import React from "react";
import { type Tramite } from "../data/mockData";

interface ModalTramiteEnCursoDetectadoProps {
  tramite: Tramite;
  onClose: () => void;
  onEmitirDeTodasFormas: () => void;
}

export default function ModalTramiteEnCursoDetectado({
  tramite,
  onClose,
  onEmitirDeTodasFormas,
}: ModalTramiteEnCursoDetectadoProps) {
  const simultaneo = tramite.tramiteActivoEnCurso || {
    id: "TRM-2026-08812",
    nroTramite: "2026-08812",
    tipo: "RENOVACION",
    estado: "ENVIADO",
    fechaEstado: "10/08/2026",
    descripcion: "Renovación de Habilitación en proceso de evaluación técnica",
  };

  const tipoLabel =
    simultaneo.tipo === "RENOVACION"
      ? "Renovación de Habilitación"
      : simultaneo.tipo === "MODIFICACION"
      ? "Modificación de Estructura"
      : simultaneo.tipo === "ADECUACION"
      ? "Adecuación Edilicia"
      : "Habilitación";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          maxWidth: 560,
          width: "100%",
          padding: 28,
          border: "1px solid #E2E8F0",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          animation: "modalFadeIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#FEF3C7",
                border: "1px solid #FDE68A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D97706",
                flexShrink: 0,
              }}
            >
              <span className="material-icons" style={{ fontSize: 24 }}>
                warning_amber
              </span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#0F172A",
                    margin: 0,
                  }}
                >
                  Trámite en curso detectado
                </h3>
                <span
                  style={{
                    background: "#EFF6FF",
                    color: "#1D4ED8",
                    border: "1px solid #BFDBFE",
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: "2px 7px",
                    borderRadius: 10,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  Anti-Collision Guard
                </span>
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "#64748B",
                  marginTop: 2,
                }}
              >
                Advertencia de solapamiento inspectivo para este efector
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#94A3B8",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
            }}
            title="Cerrar"
          >
            <span className="material-icons" style={{ fontSize: 20 }}>
              close
            </span>
          </button>
        </div>

        {/* Warning Banner */}
        <div
          style={{
            background: "#FFFBEB",
            border: "1.5px solid #F59E0B",
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <span
            className="material-icons"
            style={{ fontSize: 20, color: "#D97706", marginTop: 1 }}
          >
            info
          </span>
          <div style={{ fontSize: 13, color: "#92400E", lineHeight: 1.45 }}>
            Se detectó que <strong>{tramite.denominacion}</strong> ya cuenta con
            un trámite administrativo activo en el sistema. Emitir una nueva orden
            de inspección podría generar duplicidad de actuaciones o contradicciones
            en los informes técnicos.
          </div>
        </div>

        {/* Ficha de Información del Solapamiento */}
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              borderBottom: "1px solid #E2E8F0",
              paddingBottom: 6,
            }}
          >
            Detalles del trámite activo detectado
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
              fontSize: 12.5,
            }}
          >
            <div>
              <span style={{ color: "#64748B", display: "block", fontSize: 11 }}>
                Establecimiento
              </span>
              <strong style={{ color: "#0F172A" }}>
                {tramite.denominacion}
              </strong>
            </div>

            <div>
              <span style={{ color: "#64748B", display: "block", fontSize: 11 }}>
                Expediente Originario
              </span>
              <span style={{ fontFamily: "monospace", color: "#334155", fontWeight: 700 }}>
                {tramite.nroExpediente}
              </span>
            </div>

            <div>
              <span style={{ color: "#64748B", display: "block", fontSize: 11 }}>
                Trámite en Curso
              </span>
              <strong style={{ color: "#0284C7" }}>
                {tipoLabel} (#{simultaneo.nroTramite})
              </strong>
            </div>

            <div>
              <span style={{ color: "#64748B", display: "block", fontSize: 11 }}>
                Estado / Fecha Ingreso
              </span>
              <span
                style={{
                  background: "#FEF3C7",
                  color: "#B45309",
                  padding: "1px 7px",
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 11,
                  display: "inline-block",
                }}
              >
                {simultaneo.estado} ({simultaneo.fechaEstado || "10/08/2026"})
              </span>
            </div>
          </div>
        </div>

        {/* Advertencia / Nota */}
        <div
          style={{
            fontSize: 12,
            color: "#64748B",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            className="material-icons"
            style={{ fontSize: 16, color: "#D97706" }}
          >
            info
          </span>
          <span>
            <strong>Atención:</strong> Verifique las actuaciones del trámite en curso antes de emitir una nueva orden.
          </span>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 10,
            paddingTop: 8,
            borderTop: "1px solid #F1F5F9",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 12.5,
              color: "#475569",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onEmitirDeTodasFormas}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: "#D97706",
              color: "#FFFFFF",
              fontWeight: 750,
              cursor: "pointer",
              fontSize: 12.5,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 6px rgba(217, 119, 6, 0.25)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#B45309";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#D97706";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            title="Ignorar advertencia y emitir orden"
          >
            <span className="material-icons" style={{ fontSize: 17 }}>
              arrow_forward
            </span>
            Emitir de todas formas
          </button>
        </div>
      </div>
    </div>
  );
}
