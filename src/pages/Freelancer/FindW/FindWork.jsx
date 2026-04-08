import { useState, useEffect } from "react";
import { Search, Filter, ThumbsDown, Heart, CheckCircle, ChevronDown, Award, Star } from "lucide-react";
import "../../../assets/Freelancer/FindW/FindWork.css";
import Projects from "../../components/projectsCards";
import JobDetailsDrawer from "../../components/JobDetailsDrawer";
import { useTranslation } from "react-i18next";

export default function FindWork() {
  const { t } = useTranslation();
  
  // States
  const [activeTab, setActiveTab] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearch, setTempSearch] = useState(""); 
  
  // Drawer State
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter States (hidden behind a toggle if needed, or simple right now)
  const [showFilters, setShowFilters] = useState(false);
  const [jobType, setJobType] = useState("all"); 
  const [budgetRange, setBudgetRange] = useState("all"); 
  const [sortBy, setSortBy] = useState("created_at"); 
  const [sortOrder, setSortOrder] = useState("DESC");

  // User details
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUserData(JSON.parse(stored));
    } catch(e) {}
  }, []);

  const handleProjectClick = (job) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
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
        
        {/* MAIN COLUMN (Left: ~70%) */}
        <main className="fw-main-col">
          
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

              <button 
                className={`fw-filter-toggle ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} /> {t("findWork.layout.filterToggle")}
              </button>
            </div>

            <p className="fw-tabs-subtitle">
              {t("findWork.layout.tabsSubtitle")}
            </p>
          </div>

          {/* EXPANDABLE FILTERS SECTION */}
          {showFilters && (
            <div className="fw-expandable-filters">
              <div className="fw-filter-box">
                <span className="fw-filter-label">{t("findWork.layout.filters.jobType")}:</span>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                  <option value="all">{t("findWork.layout.filters.all")}</option>
                  <option value="fixed">{t("findWork.layout.filters.fixed")}</option>
                  <option value="hourly">{t("findWork.layout.filters.hourly")}</option>
                </select>
              </div>

              <div className="fw-filter-box">
                <span className="fw-filter-label">{t("findWork.layout.filters.budget")}:</span>
                <select value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}>
                  <option value="all">{t("findWork.layout.filters.anyAmount")}</option>
                  <option value="0-100">{t("findWork.layout.filters.upTo100")}</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500-1000">$500 - $1K</option>
                  <option value="1000+">$1K +</option>
                </select>
              </div>

              <div className="fw-filter-box">
                <span className="fw-filter-label">{t("findWork.layout.filters.sort")}:</span>
                <select value={`${sortBy}|${sortOrder}`} onChange={(e) => {
                  const [sb, so] = e.target.value.split('|'); 
                  setSortBy(sb); setSortOrder(so);
                }}>
                  <option value="created_at|DESC">{t("findWork.layout.filters.newestFirst")}</option>
                  <option value="budget_min|DESC">{t("findWork.layout.filters.highestBudget")}</option>
                  <option value="budget_min|ASC">{t("findWork.layout.filters.lowestBudget")}</option>
                </select>
              </div>
            </div>
          )}

          {/* PROJECTS LIST */}
          <div className="fw-projects-container">
            <Projects 
              activeTab={activeTab} 
              searchQuery={searchQuery}
              jobType={jobType === 'all' ? null : jobType}
              minBudget={minBudget}
              maxBudget={maxBudget}
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
              <img src={userData?.avatar_url || "https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff"} alt="Avatar" className="fw-profile-avatar" />
              <div className="fw-profile-info">
                <a href="/profile" className="fw-profile-name">{userData?.first_name} {userData?.last_name || "M."}</a>
                <p className="fw-profile-role">{userData?.title || "Freelancer"}</p>
              </div>
            </div>
            
            <div className="fw-profile-progress">
              <div className="fw-progress-text">
                <a href="/profile">{t("findWork.layout.sidebar.completeProfile")}</a>
                <span className="fw-progress-pct">70%</span>
              </div>
              <div className="fw-progress-bar-bg">
                <div className="fw-progress-bar-fill" style={{ width: '70%' }}></div>
              </div>
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
        onToggleLike={() => {
            // This is a bit complex as likedIds is inside Projects component. 
            // For now, let's keep it simple or just show the info.
        }}
        isLiked={false}
      />
    </div>
  );
}
