import { NavLink } from "react-router-dom";
import { Bell, HelpCircle, Settings, User, Moon, Sun, Search, Menu, X, ChevronDown, Globe } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import useTheme from "../Theme/useTheme";
import "../../../assets/style/FreeNavbar.css"
import "../../../assets/style/theme.css"

export default function FreeNavbar() {
  const { t, i18n } = useTranslation();
  const [jobsOpen, setJobsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  const links = useMemo(
    () => [
      { to: "/find-work",   label: t("navbar.findWork") },
      { to: "/saved",       label: t("navbar.savedJobs") },
      { to: "/proposals",   label: t("navbar.proposals") },
      { to: "/reports",     label: t("navbar.reports") },
      { to: "/messages",    label: t("navbar.messages") },
    ],
    [t]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setJobsOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("appLanguage", lng);
    setLangOpen(false);
  };

  return (
    <>
      <header className="nav">
        <div className="nav__inner">

          {/* LEFT */}
          <div className="nav__left">
            {/* Hamburger — shown on mobile */}
            <button
              className="nav__hamburger"
              onClick={() => setDrawerOpen(true)}
              title="Menu"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>

            <span className="nav__brand">uzwork</span>

            <span className="nav__divider" />

            <nav className="nav__menu">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    "nav__link" + (isActive ? " is-active" : "")
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* CENTER — search */}
          <div className="nav__center">
            <div className="search" ref={dropdownRef}>
              <span className="search__icon">
                <Search size={15} />
              </span>
              <input className="search__input" placeholder={t("navbar.findWork") + "..."} />
              <span className="search__divider" />
              <button
                type="button"
                className="search__btn"
                onClick={() => setJobsOpen((v) => !v)}
              >
                Jobs
                <ChevronDown
                  size={14}
                  className={`search__btn-chevron${jobsOpen ? " open" : ""}`}
                />
              </button>

              {jobsOpen && (
                <div className="dropdown">
                  {["Jobs", "Talent", "Projects"].map((item) => (
                    <button
                      key={item}
                      className="dropdown__item"
                      onClick={() => setJobsOpen(false)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="nav__right">
            {/* Language Switcher */}
            <div className="lang-switcher" ref={langDropdownRef} style={{ position: "relative" }}>
              <button className="icon-btn" onClick={() => setLangOpen(!langOpen)} title="Change Language">
                <Globe size={16} />
                <span style={{ marginLeft: "4px", fontSize: "12px", textTransform: "uppercase" }}>
                  {i18n.language}
                </span>
              </button>
              {langOpen && (
                <div className="dropdown lang-dropdown" style={{ position: "absolute", top: "100%", right: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "4px", zIndex: 50, marginTop: "8px" }}>
                  <button className="dropdown__item" onClick={() => changeLanguage('uz')}>O'zbek</button>
                  <button className="dropdown__item" onClick={() => changeLanguage('ru')}>Русский</button>
                  <button className="dropdown__item" onClick={() => changeLanguage('en')}>English</button>
                </div>
              )}
            </div>

            <button className="icon-btn" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="icon-btn icon-btn--notif" title="Notifications">
              <Bell size={16} />
              <span className="notif-dot" />
            </button>
            <button className="avatar" title="Profile">
              <User size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`mobile-drawer${drawerOpen ? " open" : ""}`} aria-modal="true" role="dialog">
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
        <div className="drawer-panel">
          <div className="drawer-header">
            <span className="drawer-brand">uzwork</span>
            <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <X size={16} />
            </button>
          </div>

          <nav className="drawer-nav">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  "drawer-link" + (isActive ? " is-active" : "")
                }
                onClick={() => setDrawerOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="drawer-nav" style={{ borderBottom: "none" }}>
            {/* Lang switcher in mobile drawer */}
            <div style={{ display: "flex", gap: "10px", padding: "10px", justifyContent: "center" }}>
              <button style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid var(--border)", background: i18n.language === 'uz' ? 'var(--brand)' : 'transparent', color: i18n.language === 'uz' ? '#fff' : 'var(--text)' }} onClick={() => changeLanguage('uz')}>UZ</button>
              <button style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid var(--border)", background: i18n.language === 'ru' ? 'var(--brand)' : 'transparent', color: i18n.language === 'ru' ? '#fff' : 'var(--text)' }} onClick={() => changeLanguage('ru')}>RU</button>
              <button style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid var(--border)", background: i18n.language === 'en' ? 'var(--brand)' : 'transparent', color: i18n.language === 'en' ? '#fff' : 'var(--text)' }} onClick={() => changeLanguage('en')}>EN</button>
            </div>

            <button className="drawer-icon-row" onClick={toggle}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? "Light mode" : "Dark mode"}
            </button>
            <button className="drawer-icon-row">
              <Bell size={16} /> Notifications
            </button>
            <button className="drawer-icon-row">
              <HelpCircle size={16} /> Help
            </button>
            <button className="drawer-icon-row">
              <Settings size={16} /> Settings
            </button>
            <button className="drawer-icon-row">
              <User size={16} /> Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}