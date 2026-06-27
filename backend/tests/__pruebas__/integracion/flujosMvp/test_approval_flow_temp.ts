import request from 'supertest';
import app from '../../../../src/app.js';
import pool from '../../../../src/config/db.js';

async function run() {
  console.log('--- Simulación de aprobación de solicitud con datos civiles nulos ---');

  let adminToken: string;
  let personaId: number;
  let solicitudId: number;

  try {
    // 1. Iniciar sesión como Coordinador General (Admin)
    console.log('1. Iniciando sesión como admin...');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', contrasena: 'AdminDiosEsFiel123!' });

    if (loginRes.status !== 200) {
      throw new Error(`Error en login: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
    }
    adminToken = loginRes.body.datos.token;
    console.log('   Sesión iniciada con éxito.');

    // 2. Crear una persona ficticia
    console.log('2. Creando persona ficticia...');
    const personaRes = await pool.query(
      "INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula) VALUES ('Candidato', 'PruebaNull', 'Masculino', '123-123456-1234P') RETURNING ID_Persona"
    );
    personaId = personaRes.rows[0].id_persona ?? personaRes.rows[0].ID_Persona;
    console.log(`   Persona creada con ID: ${personaId}`);

    // Obtener requisitos obligatorios
    const reqRes = await pool.query(
      "SELECT ID_Requisito AS id FROM Requisitos WHERE Activo = TRUE AND Obligatorio = TRUE AND (ID_Rol_Requerido IS NULL OR ID_Rol_Requerido = 1)"
    );
    const requisitosArray = reqRes.rows.map(r => ({ idRequisito: r.id, cumplido: true, notas: 'Ok' }));

    // 3. Crear solicitud con estado civil, condición civil e hijos omitidos (nulos en BD)
    console.log('3. Creando solicitud con campos civiles omitidos...');
    const solicitudRes = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idPersona: personaId,
        idRolSolicitado: 1,
        sexoCandidato: 'Masculino',
        cedulaCandidato: '123-123456-1234P',
        ocupacionCandidato: 'Ingeniero',
        dirCiudad: 'Managua',
        dirMunicipio: 'Managua',
        dirExacta: 'Dirección de prueba',
        bautizadoAgua: true,
        tiempoIglesiaMeses: 12,
        requisitos: requisitosArray
      });

    if (solicitudRes.status !== 201) {
      throw new Error(`Error al crear solicitud: ${solicitudRes.status} ${JSON.stringify(solicitudRes.body)}`);
    }
    solicitudId = solicitudRes.body.datos.idSolicitud ?? solicitudRes.body.datos.ID_Solicitud;
    console.log(`   Solicitud creada con ID: ${solicitudId}`);

    // Obtener grupos y turnos
    const grupoRes = await pool.query("SELECT ID_Grupo FROM Grupos LIMIT 1");
    const grupoId = grupoRes.rows[0]?.id_grupo ?? grupoRes.rows[0]?.ID_Grupo;
    
    const turnoRes = await pool.query("SELECT ID_Turno FROM Turnos LIMIT 1");
    const turnoId = turnoRes.rows[0]?.id_turno ?? turnoRes.rows[0]?.ID_Turno;

    // 4. Intentar aprobar la solicitud
    console.log('4. Enviando PATCH para aprobar la solicitud...');
    const aprobarRes = await request(app)
      .patch(`/api/solicitudes/${solicitudId}/aprobar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        notas: 'Notas de aprobación de prueba',
        idRolSolicitado: 1,
        usuario: 'candidatonull.test',
        contrasena: 'TestClaveFuerte123!',
        idGrupoAsignado: grupoId,
        idTurnos: [turnoId]
      });

    console.log(`   Resultado PATCH: Código ${aprobarRes.status}`);
    console.log('   Cuerpo de la respuesta:', JSON.stringify(aprobarRes.body));

    if (aprobarRes.status !== 200) {
      throw new Error(`Error al aprobar solicitud: ${aprobarRes.status} ${JSON.stringify(aprobarRes.body)}`);
    }

    console.log('✅ ¡La aprobación con campos civiles nulos funcionó perfectamente y se asignaron valores por defecto!');

  } catch (error: any) {
    console.error('❌ Error en el flujo:', error.message);
  } finally {
    console.log('5. Limpiando datos de prueba...');
    try {
      if (solicitudId) {
        await pool.query("DELETE FROM Solicitudes_Requisitos WHERE ID_Solicitud = $1", [solicitudId]);
        await pool.query("DELETE FROM Solicitudes_Personal WHERE ID_Solicitud = $1", [solicitudId]);
      }
      if (personaId) {
        await pool.query("DELETE FROM Personal_Grupos WHERE ID_Personal = $1", [personaId]);
        await pool.query("DELETE FROM Personal_Turnos WHERE ID_Personal = $1", [personaId]);
        await pool.query("DELETE FROM Personal_Sistema WHERE ID_Persona = $1", [personaId]);
        await pool.query("DELETE FROM Personas WHERE ID_Persona = $1", [personaId]);
      }
      console.log('   Base de datos limpia.');
    } catch (cleanError: any) {
      console.error('   Error al limpiar:', cleanError.message);
    }
    pool.end();
  }
}

run();
