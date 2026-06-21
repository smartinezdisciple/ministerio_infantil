// ModalBase.tsx — Modal overlay reutilizable (CLAUDE.md §8.3 — Modales)
import React, { useEffect, useRef } from 'react';

interface PropsModalBase {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
  /** Ancho máximo del modal. Default: 'max-w-lg' */
  ancho?: string;
  /** Slot para los botones del footer */
  footer?: React.ReactNode;
}

/**
 * Modal overlay reutilizable.
 * - Bloquea el scroll del body cuando está abierto (useEffect).
 * - Cierra con Escape o click en el overlay.
 * - Accesible: role="dialog", aria-modal, aria-labelledby.
 * Diseño: overlay backdrop-blur + contenido rounded-2xl (CLAUDE.md §8.3)
 */
const ModalBase: React.FC<PropsModalBase> = ({
  abierto,
  onCerrar,
  titulo,
  children,
  ancho = 'max-w-lg',
  footer,
}) => {
  const tituloId = `modal-titulo-${titulo.replace(/\s+/g, '-').toLowerCase()}`;
  const panelRef = useRef<HTMLDivElement>(null);

  // Bloquea scroll del body y del contenedor principal cuando el modal está abierto
  useEffect(() => {
    const mainEl = document.getElementById('contenido-principal');
    if (abierto) {
      document.body.style.overflow = 'hidden';
      if (mainEl) {
        mainEl.style.overflow = 'hidden';
      }
      // Focus automático al panel del modal
      panelRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      if (mainEl) {
        mainEl.style.overflow = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
      if (mainEl) {
        mainEl.style.overflow = '';
      }
    };
  }, [abierto]);

  // Cierre con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) onCerrar();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Overlay semi-transparente con blur */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden="true"
      />

      {/* Panel del modal */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={`
          relative z-10 w-full ${ancho}
          bg-surface-container-lowest rounded-2xl shadow-2xl
          flex flex-col max-h-[90vh]
          animate-[aparecer_0.2s_ease-out]
          outline-none
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-gutter py-4 border-b border-outline-variant/50 shrink-0">
          <h2 id={tituloId} className="text-headline-md font-headline-md text-on-surface">
            {titulo}
          </h2>
          <button
            onClick={onCerrar}
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg p-1.5 transition-colors"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Cuerpo con scroll si es necesario */}
        <div className="overflow-y-auto flex-1 px-gutter py-4">
          {children}
        </div>

        {/* Footer opcional */}
        {footer && (
          <div className="flex justify-end gap-3 px-gutter py-4 border-t border-outline-variant/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalBase;
