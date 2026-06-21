// ItemCumpleanero.tsx — Fila de cumpleañero del mes (Spec §9.1, MVP-05)
import React from 'react';
import type { Cumpleanero } from '../services/tipos';

interface PropsItemCumpleanero {
  cumpleanero: Cumpleanero;
}

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

/** Genera un color de avatar consistente basado en el nombre */
const colorAvatar = (nombre: string): string => {
  const colores = [
    'bg-primary/20 text-primary',
    'bg-tertiary/20 text-tertiary',
    'bg-secondary/20 text-secondary',
    'bg-error/10 text-error',
  ];
  const indice = nombre.charCodeAt(0) % colores.length;
  return colores[indice];
};

/**
 * Fila de cumpleañero para el widget del Dashboard.
 * Muestra: avatar con iniciales, nombre, grupo y fecha del cumpleaños.
 * Spec §9.1, MVP-05: EXTRACT(MONTH FROM Fecha_Nacimiento) = mes actual.
 */
const ItemCumpleanero: React.FC<PropsItemCumpleanero> = ({ cumpleanero }) => {
  const mesActual = MESES[new Date().getMonth()];
  const iniciales = `${cumpleanero.nombres[0]}${cumpleanero.apellidos[0]}`.toUpperCase();

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors border-b border-outline-variant/10 last:border-0">
      {/* Avatar con iniciales */}
      <div
        className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-label-md font-bold ${colorAvatar(cumpleanero.nombres)}`}
        aria-hidden="true"
      >
        {iniciales}
      </div>

      {/* Nombre y grupo */}
      <div className="flex-grow min-w-0">
        <h3 className="text-label-md font-label-md text-on-surface truncate">
          {cumpleanero.nombres} {cumpleanero.apellidos}
        </h3>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
            cumpleanero.tipo === 'Niño' ? 'bg-primary/15 text-primary' : 'bg-tertiary/15 text-tertiary'
          }`}>
            {cumpleanero.tipo}
          </span>
          <span className="text-body-sm text-on-surface-variant truncate">
            {cumpleanero.tipo === 'Niño' ? cumpleanero.grupo : cumpleanero.rol}
          </span>
          {cumpleanero.tipo === 'Personal' && cumpleanero.turno && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary/15 text-secondary truncate" title={cumpleanero.turno}>
              Turno: {cumpleanero.turno}
            </span>
          )}
        </div>
      </div>

      {/* Fecha */}
      <div className="text-right shrink-0">
        <p className="text-label-md font-label-md text-secondary">
          {cumpleanero.diaCumpleanos} de {mesActual}
        </p>
      </div>
    </div>
  );
};

export default ItemCumpleanero;
