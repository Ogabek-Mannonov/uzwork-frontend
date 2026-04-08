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
    { id: "recommended", label: "Eng mos keladigan" },
    { id: "recent", label: "Eng yangi" },
    { id: "saved", label: "Saqlangan ishlar" },
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
              <h3>To'g'ridan-to'g'ri shartnomalar</h3>
              <h2>Yangi mijozlarni UzWork ga olib keling va 5% lik past xizmat haqi orqali daromadingizni oshiring.</h2>
              <button className="fw-banner-btn">Shartnoma yaratish</button>
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
              placeholder="Ishlarni qidirish..." 
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              className="fw-search-input-main"
            />
          </form>

          {/* TITLE & TABS ROW */}
          <div className="fw-feed-header">
            <h1 className="fw-main-title">Siz uchun mos ishlar</h1>
            
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
                <Filter size={18} /> Filtrlar
              </button>
            </div>

            <p className="fw-tabs-subtitle">
              Sizning qobiliyatingizga mos keladigan loyihalar. 
              Mijozning yollash tarixi asosida tartiblangan.
            </p>
          </div>

          {/* EXPANDABLE FILTERS SECTION */}
          {showFilters && (
            <div className="fw-expandable-filters">
              <div className="fw-filter-box">
                <span className="fw-filter-label">Ish turi:</span>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                  <option value="all">Barchasi</option>
                  <option value="fixed">Belgilangan pul (Fixed)</option>
                  <option value="hourly">Soatbay (Hourly)</option>
                </select>
              </div>

              <div className="fw-filter-box">
                <span className="fw-filter-label">Byudjet:</span>
                <select value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}>
                  <option value="all">Istalgan summa</option>
                  <option value="0-100">$100 gacha</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500-1000">$500 - $1K</option>
                  <option value="1000+">$1K dan yuqori</option>
                </select>
              </div>

              <div className="fw-filter-box">
                <span className="fw-filter-label">Tartiblash:</span>
                <select value={`${sortBy}|${sortOrder}`} onChange={(e) => {
                  const [sb, so] = e.target.value.split('|'); 
                  setSortBy(sb); setSortOrder(so);
                }}>
                  <option value="created_at|DESC">Eng yangi birinchi</option>
                  <option value="budget_min|DESC">Katta byudjetli</option>
                  <option value="budget_min|ASC">Kichik byudjetli</option>
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
                <a href="/profile">Profilingizni to'ldiring</a>
                <span className="fw-progress-pct">70%</span>
              </div>
              <div className="fw-progress-bar-bg">
                <div className="fw-progress-bar-fill" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>

          {/* Identity Verification */}
          <div className="fw-card fw-id-card">
            <h3 className="fw-card-title"><Award size={20} /> Shaxsni tasdiqlash</h3>
            <p className="fw-card-desc">
              Qidiruv natijalarida profilingiz ko'rinishini oshiring va IDV nishoni bilan ko'proq ishlarga ega bo'ling.
            </p>
            <a href="#" className="fw-card-link">Ro'yxatdan o'tish</a>
          </div>

          {/* Promote with ads */}
          <div className="fw-card fw-ads-card">
            <div className="fw-card-header-flex">
              <h3 className="fw-card-title">Reklama orqali targ'ib qilish</h3>
              <ChevronDown size={20} color="#6b7280" />
            </div>

            <div className="fw-ad-item">
              <div className="fw-ad-text">
                <span>Mavjudlik nishoni (Available badge)</span>
                <small>O'chirilgan</small>
              </div>
              <button className="fw-icon-btn"><Star size={18} /></button>
            </div>

            <div className="fw-ad-item">
              <div className="fw-ad-text">
                <span>Profilingizni ko'tarish</span>
                <small>O'chirilgan</small>
              </div>
              <button className="fw-icon-btn"><Star size={18} /></button>
            </div>

            <a href="#" className="fw-card-link mt-8">Statistika va tahlillar</a>
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
