const { Pool } = require('pg');
require('dotenv').config({ path: '../uzwork-backend/.env' });


const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/uzwork'
});

async function fixPaths() {
  try {
    const res = await pool.query(`
      UPDATE messages 
      SET file_url = REPLACE(file_url, '/uploads/voice/img-', '/uploads/images/img-')
      WHERE file_url LIKE '%/uploads/voice/img-%'
      RETURNING id, file_url;
    `);
    console.log(`Updated ${res.rowCount} messages with corrected image paths.`);
    process.exit(0);
  } catch (err) {
    console.error("Error fixing paths:", err);
    process.exit(1);
  }
}

fixPaths();
