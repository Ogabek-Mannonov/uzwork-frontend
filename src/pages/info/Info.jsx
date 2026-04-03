import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Users,
  Award,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Rocket,
  Code,
  Palette,
  BarChart,
  MessageSquare,
  FileText,
  Video,
  Target,
  Settings,
  Landmark,
  Scale,
  UserCog,
  Wrench,
  HelpCircle,
  ChevronDown,
  UserCheck,
  Gift,
  DollarSign,
  Moon,
  Sun,
  Search,
} from "lucide-react";
import "./infocss/info.css";
import Footer from "../footer/Footer";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader/AppHeader";
import { useTranslation } from "react-i18next";

const Info = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("client");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeFaq, setActiveFaq] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("darkMode", JSON.stringify(next));
      return next;
    });
  };
  const [heroTab, setHeroTab] = useState("hire"); // "hire" | "work"
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/talent?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search/talent");
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [isDarkMode]);







  const categories = [
    {
      icon: <Sparkles />,
      title: t("info.categories.ai"),
      count: "25K+",
      color: "#22c55e",
    },
    {
      icon: <Code />,
      title: t("info.categories.dev"),
      count: "18K+",
      color: "#3b82f6",
    },
    {
      icon: <Palette />,
      title: t("info.categories.design"),
      count: "9.5K+",
      color: "#a855f7",
    },
    {
      icon: <BarChart />,
      title: t("info.categories.marketing"),
      count: "12K+",
      color: "#f97316",
    },
    {
      icon: <FileText />,
      title: t("info.categories.writing"),
      count: "15K+",
      color: "#eab308",
    },
    {
      icon: <Settings />,
      title: t("info.categories.admin"),
      count: "8K+",
      color: "#10b981",
    },
    {
      icon: <Landmark />,
      title: t("info.categories.finance"),
      count: "11K+",
      color: "#06b6d4",
    },
    { icon: <Scale />, title: t("info.categories.legal"), count: "6K+", color: "#14b8a6" },
    {
      icon: <UserCog />,
      title: t("info.categories.hr"),
      count: "7.5K+",
      color: "#6366f1",
    },
    {
      icon: <Wrench />,
      title: t("info.categories.engineering"),
      count: "5K+",
      color: "#8b5cf6",
    },
  ];

  const features = [
    {
      icon: <Shield />,
      title: t("info.features.safeTitle"),
      desc: t("info.features.safeDesc"),
    },
    { icon: <Zap />, title: t("info.features.aiTitle"), desc: t("info.features.aiDesc") },
    {
      icon: <Globe />,
      title: t("info.features.globalTitle"),
      desc: t("info.features.globalDesc"),
    },
    {
      icon: <Award />,
      title: t("info.features.verifiedTitle"),
      desc: t("info.features.verifiedDesc"),
    },
  ];

  // const stats = [
  //   { icon: <Users />, value: "1M+", label: "Foydalanuvchi" },
  //   { icon: <Briefcase />, value: "500K+", label: "Loyiha" },
  //   { icon: <Star />, value: "4.9★", label: "Reyting" },
  //   { icon: <TrendingUp />, value: "$2B+", label: "To'langan" },
  // ];

  const clientSteps = [
    {
      title: t("info.clientSteps.step1Title"),
      desc: t("info.clientSteps.step1Desc"),
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    },
    {
      title: t("info.clientSteps.step2Title"),
      desc: t("info.clientSteps.step2Desc"),
      image:
        "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=800&h=600&fit=crop",
    },
    {
      title: t("info.clientSteps.step3Title"),
      desc: t("info.clientSteps.step3Desc"),
      image:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
    },
  ];

  const freelancerSteps = [
    {
      title: t("info.freelancerSteps.step1Title"),
      desc: t("info.freelancerSteps.step1Desc"),
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
    },
    {
      title: t("info.freelancerSteps.step2Title"),
      desc: t("info.freelancerSteps.step2Desc"),
      image:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    },
    {
      title: t("info.freelancerSteps.step3Title"),
      desc: t("info.freelancerSteps.step3Desc"),
      image:
        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
    },
  ];

  const topFreelancers = {
    "Sun'iy intellekt xizmatlari": [
      {
        name: "Bobur Ismoilov",
        title: "ML Engineer",
        rating: 5.0,
        jobs: 78,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
        hourlyRate: "$65",
      },
      {
        name: "Jamshid Holmatov",
        title: "AI Specialist",
        rating: 4.9,
        jobs: 56,
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop",
        hourlyRate: "$60",
      },
      {
        name: "Aziza Tursunova",
        title: "Data Scientist",
        rating: 4.9,
        jobs: 64,
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
        hourlyRate: "$58",
      },
    ],
    "Rivojlanish va IT": [
      {
        name: "Sardor Alimov",
        title: "Full Stack Developer",
        rating: 5.0,
        jobs: 142,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
        hourlyRate: "$50",
      },
      {
        name: "Aziz Karimov",
        title: "React Developer",
        rating: 4.9,
        jobs: 98,
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
        hourlyRate: "$45",
      },
      {
        name: "Jasur Rahimov",
        title: "Backend Engineer",
        rating: 4.9,
        jobs: 87,
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
        hourlyRate: "$55",
      },
    ],
    "Dizayn va ijodiy": [
      {
        name: "Malika Yusupova",
        title: "UI/UX Designer",
        rating: 5.0,
        jobs: 156,
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
        hourlyRate: "$40",
      },
      {
        name: "Nigora Saidova",
        title: "Graphic Designer",
        rating: 4.9,
        jobs: 123,
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
        hourlyRate: "$38",
      },
      {
        name: "Dilshod Tursunov",
        title: "Product Designer",
        rating: 4.8,
        jobs: 94,
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop",
        hourlyRate: "$42",
      },
    ],
    "Savdo va marketing": [
      {
        name: "Shohida Abdullayeva",
        title: "Digital Marketing",
        rating: 5.0,
        jobs: 134,
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
        hourlyRate: "$35",
      },
      {
        name: "Rustam Normatov",
        title: "SEO Specialist",
        rating: 4.9,
        jobs: 112,
        avatar:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop",
        hourlyRate: "$32",
      },
      {
        name: "Madina Ergasheva",
        title: "SMM Manager",
        rating: 4.8,
        jobs: 89,
        avatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop",
        hourlyRate: "$30",
      },
    ],
    "Yozish va tarjima": [
      {
        name: "Laylo Mahmudova",
        title: "Content Writer",
        rating: 5.0,
        jobs: 167,
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop",
        hourlyRate: "$28",
      },
      {
        name: "Farida Qodirova",
        title: "Copywriter",
        rating: 4.9,
        jobs: 145,
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
        hourlyRate: "$30",
      },
      {
        name: "Otabek Nurmatov",
        title: "Translator",
        rating: 4.8,
        jobs: 121,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
        hourlyRate: "$26",
      },
    ],
    "Administrator va qo'llab-quvvatlash": [
      {
        name: "Zilola Rahmonova",
        title: "Customer Support",
        rating: 5.0,
        jobs: 198,
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
        hourlyRate: "$22",
      },
      {
        name: "Gulnora Ismatova",
        title: "Virtual Assistant",
        rating: 4.9,
        jobs: 176,
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
        hourlyRate: "$20",
      },
      {
        name: "Bekzod Sharipov",
        title: "Admin Support",
        rating: 4.8,
        jobs: 143,
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
        hourlyRate: "$24",
      },
    ],
    "Moliya va buxgalteriya hisobi": [
      {
        name: "Kamola Yuldasheva",
        title: "Accountant",
        rating: 5.0,
        jobs: 112,
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
        hourlyRate: "$38",
      },
      {
        name: "Javohir Mahmudov",
        title: "Financial Analyst",
        rating: 4.9,
        jobs: 87,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
        hourlyRate: "$42",
      },
      {
        name: "Dilnoza Karimova",
        title: "Bookkeeper",
        rating: 4.8,
        jobs: 95,
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
        hourlyRate: "$35",
      },
    ],
    Huquqiy: [
      {
        name: "Akmal Sobirov",
        title: "Legal Consultant",
        rating: 5.0,
        jobs: 89,
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
        hourlyRate: "$55",
      },
      {
        name: "Nodira Rahimova",
        title: "Contract Lawyer",
        rating: 4.9,
        jobs: 67,
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
        hourlyRate: "$52",
      },
      {
        name: "Sherzod Aliyev",
        title: "Legal Advisor",
        rating: 4.8,
        jobs: 73,
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
        hourlyRate: "$48",
      },
    ],
    "HR va trening": [
      {
        name: "Feruza Ergasheva",
        title: "HR Manager",
        rating: 5.0,
        jobs: 123,
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
        hourlyRate: "$40",
      },
      {
        name: "Rustam Akbarov",
        title: "Corporate Trainer",
        rating: 4.9,
        jobs: 98,
        avatar:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop",
        hourlyRate: "$38",
      },
      {
        name: "Dildora Nurmatova",
        title: "Recruiter",
        rating: 4.8,
        jobs: 87,
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
        hourlyRate: "$35",
      },
    ],
    "Muhandislik va arxitektura": [
      {
        name: "Davron Mirzayev",
        title: "Civil Engineer",
        rating: 5.0,
        jobs: 67,
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
        hourlyRate: "$50",
      },
      {
        name: "Sanjar Tursunov",
        title: "Architect",
        rating: 4.9,
        jobs: 54,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
        hourlyRate: "$55",
      },
      {
        name: "Zarina Karimova",
        title: "Interior Designer",
        rating: 4.8,
        jobs: 72,
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
        hourlyRate: "$45",
      },
    ],
  };

  const avatarMap = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
  ];

  const testimonials = (t("info.testimonials", { returnObjects: true }) || []).map((item, i) => ({
    ...item,
    rating: 5,
    avatar: avatarMap[i % avatarMap.length],
  }));


  return (
    <div className="uzwork-landing">
      <AppHeader />

      {/* Hero */}
      <section className="hero-section">
        {/* Decorative dots pattern */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: "250px",
            height: "250px",
            backgroundImage:
              "radial-gradient(circle, rgba(59, 130, 246, 0.12) 2px, transparent 2px)",
            backgroundSize: "24px 24px",
            borderRadius: "50%",
            opacity: 0.6,
            zIndex: 0,
            pointerEvents: "none",
          }}
        ></div>

        {/* Decorative dots pattern - bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "8%",
            width: "200px",
            height: "200px",
            backgroundImage:
              "radial-gradient(circle, rgba(139, 92, 246, 0.1) 2px, transparent 2px)",
            backgroundSize: "20px 20px",
            borderRadius: "50%",
            opacity: 0.5,
            zIndex: 0,
            pointerEvents: "none",
          }}
        ></div>

        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px)
          `,
            backgroundSize: "60px 60px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        ></div>

        <div className="hero-container">
          {/* LEFT */}
          <div className="hero-left">
            <div className="hero-badge">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>{t("info.heroBadge")}</span>
            </div>

            <h1 className="hero-title">
              <span className="title-dark">{t("info.heroTitle1")} </span>
              <span className="title-gradient">{t("info.heroTitle2")}</span>
            </h1>

            <p className="hero-desc">
              {t("info.heroDesc")}
            </p>

            <div className="hero-quick">
              <div className="hero-quick__tabs" role="tablist" aria-label="Hero Tabs">
                <button
                  type="button"
                  className={`hero-quick__tab ${heroTab === "hire" ? "is-active" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setHeroTab("hire");
                    setIsHeroOpen(false); // workdan qaytsa yopib turamiz
                  }}
                  role="tab"
                  aria-selected={heroTab === "hire"}
                >
                  {t("info.tabHire")}
                </button>

                <button
                  type="button"
                  className={`hero-quick__tab ${heroTab === "work" ? "is-active" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setHeroTab("work");
                    setIsHeroOpen(false); // hire dropdown ochiq bo‘lsa yopiladi
                  }}
                  role="tab"
                  aria-selected={heroTab === "work"}
                >
                  {t("info.tabWork")}
                </button>
              </div>

              {/* HIRE */}
              {heroTab === "hire" && (
                <div className="hero-quick__panel">
                  <form className="hero-quick__search" onSubmit={handleSearch}>
                    <div className="hero-quick__input-wrapper">
                      <Search className="hero-quick__search-icon" />
                      <input
                        type="text"
                        className="hero-quick__input"
                        placeholder={t("info.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="hero-quick__btn">
                      {t("info.searchBtn")}
                    </button>
                  </form>
                  <div className="hero-quick__popular">
                    <span className="hero-quick__popular-title">{t("info.popularSearches")}:</span>
                    <div className="hero-quick__tags">
                      {(t("info.popularTags", { returnObjects: true }) || []).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="hero-quick__tag"
                          onClick={() => {
                            setSearchQuery(tag);
                            navigate(
                              `/search/talent?q=${encodeURIComponent(tag)}`
                            );
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* WORK */}
              {heroTab === "work" && (
                <div className="hero-quick__panel hero-quick__panel--work">
                  <div className="hero-quick__workText">
                    <div className="hero-quick__workTitle">
                      {t("info.workTitle")}
                    </div>
                    <div className="hero-quick__workDesc">
                      {t("info.workDesc")}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="hero-quick__btn hero-quick__btn--green hero-quick__btn--full"
                    onClick={() => navigate("/jobs?sort=recent")}
                  >
                    {t("info.viewLatestJobs")}<ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT (UI PREVIEW) */}
          <div className="hero-right">
            <div className="hero-preview">
              <div className="preview-glow" />

              <div className="preview-card preview-job">
                <div className="preview-header">
                  <div className="dot dot-red" />
                  <div className="dot dot-yellow" />
                  <div className="dot dot-green" />
                  <span className="preview-title">Job</span>
                </div>

                <div className="preview-body">
                  <div className="preview-line lg" />
                  <div className="preview-line md" />
                  <div className="preview-tags">
                    <span className="tag">React</span>
                    <span className="tag">Node</span>
                    <span className="tag">UI</span>
                  </div>

                  <div className="preview-row">
                    <span className="badge badge-safe">
                      <Shield className="w-4 h-4" /> {t("info.safeBadge")}
                    </span>
                    <span className="badge badge-ai">
                      <Sparkles className="w-4 h-4" /> {t("info.aiBadge")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="preview-card preview-freelancer">
                <div className="freelancer-top">
                  <div className="avatar-skeleton" />
                  <div className="freelancer-meta">
                    <div className="preview-line md" />
                    <div className="preview-line sm" />
                  </div>
                </div>

                <div className="freelancer-stats-mini">
                  <span className="mini">
                    <Star className="w-4 h-4" /> 4.9
                  </span>
                  <span className="mini">
                    <Briefcase className="w-4 h-4" /> 120+
                  </span>
                  <span className="mini">
                    <DollarSign className="w-4 h-4" /> $45/h
                  </span>
                </div>

                <button className="preview-btn">
                  {t("info.viewFreelancer")} <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="preview-floating">
                <CheckCircle className="w-4 h-4" />
                <span>{t("info.verifiedProfiles")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              {t("info.headers.exploreTitle")}
            </h2>
            <p className="section-subtitle">{t("info.headers.exploreSub")}</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <div
                key={i}
                className={`category-card ${selectedCategory === cat.title ? "active" : ""
                  }`}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.title ? null : cat.title
                  )
                }
                style={{ "--card-color": cat.color }}
              >
                <div
                  className="category-icon"
                  style={{ background: cat.color }}
                >
                  {React.cloneElement(cat.icon, {
                    className: "w-8 h-8 text-white",
                  })}
                </div>
                <h3 className="category-title">{cat.title}</h3>
                <div className="category-count">{cat.count}</div>
              </div>
            ))}
          </div>

          {/* Top Freelancers */}
          {selectedCategory && topFreelancers[selectedCategory] && (
            <div className="top-freelancers-section">
              <h3 className="freelancers-title">
                {t("info.headers.topSpecialists", { category: selectedCategory })}
              </h3>
              <div className="freelancers-grid">
                {topFreelancers[selectedCategory].map((freelancer, i) => (
                  <div
                    key={i}
                    className={`freelancer-card ${i === 1 ? "featured" : ""}`}
                  >
                    <img
                      src={freelancer.avatar}
                      alt={freelancer.name}
                      className="freelancer-avatar"
                    />
                    <div className="freelancer-info">
                      <h4 className="freelancer-name">{freelancer.name}</h4>
                      <p className="freelancer-title">{freelancer.title}</p>
                      <div className="freelancer-stats">
                        <div className="freelancer-rating">
                          <Star className="rating-star" fill="#fbbf24" />
                          <span>{freelancer.rating}</span>
                          <span className="jobs-count">
                            ({freelancer.jobs} jobs)
                          </span>
                        </div>
                      </div>
                      <div className="freelancer-rate">
                        {freelancer.hourlyRate}{t("info.perHour")}
                      </div>
                    </div>
                    <button className="freelancer-btn">{t("info.viewBtn")}</button>
                  </div>
                ))}
              </div>
              <button
                className="close-freelancers-btn"
                onClick={() => setSelectedCategory(null)}
              >
                {t("info.closeBtn")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How to Work */}
      <section className="work-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{t("info.headers.howItWorks")}</h2>
            <p className="section-subtitle">
              {t("info.headers.chooseDirection")}
            </p>
            <div className="work-tabs">
              <button
                className={`work-tab ${activeTab === "client" ? "active" : ""}`}
                onClick={() => setActiveTab("client")}
              >
                <Users className="w-4 h-4" />
                {t("info.headers.forClients")}
              </button>
              <button
                className={`work-tab ${activeTab === "freelancer" ? "active" : ""
                  }`}
                onClick={() => setActiveTab("freelancer")}
              >
                <Briefcase className="w-4 h-4" />
                {t("info.headers.forFreelancers")}
              </button>
            </div>
          </div>

          <div className="work-content">
            {activeTab === "client" ? (
              <div className="work-steps">
                {clientSteps.map((step, i) => (
                  <div key={i} className="work-step-card">
                    <div className="step-number">{i + 1}</div>
                    <div className="step-image-wrapper">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="step-image"
                      />
                      <div className="step-overlay"></div>
                    </div>
                    <div className="step-content">
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-desc">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="work-steps">
                {freelancerSteps.map((step, i) => (
                  <div key={i} className="work-step-card">
                    <div className="step-number">{i + 1}</div>
                    <div className="step-image-wrapper">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="step-image"
                      />
                      <div className="step-overlay"></div>
                    </div>
                    <div className="step-content">
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-desc">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="work-cta">
            <button className="work-cta-btn">
              {activeTab === "client"
                ? t("info.workCTAClient")
                : t("info.workCTAFreelancer")}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{t("info.headers.whyUzwork")}</h2>
            <p className="section-subtitle">{t("info.headers.trustedSolution")}</p>
          </div>
          <div className="features-grid">
            {features.map((feat, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">
                  {React.cloneElement(feat.icon, {
                    className: "w-8 h-8 text-white",
                  })}
                </div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{t("info.headers.testimonials")}</h2>
            <p className="section-subtitle">
              {t("info.headers.testimonialsSub")}
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((test, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-top">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="testimonial-avatar-top"
                  />
                  <div className="testimonial-user-info">
                    <div className="testimonial-name">{test.name}</div>
                    <div className="testimonial-role">{test.role}</div>
                  </div>
                  <div className="testimonial-stars">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="star-icon" fill="#fbbf24" />
                    ))}
                  </div>
                </div>
                <p className="testimonial-text">"{test.text}"</p>
                <div className="testimonial-company-badge">{test.company}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="find-box">
          <div className="find-box__content">
            <h3 className="find-box__title">
              {t("info.findTrustedTitle")}
            </h3>
            <p className="find-box__desc">
              {t("info.findTrustedDesc")}
            </p>
            <Link to="/search/talent" className="find-box__btn">
              {t("info.browseFreelancers")} →
            </Link>
          </div>
        </div>
      </section>



      {/* FAQ */}
      <section className="faq-section">
        <div className="faq-container">
          <div className="faq-left">
            <h2 className="faq-main-title">{t("info.headers.faq")}</h2>
            <p className="faq-subtitle">
              {t("info.faqSubtitle")}
            </p>

            <div className="faq-stats">
              <div className="faq-stat-card">
                <div className="faq-stat-icon">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="faq-stat-value">50K+</div>
                <div className="faq-stat-label">{t("info.activeUsers")}</div>
              </div>

              <div className="faq-stat-card">
                <div className="faq-stat-icon">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="faq-stat-value">100K+</div>
                <div className="faq-stat-label">{t("info.completedProjects")}</div>
              </div>

              <div className="faq-stat-card">
                <div className="faq-stat-icon">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="faq-stat-value">$5M+</div>
                <div className="faq-stat-label">{t("info.paidAmount")}</div>
              </div>

              <div className="faq-stat-card">
                <div className="faq-stat-icon">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="faq-stat-value">4.9</div>
                <div className="faq-stat-label">{t("info.avgRating")}</div>
              </div>
            </div>
          </div>

          <div className="faq-right">
            <div className={`faq-item ${activeFaq === 0 ? "active" : ""}`}>
              <div
                className="faq-question-wrapper"
                onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}
              >
                <div className="faq-question-content">
                  <div className="faq-icon">
                    <HelpCircle
                      className={`w-5 h-5 ${activeFaq === 0 ? "text-white" : "text-blue-600"
                        }`}
                    />
                  </div>
                  <h3 className="faq-question">{t("info.faqQ1")}</h3>
                </div>
                <div className="faq-toggle">
                  <ChevronDown
                    className={`w-5 h-5 ${activeFaq === 0 ? "text-white" : "text-slate-600"
                      }`}
                  />
                </div>
              </div>
              <div className="faq-answer-wrapper">
                <div className="faq-answer">
                  <p>{t("info.faqA1p1")}</p>
                  <p>{t("info.faqA1p2")}</p>
                </div>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 1 ? "active" : ""}`}>
              <div
                className="faq-question-wrapper"
                onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
              >
                <div className="faq-question-content">
                  <div className="faq-icon">
                    <Settings
                      className={`w-5 h-5 ${activeFaq === 1 ? "text-white" : "text-blue-600"
                        }`}
                    />
                  </div>
                  <h3 className="faq-question">{t("info.faqQ2")}</h3>
                </div>
                <div className="faq-toggle">
                  <ChevronDown
                    className={`w-5 h-5 ${activeFaq === 1 ? "text-white" : "text-slate-600"
                      }`}
                  />
                </div>
              </div>
              <div className="faq-answer-wrapper">
                <div className="faq-answer">
                  <p>{t("info.faqA2p1")}</p>
                  <p>{t("info.faqA2p2")}</p>
                </div>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 2 ? "active" : ""}`}>
              <div
                className="faq-question-wrapper"
                onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
              >
                <div className="faq-question-content">
                  <div className="faq-icon">
                    <UserCheck
                      className={`w-5 h-5 ${activeFaq === 2 ? "text-white" : "text-blue-600"
                        }`}
                    />
                  </div>
                  <h3 className="faq-question">{t("info.faqQ3")}</h3>
                </div>
                <div className="faq-toggle">
                  <ChevronDown
                    className={`w-5 h-5 ${activeFaq === 2 ? "text-white" : "text-slate-600"
                      }`}
                  />
                </div>
              </div>
              <div className="faq-answer-wrapper">
                <div className="faq-answer">
                  <p>{t("info.faqA3p1")}</p>
                  <p>{t("info.faqA3p2")}</p>
                </div>
              </div>
            </div>

            <div className="faq-promo">
              <div className="faq-promo-content">
                <div className="faq-promo-icon">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <span className="faq-promo-text">
                  {t("info.promoText")}
                </span>
              </div>
              <button className="faq-promo-btn">
                {t("info.getOffer")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing */}

      <section className="pricing-section">
        <div className="pricing-container">
          <div className="section-header">
            <h2 className="section-title white">{t("info.headers.pricing")}</h2>
            <p className="section-subtitle light">{t("info.headers.chooseDirection")}</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card basic">
              <h3 className="pricing-title">Basic</h3>
              <div className="pricing-price">
                <span className="price-value">5%</span>
                <span className="price-label">xizmat</span>
              </div>
              <ul className="pricing-features">
                {["AI", "Boshqarish", "To'lov", "24/7"].map((item, i) => (
                  <li key={i}>
                    <CheckCircle className="check-icon green" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button className="pricing-btn outline">Boshlash</button>
            </div>

            <div className="pricing-card premium">
              <div className="popular-badge">TOP</div>
              <h3 className="pricing-title">Business</h3>
              <div className="pricing-price">
                <span className="price-value">10%</span>
                <span className="price-label">xizmat</span>
              </div>
              <ul className="pricing-features">
                {["Top 1%", "Recruiter", "Team", "Premium", "Analytics"].map(
                  (item, i) => (
                    <li key={i}>
                      <CheckCircle className="check-icon white" />
                      <span>{item}</span>
                    </li>
                  )
                )}
              </ul>
              <button className="pricing-btn filled">Boshlash</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-container">
          {/* Decorative shapes */}
          <div className="cta-shape cta-shape-1"></div>
          <div className="cta-shape cta-shape-2"></div>

          {/* Decorative dots */}
          <div className="cta-dots"></div>

          {/* Sparkles */}
          <div className="cta-sparkles">
            <div className="cta-sparkle"></div>
            <div className="cta-sparkle"></div>
            <div className="cta-sparkle"></div>
            <div className="cta-sparkle"></div>
            <div className="cta-sparkle"></div>
          </div>

          {/* Badge */}
          <div className="cta-badge">
            <Sparkles className="cta-badge-icon" />
            <span className="cta-badge-text">{t("info.ctaBadge")}</span>
          </div>

          <h2 className="cta-title">{t("info.ctaTitle")}</h2>
          <p className="cta-desc">
            {t("info.ctaDesc")}
          </p>
          <button className="cta-btn">{t("info.ctaBtn")}</button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Info;
