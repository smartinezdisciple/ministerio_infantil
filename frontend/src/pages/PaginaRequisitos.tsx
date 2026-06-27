// PaginaRequisitos.tsx — Módulo de Requisitos (Spec §9.8)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import { toast } from 'sonner';
import {
  listarRequisitos,
  crearRequisito,
  actualizarRequisito,
  type RequisitoApi,
} from '../services/servicioApi';

const badgeTipo = (tipo: string) => {
  const estilos: Record<string, string> = {
    Formacion: 'bg-primary/15 text-primary',
    Estado_Ministerial: 'bg-tertiary/15 text-tertiary',
    Otro: 'bg-surface-container-high text-on-surface-variant',
  };
  return estilos[tipo] ?? estilos.Otro;
};

const PaginaRequisitos: React.FC = () => {
  const [requisitos, setRequisitos] = useState<RequisitoApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);
  const [modalCrear, setModalCrear] = useState(false);
  const [nuevoReq, setNuevoReq] = useState({
    nombre: '', descripcion: '', tipo: 'Formacion' as RequisitoApi['tipo'],
    idRolRequerido: null as number | null, obligatorio: false, activo: true,
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await listarRequisitos();
      setRequisitos(datos);
    } catch (err) {
      console.error('Error cargando requisitos:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const requisitosFiltrados = useMemo(() => {
    return requisitos.filter(r => {
      if (filtroTipo && r.tipo !== filtroTipo) return false;
      if (filtroActivo === 'activo' && !r.activo) return false;
      if (filtroActivo === 'inactivo' && r.activo) return false;
      return true;
    });
  }, [requisitos, filtroTipo, filtroActivo]);

  const requisitosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return requisitosFiltrados.slice(inicio, inicio + porPagina);
  }, [requisitosFiltrados, pagina, porPagina]);

  const handleCrear = useCallback(async () => {
    if (!nuevoReq.nombre.trim()) return;
    try {
      await crearRequisito(nuevoReq);
      toast.success('Requisito creado exitosamente.');
      setModalCrear(false);
      setNuevoReq({ nombre: '', descripcion: '', tipo: 'Formacion', idRolRequerido: null, obligatorio: false, activo: true });
      cargarDatos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear requisito.');
    }
  }, [nuevoReq, cargarDatos]);

  const handleToggleActivo = useCallback(async (id: number, activo: boolean) => {
    try {
      await actualizarRequisito(id, { activo });
      toast.success(activo ? 'Requisito activado.' : 'Requisito inactivado.');
      cargarDatos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar.');
    }
  }, [cargarDatos]);

  const columnas: ColumnaTabla<RequisitoApi>[] = [
    {
      id: 'nombre',
      encabezado: 'Nombre',
      ordenablePor: 'nombre',
      render: (r) => (
        <div>
          <span className="text-on-surface">{r.nombre}</span>
          {r.descripcion && <p className="text-label-sm text-on-surface-variant">{r.descripcion}</p>}
        </div>
      ),
    },
    {
      id: 'tipo',
      encabezado: 'Tipo',
      ordenablePor: 'tipo',
      render: (r) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${badgeTipo(r.tipo)}`}>
          {r.tipo.replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'obligatorio',
      encabezado: 'Obligatorio',
      render: (r) => (
        <span className={`material-symbols-outlined text-[20px] ${r.obligatorio ? 'text-error' : 'text-outline-variant'}`}>
          {r.obligatorio ? 'priority_high' : 'check_circle'}
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
    <LayoutPrincipal titulo="Requisitos">
      <div className="space-y-stack-lg max-w-[1440px]">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-3">
            <select value={filtroTipo} onChange={(e) => { setFiltroTipo(e.target.value); setPagina(1); }}
              className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 font-body-sm text-on-surface focus:outline-none focus:border-primary">
              <option value="">Todos los tipos</option>
              <option value="Formacion">Formación</option>
              <option value="Estado_Ministerial">Estado Ministerial</option>
              <option value="Otro">Otro</option>
            </select>
            <select value={filtroActivo} onChange={(e) => { setFiltroActivo(e.target.value); setPagina(1); }}
              className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 font-body-sm text-on-surface focus:outline-none focus:border-primary">
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
          <button onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nuevo Requisito
          </button>
        </div>

        <TablaBase
          columnas={columnas}
          filas={requisitosPaginados}
          obtenerClave={(r) => r.idRequisito}
          pagina={pagina}
          total={requisitosFiltrados.length}
          porPagina={porPagina}
          onCambiarPagina={setPagina}
          onCambiarPorPagina={setPorPagina}
          cargando={cargando}
          mensajeVacio="No hay requisitos registrados."
          acciones={{
            onEditar: (r) => handleToggleActivo(r.idRequisito, !r.activo),
          }}
        />

        {modalCrear && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setModalCrear(false); }}>
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h2 className="text-headline-md font-headline-md text-on-surface">Nuevo Requisito</h2>
              <input type="text" value={nuevoReq.nombre} onChange={(e) => setNuevoReq(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Nombre del requisito"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
              <textarea value={nuevoReq.descripcion} onChange={(e) => setNuevoReq(p => ({ ...p, descripcion: e.target.value }))}
                placeholder="Descripción (opcional)" rows={2}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none resize-none" />
              <div className="flex gap-3">
                <select value={nuevoReq.tipo} onChange={(e) => setNuevoReq(p => ({ ...p, tipo: e.target.value as RequisitoApi['tipo'] }))}
                  className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none">
                  <option value="Formacion">Formación</option>
                  <option value="Estado_Ministerial">Estado Ministerial</option>
                  <option value="Otro">Otro</option>
                </select>
                <label className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                  <input type="checkbox" checked={nuevoReq.obligatorio} onChange={(e) => setNuevoReq(p => ({ ...p, obligatorio: e.target.checked }))}
                    className="w-4 h-4 accent-primary" />
                  Obligatorio
                </label>
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

export default PaginaRequisitos;
