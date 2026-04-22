import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  Mail, 
  MessageSquare, 
  User,
  ArrowUpRight,
  TrendingUp,
  Archive,
  Search
} from "lucide-react";
import { getMyProposals } from "../../../api/proposals";
import { getJobById } from "../../../api/jobs";
import JobDetailsDrawer from "../../components/JobDetailsDrawer";
import ProposalDetailsDrawer from "../../components/ProposalDetailsDrawer";
import "./MyProposals.css";

const STATUS_MAP = {
  pending:   { key: "pending",   color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
  accepted:  { key: "accepted",  color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
  rejected:  { key: "rejected",  color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)" },
  withdrawn: { key: "withdrawn", color: "#64748b", bg: "rgba(100, 116, 139, 0.15)" },
  invited:   { key: "invited",   color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" },
  shortlisted:{ key: "shortlisted",color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)" }
};

export default function MyProposals() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // Data states
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("applications");

  // Drawer states
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isJobDrawerOpen, setIsJobDrawerOpen] = useState(false);
  const [isProposalDrawerOpen, setIsProposalDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true);
      try {
        const res = await getMyProposals();
        if (res?.success) {
          setProposals(res.data?.proposals || res.proposals || res.data || []);
        } else {
          setError(res?.message || t("myProposals.errors.loading"));
        }
      } catch (err) {
        setError(t("myProposals.errors.server"));
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [t]);

  const handleOpenJobDrawer = async (jobId) => {
    try {
      const res = await getJobById(jobId);
      if (res?.success) {
        setSelectedJob(res.data.project || res.data);
        setIsJobDrawerOpen(true);
      }
    } catch (e) {
      console.error("Error fetching job:", e);
    }
  };

  const handleOpenProposalDrawer = (proposal) => {
    setSelectedProposal(proposal);
    setIsProposalDrawerOpen(true);
  };

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
        <h1 className="fprop-title">{t("myProposals.title")}</h1>
        <p className="fprop-subtitle">{t("myProposals.subtitle")}</p>
      </header>

      <div className="fprop-tabs-wrap">
        <button 
          className={`fprop-tab ${activeTab === "applications" ? "active" : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          <Briefcase size={18} />
          {t("myProposals.tabs.applications")} <span className="fprop-tab-count">{counts.applications}</span>
        </button>
        <button 
          className={`fprop-tab ${activeTab === "invitations" ? "active" : ""}`}
          onClick={() => setActiveTab("invitations")}
        >
          <Mail size={18} />
          {t("myProposals.tabs.invitations")} <span className="fprop-tab-count">{counts.invitations}</span>
        </button>
        <button 
          className={`fprop-tab ${activeTab === "archived" ? "active" : ""}`}
          onClick={() => setActiveTab("archived")}
        >
          <Archive size={18} />
          {t("myProposals.tabs.archived")} <span className="fprop-tab-count">{counts.archived}</span>
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
                    onClick={() => handleOpenJobDrawer(p.job_id || p.project_id)}
                  >
                    {p.job_title || `Loyiha #${p.id.slice(0,8)}`}
                  </h3>
                  
                  <div className="fprop-client-badge">
                    {p.client_avatar ? (
                      <img src={p.client_avatar} alt="" className="fprop-client-ava" />
                    ) : (
                      <div className="fprop-client-ava" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--fprop-surface-2)" }}>
                        <User size={12} color="var(--fprop-text-3)" />
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
                    {t(`myProposals.status.${STATUS_MAP[p.status]?.key}`) || p.status}
                  </span>
                </div>
              </div>

              <p className="fprop-cover-letter">
                {p.cover_letter || t("myProposals.noCoverLetter")}
              </p>

              <div className="fprop-footer">
                <div className="fprop-stats">
                  <div className="fprop-stat-item">
                    <span className="fprop-stat-label">{t("myProposals.stats.price")}</span>
                    <span className="fprop-stat-val price">
                      {p.proposed_price ? (
                        <>
                          {p.currency === 'UZS' ? `${Number(p.proposed_price).toLocaleString()} UZS` : (p.currency === 'RUB' ? `${p.proposed_price} ₽` : `$${p.proposed_price}`)}
                        </>
                      ) : t("myProposals.stats.negotiable")}
                    </span>
                  </div>
                  <div className="fprop-stat-item">
                    <span className="fprop-stat-label">{t("myProposals.stats.duration")}</span>
                    <span className="fprop-stat-val">
                      <Clock size={16} /> {p.proposed_duration ? `${p.proposed_duration} ${t("myProposals.stats.days")}` : t("myProposals.stats.agreement")}
                    </span>
                  </div>
                  <div className="fprop-stat-item">
                    <span className="fprop-stat-label">{t("myProposals.stats.date")}</span>
                    <span className="fprop-stat-val">
                      <Calendar size={16} /> {new Date(p.created_at).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : (i18n.language === 'ru' ? 'ru-RU' : 'en-US'))}
                    </span>
                  </div>
                </div>

                <div className="fprop-actions">
                  {activeTab === "archived" ? null : (
                    p.status === "invited" ? (
                      <button 
                        className="fprop-btn-wow primary"
                        onClick={() => handleOpenProposalDrawer(p)}
                      >
                        {t("myProposals.actions.viewProposal")} <ArrowUpRight size={18} />
                      </button>
                    ) : (
                      <button 
                        className="fprop-btn-wow secondary"
                        onClick={() => handleOpenProposalDrawer(p)}
                      >
                        {t("myProposals.actions.details")}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="fprop-empty-container">
            <span className="fprop-empty-art">✨</span>
            <h3>{t("myProposals.empty.title")}</h3>
            <p>{t("myProposals.empty.desc")}</p>
            {activeTab === "applications" && (
              <button 
                className="fprop-btn-wow primary" 
                style={{ margin: "2rem auto 0" }}
                onClick={() => navigate("/find-work")}
              >
                {t("myProposals.empty.button")} <Search size={18} style={{ marginLeft: 8 }} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* DRAWERS */}
      <JobDetailsDrawer 
        isOpen={isJobDrawerOpen}
        job={selectedJob}
        onClose={() => setIsJobDrawerOpen(false)}
      />

      <ProposalDetailsDrawer 
        isOpen={isProposalDrawerOpen}
        proposal={selectedProposal}
        onClose={() => setIsProposalDrawerOpen(false)}
      />
    </div>
  );
}
