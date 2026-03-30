import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../../../api/jobs";

export default function JobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const res = await getJobs({ page, search });
      if (res?.success === false) {
        setError(res?.message || "Ishlarni yuklashda xato");
      } else {
        setJobs(res?.data || res?.jobs || res || []);
      }
      setLoading(false);
    };
    fetchJobs();
  }, [page, search]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Barcha Ishlar</h1>

      <input
        type="text"
        placeholder="Ish qidiring..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        style={{
          width: "100%", padding: "10px 16px", borderRadius: 8,
          border: "1px solid #e0e0e0", fontSize: 14, marginBottom: 24,
          boxSizing: "border-box"
        }}
      />

      {loading && <p style={{ textAlign: "center", color: "#666" }}>Yuklanmoqda...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <p style={{ textAlign: "center", color: "#999" }}>Ishlar topilmadi</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => navigate(`/jobs/${job.id}`)}
            style={{
              border: "1px solid #e0e0e0", borderRadius: 12, padding: "20px 24px",
              cursor: "pointer", background: "#fff",
              transition: "box-shadow 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#14a800", marginBottom: 6 }}>
                {job.title}
              </h2>
              <span style={{
                fontSize: 13, fontWeight: 700, color: "#14a800",
                background: "#e6f7e6", padding: "4px 10px", borderRadius: 20
              }}>
                {job.budget_type === "hourly"
                  ? `$${job.hourly_rate_min}–$${job.hourly_rate_max}/hr`
                  : job.budget_amount ? `$${job.budget_amount}` : "Kelishiladi"}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 10 }}>
              {job.description?.slice(0, 180)}{job.description?.length > 180 ? "..." : ""}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {job.skills?.slice(0, 5).map((skill, i) => (
                <span key={i} style={{
                  fontSize: 12, padding: "3px 10px", borderRadius: 20,
                  background: "#f0f0f0", color: "#444", fontWeight: 600
                }}>{skill}</span>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#999" }}>
              {job.experience_level && <span>Tajriba: {job.experience_level} • </span>}
              {job.category && <span>{job.category} • </span>}
              {job.created_at && <span>{new Date(job.created_at).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </div>

      {jobs.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 32 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "1px solid #e0e0e0",
              background: page === 1 ? "#f5f5f5" : "#fff", cursor: page === 1 ? "not-allowed" : "pointer"
            }}
          >← Oldingi</button>
          <span style={{ display: "flex", alignItems: "center", fontWeight: 700 }}>
            {page}-sahifa
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "1px solid #e0e0e0",
              background: "#fff", cursor: "pointer"
            }}
          >Keyingi →</button>
        </div>
      )}
    </div>
  );
}
