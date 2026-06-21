import 'dotenv/config';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Aplicando migración v5_12...');
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE Tutores_Ninos 
      ADD COLUMN IF NOT EXISTS parentesco VARCHAR(60) NOT NULL DEFAULT 'Padre/Madre'
    `);

    await client.query(`
      UPDATE Tutores_Ninos tn
      SET parentesco = t.tipo_tutor
      FROM tutores t
      WHERE tn.id_tutor = t.id_persona
    `);

    await client.query('COMMIT');
    console.log('Migración aplicada exitosamente.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error aplicando migración:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
