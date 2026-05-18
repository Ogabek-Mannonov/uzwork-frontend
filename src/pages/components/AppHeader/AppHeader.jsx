// src/pages/components/AppHeader/AppHeader.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sun, Moon, Menu, X, ChevronDown, ChevronRight, Globe,
  Bell, HelpCircle, Settings, User, Search, Check,
  RefreshCw, Users, Briefcase, Plus, Star,
  CreditCard, Shield, Award, FileText, AlertTriangle, LogOut
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "../Theme/ThemeContext";

import "../header/Header.css";
import "../../../assets/style/FreeNavbar.css";
import "../../../assets/style/theme.css";
import { useCurrency } from "../Currency/CurrencyContext";
import NotificationDropdown from "../NotificationDropdown/NotificationDropdown";
import { Toast } from "../Toast";
import { getSocket } from "../../../hooks/useSocket";

const getToken = () => localStorage.getItem("accessToken");

const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api\/?$/, "");

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND}${path}`;
}

function getInitials(name) {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : "";
}

function getPreviewText(msg, t) {
  const type = msg.type || 'text';
  const content = msg.content || msg.message || "";
  
  if (type === 'image') return `🖼️ ${t('chat.photo', 'Photo')}`;
  if (type === 'voice') return `🎤 ${t('chat.voiceMsg', 'Voice message')}`;
  if (type === 'submission') return `💼 ${t('chat.workSubmitted', 'Work Submitted')}`;
  if (type === 'file') return `📄 ${t('chat.file', 'File')}`;
  if (type === 'video_call') return `📹 ${t('chat.videoCall', 'Video Call')}`;
  if (type === 'system') return content || t('chat.system', 'System');
  
  return content || t("chat.noMessagesOut", "No message");
}

function AvatarImage({ src, name, size = 40, className = "" }) {
  const [error, setError] = React.useState(false);
  
  if (!src || error) {
    const initials = getInitials(name);
    return (
      <div 
        className={`${className} initials-avatar`} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'linear-gradient(135deg, var(--blue, #3b82f6), var(--blue-dark, #2563eb))', 
          color: '#fff', 
          fontWeight: '700',
          fontSize: size > 100 ? '3rem' : size > 60 ? '2.2rem' : size > 40 ? '1.5rem' : '1rem',
          borderRadius: '50%',
          aspectRatio: '1/1',
          width: `${size}px`,
          height: `${size}px`
        }}
      >
        {initials || <User size={size * 0.5} />}
      </div>
    );
  }

  return (
    <img 
      src={avatarSrc(src)} 
      alt={name || "Avatar"} 
      className={className}
      onError={() => setError(true)}
      onContextMenu={(e) => e.preventDefault()}
      draggable="false"
      style={{ objectFit: 'cover', borderRadius: '50%', width: `${size}px`, height: `${size}px`, userSelect: 'none', WebkitUserDrag: 'none' }}
    />
  );
}

// ══════════════════════════════════════════════════════════
// PREMIUM PREFERENCES DROPDOWN (Lang + Theme)
// ══════════════════════════════════════════════════════════
function PreferencesDropdown({ i18n, changeLanguage, isDark, toggle }) {
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
      <button className="uw-iconbtn" onClick={() => setOpen(o => !o)} aria-label="Preferences">
        <Settings size={18} className={open ? "rotate-settings" : ""} />
      </button>

      {open && (
        <div className="lang-sw__panel preferences-panel" style={{ minWidth: '200px', right: 0, left: 'auto' }}>
          {/* Theme Toggle Section */}
          <div className="pref-section">
            <span className="pref-label">Mavzu: {isDark ? 'Tungi' : 'Kunduzgi'}</span>
            <button className="pref-theme-toggle" onClick={toggle}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDark ? 'Yorug' : 'Qorong\'u'}</span>
            </button>
          </div>
          
          <div className="pref-divider"></div>
          
          {/* Language Section */}
          <span className="pref-label" style={{ padding: '4px 12px' }}>Tilni tanlang:</span>
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


function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const currs = [
    { code: "USD", symbol: "$" },
    { code: "UZS", symbol: "UZS" },
    { code: "RUB", symbol: "₽" },
  ];

  return (
    <div ref={ref} className="lang-sw" style={{ marginLeft: 8 }}>
      <button className="lang-sw__trigger" onClick={() => setOpen(o => !o)} aria-label="Change currency">
        <span className="lang-sw__code">{currency}</span>
        <ChevronDown size={13} className={`lang-sw__arrow ${open ? "open" : ""}`} />
      </button>

      {open && (
        <div className="lang-sw__panel">
          {currs.map(c => (
            <button
              key={c.code}
              className={`lang-sw__item ${currency === c.code ? "active" : ""}`}
              onClick={() => { setCurrency(c.code); setOpen(false); }}
            >
              <span className="lang-sw__item-flag" style={{ fontSize: 12 }}>{c.symbol}</span>
              <span className="lang-sw__item-label">{c.code}</span>
              {currency === c.code && <Check size={14} className="lang-sw__item-check" />}
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

  // Top skillslarni backend dan olish (mega menu uchun)
  const [popularSkills, setPopularSkills] = useState([]);
  useEffect(() => {
    import("../../../api/common").then(({ getSkills }) => {
      getSkills("").then((res) => {
        if (res?.success !== false && Array.isArray(res?.skills)) {
          setPopularSkills(res.skills.slice(0, 12));
        }
      });
    }).catch(() => {});
  }, []);

  const hireCategories = [
    { title: "Admin & qo'llab-quvvatlash", items: [
      { label: "Virtual yordamchilar", to: "/hire?q=virtual+assistant" },
      { label: "Ma'lumot kiritish",    to: "/hire?q=data+entry" },
      { label: "Mijozlar qo'llab-quvvatlash", to: "/hire?q=customer+support" },
      { label: "Loyiha menejerlari",   to: "/hire?q=project+manager" },
    ]},
    { title: "Dizayn & kreativlik", items: [
      { label: "Grafik dizaynerlar",  to: "/hire?q=graphic+design" },
      { label: "UI/UX dizaynerlar",   to: "/hire?q=ui+ux" },
      { label: "Illyustratorlar",     to: "/hire?q=illustration" },
      { label: "Video montajchilar",  to: "/hire?q=video+editing" },
    ]},
    { title: "Dasturlash & texnologiyalar", items: [
      { label: "Veb dasturchilar",    to: "/hire?q=web+development" },
      { label: "Mobil dasturchilar",  to: "/hire?q=mobile" },
      { label: "Backend dasturchilar",to: "/hire?q=nodejs" },
      { label: "QA & Testing",        to: "/hire?q=qa" },
    ]},
    { title: "Marketing", items: [
      { label: "SMM menejerlar",         to: "/hire?q=smm" },
      { label: "SEO mutaxassislari",     to: "/hire?q=seo" },
      { label: "Reklama mutaxassislari", to: "/hire?q=advertising" },
      { label: "Email marketing",        to: "/hire?q=email+marketing" },
    ]},
    { title: "Matn yozish & kontent", items: [
      { label: "Kontent yozuvchilar",to: "/hire?q=content+writing" },
      { label: "Kopirayterlar",      to: "/hire?q=copywriting" },
      { label: "Tarjimonlar",        to: "/hire?q=translation" },
      { label: "Muharrirlar",        to: "/hire?q=editing" },
    ]},
  ];

  const workCategories = [
    { title: "Admin & qo'llab-quvvatlash", items: [
      { label: "Virtual yordamchilar", to: "/jobs?q=virtual+assistant" },
      { label: "Ma'lumot kiritish",    to: "/jobs?q=data+entry" },
      { label: "Mijozlar qo'llab-quvvatlash", to: "/jobs?q=customer+support" },
      { label: "Loyiha menejerlari",   to: "/jobs?q=project+manager" },
    ]},
    { title: "Dizayn & kreativlik", items: [
      { label: "Grafik dizaynerlar",  to: "/jobs?q=graphic+design" },
      { label: "UI/UX dizaynerlar",   to: "/jobs?q=ui+ux" },
      { label: "Illyustratorlar",     to: "/jobs?q=illustration" },
      { label: "Video montajchilar",  to: "/jobs?q=video+editing" },
    ]},
    { title: "Dasturlash & texnologiyalar", items: [
      { label: "Veb dasturchilar",    to: "/jobs?q=web+development" },
      { label: "Mobil dasturchilar",  to: "/jobs?q=mobile" },
      { label: "Backend dasturchilar",to: "/jobs?q=nodejs" },
      { label: "QA & Testing",        to: "/jobs?q=qa" },
    ]},
    { title: "Marketing", items: [
      { label: "SMM menejerlar",         to: "/jobs?q=smm" },
      { label: "SEO mutaxassislari",     to: "/jobs?q=seo" },
      { label: "Reklama mutaxassislari", to: "/jobs?q=advertising" },
      { label: "Email marketing",        to: "/jobs?q=email+marketing" },
    ]},
    { title: "Matn yozish & kontent", items: [
      { label: "Kontent yozuvchilar",to: "/jobs?q=content+writing" },
      { label: "Kopirayterlar",      to: "/jobs?q=copywriting" },
      { label: "Tarjimonlar",        to: "/jobs?q=translation" },
      { label: "Muharrirlar",        to: "/jobs?q=editing" },
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
                  {workCategories.map(col => (
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

        {/* Right actions — NO SEARCH, only combined preferences + login + signup */}
        <div className="uw-actions">
          <PreferencesDropdown 
            i18n={i18n} 
            changeLanguage={changeLanguage} 
            isDark={isDark} 
            toggle={toggle} 
          />

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
                  <span className="uw-drawer__langbtn-flag">{l.flag}</span><span className="uw-drawer__langbtn-text">{l.short}</span>
                </button>
              ))}
            </div>

            <NavLink to="/hire" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              <span className="uw-drawer__link-icon-box"><Users size={16} /></span>
              <span className="uw-drawer__link-text">{t("header.hireTalent")}</span>
              <ChevronRight size={14} className="uw-drawer__link-arrow" />
            </NavLink>
            <NavLink to="/find-work" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              <span className="uw-drawer__link-icon-box"><Briefcase size={16} /></span>
              <span className="uw-drawer__link-text">{t("header.findWork")}</span>
              <ChevronRight size={14} className="uw-drawer__link-arrow" />
            </NavLink>
            <NavLink to="/how-it-works" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              <span className="uw-drawer__link-icon-box"><Award size={16} /></span>
              <span className="uw-drawer__link-text">{t("header.howItWorks")}</span>
              <ChevronRight size={14} className="uw-drawer__link-arrow" />
            </NavLink>
            <NavLink to="/enterprise" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              <span className="uw-drawer__link-icon-box"><Shield size={16} /></span>
              <span className="uw-drawer__link-text">{t("header.enterprise")}</span>
              <ChevronRight size={14} className="uw-drawer__link-arrow" />
            </NavLink>
            <NavLink to="/pricing" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              <span className="uw-drawer__link-icon-box"><CreditCard size={16} /></span>
              <span className="uw-drawer__link-text">{t("header.pricing")}</span>
              <ChevronRight size={14} className="uw-drawer__link-arrow" />
            </NavLink>
            <NavLink to="/support" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              <span className="uw-drawer__link-icon-box"><HelpCircle size={16} /></span>
              <span className="uw-drawer__link-text">{t("header.support")}</span>
              <ChevronRight size={14} className="uw-drawer__link-arrow" />
            </NavLink>

            {/* Dark mode toggle in drawer */}
            <button className="uw-drawer__link uw-drawer__link--theme" onClick={toggle}>
              <span className="uw-drawer__link-icon-box">{isDark ? <Sun size={16} /> : <Moon size={16} />}</span>
              <span className="uw-drawer__link-text">{isDark ? t("profile.lightMode") : t("profile.darkMode")}</span>
              <span className="uw-drawer__theme-toggle-switch">
                <span className={`uw-drawer__theme-toggle-dot ${isDark ? "active" : ""}`} />
              </span>
            </button>
          </div>
          <div className="uw-drawer__actions">
            <Link to="/login" onClick={() => setMenuOpen(false)} className="uw-drawer__btn-login">{t("header.login")}</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="uw-drawer__btn-signup">{t("header.signup")}</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════════
// AUTH HEADER (logged in — freelancer navbar)
// ══════════════════════════════════════════════════════════
function AuthHeader({ user }) {
  const { t, i18n } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const { isDark, toggle } = useThemeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const jobsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const [activeToast, setActiveToast] = useState(null);

  // --- Global Rating State (Freelancer rating Client) ---
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [pendingContract, setPendingContract] = useState(null);

  const checkPendingReview = async () => {
    if (!user?.id) return;
    try {
      const { getPendingReview } = await import("../../../api/common");
      const res = await getPendingReview();
      if (res?.success && res.data) {
        setPendingContract(res.data);
        setRatingValue(0);
        setComment("");
        setShowRatingModal(true);
      }
    } catch (err) {
      console.error("Error checking pending review:", err);
    }
  };

  const handleRatingSubmit = async () => {
    if (!ratingValue) {
      alert("Iltimos, umumiy bahoni yulduzchalar orqali belgilang!");
      return;
    }

    if (ratingValue <= 3) {
      if (!comment || comment.trim().length < 20) {
        alert("Past baho (1-3 yulduz) berganda kamida 20 ta harfdan iborat batafsil izoh/sharh qoldirishingiz shart!");
        return;
      }
    }

    const isClientRating = String(user?.id) === String(pendingContract?.client_id);
    const scores = isClientRating
      ? { score_quality: ratingValue, score_timeliness: ratingValue, score_communication: ratingValue }
      : { score_payment: ratingValue, score_clarity: ratingValue };

    setRatingSubmitting(true);
    try {
      const { createReview } = await import("../../../api/common");
      const res = await createReview({
        contract_id: pendingContract.contract_id,
        comment,
        ...scores
      });

      if (res?.success !== false) {
        alert(isClientRating ? "Frilanserni muvaffaqiyatli baholadingiz, rahmat!" : "Mijozni muvaffaqiyatli baholadingiz, rahmat!");
        setShowRatingModal(false);
        setPendingContract(null);
      } else {
        alert(res?.message || "Xatolik yuz berdi");
      }
    } catch (err) {
      alert("Server xatosi");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const isClient = user?.role === "client";

  const [searchValue, setSearchValue] = useState("");
  const [searchCat, setSearchCat] = useState(isClient ? "Talent" : "Jobs");

  useEffect(() => {
    const h = (e) => { 
      if (jobsRef.current && !jobsRef.current.contains(e.target)) setJobsOpen(false); 
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); 
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);



  const [unreadCount, setUnreadCount] = useState(0);
  const [proposalsCount, setProposalsCount] = useState(0);
  // Stable notification sound source
  const audioRef = useRef(new Audio("https://cdn.freesound.org/previews/235/235911_2391266-lq.mp3"));

  // Brauzer bildirishnomasi funksiyasi
  const showBrowserNotification = (title, body, icon = "/UzWork transparent.png", url = null, tag = null) => {
    if (Notification.permission === "granted") {
      const notif = new Notification(title, { 
        body, 
        icon,
        tag: tag || undefined,
        renotify: !!tag 
      });
      notif.onclick = (e) => {
        e.preventDefault();
        window.focus();
        if (url) {
          navigate(url);
        }
        notif.close();
      };
    }
  };

  useEffect(() => {
    let mounted = true;

    // Brauzer bildirishnomasi uchun ruxsat so'rash
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const fetchCounts = async () => {
      try {
        const [msgRes, propRes] = await Promise.all([
          import("../../../api/messages").then(m => m.getUnreadMessagesCount()),
          import("../../../api/common").then(m => m.getUnreadProposalsCount())
        ]);
        
        if (mounted) {
          if (msgRes?.success && msgRes.data) {
            setUnreadCount(msgRes.data.unread_count || 0);
            
            // O'tkazib yuborilgan xabarlarni tekshirish
            if ((msgRes.data.unread_count || 0) > 0 && Notification.permission === "granted") {
              const chatRes = await import("../../../api/messages").then(m => m.getChats());
              if (chatRes?.success && chatRes.data?.chats) {
                const unreadChats = chatRes.data.chats.filter(c => c.unread_count > 0);
                const shownIds = JSON.parse(localStorage.getItem('shown_notifications') || '[]');
                let updated = false;

                unreadChats.slice(0, 10).forEach((chat, idx) => {
                  const msgId = chat.last_message_id || `chat_${chat.chat_id}_${chat.last_message_at}`;
                  if (!shownIds.includes(msgId)) {
                    // Chat ob'ektidan xabar previewini yasaymiz
                    const chatMsgObj = {
                      type: chat.last_message_type,
                      content: chat.last_message_content
                    };

                    const countPrefix = chat.unread_count > 1 ? `(${chat.unread_count}) ` : "";

                    setTimeout(() => {
                      showBrowserNotification(
                        `${countPrefix}Yangi xabar: ${chat.partner?.first_name || 'Foydalanuvchi'}`,
                        getPreviewText(chatMsgObj, t),
                        chat.partner?.avatar_url || "/UzWork transparent.png",
                        `/messages/${chat.chat_id}?msgId=${chat.last_message_id}`,
                        msgId
                      );
                    }, idx * 1000);

                    shownIds.push(msgId);
                    updated = true;
                  }
                });

                if (updated) {
                  localStorage.setItem('shown_notifications', JSON.stringify(shownIds.slice(-100)));
                }
              }
            }
          }
          if (propRes?.success && propRes.data) {
            setProposalsCount(propRes.data.unread_count || 0);
          }
        }
      } catch (err) {
        console.error("Unread counts fetch error:", err);
      }
    };

    fetchCounts();
    checkPendingReview();

    const socketObj = getSocket();
    if (!socketObj) return;

    // 1. YANGI CHAT XABARI
    const handleNewMessage = (msg) => {
      if (msg.sender_id !== user?.id) {
        // Brauzer xabari va count yangilash (agar hali ko'rsatilmagan bo'lsa)
        const shownIds = JSON.parse(localStorage.getItem('shown_notifications') || '[]');
        if (!shownIds.includes(msg.id)) {
          fetchCounts();
          
          // Ovoz (Try-catch with muted check)
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }

          showBrowserNotification(
            `Yangi xabar: ${msg.sender_first_name || 'Foydalanuvchi'}`,
            getPreviewText(msg, t),
            msg.sender_avatar_url || "/UzWork transparent.png",
            `/messages/${msg.chat_id}?msgId=${msg.id}`,
            msg.id
          );
          
          shownIds.push(msg.id);
          localStorage.setItem('shown_notifications', JSON.stringify(shownIds.slice(-100)));
        }
      }
    };

    // 2. YANGI BILDIRISNOMA
    const handleNewNotification = (noti) => {
      if (mounted) {
        setActiveToast(noti);
        
        // Ovoz
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }

        // Brauzer xabari
        const shownIds = JSON.parse(localStorage.getItem('shown_notifications') || '[]');
        if (!shownIds.includes(noti.id)) {
          showBrowserNotification(
            noti.title || "UzWork",
            noti.message,
            noti.icon || "/UzWork transparent.png"
          );
          shownIds.push(noti.id);
          localStorage.setItem('shown_notifications', JSON.stringify(shownIds.slice(-100)));
        }

        // Agar taklif bilan bog'liq bo'lsa, sonini yangilaymiz
        if (noti.type && (noti.type.startsWith('proposal_') || noti.type === 'job_invitation')) {
          fetchCounts();
        }

        // Agar yangi sharh bo'lsa, baholash modali ochiladi
        if (noti.type === 'new_review') {
          checkPendingReview();
        }
      }
    };

    const handleRead = () => fetchCounts();
    const handleUnreadUpdate = () => fetchCounts();
    const handleNotifRead = () => { if (mounted) fetchCounts(); };

    const handleCheckPending = () => {
      checkPendingReview();
    };
    window.addEventListener('check_pending_review', handleCheckPending);

    socketObj.on("newMessage", handleNewMessage);
    socketObj.on("newNotification", handleNewNotification);
    socketObj.on("unreadUpdate", handleUnreadUpdate);
    socketObj.on("messagesRead", handleRead);
    socketObj.on("notificationRead", handleNotifRead);
    socketObj.on("notificationsAllRead", handleNotifRead);
    socketObj.on("notificationsAllReadByType", handleNotifRead);

    return () => {
      mounted = false;
      window.removeEventListener('check_pending_review', handleCheckPending);
      socketObj.off("newMessage", handleNewMessage);
      socketObj.off("newNotification", handleNewNotification);
      socketObj.off("unreadUpdate", handleUnreadUpdate);
      socketObj.off("messagesRead", handleRead);
      socketObj.off("notificationRead", handleNotifRead);
      socketObj.off("notificationsAllRead", handleNotifRead);
      socketObj.off("notificationsAllReadByType", handleNotifRead);
    };
  }, [user?.id]);

  const links = useMemo(() => {
    const base = isClient
      ? [
          { to: "/client/talent", label: t("navbar.findTalent") },
          { to: "/client/my-jobs", label: t("navbar.myJobs") },
          { to: "/client/proposals", label: t("navbar.proposals") },
          { to: "/client/management", label: "Shartnoma tahlili & Stats" },
          { to: "/contracts", label: "Shartnomalarim & Nizolar" },
          { to: "/messages", label: t("navbar.messages") },
        ]
      : [
          { to: "/find-work", label: t("navbar.findWork") },
          { to: "/my-jobs", label: t("navbar.myJobs") },
          { to: "/my-proposals", label: t("navbar.proposals") },
          { to: "/reports", label: t("navbar.reports") },
          { to: "/messages", label: t("navbar.messages") },
        ];

    return base.map((l) => ({
      ...l,
      badge: l.to === "/messages" ? unreadCount : (l.to.includes("proposals") ? proposalsCount : 0),
    }));
  }, [t, isClient, unreadCount, proposalsCount]);

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (!searchValue.trim()) return;
      
      const q = encodeURIComponent(searchValue.trim());
      if (searchCat === "Talent") {
        navigate(`/client/talent?q=${q}`);
      } else {
        navigate(`/find-work?q=${q}`);
      }
      setJobsOpen(false);
    }
  };

  const categories = [
    { key: "Jobs",     label: t("navbar.searchJobs") },
    { key: "Talent",   label: t("navbar.searchTalent") }
  ];

  const handleProfileNav = (section) => {
    setProfileOpen(false);
    if (section === "billing") {
      navigate(isClient ? "/client/payments" : "/wallet");
      return;
    }
    if (isClient) {
      navigate(`/profile/client?section=${section}`);
    } else {
      navigate(`/profile?section=${section}`);
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    import("../../../api/auth").then(({ logout }) => {
      logout().then(() => {
        window.dispatchEvent(new Event("authChange"));
        navigate("/login");
      });
    });
  };

  const handleSwitchRole = () => {
    setProfileOpen(false);
    const newRole = isClient ? "freelancer" : "client";
    const updatedUser = { ...user, role: newRole };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("authChange"));
    navigate(newRole === "client" ? "/client/landing" : "/find-work");
  };

  return (
    <>
      <header className="nav glass-header">
        <div className="nav__inner">
          <div className="nav__left">
            <button className="nav__hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </button>
            <span className="nav__brand">uzwork</span>
            <span className="nav__divider" />
            <nav className="nav__menu">
              {isClient ? (
                <>
                  <NavLink 
                    to="/client/talent" 
                    className={({ isActive }) => "nav__link" + (isActive ? " is-active" : "")}
                  >
                    {t("navbar.findTalent")}
                  </NavLink>

                  {/* My Jobs Dropdown */}
                  <div className="nav__item-with-dropdown">
                    <NavLink 
                      to="/client/my-jobs" 
                      className={({ isActive }) => {
                        const isSubActive = location.pathname.startsWith('/client/proposals') || 
                                          location.pathname.startsWith('/client/my-jobs');
                        return "nav__link" + (isActive || isSubActive ? " is-active" : "");
                      }}
                      style={{ position: 'relative' }}
                    >
                      {t("navbar.myJobs")}
                      {proposalsCount > 0 && (
                        <span className="nav__badge unread-badge" style={{ top: '-4px', right: '12px' }}>
                          {proposalsCount > 99 ? "99+" : proposalsCount}
                        </span>
                      )}
                      <ChevronDown size={14} className="nav__chevron" />
                    </NavLink>
                    <div className="nav__dropdown">
                      <NavLink to="/client/my-jobs" className={({ isActive }) => "dropdown__link" + (isActive ? " is-active" : "")}>
                        <Briefcase size={16} />
                        <span>{t("navbar.myJobs")}</span>
                      </NavLink>
                      <NavLink to="/client/proposals" className={({ isActive }) => "dropdown__link" + (isActive ? " is-active" : "")} style={{ display: 'flex', alignItems: 'center' }}>
                        <Users size={16} />
                        <span>{t("navbar.proposals")}</span>
                        {proposalsCount > 0 && (
                          <span className="nav__badge unread-badge" style={{ marginLeft: 'auto', position: 'static', transform: 'none' }}>
                            {proposalsCount > 99 ? "99+" : proposalsCount}
                          </span>
                        )}
                      </NavLink>
                      <NavLink to="/client/saved" className={({ isActive }) => "dropdown__link" + (isActive ? " is-active" : "")}>
                        <Star size={16} />
                        <span>{t("navbar.saved")}</span>
                      </NavLink>
                    </div>
                  </div>

                  {/* Kontraktlar Dropdown */}
                  <div className="nav__item-with-dropdown">
                    <NavLink 
                      to="/client/management" 
                      className={({ isActive }) => {
                        const isSubActive = location.pathname.startsWith('/contracts') || 
                                           location.pathname.startsWith('/client/management');
                        return "nav__link" + (isActive || isSubActive ? " is-active" : "");
                      }}
                    >
                      {t("navbar.contracts")}
                      <ChevronDown size={14} className="nav__chevron" />
                    </NavLink>
                    <div className="nav__dropdown">
                      <NavLink to="/client/management" className={({ isActive }) => "dropdown__link" + (isActive ? " is-active" : "")}>
                        <Briefcase size={16} />
                        <span>Shartnoma tahlili & Stats</span>
                      </NavLink>
                      <NavLink to="/contracts" className={({ isActive }) => "dropdown__link" + (isActive ? " is-active" : "")}>
                        <FileText size={16} />
                        <span>Shartnomalarim & Nizolar</span>
                      </NavLink>
                    </div>
                  </div>

                  <NavLink
                    to="/messages"
                    className={({ isActive }) => "nav__link" + (isActive ? " is-active" : "")}
                    style={{ position: "relative" }}
                  >
                    {t("navbar.messages")}
                    {unreadCount > 0 && (
                      <span className="nav__badge unread-badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/find-work"
                    className={({ isActive }) =>
                      "nav__link" + (isActive ? " is-active" : "")
                    }
                  >
                    {t("navbar.findWork")}
                  </NavLink>

                   {/* My Jobs Dropdown (Freelancer) */}
                  <div className="nav__item-with-dropdown">
                    <NavLink
                      to="/my-jobs"
                      className={({ isActive }) => {
                        const isSubActive = location.pathname.startsWith('/contracts') || 
                                          location.pathname.startsWith('/my-proposals') ||
                                          location.pathname.startsWith('/saved-jobs');
                        return "nav__link" + (isActive || isSubActive ? " is-active" : "");
                      }}
                      style={{ position: 'relative' }}
                    >
                      {t("navbar.myJobs")}
                      {proposalsCount > 0 && (
                        <span className="nav__badge unread-badge" style={{ top: '-4px', right: '12px' }}>
                          {proposalsCount > 99 ? "99+" : proposalsCount}
                        </span>
                      )}
                      <ChevronDown size={14} className="nav__chevron" />
                    </NavLink>
                    <div className="nav__dropdown">
                      <NavLink to="/my-jobs" className={({ isActive }) => "dropdown__link" + (isActive ? " is-active" : "")}>
                        <Briefcase size={16} />
                        <span>{t("navbar.myJobs")}</span>
                      </NavLink>
                      <NavLink to="/contracts" className={({ isActive }) => "dropdown__link" + (isActive ? " is-active" : "")}>
                        <FileText size={16} />
                        <span>{t("navbar.contracts")}</span>
                      </NavLink>
                      <NavLink to="/my-proposals" className={({ isActive }) => "dropdown__link" + (isActive ? " is-active" : "")} style={{ display: 'flex', alignItems: 'center' }}>
                        <Users size={16} />
                        <span>{t("navbar.proposals")}</span>
                        {proposalsCount > 0 && (
                          <span className="nav__badge unread-badge" style={{ marginLeft: 'auto', position: 'static', transform: 'none' }}>
                            {proposalsCount > 99 ? "99+" : proposalsCount}
                          </span>
                        )}
                      </NavLink>
                    </div>
                  </div>

                  {links.filter(l => l.to !== "/find-work" && l.to !== "/my-jobs" && l.to !== "/my-proposals").map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className={({ isActive }) =>
                        "nav__link" + (isActive ? " is-active" : "")
                      }
                      style={{ position: "relative" }}
                    >
                      {l.label}
                      {l.badge > 0 && (
                        <span className="nav__badge unread-badge">
                          {l.badge > 99 ? "99+" : l.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </>
              )}
            </nav>
          </div>

          <div className="nav__center">
            <div className="search" ref={jobsRef}>
              <span className="search__icon" onClick={handleSearch} style={{ cursor: "pointer" }}><Search size={15} /></span>
              <input 
                className="search__input" 
                placeholder={isClient ? t("navbar.findTalent") + "..." : t("navbar.findWork") + "..."} 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
              />
              {isClient && (
                <>
                  <span className="search__divider" />
                  <button type="button" className="search__btn" onClick={() => setJobsOpen(v => !v)}>
                    {categories.find(c => c.key === searchCat)?.label} <ChevronDown size={14} className={`search__btn-chevron${jobsOpen ? " open" : ""}`} />
                  </button>
                  {jobsOpen && (
                    <div className="dropdown">
                      {categories.map(cat => (
                        <button key={cat.key} className="dropdown__item" onClick={() => { setSearchCat(cat.key); setJobsOpen(false); }}>
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="nav__right">
            {isClient && (
              <button
                className="post-job-btn"
                onClick={() => navigate("/client/postjob")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 16px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
                  transition: "all 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(59,130,246,0.5)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(59,130,246,0.35)"; }}
              >
                <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
                {t("navbar.postJob")}
              </button>
            )}
            <NotificationDropdown />
            <div className="profile-menu-container" ref={profileRef} style={{ position: "relative" }}>
              <button 
                className={`avatar ${profileOpen ? 'active' : ''}`} 
                title="Profile" 
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <AvatarImage 
                  src={user?.avatar_url} 
                  name={user?.first_name + " " + user?.last_name} 
                  size={36}
                />
              </button>
              {profileOpen && (
                <div className="profile-dropdown-menu" style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "var(--surface, #fff)", border: "1px solid var(--border, #e2e8f0)",
                  borderRadius: "12px", width: "260px", zIndex: 1000,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.12)", padding: "8px"
                }}>
                  {/* ── User title ── */}
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border, #e2e8f0)", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px", display: "block", color: "var(--text)" }}>
                      {isClient ? t("profile.clientSettings") : t("profile.settings")}
                    </span>
                  </div>

                  {/* ── Language & Currency switcher row ── */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "6px 12px 10px", borderBottom: "1px solid var(--border, #e2e8f0)", marginBottom: "8px" }}>
                    {/* Languages */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Globe size={14} style={{ color: "var(--text-secondary, #64748b)", flexShrink: 0 }} />
                      {[
                        { code: "uz", flag: "🇺🇿", label: "UZ" },
                        { code: "ru", flag: "🇷🇺", label: "RU" },
                        { code: "en", flag: "🇬🇧", label: "EN" },
                      ].map(l => (
                        <button key={l.code} onClick={() => { i18n.changeLanguage(l.code); localStorage.setItem("appLanguage", l.code); }} style={{
                          flex: 1, padding: "5px 4px", border: "1px solid var(--border, #e2e8f0)", borderRadius: "6px", cursor: "pointer",
                          fontSize: "12px", fontWeight: 700, transition: "all 0.15s",
                          background: i18n.language.startsWith(l.code) ? "var(--blue, #3b82f6)" : "transparent",
                          color: i18n.language.startsWith(l.code) ? "#fff" : "var(--text, #1e293b)",
                        }}>{l.flag} {l.label}</button>
                      ))}
                    </div>

                    {/* Currencies */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: 14, display: 'flex', justifyContent: 'center' }}>
                         <span style={{ fontSize: 13, color: "var(--text-secondary, #64748b)", fontWeight: 700 }}>{currency === 'USD' ? '$' : currency === 'RUB' ? '₽' : 'UZ'}</span>
                      </div>
                      {[
                        { code: "USD", label: "USD" },
                        { code: "UZS", label: "UZS" },
                        { code: "RUB", label: "RUB" },
                      ].map(c => (
                        <button key={c.code} onClick={() => setCurrency(c.code)} style={{
                          flex: 1, padding: "5px 4px", border: "1px solid var(--border, #e2e8f0)", borderRadius: "6px", cursor: "pointer",
                          fontSize: "11px", fontWeight: 700, transition: "all 0.15s",
                          background: currency === c.code ? "var(--blue, #3b82f6)" : "transparent",
                          color: currency === c.code ? "#fff" : "var(--text, #1e293b)",
                        }}>{c.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* ── Night mode toggle row ── */}
                  <button onClick={toggle} style={{
                    display: "flex", alignItems: "center", gap: "10px", width: "100%", textAlign: "left",
                    padding: "9px 12px", marginBottom: "8px", background: isDark ? "rgba(59,130,246,0.1)" : "var(--bg, #f8fafc)",
                    border: "1px solid var(--border, #e2e8f0)", borderRadius: "8px", cursor: "pointer",
                    fontSize: "14px", color: "var(--text, #1e293b)", transition: "all 0.2s", fontWeight: 500,
                  }} onMouseOver={e => e.currentTarget.style.borderColor = "#3b82f6"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border, #e2e8f0)"}>
                    <span style={{ display: "flex", alignItems: "center", color: isDark ? "#f59e0b" : "#64748b" }}>
                      {isDark ? <Sun size={15} /> : <Moon size={15} />}
                    </span>
                    {isDark ? t("profile.lightMode") : t("profile.darkMode")}
                    <span style={{
                      marginLeft: "auto", width: "32px", height: "18px", borderRadius: "9px",
                      background: isDark ? "#3b82f6" : "#cbd5e1", position: "relative", transition: "background 0.2s", flexShrink: 0
                    }}>
                      <span style={{
                        position: "absolute", top: "2px", left: isDark ? "16px" : "2px",
                        width: "14px", height: "14px", borderRadius: "50%", background: "#fff",
                        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                      }} />
                    </span>
                  </button>

                  {/* ── Menu items ── */}
                  {isClient ? (
                    [
                      { id: "my-info", label: t("profile.myInfo"), icon: <User size={14} /> },
                      { id: "billing", label: t("profile.billing"), icon: <CreditCard size={14} /> },
                      { id: "password", label: t("profile.password"), icon: <Shield size={14} /> },
                      { id: "membership", label: t("profile.membership"), icon: <Award size={14} /> },
                      { id: "notifications", label: t("profile.notifications.title"), icon: <Bell size={14} /> },
                      { id: "appeals", label: t("profile.appeals.title"), icon: <AlertTriangle size={14} /> }
                    ].map(item => (
                      <button key={item.id} onClick={() => handleProfileNav(item.id)} style={{
                        display: "flex", alignItems: "center", gap: "10px", width: "100%", textAlign: "left", padding: "9px 12px",
                        background: "none", border: "none", borderRadius: "6px", cursor: "pointer",
                        fontSize: "14px", color: "var(--text, #1e293b)", transition: "0.2s"
                      }} onMouseOver={e => e.currentTarget.style.background = "var(--bg, #f1f5f9)"}
                         onMouseOut={e => e.currentTarget.style.background = "none"}>
                        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary, #64748b)' }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))
                  ) : (
                    [
                      { id: "my-info", label: t("profile.myInfo"), icon: <User size={14} /> },
                      { id: "cv-upload", label: t("profile.cvUpload"), icon: <FileText size={14} /> },
                      { id: "billing", label: t("profile.billing"), icon: <CreditCard size={14} /> },
                      { id: "password", label: t("profile.password"), icon: <Shield size={14} /> },
                      { id: "membership", label: t("profile.membership"), icon: <Award size={14} /> },
                      { id: "notifications", label: t("profile.notifications.title"), icon: <Bell size={14} /> },
                      { id: "appeals", label: t("profile.appeals.title"), icon: <AlertTriangle size={14} /> }
                    ].map(item => (
                      <button key={item.id} onClick={() => handleProfileNav(item.id)} style={{
                        display: "flex", alignItems: "center", gap: "10px", width: "100%", textAlign: "left", padding: "9px 12px",
                        background: "none", border: "none", borderRadius: "6px", cursor: "pointer",
                        fontSize: "14px", color: "var(--text, #1e293b)", transition: "0.2s"
                      }} onMouseOver={e => e.currentTarget.style.background = "var(--bg, #f1f5f9)"}
                         onMouseOut={e => e.currentTarget.style.background = "none"}>
                        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary, #64748b)' }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))
                  )}
                  <div style={{ margin: "8px 0", borderTop: "1px solid var(--border, #e2e8f0)" }}></div>
                  <button onClick={handleSwitchRole} style={{
                    display: "flex", alignItems: "center", gap: "10px", width: "100%", textAlign: "left", padding: "10px 12px",
                    background: "var(--bg, #f1f5f9)", border: "none", borderRadius: "6px", cursor: "pointer",
                    fontSize: "14px", color: "var(--blue)", fontWeight: 600, transition: "0.2s"
                  }} onMouseOver={e => e.currentTarget.style.background = "var(--blue-light, #dbeafe)"} onMouseOut={e => e.currentTarget.style.background = "var(--bg, #f1f5f9)"}>
                    <span style={{ display: 'flex', alignItems: 'center' }}><RefreshCw size={14} /></span>
                    {isClient ? t("profile.switchToFreelancer") : t("profile.switchToClient")}
                  </button>
                  <button onClick={() => handleProfileNav("help")} style={{
                    display: "flex", alignItems: "center", gap: "10px", width: "100%", textAlign: "left", padding: "10px 12px",
                    background: "none", border: "none", borderRadius: "6px", cursor: "pointer",
                    fontSize: "14px", color: "var(--text, #1e293b)", transition: "0.2s"
                  }} onMouseOver={e => e.currentTarget.style.background = "var(--bg, #f1f5f9)"} onMouseOut={e => e.currentTarget.style.background = "none"}>
                    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary, #64748b)' }}><HelpCircle size={14} /></span>
                    {t("profile.helpSupport")}
                  </button>
                  <button onClick={handleLogout} style={{
                    display: "flex", alignItems: "center", gap: "10px", width: "100%", textAlign: "left", padding: "10px 12px",
                    background: "none", border: "none", borderRadius: "6px", cursor: "pointer",
                    fontSize: "14px", color: "#ef4444", transition: "0.2s"
                  }} onMouseOver={e => e.currentTarget.style.background = "var(--bg, #f1f5f9)"} onMouseOut={e => e.currentTarget.style.background = "none"}>
                    <span style={{ display: 'flex', alignItems: 'center', color: '#ef4444' }}><LogOut size={14} /></span>
                    {t("profile.signOut")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {activeToast && (
        <Toast 
          message={activeToast.message || activeToast.title || "Yangi bildirishnoma"} 
          type={(() => {
            const t = activeToast.type;
            if (['proposal_accepted', 'contract_started', 'contract_completed', 'milestone_approved', 'dispute_resolved', 'verification_status'].includes(t)) return 'success';
            if (['proposal_rejected', 'contract_cancelled', 'dispute_opened', 'security_update', 'error'].includes(t)) return 'error';
            if (['job_invitation', 'warning'].includes(t)) return 'warning';
            return 'info';
          })()}
          onClose={() => setActiveToast(null)} 
          onClick={() => {
            const type = activeToast.type;
            const relatedId = activeToast.data?.related_id || activeToast.relatedId;
            switch (type) {
              case 'proposal_received': navigate('/client/proposals'); break;
              case 'proposal_accepted':
              case 'proposal_rejected':
              case 'job_invitation': navigate('/my-proposals'); break;
              case 'contract_started':
              case 'contract_completed':
              case 'contract_cancelled':
              case 'milestone_submitted':
              case 'milestone_approved':
                if (relatedId) navigate(`/contracts/${relatedId}`);
                else navigate('/contracts');
                break;
              case 'payment_received':
              case 'payment_sent': navigate('/wallet'); break;
              case 'message':
                if (relatedId) navigate(`/messages/${relatedId}`);
                else navigate('/messages');
                break;
              default: navigate('/profile?section=notifications'); break;
            }
            setActiveToast(null);
          }}
        />
      )}

      {showRatingModal && pendingContract && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: "var(--surface, #1e293b)", border: "1px solid rgba(255, 255, 255, 0.1)",
            width: "100%", maxWidth: 480, borderRadius: 24, padding: "32px 24px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", position: "relative",
            animation: "fadeInUp 0.3s ease-out", color: "var(--text, #fff)"
          }}>
            {/* Close button */}
            <button 
              onClick={() => setShowRatingModal(false)}
              style={{
                position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.05)",
                border: "none", color: "inherit", cursor: "pointer", width: 32, height: 32,
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <X size={16} />
            </button>

            {/* Header / Icon */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
              }}>
                <Award size={32} style={{ color: "var(--brand, #3b82f6)" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 750, color: "var(--text, #fff)", marginBottom: 8, textAlign: "center" }}>
                {String(user?.id) === String(pendingContract?.client_id) ? "Frilanserni baholash" : "Mijozni baholash"}
              </h3>
              <p style={{ color: "var(--muted, #94a3b8)", fontSize: 14, lineHeight: 1.5, textAlign: "center" }}>
                Hamkorlik muvaffaqiyatli yakunlandi! <strong>{
                  String(user?.id) === String(pendingContract?.client_id)
                    ? `${pendingContract.freelancer_first_name || ""} ${pendingContract.freelancer_last_name || ""}`.trim()
                    : `${pendingContract.client_first_name || ""} ${pendingContract.client_last_name || ""}`.trim()
                }</strong> bilan ishlashni qanday baholaysiz?
              </p>
            </div>

            {/* Star input */}
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <label style={{ display: "block", fontSize: 15, fontWeight: 750, color: "var(--text)", marginBottom: 12 }}>
                Umumiy baho
              </label>
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingValue(star)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: 4,
                      transition: "transform 0.15s ease", transform: ratingValue >= star ? "scale(1.15)" : "scale(1)"
                    }}
                  >
                    <Star 
                      size={36} 
                      fill={ratingValue >= star ? "#f59e0b" : "none"} 
                      color={ratingValue >= star ? "#f59e0b" : "#cbd5e1"} 
                    />
                  </button>
                ))}
              </div>
              {ratingValue > 0 && (
                <div style={{ marginTop: 8, fontSize: 13, color: "var(--brand, #3b82f6)", fontWeight: 600 }}>
                  {ratingValue === 5 && "A'lo, juda mamnunman!"}
                  {ratingValue === 4 && "Yaxshi, hamkorlik yoqdi!"}
                  {ratingValue === 3 && "O'rtacha, kamchiliklar bor"}
                  {ratingValue === 2 && "Yomon, tavsiya qilmayman"}
                  {ratingValue === 1 && "Juda yomon!"}
                </div>
              )}
            </div>

            {/* Comment field */}
            <div style={{ marginBottom: 24, textAlign: "left" }}>
              <label style={{ display: "block", fontSize: 15, fontWeight: 750, color: "var(--text)", marginBottom: 6 }}>
                Sharh {ratingValue <= 3 && ratingValue > 0 && <span style={{ color: "#ef4444" }}>* (kamida 20 ta harf)</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Mijoz va loyiha haqida fikringizni yozib qoldiring..."
                style={{
                  width: "100%", height: 80, padding: 12, borderRadius: 12,
                  background: "var(--surface-2, #1e293b)", border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "var(--text)", fontSize: 14, outline: "none", resize: "none"
                }}
              />
              {ratingValue <= 3 && ratingValue > 0 && (!comment || comment.trim().length < 20) && (
                <span style={{ color: "#ef4444", fontSize: 12, display: "block", marginTop: 4 }}>
                  Past baho berganda sharh qoldirish majburiy! Hozirgi uzunlik: {comment ? comment.trim().length : 0}/20
                </span>
              )}
            </div>

            {/* Submit buttons */}
            <div style={{ display: "flex", gap: 16 }}>
              <button 
                className="cd-btn-premium cd-btn-outline" 
                style={{ flex: 1, color: "#94a3b8", borderColor: "rgba(148, 163, 184, 0.3)", padding: "10px 16px", borderRadius: "12px", background: "none", cursor: "pointer", fontWeight: 600 }} 
                onClick={() => setShowRatingModal(false)}
              >
                Keyinroq
              </button>
              <button 
                className="cd-btn-premium cd-btn-primary" 
                style={{ flex: 1, padding: "10px 16px", borderRadius: "12px", background: "var(--brand, #2563eb)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}
                disabled={ratingSubmitting}
                onClick={handleRatingSubmit}
              >
                {ratingSubmitting ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                style={{ position: "relative" }}
              >
                {l.label}
                {l.badge > 0 && (
                  <span className="nav__badge unread-badge">
                    {l.badge > 99 ? "99+" : l.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="drawer-nav" style={{ borderBottom: "none" }}>
            <button className="drawer-icon-row" onClick={toggle}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? t("profile.lightMode") : t("profile.darkMode")}
            </button>
            <button className="drawer-icon-row" onClick={() => { setDrawerOpen(false); /* notifications logic */ }}><Bell size={16} /> {t("profile.notificationsList")}</button>
            <button className="drawer-icon-row" onClick={() => { setDrawerOpen(false); navigate("/help"); }}><HelpCircle size={16} /> {t("profile.help")}</button>
            <button className="drawer-icon-row" onClick={() => { setDrawerOpen(false); handleProfileNav("my-info"); }}><Settings size={16} /> {t("profile.settings")}</button>
            <button className="drawer-icon-row" onClick={() => { setDrawerOpen(false); navigate(isClient ? "/profile/client" : "/profile"); }}><User size={16} /> {t("profile.profile")}</button>
            <button className="drawer-icon-row" onClick={handleSwitchRole} style={{ color: "var(--blue)", fontWeight: 600 }}>
              <RefreshCw size={16} /> {isClient ? t("profile.switchToFreelancer") : t("profile.switchToClient")}
            </button>
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const check = () => {
      setIsLoggedIn(!!getToken());
      const u = localStorage.getItem("user");
      try {
        setUser(u ? JSON.parse(u) : null);
      } catch (e) {
        setUser(null);
      }
    };
    check();
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
    return <AuthHeader user={user} />;
  }

  return <LandingHeader i18n={i18n} changeLanguage={changeLanguage} />;
}
