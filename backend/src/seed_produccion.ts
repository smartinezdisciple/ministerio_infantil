// src/seed_produccion.ts — Sembrado seguro no destructivo para producción
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from './config/db.js';

// Datos del usuario admin inicial
const USUARIO_ADMIN    = 'admin';
const CONTRASENA_ADMIN = 'AdminDiosEsFiel123!';

async function runSeed() {
  console.log('🌱 Iniciando sembrado seguro para producción...');
  let cliente;
  try {
    cliente = await pool.connect();
    await cliente.query('BEGIN');

    // ── 1. Roles del sistema ──────────────────────────────────────────
    const countRolesRes = await cliente.query('SELECT COUNT(*)::int AS count FROM Roles');
    const rolesCount = countRolesRes.rows[0].count;
    const idRolesPorNombre: Record<string, number> = {};

    if (rolesCount === 0) {
      console.log('👉 Sembrando roles...');
      const rolesBase = [
        { nombre: 'Colaborador',        nivel: 1 },
        { nombre: 'Maestro',            nivel: 2 },
        { nombre: 'Staff',              nivel: 3 },
        { nombre: 'Coordinador General', nivel: 4 },
      ];

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
    } else {
      console.log('ℹ️  Los roles ya existen. Cargando IDs...');
      const res = await cliente.query('SELECT ID_Rol AS "idRol", Nombre_Rol AS "nombre" FROM Roles');
      for (const row of res.rows) {
        idRolesPorNombre[row.nombre] = row.idRol;
      }
    }

    // ── 2. Grupos etarios ─────────────────────────────────────────────
    const countGruposRes = await cliente.query('SELECT COUNT(*)::int AS count FROM Grupos');
    if (countGruposRes.rows[0].count === 0) {
      console.log('👉 Sembrando grupos etarios...');
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
    } else {
      console.log('ℹ️  Los grupos ya existen. Saltando...');
    }

    // ── 3. Turnos ─────────────────────────────────────────────────────
    const countTurnosRes = await cliente.query('SELECT COUNT(*)::int AS count FROM Turnos');
    const idTurnosPorNombre: Record<string, number> = {};

    if (countTurnosRes.rows[0].count === 0) {
      console.log('👉 Sembrando turnos...');
      const turnosBase = [
        { nombre: 'Miercoles',    dia: 3, hora: '19:00:00' },
        { nombre: 'Domingo_8am',  dia: 0, hora: '08:00:00' },
        { nombre: 'Domingo_11am', dia: 0, hora: '11:00:00' },
        { nombre: 'Domingo_5pm',  dia: 0, hora: '17:00:00' },
      ];

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
    } else {
      console.log('ℹ️  Los turnos ya existen. Saltando...');
    }

    // ── 4. Requisitos ─────────────────────────────────────────────────
    const countRequisitosRes = await cliente.query('SELECT COUNT(*)::int AS count FROM Requisitos');
    if (countRequisitosRes.rows[0].count === 0) {
      console.log('👉 Sembrando requisitos...');
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
    } else {
      console.log('ℹ️  Los requisitos ya existen. Saltando...');
    }

    // ── 5. Usuario administrador en Personal_Sistema ──────────────────
    const checkAdminRes = await cliente.query(
      `SELECT COUNT(*)::int AS count FROM Personal_Sistema WHERE Usuario = $1`,
      [USUARIO_ADMIN]
    );

    if (checkAdminRes.rows[0].count === 0) {
      console.log('👉 Sembrando usuario administrador...');
      
      // 5.1 Persona administrador
      const insPersona = await cliente.query(
        `INSERT INTO Personas (Nombres, Apellidos, Telefono, Fecha_Nacimiento)
         VALUES ('Administrador', 'Sistema', '0000-SEED-ADMIN', '1990-01-01')
         RETURNING ID_Persona`,
      );
      const idPersona = insPersona.rows[0].id_persona ?? insPersona.rows[0].ID_Persona;
      console.log(`  ✅ Persona "Administrador Sistema" creada (ID: ${idPersona})`);

      // 5.2 Usuario administrador en Personal_Sistema
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
      const hash = await bcrypt.hash(CONTRASENA_ADMIN, saltRounds);

      const rolId = idRolesPorNombre['Coordinador General'];
      if (!rolId) {
        throw new Error('No se pudo encontrar el ID para el rol "Coordinador General".');
      }

      await cliente.query(
        `INSERT INTO Personal_Sistema
           (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, Activo)
         VALUES ($1, $2, $3, $4, CURRENT_DATE, true)`,
        [idPersona, rolId, USUARIO_ADMIN, hash]
      );
      console.log(`  ✅ Usuario administrador "${USUARIO_ADMIN}" creado.`);

      // 5.3 Asignar turnos al Administrador si fueron sembrados en esta corrida
      if (Object.keys(idTurnosPorNombre).length > 0) {
        for (const idTurno of Object.values(idTurnosPorNombre)) {
          await cliente.query(
            `INSERT INTO Personal_Turnos (ID_Personal, ID_Turno) VALUES ($1, $2)`,
            [idPersona, idTurno]
          );
        }
        console.log('  ✅ Asignados turnos al administrador.');
      }
    } else {
      console.log('ℹ️  El usuario administrador ya existe. Saltando...');
    }

    await cliente.query('COMMIT');
    console.log('✅ Sembrado seguro completado.');
    console.log('─────────────────────────────────────────');
    console.log('🟢 Credenciales de acceso:');
    console.log(`   Usuario:    ${USUARIO_ADMIN}`);
    console.log(`   Contraseña: ${CONTRASENA_ADMIN}`);
    console.log('─────────────────────────────────────────\n');

  } catch (error) {
    if (cliente) {
      await cliente.query('ROLLBACK');
    }
    console.error('❌ Error ejecutando seed de producción:', error);
    process.exit(1);
  } finally {
    if (cliente) {
      cliente.release();
    }
    await pool.end();
  }
}

runSeed();
