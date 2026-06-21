import 'dotenv/config';
import pkg from 'pg';
import fs from 'fs';
import path from 'path';

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
    const sqlPath = path.join(process.cwd(), 'migracion_v5_1.sql');
    console.log(`Leyendo script de migración desde: ${sqlPath}`);
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`No se encontró el archivo de migración en la ruta: ${sqlPath}`);
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el script por el marcador de ejecución
    const parts = sql.split('-- === SPLIT ===');
    console.log(`Se detectaron ${parts.length} partes para ejecutar secuencialmente.`);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      console.log(`Ejecutando parte ${i + 1}/${parts.length}...`);
      await client.query(part);
      console.log(`Parte ${i + 1} ejecutada con éxito.`);
    }

    console.log('¡Migración v5.1 ejecutada con éxito en la base de datos!');
  } catch (err) {
    console.error('Error al ejecutar la migración:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
