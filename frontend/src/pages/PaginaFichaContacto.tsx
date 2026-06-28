// PaginaFichaContacto.tsx — Vista de contactos de un niño específico (Spec §9.6)
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutPrincipal from '../components/LayoutPrincipal';
import type { Nino } from '../services/tipos';
import { obtenerFichaContacto } from '../services/servicioApi';
import { enlaceWhatsApp } from '../services/validacionEntrada';

interface TutorContacto {
  idPersona: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  tieneWhatsapp?: boolean;
  parentesco: string;
  tipo: string;
  activo: boolean;
}

// ── Tipos internos ────────────────────────────────────────────────
interface FichaContactoCompleta {
  nino: Nino;
  tutores: TutorContacto[];
}

// ── Página ────────────────────────────────────────────────────────
const PaginaFichaContacto = () => {
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
          </div>
        )}

        {!cargando && ficha && ficha.tutores.length > 0 && (
          <section aria-label="Tutores">
            <div className="flex items-center gap-2 mb-stack-md">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">family_history</span>
              <h2 className="text-headline-md font-headline-md text-on-surface">Tutores</h2>
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
                  {ficha.tutores.map((t, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-2.5 py-2">
                        <p className="text-label-md font-label-md text-on-surface">
                          {t.nombres} {t.apellidos}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">{t.telefono}</p>
                      </td>
                      <td className="px-2.5 py-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                          {t.parentesco}
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={enlaceWhatsApp(t.telefono)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-10 w-10 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                            aria-label={`WhatsApp a ${t.nombres}`}
                          >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chat</span>
                          </a>
                          <a
                            href={`tel:${t.telefono.replace(/-/g, '')}`}
                            className="inline-flex items-center justify-center h-10 w-10 bg-primary text-on-primary rounded-full transition-all shadow-sm active:scale-95"
                            aria-label={`Llamar a ${t.nombres}`}
                          >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">call</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaFichaContacto;
