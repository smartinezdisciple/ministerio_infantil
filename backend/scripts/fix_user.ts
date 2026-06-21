import 'dotenv/config';
import pg from 'pg';
const pool = new pg.Pool();
pool.query("UPDATE Personal_Sistema SET Usuario = 'admin' WHERE Usuario = 'admin@escueladominical.com'")
  .then(() => { console.log('Usuario actualizado a admin'); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
