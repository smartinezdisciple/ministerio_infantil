import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

async function main() {
  try {
    const { rows } = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name ILIKE '%tutor%'
    `);
    console.log('Tablas de tutor:', rows);
    
    // Verificar columnas de personas
    const { rows: cols } = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'personas' AND column_name ILIKE '%telefono%'
    `);
    console.log('Columnas telefono en personas:', cols);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();