import { useEffect, useState } from "react";
import { getMyDisputes, createDispute } from "../../../api/common";
import { useNavigate } from "react-router-dom";

export default function DisputesList() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await getMyDisputes();
      if (res?.success === false) setError(res?.message || "Xato");
      else setDisputes(res?.data || res?.disputes || res || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const statusColors = {
    open:     { bg: "#fff3e0", color: "#f57c00", label: "Ochiq" },
    resolved: { bg: "#e6f7e6", color: "#14a800", label: "Hal etilgan" },
    closed:   { bg: "#f5f5f5", color: "#999",    label: "Yopilgan" },
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Nizolar</h1>

      {loading && <p style={{ textAlign: "center", color: "#666" }}>Yuklanmoqda...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && disputes.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚖️</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Hali nizolar yo'q</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {disputes.map((d) => {
          const st = statusColors[d.status] || statusColors.open;
          return (
            <div
              key={d.id}
              onClick={() => navigate(`/disputes/${d.id}`)}
              style={{
                background: "#fff", border: "1px solid #e0e0e0",
                borderRadius: 12, padding: "20px 24px", cursor: "pointer",
                transition: "box-shadow 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                  {d.title || `Nizo #${d.id}`}
                </h3>
                <span style={{ fontSize: 12, padding: "3px 12px", borderRadius: 20, fontWeight: 700, background: st.bg, color: st.color }}>
                  {st.label}
                </span>
              </div>
              {d.description && (
                <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
                  {d.description?.slice(0, 160)}{d.description?.length > 160 ? "..." : ""}
                </p>
              )}
              <div style={{ marginTop: 10, fontSize: 12, color: "#aaa" }}>
                {d.created_at && new Date(d.created_at).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
