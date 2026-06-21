// BotonLlamada.tsx — Enlace de llamada rápida tel: (Spec §9.6, MVP-03)
import React from 'react';

interface PropsBotonLlamada {
  telefono: string;
  nombre: string;
  /** Si true, muestra solo el icono sin texto */
  soloIcono?: boolean;
}

/**
 * Botón de llamada rápida con enlace tel:.
 * Facilita el contacto inmediato en emergencias (Spec §9.6).
 * Diseño: pill verde con icono de teléfono.
 */
const BotonLlamada: React.FC<PropsBotonLlamada> = ({
  telefono,
  nombre,
  soloIcono = false,
}) => {
  // Limpia el teléfono para el href (solo dígitos y +)
  const telefonoLimpio = telefono.replace(/[^\d+]/g, '');

  return (
    <a
      href={`tel:${telefonoLimpio}`}
      aria-label={`Llamar a ${nombre}: ${telefono}`}
      className={`
        inline-flex items-center gap-2
        bg-tertiary/10 text-tertiary
        hover:bg-tertiary/20 active:scale-95
        rounded-full transition-all duration-150 font-label-md
        ${soloIcono ? 'p-2' : 'px-3 py-1.5'}
      `}
    >
      <span className="material-symbols-outlined text-[18px]">call</span>
      {!soloIcono && (
        <span className="text-label-sm">{telefono}</span>
      )}
    </a>
  );
};

export default BotonLlamada;
