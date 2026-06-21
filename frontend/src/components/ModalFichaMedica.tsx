// ModalFichaMedica.tsx — Modal de información médica completa del niño (Spec §9.3)
import React from 'react';
import ModalBase from './ModalBase';
import type { Nino, InfoMedica } from '../services/tipos';

interface PropsModalFichaMedica {
  abierto: boolean;
  onCerrar: () => void;
  nino: Nino | null;
}

const ICONO_TIPO: Record<InfoMedica['tipo'], string> = {
  Alergia:     'dangerous',
  Medicamento: 'medication',
  Condicion:   'clinical_notes',
};

const ETIQUETA_TIPO: Record<InfoMedica['tipo'], string> = {
  Alergia:     'Alergias',
  Medicamento: 'Medicamentos',
  Condicion:   'Condiciones',
};

const ESTILOS_SEVERIDAD: Record<InfoMedica['severidad'], string> = {
  Alta:     'bg-error-container/60 border-error/20 text-on-error-container',
  Moderada: 'bg-secondary-fixed/30 border-secondary/10 text-on-secondary-fixed-variant',
  Leve:     'bg-surface-container border-outline-variant text-on-surface-variant',
};

const ICONO_TIPO_RENDER: Record<InfoMedica['tipo'], string> = {
  Alergia:     'emergency',
  Medicamento: 'schedule',
  Condicion:   'priority_high',
};

/**
 * Modal de ficha médica completa de un niño.
 * Spec §9.3: Visible para Maestros del grupo asignado (R-04) y Staff/Coordinador.
 * Agrupa alertas por tipo (Condición, Alergia, Medicamento) y muestra instrucciones.
 * Header con fondo primary para prioridad visual.
 */
const ModalFichaMedica: React.FC<PropsModalFichaMedica> = ({ abierto, onCerrar, nino }) => {
  if (!nino) return null;

  const iniciales = `${nino.nombres[0]}${nino.apellidos[0]}`;

  // Agrupar alertas por tipo
  const alertasPorTipo = nino.alertasMedicas.reduce<Record<InfoMedica['tipo'], InfoMedica[]>>(
    (acc, alerta) => {
      if (!acc[alerta.tipo]) acc[alerta.tipo] = [];
      acc[alerta.tipo].push(alerta);
      return acc;
    },
    {} as Record<InfoMedica['tipo'], InfoMedica[]>
  );

  const tiposPresentes = Object.keys(alertasPorTipo) as InfoMedica['tipo'][];
  const tieneAlertaAlta = nino.alertasMedicas.some((a) => a.severidad === 'Alta');

  const footer = (
    <button
      onClick={onCerrar}
      className="h-12 px-8 rounded-xl font-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-md active:scale-95"
    >
      Entendido
    </button>
  );

  return (
    <ModalBase
      abierto={abierto}
      onCerrar={onCerrar}
      titulo=""
      footer={footer}
      ancho="max-w-lg"
    >
      {/* Header con fondo primary (diseño de la maqueta) */}
      <div className="-mx-gutter -mt-4 mb-stack-lg bg-primary text-on-primary px-gutter py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar grande */}
          <div className="w-16 h-16 rounded-2xl bg-primary-fixed/30 border-2 border-primary-fixed-dim flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-[22px] font-bold text-on-primary">{iniciales}</span>
          </div>
          <div>
            <h3 className="text-headline-md font-headline-md leading-tight">{nino.nombreCompleto}</h3>
            <p className="text-label-sm text-primary-fixed-dim mt-0.5">
              {tieneAlertaAlta ? 'Información Médica Crítica' : 'Información Médica'}
            </p>
            <p className="text-label-sm text-primary-fixed-dim">{nino.grupo.nombre}</p>
          </div>
        </div>
        {tieneAlertaAlta && (
          <span
            className="material-symbols-outlined text-[28px] animate-[pulsar-alerta_2s_ease-in-out_infinite]"
            aria-label="Alerta de alta prioridad"
            aria-hidden="true"
          >
            warning
          </span>
        )}
      </div>

      <div className="space-y-stack-lg">
        {/* Sin alertas */}
        {tiposPresentes.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] text-tertiary" aria-hidden="true">
              check_circle
            </span>
            <p className="text-body-md">No hay alertas médicas registradas.</p>
          </div>
        )}

        {/* Alertas agrupadas por tipo */}
        {tiposPresentes.map((tipo) => (
          <div key={tipo} className="space-y-base">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                {ICONO_TIPO[tipo]}
              </span>
              <h4 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                {ETIQUETA_TIPO[tipo]}
              </h4>
            </div>

            {alertasPorTipo[tipo].map((alerta) => (
              <div
                key={alerta.idInfo}
                className={`p-stack-md rounded-xl border flex items-start gap-3 ${ESTILOS_SEVERIDAD[alerta.severidad]}`}
              >
                <span
                  className="material-symbols-outlined shrink-0 mt-0.5 text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden="true"
                >
                  {ICONO_TIPO_RENDER[tipo]}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-label-md font-label-md">
                      {alerta.descripcion} — Severidad {alerta.severidad}
                    </p>
                    {alerta.severidad === 'Alta' && (
                      <span className="bg-error text-on-error text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                        CRÍTICO
                      </span>
                    )}
                  </div>
                  {alerta.instrucciones && (
                    <div className="mt-base space-y-0.5">
                      <p className="text-label-sm font-semibold">Instrucciones:</p>
                      <p className="text-body-sm">{alerta.instrucciones}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Observaciones generales */}
        {nino.observacionesGenerales && (
          <div className="space-y-base">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                visibility
              </span>
              <h4 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Observaciones Generales
              </h4>
            </div>
            <div className="p-stack-md rounded-xl bg-surface-container border border-outline-variant italic text-body-sm text-on-surface-variant">
              "{nino.observacionesGenerales}"
            </div>
          </div>
        )}
      </div>
    </ModalBase>
  );
};

export default ModalFichaMedica;
