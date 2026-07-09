// scripts/sync_neon_requisitos.cjs
// Inserta Solicitudes_Requisitos en Neon para las nuevas solicitudes (21-43).
const { Pool } = require('pg');

const NEON_URL = process.argv[2] || process.env.NEON_URL;
if (!NEON_URL) {
  console.error('Uso: NEON_URL="postgresql://..." node scripts/sync_neon_requisitos.cjs');
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

// Mapeo ordenado: local solicitud ID → Neon solicitud ID
// Basado en el orden de procesamiento del sync original
const localIds = [24,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50];
const neonIds  = [21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43];

const mapLocalToNeon = {};
localIds.forEach((l, i) => { mapLocalToNeon[l] = neonIds[i]; });

(async () => {
  console.log('📋 Sincronizando Solicitudes_Requisitos Local → Neon');
  console.log(`   ${localIds.length} solicitudes a mapear`);
  console.log('');

  // Obtener requisitos que ya existen en Neon
  const { rows: neonReqs } = await neonPool.query(
    'SELECT DISTINCT id_solicitud FROM Solicitudes_Requisitos'
  );
  const neonReqsSolIds = new Set(neonReqs.map(r => r.id_solicitud));

  let insertados = 0;
  let saltados = 0;

  for (let i = 0; i < localIds.length; i++) {
    const localId = localIds[i];
    const neonId = neonIds[i];

    if (neonReqsSolIds.has(neonId)) {
      saltados++;
      continue;
    }

    const { rows: reqs } = await localPool.query(
      'SELECT id_requisito, cumplido, fecha_cumplido, notas FROM Solicitudes_Requisitos WHERE id_solicitud = $1',
      [localId]
    );

    if (reqs.length === 0) {
      console.log(`  ℹ️  Solicitud local ${localId} → Neon ${neonId}: sin requisitos`);
      saltados++;
      continue;
    }

    for (const r of reqs) {
      await neonPool.query(
        'INSERT INTO Solicitudes_Requisitos (id_solicitud, id_requisito, cumplido, fecha_cumplido, notas) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [neonId, r.id_requisito, r.cumplido, r.fecha_cumplido, r.notas]
      );
    }

    console.log(`  ✅ Solicitud ${localId} → Neon ${neonId}: ${reqs.length} requisitos`);
    insertados++;
  }

  console.log(`\n✅ Insertados: ${insertados}, ℹ️  Saltados: ${saltados}`);

  await localPool.end();
  await neonPool.end();
})();
