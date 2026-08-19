#!/usr/bin/env node
// Cambia las contraseñas de Juan Carlos (11am) y Luis Castrillo.
// Uso:  node --env-file=.env.neon scripts/cambiar_contrasenas.mjs
//       node --env-file=.env    scripts/cambiar_contrasenas.mjs   (BD local)
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
  connectionTimeoutMillis: 30000,
  ssl: { rejectUnauthorized: false },
});

// Buscar por nombre + turno Domingo_11am, sin hardcodear IDs (los IDs pueden
// diferir entre local y Neon).
const TARGETS = [
  { nombreCompleto: '%juan carlos%urbina%', clave: 'Infantil3002',   etiqueta: 'Juan Carlos (11am)' },
  { nombreCompleto: '%luis castrillo%',     clave: 'LuisCastrillo1', etiqueta: 'Luis Castrillo' },
];

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
  console.log('Conectado a', process.env.PGHOST, '/', process.env.PGDATABASE);
  let cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    for (const t of TARGETS) {
      const res = await cliente.query(
        `SELECT ps.ID_Persona, p.Nombres, p.Apellidos, ps.Usuario,
                COALESCE(array_agg(t.Nombre ORDER BY t.Nombre),'{}') AS turnos
         FROM Personal_Sistema ps
         JOIN Personas p ON p.ID_Persona = ps.ID_Persona
         LEFT JOIN Personal_Turnos pt ON pt.ID_Personal = ps.ID_Persona
         LEFT JOIN Turnos t ON t.ID_Turno = pt.ID_Turno
         WHERE LOWER(p.Nombres || ' ' || p.Apellidos) LIKE $1
         GROUP BY ps.ID_Persona, p.Nombres, p.Apellidos, ps.Usuario`,
        [t.nombreCompleto]
      );
      if (res.rows.length === 0) {
        console.log(`❌ ${t.etiqueta}: no encontrado`);
        continue;
      }
      if (res.rows.length > 1) {
        console.log(`⚠️  ${t.etiqueta}: ${res.rows.length} coincidencias — NO se modificó nada`);
        for (const r of res.rows) console.log('   ->', r.id_persona, r.nombres, r.apellidos, r.usuario, r.turnos);
        continue;
      }
      const row = res.rows[0];
      const hash = await bcrypt.hash(t.clave, saltRounds);
      const upd = await cliente.query(
        `UPDATE Personal_Sistema SET Password_Hash = $2 WHERE ID_Persona = $1`,
        [row.id_persona, hash]
      );
      if (upd.rowCount === 1) {
        const verif = await bcrypt.compare(t.clave, hash);
        console.log(`✅ ${t.etiqueta} (ID ${row.id_persona}, user=${row.usuario}, turnos=${JSON.stringify(row.turnos)}) → contraseña actualizada. Verificación hash: ${verif}`);
      } else {
        console.log(`❌ ${t.etiqueta}: error al actualizar`);
      }
    }
    await cliente.query('COMMIT');
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
    await pool.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });