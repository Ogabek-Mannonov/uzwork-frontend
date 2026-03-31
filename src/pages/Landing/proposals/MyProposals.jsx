import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyProposals } from "../../../api/proposals";

const STATUS_COLORS = {
  pending:  { bg: "#fff3e0", color: "#f57c00", label: "Kutilmoqda" },
  accepted: { bg: "#e6f7e6", color: "#14a800", label: "Qabul qilindi" },
  rejected: { bg: "#ffeef0", color: "#dc2626", label: "Rad etildi" },
  withdrawn:{ bg: "#f5f5f5", color: "#999",    label: "Bekor qilindi" },
};

export default function MyProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await getMyProposals();
      if (res?.success === false) setError(res?.message || "Xato");
      else setProposals(res?.data || res?.proposals || res || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Mening Takliflarim</h1>

      {loading && <p style={{ textAlign: "center", color: "#666" }}>Yuklanmoqda...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && proposals.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Hali takliflar yo'q</div>
          <button
            onClick={() => navigate("/jobs")}
            style={{ marginTop: 16, padding: "10px 24px", background: "#14a800", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
          >Ish topish</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {proposals.map((p) => {
          const st = STATUS_COLORS[p.status] || STATUS_COLORS.pending;
          return (
            <div
              key={p.id}
              style={{
                background: "#fff", border: "1px solid #e0e0e0",
                borderRadius: 12, padding: "20px 24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <h3
                  style={{ fontSize: 15, fontWeight: 700, color: "#14a800", cursor: "pointer" }}
                  onClick={() => navigate(`/jobs/${p.project_id}`)}
                >
                  {p.project_title || `Ish #${p.project_id}`}
                </h3>
                <span style={{ fontSize: 12, padding: "3px 12px", borderRadius: 20, fontWeight: 700, background: st.bg, color: st.color }}>
                  {st.label}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#666", marginTop: 8, lineHeight: 1.6 }}>
                {p.cover_letter?.slice(0, 200)}{p.cover_letter?.length > 200 ? "..." : ""}
              </p>
              <div style={{ marginTop: 10, display: "flex", gap: 16, fontSize: 13, color: "#999" }}>
                {p.proposed_price && <span>💰 ${p.proposed_price}</span>}
                {p.proposed_duration && <span>⏱ {p.proposed_duration}</span>}
                {p.created_at && <span>📅 {new Date(p.created_at).toLocaleDateString()}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
