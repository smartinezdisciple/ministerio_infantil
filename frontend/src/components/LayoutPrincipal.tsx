// LayoutPrincipal.tsx — Layout base para todas las páginas post-login (Plan Maestro §Módulo 1)
import React, { useState } from 'react';
import BarraLateral from './BarraLateral';
import BarraSuperior from './BarraSuperior';

interface PropsLayoutPrincipal {
  /** Título que se muestra en la BarraSuperior */
  titulo: string;
  /** Contenido de la página */
  children: React.ReactNode;
  /** Acción opcional en la barra superior (ej: botón "Nuevo Check-in") */
  accionBarra?: React.ReactNode;
}

/**
 * Layout principal post-login.
 * Estructura: flex h-screen → BarraLateral (sticky) + columna derecha.
 * La columna derecha: BarraSuperior (sticky) + main (scroll).
 * Todas las páginas internas deben envolver su contenido con este layout.
 */
const LayoutPrincipal: React.FC<PropsLayoutPrincipal> = ({
  titulo,
  children,
  accionBarra,
}) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar persistente y responsivo */}
      <BarraLateral abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      {/* Columna de contenido */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar con toggle para mobile */}
        <BarraSuperior 
          titulo={titulo} 
          accionDerecha={accionBarra} 
          onMenuToggle={() => setMenuAbierto(true)} 
        />

        {/* Área de contenido con scroll */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-container-margin-desktop"
          id="contenido-principal"
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutPrincipal;
