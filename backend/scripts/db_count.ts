import pool from '../src/config/db.js';

async function main() {
  const ninosCount = await pool.query('SELECT COUNT(*) FROM Ninos');
  const tutoresCount = await pool.query('SELECT COUNT(*) FROM Tutores');
  const personasCount = await pool.query('SELECT COUNT(*) FROM Personas');
  const relCount = await pool.query('SELECT COUNT(*) FROM Tutores_Ninos');
  const grupoCount = await pool.query('SELECT COUNT(*) FROM Ninos_Grupos');

  console.log('Database Counts:');
  console.log(`- Personas: ${personasCount.rows[0].count}`);
  console.log(`- Ninos: ${ninosCount.rows[0].count}`);
  console.log(`- Tutores: ${tutoresCount.rows[0].count}`);
  console.log(`- Tutores_Ninos relationships: ${relCount.rows[0].count}`);
  console.log(`- Ninos_Grupos: ${grupoCount.rows[0].count}`);

  await pool.end();
}

main().catch(console.error);
