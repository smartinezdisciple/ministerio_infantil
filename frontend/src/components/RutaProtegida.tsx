// RutaProtegida.tsx — Guardia de autenticación y nivel jerárquico (CLAUDE.md §4, Spec §6.2)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/ContextoAuth';
import type { NivelJerarquico } from '../services/tipos';

interface PropsRutaProtegida {
  children: React.ReactNode;
  /** Nivel mínimo requerido: 1=Colaborador, 2=Maestro, 3=Staff, 4=Coordinador */
  nivelMinimo?: NivelJerarquico;
}

/**
 * Envuelve rutas que requieren autenticación.
 * - Si no está autenticado → redirige a /
 * - Si el nivel del usuario es menor al requerido → redirige a /dashboard
 * - Spec §6.2: Matriz de permisos por rol
 */
const RutaProtegida: React.FC<PropsRutaProtegida> = ({
  children,
  nivelMinimo = 1,
}) => {
  const { estaAutenticado, usuario } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  if (usuario && usuario.nivelJerarquico < nivelMinimo) {
    // Nivel insuficiente → redirige al dashboard (accesible para todos)
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RutaProtegida;
