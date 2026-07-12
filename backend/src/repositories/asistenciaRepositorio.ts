import pool from '../config/db.js';

export interface AsistenciaRow {
  idAsistencia: number;
  fecha: string;
  idTurno: number;
  turno: string;
  horaEntrada: string;
  horaSalida?: string;
  idFichaEntrada: number;
  codigoFichaEntrada: string;
  idFichaSalida?: number;
  codigoFichaSalida?: string;
  acompananteEnAula: boolean;
  notas?: string;
  estado: string;
  ingresadoPor: string;
  retiradoPor?: string;
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  observacionesGenerales?: string;
  idGrupo: number;
  nombreGrupo: string;
  edadMinima: number;
  edadMaxima: number;
  esPrimeraVez: boolean;
}

export interface AlertaMedicaRow {
  idInfo: number;
  idPersona: number;
  tipo: string;
  descripcion: string;
  severidad: string;
  instrucciones?: string;
}

export interface ValidacionCheckIn {
  ficha_no_activa: boolean;
  ficha_no_entrada: boolean;
  ficha_grupo_incorrecto: boolean;
  ya_presente: boolean;
}

export interface ResultadoCheckIn {
  idAsistencia: number;
  fecha: string;
  idTurno: number;
  horaEntrada: string;
  estado: string;
  esPrimeraVez: boolean;
}

export interface ResultadoCheckOut {
  idAsistencia: number;
  horaSalida: string;
  estado: string;
}

export const obtenerAsistenciaPorFecha = async (
  fecha: string,
  idGrupo?: number,
  idTurno?: number
): Promise<AsistenciaRow[]> => {
  const params: (string | number)[] = [fecha];
  let filtros = '';

  if (idGrupo) {
    filtros += ` AND an.ID_Grupo_Asistido = $${params.length + 1}`;
    params.push(idGrupo);
  }
  if (idTurno) {
    filtros += ` AND an.ID_Turno = $${params.length + 1}`;
    params.push(idTurno);
  }

  const { rows } = await pool.query<AsistenciaRow>(`
    SELECT
      an.ID_Asistencia                               AS "idAsistencia",
      an.Fecha                                       AS "fecha",
      an.ID_Turno                                    AS "idTurno",
      t.Nombre                                       AS "turno",
      to_char(an.Hora_Entrada - INTERVAL '6 hours', 'HH12:MI AM') AS "horaEntrada",
      to_char(an.Hora_Salida - INTERVAL '6 hours',  'HH12:MI AM') AS "horaSalida",
      an.ID_Ficha_Entrada                            AS "idFichaEntrada",
      fe.Codigo_Ficha                                AS "codigoFichaEntrada",
      an.ID_Ficha_Salida                             AS "idFichaSalida",
      fs.Codigo_Ficha                                AS "codigoFichaSalida",
      an.Acompanante_En_Aula                         AS "acompananteEnAula",
      an.Notas                                       AS "notas",
      an.Estado                                      AS "estado",
      CONCAT(ting.Nombres, ' ', ting.Apellidos)      AS "ingresadoPor",
      CONCAT(tret.Nombres, ' ', tret.Apellidos)      AS "retiradoPor",
      p.ID_Persona                                   AS "idPersona",
      p.Nombres                                      AS "nombres",
      p.Apellidos                                    AS "apellidos",
      CONCAT(p.Nombres, ' ', p.Apellidos)            AS "nombreCompleto",
      p.Fecha_Nacimiento                             AS "fechaNacimiento",
      ni.Observaciones_Generales                     AS "observacionesGenerales",
      g.ID_Grupo                                     AS "idGrupo",
      CASE 
        WHEN g.ID_Grupo = 1 AND DATE_PART('year', AGE(an.Fecha, p.Fecha_Nacimiento))::INT < 4 THEN 'Menores de 4 años'
        ELSE g.Nombre 
      END                                            AS "nombreGrupo",
      g.Edad_Minima                                  AS "edadMinima",
      g.Edad_Maxima                                  AS "edadMaxima",
      an.Es_Primera_Vez                              AS "esPrimeraVez"
    FROM   Asistencia_Ninos an
    JOIN   Personas   p    ON p.ID_Persona    = an.ID_Nino
    JOIN   Ninos      ni   ON ni.ID_Persona   = an.ID_Nino
    JOIN   Grupos     g    ON g.ID_Grupo      = an.ID_Grupo_Asistido
    JOIN   Turnos     t    ON t.ID_Turno      = an.ID_Turno
    JOIN   Fichas     fe   ON fe.ID_Ficha     = an.ID_Ficha_Entrada
    LEFT JOIN Fichas     fs  ON fs.ID_Ficha   = an.ID_Ficha_Salida
    LEFT JOIN Personas   ting ON ting.ID_Persona = an.ID_Ingresado_Por
    LEFT JOIN Personas   tret ON tret.ID_Persona = an.ID_Retirado_Por
    WHERE  an.Fecha = $1${filtros}
    ORDER  BY an.Hora_Entrada DESC
  `, params);

  return rows;
};

export const obtenerAlertasMedicas = async (idsPersonas: number[]): Promise<AlertaMedicaRow[]> => {
  if (idsPersonas.length === 0) return [];

  const { rows } = await pool.query<AlertaMedicaRow>(`
    SELECT ID_Info       AS "idInfo",
           ID_Nino       AS "idPersona",
           Tipo          AS "tipo",
           Descripcion   AS "descripcion",
           Severidad     AS "severidad",
           Instrucciones AS "instrucciones"
    FROM   Info_Medica_Ninos
    WHERE  ID_Nino = ANY($1)
  `, [idsPersonas]);

  return rows;
};

export const validarCheckIn = async (
  fechaAsistencia: string,
  idTurno: number,
  idNino: number,
  idGrupo: number,
  idFichaEntrada: number
): Promise<ValidacionCheckIn | null> => {
  const { rows } = await pool.query<ValidacionCheckIn>(`
    WITH validaciones AS (
      SELECT
        f.ID_Ficha,
        f.Tipo,
        f.ID_Grupo,
        f.Estado,
        EXISTS (
          SELECT 1 FROM Asistencia_Ninos
          WHERE ID_Nino = $3 AND Fecha = $1 AND ID_Turno = $2
        ) AS ya_presente
      FROM Fichas f
      WHERE f.ID_Ficha = $5
    )
    SELECT
      v.ID_Ficha   IS NULL              AS ficha_no_activa,
      v.Tipo       <> 'Entrada'         AS ficha_no_entrada,
      v.ID_Grupo   <> $4                AS ficha_grupo_incorrecto,
      v.ya_presente                      AS ya_presente
    FROM validaciones v
    WHERE v.Estado = 'Activa'
    UNION ALL
    SELECT TRUE, FALSE, FALSE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM Fichas WHERE ID_Ficha = $5 AND Estado = 'Activa')
  `, [fechaAsistencia, idTurno, idNino, idGrupo, idFichaEntrada]);

  return rows[0] ?? null;
};

export const insertarCheckIn = async (
  fechaAsistencia: string,
  idTurno: number,
  idNino: number,
  idGrupo: number,
  idFichaEntrada: number,
  idIngresadoPor: number,
  hora: string,
  idRegistradoPor: number,
  acompananteEnAula: boolean,
  motivoExcepcion: string | null
): Promise<ResultadoCheckIn> => {
  const { rows } = await pool.query<ResultadoCheckIn>(`
    INSERT INTO Asistencia_Ninos
      (Fecha, ID_Turno, ID_Nino, ID_Grupo_Asistido, ID_Ficha_Entrada,
       ID_Ingresado_Por, Hora_Entrada, Registrado_Por, Acompanante_En_Aula,
       motivo_excepcion_asistencia, Es_Primera_Vez)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      (SELECT NOT EXISTS (SELECT 1 FROM Asistencia_Ninos WHERE ID_Nino = $3)))
    RETURNING ID_Asistencia    AS "idAsistencia",
              Fecha             AS "fecha",
              ID_Turno          AS "idTurno",
              to_char(Hora_Entrada - INTERVAL '6 hours', 'HH12:MI AM') AS "horaEntrada",
              Estado            AS "estado",
              Es_Primera_Vez    AS "esPrimeraVez"
  `, [
    fechaAsistencia, idTurno, idNino, idGrupo, idFichaEntrada,
    idIngresadoPor, hora, idRegistradoPor, acompananteEnAula,
    motivoExcepcion,
  ]);

  return rows[0];
};

export const actualizarCheckOut = async (
  hora: string,
  idRetiradoPor: number,
  idCheckoutPor: number,
  idFichaSalida: number | null,
  idAsistencia: number
): Promise<ResultadoCheckOut | null> => {
  const { rows, rowCount } = await pool.query<ResultadoCheckOut>(`
    UPDATE Asistencia_Ninos
    SET Hora_Salida     = $1,
        ID_Retirado_Por = $2,
        Checkout_Por    = $3,
        Estado          = 'Retirado',
        ID_Ficha_Salida = $4
    WHERE ID_Asistencia = $5 AND Estado = 'Presente'
    RETURNING ID_Asistencia              AS "idAsistencia",
              to_char(Hora_Salida - INTERVAL '6 hours', 'HH12:MI AM') AS "horaSalida",
              Estado                     AS "estado"
  `, [hora, idRetiradoPor, idCheckoutPor, idFichaSalida, idAsistencia]);

  return (rowCount ?? 0) > 0 ? rows[0] : null;
};

export const obtenerEstadoAsistencia = async (idAsistencia: number): Promise<{ estado: string } | null> => {
  const { rows } = await pool.query<{ estado: string }>(
    `SELECT Estado AS "estado" FROM Asistencia_Ninos WHERE ID_Asistencia = $1`,
    [idAsistencia]
  );
  return rows[0] ?? null;
};

export const obtenerAsistenciaPorId = async (idAsistencia: number): Promise<Record<string, unknown> | null> => {
  const { rows } = await pool.query<Record<string, unknown>>(
    `SELECT * FROM Asistencia_Ninos WHERE ID_Asistencia = $1`,
    [idAsistencia]
  );
  return rows[0] ?? null;
};

export const actualizarAsistenciaDB = async (
  idAsistencia: number,
  valores: {
    idTurno: number;
    idFichaEntrada: number;
    idFichaSalida: number | null;
    idIngresadoPor: number;
    idRetiradoPor: number | null;
    horaEntrada: string | null;
    horaSalida: string | null;
    acompananteEnAula: boolean;
    estado: string;
    notas: string | null;
    idGrupoAsistido: number;
    fecha: string;
  }
): Promise<Record<string, unknown>> => {
  const { rows } = await pool.query(`
    UPDATE Asistencia_Ninos
    SET ID_Turno = $1,
        ID_Ficha_Entrada = $2,
        ID_Ficha_Salida = $3,
        ID_Ingresado_Por = $4,
        ID_Retirado_Por = $5,
        Hora_Entrada = $6,
        Hora_Salida = $7,
        Acompanante_En_Aula = $8,
        Estado = $9,
        Notas = $10,
        ID_Grupo_Asistido = $11,
        Fecha = $12
    WHERE ID_Asistencia = $13
    RETURNING *
  `, [
    valores.idTurno,
    valores.idFichaEntrada,
    valores.idFichaSalida,
    valores.idIngresadoPor,
    valores.idRetiradoPor,
    valores.horaEntrada,
    valores.horaSalida,
    valores.acompananteEnAula,
    valores.estado,
    valores.notas,
    valores.idGrupoAsistido,
    valores.fecha,
    idAsistencia,
  ]);

  return rows[0];
};

export const eliminarAsistenciaDB = async (idAsistencia: number): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `DELETE FROM Asistencia_Ninos WHERE ID_Asistencia = $1`,
    [idAsistencia]
  );
  return (rowCount ?? 0) > 0;
};
