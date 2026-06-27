// PaginaRedes.tsx — Módulo de Redes (Spec §9.14)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import { toast } from 'sonner';
import {
  listarRedes,
  crearRed,
  actualizarRed,
  type RedApi,
} from '../services/servicioApi';

const PaginaRedes: React.FC = () => {
  const [redes, setRedes] = useState<RedApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);
  const [modalCrear, setModalCrear] = useState(false);
  const [nuevaRed, setNuevaRed] = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await listarRedes();
      setRedes(datos);
    } catch (err) {
      console.error('Error cargando redes:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const redesPaginadas = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return redes.slice(inicio, inicio + porPagina);
  }, [redes, pagina, porPagina]);

  const handleCrear = useCallback(async () => {
    if (!nuevaRed.trim()) return;
    try {
      await crearRed({ nombre: nuevaRed.trim() });
      toast.success('Red creada correctamente.');
      setModalCrear(false);
      setNuevaRed('');
      cargarDatos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear red.');
    }
  }, [nuevaRed, cargarDatos]);

  const handleToggleActivo = useCallback(async (id: number, activo: boolean) => {
    try {
      await actualizarRed(id, { activo });
      toast.success(activo ? 'Red activada.' : 'Red inactivada.');
      cargarDatos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar.');
    }
  }, [cargarDatos]);

  const columnas: ColumnaTabla<RedApi>[] = [
    {
      id: 'nombre',
      encabezado: 'Red',
      ordenablePor: 'nombre',
      render: (r) => <span className="text-on-surface font-semibold">{r.nombre}</span>,
    },
    {
      id: 'activo',
      encabezado: 'Estado',
      render: (r) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${r.activo ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container-high text-on-surface-variant'}`}>
          {r.activo ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
  ];

  return (
    <LayoutPrincipal titulo="Redes">
      <div className="space-y-stack-lg max-w-[1440px]">
        <div className="flex justify-end">
          <button onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nueva Red
          </button>
        </div>

        <TablaBase
          columnas={columnas}
          filas={redesPaginadas}
          obtenerClave={(r) => r.idRed}
          pagina={pagina}
          total={redes.length}
          porPagina={porPagina}
          onCambiarPagina={setPagina}
          onCambiarPorPagina={setPorPagina}
          cargando={cargando}
          mensajeVacio="No hay redes registradas."
          acciones={{
            onEditar: (r) => handleToggleActivo(r.idRed, !r.activo),
          }}
        />

        {modalCrear && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setModalCrear(false); }}>
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h2 className="text-headline-md font-headline-md text-on-surface">Nueva Red</h2>
              <input type="text" value={nuevaRed} onChange={(e) => setNuevaRed(e.target.value)}
                placeholder="Nombre de la red"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button onClick={() => setModalCrear(false)}
                  className="border border-outline-variant text-on-surface-variant rounded-xl px-5 py-2.5 font-label-md hover:bg-surface-container-high transition-colors">
                  Cancelar
                </button>
                <button onClick={handleCrear}
                  className="bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all">
                  Crear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaRedes;
