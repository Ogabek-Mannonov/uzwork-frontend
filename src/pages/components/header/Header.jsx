// src/pages/components/header/Header.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, ChevronDown, Search } from "lucide-react";
import "./Header.css";

export default function Header({
  isDarkMode,
  toggleDarkMode,

  // ✅ Category page uchun header search
  hireSearchEnabled = false,
  hireSearchValue = "",
  onHireSearchChange = () => {},
  hireSearchPlaceholder = "Mutaxassis qidiring...",
}) {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ---------- More dropdown ----------
  const [moreOpen, setMoreOpen] = useState(false);
  const moreCloseTimer = useRef(null);

  const openMore = () => {
    if (moreCloseTimer.current) clearTimeout(moreCloseTimer.current);
    setMoreOpen(true);
  };
  const scheduleCloseMore = () => {
    if (moreCloseTimer.current) clearTimeout(moreCloseTimer.current);
    moreCloseTimer.current = setTimeout(() => setMoreOpen(false), 180);
  };

  // ---------- Mega menus ----------
  const [hireOpen, setHireOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const megaCloseTimer = useRef(null);

  const closeAllMegas = () => {
    setHireOpen(false);
    setWorkOpen(false);
  };

  const openHire = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setHireOpen(true);
    setWorkOpen(false);
    setMoreOpen(false);
  };

  const openWork = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setWorkOpen(true);
    setHireOpen(false);
    setMoreOpen(false);
  };

  const scheduleCloseMegas = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    megaCloseTimer.current = setTimeout(() => {
      setHireOpen(false);
      setWorkOpen(false);
    }, 200);
  };

  // ---------- effects ----------
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", !!isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) setMenuOpen(false);
      if (window.innerWidth <= 860) closeAllMegas();
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // outside click => close menus
  useEffect(() => {
    const onDocClick = (e) => {
      const megaRoot = document.querySelector(".uw-header");
      if (!megaRoot) return;
      if (!megaRoot.contains(e.target)) {
        closeAllMegas();
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ---------- data ----------
  const hireCategories = useMemo(
    () => [
      {
        title: "Admin & qo'llab-quvvatlash",
        items: [
          { label: "Virtual yordamchilar", to: "/talent/virtual-assistant" },
          { label: "Ma'lumot kiritish", to: "/talent/data-entry" },
          { label: "Mijozlarni qo'llab-quvvatlash", to: "/talent/customer-support" },
          { label: "Loyiha menejerlari", to: "/talent/project-manager" },
        ],
      },
      {
        title: "Dizayn & kreativlik",
        items: [
          { label: "Grafik dizaynerlar", to: "/talent/graphic-design" },
          { label: "UI/UX dizaynerlar", to: "/talent/ui-ux" },
          { label: "Illyustratorlar", to: "/talent/illustration" },
          { label: "Video montajchilar", to: "/talent/video-editing" },
        ],
      },
      {
        title: "Dasturlash & texnologiyalar",
        items: [
          { label: "Veb dasturchilar", to: "/talent/web-dev" },
          { label: "Mobil ilova dasturchilari", to: "/talent/mobile-dev" },
          { label: "Backend dasturchilar", to: "/talent/nodejs" },
          { label: "QA & Testing", to: "/talent/qa" },
        ],
      },
      {
        title: "Marketing",
        items: [
          { label: "SMM menejerlar", to: "/talent/smm" },
          { label: "SEO mutaxassislari", to: "/talent/seo" },
          { label: "Reklama mutaxassislari", to: "/talent/ads" },
          { label: "Email marketing", to: "/talent/email-marketing" },
        ],
      },
      {
        title: "Matn yozish & kontent",
        items: [
          { label: "Kontent yozuvchilar", to: "/talent/content-writing" },
          { label: "Kopirayterlar", to: "/talent/copywriting" },
          { label: "Tarjimonlar", to: "/talent/translation" },
          { label: "Muharrirlar", to: "/talent/editing" },
        ],
      },
    ],
    []
  );

  // hozircha work ham shunaqa (keyin alohida qilamiz)
  const workCategories = hireCategories;

  const navLinks = useMemo(
    () => [
      { to: "/how-it-works", label: "Qanday ishlaydi" },
      { to: "/enterprise", label: "Korporativ xizmatlar" },
    ],
    []
  );

  const onSearchSubmit = (e) => {
    e.preventDefault();
    // hozircha faqat UI: xohlasang keyin /search?query=... qilamiz
    // navigate(`/search?query=${encodeURIComponent(hireSearchValue)}`);
  };

  return (
    <header className={`uw-header ${scrolled ? "uw-header--scrolled" : ""}`}>
      <div className="uw-header__container">
        {/* Left: Brand */}
        <Link to="/" className="uw-brand" aria-label="Uzwork home">
          <span className="uw-brand__icon">
            <img
              className="uw-brand__logo"
              src="/UzWork transparent.png"
              alt="UzWork logo"
              loading="eager"
            />
          </span>
          <span className="uw-brand__name">UZWORK</span>
        </Link>

        {/* Center: Desktop Nav */}
        <nav className="uw-nav" aria-label="Primary">
          {/* Hire talent mega */}
          <div className="uw-mega" onMouseEnter={openHire} onMouseLeave={scheduleCloseMegas}>
            <button
              type="button"
              className={`uw-nav__link uw-nav__link--btn ${
                hireOpen ? "uw-nav__link--active" : ""
              }`}
              onClick={() => (hireOpen ? setHireOpen(false) : openHire())}
              aria-expanded={hireOpen}
              aria-haspopup="menu"
            >
              Mutaxassis yollash <ChevronDown size={16} />
            </button>

            <div
              className={`uw-mega__panel ${hireOpen ? "open" : ""}`}
              onMouseEnter={openHire}
              onMouseLeave={scheduleCloseMegas}
            >
              <div className="uw-mega__grid">
                {hireCategories.map((col) => (
                  <div key={col.title} className="uw-mega__col">
                    <div className="uw-mega__title">{col.title}</div>
                    {col.items.map((it) => (
                      <Link
                        key={it.to}
                        to={it.to}
                        className="uw-mega__item"
                        onClick={() => closeAllMegas()}
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                ))}

                <div className="uw-mega__side">
                  <div className="uw-mega__sideTitle">Yordam kerakmi?</div>
                  <Link className="uw-mega__sideLink" to="/explore">
                    Batafsil ko'rish →
                  </Link>
                  <Link className="uw-mega__sideLink" to="/consultation">
                    Maslahatga yozilish →
                  </Link>
                  <Link className="uw-mega__sideLink" to="/business-plus">
                    Business Plus ga qo'shilish →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Find work mega */}
          <div className="uw-mega" onMouseEnter={openWork} onMouseLeave={scheduleCloseMegas}>
            <button
              type="button"
              className={`uw-nav__link uw-nav__link--btn ${
                workOpen ? "uw-nav__link--active" : ""
              }`}
              onClick={() => (workOpen ? setWorkOpen(false) : openWork())}
              aria-expanded={workOpen}
              aria-haspopup="menu"
            >
              Ish topish <ChevronDown size={16} />
            </button>

            <div
              className={`uw-mega__panel ${workOpen ? "open" : ""}`}
              onMouseEnter={openWork}
              onMouseLeave={scheduleCloseMegas}
            >
              <div className="uw-mega__grid">
                {workCategories.map((col) => (
                  <div key={col.title} className="uw-mega__col">
                    <div className="uw-mega__title">{col.title}</div>
                    {col.items.map((it) => (
                      <Link
                        key={it.to}
                        to={it.to}
                        className="uw-mega__item"
                        onClick={() => closeAllMegas()}
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                ))}

                <div className="uw-mega__side">
                  <div className="uw-mega__sideTitle">Profilingizni rivojlantiring</div>
                  <Link className="uw-mega__sideLink" to="/earn">
                    Daromad topish yo'llari →
                  </Link>
                  <Link className="uw-mega__sideLink" to="/ads">
                    Reklama orqali ish yutib oling →
                  </Link>
                  <Link className="uw-mega__sideLink" to="/freelancer-plus">
                    Freelancer Plus'ga qo'shiling →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Other links */}
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `uw-nav__link ${isActive ? "uw-nav__link--active" : ""}`
              }
              onMouseEnter={() => {
                closeAllMegas();
                setMoreOpen(false);
              }}
            >
              {item.label}
            </NavLink>
          ))}

          {/* More dropdown */}
          <div
            className="uw-nav__more"
            onMouseEnter={() => {
              openMore();
              closeAllMegas();
            }}
            onMouseLeave={scheduleCloseMore}
          >
            <button type="button" className="uw-nav__morebtn">
              Yana <ChevronDown size={16} />
            </button>

            <div
              className={`uw-nav__menu ${moreOpen ? "open" : ""}`}
              onMouseEnter={openMore}
              onMouseLeave={scheduleCloseMore}
            >
              <Link to="/pricing" className="uw-nav__menulink">
                Narxlar
              </Link>
              <Link to="/reviews" className="uw-nav__menulink">
                Sharhlar
              </Link>
              <Link to="/support" className="uw-nav__menulink">
                Qo'llab-quvvatlash
              </Link>
            </div>
          </div>
        </nav>

        {/* ✅ Right: Actions + optional search */}
        <div className="uw-actions">
          {hireSearchEnabled && (
            <form className="uw-hireSearch" onSubmit={onSearchSubmit}>
              <Search size={16} />
              <input
                className="uw-hireSearch__input"
                value={hireSearchValue}
                onChange={(e) => onHireSearchChange(e.target.value)}
                placeholder={hireSearchPlaceholder}
              />
              <button
                type="button"
                className="uw-hireSearch__btn"
                onClick={() => navigate("/hire")}
                title="Qidirish"
              >
                Qidirish
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={toggleDarkMode}
            className="uw-iconbtn"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/login" className="uw-linkbtn">
            Kirish
          </Link>
          <Link to="/signup" className="uw-ctabtn">
            Boshlash
          </Link>

          <button
            type="button"
            className="uw-burger"
            aria-label="Open menu"
            onClick={() => setMenuOpen((s) => !s)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`uw-drawer ${menuOpen ? "uw-drawer--open" : ""}`}>
        <div className="uw-drawer__inner">
          <div className="uw-drawer__links">
            <NavLink to="/hire" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              Mutaxassis yollash
            </NavLink>
            <NavLink
              to="/find-work"
              onClick={() => setMenuOpen(false)}
              className="uw-drawer__link"
            >
              Ish topish
            </NavLink>

            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="uw-drawer__link"
              >
                {item.label}
              </NavLink>
            ))}

            <NavLink
              to="/pricing"
              onClick={() => setMenuOpen(false)}
              className="uw-drawer__link"
            >
              Narxlar
            </NavLink>
            <NavLink
              to="/support"
              onClick={() => setMenuOpen(false)}
              className="uw-drawer__link"
            >
              Support
            </NavLink>
          </div>

          <div className="uw-drawer__actions">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="uw-linkbtn uw-linkbtn--full"
            >
              Kirish
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="uw-ctabtn uw-ctabtn--full"
            >
              Boshlash
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}