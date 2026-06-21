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
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'fichas' AND column_name = 'tipo'
    `);
    console.log('Columna Tipo:', rows);
    
    if (rows.length === 0) {
      console.log('La columna no existe, creando...');
      await pool.query(`ALTER TABLE Fichas ADD COLUMN IF NOT EXISTS Tipo VARCHAR(20) DEFAULT 'Entrada'`);
      console.log('Columna creada');
    } else {
      console.log('La columna ya existe');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();