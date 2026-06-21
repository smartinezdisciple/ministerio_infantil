import ExcelJS from 'exceljs';
import path from 'path';

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
    // e.g. "Abel Calero Perez" -> nombres: "Abel", apellidos: "Calero Perez"
    return { nombres: parts[0], apellidos: parts.slice(1).join(' ') };
  }
  // e.g. "Elías Josue Ullitte Parrales" -> nombres: "Elías Josue", apellidos: "Ullitte Parrales"
  // Let's take the first 2 words as nombres, and the rest as apellidos
  const nombres = parts.slice(0, 2).join(' ');
  const apellidos = parts.slice(2).join(' ');
  return { nombres, apellidos };
}

async function main() {
  const filePath = path.resolve('../Datosasistencia2.xlsm.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet('ASISTENCIA');
  if (!sheet) return;

  const names: any[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber < 4) return;
    const values = row.values as any[];
    const ninoNombre = values[3];
    const tutorNombre = values[4];
    if (ninoNombre) {
      names.push({
        originalNino: ninoNombre,
        splitNino: splitFullName(String(ninoNombre)),
        originalTutor: tutorNombre || '',
        splitTutor: tutorNombre ? splitFullName(String(tutorNombre)) : null
      });
    }
  });

  console.log('Sample of 20 split names:');
  console.log(JSON.stringify(names.slice(0, 20), null, 2));
}

main().catch(console.error);
