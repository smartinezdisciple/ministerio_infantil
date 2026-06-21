import request from 'supertest';
import app from '../../../../src/app.js';
import pool from '../../../../src/config/db.js';
import bcrypt from 'bcryptjs';

describe('MVP-04: Gestión y Control de Personal del Sistema', () => {
  let adminToken: string;
  let staffToken: string;
  let adminId: number;
  let testStaffId: number;
  let testMaestroId: number;
  
  let rolMaestroId: number;
  let rolStaffId: number;
  let rolCoordId: number;
  
  let testTurnosIds: number[] = [];

  beforeAll(async () => {
    // 1. Obtener ID de Roles
    const { rows: rolesRows } = await pool.query("SELECT ID_Rol AS id, Nombre_Rol AS nombre FROM Roles");
    rolMaestroId = rolesRows.find(r => r.nombre === 'Maestro')?.id;
    rolStaffId = rolesRows.find(r => r.nombre === 'Staff')?.id;
    rolCoordId = rolesRows.find(r => r.nombre === 'Coordinador General')?.id;

    // 2. Obtener Turnos activos para test
    const { rows: turnosRows } = await pool.query("SELECT ID_Turno AS id FROM Turnos LIMIT 4");
    testTurnosIds = turnosRows.map(t => t.id);

    // 3. Login como Admin (se presupone que existe por el seed)
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', contrasena: 'AdminDiosEsFiel123!' });
    adminToken = adminLogin.body.datos.token;
    
    // Obtener ID del admin
    const adminInfo = await pool.query("SELECT ID_Persona FROM Personal_Sistema WHERE Usuario = 'admin'");
    adminId = adminInfo.rows[0].id_persona ?? adminInfo.rows[0].ID_Persona;

    // 4. Crear un Staff de prueba para probar jerarquías
    const hash = await bcrypt.hash('StaffPassword123!', 12);
    const personaStaff = await pool.query(
      "INSERT INTO Personas (Nombres, Apellidos) VALUES ('Staff', 'Test') RETURNING ID_Persona"
    );
    testStaffId = personaStaff.rows[0].id_persona ?? personaStaff.rows[0].ID_Persona;
    
    await pool.query(
      `INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, Activo)
       VALUES ($1, $2, 'test_staff', $3, CURRENT_DATE, true)`,
      [testStaffId, rolStaffId, hash]
    );

    // Asignar un turno al staff de prueba
    await pool.query(
      "INSERT INTO Personal_Turnos (ID_Personal, ID_Turno) VALUES ($1, $2)",
      [testStaffId, testTurnosIds[0]]
    );

    // Login del Staff de prueba para obtener su token
    const staffLogin = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'test_staff', contrasena: 'StaffPassword123!' });
    staffToken = staffLogin.body.datos.token;
  });

  afterAll(async () => {
    // Limpieza
    if (testMaestroId) {
      await pool.query("DELETE FROM Personal_Grupos WHERE ID_Personal = $1", [testMaestroId]);
      await pool.query("DELETE FROM Personal_Turnos WHERE ID_Personal = $1", [testMaestroId]);
      await pool.query("DELETE FROM Personal_Sistema WHERE ID_Persona = $1", [testMaestroId]);
      await pool.query("DELETE FROM Personas WHERE ID_Persona = $1", [testMaestroId]);
    }

    // Eliminar cualquier otro personal creado durante las pruebas
    await pool.query("DELETE FROM Personal_Grupos WHERE ID_Personal IN (SELECT id_persona FROM personal_sistema WHERE usuario LIKE 'test_temp%')");
    await pool.query("DELETE FROM Personal_Turnos WHERE ID_Personal IN (SELECT id_persona FROM personal_sistema WHERE usuario LIKE 'test_temp%')");
    await pool.query("DELETE FROM Personal_Sistema WHERE usuario LIKE 'test_temp%'");
    await pool.query("DELETE FROM Personas WHERE ID_Persona NOT IN (SELECT ID_Persona FROM Personal_Sistema) AND Nombres LIKE 'Temp%'");

    // Limpiar Staff de prueba
    await pool.query("DELETE FROM Personal_Turnos WHERE ID_Personal = $1", [testStaffId]);
    await pool.query("DELETE FROM Personal_Sistema WHERE ID_Persona = $1", [testStaffId]);
    await pool.query("DELETE FROM Personas WHERE ID_Persona = $1", [testStaffId]);
  });

  it('debe registrar un Maestro con un solo turno en Personal_Turnos', async () => {
    const res = await request(app)
      .post('/api/personal')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombres: 'TempMaestro',
        apellidos: 'Test',
        usuario: 'test_temp_maestro',
        contrasena: 'Test1234!',
        rol: 'Maestro',
        fechaIngreso: '2026-01-01',
        idGrupoAsignado: 1,
        idTurnos: [testTurnosIds[0]]
      });

    expect(res.status).toBe(201);
    testMaestroId = res.body.datos.idPersona;

    // Verificar en la BD
    const turnos = await pool.query(
      "SELECT ID_Turno FROM Personal_Turnos WHERE ID_Personal = $1",
      [testMaestroId]
    );
    expect(turnos.rowCount).toBe(1);
    expect(turnos.rows[0].id_turno ?? turnos.rows[0].ID_Turno).toBe(testTurnosIds[0]);
  });

  it('debe registrar un Coordinador General con múltiples turnos', async () => {
    const res = await request(app)
      .post('/api/personal')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombres: 'TempCoord',
        apellidos: 'Test',
        usuario: 'test_temp_coord',
        contrasena: 'Test1234!',
        rol: 'Coordinador General',
        fechaIngreso: '2026-01-01',
        idTurnos: testTurnosIds.slice(0, 3)
      });

    expect(res.status).toBe(201);
    const idPersona = res.body.datos.idPersona;

    // Verificar en la BD
    const turnos = await pool.query(
      "SELECT ID_Turno FROM Personal_Turnos WHERE ID_Personal = $1 ORDER BY ID_Turno",
      [idPersona]
    );
    expect(turnos.rowCount).toBe(3);
  });

  it('debe actualizar los turnos asignados del personal en PUT /api/personal/:id', async () => {
    // Cambiar el turno del Maestro de testTurnosIds[0] a testTurnosIds[1]
    const res = await request(app)
      .put(`/api/personal/${testMaestroId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idTurnos: [testTurnosIds[1]]
      });

    expect(res.status).toBe(200);

    // Verificar en la BD
    const turnos = await pool.query(
      "SELECT ID_Turno FROM Personal_Turnos WHERE ID_Personal = $1",
      [testMaestroId]
    );
    expect(turnos.rowCount).toBe(1);
    expect(turnos.rows[0].id_turno ?? turnos.rows[0].ID_Turno).toBe(testTurnosIds[1]);
  });

  it('debe rechazar (403) si un Staff intenta crear otro Staff o superior sin idAutorizadoPor', async () => {
    const res = await request(app)
      .post('/api/personal')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        nombres: 'TempStaff2',
        apellidos: 'Test',
        usuario: 'test_temp_staff2',
        contrasena: 'Test1234!',
        rol: 'Staff',
        fechaIngreso: '2026-01-01',
        idTurnos: [testTurnosIds[0]]
        // Falta idAutorizadoPor
      });

    expect(res.status).toBe(403);
    expect(res.body.mensaje).toContain('requiere ID_Autorizado_Por');
  });

  it('debe permitir si un Staff crea otro Staff con idAutorizadoPor de un Coordinador General', async () => {
    const res = await request(app)
      .post('/api/personal')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        nombres: 'TempStaff3',
        apellidos: 'Test',
        usuario: 'test_temp_staff3',
        contrasena: 'Test1234!',
        rol: 'Staff',
        fechaIngreso: '2026-01-01',
        idAutorizadoPor: adminId,
        idTurnos: [testTurnosIds[0]]
      });

    expect(res.status).toBe(201);
  });
});
