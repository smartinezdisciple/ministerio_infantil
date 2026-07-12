import {
  obtenerAsistenciaPorFecha,
  obtenerAlertasMedicas,
  validarCheckIn,
  insertarCheckIn,
  actualizarCheckOut,
  obtenerEstadoAsistencia,
  obtenerAsistenciaPorId,
  actualizarAsistenciaDB,
  eliminarAsistenciaDB,
  type AsistenciaRow,
  type ResultadoCheckIn,
} from '../repositories/asistenciaRepositorio.js';

const PG_UNIQUE_VIOLATION = '23505';

export const listarAsistencia = async (
  fecha?: string,
  idGrupo?: number,
  idTurno?: number
): Promise<AsistenciaRow[]> => {
  const ahora = new Date();
  const fechaHoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  const fechaFinal = fecha || fechaHoy;

  const rows = await obtenerAsistenciaPorFecha(fechaFinal, idGrupo, idTurno);

  if (rows.length === 0) return [];

  const idsPersonas = rows.map((r) => r.idPersona);
  const alertasRows = await obtenerAlertasMedicas(idsPersonas);

  const alertas: Record<number, object[]> = {};
  for (const a of alertasRows) {
    if (!alertas[a.idPersona]) alertas[a.idPersona] = [];
    alertas[a.idPersona].push(a);
  }

  return rows.map((r) => ({
    ...r,
    nino: {
      idPersona:            r.idPersona,
      nombres:              r.nombres,
      apellidos:            r.apellidos,
      nombreCompleto:       r.nombreCompleto,
      fechaNacimiento:      r.fechaNacimiento,
      observacionesGenerales: r.observacionesGenerales,
      grupo: { idGrupo: r.idGrupo, nombre: r.nombreGrupo, edadMinima: r.edadMinima, edadMaxima: r.edadMaxima },
      alertasMedicas:       alertas[r.idPersona] ?? [],
    },
  }));
};

export const realizarCheckIn = async (
  datos: {
    idNino: number;
    idFichaEntrada: number;
    idIngresadoPor?: number;
    acompananteEnAula?: boolean;
    idGrupo: number;
    idTurno: number;
    fecha?: string;
    motivoExcepcion?: string;
  },
  idRegistradoPor: number
): Promise<ResultadoCheckIn> => {
  const { idNino, idFichaEntrada, idIngresadoPor, acompananteEnAula, idGrupo, idTurno, fecha, motivoExcepcion } = datos;

  if (!idNino || !idFichaEntrada || !idGrupo || !idTurno) {
    throw new Error('Campos obligatorios: idNino, idFichaEntrada, idGrupo, idTurno.');
  }

  const fechaAsistencia = fecha || new Date().toISOString().split('T')[0];
  const hora = new Date().toISOString().slice(11, 19);

  const validacion = await validarCheckIn(fechaAsistencia, idTurno, idNino, idGrupo, idFichaEntrada);

  if (!validacion || validacion.ficha_no_activa) {
    throw new Error('La ficha seleccionada no está activa.');
  }
  if (validacion.ficha_no_entrada) {
    throw new Error('La ficha seleccionada debe ser de tipo Entrada.');
  }
  if (validacion.ficha_grupo_incorrecto) {
    throw new Error('La ficha seleccionada no corresponde al grupo de la asistencia.');
  }
  if (validacion.ya_presente) {
    throw new Error('El niño ya tiene un registro de asistencia para ese turno.');
  }

  try {
    const resultado = await insertarCheckIn(
      fechaAsistencia, idTurno, idNino, idGrupo, idFichaEntrada,
      idIngresadoPor ?? idRegistradoPor, hora, idRegistradoPor,
      acompananteEnAula ?? false, motivoExcepcion ?? null
    );
    return resultado;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === PG_UNIQUE_VIOLATION) {
      throw new Error('Esta ficha ya fue utilizada para ingresar a otro niño en este turno.');
    }
    throw err;
  }
};

export const realizarCheckOut = async (
  idAsistencia: number,
  idRetiradoPor: number,
  idCheckoutPor: number,
  idFichaSalida?: number | null
): Promise<{ idAsistencia: number; horaSalida: string; estado: string }> => {
  if (!idRetiradoPor) {
    throw new Error('Debe indicar idRetiradoPor (ID de quien retira).');
  }

  const hora = new Date().toISOString().slice(11, 19);

  const resultado = await actualizarCheckOut(hora, idRetiradoPor, idCheckoutPor, idFichaSalida ?? null, idAsistencia);

  if (!resultado) {
    const estadoActual = await obtenerEstadoAsistencia(idAsistencia);
    if (!estadoActual) {
      throw new Error('Registro de asistencia no encontrado.');
    }
    throw new Error('El niño ya fue retirado.');
  }

  return resultado;
};

export const modificarAsistencia = async (
  idAsistencia: number,
  datos: {
    idTurno?: number;
    idFichaEntrada?: number;
    idFichaSalida?: number;
    idIngresadoPor?: number;
    idRetiradoPor?: number;
    horaEntrada?: string;
    horaSalida?: string;
    acompananteEnAula?: boolean;
    estado?: string;
    notas?: string;
    idGrupoAsistido?: number;
    fecha?: string;
  },
  nivelJerarquico: number
): Promise<Record<string, unknown>> => {
  if (nivelJerarquico < 3) {
    throw new Error('No tiene permisos para modificar la asistencia.');
  }

  const actual = await obtenerAsistenciaPorId(idAsistencia);
  if (!actual) {
    throw new Error('Registro de asistencia no encontrado.');
  }

  const nuevoEstado = datos.estado ?? actual.estado as string;

  let nuevoIdFichaSalida = datos.idFichaSalida !== undefined ? datos.idFichaSalida : actual.id_ficha_salida as number | null;
  let nuevoIdRetiradoPor = datos.idRetiradoPor !== undefined ? datos.idRetiradoPor : actual.id_retirado_por as number | null;
  let nuevoHoraSalida = datos.horaSalida !== undefined ? datos.horaSalida : actual.hora_salida as string | null;

  if (nuevoEstado === 'Presente') {
    nuevoIdFichaSalida = null;
    nuevoIdRetiradoPor = null;
    nuevoHoraSalida = null;
  }

  const notas = datos.notas !== undefined ? (datos.notas === '' ? null : datos.notas) : (actual.notas as string | null);

  return actualizarAsistenciaDB(idAsistencia, {
    idTurno: datos.idTurno ?? actual.id_turno as number,
    idFichaEntrada: datos.idFichaEntrada ?? actual.id_ficha_entrada as number,
    idFichaSalida: nuevoIdFichaSalida,
    idIngresadoPor: datos.idIngresadoPor ?? actual.id_ingresado_por as number,
    idRetiradoPor: nuevoIdRetiradoPor,
    horaEntrada: datos.horaEntrada ?? actual.hora_entrada as string | null,
    horaSalida: nuevoHoraSalida,
    acompananteEnAula: datos.acompananteEnAula ?? actual.acompanante_en_aula as boolean,
    estado: nuevoEstado,
    notas,
    idGrupoAsistido: datos.idGrupoAsistido ?? actual.id_grupo_asistido as number,
    fecha: datos.fecha ?? actual.fecha as string,
  });
};

export const removerAsistencia = async (
  idAsistencia: number,
  nivelJerarquico: number
): Promise<void> => {
  if (nivelJerarquico < 3) {
    throw new Error('No tiene permisos para eliminar la asistencia.');
  }

  const eliminado = await eliminarAsistenciaDB(idAsistencia);
  if (!eliminado) {
    throw new Error('Registro de asistencia no encontrado.');
  }
};
