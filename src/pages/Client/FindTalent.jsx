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
import { getFreelancers } from "../../api/freelancer";
import { useEffect } from "react";

/* ================================================================
   MOCK DATA
   ================================================================ */
/* ================================================================
   NO MOCK DATA (Using Real Backend)
   ================================================================ */

const BADGE_OPTIONS = [
  { id: "top_rated_plus", label: "Top Rated Plus", icon: "🏆", bg: "#fef9c3", color: "#d97706" },
  { id: "top_rated",      label: "Top Rated",      icon: "⭐", bg: "#dbeafe", color: "#2563eb" },
  { id: "rising_talent",  label: "Rising Talent",  icon: "📈", bg: "#d1fae5", color: "#059669" },
];

const SUCCESS_RATES = ["60% & up", "70% & up", "80% & up", "90% & up"];
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
const FtFreelancerCard = ({ fl, onInvite }) => {
  const [invited, setInvited] = useState(false);
  const [liked,   setLiked]   = useState(false);

  const handleInvite = () => {
    setInvited(i => !i);
    if (!invited) onInvite(fl.name);
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
            {fl.online && <span className="ft-online-dot" />}
          </div>

          <div className="ft-card-info">
            <div className="ft-card-name-row">
              <span className="ft-card-name">{fl.name}</span>
              {fl.boosted && (
                <span className="ft-boosted"><Zap size={11} /> Boosted</span>
              )}
            </div>
            <div className="ft-card-title">{fl.title}</div>
            <div className="ft-card-location">
              <MapPin size={12} /> {fl.location}
            </div>
          </div>

          <div className="ft-card-actions">
            <button
              className={`ft-heart-btn ${liked ? "liked" : ""}`}
              onClick={() => setLiked(l => !l)}
              title="Save freelancer">
              <Heart size={17} fill={liked ? "currentColor" : "none"} />
            </button>
            <button
              className={`ft-invite-btn ${invited ? "invited" : ""}`}
              onClick={handleInvite}>
              {invited ? <><Check size={14} /> Invited</> : "Invite to job"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="ft-stats-row">
          <span className="ft-stat">{fl.rate}</span>
          <span className="ft-stat-sep" />
          <span className={`ft-success-badge ${successClass}`}>
            {fl.jobSuccess >= 95
              ? <><span style={{ fontSize: 13 }}>👑</span> {fl.jobSuccess}% Job Success</>
              : <><Star size={12} fill="currentColor" /> {fl.jobSuccess}% Job Success</>
            }
          </span>
          <span className="ft-stat-sep" />
          <span className="ft-stat">{fl.earned} earned</span>
          {fl.consults && (
            <>
              <span className="ft-stat-sep" />
              <span className="ft-consult-badge">
                <span style={{ fontSize: 13 }}>🎯</span> Offers consultations
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
                Insights about {fl.name.split(" ")[0]}
                <span className="ft-filter-hd-info" title="AI-generated insights">?</span>
              </div>
              <div className="ft-insights-feedback">
                Insight feedback
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
              <div className="ft-assoc-by">Associated with</div>
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
        <button className="ft-card-footer-link">View Profile</button>
        <button className="ft-card-footer-link">Send Message</button>
        <button className="ft-card-footer-link">Save</button>
      </div>
    </div>
  );
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
const FindTalent = () => {
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
            avatar: item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.first_name || "U")}&background=random`,
            name: `${item.first_name || "Mutaxassis"} ${item.last_name || ""}`.trim(),
            title: item.title || "Freelancer",
            rate: item.hourly_rate ? `$${item.hourly_rate}/hr` : "Kelishiladi",
            jobSuccess: item.rating || 0,
            earned: item.completed_jobs ? `${item.completed_jobs} ta topshirilgan` : "Yangi frilanser",
            location: item.location || "O'zbekiston",
            skills: Array.isArray(item.skills) ? item.skills : [],
            bio: item.bio || "",
            online: item.availability_status === 'available',
            boosted: false,
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
  }, [search, location, minRate, maxRate, successRate]);

  // Sync search from URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  const toggleBadge = (id) =>
    setBadges(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

  const clearFilters = () => {
    setBadges([]); setMinRate(10); setMaxRate(150);
    setLocation(""); setSuccessRate("");
    notify("Filters cleared!");
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
          title="Back to Dashboard">
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
            placeholder="Search for a skill or name"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="ft-advanced-link">Advanced search</button>
        <span className="ft-result-count">{shown.length} freelancers found</span>
      </div>

      <div className="ft-body">

        {/* FILTER SIDEBAR */}
        <aside className="ft-sidebar">

          <div className="ft-sidebar-hd">
            <div className="ft-sidebar-hd-title">
              <SlidersHorizontal size={15} /> Filters
              {activeFilterCount > 0 && (
                <span className="ft-filter-count">{activeFilterCount}</span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button className="ft-sidebar-clear" onClick={clearFilters}>Clear all</button>
            )}
          </div>

          {/* Talent Badge */}
          <FtFilterSection title="Talent badge" info="Badges awarded based on performance">
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
                    {b.label}
                  </span>
                </div>
              </label>
            ))}
          </FtFilterSection>

          {/* Hourly Rate */}
          <FtFilterSection title="Hourly rate">
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
              <span>under ${minRate}</span>
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
                  onChange={e => setMaxRate(Number(e.target.value))} placeholder="Max" />
              </div>
            </div>
          </FtFilterSection>

          {/* Location */}
          <FtFilterSection title="Location">
            <select className="ft-location-select"
              value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">City, country or region</option>
              <option value="Uzbekistan">Uzbekistan</option>
              <option value="Tashkent">Tashkent</option>
              <option value="Samarkand">Samarkand</option>
              <option value="Bukhara">Bukhara</option>
              <option value="Kazakhstan">Kazakhstan</option>
              <option value="Kyrgyzstan">Kyrgyzstan</option>
              <option value="Remote">Remote (Any)</option>
            </select>
          </FtFilterSection>

          {/* Job Success */}
          <FtFilterSection title="Job success" info="Minimum job success score">
            {SUCCESS_RATES.map(r => (
              <label key={r}
                className={`ft-check-item ${successRate === r.split("%")[0] ? "checked" : ""}`}
                onClick={() => setSuccessRate(
                  successRate === r.split("%")[0] ? "" : r.split("%")[0]
                )}>
                <div className="ft-checkbox">
                  <Check size={10} className="ft-check-tick" />
                </div>
                <span className="ft-check-label">{r}</span>
              </label>
            ))}
          </FtFilterSection>

          {/* English Level */}
          <FtFilterSection title="English level" defaultOpen={false}>
            {["Any level","Basic","Conversational","Fluent","Native"].map(l => (
              <label key={l} className="ft-check-item">
                <div className="ft-checkbox"><Check size={10} className="ft-check-tick" /></div>
                <span className="ft-check-label">{l}</span>
              </label>
            ))}
          </FtFilterSection>

          {activeFilterCount > 0 && (
            <button className="ft-clear-btn" onClick={clearFilters}>
              <X size={13} /> Clear all filters ({activeFilterCount})
            </button>
          )}
        </aside>

        {/* RESULTS */}
        <main className="ft-results">

          <div className="ft-results-top">
            <button className="ft-filter-pill">
              <MapPin size={13} />
              {location || "Location"}
              <ChevronDown size={12} />
            </button>

            {badges.map(b => {
              const opt = BADGE_OPTIONS.find(o => o.id === b);
              return (
                <button key={b} className="ft-filter-pill active"
                  onClick={() => toggleBadge(b)}>
                  {opt?.icon} {opt?.label} <X size={11} />
                </button>
              );
            })}

            {successRate && (
              <button className="ft-filter-pill active"
                onClick={() => setSuccessRate("")}>
                ✅ {successRate}%+ success <X size={11} />
              </button>
            )}

            <select className="ft-sort-select"
              value={sort} onChange={e => setSort(e.target.value)}>
              <option value="relevance">Best Match</option>
              <option value="rate_asc">Rate: Low to High</option>
              <option value="rate_desc">Rate: High to Low</option>
              <option value="success">Job Success</option>
              <option value="earned">Most Earned</option>
            </select>
          </div>

          {loading ? (
            <div className="ft-loading">Loading freelancers...</div>
          ) : shown.length > 0 ? (
            shown.map(fl => (
              <FtFreelancerCard
                key={fl.id}
                fl={fl}
                onInvite={(name) => notify(`Invitation sent to ${name}!`)}
              />
            ))
          ) : (
            <div className="ft-empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="ft-empty-icon" style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div className="ft-empty-title" style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
                Hech qanday mutaxassis topilmadi
              </div>
              <div className="ft-empty-sub" style={{ color: '#666', marginBottom: 24 }}>
                Filtrlarni yoki qidiruv so'zini o'zgartirib ko'ring
              </div>
              {activeFilterCount > 0 && (
                <button 
                  className="ft-clear-btn" 
                  onClick={clearFilters}
                  style={{ 
                    background: '#14a800', color: '#fff', border: 'none', 
                    padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' 
                  }}
                >
                  Barcha filtrlarni tozalash ({activeFilterCount})
                </button>
              )}
            </div>
          )}

          {shown.length > 0 && (
            <div className="ft-load-more">
              <button className="ft-load-more-btn"
                onClick={() => notify("Loading more freelancers...")}>
                <RefreshCw size={15} /> Load more
              </button>
            </div>
          )}
        </main>
      </div>

      <FtToast msg={toast} onClose={() => setToast("")} />
    </div>
  );
};

export default FindTalent;