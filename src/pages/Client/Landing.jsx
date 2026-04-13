// src/pages/Client/Landing.jsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate, NavLink, useParams } from "react-router-dom";
import {
  Bookmark, Share2, Edit, XCircle, Users, DollarSign,
  Clock, Globe, Star, CheckCircle, AlertCircle, MessageSquare,
  Briefcase, Send, Filter, Plus, Save, Download, Eye, Target,
  MapPin, X, UserSearch, ArrowRight, Search, Bell, Settings
} from "lucide-react";
import "./css/Landing.css";
import { getJobById, updateJob } from "../../api/jobs";
import { getProjectProposals } from "../../api/proposals";

// ==================== MOCK DATA ====================
const MOCK_JOB = {
  id: "UZ-12345",
  title: "Full-Stack Web Application Development",
  status: "active",
  type: "Fixed Price",
  location: "Worldwide",
  posted: "2 days ago",
  postedDate: "Jan 15, 2024",
  budget: "$3,000 – $5,000",
  budgetMin: 3000, budgetMax: 5000,
  duration: "1–3 months",
  experience: "Expert",
  hiring: 2,
  proposals: 18,
  invites: 5,
  interviews: 3,
  views: 142,
  skills: ["React", "Node.js", "PostgreSQL", "REST API", "TypeScript", "Docker", "AWS", "GraphQL"],
  description: "We are looking for an experienced Full-Stack Developer...",
  requirements: [
    "5+ years of experience with React and Node.js",
    "Strong knowledge of PostgreSQL and database design",
  ],
  client: {
    name: "TechCorp Solutions",
    avatar: "https://i.pravatar.cc/100?img=8",
    since: "Jan 2022",
    jobsPosted: 42,
    hireRate: 78,
    totalSpent: 24800,
    location: "Tashkent, Uzbekistan",
    rating: 4.8,
    paymentVerified: false,
  },
};

const MOCK_PROPOSALS = [
  { id: 1, avatar: "https://i.pravatar.cc/150?img=1", name: "Alisher Eshmatov", role: "Full-Stack Developer", rate: "$35/hr", score: "98%", shortlisted: false, text: "I have 6+ years of experience..." },
  { id: 2, avatar: "https://i.pravatar.cc/150?img=2", name: "Jasur Mirzaev", role: "React Expert", rate: "$28/hr", score: "92%", shortlisted: true, text: "I specialize in full-stack..." },
];

const MOCK_POOL = [
  { id: 1, avatar: "https://i.pravatar.cc/150?img=5", name: "Nilufar Ahmadova", role: "UI/UX Designer", rate: "$30/hr", invited: false, online: true },
  { id: 2, avatar: "https://i.pravatar.cc/150?img=6", name: "Bobur Ergashev", role: "Full-Stack Developer", rate: "$32/hr", invited: false, online: true },
];

// ==================== HELPERS ====================
const Stars = ({ n = 4.8 }) => (
  <div className="client-stars">
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={12} fill={s <= Math.round(n) ? "#f59e0b" : "none"} color="#f59e0b" />
    ))}
    <span className="client-stars-value">{n}</span>
  </div>
);

const Toast = ({ msg, type, onClose }) => msg ? (
  <div className={`client-toast ${type === "error" ? "error" : ""}`}>
    {type === "error" ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
    <span>{msg}</span>
    <button onClick={onClose}><X size={13} /></button>
  </div>
) : null;

// ==================== PROPOSALS PANEL ====================
const ProposalsPanel = ({ proposals: initial, onHire }) => {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState("all");

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
              <div className="client-proposal-right"><span className="client-proposal-rate">{p.rate}</span><span className="client-proposal-match">{p.score} Match</span></div>
            </div>
            <p className="client-proposal-text">{p.text}</p>
            <div className="client-proposal-footer">
              <div className="client-proposal-tags"><span>⭐ 4.9</span><span>📁 15 projects</span></div>
              <div className="client-proposal-actions">
                <button className={`client-proposal-star ${p.shortlisted ? "active" : ""}`} onClick={() => toggleStar(p.id)}><Star size={13} /> {p.shortlisted ? "Shortlisted" : "Shortlist"}</button>
                <button className="client-proposal-msg"><MessageSquare size={13} /> Message</button>
                <button className="client-proposal-hire" onClick={() => onHire(p.name)}><CheckCircle size={13} /> Hire</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== INVITE PANEL ====================
const InvitePanel = ({ onSend, onBrowseTalent }) => {
  const [pool, setPool] = useState(MOCK_POOL);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const invitedCnt = pool.filter(f => f.invited).length;
  const shown = pool.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) && (tab !== "invited" || f.invited));

  return (
    <div className="client-invite-panel">
      <div className="client-invite-header">
        <h2>Invite Freelancers</h2>
        <button className="client-invite-send" onClick={() => onSend(invitedCnt)}><Send size={15} /> Send {invitedCnt > 0 && `(${invitedCnt})`}</button>
      </div>
      <div className="client-invite-banner">
        <div><UserSearch size={22} /><div><strong>Can't find the right freelancer?</strong><span>Browse all talent</span></div></div>
        <button onClick={onBrowseTalent}>Browse All Talent <ArrowRight size={15} /></button>
      </div>
      <div className="client-invite-search"><Search size={15} /><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="client-invite-tabs">
        <button className={`client-invite-tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>Suggested</button>
        <button className={`client-invite-tab ${tab === "invited" ? "active" : ""}`} onClick={() => setTab("invited")}>Invited {invitedCnt > 0 && <span>{invitedCnt}</span>}</button>
      </div>
      <div className="client-invite-grid">
        {shown.map(f => (
          <div key={f.id} className={`client-invite-card ${f.invited ? "invited" : ""}`}>
            <div className="client-invite-cover"><img src={f.avatar} alt={f.name} /><button onClick={() => setPool(prev => prev.map(p => p.id === f.id ? { ...p, invited: !p.invited } : p))}>{f.invited ? <Check size={12} /> : <Plus size={12} />} {f.invited ? "Invited" : "Invite"}</button></div>
            <div><div className="client-invite-name">{f.name}</div><div className="client-invite-role">{f.role}</div><div><span>{f.rate}</span><span>⭐ 4.9</span></div></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== EDIT PANEL ====================
const EditPanel = ({ job, onSave, onCancel }) => {
  const [form, setForm] = useState({ title: job.title, budgetMin: job.budgetMin, budgetMax: job.budgetMax, duration: job.duration, experience: job.experience, location: job.location, hiring: job.hiring, description: job.description, skills: [...job.skills] });
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => { if(newSkill.trim() && !form.skills.includes(newSkill.trim())) { setForm({...form, skills: [...form.skills, newSkill.trim()]}); setNewSkill(""); } };
  const removeSkill = sk => setForm({...form, skills: form.skills.filter(s => s !== sk)});

  return (
    <div className="client-edit-panel">
      <div className="client-edit-header"><h2>Edit Job Post</h2><div><button onClick={onCancel}>Cancel</button><button onClick={() => onSave(form)}><Save size={15} /> Save</button></div></div>
      <div className="client-edit-form">
        <div className="client-edit-group"><label>Job Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
        <div className="client-edit-row"><div><label>Budget Min</label><input type="number" value={form.budgetMin} onChange={e => setForm({...form, budgetMin: +e.target.value})} /></div><div><label>Budget Max</label><input type="number" value={form.budgetMax} onChange={e => setForm({...form, budgetMax: +e.target.value})} /></div></div>
        <div className="client-edit-group"><label>Skills</label><div><input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyPress={e => e.key === "Enter" && addSkill()} /><button onClick={addSkill}><Plus size={14} /> Add</button></div><div className="client-edit-skills">{form.skills.map(sk => <span key={sk}>{sk}<button onClick={() => removeSkill(sk)}><X size={10} /></button></span>)}</div></div>
        <div className="client-edit-group"><label>Description</label><textarea rows={6} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const Landing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("active");
  const [tab, setTab] = useState("overview");
  const [step, setStep] = useState("view");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const [showClose, setShowClose] = useState(false);
  const [proposals, setProposals] = useState([]);

  const notify = useCallback((msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); }, []);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      if (!id) { if(active) { setJob(MOCK_JOB); setProposals(MOCK_PROPOSALS); setStatus(MOCK_JOB.status); setLoading(false); } return; }
      setLoading(true);
      try {
        const [jobRes, propRes] = await Promise.all([getJobById(id), getProjectProposals(id)]);
        if(!active) return;
        const fetchedJob = jobRes?.data || jobRes;
        if(!fetchedJob) { setJob(MOCK_JOB); setProposals(MOCK_PROPOSALS); setLoading(false); return; }
        setJob({ id: fetchedJob.id, title: fetchedJob.title, status: fetchedJob.status || "active", type: fetchedJob.budget_type === "hourly" ? "Hourly" : "Fixed Price", location: "Worldwide", posted: new Date(fetchedJob.created_at).toLocaleDateString(), budget: `$${fetchedJob.budget_amount || fetchedJob.hourly_rate_min}`, budgetMin: fetchedJob.budget_amount || 0, budgetMax: fetchedJob.budget_amount || 0, duration: fetchedJob.project_duration || "N/A", experience: fetchedJob.experience_level || "Any", hiring: 1, proposals: 0, skills: fetchedJob.skills || [], description: fetchedJob.description || "", requirements: [], client: MOCK_JOB.client });
        setStatus(fetchedJob.status || "active");
        const mappedProps = (Array.isArray(propRes?.data) ? propRes.data : []).map(p => ({ id: p.id, avatar: p.freelancer_avatar || `https://ui-avatars.com/api/?name=${p.freelancer_name || "F"}`, name: p.freelancer_name || "Freelancer", role: "Freelancer", rate: `$${p.proposed_price || 0}`, score: "N/A", shortlisted: p.status === "shortlisted", text: p.cover_letter || "" }));
        setProposals(mappedProps.length > 0 ? mappedProps : MOCK_PROPOSALS);
      } catch { if(active) { setJob(MOCK_JOB); setProposals(MOCK_PROPOSALS); } }
      finally { if(active) setLoading(false); }
    };
    fetchData();
    return () => { active = false; };
  }, [id]);

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
      {/* Step Bar */}
      <div className="client-stepbar">
        <div className="client-stepbar-inner">
          {[{id:"view",label:"View Job"},{id:"invite",label:"Invite"},{id:"proposals",label:"Proposals"},{id:"hire",label:"Hire"}].map((s,i) => (
            <button key={s.id} className={`client-step-btn ${step === s.id ? "active" : ""}`} onClick={() => { setStep(s.id); if(s.id==="invite") setTab("invites"); if(s.id==="proposals") setTab("proposals"); if(s.id==="view") setTab("overview"); }}>
              {s.label} {s.id !== "view" && <span className="client-step-pill">{s.id==="invite"?job.invites:job.proposals}</span>}
              {i < 3 && <span className="client-step-sep">›</span>}
            </button>
          ))}
          <NavLink to="/talent" className="client-step-link"><UserSearch size={15} /> Browse Talent <ArrowRight size={13} /></NavLink>
        </div>
      </div>

      {/* Body */}
      <div className="client-body">
        {/* Header */}
        <div className="client-header">
          <div><h1 className="client-title">{job.title}</h1>
            <div className="client-meta">
              <span className={`client-status ${status === "active" ? "active" : "closed"}`}>{status === "active" ? "Active" : "Closed"}</span>
              <span><Briefcase size={12} /> {job.type}</span><span><Globe size={12} /> {job.location}</span><span><Clock size={12} /> {job.posted}</span>
            </div>
          </div>
          <div className="client-actions">
            <button className={`client-icon-btn ${saved ? "saved" : ""}`} onClick={() => { setSaved(!saved); notify(saved ? "Removed" : "Saved!"); }}><Bookmark size={16} /></button>
            <button className="client-icon-btn" onClick={() => notify("Copied!")}><Share2 size={16} /></button>
            <button className="client-btn" onClick={() => setTab("edit")}><Edit size={14} /> Edit</button>
          </div>
        </div>

        {/* Stats */}
        <div className="client-stats">
          {[{icon:<Eye/>,label:"Views",value:job.views || 0},{icon:<Users/>,label:"Proposals",value:job.proposals},{icon:<MessageSquare/>,label:"Messages",value:24},{icon:<Target/>,label:"Match",value:"92%"}].map(s => (
            <div key={s.label} className="client-stat"><div className="client-stat-icon">{s.icon}</div><div><span className="client-stat-label">{s.label}</span><span className="client-stat-value">{s.value}</span></div></div>
          ))}
        </div>

        {/* Tabs */}
        <div className="client-tabs">
          {[{id:"overview",icon:<Briefcase/>,label:"Overview"},{id:"proposals",icon:<Users/>,label:"Proposals",badge:job.proposals},{id:"invites",icon:<Send/>,label:"Invites",badge:job.invites},{id:"edit",icon:<Edit/>,label:"Edit"}].map(t => (
            <button key={t.id} className={`client-tab ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); if(t.id==="invites") setStep("invite"); if(t.id==="proposals") setStep("proposals"); if(t.id==="overview"||t.id==="edit") setStep("view"); }}>
              {t.icon} {t.label} {t.badge != null && <span className="client-tab-badge">{t.badge}</span>}
            </button>
          ))}
          <NavLink to="/talent" className="client-tab-link"><UserSearch size={15} /> Find Talent</NavLink>
        </div>

        {/* Content */}
        {tab === "overview" && (
          <div className="client-grid">
            <div className="client-main">
              <div className="client-card"><div className="client-info-grid">{[{icon:"💵",label:"Budget",val:job.budget},{icon:"⏱️",label:"Duration",val:job.duration},{icon:"🏆",label:"Experience",val:job.experience},{icon:"🌍",label:"Location",val:job.location},{icon:"👥",label:"Hiring",val:`${job.hiring} freelancers`},{icon:"📅",label:"Posted",val:job.posted}].map(t => (<div key={t.label} className="client-info-item"><div>{t.icon}</div><div><div className="client-info-label">{t.label}</div><div className="client-info-value">{t.val}</div></div></div>))}</div></div>
              <div className="client-card"><div className="client-card-header">Job Description</div><div className="client-card-body"><div className="client-desc">{(job.description || "").split("\n\n").map((p,i) => <p key={i}>{p}</p>)}</div></div></div>
              {job.skills?.length > 0 && (<div className="client-card"><div className="client-card-header">Skills</div><div className="client-card-body"><div className="client-skills">{job.skills.map(s => <span key={s} className="client-skill">{s}</span>)}</div></div></div>)}
            </div>
            <aside className="client-sidebar">
              <div className="client-sidebar-card">
                <button className="client-btn-primary" onClick={() => setTab("proposals")}><Users /> Review Proposals ({job.proposals})</button>
                <button className="client-btn-outline" onClick={() => setTab("invites")}><Plus /> Invite Freelancers</button>
                <NavLink to="/talent" className="client-btn-link"><UserSearch /> Browse Talent <ArrowRight size={14} /></NavLink>
                <button className="client-btn-ghost" onClick={() => setTab("edit")}><Edit /> Edit Job</button>
                <button className="client-btn-danger" onClick={() => setShowClose(true)}><XCircle /> Close Job</button>
                <div className="client-btn-group"><button onClick={() => { setSaved(!saved); notify(saved ? "Removed" : "Saved!"); }}><Bookmark size={14} /> {saved ? "Saved" : "Save"}</button><button onClick={() => notify("Copied!")}><Share2 size={14} /> Share</button></div>
              </div>
              <div className="client-client-card">
                <div><h3>About Client</h3><button><Edit size={12} /></button></div>
                <div><img src={job.client.avatar} alt="" /><div><div>{job.client.name}</div><div>Since {job.client.since}</div></div></div>
                <div className="client-client-stats"><div><span>{job.client.jobsPosted}</span><span>Jobs</span></div><div><span>{job.client.hireRate}%</span><span>Hire Rate</span></div><div><span>${(job.client.totalSpent/1000).toFixed(1)}k</span><span>Spent</span></div></div>
                <div><div><DollarSign size={14} /><div><div>Payment</div><div className={job.client.paymentVerified ? "ok" : "warn"}>{job.client.paymentVerified ? <><CheckCircle size={13} /> Verified</> : <><AlertCircle size={13} /> Not Verified</>}</div></div></div><div><Star size={14} /><div><div>Rating</div><div><Stars n={job.client.rating} /></div></div></div><div><MapPin size={14} /><div><div>Location</div><div>🇺🇿 {job.client.location}</div></div></div></div>
              </div>
            </aside>
          </div>
        )}
        {tab === "proposals" && <ProposalsPanel proposals={proposals} onHire={(name) => notify(`Offer sent to ${name}!`)} />}
        {tab === "invites" && <InvitePanel onSend={(cnt) => notify(`${cnt} invitation${cnt !== 1 ? "s" : ""} sent!`)} onBrowseTalent={() => navigate("/talent")} />}
        {tab === "edit" && <EditPanel job={job} onSave={handleSaveJob} onCancel={() => setTab("overview")} />}
      </div>

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