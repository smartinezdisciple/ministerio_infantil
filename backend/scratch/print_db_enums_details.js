import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Srgio2304@localhost:5432/Ministerio_Infantil' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT t.typname AS enum_name, e.enumlabel AS enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid
      ORDER BY enum_name, e.enumsortorder
    `);
    console.log('=== DB ENUMS ===');
    const enums = {};
    res.rows.forEach(row => {
      if (!enums[row.enum_name]) enums[row.enum_name] = [];
      enums[row.enum_name].push(row.enum_value);
    });
    console.log(enums);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
