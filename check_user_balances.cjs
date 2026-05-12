const { Pool } = require('../uzwork-backend/node_modules/pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:990338613ooga@my-postgres-db.cz2qeew0w1dm.eu-north-1.rds.amazonaws.com:5432/aws',
  ssl: false
});

async function checkCols() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='user_balances'
    `);
    console.log("USER_BALANCES COLS:", res.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    pool.end();
  }
}
checkCols();
