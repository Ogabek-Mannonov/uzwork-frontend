import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createProposal } from "../../../api/proposals";
import { getJobById } from "../../../api/jobs";

export default function Proposal() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ cover_letter: "", proposed_price: "", proposed_duration: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  useEffect(() => {
    if (jobId) {
      getJobById(jobId).then(res => {
        setJob(res?.data || res);
      });
    }
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cover_letter.trim()) { notify("Qoplov xat yozing!", "error"); return; }
    if (!form.proposed_price) { notify("Narx kiriting!", "error"); return; }
    setLoading(true);
    const res = await createProposal({ project_id: jobId, ...form });
    setLoading(false);
    if (res?.success === false) {
      notify(res?.message || "Xato yuz berdi", "error");
    } else {
      notify("Taklifingiz muvaffaqiyatli yuborildi! ✅");
      setTimeout(() => navigate("/my-proposals"), 1500);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
      {toast.msg && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: toast.type === "error" ? "#dc2626" : "#14a800",
          color: "#fff", padding: "12px 20px", borderRadius: 8, fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
        }}>{toast.msg}</div>
      )}

      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#14a800", cursor: "pointer", fontWeight: 600, marginBottom: 20 }}>
        ← Orqaga
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Taklif yuborish</h1>
      {job && (
        <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
          Ish: <strong style={{ color: "#14a800" }}>{job.title}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0e0e0", padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#333" }}>
            Qoplov xat (Cover Letter) *
          </label>
          <textarea
            value={form.cover_letter}
            onChange={e => setForm(p => ({ ...p, cover_letter: e.target.value }))}
            placeholder="O'z tajribangiz va bu ishni qanday bajarishingiz haqida yozing..."
            rows={7}
            style={{
              width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e0e0e0",
              fontSize: 14, lineHeight: 1.6, boxSizing: "border-box", resize: "vertical"
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#333" }}>
            Taklif narxi ($) *
          </label>
          <input
            type="number"
            value={form.proposed_price}
            onChange={e => setForm(p => ({ ...p, proposed_price: e.target.value }))}
            placeholder="Masalan: 500"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 14, boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#333" }}>
            Bajarish muddati
          </label>
          <input
            type="text"
            value={form.proposed_duration}
            onChange={e => setForm(p => ({ ...p, proposed_duration: e.target.value }))}
            placeholder="Masalan: 2 hafta, 1 oy"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 14, boxSizing: "border-box" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: 14, background: loading ? "#ccc" : "#14a800",
            color: "#fff", border: "none", borderRadius: 8, fontWeight: 700,
            fontSize: 15, cursor: loading ? "not-allowed" : "pointer"
          }}
        >{loading ? "Yuborilmoqda..." : "Taklif yuborish"}</button>
      </form>
    </div>
  );
}
