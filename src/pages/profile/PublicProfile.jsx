import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  FiClock, FiCheckCircle, FiTerminal, FiCpu, FiUser
} from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./profile-css/public-profile.css";
import "../../assets/style/theme.css";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

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

function AvatarImage({ src, size = 40, className = "", alt = "Avatar" }) {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    const initials = getInitials(alt);
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
        {initials || <FiUser size={size * 0.5} />}
      </div>
    );
  }

  return (
    <img 
      src={avatarSrc(src)} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
      style={{ objectFit: 'cover', borderRadius: '50%', width: `${size}px`, height: `${size}px` }}
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
  
  const [isBioExpanded, setIsBioExpanded] = useState(false);
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
            fullName: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "User",
            first_name: u.first_name,
            last_name: u.last_name,
            username: u.username,
            email: u.email || p.email || rawData.email || "",
            avatar_url: p.avatar_url || u.avatar_url || "",
            title: p.title || "",
            bio: p.bio || "",
            location: p.location || "",
            hourly_rate: p.hourly_rate || 0,
            job_success_score: p.job_success_score || 0,
            total_earned: p.total_earned || 0,
            jobs_completed: p.completed_jobs || 0,
            active_projects: p.active_projects || 0,
            skills: Array.isArray(p.skills) ? p.skills : (p.skills ? [p.skills] : []),
            languages: p.languages || [],
            cv_url: p.cv_url || "",
            cover_url: p.cover_url || "",
            phone: u.phone || p.phone || rawData.phone || "",
            availability_status: p.availability_status || t("profile.status.available", "Hozir band emas"),
          });
        } else {
          setProfile(null);
        }

        const portData = portfolioRes?.data?.items || portfolioRes?.data || portfolioRes || [];
        setPortfolio(Array.isArray(portData) ? portData : []);

        const certData =
          certRes?.data?.certifications ||
          certRes?.data?.items ||
          certRes?.data ||
          certRes?.certifications ||
          [];
        setCertifications(Array.isArray(certData) ? certData : []);

      } catch (error) {
        console.error("Error fetching public profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);
  
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = t("publicProfile.shareText", "UzWork'da {{name}}ning professional profilini ko'ring!", { name: profile?.fullName });
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }
    setShowShareMenu(false);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/profile");
    }
  };

  const MONTHS = [
    t("common.months.jan", "Jan"), t("common.months.feb", "Feb"), t("common.months.mar", "Mar"), 
    t("common.months.apr", "Apr"), t("common.months.may", "May"), t("common.months.jun", "Jun"), 
    t("common.months.jul", "Jul"), t("common.months.aug", "Aug"), t("common.months.sep", "Sep"), 
    t("common.months.oct", "Oct"), t("common.months.nov", "Nov"), t("common.months.dec", "Dec")
  ];

  const renderProficiencyDots = (lvl) => {
    const dotsCount = lvl === 'Basic' ? 1 : lvl === 'Conversational' ? 2 : lvl === 'Fluent' ? 3 : 4;
    return (
      <div className="proficiency-container">
        {[1,2,3,4].map(i => (
          <div key={i} className={`prof-dot ${i <= dotsCount ? 'active' : ''}`} />
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="public-profile-container">
      <div className="public-profile-card soft-fade-in" style={{ textAlign: "center", padding: "100px 0" }}>
        <p>{t("publicProfile.loading")}</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="public-profile-container">
      <div className="public-profile-card soft-fade-in" style={{ textAlign: "center", padding: "100px 0", color: "var(--danger)" }}>
        <p>{t("publicProfile.notFound")}</p>
        <button className="back-link" style={{ marginTop: 20 }} onClick={handleBack}>
          <FiArrowLeft /> {t("publicProfile.back")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="public-profile-container">
      <button className="back-link soft-fade-in stagger-1" onClick={handleBack}>
        <FiArrowLeft /> {t("publicProfile.back")}
      </button>

      {/* Profile header card */}
      <div className="public-profile-card soft-fade-in stagger-2">
        <div className="public-profile-cover">
          {profile.cover_url ? (
            <img src={avatarSrc(profile.cover_url)} alt="Cover" className="public-cover-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="public-cover-placeholder" />
          )}
          <div className="cover-overlay"></div>
        </div>

        <div className="profile-main-info">
          <div className="public-avatar-wrapper">
            <AvatarImage src={profile.avatar_url} alt={profile.fullName} size={170} className="public-avatar-img" />
            <div className="online-indicator"></div>
          </div>

          <div className="profile-header-details">
            <div className="name-wrapper">
              <h1 className="public-fullname">{profile.fullName}</h1>
              <span className="verify-badge" title={t("publicProfile.verified")}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
              
              <div className="share-container">
                <button 
                  className={`public-share-btn ${showShareMenu ? 'active' : ''}`} 
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  title={t("publicProfile.shareProfile", "Profilni ulashish")}
                >
                  <FiShare2 />
                </button>
                
                {showShareMenu && (
                  <div className="share-dropdown glass-card soft-fade-in">
                    <button className="share-item" onClick={() => handleShare('copy')}>
                      <FiLink /> {copySuccess ? t("common.copied", "Nusxa olindi!") : t("common.copyLink", "Havolani nusxalash")}
                    </button>
                    <button className="share-item" onClick={() => handleShare('telegram')}>
                      <FiSend /> Telegram
                    </button>
                    <button className="share-item" onClick={() => handleShare('linkedin')}>
                      <FiLinkedin /> LinkedIn
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {profile.username && <p className="public-username">@{profile.username}</p>}
            {profile.title && <p className="public-title">{profile.title}</p>}

            <div className="header-meta-grid">
              <div className="stats-dashboard">
                <div className="stat-card">
                  <div className="stat-icon"><FiDollarSign /></div>
                  <div className="stat-info">
                    <span className="stat-value">
                      ${profile.hourly_rate || 0}
                      <span className="stat-unit">/{t("common.hour", "soat")}</span>
                    </span>
                    <span className="stat-label">{t("publicProfile.hourlyRate")}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon"><FiStar /></div>
                  <div className="stat-info">
                    <span className="stat-value">{profile.job_success_score || 0}%</span>
                    <span className="stat-label">{t("publicProfile.successScore")}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon"><FiBriefcase /></div>
                  <div className="stat-info">
                    <span className="stat-value">${profile.total_earned || 0}</span>
                    <span className="stat-label">{t("publicProfile.totalEarned")}</span>
                  </div>
                </div>
              </div>

              <div className="contact-quick-card glass-card">
                <div className="availability-badges">
                  <span className="availability-status-tag">
                    <div className="pulse-dot"></div>
                    {profile.availability_status && t(`profile.status.${profile.availability_status.toLowerCase().replace(/\s+/g, "_")}`, profile.availability_status)}
                  </span>
                  <span className="profile-membership-badge">
                    <FiAward /> {t("profile.membershipProfessional", "Professional")}
                  </span>
                </div>
                
                <div className="contact-info-list">
                  {profile.email && (
                    <div className="contact-info-item">
                      <FiMail /> <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="contact-info-item">
                      <FiPhone /> <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="contact-info-item">
                      <FiMapPin /> <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                {profile.cv_url && (
                  <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" className="view-cv-btn">
                    <FiFileText /> {t("publicProfile.viewResume")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-main-content-full scroll-snap">
            {profile.bio && (
              <div className="bio-section soft-fade-in stagger-3">
                <h3 className="section-title">{t("publicProfile.aboutMe")}</h3>
                <div className="bio-quote-container">
                  <FaQuoteLeft className="bio-quote-icon" />
                  <div className={`public-bio ${isBioExpanded ? 'expanded' : ''}`}>
                    {profile.bio.length > 500 && !isBioExpanded 
                      ? `${profile.bio.substring(0, 500)}...` 
                      : profile.bio
                    }
                  </div>
                  {profile.bio.length > 500 && (
                    <button className="bio-toggle-btn" onClick={() => setIsBioExpanded(!isBioExpanded)}>
                      {isBioExpanded ? t("common.showLess", "Kamroq ko'rsatish") : t("common.readMore", "Batafsil")}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="profile-info-combined-row soft-fade-in stagger-4">
              <div className="combined-left">
                  <div className="pub-cert-section">
                    <h3 className="section-title">
                      <FiAward />
                      {t("publicProfile.certifications", "Certifications")}
                    </h3>
                    <div className="pub-cert-list">
                      {certifications.length > 0 ? certifications.map((cert) => (
                        <div key={cert.id} className="pub-cert-card">
                          <div className="pub-cert-icon">
                              <FiAward />
                          </div>
                          <div className="pub-cert-body">
                            <h4 className="pub-cert-title">{cert.title}</h4>
                            {cert.issuer && <p className="pub-cert-issuer">{cert.issuer}</p>}
                          </div>
                          {(cert.issue_month || cert.issue_year || cert.credential_id) && (
                            <div className="pub-cert-meta">
                              {(cert.issue_month || cert.issue_year) && (
                                <span className="pub-cert-tag">
                                  <FiCalendar size={11} />
                                  {cert.issue_month
                                    ? `${MONTHS[cert.issue_month - 1]} ${cert.issue_year || ""}`
                                    : cert.issue_year}
                                </span>
                              )}
                              {cert.credential_id && (
                                <span className="pub-cert-tag">
                                  <FiShield size={11} />
                                  {t("profile.credentialId", "ID")}: {cert.credential_id}
                                </span>
                              )}
                            </div>
                          )}
                          {cert.credential_url && (
                            <a 
                              href={cert.credential_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="pub-cert-link"
                            >
                              <FiExternalLink />
                            </a>
                          )}
                        </div>
                      )) : (
                        <div className="pub-cert-empty">{t("profile.noCertifications", "Sertifikatlar hali qo'shilmagan.")}</div>
                      )}
                    </div>
                  </div>
              </div>

              <div className="section-vertical-divider"></div>

              <div className="combined-right">
                {profile.languages?.length > 0 && (
                  <div className="combined-sub-section">
                    <h3 className="section-title">
                      <FiGlobe />
                      {t("profile.languages", "Tillar")}
                    </h3>
                    <div className="public-languages-list">
                      {profile.languages.map((lang, idx) => (
                        <div key={idx} className="language-item-premium">
                          <div className="lang-info-dash">
                            <span className="lang-name">{lang.language}</span>
                            <span className="lang-proficiency">
                              {lang.proficiency === 'Basic' ? t("profile.profBasic", "Boshlang'ich") : 
                               lang.proficiency === 'Conversational' ? t("profile.profConversational", "Suhbat darajasi") : 
                               lang.proficiency === 'Fluent' ? t("profile.profFluent", "Erkin") : 
                               lang.proficiency === 'Native/Bilingual' ? t("profile.profNativeBilingual", "Ona tili") : lang.proficiency}
                            </span>
                          </div>
                          {renderProficiencyDots(lang.proficiency)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profile.skills?.length > 0 && (
                  <div className="combined-sub-section">
                    <h3 className="section-title">
                      <FiCpu />
                      {t("profile.mySkills", "Ko'nikmalar")}
                    </h3>
                    <div className="public-skills-grid">
                      {profile.skills.map((sk, i) => (
                        <span key={i} className="public-skill-chip">{t(`skills.${sk}`, sk)}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {portfolio.length > 0 && (
              <>
                <div className="section-horizontal-divider"></div>
                
                <div className="public-portfolio-section-integrated">
                  <div className="section-header-integrated">
                    <h3 className="section-title">
                      <FiBriefcase />
                      {t("publicProfile.portfolio")}
                    </h3>
                  </div>
                  
                  <div className="public-portfolio-premium-grid">
                    {portfolio.map((item, i) => (
                      <div key={i} className="portfolio-premium-card-public">
                        <div className="portfolio-card-media-public">
                          <img 
                            src={
                              (item.media && item.media.length > 0) ? avatarSrc(item.media[0].url) : 
                              (item.portfolio_media && item.portfolio_media.length > 0) ? avatarSrc(item.portfolio_media[0].url) :
                              "https://via.placeholder.com/600x400?text=No+Media"
                            } 
                            alt={item.title} 
                          />
                          <div className="portfolio-media-count">
                            {item.media?.length || 0} <FiBriefcase size={10} />
                          </div>
                        </div>
                        <div className="portfolio-card-content-public">
                          <h4 className="portfolio-title-public">{item.title}</h4>
                          <p className="portfolio-desc-public" title={item.description}>
                            {item.description}
                          </p>
                          
                          {item.skills && item.skills.length > 0 && (
                            <div className="portfolio-skills-public">
                              {item.skills.slice(0, 4).map((skill, sIdx) => (
                                <span key={sIdx} className="skill-chip-mini">{skill}</span>
                              ))}
                              {item.skills.length > 4 && (
                                <span className="skill-more-mini">+{item.skills.length - 4}</span>
                              )}
                            </div>
                          )}

                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="portfolio-link-public">
                              <FiExternalLink size={14} /> {t("profile.viewProject", "Loyihani ko'rish")}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
