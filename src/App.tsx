import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import DesktopLayout from './layouts/DesktopLayout'
import HomeDashboard from './pages/HomeDashboard'
import BandejaTramites from './pages/BandejaTramites'
import BandejaEfector from './pages/BandejaEfector'
import BandejaTramitesEfector from './pages/BandejaTramitesEfector'
import BandejaEstablecimientos from './pages/BandejaEstablecimientos'
import BandejaExpedientesAbiertos from './pages/BandejaExpedientesAbiertos'
import BandejaAsignacion from './pages/BandejaAsignacion'
import BandejaAdecuacion from './pages/BandejaAdecuacion'
import ValidacionRespuestas from './pages/ValidacionRespuestas'
import InspeccionShell from './pages/tablet/InspeccionShell'
import PantallaInspeccion from './components/inspeccion/inspector/PantallaInspeccion'
import RevisionActa from './components/inspeccion/inspector/RevisionActa'
import FormularioHabilitacion from './pages/FormularioHabilitacion'
import BandejaInspecciones from './pages/BandejaInspecciones'
import BandejaDenunciasEfector from './pages/BandejaDenunciasEfector'
import BandejaAntecedentesEfector from './pages/BandejaAntecedentesEfector'
import BandejaAlertasRutina from './pages/BandejaAlertasRutina'
import BandejaAlertasEfector from './pages/BandejaAlertasEfector'
import InspeccionHabilitacionPage from './pages/InspeccionHabilitacionPage'
import InspeccionRutinaPage from './pages/InspeccionRutinaPage'
import InspeccionDenunciaPage from './pages/InspeccionDenunciaPage'
import ModuloTramites from './pages/ModuloTramites'
import BandejaTodasInspeccionesPage from './pages/BandejaTodasInspeccionesPage'
import BandejaDenunciasAgente from './pages/BandejaDenunciasAgente'
import FormularioDenunciaEfector from './pages/FormularioDenunciaEfector'
import VerTramitePage from './components/efector/VerTramitePage'
import NuevaOrdenDenunciaPage from './pages/NuevaOrdenDenunciaPage'
import TramitesEnCurso from './components/efector/TramitesEnCurso'
import MisEstablecimientos from './components/efector/MisEstablecimientos'
import RectificacionTramite from './components/efector/RectificacionTramite'
import DashboardAdmin from './components/backoffice/DashboardAdmin'
import AsignacionRoles from './components/backoffice/AsignacionRoles'
import GestionRecursos from './components/backoffice/GestionRecursos'
import Infraestructura from './components/backoffice/Infraestructura'
import EquipamientosConfig from './components/backoffice/EquipamientosConfig'
import RecursosHumanosConfig from './components/backoffice/RecursosHumanosConfig'
import JefeServicioConfig from './components/backoffice/JefeServicioConfig'
import ServiciosConfig from './components/backoffice/ServiciosConfig'
import TiposEquiposConfig from './components/backoffice/TiposEquiposConfig'
import CatalogoTiposEquipos from './components/backoffice/CatalogoTiposEquipos'

function AppRoutes() {
  const { user } = useAuth()

  if (!user) return <LoginPage />

  return (
    <Routes>
      {/* Redirection rule based on active user role */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              user.rol === 'AGENTE_DENUNCIAS'
                ? '/agente-denuncias/denuncias'
                : user.rol === 'ADMINISTRADOR'
                ? '/admin/dashboard'
                : `/${user.rol.toLowerCase()}/home`
            }
            replace
          />
        }
      />

      {/* Inspector Routes */}
      {user.rol === 'INSPECTOR' && (
        <>
          <Route path="/inspector" element={<DesktopLayout />}>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="expedientes" element={<BandejaExpedientesAbiertos />} />
            <Route path="inspecciones" element={<BandejaInspecciones />} />
            <Route path="inspeccion-tipo/bandeja" element={<BandejaTodasInspeccionesPage />} />
            <Route path="inspeccion-tipo/habilitacion" element={<InspeccionHabilitacionPage />} />
            <Route path="inspeccion-tipo/rutina" element={<InspeccionRutinaPage />} />
            <Route path="inspeccion-tipo/denuncia" element={<InspeccionDenunciaPage />} />
            <Route path="bandeja" element={<BandejaTramites />} />
            <Route path="establecimientos" element={<BandejaEstablecimientos />} />
            <Route path="validacion/:id" element={<ValidacionRespuestas />} />
            <Route path="admin/denuncias" element={<BandejaDenunciasEfector />} />
          </Route>
          <Route path="/inspector/inspeccion/:id" element={<PantallaInspeccion />} />
          <Route path="/inspector/revision-acta/:id" element={<RevisionActa />} />
          <Route path="/inspector/ver-tramite/:id" element={<VerTramitePage />} />
        </>
      )}

      {/* Arquitecto Routes */}
      {user.rol === 'ARQUITECTO' && (
        <>
          <Route path="/arquitecto" element={<DesktopLayout />}>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="expedientes" element={<BandejaExpedientesAbiertos />} />
            <Route path="bandeja" element={<BandejaTramites />} />
          </Route>
          <Route path="/arquitecto/inspeccion/:id" element={<PantallaInspeccion />} />
          <Route path="/arquitecto/revision/:id" element={<PantallaInspeccion />} />
          <Route path="/arquitecto/ver-tramite/:id" element={<VerTramitePage />} />
          <Route path="/inspector/inspeccion/:id" element={<PantallaInspeccion />} />
        </>
      )}

      {/* Auditor Routes */}
      {user.rol === 'AUDITOR' && (
        <>
          <Route path="/auditor" element={<DesktopLayout />}>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="expedientes" element={<BandejaExpedientesAbiertos />} />
            <Route path="bandeja" element={<BandejaTramites />} />
            <Route path="alertas-rutina" element={<BandejaAlertasRutina />} />
            <Route path="establecimientos" element={<BandejaEstablecimientos />} />
          </Route>
          <Route path="/auditor/inspeccion/:id" element={<PantallaInspeccion />} />
          <Route path="/auditor/revision/:id" element={<PantallaInspeccion />} />
          <Route path="/auditor/ver-tramite/:id" element={<VerTramitePage />} />
          <Route path="/inspector/inspeccion/:id" element={<PantallaInspeccion />} />
        </>
      )}

      {/* Coordinador Routes */}
      {user.rol === 'COORDINADOR' && (
        <>
          <Route path="/coordinador" element={<DesktopLayout />}>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="inspecciones" element={<BandejaInspecciones />} />
            <Route path="inspeccion/bandeja" element={<BandejaTodasInspeccionesPage />} />
            <Route path="inspeccion/habilitacion" element={<InspeccionHabilitacionPage />} />
            <Route path="inspeccion/rutina" element={<InspeccionRutinaPage />} />
            <Route path="inspeccion/denuncia" element={<InspeccionDenunciaPage />} />
            <Route path="tramites" element={<ModuloTramites />} />
            <Route path="asignacion" element={<BandejaAsignacion />} />
            <Route path="alertas-rutina" element={<BandejaAlertasRutina />} />
            <Route path="adecuacion" element={<Navigate to="/coordinador/inspecciones" state={{ filtroEstado: 'OBSERVADAS' }} replace />} />
            <Route path="validacion/:id" element={<ValidacionRespuestas />} />
          </Route>
          <Route path="/coordinador/inspeccion/:id" element={<PantallaInspeccion />} />
          <Route path="/coordinador/revision/:id" element={<PantallaInspeccion />} />
          <Route path="/coordinador/ver-tramite/:id" element={<VerTramitePage />} />
          <Route path="/inspector/inspeccion/:id" element={<PantallaInspeccion />} />
        </>
      )}

      {/* Protocolizador Routes */}
      {user.rol === 'PROTOCOLIZADOR' && (
        <>
          <Route path="/protocolizador" element={<DesktopLayout />}>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="expedientes" element={<BandejaExpedientesAbiertos />} />
            <Route path="bandeja" element={<BandejaTramites />} />
            <Route path="establecimientos" element={<BandejaEstablecimientos />} />
          </Route>
        </>
      )}

      {/* Efector Routes */}
      {user.rol === 'EFECTOR' && (
        <>
          <Route path="/efector" element={<DesktopLayout />}>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="alertas" element={<BandejaAlertasEfector />} />
            <Route path="establecimientos" element={<BandejaEstablecimientos />} />
            <Route path="bandeja" element={<BandejaTramitesEfector />} />
            <Route path="mis-denuncias" element={<BandejaDenunciasEfector />} />
            <Route path="nueva-denuncia" element={<NuevaOrdenDenunciaPage />} />
            <Route path="antecedentes" element={<BandejaAntecedentesEfector />} />
            <Route path="responder/:id" element={<BandejaEfector />} />
            <Route path="alta-habilitacion" element={<FormularioHabilitacion />} />
            <Route path="alta-habilitacion/:id" element={<FormularioHabilitacion />} />
            <Route path="tramite/:id" element={<FormularioHabilitacion />} />
            <Route path="tramites-en-curso" element={<TramitesEnCurso />} />
            <Route path="mis-establecimientos" element={<MisEstablecimientos />} />
            <Route path="rectificacion" element={<RectificacionTramite />} />
            <Route path="respuesta-emplazamiento" element={<RectificacionTramite />} />
            <Route path="respuesta-emplazamiento/:id" element={<RectificacionTramite />} />
          </Route>
          <Route path="/home-efector" element={<DesktopLayout />}>
            <Route path="*" element={<FormularioHabilitacion />} />
          </Route>
        </>
      )}

      {/* Consultor Routes */}
      {user.rol === 'CONSULTOR' && (
        <>
          <Route path="/consultor" element={<DesktopLayout />}>
            <Route path="home" element={<Navigate to="/consultor/establecimientos" replace />} />
            <Route path="establecimientos" element={<BandejaEstablecimientos />} />
          </Route>
        </>
      )}

      {/* Agente Denuncias Routes */}
      {user.rol === 'AGENTE_DENUNCIAS' && (
        <>
          <Route path="/agente-denuncias" element={<DesktopLayout />}>
            <Route index element={<Navigate to="/agente-denuncias/denuncias" replace />} />
            <Route path="home" element={<Navigate to="/agente-denuncias/denuncias" replace />} />
            <Route path="denuncias" element={<BandejaDenunciasAgente />} />
            <Route path="nueva-denuncia" element={<NuevaOrdenDenunciaPage />} />
          </Route>
        </>
      )}

      {/* Administrador Routes */}
      {user.rol === 'ADMINISTRADOR' && (
        <>
          <Route path="/admin" element={<DesktopLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="home" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardAdmin />} />
            <Route path="asignar-rol" element={<AsignacionRoles />} />
            <Route path="gestion-recursos" element={<GestionRecursos />} />
            <Route path="gestion-recursos/tipos-equipos" element={<CatalogoTiposEquipos />} />
            <Route path="gestion-recursos/requerimientos-equipos" element={<TiposEquiposConfig />} />
            <Route path="gestion-recursos/matriz-equipos" element={<TiposEquiposConfig />} />
            <Route path="gestion-recursos/infraestructura" element={<Infraestructura />} />
            <Route path="gestion-recursos/equipamientos" element={<EquipamientosConfig />} />
            <Route path="gestion-recursos/recursos-humanos" element={<RecursosHumanosConfig />} />
            <Route path="gestion-recursos/jefe-servicio" element={<JefeServicioConfig />} />
            <Route path="gestion-recursos/servicios" element={<ServiciosConfig />} />
          </Route>

          {/* Compatibility for clicsalud-backoffice routes from prototype */}
          <Route path="/clicsalud-backoffice" element={<DesktopLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardAdmin />} />
            <Route path="asignar-rol" element={<AsignacionRoles />} />
            <Route path="gestion-recursos" element={<GestionRecursos />} />
            <Route path="gestion-recursos/tipos-equipos" element={<CatalogoTiposEquipos />} />
            <Route path="gestion-recursos/requerimientos-equipos" element={<TiposEquiposConfig />} />
            <Route path="gestion-recursos/matriz-equipos" element={<TiposEquiposConfig />} />
            <Route path="gestion-recursos/infraestructura" element={<Infraestructura />} />
            <Route path="gestion-recursos/equipamientos" element={<EquipamientosConfig />} />
            <Route path="gestion-recursos/recursos-humanos" element={<RecursosHumanosConfig />} />
            <Route path="gestion-recursos/jefe-servicio" element={<JefeServicioConfig />} />
            <Route path="gestion-recursos/servicios" element={<ServiciosConfig />} />
          </Route>
        </>
      )}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  )
}
