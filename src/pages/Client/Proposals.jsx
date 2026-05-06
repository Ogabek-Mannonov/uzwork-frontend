// src/pages/Client/Proposals.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users, Search, Filter, MessageSquare, Star, 
  CheckCircle, Clock, Briefcase, ArrowLeft,
  ChevronDown, MoreVertical,
  XCircle, UserCheck, AlertCircle, MapPin
} from "lucide-react";
import { getMyJobs } from "../../api/jobs";
import { 
  getProposals, 
  getProjectProposals,
  getMyProposals,
  updateProposal, 
  rejectProposal,
  acceptProposal 
} from "../../api/proposals";
import { getUserProfile, markAllNotificationsReadByType } from "../../api/common";
import { findOrCreateProposalChat } from "../../api/messages";
import { useThemeContext } from "../components/Theme/ThemeContext";
import { useTranslation } from "react-i18next";
import Price from "../components/Currency/Price";
import "./css/proposals.css";

const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api\/?$/, "");

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

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("cp-modal-overlay") && !isLoading) {
      onCancel();
    }
  };

  return (
    <div className="cp-modal-overlay" onClick={handleOverlayClick}>
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
  const [mainTab, setMainTab] = useState("received"); // received, sent
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJobId, setFilterJobId] = useState(null);
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

    const jId = params.get("jobId");
    if (jId) setFilterJobId(jId);
    else setFilterJobId(null);
  }, [location.search]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Get client jobs
      const jobsRes = await getMyJobs({ limit: 100 });
      if (jobsRes?.success !== false) {
        const jobsList = 
          Array.isArray(jobsRes?.data?.projects) ? jobsRes.data.projects :
          Array.isArray(jobsRes?.projects) ? jobsRes.projects :
          Array.isArray(jobsRes?.data) ? jobsRes.data :
          Array.isArray(jobsRes) ? jobsRes : [];
        setJobs(jobsList);
      }

      // Get all proposals for this client's jobs in one go
      const propsRes = await getMyProposals({ limit: 200 });
      if (propsRes?.success !== false) {
        const rawProposals = propsRes.data?.proposals || propsRes.data || [];
        
        // Map freelancer details for consistency
        const mappedProposals = rawProposals.map(p => ({
          ...p,
          freelancer_name: p.freelancer_name || (p.freelancer_first_name ? `${p.freelancer_first_name} ${p.freelancer_last_name || ""}` : "Noma'lum"),
          freelancer_avatar: p.freelancer_avatar || null,
          freelancer_title: p.freelancer_title || "Freelancer"
        }));
        
        setProposals(mappedProposals);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  }, [filterJobId]);

  useEffect(() => {
    fetchData();
    // Mark proposal notifications as read when visiting this page
    markAllNotificationsReadByType('proposal_');
  }, [fetchData]);

  const handleToggleShortlist = async (proposalId, currentStatus) => {
    if (actionLoading) return;
    
    // Yollanganlarni statusini o'zgartirib bo'lmaydi (ular baribir saralangan hisoblanadi)
    if (currentStatus === "accepted") {
      notify("Yollangan mutaxassis har doim saralangan hisoblanadi");
      return;
    }

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

    if (type === "success") {
      setModal({ isOpen: false, type: null, data: null });
      navigate(`/contracts/${modalData}`);
      return;
    }

    setActionLoading(modalData);
    try {
      const res = type === "reject" ? await rejectProposal(modalData) : await acceptProposal(modalData);
      
      if (res?.success !== false) {
        if (type === "reject") {
          setProposals(prev => prev.map(p => p.id === modalData ? { ...p, status: "rejected" } : p));
          notify("Taklif rad etildi va arxivga olindi");
          setModal({ isOpen: false, type: null, data: null });
        } else {
          // Success acceptance
          setProposals(prev => prev.map(p => {
             if (p.id === modalData) return { ...p, status: "accepted" };
             if (p.job_id === (res.data?.proposal?.job_id || res.data?.job_id) && p.id !== modalData) return { ...p, status: "rejected" };
             return p;
          }));
          notify("Tabriklaymiz! Freelancer muvaffaqiyatli yollangan.");
          
          if (res.data?.contract?.id) {
            setModal({ 
              isOpen: true, 
              type: "success", 
              data: res.data.contract.id 
            });
          } else {
            setModal({ isOpen: false, type: null, data: null });
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
        setModal({ isOpen: false, type: null, data: null });
      }
    } catch (err) {
      console.error("executeAction error:", err);
      notify("Server bilan bog'lanishda xato", "error");
      setModal({ isOpen: false, type: null, data: null });
    } finally {
      setActionLoading(null);
    }
  };

  const openHireModal = (proposal) => {
    if (proposal.status === "accepted") {
      notify("Bu freelancer allaqachon yollangan", "error");
      return;
    }
    setModal({
      isOpen: true,
      type: "hire",
      data: proposal.id
    });
  };

  const openModal = (type, proposalId) => {
    setModal({
      isOpen: true,
      type,
      data: proposalId
    });
  };

  const handleHire = (jobId, proposalId) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;
    openHireModal(proposal);
  };

  const handleMessage = async (proposalId) => {
    if (actionLoading) return;
    setActionLoading(proposalId);
    try {
      const res = await findOrCreateProposalChat(proposalId);
      if (res?.success && res?.data?.chatId) {
        navigate(`/messages/${res.data.chatId}`);
      } else {
        notify(res?.message || "Chatni boshlab bo'lmadi", "error");
      }
    } catch (err) {
      notify("Xatolik yuz berdi", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const mainTabFilteredProposals = useMemo(() => {
    if (!Array.isArray(proposals)) return [];
    if (mainTab === "sent") {
      // Mening takliflarim: Client tomonidan yuborilgan taklifnomalar
      return proposals.filter(p => p.is_invitation === true || p.status === "invited");
    } else {
      // Kelib tushgan takliflar: Faqat freelancerlar tomonidan yuborilgan arizalar
      return proposals.filter(p => p.is_invitation !== true && p.status !== "invited");
    }
  }, [proposals, mainTab]);

  const jobFilteredProposals = useMemo(() => {
    if (!filterJobId) return mainTabFilteredProposals;
    return mainTabFilteredProposals.filter(p => {
      const pJobId = String(p.job_id || p.project_id || "");
      return pJobId.toLowerCase() === String(filterJobId).toLowerCase();
    });
  }, [mainTabFilteredProposals, filterJobId]);

  const filteredProposals = useMemo(() => {
    if (!Array.isArray(jobFilteredProposals)) return [];
    return jobFilteredProposals.filter(p => {
      // Tab filter
      if (activeTab === "shortlisted" && p.status !== "shortlisted" && p.status !== "accepted") return false;
      if (activeTab === "archived" && p.status !== "rejected") return false;
      if (activeTab === "all" && p.status === "rejected" && p.status !== "withdrawn") return false;

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
  }, [jobFilteredProposals, activeTab, searchTerm]);

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

    // Sort proposals within each group: pending -> shortlisted -> accepted (last)
    Object.values(groups).forEach(group => {
      group.proposals.sort((a, b) => {
        const statusOrder = { "shortlisted": 1, "pending": 2, "accepted": 3, "rejected": 4 };
        return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
      });
    });

    let result = Object.values(groups);
    if (filterJobId) {
      result = result.filter(g => String(g.job.id) === String(filterJobId));
    }

    return result;
  }, [filteredProposals, jobs, filterJobId]);

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
    <div className={`cp-page ${isDark ? "cp-dark" : ""}`}>
      <div className="cp-container">
        {/* Header */}
        <div className="cp-header">
          <div>
            <h1>{t("navbar.proposals")}</h1>
            <p>
              {filterJobId 
                ? (mainTab === "sent" ? t("proposals.sentSubtitle") : t("proposals.receivedSubtitle"))
                : (mainTab === "sent" ? t("proposals.sentSubtitle") : t("proposals.receivedSubtitle"))}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="cp-main-toggle">
              <button 
                className={`cp-toggle-btn ${mainTab === "received" ? "active" : ""}`}
                onClick={() => setMainTab("received")}
              >
                {t("proposals.received")}
              </button>
              <button 
                className={`cp-toggle-btn ${mainTab === "sent" ? "active" : ""}`}
                onClick={() => setMainTab("sent")}
              >
                {t("proposals.sent")}
              </button>
            </div>
            {filterJobId && (
              <button className="cp-btn-msg" style={{ width: "auto", padding: "10px 20px", borderColor: '#3b82f6', color: '#3b82f6' }} onClick={() => navigate("/client/proposals")}>
                <Filter size={16} style={{ marginRight: 8 }} /> Barcha loyihalar
              </button>
            )}
            <button className="cp-btn-msg" style={{ width: "auto", padding: "10px 20px" }} onClick={() => navigate("/client/my-jobs")}>
              <Briefcase size={16} style={{ marginRight: 8 }} /> {t("navbar.myJobs")}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="cp-stats">
          <div className="cp-stat-card">
            <div className="cp-stat-icon blue"><Users size={20} /></div>
            <div className="cp-stat-info">
              <span>{jobFilteredProposals.length}</span>
              <span>{mainTab === "sent" ? t("proposals.invited") : t("proposals.total")}</span>
            </div>
          </div>
          <div className="cp-stat-card">
            <div className="cp-stat-icon orange"><Star size={20} /></div>
            <div className="cp-stat-info">
              <span>{jobFilteredProposals.filter(p => p.status === "shortlisted").length}</span>
              <span>{t("proposals.shortlisted")}</span>
            </div>
          </div>
          <div className="cp-stat-card">
            <div className="cp-stat-icon green"><CheckCircle size={20} /></div>
            <div className="cp-stat-info">
              <span>{jobFilteredProposals.filter(p => p.status === "accepted").length}</span>
              <span>{t("proposals.hired")}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="cp-controls">
          <div className="cp-tabs">
            <button className={`cp-tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
              Barchasi ({jobFilteredProposals.filter(p => p.status !== "rejected").length})
            </button>
            <button className={`cp-tab-btn ${activeTab === "shortlisted" ? "active" : ""}`} onClick={() => setActiveTab("shortlisted")}>
              <Star size={14} /> Saralangan ({jobFilteredProposals.filter(p => p.status === "shortlisted").length})
            </button>
            <button className={`cp-tab-btn ${activeTab === "archived" ? "active" : ""}`} onClick={() => setActiveTab("archived")}>
              Arxiv ({jobFilteredProposals.filter(p => p.status === "rejected").length})
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
            <h3>
              {activeTab === "shortlisted" 
                ? t("proposals.shortlisted")
                : activeTab === "archived" 
                  ? t("proposals.archived") 
                  : (mainTab === "sent" ? t("proposals.sentEmpty") : t("proposals.receivedEmpty"))}
            </h3>
            <p>
              {activeTab === "shortlisted" 
                ? "Siz hali hech bir taklifni saralamadingiz." 
                : activeTab === "archived" 
                  ? "Rad etilgan takliflar shu yerda ko'rinadi." 
                  : (mainTab === "sent" ? "Siz hali mutaxassislarni ishga taklif qilmadingiz." : "Hozircha hech qanday talabgor ariza topshirmadi.")}
            </p>
            {activeTab === "all" && (
              <button className="cp-btn-hire" style={{ maxWidth: "200px", margin: "0 auto" }} onClick={() => navigate("/client/talent")}>
                Mutaxassislarni ko'rish
              </button>
            )}
          </div>
        ) : (
          groupedProposals.map(group => (
            <div key={group.job.id} className="cp-job-group">
              <div className="cp-job-header">
                <Briefcase size={18} color="#3b82f6" />
                <h2>{group.job.title}</h2>
                <span className="cp-job-count">{group.proposals.length}</span>
              </div>

              <div className="cp-grid">
                {group.proposals.map(proposal => (
                  <div key={proposal.id} className="cp-card">
                    <div className="cp-card-top">
                      <img 
                        src={avatarSrc(proposal.freelancer_avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(proposal.freelancer_name || "F")}&background=random`} 
                        alt="" 
                        className="cp-avatar"
                        onClick={() => navigate(`/profile/${proposal.freelancer_id || proposal.user_id}`)}
                        style={{ cursor: "pointer" }}
                      />
                      <div className="cp-info">
                        <h3 onClick={() => navigate(`/profile/${proposal.freelancer_id || proposal.user_id}`)} style={{ cursor: "pointer" }}>
                          {proposal.freelancer_name}
                        </h3>
                        <div className="cp-title">
                          {proposal.freelancer_title || "Top Rated Specialist"}
                        </div>
                        <div className="cp-meta-row">
                          <div className="cp-rating">
                            <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                            <span style={{ marginLeft: "4px", fontWeight: "600", color: "#eab308" }}>
                              {proposal.freelancer_rating ? Number(proposal.freelancer_rating).toFixed(1) : "0.0"}
                            </span>
                            <span style={{ marginLeft: "4px", color: "var(--text-muted, #6b7280)" }}>
                              ({proposal.freelancer_reviews_count || 0} ta sharh)
                            </span>
                          </div>
                          {proposal.freelancer_location && (
                            <div className="cp-location">
                              <MapPin size={12} /> {proposal.freelancer_location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="cp-price">
                        <Price amount={proposal.proposed_price || proposal.budget_amount || 0} currency={proposal.currency || proposal.job_currency || 'UZS'} />
                        <span>{proposal.payment_type || "FIXED"}</span>
                      </div>
                    </div>

                    <div className="cp-details-row">
                      <div className="cp-detail-item">
                        <Clock size={14} />
                        <span>{proposal.proposed_duration || "Kiritilmagan"}</span>
                      </div>
                      <div className="cp-detail-item">
                        <CheckCircle size={14} color="#3b82f6" />
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
                      <button className="cp-btn-msg" onClick={() => handleMessage(proposal.id)} disabled={actionLoading === proposal.id}>
                        {actionLoading === proposal.id ? <Clock size={16} className="cp-spin" /> : <MessageSquare size={16} />} Xabar
                      </button>
                      
                      {proposal.status === "accepted" ? (
                        <button className="cp-btn-hired" disabled>
                          <CheckCircle size={16} /> Yollangan
                        </button>
                      ) : proposal.status === "rejected" ? (
                        <button className="cp-btn-rejected" disabled>
                          <XCircle size={16} /> Rad etilgan
                        </button>
                      ) : proposal.status === "withdrawn" ? (
                        <button className="cp-btn-rejected" disabled>
                          <Clock size={16} /> Bekor qilingan
                        </button>
                      ) : (
                        <button className="cp-btn-hire" onClick={() => handleHire(group.job.id, proposal.id)}>
                          Yollash
                        </button>
                      )}

                      {activeTab !== "archived" && !["accepted", "rejected", "withdrawn"].includes(proposal.status) && (
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
