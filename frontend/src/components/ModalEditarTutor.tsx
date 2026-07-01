// ModalEditarTutor.tsx — Modal para editar los datos de un tutor (Spec §9.6)
// Permite modificar nombres, apellidos, teléfono (opcional) y tipo de parentesco.
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { actualizarTutor } from '../services/servicioApi';
import type { TutorApi } from '../services/servicioApi';
import { filtrarSoloLetras, formatearTelefono } from '../services/validacionEntrada';

const TIPOS_TUTOR = [
  'Padre/Madre',
  'Abuelo/Abuela',
  'Tío/Tía',
  'Hermano/Hermana',
  'Otro',
] as const;

interface PropsModalEditarTutor {
  tutor: {
    idPersona: number;
    nombres: string;
    apellidos: string;
    telefono: string | null;
    tipoTutor?: string; // parentesco
  } | null;
  abierto: boolean;
  alCerrar: () => void;
  alGuardar: (tutorActualizado: TutorApi) => void;
}

const ModalEditarTutor: React.FC<PropsModalEditarTutor> = ({
  tutor,
  abierto,
  alCerrar,
  alGuardar,
}) => {
  const [nombres,   setNombres]   = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono,  setTelefono]  = useState('');
  const [tipoTutor, setTipoTutor] = useState<string>('Padre/Madre');
  const [guardando, setGuardando] = useState(false);

  // Sincronizar estado con el tutor recibido
  useEffect(() => {
    if (tutor) {
      setNombres(tutor.nombres);
      setApellidos(tutor.apellidos);
      setTelefono(tutor.telefono ?? '');
      setTipoTutor(tutor.tipoTutor ?? 'Padre/Madre');
    }
  }, [tutor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) alCerrar();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [abierto, alCerrar]);

  if (!abierto || !tutor) return null;

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombres.trim() || !apellidos.trim()) {
      toast.error('Los campos Nombres y Apellidos son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const tutorActualizado = await actualizarTutor(tutor.idPersona, {
        nombres:   nombres.trim(),
        apellidos: apellidos.trim(),
        telefono:  telefono.trim() || null,
        tipoTutor: tipoTutor,
      });
      toast.success('Tutor actualizado correctamente.');
      alGuardar(tutorActualizado);
      alCerrar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Editar tutor"
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md border border-outline-variant animate-[fadeIn_0.2s_ease-out]">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[22px]" aria-hidden="true">
              edit
            </span>
            <h2 className="text-title-md font-title-md text-on-surface">Editar Tutor</h2>
          </div>
          <button
            onClick={alCerrar}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarGuardar} className="px-6 py-5 space-y-4" noValidate>
          {/* Nombres */}
          <div>
            <label
              htmlFor="tutor-nombres"
              className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5"
            >
              Nombres <span className="text-error" aria-hidden="true">*</span>
            </label>
            <input
              id="tutor-nombres"
              type="text"
              value={nombres}
              onChange={(e) => setNombres(filtrarSoloLetras(e.target.value))}
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="Nombres del tutor"
            />
          </div>

          {/* Apellidos */}
          <div>
            <label
              htmlFor="tutor-apellidos"
              className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5"
            >
              Apellidos <span className="text-error" aria-hidden="true">*</span>
            </label>
            <input
              id="tutor-apellidos"
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(filtrarSoloLetras(e.target.value))}
              required
              className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="Apellidos del tutor"
            />
          </div>

          {/* Teléfono (opcional) */}
          <div>
            <label
              htmlFor="tutor-telefono"
              className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5"
            >
              Teléfono
              <span className="ml-1 text-outline text-[11px]">(opcional)</span>
            </label>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                aria-hidden="true"
              >
                call
              </span>
              <input
                id="tutor-telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(formatearTelefono(e.target.value, telefono))}
                className="w-full pl-9 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="Ej. 555-1234"
              />
            </div>
          </div>

          {/* Parentesco */}
          <div>
            <label
              htmlFor="tutor-parentesco"
              className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5"
            >
              Parentesco
            </label>
            <select
              id="tutor-parentesco"
              value={tipoTutor}
              onChange={(e) => setTipoTutor(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none cursor-pointer"
            >
              {TIPOS_TUTOR.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={alCerrar}
              disabled={guardando}
              className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant text-label-sm font-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-label-sm font-label-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {guardando ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">save</span>
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarTutor;
