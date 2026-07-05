// src/controllers/lideresControlador.ts — Catálogo de Líderes Espirituales
// Esquema v5.1: tabla Personal_Lideres + Personas + Telefonos_Personas
import { Request, Response } from 'express';
import pool from '../config/db.js';

/**
 * GET /api/lideres
 * Lista todos los líderes activos con nombre, teléfono principal y conteo de supervisados.
 */
export const listarLideres = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT
        pl.ID_Lider                                      AS "idLider",
        p.ID_Persona                                     AS "idPersona",
        p.Nombres || ' ' || p.Apellidos                  AS "nombreCompleto",
        p.Nombres                                        AS "nombres",
        p.Apellidos                                      AS "apellidos",
        tp.Numero                                        AS "telefono",
        tp.Tiene_Whatsapp                                AS "tieneWhatsapp",
        COUNT(pii.ID_Persona)::INT                       AS "totalSupervisados"
      FROM Personal_Lideres pl
      JOIN Personas p ON pl.ID_Persona = p.ID_Persona
      LEFT JOIN Telefonos_Personas tp
             ON tp.ID_Persona = p.ID_Persona
            AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
      LEFT JOIN Personal_Info_Iglesia pii ON pii.ID_Lider = pl.ID_Lider
      WHERE pl.Activo = TRUE
      GROUP BY pl.ID_Lider, p.ID_Persona, p.Nombres, p.Apellidos, tp.Numero, tp.Tiene_Whatsapp
      ORDER BY p.Apellidos, p.Nombres
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al listar líderes:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/lideres/:id
 * Detalle de un líder con la lista de sus supervisados actuales.
 */
export const obtenerLider = async (req: Request, res: Response): Promise<void> => {
  const idLider = Number(req.params.id);
  if (!Number.isInteger(idLider) || idLider <= 0) {
    res.status(400).json({ exito: false, mensaje: 'ID de líder inválido.' });
    return;
  }

  try {
    const liderRes = await pool.query(`
      SELECT
        pl.ID_Lider                                      AS "idLider",
        p.ID_Persona                                     AS "idPersona",
        p.Nombres || ' ' || p.Apellidos                  AS "nombreCompleto",
        tp.Numero                                        AS "telefono",
        tp.Tiene_Whatsapp                                AS "tieneWhatsapp"
      FROM Personal_Lideres pl
      JOIN Personas p ON pl.ID_Persona = p.ID_Persona
      LEFT JOIN Telefonos_Personas tp
             ON tp.ID_Persona = p.ID_Persona
            AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
      WHERE pl.ID_Lider = $1 AND pl.Activo = TRUE
    `, [idLider]);

    if ((liderRes.rowCount ?? 0) === 0) {
      res.status(404).json({ exito: false, mensaje: 'Líder no encontrado.' });
      return;
    }

    const supervisadosRes = await pool.query(`
      SELECT
        ps.ID_Persona                                    AS "idPersona",
        p.Nombres || ' ' || p.Apellidos                  AS "nombreCompleto",
        r.Nombre_Rol                                     AS "rol",
        tp.Numero                                        AS "telefono"
      FROM Personal_Info_Iglesia pii
      JOIN Personal_Sistema ps ON pii.ID_Persona = ps.ID_Persona
      JOIN Personas p           ON ps.ID_Persona  = p.ID_Persona
      JOIN Roles r              ON ps.ID_Rol      = r.ID_Rol
      LEFT JOIN Telefonos_Personas tp
             ON tp.ID_Persona = ps.ID_Persona
            AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
      WHERE pii.ID_Lider = $1
        AND ps.Activo = TRUE
      ORDER BY p.Apellidos, p.Nombres
    `, [idLider]);

    res.json({
      exito: true,
      datos: { ...liderRes.rows[0], supervisados: supervisadosRes.rows },
    });
  } catch (err) {
    console.error('Error al obtener líder:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/lideres
 * Registra a una persona como líder.
 * Body: { idPersona } o { nombres, apellidos, telefono }
 */
export const crearLider = async (req: Request, res: Response): Promise<void> => {
  const { idPersona, nombres, apellidos, telefono } = req.body;

  if (!idPersona && (!nombres || !apellidos)) {
    res.status(400).json({ 
      exito: false, 
      mensaje: 'Debe proporcionar idPersona o en su defecto nombres y apellidos para crear un líder.' 
    });
    return;
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    let targetIdPersona = idPersona;

    if (targetIdPersona) {
      // Caso 1: Persona existente
      // Verificar que la persona existe en la tabla Personas
      const existeRes = await cliente.query(
        `SELECT 1 FROM Personas WHERE ID_Persona = $1`,
        [targetIdPersona]
      );
      if ((existeRes.rowCount ?? 0) === 0) {
        await cliente.query('ROLLBACK');
        res.status(404).json({ exito: false, mensaje: 'La persona especificada no existe.' });
        return;
      }
    } else {
      // Caso 2: Crear nueva persona
      const insertPersonaRes = await cliente.query(
        `INSERT INTO Personas (Nombres, Apellidos, Telefono)
         VALUES ($1, $2, $3)
         RETURNING ID_Persona AS "idPersona"`,
        [nombres.trim(), apellidos.trim(), telefono ? telefono.trim() : null]
      );
      targetIdPersona = insertPersonaRes.rows[0].idPersona;

      // Si se especificó un teléfono, también guardarlo en Telefonos_Personas para el listado
      if (telefono && telefono.trim() !== '') {
        await cliente.query(
          `INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Tiene_Whatsapp, Es_Principal, Activo)
           VALUES ($1, 'Otro'::tipo_telefono, $2, FALSE, TRUE, TRUE)`,
          [targetIdPersona, telefono.trim()]
        );
      }
    }

    // Insertar o activar en Personal_Lideres
    const { rows } = await cliente.query(`
      INSERT INTO Personal_Lideres (ID_Persona, Activo)
      VALUES ($1, TRUE)
      ON CONFLICT (ID_Persona) DO UPDATE SET Activo = TRUE
      RETURNING ID_Lider AS "idLider", ID_Persona AS "idPersona"
    `, [targetIdPersona]);

    await cliente.query('COMMIT');
    res.status(201).json({ 
      exito: true, 
      datos: rows[0], 
      mensaje: 'Líder registrado exitosamente.' 
    });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error('Error al crear líder:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  } finally {
    cliente.release();
  }
};


/**
 * PATCH /api/lideres/:id/inactivar
 * Inactiva un líder (soft delete). Los supervisados quedan sin líder asignado.
 */
export const inactivarLider = async (req: Request, res: Response): Promise<void> => {
  const idLider = Number(req.params.id);
  if (!Number.isInteger(idLider) || idLider <= 0) {
    res.status(400).json({ exito: false, mensaje: 'ID de líder inválido.' });
    return;
  }

  try {
    const { rowCount } = await pool.query(
      `UPDATE Personal_Lideres SET Activo = FALSE WHERE ID_Lider = $1 AND Activo = TRUE`,
      [idLider]
    );

    if ((rowCount ?? 0) === 0) {
      res.status(404).json({ exito: false, mensaje: 'Líder no encontrado o ya inactivo.' });
      return;
    }

    res.json({ exito: true, mensaje: 'Líder inactivado correctamente.' });
  } catch (err) {
    console.error('Error al inactivar líder:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};
