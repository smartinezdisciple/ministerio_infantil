import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Srgio2304@localhost:5432/Ministerio_Infantil' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT prosrc 
      FROM pg_proc 
      WHERE proname = 'fn_propagar_datos_solicitud_aprobada'
    `);
    console.log('=== fn_propagar_datos_solicitud_aprobada ===');
    console.log(res.rows[0]?.prosrc);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
