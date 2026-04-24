const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://postgres:990338613ooga@my-postgres-db.cz2qeew0w1dm.eu-north-1.rds.amazonaws.com:5432/aws"
});
async function migrate() {
  try {
    console.log("Starting migration...");
    await pool.query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS title_en TEXT,
      ADD COLUMN IF NOT EXISTS title_ru TEXT,
      ADD COLUMN IF NOT EXISTS body_en TEXT,
      ADD COLUMN IF NOT EXISTS body_ru TEXT;
    `);
    console.log("✅ Columns added successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}
migrate();
