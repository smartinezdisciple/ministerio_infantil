import ExcelJS from 'exceljs';
import path from 'path';

async function main() {
  const filePath = path.resolve('../Datosasistencia2.xlsm.xlsx');
  console.log('Reading from:', filePath);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  console.log('Sheet Names:', workbook.worksheets.map(w => w.name));

  for (const sheet of workbook.worksheets) {
    console.log(`\n--- Sheet: ${sheet.name} ---`);
    const rows = [];
    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber <= 5) {
        rows.push({
          rowNumber,
          values: row.values
        });
      }
    });
    console.log(JSON.stringify(rows, null, 2));
  }
}

main().catch(console.error);
