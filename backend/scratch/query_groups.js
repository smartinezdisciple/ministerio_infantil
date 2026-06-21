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
    const res = await pool.query('SELECT * FROM Grupos');
    console.log('--- GRUPOS ---');
    console.table(res.rows);

    const res2 = await pool.query('SELECT * FROM Ninos_Grupos LIMIT 20');
    console.log('--- NINOS_GRUPOS ---');
    console.table(res2.rows);

    const res3 = await pool.query(`
      SELECT an.Fecha, an.ID_Nino, an.ID_Grupo_Asistido, g.Nombre AS Grupo_Asistido,
             ng.ID_Grupo AS ID_Grupo_Asignado, g2.Nombre AS Grupo_Asignado
      FROM Asistencia_Ninos an
      LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino = an.ID_Nino
      LEFT JOIN Grupos g ON g.ID_Grupo = an.ID_Grupo_Asistido
      LEFT JOIN Grupos g2 ON g2.ID_Grupo = ng.ID_Grupo
      LIMIT 10
    `);
    console.log('--- ASISTENCIA VS ASIGNACION ---');
    console.table(res3.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
