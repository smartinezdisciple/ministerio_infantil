// src/controllers/fichasControlador.ts — Gestión de fichas/tokens de entrada
import { Request, Response } from 'express';
import pool from '../config/db.js';

/** GET /api/fichas?estado=Activa — Lista fichas filtradas por estado */
export const listarFichas = async (req: Request, res: Response) => {
  const estado = (req.query.estado as string) || null;

  try {
    const params: (string | null)[] = [];
    let whereClause = '';
    if (estado) {
      whereClause = 'WHERE Estado = $1';
      params.push(estado);
    }

const { rows } = await pool.query(`
      SELECT f.ID_Ficha      AS "idFicha",
             f.Codigo_Ficha  AS "codigoFicha",
             f.Estado        AS "estado",
             f.Tipo          AS "tipo",
             f.ID_Grupo      AS "idGrupo",
             g.Nombre        AS "nombreGrupo"
      FROM   Fichas f
      LEFT JOIN Grupos g ON f.ID_Grupo = g.ID_Grupo
      ${whereClause}
      ORDER  BY f.Codigo_Ficha
    `, params);

    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al listar fichas:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/** GET /api/fichas/disponibilidad — Disponibilidad de fichas por grupo */
export const obtenerDisponibilidad = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT g.ID_Grupo                                    AS "idGrupo",
             g.Nombre                                      AS "nombreGrupo",
             COUNT(f.ID_Ficha)::INT                        AS "total",
             COUNT(f.ID_Ficha) FILTER (WHERE f.Estado = 'Activa')::INT AS "activas",
             COUNT(f.ID_Ficha) FILTER (WHERE f.Estado = 'Activa' AND a.ID_Asistencia IS NOT NULL AND a.Hora_Salida IS NULL)::INT AS "enUso",
             COUNT(f.ID_Ficha) FILTER (WHERE f.Estado = 'Activa' AND a.ID_Asistencia IS NULL)::INT AS "disponibles"
      FROM   Grupos g
      LEFT JOIN Fichas f ON f.ID_Grupo = g.ID_Grupo
      LEFT JOIN Asistencia_Ninos a ON a.ID_Ficha_Entrada = f.ID_Ficha
                                   AND a.Fecha = CURRENT_DATE
                                   AND a.Estado = 'Presente'
      GROUP BY g.ID_Grupo, g.Nombre
      ORDER BY g.Nombre
    `);

    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo disponibilidad:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/** POST /api/fichas — Crear nueva ficha */
export const crearFicha = async (req: Request, res: Response) => {
  const { codigoFicha, idGrupo, tipo } = req.body;

  if (!codigoFicha || !idGrupo) {
    res.status(400).json({ exito: false, mensaje: 'codigoFicha e idGrupo son obligatorios.' });
    return;
  }

  const tipoValido = tipo === 'Salida' ? 'Salida' : 'Entrada';

  try {
    const { rows } = await pool.query(
      `INSERT INTO Fichas (Codigo_Ficha, Estado, ID_Grupo, Tipo)
       VALUES ($1, 'Activa', $2, $3)
       RETURNING ID_Ficha AS "idFicha", Codigo_Ficha AS "codigoFicha", Estado AS "estado", Tipo AS "tipo", ID_Grupo AS "idGrupo"`,
      [codigoFicha, idGrupo, tipoValido]
    );

    res.status(201).json({ exito: true, datos: rows[0] });
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as { code: string }).code === '23505') {
      res.status(409).json({ exito: false, mensaje: 'Ya existe una ficha con ese código.' });
      return;
    }
    console.error('Error al crear ficha:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/** PATCH /api/fichas/:id — Actualizar ficha */
export const actualizarFicha = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { codigoFicha, estado, tipo, idGrupo } = req.body;

  if (!estado && !codigoFicha && !tipo && !idGrupo) {
    res.status(400).json({ exito: false, mensaje: 'Debe proporcionar al menos un campo para actualizar.' });
    return;
  }

  if (estado) {
    const estadosValidos = ['Activa', 'Inactiva', 'Extraviada'];
    if (!estadosValidos.includes(estado)) {
      res.status(400).json({ exito: false, mensaje: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` });
      return;
    }
  }

  if (tipo) {
    const tiposValidos = ['Entrada', 'Salida'];
    if (!tiposValidos.includes(tipo)) {
      res.status(400).json({ exito: false, mensaje: `Tipo inválido. Debe ser uno de: ${tiposValidos.join(', ')}` });
      return;
    }
  }

  try {
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (codigoFicha) {
      updates.push(`Codigo_Ficha = $${paramIndex++}`);
      params.push(codigoFicha);
    }
    if (estado) {
      updates.push(`Estado = $${paramIndex++}`);
      params.push(estado);
    }
    if (tipo) {
      updates.push(`Tipo = $${paramIndex++}`);
      params.push(tipo);
    }
    if (idGrupo !== undefined && idGrupo !== null) {
      updates.push(`ID_Grupo = $${paramIndex++}`);
      params.push(Number(idGrupo));
    }

    params.push(id);

    const query = `UPDATE Fichas SET ${updates.join(', ')} WHERE ID_Ficha = $${paramIndex} RETURNING ID_Ficha AS "idFicha", Codigo_Ficha AS "codigoFicha", Estado AS "estado", Tipo AS "tipo", ID_Grupo AS "idGrupo"`;

    const { rows } = await pool.query(query, params);

    if (rows.length === 0) {
      res.status(404).json({ exito: false, mensaje: 'Ficha no encontrada.' });
      return;
    }

    res.json({ exito: true, datos: rows[0] });
  } catch (err) {
    console.error('Error al actualizar ficha:', err);
    const mensaje = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json({ exito: false, mensaje: `Error interno del servidor: ${mensaje}` });
  }
};

/** GET /api/fichas/:id/historial — Historial de uso de una ficha (P3-01) */
export const historialFicha = async (req: Request, res: Response): Promise<void> => {
  const idFicha = Number(req.params.id);
  if (!idFicha) {
    res.status(400).json({ exito: false, mensaje: 'ID de ficha inválido.' });
    return;
  }

  try {
    const { rows } = await pool.query(`
      SELECT an.Fecha                                      AS "fecha",
             t.Nombre                                      AS "turno",
             p.Nombres || ' ' || p.Apellidos               AS "nino",
             g.Nombre                                      AS "grupo",
             to_char(an.Hora_Entrada - INTERVAL '5 hours', 'HH12:MI AM')        AS "horaEntrada",
             to_char(an.Hora_Salida - INTERVAL '5 hours',  'HH12:MI AM')        AS "horaSalida",
             an.Estado                                     AS "estado",
             CASE WHEN an.ID_Ficha_Entrada = $1 THEN 'Entrada' ELSE 'Salida' END AS "usoFicha"
      FROM   Asistencia_Ninos an
      JOIN   Personas  p ON an.ID_Nino         = p.ID_Persona
      JOIN   Turnos    t ON an.ID_Turno        = t.ID_Turno
      JOIN   Grupos    g ON an.ID_Grupo_Asistido = g.ID_Grupo
      WHERE  an.ID_Ficha_Entrada = $1 OR an.ID_Ficha_Salida = $1
      ORDER  BY an.Fecha DESC, an.Hora_Entrada DESC
      LIMIT  200
    `, [idFicha]);

    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo historial de ficha:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};
