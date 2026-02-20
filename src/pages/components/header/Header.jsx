import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Sun, Moon, Menu, X, ChevronDown } from "lucide-react";
import "./Header.css";

export default function Header({ isDarkMode, toggleDarkMode }) {
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
    document.body.classList.toggle("dark-mode", isDarkMode);
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
      const megaRoot = document.querySelector(".uw-nav");
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
        title: "Admin & Support",
        items: [
          { label: "Virtual assistants", to: "/talent/virtual-assistant" },
          { label: "Data entry", to: "/talent/data-entry" },
          { label: "Customer support", to: "/talent/customer-support" },
          { label: "Project managers", to: "/talent/project-manager" },
        ],
      },
      {
        title: "Design & Creative",
        items: [
          { label: "Graphic designers", to: "/talent/graphic-design" },
          { label: "UI/UX designers", to: "/talent/ui-ux" },
          { label: "Illustrators", to: "/talent/illustration" },
          { label: "Video editors", to: "/talent/video-editing" },
        ],
      },
      {
        title: "Development & Tech",
        items: [
          { label: "Web developers", to: "/talent/web-dev" },
          { label: "Mobile developers", to: "/talent/mobile-dev" },
          { label: "Backend (Node.js)", to: "/talent/nodejs" },
          { label: "QA & Testing", to: "/talent/qa" },
        ],
      },
      {
        title: "Marketing",
        items: [
          { label: "SMM managers", to: "/talent/smm" },
          { label: "SEO experts", to: "/talent/seo" },
          { label: "Ads specialists", to: "/talent/ads" },
          { label: "Email marketing", to: "/talent/email-marketing" },
        ],
      },
      {
        title: "Writing & Content",
        items: [
          { label: "Content writers", to: "/talent/content-writing" },
          { label: "Copywriters", to: "/talent/copywriting" },
          { label: "Translators", to: "/talent/translation" },
          { label: "Editors", to: "/talent/editing" },
        ],
      },
    ],
    []
  );

  const workCategories = useMemo(
    () => [
      {
        title: "Admin & Support jobs",
        items: [
          { label: "Virtual assistant jobs", to: "/jobs/virtual-assistant" },
          { label: "Data entry jobs", to: "/jobs/data-entry" },
          { label: "Customer support jobs", to: "/jobs/customer-support" },
          { label: "Project management jobs", to: "/jobs/project-management" },
        ],
      },
      {
        title: "Design & Creative jobs",
        items: [
          { label: "Graphic design jobs", to: "/jobs/graphic-design" },
          { label: "UI/UX jobs", to: "/jobs/ui-ux" },
          { label: "Illustration jobs", to: "/jobs/illustration" },
          { label: "Video editing jobs", to: "/jobs/video-editing" },
        ],
      },
      {
        title: "Development & Tech jobs",
        items: [
          { label: "Frontend jobs", to: "/jobs/frontend" },
          { label: "Backend jobs", to: "/jobs/backend" },
          { label: "React jobs", to: "/jobs/react" },
          { label: "Node.js jobs", to: "/jobs/nodejs" },
        ],
      },
      {
        title: "Marketing jobs",
        items: [
          { label: "SMM jobs", to: "/jobs/smm" },
          { label: "SEO jobs", to: "/jobs/seo" },
          { label: "Google Ads jobs", to: "/jobs/google-ads" },
          { label: "Email marketing jobs", to: "/jobs/email-marketing" },
        ],
      },
      {
        title: "Writing & content jobs",
        items: [
          { label: "Content writing jobs", to: "/jobs/content-writing" },
          { label: "Copywriting jobs", to: "/jobs/copywriting" },
          { label: "Translation jobs", to: "/jobs/translation" },
          { label: "Editing jobs", to: "/jobs/editing" },
        ],
      },
    ],
    []
  );

  const navLinks = useMemo(
    () => [
      { to: "/how-it-works", label: "How it works" },
      { to: "/enterprise", label: "Enterprise" },
    ],
    []
  );

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
          <div
            className="uw-mega"
            onMouseEnter={openHire}
            onMouseLeave={scheduleCloseMegas}
          >
            <button
              type="button"
              className={`uw-nav__link uw-nav__link--btn ${hireOpen ? "uw-nav__link--active" : ""}`}
              onClick={() => (hireOpen ? setHireOpen(false) : openHire())}
              aria-expanded={hireOpen}
              aria-haspopup="menu"
            >
              Hire talent <ChevronDown size={16} />
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
                      <Link key={it.to} to={it.to} className="uw-mega__item">
                        {it.label}
                      </Link>
                    ))}
                  </div>
                ))}

                <div className="uw-mega__side">
                  <div className="uw-mega__sideTitle">Need help?</div>
                  <Link className="uw-mega__sideLink" to="/explore">
                    Explore more →
                  </Link>
                  <Link className="uw-mega__sideLink" to="/consultation">
                    Book consultation →
                  </Link>
                  <Link className="uw-mega__sideLink" to="/business-plus">
                    Join Business Plus →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Find work mega */}
          <div
            className="uw-mega"
            onMouseEnter={openWork}
            onMouseLeave={scheduleCloseMegas}
          >
            <button
              type="button"
              className={`uw-nav__link uw-nav__link--btn ${workOpen ? "uw-nav__link--active" : ""}`}
              onClick={() => (workOpen ? setWorkOpen(false) : openWork())}
              aria-expanded={workOpen}
              aria-haspopup="menu"
            >
              Find work <ChevronDown size={16} />
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
                      <Link key={it.to} to={it.to} className="uw-mega__item">
                        {it.label}
                      </Link>
                    ))}
                  </div>
                ))}

                <div className="uw-mega__side">
                  <div className="uw-mega__sideTitle">Boost your profile</div>
                  <Link className="uw-mega__sideLink" to="/earn">
                    Ways to earn →
                  </Link>
                  <Link className="uw-mega__sideLink" to="/ads">
                    Win work with ads →
                  </Link>
                  <Link className="uw-mega__sideLink" to="/freelancer-plus">
                    Join Freelancer Plus →
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
                // boshqa navga borganda mega yopilsin
                closeAllMegas();
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
              More <ChevronDown size={16} />
            </button>

            <div
              className={`uw-nav__menu ${moreOpen ? "open" : ""}`}
              onMouseEnter={openMore}
              onMouseLeave={scheduleCloseMore}
            >
              <Link to="/pricing" className="uw-nav__menulink">Pricing</Link>
              <Link to="/reviews" className="uw-nav__menulink">Reviews</Link>
              <Link to="/support" className="uw-nav__menulink">Support</Link>
            </div>
          </div>
        </nav>

        {/* Right: Actions */}
        <div className="uw-actions">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="uw-iconbtn"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/login" className="uw-linkbtn">Kirish</Link>
          <Link to="/signup" className="uw-ctabtn">Boshlash</Link>

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

      {/* Mobile Drawer (oldingi holicha) */}
      <div className={`uw-drawer ${menuOpen ? "uw-drawer--open" : ""}`}>
        <div className="uw-drawer__inner">
          <div className="uw-drawer__links">
            <NavLink to="/hire" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              Hire talent
            </NavLink>
            <NavLink to="/find-work" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              Find work
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

            <NavLink to="/pricing" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              Pricing
            </NavLink>
            <NavLink to="/support" onClick={() => setMenuOpen(false)} className="uw-drawer__link">
              Support
            </NavLink>
          </div>

          <div className="uw-drawer__actions">
            <Link to="/login" onClick={() => setMenuOpen(false)} className="uw-linkbtn uw-linkbtn--full">
              Kirish
            </Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="uw-ctabtn uw-ctabtn--full">
              Boshlash
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}