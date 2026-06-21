import React from 'react';
import ModalBase from './ModalBase';

interface PropsModalConfirmar {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar: () => void;
  tipo?: 'danger' | 'primary' | 'warning';
}

const ModalConfirmar: React.FC<PropsModalConfirmar> = ({
  abierto,
  onCerrar,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  onConfirmar,
  tipo = 'primary',
}) => {
  const getBotonConfirmarClass = () => {
    switch (tipo) {
      case 'danger':
        return 'bg-error text-on-error hover:bg-error-container hover:text-on-error-container';
      case 'warning':
        return 'bg-amber-600 text-white hover:bg-amber-700';
      case 'primary':
      default:
        return 'bg-primary text-on-primary hover:bg-primary/95';
    }
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onCerrar}
        className="px-4 py-2 rounded-lg border border-outline/30 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
      >
        {textoCancelar}
      </button>
      <button
        type="button"
        onClick={() => {
          onConfirmar();
          onCerrar();
        }}
        className={`px-4 py-2 rounded-lg text-label-md font-medium transition-colors shadow-sm ${getBotonConfirmarClass()}`}
      >
        {textoConfirmar}
      </button>
    </>
  );

  return (
    <ModalBase abierto={abierto} onCerrar={onCerrar} titulo={titulo} footer={footer} ancho="max-w-md">
      <p className="text-body-md text-on-surface-variant">{mensaje}</p>
    </ModalBase>
  );
};

export default ModalConfirmar;
