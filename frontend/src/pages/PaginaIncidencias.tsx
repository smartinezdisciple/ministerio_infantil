// PaginaIncidencias.tsx — Módulo de Incidencias por turno (Staff y Coordinador General)
import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import ModalConfirmar from '../components/ModalConfirmar';
import { useAuth } from '../contexts/ContextoAuth';
import {
  listarIncidencias,
  crearIncidencia,
  eliminarIncidencia,
  listarTurnos,
  obtenerPerfilPersonal,
  TIPOS_INCIDENCIA,
} from '../services/servicioApi';
import type { Incidencia, TipoIncidencia } from '../services/tipos';
import { formatearTurno } from '../services/turnoUtils';

// Colores de badge según el tipo de incidencia
const COLORES_TIPO: Record<TipoIncidencia, string> = {
  Ninos:           'bg-sky-100 text-sky-700 border-sky-200',
  Maestros:        'bg-violet-100 text-violet-700 border-violet-200',
  Infraestructura: 'bg-amber-100 text-amber-700 border-amber-200',
  Observaciones:   'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const ETIQUETA_TIPO: Record<TipoIncidencia, string> = {
  Ninos:           'Con Niños',
  Maestros:        'Maestros',
  Infraestructura: 'Infraestructura',
  Observaciones:   'Observaciones',
};

// Formatea una fecha YYYY-MM-DD a DD/MM/YYYY
const formatearFecha = (fechaStr: string) => {
  if (!fechaStr) return '';
  const limpia = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
  const [yyyy, mm, dd] = limpia.split('-');
  return `${dd}/${mm}/${yyyy}`;
};

interface TurnoSimple {
  idTurno: number;
  nombre: string;
}

const PaginaIncidencias: React.FC = () => {
  const { usuario } = useAuth();
  const esCoordinador = (usuario?.nivelJerarquico ?? 0) >= 4;

  // ── Turnos (Staff: solo los suyos; Coordinador: todos) ─────────
  const [turnos, setTurnos] = useState<TurnoSimple[]>([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('');

  // ── Formulario ─────────────────────────────────────────────────
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoIncidencia>('Ninos');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);

  // ── Listado ────────────────────────────────────────────────────
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [incidenciaAEliminar, setIncidenciaAEliminar] = useState<Incidencia | null>(null);
  const [modalEliminar, setModalEliminar] = useState(false);

  const { data: swrIncidencias, isLoading, mutate } = useSWR(
    ['/incidencias', turnoSeleccionado],
    () => listarIncidencias(turnoSeleccionado || undefined),
    { revalidateOnFocus: true, dedupingInterval: 2000 }
  );

  useEffect(() => {
    setPagina(1);
  }, [turnoSeleccionado]);

  // Cargar turnos según el rol (mismo patrón que Asistencia General)
  useEffect(() => {
    const cargarTurnos = async () => {
      setCargandoTurnos(true);
      try {
        if (usuario && usuario.nivelJerarquico < 4) {
          const res = await obtenerPerfilPersonal(usuario.idPersona);
          const turnosPerfil: TurnoSimple[] = (res.turnos || []).map((t) => ({
            idTurno: t.idTurno,
            nombre: t.turno,
          }));
          setTurnos(turnosPerfil);
          setTurnoSeleccionado(turnosPerfil.length > 0 ? String(turnosPerfil[0].idTurno) : '');
        } else {
          const datos = await listarTurnos();
          setTurnos(datos.filter((t) => t.activo).map((t) => ({ idTurno: t.idTurno, nombre: t.nombre })));
          setTurnoSeleccionado('');
        }
      } catch (err) {
        console.error('Error cargando turnos:', err);
        toast.error('No se pudieron cargar los turnos.');
      } finally {
        setCargandoTurnos(false);
      }
    };
    cargarTurnos();
  }, [usuario]);

  // ── Registro de incidencia ─────────────────────────────────────
  const turnoIdFormulario = Number(turnoSeleccionado);
  const puedeRegistrar = !esCoordinador || turnoSeleccionado !== '';

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeRegistrar) return;
    if (!descripcion.trim()) {
      toast.error('Debe escribir una incidencia.');
      return;
    }
    setEnviando(true);
    try {
      await crearIncidencia({
        idTurno: turnoIdFormulario,
        tipo: tipoSeleccionado,
        descripcion: descripcion.trim(),
      });
      toast.success('Incidencia registrada.');
      setDescripcion('');
      await mutate();
    } catch (err: any) {
      console.error('Error registrando incidencia:', err);
      toast.error(err.message || 'Error al registrar la incidencia.');
    } finally {
      setEnviando(false);
    }
  };

  // ── Eliminación (Coord. cualquier, Staff solo la propia) ───────
  const puedeEliminar = (r: Incidencia) =>
    esCoordinador || r.idPersonal === usuario?.idPersona;

  const handlePedirEliminar = (r: Incidencia) => {
    setIncidenciaAEliminar(r);
    setModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!incidenciaAEliminar) return;
    try {
      await eliminarIncidencia(incidenciaAEliminar.idIncidencia);
      toast.success('Incidencia eliminada.');
      await mutate();
    } catch (err: any) {
      console.error('Error eliminando incidencia:', err);
      toast.error(err.message || 'Error al eliminar la incidencia.');
    } finally {
      setIncidenciaAEliminar(null);
    }
  };

  // ── Columnas de la tabla ───────────────────────────────────────
  const columnas = useMemo<ColumnaTabla<Incidencia>[]>(() => [
    {
      id: 'fecha',
      encabezado: 'Fecha',
      ancho: 'w-[95px]',
      ordenablePor: (r) => r.fecha,
      render: (r) => <span className="text-[12px] text-on-surface">{formatearFecha(r.fecha)}</span>,
    },
    {
      id: 'turno',
      encabezado: 'Turno',
      ancho: 'w-[140px]',
      ordenablePor: (r) => r.nombreTurno,
      render: (r) => <span className="text-[12px] font-medium text-on-surface">{formatearTurno(r.nombreTurno)}</span>,
    },
    {
      id: 'tipo',
      encabezado: 'Tipo',
      ancho: 'w-[150px]',
      ordenablePor: (r) => r.tipo,
      render: (r) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${COLORES_TIPO[r.tipo]}`}>
          {ETIQUETA_TIPO[r.tipo]}
        </span>
      ),
    },
    {
      id: 'descripcion',
      encabezado: 'Incidencia',
      ordenablePor: (r) => r.descripcion,
      render: (r) => (
        <span className="text-[12px] text-on-surface line-clamp-2 max-w-[420px] whitespace-normal" title={r.descripcion}>
          {r.descripcion}
        </span>
      ),
    },
    {
      id: 'reportadoPor',
      encabezado: 'Reportado por',
      ancho: 'w-[170px]',
      ordenablePor: (r) => r.nombrePersonal,
      render: (r) => <span className="text-[12px] text-on-surface-variant">{r.nombrePersonal}</span>,
    },
    {
      id: 'acciones',
      encabezado: 'Acciones',
      ancho: 'w-[90px]',
      alineaDerecha: true,
      render: (r) =>
        puedeEliminar(r) ? (
          <button
            onClick={() => handlePedirEliminar(r)}
            className="w-[28px] h-[28px] rounded-lg border-[3px] border-red-500 bg-red-50 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Eliminar incidencia"
            title="Eliminar"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>delete</span>
          </button>
        ) : (
          <span className="text-[11px] text-on-surface-variant/50 italic">—</span>
        ),
    },
  ], [esCoordinador, usuario]);

  return (
    <LayoutPrincipal titulo="Incidencias">
      <div className="space-y-stack-lg max-w-[1440px]">

        {/* ── Formulario de registro ─────────────────────── */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">report</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Registrar Incidencia</h2>
          </div>

          <form onSubmit={handleRegistrar} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Turno */}
              <div className="flex flex-col">
                <label htmlFor="inc-turno" className="text-label-sm font-label-sm text-on-surface mb-1.5">
                  Turno <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="inc-turno"
                    value={turnoSeleccionado}
                    disabled={!!(usuario && usuario.nivelJerarquico < 4 && turnos.length <= 1) || cargandoTurnos}
                    onChange={(e) => setTurnoSeleccionado(e.target.value)}
                    className={`w-full bg-surface-container-low border border-outline-variant rounded-xl pl-3 pr-8 py-2 text-[13px] h-[38px] focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none ${
                      !!(usuario && usuario.nivelJerarquico < 4 && turnos.length <= 1)
                        ? 'text-on-surface-variant/80 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {cargandoTurnos ? (
                      <option>Cargando...</option>
                    ) : (
                      <>
                        {esCoordinador && <option value="">Todos los Turnos (solo vista)</option>}
                        {turnos.map((t) => (
                          <option key={t.idTurno} value={t.idTurno}>{formatearTurno(t.nombre)}</option>
                        ))}
                      </>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
                </div>
                {!esCoordinador && turnos.length === 0 && (
                  <p className="text-[11px] text-error mt-1">No tiene turnos asignados.</p>
                )}
              </div>

              {/* Tipo */}
              <div className="flex flex-col">
                <label htmlFor="inc-tipo" className="text-label-sm font-label-sm text-on-surface mb-1.5">
                  Tipo <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="inc-tipo"
                    value={tipoSeleccionado}
                    onChange={(e) => setTipoSeleccionado(e.target.value as TipoIncidencia)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-3 pr-8 py-2 text-[13px] h-[38px] focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                  >
                    {TIPOS_INCIDENCIA.map((t) => (
                      <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>

              {/* Fecha (informativa) */}
              <div className="flex flex-col">
                <span className="text-label-sm font-label-sm text-on-surface mb-1.5">Fecha</span>
                <div className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-[13px] h-[38px] flex items-center text-on-surface-variant">
                  {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Único campo de texto para la(s) incidencia(s) */}
            <div className="flex flex-col">
              <label htmlFor="inc-descripcion" className="text-label-sm font-label-sm text-on-surface mb-1.5">
                Incidencia <span className="text-error">*</span>
              </label>
              <textarea
                id="inc-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={!puedeRegistrar || enviando}
                placeholder="Escriba una o varias incidencias para este turno..."
                rows={4}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-[13px] focus:ring-2 focus:ring-primary focus:outline-none transition-all focus:border-primary resize-y disabled:opacity-60"
              />
              {!puedeRegistrar && (
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Selecciona un turno específico para poder registrar una incidencia.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!puedeRegistrar || enviando}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-label-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
              {enviando ? 'Registrando...' : 'Registrar Incidencia'}
            </button>
          </form>
        </div>

        {/* ── Listado de incidencias ─────────────────────── */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-headline-md text-headline-md text-on-background">Listado de Incidencias</h3>
            <span className="text-body-sm text-on-surface-variant">
              Mostrando total en {turnoSeleccionado === '' ? 'todos los turnos' : 'el turno seleccionado'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <TablaBase
              columnas={columnas}
              filas={swrIncidencias ?? []}
              obtenerClave={(r) => r.idIncidencia}
              pagina={pagina}
              total={(swrIncidencias ?? []).length}
              porPagina={porPagina}
              onCambiarPagina={setPagina}
              onCambiarPorPagina={setPorPagina}
              cargando={!!isLoading}
              mensajeVacio="No hay incidencias registradas para los filtros seleccionados."
              obtenerFilaClase={() => ''}
            />
          </div>
        </div>
      </div>

      {/* ── Modal de confirmación para eliminar ─────────── */}
      <ModalConfirmar
        abierto={modalEliminar}
        onCerrar={() => { setModalEliminar(false); setIncidenciaAEliminar(null); }}
        titulo="Eliminar Incidencia"
        mensaje="¿Estás seguro de eliminar esta incidencia? Esta acción no se puede deshacer."
        onConfirmar={confirmarEliminar}
        tipo="danger"
      />
    </LayoutPrincipal>
  );
};

export default PaginaIncidencias;