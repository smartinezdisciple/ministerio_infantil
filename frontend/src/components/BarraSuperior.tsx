// BarraSuperior.tsx — Top App Bar (CLAUDE.md §8.3, Plan Maestro §Módulo 1)
import React from 'react';

interface PropsBarraSuperior {
  titulo: string;
  /** Acción secundaria opcional (ej: botón de filtros globales) */
  accionDerecha?: React.ReactNode;
  /** Función para abrir el menú lateral en mobile */
  onMenuToggle?: () => void;
}

/**
 * Barra superior sticky del sistema.
 * Diseño: bg-surface-container-lowest, border-b, h-16, sticky top-0
 * Muestra el título de la sección actual.
 */
const BarraSuperior: React.FC<PropsBarraSuperior> = ({ titulo, accionDerecha, onMenuToggle }) => {
  return (
    <header
      className="bg-surface-container-lowest border-b border-outline-variant h-16 sticky top-0 z-30 flex flex-col sm:flex-row items-center sm:items-center justify-between sm:justify-between px-4 sm:px-gutter sm:h-16 h-auto sm:h-16 shrink-0"
      role="banner"
    >
      <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-on-surface-variant hover:bg-surface-container-high p-1 rounded-lg transition-colors"
            aria-label="Abrir menú de navegación"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        )}
        <h1 className="text-headline-md font-headline-md text-on-surface truncate w-full sm:w-auto text-center sm:text-left">
          {titulo}
        </h1>
      </div>
      {accionDerecha && (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
          {accionDerecha}
        </div>
      )}
    </header>
  );
};

export default BarraSuperior;
