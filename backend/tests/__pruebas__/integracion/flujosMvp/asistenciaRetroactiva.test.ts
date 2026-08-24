// tests/__pruebas__/integracion/flujosMvp/asistenciaRetroactiva.test.ts
// Verifica el registro de asistencia de personal en fechas anteriores a hoy:
// acepta fecha pasada con hora manual, rechaza fechas futuras y hace UPSERT.
import request from 'supertest';
import app from '../../../../src/app.js';
import pool from '../../../../src/config/db.js';

describe('Personal API - Asistencia retroactiva', () => {
  let token: string;
  let idPersonal: number;
  let idTurno: number;
  const ahoraNicaragua = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const fechaAyer = new Date(ahoraNicaragua.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const fechaFutura = new Date(ahoraNicaragua.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  // Snapshot para restaurar datos reales si la persona ya tenía registro ese día
  let snapshotPrevio: Array<Record<string, unknown>> = [];

  beforeAll(async () => {
    // 1. Login como admin (nivel 4) para obtener el token
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', contrasena: 'AdminDiosEsFiel123!' });
    token = adminLogin.body.datos.token;

    // 2. Personal activo de nivel < 4 con turno asignado (no debe ser el admin)
    const { rows: pRows } = await pool.query(`
      SELECT ps.ID_Persona,
             COALESCE(
               (SELECT pt.ID_Turno FROM Personal_Turnos pt WHERE pt.ID_Personal = ps.ID_Persona LIMIT 1),
               (SELECT MIN(ID_Turno) FROM Turnos)
             ) AS id_turno
      FROM Personal_Sistema ps
      JOIN Roles r ON r.ID_Rol = ps.ID_Rol
      WHERE ps.Activo = TRUE AND r.Nivel_Jerarquico < 4
      LIMIT 1
    `);
    idPersonal = Number(pRows[0].id_persona ?? pRows[0].idpersona ?? pRows[0].ID_Persona);
    idTurno = Number(pRows[0].id_turno);

    // 3. Snapshot de registros reales de esa persona en la fecha de prueba
    const { rows } = await pool.query(
      'SELECT ID_Turno, ID_Grupo, Estado_Llegada, Hora_Llegada, Razon_Ausencia FROM Asistencia_Maestros WHERE ID_Personal = $1 AND Fecha = $2',
      [idPersonal, fechaAyer]
    );
    snapshotPrevio = rows;
    await pool.query('DELETE FROM Asistencia_Maestros WHERE ID_Personal = $1 AND Fecha = $2', [idPersonal, fechaAyer]);
  });

  afterAll(async () => {
    // Restaurar el estado original de esa persona/fecha
    await pool.query('DELETE FROM Asistencia_Maestros WHERE ID_Personal = $1 AND Fecha = $2', [idPersonal, fechaAyer]);
    for (const r of snapshotPrevio) {
      await pool.query(
        `INSERT INTO Asistencia_Maestros (Fecha, ID_Turno, ID_Personal, ID_Grupo, Estado_Llegada, Hora_Llegada, Razon_Ausencia)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (ID_Personal, Fecha, ID_Turno) DO NOTHING`,
        [fechaAyer, r.ID_Turno, idPersonal, r.ID_Grupo, r.Estado_Llegada, r.Hora_Llegada, r.Razon_Ausencia]
      );
    }
    await pool.end();
  });

  it('debe retornar 401 si no hay token de autenticación', async () => {
    const res = await request(app)
      .post('/api/personal/asistencia')
      .send({ idPersona: idPersonal, estadoLlegada: 'Temprano', idTurno });
    expect(res.status).toBe(401);
  });

  it('debe rechazar una fecha futura con 400', async () => {
    const res = await request(app)
      .post('/api/personal/asistencia')
      .set('Authorization', `Bearer ${token}`)
      .send({ idPersona: idPersonal, estadoLlegada: 'Temprano', idTurno, fecha: fechaFutura });
    expect(res.status).toBe(400);
  });

  it('debe registrar asistencia de ayer con hora manual guardada en UTC (+6h)', async () => {
    const res = await request(app)
      .post('/api/personal/asistencia')
      .set('Authorization', `Bearer ${token}`)
      .send({ idPersona: idPersonal, estadoLlegada: 'Temprano', idTurno, fecha: fechaAyer, hora: '08:30' });

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);

    // La hora se guarda en UTC para que la lectura (-6h) muestre 08:30 AM Nicaragua
    const { rows } = await pool.query(
      `SELECT to_char(Fecha, 'YYYY-MM-DD') AS fecha,
              to_char(Hora_Llegada, 'HH24:MI') AS hora_utc
       FROM Asistencia_Maestros
       WHERE ID_Personal = $1 AND Fecha = $2 AND ID_Turno = $3`,
      [idPersonal, fechaAyer, idTurno]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].fecha).toBe(fechaAyer);
    expect(rows[0].hora_utc).toBe('14:30');
  });

  it('debe hacer UPSERT al re-registrar el mismo día y turno', async () => {
    const res = await request(app)
      .post('/api/personal/asistencia')
      .set('Authorization', `Bearer ${token}`)
      .send({ idPersona: idPersonal, estadoLlegada: 'Tarde', idTurno, fecha: fechaAyer, hora: '09:15' });

    expect(res.status).toBe(200);
    expect(res.body.datos.estadoLlegada).toBe('Tarde');

    const { rows } = await pool.query(
      `SELECT estado_llegada, to_char(Hora_Llegada, 'HH24:MI') AS hora_utc
       FROM Asistencia_Maestros
       WHERE ID_Personal = $1 AND Fecha = $2 AND ID_Turno = $3`,
      [idPersonal, fechaAyer, idTurno]
    );
    expect(rows).toHaveLength(1); // sigue siendo un solo registro
    expect(rows[0].estado_llegada).toBe('Tarde');
    expect(rows[0].hora_utc).toBe('15:15');
  });

  it('GET asistencia-hoy con fecha pasada debe incluir al personal registrado', async () => {
    const res = await request(app)
      .get(`/api/personal/asistencia-hoy?fecha=${fechaAyer}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    const registro = res.body.datos.find((p: any) => p.idPersona === idPersonal);
    expect(registro).toBeDefined();
    expect(registro.estadoLlegada).toBe('Tarde');
    expect(registro.nombreCompleto).toBeTruthy();
  });
});
