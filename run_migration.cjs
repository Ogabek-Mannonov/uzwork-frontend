// run_migration.cjs - Frontend papkasidan ishlatish uchun
// node run_migration.cjs

require("dotenv").config({ path: "../uzwork-backend/.env" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log("🔧 Database ga ulandi:", process.env.DATABASE_URL?.substring(0, 40) + "...");
    
    // Jadvallarni tekshir
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'freelancer%'
      ORDER BY table_name;
    `);
    console.log("📋 Mavjud freelancer jadvallar:", tablesRes.rows.map(r => r.table_name));
    
    // freelancer_certifications jadvalini yaratish
    await client.query(`
      CREATE TABLE IF NOT EXISTS freelancer_certifications (
        id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title           VARCHAR(255) NOT NULL,
        issuer          VARCHAR(255),
        issue_year      INT,
        issue_month     INT CHECK (issue_month BETWEEN 1 AND 12),
        credential_id   VARCHAR(255),
        credential_url  TEXT,
        certificate_file_url    TEXT,
        certificate_filename    VARCHAR(255),
        certificate_mime        VARCHAR(100),
        certificate_size_bytes  BIGINT,
        file_updated_at TIMESTAMP,
        created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMP   NOT NULL DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_freelancer_certifications_user_id
        ON freelancer_certifications(user_id);
    `);
    
    console.log("✅ freelancer_certifications jadvali tayyor (yaratildi yoki allaqachon bor edi)!");
    
    // Tekshirish - ustunlar
    const colsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'freelancer_certifications'
      ORDER BY ordinal_position;
    `);
    console.log("📋 Jadval ustunlari:");
    colsRes.rows.forEach(r => console.log(`   - ${r.column_name} (${r.data_type})`));
    
  } catch (err) {
    console.error("❌ Xato:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
