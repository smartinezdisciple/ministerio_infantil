// ContadorBadge.tsx — Contador/badge grande para solicitudes pendientes (Spec §9.1.4)
import React from 'react';

interface PropsContadorBadge {
  valor: number;
  titulo: string;
  subtitulo?: string;
}

const ContadorBadge: React.FC<PropsContadorBadge> = ({ valor, titulo, subtitulo }) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-gutter shadow-sm text-center">
      <h3 className="text-label-md font-label-md text-on-surface-variant mb-2">{titulo}</h3>
      <div className="flex items-center justify-center">
        <span className={`text-display-lg font-display-lg ${valor > 0 ? 'text-secondary' : 'text-on-surface-variant'}`}>
          {valor}
        </span>
      </div>
      {subtitulo && (
        <p className="text-label-sm text-on-surface-variant mt-1">{subtitulo}</p>
      )}
      {valor > 0 && (
        <div className="mt-3 inline-flex items-center gap-1 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-label-sm font-semibold">
          <span className="material-symbols-outlined text-[16px]">pending</span>
          Requieren atención
        </div>
      )}
    </div>
  );
};

export default ContadorBadge;
