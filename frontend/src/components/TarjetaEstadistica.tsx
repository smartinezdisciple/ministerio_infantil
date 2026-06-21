// TarjetaEstadistica.tsx — Card de contador del resumen del día (Spec §9.1)
import React from 'react';

type ColorAccento = 'primary' | 'secondary' | 'tertiary';

interface PropsTarjetaEstadistica {
  etiqueta: string;
  valor: number | string;
  icono: string;
  colorAccento: ColorAccento;
}

const COLORES: Record<ColorAccento, { texto: string; fondo: string }> = {
  primary:   { texto: 'text-primary',   fondo: 'bg-primary/10' },
  secondary: { texto: 'text-secondary', fondo: 'bg-secondary/10' },
  tertiary:  { texto: 'text-tertiary',  fondo: 'bg-tertiary/10' },
};

/**
 * Card de métrica para el resumen del día del Dashboard (Spec §9.1).
 * Muestra: etiqueta, valor grande y un icono con color de acento.
 */
const TarjetaEstadistica: React.FC<PropsTarjetaEstadistica> = ({
  etiqueta,
  valor,
  icono,
  colorAccento,
}) => {
  const { texto, fondo } = COLORES[colorAccento];

  return (
    <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30 flex items-center justify-between">
      <div>
        <p className="text-label-sm font-label-sm text-on-surface-variant">{etiqueta}</p>
        <p className={`text-headline-lg font-headline-lg ${texto} leading-tight mt-0.5`}>
          {String(valor).padStart(2, '0')}
        </p>
      </div>
      <span
        className={`material-symbols-outlined text-[36px] ${texto} ${fondo} p-3 rounded-full`}
        aria-hidden="true"
      >
        {icono}
      </span>
    </div>
  );
};

export default TarjetaEstadistica;
