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
    await pool.query(`
      ALTER TABLE Fichas 
      ADD COLUMN IF NOT EXISTS Tipo VARCHAR(20) DEFAULT 'Entrada'
    `);
    console.log('Columna Tipo agregada a la tabla Fichas');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();