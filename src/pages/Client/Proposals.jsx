// src/pages/Client/Proposals.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users, Search, Filter, MessageSquare, Star, 
  CheckCircle, Clock, Briefcase, ArrowLeft,
  ChevronDown, ExternalLink, MoreVertical,
  XCircle, UserCheck, AlertCircle
} from "lucide-react";
import { getMyJobs } from "../../api/jobs";
import { 
  getProposals, 
  updateProposal, 
  rejectProposal,
  acceptProposal 
} from "../../api/proposals";
import { useThemeContext } from "../components/Theme/ThemeContext";
import { useTranslation } from "react-i18next";
import "./css/proposals.css";

// --- Toast Component ---
const Toast = ({ msg, type, onClose }) => {
  if (!msg) return null;
  return (
    <div className={`cp-toast ${type === "error" ? "error" : "success"}`}>
      {type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
      <span>{msg}</span>
      <button onClick={onClose}><XCircle size={14} /></button>
    </div>
  );
};

const Proposals = () => {
  const { isDark } = useThemeContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all, shortlisted, archived
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initialize from query params if any
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabStr = params.get("tab");
    if (tabStr) setActiveTab(tabStr);
  }, [location.search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, propsRes] = await Promise.all([
        getMyJobs({ limit: 100 }),
        getProposals({ limit: 200 })
      ]);

      // Robust mapping for Jobs
      const jobsList = 
        Array.isArray(jobsRes?.projects) ? jobsRes.projects :
        Array.isArray(jobsRes?.data?.projects) ? jobsRes.data.projects :
        Array.isArray(jobsRes?.data) ? jobsRes.data :
        Array.isArray(jobsRes) ? jobsRes : [];

      // Robust mapping for Proposals
      const propsList = 
        Array.isArray(propsRes?.proposals) ? propsRes.proposals :
        Array.isArray(propsRes?.data?.proposals) ? propsRes.data.proposals :
        Array.isArray(propsRes?.data) ? propsRes.data :
        Array.isArray(propsRes) ? propsRes : [];

      setJobs(jobsList);
      setProposals(propsList);
    } catch (error) {
      console.error("Error fetching proposals data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleShortlist = async (proposalId, currentStatus) => {
    if (actionLoading) return;
    setActionLoading(proposalId);
    try {
      const newStatus = currentStatus === "shortlisted" ? "pending" : "shortlisted";
      const res = await updateProposal(proposalId, { status: newStatus });
      if (res?.success !== false) {
        setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: newStatus } : p));
        notify(newStatus === "shortlisted" ? "Taklif saralandi" : "Saralangan ro'yxatdan olindi");
      } else {
        notify(res?.message || "Xatolik yuz berdi", "error");
      }
    } catch (err) {
      notify("Server bilan bog'lanishda xato", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (proposalId) => {
    if (!window.confirm("Haqiqatdan ham ushbu taklifni rad etmoqchimisiz?")) return;
    setActionLoading(proposalId);
    try {
      const res = await rejectProposal(proposalId);
      if (res?.success !== false) {
        setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: "rejected" } : p));
        notify("Taklif rad etildi va arxivga olindi");
      } else {
        notify(res?.message || "Rad etishda xato", "error");
      }
    } catch (err) {
      notify("Xatolik yuz berdi", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleHire = (jobId, proposalId) => {
    // Navigate to job dashboard directly showing the hire flow
    navigate(`/client/job/${jobId}?tab=proposals&hire=${proposalId}`);
  };

  const filteredProposals = useMemo(() => {
    if (!Array.isArray(proposals)) return [];
    return proposals.filter(p => {
      // Tab filter
      if (activeTab === "shortlisted" && p.status !== "shortlisted") return false;
      if (activeTab === "archived" && p.status !== "rejected") return false;
      if (activeTab === "all" && p.status === "rejected") return false;

      // Search filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          p.freelancer_name?.toLowerCase().includes(query) ||
          p.cover_letter?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [proposals, activeTab, searchTerm]);

  // Grouped by Job
  const groupedProposals = useMemo(() => {
    const groups = {};
    if (!Array.isArray(filteredProposals)) return [];
    filteredProposals.forEach(p => {
      const jobId = String(p.job_id || p.project_id || "");
      if (!jobId) return;

      if (!groups[jobId]) {
        const job = jobs.find(j => String(j.id) === jobId) || { title: "Nomalum ish", id: jobId };
        groups[jobId] = { job, proposals: [] };
      }
      groups[jobId].proposals.push(p);
    });
    return Object.values(groups);
  }, [filteredProposals, jobs]);

  if (loading) {
    return (
      <div className={`cp-page ${isDark ? "cp-dark" : ""}`}>
        <div className="cp-container">
          <div className="cp-skeleton" style={{ height: "40px", width: "300px", marginBottom: "20px" }}></div>
          <div className="cp-stats">
            {[1, 2, 3].map(i => <div key={i} className="cp-stat-card cp-skeleton" style={{ height: "100px" }}></div>)}
          </div>
          <div className="cp-skeleton" style={{ height: "300px", borderRadius: "20px" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`cp-page ${isDark ? "cp-dark" : ""}`} style={{ backgroundColor: isDark ? "#0a0c10" : "#f4f6f9" }}>
      <div className="cp-container">
        {/* Header */}
        <div className="cp-header">
          <div>
            <h1>{t("navbar.proposals")}</h1>
            <p>Kelib tushgan takliflarni ko'rib chiqing va eng yaxshisini tanlang</p>
          </div>
          <button className="cp-btn-msg" style={{ width: "auto", padding: "10px 20px" }} onClick={() => navigate("/client/my-jobs")}>
            <Briefcase size={16} style={{ marginRight: 8 }} /> {t("navbar.myJobs")}
          </button>
        </div>

        {/* Stats */}
        <div className="cp-stats">
          <div className="cp-stat-card">
            <div className="cp-stat-icon blue"><Users size={20} /></div>
            <div className="cp-stat-info">
              <span>{proposals.length}</span>
              <span>Jami takliflar</span>
            </div>
          </div>
          <div className="cp-stat-card">
            <div className="cp-stat-icon orange"><Star size={20} /></div>
            <div className="cp-stat-info">
              <span>{proposals.filter(p => p.status === "shortlisted").length}</span>
              <span>Saralangan</span>
            </div>
          </div>
          <div className="cp-stat-card">
            <div className="cp-stat-icon green"><CheckCircle size={20} /></div>
            <div className="cp-stat-info">
              <span>{proposals.filter(p => p.status === "accepted").length}</span>
              <span>Yollangan</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="cp-controls">
          <div className="cp-tabs">
            <button className={`cp-tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
              Barchasi
            </button>
            <button className={`cp-tab-btn ${activeTab === "shortlisted" ? "active" : ""}`} onClick={() => setActiveTab("shortlisted")}>
              <Star size={14} /> Saralangan
            </button>
            <button className={`cp-tab-btn ${activeTab === "archived" ? "active" : ""}`} onClick={() => setActiveTab("archived")}>
              Arxiv
            </button>
          </div>

          <div className="cp-search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Freelancer yoki xabar bo'yicha qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Proposals List */}
        {groupedProposals.length === 0 ? (
          <div className="cp-empty">
            <Users size={64} strokeWidth={1} />
            <h3>Hali takliflar yo'q</h3>
            <p>Hozircha hech qanday talabgor ariza topshirmadi.</p>
            <button className="cp-btn-hire" style={{ maxWidth: "200px", margin: "0 auto" }} onClick={() => navigate("/client/talent")}>
              Mutaxassislarni ko'rish
            </button>
          </div>
        ) : (
          groupedProposals.map(group => (
            <div key={group.job.id} className="cp-job-group">
              <div className="cp-job-header">
                <Briefcase size={18} color="#3b82f6" />
                <h2>{group.job.title}</h2>
                <span className="cp-job-count">{group.proposals.length}</span>
                <button 
                  className="cp-btn-msg" 
                  style={{ marginLeft: "auto", border: "none", padding: "4px 8px", width: "auto" }}
                  onClick={() => navigate(`/client/job/${group.job.id}?tab=proposals`)}
                >
                  Hammasini ko'rish <ExternalLink size={14} style={{ marginLeft: 6 }} />
                </button>
              </div>

              <div className="cp-grid">
                {group.proposals.map(proposal => (
                  <div key={proposal.id} className="cp-card">
                    <div className="cp-card-top">
                      <img 
                        src={proposal.freelancer_avatar || `https://ui-avatars.com/api/?name=${proposal.freelancer_name || "F"}&background=random`} 
                        alt="" 
                        className="cp-avatar"
                      />
                      <div className="cp-info">
                        <h3>{proposal.freelancer_name || "Freelancer"}</h3>
                        <div className="cp-title">
                          <CheckCircle size={12} color="#10b981" />
                          Top Rated Specialst
                        </div>
                        <div className="cp-rating">
                          <Star size={12} fill="#f59e0b" />
                          4.9 (24 ta sharh)
                        </div>
                      </div>
                      <div className="cp-price">
                        <span>${proposal.proposed_price || proposal.budget_amount || 0}</span>
                        <span>{proposal.payment_type || "FIXED"}</span>
                      </div>
                    </div>

                    <div className="cp-cover-letter">
                      {proposal.cover_letter || "Qo'shimcha ma'lumot qoldirilmagan."}
                    </div>

                    <div className="cp-tags">
                      {proposal.skills?.slice(0, 3).map(s => <span key={s} className="cp-tag">{s}</span>) || (
                        <>
                          <span className="cp-tag">React</span>
                          <span className="cp-tag">Node.js</span>
                        </>
                      )}
                    </div>

                    <div className="cp-footer">
                      <button 
                        className={`cp-star-btn ${proposal.status === "shortlisted" ? "active" : ""}`}
                        disabled={actionLoading === proposal.id}
                        onClick={() => handleToggleShortlist(proposal.id, proposal.status)}
                        title="Saralash"
                      >
                        <Star size={18} fill={proposal.status === "shortlisted" ? "#f59e0b" : "none"} />
                      </button>
                      <button className="cp-btn-msg" onClick={() => navigate(`/messages/${proposal.freelancer_id || proposal.user_id}`)}>
                        <MessageSquare size={16} /> Xabar
                      </button>
                      <button className="cp-btn-hire" onClick={() => handleHire(group.job.id, proposal.id)}>
                        Yollash
                      </button>
                      {activeTab !== "archived" && (
                        <button 
                          className="cp-star-btn" 
                          style={{ color: "#ef4444" }} 
                          onClick={() => handleReject(proposal.id)}
                          title="Rad etish"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      </div>
    </div>
  );
};

export default Proposals;
