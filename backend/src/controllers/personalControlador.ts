// src/controllers/personalControlador.ts — Esquema v5.1
// Teléfonos → Telefonos_Personas, Dirección → Personas_Direcciones,
// Estado_Liderazgo → Estado_Operativo, Mentor eliminado → Líder.
// Nuevos endpoints: suspensiones, historial-roles, perfil-completo.
import { Request, Response } from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

/**
 * GET /api/personal/asistencia-hoy
 * Lista todo el personal con su estado en Asistencia_Maestros hoy.
 * Teléfono proviene de Telefonos_Personas (número principal activo).
 */
export const listarPersonalHoy = async (_req: Request, res: Response) => {
  const hoy = new Date().toISOString().split('T')[0];
  try {
    const { rows } = await pool.query(`
      SELECT
        p.ID_Persona                                     AS "idPersona",
        p.Nombres                                        AS "nombres",
        p.Apellidos                                      AS "apellidos",
        CONCAT(p.Nombres, ' ', p.Apellidos)              AS "nombreCompleto",
        r.Nombre_Rol                                     AS "rol",
        r.Nivel_Jerarquico                               AS "nivelJerarquico",
        g.Nombre                                         AS "grupoAsignado",
        ps.Fecha_Ingreso_Servicio                        AS "fechaIngreso",
        am.Estado_Llegada                                AS "estadoLlegada",
        to_char(am.Hora_Llegada, 'HH12:MI AM')           AS "horaLlegada",
        tp.Numero                                        AS "telefono",
        tp.Tiene_Whatsapp                                AS "tieneWhatsapp"
      FROM   Personal_Sistema ps
      JOIN   Personas         p  ON p.ID_Persona  = ps.ID_Persona
      JOIN   Roles            r  ON r.ID_Rol      = ps.ID_Rol
      LEFT JOIN Personal_Grupos pg ON pg.ID_Personal = ps.ID_Persona
      LEFT JOIN Grupos          g  ON g.ID_Grupo    = pg.ID_Grupo
      LEFT JOIN Asistencia_Maestros am
             ON am.ID_Personal = ps.ID_Persona AND am.Fecha = $1
      LEFT JOIN Telefonos_Personas tp
             ON tp.ID_Persona = ps.ID_Persona
            AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
      WHERE  ps.Activo = TRUE
        AND  r.Nivel_Jerarquico < 4
      ORDER  BY r.Nivel_Jerarquico DESC, p.Apellidos
    `, [hoy]);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al listar personal:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/personal/mis-turnos
 * Devuelve los turnos asignados al usuario logueado.
 */
export const misTurnos = async (req: Request, res: Response) => {
  const idPersona = req.usuario?.idPersona;
  if (!idPersona) return res.status(401).json({ exito: false, mensaje: 'Usuario no autenticado.' });
  try {
    const { rows } = await pool.query(`
      SELECT t.ID_Turno                         AS "idTurno",
             t.Nombre                           AS "nombre",
             t.Dia_Semana                       AS "diaSemana",
             to_char(t.Hora_Inicio, 'HH24:MI') AS "horaInicio"
      FROM   Personal_Turnos pt
      JOIN   Turnos t ON t.ID_Turno = pt.ID_Turno
      WHERE  pt.ID_Personal = $1
      ORDER  BY t.Hora_Inicio
    `, [idPersona]);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al obtener turnos del personal:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/personal/asistencia
 * UPSERT en Asistencia_Maestros.
 */
export const registrarAsistenciaPersonal = async (req: Request, res: Response) => {
  const { idPersona, estadoLlegada, idTurno, idGrupo, razonAusencia } = req.body;
  const hoy  = new Date().toISOString().split('T')[0];
  const hora = new Date().toISOString().slice(11, 19);

  if (!idPersona || !estadoLlegada || !idTurno) {
    return res.status(400).json({ exito: false, mensaje: 'Faltan idPersona, estadoLlegada e idTurno.' });
  }

  const estadosValidos = ['Temprano', 'Tarde', 'Justificado', 'Injustificado'];
  if (!estadosValidos.includes(estadoLlegada)) {
    return res.status(400).json({ exito: false, mensaje: `Estado inválido. Use: ${estadosValidos.join(', ')}` });
  }

  if (estadoLlegada === 'Injustificado' && (!razonAusencia || razonAusencia.trim() === '')) {
    return res.status(400).json({ exito: false, mensaje: 'La razón de ausencia es obligatoria cuando el estado es Injustificado.' });
  }

  try {
    let grupoId = idGrupo;
    if (!grupoId) {
      const grpRes = await pool.query(`SELECT ID_Grupo FROM Personal_Grupos WHERE ID_Personal = $1 LIMIT 1`, [idPersona]);
      grupoId = grpRes.rows[0]?.ID_Grupo ?? 1;
    }

    const { rows } = await pool.query(`
      INSERT INTO Asistencia_Maestros
        (Fecha, ID_Turno, ID_Personal, ID_Grupo, Estado_Llegada, Hora_Llegada, Razon_Ausencia)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (ID_Personal, Fecha, ID_Turno)
      DO UPDATE SET Estado_Llegada = EXCLUDED.Estado_Llegada,
                    Hora_Llegada   = EXCLUDED.Hora_Llegada,
                    Razon_Ausencia = EXCLUDED.Razon_Ausencia
      RETURNING ID_Asistencia_Maestro AS "idAsistencia",
                Fecha                  AS "fecha",
                to_char(Hora_Llegada - INTERVAL '5 hours', 'HH12:MI AM') AS "horaLlegada",
                Estado_Llegada         AS "estadoLlegada"
    `, [hoy, idTurno, idPersona, grupoId, estadoLlegada, hora, razonAusencia ?? null]);

    res.json({ exito: true, datos: rows[0] });
  } catch (err) {
    console.error('Error registrando asistencia personal:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/personal/coordinadores
 * Lista personal con nivel >= 3 para el dropdown de autorización.
 */
export const listarCoordinadores = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT ps.ID_Persona                             AS "id",
             CONCAT(p.Nombres, ' ', p.Apellidos)      AS "nombre",
             r.Nombre_Rol                              AS "rol"
      FROM   Personal_Sistema ps
      JOIN   Personas         p ON p.ID_Persona = ps.ID_Persona
      JOIN   Roles            r ON r.ID_Rol     = ps.ID_Rol
      WHERE  r.Nivel_Jerarquico >= 3
        AND  ps.Activo = TRUE
      ORDER  BY r.Nivel_Jerarquico DESC, p.Apellidos
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al listar coordinadores:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/personal/disponible
 * Personal activo y sin suspensión vigente (vista v_personal_disponible_servicio).
 */
export const listarPersonalDisponible = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT ID_Persona         AS "idPersona",
             Nombre_Completo    AS "nombreCompleto",
             Rol                AS "rol",
             Fecha_Ingreso_Servicio AS "fechaIngreso"
      FROM v_personal_disponible_servicio
    `);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error al listar personal disponible:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/personal/:id/completo
 * Datos completos de un miembro para edición.
 * Teléfono principal desde Telefonos_Personas.
 */
export const obtenerPersonalCompleto = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(`
      SELECT
        p.ID_Persona                                     AS "idPersona",
        p.Nombres                                        AS "nombres",
        p.Apellidos                                      AS "apellidos",
        p.Sexo                                           AS "sexo",
        p.Cedula                                         AS "cedula",
        ps.Usuario                                       AS "usuario",
        r.Nombre_Rol                                     AS "rol",
        r.ID_Rol                                         AS "idRol",
        ps.Fecha_Ingreso_Servicio                        AS "fechaIngreso",
        pg.ID_Grupo                                      AS "idGrupoAsignado",
        g.Nombre                                         AS "grupoAsignado",
        tp.Numero                                        AS "telefonoPrincipal",
        tp.Tipo                                          AS "tipoTelefonoPrincipal",
        tp.Tiene_Whatsapp                                AS "tieneWhatsapp"
      FROM   Personal_Sistema ps
      JOIN   Personas         p  ON p.ID_Persona  = ps.ID_Persona
      JOIN   Roles            r  ON r.ID_Rol      = ps.ID_Rol
      LEFT JOIN Personal_Grupos pg ON pg.ID_Personal = ps.ID_Persona
      LEFT JOIN Grupos          g  ON g.ID_Grupo    = pg.ID_Grupo
      LEFT JOIN Telefonos_Personas tp
             ON tp.ID_Persona = ps.ID_Persona
            AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
      WHERE  ps.ID_Persona = $1
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ exito: false, mensaje: 'Personal no encontrado.' });

    const turnosRes = await pool.query(`SELECT ID_Turno AS "idTurno" FROM Personal_Turnos WHERE ID_Personal = $1`, [id]);
    const idTurnos = turnosRes.rows.map(row => row.idTurno);

    res.json({ exito: true, datos: { ...rows[0], idTurnos } });
  } catch (err) {
    console.error('Error obteniendo personal:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/personal
 * Crea Personas + Personal_Sistema + teléfonos + dirección + Info_Personal + Info_Iglesia.
 */
export const registrarPersonal = async (req: Request, res: Response) => {
  const {
    nombres, apellidos, usuario, contrasena, rol, fechaIngreso,
    idPersonaExistente, idAutorizadoPor, idGrupoAsignado, idTurnos,
    // Nuevos campos v5.1
    sexo, cedula,
    telefonos,       // array de { tipo, numero, tieneWhatsapp, esPrincipal }
    direccion,       // { tipoDireccion, ciudadDepartamento, municipio, distrito, barrio, direccionExacta }
    ocupacion, centroLaboral, nivelAcademico,
    estadoCivil, condicionCivil, nombreConyuge, tieneHijos, numeroHijos,
    estadoOperativo, idLider, idCirculo,
    bautizadoAgua, fechaBautismo, fechaBautismoPrecision,
    circuloAmistadDesde, circuloAmistadPrecision,
    tiempoIglesiaMeses, ministerioAdicional,
    clasesBiblicasNinos, clasesBiblicasDetalle,
    capacitacionEnsenanza, capacitacionDetalle,
    observacionesEspirituales,
    asistioOtraIglesia, nombreOtraIglesia, denominacionOtraIglesia,
  } = req.body;

  const idCreadoPor = req.usuario?.idPersona;

  if (!nombres || !apellidos || !usuario || !contrasena || !rol || !fechaIngreso || !idTurnos || !Array.isArray(idTurnos) || idTurnos.length === 0) {
    return res.status(400).json({ exito: false, mensaje: 'Faltan campos obligatorios o formato de turnos inválido.' });
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const duplicado = await cliente.query(`SELECT 1 FROM Personal_Sistema WHERE Usuario = $1`, [usuario]);
    if ((duplicado.rowCount ?? 0) > 0) {
      await cliente.query('ROLLBACK');
      return res.status(409).json({ exito: false, mensaje: 'Este nombre de usuario ya está en uso.' });
    }

    const rolRes = await cliente.query(`SELECT ID_Rol AS id_rol FROM Roles WHERE Nombre_Rol = $1`, [rol]);
    if ((rolRes.rowCount ?? 0) === 0) {
      await cliente.query('ROLLBACK');
      return res.status(400).json({ exito: false, mensaje: `Rol "${rol}" no encontrado.` });
    }
    const idRol = rolRes.rows[0].id_rol;

    let idPersona = idPersonaExistente;

    if (!idPersonaExistente) {
      const personaRes = await cliente.query(`
        INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula)
        VALUES ($1, $2, $3, $4)
        RETURNING ID_Persona AS id_persona
      `, [nombres, apellidos, sexo ?? null, cedula ?? null]);
      idPersona = personaRes.rows[0].id_persona;
    }

    // Teléfonos
    if (Array.isArray(telefonos) && telefonos.length > 0) {
      for (const tel of telefonos) {
        await cliente.query(`
          INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Tiene_Whatsapp, Es_Principal)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [idPersona, tel.tipo ?? 'Otro', tel.numero, tel.tieneWhatsapp ?? false, tel.esPrincipal ?? false]);
      }
    }

    // Dirección
    if (direccion) {
      await cliente.query(`
        INSERT INTO Personas_Direcciones
          (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
        ON CONFLICT DO NOTHING
      `, [idPersona, direccion.tipoDireccion ?? 'Residencial', direccion.ciudadDepartamento ?? null,
          direccion.municipio ?? null, direccion.distrito ?? null, direccion.barrio ?? null,
          direccion.direccionExacta ?? null]);
    }

    const hash = await bcrypt.hash(contrasena, 12);

    await cliente.query(`
      INSERT INTO Personal_Sistema
        (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [idPersona, idRol, usuario, hash, fechaIngreso, idCreadoPor ?? null, idAutorizadoPor ?? null]);

    // Info personal
    await cliente.query(`
      INSERT INTO Personal_Info_Personal
        (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Ocupacion, Centro_Laboral, Nivel_Academico)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (ID_Persona) DO NOTHING
    `, [idPersona, estadoCivil ?? 'Soltero', condicionCivil ?? 'Ninguna', nombreConyuge ?? null, tieneHijos ?? false,
        numeroHijos ?? null, ocupacion ?? null, centroLaboral ?? null, nivelAcademico ?? null]);

    // Info iglesia
    await cliente.query(`
      INSERT INTO Personal_Info_Iglesia
        (ID_Persona, Estado_Operativo, ID_Lider, ID_Circulo,
         Tiempo_Iglesia_Meses, Ministerio_Adicional,
         Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
         Circulo_Amistad_Desde, Circulo_Amistad_Precision,
         Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
         Capacitacion_Ensenanza, Capacitacion_Detalle, Observaciones_Espirituales,
         Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (ID_Persona) DO NOTHING
    `, [
      idPersona,
      estadoOperativo ?? null,
      idLider ?? null,
      idCirculo ?? null,
      tiempoIglesiaMeses ?? null,
      ministerioAdicional ?? null,
      bautizadoAgua ?? false,
      fechaBautismo ?? null,
      fechaBautismoPrecision ?? null,
      circuloAmistadDesde ?? null,
      circuloAmistadPrecision ?? null,
      clasesBiblicasNinos ?? false,
      clasesBiblicasDetalle ?? null,
      capacitacionEnsenanza ?? false,
      capacitacionDetalle ?? null,
      observacionesEspirituales ?? null,
      asistioOtraIglesia ?? false,
      nombreOtraIglesia ?? null,
      denominacionOtraIglesia ?? null,
    ]);

    if ((rol === 'Colaborador' || rol === 'Maestro') && idGrupoAsignado) {
      const primerTurno = idTurnos[0];
      await cliente.query(`
        INSERT INTO Personal_Grupos (ID_Personal, ID_Grupo, ID_Turno, Fecha_Asignacion)
        VALUES ($1, $2, $3, $4)
      `, [idPersona, idGrupoAsignado, primerTurno, new Date().toISOString().split('T')[0]]);
    }

    for (const idTurno of idTurnos) {
      await cliente.query(`
        INSERT INTO Personal_Turnos (ID_Personal, ID_Turno)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `, [idPersona, idTurno]);
    }

    await cliente.query('COMMIT');
    res.status(201).json({ exito: true, datos: { idPersona }, mensaje: 'Personal registrado exitosamente.' });
  } catch (err: unknown) {
    await cliente.query('ROLLBACK');
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('requiere ID_Autorizado_Por') || msg.includes('No se puede crear')) {
      return res.status(403).json({ exito: false, mensaje: msg });
    }
    console.error('Error registrando personal:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  } finally {
    cliente.release();
  }
};

/**
 * PUT /api/personal/:id
 * Actualiza datos de un miembro. Cuando cambia ID_Rol envía SET LOCAL app.id_autorizador.
 */
export const actualizarPersonal = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { nombres, apellidos, usuario, contrasena, idRol, idGrupoAsignado, idTurnos, idAutorizadoPor } = req.body;

  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ exito: false, mensaje: 'ID de personal invalido.' });

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const existeRes = await cliente.query('SELECT ID_Persona FROM Personal_Sistema WHERE ID_Persona = $1 AND Activo = TRUE', [id]);
    if ((existeRes.rowCount ?? 0) === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ exito: false, mensaje: 'Personal no encontrado.' });
    }

    if (nombres || apellidos) {
      const camposPersona: string[] = [];
      const valoresPersona: unknown[] = [];
      if (nombres)   { camposPersona.push(`Nombres = $${camposPersona.length + 1}`);   valoresPersona.push(nombres); }
      if (apellidos) { camposPersona.push(`Apellidos = $${camposPersona.length + 1}`); valoresPersona.push(apellidos); }
      valoresPersona.push(id);
      await cliente.query(`UPDATE Personas SET ${camposPersona.join(', ')} WHERE ID_Persona = $${valoresPersona.length}`, valoresPersona);
    }

    const camposPS: string[] = [];
    const valoresPS: unknown[] = [];

    if (usuario) {
      const dupRes = await cliente.query('SELECT 1 FROM Personal_Sistema WHERE Usuario = $1 AND ID_Persona != $2', [usuario, id]);
      if ((dupRes.rowCount ?? 0) > 0) { await cliente.query('ROLLBACK'); return res.status(409).json({ exito: false, mensaje: 'Usuario ya en uso.' }); }
      camposPS.push(`Usuario = $${camposPS.length + 1}`); valoresPS.push(usuario);
    }
    if (contrasena) {
      const hash = await bcrypt.hash(contrasena, 12);
      camposPS.push(`Password_Hash = $${camposPS.length + 1}`); valoresPS.push(hash);
    }
    if (idRol) {
      // El trigger trg_auditoria_cambio_rol requiere app.id_autorizador en la sesión
      const autorizador = idAutorizadoPor ?? req.usuario?.idPersona;
      if (!autorizador) {
        await cliente.query('ROLLBACK');
        return res.status(400).json({ exito: false, mensaje: 'Se requiere idAutorizadoPor para cambiar el rol.' });
      }
      await cliente.query(`SET LOCAL app.id_autorizador = '${autorizador}'`);
      camposPS.push(`ID_Rol = $${camposPS.length + 1}`); valoresPS.push(idRol);
    }

    if (camposPS.length > 0) {
      valoresPS.push(id);
      await cliente.query(`UPDATE Personal_Sistema SET ${camposPS.join(', ')} WHERE ID_Persona = $${valoresPS.length}`, valoresPS);
    }

    if (idTurnos !== undefined) {
      await cliente.query('DELETE FROM Personal_Turnos WHERE ID_Personal = $1', [id]);
      if (idTurnos !== null && Array.isArray(idTurnos)) {
        for (const idTurno of idTurnos) {
          await cliente.query(`INSERT INTO Personal_Turnos (ID_Personal, ID_Turno) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [id, idTurno]);
        }
      }
    }

    if (idGrupoAsignado !== undefined) {
      await cliente.query('DELETE FROM Personal_Grupos WHERE ID_Personal = $1', [id]);
      if (idGrupoAsignado !== null) {
        let turnoId = idTurnos && idTurnos.length > 0 ? idTurnos[0] : null;
        if (!turnoId) {
          const tRes = await cliente.query('SELECT ID_Turno FROM Personal_Turnos WHERE ID_Personal = $1 LIMIT 1', [id]);
          turnoId = tRes.rows[0]?.ID_Turno ?? 3;
        }
        await cliente.query(`
          INSERT INTO Personal_Grupos (ID_Personal, ID_Grupo, ID_Turno, Fecha_Asignacion)
          VALUES ($1, $2, $3, CURRENT_DATE)
        `, [id, idGrupoAsignado, turnoId]);
      }
    }

    await cliente.query('COMMIT');
    res.json({ exito: true, datos: { idPersona: id }, mensaje: 'Personal actualizado exitosamente.' });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error('Error actualizando personal:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  } finally {
    cliente.release();
  }
};

/**
 * GET /api/personal/:id/perfil
 * Perfil completo: Info_Personal, Info_Iglesia (v5.1), teléfonos, direcciones, grupos, turnos, requisitos.
 */
export const obtenerPerfilPersonal = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ exito: false, mensaje: 'ID invalido.' });
  try {
    const baseRes = await pool.query(`
      SELECT p.ID_Persona AS "idPersona", p.Nombres AS "nombres", p.Apellidos AS "apellidos",
             p.Sexo AS "sexo", p.Cedula AS "cedula",
             ps.Usuario AS "usuario", r.ID_Rol AS "idRol", r.Nombre_Rol AS "rol",
             r.Nivel_Jerarquico AS "nivelJerarquico",
             ps.Fecha_Ingreso_Servicio AS "fechaIngreso", ps.Activo AS "activo"
      FROM Personal_Sistema ps
      JOIN Personas p ON p.ID_Persona = ps.ID_Persona
      JOIN Roles r ON r.ID_Rol = ps.ID_Rol
      WHERE ps.ID_Persona = $1
    `, [id]);

    if ((baseRes.rowCount ?? 0) === 0) return res.status(404).json({ exito: false, mensaje: 'Personal no encontrado.' });

    const [ip, ii, tels, dirs, gr, tr, rq, sus] = await Promise.all([
      pool.query(`
        SELECT Estado_Civil AS "estadoCivil", Condicion_Civil AS "condicionCivil", Nombre_Conyuge AS "nombreConyuge",
               Tiene_Hijos AS "tieneHijos", Numero_Hijos AS "numeroHijos",
               Ocupacion AS "ocupacion", Centro_Laboral AS "centroLaboral",
               Nivel_Academico AS "nivelAcademico"
        FROM Personal_Info_Personal WHERE ID_Persona = $1
      `, [id]),
      pool.query(`
        SELECT Estado_Operativo AS "estadoOperativo",
               Bautizado_Agua AS "bautizadoAgua",
               Fecha_Bautismo AS "fechaBautismo",
               Fecha_Bautismo_Precision AS "fechaBautismoPrecision",
               Tiempo_Iglesia_Meses AS "tiempoIglesiaMeses",
               Ministerio_Adicional AS "ministerioAdicional",
               Clases_Biblicas_Ninos AS "clasesBiblicasNinos",
               Clases_Biblicas_Detalle AS "clasesBiblicasDetalle",
               Capacitacion_Ensenanza AS "capacitacionEnsenanza",
               Capacitacion_Detalle AS "capacitacionDetalle",
               Observaciones_Espirituales AS "observacionesEspirituales",
               Asistio_Otra_Iglesia AS "asistioOtraIglesia",
               Nombre_Otra_Iglesia AS "nombreOtraIglesia",
               Denominacion_Otra_Iglesia AS "denominacionOtraIglesia",
               pii.ID_Red AS "idRed",
               rd.Nombre AS "red",
               pii.ID_Circulo AS "idCirculo",
               ca.Nombre AS "circuloAmistad",
               Circulo_Amistad_Desde AS "circuloAmistadDesde",
               pii.ID_Lider AS "idLider",
               p_lid.Nombres || ' ' || p_lid.Apellidos AS "nombreLider",
               tp_lid.Numero AS "telLider"
        FROM Personal_Info_Iglesia pii
        LEFT JOIN Redes rd ON pii.ID_Red = rd.ID_Red
        LEFT JOIN Circulos_Amistad ca ON pii.ID_Circulo = ca.ID_Circulo
        LEFT JOIN Personal_Lideres pl ON pii.ID_Lider = pl.ID_Lider
        LEFT JOIN Personas p_lid ON pl.ID_Persona = p_lid.ID_Persona
        LEFT JOIN Telefonos_Personas tp_lid
               ON p_lid.ID_Persona = tp_lid.ID_Persona
              AND tp_lid.Es_Principal = TRUE AND tp_lid.Activo = TRUE
        WHERE pii.ID_Persona = $1
      `, [id]),
      pool.query(`
        SELECT ID_Telefono AS "idTelefono", Tipo AS "tipo", Numero AS "numero",
               Tiene_Whatsapp AS "tieneWhatsapp", Es_Principal AS "esPrincipal"
        FROM Telefonos_Personas
        WHERE ID_Persona = $1 AND Activo = TRUE
        ORDER BY Es_Principal DESC, ID_Telefono ASC
      `, [id]),
      pool.query(`
        SELECT ID_Direccion AS "idDireccion", Tipo_Direccion AS "tipoDireccion",
               Ciudad_Departamento AS "ciudadDepartamento", Municipio AS "municipio",
               Distrito AS "distrito", Barrio AS "barrio", Direccion_Exacta AS "direccionExacta",
               Es_Principal AS "esPrincipal"
        FROM Personas_Direcciones
        WHERE ID_Persona = $1 AND Activo = TRUE
        ORDER BY Es_Principal DESC, ID_Direccion ASC
      `, [id]),
      pool.query(`
        SELECT pg.ID_Grupo AS "idGrupo", g.Nombre AS "grupo"
        FROM Personal_Grupos pg JOIN Grupos g ON g.ID_Grupo = pg.ID_Grupo
        WHERE pg.ID_Personal = $1
      `, [id]),
      pool.query(`
        SELECT pt.ID_Turno AS "idTurno", t.Nombre AS "turno"
        FROM Personal_Turnos pt JOIN Turnos t ON t.ID_Turno = pt.ID_Turno
        WHERE pt.ID_Personal = $1
      `, [id]),
      pool.query(`
        SELECT req.Nombre AS "nombre", req.Tipo AS "tipo", req.Obligatorio AS "obligatorio",
               pr.Cumplido AS "cumplido", pr.Fecha_Cumplido AS "fechaCumplido"
        FROM Personal_Requisitos pr
        JOIN Requisitos req ON req.ID_Requisito = pr.ID_Requisito
        WHERE pr.ID_Personal = $1 ORDER BY req.Obligatorio DESC
      `, [id]),
      pool.query(`
        SELECT ID_Suspension AS "idSuspension", Fecha_Inicio AS "fechaInicio",
               Fecha_Fin AS "fechaFin", Categoria_Motivo AS "categoriaMotivo", Motivo AS "motivo"
        FROM Personal_Suspensiones_Servicio
        WHERE ID_Personal = $1 AND Activo = TRUE
          AND Fecha_Inicio <= CURRENT_DATE
          AND (Fecha_Fin IS NULL OR Fecha_Fin >= CURRENT_DATE)
        LIMIT 1
      `, [id]),
    ]);

    res.json({
      exito: true,
      datos: {
        ...baseRes.rows[0],
        infoPersonal:    ip.rows[0] ?? null,
        infoIglesia:     ii.rows[0] ?? null,
        telefonos:       tels.rows,
        direcciones:     dirs.rows,
        grupos:          gr.rows,
        turnos:          tr.rows,
        requisitos:      rq.rows,
        suspensionActiva: sus.rows[0] ?? null,
      },
    });
  } catch (err) {
    console.error('Error perfil:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  }
};

/**
 * GET /api/personal/:id/perfil-completo
 * Consume la vista v_perfil_completo_personal (todos los bloques en una sola consulta).
 */
export const obtenerPerfilCompleto = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ exito: false, mensaje: 'ID invalido.' });
  try {
    const { rows } = await pool.query(`
      SELECT * FROM v_perfil_completo_personal WHERE ID_Persona = $1
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ exito: false, mensaje: 'Personal no encontrado.' });
    res.json({ exito: true, datos: rows[0] });
  } catch (err) {
    console.error('Error perfil completo:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  }
};

/**
 * GET /api/personal/:id/historial-roles
 * Historial de ascensos y cambios de rol.
 */
export const obtenerHistorialRoles = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ exito: false, mensaje: 'ID invalido.' });
  try {
    const { rows } = await pool.query(`
      SELECT phr.Fecha_Cambio     AS "fechaCambio",
             r_ant.Nombre_Rol     AS "rolAnterior",
             r_nvo.Nombre_Rol     AS "rolNuevo",
             p_aut.Nombres || ' ' || p_aut.Apellidos AS "autorizadoPor",
             phr.Notas            AS "notas"
      FROM Personal_Historial_Roles phr
      LEFT JOIN Roles r_ant           ON phr.ID_Rol_Anterior   = r_ant.ID_Rol
      JOIN      Roles r_nvo           ON phr.ID_Rol_Nuevo       = r_nvo.ID_Rol
      JOIN      Personal_Sistema ps_a ON phr.ID_Autorizado_Por  = ps_a.ID_Persona
      JOIN      Personas p_aut        ON ps_a.ID_Persona         = p_aut.ID_Persona
      WHERE phr.ID_Personal = $1
      ORDER BY phr.Fecha_Cambio DESC
    `, [id]);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error historial roles:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  }
};

/**
 * GET /api/personal/:id/suspensiones
 * Historial de suspensiones.
 */
export const listarSuspensiones = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ exito: false, mensaje: 'ID invalido.' });
  try {
    const { rows } = await pool.query(`
      SELECT pss.ID_Suspension      AS "idSuspension",
             pss.Fecha_Inicio       AS "fechaInicio",
             pss.Fecha_Fin          AS "fechaFin",
             pss.Categoria_Motivo   AS "categoriaMotivo",
             pss.Motivo             AS "motivo",
             pss.Activo             AS "activo",
             p_reg.Nombres || ' ' || p_reg.Apellidos AS "registradoPor"
      FROM Personal_Suspensiones_Servicio pss
      JOIN Personal_Sistema ps_r ON pss.ID_Registrado_Por = ps_r.ID_Persona
      JOIN Personas p_reg         ON ps_r.ID_Persona        = p_reg.ID_Persona
      WHERE pss.ID_Personal = $1
      ORDER BY pss.Fecha_Inicio DESC
    `, [id]);
    res.json({ exito: true, datos: rows });
  } catch (err) {
    console.error('Error listando suspensiones:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  }
};

/**
 * POST /api/personal/:id/suspender
 * Body: { fechaInicio?, fechaFin?, categoriaMotivo, motivo }
 */
export const suspenderPersonal = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ exito: false, mensaje: 'ID invalido.' });

  const { fechaInicio, fechaFin, categoriaMotivo, motivo } = req.body;
  const idRegistradoPor = req.usuario!.idPersona;

  if (!motivo || String(motivo).trim() === '') {
    return res.status(400).json({ exito: false, mensaje: 'El campo motivo es obligatorio.' });
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO Personal_Suspensiones_Servicio
        (ID_Personal, Fecha_Inicio, Fecha_Fin, Categoria_Motivo, Motivo, ID_Registrado_Por)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ID_Suspension AS "idSuspension", Fecha_Inicio AS "fechaInicio"
    `, [
      id,
      fechaInicio ?? new Date().toISOString().split('T')[0],
      fechaFin ?? null,
      categoriaMotivo ?? 'Otro',
      motivo,
      idRegistradoPor,
    ]);
    res.status(201).json({ exito: true, datos: rows[0], mensaje: 'Suspensión registrada.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('personal inactivo')) return res.status(409).json({ exito: false, mensaje: msg });
    console.error('Error suspendiendo personal:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  }
};

/**
 * PATCH /api/personal/:id/suspensiones/:idSus/levantar
 * Levanta una suspensión antes de su fecha fin.
 */
export const levantarSuspension = async (req: Request, res: Response) => {
  const id    = Number(req.params.id);
  const idSus = Number(req.params.idSus);
  try {
    const { rowCount } = await pool.query(`
      UPDATE Personal_Suspensiones_Servicio
      SET Activo = FALSE, Actualizado_En = NOW()
      WHERE ID_Suspension = $1 AND ID_Personal = $2 AND Activo = TRUE
    `, [idSus, id]);
    if ((rowCount ?? 0) === 0) return res.status(404).json({ exito: false, mensaje: 'Suspensión no encontrada o ya levantada.' });
    res.json({ exito: true, mensaje: 'Suspensión levantada.' });
  } catch (err) {
    console.error('Error levantando suspensión:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  }
};

/**
 * PATCH /api/personal/:id/lider
 * Actualiza el líder espiritual de un miembro.
 * Body: { idLider, notas? }
 */
export const actualizarLider = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { idLider, notas } = req.body;
  const idAutorizador = req.usuario!.idPersona;

  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ exito: false, mensaje: 'ID invalido.' });

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    // Requerido por trg_auditoria_cambio_lider
    await cliente.query(`SET LOCAL app.id_autorizador = '${idAutorizador}'`);
    const { rowCount } = await cliente.query(`
      UPDATE Personal_Info_Iglesia SET ID_Lider = $1 WHERE ID_Persona = $2
    `, [idLider ?? null, id]);
    if ((rowCount ?? 0) === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ exito: false, mensaje: 'Perfil de iglesia no encontrado para este miembro.' });
    }
    await cliente.query('COMMIT');
    res.json({ exito: true, mensaje: 'Líder actualizado correctamente.' });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error('Error actualizando líder:', err);
    res.status(500).json({ exito: false, mensaje: 'Error interno.' });
  } finally {
    cliente.release();
  }
};
