import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'Ministerio_Infantil',
  user: 'postgres',
  password: 'Srgio2304'
});

async function run() {
  try {
    // Buscar una fecha con asistencia
    const fechaRes = await pool.query('SELECT DISTINCT Fecha FROM Asistencia_Ninos ORDER BY Fecha DESC LIMIT 5');
    console.log('Fechas de asistencia recientes:', fechaRes.rows.map(r => r.fecha));

    if (fechaRes.rows.length === 0) {
      console.log('No hay asistencias.');
      return;
    }

    const fecha = fechaRes.rows[0].fecha;

    const queryOriginal = `
      SELECT DISTINCT
        p.ID_Persona AS "idPersona",
        p.Nombres AS "nombres",
        p.Apellidos AS "apellidos",
        CONCAT(p.Nombres, ' ', p.Apellidos) AS "nombreCompleto",
        TO_CHAR(p.Fecha_Nacimiento, 'YYYY-MM-DD') AS "fechaNacimiento",
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.Fecha_Nacimiento))::integer AS "edad",
        COALESCE(g.Nombre, 'Sin grupo') AS "nombreGrupo",
        COALESCE(g.ID_Grupo, 0) AS "idGrupo"
      FROM Personas p
      JOIN Ninos n ON n.ID_Persona = p.ID_Persona
      JOIN Asistencia_Ninos an ON an.ID_Nino = p.ID_Persona
      LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino = p.ID_Persona
      LEFT JOIN Grupos g ON g.ID_Grupo = ng.ID_Grupo
      WHERE an.Fecha = $1
      ORDER BY "nombreGrupo", p.Apellidos, p.Nombres
    `;

    const resOrig = await pool.query(queryOriginal, [fecha]);
    console.log(`Query Original para fecha ${fecha.toISOString().split('T')[0]}: ${resOrig.rows.length} filas.`);
    
    const queryModificada = `
      SELECT DISTINCT
        p.ID_Persona AS "idPersona",
        p.Nombres AS "nombres",
        p.Apellidos AS "apellidos",
        CONCAT(p.Nombres, ' ', p.Apellidos) AS "nombreCompleto",
        TO_CHAR(p.Fecha_Nacimiento, 'YYYY-MM-DD') AS "fechaNacimiento",
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.Fecha_Nacimiento))::integer AS "edad",
        COALESCE(g.Nombre, 'Sin grupo') AS "nombreGrupo",
        COALESCE(g.ID_Grupo, 0) AS "idGrupo",
        CONCAT(t_ing.Nombres, ' ', t_ing.Apellidos) AS "familiarIngreso",
        tp.Numero AS "telefonoFamiliar"
      FROM Personas p
      JOIN Ninos n ON n.ID_Persona = p.ID_Persona
      JOIN Asistencia_Ninos an ON an.ID_Nino = p.ID_Persona
      LEFT JOIN Personas t_ing ON t_ing.ID_Persona = an.ID_Ingresado_Por
      LEFT JOIN Telefonos_Personas tp ON tp.ID_Persona = an.ID_Ingresado_Por AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
      LEFT JOIN Ninos_Grupos ng ON ng.ID_Nino = p.ID_Persona
      LEFT JOIN Grupos g ON g.ID_Grupo = ng.ID_Grupo
      WHERE an.Fecha = $1
      ORDER BY "nombreGrupo", p.Apellidos, p.Nombres
    `;

    const resMod = await pool.query(queryModificada, [fecha]);
    console.log(`Query Modificada para fecha ${fecha.toISOString().split('T')[0]}: ${resMod.rows.length} filas.`);

    // Comparar diferencias
    const idsOrig = resOrig.rows.map(r => r.idPersona);
    const idsMod = resMod.rows.map(r => r.idPersona);

    const diff = idsMod.filter(id => !idsOrig.includes(id));
    const diff2 = idsOrig.filter(id => !idsMod.includes(id));

    console.log('Diferencias (Modificada tiene y Original no):', diff);
    console.log('Diferencias (Original tiene y Modificada no):', diff2);

    // Si hay diferencias, mostrar los datos
    if (resMod.rows.length !== resOrig.rows.length) {
      console.log('Muestras de filas en la modificada:');
      console.table(resMod.rows.slice(0, 10));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
