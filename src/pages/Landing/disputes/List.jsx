import { useEffect, useState } from "react";
import { getMyDisputes } from "../../../api/common";
import { useNavigate } from "react-router-dom";
import { Scale, ArrowRight, ShieldAlert, Calendar } from "lucide-react";
import "./disputes.css";

export default function DisputesList() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await getMyDisputes();
      if (res?.success === false) setError(res?.message || "Xato yuz berdi");
      else setDisputes(res?.data || res?.disputes || res || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const statusColors = {
    open:     { bg: "rgba(245, 124, 0, 0.12)", color: "#f57c00", label: "Ochiq" },
    resolved: { bg: "rgba(16, 185, 129, 0.12)", color: "#10b981", label: "Hal etilgan" },
    closed:   { bg: "rgba(100, 116, 139, 0.12)", color: "#64748b", label: "Yopilgan" },
  };

  return (
    <div className="disp-container soft-fade-in" style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 className="disp-title" style={{ fontSize: 28, display: "flex", alignItems: "center", gap: 12 }}>
          <Scale size={28} style={{ color: "var(--brand)" }} /> Nizolar Ro'yxati
        </h1>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <span className="disp-spinner" style={{ width: 32, height: 32, borderTopColor: "var(--brand)", borderLeftColor: "var(--brand-light)" }}></span>
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 16, padding: 16, color: "#ef4444", textAlign: "center", marginBottom: 24 }}>
          {error}
        </div>
      )}

      {!loading && disputes.length === 0 && (
        <div className="glass-card" style={{ textAlign: "center", padding: "80px 20px", borderRadius: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: "var(--muted)" }}>⚖️</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 18, color: "var(--text)" }}>Hali nizolar yo'q</h3>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>Platformadagi barcha shartnomalaringiz muammosiz davom etmoqda.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {disputes.map((d, idx) => {
          const st = statusColors[d.status] || statusColors.open;
          return (
            <div
              key={d.id}
              onClick={() => navigate(`/disputes/${d.id}`)}
              className="glass-card stagger-entry"
              style={{
                padding: "24px 30px",
                cursor: "pointer",
                transition: "all 0.3s var(--transition)",
                animationDelay: `${idx * 0.05}s`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "var(--brand)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--glass-border)";
                e.currentTarget.style.boxShadow = "var(--glass-shadow)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: d.status === "resolved" ? "rgba(16, 185, 129, 0.1)" : "rgba(37, 99, 235, 0.1)",
                    color: d.status === "resolved" ? "#10b981" : "var(--brand)",
                    display: "flex", alignItems: "center", justifyCentent: "center", alignSelf: "center",
                    padding: 8, flexShrink: 0
                  }}>
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>
                      {d.reason?.slice(0, 70) || `Nizo #${d.id}`}
                      {d.reason?.length > 70 ? "..." : ""}
                    </h3>
                    <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 13, color: "var(--muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={13} />
                        {d.created_at && new Date(d.created_at).toLocaleDateString()}
                      </span>
                      {d.amount && (
                        <span>
                          Suma: <strong>{Number(d.amount).toLocaleString()} {d.currency || "UZS"}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{
                    fontSize: 12, padding: "4px 14px", borderRadius: 20, fontWeight: 800,
                    background: st.bg, color: st.color
                  }}>
                    {st.label}
                  </span>
                  <ArrowRight size={18} style={{ color: "var(--muted)" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
