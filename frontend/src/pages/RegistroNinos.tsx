// RegistroNinos.tsx — Página de Ingreso de Niños (MVP-01 + MVP-03)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { filtrarSoloLetras, formatearTelefono } from '../services/validacionEntrada';
import LayoutPrincipal from '../components/LayoutPrincipal';
import ModalExpedienteNino from '../components/ModalExpedienteNino';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import ModalConfirmar from '../components/ModalConfirmar';
import { toast } from 'react-hot-toast';
import {
  registrarNinoConPadres,
  actualizarNino,
  eliminarNino,
  listarNinosIngreso,
  obtenerNinoCompleto,
  crearTutorYVincular,
  actualizarTutor,
  listarTutoresPorNino,
  listarContactos,
  vincularTutorExistente,
  type DatosNinoConPadres,
  type DatosPadreNuevo,
  type NinoIngresoApi,
  type NinoCompletoApi,
  type TutorApi,
  type ContactoGlobalApi,
} from '../services/servicioApi';
import { parsearFechaUsuario, formatearFechaConMesTexto, calcularEdad, fechaLocalHoy, dateToLocalString } from '../services/fechaUtils';

interface CampoPadre extends DatosPadreNuevo {
  id: number;
}

interface FormularioNino {
  nombres:                string;
  apellidos:              string;
  fechaNacimiento:        string;
  observacionesGenerales: string;
  sexo:                   string;
  activo:                 boolean;
  version?:               number;
}

const formularioVacio: FormularioNino = {
  nombres:                '',
  apellidos:              '',
  fechaNacimiento:        '',
  observacionesGenerales: '',
  sexo:                   '',
  activo:                 true,
  version:                undefined,
};

const padreVacio = (id: number): CampoPadre => ({
  id,
  nombres:   '',
  apellidos: '',
  telefono:  '',
});

const obtenerIniciales = (nombreCompleto: string): string =>
  nombreCompleto
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase();

const formatearHora = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
};

const COLORES_AVATAR = [
  'bg-primary-fixed-dim text-on-primary-fixed',
  'bg-secondary-fixed-dim text-on-secondary-fixed',
  'bg-surface-variant text-on-surface',
  'bg-tertiary-fixed-dim text-on-tertiary-fixed',
];

type TabActiva = 'datos' | 'tutor' | 'expediente';

interface PropsModalRegistro {
  abierto:        boolean;
  registroEditar?: (NinoIngresoApi & { datosCompletos?: NinoCompletoApi }) | null;
  onCerrar:       () => void;
  onRegistrado:   () => void;
  soloLectura?:   boolean;
}

const ModalRegistroNino: React.FC<PropsModalRegistro> = ({
  abierto,
  registroEditar,
  onCerrar,
  onRegistrado,
  soloLectura = false,
}) => {
  const [tabActiva, setTabActiva] = useState<TabActiva>('datos');
  const [formulario, setFormulario]   = useState<FormularioNino>(formularioVacio);
  const [padres, setPadres]           = useState<CampoPadre[]>([padreVacio(1)]);
  const [cargando, setCargando]       = useState(false);
  const [errores, setErrores]         = useState<Record<string, string>>({});
  const [expedienteAbierto, setExpedienteAbierto] = useState(false);
  const [tutoresExistentes, setTutoresExistentes] = useState<TutorApi[]>([]);
  const [tutorEditandoId, setTutorEditandoId] = useState<number | null>(null);
  const [nuevoTutorNombre, setNuevoTutorNombre] = useState('');
  const [nuevoTutorApellidos, setNuevoTutorApellidos] = useState('');
  const [nuevoTutorTelefono, setNuevoTutorTelefono] = useState('');
  const [nuevoTutorTipo, setNuevoTutorTipo] = useState('Padre/Madre');
  const [tutoresSistema, setTutoresSistema] = useState<ContactoGlobalApi[]>([]);
  const [tutorSeleccionadoId, setTutorSeleccionadoId] = useState('');
  const [busquedaTutor, setBusquedaTutor] = useState('');
  const [mostrarDropdownTutores, setMostrarDropdownTutores] = useState(false);

  const esEdicion = !!registroEditar;

  const tutoresFiltrados = useMemo(() => {
    if (!busquedaTutor.trim()) return tutoresSistema;
    const q = busquedaTutor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return tutoresSistema.filter(t =>
      `${t.nombres} ${t.apellidos}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q) ||
      (t.telefono && t.telefono.includes(busquedaTutor))
    );
  }, [tutoresSistema, busquedaTutor]);

  useEffect(() => {
    if (abierto) {
      const datosCompletos = (registroEditar as unknown as { datosCompletos?: NinoCompletoApi })?.datosCompletos;
      if (datosCompletos) {
        const fecha = datosCompletos.fechaNacimiento
          ? formatearFechaConMesTexto(datosCompletos.fechaNacimiento)
          : '';
        setFormulario({
          nombres:                datosCompletos.nombres,
          apellidos:              datosCompletos.apellidos,
          fechaNacimiento:        fecha,
          observacionesGenerales: datosCompletos.observacionesGenerales ?? '',
          sexo:                   datosCompletos.sexo ?? '',
          activo:                 datosCompletos.activo ?? true,
          version:                datosCompletos.version,
        });
        if (datosCompletos.padres.length > 0) {
          const padresCargados = datosCompletos.padres.map((p, i) => ({
            id: i + 1,
            nombres: p.nombres,
            apellidos: p.apellidos,
            telefono: p.telefono,
          }));
          setPadres(padresCargados);
        } else {
          setPadres([padreVacio(1)]);
        }
      } else {
        setFormulario(formularioVacio);
        setPadres([padreVacio(1)]);
      }
      setTabActiva('datos');
      setErrores({});
      setTutorEditandoId(null);
      setNuevoTutorNombre('');
      setNuevoTutorApellidos('');
      setNuevoTutorTelefono('');
      setNuevoTutorTipo('Padre/Madre');
      setTutorSeleccionadoId('');
      setBusquedaTutor('');
      setMostrarDropdownTutores(false);

      // Cargar todos los tutores del sistema para selección
      listarContactos()
        .then((tutores) => setTutoresSistema(tutores))
        .catch(() => setTutoresSistema([]));
    }
  }, [abierto, registroEditar]);

  useEffect(() => {
    const cargarTutores = async () => {
      if (esEdicion && registroEditar?.idNino) {
        try {
          const tutores = await listarTutoresPorNino(registroEditar.idNino);
          setTutoresExistentes(tutores);
          if (tutores.length > 0) {
            setNuevoTutorNombre(tutores[0].nombres);
            setNuevoTutorApellidos(tutores[0].apellidos || '');
            setNuevoTutorTelefono(tutores[0].telefono || '');
            setNuevoTutorTipo(tutores[0].tipoTutor || 'Padre/Madre');
            setTutorEditandoId(tutores[0].idPersona);
          }
        } catch (e) {
          console.error('Error cargando tutores:', e);
        }
      } else {
        setTutoresExistentes([]);
        setTutorEditandoId(null);
      }
    };
    cargarTutores();
  }, [esEdicion, registroEditar]);

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

  const actualizarCampo = (campo: keyof FormularioNino, valor: string | boolean) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => { const copia = { ...prev }; delete copia[campo]; return copia; });
  };

  const validarTabDatos = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    if (formulario.nombres.trim().length < 2)
      nuevosErrores['nombres'] = 'El nombre debe tener al menos 2 caracteres.';
    if (formulario.apellidos.trim().length < 2)
      nuevosErrores['apellidos'] = 'Los apellidos son requeridos.';
    
    const fechaParseada = parsearFechaUsuario(formulario.fechaNacimiento);
    if (!fechaParseada)
      nuevosErrores['fechaNacimiento'] = 'Use el formato DD-MM-AA o DD-Mes-AA (ej: 08-Junio-26).';

    if (!formulario.sexo)
      nuevosErrores['sexo'] = 'Debe seleccionar el sexo.';
    
    if (Object.keys(nuevosErrores).length > 0) {
      Object.values(nuevosErrores).forEach((err) => toast.error(err));
      setErrores(nuevosErrores);
      return false;
    }
    setErrores({});
    return true;
  };

  const validarTabTutor = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    const hayTutoresEnSistema = tutoresSistema.length > 0;
    const seleccionoExistente = tutorSeleccionadoId !== '';
    const completoNuevo = nuevoTutorNombre.trim() && nuevoTutorApellidos.trim() && nuevoTutorTelefono.trim();

    if (hayTutoresEnSistema) {
      if (!seleccionoExistente && !completoNuevo) {
        nuevosErrores['tutorGeneral'] = 'Selecciona un tutor existente o completa los datos del nuevo tutor.';
      }
    } else {
      if (!completoNuevo) {
        if (!nuevoTutorNombre.trim()) nuevosErrores['nuevoTutor'] = 'Ingresa los nombres del tutor.';
        if (!nuevoTutorApellidos.trim()) nuevosErrores['nuevoTutorApellidos'] = 'Ingresa los apellidos del tutor.';
        if (!nuevoTutorTelefono.trim()) nuevosErrores['nuevoTutorTelefono'] = 'Ingresa el teléfono.';
      }
    }
    
    if (Object.keys(nuevosErrores).length > 0) {
      Object.values(nuevosErrores).forEach((err) => toast.error(err));
      setErrores(nuevosErrores);
      return false;
    }
    setErrores({});
    return true;
  };

  const avanzarTab = () => {
    if (tabActiva === 'datos' && validarTabDatos()) {
      setTabActiva('tutor');
    }
  };

  const guardarDatos = async () => {
    if (!validarTabTutor()) return;
    const fechaDb = parsearFechaUsuario(formulario.fechaNacimiento);
    setCargando(true);
    try {
      const padresValidos = padres.filter(
        (p) => p.nombres.trim().length >= 2 && p.apellidos.trim().length >= 2 && p.telefono.trim().length >= 7
      );

      const payloadSinPadres = {
        nombres:                formulario.nombres.trim(),
        apellidos:              formulario.apellidos.trim(),
        fechaNacimiento:        fechaDb,
        observacionesGenerales: formulario.observacionesGenerales.trim() || undefined,
        sexo:                   (formulario.sexo as any) || undefined,
        activo:                 formulario.activo,
        version:                formulario.version,
      };

      let idPersonaResult = 0;

      if (esEdicion && registroEditar) {
        // Modo edición: actualizar niño existente
        await actualizarNino(registroEditar.idNino, payloadSinPadres);
        idPersonaResult = registroEditar.idNino;
        toast.success(`¡Niño actualizado exitosamente!`);
      } else {
        // Modo creación: registrar nuevo niño
        const payload: DatosNinoConPadres = {
          ...payloadSinPadres,
          padres: padresValidos.map(({ nombres, apellidos, telefono }) => ({
            nombres:   nombres.trim(),
            apellidos: apellidos.trim(),
            telefono:  telefono.trim(),
          })),
        };

        const resultado = await registrarNinoConPadres(payload);
        idPersonaResult = resultado.idPersona;
        toast.success(
          `¡Niño registrado exitosamente! ID: ${resultado.idPersona}. ` +
          `Responsables registrados: ${resultado.padresRegistrados}.`
        );
      }

      // Manejo del tutor (seleccionar existente, crear nuevo o vincular existente)
      if (tutorSeleccionadoId && idPersonaResult && !esEdicion) {
        // Vincular tutor existente al nuevo niño
        await vincularTutorExistente(Number(tutorSeleccionadoId), idPersonaResult, nuevoTutorTipo);
      } else if (nuevoTutorNombre.trim() && nuevoTutorApellidos.trim() && nuevoTutorTelefono.trim()) {
        if (esEdicion && tutorEditandoId) {
          // Actualizar tutor existente
          await actualizarTutor(tutorEditandoId, {
            nombres: nuevoTutorNombre.trim(),
            apellidos: nuevoTutorApellidos.trim(),
            telefono: nuevoTutorTelefono.trim(),
            tipoTutor: nuevoTutorTipo,
          });
        } else if (!esEdicion && idPersonaResult) {
          // Crear nuevo tutor (solo en modo creación)
          await crearTutorYVincular({
            idNino: idPersonaResult,
            nombres: nuevoTutorNombre.trim(),
            apellidos: nuevoTutorApellidos.trim(),
            telefono: nuevoTutorTelefono.trim(),
            tipoTutor: nuevoTutorTipo,
          });
        }
      }

      setTimeout(() => {
        onRegistrado();
        onCerrar();
      }, 1000);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al procesar. Intente nuevamente.'
      );
    } finally {
      setCargando(false);
    }
  };

  const tabs = [
    { key: 'datos' as TabActiva, label: 'Datos del Niño', icono: 'child_care' },
    { key: 'tutor' as TabActiva, label: 'Tutor', icono: 'family_restroom' },
    ...(esEdicion ? [{ key: 'expediente' as TabActiva, label: 'Expediente', icono: 'folder_shared' }] : []),
  ];

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-registro"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
          <div>
            <h2 id="titulo-modal-registro" className="text-headline-md font-headline-md text-on-surface">
              {soloLectura ? 'Ficha del Estudiante' : (esEdicion ? 'Editar Niño' : 'Registrar Nuevo Niño')}
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              {soloLectura ? 'Información completa del niño y su tutor.' : (esEdicion ? 'Modifica los datos del niño.' : 'Complete los datos del niño y registre al tutor.')}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
            aria-label="Cerrar modal"
            disabled={cargando}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs de navegación */}
        <div className="flex border-b border-outline-variant px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTabActiva(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-label-md text-label-md border-b-2 transition-colors ${
                tabActiva === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icono}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cuerpo scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* TAB: Datos del Niño */}
          {tabActiva === 'datos' && (
            <section aria-labelledby="seccion-nino">
              <h3 id="seccion-nino" className="text-label-md font-label-md text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">child_care</span>
                Información del Niño
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label htmlFor="nino-nombres" className="block text-label-sm text-on-surface-variant mb-1">
                    Nombres <span className="text-error">*</span>
                  </label>
                  <input
                    id="nino-nombres"
                    type="text"
                    value={formulario.nombres}
                    onChange={(e) => actualizarCampo('nombres', filtrarSoloLetras(e.target.value))}
                    placeholder="Ej: Lucas Andrés"
                    className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                      errores['nombres'] ? 'border-error' : 'border-outline-variant'
                    }`}
                    disabled={cargando || soloLectura}
                  />
                </div>

                <div>
                  <label htmlFor="nino-apellidos" className="block text-label-sm text-on-surface-variant mb-1">
                    Apellidos <span className="text-error">*</span>
                  </label>
                  <input
                    id="nino-apellidos"
                    type="text"
                    value={formulario.apellidos}
                    onChange={(e) => actualizarCampo('apellidos', filtrarSoloLetras(e.target.value))}
                    placeholder="Ej: Martínez García"
                    className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                      errores['apellidos'] ? 'border-error' : 'border-outline-variant'
                    }`}
                    disabled={cargando || soloLectura}
                  />
                </div>

                <div>
                  <label htmlFor="nino-fecha" className="block text-label-sm text-on-surface-variant mb-1">
                    Fecha de Nacimiento <span className="text-error">*</span>
                  </label>
                  <input
                    id="nino-fecha"
                    type="text"
                    placeholder="DD-MM-AA o DD-Mes-AA (ej: 08-Junio-26)"
                    value={formulario.fechaNacimiento}
                    onChange={(e) => actualizarCampo('fechaNacimiento', e.target.value)}
                    className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                      errores['fechaNacimiento'] ? 'border-error' : 'border-outline-variant'
                    }`}
                    disabled={cargando || soloLectura}
                  />
                </div>

                <div>
                  <label htmlFor="nino-sexo" className="block text-label-sm text-on-surface-variant mb-1">
                    Sexo <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="nino-sexo"
                      value={formulario.sexo}
                      onChange={(e) => actualizarCampo('sexo', e.target.value)}
                      className={`w-full bg-surface-container-low border rounded-lg pl-4 pr-10 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none transition-all ${
                        errores['sexo'] ? 'border-error' : 'border-outline-variant'
                      }`}
                      disabled={cargando || soloLectura}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                  </div>
                </div>

                {esEdicion && (
                  <div>
                    <label htmlFor="nino-activo" className="block text-label-sm text-on-surface-variant mb-1">
                      Estado
                    </label>
                    <div className="relative">
                      <select
                        id="nino-activo"
                        value={formulario.activo ? 'true' : 'false'}
                        onChange={(e) => actualizarCampo('activo', e.target.value === 'true')}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-4 pr-10 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none transition-all"
                        disabled={cargando || soloLectura}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label htmlFor="nino-obs" className="block text-label-sm text-on-surface-variant mb-1">
                    Observaciones / Alergias
                  </label>
                  <textarea
                    id="nino-obs"
                    value={formulario.observacionesGenerales}
                    onChange={(e) => actualizarCampo('observacionesGenerales', e.target.value)}
                    placeholder="Alergias, condiciones médicas, notas especiales..."
                    rows={2}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all resize-none"
                    disabled={cargando || soloLectura}
                  />
                </div>
              </div>
            </section>
          )}

          {/* TAB: Tutor */}
          {tabActiva === 'tutor' && (
            <section aria-labelledby="seccion-tutor">
              <h3 id="seccion-tutor" className="text-label-md font-label-md text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">family_restroom</span>
                Tutor / Responsable
              </h3>

              {/* Dropdown de tutores existentes del sistema con búsqueda */}
              {tutoresSistema.length > 0 && !soloLectura && (
                <div className="mb-4 relative">
                  <label htmlFor="busqueda-tutor" className="block text-label-md font-label-md text-on-surface mb-2">
                    Buscar Tutor en el Sistema
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input
                      id="busqueda-tutor"
                      type="text"
                      value={busquedaTutor || (tutorSeleccionadoId ? (tutoresSistema.find(t => t.idPersona === Number(tutorSeleccionadoId))?.nombres + ' ' + tutoresSistema.find(t => t.idPersona === Number(tutorSeleccionadoId))?.apellidos || '') : '')}
                      onChange={(e) => {
                        setBusquedaTutor(e.target.value);
                        setMostrarDropdownTutores(true);
                        if (tutorSeleccionadoId && e.target.value !== (tutoresSistema.find(t => t.idPersona === Number(tutorSeleccionadoId))?.nombres + ' ' + tutoresSistema.find(t => t.idPersona === Number(tutorSeleccionadoId))?.apellidos)) {
                          setTutorSeleccionadoId('');
                          setNuevoTutorNombre('');
                          setNuevoTutorApellidos('');
                          setNuevoTutorTelefono('');
                        }
                        setErrores((p) => { const c = { ...p }; delete c.tutorGeneral; return c; });
                      }}
                      onFocus={() => setMostrarDropdownTutores(true)}
                      onBlur={() => setTimeout(() => setMostrarDropdownTutores(false), 200)}
                      placeholder="Escribe nombre o teléfono del tutor..."
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                  {mostrarDropdownTutores && tutoresFiltrados.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full border border-outline-variant rounded-xl bg-surface-container-lowest shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                      {tutoresFiltrados.map((t) => (
                        <li key={t.idPersona}>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setTutorSeleccionadoId(String(t.idPersona));
                              setBusquedaTutor(`${t.nombres} ${t.apellidos}`);
                              setNuevoTutorNombre(t.nombres);
                              setNuevoTutorApellidos(t.apellidos);
                              setNuevoTutorTelefono(t.telefono);
                              setMostrarDropdownTutores(false);
                              setErrores((p) => { const c = { ...p }; delete c.tutorGeneral; return c; });
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-surface-container-high transition-colors ${
                              tutorSeleccionadoId === String(t.idPersona) ? 'bg-primary/10' : ''
                            }`}
                          >
                            <p className="text-label-md font-label-md text-on-surface">{t.nombres} {t.apellidos}</p>
                            <p className="text-body-sm text-on-surface-variant">
                              {t.telefono || 'Sin teléfono'} • {t.tipo}
                              {t.ninos.length > 0 && ` • Padre de: ${t.ninos.map(n => n.nombreCompleto).join(', ')}`}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-on-surface-variant text-body-sm mt-1">
                    Si el tutor ya está en el sistema, selecciónalo arriba. Si es primera vez, llena el formulario de abajo.
                  </p>
                </div>
              )}



              <div className="bg-surface-container-low rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-label-md font-label-md text-on-surface">
                    {soloLectura ? 'Tutor Responsable' : (tutorSeleccionadoId ? 'Tutor Seleccionado' : (tutorEditandoId ? 'Editar Tutor' : 'Nuevo Tutor'))}
                  </span>
                  {tutorSeleccionadoId && !soloLectura && (
                    <span className="text-body-sm text-tertiary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Tutor existente
                    </span>
                  )}
                  {tutorEditandoId && !tutorSeleccionadoId && !soloLectura && (
                    <span className="text-body-sm text-tertiary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Modo edición
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="tutor-nombre-reg" className="block text-label-sm text-on-surface-variant mb-1">
                      Nombres {tutoresSistema.length === 0 && !soloLectura && <span className="text-error">*</span>}
                    </label>
                    <input
                      id="tutor-nombre-reg"
                      type="text"
                      value={nuevoTutorNombre}
                      onChange={(e) => {
                        setNuevoTutorNombre(filtrarSoloLetras(e.target.value));
                        setTutorSeleccionadoId('');
                        setBusquedaTutor('');
                        setErrores((p) => { const c = { ...p }; delete c.nuevoTutor; delete c.tutorGeneral; return c; });
                      }}
                      placeholder="Ej: María"
                      readOnly={!!tutorSeleccionadoId || soloLectura}
                      className={`w-full bg-surface-container-lowest border rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                        errores['nuevoTutor'] ? 'border-error' : 'border-outline-variant'
                      } ${(tutorSeleccionadoId || soloLectura) ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={cargando || !!tutorSeleccionadoId || soloLectura}
                    />
                  </div>

                  <div>
                    <label htmlFor="tutor-apellidos-reg" className="block text-label-sm text-on-surface-variant mb-1">
                      Apellidos {tutoresSistema.length === 0 && !soloLectura && <span className="text-error">*</span>}
                    </label>
                    <input
                      id="tutor-apellidos-reg"
                      type="text"
                      value={nuevoTutorApellidos}
                      onChange={(e) => { setNuevoTutorApellidos(filtrarSoloLetras(e.target.value)); setTutorSeleccionadoId(''); setErrores((p) => { const c = { ...p }; delete c.nuevoTutorApellidos; delete c.tutorGeneral; return c; }); }}
                      placeholder="Ej: López"
                      readOnly={!!tutorSeleccionadoId || soloLectura}
                      className={`w-full bg-surface-container-lowest border rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                        errores['nuevoTutorApellidos'] ? 'border-error' : 'border-outline-variant'
                      } ${(tutorSeleccionadoId || soloLectura) ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={cargando || !!tutorSeleccionadoId || soloLectura}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label htmlFor="tutor-telefono-reg" className="block text-label-sm text-on-surface-variant mb-1">
                      Teléfono {tutoresSistema.length === 0 && !soloLectura && <span className="text-error">*</span>}
                    </label>
                    <input
                      id="tutor-telefono-reg"
                      type="tel"
                      value={nuevoTutorTelefono}
                      onChange={(e) => { setNuevoTutorTelefono(formatearTelefono(e.target.value, nuevoTutorTelefono)); setTutorSeleccionadoId(''); setErrores((p) => { const c = { ...p }; delete c.nuevoTutorTelefono; delete c.tutorGeneral; return c; }); }}
                      placeholder="Ej: 5555-1234"
                      readOnly={!!tutorSeleccionadoId || soloLectura}
                      className={`w-full bg-surface-container-lowest border rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                        errores['nuevoTutorTelefono'] ? 'border-error' : 'border-outline-variant'
                      } ${(tutorSeleccionadoId || soloLectura) ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={cargando || !!tutorSeleccionadoId || soloLectura}
                    />
                  </div>

                  <div>
                    <label htmlFor="tutor-tipo-reg" className="block text-label-sm text-on-surface-variant mb-1">
                      Parentesco
                    </label>
                    <select
                      id="tutor-tipo-reg"
                      value={nuevoTutorTipo}
                      onChange={(e) => setNuevoTutorTipo(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                      disabled={cargando || soloLectura}
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

                {/* Lista de tutores para editar (solo en modo edición) */}
                {esEdicion && tutoresExistentes.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-outline-variant">
                    <h4 className="text-label-sm font-label-md text-on-surface-variant mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">group</span>
                      Otros responsables registrados
                    </h4>
                    <div className="space-y-2">
                      {tutoresExistentes.map((tutor) => (
                        <div
                          key={tutor.idPersona}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            tutorEditandoId === tutor.idPersona
                              ? 'bg-primary/10 border-primary'
                              : 'bg-surface-container-low border-outline-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div>
                            <p className="text-label-sm font-label-md text-on-surface">{tutor.nombreCompleto}</p>
                            <p className="text-body-sm text-on-surface-variant">
                              {tutor.telefono || 'Sin teléfono'} • {tutor.tipoTutor}
                            </p>
                          </div>
                          {!soloLectura && (
                            <button
                              type="button"
                              onClick={() => {
                                setTutorEditandoId(tutor.idPersona);
                                setNuevoTutorNombre(tutor.nombres);
                                setNuevoTutorTelefono(tutor.telefono || '');
                                setNuevoTutorTipo(tutor.tipoTutor || 'Padre/Madre');
                                setErrores({});
                              }}
                              disabled={cargando}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Editar tutor"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agregar nuevo tutor si ya hay uno editado */}
                {esEdicion && tutorEditandoId && !soloLectura && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setTutorEditandoId(null);
                        setNuevoTutorNombre('');
                        setNuevoTutorApellidos('');
                        setNuevoTutorTelefono('');
                        setNuevoTutorTipo('Padre/Madre');
                        setErrores({});
                      }}
                      disabled={cargando}
                      className="flex items-center gap-2 text-primary text-label-sm font-label-md hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Agregar otro responsable
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
          {tabActiva === 'expediente' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <span className="material-symbols-outlined text-[64px] text-primary">folder_shared</span>
              <h4 className="text-title-md font-title-md text-on-surface">Expediente de Conducta</h4>
              <p className="text-body-md text-on-surface-variant text-center max-w-md">
                Consulte y registre reportes conductuales, médicos e incidencias en el aula de <strong>{formulario.nombres} {formulario.apellidos}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setExpedienteAbierto(true)}
                className="flex items-center gap-2 bg-primary text-on-primary rounded-xl px-5 py-2.5 font-label-md shadow hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined">open_in_new</span>
                Abrir Expediente Completo
              </button>
              {registroEditar && (
                <ModalExpedienteNino
                  abierto={expedienteAbierto}
                  onCerrar={() => setExpedienteAbierto(false)}
                  ninoId={registroEditar.idNino}
                  ninoNombre={`${formulario.nombres} ${formulario.apellidos}`}
                />
              )}
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant">
          {soloLectura ? (
            <button
              type="button"
              onClick={onCerrar}
              className="bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all"
            >
              Cerrar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onCerrar}
                disabled={cargando}
                className="border border-outline-variant text-on-surface-variant rounded-xl px-5 py-2.5 font-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              {tabActiva === 'datos' ? (
                <button
                  type="button"
                  onClick={avanzarTab}
                  disabled={cargando}
                  className="flex items-center gap-2 bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60"
                >
                  Siguiente
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : tabActiva === 'expediente' ? (
                <button
                  type="button"
                  onClick={onCerrar}
                  className="flex items-center gap-2 bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all"
                >
                  Cerrar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={guardarDatos}
                  disabled={cargando}
                  className="flex items-center gap-2 bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60"
                >
                  {cargando ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      {esEdicion ? 'Guardar Cambios' : 'Guardar Registro'}
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const RegistroNinos: React.FC = () => {
  const [modalAbierto, setModalAbierto]   = useState(false);
  const [modoVisualizar, setModoVisualizar] = useState(false);
  const [registroEditando, setRegistroEditando] = useState<(NinoIngresoApi & { datosCompletos?: NinoCompletoApi }) | null>(null);
  const [registros, setRegistros]         = useState<NinoIngresoApi[]>([]);
  const [cargandoTabla, setCargandoTabla] = useState(true);
  const [busqueda, setBusqueda]           = useState('');
  const [pagina, setPagina]               = useState(1);
  const [porPagina, setPorPagina]         = useState(20);
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState(false);
  const [ninoAEliminar, setNinoAEliminar] = useState<NinoIngresoApi | null>(null);

  const { data: swrNinos, isLoading: isLoadingNinos, mutate: mutateNinos } = useSWR(
    '/ninos/ingreso',
    listarNinosIngreso,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const cargarDatos = useCallback(async () => {
    mutateNinos();
  }, [mutateNinos]);

  useEffect(() => {
    if (swrNinos) {
      setRegistros(swrNinos);
    }
  }, [swrNinos]);

  useEffect(() => {
    if (isLoadingNinos && !swrNinos) {
      setCargandoTabla(true);
    } else {
      setCargandoTabla(false);
    }
  }, [isLoadingNinos, swrNinos]);

  const registrosFiltrados = useMemo(() => {
    const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return registros.filter((r) =>
      busqueda ? normalizar(r.nombreNino).includes(normalizar(busqueda)) : true
    );
  }, [registros, busqueda]);

  const totalHoy = useMemo(() => {
    const hoyStr = fechaLocalHoy();
    return registros.filter(r => {
      if (!r.creadoEn) return false;
      const fechaNinoStr = dateToLocalString(new Date(r.creadoEn));
      return fechaNinoStr === hoyStr;
    }).length;
  }, [registros]);

  const registrosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return registrosFiltrados.slice(inicio, inicio + porPagina);
  }, [registrosFiltrados, pagina, porPagina]);

  const columnas: ColumnaTabla<NinoIngresoApi>[] = [
    {
      id: 'nombre',
      encabezado: 'Nombre del Niño',
      ordenablePor: (r) => r.nombreNino,
      render: (r) => {
        const iniciales = obtenerIniciales(r.nombreNino);
        const idx = registrosFiltrados.indexOf(r);
        const color = COLORES_AVATAR[idx >= 0 ? idx % COLORES_AVATAR.length : 0];
        const esGraduado = r.fechaNacimiento ? calcularEdad(r.fechaNacimiento) >= 13 : false;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-sm shrink-0 ${color}`}>
              {iniciales}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span>{r.nombreNino}</span>
              {esGraduado && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Graduado
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'responsable',
      encabezado: 'Adulto Responsable',
      ordenablePor: (r) => r.adultoResponsable ?? '',
      render: (r) => <span className="text-on-surface-variant">{r.adultoResponsable ?? '—'}</span>,
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      ordenablePor: (r) => (r.activo ?? true) ? 'Activo' : 'Inactivo',
      render: (r) => {
        const activo = r.activo ?? true;
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
            activo 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' 
              : 'bg-outline/15 text-on-surface-variant'
          }`}>
            {activo ? 'Activo' : 'Inactivo'}
          </span>
        );
      },
    },
    {
      id: 'hora',
      encabezado: 'Hora de Creación',
      ordenablePor: (r) => r.creadoEn ?? '',
      render: (r) => <span className="text-on-surface-variant">{r.creadoEn ? formatearHora(r.creadoEn) : '--:--'}</span>,
    },
  ];

  const handleEditar = useCallback(async (registro: NinoIngresoApi) => {
    try {
      setModoVisualizar(false);
      const datosCompletos = await obtenerNinoCompleto(registro.idNino);
      setRegistroEditando({ ...registro, datosCompletos: datosCompletos as NinoCompletoApi });
      setModalAbierto(true);
    } catch (err) {
      console.error('Error cargando datos del niño:', err);
    }
  }, []);

  const handleVer = useCallback(async (registro: NinoIngresoApi) => {
    try {
      setModoVisualizar(true);
      const datosCompletos = await obtenerNinoCompleto(registro.idNino);
      setRegistroEditando({ ...registro, datosCompletos: datosCompletos as NinoCompletoApi });
      setModalAbierto(true);
    } catch (err) {
      console.error('Error cargando datos del niño:', err);
    }
  }, []);

  const handleEliminar = useCallback((registro: NinoIngresoApi) => {
    setNinoAEliminar(registro);
    setModalConfirmarEliminar(true);
  }, []);

  const confirmarEliminar = useCallback(async () => {
    if (!ninoAEliminar) return;
    try {
      await eliminarNino(ninoAEliminar.idNino);
      setRegistros(prev => prev.filter(r => r.idNino !== ninoAEliminar.idNino));
      toast.success('Niño de baja en el sistema correctamente.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el niño.');
    } finally {
      setNinoAEliminar(null);
    }
  }, [ninoAEliminar]);

   const botonIngresar = (
     <button
       onClick={() => { setModoVisualizar(false); setModalAbierto(true); }}
       className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all"
       aria-label="Registrar nuevo niño"
     >
       <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
       Ingresar Niño
     </button>
   );

  return (
    <LayoutPrincipal titulo="Ingreso de Niños" accionBarra={botonIngresar}>
      <div className="space-y-stack-lg max-w-[1440px]">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
          {/* Tarjeta 1: Niños en el sistema */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-surface-container-highest rounded-full text-primary">
                <span className="material-symbols-outlined" aria-hidden="true">groups</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background">Niños en el Sistema</h3>
            </div>
            <div className="flex items-end gap-2">
              {cargandoTabla ? (
                <div className="h-12 w-20 bg-surface-container-high rounded-lg animate-pulse" />
              ) : (
                <span className="font-display-lg text-display-lg text-primary">
                  {registros.length}
                </span>
              )}
              <span className="font-body-sm text-on-surface-variant pb-2">
                niños registrados en total
              </span>
            </div>
          </div>

          {/* Tarjeta 2: Ingresos del día */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-surface-container-highest rounded-full text-tertiary">
                <span className="material-symbols-outlined" aria-hidden="true">fact_check</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background">Ingresos ({fechaLocalHoy()})</h3>
            </div>
            <div className="flex items-end gap-2">
              {cargandoTabla ? (
                <div className="h-12 w-20 bg-surface-container-high rounded-lg animate-pulse" />
              ) : (
                <span className="font-display-lg text-display-lg text-tertiary">
                  {totalHoy}
                </span>
              )}
              <span className="font-body-sm text-on-surface-variant pb-2">
                nuevos ingresos hoy
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-headline-md text-headline-md text-on-background">
              Registro Reciente
            </h3>
            <div className="relative w-full sm:w-64">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                aria-hidden="true"
              >
                search
              </span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                aria-label="Buscar niño por nombre"
              />
            </div>
          </div>

          <TablaBase
            columnas={columnas}
            filas={registrosPaginados}
            obtenerClave={(r) => r.idNino}
            pagina={pagina}
            total={registrosFiltrados.length}
            porPagina={porPagina}
            onCambiarPagina={setPagina}
            onCambiarPorPagina={setPorPagina}
            cargando={cargandoTabla}
            mensajeVacio={
              busqueda
                ? `No se encontraron resultados para "${busqueda}".`
                : 'No hay registros de ingreso aún. Use el botón "Ingresar Niño" para comenzar.'
            }
            acciones={{ onVer: handleVer, onEditar: handleEditar, onEliminar: handleEliminar }}
          />
        </div>
      </div>

      <ModalRegistroNino
        abierto={modalAbierto}
        registroEditar={registroEditando}
        onCerrar={() => { setModalAbierto(false); setRegistroEditando(null); setModoVisualizar(false); }}
        onRegistrado={cargarDatos}
        soloLectura={modoVisualizar}
      />
      <ModalConfirmar
        abierto={modalConfirmarEliminar}
        onCerrar={() => { setModalConfirmarEliminar(false); setNinoAEliminar(null); }}
        titulo="Eliminar Registro"
        mensaje={`¿Estás seguro de eliminar a ${ninoAEliminar?.nombreNino}? Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminar}
        tipo="danger"
      />
    </LayoutPrincipal>
  );
};

export default RegistroNinos;
