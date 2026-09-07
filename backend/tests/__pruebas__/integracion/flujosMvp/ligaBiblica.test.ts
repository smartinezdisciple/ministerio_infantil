// tests/__pruebas__/integracion/flujosMvp/ligaBiblica.test.ts
// Verifica el módulo Liga Bíblica: listar por mes, inscribir (con turno según el
// usuario que registra), idempotencia UNIQUE (Fecha_Liga, ID_Turno, ID_Nino),
// rechazo 403 si el turno no pertenece al usuario, tutor obligatorio vinculado
// al niño, actualizar tutor (PATCH) y eliminar (DELETE).
import request from 'supertest';
import app from '../../../../src/app.js';
import pool from '../../../../src/config/db.js';
import bcrypt from 'bcryptjs';

describe('Liga Bíblica API', () => {
  let token: string;
  let maestroToken: string;
  let grupoId: number;
  let turnoDomingoId: number;
  let turnoMiercolesId: number;
  let idNino: number;
  let idTutor: number;
  let idTutor2: number;
  let idTutorSinVinculo: number;
  let testMaestroId: number;
  const mes = '2026-09';
  const fechaDomingo = '2026-09-27'; // último domingo de septiembre 2026
  const fechaMiercoles = '2026-09-30'; // último miércoles de septiembre 2026

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', contrasena: 'AdminDiosEsFiel123!' });
    token = adminLogin.body.datos.token;

    // Grupo y turnos de referencia (mismo patrón que premiados.test.ts)
    const { rows: gRows } = await pool.query(
      "SELECT ID_Grupo FROM Grupos WHERE Nombre = '4-6 años' LIMIT 1"
    );
    grupoId = Number(gRows[0].id_grupo ?? gRows[0].ID_Grupo);

    const { rows: tRows } = await pool.query(
      "SELECT ID_Turno, Nombre FROM Turnos WHERE Nombre IN ('Domingo_8am', 'Miercoles')"
    );
    turnoDomingoId = Number(tRows.find((t) => t.nombre === 'Domingo_8am')?.id_turno);
    turnoMiercolesId = Number(tRows.find((t) => t.nombre === 'Miercoles')?.id_turno);

    // Niño de prueba (con grupo y sexo para el reporte)
    const { rows: nRows } = await pool.query(
      "INSERT INTO Personas (Nombres, Apellidos, Fecha_Nacimiento, Sexo) VALUES ('Liga', 'Test', '2019-01-01', 'Femenino') RETURNING ID_Persona"
    );
    idNino = Number(nRows[0].id_persona ?? nRows[0].ID_Persona);
    await pool.query('INSERT INTO Ninos (ID_Persona) VALUES ($1)', [idNino]);
    await pool.query('INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Activo) VALUES ($1, $2, TRUE)', [idNino, grupoId]);

    // Tutores de prueba (dos vinculados al niño + uno sin vínculo)
    const crearTutor = async (nombres: string, apellidos: string) => {
      const { rows } = await pool.query(
        "INSERT INTO Personas (Nombres, Apellidos) VALUES ($1, $2) RETURNING ID_Persona",
        [nombres, apellidos]
      );
      const idPersona = Number(rows[0].id_persona ?? rows[0].ID_Persona);
      await pool.query("INSERT INTO Tutores (ID_Persona, Tipo_Tutor) VALUES ($1, 'Padre')", [idPersona]);
      return idPersona;
    };

    idTutor = await crearTutor('Tutor', 'Uno');
    idTutor2 = await crearTutor('Tutora', 'Dos');
    idTutorSinVinculo = await crearTutor('Tutor', 'Suelto');

    await pool.query('INSERT INTO Tutores_Ninos (ID_Tutor, ID_Nino) VALUES ($1, $2), ($3, $2)', [
      idTutor, idNino, idTutor2,
    ]);

    // Maestro de prueba con un solo turno (para verificar el 403)
    const { rows: rolRows } = await pool.query(
      "SELECT ID_Rol FROM Roles WHERE Nombre_Rol = 'Maestro' LIMIT 1"
    );
    const rolMaestroId = Number(rolRows[0].id_rol ?? rolRows[0].ID_Rol);
    const hash = await bcrypt.hash('MaestroLiga123!', 12);
    const { rows: pRows } = await pool.query(
      "INSERT INTO Personas (Nombres, Apellidos) VALUES ('Maestro', 'Liga') RETURNING ID_Persona"
    );
    testMaestroId = Number(pRows[0].id_persona ?? pRows[0].ID_Persona);
    await pool.query(
      `INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, Activo)
       VALUES ($1, $2, 'test_maestro_liga', $3, CURRENT_DATE, TRUE)`,
      [testMaestroId, rolMaestroId, hash]
    );
    await pool.query('INSERT INTO Personal_Turnos (ID_Personal, ID_Turno) VALUES ($1, $2)', [
      testMaestroId, turnoMiercolesId,
    ]);
    const maestroLogin = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'test_maestro_liga', contrasena: 'MaestroLiga123!' });
    maestroToken = maestroLogin.body.datos.token;
  });

  afterAll(async () => {
    // Limpieza de registros de liga y datos de prueba
    await pool.query('DELETE FROM Liga_Biblica WHERE ID_Nino = $1', [idNino]);
    await pool.query('DELETE FROM Liga_Biblica WHERE ID_Registrado_Por = $1', [testMaestroId]);

    await pool.query('DELETE FROM Tutores_Ninos WHERE ID_Nino = $1', [idNino]);
    await pool.query('DELETE FROM Tutores_Ninos WHERE ID_Tutor = $1', [idTutorSinVinculo]);
    await pool.query('DELETE FROM Ninos_Grupos WHERE ID_Nino = $1', [idNino]);
    await pool.query('DELETE FROM Ninos WHERE ID_Persona = $1', [idNino]);
    await pool.query('DELETE FROM Personas WHERE ID_Persona = $1', [idNino]);

    await pool.query('DELETE FROM Tutores WHERE ID_Persona IN ($1, $2, $3)', [idTutor, idTutor2, idTutorSinVinculo]);
    await pool.query('DELETE FROM Personas WHERE ID_Persona IN ($1, $2, $3)', [idTutor, idTutor2, idTutorSinVinculo]);

    if (testMaestroId) {
      await pool.query('DELETE FROM Personal_Turnos WHERE ID_Personal = $1', [testMaestroId]);
      await pool.query('DELETE FROM Personal_Sistema WHERE ID_Persona = $1', [testMaestroId]);
      await pool.query('DELETE FROM Personas WHERE ID_Persona = $1', [testMaestroId]);
    }
    await pool.end();
  });

  it('debe retornar 401 si no hay token de autenticación', async () => {
    const res = await request(app).get('/api/liga-biblica');
    expect(res.status).toBe(401);
  });

  it('debe inscribir a un niño en domingo y miércoles y listarlos por mes', async () => {
    const res = await request(app)
      .post('/api/liga-biblica')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mes,
        idNino,
        idTurno: turnoDomingoId,
        idTutor,
      });

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);

    const res2 = await request(app)
      .post('/api/liga-biblica')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mes,
        idNino,
        idTurno: turnoMiercolesId,
        idTutor,
      });
    expect(res2.status).toBe(200);

    // La fecha de la liga se deriva del turno y del mes seleccionado
    const { rows } = await pool.query(
      "SELECT TO_CHAR(Fecha_Liga, 'YYYY-MM-DD') AS fecha FROM Liga_Biblica WHERE ID_Nino = $1 ORDER BY Fecha_Liga",
      [idNino]
    );
    expect(rows.map((r) => r.fecha)).toEqual([fechaDomingo, fechaMiercoles]);
  });

  it('debe hacer UPSERT (no duplicar) al re-inscribir el mismo turno y actualizar el tutor', async () => {
    const res = await request(app)
      .post('/api/liga-biblica')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mes,
        idNino,
        idTurno: turnoDomingoId,
        idTutor: idTutor2,
      });

    expect(res.status).toBe(200);

    // Sigue habiendo un solo registro para (fecha, turno, niño)
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS n FROM Liga_Biblica WHERE Fecha_Liga = $1::date AND ID_Turno = $2 AND ID_Nino = $3',
      [fechaDomingo, turnoDomingoId, idNino]
    );
    expect(rows[0].n).toBe(1);

    // El tutor quedó actualizado al nuevo seleccionado
    const { rows: rTutor } = await pool.query(
      'SELECT ID_Tutor FROM Liga_Biblica WHERE Fecha_Liga = $1::date AND ID_Turno = $2 AND ID_Nino = $3',
      [fechaDomingo, turnoDomingoId, idNino]
    );
    expect(Number(rTutor[0].id_tutor ?? rTutor[0].ID_Tutor)).toBe(idTutor2);
  });

  it('debe rechazar (403) si el turno no corresponde al usuario que inscribe', async () => {
    // El Maestro de prueba solo tiene turno Miercoles asignado
    const res = await request(app)
      .post('/api/liga-biblica')
      .set('Authorization', `Bearer ${maestroToken}`)
      .send({
        mes,
        idNino,
        idTurno: turnoDomingoId,
        idTutor,
      });

    expect(res.status).toBe(403);
  });

  it('debe rechazar (400) si el tutor no está vinculado al niño', async () => {
    const res = await request(app)
      .post('/api/liga-biblica')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mes,
        idNino,
        idTurno: turnoMiercolesId,
        idTutor: idTutorSinVinculo,
      });

    expect(res.status).toBe(400);
  });

  it('debe actualizar el tutor de un participante (PATCH)', async () => {
    const { rows } = await pool.query(
      'SELECT ID_Liga FROM Liga_Biblica WHERE Fecha_Liga = $1::date AND ID_Turno = $2 AND ID_Nino = $3',
      [fechaMiercoles, turnoMiercolesId, idNino]
    );
    const idLiga = Number(rows[0].id_liga ?? rows[0].ID_Liga);

    const res = await request(app)
      .patch(`/api/liga-biblica/${idLiga}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ idTutor: idTutor2 });

    expect(res.status).toBe(200);
    expect(res.body.datos.actualizado).toBe(true);

    const { rows: rTutor } = await pool.query(
      'SELECT ID_Tutor FROM Liga_Biblica WHERE ID_Liga = $1',
      [idLiga]
    );
    expect(Number(rTutor[0].id_tutor ?? rTutor[0].ID_Tutor)).toBe(idTutor2);
  });

  it('debe eliminar un participante (DELETE)', async () => {
    const { rows } = await pool.query(
      'SELECT ID_Liga FROM Liga_Biblica WHERE Fecha_Liga = $1::date AND ID_Turno = $2 AND ID_Nino = $3',
      [fechaDomingo, turnoDomingoId, idNino]
    );
    const idLiga = Number(rows[0].id_liga ?? rows[0].ID_Liga);

    const res = await request(app)
      .delete(`/api/liga-biblica/${idLiga}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);

    const { rows: restantes } = await pool.query(
      'SELECT COUNT(*)::int AS n FROM Liga_Biblica WHERE ID_Nino = $1',
      [idNino]
    );
    expect(restantes[0].n).toBe(1);
  });
});