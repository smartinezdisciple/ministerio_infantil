// src/controllers/telefonosDireccionesControlador.ts — CRUD normalizado de teléfonos y direcciones
// Esquema v5.1: Telefonos_Personas + Personas_Direcciones
import { Request, Response } from 'express';
import pool from '../config/db.js';

// ─── TELÉFONOS ────────────────────────────────────────────────────────────────

/**
 * GET /api/personas/:id/telefonos
 * Lista todos los teléfonos activos de una persona.
 */
export const listarTelefonos = async (req: Request, res: Response): Promise<void> => {
  const idPersona = Number(req.params.id);
  if (!Number.isInteger(idPersona) || idPersona <= 0) {
    res.status(400).json({ exito: false, mensaje: 'ID inválido.' });
    return;
  }
  try {
    const { rows } = await pool.query(`
      SELECT
        ID_Telefono    AS "idTelefono",
        Tipo           AS "tipo",
        Numero         AS "numero",
        Tiene_Whatsapp AS "tieneWhatsapp",
        Es_Principal   AS "esPrincipal"
      FROM Telefonos_Personas
      WHERE ID_Persona = $1 AND Activo = TRUE
      ORDER BY Es_Principal DESC, ID_Telefono ASC
    `, [idPersona]);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al listar teléfonos:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  }
};

/**
 * POST /api/personas/:id/telefonos
 * Agrega un teléfono. Si es esPrincipal=true, el índice único lo gestiona la BD.
 * Body: { tipo?, numero, tieneWhatsapp?, esPrincipal? }
 */
export const agregarTelefono = async (req: Request, res: Response): Promise<void> => {
  const idPersona = Number(req.params.id);
  if (!Number.isInteger(idPersona) || idPersona <= 0) {
    res.status(400).json({ exito: false, mensaje: 'ID inválido.' });
    return;
  }

  const { tipo, numero, tieneWhatsapp, esPrincipal } = req.body;
  if (!numero || String(numero).trim() === '') {
    res.status(400).json({ exito: false, mensaje: 'El campo numero es obligatorio.' });
    return;
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // Si este va a ser el principal, desmarcar el anterior
    if (esPrincipal) {
      await cliente.query(
        `UPDATE Telefonos_Personas SET Es_Principal = FALSE WHERE ID_Persona = $1 AND Es_Principal = TRUE`,
        [idPersona]
      );
    }

    const { rows } = await cliente.query(`
      INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Tiene_Whatsapp, Es_Principal)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        ID_Telefono    AS "idTelefono",
        Tipo           AS "tipo",
        Numero         AS "numero",
        Tiene_Whatsapp AS "tieneWhatsapp",
        Es_Principal   AS "esPrincipal"
    `, [idPersona, tipo ?? 'Otro', numero.trim(), tieneWhatsapp ?? false, esPrincipal ?? false]);

    await cliente.query('COMMIT');
    res.status(201).json({ exito: true, datos: rows[0] });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error('Error al agregar teléfono:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  } finally {
    cliente.release();
  }
};

/**
 * PATCH /api/personas/:id/telefonos/:idTel
 * Edita tipo, número, whatsapp o marca como principal.
 * Body: { tipo?, numero?, tieneWhatsapp?, esPrincipal? }
 */
export const editarTelefono = async (req: Request, res: Response): Promise<void> => {
  const idPersona = Number(req.params.id);
  const idTelefono = Number(req.params.idTel);

  const { tipo, numero, tieneWhatsapp, esPrincipal } = req.body;
  const campos: string[] = [];
  const valores: unknown[] = [];

  if (tipo         !== undefined) { campos.push(`Tipo = $${campos.length + 1}`);           valores.push(tipo); }
  if (numero       !== undefined) { campos.push(`Numero = $${campos.length + 1}`);         valores.push(String(numero).trim()); }
  if (tieneWhatsapp !== undefined) { campos.push(`Tiene_Whatsapp = $${campos.length + 1}`); valores.push(tieneWhatsapp); }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    if (esPrincipal === true) {
      // Desmarcar el anterior principal antes de marcar el nuevo
      await cliente.query(
        `UPDATE Telefonos_Personas SET Es_Principal = FALSE WHERE ID_Persona = $1 AND ID_Telefono != $2 AND Es_Principal = TRUE`,
        [idPersona, idTelefono]
      );
      campos.push(`Es_Principal = $${campos.length + 1}`);
      valores.push(true);
    }

    if (campos.length === 0) {
      await cliente.query('ROLLBACK');
      res.status(400).json({ exito: false, mensaje: 'Se debe enviar al menos un campo para actualizar.' });
      return;
    }

    valores.push(idTelefono, idPersona);
    const { rowCount, rows } = await cliente.query(`
      UPDATE Telefonos_Personas SET ${campos.join(', ')}
      WHERE ID_Telefono = $${valores.length - 1} AND ID_Persona = $${valores.length} AND Activo = TRUE
      RETURNING
        ID_Telefono    AS "idTelefono",
        Tipo           AS "tipo",
        Numero         AS "numero",
        Tiene_Whatsapp AS "tieneWhatsapp",
        Es_Principal   AS "esPrincipal"
    `, valores);

    if ((rowCount ?? 0) === 0) {
      await cliente.query('ROLLBACK');
      res.status(404).json({ exito: false, mensaje: 'Teléfono no encontrado.' });
      return;
    }

    await cliente.query('COMMIT');
    res.json({ exito: true, datos: rows[0] });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error('Error al editar teléfono:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  } finally {
    cliente.release();
  }
};

/**
 * DELETE /api/personas/:id/telefonos/:idTel
 * Soft Delete: Activo = FALSE.
 */
export const eliminarTelefono = async (req: Request, res: Response): Promise<void> => {
  const idPersona  = Number(req.params.id);
  const idTelefono = Number(req.params.idTel);
  try {
    const { rowCount } = await pool.query(
      `UPDATE Telefonos_Personas SET Activo = FALSE WHERE ID_Telefono = $1 AND ID_Persona = $2 AND Activo = TRUE`,
      [idTelefono, idPersona]
    );
    if ((rowCount ?? 0) === 0) {
      res.status(404).json({ exito: false, mensaje: 'Teléfono no encontrado.' });
      return;
    }
    res.json({ exito: true, mensaje: 'Teléfono eliminado.' });
  } catch (err) {
    console.error('Error al eliminar teléfono:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  }
};


// ─── DIRECCIONES ─────────────────────────────────────────────────────────────

/**
 * GET /api/personas/:id/direcciones
 * Lista todas las direcciones activas de una persona.
 */
export const listarDirecciones = async (req: Request, res: Response): Promise<void> => {
  const idPersona = Number(req.params.id);
  if (!Number.isInteger(idPersona) || idPersona <= 0) {
    res.status(400).json({ exito: false, mensaje: 'ID inválido.' });
    return;
  }
  try {
    const { rows } = await pool.query(`
      SELECT
        ID_Direccion        AS "idDireccion",
        Tipo_Direccion      AS "tipoDireccion",
        Ciudad_Departamento AS "ciudadDepartamento",
        Municipio           AS "municipio",
        Distrito            AS "distrito",
        Barrio              AS "barrio",
        Direccion_Exacta    AS "direccionExacta",
        Es_Principal        AS "esPrincipal"
      FROM Personas_Direcciones
      WHERE ID_Persona = $1 AND Activo = TRUE
      ORDER BY Es_Principal DESC, ID_Direccion ASC
    `, [idPersona]);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al listar direcciones:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  }
};

/**
 * POST /api/personas/:id/direcciones
 * Agrega una dirección estructurada.
 * Body: { tipoDireccion?, ciudadDepartamento?, municipio?, distrito?, barrio?, direccionExacta, esPrincipal? }
 */
export const agregarDireccion = async (req: Request, res: Response): Promise<void> => {
  const idPersona = Number(req.params.id);
  if (!Number.isInteger(idPersona) || idPersona <= 0) {
    res.status(400).json({ exito: false, mensaje: 'ID inválido.' });
    return;
  }

  const { tipoDireccion, ciudadDepartamento, municipio, distrito, barrio, direccionExacta, esPrincipal } = req.body;

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    if (esPrincipal) {
      await cliente.query(
        `UPDATE Personas_Direcciones SET Es_Principal = FALSE WHERE ID_Persona = $1 AND Es_Principal = TRUE`,
        [idPersona]
      );
    }

    const { rows } = await cliente.query(`
      INSERT INTO Personas_Direcciones
        (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        ID_Direccion        AS "idDireccion",
        Tipo_Direccion      AS "tipoDireccion",
        Ciudad_Departamento AS "ciudadDepartamento",
        Municipio           AS "municipio",
        Distrito            AS "distrito",
        Barrio              AS "barrio",
        Direccion_Exacta    AS "direccionExacta",
        Es_Principal        AS "esPrincipal"
    `, [
      idPersona,
      tipoDireccion ?? 'Residencial',
      ciudadDepartamento ?? null,
      municipio ?? null,
      distrito ?? null,
      barrio ?? null,
      direccionExacta ?? null,
      esPrincipal ?? false,
    ]);

    await cliente.query('COMMIT');
    res.status(201).json({ exito: true, datos: rows[0] });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error('Error al agregar dirección:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  } finally {
    cliente.release();
  }
};

/**
 * PATCH /api/personas/:id/direcciones/:idDir
 * Edita una dirección existente.
 */
export const editarDireccion = async (req: Request, res: Response): Promise<void> => {
  const idPersona   = Number(req.params.id);
  const idDireccion = Number(req.params.idDir);

  const { tipoDireccion, ciudadDepartamento, municipio, distrito, barrio, direccionExacta, esPrincipal } = req.body;
  const campos: string[] = [];
  const valores: unknown[] = [];

  if (tipoDireccion      !== undefined) { campos.push(`Tipo_Direccion = $${campos.length + 1}`);       valores.push(tipoDireccion); }
  if (ciudadDepartamento !== undefined) { campos.push(`Ciudad_Departamento = $${campos.length + 1}`);  valores.push(ciudadDepartamento); }
  if (municipio          !== undefined) { campos.push(`Municipio = $${campos.length + 1}`);            valores.push(municipio); }
  if (distrito           !== undefined) { campos.push(`Distrito = $${campos.length + 1}`);             valores.push(distrito); }
  if (barrio             !== undefined) { campos.push(`Barrio = $${campos.length + 1}`);               valores.push(barrio); }
  if (direccionExacta    !== undefined) { campos.push(`Direccion_Exacta = $${campos.length + 1}`);     valores.push(direccionExacta); }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    if (esPrincipal === true) {
      await cliente.query(
        `UPDATE Personas_Direcciones SET Es_Principal = FALSE WHERE ID_Persona = $1 AND ID_Direccion != $2 AND Es_Principal = TRUE`,
        [idPersona, idDireccion]
      );
      campos.push(`Es_Principal = $${campos.length + 1}`);
      valores.push(true);
    }

    if (campos.length === 0) {
      await cliente.query('ROLLBACK');
      res.status(400).json({ exito: false, mensaje: 'Se debe enviar al menos un campo para actualizar.' });
      return;
    }

    valores.push(idDireccion, idPersona);
    const { rowCount, rows } = await cliente.query(`
      UPDATE Personas_Direcciones SET ${campos.join(', ')}
      WHERE ID_Direccion = $${valores.length - 1} AND ID_Persona = $${valores.length} AND Activo = TRUE
      RETURNING
        ID_Direccion        AS "idDireccion",
        Tipo_Direccion      AS "tipoDireccion",
        Ciudad_Departamento AS "ciudadDepartamento",
        Municipio           AS "municipio",
        Distrito            AS "distrito",
        Barrio              AS "barrio",
        Direccion_Exacta    AS "direccionExacta",
        Es_Principal        AS "esPrincipal"
    `, valores);

    if ((rowCount ?? 0) === 0) {
      await cliente.query('ROLLBACK');
      res.status(404).json({ exito: false, mensaje: 'Dirección no encontrada.' });
      return;
    }

    await cliente.query('COMMIT');
    res.json({ exito: true, datos: rows[0] });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error('Error al editar dirección:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  } finally {
    cliente.release();
  }
};

/**
 * DELETE /api/personas/:id/direcciones/:idDir
 * Soft Delete: Activo = FALSE.
 */
export const eliminarDireccion = async (req: Request, res: Response): Promise<void> => {
  const idPersona   = Number(req.params.id);
  const idDireccion = Number(req.params.idDir);
  try {
    const { rowCount } = await pool.query(
      `UPDATE Personas_Direcciones SET Activo = FALSE WHERE ID_Direccion = $1 AND ID_Persona = $2 AND Activo = TRUE`,
      [idDireccion, idPersona]
    );
    if ((rowCount ?? 0) === 0) {
      res.status(404).json({ exito: false, mensaje: 'Dirección no encontrada.' });
      return;
    }
    res.json({ exito: true, mensaje: 'Dirección eliminada.' });
  } catch (err) {
    console.error('Error al eliminar dirección:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  }
};
