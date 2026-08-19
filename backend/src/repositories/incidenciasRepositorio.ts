// src/repositories/incidenciasRepositorio.ts — Consultas SQL del módulo de incidencias
import pool from '../config/db.js';

export type TipoIncidencia = 'Ninos' | 'Maestros' | 'Infraestructura' | 'Observaciones';

export interface IncidenciaRow {
  idIncidencia:  number;
  idTurno:       number;
  nombreTurno:   string;
  idPersonal:    number;
  nombrePersonal: string;
  tipo:          TipoIncidencia;
  descripcion:   string;
  fecha:         string;
  creadoEn:      string;
}

export interface FiltrosIncidencias {
  idTurno?:            number;
  idsTurnosPermitidos?: number[];
}

const SELECT_INCIDENCIA = `
  SELECT
    i.ID_Incidencia                  AS "idIncidencia",
    i.ID_Turno                       AS "idTurno",
    t.Nombre                         AS "nombreTurno",
    i.ID_Personal                    AS "idPersonal",
    CONCAT(p.Nombres, ' ', p.Apellidos) AS "nombrePersonal",
    i.Tipo                           AS "tipo",
    i.Descripcion                    AS "descripcion",
    i.Fecha                          AS "fecha",
    i.Creado_En                      AS "creadoEn"
  FROM Incidencias i
  JOIN Turnos t   ON t.ID_Turno      = i.ID_Turno
  JOIN Personas p ON p.ID_Persona    = i.ID_Personal
`;

/**
 * Lista incidencias aplicando filtros opcionales.
 * Si se pasa `idsTurnosPermitidos`, la consulta se restringe a esos turnos
 * (permite que un Staff solo vea los turnos de su perfil).
 */
export const listarIncidencias = async (filtros: FiltrosIncidencias = {}): Promise<IncidenciaRow[]> => {
  const params: (string | number | number[])[] = [];
  const condiciones: string[] = [];

  if (filtros.idTurno) {
    params.push(filtros.idTurno);
    condiciones.push(` i.ID_Turno = $${params.length}`);
  }
  if (filtros.idsTurnosPermitidos && filtros.idsTurnosPermitidos.length > 0) {
    params.push(filtros.idsTurnosPermitidos);
    condiciones.push(` i.ID_Turno = ANY($${params.length})`);
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
  const { rows } = await pool.query<IncidenciaRow>(
    `${SELECT_INCIDENCIA}
     ${where}
     ORDER BY i.Fecha DESC, i.ID_Incidencia DESC`,
    params
  );
  return rows;
};

/** Obtiene una incidencia por su ID (o null si no existe). */
export const obtenerIncidenciaPorId = async (idIncidencia: number): Promise<IncidenciaRow | null> => {
  const { rows } = await pool.query<IncidenciaRow>(
    `${SELECT_INCIDENCIA}
     WHERE i.ID_Incidencia = $1`,
    [idIncidencia]
  );
  return rows[0] ?? null;
};

/** Crea una incidencia y retorna el registro completo recién insertado. */
export const insertarIncidencia = async (
  idTurno: number,
  idPersonal: number,
  tipo: TipoIncidencia,
  descripcion: string,
  fecha: string
): Promise<IncidenciaRow> => {
  const { rows } = await pool.query<IncidenciaRow>(
    `INSERT INTO Incidencias (ID_Turno, ID_Personal, Tipo, Descripcion, Fecha)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ID_Incidencia`,
    [idTurno, idPersonal, tipo, descripcion, fecha]
  );
  const idIncidencia = rows[0].idIncidencia;
  const creada = await obtenerIncidenciaPorId(idIncidencia);
  if (!creada) {
    throw new Error('No se pudo recuperar la incidencia recién creada.');
  }
  return creada;
};

/** Elimina una incidencia. Retorna true si existía. */
export const eliminarIncidenciaDB = async (idIncidencia: number): Promise<boolean> => {
  const { rowCount } = await pool.query<IncidenciaRow>(
    `DELETE FROM Incidencias WHERE ID_Incidencia = $1`,
    [idIncidencia]
  );
  return (rowCount ?? 0) > 0;
};

/** Verifica si un personal está asignado al turno indicado (Personal_Turnos). */
export const pertenecePersonalATurno = async (idPersonal: number, idTurno: number): Promise<boolean> => {
  const { rows } = await pool.query(
    `SELECT 1 FROM Personal_Turnos WHERE ID_Personal = $1 AND ID_Turno = $2`,
    [idPersonal, idTurno]
  );
  return rows.length > 0;
};

/** Retorna los IDs de turnos asignados a un personal (Personal_Turnos). */
export const obtenerIdsTurnosDePersonal = async (idPersonal: number): Promise<number[]> => {
  const { rows } = await pool.query<{ idTurno: number }>(
    `SELECT ID_Turno AS "idTurno" FROM Personal_Turnos WHERE ID_Personal = $1`,
    [idPersonal]
  );
  return rows.map((r) => r.idTurno);
};