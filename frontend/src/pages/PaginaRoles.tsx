// PaginaRoles.tsx — Módulo de Roles (Spec §9.9)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import { toast } from 'react-hot-toast';
import {
  listarRoles,
  crearRol,
  actualizarRol,
  type RolApi,
} from '../services/servicioApi';

const PaginaRoles: React.FC = () => {
  const [roles, setRoles] = useState<RolApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);
  const [modalCrear, setModalCrear] = useState(false);
  const [nuevoRol, setNuevoRol] = useState({ nombreRol: '' as RolApi['nombreRol'], nivelJerarquico: 1, activo: true });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await listarRoles();
      setRoles(datos);
    } catch (err) {
      console.error('Error cargando roles:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const rolesPaginados = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return roles.slice(inicio, inicio + porPagina);
  }, [roles, pagina, porPagina]);

  const handleCrear = useCallback(async () => {
    if (!nuevoRol.nombreRol.trim()) return;
    try {
      await crearRol(nuevoRol);
      toast.success('Rol creado correctamente.');
      setModalCrear(false);
      setNuevoRol({ nombreRol: 'Colaborador', nivelJerarquico: 1, activo: true });
      cargarDatos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear rol.');
    }
  }, [nuevoRol, cargarDatos]);

  const handleToggleActivo = useCallback(async (id: number, activo: boolean) => {
    try {
      await actualizarRol(id, { activo });
      toast.success(activo ? 'Rol activado.' : 'Rol inactivado.');
      cargarDatos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar.');
    }
  }, [cargarDatos]);

  const columnas: ColumnaTabla<RolApi>[] = [
    {
      id: 'nombre',
      encabezado: 'Rol',
      ordenablePor: 'nombreRol',
      render: (r) => <span className="text-on-surface font-semibold">{r.nombreRol}</span>,
    },
    {
      id: 'nivel',
      encabezado: 'Nivel',
      ordenablePor: 'nivelJerarquico',
      render: (r) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-label-md">
          {r.nivelJerarquico}
        </span>
      ),
    },
    {
      id: 'activo',
      encabezado: 'Estado',
      render: (r) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${r.activo ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container-high text-on-surface-variant'}`}>
          {r.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <LayoutPrincipal titulo="Roles">
      <div className="space-y-stack-lg max-w-[1440px]">
        <div className="flex justify-end">
          <button onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nuevo Rol
          </button>
        </div>

        <TablaBase
          columnas={columnas}
          filas={rolesPaginados}
          obtenerClave={(r) => r.idRol}
          pagina={pagina}
          total={roles.length}
          porPagina={porPagina}
          onCambiarPagina={setPagina}
          onCambiarPorPagina={setPorPagina}
          cargando={cargando}
          mensajeVacio="No hay roles registrados."
          acciones={{
            onEditar: (r) => handleToggleActivo(r.idRol, !r.activo),
          }}
        />

        {modalCrear && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setModalCrear(false); }}>
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h2 className="text-headline-md font-headline-md text-on-surface">Nuevo Rol</h2>
              <select value={nuevoRol.nombreRol} onChange={(e) => setNuevoRol(p => ({ ...p, nombreRol: e.target.value as RolApi['nombreRol'] }))}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none">
                <option value="Colaborador">Colaborador</option>
                <option value="Maestro">Maestro</option>
                <option value="Staff">Staff</option>
                <option value="Coordinador General">Coordinador General</option>
              </select>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1">Nivel Jerárquico (1-4)</label>
                <input type="number" min={1} max={4} value={nuevoRol.nivelJerarquico}
                  onChange={(e) => setNuevoRol(p => ({ ...p, nivelJerarquico: Math.min(4, Math.max(1, Number(e.target.value))) }))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
              </div>
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

export default PaginaRoles;
