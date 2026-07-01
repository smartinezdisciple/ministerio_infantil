import React, { useState, useCallback } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import { toast } from 'sonner';
import useSWR from 'swr';
import {
  listarPersonalCompleto,
  listarRoles,
  listarTurnos,
  listarGrupos,
  configurarAccesoPersonal,
  type UsuarioSistemaApi,
  type RolApi,
  type TurnoApi,
  type GrupoApi,
} from '../services/servicioApi';
interface FormAcceso {
  usuario: string;
  contrasena: string;
  idRol: number | null;
  idTurnos: number[];
  idGrupoAsignado: number | null;
}

const REGEX_USUARIO = /^[a-zA-Z0-9._-]{3,30}$/;
const REGEX_CONTRASENA = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function validarFormulario(form: FormAcceso): string | null {
  if (!form.usuario || !REGEX_USUARIO.test(form.usuario)) {
    return 'El usuario debe tener 3-30 caracteres alfanuméricos, puntos, guiones o guiones bajos.';
  }
  if (!form.contrasena || !REGEX_CONTRASENA.test(form.contrasena)) {
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.';
  }
  if (form.idRol === null || form.idRol === undefined) {
    return 'Debe seleccionar un rol.';
  }
  return null;
}

const PaginaUsuarios: React.FC = () => {
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [personaSeleccionada, setPersonaSeleccionada] = useState<UsuarioSistemaApi | null>(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [form, setForm] = useState<FormAcceso>({
    usuario: '',
    contrasena: '',
    idRol: null,
    idTurnos: [],
    idGrupoAsignado: null,
  });

  const [roles, setRoles] = useState<RolApi[]>([]);
  const [turnos, setTurnos] = useState<TurnoApi[]>([]);
  const [grupos, setGrupos] = useState<GrupoApi[]>([]);
  const [cargandoOpciones, setCargandoOpciones] = useState(false);

  const { data: usuarios, isLoading, mutate } = useSWR(
    'listarPersonalCompleto',
    () => listarPersonalCompleto(),
    { revalidateOnFocus: false },
  );

  const abrirModal = useCallback(async (persona: UsuarioSistemaApi) => {
    setPersonaSeleccionada(persona);
    setForm({
      usuario: persona.usuario || '',
      contrasena: '',
      idRol: persona.idRol || null,
      idTurnos: persona.turnos?.map(t => t.idTurno) || [],
      idGrupoAsignado: persona.grupos?.[0]?.idGrupo ?? null,
    });
    setMostrarContrasena(false);
    setModalAbierto(true);

    setCargandoOpciones(true);
    try {
      const [rolesData, turnosData, gruposData] = await Promise.all([
        listarRoles(),
        listarTurnos(),
        listarGrupos(),
      ]);
      setRoles(rolesData);
      setTurnos(turnosData);
      setGrupos(gruposData);
    } catch {
      toast.error('Error al cargar opciones del formulario.');
    } finally {
      setCargandoOpciones(false);
    }
  }, []);

  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    setPersonaSeleccionada(null);
  }, []);

  const handleToggleTurno = useCallback((idTurno: number) => {
    setForm(prev => {
      const yaExiste = prev.idTurnos.includes(idTurno);
      return {
        ...prev,
        idTurnos: yaExiste
          ? prev.idTurnos.filter(t => t !== idTurno)
          : [...prev.idTurnos, idTurno],
      };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!personaSeleccionada) return;

    const error = validarFormulario(form);
    if (error) {
      toast.error(error);
      return;
    }

    setCargandoAccion(true);
    try {
      await configurarAccesoPersonal(personaSeleccionada.idPersona, {
        usuario: form.usuario,
        contrasena: form.contrasena,
        idRol: form.idRol!,
        idTurnos: form.idTurnos.length > 0 ? form.idTurnos : undefined,
        idGrupoAsignado: form.idGrupoAsignado,
      });
      toast.success('Acceso configurado correctamente.');
      cerrarModal();
      mutate();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Error al configurar acceso.');
    } finally {
      setCargandoAccion(false);
    }
  }, [personaSeleccionada, form, cerrarModal, mutate]);

  const usuariosPaginados = React.useMemo(() => {
    if (!usuarios) return [];
    const inicio = (pagina - 1) * porPagina;
    return usuarios.slice(inicio, inicio + porPagina);
  }, [usuarios, pagina, porPagina]);

  const puedeConfigurar = useCallback((u: UsuarioSistemaApi) => {
    return u.credencialesPendientes || u.nivelJerarquico >= 4;
  }, []);

  const columnas: ColumnaTabla<UsuarioSistemaApi>[] = [
    {
      id: 'nombreCompleto',
      encabezado: 'Nombre Completo',
      ordenablePor: 'nombreCompleto',
      render: (u) => (
        <span className="text-on-surface font-semibold">{u.nombreCompleto}</span>
      ),
    },
    {
      id: 'usuario',
      encabezado: 'Usuario',
      ordenablePor: 'usuario',
      render: (u) => (
        <span className="font-mono text-body-sm">
          {u.usuario || <span className="text-on-surface-variant/40 italic">Sin usuario</span>}
        </span>
      ),
    },
    {
      id: 'rol',
      encabezado: 'Rol',
      ordenablePor: 'rol',
      render: (u) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-label-sm">
            {u.nivelJerarquico}
          </span>
          <span>{u.rol}</span>
        </div>
      ),
    },
    {
      id: 'activo',
      encabezado: 'Activo',
      render: (u) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
          u.activo
            ? 'bg-tertiary/15 text-tertiary'
            : 'bg-surface-container-high text-on-surface-variant'
        }`}>
          {u.activo ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      id: 'credencialesPendientes',
      encabezado: 'Credenciales',
      render: (u) => (
        u.credencialesPendientes ? (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-yellow-100 text-yellow-800">
            Temp
          </span>
        ) : null
      ),
    },
    {
      id: 'turnos',
      encabezado: 'Turnos',
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.turnos && u.turnos.length > 0
            ? u.turnos.map(t => (
                <span key={t.idTurno} className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-[11px] font-medium">
                  {t.turno}
                </span>
              ))
            : <span className="text-on-surface-variant/40 italic text-label-sm">Ninguno</span>}
        </div>
      ),
    },
    {
      id: 'grupos',
      encabezado: 'Grupos',
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.grupos && u.grupos.length > 0
            ? u.grupos.map(g => (
                <span key={g.idGrupo} className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-[11px] font-medium">
                  {g.grupo}
                </span>
              ))
            : <span className="text-on-surface-variant/40 italic text-label-sm">Ninguno</span>}
        </div>
      ),
    },
    {
      id: 'fechaIngreso',
      encabezado: 'Ingreso',
      ordenablePor: 'fechaIngreso',
      render: (u) => (
        <span className="text-body-sm text-on-surface-variant">{u.fechaIngreso}</span>
      ),
    },
    {
      id: 'acciones',
      encabezado: '',
      alineaDerecha: true,
      render: (u) => (
        <div className="flex flex-wrap items-center justify-start gap-1 ml-auto">
          {puedeConfigurar(u) && (
            <div className="relative group inline-block">
              <button
                onClick={() => abrirModal(u)}
                className="w-[28px] h-[28px] rounded-lg border-[3px] border-amber-500 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:border-amber-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Configurar Acceso"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>lock</span>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                configurar acceso
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <LayoutPrincipal titulo="Usuarios del Sistema">
      <div className="space-y-stack-lg max-w-[1440px]">
        <TablaBase
          columnas={columnas}
          filas={usuariosPaginados}
          obtenerClave={(u) => u.idPersona}
          pagina={pagina}
          total={usuarios?.length ?? 0}
          porPagina={porPagina}
          onCambiarPagina={setPagina}
          onCambiarPorPagina={setPorPagina}
          cargando={isLoading}
          mensajeVacio="No hay personal registrado en el sistema."
        />

        {modalAbierto && personaSeleccionada && (
          <div
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
          >
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[28px]">lock</span>
                  Configurar Acceso
                </h2>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high cursor-pointer"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <p className="text-body-sm text-on-surface-variant">
                Configurando acceso para: <strong className="text-on-surface">{personaSeleccionada.nombreCompleto}</strong>
              </p>

              {cargandoOpciones ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-1">Usuario</label>
                    <input
                      type="text"
                      value={form.usuario}
                      onChange={(e) => setForm(p => ({ ...p, usuario: e.target.value }))}
                      placeholder="ej: juan.perez"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none placeholder:text-on-surface-variant/40"
                      maxLength={30}
                    />
                  </div>

                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-1">Contraseña</label>
                    <div className="relative">
                      <input
                        type={mostrarContrasena ? 'text' : 'password'}
                        value={form.contrasena}
                        onChange={(e) => setForm(p => ({ ...p, contrasena: e.target.value }))}
                        placeholder="Mín. 8 caracteres, mayúscula, número, especial"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-11 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none placeholder:text-on-surface-variant/40"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarContrasena(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                        tabIndex={-1}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {mostrarContrasena ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-1">Rol</label>
                    <select
                      value={form.idRol ?? ''}
                      onChange={(e) => setForm(p => ({ ...p, idRol: e.target.value ? Number(e.target.value) : null }))}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                    >
                      <option value="">Seleccione un rol...</option>
                      {roles.map(r => (
                        <option key={r.idRol} value={r.idRol}>
                          {r.nombreRol} (Nivel {r.nivelJerarquico})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-1">Turnos</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-surface-container-low border border-outline-variant rounded-lg p-3">
                      {turnos.length === 0 && (
                        <p className="text-body-sm text-on-surface-variant/40 italic">No hay turnos disponibles</p>
                      )}
                      {turnos.map(t => (
                        <label key={t.idTurno} className="flex items-center gap-2 cursor-pointer hover:bg-surface-container-high rounded px-2 py-1 transition-colors">
                          <input
                            type="checkbox"
                            checked={form.idTurnos.includes(t.idTurno)}
                            onChange={() => handleToggleTurno(t.idTurno)}
                            className="accent-primary w-4 h-4 rounded"
                          />
                          <span className="text-body-sm text-on-surface">{t.nombre}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-1">Grupo Asignado (opcional)</label>
                    <select
                      value={form.idGrupoAsignado ?? ''}
                      onChange={(e) => setForm(p => ({ ...p, idGrupoAsignado: e.target.value ? Number(e.target.value) : null }))}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                    >
                      <option value="">Sin grupo asignado</option>
                      {grupos.map(g => (
                        <option key={g.idGrupo} value={g.idGrupo}>
                          {g.nombre}{g.tipo ? ` (${g.tipo})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  onClick={cerrarModal}
                  disabled={cargandoAccion}
                  className="border border-outline-variant text-on-surface-variant rounded-xl px-5 py-2.5 font-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={cargandoAccion || cargandoOpciones}
                  className="bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 cursor-pointer flex items-center gap-2"
                >
                  {cargandoAccion && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-on-primary border-t-transparent" />
                  )}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaUsuarios;
