import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFreelancerById, getPublicPortfolio } from "../../api/freelancer";
import { getUserProfile } from "../../api/common";

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [profileRes, portfolioRes] = await Promise.all([
        getUserProfile(id),
        getPublicPortfolio(id),
      ]);
      const pData = profileRes?.data || profileRes || {};
      const mergedProfile = { ...(pData.user || {}), ...(pData.profile || {}) };
      setProfile(mergedProfile);

      const portData = portfolioRes?.data?.items || portfolioRes?.data || portfolioRes || [];
      setPortfolio(Array.isArray(portData) ? portData : []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center", padding: 60 }}>Yuklanmoqda...</p>;
  if (!profile) return <p style={{ textAlign: "center", padding: 60, color: "red" }}>Profil topilmadi</p>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 16px" }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#14a800", cursor: "pointer", fontWeight: 600, marginBottom: 20 }}>
        ← Orqaga
      </button>

      {/* Profile header */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e0e0e0", padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
            background: "#14a800", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 32, fontWeight: 900,
            overflow: "hidden"
          }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : (profile.name || "?")[0]?.toUpperCase()
            }
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              {profile.name || profile.first_name + " " + profile.last_name}
            </h1>
            {profile.title && <p style={{ fontSize: 15, color: "#555", marginBottom: 8 }}>{profile.title}</p>}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 13, color: "#888" }}>
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.hourly_rate && <span>💰 ${profile.hourly_rate}/soat</span>}
              {profile.job_success_score && <span>⭐ {profile.job_success_score}% muvaffaqiyat</span>}
              {profile.total_earned && <span>💵 ${profile.total_earned} daromad</span>}
            </div>
          </div>
        </div>

        {profile.bio && (
          <>
            <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #f0f0f0" }} />
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75 }}>{profile.bio}</p>
          </>
        )}

        {profile.skills?.length > 0 && (
          <>
            <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #f0f0f0" }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Ko'nikmalar</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {profile.skills.map((sk, i) => (
                <span key={i} style={{ fontSize: 13, padding: "4px 12px", background: "#f0f0f0", borderRadius: 20, fontWeight: 600 }}>{sk}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e0e0e0", padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Portfolio</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {portfolio.map((item, i) => (
              <div key={i} style={{ border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden" }}>
                {item.cover_image_url && (
                  <img src={item.cover_image_url} alt={item.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
                  {item.description && <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{item.description?.slice(0, 80)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
