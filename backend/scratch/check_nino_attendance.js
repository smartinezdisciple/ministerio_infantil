import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'Ministerio_Infantil',
  user: 'postgres',
  password: 'Srgio2304'
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT an.ID_Asistencia, an.Fecha, an.ID_Turno, t.Nombre AS Turno,
             an.Hora_Entrada, an.Hora_Salida, an.Estado,
             an.ID_Ingresado_Por, p.Nombres || ' ' || p.Apellidos AS Ingresado_Por
      FROM Asistencia_Ninos an
      JOIN Turnos t ON t.ID_Turno = an.ID_Turno
      LEFT JOIN Personas p ON p.ID_Persona = an.ID_Ingresado_Por
      WHERE an.ID_Nino = 264 AND an.Fecha = '2026-06-14'
    `);
    console.log('Asistencias para Nino 264 en 2026-06-14:');
    console.table(res.rows);

    const res2 = await pool.query(`
      SELECT an.ID_Asistencia, an.Fecha, an.ID_Turno, t.Nombre AS Turno,
             an.Hora_Entrada, an.Hora_Salida, an.Estado,
             an.ID_Ingresado_Por, p.Nombres || ' ' || p.Apellidos AS Ingresado_Por
      FROM Asistencia_Ninos an
      JOIN Turnos t ON t.ID_Turno = an.ID_Turno
      LEFT JOIN Personas p ON p.ID_Persona = an.ID_Ingresado_Por
      WHERE an.ID_Nino = 325 AND an.Fecha = '2026-06-14'
    `);
    console.log('Asistencias para Nino 325 en 2026-06-14:');
    console.table(res2.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
