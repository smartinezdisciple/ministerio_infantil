// backend/scripts/seed.ts — Datos iniciales para desarrollo y pruebas
// Esquema real: Personal_Sistema usa Usuario/Password_Hash/Fecha_Ingreso_Servicio
// Personas no tiene Notas_Medicas ni Correo
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;
const esLocal = process.env.PGHOST === 'localhost' || process.env.PGHOST === '127.0.0.1';
const pool = new Pool({
  host:     process.env.PGHOST,
  port:     Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: esLocal ? false : { rejectUnauthorized: false },
});

// Datos del usuario admin inicial
const USUARIO_ADMIN    = 'admin';
const CONTRASENA_ADMIN = 'AdminDiosEsFiel123!';

async function runSeed() {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    console.log('🌱 Iniciando limpieza y seed de datos iniciales...\n');

    // ── 0. Limpieza completa de la Base de Datos ──────────────────────
    console.log('  🧹 Truncando tablas y reiniciando secuencias...');
    await cliente.query(`
      TRUNCATE TABLE
        asistencia_ninos,
        asistencia_maestros,
        personal_grupos,
        personal_turnos,
        personal_requisitos,
        personal_info_personal,
        personal_info_iglesia,
        personal_sistema,
        solicitudes_requisitos,
        solicitudes_personal,
        info_medica_ninos,
        ninos_grupos,
        tutores_ninos,
        tutores,
        ninos,
        personas,
        eventos,
        fichas,
        redes,
        requisitos,
        turnos,
        grupos,
        roles
      RESTART IDENTITY CASCADE
    `);
    console.log('  ✅ Base de datos limpia.');

    // ── 1. Roles del sistema ──────────────────────────────────────────
    const rolesBase = [
      { nombre: 'Colaborador',        nivel: 1 },
      { nombre: 'Maestro',            nivel: 2 },
      { nombre: 'Staff',              nivel: 3 },
      { nombre: 'Coordinador General', nivel: 4 },
    ];

    const idRolesPorNombre: Record<string, number> = {};
    for (const rol of rolesBase) {
      const res = await cliente.query(
        `INSERT INTO Roles (Nombre_Rol, Nivel_Jerarquico)
         VALUES ($1, $2)
         RETURNING ID_Rol`,
        [rol.nombre, rol.nivel]
      );
      idRolesPorNombre[rol.nombre] = res.rows[0].id_rol ?? res.rows[0].ID_Rol;
      console.log(`  ✅ Rol "${rol.nombre}" (nivel ${rol.nivel})`);
    }

    // ── 2. Grupos etarios ─────────────────────────────────────────────
    const gruposBase = [
      { nombre: '4-6 años',   edadMin: 0,  edadMax: 6  },
      { nombre: '7-9 años',   edadMin: 7,  edadMax: 9  },
      { nombre: '10-12 años', edadMin: 10, edadMax: 12 },
    ];

    for (const g of gruposBase) {
      await cliente.query(
        `INSERT INTO Grupos (Nombre, Edad_Minima, Edad_Maxima)
         VALUES ($1, $2, $3)`,
        [g.nombre, g.edadMin, g.edadMax]
      );
      console.log(`  ✅ Grupo "${g.nombre}"`);
    }

    // ── 3. Turnos ─────────────────────────────────────────────────────
    const turnosBase = [
      { nombre: 'Miercoles',    dia: 3, hora: '19:00:00' },
      { nombre: 'Domingo_8am',  dia: 0, hora: '08:00:00' },
      { nombre: 'Domingo_11am', dia: 0, hora: '11:00:00' },
      { nombre: 'Domingo_5pm',  dia: 0, hora: '17:00:00' },
    ];
    const idTurnosPorNombre: Record<string, number> = {};
    for (const t of turnosBase) {
      const res = await cliente.query(
        `INSERT INTO Turnos (Nombre, Dia_Semana, Hora_Inicio)
         VALUES ($1, $2, $3)
         RETURNING ID_Turno`,
        [t.nombre, t.dia, t.hora]
      );
      idTurnosPorNombre[t.nombre] = res.rows[0].id_turno ?? res.rows[0].ID_Turno;
      console.log(`  ✅ Turno "${t.nombre}"`);
    }

    // ── 4. Requisitos ─────────────────────────────────────────────────
    const requisitosBase = [
      { nombre: 'Escuela de Nuevos Creyentes', tipo: 'Formacion', obligatorio: true },
      { nombre: 'PEEH',                        tipo: 'Formacion', obligatorio: false },
      { nombre: 'BEE',                         tipo: 'Formacion', obligatorio: false },
      { nombre: 'Escuela de Artes',            tipo: 'Formacion', obligatorio: false },
      { nombre: 'Escuela de Obreros',          tipo: 'Formacion', obligatorio: false },
    ];
    for (const req of requisitosBase) {
      await cliente.query(
        `INSERT INTO Requisitos (Nombre, Tipo, Obligatorio)
         VALUES ($1, $2, $3)`,
        [req.nombre, req.tipo, req.obligatorio]
      );
    }
    console.log('  ✅ Requisitos base sembrados.');

    // ── 5. Persona administrador ──────────────────────────────────────
    const insPersona = await cliente.query(
      `INSERT INTO Personas (Nombres, Apellidos, Telefono, Fecha_Nacimiento)
       VALUES ('Administrador', 'Sistema', '0000-SEED-ADMIN', '1990-01-01')
       RETURNING ID_Persona`,
    );
    const idPersona = insPersona.rows[0].id_persona ?? insPersona.rows[0].ID_Persona;
    console.log(`  ✅ Persona "Administrador Sistema" creada (ID: ${idPersona})`);

    // ── 6. Usuario administrador en Personal_Sistema ──────────────────
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    const hash = await bcrypt.hash(CONTRASENA_ADMIN, saltRounds);

    await cliente.query(
      `INSERT INTO Personal_Sistema
         (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, Activo)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, true)`,
      [idPersona, idRolesPorNombre['Coordinador General'], USUARIO_ADMIN, hash]
    );
    console.log(`  ✅ Usuario administrador "${USUARIO_ADMIN}" creado.`);

    // ── 7. Asignar turnos al Administrador ────────────────────────────
    for (const idTurno of Object.values(idTurnosPorNombre)) {
      await cliente.query(
        `INSERT INTO Personal_Turnos (ID_Personal, ID_Turno) VALUES ($1, $2)`,
        [idPersona, idTurno]
      );
    }
    console.log('  ✅ Asignados los 4 turnos al administrador.');

    await cliente.query('COMMIT');

    console.log('\n─────────────────────────────────────────');
    console.log('🟢 Credenciales de acceso inicial:');
    console.log(`   Usuario:    ${USUARIO_ADMIN}`);
    console.log(`   Contraseña: ${CONTRASENA_ADMIN}`);
    console.log('─────────────────────────────────────────');
    console.log('⚠️  Cambia la contraseña tras el primer inicio de sesión.\n');

  } catch (error) {
    await cliente.query('ROLLBACK');
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  } finally {
    cliente.release();
    await pool.end();
  }
}

runSeed();
