// src/pages/PaginaPerfilPersonal.tsx — Perfil completo de un miembro del personal (Spec §9.11)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutPrincipal from '../components/LayoutPrincipal';
import { toast } from 'react-hot-toast';

// ── Interfaces v5.1 ──────────────────────────────────────────────────────────
interface InfoPersonal {
  estadoCivil: string | null;
  nombreConyuge: string | null;
  tieneHijos: boolean;
  numeroHijos: number | null;
  ocupacion: string | null;
  centroLaboral: string | null;
  nivelAcademico: string | null;
}

interface InfoIglesia {
  estadoOperativo: string | null;
  tiempoIglesiaMeses: number | null;
  ministerioAdicional: string | null;
  bautizadoAgua: boolean;
  fechaBautismo: string | null;
  fechaBautismoPrecision: string | null;
  idRed: number | null;
  idCirculo: number | null;
  circuloAmistad: string | null;
  circuloAmistadDesde: string | null;
  circuloAmistadPrecision: string | null;
  clasesBiblicasNinos: boolean;
  clasesBiblicasDetalle: string | null;
  capacitacionEnsenanza: boolean;
  capacitacionDetalle: string | null;
  observacionesEspirituales: string | null;
  idLider: number | null;
  nombreLider: string | null;
  telLider: string | null;
  red: string | null;
}

interface TelefonoEstructurado {
  idTelefono: number;
  tipo: 'Casa' | 'Oficina' | 'Claro' | 'Movistar' | 'Otro';
  numero: string;
  tieneWhatsapp: boolean;
  esPrincipal: boolean;
}

interface DireccionEstructurada {
  idDireccion: number;
  tipoDireccion: 'Residencial' | 'Laboral' | 'Referencia' | 'Otro';
  ciudadDepartamento: string;
  municipio: string;
  distrito: string;
  barrio: string;
  direccionExacta: string;
  esPrincipal: boolean;
}

interface GrupoAsignado { idGrupo: number; grupo: string; }
interface TurnoAsignado { idTurno: number; turno: string; }
interface RequisitoItem {
  nombre: string;
  tipo: string;
  obligatorio: boolean;
  cumplido: boolean;
  fechaCumplido: string | null;
  notas: string | null;
}

interface SuspensionActiva {
  idSuspension: number;
  fechaInicio: string;
  fechaFin: string | null;
  categoriaMotivo: string;
  motivo: string;
}

interface PerfilPersonal {
  idPersona: number;
  nombres: string;
  apellidos: string;
  sexo: 'Masculino' | 'Femenino' | null;
  cedula: string | null;
  usuario: string;
  rol: string;
  nivelJerarquico: number;
  fechaIngreso: string;
  activo: boolean;
  infoPersonal: InfoPersonal | null;
  infoIglesia: InfoIglesia | null;
  telefonos: TelefonoEstructurado[];
  direcciones: DireccionEstructurada[];
  grupos: GrupoAsignado[];
  turnos: TurnoAsignado[];
  requisitos: RequisitoItem[];
  suspensionActiva: SuspensionActiva | null;
}

// ── Sub-componentes de Presentación ──────────────────────────────────────────
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

const Icono: React.FC<{ nombre: string; color?: string; size?: number }> = ({ nombre, color, size = 20 }) => (
  <span className="material-symbols-outlined shrink-0" style={{ fontSize: `${size}px`, color, verticalAlign: 'middle' }}>
    {nombre}
  </span>
);

// ── Componente Principal ─────────────────────────────────────────────────────
const PaginaPerfilPersonal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const [perfil, setPerfil] = useState<PerfilPersonal | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    const token = localStorage.getItem('ed_token') ?? '';
    fetch(`/api/personal/${id}/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.exito) setPerfil(data.datos);
        else toast.error(data.mensaje ?? 'No se pudo cargar el perfil.');
      })
      .catch(() => toast.error('Error de conexión con el servidor si.'))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <LayoutPrincipal titulo="Cargando Perfil">
        <div className="flex flex-col justify-center items-center h-[50vh] text-on-surface-variant gap-3">
          <span className="material-symbols-outlined text-[48px] animate-spin" aria-hidden="true">sync</span>
          <p className="text-body-md font-medium">Cargando perfil del personal...</p>
        </div>
      </LayoutPrincipal>
    );
  }

  if (!perfil) {
    return (
      <LayoutPrincipal titulo="Error">
        <div className="p-gutter text-center flex flex-col items-center justify-center h-[50vh] gap-4">
          <Icono nombre="error" size={48} color="var(--color-error)" />
          <p className="text-body-lg text-error font-medium">Perfil no encontrado.</p>
          <button
            onClick={() => navegar(-1)}
            className="flex items-center gap-2 border border-outline-variant hover:bg-surface-container-low px-4 py-2 rounded-lg cursor-pointer text-body-sm font-semibold transition-colors"
          >
            <Icono nombre="arrow_back" size={18} />
            Volver
          </button>
        </div>
      </LayoutPrincipal>
    );
  }

  const iniciales = `${perfil.nombres[0] ?? ''}${perfil.apellidos[0] ?? ''}`.toUpperCase();
  const reqCumplidos = perfil.requisitos.filter(r => r.cumplido).length;
  const reqObligTotal = perfil.requisitos.filter(r => r.obligatorio).length;
  const reqObligCumpl = perfil.requisitos.filter(r => r.obligatorio && r.cumplido).length;
  const porcReq = perfil.requisitos.length > 0 ? Math.round((reqCumplidos / perfil.requisitos.length) * 100) : 0;


  return (
    <LayoutPrincipal titulo={`Perfil · ${perfil.nombres} ${perfil.apellidos}`}>
      <div className="space-y-stack-lg max-w-[1440px]">

        {/* ── Botón volver ─────────────────────────────────── */}
        <button
          onClick={() => navegar(-1)}
          className="inline-flex items-center gap-2 border border-outline-variant/50 hover:bg-surface-container-low px-4 py-2 rounded-lg cursor-pointer text-label-md font-semibold text-on-surface-variant transition-colors"
        >
          <Icono nombre="arrow_back" size={18} />
          Volver
        </button>

        {/* ── Alerta de Suspensión Activa ──────────────────── */}
        {perfil.suspensionActiva && (
          <div className="flex gap-4 bg-error/10 border border-error/30 text-error rounded-xl p-gutter shadow-sm items-start">
            <span className="material-symbols-outlined text-[28px] text-error shrink-0 mt-0.5" aria-hidden="true">
              gavel
            </span>
            <div className="space-y-1">
              <h3 className="text-label-md font-bold uppercase tracking-wide">Suspension de Servicio Activa</h3>
              <p className="text-body-sm">
                Este miembro del personal está suspendido temporalmente por motivo de{' '}
                <strong className="font-semibold">{perfil.suspensionActiva.categoriaMotivo}</strong>.
              </p>
              <p className="text-body-sm italic">
                &ldquo;{perfil.suspensionActiva.motivo}&rdquo;
              </p>
              <div className="flex gap-4 mt-2 text-label-sm font-medium">
                <span>Desde: {perfil.suspensionActiva.fechaInicio}</span>
                {perfil.suspensionActiva.fechaFin && <span>Hasta: {perfil.suspensionActiva.fechaFin}</span>}
              </div>
            </div>
          </div>
        )}

        {/* ── Hero Card ────────────────────────────────────── */}
        <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="bg-primary text-on-primary rounded-full w-20 h-20 text-[32px] font-bold flex items-center justify-center shadow-md">
            {iniciales}
          </div>

          {/* Datos Principales */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-headline-md font-bold text-on-surface">
              {perfil.nombres} {perfil.apellidos}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-label-sm">
              <span className="bg-surface-container text-on-surface px-3 py-1 rounded-full font-semibold">
                {perfil.rol}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold ${perfil.activo ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                }`}>
                <Icono nombre={perfil.activo ? 'check_circle' : 'cancel'} size={14} />
                {perfil.activo ? 'Activo' : 'Inactivo'}
              </span>
              {perfil.suspensionActiva && (
                <span className="bg-error text-on-error px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1">
                  <Icono nombre="gavel" size={14} />
                  Suspendido
                </span>
              )}
              <span className="text-on-surface-variant flex items-center gap-1 ml-2">
                <Icono nombre="calendar_today" size={14} />
                Ingresó: {new Date(perfil.fechaIngreso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Layout Principal (Grid de 2 Columnas) ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

          {/* ── Columna Izquierda: Identificación y Contacto ── */}
          <div className="lg:col-span-4 space-y-stack-lg">

            {/* Identidad */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30">
              <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2 mb-stack-md border-b border-outline-variant/20 pb-2">
                <Icono nombre="badge" size={18} color="var(--color-primary)" />
                Identificación
              </h3>
              <div className="space-y-3">
                <CampoInfo etiqueta="Sexo" valor={perfil.sexo} />
                <CampoInfo etiqueta="Cédula de Identidad" valor={perfil.cedula} />
                <CampoInfo
                  etiqueta="Usuario del Sistema"
                  valor={
                    <code className="bg-surface-container-low px-2 py-0.5 rounded font-mono text-[13px] text-on-surface">
                      {perfil.usuario}
                    </code>
                  }
                />
              </div>
            </div>

            {/* Teléfonos */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30">
              <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2 mb-stack-md border-b border-outline-variant/20 pb-2">
                <Icono nombre="contact_phone" size={18} color="var(--color-primary)" />
                Teléfonos
              </h3>
              {perfil.telefonos.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant italic">No hay teléfonos registrados.</p>
              ) : (
                <div className="space-y-3">
                  {perfil.telefonos.map((tel) => (
                    <div key={tel.idTelefono} className="flex justify-between items-center bg-surface-container-low/50 p-2 rounded-lg">
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

            {/* Direcciones */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30">
              <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2 mb-stack-md border-b border-outline-variant/20 pb-2">
                <Icono nombre="location_on" size={18} color="var(--color-primary)" />
                Direcciones
              </h3>
              {perfil.direcciones.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant italic">No hay direcciones registradas.</p>
              ) : (
                <div className="space-y-3">
                  {perfil.direcciones.map((dir) => (
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

            {/* Grupos y Turnos */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30 space-y-4">
              <div>
                <h4 className="text-label-sm font-bold text-on-surface mb-2">Grupos Asignados</h4>
                {perfil.grupos.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant italic">Sin grupos asignados.</p>
                ) : (
                  <div>
                    {perfil.grupos.map((g) => (
                      <Chip key={g.idGrupo} texto={g.grupo} icono="group" />
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-outline-variant/20 pt-3">
                <h4 className="text-label-sm font-bold text-on-surface mb-2">Turnos Asignados</h4>
                {perfil.turnos.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant italic">Sin turnos asignados.</p>
                ) : (
                  <div>
                    {perfil.turnos.map((t) => (
                      <Chip key={t.idTurno} texto={t.turno} icono="schedule" />
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── Columna Derecha: Información Personal y Eclesiástica ── */}
          <div className="lg:col-span-8 space-y-stack-lg">

            {/* Familiar y Laboral */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30">
              <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2 mb-stack-lg border-b border-outline-variant/20 pb-2">
                <Icono nombre="family_restroom" size={18} color="var(--color-primary)" />
                Información Familiar y Laboral
              </h3>
              {perfil.infoPersonal ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                  <CampoInfo etiqueta="Estado Civil" valor={perfil.infoPersonal.estadoCivil} />
                  <CampoInfo etiqueta="Cónyuge" valor={perfil.infoPersonal.nombreConyuge} />
                  <CampoInfo
                    etiqueta="Hijos"
                    valor={
                      perfil.infoPersonal.tieneHijos
                        ? `Sí (${perfil.infoPersonal.numeroHijos ?? '?'} hijos)`
                        : 'No'
                    }
                  />
                  <CampoInfo etiqueta="Nivel Académico" valor={perfil.infoPersonal.nivelAcademico} />
                  <CampoInfo etiqueta="Ocupación" valor={perfil.infoPersonal.ocupacion} />
                  <CampoInfo etiqueta="Centro Laboral" valor={perfil.infoPersonal.centroLaboral} />
                </div>
              ) : (
                <p className="text-body-sm text-on-surface-variant italic py-2">
                  No hay información familiar o laboral registrada.
                </p>
              )}
            </div>

            {/* Eclesiástica y Espiritual */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30">
              <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2 mb-stack-lg border-b border-outline-variant/20 pb-2">
                <Icono nombre="church" size={18} color="var(--color-primary)" />
                Información Eclesiástica y Espiritual
              </h3>
              {perfil.infoIglesia ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <CampoInfo etiqueta="Red Apostólica" valor={perfil.infoIglesia.red} />
                    <CampoInfo etiqueta="Estado Operativo" valor={perfil.infoIglesia.estadoOperativo} />
                    <CampoInfo
                      etiqueta="Tiempo en la Iglesia"
                      valor={
                        perfil.infoIglesia.tiempoIglesiaMeses !== null
                          ? `${perfil.infoIglesia.tiempoIglesiaMeses} meses`
                          : null
                      }
                    />
                    <CampoInfo etiqueta="Ministerio Adicional" valor={perfil.infoIglesia.ministerioAdicional} />

                    <CampoInfo
                      etiqueta="Líder Directo"
                      valor={
                        perfil.infoIglesia.nombreLider ? (
                          <div>
                            <p className="font-semibold">{perfil.infoIglesia.nombreLider}</p>
                            {perfil.infoIglesia.telLider && (
                              <p className="text-label-sm text-on-surface-variant font-mono">
                                Tel: {perfil.infoIglesia.telLider}
                              </p>
                            )}
                          </div>
                        ) : null
                      }
                    />

                    <CampoInfo
                      etiqueta="Círculo de Amistad"
                      valor={
                        perfil.infoIglesia.circuloAmistad ? (
                          <div>
                            <p className="font-semibold">{perfil.infoIglesia.circuloAmistad}</p>
                            {perfil.infoIglesia.circuloAmistadDesde && (
                              <p className="text-label-sm text-on-surface-variant">
                                Desde: {perfil.infoIglesia.circuloAmistadDesde}{' '}
                                {perfil.infoIglesia.circuloAmistadPrecision && (
                                  <span className="italic">({perfil.infoIglesia.circuloAmistadPrecision})</span>
                                )}
                              </p>
                            )}
                          </div>
                        ) : null
                      }
                    />

                    <CampoInfo
                      etiqueta="Bautismo en Agua"
                      valor={
                        perfil.infoIglesia.bautizadoAgua ? (
                          <div>
                            <span className="bg-tertiary/10 text-tertiary text-label-sm px-2.5 py-0.5 rounded font-semibold inline-block mb-1">
                              Sí Bautizado
                            </span>
                            {perfil.infoIglesia.fechaBautismo && (
                              <p className="text-label-sm text-on-surface-variant">
                                Fecha: {perfil.infoIglesia.fechaBautismo}{' '}
                                {perfil.infoIglesia.fechaBautismoPrecision && (
                                  <span className="italic">({perfil.infoIglesia.fechaBautismoPrecision})</span>
                                )}
                              </p>
                            )}
                          </div>
                        ) : (
                          'No Bautizado'
                        )
                      }
                    />
                  </div>

                  <div className="border-t border-outline-variant/20 pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-surface-container-low rounded-lg">
                      <p className="text-label-sm font-bold text-on-surface mb-1 flex items-center gap-1">
                        <Icono nombre="menu_book" size={16} color="var(--color-primary)" />
                        Clases Bíblicas de Niños
                      </p>
                      <p className="text-body-sm text-on-surface">
                        {perfil.infoIglesia.clasesBiblicasNinos ? (
                          perfil.infoIglesia.clasesBiblicasDetalle || 'Completado sin detalles'
                        ) : (
                          <span className="text-on-surface-variant italic">No completadas</span>
                        )}
                      </p>
                    </div>

                    <div className="p-3 bg-surface-container-low rounded-lg">
                      <p className="text-label-sm font-bold text-on-surface mb-1 flex items-center gap-1">
                        <Icono nombre="school" size={16} color="var(--color-primary)" />
                        Capacitación para Enseñanza
                      </p>
                      <p className="text-body-sm text-on-surface">
                        {perfil.infoIglesia.capacitacionEnsenanza ? (
                          perfil.infoIglesia.capacitacionDetalle || 'Completada sin detalles'
                        ) : (
                          <span className="text-on-surface-variant italic">No completada</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {perfil.infoIglesia.observacionesEspirituales && (
                    <div className="p-3 bg-surface-container-low/50 rounded-lg">
                      <p className="text-label-sm font-bold text-on-surface-variant mb-1">
                        Observaciones Espirituales y Notas de Liderazgo
                      </p>
                      <p className="text-body-sm text-on-surface whitespace-pre-line italic">
                        &ldquo;{perfil.infoIglesia.observacionesEspirituales}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-body-sm text-on-surface-variant italic py-2">
                  No hay información eclesiástica registrada.
                </p>
              )}
            </div>

            {/* Requisitos */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-stack-md">
                <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2 pb-1">
                  <Icono nombre="task_alt" size={18} color="var(--color-primary)" />
                  Requisitos de Ingreso
                </h3>
                <span className="text-label-sm font-semibold text-on-surface-variant">
                  {reqObligCumpl} de {reqObligTotal} obligatorios cumplidos ({porcReq}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden mb-gutter">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${porcReq === 100 ? 'bg-tertiary' : 'bg-primary'
                    }`}
                  style={{ width: `${porcReq}%` }}
                />
              </div>

              {perfil.requisitos.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant italic text-center py-4">
                  No hay requisitos asignados a este perfil.
                </p>
              ) : (
                <div className="overflow-x-auto border border-outline-variant/30 rounded-lg">
                  <table className="w-full text-left border-collapse text-body-sm">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30 text-label-sm font-semibold">
                        <th className="p-3">Requisito</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3 text-center">Oblig.</th>
                        <th className="p-3 text-center">Estado</th>
                        <th className="p-3">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {perfil.requisitos.map((req, i) => (
                        <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className={`p-3 ${req.obligatorio ? 'font-bold text-on-surface' : 'text-on-surface'}`}>
                            {req.nombre}
                          </td>
                          <td className="p-3">
                            <span className="text-label-sm bg-surface-container px-2 py-0.5 rounded">
                              {req.tipo}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {req.obligatorio ? (
                              <span className="material-symbols-outlined text-primary text-[20px]" aria-label="Sí">check</span>
                            ) : (
                              <span className="text-on-surface-variant font-mono">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-sm font-semibold ${req.cumplido ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                              }`}>
                              <span className="material-symbols-outlined text-[14px]">
                                {req.cumplido ? 'check_circle' : 'cancel'}
                              </span>
                              {req.cumplido ? 'Cumplido' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="p-3 text-on-surface-variant max-w-[200px] truncate" title={req.notas || ''}>
                            {req.notas || <span className="italic text-on-surface-variant/50">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </LayoutPrincipal>
  );
};

export default PaginaPerfilPersonal;
