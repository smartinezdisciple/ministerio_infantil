import { Request, Response } from 'express';
import pool from '../config/db.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

// Tipos válidos para el campo Tipo de requisito
const TIPOS_VALIDOS = ['Formacion', 'Estado_Ministerial', 'Otro'] as const;

// GET /api/requisitos — Listar todos los requisitos con su rol requerido
export const listarRequisitos = async (req: Request, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(`
      SELECT r.ID_Requisito AS "idRequisito",
             r.Nombre AS "nombre",
             r.Descripcion AS "descripcion",
             r.Tipo AS "tipo",
             r.ID_Rol_Requerido AS "idRolRequerido",
             ro.Nombre_Rol AS "nombreRolRequerido",
             r.Obligatorio AS "obligatorio",
             r.Activo AS "activo"
      FROM Requisitos r
      LEFT JOIN Roles ro ON ro.ID_Rol = r.ID_Rol_Requerido
      ORDER BY r.Tipo, r.Nombre
    `);

    respuestaExito(res, resultado.rows);
  } catch (error) {
    console.error('Error al listar requisitos:', error);
    respuestaError(res, 'Error interno al obtener los requisitos', 500);
  }
};

// POST /api/requisitos — Crear un nuevo requisito
export const crearRequisito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, tipo, idRolRequerido, obligatorio, activo } = req.body;

    // Validar campos obligatorios
    if (!nombre || !tipo) {
      respuestaError(res, 'Los campos nombre y tipo son obligatorios', 400);
      return;
    }

    // Validar tipo permitido
    if (!TIPOS_VALIDOS.includes(tipo)) {
      respuestaError(res, `El tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`, 400);
      return;
    }

    const obligatorioFinal = obligatorio !== undefined ? obligatorio : true;
    const activoFinal = activo !== undefined ? activo : true;

    const resultado = await pool.query(`
      INSERT INTO Requisitos (Nombre, Descripcion, Tipo, ID_Rol_Requerido, Obligatorio, Activo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        ID_Requisito AS "idRequisito",
        Nombre AS "nombre",
        Descripcion AS "descripcion",
        Tipo AS "tipo",
        ID_Rol_Requerido AS "idRolRequerido",
        Obligatorio AS "obligatorio",
        Activo AS "activo"
    `, [nombre, descripcion ?? null, tipo, idRolRequerido ?? null, obligatorioFinal, activoFinal]);

    respuestaExito(res, resultado.rows[0], 201);
  } catch (error) {
    console.error('Error al crear requisito:', error);
    respuestaError(res, 'Error interno al crear el requisito', 500);
  }
};

// PATCH /api/requisitos/:id — Actualizar un requisito existente
export const actualizarRequisito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, tipo, idRolRequerido, obligatorio, activo } = req.body;

    // Verificar que se envió al menos un campo
    const hayAlgunCampo = [nombre, descripcion, tipo, idRolRequerido, obligatorio, activo]
      .some((campo) => campo !== undefined);

    if (!hayAlgunCampo) {
      respuestaError(res, 'Se debe enviar al menos un campo para actualizar', 400);
      return;
    }

    // Validar tipo si se envía
    if (tipo !== undefined && !TIPOS_VALIDOS.includes(tipo)) {
      respuestaError(res, `El tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`, 400);
      return;
    }

    // Construcción dinámica del SET
    const campos: string[] = [];
    const valores: unknown[] = [];
    let indice = 1;

    if (nombre !== undefined) {
      campos.push(`Nombre = $${indice++}`);
      valores.push(nombre);
    }
    if (descripcion !== undefined) {
      campos.push(`Descripcion = $${indice++}`);
      valores.push(descripcion);
    }
    if (tipo !== undefined) {
      campos.push(`Tipo = $${indice++}`);
      valores.push(tipo);
    }
    if (idRolRequerido !== undefined) {
      // Permite NULL explícito cuando idRolRequerido = null
      campos.push(`ID_Rol_Requerido = $${indice++}`);
      valores.push(idRolRequerido ?? null);
    }
    if (obligatorio !== undefined) {
      campos.push(`Obligatorio = $${indice++}`);
      valores.push(obligatorio);
    }
    if (activo !== undefined) {
      campos.push(`Activo = $${indice++}`);
      valores.push(activo);
    }

    valores.push(id);

    const resultado = await pool.query(`
      UPDATE Requisitos
      SET ${campos.join(', ')}
      WHERE ID_Requisito = $${indice}
      RETURNING
        ID_Requisito AS "idRequisito",
        Nombre AS "nombre",
        Descripcion AS "descripcion",
        Tipo AS "tipo",
        ID_Rol_Requerido AS "idRolRequerido",
        Obligatorio AS "obligatorio",
        Activo AS "activo"
    `, valores);

    if ((resultado.rowCount ?? 0) === 0) {
      respuestaError(res, 'Requisito no encontrado', 404);
      return;
    }

    respuestaExito(res, resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar requisito:', error);
    respuestaError(res, 'Error interno al actualizar el requisito', 500);
  }
};
