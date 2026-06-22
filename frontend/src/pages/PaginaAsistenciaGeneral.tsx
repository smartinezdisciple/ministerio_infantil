// PaginaAsistenciaGeneral.tsx — Módulo de Asistencia General (Spec §4, Plan Maestro Fase 4)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import BadgeEstado from '../components/BadgeEstado';
import ModalCheckIn from '../components/ModalCheckIn';
import ModalCheckOut from '../components/ModalCheckOut';
import { useAuth } from '../contexts/ContextoAuth';
import type { RegistroAsistenciaNino, EstadoAsistencia, DatosCheckIn } from '../services/tipos';
import { listarAsistenciaDia, registrarCheckIn, eliminarAsistencia, listarTurnos } from '../services/servicioApi';
import { fechaLocalHoy, esCumpleanosHoy } from '../services/fechaUtils';
import { formatearTurno } from '../services/turnoUtils';
import ModalEditarAsistencia from '../components/ModalEditarAsistencia';
import ModalBase from '../components/ModalBase';
import ModalConfirmar from '../components/ModalConfirmar';
import { toast } from 'react-hot-toast';

// Helper para formatear fecha a DD/MM/YYYY
const formatearFecha = (fechaStr: string) => {
  if (!fechaStr) return '';
  const fechaLimpia = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
  const partes = fechaLimpia.split('-');
  if (partes.length === 3) {
    const [yyyy, mm, dd] = partes;
    return `${dd}/${mm}/${yyyy}`;
  }
  return fechaStr;
};

// (datos mock eliminados — ahora se obtienen del backend)

// ── Columnas de la tabla ─────────────────────────────────────────
const construirColumnas = (
  onVerDetalles: (registro: RegistroAsistenciaNino) => void,
  onCheckOut: (registro: RegistroAsistenciaNino) => void,
  onEditar: (registro: RegistroAsistenciaNino) => void,
  onEliminar: (registro: RegistroAsistenciaNino) => void,
  puedeCheckOut: boolean,
  nivelJerarquico: number,
  filtroFecha: string
): ColumnaTabla<RegistroAsistenciaNino>[] => [
  {
    id: 'estudiante',
    encabezado: 'Estudiante',
    ancho: 'w-[190px]',
    ordenablePor: (r) => r.nino.nombreCompleto,
    render: (r) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">
          {r.nino.nombres[0]}{r.nino.apellidos[0]}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-on-surface flex-nowrap">
            <span className="truncate max-w-[120px]" title={r.nino.nombreCompleto}>
              {r.nino.nombreCompleto}
            </span>
            {r.nino.alertasMedicas.some((a) => a.severidad === 'Alta') && (
              <span className="material-symbols-outlined text-error shrink-0" style={{ fontSize: '13px' }} title="Alerta médica alta">warning</span>
            )}
            {esCumpleanosHoy(r.nino.fechaNacimiento, filtroFecha) && (
              <span className="material-symbols-outlined text-emerald-600 shrink-0" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }} title="Cumpleaños hoy">cake</span>
            )}
          </div>
          <p className="text-[11px] text-on-surface-variant truncate">{r.nino.grupo.nombre}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'fecha',
    encabezado: 'Fecha',
    ancho: 'w-[95px]',
    ordenablePor: 'fecha',
    render: (r) => <span className="text-[12px] text-on-surface">{formatearFecha(r.fecha)}</span>,
  },
  {
    id: 'fichaEntrada',
    encabezado: 'F.Entrada',
    ancho: 'w-[85px]',
    ordenablePor: 'codigoFichaEntrada',
    render: (r) => <span className="font-mono text-[12px] text-on-surface">{r.codigoFichaEntrada}</span>,
  },
  {
    id: 'acompanante',
    encabezado: 'Acompañante',
    ancho: 'w-[105px]',
    ordenablePor: (r) => r.acompananteEnAula ? 0 : 1,
    render: (r) => (
      <span className="flex items-center justify-center">
        {r.acompananteEnAula ? (
          <div className="w-[20px] h-[20px] rounded border border-tertiary/50 bg-tertiary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-tertiary text-[13px] font-bold" aria-hidden="true">check</span>
          </div>
        ) : (
          <div className="w-[20px] h-[20px] rounded border border-error/50 bg-error/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-error text-[13px] font-bold" aria-hidden="true">close</span>
          </div>
        )}
      </span>
    ),
  },
  {
    id: 'fichaSalida',
    encabezado: 'F.Salida',
    ancho: 'w-[85px]',
    ordenablePor: (r) => r.codigoFichaSalida ?? '',
    render: (r) => (
      <span className="font-mono text-[12px] text-on-surface">
        {r.codigoFichaSalida ?? <span className="text-on-surface-variant/50">—</span>}
      </span>
    ),
  },
  {
    id: 'horaSalida',
    encabezado: 'Salida',
    ancho: 'w-[85px]',
    ordenablePor: (r) => r.horaSalida ?? '',
    render: (r) => (
      <span className="text-[12px] text-on-surface">
        {r.horaSalida ?? <span className="text-on-surface-variant/50">—</span>}
      </span>
    ),
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    ancho: 'w-[95px]',
    ordenablePor: 'estado',
    render: (r) => <BadgeEstado estado={r.estado} />,
  },
  {
    id: 'acciones',
    encabezado: 'Acciones',
    ancho: 'w-[130px]',
    alineaDerecha: true,
    render: (r) => {
      const puedeEditarBorrar = nivelJerarquico >= 3;
      const completado = r.estado === 'Completado' || r.estado === 'Retirado';
      
      return (
        <div className="flex items-center justify-end gap-1 ml-auto">
          <div className="relative group inline-block">
            <button
              onClick={() => onVerDetalles(r)}
              className="w-[28px] h-[28px] rounded-lg border-[3px] border-sky-500 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:border-sky-500 hover:text-black flex items-center justify-center transition-all cursor-pointer"
              aria-label="Ver detalles"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }} aria-hidden="true">visibility</span>
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
              ver
            </span>
          </div>
          {!completado && puedeCheckOut && (
            <div className="relative group inline-block">
              <button
                onClick={() => onCheckOut(r)}
                className="w-[28px] h-[28px] rounded-lg border-[3px] border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Registrar salida"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }} aria-hidden="true">logout</span>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                checkout
              </span>
            </div>
          )}
          {puedeEditarBorrar && (
            <>
              <div className="relative group inline-block">
                <button
                  onClick={() => onEditar(r)}
                  className="w-[28px] h-[28px] rounded-lg border-[3px] border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Editar asistencia"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }} aria-hidden="true">edit</span>
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                  editar
                </span>
              </div>
              <div className="relative group inline-block">
                <button
                  onClick={() => onEliminar(r)}
                  className="w-[28px] h-[28px] rounded-lg border-[3px] border-red-500 bg-red-50 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Eliminar asistencia"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }} aria-hidden="true">delete</span>
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                  eliminar
                </span>
              </div>
            </>
          )}
          {completado && !puedeEditarBorrar && (
            <span className="text-body-sm text-on-surface-variant/50 italic">Realizado</span>
          )}
        </div>
      );
    },
  },
];

// ── Página ────────────────────────────────────────────────────────
const PaginaAsistenciaGeneral: React.FC = () => {
  const { usuario } = useAuth();

  // Estado de datos
  const [registros, setRegistros]           = useState<RegistroAsistenciaNino[]>([]);
  const [cargando, setCargando]             = useState(true);
  const [pagina, setPagina]                 = useState(1);
  const [porPagina, setPorPagina]           = useState(20);

  // Estado de filtros
  const [filtroGrupo, setFiltroGrupo]       = useState('');
  const [filtroTurno, setFiltroTurno]       = useState('');
  const [filtroEstado, setFiltroEstado]     = useState<'todos' | 'Pendiente'>('todos');
  const [filtroFecha, setFiltroFecha]       = useState(fechaLocalHoy());
  const [filtroCumpleanos, setFiltroCumpleanos] = useState(false);
  const [busqueda, setBusqueda]             = useState('');

  // Estado de catálogo de turnos
  const [turnos, setTurnos]                 = useState<Array<{ idTurno: number; nombre: string; horaInicio: string }>>([]);

  // Estado de modales
  const [modalCheckIn, setModalCheckIn]     = useState(false);
  const [modalCheckOut, setModalCheckOut]   = useState(false);
  const [modalEditar, setModalEditar]       = useState(false);
  const [modalDetalles, setModalDetalles]   = useState(false);
  const [registroCheckOut, setRegistroCheckOut] = useState<RegistroAsistenciaNino | null>(null);
  const [registroEditar, setRegistroEditar]     = useState<RegistroAsistenciaNino | null>(null);
  const [registroDetalles, setRegistroDetalles] = useState<RegistroAsistenciaNino | null>(null);
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState(false);
  const [registroAEliminar, setRegistroAEliminar] = useState<RegistroAsistenciaNino | null>(null);

  // Permisos: todos los roles pueden hacer check-in/check-out (nivel ≥ 1)
  const puedeOperar = (usuario?.nivelJerarquico ?? 0) >= 1;

  /**
   * Carga registros del día desde el backend.
   * GET /api/asistencia?fecha={filtroFecha}&grupo={filtroGrupo}
   */
  const cargarRegistros = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await listarAsistenciaDia(filtroFecha, filtroGrupo || undefined, filtroTurno || undefined);
      setRegistros(datos as unknown as RegistroAsistenciaNino[]);
      setPagina(1);
    } catch (err) {
      console.error('Error cargando asistencia:', err);
      // Sin datos del servidor, mostrar lista vacía
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  }, [filtroFecha, filtroGrupo, filtroTurno]);

  // Cargar catálogo de turnos al montar
  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const datos = await listarTurnos();
        setTurnos(datos.filter((t: any) => t.activo));
      } catch (err) {
        console.error('Error cargando turnos:', err);
      }
    };
    cargarTurnos();
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  // Filtrado local (búsqueda + estado)
  const registrosFiltrados = useMemo(() => {
    const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q = normalizar(busqueda);
    return registros.filter((r) => {
      const coincideBusqueda = busqueda
        ? normalizar(r.nino.nombreCompleto).includes(q) || normalizar(r.codigoFichaEntrada).includes(q)
        : true;
      const coincideEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'Pendiente' && (r.estado === 'Pendiente' || r.estado === 'Presente'));
      const coincideCumple =
        !filtroCumpleanos || esCumpleanosHoy(r.nino.fechaNacimiento, filtroFecha);
      return coincideBusqueda && coincideEstado && coincideCumple;
    });
  }, [registros, busqueda, filtroEstado, filtroCumpleanos, filtroFecha]);

  // Paginación
  const registrosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return registrosFiltrados.slice(inicio, inicio + porPagina);
  }, [registrosFiltrados, pagina]);

  // Métricas resumen
  const pendientes  = registros.filter((r) => r.estado === 'Pendiente' || r.estado === 'Presente').length;
  const total       = registros.length;



  // Acompañantes y Flujo combinado
  const totalAcompanantes = useMemo(() => registros.filter((r) => r.acompananteEnAula).length, [registros]);
  const flujoTotalCombinado = useMemo(() => total + totalAcompanantes, [total, totalAcompanantes]);

  // Handlers de check-in / check-out
  const handleCheckInConfirmado = useCallback(async (datos: DatosCheckIn & { nombreNino: string }) => {
    try {
      await registrarCheckIn({
        idNino: datos.idNino,
        idFichaEntrada: datos.idFichaEntrada,
        idIngresadoPor: datos.idTutorEntrega,
        acompananteEnAula: datos.acompananteEnAula,
        idGrupo: datos.idGrupo,
        idTurno: datos.idTurno,
        fecha: datos.fecha,
        motivoExcepcion: datos.motivoExcepcion,
      });
      toast.success(`Check-in de ${datos.nombreNino} realizado.`);
      cargarRegistros();
    } catch (err: any) {
      console.error('Error en check-in:', err);
      toast.error(err.message || 'Error al registrar la asistencia.');
    }
  }, [cargarRegistros]);

  const handleAbrirCheckOut = useCallback((registro: RegistroAsistenciaNino) => {
    setRegistroCheckOut(registro);
    setModalCheckOut(true);
  }, []);

  const handleAbrirEditar = useCallback((registro: RegistroAsistenciaNino) => {
    setRegistroEditar(registro);
    setModalEditar(true);
  }, []);

  const handleAbrirDetalles = useCallback((registro: RegistroAsistenciaNino) => {
    setRegistroDetalles(registro);
    setModalDetalles(true);
  }, []);

  const handleCerrarDetalles = useCallback(() => {
    setModalDetalles(false);
    setRegistroDetalles(null);
  }, []);

  const handleEliminarAsistencia = useCallback((registro: RegistroAsistenciaNino) => {
    setRegistroAEliminar(registro);
    setModalConfirmarEliminar(true);
  }, []);

  const confirmarEliminar = async () => {
    if (!registroAEliminar) return;
    try {
      await eliminarAsistencia(registroAEliminar.idAsistencia);
      toast.success(`Asistencia de ${registroAEliminar.nino.nombreCompleto} eliminada.`);
      cargarRegistros();
    } catch (err: any) {
      console.error('Error al eliminar asistencia:', err);
      toast.error(err.message || 'Error al eliminar el registro de asistencia.');
    } finally {
      setRegistroAEliminar(null);
    }
  };

  /**
   * El modal ModalCheckOut se encarga de llamar al API de checkout.
   * Aquí solo actualizamos el estado local para reflejar el cambio en la UI.
   */
  const handleCheckOutConfirmado = useCallback((idAsistencia: number, codigoFichaSalida?: string) => {
    setRegistros((prev) =>
      prev.map((r) =>
        r.idAsistencia === idAsistencia
          ? {
              ...r,
              estado: 'Retirado' as EstadoAsistencia,
              horaSalida: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              codigoFichaSalida: codigoFichaSalida ?? r.codigoFichaSalida,
            }
          : r
      )
    );
  }, []);

  const puedeCheckOut = puedeOperar;

  const columnas = useMemo(
    () => construirColumnas(
      handleAbrirDetalles,
      handleAbrirCheckOut,
      handleAbrirEditar,
      handleEliminarAsistencia,
      puedeCheckOut,
      usuario?.nivelJerarquico ?? 1,
      filtroFecha
    ),
    [handleAbrirDetalles, handleAbrirCheckOut, handleAbrirEditar, handleEliminarAsistencia, puedeCheckOut, usuario?.nivelJerarquico, filtroFecha]
  );

   // Botón de acción en la barra superior
   const botonCheckin = puedeOperar ? (
     <button
       onClick={() => setModalCheckIn(true)}
       className="flex items-center gap-2 bg-primary text-on-primary px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-label-md sm:text-label-md text-base hover:bg-primary/90 active:scale-95 transition-all"
       aria-label="Registrar nuevo ingreso"
     >
       <span className="material-symbols-outlined text-[20px] sm:text-[24px]" aria-hidden="true">add_circle</span>
       <span className="ml-2">Registrar Asistencia</span>
     </button>
   ) : undefined;

  return (
    <LayoutPrincipal titulo="Asistencia General" accionBarra={botonCheckin}>
      <div className="space-y-stack-lg max-w-[1440px]">

        {/* ── Bento de métricas ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card principal: pendientes */}
          <div className="bg-primary text-on-primary p-6 rounded-2xl shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md opacity-90 uppercase tracking-wider">
                Pendientes de Salida
              </span>
              <span className="material-symbols-outlined opacity-90" aria-hidden="true">
                pending_actions
              </span>
            </div>
            <div>
              <span className="text-display-lg font-bold leading-none">{String(pendientes).padStart(2, '0')}</span>
              <p className="text-body-sm mt-1 opacity-80">Estudiantes en salón ahora</p>
            </div>
          </div>

          {/* Card: flujo total del día (Niños + Acompañantes) */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md text-primary uppercase tracking-wider">
                Flujo de Hoy
              </span>
              <span className="material-symbols-outlined text-primary" aria-hidden="true">
                groups
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-display-lg font-bold leading-none text-on-surface">{flujoTotalCombinado}</span>
                <span className="text-body-sm text-on-surface-variant">(Total)</span>
              </div>
              <p className="text-body-sm mt-1 text-on-surface-variant font-medium">
                {total} Niños + {totalAcompanantes} Acompañantes
              </p>
            </div>
          </div>

          {/* Card: acompañantes en aula */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md text-primary uppercase tracking-wider">
                Acompañantes en Aula
              </span>
              <span className="material-symbols-outlined text-primary" aria-hidden="true">
                family_restroom
              </span>
            </div>
            <div>
              <span className="text-display-lg font-bold leading-none text-on-surface">{String(totalAcompanantes).padStart(2, '0')}</span>
              <p className="text-body-sm mt-1 text-on-surface-variant">Acompañantes en el salón hoy</p>
            </div>
          </div>
        </div>

        {/* ── Filtros Agrupados ──────────────────────── */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Filtro Grupo */}
            <div className="flex flex-col">
              <label htmlFor="filtro-grupo" className="text-label-sm font-label-sm text-on-surface mb-1.5">
                Grupo
              </label>
              <div className="relative">
                <select
                  id="filtro-grupo"
                  value={filtroGrupo}
                  onChange={(e) => { setFiltroGrupo(e.target.value); setPagina(1); }}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-3 pr-8 py-2 text-[13px] h-[38px] focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                >
                  <option value="">Todos los Grupos</option>
                  <option value="1">4-6 años</option>
                  <option value="2">7-9 años</option>
                  <option value="3">10-12 años</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>

            {/* Filtro Turno */}
            <div className="flex flex-col">
              <label htmlFor="filtro-turno" className="text-label-sm font-label-sm text-on-surface mb-1.5">
                Turno
              </label>
              <div className="relative">
                <select
                  id="filtro-turno"
                  value={filtroTurno}
                  onChange={(e) => { setFiltroTurno(e.target.value); setPagina(1); }}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-3 pr-8 py-2 text-[13px] h-[38px] focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                >
                  <option value="">Todos los Turnos</option>
                  {turnos.map((t) => (
                    <option key={t.idTurno} value={t.idTurno}>
                      {formatearTurno(t.nombre)}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>

            {/* Filtro Estado */}
            <div className="flex flex-col">
              <span className="text-label-sm font-label-sm text-on-surface mb-1.5">Estado</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setFiltroEstado('todos'); setPagina(1); }}
                  className={`px-2 py-2 rounded-xl text-label-sm font-label-sm h-[38px] flex items-center justify-center transition-all ${
                    filtroEstado === 'todos'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  aria-pressed={filtroEstado === 'todos'}
                >
                  Todos
                </button>
                <button
                  onClick={() => { setFiltroEstado('Pendiente'); setPagina(1); }}
                  className={`px-2 py-2 rounded-xl text-label-sm font-label-sm h-[38px] flex items-center justify-center transition-all ${
                    filtroEstado === 'Pendiente'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  aria-pressed={filtroEstado === 'Pendiente'}
                >
                  Pendientes
                </button>
              </div>
            </div>

            {/* Filtro Fecha */}
            <div className="flex flex-col">
              <label htmlFor="filtro-fecha" className="text-label-sm font-label-sm text-on-surface mb-1.5">
                Fecha
              </label>
              <input
                id="filtro-fecha"
                type="date"
                value={filtroFecha}
                onChange={(e) => { setFiltroFecha(e.target.value); setPagina(1); }}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-[13px] h-[38px] focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              />
            </div>

            {/* Filtro Cumpleaños */}
            <div className="flex flex-col">
              <span className="text-label-sm font-label-sm text-on-surface mb-1.5">Cumpleaños</span>
              <button
                type="button"
                onClick={() => { setFiltroCumpleanos(p => !p); setPagina(1); }}
                className={`w-fit px-3 py-2 rounded-xl text-label-sm font-label-sm transition-all flex items-center justify-center gap-1.5 h-[38px] border ${
                  filtroCumpleanos
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                    : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
                aria-pressed={filtroCumpleanos}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: filtroCumpleanos ? "'FILL' 1" : "'FILL' 0" }}>cake</span>
                {filtroCumpleanos ? 'Solo Cumpleañeros' : 'Todos'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabla de asistencia con Buscador integrado ── */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-headline-md text-headline-md text-on-background">
              Listado de Asistencia
            </h3>
            <div className="relative w-full sm:w-80">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                aria-hidden="true"
              >
                search
              </span>
              <input
                id="busqueda-asistencia"
                name="busquedaAsistencia"
                type="text"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                placeholder="Buscar por nombre o ficha..."
                className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all"
                aria-label="Buscar niño por nombre o ficha"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <TablaBase
              columnas={columnas}
              filas={registrosPaginados}
              obtenerClave={(r) => r.idAsistencia}
              pagina={pagina}
              total={registrosFiltrados.length}
              porPagina={porPagina}
              onCambiarPagina={setPagina}
              onCambiarPorPagina={setPorPagina}
              cargando={cargando}
              mensajeVacio="No hay registros de asistencia para los filtros seleccionados."
              obtenerFilaClase={(r) =>
                esCumpleanosHoy(r.nino.fechaNacimiento, filtroFecha)
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50 transition-colors'
                  : ''
              }
            />
          </div>
        </div>
      </div>

      {/* ── Modales ─────────────────────────────────── */}
      <ModalCheckIn
        abierto={modalCheckIn}
        fecha={filtroFecha}
        onCerrar={() => setModalCheckIn(false)}
        onIngresado={handleCheckInConfirmado}
      />
      <ModalCheckOut
        abierto={modalCheckOut}
        onCerrar={() => { setModalCheckOut(false); setRegistroCheckOut(null); }}
        registro={registroCheckOut}
        onRetirado={handleCheckOutConfirmado}
      />
      <ModalEditarAsistencia
        abierto={modalEditar}
        onCerrar={() => { setModalEditar(false); setRegistroEditar(null); }}
        registro={registroEditar}
        onActualizado={cargarRegistros}
      />
      <ModalConfirmar
        abierto={modalConfirmarEliminar}
        onCerrar={() => { setModalConfirmarEliminar(false); setRegistroAEliminar(null); }}
        titulo="Eliminar Asistencia"
        mensaje={`¿Estás seguro de eliminar el registro de asistencia de ${registroAEliminar?.nino.nombreCompleto}? Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminar}
        tipo="danger"
      />

      <ModalBase
        abierto={modalDetalles}
        onCerrar={handleCerrarDetalles}
        titulo="Detalles de Asistencia"
        ancho="max-w-xl"
        footer={
          <button
            onClick={handleCerrarDetalles}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
          >
            Cerrar
          </button>
        }
      >
        {registroDetalles && (
          <div className="space-y-6">
            {/* Header con Info del Niño */}
            <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
                {registroDetalles.nino.nombres[0]}{registroDetalles.nino.apellidos[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-title-lg font-bold text-on-surface truncate" title={registroDetalles.nino.nombreCompleto}>
                  {registroDetalles.nino.nombreCompleto}
                </h3>
                <p className="text-body-md text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
                  {registroDetalles.nino.grupo.nombre}
                  <span className="text-outline-variant">•</span>
                  <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-lg text-label-sm">
                    {formatearFecha(registroDetalles.fecha)}
                  </span>
                </p>
              </div>
              <div className="shrink-0">
                <BadgeEstado estado={registroDetalles.estado} />
              </div>
            </div>

            {/* Grid de Entrada y Salida */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sección Entrada */}
              <div className="border border-outline-variant/60 rounded-xl p-4 space-y-3 bg-surface-container-lowest">
                <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30 text-primary">
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  <h4 className="text-label-lg font-bold uppercase tracking-wider">Entrada</h4>
                </div>
                <div className="space-y-2 text-body-md">
                  <div>
                    <span className="block text-label-sm text-on-surface-variant font-medium">Tutor de Entrega</span>
                    <span className="font-semibold text-on-surface">{registroDetalles.ingresadoPor || '—'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-label-sm text-on-surface-variant font-medium">Hora</span>
                      <span className="font-semibold text-on-surface">{registroDetalles.horaEntrada || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-label-sm text-on-surface-variant font-medium">Ficha Física</span>
                      <span className="font-mono font-semibold text-primary">{registroDetalles.codigoFichaEntrada || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-label-sm text-on-surface-variant font-medium">Acompañante en Aula</span>
                    <div className="mt-1">
                      {registroDetalles.acompananteEnAula ? (
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-tertiary bg-tertiary/10 border border-tertiary/20 px-2.5 py-0.5 rounded-lg">
                          <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                          Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-error bg-error/10 border border-error/20 px-2.5 py-0.5 rounded-lg">
                          <span className="material-symbols-outlined text-[14px] font-bold">close</span>
                          No
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección Salida */}
              <div className="border border-outline-variant/60 rounded-xl p-4 space-y-3 bg-surface-container-lowest">
                <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30 text-primary">
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <h4 className="text-label-lg font-bold uppercase tracking-wider">Salida</h4>
                </div>
                <div className="space-y-2 text-body-md">
                  <div>
                    <span className="block text-label-sm text-on-surface-variant font-medium">Tutor de Retiro</span>
                    <span className={`font-semibold ${registroDetalles.retiradoPor ? 'text-on-surface' : 'text-on-surface-variant/40 italic'}`}>
                      {registroDetalles.retiradoPor || 'Pendiente de retiro'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-label-sm text-on-surface-variant font-medium">Hora</span>
                      <span className={`font-semibold ${registroDetalles.horaSalida ? 'text-on-surface' : 'text-on-surface-variant/40 italic'}`}>
                        {registroDetalles.horaSalida || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-label-sm text-on-surface-variant font-medium">Ficha Física</span>
                      <span className={`font-mono font-semibold ${registroDetalles.codigoFichaSalida ? 'text-primary' : 'text-on-surface-variant/40 italic'}`}>
                        {registroDetalles.codigoFichaSalida || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones/Notas */}
            {registroDetalles.notas && (
              <div className="border border-outline-variant/60 rounded-xl p-4 space-y-1.5 bg-surface-container-lowest">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">notes</span>
                  <span className="text-label-sm font-medium uppercase tracking-wider">Observaciones</span>
                </div>
                <p className="text-body-md text-on-surface whitespace-pre-wrap">{registroDetalles.notas}</p>
              </div>
            )}
          </div>
        )}
      </ModalBase>
    </LayoutPrincipal>
  );
};

export default PaginaAsistenciaGeneral;
