import { useEffect, useState } from "react";
import { getPayments } from "../../../api/payments";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await getPayments();
      if (res?.success === false) setError(res?.message || "Xato");
      else setTransactions(res?.data || res?.payments || res || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const typeLabel = {
    deposit:  { label: "Kirim",  color: "#14a800", bg: "#e6f7e6", icon: "↓" },
    withdraw: { label: "Chiqim", color: "#dc2626", bg: "#ffeef0", icon: "↑" },
    escrow:   { label: "Escrow", color: "#f57c00", bg: "#fff3e0", icon: "🔒" },
    release:  { label: "Chiqdi", color: "#2563eb", bg: "#e8f4fd", icon: "✅" },
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Tranzaksiyalar</h1>

      {loading && <p style={{ textAlign: "center", color: "#666" }}>Yuklanmoqda...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && transactions.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Tranzaksiyalar yo'q</div>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0e0e0", overflow: "hidden" }}>
        {transactions.map((tx, i) => {
          const t = typeLabel[tx.type] || { label: tx.type, color: "#666", bg: "#f5f5f5", icon: "•" };
          return (
            <div
              key={tx.id || i}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 20px",
                borderBottom: i < transactions.length - 1 ? "1px solid #f0f0f0" : "none"
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: t.bg, color: t.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 800, flexShrink: 0
              }}>{t.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>
                  {tx.description || t.label}
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                  {tx.created_at ? new Date(tx.created_at).toLocaleString() : ""}
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, color: t.color }}>
                {tx.type === "deposit" || tx.type === "release" ? "+" : "−"}${Math.abs(tx.amount).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
