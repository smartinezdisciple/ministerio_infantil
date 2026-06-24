// PaginaSolicitudes.tsx — Página de Solicitudes de Personal (Spec §5.2)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import LayoutPrincipal from '../components/LayoutPrincipal';
import { filtrarSoloLetras, formatearTelefono } from '../services/validacionEntrada';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/ContextoAuth';
import {
  listarSolicitudes,
  crearSolicitud,
  actualizarSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  listarRoles,
  listarRedes,
  listarRequisitos,
  obtenerHistorialSolicitud,
  obtenerRequisitosSolicitud,
  listarPersonas,
  crearPersona,
  actualizarPersona,
  listarTurnos,
  listarGrupos,
  type SolicitudApi,
  type RolApi,
  type RedApi,
  type RequisitoApi,
  type HistorialEstadoSolicitudApi,
  type DatosSolicitudNueva,
  type PersonaApi,
  type TurnoApi,
  type GrupoApi,
} from '../services/servicioApi';
import { parsearFechaUsuario, formatearFechaConMesTexto } from '../services/fechaUtils';

type TabSolicitud = 'identificacion' | 'datos_personales' | 'datos_eclesiasticos' | 'requisitos' | 'historial';

const TABS_SOLICITUD: { id: TabSolicitud; etiqueta: string; icono: string }[] = [
  { id: 'identificacion', etiqueta: 'Identificación', icono: 'person_search' },
  { id: 'datos_personales', etiqueta: 'Datos Personales', icono: 'home' },
  { id: 'requisitos', etiqueta: 'Crecimiento', icono: 'checklist' },
  { id: 'datos_eclesiasticos', etiqueta: 'Datos Iglesia', icono: 'church' },
];

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

interface FormSolicitud {
  idPersona: number | null;
  nombreCandidato: string;
  telefonoCandidato: string;
  idRolSolicitado: number;
  notasStaff: string;
  estadoCivil: string;
  condicionCivil: string;
  nombreConyuge: string;
  tieneHijos: boolean;
  numeroHijos: number;
  direccion: string;
  idRed: number | null;
  estadoLiderazgo: string;
  idMentorPropuesto: number | null;
  circuloAmistad: string;
  tiempoIglesiaMeses: number;
  ministerioAdicional: string;
  requisitos: Record<number, { cumplido: boolean; fechaCumplido: string; notas: string }>;

  // v5.1 fields
  sexoCandidato: string;
  cedulaCandidato: string;
  ocupacionCandidato: string;
  centroLaboralCandidato: string;
  nivelAcademicoCandidato: string;
  dirCiudad: string;
  dirMunicipio: string;
  dirDistrito: string;
  dirBarrio: string;
  dirExacta: string;
  telCasa: string;
  telOficina: string;
  telClaro: string;
  telMovistar: string;
  conyugeOcupacion: string;
  conyugeCentroLaboral: string;
  bautizadoAgua: boolean;
  fechaBautismo: string;
  fechaBautismoPrecision: string;
  circuloAmistadDesde: string;
  circuloAmistadPrecision: string;
  clasesBiblicasNinos: boolean;
  clasesBiblicasDetalle: string;
  capacitacionEnsenanza: boolean;
  capacitacionDetalle: string;
  observacionesEspiritualesSol: string;
  estadoOperativoCandidato: string;
  idLiderPropuesto: number | null;

  // Líder / mentor (texto libre)
  liderNombres: string;
  liderApellidos: string;
  liderTelefono: string;

  // Historial en otras iglesias
  asistioOtraIglesia: boolean;
  nombreOtraIglesia: string;
  denominacionOtraIglesia: string;

  // Nuevos campos locales para sincronización de requisitos
  cursadoNuevosCreyentes: boolean;
  moduloNuevosCreyentes: string;
  cursadoObreros: string;
  anioObreros: string;
  asisteCirculo: string;
}

const formInicial = (): FormSolicitud => ({
  idPersona: null,
  nombreCandidato: '',
  telefonoCandidato: '',
  idRolSolicitado: 1,
  notasStaff: '',
  estadoCivil: 'Soltero',
  condicionCivil: 'Ninguna',
  nombreConyuge: '',
  tieneHijos: false,
  numeroHijos: 0,
  direccion: '',
  idRed: null,
  estadoLiderazgo: '',
  idMentorPropuesto: null,
  circuloAmistad: '',
  tiempoIglesiaMeses: 0,
  ministerioAdicional: '',
  requisitos: {},

  sexoCandidato: '',
  cedulaCandidato: '',
  ocupacionCandidato: '',
  centroLaboralCandidato: '',
  nivelAcademicoCandidato: '',
  dirCiudad: '',
  dirMunicipio: '',
  dirDistrito: '',
  dirBarrio: '',
  dirExacta: '',
  telCasa: '',
  telOficina: '',
  telClaro: '',
  telMovistar: '',
  conyugeOcupacion: '',
  conyugeCentroLaboral: '',
  bautizadoAgua: false,
  fechaBautismo: '',
  fechaBautismoPrecision: '',
  circuloAmistadDesde: '',
  circuloAmistadPrecision: '',
  clasesBiblicasNinos: false,
  clasesBiblicasDetalle: '',
  capacitacionEnsenanza: false,
  capacitacionDetalle: '',
  observacionesEspiritualesSol: '',
  estadoOperativoCandidato: 'En_Formacion',
  idLiderPropuesto: null,

  liderNombres: '',
  liderApellidos: '',
  liderTelefono: '',

  asistioOtraIglesia: false,
  nombreOtraIglesia: '',
  denominacionOtraIglesia: '',

  cursadoNuevosCreyentes: false,
  moduloNuevosCreyentes: '',
  cursadoObreros: '',
  anioObreros: '',
  asisteCirculo: '',
});

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

interface PropsModalSolicitud {
  abierto: boolean;
  roles: RolApi[];
  redes: RedApi[];
  requisitos: RequisitoApi[];
  solicitudEditar?: SolicitudApi | null;
  onCerrar: () => void;
  onRegistrado: () => void;
}

const ModalSolicitud: React.FC<PropsModalSolicitud> = ({
  abierto,
  roles,
  redes,
  requisitos,
  solicitudEditar,
  onCerrar,
  onRegistrado,
}) => {

  const [tabActiva, setTabActiva] = useState<TabSolicitud>('identificacion');
  const [form, setForm] = useState<FormSolicitud>(formInicial());
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [historial, setHistorial] = useState<HistorialEstadoSolicitudApi[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const [personas, setPersonas] = useState<PersonaApi[]>([]);
  const [busquedaPersona, setBusquedaPersona] = useState('');
  const [mostrarDropdownPersonas, setMostrarDropdownPersonas] = useState(false);

  const esEdicion = !!solicitudEditar;

  const personaSeleccionada = useMemo(() => {
    if (!form.idPersona) return null;
    return personas.find(p => p.idPersona === form.idPersona) || null;
  }, [personas, form.idPersona]);

  useEffect(() => {
    if (abierto) {
      const cargarPersonas = async () => {
        try {
          const listado = await listarPersonas();
          setPersonas(listado);
        } catch (err) {
          console.error('Error cargando personas en solicitudes:', err);
        }
      };
      cargarPersonas();
    }
  }, [abierto]);

  const personasFiltradas = useMemo(() => {
    if (!busquedaPersona.trim()) return [];
    const query = busquedaPersona.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return personas.filter((p) => {
      const nombreCompleto = `${p.nombres} ${p.apellidos}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const cedula = (p.cedula || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return nombreCompleto.includes(query) || cedula.includes(query);
    });
  }, [personas, busquedaPersona]);

  const vincularPersona = (p: PersonaApi) => {
    setForm((prev) => ({
      ...prev,
      idPersona: p.idPersona,
      nombreCandidato: `${p.nombres} ${p.apellidos}`,
      telefonoCandidato: p.telefono ?? '',
      telClaro: p.telefono ?? '',
      sexoCandidato: p.sexo ?? '',
      cedulaCandidato: p.cedula ?? '',
    }));
    setBusquedaPersona('');
    setMostrarDropdownPersonas(false);
  };

  useEffect(() => {
    if (abierto) {
      setBusquedaPersona('');
      setMostrarDropdownPersonas(false);
      if (solicitudEditar) {
        const ecVal = solicitudEditar.estadoCivil ?? 'Soltero';
        // Mapeo de valores legacy al nuevo esquema simplificado
        let mappedEc = 'Soltero';
        let mappedCond = 'Ninguna';
        if (ecVal === 'Casado' || ecVal === 'Segundo_Matrimonio' || ecVal === 'Union_Libre' || ecVal === 'Acompañado') {
          mappedEc = 'Casado';
          mappedCond = 'Primer_Matrimonio';
        } else if (ecVal === 'Divorciado' || ecVal === 'Separado' || ecVal === 'Madre_Soltera' || ecVal === 'Padre_Soltero' || ecVal === 'Padre_Madre_Soltero') {
          mappedEc = 'Soltero';
          mappedCond = 'Divorciado_1er_Matrimonio';
        } else if (ecVal === 'Viudo') {
          mappedEc = 'Soltero';
          mappedCond = 'Viudo';
        } else {
          mappedEc = 'Soltero';
          mappedCond = 'Ninguna';
        }
        // Leer condicionCivil del servidor si ya está guardada
        const savedCond = (solicitudEditar as any).condicionCivil;
        if (savedCond) mappedCond = savedCond;
        setForm({
          idPersona: solicitudEditar.idPersona ?? null,
          nombreCandidato: solicitudEditar.candidato ?? '',
          telefonoCandidato: solicitudEditar.telefono ?? '',
          idRolSolicitado: solicitudEditar.idRolSolicitado ?? 1,
          notasStaff: solicitudEditar.notasStaff ?? '',
          estadoCivil: mappedEc,
          condicionCivil: mappedCond,
          nombreConyuge: solicitudEditar.nombreConyuge ?? '',
          tieneHijos: solicitudEditar.tieneHijos ?? false,
          numeroHijos: solicitudEditar.numeroHijos ?? 0,
          direccion: solicitudEditar.direccion ?? '',
          idRed: solicitudEditar.idRed ?? null,
          estadoLiderazgo: solicitudEditar.estadoLiderazgo ?? '',
          idMentorPropuesto: solicitudEditar.idMentorPropuesto ?? null,
          circuloAmistad: solicitudEditar.circuloAmistad ?? '',
          tiempoIglesiaMeses: solicitudEditar.tiempoIglesiaMeses ?? 0,
          ministerioAdicional: solicitudEditar.ministerioAdicional ?? '',
          requisitos: {},

          sexoCandidato: solicitudEditar.sexoCandidato ?? '',
          cedulaCandidato: solicitudEditar.cedulaCandidato ?? '',
          ocupacionCandidato: solicitudEditar.ocupacionCandidato ?? '',
          centroLaboralCandidato: solicitudEditar.centroLaboralCandidato ?? '',
          nivelAcademicoCandidato: solicitudEditar.nivelAcademicoCandidato ?? '',
          dirCiudad: solicitudEditar.dirCiudad ?? '',
          dirMunicipio: solicitudEditar.dirMunicipio ?? '',
          dirDistrito: solicitudEditar.dirDistrito ?? '',
          dirBarrio: solicitudEditar.dirBarrio ?? '',
          dirExacta: solicitudEditar.dirExacta ?? '',
          telCasa: solicitudEditar.telCasa ?? '',
          telOficina: solicitudEditar.telOficina ?? '',
          telClaro: solicitudEditar.telClaro ?? '',
          telMovistar: solicitudEditar.telMovistar ?? '',
          conyugeOcupacion: solicitudEditar.conyugeOcupacion ?? '',
          conyugeCentroLaboral: solicitudEditar.conyugeCentroLaboral ?? '',
          bautizadoAgua: solicitudEditar.bautizadoAgua ?? false,
          fechaBautismo: solicitudEditar.fechaBautismo ? formatearFechaConMesTexto(solicitudEditar.fechaBautismo) : '',
          fechaBautismoPrecision: solicitudEditar.fechaBautismoPrecision ?? '',
          circuloAmistadDesde: solicitudEditar.circuloAmistadDesde ? formatearFechaConMesTexto(solicitudEditar.circuloAmistadDesde) : '',
          circuloAmistadPrecision: solicitudEditar.circuloAmistadPrecision ?? '',
          clasesBiblicasNinos: solicitudEditar.clasesBiblicasNinos ?? false,
          clasesBiblicasDetalle: solicitudEditar.clasesBiblicasDetalle ?? '',
          capacitacionEnsenanza: solicitudEditar.capacitacionEnsenanza ?? false,
          capacitacionDetalle: solicitudEditar.capacitacionDetalle ?? '',
          observacionesEspiritualesSol: solicitudEditar.observacionesEspiritualesSol ?? '',
          estadoOperativoCandidato: solicitudEditar.estadoOperativoCandidato ?? 'En_Formacion',
          idLiderPropuesto: null,

          liderNombres: (solicitudEditar as any).liderNombres ?? '',
          liderApellidos: (solicitudEditar as any).liderApellidos ?? '',
          liderTelefono: (solicitudEditar as any).liderTelefono ?? '',

          asistioOtraIglesia: (solicitudEditar as any).asistioOtraIglesia ?? false,
          nombreOtraIglesia: (solicitudEditar as any).nombreOtraIglesia ?? '',
          denominacionOtraIglesia: (solicitudEditar as any).denominacionOtraIglesia ?? '',

          cursadoNuevosCreyentes: false,
          moduloNuevosCreyentes: '',
          cursadoObreros: '',
          anioObreros: '',
          asisteCirculo: '',
        });

        obtenerRequisitosSolicitud(solicitudEditar.idSolicitud)
          .then((reqs) => {
            const reqMap: Record<number, { cumplido: boolean; fechaCumplido: string; notas: string }> = {};
            let cursadoNC = false;
            let moduloNC = '';
            let cursadoOB = '';
            let anioOB = '';
            let asisteCI = '';

            reqs.forEach((r) => {
              reqMap[r.idRequisito] = {
                cumplido: r.cumplido,
                fechaCumplido: r.fechaCumplido ? formatearFechaConMesTexto(r.fechaCumplido) : '',
                notas: r.notas ?? '',
              };

              if (r.idRequisito === 1) {
                cursadoNC = r.cumplido;
                const m = r.notas?.match(/Módulo:?\s*([1-4])/i);
                if (m) moduloNC = m[1];
              }
              if (r.idRequisito === 5) {
                cursadoOB = r.cumplido ? 'Si' : 'No';
                const y = r.notas?.match(/Año:?\s*(\d{4})/i);
                if (y) anioOB = y[1];
              }
              if (r.idRequisito === 7) {
                asisteCI = r.cumplido ? 'Si' : 'No';
              }
            });

            setForm((prev) => ({
              ...prev,
              requisitos: reqMap,
              cursadoNuevosCreyentes: cursadoNC,
              moduloNuevosCreyentes: moduloNC,
              cursadoObreros: cursadoOB,
              anioObreros: anioOB,
              asisteCirculo: asisteCI || (solicitudEditar.circuloAmistad ? 'Si' : 'No'),
            }));
          })
          .catch((err) => console.error('Error cargando requisitos de solicitud:', err));
      } else {
        setForm(formInicial());
      }
      setTabActiva('identificacion');
      setErrores({});
      setHistorial([]);
    }
  }, [abierto, solicitudEditar, roles]);

  useEffect(() => {
    if (tabActiva === 'historial' && solicitudEditar) {
      setCargandoHistorial(true);
      obtenerHistorialSolicitud(solicitudEditar.idSolicitud)
        .then((data) => setHistorial(data))
        .catch((err) => console.error('Error cargando historial:', err))
        .finally(() => setCargandoHistorial(false));
    }
  }, [tabActiva, solicitudEditar]);

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

  // Resetear hijos si es soltero sin matrimonios previos
  useEffect(() => {
    if (form.estadoCivil === 'Soltero' && form.condicionCivil === 'Ninguna') {
      if (form.tieneHijos || form.numeroHijos !== 0) {
        setForm((prev) => ({
          ...prev,
          tieneHijos: false,
          numeroHijos: 0,
        }));
      }
    }
  }, [form.estadoCivil, form.condicionCivil, form.tieneHijos, form.numeroHijos]);

  const actualizarCampo = <K extends keyof FormSolicitud>(campo: K, valor: FormSolicitud[K]) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => { const c = { ...prev }; delete c[campo]; return c; });
  };

  const actualizarRequisito = (idRequisito: number, campo: string, valor: any) => {
    setForm((prev) => {
      const prevReq = prev.requisitos[idRequisito] || {};
      const nuevoReq = {
        cumplido: prevReq.cumplido ?? false,
        fechaCumplido: prevReq.fechaCumplido ?? '',
        notas: prevReq.notas ?? '',
        [campo]: valor,
      };

      const partialUpdates: Partial<FormSolicitud> = {};

      if (idRequisito === 1) {
        if (campo === 'cumplido') {
          partialUpdates.cursadoNuevosCreyentes = !!valor;
          if (!valor) {
            nuevoReq.notas = '';
            partialUpdates.moduloNuevosCreyentes = '';
          }
        } else if (campo === 'notas') {
          const m = (valor as string || '').match(/Módulo:?\s*([1-4])/i);
          partialUpdates.moduloNuevosCreyentes = m ? m[1] : '';
        }
      } else if (idRequisito === 5) {
        if (campo === 'cumplido') {
          partialUpdates.cursadoObreros = valor ? 'Si' : 'No';
          if (!valor) {
            nuevoReq.notas = '';
            partialUpdates.anioObreros = '';
             if (prev.estadoLiderazgo === 'Lider' || prev.estadoLiderazgo === 'Mentor' || prev.estadoLiderazgo === 'Lider_Apoyo') {
               partialUpdates.estadoLiderazgo = '';
             }
          }
        } else if (campo === 'notas') {
          const y = (valor as string || '').match(/Año:?\s*(\d{4})/i);
          partialUpdates.anioObreros = y ? y[1] : '';
        }
      } else if (idRequisito === 6) {
        if (campo === 'cumplido') {
          partialUpdates.bautizadoAgua = !!valor;
          if (!valor) {
            partialUpdates.fechaBautismo = '';
            partialUpdates.fechaBautismoPrecision = '';
            nuevoReq.fechaCumplido = '';
            nuevoReq.notas = '';
          }
        } else if (campo === 'fechaCumplido') {
          partialUpdates.fechaBautismo = valor as string;
        } else if (campo === 'notas') {
          const m = (valor as string || '').match(/Precisión:?\s*(.+)/i);
          partialUpdates.fechaBautismoPrecision = m ? m[1] : (valor as string);
        }
      } else if (idRequisito === 7) {
        if (campo === 'cumplido') {
          partialUpdates.asisteCirculo = valor ? 'Si' : 'No';
          if (!valor) {
            partialUpdates.circuloAmistad = '';
            partialUpdates.circuloAmistadDesde = '';
            partialUpdates.circuloAmistadPrecision = 'Exacta';
            partialUpdates.idRed = null;
            partialUpdates.idLiderPropuesto = null;
            nuevoReq.fechaCumplido = '';
            nuevoReq.notas = '';
          }
        } else if (campo === 'fechaCumplido') {
          partialUpdates.circuloAmistadDesde = valor as string;
        } else if (campo === 'notas') {
          const m = (valor as string || '').match(/Círculo:?\s*(.+)/i);
          partialUpdates.circuloAmistad = m ? m[1] : (valor as string);
        }
      }

      return {
        ...prev,
        ...partialUpdates,
        requisitos: {
          ...prev.requisitos,
          [idRequisito]: nuevoReq,
        },
      };
    });
    setErrores((prev) => {
      const c = { ...prev };
      delete c[`req-fecha-${idRequisito}`];
      if (idRequisito === 1) delete c['cursadoNuevosCreyentes'];
      if (idRequisito === 5) {
        delete c['cursadoObreros'];
        delete c['anioObreros'];
      }
      if (idRequisito === 7) {
        delete c['asisteCirculo'];
        delete c['circuloAmistad'];
      }
      return c;
    });
  };





  const requisitosFiltrados = useMemo(() => {
    return requisitos.filter(r => r.activo && (!r.idRolRequerido || r.idRolRequerido === form.idRolSolicitado));
  }, [requisitos, form.idRolSolicitado]);

  const reqObligatoriosPendientes = useMemo(() => {
    return requisitosFiltrados.filter(r => r.obligatorio && !form.requisitos[r.idRequisito]?.cumplido);
  }, [requisitosFiltrados, form.requisitos]);

  const validarTab = (tab: TabSolicitud): boolean => {
    const nuevosErrores: Record<string, string> = {};
    if (tab === 'identificacion') {
      if (!form.nombreCandidato.trim()) nuevosErrores['nombreCandidato'] = 'El nombre es obligatorio.';
      if (!form.idRolSolicitado) nuevosErrores['idRolSolicitado'] = 'Debe seleccionar un rol.';
      if (!form.sexoCandidato) nuevosErrores['sexoCandidato'] = 'Debe seleccionar el sexo.';
      if (!form.cedulaCandidato.trim()) nuevosErrores['cedulaCandidato'] = 'La cédula es requerida.';
    }
    if (tab === 'datos_personales') {
      const requiereConyuge = form.estadoCivil === 'Casado';
      if (requiereConyuge && !form.nombreConyuge.trim()) {
        nuevosErrores['nombreConyuge'] = 'El nombre del cónyuge es obligatorio para este estado civil.';
      }
      if (form.tieneHijos && form.numeroHijos < 1) {
        nuevosErrores['numeroHijos'] = 'Debe indicar el número de hijos.';
      }
      if (!form.dirCiudad.trim()) nuevosErrores['dirCiudad'] = 'La ciudad es requerida.';
      if (!form.dirMunicipio.trim()) nuevosErrores['dirMunicipio'] = 'El municipio es requerido.';
      if (!form.dirExacta.trim()) nuevosErrores['dirExacta'] = 'La dirección exacta es requerida.';
    }
    if (tab === 'requisitos') {
      Object.entries(form.requisitos).forEach(([id, r]) => {
        if (r.cumplido && r.fechaCumplido.trim()) {
          const parsed = parsearFechaUsuario(r.fechaCumplido);
          if (!parsed) {
            nuevosErrores[`req-fecha-${id}`] = 'Use el formato DD-MM-AA o DD-Mes-AA (ej: 08-Junio-26).';
          }
        }
      });
    }
    if (tab === 'datos_eclesiasticos') {
      const cursadoObrerosCheck = form.requisitos[5]?.cumplido;
      if (!cursadoObrerosCheck && (form.estadoLiderazgo === 'Lider' || form.estadoLiderazgo === 'Mentor' || form.estadoLiderazgo === 'Lider_Apoyo')) {
        nuevosErrores['estadoLiderazgo'] = 'No puede ser Líder, Mentor ni Líder de Apoyo si no ha cursado la Escuela de Obreros.';
      }
      // Líder / mentor requerido
      if (!form.liderNombres.trim()) nuevosErrores['liderNombres'] = 'El nombre del líder / mentor es obligatorio.';
      if (!form.liderApellidos.trim()) nuevosErrores['liderApellidos'] = 'Los apellidos del líder / mentor son obligatorios.';
      if (!form.liderTelefono.trim()) nuevosErrores['liderTelefono'] = 'El teléfono del líder / mentor es obligatorio.';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const siguienteTab = () => {
    const tabsVisibles = [
      ...TABS_SOLICITUD,
      ...(esEdicion ? [{ id: 'historial' as TabSolicitud, etiqueta: 'Historial', icono: 'history' }] : []),
    ];
    const idx = tabsVisibles.findIndex(t => t.id === tabActiva);
    if (idx < tabsVisibles.length - 1 && validarTab(tabActiva)) {
      setTabActiva(tabsVisibles[idx + 1].id);
    }
  };

  const tabAnterior = () => {
    const tabsVisibles = [
      ...TABS_SOLICITUD,
      ...(esEdicion ? [{ id: 'historial' as TabSolicitud, etiqueta: 'Historial', icono: 'history' }] : []),
    ];
    const idx = tabsVisibles.findIndex(t => t.id === tabActiva);
    if (idx > 0) setTabActiva(tabsVisibles[idx - 1].id);
  };

  const guardar = async () => {
    if (!validarTab(tabActiva)) return;
    if (tabActiva !== 'datos_eclesiasticos' && tabActiva !== 'historial') { siguienteTab(); return; }

    setCargando(true);
    try {
      let finalIdPersona = form.idPersona;

      // Si no es edición y no se ha seleccionado una persona existente, registrar una nueva persona primero
      if (!esEdicion && !finalIdPersona) {
        if (!form.nombreCandidato.trim()) {
          toast.error('Debe ingresar el nombre del candidato.');
          setCargando(false);
          return;
        }

        const nombresArray = form.nombreCandidato.trim().split(/\s+/);
        const nombres = nombresArray[0] || 'Candidato';
        const apellidos = nombresArray.slice(1).join(' ') || 'Temp';

        try {
          const nuevaPersona = await crearPersona({
            nombres,
            apellidos,
            telefono: form.telefonoCandidato.trim() || undefined,
            sexo: (form.sexoCandidato as any) || undefined,
            cedula: form.cedulaCandidato.trim() || undefined,
          });
          finalIdPersona = nuevaPersona.idPersona;
        } catch (err: any) {
          throw new Error(err instanceof Error ? err.message : 'Error al registrar candidato en el sistema.');
        }
      } else if (finalIdPersona) {
        // Persona existente vinculada (ya sea nueva solicitud o edición de una existente).
        // Si el usuario completó/modificó datos que estaban vacíos en la base de datos (como sexo o cédula), o actualizó el teléfono, actualizamos la persona.
        const personaOriginal = personas.find((p) => p.idPersona === finalIdPersona);
        if (personaOriginal) {
          const sexoNuevo = form.sexoCandidato || null;
          const cedulaNueva = form.cedulaCandidato.trim() || null;
          const telefonoNuevo = form.telefonoCandidato.trim() || null;

          const cambioSexo = sexoNuevo && (sexoNuevo !== personaOriginal.sexo);
          const cambioCedula = cedulaNueva && (cedulaNueva !== personaOriginal.cedula);
          const cambioTelefono = telefonoNuevo && (telefonoNuevo !== personaOriginal.telefono);

          if (cambioSexo || cambioCedula || cambioTelefono) {
            try {
              await actualizarPersona(finalIdPersona, {
                nombres: personaOriginal.nombres,
                apellidos: personaOriginal.apellidos,
                sexo: (sexoNuevo || personaOriginal.sexo) as any,
                cedula: cedulaNueva || personaOriginal.cedula || undefined,
                telefono: telefonoNuevo || personaOriginal.telefono || undefined,
              });
            } catch (err) {
              console.error('Error al actualizar datos de persona vinculada:', err);
            }
          }
        }
      }

      // No se necesita mapeo: solo existen 'Soltero' y 'Casado'
      const mappedEstadoCivil = form.estadoCivil;

      const payload: DatosSolicitudNueva = {
        idPersona: finalIdPersona ?? 0,
        idRolSolicitado: form.idRolSolicitado,
        notasStaff: form.notasStaff || undefined,
        estadoCivil: mappedEstadoCivil || undefined,
        condicionCivil: (form.condicionCivil || undefined) as any,
        nombreConyuge: form.nombreConyuge || undefined,
        tieneHijos: form.tieneHijos,
        numeroHijos: form.tieneHijos ? form.numeroHijos : undefined,
        direccion: `${form.dirExacta}, ${form.dirBarrio}, ${form.dirMunicipio}`.substring(0, 150),
        idRed: form.idRed ?? undefined,
        estadoLiderazgo: form.estadoLiderazgo || undefined,
        idMentorPropuesto: form.idMentorPropuesto ?? undefined,
        circuloAmistad: form.circuloAmistad || undefined,
        tiempoIglesiaMeses: form.tiempoIglesiaMeses ?? undefined,
        ministerioAdicional: form.ministerioAdicional || undefined,
        requisitos: Object.entries(form.requisitos).map(([id, r]) => ({
          idRequisito: Number(id),
          cumplido: r.cumplido,
          fechaCumplido: (r.cumplido && r.fechaCumplido) ? (parsearFechaUsuario(r.fechaCumplido) || undefined) : undefined,
          notas: r.notas || undefined,
        })),

        sexoCandidato: (form.sexoCandidato as any) || undefined,
        cedulaCandidato: form.cedulaCandidato || undefined,
        ocupacionCandidato: form.ocupacionCandidato || undefined,
        centroLaboralCandidato: form.centroLaboralCandidato || undefined,
        nivelAcademicoCandidato: (form.nivelAcademicoCandidato as any) || undefined,
        dirCiudad: form.dirCiudad || undefined,
        dirMunicipio: form.dirMunicipio || undefined,
        dirDistrito: form.dirDistrito || undefined,
        dirBarrio: form.dirBarrio || undefined,
        dirExacta: form.dirExacta || undefined,
        telCasa: form.telCasa || undefined,
        telOficina: form.telOficina || undefined,
        telClaro: form.telClaro || undefined,
        telMovistar: form.telMovistar || undefined,
        conyugeOcupacion: form.conyugeOcupacion || undefined,
        conyugeCentroLaboral: form.conyugeCentroLaboral || undefined,
        bautizadoAgua: form.bautizadoAgua,
        fechaBautismo: form.fechaBautismo ? (parsearFechaUsuario(form.fechaBautismo) || undefined) : undefined,
        fechaBautismoPrecision: (form.fechaBautismoPrecision as any) || undefined,
        circuloAmistadDesde: form.circuloAmistadDesde ? (parsearFechaUsuario(form.circuloAmistadDesde) || undefined) : undefined,
        circuloAmistadPrecision: (form.circuloAmistadPrecision as any) || undefined,
        clasesBiblicasNinos: form.clasesBiblicasNinos,
        clasesBiblicasDetalle: form.clasesBiblicasDetalle || undefined,
        capacitacionEnsenanza: form.capacitacionEnsenanza,
        capacitacionDetalle: form.capacitacionDetalle || undefined,
        observacionesEspiritualesSol: form.observacionesEspiritualesSol || undefined,
        estadoOperativoCandidato: (form.estadoOperativoCandidato as any) || undefined,
        // Líder / mentor (texto libre)
        liderNombres: form.liderNombres || undefined,
        liderApellidos: form.liderApellidos || undefined,
        liderTelefono: form.liderTelefono || undefined,
        // Historial en otras iglesias
        asistioOtraIglesia: form.asistioOtraIglesia,
        nombreOtraIglesia: form.asistioOtraIglesia ? (form.nombreOtraIglesia || undefined) : undefined,
        denominacionOtraIglesia: form.asistioOtraIglesia ? (form.denominacionOtraIglesia as any || undefined) : undefined,
      };

      if (esEdicion && solicitudEditar) {
        await actualizarSolicitud(solicitudEditar.idSolicitud, payload);
      } else {
        await crearSolicitud(payload);
      }
      onRegistrado();
      onCerrar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar la solicitud.');
    } finally {
      setCargando(false);
    }
  };



  const tabsVisibles = [
    ...TABS_SOLICITUD,
    ...(esEdicion ? [{ id: 'historial' as TabSolicitud, etiqueta: 'Historial', icono: 'history' }] : []),
  ];

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !cargando) onCerrar(); }}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Cabecera */}
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-outline-variant/50">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_add</span>
              {esEdicion ? 'Editar Solicitud' : 'Nueva Solicitud de Ingreso'}
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Complete los datos del candidato en las pestañas siguientes.
            </p>
          </div>
          <button onClick={onCerrar} disabled={cargando}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
            aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs de navegación */}
        <div className="shrink-0 flex border-b border-outline-variant/50 px-6 overflow-x-auto bg-surface-bright">
          {tabsVisibles.map((tab, idx) => {
            const activa = tabActiva === tab.id;
            const completada = idx < tabsVisibles.findIndex(t => t.id === tabActiva);
            return (
              <button key={tab.id} onClick={() => setTabActiva(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-label-sm font-label-md border-b-2 transition-colors whitespace-nowrap ${
                  activa ? 'border-primary text-primary' : completada ? 'border-tertiary text-tertiary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}>
                <span className="material-symbols-outlined text-[18px]" style={completada ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {tab.icono}
                </span>
                {tab.etiqueta}
              </button>
            );
          })}
        </div>

        {/* Cuerpo scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5">


          {/* Tab 1: Identificación */}
          {tabActiva === 'identificacion' && (
            <div className="space-y-4">
              <h3 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person_search</span>
                Identificación del Candidato
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!esEdicion && (
                  <div className="sm:col-span-2 relative">
                    <label htmlFor="sol-busqueda-persona" className="block text-label-sm text-on-surface-variant mb-1 font-semibold">
                      Buscar Persona Existente en el Sistema <span className="text-on-surface-variant/50 font-normal">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">
                        search
                      </span>
                      <input
                        id="sol-busqueda-persona"
                        type="text"
                        value={busquedaPersona}
                        onChange={(e) => {
                          setBusquedaPersona(e.target.value);
                          setMostrarDropdownPersonas(true);
                        }}
                        onFocus={() => setMostrarDropdownPersonas(true)}
                        onBlur={() => setTimeout(() => setMostrarDropdownPersonas(false), 200)}
                        placeholder="Escriba el nombre, apellido o cédula..."
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-variant/40"
                      />
                    </div>
                    {mostrarDropdownPersonas && personasFiltradas.length > 0 && (
                      <ul className="absolute z-50 mt-1 w-full border border-outline-variant rounded-xl bg-surface-container-lowest shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                        {personasFiltradas.map((p) => (
                          <li key={p.idPersona}>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                vincularPersona(p);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-surface-container-high transition-colors flex flex-col gap-0.5"
                            >
                              <span className="text-label-md font-bold text-on-surface">
                                {p.nombres} {p.apellidos}
                              </span>
                              <span className="text-body-sm text-on-surface-variant/80">
                                {p.cedula ? `Cédula: ${p.cedula}` : 'Sin cédula'} • {p.telefono || 'Sin teléfono'}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {form.idPersona && !esEdicion && (
                  <div className="sm:col-span-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-2.5 text-body-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                      Persona seleccionada: {form.nombreCandidato} (ID: {form.idPersona})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          idPersona: null,
                          nombreCandidato: '',
                          telefonoCandidato: '',
                          telClaro: '',
                          sexoCandidato: '',
                          cedulaCandidato: '',
                        }));
                      }}
                      className="text-emerald-700 hover:text-emerald-950 font-bold underline text-[11px]"
                    >
                      Desvincular
                    </button>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label htmlFor="sol-nom" className="block text-label-sm text-on-surface-variant mb-1">
                    Nombre del Candidato <span className="text-error">*</span>
                  </label>
                  <input id="sol-nom" type="text" value={form.nombreCandidato} onChange={(e) => actualizarCampo('nombreCandidato', filtrarSoloLetras(e.target.value))}
                    placeholder="Escriba nombre completo del candidato"
                    readOnly={!!form.idPersona}
                    className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none ${errores['nombreCandidato'] ? 'border-error' : 'border-outline-variant'} ${form.idPersona ? 'opacity-70 cursor-not-allowed bg-surface-container-high' : ''}`} />
                  {errores['nombreCandidato'] && <p className="text-label-sm text-error mt-1">{errores['nombreCandidato']}</p>}

                  {form.nombreCandidato.trim().length >= 3 && !form.idPersona && (() => {
                    const query = form.nombreCandidato.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                    const personasSimilares = personas.filter(p => {
                      const nombreCompleto = `${p.nombres} ${p.apellidos}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                      return nombreCompleto.includes(query);
                    });
                    if (personasSimilares.length > 0) {
                      return (
                        <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-2.5 text-body-sm space-y-1">
                          <p className="font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-amber-700 font-bold">warning</span>
                            ¿Esta persona ya está registrada? (Selecciónela para evitar duplicados):
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {personasSimilares.slice(0, 3).map(p => (
                              <button
                                key={p.idPersona}
                                type="button"
                                onClick={() => vincularPersona(p)}
                                className="bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                              >
                                {p.nombres} {p.apellidos} ({p.cedula ? `Cédula: ${p.cedula}` : 'Sin cédula'})
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div>
                  <label htmlFor="sol-sex" className="block text-label-sm text-on-surface-variant mb-1">
                    Sexo <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select id="sol-sex" value={form.sexoCandidato} onChange={(e) => actualizarCampo('sexoCandidato', e.target.value)}
                      disabled={!!form.idPersona && !!personaSeleccionada?.sexo}
                      className={`w-full bg-surface-container-low border rounded-xl pl-4 pr-10 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none ${errores['sexoCandidato'] ? 'border-error' : 'border-outline-variant'} ${(form.idPersona && personaSeleccionada?.sexo) ? 'opacity-70 cursor-not-allowed bg-surface-container-high' : ''}`}>
                      <option value="">Seleccionar...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                  </div>
                  {errores['sexoCandidato'] && <p className="text-label-sm text-error mt-1">{errores['sexoCandidato']}</p>}
                </div>

                <div>
                  <label htmlFor="sol-ced" className="block text-label-sm text-on-surface-variant mb-1">
                    Cédula <span className="text-error">*</span>
                  </label>
                  <input id="sol-ced" type="text" value={form.cedulaCandidato} onChange={(e) => actualizarCampo('cedulaCandidato', e.target.value)}
                    placeholder="Ej: 001-000000-0000A"
                    readOnly={!!form.idPersona && !!personaSeleccionada?.cedula}
                    className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none ${errores['cedulaCandidato'] ? 'border-error' : 'border-outline-variant'} ${(form.idPersona && personaSeleccionada?.cedula) ? 'opacity-70 cursor-not-allowed bg-surface-container-high' : ''}`} />
                  {errores['cedulaCandidato'] && <p className="text-label-sm text-error mt-1">{errores['cedulaCandidato']}</p>}
                </div>

                <div className="hidden">
                  <label htmlFor="sol-rol" className="block text-label-sm text-on-surface-variant mb-1">
                    Rol Solicitado <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select id="sol-rol" value={form.idRolSolicitado} onChange={(e) => actualizarCampo('idRolSolicitado', Number(e.target.value))}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-10 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none">
                      {roles.filter(r => r.activo).map(r => <option key={r.idRol} value={r.idRol}>{r.nombreRol} (Nivel {r.nivelJerarquico})</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="sol-est-op" className="block text-label-sm text-on-surface-variant mb-1">
                    Estado Operativo Inicial
                  </label>
                  <div className="relative">
                    <select id="sol-est-op" value={form.estadoOperativoCandidato} onChange={(e) => actualizarCampo('estadoOperativoCandidato', e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-10 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none">
                      <option value="En_Formacion">En Formación</option>
                      <option value="Lider">Líder</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="sol-not" className="block text-label-sm text-on-surface-variant mb-1">Notas del Staff / Justificación</label>
                  <textarea id="sol-not" value={form.notasStaff} onChange={(e) => actualizarCampo('notasStaff', e.target.value)}
                    placeholder="Observaciones generales sobre la idoneidad..." rows={3}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Datos Personales */}
          {tabActiva === 'datos_personales' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  Teléfonos de Contacto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="sol-t-cl" className="block text-label-sm text-on-surface-variant mb-1">Tel. Claro / WhatsApp</label>
                    <input id="sol-t-cl" type="tel" value={form.telClaro} onChange={(e) => {
                      const formatted = formatearTelefono(e.target.value, form.telClaro);
                      actualizarCampo('telClaro', formatted);
                      if (!form.telefonoCandidato) actualizarCampo('telefonoCandidato', formatted);
                    }} placeholder="Ej: 8888-8888" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label htmlFor="sol-t-mv" className="block text-label-sm text-on-surface-variant mb-1">Tel. Movistar</label>
                    <input id="sol-t-mv" type="tel" value={form.telMovistar} onChange={(e) => actualizarCampo('telMovistar', formatearTelefono(e.target.value, form.telMovistar))} placeholder="Ej: 7777-7777" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label htmlFor="sol-t-cs" className="block text-label-sm text-on-surface-variant mb-1">Tel. Casa</label>
                    <input id="sol-t-cs" type="tel" value={form.telCasa} onChange={(e) => actualizarCampo('telCasa', formatearTelefono(e.target.value, form.telCasa))} placeholder="Ej: 2222-2222" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label htmlFor="sol-t-of" className="block text-label-sm text-on-surface-variant mb-1">Tel. Oficina</label>
                    <input id="sol-t-of" type="tel" value={form.telOficina} onChange={(e) => actualizarCampo('telOficina', formatearTelefono(e.target.value, form.telOficina))} placeholder="Ej: 2222-0000" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px]">home</span>
                  Dirección de Residencia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="sol-d-ci" className="block text-label-sm text-on-surface-variant mb-1">Ciudad / Departamento <span className="text-error">*</span></label>
                    <input id="sol-d-ci" type="text" value={form.dirCiudad} onChange={(e) => actualizarCampo('dirCiudad', e.target.value)} placeholder="Ej: Managua" className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary ${errores['dirCiudad'] ? 'border-error' : 'border-outline-variant'}`} />
                    {errores['dirCiudad'] && <p className="text-label-sm text-error mt-1">{errores['dirCiudad']}</p>}
                  </div>
                  <div>
                    <label htmlFor="sol-d-mu" className="block text-label-sm text-on-surface-variant mb-1">Municipio <span className="text-error">*</span></label>
                    <input id="sol-d-mu" type="text" value={form.dirMunicipio} onChange={(e) => actualizarCampo('dirMunicipio', e.target.value)} placeholder="Ej: Managua" className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary ${errores['dirMunicipio'] ? 'border-error' : 'border-outline-variant'}`} />
                    {errores['dirMunicipio'] && <p className="text-label-sm text-error mt-1">{errores['dirMunicipio']}</p>}
                  </div>
                  <div>
                    <label htmlFor="sol-d-di" className="block text-label-sm text-on-surface-variant mb-1">Distrito</label>
                    <input id="sol-d-di" type="text" value={form.dirDistrito} onChange={(e) => actualizarCampo('dirDistrito', e.target.value)} placeholder="Ej: Distrito I" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="sol-d-ba" className="block text-label-sm text-on-surface-variant mb-1">Barrio / Residencial</label>
                    <input id="sol-d-ba" type="text" value={form.dirBarrio} onChange={(e) => actualizarCampo('dirBarrio', e.target.value)} placeholder="Ej: Reparto San Juan" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="sm:col-span-4">
                    <label htmlFor="sol-d-ex" className="block text-label-sm text-on-surface-variant mb-1">Dirección Exacta <span className="text-error">*</span></label>
                    <textarea id="sol-d-ex" value={form.dirExacta} onChange={(e) => actualizarCampo('dirExacta', e.target.value)} placeholder="Ej: De la rotonda 2c al lago..." rows={2} className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none ${errores['dirExacta'] ? 'border-error' : 'border-outline-variant'}`} />
                    {errores['dirExacta'] && <p className="text-label-sm text-error mt-1">{errores['dirExacta']}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px]">family_restroom</span>
                  Aspectos Familiares y Laborales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-label-sm text-on-surface-variant mb-2">Estado Civil</label>
                    {/* Selección principal: dos botones */}
                    <div className="flex gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          actualizarCampo('estadoCivil', 'Soltero');
                          actualizarCampo('condicionCivil', 'Ninguna');
                          actualizarCampo('nombreConyuge', '');
                          actualizarCampo('conyugeOcupacion', '');
                          actualizarCampo('conyugeCentroLaboral', '');
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl border text-label-md font-medium transition-all ${
                          form.estadoCivil === 'Soltero'
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                        }`}
                      >
                        Soltero/a
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          actualizarCampo('estadoCivil', 'Casado');
                          actualizarCampo('condicionCivil', 'Primer_Matrimonio');
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl border text-label-md font-medium transition-all ${
                          form.estadoCivil === 'Casado'
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                        }`}
                      >
                        Casado/a
                      </button>
                    </div>
                    {/* Condición adicional — solo visible si es Soltero */}
                    {form.estadoCivil === 'Soltero' && (
                      <div className="relative">
                        <select
                          id="sol-cond-civil"
                          value={form.condicionCivil}
                          onChange={(e) => actualizarCampo('condicionCivil', e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-10 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                          <option value="Ninguna">Ninguna (nunca casado/a)</option>
                          <option value="Divorciado_1er_Matrimonio">Divorciado/a – 1er matrimonio</option>
                          <option value="Divorciado_2do_Matrimonio">Divorciado/a – 2do matrimonio</option>
                          <option value="Divorciado_3er_Matrimonio">Divorciado/a – 3er matrimonio</option>
                          <option value="Viudo">Viudo/a</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    )}
                    {/* Condición adicional — solo visible si es Casado */}
                    {form.estadoCivil === 'Casado' && (
                      <div className="relative">
                        <select
                          id="sol-cond-civil-casado"
                          value={form.condicionCivil}
                          onChange={(e) => actualizarCampo('condicionCivil', e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-10 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                          <option value="Primer_Matrimonio">1er Matrimonio</option>
                          <option value="Segundo_Matrimonio">2do Matrimonio</option>
                          <option value="Tercer_Matrimonio">3er Matrimonio</option>
                          <option value="Otro_Matrimonio">4to Matrimonio o más (n)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    )}
                  </div>

                  {/* Conyuge — solo si está Casado */}
                  {form.estadoCivil === 'Casado' && (
                    <div className="sm:col-span-2">
                      <label htmlFor="sol-cony" className="block text-label-sm text-on-surface-variant mb-1">Nombre del Cónyuge <span className="text-error">*</span></label>
                      <input id="sol-cony" type="text" value={form.nombreConyuge} onChange={(e) => actualizarCampo('nombreConyuge', filtrarSoloLetras(e.target.value))} placeholder="Nombre completo" className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary ${errores['nombreConyuge'] ? 'border-error' : 'border-outline-variant'}`} />
                      {errores['nombreConyuge'] && <p className="text-label-sm text-error mt-1">{errores['nombreConyuge']}</p>}
                    </div>
                  )}

                  {form.estadoCivil === 'Casado' && (
                    <>
                      <div>
                        <label htmlFor="sol-cony-oc" className="block text-label-sm text-on-surface-variant mb-1">Ocupación del Cónyuge</label>
                        <input id="sol-cony-oc" type="text" value={form.conyugeOcupacion} onChange={(e) => actualizarCampo('conyugeOcupacion', e.target.value)} placeholder="Ocupación" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="sol-cony-lab" className="block text-label-sm text-on-surface-variant mb-1">Centro Laboral del Cónyuge</label>
                        <input id="sol-cony-lab" type="text" value={form.conyugeCentroLaboral} onChange={(e) => actualizarCampo('conyugeCentroLaboral', e.target.value)} placeholder="Empresa o lugar de trabajo" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </>
                  )}

                  {/* ¿Tiene hijos? — Ocultar si es Soltero y condicion es Ninguna */}
                  {!(form.estadoCivil === 'Soltero' && form.condicionCivil === 'Ninguna') && (
                    <>
                      <div className="flex items-center pt-8">
                        <label className="flex items-center gap-2.5 text-label-md text-on-surface font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.tieneHijos}
                            onChange={(e) => {
                              actualizarCampo('tieneHijos', e.target.checked);
                              if (!e.target.checked) actualizarCampo('numeroHijos', 0);
                            }}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                          ¿Tiene hijos?
                        </label>
                      </div>

                      {form.tieneHijos && (
                        <div>
                          <label htmlFor="sol-nh" className="block text-label-sm text-on-surface-variant mb-1">
                            Número de Hijos <span className="text-error">*</span>
                          </label>
                          <input
                            id="sol-nh"
                            type="number"
                            min={1}
                            value={form.numeroHijos}
                            onChange={(e) => actualizarCampo('numeroHijos', Number(e.target.value))}
                            className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary ${
                              errores['numeroHijos'] ? 'border-error' : 'border-outline-variant'
                            }`}
                          />
                          {errores['numeroHijos'] && <p className="text-label-sm text-error mt-1">{errores['numeroHijos']}</p>}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label htmlFor="sol-ocup" className="block text-label-sm text-on-surface-variant mb-1">Ocupación / Profesión</label>
                    <input id="sol-ocup" type="text" value={form.ocupacionCandidato} onChange={(e) => actualizarCampo('ocupacionCandidato', e.target.value)} placeholder="Ej: Maestro, Contador" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="sol-cent-lab" className="block text-label-sm text-on-surface-variant mb-1">Centro Laboral</label>
                    <input id="sol-cent-lab" type="text" value={form.centroLaboralCandidato} onChange={(e) => actualizarCampo('centroLaboralCandidato', e.target.value)} placeholder="Nombre de la empresa" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="sol-na" className="block text-label-sm text-on-surface-variant mb-1">Nivel Académico</label>
                    <div className="relative">
                      <select id="sol-na" value={form.nivelAcademicoCandidato} onChange={(e) => actualizarCampo('nivelAcademicoCandidato', e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-10 py-3 text-body-md focus:outline-none appearance-none">
                        <option value="">Seleccionar...</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Nivel_Tecnico">Técnico</option>
                        <option value="Licenciatura">Licenciatura / Universitario</option>
                        <option value="Ingenieria">Ingeniería</option>
                        <option value="Postgrado">Postgrado</option>
                        <option value="Maestria">Maestría</option>
                        <option value="Doctorado">Doctorado</option>
                        <option value="Otro">Otro / Ninguno</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Datos Iglesia */}
          {tabActiva === 'datos_eclesiasticos' && (
            <div className="space-y-6">
              <h3 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px]">church</span>
                Datos Iglesia del Candidato
              </h3>

              {/* Bloque Red */}
              <div className="bg-surface-container-low/30 border border-outline-variant/30 rounded-2xl p-5 space-y-4">
                <h4 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">hub</span>
                  Red Eclesiástica
                </h4>
                {!form.requisitos[7]?.cumplido && (
                  <p className="text-body-sm text-on-surface-variant bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                    Marque el requisito "Pertenecer a Círculo de Amistad" en la pestaña Crecimiento para habilitar la selección de red.
                  </p>
                )}
                <div className="max-w-md">
                  <label htmlFor="sol-red" className="block text-label-sm text-on-surface-variant mb-1">Red Eclesiástica</label>
                  <div className="relative">
                    <select id="sol-red" value={form.idRed ?? ''} onChange={(e) => actualizarCampo('idRed', e.target.value ? Number(e.target.value) : null)}
                      disabled={!form.requisitos[7]?.cumplido}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-10 py-3 text-body-md focus:outline-none appearance-none disabled:opacity-50">
                      <option value="">Seleccionar red...</option>
                      {redes.filter(r => r.activo).map(r => <option key={r.idRed} value={r.idRed}>{r.nombre}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Líder / Mentor — campos de texto libre */}
              <div className="bg-surface-container-low/30 border border-outline-variant/30 rounded-2xl p-5 space-y-4">
                <h4 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">supervisor_account</span>
                  Líder / Mentor Directo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="sol-lider-nom" className="block text-label-sm text-on-surface-variant mb-1">
                      Nombres <span className="text-error">*</span>
                    </label>
                    <input
                      id="sol-lider-nom"
                      type="text"
                      value={form.liderNombres}
                      onChange={(e) => actualizarCampo('liderNombres', filtrarSoloLetras(e.target.value))}
                      placeholder="Nombres del líder o mentor"
                      className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary ${errores['liderNombres'] ? 'border-error' : 'border-outline-variant'}`}
                    />
                    {errores['liderNombres'] && <p className="text-label-sm text-error mt-1">{errores['liderNombres']}</p>}
                  </div>
                  <div>
                    <label htmlFor="sol-lider-ape" className="block text-label-sm text-on-surface-variant mb-1">
                      Apellidos <span className="text-error">*</span>
                    </label>
                    <input
                      id="sol-lider-ape"
                      type="text"
                      value={form.liderApellidos}
                      onChange={(e) => actualizarCampo('liderApellidos', filtrarSoloLetras(e.target.value))}
                      placeholder="Apellidos del líder o mentor"
                      className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary ${errores['liderApellidos'] ? 'border-error' : 'border-outline-variant'}`}
                    />
                    {errores['liderApellidos'] && <p className="text-label-sm text-error mt-1">{errores['liderApellidos']}</p>}
                  </div>
                  <div>
                    <label htmlFor="sol-lider-tel" className="block text-label-sm text-on-surface-variant mb-1">
                      Teléfono <span className="text-error">*</span>
                    </label>
                    <input
                      id="sol-lider-tel"
                      type="tel"
                      value={form.liderTelefono}
                      onChange={(e) => actualizarCampo('liderTelefono', formatearTelefono(e.target.value, form.liderTelefono))}
                      placeholder="Ej: 8888-8888"
                      className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary ${errores['liderTelefono'] ? 'border-error' : 'border-outline-variant'}`}
                    />
                    {errores['liderTelefono'] && <p className="text-label-sm text-error mt-1">{errores['liderTelefono']}</p>}
                  </div>
                </div>
              </div>

              {/* Historial en otras iglesias */}
              <div className="bg-surface-container-low/30 border border-outline-variant/30 rounded-2xl p-5 space-y-4">
                <h4 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">church</span>
                  Historial en Iglesias
                </h4>
                <label className="flex items-center gap-2.5 text-label-md text-on-surface font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.asistioOtraIglesia}
                    onChange={(e) => {
                      actualizarCampo('asistioOtraIglesia', e.target.checked);
                      if (!e.target.checked) {
                        actualizarCampo('nombreOtraIglesia', '');
                        actualizarCampo('denominacionOtraIglesia', '');
                      }
                    }}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  ¿Ha asistido a otra iglesia antes?
                </label>
                {form.asistioOtraIglesia && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sol-otra-iglesia" className="block text-label-sm text-on-surface-variant mb-1">
                        Nombre de la iglesia anterior
                      </label>
                      <input
                        id="sol-otra-iglesia"
                        type="text"
                        value={form.nombreOtraIglesia}
                        onChange={(e) => actualizarCampo('nombreOtraIglesia', e.target.value)}
                        placeholder="Ej: Iglesia Cristiana Central"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="sol-denominacion-otra-iglesia" className="block text-label-sm text-on-surface-variant mb-1">
                        Denominación
                      </label>
                      <div className="relative">
                        <select
                          id="sol-denominacion-otra-iglesia"
                          value={form.denominacionOtraIglesia}
                          onChange={(e) => actualizarCampo('denominacionOtraIglesia', e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-10 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Pentecostal">Pentecostal</option>
                          <option value="Evangelico">Evangélico</option>
                          <option value="Católico">Católico</option>
                          <option value="Testigo de Jehová">Testigo de Jehová</option>
                          <option value="Otro">Otro</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Liderazgo, Clases de Niños, Capacitación y Otros */}
              <div className="bg-surface-container-low/30 border border-outline-variant/30 rounded-2xl p-5 space-y-4">
                <h4 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  Estado Operativo, Liderazgo y Competencias
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sol-el" className="block text-label-sm text-on-surface-variant mb-1">Estado de Liderazgo</label>
                    <div className="relative">
                      <select id="sol-el" value={form.estadoLiderazgo} onChange={(e) => actualizarCampo('estadoLiderazgo', e.target.value)}
                        className={`w-full bg-surface-container-low border rounded-xl pl-4 pr-10 py-3 text-body-md focus:outline-none appearance-none ${errores['estadoLiderazgo'] ? 'border-error' : 'border-outline-variant'}`}>
                        <option value="">Seleccionar...</option>
                        <option value="Gap">Gap</option>
                        <option value="Miembro">Miembro</option>
                        {form.requisitos[5]?.cumplido && (
                          <>
                            <option value="Lider">Líder</option>
                            <option value="Mentor">Mentor</option>
                            <option value="Lider_Apoyo">Líder Apoyo</option>
                          </>
                        )}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                    </div>
                    {errores['estadoLiderazgo'] && <p className="text-label-sm text-error mt-1">{errores['estadoLiderazgo']}</p>}
                  </div>

                  <div>
                    <label htmlFor="sol-tiemp" className="block text-label-sm text-on-surface-variant mb-1">Tiempo en la Iglesia (meses)</label>
                    <input id="sol-tiemp" type="number" min={0} value={form.tiempoIglesiaMeses} onChange={(e) => actualizarCampo('tiempoIglesiaMeses', Number(e.target.value))} className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-label-md text-on-surface font-medium cursor-pointer">
                      <input type="checkbox" checked={form.clasesBiblicasNinos} onChange={(e) => actualizarCampo('clasesBiblicasNinos', e.target.checked)} className="w-4 h-4 accent-primary rounded cursor-pointer" />
                      ¿Ha impartido clases bíblicas a niños?
                    </label>
                    {form.clasesBiblicasNinos && (
                      <textarea value={form.clasesBiblicasDetalle} onChange={(e) => actualizarCampo('clasesBiblicasDetalle', e.target.value)}
                        placeholder="Detalle experiencia, edades, materias..." rows={2} className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-body-sm focus:outline-none resize-none" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-label-md text-on-surface font-medium cursor-pointer">
                      <input type="checkbox" checked={form.capacitacionEnsenanza} onChange={(e) => actualizarCampo('capacitacionEnsenanza', e.target.checked)} className="w-4 h-4 accent-primary rounded cursor-pointer" />
                      ¿Tiene capacitación en pedagogía / enseñanza?
                    </label>
                    {form.capacitacionEnsenanza && (
                      <textarea value={form.capacitacionDetalle} onChange={(e) => actualizarCampo('capacitacionDetalle', e.target.value)}
                        placeholder="Detalle cursos, talleres o títulos..." rows={2} className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-body-sm focus:outline-none resize-none" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2">
                  <div>
                    <label htmlFor="sol-min" className="block text-label-sm text-on-surface-variant mb-1">Ministerios Anteriores / Adicionales</label>
                    <input id="sol-min" type="text" value={form.ministerioAdicional} onChange={(e) => actualizarCampo('ministerioAdicional', e.target.value)} placeholder="Ej: Ujieres, Escuela de Padres, Alabanza..." className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="sol-obs-esp" className="block text-label-sm text-on-surface-variant mb-1">Observaciones Espirituales del Evaluador</label>
                    <textarea id="sol-obs-esp" value={form.observacionesEspiritualesSol} onChange={(e) => actualizarCampo('observacionesEspiritualesSol', e.target.value)} placeholder="Notas sobre el carácter espiritual del candidato..." rows={2} className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:outline-none resize-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Requisitos */}
          {tabActiva === 'requisitos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">checklist</span>
                  Checklist de Crecimiento
                </h3>
                {reqObligatoriosPendientes.length > 0 && (
                  <span className="text-label-sm text-error font-semibold">
                    {reqObligatoriosPendientes.length} obligatorio(s) pendiente(s)
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {requisitosFiltrados.map((req) => {
                  const r = form.requisitos[req.idRequisito] ?? { cumplido: false, fechaCumplido: '', notas: '' };
                  return (
                    <div key={req.idRequisito} className={`border rounded-xl p-4 transition-all ${r.cumplido ? 'border-tertiary/30 bg-tertiary/5' : req.obligatorio ? 'border-primary/30 bg-primary/5' : 'border-outline-variant/30'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-label-md font-label-md text-on-surface">{req.nombre}</span>
                            {req.obligatorio && (
                              <span className="text-[10px] font-bold uppercase bg-error-container text-error px-1.5 py-0.5 rounded-full">Obligatorio</span>
                            )}
                            <span className="text-[11px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-full">{req.tipo}</span>
                          </div>
                          {req.descripcion && <p className="text-body-sm text-on-surface-variant mt-1">{req.descripcion}</p>}
                        </div>
                        <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                          <input type="checkbox" checked={r.cumplido}
                            onChange={(e) => actualizarRequisito(req.idRequisito, 'cumplido', e.target.checked)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer" />
                          <span className="text-label-sm text-on-surface-variant font-medium">Cumplido</span>
                        </label>
                      </div>
                       {r.cumplido && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-outline-variant/30">
                          <div>
                            <label className="block text-label-sm text-on-surface-variant mb-1 font-semibold">Fecha de cumplimiento</label>
                            <input type="text" value={r.fechaCumplido ?? ''}
                              onChange={(e) => actualizarRequisito(req.idRequisito, 'fechaCumplido', e.target.value)}
                              placeholder="DD-MM-AA o DD-Mes-AA (ej: 08-Junio-26)"
                              className={`w-full bg-surface-container-lowest border rounded-lg px-3 py-2 text-body-sm focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none ${errores[`req-fecha-${req.idRequisito}`] ? 'border-error' : 'border-outline-variant'}`} />
                            {errores[`req-fecha-${req.idRequisito}`] && <p className="text-label-sm text-error mt-1">{errores[`req-fecha-${req.idRequisito}`]}</p>}
                          </div>
                          <div>
                            <label className="block text-label-sm text-on-surface-variant mb-1">Notas / Evidencia</label>
                            <input type="text" value={r.notas ?? ''}
                              onChange={(e) => actualizarRequisito(req.idRequisito, 'notas', e.target.value)}
                              placeholder="Ej: Diploma verificado, carta de pastor..."
                              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 5: Historial */}
          {tabActiva === 'historial' && (
            <div className="space-y-4">
              <h3 className="text-label-md font-label-md text-primary uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">history</span>
                Historial de Cambios de Estado
              </h3>
              {cargandoHistorial ? (
                <div className="space-y-3 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-surface-container-low rounded-xl" />
                  ))}
                </div>
              ) : historial.length === 0 ? (
                <div className="text-center py-8 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                  <p className="text-body-md text-on-surface-variant">Sin movimientos de estado registrados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historial.map((item, idx) => {
                    const esUltimo = idx === historial.length - 1;
                    return (
                      <div key={item.idHistorial} className="flex gap-3 relative pb-4 last:pb-0">
                        {!esUltimo && (
                          <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-outline-variant/30" />
                        )}
                        <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 z-10">
                          <span className="material-symbols-outlined text-[12px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>
                        </div>
                        <div className="flex-1 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-body-md text-on-surface">
                              Cambió a: <span className="font-bold text-primary">{item.estadoNuevo}</span>
                            </p>
                            <span className="text-body-sm text-on-surface-variant font-medium">
                              {new Date(item.fechaCambio).toLocaleDateString('es-ES')} {new Date(item.fechaCambio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {item.estadoAnterior && (
                            <p className="text-body-sm text-on-surface-variant mt-0.5">Estado previo: {item.estadoAnterior}</p>
                          )}
                          {item.notas && (
                            <div className="bg-surface-container-lowest p-3 rounded-lg border-l-4 border-primary mt-2">
                              <p className="text-body-sm text-on-surface whitespace-pre-line font-serif italic">"{item.notas}"</p>
                            </div>
                          )}
                          <p className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-2">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            Modificado por: <strong>{item.cambiadoPor || `Operador ID: ${item.idCambiadoPor}`}</strong>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-outline-variant/50 bg-surface-bright">
          <button onClick={tabAnterior} disabled={tabActiva === 'identificacion' || cargando}
            className="border border-outline-variant text-on-surface-variant rounded-xl px-5 py-2.5 font-label-md hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Anterior
          </button>
          <div className="flex items-center gap-3">
            {(tabActiva === 'requisitos' || tabActiva === 'datos_eclesiasticos') && reqObligatoriosPendientes.length > 0 && (
              <span className="text-label-sm text-error mr-2">Complete los requisitos obligatorios</span>
            )}



            <button onClick={guardar} disabled={cargando}
              className="flex items-center gap-2 bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60">
              {cargando ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                  Guardando...
                </>
              ) : tabActiva === 'datos_eclesiasticos' || tabActiva === 'historial' ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {esEdicion ? 'Guardar Cambios' : 'Registrar Solicitud'}
                </>
              ) : (
                <>
                  Siguiente
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
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
      render: (s) => (
        <span className="text-body-sm text-on-surface-variant">
          {s.reqCumplidos}/{s.reqTotal} obligatorios
        </span>
      ),
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
    {
      id: 'acciones_ingreso',
      encabezado: 'Acciones de Ingreso',
      render: (s) => {
        if (s.estado !== 'Pendiente' || !esCoordinador) {
          return <span className="text-on-surface-variant/40">-</span>;
        }
        return (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleAprobarDirecto(s)}
              className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-sm font-bold flex items-center gap-1 hover:bg-primary/95 active:scale-95 transition-all shadow-sm"
              title="Aprobar"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Aprobar
            </button>
            <button
              onClick={() => handleRechazarDirecto(s)}
              className="bg-error text-on-error px-3 py-1.5 rounded-lg text-label-sm font-bold flex items-center gap-1 hover:bg-error/95 active:scale-95 transition-all shadow-sm"
              title="Rechazar"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Rechazar
            </button>
          </div>
        );
      },
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
