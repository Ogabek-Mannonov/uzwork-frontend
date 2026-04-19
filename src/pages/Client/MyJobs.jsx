import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Eye, Edit, Trash2, Copy, Users,
  Clock, DollarSign, Search, X,
  CheckCircle, Archive, Plus, MoreHorizontal,
  AlertCircle
} from "lucide-react";
import { 
  getMyJobs, 
  deleteJob as apiDeleteJob, 
  updateJob as apiUpdateJob,
  createJob as apiCreateJob
} from "../../api/jobs";
import { useThemeContext } from "../components/Theme/ThemeContext";
import "../Client/css/myjobs.css";

// Mock functions removed, using real API from ../../api/jobs

const MyJobs = () => {
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
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  // Combined fetch logic
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(searchTerm);
    }, activeTab === "all" && searchTerm === "" ? 0 : 300); // No delay for initial or tab switch
    
    return () => clearTimeout(timer);
  }, [activeTab, searchTerm]); // Removed fetchJobs from deps to avoid re-calls

  useEffect(() => {
    fetchJobs("", true); // Actual initial fetch
  }, []); // Only once on mount

  const handleDeleteJob = async (jobId) => {
    setActionLoading(true);
    try {
      const res = await apiDeleteJob(jobId);
      if (res?.success !== false) {
        setJobs(jobs.filter(job => job.id !== jobId));
        setShowDeleteModal(null);
      } else {
        alert(res?.message || "O'chirishda xato yuz berdi");
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
      // Prepare payload for a new job based on existing one
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
        fetchJobs(); // Refresh to see the new draft
      } else {
        alert(res?.message || "Nusxalashda xato yuz berdi");
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
        fetchJobs();
        setShowStatusModal(null);
      } else {
        alert(res?.message || "Holatni o'zgartirishda xato yuz berdi");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: "all", label: "Barcha joblar", icon: <Briefcase size={16} />, count: jobs.length },
    { id: "active", label: "Aktiv", icon: <CheckCircle size={16} />, count: jobs.filter(j => j.status === "active" || j.status === "open").length },
    { id: "drafts", label: "Qoralama", icon: <Edit size={16} />, count: jobs.filter(j => j.status === "draft").length },
    { id: "closed", label: "Yopiq", icon: <Archive size={16} />, count: jobs.filter(j => j.status === "closed" || j.status === "completed").length }
  ];

  // We now use server-side search, so filteredJobsBySearch is just jobs
  const filteredJobsBySearch = jobs;

  const getStatusBadge = (status) => {
    switch(status) {
      case "active":
      case "open":
        return <span className="mj-status-badge mj-active"><CheckCircle size={12} /> Aktiv</span>;
      case "draft":
        return <span className="mj-status-badge mj-draft"><Edit size={12} /> Qoralama</span>;
      case "closed":
      case "completed":
        return <span className="mj-status-badge mj-closed"><Archive size={12} /> Yopiq</span>;
      case "cancelled":
        return <span className="mj-status-badge mj-closed" style={{ background: "#fee2e2", color: "#ef4444" }}><Archive size={12} /> Bekor qilingan</span>;
      default:
        return <span className="mj-status-badge mj-draft">{status}</span>;
    }
  };

  if (initialLoading) {
    return (
      <div className="mj-loading">
        <div className="mj-spinner"></div>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className={`mj-page ${isDark ? "mj-dark" : ""}`} style={{
      backgroundColor: isDark ? "#0a0c10" : "#f4f6f9",
      minHeight: "100vh",
      transition: "all .3s ease"
    }}>
      <div className="mj-container">
        {/* Header */}
        <div className="mj-header">
          <div>
            <h1>Mening joblarim</h1>
            <p>Barcha e'lon qilgan joblaringizni boshqaring</p>
          </div>
          <button className="mj-post-btn" onClick={() => navigate("/client/postjob")}>
            <Plus size={18} /> Yangi job e'lon qilish
          </button>
        </div>

        {/* Tabs */}
        <div className="mj-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`mj-tab-btn ${activeTab === tab.id ? "mj-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
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
              placeholder="Job nomi yoki ko'nikmalar bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="mj-search-clear" onClick={() => setSearchTerm("")}>
                <X size={14} />
              </button>
            )}
          </div>
          {loading && !initialLoading && <div className="mj-search-loading">Yangilanmoqda...</div>}
        </div>

        {/* Jobs List */}
        <div className="mj-list">
          {filteredJobsBySearch.length === 0 ? (
            <div className="mj-empty">
              <Briefcase size={48} strokeWidth={1} />
              <h3>Hech qanday job topilmadi</h3>
              <p>Hali hech qanday job e'lon qilmagansiz</p>
              <button className="mj-btn-primary" onClick={() => navigate("/client/postjob")}>
                <Plus size={16} /> Birinchi jobni e'lon qilish
              </button>
            </div>
          ) : (
            filteredJobsBySearch.map(job => (
              <div key={job.id} className="mj-card">
                <div className="mj-card-header">
                  <div className="mj-title-section">
                    <h3>{job.title}</h3>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="mj-card-actions">
                    <button 
                      className="mj-action-btn"
                      onClick={() => navigate(`/client/landing/${job.id}`)}
                      title="Ko'rish"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="mj-action-btn"
                      onClick={() => navigate(`/client/edit-job/${job.id}`)}
                      title="Tahrirlash"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="mj-action-btn"
                      onClick={() => handleDuplicateJob(job)}
                      title="Nusxalash"
                    >
                      <Copy size={16} />
                    </button>
                    {job.status === "draft" && (
                      <button 
                        className="mj-action-btn mj-danger"
                        onClick={() => setShowDeleteModal(job)}
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button 
                      className="mj-action-btn"
                      onClick={() => setShowStatusModal(job)}
                      title="Holatni o'zgartirish"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mj-card-details">
                  <div className="mj-detail-item">
                    <DollarSign size={14} />
                    <span>{job.budget_max ? `$${job.budget_max}` : (job.budget_min ? `$${job.budget_min}` : "Kelishiladi")}</span>
                  </div>
                  <div className="mj-detail-item">
                    <Users size={14} />
                    <span>{job.proposals_count || 0} ta proposal</span>
                  </div>
                  <div className="mj-detail-item">
                    <Clock size={14} />
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mj-skills">
                  {job.required_skills?.slice(0, 5).map(skill => (
                    <span key={skill} className="mj-skill-tag">{skill}</span>
                  ))}
                  {job.required_skills?.length > 5 && (
                    <span className="mj-skill-tag mj-more">+{job.required_skills.length - 5}</span>
                  )}
                </div>
                
                <div className="mj-card-footer">
                  {job.status === "active" && (
                    <>
                      <button 
                        className="mj-footer-btn mj-primary"
                        onClick={() => navigate(`/client/job/${job.id}?tab=proposals`)} // Navigate to job proposals tab
                      >
                        <Users size={14} /> Proposals ({job.proposals_count || 0})
                      </button>
                      <button 
                        className="mj-footer-btn mj-outline"
                        onClick={() => navigate(`/client/invite/${job.id}`)}
                      >
                        <Plus size={14} /> Freelancer taklif qilish
                      </button>
                    </>
                  )}
                  {job.status === "draft" && (
                    <>
                      <button 
                        className="mj-footer-btn mj-primary"
                        onClick={() => navigate(`/client/edit-job/${job.id}`)}
                      >
                        <Edit size={14} /> To'ldirish
                      </button>
                      <button 
                        className="mj-footer-btn mj-outline"
                        onClick={() => navigate(`/client/job-preview/${job.id}`)}
                      >
                        <Eye size={14} /> Oldindan ko'rish
                      </button>
                    </>
                  )}
                  {job.status === "closed" && (
                    <button 
                      className="mj-footer-btn mj-outline"
                      onClick={() => navigate(`/client/landing/${job.id}`)}
                    >
                      <Eye size={14} /> Ko'rish
                    </button>
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
                <Trash2 size={24} />
              </div>
              <h3>Jobni o'chirish</h3>
              <p>"{showDeleteModal.title}" nomli jobni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.</p>
              <div className="mj-modal-actions">
                <button className="mj-btn-cancel" onClick={() => setShowDeleteModal(null)} disabled={actionLoading}>Bekor qilish</button>
                <button className="mj-btn-danger" onClick={() => handleDeleteJob(showDeleteModal.id)} disabled={actionLoading}>
                  {actionLoading ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Modal */}
        {showStatusModal && (
          <div className="mj-modal-overlay" onClick={() => setShowStatusModal(null)}>
            <div className="mj-modal-content" onClick={e => e.stopPropagation()}>
              <div className="mj-modal-icon">
                <MoreHorizontal size={24} />
              </div>
              <h3>Job holatini o'zgartirish</h3>
              <p>"{showStatusModal.title}" jobining holatini tanlang</p>
              <div className="mj-status-options">
                <button 
                  className="mj-status-option"
                  onClick={() => handleStatusChange(showStatusModal.id, "active")}
                >
                  <CheckCircle size={16} /> Aktiv qilish
                </button>
                <button 
                  className="mj-status-option"
                  onClick={() => handleStatusChange(showStatusModal.id, "paused")}
                >
                  <Clock size={16} /> Pauzaga qo'yish
                </button>
                <button 
                  className="mj-status-option"
                  onClick={() => handleStatusChange(showStatusModal.id, "closed")}
                >
                  <Archive size={16} /> Yopish
                </button>
              </div>
              <div className="mj-modal-actions">
                <button className="mj-btn-cancel" onClick={() => setShowStatusModal(null)} disabled={actionLoading}>Yopish</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;