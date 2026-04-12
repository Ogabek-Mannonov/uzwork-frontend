// src/pages/Client/Landing.jsx (JobDetails component) - HEADER O'CHIRILGAN VERSIYA

import { useState, useCallback, useEffect } from "react";
import { useNavigate, NavLink, useParams } from "react-router-dom";
import {
  Search, Bell, Settings, Moon, HelpCircle,
  Bookmark, Share2, Edit, XCircle, Users, DollarSign,
  Clock, Globe, Award, Calendar, Star, CheckCircle,
  AlertCircle, MessageSquare, ChevronRight, Briefcase,
  Send, Filter, Plus, Save, Download, Eye, Target,
  MessageCircle, MoreHorizontal, MapPin, Check, X,
  TrendingUp, AlertTriangle, UserSearch, ArrowRight,
} from "lucide-react";
import "../Client/css/landing.css";
import { getJobById, updateJob } from "../../api/jobs";
import { getProjectProposals } from "../../api/proposals";

/* ================================================================
   MOCK DATA (o'zgarishsiz)
   ================================================================ */
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
  description: `We are looking for an experienced Full-Stack Developer to build a modern web application for our startup. The ideal candidate should have strong experience with React, Node.js, and PostgreSQL.\n\nThe project involves building a complete platform from scratch including user authentication, real-time chat, payment integration, and an admin dashboard. The candidate must be comfortable working independently and delivering high-quality, maintainable code.`,
  requirements: [
    "5+ years of experience with React and Node.js",
    "Strong knowledge of PostgreSQL and database design",
    "Experience with REST API development and WebSocket",
    "Ability to deploy and manage applications on cloud platforms",
    "Excellent communication skills in English or Russian",
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
    phoneVerified: true,
  },
};

const MOCK_PROPOSALS = [
  { id: 1, avatar: "https://i.pravatar.cc/150?img=1", initials: "AE", name: "Alisher Eshmatov",   role: "Full-Stack Developer • Tashkent, UZ",   rate: "$35/hr", score: "98%", color: "#3b82f6", shortlisted: false, text: "I have 6+ years of experience building scalable full-stack applications with React and Node.js. I've worked on similar e-commerce and SaaS platforms and can deliver high-quality code on time." },
  { id: 2, avatar: "https://i.pravatar.cc/150?img=2", initials: "JM", name: "Jasur Mirzaev",      role: "React / Node.js Expert • Samarkand, UZ",  rate: "$28/hr", score: "92%", color: "#f59e0b", shortlisted: true,  text: "I specialize in full-stack web development with a strong focus on performance and scalability. My recent projects include a fintech dashboard and a real-estate platform built with your exact stack." },
  { id: 3, avatar: "https://i.pravatar.cc/150?img=3", initials: "DK", name: "Doniyor Karimov",    role: "Senior Backend Engineer • Remote",          rate: "$40/hr", score: "87%", color: "#10b981", shortlisted: false, text: "With 7 years of backend experience and solid React skills, I'm confident I can deliver exactly what you need. Particularly strong in PostgreSQL optimization and API architecture." },
  { id: 4, avatar: "https://i.pravatar.cc/150?img=4", initials: "MS", name: "Madina Salimova",    role: "Full-Stack Developer • Tashkent, UZ",       rate: "$32/hr", score: "94%", color: "#8b5cf6", shortlisted: false, text: "Experienced full-stack developer with 4+ years in React and Node.js. Built several e-commerce platforms and real-time applications. Detail-oriented, clean maintainable code." },
];

const MOCK_POOL = [
  { id: 1, avatar: "https://i.pravatar.cc/150?img=5", initials: "NA", name: "Nilufar Ahmadova",   role: "UI/UX + Frontend Dev", rate: "$30/hr", color: "#8b5cf6", invited: false, online: true  },
  { id: 2, avatar: "https://i.pravatar.cc/150?img=6", initials: "BE", name: "Bobur Ergashev",     role: "Full-Stack Developer",  rate: "$32/hr", color: "#ec4899", invited: false, online: true  },
  { id: 3, avatar: "https://i.pravatar.cc/150?img=7", initials: "SK", name: "Sarvar Komilov",     role: "Node.js Specialist",    rate: "$25/hr", color: "#14b8a6", invited: true,  online: false },
  { id: 4, avatar: "https://i.pravatar.cc/150?img=8", initials: "ZT", name: "Zulfiya Toshmatova", role: "React Developer",       rate: "$22/hr", color: "#f97316", invited: false, online: true  },
  { id: 5, avatar: "https://i.pravatar.cc/150?img=9", initials: "AK", name: "Aziz Karimov",       role: "DevOps Engineer",       rate: "$45/hr", color: "#06b6d4", invited: false, online: false },
];

/* ================================================================
   HELPERS
   ================================================================ */
const Stars = ({ n = 4.8 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={12} fill={s <= Math.round(n) ? "#f59e0b" : "none"} color="#f59e0b" />
    ))}
    <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginLeft: 4 }}>{n}</span>
  </div>
);

const Toast = ({ msg, type, onClose }) =>
  msg ? (
    <div className={`jd-toast ${type === "error" ? "error" : ""}`}>
      {type === "error"
        ? <AlertTriangle size={16} color="#dc2626" />
        : <CheckCircle  size={16} color="#14a800" />}
      <span>{msg}</span>
      <button className="jd-toast-x" onClick={onClose}><X size={13} /></button>
    </div>
  ) : null;

/* ================================================================
   PROPOSALS PANEL
   ================================================================ */
const ProposalsPanel = ({ proposals: initial, onHire }) => {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const shown = list.filter(p =>
    filter === "shortlisted" ? p.shortlisted :
    filter === "hired"       ? p.hired       : true
  );

  const toggleStar = useCallback((id) =>
    setList(prev => prev.map(p => p.id === id ? { ...p, shortlisted: !p.shortlisted } : p)),
  []);

  const FILTERS = [
    { id: "all", label: "All Proposals", cnt: list.length },
    { id: "shortlisted", label: "Shortlisted", cnt: list.filter(p => p.shortlisted).length },
    { id: "interview", label: "Interview", cnt: 3 },
    { id: "hired", label: "Hired", cnt: 0 },
  ];

  return (
    <div className="jd-proposals-panel">
      <div className="jd-pp-head">
        <div className="jd-pp-head-left">
          <h2>Proposals Received</h2>
          <p>{initial.length} total proposals</p>
        </div>
        <div className="jd-pp-head-right">
          <button className="jd-pp-btn"><Download size={14} /> Export</button>
          <button className="jd-pp-btn"><Filter size={14} /> Filter</button>
        </div>
      </div>

      <div className="jd-pp-filters">
        {FILTERS.map(f => (
          <button key={f.id}
            className={`jd-pp-filter ${filter === f.id ? "active" : ""}`}
            onClick={() => setFilter(f.id)}>
            {f.label}
            <span className="jd-pp-filter-cnt">{f.cnt}</span>
          </button>
        ))}
      </div>

      <div className="jd-pp-list">
        {shown.map(p => (
          <div key={p.id}
            className={`jd-proposal-card ${selected === p.id ? "selected" : ""}`}
            onClick={() => setSelected(s => s === p.id ? null : p.id)}>
            <div className="jd-pc-top">
              <img src={p.avatar} alt={p.name} className="jd-pc-ava" />
              <div className="jd-pc-info">
                <div className="jd-pc-name">{p.name}</div>
                <div className="jd-pc-role">{p.role}</div>
              </div>
              <div className="jd-pc-right">
                <span className="jd-pc-rate">{p.rate}</span>
                <span className="jd-pc-match">{p.score} Match</span>
              </div>
            </div>
            <p className="jd-pc-text">{p.text}</p>
            <div className="jd-pc-foot">
              <div className="jd-pc-tags">
                <span className="jd-pc-tag">⭐ 4.9</span>
                <span className="jd-pc-tag">📁 15 projects</span>
                <span className="jd-pc-tag">⏱ 1hr response</span>
              </div>
              <div className="jd-pc-actions" onClick={e => e.stopPropagation()}>
                <button
                  className={`jd-pca-btn jd-pca-star ${p.shortlisted ? "starred" : ""}`}
                  onClick={() => toggleStar(p.id)}>
                  <Star size={13} fill={p.shortlisted ? "currentColor" : "none"} />
                  {p.shortlisted ? "Shortlisted" : "Shortlist"}
                </button>
                <button className="jd-pca-btn jd-pca-msg">
                  <MessageSquare size={13} /> Message
                </button>
                <button className="jd-pca-btn jd-pca-hire" onClick={() => onHire(p.name)}>
                  <CheckCircle size={13} /> Hire
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================================================================
   INVITE PANEL
   ================================================================ */
const InvitePanel = ({ onSend, onBrowseTalent }) => {
  const [pool, setPool] = useState(MOCK_POOL);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const toggleInvite = useCallback((id) =>
    setPool(prev => prev.map(f => f.id === id ? { ...f, invited: !f.invited } : f)),
  []);

  const invitedCnt = pool.filter(f => f.invited).length;
  const shown = pool.filter(f => {
    const q = f.name.toLowerCase().includes(search.toLowerCase()) ||
              f.role.toLowerCase().includes(search.toLowerCase());
    if (tab === "invited") return q && f.invited;
    return q;
  });

  return (
    <div className="jd-invite-panel">
      <div className="jd-ip-head">
        <h2>Invite Freelancers</h2>
        <button className="jd-ip-send-btn" onClick={() => onSend(invitedCnt)}>
          <Send size={15} /> Send Invitations
          {invitedCnt > 0 && ` (${invitedCnt})`}
        </button>
      </div>

      <div className="jd-browse-talent-banner">
        <div className="jd-btb-left">
          <div className="jd-btb-icon"><UserSearch size={22} /></div>
          <div className="jd-btb-text">
            <strong>Can't find the right freelancer?</strong>
            <span>Browse all talent on the platform and invite anyone you like</span>
          </div>
        </div>
        <button className="jd-btb-btn" onClick={onBrowseTalent}>
          Browse All Talent <ArrowRight size={15} />
        </button>
      </div>

      <div className="jd-ip-search-bar">
        <div className="jd-ip-search">
          <span className="jd-ip-search-icon"><Search size={15} /></span>
          <input
            placeholder="Search by name, skill, role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="jd-ip-filter-btn"><Filter size={14} /> Filter</button>
      </div>

      <div className="jd-ip-tabs">
        {[
          { id: "all", label: "Suggested", cnt: null },
          { id: "invited", label: "Invited", cnt: invitedCnt },
        ].map(t => (
          <button key={t.id} className={`jd-ip-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}>
            {t.label}
            {t.cnt > 0 && <span className="jd-ip-tab-cnt">{t.cnt}</span>}
          </button>
        ))}
      </div>

      <div className="jd-ip-grid">
        {shown.map(f => (
          <div key={f.id} className={`jd-invite-card ${f.invited ? "invited-card" : ""}`}>
            <div className="jd-invite-card-cover">
              <div className="jd-invite-card-ava-wrap">
                <img src={f.avatar} alt={f.name} className="jd-invite-card-ava" />
                {f.online && <span className="jd-invite-online" />}
              </div>
              <button
                className={`jd-invite-invite-btn ${f.invited ? "invited" : ""}`}
                onClick={() => toggleInvite(f.id)}>
                {f.invited ? <><Check size={12} /> Invited</> : <><Plus size={12} /> Invite</>}
              </button>
            </div>
            <div className="jd-invite-card-body">
              <div className="jd-invite-card-name">{f.name}</div>
              <div className="jd-invite-card-role">{f.role}</div>
              <div className="jd-invite-card-meta">
                <span className="jd-invite-rate">{f.rate}</span>
                <span className="jd-invite-score">⭐ 4.9</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="jd-ip-footer">
        <NavLink to="/talent" className="jd-ip-footer-link">
          <UserSearch size={16} />
          View all freelancers on Browse Talent page
          <ArrowRight size={15} />
        </NavLink>
      </div>
    </div>
  );
};

/* ================================================================
   EDIT PANEL
   ================================================================ */
const EditPanel = ({ job, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: job.title,
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    duration: job.duration,
    experience: job.experience,
    location: job.location,
    hiring: job.hiring,
    description: job.description,
    skills: [...job.skills],
  });
  const [newSkill, setNewSkill] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm(p => ({ ...p, skills: [...p.skills, s] }));
      setNewSkill("");
    }
  };
  const removeSkill = sk => setForm(p => ({ ...p, skills: p.skills.filter(s => s !== sk) }));

  return (
    <div className="jd-edit-panel">
      <div className="jd-ep-head">
        <h2>Edit Job Post</h2>
        <div className="jd-ep-actions">
          <button className="jd-ep-cancel" onClick={onCancel}>Cancel</button>
          <button className="jd-ep-save" onClick={() => onSave(form)}>
            <Save size={15} /> Save Changes
          </button>
        </div>
      </div>

      <div className="jd-ep-form">
        <div className="jd-ep-group">
          <label>Job Title *</label>
          <input value={form.title} onChange={e => set("title", e.target.value)}
            placeholder="e.g., Senior Full-Stack Developer" />
        </div>

        <div className="jd-ep-row">
          <div className="jd-ep-group">
            <label>Budget Min ($)</label>
            <input type="number" value={form.budgetMin} onChange={e => set("budgetMin", +e.target.value)} />
          </div>
          <div className="jd-ep-group">
            <label>Budget Max ($)</label>
            <input type="number" value={form.budgetMax} onChange={e => set("budgetMax", +e.target.value)} />
          </div>
        </div>

        <div className="jd-ep-row">
          <div className="jd-ep-group">
            <label>Duration</label>
            <select value={form.duration} onChange={e => set("duration", e.target.value)}>
              {["Less than 1 month","1–3 months","3–6 months","More than 6 months"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="jd-ep-group">
            <label>Experience Level</label>
            <select value={form.experience} onChange={e => set("experience", e.target.value)}>
              {["Entry","Intermediate","Expert"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="jd-ep-row">
          <div className="jd-ep-group">
            <label>Location</label>
            <select value={form.location} onChange={e => set("location", e.target.value)}>
              {["Worldwide","Uzbekistan Only","Central Asia","Remote"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="jd-ep-group">
            <label>Freelancers Needed</label>
            <input type="number" min="1" value={form.hiring} onChange={e => set("hiring", +e.target.value)} />
          </div>
        </div>

        <div className="jd-ep-group">
          <label>Required Skills</label>
          <div className="jd-skill-input-row">
            <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g., React) then press Enter"
              onKeyDown={e => e.key === "Enter" && addSkill()} />
            <button className="jd-skill-add-btn" onClick={addSkill}>
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="jd-skills">
            {form.skills.map(sk => (
              <span key={sk} className="jd-skill">
                {sk}
                <button className="jd-skill-remove" onClick={() => removeSkill(sk)}><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="jd-ep-group">
          <label>Job Description *</label>
          <textarea rows={6} value={form.description}
            onChange={e => set("description", e.target.value)}
            placeholder="Describe the project in detail..." />
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   MAIN COMPONENT (HEADER O'CHIRILGAN)
   ================================================================ */
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

  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Data fetch
  useEffect(() => {
    let active = true;

    const fetchJobData = async () => {
      if (!id) {
        if (active) {
          setJob(MOCK_JOB);
          setProposals(MOCK_PROPOSALS);
          setStatus(MOCK_JOB.status);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const [jobRes, propRes] = await Promise.all([
          getJobById(id),
          getProjectProposals(id),
        ]);
        if (!active) return;

        const fetchedJob = jobRes?.data || jobRes || null;

        if (!fetchedJob) {
          setJob(MOCK_JOB);
          setProposals(MOCK_PROPOSALS);
          setStatus(MOCK_JOB.status);
          setLoading(false);
          return;
        }

        setJob({
          id: fetchedJob.id,
          title: fetchedJob.title,
          status: fetchedJob.status || "active",
          type: fetchedJob.budget_type === "hourly" ? "Hourly" : "Fixed Price",
          location: "Worldwide",
          posted: new Date(fetchedJob.created_at).toLocaleDateString(),
          postedDate: new Date(fetchedJob.created_at).toLocaleDateString(),
          budget: fetchedJob.budget_type === "fixed"
            ? `$${fetchedJob.budget_amount}`
            : `$${fetchedJob.hourly_rate_min} – $${fetchedJob.hourly_rate_max}`,
          budgetMin: fetchedJob.budget_amount || fetchedJob.hourly_rate_min || 0,
          budgetMax: fetchedJob.budget_amount || fetchedJob.hourly_rate_max || 0,
          duration: fetchedJob.project_duration || "N/A",
          experience: fetchedJob.experience_level || "Any",
          hiring: 1,
          proposals: 0,
          invites: 0,
          interviews: 0,
          views: 0,
          skills: fetchedJob.skills || [],
          description: fetchedJob.description || "",
          requirements: [],
          client: MOCK_JOB.client,
        });
        setStatus(fetchedJob.status || "active");

        const fetchedProps = Array.isArray(propRes?.data)
          ? propRes.data
          : Array.isArray(propRes) ? propRes : [];

        const mappedProps = fetchedProps.map(p => ({
          id: p.id,
          avatar: p.freelancer_avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(p.freelancer_name || "F")}&background=random`,
          name: p.freelancer_name || "Freelancer",
          role: "Freelancer",
          rate: `$${p.proposed_price || 0}`,
          score: "N/A",
          shortlisted: p.status === "shortlisted",
          text: p.cover_letter || "",
        }));

        setJob(prev => prev ? { ...prev, proposals: mappedProps.length } : prev);
        setProposals(mappedProps.length > 0 ? mappedProps : MOCK_PROPOSALS);

      } catch (err) {
        console.error("JobDetails fetch error:", err);
        if (active) {
          setJob(MOCK_JOB);
          setProposals(MOCK_PROPOSALS);
          setStatus(MOCK_JOB.status);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchJobData();
    return () => { active = false; };
  }, [id]);

  // Handlers
  const handleSaveJob = useCallback(async (form) => {
    const updatedData = {
      title: form.title,
      description: form.description,
      skills: form.skills,
      experience_level: form.experience,
      project_duration: form.duration,
    };
    if (job?.type === "Fixed Price") {
      updatedData.budget_amount = form.budgetMax || form.budgetMin;
    } else {
      updatedData.hourly_rate_min = form.budgetMin;
      updatedData.hourly_rate_max = form.budgetMax;
    }

    notify("Saving updates...", "info");
    const res = await updateJob(id, updatedData);
    if (res?.success === false) {
      notify(res?.message || "Failed to update", "error");
      return;
    }

    setJob(prev => prev ? {
      ...prev,
      title: form.title,
      duration: form.duration,
      experience: form.experience,
      location: form.location,
      budget: `$${Number(form.budgetMin).toLocaleString()} – $${Number(form.budgetMax).toLocaleString()}`,
      budgetMin: form.budgetMin,
      budgetMax: form.budgetMax,
      hiring: form.hiring,
      description: form.description,
      skills: form.skills,
    } : prev);
    setTab("overview");
    notify("Job post updated successfully!");
  }, [id, job, notify]);

  const handleCloseJob = useCallback(async () => {
    notify("Closing job...", "info");
    const res = await updateJob(id, { status: "closed" });
    if (res?.success === false) {
      notify(res?.message || "Failed to close job", "error");
      return;
    }
    setStatus("closed");
    setShowClose(false);
    notify("Job post has been closed.");
  }, [id, notify]);

  const handleHire = useCallback((name) => notify(`Offer sent to ${name}!`), [notify]);
  const handleSendInvites = useCallback((cnt) => {
    if (cnt === 0) { notify("Please select at least one freelancer.", "error"); return; }
    notify(`${cnt} invitation${cnt !== 1 ? "s" : ""} sent!`);
  }, [notify]);
  const handleShare = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    notify("Link copied to clipboard!");
  }, [notify]);
  const handleBrowseTalent = useCallback(() => navigate("/talent"), [navigate]);

  const onStepClick = (s) => {
    setStep(s);
    if (s === "invite") setTab("invites");
    if (s === "proposals") setTab("proposals");
    if (s === "view") setTab("overview");
  };

  const onTabClick = (t) => {
    setTab(t);
    if (t === "invites") setStep("invite");
    if (t === "proposals") setStep("proposals");
    if (t === "overview" || t === "edit") setStep("view");
  };

  // Loading screen
  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <span>Yuklanmoqda...</span>
    </div>
  );

  // Null check
  if (!job) return (
    <div className="not-found-container">
      <div className="not-found-icon">📋</div>
      <h2>Job topilmadi</h2>
      <p>Bu job mavjud emas yoki o'chirilgan bo'lishi mumkin.</p>
      <button onClick={() => navigate("/client/home")} className="back-btn">
        ← Dashboard ga qaytish
      </button>
    </div>
  );

  const STEPS = [
    { id: "view", label: "View Job Post", cnt: null },
    { id: "invite", label: "Invite Freelancers", cnt: job.invites },
    { id: "proposals", label: "Review Proposals", cnt: job.proposals },
    { id: "hire", label: "Hire", cnt: 0 },
  ];

  const STATS = [
    { icon: <Eye size={18} />, label: "Job Views", value: job.views || "—", delta: null, bg: "#eff6ff", color: "#3b82f6" },
    { icon: <Users size={18} />, label: "Proposals", value: job.proposals, delta: null, bg: "#f0faf0", color: "#14a800" },
    { icon: <MessageCircle size={18} />, label: "Messages", value: 24, delta: null, bg: "#fef9c3", color: "#f59e0b" },
    { icon: <Target size={18} />, label: "Match Rate", value: "92%", delta: "+3%", bg: "#f3e8ff", color: "#7c3aed" },
  ];

  const TILES = [
    { icon: "💵", bg: "#e8f5e0", lbl: "Budget", val: job.budget, sub: job.type },
    { icon: "⏱️", bg: "#e0f2fe", lbl: "Duration", val: job.duration, sub: "Estimated" },
    { icon: "🏆", bg: "#f3e8ff", lbl: "Experience", val: job.experience, sub: "Required" },
    { icon: "🌍", bg: "#fff7ed", lbl: "Location", val: job.location, sub: "Remote OK" },
    { icon: "👥", bg: "#fce7f3", lbl: "Hiring", val: `${job.hiring} freelancers`, sub: "Needed" },
    { icon: "📅", bg: "#ecfdf5", lbl: "Posted", val: job.posted, sub: job.postedDate },
  ];

  return (
    <div className="jd-page">
      {/* STEP BAR */}
      <div className="jd-stepbar">
        <div className="jd-stepbar-inner">
          {STEPS.map((s, i) => (
            <button key={s.id}
              className={`jd-step-btn ${step === s.id ? "active" : ""}`}
              onClick={() => onStepClick(s.id)}>
              {s.label}
              {s.cnt !== null && <span className="jd-step-pill">{s.cnt}</span>}
              {i < STEPS.length - 1 && <span className="jd-step-sep">›</span>}
            </button>
          ))}
          <NavLink to="/talent" className="jd-step-talent-link">
            <UserSearch size={15} /> Browse All Talent <ArrowRight size={13} />
          </NavLink>
        </div>
      </div>

      {/* BODY */}
      <div className="jd-body">
        {/* Header - Job Info */}
        <div className="jd-header">
          <div className="jd-header-left">
            <h1 className="jd-job-title">{job.title}</h1>
            <div className="jd-header-meta">
              <span className={`jd-meta-chip ${status === "active" ? "jd-chip-active" : "jd-chip-closed"}`}>
                {status === "active" ? "Active" : "Closed"}
              </span>
              <span className="jd-meta-chip"><Briefcase size={12} /> {job.type}</span>
              <span className="jd-meta-chip"><Globe size={12} /> {job.location}</span>
              <span className="jd-meta-chip"><Clock size={12} /> Posted {job.posted}</span>
              <span className="jd-meta-chip">ID: {job.id}</span>
            </div>
          </div>
          <div className="jd-header-actions">
            <button className={`jd-hbtn-icon ${saved ? "bookmarked" : ""}`}
              onClick={() => { setSaved(s => !s); notify(saved ? "Removed from saved" : "Job saved!"); }}>
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
            </button>
            <button className="jd-hbtn-icon" onClick={handleShare}><Share2 size={16} /></button>
            <button className="jd-hbtn" onClick={() => onTabClick("edit")}>
              <Edit size={14} /> Edit Post
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="jd-stats-strip">
          {STATS.map(s => (
            <div key={s.label} className="jd-stat-tile">
              <div className="jd-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="jd-stat-content">
                <span className="jd-stat-label">{s.label}</span>
                <span className="jd-stat-value">{s.value}</span>
                {s.delta && <span className="jd-stat-delta up">{s.delta}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="jd-tabs">
          {[
            { id: "overview", icon: <Briefcase size={15} />, label: "Overview" },
            { id: "proposals", icon: <Users size={15} />, label: "Proposals", badge: job.proposals },
            { id: "invites", icon: <Send size={15} />, label: "Invites", badge: job.invites },
            { id: "edit", icon: <Edit size={15} />, label: "Edit Job" },
          ].map(t => (
            <button key={t.id}
              className={`jd-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => onTabClick(t.id)}>
              {t.icon} {t.label}
              {t.badge != null && <span className="jd-tab-badge">{t.badge}</span>}
            </button>
          ))}
          <NavLink to="/talent" className="jd-tab-talent-link">
            <UserSearch size={15} /> Find More Talent
          </NavLink>
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="jd-grid">
            <div>
              <div className="jd-card">
                <div className="jd-info-tiles">
                  {TILES.map(t => (
                    <div key={t.lbl} className="jd-info-tile">
                      <div className="jd-tile-icon" style={{ background: t.bg }}>{t.icon}</div>
                      <div>
                        <div className="jd-tile-lbl">{t.lbl}</div>
                        <div className="jd-tile-val">{t.val}</div>
                        <div className="jd-tile-sub">{t.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="jd-card">
                <div className="jd-card-head"><span className="jd-card-title">Job Description</span></div>
                <div className="jd-card-body">
                  <div className="jd-desc">
                    {(job.description || "").split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </div>
              </div>

              {job.requirements?.length > 0 && (
                <div className="jd-card">
                  <div className="jd-card-head"><span className="jd-card-title">Requirements</span></div>
                  <div className="jd-card-body">
                    <ul className="jd-req-list">
                      {job.requirements.map((r, i) => (
                        <li key={i}><CheckCircle size={15} color="#14a800" /> {r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {job.skills?.length > 0 && (
                <div className="jd-card">
                  <div className="jd-card-head">
                    <span className="jd-card-title">Required Skills</span>
                    <span>{job.skills.length} skills</span>
                  </div>
                  <div className="jd-card-body">
                    <div className="jd-skills">
                      {job.skills.map(sk => <span key={sk} className="jd-skill">{sk}</span>)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className="jd-sidebar">
              <div className="jd-action-card">
                <button className="jd-btn-primary" onClick={() => onTabClick("proposals")}>
                  <Users size={17} /> Review Proposals ({job.proposals})
                </button>
                <button className="jd-btn-outline" onClick={() => onTabClick("invites")}>
                  <Plus size={16} /> Invite Freelancers
                </button>
                <NavLink to="/talent" className="jd-btn-browse-talent">
                  <UserSearch size={16} /> Browse All Talent
                  <ArrowRight size={14} />
                </NavLink>
                <button className="jd-btn-ghost" onClick={() => onTabClick("edit")}>
                  <Edit size={15} /> Edit Job Post
                </button>
                <button className="jd-btn-danger" onClick={() => setShowClose(true)}>
                  <XCircle size={15} /> Close Job
                </button>
                <div className="jd-btn-pair">
                  <button className="jd-btn-sm" onClick={() => { setSaved(s => !s); notify(saved ? "Removed" : "Saved!"); }}>
                    <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
                    {saved ? "Saved" : "Save"}
                  </button>
                  <button className="jd-btn-sm" onClick={handleShare}>
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>

              <div className="jd-client-card">
                <div className="jd-client-card-hd">
                  <h3>About the Client</h3>
                  <button className="jd-client-edit"><Edit size={12} /></button>
                </div>
                <div className="jd-client-profile">
                  <img src={job.client.avatar} alt="client" className="jd-client-ava" />
                  <div>
                    <div className="jd-client-name">{job.client.name}</div>
                    <div className="jd-client-since">Member since {job.client.since}</div>
                  </div>
                </div>
                <div className="jd-client-kpis">
                  <div className="jd-client-kpi">
                    <span className="jd-client-kpi-val">{job.client.jobsPosted}</span>
                    <span className="jd-client-kpi-lbl">Jobs Posted</span>
                  </div>
                  <div className="jd-client-kpi">
                    <span className="jd-client-kpi-val">{job.client.hireRate}%</span>
                    <span className="jd-client-kpi-lbl">Hire Rate</span>
                  </div>
                  <div className="jd-client-kpi">
                    <span className="jd-client-kpi-val">${(job.client.totalSpent/1000).toFixed(1)}k</span>
                    <span className="jd-client-kpi-lbl">Spent</span>
                  </div>
                </div>
                <div className="jd-client-rows">
                  <div className="jd-client-row">
                    <span className="jd-client-row-icon"><DollarSign size={14} /></span>
                    <div>
                      <div className="jd-client-row-lbl">Payment Method</div>
                      <div className={`jd-client-row-val ${job.client.paymentVerified ? "ok" : "warn"}`}>
                        {job.client.paymentVerified ? <><CheckCircle size={13} /> Verified</> : <><AlertCircle size={13} /> Not Verified</>}
                      </div>
                    </div>
                  </div>
                  <div className="jd-client-row">
                    <span className="jd-client-row-icon"><Star size={14} /></span>
                    <div>
                      <div className="jd-client-row-lbl">Rating</div>
                      <div className="jd-client-row-val"><Stars n={job.client.rating} /></div>
                    </div>
                  </div>
                  <div className="jd-client-row">
                    <span className="jd-client-row-icon"><MapPin size={14} /></span>
                    <div>
                      <div className="jd-client-row-lbl">Location</div>
                      <div className="jd-client-row-val">🇺🇿 {job.client.location}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="jd-activity-card">
                <div className="jd-activity-card-hd"><h3>Job Activity</h3></div>
                <div className="jd-activity-rows">
                  {[
                    { lbl: "Proposals", val: job.proposals },
                    { lbl: "Invites Sent", val: job.invites },
                    { lbl: "Interviews", val: job.interviews },
                    { lbl: "Views", val: job.views },
                    { lbl: "Last Activity", val: "2 hours ago" },
                  ].map(r => (
                    <div key={r.lbl} className="jd-activity-row">
                      <span>{r.lbl}</span>
                      <strong>{r.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {tab === "proposals" && <ProposalsPanel proposals={proposals} onHire={handleHire} />}
        {tab === "invites" && <InvitePanel onSend={handleSendInvites} onBrowseTalent={handleBrowseTalent} />}
        {tab === "edit" && <EditPanel job={job} onSave={handleSaveJob} onCancel={() => setTab("overview")} />}
      </div>

      {/* CLOSE JOB MODAL */}
      {showClose && (
        <div className="jd-overlay" onClick={() => setShowClose(false)}>
          <div className="jd-confirm-box" onClick={e => e.stopPropagation()}>
            <div className="jd-confirm-icon"><XCircle size={30} /></div>
            <h3>Close this job post?</h3>
            <p>This will stop accepting new proposals and remove the job from search results.</p>
            <div className="jd-confirm-form">
              <label>Reason (optional)</label>
              <select>
                <option>Found a freelancer through UzWork</option>
                <option>Hired outside UzWork</option>
                <option>Project cancelled</option>
                <option>Budget changed</option>
                <option>Other</option>
              </select>
            </div>
            <div className="jd-confirm-btns">
              <button className="jd-cb-cancel" onClick={() => setShowClose(false)}>Cancel</button>
              <button className="jd-cb-confirm" onClick={handleCloseJob}>
                <XCircle size={15} /> Close Job
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default Landing;