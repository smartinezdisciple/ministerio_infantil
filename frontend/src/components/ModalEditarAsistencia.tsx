// ModalEditarAsistencia.tsx — Modal para editar un registro de asistencia
import React, { useState, useEffect, useMemo } from 'react';
import ModalBase from './ModalBase';
import { toast } from 'sonner';
import type { RegistroAsistenciaNino, Ficha } from '../services/tipos';
import {
  listarTurnos,
  listarFichasActivas,
  listarTutoresPorNino,
  crearTutorYVincular,
  actualizarAsistencia,
  type TutorApi,
  type TurnoApi
} from '../services/servicioApi';
import { formatearTelefono } from '../services/validacionEntrada';
import { formatearTurno } from '../services/turnoUtils';

interface PropsModalEditarAsistencia {
  abierto: boolean;
  onCerrar: () => void;
  registro: RegistroAsistenciaNino | null;
  onActualizado: () => void;
}

const ModalEditarAsistencia: React.FC<PropsModalEditarAsistencia> = ({
  abierto,
  onCerrar,
  registro,
  onActualizado
}) => {
  const [turnos, setTurnos] = useState<TurnoApi[]>([]);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [tutores, setTutores] = useState<TutorApi[]>([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);
  const [cargandoFichas, setCargandoFichas] = useState(false);

  // Campos de formulario
  const [idTurno, setIdTurno] = useState('');
  const [idFichaEntrada, setIdFichaEntrada] = useState('');
  const [idFichaSalida, setIdFichaSalida] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [acompananteEnAula, setAcompananteEnAula] = useState(false);
  const [estado, setEstado] = useState<'Presente' | 'Retirado'>('Presente');
  const [notas, setNotas] = useState('');

  // Tutores
  const [modoTutorEntrada, setModoTutorEntrada] = useState<'existente' | 'nuevo'>('existente');
  const [tutorEntradaSeleccionadoId, setTutorEntradaSeleccionadoId] = useState('');
  const [busquedaTutorEntrada, setBusquedaTutorEntrada] = useState('');
  const [mostrarDropdownTutorEntrada, setMostrarDropdownTutorEntrada] = useState(false);
  
  const [nuevoTutorEntradaNombre, setNuevoTutorEntradaNombre] = useState('');
  const [nuevoTutorEntradaTelefono, setNuevoTutorEntradaTelefono] = useState('');
  const [nuevoTutorEntradaTipo, setNuevoTutorEntradaTipo] = useState('Padre/Madre');

  const [modoTutorSalida, setModoTutorSalida] = useState<'existente' | 'nuevo'>('existente');
  const [tutorSalidaSeleccionadoId, setTutorSalidaSeleccionadoId] = useState('');
  const [busquedaTutorSalida, setBusquedaTutorSalida] = useState('');
  const [mostrarDropdownTutorSalida, setMostrarDropdownTutorSalida] = useState(false);

  const [nuevoTutorSalidaNombre, setNuevoTutorSalidaNombre] = useState('');
  const [nuevoTutorSalidaTelefono, setNuevoTutorSalidaTelefono] = useState('');
  const [nuevoTutorSalidaTipo, setNuevoTutorSalidaTipo] = useState('Padre/Madre');

  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Carga inicial al abrir el modal
  useEffect(() => {
    if (abierto && registro) {
      setErrores({});
      setEnviando(false);

      // Inicializar valores simples
      setIdTurno(String(registro.idTurno));
      setIdFichaEntrada(String(registro.idFichaEntrada));
      setIdFichaSalida(registro.idFichaSalida ? String(registro.idFichaSalida) : '');
      
      // Formatear hora de AM/PM a HH:MM de 24h para el input type="time"
      const formatearHoraInput = (horaStr?: string) => {
        if (!horaStr) return '';
        const match = horaStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return horaStr; // Si ya está en formato 24h
        let hrs = Number(match[1]);
        const mins = match[2];
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hrs < 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;
        return `${String(hrs).padStart(2, '0')}:${mins}`;
      };

      setHoraEntrada(formatearHoraInput(registro.horaEntrada));
      setHoraSalida(formatearHoraInput(registro.horaSalida));
      setAcompananteEnAula(registro.acompananteEnAula);
      setEstado(registro.estado === 'Retirado' ? 'Retirado' : 'Presente');
      setNotas(registro.notas ?? '');

      setModoTutorEntrada('existente');
      setModoTutorSalida('existente');
      setTutorEntradaSeleccionadoId('');
      setTutorSalidaSeleccionadoId('');
      setBusquedaTutorEntrada(registro.ingresadoPor ?? '');
      setBusquedaTutorSalida(registro.retiradoPor ?? '');
      setNuevoTutorEntradaNombre('');
      setNuevoTutorEntradaTelefono('');
      setNuevoTutorSalidaNombre('');
      setNuevoTutorSalidaTelefono('');

      // Cargar Catálogos
      setCargandoTurnos(true);
      listarTurnos()
        .then(datos => setTurnos(datos.filter(t => t.activo || String(t.idTurno) === String(registro.idTurno))))
        .catch(() => setTurnos([]))
        .finally(() => setCargandoTurnos(false));

      setCargandoFichas(true);
      listarFichasActivas()
        .then(datos => {
          // Filtrar fichas del grupo
          const activasGrupo = (datos as unknown as Ficha[]).filter(f => f.idGrupo === registro.nino.grupo.idGrupo);
          setFichas(activasGrupo);
        })
        .catch(() => setFichas([]))
        .finally(() => setCargandoFichas(false));

      listarTutoresPorNino(registro.nino.idPersona)
        .then(datos => {
          setTutores(datos);
          // Intentar asociar las IDs correspondientes a los nombres actuales
          const tEnt = datos.find(t => t.nombreCompleto === registro.ingresadoPor);
          if (tEnt) setTutorEntradaSeleccionadoId(String(tEnt.idPersona));
          const tSal = datos.find(t => t.nombreCompleto === registro.retiradoPor);
          if (tSal) setTutorSalidaSeleccionadoId(String(tSal.idPersona));
        })
        .catch(() => setTutores([]));
    }
  }, [abierto, registro]);

  const normalizarTexto = (texto: string) => {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const tutoresEntradaFiltrados = useMemo(() => {
    const query = busquedaTutorEntrada.trim();
    if (!query) return tutores;
    const queryNorm = normalizarTexto(query);
    return tutores.filter(t => normalizarTexto(t.nombreCompleto).includes(queryNorm));
  }, [tutores, busquedaTutorEntrada]);

  const tutoresSalidaFiltrados = useMemo(() => {
    const query = busquedaTutorSalida.trim();
    if (!query) return tutores;
    const queryNorm = normalizarTexto(query);
    return tutores.filter(t => normalizarTexto(t.nombreCompleto).includes(queryNorm));
  }, [tutores, busquedaTutorSalida]);

  const fichasEntradaPorGrupo = useMemo(() => {
    const filtradas = fichas.filter(f => f.tipo === 'Entrada');
    // Asegurar que la ficha actual esté en las opciones
    if (registro && !filtradas.some(f => f.idFicha === registro.idFichaEntrada)) {
      filtradas.unshift({
        idFicha: registro.idFichaEntrada,
        codigoFicha: registro.codigoFichaEntrada,
        estado: 'Activa',
        tipo: 'Entrada',
        idGrupo: registro.nino.grupo.idGrupo
      });
    }
    return filtradas;
  }, [fichas, registro]);

  const fichasSalidaPorGrupo = useMemo(() => {
    const filtradas = fichas.filter(f => f.tipo === 'Salida');
    // Asegurar que la ficha actual de salida esté en las opciones si existe
    if (registro?.idFichaSalida && !filtradas.some(f => f.idFicha === registro.idFichaSalida)) {
      filtradas.unshift({
        idFicha: registro.idFichaSalida,
        codigoFicha: registro.codigoFichaSalida ?? '',
        estado: 'Activa',
        tipo: 'Salida',
        idGrupo: registro.nino.grupo.idGrupo
      });
    }
    return filtradas;
  }, [fichas, registro]);

  const validarFormulario = (): boolean => {
    const tempErrores: Record<string, string> = {};

    if (!idTurno) tempErrores.turno = 'Selecciona un turno.';
    if (!idFichaEntrada) tempErrores.fichaEntrada = 'Selecciona una ficha de entrada.';
    if (!horaEntrada) tempErrores.horaEntrada = 'Ingresa la hora de entrada.';

    // Validar Tutor Entrada
    if (modoTutorEntrada === 'existente') {
      if (!tutorEntradaSeleccionadoId) {
        tempErrores.tutorEntrada = 'Selecciona un tutor registrado o cambia a "Nuevo".';
      }
    } else {
      if (!nuevoTutorEntradaNombre.trim()) tempErrores.nuevoTutorEntrada = 'Ingresa el nombre.';
      if (!nuevoTutorEntradaTelefono.trim()) tempErrores.nuevoTutorEntradaTelefono = 'Ingresa el teléfono.';
    }

    // Validar Salida si Estado es Retirado
    if (estado === 'Retirado') {
      if (!horaSalida) tempErrores.horaSalida = 'Ingresa la hora de salida.';
      
      if (modoTutorSalida === 'existente') {
        if (!tutorSalidaSeleccionadoId) {
          tempErrores.tutorSalida = 'Selecciona el tutor de salida.';
        }
      } else {
        if (!nuevoTutorSalidaNombre.trim()) tempErrores.nuevoTutorSalida = 'Ingresa el nombre.';
        if (!nuevoTutorSalidaTelefono.trim()) tempErrores.nuevoTutorSalidaTelefono = 'Ingresa el teléfono.';
      }
    }

    setErrores(tempErrores);
    return Object.keys(tempErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario() || !registro) return;
    setEnviando(true);

    try {
      let finalIdTutorEntrada = Number(tutorEntradaSeleccionadoId);
      let finalIdTutorSalida = Number(tutorSalidaSeleccionadoId);

      // Crear tutor de entrada si es nuevo
      if (modoTutorEntrada === 'nuevo') {
        const nombresPartes = nuevoTutorEntradaNombre.trim().split(' ');
        const tutor = await crearTutorYVincular({
          idNino: registro.nino.idPersona,
          nombres: nombresPartes[0] || '',
          apellidos: nombresPartes.slice(1).join(' ') || 'Sin apellido',
          telefono: nuevoTutorEntradaTelefono.trim(),
          tipoTutor: nuevoTutorEntradaTipo
        });
        finalIdTutorEntrada = tutor.idPersona;
      }

      // Crear tutor de salida si es nuevo y aplica
      if (estado === 'Retirado' && modoTutorSalida === 'nuevo') {
        const nombresPartes = nuevoTutorSalidaNombre.trim().split(' ');
        const tutor = await crearTutorYVincular({
          idNino: registro.nino.idPersona,
          nombres: nombresPartes[0] || '',
          apellidos: nombresPartes.slice(1).join(' ') || 'Sin apellido',
          telefono: nuevoTutorSalidaTelefono.trim(),
          tipoTutor: nuevoTutorSalidaTipo
        });
        finalIdTutorSalida = tutor.idPersona;
      }

      const datos = {
        idTurno: Number(idTurno),
        idFichaEntrada: Number(idFichaEntrada),
        idFichaSalida: (estado === 'Retirado' && idFichaSalida) ? Number(idFichaSalida) : null,
        idIngresadoPor: finalIdTutorEntrada,
        idRetiradoPor: estado === 'Retirado' ? finalIdTutorSalida : null,
        horaEntrada: horaEntrada,
        horaSalida: estado === 'Retirado' ? horaSalida : null,
        acompananteEnAula: acompananteEnAula,
        estado: estado,
        notas: notas
      };

      await actualizarAsistencia(registro.idAsistencia, datos);
      toast.success('Cambios de asistencia guardados correctamente.');
      onActualizado();
      onCerrar();
    } catch (err: any) {
      console.error('Error al guardar asistencia:', err);
      toast.error(err.message || 'Error al guardar los cambios de asistencia.');
    } finally {
      setEnviando(false);
    }
  };

  const footer = (
    <>
      <button
        onClick={onCerrar}
        disabled={enviando}
        className="flex-1 py-3 px-4 border border-outline-variant text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container-high transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        onClick={handleGuardar}
        disabled={enviando}
        className="flex-1 py-3 px-4 bg-primary text-on-primary font-label-md rounded-xl shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {enviando ? (
          <>
            <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">save</span>
            Guardar Cambios
          </>
        )}
      </button>
    </>
  );

  return (
    <ModalBase
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Editar Registro de Asistencia"
      footer={footer}
    >
      {registro && (
        <div className="space-y-stack-lg">
          {/* Resumen del niño */}
          <div className="bg-surface-container-low rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]">child_care</span>
            <div>
              <p className="text-label-md font-label-md text-on-surface">{registro.nino.nombreCompleto}</p>
              <p className="text-body-sm text-on-surface-variant">Grupo: {registro.nino.grupo.nombre}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Turno */}
            <div>
              <label htmlFor="edit-turno" className="block text-label-md font-label-md text-on-surface mb-1">
                Turno <span className="text-error">*</span>
              </label>
              {cargandoTurnos ? (
                <div id="edit-turno" className="h-11 bg-surface-container-low rounded-xl animate-pulse" />
              ) : (
                <select
                  id="edit-turno"
                  value={idTurno}
                  onChange={(e) => {
                    setIdTurno(e.target.value);
                    setErrores(p => ({ ...p, turno: '' }));
                  }}
                  className={`w-full p-3 border rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md ${
                    errores.turno ? 'border-error' : 'border-outline-variant'
                  }`}
                >
                  {turnos.map((t) => (
                    <option key={t.idTurno} value={String(t.idTurno)}>
                      {formatearTurno(t.nombre)}
                    </option>
                  ))}
                </select>
              )}
              {errores.turno && <p className="text-error text-body-sm mt-1">{errores.turno}</p>}
            </div>

            {/* Ficha Entrada */}
            <div>
              <label htmlFor="edit-ficha-entrada" className="block text-label-md font-label-md text-on-surface mb-1">
                Ficha Entrada <span className="text-error">*</span>
              </label>
              {cargandoFichas ? (
                <div id="edit-ficha-entrada" className="h-11 bg-surface-container-low rounded-xl animate-pulse" />
              ) : (
                <select
                  id="edit-ficha-entrada"
                  value={idFichaEntrada}
                  onChange={(e) => {
                    setIdFichaEntrada(e.target.value);
                    setErrores(p => ({ ...p, fichaEntrada: '' }));
                  }}
                  className={`w-full p-3 border rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md ${
                    errores.fichaEntrada ? 'border-error' : 'border-outline-variant'
                  }`}
                >
                  <option value="">Seleccionar Ficha...</option>
                  {fichasEntradaPorGrupo.map((f) => (
                    <option key={f.idFicha} value={String(f.idFicha)}>
                      {f.codigoFicha}
                    </option>
                  ))}
                </select>
              )}
              {errores.fichaEntrada && <p className="text-error text-body-sm mt-1">{errores.fichaEntrada}</p>}
            </div>

            {/* Hora Entrada */}
            <div>
              <label htmlFor="edit-hora-entrada" className="block text-label-md font-label-md text-on-surface mb-1">
                Hora Entrada <span className="text-error">*</span>
              </label>
              <input
                id="edit-hora-entrada"
                type="time"
                value={horaEntrada}
                onChange={(e) => {
                  setHoraEntrada(e.target.value);
                  setErrores(p => ({ ...p, horaEntrada: '' }));
                }}
                className={`w-full p-3 border rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md ${
                  errores.horaEntrada ? 'border-error' : 'border-outline-variant'
                }`}
              />
              {errores.horaEntrada && <p className="text-error text-body-sm mt-1">{errores.horaEntrada}</p>}
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="edit-estado" className="block text-label-md font-label-md text-on-surface mb-1">
                Estado <span className="text-error">*</span>
              </label>
              <select
                id="edit-estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value as 'Presente' | 'Retirado')}
                className="w-full p-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md"
              >
                <option value="Presente">Presente (En Aula)</option>
                <option value="Retirado">Retirado (Salida registrada)</option>
              </select>
            </div>
          </div>

          {/* Sección Tutor Entrada */}
          <div className="border border-outline-variant/30 rounded-xl p-4 space-y-3 bg-surface-container-low/30">
            <div className="flex justify-between items-center">
              <span className="text-label-md font-label-md text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">login</span>
                Tutor de Entrada <span className="text-error">*</span>
              </span>
              {tutores.length > 0 && (
                <div className="flex bg-surface-container rounded-lg p-0.5 border border-outline-variant text-[12px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setModoTutorEntrada('existente')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      modoTutorEntrada === 'existente' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Registrado
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoTutorEntrada('nuevo')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      modoTutorEntrada === 'nuevo' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Nuevo
                  </button>
                </div>
              )}
            </div>

            {modoTutorEntrada === 'existente' && tutores.length > 0 ? (
              <div className="relative">
                <input
                  id="edit-tutor-entrada-busqueda"
                  name="busquedaTutorEntrada"
                  type="text"
                  value={busquedaTutorEntrada}
                  onChange={(e) => {
                    setBusquedaTutorEntrada(e.target.value);
                    setTutorEntradaSeleccionadoId('');
                    setErrores(p => ({ ...p, tutorEntrada: '' }));
                  }}
                  onFocus={() => setMostrarDropdownTutorEntrada(true)}
                  onBlur={() => setTimeout(() => setMostrarDropdownTutorEntrada(false), 200)}
                  placeholder="Buscar tutor registrado..."
                  className={`w-full p-3 border rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md ${
                    errores.tutorEntrada ? 'border-error' : 'border-outline-variant'
                  }`}
                  autoComplete="off"
                />
                {mostrarDropdownTutorEntrada && (
                  <ul className="absolute z-[100] left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1">
                    {tutoresEntradaFiltrados.map((t) => (
                      <li
                        key={t.idPersona}
                        onMouseDown={() => {
                          setTutorEntradaSeleccionadoId(String(t.idPersona));
                          setBusquedaTutorEntrada(t.nombreCompleto);
                          setMostrarDropdownTutorEntrada(false);
                        }}
                        className="px-4 py-2 hover:bg-surface-container-high cursor-pointer text-body-md text-on-surface flex justify-between items-center"
                      >
                        <span>{t.nombreCompleto}</span>
                        <span className="text-body-sm text-on-surface-variant">{t.tipoTutor}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {errores.tutorEntrada && <p className="text-error text-body-sm mt-1">{errores.tutorEntrada}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <input
                    id="edit-nuevo-tutor-entrada-nombre"
                    name="nuevoTutorEntradaNombre"
                    type="text"
                    value={nuevoTutorEntradaNombre}
                    onChange={(e) => {
                      setNuevoTutorEntradaNombre(e.target.value);
                      setErrores(p => ({ ...p, nuevoTutorEntrada: '' }));
                    }}
                    placeholder="Nombre Completo"
                    className={`w-full p-2.5 border rounded-xl bg-surface-container-lowest text-body-sm ${
                      errores.nuevoTutorEntrada ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                  {errores.nuevoTutorEntrada && <p className="text-error text-[11px] mt-0.5">{errores.nuevoTutorEntrada}</p>}
                </div>
                <div>
                  <input
                    id="edit-nuevo-tutor-entrada-telefono"
                    name="nuevoTutorEntradaTelefono"
                    type="tel"
                    value={nuevoTutorEntradaTelefono}
                    onChange={(e) => {
                      setNuevoTutorEntradaTelefono(formatearTelefono(e.target.value, nuevoTutorEntradaTelefono));
                      setErrores(p => ({ ...p, nuevoTutorEntradaTelefono: '' }));
                    }}
                    placeholder="Teléfono"
                    className={`w-full p-2.5 border rounded-xl bg-surface-container-lowest text-body-sm ${
                      errores.nuevoTutorEntradaTelefono ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                  {errores.nuevoTutorEntradaTelefono && <p className="text-error text-[11px] mt-0.5">{errores.nuevoTutorEntradaTelefono}</p>}
                </div>
                <div>
                  <select
                    id="edit-nuevo-tutor-entrada-tipo"
                    name="nuevoTutorEntradaTipo"
                    value={nuevoTutorEntradaTipo}
                    onChange={(e) => setNuevoTutorEntradaTipo(e.target.value)}
                    className="w-full p-2.5 border border-outline-variant rounded-xl bg-surface-container-lowest text-body-sm"
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
          </div>

          {/* Sección de Salida (solo si Estado es Retirado) */}
          {estado === 'Retirado' && (
            <div className="border border-outline-variant/30 rounded-xl p-4 space-y-4 bg-surface-container-low/30">
              <span className="text-label-md font-label-md text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">logout</span>
                Información de Salida
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ficha Salida */}
                <div>
                  <label htmlFor="edit-ficha-salida" className="block text-label-md font-label-md text-on-surface mb-1">
                    Ficha Salida
                  </label>
                  {cargandoFichas ? (
                    <div id="edit-ficha-salida" className="h-11 bg-surface-container-low rounded-xl animate-pulse" />
                  ) : (
                    <select
                      id="edit-ficha-salida"
                      value={idFichaSalida}
                      onChange={(e) => {
                        setIdFichaSalida(e.target.value);
                      }}
                      className="w-full p-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md"
                    >
                      <option value="">Seleccionar Ficha...</option>
                      {fichasSalidaPorGrupo.map((f) => (
                        <option key={f.idFicha} value={String(f.idFicha)}>
                          {f.codigoFicha}
                        </option>
                      ))}
                    </select>
                  )}
                  {errores.fichaSalida && <p className="text-error text-body-sm mt-1">{errores.fichaSalida}</p>}
                </div>

                {/* Hora Salida */}
                <div>
                  <label htmlFor="edit-hora-salida" className="block text-label-md font-label-md text-on-surface mb-1">
                    Hora Salida <span className="text-error">*</span>
                  </label>
                  <input
                    id="edit-hora-salida"
                    type="time"
                    value={horaSalida}
                    onChange={(e) => {
                      setHoraSalida(e.target.value);
                      setErrores(p => ({ ...p, horaSalida: '' }));
                    }}
                    className={`w-full p-3 border rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md ${
                      errores.horaSalida ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                  {errores.horaSalida && <p className="text-error text-body-sm mt-1">{errores.horaSalida}</p>}
                </div>
              </div>

              {/* Tutor de Salida */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="block text-label-md font-label-md text-on-surface">
                    Persona que Retira <span className="text-error">*</span>
                  </label>
                  {tutores.length > 0 && (
                    <div className="flex bg-surface-container rounded-lg p-0.5 border border-outline-variant text-[12px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setModoTutorSalida('existente')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${
                          modoTutorSalida === 'existente' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Registrado
                      </button>
                      <button
                        type="button"
                        onClick={() => setModoTutorSalida('nuevo')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${
                          modoTutorSalida === 'nuevo' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Nuevo
                      </button>
                    </div>
                  )}
                </div>

                {modoTutorSalida === 'existente' && tutores.length > 0 ? (
                  <div className="relative">
                    <input
                      id="edit-tutor-salida-busqueda"
                      name="busquedaTutorSalida"
                      type="text"
                      value={busquedaTutorSalida}
                      onChange={(e) => {
                        setBusquedaTutorSalida(e.target.value);
                        setTutorSalidaSeleccionadoId('');
                        setErrores(p => ({ ...p, tutorSalida: '' }));
                      }}
                      onFocus={() => setMostrarDropdownTutorSalida(true)}
                      onBlur={() => setTimeout(() => setMostrarDropdownTutorSalida(false), 200)}
                      placeholder="Buscar tutor registrado..."
                      className={`w-full p-3 border rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md ${
                        errores.tutorSalida ? 'border-error' : 'border-outline-variant'
                      }`}
                      autoComplete="off"
                    />
                    {mostrarDropdownTutorSalida && (
                      <ul className="absolute z-[100] left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1">
                        {tutoresSalidaFiltrados.map((t) => (
                          <li
                            key={t.idPersona}
                            onMouseDown={() => {
                              setTutorSalidaSeleccionadoId(String(t.idPersona));
                              setBusquedaTutorSalida(t.nombreCompleto);
                              setMostrarDropdownTutorSalida(false);
                            }}
                            className="px-4 py-2 hover:bg-surface-container-high cursor-pointer text-body-md text-on-surface flex justify-between items-center"
                          >
                            <span>{t.nombreCompleto}</span>
                            <span className="text-body-sm text-on-surface-variant">{t.tipoTutor}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {errores.tutorSalida && <p className="text-error text-body-sm mt-1">{errores.tutorSalida}</p>}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <input
                        id="edit-nuevo-tutor-salida-nombre"
                        name="nuevoTutorSalidaNombre"
                        type="text"
                        value={nuevoTutorSalidaNombre}
                        onChange={(e) => {
                          setNuevoTutorSalidaNombre(e.target.value);
                          setErrores(p => ({ ...p, nuevoTutorSalida: '' }));
                        }}
                        placeholder="Nombre Completo"
                        className={`w-full p-2.5 border rounded-xl bg-surface-container-lowest text-body-sm ${
                          errores.nuevoTutorSalida ? 'border-error' : 'border-outline-variant'
                        }`}
                      />
                      {errores.nuevoTutorSalida && <p className="text-error text-[11px] mt-0.5">{errores.nuevoTutorSalida}</p>}
                    </div>
                    <div>
                       <input
                        id="edit-nuevo-tutor-salida-telefono"
                        name="nuevoTutorSalidaTelefono"
                        type="tel"
                        value={nuevoTutorSalidaTelefono}
                        onChange={(e) => {
                          setNuevoTutorSalidaTelefono(formatearTelefono(e.target.value, nuevoTutorSalidaTelefono));
                          setErrores(p => ({ ...p, nuevoTutorSalidaTelefono: '' }));
                        }}
                        placeholder="Teléfono"
                        className={`w-full p-2.5 border rounded-xl bg-surface-container-lowest text-body-sm ${
                          errores.nuevoTutorSalidaTelefono ? 'border-error' : 'border-outline-variant'
                        }`}
                      />
                      {errores.nuevoTutorSalidaTelefono && <p className="text-error text-[11px] mt-0.5">{errores.nuevoTutorSalidaTelefono}</p>}
                    </div>
                    <div>
                      <select
                        id="edit-nuevo-tutor-salida-tipo"
                        name="nuevoTutorSalidaTipo"
                        value={nuevoTutorSalidaTipo}
                        onChange={(e) => setNuevoTutorSalidaTipo(e.target.value)}
                        className="w-full p-2.5 border border-outline-variant rounded-xl bg-surface-container-lowest text-body-sm"
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
              </div>
            </div>
          )}

          {/* Acompañante */}
          <label htmlFor="edit-acompanante-en-aula" className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative flex items-center justify-center w-6 h-6 border-2 border-primary rounded-md group-active:scale-90 transition-transform shrink-0">
              <input
                id="edit-acompanante-en-aula"
                name="acompananteEnAula"
                type="checkbox"
                checked={acompananteEnAula}
                onChange={(e) => setAcompananteEnAula(e.target.checked)}
                className="peer absolute opacity-0 w-full h-full cursor-pointer"
              />
              <span className="material-symbols-outlined text-primary scale-0 peer-checked:scale-100 transition-transform text-[20px]">check</span>
            </div>
            <span className="text-body-md text-on-surface-variant">
              Acompañante permanece en el salón
            </span>
          </label>

          {/* Notas */}
          <div>
            <label htmlFor="edit-notas" className="block text-label-md font-label-md text-on-surface mb-1">
              Notas / Observaciones
            </label>
            <textarea
              id="edit-notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Observación sobre el comportamiento o condiciones particulares..."
              className="w-full h-24 p-3 border border-outline-variant bg-surface-container-lowest rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md outline-none resize-none"
            />
          </div>
        </div>
      )}
    </ModalBase>
  );
};

export default ModalEditarAsistencia;
