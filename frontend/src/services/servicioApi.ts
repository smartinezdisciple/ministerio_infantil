// servicioApi.ts — Servicio centralizado para llamadas al backend (CLAUDE.md §3.1)
// URL base configurada para desarrollo local; en producción se lee de la variable de entorno.

const URL_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

/** Cabeceras comunes con JWT inyectado desde localStorage */
const cabecerasAuth = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('ed_token') ?? ''}`,
});

/**
 * Función auxiliar genérica para llamadas GET autenticadas.
 * Lanza un error si la respuesta no es 2xx.
 * Si recibe 401, limpia localStorage y redirige al login.
 */
async function get<T>(ruta: string): Promise<T> {
  const res = await fetch(`${URL_BASE}${ruta}`, {
    method: 'GET',
    headers: cabecerasAuth(),
  });
  if (res.status === 401) {
    // Token expirado o inválido → limpiar sesión y redirigir al login
    localStorage.removeItem('ed_token');
    localStorage.removeItem('ed_usuario');
    window.location.href = '/';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}));
    throw new Error((cuerpo as { mensaje?: string }).mensaje ?? `Error ${res.status}`);
  }
  const json = await res.json();
  // El backend puede devolver { datos: ... } o { data: ... } según el endpoint
  return (json.datos ?? json.data ?? json) as T;
}

/**
 * Función auxiliar para llamadas POST autenticadas.
 */
async function post<T>(ruta: string, cuerpo: unknown): Promise<T> {
  const res = await fetch(`${URL_BASE}${ruta}`, {
    method: 'POST',
    headers: cabecerasAuth(),
    body: JSON.stringify(cuerpo),
  });
  if (res.status === 401) {
    localStorage.removeItem('ed_token');
    localStorage.removeItem('ed_usuario');
    window.location.href = '/';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { mensaje?: string }).mensaje ?? `Error ${res.status}`);
  }
  const json = await res.json();
  return (json.datos ?? json.data ?? json) as T;
}

/**
 * Función auxiliar para llamadas PATCH autenticadas.
 */
async function patch<T>(ruta: string, cuerpo: unknown): Promise<T> {
  const res = await fetch(`${URL_BASE}${ruta}`, {
    method: 'PATCH',
    headers: cabecerasAuth(),
    body: JSON.stringify(cuerpo),
  });
  if (res.status === 401) {
    localStorage.removeItem('ed_token');
    localStorage.removeItem('ed_usuario');
    window.location.href = '/';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { mensaje?: string }).mensaje ?? `Error ${res.status}`);
  }
  const json = await res.json();
  return (json.datos ?? json.data ?? json) as T;
}

/**
 * Función auxiliar para llamadas PUT autenticadas.
 */
async function put<T>(ruta: string, cuerpo: unknown): Promise<T> {
  const res = await fetch(`${URL_BASE}${ruta}`, {
    method: 'PUT',
    headers: cabecerasAuth(),
    body: JSON.stringify(cuerpo),
  });
  if (res.status === 401) {
    localStorage.removeItem('ed_token');
    localStorage.removeItem('ed_usuario');
    window.location.href = '/';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { mensaje?: string }).mensaje ?? `Error ${res.status}`);
  }
  const json = await res.json();
  return (json.datos ?? json.data ?? json) as T;
}

/**
 * Función auxiliar para llamadas DELETE autenticadas.
 */
async function delete_<T>(ruta: string): Promise<T> {
  const res = await fetch(`${URL_BASE}${ruta}`, {
    method: 'DELETE',
    headers: cabecerasAuth(),
  });
  if (res.status === 401) {
    localStorage.removeItem('ed_token');
    localStorage.removeItem('ed_usuario');
    window.location.href = '/';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { mensaje?: string }).mensaje ?? `Error ${res.status}`);
  }
  const json = await res.json();
  return (json.datos ?? json.data ?? json) as T;
}

// ══════════════════════════════════════════════════════════════════
// DASHBOARD — GET /api/dashboard
// ══════════════════════════════════════════════════════════════════

export interface DatosDashboard {
  metricas: { ninosPresentes: number; pendientesRetiro: number; personalActivo: number };
  cumpleaneros: Array<{ idPersona: number; nombres: string; apellidos: string; diaCumpleanos: number; grupo: string }>;
  alertas: Array<{ idPersona: number; nombreNino: string; condicion: string; presente: boolean }>;
  movimientos: Array<{ idAsistencia: number; tipo: 'checkin' | 'checkout'; nombreNino: string; grupo: string; hora: string; procesadoPor: string }>;
}

export const obtenerDashboard = () => get<DatosDashboard>('/dashboard');

// ══════════════════════════════════════════════════════════════════
// NIÑOS — GET /api/ninos  |  GET /api/ninos/:id
// ══════════════════════════════════════════════════════════════════

export interface NinoApi {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  observacionesGenerales?: string;
  activo?: boolean;
  grupo: { idGrupo: number; tipo?: 'Entrada' | 'Salida'; nombre: string; edadMinima: number; edadMaxima: number };
  alertasMedicas: Array<{ idInfo: number; tipo: string; descripcion: string; severidad: string; instrucciones?: string }>;
}

export const listarNinos     = ()          => get<NinoApi[]>('/ninos');
export const obtenerNinoPorId = (id: number) => get<NinoApi>(`/ninos/${id}`).then((r) => {
  // Transformar campos planos a estructura de grupo
  return {
    ...r,
    nombreCompleto: (r as unknown as { nombres: string; apellidos: string }).nombres + ' ' + (r as unknown as { apellidos: string }).apellidos,
    grupo: {
      idGrupo: (r as unknown as { idGrupo?: number }).idGrupo ?? 0,
      nombre: (r as unknown as { nombreGrupo?: string }).nombreGrupo ?? '',
      edadMinima: (r as unknown as { edadMinima?: number }).edadMinima ?? 0,
      edadMaxima: (r as unknown as { edadMaxima?: number }).edadMaxima ?? 0,
    },
    alertasMedicas: (r as unknown as { alertasMedicas?: Array<unknown> }).alertasMedicas ?? [],
  } as NinoApi;
});

export interface NinoCompletoApi {
  idPersona:              number;
  nombres:                string;
  apellidos:              string;
  fechaNacimiento:        string;
  observacionesGenerales: string | null;
  idGrupo:                number | null;
  nombreGrupo:            string | null;
  motivoExcepcion:        string | null;
  padres:                 Array<{ idPersona: number; nombres: string; apellidos: string; telefono: string }>;
  sexo?:                  'Masculino' | 'Femenino' | null;
  activo?:                boolean;
  version?:               number;
}

export const obtenerNinoCompleto = (id: number) => get<NinoCompletoApi>(`/ninos/${id}/completo`);

export interface NinoRawApi {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  observacionesGenerales?: string;
  idGrupo?: number;
  nombreGrupo?: string;
  edadMinima?: number;
  edadMaxima?: number;
  activo?: boolean;
}

export const listarNinosRaw = () => get<NinoRawApi[]>('/ninos').then((rows) =>
  rows.map((r) => ({
    idPersona: r.idPersona,
    nombres: r.nombres,
    apellidos: r.apellidos,
    nombreCompleto: r.nombreCompleto,
    fechaNacimiento: r.fechaNacimiento,
    observacionesGenerales: r.observacionesGenerales,
    activo: r.activo ?? true,
    grupo: {
      idGrupo: r.idGrupo ?? 0,
      nombre: r.nombreGrupo ?? '',
      edadMinima: r.edadMinima ?? 0,
      edadMaxima: r.edadMaxima ?? 0,
    },
    alertasMedicas: [] as Array<{ idInfo: number; tipo: string; descripcion: string; severidad: string; instrucciones?: string }>,
  }))
);

export interface DatosPadreNuevo {
  nombres:   string;
  apellidos: string;
  telefono:  string;
}

export interface DatosNinoConPadres {
  nombres:                string;
  apellidos:              string;
  fechaNacimiento:        string;   // YYYY-MM-DD
  observacionesGenerales?: string;
  idGrupo?:              number;
  motivoExcepcion?:      string;
  padres:                DatosPadreNuevo[];
  sexo?:                 'Masculino' | 'Femenino' | null;
  activo?:               boolean;
  version?:              number;
}

export interface RespuestaNinoConPadres {
  idPersona:              number;
  nombres:                string;
  apellidos:              string;
  fechaNacimiento:        string;
  observacionesGenerales: string | null;
  padresRegistrados:      number;
}

/** POST /api/ninos/con-padres — Registra niño + responsables en una sola transacción (MVP-01 + MVP-03) */
export const registrarNinoConPadres = (datos: DatosNinoConPadres) =>
  post<RespuestaNinoConPadres>('/ninos/con-padres', datos);

/** PUT /api/ninos/:id — Actualiza los datos de un niño existente */
export const actualizarNino = (id: number, datos: Omit<DatosNinoConPadres, 'padres'>) =>
  put<RespuestaNinoConPadres>(`/ninos/${id}`, datos);

/** DELETE /api/ninos/:id — Elimina un niño y todos sus datos relacionados */
export const eliminarNino = (id: number) =>
  delete_<{ mensaje: string }>(`/ninos/${id}`);

/** GET /api/ninos/ingreso — Lista niños con adulto responsable y hora de creación */
export interface NinoIngresoApi {
  idNino:            number;
  nombreNino:        string;
  adultoResponsable: string | null;
  creadoEn:          string;
  fechaNacimiento?:  string;
  activo?:           boolean;
}

export const listarNinosIngreso = () => get<NinoIngresoApi[]>('/ninos/ingreso');

// ══════════════════════════════════════════════════════════════════
// ASISTENCIA NIÑOS — GET /api/asistencia  |  POST /api/asistencia/checkin
//                    PATCH /api/asistencia/:id/checkout
// Nota: estas rutas se añadirán al backend cuando se implementen.
//       Por ahora los endpoints están marcados con TODO en el backend.
// ══════════════════════════════════════════════════════════════════

export interface RegistroAsistenciaApi {
  idAsistencia: number;
  fecha: string;
  idTurno: number;
  nino: NinoApi;
  horaEntrada: string;
  horaSalida?: string;
  idFichaEntrada: number;
  codigoFichaEntrada: string;
  idFichaSalida?: number;
  codigoFichaSalida?: string;
  estado: 'Pendiente' | 'Completado';
  acompananteEnAula: boolean;
  ingresadoPor: string;
  retiradoPor?: string;
  notas?: string;
  esPrimeraVez: boolean;
}

export const listarAsistenciaDia = (fecha: string, idGrupo?: string, idTurno?: string) => {
  const params = new URLSearchParams({ fecha });
  if (idGrupo) params.set('grupo', idGrupo);
  if (idTurno) params.set('turno', idTurno);
  return get<RegistroAsistenciaApi[]>(`/asistencia?${params}`);
};

export interface DatosCheckInApi {
  idNino: number;
  idFichaEntrada: number;
  /** ID de la persona (padre/tutor) que entrega al niño */
  idIngresadoPor?: number;
  acompananteEnAula: boolean;
  idGrupo: number; tipo?: 'Entrada' | 'Salida';
  idTurno: number;
  /** Fecha del registro de asistencia (YYYY-MM-DD) */
  fecha?: string;
  motivoExcepcion?: string;
}

export const registrarCheckIn = (datos: DatosCheckInApi) =>
  post<RegistroAsistenciaApi>('/asistencia/checkin', datos);

/** idRetiradoPor = ID de Personas de quien retira al niño (validado por trigger) */
export const registrarCheckOut = (idAsistencia: number, idRetiradoPor: number, idFichaSalida?: number) =>
  patch<RegistroAsistenciaApi>(`/asistencia/${idAsistencia}/checkout`, { 
    idRetiradoPor,
    id_ficha_salida: idFichaSalida || null
  });

export const actualizarAsistencia = (id: number, datos: any) =>
  patch<any>(`/asistencia/${id}`, datos);

export const eliminarAsistencia = (id: number) =>
  delete_<{ exito: boolean }>(`/asistencia/${id}`);

// ══════════════════════════════════════════════════════════════════
// FICHAS — GET /api/fichas?estado=Activa
// ═════════════════════════════════════════════════════════════════════

export interface FichaApi {
  idFicha: number;
  codigoFicha: string;
  estado: 'Activa' | 'Inactiva' | 'Extraviada';
  tipo?: 'Entrada' | 'Salida';
  idGrupo?: number;
  nombreGrupo?: string;
}

export const listarFichasActivas = () => get<FichaApi[]>('/fichas?estado=Activa');

export interface GrupoApi {
  idGrupo: number;
  tipo?: 'Entrada' | 'Salida';
  nombre: string;
  edadMinima: number;
  edadMaxima: number;
  activo?: boolean;
}

export const listarGrupos = () => get<GrupoApi[]>('/grupos');

// ══════════════════════════════════════════════════════════════════
// ASISTENCIA PERSONAL — GET /api/personal/asistencia-hoy
//                        POST /api/personal/asistencia
// ══════════════════════════════════════════════════════════════════

export interface PersonalAsistenciaApi {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  rol: string;
  nivelJerarquico: number;
  grupoAsignado?: string;
  fechaIngreso: string;
  estadoLlegada?: 'Temprano' | 'Tarde' | 'Justificado' | 'Injustificado';
  horaLlegada?: string;
}

export const listarPersonalHoy = () => get<PersonalAsistenciaApi[]>('/personal/asistencia-hoy');

export const registrarAsistenciaPersonal = (idPersona: number, estadoLlegada: string, idTurno: number) =>
  post<PersonalAsistenciaApi>('/personal/asistencia', { idPersona, estadoLlegada, idTurno });

// ══════════════════════════════════════════════════════════════════
// CONTACTOS / DIRECTORIO — GET /api/contactos  |  GET /api/ninos/:id/contactos
// ══════════════════════════════════════════════════════════════════

export interface ContactoGlobalApi {
  idPersona: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  tipo: 'padre' | 'temporal';
  activoHoy: boolean;
  ninos: Array<{ idPersona: number; nombreCompleto: string; grupo: string }>;
}

export interface FichaContactoApi {
  nino: NinoApi;
  tutores: Array<{
    idPersona: number;
    nombres: string;
    apellidos: string;
    telefono: string;
    tieneWhatsapp?: boolean;
    parentesco: string;
    tipo: string;
    activo: boolean;
  }>;
}

export const listarContactos = () => get<ContactoGlobalApi[]>('/contactos');
export const obtenerFichaContacto = (idNino: number) =>
  get<FichaContactoApi>(`/ninos/${idNino}/contactos`);

// ══════════════════════════════════════════════════════════════════
// REGISTRO DE PERSONAL — POST /api/personal
// ══════════════════════════════════════════════════════════════════

export interface DatosPersonalNuevo {
  nombres: string;
  apellidos: string;
  /** Nombre de usuario para login (VARCHAR 30, no email) */
  usuario: string;
  contrasena: string;
  rol: string;
  /** Fecha en formato YYYY-MM-DD → Fecha_Ingreso_Servicio */
  fechaIngreso: string;
  idPersonaExistente?: number;
  idAutorizadoPor?: number;
  /** Grupo asignado (requerido si el rol es Maestro) */
  idGrupoAsignado?: number;
  idTurnos: number[];
  version?: number;
}

export const registrarPersonal = (datos: DatosPersonalNuevo) =>
  post<{ idPersona: number }>('/personal', datos);

export const actualizarPersonal = (id: number, datos: Partial<DatosPersonalNuevo & { idRol?: number }>) =>
  put<{ idPersona: number }>(`/personal/${id}`, datos);

export const listarCoordinadores = () =>
  get<Array<{ id: number; nombre: string; rol: string }>>('/personal/coordinadores');

export interface PersonalCompletoApi {
  idPersona:         number;
  nombres:           string;
  apellidos:         string;
  usuario:           string;
  rol:               string;
  fechaIngreso:      string;
  idGrupoAsignado:   number | null;
  grupoAsignado:     string | null;
  idTurnos?:         number[];
  version?:          number;
}

export const obtenerPersonalCompleto = (id: number) =>
  get<PersonalCompletoApi>(`/personal/${id}/completo`);

// ══════════════════════════════════════════════════════════════════
// DASHBOARD — Métricas y gráficas (Spec §9.1)
// ══════════════════════════════════════════════════════════════════

export interface MetricasDashboard {
  ninosPresentes: number;
  pendientesRetiro: number;
  personalActivo: number;
  solicitudesPendientes: number;
}

export const obtenerMetricasDashboard = () => get<MetricasDashboard>('/dashboard/metricas');

export interface AsistenciaMensual {
  mes: string;
  turno: string;
  ninosDistintos: number;
  totalRegistros: number;
}

export const obtenerAsistenciaMensual = () => get<AsistenciaMensual[]>('/dashboard/asistencia-mensual');

export interface DistribucionGrupos {
  grupo: string;
  cantidad: number;
}

export const obtenerDistribucionGrupos = () => get<DistribucionGrupos[]>('/dashboard/distribucion-grupos');

export interface AsistenciaPorRol {
  rol: string;
  temprano: number;
  tarde: number;
  justificado: number;
  injustificado: number;
}

export const obtenerAsistenciaPorRol = () => get<AsistenciaPorRol[]>('/dashboard/asistencia-por-rol');

export interface ComparativaMensual {
  mes: string;
  totalNinos: number;
  mesAnterior: number | null;
  diferencia: number | null;
}

export const obtenerComparativaMensual = () => get<ComparativaMensual[]>('/dashboard/comparativa-mensual');

export interface SolicitudesPendientes {
  idSolicitud: number;
  candidato: string;
  telefono: string;
  rolSolicitado: string;
  gestionadoPor: string;
  fechaSolicitud: string;
  estadoLiderazgo: string | null;
  tiempoIglesiaMeses: number | null;
  reqObligatoriosCumplidos: number;
  reqObligatoriosTotal: number;
  notasStaff: string | null;
}

export const obtenerSolicitudesPendientes = () => get<SolicitudesPendientes[]>('/dashboard/solicitudes-pendientes');

export interface CumpleaneroDashboard {
  idPersona: number;
  nombres: string;
  apellidos: string;
  diaCumpleanos: number;
  tipo: 'Niño' | 'Personal';
  grupo?: string | null;
  turno?: string | null;
  rol?: string | null;
}

export const obtenerCumpleanerosMes = () => get<CumpleaneroDashboard[]>('/dashboard/cumpleaneros');

export interface AlertaMedicaDashboard {
  idPersona: number;
  nino: string;
  tipo: string;
  descripcion: string;
  severidad: string;
  instrucciones: string | null;
}

export const obtenerAlertasMedicas = () => get<AlertaMedicaDashboard[]>('/dashboard/alertas-medicas');

// ══════════════════════════════════════════════════════════════════
// FICHAS — CRUD + disponibilidad (Spec §9.7)
// ═════════════════════════════════════════════════════════════════════

export const listarFichas = (estado?: string) => {
  const params = estado ? `?estado=${estado}` : '';
  return get<FichaApi[]>(`/fichas${params}`);
};

export const crearFicha = (datos: { codigoFicha: string; idGrupo: number; tipo?: 'Entrada' | 'Salida' }) =>
  post<FichaApi>('/fichas', datos);

export const actualizarFicha = (id: number, datos: Partial<FichaApi>) =>
  patch<FichaApi>(`/fichas/${id}`, datos);

export interface DisponibilidadFichas {
  idGrupo: number; tipo?: 'Entrada' | 'Salida';
  nombreGrupo: string;
  total: number;
  activas: number;
  enUso: number;
  disponibles: number;
}

export const obtenerDisponibilidadFichas = () => get<DisponibilidadFichas[]>('/fichas/disponibilidad');

// ══════════════════════════════════════════════════════════════════
// REQUISITOS — CRUD catálogo (Spec §9.8)
// ══════════════════════════════════════════════════════════════════

export interface RequisitoApi {
  idRequisito: number;
  nombre: string;
  descripcion: string | null;
  tipo: 'Formacion' | 'Estado_Ministerial' | 'Otro';
  idRolRequerido: number | null;
  nombreRolRequerido?: string;
  obligatorio: boolean;
  activo: boolean;
}

export const listarRequisitos = () => get<RequisitoApi[]>('/requisitos');
export const crearRequisito = (datos: Omit<RequisitoApi, 'idRequisito'>) =>
  post<RequisitoApi>('/requisitos', datos);
export const actualizarRequisito = (id: number, datos: Partial<RequisitoApi>) =>
  patch<RequisitoApi>(`/requisitos/${id}`, datos);

// ══════════════════════════════════════════════════════════════════
// ROLES — CRUD (Spec §9.9)
// ══════════════════════════════════════════════════════════════════

export interface RolApi {
  idRol: number;
  nombreRol: string;
  nivelJerarquico: number;
  activo: boolean;
}

export const listarRoles = () => get<RolApi[]>('/roles');
export const crearRol = (datos: Omit<RolApi, 'idRol'>) =>
  post<RolApi>('/roles', datos);
export const actualizarRol = (id: number, datos: Partial<RolApi>) =>
  patch<RolApi>(`/roles/${id}`, datos);

// ══════════════════════════════════════════════════════════════════
// SOLICITUDES — CRUD + flujo (Spec §9.10)
// ══════════════════════════════════════════════════════════════════

export interface SolicitudApi {
  idSolicitud: number;
  idPersona: number;
  candidato: string;
  telefono: string | null;
  idRolSolicitado: number;
  rolSolicitado: string;
  idGestionadoPor: number;
  gestionadoPor: string;
  idResueltoPor: number | null;
  resueltoPor: string | null;
  estado: 'Borrador' | 'Pendiente' | 'Aprobado' | 'Rechazado';
  fechaSolicitud: string;
  fechaResolucion: string | null;
  notasStaff: string | null;
  notasCoordinador: string | null;
  estadoCivil: string | null;
  condicionCivil: string | null;
  nombreConyuge: string | null;
  tieneHijos: boolean;
  numeroHijos: number | null;
  direccion: string | null;
  idRed: number | null;
  red: string | null;
  estadoLiderazgo: string | null;
  idMentorPropuesto: number | null;
  mentorPropuesto: string | null;
  circuloAmistad: string | null;
  tiempoIglesiaMeses: number | null;
  ministerioAdicional: string | null;
  reqCumplidos: number;
  reqTotal: number;

  fechaNacimiento: string | null;
  // Nuevos campos v5.1
  sexoCandidato: 'Masculino' | 'Femenino' | null;
  cedulaCandidato: string | null;
  ocupacionCandidato: string | null;
  centroLaboralCandidato: string | null;
  nivelAcademicoCandidato: 'Primaria' | 'Secundaria' | 'Tecnico' | 'Universitario' | 'Postgrado' | 'Ninguno' | null;
  dirCiudad: string | null;
  dirMunicipio: string | null;
  dirDistrito: string | null;
  dirBarrio: string | null;
  dirExacta: string | null;
  telCasa: string | null;
  telOficina: string | null;
  telClaro: string | null;
  telMovistar: string | null;
  conyugeOcupacion: string | null;
  conyugeCentroLaboral: string | null;
  bautizadoAgua: boolean;
  fechaBautismo: string | null;
  fechaBautismoPrecision: 'Exacta' | 'Mes' | 'Anio' | 'Aproximada' | null;
  circuloAmistadDesde: string | null;
  circuloAmistadPrecision: 'Exacta' | 'Mes' | 'Anio' | 'Aproximada' | null;
  clasesBiblicasNinos: boolean;
  clasesBiblicasDetalle: string | null;
  capacitacionEnsenanza: boolean;
  capacitacionDetalle: string | null;
  observacionesEspiritualesSol: string | null;
  // Bloque D — líder / mentor (texto libre)
  liderNombres: string | null;
  liderApellidos: string | null;
  liderTelefono: string | null;
  // Historial en otras iglesias
  asistioOtraIglesia: boolean;
  nombreOtraIglesia: string | null;
  denominacionOtraIglesia?: 'Pentecostal' | 'Evangelico' | 'Católico' | 'Testigo de Jehová' | 'Otro' | null;
}

export const listarSolicitudes = (estado?: string) => {
  const params = estado ? `?estado=${estado}` : '';
  return get<SolicitudApi[]>(`/solicitudes${params}`);
};

export interface DatosSolicitudNueva {
  idPersona: number;
  idRolSolicitado: number;
  notasStaff?: string;
  estadoCivil?: string;
  condicionCivil?: string;
  nombreConyuge?: string;
  tieneHijos?: boolean;
  numeroHijos?: number;
  direccion?: string;
  idRed?: number;
  estadoLiderazgo?: string;
  idMentorPropuesto?: number;
  circuloAmistad?: string;
  tiempoIglesiaMeses?: number;
  ministerioAdicional?: string;
  requisitos?: Array<{ idRequisito: number; cumplido: boolean; fechaCumplido?: string; notas?: string }>;

  // Nuevos campos v5.1
  sexoCandidato?: 'Masculino' | 'Femenino' | null;
  cedulaCandidato?: string | null;
  ocupacionCandidato?: string | null;
  centroLaboralCandidato?: string | null;
  nivelAcademicoCandidato?: 'Primaria' | 'Secundaria' | 'Tecnico' | 'Universitario' | 'Postgrado' | 'Ninguno' | null;
  dirCiudad?: string | null;
  dirMunicipio?: string | null;
  dirDistrito?: string | null;
  dirBarrio?: string | null;
  dirExacta?: string | null;
  telCasa?: string | null;
  telOficina?: string | null;
  telClaro?: string | null;
  telMovistar?: string | null;
  conyugeOcupacion?: string | null;
  conyugeCentroLaboral?: string | null;
  bautizadoAgua?: boolean;
  fechaBautismo?: string | null;
  fechaBautismoPrecision?: 'Exacta' | 'Mes' | 'Anio' | 'Aproximada' | null;
  circuloAmistadDesde?: string | null;
  circuloAmistadPrecision?: 'Exacta' | 'Mes' | 'Anio' | 'Aproximada' | null;
  clasesBiblicasNinos?: boolean;
  clasesBiblicasDetalle?: string | null;
  capacitacionEnsenanza?: boolean;
  capacitacionDetalle?: string | null;
  observacionesEspiritualesSol?: string | null;
  // Bloque D — líder / mentor (texto libre)
  liderNombres?: string | null;
  liderApellidos?: string | null;
  liderTelefono?: string | null;
  // Historial en otras iglesias
  asistioOtraIglesia?: boolean;
  nombreOtraIglesia?: string | null;
  denominacionOtraIglesia?: 'Pentecostal' | 'Evangelico' | 'Católico' | 'Testigo de Jehová' | 'Otro' | null;
}

export const crearSolicitud = (datos: DatosSolicitudNueva) =>
  post<SolicitudApi>('/solicitudes', datos);

export const actualizarSolicitud = (id: number, datos: Partial<DatosSolicitudNueva>) =>
  patch<SolicitudApi>(`/solicitudes/${id}`, datos);

export const enviarSolicitud = (id: number) =>
  patch<SolicitudApi>(`/solicitudes/${id}/enviar`, {});

export const aprobarSolicitud = (id: number, notas?: string) =>
  patch<SolicitudApi>(`/solicitudes/${id}/aprobar`, { notas });

export const eliminarSolicitud = (id: number) =>
  delete_<SolicitudApi>(`/solicitudes/${id}`);

export const rechazarSolicitud = (id: number, notas: string) =>
  patch<SolicitudApi>(`/solicitudes/${id}/rechazar`, { notas });

export interface RequisitoSolicitudApi {
  idRequisito: number;
  nombre: string;
  tipo: string;
  obligatorio: boolean;
  cumplido: boolean;
  fechaCumplido: string | null;
  notas: string | null;
}

export const obtenerRequisitosSolicitud = (idSolicitud: number) =>
  get<RequisitoSolicitudApi[]>(`/solicitudes/${idSolicitud}/requisitos`);

export const actualizarRequisitoSolicitud = (idSolicitud: number, idRequisito: number, datos: { cumplido: boolean; fechaCumplido?: string; notas?: string }) =>
  patch<RequisitoSolicitudApi>(`/solicitudes/${idSolicitud}/requisitos/${idRequisito}`, datos);

// ══════════════════════════════════════════════════════════════════
// PERSONAL PERFIL — Vista consolidada (Spec §9.11)
// ══════════════════════════════════════════════════════════════════

export interface PerfilPersonalApi {
  idPersona: number;
  nombres: string;
  apellidos: string;
  sexo: string | null;
  cedula: string | null;
  fechaNacimiento: string | null;
  usuario: string;
  rol: string;
  nivelJerarquico: number;
  fechaIngreso: string;
  activo: boolean;
  estadoCivil: string | null;
  nombreConyuge: string | null;
  tieneHijos: boolean;
  numeroHijos: number | null;
  ocupacion: string | null;
  centroLaboral: string | null;
  nivelAcademico: string | null;
  bautizadoAgua: boolean;
  fechaBautismo: string | null;
  red: string | null;
  circuloAmistad: string | null;
  circuloAmistadDesde: string | null;
  tiempoIglesiaMeses: number | null;
  ministerioAdicional: string | null;
  clasesBiblicasNinos: boolean;
  capacitacionEnsenanza: boolean;
  observacionesEspirituales: string | null;
  idLider: number | null;
  nombreLider: string | null;
  telLider: string | null;
  telefonos: Array<{
    idTelefono: number;
    tipo: string;
    numero: string;
    tieneWhatsapp: boolean;
    esPrincipal: boolean;
  }>;
  direcciones: Array<{
    idDireccion: number;
    tipoDireccion: string;
    ciudadDepartamento: string;
    municipio: string;
    distrito: string;
    barrio: string;
    direccionExacta: string;
    esPrincipal: boolean;
  }>;
  grupos: Array<{ idGrupo: number; grupo: string }>;
  turnos: Array<{ idTurno: number; turno: string }>;
  requisitos: Array<{
    nombre: string;
    tipo: string;
    obligatorio: boolean;
    cumplido: boolean;
    fechaCumplido: string | null;
  }>;
  suspensionActiva: {
    idSuspension: number;
    fechaInicio: string;
    fechaFin: string | null;
    categoriaMotivo: string;
    motivo: string;
  } | null;
}

export const obtenerPerfilPersonal = (id: number) => get<PerfilPersonalApi>(`/personal/${id}/perfil-completo`);

// ══════════════════════════════════════════════════════════════════
// GESTIÓN DE USUARIOS — Lista completa y configuración de acceso
// ══════════════════════════════════════════════════════════════════

export interface UsuarioSistemaApi {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  usuario: string;
  activo: boolean;
  idRol: number;
  rol: string;
  nivelJerarquico: number;
  fechaIngreso: string;
  credencialesPendientes: boolean;
  turnos: Array<{ idTurno: number; turno: string }> | null;
  grupos: Array<{ idGrupo: number; grupo: string }> | null;
}

export const listarPersonalCompleto = () => get<UsuarioSistemaApi[]>('/personal/lista-completa');

export const configurarAccesoPersonal = (id: number, datos: {
  usuario: string;
  contrasena: string;
  idRol: number;
  idTurnos?: number[];
  idGrupoAsignado?: number | null;
}) => put<{ exito: boolean; mensaje: string }>(`/personal/${id}/configurar-acceso`, datos);

// ══════════════════════════════════════════════════════════════════
// HISTORIAL DE CAMBIOS — Auditoría de perfil
// ══════════════════════════════════════════════════════════════════

export interface CambioHistorialApi {
  tabla: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
  fechaCambio: string;
  cambiadoPor: string;
  notas: string | null;
}

export const obtenerHistorialCambios = (id: number) =>
  get<CambioHistorialApi[]>(`/personal/${id}/historial-cambios`);

// ══════════════════════════════════════════════════════════════════
// REPORTES — Generación y exportación (Spec §9.12)
// ══════════════════════════════════════════════════════════════════

export const exportarReporteCSV = (tipo: string, params?: Record<string, string>) => {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  window.open(`${URL_BASE}/reportes/${tipo}/csv${query}`, '_blank');
};

export const exportarReporteExcel = (tipo: string, params?: Record<string, string>) => {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  window.open(`${URL_BASE}/reportes/${tipo}/excel${query}`, '_blank');
};

export interface DatosNinoPorGrupoReporte {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  edad: number;
  nombreGrupo: string;
  idGrupo: number;
  familiarIngreso?: string;
  telefonoFamiliar?: string;
}

export const obtenerNinosPorGrupoDatos = (turno?: string, fecha?: string) => {
  const params = new URLSearchParams();
  if (turno) params.append('turno', turno);
  if (fecha) params.append('fecha', fecha);
  const query = params.toString() ? `?${params.toString()}` : '';
  return get<DatosNinoPorGrupoReporte[]>(`/reportes/ninos-por-grupo/datos${query}`);
};

export interface CumpleanosReporteApi {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  edad: number;
  mes: number;
  dia: number;
}

export const obtenerCumpleanosDatos = (mes: string) => {
  return get<CumpleanosReporteApi[]>(`/reportes/cumpleanos/datos?mes=${encodeURIComponent(mes)}`);
};

// ══════════════════════════════════════════════════════════════════
// TURNOS Y EVENTOS (Spec §9.13)
// ══════════════════════════════════════════════════════════════════

export interface TurnoApi {
  idTurno: number;
  nombre: string;
  diaSemana: number;
  horaInicio: string;
  activo: boolean;
}

export const listarTurnos = () => get<TurnoApi[]>('/turnos');

export interface EventoApi {
  idEvento: number;
  nombre: string;
  descripcion: string | null;
  fecha: string;
  idTurno: number | null;
  turno?: string | null;
  tipo: string;
  numeroSemana: number;
  activo: boolean;
}

export const listarEventos = (mes?: string) => {
  const params = mes ? `?mes=${mes}` : '';
  return get<EventoApi[]>(`/eventos${params}`);
};

export const crearEvento = (datos: Omit<EventoApi, 'idEvento' | 'numeroSemana'>) =>
  post<EventoApi>('/eventos', datos);

export const actualizarEvento = (id: number, datos: Partial<EventoApi>) =>
  patch<EventoApi>(`/eventos/${id}`, datos);

// ══════════════════════════════════════════════════════════════════
// REDES (Spec §9.14)
// ══════════════════════════════════════════════════════════════════

export interface RedApi {
  idRed: number;
  nombre: string;
  activo: boolean;
}

export const listarRedes = () => get<RedApi[]>('/redes');
export const crearRed = (datos: { nombre: string }) =>
  post<RedApi>('/redes', datos);
export const actualizarRed = (id: number, datos: Partial<RedApi>) =>
  patch<RedApi>(`/redes/${id}`, datos);

// ══════════════════════════════════════════════════════════════════
// TUTORES — Listar por niño y crear (Spec §4.1)
// ══════════════════════════════════════════════════════════════════

export interface TutorApi {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  telefono: string | null;
  tipoTutor: string;
}

export const listarTutoresPorNino = (idNino: number) =>
  get<TutorApi[]>(`/ninos/${idNino}/tutores`);

export const crearTutorYVincular = (datos: {
  idNino: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  tipoTutor?: string;
}) => post<TutorApi>('/ninos/tutores', datos);

export const vincularTutorExistente = (idTutor: number, idNino: number, parentesco?: string) =>
  post<void>('/ninos/tutores/vincular', { idTutor, idNino, parentesco });

export const actualizarTutor = (idTutor: number, datos: {
  nombres: string;
  apellidos: string;
  telefono: string | null;
  tipoTutor?: string;
}) => put<TutorApi>(`/ninos/tutores/${idTutor}`, datos);

// ══════════════════════════════════════════════════════════════════
// NUEVOS SERVICIOS v5.1 — LÍDERES, CÍRCULOS, SUSPENSIONES, EXPEDIENTES
// ══════════════════════════════════════════════════════════════════

// ── Líderes ────────────────────────────────────────────────────────
export interface LiderApi {
  idLider: number;
  idPersona: number;
  nombreCompleto: string;
  telefonoPrincipal?: string;
  activo: boolean;
}

export const listarLideresActivos = () => get<LiderApi[]>('/lideres');
export const crearLider = (datos: { nombres: string; apellidos: string; telefono?: string }) =>
  post<LiderApi>('/lideres', datos);
export const obtenerDetalleLider = (id: number) => get<any>(`/lideres/${id}`);
export const inactivarLider = (id: number) => patch<{ exito: boolean }>(`/lideres/${id}/inactivar`, {});

// ── Personas y Asignación de Roles Directa ─────────────────────────
export interface PersonaApi {
  idPersona: number;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  sexo: 'Masculino' | 'Femenino' | null;
  cedula: string | null;
  fechaNacimiento: string | null;
  esLider: boolean;
  esTutor: boolean;
  tipoTutor: string | null;
  esPersonal: boolean;
  rolSistema: string | null;
}

export const listarPersonas = () => get<PersonaApi[]>('/personas');
export const crearPersona = (datos: {
  nombres: string;
  apellidos: string;
  telefono?: string;
  sexo?: 'Masculino' | 'Femenino';
  cedula?: string;
  fechaNacimiento?: string;
}) => post<{ idPersona: number } & any>('/personas', datos);

export const actualizarPersona = (
  id: number,
  datos: {
    nombres: string;
    apellidos: string;
    telefono?: string;
    sexo?: 'Masculino' | 'Femenino';
    cedula?: string;
    fechaNacimiento?: string;
  }
) => put<any>(`/personas/${id}`, datos);

export const asignarRolesPersona = (
  id: number,
  datos: {
    esLider: boolean;
    esTutor: boolean;
    tipoTutor?: string;
  }
) => patch<{ mensaje: string }>(`/personas/${id}/roles`, datos);

// ── Círculos de Amistad ───────────────────────────────────────────
export interface CirculoApi {
  idCirculo: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export const listarCirculos = () => get<CirculoApi[]>('/circulos');
export const crearCirculo = (datos: { nombre: string; descripcion?: string }) =>
  post<CirculoApi>('/circulos', datos);

// ── Múltiples Teléfonos y Direcciones ─────────────────────────────
export interface TelefonoPersonaApi {
  idTelefono: number;
  tipo: string;
  numero: string;
  tieneWhatsapp: boolean;
  esPrincipal: boolean;
}

export interface DireccionPersonaApi {
  idDireccion: number;
  tipoDireccion: string;
  ciudadDepartamento: string;
  municipio: string;
  distrito: string;
  barrio: string;
  direccionExacta: string;
  esPrincipal: boolean;
}

export const listarTelefonosPersona = (idPersona: number) =>
  get<TelefonoPersonaApi[]>(`/personas/${idPersona}/telefonos`);

export const agregarTelefonoPersona = (idPersona: number, datos: Omit<TelefonoPersonaApi, 'idTelefono'>) =>
  post<TelefonoPersonaApi>(`/personas/${idPersona}/telefonos`, datos);

export const eliminarTelefonoPersona = (idPersona: number, idTelefono: number) =>
  delete_<{ exito: boolean }>(`/personas/${idPersona}/telefonos/${idTelefono}`);

export const listarDireccionesPersona = (idPersona: number) =>
  get<DireccionPersonaApi[]>(`/personas/${idPersona}/direcciones`);

export const agregarDireccionPersona = (idPersona: number, datos: Omit<DireccionPersonaApi, 'idDireccion'>) =>
  post<DireccionPersonaApi>(`/personas/${idPersona}/direcciones`, datos);

export const eliminarDireccionPersona = (idPersona: number, idDireccion: number) =>
  delete_<{ exito: boolean }>(`/personas/${idPersona}/direcciones/${idDireccion}`);

// ── Suspensiones ──────────────────────────────────────────────────
export interface SuspensionApi {
  idSuspension: number;
  idPersonal: number;
  fechaInicio: string;
  fechaFin: string | null;
  categoriaMotivo: string;
  motivo: string;
  idRegistradoPor: number;
  registradoPor?: string;
  activo: boolean;
}

export const listarSuspensiones = (idPersonal: number) =>
  get<SuspensionApi[]>(`/personal/${idPersonal}/suspensiones`);

export const suspenderPersonal = (idPersonal: number, datos: { fechaInicio: string; fechaFin?: string | null; categoriaMotivo: string; motivo: string }) =>
  post<SuspensionApi>(`/personal/${idPersonal}/suspender`, datos);

export const levantarSuspension = (idPersonal: number, idSuspension: number) =>
  patch<SuspensionApi>(`/personal/${idPersonal}/suspensiones/${idSuspension}/levantar`, {});

export const listarPersonalDisponible = () => get<any[]>('/personal/disponible');

// ── Expedientes de Niños ──────────────────────────────────────────
export interface ExpedienteNinoApi {
  idExpediente: number;
  idNino: number;
  fecha: string;
  idTurno: number | null;
  turno?: string | null;
  idEvento: number | null;
  evento?: string | null;
  tipo: string;
  descripcion: string;
  idReportadoPor: number;
  reportadoPor?: string;
  resuelto: boolean;
  notasResolucion: string | null;
  creadoEn?: string;
}

export const listarExpedientesNino = (idNino: number) =>
  get<ExpedienteNinoApi[]>(`/ninos/${idNino}/expedientes`);

export const crearExpedienteNino = (idNino: number, datos: { tipo: string; descripcion: string; idTurno?: number | null; idEvento?: number | null }) =>
  post<ExpedienteNinoApi>(`/ninos/${idNino}/expedientes`, datos);

export const resolverExpedienteNino = (idNino: number, idExpediente: number, notasResolucion: string) =>
  patch<ExpedienteNinoApi>(`/ninos/${idNino}/expedientes/${idExpediente}/resolver`, { notasResolucion });

// ── Dashboard Predictivo y Vistas v5.1 ────────────────────────────
export interface NinoGraduacionApi {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edad: number;
  mesCumpleanos: number;
  diaCumpleanos: number;
  grupoActual: string | null;
  fechaGraduacionEsteAnio: string;
  yaGraduoEsteAnio: boolean;
}

export interface NinoTransicionApi {
  idPersona: number;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edadEsteMes: number;
  grupoActual: string | null;
  grupoSugerido: string | null;
  estadoTransicion: 'Sin_Asignacion' | 'Fuera_De_Rango' | 'Debe_Transicionar' | 'En_Grupo_Correcto';
  fechaTransicion?: string;
}

export interface PersonalDisponibleApi {
  idPersona: number;
  nombreCompleto: string;
  rol: string;
  fechaIngresoServicio: string;
}

export const obtenerNinosGraduacion = () => get<NinoGraduacionApi[]>('/dashboard/ninos-graduacion');
export const obtenerNinosTransicion = () => get<NinoTransicionApi[]>('/dashboard/ninos-transicion');
export const obtenerPersonalDisponibleDashboard = () => get<PersonalDisponibleApi[]>('/dashboard/personal-disponible');

// ── Historial de Solicitud y Perfil Completo ──────────────────────
export interface HistorialEstadoSolicitudApi {
  idHistorial: number;
  idSolicitud: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  fechaCambio: string;
  idCambiadoPor: number;
  cambiadoPor?: string;
  notas: string | null;
}

export const obtenerHistorialSolicitud = (idSolicitud: number) =>
  get<HistorialEstadoSolicitudApi[]>(`/solicitudes/${idSolicitud}/historial`);

export const obtenerPerfilCompletoPersonal = (id: number) =>
  get<any>(`/personal/${id}/perfil-completo`);

