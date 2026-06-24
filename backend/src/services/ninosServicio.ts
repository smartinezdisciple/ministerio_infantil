// src/services/ninosServicio.ts — Lógica de negocio de niños (MVP-01, MVP-02)
import pool from '../config/db.js';
import { crearNino, crearNinoConPadres, obtenerNinos, obtenerNinoPorId, obtenerNinoCompleto, actualizarNino, verificarNinoDuplicado, eliminarNino, listarExpedientes, crearExpediente, resolverExpediente, type DatosPadre, type DatosInfoMedica } from '../repositories/ninosRepositorio.js';

/** Calcula la edad en años a partir de una fecha de nacimiento YYYY-MM-DD */
const calcularEdad = (fechaNacimiento: string): number => {
  const hoy  = new Date();
  const nac  = new Date(fechaNacimiento);
  let edad   = hoy.getFullYear() - nac.getFullYear();
  const mes  = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

/** Retorna el ID del grupo correspondiente a una edad (MVP-02) */
const obtenerGrupoPorEdad = async (edad: number): Promise<number | null> => {
  const resultado = await pool.query<{ id_grupo: number }>(
    `SELECT ID_Grupo AS id_grupo
     FROM Grupos
     WHERE Edad_Minima <= $1 AND Edad_Maxima >= $1 AND Activo = TRUE
     LIMIT 1`,
    [edad]
  );
  if (resultado.rows[0]?.id_grupo) {
    return resultado.rows[0].id_grupo;
  }
  // Si la edad excede todos los grupos (ej: >= 13 años), asignar al grupo activo de mayor edad
  const fallback = await pool.query<{ id_grupo: number }>(
    `SELECT ID_Grupo AS id_grupo
     FROM Grupos
     WHERE Activo = TRUE
     ORDER BY Edad_Maxima DESC
     LIMIT 1`
  );
  return fallback.rows[0]?.id_grupo ?? null;
};

export interface DatosCrearNino {
  nombres:                string;
  apellidos:              string;
  fechaNacimiento:        string;
  observacionesGenerales?: string;
  idGrupo?:              number;
  motivoExcepcion?:      string;
  sexo?:                 'Masculino' | 'Femenino' | null;
  activo?:               boolean;
  version?:              number;
}

/**
 * Registra un nuevo niño en el sistema (MVP-01 + MVP-02).
 * Valida que la asignación de grupo sea correcta por edad.
 * Si está fuera del rango, exige motivoExcepcion (Spec §3.2 — constraint chk_excepcion_motivo).
 */
export const registrarNino = async (datos: DatosCrearNino) => {
  const edad              = calcularEdad(datos.fechaNacimiento);
  const grupoNatural      = await obtenerGrupoPorEdad(edad);
  const idGrupo           = datos.idGrupo ?? grupoNatural;

  if (!idGrupo) {
    throw new Error(`No existe un grupo activo para un niño de ${edad} años.`);
  }

  const esExcepcion       = datos.idGrupo !== undefined && grupoNatural !== null && grupoNatural !== datos.idGrupo;

  // MVP-02: Excepciones requieren motivo documentado
  if (esExcepcion && !datos.motivoExcepcion) {
    throw new Error(
      `El niño (${edad} años) no pertenece al grupo seleccionado. ` +
      'Si es una excepción, proporcione el motivo en el campo "motivoExcepcion".'
    );
  }

  return crearNino({ ...datos, idGrupo, motivoExcepcion: esExcepcion ? datos.motivoExcepcion : undefined });
};

export interface DatosCrearNinoConPadres extends DatosCrearNino {
  padres?:     DatosPadre[];
  infoMedica?: DatosInfoMedica[];  // P1-04: info médica a persistir en la transacción
}

/**
 * Registra un nuevo niño junto con sus padres/responsables (MVP-01 + MVP-02 + MVP-03).
 * Valida la asignación de grupo por edad igual que registrarNino.
 * Valida que no exista un niño con el mismo nombre y fecha de nacimiento.
 */
export const registrarNinoConPadres = async (datos: DatosCrearNinoConPadres) => {
  const duplicado = await verificarNinoDuplicado(datos.nombres, datos.apellidos, datos.fechaNacimiento);
  if (duplicado) {
    throw new Error(
      `Ya existe un niño registrado con el nombre "${datos.nombres} ${datos.apellidos}" y fecha de nacimiento ${datos.fechaNacimiento}.`
    );
  }

  const edad         = calcularEdad(datos.fechaNacimiento);
  const grupoNatural = await obtenerGrupoPorEdad(edad);
  const idGrupo      = datos.idGrupo ?? grupoNatural;

  if (!idGrupo) {
    throw new Error(`No existe un grupo activo para un niño de ${edad} años.`);
  }

  const esExcepcion  = datos.idGrupo !== undefined && grupoNatural !== null && grupoNatural !== datos.idGrupo;

  if (esExcepcion && !datos.motivoExcepcion) {
    throw new Error(
      `El niño (${edad} años) no pertenece al grupo seleccionado. ` +
      'Si es una excepción, proporcione el motivo en el campo "motivoExcepcion".'
    );
  }

  return crearNinoConPadres({
    ...datos,
    idGrupo,
    motivoExcepcion: esExcepcion ? datos.motivoExcepcion : undefined,
    infoMedica:      datos.infoMedica,
  });
};

/** Actualiza los datos de un niño existente (MVP-01). Valida duplicado excluding el ID actual. */
export const actualizarNinoExistente = async (idPersona: number, datos: DatosCrearNino) => {
  const duplicado = await verificarNinoDuplicado(datos.nombres, datos.apellidos, datos.fechaNacimiento, idPersona);
  if (duplicado) {
    throw new Error(
      `Ya existe otro niño registrado con el nombre "${datos.nombres} ${datos.apellidos}" y fecha de nacimiento ${datos.fechaNacimiento}.`
    );
  }

  const edad         = calcularEdad(datos.fechaNacimiento);
  const grupoNatural = await obtenerGrupoPorEdad(edad);
  const idGrupo      = datos.idGrupo ?? grupoNatural;

  if (!idGrupo) {
    throw new Error(`No existe un grupo activo para un niño de ${edad} años.`);
  }

  const esExcepcion  = datos.idGrupo !== undefined && grupoNatural !== null && grupoNatural !== datos.idGrupo;

  if (esExcepcion && !datos.motivoExcepcion) {
    throw new Error(
      `El niño (${edad} años) no pertenece al grupo seleccionado. ` +
      'Si es una excepción, proporcione el motivo en el campo "motivoExcepcion".'
    );
  }

  return actualizarNino(idPersona, {
    ...datos,
    idGrupo,
    motivoExcepcion: esExcepcion ? datos.motivoExcepcion : undefined,
    activo:          datos.activo,
    version:         datos.version,
  });
};

export const listarNinos  = obtenerNinos;
export const buscarNinoPorId = obtenerNinoPorId;
export const buscarNinoCompleto = obtenerNinoCompleto;
export const actualizarDatosNino = actualizarNino;
export const verificarDuplicadoNino = verificarNinoDuplicado;
export const borrarNino = eliminarNino;
export const obtenerExpedientesNino = listarExpedientes;
export const registrarExpedienteNino = crearExpediente;
export const resolverExpedienteNinoExistente = resolverExpediente;
