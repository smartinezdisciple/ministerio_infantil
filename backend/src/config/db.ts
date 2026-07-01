// src/config/db.ts — Pool de conexión a PostgreSQL (CLAUDE.md §2, §4.1)
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

// ── Verificación de variables críticas (CLAUDE.md §1) ─────────────
// En entorno de test se omite para permitir importar el módulo sin BD real.
if (process.env.NODE_ENV !== 'test') {
  const variablesCriticas = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'JWT_SECRET', 'BCRYPT_SALT_ROUNDS'];
  for (const variable of variablesCriticas) {
    if (!process.env[variable]) {
      console.error(`❌ Variable de entorno faltante: ${variable}. El servidor no puede iniciar.`);
      process.exit(1);
    }
  }
}

/** Pool reutilizable de conexiones a PostgreSQL. No usar pg.Client directamente. */
export const pool = new Pool({
  host:     process.env.PGHOST,
  port:     Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max:      5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 600000,
  allowExitOnIdle: false,
  // SSL requerido por Neon en producción
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Keepalive: evita que Neon cierre conexiones inactivas prematuramente
// .unref() permite que Node termine aunque el timer exista
setInterval(() => {
  pool.query('SELECT 1').catch(() => {});
}, 240_000).unref();

/**
 * Verifica la conexión a PostgreSQL.
 * Debe llamarse SOLO desde server.ts (no desde app.ts) para que los tests
 * puedan importar app sin necesitar una BD real.
 */
export const verificarConexionDB = (): void => {
  pool.connect((error, _cliente, liberar) => {
    if (error) {
      console.error('❌ No se pudo conectar a PostgreSQL:', error.message);
      process.exit(1);
    }
    liberar?.();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
  });
};

export default pool;
