// contexts/ContextoAuth.tsx — Contexto global de autenticación (CLAUDE.md §4)
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UsuarioAutenticado } from '../services/tipos';

interface EstadoAuth {
  usuario: UsuarioAutenticado | null;
  token: string | null;
  iniciarSesion: (token: string, usuario: UsuarioAutenticado) => void;
  cerrarSesion: () => void;
  estaAutenticado: boolean;
}

const ContextoAuth = createContext<EstadoAuth | null>(null);

/**
 * Proveedor global de autenticación.
 * Persiste el token en localStorage y lo restaura al recargar la app.
 */
export const ProveedorAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Intentar restaurar sesión del localStorage al arrancar
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ed_token');
  });

  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => {
    const raw = localStorage.getItem('ed_usuario');
    if (!raw) return null;
    try { return JSON.parse(raw) as UsuarioAutenticado; }
    catch { return null; }
  });

  const iniciarSesion = useCallback((nuevoToken: string, nuevoUsuario: UsuarioAutenticado) => {
    localStorage.setItem('ed_token', nuevoToken);
    localStorage.setItem('ed_usuario', JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }, []);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('ed_token');
    localStorage.removeItem('ed_usuario');
    setToken(null);
    setUsuario(null);
  }, []);

  return (
    <ContextoAuth.Provider value={{
      usuario,
      token,
      iniciarSesion,
      cerrarSesion,
      estaAutenticado: !!token && !!usuario,
    }}>
      {children}
    </ContextoAuth.Provider>
  );
};

/**
 * Hook para consumir el contexto de autenticación.
 * Lanza error si se usa fuera de ProveedorAuth.
 */
export const useAuth = (): EstadoAuth => {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <ProveedorAuth>');
  }
  return contexto;
};
