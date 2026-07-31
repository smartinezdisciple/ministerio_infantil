// ModalVerPersonal.tsx — Ficha de solo lectura de un miembro del personal con tabs
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  obtenerPerfilPersonal,
  type PersonalAsistenciaApi,
  type PerfilPersonalApi,
} from '../services/servicioApi';
import { formatearFechaVisual } from '../services/fechaUtils';
import { formatearTurno } from '../services/turnoUtils';

type TabVer = 'general' | 'contacto' | 'personal' | 'iglesia';

const TABS: Array<{ key: TabVer; etiqueta: string; icono: string }> = [
  { key: 'general', etiqueta: 'General', icono: 'badge' },
  { key: 'contacto', etiqueta: 'Contacto', icono: 'contact_phone' },
  { key: 'personal', etiqueta: 'Información Personal', icono: 'family_restroom' },
  { key: 'iglesia', etiqueta: 'Información de la Iglesia', icono: 'church' },
];

const ESTADO_LLEGADA_CLASES: Record<string, string> = {
  Temprano: 'bg-tertiary/10 text-tertiary',
  Tarde: 'bg-primary/10 text-primary',
  Justificado: 'bg-secondary/10 text-secondary',
  Injustificado: 'bg-error/10 text-error',
};

const CampoInfo: React.FC<{ etiqueta: string; valor: React.ReactNode }> = ({ etiqueta, valor }) => (
  <div className="mb-3">
    <p className="text-label-sm font-medium text-on-surface-variant mb-0.5">{etiqueta}</p>
    <div className="text-body-md text-on-surface font-normal">
      {valor ?? <span className="text-on-surface-variant italic">No registrado</span>}
    </div>
  </div>
);

const Chip: React.FC<{ texto: string; icono?: string; className?: string }> = ({ texto, icono, className = '' }) => (
  <span className={`inline-flex items-center gap-1 bg-surface-container-low text-on-surface px-3 py-1 rounded-full text-label-sm mr-2 mb-2 ${className}`}>
    {icono && <span className="material-symbols-outlined text-[16px]">{icono}</span>}
    {texto}
  </span>
);

const Icono: React.FC<{ nombre: string; color?: string; size?: number }> = ({ nombre, color, size = 18 }) => (
  <span className="material-symbols-outlined shrink-0" style={{ fontSize: `${size}px`, color, verticalAlign: 'middle' }}>
    {nombre}
  </span>
);

interface PropsModalVerPersonal {
  abierto: boolean;
  personal: PersonalAsistenciaApi | null;
  onCerrar: () => void;
}

const ModalVerPersonal: React.FC<PropsModalVerPersonal> = ({ abierto, personal, onCerrar }) => {
  const [perfil, setPerfil] = useState<PerfilPersonalApi | null>(null);
  const [cargando, setCargando] = useState(false);
  const [tabActiva, setTabActiva] = useState<TabVer>('general');

  useEffect(() => {
    if (abierto && personal) {
      setCargando(true);
      setPerfil(null);
      setTabActiva('general');
      obtenerPerfilPersonal(personal.idPersona)
        .then((data) => setPerfil(data))
        .catch(() => toast.error('Error al cargar la información del personal.'))
        .finally(() => setCargando(false));
    }
  }, [abierto, personal]);

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

  if (!abierto || !personal) return null;

  const iniciales = `${(personal.nombres[0] ?? '')}${(personal.apellidos[0] ?? '')}`.toUpperCase();

  const renderGeneral = () => {
    if (!perfil) return null;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <CampoInfo etiqueta="Usuario del Sistema" valor={
            <code className="bg-surface-container-low px-2 py-0.5 rounded font-mono text-[13px] text-on-surface">
              {perfil.usuario}
            </code>
          } />
          <CampoInfo etiqueta="Sexo" valor={perfil.sexo} />
          <CampoInfo etiqueta="Cédula de Identidad" valor={perfil.cedula} />
          <CampoInfo etiqueta="Fecha de Nacimiento" valor={formatearFechaVisual(perfil.fechaNacimiento ?? '')} />
          <CampoInfo etiqueta="Fecha de Ingreso" valor={formatearFechaVisual(perfil.fechaIngreso)} />
          <CampoInfo etiqueta="Rol" valor={perfil.rol} />
        </div>

        <div className="border-t border-outline-variant/20 pt-4">
          <h4 className="text-label-sm font-bold text-on-surface mb-2">Grupos Asignados</h4>
          {(perfil.grupos ?? []).length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">Sin grupos asignados.</p>
          ) : (
            <div>
              {(perfil.grupos ?? []).map((g) => (
                <Chip key={g.idGrupo} texto={g.grupo} icono="group" />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-outline-variant/20 pt-4">
          <h4 className="text-label-sm font-bold text-on-surface mb-2">Turnos Asignados</h4>
          {(perfil.turnos ?? []).length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">Sin turnos asignados.</p>
          ) : (
            <div>
              {(perfil.turnos ?? []).map((t) => (
                <Chip key={t.idTurno} texto={formatearTurno(t.turno)} icono="schedule" />
              ))}
            </div>
          )}
        </div>

        {(personal.estadoLlegada || personal.horaLlegada) && (
          <div className="border-t border-outline-variant/20 pt-4">
            <h4 className="text-label-sm font-bold text-on-surface mb-2">Asistencia de Hoy</h4>
            <div className="flex flex-wrap items-center gap-2">
              {personal.estadoLlegada && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold ${ESTADO_LLEGADA_CLASES[personal.estadoLlegada] ?? 'bg-surface-container text-on-surface-variant'}`}>
                  <Icono nombre="schedule" size={14} />
                  {personal.estadoLlegada}
                </span>
              )}
              {personal.horaLlegada && (
                <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
                  <Icono nombre="access_time" size={14} />
                  Hora: {personal.horaLlegada}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContacto = () => {
    if (!perfil) return null;
    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-label-md font-bold text-on-surface flex items-center gap-2 mb-3">
            <Icono nombre="contact_phone" color="var(--color-primary)" />
            Teléfonos
          </h4>
          {(perfil.telefonos ?? []).length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">No hay teléfonos registrados.</p>
          ) : (
            <div className="space-y-2">
              {(perfil.telefonos ?? []).map((tel) => (
                <div key={tel.idTelefono} className="flex justify-between items-center bg-surface-container-low/50 p-2.5 rounded-lg">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">{tel.numero}</p>
                    <span className="text-label-sm text-on-surface-variant">{tel.tipo}</span>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {tel.esPrincipal && (
                      <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">Principal</span>
                    )}
                    {tel.tieneWhatsapp && (
                      <span className="bg-tertiary/10 text-tertiary text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">chat</span>
                        WhatsApp
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-label-md font-bold text-on-surface flex items-center gap-2 mb-3">
            <Icono nombre="location_on" color="var(--color-primary)" />
            Direcciones
          </h4>
          {(perfil.direcciones ?? []).length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">No hay direcciones registradas.</p>
          ) : (
            <div className="space-y-2">
              {(perfil.direcciones ?? []).map((dir) => (
                <div key={dir.idDireccion} className="bg-surface-container-low/50 p-3 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm font-bold text-primary">{dir.tipoDireccion}</span>
                    {dir.esPrincipal && (
                      <span className="bg-primary text-on-primary text-[9px] px-2 py-0.5 rounded-full font-bold">Principal</span>
                    )}
                  </div>
                  <p className="text-body-sm text-on-surface font-semibold">{dir.direccionExacta}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {dir.barrio && `${dir.barrio}, `}
                    {dir.distrito && `${dir.distrito}, `}
                    {dir.municipio} · {dir.ciudadDepartamento}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPersonal = () => {
    if (!perfil) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <CampoInfo etiqueta="Estado Civil" valor={perfil.estadoCivil} />
        <CampoInfo etiqueta="Cónyuge" valor={perfil.nombreConyuge} />
        <CampoInfo
          etiqueta="Hijos"
          valor={perfil.tieneHijos ? `Sí (${perfil.numeroHijos ?? '?'} hijos)` : 'No'}
        />
        <CampoInfo etiqueta="Nivel Académico" valor={perfil.nivelAcademico} />
        <CampoInfo etiqueta="Ocupación" valor={perfil.ocupacion} />
        <CampoInfo etiqueta="Centro Laboral" valor={perfil.centroLaboral} />
      </div>
    );
  };

  const renderIglesia = () => {
    if (!perfil) return null;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <CampoInfo etiqueta="Red Apostólica" valor={perfil.red} />
          <CampoInfo
            etiqueta="Tiempo en la Iglesia"
            valor={perfil.tiempoIglesiaMeses !== null ? `${perfil.tiempoIglesiaMeses} meses` : null}
          />
          <CampoInfo etiqueta="Ministerio Adicional" valor={perfil.ministerioAdicional} />
          <CampoInfo
            etiqueta="Líder Directo"
            valor={perfil.nombreLider ? (
              <div>
                <p className="font-semibold">{perfil.nombreLider}</p>
                {perfil.telLider && (
                  <p className="text-label-sm text-on-surface-variant font-mono">Tel: {perfil.telLider}</p>
                )}
              </div>
            ) : null}
          />
          <CampoInfo
            etiqueta="Círculo de Amistad"
            valor={perfil.circuloAmistad ? (
              <div>
                <p className="font-semibold">{perfil.circuloAmistad}</p>
                {perfil.circuloAmistadDesde && (
                  <p className="text-label-sm text-on-surface-variant">Desde: {perfil.circuloAmistadDesde}</p>
                )}
              </div>
            ) : null}
          />
          <CampoInfo
            etiqueta="Bautismo en Agua"
            valor={perfil.bautizadoAgua ? (
              <div>
                <span className="bg-tertiary/10 text-tertiary text-label-sm px-2.5 py-0.5 rounded font-semibold inline-block mb-1">
                  Sí Bautizado
                </span>
                {perfil.fechaBautismo && (
                  <p className="text-label-sm text-on-surface-variant">
                    Fecha: {formatearFechaVisual(perfil.fechaBautismo)}
                  </p>
                )}
              </div>
            ) : 'No Bautizado'}
          />
        </div>

        <div className="border-t border-outline-variant/20 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-surface-container-low rounded-lg">
            <p className="text-label-sm font-bold text-on-surface mb-1 flex items-center gap-1">
              <Icono nombre="menu_book" color="var(--color-primary)" />
              Clases Bíblicas de Niños
            </p>
            <p className="text-body-sm text-on-surface">
              {perfil.clasesBiblicasNinos ? (
                <span className="inline-flex items-center gap-1 bg-tertiary/10 text-tertiary px-2.5 py-0.5 rounded font-semibold text-label-sm">
                  <Icono nombre="check_circle" size={14} /> Completado
                </span>
              ) : (
                <span className="text-on-surface-variant italic">No completadas</span>
              )}
            </p>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg">
            <p className="text-label-sm font-bold text-on-surface mb-1 flex items-center gap-1">
              <Icono nombre="school" color="var(--color-primary)" />
              Capacitación para Enseñanza
            </p>
            <p className="text-body-sm text-on-surface">
              {perfil.capacitacionEnsenanza ? (
                <span className="inline-flex items-center gap-1 bg-tertiary/10 text-tertiary px-2.5 py-0.5 rounded font-semibold text-label-sm">
                  <Icono nombre="check_circle" size={14} /> Completada
                </span>
              ) : (
                <span className="text-on-surface-variant italic">No completada</span>
              )}
            </p>
          </div>
        </div>

        {perfil.observacionesEspirituales && (
          <div className="p-3 bg-surface-container-low/50 rounded-lg">
            <p className="text-label-sm font-bold text-on-surface-variant mb-1">
              Observaciones Espirituales y Notas de Liderazgo
            </p>
            <p className="text-body-sm text-on-surface whitespace-pre-line italic">
              &ldquo;{perfil.observacionesEspirituales}&rdquo;
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* ── Cabecera ─────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface">Ficha de Personal</h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Información completa de {personal.nombreCompleto}.
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* ── Hero ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center gap-4 px-6 py-5 border-b border-outline-variant bg-surface-container-low/40">
          <div className="bg-primary text-on-primary rounded-full w-14 h-14 text-[20px] font-bold flex items-center justify-center shadow-md shrink-0">
            {iniciales}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-title-md font-title-md text-on-surface">{personal.nombreCompleto}</h3>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mt-1">
              <span className="bg-surface-container text-on-surface px-3 py-0.5 rounded-full text-label-sm font-semibold">
                {perfil?.rol ?? personal.rol}
              </span>
              {perfil && (
                <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-label-sm font-semibold ${perfil.activo ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                  <Icono nombre={perfil.activo ? 'check_circle' : 'cancel'} size={14} />
                  {perfil.activo ? 'Activo' : 'Inactivo'}
                </span>
              )}
              {personal.grupoAsignado && (
                <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
                  <Icono nombre="group" size={14} />
                  {personal.grupoAsignado}
                </span>
              )}
            </div>
          </div>
        </div>

        {perfil?.suspensionActiva && (
          <div className="mx-6 mt-4 flex gap-3 bg-error/10 border border-error/30 text-error rounded-xl p-4 items-start">
            <Icono nombre="gavel" size={24} color="var(--color-error)" />
            <div className="space-y-1">
              <h4 className="text-label-md font-bold uppercase tracking-wide">Suspension de Servicio Activa</h4>
              <p className="text-body-sm">
                Motivo: <strong className="font-semibold">{perfil.suspensionActiva.categoriaMotivo}</strong>.{' '}
                &ldquo;{perfil.suspensionActiva.motivo}&rdquo;
              </p>
              <p className="text-label-sm font-medium">
                Desde: {formatearFechaVisual(perfil.suspensionActiva.fechaInicio)}
                {perfil.suspensionActiva.fechaFin && <> · Hasta: {formatearFechaVisual(perfil.suspensionActiva.fechaFin)}</>}
              </p>
            </div>
          </div>
        )}

        {/* ── Tabs ─────────────────────────────────── */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 w-fit flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTabActiva(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-label-md font-label-md transition-colors ${tabActiva === tab.key
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
              >
                <Icono nombre={tab.icono} size={16} />
                {tab.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {/* ── Cuerpo ───────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {cargando ? (
            <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined text-[40px] animate-spin" aria-hidden="true">sync</span>
              <p className="text-body-md font-medium">Cargando información...</p>
            </div>
          ) : !perfil ? (
            <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant gap-3">
              <Icono nombre="error" size={40} color="var(--color-error)" />
              <p className="text-body-md font-medium">No se pudo cargar la información.</p>
            </div>
          ) : (
            <>
              {tabActiva === 'general' && renderGeneral()}
              {tabActiva === 'contacto' && renderContacto()}
              {tabActiva === 'personal' && renderPersonal()}
              {tabActiva === 'iglesia' && renderIglesia()}
            </>
          )}
        </div>

        {/* ── Pie ──────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant">
          <button
            type="button"
            onClick={onCerrar}
            className="border border-outline-variant text-on-surface-variant rounded-xl px-5 py-2.5 font-label-md hover:bg-surface-container-high transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalVerPersonal;
