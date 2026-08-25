import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserAvatarMenu from "../components/UserAvatarMenu";
import logoMinisterio from "../assets/logo-ministerio.webp";
import logoClicSalud from "../assets/logo-clicsalud.webp";
import isologoCordoba from "../assets/isologo-cordoba.webp";

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth < 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isTablet;
}

export default function DesktopLayout() {
  const { user } = useAuth();
  const isTablet = useIsTablet();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    return stored !== null ? stored === "true" : true;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "Nueva inspección asignada para mañana",
      time: "Hace 10 min",
      read: false,
    },
    {
      id: 2,
      text: "El trámite del efector Centro Médico Sur ha sido presentado",
      time: "Hace 1 hora",
      read: false,
    },
    {
      id: 3,
      text: "Vencimiento próximo de establecimiento Habilitación Express",
      time: "Hace 1 día",
      read: true,
    },
  ]);

  useEffect(() => {
    if (!showNotifications) return;
    const handleClose = () => setShowNotifications(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    inspecciones: true,
    tramites: true,
  });

  const toggleModule = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const navItems = getNavItems();
    navItems.forEach((item: any) => {
      if (
        item.subItems?.some(
          (sub: any) =>
            location.pathname === sub.to ||
            location.pathname.startsWith(sub.to),
        )
      ) {
        setOpenModules((prev) => ({ ...prev, [item.id]: true }));
      }
    });
  }, [location.pathname]);

  const getNavItems = () => {
    switch (user?.rol) {
      case "INSPECTOR":
        return [
          {
            id: "home",
            to: "/inspector/home",
            icon: "home",
            label: "Inicio",
            shortLabel: "Inicio",
          },
          {
            id: "inspecciones",
            to: "/inspector/inspecciones",
            icon: "fact_check",
            label: "Módulo Inspección",
            shortLabel: "Inspecciones",
            subItems: [
              {
                to: "/inspector/inspeccion-tipo/bandeja",
                icon: "fact_check",
                label: "Bandeja Inspección",
                dotColor: "#5B6ABF",
              },
              {
                to: "/inspector/inspeccion-tipo/habilitacion",
                icon: "verified",
                label: "Inspección Habilitación",
                dotColor: "#27AE60",
              },
              {
                to: "/inspector/inspeccion-tipo/rutina",
                icon: "schedule",
                label: "Inspección Rutina",
                dotColor: "#2980B9",
              },
              {
                to: "/inspector/inspeccion-tipo/denuncia",
                icon: "report",
                label: "Inspección Denuncia",
                dotColor: "#E74C3C",
              },
            ],
          },
          {
            id: "tramites",
            to: "/inspector/bandeja",
            icon: "assignment",
            label: "Módulo Trámites",
            shortLabel: "Trámites",
            subItems: [
              {
                to: "/inspector/expedientes",
                icon: "folder",
                label: "Trámites en Curso",
              },
              {
                to: "/inspector/bandeja",
                icon: "search",
                label: "Consulta de Trámites",
              },
            ],
          },
          {
            id: "establecimientos",
            to: "/inspector/establecimientos",
            icon: "business",
            label: "Módulo Establecimientos",
            shortLabel: "Locales",
          },
        ];
      case "ARQUITECTO":
        return [
          {
            id: "home",
            to: "/arquitecto/home",
            icon: "home",
            label: "Inicio",
            shortLabel: "Inicio",
          },
          {
            id: "tramites",
            to: "/arquitecto/bandeja",
            icon: "assignment",
            label: "Módulo Trámites",
            shortLabel: "Trámites",
            subItems: [
              {
                to: "/arquitecto/expedientes",
                icon: "folder",
                label: "Trámites en Curso",
              },
              {
                to: "/arquitecto/bandeja",
                icon: "search",
                label: "Consulta de Trámites",
              },
            ],
          },
        ];
      case "AUDITOR":
        return [
          {
            id: "home",
            to: "/auditor/home",
            icon: "home",
            label: "Inicio",
            shortLabel: "Inicio",
          },
          {
            id: "alertas",
            to: "/auditor/alertas-rutina",
            icon: "notifications_active",
            label: "Módulo Alertas Rutina",
            shortLabel: "Alertas",
          },
          {
            id: "tramites",
            to: "/auditor/bandeja",
            icon: "assignment",
            label: "Módulo Trámites",
            shortLabel: "Trámites",
            subItems: [
              {
                to: "/auditor/expedientes",
                icon: "folder",
                label: "Trámites en Curso",
              },
              {
                to: "/auditor/bandeja",
                icon: "search",
                label: "Consulta de Trámites",
              },
            ],
          },
          {
            id: "establecimientos",
            to: "/auditor/establecimientos",
            icon: "business",
            label: "Módulo Establecimientos",
            shortLabel: "Locales",
          },
        ];
      case "COORDINADOR":
        return [
          {
            id: "home",
            to: "/coordinador/home",
            icon: "home",
            label: "Inicio",
            shortLabel: "Inicio",
          },
          {
            id: "inspecciones",
            to: "/coordinador/inspecciones",
            icon: "fact_check",
            label: "Módulo Inspección",
            shortLabel: "Inspecciones",
            subItems: [
              {
                to: "/coordinador/inspeccion/bandeja",
                icon: "fact_check",
                label: "Bandeja Inspección",
                dotColor: "#5B6ABF",
              },
              {
                to: "/coordinador/inspeccion/habilitacion",
                icon: "verified",
                label: "Inspección Habilitación",
                dotColor: "#27AE60",
              },
              {
                to: "/coordinador/inspeccion/rutina",
                icon: "schedule",
                label: "Inspección Rutina",
                dotColor: "#2980B9",
              },
              {
                to: "/coordinador/inspeccion/denuncia",
                icon: "report",
                label: "Inspección Denuncia",
                dotColor: "#E74C3C",
              },
            ],
          },
          {
            id: "tramites",
            to: "/coordinador/tramites",
            icon: "assignment",
            label: "Módulo Trámites",
            shortLabel: "Trámites",
            subItems: [
              {
                to: "/coordinador/asignacion",
                icon: "people",
                label: "Asignación de Trámites",
                dotColor: "#0055A5",
              },
            ],
          },
        ];
      case "PROTOCOLIZADOR":
        return [
          {
            id: "home",
            to: "/protocolizador/home",
            icon: "home",
            label: "Inicio",
            shortLabel: "Inicio",
          },
          {
            id: "tramites",
            to: "/protocolizador/bandeja",
            icon: "assignment",
            label: "Módulo Trámites",
            shortLabel: "Trámites",
            subItems: [
              {
                to: "/protocolizador/expedientes",
                icon: "folder",
                label: "Trámites en Curso",
              },
              {
                to: "/protocolizador/bandeja",
                icon: "search",
                label: "Consulta de Trámites",
              },
            ],
          },
          {
            id: "establecimientos",
            to: "/protocolizador/establecimientos",
            icon: "business",
            label: "Módulo Establecimientos",
            shortLabel: "Locales",
          },
        ];
      case "EFECTOR":
        return [
          {
            id: "home",
            to: "/efector/home",
            icon: "home",
            label: "Inicio",
            shortLabel: "Inicio",
          },
          {
            id: "alertas",
            to: "/efector/alertas",
            icon: "notifications_active",
            label: "Módulo Alertas",
            shortLabel: "Alertas",
          },
          {
            id: "tramites",
            to: "/efector/bandeja",
            icon: "assignment",
            label: "Módulo Trámites",
            shortLabel: "Trámites",
            subItems: [
              { to: "/efector/bandeja", icon: "folder", label: "Mis Trámites" },
            ],
          },
          {
            id: "establecimientos",
            to: "/efector/establecimientos",
            icon: "business",
            label: "Módulo Establecimientos",
            shortLabel: "Locales",
          },
        ];
      case "CONSULTOR":
        return [
          {
            id: "establecimientos",
            to: "/consultor/establecimientos",
            icon: "business",
            label: "Módulo Establecimientos",
            shortLabel: "Locales",
          },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // On tablet/mobile: render Outlet with persistent bottom navbar
  if (isTablet) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--ios-gray6, #f2f2f7)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          paddingBottom:
            "calc(var(--tab-bar-height, 82px) + env(safe-area-inset-bottom, 0px))",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <Outlet />
        </div>

        {/* Persistent Bottom Tab Bar */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            height: "var(--tab-bar-height, 82px)",
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            paddingBottom: "env(safe-area-inset-bottom, 12px)",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            maxWidth: 768,
            margin: "0 auto",
            boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.04)",
          }}
        >
          {navItems.map((item: any) => {
            const isActive =
              location.pathname === item.to ||
              location.pathname.startsWith(item.to + "/");
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-family, system-ui, -apple-system)",
                  flex: 1,
                  height: "100%",
                  padding: "8px 0",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 28,
                    borderRadius: 14,
                    background: isActive
                      ? "rgba(0, 122, 255, 0.12)"
                      : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span
                    className="material-icons"
                    style={{
                      fontSize: 24,
                      color: isActive ? "var(--ios-blue, #007aff)" : "#7f8c8d",
                      transition: "all 0.2s ease",
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {item.icon}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--ios-blue, #007aff)" : "#7f8c8d",
                    lineHeight: 1.2,
                    letterSpacing: "0.2px",
                  }}
                >
                  {item.shortLabel || item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className={`desktop-layout ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Global Header spanning the full horizontal width */}
      <header
        style={{
          background: "var(--surface-sidebar)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1000,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "64px",
          boxShadow: "var(--shadow-sm)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => {
              const next = !isCollapsed;
              setIsCollapsed(next);
              localStorage.setItem("sidebar_collapsed", String(next));
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: "6px",
              transition: "background-color 0.2s",
              marginRight: "8px",
            }}
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <span className="material-icons" style={{ fontSize: 24 }}>
              menu
            </span>
          </button>

          <img
            src={logoMinisterio}
            alt="Ministerio de Salud"
            style={{ height: "40px", objectFit: "contain" }}
          />
          <div
            style={{
              width: "1px",
              height: "28px",
              background: "rgba(255, 255, 255, 0.2)",
            }}
          />
          <img
            src={logoClicSalud}
            alt="ClicSalud"
            style={{ height: "36px", objectFit: "contain" }}
          />
        </div>

        {/* Center Greeting */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#E2E8F0",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Bienvenido a ClicSalud
          </div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "white",
              marginTop: "2px",
            }}
          >
            ¡Hola, {user?.nombre} {user?.apellido}!
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "relative",
                padding: "8px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                transition: "background-color 0.2s",
              }}
              title="Notificaciones"
            >
              <span className="material-icons" style={{ fontSize: "24px" }}>
                notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "#EF4444",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "bold",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid white",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: "8px",
                  width: "320px",
                  background: "white",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                  border: "1px solid var(--color-gray-200)",
                  zIndex: 1000,
                  padding: "12px 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 16px 8px 16px",
                    borderBottom: "1px solid var(--color-gray-200)",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "var(--color-gray-800)",
                    }}
                  >
                    Notificaciones
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-brand-600)",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: 600,
                        padding: 0,
                      }}
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        color: "var(--color-gray-500)",
                        fontSize: "13px",
                      }}
                    >
                      No tienes notificaciones
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "10px 16px",
                          borderBottom: "1px solid var(--color-gray-100)",
                          background: n.read
                            ? "transparent"
                            : "rgba(0, 85, 165, 0.03)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--color-gray-800)",
                            fontWeight: n.read ? 400 : 600,
                          }}
                        >
                          {n.text}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--color-gray-500)",
                          }}
                        >
                          {n.time}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <UserAvatarMenu size={40} />
        </div>
      </header>

      {/* Sidebar starts below the header */}
      <aside
        className="sidebar"
        style={{
          overflow: "visible",
          top: "64px",
          height: "calc(100vh - 64px)",
        }}
      >
        <div style={{ height: "16px" }} />

        <nav
          className="sidebar-nav"
          style={{ display: "flex", flexDirection: "column", gap: 4 }}
        >
          {navItems.map((item: any) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = openModules[item.id] ?? false;

            return (
              <div
                key={item.to || item.id}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <NavLink
                    to={item.to}
                    title={item.label}
                    className={({ isActive }) =>
                      `sidebar-nav-item ${isActive ? "active" : ""}`
                    }
                    style={{ flex: 1 }}
                  >
                    <span
                      className="material-icons sidebar-nav-icon"
                      style={{ fontSize: 20 }}
                    >
                      {item.icon}
                    </span>
                    <span
                      className="sidebar-nav-label"
                      style={{ fontWeight: hasSubItems ? 700 : 500 }}
                    >
                      {item.label}
                    </span>
                  </NavLink>

                  {hasSubItems && !isCollapsed && (
                    <button
                      onClick={(e) => toggleModule(item.id, e)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255, 255, 255, 0.7)",
                        cursor: "pointer",
                        padding: "6px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        right: 8,
                        zIndex: 2,
                      }}
                      title={
                        isExpanded
                          ? "Contraer submódulos"
                          : "Expandir submódulos"
                      }
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>
                        {isExpanded ? "expand_more" : "chevron_right"}
                      </span>
                    </button>
                  )}
                </div>

                {hasSubItems && isExpanded && !isCollapsed && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      paddingLeft: 16,
                      marginTop: 2,
                    }}
                  >
                    {item.subItems.map((sub: any) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        title={sub.label}
                        className={({ isActive }) =>
                          `sidebar-nav-item ${isActive ? "active" : ""}`
                        }
                        style={{
                          fontSize: "13px",
                          padding: "8px 12px",
                          borderRadius: 8,
                        }}
                      >
                        <span
                          className="material-icons sidebar-nav-icon"
                          style={{
                            fontSize: 17,
                            color: sub.dotColor || "inherit",
                          }}
                        >
                          {sub.icon}
                        </span>
                        <span
                          className="sidebar-nav-label"
                          style={{ fontSize: "12.5px" }}
                        >
                          {sub.label}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content starts below the header */}
      <main className="main-content" style={{ marginTop: "64px" }}>
        {/* Page Content Panel (White 25% Transparent) */}
        <div
          style={{
            flex: 1,
            margin: "24px",
            background: "rgba(255, 255, 255, 0.75)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Outlet />
        </div>

        {/* Global Footer */}
        <footer
          style={{
            background: "rgb(0, 81, 155)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.85)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={isologoCordoba}
              alt="Gobierno de Córdoba"
              style={{ height: "32px", objectFit: "contain" }}
            />
          </div>
          <div style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            <strong style={{ color: "white" }}>Versión:</strong> 1.4.2
          </div>
        </footer>
      </main>
    </div>
  );
}
