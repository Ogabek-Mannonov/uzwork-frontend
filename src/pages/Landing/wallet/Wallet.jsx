import { useEffect, useState } from "react";
import { getBalance, getPayments, deposit, withdraw } from "../../../api/payments";

export default function Wallet() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState(null); // "deposit" | "withdraw"
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  const loadBalance = async () => {
    setLoading(true);
    const res = await getBalance();
    setBalance(res?.data || res);
    setLoading(false);
  };

  useEffect(() => { loadBalance(); }, []);

  const handleAction = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      notify("To'g'ri summa kiriting!", "error"); return;
    }
    setProcessing(true);
    const res = mode === "deposit"
      ? await deposit({ amount: Number(amount) })
      : await withdraw({ amount: Number(amount) });
    setProcessing(false);
    if (res?.success === false) notify(res?.message || "Xato", "error");
    else {
      notify(mode === "deposit" ? "Pul muvaffaqiyatli qo'shildi! ✅" : "Pul muvaffaqiyatli chiqarildi! ✅");
      setAmount(""); setMode(null); loadBalance();
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px" }}>
      {toast.msg && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: toast.type === "error" ? "#dc2626" : "#14a800",
          color: "#fff", padding: "12px 20px", borderRadius: 8, fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
        }}>{toast.msg}</div>
      )}

      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Hamyon</h1>

      {/* Balance card */}
      <div style={{
        background: "linear-gradient(135deg, #14a800, #0d7a00)",
        borderRadius: 16, padding: "28px 32px", color: "#fff", marginBottom: 24,
        boxShadow: "0 8px 24px rgba(20,168,0,0.25)"
      }}>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8, fontWeight: 600 }}>Joriy balans</div>
        {loading
          ? <div style={{ fontSize: 36, fontWeight: 900 }}>Yuklanmoqda...</div>
          : <div style={{ fontSize: 42, fontWeight: 900 }}>
              ${(balance?.balance || balance?.available_balance || 0).toLocaleString()}
            </div>
        }
        {balance?.pending_balance !== undefined && (
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 8 }}>
            Kutilmoqda: ${balance.pending_balance.toLocaleString()}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setMode(mode === "deposit" ? null : "deposit")}
          style={{
            flex: 1, padding: "12px 0", background: mode === "deposit" ? "#14a800" : "#e6f7e6",
            color: mode === "deposit" ? "#fff" : "#14a800",
            border: "2px solid #14a800", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14
          }}
        >+ Pul qo'shish</button>
        <button
          onClick={() => setMode(mode === "withdraw" ? null : "withdraw")}
          style={{
            flex: 1, padding: "12px 0", background: mode === "withdraw" ? "#2563eb" : "#e8f4fd",
            color: mode === "withdraw" ? "#fff" : "#2563eb",
            border: "2px solid #2563eb", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14
          }}
        >↗ Pul chiqarish</button>
      </div>

      {/* Amount input */}
      {mode && (
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>
            {mode === "deposit" ? "Qancha pul qo'shish?" : "Qancha pul chiqarish?"}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "#999" }}>$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ width: "100%", padding: "10px 12px 10px 28px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 16, fontWeight: 700, boxSizing: "border-box" }}
              />
            </div>
            <button
              onClick={handleAction}
              disabled={processing}
              style={{
                padding: "10px 20px", borderRadius: 8,
                background: mode === "deposit" ? "#14a800" : "#2563eb",
                color: "#fff", border: "none", fontWeight: 700, cursor: "pointer"
              }}
            >{processing ? "..." : mode === "deposit" ? "Qo'shish" : "Chiqarish"}</button>
          </div>
          {[10, 25, 50, 100].map(v => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              style={{ marginTop: 10, marginRight: 8, padding: "5px 14px", borderRadius: 20, background: "#f0f0f0", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
            >${v}</button>
          ))}
        </div>
      )}
    </div>
  );
}
