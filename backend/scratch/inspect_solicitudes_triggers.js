import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Srgio2304@localhost:5432/Ministerio_Infantil' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT tgname, pg_get_triggerdef(tg.oid) 
      FROM pg_trigger tg 
      JOIN pg_class cl ON cl.oid = tg.tgrelid 
      WHERE cl.relname = 'solicitudes_personal'
    `);
    console.log('=== Triggers on solicitudes_personal ===');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
