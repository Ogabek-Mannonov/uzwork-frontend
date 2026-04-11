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
  FiShield, FiCalendar, FiGlobe
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  
  // Ensure we don't have double slashes if the URL already starts with one
  // or add a slash if it's missing.
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND}${cleanUrl}`;
}

function AvatarImage({ src, size = 16, className = "", alt = "Avatar" }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary, #f1f5f9)', color: 'var(--text-muted, #64748b)', fontSize: size / 2 }}>{alt[0]?.toUpperCase() || "?"}</div>;
  }
  return (
    <img 
      src={avatarSrc(src)} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
}

import "./profile-css/public-profile.css";
import "../../assets/style/theme.css";

export default function PublicProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [profileRes, portfolioRes, certRes] = await Promise.all([
          getUserProfile(id),
          getPublicPortfolio(id),
          getPublicCertifications(id),
        ]);

        // Normalize profile data
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
            email: u.email,
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
            phone: u.phone || "",
            availability_status: p.availability_status || "Available now",
          });
        } else {
          setProfile(null);
        }

        // Portfolio
        const portData = portfolioRes?.data?.items || portfolioRes?.data || portfolioRes || [];
        setPortfolio(Array.isArray(portData) ? portData : []);

        // Certifications
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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/profile");
    }
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
            <AvatarImage src={profile.avatar_url} alt={profile.fullName} size={100} className="public-avatar-img" />
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
            </div>
            {profile.username && <p className="public-username" style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>@{profile.username}</p>}
            {profile.title && <p className="public-title">{profile.title}</p>}

            <div className="profile-badges-row" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <span className="profile-badge-item profile-badge-membership" style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' 
              }}>
                <FiAward size={14} /> Professional
              </span>
            </div>

            {/* Stats Dashboard */}
            <div className="stats-dashboard">
              <div className="stat-card">
                <FiDollarSign className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">${profile.hourly_rate || 0}/hr</span>
                  <span className="stat-label">{t("publicProfile.hourlyRate")}</span>
                </div>
              </div>

              <div className="stat-card">
                <FiStar className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{profile.job_success_score || 0}%</span>
                  <span className="stat-label">{t("publicProfile.successScore")}</span>
                </div>
              </div>

              <div className="stat-card">
                <FiBriefcase className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">${profile.total_earned || 0}</span>
                  <span className="stat-label">{t("publicProfile.totalEarned")}</span>
                </div>
              </div>

              <div className="stat-card">
                <FiBriefcase className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{profile.jobs_completed || 0}</span>
                  <span className="stat-label">{t("profile.jobsCompleted", "Jobs Completed")}</span>
                </div>
              </div>

              <div className="stat-card">
                <FiBriefcase className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{profile.active_projects || 0}</span>
                  <span className="stat-label">{t("profile.activeProjects", "Active Projects")}</span>
                </div>
              </div>

              {profile.location && (
                <div className="stat-card">
                  <FiMapPin className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{profile.location}</span>
                    <span className="stat-label">{t("publicProfile.location")}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="availability-row" style={{ marginTop: '16px', display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></div>
                 {profile.availability_status}
              </span>
            </div>

            {profile.cv_url && (
              <div className="action-row">
                <a
                  href={profile.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-btn primary"
                >
                  <FiFileText /> {t("publicProfile.viewResume")}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content-grid">
          <div className="profile-main-content">
            {/* About Me */}
            {profile.bio && (
              <div className="bio-section soft-fade-in stagger-3">
                <h3 className="section-title">{t("publicProfile.aboutMe")}</h3>
                <p className="public-bio">{profile.bio}</p>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="pub-cert-section soft-fade-in stagger-4">
                <h3 className="section-title">
                  <FiAward size={20} />
                  {t("publicProfile.certifications", "Certifications")}
                </h3>
                <div className="pub-cert-list">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="pub-cert-card">
                      {/* Header: icon + title/issuer */}
                      <div className="pub-cert-header">
                        <div className="pub-cert-icon">
                          <FiAward size={20} />
                        </div>
                        <div className="pub-cert-body">
                          <h4 className="pub-cert-title">{cert.title}</h4>
                          {cert.issuer && <p className="pub-cert-issuer">{cert.issuer}</p>}
                        </div>
                      </div>

                      {/* Divider */}
                      {(cert.issue_month || cert.issue_year || cert.credential_id || cert.credential_url) && (
                        <div className="pub-cert-divider" />
                      )}

                      {/* Meta tags */}
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
                              ID: {cert.credential_id}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Credential link */}
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pub-cert-link"
                        >
                          <FiExternalLink size={13} />
                          {t("publicProfile.showCredential", "Show Credential")}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="profile-sidebar">
            {/* Languages */}
            {profile.languages?.length > 0 && (
              <div className="public-skills-section soft-fade-in stagger-5" style={{ marginBottom: '24px' }}>
                <h3 className="section-title">
                  <FiGlobe style={{ marginRight: '8px' }} />
                  {t("publicProfile.languages", "Languages")}
                </h3>
                <div className="public-languages-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {profile.languages.map((lang, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: 'var(--text-color)' }}>{lang.language}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {lang.proficiency === 'Basic' ? t("profile.profBasic", "Basic") : 
                         lang.proficiency === 'Conversational' ? t("profile.profConversational", "Conversational") : 
                         lang.proficiency === 'Fluent' ? t("profile.profFluent", "Fluent") : 
                         lang.proficiency === 'Native/Bilingual' ? t("profile.profNativeBilingual", "Native/Bilingual") : lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="public-skills-section soft-fade-in stagger-5">
                <h3 className="section-title">{t("publicProfile.skills")}</h3>
                <div className="public-skills-grid">
                  {profile.skills.map((sk, i) => (
                    <span key={i} className="public-skill-chip">{sk}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Contact Info Sidebar */}
            <div className="public-skills-section soft-fade-in stagger-5" style={{ marginBottom: '24px' }}>
               <h3 className="section-title">{t("profile.contactDetails", "Contact Details")}</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text)' }}>
                 {profile.email && (
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-muted)' }}>{t("profile.email", "Email")}</span>
                     <span style={{ fontWeight: '500' }}>{profile.email}</span>
                   </div>
                 )}
                 {profile.phone && (
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-muted)' }}>{t("profile.phone", "Phone")}</span>
                     <span style={{ fontWeight: '500' }}>{profile.phone}</span>
                   </div>
                 )}
               </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className="public-portfolio-section soft-fade-in stagger-6">
          <div className="section-header-premium">
            <h2 className="section-title-premium">{t("publicProfile.portfolio")}</h2>
            <div className="title-underline"></div>
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
                      <FiExternalLink size={14} /> {t("profile.viewProject", "View Project")}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
