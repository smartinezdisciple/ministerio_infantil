// src/repositories/ligaBiblicaRepositorio.ts — Acceso a datos del módulo Liga Bíblica
import pool from '../config/db.js';

export interface DatosParticipante {
  fechaLiga: string;
  idTurno: number;
  idNino: number;
  idTutor: number;
  idRegistradoPor: number;
}

/**
 * Lista los participantes de la Liga Bíblica.
 * JOIN a Personas/Grupos/Turnos/Tutores para devolver nombres legibles.
 * `mes` opcional (YYYY-MM-01) filtra por el mes del día de la liga.
 */
export const listarParticipantes = async (mes?: string): Promise<unknown[]> => {
  const params: unknown[] = [];
  let filtroMes = '';
  if (mes) {
    params.push(mes);
    filtroMes = `WHERE lb.Fecha_Liga >= $1::date AND lb.Fecha_Liga < ($1::date + INTERVAL '1 month')`;
  }
  const { rows } = await pool.query(
    `SELECT
        lb.ID_Liga           AS "idLiga",
        TO_CHAR(lb.Fecha_Liga, 'YYYY-MM-DD') AS "fechaLiga",
        lb.ID_Turno          AS "idTurno",
        t.Nombre             AS "turnoNombre",
        lb.ID_Nino           AS "idNino",
        CONCAT(pn.Nombres, ' ', pn.Apellidos) AS "nombreNino",
        pn.Sexo              AS "sexo",
        g.ID_Grupo           AS "idGrupo",
        g.Nombre             AS "nombreGrupo",
        lb.ID_Tutor          AS "idTutor",
        CONCAT(pt.Nombres, ' ', pt.Apellidos) AS "nombreTutor",
        COALESCE(tpf.Numero, pt.Telefono)     AS "telefonoTutor",
        lb.Creado_En         AS "creadoEn"
     FROM   Liga_Biblica lb
     JOIN   Turnos    t  ON t.ID_Turno  = lb.ID_Turno
     JOIN   Ninos     n  ON n.ID_Persona = lb.ID_Nino
     JOIN   Personas pn ON pn.ID_Persona = lb.ID_Nino
     LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino = lb.ID_Nino AND ng.Activo = TRUE
     LEFT JOIN Grupos g ON g.ID_Grupo = COALESCE(ng.ID_Grupo, (
       SELECT ID_Grupo FROM Grupos
       WHERE Activo = TRUE
         AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, pn.Fecha_Nacimiento)) BETWEEN Edad_Minima AND Edad_Maxima
       LIMIT 1
     ))
     JOIN   Tutores   tu ON tu.ID_Persona = lb.ID_Tutor
     JOIN   Personas  pt ON pt.ID_Persona = lb.ID_Tutor
     LEFT JOIN Telefonos_Personas tpf
            ON tpf.ID_Persona = pt.ID_Persona
           AND tpf.Es_Principal = TRUE AND tpf.Activo = TRUE
     ${filtroMes}
     ORDER  BY lb.Fecha_Liga DESC, t.Dia_Semana, t.Hora_Inicio, pn.Apellidos, pn.Nombres`,
    params
  );
  return rows;
};

/**
 * Inserta (UPSERT) un participante de la Liga Bíblica.
 * UNIQUE (Fecha_Liga, ID_Turno, ID_Nino): si ya existe se actualiza el tutor
 * (permite corregir la selección sin duplicar la inscripción).
 */
export const insertarParticipante = async (datos: DatosParticipante): Promise<void> => {
  await pool.query(
    `INSERT INTO Liga_Biblica
       (Fecha_Liga, ID_Turno, ID_Nino, ID_Tutor, ID_Registrado_Por)
     VALUES ($1::date, $2, $3, $4, $5)
     ON CONFLICT (Fecha_Liga, ID_Turno, ID_Nino)
     DO UPDATE SET ID_Tutor = EXCLUDED.ID_Tutor,
                   ID_Registrado_Por = EXCLUDED.ID_Registrado_Por`,
    [datos.fechaLiga, datos.idTurno, datos.idNino, datos.idTutor, datos.idRegistradoPor]
  );
};

/** Actualiza el tutor seleccionado de un participante por ID */
export const actualizarParticipante = async (
  idLiga: number,
  idTutor: number
): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `UPDATE Liga_Biblica SET ID_Tutor = $1 WHERE ID_Liga = $2`,
    [idTutor, idLiga]
  );
  return (rowCount ?? 0) > 0;
};

/** Elimina un participante de la Liga Bíblica por ID */
export const eliminarParticipante = async (idLiga: number): Promise<boolean> => {
  const { rowCount } = await pool.query('DELETE FROM Liga_Biblica WHERE ID_Liga = $1', [idLiga]);
  return (rowCount ?? 0) > 0;
};

/** Retorna el Dia_Semana de un turno (0=Domingo, 3=Miércoles, etc.) */
export const obtenerDiaSemanaTurno = async (idTurno: number): Promise<number | null> => {
  const { rows } = await pool.query<{ dia_semana: number }>(
    'SELECT Dia_Semana AS dia_semana FROM Turnos WHERE ID_Turno = $1',
    [idTurno]
  );
  return rows[0]?.dia_semana ?? null;
};

/** Verifica que un tutor esté vinculado al niño indicado (Tutores_Ninos). */
export const esTutorDeNino = async (idTutor: number, idNino: number): Promise<boolean> => {
  const { rows } = await pool.query(
    'SELECT 1 FROM Tutores_Ninos WHERE ID_Tutor = $1 AND ID_Nino = $2 LIMIT 1',
    [idTutor, idNino]
  );
  return rows.length > 0;
};