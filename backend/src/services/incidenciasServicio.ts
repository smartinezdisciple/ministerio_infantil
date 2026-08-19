// src/services/incidenciasServicio.ts — Lógica de negocio del módulo de incidencias
import type { PayloadJwt } from '../middlewares/autenticacion.js';
import {
  listarIncidencias,
  obtenerIncidenciaPorId,
  insertarIncidencia,
  eliminarIncidenciaDB,
  pertenecePersonalATurno,
  obtenerIdsTurnosDePersonal,
  type IncidenciaRow,
  type TipoIncidencia,
} from '../repositories/incidenciasRepositorio.js';

export interface DatosNuevaIncidencia {
  idTurno:    number;
  tipo:       TipoIncidencia;
  descripcion: string;
  fecha?:     string;
}

/** Nivel jerárquico a partir del cual se puede operar en cualquier turno. */
const NIVEL_COORDINADOR = 4;

/**
 * Lista incidencias visibles para el usuario.
 * - Staff (nivel 3): solo incidencias de sus turnos asignados (Personal_Turnos).
 * - Coordinador General (nivel 4+): todas las incidencias (filtro por turno opcional).
 */
export const listarIncidenciasVisibles = async (
  usuario: PayloadJwt,
  idTurno?: number
): Promise<IncidenciaRow[]> => {
  if (usuario.nivelJerarquico >= NIVEL_COORDINADOR) {
    return listarIncidencias({ idTurno });
  }

  const idsTurnosPermitidos = await obtenerIdsTurnosDePersonal(usuario.idPersona);
  return listarIncidencias({ idTurno, idsTurnosPermitidos });
};

/**
 * Crea una incidencia.
 * - Staff: solo puede reportar en un turno que le pertenezca.
 * - Coordinador General: cualquier turno.
 */
export const crearIncidencia = async (
  usuario: PayloadJwt,
  datos: DatosNuevaIncidencia
): Promise<IncidenciaRow> => {
  const descripcion = (datos.descripcion ?? '').trim();
  if (!descripcion) {
    throw new Error('Debe escribir una descripción de la incidencia.');
  }

  if (usuario.nivelJerarquico < NIVEL_COORDINADOR) {
    const pertenece = await pertenecePersonalATurno(usuario.idPersona, datos.idTurno);
    if (!pertenece) {
      throw new Error('No tiene permisos para reportar incidencias en este turno.');
    }
  }

  const fecha = datos.fecha ?? new Date().toISOString().slice(0, 10);
  return insertarIncidencia(datos.idTurno, usuario.idPersona, datos.tipo, descripcion, fecha);
};

/**
 * Elimina una incidencia.
 * - Coordinador General: cualquier incidencia.
 * - Staff: solo las que él mismo reportó.
 */
export const eliminarIncidencia = async (idIncidencia: number, usuario: PayloadJwt): Promise<void> => {
  const incidencia = await obtenerIncidenciaPorId(idIncidencia);
  if (!incidencia) {
    throw new Error('La incidencia no existe.');
  }

  if (usuario.nivelJerarquico < NIVEL_COORDINADOR && incidencia.idPersonal !== usuario.idPersona) {
    throw new Error('No tiene permisos para eliminar esta incidencia.');
  }

  const eliminada = await eliminarIncidenciaDB(idIncidencia);
  if (!eliminada) {
    throw new Error('La incidencia no existe.');
  }
};