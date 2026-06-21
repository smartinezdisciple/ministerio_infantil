import { Request, Response } from 'express';
import pool from '../config/db.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

/**
 * GET /api/personas
 * Lista todas las personas en el sistema con flags de sus roles.
 */
export const listarPersonas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT 
        p.ID_Persona                                     AS "idPersona",
        p.Nombres                                        AS "nombres",
        p.Apellidos                                      AS "apellidos",
        p.Telefono                                       AS "telefono",
        p.Sexo                                           AS "sexo",
        p.Cedula                                         AS "cedula",
        p.Fecha_Nacimiento                               AS "fechaNacimiento",
        (pl.ID_Lider IS NOT NULL AND pl.Activo = TRUE)   AS "esLider",
        (t.ID_Persona IS NOT NULL)                       AS "esTutor",
        t.Tipo_Tutor                                     AS "tipoTutor",
        (ps.ID_Persona IS NOT NULL AND ps.Activo = TRUE) AS "esPersonal",
        r.Nombre_Rol                                     AS "rolSistema"
      FROM Personas p
      LEFT JOIN Personal_Lideres pl ON p.ID_Persona = pl.ID_Persona
      LEFT JOIN Tutores t ON p.ID_Persona = t.ID_Persona
      LEFT JOIN Personal_Sistema ps ON p.ID_Persona = ps.ID_Persona
      LEFT JOIN Roles r ON ps.ID_Rol = r.ID_Rol
      ORDER BY p.Apellidos, p.Nombres
    `;
    const { rows } = await pool.query(query);
    respuestaExito(res, rows);
  } catch (error) {
    console.error('Error al listar personas:', error);
    respuestaError(res, 'Error interno del servidor al listar personas.', 500);
  }
};

/**
 * POST /api/personas
 * Crea una persona nueva.
 */
export const crearPersona = async (req: Request, res: Response): Promise<void> => {
  const { nombres, apellidos, telefono, sexo, cedula, fechaNacimiento } = req.body;

  if (!nombres || !apellidos) {
    respuestaError(res, 'Nombres y apellidos son obligatorios.', 400);
    return;
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const insertPersona = await cliente.query(
      `INSERT INTO Personas (Nombres, Apellidos, Telefono, Sexo, Cedula, Fecha_Nacimiento)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ID_Persona AS "idPersona"`,
      [
        nombres.trim(),
        apellidos.trim(),
        telefono ? telefono.trim() : null,
        sexo ? sexo : null,
        cedula ? cedula.trim() : null,
        fechaNacimiento ? fechaNacimiento : null
      ]
    );

    const idPersona = insertPersona.rows[0].idPersona;

    if (telefono && telefono.trim() !== '') {
      await cliente.query(
        `INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Tiene_Whatsapp, Es_Principal, Activo)
         VALUES ($1, 'Otro'::tipo_telefono, $2, FALSE, TRUE, TRUE)`,
        [idPersona, telefono.trim()]
      );
    }

    await cliente.query('COMMIT');
    respuestaExito(res, { idPersona, nombres, apellidos, telefono }, 201);
  } catch (error) {
    await cliente.query('ROLLBACK');
    console.error('Error al crear persona:', error);
    respuestaError(res, 'Error interno al crear persona.', 500);
  } finally {
    cliente.release();
  }
};

/**
 * PUT /api/personas/:id
 * Actualiza los datos de una persona.
 */
export const actualizarPersona = async (req: Request, res: Response): Promise<void> => {
  const idPersona = Number(req.params.id);
  const { nombres, apellidos, telefono, sexo, cedula, fechaNacimiento } = req.body;

  if (!idPersona || !nombres || !apellidos) {
    respuestaError(res, 'ID de persona, nombres y apellidos son obligatorios.', 400);
    return;
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // Verificar si la persona existe
    const existCheck = await cliente.query(`SELECT 1 FROM Personas WHERE ID_Persona = $1`, [idPersona]);
    if (existCheck.rowCount === 0) {
      await cliente.query('ROLLBACK');
      respuestaError(res, 'Persona no encontrada.', 404);
      return;
    }

    await cliente.query(
      `UPDATE Personas 
       SET Nombres = $1, Apellidos = $2, Telefono = $3, Sexo = $4, Cedula = $5, Fecha_Nacimiento = $6, actualizado_en = NOW()
       WHERE ID_Persona = $7`,
      [
        nombres.trim(),
        apellidos.trim(),
        telefono ? telefono.trim() : null,
        sexo ? sexo : null,
        cedula ? cedula.trim() : null,
        fechaNacimiento ? fechaNacimiento : null,
        idPersona
      ]
    );

    // Actualizar o insertar teléfono principal en Telefonos_Personas
    if (telefono && telefono.trim() !== '') {
      // 1. Desmarcar todos los teléfonos existentes de esta persona como principales
      await cliente.query(
        `UPDATE Telefonos_Personas 
         SET Es_Principal = FALSE
         WHERE ID_Persona = $1`,
        [idPersona]
      );

      // 2. Verificar si el número ya existe para esta persona
      const phoneExists = await cliente.query(
        `SELECT ID_Telefono FROM Telefonos_Personas WHERE ID_Persona = $1 AND Numero = $2`,
        [idPersona, telefono.trim()]
      );

      if (phoneExists.rowCount && phoneExists.rowCount > 0) {
        // 3a. Reactivar y marcar como principal el existente
        await cliente.query(
          `UPDATE Telefonos_Personas 
           SET Activo = TRUE, Es_Principal = TRUE 
           WHERE ID_Persona = $1 AND Numero = $2`,
          [idPersona, telefono.trim()]
        );
      } else {
        // 3b. Insertar nuevo número principal
        await cliente.query(
          `INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Tiene_Whatsapp, Es_Principal, Activo)
           VALUES ($1, 'Otro'::tipo_telefono, $2, FALSE, TRUE, TRUE)`,
          [idPersona, telefono.trim()]
        );
      }
    }

    await cliente.query('COMMIT');
    respuestaExito(res, { idPersona, nombres, apellidos, telefono });
  } catch (error) {
    await cliente.query('ROLLBACK');
    console.error('Error al actualizar persona:', error);
    respuestaError(res, 'Error interno al actualizar persona.', 500);
  } finally {
    cliente.release();
  }
};

/**
 * PATCH /api/personas/:id/roles
 * Asigna o revoca los roles funcionales de Tutor y Líder.
 */
export const asignarRolesPersona = async (req: Request, res: Response): Promise<void> => {
  const idPersona = Number(req.params.id);
  const { esLider, esTutor, tipoTutor } = req.body;

  if (esLider === undefined || esTutor === undefined) {
    respuestaError(res, 'Los campos esLider y esTutor son obligatorios.', 400);
    return;
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // Verificar si la persona existe
    const existCheck = await cliente.query(`SELECT 1 FROM Personas WHERE ID_Persona = $1`, [idPersona]);
    if (existCheck.rowCount === 0) {
      await cliente.query('ROLLBACK');
      respuestaError(res, 'Persona no encontrada.', 404);
      return;
    }

    // ── 1. Manejo del rol de Líder ────────────────────────────
    if (esLider) {
      await cliente.query(
        `INSERT INTO Personal_Lideres (ID_Persona, Activo)
         VALUES ($1, TRUE)
         ON CONFLICT (ID_Persona) DO UPDATE SET Activo = TRUE`,
        [idPersona]
      );
    } else {
      await cliente.query(
        `UPDATE Personal_Lideres SET Activo = FALSE WHERE ID_Persona = $1`,
        [idPersona]
      );
    }

    // ── 2. Manejo del rol de Tutor ────────────────────────────
    if (esTutor) {
      await cliente.query(
        `INSERT INTO Tutores (ID_Persona, Tipo_Tutor)
         VALUES ($1, $2)
         ON CONFLICT (ID_Persona) DO UPDATE SET Tipo_Tutor = EXCLUDED.Tipo_Tutor`,
        [idPersona, tipoTutor || 'Otros']
      );
    } else {
      // Si se quiere quitar el rol de tutor, validar que no tenga niños vinculados
      const vinculados = await cliente.query(
        `SELECT 1 FROM Tutores_Ninos WHERE ID_Tutor = $1`,
        [idPersona]
      );
      if (vinculados.rowCount && vinculados.rowCount > 0) {
        await cliente.query('ROLLBACK');
        respuestaError(res, 'No se puede remover el rol de tutor porque esta persona está vinculada a uno o más niños en el sistema.', 400);
        return;
      }

      await cliente.query(`DELETE FROM Tutores WHERE ID_Persona = $1`, [idPersona]);
    }

    await cliente.query('COMMIT');
    respuestaExito(res, { mensaje: 'Roles asignados correctamente.' });
  } catch (error) {
    await cliente.query('ROLLBACK');
    console.error('Error al asignar roles:', error);
    respuestaError(res, 'Error interno del servidor al asignar roles.', 500);
  } finally {
    cliente.release();
  }
};
