// src/pages/Client/PostJob/PostJob.jsx
// Post a Job — 4-bosqichli wizard
// Backend tayyor bo'lganda:
//   POST /api/jobs        → job yaratish
//   POST /api/jobs/draft  → qoralama saqlash

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Check, X, Plus,
  Lightbulb, Briefcase, Clock, DollarSign,
  FileText, Star, AlertCircle, CheckCircle,
  Rocket, ArrowLeft, Eye,
} from "lucide-react";
import "../Client/css/post.css";

/* ================================================================
   CONSTANTS
   ================================================================ */
const STEPS = [
  { id: 1, label: "Job Details",  sub: "Title & description" },
  { id: 2, label: "Skills",       sub: "Required skills"     },
  { id: 3, label: "Budget",       sub: "Price & duration"    },
  { id: 4, label: "Review",       sub: "Preview & publish"   },
];

const SUGGESTED_SKILLS = {
  development: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "GraphQL", "Python", "REST API", "MongoDB"],
  design:      ["Figma", "UI/UX", "Prototyping", "Adobe XD", "Webflow", "Sketch", "Design Systems"],
  writing:     ["SEO Writing", "Copywriting", "Blog Posts", "Technical Writing", "Proofreading"],
  marketing:   ["Social Media", "Email Marketing", "Google Ads", "SEO", "Content Strategy"],
};

const CATEGORIES = [
  "Web Development", "Mobile Development", "Design & Creative",
  "Writing & Translation", "IT & Networking", "Data Science & AI",
  "Marketing", "Business Consulting", "Video & Animation",
];

const EXP_LEVELS = [
  { id: "entry",    name: "Entry Level",    desc: "Looking for someone new to this field; willing to provide guidance and mentorship." },
  { id: "mid",      name: "Intermediate",   desc: "Looking for substantial experience in this field. Has previous work to show." },
  { id: "expert",   name: "Expert",         desc: "Looking for comprehensive and deep expertise in this field." },
];

const DURATION_OPTIONS = [
  { id: "less1",   icon: "⚡", name: "Quick",    sub: "< 1 month"  },
  { id: "1to3",    icon: "📅", name: "Short",    sub: "1–3 months" },
  { id: "3to6",    icon: "🗓️", name: "Medium",  sub: "3–6 months" },
  { id: "6plus",   icon: "🏗️", name: "Long",    sub: "6+ months"  },
  { id: "ongoing", icon: "♾️", name: "Ongoing", sub: "Recurring"  },
];

const SCOPE_OPTIONS = [
  { id: "small",  icon: "🎯", name: "Small",  sub: "Simple task" },
  { id: "medium", icon: "🚀", name: "Medium", sub: "Moderate"    },
  { id: "large",  icon: "🏢", name: "Large",  sub: "Complex"     },
];

const STEP_TIPS = {
  1: [
    "A clear, specific title attracts more relevant proposals.",
    "Describe exactly what deliverables you expect.",
    "Mention the tech stack or tools if applicable.",
    "Include the purpose and goals of the project.",
  ],
  2: [
    "Add 5–10 skills for the best matching results.",
    "Use industry-standard terms (e.g. 'React' not 'ReactJS').",
    "Sort skills by importance — put must-haves first.",
  ],
  3: [
    "Competitive budgets attract higher-quality proposals.",
    "Fixed price works best for well-defined scopes.",
    "Hourly is better for ongoing or evolving work.",
    "Be honest about timeline — rushed jobs cost more.",
  ],
  4: [
    "Double-check your budget before publishing.",
    "You can edit the job post at any time after publishing.",
    "Jobs with complete details get 3× more proposals.",
  ],
};

/* ================================================================
   INITIAL FORM STATE
   ================================================================ */
const INITIAL = {
  // Step 1
  title:       "",
  category:    "",
  description: "",
  jobType:     "fixed",    // fixed | hourly
  experience:  "",
  // Step 2
  skills:      [],
  // Step 3
  budgetType:  "fixed",   // fixed | range | hourly
  budgetFixed: "",
  budgetMin:   "",
  budgetMax:   "",
  hourlyMin:   "",
  hourlyMax:   "",
  duration:    "",
  scope:       "",
  freelancers: "1",
  // Meta
  visibility:  "public",
};

/* ================================================================
   HELPERS
   ================================================================ */
const Toast = ({ msg, type, onClose }) => msg ? (
  <div className={`pj-toast ${type === "error" ? "error" : ""}`}>
    {type === "error"
      ? <AlertCircle size={16} color="#dc2626" />
      : <CheckCircle size={16} color="#14a800" />}
    <span>{msg}</span>
    <button className="pj-toast-x" onClick={onClose}><X size={13} /></button>
  </div>
) : null;

/* ================================================================
   STEP 1 — Job Details
   ================================================================ */
const Step1 = ({ form, setForm, errors }) => {
  const charLimit = 5000;

  return (
    <div className="pj-card-body">

      {/* Job Title */}
      <div className="pj-form-group">
        <label className="pj-label">
          Job Title <span className="pj-label-req">*</span>
          <span className="pj-label-tip">{form.title.length}/100</span>
        </label>
        <input
          className={`pj-input ${errors.title ? "error" : ""}`}
          placeholder="e.g., Full-Stack Developer for E-commerce Platform"
          value={form.title}
          maxLength={100}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
        />
        {errors.title && <div className="pj-error-msg"><AlertCircle size={13} />{errors.title}</div>}
      </div>

      {/* Category */}
      <div className="pj-form-group">
        <label className="pj-label">
          Category <span className="pj-label-req">*</span>
        </label>
        <select
          className={`pj-select ${errors.category ? "error" : ""}`}
          value={form.category}
          onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
        >
          <option value="">Select a category...</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <div className="pj-error-msg"><AlertCircle size={13} />{errors.category}</div>}
      </div>

      {/* Job type */}
      <div className="pj-form-group">
        <label className="pj-label">Job Type <span className="pj-label-req">*</span></label>
        <div className="pj-type-grid">
          {[
            { id: "fixed",  icon: "📦", name: "Fixed Price",  desc: "Pay a set price for the entire project when complete." },
            { id: "hourly", icon: "⏱️", name: "Hourly Rate",  desc: "Pay per hour worked. Great for ongoing or evolving tasks." },
          ].map(t => (
            <div
              key={t.id}
              className={`pj-type-card ${form.jobType === t.id ? "selected" : ""}`}
              onClick={() => setForm(p => ({ ...p, jobType: t.id }))}
            >
              <span className="pj-type-icon">{t.icon}</span>
              <div className="pj-type-name">{t.name}</div>
              <div className="pj-type-desc">{t.desc}</div>
              <div className="pj-type-check"><Check size={11} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="pj-form-group">
        <label className="pj-label">
          Job Description <span className="pj-label-req">*</span>
          <span className="pj-label-tip">{form.description.length}/{charLimit}</span>
        </label>
        <textarea
          className={`pj-textarea ${errors.description ? "error" : ""}`}
          placeholder="Describe your project in detail. Include:&#10;• What you need done&#10;• The goals and deliverables&#10;• Any specific requirements or constraints&#10;• Preferred tech stack or tools"
          value={form.description}
          maxLength={charLimit}
          rows={8}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        />
        {errors.description && <div className="pj-error-msg"><AlertCircle size={13} />{errors.description}</div>}
      </div>

      {/* Experience level */}
      <div className="pj-form-group">
        <label className="pj-label">Experience Level <span className="pj-label-req">*</span></label>
        <div className="pj-exp-grid">
          {EXP_LEVELS.map(e => (
            <div
              key={e.id}
              className={`pj-exp-item ${form.experience === e.id ? "selected" : ""}`}
              onClick={() => setForm(p => ({ ...p, experience: e.id }))}
            >
              <div className="pj-exp-radio">
                <div className="pj-exp-radio-dot" />
              </div>
              <div className="pj-exp-info">
                <div className="pj-exp-name">{e.name}</div>
                <div className="pj-exp-desc">{e.desc}</div>
              </div>
            </div>
          ))}
        </div>
        {errors.experience && <div className="pj-error-msg" style={{ marginTop: 8 }}><AlertCircle size={13} />{errors.experience}</div>}
      </div>
    </div>
  );
};

/* ================================================================
   STEP 2 — Skills
   ================================================================ */
const Step2 = ({ form, setForm, errors }) => {
  const [input, setInput] = useState("");
  const [activeCat, setActiveCat] = useState("development");

  const addSkill = useCallback((sk) => {
    const s = sk.trim();
    if (!s || form.skills.includes(s) || form.skills.length >= 15) return;
    setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setInput("");
  }, [form.skills, setForm]);

  const removeSkill = useCallback((sk) => {
    setForm(p => ({ ...p, skills: p.skills.filter(x => x !== sk) }));
  }, [setForm]);

  const suggested = SUGGESTED_SKILLS[activeCat] || [];

  return (
    <div className="pj-card-body">
      <div className="pj-form-group">
        <label className="pj-label">
          Required Skills <span className="pj-label-req">*</span>
          <span className="pj-label-tip">{form.skills.length}/15</span>
        </label>

        <div className="pj-skill-input-row">
          <input
            className={`pj-input ${errors.skills ? "error" : ""}`}
            placeholder="Type a skill and press Enter or Add..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill(input))}
          />
          <button className="pj-skill-add" onClick={() => addSkill(input)}>
            <Plus size={14} /> Add
          </button>
        </div>
        {errors.skills && <div className="pj-error-msg"><AlertCircle size={13} />{errors.skills}</div>}

        {form.skills.length > 0 && (
          <div className="pj-skills-wrap" style={{ marginBottom: 18 }}>
            {form.skills.map(sk => (
              <span key={sk} className="pj-skill-tag">
                {sk}
                <button className="pj-skill-remove" onClick={() => removeSkill(sk)}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {Object.keys(SUGGESTED_SKILLS).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: "5px 13px",
                borderRadius: "var(--radius-full)",
                border: `1.5px solid ${activeCat === cat ? "var(--green)" : "var(--border)"}`,
                background: activeCat === cat ? "var(--green-soft)" : "none",
                color: activeCat === cat ? "var(--green)" : "var(--text-3)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font)",
                transition: "all .15s",
                textTransform: "capitalize",
              }}
            >{cat}</button>
          ))}
        </div>

        <div className="pj-suggest-label">Suggested skills</div>
        <div className="pj-suggest-tags">
          {suggested
            .filter(s => !form.skills.includes(s))
            .map(s => (
              <button key={s} className="pj-suggest-tag" onClick={() => addSkill(s)}>
                + {s}
              </button>
            ))}
        </div>
      </div>

      <div className="pj-divider" />

      {/* Number of freelancers */}
      <div className="pj-form-group">
        <label className="pj-label">Number of Freelancers Needed</label>
        <div className="pj-type-grid">
          {[
            { id: "1",  icon: "👤", name: "1 Freelancer", desc: "Single person for the job" },
            { id: "2+", icon: "👥", name: "2+ Freelancers", desc: "Multiple people for larger scope" },
          ].map(t => (
            <div
              key={t.id}
              className={`pj-type-card ${form.freelancers === t.id ? "selected" : ""}`}
              onClick={() => setForm(p => ({ ...p, freelancers: t.id }))}
            >
              <span className="pj-type-icon">{t.icon}</span>
              <div className="pj-type-name">{t.name}</div>
              <div className="pj-type-desc">{t.desc}</div>
              <div className="pj-type-check"><Check size={11} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   STEP 3 — Budget & Timeline
   ================================================================ */
const Step3 = ({ form, setForm, errors }) => {
  return (
    <div className="pj-card-body">

      {/* Budget type */}
      <div className="pj-form-group">
        <label className="pj-label">Payment Structure <span className="pj-label-req">*</span></label>
        <div className="pj-budget-type-grid">
          {[
            { id: "fixed",  icon: "📦", name: "Fixed Price",  desc: "Set total price" },
            { id: "range",  icon: "↔️", name: "Price Range",  desc: "Min–Max budget"  },
            { id: "hourly", icon: "⏱️", name: "Hourly Rate",  desc: "Pay per hour"   },
          ].map(t => (
            <div
              key={t.id}
              className={`pj-budget-type ${form.budgetType === t.id ? "selected" : ""}`}
              onClick={() => setForm(p => ({ ...p, budgetType: t.id }))}
            >
              <div className="pj-budget-type-icon">{t.icon}</div>
              <div className="pj-budget-type-name">{t.name}</div>
              <div className="pj-budget-type-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget input — fixed */}
      {form.budgetType === "fixed" && (
        <div className="pj-form-group">
          <label className="pj-label">Budget <span className="pj-label-req">*</span></label>
          <div className="pj-budget-input-wrap">
            <span className="pj-budget-prefix">$</span>
            <input
              className={`pj-input ${errors.budget ? "error" : ""}`}
              type="number"
              placeholder="e.g. 1500"
              value={form.budgetFixed}
              onChange={e => setForm(p => ({ ...p, budgetFixed: e.target.value }))}
            />
            <span className="pj-budget-suffix">USD</span>
          </div>
          {errors.budget && <div className="pj-error-msg"><AlertCircle size={13} />{errors.budget}</div>}
        </div>
      )}

      {/* Budget — range */}
      {form.budgetType === "range" && (
        <div className="pj-form-group">
          <label className="pj-label">Budget Range <span className="pj-label-req">*</span></label>
          <div className="pj-range-row">
            <div className="pj-budget-input-wrap">
              <span className="pj-budget-prefix">$</span>
              <input
                className={`pj-input ${errors.budget ? "error" : ""}`}
                type="number"
                placeholder="Min"
                value={form.budgetMin}
                onChange={e => setForm(p => ({ ...p, budgetMin: e.target.value }))}
              />
            </div>
            <span className="pj-range-sep">–</span>
            <div className="pj-budget-input-wrap">
              <span className="pj-budget-prefix">$</span>
              <input
                className={`pj-input ${errors.budget ? "error" : ""}`}
                type="number"
                placeholder="Max"
                value={form.budgetMax}
                onChange={e => setForm(p => ({ ...p, budgetMax: e.target.value }))}
              />
            </div>
          </div>
          {errors.budget && <div className="pj-error-msg"><AlertCircle size={13} />{errors.budget}</div>}
        </div>
      )}

      {/* Budget — hourly */}
      {form.budgetType === "hourly" && (
        <div className="pj-form-group">
          <label className="pj-label">Hourly Rate Range <span className="pj-label-req">*</span></label>
          <div className="pj-range-row">
            <div className="pj-budget-input-wrap">
              <span className="pj-budget-prefix">$</span>
              <input
                className={`pj-input ${errors.budget ? "error" : ""}`}
                type="number"
                placeholder="Min/hr"
                value={form.hourlyMin}
                onChange={e => setForm(p => ({ ...p, hourlyMin: e.target.value }))}
              />
              <span className="pj-budget-suffix">/hr</span>
            </div>
            <span className="pj-range-sep">–</span>
            <div className="pj-budget-input-wrap">
              <span className="pj-budget-prefix">$</span>
              <input
                className={`pj-input ${errors.budget ? "error" : ""}`}
                type="number"
                placeholder="Max/hr"
                value={form.hourlyMax}
                onChange={e => setForm(p => ({ ...p, hourlyMax: e.target.value }))}
              />
              <span className="pj-budget-suffix">/hr</span>
            </div>
          </div>
          {errors.budget && <div className="pj-error-msg"><AlertCircle size={13} />{errors.budget}</div>}
        </div>
      )}

      <div className="pj-divider" />

      {/* Duration */}
      <div className="pj-form-group">
        <label className="pj-label">Project Duration <span className="pj-label-req">*</span></label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {DURATION_OPTIONS.map(d => (
            <div
              key={d.id}
              onClick={() => setForm(p => ({ ...p, duration: d.id }))}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 16px",
                border: `2px solid ${form.duration === d.id ? "var(--green)" : "var(--border)"}`,
                background: form.duration === d.id ? "var(--green-soft)" : "var(--surface)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                transition: "all .15s",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 16 }}>{d.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{d.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{d.sub}</div>
              </div>
            </div>
          ))}
        </div>
        {errors.duration && <div className="pj-error-msg" style={{ marginTop: 8 }}><AlertCircle size={13} />{errors.duration}</div>}
      </div>

      {/* Project scope */}
      <div className="pj-form-group">
        <label className="pj-label">Project Scope</label>
        <div className="pj-scope-grid">
          {SCOPE_OPTIONS.map(s => (
            <div
              key={s.id}
              className={`pj-scope-item ${form.scope === s.id ? "selected" : ""}`}
              onClick={() => setForm(p => ({ ...p, scope: s.id }))}
            >
              <div className="pj-scope-icon">{s.icon}</div>
              <div className="pj-scope-name">{s.name}</div>
              <div className="pj-scope-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pj-divider" />

      {/* Visibility */}
      <div className="pj-form-group">
        <label className="pj-label">Visibility</label>
        <div className="pj-type-grid">
          {[
            { id: "public",  icon: "🌍", name: "Public",  desc: "Visible to all freelancers" },
            { id: "private", icon: "🔒", name: "Private", desc: "Invite only — by your choice" },
          ].map(v => (
            <div
              key={v.id}
              className={`pj-type-card ${form.visibility === v.id ? "selected" : ""}`}
              onClick={() => setForm(p => ({ ...p, visibility: v.id }))}
            >
              <span className="pj-type-icon">{v.icon}</span>
              <div className="pj-type-name">{v.name}</div>
              <div className="pj-type-desc">{v.desc}</div>
              <div className="pj-type-check"><Check size={11} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   STEP 4 — Review & Publish
   ================================================================ */
const Step4 = ({ form }) => {
  const getBudgetStr = () => {
    if (form.budgetType === "fixed")  return `$${form.budgetFixed} USD (Fixed Price)`;
    if (form.budgetType === "range")  return `$${form.budgetMin} – $${form.budgetMax} USD`;
    if (form.budgetType === "hourly") return `$${form.hourlyMin} – $${form.hourlyMax}/hr`;
    return "—";
  };

  const getDurationStr = () =>
    DURATION_OPTIONS.find(d => d.id === form.duration)?.name || "—";

  const getExpStr = () =>
    EXP_LEVELS.find(e => e.id === form.experience)?.name || "—";

  return (
    <div className="pj-card-body">
      {/* Title preview */}
      <div style={{
        background: "var(--bg)",
        borderRadius: "var(--radius)",
        padding: "16px 18px",
        marginBottom: 24,
        border: "1px solid var(--border-2)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 6 }}>Job Title</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-head)", lineHeight: 1.3 }}>
          {form.title || "—"}
        </div>
        {form.category && (
          <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", background: "var(--blue-soft)", color: "var(--blue)", borderRadius: "var(--radius-full)", border: "1px solid var(--blue-border)" }}>
              {form.category}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", background: "var(--green-soft)", color: "var(--green)", borderRadius: "var(--radius-full)", border: "1px solid var(--green-border)" }}>
              {form.jobType === "fixed" ? "Fixed Price" : "Hourly"}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="pj-preview-section">
        <div className="pj-preview-section-title">Job Details</div>
        {[
          { key: "Experience Level", val: getExpStr() },
          { key: "Budget",           val: getBudgetStr() },
          { key: "Duration",         val: getDurationStr() },
          { key: "Freelancers",      val: form.freelancers === "1" ? "1 freelancer" : "2+ freelancers" },
          { key: "Visibility",       val: form.visibility === "public" ? "🌍 Public" : "🔒 Private" },
          { key: "Scope",            val: SCOPE_OPTIONS.find(s => s.id === form.scope)?.name || "Not specified" },
        ].map(r => (
          <div key={r.key} className="pj-preview-row">
            <span className="pj-preview-row-key">{r.key}</span>
            <span className="pj-preview-row-val">{r.val}</span>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="pj-preview-section">
        <div className="pj-preview-section-title">Required Skills ({form.skills.length})</div>
        {form.skills.length > 0 ? (
          <div className="pj-skills-wrap">
            {form.skills.map(sk => (
              <span key={sk} className="pj-skill-tag">{sk}</span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--text-4)" }}>No skills added</div>
        )}
      </div>

      {/* Description */}
      <div className="pj-preview-section">
        <div className="pj-preview-section-title">Description</div>
        <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
          {form.description || <span style={{ color: "var(--text-4)" }}>No description provided</span>}
        </div>
      </div>

      {/* Escrow info */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "14px 16px",
        background: "var(--green-soft)",
        border: "1px solid var(--green-border)",
        borderRadius: "var(--radius)",
        marginTop: 8,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
            Escrow Protection
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.55 }}>
            Your payment is held securely in escrow until you approve the final work. You only pay when you're satisfied.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   SIDEBAR CONTENT (changes per step)
   ================================================================ */
const StepSidebar = ({ step, form }) => {  // 'form' is now used below
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const tips = STEP_TIPS[step] || [];

  // Using 'form' to show some stats in the example card
  const skillCount = form?.skills?.length || 0;

  return (
    <div className="pj-sidebar">
      {/* Progress */}
      <div className="pj-progress-card">
        <div className="pj-progress-title">
          Progress
          <span className="pj-progress-pct">{Math.round(((step - 1) / STEPS.length) * 100)}%</span>
        </div>
        <div className="pj-progress-bar-outer">
          <div className="pj-progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="pj-progress-steps">
          {STEPS.map(s => (
            <div key={s.id} className={`pj-progress-step ${step > s.id ? "done" : step === s.id ? "active" : ""}`}>
              <div className="pj-progress-step-icon">
                {step > s.id ? <Check size={10} /> : s.id}
              </div>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="pj-tips-card">
        <div className="pj-tips-head">
          <div className="pj-tips-head-icon"><Lightbulb size={15} /></div>
          <h3>Tips for Step {step}</h3>
        </div>
        <div className="pj-tips-body">
          {tips.map((t, i) => (
            <div key={i} className="pj-tip-item">
              <div className="pj-tip-dot" />
              <div className="pj-tip-text">{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Example / stats - now using form data */}
      <div className="pj-example-card">
        <h3><Star size={13} /> Your Progress</h3>
        <ul className="pj-example-list">
          <li>Skills added: {skillCount}/15</li>
          {form?.title && <li>Title: {form.title.length}/100 chars</li>}
          {form?.description && <li>Description: {form.description.length}/5000 chars</li>}
          <li>Jobs with 5+ skills receive 3× more proposals</li>
          <li>Clear descriptions get 60% faster responses</li>
        </ul>
      </div>
    </div>
  );
};

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
const PostJob = () => {
  const navigate = useNavigate();

  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState(INITIAL);
  const [errors,  setErrors]  = useState({});
  const [toast,   setToast]   = useState(null);
  const [success, setSuccess] = useState(false);

  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── Validation ─────────────────────────────────────────── */
  const validate = useCallback((currentStep) => {
    const e = {};

    if (currentStep === 1) {
      if (!form.title.trim())            e.title       = "Job title is required";
      else if (form.title.length < 10)   e.title       = "Title must be at least 10 characters";
      if (!form.category)                e.category    = "Please select a category";
      if (!form.description.trim())      e.description = "Description is required";
      else if (form.description.length < 50) e.description = "Description must be at least 50 characters";
      if (!form.experience)              e.experience  = "Please select an experience level";
    }

    if (currentStep === 2) {
      if (form.skills.length === 0)      e.skills = "Add at least one skill";
    }

    if (currentStep === 3) {
      if (form.budgetType === "fixed"  && !form.budgetFixed)             e.budget   = "Please enter a budget";
      if (form.budgetType === "range"  && (!form.budgetMin || !form.budgetMax)) e.budget = "Please enter min and max budget";
      if (form.budgetType === "hourly" && (!form.hourlyMin || !form.hourlyMax)) e.budget = "Please enter hourly rate range";
      if (!form.duration)              e.duration = "Please select a project duration";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  /* ── Navigation ─────────────────────────────────────────── */
  const handleNext = () => {
    if (!validate(step)) {
      notify("Please fill in all required fields.", "error");
      return;
    }
    setErrors({});
    if (step < STEPS.length) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (num) => {
    if (num < step) { setStep(num); setErrors({}); }
  };

  /* ── Save Draft ─────────────────────────────────────────── */
  const handleSaveDraft = () => {
    // Backend: POST /api/jobs/draft
    notify("Draft saved! You can continue later from My Jobs.");
  };

  /* ── Publish ────────────────────────────────────────────── */
  const handlePublish = () => {
    if (!validate(step)) {
      notify("Please review all fields before publishing.", "error");
      return;
    }
    // Backend: POST /api/jobs  → { ...form, status: "active" }
    setSuccess(true);
  };

  /* ── Step content config ─────────────────────────────────── */
  const STEP_META = {
    1: { badge: "Step 1 of 4",  title: "Tell us about your job",           desc: "Start with a clear title, category and detailed description." },
    2: { badge: "Step 2 of 4",  title: "What skills are required?",        desc: "Add the key skills a freelancer needs to complete your job." },
    3: { badge: "Step 3 of 4",  title: "Set your budget & timeline",       desc: "Define how much you'll pay and how long the project will take." },
    4: { badge: "Step 4 of 4",  title: "Review your job post",             desc: "Make sure everything looks good before publishing." },
  };

  const meta = STEP_META[step];

  /* ── Success screen ─────────────────────────────────────── */
  if (success) {
    return (
      <div className="pj-page">
        <div className="pj-success">
          <div className="pj-success-icon">
            <Rocket size={36} />
          </div>
          <h1>Job Posted Successfully! 🎉</h1>
          <p>
            Your job <strong>"{form.title}"</strong> is now live and visible to freelancers.
            You'll start receiving proposals shortly.
          </p>
          <div className="pj-success-actions">
            <button className="pj-success-btn-primary" onClick={() => navigate("/client/jobs")}>
              <Briefcase size={16} style={{ display: "inline", marginRight: 6 }} />
              View My Jobs
            </button>
            <button className="pj-success-btn-secondary" onClick={() => { setSuccess(false); setForm(INITIAL); setStep(1); }}>
              Post Another Job
            </button>
            <button className="pj-success-btn-secondary" onClick={() => navigate("/talent")}>
              Browse Talent
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────────── */
  return (
    <div className="pj-page">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="pj-header">
        <div className="pj-header-left">
          <button className="pj-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <div className="pj-header-title">Post a Job</div>
            <div className="pj-header-sub">
              {step < STEPS.length ? `Step ${step} of ${STEPS.length}` : "Review & Publish"}
            </div>
          </div>
        </div>
        <div className="pj-header-right">
          <button className="pj-save-draft" onClick={handleSaveDraft}>
            Save as Draft
          </button>
        </div>
      </header>

      {/* ── Stepper ─────────────────────────────────────────── */}
      <div className="pj-stepper">
        <div className="pj-steps">
          {STEPS.map(s => (
            <div
              key={s.id}
              className={`pj-step ${step === s.id ? "active" : step > s.id ? "done" : ""}`}
              onClick={() => handleStepClick(s.id)}
            >
              <div className="pj-step-num">
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              <div className="pj-step-info">
                <span className="pj-step-label">{s.label}</span>
                <span className="pj-step-sub">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="pj-main">
        {/* Form Card */}
        <div>
          <div className="pj-card" key={step}>
            <div className="pj-card-head">
              <div className="pj-card-step-badge">
                {meta.badge}
              </div>
              <h1 className="pj-card-title">{meta.title}</h1>
              <p className="pj-card-desc">{meta.desc}</p>
            </div>

            {step === 1 && <Step1 form={form} setForm={setForm} errors={errors} />}
            {step === 2 && <Step2 form={form} setForm={setForm} errors={errors} />}
            {step === 3 && <Step3 form={form} setForm={setForm} errors={errors} />}
            {step === 4 && <Step4 form={form} />}

            {/* Nav row */}
            <div className="pj-nav-row">
              <button
                className="pj-btn-back"
                onClick={handleBack}
                style={{ visibility: step === 1 ? "hidden" : "visible" }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {step < STEPS.length ? (
                <button className="pj-btn-next" onClick={handleNext}>
                  Next Step <ChevronRight size={16} />
                </button>
              ) : (
                <button className="pj-btn-publish" onClick={handlePublish}>
                  <Rocket size={16} /> Publish Job
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <StepSidebar step={step} form={form} />
      </div>

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default PostJob;