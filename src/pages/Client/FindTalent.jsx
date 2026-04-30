// src/pages/Client/FindTalent/FindTalent.jsx
import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search, ChevronDown, ChevronUp, MapPin,
  Heart, ThumbsUp, ThumbsDown, X,
  CheckCircle, Zap, Star, RefreshCw,
  SlidersHorizontal, ArrowUpDown, Check,
} from "lucide-react";
import "../Client/css/find.css";
import { getFreelancers, saveFreelancer } from "../../api/freelancer";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { inviteFreelancer } from "../../api/proposals";
import InviteDrawer from "../components/InviteDrawer";
import { getSocket, onSocketReady, normalizeUserStatus } from "../../hooks/useSocket";
import { useUsersPresence } from "../../hooks/useUserPresence";

/* ================================================================
   MOCK DATA
   ================================================================ */
/* ================================================================
   NO MOCK DATA (Using Real Backend)
   ================================================================ */

const BADGE_OPTIONS = [
  { id: "top_rated_plus", icon: "🏆", bg: "#fef9c3", color: "#d97706" },
  { id: "top_rated",      icon: "⭐", bg: "#dbeafe", color: "#2563eb" },
  { id: "rising_talent",  icon: "📈", bg: "#d1fae5", color: "#059669" },
];

const SUCCESS_RATES = ["60", "70", "80", "90"];
const HOURLY_BARS   = [90,60,40,30,20,15,10,8,6,5,4,3,3,2,2,1];

/* ================================================================
   HELPERS
   ================================================================ */
const FtToast = ({ msg, onClose }) => msg ? (
  <div className="ft-toast">
    <CheckCircle size={16} color="#3b82f6" />
    <span>{msg}</span>
    <button className="ft-toast-x" onClick={onClose}><X size={13} /></button>
  </div>
) : null;

const FtFilterSection = ({ title, info, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ft-filter-section">
      <div className="ft-filter-hd" onClick={() => setOpen(o => !o)}>
        <h3>
          {title}
          {info && <span className="ft-filter-hd-info" title={info}>?</span>}
        </h3>
        <span className={`ft-filter-chevron ${open ? "open" : ""}`}>
          <ChevronDown size={16} />
        </span>
      </div>
      {open && <div className="ft-filter-body">{children}</div>}
    </div>
  );
};

/* ================================================================
   FREELANCER CARD
   ================================================================ */
const FtFreelancerCard = ({ fl, onInvite, targetJobId, onSaveToggle, onOpenInviteDrawer, presence }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [invited, setInvited] = useState(false);
  const [isSaved, setIsSaved] = useState(fl.is_saved || false);

  const handleInvite = async () => {
    if (invited) return;
    
    if (targetJobId) {
      setInvited(true);
      try {
        const res = await inviteFreelancer({
          job_id: targetJobId,
          freelancer_id: fl.id
        });
        
        if (res?.success) {
          onInvite(fl.name, true);
        } else {
          setInvited(false);
          onInvite(res?.message || "Taklif yuborishda xato", false);
        }
      } catch (err) {
        setInvited(false);
        onInvite("Server xatosi", false);
      }
    } else {
      if (onOpenInviteDrawer) {
        onOpenInviteDrawer(fl, setInvited);
      } else {
        onInvite(fl.name, true);
      }
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const res = await saveFreelancer(fl.id);
      if (res?.success) {
        setIsSaved(!isSaved);
        onSaveToggle?.(fl.name, !isSaved);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const successClass =
    fl.jobSuccess >= 95 ? "ft-success-99" :
    fl.jobSuccess >= 90 ? "ft-success-90" : "ft-success-80";

  const MAX_SKILLS = 6;

  return (
    <div className="ft-card">
      <div className="ft-card-inner">

        {/* Top row */}
        <div className="ft-card-top">
          <div className="ft-ava-wrap">
            <img src={fl.avatar} alt={fl.name} className="ft-ava" />
            {presence?.isOnline && <span className="ft-online-dot" />}
          </div>

          <div className="ft-card-info">
            <div className="ft-card-name-row">
              <span className="ft-card-name">{fl.name}</span>
              {fl.boosted && (
                <span className="ft-boosted"><Zap size={11} /> {t("findTalent.card.boosted")}</span>
              )}
            </div>
            <div className="ft-card-title">{fl.title}</div>
            <div className="ft-card-location">
              <MapPin size={12} /> {fl.location}
            </div>
          </div>

          <div className="ft-card-actions">
            <button
              className={`ft-heart-btn ${isSaved ? "liked" : ""}`}
              onClick={handleSave}
              title={t("findTalent.card.save")}>
              <Heart size={17} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button
              className={`ft-invite-btn ${invited ? "invited" : ""}`}
              onClick={handleInvite}>
              {invited ? <><Check size={14} /> {t("findTalent.card.invited")}</> : (targetJobId ? "Ushbu ishga taklif qilish" : t("findTalent.card.invite"))}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="ft-stats-row">
          <span className="ft-stat">{fl.rate}</span>
          <span className="ft-stat-sep" />
          <span className={`ft-success-badge ${successClass}`}>
            {fl.jobSuccess >= 95
              ? <><span style={{ fontSize: 13 }}>👑</span> {fl.jobSuccess}% {t("findTalent.card.success")}</>
              : <><Star size={12} fill="currentColor" /> {fl.jobSuccess}% {t("findTalent.card.success")}</>
            }
          </span>
          <span className="ft-stat-sep" />
          <span className="ft-stat">{fl.earned} {t("findTalent.card.earned")}</span>
          {fl.consults && (
            <>
              <span className="ft-stat-sep" />
              <span className="ft-consult-badge">
                <span style={{ fontSize: 13 }}>🎯</span> {t("findTalent.card.consults")}
              </span>
            </>
          )}
        </div>

        {/* Skills */}
        <div className="ft-skills">
          {fl.skills.slice(0, MAX_SKILLS).map(sk => (
            <span key={sk} className="ft-skill-tag">{sk}</span>
          ))}
          {fl.skills.length > MAX_SKILLS && (
            <span className="ft-skill-more">+{fl.skills.length - MAX_SKILLS}</span>
          )}
        </div>

        {/* Insights */}
        {fl.insights?.length > 0 && (
          <div className="ft-insights">
            <div className="ft-insights-hd">
              <div className="ft-insights-title">
                <span style={{ fontSize: 14 }}>💡</span>
                {t("findTalent.card.insights", { name: fl.name.split(" ")[0] })}
                <span className="ft-filter-hd-info" title={t("findTalent.card.insightsInfo")}>?</span>
              </div>
              <div className="ft-insights-feedback">
                {t("findTalent.card.feedback")}
                <button className="ft-thumb-btn"><ThumbsUp size={13} /></button>
                <button className="ft-thumb-btn"><ThumbsDown size={13} /></button>
              </div>
            </div>
            <ul className="ft-insights-list">
              {fl.insights.map((ins, i) => <li key={i}>{ins}</li>)}
            </ul>
          </div>
        )}

        {/* Association */}
        {fl.assoc && (
          <div className="ft-assoc">
            <div className="ft-assoc-logo-ph" style={{ background: fl.assoc.bg }}>
              {fl.assoc.initials}
            </div>
            <div className="ft-assoc-text">
              <div className="ft-assoc-by">{t("findTalent.card.associatedWith")}</div>
              <div className="ft-assoc-name">{fl.assoc.name}</div>
            </div>
            <div>
              <div className="ft-assoc-earned">{fl.assoc.earned}</div>
              <div className="ft-assoc-earned-lbl">{fl.assoc.earnedLbl}</div>
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="ft-card-divider" />
      <div className="ft-card-footer">
        <button className="ft-card-footer-link" onClick={() => navigate(`/profile/${fl.id}`)}>{t("findTalent.card.viewProfile")}</button>
        <button className="ft-card-footer-link" onClick={() => navigate(`/messages?userId=${fl.id}`)}>{t("findTalent.card.sendMessage")}</button>
        <button className="ft-card-footer-link" onClick={handleSave}>
          {isSaved ? "Saqlangan" : t("findTalent.card.saveAction")}
        </button>
      </div>
    </div>
  );
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
const FindTalent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* filter state */
  const [search,      setSearch]      = useState("");
  const [badges,      setBadges]      = useState([]);
  const [minRate,     setMinRate]     = useState(10);
  const [maxRate,     setMaxRate]     = useState(150);
  const [location,    setLocation]    = useState("");
  const [successRate, setSuccessRate] = useState("");
  const [sort,        setSort]        = useState("relevance");
  const [toast,       setToast]       = useState("");
  const [targetJobId, setTargetJobId] = useState(searchParams.get("jobId"));
  const [targetJobTitle, setTargetJobTitle] = useState("");

  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const [selectedFreelancerForInvite, setSelectedFreelancerForInvite] = useState(null);
  const [activeSetInvitedCb, setActiveSetInvitedCb] = useState(null);

  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {
          search: search || undefined,
          location: location || undefined,
          min_rating: successRate ? parseInt(successRate) : undefined,
        };
        if (minRate > 10) params.min_rate = minRate;
        if (maxRate < 150) params.max_rate = maxRate;

        const res = await getFreelancers(params);

        // Backend returns { success: true, data: { freelancers: [...] } }
        let list = res?.data?.freelancers || [];
        
        const mapped = list.map(item => {
          return {
            id: item.id,
            avatar: item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.first_name || "U")}+${encodeURIComponent(item.last_name || "")}&background=random`,
            name: `${item.first_name || t("findTalent.card.mutaxassis")} ${item.last_name || ""}`.trim(),
            title: item.title || "Freelancer",
            rate: item.hourly_rate ? `$${item.hourly_rate}/hr` : t("findTalent.card.negotiable"),
            jobSuccess: item.rating || 0,
            earned: item.completed_jobs ? `${item.completed_jobs} ${t("findTalent.card.jobsDone")}` : t("findTalent.card.newFreelancer"),
            location: item.location || t("findTalent.nations.uz"),
            skills: Array.isArray(item.skills) ? item.skills : [],
            bio: item.bio || "",
            online: false, 
            boosted: false,
            is_saved: !!item.is_saved,
          };
        });
        setFreelancers(mapped);
      } catch (error) {
        console.error("Fetch freelancers error:", error);
        setFreelancers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [search, location, minRate, maxRate, successRate, t]);

  const presenceMap = useUsersPresence(freelancers.map(f => f.id));

  const onSaveToggle = (name, saved) => {
    notify(saved ? `${name} saqlandi` : `${name} saqlanganlardan olib tashlandi`);
  };

  // Sync search from URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
    const jId = searchParams.get("jobId");
    if (jId) setTargetJobId(jId);
  }, [searchParams]);

  // Fetch target job title if jobId is present
  useEffect(() => {
    if (targetJobId) {
      // getJobById should be used here, but for now we'll just keep the ID
      // or we can mock the title if needed
    }
  }, [targetJobId]);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  const toggleBadge = (id) =>
    setBadges(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

  const clearFilters = () => {
    setBadges([]); setMinRate(10); setMaxRate(150);
    setLocation(""); setSuccessRate("");
    notify("Filtrlar tozalandi!");
  };

  const shown = freelancers;

  const activeFilterCount =
    badges.length +
    (minRate !== 10 || maxRate !== 150 ? 1 : 0) +
    (location ? 1 : 0) +
    (successRate ? 1 : 0);

  return (
    <div className="ft-page">

      {/* Top search bar */}
      <div className="ft-searchbar">
        <button
          className="ft-back-btn"
          onClick={() => navigate("/client/home")}
          title="Bosh sahifaga qaytish">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div className="ft-search-wrap">
          <span className="ft-search-icon"><Search size={18} /></span>
          <input
            className="ft-search-input"
            type="text"
            placeholder={t("findTalent.results.searchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="ft-advanced-link">{t("findTalent.results.advancedSearch")}</button>
        <span className="ft-result-count">{t("findTalent.results.freelancersFound", { count: shown.length })}</span>
      </div>

      <div className="ft-body">

        {/* FILTER SIDEBAR */}
        <aside className="ft-sidebar">

          <div className="ft-sidebar-hd">
            <div className="ft-sidebar-hd-title">
              <SlidersHorizontal size={15} /> {t("findTalent.filter.title")}
              {activeFilterCount > 0 && (
                <span className="ft-filter-count">{activeFilterCount}</span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button className="ft-sidebar-clear" onClick={clearFilters}>{t("findTalent.filter.clearAll")}</button>
            )}
          </div>

          {/* Talent Badge */}
          <FtFilterSection title={t("findTalent.filter.talentBadge")} info={t("findTalent.filter.talentBadgeInfo")}>
            {BADGE_OPTIONS.map(b => (
              <label key={b.id}
                className={`ft-check-item ${badges.includes(b.id) ? "checked" : ""}`}
                onClick={() => toggleBadge(b.id)}>
                <div className="ft-checkbox">
                  <Check size={10} className="ft-check-tick" />
                </div>
                <div className="ft-check-badge-wrap">
                  <div className="ft-badge-icon" style={{ background: b.bg }}>{b.icon}</div>
                  <span className="ft-check-label" style={{ color: badges.includes(b.id) ? b.color : undefined }}>
                    {t(`findTalent.badges.${b.id}`)}
                  </span>
                </div>
              </label>
            ))}
          </FtFilterSection>

          {/* Hourly Rate */}
          <FtFilterSection title={t("findTalent.filter.hourlyRate")}>
            <div className="ft-rate-chart">
              {HOURLY_BARS.map((h, i) => {
                const pct = i / HOURLY_BARS.length;
                const inRange = pct * 110 + 10 >= minRate && pct * 110 + 10 <= maxRate;
                return (
                  <div key={i} className={`ft-rate-bar ${!inRange ? "dim" : ""}`}
                    style={{ height: `${(h / 90) * 100}%` }} />
                );
              })}
            </div>
            <div className="ft-rate-range">
              <span>{t("findTalent.filter.under", { min: minRate })}</span>
              <span>${maxRate}+</span>
            </div>
            <input
              type="range" className="ft-rate-slider"
              min={10} max={150} step={5}
              value={maxRate}
              onChange={e => setMaxRate(Number(e.target.value))}
            />
            <div className="ft-rate-inputs">
              <div className="ft-rate-input-wrap">
                <span>$</span>
                <input className="ft-rate-input" type="number" value={minRate}
                  onChange={e => setMinRate(Number(e.target.value))} placeholder="Min" />
              </div>
              <div className="ft-rate-input-wrap">
                <span>$</span>
                <input className="ft-rate-input" type="number" value={maxRate}
                  onChange={e => setMaxRate(Number(e.target.value))} placeholder="Maks" />
              </div>
            </div>
          </FtFilterSection>

          {/* Location */}
          <FtFilterSection title={t("findTalent.filter.location")}>
            <select className="ft-location-select"
              value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">{t("findTalent.filter.searchLocation")}</option>
              <option value="Uzbekistan">{t("findTalent.nations.uz")}</option>
              <option value="Tashkent">{t("findTalent.nations.tashkent")}</option>
              <option value="Samarkand">{t("findTalent.nations.samarkand")}</option>
              <option value="Bukhara">{t("findTalent.nations.bukhara")}</option>
              <option value="Kazakhstan">{t("findTalent.nations.kz")}</option>
              <option value="Kyrgyzstan">{t("findTalent.nations.kg")}</option>
              <option value="Remote">{t("findTalent.nations.remote")}</option>
            </select>
          </FtFilterSection>

          {/* Job Success */}
          <FtFilterSection title={t("findTalent.filter.jobSuccess")} info={t("findTalent.filter.jobSuccessInfo")}>
            {SUCCESS_RATES.map(r => (
              <label key={r}
                className={`ft-check-item ${successRate === r.split("%")[0] ? "checked" : ""}`}
                onClick={() => setSuccessRate(
                  successRate === r.split("%")[0] ? "" : r.split("%")[0]
                )}>
                <div className="ft-checkbox">
                  <Check size={10} className="ft-check-tick" />
                </div>
                <span className="ft-check-label">{t("findTalent.filter.successUp", { percent: r })}</span>
              </label>
            ))}
          </FtFilterSection>

          {/* English Level */}
          <FtFilterSection title={t("findTalent.filter.englishLevel")} defaultOpen={false}>
            {[
              { id: "any", label: t("findTalent.englishLevels.any") },
              { id: "basic", label: t("findTalent.englishLevels.basic") },
              { id: "conversational", label: t("findTalent.englishLevels.conversational") },
              { id: "fluent", label: t("findTalent.englishLevels.fluent") },
              { id: "native", label: t("findTalent.englishLevels.native") }
            ].map(l => (
              <label key={l.id} className="ft-check-item">
                <div className="ft-checkbox"><Check size={10} className="ft-check-tick" /></div>
                <span className="ft-check-label">{l.label}</span>
              </label>
            ))}
          </FtFilterSection>

          {activeFilterCount > 0 && (
            <button className="ft-clear-btn" onClick={clearFilters}>
              <X size={13} /> {t("findTalent.filter.clearAllCount", { count: activeFilterCount })}
            </button>
          )}
        </aside>

        {/* RESULTS */}
        <main className="ft-results">

          <div className="ft-results-top">
            <button className="ft-filter-pill">
              <MapPin size={13} />
              {location || t("findTalent.results.location")}
              <ChevronDown size={12} />
            </button>

            {badges.map(b => {
              const opt = BADGE_OPTIONS.find(o => o.id === b);
              return (
                <button key={b} className="ft-filter-pill active"
                  onClick={() => toggleBadge(b)}>
                  {opt?.icon} {t(`findTalent.badges.${b}`)} <X size={11} />
                </button>
              );
            })}

            {successRate && (
              <button className="ft-filter-pill active"
                onClick={() => setSuccessRate("")}>
                {t("findTalent.results.successCount", { percent: successRate })} <X size={11} />
              </button>
            )}

            <select className="ft-sort-select"
              value={sort} onChange={e => setSort(e.target.value)}>
              <option value="relevance">{t("findTalent.results.sort.relevance")}</option>
              <option value="rate_asc">{t("findTalent.results.sort.rate_asc")}</option>
              <option value="rate_desc">{t("findTalent.results.sort.rate_desc")}</option>
              <option value="success">{t("findTalent.results.sort.success")}</option>
              <option value="earned">{t("findTalent.results.sort.earned")}</option>
            </select>
          </div>

          {loading ? (
            <div className="ft-loading">{t("findTalent.results.loading")}</div>
          ) : shown.length > 0 ? (
            shown.map(fl => (
              <FtFreelancerCard
                key={fl.id}
                fl={fl}
                presence={presenceMap[String(fl.id).toLowerCase()]}
                targetJobId={targetJobId}
                onSaveToggle={onSaveToggle}
                onOpenInviteDrawer={(freelancer, setInvitedCb) => {
                  setSelectedFreelancerForInvite(freelancer);
                  setActiveSetInvitedCb(() => setInvitedCb);
                  setInviteDrawerOpen(true);
                }}
                onInvite={(name, isSuccess) => {
                  if (isSuccess) {
                    notify(targetJobId ? `${name} ga ushbu loyiha uchun taklif yuborildi!` : `${name} ga taklif yubarildi!`);
                  } else {
                    notify(name, true); // name is error message here
                  }
                }}
              />
            ))
          ) : (
            <div className="ft-empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="ft-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <Search size={48} style={{ color: '#aaa', strokeWidth: 1.5, marginBottom: 16 }} />
              </div>
              <div className="ft-empty-title" style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
                {t("findTalent.results.empty")}
              </div>
              <div className="ft-empty-sub" style={{ color: '#666', marginBottom: 24 }}>
                {t("findTalent.results.emptySub")}
              </div>
              {activeFilterCount > 0 && (
                <button 
                  className="ft-clear-btn" 
                  onClick={clearFilters}
                  style={{ 
                    background: '#2563eb', color: '#fff', border: 'none', 
                    padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  {t("findTalent.filter.clearAllCount", { count: activeFilterCount })}
                </button>
              )}
            </div>
          )}

          {shown.length > 0 && (
            <div className="ft-load-more">
              <button className="ft-load-more-btn"
                onClick={() => notify(t("findTalent.results.loadingMore"))}>
                <RefreshCw size={15} /> {t("findTalent.results.loadMore")}
              </button>
            </div>
          )}
        </main>
      </div>

      <FtToast msg={toast} onClose={() => setToast("")} />
      <InviteDrawer 
        isOpen={inviteDrawerOpen} 
        onClose={() => {
          setInviteDrawerOpen(false);
          setSelectedFreelancerForInvite(null);
          setActiveSetInvitedCb(null);
        }} 
        freelancer={selectedFreelancerForInvite}
        onInviteSuccess={(msgOrName, isSuccess) => {
          if (isSuccess) {
            notify(`${msgOrName} ga ushbu loyiha uchun taklif yuborildi!`);
            if (activeSetInvitedCb) activeSetInvitedCb(true);
          } else {
            notify(msgOrName);
          }
        }}
      />
    </div>
  );
};

export default FindTalent;