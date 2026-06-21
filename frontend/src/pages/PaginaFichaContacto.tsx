// PaginaFichaContacto.tsx — Vista de contactos de un niño específico (Spec §9.6)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutPrincipal from '../components/LayoutPrincipal';
import type { ContactoNino, Nino } from '../services/tipos';
import { obtenerFichaContacto } from '../services/servicioApi';

// ── Tipos internos ────────────────────────────────────────────────
interface FichaContactoCompleta {
  nino: Nino;
  padres: ContactoNino[];
  autorizados: ContactoNino[];
  temporales: ContactoNino[];
}

// (mocks eliminados — la ficha se carga del backend)



// ── Helper: color avatar ──────────────────────────────────────────
const colorAvatar = (nombre: string) => {
  const paleta = ['bg-primary/20 text-primary','bg-tertiary/20 text-tertiary',
                  'bg-secondary/20 text-secondary','bg-error/10 text-error'];
  return paleta[nombre.charCodeAt(0) % paleta.length];
};

// ── Página ────────────────────────────────────────────────────────
const PaginaFichaContacto: React.FC = () => {
  const { idNino } = useParams<{ idNino: string }>();
  const navigate   = useNavigate();

  const [ficha,    setFicha]    = useState<FichaContactoCompleta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);

  const cargarFicha = useCallback(async (id: number) => {
    setCargando(true);
    try {
      const datos = await obtenerFichaContacto(id);
      setFicha(datos as unknown as FichaContactoCompleta);
    } catch {
      setNoEncontrado(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (idNino) cargarFicha(Number(idNino));
  }, [idNino, cargarFicha]);

  // ── Boton volver en barra superior
  const botonVolver = (
    <button
      onClick={() => navigate('/directorio')}
      className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-label-sm"
      aria-label="Volver al directorio"
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_back</span>
      Directorio
    </button>
  );

  if (!cargando && noEncontrado) {
    return (
      <LayoutPrincipal titulo="Directorio de Contacto" accionBarra={botonVolver}>
        <div className="flex flex-col items-center gap-4 py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-[56px] opacity-30" aria-hidden="true">person_off</span>
          <p className="text-body-md">Ficha de contacto no encontrada.</p>
          <button onClick={() => navigate('/directorio')} className="text-primary text-label-md hover:underline">
            Volver al directorio
          </button>
        </div>
      </LayoutPrincipal>
    );
  }

  return (
    <LayoutPrincipal titulo="Directorio de Contacto" accionBarra={botonVolver}>
      <div className="max-w-5xl">
        {/* ── Subtítulo del niño ──────────────────── */}
        {!cargando && ficha && (
          <p className="text-body-sm text-on-surface-variant mb-stack-lg">
            Estudiante:{' '}
            <span className="font-semibold text-on-surface">{ficha.nino.nombreCompleto}</span>
            {' · '}{ficha.nino.grupo.nombre}
          </p>
        )}

        {/* Skeleton global */}
        {cargando && (
          <div className="space-y-8 animate-pulse">
            <div className="h-6 w-48 bg-surface-container-high rounded-full" />
            <div className="h-32 bg-surface-container-high rounded-xl" />
            <div className="h-6 w-48 bg-surface-container-high rounded-full" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-surface-container-high rounded-xl" />
              <div className="h-24 bg-surface-container-high rounded-xl" />
            </div>
          </div>
        )}

        {!cargando && ficha && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── Columna izquierda (col-span-8) ─── */}
            <div className="lg:col-span-8 space-y-8">

              {/* Sección: Padres / Tutores */}
              <section aria-label="Padres y tutores">
                <div className="flex items-center gap-2 mb-stack-md">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">family_history</span>
                  <h2 className="text-headline-md font-headline-md text-on-surface">Padres / Tutores</h2>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-x-auto shadow-sm">
                  <table className="w-full text-left min-w-[500px]">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="px-2.5 py-2.5 text-label-md font-label-md text-on-surface-variant">Nombre</th>
                        <th className="px-2.5 py-2.5 text-label-md font-label-md text-on-surface-variant">Relación</th>
                        <th className="px-2.5 py-2.5 text-label-md font-label-md text-on-surface-variant text-right">Contacto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {ficha.padres.map((p, i) => (
                        <tr key={i} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-2.5 py-2">
                            <p className="text-label-md font-label-md text-on-surface">
                              {p.nombres} {p.apellidos}
                            </p>
                            <p className="text-body-sm text-on-surface-variant">{p.telefono}</p>
                          </td>
                          <td className="px-2.5 py-2">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                              {p.parentesco}
                            </span>
                          </td>
                          <td className="px-2.5 py-2 text-right">
                            <a
                              href={`tel:${p.telefono.replace(/-/g, '')}`}
                              className="inline-flex items-center justify-center h-10 w-10 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                              aria-label={`Llamar a ${p.nombres}`}
                            >
                              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">call</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Sección: Personas Autorizadas */}
              {ficha.autorizados.length > 0 && (
                <section aria-label="Personas autorizadas para retirar">
                  <div className="flex items-center gap-2 mb-stack-md">
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">verified_user</span>
                    <h2 className="text-headline-md font-headline-md text-on-surface">Personas Autorizadas</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                    {ficha.autorizados.map((a, i) => {
                      const iniciales = `${a.nombres[0]}${a.apellidos[0]}`.toUpperCase();
                      return (
                        <div
                          key={i}
                          className="flex items-center p-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:border-primary/40 transition-colors group"
                        >
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 font-bold text-label-md border-2 border-primary-fixed ${colorAvatar(a.nombres)}`}
                            aria-hidden="true"
                          >
                            {iniciales}
                          </div>
                          <div className="ml-4 flex-1 min-w-0">
                            <p className="text-label-md font-label-md text-on-surface group-hover:text-primary transition-colors truncate">
                              {a.nombres} {a.apellidos}
                            </p>
                            <p className="text-body-sm text-on-surface-variant">{a.parentesco}</p>
                          </div>
                          <a
                            href={`tel:${a.telefono.replace(/-/g, '')}`}
                            className="w-12 h-12 bg-surface-container-high text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all active:scale-90 shrink-0"
                            aria-label={`Llamar a ${a.nombres}`}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">call</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* ── Columna derecha (col-span-4) ──── */}
            <div className="lg:col-span-4">
              <section className="sticky top-24 space-y-4" aria-label="Tutores temporales">
                <div className="flex items-center justify-between mb-stack-md">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary" aria-hidden="true">schedule</span>
                    <h2 className="text-headline-md font-headline-md text-on-surface">Tutores Temporales</h2>
                  </div>
                  <span className="bg-secondary/15 text-secondary px-3 py-1 rounded-full text-label-sm">
                    Solo hoy
                  </span>
                </div>

                {ficha.temporales.length === 0 ? (
                  <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 text-center text-body-sm text-on-surface-variant">
                    Sin tutores temporales registrados para hoy.
                  </div>
                ) : (
                  ficha.temporales.map((t, i) => (
                    <div
                      key={i}
                      className="bg-secondary-fixed text-on-secondary-fixed p-6 rounded-2xl border border-secondary shadow-md relative overflow-hidden"
                    >
                      {/* Icono decorativo de fondo */}
                      <div className="absolute -top-4 -right-4 opacity-10" aria-hidden="true">
                        <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          warning
                        </span>
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-on-secondary-fixed text-secondary-fixed rounded-full flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined" aria-hidden="true">person</span>
                          </div>
                          <div>
                            <p className="text-label-md font-bold text-lg">{t.nombres} {t.apellidos}</p>
                            <p className="text-[12px] opacity-90">{t.parentesco} · Autorizada para recogida hoy</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-sm" aria-hidden="true">phone_iphone</span>
                            <span>{t.telefono}</span>
                          </div>
                          <a
                            href={`tel:${t.telefono.replace(/-/g, '')}`}
                            className="w-full bg-on-secondary-fixed text-secondary-fixed py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                            aria-label={`Llamar a ${t.nombres}`}
                          >
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
                              call
                            </span>
                            Llamar ahora
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Nota informativa */}
                <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant">
                  <p className="text-[12px] text-on-surface-variant flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm shrink-0 mt-0.5" aria-hidden="true">info</span>
                    Los tutores temporales deben presentar una identificación oficial válida al momento de la recogida del estudiante.
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaFichaContacto;
