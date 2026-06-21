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
    const tableRes1 = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE LOWER(table_name) IN ('personas', 'ninos')
      ORDER BY table_name, ordinal_position
    `);
    console.log('--- Columns in Personas and Ninos ---');
    console.table(tableRes1.rows);

    const tableRes2 = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE LOWER(table_name) = 'tutores_ninos'
      ORDER BY ordinal_position
    `);
    console.log('--- Columns in Tutores_Ninos ---');
    console.table(tableRes2.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
