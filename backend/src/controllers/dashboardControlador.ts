// src/controllers/dashboardControlador.ts — Controlador del Tablero (Spec §9.1)
// Usa el pool centralizado (CLAUDE.md §6.2). Expone 8 sub-endpoints.
import { Request, Response } from 'express';
import pool from '../config/db.js';

/**
 * GET /api/dashboard/metricas
 * Contadores: niños presentes, pendientes de retiro, personal activo, solicitudes pendientes.
 */
export const obtenerMetricas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [presentes, personal, solicitudes] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) AS total,
               COUNT(*) FILTER (WHERE Estado = 'Presente') AS presentes
        FROM Asistencia_Ninos
        WHERE Fecha = CURRENT_DATE
      `),
      pool.query(`
        SELECT COUNT(*) AS total
        FROM Asistencia_Maestros
        WHERE Fecha = CURRENT_DATE
      `),
      pool.query(`
        SELECT COUNT(*) AS total
        FROM Solicitudes_Personal
        WHERE Estado = 'Pendiente'
      `),
    ]);

    const ninosPresentes     = parseInt(presentes.rows[0].presentes, 10);
    const pendientesRetiro   = parseInt(presentes.rows[0].presentes, 10);
    const personalActivo     = parseInt(personal.rows[0].total, 10);
    const solicitudesPendientes = parseInt(solicitudes.rows[0].total, 10);

    res.json({
      exito: true,
      datos: { ninosPresentes, pendientesRetiro, personalActivo, solicitudesPendientes },
    });
  } catch (err) {
    console.error('Error obteniendo métricas:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard/cumpleaneros
 * Niños que cumplen años este mes. Usa v_cumpleanos_mes (Spec §10.9).
 */
export const obtenerCumpleaneros = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT p.ID_Persona                                   AS "idPersona",
             p.Nombres                                      AS "nombres",
             p.Apellidos                                    AS "apellidos",
             EXTRACT(DAY FROM p.Fecha_Nacimiento)::INT      AS "diaCumpleanos",
             'Niño'                                         AS "tipo",
             CASE 
               WHEN g.ID_Grupo = 1 AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.Fecha_Nacimiento))::INT < 4 THEN 'Menores de 4 años'
               ELSE COALESCE(g.Nombre, 'Sin grupo') 
             END                                            AS "grupo",
             NULL                                           AS "turno",
             NULL                                           AS "rol"
      FROM Personas p
      JOIN Ninos n ON n.ID_Persona = p.ID_Persona
      LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino = n.ID_Persona AND ng.activo = TRUE
      LEFT JOIN Grupos g ON g.ID_Grupo = ng.ID_Grupo
      WHERE EXTRACT(MONTH FROM p.Fecha_Nacimiento) = EXTRACT(MONTH FROM CURRENT_DATE)

      UNION ALL

      SELECT p.ID_Persona                                   AS "idPersona",
             p.Nombres                                      AS "nombres",
             p.Apellidos                                    AS "apellidos",
             EXTRACT(DAY FROM p.Fecha_Nacimiento)::INT      AS "diaCumpleanos",
             'Personal'                                     AS "tipo",
             NULL                                           AS "grupo",
             (
               SELECT string_agg(t.Nombre::text, ', ')
               FROM Personal_Turnos pt
               JOIN Turnos t ON pt.ID_Turno = t.ID_Turno
               WHERE pt.ID_Personal = p.ID_Persona AND pt.Activo = TRUE
             )                                              AS "turno",
             r.Nombre_Rol                                   AS "rol"
      FROM Personas p
      JOIN Personal_Sistema ps ON ps.ID_Persona = p.ID_Persona
      JOIN Roles r ON ps.ID_Rol = r.ID_Rol
      WHERE ps.Activo = TRUE
        AND EXTRACT(MONTH FROM p.Fecha_Nacimiento) = EXTRACT(MONTH FROM CURRENT_DATE)

      ORDER BY "diaCumpleanos" ASC
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo cumpleañeros:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard/alertas-medicas
 * Niños con condición médica de severidad Alta, indicando si están presentes hoy.
 */
export const obtenerAlertasMedicas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT im.ID_Info       AS "idInfo",
             p.ID_Persona     AS "idPersona",
             p.Nombres || ' ' || p.Apellidos AS "nino",
             im.Tipo          AS "tipo",
             im.Descripcion   AS "descripcion",
             im.Severidad     AS "severidad",
             im.Instrucciones AS "instrucciones"
      FROM Info_Medica_Ninos im
      JOIN Ninos   n ON im.ID_Nino   = n.ID_Persona
      JOIN Personas p ON n.ID_Persona = p.ID_Persona
      WHERE im.Severidad = 'Alta'
      ORDER BY p.Apellidos, p.Nombres
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo alertas médicas:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard/asistencia-mensual
 * Total de niños distintos por mes y turno. Usa v_asistencia_mensual_ninos (Spec §10.2).
 */
export const obtenerAsistenciaMensual = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT to_char(DATE_TRUNC('month', an.Fecha), 'YYYY-MM') AS "mes",
             t.Nombre                                           AS "turno",
             COUNT(DISTINCT an.ID_Nino)::INT                    AS "ninosDistintos",
             COUNT(*)::INT                                       AS "totalRegistros"
      FROM Asistencia_Ninos an
      JOIN Turnos t ON an.ID_Turno = t.ID_Turno
      GROUP BY DATE_TRUNC('month', an.Fecha), t.Nombre
      ORDER BY DATE_TRUNC('month', an.Fecha) DESC, t.Nombre
      LIMIT 24
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo asistencia mensual:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard/distribucion-grupos
 * Cantidad de niños activos por grupo. Para GraficaDona (Spec §9.1.4).
 */
export const obtenerDistribucionGrupos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        CASE 
          WHEN g.ID_Grupo = 1 AND DATE_PART('year', AGE(CURRENT_DATE, p.Fecha_Nacimiento))::INT < 4 THEN 'Menores de 4 años'
          ELSE g.Nombre 
        END AS "grupo",
        COUNT(ng.ID_Nino)::INT AS "cantidad"
      FROM Grupos g
      LEFT JOIN Ninos_Grupos ng ON ng.ID_Grupo = g.ID_Grupo AND ng.Activo = TRUE
      LEFT JOIN Personas p ON ng.ID_Nino = p.ID_Persona
      WHERE g.Activo = TRUE
      GROUP BY 
        CASE 
          WHEN g.ID_Grupo = 1 AND DATE_PART('year', AGE(CURRENT_DATE, p.Fecha_Nacimiento))::INT < 4 THEN 'Menores de 4 años'
          ELSE g.Nombre 
        END,
        g.Edad_Minima
      ORDER BY g.Edad_Minima, "grupo" DESC
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo distribución de grupos:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard/asistencia-por-rol
 * % de puntualidad del personal por rol. Usa v_cumplimiento_personal (Spec §10.5).
 */
export const obtenerAsistenciaPorRol = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT r.Nombre_Rol                                                   AS "rol",
             COUNT(*) FILTER (WHERE am.Estado_Llegada = 'Temprano')::INT   AS "temprano",
             COUNT(*) FILTER (WHERE am.Estado_Llegada = 'Tarde')::INT      AS "tarde",
             COUNT(*) FILTER (WHERE am.Estado_Llegada = 'Justificado')::INT AS "justificado",
             COUNT(*) FILTER (WHERE am.Estado_Llegada = 'Injustificado')::INT AS "injustificado"
      FROM Asistencia_Maestros am
      JOIN Personal_Sistema ps ON am.ID_Personal = ps.ID_Persona
      JOIN Roles r ON ps.ID_Rol = r.ID_Rol
      WHERE am.Fecha >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY r.Nombre_Rol, r.Nivel_Jerarquico
      ORDER BY r.Nivel_Jerarquico DESC
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo asistencia por rol:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard/comparativa-mensual
 * Comparativa de asistencia de niños mes a mes. Usa v_comparativa_mensual (Spec §10.3).
 */
export const obtenerComparativaMensual = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT to_char(DATE_TRUNC('month', Fecha), 'YYYY-MM') AS "mes",
             COUNT(DISTINCT ID_Nino)::INT                   AS "totalNinos",
             LAG(COUNT(DISTINCT ID_Nino)) OVER (
               ORDER BY DATE_TRUNC('month', Fecha)
             )::INT                                          AS "mesAnterior",
             (COUNT(DISTINCT ID_Nino) -
              LAG(COUNT(DISTINCT ID_Nino)) OVER (
                ORDER BY DATE_TRUNC('month', Fecha)
              ))::INT                                        AS "diferencia"
      FROM Asistencia_Ninos
      GROUP BY DATE_TRUNC('month', Fecha)
      ORDER BY DATE_TRUNC('month', Fecha) DESC
      LIMIT 12
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo comparativa mensual:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard/solicitudes-pendientes
 * Lista de solicitudes en estado Pendiente para el Coordinador General.
 * Usa v_solicitudes_pendientes (Spec §10.6).
 */
export const obtenerSolicitudesPendientes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT sp.ID_Solicitud                                  AS "idSolicitud",
             p_cand.Nombres || ' ' || p_cand.Apellidos        AS "candidato",
             tp.Numero                                         AS "telefono",
             tp.Tiene_Whatsapp                                 AS "tieneWhatsapp",
             r.Nombre_Rol                                      AS "rolSolicitado",
             p_staff.Nombres || ' ' || p_staff.Apellidos      AS "gestionadoPor",
             sp.Fecha_Solicitud                                AS "fechaSolicitud",
             sp.Tiempo_Iglesia_Meses                           AS "tiempoIglesiaMeses",
             (SELECT COUNT(*)::INT FROM Solicitudes_Requisitos sr
              JOIN Requisitos req ON sr.ID_Requisito = req.ID_Requisito
              WHERE sr.ID_Solicitud = sp.ID_Solicitud
                AND sr.Cumplido = TRUE AND req.Obligatorio = TRUE) AS "reqObligatoriosCumplidos",
             (SELECT COUNT(*)::INT FROM Requisitos req
              WHERE req.Obligatorio = TRUE AND req.Activo = TRUE
                AND (req.ID_Rol_Requerido IS NULL OR req.ID_Rol_Requerido = sp.ID_Rol_Solicitado)) AS "reqObligatoriosTotal",
             sp.Notas_Staff                                    AS "notasStaff"
      FROM Solicitudes_Personal sp
      JOIN Personas p_cand ON sp.ID_Persona = p_cand.ID_Persona
      JOIN Roles r ON sp.ID_Rol_Solicitado = r.ID_Rol
      JOIN Personal_Sistema ps_staff ON sp.ID_Gestionado_Por = ps_staff.ID_Persona
      JOIN Personas p_staff ON ps_staff.ID_Persona = p_staff.ID_Persona
      LEFT JOIN Telefonos_Personas tp
             ON p_cand.ID_Persona = tp.ID_Persona
            AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
      WHERE sp.Estado = 'Pendiente'
      ORDER BY sp.Fecha_Solicitud ASC
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo solicitudes pendientes:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard — Endpoint legado (un solo bloque con todo).
 * Mantenido por compatibilidad hacia atrás.
 */
export const obtenerDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [presentes, personal, cumples, alertas, movimientos] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) AS total,
               COUNT(*) FILTER (WHERE Estado = 'Presente') AS presentes
        FROM Asistencia_Ninos WHERE Fecha = CURRENT_DATE
      `),
      pool.query(`SELECT COUNT(*) AS total FROM Asistencia_Maestros WHERE Fecha = CURRENT_DATE`),
      pool.query(`
        SELECT p.ID_Persona AS "idPersona", p.Nombres AS "nombres", p.Apellidos AS "apellidos",
               EXTRACT(DAY FROM p.Fecha_Nacimiento)::INT AS "diaCumpleanos",
               COALESCE(g.Nombre, 'Sin grupo') AS "grupo"
        FROM Ninos n JOIN Personas p ON n.ID_Persona = p.ID_Persona
        LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino = n.ID_Persona
        LEFT JOIN Grupos g ON g.ID_Grupo = ng.ID_Grupo
        WHERE EXTRACT(MONTH FROM p.Fecha_Nacimiento) = EXTRACT(MONTH FROM CURRENT_DATE)
        ORDER BY "diaCumpleanos" ASC
      `),
      pool.query(`
        SELECT p.ID_Persona AS "idPersona",
               p.Nombres || ' ' || p.Apellidos AS "nombreNino",
               im.Tipo || ' — ' || im.Severidad || ' Severidad' AS "condicion",
               EXISTS(SELECT 1 FROM Asistencia_Ninos an
                      WHERE an.ID_Nino = n.ID_Persona AND an.Fecha = CURRENT_DATE AND an.Estado = 'Presente') AS "presente"
        FROM Info_Medica_Ninos im
        JOIN Ninos n ON im.ID_Nino = n.ID_Persona
        JOIN Personas p ON n.ID_Persona = p.ID_Persona
        WHERE im.Severidad = 'Alta'
      `),
      pool.query(`
        SELECT an.ID_Asistencia AS "idAsistencia", 'checkin' AS "tipo",
               p.Nombres AS "nombreNino", g.Nombre AS "grupo",
               to_char(an.Hora_Entrada - INTERVAL '6 hours', 'HH12:MI AM') AS "hora",
               per.Nombres AS "procesadoPor"
        FROM Asistencia_Ninos an
        JOIN Personas p ON an.ID_Nino = p.ID_Persona
        JOIN Grupos g ON an.ID_Grupo_Asistido = g.ID_Grupo
        JOIN Personas per ON an.Registrado_Por = per.ID_Persona
        WHERE an.Fecha = CURRENT_DATE
        UNION ALL
        SELECT an.ID_Asistencia AS "idAsistencia", 'checkout' AS "tipo",
               p.Nombres AS "nombreNino", g.Nombre AS "grupo",
               to_char(an.Hora_Salida - INTERVAL '6 hours', 'HH12:MI AM') AS "hora",
               per.Nombres AS "procesadoPor"
        FROM Asistencia_Ninos an
        JOIN Personas p ON an.ID_Nino = p.ID_Persona
        JOIN Grupos g ON an.ID_Grupo_Asistido = g.ID_Grupo
        JOIN Personas per ON an.Checkout_Por = per.ID_Persona
        WHERE an.Fecha = CURRENT_DATE AND an.Hora_Salida IS NOT NULL
        ORDER BY "hora" DESC LIMIT 10
      `),
    ]);

    res.status(200).json({
      exito: true,
      datos: {
        metricas: {
          ninosPresentes:   parseInt(presentes.rows[0].presentes, 10),
          pendientesRetiro: parseInt(presentes.rows[0].presentes, 10),
          personalActivo:   parseInt(personal.rows[0].total, 10),
        },
        cumpleaneros: cumples.rows,
        alertas:      alertas.rows,
        movimientos:  movimientos.rows,
      },
    });
  } catch (err) {
    console.error('Error en obtenerDashboard:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard/ninos-graduacion
 * Niños que cumplen 13 años este año (vista v_ninos_graduacion_mes).
 */
export const obtenerNinosGraduacion = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT Nombres                    AS "nombres",
             Apellidos                  AS "apellidos",
             Fecha_Nacimiento           AS "fechaNacimiento",
             Edad                       AS "edad",
             Mes_Cumpleanos             AS "mesCumpleanos",
             Dia_Cumpleanos             AS "diaCumpleanos",
             Grupo_Actual               AS "grupoActual",
             Fecha_Graduacion_Este_Anio AS "fechaGraduacionEsteAnio",
             Ya_Graduo_Este_Anio        AS "yaGraduoEsteAnio"
      FROM v_ninos_graduacion_mes
      ORDER BY Mes_Cumpleanos, Dia_Cumpleanos
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo niños en graduación:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard/ninos-transicion
 * Niños que deben cambiar de grupo (vista v_ninos_transicion_grupo_mes).
 */
export const obtenerNinosTransicion = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT ID_Persona       AS "idPersona",
             Nombres          AS "nombres",
             Apellidos        AS "apellidos",
             Edad_Este_Mes    AS "edadEsteMes",
             Grupo_Actual     AS "grupoActual",
             Grupo_Sugerido   AS "grupoSugerido",
             Estado_Transicion AS "estadoTransicion",
             Fecha_Transicion  AS "fechaTransicion"
      FROM v_ninos_transicion_grupo_mes
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error obteniendo niños en transición:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/dashboard/personal-disponible
 * Personal activo y sin suspensión vigente (vista v_personal_disponible_servicio).
 */
export const obtenerPersonalDisponibleDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT ID_Persona              AS "idPersona",
             Nombre_Completo         AS "nombreCompleto",
             Rol                     AS "rol",
             Fecha_Ingreso_Servicio  AS "fechaIngreso"
      FROM v_personal_disponible_servicio
    `);
    res.json({ exito: true, datos: rows, total: rows.length });
  } catch (err) {
    console.error('Error obteniendo personal disponible:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};
