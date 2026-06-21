// main.tsx — Punto de entrada de React con React Router y contexto de auth
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorAuth } from './contexts/ContextoAuth';
import RutaProtegida from './components/RutaProtegida';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Carga diferida de páginas (code splitting por ruta)
const PaginaInicioSesion = lazy(() => import('./pages/PaginaInicioSesion'));
const PaginaDashboard = lazy(() => import('./pages/PaginaDashboard'));
const PaginaAsistenciaGeneral = lazy(() => import('./pages/PaginaAsistenciaGeneral'));
const PaginaAsistenciaPorGrupo = lazy(() => import('./pages/PaginaAsistenciaPorGrupo'));
const PaginaAsistenciaPersonal = lazy(() => import('./pages/PaginaAsistenciaPersonal'));
const PaginaRegistroPersonal = lazy(() => import('./pages/PaginaRegistroPersonal'));
const PaginaDirectorioContactos = lazy(() => import('./pages/PaginaDirectorioContactos'));
const PaginaFichaContacto = lazy(() => import('./pages/PaginaFichaContacto'));
const RegistroNinos = lazy(() => import('./pages/RegistroNinos'));

// Páginas nuevas v2.0
const PaginaSolicitudes = lazy(() => import('./pages/PaginaSolicitudes'));
const PaginaFichas = lazy(() => import('./pages/PaginaFichas'));
const PaginaRequisitos = lazy(() => import('./pages/PaginaRequisitos'));
const PaginaRoles = lazy(() => import('./pages/PaginaRoles'));
const PaginaTurnosEventos = lazy(() => import('./pages/PaginaTurnosEventos'));
const PaginaRedes = lazy(() => import('./pages/PaginaRedes'));
const PaginaReportes = lazy(() => import('./pages/PaginaReportes'));
const PaginaPerfilPersonal = lazy(() => import('./pages/PaginaPerfilPersonal'));
const PaginaSuspensiones = lazy(() => import('./pages/PaginaSuspensiones'));

/** Indicador de carga mientras se descarga un chunk de ruta */
const CargandoPagina: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-body-sm text-on-surface-variant">Cargando...</p>
    </div>
  </div>
);

const elementoRaiz = document.getElementById('root');

if (!elementoRaiz) {
  throw new Error(
    'No se encontró el elemento con id "root". Verifica que index.html contenga <div id="root"></div>.'
  );
}

ReactDOM.createRoot(elementoRaiz).render(
  <React.StrictMode>
    <ProveedorAuth>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'bg-surface-container-highest text-on-surface border border-outline/20 font-sans rounded-xl shadow-lg',
          duration: 2000,
        }}
      />
      <BrowserRouter>
        <Suspense fallback={<CargandoPagina />}>
          <Routes>
            {/* ── Pública ──────────────────────────────── */}
            <Route path="/" element={<PaginaInicioSesion />} />

            {/* ── Nivel ≥ 1 (todos los roles) ─────────── */}
            <Route path="/dashboard" element={
              <RutaProtegida nivelMinimo={1}><PaginaDashboard /></RutaProtegida>
            } />
            <Route path="/asistencia-general" element={
              <RutaProtegida nivelMinimo={1}><PaginaAsistenciaGeneral /></RutaProtegida>
            } />
            <Route path="/asistencia-grupo" element={
              <RutaProtegida nivelMinimo={1}><PaginaAsistenciaPorGrupo /></RutaProtegida>
            } />
            <Route path="/directorio" element={
              <RutaProtegida nivelMinimo={1}><PaginaDirectorioContactos /></RutaProtegida>
            } />
            <Route path="/directorio/:idNino" element={
              <RutaProtegida nivelMinimo={1}><PaginaFichaContacto /></RutaProtegida>
            } />

            {/* ── Nivel ≥ 3 (Staff y Coordinador) ─────── */}
            <Route path="/asistencia-personal" element={
              <RutaProtegida nivelMinimo={3}><PaginaAsistenciaPersonal /></RutaProtegida>
            } />
            <Route path="/ingreso-personal" element={
              <RutaProtegida nivelMinimo={3}><PaginaRegistroPersonal /></RutaProtegida>
            } />
            <Route path="/ingreso-ninos" element={
              <RutaProtegida nivelMinimo={3}><RegistroNinos /></RutaProtegida>
            } />
            <Route path="/solicitudes" element={
              <RutaProtegida nivelMinimo={3}><PaginaSolicitudes /></RutaProtegida>
            } />
            <Route path="/fichas" element={
              <RutaProtegida nivelMinimo={3}><PaginaFichas /></RutaProtegida>
            } />
            <Route path="/requisitos" element={
              <RutaProtegida nivelMinimo={3}><PaginaRequisitos /></RutaProtegida>
            } />
            <Route path="/roles" element={
              <RutaProtegida nivelMinimo={3}><PaginaRoles /></RutaProtegida>
            } />
            <Route path="/turnos-eventos" element={
              <RutaProtegida nivelMinimo={3}><PaginaTurnosEventos /></RutaProtegida>
            } />
            <Route path="/redes" element={
              <RutaProtegida nivelMinimo={3}><PaginaRedes /></RutaProtegida>
            } />
            <Route path="/reportes" element={
              <RutaProtegida nivelMinimo={3}><PaginaReportes /></RutaProtegida>
            } />
            <Route path="/personal/:id" element={
              <RutaProtegida nivelMinimo={3}><PaginaPerfilPersonal /></RutaProtegida>
            } />
            <Route path="/suspensiones" element={
              <RutaProtegida nivelMinimo={3}><PaginaSuspensiones /></RutaProtegida>
            } />

            {/* ── Fallback ─────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ProveedorAuth>
  </React.StrictMode>
);
