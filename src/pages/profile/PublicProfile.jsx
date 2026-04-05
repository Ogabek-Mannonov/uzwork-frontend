import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFreelancerById, getPublicPortfolio } from "../../api/freelancer";
import { getUserProfile } from "../../api/common";
import { FiArrowLeft, FiMapPin, FiDollarSign, FiStar, FiBriefcase, FiAward, FiGlobe, FiFileText } from "react-icons/fi";

import "./profile-css/public-profile.css";
import "../../assets/style/theme.css";

export default function PublicProfile() {
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
            cv_url: p.cv_url || "", // NEW: Added CVS link
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

  if (loading) return (
    <div className="public-profile-container">
      <div className="public-profile-card soft-fade-in" style={{ textAlign: "center", padding: "100px 0" }}>
        <p>Yuklanmoqda...</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="public-profile-container">
      <div className="public-profile-card soft-fade-in" style={{ textAlign: "center", padding: "100px 0", color: "var(--danger)" }}>
        <p>Profil topilmadi yoki ma'lumotlar yuklanmadi.</p>
        <p style={{ fontSize: "12px", opacity: 0.7 }}>{profileRes?.message || "Noma'lum xatolik"}</p>
        <button className="back-link" style={{ marginTop: 20 }} onClick={() => navigate(-1)}><FiArrowLeft /> Orqaga</button>
      </div>
    </div>
  );


  return (
    <div className="public-profile-container">
      <button className="back-link soft-fade-in stagger-1" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Orqaga
      </button>

      {/* Profile header */}
      <div className="public-profile-card soft-fade-in stagger-2">
        <div className="profile-main-info">
          <div className="public-avatar-wrapper">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.fullName} className="public-avatar-img" />
              : (profile.fullName || "?")[0]?.toUpperCase()
            }
          </div>
          <div className="profile-header-details">
            <h1 className="public-fullname">{profile.fullName}</h1>
            {profile.title && <p className="public-title">{profile.title}</p>}
            
            <div className="public-meta-grid">
              {profile.location && (
                <span className="public-meta-item">
                  <FiMapPin size={14} /> {profile.location}
                </span>
              )}
              {profile.hourly_rate > 0 && (
                <span className="public-meta-item">
                  <FiDollarSign size={14} /> ${profile.hourly_rate}/soat
                </span>
              )}
              {profile.job_success_score > 0 && (
                <span className="public-meta-item">
                  <FiStar size={14} /> {profile.job_success_score}% muvaffaqiyat
                </span>
              )}
              {profile.total_earned > 0 && (
                <span className="public-meta-item">
                  <FiBriefcase size={14} /> ${profile.total_earned} daromad
                </span>
              )}
              {profile.cv_url && (
                <a 
                  href={profile.cv_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="public-meta-item cv-link"
                  style={{ color: 'var(--blue)', fontWeight: '600', textDecoration: 'none' }}
                >
                  <FiFileText size={14} /> Rezume ko'rish
                </a>
              )}
            </div>

          </div>
        </div>

        {profile.bio && (
          <div className="bio-section soft-fade-in stagger-3">
            <hr className="public-divider" />
            <p className="public-bio">{profile.bio}</p>
          </div>
        )}

        {profile.skills?.length > 0 && (
          <div className="public-skills-section soft-fade-in stagger-4">
            <hr className="public-divider" />
            <h3>Ko'nikmalar</h3>
            <div className="public-skills-grid">
              {profile.skills.map((sk, i) => (
                <span key={i} className="public-skill-chip">{sk}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className="public-portfolio-section soft-fade-in stagger-5">
          <h2>Portfolio</h2>
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
