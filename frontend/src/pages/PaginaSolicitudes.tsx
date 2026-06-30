// PaginaSolicitudes.tsx — Página de Solicitudes de Personal (Spec §5.2)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import ModalSolicitud from '../components/ModalSolicitudes';
import { toast } from 'sonner';
import { useAuth } from '../contexts/ContextoAuth';
import {
  listarSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
  listarRoles,
  listarRedes,
  listarRequisitos,
  listarTurnos,
  listarGrupos,
  type SolicitudApi,
  type RolApi,
  type RedApi,
  type RequisitoApi,
  type TurnoApi,
  type GrupoApi,
} from '../services/servicioApi';

const COLORES_AVATAR = [
  'bg-primary-fixed-dim text-on-primary-fixed',
  'bg-secondary-fixed-dim text-on-secondary-fixed',
  'bg-surface-variant text-on-surface',
  'bg-tertiary-fixed-dim text-on-tertiary-fixed',
];

const obtenerIniciales = (nombre: string): string =>
  nombre.split(' ').slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase();

const badgeEstado = (estado: string) => {
  const estilos: Record<string, string> = {
    Pendiente: 'bg-secondary-container/15 text-secondary border border-secondary-container/20',
    Aprobado: 'bg-tertiary/15 text-tertiary border border-tertiary/20',
    Rechazado: 'bg-error-container text-error border border-error/20',
  };
  return estilos[estado] ?? 'bg-surface-container-high text-on-surface-variant';
};

const normalizarNombre = (n: string) => {
  return n.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join('.');
};

// ══════════════════════════════════════════════════════════════════
// Página principal
// ══════════════════════════════════════════════════════════════════

const PaginaSolicitudes: React.FC = () => {
  const { usuario } = useAuth();
  const esCoordinador = (usuario?.nivelJerarquico ?? 0) >= 4;

  const [solicitudes, setSolicitudes] = useState<SolicitudApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [solicitudEditando, setSolicitudEditando] = useState<SolicitudApi | null>(null);
  const [roles, setRoles] = useState<RolApi[]>([]);
  const [redes, setRedes] = useState<RedApi[]>([]);
  const [requisitos, setRequisitos] = useState<RequisitoApi[]>([]);
  const [turnos, setTurnos] = useState<TurnoApi[]>([]);
  const [grupos, setGrupos] = useState<GrupoApi[]>([]);

  // Estados para aprobación y rechazo directos
  const [solicitudAccion, setSolicitudAccion] = useState<SolicitudApi | null>(null);
  const [rolAprobar, setRolAprobar] = useState<number>(1);
  const [usuarioAprobar, setUsuarioAprobar] = useState('');
  const [contrasenaAprobar, setContrasenaAprobar] = useState('');
  const [grupoAprobar, setGrupoAprobar] = useState('');
  const [turnosAprobar, setTurnosAprobar] = useState<number[]>([]);
  const [notasAprobar, setNotasAprobar] = useState('');
  const [notasRechazo, setNotasRechazo] = useState('');
  const [modalConfirmarAprobar, setModalConfirmarAprobar] = useState(false);
  const [modalConfirmarRechazar, setModalConfirmarRechazar] = useState(false);
  const [mostrarContraAprobar, setMostrarContraAprobar] = useState(false);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  const handleAprobarDirecto = useCallback((s: SolicitudApi) => {
    setSolicitudAccion(s);
    setRolAprobar(s.idRolSolicitado ?? 1);
    setUsuarioAprobar(normalizarNombre(s.candidato));
    setContrasenaAprobar('');
    setGrupoAprobar('');
    setTurnosAprobar([]);
    setNotasAprobar('');
    setMostrarContraAprobar(false);
    setModalConfirmarAprobar(true);
  }, []);

  const handleRechazarDirecto = useCallback((s: SolicitudApi) => {
    setSolicitudAccion(s);
    setNotasRechazo('');
    setModalConfirmarRechazar(true);
  }, []);

  const confirmarAprobarDirecto = async () => {
    if (!solicitudAccion) return;
    setProcesandoAccion(true);
    try {
      await aprobarSolicitud(
        solicitudAccion.idSolicitud,
        notasAprobar || undefined,
        rolAprobar,
        {
          usuario: usuarioAprobar.trim(),
          contrasena: contrasenaAprobar.trim(),
          idGrupoAsignado: grupoAprobar ? Number(grupoAprobar) : undefined,
          idTurnos: turnosAprobar,
        }
      );
      toast.success('Solicitud aprobada y usuario registrado exitosamente.');
      await cargarDatos();
      setModalConfirmarAprobar(false);
      setSolicitudAccion(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al aprobar.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const confirmarRechazarDirecto = async () => {
    if (!solicitudAccion || !notasRechazo.trim()) return;
    setProcesandoAccion(true);
    try {
      await rechazarSolicitud(solicitudAccion.idSolicitud, notasRechazo.trim());
      toast.success('Solicitud rechazada.');
      await cargarDatos();
      setModalConfirmarRechazar(false);
      setSolicitudAccion(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al rechazar.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  // ── Carga de solicitudes con SWR ────────────────
  const { data: swrSolicitudes, isLoading: isLoadingSolicitudes, mutate: mutateSolicitudes } = useSWR(
    ['/solicitudes', filtroEstado],
    () => listarSolicitudes(filtroEstado || undefined),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const cargarDatos = useCallback(async () => {
    mutateSolicitudes();
  }, [mutateSolicitudes]);

  useEffect(() => {
    if (swrSolicitudes) {
      setSolicitudes(swrSolicitudes);
    }
  }, [swrSolicitudes]);

  useEffect(() => {
    if (isLoadingSolicitudes && !swrSolicitudes) {
      setCargando(true);
    } else {
      setCargando(false);
    }
  }, [isLoadingSolicitudes, swrSolicitudes]);

  // Cargar catálogos una sola vez al montar
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [datosRoles, datosRedes, datosReq, datosTurnos, datosGrupos] = await Promise.all([
          listarRoles(),
          listarRedes(),
          listarRequisitos(),
          listarTurnos(),
          listarGrupos(),
        ]);
        setRoles(datosRoles);
        setRedes(datosRedes);
        setRequisitos(datosReq);
        setTurnos(datosTurnos);
        setGrupos(datosGrupos);
      } catch (err) {
        console.error('Error cargando catálogos:', err);
      }
    };
    cargarCatalogos();
  }, []);

  const solicitudesPaginadas = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return solicitudes.slice(inicio, inicio + porPagina);
  }, [solicitudes, pagina, porPagina]);

  const handleEditar = useCallback((s: SolicitudApi) => {
    setSolicitudEditando(s);
    setModalAbierto(true);
  }, []);

  const columnas: ColumnaTabla<SolicitudApi>[] = [
    {
      id: 'candidato',
      encabezado: 'Candidato',
      ordenablePor: (s) => s.candidato,
      render: (s) => {
        const iniciales = obtenerIniciales(s.candidato);
        const idx = solicitudes.indexOf(s);
        const color = COLORES_AVATAR[idx >= 0 ? idx % COLORES_AVATAR.length : 0];
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-sm shrink-0 ${color}`}>
              {iniciales}
            </div>
            <div>
              <span className="text-on-surface font-bold">{s.candidato}</span>
              <p className="text-label-sm text-on-surface-variant font-medium">{s.rolSolicitado}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      ordenablePor: 'estado',
      render: (s) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-bold uppercase tracking-tight ${badgeEstado(s.estado)}`}>
          {s.estado}
        </span>
      ),
    },
    {
      id: 'requisitos',
      encabezado: 'Requisitos',
      render: (s) => {
        const esMentor = s.estadoLiderazgo === 'Mentor';
        const total = esMentor ? Math.max(0, s.reqTotal - 1) : s.reqTotal;
        const cumplidos = esMentor ? Math.max(0, s.reqCumplidos - 1) : s.reqCumplidos;
        return (
          <span className="text-body-sm text-on-surface-variant">
            {cumplidos}/{total} obligatorios
          </span>
        );
      },
    },
    {
      id: 'gestion',
      encabezado: 'Gestionado por',
      ordenablePor: (s) => s.gestionadoPor,
      render: (s) => <span className="text-on-surface-variant">{s.gestionadoPor}</span>,
    },
    {
      id: 'fecha',
      encabezado: 'Fecha',
      ordenablePor: 'fechaSolicitud',
      render: (s) => <span className="text-on-surface-variant">{new Date(s.fechaSolicitud).toLocaleDateString('es-ES')}</span>,
    },
  ];

  return (
    <LayoutPrincipal titulo="Solicitudes de Ingreso">
      <div className="space-y-stack-lg max-w-[1440px]">

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="relative">
            <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }}
              className="bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-10 py-2.5 font-body-sm text-on-surface focus:outline-none focus:border-primary appearance-none outline-none">
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
          </div>

          <button onClick={() => { setSolicitudEditando(null); setModalAbierto(true); }}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nueva Solicitud
          </button>
        </div>

        <TablaBase
          columnas={columnas}
          filas={solicitudesPaginadas}
          obtenerClave={(s) => s.idSolicitud}
          pagina={pagina}
          total={solicitudes.length}
          porPagina={porPagina}
          onCambiarPagina={setPagina}
          onCambiarPorPagina={setPorPagina}
          cargando={cargando}
          mensajeVacio="No hay solicitudes registradas."
          acciones={{
            onVer: handleEditar,
            onEditar: handleEditar,
            extras: [
              {
                id: 'aprobar',
                icono: 'check',
                etiqueta: 'aprobar',
                onClick: (s) => s.estado === 'Pendiente' && esCoordinador ? handleAprobarDirecto(s) : undefined,
                clases: 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800',
              },
              {
                id: 'rechazar',
                icono: 'close',
                etiqueta: 'rechazar',
                onClick: (s) => s.estado === 'Pendiente' && esCoordinador ? handleRechazarDirecto(s) : undefined,
                clases: 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800',
              },
            ],
          }}
        />

        <ModalSolicitud
          abierto={modalAbierto}
          roles={roles}
          redes={redes}
          requisitos={requisitos}
          solicitudEditar={solicitudEditando}
          onCerrar={() => { setModalAbierto(false); setSolicitudEditando(null); }}
          onRegistrado={cargarDatos}
        />

        {modalConfirmarAprobar && solicitudAccion && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto text-on-surface" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-headline-md font-headline-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                Aprobar Solicitud y Crear Usuario
              </h3>
              
              <div className="space-y-3 pt-2 text-body-md">
                {/* Info Candidato */}
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <p className="text-body-sm text-on-surface-variant">Candidato:</p>
                  <p className="text-body-md font-bold text-on-surface">{solicitudAccion.candidato}</p>
                </div>

                {/* Selector de Rol */}
                <div>
                  <label htmlFor="aprob-rol" className="block text-label-sm text-on-surface-variant mb-1">
                    Rol a Asignar <span className="text-error">*</span>
                  </label>
                  <select
                    id="aprob-rol"
                    value={rolAprobar}
                    onChange={(e) => setRolAprobar(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                  >
                    {roles.filter(r => r.activo).map(r => (
                      <option key={r.idRol} value={r.idRol}>
                        {r.nombreRol} (Nivel {r.nivelJerarquico})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nombre de Usuario */}
                <div>
                  <label htmlFor="aprob-user" className="block text-label-sm text-on-surface-variant mb-1">
                    Nombre de Usuario <span className="text-error">*</span>
                  </label>
                  <input
                    id="aprob-user"
                    type="text"
                    value={usuarioAprobar}
                    onChange={(e) => setUsuarioAprobar(e.target.value)}
                    placeholder="ej: lucas.martinez"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                  />
                  {!/^[a-zA-Z0-9._-]{3,30}$/.test(usuarioAprobar) && usuarioAprobar.length > 0 && (
                    <p className="text-[11px] text-error mt-0.5">3-30 caracteres, letras, números, puntos, guiones.</p>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label htmlFor="aprob-pass" className="block text-label-sm text-on-surface-variant mb-1">
                    Contraseña <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="aprob-pass"
                      type={mostrarContraAprobar ? 'text' : 'password'}
                      value={contrasenaAprobar}
                      onChange={(e) => setContrasenaAprobar(e.target.value)}
                      placeholder="Contraseña del nuevo usuario"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarContraAprobar(!mostrarContraAprobar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {mostrarContraAprobar ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {/* Indicador de complejidad */}
                  {contrasenaAprobar.length > 0 && (
                    <div className="mt-1.5 p-2 bg-surface-container-low rounded-lg border border-outline-variant/30 text-[11px] space-y-1">
                      <p className="font-semibold text-on-surface-variant">Requisitos de la contraseña:</p>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <span className={contrasenaAprobar.length >= 8 ? 'text-tertiary' : 'text-error'}>
                          ✓ Mínimo 8 caracteres
                        </span>
                        <span className={/[A-Z]/.test(contrasenaAprobar) ? 'text-tertiary' : 'text-error'}>
                          ✓ Una letra mayúscula
                        </span>
                        <span className={/[0-9]/.test(contrasenaAprobar) ? 'text-tertiary' : 'text-error'}>
                          ✓ Un número
                        </span>
                        <span className={/[^A-Za-z0-9]/.test(contrasenaAprobar) ? 'text-tertiary' : 'text-error'}>
                          ✓ Un carácter especial
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selector de Grupo (si aplica) */}
                {(() => {
                  const rolSel = roles.find(r => r.idRol === rolAprobar);
                  const requiereGrupo = rolSel?.nombreRol === 'Colaborador' || rolSel?.nombreRol === 'Maestro';
                  if (!requiereGrupo) return null;
                  return (
                    <div>
                      <label htmlFor="aprob-grupo" className="block text-label-sm text-on-surface-variant mb-1">
                        Grupo Asignado <span className="text-error">*</span>
                      </label>
                      <select
                        id="aprob-grupo"
                        value={grupoAprobar}
                        onChange={(e) => setGrupoAprobar(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                      >
                        <option value="">Seleccione grupo...</option>
                        {grupos.map(g => (
                          <option key={g.idGrupo} value={g.idGrupo}>
                            {g.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })()}

                {/* Selector de Turnos */}
                <div>
                  <span className="block text-label-sm text-on-surface-variant mb-1.5">
                    Turnos Asignados <span className="text-error">*</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 p-2 bg-surface-container-low border border-outline-variant rounded-lg">
                    {turnos.map(t => (
                      <label key={t.idTurno} className="flex items-center gap-2 text-body-sm cursor-pointer select-none text-on-surface">
                        <input
                          type="checkbox"
                          checked={turnosAprobar.includes(t.idTurno)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTurnosAprobar(prev => [...prev, t.idTurno]);
                            } else {
                              setTurnosAprobar(prev => prev.filter(id => id !== t.idTurno));
                            }
                          }}
                          className="rounded border-outline-variant text-primary focus:ring-primary"
                        />
                        {t.nombre}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notas de Aprobación */}
                <div>
                  <label htmlFor="aprob-notas" className="block text-label-sm text-on-surface-variant mb-1">
                    Notas de Aprobación
                  </label>
                  <textarea
                    id="aprob-notas"
                    value={notasAprobar}
                    onChange={(e) => setNotasAprobar(e.target.value)}
                    placeholder="Notas o comentarios de la resolución..."
                    rows={2}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none text-on-surface"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => {
                    setModalConfirmarAprobar(false);
                    setSolicitudAccion(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-outline/30 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarAprobarDirecto}
                  disabled={
                    procesandoAccion ||
                    !usuarioAprobar.trim() ||
                    !/^[a-zA-Z0-9._-]{3,30}$/.test(usuarioAprobar) ||
                    contrasenaAprobar.length < 8 ||
                    !/[A-Z]/.test(contrasenaAprobar) ||
                    !/[0-9]/.test(contrasenaAprobar) ||
                    !/[^A-Za-z0-9]/.test(contrasenaAprobar) ||
                    turnosAprobar.length === 0 ||
                    (() => {
                      const rolSel = roles.find(r => r.idRol === rolAprobar);
                      const requiereGrupo = rolSel?.nombreRol === 'Colaborador' || rolSel?.nombreRol === 'Maestro';
                      return requiereGrupo && !grupoAprobar;
                    })()
                  }
                  className="px-4 py-2 rounded-lg text-label-md font-medium bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50 transition-colors shadow-sm"
                >
                  {procesandoAccion ? 'Procesando...' : 'Aprobar e Ingresar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {modalConfirmarRechazar && solicitudAccion && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-headline-md font-headline-md text-error flex items-center gap-2">
                <span className="material-symbols-outlined text-error">cancel</span>
                Rechazar Solicitud
              </h3>
              
              {/* Info Candidato */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-md text-on-surface">
                <p className="text-body-sm text-on-surface-variant">Candidato:</p>
                <p className="font-bold">{solicitudAccion.candidato}</p>
              </div>

              <p className="text-body-md text-on-surface-variant">
                Por favor, ingrese el motivo del rechazo de la solicitud:
              </p>
              <textarea
                value={notasRechazo}
                onChange={(e) => setNotasRechazo(e.target.value)}
                placeholder="Escriba aquí la razón del rechazo..."
                rows={4}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-on-surface"
              />
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => {
                    setModalConfirmarRechazar(false);
                    setSolicitudAccion(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-outline/30 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarRechazarDirecto}
                  disabled={procesandoAccion || !notasRechazo.trim()}
                  className="px-4 py-2 rounded-lg text-label-md font-medium bg-error text-on-error hover:bg-error-container hover:text-on-error-container disabled:opacity-50 transition-colors shadow-sm"
                >
                  {procesandoAccion ? 'Procesando...' : 'Confirmar Rechazo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaSolicitudes;
