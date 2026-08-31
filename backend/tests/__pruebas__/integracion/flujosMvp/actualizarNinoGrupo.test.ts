// tests/__pruebas__/integracion/flujosMvp/actualizarNinoGrupo.test.ts
// Regresión: violación de unicidad (ID_Nino, ID_Grupo) en PUT /api/ninos/:id.
// Repro: Samuel Pérez (2026-08-30). Un niño con fila histórica INACTIVA en el grupo
// que su edad indica y fila ACTIVA en otro grupo, al EDITARSE disparaba el error
// "duplicate key value violates unique constraint ninos_grupos_pkey".
// Fix: actualizarNino usa upsert ON CONFLICT (ninosRepositorio.ts).

import request from 'supertest';
import app from '../../../../src/app.js';
import pool from '../../../../src/config/db.js';

describe('PUT /api/ninos/:id — Actualización de grupo sin conflicto de unicidad', () => {
  let token: string;
  let grupoJovenId: number;
  let grupoMayorId: number;
  let fechaNacimientoJoven: string;

  // Niño A: histórico inactivo en el grupo de su edad + fila activa en otro grupo.
  let ninoHistorialId: number;
  // Niño B: fila activa en el grupo de su edad con Fecha_Asignacion en el pasado.
  let ninoFechaId: number;

  beforeAll(async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', contrasena: 'AdminDiosEsFiel123!' });
    token = login.body.datos.token;

    const { rows: gRows } = await pool.query(
      "SELECT ID_Grupo, Nombre FROM Grupos WHERE Nombre IN ('7-9 años', '10-12 años')"
    );
    grupoJovenId = Number(gRows.find((g) => g.nombre === '7-9 años')?.id_grupo);
    grupoMayorId = Number(gRows.find((g) => g.nombre === '10-12 años')?.id_grupo);

    // Fecha de nacimiento para edad = 8 (grupo 7-9) independiente del día de ejecución.
    const { rows: fRows } = await pool.query(
      "SELECT TO_CHAR(CURRENT_DATE - INTERVAL '8 years', 'YYYY-MM-DD') AS fecha"
    );
    fechaNacimientoJoven = fRows[0].fecha;

    // ── Niño A ─────────────────────────────────────────────
    const a = await pool.query(
      "INSERT INTO Personas (Nombres, Apellidos, Fecha_Nacimiento) VALUES ('NinoGrupo', 'Historial', $1) RETURNING ID_Persona",
      [fechaNacimientoJoven]
    );
    ninoHistorialId = Number(a.rows[0].id_persona ?? a.rows[0].ID_Persona);
    await pool.query('INSERT INTO Ninos (ID_Persona) VALUES ($1)', [ninoHistorialId]);
    await pool.query(
      'INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Activo) VALUES ($1, $2, FALSE)',
      [ninoHistorialId, grupoJovenId]
    );
    await pool.query(
      'INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Activo) VALUES ($1, $2, TRUE)',
      [ninoHistorialId, grupoMayorId]
    );

    // ── Niño B ─────────────────────────────────────────────
    const b = await pool.query(
      "INSERT INTO Personas (Nombres, Apellidos, Fecha_Nacimiento) VALUES ('NinoGrupo', 'Fecha', $1) RETURNING ID_Persona",
      [fechaNacimientoJoven]
    );
    ninoFechaId = Number(b.rows[0].id_persona ?? b.rows[0].ID_Persona);
    await pool.query('INSERT INTO Ninos (ID_Persona) VALUES ($1)', [ninoFechaId]);
    await pool.query(
      "INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Activo, Fecha_Asignacion) VALUES ($1, $2, TRUE, '2020-01-01')",
      [ninoFechaId, grupoJovenId]
    );
  });

  afterAll(async () => {
    for (const id of [ninoHistorialId, ninoFechaId]) {
      if (!id) continue;
      await pool.query('DELETE FROM Ninos_Grupos WHERE ID_Nino = $1', [id]);
      await pool.query('DELETE FROM Ninos WHERE ID_Persona = $1', [id]);
      await pool.query('DELETE FROM Personas WHERE ID_Persona = $1', [id]);
    }
    await pool.end();
  });

  // Payload mínimo válido para PUT /api/ninos/:id (esquemaNino)
  const payload = (nombres: string, apellidos: string) => ({
    nombres,
    apellidos,
    fechaNacimiento: fechaNacimientoJoven,
    sexo: 'Masculino',
  });

  it('debe retornar 401 si no hay token de autenticación', async () => {
    const res = await request(app)
      .put(`/api/ninos/${ninoHistorialId}`)
      .send(payload('NinoGrupo', 'Historial'));
    expect(res.status).toBe(401);
  });

  it('debe actualizar al niño con histórico en el grupo objetivo sin error de unicidad', async () => {
    const res = await request(app)
      .put(`/api/ninos/${ninoHistorialId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(payload('NinoGrupo', 'Historial'));

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);

    const { rows } = await pool.query(
      'SELECT ID_Grupo, Activo FROM Ninos_Grupos WHERE ID_Nino = $1 ORDER BY ID_Grupo',
      [ninoHistorialId]
    );
    const activas = rows.filter((r) => r.activo);
    expect(activas).toHaveLength(1); // solo una fila ACTIVA
    expect(Number(activas[0].id_grupo)).toBe(grupoJovenId); // reactivó el grupo por edad (7-9)

    const historica = rows.find((r) => Number(r.id_grupo) === grupoMayorId);
    expect(historica).toBeDefined(); // el histórico se preserva
    expect(historica.activo).toBe(false);
  });

  it('debe conservar Fecha_Asignacion si el grupo no cambia', async () => {
    const res = await request(app)
      .put(`/api/ninos/${ninoFechaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(payload('NinoGrupo', 'Fecha'));

    expect(res.status).toBe(200);

    const { rows } = await pool.query(
      "SELECT Activo, TO_CHAR(Fecha_Asignacion, 'YYYY-MM-DD') AS fecha FROM Ninos_Grupos WHERE ID_Nino = $1",
      [ninoFechaId]
    );
    const activas = rows.filter((r) => r.activo);
    expect(activas).toHaveLength(1);
    expect(activas[0].fecha).toBe('2020-01-01'); // no se refrescó al editar sin cambiar grupo
  });
});