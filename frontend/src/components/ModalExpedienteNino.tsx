import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  listarExpedientesNino,
  crearExpedienteNino,
  resolverExpedienteNino,
  type ExpedienteNinoApi
} from '../services/servicioApi';

interface PropsModalExpediente {
  abierto: boolean;
  onCerrar: () => void;
  ninoId: number;
  ninoNombre: string;
}

const TIPOS_EXPEDIENTE = [
  { val: 'Observacion', txt: 'Observación General' },
  { val: 'Conducta', txt: 'Comportamiento/Conducta' },
  { val: 'Incidente', txt: 'Incidente/Pelea' },
  { val: 'Medico', txt: 'Incidente Médico' },
];

const BADGE_TIPO: Record<string, string> = {
  Observacion: 'bg-primary-container text-on-primary-container border-primary/20',
  Conducta: 'bg-secondary-container/15 text-secondary border-secondary-container/30',
  Incidente: 'bg-error-container text-on-error-container border-error/20',
  Medico: 'bg-tertiary-container/30 text-on-tertiary-container border-tertiary/20',
};

const ModalExpedienteNino: React.FC<PropsModalExpediente> = ({
  abierto,
  onCerrar,
  ninoId,
  ninoNombre,
}) => {
  const [expedientes, setExpedientes] = useState<ExpedienteNinoApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario nuevo reporte
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState('Observacion');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Formulario resolución
  const [resolverId, setResolverId] = useState<number | null>(null);
  const [notasResolucion, setNotasResolucion] = useState('');
  const [resolviendo, setResolviendo] = useState(false);

  const cargarExpedientes = useCallback(async () => {
    if (!ninoId) return;
    setCargando(true);
    setError(null);
    try {
      const data = await listarExpedientesNino(ninoId);
      setExpedientes(data);
    } catch (err) {
      console.error('Error cargando expedientes:', err);
      setError('No se pudo cargar el historial del expediente.');
    } finally {
      setCargando(false);
    }
  }, [ninoId]);

  useEffect(() => {
    if (abierto) {
      cargarExpedientes();
      setMostrarForm(false);
      setResolverId(null);
      setDescripcion('');
      setNotasResolucion('');
    }
  }, [abierto, cargarExpedientes]);

  const handleCrearReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return;

    setGuardando(true);
    try {
      await crearExpedienteNino(ninoId, { tipo, descripcion });
      setDescripcion('');
      setMostrarForm(false);
      await cargarExpedientes();
    } catch (err) {
      console.error('Error creando reporte:', err);
      toast.error('Error al guardar el reporte: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setGuardando(false);
    }
  };

  const handleResolverReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolverId || !notasResolucion.trim()) return;

    setResolviendo(true);
    try {
      await resolverExpedienteNino(ninoId, resolverId, notasResolucion);
      setResolverId(null);
      setNotasResolucion('');
      await cargarExpedientes();
    } catch (err) {
      console.error('Error resolviendo reporte:', err);
      toast.error('Error al resolver el reporte: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setResolviendo(false);
    }
  };

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget && !guardando && !resolviendo) onCerrar(); }}
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/50">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">folder_shared</span>
              Expediente de Conducta
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Historial clínico, conductual e incidentes de: <strong className="text-on-surface">{ninoNombre}</strong>
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
            disabled={guardando || resolviendo}
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          
          {/* Secciones de acción: Formularios */}
          {mostrarForm && (
            <form onSubmit={handleCrearReporte} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-4">
              <h3 className="text-label-md font-label-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Registrar Observación / Incidente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="exp-tipo" className="text-label-sm text-on-surface-variant">Tipo de Reporte</label>
                  <div className="relative">
                    <select
                      id="exp-tipo"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      className="w-full h-11 pl-4 pr-10 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none text-body-md text-on-surface outline-none"
                    >
                      {TIPOS_EXPEDIENTE.map(t => <option key={t.val} value={t.val}>{t.txt}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="exp-desc" className="text-label-sm text-on-surface-variant">Descripción de los hechos</label>
                <textarea
                  id="exp-desc"
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalle claramente lo sucedido (nombres de terceros involucrados, acciones tomadas, etc.)"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarForm(false)}
                  className="px-4 py-2 border border-outline-variant rounded-xl text-body-sm font-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary rounded-xl text-body-sm font-label-md shadow hover:bg-primary/90 transition-all flex items-center gap-2"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar Reporte'}
                </button>
              </div>
            </form>
          )}

          {resolverId !== null && (
            <form onSubmit={handleResolverReporte} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-4">
              <h3 className="text-label-md font-label-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                Resolver Incidente Pendiente
              </h3>
              <div className="flex flex-col gap-2">
                <label htmlFor="res-notas" className="text-label-sm text-on-surface-variant">Notas de resolución y medidas tomadas</label>
                <textarea
                  id="res-notas"
                  rows={3}
                  value={notasResolucion}
                  onChange={(e) => setNotasResolucion(e.target.value)}
                  placeholder="Ej: Se conversó con el padre de familia. El niño pidió disculpas. Se le reubicó de asiento."
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResolverId(null)}
                  className="px-4 py-2 border border-outline-variant rounded-xl text-body-sm font-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  disabled={resolviendo}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-tertiary text-on-tertiary rounded-xl text-body-sm font-label-md shadow hover:bg-tertiary/90 transition-all"
                  disabled={resolviendo}
                >
                  {resolviendo ? 'Resolviendo...' : 'Resolver Reporte'}
                </button>
              </div>
            </form>
          )}

          {/* Listado principal */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-title-md font-title-md text-on-surface">Historial de Reportes</h3>
              {!mostrarForm && resolverId === null && (
                <button
                  onClick={() => setMostrarForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-body-sm font-label-md shadow hover:bg-primary/90 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Registrar Incidente
                </button>
              )}
            </div>

            {cargando ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-24 bg-surface-container-low rounded-xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-6 text-error">
                <span className="material-symbols-outlined text-[36px]">error</span>
                <p className="mt-1 text-body-md">{error}</p>
              </div>
            ) : expedientes.length === 0 ? (
              <div className="text-center py-10 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-[48px] opacity-25">description</span>
                <p className="mt-2 text-body-md font-medium text-on-surface-variant">Sin incidencias registradas</p>
                <p className="text-body-sm text-on-surface-variant/70">El expediente de este niño está limpio de reportes conductuales.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expedientes.map((exp) => {
                  const bCls = BADGE_TIPO[exp.tipo] || 'bg-surface-container-low text-on-surface-variant';
                  const nombreTipo = TIPOS_EXPEDIENTE.find(t => t.val === exp.tipo)?.txt || exp.tipo;

                  return (
                    <div
                      key={exp.idExpediente}
                      className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                        exp.resuelto
                          ? 'bg-surface-container-lowest border-outline-variant/30 opacity-75'
                          : 'bg-surface-container-lowest border-primary/20 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${bCls}`}>
                            {nombreTipo}
                          </span>
                          <span className="text-body-sm text-on-surface-variant font-medium">
                            {new Date(exp.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {exp.resuelto ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            RESUELTO
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-container/15 text-secondary border border-secondary-container/35 animate-pulse">
                              <span className="material-symbols-outlined text-[14px]">pending</span>
                              PENDIENTE
                            </span>
                            {resolverId === null && (
                              <button
                                onClick={() => { setResolverId(exp.idExpediente); setMostrarForm(false); }}
                                className="text-label-sm text-primary hover:underline"
                              >
                                Resolver
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-body-md text-on-surface whitespace-pre-line leading-relaxed">
                        {exp.descripcion}
                      </div>

                      <div className="text-label-sm text-on-surface-variant flex items-center gap-1 border-t border-outline-variant/10 pt-2 mt-1">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        Reportado por: <strong>{exp.reportadoPor || `Usuario ID: ${exp.idReportadoPor}`}</strong>
                      </div>

                      {exp.resuelto && exp.notasResolucion && (
                        <div className="bg-surface-container-low p-3 rounded-lg border-l-4 border-tertiary mt-2">
                          <p className="text-label-sm text-tertiary font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                            Resolución y Medidas Tomadas:
                          </p>
                          <p className="text-body-sm text-on-surface mt-1 whitespace-pre-line leading-relaxed">
                            {exp.notasResolucion}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pie */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-outline-variant/50 bg-surface-bright">
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2.5 border border-outline-variant text-on-surface-variant rounded-xl font-label-md hover:bg-surface-container-high transition-colors"
            disabled={guardando || resolviendo}
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalExpedienteNino;
