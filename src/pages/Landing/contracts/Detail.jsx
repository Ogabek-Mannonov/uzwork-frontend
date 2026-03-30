import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContractById, completeContract, cancelContract } from "../../../api/contracts";

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  const load = async () => {
    setLoading(true);
    const res = await getContractById(id);
    setContract(res?.data || res);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleComplete = async () => {
    if (!confirm("Kontraktni yakunlashni tasdiqlaysizmi?")) return;
    setActionLoading(true);
    const res = await completeContract(id);
    setActionLoading(false);
    if (res?.success === false) notify(res?.message || "Xato", "error");
    else { notify("Kontrakt yakunlandi! ✅"); load(); }
  };

  const handleCancel = async () => {
    if (!confirm("Kontraktni bekor qilishni tasdiqlaysizmi?")) return;
    setActionLoading(true);
    const res = await cancelContract(id);
    setActionLoading(false);
    if (res?.success === false) notify(res?.message || "Xato", "error");
    else { notify("Kontrakt bekor qilindi"); load(); }
  };

  if (loading) return <p style={{ textAlign: "center", padding: 60 }}>Yuklanmoqda...</p>;
  if (!contract) return <p style={{ textAlign: "center", padding: 60, color: "red" }}>Kontrakt topilmadi</p>;

  const statusColors = {
    active:    { bg: "#e6f7e6", color: "#14a800", label: "Faol" },
    completed: { bg: "#e8f4fd", color: "#2563eb", label: "Yakunlangan" },
    cancelled: { bg: "#ffeef0", color: "#dc2626", label: "Bekor qilingan" },
    disputed:  { bg: "#fff3e0", color: "#f57c00", label: "Nizo" },
  };
  const st = statusColors[contract.status] || statusColors.active;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 16px" }}>
      {toast.msg && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: toast.type === "error" ? "#dc2626" : "#14a800",
          color: "#fff", padding: "12px 20px", borderRadius: 8, fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
        }}>{toast.msg}</div>
      )}

      <button onClick={() => navigate("/contracts")} style={{ background: "none", border: "none", color: "#14a800", cursor: "pointer", fontWeight: 600, marginBottom: 20 }}>
        ← Kontraktlarga
      </button>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0e0e0", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>
            {contract.project_title || `Kontrakt #${contract.id}`}
          </h1>
          <span style={{ fontSize: 13, padding: "4px 14px", borderRadius: 20, fontWeight: 700, background: st.bg, color: st.color }}>
            {st.label}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Umumiy narx", value: contract.total_amount ? `$${contract.total_amount}` : "—" },
            { label: "Freelancer", value: contract.freelancer_name || "—" },
            { label: "Mijoz", value: contract.client_name || "—" },
            { label: "Boshlangan", value: contract.start_date ? new Date(contract.start_date).toLocaleDateString() : "—" },
            { label: "Tugash muddati", value: contract.end_date ? new Date(contract.end_date).toLocaleDateString() : "—" },
          ].map(r => (
            <div key={r.label} style={{ background: "#f9f9f9", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{r.value}</div>
            </div>
          ))}
        </div>

        {contract.description && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Tavsif</div>
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>{contract.description}</p>
          </div>
        )}

        {contract.status === "active" && (
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              style={{ padding: "10px 24px", background: "#14a800", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
            >✅ Yakunlash</button>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              style={{ padding: "10px 24px", background: "#ffeef0", color: "#dc2626", border: "1px solid #dc2626", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
            >❌ Bekor qilish</button>
          </div>
        )}
      </div>
    </div>
  );
}
