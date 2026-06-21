// src/repositories/tutoresRepositorio.ts — Repositorio de tutores
import pool from '../config/db.js';

export interface DatosTutorNuevo {
  idNino: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  tipoTutor: string;
}

export interface TutorResultado {
  idPersona: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  telefono: string | null;
  tipoTutor: string;
}

export const listarTutoresPorNinoRepo = async (idNino: number): Promise<unknown[]> => {
  const consulta = `
    SELECT
      p.id_persona AS "idPersona",
      p.nombres,
      p.apellidos,
      p.nombres || ' ' || p.apellidos AS "nombreCompleto",
      COALESCE(tp.numero, p.telefono) AS "telefono",
      tn.parentesco AS "tipoTutor"
    FROM tutores_ninos tn
    JOIN tutores t ON tn.id_tutor = t.id_persona
    JOIN personas p ON t.id_persona = p.id_persona
    LEFT JOIN telefonos_personas tp
           ON tp.id_persona = p.id_persona
          AND tp.es_principal = TRUE AND tp.activo = TRUE
    WHERE tn.id_nino = $1
    ORDER BY p.nombres, p.apellidos
  `;
  const resultado = await pool.query(consulta, [idNino]);
  return resultado.rows;
};

export const vincularTutorExistenteRepo = async (idTutor: number, idNino: number, parentesco?: string): Promise<void> => {
  await pool.query(
    `INSERT INTO Tutores_Ninos (ID_Tutor, ID_Nino, parentesco) 
     VALUES ($1, $2, COALESCE($3, 'Padre/Madre')) 
     ON CONFLICT (ID_Tutor, ID_Nino) 
     DO UPDATE SET parentesco = EXCLUDED.parentesco`,
    [idTutor, idNino, parentesco ?? null]
  );
};

export const crearTutorYVincularRepo = async (datos: DatosTutorNuevo): Promise<TutorResultado> => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // Verificar si ya existe una persona con el mismo nombre y teléfono (buscando en ambos lados)
    const existente = await cliente.query(
      `SELECT p.id_persona, t.tipo_tutor
       FROM personas p
       JOIN tutores t ON p.id_persona = t.id_persona
       LEFT JOIN telefonos_personas tp
              ON p.id_persona = tp.id_persona
             AND tp.es_principal = TRUE AND tp.activo = TRUE
       WHERE p.nombres = $1 AND p.apellidos = $2 AND (p.telefono = $3 OR tp.numero = $3)`,
      [datos.nombres, datos.apellidos, datos.telefono]
    );

    let idPersona: number;
    let tipoTutor: string;

    if (existente.rows.length > 0) {
      idPersona = existente.rows[0].id_persona;
      tipoTutor = existente.rows[0].tipo_tutor;

      // Verificar si ya está vinculado
      const yaVinculado = await cliente.query(
        'SELECT 1 FROM tutores_ninos WHERE id_tutor = $1 AND id_nino = $2',
        [idPersona, datos.idNino]
      );

      if (yaVinculado.rows.length === 0) {
        await cliente.query(
          'INSERT INTO tutores_ninos (id_tutor, id_nino, parentesco) VALUES ($1, $2, $3)',
          [idPersona, datos.idNino, datos.tipoTutor]
        );
      } else {
        await cliente.query(
          'UPDATE tutores_ninos SET parentesco = $1 WHERE id_tutor = $2 AND id_nino = $3',
          [datos.tipoTutor, idPersona, datos.idNino]
        );
      }
    } else {
      // Crear nueva persona (por compatibilidad insertamos en p.telefono)
      const personaRes = await cliente.query(
        `INSERT INTO personas (nombres, apellidos, telefono)
         VALUES ($1, $2, $3)
         RETURNING id_persona`,
        [datos.nombres, datos.apellidos, datos.telefono]
      );
      idPersona = personaRes.rows[0].id_persona;

      // Insertar número de teléfono en Telefonos_Personas
      await cliente.query(
        `INSERT INTO telefonos_personas (id_persona, tipo, numero, es_principal, activo)
         VALUES ($1, 'Casa', $2, TRUE, TRUE)`,
        [idPersona, datos.telefono]
      );

      // Crear registro en tutores
      await cliente.query(
        'INSERT INTO tutores (id_persona, tipo_tutor) VALUES ($1, $2)',
        [idPersona, datos.tipoTutor]
      );
      tipoTutor = datos.tipoTutor;

      // Vincular al niño
      await cliente.query(
        'INSERT INTO tutores_ninos (id_tutor, id_nino, parentesco) VALUES ($1, $2, $3)',
        [idPersona, datos.idNino, datos.tipoTutor]
      );
    }

    await cliente.query('COMMIT');

    // Retornar el tutor creado/vinculado usando COALESCE
    const resultado = await pool.query(
      `SELECT
        p.id_persona AS "idPersona",
        p.nombres,
        p.apellidos,
        p.nombres || ' ' || p.apellidos AS "nombreCompleto",
        COALESCE(tp.numero, p.telefono) AS "telefono",
        tn.parentesco AS "tipoTutor"
       FROM personas p
       JOIN tutores_ninos tn ON p.id_persona = tn.id_tutor
       LEFT JOIN telefonos_personas tp
              ON tp.id_persona = p.id_persona
             AND tp.es_principal = TRUE AND tp.activo = TRUE
       WHERE p.id_persona = $1 AND tn.id_nino = $2`,
      [idPersona, datos.idNino]
    );

    return resultado.rows[0];
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};

export const actualizarTutorRepo = async (idTutor: number, datos: {
  nombres: string;
  apellidos: string;
  telefono: string | null;
  tipoTutor: string;
}): Promise<TutorResultado> => {
  // Por compatibilidad actualizamos p.telefono
  await pool.query(
    `UPDATE Personas SET Nombres = $1, Apellidos = $2, Telefono = $3, Actualizado_En = NOW()
     WHERE ID_Persona = $4`,
    [datos.nombres, datos.apellidos, datos.telefono, idTutor]
  );

  // Sincronizar con Telefonos_Personas
  if (datos.telefono) {
    const telefonoExistente = await pool.query(
      `SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = $1 AND Es_Principal = TRUE AND Activo = TRUE`,
      [idTutor]
    );
    if (telefonoExistente.rows.length > 0) {
      await pool.query(
        `UPDATE Telefonos_Personas SET Numero = $1, Actualizado_En = NOW()
         WHERE ID_Persona = $2 AND Es_Principal = TRUE AND Activo = TRUE`,
        [datos.telefono, idTutor]
      );
    } else {
      await pool.query(
        `INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal, Activo)
         VALUES ($1, 'Casa', $2, TRUE, TRUE)`,
        [idTutor, datos.telefono]
      );
    }
  }

  await pool.query(
    `UPDATE Tutores SET Tipo_Tutor = $1 WHERE ID_Persona = $2`,
    [datos.tipoTutor, idTutor]
  );

  const resultado = await pool.query(
    `SELECT
      p.ID_Persona AS "idPersona",
      p.Nombres,
      p.Apellidos,
      p.Nombres || ' ' || p.Apellidos AS "nombreCompleto",
      COALESCE(tp.Numero, p.Telefono) AS "telefono",
      t.Tipo_Tutor AS "tipoTutor"
     FROM Tutores t
     JOIN Personas p ON t.ID_Persona = p.ID_Persona
     LEFT JOIN Telefonos_Personas tp
            ON tp.ID_Persona = p.ID_Persona
           AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
     WHERE p.ID_Persona = $1`,
    [idTutor]
  );

  return resultado.rows[0];
};
