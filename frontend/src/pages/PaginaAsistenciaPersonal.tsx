// PaginaAsistenciaPersonal.tsx — Fase 6 (Spec §6, Plan Maestro)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import BadgeEstado from '../components/BadgeEstado';
import { useAuth } from '../contexts/ContextoAuth';
import { toast } from 'sonner';
import type { PersonalAsistencia, EstadoLlegada, RolNombre, MetricasPersonal } from '../services/tipos';
import { listarPersonalHoy, registrarAsistenciaPersonal } from '../services/servicioApi';

// ── Configuración de estados de llegada ───────────────────────────
const ESTADOS_LLEGADA: Array<{
  valor: EstadoLlegada;
  icono: string;
  colorIcono: string;
  colorBtn: string;
}> = [
  { valor: 'Temprano',      icono: 'check_circle', colorIcono: 'text-tertiary',  colorBtn: 'border-tertiary/40 bg-tertiary/5 hover:bg-tertiary/10' },
  { valor: 'Tarde',         icono: 'schedule',     colorIcono: 'text-secondary', colorBtn: 'border-secondary/40 bg-secondary/5 hover:bg-secondary/10' },
  { valor: 'Justificado',   icono: 'info',         colorIcono: 'text-primary',   colorBtn: 'border-primary/40 bg-primary/5 hover:bg-primary/10' },
  { valor: 'Injustificado', icono: 'cancel',       colorIcono: 'text-error',     colorBtn: 'border-error/40 bg-error/5 hover:bg-error/10' },
];

// ── Color de avatar por inicial ───────────────────────────────────
const colorAvatar = (nombre: string) => {
  const paleta = ['bg-primary/20 text-primary','bg-tertiary/20 text-tertiary',
                  'bg-secondary/20 text-secondary','bg-error/10 text-error'];
  return paleta[nombre.charCodeAt(0) % paleta.length];
};

// ── Página ────────────────────────────────────────────────────────
const PaginaAsistenciaPersonal: React.FC = () => {
  const { usuario } = useAuth();

  // Solo Coordinador (nivel 4) puede registrar asistencia de personal
  const puedeRegistrar = (usuario?.nivelJerarquico ?? 0) >= 3;

  // Estado de datos
  const [personal, setPersonal]   = useState<PersonalAsistencia[]>([]);
  const [cargando, setCargando]   = useState(true);

  // Estado del formulario de registro rápido
  const [idSeleccionado,    setIdSeleccionado]    = useState<number | ''>('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoLlegada | null>(null);
  const [enviando,           setEnviando]          = useState(false);

  const cargarPersonal = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await listarPersonalHoy();
      setPersonal(datos as unknown as PersonalAsistencia[]);
    } catch (err) {
      console.error('Error cargando personal:', err);
      setPersonal([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarPersonal(); }, [cargarPersonal]);

  // Métricas calculadas
  const metricas: MetricasPersonal = useMemo(() => {
    const maestros       = personal.filter((p) => p.rol === 'Maestro');
    const colaboradores  = personal.filter((p) => p.rol === 'Colaborador');
    const presentes      = (lista: PersonalAsistencia[]) =>
      lista.filter((p) => p.estadoLlegada === 'Temprano' || p.estadoLlegada === 'Tarde').length;

    return {
      totalMaestros:           maestros.length,
      maestrosPresentes:        presentes(maestros),
      totalColaboradores:       colaboradores.length,
      colaboradoresPresentes:   presentes(colaboradores),
      // Calculado en tiempo real en base a Fecha_Ingreso_Servicio (promedio en años)
      tiempoPromedioServicio:   personal.length > 0
        ? (() => {
            const hoy = new Date();
            const promAnios = personal.reduce((acc, p) => {
              const ingreso = new Date(p.fechaIngreso);
              return acc + (hoy.getFullYear() - ingreso.getFullYear());
            }, 0) / personal.length;
            return `${promAnios.toFixed(1)} años`;
          })()
        : '—',
    };
  }, [personal]);

  const pctMaestros      = metricas.totalMaestros > 0
    ? Math.round((metricas.maestrosPresentes / metricas.totalMaestros) * 100) : 0;
  const pctColaboradores = metricas.totalColaboradores > 0
    ? Math.round((metricas.colaboradoresPresentes / metricas.totalColaboradores) * 100) : 0;

  // Opciones del selector agrupadas por rol
  const opcionesSelector = useMemo(() => {
    const grupos: Partial<Record<RolNombre, PersonalAsistencia[]>> = {};
    personal.filter((p) => !p.estadoLlegada).forEach((p) => {
      if (!grupos[p.rol]) grupos[p.rol] = [];
      grupos[p.rol]!.push(p);
    });
    return grupos;
  }, [personal]);

  const handleRegistrar = async () => {
    if (!idSeleccionado || !estadoSeleccionado) return;
    setEnviando(true);
    try {
      await registrarAsistenciaPersonal(Number(idSeleccionado), estadoSeleccionado);
      const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      setPersonal((prev) => prev.map((p) =>
        p.idPersona === idSeleccionado
          ? { ...p, estadoLlegada: estadoSeleccionado, horaLlegada: hora }
          : p
      ));
      const persona = personal.find((p) => p.idPersona === idSeleccionado);
      toast.success(`${persona?.nombreCompleto ?? 'Personal'} registrado como ${estadoSeleccionado}`);
      setIdSeleccionado('');
      setEstadoSeleccionado(null);
    } catch (err) {
      console.error('Error registrando asistencia:', err);
      toast.error(err instanceof Error ? err.message : 'Error al registrar. Intente nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <LayoutPrincipal titulo="Asistencia de Personal">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-stack-lg max-w-7xl">

        {/* ── Columna izquierda: Registro rápido ── */}
        <div className="xl:col-span-1 space-y-stack-md">
          <h2 className="text-headline-md font-headline-md text-primary">Registro Rápido</h2>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter shadow-sm">
            {!puedeRegistrar ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40" aria-hidden="true">
                  lock
                </span>
                <p className="text-body-sm text-on-surface-variant">
                  Solo Staff y Coordinadores pueden registrar la asistencia del personal.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); handleRegistrar(); }}
                className="space-y-stack-md"
                aria-label="Formulario de registro rápido de asistencia"
              >
                {/* Selector de personal */}
                <div className="space-y-stack-sm">
                  <label htmlFor="sel-personal" className="text-label-md font-label-md text-on-surface-variant ml-1 block">
                    Personal <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="sel-personal"
                      value={idSeleccionado}
                      onChange={(e) => setIdSeleccionado(e.target.value ? Number(e.target.value) : '')}
                      className="w-full h-12 bg-transparent border border-outline rounded-lg px-4 pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none text-body-md text-on-surface outline-none"
                    >
                      <option value="" disabled>Seleccionar personal...</option>
                      {(Object.entries(opcionesSelector) as [RolNombre, PersonalAsistencia[]][]).map(
                        ([rol, lista]) => (
                          <optgroup key={rol} label={`${rol}s`}>
                            {lista.map((p) => (
                              <option key={p.idPersona} value={p.idPersona}>
                                {p.nombreCompleto}{p.grupoAsignado ? ` — ${p.grupoAsignado}` : ''}
                              </option>
                            ))}
                          </optgroup>
                        )
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" aria-hidden="true">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Selector de estado (grid 2×2) */}
                <div className="space-y-stack-sm">
                  <p className="text-label-md font-label-md text-on-surface-variant ml-1">
                    Estado de Llegada <span className="text-error">*</span>
                  </p>
                  <div className="grid grid-cols-2 gap-base">
                    {ESTADOS_LLEGADA.map(({ valor, icono, colorIcono, colorBtn }) => {
                      const activo = estadoSeleccionado === valor;
                      return (
                        <button
                          key={valor}
                          type="button"
                          onClick={() => setEstadoSeleccionado(valor)}
                          aria-pressed={activo}
                          className={`flex items-center justify-center gap-2 border rounded-lg py-3 active:scale-95 transition-all text-body-sm font-medium ${colorBtn} ${
                            activo ? 'ring-2 ring-primary ring-offset-1' : ''
                          }`}
                        >
                          <span className={`material-symbols-outlined ${colorIcono}`} aria-hidden="true">
                            {icono}
                          </span>
                          {valor}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!idSeleccionado || !estadoSeleccionado || enviando}
                  className="w-full h-12 bg-primary text-on-primary rounded-lg text-label-md font-label-md shadow-md active:scale-95 transition-transform hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {enviando ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      Registrando...
                    </>
                  ) : 'Registrar Asistencia'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Columna derecha: métricas + tabla ── */}
        <div className="xl:col-span-2 space-y-stack-lg">

          {/* Métricas */}
          <section aria-label="Métricas de asistencia del personal">
            <h2 className="text-headline-md font-headline-md text-primary mb-stack-md">
              Métricas de Asistencia
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-base">
              {/* Maestros */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm space-y-2">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden="true"
                >
                  school
                </span>
                <p className="text-label-sm text-on-surface-variant">Maestros</p>
                <div className="flex items-end justify-between">
                  {cargando
                    ? <div className="h-8 w-12 bg-surface-container-high rounded animate-pulse" />
                    : <span className="text-headline-md font-headline-md">{pctMaestros}%</span>}
                  <span className="text-tertiary text-[10px] font-label-sm flex items-center mb-1">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_upward</span>
                    {metricas.maestrosPresentes}/{metricas.totalMaestros}
                  </span>
                </div>
              </div>

              {/* Colaboradores */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm space-y-2">
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden="true"
                >
                  volunteer_activism
                </span>
                <p className="text-label-sm text-on-surface-variant">Colaboradores</p>
                <div className="flex items-end justify-between">
                  {cargando
                    ? <div className="h-8 w-12 bg-surface-container-high rounded animate-pulse" />
                    : <span className="text-headline-md font-headline-md">{pctColaboradores}%</span>}
                  <span className="text-secondary text-[10px] font-label-sm flex items-center mb-1">
                    {metricas.colaboradoresPresentes}/{metricas.totalColaboradores}
                  </span>
                </div>
              </div>

              {/* Tiempo promedio */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm space-y-2 md:col-span-1">
                <div className="flex justify-between items-center">
                  <p className="text-label-sm text-on-surface-variant">Tiempo Promedio</p>
                  <span className="text-label-sm text-primary font-semibold">{metricas.tiempoPromedioServicio}</span>
                </div>
                <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container w-3/4 rounded-full transition-all duration-700" />
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-outline">08:00 AM</span>
                  <span className="text-[10px] text-outline">09:00 AM</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tabla del día */}
          <section aria-label="Lista del personal del día">
            <div className="flex justify-between items-center mb-stack-md">
              <h2 className="text-headline-md font-headline-md text-primary">Personal del Día</h2>
              <span className="text-label-sm text-on-surface-variant">
                {personal.filter((p) => p.estadoLlegada).length} registrados de {personal.length}
              </span>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-container text-left border-b border-outline-variant">
                      <th className="px-2.5 py-2 text-label-md font-label-md text-on-surface-variant">Nombre</th>
                      <th className="px-2.5 py-2 text-label-md font-label-md text-on-surface-variant">Grupo / Área</th>
                      <th className="px-2.5 py-2 text-label-md font-label-md text-on-surface-variant">Hora</th>
                      <th className="px-2.5 py-2 text-label-md font-label-md text-on-surface-variant">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">

                    {/* Skeleton de carga */}
                    {cargando && Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-2.5 py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-container-high shrink-0" />
                            <div className="space-y-1.5">
                              <div className="h-3.5 w-28 bg-surface-container-high rounded-full" />
                              <div className="h-3 w-16 bg-surface-container-high rounded-full" />
                            </div>
                          </div>
                        </td>
                        <td className="px-2.5 py-2"><div className="h-4 w-20 bg-surface-container-high rounded-full" /></td>
                        <td className="px-2.5 py-2"><div className="h-4 w-16 bg-surface-container-high rounded-full" /></td>
                        <td className="px-2.5 py-2"><div className="h-6 w-20 bg-surface-container-high rounded-full" /></td>
                      </tr>
                    ))}

                    {/* Sin registros */}
                    {!cargando && personal.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-2.5 py-8 text-center text-body-sm text-on-surface-variant">
                          No hay personal registrado para hoy.
                        </td>
                      </tr>
                    )}

                    {/* Filas */}
                    {!cargando && personal.map((p) => {
                      const iniciales = `${p.nombres[0]}${p.apellidos[0]}`;
                      const sinRegistro = !p.estadoLlegada;

                      return (
                        <tr
                          key={p.idPersona}
                          className={`hover:bg-surface-container-high/30 transition-colors ${sinRegistro ? 'opacity-60' : ''}`}
                        >
                          {/* Nombre + rol */}
                          <td className="px-2.5 py-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-label-md font-bold ${colorAvatar(p.nombres)}`}
                                aria-hidden="true"
                              >
                                {iniciales}
                              </div>
                              <div>
                                <p className="text-label-md font-label-md text-on-surface">{p.nombreCompleto}</p>
                                <p className="text-[11px] text-on-surface-variant">{p.rol}</p>
                              </div>
                            </div>
                          </td>

                          {/* Grupo / área */}
                          <td className="px-2.5 py-2 text-body-sm text-on-surface-variant">
                            {p.grupoAsignado ?? '—'}
                          </td>

                          {/* Hora */}
                          <td className="px-2.5 py-2 text-body-sm text-on-surface">
                            {p.horaLlegada ?? (
                              <span className="text-on-surface-variant/40 italic">Pendiente</span>
                            )}
                          </td>

                          {/* Estado */}
                          <td className="px-2.5 py-2">
                            {p.estadoLlegada ? (
                              <BadgeEstado
                                estado={p.estadoLlegada}
                                mayusculas
                              />
                            ) : (
                              <span className="text-body-sm text-on-surface-variant/40 italic">Sin registro</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaAsistenciaPersonal;
