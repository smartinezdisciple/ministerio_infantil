// src/controllers/gruposControlador.ts — Grupos y asistencia diaria por grupo
// Vista en tiempo real: solo niños con check-in en el grupo hoy
import { Request, Response } from 'express';
import pool from '../config/db.js';

/** GET /api/grupos — Lista grupos activos */
export const listarGrupos = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT ID_Grupo    AS "idGrupo",
             Nombre      AS "nombre",
             Edad_Minima AS "edadMinima",
             Edad_Maxima AS "edadMaxima",
             Activo      AS "activo"
      FROM   Grupos
      WHERE  Activo = TRUE
      ORDER  BY Edad_Minima
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al listar grupos:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};


