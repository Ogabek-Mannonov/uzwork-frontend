import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById, saveJob } from "../../../api/jobs";
import { createProposal } from "../../../api/proposals";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposal, setProposal] = useState({ cover_letter: "", proposed_price: "", proposed_duration: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await getJobById(id);
      if (res?.success === false) setError(res?.message || "Xato");
      else setJob(res?.data || res);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleSave = async () => {
    const res = await saveJob(id);
    setSaved(s => !s);
    setToast(res?.message || (saved ? "Saqlashdan olib tashlandi" : "Saqlandi!"));
    setTimeout(() => setToast(""), 3000);
  };

  const handleSubmitProposal = async () => {
    if (!proposal.cover_letter || !proposal.proposed_price) {
      setToast("Barcha maydonlarni to'ldiring!"); setTimeout(() => setToast(""), 3000); return;
    }
    setSubmitting(true);
    const res = await createProposal({ project_id: id, ...proposal });
    setSubmitting(false);
    if (res?.success === false) {
      setToast(res?.message || "Xato yuz berdi");
    } else {
      setToast("Taklifingiz yuborildi! ✅");
      setProposalOpen(false);
      setProposal({ cover_letter: "", proposed_price: "", proposed_duration: "" });
    }
    setTimeout(() => setToast(""), 4000);
  };

  if (loading) return <p style={{ textAlign: "center", padding: 60 }}>Yuklanmoqda...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red", padding: 60 }}>{error}</p>;
  if (!job) return null;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, background: "#14a800",
          color: "#fff", padding: "12px 20px", borderRadius: 8, fontWeight: 600,
          zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
        }}>{toast}</div>
      )}

      <button onClick={() => navigate("/jobs")} style={{ marginBottom: 20, background: "none", border: "none", color: "#14a800", cursor: "pointer", fontWeight: 600 }}>
        ← Barcha ishlarga
      </button>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0e0e0", padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a" }}>{job.title}</h1>
          <span style={{
            fontSize: 18, fontWeight: 800, color: "#14a800",
            background: "#e6f7e6", padding: "6px 16px", borderRadius: 20
          }}>
            {job.budget_type === "hourly"
              ? `$${job.hourly_rate_min}–$${job.hourly_rate_max}/soat`
              : job.budget_amount ? `$${job.budget_amount}` : "Kelishiladi"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          {job.category && <span style={{ fontSize: 12, padding: "3px 10px", background: "#e8f4fd", color: "#2563eb", borderRadius: 20, fontWeight: 600 }}>{job.category}</span>}
          {job.experience_level && <span style={{ fontSize: 12, padding: "3px 10px", background: "#fff3e0", color: "#f57c00", borderRadius: 20, fontWeight: 600 }}>{job.experience_level}</span>}
          {job.status && <span style={{ fontSize: 12, padding: "3px 10px", background: "#e6f7e6", color: "#14a800", borderRadius: 20, fontWeight: 600 }}>{job.status}</span>}
        </div>

        <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #f0f0f0" }} />

        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Tavsif</h3>
        <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{job.description}</p>

        {job.skills?.length > 0 && (
          <>
            <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #f0f0f0" }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Kerakli ko'nikmalar</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {job.skills.map((sk, i) => (
                <span key={i} style={{ fontSize: 13, padding: "4px 12px", background: "#f0f0f0", borderRadius: 20, fontWeight: 600 }}>{sk}</span>
              ))}
            </div>
          </>
        )}

        <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #f0f0f0" }} />
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setProposalOpen(true)}
            style={{
              padding: "10px 28px", background: "#14a800", color: "#fff",
              border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14
            }}
          >Taklif yuborish</button>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px", background: saved ? "#e6f7e6" : "#f5f5f5",
              color: saved ? "#14a800" : "#444",
              border: `1px solid ${saved ? "#14a800" : "#e0e0e0"}`,
              borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14
            }}
          >{saved ? "❤️ Saqlangan" : "🤍 Saqlash"}</button>
        </div>
      </div>

      {/* Proposal modal */}
      {proposalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: "100%", maxWidth: 500 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Taklif yuborish</h2>
            <textarea
              placeholder="Qoplov xat (cover letter)..."
              value={proposal.cover_letter}
              onChange={e => setProposal(p => ({ ...p, cover_letter: e.target.value }))}
              rows={5}
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 14, marginBottom: 12, boxSizing: "border-box", resize: "vertical" }}
            />
            <input
              type="number"
              placeholder="Taklif narx ($)"
              value={proposal.proposed_price}
              onChange={e => setProposal(p => ({ ...p, proposed_price: e.target.value }))}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
            />
            <input
              type="text"
              placeholder="Muddat (masalan: 2 hafta)"
              value={proposal.proposed_duration}
              onChange={e => setProposal(p => ({ ...p, proposed_duration: e.target.value }))}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 14, marginBottom: 20, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleSubmitProposal}
                disabled={submitting}
                style={{ flex: 1, padding: 12, background: "#14a800", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
              >{submitting ? "Yuborilmoqda..." : "Yuborish"}</button>
              <button
                onClick={() => setProposalOpen(false)}
                style={{ flex: 1, padding: 12, background: "#f5f5f5", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
              >Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
