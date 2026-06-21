import ExcelJS from 'exceljs';
import path from 'path';
import pool from '../src/config/db.js';

function splitFullName(fullName: string) {
  const cleanName = fullName.trim().replace(/\s+/g, ' ');
  const parts = cleanName.split(' ');
  if (parts.length === 1) {
    return { nombres: parts[0], apellidos: 'Sin Apellido' };
  }
  if (parts.length === 2) {
    return { nombres: parts[0], apellidos: parts[1] };
  }
  if (parts.length === 3) {
    return { nombres: parts[0], apellidos: parts.slice(1).join(' ') };
  }
  const nombres = parts.slice(0, 2).join(' ');
  const apellidos = parts.slice(2).join(' ');
  return { nombres, apellidos };
}

function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }
  return edad;
}

async function main() {
  const filePath = path.resolve('../Datosasistencia2.xlsm.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet('ASISTENCIA');
  if (!sheet) {
    console.error('Worksheet ASISTENCIA not found');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    // Start transaction
    await client.query('BEGIN');

    // Retrieve groups
    const { rows: dbGroups } = await client.query<{ idGrupo: number; nombre: string; edadMinima: number; edadMaxima: number }>(
      `SELECT ID_Grupo AS "idGrupo", Nombre AS "nombre", Edad_Minima AS "edadMinima", Edad_Maxima AS "edadMaxima" FROM Grupos`
    );

    function getGroupIdForAge(age: number): number {
      const g = dbGroups.find(x => age >= x.edadMinima && age <= x.edadMaxima);
      if (g) return g.idGrupo;
      if (age < 2) {
        const minGroup = dbGroups.reduce((prev, curr) => prev.edadMinima < curr.edadMinima ? prev : curr);
        return minGroup.idGrupo;
      }
      const maxGroup = dbGroups.reduce((prev, curr) => prev.edadMaxima > curr.edadMaxima ? prev : curr);
      return maxGroup.idGrupo;
    }

    const tutorMap = new Map<string, number>();
    let childrenInserted = 0;
    let childrenUpdated = 0;
    let tutorsInserted = 0;
    let relationshipsCreated = 0;

    const rows: any[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < 4) return;
      const values = row.values as any[];
      const ninoNombre = values[3];
      if (ninoNombre) {
        rows.push({
          rowNumber,
          ninoNombre: String(ninoNombre).trim(),
          tutorNombre: values[4] ? String(values[4]).trim() : '',
          fechaNac: values[5],
          telefono: values[7]
        });
      }
    });

    console.log(`Processing ${rows.length} rows...`);

    for (const rowData of rows) {
      const { ninoNombre, tutorNombre, fechaNac, telefono } = rowData;

      // Parse birth date
      let dob: Date | null = null;
      if (fechaNac) {
        if (fechaNac instanceof Date) {
          dob = fechaNac;
        } else if (typeof fechaNac === 'string') {
          dob = new Date(fechaNac);
        } else if (typeof fechaNac === 'object' && fechaNac.result) {
          dob = new Date(fechaNac.result);
        }
      }

      if (!dob) {
        console.warn(`Row with child "${ninoNombre}" has invalid or missing DOB. Skipping.`);
        continue;
      }

      const age = calcularEdad(dob);
      const groupId = getGroupIdForAge(age);

      const ninoSplit = splitFullName(ninoNombre);

      // Check if child already exists
      const resNinoExist = await client.query<{ idPersona: number }>(
        `SELECT p.ID_Persona AS "idPersona" FROM Personas p
         JOIN Ninos n ON p.ID_Persona = n.ID_Persona
         WHERE p.Nombres = $1 AND p.Apellidos = $2 AND p.Fecha_Nacimiento = $3`,
        [ninoSplit.nombres, ninoSplit.apellidos, dob.toISOString().split('T')[0]]
      );

      let idNino: number;
      if (resNinoExist.rows.length > 0) {
        idNino = resNinoExist.rows[0].idPersona;
        childrenUpdated++;

        // Ensure they are in Ninos_Grupos
        const resGrpExist = await client.query(
          `SELECT 1 FROM Ninos_Grupos WHERE ID_Nino = $1`,
          [idNino]
        );
        if (resGrpExist.rows.length === 0) {
          await client.query(
            `INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Es_Excepcion)
             VALUES ($1, $2, FALSE)`,
            [idNino, groupId]
          );
        }
      } else {
        // Insert child Persona
        const resNinoPersona = await client.query<{ idPersona: number }>(
          `INSERT INTO Personas (Nombres, Apellidos, Fecha_Nacimiento)
           VALUES ($1, $2, $3)
           RETURNING ID_Persona AS "idPersona"`,
          [ninoSplit.nombres, ninoSplit.apellidos, dob.toISOString().split('T')[0]]
        );
        idNino = resNinoPersona.rows[0].idPersona;

        // Insert subtipo Ninos
        await client.query(
          `INSERT INTO Ninos (ID_Persona) VALUES ($1)`,
          [idNino]
        );

        // Assign Group
        await client.query(
          `INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Es_Excepcion)
           VALUES ($1, $2, FALSE)`,
          [idNino, groupId]
        );
        childrenInserted++;
      }

      // Process Tutor
      if (tutorNombre) {
        const tutorSplit = splitFullName(tutorNombre);
        const tutorKey = `${tutorSplit.nombres.toLowerCase()}|${tutorSplit.apellidos.toLowerCase()}`;

        let telefonoStr = '';
        if (telefono) {
          if (typeof telefono === 'string') {
            telefonoStr = telefono.trim();
          } else {
            telefonoStr = String(telefono).trim();
          }
        }
        if (telefonoStr.toUpperCase() === 'NO') {
          telefonoStr = '';
        }

        let idTutor = tutorMap.get(tutorKey);
        if (!idTutor) {
          // Check DB
          const resTutorExist = await client.query<{ idPersona: number }>(
            `SELECT p.ID_Persona AS "idPersona" FROM Personas p
             JOIN Tutores t ON p.ID_Persona = t.ID_Persona
             WHERE p.Nombres = $1 AND p.Apellidos = $2`,
            [tutorSplit.nombres, tutorSplit.apellidos]
          );

          if (resTutorExist.rows.length > 0) {
            idTutor = resTutorExist.rows[0].idPersona;
            if (telefonoStr) {
              await client.query(
                `UPDATE Personas SET Telefono = $1 WHERE ID_Persona = $2 AND (Telefono IS NULL OR Telefono = '')`,
                [telefonoStr, idTutor]
              );
            }
          } else {
            // Insert Tutor Persona
            const resTutorPersona = await client.query<{ idPersona: number }>(
              `INSERT INTO Personas (Nombres, Apellidos, Telefono)
               VALUES ($1, $2, $3)
               RETURNING ID_Persona AS "idPersona"`,
              [tutorSplit.nombres, tutorSplit.apellidos, telefonoStr || null]
            );
            idTutor = resTutorPersona.rows[0].idPersona;

            // Insert Tutores
            await client.query(
              `INSERT INTO Tutores (ID_Persona, Tipo_Tutor) VALUES ($1, 'Padre/Madre')`,
              [idTutor]
            );
            tutorsInserted++;
          }
          tutorMap.set(tutorKey, idTutor);
        }

        // Link Tutor and Nino
        const resLink = await client.query(
          `SELECT 1 FROM Tutores_Ninos WHERE ID_Tutor = $1 AND ID_Nino = $2`,
          [idTutor, idNino]
        );
        if (resLink.rows.length === 0) {
          await client.query(
            `INSERT INTO Tutores_Ninos (ID_Tutor, ID_Nino) VALUES ($1, $2)`,
            [idTutor, idNino]
          );
          relationshipsCreated++;
        }
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log('\nImport successfully completed!');
    console.log(`- Children inserted: ${childrenInserted}`);
    console.log(`- Children updated: ${childrenUpdated}`);
    console.log(`- Unique Tutors created/resolved: ${tutorsInserted} (Total unique: ${tutorMap.size})`);
    console.log(`- Tutor-Child relationships: ${relationshipsCreated}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during import, rolling back:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
