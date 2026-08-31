// PaginaPremiados.tsx — Módulo Premiados (v11)
// Registro manual del mejor estudiante de cada grupo por turno, en el último
// domingo / miércoles del mes seleccionado. Guarda historial por mes.
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import { toast } from 'sonner';
import {
  listarPremiados,
  guardarPremiados,
  eliminarPremiado,
  listarGrupos,
  listarNinos,
} from '../services/servicioApi';
import type { PremiadoApi, GrupoApi, NinoApi } from '../services/servicioApi';
import { fechaLocalHoy } from '../services/fechaUtils';

interface SesionTurno {
  idTurno: number;
  turnoNombre: string;
  fechaPremiacion: string;
}

/** Devuelve YYYY-MM-DD del último día de la semana (0=Domingo, 3=Miércoles) de un mes dado. */
const ultimoDiaSemanaDelMes = (anio: number, mes: number, diaSemana: number): string => {
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  for (let d = ultimoDia; d >= 1; d--) {
    const fecha = new Date(anio, mes, d);
    if (fecha.getDay() === diaSemana) {
      const dd = String(d).padStart(2, '0');
      const mm = String(mes + 1).padStart(2, '0');
      return `${anio}-${mm}-${dd}`;
    }
  }
  return '';
};

/** Nombre legible de la sesión (p. ej. "Domingo 31-08-2026") */
const formatearSesion = (fechaPremiacion: string, nombreTurno: string): string => {
  if (!fechaPremiacion) return nombreTurno;
  const [, mm, dd] = fechaPremiacion.split('-').map(Number);
  const t = nombreTurno.replace('_', ' ');
  return `${t} · ${dd}/${String(mm).padStart(2, '0')}`;
};

const PaginaPremiados: React.FC = () => {
  // Mes seleccionado en formato YYYY-MM (input type="month")
  const [mesSeleccion, setMesSeleccion] = useState(fechaLocalHoy().slice(0, 7));
  const [fechaDomingo, setFechaDomingo] = useState('');
  const [fechaMiercoles, setFechaMiercoles] = useState('');

  const [grupos, setGrupos] = useState<GrupoApi[]>([]);
  const [ninos, setNinos] = useState<NinoApi[]>([]);
  const [premiados, setPremiados] = useState<PremiadoApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Selección actual por turno sobre grupo
  const [seleccion, setSeleccion] = useState<Record<string, number>>({});

  // Texto de búsqueda por clave "turno-grupo" + dropdown abierto
  const [busquedas, setBusquedas] = useState<Record<string, string>>({});
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});

  // Calcular fechas del último domingo/miércoles del mes seleccionado
  useEffect(() => {
    const [aa, mm] = mesSeleccion.split('-').map(Number);
    if (!aa || mm == null) return;
    setFechaDomingo(ultimoDiaSemanaDelMes(aa, mm - 1, 0));
    setFechaMiercoles(ultimoDiaSemanaDelMes(aa, mm - 1, 3));
  }, [mesSeleccion]);

  const mesIso = mesSeleccion ? `${mesSeleccion}-01` : '';

  // Cargar datos base una sola vez
  const cargarBase = useCallback(async () => {
    try {
      const [g, n] = await Promise.all([listarGrupos(), listarNinos()]);
      setGrupos(g);
      setNinos(n.filter((x) => x.activo !== false && (x as unknown as { idGrupo?: number }).idGrupo));
    } catch (err) {
      console.error('Error cargando datos base:', err);
      toast.error('No se pudieron cargar los datos.');
    }
  }, []);

  // Cargar premiados del mes
  const cargarPremiados = useCallback(async () => {
    if (!mesIso) return;
    setCargando(true);
    try {
      const datos = await listarPremiados(mesIso);
      setPremiados(datos);
    } catch (err) {
      console.error('Error cargando premiados:', err);
      setPremiados([]);
    } finally {
      setCargando(false);
    }
  }, [mesIso]);

  useEffect(() => { cargarBase(); }, [cargarBase]);
  useEffect(() => { cargarPremiados(); }, [cargarPremiados]);

  // Sesiones disponibles según el mes: Domingo (3 turnos) + Miércoles (1 turno)
  const sesiones: SesionTurno[] = useMemo(() => {
    const turnosDomingo = ['Domingo_8am', 'Domingo_11am', 'Domingo_5pm'];
    // IDs de turno por nombre (referencia del seed)
    const mapaTurnos: Record<string, number> = {
      Miercoles: 1,
      Domingo_8am: 2,
      Domingo_11am: 3,
      Domingo_5pm: 4,
    };
    const sesionesD: SesionTurno[] = turnosDomingo
      .filter((n) => mapaTurnos[n] != null)
      .map((n) => ({ idTurno: mapaTurnos[n], turnoNombre: n, fechaPremiacion: fechaDomingo }));
    const sesionesM: SesionTurno[] = fechaMiercoles
      ? [{ idTurno: mapaTurnos.Miercoles, turnoNombre: 'Miercoles', fechaPremiacion: fechaMiercoles }]
      : [];
    // Solo incluir sesiones cuya fecha de premiación exista
    return [...sesionesD.filter((s) => s.fechaPremiacion), ...sesionesM];
  }, [fechaDomingo, fechaMiercoles]);

  // Mapa: premiado existente por "turno-grupo" -> idNino (para pre-cargar selects)
  const premiadoPorClave = useMemo(() => {
    const mapa: Record<string, number> = {};
    premiados.forEach((p) => {
      mapa[`${p.idTurno}-${p.idGrupo}`] = p.idNino;
    });
    return mapa;
  }, [premiados]);

  // Inicializar selección desde premiados guardados
  useEffect(() => {
    const inicial: Record<string, number> = {};
    grupos.forEach((g) => {
      sesiones.forEach((s) => {
        const clave = `${s.idTurno}-${g.idGrupo}`;
        const previo = premiadoPorClave[clave];
        if (previo != null) inicial[clave] = previo;
      });
    });
    setSeleccion((prev) => ({ ...inicial, ...prev }));
  }, [grupos, sesiones, premiadoPorClave]);

  const hayCambios = useMemo(() => {
    for (const g of grupos) {
      for (const s of sesiones) {
        const clave = `${s.idTurno}-${g.idGrupo}`;
        if (seleccion[clave]) return true;
      }
    }
    return false;
  }, [grupos, sesiones, seleccion]);

  const handleGuardar = async () => {
    if (!mesIso) return;
    const registros: Array<{ idTurno: number; idGrupo: number; idNino: number; fechaPremiacion: string }> = [];
    for (const g of grupos) {
      for (const s of sesiones) {
        const clave = `${s.idTurno}-${g.idGrupo}`;
        const idNino = seleccion[clave];
        if (idNino) {
          registros.push({ idTurno: s.idTurno, idGrupo: g.idGrupo, idNino, fechaPremiacion: s.fechaPremiacion });
        }
      }
    }
    if (registros.length === 0) {
      toast.info('Selecciona al menos un estudiante para guardar.');
      return;
    }
    setGuardando(true);
    try {
      const res = await guardarPremiados(mesIso, registros);
      setPremiados(res);
      toast.success('Premiados guardados correctamente.');
    } catch (err) {
      console.error('Error guardando premiados:', err);
      toast.error(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (idPremiado: number) => {
    try {
      await eliminarPremiado(idPremiado);
      setPremiados((prev) => prev.filter((p) => p.idPremiado !== idPremiado));
      toast.success('Premiado eliminado.');
    } catch (err) {
      console.error('Error eliminando premiado:', err);
      toast.error(err instanceof Error ? err.message : 'Error al eliminar.');
    }
  };

  // Niños disponibles por grupo (para los dropdowns) — el backend devuelve idGrupo plano
  const ninosPorGrupo = useMemo(() => {
    const mapa: Record<number, NinoApi[]> = {};
    grupos.forEach((g) => {
      mapa[g.idGrupo] = ninos.filter((n) => Number((n as unknown as { idGrupo?: number }).idGrupo) === g.idGrupo);
    });
    return mapa;
  }, [grupos, ninos]);

  const cambiarSeleccion = (clave: string, idNino: string | number) => {
    setSeleccion((prev) => {
      const next = { ...prev };
      if (idNino === '') delete next[clave];
      else next[clave] = Number(idNino);
      return next;
    });
    setAbiertos((prev) => ({ ...prev, [clave]: false }));
    if (idNino !== '') {
      const nino = ninos.find((n) => n.idPersona === Number(idNino));
      setBusquedas((prev) => ({ ...prev, [clave]: nino?.nombreCompleto ?? '' }));
    }
  };

  /** Filtra los niños de un grupo según el texto de búsqueda (sin acentos) */
  const buscarNinos = (clave: string, opciones: NinoApi[]): NinoApi[] => {
    const q = (busquedas[clave] ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (!q) return opciones;
    return opciones.filter((n) =>
      n.nombreCompleto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
    );
  };

  return (
    <LayoutPrincipal titulo="Premiados">
      <div className="max-w-7xl space-y-stack-lg">
        {/* ── Selector de mes ─────────────────────────────── */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter shadow-sm space-y-stack-md">
          <div>
            <h2 className="text-headline-md font-headline-md text-primary">Premiados del Mes</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Registra al mejor estudiante de cada grupo por turno, la fecha del último domingo y último miércoles del mes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-stack-md">
            <div className="w-full sm:w-64 space-y-stack-sm">
              <label htmlFor="seleccion-mes" className="text-label-md font-label-md text-on-surface-variant ml-1 block">
                Mes
              </label>
              <input
                id="seleccion-mes"
                type="month"
                value={mesSeleccion}
                max={fechaLocalHoy().slice(0, 7)}
                onChange={(e) => setMesSeleccion(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
              />
            </div>

            {mesSeleccion && (
              <div className="flex flex-wrap gap-2">
                {fechaDomingo && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-label-sm font-label-md px-3 py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">event</span>
                    Último domingo: {formatearSesion(fechaDomingo, 'Domingo')}
                  </span>
                )}
                {fechaMiercoles && (
                  <span className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary text-label-sm font-label-md px-3 py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">event</span>
                    Último miércoles: {formatearSesion(fechaMiercoles, 'Miércoles')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Grid de turnos con selección ─────────────────── */}
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-stack-md">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter space-y-3 animate-pulse">
                <div className="h-5 w-40 bg-surface-container-high rounded-full" />
                <div className="h-8 w-full bg-surface-container-high rounded-lg" />
                <div className="h-8 w-full bg-surface-container-high rounded-lg" />
                <div className="h-8 w-full bg-surface-container-high rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-stack-md">
            {sesiones.map((sesion) => (
              <div
                key={sesion.idTurno}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden"
              >
                <div className="bg-primary/5 border-b border-outline-variant px-4 py-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">emoji_events</span>
                    <h3 className="text-label-lg font-label-lg text-on-surface">
                      {formatearSesion(sesion.fechaPremiacion, sesion.turnoNombre)}
                    </h3>
                  </div>
                </div>

                <div className="p-4 space-y-stack-md">
                  {grupos.map((grupo) => {
                    const opciones = ninosPorGrupo[grupo.idGrupo] ?? [];
                    const clave = `${sesion.idTurno}-${grupo.idGrupo}`;
                    const valor = seleccion[clave];
                    const ninoSeleccionado = valor != null ? ninos.find((n) => n.idPersona === valor) : undefined;
                    const texto = busquedas[clave] ?? ninoSeleccionado?.nombreCompleto ?? '';
                    const abierto = abiertos[clave] ?? false;
                    const resultados = buscarNinos(clave, opciones);
                    const premiado = premiados.find((p) => p.idTurno === sesion.idTurno && p.idGrupo === grupo.idGrupo);
                    return (
                      <div key={grupo.idGrupo} className="space-y-stack-sm">
                        <label className="text-label-md font-label-md text-on-surface-variant ml-1 block">
                          {grupo.nombre}
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">search</span>
                          <input
                            type="text"
                            value={texto}
                            placeholder="Buscar niño..."
                            onChange={(e) => {
                              setBusquedas((prev) => ({ ...prev, [clave]: e.target.value }));
                              setAbiertos((prev) => ({ ...prev, [clave]: true }));
                              if (e.target.value === '') cambiarSeleccion(clave, '');
                            }}
                            onFocus={() => setAbiertos((prev) => ({ ...prev, [clave]: true }))}
                            onBlur={() => setTimeout(() => setAbiertos((prev) => ({ ...prev, [clave]: false })), 150)}
                            className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-md text-on-surface"
                          />
                          {abierto && (
                            <div className="absolute z-10 mt-1 w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                              {resultados.length === 0 ? (
                                <div className="px-4 py-3 text-body-sm text-on-surface-variant">Sin resultados</div>
                              ) : (
                                <ul role="listbox" className="max-h-56 overflow-y-auto">
                                  {resultados.map((n) => {
                                    const activo = valor === n.idPersona;
                                    return (
                                      <li key={n.idPersona}>
                                        <button
                                          type="button"
                                          onMouseDown={(e) => { e.preventDefault(); cambiarSeleccion(clave, n.idPersona); }}
                                          className={`w-full text-left px-4 py-2.5 hover:bg-surface-container-high transition-colors flex items-center justify-between gap-2 ${
                                            activo ? 'bg-primary/10' : ''
                                          }`}
                                        >
                                          <span className="text-label-md font-label-md text-on-surface">{n.nombreCompleto}</span>
                                          {activo && (
                                            <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">check</span>
                                          )}
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                        {premiado && (
                          <div className="flex items-center justify-between gap-2 bg-tertiary/10 border border-tertiary/30 rounded-lg px-3 py-2">
                            <span className="text-body-sm text-on-surface-variant">
                              Guardado: <strong className="text-on-surface">{premiado.nombreNino}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEliminar(premiado.idPremiado)}
                              className="text-label-sm font-semibold text-error hover:underline shrink-0"
                            >
                              Quitar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Botón guardar ────────────────────────────────── */}
        {!cargando && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando || !hayCambios}
              className="h-12 px-6 bg-primary text-on-primary rounded-lg text-label-md font-label-md shadow-md active:scale-95 transition-transform hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {guardando ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : 'Guardar Premiados'}
            </button>
          </div>
        )}

        {/* ── Resumen del mes ──────────────────────────────── */}
        {!cargando && premiados.length > 0 && (
          <section aria-label="Resumen de premiados" className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant">
              <h2 className="text-headline-md font-headline-md text-primary">
                Resumen de {mesSeleccion}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container text-left border-b border-outline-variant">
                    <th className="px-2.5 py-2 text-label-md font-label-md text-on-surface-variant">Estudiante</th>
                    <th className="px-2.5 py-2 text-label-md font-label-md text-on-surface-variant">Grupo</th>
                    <th className="px-2.5 py-2 text-label-md font-label-md text-on-surface-variant">Turno / Fecha</th>
                    <th className="px-2.5 py-2 text-label-md font-label-md text-on-surface-variant" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {premiados.map((p) => (
                    <tr key={p.idPremiado} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="px-2.5 py-2">
                        <p className="text-label-md font-label-md text-on-surface">{p.nombreNino}</p>
                        <p className="text-[11px] text-on-surface-variant">
                          {p.fechaNacimientoNino ? `Año: ${p.fechaNacimientoNino.slice(0, 4)}` : ''}
                        </p>
                      </td>
                      <td className="px-2.5 py-2 text-body-sm text-on-surface-variant">{p.grupoNombre}</td>
                      <td className="px-2.5 py-2 text-body-sm text-on-surface-variant">
                        {p.turnoNombre.replace('_', ' ')} · {formatearSesion(p.fechaPremiacion, '')}
                      </td>
                      <td className="px-2.5 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleEliminar(p.idPremiado)}
                          className="text-label-sm font-semibold text-error hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaPremiados;
