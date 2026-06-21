import { Request, Response } from 'express';
import pool from '../config/db.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

// GET /api/redes — Listar todas las redes ordenadas por nombre
export const listarRedes = async (req: Request, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(`
      SELECT ID_Red AS "idRed",
             Nombre AS "nombre",
             Activo AS "activo"
      FROM Redes
      ORDER BY Nombre
    `);

    respuestaExito(res, resultado.rows);
  } catch (error) {
    console.error('Error al listar redes:', error);
    respuestaError(res, 'Error interno al obtener las redes', 500);
  }
};

// POST /api/redes — Crear una nueva red
export const crearRed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre } = req.body;

    // Validar campo obligatorio
    if (!nombre || String(nombre).trim() === '') {
      respuestaError(res, 'El campo nombre es obligatorio', 400);
      return;
    }

    const resultado = await pool.query(`
      INSERT INTO Redes (Nombre, Activo)
      VALUES ($1, TRUE)
      RETURNING
        ID_Red AS "idRed",
        Nombre AS "nombre",
        Activo AS "activo"
    `, [String(nombre).trim()]);

    respuestaExito(res, resultado.rows[0], 201);
  } catch (error) {
    console.error('Error al crear red:', error);
    respuestaError(res, 'Error interno al crear la red', 500);
  }
};

// PATCH /api/redes/:id — Actualizar una red existente
export const actualizarRed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;

    // Verificar que se envió al menos un campo
    if (nombre === undefined && activo === undefined) {
      respuestaError(res, 'Se debe enviar al menos un campo para actualizar', 400);
      return;
    }

    // Si se intenta desactivar, verificar que no haya personal asignado a la red
    if (activo === false) {
      const verificacion = await pool.query(`
        SELECT COUNT(*) FROM Personal_Info_Iglesia
        WHERE ID_Red = $1
      `, [id]);

      const conteo = parseInt(verificacion.rows[0].count, 10);
      if (conteo > 0) {
        respuestaError(res, 'No se puede desactivar una red con personal asignado', 409);
        return;
      }
    }

    // Construcción dinámica del SET
    const campos: string[] = [];
    const valores: unknown[] = [];
    let indice = 1;

    if (nombre !== undefined) {
      campos.push(`Nombre = $${indice++}`);
      valores.push(String(nombre).trim());
    }
    if (activo !== undefined) {
      campos.push(`Activo = $${indice++}`);
      valores.push(activo);
    }

    valores.push(id);

    const resultado = await pool.query(`
      UPDATE Redes
      SET ${campos.join(', ')}
      WHERE ID_Red = $${indice}
      RETURNING
        ID_Red AS "idRed",
        Nombre AS "nombre",
        Activo AS "activo"
    `, valores);

    if ((resultado.rowCount ?? 0) === 0) {
      respuestaError(res, 'Red no encontrada', 404);
      return;
    }

    respuestaExito(res, resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar red:', error);
    respuestaError(res, 'Error interno al actualizar la red', 500);
  }
};
