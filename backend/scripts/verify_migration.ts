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
  try {
    console.log('--- VERIFICACIÓN DE MIGRACIÓN v5.1 ---');

    const resTelefonos = await pool.query('SELECT COUNT(*) FROM Telefonos_Personas');
    console.log(`Cantidad de teléfonos registrados: ${resTelefonos.rows[0].count}`);

    const resDirecciones = await pool.query('SELECT COUNT(*) FROM Personas_Direcciones');
    console.log(`Cantidad de direcciones registradas: ${resDirecciones.rows[0].count}`);

    const resInfoPersonal = await pool.query('SELECT COUNT(*), COUNT(direccion) FROM personal_info_personal');
    console.log(`Filas en personal_info_personal: ${resInfoPersonal.rows[0].count}, con direccion no nula: ${resInfoPersonal.rows[0].count_1 || resInfoPersonal.rows[0].count}`);
    console.log('Fila cruda:', resInfoPersonal.rows[0]);

    const resTipos = await pool.query("SELECT typname FROM pg_type WHERE typname IN ('tipo_sexo','tipo_telefono','estado_operativo')");
    console.log('Tipos ENUM creados:', resTipos.rows.map(r => r.typname).join(', '));

    const resColumnas = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'personas' AND column_name IN ('sexo','cedula')");
    console.log('Columnas nuevas en Personas:');
    console.table(resColumnas.rows);

    const resColsInfo = await pool.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'personal_info_personal'");
    console.log('Columnas en Personal_Info_Personal:');
    console.table(resColsInfo.rows);

    const resColsIglesia = await pool.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'personal_info_iglesia'");
    console.log('Columnas en Personal_Info_Iglesia:');
    console.table(resColsIglesia.rows);

  } catch (err) {
    console.error('Error durante la verificación:', err);
  } finally {
    await pool.end();
  }
}

main();
