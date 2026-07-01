// src/controllers/asistenciaControlador.ts — Check-in / Check-out y listado diario de asistencia
// Esquema v4: Asistencia_Ninos con ID_Turno obligatorio (UNIQUE ID_Nino, Fecha, ID_Turno).
// Check-in: ID_Ingresado_Por = ID del padre/tutor, Registrado_Por = ID del personal logueado.
// Check-out: ID_Retirado_Por = padre/tutor, Checkout_Por = personal. Trigger valida autorización.
import { Request, Response } from 'express';
import pool from '../config/db.js';

/**
 * GET /api/asistencia?fecha=YYYY-MM-DD&grupo=<id>&turno=<id>
 * Listado de asistencia con filtros opcionales de grupo y turno.
 */
export const listarAsistenciaDia = async (req: Request, res: Response): Promise<void> => {
  // Si no viene fecha, calcular en zona horaria local del servidor (evitar desfase UTC)
  const ahora = new Date();
  const fechaHoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  const fecha    = (req.query.fecha  as string) || fechaHoy;
  const idGrupo  = req.query.grupo   as string | undefined;
  const idTurno  = req.query.turno   as string | undefined;

  try {
    const params: (string | number)[] = [fecha];
    let filtros = '';

    if (idGrupo) {
      filtros += ` AND an.ID_Grupo_Asistido = $${params.length + 1}`;
      params.push(Number(idGrupo));
    }
    if (idTurno) {
      filtros += ` AND an.ID_Turno = $${params.length + 1}`;
      params.push(Number(idTurno));
    }

    const { rows } = await pool.query(`
      SELECT
        an.ID_Asistencia                               AS "idAsistencia",
        an.Fecha                                       AS "fecha",
        an.ID_Turno                                    AS "idTurno",
        t.Nombre                                       AS "turno",
        to_char(an.Hora_Entrada - INTERVAL '6 hours', 'HH12:MI AM')        AS "horaEntrada",
        to_char(an.Hora_Salida - INTERVAL '6 hours',  'HH12:MI AM')        AS "horaSalida",
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

    if (rows.length === 0) {
      res.json({ exito: true, datos: [] });
      return;
    }

    // Alertas médicas en lote
    const idsPersonas = rows.map((r: { idPersona: number }) => r.idPersona);
    const { rows: alertaRows } = await pool.query(`
      SELECT ID_Info       AS "idInfo",
             ID_Nino       AS "idPersona",
             Tipo          AS "tipo",
             Descripcion   AS "descripcion",
             Severidad     AS "severidad",
             Instrucciones AS "instrucciones"
      FROM   Info_Medica_Ninos
      WHERE  ID_Nino = ANY($1)
    `, [idsPersonas]);

    const alertas: Record<number, object[]> = {};
    for (const a of alertaRows as { idPersona: number }[]) {
      if (!alertas[a.idPersona]) alertas[a.idPersona] = [];
      alertas[a.idPersona].push(a);
    }

    const resultado = rows.map((r: {
      idPersona: number; idGrupo: number; nombreGrupo: string; edadMinima: number; edadMaxima: number;
      idAsistencia: number; fecha: string; idTurno: number; turno: string;
      horaEntrada: string; horaSalida?: string;
      idFichaEntrada: number; codigoFichaEntrada: string; idFichaSalida?: number; codigoFichaSalida?: string;
      estado: string; acompananteEnAula: boolean; ingresadoPor: string; retiradoPor?: string; notas?: string;
      nombres: string; apellidos: string; nombreCompleto: string; fechaNacimiento: string;
      observacionesGenerales?: string; esPrimeraVez: boolean;
    }) => ({
      idAsistencia:       r.idAsistencia,
      fecha:              r.fecha,
      idTurno:            r.idTurno,
      turno:              r.turno,
      horaEntrada:        r.horaEntrada,
      horaSalida:         r.horaSalida,
      idFichaEntrada:     r.idFichaEntrada,
      codigoFichaEntrada: r.codigoFichaEntrada,
      idFichaSalida:      r.idFichaSalida,
      codigoFichaSalida:  r.codigoFichaSalida,
      estado:             r.estado,
      acompananteEnAula:  r.acompananteEnAula,
      ingresadoPor:       r.ingresadoPor,
      retiradoPor:        r.retiradoPor,
      notas:              r.notas,
      nino: {
        idPersona:            r.idPersona,
        nombres:              r.nombres,
        apellidos:            r.apellidos,
        nombreCompleto:       r.nombreCompleto,
        fechaNacimiento:      r.fechaNacimiento,
        observacionesGenerales: r.observacionesGenerales,
        grupo: { idGrupo: r.idGrupo, nombre: r.nombreGrupo, edadMinima: r.edadMinima, edadMaxima: r.edadMaxima },
        alertasMedicas:       alertas[r.idPersona] ?? [],
        esPrimeraVez:     r.esPrimeraVez,
      },
    }));

    res.json({ exito: true, datos: resultado });
  } catch (err) {
    console.error('Error al listar asistencia:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/asistencia/checkin
 * Body: { idNino, idFichaEntrada, idIngresadoPor?, acompananteEnAula, idGrupo, idTurno, fecha? }
 * Registrado_Por se extrae del JWT.
 * ID_Turno es OBLIGATORIO para cumplir UNIQUE (ID_Nino, Fecha, ID_Turno).
 */
export const registrarCheckIn = async (req: Request, res: Response): Promise<void> => {
  const { idNino, idFichaEntrada, idIngresadoPor, acompananteEnAula, idGrupo, idTurno, fecha, motivoExcepcion } = req.body;
  const idRegistradoPor = req.usuario?.idPersona;
  const fechaAsistencia = fecha || new Date().toISOString().split('T')[0];
  const hora            = new Date().toISOString().slice(11, 19); // HH:MM:SS

  if (!idNino || !idFichaEntrada || !idGrupo || !idTurno) {
    res.status(400).json({ exito: false, mensaje: 'Campos obligatorios: idNino, idFichaEntrada, idGrupo, idTurno.' });
    return;
  }

  try {
    // Verificar que la ficha está activa, es de tipo Entrada y pertenece al grupo
    const fichaRes = await pool.query(
      `SELECT ID_Ficha AS "idFicha", Tipo AS "tipo", ID_Grupo AS "idGrupo" FROM Fichas WHERE ID_Ficha = $1 AND Estado = 'Activa'`,
      [idFichaEntrada]
    );
    if ((fichaRes.rowCount ?? 0) === 0) {
      res.status(409).json({ exito: false, mensaje: 'La ficha seleccionada no está activa.' });
      return;
    }
    const ficha = fichaRes.rows[0];
    if (ficha.tipo !== 'Entrada') {
      res.status(400).json({ exito: false, mensaje: 'La ficha seleccionada debe ser de tipo Entrada.' });
      return;
    }
    if (ficha.idGrupo !== idGrupo) {
      res.status(400).json({ exito: false, mensaje: 'La ficha seleccionada no corresponde al grupo de la asistencia.' });
      return;
    }

    // Verificar duplicado por niño + fecha + turno (constraint spec §2.10)
    const yaPresente = await pool.query(
      `SELECT 1 FROM Asistencia_Ninos WHERE ID_Nino = $1 AND Fecha = $2 AND ID_Turno = $3`,
      [idNino, fechaAsistencia, idTurno]
    );
    if ((yaPresente.rowCount ?? 0) > 0) {
      res.status(409).json({ exito: false, mensaje: 'El niño ya tiene un registro de asistencia para ese turno.' });
      return;
    }

    const { rows } = await pool.query(`
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
      idIngresadoPor ?? idRegistradoPor,
      hora, idRegistradoPor, acompananteEnAula ?? false,
      motivoExcepcion ?? null,
    ]);

    res.status(201).json({ exito: true, datos: rows[0] });
  } catch (err) {
    console.error('Error en check-in:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * PATCH /api/asistencia/:id/checkout
 * Body: { idRetiradoPor, idFichaSalida? }
 * El trigger trg_validar_retiro_nino verifica autorización (padre/tutor registrado).
 */
export const registrarCheckOut = async (req: Request, res: Response): Promise<void> => {
  const idAsistencia  = Number(req.params.id);
  const { idRetiradoPor, id_ficha_salida } = req.body;
  const idCheckoutPor = req.usuario?.idPersona;
  const hora          = new Date().toISOString().slice(11, 19);

  if (!idRetiradoPor) {
    res.status(400).json({ exito: false, mensaje: 'Debe indicar idRetiradoPor (ID de quien retira).' });
    return;
  }

  try {
    // Verificar que el registro existe y está pendiente
    const checkRes = await pool.query(
      `SELECT ID_Asistencia, Estado FROM Asistencia_Ninos WHERE ID_Asistencia = $1`,
      [idAsistencia]
    );
    if ((checkRes.rowCount ?? 0) === 0) {
      res.status(404).json({ exito: false, mensaje: 'Registro de asistencia no encontrado.' });
      return;
    }
    if (checkRes.rows[0].Estado === 'Retirado') {
      res.status(409).json({ exito: false, mensaje: 'El niño ya fue retirado.' });
      return;
    }

    // El trigger trg_validar_retiro_nino valida la autorización en la BD
    const { rows, rowCount } = await pool.query(`
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
    `, [hora, idRetiradoPor, idCheckoutPor, id_ficha_salida ?? null, idAsistencia]);

    if ((rowCount ?? 0) === 0) {
      res.status(404).json({ exito: false, mensaje: 'No se pudo completar el checkout.' });
      return;
    }

    res.json({ exito: true, datos: rows[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    // El trigger lanza excepción si la persona no está autorizada
    if (msg.includes('NO autorizada')) {
      res.status(403).json({ exito: false, mensaje: 'Persona no autorizada para retirar a este niño.' });
      return;
    }
    console.error('Error en check-out:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * PATCH /api/asistencia/:id
 * Actualiza dinámicamente un registro de asistencia. Requiere nivel >= 3.
 */
export const actualizarAsistencia = async (req: Request, res: Response): Promise<void> => {
  const idAsistencia = Number(req.params.id);
  const {
    idTurno,
    idFichaEntrada,
    idFichaSalida,
    idIngresadoPor,
    idRetiradoPor,
    horaEntrada,
    horaSalida,
    acompananteEnAula,
    estado,
    notas,
    idGrupoAsistido,
    fecha
  } = req.body;

  if (req.usuario && req.usuario.nivelJerarquico < 3) {
    res.status(403).json({ exito: false, mensaje: 'No tiene permisos para modificar la asistencia.' });
    return;
  }

  try {
    // 1. Obtener la asistencia actual
    const checkRes = await pool.query(
      `SELECT * FROM Asistencia_Ninos WHERE ID_Asistencia = $1`,
      [idAsistencia]
    );
    if ((checkRes.rowCount ?? 0) === 0) {
      res.status(404).json({ exito: false, mensaje: 'Registro de asistencia no encontrado.' });
      return;
    }
    const actual = checkRes.rows[0];

    // 2. Determinar los nuevos valores
    const nuevoEstado = estado ?? actual.estado;
    
    // Si cambia a Presente, limpiamos los datos de salida
    let nuevoIdFichaSalida = idFichaSalida !== undefined ? idFichaSalida : actual.id_ficha_salida;
    let nuevoIdRetiradoPor = idRetiradoPor !== undefined ? idRetiradoPor : actual.id_retirado_por;
    let nuevoHoraSalida = horaSalida !== undefined ? horaSalida : actual.hora_salida;

    if (nuevoEstado === 'Presente') {
      nuevoIdFichaSalida = null;
      nuevoIdRetiradoPor = null;
      nuevoHoraSalida = null;
    }

    const query = `
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
    `;

    const { rows } = await pool.query(query, [
      idTurno !== undefined ? idTurno : actual.id_turno,
      idFichaEntrada !== undefined ? idFichaEntrada : actual.id_ficha_entrada,
      nuevoIdFichaSalida,
      idIngresadoPor !== undefined ? idIngresadoPor : actual.id_ingresado_por,
      nuevoIdRetiradoPor,
      horaEntrada !== undefined ? horaEntrada : actual.hora_entrada,
      nuevoHoraSalida,
      acompananteEnAula !== undefined ? acompananteEnAula : actual.acompanante_en_aula,
      nuevoEstado,
      notas !== undefined ? (notas === '' ? null : notas) : actual.notas,
      idGrupoAsistido !== undefined ? idGrupoAsistido : actual.id_grupo_asistido,
      fecha !== undefined ? fecha : actual.fecha,
      idAsistencia
    ]);

    res.json({ exito: true, datos: rows[0] });
  } catch (err: any) {
    console.error('Error al actualizar asistencia:', err);
    res.status(500).json({ exito: false, mensaje: err.message || 'Error interno del servidor.' });
  }
};

/**
 * DELETE /api/asistencia/:id
 * Elimina un registro de asistencia. Requiere nivel >= 3.
 */
export const eliminarAsistencia = async (req: Request, res: Response): Promise<void> => {
  const idAsistencia = Number(req.params.id);

  if (req.usuario && req.usuario.nivelJerarquico < 3) {
    res.status(403).json({ exito: false, mensaje: 'No tiene permisos para eliminar la asistencia.' });
    return;
  }

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM Asistencia_Ninos WHERE ID_Asistencia = $1`,
      [idAsistencia]
    );

    if ((rowCount ?? 0) === 0) {
      res.status(404).json({ exito: false, mensaje: 'Registro de asistencia no encontrado.' });
      return;
    }

    res.json({ exito: true, mensaje: 'Registro de asistencia eliminado correctamente.' });
  } catch (err: any) {
    console.error('Error al eliminar asistencia:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};
