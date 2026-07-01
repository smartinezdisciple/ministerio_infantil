// tipos.ts — Interfaces y tipos TypeScript del sistema Escuela Dominical
// Todo en español según CLAUDE.md §5
// Fuente de verdad: especificacion_escuela_dominical.md

/**
 * Estado de validación en tiempo real de la contraseña (CLAUDE.md §4.5)
 * Cada propiedad representa un requisito de complejidad.
 */
export interface ValidacionContrasena {
  longitudMinima: boolean;   // ≥ 8 caracteres
  tieneMayuscula: boolean;   // al menos 1 [A-Z]
  tieneNumero: boolean;      // al menos 1 [0-9]
  tieneEspecial: boolean;    // al menos 1 carácter especial
}

/**
 * Tipos de error que puede retornar el backend durante el login.
 */
export interface ErrorLogin {
  tipo: 'credencialesInvalidas' | 'rateLimitAlcanzado' | 'errorServidor';
  mensaje: string;
  intentosRestantes?: number;
  tiempoBloqueoSegundos?: number;
}

/**
 * Respuesta del endpoint POST /api/autenticacion/login
 */
export interface RespuestaLogin {
  exito: boolean;
  token?: string;
  usuario?: UsuarioAutenticado;
  error?: ErrorLogin;
}

/**
 * Props del componente CampoTexto reutilizable.
 */
export interface PropsCampoTexto {
  tipo: 'text' | 'password';
  etiqueta: string;
  icono: string;
  placeholder: string;
  valor: string;
  alCambiar: (valor: string) => void;
  errorMensaje?: string;
  deshabilitado?: boolean;
  enlaceAuxiliar?: { texto: string; alHacerClic: () => void };
  // Props exclusivas para tipo password
  mostrarContrasena?: boolean;
  alAlternarVisibilidad?: () => void;
}

/**
 * Props del componente BotonPrimario.
 */
export interface PropsBotonPrimario {
  texto: string;
  cargando: boolean;
  deshabilitado: boolean;
  alHacerClic: () => void;
}

/**
 * Props del componente IndicadorContrasena.
 */
export interface PropsIndicadorContrasena {
  validacion: ValidacionContrasena;
  visible: boolean; // solo se muestra cuando contrasena.length > 0
}

/**
 * Props del componente AlertaError.
 */
export interface PropsAlertaError {
  error: ErrorLogin | null;
  tiempoBloqueo: number; // segundos restantes para desbloqueo
}

// ═══════════════════════════════════════════════════════════════
// TIPOS DEL DOMINIO — Escuela Dominical (spec §2)
// Reflejan los CREATE TYPE y tablas del schema PostgreSQL.
// ═══════════════════════════════════════════════════════════════

/** Roles del sistema (CREATE TYPE rol_nombre) — Spec §2.4.4 */
export type RolNombre =
  | 'Colaborador'
  | 'Maestro'
  | 'Staff'
  | 'Coordinador General';

/** Nivel jerárquico numérico asociado al rol */
export type NivelJerarquico = 1 | 2 | 3 | 4;

/** Estado de llegada del personal (CREATE TYPE estado_llegada) — Spec §2.2 */
export type EstadoLlegada = 'Temprano' | 'Tarde' | 'Justificado' | 'Injustificado';

/** Tipo de registro médico (CREATE TYPE tipo_info_medica) — Spec §2.2 */
export type TipoInfoMedica = 'Alergia' | 'Medicamento' | 'Condicion';

/** Severidad médica (CREATE TYPE severidad_medica) — Spec §2.2 */
export type SeveridadMedica = 'Leve' | 'Moderada' | 'Alta';

/** Estado de asistencia del niño (derivado: Hora_Salida IS NULL) */
export type EstadoAsistencia = 'Presente' | 'Retirado' | 'Pendiente' | 'Completado';

/** Estado de asistencia en vista de grupo (Spec §5) — toggle Presente/Ausente */
export type EstadoAsistenciaGrupo = 'Presente' | 'Pendiente' | 'Ausente' | 'Justificado';

/** Estado de ficha física (CREATE TYPE ficha_estado) — Spec §2.5.3 */
export type EstadoFicha = 'Activa' | 'Inactiva' | 'Extraviada';

/**
 * Usuario autenticado almacenado en contexto tras login exitoso.
 * Se decodifica del JWT.
 */
export interface UsuarioAutenticado {
  idPersona: number;
  nombreCompleto: string;
  rol: RolNombre;
  nivelJerarquico: NivelJerarquico;
  /** IDs de grupos asignados (R-04: Maestros/Colaboradores solo ven su grupo) */
  gruposAsignados: number[];
  /** Si es true, el usuario solo puede visualizar datos sin modificarlos */
  soloLectura?: boolean;
}

/** Grupo de la escuela dominical — Spec §2.5.2 */
export interface Grupo {
  idGrupo: number;
  nombre: string;      // '4-6 años' | '7-9 años' | '10-12 años'
  edadMinima: number;
  edadMaxima: number;
}

/** Ficha física reutilizable — Spec §2.5.3, R-11 a R-14 */
export interface Ficha {
  idFicha: number;
  codigoFicha: string;
  estado: EstadoFicha;
  idGrupo: number;
  tipo?: 'Entrada' | 'Salida';
}

/** Registro médico individual de un niño — Spec §2.6 */
export interface InfoMedica {
  idInfo: number;
  tipo: TipoInfoMedica;
  descripcion: string;
  severidad: SeveridadMedica;
  instrucciones?: string;
}

/** Niño del sistema con datos de grupo y alertas médicas */
export interface Nino {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  observacionesGenerales?: string;
  grupo: Grupo;
  alertasMedicas: InfoMedica[];
  sexo?: 'Masculino' | 'Femenino' | null;
  totalAsistencias?: number;
}

/** Registro de asistencia de un niño — Spec §2.8 Asistencia_Ninos */
export interface RegistroAsistenciaNino {
  idAsistencia: number;
  fecha: string;
  idTurno: number;
  nino: Nino;
  horaEntrada: string;
  horaSalida?: string;
  idFichaEntrada: number;
  codigoFichaEntrada: string;
  idFichaSalida?: number;
  codigoFichaSalida?: string;
  estado: EstadoAsistencia;
  acompananteEnAula: boolean;
  ingresadoPor: string;
  retiradoPor?: string;
  notas?: string;
}

/** Personal del sistema para vista de asistencia — Spec §2.4.4 */
export interface PersonalAsistencia {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  rol: RolNombre;
  nivelJerarquico: NivelJerarquico;
  grupoAsignado?: string;
  fechaIngreso: string;
  estadoLlegada?: EstadoLlegada;
  horaLlegada?: string;
}

/** Cumpleañero del mes — Spec §9.1, MVP-05 */
export interface Cumpleanero {
  idPersona: number;
  nombres: string;
  apellidos: string;
  diaCumpleanos: number;
  tipo: 'Niño' | 'Personal';
  grupo?: string | null;
  turno?: string | null;
  rol?: string | null;
}

/** Movimiento para el timeline de actividad reciente — Spec §9.1 */
export interface MovimientoActividad {
  idAsistencia: number;
  tipo: 'checkin' | 'checkout';
  nombreNino: string;
  grupo: string;
  hora: string;
  procesadoPor: string;
}

/**
 * Contacto de un niño (padre, persona autorizada o tutor temporal).
 * Unifica Padres_Ninos, Lista_Autorizados y Tutores_Temporales — Spec §9.6
 */
export interface ContactoNino {
  idPersona?: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  parentesco: string;
  tipo: 'padre' | 'autorizado' | 'temporal';
  activo: boolean;
  fotoUrl?: string;
  fechaVigencia?: string;
}

/**
 * Contacto global para la lista general de padres/tutores — Spec §9.6 extendida.
 */
export interface ContactoGlobal {
  idPersona: number;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  tipo: 'padre' | 'temporal';
  activoHoy: boolean;
  ninos: Array<{
    idPersona: number;
    nombreCompleto: string;
    grupo: string;
  }>;
}

/** Datos del formulario de check-in — Flujo §4.1 */
export interface DatosCheckIn {
  idNino: number;
  idFichaEntrada: number;
  idTutorEntrega: number;
  acompananteEnAula: boolean;
  idGrupo: number;
  idTurno: number;
  fecha?: string;
  motivoExcepcion?: string;
}

/** Datos del formulario de registro de personal — Spec §9.5 */
export interface DatosRegistroPersonal {
  nombres: string;
  apellidos: string;
  /** Nombre de usuario para login — Personal_Sistema.Usuario (VARCHAR 30) */
  usuario: string;
  contrasena: string;
  rol: RolNombre;
  fechaIngreso: string;
  idPersonaExistente?: number;
  idAutorizadoPor?: number;
  /** Grupo asignado (requerido si el rol es Maestro) */
  idGrupoAsignado?: number;
  idTurnos: number[];
  version?: number;
}

// ── Nuevos Tipos v5.1 ──────────────────────────────────────────

export interface Lider {
  idLider: number;
  idPersona: number;
  nombreCompleto: string;
  telefonoPrincipal?: string;
  activo: boolean;
}

export interface Circulo {
  idCirculo: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export type CategoriaMotivoSuspension = 'Conducta' | 'Enfermedad' | 'Personal' | 'Disciplina' | 'Otro';

export interface Suspension {
  idSuspension: number;
  idPersonal: number;
  fechaInicio: string;
  fechaFin: string | null;
  categoriaMotivo: CategoriaMotivoSuspension;
  motivo: string;
  idRegistradoPor: number;
  registradoPor?: string;
  activo: boolean;
}

export type TipoExpedienteNino = 'Conducta' | 'Incidente' | 'Observacion' | 'Medico';

export interface ExpedienteNino {
  idExpediente: number;
  idNino: number;
  fecha: string;
  idTurno: number | null;
  turno?: string | null;
  idEvento: number | null;
  evento?: string | null;
  tipo: TipoExpedienteNino;
  descripcion: string;
  idReportadoPor: number;
  reportadoPor?: string;
  resuelto: boolean;
  notasResolucion: string | null;
  creadoEn?: string;
}

export interface TelefonoEstructurado {
  idTelefono: number;
  tipo: 'Casa' | 'Oficina' | 'Claro' | 'Movistar' | 'Otro';
  numero: string;
  tieneWhatsapp: boolean;
  esPrincipal: boolean;
}

export interface DireccionEstructurada {
  idDireccion: number;
  tipoDireccion: 'Residencial' | 'Laboral' | 'Referencia' | 'Otro';
  ciudadDepartamento: string;
  municipio: string;
  distrito: string;
  barrio: string;
  direccionExacta: string;
  esPrincipal: boolean;
}


/** Métricas del dashboard de asistencia de personal — Spec §9.4 */
export interface MetricasPersonal {
  totalMaestros: number;
  maestrosPresentes: number;
  totalColaboradores: number;
  colaboradoresPresentes: number;
  tiempoPromedioServicio: string;
}

