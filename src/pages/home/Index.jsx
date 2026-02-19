import { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  Users,
  Settings,
  FileText,
  ChevronRight,
  ChevronLeft,
  Search,
  Bell,
  Menu,
} from "lucide-react";
import "./homecss/home.css";
import Projects from "../components/projectsCards";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleBtnRef = useRef(null);

  const menuItems = useMemo(
    () => [
      { icon: Home, label: "Bosh sahifa", path: "/" },
      { icon: Users, label: "Foydalanuvchilar", path: "/users" },
      { icon: FileText, label: "Hujjatlar", path: "/documents" },
      { icon: Settings, label: "Sozlamalar", path: "/settings" },
    ],
    [],
  );

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  // ESC bilan yopish
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Mobile overlay ochilganda scroll lock
  useEffect(() => {
    document.body.classList.toggle("no-scroll", sidebarOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [sidebarOpen]);

  const onMenuClick = (path) => {
    console.log("Navigate to:", path);
    // router bo'lsa navigate(path)
    closeSidebar();
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-is-open" : ""}`}>
      {/* Skip link */}
      <a className="skip-link" href="#main">
        Kontentga o‘tish
      </a>

      {/* Backdrop (mobile/tablet overlay uchun) */}
      <button
        className={`h-backdrop ${sidebarOpen ? "h-show" : ""}`}
        aria-label="Sidebarni yopish"
        onClick={closeSidebar}
        type="button"
        tabIndex={sidebarOpen ? 0 : -1}
      />

      {/* Sidebar */}
      <aside
        className={`h-sidebar ${sidebarOpen ? "h-sidebar-open" : "h-sidebar-closed"}`}
        aria-label="Asosiy navigatsiya"
      >
        <div className="h-sidebar-inner">
          <div className="h-sidebar-header">
            <div className="h-brand">
              <div className="h-brand-badge">U</div>
              <div className={`h-brand-text ${sidebarOpen ? "h-show" : "h-hide"}`}>
                UzWork
              </div>
            </div>

            {/* Desktop Toggle */}
            <button
              className={`h-toggle-button ${
                sidebarOpen ? "h-toggle-open" : "h-toggle-closed"
              }`}
              onClick={toggleSidebar}
              type="button"
            >
              {sidebarOpen ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          </div>

          <nav id="sidebar-nav" className="h-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  className="h-menu-button"
                  onClick={() => onMenuClick(item.path)}
                  type="button"
                >
                  <Icon size={20} className="h-menu-icon" />
                  <span
                    className={`h-menu-label ${sidebarOpen ? "show" : "hide"}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Header */}
      <header
        className={`h-header ${sidebarOpen ? "h-header-open" : "h-header-closed"}`}
      >
        <div className="decorative-circle-1" />
        <div className="decorative-circle-2" />

        <div className="h-header-content">
          {/* Mobile burger */}
          <button
            className="mobile-menu-btn"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Sidebarni yopish" : "Sidebarni ochish"}
            aria-expanded={sidebarOpen}
            aria-controls="sidebar-nav"
            type="button"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="search-container" role="search">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Qidiruv..."
              className="search-input"
              aria-label="Qidiruv"
            />
          </div>

          <div className="header-right">
            <button
              className="icon-btn"
              type="button"
              aria-label="Bildirishnomalar"
            >
              <Bell size={20} />
            </button>
            <button className="icon-btn" type="button" aria-label="Sozlamalar">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        id="main"
        className={`h-main ${sidebarOpen ? "h-main-open" : "h-main-closed"}`}
      >
        <section className="hed-section">
          <div className="hed-content">
            <h1 className="hed-title">UzWork</h1>
            <h2 className="hed-subtitle">
              O&apos;zbekistonning eng arzon freelance platformasi !
            </h2>
            <p className="hed-text">
              Biz bilan o&apos;z ishingizni boshlang — tez, xavfsiz va davomli
              tekin. 5 % komissiya • So&apos;mda to&apos;lov • Payme/Click bilan
              10 soniyada • Mahaliy mijoz va freelancerlar • Pul escrowda 100 %
              himoyalangan • Birinchi loyihangizga 0 % komissiya!
            </p>
          </div>

          <svg
            className="wave-svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,60 C300,120 600,0 900,60 C1050,90 1150,90 1200,60 L1200,120 L0,120 Z"
              fill="white"
              opacity="0.3"
            />
            <path
              d="M0,80 C300,140 600,20 900,80 C1050,110 1150,110 1200,80 L1200,120 L0,120 Z"
              fill="white"
              opacity="0.5"
            />
            <path
              d="M0,90 C300,150 600,30 900,90 C1050,120 1150,120 1200,90 L1200,120 L0,120 Z"
              fill="#f5f5f5"
            />
          </svg>
        </section>

        <section className="content">
          <Projects />
        </section>
      </main>
    </div>
  );
}
