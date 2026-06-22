import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({
  host:     process.env.PGHOST,
  port:     Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl:      { rejectUnauthorized: false }
});

async function run() {
  console.log('--- Iniciando checkout masivo para el 2026-06-21 (Domingo 5pm) ---');
  try {
    // 1. Obtener ID del turno 'Domingo_5pm'
    const turnoRes = await pool.query(
      "SELECT ID_Turno AS \"idTurno\" FROM Turnos WHERE Nombre = 'Domingo_5pm'"
    );
    if ((turnoRes.rowCount ?? 0) === 0) {
      console.error('❌ No se encontró el turno Domingo_5pm');
      return;
    }
    const idTurno = turnoRes.rows[0].idTurno;
    console.log(`✅ ID del turno Domingo_5pm: ${idTurno}`);

    // 2. Obtener asistencias del 2026-06-21 en ese turno que estén en estado 'Presente'
    const asistenciasRes = await pool.query(
      `SELECT ID_Asistencia AS "idAsistencia", ID_Nino AS "idNino" 
       FROM Asistencia_Ninos 
       WHERE Fecha = '2026-06-21' AND ID_Turno = $1 AND Estado = 'Presente'`,
      [idTurno]
    );

    console.log(`📋 Encontradas ${asistenciasRes.rowCount} asistencias de niños pendientes.`);

    let actualizados = 0;

    for (const row of asistenciasRes.rows) {
      const idAsistencia = row.idAsistencia;
      const idNino = row.idNino;

      // 3. Buscar el primer tutor asignado al niño en Tutores_Ninos
      const tutorRes = await pool.query(
        `SELECT ID_Tutor AS "idTutor" FROM Tutores_Ninos WHERE ID_Nino = $1 ORDER BY ID_Tutor LIMIT 1`,
        [idNino]
      );

      let idTutor: number | null = null;
      if ((tutorRes.rowCount ?? 0) > 0) {
        idTutor = tutorRes.rows[0].idTutor;
      } else {
        // Fallback a cualquier tutor existente en la tabla Tutores para evitar errores de clave foránea
        const fallbackRes = await pool.query(
          `SELECT ID_Persona AS "idTutor" FROM Tutores LIMIT 1`
        );
        if ((fallbackRes.rowCount ?? 0) > 0) {
          idTutor = fallbackRes.rows[0].idTutor;
        }
      }

      if (!idTutor) {
        console.warn(`⚠️ El niño con ID ${idNino} no tiene tutor y no hay tutores en el sistema. Saltando.`);
        continue;
      }

      // 4. Hacer el UPDATE. Esto activará el trigger fn_validar_retiro_nino. 
      await pool.query(
        `UPDATE Asistencia_Ninos
         SET Hora_Salida = '19:00:00',
             ID_Retirado_Por = $1,
             Estado = 'Retirado'
         WHERE ID_Asistencia = $2`,
        [idTutor, idAsistencia]
      );
      actualizados++;
    }

    console.log(`🎉 Se completó el proceso. Total niños actualizados a 'Retirado': ${actualizados}`);
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    await pool.end();
  }
}

run();
