import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyContracts } from "../../../api/contracts";

const STATUS_CONFIG = {
  active:    { bg: "#e6f7e6", color: "#14a800", label: "Faol" },
  completed: { bg: "#e8f4fd", color: "#2563eb", label: "Yakunlangan" },
  cancelled: { bg: "#ffeef0", color: "#dc2626", label: "Bekor qilingan" },
  disputed:  { bg: "#fff3e0", color: "#f57c00", label: "Nizo" },
};

export default function ContractsList() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await getMyContracts();
      if (res?.success === false) setError(res?.message || "Xato");
      else setContracts(res?.data || res?.contracts || res || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Mening Kontraktlarim</h1>

      {loading && <p style={{ textAlign: "center", color: "#666" }}>Yuklanmoqda...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && contracts.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Hali kontraktlar yo'q</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {contracts.map((c) => {
          const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.active;
          return (
            <div
              key={c.id}
              onClick={() => navigate(`/contracts/${c.id}`)}
              style={{
                background: "#fff", border: "1px solid #e0e0e0",
                borderRadius: 12, padding: "20px 24px", cursor: "pointer",
                transition: "box-shadow 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>
                  {c.project_title || c.title || `Kontrakt #${c.id}`}
                </h3>
                <span style={{ fontSize: 12, padding: "3px 12px", borderRadius: 20, fontWeight: 700, background: st.bg, color: st.color }}>
                  {st.label}
                </span>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 16, fontSize: 13, color: "#999", flexWrap: "wrap" }}>
                {c.total_amount && <span>💰 ${c.total_amount}</span>}
                {c.freelancer_name && <span>👤 {c.freelancer_name}</span>}
                {c.client_name && <span>🏢 {c.client_name}</span>}
                {c.start_date && <span>📅 {new Date(c.start_date).toLocaleDateString()}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
