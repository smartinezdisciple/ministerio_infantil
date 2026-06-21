// BotonPrimario.tsx — Botón con animación, spinner y estado bloqueado
import React from 'react';
import type { PropsBotonPrimario } from '../services/tipos';

/**
 * Botón principal del formulario de login.
 * Estados: normal, cargando (spinner), deshabilitado/bloqueado.
 * Preserva la animación hover:scale-[0.98] del diseño Stitch.
 */
const BotonPrimario: React.FC<PropsBotonPrimario> = ({
  texto,
  cargando,
  deshabilitado,
  alHacerClic,
}) => {
  return (
    <button
      type="submit"
      onClick={alHacerClic}
      disabled={deshabilitado || cargando}
      className={`
        mt-2 w-full h-14 rounded-lg
        font-label-md text-label-md
        flex items-center justify-center gap-2
        relative overflow-hidden group
        transition-all duration-200
        ${
          deshabilitado || cargando
            ? 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed'
            : 'bg-primary-container text-on-primary-container hover:scale-[0.98] hover:bg-primary-fixed hover:shadow-lg'
        }
      `}
    >
      {/* Brillo superior sutil al hover */}
      <div className="absolute inset-0 bg-white/20 w-full h-[2px] top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <span className="relative z-10 flex items-center gap-2">
        {cargando ? (
          <>
            {/* Spinner de carga */}
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Verificando...
          </>
        ) : (
          <>
            {texto}
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </>
        )}
      </span>
    </button>
  );
};

export default BotonPrimario;
