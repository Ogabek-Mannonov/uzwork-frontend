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
  FiMessageSquare, FiUserPlus, FiX, FiChevronLeft, FiChevronRight
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
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  useEffect(() => {
    if (selectedPortfolio) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [selectedPortfolio]);

  useEffect(() => {
    let interval;
    const mediaList = selectedPortfolio?.media || selectedPortfolio?.portfolio_media || [];
    
    if (selectedPortfolio && mediaList.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % mediaList.length);
      }, 2000);
    } else {
      setCurrentImageIndex(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedPortfolio]);

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    const mediaList = selectedPortfolio?.media || selectedPortfolio?.portfolio_media || [];
    if (mediaList.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    }
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    const mediaList = selectedPortfolio?.media || selectedPortfolio?.portfolio_media || [];
    if (mediaList.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % mediaList.length);
    }
  };

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
                    <div key={i} className="portfolio-card" onClick={() => setSelectedPortfolio(item)}>
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

      {/* 🖼️ PORTFOLIO DETAIL MODAL (Upwork Style) */}
      {selectedPortfolio && (
        <div className="portfolio-modal-overlay" onClick={() => setSelectedPortfolio(null)}>
          <div className="portfolio-modal-content upwork-style" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="modal-header-bar">
              <h1 className="modal-top-title">{selectedPortfolio.title}</h1>
              <div className="modal-header-actions">
                <button className="copy-link-btn" style={{background: 'none', border: 'none', color: 'var(--brand)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'}}>
                  <FiLink /> Nusxalash
                </button>
                <button className="modal-close-btn-upwork" onClick={() => setSelectedPortfolio(null)} style={{background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <FiX size={24} />
                </button>
              </div>
            </div>
            
            <div className="modal-body-wrapper">
              {/* Left Column - Text */}
              <div className="modal-left-col">
                <div className="modal-section">
                  <h3 style={{fontSize: '14px', color: 'var(--muted)', marginBottom: '8px', fontWeight: '600'}}>Project description</h3>
                  <p className="modal-description" style={{fontSize: '15px', lineHeight: '1.6', color: 'var(--text)'}}>
                    {selectedPortfolio.description || "Tavsif qo'shilmagan."}
                  </p>
                </div>
                
                {selectedPortfolio.skills && selectedPortfolio.skills.length > 0 && (
                  <div className="modal-section" style={{marginTop: '24px'}}>
                    <h3 style={{fontSize: '14px', color: 'var(--muted)', marginBottom: '12px', fontWeight: '600'}}>Skills and deliverables</h3>
                    <div className="skill-pills">
                      {selectedPortfolio.skills.map((skill, i) => (
                        <span key={i} className="skill-pill" style={{background: 'var(--surface-2)', color: 'var(--text)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px'}}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="modal-meta-info" style={{marginTop: '24px', fontSize: '13px', color: 'var(--muted)'}}>
                  <p>Published on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                
                <div style={{marginTop: 'auto', paddingTop: '20px'}}>
                  <button style={{background: 'none', border: 'none', color: 'var(--muted)', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline'}}>Report an issue</button>
                </div>
              </div>
              
              {/* Right Column - Image */}
              <div className="modal-right-col">
                <div className="modal-image-box" style={{background: '#f3f4f6', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', position: 'relative'}}>
                  
                  {(selectedPortfolio.media?.length > 1 || selectedPortfolio.portfolio_media?.length > 1) && (
                    <>
                      <button onClick={handlePrevImage} style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5, boxShadow: '0 2px 10px rgba(0,0,0,0.15)', transition: 'all 0.2s'}}>
                        <FiChevronLeft size={24} color="#1a1a1a" />
                      </button>
                      <button onClick={handleNextImage} style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5, boxShadow: '0 2px 10px rgba(0,0,0,0.15)', transition: 'all 0.2s'}}>
                        <FiChevronRight size={24} color="#1a1a1a" />
                      </button>
                    </>
                  )}

                  <img 
                    src={(selectedPortfolio.media?.[currentImageIndex]?.url || selectedPortfolio.portfolio_media?.[currentImageIndex]?.url) ? avatarSrc(selectedPortfolio.media?.[currentImageIndex]?.url || selectedPortfolio.portfolio_media?.[currentImageIndex]?.url) : "https://via.placeholder.com/1000x600"} 
                    alt={selectedPortfolio.title} 
                    style={{maxWidth: '100%', maxHeight: '500px', objectFit: 'contain'}}
                  />
                </div>
                {(selectedPortfolio.media?.length > 1 || selectedPortfolio.portfolio_media?.length > 1) && (
                  <div style={{display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px'}}>
                    {(selectedPortfolio.media || selectedPortfolio.portfolio_media || []).map((_, i) => (
                      <div key={i} style={{width: '8px', height: '8px', borderRadius: '50%', background: i === currentImageIndex ? 'var(--brand)' : '#e0e0e0'}}></div>
                    ))}
                  </div>
                )}
                <p className="image-caption" style={{textAlign: 'center', marginTop: '12px', color: 'var(--muted)', fontSize: '14px'}}>{selectedPortfolio.title}</p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="modal-footer-bar" style={{borderTop: '1px solid var(--border)', padding: '20px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)'}}>
              <div className="footer-user-info" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <img src={avatarSrc(profile.avatar_url) || "https://ui-avatars.com/api/?name=U"} alt={profile.fullName} className="footer-avatar" style={{width: '48px', height: '48px', borderRadius: '50%'}} />
                <div className="footer-user-text">
                  <div className="footer-user-name" style={{fontWeight: '700', color: 'var(--text)'}}>{profile.fullName}</div>
                  <div className="footer-user-title" style={{fontSize: '13px', color: 'var(--muted)'}}>{profile.title}</div>
                </div>
              </div>
              <div className="footer-actions" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <button className="hire-btn-upwork" style={{background: 'var(--brand)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '24px', fontWeight: '600', cursor: 'pointer'}}>Hire</button>
                <button className="save-btn-upwork" style={{width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--border)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)'}}><FiStar /></button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
