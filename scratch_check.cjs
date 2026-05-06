// scratch_check.cjs
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '../uzwork-backend/.env') });
const pool = require("../uzwork-backend/src/db/pool");

async function main() {
  try {
    console.log("--- CHECKING DB STATE FOR RATINGS ---");
    
    // Count of users, contracts, ratings
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM contracts) as contracts_count,
        (SELECT COUNT(*) FROM ratings) as ratings_count
    `);
    console.log("Counts:", counts.rows[0]);

    // Check completed contracts
    const completedContracts = await pool.query(`
      SELECT c.id, c.status, c.client_id, u_cli.email as client_email, c.freelancer_id, u_free.email as freelancer_email
      FROM contracts c
      LEFT JOIN users u_cli ON c.client_id = u_cli.id
      LEFT JOIN users u_free ON c.freelancer_id = u_free.id
      WHERE c.status = 'completed'
      ORDER BY c.updated_at DESC
      LIMIT 10
    `);
    console.log("\nCompleted Contracts:");
    console.table(completedContracts.rows);

    // Check existing ratings
    const ratings = await pool.query(`
      SELECT r.id, r.contract_id, r.from_user_id, r.to_user_id, r.score_quality, r.score_timeliness, r.score_communication, r.score_payment, r.score_clarity, r.comment, r.created_at
      FROM ratings r
      ORDER BY r.created_at DESC
      LIMIT 10
    `);
    console.log("\nRatings:");
    console.table(ratings.rows);

  } catch (err) {
    console.error("Database query error:", err);
  } finally {
    await pool.end();
  }
}

main();
