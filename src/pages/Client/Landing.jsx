
import { useState } from "react";
import {
  Search, Bell, Settings, User, Bookmark, Share2, Edit,
  XCircle, Users, DollarSign, Clock, Globe, Award, Calendar,
  Star, CheckCircle, AlertCircle, MessageSquare, ArrowRight,
  ChevronRight, Briefcase, X, Send, Filter, Moon, HelpCircle,
  Plus, Save, ChevronLeft, ChevronDown, Mail, Phone, MapPin,
  ThumbsUp, Zap, Trophy, Target, TrendingUp, Eye, MessageCircle,
  Download, Upload, MoreHorizontal, Home, FileText, CreditCard,
  LogOut, Menu, Copy, ExternalLink, Check, AlertTriangle
} from "lucide-react";
import "../Client/css/landing.css";

const JOB = {
  id:          1,
  title:       "Full-Stack Web Application Development",
  status:      "active",
  type:        "Fixed Price",
  location:    "Worldwide",
  posted:      "2 days ago",
  postedDate:  "Jan 15, 2024",
  budget:      "$3,000 – $5,000",
  duration:    "1–3 months",
  experience:  "Expert",
  hiring:      "2 freelancers",
  proposals:   18,
  invites:     5,
  views:       142,
  skills:      ["React", "Node.js", "PostgreSQL", "REST API", "TypeScript", "Docker", "AWS", "GraphQL"],
  description: `We are looking for an experienced Full-Stack Developer to build a modern web application for our startup. The ideal candidate should have strong experience with React, Node.js, and PostgreSQL.

The project involves building a complete platform from scratch including user authentication, real-time chat, payment integration, and an admin dashboard. The candidate must be comfortable working independently and delivering high-quality, maintainable code.`,
  requirements: [
    "5+ years of experience with React and Node.js",
    "Strong knowledge of PostgreSQL and database design",
    "Experience with REST API development and WebSocket",
    "Ability to deploy and manage applications on cloud platforms",
    "Excellent communication skills in English or Russian",
  ],
};

const PROPOSALS = [
  {
    id: 1, initials: "AE", name: "Alisher Eshmatov",
    role: "Full-Stack Developer • Tashkent, UZ",
    rate: "$35/hr", score: "98% Match",
    color: "#3b82f6", shortlisted: false,
    text: "I have 6+ years of experience building scalable full-stack applications with React and Node.js. I've worked on similar e-commerce and SaaS platforms and can deliver high-quality code on time. Happy to discuss the project in detail.",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2, initials: "JM", name: "Jasur Mirzaev",
    role: "React / Node.js Expert • Samarkand, UZ",
    rate: "$28/hr", score: "92% Match",
    color: "#f59e0b", shortlisted: true,
    text: "I specialize in full-stack web development with a strong focus on performance and scalability. My recent projects include a fintech dashboard and a real-estate listing platform built with the exact tech stack you've mentioned.",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3, initials: "DK", name: "Doniyor Karimov",
    role: "Senior Backend Engineer • Remote",
    rate: "$40/hr", score: "87% Match",
    color: "#10b981", shortlisted: false,
    text: "With 7 years of backend experience and solid React skills, I'm confident I can deliver exactly what you need. I'm particularly strong in PostgreSQL optimization and API architecture design.",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 4, initials: "MS", name: "Madina Salimova",
    role: "Full-Stack Developer • Tashkent, UZ",
    rate: "$32/hr", score: "94% Match",
    color: "#8b5cf6", shortlisted: false,
    text: "Experienced full-stack developer with 4+ years in React and Node.js. I've built several e-commerce platforms and real-time applications. I'm detail-oriented and deliver clean, maintainable code.",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
];

const INVITE_POOL = [
  { id: 1, initials: "NA", name: "Nilufar Ahmadova",   role: "UI/UX + Frontend Dev", rate: "$30/hr", color: "#8b5cf6", invited: false, avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 2, initials: "BE", name: "Bobur Ergashev",     role: "Full-Stack Developer",  rate: "$32/hr", color: "#ec4899", invited: false, avatar: "https://i.pravatar.cc/150?img=6" },
  { id: 3, initials: "SK", name: "Sarvar Komilov",     role: "Node.js Specialist",    rate: "$25/hr", color: "#14b8a6", invited: true,  avatar: "https://i.pravatar.cc/150?img=7" },
  { id: 4, initials: "ZT", name: "Zulfiya Toshmatova", role: "React Developer",       rate: "$22/hr", color: "#f97316", invited: false, avatar: "https://i.pravatar.cc/150?img=8" },
  { id: 5, initials: "AK", name: "Aziz Karimov",       role: "DevOps Engineer",       rate: "$45/hr", color: "#06b6d4", invited: false, avatar: "https://i.pravatar.cc/150?img=9" },
];

/* ================================================================
   HELPERS
   ================================================================ */
const Stars = ({ count = 4.8 }) => (
  <div className="jd-star-row">
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={13} fill={s <= Math.round(count) ? "#f59e0b" : "none"} color="#f59e0b" />
    ))}
    <span>{count}</span>
  </div>
);

const Toast = ({ msg, type = "success", onClose }) => msg ? (
  <div className={`jd-toast ${type}`}>
    {type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
    <span>{msg}</span>
    <button onClick={onClose} className="jd-toast-close"><X size={14} /></button>
  </div>
) : null;

const SkillTag = ({ skill, onRemove }) => (
  <span className="jd-skill-tag">
    {skill}
    {onRemove && <button onClick={() => onRemove(skill)}><X size={12} /></button>}
  </span>
);

const StatCard = ({ icon, label, value, change, color }) => (
  <div className="jd-stat-card">
    <div className="jd-stat-icon" style={{ background: `${color}15`, color: color }}>{icon}</div>
    <div className="jd-stat-content">
      <span className="jd-stat-label">{label}</span>
      <span className="jd-stat-value">{value}</span>
      {change && <span className={`jd-stat-change ${change > 0 ? 'positive' : 'negative'}`}>
        {change > 0 ? '+' : ''}{change}%
      </span>}
    </div>
  </div>
);

/* ================================================================
   INVITE SECTION
   ================================================================ */
const InviteSection = ({ onSendInvites }) => {
  const [search, setSearch] = useState("");
  const [pool, setPool] = useState(INVITE_POOL);
  const [selectedTab, setSelectedTab] = useState("all");

  const filtered = pool.filter((f) => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.role.toLowerCase().includes(search.toLowerCase())
  );

  const toggleInvite = (id) => {
    setPool(prev => prev.map(f => f.id === id ? { ...f, invited: !f.invited } : f));
  };

  const invitedCount = pool.filter(f => f.invited).length;

  return (
    <div className="jd-invite-section">
      <div className="jd-invite-header">
        <h2>Invite Freelancers</h2>
        <button className="jd-invite-send-btn" onClick={() => onSendInvites(invitedCount)}>
          <Send size={16} />
          Send Invitations {invitedCount > 0 && `(${invitedCount})`}
        </button>
      </div>

      <div className="jd-invite-search">
        <Search size={18} className="jd-search-icon" />
        <input
          type="text"
          placeholder="Search freelancers by name, skill, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="jd-search-filter">
          <Filter size={16} />
          Filter
        </button>
      </div>

      <div className="jd-invite-tabs">
        {['all', 'available', 'invited'].map(tab => (
          <button
            key={tab}
            className={`jd-tab-btn ${selectedTab === tab ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'invited' && invitedCount > 0 && 
              <span className="jd-tab-count">{invitedCount}</span>
            }
          </button>
        ))}
      </div>

      <div className="jd-invite-grid">
        {filtered.map((f) => (
          <div key={f.id} className={`jd-invite-card ${f.invited ? 'invited' : ''}`}>
            <div className="jd-invite-card-header">
              <img src={f.avatar} alt={f.name} className="jd-invite-avatar" />
              <button 
                className={`jd-invite-action-btn ${f.invited ? 'invited' : ''}`}
                onClick={() => toggleInvite(f.id)}
              >
                {f.invited ? <Check size={14} /> : <Plus size={14} />}
                {f.invited ? 'Invited' : 'Invite'}
              </button>
            </div>
            <div className="jd-invite-card-body">
              <h3>{f.name}</h3>
              <p>{f.role}</p>
              <div className="jd-invite-meta">
                <span className="jd-invite-rate">{f.rate}</span>
                <span className="jd-invite-score">⭐ 4.9</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================================================================
   PROPOSALS SECTION
   ================================================================ */
const ProposalsSection = ({ proposals, onHire }) => {
  const [filter, setFilter] = useState("all");
  const [list, setList] = useState(proposals);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const filtered = list.filter(p => {
    if (filter === "shortlisted") return p.shortlisted;
    return true;
  });

  const shortlist = (id) => {
    setList(prev => prev.map(p => 
      p.id === id ? { ...p, shortlisted: !p.shortlisted } : p
    ));
  };

  return (
    <div className="jd-proposals-section">
      <div className="jd-proposals-header">
        <div>
          <h2>Proposals Received</h2>
          <span className="jd-proposals-count">{proposals.length} total</span>
        </div>
        <div className="jd-proposals-actions">
          <button className="jd-export-btn">
            <Download size={14} />
            Export
          </button>
          <button className="jd-filter-btn">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      <div className="jd-proposals-filter">
        {[
          { id: 'all', label: 'All Proposals', count: proposals.length },
          { id: 'shortlisted', label: 'Shortlisted', count: list.filter(p => p.shortlisted).length },
          { id: 'interview', label: 'Interview', count: 3 },
          { id: 'hired', label: 'Hired', count: 0 },
        ].map((f) => (
          <button
            key={f.id}
            className={`jd-filter-chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="jd-filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="jd-proposals-list">
        {filtered.map((p) => (
          <div 
            key={p.id} 
            className={`jd-proposal-item ${selectedProposal === p.id ? 'selected' : ''}`}
            onClick={() => setSelectedProposal(p.id)}
          >
            <div className="jd-proposal-item-header">
              <img src={p.avatar} alt={p.name} className="jd-proposal-avatar" />
              <div className="jd-proposal-item-info">
                <h3>{p.name}</h3>
                <p>{p.role}</p>
              </div>
              <div className="jd-proposal-item-stats">
                <span className="jd-proposal-rate">{p.rate}</span>
                <span className="jd-proposal-match">{p.score}</span>
              </div>
            </div>
            
            <p className="jd-proposal-item-text">{p.text}</p>
            
            <div className="jd-proposal-item-footer">
              <div className="jd-proposal-tags">
                <span className="jd-proposal-tag">⭐ 4.9</span>
                <span className="jd-proposal-tag">📁 15 projects</span>
                <span className="jd-proposal-tag">⏱️ Response time: 1hr</span>
              </div>
              
              <div className="jd-proposal-item-actions">
                <button 
                  className={`jd-shortlist-btn ${p.shortlisted ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); shortlist(p.id); }}
                >
                  <Star size={14} fill={p.shortlisted ? "currentColor" : "none"} />
                  {p.shortlisted ? 'Shortlisted' : 'Shortlist'}
                </button>
                <button className="jd-message-btn" onClick={(e) => e.stopPropagation()}>
                  <MessageSquare size={14} />
                  Message
                </button>
                <button 
                  className="jd-hire-btn"
                  onClick={(e) => { e.stopPropagation(); onHire(p.name); }}
                >
                  <ThumbsUp size={14} />
                  Hire
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
   JOB EDIT SECTION
   ================================================================ */
const JobEditSection = ({ job, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: job.title,
    budget_min: "3000",
    budget_max: "5000",
    duration: job.duration,
    experience: job.experience,
    location: job.location,
    hiring: "2",
    description: job.description,
    skills: job.skills,
  });
  
  const [newSkill, setNewSkill] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addSkill = () => {
    if (newSkill && !form.skills.includes(newSkill)) {
      setForm(p => ({ ...p, skills: [...p.skills, newSkill] }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  return (
    <div className="jd-edit-section">
      <div className="jd-edit-header">
        <h2>Edit Job Post</h2>
        <div className="jd-edit-actions">
          <button className="jd-cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="jd-save-btn" onClick={() => onSave(form)}>
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="jd-edit-form">
        <div className="jd-form-row">
          <div className="jd-form-group full">
            <label>Job Title</label>
            <input 
              type="text" 
              value={form.title} 
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g., Senior Full-Stack Developer Needed"
            />
          </div>
        </div>

        <div className="jd-form-row">
          <div className="jd-form-group">
            <label>Budget Min ($)</label>
            <input 
              type="number" 
              value={form.budget_min} 
              onChange={(e) => set("budget_min", e.target.value)}
              placeholder="3000"
            />
          </div>
          <div className="jd-form-group">
            <label>Budget Max ($)</label>
            <input 
              type="number" 
              value={form.budget_max} 
              onChange={(e) => set("budget_max", e.target.value)}
              placeholder="5000"
            />
          </div>
        </div>

        <div className="jd-form-row">
          <div className="jd-form-group">
            <label>Duration</label>
            <select value={form.duration} onChange={(e) => set("duration", e.target.value)}>
              <option>Less than 1 month</option>
              <option>1–3 months</option>
              <option>3–6 months</option>
              <option>More than 6 months</option>
            </select>
          </div>
          <div className="jd-form-group">
            <label>Experience Level</label>
            <select value={form.experience} onChange={(e) => set("experience", e.target.value)}>
              <option>Entry</option>
              <option>Intermediate</option>
              <option>Expert</option>
            </select>
          </div>
        </div>

        <div className="jd-form-row">
          <div className="jd-form-group">
            <label>Location</label>
            <select value={form.location} onChange={(e) => set("location", e.target.value)}>
              <option>Worldwide</option>
              <option>Uzbekistan Only</option>
              <option>Central Asia</option>
              <option>Remote</option>
            </select>
          </div>
          <div className="jd-form-group">
            <label>Freelancers Needed</label>
            <input 
              type="number" 
              min="1" 
              value={form.hiring} 
              onChange={(e) => set("hiring", e.target.value)}
            />
          </div>
        </div>

        <div className="jd-form-group">
          <label>Skills Required</label>
          <div className="jd-skills-input">
            <input 
              type="text" 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g., React, Python)"
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <button onClick={addSkill}><Plus size={16} /></button>
          </div>
          <div className="jd-skills-list">
            {form.skills.map(skill => (
              <SkillTag key={skill} skill={skill} onRemove={removeSkill} />
            ))}
          </div>
        </div>

        <div className="jd-form-group">
          <label>Job Description</label>
          <textarea 
            rows={6} 
            value={form.description} 
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe your project in detail..."
          />
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
const JobDetails = () => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, proposals, invites, edit
  const [job, setJob] = useState(JOB);
  const [jobStatus, setJobStatus] = useState("active");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveJob = (form) => {
    setJob(prev => ({
      ...prev,
      title: form.title,
      duration: form.duration,
      experience: form.experience,
      location: form.location,
      budget: `$${form.budget_min} – $${form.budget_max}`,
      hiring: `${form.hiring} freelancers`,
      description: form.description,
      skills: form.skills,
    }));
    setActiveTab("overview");
    showToast("Job post updated successfully!");
  };

  const handleInvite = (count) => {
    showToast(`${count} invitation${count !== 1 ? 's' : ''} sent successfully!`);
  };

  const handleHire = (name) => {
    showToast(`Offer sent to ${name}!`);
  };

  const handleCloseJob = () => {
    setJobStatus("closed");
    setShowCloseConfirm(false);
    showToast("Job post has been closed.");
  };

  const stats = [
    { icon: <Eye size={18} />, label: "Views", value: "1.2k", change: 12, color: "#3b82f6" },
    { icon: <Users size={18} />, label: "Proposals", value: job.proposals, change: 8, color: "#10b981" },
    { icon: <MessageCircle size={18} />, label: "Messages", value: "24", change: -5, color: "#f59e0b" },
    { icon: <Target size={18} />, label: "Match Rate", value: "92%", change: 3, color: "#8b5cf6" },
  ];

  return (
    <div className="jd-page">
      {/* Breadcrumb */}
      <div className="jd-breadcrumb">
        <div className="jd-breadcrumb-inner">
          <a href="/">Dashboard</a>
          <ChevronRight size={14} />
          <a href="/jobs">Jobs</a>
          <ChevronRight size={14} />
          <span>{job.title.substring(0, 30)}...</span>
        </div>
      </div>

      {/* Header */}
      <div className="jd-header">
        <div className="jd-header-left">
          <h1 className="jd-title">{job.title}</h1>
          <div className="jd-status-wrapper">
            <span className={`jd-status-badge ${jobStatus}`}>
              {jobStatus === "active" ? "Active" : "Closed"}
            </span>
            <span className="jd-job-id">Job ID: UZ-{job.id}2345</span>
          </div>
        </div>
        
        <div className="jd-header-actions">
          <button className={`jd-save-btn ${saved ? 'saved' : ''}`} onClick={() => setSaved(!saved)}>
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button className="jd-share-btn" onClick={() => showToast("Link copied to clipboard!")}>
            <Share2 size={16} />
            Share
          </button>
          <button className="jd-more-btn">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="jd-stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Navigation Tabs */}
      <div className="jd-main-tabs">
        <button 
          className={`jd-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FileText size={16} />
          Overview
        </button>
        <button 
          className={`jd-tab ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          <Users size={16} />
          Proposals
          <span className="jd-tab-badge">{job.proposals}</span>
        </button>
        <button 
          className={`jd-tab ${activeTab === 'invites' ? 'active' : ''}`}
          onClick={() => setActiveTab('invites')}
        >
          <Send size={16} />
          Invites
          <span className="jd-tab-badge">5</span>
        </button>
        <button 
          className={`jd-tab ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          <Edit size={16} />
          Edit Job
        </button>
      </div>

      {/* Main Content */}
      <div className="jd-main-content">
        {activeTab === 'overview' && (
          <>
            {/* Left Column - Job Details */}
            <div className="jd-content-left">
              {/* Job Info Cards */}
              <div className="jd-info-cards">
                <div className="jd-info-card">
                  <div className="jd-info-icon" style={{ background: '#e8f5e0' }}>
                    <DollarSign size={20} color="#14a800" />
                  </div>
                  <div>
                    <span className="jd-info-label">Budget</span>
                    <span className="jd-info-value">{job.budget}</span>
                    <span className="jd-info-sub">{job.type}</span>
                  </div>
                </div>
                
                <div className="jd-info-card">
                  <div className="jd-info-icon" style={{ background: '#e0f2fe' }}>
                    <Clock size={20} color="#0284c7" />
                  </div>
                  <div>
                    <span className="jd-info-label">Duration</span>
                    <span className="jd-info-value">{job.duration}</span>
                    <span className="jd-info-sub">Estimated</span>
                  </div>
                </div>
                
                <div className="jd-info-card">
                  <div className="jd-info-icon" style={{ background: '#f3e8ff' }}>
                    <Award size={20} color="#7e22ce" />
                  </div>
                  <div>
                    <span className="jd-info-label">Experience</span>
                    <span className="jd-info-value">{job.experience}</span>
                    <span className="jd-info-sub">Level Required</span>
                  </div>
                </div>
                
                <div className="jd-info-card">
                  <div className="jd-info-icon" style={{ background: '#fff7ed' }}>
                    <Globe size={20} color="#c2410c" />
                  </div>
                  <div>
                    <span className="jd-info-label">Location</span>
                    <span className="jd-info-value">{job.location}</span>
                    <span className="jd-info-sub">Remote OK</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="jd-content-card">
                <h3>Job Description</h3>
                <div className="jd-description">
                  {job.description.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="jd-content-card">
                <h3>Requirements</h3>
                <ul className="jd-requirements-list">
                  {job.requirements.map((req, i) => (
                    <li key={i}>
                      <CheckCircle size={16} color="#14a800" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div className="jd-content-card">
                <h3>Required Skills</h3>
                <div className="jd-skills-grid">
                  {job.skills.map(skill => (
                    <SkillTag key={skill} skill={skill} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="jd-content-right">
              {/* Client Info */}
              <div className="jd-sidebar-card">
                <div className="jd-sidebar-header">
                  <h3>About the Client</h3>
                  <button className="jd-edit-small">
                    <Edit size={12} />
                  </button>
                </div>
                
                <div className="jd-client-info">
                  <div className="jd-client-avatar">
                    <img src="https://i.pravatar.cc/100?img=8" alt="Client" />
                  </div>
                  <div className="jd-client-details">
                    <h4>TechCorp Solutions</h4>
                    <p>Member since Jan 2022</p>
                  </div>
                </div>

                <div className="jd-client-stats">
                  <div className="jd-client-stat">
                    <span>Jobs Posted</span>
                    <strong>42</strong>
                  </div>
                  <div className="jd-client-stat">
                    <span>Hire Rate</span>
                    <strong>78%</strong>
                  </div>
                  <div className="jd-client-stat">
                    <span>Spent</span>
                    <strong>$24.8k</strong>
                  </div>
                </div>

                <div className="jd-client-meta">
                  <div className="jd-client-meta-item">
                    <MapPin size={14} />
                    <span>Tashkent, Uzbekistan</span>
                  </div>
                  <div className="jd-client-meta-item">
                    <Star size={14} />
                    <Stars count={4.8} />
                  </div>
                  <div className="jd-client-meta-item">
                    <CheckCircle size={14} color="#14a800" />
                    <span className="verified">Payment Verified</span>
                  </div>
                </div>
              </div>

              {/* Job Activity */}
              <div className="jd-sidebar-card">
                <h3>Job Activity</h3>
                <div className="jd-activity-list">
                  <div className="jd-activity-item">
                    <span>Proposals</span>
                    <strong>{job.proposals}</strong>
                  </div>
                  <div className="jd-activity-item">
                    <span>Invites Sent</span>
                    <strong>5</strong>
                  </div>
                  <div className="jd-activity-item">
                    <span>Interviews</span>
                    <strong>3</strong>
                  </div>
                  <div className="jd-activity-item">
                    <span>Views</span>
                    <strong>{job.views}</strong>
                  </div>
                  <div className="jd-activity-item">
                    <span>Posted</span>
                    <strong>{job.posted}</strong>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="jd-sidebar-card">
                <h3>Quick Actions</h3>
                <div className="jd-quick-actions">
                  <button className="jd-quick-action" onClick={() => setActiveTab('proposals')}>
                    <Users size={16} />
                    View Proposals
                  </button>
                  <button className="jd-quick-action" onClick={() => setActiveTab('invites')}>
                    <Send size={16} />
                    Send Invites
                  </button>
                  <button className="jd-quick-action" onClick={() => setActiveTab('edit')}>
                    <Edit size={16} />
                    Edit Job
                  </button>
                  <button className="jd-quick-action danger" onClick={() => setShowCloseConfirm(true)}>
                    <XCircle size={16} />
                    Close Job
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'proposals' && (
          <ProposalsSection proposals={PROPOSALS} onHire={handleHire} />
        )}

        {activeTab === 'invites' && (
          <InviteSection onSendInvites={handleInvite} />
        )}

        {activeTab === 'edit' && (
          <JobEditSection 
            job={job} 
            onSave={handleSaveJob}
            onCancel={() => setActiveTab('overview')}
          />
        )}
      </div>

      {/* Close Job Confirmation Modal */}
      {showCloseConfirm && (
        <div className="jd-modal-overlay" onClick={() => setShowCloseConfirm(false)}>
          <div className="jd-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="jd-confirm-icon danger">
              <XCircle size={32} />
            </div>
            <h3>Close this job?</h3>
            <p>This will stop accepting new proposals and remove the job from search results. You can reopen it later.</p>
            
            <div className="jd-confirm-actions">
              <button className="jd-cancel-btn" onClick={() => setShowCloseConfirm(false)}>
                Cancel
              </button>
              <button className="jd-confirm-btn danger" onClick={handleCloseJob}>
                Yes, Close Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast 
          msg={toast.msg} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default JobDetails;