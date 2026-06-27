// PaginaSuspensiones.tsx — Módulo de Control de Suspensiones (Spec §5.1)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import ModalConfirmar from '../components/ModalConfirmar';
import { toast } from 'sonner';
import { useAuth } from '../contexts/ContextoAuth';
import {
  listarPersonalHoy,
  listarSuspensiones,
  suspenderPersonal,
  levantarSuspension,
  type PersonalAsistenciaApi,
  type SuspensionApi,
} from '../services/servicioApi';
import { fechaLocalHoy, parsearFechaUsuario, formatearFechaConMesTexto } from '../services/fechaUtils';

const PaginaSuspensiones: React.FC = () => {
  const { usuario } = useAuth();
  const esCoordinador = usuario?.nivelJerarquico === 4;

  const [personal, setPersonal] = useState<PersonalAsistenciaApi[]>([]);
  const [personalSeleccionado, setPersonalSeleccionado] = useState<PersonalAsistenciaApi | null>(null);
  const [suspensiones, setSuspensiones] = useState<SuspensionApi[]>([]);
  const [cargandoPersonal, setCargandoPersonal] = useState(true);
  const [cargandoSuspensiones, setCargandoSuspensiones] = useState(false);
  const [modalSuspender, setModalSuspender] = useState(false);
  const [filtroPersonal, setFiltroPersonal] = useState('');
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [modalConfirmarLevantar, setModalConfirmarLevantar] = useState(false);
  const [suspensionALevantar, setSuspensionALevantar] = useState<SuspensionApi | null>(null);

  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const [nuevaSuspension, setNuevaSuspension] = useState({
    fechaInicio: formatearFechaConMesTexto(fechaLocalHoy()),
    fechaFin: '',
    categoriaMotivo: 'Otro',
    motivo: '',
  });

  const cargarPersonal = useCallback(async () => {
    setCargandoPersonal(true);
    try {
      const datos = await listarPersonalHoy();
      // Ordenar alfabéticamente
      const ordenado = datos.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
      setPersonal(ordenado);
    } catch (err) {
      console.error('Error cargando personal:', err);
    } finally {
      setCargandoPersonal(false);
    }
  }, []);

  const cargarSuspensiones = useCallback(async (idPers: number) => {
    setCargandoSuspensiones(true);
    try {
      const datos = await listarSuspensiones(idPers);
      setSuspensiones(datos);
    } catch (err) {
      console.error('Error cargando suspensiones:', err);
    } finally {
      setCargandoSuspensiones(false);
    }
  }, []);

  useEffect(() => {
    cargarPersonal();
  }, [cargarPersonal]);

  const personalFiltrado = useMemo(() => {
    return personal.filter((p) =>
      p.nombreCompleto.toLowerCase().includes(filtroPersonal.toLowerCase())
    );
  }, [personal, filtroPersonal]);

  const handleSeleccionarPersonal = useCallback((p: PersonalAsistenciaApi) => {
    setPersonalSeleccionado(p);
    setPagina(1);
    cargarSuspensiones(p.idPersona);
  }, [cargarSuspensiones]);

  const handleSuspender = useCallback(async () => {
    if (!personalSeleccionado) return;
    if (!nuevaSuspension.motivo.trim()) {
      toast.error('Por favor ingrese el motivo de la suspensión.');
      return;
    }

    const parsedInicio = parsearFechaUsuario(nuevaSuspension.fechaInicio);
    if (!parsedInicio) {
      toast.error('Fecha de inicio inválida. Use el formato DD-MM-AA o DD-Mes-AA.');
      return;
    }

    let parsedFin: string | null = null;
    if (nuevaSuspension.fechaFin.trim()) {
      parsedFin = parsearFechaUsuario(nuevaSuspension.fechaFin);
      if (!parsedFin) {
        toast.error('Fecha de fin inválida. Use el formato DD-MM-AA o DD-Mes-AA.');
        return;
      }
    }

    setCargandoAccion(true);
    try {
      await suspenderPersonal(personalSeleccionado.idPersona, {
        fechaInicio: parsedInicio,
        fechaFin: parsedFin,
        categoriaMotivo: nuevaSuspension.categoriaMotivo,
        motivo: nuevaSuspension.motivo.trim(),
      });
      setModalSuspender(false);
      setNuevaSuspension({
        fechaInicio: formatearFechaConMesTexto(fechaLocalHoy()),
        fechaFin: '',
        categoriaMotivo: 'Otro',
        motivo: '',
      });
      cargarSuspensiones(personalSeleccionado.idPersona);
      toast.success('Suspensión registrada correctamente.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar suspensión.');
    } finally {
      setCargandoAccion(false);
    }
  }, [personalSeleccionado, nuevaSuspension, cargarSuspensiones]);

  const handleLevantar = useCallback((s: SuspensionApi) => {
    setSuspensionALevantar(s);
    setModalConfirmarLevantar(true);
  }, []);

  const confirmarLevantar = useCallback(async () => {
    if (!personalSeleccionado || !suspensionALevantar) return;
    try {
      await levantarSuspension(personalSeleccionado.idPersona, suspensionALevantar.idSuspension);
      toast.success('Suspensión levantada correctamente.');
      cargarSuspensiones(personalSeleccionado.idPersona);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al levantar suspensión.');
    } finally {
      setSuspensionALevantar(null);
    }
  }, [personalSeleccionado, suspensionALevantar, cargarSuspensiones]);

  const suspensionesPaginadas = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return suspensiones.slice(inicio, inicio + porPagina);
  }, [suspensiones, pagina, porPagina]);

  const tieneSuspensionActiva = useMemo(() => {
    const hoy = fechaLocalHoy();
    return suspensiones.some((s) => {
      if (!s.activo) return false;
      const inicioOk = s.fechaInicio <= hoy;
      const finOk = !s.fechaFin || s.fechaFin >= hoy;
      return inicioOk && finOk;
    });
  }, [suspensiones]);

  const columnas: ColumnaTabla<SuspensionApi>[] = [
    {
      id: 'motivo',
      encabezado: 'Motivo / Categoría',
      render: (s) => (
        <div>
          <span className="text-on-surface font-semibold block">{s.motivo}</span>
          <span className="text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-medium">
            {s.categoriaMotivo}
          </span>
        </div>
      ),
    },
    {
      id: 'fechas',
      encabezado: 'Rango de Fecha',
      render: (s) => (
        <span className="text-body-sm">
          {formatearFechaConMesTexto(s.fechaInicio)} al {s.fechaFin ? formatearFechaConMesTexto(s.fechaFin) : 'Indefinido'}
        </span>
      ),
    },
    {
      id: 'registrado',
      encabezado: 'Registrado Por',
      render: (s) => (
        <span className="text-body-sm text-on-surface-variant">
          {s.registradoPor || 'Coordinador'}
        </span>
      ),
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      render: (s) => {
        const hoy = fechaLocalHoy();
        const activa = s.activo && s.fechaInicio <= hoy && (!s.fechaFin || s.fechaFin >= hoy);
        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
            activa ? 'bg-error/15 text-error animate-pulse' :
            s.activo ? 'bg-secondary/15 text-secondary' :
            'bg-surface-container-high text-on-surface-variant'
          }`}>
            {activa ? 'Activa' : s.activo ? 'Programada' : 'Levantada'}
          </span>
        );
      },
    },
  ];

  return (
    <LayoutPrincipal titulo="Control de Suspensiones">
      <div className="space-y-stack-lg max-w-[1440px]">
        
        {/* Layout de dos columnas: selector personal a la izquierda, detalles a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* ── Columna izquierda: Lista de personal ─────── */}
          <div className="lg:col-span-4 bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30 flex flex-col h-[600px]">
            <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2 mb-stack-md border-b border-outline-variant/20 pb-2 shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
              Seleccionar Personal
            </h3>
            
            {/* Buscador de personal */}
            <div className="relative mb-stack-md shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar personal..."
                value={filtroPersonal}
                onChange={(e) => setFiltroPersonal(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-9 pr-3 py-2 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Listado scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1">
              {cargandoPersonal ? (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-12 bg-surface-container-high rounded-lg" />
                  ))}
                </div>
              ) : personalFiltrado.length > 0 ? (
                personalFiltrado.map((p) => {
                  const seleccionado = personalSeleccionado?.idPersona === p.idPersona;
                  return (
                    <button
                      key={p.idPersona}
                      onClick={() => handleSeleccionarPersonal(p)}
                      className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all border ${
                        seleccionado
                          ? 'bg-primary/10 border-primary text-primary font-semibold'
                          : 'border-transparent hover:bg-surface-container-low/50 text-on-surface'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-body-sm truncate">{p.nombreCompleto}</p>
                        <p className="text-label-sm text-on-surface-variant">{p.rol}</p>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                        chevron_right
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-body-sm text-on-surface-variant text-center py-8">
                  No se encontraron miembros de personal.
                </p>
              )}
            </div>
          </div>

          {/* ── Columna derecha: Detalles y suspensiones ─── */}
          <div className="lg:col-span-8 space-y-stack-lg">
            {personalSeleccionado ? (
              <div className="space-y-stack-lg">
                
                {/* Cabecera del seleccionado */}
                <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-headline-md font-bold text-on-surface">
                      {personalSeleccionado.nombreCompleto}
                    </h2>
                    <p className="text-body-sm text-on-surface-variant">
                      Rol: {personalSeleccionado.rol} · Ingresó: {personalSeleccionado.fechaIngreso}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    {esCoordinador && (
                      <button
                        onClick={() => setModalSuspender(true)}
                        className="flex items-center justify-center gap-2 bg-error text-on-error px-4 py-2.5 rounded-xl font-label-md shadow-md hover:bg-error/95 active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
                      >
                        <span className="material-symbols-outlined text-[20px]">gavel</span>
                        Registrar Suspensión
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner de suspensión activa */}
                {tieneSuspensionActiva && (
                  <div className="flex gap-3 bg-error/10 border border-error/20 text-error rounded-xl p-4 shadow-sm items-center">
                    <span className="material-symbols-outlined text-[24px]">warning</span>
                    <p className="text-body-sm font-semibold">
                      Este miembro del personal se encuentra actualmente SUSPENDIDO de sus labores de servicio.
                    </p>
                  </div>
                )}

                {/* Tabla de historial */}
                <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30">
                  <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2 mb-stack-md border-b border-outline-variant/20 pb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                    Historial de Suspensiones
                  </h3>

                  <TablaBase
                    columnas={columnas}
                    filas={suspensionesPaginadas}
                    obtenerClave={(s) => s.idSuspension}
                    pagina={pagina}
                    total={suspensiones.length}
                    porPagina={porPagina}
                    onCambiarPagina={setPagina}
                    onCambiarPorPagina={setPorPagina}
                    cargando={cargandoSuspensiones}
                    mensajeVacio="No hay suspensiones registradas para este personal."
                    acciones={
                      esCoordinador
                        ? {
                            onEliminar: handleLevantar, // Mapeamos onEliminar como Levantar suspensión
                          }
                        : undefined
                    }
                  />
                </div>

              </div>
            ) : (
              <div className="bg-surface-container-lowest p-12 rounded-xl shadow-sm border border-outline-variant/30 text-center text-on-surface-variant flex flex-col items-center justify-center h-[350px] gap-3">
                <span className="material-symbols-outlined text-[56px] text-on-surface-variant/40">
                  gavel
                </span>
                <p className="text-body-md font-medium">
                  Seleccione un miembro del personal de la lista para gestionar sus suspensiones de servicio.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ── Modal para Registrar Suspensión ──────────── */}
        {modalSuspender && personalSeleccionado && (
          <div
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalSuspender(false);
            }}
          >
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <h2 className="text-headline-md font-bold text-error flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[28px]">gavel</span>
                  Suspender Personal
                </h2>
                <button
                  onClick={() => setModalSuspender(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg text-body-sm text-on-surface">
                Personal a suspender: <strong className="font-semibold">{personalSeleccionado.nombreCompleto}</strong>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-sm font-medium text-on-surface-variant mb-1">
                      Fecha Inicio *
                    </label>
                    <input
                      type="text"
                      value={nuevaSuspension.fechaInicio}
                      onChange={(e) =>
                        setNuevaSuspension((p) => ({ ...p, fechaInicio: e.target.value }))
                      }
                      placeholder="DD-MM-AA o DD-Mes-AA"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-medium text-on-surface-variant mb-1">
                      Fecha Fin (Opcional)
                    </label>
                    <input
                      type="text"
                      value={nuevaSuspension.fechaFin}
                      onChange={(e) =>
                        setNuevaSuspension((p) => ({ ...p, fechaFin: e.target.value }))
                      }
                      placeholder="DD-MM-AA o DD-Mes-AA"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-1">
                    Categoría del Motivo *
                  </label>
                  <select
                    value={nuevaSuspension.categoriaMotivo}
                    onChange={(e) =>
                      setNuevaSuspension((p) => ({ ...p, categoriaMotivo: e.target.value }))
                    }
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="Conducta">Conducta</option>
                    <option value="Enfermedad">Enfermedad</option>
                    <option value="Personal">Personal</option>
                    <option value="Disciplina">Disciplina</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-1">
                    Explicación / Detalles *
                  </label>
                  <textarea
                    rows={4}
                    value={nuevaSuspension.motivo}
                    onChange={(e) =>
                      setNuevaSuspension((p) => ({ ...p, motivo: e.target.value }))
                    }
                    placeholder="Detalles sobre por qué se realiza la suspensión de servicio..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  onClick={() => setModalSuspender(false)}
                  disabled={cargandoAccion}
                  className="border border-outline-variant text-on-surface-variant rounded-xl px-5 py-2.5 font-label-md hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSuspender}
                  disabled={cargandoAccion || !nuevaSuspension.motivo.trim() || !nuevaSuspension.fechaInicio}
                  className="bg-error text-on-error rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-error/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                >
                  {cargandoAccion && (
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  )}
                  {cargandoAccion ? 'Registrando...' : 'Suspender'}
                </button>
              </div>
            </div>
          </div>
        )}
        <ModalConfirmar
          abierto={modalConfirmarLevantar}
          onCerrar={() => { setModalConfirmarLevantar(false); setSuspensionALevantar(null); }}
          titulo="Levantar Suspensión"
          mensaje="¿Está seguro de que desea levantar esta suspensión de servicio?"
          onConfirmar={confirmarLevantar}
          tipo="danger"
        />
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaSuspensiones;
