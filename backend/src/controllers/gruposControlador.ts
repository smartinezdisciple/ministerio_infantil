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

/**
 * GET /api/grupos/turnos-hoy
 * Turnos que tienen al menos un check-in registrado hoy.
 * Usados por el Coordinador General para elegir qué turno visualizar.
 */
export const turnosDisponiblesHoy = async (_req: Request, res: Response) => {
  const ahora = new Date();
  const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT
        t.ID_Turno                              AS "idTurno",
        t.Nombre                                AS "nombre",
        t.Dia_Semana                            AS "diaSemana",
        to_char(t.Hora_Inicio, 'HH24:MI')      AS "horaInicio"
      FROM Asistencia_Ninos an
      JOIN Turnos t ON t.ID_Turno = an.ID_Turno
      WHERE an.Fecha = $1
      ORDER BY t.Hora_Inicio
    `, [hoy]);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al listar turnos disponibles hoy:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/grupos/:id/asistencia-hoy?idTurno=<id>
 * Niños que hicieron check-in en el grupo hoy, filtrado por turno.
 * Solo muestra check-ins reales (INNER JOIN en Asistencia_Ninos).
 */
export const asistenciaGrupoHoy = async (req: Request, res: Response) => {
  const idGrupo = Number(req.params.id);
  const idTurno = req.query.idTurno as string | undefined;

  if (!idGrupo) {
    return res.status(400).json({ exito: false, mensaje: 'ID de grupo inválido.' });
  }

  const ahora = new Date();
  const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;

  try {
    const params: (string | number)[] = [idGrupo, hoy];
    let filtroTurno = '';
    if (idTurno) {
      params.push(Number(idTurno));
      filtroTurno = `AND an.ID_Turno = $${params.length}`;
    }

    const { rows } = await pool.query(`
      SELECT
        p.ID_Persona                                 AS "idPersona",
        p.Nombres                                    AS "nombres",
        p.Apellidos                                  AS "apellidos",
        CONCAT(p.Nombres, ' ', p.Apellidos)          AS "nombreCompleto",
        p.Fecha_Nacimiento                           AS "fechaNacimiento",
        ni.Observaciones_Generales                   AS "observacionesGenerales",
        g.ID_Grupo                                   AS "idGrupo",
        g.Nombre                                     AS "nombreGrupo",
        g.Edad_Minima                                AS "edadMinima",
        g.Edad_Maxima                                AS "edadMaxima",
        an.ID_Asistencia                             AS "idAsistencia",
        an.ID_Turno                                  AS "idTurno",
        t.Nombre                                     AS "turno",
        an.Estado                                    AS "estado",
        to_char(an.Hora_Entrada, 'HH12:MI AM')      AS "horaEntrada",
        to_char(an.Hora_Salida,  'HH12:MI AM')      AS "horaSalida"
      FROM Personas p
      JOIN Ninos ni ON ni.ID_Persona = p.ID_Persona
      JOIN Asistencia_Ninos an
        ON  an.ID_Nino           = p.ID_Persona
        AND an.Fecha             = $2
        AND an.ID_Grupo_Asistido = $1
        ${filtroTurno}
      JOIN Grupos g  ON g.ID_Grupo  = an.ID_Grupo_Asistido
      JOIN Turnos t  ON t.ID_Turno  = an.ID_Turno
      ORDER BY p.Apellidos, p.Nombres
    `, params);

    if (rows.length === 0) {
      return res.json({ exito: true, datos: [] });
    }

    // Alertas médicas en lote
    const idsPersonas = rows.map((r: { idPersona: number }) => r.idPersona);
    const { rows: alertaRows } = await pool.query(`
      SELECT im.ID_Info       AS "idInfo",
             im.ID_Nino       AS "idPersona",
             im.Tipo          AS "tipo",
             im.Descripcion   AS "descripcion",
             im.Severidad     AS "severidad",
             im.Instrucciones AS "instrucciones"
      FROM   Info_Medica_Ninos im
      WHERE  im.ID_Nino = ANY($1)
      ORDER BY
        CASE im.Severidad WHEN 'Alta' THEN 1 WHEN 'Moderada' THEN 2 ELSE 3 END
    `, [idsPersonas]);

    const alertasPorNino: Record<number, object[]> = {};
    for (const a of alertaRows as { idPersona: number }[]) {
      if (!alertasPorNino[a.idPersona]) alertasPorNino[a.idPersona] = [];
      alertasPorNino[a.idPersona].push(a);
    }

    const resultado = rows.map((r: {
      idPersona: number; nombres: string; apellidos: string; nombreCompleto: string;
      fechaNacimiento: string; observacionesGenerales?: string;
      idGrupo: number; nombreGrupo: string; edadMinima: number; edadMaxima: number;
      idAsistencia: number; idTurno: number; turno: string;
      estado: string; horaEntrada: string; horaSalida?: string;
    }) => ({
      nino: {
        idPersona:              r.idPersona,
        nombres:                r.nombres,
        apellidos:              r.apellidos,
        nombreCompleto:         r.nombreCompleto,
        fechaNacimiento:        r.fechaNacimiento,
        observacionesGenerales: r.observacionesGenerales,
        grupo: {
          idGrupo:    r.idGrupo,
          nombre:     r.nombreGrupo,
          edadMinima: r.edadMinima,
          edadMaxima: r.edadMaxima,
        },
        alertasMedicas: alertasPorNino[r.idPersona] ?? [],
      },
      idAsistencia: r.idAsistencia,
      idTurno:      r.idTurno,
      turno:        r.turno,
      estado:       r.estado,
      horaEntrada:  r.horaEntrada,
      horaSalida:   r.horaSalida,
    }));

    res.json({ exito: true, datos: resultado });
  } catch (err) {
    console.error('Error asistencia por grupo:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};
