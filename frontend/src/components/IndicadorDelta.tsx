// IndicadorDelta.tsx — Indicador de comparativa mes anterior (Spec §9.1.4)
import React from 'react';

interface PropsIndicadorDelta {
  valorActual: number;
  valorAnterior: number | null;
  titulo: string;
}

const IndicadorDelta: React.FC<PropsIndicadorDelta> = ({ valorActual, valorAnterior, titulo }) => {
  const diferencia = valorAnterior !== null ? valorActual - valorAnterior : null;
  const porcentaje = valorAnterior && valorAnterior > 0
    ? ((diferencia! / valorAnterior) * 100).toFixed(1)
    : null;

  const esPositivo = diferencia !== null && diferencia >= 0;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-gutter shadow-sm">
      <h3 className="text-label-md font-label-md text-on-surface-variant mb-2">{titulo}</h3>
      <div className="flex items-end gap-3">
        <span className="text-display-lg font-display-lg text-on-surface">{valorActual}</span>
        {diferencia !== null && (
          <div className={`flex items-center gap-1 pb-1 ${esPositivo ? 'text-tertiary' : 'text-error'}`}>
            <span className="material-symbols-outlined text-[20px]">
              {esPositivo ? 'trending_up' : 'trending_down'}
            </span>
            <span className="text-label-md font-label-md">
              {esPositivo ? '+' : ''}{diferencia}
              {porcentaje && ` (${esPositivo ? '+' : ''}${porcentaje}%)`}
            </span>
          </div>
        )}
      </div>
      {valorAnterior !== null && (
        <p className="text-label-sm text-on-surface-variant mt-1">
          Mes anterior: {valorAnterior}
        </p>
      )}
    </div>
  );
};

export default IndicadorDelta;
