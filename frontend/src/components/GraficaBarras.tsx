// GraficaBarras.tsx — Gráfica de barras simple con HTML y CSS (máxima nitidez tipográfica)
import React, { useMemo } from 'react';

interface PuntoDatos {
  etiqueta: string;
  valor: number;
}

interface PropsGraficaBarras {
  datos: PuntoDatos[];
  titulo: string;
  colorBarra?: string;
  altura?: number;
}

const GraficaBarras: React.FC<PropsGraficaBarras> = ({
  datos,
  titulo,
  colorBarra = '#2a7de1',
  altura = 180,
}) => {
  const { maxValor, items } = useMemo(() => {
    if (datos.length === 0) return { maxValor: 0, items: [] };
    const maxV = Math.max(...datos.map(d => d.valor), 1);
    return { maxValor: maxV, items: datos };
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
    <div 
      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-gutter shadow-sm flex flex-col justify-between"
      style={{ minHeight: `${altura}px` }}
    >
      <h3 className="text-label-md font-label-md text-on-surface-variant mb-4">{titulo}</h3>
      
      {/* Contenedor principal de barras en flexbox para perfecta adaptabilidad */}
      <div className="flex-1 flex items-end justify-around gap-4 px-2 min-h-[100px] mb-2">
        {items.map((item, idx) => {
          const porcentaje = (item.valor / maxValor) * 100;
          return (
            <div key={idx} className="flex flex-col items-center flex-1 group max-w-[64px]">
              {/* Valor numérico sobre la barra */}
              <span className="text-[12px] font-semibold text-on-surface mb-1 transition-all group-hover:scale-105 select-none">
                {item.valor}
              </span>
              
              {/* Barra de color con bordes superiores redondeados y efecto hover */}
              <div 
                className="w-full rounded-t-lg transition-all duration-300 hover:opacity-90 hover:shadow-sm cursor-pointer"
                style={{ 
                  height: `${Math.max(porcentaje, 4)}%`,
                  backgroundColor: colorBarra,
                  minHeight: '4px'
                }}
                title={`${item.etiqueta}: ${item.valor} niños`}
              />
              
              {/* Eje horizontal local */}
              <div className="w-full h-[1px] bg-outline-variant/30 mt-0" />
              
              {/* Etiqueta del mes (texto HTML nítido) */}
              <span className="text-[11px] font-medium text-on-surface-variant mt-1.5 capitalize select-none">
                {item.etiqueta}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GraficaBarras;
