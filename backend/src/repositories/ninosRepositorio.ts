// src/repositories/ninosRepositorio.ts — Consultas SQL de niños (MVP-01, MVP-02)
import pool from '../config/db.js';

export interface NinoDB {
  idPersona:              number;
  nombres:                string;
  apellidos:              string;
  fechaNacimiento:        string;
  observacionesGenerales: string | null;
  sexo?:                  'Masculino' | 'Femenino' | null;
}

export interface DatosPadre {
  nombres:    string;
  apellidos:  string;
  telefono:   string;
  tipoTutor?: string;
}

/** Datos de una condición/alergia/medicamento del niño (Spec §2.7) */
export interface DatosInfoMedica {
  tipo:         'Condicion' | 'Alergia' | 'Medicamento';
  descripcion:  string;
  severidad:    'Alta' | 'Moderada' | 'Baja';
  instrucciones?: string;
}

/**
 * Inserta un niño en Personas + Ninos dentro de una transacción.
 * Patrón supertipo/subtipo (Spec §2.3, §2.4.1).
 * SOLO consultas parametrizadas (CLAUDE.md §4.1).
 */
export const crearNino = async (datos: {
  nombres:                string;
  apellidos:              string;
  fechaNacimiento:        string;
  observacionesGenerales?: string;
  idGrupo:               number;
  motivoExcepcion?:      string;
  sexo?:                 'Masculino' | 'Femenino' | null;
}): Promise<NinoDB> => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // 1. Insertar en supertipo Personas
    const resultadoPersona = await cliente.query<{ id_persona: number }>(
      `INSERT INTO Personas (Nombres, Apellidos, Fecha_Nacimiento, Sexo)
       VALUES ($1, $2, $3, $4)
       RETURNING ID_Persona AS id_persona`,
      [datos.nombres, datos.apellidos, datos.fechaNacimiento, datos.sexo ?? null]
    );
    const idPersona = resultadoPersona.rows[0].id_persona;

    // 2. Insertar en subtipo Ninos
    await cliente.query(
      `INSERT INTO Ninos (ID_Persona, Observaciones_Generales)
       VALUES ($1, $2)`,
      [idPersona, datos.observacionesGenerales ?? null]
    );

    // 3. Asignar al grupo (MVP-02)
    await cliente.query(
      `INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Es_Excepcion, Motivo_Excepcion)
       VALUES ($1, $2, $3, $4)`,
      [
        idPersona,
        datos.idGrupo,
        datos.motivoExcepcion ? true : false,
        datos.motivoExcepcion ?? null,
      ]
    );

    await cliente.query('COMMIT');

    return {
      idPersona,
      nombres:                datos.nombres,
      apellidos:              datos.apellidos,
      fechaNacimiento:        datos.fechaNacimiento,
      observacionesGenerales: datos.observacionesGenerales ?? null,
    };
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};

/**
 * Inserta un niño junto con uno o más padres en una sola transacción atómica.
 * Flujo: Personas(niño) → Ninos → Ninos_Grupos → por cada padre: Personas(padre) → Padres → Padres_Ninos
 * SOLO consultas parametrizadas (CLAUDE.md §4.1). BEGIN/COMMIT garantizan integridad (MVP-01).
 */
export const crearNinoConPadres = async (datos: {
  nombres:                string;
  apellidos:              string;
  fechaNacimiento:        string;
  observacionesGenerales?: string;
  idGrupo:               number;
  motivoExcepcion?:      string;
  padres?:               DatosPadre[];
  infoMedica?:           DatosInfoMedica[];  // P1-04: persiste Info_Medica_Ninos
  sexo?:                 'Masculino' | 'Femenino' | null;
}): Promise<NinoDB & { padresRegistrados: number; infoMedicaRegistrada: number }> => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // ── 1. Supertipo Personas para el niño ──────────────────────
    const resultadoPersona = await cliente.query<{ id_persona: number }>(
      `INSERT INTO Personas (Nombres, Apellidos, Fecha_Nacimiento, Sexo)
       VALUES ($1, $2, $3, $4)
       RETURNING ID_Persona AS id_persona`,
      [datos.nombres, datos.apellidos, datos.fechaNacimiento, datos.sexo ?? null]
    );
    const idNino = resultadoPersona.rows[0].id_persona;

    // ── 2. Subtipo Ninos ─────────────────────────────────────────
    await cliente.query(
      `INSERT INTO Ninos (ID_Persona, Observaciones_Generales)
       VALUES ($1, $2)`,
      [idNino, datos.observacionesGenerales ?? null]
    );

    // ── 3. Asignación de grupo (MVP-02) ──────────────────────────
    await cliente.query(
      `INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Es_Excepcion, Motivo_Excepcion)
       VALUES ($1, $2, $3, $4)`,
      [
        idNino,
        datos.idGrupo,
        datos.motivoExcepcion ? true : false,
        datos.motivoExcepcion ?? null,
      ]
    );

    // ── 4. Insertar padres como tutores (solo si hay datos válidos) ─
    const padresValidos = (datos.padres ?? []).filter(
      (p) => p.nombres.trim().length >= 2 && p.apellidos.trim().length >= 2 && p.telefono.trim().length >= 7
    );

    for (const padre of padresValidos) {
      // 4a. Persona del padre
      const resultadoPadre = await cliente.query<{ id_persona: number }>(
        `INSERT INTO Personas (Nombres, Apellidos, Telefono)
         VALUES ($1, $2, $3)
         RETURNING ID_Persona AS id_persona`,
        [padre.nombres, padre.apellidos, padre.telefono]
      );
      const idPadre = resultadoPadre.rows[0].id_persona;

      // 4b. Subtipo Tutores
      await cliente.query(
        `INSERT INTO Tutores (ID_Persona, Tipo_Tutor) VALUES ($1, 'Padre/Madre')`,
        [idPadre]
      );

      // 4c. Relación Tutores_Ninos
      await cliente.query(
        `INSERT INTO Tutores_Ninos (ID_Tutor, ID_Nino) VALUES ($1, $2)`,
        [idPadre, idNino]
      );
    }

    // ── 5. Registrar info médica (P1-04 — Spec §2.7) ─────────────────
    const infoMedicaValida = (datos.infoMedica ?? []).filter(
      (im) => im.tipo && im.descripcion?.trim().length >= 3 && im.severidad
    );

    for (const info of infoMedicaValida) {
      await cliente.query(
        `INSERT INTO Info_Medica_Ninos (ID_Nino, Tipo, Descripcion, Severidad, Instrucciones)
         VALUES ($1, $2, $3, $4, $5)`,
        [idNino, info.tipo, info.descripcion.trim(), info.severidad, info.instrucciones?.trim() ?? null]
      );
    }

    await cliente.query('COMMIT');

    return {
      idPersona:              idNino,
      nombres:                datos.nombres,
      apellidos:              datos.apellidos,
      fechaNacimiento:        datos.fechaNacimiento,
      observacionesGenerales: datos.observacionesGenerales ?? null,
      padresRegistrados:      padresValidos.length,
      infoMedicaRegistrada:   infoMedicaValida.length,
    };
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};

/** Obtiene todos los niños con su grupo calculado dinámicamente por edad */
export const obtenerNinos = async (): Promise<unknown[]> => {
  const resultado = await pool.query(
    `SELECT
        p.ID_Persona                                     AS "idPersona",
        p.Nombres                                        AS "nombres",
        p.Apellidos                                      AS "apellidos",
        CONCAT(p.Nombres, ' ', p.Apellidos)              AS "nombreCompleto",
        p.Fecha_Nacimiento                               AS "fechaNacimiento",
        p.Sexo                                           AS "sexo",
        n.Observaciones_Generales                        AS "observacionesGenerales",
        n.Activo                                         AS "activo",
        g.ID_Grupo                                       AS "idGrupo",
        CASE 
          WHEN g.ID_Grupo = 1 AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.Fecha_Nacimiento)) < 4 THEN 'Menores de 4 años'
          ELSE g.Nombre 
        END                                              AS "nombreGrupo",
        g.Edad_Minima                                    AS "edadMinima",
        g.Edad_Maxima                                    AS "edadMaxima"
      FROM Personas p
      JOIN Ninos n ON n.ID_Persona = p.ID_Persona
      LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino = p.ID_Persona
      LEFT JOIN Grupos g ON g.ID_Grupo = COALESCE(ng.ID_Grupo, (
        SELECT ID_Grupo FROM Grupos 
        WHERE Activo = TRUE 
          AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.Fecha_Nacimiento)) BETWEEN Edad_Minima AND Edad_Maxima 
        LIMIT 1
      ))
      ORDER BY p.Apellidos, p.Nombres`
  );
  return resultado.rows;
};

/** Lista niños con columnas para la página de Ingreso: nombre, adulto responsable, hora creación */
export const obtenerNinosIngreso = async (): Promise<unknown[]> => {
  const resultado = await pool.query(
    `SELECT
       n_p.ID_Persona       AS "idNino",
       CONCAT(n_p.Nombres, ' ', n_p.Apellidos) AS "nombreNino",
       n_p.Creado_En        AS "creadoEn",
       n_p.Fecha_Nacimiento AS "fechaNacimiento",
       n.Activo             AS "activo",
       (
         SELECT CONCAT(p2.Nombres, ' ', p2.Apellidos)
         FROM Tutores_Ninos tn2
         JOIN Personas p2 ON p2.ID_Persona = tn2.ID_Tutor
         WHERE tn2.ID_Nino = n_p.ID_Persona
         ORDER BY p2.Creado_En
         LIMIT 1
       )                    AS "adultoResponsable"
     FROM Personas n_p
     JOIN Ninos n ON n.ID_Persona = n_p.ID_Persona
     ORDER BY n_p.Creado_En DESC`
  );
  return resultado.rows;
};

/** Busca un niño por ID */
export const obtenerNinoPorId = async (idPersona: number): Promise<unknown | null> => {
  const resultado = await pool.query(
    `SELECT
        p.ID_Persona       AS "idPersona",
        p.Nombres          AS "nombres",
        p.Apellidos        AS "apellidos",
        p.Fecha_Nacimiento AS "fechaNacimiento",
        n.Observaciones_Generales AS "observacionesGenerales",
        n.Activo             AS "activo"
      FROM Personas p
      JOIN Ninos n ON n.ID_Persona = p.ID_Persona
      WHERE p.ID_Persona = $1`,
    [idPersona]
  );
  return resultado.rows[0] ?? null;
};

/** Verifica si ya existe un niño con el mismo nombre completo y fecha de nacimiento */
export const verificarNinoDuplicado = async (nombres: string, apellidos: string, fechaNacimiento: string, idExcluir?: number): Promise<boolean> => {
  const resultado = await pool.query(
    `SELECT 1 FROM Personas p
     JOIN Ninos n ON n.ID_Persona = p.ID_Persona
     WHERE LOWER(p.Nombres) = LOWER($1)
       AND LOWER(p.Apellidos) = LOWER($2)
       AND p.Fecha_Nacimiento = $3
       ${idExcluir ? 'AND p.ID_Persona != $4' : ''}
     LIMIT 1`,
    idExcluir ? [nombres, apellidos, fechaNacimiento, idExcluir] : [nombres, apellidos, fechaNacimiento]
  );
  return (resultado.rowCount ?? 0) > 0;
};

/** Actualiza los datos de un niño (Personas + Ninos + Ninos_Grupos) */
export const actualizarNino = async (idPersona: number, datos: {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  observacionesGenerales?: string;
  idGrupo: number;
  motivoExcepcion?: string;
  sexo?: 'Masculino' | 'Femenino' | null;
  activo?: boolean;
}): Promise<NinoDB> => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // 1. Actualizar Personas
    await cliente.query(
      `UPDATE Personas 
       SET Nombres = $1, Apellidos = $2, Fecha_Nacimiento = $3, Sexo = $4, Actualizado_En = NOW()
       WHERE ID_Persona = $5`,
      [datos.nombres, datos.apellidos, datos.fechaNacimiento, datos.sexo ?? null, idPersona]
    );

    // 2. Actualizar Ninos
    await cliente.query(
      `UPDATE Ninos SET Observaciones_Generales = $1, Activo = $2 WHERE ID_Persona = $3`,
      [datos.observacionesGenerales ?? null, datos.activo ?? true, idPersona]
    );

    // 3. Actualizar grupo (upsert en Ninos_Grupos)
    const grupoExistente = await cliente.query(
      `SELECT 1 FROM Ninos_Grupos WHERE ID_Nino = $1`,
      [idPersona]
    );
    if ((grupoExistente.rowCount ?? 0) > 0) {
      await cliente.query(
        `UPDATE Ninos_Grupos 
         SET ID_Grupo = $1, Es_Excepcion = $2, Motivo_Excepcion = $3 
         WHERE ID_Nino = $4`,
        [
          datos.idGrupo,
          datos.motivoExcepcion ? true : false,
          datos.motivoExcepcion ?? null,
          idPersona
        ]
      );
    } else {
      await cliente.query(
        `INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Es_Excepcion, Motivo_Excepcion)
         VALUES ($1, $2, $3, $4)`,
        [
          idPersona,
          datos.idGrupo,
          datos.motivoExcepcion ? true : false,
          datos.motivoExcepcion ?? null
        ]
      );
    }

    await cliente.query('COMMIT');

    return {
      idPersona,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      fechaNacimiento: datos.fechaNacimiento,
      observacionesGenerales: datos.observacionesGenerales ?? null,
    };
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};

/** Elimina un niño y todos sus datos relacionados (tablas subtipo y relaciones) */
export const eliminarNino = async (idPersona: number): Promise<void> => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // 0.1 Eliminar registros de asistencia
    await cliente.query('DELETE FROM Asistencia_Ninos WHERE ID_Nino = $1', [idPersona]);

    // 0.2 Eliminar expedientes de conducta
    await cliente.query('DELETE FROM Ninos_Expedientes_Conducta WHERE ID_Nino = $1', [idPersona]);

    // 1. Eliminar relaciones en Tutores_Ninos
    await cliente.query('DELETE FROM Tutores_Ninos WHERE ID_Nino = $1', [idPersona]);

    // 2. Eliminar relaciones en Ninos_Grupos
    await cliente.query('DELETE FROM Ninos_Grupos WHERE ID_Nino = $1', [idPersona]);

    // 3. Eliminar de Ninos (subtipo)
    await cliente.query('DELETE FROM Ninos WHERE ID_Persona = $1', [idPersona]);

    // 4. Eliminar de Personas (supertipo - esto también elimina las dependencias por cascade)
    await cliente.query('DELETE FROM Personas WHERE ID_Persona = $1', [idPersona]);

    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};

/** Obtiene un niño completo con grupo y padres para edición */
export const obtenerNinoCompleto = async (idPersona: number): Promise<unknown | null> => {
  const cliente = await pool.connect();
  try {
    // Datos del niño con grupo calculado por edad
    const ninoRes = await cliente.query(
      `SELECT
          p.ID_Persona                                     AS "idPersona",
          p.Nombres                                        AS "nombres",
          p.Apellidos                                      AS "apellidos",
          p.Sexo                                           AS "sexo",
          TO_CHAR(p.Fecha_Nacimiento, 'YYYY-MM-DD')        AS "fechaNacimiento",
          n.Observaciones_Generales                        AS "observacionesGenerales",
          n.Activo                                         AS "activo",
          g.ID_Grupo                                      AS "idGrupo",
          CASE 
            WHEN g.ID_Grupo = 1 AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.Fecha_Nacimiento)) < 4 THEN 'Menores de 4 años'
            ELSE g.Nombre 
          END                                              AS "nombreGrupo",
          ng.Motivo_Excepcion                              AS "motivoExcepcion"
        FROM Personas p
        JOIN Ninos n ON n.ID_Persona = p.ID_Persona
        LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino = p.ID_Persona
        LEFT JOIN Grupos g ON g.ID_Grupo = COALESCE(ng.ID_Grupo, (
          SELECT ID_Grupo FROM Grupos 
          WHERE Activo = TRUE 
            AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.Fecha_Nacimiento)) BETWEEN Edad_Minima AND Edad_Maxima 
          LIMIT 1
        ))
        WHERE p.ID_Persona = $1`,
      [idPersona]
    );
    if ((ninoRes.rowCount ?? 0) === 0) return null;

    const nino = ninoRes.rows[0];

    // Tutores
    const tutoresRes = await cliente.query(
      `SELECT
          p.ID_Persona AS "idPersona",
          p.Nombres    AS "nombres",
          p.Apellidos  AS "apellidos",
          p.Telefono   AS "telefono"
        FROM Tutores_Ninos tn
        JOIN Personas p ON tn.ID_Tutor = p.ID_Persona
        WHERE tn.ID_Nino = $1
        ORDER BY p.Creado_En`,
      [idPersona]
    );

    return {
      ...nino,
      padres: tutoresRes.rows,
    };
  } finally {
    cliente.release();
  }
};

export const listarExpedientes = async (idNino: number) => {
  const { rows } = await pool.query(`
    SELECT
      nec.ID_Expediente      AS "idExpediente",
      nec.ID_Nino            AS "idNino",
      TO_CHAR(nec.Fecha, 'YYYY-MM-DD') AS "fecha",
      nec.ID_Turno           AS "idTurno",
      t.Nombre               AS "turno",
      nec.ID_Evento          AS "idEvento",
      ev.Nombre              AS "evento",
      nec.Tipo               AS "tipo",
      nec.Descripcion        AS "descripcion",
      nec.ID_Reportado_Por   AS "idReportadoPor",
      p_rep.Nombres || ' ' || p_rep.Apellidos AS "reportadoPor",
      nec.Resuelto           AS "resuelto",
      nec.Notas_Resolucion   AS "notasResolucion",
      nec.Creado_En          AS "creadoEn"
    FROM Ninos_Expedientes_Conducta nec
    LEFT JOIN Turnos t            ON nec.ID_Turno = t.ID_Turno
    LEFT JOIN Eventos ev          ON nec.ID_Evento = ev.ID_Evento
    JOIN Personas p_rep           ON nec.ID_Reportado_Por = p_rep.ID_Persona
    WHERE nec.ID_Nino = $1
    ORDER BY nec.Fecha DESC, nec.Creado_En DESC
  `, [idNino]);
  return rows;
};

export const crearExpediente = async (idNino: number, datos: { tipo: string; descripcion: string; idTurno?: number | null; idEvento?: number | null; idReportadoPor: number }) => {
  const { rows } = await pool.query(`
    INSERT INTO Ninos_Expedientes_Conducta (ID_Nino, Tipo, Descripcion, ID_Turno, ID_Evento, ID_Reportado_Por)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING 
      ID_Expediente      AS "idExpediente",
      ID_Nino            AS "idNino",
      TO_CHAR(Fecha, 'YYYY-MM-DD') AS "fecha",
      ID_Turno           AS "idTurno",
      ID_Evento          AS "idEvento",
      Tipo               AS "tipo",
      Descripcion        AS "descripcion",
      ID_Reportado_Por   AS "idReportadoPor",
      Resuelto           AS "resuelto",
      Notas_Resolucion   AS "notasResolucion",
      Creado_En          AS "creadoEn"
  `, [idNino, datos.tipo, datos.descripcion, datos.idTurno ?? null, datos.idEvento ?? null, datos.idReportadoPor]);
  return rows[0];
};

export const resolverExpediente = async (idNino: number, idExpediente: number, notasResolucion: string) => {
  const { rows } = await pool.query(`
    UPDATE Ninos_Expedientes_Conducta
    SET Resuelto = TRUE, Notas_Resolucion = $1
    WHERE ID_Nino = $2 AND ID_Expediente = $3
    RETURNING 
      ID_Expediente      AS "idExpediente",
      ID_Nino            AS "idNino",
      TO_CHAR(Fecha, 'YYYY-MM-DD') AS "fecha",
      ID_Turno           AS "idTurno",
      ID_Evento          AS "idEvento",
      Tipo               AS "tipo",
      Descripcion        AS "descripcion",
      ID_Reportado_Por   AS "idReportadoPor",
      Resuelto           AS "resuelto",
      Notas_Resolucion   AS "notasResolucion",
      Creado_En          AS "creadoEn"
  `, [notasResolucion, idNino, idExpediente]);
  return rows[0];
};
