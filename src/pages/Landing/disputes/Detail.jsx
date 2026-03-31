import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/auth";

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

  if (loading) return <p style={{ textAlign: "center", padding: 60 }}>Yuklanmoqda...</p>;
  if (!dispute) return <p style={{ textAlign: "center", padding: 60, color: "red" }}>Nizo topilmadi</p>;

  const statusColors = {
    open:     { bg: "#fff3e0", color: "#f57c00", label: "Ochiq" },
    resolved: { bg: "#e6f7e6", color: "#14a800", label: "Hal etilgan" },
    closed:   { bg: "#f5f5f5", color: "#999",    label: "Yopilgan" },
  };
  const st = statusColors[dispute.status] || statusColors.open;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
      <button onClick={() => navigate("/disputes")} style={{ background: "none", border: "none", color: "#14a800", cursor: "pointer", fontWeight: 600, marginBottom: 20 }}>
        ← Nizolarga
      </button>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0e0e0", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{dispute.title || `Nizo #${dispute.id}`}</h1>
          <span style={{ fontSize: 13, padding: "4px 14px", borderRadius: 20, fontWeight: 700, background: st.bg, color: st.color }}>
            {st.label}
          </span>
        </div>
        {dispute.description && (
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.7, marginBottom: 20 }}>{dispute.description}</p>
        )}
        <div style={{ fontSize: 13, color: "#aaa" }}>
          {dispute.created_at && `Yaratilgan: ${new Date(dispute.created_at).toLocaleDateString()}`}
        </div>
      </div>
    </div>
  );
}
