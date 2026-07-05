// scripts/sync_neon_ps.cjs
// Crea entradas de Personal_Sistema en Neon para solicitudes aprobadas que no tienen.
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const NEON_URL = process.argv[2] || process.env.NEON_URL;
if (!NEON_URL) {
  console.error('❌ Debe proporcionar NEON_URL');
  process.exit(1);
}

const localPool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'Ministerio_Infantil',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'Srgio2304',
});

const neonPool = new Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  const { rows: neonSols } = await neonPool.query(
    'SELECT id_solicitud, id_persona, estado FROM Solicitudes_Personal WHERE id_solicitud >= 21 ORDER BY id_solicitud'
  );

  console.log(`📋 Verificando ${neonSols.length} solicitudes en Neon...`);

  let creados = 0;
  let saltados = 0;

  for (const sol of neonSols) {
    if (sol.estado !== 'Aprobado') continue;

    const { rows: existPS } = await neonPool.query(
      'SELECT id_persona FROM Personal_Sistema WHERE id_persona = $1',
      [sol.id_persona]
    );
    if (existPS.length > 0) {
      saltados++;
      continue;
    }

    const { rows: persona } = await neonPool.query(
      'SELECT Nombres || \' \' || Apellidos AS nombre FROM Personas WHERE id_persona = $1',
      [sol.id_persona]
    );
    const nombre = persona[0]?.nombre || 'Desconocido';

    const tempUsuario = `temp_${sol.id_persona}`;
    const tempPassword = crypto.randomUUID();
    const hash = await bcrypt.hash(tempPassword, 12);

    await neonPool.query(`
      INSERT INTO Personal_Sistema
        (ID_Persona, ID_Rol, Usuario, Password_Hash,
         Fecha_Ingreso_Servicio, ID_Solicitud_Origen)
      VALUES ($1, 1, $2, $3, CURRENT_DATE, $4)
    `, [sol.id_persona, tempUsuario, hash, sol.id_solicitud]);

    console.log(`  ✅ ${nombre} (ID ${sol.id_persona}) -> usuario: ${tempUsuario}`);
    creados++;
  }

  console.log(`\n✅ Creados: ${creados}, ℹ️  Ya existían: ${saltados}`);

  await localPool.end();
  await neonPool.end();
})();
