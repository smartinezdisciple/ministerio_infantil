// GraficaBarrasApiladas.tsx — Gráfica de barras apiladas para asistencia personal por rol
import React, { useMemo } from 'react';

interface BarraRol {
  rol: string;
  temprano: number;
  tarde: number;
  justificado: number;
  injustificado: number;
}

interface PropsGraficaBarras {
  datos: BarraRol[];
  titulo: string;
}

const COLORES = {
  temprano: '#006a35',
  tarde: '#8f4e00',
  justificado: '#2a7de1',
  injustificado: '#ba1a1a',
};

const GraficaBarrasApiladas: React.FC<PropsGraficaBarras> = ({ datos, titulo }) => {
  const { barras } = useMemo(() => {
    const maxTotal = Math.max(...datos.map(d => d.temprano + d.tarde + d.justificado + d.injustificado), 1);
    const anchoBarra = 100;
    const alto = 120;
    const espacio = 8;

    const items = datos.map((d, i) => {
      const total = d.temprano + d.tarde + d.justificado + d.injustificado;
      const x = i * (anchoBarra + espacio);
      const w = anchoBarra;

      const segmentos = [
        { valor: d.temprano, color: COLORES.temprano, label: 'Temprano' },
        { valor: d.tarde, color: COLORES.tarde, label: 'Tarde' },
        { valor: d.justificado, color: COLORES.justificado, label: 'Justificado' },
        { valor: d.injustificado, color: COLORES.injustificado, label: 'Injustificado' },
      ].filter(s => s.valor > 0);

      let yAcum = alto - 20;
      const rects = segmentos.map(seg => {
        const h = (seg.valor / maxTotal) * (alto - 40);
        const y = yAcum - h;
        yAcum = y;
        return { ...seg, x, y, w, h };
      });

      return { rol: d.rol, x, rects, total };
    });

    return { barras: items };
  }, [datos]);

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
      <div className="flex items-end gap-2" style={{ height: '140px' }}>
        {barras.map((barra, i) => (
          <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
            <div className="relative w-full flex flex-col-reverse" style={{ height: '100px' }}>
              {barra.rects.map((seg, j) => (
                <div
                  key={j}
                  style={{
                    backgroundColor: seg.color,
                    height: `${Math.max(seg.h, 2)}px`,
                    width: '100%',
                    borderRadius: j === barra.rects.length - 1 ? '4px 4px 0 0' : '0',
                  }}
                  title={`${seg.label}: ${seg.valor}`}
                />
              ))}
            </div>
            <span className="text-label-sm text-on-surface-variant mt-1 text-center truncate w-full">
              {barra.rol}
            </span>
          </div>
        ))}
      </div>
      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-outline-variant/30">
        {[
          { label: 'Temprano', color: COLORES.temprano },
          { label: 'Tarde', color: COLORES.tarde },
          { label: 'Justificado', color: COLORES.justificado },
          { label: 'Injustificado', color: COLORES.injustificado },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-label-sm text-on-surface-variant">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraficaBarrasApiladas;
