// src/pages/Client/Proposals.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users, Search, Filter, MessageSquare, Star, 
  CheckCircle, Clock, Briefcase, ArrowLeft,
  ChevronDown, ExternalLink, MoreVertical,
  XCircle, UserCheck, AlertCircle, MapPin
} from "lucide-react";
import { getMyJobs } from "../../api/jobs";
import { 
  getProposals, 
  getProjectProposals,
  updateProposal, 
  rejectProposal,
  acceptProposal 
} from "../../api/proposals";
import { getUserProfile } from "../../api/common";
import { useThemeContext } from "../components/Theme/ThemeContext";
import { useTranslation } from "react-i18next";
import "./css/proposals.css";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND}${cleanUrl}`;
}

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

// --- Confirmation Modal Component ---
const ConfirmationModal = ({ isOpen, type, title, desc, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  const isReject = type === "reject";
  return (
    <div className="cp-modal-overlay">
      <div className="cp-modal">
        <div className={`cp-modal-icon ${isReject ? "red" : "blue"}`}>
          {isReject ? <AlertCircle size={32} /> : <UserCheck size={32} />}
        </div>
        <h2>{title}</h2>
        <p>{desc}</p>
        <div className="cp-modal-actions">
          <button className="cp-modal-cancel" onClick={onCancel} disabled={isLoading}>
            Bekor qilish
          </button>
          <button className={`cp-modal-confirm ${isReject ? "red" : ""}`} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Bajarilmoqda..." : "Tasdiqlash"}
          </button>
        </div>
      </div>
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
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });

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
      const jobsRes = await getMyJobs({ limit: 100 });
      
      const jobsList = 
        Array.isArray(jobsRes?.projects) ? jobsRes.projects :
        Array.isArray(jobsRes?.data?.projects) ? jobsRes.data.projects :
        Array.isArray(jobsRes?.data) ? jobsRes.data :
        Array.isArray(jobsRes) ? jobsRes : [];

      // Fetch proposals for each job in parallel to get rich data
      const propsResponses = await Promise.all(
        jobsList.map(job => getProjectProposals(job.id, { limit: 50 }))
      );

      const allProposals = [];
      propsResponses.forEach(res => {
        const list = 
          Array.isArray(res?.proposals) ? res.proposals :
          Array.isArray(res?.data?.proposals) ? res.data.proposals :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res) ? res : [];
        allProposals.push(...list);
      });

      setJobs(jobsList);

      // --- Enrichment: Fetch missing freelancer details ---
      const enrichedProposals = await Promise.all(allProposals.map(async (p) => {
        const flId = p.freelancer_id || p.user_id;
        if (flId && !p.freelancer_name) {
          try {
            const profileRes = await getUserProfile(flId);
            const u = profileRes?.data?.user || profileRes?.user;
            const prof = profileRes?.data?.profile || profileRes?.profile;
            if (u) {
              return {
                ...p,
                freelancer_name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username || u.name,
                freelancer_avatar: prof?.avatar_url || u.avatar_url,
                freelancer_title: prof?.title || u.title
              };
            }
          } catch (e) { console.error("Enrichment error:", e); }
        }
        return p;
      }));

      setProposals(enrichedProposals);
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

  const executeAction = async () => {
    const { type, data: modalData } = modal;
    if (!modalData) return;

    setActionLoading(modalData);
    try {
      if (type === "success") {
        navigate(`/contracts/${modalData}`);
        setModal({ isOpen: false, type: null, data: null });
        return;
      }

      const res = type === "reject" ? await rejectProposal(modalData) : await acceptProposal(modalData);
      
      if (res?.success !== false) {
        if (type === "reject") {
          setProposals(prev => prev.map(p => p.id === modalData ? { ...p, status: "rejected" } : p));
          notify("Taklif rad etildi va arxivga olindi");
        } else {
          // Success acceptance
          setProposals(prev => prev.map(p => {
             if (p.id === modalData) return { ...p, status: "accepted" };
             // If other proposals for the same job were automatically rejected
             if (p.job_id === res.data?.proposal?.job_id && p.id !== modalData) return { ...p, status: "rejected" };
             return p;
          }));
          notify("Tabriklaymiz! Freelancer muvaffaqiyatli yollangan.");
          
          // Custom modal for redirect instead of window.confirm
          if (res.data?.contract?.id) {
            setModal({ 
              isOpen: true, 
              type: "success", 
              data: res.data.contract.id 
            });
          }
        }
      } else {
        // Error handling
        const isBalanceError = res?.message?.toLowerCase().includes("balans") || res?.message?.toLowerCase().includes("balance");
        if (isBalanceError) {
          notify(
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <span>{res.message}</span>
              <button 
                onClick={() => navigate("/client/payments")}
                style={{ background: "white", color: "#ef4444", border: "none", borderRadius: "4px", padding: "2px 8px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
              >
                Balansni to'ldirish
              </button>
            </div>, 
            "error"
          );
        } else {
          notify(res?.message || "Xatolik yuz berdi", "error");
        }
      }
    } catch (err) {
      notify("Server bilan bog'lanishda xato", "error");
    } finally {
      setActionLoading(null);
      if (!modal.isOpen || modal.type !== "success") {
         // Only close if not opening the success modal
         if (modal.type !== "hire") {
           setModal({ isOpen: false, type: null, data: null });
         }
      }
    }
  };

  const openModal = (type, proposalId) => {
    setModal({
      isOpen: true,
      type,
      data: proposalId
    });
  };

  const handleHire = (jobId, proposalId) => {
    openModal("hire", proposalId);
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
                        src={avatarSrc(proposal.freelancer_avatar || proposal.user_avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(proposal.freelancer_name || "F")}&background=random`} 
                        alt="" 
                        className="cp-avatar"
                        onClick={() => navigate(`/profile/${proposal.freelancer_id || proposal.user_id}`)}
                        style={{ cursor: "pointer" }}
                      />
                      <div className="cp-info">
                        <h3 onClick={() => navigate(`/profile/${proposal.freelancer_id || proposal.user_id}`)} style={{ cursor: "pointer" }}>
                          {proposal.freelancer_name || 
                           proposal.user_name || 
                           proposal.full_name ||
                           (proposal.freelancer?.user?.first_name ? `${proposal.freelancer.user.first_name} ${proposal.freelancer.user.last_name || ""}` : "") ||
                           (proposal.freelancer?.first_name ? `${proposal.freelancer.first_name} ${proposal.freelancer.last_name || ""}` : "") ||
                           (proposal.user?.first_name ? `${proposal.user.first_name} ${proposal.user.last_name || ""}` : "") ||
                           (proposal.first_name ? `${proposal.first_name} ${proposal.last_name || ""}` : "") ||
                           `Frelanser #${String(proposal.freelancer_id || proposal.user_id || proposal.id).slice(0, 6)}`}
                        </h3>
                        <div className="cp-title">
                           {proposal.freelancer_title || 
                           proposal.freelancer?.title || 
                           proposal.freelancer?.user?.title ||
                           "Top Rated Specialist"}
                        </div>
                        <div className="cp-meta-row">
                          <div className="cp-rating">
                            <Star size={12} fill="#f59e0b" />
                            {proposal.freelancer_rating || "4.9"} ({proposal.freelancer_reviews_count || "24"} ta sharh)
                          </div>
                          {proposal.freelancer_location && (
                            <div className="cp-location">
                              <MapPin size={12} /> {proposal.freelancer_location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="cp-price">
                        <span>${proposal.proposed_price || proposal.budget_amount || 0}</span>
                        <span>{proposal.payment_type || "FIXED"}</span>
                      </div>
                    </div>

                    <div className="cp-details-row">
                      <div className="cp-detail-item">
                        <Clock size={14} />
                        <span>{proposal.proposed_duration || "Kiritilmagan"}</span>
                      </div>
                      <div className="cp-detail-item">
                        <CheckCircle size={14} color="#10b981" />
                        <span>{t("publicProfile.verified")}</span>
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
                      {activeTab !== "archived" && proposal.status !== "accepted" && (
                        <button 
                          className="cp-star-btn" 
                          style={{ color: "#ef4444" }} 
                          onClick={() => openModal("reject", proposal.id)}
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
        
        <ConfirmationModal 
          isOpen={modal.isOpen}
          type={modal.type}
          title={
            modal.type === "reject" ? "Taklifni rad etish" : 
            modal.type === "success" ? "Muvaffaqiyatli!" : "Mutaxassisni yollash"
          }
          desc={
            modal.type === "reject" ? "Haqiqatdan ham ushbu taklifni rad etmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi." :
            modal.type === "success" ? "Freelancer yollash muvaffaqiyatli yakunlandi. Kontrakt sahifasiga o'tishni xohlaysizmi?" :
            "Haqiqatdan ham ushbu mutaxassisni loyihaga yollamoqchimisiz? Balansingizdan loyiha summasi escrow uchun band qilinadi."
          }
          isLoading={actionLoading === modal.data && modal.type !== "success"}
          onConfirm={executeAction}
          onCancel={() => setModal({ isOpen: false, type: null, data: null })}
        />
      </div>
    </div>
  );
};

export default Proposals;
