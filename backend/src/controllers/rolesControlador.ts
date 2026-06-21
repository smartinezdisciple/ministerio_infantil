import { Request, Response } from 'express';
import pool from '../config/db.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

// GET /api/roles — Listar todos los roles ordenados por nivel jerárquico
export const listarRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(`
      SELECT ID_Rol AS "idRol",
             Nombre_Rol AS "nombreRol",
             Nivel_Jerarquico AS "nivelJerarquico",
             Activo AS "activo"
      FROM Roles
      ORDER BY Nivel_Jerarquico ASC
    `);

    respuestaExito(res, resultado.rows);
  } catch (error) {
    console.error('Error al listar roles:', error);
    respuestaError(res, 'Error interno al obtener los roles', 500);
  }
};

// POST /api/roles — Crear un nuevo rol
export const crearRol = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombreRol, nivelJerarquico, activo } = req.body;

    // Validar campos obligatorios
    if (!nombreRol || nivelJerarquico === undefined || nivelJerarquico === null) {
      respuestaError(res, 'Los campos nombreRol y nivelJerarquico son obligatorios', 400);
      return;
    }

    // Validar rango de nivel jerárquico
    const nivel = Number(nivelJerarquico);
    if (isNaN(nivel) || nivel < 1 || nivel > 4) {
      respuestaError(res, 'El nivelJerarquico debe ser un número entre 1 y 4', 400);
      return;
    }

    const activoFinal = activo !== undefined ? activo : true;

    const resultado = await pool.query(`
      INSERT INTO Roles (Nombre_Rol, Nivel_Jerarquico, Activo)
      VALUES ($1, $2, $3)
      RETURNING
        ID_Rol AS "idRol",
        Nombre_Rol AS "nombreRol",
        Nivel_Jerarquico AS "nivelJerarquico",
        Activo AS "activo"
    `, [nombreRol, nivel, activoFinal]);

    respuestaExito(res, resultado.rows[0], 201);
  } catch (error) {
    console.error('Error al crear rol:', error);
    respuestaError(res, 'Error interno al crear el rol', 500);
  }
};

// PATCH /api/roles/:id — Actualizar un rol existente
export const actualizarRol = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombreRol, nivelJerarquico, activo } = req.body;

    // Verificar que se envió al menos un campo
    if (nombreRol === undefined && nivelJerarquico === undefined && activo === undefined) {
      respuestaError(res, 'Se debe enviar al menos un campo para actualizar', 400);
      return;
    }

    // Validar nivelJerarquico si se envía
    if (nivelJerarquico !== undefined) {
      const nivel = Number(nivelJerarquico);
      if (isNaN(nivel) || nivel < 1 || nivel > 4) {
        respuestaError(res, 'El nivelJerarquico debe ser un número entre 1 y 4', 400);
        return;
      }
    }

    // Si se intenta desactivar, verificar que no haya personal activo asignado
    if (activo === false) {
      const verificacion = await pool.query(`
        SELECT COUNT(*) FROM Personal_Sistema
        WHERE ID_Rol = $1 AND Activo = TRUE
      `, [id]);

      const conteo = parseInt(verificacion.rows[0].count, 10);
      if (conteo > 0) {
        respuestaError(res, 'No se puede desactivar un rol con personal activo asignado', 409);
        return;
      }
    }

    // Construcción dinámica del SET
    const campos: string[] = [];
    const valores: unknown[] = [];
    let indice = 1;

    if (nombreRol !== undefined) {
      campos.push(`Nombre_Rol = $${indice++}`);
      valores.push(nombreRol);
    }
    if (nivelJerarquico !== undefined) {
      campos.push(`Nivel_Jerarquico = $${indice++}`);
      valores.push(Number(nivelJerarquico));
    }
    if (activo !== undefined) {
      campos.push(`Activo = $${indice++}`);
      valores.push(activo);
    }

    valores.push(id);

    const resultado = await pool.query(`
      UPDATE Roles
      SET ${campos.join(', ')}
      WHERE ID_Rol = $${indice}
      RETURNING
        ID_Rol AS "idRol",
        Nombre_Rol AS "nombreRol",
        Nivel_Jerarquico AS "nivelJerarquico",
        Activo AS "activo"
    `, valores);

    if ((resultado.rowCount ?? 0) === 0) {
      respuestaError(res, 'Rol no encontrado', 404);
      return;
    }

    respuestaExito(res, resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    respuestaError(res, 'Error interno al actualizar el rol', 500);
  }
};
