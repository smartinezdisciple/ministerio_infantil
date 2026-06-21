import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LayoutPrincipal from '../components/LayoutPrincipal';
import TablaBase, { type ColumnaTabla } from '../components/TablaBase';
import { toast } from 'react-hot-toast';
import {
  listarPersonas,
  crearPersona,
  actualizarPersona,
  asignarRolesPersona,
  type PersonaApi,
} from '../services/servicioApi';
import { filtrarSoloLetras, formatearTelefono } from '../services/validacionEntrada';
import { parsearFechaUsuario, formatearFechaConMesTexto } from '../services/fechaUtils';

const PaginaPersonas: React.FC = () => {
  const [personas, setPersonas] = useState<PersonaApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<'Todos' | 'Lider' | 'Tutor' | 'Personal'>('Todos');
  const [cargandoAccion, setCargandoAccion] = useState(false);

  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalRoles, setModalRoles] = useState(false);

  const [personaSeleccionada, setPersonaSeleccionada] = useState<PersonaApi | null>(null);

  // Formulario de persona (Crear/Editar)
  const [formPersona, setFormPersona] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    sexo: '' as 'Masculino' | 'Femenino' | '',
    cedula: '',
    fechaNacimiento: '',
  });

  // Formulario de roles
  const [formRoles, setFormRoles] = useState({
    esLider: false,
    esTutor: false,
    tipoTutor: 'Padre',
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await listarPersonas();
      setPersonas(datos);
    } catch (err) {
      console.error('Error cargando personas:', err);
      toast.error('Error al cargar la lista de personas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtrado y búsqueda
  const personasFiltradas = useMemo(() => {
    const query = busqueda.toLowerCase().trim();
    return personas.filter((p) => {
      const coincideNombre = 
        p.nombres.toLowerCase().includes(query) || 
        p.apellidos.toLowerCase().includes(query) ||
        `${p.nombres} ${p.apellidos}`.toLowerCase().includes(query);
      
      const coincideCedula = p.cedula ? p.cedula.toLowerCase().includes(query) : false;
      const coincideBusqueda = coincideNombre || coincideCedula;

      if (!coincideBusqueda) return false;

      if (filtroRol === 'Lider') return p.esLider;
      if (filtroRol === 'Tutor') return p.esTutor;
      if (filtroRol === 'Personal') return p.esPersonal;
      return true;
    });
  }, [personas, busqueda, filtroRol]);

  const personasPaginadas = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return personasFiltradas.slice(inicio, inicio + porPagina);
  }, [personasFiltradas, pagina, porPagina]);

  // Abrir modal de creación
  const abrirModalCrear = () => {
    setFormPersona({
      nombres: '',
      apellidos: '',
      telefono: '',
      sexo: '',
      cedula: '',
      fechaNacimiento: '',
    });
    setModalCrear(true);
  };

  // Abrir modal de edición
  const abrirModalEditar = (p: PersonaApi) => {
    setPersonaSeleccionada(p);
    setFormPersona({
      nombres: p.nombres,
      apellidos: p.apellidos,
      telefono: p.telefono ?? '',
      sexo: p.sexo ?? '',
      cedula: p.cedula ?? '',
      fechaNacimiento: p.fechaNacimiento ? formatearFechaConMesTexto(p.fechaNacimiento) : '',
    });
    setModalEditar(true);
  };

  // Abrir modal de roles
  const abrirModalRoles = (p: PersonaApi) => {
    setPersonaSeleccionada(p);
    setFormRoles({
      esLider: p.esLider,
      esTutor: p.esTutor,
      tipoTutor: p.tipoTutor ?? 'Padre',
    });
    setModalRoles(true);
  };

  // Guardar nueva persona
  const handleCrearPersona = async () => {
    if (!formPersona.nombres.trim() || !formPersona.apellidos.trim()) {
      toast.error('Nombres y apellidos son obligatorios.');
      return;
    }
    let fechaDb: string | undefined = undefined;
    if (formPersona.fechaNacimiento.trim()) {
      const parsed = parsearFechaUsuario(formPersona.fechaNacimiento);
      if (!parsed) {
        toast.error('Fecha de nacimiento inválida. Use el formato DD-MM-AA o DD-Mes-AA (ej: 08-Junio-26).');
        return;
      }
      fechaDb = parsed;
    }
    setCargandoAccion(true);
    try {
      await crearPersona({
        nombres: formPersona.nombres,
        apellidos: formPersona.apellidos,
        telefono: formPersona.telefono.trim() || undefined,
        sexo: formPersona.sexo || undefined,
        cedula: formPersona.cedula.trim() || undefined,
        fechaNacimiento: fechaDb,
      });
      toast.success('Persona registrada correctamente.');
      setModalCrear(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar persona.');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Guardar edición de persona
  const handleEditarPersona = async () => {
    if (!personaSeleccionada) return;
    if (!formPersona.nombres.trim() || !formPersona.apellidos.trim()) {
      toast.error('Nombres y apellidos son obligatorios.');
      return;
    }
    let fechaDb: string | undefined = undefined;
    if (formPersona.fechaNacimiento.trim()) {
      const parsed = parsearFechaUsuario(formPersona.fechaNacimiento);
      if (!parsed) {
        toast.error('Fecha de nacimiento inválida. Use el formato DD-MM-AA o DD-Mes-AA (ej: 08-Junio-26).');
        return;
      }
      fechaDb = parsed;
    }
    setCargandoAccion(true);
    try {
      await actualizarPersona(personaSeleccionada.idPersona, {
        nombres: formPersona.nombres,
        apellidos: formPersona.apellidos,
        telefono: formPersona.telefono.trim() || undefined,
        sexo: formPersona.sexo || undefined,
        cedula: formPersona.cedula.trim() || undefined,
        fechaNacimiento: fechaDb,
      });
      toast.success('Datos actualizados correctamente.');
      setModalEditar(false);
      setPersonaSeleccionada(null);
      cargarDatos();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar datos.');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Guardar roles de la persona
  const handleGuardarRoles = async () => {
    if (!personaSeleccionada) return;
    setCargandoAccion(true);
    try {
      await asignarRolesPersona(personaSeleccionada.idPersona, {
        esLider: formRoles.esLider,
        esTutor: formRoles.esTutor,
        tipoTutor: formRoles.esTutor ? formRoles.tipoTutor : undefined,
      });
      toast.success('Roles asignados correctamente.');
      setModalRoles(false);
      setPersonaSeleccionada(null);
      cargarDatos();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Error al asignar roles.');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Renderizado de las columnas de la tabla
  const columnas: ColumnaTabla<PersonaApi>[] = [
    {
      id: 'nombre',
      encabezado: 'Nombre Completo',
      ordenablePor: 'nombres',
      render: (p) => (
        <span className="text-body-sm font-semibold text-on-surface">
          {p.nombres} {p.apellidos}
        </span>
      ),
    },
    {
      id: 'telefono',
      encabezado: 'Teléfono',
      render: (p) => (
        <span className="text-body-md text-on-surface font-mono">
          {p.telefono || <span className="text-on-surface-variant/40 italic text-label-sm">No registrado</span>}
        </span>
      ),
    },
    {
      id: 'cedula',
      encabezado: 'Cédula',
      render: (p) => (
        <span className="text-body-md text-on-surface font-mono">
          {p.cedula || <span className="text-on-surface-variant/40 italic text-label-sm">No registrada</span>}
        </span>
      ),
    },
    {
      id: 'roles',
      encabezado: 'Roles Asignados',
      render: (p) => (
        <div className="flex flex-wrap gap-1.5">
          {p.esPersonal && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase" title={`Rol en sistema: ${p.rolSistema || 'Sin asignar'}`}>
              <span className="material-symbols-outlined text-[12px]">shield</span>
              Personal
            </span>
          )}
          {p.esLider && (
            <span className="inline-flex items-center gap-1 bg-tertiary/15 text-tertiary px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase">
              <span className="material-symbols-outlined text-[12px]">partner_exchange</span>
              Líder
            </span>
          )}
          {p.esTutor && (
            <span className="inline-flex items-center gap-1 bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase">
              <span className="material-symbols-outlined text-[12px]">family_history</span>
              {p.tipoTutor || 'Tutor'}
            </span>
          )}
          {!p.esPersonal && !p.esLider && !p.esTutor && (
            <span className="bg-surface-container-high text-on-surface-variant/60 px-2 py-0.5 rounded-full text-[11px] font-medium italic">
              Sin rol asignado
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'acciones',
      encabezado: 'Acciones',
      alineaDerecha: true,
      render: (p) => (
        <div className="flex flex-wrap items-center justify-start gap-1 max-w-[120px] md:max-w-none ml-auto">
          {/* Asignar Roles */}
          <div className="relative group inline-block">
            <button
              onClick={() => abrirModalRoles(p)}
              className="w-[28px] h-[28px] rounded-lg border-[3px] border-emerald-500 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Asignar Roles Funcionales"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>manage_accounts</span>
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
              roles
            </span>
          </div>

          {/* Editar Persona */}
          <div className="relative group inline-block">
            <button
              onClick={() => abrirModalEditar(p)}
              className="w-[28px] h-[28px] rounded-lg border-[3px] border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Editar Datos"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>edit</span>
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
              editar
            </span>
          </div>

          {/* Botón de Llamar (si tiene teléfono) */}
          {p.telefono ? (
            <div className="relative group inline-block">
              <a
                href={`tel:${p.telefono.replace(/\s+/g, '')}`}
                className="w-[28px] h-[28px] rounded-lg border-[3px] border-sky-500 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:border-sky-500 hover:text-black flex items-center justify-center transition-all cursor-pointer animate-fade-in"
                aria-label="Llamar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>call</span>
              </a>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                llamar
              </span>
            </div>
          ) : (
            <div className="relative group inline-block">
              <button
                disabled
                className="w-[28px] h-[28px] rounded-lg border-[3px] border-outline-variant/30 bg-outline-variant/10 text-outline/30 flex items-center justify-center cursor-not-allowed"
                aria-label="Sin Teléfono"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>call</span>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                sin teléfono
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <LayoutPrincipal titulo="Directorio General de Personas">
      <div className="space-y-stack-lg max-w-[1440px]">
        {/* Barra superior con filtros e inserción */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-gutter">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o cédula..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-variant/50"
            />
          </div>

          {/* Filtros de Rol */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {(['Todos', 'Lider', 'Tutor', 'Personal'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setFiltroRol(r);
                  setPagina(1);
                }}
                className={`px-4 py-2 rounded-xl text-label-sm font-label-sm transition-colors whitespace-nowrap cursor-pointer ${
                  filtroRol === r
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {r === 'Todos' ? 'Todos' : r === 'Lider' ? 'Líderes' : r === 'Tutor' ? 'Padres / Tutores' : 'Personal Sistema'}
              </button>
            ))}
          </div>

          {/* Registrar nueva persona */}
          <button
            onClick={abrirModalCrear}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md shadow-md hover:bg-primary/90 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Registrar Persona
          </button>
        </div>

        {/* Tabla de Personas */}
        <TablaBase
          columnas={columnas}
          filas={personasPaginadas}
          obtenerClave={(p) => p.idPersona}
          pagina={pagina}
          total={personasFiltradas.length}
          porPagina={porPagina}
          onCambiarPagina={setPagina}
          onCambiarPorPagina={setPorPagina}
          cargando={cargando}
          mensajeVacio="No se encontraron personas registradas en el sistema."
        />

        {/* Modal de Registro de Persona */}
        {modalCrear && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[28px]">person_add</span>
                  Registrar Persona
                </h2>
                <button onClick={() => setModalCrear(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Nombres *</label>
                    <input
                      type="text"
                      value={formPersona.nombres}
                      onChange={(e) => setFormPersona((p) => ({ ...p, nombres: filtrarSoloLetras(e.target.value) }))}
                      placeholder="Ej. Carlos"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Apellidos *</label>
                    <input
                      type="text"
                      value={formPersona.apellidos}
                      onChange={(e) => setFormPersona((p) => ({ ...p, apellidos: filtrarSoloLetras(e.target.value) }))}
                      placeholder="Ej. Gómez"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Teléfono Principal</label>
                  <input
                    type="tel"
                    value={formPersona.telefono}
                    onChange={(e) => setFormPersona((p) => ({ ...p, telefono: formatearTelefono(e.target.value, p.telefono) }))}
                    placeholder="Ej. +505 8888 8888"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Cédula</label>
                    <input
                      type="text"
                      value={formPersona.cedula}
                      onChange={(e) => setFormPersona((p) => ({ ...p, cedula: e.target.value.toUpperCase() }))}
                      placeholder="001-000000-0000A"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Sexo</label>
                    <select
                      value={formPersona.sexo}
                      onChange={(e) => setFormPersona((p) => ({ ...p, sexo: e.target.value as any }))}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Fecha Nacimiento</label>
                  <input
                    type="text"
                    placeholder="DD-MM-AA o DD-Mes-AA (ej: 08-Junio-26)"
                    value={formPersona.fechaNacimiento}
                    onChange={(e) => setFormPersona((p) => ({ ...p, fechaNacimiento: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button onClick={() => setModalCrear(false)} disabled={cargandoAccion} className="border border-outline-variant text-on-surface-variant rounded-xl px-4 py-2 text-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={handleCrearPersona} disabled={cargandoAccion || !formPersona.nombres.trim() || !formPersona.apellidos.trim()} className="bg-primary text-on-primary rounded-xl px-5 py-2 text-label-md shadow-md hover:bg-primary/95 transition-all disabled:opacity-50 flex items-center gap-1.5">
                  {cargandoAccion && <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>}
                  Registrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edición de Persona */}
        {modalEditar && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[28px]">edit_note</span>
                  Editar Persona
                </h2>
                <button onClick={() => { setModalEditar(false); setPersonaSeleccionada(null); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Nombres *</label>
                    <input
                      type="text"
                      value={formPersona.nombres}
                      onChange={(e) => setFormPersona((p) => ({ ...p, nombres: filtrarSoloLetras(e.target.value) }))}
                      placeholder="Nombres"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Apellidos *</label>
                    <input
                      type="text"
                      value={formPersona.apellidos}
                      onChange={(e) => setFormPersona((p) => ({ ...p, apellidos: filtrarSoloLetras(e.target.value) }))}
                      placeholder="Apellidos"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Teléfono Principal</label>
                  <input
                    type="tel"
                    value={formPersona.telefono}
                    onChange={(e) => setFormPersona((p) => ({ ...p, telefono: formatearTelefono(e.target.value, p.telefono) }))}
                    placeholder="Teléfono"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Cédula</label>
                    <input
                      type="text"
                      value={formPersona.cedula}
                      onChange={(e) => setFormPersona((p) => ({ ...p, cedula: e.target.value.toUpperCase() }))}
                      placeholder="Cédula"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Sexo</label>
                    <select
                      value={formPersona.sexo}
                      onChange={(e) => setFormPersona((p) => ({ ...p, sexo: e.target.value as any }))}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Fecha Nacimiento</label>
                  <input
                    type="text"
                    placeholder="DD-MM-AA o DD-Mes-AA (ej: 08-Junio-26)"
                    value={formPersona.fechaNacimiento}
                    onChange={(e) => setFormPersona((p) => ({ ...p, fechaNacimiento: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button onClick={() => { setModalEditar(false); setPersonaSeleccionada(null); }} disabled={cargandoAccion} className="border border-outline-variant text-on-surface-variant rounded-xl px-4 py-2 text-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={handleEditarPersona} disabled={cargandoAccion || !formPersona.nombres.trim() || !formPersona.apellidos.trim()} className="bg-primary text-on-primary rounded-xl px-5 py-2 text-label-md shadow-md hover:bg-primary/95 transition-all disabled:opacity-50 flex items-center gap-1.5">
                  {cargandoAccion && <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Asignación de Roles */}
        {modalRoles && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[28px]">rule_folder</span>
                  Asignar Roles
                </h2>
                <button onClick={() => { setModalRoles(false); setPersonaSeleccionada(null); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              {personaSeleccionada && (
                <div className="text-body-sm text-on-surface-variant/80">
                  Persona: <strong className="text-on-surface">{personaSeleccionada.nombres} {personaSeleccionada.apellidos}</strong>
                </div>
              )}

              <div className="space-y-4 py-2">
                {/* Switch Líder */}
                <label className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 cursor-pointer hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-tertiary">partner_exchange</span>
                    <div className="flex flex-col">
                      <span className="text-body-md font-bold text-on-surface">Líder Espiritual</span>
                      <span className="text-label-sm text-on-surface-variant/70">Asignar como Líder activo</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formRoles.esLider}
                    onChange={(e) => setFormRoles((r) => ({ ...r, esLider: e.target.checked }))}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </label>

                {/* Switch Tutor/Padre */}
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 cursor-pointer hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">family_history</span>
                      <div className="flex flex-col">
                        <span className="text-body-md font-bold text-on-surface">Padre / Tutor</span>
                        <span className="text-label-sm text-on-surface-variant/70">Asignar como Tutor</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formRoles.esTutor}
                      onChange={(e) => setFormRoles((r) => ({ ...r, esTutor: e.target.checked }))}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                  </label>

                  {formRoles.esTutor && (
                    <div className="pl-2 animate-fade-in">
                      <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Relación / Parentesco</label>
                      <select
                        value={formRoles.tipoTutor}
                        onChange={(e) => setFormRoles((r) => ({ ...r, tipoTutor: e.target.value }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="Padre">Padre</option>
                        <option value="Madre">Madre</option>
                        <option value="Tutor">Tutor / Guardián</option>
                        <option value="Abuelo">Abuelo / Abuela</option>
                        <option value="Tio">Tío / Tía</option>
                        <option value="Hermano">Hermano / Hermana</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button onClick={() => { setModalRoles(false); setPersonaSeleccionada(null); }} disabled={cargandoAccion} className="border border-outline-variant text-on-surface-variant rounded-xl px-4 py-2 text-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={handleGuardarRoles} disabled={cargandoAccion} className="bg-primary text-on-primary rounded-xl px-5 py-2 text-label-md shadow-md hover:bg-primary/95 transition-all disabled:opacity-50 flex items-center gap-1.5">
                  {cargandoAccion && <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>}
                  Asignar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default PaginaPersonas;
