// ModalCheckOut.tsx — Modal de confirmación de retiro (Spec §4.2, R-15 a R-18)
// Esquema real: ID_Retirado_Por referencia Personas(ID_Persona).
// El trigger validar_retiro_nino verifica que sea padre, autorizado o tutor temporal.
import React, { useState, useEffect, useMemo } from 'react';
import ModalBase from './ModalBase';
import type { RegistroAsistenciaNino } from '../services/tipos';
import { obtenerFichaContacto, registrarCheckOut, listarFichasActivas, listarAsistenciaDia } from '../services/servicioApi';
import type { Ficha } from '../services/tipos';
import { fechaLocalHoy } from '../services/fechaUtils';
import { toast } from 'sonner';

interface PropsModalCheckOut {
  abierto: boolean;
  onCerrar: () => void;
  registro: RegistroAsistenciaNino | null;
  /** Callback cuando el retiro se confirma exitosamente */
  onRetirado: (idAsistencia: number, codigoFichaSalida?: string) => void;
}

interface OpcionContacto {
  idPersona?: number;
  etiqueta: string;
  tipo: string;
}

/**
 * Modal de confirmación de retiro (Check-out) — Spec §4.2.
 * Carga la lista de padres/autorizados/tutores del niño desde el backend.
 * El usuario selecciona quién retira; se envía su ID al servidor.
 * El trigger de BD valida la autorización.
 */
const ModalCheckOut: React.FC<PropsModalCheckOut> = ({
  abierto, onCerrar, registro, onRetirado,
}) => {
  const [contactos, setContactos]     = useState<OpcionContacto[]>([]);
  const [seleccion, setSeleccion]     = useState<string>('');   // idPersona como string
  const [nombreLibre, setNombreLibre] = useState('');           // fallback si no hay ID
  const [error, setError]             = useState('');
  const mostrarError = (msg: string) => {
    setError(msg);
    if (msg) toast.error(msg);
  };
  const [enviando, setEnviando]       = useState(false);
  const [cargandoContactos, setCargandoContactos] = useState(false);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [fichaSalidaId, setFichaSalidaId] = useState<string>('');

  // Estados para búsqueda de tutor autocompletable
  const [busquedaTutor, setBusquedaTutor] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  // Normalizar para ignorar acentos y mayúsculas
  const normalizarTexto = (texto: string) => {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Filtrado de contactos insensible a mayúsculas y acentos
  const contactosFiltrados = useMemo(() => {
    const query = busquedaTutor.trim();
    if (!query) return contactos;

    // Si el texto de búsqueda coincide exactamente con la etiqueta seleccionada,
    // mostramos todos los contactos para facilitar cambiar de opción al hacer click de nuevo.
    const seleccionado = contactos.find(c => String(c.idPersona) === seleccion);
    if (seleccionado && seleccionado.etiqueta === query) {
      return contactos;
    }

    const busquedaNorm = normalizarTexto(query);
    return contactos.filter((c) =>
      normalizarTexto(c.etiqueta).includes(busquedaNorm)
    );
  }, [contactos, busquedaTutor, seleccion]);

   // Cargar contactos del niño al abrir
   useEffect(() => {
     if (!abierto || !registro) return;
     setSeleccion('');
     setNombreLibre('');
     setBusquedaTutor('');
     setMostrarDropdown(false);
     setError('');
     setCargandoContactos(true);
     setFichaSalidaId('');

     // Obtener fichas activas y asistencias del día para filtrar fichas en uso
     Promise.all([
       listarFichasActivas(),
       listarAsistenciaDia(fechaLocalHoy())
     ])
     .then(([fichasResult, asistenciasResult]) => {
       const fichasActivas = fichasResult as unknown as Ficha[];
       const asistenciasHoy = asistenciasResult as unknown[]; // Tipo básico para evitar problemas
       
       // Obtener IDs de fichas de salida actualmente en uso
       const fichasSalidaEnUso = new Set(
         asistenciasHoy
           .filter((asistencia: any) => asistencia.idFichaSalida && asistencia.estado === 'Pendiente')
           .map((asistencia: any) => asistencia.idFichaSalida)
       );
       
       // Obtener IDs de fichas de entrada actualmente en uso
       const fichasEntradaEnUso = new Set(
         asistenciasHoy
           .filter((asistencia: any) => asistencia.idFichaEntrada && asistencia.estado === 'Pendiente')
           .map((asistencia: any) => asistencia.idFichaEntrada)
       );
       
       // Combinar ambas colecciones para excluir cualquier ficha en uso (entrada o salida)
       const fichasEnUso = new Set([...fichasSalidaEnUso, ...fichasEntradaEnUso]);
       
       // Filtrar fichas: solo mostrar las de tipo 'Salida' del grupo del niño que NO están en uso
       const fichasDisponibles = fichasActivas.filter(
         ficha => ficha.tipo === 'Salida' && ficha.idGrupo === registro.nino.grupo.idGrupo && !fichasEnUso.has(ficha.idFicha)
       );
       
       setFichas(fichasDisponibles);
     })
     .catch((error) => {
       console.error('Error loading fichas or asistencia:', error);
       // Fallback al comportamiento original si falla
       listarFichasActivas()
         .then((datos) => setFichas(datos as unknown as Ficha[]))
         .catch(() => setFichas([]));
     });

     obtenerFichaContacto(registro.nino.idPersona)
       .then((ficha: any) => {
         const lista: OpcionContacto[] = [];
         const tutores = ficha.tutores || [];
         for (const t of tutores) {
           lista.push({
             idPersona: t.idPersona,
             etiqueta: `${t.nombres} ${t.apellidos} (${t.parentesco || 'Tutor'})`,
             tipo: t.parentesco || 'Tutor'
           });
         }
         setContactos(lista);
       })
       .catch(() => setContactos([]))
       .finally(() => setCargandoContactos(false));
   }, [abierto, registro]);

  const handleConfirmar = async () => {
    if (!registro) return;

    const idSeleccionado = seleccion ? Number(seleccion) : undefined;

    if (!idSeleccionado && !nombreLibre.trim()) {
      mostrarError('Selecciona quién retira al niño o escribe el nombre.');
      return;
    }

    setEnviando(true);
    try {
      const idFichaSalida = fichaSalidaId ? Number(fichaSalidaId) : undefined;
      if (idSeleccionado) {
       await registrarCheckOut(registro.idAsistencia, idSeleccionado, idFichaSalida);
       } else {
         // Sin ID conocido — el backend rechazará si no es persona autorizada.
         // En este caso enviamos 0 para que el trigger lo rechace correctamente.
         await registrarCheckOut(registro.idAsistencia, 0, idFichaSalida);
       }
       const codigoFichaSalidaSeleccionado = fichas.find(f => f.idFicha === Number(idFichaSalida))?.codigoFicha;
       onRetirado(registro.idAsistencia, codigoFichaSalidaSeleccionado);
      onCerrar();
    } catch (err) {
      mostrarError(err instanceof Error ? err.message : 'Error al registrar el retiro.');
    } finally {
      setEnviando(false);
    }
  };

  if (!registro) return null;

  const tieneAlertaAlta = registro.nino.alertasMedicas.some((a) => a.severidad === 'Alta');
  const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

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
        onClick={handleConfirmar}
        disabled={enviando || cargandoContactos}
        className="flex-1 py-3 px-4 bg-secondary text-on-secondary font-label-md rounded-xl shadow-md hover:bg-secondary/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {enviando ? (
          <>
            <span className="w-4 h-4 border-2 border-on-secondary border-t-transparent rounded-full animate-spin" />
            Registrando...
          </>
        ) : 'Confirmar Retiro'}
      </button>
    </>
  );

  return (
    <ModalBase abierto={abierto} onCerrar={onCerrar} titulo="Confirmar Retiro" footer={footer}>
      <div className="space-y-stack-lg">
        {/* Info del niño */}
        <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-headline-md font-bold text-primary">
              {registro.nino.nombres[0]}{registro.nino.apellidos[0]}
            </span>
          </div>
          <div>
            <p className="text-label-md font-label-md text-on-surface">{registro.nino.nombreCompleto}</p>
            <p className="text-body-sm text-on-surface-variant">{registro.nino.grupo.nombre}</p>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Ingresó a las <span className="font-semibold">{registro.horaEntrada}</span> · Ficha: {registro.codigoFichaEntrada}
            </p>
          </div>
        </div>

        {/* Alerta médica */}
        {tieneAlertaAlta && (
          <div className="flex items-start gap-3 bg-error-container/40 rounded-xl px-4 py-3 border border-error/20">
            <span className="material-symbols-outlined text-error mt-0.5 shrink-0" aria-hidden="true">warning</span>
            <p className="text-body-sm text-on-error-container">
              Verificar alertas médicas antes de entregar al tutor.
            </p>
          </div>
        )}

        {/* Selector de quién retira */}
        <div>
          <label htmlFor="quien-retira" className="block text-label-md font-label-md text-on-surface mb-2">
            ¿Quién retira al niño? <span className="text-error">*</span>
          </label>

          {cargandoContactos ? (
            <div className="w-full h-11 bg-surface-container-high rounded-xl animate-pulse" />
          ) : contactos.length > 0 ? (
            <div className="relative">
              <input
                id="quien-retira"
                type="text"
                value={busquedaTutor}
                onChange={(e) => {
                  const val = e.target.value;
                  setBusquedaTutor(val);
                  setSeleccion('');
                  setNombreLibre(val);
                  setError('');
                }}
                onFocus={() => setMostrarDropdown(true)}
                onBlur={() => {
                  // Pequeño delay para permitir que el click del dropdown se registre
                  setTimeout(() => setMostrarDropdown(false), 200);
                }}
                placeholder="Escribe el nombre de quien retira..."
                className={`w-full h-11 border rounded-xl px-4 pr-10 bg-surface-container-lowest text-body-md
                  focus:ring-2 focus:ring-primary focus:outline-none transition-all
                  ${error ? 'border-error' : 'border-outline-variant'}`}
                autoComplete="off"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" aria-hidden="true">
                search
              </span>

              {mostrarDropdown && (
                <ul className="absolute z-[100] left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2">
                  {contactosFiltrados.length > 0 ? (
                    contactosFiltrados.map((c, i) => (
                      <li
                        key={i}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Evita que el input pierda foco antes del click
                          setSeleccion(String(c.idPersona ?? ''));
                          setBusquedaTutor(c.etiqueta);
                          setNombreLibre('');
                          setMostrarDropdown(false);
                          setError('');
                        }}
                        className="px-4 py-2 hover:bg-surface-container-high cursor-pointer text-body-md text-on-surface flex justify-between items-center transition-colors"
                      >
                        <span>{c.etiqueta}</span>
                        <span className="text-body-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full" style={{ textTransform: 'capitalize' }}>
                          {c.tipo}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-on-surface-variant text-body-sm italic">
                      No se encontraron tutores. Se enviará como texto libre.
                    </li>
                  )}
                </ul>
              )}
            </div>
          ) : (
            /* Sin contactos registrados: campo de texto libre (se rechazará en BD si no autorizado) */
            <input
              id="quien-retira"
              type="text"
              value={nombreLibre}
              onChange={(e) => { setNombreLibre(e.target.value); setError(''); }}
              placeholder="Nombre de quien retira..."
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-body-md
                ${error ? 'border-error' : 'border-outline-variant'}`}
            />
          )}

          <p className="text-body-sm text-on-surface-variant/70 mt-1">
            Solo personas registradas como padre, autorizado o tutor temporal vigente.
          </p>
        </div>

        {/* Selector de ficha de salida */}
        <div>
          <label htmlFor="ficha-salida" className="block text-label-md font-label-md text-on-surface mb-2">
            Ficha de Salida <span className="text-secondary">(opcional)</span>
          </label>
          <select
            id="ficha-salida"
            value={fichaSalidaId}
            onChange={(e) => setFichaSalidaId(e.target.value)}
            className="w-full h-11 border border-outline-variant rounded-xl px-4 bg-surface-container-lowest text-body-md focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
          >
            <option value="">— Seleccionar ficha —</option>
            {fichas.map((f) => (
              <option key={f.idFicha} value={String(f.idFicha)}>
                {f.codigoFicha}
              </option>
            ))}
          </select>
        </div>

        {/* Hora estimada de salida */}
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant bg-surface-container-low rounded-lg px-4 py-2">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">schedule</span>
          Hora de salida registrada: <span className="font-semibold text-on-surface ml-1">{horaActual}</span>
        </div>
      </div>
    </ModalBase>
  );
};

export default ModalCheckOut;
