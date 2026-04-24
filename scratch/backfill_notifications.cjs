const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://postgres:990338613ooga@my-postgres-db.cz2qeew0w1dm.eu-north-1.rds.amazonaws.com:5432/aws",
  ssl: { rejectUnauthorized: false }
});

async function backfill() {
  try {
    console.log("Fetching notifications...");
    const res = await pool.query("SELECT id, type, title, body FROM notifications WHERE title_en IS NULL");
    console.log(`Found ${res.rows.length} notifications to backfill.`);

    for (const row of res.rows) {
      let title_en = row.title;
      let title_ru = row.title;
      let body_en = row.body;
      let body_ru = row.body;

      // Pattern 1: Payment Received
      const payRegex = /([\d,]+) UZS miqdoridagi mablag' hisobingizga muvaffaqiyatli kelib tushdi\./;
      const payMatch = row.body.match(payRegex);
      if (payMatch) {
        const amount = payMatch[1];
        title_en = "Payment received";
        title_ru = "Платеж получен";
        body_en = `You received a payment of ${amount} UZS.`;
        body_ru = `Вы получили платеж в размере ${amount} UZS.`;
      }

      // Pattern 2: Proposal Received
      const propRegex = /"(.*)" loyihangizga (.*) tomonidan yangi taklif keldi\./;
      const propMatch = row.body.match(propRegex);
      if (propMatch) {
        const jobTitle = propMatch[1];
        const freelancerName = propMatch[2];
        title_en = "New proposal received!";
        title_ru = "Получено новое предложение!";
        body_en = `New proposal received for "${jobTitle}" from ${freelancerName}.`;
        body_ru = `Получено новое предложение по проекту "${jobTitle}" от ${freelancerName}.`;
      }

      // Pattern 3: Contract Completed
      const compRegex = /"(.*)" shartnomasi mijoz tomonidan yakunlandi va mablag' balansingizga o'tkazildi\./;
      const compMatch = row.body.match(compRegex);
      if (compMatch) {
        const jobTitle = compMatch[1];
        title_en = "Contract completed!";
        title_ru = "Контракт завершен!";
        body_en = `The contract for "${jobTitle}" has been completed by the client and funds have been released to your balance.`;
        body_ru = `Контракт по проекту "${jobTitle}" был завершен клиентом, и средства были переведены на ваш баланс.`;
      }

      // Update row
      if (title_en !== row.title || body_en !== row.body) {
        await pool.query(
          "UPDATE notifications SET title_en=$1, title_ru=$2, body_en=$3, body_ru=$4 WHERE id=$5",
          [title_en, title_ru, body_en, body_ru, row.id]
        );
      }
    }

    console.log("✅ Backfill completed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
  }
}

backfill();
