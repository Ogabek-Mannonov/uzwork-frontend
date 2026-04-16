import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../../../api/jobs";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function JobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getJobs({ page, search: debouncedSearch, limit: 10 });
        if (res?.success === false) {
          setError(res?.message || "Ishlarni yuklashda xato");
        } else {
          // Backend response structure: { success: true, data: { projects: [...], pagination: {...} } }
          const projects = res?.data?.projects || [];
          const pagination = res?.data?.pagination || {};
          
          setJobs(projects);
          setTotalPages(pagination.totalPages || 1);
        }
      } catch (err) {
        setError("Kutilmagan xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [page, debouncedSearch]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Barcha Ishlar</h1>
        {loading && <div className="spinner-small" style={{ width: 20, height: 20, border: '2px solid #14a800', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Ish qidiring (masalan: React, Node.js...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "12px 16px 12px 40px", borderRadius: 10,
            border: "2px solid #e0e0e0", fontSize: 15,
            boxSizing: "border-box", outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#14a800'}
          onBlur={e => e.target.style.borderColor = '#e0e0e0'}
        />
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
          🔍
        </span>
      </div>

      {error && (
        <div style={{ padding: 16, background: '#fff0f0', color: '#d32f2f', borderRadius: 8, textAlign: 'center', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div style={{ textAlign: "center", padding: '40px 0', color: "#999" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
          <p>Ishlar topilmadi. Boshqa kalit so'z bilan qidirib ko'ring.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => navigate(`/jobs/${job.id}`)}
            style={{
              border: "1px solid #e0e0e0", borderRadius: 12, padding: "20px 24px",
              cursor: "pointer", background: "#fff",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#14a800", marginBottom: 6, marginTop: 0 }}>
                {job.title}
              </h2>
              <span style={{
                fontSize: 13, fontWeight: 700, color: "#14a800",
                background: "#e6f7e6", padding: "4px 12px", borderRadius: 20,
                whiteSpace: 'nowrap'
              }}>
                {job.job_type === "hourly"
                  ? `$${job.budget_min || 0}–$${job.budget_max || 0}/hr`
                  : `$${job.budget_min || job.budget_max || 'Kelishiladi'}`}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 10 }}>
              {job.description?.slice(0, 180)}{job.description?.length > 180 ? "..." : ""}
            </p>
            
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {Array.isArray(job.required_skills) && job.required_skills.slice(0, 5).map((skill, i) => (
                <span key={i} style={{
                  fontSize: 12, padding: "3px 10px", borderRadius: 20,
                  background: "#f0f0f0", color: "#444", fontWeight: 600
                }}>{skill}</span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 12, color: "#999" }}>
              <div>
                {job.experience_level && <span>Tajriba: {job.experience_level} • </span>}
                {job.category && <span>{job.category} • </span>}
                {job.proposals_count !== undefined && <span>Takliflar: {job.proposals_count}</span>}
              </div>
              <span>{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {!loading && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', gap: 16, marginTop: 40 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "10px 24px", borderRadius: 25, border: "1px solid #e0e0e0",
              background: page === 1 ? "#f5f5f5" : "#fff", 
              cursor: page === 1 ? "not-allowed" : "pointer",
              fontWeight: 600, color: page === 1 ? '#ccc' : '#444',
              transition: 'all 0.2s'
            }}
          >← Oldingi</button>
          
          <span style={{ fontSize: 14, fontWeight: 700, color: '#666' }}>
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: "10px 24px", borderRadius: 25, border: "1px solid #e0e0e0",
              background: page === totalPages ? "#f5f5f5" : "#fff",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              fontWeight: 600, color: page === totalPages ? '#ccc' : '#444',
              transition: 'all 0.2s'
            }}
          >Keyingi →</button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
