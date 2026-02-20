import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Sun, Moon, Menu, X, ChevronDown } from "lucide-react";
import "./Header.css";

export default function Header({ isDarkMode, toggleDarkMode }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);


  // route o'zgarsa menu yopilib ketsin (optional)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = useMemo(
    () => [
      { to: "/hire", label: "Hire talent" },
      { to: "/find-work", label: "Find work" },
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
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `uw-nav__link ${isActive ? "uw-nav__link--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {/* Optional dropdown style item */}

          <div
            className="uw-nav__more"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button type="button" className="uw-nav__morebtn">
              More <ChevronDown size={16} />
            </button>

            <div className={`uw-nav__menu ${moreOpen ? "open" : ""}`}>
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

          <Link to="/login" className="uw-linkbtn">
            Kirish
          </Link>

          <Link to="/signup" className="uw-ctabtn">
            Boshlash
          </Link>

          {/* Mobile menu toggle */}
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
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `uw-drawer__link ${isActive ? "uw-drawer__link--active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/pricing"
              onClick={() => setMenuOpen(false)}
              className="uw-drawer__link"
            >
              Pricing
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
