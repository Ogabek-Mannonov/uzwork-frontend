import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFreelancerById, getPublicPortfolio } from "../../api/freelancer";
import { getUserProfile } from "../../api/common";
import { FiArrowLeft, FiMapPin, FiDollarSign, FiStar, FiBriefcase, FiAward, FiGlobe, FiFileText } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import "./profile-css/public-profile.css";
import "../../assets/style/theme.css";

export default function PublicProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [profileRes, portfolioRes] = await Promise.all([
          getUserProfile(id),
          getPublicPortfolio(id),
        ]);

        console.log("Profile Data:", profileRes); // Useful for debugging

        // Normalize profile data
        // API response might be: { success: true, data: { user, profile } } 
        // OR it might be just { user, profile }
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
            skills: Array.isArray(p.skills) ? p.skills : (p.skills ? [p.skills] : []),
            cv_url: p.cv_url || "",
            cover_url: p.cover_url || "", // Added cover_url
          });

        } else {
          // Fallback if structure is unknown or empty
          setProfile(null);
        }

        // Normalize portfolio data
        const portData = portfolioRes?.data?.items || portfolioRes?.data || portfolioRes || [];
        setPortfolio(Array.isArray(portData) ? portData : []);
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

      {/* Profile header */}
      <div className="public-profile-card soft-fade-in stagger-2">
        <div className="public-profile-cover">
          {profile.cover_url ? (
            <img src={profile.cover_url} alt="Cover" className="public-cover-img" />
          ) : (
            <div className="public-cover-placeholder" />
          )}
          <div className="cover-overlay"></div>
        </div>

        <div className="profile-main-info">
          <div className="public-avatar-wrapper">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.fullName} className="public-avatar-img" />
              : (profile.fullName || "?")[0]?.toUpperCase()
            }
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
            
            {profile.title && <p className="public-title">{profile.title}</p>}
            
            {/* Stats Dashboard */}
            <div className="stats-dashboard">
              <div className="stat-card">
                <FiDollarSign className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">${profile.hourly_rate || 0}</span>
                  <span className="stat-label">{t("publicProfile.hourlyRate")}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <FiStar className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{profile.job_success_score || 0}%</span>
                  <span className="stat-label">{t("publicProfile.muvaffaqiyat")}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <FiBriefcase className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">${profile.total_earned || 0}</span>
                  <span className="stat-label">{t("publicProfile.daromad")}</span>
                </div>
              </div>

              {profile.location && (
                <div className="stat-card">
                  <FiMapPin className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{profile.location}</span>
                    <span className="stat-label">{t("publicProfile.manzil")}</span>
                  </div>
                </div>
              )}
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
            {profile.bio && (
              <div className="bio-section soft-fade-in stagger-3">
                <h3 className="section-title">{t("publicProfile.aboutMe")}</h3>
                <p className="public-bio">{profile.bio}</p>
              </div>
            )}
          </div>

          <aside className="profile-sidebar">
            {profile.skills?.length > 0 && (
              <div className="public-skills-section soft-fade-in stagger-4">
                <h3 className="section-title">{t("publicProfile.skills")}</h3>
                <div className="public-skills-grid">
                  {profile.skills.map((sk, i) => (
                    <span key={i} className="public-skill-chip">{sk}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className="public-portfolio-section soft-fade-in stagger-5">
          <h2>{t("publicProfile.portfolio")}</h2>
          <div className="public-portfolio-grid">
            {portfolio.map((item, i) => (
              <div key={i} className="portfolio-item-card">
                {(item.cover_image_url || (item.media && item.media[0]?.url)) && (
                  <div className="portfolio-img-wrapper">
                    <img src={item.cover_image_url || item.media[0]?.url} alt={item.title} />
                  </div>
                )}
                <div className="portfolio-content">
                  <h4 className="portfolio-title">{item.title}</h4>
                  {item.description && <p className="portfolio-desc">{item.description?.slice(0, 120)}...</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
