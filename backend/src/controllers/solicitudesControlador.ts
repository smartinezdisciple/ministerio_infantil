// src/controllers/solicitudesControlador.ts — Módulo de Solicitudes de Personal
// Esquema v5.1: sin estado 'Borrador'. Flujo directo: Pendiente → Aprobado/Rechazado/En_Revision.
// Snapshot ampliado con 25+ columnas nuevas. Mentor eliminado → Líder propuesto.
import { Request, Response } from 'express';
import pool from '../config/db.js';
import { respuestaExito, respuestaError, respuestaProhibido } from '../utils/respuesta.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Helper para sanitizar y mapear valores del cuerpo de la solicitud a tipos DB/enums
const sanitizarCamposSolicitud = (body: any): any => {
  const clean = { ...body };

  const toEnum = <T extends string>(val: any, allowed: readonly T[], fallback: T | null = null): T | null => {
    if (typeof val !== 'string') return null;
    const trimmed = val.trim();
    if (trimmed === '') return null;
    if (allowed.includes(trimmed as T)) return trimmed as T;
    return fallback;
  };

  // 1. sexoCandidato
  if (body.sexoCandidato !== undefined) {
    clean.sexoCandidato = toEnum(body.sexoCandidato, ['Masculino', 'Femenino']);
  }

  // 2. estadoCivil
  if (body.estadoCivil !== undefined) {
    clean.estadoCivil = toEnum(body.estadoCivil, [
      'Soltero', 'Acompañado', 'Casado', 'Divorciado', 'Viudo',
      'Union_Libre', 'Segundo_Matrimonio', 'Separado', 'Madre_Soltera', 'Padre_Soltero'
    ]);
  }

  // 3. condicionCivil
  if (body.condicionCivil !== undefined) {
    clean.condicionCivil = toEnum(body.condicionCivil, [
      'Ninguna', 'Divorciado_1er_Matrimonio', 'Divorciado_2do_Matrimonio', 'Divorciado_3er_Matrimonio',
      'Viudo', 'Primer_Matrimonio', 'Tercer_Matrimonio', 'Otro_Matrimonio', 'Segundo_Matrimonio'
    ]) || 'Ninguna';
  }

  // 4. nivelAcademicoCandidato
  if (body.nivelAcademicoCandidato !== undefined) {
    const rawVal = typeof body.nivelAcademicoCandidato === 'string' ? body.nivelAcademicoCandidato.trim() : '';
    if (rawVal === 'Tecnico') {
      clean.nivelAcademicoCandidato = 'Nivel_Tecnico';
    } else if (rawVal === 'Universitario') {
      clean.nivelAcademicoCandidato = 'Licenciatura';
    } else if (rawVal === 'Ninguno') {
      clean.nivelAcademicoCandidato = null;
    } else {
      clean.nivelAcademicoCandidato = toEnum(body.nivelAcademicoCandidato, [
        'Primaria', 'Secundaria', 'Nivel_Tecnico', 'Licenciatura',
        'Ingenieria', 'Postgrado', 'Maestria', 'Doctorado', 'Otro'
      ]);
    }
  }

  // 6. denominacionOtraIglesia
  if (body.denominacionOtraIglesia !== undefined) {
    const rawVal = typeof body.denominacionOtraIglesia === 'string' ? body.denominacionOtraIglesia.trim() : '';
    if (rawVal === '') {
      clean.denominacionOtraIglesia = null;
    } else if (/cat[oó]lico/i.test(rawVal)) {
      clean.denominacionOtraIglesia = 'Católico';
    } else if (/jehov[aá]/i.test(rawVal)) {
      clean.denominacionOtraIglesia = 'Testigo de Jehová';
    } else if (/evangelico/i.test(rawVal)) {
      clean.denominacionOtraIglesia = 'Evangelico';
    } else if (/pentecostal/i.test(rawVal)) {
      clean.denominacionOtraIglesia = 'Pentecostal';
    } else {
      clean.denominacionOtraIglesia = toEnum(body.denominacionOtraIglesia, [
        'Pentecostal', 'Evangelico', 'Católico', 'Testigo de Jehová', 'Otro'
      ], 'Otro');
    }
  }

  // 7. estadoLiderazgo
  if (body.estadoLiderazgo !== undefined) {
    clean.estadoLiderazgo = toEnum(body.estadoLiderazgo, ['Gap', 'Lider', 'Mentor', 'Miembro', 'Lider_Apoyo']);
  }

  // 8. fechaBautismoPrecision
  if (body.fechaBautismoPrecision !== undefined) {
    const rawVal = typeof body.fechaBautismoPrecision === 'string' ? body.fechaBautismoPrecision.trim() : '';
    if (rawVal === 'Exacta' || rawVal === 'Aproximada' || rawVal === 'Dia') {
      clean.fechaBautismoPrecision = 'Dia';
    } else if (rawVal === 'Anio' || rawVal === 'Ano') {
      clean.fechaBautismoPrecision = 'Ano';
    } else {
      clean.fechaBautismoPrecision = toEnum(body.fechaBautismoPrecision, ['Dia', 'Mes', 'Ano']);
    }
  }

  // 9. circuloAmistadPrecision
  if (body.circuloAmistadPrecision !== undefined) {
    const rawVal = typeof body.circuloAmistadPrecision === 'string' ? body.circuloAmistadPrecision.trim() : '';
    if (rawVal === 'Exacta' || rawVal === 'Aproximada' || rawVal === 'Dia') {
      clean.circuloAmistadPrecision = 'Dia';
    } else if (rawVal === 'Anio' || rawVal === 'Ano') {
      clean.circuloAmistadPrecision = 'Ano';
    } else {
      clean.circuloAmistadPrecision = toEnum(body.circuloAmistadPrecision, ['Dia', 'Mes', 'Ano']);
    }
  }

  // 10. General string inputs: convert empty string to null
  const nullIfEmpty = [
    'notasStaff', 'cedulaCandidato', 'ocupacionCandidato', 'centroLaboralCandidato',
    'telCasa', 'telOficina', 'telClaro', 'telMovistar',
    'dirCiudad', 'dirMunicipio', 'dirDistrito', 'dirBarrio', 'dirExacta',
    'nombreConyuge', 'conyugeOcupacion', 'conyugeCentroLaboral',
    'liderNombres', 'liderApellidos', 'liderTelefono', 'nombreOtraIglesia',
    'ministerioAdicional', 'clasesBiblicasDetalle', 'capacitacionDetalle',
    'observacionesEspirituales', 'fechaBautismo', 'circuloAmistadDesde'
  ];

  for (const field of nullIfEmpty) {
    if (body[field] !== undefined) {
      if (typeof body[field] === 'string' && body[field].trim() === '') {
        clean[field] = null;
      }
    }
  }

  return clean;
};


// ─── Consulta base — reconstruye el formulario completo desde el snapshot ─────
const CONSULTA_SOLICITUD_BASE = `
  SELECT
    sp.ID_Solicitud                                           AS "idSolicitud",
    sp.ID_Persona                                             AS "idPersona",
    p_cand.Nombres || ' ' || p_cand.Apellidos                AS "candidato",
    p_cand.Sexo                                               AS "sexoPersona",
    -- Datos base de la persona (no en snapshot)
    p_cand.Fecha_Nacimiento                                   AS "fechaNacimiento",
    -- Bloque A — datos del candidato en el snapshot
    sp.Sexo_Candidato                                         AS "sexoCandidato",
    sp.Cedula_Candidato                                       AS "cedulaCandidato",
    sp.Ocupacion_Candidato                                    AS "ocupacionCandidato",
    sp.Centro_Laboral_Candidato                               AS "centroLaboralCandidato",
    sp.Nivel_Academico_Candidato                              AS "nivelAcademicoCandidato",
    -- Teléfonos del snapshot
    sp.Tel_Casa                                               AS "telCasa",
    sp.Tel_Oficina                                            AS "telOficina",
    sp.Tel_Claro                                              AS "telClaro",
    sp.Tel_Movistar                                           AS "telMovistar",
    -- Dirección del snapshot
    sp.Dir_Ciudad                                             AS "dirCiudad",
    sp.Dir_Municipio                                          AS "dirMunicipio",
    sp.Dir_Distrito                                           AS "dirDistrito",
    sp.Dir_Barrio                                             AS "dirBarrio",
    sp.Dir_Exacta                                             AS "dirExacta",
    -- Bloque B — familiar
    sp.Estado_Civil                                           AS "estadoCivil",
    sp.Condicion_Civil                                        AS "condicionCivil",
    sp.Nombre_Conyuge                                         AS "nombreConyuge",
    sp.Conyuge_Ocupacion                                      AS "conyugeOcupacion",
    sp.Conyuge_Centro_Laboral                                 AS "conyugeCentroLaboral",
    sp.Tiene_Hijos                                            AS "tieneHijos",
    sp.Numero_Hijos                                           AS "numeroHijos",
    -- Bloque C — eclesiástico
    sp.ID_Red                                                 AS "idRed",
    red.Nombre                                                AS "red",
    sp.Bautizado_Agua                                         AS "bautizadoAgua",
    sp.Fecha_Bautismo                                         AS "fechaBautismo",
    sp.Fecha_Bautismo_Precision                               AS "fechaBautismoPrecision",
    sp.Circulo_Amistad                                        AS "circuloAmistad",
    sp.Circulo_Amistad_Desde                                  AS "circuloAmistadDesde",
    sp.Circulo_Amistad_Precision                              AS "circuloAmistadPrecision",
    sp.Tiempo_Iglesia_Meses                                   AS "tiempoIglesiaMeses",
    sp.Ministerio_Adicional                                   AS "ministerioAdicional",
    sp.Clases_Biblicas_Ninos                                  AS "clasesBiblicasNinos",
    sp.Clases_Biblicas_Detalle                                AS "clasesBiblicasDetalle",
    sp.Capacitacion_Ensenanza                                 AS "capacitacionEnsenanza",
    sp.Capacitacion_Detalle                                   AS "capacitacionDetalle",
    sp.Observaciones_Espirituales_Sol                         AS "observacionesEspirituales",
    sp.Estado_Liderazgo                                       AS "estadoLiderazgo",
    -- Bloque D — líder / mentor (datos de texto libre)
    sp.Lider_Nombres                                          AS "liderNombres",
    sp.Lider_Apellidos                                        AS "liderApellidos",
    sp.Lider_Telefono                                         AS "liderTelefono",
    -- Bloque E — historial en otras iglesias
    sp.Asistio_Otra_Iglesia                                   AS "asistioOtraIglesia",
    sp.Nombre_Otra_Iglesia                                    AS "nombreOtraIglesia",
    sp.Denominacion_Otra_Iglesia                              AS "denominacionOtraIglesia",
    -- Metadatos de la solicitud
    sp.ID_Rol_Solicitado                                      AS "idRolSolicitado",
    r.Nombre_Rol                                              AS "rolSolicitado",
    sp.ID_Gestionado_Por                                      AS "idGestionadoPor",
    p_staff.Nombres || ' ' || p_staff.Apellidos              AS "gestionadoPor",
    sp.ID_Resuelto_Por                                        AS "idResueltoPor",
    p_res.Nombres || ' ' || p_res.Apellidos                  AS "resueltoPor",
    sp.Estado                                                 AS "estado",
    sp.Fecha_Solicitud                                        AS "fechaSolicitud",
    sp.Fecha_Resolucion                                       AS "fechaResolucion",
    sp.Notas_Staff                                            AS "notasStaff",
    sp.Notas_Coordinador                                      AS "notasCoordinador",
    -- Contadores de requisitos (excluye req 7 para Mentores)
    (SELECT COUNT(*)::INT
     FROM Solicitudes_Requisitos sr
     JOIN Requisitos req ON sr.ID_Requisito = req.ID_Requisito
     WHERE sr.ID_Solicitud = sp.ID_Solicitud
       AND sr.Cumplido = TRUE AND req.Obligatorio = TRUE
       AND NOT (req.ID_Requisito = 7 AND sp.Estado_Liderazgo = 'Mentor')) AS "reqCumplidos",
    (SELECT COUNT(*)::INT
     FROM Requisitos req
     WHERE req.Activo = TRUE AND req.Obligatorio = TRUE
       AND (req.ID_Rol_Requerido IS NULL
            OR req.ID_Rol_Requerido = sp.ID_Rol_Solicitado)
       AND NOT (req.ID_Requisito = 7 AND sp.Estado_Liderazgo = 'Mentor'))   AS "reqTotal"
  FROM Solicitudes_Personal sp
  JOIN Personas p_cand          ON sp.ID_Persona         = p_cand.ID_Persona
  JOIN Roles r                  ON sp.ID_Rol_Solicitado  = r.ID_Rol
  JOIN Personal_Sistema ps_staff ON sp.ID_Gestionado_Por = ps_staff.ID_Persona
  JOIN Personas p_staff         ON ps_staff.ID_Persona   = p_staff.ID_Persona
  LEFT JOIN Personal_Sistema ps_res ON sp.ID_Resuelto_Por = ps_res.ID_Persona
  LEFT JOIN Personas p_res      ON ps_res.ID_Persona     = p_res.ID_Persona
  LEFT JOIN Redes red            ON sp.ID_Red             = red.ID_Red
`;

// ─── Estados válidos v5.1 (sin 'Borrador') ───────────────────────────────────
const ESTADOS_VALIDOS = ['Pendiente', 'Aprobado', 'Rechazado', 'En_Revision'] as const;
type EstadoSolicitud = typeof ESTADOS_VALIDOS[number];

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/solicitudes?estado=X — Listar solicitudes con filtro opcional
// ─────────────────────────────────────────────────────────────────────────────
export const listarSolicitudes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estado } = req.query;

    if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado as EstadoSolicitud)) {
      respuestaError(res, `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`, 400);
      return;
    }

    let consulta = CONSULTA_SOLICITUD_BASE;
    const parametros: unknown[] = [];

    if (estado) {
      consulta += ` WHERE sp.Estado = $1`;
      parametros.push(estado);
    }

    consulta += ` ORDER BY sp.Fecha_Solicitud DESC`;

    const resultado = await pool.query(consulta, parametros);
    respuestaExito(res, resultado.rows);
  } catch (error) {
    console.error('Error al listar solicitudes:', error);
    respuestaError(res, 'Error interno al obtener las solicitudes', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /api/solicitudes — Crear nueva solicitud en estado Pendiente
// (sin estado Borrador — la solicitud va directo a revisión del coordinador)
// ─────────────────────────────────────────────────────────────────────────────
export const crearSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const cleanBody = sanitizarCamposSolicitud(req.body);
    const {
      idPersona,
      idRolSolicitado,
      notasStaff,
      // Bloque A
      sexoCandidato,
      cedulaCandidato,
      ocupacionCandidato,
      centroLaboralCandidato,
      nivelAcademicoCandidato,
      telCasa,
      telOficina,
      telClaro,
      telMovistar,
      dirCiudad,
      dirMunicipio,
      dirDistrito,
      dirBarrio,
      dirExacta,
      // Bloque B
      estadoCivil,
      condicionCivil,
      nombreConyuge,
      conyugeOcupacion,
      conyugeCentroLaboral,
      tieneHijos,
      numeroHijos,
      // Bloque C
      idRed,
      bautizadoAgua,
      fechaBautismo,
      fechaBautismoPrecision,
      circuloAmistad,
      circuloAmistadDesde,
      circuloAmistadPrecision,
      tiempoIglesiaMeses,
      ministerioAdicional,
      clasesBiblicasNinos,
      clasesBiblicasDetalle,
      capacitacionEnsenanza,
      capacitacionDetalle,
      observacionesEspirituales,
      estadoLiderazgo,
      // Bloque D — líder / mentor (texto libre)
      liderNombres,
      liderApellidos,
      liderTelefono,
      // Bloque E — historial en otras iglesias
      asistioOtraIglesia,
      nombreOtraIglesia,
      denominacionOtraIglesia,
      // Requisitos
      requisitos,
    } = cleanBody;

    if (!idPersona || !idRolSolicitado) {
      respuestaError(res, 'Los campos idPersona e idRolSolicitado son obligatorios', 400);
      return;
    }

    const idGestionadoPor = req.usuario!.idPersona;

    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');

      // Obtener requisitos obligatorios para el rol (excluye req 7 para Mentores)
      const reqObligatoriosRes = await cliente.query(
        `SELECT ID_Requisito AS "idRequisito", Nombre AS "nombre"
         FROM Requisitos
         WHERE Activo = TRUE AND Obligatorio = TRUE
           AND (ID_Rol_Requerido IS NULL OR ID_Rol_Requerido = $1)
           AND NOT (ID_Requisito = 7 AND $2 = 'Mentor')`,
        [idRolSolicitado, estadoLiderazgo ?? null]
      );
      
      const reqObligatorios = reqObligatoriosRes.rows;
      const reqEnviadosMap = new Map<number, boolean>();
      if (Array.isArray(requisitos)) {
        for (const r of requisitos) {
          const reqId = typeof r === 'object' && r !== null ? r.idRequisito : r;
          const cumplido = typeof r === 'object' && r !== null ? !!r.cumplido : false;
          reqEnviadosMap.set(reqId, cumplido);
        }
      }

      const faltantes: string[] = [];
      for (const reqOblig of reqObligatorios) {
        const cumplido = reqEnviadosMap.get(reqOblig.idRequisito) ?? false;
        if (!cumplido) {
          faltantes.push(reqOblig.nombre);
        }
      }

      let estadoInicial = 'Pendiente';
      let notasCoordinadorAuto = null;
      let fechaResolucionAuto = null;
      let idResueltoPorAuto = null;

      if (faltantes.length > 0 && process.env.STRICT_REQUIREMENTS_MODE === 'true') {
        estadoInicial = 'Rechazado';
        notasCoordinadorAuto = `Rechazada automáticamente por falta de requisitos obligatorios: ${faltantes.join(', ')}.`;
        fechaResolucionAuto = new Date();
        idResueltoPorAuto = idGestionadoPor;
      }

      const resultadoSolicitud = await cliente.query(
        `INSERT INTO Solicitudes_Personal (
          ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, Estado,
          Notas_Staff,
          Sexo_Candidato, Cedula_Candidato, Ocupacion_Candidato,
          Centro_Laboral_Candidato, Nivel_Academico_Candidato,
          Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
          Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
          Estado_Civil, Condicion_Civil, Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
          Tiene_Hijos, Numero_Hijos,
          ID_Red,
          Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
          Circulo_Amistad, Circulo_Amistad_Desde, Circulo_Amistad_Precision,
          Tiempo_Iglesia_Meses, Ministerio_Adicional,
          Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
          Capacitacion_Ensenanza, Capacitacion_Detalle,
          Observaciones_Espirituales_Sol,
          Estado_Liderazgo,
          Lider_Nombres, Lider_Apellidos, Lider_Telefono,
          Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia,
          Notas_Coordinador, Fecha_Resolucion, ID_Resuelto_Por
        ) VALUES (
          $1,  $2,  $3,  $4,  $5,  $6,  $7,  $8,  $9,  $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
          $41, $42, $43, $44, $45, $46, $47, $48, $49, $50
        )
        RETURNING ID_Solicitud AS "idSolicitud"`,
        [
          idPersona,
          idRolSolicitado,
          idGestionadoPor,
          estadoInicial,
          notasStaff               ?? null,
          sexoCandidato            ?? null,
          cedulaCandidato          ?? null,
          ocupacionCandidato       ?? null,
          centroLaboralCandidato   ?? null,
          nivelAcademicoCandidato  ?? null,
          telCasa                  ?? null,
          telOficina               ?? null,
          telClaro                 ?? null,
          telMovistar              ?? null,
          dirCiudad                ?? null,
          dirMunicipio             ?? null,
          dirDistrito              ?? null,
          dirBarrio                ?? null,
          dirExacta                ?? null,
          estadoCivil              ?? null,
          condicionCivil           ?? 'Ninguna',
          nombreConyuge            ?? null,
          conyugeOcupacion         ?? null,
          conyugeCentroLaboral     ?? null,
          tieneHijos               ?? false,
          numeroHijos              ?? null,
          idRed                    ?? null,
          bautizadoAgua            ?? false,
          fechaBautismo            ?? null,
          fechaBautismoPrecision   ?? null,
          circuloAmistad           ?? null,
          circuloAmistadDesde      ?? null,
          circuloAmistadPrecision  ?? null,
          tiempoIglesiaMeses       ?? null,
          ministerioAdicional      ?? null,
          clasesBiblicasNinos      ?? false,
          clasesBiblicasDetalle    ?? null,
          capacitacionEnsenanza    ?? false,
          capacitacionDetalle      ?? null,
          observacionesEspirituales ?? null,
          estadoLiderazgo          ?? null,
          liderNombres             ?? null,
          liderApellidos           ?? null,
          liderTelefono            ?? null,
          asistioOtraIglesia       ?? false,
          nombreOtraIglesia        ?? null,
          denominacionOtraIglesia  ?? null,
          notasCoordinadorAuto,
          fechaResolucionAuto,
          idResueltoPorAuto,
        ]
      );

      const idSolicitud: number = resultadoSolicitud.rows[0].idSolicitud;

      // Insertar requisitos
      if (Array.isArray(requisitos) && requisitos.length > 0) {
        for (const r of requisitos) {
          const reqId = typeof r === 'object' && r !== null ? r.idRequisito : r;
          const cumplido = typeof r === 'object' && r !== null ? !!r.cumplido : false;
          const fecha = typeof r === 'object' && r !== null ? r.fechaCumplido : null;
          const notas = typeof r === 'object' && r !== null ? r.notas : null;

          await cliente.query(
            `INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido, Notas)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              idSolicitud,
              reqId,
              cumplido,
              cumplido ? (fecha ? new Date(fecha) : new Date()) : null,
              notas ?? null
            ]
          );
        }
      } else {
        const resultadoRequisitos = await cliente.query(
          `SELECT ID_Requisito AS "idRequisito" FROM Requisitos
           WHERE Activo = TRUE
             AND (ID_Rol_Requerido IS NULL OR ID_Rol_Requerido = $1)
             AND NOT (ID_Requisito = 7 AND $2 = 'Mentor')`,
          [idRolSolicitado, estadoLiderazgo ?? null]
        );
        for (const fila of resultadoRequisitos.rows) {
          await cliente.query(
            `INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido)
             VALUES ($1, $2, FALSE)`,
            [idSolicitud, fila.idRequisito]
          );
        }
      }

      await cliente.query('COMMIT');

      const resultadoCompleto = await pool.query(
        `${CONSULTA_SOLICITUD_BASE} WHERE sp.ID_Solicitud = $1`,
        [idSolicitud]
      );
      respuestaExito(res, resultadoCompleto.rows[0], 201);
    } catch (errorTransaccion) {
      await cliente.query('ROLLBACK');
      throw errorTransaccion;
    } finally {
      cliente.release();
    }
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    respuestaError(res, 'Error interno al crear la solicitud', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. PATCH /api/solicitudes/:id — Actualizar solicitud (solo en estado Pendiente)
// ─────────────────────────────────────────────────────────────────────────────
export const actualizarSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const verificacion = await pool.query(
      `SELECT Estado FROM Solicitudes_Personal WHERE ID_Solicitud = $1`,
      [id]
    );

    if ((verificacion.rowCount ?? 0) === 0) {
      respuestaError(res, 'Solicitud no encontrada', 404);
      return;
    }

    if (verificacion.rows[0].Estado !== 'Pendiente') {
      respuestaError(res, 'Solo se puede editar una solicitud en estado Pendiente.', 409);
      return;
    }

    const cleanBody = sanitizarCamposSolicitud(req.body);

    // Mapa completo de campos actualizables → columnas BD
    const mapaColumnas: Record<string, unknown> = {
      ID_Persona:                   cleanBody.idPersona,
      ID_Rol_Solicitado:            cleanBody.idRolSolicitado,
      Notas_Staff:                  cleanBody.notasStaff,
      // Bloque A
      Sexo_Candidato:               cleanBody.sexoCandidato,
      Cedula_Candidato:             cleanBody.cedulaCandidato,
      Ocupacion_Candidato:          cleanBody.ocupacionCandidato,
      Centro_Laboral_Candidato:     cleanBody.centroLaboralCandidato,
      Nivel_Academico_Candidato:    cleanBody.nivelAcademicoCandidato,
      Tel_Casa:                     cleanBody.telCasa,
      Tel_Oficina:                  cleanBody.telOficina,
      Tel_Claro:                    cleanBody.telClaro,
      Tel_Movistar:                 cleanBody.telMovistar,
      Dir_Ciudad:                   cleanBody.dirCiudad,
      Dir_Municipio:                cleanBody.dirMunicipio,
      Dir_Distrito:                 cleanBody.dirDistrito,
      Dir_Barrio:                   cleanBody.dirBarrio,
      Dir_Exacta:                   cleanBody.dirExacta,
      // Bloque B
      Estado_Civil:                 cleanBody.estadoCivil,
      Condicion_Civil:              cleanBody.condicionCivil,
      Nombre_Conyuge:               cleanBody.nombreConyuge,
      Conyuge_Ocupacion:            cleanBody.conyugeOcupacion,
      Conyuge_Centro_Laboral:       cleanBody.conyugeCentroLaboral,
      Tiene_Hijos:                  cleanBody.tieneHijos,
      Numero_Hijos:                 cleanBody.numeroHijos,
      // Bloque C
      ID_Red:                       cleanBody.idRed,
      Bautizado_Agua:               cleanBody.bautizadoAgua,
      Fecha_Bautismo:               cleanBody.fechaBautismo,
      Fecha_Bautismo_Precision:     cleanBody.fechaBautismoPrecision,
      Circulo_Amistad:              cleanBody.circuloAmistad,
      Circulo_Amistad_Desde:        cleanBody.circuloAmistadDesde,
      Circulo_Amistad_Precision:    cleanBody.circuloAmistadPrecision,
      Tiempo_Iglesia_Meses:         cleanBody.tiempoIglesiaMeses,
      Ministerio_Adicional:         cleanBody.ministerioAdicional,
      Clases_Biblicas_Ninos:        cleanBody.clasesBiblicasNinos,
      Clases_Biblicas_Detalle:      cleanBody.clasesBiblicasDetalle,
      Capacitacion_Ensenanza:       cleanBody.capacitacionEnsenanza,
      Capacitacion_Detalle:         cleanBody.capacitacionDetalle,
      Observaciones_Espirituales_Sol: cleanBody.observacionesEspirituales,
      Estado_Liderazgo:             cleanBody.estadoLiderazgo,
      // Bloque D — líder / mentor (texto libre)
      Lider_Nombres:                cleanBody.liderNombres,
      Lider_Apellidos:              cleanBody.liderApellidos,
      Lider_Telefono:               cleanBody.liderTelefono,
      // Bloque E — historial en otras iglesias
      Asistio_Otra_Iglesia:         cleanBody.asistioOtraIglesia,
      Nombre_Otra_Iglesia:          cleanBody.nombreOtraIglesia,
      Denominacion_Otra_Iglesia:    cleanBody.denominacionOtraIglesia,
    };

    const setCampos: string[] = [];
    const valores: unknown[] = [];
    let indice = 1;

    for (const [columna, valor] of Object.entries(mapaColumnas)) {
      if (valor !== undefined) {
        setCampos.push(`${columna} = $${indice++}`);
        valores.push(valor ?? null);
      }
    }

    if (setCampos.length === 0) {
      respuestaError(res, 'Se debe enviar al menos un campo para actualizar', 400);
      return;
    }

    valores.push(id);

    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');

      await cliente.query(
        `UPDATE Solicitudes_Personal SET ${setCampos.join(', ')} WHERE ID_Solicitud = $${indice}`,
        valores
      );

      if (Array.isArray(req.body.requisitos)) {
        for (const r of req.body.requisitos) {
          const reqId = typeof r === 'object' && r !== null ? r.idRequisito : r;
          const cumplido = typeof r === 'object' && r !== null ? !!r.cumplido : false;
          const fecha = typeof r === 'object' && r !== null ? r.fechaCumplido : null;
          const notas = typeof r === 'object' && r !== null ? r.notas : null;

          await cliente.query(
            `INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido, Notas)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (ID_Solicitud, ID_Requisito)
             DO UPDATE SET Cumplido = EXCLUDED.Cumplido,
                           Fecha_Cumplido = EXCLUDED.Fecha_Cumplido,
                           Notas = EXCLUDED.Notas`,
            [
              id,
              reqId,
              cumplido,
              cumplido ? (fecha ? new Date(fecha) : new Date()) : null,
              notas ?? null
            ]
          );
        }
      }

      await cliente.query('COMMIT');
    } catch (errorTransaccion) {
      await cliente.query('ROLLBACK');
      throw errorTransaccion;
    } finally {
      cliente.release();
    }

    const resultadoCompleto = await pool.query(
      `${CONSULTA_SOLICITUD_BASE} WHERE sp.ID_Solicitud = $1`,
      [id]
    );
    respuestaExito(res, resultadoCompleto.rows[0]);
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    respuestaError(res, 'Error interno al actualizar la solicitud', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH /api/solicitudes/:id/aprobar — Solo nivel 4 (Coordinador General)
// ─────────────────────────────────────────────────────────────────────────────
export const aprobarSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req.usuario?.nivelJerarquico ?? 0) < 4) {
      respuestaProhibido(res, 'Solo el Coordinador General puede aprobar solicitudes.');
      return;
    }

    const { id } = req.params;
    const { notas } = req.body;

    const verificacion = await pool.query(
      `SELECT Estado AS "estado", ID_Persona AS "idPersona" 
       FROM Solicitudes_Personal WHERE ID_Solicitud = $1`,
      [id]
    );

    if ((verificacion.rowCount ?? 0) === 0) {
      respuestaError(res, 'Solicitud no encontrada', 404);
      return;
    }

    const solicitud = verificacion.rows[0];

    if (solicitud.estado !== 'Pendiente') {
      respuestaError(res, 'Solo se puede aprobar una solicitud en estado Pendiente.', 409);
      return;
    }

    const idPersona = solicitud.idPersona;
    const idResueltoPor = req.usuario!.idPersona;

    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      await cliente.query(`SET LOCAL app.id_autorizador = '${idResueltoPor}'`);

      const tempUsuario = `temp_${idPersona}`;
      const tempPassword = crypto.randomUUID();
      const hash = await bcrypt.hash(tempPassword, 12);

      await cliente.query(
        `INSERT INTO Personal_Sistema 
           (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
         VALUES ($1, 1, $2, $3, CURRENT_DATE, $4, $5, $6)`,
        [idPersona, tempUsuario, hash, idResueltoPor, idResueltoPor, id]
      );

      await cliente.query(
        `UPDATE Solicitudes_Personal
         SET Estado            = 'Aprobado',
             ID_Resuelto_Por   = $1,
             Fecha_Resolucion  = NOW(),
             Notas_Coordinador = $2,
             ID_Rol_Solicitado = 1,
             Estado_Civil      = COALESCE(Estado_Civil, 'Soltero'::estado_civil),
             Condicion_Civil   = COALESCE(Condicion_Civil, 'Ninguna'::condicion_civil),
             Tiene_Hijos       = COALESCE(Tiene_Hijos, FALSE),
             Fecha_Bautismo_Precision = CASE 
                 WHEN Fecha_Bautismo IS NOT NULL AND Fecha_Bautismo_Precision IS NULL 
                 THEN 'Dia'::tipo_precision_fecha 
                 ELSE Fecha_Bautismo_Precision 
             END,
             Circulo_Amistad_Precision = CASE 
                 WHEN Circulo_Amistad_Desde IS NOT NULL AND Circulo_Amistad_Precision IS NULL 
                 THEN 'Dia'::tipo_precision_fecha 
                 ELSE Circulo_Amistad_Precision 
             END,
             Clases_Biblicas_Detalle = CASE 
                 WHEN Clases_Biblicas_Ninos = TRUE AND Clases_Biblicas_Detalle IS NULL 
                 THEN 'Completado' 
                 ELSE Clases_Biblicas_Detalle 
             END,
             Capacitacion_Detalle = CASE 
                 WHEN Capacitacion_Ensenanza = TRUE AND Capacitacion_Detalle IS NULL 
                 THEN 'Completado' 
                 ELSE Capacitacion_Detalle 
             END
         WHERE ID_Solicitud = $3`,
        [idResueltoPor, notas ?? null, id]
      );

      await cliente.query('COMMIT');
    } catch (err) {
      await cliente.query('ROLLBACK');
      throw err;
    } finally {
      cliente.release();
    }

    const resultadoCompleto = await pool.query(
      `${CONSULTA_SOLICITUD_BASE} WHERE sp.ID_Solicitud = $1`,
      [id]
    );
    respuestaExito(res, resultadoCompleto.rows[0]);
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    respuestaError(res, 'Error interno al aprobar la solicitud', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATCH /api/solicitudes/:id/rechazar — Solo nivel 4 (Coordinador General)
// ─────────────────────────────────────────────────────────────────────────────
export const rechazarSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req.usuario?.nivelJerarquico ?? 0) < 4) {
      respuestaProhibido(res, 'Solo el Coordinador General puede rechazar solicitudes.');
      return;
    }

    const { id } = req.params;
    const { notas } = req.body;

    if (!notas || String(notas).trim() === '') {
      respuestaError(res, 'Las notas son obligatorias al rechazar una solicitud.', 400);
      return;
    }

    const verificacion = await pool.query(
      `SELECT Estado FROM Solicitudes_Personal WHERE ID_Solicitud = $1`,
      [id]
    );

    if ((verificacion.rowCount ?? 0) === 0) {
      respuestaError(res, 'Solicitud no encontrada', 404);
      return;
    }

    if (verificacion.rows[0].Estado !== 'Pendiente') {
      respuestaError(res, 'Solo se puede rechazar una solicitud en estado Pendiente.', 409);
      return;
    }

    const idResueltoPor = req.usuario!.idPersona;

    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      await cliente.query(`SET LOCAL app.id_autorizador = '${idResueltoPor}'`);

      await cliente.query(
        `UPDATE Solicitudes_Personal
         SET Estado            = 'Rechazado',
             ID_Resuelto_Por   = $1,
             Fecha_Resolucion  = NOW(),
             Notas_Coordinador = $2
         WHERE ID_Solicitud = $3`,
        [idResueltoPor, notas, id]
      );

      await cliente.query('COMMIT');
    } catch (err) {
      await cliente.query('ROLLBACK');
      throw err;
    } finally {
      cliente.release();
    }

    const resultadoCompleto = await pool.query(
      `${CONSULTA_SOLICITUD_BASE} WHERE sp.ID_Solicitud = $1`,
      [id]
    );
    respuestaExito(res, resultadoCompleto.rows[0]);
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    respuestaError(res, 'Error interno al rechazar la solicitud', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. PATCH /api/solicitudes/:id/revisar — Marcar como En_Revision (nivel 3+)
// ─────────────────────────────────────────────────────────────────────────────
export const marcarEnRevision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notas } = req.body;

    const verificacion = await pool.query(
      `SELECT Estado FROM Solicitudes_Personal WHERE ID_Solicitud = $1`,
      [id]
    );

    if ((verificacion.rowCount ?? 0) === 0) {
      respuestaError(res, 'Solicitud no encontrada', 404);
      return;
    }

    if (verificacion.rows[0].Estado !== 'Pendiente') {
      respuestaError(res, 'Solo se puede marcar como En_Revision una solicitud Pendiente.', 409);
      return;
    }

    const idUsuario = req.usuario!.idPersona;
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      await cliente.query(`SET LOCAL app.id_autorizador = '${idUsuario}'`);
      await cliente.query(
        `UPDATE Solicitudes_Personal
         SET Estado     = 'En_Revision',
             Notas_Staff = COALESCE($1, Notas_Staff)
         WHERE ID_Solicitud = $2`,
        [notas ?? null, id]
      );
      await cliente.query('COMMIT');
    } catch (err) {
      await cliente.query('ROLLBACK');
      throw err;
    } finally {
      cliente.release();
    }

    const resultadoCompleto = await pool.query(
      `${CONSULTA_SOLICITUD_BASE} WHERE sp.ID_Solicitud = $1`,
      [id]
    );
    respuestaExito(res, resultadoCompleto.rows[0]);
  } catch (error) {
    console.error('Error al marcar solicitud en revisión:', error);
    respuestaError(res, 'Error interno', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. DELETE /api/solicitudes/:id — Eliminar solicitud (nivel 4+)
// ─────────────────────────────────────────────────────────────────────────────
export const eliminarSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req.usuario?.nivelJerarquico ?? 0) < 4) {
      respuestaProhibido(res, 'Solo el Coordinador General puede eliminar solicitudes.');
      return;
    }

    const { id } = req.params;

    const verificacion = await pool.query(
      `SELECT ID_Solicitud, Estado FROM Solicitudes_Personal WHERE ID_Solicitud = $1`,
      [id]
    );

    if ((verificacion.rowCount ?? 0) === 0) {
      respuestaError(res, 'Solicitud no encontrada', 404);
      return;
    }

    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      await cliente.query(`SET LOCAL app.id_autorizador = '${req.usuario!.idPersona}'`);

      // Desvincular Personal_Sistema si existe
      await cliente.query(
        `UPDATE Personal_Sistema SET ID_Solicitud_Origen = NULL WHERE ID_Solicitud_Origen = $1`,
        [id]
      );

      await cliente.query(`DELETE FROM Solicitudes_Requisitos WHERE ID_Solicitud = $1`, [id]);
      await cliente.query(`DELETE FROM Solicitudes_Historial_Estado WHERE ID_Solicitud = $1`, [id]);
      await cliente.query(`DELETE FROM Solicitudes_Personal WHERE ID_Solicitud = $1`, [id]);

      await cliente.query('COMMIT');
      res.json({ exito: true, mensaje: 'Solicitud eliminada correctamente.' });
    } catch (err) {
      await cliente.query('ROLLBACK');
      throw err;
    } finally {
      cliente.release();
    }
  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    respuestaError(res, 'Error interno al eliminar la solicitud', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. GET /api/solicitudes/:id/requisitos — Listar requisitos
// ─────────────────────────────────────────────────────────────────────────────
export const obtenerRequisitosSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const verificacion = await pool.query(
      `SELECT ID_Solicitud FROM Solicitudes_Personal WHERE ID_Solicitud = $1`,
      [id]
    );

    if ((verificacion.rowCount ?? 0) === 0) {
      respuestaError(res, 'Solicitud no encontrada', 404);
      return;
    }

    const resultado = await pool.query(
      `SELECT r.ID_Requisito    AS "idRequisito",
              r.Nombre          AS "nombre",
              r.Tipo            AS "tipo",
              r.Obligatorio     AS "obligatorio",
              sr.Cumplido       AS "cumplido",
              sr.Fecha_Cumplido AS "fechaCumplido",
              sr.Notas          AS "notas"
       FROM Solicitudes_Requisitos sr
       JOIN Requisitos r ON r.ID_Requisito = sr.ID_Requisito
       WHERE sr.ID_Solicitud = $1
       ORDER BY r.Obligatorio DESC, r.Tipo, r.Nombre`,
      [id]
    );

    respuestaExito(res, resultado.rows);
  } catch (error) {
    console.error('Error al obtener requisitos de solicitud:', error);
    respuestaError(res, 'Error interno al obtener los requisitos', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. PATCH /api/solicitudes/:id/requisitos/:idRequisito — Actualizar requisito
// ─────────────────────────────────────────────────────────────────────────────
export const actualizarRequisitoSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, idRequisito } = req.params;
    const { cumplido, fechaCumplido, notas } = req.body;

    if (cumplido === undefined) {
      respuestaError(res, 'El campo cumplido es obligatorio', 400);
      return;
    }

    const verificacion = await pool.query(
      `SELECT Estado FROM Solicitudes_Personal WHERE ID_Solicitud = $1`,
      [id]
    );

    if ((verificacion.rowCount ?? 0) === 0) {
      respuestaError(res, 'Solicitud no encontrada', 404);
      return;
    }

    // Permitir editar requisitos en Pendiente o En_Revision
    const estadoActual = verificacion.rows[0].Estado;
    if (!['Pendiente', 'En_Revision'].includes(estadoActual)) {
      respuestaError(
        res,
        'Solo se pueden modificar requisitos de solicitudes en estado Pendiente o En_Revision.',
        409
      );
      return;
    }

    const resultado = await pool.query(
      `UPDATE Solicitudes_Requisitos
       SET Cumplido       = $1,
           Fecha_Cumplido = $2,
           Notas          = $3
       WHERE ID_Solicitud = $4 AND ID_Requisito = $5
       RETURNING
         ID_Requisito    AS "idRequisito",
         ID_Solicitud    AS "idSolicitud",
         Cumplido        AS "cumplido",
         Fecha_Cumplido  AS "fechaCumplido",
         Notas           AS "notas"`,
      [cumplido, fechaCumplido ?? null, notas ?? null, id, idRequisito]
    );

    if ((resultado.rowCount ?? 0) === 0) {
      respuestaError(res, 'Requisito no encontrado en esta solicitud', 404);
      return;
    }

    respuestaExito(res, resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar requisito de solicitud:', error);
    respuestaError(res, 'Error interno al actualizar el requisito', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. GET /api/solicitudes/:id/historial — Historial de cambios de estado
// ─────────────────────────────────────────────────────────────────────────────
export const obtenerHistorialSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const verificacion = await pool.query(
      `SELECT ID_Solicitud FROM Solicitudes_Personal WHERE ID_Solicitud = $1`,
      [id]
    );

    if ((verificacion.rowCount ?? 0) === 0) {
      respuestaError(res, 'Solicitud no encontrada', 404);
      return;
    }

    const resultado = await pool.query(
      `SELECT
         sh.ID_Historial    AS "idHistorial",
         sh.Estado_Anterior AS "estadoAnterior",
         sh.Estado_Nuevo    AS "estadoNuevo",
         sh.Fecha_Cambio    AS "fechaCambio",
         sh.Notas           AS "notas",
         p.Nombres || ' ' || p.Apellidos AS "cambiadoPor"
       FROM Solicitudes_Historial_Estado sh
       JOIN Personal_Sistema ps ON sh.ID_Cambiado_Por = ps.ID_Persona
       JOIN Personas p          ON ps.ID_Persona      = p.ID_Persona
       WHERE sh.ID_Solicitud = $1
       ORDER BY sh.Fecha_Cambio DESC`,
      [id]
    );

    respuestaExito(res, resultado.rows);
  } catch (error) {
    console.error('Error al obtener historial de solicitud:', error);
    respuestaError(res, 'Error interno al obtener el historial', 500);
  }
};
