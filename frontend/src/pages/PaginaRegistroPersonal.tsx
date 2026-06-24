// PaginaRegistroPersonal.tsx — Ingreso de Personal con tabla y modal (Spec §9.5)
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import ModalConfirmar from '../components/ModalConfirmar';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/ContextoAuth';
import type { DatosRegistroPersonal, RolNombre, ValidacionContrasena } from '../services/tipos';
import { filtrarSoloLetras } from '../services/validacionEntrada';
import {
  registrarPersonal,
  actualizarPersonal,
  listarCoordinadores,
  listarGrupos,
  listarPersonalHoy,
  obtenerPersonalCompleto,
  listarTurnos,
  listarRoles,
  type PersonalAsistenciaApi,
  type PersonalCompletoApi,
  type TurnoApi,
  type RolApi,
} from '../services/servicioApi';
import { fechaLocalHoy } from '../services/fechaUtils';

// ── Constantes ────────────────────────────────────────────────────
const ROLES_DISPONIBLES: RolNombre[] = ['Colaborador', 'Maestro', 'Staff', 'Coordinador General'];
const ROLES_CON_AUTORIZACION: RolNombre[] = ['Staff', 'Coordinador General'];
const ROLES_CON_GRUPO: RolNombre[] = ['Colaborador', 'Maestro'];

const FORM_INICIAL: DatosRegistroPersonal = {
  nombres:         '',
  apellidos:       '',
  usuario:         '',
  contrasena:      '',
  rol:             'Colaborador',
  fechaIngreso:    fechaLocalHoy(),
  idPersonaExistente: undefined,
  idAutorizadoPor:    undefined,
  idGrupoAsignado:    undefined,
  idTurnos:           [],
  version:            undefined,
};

const validarContrasena = (valor: string): ValidacionContrasena => ({
  longitudMinima: valor.length >= 8,
  tieneMayuscula: /[A-Z]/.test(valor),
  tieneNumero:    /[0-9]/.test(valor),
  tieneEspecial:  /[^A-Za-z0-9]/.test(valor),
});

const esContrasenaValida = (v: ValidacionContrasena) =>
  v.longitudMinima && v.tieneMayuscula && v.tieneNumero && v.tieneEspecial;

const esUsuarioValido = (u: string) => /^[a-zA-Z0-9._-]{3,30}$/.test(u);

const COLORES_AVATAR = [
  'bg-primary-fixed-dim text-on-primary-fixed',
  'bg-secondary-fixed-dim text-on-secondary-fixed',
  'bg-surface-variant text-on-surface',
  'bg-tertiary-fixed-dim text-on-tertiary-fixed',
];

const obtenerIniciales = (nombre: string): string =>
  nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase();

type ErroresFormulario = Partial<Record<keyof DatosRegistroPersonal | 'idAutorizadoPor', string>>;

// ── Modal de Registro ─────────────────────────────────────────────

interface PropsModalRegistro {
  abierto: boolean;
  coordinadores: Array<{ id: number; nombre: string; rol?: string }>;
  grupos: Array<{ idGrupo: number; nombre: string; edadMinima: number; edadMaxima: number }>;
  turnos: TurnoApi[];
  roles: RolApi[];
  nivelUsuario: number;
  personalEditar?: (PersonalAsistenciaApi & { datosCompletos?: PersonalCompletoApi }) | null;
  onCerrar: () => void;
  onRegistrado: () => void;
}

const ModalRegistroPersonal: React.FC<PropsModalRegistro> = ({
  abierto,
  coordinadores,
  grupos,
  turnos,
  roles,
  nivelUsuario,
  personalEditar,
  onCerrar,
  onRegistrado,
}) => {
  const [form, setForm] = useState<DatosRegistroPersonal>(FORM_INICIAL);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [enviando, setEnviando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const esEdicion = !!personalEditar;

  useEffect(() => {
    if (abierto) {
      const datosCompletos = (personalEditar as unknown as { datosCompletos?: PersonalCompletoApi })?.datosCompletos;
      if (datosCompletos) {
        setForm({
          nombres: datosCompletos.nombres,
          apellidos: datosCompletos.apellidos,
          usuario: datosCompletos.usuario,
          contrasena: '',
          rol: datosCompletos.rol as RolNombre,
          fechaIngreso: datosCompletos.fechaIngreso,
          idPersonaExistente: datosCompletos.idPersona,
          idAutorizadoPor: undefined,
          idGrupoAsignado: datosCompletos.idGrupoAsignado ?? undefined,
          idTurnos: datosCompletos.idTurnos ?? [],
          version: datosCompletos.version,
        });
      } else {
        setForm(FORM_INICIAL);
      }
      setErrores({});
      setMostrarContrasena(false);
    }
  }, [abierto, personalEditar]);

  useEffect(() => {
    const mainEl = document.getElementById('contenido-principal');
    if (abierto) {
      document.body.style.overflow = 'hidden';
      if (mainEl) mainEl.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (mainEl) mainEl.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (mainEl) mainEl.style.overflow = '';
    };
  }, [abierto]);

  const actualizarCampo = useCallback(<K extends keyof DatosRegistroPersonal>(
    campo: K, valor: DatosRegistroPersonal[K]
  ) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  }, []);

  const manejarCambioRol = useCallback((rol: RolNombre) => {
    setForm((prev) => ({
      ...prev,
      rol,
      idAutorizadoPor: ROLES_CON_AUTORIZACION.includes(rol) ? prev.idAutorizadoPor : undefined,
      idGrupoAsignado: ROLES_CON_GRUPO.includes(rol) ? prev.idGrupoAsignado : undefined,
    }));
    setErrores((prev) => ({ ...prev, rol: undefined, idAutorizadoPor: undefined, idGrupoAsignado: undefined }));
  }, []);

  const validacion = useMemo(() => validarContrasena(form.contrasena), [form.contrasena]);

  const autoresDisponibles = useMemo(() => {
    if (form.rol === 'Coordinador General') {
      return coordinadores.filter(c => c.rol === 'Coordinador General');
    }
    return coordinadores;
  }, [form.rol, coordinadores]);

  const rolesPermitidos = ROLES_DISPONIBLES.filter(
    (r) => r !== 'Coordinador General' || nivelUsuario >= 4
  );

  const validarFormulario = useCallback((): boolean => {
    const nuevosErrores: ErroresFormulario = {};
    if (!form.nombres.trim()) nuevosErrores.nombres = 'El nombre es obligatorio.';
    if (!form.apellidos.trim()) nuevosErrores.apellidos = 'Los apellidos son obligatorios.';
    if (!form.usuario.trim()) nuevosErrores.usuario = 'El usuario es obligatorio.';
    else if (!esUsuarioValido(form.usuario)) nuevosErrores.usuario = 'Solo letras, números, puntos y guiones (3-30 caracteres).';
    if (!esEdicion && !esContrasenaValida(validacion)) nuevosErrores.contrasena = 'La contraseña no cumple los requisitos.';
    if (!form.fechaIngreso) nuevosErrores.fechaIngreso = 'La fecha es obligatoria.';
    if (ROLES_CON_AUTORIZACION.includes(form.rol) && !form.idAutorizadoPor)
      nuevosErrores.idAutorizadoPor = 'Debe seleccionar quién autoriza.';
    if (ROLES_CON_GRUPO.includes(form.rol) && !form.idGrupoAsignado)
      nuevosErrores.idGrupoAsignado = 'Debe asignar un grupo.';
    if (!form.idTurnos || form.idTurnos.length === 0)
      nuevosErrores.idTurnos = 'Debe seleccionar al menos un turno.';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }, [form, validacion, esEdicion]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setEnviando(true);
    try {
      if (esEdicion) {
        const rolSeleccionado = roles.find(r => r.nombreRol === form.rol);
        const idRol = rolSeleccionado?.idRol;
        await actualizarPersonal(form.idPersonaExistente!, {
          nombres: form.nombres,
          apellidos: form.apellidos,
          usuario: form.usuario,
          contrasena: form.contrasena ? form.contrasena : undefined,
          idRol,
          idGrupoAsignado: form.idGrupoAsignado ?? undefined,
          idTurnos: form.idTurnos,
          version: form.version,
        });
        toast.success('¡Personal actualizado exitosamente!');
      } else {
        await registrarPersonal({
          nombres: form.nombres,
          apellidos: form.apellidos,
          usuario: form.usuario,
          contrasena: form.contrasena,
          rol: form.rol,
          fechaIngreso: form.fechaIngreso,
          idPersonaExistente: form.idPersonaExistente,
          idAutorizadoPor: form.idAutorizadoPor,
          idGrupoAsignado: form.idGrupoAsignado,
          idTurnos: form.idTurnos,
        });
        toast.success('¡Personal registrado exitosamente!');
      }
      setTimeout(() => { onRegistrado(); onCerrar(); }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar.';
      if (msg.toLowerCase().includes('usuario')) {
        setErrores({ usuario: msg });
      } else if (msg.toLowerCase().includes('nivel') || msg.toLowerCase().includes('autoriza')) {
        setErrores({ idAutorizadoPor: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setEnviando(false);
    }
  }, [form, validarFormulario, onRegistrado, onCerrar, esEdicion, roles]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* ── Cabecera ─────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface">{esEdicion ? 'Editar Personal' : 'Registrar Personal'}</h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              {esEdicion ? 'Modifica los datos del miembro.' : 'Complete los datos del nuevo miembro.'}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
            disabled={enviando}
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* ── Cuerpo scrollable ─────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="form-registro" onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-stack-lg">

            {/* Nombres */}
            <div className="flex flex-col gap-2">
              <label htmlFor="r-nombres" className="text-label-sm text-on-surface-variant">Nombres <span className="text-error">*</span></label>
              <input id="r-nombres" type="text" value={form.nombres} onChange={(e) => actualizarCampo('nombres', filtrarSoloLetras(e.target.value))}
                placeholder="Ej: Juan Manuel"
                className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none ${errores.nombres ? 'border-error' : 'border-outline-variant'}`} disabled={enviando} />
              {errores.nombres && <p className="text-label-sm text-error">{errores.nombres}</p>}
            </div>

            {/* Apellidos */}
            <div className="flex flex-col gap-2">
              <label htmlFor="r-apellidos" className="text-label-sm text-on-surface-variant">Apellidos <span className="text-error">*</span></label>
              <input id="r-apellidos" type="text" value={form.apellidos} onChange={(e) => actualizarCampo('apellidos', filtrarSoloLetras(e.target.value))}
                placeholder="Ej: Pérez López"
                className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none ${errores.apellidos ? 'border-error' : 'border-outline-variant'}`} disabled={enviando} />
              {errores.apellidos && <p className="text-label-sm text-error">{errores.apellidos}</p>}
            </div>

            {/* Usuario */}
            <div className="flex flex-col gap-2">
              <label htmlFor="r-usuario" className="text-label-sm text-on-surface-variant">Usuario <span className="text-error">*</span></label>
              <input id="r-usuario" type="text" value={form.usuario} onChange={(e) => actualizarCampo('usuario', e.target.value.toLowerCase().trim())}
                placeholder="Ej: jperez"
                className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none ${errores.usuario ? 'border-error' : 'border-outline-variant'}`} disabled={enviando} />
              {errores.usuario && <p className="text-label-sm text-error">{errores.usuario}</p>}
            </div>

            {/* Contraseña (solo para nuevo registro) */}
            {!esEdicion && (
            <div className="flex flex-col gap-2">
              <label htmlFor="r-contrasena" className="text-label-sm text-on-surface-variant">Contraseña <span className="text-error">*</span></label>
              <div className="relative">
                <input id="r-contrasena" type={mostrarContrasena ? 'text' : 'password'} value={form.contrasena}
                  onChange={(e) => actualizarCampo('contrasena', e.target.value)}
                  placeholder="Mín. 8 caracteres"
                  className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 pr-12 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none ${errores.contrasena ? 'border-error' : 'border-outline-variant'}`} disabled={enviando} />
                <button type="button" onClick={() => setMostrarContrasena(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" aria-label="Alternar visibilidad">
                  <span className="material-symbols-outlined text-[20px]">{mostrarContrasena ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errores.contrasena && <p className="text-label-sm text-error">{errores.contrasena}</p>}
              {form.contrasena.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {([
                    { ok: validacion.longitudMinima, t: '≥ 8 caracteres' },
                    { ok: validacion.tieneMayuscula, t: '1 mayúscula' },
                    { ok: validacion.tieneNumero, t: '1 número' },
                    { ok: validacion.tieneEspecial, t: '1 carácter especial' },
                  ]).map(({ ok, t }) => (
                    <span key={t} className={`text-label-sm flex items-center gap-1 ${ok ? 'text-tertiary' : 'text-on-surface-variant/60'}`}>
                      <span className="material-symbols-outlined text-[14px]">{ok ? 'check_circle' : 'radio_button_unchecked'}</span>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Rol */}
            <div className="flex flex-col gap-2">
              <label htmlFor="r-rol" className="text-label-sm text-on-surface-variant">Rol <span className="text-error">*</span></label>
              <div className="relative">
                <select id="r-rol" value={form.rol} onChange={(e) => manejarCambioRol(e.target.value as RolNombre)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-10 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none">
                  {rolesPermitidos.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* Fecha de inicio */}
            <div className="flex flex-col gap-2">
              <label htmlFor="r-fecha" className="text-label-sm text-on-surface-variant">Fecha de Inicio <span className="text-error">*</span></label>
              <input id="r-fecha" type="date" value={form.fechaIngreso} onChange={(e) => actualizarCampo('fechaIngreso', e.target.value)}
                className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none ${errores.fechaIngreso ? 'border-error' : 'border-outline-variant'}`} disabled={enviando} />
              {errores.fechaIngreso && <p className="text-label-sm text-error">{errores.fechaIngreso}</p>}
            </div>

            {/* Turnos */}
            <div className="md:col-span-2 bg-surface-container-low p-4 rounded-xl border-l-4 border-secondary">
              <div className="flex flex-col gap-2">
                <label className="text-label-sm text-on-surface-variant flex items-center gap-1">
                  Turno(s) Asignado(s) <span className="text-error">*</span>
                </label>
                {form.rol === 'Coordinador General' ? (
                  <div>
                    <p className="text-label-sm text-on-surface-variant/60 mb-2">
                      Selecciona todos los turnos correspondientes (Coordinador General):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {turnos.map((t) => {
                        const seleccionado = form.idTurnos.includes(t.idTurno);
                        return (
                          <button
                            key={t.idTurno}
                            type="button"
                            onClick={() => {
                              const nuevos = seleccionado
                                ? form.idTurnos.filter((id) => id !== t.idTurno)
                                : [...form.idTurnos, t.idTurno];
                              actualizarCampo('idTurnos', nuevos);
                            }}
                            className={`px-4 py-2 rounded-xl text-body-sm font-label-md transition-all border ${
                              seleccionado
                                ? 'bg-primary text-on-primary border-primary'
                                : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-high'
                            }`}
                            disabled={enviando}
                          >
                            {t.nombre}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                      <select
                        id="r-turno"
                        value={form.idTurnos[0] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? [Number(e.target.value)] : [];
                          actualizarCampo('idTurnos', val);
                        }}
                        className={`w-full bg-surface-container-lowest border rounded-lg px-4 py-3 pr-10 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none ${
                          errores.idTurnos ? 'border-error' : 'border-outline-variant'
                        }`}
                        disabled={enviando}
                      >
                        <option value="" disabled>Seleccionar turno...</option>
                        {turnos.map((t) => (
                          <option key={t.idTurno} value={t.idTurno}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                    <span className="material-symbols-outlined text-secondary shrink-0">schedule</span>
                  </div>
                )}
                {errores.idTurnos && <p className="text-label-sm text-error">{errores.idTurnos}</p>}
              </div>
            </div>

            {/* Grupo asignado (Colaborador / Maestro) */}
            {ROLES_CON_GRUPO.includes(form.rol) && (
              <div className="md:col-span-2 bg-surface-container-low p-4 rounded-xl border-l-4 border-tertiary">
                <div className="flex flex-col gap-2">
                  <label htmlFor="r-grupo" className="text-label-sm text-on-surface-variant flex items-center gap-1">
                    Grupo Asignado <span className="text-error">*</span>
                  </label>
                  <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                      <select id="r-grupo" value={form.idGrupoAsignado ?? ''}
                        onChange={(e) => actualizarCampo('idGrupoAsignado', e.target.value ? Number(e.target.value) : undefined)}
                        className={`w-full bg-surface-container-lowest border rounded-lg px-4 py-3 pr-10 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none ${errores.idGrupoAsignado ? 'border-error' : 'border-outline-variant'}`} disabled={enviando}>
                        <option value="" disabled>Seleccionar grupo...</option>
                        {grupos.map(g => <option key={g.idGrupo} value={g.idGrupo}>{g.nombre} ({g.edadMinima}–{g.edadMaxima} años)</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                    <span className="material-symbols-outlined text-tertiary shrink-0">groups</span>
                  </div>
                  {errores.idGrupoAsignado && <p className="text-label-sm text-error">{errores.idGrupoAsignado}</p>}
                </div>
              </div>
            )}

            {/* Autorizado por (Staff / Coordinador General) */}
            {ROLES_CON_AUTORIZACION.includes(form.rol) && (
              <div className="md:col-span-2 bg-surface-container-low p-4 rounded-xl border-l-4 border-primary">
                <div className="flex flex-col gap-2">
                  <label htmlFor="r-autorizado" className="text-label-sm text-on-surface-variant flex items-center gap-1">
                    Autorizado por <span className="text-error">*</span>
                  </label>
                  <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                      <select id="r-autorizado" value={form.idAutorizadoPor ?? ''}
                        onChange={(e) => actualizarCampo('idAutorizadoPor', e.target.value ? Number(e.target.value) : undefined)}
                        className={`w-full bg-surface-container-lowest border rounded-lg px-4 py-3 pr-10 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none ${errores.idAutorizadoPor ? 'border-error' : 'border-outline-variant'}`} disabled={enviando}>
                        <option value="" disabled>Seleccionar autorizador</option>
                        {autoresDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}{c.rol ? ` (${c.rol})` : ''}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                    <span className="material-symbols-outlined text-primary shrink-0">verified_user</span>
                  </div>
                  {errores.idAutorizadoPor ? (
                    <p className="text-label-sm text-error">{errores.idAutorizadoPor}</p>
                  ) : (
                    <p className="text-label-sm text-on-surface-variant/60">
                      {form.rol === 'Coordinador General'
                        ? 'Solo un Coordinador General puede autorizar este rol.'
                        : 'Requerido para el rol de Staff por protocolos de seguridad.'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ── Pie ───────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant">
          <button type="button" onClick={onCerrar} disabled={enviando}
            className="border border-outline-variant text-on-surface-variant rounded-xl px-5 py-2.5 font-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="form-registro" disabled={enviando}
            className="flex items-center gap-2 bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {enviando ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                {esEdicion ? 'Guardar Cambios' : 'Registrar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Página Principal ──────────────────────────────────────────────

const PaginaRegistroPersonal: React.FC = () => {
  const { usuario } = useAuth();
  const nivelUsuario = usuario?.nivelJerarquico ?? 0;

  const [modalAbierto, setModalAbierto] = useState(false);
  const [personalEditando, setPersonalEditando] = useState<(PersonalAsistenciaApi & { datosCompletos?: PersonalCompletoApi }) | null>(null);
  const [personal, setPersonal] = useState<PersonalAsistenciaApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [coordinadores, setCoordinadores] = useState<Array<{ id: number; nombre: string; rol?: string }>>([]);
  const [grupos, setGrupos] = useState<Array<{ idGrupo: number; nombre: string; edadMinima: number; edadMaxima: number }>>([]);
  const [turnos, setTurnos] = useState<TurnoApi[]>([]);
  const [roles, setRoles] = useState<RolApi[]>([]);
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState(false);
  const [personalAEliminar, setPersonalAEliminar] = useState<PersonalAsistenciaApi | null>(null);

  // ── Carga de personal con SWR ────────────────
  const { data: swrPersonal, isLoading: isLoadingPersonal, mutate: mutatePersonal } = useSWR(
    '/personal/asistencia-hoy',
    async () => {
      const res = await listarPersonalHoy();
      return res as unknown as PersonalAsistenciaApi[];
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const cargarDatos = useCallback(async () => {
    mutatePersonal();
  }, [mutatePersonal]);

  useEffect(() => {
    if (swrPersonal) {
      setPersonal(swrPersonal);
    }
  }, [swrPersonal]);

  useEffect(() => {
    if (isLoadingPersonal && !swrPersonal) {
      setCargando(true);
    } else {
      setCargando(false);
    }
  }, [isLoadingPersonal, swrPersonal]);

  // Cargar catálogos una sola vez al montar
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [datosCoord, datosGrupos, datosTurnos, datosRoles] = await Promise.all([
          listarCoordinadores(),
          listarGrupos(),
          listarTurnos(),
          listarRoles(),
        ]);
        setCoordinadores(datosCoord);
        setGrupos(datosGrupos);
        setTurnos(datosTurnos.filter(t => t.activo));
        setRoles(datosRoles.filter(r => r.activo));
      } catch (err) {
        console.error('Error cargando catálogos:', err);
      }
    };
    cargarCatalogos();
  }, []);

  const personalFiltrado = useMemo(() => {
    const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q = normalizar(busqueda);
    return personal.filter(p => {
      const coincideNombre = busqueda ? normalizar(p.nombreCompleto).includes(q) : true;
      const coincideRol = filtroRol ? p.rol === filtroRol : true;
      return coincideNombre && coincideRol;
    });
  }, [personal, busqueda, filtroRol]);

  const personalPaginado = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return personalFiltrado.slice(inicio, inicio + porPagina);
  }, [personalFiltrado, pagina, porPagina]);

  const columnas: ColumnaTabla<PersonalAsistenciaApi>[] = [
    {
      id: 'nombre',
      encabezado: 'Nombre',
      ordenablePor: (p) => p.nombreCompleto,
      render: (p) => {
        const iniciales = obtenerIniciales(p.nombreCompleto);
        const idx = personalFiltrado.indexOf(p);
        const color = COLORES_AVATAR[idx >= 0 ? idx % COLORES_AVATAR.length : 0];
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-sm shrink-0 ${color}`}>
              {iniciales}
            </div>
            <span>{p.nombreCompleto}</span>
          </div>
        );
      },
    },
    {
      id: 'rol',
      encabezado: 'Rol',
      ordenablePor: 'rol',
      render: (p) => <span className="text-on-surface-variant">{p.rol}</span>,
    },
    {
      id: 'grupo',
      encabezado: 'Grupo',
      ordenablePor: (p) => p.grupoAsignado ?? '',
      render: (p) => <span className="text-on-surface-variant">{p.grupoAsignado ?? '—'}</span>,
    },
    {
      id: 'fecha',
      encabezado: 'Fecha Ingreso',
      ordenablePor: 'fechaIngreso',
      render: (p) => <span className="text-on-surface-variant">{p.fechaIngreso}</span>,
    },
  ];

  const handleEditar = useCallback(async (p: PersonalAsistenciaApi) => {
    try {
      const datosCompletos = await obtenerPersonalCompleto(p.idPersona);
      setPersonalEditando({ ...p, datosCompletos });
      setModalAbierto(true);
    } catch (err) {
      console.error('Error cargando datos del personal:', err);
    }
  }, []);

  const handleVer = useCallback((p: PersonalAsistenciaApi) => {
    handleEditar(p);
  }, [handleEditar]);

  const handleEliminar = useCallback((p: PersonalAsistenciaApi) => {
    setPersonalAEliminar(p);
    setModalConfirmarEliminar(true);
  }, []);

  const confirmarEliminar = useCallback(() => {
    if (!personalAEliminar) return;
    setPersonal(prev => prev.filter(x => x.idPersona !== personalAEliminar.idPersona));
    toast.success('Miembro del personal quitado de la lista.');
    setPersonalAEliminar(null);
  }, [personalAEliminar]);

  const totalPersonal = personal.length;
  const presentes = personal.filter(p => p.estadoLlegada === 'Temprano' || p.estadoLlegada === 'Tarde').length;

  return (
    <LayoutPrincipal titulo="Gestión de Personal">
      <div className="space-y-stack-lg max-w-[1440px]">

        {/* ── Tarjetas de resumen ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <h3 className="font-label-md text-label-md text-on-surface-variant">Total Personal</h3>
            </div>
            <span className="text-display-lg font-display-lg text-on-surface">{cargando ? '—' : totalPersonal}</span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-tertiary/10 rounded-full text-tertiary">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <h3 className="font-label-md text-label-md text-on-surface-variant">Presentes Hoy</h3>
            </div>
            <span className="text-display-lg font-display-lg text-tertiary">{cargando ? '—' : presentes}</span>
          </div>
        </div>

        {/* ── Filtros ─────────────────────────────── */}
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
              placeholder="Buscar por nombre..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <select value={filtroRol} onChange={(e) => { setFiltroRol(e.target.value); setPagina(1); }}
            className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 font-body-sm text-on-surface focus:outline-none focus:border-primary">
            <option value="">Todos los roles</option>
            {ROLES_DISPONIBLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* ── Tabla ───────────────────────────────── */}
        <TablaBase
          columnas={columnas}
          filas={personalPaginado}
          obtenerClave={(p) => p.idPersona}
          pagina={pagina}
          total={personalFiltrado.length}
          porPagina={porPagina}
          onCambiarPagina={setPagina}
          onCambiarPorPagina={setPorPagina}
          cargando={cargando}
          mensajeVacio={
            busqueda || filtroRol
              ? 'No se encontraron resultados.'
              : 'No hay personal registrado aún.'
          }
          acciones={{ onVer: handleVer, onEditar: handleEditar, onEliminar: handleEliminar }}
        />
      </div>

      <ModalRegistroPersonal
        abierto={modalAbierto}
        coordinadores={coordinadores}
        grupos={grupos}
        turnos={turnos}
        roles={roles}
        nivelUsuario={nivelUsuario}
        personalEditar={personalEditando}
        onCerrar={() => { setModalAbierto(false); setPersonalEditando(null); }}
        onRegistrado={cargarDatos}
      />
      <ModalConfirmar
        abierto={modalConfirmarEliminar}
        onCerrar={() => { setModalConfirmarEliminar(false); setPersonalAEliminar(null); }}
        titulo="Eliminar Miembro"
        mensaje={`¿Estás seguro de eliminar a ${personalAEliminar?.nombreCompleto}?`}
        onConfirmar={confirmarEliminar}
        tipo="danger"
      />
    </LayoutPrincipal>
  );
};

export default PaginaRegistroPersonal;
