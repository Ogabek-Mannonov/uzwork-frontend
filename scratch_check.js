// scratch_check.js
const pool = require("../uzwork-backend/src/db/pool");

async function check() {
  try {
    const contractId = '3a70e7ef-a1b8-4774-a970-b5a7a967eb1a';
    console.log("--- CHECKING DETAILS FOR CONTRACT:", contractId);
    
    const cRes = await pool.query('SELECT status, client_id, freelancer_id FROM contracts WHERE id = $1', [contractId]);
    console.log("Contract status:", cRes.rows[0]);

    const mRes = await pool.query('SELECT id, status, title, amount FROM milestones WHERE contract_id = $1', [contractId]);
    console.log("Milestones:", mRes.rows);

    const rRes = await pool.query('SELECT id, from_user_id, to_user_id, score_quality, score_payment FROM ratings WHERE contract_id = $1', [contractId]);
    console.log("Ratings:", rRes.rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}

check();
