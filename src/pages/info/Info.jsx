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
} from "lucide-react";
import "./infocss/info.css";
import Footer from "../footer/Footer";
import { Link } from "react-router-dom";

const Info = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("client");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeFaq, setActiveFaq] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const categories = [
    {
      icon: <Sparkles />,
      title: "Sun'iy intellekt xizmatlari",
      count: "25K+",
      color: "#22c55e",
    },
    {
      icon: <Code />,
      title: "Rivojlanish va IT",
      count: "18K+",
      color: "#3b82f6",
    },
    {
      icon: <Palette />,
      title: "Dizayn va ijodiy",
      count: "9.5K+",
      color: "#a855f7",
    },
    {
      icon: <BarChart />,
      title: "Savdo va marketing",
      count: "12K+",
      color: "#f97316",
    },
    {
      icon: <FileText />,
      title: "Yozish va tarjima",
      count: "15K+",
      color: "#eab308",
    },
    {
      icon: <Settings />,
      title: "Administrator va qo'llab-quvvatlash",
      count: "8K+",
      color: "#10b981",
    },
    {
      icon: <Landmark />,
      title: "Moliya va buxgalteriya hisobi",
      count: "11K+",
      color: "#06b6d4",
    },
    { icon: <Scale />, title: "Huquqiy", count: "6K+", color: "#14b8a6" },
    {
      icon: <UserCog />,
      title: "HR va trening",
      count: "7.5K+",
      color: "#6366f1",
    },
    {
      icon: <Wrench />,
      title: "Muhandislik va arxitektura",
      count: "5K+",
      color: "#8b5cf6",
    },
  ];

  const features = [
    {
      icon: <Shield />,
      title: "Xavfsiz to'lov",
      desc: "Escrow tizimi bilan himoyalangan",
    },
    { icon: <Zap />, title: "AI Matching", desc: "Sun'iy intellekt yordamida" },
    {
      icon: <Globe />,
      title: "Global reach",
      desc: "150+ mamlakatdan mutaxassislar",
    },
    {
      icon: <Award />,
      title: "Tasdiqlangan",
      desc: "Barcha frilanserlar tekshirilgan",
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
      title: "Loyiha e'lon qiling",
      desc: "Loyihangiz haqida batafsil ma'lumot yozing va budjetni belgilang",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    },
    {
      title: "Takliflarni ko'rib chiqing",
      desc: "Professional frilanserlardan kelgan takliflarni taqqoslang",
      image:
        "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=800&h=600&fit=crop",
    },
    {
      title: "Ishni boshlang",
      desc: "Eng yaxshi mutaxassisni tanlab, ishni xavfsiz boshlang",
      image:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
    },
  ];

  const freelancerSteps = [
    {
      title: "Profil yarating",
      desc: "Portfolio va ko'nikmalaringizni ko'rsating, mijozlarni hayratda qoldiring",
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
    },
    {
      title: "Loyihalarni toping",
      desc: "O'zingizga mos loyihalarni toping va professional taklif yuboring",
      image:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    },
    {
      title: "Pul ishlang",
      desc: "Ishingizni tugatib, xavfsiz va tez pul oling",
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

  const testimonials = [
    {
      name: "Aziz Karimov",
      role: "CEO, TechStartup",
      text: "UZWORK orqali ajoyib developer topdim. Loyihamiz vaqtida bajarildi!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      company: "TechStartup",
    },
    {
      name: "Malika Yusupova",
      role: "Marketing Director",
      text: "Professional dizaynerlar bilan ishlash juda qulay. Har bir loyiha uchun mutaxassis topamiz.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
      company: "Digital Agency",
    },
    {
      name: "Sardor Alimov",
      role: "Biznes egasi",
      text: "3 oy 0% komissiya ajoyib taklif! Endi barcha ishlarimni UZWORK orqali bajaraman.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
      company: "E-commerce",
    },
  ];

  return (
    <div className="uzwork-landing">
      {/* Navbar */}
      <nav className={`uzwork-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <Link to="#navbar-log" id="navbar-logo" className="navbar-logo">
            <div className="logo-icon">
              <img
                className="logo"
                src="/UzWork transparent.png"
                alt="UzWork logo"
              />
            </div>
            <span className="logo-text">UZWORK</span>
          </Link>
          <div className="navbar-actions">
            <button
              onClick={toggleDarkMode}
              className="l-theme-toggle"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <Link to="/login" className="l-nav-link">
              Kirish
            </Link>

            <Link to="/signup" className="l-nav-btn">
              Boshlash
            </Link>
          </div>
        </div>
      </nav>

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
          <div className="hero-badge">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>3 OY 0% KOMISSIYA</span>
          </div>
          <h1 className="hero-title">
            <span className="title-dark">Professional frilanserlar </span>
            <span className="title-gradient">bir joyda</span>
          </h1>
          <p className="hero-desc">
            AI bilan mutaxassislarni toping. Payme, Click orqali to'lov
          </p>
          <div className="hero-search">
            <input
              placeholder="Web developer, Designer..."
              className="search-input"
            />
            <button className="search-btn">
              Qidirish <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">
                  {React.cloneElement(stat.icon, {
                    className: "w-7 h-7 text-white",
                  })}
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              Millionlab professionallarni o'rganing
            </h2>
            <p className="section-subtitle">Professional mutaxassislar</p>
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
                Top {selectedCategory} Mutaxassislari
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
                        {freelancer.hourlyRate}/soat
                      </div>
                    </div>
                    <button className="freelancer-btn">Ko'rish</button>
                  </div>
                ))}
              </div>
              <button
                className="close-freelancers-btn"
                onClick={() => setSelectedCategory(null)}
              >
                Yopish
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How to Work */}
      <section className="work-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Qanday ishlaydi?</h2>
            <p className="section-subtitle">
              O'zingizga mos yo'nalishni tanlang
            </p>
            <div className="work-tabs">
              <button
                className={`work-tab ${activeTab === "client" ? "active" : ""}`}
                onClick={() => setActiveTab("client")}
              >
                <Users className="w-4 h-4" />
                Mijozlar uchun
              </button>
              <button
                className={`work-tab ${activeTab === "freelancer" ? "active" : ""
                  }`}
                onClick={() => setActiveTab("freelancer")}
              >
                <Briefcase className="w-4 h-4" />
                Frilanserlar uchun
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
                ? "Loyiha yaratish"
                : "Ish topishni boshlash"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Nega UZWORK?</h2>
            <p className="section-subtitle">Ishonchli yechim</p>
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
            <h2 className="section-title">Mijozlar fikri</h2>
            <p className="section-subtitle">
              Minglab kompaniyalar UZWORK ga ishonadi
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
      </section>

      {/* Pricing */}
      <section className="pricing-section">
        <div className="pricing-container">
          <div className="section-header">
            <h2 className="section-title white">Shaffof narxlar</h2>
            <p className="section-subtitle light">Mos rejani tanlang</p>
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

      {/* FAQ */}
      <section className="faq-section">
        <div className="faq-container">
          <div className="faq-left">
            <h2 className="faq-main-title">Tez-tez so'raladigan savollar</h2>
            <p className="faq-subtitle">
              UZWORK platformasi haqida eng ko'p beriladigan savollarga
              javoblar. Qo'shimcha savollaringiz bo'lsa, biz bilan bog'laning.
            </p>

            <div className="faq-stats">
              <div className="faq-stat-card">
                <div className="faq-stat-icon">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="faq-stat-value">50K+</div>
                <div className="faq-stat-label">Faol foydalanuvchilar</div>
              </div>

              <div className="faq-stat-card">
                <div className="faq-stat-icon">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="faq-stat-value">100K+</div>
                <div className="faq-stat-label">Bajarilgan loyihalar</div>
              </div>

              <div className="faq-stat-card">
                <div className="faq-stat-icon">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="faq-stat-value">$5M+</div>
                <div className="faq-stat-label">To'langan summa</div>
              </div>

              <div className="faq-stat-card">
                <div className="faq-stat-icon">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="faq-stat-value">4.9</div>
                <div className="faq-stat-label">O'rtacha reyting</div>
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
                  <h3 className="faq-question">UZWORK nima?</h3>
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
                  <p>
                    UZWORK - bu biznes, agentliklar va frilanserlarni
                    bog'laydigan global ish bozori. Unda istalgan kishi
                    ro'yxatdan o'tishi va ishga kirishishi mumkin.
                  </p>
                  <p>
                    Bizneslar va jamoalar o'z imkoniyatlarini kengaytirish,
                    asosiy loyihalarini tezlashtirish va AI, Mashinasozlik,
                    Dizayn, Marketing, Dasturiy ta'minotni ishlab chiqish va
                    boshqa sohalarda ixtisoslashgan tajribaga ega bo'lish uchun
                    UZWORK'dan foydalanadilar.
                  </p>
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
                  <h3 className="faq-question">UZWORK qanday ishlaydi?</h3>
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
                  <p>
                    Mijozlar platformada frilanserlarni qidiradillar,
                    loyihalarini joylashtiradillar, takliflarni ko'rib
                    chiqadillar va intervyular o'tkazadillar. Frilanserlar
                    loyihalarni ko'rib chiqadilar, takliflar yuboradilar yoki
                    mijozlar tomonidan to'g'ridan-to'g'ri taklif qilinishi
                    mumkin.
                  </p>
                  <p>
                    Freelancerlar va mijozlar xabar almashish, fayllarni
                    almashish, vaqtni kuzatish va xavfsiz to'lovlar kabi
                    funksiyalarni taklif qiluvchi UZWORK'ning ishonchli
                    platformasida hamkorlik qilishlari mumkin.
                  </p>
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
                  <h3 className="faq-question">UZWORK kim uchun?</h3>
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
                  <p>
                    UZWORK moslashuvchan va ishonchli frilanserlarga muhtoj
                    bo'lgan har qanday hajmdagi kompaniyalar tomonidan eng
                    yaxshi qo'llaniladi. Yakka tartibdagi tadbirkorlar
                    UZWORK'dan bir martalik loyihalar uchun foydalanishlari
                    mumkin.
                  </p>
                  <p>
                    Frilanserlar UZWORK'dan butun dunyo bo'ylab barcha
                    o'lchamdagi bizneslar bilan bog'lanish, doimiy ish topish va
                    martabalarini oshirish uchun foydalanadilar. Bu yangi
                    boshlanuvchilar uchun frilanserlikni boshlash uchun ajoyib
                    platforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="faq-promo">
              <div className="faq-promo-content">
                <div className="faq-promo-icon">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <span className="faq-promo-text">
                  Yangi Business Plus a'zosi sifatida 1000 dollar sarflasangiz,
                  500 dollar kredit oling.
                </span>
              </div>
              <button className="faq-promo-btn">
                Taklif oling <ArrowRight className="w-4 h-4" />
              </button>
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
            <span className="cta-badge-text">3 oy 0% komissiya</span>
          </div>

          <h2 className="cta-title">Tayyor boshlashga?</h2>
          <p className="cta-desc">
            Professional mutaxassislar bilan ishni bugun boshlang
          </p>
          <button className="cta-btn">Bepul boshlash</button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Info;
