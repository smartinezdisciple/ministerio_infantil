// src/controllers/reportesControlador.ts — Exportación de reportes CSV y Excel (Spec §9.12)
// Dependencia: exceljs — instalar con: npm install exceljs @types/node
import { Request, Response } from 'express';
import pool from '../config/db.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

/** Convierte un array de objetos a CSV con cabecera */
const generarCSV = (filas: Record<string, unknown>[]): string => {
  if (filas.length === 0) return '';
  const cabecera = Object.keys(filas[0]);
  const lineas = [
    cabecera.join(','),
    ...filas.map(fila =>
      cabecera.map(col => {
        const val = fila[col];
        if (val === null || val === undefined) return '';
        const str = String(val);
        // Escapar comas y comillas en CSV
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ];
  return lineas.join('\n');
};

/** Consultas SQL por tipo de reporte */
const consultasPorTipo: Record<string, string> = {
  ninos: `
    SELECT p.ID_Persona AS "ID Persona",
           p.Nombres AS "Nombres",
           p.Apellidos AS "Apellidos",
           p.Fecha_Nacimiento AS "Fecha Nacimiento",
           CASE 
             WHEN g.ID_Grupo = 1 AND DATE_PART('year', AGE(CURRENT_DATE, p.Fecha_Nacimiento))::INT < 4 THEN 'Menores de 4 años'
             ELSE COALESCE(g.Nombre, 'Sin grupo') 
           END AS "Grupo",
           ni.Observaciones_Generales AS "Observaciones"
    FROM Ninos ni
    JOIN Personas p ON ni.ID_Persona = p.ID_Persona
    LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino = ni.ID_Persona AND ng.Activo = TRUE
    LEFT JOIN Grupos g ON g.ID_Grupo = ng.ID_Grupo
    ORDER BY p.Apellidos, p.Nombres
  `,

  'asistencia-ninos': `
    SELECT an.Fecha AS "Fecha",
           t.Nombre AS "Turno",
           p.Nombres || ' ' || p.Apellidos AS "Niño",
           CASE 
             WHEN g.ID_Grupo = 1 AND DATE_PART('year', AGE(an.Fecha, p.Fecha_Nacimiento))::INT < 4 THEN 'Menores de 4 años'
             ELSE COALESCE(g.Nombre, '') 
           END AS "Grupo",
           to_char(an.Hora_Entrada - INTERVAL '6 hours', 'HH12:MI AM') AS "Hora Entrada",
           to_char(an.Hora_Salida - INTERVAL '6 hours', 'HH12:MI AM') AS "Hora Salida",
           an.Estado AS "Estado",
           fe.Codigo_Ficha AS "Ficha Entrada",
           COALESCE(fs.Codigo_Ficha, '') AS "Ficha Salida"
    FROM Asistencia_Ninos an
    JOIN Personas p ON an.ID_Nino = p.ID_Persona
    JOIN Turnos t ON an.ID_Turno = t.ID_Turno
    JOIN Grupos g ON an.ID_Grupo_Asistido = g.ID_Grupo
    JOIN Fichas fe ON an.ID_Ficha_Entrada = fe.ID_Ficha
    LEFT JOIN Fichas fs ON an.ID_Ficha_Salida = fs.ID_Ficha
    ORDER BY an.Fecha DESC, an.Hora_Entrada DESC
    LIMIT 5000
  `,

  'asistencia-maestros': `
    SELECT am.Fecha AS "Fecha",
           t.Nombre AS "Turno",
           p.Nombres || ' ' || p.Apellidos AS "Personal",
           r.Nombre_Rol AS "Rol",
           COALESCE(g.Nombre, '') AS "Grupo",
           to_char(am.Hora_Llegada - INTERVAL '6 hours', 'HH12:MI AM') AS "Hora Llegada",
           am.Estado_Llegada AS "Estado",
           COALESCE(am.Razon_Ausencia, '') AS "Razón Ausencia"
    FROM Asistencia_Maestros am
    JOIN Personal_Sistema ps ON am.ID_Personal = ps.ID_Persona
    JOIN Personas p ON ps.ID_Persona = p.ID_Persona
    JOIN Roles r ON ps.ID_Rol = r.ID_Rol
    JOIN Turnos t ON am.ID_Turno = t.ID_Turno
    LEFT JOIN Grupos g ON am.ID_Grupo = g.ID_Grupo
    ORDER BY am.Fecha DESC, p.Apellidos
    LIMIT 5000
  `,

  fichas: `
    SELECT f.Codigo_Ficha AS "Código Ficha",
           f.Tipo AS "Tipo",
           f.Estado AS "Estado",
           COALESCE(g.Nombre, '') AS "Grupo"
    FROM Fichas f
    LEFT JOIN Grupos g ON f.ID_Grupo = g.ID_Grupo
    ORDER BY f.Codigo_Ficha
  `,

  solicitudes: `
    SELECT sp.ID_Solicitud AS "ID Solicitud",
           p_cand.Nombres || ' ' || p_cand.Apellidos AS "Candidato",
           r.Nombre_Rol AS "Rol Solicitado",
           sp.Estado AS "Estado",
           p_staff.Nombres || ' ' || p_staff.Apellidos AS "Gestionado Por",
           sp.Fecha_Solicitud AS "Fecha Solicitud",
           COALESCE(sp.Fecha_Resolucion::TEXT, '') AS "Fecha Resolución",
           COALESCE(sp.Notas_Staff, '') AS "Notas Staff",
           COALESCE(sp.Notas_Coordinador, '') AS "Notas Coordinador"
    FROM Solicitudes_Personal sp
    JOIN Personas p_cand ON sp.ID_Persona = p_cand.ID_Persona
    JOIN Roles r ON sp.ID_Rol_Solicitado = r.ID_Rol
    JOIN Personal_Sistema ps_staff ON sp.ID_Gestionado_Por = ps_staff.ID_Persona
    JOIN Personas p_staff ON ps_staff.ID_Persona = p_staff.ID_Persona
    ORDER BY sp.Fecha_Solicitud DESC
    LIMIT 1000
  `,
};

/** Tipos de reporte válidos */
const tiposValidos = Object.keys(consultasPorTipo);

/**
 * GET /api/reportes/:tipo/csv
 * Exporta el reporte como archivo CSV descargable.
 */
export const exportarCSV = async (req: Request, res: Response): Promise<void> => {
  const tipo = req.params.tipo as string;

  if (!tiposValidos.includes(tipo)) {
    res.status(400).json({ exito: false, mensaje: `Tipo de reporte inválido. Use: ${tiposValidos.join(', ')}` });
    return;
  }

  try {
    const { rows } = await pool.query(consultasPorTipo[tipo]);
    const csv = generarCSV(rows);
    const nombreArchivo = `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.send('\uFEFF' + csv); // BOM para compatibilidad con Excel en Windows
  } catch (err) {
    console.error(`Error exportando CSV de ${tipo}:`, err);
    res.status(500).json({ exito: false, mensaje: 'Error generando el reporte CSV.' });
  }
};

/**
 * GET /api/reportes/:tipo/excel
 * Exporta el reporte como archivo Excel (.xlsx) descargable.
 * Requiere: npm install exceljs
 */
export const exportarExcel = async (req: Request, res: Response): Promise<void> => {
  const tipo = req.params.tipo as string;

  if (!tiposValidos.includes(tipo)) {
    res.status(400).json({ exito: false, mensaje: `Tipo de reporte inválido. Use: ${tiposValidos.join(', ')}` });
    return;
  }

  try {
    const { rows } = await pool.query(consultasPorTipo[tipo]);

    // Importación dinámica de exceljs
    let exceljs: typeof import('exceljs');
    try {
      exceljs = await import('exceljs');
    } catch {
      // Si exceljs no está instalado, caer en CSV
      console.warn('exceljs no instalado — generando CSV como alternativa');
      await exportarCSV(req, res);
      return;
    }

    const libro = new exceljs.Workbook();
    libro.creator = 'Sistema Escuela Dominical';
    libro.created = new Date();

    const nombreHoja = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    const hoja = libro.addWorksheet(nombreHoja, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    if (rows.length > 0) {
      const columnas = Object.keys(rows[0]);
      hoja.columns = columnas.map(col => ({
        header: col,
        key:    col,
        width:  Math.max(col.length + 4, 15),
      }));

      hoja.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      hoja.getRow(1).fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: 'FF2A7DE1' },
      };

      hoja.addRows(rows);
    }

    const nombreArchivo = `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    await libro.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(`Error exportando Excel de ${tipo}:`, err);
    res.status(500).json({ exito: false, mensaje: 'Error generando el reporte Excel.' });
  }
};

/** Normaliza el nombre del turno enviado por el cliente para hacerlo coincidir con el enum de la BD */
const normalizarTurno = (turno: string): string => {
  const t = turno.trim().toLowerCase();
  if (t.includes('miercoles') || t.includes('miércoles')) return 'Miercoles';
  if (t.includes('8am') || t.includes('8_am')) return 'Domingo_8am';
  if (t.includes('11am') || t.includes('11_am')) return 'Domingo_11am';
  if (t.includes('5pm') || t.includes('5_pm')) return 'Domingo_5pm';
  return turno;
};

/**
 * GET /api/reportes/ninos-por-grupo/datos
 * Retorna la lista de niños agrupados con su edad y fecha de nacimiento, filtrados opcionalmente por turno y fecha.
 */
export const obtenerNinosPorGrupoDatos = async (req: Request, res: Response): Promise<void> => {
  const { turno, fecha } = req.query;
  const turnoStr = (turno as string) || 'Todos';
  const ahora = new Date();
  const fechaHoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  const fechaStr = (fecha as string) || fechaHoy;

  try {
    let query = '';
    let params: any[] = [];

    if (turnoStr === 'Todos') {
      query = `
        WITH Asistencia_Unica AS (
          SELECT DISTINCT ON (an.ID_Nino)
            an.ID_Nino,
            an.ID_Grupo_Asistido,
            an.ID_Ingresado_Por,
            an.Hora_Entrada
          FROM Asistencia_Ninos an
          WHERE an.Fecha = $1
          ORDER BY an.ID_Nino, an.Hora_Entrada DESC
        )
        SELECT
          p.ID_Persona AS "idPersona",
          p.Nombres AS "nombres",
          p.Apellidos AS "apellidos",
          CONCAT(p.Nombres, ' ', p.Apellidos) AS "nombreCompleto",
          TO_CHAR(p.Fecha_Nacimiento, 'YYYY-MM-DD') AS "fechaNacimiento",
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.Fecha_Nacimiento))::integer AS "edad",
          COALESCE(g.Nombre, 'Sin grupo') AS "nombreGrupo",
          COALESCE(g.ID_Grupo, 0) AS "idGrupo",
          CONCAT(t_ing.Nombres, ' ', t_ing.Apellidos) AS "familiarIngreso",
          tp.Numero AS "telefonoFamiliar"
        FROM Asistencia_Unica au
        JOIN Personas p ON au.ID_Nino = p.ID_Persona
        JOIN Ninos n ON n.ID_Persona = p.ID_Persona
        LEFT JOIN Grupos g ON g.ID_Grupo = au.ID_Grupo_Asistido
        LEFT JOIN Personas t_ing ON t_ing.ID_Persona = au.ID_Ingresado_Por
        LEFT JOIN Telefonos_Personas tp ON tp.ID_Persona = au.ID_Ingresado_Por AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
        ORDER BY "nombreGrupo", p.Apellidos, p.Nombres
      `;
      params = [fechaStr];
    } else {
      const dbTurno = normalizarTurno(turnoStr);
      query = `
        SELECT
          p.ID_Persona AS "idPersona",
          p.Nombres AS "nombres",
          p.Apellidos AS "apellidos",
          CONCAT(p.Nombres, ' ', p.Apellidos) AS "nombreCompleto",
          TO_CHAR(p.Fecha_Nacimiento, 'YYYY-MM-DD') AS "fechaNacimiento",
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.Fecha_Nacimiento))::integer AS "edad",
          COALESCE(g.Nombre, 'Sin grupo') AS "nombreGrupo",
          COALESCE(g.ID_Grupo, 0) AS "idGrupo",
          CONCAT(t_ing.Nombres, ' ', t_ing.Apellidos) AS "familiarIngreso",
          tp.Numero AS "telefonoFamiliar"
        FROM Personas p
        JOIN Ninos n ON n.ID_Persona = p.ID_Persona
        JOIN Asistencia_Ninos an ON an.ID_Nino = p.ID_Persona
        JOIN Turnos t ON an.ID_Turno = t.ID_Turno
        LEFT JOIN Grupos g ON g.ID_Grupo = an.ID_Grupo_Asistido
        LEFT JOIN Personas t_ing ON t_ing.ID_Persona = an.ID_Ingresado_Por
        LEFT JOIN Telefonos_Personas tp ON tp.ID_Persona = an.ID_Ingresado_Por AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
        WHERE an.Fecha = $1 AND t.Nombre = $2
        ORDER BY "nombreGrupo", p.Apellidos, p.Nombres
      `;
      params = [fechaStr, dbTurno];
    }

    const { rows } = await pool.query(query, params);
    respuestaExito(res, rows);
  } catch (err) {
    console.error('Error al obtener datos de niños por grupo:', err);
    respuestaError(res, 'Error al generar los datos del reporte.', 500);
  }
};

/** Mapeo de nombres de mes en español a número */
const MAPA_MESES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

/**
 * GET /api/reportes/cumpleanos/datos
 * Retorna los niños que cumplen años en el mes indicado.
 */
export const obtenerCumpleanosDatos = async (req: Request, res: Response): Promise<void> => {
  const { mes } = req.query;
  const mesStr = ((mes as string) || '').trim().toLowerCase();
  const numeroMes = MAPA_MESES[mesStr];

  if (!numeroMes) {
    res.status(400).json({ exito: false, mensaje: 'Mes inválido. Use: enero, febrero, ..., diciembre.' });
    return;
  }

  try {
    const { rows } = await pool.query(`
      SELECT
        p.ID_Persona                                  AS "idPersona",
        p.Nombres                                     AS "nombres",
        p.Apellidos                                   AS "apellidos",
        CONCAT(p.Nombres, ' ', p.Apellidos)            AS "nombreCompleto",
        TO_CHAR(p.Fecha_Nacimiento, 'YYYY-MM-DD')     AS "fechaNacimiento",
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.Fecha_Nacimiento))::integer AS "edad",
        EXTRACT(MONTH FROM p.Fecha_Nacimiento)::integer  AS "mes",
        EXTRACT(DAY FROM p.Fecha_Nacimiento)::integer   AS "dia"
      FROM Ninos n
      JOIN Personas p ON n.ID_Persona = p.ID_Persona
      WHERE EXTRACT(MONTH FROM p.Fecha_Nacimiento) = $1
        AND n.Activo = TRUE
      ORDER BY EXTRACT(DAY FROM p.Fecha_Nacimiento), p.Apellidos, p.Nombres
    `, [numeroMes]);

    respuestaExito(res, rows);
  } catch (err) {
    console.error('Error al obtener datos de cumpleaños:', err);
    respuestaError(res, 'Error al generar los datos del reporte.', 500);
  }
};
