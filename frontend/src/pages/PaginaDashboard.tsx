// PaginaDashboard.tsx — Dashboard principal del sistema (Spec §9.1 v2.0)
import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TarjetaEstadistica from '../components/TarjetaEstadistica';
import TarjetaAcceso from '../components/TarjetaAcceso';
import ItemCumpleanero from '../components/ItemCumpleanero';
import GraficaBarras from '../components/GraficaBarras';
import GraficaDona from '../components/GraficaDona';
import GraficaBarrasApiladas from '../components/GraficaBarrasApiladas';
import IndicadorDelta from '../components/IndicadorDelta';
import ContadorBadge from '../components/ContadorBadge';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/ContextoAuth';
import {
  obtenerMetricasDashboard,
  obtenerCumpleanerosMes,
  obtenerAlertasMedicas,
  obtenerAsistenciaMensual,
  obtenerDistribucionGrupos,
  obtenerAsistenciaPorRol,
  obtenerComparativaMensual,
  obtenerDisponibilidadFichas,
  listarEventos,
  obtenerNinosGraduacion,
  obtenerNinosTransicion,
  obtenerPersonalDisponibleDashboard,
  type MetricasDashboard,
  type CumpleaneroDashboard,
  type AlertaMedicaDashboard,
  type AsistenciaMensual,
  type DistribucionGrupos,
  type AsistenciaPorRol,
  type ComparativaMensual,
  type DisponibilidadFichas,
  type EventoApi,
  type NinoGraduacionApi,
  type NinoTransicionApi,
  type PersonalDisponibleApi,
} from '../services/servicioApi';
import { fechaLocalHoy } from '../services/fechaUtils';

const PaginaDashboard: React.FC = () => {
  const { usuario } = useAuth();

  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [cumpleaneros, setCumpleaneros] = useState<CumpleaneroDashboard[]>([]);
  const [alertas, setAlertas] = useState<AlertaMedicaDashboard[]>([]);
  const [asistenciaMensual, setAsistenciaMensual] = useState<AsistenciaMensual[]>([]);
  const [distribucionGrupos, setDistribucionGrupos] = useState<DistribucionGrupos[]>([]);
  const [asistenciaPorRol, setAsistenciaPorRol] = useState<AsistenciaPorRol[]>([]);
  const [comparativa, setComparativa] = useState<ComparativaMensual[]>([]);
  const [fichasDisponibles, setFichasDisponibles] = useState<DisponibilidadFichas[]>([]);
  const [eventos, setEventos] = useState<EventoApi[]>([]);
  const [ninosGraduacion, setNinosGraduacion] = useState<NinoGraduacionApi[]>([]);
  const [ninosTransicion, setNinosTransicion] = useState<NinoTransicionApi[]>([]);
  const [personalDisponible, setPersonalDisponible] = useState<PersonalDisponibleApi[]>([]);
  const [cargando, setCargando] = useState(true);

  const { data: dashboardData, error: errorDashboard, isLoading: isLoadingDashboard } = useSWR(
    'dashboard-all-data',
    async () => {
      const [
        resMetricas,
        resCumple,
        resAlertas,
        resAsistMensual,
        resDistrib,
        resAsistRol,
        resComparativa,
        resFichas,
        resEventos,
        resGrad,
        resTrans,
        resDisp,
      ] = await Promise.allSettled([
        obtenerMetricasDashboard(),
        obtenerCumpleanerosMes(),
        obtenerAlertasMedicas(),
        obtenerAsistenciaMensual(),
        obtenerDistribucionGrupos(),
        obtenerAsistenciaPorRol(),
        obtenerComparativaMensual(),
        obtenerDisponibilidadFichas(),
        listarEventos(),
        obtenerNinosGraduacion(),
        obtenerNinosTransicion(),
        obtenerPersonalDisponibleDashboard(),
      ]);

      // Log errors para depuración
      const resultados = [
        { name: 'Métricas', res: resMetricas },
        { name: 'Cumpleañeros', res: resCumple },
        { name: 'Alertas', res: resAlertas },
        { name: 'AsistenciaMensual', res: resAsistMensual },
        { name: 'DistribucionGrupos', res: resDistrib },
        { name: 'AsistenciaPorRol', res: resAsistRol },
        { name: 'Comparativa', res: resComparativa },
        { name: 'Fichas', res: resFichas },
        { name: 'Eventos', res: resEventos },
        { name: 'Graduación', res: resGrad },
        { name: 'Transición', res: resTrans },
        { name: 'Personal Disponible', res: resDisp },
      ];
      resultados.forEach((r) => {
        if (r.res.status === 'rejected') {
          console.error(`[Dashboard] Error al cargar ${r.name}:`, r.res.reason);
        }
      });

      return {
        metricas: resMetricas.status === 'fulfilled' ? resMetricas.value : null,
        cumpleaneros: resCumple.status === 'fulfilled' ? resCumple.value : [],
        alertas: resAlertas.status === 'fulfilled' ? resAlertas.value : [],
        asistenciaMensual: resAsistMensual.status === 'fulfilled' ? resAsistMensual.value : [],
        distribucionGrupos: resDistrib.status === 'fulfilled' ? resDistrib.value : [],
        asistenciaPorRol: resAsistRol.status === 'fulfilled' ? resAsistRol.value : [],
        comparativa: resComparativa.status === 'fulfilled' ? resComparativa.value : [],
        fichasDisponibles: resFichas.status === 'fulfilled' ? resFichas.value : [],
        eventos: resEventos.status === 'fulfilled' ? resEventos.value : [],
        ninosGraduacion: resGrad.status === 'fulfilled' ? resGrad.value : [],
        ninosTransicion: resTrans.status === 'fulfilled' ? resTrans.value : [],
        personalDisponible: resDisp.status === 'fulfilled' ? resDisp.value : [],
      };
    },
    {
      refreshInterval: 30000, // 30 segundos
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );


  useEffect(() => {
    if (dashboardData) {
      setMetricas(dashboardData.metricas);
      setCumpleaneros(dashboardData.cumpleaneros);
      setAlertas(dashboardData.alertas);
      setAsistenciaMensual(dashboardData.asistenciaMensual);
      setDistribucionGrupos(dashboardData.distribucionGrupos);
      setAsistenciaPorRol(dashboardData.asistenciaPorRol);
      setComparativa(dashboardData.comparativa);
      setFichasDisponibles(dashboardData.fichasDisponibles);
      setEventos(dashboardData.eventos);
      setNinosGraduacion(dashboardData.ninosGraduacion);
      setNinosTransicion(dashboardData.ninosTransicion);
      setPersonalDisponible(dashboardData.personalDisponible);
      setCargando(false);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (errorDashboard) {
      console.error('[Dashboard] Error al actualizar los datos del panel:', errorDashboard);
      toast.error('Error al actualizar los datos del panel.');
      setCargando(false);
    }
  }, [errorDashboard]);

  useEffect(() => {
    if (isLoadingDashboard && !dashboardData) {
      setCargando(true);
    }
  }, [isLoadingDashboard, dashboardData]);

  useEffect(() => {
    if (alertas.length > 0) {
      alertas.forEach((alerta) => {
        toast.error(`Alerta Médica: ${alerta.nino} — ${alerta.tipo}: ${alerta.descripcion}`, {
          icon: '⚠️',
          id: `alerta-medica-${alerta.idPersona}`,
        });
      });
    }
  }, [alertas]);

  const primerNombre = usuario?.nombreCompleto.split(' ')[0] ?? 'Usuario';
  const mesActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const mesCapitalizado = mesActual.charAt(0).toUpperCase() + mesActual.slice(1);

  // Datos transformados para gráficas
  const datosLineaMensual = useMemo(() => {
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Agrupar por mes en caso de haber múltiples turnos en un mismo mes
    const porMes: { [mes: string]: number } = {};
    asistenciaMensual.forEach((a) => {
      porMes[a.mes] = (porMes[a.mes] || 0) + a.ninosDistintos;
    });

    const ordenados = Object.keys(porMes).sort();
    return ordenados
      .slice(-6) // Últimos 6 meses
      .map((mes) => {
        const partes = mes.split('-');
        let etiqueta = mes;
        if (partes.length === 2) {
          const mesIndex = parseInt(partes[1], 10) - 1;
          if (mesIndex >= 0 && mesIndex < 12) {
            etiqueta = nombresMeses[mesIndex];
          }
        }
        return {
          etiqueta,
          valor: porMes[mes],
        };
      });
  }, [asistenciaMensual]);

  const datosDonaGrupos = useMemo(() => {
    const colores = ['#2a7de1', '#006a35', '#8f4e00'];
    return distribucionGrupos.map((d, i) => ({
      etiqueta: d.grupo,
      valor: d.cantidad,
      color: colores[i % colores.length],
    }));
  }, [distribucionGrupos]);

  const datosBarrasRol = useMemo(() => {
    return asistenciaPorRol.map((a) => ({
      rol: a.rol,
      temprano: a.temprano,
      tarde: a.tarde,
      justificado: a.justificado,
      injustificado: a.injustificado,
    }));
  }, [asistenciaPorRol]);

  const proximosEventos = useMemo(() => {
    const hoyStr = fechaLocalHoy();
    return eventos
      .filter((e) => e.activo && e.fecha >= hoyStr)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 3);
  }, [eventos]);

  const formatearFechaEvento = (fechaStr: string, turnoStr: string | null) => {
    if (!fechaStr) return '';
    const fechaLimpia = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const partes = fechaLimpia.split('-');
    if (partes.length === 3) {
      const [yyyy, mm, dd] = partes;
      // Usar constructor local para evitar desfases UTC
      const fecha = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      if (isNaN(fecha.getTime())) return fechaStr;
      const opcionesDia: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
      const friendly = fecha.toLocaleDateString('es-ES', opcionesDia);
      const friendlyCap = friendly.charAt(0).toUpperCase() + friendly.slice(1);
      return turnoStr ? `${friendlyCap} · ${turnoStr}` : friendlyCap;
    }
    return fechaStr;
  };

  const formatearFechaVisual = (fechaStr: string) => {
    if (!fechaStr) return '';
    const fechaLimpia = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const partes = fechaLimpia.split('-');
    if (partes.length === 3) {
      const [yyyy, mm, dd] = partes;
      const fecha = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      if (isNaN(fecha.getTime())) return fechaStr;
      const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      return fecha.toLocaleDateString('es-ES', opciones);
    }
    return fechaStr;
  };

  const ultimaComparativa = comparativa.length > 0 ? comparativa[0] : null;

  // Tarjetas de acceso rápido
  const tarjetasAcceso = [
    {
      icono: 'child_care',
      titulo: 'Ingreso de Niños',
      descripcion: 'Registrar nuevos niños y tutores',
      ruta: '/ingreso-ninos',
      colorIcono: 'text-primary',
      fondoIcono: 'bg-primary/10',
    },
    {
      icono: 'fact_check',
      titulo: 'Asistencia de Niños',
      descripcion: 'Check-in y check-out de niños',
      ruta: '/asistencia-general',
      colorIcono: 'text-tertiary',
      fondoIcono: 'bg-tertiary/10',
    },
    {
      icono: 'groups',
      titulo: 'Asistencia del Personal',
      descripcion: 'Registro de llegada del personal',
      ruta: '/asistencia-personal',
      colorIcono: 'text-secondary',
      fondoIcono: 'bg-secondary/10',
    },
    {
      icono: 'assessment',
      titulo: 'Reportes',
      descripcion: 'Generar y exportar reportes',
      ruta: '/reportes',
      colorIcono: 'text-on-surface',
      fondoIcono: 'bg-surface-container-high',
    },
  ];

  return (
    <LayoutPrincipal titulo="Panel de Control">
      <div className="space-y-stack-lg max-w-[1440px]">

        {/* ── Saludo personalizado ──────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant">
              Buenos días,
            </p>
            <h2 className="text-headline-md font-headline-md text-on-surface">
              {primerNombre} 👋
            </h2>
          </div>
          <span className="text-body-sm text-on-surface-variant hidden sm:block">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* ── Resumen del Día ───────────────────────── */}
        <section aria-label="Resumen del día">
          <h2 className="text-label-md font-label-md text-on-surface-variant mb-stack-md uppercase tracking-wider">
            Resumen del Día
          </h2>

          {cargando ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[88px] bg-surface-container-high rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
              <TarjetaEstadistica
                etiqueta="Niños Presentes"
                valor={metricas?.ninosPresentes ?? 0}
                icono="group"
                colorAccento="primary"
              />
              <TarjetaEstadistica
                etiqueta="Pendientes de Retiro"
                valor={metricas?.pendientesRetiro ?? 0}
                icono="logout"
                colorAccento="secondary"
              />
              <TarjetaEstadistica
                etiqueta="Personal Activo"
                valor={metricas?.personalActivo ?? 0}
                icono="badge"
                colorAccento="tertiary"
              />
              <TarjetaEstadistica
                etiqueta="Solicitudes Pendientes"
                valor={metricas?.solicitudesPendientes ?? 0}
                icono="pending_actions"
                colorAccento="secondary"
              />
            </div>
          )}
        </section>

        {/* ── Alertas y Capacidad Predictiva ─────────── */}
        <section aria-label="Alertas y capacidad predictiva">
          <h2 className="text-label-md font-label-md text-on-surface-variant mb-stack-md uppercase tracking-wider">
            Alertas y Capacidad Predictiva
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            
            {/* Card 1: Próximas Graduaciones (13 años) */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30 flex flex-col h-[280px]">
              <div className="flex items-center gap-2 mb-stack-md border-b border-outline-variant/30 pb-2 shrink-0">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full text-[20px]" aria-hidden="true">
                  school
                </span>
                <h3 className="text-label-md font-semibold text-on-surface">Niños por Graduarse (13 Años)</h3>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {cargando ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-10 bg-surface-container-high rounded" />
                    <div className="h-10 bg-surface-container-high rounded" />
                  </div>
                ) : ninosGraduacion.length > 0 ? (
                  ninosGraduacion.map((n, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-surface-container-low rounded-lg text-body-sm text-on-surface">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{n.nombres} {n.apellidos}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2 font-mono">
                        {n.yaGraduoEsteAnio ? (
                          <span className="bg-tertiary/10 text-tertiary text-label-sm px-2 py-0.5 rounded-full font-semibold">Graduado</span>
                        ) : (
                          <div className="text-label-sm text-secondary font-semibold">
                            {formatearFechaVisual(n.fechaGraduacionEsteAnio)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-body-sm text-on-surface-variant text-center py-8">
                    No hay niños próximos a cumplir 13 años este año. 🎉
                  </p>
                )}
              </div>
            </div>

            {/* Card 2: Transiciones de Grupo (Edad fuera de rango) */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30 flex flex-col h-[280px]">
              <div className="flex items-center gap-2 mb-stack-md border-b border-outline-variant/30 pb-2 shrink-0">
                <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-full text-[20px]" aria-hidden="true">
                  swap_horiz
                </span>
                <h3 className="text-label-md font-semibold text-on-surface">Transiciones de Grupo</h3>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {cargando ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-10 bg-surface-container-high rounded" />
                    <div className="h-10 bg-surface-container-high rounded" />
                  </div>
                ) : ninosTransicion.length > 0 ? (
                  ninosTransicion.map((n, i) => (
                    <div key={i} className="p-2 bg-surface-container-low rounded-lg text-body-sm text-on-surface space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold truncate">{n.nombres} {n.apellidos}</p>
                        <span className={`text-label-sm px-2 py-0.5 rounded-full font-semibold ${
                          n.estadoTransicion === 'Debe_Transicionar' ? 'bg-error/10 text-error' :
                          n.estadoTransicion === 'Fuera_De_Rango' ? 'bg-secondary/10 text-secondary' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {n.estadoTransicion.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-label-sm text-on-surface-variant">
                        <span>Edad: {n.edadEsteMes} años</span>
                        <span>{n.grupoActual || 'Sin Grupo'} → <strong className="text-primary">{n.grupoSugerido || 'N/A'}</strong></span>
                      </div>
                      {n.estadoTransicion === 'Debe_Transicionar' && n.fechaTransicion && (
                        <div className="text-label-sm text-secondary font-medium pt-1 mt-1 border-t border-outline-variant/20 flex justify-between items-center">
                          <span>Fecha de transición:</span>
                          <span className="font-semibold">{formatearFechaVisual(n.fechaTransicion)}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-body-sm text-on-surface-variant text-center py-8">
                    Todos los niños están en el grupo adecuado para su edad.
                  </p>
                )}
              </div>
            </div>

            {/* Card 3: Personal Disponible del Día */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30 flex flex-col h-[280px]">
              <div className="flex items-center gap-2 mb-stack-md border-b border-outline-variant/30 pb-2 shrink-0">
                <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-full text-[20px]" aria-hidden="true">
                  verified_user
                </span>
                <h3 className="text-label-md font-semibold text-on-surface">Personal Disponible Hoy</h3>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {cargando ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-10 bg-surface-container-high rounded" />
                    <div className="h-10 bg-surface-container-high rounded" />
                  </div>
                ) : personalDisponible.length > 0 ? (
                  personalDisponible.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-surface-container-low rounded-lg text-body-sm text-on-surface">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{p.nombreCompleto}</p>
                        <p className="text-label-sm text-on-surface-variant">Rol: {p.rol}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-label-sm text-on-surface-variant font-mono">Desde: {p.fechaIngresoServicio}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-body-sm text-on-surface-variant text-center py-8">
                    No hay personal disponible registrado para hoy.
                  </p>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ── Tarjetas de Acceso Rápido ─────────────── */}
        <section aria-label="Accesos rápidos">
          <h2 className="text-label-md font-label-md text-on-surface-variant mb-stack-md uppercase tracking-wider">
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {tarjetasAcceso.map((t) => (
              <TarjetaAcceso key={t.ruta} {...t} />
            ))}
          </div>
        </section>

        {/* ── Gráficas ──────────────────────────────── */}
        <section aria-label="Gráficas del dashboard">
          <h2 className="text-label-md font-label-md text-on-surface-variant mb-stack-md uppercase tracking-wider">
            Métricas y Tendencias
          </h2>

          {cargando ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[260px] bg-surface-container-high rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
              {/* Gráfica 1: Asistencia niños por mes */}
              <GraficaBarras
                datos={datosLineaMensual}
                titulo="Asistencia de Niños por Mes"
                colorBarra="#2a7de1"
              />

              {/* Gráfica 2: Distribución por grupo */}
              <GraficaDona
                datos={datosDonaGrupos}
                titulo="Distribución por Grupo"
              />

              {/* Gráfica 3: Asistencia personal por rol */}
              <GraficaBarrasApiladas
                datos={datosBarrasRol}
                titulo="Asistencia del Personal por Rol"
              />

              {/* Gráfica 4: Comparativa mes anterior */}
              <IndicadorDelta
                valorActual={ultimaComparativa?.totalNinos ?? 0}
                valorAnterior={ultimaComparativa?.mesAnterior ?? null}
                titulo="Comparativa vs Mes Anterior"
              />
            </div>
          )}
        </section>

        {/* ── Solicitudes Pendientes (badge grande) ─── */}
        {!cargando && (metricas?.solicitudesPendientes ?? 0) > 0 && (
          <section aria-label="Solicitudes pendientes">
            <ContadorBadge
              valor={metricas?.solicitudesPendientes ?? 0}
              titulo="Solicitudes de Ingreso Pendientes"
              subtitulo="Requieren revisión del Coordinador General"
            />
          </section>
        )}

        {/* ── Grid principal: Cumpleañeros + Alertas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

          {/* ── Columna izquierda: Cumpleañeros ─────── */}
          <section className="lg:col-span-8 space-y-stack-lg">
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between mb-stack-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" aria-hidden="true">
                    cake
                  </span>
                  <h2 className="text-headline-md font-headline-md text-on-surface">
                    Cumpleañeros del Mes
                  </h2>
                </div>
                <span className="text-label-md font-label-md text-secondary bg-secondary/10 px-3 py-1 rounded-full capitalize">
                  {mesCapitalizado}
                </span>
              </div>

              {cargando ? (
                <div className="space-y-3 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-surface-container-high rounded-full w-2/5" />
                        <div className="h-3 bg-surface-container-high rounded-full w-3/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : cumpleaneros.length > 0 ? (
                <div>
                  {cumpleaneros.map((c) => (
                    <ItemCumpleanero key={c.idPersona} cumpleanero={c} />
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-on-surface-variant text-center py-8">
                  No hay cumpleañeros este mes. 🎉
                </p>
              )}
            </div>


          </section>

          {/* ── Columna derecha: Actividad Reciente ─── */}
          <section className="lg:col-span-4" aria-label="Resumen rápido">
            <div className="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant/30 h-full space-y-stack-lg">

              {/* Resumen de fichas disponibles */}
              <div>
                <h2 className="text-headline-md font-headline-md text-on-surface mb-stack-md">
                  Fichas Disponibles
                </h2>
                <div className="space-y-3">
                  {fichasDisponibles.length > 0 ? (
                    fichasDisponibles.map((f, idx) => {
                      const colores = ['bg-primary', 'bg-tertiary', 'bg-secondary', 'bg-outline'];
                      const color = colores[idx % colores.length];
                      return (
                        <div key={f.idGrupo} className="space-y-1">
                          <div className="flex justify-between text-label-sm">
                            <span className="text-on-surface">{f.nombreGrupo}</span>
                            <span className="text-on-surface-variant">{f.disponibles}/{f.total}</span>
                          </div>
                          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className={`h-full ${color} rounded-full transition-all`}
                              style={{ width: `${f.total > 0 ? (f.disponibles / f.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-body-sm text-on-surface-variant text-center py-4">
                      No hay información de fichas.
                    </p>
                  )}
                </div>
              </div>

              {/* Eventos del mes */}
              <div>
                <h2 className="text-headline-md font-headline-md text-on-surface mb-stack-md">
                  Próximos Eventos
                </h2>
                <div className="space-y-3">
                  {proximosEventos.length > 0 ? (
                    proximosEventos.map((ev) => (
                      <div key={ev.idEvento} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-[20px]">event</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-label-md font-label-md text-on-surface truncate" title={ev.nombre}>
                            {ev.nombre}
                          </p>
                          <p className="text-label-sm text-on-surface-variant">
                            {formatearFechaEvento(ev.fecha, ev.turno ?? null)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-body-sm text-on-surface-variant text-center py-8">
                      No hay eventos programados. 📅
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaDashboard;
