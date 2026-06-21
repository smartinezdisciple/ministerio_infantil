import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Srgio2304@localhost:5432/Ministerio_Infantil' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'solicitudes_personal' AND data_type = 'USER-DEFINED'
    `);
    console.log('USER-DEFINED types in solicitudes_personal:');
    res.rows.forEach(row => {
      console.log(` - ${row.column_name}: ${row.udt_name}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
