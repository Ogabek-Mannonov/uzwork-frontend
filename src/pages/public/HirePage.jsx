// src/pages/public/HirePage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  Search, MapPin, Star, Briefcase, Users, Zap, 
  ChevronLeft, ChevronRight, CheckCircle, Quote, 
  ArrowRight, ShieldCheck, Globe, Trophy, ExternalLink
} from "lucide-react";
import AppHeader from "../components/AppHeader/AppHeader";
import Footer from "../footer/Footer";
import { getFreelancers } from "../../api/freelancer";
import "./HirePage.css";

const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api\/?$/, "");

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND}${url.startsWith("/") ? url : `/${url}`}`;
}

const CATEGORIES = [
  { label: "Barcha yo'nalishlar", value: "" },
  { label: "Veb dasturlash", value: "web" },
  { label: "Mobil dasturlash", value: "mobile" },
  { label: "UI/UX dizayn", value: "ui" },
  { label: "Grafik dizayn", value: "dizayn" },
  { label: "Marketing & SMM", value: "smm" },
  { label: "Tarjima & Matn", value: "tarjima" },
  { label: "Virtual yordamchi", value: "yordam" },
  { label: "Ma'lumotlar tahlili", value: "data" },
];

const PAGE_SIZE = 10;

function FreelancerCard({ freelancer, onClick }) {
  const avSrc = avatarSrc(freelancer.avatar_url);
  const skills = Array.isArray(freelancer.skills)
    ? freelancer.skills
    : (typeof freelancer.skills === "string"
        ? (() => { try { return JSON.parse(freelancer.skills); } catch { return []; } })()
        : []);

  const fullName = freelancer.full_name || `${freelancer.first_name || ""} ${freelancer.last_name || ""}`.trim() || "Freelancer";

  return (
    <div className="hp-card" onClick={onClick}>
      <div className="hp-card__left">
        {avSrc ? (
          <img src={avSrc} alt={fullName} className="hp-card__avatar" />
        ) : (
          <div className="hp-card__avatar-placeholder">
            {fullName[0].toUpperCase()}
          </div>
        )}
      </div>

      <div className="hp-card__body">
        <div className="hp-card__top">
          <div>
            <h3 className="hp-card__name">{fullName}</h3>
            <p className="hp-card__title">{freelancer.title || "Professional Freelancer"}</p>
          </div>
        </div>

        <div className="hp-card__meta">
          <span><MapPin size={16} /> {freelancer.location || "O'zbekiston"}</span>
          <span className="rating"><Star size={16} fill="currentColor" /> {Number(freelancer.rating || 4.8).toFixed(1)}</span>
          <span><Briefcase size={16} /> {freelancer.completed_jobs || 0} ta loyiha</span>
        </div>

        <p className="hp-card__bio">
          {freelancer.bio || "O'z ishining ustasi, mijozlar talablariga professional yondashuv va o'z vaqtida sifatli natija kafolati."}
        </p>

        <div className="hp-card__skills">
          {skills.slice(0, 5).map((s, i) => (
            <span key={i} className="hp-card__skill">
              {typeof s === "string" ? s : s?.name || ""}
            </span>
          ))}
          {skills.length > 5 && <span className="hp-card__skill">+{skills.length - 5}</span>}
        </div>
      </div>

      <div className="hp-card__right">
        <div className="hp-card__rate">
          ${Number(freelancer.hourly_rate || 0).toFixed(0)}<span>/soat</span>
        </div>
        <button className="hp-card__btn" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          Profilni ko'rish
        </button>
      </div>
    </div>
  );
}

export default function HirePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const qParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(qParam);
  const [activeCategory, setActiveCategory] = useState(qParam);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const currentSearch = searchParams.get("q") || "";
    
    const params = {
      limit: PAGE_SIZE,
      page: page,
      search: currentSearch || undefined,
    };

    try {
      const res = await getFreelancers(params);
      console.log("HirePage API Response:", res); // Debug for user

      // Handle different possible response structures
      const dataObj = res?.data || res;
      if (dataObj && (dataObj.freelancers || Array.isArray(dataObj))) {
        const list = dataObj.freelancers || (Array.isArray(dataObj) ? dataObj : []);
        setFreelancers(list);
        setTotal(dataObj.pagination?.total || list.length);
      } else {
        setFreelancers([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("HirePage Fetch Error:", err);
      setFreelancers([]);
      setTotal(0);
    }
    setLoading(false);
  }, [searchParams, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setActiveCategory(q);
    setPage(1);
  }, [searchParams]);

  const handleCategoryClick = (val) => {
    setSearchParams(val ? { q: val } : {});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query.trim() ? { q: query.trim() } : {});
  };

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="hp-root">
      <AppHeader />

      {/* Hero Section */}
      <section className="hp-hero">
        <div className="hp-hero__inner">
          <div className="hp-hero__content">
            <div className="hp-hero__badge">
              <Trophy size={14} /> O'zbekistondagi #1 freelance platformasi
            </div>
            <h1 className="hp-hero__title">
              Eng yaxshi <span>mutaxassislarni</span> bir joyda toping
            </h1>
            <p className="hp-hero__sub">
              Sizning loyihangiz uchun eng munosib kadrlarni saralab oldik. 
              Xavfsiz to'lov va sifatli natija kafolati bilan ishlang.
            </p>

            <form className="hp-search-wrap" onSubmit={handleSearch}>
              <Search size={20} color="#94a3b8" />
              <input 
                className="hp-search-input" 
                placeholder="Qanday mutaxassis kerak? (masalan: React developer)" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="hp-search-btn">Qidirish</button>
            </form>
          </div>

          <div className="hp-hero__visual">
            <div className="hp-hero__blob"></div>
            {/* Visual representation could be an image or illustration */}
            <div style={{zIndex:1, background:'#fff', padding:20, borderRadius:24, boxShadow:'0 30px 60px rgba(0,0,0,0.1)'}}>
               <Users size={120} color="#4f46e5" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <div className="hp-main">
        {/* Sidebar */}
        <aside className="hp-sidebar">
          <div className="hp-sidebar__group">
            <h4 className="hp-sidebar__title">Kategoriyalar</h4>
            <div className="hp-sidebar__list">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`hp-cat-btn ${activeCategory === cat.value ? "active" : ""}`}
                  onClick={() => { setActiveCategory(cat.value); setPage(1); setSearchParams(cat.value ? {q: cat.value} : {}); }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hp-sidebar__group">
             <h4 className="hp-sidebar__title">Nega biz?</h4>
             <div style={{fontSize:'0.9rem', color:'#64748b', lineHeight:'1.6'}}>
                <p>✓ Tekshirilgan profillar</p>
                <p>✓ 24/7 mijozlarni qo'llab-quvvatlash</p>
                <p>✓ 100% pulingiz himoyalangan</p>
             </div>
          </div>
        </aside>

        {/* Results */}
        <main>
          <div className="hp-results-header">
            <div className="hp-results-count">
              {total} ta mutaxassis <span>topildi</span>
            </div>
          </div>

          {loading ? (
            <div style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>Yuklanmoqda...</div>
          ) : (
            <div className="hp-feed">
              {freelancers.map(f => (
                <FreelancerCard key={f.id} freelancer={f} onClick={() => navigate(`/profile/${f.id}`)} />
              ))}
              {freelancers.length === 0 && (
                <div style={{textAlign:'center', padding:'80px 0'}}>
                   <h3 style={{color:'#64748b'}}>Hozircha hech kim topilmadi</h3>
                   <p style={{color:'#94a3b8'}}>Qidiruv so'zini o'zgartirib ko'ring</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="hp-pagination">
              <button className="hp-page-btn" disabled={page === 1} onClick={() => { setPage(p => p - 1); window.scrollTo(0, 500); }}>Oldingi</button>
              <button className="hp-page-btn" disabled={page === totalPages} onClick={() => { setPage(p => p + 1); window.scrollTo(0, 500); }}>Keyingi</button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
