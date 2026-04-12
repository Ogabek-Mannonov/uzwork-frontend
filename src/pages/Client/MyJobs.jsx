// src/pages/Client/MyJobs.jsx - Mock versiya (API tayyor bo'lmaganda)
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Eye, Edit, Trash2, Copy, Users,
  Clock, DollarSign, Search, X,
  CheckCircle, Archive, Plus, MoreHorizontal
} from "lucide-react";
import "../Client/css/myjobs.css";

// Mock API funksiyalari (vaqtincha)
const getMyJobs = async () => {
  return {
    data: [
      {
        id: 1,
        title: "Full-Stack Web Developer",
        status: "active",
        budget_amount: 5000,
        proposals_count: 12,
        views: 145,
        created_at: "2024-01-15",
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL"]
      },
      {
        id: 2,
        title: "Mobile App Developer (React Native)",
        status: "active",
        budget_amount: 4000,
        proposals_count: 8,
        views: 98,
        created_at: "2024-01-10",
        skills: ["React Native", "Expo", "Firebase"]
      },
      {
        id: 3,
        title: "UI/UX Designer",
        status: "draft",
        budget_amount: 3000,
        proposals_count: 0,
        views: 0,
        created_at: "2024-01-16",
        skills: ["Figma", "Adobe XD", "UI Design", "UX Research"]
      },
      {
        id: 4,
        title: "DevOps Engineer",
        status: "closed",
        budget_amount: 6000,
        proposals_count: 15,
        views: 210,
        created_at: "2023-12-20",
        skills: ["AWS", "Docker", "Kubernetes", "CI/CD"]
      }
    ]
  };
};

const deleteJob = async (id) => {
  console.log("Deleting job:", id);
  return { success: true };
};

const duplicateJob = async (id) => {
  console.log("Duplicating job:", id);
  return {
    id: Date.now(),
    title: `Job Copy ${id}`,
    status: "draft",
    budget_amount: 5000,
    proposals_count: 0,
    views: 0,
    created_at: new Date().toISOString(),
    skills: ["React", "Node.js"]
  };
};

const updateJobStatus = async (id, status) => {
  console.log("Updating job status:", id, status);
  return { success: true };
};

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMyJobs();
      const allJobs = response.data || response || [];
      
      let filteredJobs = allJobs;
      if (activeTab === "active") {
        filteredJobs = allJobs.filter(job => job.status === "active");
      } else if (activeTab === "drafts") {
        filteredJobs = allJobs.filter(job => job.status === "draft");
      } else if (activeTab === "closed") {
        filteredJobs = allJobs.filter(job => job.status === "closed");
      }
      
      setJobs(filteredJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleDuplicateJob = async (job) => {
    try {
      const newJob = await duplicateJob(job.id);
      setJobs([newJob, ...jobs]);
    } catch (error) {
      console.error("Error duplicating job:", error);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await updateJobStatus(jobId, newStatus);
      fetchJobs();
      setShowStatusModal(null);
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const tabs = [
    { id: "all", label: "Barcha joblar", icon: <Briefcase size={16} />, count: jobs.length },
    { id: "active", label: "Aktiv", icon: <CheckCircle size={16} />, count: jobs.filter(j => j.status === "active").length },
    { id: "drafts", label: "Qoralama", icon: <Edit size={16} />, count: jobs.filter(j => j.status === "draft").length },
    { id: "closed", label: "Yopiq", icon: <Archive size={16} />, count: jobs.filter(j => j.status === "closed").length }
  ];

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case "active":
        return <span className="status-badge active"><CheckCircle size={12} /> Aktiv</span>;
      case "draft":
        return <span className="status-badge draft"><Edit size={12} /> Qoralama</span>;
      case "closed":
        return <span className="status-badge closed"><Archive size={12} /> Yopiq</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="myjobs-loading">
        <div className="spinner"></div>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="myjobs-page">
      <div className="myjobs-header">
        <div>
          <h1>Mening joblarim</h1>
          <p>Barcha e'lon qilgan joblaringizni boshqaring</p>
        </div>
        <button className="post-job-btn" onClick={() => navigate("/client/postjob")}>
          <Plus size={18} /> Yangi job e'lon qilish
        </button>
      </div>

      <div className="myjobs-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="myjobs-search">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Job nomi yoki ko'nikmalar bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="myjobs-list">
        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} strokeWidth={1} />
            <h3>Hech qanday job topilmadi</h3>
            <p>Hali hech qanday job e'lon qilmagansiz</p>
            <button className="btn-primary" onClick={() => navigate("/client/postjob")}>
              <Plus size={16} /> Birinchi jobni e'lon qilish
            </button>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <div className="job-title-section">
                  <h3>{job.title}</h3>
                  {getStatusBadge(job.status)}
                </div>
                <div className="job-actions">
                  <button 
                    className="action-btn"
                    onClick={() => navigate(`/client/landing/${job.id}`)}
                    title="Ko'rish"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => navigate(`/client/edit-job/${job.id}`)}
                    title="Tahrirlash"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleDuplicateJob(job)}
                    title="Nusxalash"
                  >
                    <Copy size={16} />
                  </button>
                  {job.status === "draft" && (
                    <button 
                      className="action-btn danger"
                      onClick={() => setShowDeleteModal(job)}
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button 
                    className="action-btn"
                    onClick={() => setShowStatusModal(job)}
                    title="Holatni o'zgartirish"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
              
              <div className="job-card-details">
                <div className="detail-item">
                  <DollarSign size={14} />
                  <span>${job.budget_amount || job.budget || 0}</span>
                </div>
                <div className="detail-item">
                  <Users size={14} />
                  <span>{job.proposals_count || 0} ta proposal</span>
                </div>
                <div className="detail-item">
                  <Eye size={14} />
                  <span>{job.views || 0} ta ko'rish</span>
                </div>
                <div className="detail-item">
                  <Clock size={14} />
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="job-card-skills">
                {job.skills?.slice(0, 5).map(skill => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
                {job.skills?.length > 5 && (
                  <span className="skill-tag more">+{job.skills.length - 5}</span>
                )}
              </div>
              
              <div className="job-card-footer">
                {job.status === "active" && (
                  <>
                    <button 
                      className="footer-btn primary"
                      onClick={() => navigate(`/client/proposals/${job.id}`)}
                    >
                      <Users size={14} /> Proposals ({job.proposals_count || 0})
                    </button>
                    <button 
                      className="footer-btn outline"
                      onClick={() => navigate(`/client/invite/${job.id}`)}
                    >
                      <Plus size={14} /> Freelancer taklif qilish
                    </button>
                  </>
                )}
                {job.status === "draft" && (
                  <>
                    <button 
                      className="footer-btn primary"
                      onClick={() => navigate(`/client/edit-job/${job.id}`)}
                    >
                      <Edit size={14} /> To'ldirish
                    </button>
                    <button 
                      className="footer-btn outline"
                      onClick={() => navigate(`/client/job-preview/${job.id}`)}
                    >
                      <Eye size={14} /> Oldindan ko'rish
                    </button>
                  </>
                )}
                {job.status === "closed" && (
                  <button 
                    className="footer-btn outline"
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
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon danger">
              <Trash2 size={24} />
            </div>
            <h3>Jobni o'chirish</h3>
            <p>"{showDeleteModal.title}" nomli jobni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(null)}>Bekor qilish</button>
              <button className="btn-danger" onClick={() => handleDeleteJob(showDeleteModal.id)}>O'chirish</button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <MoreHorizontal size={24} />
            </div>
            <h3>Job holatini o'zgartirish</h3>
            <p>"{showStatusModal.title}" jobining holatini tanlang</p>
            <div className="status-options">
              <button 
                className="status-option"
                onClick={() => handleStatusChange(showStatusModal.id, "active")}
              >
                <CheckCircle size={16} /> Aktiv qilish
              </button>
              <button 
                className="status-option"
                onClick={() => handleStatusChange(showStatusModal.id, "paused")}
              >
                <Clock size={16} /> Pauzaga qo'yish
              </button>
              <button 
                className="status-option"
                onClick={() => handleStatusChange(showStatusModal.id, "closed")}
              >
                <Archive size={16} /> Yopish
              </button>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowStatusModal(null)}>Yopish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;