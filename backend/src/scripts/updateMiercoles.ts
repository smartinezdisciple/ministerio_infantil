import { pool } from '../config/db.js';


async function run() {
  console.log('--- Actualizando turno Miercoles a 18:30:00 ---');
  try {
    const res = await pool.query(
      "UPDATE Turnos SET Hora_Inicio = '18:30:00' WHERE Nombre = 'Miercoles'"
    );
    console.log(`✅ Turnos actualizados: ${res.rowCount}`);
  } catch (error) {
    console.error('❌ Error actualizando turno:', error);
  } finally {
    await pool.end();
  }
}

run();
