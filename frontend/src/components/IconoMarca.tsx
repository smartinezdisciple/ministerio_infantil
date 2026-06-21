// IconoMarca.tsx — Círculo de marca con icono de biblia
import React from 'react';

/**
 * Icono circular amarillo con el símbolo de libro abierto.
 * Representa la identidad visual del Ministerio Infantil HLV.
 */
const IconoMarca: React.FC = () => {
  return (
    <div className="flex justify-center mb-2">
      <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-on-primary-container text-[24px]">
          menu_book
        </span>
      </div>
    </div>
  );
};

export default IconoMarca;
