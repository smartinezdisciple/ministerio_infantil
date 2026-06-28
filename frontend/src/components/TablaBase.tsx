// TablaBase.tsx — Tabla paginada genérica con ordenamiento y acciones (Spec §9.2)
import React, { useState, useMemo } from 'react';

export interface ColumnaTabla<T> {
  /** Clave del objeto o string identificador de la columna */
  id: string;
  encabezado: string;
  /** Función render para mostrar el valor de la celda */
  render: (fila: T) => React.ReactNode;
  /** Clave para ordenamiento (nombre de propiedad en T). Si no se define, no se puede ordenar */
  ordenablePor?: keyof T | ((fila: T) => string | number);
  /** Ancho opcional de la columna */
  ancho?: string;
  /** Alinear el contenido a la derecha */
  alineaDerecha?: boolean;
}

type DireccionOrden = 'asc' | 'desc' | null;

interface PropsTablaBase<T> {
  columnas: ColumnaTabla<T>[];
  filas: T[];
  /** Clave única para cada fila */
  obtenerClave: (fila: T) => string | number;
  /** Paginación: página actual (1-indexed) */
  pagina: number;
  /** Total de registros en el servidor */
  total: number;
  /** Cantidad de registros por página (default 20) */
  porPagina?: number;
  onCambiarPagina: (nuevaPagina: number) => void;
  onCambiarPorPagina?: (nuevaCantidad: number) => void;
  /** Estado de carga */
  cargando?: boolean;
  /** Mensaje cuando no hay filas */
  mensajeVacio?: string;
  /** Acciones por fila: ver, editar, eliminar, checkin */
  acciones?: {
    onVer?: (fila: T) => void;
    onEditar?: (fila: T) => void;
    onEliminar?: (fila: T) => void;
    onCheckin?: (fila: T) => void;
  };
  /** Función para retornar clases CSS adicionales para cada fila tr */
  obtenerFilaClase?: (fila: T) => string;
}

const OPCIONES_POR_PAGINA = [10, 25, 50, 100];

/**
 * Tabla paginada genérica con ordenamiento y acciones.
 * - Selector de registros por página: 10, 25, 50, 100
 * - Columnas ordenables con flechas ↑↓
 * - Acciones por fila: ver, editar, eliminar
 */
function TablaBase<T>({
  columnas,
  filas,
  obtenerClave,
  pagina,
  total,
  porPagina = 20,
  onCambiarPagina,
  onCambiarPorPagina,
  cargando = false,
  mensajeVacio = 'No hay registros para mostrar.',
  acciones,
  obtenerFilaClase,
}: PropsTablaBase<T>) {
  const [columnaOrden, setColumnaOrden] = useState<string | null>(null);
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>(null);

  const totalPaginas = Math.ceil(total / porPagina);
  const inicio = (pagina - 1) * porPagina + 1;
  const fin = Math.min(pagina * porPagina, total);

  const manejarOrdenar = (colId: string) => {
    if (columnaOrden === colId) {
      if (direccionOrden === 'asc') setDireccionOrden('desc');
      else if (direccionOrden === 'desc') { setColumnaOrden(null); setDireccionOrden(null); }
      else setDireccionOrden('asc');
    } else {
      setColumnaOrden(colId);
      setDireccionOrden('asc');
    }
    // Resetear a página 1 al cambiar orden
    if (pagina !== 1) onCambiarPagina(1);
  };

  const filasOrdenadas = useMemo(() => {
    if (!columnaOrden || !direccionOrden) return filas;
    const col = columnas.find((c) => c.id === columnaOrden);
    if (!col || !col.ordenablePor) return filas;

    const getValor = (fila: T): string | number => {
      if (typeof col.ordenablePor === 'function') return col.ordenablePor(fila);
      return (fila[col.ordenablePor as keyof T] as unknown) as string | number;
    };

    return [...filas].sort((a, b) => {
      const valA = getValor(a);
      const valB = getValor(b);
      if (valA < valB) return direccionOrden === 'asc' ? -1 : 1;
      if (valA > valB) return direccionOrden === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filas, columnaOrden, direccionOrden, columnas]);

  const renderIconoOrden = (colId: string) => {
    const activo = columnaOrden === colId && direccionOrden;
    const baseCls = 'material-symbols-outlined text-[14px] leading-none';
    const colorActivo = 'text-primary';
    const colorInactivo = 'text-on-surface-variant/40';

    if (!activo) {
      return (
        <span className="flex flex-col items-center ml-1 -space-y-1">
          <span className={`${baseCls} ${colorInactivo}`}>expand_less</span>
          <span className={`${baseCls} ${colorInactivo}`}>expand_more</span>
        </span>
      );
    }

    if (direccionOrden === 'asc') {
      return (
        <span className="flex flex-col items-center ml-1 -space-y-1">
          <span className={`${baseCls} ${colorActivo}`}>expand_less</span>
          <span className={`${baseCls} ${colorInactivo}`}>expand_more</span>
        </span>
      );
    }

    return (
      <span className="flex flex-col items-center ml-1 -space-y-1">
        <span className={`${baseCls} ${colorInactivo}`}>expand_less</span>
        <span className={`${baseCls} ${colorActivo}`}>expand_more</span>
      </span>
    );
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      {/* Selector de registros por página */}
      {onCambiarPorPagina && total > 0 && (
        <div className="flex items-center justify-between px-gutter py-3 border-b border-outline-variant/50 bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-on-surface-variant">Mostrar</span>
            <select
              id="tabla-registros-por-pagina"
              name="porPagina"
              value={porPagina}
              onChange={(e) => {
                onCambiarPorPagina(Number(e.target.value));
                if (pagina !== 1) onCambiarPagina(1);
              }}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1 text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              aria-label="Registros por página"
            >
              {OPCIONES_POR_PAGINA.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-body-sm text-on-surface-variant">registros</span>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            {cargando ? '...' : `${total} registros en total`}
          </p>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              {columnas.map((col, idx) => {
                const esUltimo = idx === columnas.length - 1 && !acciones;
                return (
                  <th
                    key={col.id}
                    className={`px-3 py-1.5 sm:py-2 text-body-sm sm:text-label-md font-body-sm sm:font-label-md text-on-surface-variant whitespace-nowrap ${
                      esUltimo ? '' : 'border-r border-outline-variant/30'
                    } ${
                      col.alineaDerecha ? 'text-right' : ''
                    } ${col.ancho ?? ''} ${col.ordenablePor ? 'cursor-pointer select-none hover:bg-surface-container-high transition-colors' : ''}`}
                    onClick={() => col.ordenablePor && manejarOrdenar(col.id)}
                    role={col.ordenablePor ? 'button' : undefined}
                    tabIndex={col.ordenablePor ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (col.ordenablePor && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        manejarOrdenar(col.id);
                      }
                    }}
                  >
                    <span className="flex items-center gap-1">
                      {col.encabezado}
                      {col.ordenablePor && renderIconoOrden(col.id)}
                    </span>
                  </th>
                );
              })}
              {acciones && (
                <th className="px-3 py-2 text-label-md font-label-md text-on-surface-variant text-right whitespace-nowrap">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {cargando ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columnas.map((col) => (
                    <td key={col.id} className="px-2 py-2">
                      <div className="h-4 bg-surface-container-high rounded-full w-3/4" />
                    </td>
                  ))}
                  {acciones && <td className="px-2 py-2" />}
                </tr>
              ))
            ) : filasOrdenadas.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length + (acciones ? 1 : 0)}
                  className="px-2 py-8 text-center text-body-md text-on-surface-variant"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[40px] text-outline-variant">
                      inbox
                    </span>
                    <span>{mensajeVacio}</span>
                  </div>
                </td>
              </tr>
            ) : (
              filasOrdenadas.map((fila) => {
                const clasesFila = obtenerFilaClase ? obtenerFilaClase(fila) : '';
                const clasesHoverPorDefecto = clasesFila ? '' : 'hover:bg-surface-container-high';
                return (
                  <tr
                    key={obtenerClave(fila)}
                    className={`transition-colors ${clasesHoverPorDefecto} ${clasesFila}`}
                  >
                    {columnas.map((col) => (
                      <td
                        key={col.id}
                        className={`px-2 py-1 sm:py-1.5 text-body-sm sm:text-body-md text-on-surface align-top ${
                          col.alineaDerecha ? 'text-right' : ''
                        } ${col.ancho ?? ''}`}
                      >
                        {col.render(fila)}
                      </td>
                    ))}
                    {acciones && (
                      <td className="px-2 py-1 sm:py-1.5 text-right align-top">
                        <div className="flex flex-wrap items-center justify-start gap-1 max-w-[130px] md:max-w-none ml-auto">
                          {acciones.onCheckin && (
                            <div className="relative group inline-block">
                              <button
                                onClick={() => acciones.onCheckin!(fila)}
                                className="w-[28px] h-[28px] rounded-lg border-[3px] border-emerald-500 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                aria-label="Check-in rápido"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>login</span>
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                                marcar asistencia
                              </span>
                            </div>
                          )}
                          {acciones.onVer && (
                            <div className="relative group inline-block">
                              <button
                                onClick={() => acciones.onVer!(fila)}
                                className="w-[28px] h-[28px] rounded-lg border-[3px] border-sky-500 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:border-sky-500 hover:text-black flex items-center justify-center transition-all cursor-pointer"
                                aria-label="Ver"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>visibility</span>
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                                ver
                              </span>
                            </div>
                          )}
                          {acciones.onEditar && (
                            <div className="relative group inline-block">
                              <button
                                onClick={() => acciones.onEditar!(fila)}
                                className="w-[28px] h-[28px] rounded-lg border-[3px] border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                aria-label="Editar"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>edit</span>
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                                editar
                              </span>
                            </div>
                          )}
                          {acciones.onEliminar && (
                            <div className="relative group inline-block">
                              <button
                                onClick={() => acciones.onEliminar!(fila)}
                                className="w-[28px] h-[28px] rounded-lg border-[3px] border-red-500 bg-red-50 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                aria-label="Eliminar"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>delete</span>
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                                eliminar
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {total > 0 && (
        <div className="flex items-center justify-between px-gutter py-3 border-t border-outline-variant/50 bg-surface-container-low">
          <p className="text-body-sm text-on-surface-variant">
            {cargando ? '...' : `Mostrando ${inicio}–${fin} de ${total} registros`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onCambiarPagina(pagina - 1)}
              disabled={pagina <= 1 || cargando}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-label-sm font-label-md text-on-surface-variant border border-outline-variant disabled:opacity-40 hover:bg-surface-container-high transition-colors disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              Anterior
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1 px-1">
              {/* Página 1 (siempre visible) */}
              <button
                key="pag-1"
                onClick={() => onCambiarPagina(1)}
                aria-current={pagina === 1 ? 'page' : undefined}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-body-sm font-label-md border transition-colors ${
                  pagina === 1
                    ? 'bg-primary text-on-primary border-primary cursor-default pointer-events-none'
                    : 'text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                }`}
              >
                1
              </button>

              {/* "..." inicial si la ventana no comienza en 2 */}
              {pagina > 4 && (
                <span key="dots-start" className="px-1 text-body-sm text-on-surface-variant/50 select-none">…</span>
              )}

              {/* Ventana de páginas intermedias: [pagina-2 … pagina+2] excluyendo 1 y totalPaginas */}
              {totalPaginas > 2 && (() => {
                const ventana: number[] = [];
                for (
                  let p = Math.max(2, pagina - 2);
                  p <= Math.min(totalPaginas - 1, pagina + 2);
                  p++
                ) {
                  ventana.push(p);
                }
                return ventana.map((p) => (
                  <button
                    key={`pag-${p}`}
                    onClick={() => onCambiarPagina(p)}
                    aria-current={pagina === p ? 'page' : undefined}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-body-sm font-label-md border transition-colors ${
                      pagina === p
                        ? 'bg-primary text-on-primary border-primary cursor-default pointer-events-none'
                        : 'text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {p}
                  </button>
                ));
              })()}

              {/* "..." final si la ventana no llega a totalPaginas - 1 */}
              {pagina < totalPaginas - 3 && (
                <span key="dots-end" className="px-1 text-body-sm text-on-surface-variant/50 select-none">…</span>
              )}

              {/* Última página (siempre visible si hay más de 1 página) */}
              {totalPaginas > 1 && (
                <button
                  key={`pag-${totalPaginas}`}
                  onClick={() => onCambiarPagina(totalPaginas)}
                  aria-current={pagina === totalPaginas ? 'page' : undefined}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-body-sm font-label-md border transition-colors ${
                    pagina === totalPaginas
                      ? 'bg-primary text-on-primary border-primary cursor-default pointer-events-none'
                      : 'text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                  }`}
                >
                  {totalPaginas}
                </button>
              )}
            </div>

            <button
              onClick={() => onCambiarPagina(pagina + 1)}
              disabled={pagina >= totalPaginas || cargando}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-label-sm font-label-md text-on-surface-variant border border-outline-variant disabled:opacity-40 hover:bg-surface-container-high transition-colors disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              Siguiente
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TablaBase;