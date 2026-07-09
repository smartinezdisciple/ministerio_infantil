// PaginaReportes.tsx — Módulo de Reportes (Spec §9.12)
import React, { useState, useEffect, useMemo } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import { fechaLocalHoy } from '../services/fechaUtils';
import { obtenerNinosPorGrupoDatos, obtenerCumpleanosDatos, exportarReporteExcel, type DatosNinoPorGrupoReporte, type CumpleanosReporteApi } from '../services/servicioApi';

interface TipoReporte {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  colorIcono: string;
  fondoIcono: string;
  filtros: Array<{ id: string; label: string; tipo: 'select' | 'date' | 'text'; opciones?: string[] }>;
}

const TIPOS_REPORTE: TipoReporte[] = [
  {
    id: 'ninos',
    titulo: 'Reporte de Niños',
    descripcion: 'Lista completa con datos personales, grupo asignado, tutores e info médica',
    icono: 'child_care',
    colorIcono: 'text-primary',
    fondoIcono: 'bg-primary/10',
    filtros: [
      { id: 'grupo', label: 'Grupo', tipo: 'select', opciones: ['Todos', '4-6 años', '7-9 años', '10-12 años'] },
      { id: 'desde', label: 'Desde', tipo: 'date' },
      { id: 'hasta', label: 'Hasta', tipo: 'date' },
    ],
  },
  {
    id: 'ninos-por-grupo',
    titulo: 'Niños por Grupo (PDF)',
    descripcion: 'Reporte en PDF agrupado por edades, mostrando el turno y lista de niños con sus datos',
    icono: 'picture_as_pdf',
    colorIcono: 'text-error',
    fondoIcono: 'bg-error/10',
    filtros: [
      { id: 'fecha', label: 'Fecha', tipo: 'date' },
      { id: 'turno', label: 'Turno', tipo: 'select', opciones: ['Todos', 'Miercoles 6:30pm', 'Domingo 8am', 'Domingo 11am', 'Domingo 5pm'] },
      { id: 'grupo', label: 'Grupo', tipo: 'select', opciones: ['Todos', '4-6 años', '7-9 años', '10-12 años'] },
    ],
  },
  {
    id: 'asistencia-ninos',
    titulo: 'Asistencia de Niños',
    descripcion: 'Historial de asistencia con fecha, turno, grupo, horas y estado',
    icono: 'fact_check',
    colorIcono: 'text-tertiary',
    fondoIcono: 'bg-tertiary/10',
    filtros: [
      { id: 'fecha', label: 'Fecha', tipo: 'date' },
      { id: 'turno', label: 'Turno', tipo: 'select', opciones: ['Todos', 'Miercoles 6:30pm', 'Domingo 8am', 'Domingo 11am', 'Domingo 5pm'] },
      { id: 'estado', label: 'Estado', tipo: 'select', opciones: ['Todos', 'Presente', 'Retirado'] },
    ],
  },
  {
    id: 'asistencia-maestros',
    titulo: 'Asistencia de Maestros',
    descripcion: 'Puntualidad, inasistencias y métricas por rol y persona',
    icono: 'groups',
    colorIcono: 'text-secondary',
    fondoIcono: 'bg-secondary/10',
    filtros: [
      { id: 'fecha', label: 'Fecha', tipo: 'date' },
      { id: 'turno', label: 'Turno', tipo: 'select', opciones: ['Todos', 'Miercoles 6:30pm', 'Domingo 8am', 'Domingo 11am', 'Domingo 5pm'] },
      { id: 'rol', label: 'Rol', tipo: 'select', opciones: ['Todos', 'Colaborador', 'Maestro', 'Staff'] },
    ],
  },
  {
    id: 'fichas',
    titulo: 'Reporte de Fichas',
    descripcion: 'Disponibilidad por grupo, fichas extraviadas y trazabilidad de uso',
    icono: 'confirmation_number',
    colorIcono: 'text-on-surface',
    fondoIcono: 'bg-surface-container-high',
    filtros: [
      { id: 'grupo', label: 'Grupo', tipo: 'select', opciones: ['Todos', '4-6 años', '7-9 años', '10-12 años'] },
      { id: 'estado', label: 'Estado', tipo: 'select', opciones: ['Todos', 'Activa', 'Inactiva', 'Extraviada'] },
    ],
  },
  {
    id: 'solicitudes',
    titulo: 'Reporte de Solicitudes',
    descripcion: 'Estado, tiempos de resolución y requisitos cumplidos',
    icono: 'assignment',
    colorIcono: 'text-primary',
    fondoIcono: 'bg-primary/10',
    filtros: [
      { id: 'estado', label: 'Estado', tipo: 'select', opciones: ['Todos', 'Borrador', 'Pendiente', 'Aprobado', 'Rechazado'] },
      { id: 'desde', label: 'Desde', tipo: 'date' },
      { id: 'hasta', label: 'Hasta', tipo: 'date' },
    ],
  },
  {
    id: 'requisitos',
    titulo: 'Reporte de Requisitos',
    descripcion: 'Cumplimiento por persona y requisitos pendientes por rol',
    icono: 'checklist',
    colorIcono: 'text-tertiary',
    fondoIcono: 'bg-tertiary/10',
    filtros: [
      { id: 'rol', label: 'Rol', tipo: 'select', opciones: ['Todos', 'Colaborador', 'Maestro', 'Staff', 'Coordinador General'] },
    ],
  },
  {
    id: 'cumpleanos',
    titulo: 'Reporte de Cumpleaños',
    descripcion: 'Niños que cumplen años en el período seleccionado',
    icono: 'cake',
    colorIcono: 'text-secondary',
    fondoIcono: 'bg-secondary/10',
    filtros: [
      { id: 'mes', label: 'Mes', tipo: 'select', opciones: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] },
    ],
  },
  {
    id: 'incidencias',
    titulo: 'Incidencias (Excel)',
    descripcion: 'Reporte de asistencia e incidencias en Excel con conteo por edades y turno',
    icono: 'assignment',
    colorIcono: 'text-error',
    fondoIcono: 'bg-error/10',
    filtros: [
      { id: 'fecha', label: 'Fecha', tipo: 'date' },
    ],
  },
];

const PaginaReportes: React.FC = () => {
  const [reporteSeleccionado, setReporteSeleccionado] = useState<TipoReporte | null>(null);
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [datosNinosGrupo, setDatosNinosGrupo] = useState<DatosNinoPorGrupoReporte[]>([]);
  const [cargandoNinosGrupo, setCargandoNinosGrupo] = useState(false);
  const [datosCumpleanos, setDatosCumpleanos] = useState<CumpleanosReporteApi[]>([]);
  const [cargandoCumpleanos, setCargandoCumpleanos] = useState(false);

  // Inicialización de filtros con valores por defecto
  useEffect(() => {
    if (reporteSeleccionado) {
      const iniciales: Record<string, string> = {};
      reporteSeleccionado.filtros.forEach(f => {
        if (f.tipo === 'date') {
          iniciales[f.id] = fechaLocalHoy();
        } else {
          iniciales[f.id] = '';
        }
      });
      setFiltros(iniciales);
    } else {
      setFiltros({});
    }
  }, [reporteSeleccionado]);

  useEffect(() => {
    if (reporteSeleccionado?.id === 'ninos-por-grupo') {
      const cargarDatos = async () => {
        setCargandoNinosGrupo(true);
        try {
          const t = filtros.turno || 'Todos';
          const f = filtros.fecha || new Date().toISOString().split('T')[0];
          const res = await obtenerNinosPorGrupoDatos(t, f);
          setDatosNinosGrupo(res);
        } catch (err) {
          console.error('Error cargando niños por grupo:', err);
          setDatosNinosGrupo([]);
        } finally {
          setCargandoNinosGrupo(false);
        }
      };
      cargarDatos();
    } else {
      setDatosNinosGrupo([]);
    }
  }, [reporteSeleccionado, filtros.turno, filtros.fecha]);

  useEffect(() => {
    if (reporteSeleccionado?.id === 'cumpleanos') {
      const cargarDatos = async () => {
        setCargandoCumpleanos(true);
        try {
          const mes = filtros.mes || 'Enero';
          const res = await obtenerCumpleanosDatos(mes);
          setDatosCumpleanos(res);
        } catch (err) {
          console.error('Error cargando cumpleaños:', err);
          setDatosCumpleanos([]);
        } finally {
          setCargandoCumpleanos(false);
        }
      };
      cargarDatos();
    } else {
      setDatosCumpleanos([]);
    }
  }, [reporteSeleccionado, filtros.mes]);

  const gruposConNinos = useMemo(() => {
    if (reporteSeleccionado?.id !== 'ninos-por-grupo') return [];
    
    const agrupado: Record<string, DatosNinoPorGrupoReporte[]> = {
      '4-6 años': [],
      '7-9 años': [],
      '10-12 años': [],
    };
    
    datosNinosGrupo.forEach(n => {
      const nombre = n.nombreGrupo;
      if (nombre.includes('4-6') || nombre.includes('2-6')) agrupado['4-6 años'].push(n);
      else if (nombre.includes('7-9')) agrupado['7-9 años'].push(n);
      else if (nombre.includes('10-12')) agrupado['10-12 años'].push(n);
    });

    const grupoFiltro = filtros.grupo || '';

    return Object.entries(agrupado)
      .map(([nombre, lista]) => ({ nombre, lista }))
      .filter(g => g.lista.length > 0)
      .filter(g => {
        if (!grupoFiltro) return true;
        return g.nombre === grupoFiltro;
      });
  }, [reporteSeleccionado, datosNinosGrupo, filtros.grupo]);

  const obtenerFechaCumpleanos = (fechaStr: string) => {
    if (!fechaStr) return '';
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    try {
      const [_, mes, dia] = fechaStr.split('-');
      const m = parseInt(mes, 10);
      const d = parseInt(dia, 10);
      if (isNaN(m) || isNaN(d)) return fechaStr;
      return `${d} de ${meses[m - 1]}`;
    } catch {
      return fechaStr;
    }
  };

  return (
    <LayoutPrincipal titulo="Reportes">
      <div className="space-y-stack-lg max-w-[1440px]">
        {/* Contenido en pantalla (oculto en impresión para que empiece en la página 1) */}
        <div className="no-print space-y-stack-lg">
          {/* Grid de tipos de reporte */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {TIPOS_REPORTE.map((r) => (
            <button
              key={r.id}
              onClick={() => { setReporteSeleccionado(r); setFiltros({}); }}
              className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm text-left transition-all hover:shadow-md active:scale-[0.98] ${
                reporteSeleccionado?.id === r.id ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/30'
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${r.fondoIcono}`}>
                  <span className={`material-symbols-outlined text-[28px] ${r.colorIcono}`}>{r.icono}</span>
                </div>
                <h3 className="text-headline-md font-headline-md text-on-surface">{r.titulo}</h3>
              </div>
              <p className="text-body-sm text-on-surface-variant">{r.descripcion}</p>
            </button>
          ))}
        </div>

        {/* Panel de filtros y exportación */}
        {reporteSeleccionado && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm no-print">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-md font-headline-md text-on-surface">
                {reporteSeleccionado.titulo}
              </h2>
              {reporteSeleccionado.id === 'incidencias' ? (
                <button onClick={() => exportarReporteExcel('incidencias', { fecha: filtros.fecha })}
                  className="flex items-center gap-2 bg-success text-on-success rounded-xl px-4 py-2 font-label-md shadow-md hover:bg-success/90 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Descargar Excel
                </button>
              ) : (
                <button onClick={() => window.print()}
                  className="flex items-center gap-2 bg-error text-on-error rounded-xl px-4 py-2 font-label-md shadow-md hover:bg-error/90 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  Imprimir / Guardar PDF
                </button>
              )}
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reporteSeleccionado.filtros.map((f) => (
                <div key={f.id}>
                  <label className="block text-label-sm text-on-surface-variant mb-1">{f.label}</label>
                  {f.tipo === 'select' ? (
                    <select value={filtros[f.id] ?? ''} onChange={(e) => setFiltros(p => ({ ...p, [f.id]: e.target.value }))}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none">
                      {f.opciones?.map(o => <option key={o} value={o === 'Todos' ? '' : o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.tipo} value={filtros[f.id] ?? ''} onChange={(e) => setFiltros(p => ({ ...p, [f.id]: e.target.value }))}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
                  )}
                </div>
              ))}
            </div>

            {/* Vista Previa en Pantalla */}
            {reporteSeleccionado.id === 'ninos-por-grupo' && (
              <div className="mt-8 pt-6 border-t border-outline-variant/30">
                <h3 className="text-title-lg font-headline-md text-on-surface mb-4">Vista Previa del Reporte</h3>
                {cargandoNinosGrupo ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : gruposConNinos.length === 0 ? (
                  <div className="text-center py-12 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                    <p className="text-body-md text-on-surface-variant font-medium">No hay niños registrados para los filtros seleccionados.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gruposConNinos.map((grupo) => (
                      <div key={grupo.nombre} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                          <span className="text-label-md font-bold text-primary uppercase tracking-wide">
                            Grupo: {grupo.nombre}
                          </span>
                          <span className="text-body-sm bg-primary-container text-on-primary-container font-semibold px-2 py-0.5 rounded-full">
                            {grupo.lista.length} niños
                          </span>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                          {grupo.lista.map(n => (
                            <div key={n.idPersona} className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
                              <p className="text-label-md font-bold text-on-surface flex items-center justify-between gap-2 flex-wrap">
                                <span>{n.nombreCompleto}</span>
                                {n.idGrupo === 1 && n.edad < 4 && (
                                  <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-medium inline-block">
                                    Menor de 4 años
                                  </span>
                                )}
                              </p>
                              <div className="flex justify-between text-body-sm text-on-surface-variant">
                                <span>Edad: {n.edad} años</span>
                                <span className="flex items-center gap-1 font-medium">
                                  <span className="material-symbols-outlined text-[14px] text-secondary">cake</span>
                                  {obtenerFechaCumpleanos(n.fechaNacimiento)}
                                </span>
                              </div>
                              {n.familiarIngreso && (
                                <div className="text-[11px] text-on-surface-variant/80 border-t border-outline-variant/10 pt-1.5 mt-1.5 flex flex-col gap-0.5">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px] text-primary">person</span>
                                    Familiar: <strong className="text-on-surface">{n.familiarIngreso}</strong>
                                  </span>
                                  {n.telefonoFamiliar && (
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[12px] text-primary">call</span>
                                      Tel: <strong className="text-on-surface">{n.telefonoFamiliar}</strong>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vista Previa — Cumpleaños */}
            {reporteSeleccionado.id === 'cumpleanos' && (
              <div className="mt-8 pt-6 border-t border-outline-variant/30">
                <h3 className="text-title-lg font-headline-md text-on-surface mb-4">Vista Previa del Reporte</h3>
                {cargandoCumpleanos ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : datosCumpleanos.length === 0 ? (
                  <div className="text-center py-12 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                    <p className="text-body-md text-on-surface-variant font-medium">No hay niños que cumplan años en {filtros.mes || 'el mes seleccionado'}.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-primary-container text-on-primary-container">
                          <th className="px-4 py-3 text-label-sm font-bold">Nombre Completo</th>
                          <th className="px-4 py-3 text-label-sm font-bold">Día</th>
                          <th className="px-4 py-3 text-label-sm font-bold">Edad</th>
                          <th className="px-4 py-3 text-label-sm font-bold">Fecha de Nacimiento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosCumpleanos.map((n) => (
                          <tr key={n.idPersona} className="border-b border-outline-variant/20 hover:bg-surface-container-low">
                            <td className="px-4 py-3 text-body-sm font-semibold text-on-surface">{n.nombreCompleto}</td>
                            <td className="px-4 py-3 text-body-sm text-on-surface-variant">{n.dia}</td>
                            <td className="px-4 py-3 text-body-sm text-on-surface-variant">{n.edad} años</td>
                            <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                              {new Date(n.fechaNacimiento + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </div>

        {/* ── Área de Impresión (PDF) ── */}
        {/* Niños por Grupo */}
        {reporteSeleccionado?.id === 'ninos-por-grupo' && gruposConNinos.length > 0 && (
          <div id="printable-report-area" className="hidden print:block">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#2a7de1', margin: '0' }}>
                Reporte de Niños por Grupo
              </h1>
              <p style={{ fontSize: '12pt', color: '#555', margin: '5px 0 0 0' }}>
                Fecha Asistencia: {filtros.fecha ? new Date(filtros.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} • Turno: {filtros.turno || 'Todos'}
              </p>
            </div>

            {gruposConNinos.map((grupo) => (
              <div key={grupo.nombre} className="print-card">
                <div className="print-card-title">
                  Grupo: {grupo.nombre} ({grupo.lista.length} niños)
                </div>
                <table className="print-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>Nombre Completo</th>
                      <th style={{ width: '10%' }}>Edad</th>
                      <th style={{ width: '20%' }}>Cumpleaños</th>
                      <th style={{ width: '20%' }}>Ingresado Por</th>
                      <th style={{ width: '15%' }}>Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.lista.map((n) => (
                      <tr key={n.idPersona}>
                        <td>
                          <strong>{n.nombreCompleto}</strong>
                          {n.idGrupo === 1 && n.edad < 4 && (
                            <span style={{ marginLeft: '8px', fontSize: '8pt', backgroundColor: '#e8def8', color: '#1d192b', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              Menor de 4 años
                            </span>
                          )}
                        </td>
                        <td>{n.edad} años</td>
                        <td>{obtenerFechaCumpleanos(n.fechaNacimiento)}</td>
                        <td>{n.familiarIngreso || '-'}</td>
                        <td>{n.telefonoFamiliar || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* Cumpleaños */}
        {reporteSeleccionado?.id === 'cumpleanos' && datosCumpleanos.length > 0 && (
          <div id="printable-cumpleanos" className="hidden print:block">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#2a7de1', margin: '0' }}>
                Reporte de Cumpleaños
              </h1>
              <p style={{ fontSize: '12pt', color: '#555', margin: '5px 0 0 0' }}>
                Mes: {filtros.mes || 'Todos'} • Total: {datosCumpleanos.length} niños
              </p>
            </div>
            <table className="print-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Nombre Completo</th>
                  <th style={{ width: '15%' }}>Día</th>
                  <th style={{ width: '15%' }}>Edad</th>
                  <th style={{ width: '30%' }}>Fecha de Nacimiento</th>
                </tr>
              </thead>
              <tbody>
                {datosCumpleanos.map((n) => (
                  <tr key={n.idPersona}>
                    <td><strong>{n.nombreCompleto}</strong></td>
                    <td>{n.dia}</td>
                    <td>{n.edad} años</td>
                    <td>{new Date(n.fechaNacimiento + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaReportes;
