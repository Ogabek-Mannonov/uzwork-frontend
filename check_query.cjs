const { Pool } = require('./../uzwork-backend/node_modules/pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:990338613ooga@my-postgres-db.cz2qeew0w1dm.eu-north-1.rds.amazonaws.com:5432/aws',
  ssl: { rejectUnauthorized: false }
});

const toStrOrNull = (val) => (val === undefined ? null : val === null ? null : String(val));
const toNumOrNull = (val) => {
  if (val === undefined || val === null || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
};
const toJsonbOrNull = (val) => {
  if (val === undefined) return null;
  if (val === null) return null;
  const arr = Array.isArray(val) ? val : [val];
  return JSON.stringify(arr);
};

async function checkErr() {
  try {
    const userId = "1f9d92fd-2dc8-4043-ac1c-ade32f3d1f0e"; // Maruf's id
    const title = "";
    const bio = "";
    const hourly_rate = 0;
    const location = "";
    const languages = undefined;
    const skills = ["React", "Node"];
    const avatar_url = undefined;
    const cover_url = undefined;
    const availability_status = undefined;

    const result = await pool.query(
        `
        INSERT INTO freelancer_profiles (
          user_id, title, bio, hourly_rate, location,
          languages, skills,
          avatar_url, cover_url, availability_status
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6::jsonb, $7::jsonb,
          $8, $9, $10
        )
        ON CONFLICT (user_id) DO UPDATE SET
          title = COALESCE(EXCLUDED.title, freelancer_profiles.title),
          bio = COALESCE(EXCLUDED.bio, freelancer_profiles.bio),
          hourly_rate = COALESCE(EXCLUDED.hourly_rate, freelancer_profiles.hourly_rate),
          location = COALESCE(EXCLUDED.location, freelancer_profiles.location),
          languages = COALESCE(EXCLUDED.languages, freelancer_profiles.languages),
          skills = COALESCE(EXCLUDED.skills, freelancer_profiles.skills),
          avatar_url = COALESCE(EXCLUDED.avatar_url, freelancer_profiles.avatar_url),
          cover_url = COALESCE(EXCLUDED.cover_url, freelancer_profiles.cover_url),
          availability_status = COALESCE(EXCLUDED.availability_status, freelancer_profiles.availability_status),
          updated_at = NOW()
        RETURNING *
        `,
        [
          userId,
          toStrOrNull(title),
          toStrOrNull(bio),
          toNumOrNull(hourly_rate),
          toStrOrNull(location),
          toJsonbOrNull(languages),
          toJsonbOrNull(skills),
          toStrOrNull(avatar_url),
          toStrOrNull(cover_url),
          toStrOrNull(availability_status),
        ]
      );
      console.log("SUCCESS!", result.rows[0]);
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    pool.end();
  }
}
checkErr();
