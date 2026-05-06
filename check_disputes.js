const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres:990338613ooga@my-postgres-db.cz2qeew0w1dm.eu-north-1.rds.amazonaws.com:5432/aws"
});

async function main() {
  try {
    console.log("Connecting to database...");
    
    // Get last 5 disputes
    const res = await pool.query(`
      SELECT d.id, d.status, d.resolution, d.amount, d.currency, d.contract_id, d.raised_by, d.against_user, d.payout_action, d.payout_amount, d.created_at
      FROM disputes d
      ORDER BY d.created_at DESC
      LIMIT 5
    `);
    
    console.log("\n--- LAST 5 DISPUTES ---");
    console.log(JSON.stringify(res.rows, null, 2));

    if (res.rows.length > 0) {
      const d = res.rows[0];
      console.log(`\nAnalyzing last dispute ID: ${d.id}`);
      
      // Get contract info
      if (d.contract_id) {
        const cRes = await pool.query(`
          SELECT id, status, total_amount, client_id, freelancer_id, currency
          FROM contracts
          WHERE id = $1
        `, [d.contract_id]);
        console.log("\n--- CONTRACT DETAILS ---");
        console.log(JSON.stringify(cRes.rows, null, 2));
      }

      // Get user balances for client and freelancer
      const uRes = await pool.query(`
        SELECT user_id, available_balance, escrow_balance, total_spent, total_earned
        FROM user_balances
        WHERE user_id IN ($1, $2)
      `, [d.raised_by, d.against_user]);
      
      console.log("\n--- USER BALANCES ---");
      console.log(JSON.stringify(uRes.rows, null, 2));

      // Get transactions related to contract or users
      const tRes = await pool.query(`
        SELECT id, user_id, type, amount, currency, status, created_at
        FROM transactions
        WHERE contract_id = $1 OR user_id IN ($2, $3)
        ORDER BY created_at DESC
        LIMIT 10
      `, [d.contract_id, d.raised_by, d.against_user]);
      console.log("\n--- RELATED TRANSACTIONS ---");
      console.log(JSON.stringify(tRes.rows, null, 2));
    }

  } catch (err) {
    console.error("Error running script:", err);
  } finally {
    await pool.end();
  }
}

main();
