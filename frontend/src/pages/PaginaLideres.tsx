// PaginaLideres.tsx — Módulo de Administración de Líderes (Spec §5.1)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import ModalConfirmar from '../components/ModalConfirmar';
import { toast } from 'sonner';
import {
  listarLideresActivos,
  crearLider,
  inactivarLider,
  type LiderApi,
} from '../services/servicioApi';
import { filtrarSoloLetras, formatearTelefono } from '../services/validacionEntrada';

const PaginaLideres: React.FC = () => {
  const [lideres, setLideres] = useState<LiderApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);
  const [modalCrear, setModalCrear] = useState(false);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [modalConfirmarInactivar, setModalConfirmarInactivar] = useState(false);
  const [liderAInactivar, setLiderAInactivar] = useState<LiderApi | null>(null);

  const [nuevoLider, setNuevoLider] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await listarLideresActivos();
      setLideres(datos);
    } catch (err) {
      console.error('Error cargando líderes:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const lideresFiltrados = useMemo(() => {
    return lideres.filter((l) =>
      l.nombreCompleto.toLowerCase().includes(filtroNombre.toLowerCase())
    );
  }, [lideres, filtroNombre]);

  const lideresPaginados = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return lideresFiltrados.slice(inicio, inicio + porPagina);
  }, [lideresFiltrados, pagina, porPagina]);

  const handleCrear = useCallback(async () => {
    if (!nuevoLider.nombres.trim() || !nuevoLider.apellidos.trim()) {
      toast.error('Por favor complete los nombres y apellidos.');
      return;
    }
    setCargandoAccion(true);
    try {
      await crearLider({
        nombres: nuevoLider.nombres,
        apellidos: nuevoLider.apellidos,
        telefono: nuevoLider.telefono.trim() ? nuevoLider.telefono.trim() : undefined,
      });
      toast.success('Líder registrado correctamente.');
      setModalCrear(false);
      setNuevoLider({ nombres: '', apellidos: '', telefono: '' });
      cargarDatos();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar líder.');
    } finally {
      setCargandoAccion(false);
    }
  }, [nuevoLider, cargarDatos]);

  const handleInactivar = useCallback((l: LiderApi) => {
    setLiderAInactivar(l);
    setModalConfirmarInactivar(true);
  }, []);

  const confirmarInactivar = async () => {
    if (!liderAInactivar) return;
    try {
      await inactivarLider(liderAInactivar.idLider);
      toast.success(`Líder ${liderAInactivar.nombreCompleto} inactivado correctamente.`);
      cargarDatos();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Error al inactivar líder.');
    } finally {
      setLiderAInactivar(null);
    }
  };

  const columnas: ColumnaTabla<LiderApi>[] = [
    {
      id: 'nombre',
      encabezado: 'Nombre Completo',
      ordenablePor: 'nombreCompleto',
      render: (l) => (
        <span className="text-on-surface font-semibold">{l.nombreCompleto}</span>
      ),
    },
    {
      id: 'telefono',
      encabezado: 'Teléfono Principal',
      render: (l) => (
        <span className="text-body-md text-on-surface font-mono">
          {l.telefonoPrincipal || <span className="text-on-surface-variant italic text-label-sm">No registrado</span>}
        </span>
      ),
    },
    {
      id: 'activo',
      encabezado: 'Estado',
      render: (l) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${l.activo ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container-high text-on-surface-variant'}`}>
          {l.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <LayoutPrincipal titulo="Líderes Activos">
      <div className="space-y-stack-lg max-w-[1440px]">
        
        {/* ── Barra superior de acciones ────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-gutter">
          {/* Input de filtro */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtroNombre}
              onChange={(e) => {
                setFiltroNombre(e.target.value);
                setPagina(1);
              }}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-variant/60"
            />
          </div>

          {/* Botón nuevo */}
          <button
            onClick={() => setModalCrear(true)}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Registrar Líder
          </button>
        </div>

        {/* ── Tabla de Líderes ──────────────────────────── */}
        <TablaBase
          columnas={columnas}
          filas={lideresPaginados}
          obtenerClave={(l) => l.idLider}
          pagina={pagina}
          total={lideresFiltrados.length}
          porPagina={porPagina}
          onCambiarPagina={setPagina}
          onCambiarPorPagina={setPorPagina}
          cargando={cargando}
          mensajeVacio="No se encontraron líderes activos."
          acciones={{
            onEliminar: handleInactivar,
          }}
        />

        {/* ── Modal de Creación ─────────────────────────── */}
        {modalCrear && (
          <div
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalCrear(false);
            }}
          >
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[28px]">
                    person_add
                  </span>
                  Registrar Líder
                </h2>
                <button
                  onClick={() => setModalCrear(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    value={nuevoLider.nombres}
                    onChange={(e) =>
                      setNuevoLider((p) => ({ ...p, nombres: filtrarSoloLetras(e.target.value) }))
                    }
                    placeholder="Ej. Juan Andrés"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={nuevoLider.apellidos}
                    onChange={(e) =>
                      setNuevoLider((p) => ({ ...p, apellidos: filtrarSoloLetras(e.target.value) }))
                    }
                    placeholder="Ej. Pérez Gómez"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-1">
                    Teléfono Principal (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={nuevoLider.telefono}
                    onChange={(e) =>
                      setNuevoLider((p) => ({ ...p, telefono: formatearTelefono(e.target.value, p.telefono) }))
                    }
                    placeholder="Ej. +505 8888 8888"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  onClick={() => setModalCrear(false)}
                  disabled={cargandoAccion}
                  className="border border-outline-variant text-on-surface-variant rounded-xl px-5 py-2.5 font-label-md hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrear}
                  disabled={cargandoAccion || !nuevoLider.nombres.trim() || !nuevoLider.apellidos.trim()}
                  className="bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                >
                  {cargandoAccion && (
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  )}
                  {cargandoAccion ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ModalConfirmar
        abierto={modalConfirmarInactivar}
        onCerrar={() => { setModalConfirmarInactivar(false); setLiderAInactivar(null); }}
        titulo="Inactivar Líder"
        mensaje={`¿Está seguro de que desea inactivar al líder "${liderAInactivar?.nombreCompleto}"?`}
        onConfirmar={confirmarInactivar}
        tipo="danger"
      />
    </LayoutPrincipal>
  );
};

export default PaginaLideres;
