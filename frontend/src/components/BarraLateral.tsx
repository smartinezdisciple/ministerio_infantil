// BarraLateral.tsx — Sidebar de navegación persistente (CLAUDE.md §8.3, Plan Maestro §Módulo 1)
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/ContextoAuth';
import type { NivelJerarquico } from '../services/tipos';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
  /** Nivel mínimo requerido para ver este item (Spec §6.2) */
  nivelMinimo: NivelJerarquico;
}

const ITEMS_MENU: ItemMenu[] = [
  { ruta: '/dashboard', etiqueta: 'Tablero', icono: 'dashboard', nivelMinimo: 1 },
  { ruta: '/ingreso-ninos', etiqueta: 'Ingreso de Niños', icono: 'child_care', nivelMinimo: 2 },
  { ruta: '/asistencia-general', etiqueta: 'Asistencia General', icono: 'fact_check', nivelMinimo: 1 },
  { ruta: '/asistencia-grupo', etiqueta: 'Por Grupo', icono: 'groups', nivelMinimo: 1 },
  { ruta: '/directorio', etiqueta: 'Directorio', icono: 'contact_phone', nivelMinimo: 1 },
  { ruta: '/asistencia-personal', etiqueta: 'Personal', icono: 'badge', nivelMinimo: 3 },
  { ruta: '/ingreso-personal', etiqueta: 'Ingreso Personal', icono: 'person_add', nivelMinimo: 3 },
  { ruta: '/solicitudes', etiqueta: 'Solicitudes', icono: 'assignment', nivelMinimo: 3 },
  { ruta: '/fichas', etiqueta: 'Fichas', icono: 'confirmation_number', nivelMinimo: 3 },
  { ruta: '/requisitos', etiqueta: 'Requisitos', icono: 'checklist', nivelMinimo: 4 },
  { ruta: '/roles', etiqueta: 'Roles', icono: 'shield', nivelMinimo: 4 },
  { ruta: '/turnos-eventos', etiqueta: 'Turnos y Eventos', icono: 'calendar_month', nivelMinimo: 4 },
  { ruta: '/redes', etiqueta: 'Redes', icono: 'hub', nivelMinimo: 4 },
  { ruta: '/suspensiones', etiqueta: 'Suspensiones', icono: 'gavel', nivelMinimo: 3 },
  { ruta: '/reportes', etiqueta: 'Reportes', icono: 'assessment', nivelMinimo: 3 },
  { ruta: '/usuarios', etiqueta: 'Usuarios', icono: 'manage_accounts', nivelMinimo: 4 },
];

interface PropsBarraLateral {
  abierto?: boolean;
  onCerrar?: () => void;
}

/**
 * Sidebar de navegación del sistema MI (Ministerio Infantil).
 * - Filtra items según el nivel jerárquico del usuario autenticado.
 * - Item activo: bg-primary/10 con icono filled (CLAUDE.md §8.3)
 * - Pie: avatar + nombre + rol del usuario
 */
const BarraLateral: React.FC<PropsBarraLateral> = ({ abierto = false, onCerrar }) => {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/');
  };

  // Filtrar items según nivel del usuario (R-04, Spec §6.2)
  const itemsVisibles = ITEMS_MENU.filter(
    (item) => (usuario?.nivelJerarquico ?? 0) >= item.nivelMinimo
  );

  /** Devuelve las iniciales del nombre para el avatar */
  const obtenerIniciales = (nombre: string): string => {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Overlay oscuro en mobile cuando el menú está abierto */}
      {abierto && (
        <div
          className="fixed inset-0 bg-on-surface/40 z-40 lg:hidden transition-opacity"
          onClick={() => onCerrar?.()}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col h-screen z-50 shrink-0 transform transition-transform duration-300 ease-in-out ${abierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        aria-label="Navegación principal"
      >
        {/* ── Logo / Marca "MI" ──────────────────────── */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-outline-variant/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-on-primary font-headline-lg text-[16px] font-extrabold leading-none">
                MI
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-label-md font-label-md text-on-surface leading-tight truncate">
                Ministerio Infantil
              </span>
              <span className="text-label-sm text-on-surface-variant leading-tight">
                Escuela Dominical
              </span>
            </div>
          </div>
          {/* Botón de cierre en mobile */}
          <button
            onClick={() => onCerrar?.()}
            className="lg:hidden text-on-surface-variant hover:bg-surface-container-high p-1 rounded-full"
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ── Sección de navegación ─────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menú principal">
          <p className="text-label-sm text-on-surface-variant/60 px-3 mb-2 uppercase tracking-wider">
            Módulos
          </p>
          <ul className="flex flex-col gap-1" role="list">
            {itemsVisibles.map((item) => (
              <li key={item.ruta}>
                <NavLink
                  to={item.ruta}
                  onClick={() => onCerrar?.()}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 w-full',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-high',
                    ].join(' ')
                  }
                  aria-label={item.etiqueta}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`material-symbols-outlined text-[22px] shrink-0 ${isActive ? 'material-symbols-filled' : ''
                          }`}
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {item.icono}
                      </span>
                      <span className="text-label-md font-label-md truncate">
                        {item.etiqueta}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Pie: perfil del usuario ───────────────── */}
        {usuario && (
          <div className="border-t border-outline-variant/50 px-3 py-3">
            <button
              onClick={() => { navigate('/perfil'); onCerrar?.(); }}
              className="flex items-center gap-3 px-2 py-2 rounded-xl w-full hover:bg-surface-container-high transition-colors text-left"
            >
              {/* Avatar con iniciales */}
              <div className="w-9 h-9 bg-primary-container rounded-full flex items-center justify-center shrink-0">
                <span className="text-label-sm font-bold text-on-primary-container">
                  {obtenerIniciales(usuario.nombreCompleto)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-label-md font-label-md text-on-surface truncate leading-tight">
                  {usuario.nombreCompleto}
                </p>
                <p className="text-label-sm text-on-surface-variant leading-tight truncate">
                  {usuario.rol}
                </p>
              </div>
              {/* Botón cerrar sesión */}
              <button
                onClick={(e) => { e.stopPropagation(); handleCerrarSesion(); }}
                className="shrink-0 text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default BarraLateral;
