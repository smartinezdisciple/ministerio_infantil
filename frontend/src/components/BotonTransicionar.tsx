// components/BotonTransicionar.tsx — Botón de confirmación en dos pasos para
// ejecutar la transición de grupo de un niño desde la tarjeta del tablero.
import React, { useState } from 'react';
import { toast } from 'sonner';
import { transicionarNino } from '../services/servicioApi';

interface Props {
  idPersona: number;
  nombreCompleto: string;
  /** Se invoca cuando la transición fue exitosa (el padre quita la fila de la lista). */
  onExito: (idPersona: number, mensaje: string) => void;
}

const BotonTransicionar: React.FC<Props> = ({ idPersona, nombreCompleto, onExito }) => {
  const [confirmando, setConfirmando] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const manejarClick = async () => {
    // Primer click: pide confirmación. Segundo click: ejecuta.
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    setProcesando(true);
    try {
      const res = await transicionarNino(idPersona);
      onExito(
        idPersona,
        res.grupoNuevo
          ? `${nombreCompleto} transitó de "${res.grupoAnterior ?? 'Sin grupo'}" a "${res.grupoNuevo}".`
          : `${nombreCompleto} transitó correctamente.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al transicionar.');
      setConfirmando(false);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={manejarClick}
      disabled={procesando}
      title={`Transicionar a ${nombreCompleto}`}
      className={`shrink-0 text-label-sm px-2.5 py-1 rounded-full font-semibold transition-colors disabled:opacity-50 flex items-center gap-1 ${
        confirmando
          ? 'bg-primary text-on-primary shadow-md'
          : 'bg-error/10 text-error hover:bg-error/20'
      }`}
    >
      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
        {procesando ? 'progress_activity' : 'arrow_forward'}
      </span>
      {procesando ? '...' : confirmando ? '¿Confirmar?' : 'Transicionar'}
    </button>
  );
};

export default BotonTransicionar;
