// PaginaDirectorioContactos.tsx — Fase 7: Directorio global de contactos (Spec §9.6)
// Lista todos los padres, tutores y temporales activos del día, con búsqueda y acceso a ficha individual
import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import LayoutPrincipal from '../components/LayoutPrincipal';
import ModalEditarTutor from '../components/ModalEditarTutor';
import type { ContactoGlobal } from '../services/tipos';
import type { TutorApi } from '../services/servicioApi';
import { listarContactos } from '../services/servicioApi';
import { enlaceWhatsApp } from '../services/validacionEntrada';

// ── Helpers ───────────────────────────────────────────────────────
const colorAvatar = (nombre: string) => {
  const paleta = ['bg-primary/20 text-primary', 'bg-tertiary/20 text-tertiary',
                  'bg-secondary/20 text-secondary', 'bg-error/10 text-error'];
  return paleta[nombre.charCodeAt(0) % paleta.length];
};

// ── Componente ────────────────────────────────────────────────────
const PaginaDirectorioContactos: React.FC = () => {
  const navigate = useNavigate();
  const [contactos, setContactos] = useState<ContactoGlobal[]>([]);
  const [cargando,  setCargando]  = useState(true);
  const [busqueda,  setBusqueda]  = useState('');
  const [filtro,    setFiltro]    = useState<'todos' | 'activos' | 'temporales'>('todos');

  // Estado del modal de edición
  const [tutorEditando, setTutorEditando] = useState<{
    idPersona: number;
    nombres: string;
    apellidos: string;
    telefono: string | null;
    tipoTutor?: string;
  } | null>(null);

  // ── Carga de contactos con SWR ────────────────
  const { data: swrContactos, isLoading: isLoadingContactos } = useSWR(
    '/contactos',
    async () => {
      const res = await listarContactos();
      return res as unknown as ContactoGlobal[];
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  useEffect(() => {
    if (swrContactos) {
      setContactos(swrContactos);
    }
  }, [swrContactos]);

  useEffect(() => {
    if (isLoadingContactos && !swrContactos) {
      setCargando(true);
    } else {
      setCargando(false);
    }
  }, [isLoadingContactos, swrContactos]);

  // Filtrado y búsqueda — activos siempre primero (Spec §9.6)
  const contactosFiltrados = useMemo(() => {
    const normalizar = (texto: string) =>
      texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const porFiltro = contactos.filter((c) => {
      if (filtro === 'activos')    return c.activoHoy;
      if (filtro === 'temporales') return c.tipo === 'temporal';
      return true;
    });
    const porBusqueda = busqueda.trim()
      ? porFiltro.filter((c) => {
          const texto = normalizar(`${c.nombres} ${c.apellidos} ${c.ninos.map((n) => n.nombreCompleto).join(' ')}`);
          const query = normalizar(busqueda);
          return texto.includes(query);
        })
      : porFiltro;

    // Activos primero, temporales con badge especial
    return [...porBusqueda].sort((a, b) => {
      if (a.activoHoy !== b.activoHoy) return a.activoHoy ? -1 : 1;
      return 0;
    });
  }, [contactos, busqueda, filtro]);

  const activos    = contactos.filter((c) => c.activoHoy).length;
  const temporales = contactos.filter((c) => c.tipo === 'temporal').length;

  // Actualiza el contacto en la lista local tras guardar en el modal
  const manejarGuardadoTutor = (tutorActualizado: TutorApi) => {
    setContactos((prev) =>
      prev.map((c) =>
        c.idPersona === tutorActualizado.idPersona
          ? {
              ...c,
              nombres:   tutorActualizado.nombres,
              apellidos: tutorActualizado.apellidos,
              telefono:  tutorActualizado.telefono,
            }
          : c
      )
    );
  };

  return (
    <LayoutPrincipal titulo="Directorio de Contacto">
      <div className="space-y-stack-lg max-w-5xl">

        {/* ── Encabezado ─────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Padres, tutores y personas autorizadas. Los activos del día aparecen primero.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-center">
              <p className="text-display-lg font-bold leading-none">{activos}</p>
              <p className="text-label-sm mt-0.5">Activos hoy</p>
            </div>
            <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-xl text-center">
              <p className="text-display-lg font-bold leading-none">{temporales}</p>
              <p className="text-label-sm mt-0.5">Temporales</p>
            </div>
          </div>
        </div>

        {/* ── Búsqueda y filtros ─────────────────── */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" aria-hidden="true">
              search
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o niño..."
              className="w-full pl-9 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              aria-label="Buscar contacto"
            />
          </div>
          {/* Chips de filtro */}
          {(['todos', 'activos', 'temporales'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              aria-pressed={filtro === f}
              className={`px-4 py-2 rounded-xl text-label-sm font-label-sm capitalize transition-colors ${
                filtro === f
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {f === 'todos' ? 'Todos' : f === 'activos' ? 'Activos hoy' : 'Temporales'}
            </button>
          ))}
        </div>

        {/* ── Separador activos / inactivos ──────── */}
        {!cargando && (
          <div className="space-y-stack-md">

            {/* Activos del día */}
            {contactosFiltrados.some((c) => c.activoHoy) && (
              <div>
                <p className="text-label-sm font-label-sm text-tertiary uppercase tracking-wider mb-stack-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary inline-block" aria-hidden="true" />
                  Activos del día
                </p>
                <div className="space-y-3">
                  {contactosFiltrados.filter((c) => c.activoHoy).map((c) => (
                    <TarjetaContacto
                      key={c.idPersona}
                      contacto={c}
                      onVerFicha={(id) => navigate(`/directorio/${id}`)}
                      onEditarTutor={setTutorEditando}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactivos */}
            {contactosFiltrados.some((c) => !c.activoHoy) && filtro !== 'activos' && filtro !== 'temporales' && (
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant/60 uppercase tracking-wider mb-stack-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-outline-variant inline-block" aria-hidden="true" />
                  Inactivos
                </p>
                <div className="space-y-3">
                  {contactosFiltrados.filter((c) => !c.activoHoy).map((c) => (
                    <TarjetaContacto
                      key={c.idPersona}
                      contacto={c}
                      onVerFicha={(id) => navigate(`/directorio/${id}`)}
                      onEditarTutor={setTutorEditando}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Estado vacío */}
            {contactosFiltrados.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] opacity-40" aria-hidden="true">contacts</span>
                <p className="text-body-md">No se encontraron contactos para los filtros aplicados.</p>
              </div>
            )}
          </div>
        )}

        {/* Skeleton */}
        {cargando && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface-container-high rounded-xl" />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal de edición de tutor ─────────────────────────────── */}
      <ModalEditarTutor
        tutor={tutorEditando}
        abierto={tutorEditando !== null}
        alCerrar={() => setTutorEditando(null)}
        alGuardar={manejarGuardadoTutor}
      />
    </LayoutPrincipal>
  );
};

// ── Tarjeta de contacto reutilizable ─────────────────────────────
interface PropsTarjetaContacto {
  contacto: ContactoGlobal;
  onVerFicha: (idNino: number) => void;
  onEditarTutor: (tutor: {
    idPersona: number;
    nombres: string;
    apellidos: string;
    telefono: string | null;
    tipoTutor?: string;
  }) => void;
}

const TarjetaContacto: React.FC<PropsTarjetaContacto> = ({ contacto, onVerFicha, onEditarTutor }) => {
  const iniciales = `${contacto.nombres[0]}${contacto.apellidos[0]}`.toUpperCase();
  const esTemporal = contacto.tipo === 'temporal';
  
  const tieneNinos = contacto.ninos && contacto.ninos.length > 0;
  const tieneTelefono = Boolean(contacto.telefono);
  const puedeLlamar = tieneNinos && tieneTelefono;
  const opacityClass = !contacto.activoHoy ? 'opacity-60' : '';

  const manejarEditar = () =>
    onEditarTutor({
      idPersona: contacto.idPersona,
      nombres:   contacto.nombres,
      apellidos: contacto.apellidos,
      telefono:  contacto.telefono,
    });

  return (
    <div
      className={`bg-surface-container-lowest border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors ${
        esTemporal ? 'border-secondary/30 bg-secondary-fixed/10' : 'border-outline-variant'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-label-md ${
            esTemporal ? 'bg-secondary/20 text-secondary' : colorAvatar(contacto.nombres)
          } ${opacityClass}`}
          aria-hidden="true"
        >
          {iniciales}
        </div>

        {/* Info principal */}
        <div className={`flex-1 min-w-0 ${opacityClass}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-label-md font-label-md text-on-surface">
              {contacto.nombres} {contacto.apellidos}
            </p>
            {esTemporal && (
              <span className="bg-secondary/15 text-secondary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                TEMPORAL
              </span>
            )}
            {contacto.activoHoy && !esTemporal && (
              <span className="bg-tertiary/15 text-tertiary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                HOY
              </span>
            )}
          </div>
          {/* Niños y grupos */}
          <div className="mt-1 flex flex-wrap gap-2">
            {contacto.ninos.map((n) => (
              <button
                key={n.idPersona}
                onClick={() => onVerFicha(n.idPersona)}
                className="text-body-sm text-on-surface-variant hover:text-primary transition-colors underline-offset-2 hover:underline"
              >
                {n.nombreCompleto}
                <span className="text-outline ml-1">· {n.grupo}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Botón Editar */}
          <button
            onClick={manejarEditar}
            className="w-10 h-10 bg-surface-container-high text-on-surface-variant rounded-full flex items-center justify-center hover:bg-surface-container-highest hover:text-on-surface active:scale-95 transition-all"
            aria-label={`Editar datos de ${contacto.nombres} ${contacto.apellidos}`}
            title="Editar tutor"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
          </button>

          {/* Botón WhatsApp — activo si hay teléfono */}
          {contacto.telefono ? (
            <a
              href={enlaceWhatsApp(contacto.telefono)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-emerald-600 active:scale-95 transition-all"
              aria-label={`WhatsApp a ${contacto.nombres} ${contacto.apellidos}`}
              title="WhatsApp"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chat</span>
            </a>
          ) : (
            <button
              disabled
              className="w-10 h-10 bg-outline-variant/30 text-outline rounded-full flex items-center justify-center cursor-not-allowed"
              title="Sin teléfono registrado"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chat</span>
            </button>
          )}

          {/* Botón Llamar — desactivado si no hay niños o no hay teléfono */}
          {puedeLlamar ? (
            <a
              href={`tel:${contacto.telefono!.replace(/-/g, '')}`}
              className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
              aria-label={`Llamar a ${contacto.nombres} ${contacto.apellidos}`}
              title="Llamar"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">call</span>
            </a>
          ) : (
            <button
              disabled
              className="w-10 h-10 bg-outline-variant/30 text-outline rounded-full flex items-center justify-center cursor-not-allowed"
              aria-label={
                !tieneNinos
                  ? 'No se puede llamar hasta que tenga un niño asignado'
                  : 'Sin número de teléfono registrado'
              }
              title={
                !tieneNinos
                  ? 'No se puede llamar hasta que tenga un niño asignado'
                  : 'Sin teléfono registrado'
              }
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaginaDirectorioContactos;
