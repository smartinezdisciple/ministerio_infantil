// src/controllers/contactosControlador.ts — Directorio de contactos y ficha por niño
// Esquema v4: Tutores + Tutores_Ninos unifican padres, autorizados y tutores temporales
import { Request, Response } from 'express';
import pool from '../config/db.js';

/**
 * GET /api/contactos
 * Lista todos los tutores con sus niños asociados.
 * Un contacto está "activo hoy" si alguno de sus niños está presente en Asistencia_Ninos.
 */
export const listarContactos = async (_req: Request, res: Response) => {
  const hoy = new Date().toISOString().split('T')[0];

  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT
        p.ID_Persona                                   AS "idPersona",
        p.Nombres                                      AS "nombres",
        p.Apellidos                                    AS "apellidos",
        tp.Numero                                      AS "telefono",
        tp.Tiene_Whatsapp                              AS "tieneWhatsapp",
        t.Tipo_Tutor                                   AS "tipo",
        EXISTS (
          SELECT 1 FROM Tutores_Ninos tn2
          JOIN   Asistencia_Ninos an ON an.ID_Nino = tn2.ID_Nino
          WHERE  tn2.ID_Tutor = p.ID_Persona
            AND  an.Fecha     = $1
            AND  an.Hora_Salida IS NULL
        )                                              AS "activoHoy"
      FROM Tutores    t
      JOIN Personas   p ON p.ID_Persona = t.ID_Persona
      LEFT JOIN Telefonos_Personas tp
             ON tp.ID_Persona = p.ID_Persona
            AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
      ORDER BY "activoHoy" DESC, p.Apellidos
    `, [hoy]);

    if (rows.length === 0) return res.json({ exito: true, datos: [] });

    // Niños de cada tutor — DISTINCT ON para evitar duplicados cuando un niño
    // tiene múltiples registros históricos en Ninos_Grupos.
    const idsContactos = rows.map((c: { idPersona: number }) => c.idPersona);
    const { rows: ninosRows } = await pool.query(`
      SELECT DISTINCT ON (tn.ID_Tutor, p.ID_Persona)
        tn.ID_Tutor                                    AS "idContacto",
        p.ID_Persona                                   AS "idPersona",
        CONCAT(p.Nombres, ' ', p.Apellidos)            AS "nombreCompleto",
        g.Nombre                                       AS "grupo"
      FROM Tutores_Ninos tn
      JOIN Personas p ON p.ID_Persona = tn.ID_Nino
      LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino = tn.ID_Nino
      LEFT JOIN Grupos       g  ON g.ID_Grupo = ng.ID_Grupo
      WHERE tn.ID_Tutor = ANY($1)
      ORDER BY tn.ID_Tutor, p.ID_Persona
    `, [idsContactos]);

    const ninosPorContacto: Record<number, object[]> = {};
    for (const n of ninosRows as { idContacto: number }[]) {
      if (!ninosPorContacto[n.idContacto]) ninosPorContacto[n.idContacto] = [];
      ninosPorContacto[n.idContacto].push(n);
    }

    const resultado = rows.map((c: { idPersona: number }) => ({
      ...c,
      ninos: ninosPorContacto[c.idPersona] ?? [],
    }));

    res.json({ exito: true, datos: resultado });
  } catch (err) {
    console.error('Error al listar contactos:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/ninos/:id/contactos
 * Ficha completa de un niño: datos, alertas médicas y tutores.
 */
export const fichaContactoNino = async (req: Request, res: Response) => {
  const idNino = Number(req.params.id);
  if (!idNino) return res.status(400).json({ exito: false, mensaje: 'ID de niño inválido.' });

  try {
    // Datos del niño
    const ninoRes = await pool.query(`
      SELECT
        p.ID_Persona                                   AS "idPersona",
        p.Nombres                                      AS "nombres",
        p.Apellidos                                    AS "apellidos",
        CONCAT(p.Nombres, ' ', p.Apellidos)            AS "nombreCompleto",
        p.Fecha_Nacimiento                             AS "fechaNacimiento",
        ni.Observaciones_Generales                     AS "observacionesGenerales",
        g.ID_Grupo                                     AS "idGrupo",
        g.Nombre                                       AS "nombreGrupo",
        g.Edad_Minima                                  AS "edadMinima",
        g.Edad_Maxima                                  AS "edadMaxima"
      FROM   Ninos      ni
      JOIN   Personas   p  ON p.ID_Persona = ni.ID_Persona
      LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino   = ni.ID_Persona
      LEFT JOIN Grupos       g  ON g.ID_Grupo   = ng.ID_Grupo
      WHERE  ni.ID_Persona = $1
    `, [idNino]);

    if ((ninoRes.rowCount ?? 0) === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Niño no encontrado.' });
    }

    const r = ninoRes.rows[0];
    const nino = {
      idPersona:             r.idPersona,
      nombres:               r.nombres,
      apellidos:             r.apellidos,
      nombreCompleto:        r.nombreCompleto,
      fechaNacimiento:       r.fechaNacimiento,
      observacionesGenerales: r.observacionesGenerales,
      grupo: { idGrupo: r.idGrupo, nombre: r.nombreGrupo, edadMinima: r.edadMinima, edadMaxima: r.edadMaxima },
      alertasMedicas: [] as object[],
    };

    // Alertas médicas
    const alertasRes = await pool.query(`
      SELECT ID_Info       AS "idInfo",
             Tipo          AS "tipo",
             Descripcion   AS "descripcion",
             Severidad     AS "severidad",
             Instrucciones AS "instrucciones"
      FROM   Info_Medica_Ninos
      WHERE  ID_Nino = $1
      ORDER BY
        CASE Tipo WHEN 'Condicion' THEN 1 WHEN 'Alergia' THEN 2 ELSE 3 END,
        CASE Severidad WHEN 'Alta' THEN 1 WHEN 'Moderada' THEN 2 ELSE 3 END
    `, [idNino]);
    nino.alertasMedicas = alertasRes.rows;

    // Tutores registrados
    const tutoresRes = await pool.query(`
      SELECT p.ID_Persona AS "idPersona",
             p.Nombres     AS "nombres",
             p.Apellidos   AS "apellidos",
             tp.Numero     AS "telefono",
             tp.Tiene_Whatsapp AS "tieneWhatsapp",
             t.Tipo_Tutor  AS "parentesco",
             'tutor'       AS "tipo",
             true          AS "activo"
      FROM   Tutores_Ninos tn
      JOIN   Tutores t ON t.ID_Persona = tn.ID_Tutor
      JOIN   Personas p ON p.ID_Persona = t.ID_Persona
      LEFT JOIN Telefonos_Personas tp
             ON tp.ID_Persona = p.ID_Persona
            AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
      WHERE  tn.ID_Nino = $1
    `, [idNino]);

    res.json({
      exito: true,
      datos: {
        nino,
        tutores: tutoresRes.rows,
      },
    });
  } catch (err) {
    console.error('Error al obtener ficha de contacto:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};
