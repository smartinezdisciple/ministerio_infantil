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
    const fechaStr = '2026-06-14';
    const queryModificada = `
      SELECT DISTINCT
        p.ID_Persona AS "idPersona",
        p.Nombres AS "nombres",
        p.Apellidos AS "apellidos",
        CONCAT(p.Nombres, ' ', p.Apellidos) AS "nombreCompleto",
        COALESCE(g.Nombre, 'Sin grupo') AS "nombreGrupo",
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
    `;

    const res = await pool.query(queryModificada, [fechaStr]);
    
    // Contar ocurrencias por idPersona
    const counts = {};
    for (const r of res.rows) {
      counts[r.idPersona] = (counts[r.idPersona] || 0) + 1;
    }

    const duplicates = Object.keys(counts).filter(id => counts[id] > 1);
    console.log('IDs duplicados:', duplicates);

    for (const id of duplicates) {
      console.log(`\nDetalles para ID_Persona = ${id}:`);
      const details = res.rows.filter(r => r.idPersona == id);
      console.table(details);
    }

    // Comprobar la tabla Telefonos_Personas de los familiares de estos duplicados
    for (const id of duplicates) {
      const dbRes = await pool.query(`
        SELECT an.ID_Ingresado_Por, tp.* 
        FROM Asistencia_Ninos an
        LEFT JOIN Telefonos_Personas tp ON tp.ID_Persona = an.ID_Ingresado_Por
        WHERE an.ID_Nino = $1 AND an.Fecha = $2
      `, [id, fechaStr]);
      console.log(`\nTelefonos_Personas para familiar de ID_Persona = ${id}:`);
      console.table(dbRes.rows);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
