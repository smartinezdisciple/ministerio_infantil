// src/repositories/premiadosRepositorio.ts — Acceso a datos del módulo Premiados
import pool from '../config/db.js';

export interface RegistroPremiado {
  idTurno: number;
  idGrupo: number;
  idNino: number;
}

/**
 * Lista los premiados de un mes (o de todos los meses si no se pasa mes).
 * JOIN a Personas/Grupos/Turnos para devolver nombres legibles.
 */
export const listarPremiados = async (mes?: string): Promise<unknown[]> => {
  const params: unknown[] = [];
  let filtroMes = '';
  if (mes) {
    params.push(mes);
    filtroMes = 'WHERE pr.Mes = $1::date';
  }
  const { rows } = await pool.query(
    `SELECT
        pr.ID_Premiado       AS "idPremiado",
        pr.Mes               AS "mes",
        pr.Fecha_Premiacion  AS "fechaPremiacion",
        pr.ID_Turno          AS "idTurno",
        t.Nombre             AS "turnoNombre",
        pr.ID_Grupo          AS "idGrupo",
        g.Nombre             AS "grupoNombre",
        pr.ID_Nino           AS "idNino",
        CONCAT(p.Nombres, ' ', p.Apellidos) AS "nombreNino",
        p.Fecha_Nacimiento   AS "fechaNacimientoNino",
        pr.Creado_En         AS "creadoEn"
     FROM   Premiados pr
     JOIN   Turnos   t  ON t.ID_Turno  = pr.ID_Turno
     JOIN   Grupos   g  ON g.ID_Grupo  = pr.ID_Grupo
     JOIN   Ninos    n  ON n.ID_Persona = pr.ID_Nino
     JOIN   Personas p  ON p.ID_Persona = n.ID_Persona
     ${filtroMes}
     ORDER  BY pr.Mes DESC, t.Dia_Semana, t.Hora_Inicio, g.Edad_Minima`,
    params
  );
  return rows;
};

/**
 * Guarda (UPSERT) un conjunto de premiados para un mes.
 * - Por cada registro se asocia su Fecha_Premiacion (en la misma sesión domingo/miércoles).
 * - UNIQUE (Mes, ID_Turno, ID_Grupo): si ya existe para ese grupo/turno/mes se actualiza
 *   el niño (permite corregir la selección del mes).
 */
export const guardarPremiados = async (
  mes: string,
  registros: Array<RegistroPremiado & { fechaPremiacion: string }>,
  idRegistradoPor: number
): Promise<void> => {
  for (const r of registros) {
    await pool.query(
      `INSERT INTO Premiados
         (Mes, Fecha_Premiacion, ID_Turno, ID_Grupo, ID_Nino, ID_Registrado_Por)
       VALUES ($1::date, $2::date, $3, $4, $5, $6)
       ON CONFLICT (Mes, ID_Turno, ID_Grupo)
       DO UPDATE SET Fecha_Premiacion = EXCLUDED.Fecha_Premiacion,
                     ID_Nino          = EXCLUDED.ID_Nino,
                     ID_Registrado_Por = EXCLUDED.ID_Registrado_Por`,
      [mes, r.fechaPremiacion, r.idTurno, r.idGrupo, r.idNino, idRegistradoPor]
    );
  }
};

/** Elimina un premiado por ID */
export const eliminarPremiado = async (idPremiado: number): Promise<boolean> => {
  const { rowCount } = await pool.query('DELETE FROM Premiados WHERE ID_Premiado = $1', [idPremiado]);
  return (rowCount ?? 0) > 0;
};
