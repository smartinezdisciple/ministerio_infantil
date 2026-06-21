import fs from 'fs';

const fileContent = fs.readFileSync('c:/Users/Admin/Downloads/Infantil/frontend/src/pages/PaginaSolicitudes.tsx', 'utf-8');
const lines = fileContent.split('\n');

lines.forEach((line, index) => {
  if (line.toLowerCase().includes('otraiglesia') || line.toLowerCase().includes('iglesia') || line.toLowerCase().includes('denominacion')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
