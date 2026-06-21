// src/controllers/turnosEventosControlador.ts — Controlador para Turnos y Eventos
import { Request, Response } from 'express';
import pool from '../config/db.js';
import {
  respuestaExito,
  respuestaError,
} from '../utils/respuesta.js';

// ──────────────────────────────────────────────
// TIPOS DE EVENTO permitidos por política
// ──────────────────────────────────────────────
const TIPOS_EVENTO_VALIDOS = [
  'Servicio Regular',
  'Party Mix',
  'Power Day',
  'Semana Santa',
  'Navidad',
  'Especial',
  'Otro',
] as const;

type TipoEvento = (typeof TIPOS_EVENTO_VALIDOS)[number];

// ──────────────────────────────────────────────
// TURNOS
// ──────────────────────────────────────────────

/** GET /api/turnos — Lista todos los turnos ordenados por día y hora */
export const listarTurnos = async (req: Request, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query<{
      idTurno: number;
      nombre: string;
      diaSemana: string;
      horaInicio: string;
      activo: boolean;
    }>(`
      SELECT
        ID_Turno       AS "idTurno",
        Nombre         AS "nombre",
        Dia_Semana     AS "diaSemana",
        to_char(Hora_Inicio, 'HH24:MI') AS "horaInicio",
        Activo         AS "activo"
      FROM Turnos
      ORDER BY Dia_Semana, Hora_Inicio
    `);

    respuestaExito(res, resultado.rows);
  } catch (error) {
    console.error('Error al listar turnos:', error);
    respuestaError(res, 'Error interno al obtener los turnos.', 500);
  }
};

/** PATCH /api/turnos/:id — Actualiza solo el campo Activo de un turno */
export const actualizarTurno = async (req: Request, res: Response): Promise<void> => {
  try {
    const idTurno = Number(req.params.id);
    const { activo } = req.body as { activo?: boolean };

    // Validar que se recibió el campo activo
    if (activo === undefined || activo === null) {
      respuestaError(res, 'El campo "activo" es obligatorio.', 400);
      return;
    }

    if (typeof activo !== 'boolean') {
      respuestaError(res, 'El campo "activo" debe ser un valor booleano.', 400);
      return;
    }

    // Verificar que el turno existe
    const turnoExiste = await pool.query(
      'SELECT ID_Turno FROM Turnos WHERE ID_Turno = $1',
      [idTurno]
    );

    if ((turnoExiste.rowCount ?? 0) === 0) {
      respuestaError(res, 'Turno no encontrado.', 404);
      return;
    }

    // Si se intenta desactivar, verificar asistencias recientes (últimos 30 días)
    if (activo === false) {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);

      const asistenciaNinos = await pool.query(
        `SELECT COUNT(*) AS total
         FROM Asistencia_Ninos an
         INNER JOIN Eventos e ON e.ID_Evento = an.ID_Evento
         WHERE e.ID_Turno = $1
           AND e.Fecha >= $2`,
        [idTurno, fechaLimite]
      );

      const asistenciaMaestros = await pool.query(
        `SELECT COUNT(*) AS total
         FROM Asistencia_Maestros am
         INNER JOIN Eventos e ON e.ID_Evento = am.ID_Evento
         WHERE e.ID_Turno = $1
           AND e.Fecha >= $2`,
        [idTurno, fechaLimite]
      );

      const totalNinos = Number(asistenciaNinos.rows[0]?.total ?? 0);
      const totalMaestros = Number(asistenciaMaestros.rows[0]?.total ?? 0);

      if (totalNinos > 0 || totalMaestros > 0) {
        respuestaError(
          res,
          'No se puede desactivar el turno: tiene registros de asistencia en los últimos 30 días.',
          409
        );
        return;
      }
    }

    // Actualizar el turno
    const actualizado = await pool.query<{
      idTurno: number;
      nombre: string;
      diaSemana: string;
      horaInicio: string;
      activo: boolean;
    }>(
      `UPDATE Turnos
       SET Activo = $1
       WHERE ID_Turno = $2
       RETURNING
         ID_Turno       AS "idTurno",
         Nombre         AS "nombre",
         Dia_Semana     AS "diaSemana",
         to_char(Hora_Inicio, 'HH24:MI') AS "horaInicio",
         Activo         AS "activo"`,
      [activo, idTurno]
    );

    if ((actualizado.rowCount ?? 0) === 0) {
      respuestaError(res, 'No se pudo actualizar el turno.', 500);
      return;
    }

    respuestaExito(res, actualizado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    respuestaError(res, 'Error interno al actualizar el turno.', 500);
  }
};

// ──────────────────────────────────────────────
// EVENTOS
// ──────────────────────────────────────────────

/** GET /api/eventos?mes=YYYY-MM — Lista eventos activos, con filtro opcional por mes */
export const listarEventos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mes } = req.query as { mes?: string };

    // Validar formato del parámetro mes si se proporcionó
    if (mes !== undefined && !/^\d{4}-\d{2}$/.test(mes)) {
      respuestaError(res, 'El parámetro "mes" debe tener el formato YYYY-MM.', 400);
      return;
    }

    let consulta: string;
    let parametros: unknown[];

    if (mes) {
      // Filtrar por mes específico
      consulta = `
        SELECT
          e.ID_Evento      AS "idEvento",
          e.Nombre         AS "nombre",
          e.Descripcion    AS "descripcion",
          e.Fecha          AS "fecha",
          e.ID_Turno       AS "idTurno",
          t.Nombre         AS "turno",
          e.Tipo           AS "tipo",
          e.Numero_Semana  AS "numeroSemana",
          e.Activo         AS "activo"
        FROM Eventos e
        LEFT JOIN Turnos t ON t.ID_Turno = e.ID_Turno
        WHERE e.Activo = TRUE
          AND DATE_TRUNC('month', e.Fecha) = $1::DATE
        ORDER BY e.Fecha DESC
      `;
      // Convertir YYYY-MM a YYYY-MM-01 para que sea una DATE válida
      parametros = [`${mes}-01`];
    } else {
      // Devolver todos los eventos activos
      consulta = `
        SELECT
          e.ID_Evento      AS "idEvento",
          e.Nombre         AS "nombre",
          e.Descripcion    AS "descripcion",
          e.Fecha          AS "fecha",
          e.ID_Turno       AS "idTurno",
          t.Nombre         AS "turno",
          e.Tipo           AS "tipo",
          e.Numero_Semana  AS "numeroSemana",
          e.Activo         AS "activo"
        FROM Eventos e
        LEFT JOIN Turnos t ON t.ID_Turno = e.ID_Turno
        WHERE e.Activo = TRUE
        ORDER BY e.Fecha DESC
      `;
      parametros = [];
    }

    const resultado = await pool.query(consulta, parametros);
    respuestaExito(res, resultado.rows);
  } catch (error) {
    console.error('Error al listar eventos:', error);
    respuestaError(res, 'Error interno al obtener los eventos.', 500);
  }
};

/** POST /api/eventos — Crea un nuevo evento */
export const crearEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      descripcion,
      fecha,
      idTurno,
      tipo,
      activo = true,
    } = req.body as {
      nombre?: string;
      descripcion?: string;
      fecha?: string;
      idTurno?: number | null;
      tipo?: string;
      activo?: boolean;
    };

    // Validar campos obligatorios
    if (!nombre || !fecha || !tipo) {
      respuestaError(res, 'Los campos "nombre", "fecha" y "tipo" son obligatorios.', 400);
      return;
    }

    // Validar tipo de evento
    if (!TIPOS_EVENTO_VALIDOS.includes(tipo as TipoEvento)) {
      respuestaError(
        res,
        `El tipo de evento no es válido. Tipos permitidos: ${TIPOS_EVENTO_VALIDOS.join(', ')}.`,
        400
      );
      return;
    }

    // Insertar el evento — Numero_Semana es GENERATED ALWAYS, no se incluye
    const resultado = await pool.query<{
      idEvento: number;
      nombre: string;
      descripcion: string | null;
      fecha: Date;
      idTurno: number | null;
      tipo: string;
      numeroSemana: number;
      activo: boolean;
    }>(
      `INSERT INTO Eventos (Nombre, Descripcion, Fecha, ID_Turno, Tipo, Activo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         ID_Evento     AS "idEvento",
         Nombre        AS "nombre",
         Descripcion   AS "descripcion",
         Fecha         AS "fecha",
         ID_Turno      AS "idTurno",
         Tipo          AS "tipo",
         Numero_Semana AS "numeroSemana",
         Activo        AS "activo"`,
      [nombre, descripcion ?? null, fecha, idTurno ?? null, tipo, activo]
    );

    respuestaExito(res, resultado.rows[0], 201);
  } catch (error: unknown) {
    // Capturar violación de constraint UNIQUE(Fecha, ID_Turno)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      respuestaError(res, 'Ya existe un evento en esa fecha y turno.', 409);
      return;
    }

    console.error('Error al crear evento:', error);
    respuestaError(res, 'Error interno al crear el evento.', 500);
  }
};

/** PATCH /api/eventos/:id — Actualiza parcialmente un evento */
export const actualizarEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const idEvento = Number(req.params.id);

    const {
      nombre,
      descripcion,
      fecha,
      idTurno,
      tipo,
      activo,
    } = req.body as {
      nombre?: string;
      descripcion?: string;
      fecha?: string;
      idTurno?: number | null;
      tipo?: string;
      activo?: boolean;
    };

    // Verificar que existe el evento
    const eventoExiste = await pool.query(
      'SELECT ID_Evento FROM Eventos WHERE ID_Evento = $1',
      [idEvento]
    );

    if ((eventoExiste.rowCount ?? 0) === 0) {
      respuestaError(res, 'Evento no encontrado.', 404);
      return;
    }

    // Validar tipo si se proporcionó
    if (tipo !== undefined && !TIPOS_EVENTO_VALIDOS.includes(tipo as TipoEvento)) {
      respuestaError(
        res,
        `El tipo de evento no es válido. Tipos permitidos: ${TIPOS_EVENTO_VALIDOS.join(', ')}.`,
        400
      );
      return;
    }

    // Construir actualización dinámica
    const campos: string[] = [];
    const valores: unknown[] = [];
    let indicador = 1;

    if (nombre !== undefined) {
      campos.push(`Nombre = $${indicador++}`);
      valores.push(nombre);
    }
    if (descripcion !== undefined) {
      campos.push(`Descripcion = $${indicador++}`);
      valores.push(descripcion);
    }
    if (fecha !== undefined) {
      campos.push(`Fecha = $${indicador++}`);
      valores.push(fecha);
    }
    if (idTurno !== undefined) {
      campos.push(`ID_Turno = $${indicador++}`);
      valores.push(idTurno);
    }
    if (tipo !== undefined) {
      campos.push(`Tipo = $${indicador++}`);
      valores.push(tipo);
    }
    if (activo !== undefined) {
      campos.push(`Activo = $${indicador++}`);
      valores.push(activo);
    }

    // Si no se envió ningún campo, informar al cliente
    if (campos.length === 0) {
      respuestaError(res, 'Se debe enviar al menos un campo para actualizar.', 400);
      return;
    }

    valores.push(idEvento);

    const resultado = await pool.query(
      `UPDATE Eventos
       SET ${campos.join(', ')}
       WHERE ID_Evento = $${indicador}
       RETURNING
         ID_Evento     AS "idEvento",
         Nombre        AS "nombre",
         Descripcion   AS "descripcion",
         Fecha         AS "fecha",
         ID_Turno      AS "idTurno",
         Tipo          AS "tipo",
         Numero_Semana AS "numeroSemana",
         Activo        AS "activo"`,
      valores
    );

    if ((resultado.rowCount ?? 0) === 0) {
      respuestaError(res, 'No se pudo actualizar el evento.', 500);
      return;
    }

    respuestaExito(res, resultado.rows[0]);
  } catch (error: unknown) {
    // Capturar violación de constraint UNIQUE(Fecha, ID_Turno)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      respuestaError(res, 'Ya existe un evento en esa fecha y turno.', 409);
      return;
    }

    console.error('Error al actualizar evento:', error);
    respuestaError(res, 'Error interno al actualizar el evento.', 500);
  }
};
