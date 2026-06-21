// tests/__pruebas__/integracion/flujosMvp/reportes.test.ts
import request from 'supertest';
import app from '../../../../src/app.js';
import pool from '../../../../src/config/db.js';

describe('Reportes API - Niños por Grupo', () => {
  let token: string;
  let normalUserToken: string;
  let testNinoId: number;
  let testGroupId: number;
  let testTurnoId: number;
  let testAsistenciaId: number;

  beforeAll(async () => {
    // 1. Login as Admin (Level 3+) to get token
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', contrasena: 'AdminDiosEsFiel123!' });
    token = adminLogin.body.datos.token;

    // Fetch Admin ID from Personal_Sistema
    const adminInfo = await pool.query("SELECT ID_Persona FROM Personal_Sistema WHERE Usuario = 'admin'");
    const adminId = adminInfo.rows[0].id_persona ?? adminInfo.rows[0].ID_Persona;

    // 2. Set up a test group
    const { rows: grpRows } = await pool.query(
      "SELECT ID_Grupo FROM Grupos WHERE Nombre = '10-12 años' LIMIT 1"
    );
    testGroupId = grpRows[0]?.id_grupo ?? grpRows[0]?.ID_Grupo ?? 1;

    // 3. Set up a test turno
    const { rows: turnoRows } = await pool.query(
      "SELECT ID_Turno FROM Turnos LIMIT 1"
    );
    testTurnoId = turnoRows[0]?.id_turno ?? turnoRows[0]?.ID_Turno ?? 1;

    // Fetch a valid Ficha ID
    const { rows: fichaRows } = await pool.query(
      "SELECT ID_Ficha FROM Fichas LIMIT 1"
    );
    const testFichaId = fichaRows[0]?.id_ficha ?? fichaRows[0]?.ID_Ficha ?? 1;

    // 4. Create a test child
    const { rows: ninoRows } = await pool.query(
      "INSERT INTO Personas (Nombres, Apellidos, Fecha_Nacimiento) VALUES ('NiñoReporte', 'Test', '2015-05-01') RETURNING ID_Persona"
    );
    testNinoId = ninoRows[0].id_persona ?? ninoRows[0].ID_Persona;

    await pool.query(
      "INSERT INTO Ninos (ID_Persona) VALUES ($1)",
      [testNinoId]
    );

    const ahora = new Date();
    const testFecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;

    await pool.query(
      "INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Fecha_Asignacion) VALUES ($1, $2, $3)",
      [testNinoId, testGroupId, testFecha]
    );

    // 5. Create a test attendance record for this child under the test turno
    const { rows: asistRows } = await pool.query(
      `INSERT INTO Asistencia_Ninos 
       (ID_Nino, ID_Turno, ID_Grupo_Asistido, Fecha, Hora_Entrada, Estado, ID_Ficha_Entrada, ID_Ingresado_Por, Acompanante_En_Aula, Registrado_Por)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'Presente', $5, $6, false, $6)
       RETURNING ID_Asistencia`,
      [testNinoId, testTurnoId, testGroupId, testFecha, testFichaId, adminId]
    );
    testAsistenciaId = asistRows[0].id_asistencia ?? asistRows[0].ID_Asistencia;
  });

  afterAll(async () => {
    // Clean up database test records
    if (testAsistenciaId) {
      await pool.query("DELETE FROM Asistencia_Ninos WHERE ID_Asistencia = $1", [testAsistenciaId]);
    }
    if (testNinoId) {
      await pool.query("DELETE FROM Ninos_Grupos WHERE ID_Nino = $1", [testNinoId]);
      await pool.query("DELETE FROM Ninos WHERE ID_Persona = $1", [testNinoId]);
      await pool.query("DELETE FROM Personas WHERE ID_Persona = $1", [testNinoId]);
    }
  });

  it('debe retornar 401 si no hay token de autenticación', async () => {
    const res = await request(app).get('/api/reportes/ninos-por-grupo/datos');
    expect(res.status).toBe(401);
  });

  it('debe retornar datos de niños por grupo si el token es válido y nivel es 3+', async () => {
    const res = await request(app)
      .get('/api/reportes/ninos-por-grupo/datos')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);

    // Verify properties of children
    const testChild = res.body.datos.find((c: any) => c.idPersona === testNinoId);
    expect(testChild).toBeDefined();
    expect(testChild.nombres).toBe('NiñoReporte');
    expect(testChild.apellidos).toBe('Test');
    expect(testChild.nombreCompleto).toBe('NiñoReporte Test');
    expect(testChild.fechaNacimiento).toBe('2015-05-01');
    expect(testChild.edad).toBeDefined();
    expect(typeof testChild.edad).toBe('number');
  });

  it('debe filtrar correctamente por turno cuando se proporciona', async () => {
    // Get the name of the test turno
    const { rows: tRows } = await pool.query(
      "SELECT Nombre FROM Turnos WHERE ID_Turno = $1",
      [testTurnoId]
    );
    const turnoNombre = tRows[0]?.nombre ?? tRows[0]?.Nombre;

    const res = await request(app)
      .get(`/api/reportes/ninos-por-grupo/datos?turno=${encodeURIComponent(turnoNombre)}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);

    // The child should be present because they have attendance in this shift
    const testChild = res.body.datos.find((c: any) => c.idPersona === testNinoId);
    expect(testChild).toBeDefined();
  });

  it('debe retornar lista sin nuestro niño si filtramos por otro turno en el que no asistió', async () => {
    // Find a turno that is different from testTurnoId
    const { rows: otherTurnoRows } = await pool.query(
      "SELECT Nombre FROM Turnos WHERE ID_Turno <> $1 LIMIT 1",
      [testTurnoId]
    );
    const otherTurnoNombre = otherTurnoRows[0]?.nombre ?? otherTurnoRows[0]?.Nombre ?? 'Miercoles';

    const res = await request(app)
      .get(`/api/reportes/ninos-por-grupo/datos?turno=${encodeURIComponent(otherTurnoNombre)}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    
    const testChild = res.body.datos.find((c: any) => c.idPersona === testNinoId);
    expect(testChild).toBeUndefined();
  });

  it('debe retornar lista sin nuestro niño si filtramos por una fecha diferente (ayer)', async () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;

    const res = await request(app)
      .get(`/api/reportes/ninos-por-grupo/datos?fecha=${ayerStr}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    
    const testChild = res.body.datos.find((c: any) => c.idPersona === testNinoId);
    expect(testChild).toBeUndefined();
  });
});
