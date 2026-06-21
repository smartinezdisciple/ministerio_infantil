// GraficaLinea.tsx — Gráfica de línea simple con SVG (sin dependencias externas)
import React, { useMemo } from 'react';

interface PuntoDatos {
  etiqueta: string;
  valor: number;
}

interface PropsGraficaLinea {
  datos: PuntoDatos[];
  titulo: string;
  colorLinea?: string;
  colorArea?: string;
  altura?: number;
}

const GraficaLinea: React.FC<PropsGraficaLinea> = ({
  datos,
  titulo,
  colorLinea = '#2a7de1',
  colorArea = 'rgba(42,125,225,0.1)',
  altura = 180,
}) => {
  const { puntos, pathLinea, pathArea, etiquetasX } = useMemo(() => {
    if (datos.length === 0) return { puntos: [], maxValor: 0, pathLinea: '', pathArea: '', etiquetasX: [] };

    const maxV = Math.max(...datos.map(d => d.valor), 1);
    const ancho = 100;
    const pasoX = ancho / Math.max(datos.length - 1, 1);

    const pts = datos.map((d, i) => {
      let x = i * pasoX;
      if (datos.length === 1) {
        x = 50; // Centrar si es un solo punto
      }
      return {
        x,
        y: altura - (d.valor / maxV) * (altura - 30) - 10,
        valor: d.valor,
        etiqueta: d.etiqueta,
      };
    });

    const linea = datos.length === 1
      ? `M 0 ${pts[0].y} L 100 ${pts[0].y}`
      : pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const area = datos.length === 1
      ? `M 0 ${pts[0].y} L 100 ${pts[0].y} L 100 ${altura} L 0 ${altura} Z`
      : `${linea} L ${pts[pts.length - 1].x} ${altura} L ${pts[0].x} ${altura} Z`;

    return { puntos: pts, pathLinea: linea, pathArea: area, etiquetasX: pts };
  }, [datos, altura]);

  if (datos.length === 0) {
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
      <svg
        viewBox={`0 0 100 ${altura}`}
        className="w-full"
        style={{ height: `${altura}px` }}
        preserveAspectRatio="none"
      >
        {/* Área bajo la línea */}
        <path d={pathArea} fill={colorArea} />
        {/* Línea */}
        <path d={pathLinea} fill="none" stroke={colorLinea} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {/* Puntos */}
        {puntos.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="2" fill={colorLinea} vectorEffect="non-scaling-stroke" />
            <text
              x={p.x}
              y={p.y - 6}
              textAnchor="middle"
              className="fill-on-surface font-semibold"
              fontSize="5"
              fontFamily="Inter, sans-serif"
            >
              {p.valor}
            </text>
          </g>
        ))}
        {/* Etiquetas X */}
        {etiquetasX.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={altura - 2}
            textAnchor="middle"
            className="fill-on-surface-variant"
            fontSize="4"
            fontFamily="Inter, sans-serif"
          >
            {p.etiqueta}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default GraficaLinea;
