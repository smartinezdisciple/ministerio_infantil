import ExcelJS from 'exceljs';
import path from 'path';

function splitFullName(fullName: string) {
  const parts = fullName.trim().replace(/\s+/g, ' ').split(' ');
  if (parts.length === 1) {
    return { nombres: parts[0], apellidos: 'Sin apellido' };
  }
  if (parts.length === 2) {
    return { nombres: parts[0], apellidos: parts[1] };
  }
  const half = Math.ceil(parts.length / 2);
  const nombres = parts.slice(0, half).join(' ');
  const apellidos = parts.slice(half).join(' ');
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
    return;
  }

  const records: any[] = [];
  
  sheet.eachRow((row, rowNumber) => {
    // Data starts from row 4
    if (rowNumber < 4) return;

    const values = row.values as any[];
    // Index mapping:
    // values[2] (Col B): ID
    // values[3] (Col C): Nombre del niño
    // values[4] (Col D): Nombre del padre
    // values[5] (Col E): Fecha de nacimiento
    // values[6] (Col F): Edad (could be formula or value)
    // values[7] (Col G): Teléfono

    const id = values[2];
    const ninoNombre = values[3];
    const tutorNombre = values[4];
    const fechaNac = values[5];
    const edadObj = values[6];
    const telefono = values[7];

    if (!ninoNombre) return;

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

    records.push({
      rowNumber,
      id,
      ninoNombre: String(ninoNombre).trim(),
      tutorNombre: tutorNombre ? String(tutorNombre).trim() : '',
      dob,
      telefono: telefonoStr
    });
  });

  console.log(`Total records read: ${records.length}`);
  console.log('Sample records (first 10):');
  console.log(JSON.stringify(records.slice(0, 10), null, 2));

  // Analyze age distribution
  const ages: Record<number, number> = {};
  let nullDobCount = 0;

  for (const r of records) {
    if (r.dob) {
      const age = calcularEdad(r.dob);
      ages[age] = (ages[age] || 0) + 1;
    } else {
      nullDobCount++;
    }
  }

  console.log('\nAge Distribution based on DOB:');
  console.log(ages);
  console.log(`Records with no DOB: ${nullDobCount}`);
}

main().catch(console.error);
