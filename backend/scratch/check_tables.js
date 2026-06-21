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
      WHERE LOWER(table_name) IN ('solicitudes_personal', 'personal_info_iglesia')
      ORDER BY table_name, column_name
    `);
    console.log('--- Columns in Solicitudes_Personal and Personal_Info_Iglesia ---');
    console.table(tableRes1.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
