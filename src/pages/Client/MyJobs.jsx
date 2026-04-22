import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase, Eye, Edit, Trash2, Copy, Users,
  Clock, DollarSign, Search, X,
  CheckCircle, Archive, Plus, MoreHorizontal,
  Info
} from "lucide-react";
import { 
  getMyJobs, 
  deleteJob as apiDeleteJob, 
  updateJob as apiUpdateJob,
  createJob as apiCreateJob
} from "../../api/jobs";
import { useThemeContext } from "../components/Theme/ThemeContext";
import "../Client/css/myjobs.css";

const MyJobs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useThemeContext();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // For Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    drafts: 0,
    closed: 0
  });

  const fetchJobs = useCallback(async (currentSearch = searchTerm, isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    else setLoading(true);

    try {
      let statusParam = null;
      if (activeTab === "active") statusParam = "open";
      else if (activeTab === "drafts") statusParam = "draft";
      else if (activeTab === "closed") statusParam = "completed";

      const response = await getMyJobs({ 
        status: statusParam,
        search: currentSearch,
        limit: 100 
      });
      
      const allJobs = response?.data?.projects || response?.data || [];
      setJobs(allJobs);

      // If initial fetch, calculate stats for all jobs
      if (isInitial || activeTab === "all") {
        const totalCount = allJobs.length;
        const activeCount = allJobs.filter(j => j.status === "active" || j.status === "open").length;
        const draftsCount = allJobs.filter(j => j.status === "draft").length;
        const closedCount = allJobs.filter(j => j.status === "closed" || j.status === "completed").length;
        
        setStats({
          total: totalCount,
          active: activeCount,
          drafts: draftsCount,
          closed: closedCount
        });
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(searchTerm);
    }, activeTab === "all" && searchTerm === "" ? 0 : 300);
    
    return () => clearTimeout(timer);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    fetchJobs("", true);
  }, []);

  const handleDeleteJob = async (jobId) => {
    setActionLoading(true);
    try {
      const res = await apiDeleteJob(jobId);
      if (res?.success !== false) {
        setJobs(jobs.filter(job => job.id !== jobId));
        setShowDeleteModal(null);
        fetchJobs("", true); // Update stats
      } else {
        alert(res?.message || t('common.errorDelete'));
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicateJob = async (job) => {
    setActionLoading(true);
    try {
      const payload = {
        title: `${job.title} (Copy)`,
        description: job.description,
        category: job.category,
        required_skills: job.required_skills,
        experience_level: job.experience_level,
        budget_type: job.budget_type,
        budget_min: job.budget_min,
        budget_max: job.budget_max,
        currency: job.currency,
        duration: job.duration,
        scope: job.scope,
        visibility: job.visibility,
        freelancers_needed: job.freelancers_needed,
        status: "draft"
      };
      const res = await apiCreateJob(payload);
      if (res?.success !== false) {
        fetchJobs("", true);
      } else {
        alert(res?.message || t('common.errorCopy'));
      }
    } catch (error) {
      console.error("Error duplicating job:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await apiUpdateJob(jobId, { status: newStatus });
      if (res?.success !== false) {
        fetchJobs("", true);
        setShowStatusModal(null);
      } else {
        alert(res?.message || t('common.errorStatusUpdate'));
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: "all", label: t('myJobs.tabs.all'), icon: <Briefcase size={16} />, count: stats.total },
    { id: "active", label: t('myJobs.tabs.active'), icon: <CheckCircle size={16} />, count: stats.active },
    { id: "drafts", label: t('myJobs.tabs.drafts'), icon: <Edit size={16} />, count: stats.drafts },
    { id: "closed", label: t('myJobs.tabs.closed'), icon: <Archive size={16} />, count: stats.closed }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case "active":
      case "open":
        return <span className="mj-status-badge mj-active">{t('myJobs.status.active')}</span>;
      case "draft":
        return <span className="mj-status-badge mj-draft">{t('myJobs.status.draft')}</span>;
      case "closed":
      case "completed":
        return <span className="mj-status-badge mj-closed">{t('myJobs.status.closed')}</span>;
      case "in_progress":
        return <span className="mj-status-badge mj-info">{t('myJobs.status.in_progress')}</span>;
      default:
        return <span className="mj-status-badge">{status}</span>;
    }
  };

  if (initialLoading) {
    return (
      <div className={`mj-page ${isDark ? "mj-dark" : ""}`}>
        <div className="mj-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div className="mj-spinner"></div>
          <p style={{ marginTop: '20px', color: isDark ? '#94a3b8' : '#64748b' }}>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mj-page ${isDark ? "mj-dark" : ""}`}>
      <div className="mj-container">
        {/* Header */}
        <div className="mj-header">
          <div className="mj-header-info">
            <h1>{t('myJobs.title')}</h1>
            <p>{t('myJobs.subtitle')}</p>
          </div>
          <button className="mj-post-btn" onClick={() => navigate("/client/postjob")}>
            <Plus size={20} /> {t('myJobs.create')}
          </button>
        </div>

        {/* Stats Section */}
        <div className="mj-stats">
          <div className="mj-stat-card" onClick={() => setActiveTab("all")}>
            <div className="mj-stat-icon total">
              <Briefcase size={20} />
            </div>
            <div className="mj-stat-details">
              <span className="mj-stat-value">{stats.total}</span>
              <span className="mj-stat-label">{t('myJobs.stats.total')}</span>
            </div>
          </div>
          <div className="mj-stat-card" onClick={() => setActiveTab("active")}>
            <div className="mj-stat-icon active">
              <CheckCircle size={20} />
            </div>
            <div className="mj-stat-details">
              <span className="mj-stat-value">{stats.active}</span>
              <span className="mj-stat-label">{t('myJobs.stats.active')}</span>
            </div>
          </div>
          <div className="mj-stat-card" onClick={() => setActiveTab("drafts")}>
            <div className="mj-stat-icon drafts">
              <Edit size={20} />
            </div>
            <div className="mj-stat-details">
              <span className="mj-stat-value">{stats.drafts}</span>
              <span className="mj-stat-label">{t('myJobs.stats.drafts')}</span>
            </div>
          </div>
          <div className="mj-stat-card" onClick={() => setActiveTab("closed")}>
            <div className="mj-stat-icon closed">
              <Archive size={20} />
            </div>
            <div className="mj-stat-details">
              <span className="mj-stat-value">{stats.closed}</span>
              <span className="mj-stat-label">{t('myJobs.stats.closed')}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mj-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`mj-tab-btn ${activeTab === tab.id ? "mj-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="mj-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mj-search">
          <div className="mj-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder={t('myJobs.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="mj-search-clear" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSearchTerm("")}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Jobs List */}
        <div className="mj-list">
          {jobs.length === 0 ? (
            <div className="mj-empty" style={{ textAlign: 'center', padding: '60px 20px', background: isDark ? 'rgba(255,255,255,0.02)' : '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <Briefcase size={48} strokeWidth={1} style={{ marginBottom: '20px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '20px', marginBottom: '8px', color: isDark ? '#fff' : '#1e293b' }}>{t('myJobs.empty.title')}</h3>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>{t('myJobs.empty.desc')}</p>
              <button className="mj-post-btn" style={{ margin: '0 auto' }} onClick={() => navigate("/client/postjob")}>
                <Plus size={16} /> {t('myJobs.empty.btn')}
              </button>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="mj-card">
                <div className="mj-card-header">
                  <div className="mj-title-section">
                    <h3>{job.title}</h3>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="mj-card-actions">
                    <button className="mj-action-btn" title="Ko'rish" onClick={() => navigate(`/client/landing/${job.id}`)}>
                      <Eye size={18} />
                    </button>
                    <button className="mj-action-btn" title="Tahrirlash" onClick={() => navigate(`/client/edit-job/${job.id}`)}>
                      <Edit size={18} />
                    </button>
                    <button className="mj-action-btn" title="Nusxalash" onClick={() => handleDuplicateJob(job)}>
                      <Copy size={18} />
                    </button>
                    {job.status === "draft" && (
                      <button className="mj-action-btn mj-danger" title="O'chirish" onClick={() => setShowDeleteModal(job)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button className="mj-action-btn" title="Batafsil" onClick={() => setShowStatusModal(job)}>
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="mj-card-details">
                  <div className="mj-detail-item">
                    <DollarSign size={16} />
                    <span>{job.budget_max ? `$${job.budget_max}` : (job.budget_min ? `$${job.budget_min}` : t('myJobs.negotiable'))}</span>
                  </div>
                  <div className="mj-detail-item">
                    <Users size={16} />
                    <span>{job.proposals_count || 0} {t('myJobs.card.proposals')}</span>
                  </div>
                  <div className="mj-detail-item">
                    <Clock size={16} />
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mj-skills">
                  {job.required_skills?.slice(0, 6).map(skill => (
                    <span key={skill} className="mj-skill-tag">{skill}</span>
                  ))}
                  {job.required_skills?.length > 6 && (
                    <span className="mj-skill-tag" style={{ border: 'none', padding: '4px 0' }}>+{job.required_skills.length - 6}</span>
                  )}
                </div>
                
                <div className="mj-card-footer">
                  {(job.status === "active" || job.status === "open") && (
                    <>
                      <button 
                        className="mj-footer-btn mj-primary"
                        onClick={() => navigate(`/client/proposals?jobId=${job.id}`)}
                      >
                        <Users size={18} /> {t('myJobs.card.manageProposals')} ({job.proposals_count || 0})
                      </button>
                      <button 
                        className="mj-footer-btn mj-outline"
                        onClick={() => navigate(`/client/talent?jobId=${job.id}`)}
                      >
                        <Plus size={18} /> {t('myJobs.card.invite')}
                      </button>
                    </>
                  )}
                  {job.status === "draft" && (
                    <>
                      <button className="mj-footer-btn mj-primary" onClick={() => navigate(`/client/edit-job/${job.id}`)}>
                        <Edit size={18} /> {t('myJobs.card.edit')}
                      </button>
                      <button className="mj-footer-btn mj-outline" onClick={() => navigate(`/client/landing/${job.id}`)}>
                        <Eye size={18} /> {t('myJobs.card.view')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="mj-modal-overlay" onClick={() => setShowDeleteModal(null)}>
            <div className="mj-modal-content" onClick={e => e.stopPropagation()}>
              <div className="mj-modal-icon mj-danger">
                <Trash2 size={32} />
              </div>
              <h3 style={{ textAlign: 'center', marginBottom: '12px' }}>{t('myJobs.deleteConfirmTitle')}</h3>
              <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>{t('myJobs.deleteConfirmDesc', { title: showDeleteModal.title })}</p>
              <div className="mj-modal-actions">
                <button className="mj-btn-cancel" onClick={() => setShowDeleteModal(null)} disabled={actionLoading}>{t('myJobs.actions.cancel')}</button>
                <button className="mj-btn-danger" onClick={() => handleDeleteJob(showDeleteModal.id)} disabled={actionLoading}>
                  {actionLoading ? t('myJobs.actions.deleting') : t('myJobs.actions.delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Modal */}
        {showStatusModal && (
          <div className="mj-modal-overlay" onClick={() => setShowStatusModal(null)}>
            <div className="mj-modal-content" onClick={e => e.stopPropagation()}>
              <div className="mj-modal-icon" style={{ background: isDark ? 'rgba(79,70,229,0.1)' : '#f5f3ff', color: '#4f46e5' }}>
                <Info size={32} />
              </div>
              <h3 style={{ textAlign: 'center', marginBottom: '12px' }}>{t('myJobs.statusModalTitle')}</h3>
              <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>{t('myJobs.statusModalDesc', { title: showStatusModal.title })}</p>
              <div className="mj-status-options">
                <button className="mj-status-option" onClick={() => handleStatusChange(showStatusModal.id, "active")}>
                  <CheckCircle size={18} /> {t('myJobs.actions.makeActive')}
                </button>
                <button className="mj-status-option" onClick={() => handleStatusChange(showStatusModal.id, "draft")}>
                  <Edit size={18} /> {t('myJobs.actions.makeDraft')}
                </button>
                <button className="mj-status-option" onClick={() => handleStatusChange(showStatusModal.id, "closed")}>
                  <Archive size={18} /> {t('myJobs.actions.close')}
                </button>
              </div>
              <button className="mj-btn-cancel" style={{ width: '100%', marginTop: '12px', padding: '12px' }} onClick={() => setShowStatusModal(null)} disabled={actionLoading}>{t('myJobs.actions.close')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;