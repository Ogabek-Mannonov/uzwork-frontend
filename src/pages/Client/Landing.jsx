// src/pages/Client/Landing.jsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate, NavLink, useParams, useLocation } from "react-router-dom";
import {
  Bookmark, Share2, Edit, XCircle, Users, DollarSign,
  Clock, Globe, Star, CheckCircle, AlertCircle, MessageSquare,
  Briefcase, Send, Filter, Plus, Save, Download, Eye, Target,
  MapPin, X, UserSearch, ArrowRight, Search, Bell, Settings
} from "lucide-react";
import "./css/Landing.css";
import { getJobById, updateJob } from "../../api/jobs";
import { getProjectProposals, acceptProposal } from "../../api/proposals";
import Price from "../components/Currency/Price";

// ==================== MOCK DATA ====================
// ... (rest of mock data)
// ...

// ==================== PROPOSALS PANEL ====================
const ProposalsPanel = ({ proposals: initial, onHire, actionLoading }) => {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setList(initial);
  }, [initial]);

  const shown = list.filter(p => filter === "shortlisted" ? p.shortlisted : true);
  const toggleStar = (id) => setList(prev => prev.map(p => p.id === id ? { ...p, shortlisted: !p.shortlisted } : p));

  return (
    <div className="client-proposals-panel">
      <div className="client-proposals-header">
        <div><h2>Proposals Received</h2><p>{initial.length} total</p></div>
        <div><button><Download size={14} /> Export</button><button><Filter size={14} /> Filter</button></div>
      </div>
      <div className="client-proposals-filters">
        {["all","shortlisted"].map(f => (
          <button key={f} className={`client-proposals-filter ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : "Shortlisted"} <span>{f === "all" ? list.length : list.filter(p => p.shortlisted).length}</span>
          </button>
        ))}
      </div>
      <div className="client-proposals-list">
        {shown.map(p => (
          <div key={p.id} className="client-proposal-card">
            <div className="client-proposal-top">
              <img src={p.avatar} alt={p.name} className="client-proposal-avatar" />
              <div><div className="client-proposal-name">{p.name}</div><div className="client-proposal-role">{p.role}</div></div>
              <div className="client-proposal-right"><span className="client-proposal-rate">{typeof p.rate === 'object' ? p.rate : p.rate}</span><span className="client-proposal-match">{p.score} Match</span></div>
            </div>
            <p className="client-proposal-text">{p.text}</p>
            <div className="client-proposal-footer">
              <div className="client-proposal-tags"><span>⭐ 4.9</span><span>📁 15 projects</span></div>
              <div className="client-proposal-actions">
                <button className={`client-proposal-star ${p.shortlisted ? "active" : ""}`} onClick={() => toggleStar(p.id)}><Star size={13} /> {p.shortlisted ? "Shortlisted" : "Shortlist"}</button>
                <button className="client-proposal-msg"><MessageSquare size={13} /> Message</button>
                <button 
                  className="client-proposal-hire" 
                  onClick={() => onHire(p)}
                  disabled={actionLoading === p.id}
                >
                  <CheckCircle size={13} /> {actionLoading === p.id ? "Processing..." : "Hire"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ... (InvitePanel and EditPanel remain unchanged)

// ==================== MAIN COMPONENT ====================
const Landing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("active");
  const [tab, setTab] = useState("overview");
  const [step, setStep] = useState("view");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const [showClose, setShowClose] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [hireModal, setHireModal] = useState({ isOpen: false, data: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, contractId: null });
  const [actionLoading, setActionLoading] = useState(null);

  const notify = useCallback((msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); }, []);

  const fetchData = useCallback(async (active = true) => {
    if (!id) { if(active) { setJob(MOCK_JOB); setProposals(MOCK_PROPOSALS); setStatus(MOCK_JOB.status); setLoading(false); } return; }
    setLoading(true);
    try {
      const [jobRes, propRes] = await Promise.all([getJobById(id), getProjectProposals(id)]);
      if(!active) return;
      const fetchedJob = jobRes?.data || jobRes;
      if(!fetchedJob) { setJob(MOCK_JOB); setProposals(MOCK_PROPOSALS); setLoading(false); return; }
      setJob({ id: fetchedJob.id, title: fetchedJob.title, status: fetchedJob.status || "active", type: fetchedJob.budget_type === "hourly" ? "Hourly" : "Fixed Price", location: "Worldwide", posted: new Date(fetchedJob.created_at).toLocaleDateString(), budget: <Price amount={fetchedJob.budget_amount || fetchedJob.hourly_rate_min} currency={fetchedJob.currency || 'UZS'} />, budgetMin: fetchedJob.budget_amount || 0, budgetMax: fetchedJob.budget_amount || 0, currency: fetchedJob.currency || 'UZS', duration: fetchedJob.project_duration || "N/A", experience: fetchedJob.experience_level || "Any", hiring: 1, proposals: 0, skills: fetchedJob.skills || [], description: fetchedJob.description || "", requirements: [], client: MOCK_JOB.client });
      setStatus(fetchedJob.status || "active");
      const mappedProps = (Array.isArray(propRes?.data) ? propRes.data : propRes?.proposals || []).map(p => ({ id: p.id, avatar: p.freelancer_avatar || `https://ui-avatars.com/api/?name=${p.freelancer_name || "F"}`, name: p.freelancer_name || "Freelancer", role: "Freelancer", rate: <Price amount={p.proposed_price || 0} currency={p.currency || fetchedJob.currency || 'UZS'} />, score: "N/A", shortlisted: p.status === "shortlisted", text: p.cover_letter || "" }));
      setProposals(mappedProps.length > 0 ? mappedProps : MOCK_PROPOSALS);
    } catch { if(active) { setJob(MOCK_JOB); setProposals(MOCK_PROPOSALS); } }
    finally { if(active) setLoading(false); }
  }, [id]);

  useEffect(() => {
    let active = true;
    fetchData(active);
    return () => { active = false; };
  }, [fetchData]);

  // Handle Tab sync from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    const hireParam = params.get("hire");
    
    if (tabParam && ["overview", "proposals", "invites", "edit"].includes(tabParam)) {
      setTab(tabParam);
      if (tabParam === "proposals") setStep("proposals");
      if (tabParam === "invites") setStep("invite");
      if (tabParam === "overview" || tabParam === "edit") setStep("view");
    }

    if (hireParam && proposals.length > 0) {
      const prop = proposals.find(p => String(p.id) === hireParam);
      if (prop) setHireModal({ isOpen: true, data: prop });
    }
  }, [location.search, proposals]);

  const handleConfirmHire = async () => {
    const proposal = hireModal.data;
    if (!proposal) return;

    setActionLoading(proposal.id);
    try {
      const res = await acceptProposal(proposal.id);
      if (res?.success !== false) {
        notify(`Tabriklaymiz! offer muvaffaqiyatli ${proposal.name} ga yuborildi.`);
        setHireModal({ isOpen: false, data: null });
        fetchData(); // Refresh data
        
        if (res.data?.contract?.id) {
          setSuccessModal({ isOpen: true, contractId: res.data.contract.id });
        }
      } else {
        const msg = res?.message ? String(res.message).toLowerCase() : "";
        const isBalanceError = msg.includes("balans") || msg.includes("balance");
        if (isBalanceError) {
          notify(
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <span>{res?.message || "Balansda yetarli mablag' yo'q"}</span>
              <button onClick={() => navigate("/client/payments")} style={{ background: "white", color: "#ef4444", border: "none", borderRadius: "4px", padding: "2px 8px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                To'ldirish
              </button>
            </div>, 
            "error"
          );
        } else {
          notify(res?.message || "Xatolik yuz berdi", "error");
        }
      }
    } catch (err) {
      notify("Server xatosi", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveJob = async (form) => {
    notify("Saving...", "info");
    const res = await updateJob(id, { title: form.title, description: form.description, skills: form.skills });
    if(res?.success === false) { notify(res?.message || "Failed", "error"); return; }
    setJob(prev => prev ? { ...prev, title: form.title, description: form.description, skills: form.skills } : prev);
    setTab("overview");
    notify("Job updated!");
  };

  const handleCloseJob = async () => {
    await updateJob(id, { status: "closed" });
    setStatus("closed");
    setShowClose(false);
    notify("Job closed.");
  };

  if(loading) return <div className="client-loading"><div className="client-spinner"></div><span>Yuklanmoqda...</span></div>;
  if(!job) return <div className="client-notfound"><div>📋</div><h2>Job topilmadi</h2><button onClick={() => navigate("/client/home")}>← Dashboard</button></div>;

  return (
    <div className="client-landing">
      {/* ... (Step Bar and Header) */}
      {/* ... (Stats and Tabs) */}

      {/* Content */}
      {tab === "overview" && (
        <div className="client-grid">
          {/* ... (Overview contents) */}
        </div>
      )}
      {tab === "proposals" && (
        <ProposalsPanel 
          proposals={proposals} 
          onHire={(p) => setHireModal({ isOpen: true, data: p })}
          actionLoading={actionLoading}
        />
      )}
      {tab === "invites" && <InvitePanel onSend={(cnt) => notify(`${cnt} invitation sent!`)} onBrowseTalent={() => navigate("/talent")} />}
      {tab === "edit" && <EditPanel job={job} onSave={handleSaveJob} onCancel={() => setTab("overview")} />}

      {/* Hire Confirmation Modal */}
      {hireModal.isOpen && (
        <div className="client-modal-overlay" onClick={() => setHireModal({ isOpen: false, data: null })}>
          <div className="client-modal" onClick={e => e.stopPropagation()}>
            <div className="client-modal-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
              <CheckCircle size={30} />
            </div>
            <h3>Hiring {hireModal.data?.name}</h3>
            <p>Siz haqiqatdan ham ushbu mutaxassisni yollamoqchimisiz? Escrow uchun mablag' band qilinadi.</p>
            <div className="client-modal-btns">
              <button onClick={() => setHireModal({ isOpen: false, data: null })}>Bekor qilish</button>
              <button 
                onClick={handleConfirmHire} 
                style={{ backgroundColor: "#10b981", color: "white" }}
                disabled={actionLoading === hireModal.data?.id}
              >
                {actionLoading === hireModal.data?.id ? "Processing..." : "Hire Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="client-modal-overlay" onClick={() => setSuccessModal({ isOpen: false, contractId: null })}>
          <div className="client-modal" onClick={e => e.stopPropagation()}>
            <div className="client-modal-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
              <CheckCircle size={30} />
            </div>
            <h3>Muvaffaqiyatli!</h3>
            <p>Freelancer yollash muvaffaqiyatli yakunlandi. Kontrakt sahifasiga o'tishni xohlaysizmi?</p>
            <div className="client-modal-btns">
              <button onClick={() => setSuccessModal({ isOpen: false, contractId: null })}>Bekor qilish</button>
              <button 
                onClick={() => {
                  setSuccessModal({ isOpen: false, contractId: null });
                  navigate(`/contracts/${successModal.contractId}`);
                }} 
                style={{ backgroundColor: "#10b981", color: "white" }}
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showClose && (
        <div className="client-modal-overlay" onClick={() => setShowClose(false)}>
          <div className="client-modal" onClick={e => e.stopPropagation()}>
            <div className="client-modal-icon"><XCircle size={30} /></div>
            <h3>Close this job?</h3>
            <p>This will stop accepting new proposals.</p>
            <div className="client-modal-btns"><button onClick={() => setShowClose(false)}>Cancel</button><button onClick={handleCloseJob}>Close Job</button></div>
          </div>
        </div>
      )}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default Landing;