// IndicadorContrasena.tsx — Checklist visual de requisitos en tiempo real (CLAUDE.md §4.5)
import React from 'react';
import type { PropsIndicadorContrasena } from '../services/tipos';

/**
 * Muestra un checklist de 4 requisitos de contraseña debajo del campo.
 * Cada requisito cambia de rojo (❌) a verde (✅) en tiempo real
 * mientras el usuario escribe.
 * Solo se renderiza cuando el usuario ha comenzado a escribir.
 */
const IndicadorContrasena: React.FC<PropsIndicadorContrasena> = ({
  validacion,
  visible,
}) => {
  if (!visible) return null;

  const requisitos = [
    {
      cumple: validacion.longitudMinima,
      texto: 'Mínimo 8 caracteres',
    },
    {
      cumple: validacion.tieneMayuscula,
      texto: 'Al menos 1 letra mayúscula',
    },
    {
      cumple: validacion.tieneNumero,
      texto: 'Al menos 1 número',
    },
    {
      cumple: validacion.tieneEspecial,
      texto: 'Al menos 1 carácter especial (!@#$...)',
    },
  ];

  return (
    <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-1.5 border border-surface-variant/50">
      <p className="text-xs font-label-md text-on-surface-variant mb-0.5">
        Requisitos de contraseña:
      </p>
      {requisitos.map((requisito) => (
        <div
          key={requisito.texto}
          className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
            requisito.cumple ? 'text-green-600' : 'text-red-500'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {requisito.cumple ? 'check_circle' : 'cancel'}
          </span>
          <span>{requisito.texto}</span>
        </div>
      ))}
    </div>
  );
};

export default IndicadorContrasena;
