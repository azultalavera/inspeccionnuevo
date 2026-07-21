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
            <Route path="bandeja" element={<BandejaTramites />} />
            <Route path="establecimientos" element={<BandejaEstablecimientos />} />
            <Route path="validacion/:id" element={<ValidacionRespuestas />} />
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
            <Route path="establecimientos" element={<BandejaEstablecimientos />} />
          </Route>
        </>
      )}

      {/* Coordinador Routes */}
      {user.rol === 'COORDINADOR' && (
        <>
          <Route path="/coordinador" element={<DesktopLayout />}>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="asignacion" element={<BandejaAsignacion />} />
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
            <Route path="establecimientos" element={<BandejaEstablecimientos />} />
            <Route path="bandeja" element={<BandejaTramitesEfector />} />
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
