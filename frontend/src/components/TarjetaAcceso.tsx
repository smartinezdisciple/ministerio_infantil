// TarjetaAcceso.tsx — Tarjeta grande de acceso rápido del Dashboard (Spec §9.1.5)
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PropsTarjetaAcceso {
  icono: string;
  titulo: string;
  descripcion: string;
  ruta: string;
  colorIcono: string;
  fondoIcono: string;
}

const TarjetaAcceso: React.FC<PropsTarjetaAcceso> = ({
  icono,
  titulo,
  descripcion,
  ruta,
  colorIcono,
  fondoIcono,
}) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(ruta)}
      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-outline-variant/50 transition-all active:scale-[0.98] text-left flex flex-col items-center text-center gap-4 group"
      aria-label={`Ir a ${titulo}`}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${fondoIcono} group-hover:scale-110 transition-transform`}>
        <span className={`material-symbols-outlined text-[36px] ${colorIcono}`} aria-hidden="true">
          {icono}
        </span>
      </div>
      <div>
        <h3 className="text-headline-md font-headline-md text-on-surface">{titulo}</h3>
        <p className="text-body-sm text-on-surface-variant mt-1">{descripcion}</p>
      </div>
    </button>
  );
};

export default TarjetaAcceso;
