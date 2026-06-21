import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Srgio2304@localhost:5432/Ministerio_Infantil' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'personal_info_personal'
    `);
    console.log('Columns of personal_info_personal:');
    res.rows.forEach(row => {
      console.log(` - ${row.column_name}: ${row.data_type} (${row.udt_name})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
