import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/auth";
import { 
  ArrowLeft, 
  Scale, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  ExternalLink, 
  ShieldAlert,
  DollarSign,
  UserCheck,
  CheckCircle2
} from "lucide-react";
import "./disputes.css";

export default function DisputeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/disputes/${id}`);
        setDispute(res?.data?.data || res?.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="disp-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <span className="disp-spinner" style={{ width: 36, height: 36, borderTopColor: "var(--brand)" }}></span>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="disp-container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <ShieldAlert size={60} style={{ color: "#ef4444", marginBottom: 20 }} />
        <h2>Nizo topilmadi</h2>
        <button onClick={() => navigate("/disputes")} className="disp-btn-outline" style={{ marginTop: 20 }}>
          Nizolar ro'yxatiga qaytish
        </button>
      </div>
    );
  }

  const statusColors = {
    open:     { bg: "rgba(245, 124, 0, 0.12)", color: "#f57c00", label: "Ochiq" },
    resolved: { bg: "rgba(16, 185, 129, 0.12)", color: "#10b981", label: "Hal etilgan" },
    closed:   { bg: "rgba(100, 116, 139, 0.12)", color: "#64748b", label: "Yopilgan" },
  };
  const st = statusColors[dispute.status] || statusColors.open;

  const getEvidenceFilename = (url) => {
    if (!url) return "hujjat";
    return url.split("/").pop() || "hujjat";
  };

  const getPayoutActionLabel = (action) => {
    switch (action) {
      case "refund_to_client": return "Mijozga to'liq qaytarish (Refund)";
      case "release_to_freelancer": return "Frilanserga to'liq o'tkazish (Release)";
      case "split": return "Mablag'ni bo'lish (Split)";
      case "no_action": return "Hech qanday harakat bajarilmadi";
      default: return action || "Aniqlanmagan";
    }
  };

  const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const getFileSrc = (url) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${BACKEND}${path}`;
  };

  return (
    <div className="disp-container soft-fade-in" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate("/disputes")} className="disp-back-btn">
          <ArrowLeft size={16} /> Nizolar ro'yxatiga
        </button>
      </div>

      <div className="disp-layout" style={{ gridTemplateColumns: "1fr" }}>
        <div className="disp-form-card glass-card" style={{ padding: "36px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(37, 99, 235, 0.1)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Scale size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 850, margin: 0, color: "var(--text)" }}>Nizo #{dispute.id}</h1>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>Loyiha bo'yicha kelishmovchilik</span>
              </div>
            </div>
            <span style={{ fontSize: 13, padding: "6px 16px", borderRadius: 20, fontWeight: 800, background: st.bg, color: st.color }}>
              {st.label}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              <span className="disp-info-label">Da'vo qilinayotgan summa</span>
              <div className="disp-info-value amount" style={{ fontSize: 20 }}>
                {dispute.amount ? `${Number(dispute.amount).toLocaleString()} ${dispute.currency || "UZS"}` : "Belgilanmagan"}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              <span className="disp-info-label">Yaratilgan sana</span>
              <div className="disp-info-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={16} style={{ color: "var(--brand)" }} />
                {dispute.created_at && new Date(dispute.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 className="disp-label" style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <FileText size={18} style={{ color: "var(--brand)" }} /> Kelishmovchilik sababi
            </h3>
            <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7, margin: 0, background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: 12, padding: 20 }}>
              {dispute.reason || dispute.description}
            </p>
          </div>

          {/* Evidence Files */}
          {dispute.evidence_files && dispute.evidence_files.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 className="disp-label" style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Paperclip size={18} style={{ color: "var(--brand)" }} /> Biriktirilgan dalillar (Fayllar)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {dispute.evidence_files.map((fileUrl, idx) => (
                  <a
                    key={idx}
                    href={getFileSrc(fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="disp-file-item"
                    style={{ textDecoration: "none", color: "inherit", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--brand)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--input-border)"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                      <FileText size={16} style={{ color: "var(--brand)", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", fontWeight: 600 }}>
                        {getEvidenceFilename(fileUrl)}
                      </span>
                    </div>
                    <ExternalLink size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Admin Resolution Section */}
          {dispute.status === "resolved" && (
            <div style={{
              background: "rgba(16, 185, 129, 0.05)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: 20,
              padding: 30,
              marginTop: 16
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#10b981", marginBottom: 16 }}>
                <CheckCircle2 size={24} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 850 }}>Admin qarori hal qilindi</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                  <div>
                    <span className="disp-info-label" style={{ color: "rgba(16,185,129,0.7)" }}>Moliyaviy Harakat</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                      {getPayoutActionLabel(dispute.payout_action)}
                    </div>
                  </div>
                  {dispute.payout_amount != null && (
                    <div>
                      <span className="disp-info-label" style={{ color: "rgba(16,185,129,0.7)" }}>O'tkazilgan Summa</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                        {Number(dispute.payout_amount).toLocaleString()} {dispute.payout_currency || dispute.currency || "UZS"}
                      </div>
                    </div>
                  )}
                </div>

                {dispute.admin_notes && (
                  <div style={{ borderTop: "1px solid rgba(16, 185, 129, 0.15)", paddingTop: 16 }}>
                    <span className="disp-info-label" style={{ color: "rgba(16,185,129,0.7)" }}>Admin izohi (Qaror asosi)</span>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, fontStyle: "italic" }}>
                      "{dispute.admin_notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
