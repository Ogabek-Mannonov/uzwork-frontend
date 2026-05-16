import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getFreelancerById,
  getPublicPortfolio,
  getPublicCertifications,
} from "../../api/freelancer";
import { getUserProfile } from "../../api/common";
import {
  FiArrowLeft, FiMapPin, FiDollarSign, FiStar,
  FiBriefcase, FiAward, FiFileText, FiExternalLink,
  FiShield, FiCalendar, FiGlobe, FiShare2,
  FiLink, FiSend, FiLinkedin, FiPhone, FiMail,
  FiClock, FiCheckCircle, FiTerminal, FiCpu, FiUser,
  FiMessageSquare, FiUserPlus
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useUserPresence } from "../../hooks/useUserPresence";
import "./profile-css/public-profile.css";
import "../../assets/style/theme.css";

const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api\/?$/, "");

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND}${cleanUrl}`;
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
  const [error, setError] = useState(false);
  
  if (!src || error) {
    const initials = getInitials(name);
    return (
      <div 
        className={className} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'linear-gradient(135deg, var(--brand, #3b82f6), var(--brand-dark, #2563eb))', 
          color: '#fff', 
          fontWeight: '700',
          fontSize: size > 100 ? '3.5rem' : size > 60 ? '2.2rem' : size > 40 ? '1.5rem' : '1rem'
        }}
      >
        {initials || <FiUser size={size * 0.5} />}
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
    />
  );
}

export default function PublicProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [profileRes, portfolioRes, certRes] = await Promise.all([
          getUserProfile(id),
          getPublicPortfolio(id),
          getPublicCertifications(id),
        ]);

        const rawData = profileRes?.data || (profileRes?.user ? profileRes : null);

        if (rawData) {
          const u = rawData.user || {};
          const p = rawData.profile || {};

          setProfile({
            id: u.id || "",
            fullName: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "Noma'lum foydalanuvchi",
            username: u.username,
            avatar_url: p.avatar_url || u.avatar_url || "",
            title: p.title || "",
            bio: p.bio || "",
            location: p.location || "",
            hourly_rate: p.hourly_rate || 0,
            job_success_score: rawData.job_success_score || p.job_success_score || 0,
            total_earned: p.total_earned || 0,
            jobs_completed: rawData.completed_jobs || p.completed_jobs || 0,
            active_projects: rawData.in_progress_jobs || 0,
            average_rating: rawData.average_rating || p.rating || 0,
            total_reviews: rawData.total_reviews || 0,
            skills: Array.isArray(p.skills) ? p.skills : (p.skills ? [p.skills] : []),
            languages: p.languages || [],
            cover_url: p.cover_url || "",
            availability_status: p.availability_status || "Available",
          });
        }
        
        setPortfolio(portfolioRes?.data?.items || portfolioRes?.data || []);
        setCertifications(certRes?.data?.items || certRes?.data || []);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, t]);

  const presence = useUserPresence(id);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/client/talent");
    }
  };

  if (loading) return <div className="public-profile-container"><p>Yuklanmoqda...</p></div>;
  if (!profile) return <div className="public-profile-container"><p>Profil topilmadi.</p></div>;

  return (
    <div className="public-profile-container">
      <button className="back-link soft-fade-in" onClick={handleBack}>
        <FiArrowLeft /> {t("publicProfile.back", "Orqaga")}
      </button>

      {/* 🚀 HERO SECTION */}
      <section className="profile-hero soft-fade-in stagger-1">
        <div className="profile-banner">
          {profile.cover_url && <img src={avatarSrc(profile.cover_url)} alt="Banner" className="profile-banner-img" />}
        </div>
        
        <div className="profile-header-content">
          <div className="avatar-container">
            <AvatarImage 
              src={profile.avatar_url} 
              name={profile.fullName} 
              size={160} 
              className="avatar-main" 
            />
            <div className={`status-dot ${presence.isOnline ? 'online' : 'offline'}`}></div>
          </div>

          <div className="profile-identity">
            <div className="profile-name-row">
              <h1>{profile.fullName}</h1>
              <span className="verified-icon" title="Tasdiqlangan"><FiCheckCircle size={24} /></span>
            </div>
            <p className="profile-headline">{profile.title || "Mutaxassis"}</p>
            <div className="contact-info-item" style={{ color: 'var(--muted)', fontSize: '14px' }}>
              <FiMapPin /> <span>{profile.location || "O'zbekiston"}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="profile-grid-layout">
        {/* ⬅️ MAIN CONTENT (70%) */}
        <div className="main-sections">
          
          {/* ABOUT ME */}
          <div className="premium-card soft-fade-in stagger-2">
            <div className="section-content">
              <div className="section-header">
                <h2>{t("publicProfile.aboutMe", "O'zim haqimda")}</h2>
              </div>
              <p className="bio-text">{profile.bio}</p>
            </div>
          </div>

          {/* PORTFOLIO */}
          {portfolio.length > 0 && (
            <div className="premium-card soft-fade-in stagger-3">
              <div className="section-content">
                <div className="section-header">
                  <h2>{t("publicProfile.portfolio", "Portfolio")}</h2>
                </div>
                <div className="portfolio-grid">
                  {portfolio.map((item, i) => (
                    <div key={i} className="portfolio-card">
                      <div className="portfolio-thumb">
                        <img 
                          src={(item.media?.[0]?.url || item.portfolio_media?.[0]?.url) ? avatarSrc(item.media?.[0]?.url || item.portfolio_media?.[0]?.url) : "https://via.placeholder.com/400x250"} 
                          alt={item.title} 
                        />
                      </div>
                      <div className="portfolio-info">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CERTIFICATIONS */}
          {certifications.length > 0 && (
            <div className="premium-card soft-fade-in stagger-4">
              <div className="section-content">
                <div className="section-header">
                  <h2>{t("publicProfile.certifications", "Sertifikatlar")}</h2>
                </div>
                <div className="cert-list">
                  {certifications.map((cert, i) => (
                    <div key={i} className="cert-item">
                      <div className="cert-icon-box"><FiAward size={24} /></div>
                      <div className="cert-details">
                        <h4>{cert.title}</h4>
                        <p>{cert.issuer} • {cert.issue_year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ➡️ SIDEBAR (30%) */}
        <aside className="sidebar-section">
          
          {/* ACTION CARD */}
          <div className="premium-card action-card soft-fade-in stagger-2">
            <div className="hourly-rate-box">
              <span className="rate-value">${profile.hourly_rate}</span>
              <span className="rate-unit">/{t("common.hour", "soat")}</span>
            </div>
            
            <button className="hire-btn">
              <FiUserPlus /> {t("common.hireMe", "Ishga yollash")}
            </button>
            <button className="message-btn">
              <FiMessageSquare /> {t("common.message", "Xabar yozish")}
            </button>

            <div className="stats-grid">
              <div className="stat-mini-card">
                <span className="stat-mini-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <FiStar fill="#eab308" color="#eab308" size={16} style={{ marginBottom: '2px' }} /> 
                  {parseFloat(profile.average_rating || 0).toFixed(1)}
                </span>
                <span className="stat-mini-label">{profile.total_reviews || 0} sharh</span>
              </div>
              <div className="stat-mini-card">
                <span className="stat-mini-value">{profile.job_success_score || 100}%</span>
                <span className="stat-mini-label">Muvaffaqiyat</span>
              </div>
              <div className="stat-mini-card">
                <span className="stat-mini-value">{profile.jobs_completed || 0}</span>
                <span className="stat-mini-label">Ishlar</span>
              </div>
            </div>
          </div>

          {/* LANGUAGES */}
          {profile.languages?.length > 0 && (
            <div className="premium-card info-block soft-fade-in stagger-3">
              <h3 className="info-title"><FiGlobe /> Tillar</h3>
              <div className="lang-list">
                {profile.languages.map((lang, i) => (
                  <div key={i} className="lang-item">
                    <span className="lang-name">{lang.language}</span>
                    <span className="lang-level">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SKILLS */}
          {profile.skills?.length > 0 && (
            <div className="premium-card info-block soft-fade-in stagger-4">
              <h3 className="info-title"><FiCpu /> Ko'nikmalar</h3>
              <div className="skill-pills">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="skill-pill">{skill}</span>
                ))}
              </div>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}
