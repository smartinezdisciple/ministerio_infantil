// scripts/sync_neon.cjs
// Sincroniza solicitudes, personas y personal_sistema desde Local hacia Neon.
// Usa cédula como clave única para mapear personas entre ambas BD.
// Uso: NEON_URL="postgresql://..." node scripts/sync_neon.cjs
//      (o pasar URL como primer argumento: node scripts/sync_neon.cjs <url>)

const { Pool } = require('pg');

const NEON_URL = process.argv[2] || process.env.NEON_URL;
if (!NEON_URL) {
  console.error('❌ Debe proporcionar NEON_URL como variable de entorno o argumento.');
  console.error('Uso: NEON_URL="postgresql://..." node scripts/sync_neon.cjs');
  process.exit(1);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Pools de conexión ──────────────────────────────────────────────────────
const localPool = new Pool({
  host:     process.env.PGHOST      || 'localhost',
  port:     Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE  || 'Ministerio_Infantil',
  user:     process.env.PGUSER      || 'postgres',
  password: process.env.PGPASSWORD  || 'Srgio2304',
});

const neonPool = new Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

// ── Helper: serializar fecha para PostgreSQL ────────────────────────────────
const toPGDate = (d) => {
  if (!d) return null;
  if (typeof d === 'string') return d.split('T')[0];
  return d;
};

// ── Helper: obtener nombres de persona ──────────────────────────────────────
const splitNombre = (full) => {
  if (!full) return { nombres: 'Candidato', apellidos: 'Temp' };
  const parts = String(full).trim().split(/\s+/);
  return { nombres: parts[0] || 'Candidato', apellidos: parts.slice(1).join(' ') || 'Temp' };
};

// ── Helper: limpiar texto nulo ──────────────────────────────────────────────
const n = (val) => (val === null || val === undefined ? null : val);

(async () => {
  console.log('📋 Sincronizando datos de Local → Neon');
  console.log('');

  // 1. Obtener IDs de solicitudes que existen en Neon
  const { rows: neonSols } = await neonPool.query(
    'SELECT id_solicitud FROM Solicitudes_Personal ORDER BY id_solicitud'
  );
  const neonSolIds = new Set(neonSols.map(r => r.id_solicitud));
  console.log(`🔵 Neon: ${neonSolIds.size} solicitudes existentes (IDs: ${[...neonSolIds].join(', ')})`);

  // 2. Obtener TODAS las solicitudes locales y filtrar en JS
  const { rows: todasLocal } = await localPool.query(`
    SELECT s.id_solicitud, s.id_persona, s.estado, s.id_rol_solicitado,
           s.notas_staff, s.fecha_solicitud, s.fecha_resolucion,
           s.id_resuelto_por, s.id_gestionado_por,
           s.sexo_candidato, s.cedula_candidato,
           s.ocupacion_candidato, s.centro_laboral_candidato,
           s.nivel_academico_candidato,
           s.estado_civil, s.condicion_civil, s.nombre_conyuge,
           s.conyuge_ocupacion, s.conyuge_centro_laboral,
           s.tiene_hijos, s.numero_hijos,
           s.id_red, s.estado_liderazgo, s.id_lider_propuesto,
           s.circulo_amistad, s.circulo_amistad_desde,
           s.circulo_amistad_precision,
           s.tiempo_iglesia_meses, s.ministerio_adicional,
           s.bautizado_agua, s.fecha_bautismo, s.fecha_bautismo_precision,
           s.clases_biblicas_ninos, s.clases_biblicas_detalle,
           s.capacitacion_ensenanza, s.capacitacion_detalle,
           s.observaciones_espirituales_sol,
           s.asistio_otra_iglesia, s.nombre_otra_iglesia,
           s.denominacion_otra_iglesia,
           s.tel_casa, s.tel_oficina, s.tel_claro, s.tel_movistar,
           s.dir_ciudad, s.dir_municipio, s.dir_distrito, s.dir_barrio,
           s.dir_exacta,
           s.lider_nombres, s.lider_apellidos, s.lider_telefono,
           s.notas_coordinador,
           p.Nombres || ' ' || p.Apellidos AS nombre_completo,
           p.Cedula, p.Sexo, p.Fecha_Nacimiento, p.Telefono
    FROM Solicitudes_Personal s
    JOIN Personas p ON p.ID_Persona = s.ID_Persona
    ORDER BY s.id_solicitud
  `);

  const nuevasSols = todasLocal.filter(s => !neonSolIds.has(s.id_solicitud));
  console.log(`🟢 Local: ${todasLocal.length} solicitudes, ${nuevasSols.length} nuevas para sync`);
  console.log('');

  if (nuevasSols.length === 0) {
    console.log('No hay solicitudes nuevas para sincronizar. Verificando Personal_Sistema faltante...');
  }

  // 3. Para cada solicitud nueva, buscar/crear persona en Neon
  let personasCreadas = 0;
  let personasReutilizadas = 0;
  let solsCreadas = 0;
  let errors = 0;

  for (const sol of nuevasSols) {
    const nombre = sol.nombre_completo || 'Desconocido';
    console.log(`\n${solsCreadas + errors + 1}/${nuevasSols.length} ${nombre}`);

    let neonIdPersona = null;

    try {
      // 3a. Buscar persona en Neon por cédula o nombre
      if (sol.cedula_candidato || sol.Cedula) {
        const cedula = sol.cedula_candidato || sol.Cedula;
        const { rows: existente } = await neonPool.query(
          'SELECT id_persona, nombres FROM Personas WHERE cedula = $1 LIMIT 1',
          [cedula]
        );
        if (existente.length > 0) {
          neonIdPersona = existente[0].id_persona;
          process.stdout.write(`  ℹ️  Persona existente en Neon (ID: ${neonIdPersona})`);
        }
      }

      // 3b. Si no se encontró por cédula, buscar por nombre
      if (!neonIdPersona) {
        const { nombres, apellidos } = splitNombre(nombre);
        const { rows: porNombre } = await neonPool.query(
          `SELECT id_persona FROM Personas 
           WHERE LOWER(Nombres) = LOWER($1) AND LOWER(Apellidos) = LOWER($2)
           LIMIT 1`,
          [nombres, apellidos]
        );
        if (porNombre.length > 0) {
          neonIdPersona = porNombre[0].id_persona;
          process.stdout.write(`  ℹ️  Persona existente en Neon por nombre (ID: ${neonIdPersona})`);
        }
      }

      // 3c. Si no existe, crear persona en Neon
      if (!neonIdPersona) {
        const { nombres, apellidos } = splitNombre(nombre);
        const personaData = {
          nombres,
          apellidos,
          sexo: n(sol.sexo_candidato || sol.Sexo),
          cedula: n(sol.cedula_candidato || sol.Cedula),
          fecha_nacimiento: toPGDate(sol.Fecha_Nacimiento),
          telefono: n(sol.Telefono),
        };

        const { rows: nueva } = await neonPool.query(`
          INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento, Telefono)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id_persona
        `, [
          personaData.nombres, personaData.apellidos,
          personaData.sexo, personaData.cedula,
          personaData.fecha_nacimiento, personaData.telefono,
        ]);
        neonIdPersona = nueva[0].id_persona;
        personasCreadas++;
        process.stdout.write(`  ✅ Persona creada en Neon (ID: ${neonIdPersona})`);
      } else {
        personasReutilizadas++;
      }

      // 3d. Crear solicitud en Neon
      const solPayload = {
        id_persona: neonIdPersona,
        id_rol_solicitado: sol.id_rol_solicitado || 1,
        estado: sol.estado || 'Pendiente',
        notas_staff: sol.notas_staff || null,
        fecha_solicitud: sol.fecha_solicitud || new Date(),
        fecha_resolucion: sol.fecha_resolucion || null,
        id_resuelto_por: sol.id_resuelto_por || null,
        id_gestionado_por: sol.id_gestionado_por || null,
        sexo_candidato: n(sol.sexo_candidato),
        cedula_candidato: n(sol.cedula_candidato),
        ocupacion_candidato: n(sol.ocupacion_candidato),
        centro_laboral_candidato: n(sol.centro_laboral_candidato),
        nivel_academico_candidato: n(sol.nivel_academico_candidato),
        estado_civil: n(sol.estado_civil),
        condicion_civil: n(sol.condicion_civil),
        nombre_conyuge: n(sol.nombre_conyuge),
        conyuge_ocupacion: n(sol.conyuge_ocupacion),
        conyuge_centro_laboral: n(sol.conyuge_centro_laboral),
        tiene_hijos: sol.tiene_hijos ?? false,
        numero_hijos: n(sol.numero_hijos),
        id_red: n(sol.id_red),
        estado_liderazgo: n(sol.estado_liderazgo),
        id_lider_propuesto: n(sol.id_lider_propuesto),
        circulo_amistad: n(sol.circulo_amistad),
        circulo_amistad_desde: toPGDate(sol.circulo_amistad_desde),
        circulo_amistad_precision: n(sol.circulo_amistad_precision),
        tiempo_iglesia_meses: n(sol.tiempo_iglesia_meses),
        ministerio_adicional: n(sol.ministerio_adicional),
        bautizado_agua: sol.bautizado_agua ?? false,
        fecha_bautismo: toPGDate(sol.fecha_bautismo),
        fecha_bautismo_precision: n(sol.fecha_bautismo_precision),
        clases_biblicas_ninos: sol.clases_biblicas_ninos ?? false,
        clases_biblicas_detalle: n(sol.clases_biblicas_detalle),
        capacitacion_ensenanza: sol.capacitacion_ensenanza ?? false,
        capacitacion_detalle: n(sol.capacitacion_detalle),
        observaciones_espirituales_sol: n(sol.observaciones_espirituales_sol),
        asistio_otra_iglesia: sol.asistio_otra_iglesia ?? false,
        nombre_otra_iglesia: n(sol.nombre_otra_iglesia),
        denominacion_otra_iglesia: n(sol.denominacion_otra_iglesia),
        tel_casa: n(sol.tel_casa),
        tel_oficina: n(sol.tel_oficina),
        tel_claro: n(sol.tel_claro),
        tel_movistar: n(sol.tel_movistar),
        dir_ciudad: n(sol.dir_ciudad),
        dir_municipio: n(sol.dir_municipio),
        dir_distrito: n(sol.dir_distrito),
        dir_barrio: n(sol.dir_barrio),
        dir_exacta: n(sol.dir_exacta),
        lider_nombres: n(sol.lider_nombres),
        lider_apellidos: n(sol.lider_apellidos),
        lider_telefono: n(sol.lider_telefono),
        notas_coordinador: n(sol.notas_coordinador),
      };

      const { rows: nuevaSol } = await neonPool.query(`
        INSERT INTO Solicitudes_Personal (
          ID_Persona, ID_Rol_Solicitado, Estado, Notas_Staff,
          Fecha_Solicitud, Fecha_Resolucion,
          ID_Resuelto_Por, ID_Gestionado_Por,
          Sexo_Candidato, Cedula_Candidato,
          Ocupacion_Candidato, Centro_Laboral_Candidato,
          Nivel_Academico_Candidato,
          Estado_Civil, Condicion_Civil, Nombre_Conyuge,
          Conyuge_Ocupacion, Conyuge_Centro_Laboral,
          Tiene_Hijos, Numero_Hijos,
          ID_Red, Estado_Liderazgo, ID_Lider_Propuesto,
          Circulo_Amistad, Circulo_Amistad_Desde,
          Circulo_Amistad_Precision,
          Tiempo_Iglesia_Meses, Ministerio_Adicional,
          Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
          Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
          Capacitacion_Ensenanza, Capacitacion_Detalle,
          Observaciones_Espirituales_Sol,
          Asistio_Otra_Iglesia, Nombre_Otra_Iglesia,
          Denominacion_Otra_Iglesia,
          Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
          Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio,
          Dir_Exacta,
          Lider_Nombres, Lider_Apellidos, Lider_Telefono,
          Notas_Coordinador
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                  $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                  $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
                  $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
                  $51, $52)
        RETURNING id_solicitud
      `, [
        solPayload.id_persona, solPayload.id_rol_solicitado,
        solPayload.estado, solPayload.notas_staff,
        solPayload.fecha_solicitud, solPayload.fecha_resolucion,
        solPayload.id_resuelto_por, solPayload.id_gestionado_por,
        solPayload.sexo_candidato, solPayload.cedula_candidato,
        solPayload.ocupacion_candidato, solPayload.centro_laboral_candidato,
        solPayload.nivel_academico_candidato,
        solPayload.estado_civil, solPayload.condicion_civil,
        solPayload.nombre_conyuge,
        solPayload.conyuge_ocupacion,
        solPayload.conyuge_centro_laboral,
        solPayload.tiene_hijos, solPayload.numero_hijos,
        solPayload.id_red, solPayload.estado_liderazgo,
        solPayload.id_lider_propuesto,
        solPayload.circulo_amistad,
        solPayload.circulo_amistad_desde,
        solPayload.circulo_amistad_precision,
        solPayload.tiempo_iglesia_meses,
        solPayload.ministerio_adicional,
        solPayload.bautizado_agua, solPayload.fecha_bautismo,
        solPayload.fecha_bautismo_precision,
        solPayload.clases_biblicas_ninos,
        solPayload.clases_biblicas_detalle,
        solPayload.capacitacion_ensenanza,
        solPayload.capacitacion_detalle,
        solPayload.observaciones_espirituales_sol,
        solPayload.asistio_otra_iglesia,
        solPayload.nombre_otra_iglesia,
        solPayload.denominacion_otra_iglesia,
        solPayload.tel_casa, solPayload.tel_oficina,
        solPayload.tel_claro, solPayload.tel_movistar,
        solPayload.dir_ciudad, solPayload.dir_municipio,
        solPayload.dir_distrito, solPayload.dir_barrio,
        solPayload.dir_exacta,
        solPayload.lider_nombres, solPayload.lider_apellidos,
        solPayload.lider_telefono,
        solPayload.notas_coordinador,
      ]);
      const neolIdSolicitud = nuevaSol[0].id_solicitud;
      process.stdout.write(` → Solicitud creada en Neon (ID: ${neolIdSolicitud})`);
      solsCreadas++;
      console.log('');

      // 3e. Crear Personal_Sistema si la solicitud está aprobada
      if (sol.estado === 'Aprobado') {
        // Buscar si ya existe Personal_Sistema para esta persona en Neon
        const { rows: existPS } = await neonPool.query(
          'SELECT id_persona FROM Personal_Sistema WHERE id_persona = $1',
          [neonIdPersona]
        );

        if (existPS.length === 0) {
          const tempUsuario = `temp_${neonIdPersona}`;
          const tempPassword = require('crypto').randomUUID();
          const bcrypt = require('bcryptjs');
          const hash = await bcrypt.hash(tempPassword, 12);

          await neonPool.query(`
            INSERT INTO Personal_Sistema
              (ID_Persona, ID_Rol, Usuario, Password_Hash,
               Fecha_Ingreso_Servicio, ID_Solicitud_Origen)
            VALUES ($1, 1, $2, $3, CURRENT_DATE, $4)
          `, [neonIdPersona, tempUsuario, hash, neolIdSolicitud]);
          process.stdout.write(`     🧑 Personal_Sistema creado (usuario: ${tempUsuario})`);
        } else {
          process.stdout.write(`     ℹ️  Personal_Sistema ya existe para ID ${neonIdPersona}`);
        }
        console.log('');
      }

      await sleep(200);
    } catch (err) {
      console.error(`\n  ❌ Error: ${err.message}`);
      if (err.detail) console.error(`     Detalle: ${err.detail}`);
      errors++;
    }
  }

  // ── Resumen ──────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log(`✅ Personas creadas en Neon: ${personasCreadas}`);
  console.log(`ℹ️  Personas reutilizadas: ${personasReutilizadas}`);
  console.log(`✅ Solicitudes creadas en Neon: ${solsCreadas}`);
  if (errors > 0) console.log(`❌ Errores: ${errors}`);
  console.log('═'.repeat(50));

  await localPool.end();
  await neonPool.end();
})();
