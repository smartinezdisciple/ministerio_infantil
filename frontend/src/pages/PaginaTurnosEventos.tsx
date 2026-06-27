// PaginaTurnosEventos.tsx — Módulo de Turnos y Eventos (Spec §9.13)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import { toast } from 'sonner';
import {
  listarTurnos,
  listarEventos,
  crearEvento,
  actualizarEvento,
  type TurnoApi,
  type EventoApi,
} from '../services/servicioApi';
import { fechaLocalHoy, parsearFechaUsuario, formatearFechaConMesTexto } from '../services/fechaUtils';

const badgeTipo = (tipo: string) => {
  const estilos: Record<string, string> = {
    'Servicio Regular': 'bg-primary/15 text-primary',
    'Party Mix': 'bg-secondary-container/15 text-secondary',
    'Power Day': 'bg-tertiary/15 text-tertiary',
    'Semana Santa': 'bg-error-container text-error',
    'Navidad': 'bg-tertiary/15 text-tertiary',
    'Especial': 'bg-surface-container-high text-on-surface',
    'Otro': 'bg-surface-container-high text-on-surface-variant',
  };
  return estilos[tipo] ?? estilos['Otro'];
};

const PaginaTurnosEventos: React.FC = () => {
  const [turnos, setTurnos] = useState<TurnoApi[]>([]);
  const [eventos, setEventos] = useState<EventoApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState<'turnos' | 'eventos'>('eventos');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [modalEvento, setModalEvento] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    nombre: '', descripcion: '' as string, fecha: formatearFechaConMesTexto(fechaLocalHoy()),
    idTurno: null as number | null, tipo: 'Servicio Regular' as EventoApi['tipo'], activo: true,
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [datosTurnos, datosEventos] = await Promise.all([
        listarTurnos(),
        listarEventos(),
      ]);
      setTurnos(datosTurnos);
      setEventos(datosEventos);
    } catch (err) {
      console.error('Error cargando:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const eventosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return eventos.slice(inicio, inicio + porPagina);
  }, [eventos, pagina, porPagina]);

  const handleCrearEvento = useCallback(async () => {
    if (!nuevoEvento.nombre.trim() || !nuevoEvento.fecha) return;

    const parsedFecha = parsearFechaUsuario(nuevoEvento.fecha);
    if (!parsedFecha) {
      toast.error('Fecha inválida. Use el formato DD-MM-AA o DD-Mes-AA.');
      return;
    }

    try {
      await crearEvento({
        ...nuevoEvento,
        fecha: parsedFecha,
      });
      setModalEvento(false);
      setNuevoEvento({ nombre: '', descripcion: '', fecha: formatearFechaConMesTexto(fechaLocalHoy()), idTurno: null, tipo: 'Servicio Regular', activo: true });
      cargarDatos();
      toast.success('Evento creado correctamente.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear evento.');
    }
  }, [nuevoEvento, cargarDatos]);

  const columnasEventos: ColumnaTabla<EventoApi>[] = [
    {
      id: 'nombre',
      encabezado: 'Evento',
      ordenablePor: 'nombre',
      render: (e) => <span className="text-on-surface font-semibold">{e.nombre}</span>,
    },
    {
      id: 'fecha',
      encabezado: 'Fecha',
      ordenablePor: 'fecha',
      render: (e) => <span className="text-on-surface-variant">{new Date(e.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>,
    },
    {
      id: 'turno',
      encabezado: 'Turno',
      ordenablePor: (e) => e.turno ?? '',
      render: (e) => <span className="text-on-surface-variant">{e.turno ?? '—'}</span>,
    },
    {
      id: 'tipo',
      encabezado: 'Tipo',
      render: (e) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${badgeTipo(e.tipo)}`}>
          {e.tipo}
        </span>
      ),
    },
    {
      id: 'semana',
      encabezado: 'Semana',
      render: (e) => <span className="text-on-surface-variant">{e.numeroSemana}°</span>,
    },
  ];

  return (
    <LayoutPrincipal titulo="Turnos y Eventos">
      <div className="space-y-stack-lg max-w-[1440px]">

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 w-fit">
          <button onClick={() => { setTabActiva('eventos'); setPagina(1); }}
            className={`px-4 py-2 rounded-lg text-label-md font-label-md transition-colors ${tabActiva === 'eventos' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
            Eventos
          </button>
          <button onClick={() => setTabActiva('turnos')}
            className={`px-4 py-2 rounded-lg text-label-md font-label-md transition-colors ${tabActiva === 'turnos' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
            Turnos
          </button>
        </div>

        {tabActiva === 'turnos' ? (
          /* Tabla de turnos */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {turnos.map((t) => (
              <div key={t.idTurno} className={`bg-surface-container-lowest border rounded-xl p-gutter shadow-sm ${t.activo ? 'border-outline-variant/30' : 'border-outline-variant/10 opacity-60'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-headline-md font-headline-md text-on-surface">{t.nombre.replace('_', ' ')}</h3>
                  <span className={`w-3 h-3 rounded-full ${t.activo ? 'bg-tertiary' : 'bg-outline-variant'}`} />
                </div>
                <div className="space-y-1 text-label-sm text-on-surface-variant">
                  <p>Día: {t.diaSemana === 0 ? 'Domingo' : 'Miércoles'}</p>
                  <p>Hora: {t.horaInicio}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tabla de eventos */
          <>
            <div className="flex justify-end">
              <button onClick={() => setModalEvento(true)}
                className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[20px]">add</span>
                Nuevo Evento
              </button>
            </div>

            <TablaBase
              columnas={columnasEventos}
              filas={eventosPaginados}
              obtenerClave={(e) => e.idEvento}
              pagina={pagina}
              total={eventos.length}
              porPagina={porPagina}
              onCambiarPagina={setPagina}
              onCambiarPorPagina={setPorPagina}
              cargando={cargando}
              mensajeVacio="No hay eventos registrados."
              acciones={{
                onEditar: (e) => actualizarEvento(e.idEvento, { activo: !e.activo }).then(cargarDatos),
              }}
            />
          </>
        )}

        {/* Modal crear evento */}
        {modalEvento && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setModalEvento(false); }}>
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h2 className="text-headline-md font-headline-md text-on-surface">Nuevo Evento</h2>
              <input type="text" value={nuevoEvento.nombre} onChange={(e) => setNuevoEvento(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Nombre del evento"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
              <textarea value={nuevoEvento.descripcion} onChange={(e) => setNuevoEvento(p => ({ ...p, descripcion: e.target.value }))}
                placeholder="Descripción (opcional)" rows={2}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none resize-none" />
              <input type="text" value={nuevoEvento.fecha} onChange={(e) => setNuevoEvento(p => ({ ...p, fecha: e.target.value }))}
                placeholder="DD-MM-AA o DD-Mes-AA"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
              <select value={nuevoEvento.idTurno ?? ''} onChange={(e) => setNuevoEvento(p => ({ ...p, idTurno: e.target.value ? Number(e.target.value) : null }))}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none">
                <option value="">Sin turno</option>
                {turnos.map(t => <option key={t.idTurno} value={t.idTurno}>{t.nombre.replace('_', ' ')}</option>)}
              </select>
              <select value={nuevoEvento.tipo} onChange={(e) => setNuevoEvento(p => ({ ...p, tipo: e.target.value as EventoApi['tipo'] }))}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none">
                <option value="Servicio Regular">Servicio Regular</option>
                <option value="Party Mix">Party Mix</option>
                <option value="Power Day">Power Day</option>
                <option value="Semana Santa">Semana Santa</option>
                <option value="Navidad">Navidad</option>
                <option value="Especial">Especial</option>
                <option value="Otro">Otro</option>
              </select>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button onClick={() => setModalEvento(false)}
                  className="border border-outline-variant text-on-surface-variant rounded-xl px-5 py-2.5 font-label-md hover:bg-surface-container-high transition-colors">
                  Cancelar
                </button>
                <button onClick={handleCrearEvento}
                  className="bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all">
                  Crear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaTurnosEventos;
