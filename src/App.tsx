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

function AppRoutes() {
  const { user } = useAuth()

  if (!user) return <LoginPage />

  return (
    <Routes>
      {/* Redirection rule based on active user role */}
      <Route path="/" element={<Navigate to={`/${user.rol.toLowerCase()}/home`} replace />} />

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
          <Route path="/inspector/inspeccion/:id" element={<InspeccionShell />} />
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
            <Route path="adecuacion" element={<BandejaAdecuacion />} />
          </Route>
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
            <Route path="antecedentes" element={<BandejaAntecedentesEfector />} />
            <Route path="responder/:id" element={<BandejaEfector />} />
            <Route path="alta-habilitacion/:id" element={<FormularioHabilitacion />} />
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
