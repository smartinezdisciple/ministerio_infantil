// CampoTexto.tsx — Input reutilizable con icono (CLAUDE.md §3.3: PascalCase)
import React from 'react';
import type { PropsCampoTexto } from '../services/tipos';

/**
 * Campo de texto reutilizable con icono a la izquierda.
 * Soporta tipo texto y contraseña con toggle de visibilidad.
 * Muestra borde rojo y mensaje de error cuando hay validación fallida.
 */
const CampoTexto: React.FC<PropsCampoTexto> = ({
  tipo,
  etiqueta,
  icono,
  placeholder,
  valor,
  alCambiar,
  errorMensaje,
  deshabilitado = false,
  enlaceAuxiliar,
  mostrarContrasena,
  alAlternarVisibilidad,
}) => {
  // Si es password y se está mostrando, cambiar tipo a text
  const tipoInput = tipo === 'password' && mostrarContrasena ? 'text' : tipo;

  return (
    <div className="flex flex-col gap-2">
      {/* Fila de etiqueta + enlace auxiliar (ej. "¿Olvidaste tu contraseña?") */}
      <div className="flex justify-between items-center">
        <label
          className="font-label-md text-label-md text-on-surface"
          htmlFor={etiqueta.toLowerCase().replace(/\s/g, '-')}
        >
          {etiqueta}
        </label>
        {enlaceAuxiliar && (
          <button
            type="button"
            onClick={enlaceAuxiliar.alHacerClic}
            className="font-label-md text-label-md text-secondary hover:text-error transition-colors duration-200"
          >
            {enlaceAuxiliar.texto}
          </button>
        )}
      </div>

      {/* Contenedor del input con icono */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
          {icono}
        </span>
        <input
          id={etiqueta.toLowerCase().replace(/\s/g, '-')}
          type={tipoInput}
          placeholder={placeholder}
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          disabled={deshabilitado}
          className={`
            w-full h-12 pl-12 pr-${tipo === 'password' ? '12' : '4'}
            bg-surface-container-low border rounded-lg
            font-body-md text-body-md text-on-surface
            focus:outline-none focus:ring-2 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              errorMensaje
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-surface-variant focus:border-secondary focus:ring-secondary/20'
            }
          `}
        />

        {/* Botón toggle de visibilidad para contraseña */}
        {tipo === 'password' && alAlternarVisibilidad && (
          <button
            type="button"
            onClick={alAlternarVisibilidad}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors duration-200"
          >
            <span className="material-symbols-outlined">
              {mostrarContrasena ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {errorMensaje && (
        <p className="text-error text-sm font-label-md flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {errorMensaje}
        </p>
      )}
    </div>
  );
};

export default CampoTexto;
