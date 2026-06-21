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
    console.log('--- TRIGGERS EN SOLICITUDES_PERSONAL ---');
    const resTrig = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE event_object_table IN ('solicitudes_personal', 'personal_sistema')
    `);
    console.table(resTrig.rows);

    console.log('--- BUSCANDO TEXTO DE FUNCIONES ---');
    const resFunc = await client.query(`
      SELECT proname, prosrc
      FROM pg_proc
      WHERE proname IN ('fn_propagar_datos_solicitud_aprobada', 'fn_validar_requisitos_solicitud')
    `);
    resFunc.rows.forEach(r => {
      console.log(`\nFuncion: ${r.proname}`);
      console.log(r.prosrc);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
