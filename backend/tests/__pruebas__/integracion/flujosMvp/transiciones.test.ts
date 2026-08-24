// tests/__pruebas__/integracion/flujosMvp/transiciones.test.ts
import request from 'supertest';
import app from '../../../../src/app.js';
import pool from '../../../../src/config/db.js';

describe('Dashboard API - Transición de Grupo', () => {
  let token: string;
  let testNinoId: number;
  let grupoOrigenId: number;
  let grupoDestinoId: number;

  beforeAll(async () => {
    // 1. Login como admin (nivel 3+) para obtener el token
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', contrasena: 'AdminDiosEsFiel123!' });
    token = adminLogin.body.datos.token;

    // 2. Grupos de la prueba: origen '7-9 años' y destino '10-12 años'
    const { rows: gRows } = await pool.query(
      "SELECT ID_Grupo, Nombre FROM Grupos WHERE Nombre IN ('7-9 años', '10-12 años')"
    );
    grupoOrigenId = Number(gRows.find((g) => g.nombre === '7-9 años')?.id_grupo);
    grupoDestinoId = Number(gRows.find((g) => g.nombre === '10-12 años')?.id_grupo);

    // 3. Niño de prueba: nacido 2016-08-20 (cumple 10 dentro de la ventana de 3 meses
    //    según la vista), asignado al grupo 7-9 → debe aparecer como Debe_Transicionar
    const { rows: ninoRows } = await pool.query(
      "INSERT INTO Personas (Nombres, Apellidos, Fecha_Nacimiento) VALUES ('NiñoTransicion', 'Test', '2016-08-20') RETURNING ID_Persona"
    );
    testNinoId = Number(ninoRows[0].id_persona ?? ninoRows[0].ID_Persona);

    await pool.query('INSERT INTO Ninos (ID_Persona) VALUES ($1)', [testNinoId]);
    await pool.query(
      'INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Activo) VALUES ($1, $2, TRUE)',
      [testNinoId, grupoOrigenId]
    );
  });

  afterAll(async () => {
    if (testNinoId) {
      await pool.query('DELETE FROM Ninos_Grupos WHERE ID_Nino = $1', [testNinoId]);
      await pool.query('DELETE FROM Ninos WHERE ID_Persona = $1', [testNinoId]);
      await pool.query('DELETE FROM Personas WHERE ID_Persona = $1', [testNinoId]);
    }
    await pool.end();
  });

  it('debe retornar 401 si no hay token de autenticación', async () => {
    const res = await request(app).post(`/api/dashboard/ninos-transicion/${testNinoId}/transicionar`);
    expect(res.status).toBe(401);
  });

  it('debe listar al niño como Debe_Transicionar antes de la transición', async () => {
    const res = await request(app)
      .get('/api/dashboard/ninos-transicion')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    const pendiente = res.body.datos.find(
      (n: any) => n.idPersona === testNinoId && n.estadoTransicion === 'Debe_Transicionar'
    );
    expect(pendiente).toBeDefined();
    expect(pendiente.grupoSugerido).toBe('10-12 años');
  });

  it('debe ejecutar la transición: cierra el grupo anterior y activa el nuevo', async () => {
    const res = await request(app)
      .post(`/api/dashboard/ninos-transicion/${testNinoId}/transicionar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(res.body.datos.grupoNuevo).toBe('10-12 años');

    const { rows } = await pool.query(
      'SELECT ID_Grupo, Activo FROM Ninos_Grupos WHERE ID_Nino = $1 ORDER BY ID_Grupo',
      [testNinoId]
    );
    expect(rows).toHaveLength(2);
    const origen = rows.find((r) => Number(r.id_grupo) === grupoOrigenId);
    const destino = rows.find((r) => Number(r.id_grupo) === grupoDestinoId);
    expect(origen.activo).toBe(false);
    expect(destino.activo).toBe(true);
  });

  it('debe retornar 404 si se intenta transicionar dos veces', async () => {
    const res = await request(app)
      .post(`/api/dashboard/ninos-transicion/${testNinoId}/transicionar`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('debe dejar de listar al niño tras la transición', async () => {
    const res = await request(app)
      .get('/api/dashboard/ninos-transicion')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const pendiente = res.body.datos.find(
      (n: any) => n.idPersona === testNinoId && n.estadoTransicion === 'Debe_Transicionar'
    );
    expect(pendiente).toBeUndefined();
  });

  it('debe retornar 404 para un ID de niño inexistente', async () => {
    const res = await request(app)
      .post('/api/dashboard/ninos-transicion/99999999/transicionar')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
