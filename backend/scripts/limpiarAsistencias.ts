import pool from '../src/config/db.js';

async function main() {
  console.log('Iniciando limpieza de asistencias...');
  
  // Truncar las tablas y reiniciar los contadores de ID
  await pool.query('TRUNCATE TABLE Asistencia_Ninos RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE Asistencia_Maestros RESTART IDENTITY CASCADE');
  
  console.log('✅ Todas las asistencias eliminadas y contadores de ID reiniciados.');
  
  await pool.end();
}

main().catch(error => {
  console.error('❌ Error al limpiar las asistencias:', error);
  process.exit(1);
});
