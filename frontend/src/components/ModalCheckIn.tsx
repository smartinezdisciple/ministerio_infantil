// ModalCheckIn.tsx — Modal de registro de nuevo ingreso de niño (Spec §4.1, R-09 a R-14)
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ModalBase from './ModalBase';
import type { Ficha, DatosCheckIn } from '../services/tipos';
import { useAuth } from '../contexts/ContextoAuth';
import { toast } from 'sonner';
import {
  listarNinosRaw,
  listarFichasActivas,
  listarTutoresPorNino,
  crearTutorYVincular,
  listarAsistenciaDia,
  listarTurnos,
  obtenerPerfilPersonal,
  listarGrupos,
  type TutorApi,
  type TurnoApi,
  type GrupoApi
} from '../services/servicioApi';
import { fechaLocalHoy, calcularEdad } from '../services/fechaUtils';
import { formatearTurno } from '../services/turnoUtils';
import { filtrarSoloLetras, formatearTelefono } from '../services/validacionEntrada';

interface NinoCheckIn {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  observacionesGenerales?: string;
  grupo: { idGrupo: number; nombre: string; edadMinima: number; edadMaxima: number };
  alertasMedicas: Array<{ idInfo: number; tipo: string; descripcion: string; severidad: string; instrucciones?: string }>;
  activo?: boolean;
}

interface PropsModalCheckIn {
  abierto: boolean;
  fecha: string;
  onCerrar: () => void;
  onIngresado: (datos: DatosCheckIn & { nombreNino: string }) => void;
  ninoIdInicial?: number | null;
}

type TabActiva = 'ingreso' | 'tutor';

const ESTADO_INICIAL = {
  tabActiva: 'ingreso' as TabActiva,
  busqueda: '',
  ninoSeleccionado: null as NinoCheckIn | null,
  fichaSeleccionadaId: '',
  idTurnoSeleccionado: '',
  acompananteEnAula: false,
  tutorSeleccionadoId: '',
  modoTutor: 'existente' as 'existente' | 'nuevo',
  nuevoTutorNombre: '',
  nuevoTutorTelefono: '',
  nuevoTutorTipo: 'Padre/Madre',
  enviando: false,
  errores: {} as Record<string, string>,
  idGrupoSeleccionado: '',
  motivoExcepcion: '',
};

const ModalCheckIn: React.FC<PropsModalCheckIn> = ({ abierto, fecha, onCerrar, onIngresado, ninoIdInicial }) => {
  const [estado, setEstado] = useState(ESTADO_INICIAL);
  const [ninosFiltrados, setNinosFiltrados] = useState<NinoCheckIn[]>([]);
  const [todosNinos, setTodosNinos] = useState<NinoCheckIn[]>([]);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [tutoresNino, setTutoresNino] = useState<TutorApi[]>([]);
  const [cargandoTutores, setCargandoTutores] = useState(false);
  const { usuario } = useAuth();
  const [turnos, setTurnos] = useState<TurnoApi[]>([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);
  const [grupos, setGrupos] = useState<GrupoApi[]>([]);
  const idsNinosYaPresentesRef = useRef<Set<number>>(new Set());

  // Estados para búsqueda de tutor autocompletable en check-in
  const [busquedaTutor, setBusquedaTutor] = useState('');
  const [mostrarDropdownTutor, setMostrarDropdownTutor] = useState(false);

  const normalizarTexto = (texto: string) => {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const obtenerEtiquetaGrupo = useCallback((n: { fechaNacimiento: string; grupo: { idGrupo: number; nombre: string } }) => {
    const edad = calcularEdad(n.fechaNacimiento);
    if (n.grupo.idGrupo === 1 && edad < 4) {
      return 'Menores de 4 años';
    }
    return n.grupo.nombre;
  }, []);

  const tutoresFiltrados = useMemo(() => {
    const query = busquedaTutor.trim();
    if (!query) return tutoresNino;

    const seleccionado = tutoresNino.find(t => String(t.idPersona) === estado.tutorSeleccionadoId);
    if (seleccionado && seleccionado.nombreCompleto === query) {
      return tutoresNino;
    }

    const queryNorm = normalizarTexto(query);
    return tutoresNino.filter((t) =>
      normalizarTexto(t.nombreCompleto).includes(queryNorm)
    );
  }, [tutoresNino, busquedaTutor, estado.tutorSeleccionadoId]);

  useEffect(() => {
    if (abierto) {
      setEstado(ESTADO_INICIAL);
      setNinosFiltrados([]);
      setTodosNinos([]);
      setTutoresNino([]);
      setCargandoTutores(false);
      setTurnos([]);
      setCargandoTurnos(true);
      setBusquedaTutor('');
      setMostrarDropdownTutor(false);

      const cargarTurnosPromesa = () => {
        if (usuario && usuario.nivelJerarquico < 4) {
          return obtenerPerfilPersonal(usuario.idPersona)
            .then((res) => {
              const turnosPerfil = (res.turnos || []).map((t) => ({
                idTurno: t.idTurno,
                nombre: t.turno as any,
                diaSemana: 0,
                horaInicio: '',
                activo: true,
              } as TurnoApi));
              
              if (turnosPerfil.length > 0) {
                setTurnos(turnosPerfil);
                setEstado(prev => ({ ...prev, idTurnoSeleccionado: String(turnosPerfil[0].idTurno) }));
              } else {
                // Si el usuario no tiene turnos asignados en su perfil, cargamos todos los activos
                return listarTurnos()
                  .then((datos) => {
                    const activos = datos.filter(t => t.activo);
                    setTurnos(activos);
                    const dom8 = activos.find(t => t.nombre === 'Domingo_8am');
                    if (dom8) {
                      setEstado(prev => ({ ...prev, idTurnoSeleccionado: String(dom8.idTurno) }));
                    } else if (activos.length > 0) {
                      setEstado(prev => ({ ...prev, idTurnoSeleccionado: String(activos[0].idTurno) }));
                    }
                  });
              }
            });
        } else {
          return listarTurnos()
            .then((datos) => {
              const activos = datos.filter(t => t.activo);
              setTurnos(activos);
              const dom8 = activos.find(t => t.nombre === 'Domingo_8am');
              if (dom8) {
                setEstado(prev => ({ ...prev, idTurnoSeleccionado: String(dom8.idTurno) }));
              } else if (activos.length > 0) {
                setEstado(prev => ({ ...prev, idTurnoSeleccionado: String(activos[0].idTurno) }));
              }
            });
        }
      };

      Promise.all([
        listarFichasActivas().catch(err => {
          console.error('Error al listar fichas activas:', err);
          return [] as Ficha[];
        }),
        listarAsistenciaDia(fechaLocalHoy()).catch(err => {
          console.error('Error al listar asistencia de hoy:', err);
          return [] as unknown[];
        }),
        cargarTurnosPromesa().catch(err => {
          console.error('Error al cargar turnos:', err);
          return undefined;
        }),
        listarGrupos().catch(err => {
          console.error('Error al listar grupos:', err);
          return [] as GrupoApi[];
        })
      ])
      .then(([fichasResult, asistenciasResult, _turnosResult, gruposResult]) => {
        const fichasActivas = fichasResult as unknown as Ficha[];
        const asistenciasHoy = asistenciasResult as unknown[];
        const listaGrupos = (gruposResult as GrupoApi[]) || [];
        
        setGrupos(listaGrupos);

        const fichasEnUso = new Set(
          asistenciasHoy
            .filter((asistencia: any) => asistencia.idFichaEntrada && asistencia.estado === 'Presente')
            .map((asistencia: any) => asistencia.idFichaEntrada)
        );

        const idsNinosYaPresentes = new Set(
          (asistenciasHoy as any[])
            .filter((a: any) => a.estado === 'Presente')
            .map((a: any) => a.idNino)
        );
        idsNinosYaPresentesRef.current = idsNinosYaPresentes;

        const fichasDisponibles = fichasActivas.filter(
          ficha => ficha.tipo === 'Entrada' && !fichasEnUso.has(ficha.idFicha)
        );
        
        setFichas(fichasDisponibles);
      })
      .catch((error) => {
        console.error('Error general loading initialization data in ModalCheckIn:', error);
      })
      .finally(() => {
        setCargandoTurnos(false);
      });
    }
  }, [abierto, usuario]);

  useEffect(() => {
    if (!abierto || !ninoIdInicial) return;
    let cancel = false;
    const cargar = async () => {
      let lista = todosNinos;
      if (lista.length === 0) {
        const raw = await listarNinosRaw();
        lista = raw.filter((n) => n.activo);
        if (!cancel) setTodosNinos(lista);
      }
      const nino = lista.find((n) => n.idPersona === ninoIdInicial);
      if (!nino || cancel) return;
      const edad = calcularEdad(nino.fechaNacimiento);
      let defaultGrupoId = '';
      if (nino.grupo && nino.grupo.idGrupo > 0) {
        defaultGrupoId = String(nino.grupo.idGrupo);
      } else if (grupos.length > 0) {
        const naturalGroup = grupos.find((g) => {
          if (!g.activo) return false;
          if (edad < 4) return g.idGrupo === 1;
          return edad >= g.edadMinima && edad <= g.edadMaxima;
        });
        defaultGrupoId = naturalGroup ? String(naturalGroup.idGrupo) : '';
      }
      if (!cancel) {
        setEstado((prev) => ({
          ...prev,
          ninoSeleccionado: nino,
          busqueda: nino.nombreCompleto,
          idGrupoSeleccionado: defaultGrupoId,
          fichaSeleccionadaId: '',
          tutorSeleccionadoId: '',
          motivoExcepcion: '',
          errores: {},
        }));
        setCargandoTutores(true);
        try {
          const tutores = await listarTutoresPorNino(nino.idPersona);
          if (!cancel) {
            setTutoresNino(tutores);
            setCargandoTutores(false);
            setEstado((prev) => ({
              ...prev,
              modoTutor: tutores.length > 0 ? 'existente' : 'nuevo',
            }));
          }
        } catch {
          if (!cancel) {
            setTutoresNino([]);
            setCargandoTutores(false);
            setEstado((prev) => ({ ...prev, modoTutor: 'nuevo' }));
          }
        }
      }
    };
    cargar();
    return () => { cancel = true; };
  }, [abierto, ninoIdInicial, grupos]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (estado.ninoSeleccionado && estado.busqueda === estado.ninoSeleccionado.nombreCompleto) {
        return;
      }
      try {
        if (estado.busqueda.trim().length === 0) {
          setNinosFiltrados([]);
          return;
        }
        let lista = todosNinos;
        if (lista.length === 0) {
          const raw = await listarNinosRaw();
          lista = raw.filter((n) => n.activo);
          setTodosNinos(lista);
        }
        const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const q = normalizar(estado.busqueda);
        setNinosFiltrados(
          lista.filter(
            (n) =>
              !idsNinosYaPresentesRef.current.has(n.idPersona) &&
              (normalizar(n.nombreCompleto).includes(q) || String(n.idPersona).includes(estado.busqueda))
          )
        );
      } catch {
        setNinosFiltrados([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [estado.busqueda, todosNinos, estado.ninoSeleccionado]);

  const seleccionarNino = useCallback((nino: NinoCheckIn) => {
    const edad = calcularEdad(nino.fechaNacimiento);
    let defaultGrupoId = '';
    
    if (nino.grupo && nino.grupo.idGrupo > 0) {
      defaultGrupoId = String(nino.grupo.idGrupo);
    } else {
      const naturalGroup = grupos.find(g => {
        if (!g.activo) return false;
        if (edad < 4) {
          return g.idGrupo === 1;
        }
        return edad >= g.edadMinima && edad <= g.edadMaxima;
      });
      defaultGrupoId = naturalGroup ? String(naturalGroup.idGrupo) : '';
    }

    setEstado((prev) => ({
      ...prev,
      ninoSeleccionado: nino,
      busqueda: nino.nombreCompleto,
      errores: { ...prev.errores, nino: '' },
      fichaSeleccionadaId: '',
      tutorSeleccionadoId: '',
      idGrupoSeleccionado: defaultGrupoId,
      motivoExcepcion: '',
    }));
    setNinosFiltrados([]);
    setBusquedaTutor('');
    setMostrarDropdownTutor(false);
    setCargandoTutores(true);
    listarTutoresPorNino(nino.idPersona)
      .then((tutores) => {
        setTutoresNino(tutores);
        setCargandoTutores(false);
        if (tutores.length === 0) {
          setEstado((prev) => ({ ...prev, modoTutor: 'nuevo' }));
        } else {
          setEstado((prev) => ({ ...prev, modoTutor: 'existente' }));
        }
      })
      .catch(() => {
        setTutoresNino([]);
        setCargandoTutores(false);
        setEstado((prev) => ({ ...prev, modoTutor: 'nuevo' }));
      });
  }, [grupos]);

  const fichasPorGrupo = useMemo(() => {
    if (!estado.idGrupoSeleccionado) return [];
    const groupId = Number(estado.idGrupoSeleccionado);
    return fichas
      .filter((f) => f.idGrupo === groupId && f.tipo === 'Entrada')
      .sort((a, b) => a.codigoFicha.localeCompare(b.codigoFicha, undefined, { numeric: true, sensitivity: 'base' }));
  }, [fichas, estado.idGrupoSeleccionado]);

  const validarTabIngreso = (): boolean => {
    const errores: Record<string, string> = {};
    if (!estado.ninoSeleccionado) {
      errores.nino = 'Selecciona un estudiante.';
    }

    if (!estado.idGrupoSeleccionado) {
      errores.grupo = 'Selecciona un grupo para la asistencia.';
    } else if (estado.ninoSeleccionado) {
      const grupoSeleccionado = grupos.find(g => String(g.idGrupo) === estado.idGrupoSeleccionado);
      const edad = calcularEdad(estado.ninoSeleccionado.fechaNacimiento);
      const esExcepcion = grupoSeleccionado
        ? (grupoSeleccionado.idGrupo === 1 && edad < 4
            ? false
            : (edad < grupoSeleccionado.edadMinima || edad > grupoSeleccionado.edadMaxima))
        : false;
      
      if (esExcepcion && !estado.motivoExcepcion.trim()) {
        errores.motivoExcepcion = 'El niño no pertenece a este grupo. Debe escribir un motivo de excepción.';
      }
    }

    if (!estado.fichaSeleccionadaId) {
      errores.ficha = 'Selecciona una ficha de entrada.';
    } else if (estado.ninoSeleccionado && estado.idGrupoSeleccionado) {
      const fichaSeleccionada = fichas.find(f => String(f.idFicha) === estado.fichaSeleccionadaId);
      if (!fichaSeleccionada) {
        errores.ficha = 'La ficha seleccionada no es válida.';
      } else {
        if (fichaSeleccionada.idGrupo !== Number(estado.idGrupoSeleccionado)) {
          errores.ficha = 'La ficha seleccionada no corresponde al grupo de la asistencia.';
        }
        if (fichaSeleccionada.tipo !== 'Entrada') {
          errores.ficha = 'La ficha seleccionada debe ser de tipo Entrada.';
        }
      }
    }

    if (!estado.idTurnoSeleccionado) errores.turno = 'Selecciona un turno.';
    
    if (Object.keys(errores).length > 0) {
      Object.values(errores).forEach((err) => toast.error(err));
      setEstado((prev) => ({ ...prev, errores }));
      return false;
    }
    setEstado((prev) => ({ ...prev, errores: {} }));
    return true;
  };

  const validarTabTutor = (): boolean => {
    const errores: Record<string, string> = {};
    const hayTutoresExistentes = tutoresNino.length > 0;

    if (hayTutoresExistentes && estado.modoTutor === 'existente') {
      if (!estado.tutorSeleccionadoId) {
        errores.tutor = 'Selecciona un tutor registrado de la lista.';
      }
    } else {
      if (!estado.nuevoTutorNombre.trim()) {
        errores.nuevoTutor = 'Ingresa el nombre del tutor.';
      }
      if (!estado.nuevoTutorTelefono.trim()) {
        errores.nuevoTutorTelefono = 'Ingresa el teléfono.';
      }
    }
    
    if (Object.keys(errores).length > 0) {
      Object.values(errores).forEach((err) => toast.error(err));
      setEstado((prev) => ({ ...prev, errores }));
      return false;
    }
    setEstado((prev) => ({ ...prev, errores: {} }));
    return true;
  };

  const avanzarTab = () => {
    if (estado.tabActiva === 'ingreso') {
      if (validarTabIngreso()) {
        setEstado((prev) => ({ ...prev, tabActiva: 'tutor' }));
      }
    }
  };

  const handleConfirmar = async () => {
    if (!validarTabTutor()) return;
    setEstado((prev) => ({ ...prev, enviando: true }));
    try {
      let idTutorEntrega = 0;

      const hayTutoresExistentes = tutoresNino.length > 0;
      const seleccionoExistente = estado.modoTutor === 'existente' && estado.tutorSeleccionadoId;

      if (hayTutoresExistentes && seleccionoExistente) {
        idTutorEntrega = Number(estado.tutorSeleccionadoId);
      } else if (estado.ninoSeleccionado) {
        const partes = estado.nuevoTutorNombre.trim().split(' ');
        const tutorCreado = await crearTutorYVincular({
          idNino: estado.ninoSeleccionado.idPersona,
          nombres: partes[0] || '',
          apellidos: partes.slice(1).join(' ') || 'Sin apellido',
          telefono: estado.nuevoTutorTelefono.trim(),
          tipoTutor: estado.nuevoTutorTipo,
        });
        idTutorEntrega = tutorCreado.idPersona;
      }

      await new Promise((res) => setTimeout(res, 800));
      const grupoSeleccionado = grupos.find(g => String(g.idGrupo) === estado.idGrupoSeleccionado);
      const edad = calcularEdad(estado.ninoSeleccionado!.fechaNacimiento);
      const esExcepcion = grupoSeleccionado ? (edad < grupoSeleccionado.edadMinima || edad > grupoSeleccionado.edadMaxima) : false;

      onIngresado({
        idNino: estado.ninoSeleccionado!.idPersona,
        idFichaEntrada: Number(estado.fichaSeleccionadaId),
        idTutorEntrega,
        acompananteEnAula: estado.acompananteEnAula,
        idGrupo: Number(estado.idGrupoSeleccionado),
        idTurno: Number(estado.idTurnoSeleccionado),
        nombreNino: estado.ninoSeleccionado!.nombreCompleto,
        fecha,
        motivoExcepcion: esExcepcion ? estado.motivoExcepcion.trim() : undefined,
      });
      onCerrar();
    } finally {
      setEstado((prev) => ({ ...prev, enviando: false }));
    }
  };

  const nino = estado.ninoSeleccionado;
  const requiereAcompanante = nino ? (calcularEdad(nino.fechaNacimiento) <= 6) : false;
  const tieneAlertaAlta = (nino?.alertasMedicas ?? []).some((a) => a.severidad === 'Alta');

  const tabs = [
    { key: 'ingreso' as TabActiva, label: 'Ingreso', icono: 'person_add' },
    { key: 'tutor' as TabActiva, label: 'Tutor', icono: 'family_restroom' },
  ];

  const footer = (
    <>
      <button
        onClick={onCerrar}
        disabled={estado.enviando}
        className="flex-1 py-3 px-4 border border-outline-variant text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container-high transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
      {estado.tabActiva === 'ingreso' ? (
        <button
          onClick={avanzarTab}
          disabled={estado.enviando}
          className="flex-1 py-3 px-4 bg-primary text-on-primary font-label-md rounded-xl shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          Siguiente
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      ) : (
        <button
          onClick={handleConfirmar}
          disabled={estado.enviando}
          className="flex-1 py-3 px-4 bg-primary text-on-primary font-label-md rounded-xl shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {estado.enviando ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Confirmar Ingreso
            </>
          )}
        </button>
      )}
    </>
  );

  return (
    <ModalBase
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Registrar Nuevo Ingreso"
      footer={footer}
    >
      {/* ── Tabs de navegación ─────────────────────── */}
      <div className="flex border-b border-outline-variant -mx-gutter px-gutter">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setEstado((p) => ({ ...p, tabActiva: tab.key }))}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-label-md text-label-md border-b-2 transition-colors ${
              estado.tabActiva === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icono}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-stack-lg mt-stack-lg">
        {/* ── TAB: Ingreso ─────────────────────────── */}
        {estado.tabActiva === 'ingreso' && (
          <>
            {/* Alerta médica */}
            {tieneAlertaAlta && (
              <div className="flex items-start gap-3 bg-error-container/50 text-on-error-container rounded-xl px-4 py-3 border border-error/20">
                <span className="material-symbols-outlined text-error mt-0.5 shrink-0">warning</span>
                <div>
                  <p className="text-label-md font-label-md text-error">Alerta Médica — Severidad Alta</p>
                  {nino?.alertasMedicas.filter((a) => a.severidad === 'Alta').map((a) => (
                    <p key={a.idInfo} className="text-body-sm mt-0.5">
                      {a.tipo}: {a.descripcion}
                      {a.instrucciones && <span className="block text-on-surface-variant italic">{a.instrucciones}</span>}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Búsqueda de niño */}
            <div>
              <label htmlFor="busqueda-nino" className="block text-label-md font-label-md text-on-surface mb-2">
                Buscar Estudiante <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  id="busqueda-nino"
                  type="text"
                  value={estado.busqueda}
                  onChange={(e) => {
                    setEstado((p) => ({
                      ...p,
                      busqueda: e.target.value,
                      errores: { ...p.errores, nino: '' },
                    }));
                  }}
                  onBlur={() => {
                    setTimeout(() => setNinosFiltrados([]), 200);
                  }}
                  placeholder="Nombre o ID del niño..."
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-md ${
                    estado.errores.nino ? 'border-error bg-error-container/10' : 'border-outline-variant'
                  }`}
                />
              </div>
              {ninosFiltrados.length > 0 && (
                <ul className="mt-1 border border-outline-variant rounded-xl bg-surface-container-lowest shadow-lg overflow-hidden z-10 relative">
                  {ninosFiltrados.map((n) => (
                    <li key={n.idPersona}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          seleccionarNino(n);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-surface-container-high transition-colors"
                      >
                        <p className="text-label-md font-label-md text-on-surface">
                          {n.nombreCompleto}
                          {calcularEdad(n.fechaNacimiento) >= 13 && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              Graduado
                            </span>
                          )}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">
                          {obtenerEtiquetaGrupo(n)} · {calcularEdad(n.fechaNacimiento)} años
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {estado.ninoSeleccionado && (
                <div className="mt-2 text-body-sm text-on-surface bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-primary">
                      {estado.ninoSeleccionado.nombreCompleto}
                      {calcularEdad(estado.ninoSeleccionado.fechaNacimiento) >= 13 && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          Graduado
                        </span>
                      )}
                    </p>
                    <p className="text-on-surface-variant text-[11px]">
                      Grupo asignado: {obtenerEtiquetaGrupo(estado.ninoSeleccionado)} · Edad: {calcularEdad(estado.ninoSeleccionado.fechaNacimiento)} años
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setEstado(prev => ({ ...prev, ninoSeleccionado: null, busqueda: '' }))}
                    className="text-error hover:underline text-label-sm font-semibold ml-2"
                  >
                    Cambiar
                  </button>
                </div>
              )}

            </div>

            {/* Grupo de asistencia */}
            {estado.ninoSeleccionado && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="grupo-checkin" className="block text-label-md font-label-md text-on-surface mb-2">
                    Grupo <span className="text-error">*</span>
                  </label>
                  <select
                    id="grupo-checkin"
                    value={estado.idGrupoSeleccionado}
                    onChange={(e) => {
                      const nuevoId = e.target.value;
                      setEstado((p) => ({
                        ...p,
                        idGrupoSeleccionado: nuevoId,
                        fichaSeleccionadaId: '',
                        errores: { ...p.errores, grupo: '', ficha: '' },
                      }));
                    }}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary bg-surface-container-lowest border-outline-variant outline-none transition-all text-body-md ${
                      estado.errores.grupo ? 'border-error' : ''
                    }`}
                  >
                    <option value="">Seleccionar grupo...</option>
                    {grupos.map((g) => (
                      <option key={g.idGrupo} value={String(g.idGrupo)}>
                        {g.nombre} ({g.edadMinima}–{g.edadMaxima} años)
                      </option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const grupoSeleccionado = grupos.find(g => String(g.idGrupo) === estado.idGrupoSeleccionado);
                  const edadNino = estado.ninoSeleccionado ? calcularEdad(estado.ninoSeleccionado.fechaNacimiento) : 0;
                  const esExcepcion = grupoSeleccionado ? (edadNino < grupoSeleccionado.edadMinima || edadNino > grupoSeleccionado.edadMaxima) : false;

                  if (!esExcepcion) return null;
                  return (
                    <div>
                      <label htmlFor="motivo-excepcion-checkin" className="block text-label-sm text-error font-semibold mb-1">
                        Motivo de Excepción <span className="text-error">*</span>
                      </label>
                      <input
                        id="motivo-excepcion-checkin"
                        type="text"
                        value={estado.motivoExcepcion}
                        onChange={(e) => setEstado((p) => ({
                          ...p,
                          motivoExcepcion: e.target.value,
                          errores: { ...p.errores, motivoExcepcion: '' }
                        }))}
                        placeholder="Escriba el motivo por el cual asiste a otro grupo..."
                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary bg-surface-container-lowest outline-none transition-all text-body-md ${
                          estado.errores.motivoExcepcion ? 'border-error' : 'border-outline-variant'
                        }`}
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Turno */}
            <div>
              <label htmlFor="turno-checkin" className="block text-label-md font-label-md text-on-surface mb-2">
                Turno <span className="text-error">*</span>
              </label>
              {cargandoTurnos ? (
                <div className="flex items-center gap-2 text-on-surface-variant text-body-sm p-3 bg-surface-container-low rounded-xl">
                  <span className="w-4 h-4 border-2 border-outline-variant border-t-transparent rounded-full animate-spin" />
                  Cargando turno...
                </div>
              ) : (
                <select
                  id="turno-checkin"
                  value={estado.idTurnoSeleccionado}
                  disabled={usuario?.nivelJerarquico !== undefined && usuario.nivelJerarquico < 4 && turnos.length <= 1}
                  onChange={(e) => setEstado((p) => ({
                    ...p,
                    idTurnoSeleccionado: e.target.value,
                    errores: { ...p.errores, turno: '' },
                  }))}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-body-md ${
                    usuario?.nivelJerarquico !== undefined && usuario.nivelJerarquico < 4 && turnos.length <= 1
                      ? 'bg-surface-container-low text-on-surface-variant/80 border-outline-variant cursor-not-allowed'
                      : 'bg-surface-container-lowest border-outline-variant'
                  } ${estado.errores.turno ? 'border-error' : ''}`}
                >
                  <option value="">Seleccionar turno...</option>
                  {turnos.map((t) => (
                    <option key={t.idTurno} value={String(t.idTurno)}>
                      {formatearTurno(t.nombre)}
                    </option>
                  ))}
                </select>
              )}

            </div>

            {/* Ficha de entrada (filtrada por grupo del niño) */}
            <div>
              <label htmlFor="ficha-entrada" className="block text-label-md font-label-md text-on-surface mb-2">
                Ficha de Entrada <span className="text-error">*</span>
              </label>
              {!estado.ninoSeleccionado ? (
                <input
                  id="ficha-entrada"
                  type="text"
                  disabled
                  placeholder="Primero selecciona un niño"
                  className="w-full p-3 border border-outline-variant rounded-xl bg-surface-container-low text-on-surface-variant cursor-not-allowed"
                />
              ) : (
                <>
                  <select
                    id="ficha-entrada"
                    value={estado.fichaSeleccionadaId}
                    onChange={(e) => setEstado((p) => ({
                      ...p,
                      fichaSeleccionadaId: e.target.value,
                      errores: { ...p.errores, ficha: '' },
                    }))}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-body-md ${
                      estado.errores.ficha ? 'border-error' : 'border-outline-variant'
                    }`}
                  >
                    <option value="">Seleccionar ficha...</option>
                    {fichasPorGrupo.length === 0 ? (
                      <option disabled>No hay fichas disponibles para {grupos.find(g => String(g.idGrupo) === estado.idGrupoSeleccionado)?.nombre || ''}</option>
                    ) : (
                      fichasPorGrupo.map((f) => (
                        <option key={f.idFicha} value={String(f.idFicha)}>
                          {f.codigoFicha}
                        </option>
                      ))
                    )}
                  </select>
                  {fichasPorGrupo.length === 0 && (
                    <p className="text-on-surface-variant text-body-sm mt-1">
                      No hay fichas activas para el grupo &quot;{grupos.find(g => String(g.idGrupo) === estado.idGrupoSeleccionado)?.nombre || ''}&quot;.
                    </p>
                  )}
                </>
              )}

            </div>

            {/* Acompañante */}
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center w-6 h-6 border-2 border-primary rounded-md group-active:scale-90 transition-transform shrink-0">
                <input
                  id="checkin-acompanante"
                  name="acompananteEnAula"
                  type="checkbox"
                  checked={estado.acompananteEnAula}
                  onChange={(e) => setEstado((p) => ({ ...p, acompananteEnAula: e.target.checked }))}
                  className="peer absolute opacity-0 w-full h-full cursor-pointer"
                />
                <span className="material-symbols-outlined text-primary scale-0 peer-checked:scale-100 transition-transform text-[20px]">check</span>
              </div>
              <span className="text-body-md text-on-surface-variant">
                Acompañante permanece en el salón
                {requiereAcompanante && (
                  <span className="ml-2 text-label-sm text-secondary">(requerido para 6 años o menores)</span>
                )}
              </span>
            </label>
          </>
        )}

        {/* ── TAB: Tutor ───────────────────────────── */}
        {estado.tabActiva === 'tutor' && (
          <>
            {!estado.ninoSeleccionado ? (
              <div className="text-center py-stack-lg">
                <span className="material-symbols-outlined text-6xl text-outline-variant">family_restroom</span>
                <p className="text-on-surface-variant text-body-md mt-stack-md">Primero selecciona un niño en la pestaña Ingreso.</p>
              </div>
            ) : (
              <>
                {/* Resumen del niño */}
                <div className="bg-surface-container-low rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary">child_care</span>
                  <div>
                    <p className="text-label-md font-label-md text-on-surface">{nino?.nombreCompleto}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {nino ? obtenerEtiquetaGrupo(nino) : ''} · {nino?.fechaNacimiento ? `${calcularEdad(nino.fechaNacimiento)} años` : ''}
                    </p>
                  </div>
                </div>

                {/* Selector de modo tutor (solo si tiene tutores registrados) */}
                {tutoresNino.length > 0 && (
                  <div className="flex p-1 bg-surface-container rounded-xl border border-outline-variant mb-4">
                    <button
                      type="button"
                      onClick={() => setEstado((p) => ({ ...p, modoTutor: 'existente', errores: {} }))}
                      className={`flex-1 py-2 text-label-md font-label-md rounded-lg transition-colors ${
                        estado.modoTutor === 'existente'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Tutor Registrado
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstado((p) => ({ ...p, modoTutor: 'nuevo', errores: {} }))}
                      className={`flex-1 py-2 text-label-md font-label-md rounded-lg transition-colors ${
                        estado.modoTutor === 'nuevo'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Nuevo Tutor
                    </button>
                  </div>
                )}

                {/* Tutores existentes del niño */}
                {tutoresNino.length > 0 && estado.modoTutor === 'existente' && (
                  <div className="space-y-stack-md">
                    <div>
                      <label htmlFor="tutor-select" className="block text-label-md font-label-md text-on-surface mb-2">
                        Tutores Registrados
                      </label>
                      <div className="relative">
                        <input
                          id="tutor-select"
                          type="text"
                          value={busquedaTutor}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBusquedaTutor(val);
                            setEstado((p) => ({
                              ...p,
                              tutorSeleccionadoId: '',
                              modoTutor: 'existente',
                              errores: { ...p.errores, tutor: '' }
                            }));
                          }}
                          onFocus={() => setMostrarDropdownTutor(true)}
                          onBlur={() => {
                            setTimeout(() => setMostrarDropdownTutor(false), 200);
                          }}
                          placeholder="Escribe el nombre del tutor..."
                          className={`w-full h-11 border rounded-xl px-4 pr-10 bg-surface-container-lowest text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all ${
                            estado.errores.tutor ? 'border-error' : 'border-outline-variant'
                          }`}
                          autoComplete="off"
                        />
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" aria-hidden="true">
                          search
                        </span>

                        {mostrarDropdownTutor && (
                          <ul className="absolute z-[100] left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2">
                            {tutoresFiltrados.length > 0 ? (
                              tutoresFiltrados.map((t) => (
                                <li
                                  key={t.idPersona}
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // Evita que el input pierda foco antes del click
                                    setEstado((p) => ({
                                      ...p,
                                      tutorSeleccionadoId: String(t.idPersona),
                                      modoTutor: 'existente',
                                      errores: { ...p.errores, tutor: '' }
                                    }));
                                    setBusquedaTutor(t.nombreCompleto);
                                    setMostrarDropdownTutor(false);
                                  }}
                                  className="px-4 py-2 hover:bg-surface-container-high cursor-pointer text-body-md text-on-surface flex justify-between items-center transition-colors"
                                >
                                  <span>{t.nombreCompleto} — {t.telefono || 'Sin teléfono'}</span>
                                  <span className="text-body-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full" style={{ textTransform: 'capitalize' }}>
                                    {t.tipoTutor}
                                  </span>
                                </li>
                              ))
                            ) : (
                              <li className="px-4 py-2 text-on-surface-variant text-body-sm italic">
                                No se encontraron tutores.
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {cargandoTutores && (
                  <div className="flex items-center gap-2 text-on-surface-variant text-body-sm my-2">
                    <span className="w-4 h-4 border-2 border-outline-variant border-t-transparent rounded-full animate-spin" />
                    Cargando tutores...
                  </div>
                )}

                {/* Formulario tutor nuevo */}
                {(tutoresNino.length === 0 || estado.modoTutor === 'nuevo') && (
                  <div className="space-y-stack-md">
                    <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
                      <p className="text-label-sm font-label-md text-on-surface">
                        Registrar Nuevo Tutor
                      </p>
                    </div>

                    <div>
                      <label htmlFor="nuevo-tutor-nombre" className="block text-label-sm font-label-md text-on-surface-variant mb-1">
                        Nombre Completo <span className="text-error">*</span>
                      </label>
                      <input
                        id="nuevo-tutor-nombre"
                        type="text"
                        value={estado.nuevoTutorNombre}
                        onChange={(e) => setEstado((p) => ({
                          ...p,
                          nuevoTutorNombre: filtrarSoloLetras(e.target.value),
                          errores: { ...p.errores, nuevoTutor: '' },
                        }))}
                        placeholder="Ej: María López"
                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-body-md ${
                          estado.errores.nuevoTutor ? 'border-error bg-error-container/10' : 'border-outline-variant'
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor="nuevo-tutor-telefono" className="block text-label-sm font-label-md text-on-surface-variant mb-1">
                        Teléfono <span className="text-error">*</span>
                      </label>
                      <input
                        id="nuevo-tutor-telefono"
                        type="tel"
                        value={estado.nuevoTutorTelefono}
                        onChange={(e) => setEstado((p) => ({
                          ...p,
                          nuevoTutorTelefono: formatearTelefono(e.target.value, p.nuevoTutorTelefono),
                          errores: { ...p.errores, nuevoTutorTelefono: '' },
                        }))}
                        placeholder="Ej: 5555-1234"
                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-body-md ${
                          estado.errores.nuevoTutorTelefono ? 'border-error bg-error-container/10' : 'border-outline-variant'
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor="nuevo-tutor-tipo" className="block text-label-sm font-label-md text-on-surface-variant mb-1">
                        Parentesco
                      </label>
                      <select
                        id="nuevo-tutor-tipo"
                        value={estado.nuevoTutorTipo}
                        onChange={(e) => setEstado((p) => ({ ...p, nuevoTutorTipo: e.target.value }))}
                        className="w-full p-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-body-md"
                      >
                        <option value="Padre/Madre">Padre/Madre</option>
                        <option value="Abuelo/a">Abuelo/a</option>
                        <option value="Tío/a">Tío/a</option>
                        <option value="Hermano/a">Hermano/a</option>
                        <option value="Otro familiar">Otro familiar</option>
                        <option value="Autorizado">Autorizado</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </ModalBase>
  );
};

export default ModalCheckIn;
