import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Srgio2304@localhost:5432/Ministerio_Infantil' });

async function check() {
  try {
    const res = await pool.query('SELECT * FROM Solicitudes_Personal');
    console.log('Total solicitudes rows in DB:', res.rows.length);
    if (res.rows.length > 0) {
      console.log('First row details:', res.rows[0]);
    }
  } catch (err) {
    console.error('ERROR SELECTING FROM Solicitudes_Personal:', err.message);
  } finally {
    await pool.end();
  }
}

check();
