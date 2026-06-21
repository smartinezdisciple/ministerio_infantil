// BadgeEstado.tsx — Badge de estado reutilizable (CLAUDE.md §8.3 — Badges de Estado)
import React from 'react';
import type { EstadoAsistencia, EstadoAsistenciaGrupo, EstadoLlegada } from '../services/tipos';

type EstadoBadge = EstadoAsistencia | EstadoAsistenciaGrupo | EstadoLlegada | 'Temporal' | 'Alta' | 'Moderada' | 'Leve';

interface PropsBadgeEstado {
  estado: EstadoBadge;
  /** Si true, el badge aparece en mayúsculas (para estados de severidad médica) */
  mayusculas?: boolean;
}

/**
 * Mapeo de estado → clases Tailwind (CLAUDE.md §8.3 Badges de Estado).
 * Todos los estados del dominio están cubiertos.
 */
const ESTILOS_BADGE: Record<EstadoBadge, string> = {
  // Asistencia de niños
  Pendiente:     'bg-secondary-container/20 text-secondary',
  Completado:    'bg-tertiary/15 text-tertiary',
  Retirado:      'bg-outline/15 text-on-surface-variant',
  // Asistencia por grupo
  Presente:      'bg-tertiary/15 text-tertiary',
  Ausente:       'bg-outline/15 text-on-surface-variant',
  // Asistencia de personal
  Temprano:      'bg-tertiary-fixed-dim/20 text-tertiary',
  Tarde:         'bg-secondary-fixed/50 text-secondary',
  Justificado:   'bg-primary-fixed/50 text-primary',
  Injustificado: 'bg-error-container text-on-error-container',
  // Contactos
  Temporal:      'bg-secondary-container/30 text-secondary',
  // Severidad médica
  Alta:          'bg-error-container text-on-error-container',
  Moderada:      'bg-secondary-fixed/50 text-secondary',
  Leve:          'bg-surface-container-high text-on-surface-variant',
};

/**
 * Badge pill para mostrar estados de asistencia, llegada o tipo de contacto.
 * Uso: <BadgeEstado estado="Pendiente" />
 */
const BadgeEstado: React.FC<PropsBadgeEstado> = ({ estado, mayusculas = false }) => {
  const clases = ESTILOS_BADGE[estado] ?? 'bg-surface-container text-on-surface-variant';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${clases} ${
        mayusculas ? 'uppercase tracking-wide text-[11px]' : ''
      }`}
    >
      {estado}
    </span>
  );
};

export default BadgeEstado;
