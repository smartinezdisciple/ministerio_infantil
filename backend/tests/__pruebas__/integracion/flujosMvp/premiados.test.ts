// tests/__pruebas__/integracion/flujosMvp/premiados.test.ts
// Verifica el módulo Premiados: listar, guardar (UPSERT), rechazo de duplicados,
// eliminar y persistencia del historial por mes.
import request from 'supertest';
import app from '../../../../src/app.js';
import pool from '../../../../src/config/db.js';

describe('Premiados API', () => {
  let token: string;
  const mes = '2026-09-01';
  const fechaDomingo = '2026-09-27'; // último domingo de septiembre 2026
  const fechaMiercoles = '2026-09-30'; // último miércoles de septiembre 2026
  let idNino: number;
  let grupoId: number;
  let turnoDomingoId: number;
  let turnoMiercolesId: number;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', contrasena: 'AdminDiosEsFiel123!' });
    token = adminLogin.body.datos.token;

    // Grupo y turnos de referencia
    const { rows: gRows } = await pool.query(
      "SELECT ID_Grupo FROM Grupos WHERE Nombre = '4-6 años' LIMIT 1"
    );
    grupoId = Number(gRows[0].id_grupo ?? gRows[0].ID_Grupo);

    const { rows: tRows } = await pool.query(
      "SELECT ID_Turno, Nombre FROM Turnos WHERE Nombre IN ('Domingo_8am', 'Miercoles')"
    );
    turnoDomingoId = Number(tRows.find((t) => t.nombre === 'Domingo_8am')?.id_turno);
    turnoMiercolesId = Number(tRows.find((t) => t.nombre === 'Miercoles')?.id_turno);

    // Niño de prueba
    const { rows: nRows } = await pool.query(
      "INSERT INTO Personas (Nombres, Apellidos, Fecha_Nacimiento) VALUES ('Premiado', 'Test', '2019-01-01') RETURNING ID_Persona"
    );
    idNino = Number(nRows[0].id_persona ?? nRows[0].ID_Persona);
    await pool.query('INSERT INTO Ninos (ID_Persona) VALUES ($1)', [idNino]);
    await pool.query('INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Activo) VALUES ($1, $2, TRUE)', [idNino, grupoId]);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM Premiados WHERE Mes = $1::date', [mes]);
    await pool.query('DELETE FROM Ninos_Grupos WHERE ID_Nino = $1', [idNino]);
    await pool.query('DELETE FROM Ninos WHERE ID_Persona = $1', [idNino]);
    await pool.query('DELETE FROM Personas WHERE ID_Persona = $1', [idNino]);
    await pool.end();
  });

  it('debe retornar 401 si no hay token de autenticación', async () => {
    const res = await request(app).get('/api/premiados');
    expect(res.status).toBe(401);
  });

  it('debe guardar premiados de domingo y miércoles y listarlos', async () => {
    const res = await request(app)
      .post('/api/premiados/guardar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mes,
        registros: [
          { idTurno: turnoDomingoId, idGrupo: grupoId, idNino, fechaPremiacion: fechaDomingo },
          { idTurno: turnoMiercolesId, idGrupo: grupoId, idNino, fechaPremiacion: fechaMiercoles },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(res.body.datos).toHaveLength(2);

    // Persistencia en BD
    const { rows } = await pool.query(
      'SELECT to_char(Fecha_Premiacion, \'YYYY-MM-DD\') AS fecha, ID_Nino FROM Premiados WHERE Mes = $1::date ORDER BY Fecha_Premiacion',
      [mes]
    );
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.fecha)).toEqual([fechaDomingo, fechaMiercoles]);
  });

  it('debe hacer UPSERT (no duplicar) al re-guardar el mismo turno/grupo/mes', async () => {
    const res = await request(app)
      .post('/api/premiados/guardar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mes,
        registros: [
          { idTurno: turnoDomingoId, idGrupo: grupoId, idNino, fechaPremiacion: fechaDomingo },
        ],
      });

    expect(res.status).toBe(200);
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS n FROM Premiados WHERE Mes = $1::date AND ID_Turno = $2',
      [mes, turnoDomingoId]
    );
    expect(rows[0].n).toBe(1); // sigue siendo un solo registro
  });

  it('debe rechazar registros duplicados de (turno, grupo) en el mismo envío', async () => {
    const res = await request(app)
      .post('/api/premiados/guardar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mes,
        registros: [
          { idTurno: turnoDomingoId, idGrupo: grupoId, idNino, fechaPremiacion: fechaDomingo },
          { idTurno: turnoDomingoId, idGrupo: grupoId, idNino, fechaPremiacion: fechaDomingo },
        ],
      });

    expect(res.status).toBe(400);
  });

  it('debe eliminar un premiado por ID', async () => {
    const { rows } = await pool.query(
      'SELECT ID_Premiado FROM Premiados WHERE Mes = $1::date AND ID_Turno = $2',
      [mes, turnoMiercolesId]
    );
    const idPremiado = Number(rows[0].id_premiado);

    const res = await request(app)
      .delete(`/api/premiados/${idPremiado}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);

    const restantes = await pool.query(
      'SELECT COUNT(*)::int AS n FROM Premiados WHERE Mes = $1::date',
      [mes]
    );
    expect(restantes.rows[0].n).toBe(1);
  });
});
