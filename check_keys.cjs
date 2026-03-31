const { Pool } = require('./../uzwork-backend/node_modules/pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:990338613ooga@my-postgres-db.cz2qeew0w1dm.eu-north-1.rds.amazonaws.com:5432/aws',
  ssl: { rejectUnauthorized: false }
});

async function checkKeys() {
  try {
    const res = await pool.query(`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_name = 'freelancer_profiles'
    `);
    console.log("CONSTRAINTS:", res.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    pool.end();
  }
}
checkKeys();
