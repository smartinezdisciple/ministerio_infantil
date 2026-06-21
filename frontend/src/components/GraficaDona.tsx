// GraficaDona.tsx — Gráfica de dona/distribución con SVG
import React, { useMemo } from 'react';

interface Segmento {
  etiqueta: string;
  valor: number;
  color: string;
}

interface PropsGraficaDona {
  datos: Segmento[];
  titulo: string;
  tamano?: number;
}

const GraficaDona: React.FC<PropsGraficaDona> = ({ datos, titulo, tamano = 160 }) => {
  const { segmentos, total } = useMemo(() => {
    const tot = datos.reduce((s, d) => s + d.valor, 0);
    if (tot === 0) return { segmentos: [], total: 0 };

    const cx = 50, cy = 50, r = 40;
    let anguloInicio = -90;
    const segs = datos.map((d) => {
      const angulo = (d.valor / tot) * 360;
      const inicio = anguloInicio;
      const fin = anguloInicio + angulo;
      anguloInicio = fin;

      const radInicio = (inicio * Math.PI) / 180;
      const radFin = (fin * Math.PI) / 180;
      const x1 = cx + r * Math.cos(radInicio);
      const y1 = cy + r * Math.sin(radInicio);
      const x2 = cx + r * Math.cos(radFin);
      const y2 = cy + r * Math.sin(radFin);
      const arcoGrande = angulo > 180 ? 1 : 0;

      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${arcoGrande} 1 ${x2} ${y2} Z`;

      return { ...d, path, porcentaje: ((d.valor / tot) * 100).toFixed(1) };
    });

    return { segmentos: segs, total: tot };
  }, [datos]);

  if (total === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-gutter shadow-sm">
        <h3 className="text-label-md font-label-md text-on-surface-variant mb-3">{titulo}</h3>
        <p className="text-body-sm text-on-surface-variant text-center py-8">Sin datos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-gutter shadow-sm">
      <h3 className="text-label-md font-label-md text-on-surface-variant mb-3">{titulo}</h3>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="shrink-0" style={{ width: tamano, height: tamano }}>
          {segmentos.map((seg, i) => (
            <path key={i} d={seg.path} fill={seg.color} className="transition-opacity hover:opacity-80" />
          ))}
          {/* Círculo central (donut hole) */}
          <circle cx="50" cy="50" r="26" fill="var(--color-surface-container-lowest, #ffffff)" />
          <text x="50" y="48" textAnchor="middle" className="fill-on-surface" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            {total}
          </text>
          <text x="50" y="58" textAnchor="middle" className="fill-on-surface-variant" fontSize="4" fontFamily="Inter, sans-serif">
            total
          </text>
        </svg>
        <div className="flex flex-col gap-2">
          {segmentos.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-body-sm text-on-surface">{seg.etiqueta}</span>
              <span className="text-body-sm text-on-surface-variant ml-auto">{seg.porcentaje}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraficaDona;
