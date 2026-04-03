// src/pages/components/AppHeader/AppHeader.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Sun, Moon, Menu, X, ChevronDown, Globe,
  Bell, HelpCircle, Settings, User, Search, Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "../Theme/ThemeContext";

import "../header/Header.css";
import "../../../assets/style/FreeNavbar.css";
import "../../../assets/style/theme.css";

const getToken = () => localStorage.getItem("accessToken");

// ══════════════════════════════════════════════════════════
// PREMIUM LANG SWITCHER
// ══════════════════════════════════════════════════════════
function LangSwitcher({ i18n, changeLanguage }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const langs = [
    { code: "uz", label: "O'zbekcha", flag: "🇺🇿", short: "UZ" },
    { code: "ru", label: "Русский",   flag: "🇷🇺", short: "RU" },
    { code: "en", label: "English",   flag: "🇬🇧", short: "EN" },
  ];
  const cur = langs.find(l => i18n.language.startsWith(l.code)) || langs[0];

  return (
    <div ref={ref} className="lang-sw">
      <button className="lang-sw__trigger" onClick={() => setOpen(o => !o)} aria-label="Change language">
        <span className="lang-sw__code">{cur.short}</span>
        <ChevronDown size={13} className={`lang-sw__arrow ${open ? "open" : ""}`} />
      </button>

      {open && (
        <div className="lang-sw__panel">
          {langs.map(l => (
            <button
              key={l.code}
              className={`lang-sw__item ${cur.code === l.code ? "active" : ""}`}
              onClick={() => { changeLanguage(l.code); setOpen(false); }}
            >
              <span className="lang-sw__item-flag">{l.flag}</span>
              <span className="lang-sw__item-label">{l.label}</span>
              {cur.code === l.code && <Check size={14} className="lang-sw__item-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// LANDING HEADER
// ══════════════════════════════════════════════════════════
function LandingHeader({ i18n, changeLanguage }) {
  const { t } = useTranslation();
  const { isDark, toggle } = useThemeContext();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hireOpen, setHireOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const megaTimer = useRef(null);
  const moreTimer = useRef(null);

  const closeAll = () => { setHireOpen(false); setWorkOpen(false); setMoreOpen(false); };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (!document.querySelector(".uw-header")?.contains(e.target)) closeAll();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const openHire = () => { clearTimeout(megaTimer.current); setHireOpen(true); setWorkOpen(false); setMoreOpen(false); };
  const openWork = () => { clearTimeout(megaTimer.current); setWorkOpen(true); setHireOpen(false); setMoreOpen(false); };
  const openMore = () => { clearTimeout(moreTimer.current); setMoreOpen(true); };
  const closeMegas = () => { megaTimer.current = setTimeout(() => { setHireOpen(false); setWorkOpen(false); }, 200); };
  const closeMore  = () => { moreTimer.current = setTimeout(() => setMoreOpen(false), 180); };

  const hireCategories = [
    { title: "Admin & qo'llab-quvvatlash", items: [
      { label: "Virtual yordamchilar", to: "/talent/virtual-assistant" },
      { label: "Ma'lumot kiritish",    to: "/talent/data-entry" },
      { label: "Mijozlar qo'llab-quvvatlash", to: "/talent/customer-support" },
      { label: "Loyiha menejerlari",   to: "/talent/project-manager" },
    ]},
    { title: "Dizayn & kreativlik", items: [
      { label: "Grafik dizaynerlar",  to: "/talent/graphic-design" },
      { label: "UI/UX dizaynerlar",   to: "/talent/ui-ux" },
      { label: "Illyustratorlar",     to: "/talent/illustration" },
      { label: "Video montajchilar",  to: "/talent/video-editing" },
    ]},
    { title: "Dasturlash & texnologiyalar", items: [
      { label: "Veb dasturchilar",    to: "/talent/web-dev" },
      { label: "Mobil dasturchilar",  to: "/talent/mobile-dev" },
      { label: "Backend dasturchilar",to: "/talent/nodejs" },
      { label: "QA & Testing",        to: "/talent/qa" },
    ]},
    { title: "Marketing", items: [
      { label: "SMM menejerlar",         to: "/talent/smm" },
      { label: "SEO mutaxassislari",     to: "/talent/seo" },
      { label: "Reklama mutaxassislari", to: "/talent/ads" },
      { label: "Email marketing",        to: "/talent/email-marketing" },
    ]},
    { title: "Matn yozish & kontent", items: [
      { label: "Kontent yozuvchilar",to: "/talent/content-writing" },
      { label: "Kopirayterlar",      to: "/talent/copywriting" },
      { label: "Tarjimonlar",        to: "/talent/translation" },
      { label: "Muharrirlar",        to: "/talent/editing" },
    ]},
  ];

  return (
    <header className={`uw-header ${scrolled ? "uw-header--scrolled" : ""}`}>
      <div className="uw-header__container">

        {/* Brand + Nav */}
        <div className="uw-left">
          <Link to="/" className="uw-brand" aria-label="Uzwork home">
            <span className="uw-brand__icon">
              <img className="uw-brand__logo" src="/UzWork transparent.png" alt="UzWork logo" loading="eager" />
            </span>
            <span className="uw-brand__name">UZWORK</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="uw-nav" aria-label="Primary">
            {/* Hire mega */}
            <div className="uw-mega" onMouseEnter={openHire} onMouseLeave={closeMegas}>
              <button type="button"
                className={`uw-nav__link uw-nav__link--btn ${hireOpen ? "uw-nav__link--active" : ""}`}
                onClick={() => hireOpen ? setHireOpen(false) : openHire()}
                aria-expanded={hireOpen}
              >
                {t("header.hireTalent")} <ChevronDown size={15} />
              </button>
              <div className={`uw-mega__panel ${hireOpen ? "open" : ""}`} onMouseEnter={openHire} onMouseLeave={closeMegas}>
                <div className="uw-mega__grid">
                  {hireCategories.map(col => (
                    <div key={col.title} className="uw-mega__col">
                      <div className="uw-mega__title">{col.title}</div>
                      {col.items.map(it => (
                        <Link key={it.to} to={it.to} className="uw-mega__item" onClick={closeAll}>{it.label}</Link>
                      ))}
                    </div>
                  ))}
                  <div className="uw-mega__side">
                    <div className="uw-mega__sideTitle">Yordam kerakmi?</div>
                    <Link className="uw-mega__sideLink" to="/explore">Batafsil ko'rish →</Link>
                    <Link className="uw-mega__sideLink" to="/consultation">Maslahatga yozilish →</Link>
                    <Link className="uw-mega__sideLink" to="/business-plus">Business Plus →</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Find Work mega */}
            <div className="uw-mega" onMouseEnter={openWork} onMouseLeave={closeMegas}>
              <button type="button"
                className={`uw-nav__link uw-nav__link--btn ${workOpen ? "uw-nav__link--active" : ""}`}
                onClick={() => workOpen ? setWorkOpen(false) : openWork()}
                aria-expanded={workOpen}
              >
                {t("header.findWork")} <ChevronDown size={15} />
              </button>
              <div className={`uw-mega__panel ${workOpen ? "open" : ""}`} onMouseEnter={openWork} onMouseLeave={closeMegas}>
                <div className="uw-mega__grid">
                  {hireCategories.map(col => (
                    <div key={col.title} className="uw-mega__col">
                      <div className="uw-mega__title">{col.title}</div>
                      {col.items.map(it => (
                        <Link key={it.to} to={it.to} className="uw-mega__item" onClick={closeAll}>{it.label}</Link>
                      ))}
                    </div>
                  ))}
                  <div className="uw-mega__side">
                    <div className="uw-mega__sideTitle">Profilingizni rivojlantiring</div>
                    <Link className="uw-mega__sideLink" to="/earn">Daromad topish →</Link>
                    <Link className="uw-mega__sideLink" to="/ads">Reklama orqali →</Link>
                    <Link className="uw-mega__sideLink" to="/freelancer-plus">Freelancer Plus →</Link>
                  </div>
                </div>
              </div>
            </div>

            <NavLink to="/how-it-works" className={({ isActive }) => `uw-nav__link ${isActive ? "uw-nav__link--active" : ""}`} onMouseEnter={closeAll}>
              {t("header.howItWorks")}
            </NavLink>
            <NavLink to="/enterprise" className={({ isActive }) => `uw-nav__link ${isActive ? "uw-nav__link--active" : ""}`} onMouseEnter={closeAll}>
              {t("header.enterprise")}
            </NavLink>

            {/* More */}
            <div className="uw-nav__more" onMouseEnter={() => { openMore(); setHireOpen(false); setWorkOpen(false); }} onMouseLeave={closeMore}>
              <button type="button" className="uw-nav__morebtn">
                {t("header.more")} <ChevronDown size={15} />
              </button>
              <div className={`uw-nav__menu ${moreOpen ? "open" : ""}`} onMouseEnter={openMore} onMouseLeave={closeMore}>
                <Link to="/pricing" className="uw-nav__menulink">{t("header.pricing")}</Link>
                <Link to="/reviews" className="uw-nav__menulink">{t("header.reviews")}</Link>
                <Link to="/support" className="uw-nav__menulink">{t("header.support")}</Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Right actions — NO SEARCH, only lang + dark + login + signup */}
        <div className="uw-actions">
          <LangSwitcher i18n={i18n} changeLanguage={changeLanguage} />

          <button type="button" onClick={toggle} className="uw-iconbtn" aria-label="Toggle dark mode">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/login" className="uw-linkbtn">{t("header.login")}</Link>
          <Link to="/signup" className="uw-ctabtn">{t("header.signup")}</Link>

          <button type="button" className="uw-burger" aria-label="Open menu" onClick={() => setMenuOpen(s => !s)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`uw-drawer ${menuOpen ? "uw-drawer--open" : ""}`}>
        <div className="uw-drawer__inner">
          <div className="uw-drawer__links">
            {/* Lang in mobile */}
            <div className="uw-drawer__lang">
              {[
                { code: "uz", flag: "🇺🇿", short: "UZ" },
                { code: "ru", flag: "🇷🇺", short: "RU" },
                { code: "en", flag: "🇬🇧", short: "EN" },
              ].map(l => (
                <button key={l.code} onClick={() => changeLanguage(l.code)}
                  className={`uw-drawer__langbtn ${i18n.language.startsWith(l.code) ? "active" : ""}`}
                >
                  {l.short}
                </button>
              ))}
            </div>

            <NavLink to="/hire"         onClick={() => setMenuOpen(false)} className="uw-drawer__link">{t("header.hireTalent")}</NavLink>
            <NavLink to="/find-work"    onClick={() => setMenuOpen(false)} className="uw-drawer__link">{t("header.findWork")}</NavLink>
            <NavLink to="/how-it-works" onClick={() => setMenuOpen(false)} className="uw-drawer__link">{t("header.howItWorks")}</NavLink>
            <NavLink to="/enterprise"   onClick={() => setMenuOpen(false)} className="uw-drawer__link">{t("header.enterprise")}</NavLink>
            <NavLink to="/pricing"      onClick={() => setMenuOpen(false)} className="uw-drawer__link">{t("header.pricing")}</NavLink>
            <NavLink to="/support"      onClick={() => setMenuOpen(false)} className="uw-drawer__link">{t("header.support")}</NavLink>

            {/* Dark mode toggle in drawer */}
            <button className="uw-drawer__link" onClick={toggle} style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "none", width: "100%", textAlign: "left", cursor: "pointer", color: "var(--text)" }}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? "Light mode" : "Dark mode"}
            </button>
          </div>
          <div className="uw-drawer__actions">
            <Link to="/login"  onClick={() => setMenuOpen(false)} className="uw-linkbtn uw-linkbtn--full">{t("header.login")}</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="uw-ctabtn uw-ctabtn--full">{t("header.signup")}</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════════
// AUTH HEADER (logged in — freelancer navbar)
// ══════════════════════════════════════════════════════════
function AuthHeader({ i18n, changeLanguage }) {
  const { t } = useTranslation();
  const { isDark, toggle } = useThemeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const jobsRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (jobsRef.current && !jobsRef.current.contains(e.target)) setJobsOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const links = useMemo(() => [
    { to: "/find-work", label: t("navbar.findWork") },
    { to: "/saved",     label: t("navbar.savedJobs") },
    { to: "/proposals", label: t("navbar.proposals") },
    { to: "/messages",  label: t("navbar.messages") },
  ], [t]);

  return (
    <>
      <header className="nav">
        <div className="nav__inner">
          <div className="nav__left">
            <button className="nav__hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </button>
            <span className="nav__brand">uzwork</span>
            <span className="nav__divider" />
            <nav className="nav__menu">
              {links.map(l => (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => "nav__link" + (isActive ? " is-active" : "")}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="nav__center">
            <div className="search" ref={jobsRef}>
              <span className="search__icon"><Search size={15} /></span>
              <input className="search__input" placeholder={t("navbar.findWork") + "..."} />
              <span className="search__divider" />
              <button type="button" className="search__btn" onClick={() => setJobsOpen(v => !v)}>
                Jobs <ChevronDown size={14} className={`search__btn-chevron${jobsOpen ? " open" : ""}`} />
              </button>
              {jobsOpen && (
                <div className="dropdown">
                  {["Jobs", "Talent", "Projects"].map(item => (
                    <button key={item} className="dropdown__item" onClick={() => setJobsOpen(false)}>{item}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="nav__right">
            <LangSwitcher i18n={i18n} changeLanguage={changeLanguage} />
            <button className="icon-btn" onClick={toggle} aria-label="Toggle theme">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="icon-btn icon-btn--notif" title="Notifications">
              <Bell size={16} /><span className="notif-dot" />
            </button>
            <button className="avatar" title="Profile"><User size={16} /></button>
          </div>
        </div>
      </header>

      <div className={`mobile-drawer${drawerOpen ? " open" : ""}`} aria-modal="true" role="dialog">
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
        <div className="drawer-panel">
          <div className="drawer-header">
            <span className="drawer-brand">uzwork</span>
            <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close"><X size={16} /></button>
          </div>
          <div style={{ display: "flex", gap: 8, padding: "12px 16px", justifyContent: "center" }}>
            {[{ code: "uz", flag: "🇺🇿" }, { code: "ru", flag: "🇷🇺" }, { code: "en", flag: "🇬🇧" }].map(l => (
              <button key={l.code} onClick={() => changeLanguage(l.code)} style={{
                padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)",
                background: i18n.language.startsWith(l.code) ? "var(--brand, #3b82f6)" : "transparent",
                color: i18n.language.startsWith(l.code) ? "#fff" : "var(--text)",
                cursor: "pointer", fontWeight: 700, fontSize: 13, textTransform: "uppercase",
              }}>{l.flag} {l.code.toUpperCase()}</button>
            ))}
          </div>
          <nav className="drawer-nav">
            {links.map(l => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) => "drawer-link" + (isActive ? " is-active" : "")}
                onClick={() => setDrawerOpen(false)}
              >{l.label}</NavLink>
            ))}
          </nav>
          <div className="drawer-nav" style={{ borderBottom: "none" }}>
            <button className="drawer-icon-row" onClick={toggle}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? "Light mode" : "Dark mode"}
            </button>
            <button className="drawer-icon-row"><Bell size={16} /> Notifications</button>
            <button className="drawer-icon-row"><HelpCircle size={16} /> Help</button>
            <button className="drawer-icon-row"><Settings size={16} /> Settings</button>
            <button className="drawer-icon-row"><User size={16} /> Profile</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════
export default function AppHeader() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  useEffect(() => {
    const check = () => setIsLoggedIn(!!getToken());
    window.addEventListener("storage", check);
    window.addEventListener("authChange", check);
    return () => { window.removeEventListener("storage", check); window.removeEventListener("authChange", check); };
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("appLanguage", lng);
  };

  // If on Landing page, always show LandingHeader (Login/Signup buttons etc.)
  if (location.pathname === "/") {
    return <LandingHeader i18n={i18n} changeLanguage={changeLanguage} />;
  }

  if (isLoggedIn) {
    return <AuthHeader i18n={i18n} changeLanguage={changeLanguage} />;
  }

  return <LandingHeader i18n={i18n} changeLanguage={changeLanguage} />;
}
