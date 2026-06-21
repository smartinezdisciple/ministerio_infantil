// src/controllers/circulosControlador.ts — Catálogo de Círculos de Amistad
// Esquema v5.1: tabla Circulos_Amistad
import { Request, Response } from 'express';
import pool from '../config/db.js';

/**
 * GET /api/circulos
 * Lista todos los círculos activos del catálogo.
 */
export const listarCirculos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT
        ID_Circulo   AS "idCirculo",
        Nombre       AS "nombre",
        Descripcion  AS "descripcion"
      FROM Circulos_Amistad
      WHERE Activo = TRUE
      ORDER BY Nombre ASC
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al listar círculos:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/circulos
 * Crea un nuevo círculo en el catálogo.
 * Body: { nombre, descripcion? }
 */
export const crearCirculo = async (req: Request, res: Response): Promise<void> => {
  const { nombre, descripcion } = req.body;

  if (!nombre || String(nombre).trim() === '') {
    res.status(400).json({ exito: false, mensaje: 'El campo nombre es obligatorio.' });
    return;
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO Circulos_Amistad (Nombre, Descripcion, Activo)
      VALUES ($1, $2, TRUE)
      RETURNING
        ID_Circulo  AS "idCirculo",
        Nombre      AS "nombre",
        Descripcion AS "descripcion"
    `, [nombre.trim(), descripcion ?? null]);

    res.status(201).json({ exito: true, datos: rows[0], mensaje: 'Círculo creado exitosamente.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('uq_circulo_nombre') || msg.includes('duplicate key')) {
      res.status(409).json({ exito: false, mensaje: 'Ya existe un círculo con ese nombre.' });
      return;
    }
    console.error('Error al crear círculo:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * PATCH /api/circulos/:id
 * Actualiza nombre o descripción de un círculo existente.
 * Body: { nombre?, descripcion? }
 */
export const actualizarCirculo = async (req: Request, res: Response): Promise<void> => {
  const idCirculo = Number(req.params.id);
  if (!Number.isInteger(idCirculo) || idCirculo <= 0) {
    res.status(400).json({ exito: false, mensaje: 'ID de círculo inválido.' });
    return;
  }

  const { nombre, descripcion } = req.body;
  const campos: string[] = [];
  const valores: unknown[] = [];

  if (nombre !== undefined) { campos.push(`Nombre = $${campos.length + 1}`);      valores.push(String(nombre).trim()); }
  if (descripcion !== undefined) { campos.push(`Descripcion = $${campos.length + 1}`); valores.push(descripcion ?? null); }

  if (campos.length === 0) {
    res.status(400).json({ exito: false, mensaje: 'Se debe enviar al menos nombre o descripción.' });
    return;
  }

  valores.push(idCirculo);

  try {
    const { rowCount, rows } = await pool.query(`
      UPDATE Circulos_Amistad
      SET ${campos.join(', ')}
      WHERE ID_Circulo = $${valores.length} AND Activo = TRUE
      RETURNING
        ID_Circulo  AS "idCirculo",
        Nombre      AS "nombre",
        Descripcion AS "descripcion"
    `, valores);

    if ((rowCount ?? 0) === 0) {
      res.status(404).json({ exito: false, mensaje: 'Círculo no encontrado.' });
      return;
    }

    res.json({ exito: true, datos: rows[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('uq_circulo_nombre') || msg.includes('duplicate key')) {
      res.status(409).json({ exito: false, mensaje: 'Ya existe un círculo con ese nombre.' });
      return;
    }
    console.error('Error al actualizar círculo:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};
