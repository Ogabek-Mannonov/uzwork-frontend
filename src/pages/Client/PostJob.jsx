// src/pages/Client/PostJob/PostJob.jsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft, ChevronRight, Check, X, Plus,
  Lightbulb, Briefcase, Clock, DollarSign,
  FileText, Star, AlertCircle, CheckCircle,
  Rocket, ArrowLeft, Eye, Paperclip, File, Upload, Trash2
} from "lucide-react";
import "../Client/css/post.css";
import { createJob, getJobById, updateJob } from "../../api/jobs";
import { uploadFile } from "../../api/common";

/* ================================================================
   CONSTANTS
   ================================================================ */
const STEPS = [
  { id: 1, key: "details" },
  { id: 2, key: "skills"  },
  { id: 3, key: "budget"  },
  { id: 4, key: "review"  },
];

const SUGGESTED_SKILLS = {
  development: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "GraphQL", "Python", "REST API", "MongoDB"],
  design:      ["Figma", "UI/UX", "Prototyping", "Adobe XD", "Webflow", "Sketch", "Design Systems"],
  writing:     ["SEO Writing", "Copywriting", "Blog Posts", "Technical Writing", "Proofreading"],
  marketing:   ["Social Media", "Email Marketing", "Google Ads", "SEO", "Content Strategy"],
};

const COMMON_SKILLS = [
  "React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "GraphQL", "Python", "REST API", "MongoDB",
  "JavaScript", "HTML5", "CSS3", "Next.js", "Vue.js", "Angular", "PHP", "Laravel", "MySQL", "Redis",
  "Flutter", "React Native", "Swift", "Kotlin", "Java", "C#", "C++", "Unity", "Unreal Engine",
  "Go", "Rust", "Ruby on Rails", "Django", "Flask", "Spring Boot", "ASP.NET", "Kubernetes", "Azure", "Google Cloud",
  "Figma", "UI/UX Design", "Prototyping", "Adobe XD", "Webflow", "Sketch", "Design Systems",
  "Photoshop", "Illustrator", "Indesign", "After Effects", "Premiere Pro", "3D Modeling", "Blender",
  "Motion Graphics", "Logo Design", "Branding", "Typography", "Color Theory", "Vector Art",
  "Social Media Marketing", "Email Marketing", "Google Ads", "Facebook Ads", "Instagram Marketing", 
  "SEO", "SEM", "Content Strategy", "Growth Hacking", "Affiliate Marketing",
  "SEO Writing", "Copywriting", "Blog Posts", "Technical Writing", "Proofreading", "Translation", 
  "Transcription", "Creative Writing", "Grant Writing", "Ghostwriting",
  "Machine Learning", "Data Science", "Artificial Intelligence", "Natural Language Processing", "Computer Vision",
  "Data Analysis", "Big Data", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Tableau", "Power BI",
  "Project Management", "Agile", "Scrum", "Product Management", "QA Testing", "Cyber Security",
  "Data Entry", "Virtual Assistant", "Customer Support", "Sales", "Business Analysis", "Financial Modeling",
  "Blockchain", "Solidity", "Web3", "Smart Contracts", "Crypto", "Toptal", "Upwork Skills"
].sort();

const CATEGORIES = [
  "Web Development", "Mobile Development", "Design & Creative",
  "Writing & Translation", "IT & Networking", "Data Science & AI",
  "Marketing", "Business Consulting", "Video & Animation",
];

const EXP_LEVELS = [
  { id: "entry"  },
  { id: "mid"    },
  { id: "expert" },
];

const DURATION_OPTIONS = [
  { id: "less1"   },
  { id: "1to3"    },
  { id: "3to6"    },
  { id: "6plus"   },
  { id: "ongoing" },
];

const SCOPE_OPTIONS = [
  { id: "small"  },
  { id: "medium" },
  { id: "large"  },
];

/* ================================================================
   INITIAL FORM STATE
   ================================================================ */
const INITIAL = {
  title: "",
  category: "",
  description: "",
  attachments: [],
  jobType: "fixed",
  experience: "mid",
  skills: [],
  budgetType: "fixed",
  budgetFixed: "",
  budgetMin: "",
  budgetMax: "",
  hourlyMin: "",
  hourlyMax: "",
  duration: "1to3",
  scope: "medium",
  freelancers: "1",
  visibility: "public",
  currency: "USD",
};

/* ================================================================
   HELPERS
   ================================================================ */
const PjToast = ({ msg, type, onClose }) => msg ? (
  <div className={`pj-toast ${type === "error" ? "error" : ""}`}>
    {type === "error"
      ? <AlertCircle size={16} color="#ef4444" />
      : <CheckCircle size={16} color="#3b82f6" />}
    <span>{msg}</span>
    <button className="pj-toast-x" onClick={onClose}><X size={13} /></button>
  </div>
) : null;


/* ================================================================
   STEP 1 — Job Details
   ================================================================ */
const PjStep1 = ({ form, setForm, errors }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadFile(formData);
        if (res?.success) {
          setForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, {
              url: res.data.url,
              name: file.name,
              size: file.size,
              type: file.type
            }]
          }));
        }
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="pj-card-body">
      <div className="pj-form-group">
        <label className="pj-label">{t('postJob.step1.jobTitle')} <span className="pj-label-req">*</span></label>
        <input
          className={`pj-input ${errors.title ? "error" : ""}`}
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder={t('postJob.step1.titlePlaceholder')}
          maxLength={100}
        />
        {errors.title && <div className="pj-error-msg"><AlertCircle size={13} />{errors.title}</div>}
      </div>

      <div className="pj-form-group">
        <label className="pj-label">{t('postJob.step1.category')} <span className="pj-label-req">*</span></label>
        <select
          className={`pj-select ${errors.category ? "error" : ""}`}
          value={form.category}
          onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
        >
          <option value="">{t('postJob.step1.selectCategory')}</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{t(`postJob.categories.${c}`)}</option>
          ))}
        </select>
        {errors.category && <div className="pj-error-msg"><AlertCircle size={13} />{errors.category}</div>}
      </div>

      <div className="pj-form-group">
        <label className="pj-label">{t('postJob.step1.jobType')} <span className="pj-label-req">*</span></label>
        <div className="pj-type-grid">
          <div
            className={`pj-type-card ${form.jobType === "fixed" ? "selected" : ""}`}
            onClick={() => setForm(p => ({ ...p, jobType: "fixed" }))}
          >
            <span className="pj-type-icon"><DollarSign size={24} /></span>
            <div className="pj-type-name">{t('postJob.step1.fixedType.name')}</div>
            <div className="pj-type-desc">{t('postJob.step1.fixedType.desc', "Loyiha uchun bir martalik ruxsat etilgan narx to'lash.")}</div>
            <div className="pj-type-check"><Check size={11} /></div>
          </div>
          <div
            className={`pj-type-card ${form.jobType === "hourly" ? "selected" : ""}`}
            onClick={() => setForm(p => ({ ...p, jobType: "hourly" }))}
          >
            <span className="pj-type-icon"><Clock size={24} /></span>
            <div className="pj-type-name">{t('postJob.step1.hourlyType.name')}</div>
            <div className="pj-type-desc">{t('postJob.step1.hourlyType.desc', "Freelancer ishlagan soatiga qarab haq to'lash.")}</div>
            <div className="pj-type-check"><Check size={11} /></div>
          </div>
        </div>
      </div>


      <div className="pj-form-group">
        <label className="pj-label">{t('postJob.step1.description')} <span className="pj-label-req">*</span></label>
        <textarea
          className={`pj-textarea ${errors.description ? "error" : ""}`}
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder={t('postJob.step1.descPlaceholder')}
          maxLength={5000}
        />
        <div className="pj-textarea-foot">
          {errors.description ? (
            <div className="pj-error-msg"><AlertCircle size={13} />{errors.description}</div>
          ) : <span />}
          <span className="pj-char-count">{form.description.length}/5000</span>
        </div>
      </div>

      <div className="pj-form-group">
        <label className="pj-label">{t('postJob.step1.attachments')}</label>
        <div className="pj-drop-zone">
          <input
            type="file"
            id="pj-file-input"
            multiple
            hidden
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
          <label htmlFor="pj-file-input" className={`pj-drop-label ${uploading ? "uploading" : ""}`}>
            <div className="pj-drop-icon-wrap">
              {uploading ? <div className="loading-spinner small"></div> : <Upload size={24} />}
            </div>
            <div className="pj-drop-text">
              <span className="pj-drop-main">{t('postJob.step1.uploadMain')}</span>
              <span className="pj-drop-sub">{t('postJob.step1.uploadSub')}</span>
            </div>
            <div className="pj-drop-info">
              {t('postJob.step1.maxSize')} • {t('postJob.step1.docType')}
            </div>
          </label>
        </div>

        {form.attachments.length > 0 && (
          <div className="pj-file-pills">
            {form.attachments.map((file, idx) => (
              <div key={idx} className="pj-file-pill">
                <File size={14} className="pj-pill-icon" />
                <div className="pj-pill-main">
                  <span className="pj-pill-name" title={file.name}>{file.name}</span>
                  <span className="pj-pill-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button className="pj-pill-remove" onClick={() => removeFile(idx)}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pj-divider" />
    </div>
  );
};

/* ================================================================
   STEP 2 — Skills
   ================================================================ */
const PjStep2 = ({ form, setForm, errors }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [activeCat, setActiveCat] = useState("development");
  const [showSuggest, setShowSuggest] = useState(false);

  const addSkill = useCallback((sk) => {
    const s = sk.trim();
    if (!s || form.skills.includes(s) || form.skills.length >= 15) return;
    setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setInput("");
    setShowSuggest(false);
  }, [form.skills, setForm]);

  const removeSkill = useCallback((sk) => {
    setForm(p => ({ ...p, skills: p.skills.filter(x => x !== sk) }));
  }, [setForm]);

  const suggested = SUGGESTED_SKILLS[activeCat] || [];

  const filtered = input.trim().length > 0 
    ? COMMON_SKILLS.filter(s => 
        s.toLowerCase().includes(input.toLowerCase()) && 
        !form.skills.includes(s)
      ).slice(0, 10)
    : [];

  return (
    <div className="pj-card-body">
      <div className="pj-form-group">
        <label className="pj-label">
          {t('postJob.step2.requiredSkills')} <span className="pj-label-req">*</span>
          <span className="pj-label-tip">{form.skills.length}/15</span>
        </label>

        <div className="pj-skill-input-row" style={{ position: "relative" }}>
          <div className="pj-skill-input-container">
            <input
              className={`pj-input ${errors.skills ? "error" : ""}`}
              placeholder={t('postJob.step2.skillsPlaceholder')}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                setShowSuggest(true);
              }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill(input);
                }
              }}
            />
            {showSuggest && filtered.length > 0 && (
              <div className="pj-suggest-dropdown">
                {filtered.map(s => (
                  <div 
                    key={s} 
                    className="pj-suggest-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addSkill(s);
                    }}
                  >
                    <div className="pj-suggest-item-icon">{s[0].toUpperCase()}</div>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="pj-skill-add" onClick={() => addSkill(input)}>
            <Plus size={14} /> {t('postJob.step2.add')}
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

        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {Object.keys(SUGGESTED_SKILLS).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: "5px 13px",
                borderRadius: "var(--pj-radius-full)",
                border: `1.5px solid ${activeCat === cat ? "var(--pj-blue)" : "var(--pj-border)"}`,
                background: activeCat === cat ? "var(--pj-blue-soft)" : "none",
                color: activeCat === cat ? "var(--pj-blue)" : "var(--pj-text-3)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--pj-font)",
                transition: "all .15s",
                textTransform: "capitalize",
              }}
            >{cat}</button>
          ))}
        </div>

        <div className="pj-suggest-label">{t('postJob.step2.suggested')}</div>
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

      <div className="pj-form-group">
        <label className="pj-label">{t('postJob.step2.freelancersCount')}</label>
        <div className="pj-type-grid">
          {[
            { id: "1",  icon: "👤" },
            { id: "2+", icon: "👥" },
          ].map(t_obj => (
            <div
              key={t_obj.id}
              className={`pj-type-card ${form.freelancers === t_obj.id ? "selected" : ""}`}
              onClick={() => setForm(p => ({ ...p, freelancers: t_obj.id }))}
            >
              <span className="pj-type-icon">{t_obj.icon}</span>
              <div className="pj-type-name">{t(`postJob.step2.count.${t_obj.id === "1" ? "1" : "2plus"}.name`)}</div>
              <div className="pj-type-desc">{t(`postJob.step2.count.${t_obj.id === "1" ? "1" : "2plus"}.desc`)}</div>
              <div className="pj-type-check"><Check size={11} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PjStep3 = ({ form, setForm, errors }) => {
  const { t } = useTranslation();
  return (
    <div className="pj-card-body">
      <div className="pj-form-group">
        <label className="pj-label">{t('postJob.step3.paymentStructure')} <span className="pj-label-req">*</span></label>
        <div className="pj-budget-type-grid">
          {[
            { id: "fixed",  icon: "📦" },
            { id: "range",  icon: "↔️" },
            { id: "hourly", icon: "⏱️" },
          ].map(t_obj => (
            <div
              key={t_obj.id}
              className={`pj-budget-type ${form.budgetType === t_obj.id ? "selected" : ""}`}
              onClick={() => setForm(p => ({ ...p, budgetType: t_obj.id }))}
            >
              <div className="pj-budget-type-icon">{t_obj.icon}</div>
              <div className="pj-budget-type-name">{t(`postJob.step3.types.${t_obj.id}.name`)}</div>
              <div className="pj-budget-type-desc">{t(`postJob.step3.types.${t_obj.id}.desc`)}</div>
            </div>
          ))}
        </div>
      </div>

      {form.budgetType === "fixed" && (
        <div className="pj-form-group">
          <label className="pj-label">{t('postJob.step3.budget')} <span className="pj-label-req">*</span></label>
          <div className="pj-budget-input-wrap">
            <select 
              className="pj-currency-select"
              value={form.currency}
              onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
            >
              <option value="USD">USD ($)</option>
              <option value="UZS">UZS (so'm)</option>
              <option value="RUB">RUB (₽)</option>
            </select>
            <input
              className={`pj-input ${errors.budget ? "error" : ""}`}
              type="number"
              placeholder="e.g. 1500"
              value={form.budgetFixed}
              onChange={e => setForm(p => ({ ...p, budgetFixed: e.target.value }))}
            />
          </div>
          {errors.budget && <div className="pj-error-msg"><AlertCircle size={13} />{errors.budget}</div>}
        </div>
      )}

      {form.budgetType === "range" && (
        <div className="pj-form-group">
          <label className="pj-label">{t('postJob.step3.budgetRange')} <span className="pj-label-req">*</span></label>
          <div className="pj-range-row">
            <div className="pj-budget-input-wrap">
              <select 
                className="pj-currency-select"
                value={form.currency}
                onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
              >
                <option value="USD">$</option>
                <option value="UZS">so'm</option>
                <option value="RUB">₽</option>
              </select>
              <input
                className={`pj-input ${errors.budget ? "error" : ""}`}
                type="number"
                placeholder={t('postJob.step3.min')}
                value={form.budgetMin}
                onChange={e => setForm(p => ({ ...p, budgetMin: e.target.value }))}
              />
            </div>
            <span className="pj-range-sep">–</span>
            <div className="pj-budget-input-wrap">
              <input
                className={`pj-input ${errors.budget ? "error" : ""}`}
                type="number"
                placeholder={t('postJob.step3.max')}
                value={form.budgetMax}
                onChange={e => setForm(p => ({ ...p, budgetMax: e.target.value }))}
              />
              <span className="pj-budget-suffix">{form.currency}</span>
            </div>
          </div>
          {errors.budget && <div className="pj-error-msg"><AlertCircle size={13} />{errors.budget}</div>}
        </div>
      )}

      {form.budgetType === "hourly" && (
        <div className="pj-form-group">
          <label className="pj-label">{t('postJob.step3.hourlyRange')} <span className="pj-label-req">*</span></label>
          <div className="pj-range-row">
            <div className="pj-budget-input-wrap">
              <span className="pj-budget-prefix">$</span>
              <input
                className={`pj-input ${errors.budget ? "error" : ""}`}
                type="number"
                placeholder={t('postJob.step3.minHr')}
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
                placeholder={t('postJob.step3.maxHr')}
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

      <div className="pj-form-group">
        <label className="pj-label">{t('postJob.step3.duration')} <span className="pj-label-req">*</span></label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {DURATION_OPTIONS.map(d => (
            <div
              key={d.id}
              onClick={() => setForm(p => ({ ...p, duration: d.id }))}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 16px",
                border: `2px solid ${form.duration === d.id ? "var(--pj-blue)" : "var(--pj-border)"}`,
                background: form.duration === d.id ? "var(--pj-blue-soft)" : "var(--pj-surface)",
                borderRadius: "var(--pj-radius)",
                cursor: "pointer",
                transition: "all .15s",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 16 }}>{t(`postJob.step3.durations.${d.id}.icon`)}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pj-text)" }}>{t(`postJob.step3.durations.${d.id}.name`)}</div>
                <div style={{ fontSize: 11, color: "var(--pj-text-3)" }}>{t(`postJob.step3.durations.${d.id}.sub`)}</div>
              </div>
            </div>
          ))}
        </div>
        {errors.duration && <div className="pj-error-msg" style={{ marginTop: 8 }}><AlertCircle size={13} />{errors.duration}</div>}
      </div>

      <div className="pj-form-group">
        <label className="pj-label">{t('postJob.step3.scope')}</label>
        <div className="pj-scope-grid">
          {SCOPE_OPTIONS.map(s => (
            <div
              key={s.id}
              className={`pj-scope-item ${form.scope === s.id ? "selected" : ""}`}
              onClick={() => setForm(p => ({ ...p, scope: s.id }))}
            >
              <div className="pj-scope-icon">{t(`postJob.step3.scopes.${s.id}.icon`)}</div>
              <div className="pj-scope-name">{t(`postJob.step3.scopes.${s.id}.name`)}</div>
              <div className="pj-scope-sub">{t(`postJob.step3.scopes.${s.id}.sub`)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pj-divider" />

      <div className="pj-form-group">
        <label className="pj-label">{t('postJob.step3.visibility')}</label>
        <div className="pj-type-grid">
          {[
            { id: "public",  icon: "🌍" },
            { id: "private", icon: "🔒" },
          ].map(v => (
            <div
              key={v.id}
              className={`pj-type-card ${form.visibility === v.id ? "selected" : ""}`}
              onClick={() => setForm(p => ({ ...p, visibility: v.id }))}
            >
              <span className="pj-type-icon">{v.icon}</span>
              <div className="pj-type-name">{t(`postJob.step3.vis.${v.id}.name`)}</div>
              <div className="pj-type-desc">{t(`postJob.step3.vis.${v.id}.desc`)}</div>
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
const PjStep4 = ({ form }) => {
  const { t } = useTranslation();
  const getBudgetStr = () => {
    const symbols = { USD: "$", UZS: "so'm", RUB: "₽" };
    const s = symbols[form.currency] || "$";
    
    if (form.budgetType === "fixed") {
      return form.currency === "USD" 
        ? `${s}${form.budgetFixed} USD (${t('postJob.step3.types.fixed.name')})`
        : `${form.budgetFixed} ${s} (${t('postJob.step3.types.fixed.name')})`;
    }
    if (form.budgetType === "range") {
      return form.currency === "USD"
        ? `${s}${form.budgetMin} – ${s}${form.budgetMax} USD`
        : `${form.budgetMin} – ${form.budgetMax} ${s}`;
    }
    if (form.budgetType === "hourly") {
      return form.currency === "USD"
        ? `${s}${form.hourlyMin} – ${s}${form.hourlyMax}/hr`
        : `${form.hourlyMin} – ${form.hourlyMax} ${s}/hr`;
    }
    return "—";
  };

  const getDurationStr = () =>
    t(`postJob.step3.durations.${form.duration}.name`) || "—";

  const getExpStr = () =>
    t(`postJob.step1.exp.${form.experience}.name`) || "—";

  return (
    <div className="pj-card-body">
      <div style={{
        background: "var(--pj-bg)",
        borderRadius: "var(--pj-radius)",
        padding: "16px 18px",
        marginBottom: 24,
        border: "1px solid var(--pj-border-2)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "var(--pj-text-4)", marginBottom: 6 }}>{t('postJob.step1.jobTitle')}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--pj-text)", fontFamily: "var(--pj-font-head)", lineHeight: 1.3 }}>
          {form.title || "—"}
        </div>
        {form.category && (
          <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", background: "var(--pj-blue-soft)", color: "var(--pj-blue)", borderRadius: "var(--pj-radius-full)", border: "1px solid var(--pj-blue-border)" }}>
              {t(`postJob.categories.${form.category}`)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", background: "var(--pj-green-soft)", color: "var(--pj-green)", borderRadius: "var(--pj-radius-full)", border: "1px solid var(--pj-green-border)" }}>
              {form.jobType === "fixed" ? t('postJob.step3.types.fixed.name') : t('postJob.step3.types.hourly.name')}
            </span>
          </div>
        )}
      </div>

      <div className="pj-preview-section">
        <div className="pj-preview-section-title">{t('postJob.step4.detailsTitle')}</div>
        {[
          { key: t('postJob.step1.experience'), val: getExpStr() },
          { key: t('postJob.step3.budget'),           val: getBudgetStr() },
          { key: t('postJob.step3.duration'),         val: getDurationStr() },
          { key: t('postJob.step2.freelancersCount'),      val: form.freelancers === "1" ? t('postJob.step2.count.1.name') : t('postJob.step2.count.2plus.name') },
          { key: t('postJob.step3.visibility'),       val: form.visibility === "public" ? `🌍 ${t('postJob.step3.vis.public.name')}` : `🔒 ${t('postJob.step3.vis.private.name')}` },
          { key: t('postJob.step3.scope'),            val: t(`postJob.step3.scopes.${form.scope}.name`) || t('postJob.step4.notSpecified') },
          { key: t('postJob.step1.attachments'),      val: form.attachments.length > 0 ? `${form.attachments.length} ${t('postJob.sidebar.skillsAdded').toLowerCase()}` : "—" },
        ].map(r => (
          <div key={r.key} className="pj-preview-row">
            <span className="pj-preview-row-key">{r.key}</span>
            <span className="pj-preview-row-val">{r.val}</span>
          </div>
        ))}
      </div>

      <div className="pj-preview-section">
        <div className="pj-preview-section-title">{t('postJob.step4.skillsTitle')} ({form.skills.length})</div>
        {form.skills.length > 0 ? (
          <div className="pj-skills-wrap">
            {form.skills.map(sk => (
              <span key={sk} className="pj-skill-tag">{sk}</span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--pj-text-4)" }}>{t('postJob.step4.noSkills')}</div>
        )}
      </div>

      <div className="pj-preview-section">
        <div className="pj-preview-section-title">{t('postJob.step4.descriptionTitle')}</div>
        <div style={{ fontSize: 14, color: "var(--pj-text-2)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
          {form.description || <span style={{ color: "var(--pj-text-4)" }}>{t('postJob.step4.noDesc')}</span>}
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "14px 16px",
        background: "var(--pj-blue-soft)",
        border: "1px solid var(--pj-blue-border)",
        borderRadius: "var(--pj-radius)",
        marginTop: 8,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pj-text)", marginBottom: 3 }}>
            {t('postJob.step4.escrowTitle')}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--pj-text-3)", lineHeight: 1.55 }}>
            {t('postJob.step4.escrowDesc')}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   SIDEBAR CONTENT
   ================================================================ */
const PjStepSidebar = ({ step, form }) => {
  const { t } = useTranslation();
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const tips = t(`postJob.tips.${step}`, { returnObjects: true }) || [];
  const skillCount = form?.skills?.length || 0;

  return (
    <div className="pj-sidebar">
      <div className="pj-progress-card">
        <div className="pj-progress-title">
          {t('postJob.sidebar.progress')}
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
              {t(`postJob.steps.${s.key}.label`)}
            </div>
          ))}
        </div>
      </div>

      <div className="pj-tips-card">
        <div className="pj-tips-head">
          <div className="pj-tips-head-icon"><Lightbulb size={15} /></div>
          <h3>{t('postJob.sidebar.tips', { step })}</h3>
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

      <div className="pj-example-card">
        <h3><Star size={13} /> {t('postJob.sidebar.yourProgress')}</h3>
        <ul className="pj-example-list">
          <li>{t('postJob.sidebar.skillsAdded')}: {skillCount}/15</li>
          {form?.title && <li>{t('postJob.sidebar.titleChars')}: {form.title.length}/100</li>}
          {form?.description && <li>{t('postJob.sidebar.descChars')}: {form.description.length}/5000</li>}
          <li>{t('postJob.sidebar.skills3x')}</li>
          <li>{t('postJob.sidebar.desc60pt')}</li>
        </ul>
      </div>
    </div>
  );
};

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
const PostJob = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [step,       setStep]      = useState(1);
  const [form,       setForm]      = useState(INITIAL);
  const [errors,     setErrors]    = useState({});
  const [toast,      setToast]     = useState(null);
  const [success,    setSuccess]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editId) {
      getJobById(editId).then(res => {
        const data = res?.data?.project || res?.project || res?.data;
        if (data) {
          const loadedForm = {
            title: data.title || "",
            category: data.category || "",
            description: data.description || "",
            jobType: data.job_type || "fixed",
            experience: data.experience_level || "mid",
            skills: Array.isArray(data.required_skills) ? data.required_skills : [],
            budgetType: data.budget_type || "fixed",
            budgetFixed: data.budget_amount || data.budget_max || "",
            budgetMin: data.budget_min || "",
            budgetMax: data.budget_max || "",
            hourlyMin: data.hourly_rate_min || "",
            hourlyMax: data.hourly_rate_max || "",
            duration: data.project_duration || data.duration || "1to3",
            scope: data.scope || "medium",
            freelancers: data.freelancers_needed?.toString() || "1",
            visibility: data.visibility || "public",
          };
          setForm(loadedForm);

          let targetStep = 1;
          const s1Valid = loadedForm.title.trim().length >= 10 && loadedForm.category && loadedForm.description.trim().length >= 50 && loadedForm.experience;
          if (s1Valid) {
            targetStep = 2;
            const s2Valid = loadedForm.skills.length > 0;
            if (s2Valid) {
              targetStep = 3;
              let s3Valid = false;
              if (loadedForm.budgetType === "fixed" && loadedForm.budgetFixed) s3Valid = true;
              if (loadedForm.budgetType === "range" && loadedForm.budgetMin && loadedForm.budgetMax) s3Valid = true;
              if (loadedForm.budgetType === "hourly" && loadedForm.hourlyMin && loadedForm.hourlyMax) s3Valid = true;
              
              if (s3Valid && loadedForm.duration) {
                targetStep = 4;
              }
            }
          }
          setStep(targetStep);
        }
      });
    }
  }, [editId]);

  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const validate = useCallback((currentStep) => {
    const e = {};
    if (currentStep === 1) {
      if (!form.title.trim())            e.title       = t('postJob.errors.titleReq');
      else if (form.title.length < 10)   e.title       = t('postJob.errors.titleShort');
      if (!form.category)                e.category    = t('postJob.errors.categoryReq');
      if (!form.description.trim())      e.description = t('postJob.errors.descReq');
      else if (form.description.length < 50) e.description = t('postJob.errors.descShort');
      if (!form.experience)              e.experience  = t('postJob.errors.expReq');
    }
    if (currentStep === 2) {
      if (form.skills.length === 0)      e.skills = t('postJob.errors.skillsReq');
    }
    if (currentStep === 3) {
      if (form.budgetType === "fixed"  && !form.budgetFixed)             e.budget   = t('postJob.errors.budgetReq');
      if (form.budgetType === "range"  && (!form.budgetMin || !form.budgetMax)) e.budget = t('postJob.errors.budgetRangeReq');
      if (form.budgetType === "hourly" && (!form.hourlyMin || !form.hourlyMax)) e.budget = t('postJob.errors.hourlyReq');
      if (!form.duration)              e.duration = t('postJob.errors.durationReq');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, t]);

  const handleNext = () => {
    if (!validate(step)) {
      notify(t('postJob.errors.fillAll'), "error");
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

  const buildPayload = (status = "active") => {
    const payload = {
      title:            form.title,
      description:      form.description,
      category:         form.category,
      required_skills:  form.skills,
      experience_level: form.experience,
      budget_type:      form.budgetType,
      job_type:         form.jobType,
      duration:         form.duration,
      scope:            form.scope,
      visibility:       form.visibility,
      freelancers_needed: form.freelancers === "1" ? 1 : 2,
      currency:         "USD",
      status,
      attachments:      form.attachments,
    };
    if (form.budgetType === "fixed") {
      payload.budget_min = Number(form.budgetFixed) || 0;
      payload.budget_max = Number(form.budgetFixed) || 0;
    } else if (form.budgetType === "range") {
      payload.budget_min = Number(form.budgetMin) || 0;
      payload.budget_max = Number(form.budgetMax) || 0;
    } else if (form.budgetType === "hourly") {
      payload.budget_min = Number(form.hourlyMin) || 0;
      payload.budget_max = Number(form.hourlyMax) || 0;
      payload.hourly_rate_min = Number(form.hourlyMin) || 0;
      payload.hourly_rate_max = Number(form.hourlyMax) || 0;
    }
    return payload;
  };

  const handleSaveDraft = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = editId 
        ? await updateJob(editId, buildPayload("draft"))
        : await createJob(buildPayload("draft"));
      if (res?.success === false) {
        notify(res?.message || t('postJob.errors.general'), "error");
      } else {
        notify(editId ? t('postJob.errors.updated') : t('postJob.errors.draftSaved'));
      }
    } catch (err) {
      notify(t('postJob.errors.general'), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (submitting) return;
    if (!validate(step)) {
      notify(t('postJob.errors.fillAll'), "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = editId 
        ? await updateJob(editId, buildPayload("active"))
        : await createJob(buildPayload("active"));
      if (res?.success === false) {
        notify(res?.message || t('postJob.errors.general'), "error");
      } else {
        setSuccess(true);
      }
    } catch (error) {
      notify(t('postJob.errors.general'), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const STEP_META = {
    1: { badge: t('postJob.header.step', { current: 1, total: 4 }),  title: t('postJob.step1.title'),           desc: t('postJob.step1.desc') },
    2: { badge: t('postJob.header.step', { current: 2, total: 4 }),  title: t('postJob.step2.title'),           desc: t('postJob.step2.desc') },
    3: { badge: t('postJob.header.step', { current: 3, total: 4 }),  title: t('postJob.step3.title'),           desc: t('postJob.step3.desc') },
    4: { badge: t('postJob.header.step', { current: 4, total: 4 }),  title: t('postJob.step4.title'),           desc: t('postJob.step4.desc') },
  };

  const meta = STEP_META[step];

  if (success) {
    return (
      <div className="pj-page">
        <div className="pj-success">
          <div className="pj-success-icon">
            <Rocket size={36} />
          </div>
          <h1>{t('postJob.success.title')}</h1>
          <p>{t('postJob.success.desc', { title: form.title })}</p>
          <div className="pj-success-actions">
            <button className="pj-success-btn-primary" onClick={() => navigate("/client/my-jobs")}>
              <Briefcase size={16} style={{ display: "inline", marginRight: 6 }} />
              {t('postJob.success.myJobs')}
            </button>
            <button className="pj-success-btn-secondary" onClick={() => { setSuccess(false); setForm(INITIAL); setStep(1); }}>
              {t('postJob.success.postAnother')}
            </button>
            <button className="pj-success-btn-secondary" onClick={() => navigate("/client/find")}>
              {t('postJob.success.browseTalent')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pj-page">
      <header className="pj-header">
        <div className="pj-header-left">
          <button className="pj-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> {t('postJob.header.back')}
          </button>
          <div>
            <div className="pj-header-title">{editId ? t('postJob.header.edit') : t('postJob.header.post')}</div>
            <div className="pj-header-sub">
              {step < STEPS.length ? t('postJob.header.step', { current: step, total: STEPS.length }) : t('postJob.header.review')}
            </div>
          </div>
        </div>
        <div className="pj-header-right">
          <button
            className="pj-save-draft"
            onClick={handleSaveDraft}
            disabled={submitting}
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? t('postJob.header.saving') : t('postJob.header.saveDraft')}
          </button>
        </div>
      </header>

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
                <span className="pj-step-label">{t(`postJob.steps.${s.key}.label`)}</span>
                <span className="pj-step-sub">{t(`postJob.steps.${s.key}.sub`)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pj-main">
        <div>
          <div className="pj-card" key={step}>
            <div className="pj-card-head">
              <div className="pj-card-step-badge">{meta.badge}</div>
              <h1 className="pj-card-title">{meta.title}</h1>
              <p className="pj-card-desc">{meta.desc}</p>
            </div>

            {step === 1 && <PjStep1 form={form} setForm={setForm} errors={errors} />}
            {step === 2 && <PjStep2 form={form} setForm={setForm} errors={errors} />}
            {step === 3 && <PjStep3 form={form} setForm={setForm} errors={errors} />}
            {step === 4 && <PjStep4 form={form} />}

            <div className="pj-nav-row">
              <button
                className="pj-btn-back"
                onClick={handleBack}
                style={{ visibility: step === 1 ? "hidden" : "visible" }}
              >
                <ChevronLeft size={16} /> {t('postJob.nav.previous')}
              </button>

              {step < STEPS.length ? (
                <button className="pj-btn-next" onClick={handleNext}>
                  {t('postJob.nav.next')} <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className="pj-btn-publish"
                  onClick={handlePublish}
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  <Rocket size={16} /> {submitting ? t('postJob.nav.updating') : editId ? t('postJob.nav.update') : t('postJob.nav.publish')}
                </button>
              )}
            </div>
          </div>
        </div>
        <PjStepSidebar step={step} form={form} />
      </div>

      <PjToast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default PostJob;