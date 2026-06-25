import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import LayoutPrincipal from '../components/LayoutPrincipal';
import ModalFichaMedica from '../components/ModalFichaMedica';
import ModalExpedienteNino from '../components/ModalExpedienteNino';
import type { Nino } from '../services/tipos';
import type { FilaGrupoApi, GrupoApi, RegistroAsistenciaApi } from '../services/servicioApi';
import {
  listarGrupos,
  listarTurnos,
  listarMisTurnos,
  listarAsistenciaGrupo,
  actualizarEstadoAsistenciaGrupo,
  listarAsistenciaDia,
} from '../services/servicioApi';
import { fechaLocalHoy } from '../services/fechaUtils';
import { formatearTurno } from '../services/turnoUtils';

// ── Helpers ───────────────────────────────────────────────────────
const colorAvatar = (nombre: string) => {
  const paleta = [
    'bg-primary/20 text-primary',
    'bg-tertiary/20 text-tertiary',
    'bg-secondary/20 text-secondary',
    'bg-error/10 text-error',
  ];
  return paleta[nombre.charCodeAt(0) % paleta.length];
};

const BADGE_ALERTA: Record<string, { cls: string; icono: string; texto: string }> = {
  Alta: {
    cls: 'bg-error-container text-on-error-container border-error/20',
    icono: 'medical_services',
    texto: 'ALTA PRIORIDAD',
  },
  Moderada: {
    cls: 'bg-secondary-fixed text-on-secondary-fixed-variant border-secondary-container/20',
    icono: 'warning',
    texto: 'MODERADA',
  },
};

// ── Leer usuario del JWT almacenado ───────────────────────────────
function leerUsuarioLocal(): { nivelJerarquico: number } {
  try {
    const raw = localStorage.getItem('ed_usuario');
    if (raw) return JSON.parse(raw) as { nivelJerarquico: number };
    // Decodificar JWT si no hay dato guardado
    const token = localStorage.getItem('ed_token') ?? '';
    const partes = token.split('.');
    if (partes.length === 3) {
      const payload = JSON.parse(atob(partes[1]));
      return { nivelJerarquico: payload.nivelJerarquico ?? 1 };
    }
  } catch { /* silencioso */ }
  return { nivelJerarquico: 1 };
}

// ── Componente principal ──────────────────────────────────────────
const PaginaAsistenciaPorGrupo: React.FC = () => {
  const navigate = useNavigate();
  const usuario = useMemo(() => leerUsuarioLocal(), []);
  const esCoordinador = usuario.nivelJerarquico >= 4;

  // Grupos
  const [grupos, setGrupos] = useState<GrupoApi[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number>(0);
  const [cargandoGrupos, setCargandoGrupos] = useState(true);

  // Turnos
  const [turnos, setTurnos] = useState<Array<{ idTurno: number; nombre: string; horaInicio: string }>>([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<number | null>(null);
  const [cargandoTurnos, setCargandoTurnos] = useState(true);

  // Filas de asistencia
  const [filas, setFilas] = useState<FilaGrupoApi[]>([]);
  const [cargando, setCargando] = useState(false);

  // Búsqueda de niño en otro grupo
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<RegistroAsistenciaApi[]>([]);
  const [buscando, setBuscando] = useState(false);

  // Ordenamiento
  const [ordenCol, setOrdenCol] = useState<'nombre' | 'estado' | 'hora'>('hora');
  const [ordenDir, setOrdenDir] = useState<'asc' | 'desc'>('asc');

  // Modal ficha médica
  const [ninoFicha, setNinoFicha] = useState<Nino | null>(null);
  // Modal expediente de conducta
  const [ninoExpediente, setNinoExpediente] = useState<Nino | null>(null);

  // ── Carga inicial: grupos ────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        const datos = await listarGrupos();
        setGrupos(datos);
        if (datos.length > 0) setGrupoSeleccionado(datos[0].idGrupo);
      } catch (err) {
        console.error('Error cargando grupos:', err);
      } finally {
        setCargandoGrupos(false);
      }
    };
    cargar();
  }, []);

  // ── Carga inicial: turnos según rol ─────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      setCargandoTurnos(true);
      try {
        const datos = esCoordinador
          ? (await listarTurnos()).filter((t) => t.activo)
          : await listarMisTurnos();
        setTurnos(datos);
        // Seleccionar el primero por defecto
        if (datos.length > 0) setTurnoSeleccionado(datos[0].idTurno);
        else setTurnoSeleccionado(null);
      } catch (err) {
        console.error('Error cargando turnos:', err);
        setTurnos([]);
      } finally {
        setCargandoTurnos(false);
      }
    };
    cargar();
  }, [esCoordinador]);

  // ── Carga de asistencia del grupo + turno con SWR ────────────────
  const { data: swrDatos, isLoading: isLoadingAsistencia, mutate: mutateAsistencia } = useSWR(
    grupoSeleccionado && !cargandoTurnos ? ['/asistencia/grupo', grupoSeleccionado, turnoSeleccionado] : null,
    async () => {
      const res = await listarAsistenciaGrupo(grupoSeleccionado!, turnoSeleccionado ?? undefined, fechaLocalHoy());
      return res;
    },
    {
      refreshInterval: 15000, // 15 segundos
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const cargarAsistencia = useCallback(async (_idGrupo?: number, _idTurno?: number | null) => {
    mutateAsistencia();
  }, [mutateAsistencia]);

  useEffect(() => {
    if (swrDatos) {
      setFilas(swrDatos);
    }
  }, [swrDatos]);

  useEffect(() => {
    if (isLoadingAsistencia && !swrDatos) {
      setCargando(true);
    } else {
      setCargando(false);
    }
  }, [isLoadingAsistencia, swrDatos]);

  // ── Búsqueda en tiempo real de niños en otros grupos ─────────────
  useEffect(() => {
    if (!busqueda.trim() || busqueda.trim().length < 2) {
      setResultadosBusqueda([]);
      return;
    }
    const id = setTimeout(async () => {
      setBuscando(true);
      try {
        const todos = await listarAsistenciaDia(fechaLocalHoy());
        const normalizar = (t: string) =>
          t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const q = normalizar(busqueda.trim());
        const encontrados = (todos as unknown as RegistroAsistenciaApi[]).filter((r) => {
          const nombre = normalizar(r.nino.nombreCompleto);
          // Excluir los que ya están en el grupo actual
          const enGrupoActual = filas.some((f) => f.nino.idPersona === r.nino.idPersona);
          return nombre.includes(q) && !enGrupoActual;
        });
        setResultadosBusqueda(encontrados);
      } catch (err) {
        console.error('Error en búsqueda:', err);
        setResultadosBusqueda([]);
      } finally {
        setBuscando(false);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [busqueda, filas]);

  // ── Toggle estado (optimistic update) ────────────────────────────
  const toggleEstado = useCallback(async (idAsistencia: number, nuevoEstado: 'Presente' | 'Retirado') => {
    const original = filas.find((f) => f.idAsistencia === idAsistencia);
    if (!original) return;
    // Actualizar optimistamente
    setFilas((prev) =>
      prev.map((f) => f.idAsistencia === idAsistencia ? { ...f, estado: nuevoEstado } : f)
    );
    try {
      await actualizarEstadoAsistenciaGrupo(idAsistencia, nuevoEstado);
    } catch (err) {
      console.error('Error actualizando estado:', err);
      // Revertir
      setFilas((prev) =>
        prev.map((f) => f.idAsistencia === idAsistencia ? { ...f, estado: original.estado } : f)
      );
    }
  }, [filas]);

  // ── Ordenamiento ─────────────────────────────────────────────────
  const manejarOrdenar = (col: 'nombre' | 'estado' | 'hora') => {
    if (ordenCol === col) {
      setOrdenDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrdenCol(col);
      setOrdenDir('asc');
    }
  };

  const filasOrdenadas = useMemo(() => {
    return [...filas].sort((a, b) => {
      let valA: string;
      let valB: string;
      if (ordenCol === 'nombre') {
        valA = a.nino.nombreCompleto;
        valB = b.nino.nombreCompleto;
      } else if (ordenCol === 'estado') {
        valA = a.estado;
        valB = b.estado;
      } else {
        valA = a.horaEntrada;
        valB = b.horaEntrada;
      }
      return ordenDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [filas, ordenCol, ordenDir]);

  // ── Métricas ─────────────────────────────────────────────────────
  const totalPresentes = filas.filter((f) => f.estado === 'Presente').length;
  const totalRetirados = filas.filter((f) => f.estado === 'Retirado').length;
  const totalAlertas   = filas.filter((f) =>
    f.nino.alertasMedicas.some((a) => a.severidad === 'Alta' || a.severidad === 'Moderada')
  ).length;

  // ── Renderizado de iconos de orden ────────────────────────────────
  const iconoOrden = (col: 'nombre' | 'estado' | 'hora') => {
    const activo = ordenCol === col;
    const baseCls = 'material-symbols-outlined text-[14px] leading-none';
    const colorActivo = 'text-primary';
    const colorInactivo = 'text-on-surface-variant/40';

    if (!activo) {
      return (
        <span className="inline-flex flex-col items-center ml-1 -space-y-1 align-middle">
          <span className={`${baseCls} ${colorInactivo}`}>expand_less</span>
          <span className={`${baseCls} ${colorInactivo}`}>expand_more</span>
        </span>
      );
    }

    if (ordenDir === 'asc') {
      return (
        <span className="inline-flex flex-col items-center ml-1 -space-y-1 align-middle">
          <span className={`${baseCls} ${colorActivo}`}>expand_less</span>
          <span className={`${baseCls} ${colorInactivo}`}>expand_more</span>
        </span>
      );
    }

    return (
      <span className="inline-flex flex-col items-center ml-1 -space-y-1 align-middle">
        <span className={`${baseCls} ${colorInactivo}`}>expand_less</span>
        <span className={`${baseCls} ${colorActivo}`}>expand_more</span>
      </span>
    );
  };

  // ── Alerta médica ─────────────────────────────────────────────────
  const renderAlerta = (nino: { alertasMedicas: Array<{ severidad: string }> }) => {
    const maxSev = nino.alertasMedicas.find((a) => a.severidad === 'Alta')
      ? 'Alta'
      : nino.alertasMedicas.find((a) => a.severidad === 'Moderada')
        ? 'Moderada'
        : null;
    if (!maxSev) return <span className="text-body-sm text-on-surface-variant/50 italic">Sin alertas</span>;
    const b = BADGE_ALERTA[maxSev];
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight border flex items-center gap-1 w-fit ${b.cls}`}>
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{b.icono}</span>
        {b.texto}
      </span>
    );
  };

  // ── Nombre del turno actual ───────────────────────────────────────
  const turnoActual = turnos.find((t) => t.idTurno === turnoSeleccionado);

  return (
    <LayoutPrincipal titulo="Asistencia por Grupo">
      <div className="space-y-stack-lg max-w-[1280px]">

        {/* ── Encabezado ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-label-md font-label-md text-primary uppercase tracking-wider">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Vista en tiempo real · Solo niños con check-in registrado hoy
            </p>
          </div>

          {/* Controles: grupo + turno */}
          <div className="flex flex-wrap gap-3 items-end">
            {/* Selector de grupo */}
            <div className="w-52">
              <label htmlFor="sel-grupo" className="block text-label-sm text-on-surface-variant mb-1">Grupo</label>
              <div className="relative">
                <select
                  id="sel-grupo"
                  value={grupoSeleccionado}
                  onChange={(e) => setGrupoSeleccionado(Number(e.target.value))}
                  disabled={cargandoGrupos}
                  className="w-full h-11 pl-4 pr-10 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none text-body-md text-on-surface outline-none disabled:opacity-60"
                >
                  {grupos.map((g) => (
                    <option key={g.idGrupo} value={g.idGrupo}>{g.nombre}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
              </div>
            </div>

            {/* Selector de turno — solo Coordinador */}
            {esCoordinador ? (
              <div className="w-52">
                <label htmlFor="sel-turno" className="block text-label-sm text-on-surface-variant mb-1">Turno</label>
                <div className="relative">
                  <select
                    id="sel-turno"
                    value={turnoSeleccionado ?? ''}
                    onChange={(e) => setTurnoSeleccionado(Number(e.target.value))}
                    disabled={cargandoTurnos || turnos.length === 0}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none text-body-md text-on-surface outline-none disabled:opacity-60"
                  >
                    {turnos.length === 0 && (
                      <option value="">Sin turnos hoy</option>
                    )}
                    {turnos.map((t) => (
                      <option key={t.idTurno} value={t.idTurno}>
                        {formatearTurno(t.nombre)}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            ) : (
              /* Badge de turno fijo para roles no-coordinador */
              <div className="flex flex-col gap-1">
                <span className="text-label-sm text-on-surface-variant">Turno</span>
                <div className="h-11 px-4 flex items-center rounded-xl border border-outline-variant bg-surface-container-low text-body-md text-on-surface">
                  {cargandoTurnos ? (
                    <div className="h-4 w-28 bg-surface-container-high rounded animate-pulse" />
                  ) : turnoActual ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                      {formatearTurno(turnoActual.nombre)}
                    </span>
                  ) : (
                    <span className="text-on-surface-variant/60 italic text-body-sm">Sin turno asignado</span>
                  )}
                </div>
              </div>
            )}

            {/* Recargar */}
            <button
              onClick={() => cargarAsistencia(grupoSeleccionado, turnoSeleccionado)}
              disabled={cargando}
              title="Actualizar lista"
              className="h-11 w-11 rounded-xl border border-outline-variant bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
              aria-label="Recargar asistencia"
            >
              <span className={`material-symbols-outlined text-[20px] ${cargando ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
        </div>

        {/* ── Tarjetas métricas ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Presentes */}
          <div className="bg-surface-container-lowest rounded-xl p-gutter border border-outline-variant shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-tertiary/10 to-transparent" aria-hidden="true" />
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="relative z-10">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Presentes</p>
              {cargando
                ? <div className="h-8 w-10 bg-surface-container-high rounded animate-pulse mt-1" />
                : <p className="text-headline-md font-headline-md text-tertiary">{totalPresentes}</p>}
            </div>
          </div>

          {/* Retirados */}
          <div className="bg-surface-container-lowest rounded-xl p-gutter border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-outline-variant/30 flex items-center justify-center text-on-surface-variant shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Retirados</p>
              {cargando
                ? <div className="h-8 w-10 bg-surface-container-high rounded animate-pulse mt-1" />
                : <p className="text-headline-md font-headline-md text-on-surface">{totalRetirados}</p>}
            </div>
          </div>

          {/* Alertas médicas */}
          <div className="bg-surface-container-lowest rounded-xl p-gutter border border-outline-variant shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-error/10 to-transparent" aria-hidden="true" />
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <div className="relative z-10">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Con alerta médica</p>
              {cargando
                ? <div className="h-8 w-10 bg-surface-container-high rounded animate-pulse mt-1" />
                : <p className="text-headline-md font-headline-md text-error">{totalAlertas}</p>}
            </div>
          </div>
        </div>

        {/* ── Tabla de niños presentes ───────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {/* Cabecera de la tabla */}
          <div className="px-gutter py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
            <h3 className="text-title-md font-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">groups</span>
              Niños en el aula
              {!cargando && filas.length > 0 && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-primary/10 text-primary">
                  {filas.length}
                </span>
              )}
            </h3>
            {turnoActual && (
              <span className="text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant">
                {formatearTurno(turnoActual.nombre)}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th
                    className="px-2.5 py-2 sm:py-2.5 text-label-md font-label-md text-on-surface-variant cursor-pointer select-none hover:bg-surface-container-high transition-colors"
                    onClick={() => manejarOrdenar('nombre')}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && manejarOrdenar('nombre')}
                  >
                    <span className="flex items-center gap-1">Estudiante {iconoOrden('nombre')}</span>
                  </th>
                  <th
                    className="px-2.5 py-2 sm:py-2.5 text-label-md font-label-md text-on-surface-variant cursor-pointer select-none hover:bg-surface-container-high transition-colors"
                    onClick={() => manejarOrdenar('hora')}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && manejarOrdenar('hora')}
                  >
                    <span className="flex items-center gap-1">Entrada {iconoOrden('hora')}</span>
                  </th>
                  <th
                    className="px-2.5 py-2 sm:py-2.5 text-label-md font-label-md text-on-surface-variant text-center cursor-pointer select-none hover:bg-surface-container-high transition-colors"
                    onClick={() => manejarOrdenar('estado')}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && manejarOrdenar('estado')}
                  >
                    <span className="flex items-center justify-center gap-1">Estado {iconoOrden('estado')}</span>
                  </th>
                  <th className="px-2.5 py-2 sm:py-2.5 text-label-md font-label-md text-on-surface-variant">
                    Alerta médica
                  </th>
                  <th className="px-2.5 py-2 sm:py-2.5 text-label-md font-label-md text-on-surface-variant text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">

                {/* Skeleton de carga */}
                {cargando && Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-2.5 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 bg-surface-container-high rounded-full" />
                          <div className="h-3 w-20 bg-surface-container-high rounded-full" />
                        </div>
                      </div>
                    </td>
                    <td className="px-2.5 py-2"><div className="h-4 w-20 bg-surface-container-high rounded-full" /></td>
                    <td className="px-2.5 py-2"><div className="h-7 w-28 mx-auto bg-surface-container-high rounded-full" /></td>
                    <td className="px-2.5 py-2"><div className="h-5 w-24 bg-surface-container-high rounded-full" /></td>
                    <td className="px-2.5 py-2"><div className="h-8 w-20 ml-auto bg-surface-container-high rounded-lg" /></td>
                  </tr>
                ))}

                {/* Estado vacío */}
                {!cargando && filasOrdenadas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-2.5 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[52px] opacity-30" aria-hidden="true">
                          {turnoSeleccionado === null ? 'schedule_off' : 'child_care'}
                        </span>
                        <p className="text-body-md font-medium">
                          {turnoSeleccionado === null
                            ? 'No hay un turno seleccionado.'
                            : 'Ningún niño ha hecho check-in en este grupo para este turno hoy.'}
                        </p>
                        <p className="text-body-sm opacity-70">
                          Los registros se crean al hacer check-in desde la pantalla principal.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Filas reales */}
                {!cargando && filasOrdenadas.map((fila) => {
                  const { nino, estado, horaEntrada, horaSalida, idAsistencia } = fila;
                  const iniciales = `${nino.nombres[0]}${nino.apellidos[0]}`;
                  const estaRetirado = estado === 'Retirado';

                  return (
                    <tr
                      key={idAsistencia}
                      className={`transition-colors ${estaRetirado ? 'opacity-60 hover:opacity-80' : 'hover:bg-surface-container-high/50'}`}
                    >
                      {/* Estudiante */}
                      <td className="px-2.5 py-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-label-md font-bold ${colorAvatar(nino.nombres)}`}
                            aria-hidden="true"
                          >
                            {iniciales}
                          </div>
                          <div>
                            <p className="text-label-md font-label-md text-on-surface">{nino.nombreCompleto}</p>
                            <p className="text-body-sm text-on-surface-variant">{nino.grupo.nombre}</p>
                          </div>
                        </div>
                      </td>

                      {/* Hora entrada / salida */}
                      <td className="px-2.5 py-2">
                        <div className="space-y-0.5">
                          <p className="text-body-sm text-on-surface flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-tertiary">login</span>
                            {horaEntrada}
                          </p>
                          {horaSalida && (
                            <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-outline">logout</span>
                              {horaSalida}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Estado — toggle o badge fijo */}
                      <td className="px-2.5 py-2">
                        <div className="flex justify-center">
                          {estaRetirado ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-label-sm bg-outline-variant/20 text-on-surface-variant border border-outline-variant/40">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              Retirado
                            </span>
                          ) : (
                            <div className="flex items-center bg-surface-container-low rounded-full p-1 border border-outline-variant">
                              <button
                                onClick={() => toggleEstado(idAsistencia, 'Presente')}
                                aria-pressed={true}
                                className="px-4 py-1.5 rounded-full text-label-sm font-label-sm bg-tertiary text-on-tertiary shadow-sm transition-all"
                              >
                                Presente
                              </button>
                              <button
                                onClick={() => {
                                  // Solo cambia a Retirado si se confirma (no hay checkout desde aquí, 
                                  // ese flujo es del ModalCheckOut)
                                }}
                                disabled
                                aria-disabled="true"
                                title="El retiro se gestiona desde Asistencia General"
                                className="px-4 py-1.5 rounded-full text-label-sm font-label-sm text-on-surface-variant/50 cursor-not-allowed transition-all"
                              >
                                Retirar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Alerta médica */}
                      <td className="px-2.5 py-2">
                        {renderAlerta(nino)}
                      </td>

                      {/* Acciones */}
                      <td className="px-2.5 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="relative group inline-block">
                            <button
                              onClick={() => setNinoFicha(nino as unknown as Nino)}
                              className="w-8 h-8 rounded-lg border border-outline-variant text-primary hover:border-primary hover:bg-primary-container/15 flex items-center justify-center transition-all cursor-pointer"
                              aria-label={`Ver ficha médica de ${nino.nombreCompleto}`}
                            >
                              <span className="material-symbols-outlined text-[18px]">medical_services</span>
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                              Vista médica
                            </span>
                          </div>

                          <div className="relative group inline-block">
                            <button
                              onClick={() => setNinoExpediente(nino as unknown as Nino)}
                              className="w-8 h-8 rounded-lg border border-outline-variant text-secondary hover:border-secondary hover:bg-secondary-container/15 flex items-center justify-center transition-all cursor-pointer"
                              aria-label={`Ver expediente de ${nino.nombreCompleto}`}
                            >
                              <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                              Ver expediente
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Buscador de niños en otros grupos ─────────────────── */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-gutter py-4 border-b border-outline-variant/30 bg-surface-bright">
            <h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" aria-hidden="true">search</span>
              Buscar niño en otro grupo
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Si un niño está físicamente en este aula pero su check-in es de otro grupo, búscalo aquí.
            </p>
          </div>

          <div className="px-gutter py-4 space-y-3">
            {/* Campo de búsqueda */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                {buscando ? 'hourglass_empty' : 'person_search'}
              </span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre del niño..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
                aria-label="Buscar niño de otro grupo"
              />
              {busqueda && (
                <button
                  onClick={() => { setBusqueda(''); setResultadosBusqueda([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Resultados */}
            {resultadosBusqueda.length > 0 && (
              <div className="space-y-2">
                {resultadosBusqueda.map((r) => (
                  <div
                    key={r.idAsistencia}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-secondary/30 bg-secondary/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-label-md shrink-0">
                        {r.nino.nombres[0]}{r.nino.apellidos[0]}
                      </div>
                      <div>
                        <p className="text-label-md font-label-md text-on-surface">{r.nino.nombreCompleto}</p>
                        <p className="text-body-sm text-secondary">
                          Registrado en: <strong>{r.nino.grupo.nombre}</strong> · Entró: {r.horaEntrada}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[11px] text-secondary font-bold uppercase tracking-wide bg-secondary/15 px-2 py-0.5 rounded-full border border-secondary/20">
                        Grupo diferente
                      </span>
                      <button
                        onClick={() => navigate('/asistencia')}
                        className="inline-flex items-center gap-1 text-label-sm text-primary hover:underline"
                      >
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        Ir a Asistencia General
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {busqueda.trim().length >= 2 && !buscando && resultadosBusqueda.length === 0 && (
              <p className="text-body-sm text-on-surface-variant italic py-2 text-center">
                No se encontró ningún niño con check-in hoy que no esté ya en este grupo.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ── Modal ficha médica ─────────────────────────────────── */}
      <ModalFichaMedica
        abierto={ninoFicha !== null}
        onCerrar={() => setNinoFicha(null)}
        nino={ninoFicha}
      />

      {/* ── Modal expediente de conducta ───────────────────────── */}
      <ModalExpedienteNino
        abierto={ninoExpediente !== null}
        onCerrar={() => setNinoExpediente(null)}
        ninoId={ninoExpediente?.idPersona ?? 0}
        ninoNombre={ninoExpediente?.nombreCompleto ?? ''}
      />
    </LayoutPrincipal>
  );
};

export default PaginaAsistenciaPorGrupo;
