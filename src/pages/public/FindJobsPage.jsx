// src/pages/public/FindJobsPage.jsx
// Ish topish — public page, backend projects API bilan

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, MapPin, Star, Briefcase, Users, Zap, Clock, DollarSign, Filter, CheckCircle } from "lucide-react";
import AppHeader from "../components/AppHeader/AppHeader";
import Footer from "../footer/Footer";
import { getJobs } from "../../api/jobs";
import "./FindJobsPage.css";

const CATEGORIES = [
  { label: "Barchasi", value: "" },
  { label: "Dasturlash", value: "development" },
  { label: "Dizayn", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Yozish & Tarjima", value: "writing" },
  { label: "Admin Support", value: "admin" },
  { label: "Moliya", value: "finance" },
  { label: "Savdo", value: "sales" },
];

const JOB_TYPES = [
  { label: "Barchasi", value: "all" },
  { label: "Fixed Price", value: "fixed" },
  { label: "Hourly", value: "hourly" },
];

const EXP_LEVELS = [
  { label: "Barchasi", value: "all" },
  { label: "Entry", value: "entry" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Expert", value: "expert" },
];

const formatTime = (date) => {
  if (!date) return "";
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return "Hozirgina";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
};

function JobCard({ job, onClick }) {
  const skills = Array.isArray(job.skills) ? job.skills : [];
  
  return (
    <div className="fjp-job-card" onClick={onClick}>
      <div className="fjp-job-card__top">
        <span className="fjp-job-card__time">{formatTime(job.created_at)}</span>
        <div className="fjp-job-card__client">
          {job.client_verified && (
            <span className="fjp-client-badge"><CheckCircle size={14} /> To'lov tasdiqlangan</span>
          )}
          <span className="fjp-client-loc">{job.location || "O'zbekiston"}</span>
        </div>
      </div>

      <h3 className="fjp-job-card__title">{job.title}</h3>
      <p className="fjp-job-card__desc">{job.description}</p>

      <div className="fjp-job-card__meta">
        <div className="fjp-meta-item">
          <span className="fjp-meta-label">Budjet</span>
          <span className="fjp-meta-value">
            {job.budget_type === 'fixed' 
              ? `$${job.budget_amount || (job.budget_min + '-' + job.budget_max)}`
              : `$${job.budget_min || 0} - $${job.budget_max || 0} /soat`
            }
          </span>
        </div>
        <div className="fjp-meta-item">
          <span className="fjp-meta-label">Daraja</span>
          <span className="fjp-meta-value" style={{textTransform: 'capitalize'}}>{job.experience_level || "O'rta"}</span>
        </div>
        <div className="fjp-meta-item">
          <span className="fjp-meta-label">Turi</span>
          <span className="fjp-meta-value">{job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}</span>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="fjp-job-card__skills">
          {skills.slice(0, 5).map((s, i) => (
            <span key={i} className="fjp-skill-tag">{typeof s === 'string' ? s : s.name}</span>
          ))}
          {skills.length > 5 && <span className="fjp-skill-tag">+{skills.length - 5}</span>}
        </div>
      )}
    </div>
  );
}

export default function FindJobsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const qParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(qParam);
  const [activeCategory, setActiveCategory] = useState(qParam);
  const [jobType, setJobType] = useState("all");
  const [expLevel, setExpLevel] = useState("all");
  const [sort, setSort] = useState("newest");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = {
      limit: 15,
      offset: 0,
    };
    if (query.trim()) params.search = query.trim();
    if (jobType !== "all") params.budget_type = jobType;
    if (expLevel !== "all") params.experience_level = expLevel;
    
    // Default sorting in projects API is usually created_at DESC
    
    const res = await getJobs(params);
    if (res?.success !== false) {
      const list = res?.jobs || res?.data || res || [];
      setJobs(Array.isArray(list) ? list : []);
      setTotal(res?.total || res?.count || (Array.isArray(list) ? list.length : 0));
    } else {
      setJobs([]);
    }
    setLoading(false);
  }, [query, jobType, expLevel]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setActiveCategory(q);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query.trim() ? { q: query.trim() } : {});
  };

  const handleCategoryClick = (val) => {
    setActiveCategory(val);
    setQuery(val);
    setSearchParams(val ? { q: val } : {});
  };

  return (
    <div className="fjp-root">
      <AppHeader />

      {/* Hero */}
      <section className="fjp-hero">
        <div className="fjp-hero__inner">
          <h1 className="fjp-hero__title">
            O'zingizga mos <span>ishni toping</span>
          </h1>
          <p className="fjp-hero__sub">
            Minglab masofaviy va qiziqarli loyihalar sizni kutmoqda.
          </p>

          <form className="fjp-search" onSubmit={handleSearch}>
            <div className="fjp-search__input-wrap">
              <Search size={20} color="#94a3b8" />
              <input
                className="fjp-search__input"
                placeholder="Loyiha nomi yoki ko'nikmalar bo'yicha qidiring..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="fjp-search__btn">Qidirish</button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <div className="fjp-container">
        {/* Sidebar */}
        <aside className="fjp-sidebar">
          <div className="fjp-sidebar__group">
            <h4 className="fjp-sidebar__title">Kategoriyalar</h4>
            <div className="fjp-sidebar__list">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`fjp-cat-btn ${activeCategory === cat.value ? "active" : ""}`}
                  onClick={() => handleCategoryClick(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fjp-sidebar__group">
            <h4 className="fjp-sidebar__title">Ish turi</h4>
            <div className="fjp-sidebar__list">
              {JOB_TYPES.map(jt => (
                <button
                  key={jt.value}
                  className={`fjp-cat-btn ${jobType === jt.value ? "active" : ""}`}
                  onClick={() => setJobType(jt.value)}
                >
                  {jt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fjp-sidebar__group">
            <h4 className="fjp-sidebar__title">Tajriba darajasi</h4>
            <div className="fjp-sidebar__list">
              {EXP_LEVELS.map(exp => (
                <button
                  key={exp.value}
                  className={`fjp-cat-btn ${expLevel === exp.value ? "active" : ""}`}
                  onClick={() => setExpLevel(exp.value)}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="fjp-feed">
          <div className="fjp-feed__header">
            <div className="fjp-feed__stats">
              <strong>{total}</strong> ta loyiha topildi
            </div>
            <select className="fjp-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Eng yangi</option>
              <option value="budget_desc">Yuqori budjet</option>
            </select>
          </div>

          <div className="fjp-grid">
            {loading ? (
              <div style={{textAlign: 'center', padding: '40px'}}>Yuklanmoqda...</div>
            ) : jobs.length === 0 ? (
              <div className="fjp-empty">
                <div className="fjp-empty__icon">📁</div>
                <h3>Loyihalar topilmadi</h3>
                <p>Kriteriyalarni o'zgartirib ko'ring</p>
              </div>
            ) : (
              jobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onClick={() => navigate(`/jobs/${job.id}`)}
                />
              ))
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
