// scratch/seed_db.js
const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres:990338613ooga@my-postgres-db.cz2qeew0w1dm.eu-north-1.rds.amazonaws.com:5432/aws";

const categories = [
  // Development & IT
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Mobile App Development",
  "Game Development",
  "DevOps & Cloud",
  "Data Science & ML",
  "Cybersecurity",
  "Blockchain & Web3",
  "QA & Testing",
  "Desktop Software",
  "Embedded Systems",
  
  // Design & Creative
  "UI/UX Design",
  "Graphic Design",
  "Motion Graphics",
  "3D Modeling & Rendering",
  "Video Editing",
  "Illustration",
  "Brand Identity",
  "Photography",

  // Writing & Translation
  "Content Writing",
  "Copywriting",
  "Technical Writing",
  "Translation & Localization",
  "Proofreading & Editing",

  // Marketing & Sales
  "Digital Marketing",
  "SEO Optimization",
  "SMM Management",
  "Sales & Business Development",
  "Email Marketing",
  "Ads Management",

  // Admin & Others
  "Virtual Assistant",
  "Customer Support",
  "Data Entry",
  "Project Management",
  "Business Analysis",
  "Legal & Finance",
  "Other / Boshqa"
];

async function seed() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected.");

    console.log("Creating categories table if not exists...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    console.log("Seeding categories...");
    for (const name of categories) {
      const exists = await client.query("SELECT id FROM categories WHERE name = $1", [name]);
      if (exists.rows.length === 0) {
        await client.query("INSERT INTO categories (name) VALUES ($1)", [name]);
        console.log(`Added: ${name}`);
      } else {
        console.log(`Skipped (exists): ${name}`);
      }
    }

    console.log("✅ Seeding completed successfully!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await client.end();
  }
}

seed();
