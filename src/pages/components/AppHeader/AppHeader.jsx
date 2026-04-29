// src/pages/components/AppHeader/AppHeader.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sun, Moon, Menu, X, ChevronDown, Globe,
  Bell, HelpCircle, Settings, User, Search, Check,
  RefreshCw, Users, Briefcase, Plus, Star,
  CreditCard, Shield, Award, FileText, AlertTriangle, LogOut
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "../Theme/ThemeContext";

import "../header/Header.css";
import "../../../assets/style/FreeNavbar.css";
import "../../../assets/style/theme.css";
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
      style={{ objectFit: 'cover', borderRadius: '50%', width: `${size}px`, height: `${size}px` }}
    />
  );
}

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
function AuthHeader({ user }) {
  const { t, i18n } = useTranslation();
  const { isDark, toggle } = useThemeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const jobsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const [activeToast, setActiveToast] = useState(null);

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
  const showBrowserNotification = (title, body, icon = "/UzWork transparent.png") => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon });
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

                unreadChats.slice(0, 3).forEach(chat => {
                  const msgId = chat.last_message_id || `chat_${chat.chat_id}_${chat.last_message_at}`;
                  if (!shownIds.includes(msgId)) {
                    showBrowserNotification(
                      `Yangi xabar: ${chat.partner?.first_name || 'Foydalanuvchi'}`,
                      chat.last_message_content || "Xabar yuborildi",
                      chat.partner?.avatar_url || "/UzWork transparent.png"
                    );
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

    const socketObj = getSocket();
    if (!socketObj) return;

    // 1. YANGI CHAT XABARI
    const handleNewMessage = (msg) => {
      if (msg.sender_id !== user?.id) {
        fetchCounts();
        // Ovoz (Try-catch with muted check)
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
        
        // Brauzer xabari (agar hali ko'rsatilmagan bo'lsa)
        const shownIds = JSON.parse(localStorage.getItem('shown_notifications') || '[]');
        if (!shownIds.includes(msg.id)) {
          showBrowserNotification(
            `Yangi xabar: ${msg.sender_first_name || 'Foydalanuvchi'}`,
            msg.content,
            msg.sender_avatar_url || "/UzWork transparent.png"
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
      }
    };

    const handleRead = () => fetchCounts();
    const handleUnreadUpdate = () => fetchCounts();
    const handleNotifRead = () => { if (mounted) fetchCounts(); };

    socketObj.on("newMessage", handleNewMessage);
    socketObj.on("newNotification", handleNewNotification);
    socketObj.on("unreadUpdate", handleUnreadUpdate);
    socketObj.on("messagesRead", handleRead);
    socketObj.on("notificationRead", handleNotifRead);
    socketObj.on("notificationsAllRead", handleNotifRead);
    socketObj.on("notificationsAllReadByType", handleNotifRead);

    return () => {
      mounted = false;
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
                    >
                      {t("navbar.myJobs")}
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

                  <NavLink 
                    to="/client/management" 
                    className={({ isActive }) => "nav__link" + (isActive ? " is-active" : "")}
                  >
                    {t("navbar.contracts")}
                  </NavLink>

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
                      className={({ isActive }) =>
                        "nav__link" + (isActive ? " is-active" : "")
                      }
                    >
                      {t("navbar.myJobs")}
                      <ChevronDown size={14} className="nav__chevron" />
                    </NavLink>
                    <div className="nav__dropdown">
                      <NavLink to="/my-jobs" className="dropdown__link">
                        <span>{t("navbar.myJobs")}</span>
                      </NavLink>
                      <NavLink to="/contracts" className="dropdown__link">
                        <span>{t("navbar.contracts")}</span>
                      </NavLink>
                    </div>
                  </div>

                  {links.filter(l => l.to !== "/find-work" && l.to !== "/my-jobs").map((l) => (
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

                  {/* ── Language switcher row ── */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px 10px", borderBottom: "1px solid var(--border, #e2e8f0)", marginBottom: "8px" }}>
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
                      { id: "teams", label: t("profile.teams"), icon: <Users size={14} /> },
                      { id: "membership", label: t("profile.membership"), icon: <Award size={14} /> },
                      { id: "notifications", label: t("profile.notifications.title"), icon: <Bell size={14} /> },
                      { id: "tax", label: t("profile.taxInfo"), icon: <FileText size={14} /> },
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
