import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  DollarSign, 
  Mail, 
  MessageSquare, 
  User,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Archive,
  ArrowRight,
  Search
} from "lucide-react";
import { getMyProposals } from "../../../api/proposals";
import "./MyProposals.css";

const STATUS_MAP = {
  pending:   { label: "Kutilmoqda",   color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
  accepted:  { label: "Qabul qilindi",color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
  rejected:  { label: "Rad etildi",   color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)" },
  withdrawn: { label: "Bekor qilindi",color: "#64748b", bg: "rgba(100, 116, 139, 0.15)" },
  invited:   { label: "Taklif oldingiz",color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" },
  shortlisted:{ label: "Saralandi",   color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)" }
};

export default function MyProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("applications");

  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true);
      try {
        const res = await getMyProposals();
        if (res?.success) {
          setProposals(res.data?.proposals || res.proposals || res.data || []);
        } else {
          setError(res?.message || "Takliflarni yuklashda xato yuz berdi.");
        }
      } catch (err) {
        setError("Server bilan bog'lanishda xato.");
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const filteredProposals = useMemo(() => {
    if (activeTab === "applications") {
      return proposals.filter(p => p.status !== "invited" && p.status !== "rejected" && p.status !== "withdrawn");
    }
    if (activeTab === "invitations") {
      return proposals.filter(p => p.status === "invited");
    }
    if (activeTab === "archived") {
      return proposals.filter(p => p.status === "rejected" || p.status === "withdrawn");
    }
    return proposals;
  }, [proposals, activeTab]);

  const counts = useMemo(() => ({
    applications: proposals.filter(p => p.status !== "invited" && p.status !== "rejected" && p.status !== "withdrawn").length,
    invitations: proposals.filter(p => p.status === "invited").length,
    archived: proposals.filter(p => p.status === "rejected" || p.status === "withdrawn").length,
  }), [proposals]);

  if (loading) {
    return (
      <div className="fprop-container">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fprop-container">
      <header className="fprop-header">
        <h1 className="fprop-title">Mening Takliflarim</h1>
        <p className="fprop-subtitle">Loyihalar bo'yicha yuborilgan arizalar va kelib tushgan takliflarni boshqarish</p>
      </header>

      <div className="fprop-tabs-wrap">
        <button 
          className={`fprop-tab ${activeTab === "applications" ? "active" : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          <Briefcase size={18} />
          Arizalarim <span className="fprop-tab-count">{counts.applications}</span>
        </button>
        <button 
          className={`fprop-tab ${activeTab === "invitations" ? "active" : ""}`}
          onClick={() => setActiveTab("invitations")}
        >
          <Mail size={18} />
          Taklifnomalar <span className="fprop-tab-count">{counts.invitations}</span>
        </button>
        <button 
          className={`fprop-tab ${activeTab === "archived" ? "active" : ""}`}
          onClick={() => setActiveTab("archived")}
        >
          <Archive size={18} />
          Arxiv <span className="fprop-tab-count">{counts.archived}</span>
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="fprop-list">
        {filteredProposals.length > 0 ? (
          filteredProposals.map((p) => (
            <div key={p.id} className={`fprop-card ${p.status === "invited" ? "invited" : ""}`}>
              <div className="fprop-card-main">
                <div className="fprop-job-info">
                  <h3 
                    className="fprop-job-title"
                    onClick={() => navigate(`/jobs/${p.job_id || p.project_id}`)}
                  >
                    {p.job_title || `Loyiha #${p.id.slice(0,8)}`}
                  </h3>
                  
                  <div className="fprop-client-badge">
                    {p.client_avatar ? (
                      <img src={p.client_avatar} alt="" className="fprop-client-ava" />
                    ) : (
                      <div className="fprop-client-ava" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#e2e8f0" }}>
                        <User size={14} />
                      </div>
                    )}
                    <span className="fprop-client-name">{p.client_first_name} {p.client_last_name}</span>
                  </div>
                </div>
                
                <div className="fprop-status-box">
                  <span 
                    className="fprop-status-tag" 
                    style={{ 
                      backgroundColor: STATUS_MAP[p.status]?.bg || "rgba(0,0,0,0.05)", 
                      color: STATUS_MAP[p.status]?.color || "#6b7280" 
                    }}
                  >
                    {p.status === "invited" && <TrendingUp size={12} style={{ marginRight: 6 }} />}
                    {STATUS_MAP[p.status]?.label || p.status}
                  </span>
                </div>
              </div>

              <p className="fprop-cover-letter">
                {p.cover_letter || "Qo'shimcha ma'lumot yo'q."}
              </p>

              <div className="fprop-footer">
                <div className="fprop-stats">
                  <div className="fprop-stat-item">
                    <span className="fprop-stat-label">Taklif narxi</span>
                    <span className="fprop-stat-val price">
                      <DollarSign size={16} /> {p.proposed_price || "Kelishiladi"}
                    </span>
                  </div>
                  <div className="fprop-stat-item">
                    <span className="fprop-stat-label">Muddat</span>
                    <span className="fprop-stat-val">
                      <Clock size={16} /> {p.proposed_duration ? `${p.proposed_duration} kun` : "Kelishuv"}
                    </span>
                  </div>
                  <div className="fprop-stat-item">
                    <span className="fprop-stat-label">Yuborilgan vaqt</span>
                    <span className="fprop-stat-val">
                      <Calendar size={16} /> {new Date(p.created_at).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>
                </div>

                <div className="fprop-actions">
                  {p.status === "invited" ? (
                    <button 
                      className="fprop-btn-wow primary"
                      onClick={() => navigate(`/jobs/${p.job_id || p.project_id}`)}
                    >
                      Taklifni ko'rish <ArrowUpRight size={18} />
                    </button>
                  ) : (
                    <>
                      <button 
                        className="fprop-btn-wow secondary"
                        onClick={() => navigate(`/jobs/${p.job_id || p.project_id}`)}
                      >
                        Tafsilotlar
                      </button>
                      <button 
                        className="fprop-btn-icon"
                        onClick={() => navigate(`/messages/${p.job_id || p.project_id}`)}
                        title="Xabar yozish"
                      >
                        <MessageSquare size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="fprop-empty-container">
            <span className="fprop-empty-art">✨</span>
            <h3>Hozircha hech narsa yo'q</h3>
            <p>Ushbu bo'limda bildirishnomalar mavjud emas. Yangi loyihalarni qidirib ko'ring!</p>
            {activeTab === "applications" && (
              <button 
                className="fprop-btn-wow primary" 
                style={{ margin: "2rem auto 0" }}
                onClick={() => navigate("/find-work")}
              >
                Yangi ish ochish <Search size={18} style={{ marginLeft: 8 }} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
