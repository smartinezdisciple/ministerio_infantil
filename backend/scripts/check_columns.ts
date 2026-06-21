import 'dotenv/config';
import pg from 'pg';
const pool = new pg.Pool();
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'personal_sistema'")
  .then(res => { console.log(res.rows); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
