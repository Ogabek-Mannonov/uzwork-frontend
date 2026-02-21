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
import "../../assets/style/theme.css"
import logo from "../../assets/UzWork Logo.png"

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

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
              <div className="h-brand-badge"><img src={logo} alt="" /></div>
              <div
                className={`h-brand-text ${sidebarOpen ? "h-show" : "h-hide"}`}
              >
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
            <button className="icon-btn" type="button" onClick={toggleTheme} aria-label="Sozlamalar">
              {theme === "dark" ? "☀" : "🌙"}
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
        </section>

        <section className="content">
          <Projects />
        </section>
      </main>
    </div>
  );
}
