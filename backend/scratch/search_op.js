import fs from 'fs';

const content = fs.readFileSync('c:/Users/Admin/Downloads/Infantil/backend/src/controllers/solicitudesControlador.ts', 'utf-8');
const lines = content.split('\n');

const results = [];
lines.forEach((line, idx) => {
  if (line.includes('estadoOperativo') || line.includes('Estado_Operativo')) {
    results.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log(results.join('\n'));
