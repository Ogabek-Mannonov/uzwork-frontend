import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, ThumbsDown, Heart, CheckCircle, ChevronDown, Award, Star } from "lucide-react";
import "../../../assets/Freelancer/FindW/FindWork.css";
import Projects from "../../components/projectsCards";
import JobDetailsDrawer from "../../components/JobDetailsDrawer";
import { useTranslation } from "react-i18next";
import { getMyProfile } from "../../../api/profile";
import { getMyPortfolio, getMyCertifications } from "../../../api/freelancer";
import { useCurrency } from "../../components/Currency/CurrencyContext";

export default function FindWork() {
  const { t } = useTranslation();
  const { currency, formatAmount } = useCurrency();
  const [searchParams] = useSearchParams();
  
  // States
  const [activeTab, setActiveTab] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearch, setTempSearch] = useState(""); 
  
  // Drawer State
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [jobType, setJobType] = useState("all"); 
  const [budgetRange, setBudgetRange] = useState("all");
  const [proposalsTier, setProposalsTier] = useState("all");
  const [clientHistory, setClientHistory] = useState("all");
  const [sortBy, setSortBy] = useState("created_at"); 
  const [sortOrder, setSortOrder] = useState("DESC");

  // User details
  const [userData, setUserData] = useState(null);

  // Calculate profile completion percentage
  const { profileCompletion, completionItems } = useMemo(() => {
    if (!userData) return { profileCompletion: 0, completionItems: [] };
    
    // We assume userData here has combined user + profile data from fetch
    const profile = userData; 
    const checks = [
      { label: t("findWork.layout.sidebar.checklist.avatar"), done: !!userData?.avatar_url },
      { label: t("findWork.layout.sidebar.checklist.name"), done: !!(userData?.first_name && userData?.last_name) },
      { label: t("findWork.layout.sidebar.checklist.title"), done: !!(profile?.title?.trim && profile.title.trim()) },
      { label: t("findWork.layout.sidebar.checklist.bio"), done: !!(profile?.bio && profile.bio.length >= 20) },
      { label: t("findWork.layout.sidebar.checklist.skills"), done: (() => {
          try {
            const parsed = typeof profile?.skills === 'string' ? JSON.parse(profile.skills) : profile?.skills;
            return Array.isArray(parsed) ? parsed.length >= 1 : false;
          } catch(e) { return false; }
      })() },
      { label: t("findWork.layout.sidebar.checklist.rate"), done: !!(profile?.hourly_rate && Number(profile.hourly_rate) > 0) },
      { label: t("findWork.layout.sidebar.checklist.category"), done: !!profile?.category_id },
      { label: t("findWork.layout.sidebar.checklist.location"), done: !!(profile?.location?.trim && profile.location.trim()) },
      { label: t("findWork.layout.sidebar.checklist.portfolio"), done: !!userData?.has_portfolio },
      { label: t("findWork.layout.sidebar.checklist.certification"), done: !!userData?.has_certifications },
    ];
    const done = checks.filter(c => c.done).length;
    const pct = Math.round((done / checks.length) * 100);
    return { profileCompletion: pct, completionItems: checks };
  }, [userData, t]);

  useEffect(() => {
    // Load basic user from localStorage first for fast render
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUserData(JSON.parse(stored));
    } catch(e) {}

    // Then fetch full profile from API for accurate completion
    const fetchProfile = async () => {
      try {
        // Fetch all 3 in parallel
        const [profileRes, portfolioRes, certRes] = await Promise.all([
          getMyProfile(),
          getMyPortfolio(),
          getMyCertifications(),
        ]);

        let user = {}, profile = {}, portfolioItems = [], certifications = [];

        if (profileRes?.success) {
          user = profileRes.data?.user || profileRes.data || {};
          profile = profileRes.data?.profile || profileRes.data || {};
        }

        if (portfolioRes?.success) {
          portfolioItems = portfolioRes.data?.portfolio || portfolioRes.data?.items || (Array.isArray(portfolioRes.data) ? portfolioRes.data : []);
        }

        if (certRes?.success) {
          certifications = certRes.data?.certifications || (Array.isArray(certRes.data) ? certRes.data : []);
        }
        setUserData(prev => ({ 
          ...prev, 
          ...user, 
          ...profile, 
          has_portfolio: portfolioItems.length > 0,
          has_certifications: certifications.length > 0
        }));
      } catch(e) {
        console.error("Profile completion fetch error:", e);
      }
    };
    fetchProfile();

    // Foydalanuvchi boshqa tabdan qaytib kelganda foizni qayta hisoblasin
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProfile();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Sync search from URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
      setTempSearch(q);
    }
  }, [searchParams]);


  const handleProjectClick = async (job) => {
    try {
      // Fetch full details to get client analytics (rating, hire rate, etc.)
      const { getJobById } = await import("../../../api/jobs");
      const res = await getJobById(job.id);
      if (res?.success) {
        setSelectedJob(res.data.project || res.data);
      } else {
        setSelectedJob(job); // Fallback to list data
      }
    } catch (e) {
      console.error("Error fetching full job details:", e);
      setSelectedJob(job);
    }
    setIsDrawerOpen(true);
  };

  const handleSaveToggle = (jobId) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const tabs = [
    { id: "recommended", label: t("findWork.layout.tabs.recommended") },
    { id: "recent", label: t("findWork.layout.tabs.recent") },
    { id: "saved", label: t("findWork.layout.tabs.saved") },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(tempSearch);
  };

  const parseBudget = (rangeStr) => {
    if (rangeStr === 'all') return { min: null, max: null };
    if (rangeStr === '0-100') return { min: 0, max: 100 };
    if (rangeStr === '100-500') return { min: 100, max: 500 };
    if (rangeStr === '500-1000') return { min: 500, max: 1000 };
    if (rangeStr === '1000+') return { min: 1000, max: null };
    return { min: null, max: null };
  };

  const { min: minBudget, max: maxBudget } = parseBudget(budgetRange);

  return (
    <div className="fw-layout">
      <div className="fw-container">
        {/* LEFT SIDEBAR (FILTERS) */}
        <aside className={`fw-sidebar-left ${showFilters ? "mobile-open" : ""}`}>
          <div className="fw-filter-sidebar-header">
            <h3>{t("findWork.layout.filters.title") || "Filtrlar"}</h3>
            <button className="fw-close-filters-mobile" onClick={() => setShowFilters(false)}>✕</button>
          </div>

          <div className="fw-filter-group">
            <h4>{t("findWork.layout.filters.jobType")}</h4>
            <label className="fw-filter-radio">
              <input type="radio" name="jobType" value="all" checked={jobType === "all"} onChange={(e) => setJobType(e.target.value)} /> {t("findWork.layout.filters.all")}
            </label>
            <label className="fw-filter-radio">
              <input type="radio" name="jobType" value="hourly" checked={jobType === "hourly"} onChange={(e) => setJobType(e.target.value)} /> {t("findWork.layout.filters.hourly")}
            </label>
            <label className="fw-filter-radio">
              <input type="radio" name="jobType" value="fixed" checked={jobType === "fixed"} onChange={(e) => setJobType(e.target.value)} /> {t("findWork.layout.filters.fixed")}
            </label>
          </div>

          <div className="fw-filter-group">
            <h4>{t("findWork.layout.filters.proposalsCount") || "Takliflar soni"}</h4>
            <label className="fw-filter-radio">
              <input type="radio" name="proposals" value="all" checked={proposalsTier === "all"} onChange={(e) => setProposalsTier(e.target.value)} /> {t("findWork.layout.filters.all")}
            </label>
            <label className="fw-filter-radio">
              <input type="radio" name="proposals" value="less_5" checked={proposalsTier === "less_5"} onChange={(e) => setProposalsTier(e.target.value)} /> {t("findWork.layout.filters.lessThan5") || "5 tadan kam"}
            </label>
            <label className="fw-filter-radio">
              <input type="radio" name="proposals" value="5_10" checked={proposalsTier === "5_10"} onChange={(e) => setProposalsTier(e.target.value)} /> {t("findWork.layout.filters.5to10") || "5 dan 10 tagacha"}
            </label>
            <label className="fw-filter-radio">
              <input type="radio" name="proposals" value="10_15" checked={proposalsTier === "10_15"} onChange={(e) => setProposalsTier(e.target.value)} /> {t("findWork.layout.filters.10to15") || "10 dan 15 tagacha"}
            </label>
            <label className="fw-filter-radio">
              <input type="radio" name="proposals" value="15_50" checked={proposalsTier === "15_50"} onChange={(e) => setProposalsTier(e.target.value)} /> {t("findWork.layout.filters.15to50") || "15 dan 50 tagacha"}
            </label>
          </div>

          <div className="fw-filter-group">
            <h4>{t("findWork.layout.filters.clientHistory") || "Mijoz tarixi"}</h4>
            <label className="fw-filter-radio">
              <input type="radio" name="clientHistory" value="all" checked={clientHistory === "all"} onChange={(e) => setClientHistory(e.target.value)} /> {t("findWork.layout.filters.all")}
            </label>
            <label className="fw-filter-radio">
              <input type="radio" name="clientHistory" value="no_hires" checked={clientHistory === "no_hires"} onChange={(e) => setClientHistory(e.target.value)} /> {t("findWork.layout.filters.newClient") || "Yangi mijoz (xarajati yo'q)"}
            </label>
            <label className="fw-filter-radio">
              <input type="radio" name="clientHistory" value="has_hires" checked={clientHistory === "has_hires"} onChange={(e) => setClientHistory(e.target.value)} /> {t("findWork.layout.filters.hasSpent") || "Xarajat qilgan mijoz"}
            </label>
          </div>

          <div className="fw-filter-group">
            <h4>{t("findWork.layout.filters.budget")}</h4>
            <select className="fw-filter-select-full" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}>
              <option value="all">{t("findWork.layout.filters.anyAmount")}</option>
              <option value="0-100">{formatAmount(0, 'USD')} - {formatAmount(100, 'USD')}</option>
              <option value="100-500">{formatAmount(100, 'USD')} - {formatAmount(500, 'USD')}</option>
              <option value="500-1000">{formatAmount(500, 'USD')} - {formatAmount(1000, 'USD')}</option>
              <option value="1000+">{formatAmount(1000, 'USD')} +</option>
            </select>
          </div>

          <div className="fw-filter-group">
            <h4>{t("findWork.layout.filters.sort")}</h4>
            <select className="fw-filter-select-full" value={`${sortBy}|${sortOrder}`} onChange={(e) => {
              const [sb, so] = e.target.value.split('|'); 
              setSortBy(sb); setSortOrder(so);
            }}>
              <option value="created_at|DESC">{t("findWork.layout.filters.newestFirst")}</option>
              <option value="budget_min|DESC">{t("findWork.layout.filters.highestBudget")}</option>
              <option value="budget_min|ASC">{t("findWork.layout.filters.lowestBudget")}</option>
            </select>
          </div>
        </aside>

        {/* MAIN COLUMN (Center: ~50-60%) */}
        <main className="fw-main-col fw-middle-col">
          
          {/* BANNER */}
          <div className="fw-banner">
            <div className="fw-banner-content">
              <h3>{t("findWork.layout.bannerSub")}</h3>
              <h2>{t("findWork.layout.bannerTitle")}</h2>
              <button className="fw-banner-btn">{t("findWork.layout.bannerBtn")}</button>
            </div>
            <div className="fw-banner-graphics">
              {/* Abstract document / graphics representation */}
              <div className="fw-banner-img"></div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <form className="fw-search-box" onSubmit={handleSearchSubmit}>
            <Search className="fw-search-icon-inside" size={20} />
            <input 
              type="text" 
              placeholder={t("findWork.layout.searchPlaceholder")} 
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              className="fw-search-input-main"
            />
          </form>

          {/* TITLE & TABS ROW */}
          <div className="fw-feed-header">
            <h1 className="fw-main-title">{t("findWork.layout.mainTitle")}</h1>
            
            <div className="fw-tabs-and-filters">
              <div className="fw-tabs-row">
                {tabs.map(tab => (
                  <button 
                    key={tab.id}
                    className={`fw-tab-link ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="fw-tabs-subtitle">
              {t("findWork.layout.tabsSubtitle")}
            </p>
          </div>

          {/* FILTERS NOW MOVED TO LEFT SIDEBAR */}

          {/* PROJECTS LIST */}
          <div className="fw-projects-container">
            <Projects 
              activeTab={activeTab} 
              searchQuery={searchQuery}
              jobType={jobType === 'all' ? null : jobType}
              minBudget={minBudget}
              maxBudget={maxBudget}
              proposalsTier={proposalsTier === 'all' ? null : proposalsTier}
              clientHistory={clientHistory === 'all' ? null : clientHistory}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onProjectClick={handleProjectClick}
            />
          </div>

        </main>

        {/* RIGHT SIDEBAR (~30%) */}
        {/* ... existing sidebar code ... */}
        <aside className="fw-sidebar-right">
          
          {/* Profile Card */}
          <div className="fw-card fw-profile-card">
            <div className="fw-profile-header">
              <img src={userData?.avatar_url || `https://ui-avatars.com/api/?name=${userData?.first_name || 'User'}+${userData?.last_name || ''}&background=3b82f6&color=fff`} alt="Avatar" className="fw-profile-avatar" />
              <div className="fw-profile-info">
                <a href="/profile" className="fw-profile-name">{userData?.first_name} {userData?.last_name || "M."}</a>
                <p className="fw-profile-role">{userData?.title || "Freelancer"}</p>
              </div>
            </div>
            
            <div className="fw-profile-progress">
              <div className="fw-progress-text">
                <a href="/profile">{t("findWork.layout.sidebar.completeProfile")}</a>
                <span className={`fw-progress-pct ${profileCompletion === 100 ? 'complete' : ''}`}>
                  {profileCompletion}%
                </span>
              </div>
              <div className="fw-progress-bar-bg">
                <div 
                  className="fw-progress-bar-fill" 
                  style={{ 
                    width: `${profileCompletion}%`,
                    background: profileCompletion === 100 
                      ? 'linear-gradient(90deg, #10b981, #059669)'
                      : profileCompletion >= 70
                      ? 'linear-gradient(90deg, #3b82f6, #6366f1)'
                      : profileCompletion >= 40
                      ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                      : 'linear-gradient(90deg, #ef4444, #f97316)'
                  }}
                ></div>
              </div>
              {/* Checklist of missing items */}
              {profileCompletion < 100 && completionItems.length > 0 && (
                <div className="fw-completion-checklist">
                  {completionItems.map((item, i) => (
                    <div key={i} className={`fw-completion-item ${item.done ? 'done' : 'missing'}`}>
                      <span className="fw-check-icon">{item.done ? '✓' : '○'}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 100% Success Message */}
              {profileCompletion === 100 && (
                <div className="fw-completion-success" style={{ marginTop: '12px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#059669', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <CheckCircle size={16} color="#10b981" /> {t("findWork.layout.sidebar.checklist.completeMsg")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Identity Verification */}
          <div className="fw-card fw-id-card">
            <h3 className="fw-card-title"><Award size={20} /> {t("findWork.layout.sidebar.idVerification")}</h3>
            <p className="fw-card-desc">
              {t("findWork.layout.sidebar.idVerificationDesc")}
            </p>
            <a href="#" className="fw-card-link">{t("findWork.layout.sidebar.enrollNow")}</a>
          </div>

          {/* Promote with ads */}
          <div className="fw-card fw-ads-card">
            <div className="fw-card-header-flex">
              <h3 className="fw-card-title">{t("findWork.layout.sidebar.promoteAds")}</h3>
              <ChevronDown size={20} color="#6b7280" />
            </div>

            <div className="fw-ad-item">
              <div className="fw-ad-text">
                <span>{t("findWork.layout.sidebar.availabilityBadge")}</span>
                <small>{t("findWork.layout.sidebar.off")}</small>
              </div>
              <button className="fw-icon-btn"><Star size={18} /></button>
            </div>

            <div className="fw-ad-item">
              <div className="fw-ad-text">
                <span>{t("findWork.layout.sidebar.boostProfile")}</span>
                <small>{t("findWork.layout.sidebar.off")}</small>
              </div>
              <button className="fw-icon-btn"><Star size={18} /></button>
            </div>

            <a href="#" className="fw-card-link mt-8">{t("findWork.layout.sidebar.statsAnalytics")}</a>
          </div>

        </aside>

      </div>

      {/* JOB DETAILS DRAWER */}
      <JobDetailsDrawer 
        isOpen={isDrawerOpen}
        job={selectedJob}
        onClose={() => setIsDrawerOpen(false)}
        savedIds={[...savedIds]}
        onSaveToggle={handleSaveToggle}
      />
    </div>
  );
}
