import 'dotenv/config';
import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const client = await pool.connect();
  try {
    const queries = [
      "ALTER TYPE condicion_civil ADD VALUE IF NOT EXISTS 'Segundo_Matrimonio'",
      "ALTER TYPE condicion_civil ADD VALUE IF NOT EXISTS 'Tercer_Matrimonio'",
      "ALTER TYPE condicion_civil ADD VALUE IF NOT EXISTS 'Otro_Matrimonio'"
    ];

    for (const query of queries) {
      console.log(`Ejecutando: ${query}`);
      try {
        await client.query(query);
      } catch (e) {
        // ADD VALUE might fail if it already exists in some postgres configs, even with IF NOT EXISTS
        console.log(`Nota: ${e.message}`);
      }
    }

    // Ahora leer la función del archivo y ejecutarla
    const sqlPath = path.join(__dirname, 'migracion_v5_7.sql');
    console.log(`Leyendo script de migración desde: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Extraer la parte de la función
    const functionStartIdx = sql.indexOf('CREATE OR REPLACE FUNCTION');
    if (functionStartIdx === -1) {
      throw new Error('No se encontró la definición de CREATE OR REPLACE FUNCTION');
    }
    const functionSql = sql.substring(functionStartIdx);

    console.log('Ejecutando CREATE OR REPLACE FUNCTION...');
    await client.query(functionSql);
    console.log('¡Función propagar_datos_solicitud_aprobada recreada con éxito!');

    console.log('--- VERIFICACIÓN DE VALORES EN ENUM ---');
    const res = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'condicion_civil'::regtype
    `);
    console.log('Valores actuales del enum condicion_civil:');
    console.log(res.rows.map(r => r.enumlabel));

  } catch (err) {
    console.error('Error al ejecutar la migración:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
