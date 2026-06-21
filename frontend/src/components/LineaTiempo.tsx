// LineaTiempo.tsx — Timeline de actividad reciente del Dashboard (Spec §9.1)
import React from 'react';
import type { MovimientoActividad } from '../services/tipos';

interface PropsLineaTiempo {
  movimientos: MovimientoActividad[];
  cargando?: boolean;
}

/**
 * Timeline vertical de los últimos movimientos de check-in/check-out.
 * Spec §9.1: Últimos 10 movimientos, orden descendente por hora.
 * - Check-in → icono verde (tertiary) con 'login'
 * - Check-out → icono ámbar (secondary) con 'logout'
 */
const LineaTiempo: React.FC<PropsLineaTiempo> = ({ movimientos, cargando = false }) => {
  if (cargando) {
    return (
      <div className="space-y-stack-md animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-surface-container-high shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-surface-container-high rounded-full w-4/5" />
              <div className="h-3 bg-surface-container-high rounded-full w-2/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <p className="text-body-sm text-on-surface-variant text-center py-8">
        Sin actividad registrada hoy.
      </p>
    );
  }

  return (
    <div className="space-y-stack-md">
      {movimientos.map((mov, idx) => {
        const esCheckin = mov.tipo === 'checkin';
        const esUltimo = idx === movimientos.length - 1;

        return (
          <div key={mov.idAsistencia + mov.tipo} className="flex items-start gap-3 relative pb-stack-md last:pb-0">
            {/* Línea vertical conectora */}
            {!esUltimo && (
              <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-outline-variant/30" aria-hidden="true" />
            )}

            {/* Icono del movimiento */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 ${
                esCheckin ? 'bg-tertiary' : 'bg-secondary'
              }`}
              aria-hidden="true"
            >
              <span
                className={`material-symbols-outlined text-[14px] ${esCheckin ? 'text-on-tertiary' : 'text-on-secondary'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {esCheckin ? 'login' : 'logout'}
              </span>
            </div>

            {/* Descripción del movimiento */}
            <div className="flex-grow min-w-0">
              <p className="text-body-sm text-on-surface">
                <span className="font-bold">{mov.nombreNino}</span>{' '}
                {esCheckin ? 'check-in' : 'check-out'}
              </p>
              <p className="text-[12px] text-on-surface-variant">
                {mov.grupo} • {mov.hora}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LineaTiempo;
