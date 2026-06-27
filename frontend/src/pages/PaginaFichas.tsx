import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import {
  listarFichas,
  obtenerDisponibilidadFichas,
  crearFicha,
  actualizarFicha,
  type FichaApi,
  type DisponibilidadFichas,
} from '../services/servicioApi';

const badgeEstado = (estado: string) => {
  const estilos: Record<string, string> = {
    Activa: 'bg-tertiary/15 text-tertiary',
    Inactiva: 'bg-surface-container-high text-on-surface-variant',
    Extraviada: 'bg-error-container text-error',
  };
  return estilos[estado] ?? estilos.Activa;
};

const PaginaFichas: React.FC = () => {
  const [fichas, setFichas] = useState<FichaApi[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadFichas[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [fixtureEditando, setFixtureEditando] = useState<FichaApi | null>(null);
  const [nuevaFixture, setNuevaFixture] = useState({ codigoFicha: '', idGrupo: 1, tipo: 'Entrada' as 'Entrada' | 'Salida' });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [datosFichas, datosDisp] = await Promise.all([
        listarFichas(filtroEstado || undefined),
        obtenerDisponibilidadFichas(),
      ]);
      console.log('Fichas:', datosFichas);
      setFichas(datosFichas);
      setDisponibilidad(datosDisp);
    } catch (err) {
      console.error('Error cargando fichas:', err);
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const fichasFiltradas = filtroGrupo
    ? fichas.filter(f => f.idGrupo === Number(filtroGrupo))
    : fichas;

  const fichasPaginadas = fichasFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  const handleCrear = useCallback(async () => {
    if (!nuevaFixture.codigoFicha.trim()) return;
    try {
      await crearFicha(nuevaFixture);
      toast.success('Ficha creada exitosamente.');
      setModalCrear(false);
      setNuevaFixture({ codigoFicha: '', idGrupo: 1, tipo: 'Entrada' });
      cargarDatos();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Error al crear ficha.');
    }
  }, [nuevaFixture, cargarDatos]);

  const handleEstado = useCallback(async (id: number, estado: string) => {
    try {
      await actualizarFicha(id, { estado: estado as FichaApi['estado'] });
      toast.success(`Ficha actualizada a ${estado}.`);
      cargarDatos();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar.');
    }
  }, [cargarDatos]);

  const handleEditar = useCallback(async () => {
    if (!fixtureEditando) return;
    try {
      await actualizarFicha(fixtureEditando.idFicha, {
        codigoFicha: fixtureEditando.codigoFicha,
        estado: fixtureEditando.estado,
        tipo: fixtureEditando.tipo,
        idGrupo: fixtureEditando.idGrupo,
      });
      toast.success('Ficha modificada exitosamente.');
      setModalEditar(false);
      setFixtureEditando(null);
      cargarDatos();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar.');
    }
  }, [fixtureEditando, cargarDatos]);

  const columnas: ColumnaTabla<FichaApi>[] = [
    {
      id: 'codigo',
      encabezado: 'Codigo',
      ordenablePor: 'codigoFicha',
      render: (f) => <span className="font-mono text-on-surface">{f.codigoFicha || '—'}</span>,
    },
    {
      id: 'tipo',
      encabezado: 'Tipo',
      ordenablePor: 'tipo',
      render: (f) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
          f.tipo === 'Entrada' ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary'
        }`}>
          {f.tipo || 'Entrada'}
        </span>
      ),
    },
    {
      id: 'grupo',
      encabezado: 'Grupo',
      ordenablePor: (f) => f.nombreGrupo ?? '',
      render: (f) => <span className="text-on-surface-variant">{f.nombreGrupo ?? '—'}</span>,
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      ordenablePor: 'estado',
      render: (f) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${badgeEstado(f.estado)}`}>
          {f.estado}
        </span>
      ),
    },
  ];

  return (
    <LayoutPrincipal titulo="Fichas">
      <div className="space-y-stack-lg max-w-[1440px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {disponibilidad.map((d) => (
            <div key={d.idGrupo} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-gutter shadow-sm">
              <h3 className="text-label-md font-label-md text-on-surface mb-2">{d.nombreGrupo}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-label-sm">
                  <span className="text-on-surface-variant">Disponibles</span>
                  <span className="text-tertiary font-semibold">{d.disponibles}/{d.total}</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full transition-all" style={{ width: `${(d.disponibles / d.total) * 100}%` }} />
                </div>
                <div className="flex justify-between text-label-sm">
                  <span className="text-on-surface-variant">En uso</span>
                  <span className="text-primary font-semibold">{d.enUso}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-3">
            <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }}
              className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 font-body-sm text-on-surface focus:outline-none focus:border-primary">
              <option value="">Todos los estados</option>
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
              <option value="Extraviada">Extraviada</option>
            </select>
            <select value={filtroGrupo} onChange={(e) => { setFiltroGrupo(e.target.value); setPagina(1); }}
              className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 font-body-sm text-on-surface focus:outline-none focus:border-primary">
              <option value="">Todos los grupos</option>
              <option value="1">4-6 años</option>
              <option value="2">7-9 años</option>
              <option value="3">10-12 años</option>
            </select>
          </div>
          <button onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nueva Ficha
          </button>
        </div>

        <TablaBase
          columnas={columnas}
          filas={fichasPaginadas}
          obtenerClave={(f) => f.idFicha}
          pagina={pagina}
          total={fichasFiltradas.length}
          porPagina={porPagina}
          onCambiarPagina={setPagina}
          onCambiarPorPagina={setPorPagina}
          cargando={cargando}
          mensajeVacio="No hay fichas registradas."
          acciones={{
            onEditar: (f) => { setFixtureEditando(f); setModalEditar(true); },
            onEliminar: (f) => handleEstado(f.idFicha, 'Extraviada'),
          }}
        />

        {modalCrear && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setModalCrear(false); }}>
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h2 className="text-headline-md font-headline-md text-on-surface">Nueva Ficha</h2>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1">Codigo de Ficha</label>
                <input type="text" value={nuevaFixture.codigoFicha} onChange={(e) => setNuevaFixture(p => ({ ...p, codigoFicha: e.target.value }))}
                  placeholder="Ej: A-001"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1">Grupo</label>
                <select value={nuevaFixture.idGrupo} onChange={(e) => setNuevaFixture(p => ({ ...p, idGrupo: Number(e.target.value) }))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none">
                  <option value={1}>4-6 años</option>
                  <option value={2}>7-9 años</option>
                  <option value={3}>10-12 años</option>
                </select>
              </div>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1">Tipo</label>
                <select value={nuevaFixture.tipo} onChange={(e) => setNuevaFixture(p => ({ ...p, tipo: e.target.value as 'Entrada' | 'Salida' }))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none">
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                </select>
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

        {modalEditar && fixtureEditando && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setModalEditar(false); setFixtureEditando(null); } }}>
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h2 className="text-headline-md font-headline-md text-on-surface">Editar Ficha</h2>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1">Codigo de Ficha</label>
                <input type="text" value={fixtureEditando.codigoFicha || ''} onChange={(e) => setFixtureEditando(p => p ? { ...p, codigoFicha: e.target.value } : null)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1">Tipo</label>
                <select value={fixtureEditando.tipo || 'Entrada'} onChange={(e) => setFixtureEditando(p => p ? { ...p, tipo: e.target.value as 'Entrada' | 'Salida' } : null)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none">
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                </select>
              </div>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1">Grupo</label>
                <select value={fixtureEditando.idGrupo ?? 1} onChange={(e) => setFixtureEditando(p => p ? { ...p, idGrupo: Number(e.target.value) } : null)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none">
                  <option value={1}>4-6 años</option>
                  <option value={2}>7-9 años</option>
                  <option value={3}>10-12 años</option>
                </select>
              </div>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1">Estado</label>
                <select value={fixtureEditando.estado} onChange={(e) => setFixtureEditando(p => p ? { ...p, estado: e.target.value as 'Activa' | 'Inactiva' | 'Extraviada' } : null)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none">
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                  <option value="Extraviada">Extraviada</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button onClick={() => { setModalEditar(false); setFixtureEditando(null); }}
                  className="border border-outline-variant text-on-surface-variant rounded-xl px-5 py-2.5 font-label-md hover:bg-surface-container-high transition-colors">
                  Cancelar
                </button>
                <button onClick={handleEditar}
                  className="bg-primary text-on-primary rounded-xl px-6 py-2.5 font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaFichas;