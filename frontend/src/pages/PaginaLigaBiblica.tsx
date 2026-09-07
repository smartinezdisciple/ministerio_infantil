// PaginaLigaBiblica.tsx — Módulo Liga Bíblica (septiembre 2026)
// Registro de participantes de la liga bíblica con búsqueda de niños,
// turno automático según el usuario que inscribe, y tutor único obligatorio.
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TarjetaEstadistica from '../components/TarjetaEstadistica';
import { toast } from 'sonner';
import { useAuth } from '../contexts/ContextoAuth';
import {
  listarLigaBiblica,
  inscribirParticipanteLiga,
  actualizarParticipanteLiga,
  eliminarParticipanteLiga,
  listarGrupos,
  listarNinosRaw,
  listarTutoresPorNino,
  obtenerPerfilPersonal,
} from '../services/servicioApi';
import type { ParticipanteLigaApi, GrupoApi, NinoRawApi, TutorApi } from '../services/servicioApi';
import { fechaLocalHoy } from '../services/fechaUtils';

/** Turnos que existen en el sistema de la liga bíblica (IDs según el seed). */
const TURNOS_LIGA = [
  { id: 1, nombre: 'Miércoles' },
  { id: 2, nombre: 'Domingo 8am' },
  { id: 3, nombre: 'Domingo 11am' },
  { id: 4, nombre: 'Domingo 5pm' },
];

const mapaTurnoNombre: Record<number, string> = Object.fromEntries(
  TURNOS_LIGA.map((t) => [t.id, t.nombre])
);

/** Fila nueva pendiente de inscribir (desaparece al guardarse). */
interface Pendiente {
  key: number;
  idNino: number;
  nombreCompleto: string;
  grupoNombre: string | null;
  sexo: 'Masculino' | 'Femenino' | null;
  idTurno: number | null;
  tutorId: number | null;
  tutores: TutorApi[];
  cargandoTutores: boolean;
}

/** Devuelve YYYY-MM-DD del último día de la semana de un mes (JS Date: 0-indexed month). */
const ultimoDiaSemanaDelMes = (anio: number, mes: number, diaSemana: number): string => {
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  for (let d = ultimoDia; d >= 1; d--) {
    if (new Date(anio, mes, d).getDay() === diaSemana) {
      const dd = String(d).padStart(2, '0');
      const mm = String(mes + 1).padStart(2, '0');
      return `${anio}-${mm}-${dd}`;
    }
  }
  return '';
};

const PaginaLigaBiblica: React.FC = () => {
  const { usuario } = useAuth();
  const nivelJerarquico = usuario?.nivelJerarquico ?? 0;

  const [mesSeleccion, setMesSeleccion] = useState(() => fechaLocalHoy().slice(0, 7));
  const [fechaDomingo, setFechaDomingo] = useState('');
  const [fechaMiercoles, setFechaMiercoles] = useState('');

  const [grupos, setGrupos] = useState<GrupoApi[]>([]);
  const [ninos, setNinos] = useState<NinoRawApi[]>([]);
  const [participantes, setParticipantes] = useState<ParticipanteLigaApi[]>([]);
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [usuarioTurnos, setUsuarioTurnos] = useState<Array<{ idTurno: number; turno: string }>>([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoGuardando, setCargandoGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState<number | ''>('');

  /** Turnos que el usuario tiene permitidos según nivel y Personal_Turnos. */
  const turnosPermitidos = useMemo(() => {
    if (nivelJerarquico >= 4) return TURNOS_LIGA.map((t) => t.id);
    return usuarioTurnos.map((t) => t.idTurno);
  }, [nivelJerarquico, usuarioTurnos]);

  /** Turno automático si el usuario tiene un solo turno asignado. */
  const turnoPorDefecto = turnosPermitidos.length === 1 ? turnosPermitidos[0] : null;

  /** Calcular fechas de la liga para el mes seleccionado. */
  useEffect(() => {
    const [aa, mm] = mesSeleccion.split('-').map(Number);
    if (!aa || !mm) return;
    setFechaDomingo(ultimoDiaSemanaDelMes(aa, mm - 1, 0));
    setFechaMiercoles(ultimoDiaSemanaDelMes(aa, mm - 1, 3));
  }, [mesSeleccion]);

  /** Carga inicial: datos base + participantes + turnos del usuario. */
  const cargar = useCallback(async () => {
    const mes = mesSeleccion;
    if (!mes) return;
    setCargando(true);
    try {
      const [g, n, p, perfil] = await Promise.all([
        listarGrupos(),
        listarNinosRaw(),
        listarLigaBiblica(mes),
        usuario ? obtenerPerfilPersonal(usuario.idPersona) : Promise.resolve(null),
      ]);
      setGrupos(g);
      setNinos(n.filter((x) => x.activo !== false));
      setParticipantes(p);
      if (perfil?.turnos) setUsuarioTurnos(perfil.turnos);
    } catch (err) {
      console.error('Error cargando módulo Liga Bíblica:', err);
      toast.error('No se pudieron cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, [mesSeleccion, usuario]);

  useEffect(() => { cargar(); }, [cargar]);

  /** IDs de niños ya inscritos + pendientes (para excluirlos de la búsqueda). */
  const idsInscritos = useMemo(() => {
    const set = new Set<number>();
    participantes.forEach((p) => set.add(p.idNino));
    pendientes.forEach((p) => set.add(p.idNino));
    return set;
  }, [participantes, pendientes]);

  /** Resultados de búsqueda: niños activos no inscritos. */
  const resultadosBusqueda = useMemo(() => {
    const q = busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (!q) return [];
    return ninos
      .filter((n) => !idsInscritos.has(n.idPersona))
      .filter((n) =>
        n.nombreCompleto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
      )
      .slice(0, 10);
  }, [ninos, idsInscritos, busqueda]);

  /** Lista visible tras filtro de grupo. */
  const listaVisible = useMemo(() => {
    if (filtroGrupo === '') return participantes;
    return participantes.filter((p) => p.idGrupo === filtroGrupo);
  }, [participantes, filtroGrupo]);

  /** Cards: totales del listado filtrado. */
  const total = listaVisible.length;
  const totalNinos = listaVisible.filter((p) => p.sexo === 'Masculino').length;
  const totalNinas = listaVisible.filter((p) => p.sexo === 'Femenino').length;

  /** Agregar un niño a la lista de pendientes e inscribir su tutor. */
  const agregarNino = async (nino: NinoRawApi) => {
    setBusqueda('');
    setAbierto(false);
    const idTurnoInicial = turnoPorDefecto ?? null;

    const pendiente: Pendiente = {
      key: nino.idPersona,
      idNino: nino.idPersona,
      nombreCompleto: nino.nombreCompleto,
      grupoNombre: nino.nombreGrupo ?? null,
      sexo: nino.sexo ?? null,
      idTurno: idTurnoInicial,
      tutorId: null,
      tutores: [],
      cargandoTutores: true,
    };
    setPendientes((prev) => [...prev, pendiente]);

    try {
      const tutores = await listarTutoresPorNino(nino.idPersona);
      setPendientes((prev) =>
        prev.map((p) =>
          p.key === nino.idPersona
            ? { ...p, tutores: tutores as TutorApi[], cargandoTutores: false }
            : p
        )
      );
    } catch {
      setPendientes((prev) =>
        prev.map((p) =>
          p.key === nino.idPersona ? { ...p, cargandoTutores: false } : p
        )
      );
    }
  };

  /** Actualizar un campo de un pendiente (turno, tutor, etc.). */
  const actualizarPendiente = (key: number, cambios: Partial<Pendiente>) => {
    setPendientes((prev) =>
      prev.map((p) => (p.key === key ? { ...p, ...cambios } : p))
    );
  };

  /** Inscribir un pendiente en el backend (POST → lista actualizada). */
  const inscribir = async (p: Pendiente) => {
    if (!p.tutorId) {
      toast.error('Selecciona el tutor antes de inscribir.');
      return;
    }
    if (!p.idTurno) {
      toast.error('Selecciona el turno.');
      return;
    }
    setCargandoGuardando(true);
    try {
      const listaActualizada = await inscribirParticipanteLiga({
        mes: mesSeleccion,
        idNino: p.idNino,
        idTurno: p.idTurno,
        idTutor: p.tutorId,
      });
      setParticipantes(listaActualizada);
      setPendientes((prev) => prev.filter((x) => x.key !== p.key));
      toast.success('Participante inscrito correctamente.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al inscribir.');
    } finally {
      setCargandoGuardando(false);
    }
  };

  /** Eliminar un pendiente de la cola. */
  const cancelarPendiente = (key: number) => {
    setPendientes((prev) => prev.filter((p) => p.key !== key));
  };

  /** Eliminar un participante inscrito. */
  const eliminar = async (p: ParticipanteLigaApi) => {
    try {
      await eliminarParticipanteLiga(p.idLiga);
      setParticipantes((prev) => prev.filter((x) => x.idLiga !== p.idLiga));
      toast.success('Participante eliminado.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar.');
    }
  };

  /** Cambiar el tutor de un participante ya guardado. */
  const cambiarTutor = async (p: ParticipanteLigaApi, nuevoIdTutor: number) => {
    try {
      await actualizarParticipanteLiga(p.idLiga, nuevoIdTutor);
      setParticipantes((prev) =>
        prev.map((x) =>
          x.idLiga === p.idLiga
            ? { ...x, idTutor: nuevoIdTutor }
            : x
        )
      );
      toast.success('Tutor actualizado.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar tutor.');
    }
  };

  return (
    <LayoutPrincipal titulo="Liga Bíblica">
      <div className="max-w-7xl space-y-stack-lg">

        {/* ── Encabezado y selector de mes ─────────────────────── */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter shadow-sm space-y-stack-md">
          <div>
            <h2 className="text-headline-md font-headline-md text-primary">Liga Bíblica Septiembre 2026</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Registra a los niños participantes por sesión. El turno se asigna automáticamente según tu usuario.
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
            <div className="flex flex-wrap gap-2">
              {fechaDomingo && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-label-sm font-label-md px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">event</span>
                  Domingo: {fechaDomingo.split('-').reverse().join('/')}
                </span>
              )}
              {fechaMiercoles && (
                <span className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary text-label-sm font-label-md px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">event</span>
                  Miércoles: {fechaMiercoles.split('-').reverse().join('/')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Cards de resumen ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
          <TarjetaEstadistica
            etiqueta="Total participantes"
            valor={total}
            icono="groups"
            colorAccento="primary"
          />
          <TarjetaEstadistica
            etiqueta="Niños"
            valor={totalNinos}
            icono="boy"
            colorAccento="tertiary"
          />
          <TarjetaEstadistica
            etiqueta="Niñas"
            valor={totalNinas}
            icono="girl"
            colorAccento="secondary"
          />
        </div>

        {/* ── Barra de búsqueda + filtro ───────────────────────── */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter shadow-sm space-y-stack-md">
          <div className="flex flex-col sm:flex-row gap-gutter">
            {/* Búsqueda de niños */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">search</span>
              <input
                type="text"
                value={busqueda}
                placeholder="Buscar niño por nombre..."
                onChange={(e) => { setBusqueda(e.target.value); setAbierto(true); }}
                onFocus={() => setAbierto(true)}
                onBlur={() => setTimeout(() => setAbierto(false), 150)}
                className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-md text-on-surface"
              />
              {abierto && (
                <div className="absolute z-10 mt-1 w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                  {resultadosBusqueda.length === 0 ? (
                    <div className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {busqueda.trim() ? 'Sin resultados' : 'Escribe para buscar un niño'}
                    </div>
                  ) : (
                    <ul role="listbox" className="max-h-56 overflow-y-auto">
                      {resultadosBusqueda.map((n) => (
                        <li key={n.idPersona}>
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); agregarNino(n); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-surface-container-high transition-colors"
                          >
                            <span className="text-label-md font-label-md text-on-surface">{n.nombreCompleto}</span>
<span className="text-body-sm text-on-surface-variant ml-2">
                      — {n.nombreGrupo ?? 'Sin grupo'}
                      {n.sexo === 'Masculino' ? ' (Niño)' : n.sexo === 'Femenino' ? ' (Niña)' : ''}
                    </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Filtro por grupo */}
            <div className="w-full sm:w-56 space-y-stack-sm">
              <label htmlFor="filtro-grupo" className="text-label-md font-label-md text-on-surface-variant ml-1 block">
                Grupo
              </label>
              <select
                id="filtro-grupo"
                value={filtroGrupo === '' ? '' : String(filtroGrupo)}
                onChange={(e) => setFiltroGrupo(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
              >
                <option value="">Todos los grupos</option>
                {grupos.map((g) => (
                  <option key={g.idGrupo} value={g.idGrupo}>{g.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Indicador del turno del usuario */}
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">badge</span>
            Tu turno:
            <strong className="text-on-surface">
              {turnosPermitidos.length === 1 && turnoPorDefecto
                ? mapaTurnoNombre[turnoPorDefecto] ?? `Turno ${turnoPorDefecto}`
                : turnosPermitidos.length > 1
                  ? `Múltiple (elige al inscribir)`
                  : 'No asignado — nivel ≥4 puede elegir'}
            </strong>
          </div>
        </div>

        {/* ── Filas pendientes de inscribir ─────────────────────── */}
        {pendientes.length > 0 && (
          <section aria-label="Pendientes de inscribir" className="space-y-stack-md">
            <h2 className="text-title-md font-title-md text-on-surface-variant">Pendientes de inscribir</h2>
            {pendientes.map((p) => (
              <div
                key={p.key}
                className="bg-primary/5 border border-primary/30 rounded-xl p-gutter shadow-sm space-y-stack-sm"
              >
                {/* Cabecera: niño + grupo + sexo */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                    {p.sexo === 'Masculino' ? 'boy' : p.sexo === 'Femenino' ? 'girl' : 'person'}
                  </span>
                  <span className="text-label-lg font-label-lg text-on-surface">{p.nombreCompleto}</span>
                  {p.grupoNombre && (
                    <span className="text-body-sm text-on-surface-variant bg-surface-container-high rounded-full px-2 py-0.5">
                      {p.grupoNombre}
                    </span>
                  )}
                </div>

                {/* Turno + tutor */}
                <div className="flex flex-col sm:flex-row gap-gutter">
                  {/* Turno: selector si hay varios turnos posibles, badge si solo 1 */}
                  <div className="w-full sm:w-56 space-y-stack-sm">
                    <label className="text-label-sm font-label-md text-on-surface-variant block">Turno</label>
                    {turnoPorDefecto != null ? (
                      <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-label-sm font-label-md px-3 py-2 rounded-full w-full">
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">schedule</span>
                        {mapaTurnoNombre[turnoPorDefecto] ?? `Turno ${turnoPorDefecto}`}
                      </span>
                    ) : (
                      <select
                        value={p.idTurno != null ? String(p.idTurno) : ''}
                        onChange={(e) => actualizarPendiente(p.key, { idTurno: e.target.value ? Number(e.target.value) : null })}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      >
                        <option value="">Seleccionar turno...</option>
                        {TURNOS_LIGA.filter((t) => turnosPermitidos.includes(t.id)).map((t) => (
                          <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Tutor (obligatorio) */}
                  <div className="flex-1 space-y-stack-sm">
                    <label className="text-label-sm font-label-md text-on-surface-variant block">Tutor *</label>
                    {p.cargandoTutores ? (
                      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant py-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Cargando tutores...
                      </div>
                    ) : p.tutores.length === 0 ? (
                      <div className="flex items-center gap-2 text-body-sm text-error bg-error/10 rounded-lg px-3 py-2">
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">warning</span>
                        El niño no tiene tutores registrados. No se puede inscribir.
                      </div>
                    ) : (
                      <select
                        value={p.tutorId != null ? String(p.tutorId) : ''}
                        onChange={(e) => actualizarPendiente(p.key, { tutorId: e.target.value ? Number(e.target.value) : null })}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      >
                        <option value="">Seleccionar tutor...</option>
                        {p.tutores.map((t) => (
                          <option key={t.idPersona} value={t.idPersona}>
                            {t.nombreCompleto} ({t.telefono ?? 'sin teléfono'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Botones inscribir / cancelar */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => inscribir(p)}
                    disabled={
                      cargandoGuardando ||
                      !p.tutorId ||
                      !p.idTurno ||
                      p.tutores.length === 0
                    }
                    className="h-9 px-4 bg-primary text-on-primary rounded-lg text-label-sm font-label-md shadow-sm active:scale-95 transition-transform hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {cargandoGuardando ? (
                      <>
                        <div className="w-3 h-3 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                        Inscribiendo...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">add_circle</span>
                        Inscribir
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelarPendiente(p.key)}
                    className="h-9 px-4 border border-outline-variant rounded-lg text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── Lista de participantes ───────────────────────────── */}
        {cargando ? (
          <div className="space-y-stack-md">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter animate-pulse">
                <div className="h-5 w-40 bg-surface-container-high rounded-full mb-2" />
                <div className="h-4 w-64 bg-surface-container-high rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {listaVisible.length === 0 && pendientes.length === 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter shadow-sm text-center text-body-sm text-on-surface-variant">
                No hay participantes inscritos. Usa la barra de búsqueda para agregar niños.
              </div>
            )}
            <div className="space-y-stack-md">
              {listaVisible.map((p) => (
                <ParticipanteFila
                  key={p.idLiga}
                  participante={p}
                  onEliminar={eliminar}
                  onCambiarTutor={cambiarTutor}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </LayoutPrincipal>
  );
};

/** Fila individual de un participante ya inscrito. Se extrae para simplificar el renderizado. */
const ParticipanteFila: React.FC<{
  participante: ParticipanteLigaApi;
  onEliminar: (p: ParticipanteLigaApi) => void;
  onCambiarTutor: (p: ParticipanteLigaApi, idTutor: number) => void;
}> = ({ participante, onEliminar, onCambiarTutor }) => {
  const [tutores, setTutores] = useState<TutorApi[]>([]);
  const [tutoresCargados, setTutoresCargados] = useState(false);
  const [cargandoTutores, setCargandoTutores] = useState(false);

  const cargarTutores = useCallback(async () => {
    if (tutoresCargados || cargandoTutores) return;
    setCargandoTutores(true);
    try {
      const t = await listarTutoresPorNino(participante.idNino);
      setTutores(t as TutorApi[]);
      setTutoresCargados(true);
    } catch {
      // Silenciar — las opciones quedarán vacías y el usuario puede reintentar
    } finally {
      setCargandoTutores(false);
    }
  }, [participante.idNino, tutoresCargados, cargandoTutores]);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-gutter">
        {/* Info del niño: icono, nombre, grupo, sexo */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary text-[22px] shrink-0" aria-hidden="true">
            {participante.sexo === 'Masculino' ? 'boy' : participante.sexo === 'Femenino' ? 'girl' : 'person'}
          </span>
          <div className="min-w-0">
            <p className="text-label-lg font-label-lg text-on-surface truncate">{participante.nombreNino}</p>
            <p className="text-body-sm text-on-surface-variant truncate">
              {participante.nombreGrupo ?? 'Sin grupo'}
              {participante.sexo === 'Masculino' ? ' · Niño' : participante.sexo === 'Femenino' ? ' · Niña' : ''}
            </p>
          </div>
        </div>

        {/* Turno + fecha (solo lectura) */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-label-sm font-label-md px-2 py-1 rounded-full">
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">schedule</span>
            {participante.turnoNombre?.replace('_', ' ') ?? 'Turno'}
          </span>
          <span className="text-body-sm text-on-surface-variant hidden sm:inline">
            {participante.fechaLiga?.split('-').reverse().join('/')}
          </span>
        </div>

        {/* Tutor select (editable) */}
        <div className="flex-1 min-w-0">
          <select
            value={participante.idTutor}
            onFocus={cargarTutores}
            onChange={(e) => onCambiarTutor(participante, Number(e.target.value))}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            <option value={participante.idTutor}>
              {participante.nombreTutor}{participante.telefonoTutor ? ` (${participante.telefonoTutor})` : ''}
            </option>
            {tutores
              .filter((t) => t.idPersona !== participante.idTutor)
              .map((t) => (
                <option key={t.idPersona} value={t.idPersona}>
                  {t.nombreCompleto}{t.telefono ? ` (${t.telefono})` : ''}
                </option>
              ))}
          </select>
          {cargandoTutores && (
            <span className="text-[11px] text-on-surface-variant ml-1">Cargando tutores...</span>
          )}
        </div>

        {/* Eliminar */}
        <button
          type="button"
          onClick={() => onEliminar(participante)}
          className="text-error hover:bg-error/10 rounded-full p-2 transition-colors shrink-0 self-start"
          title="Quitar participante"
          aria-label={`Quitar a ${participante.nombreNino}`}
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
        </button>
      </div>
    </div>
  );
};

export default PaginaLigaBiblica;