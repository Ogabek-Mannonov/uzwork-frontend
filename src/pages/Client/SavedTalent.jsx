// src/pages/Client/SavedTalent.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, MessageSquare, User, Search, 
  MapPin, Star, MoreHorizontal, ArrowLeft,
  Briefcase, Trash2, CheckCircle, X
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "../components/Theme/ThemeContext";
import { getSavedFreelancers, saveFreelancer } from "../../api/freelancer";
import { getSocket, onSocketReady, normalizeUserStatus } from "../../hooks/useSocket";
import "./css/saved.css";

const SavedTalent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useThemeContext();
  
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSavedFreelancers();
      if (res?.success) {
        const list = (res.data?.freelancers || []).map(f => ({ ...f, isOnline: false }));
        setFreelancers(list);
      }
    } catch (err) {
      console.error("Failed to fetch saved freelancers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  useEffect(() => {
    if (freelancers.length === 0) return;

    const cleanup = onSocketReady((socket) => {
      freelancers.forEach((fl) => {
        if (fl.id) socket.emit("checkStatus", fl.id);
      });

      const handleStatus = (data) => {
        const status = normalizeUserStatus(data);
        setFreelancers(prev => prev.map(f => {
          if (String(f.id) === String(status.userId)) {
            return { ...f, isOnline: status.isOnline };
          }
          return f;
        }));
      };

      socket.on("userStatus", handleStatus);
      return () => socket.off("userStatus", handleStatus);
    });

    return cleanup;
  }, [freelancers.length]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUnsave = async (id, name) => {
    try {
      const res = await saveFreelancer(id); // POST /save toggles it
      if (res?.success) {
        setFreelancers(prev => prev.filter(f => f.id !== id));
        showToast(t("savedTalent.unsavedToast", { name }));
      }
    } catch (err) {
      showToast(t("savedTalent.errorToast"), "error");
    }
  };

  const filteredFreelancers = freelancers.filter(f => {
    const fullName = `${f.first_name} ${f.last_name}`.toLowerCase();
    const title = (f.title || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || title.includes(query);
  });

  return (
    <div className={`st-page ${isDark ? "st-dark" : ""}`}>
      <div className="st-container">
        {/* Header */}
        <header className="st-header">
          <div className="st-header-left">
            <button className="st-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="st-title">{t("savedTalent.title")}</h1>
              <p className="st-subtitle">{t("savedTalent.subtitle", { count: freelancers.length })}</p>
            </div>
          </div>
          
          <div className="st-search-box">
            <Search size={18} className="st-search-icon" />
            <input 
              type="text" 
              placeholder={t("savedTalent.searchPlaceholder")} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div className="st-loading">
            <div className="st-spinner"></div>
            <p>{t("savedTalent.loading")}</p>
          </div>
        ) : filteredFreelancers.length > 0 ? (
          <div className="st-grid">
            {filteredFreelancers.map((fl) => (
              <div key={fl.id} className="st-card">
                <div className="st-card-inner">
                  <div className="st-card-top">
                    <div className="st-avatar-wrap">
                      {fl.avatar_url ? (
                        <img src={fl.avatar_url} alt={fl.first_name} className="st-avatar" />
                      ) : (
                        <div className="st-avatar-placeholder">
                          <User size={30} />
                        </div>
                      )}
                      <span className={`st-status-dot ${fl.isOnline || fl.availability_status === 'available' ? 'online' : 'offline'}`}></span>
                    </div>
                    <button 
                      className="st-unsave-btn" 
                      onClick={() => handleUnsave(fl.id, fl.first_name)}
                      title={t("findTalent.card.save")}
                    >
                      <Heart size={18} fill="currentColor" />
                    </button>
                  </div>

                  <div className="st-info">
                    <h3 className="st-name">{fl.first_name} {fl.last_name}</h3>
                    <p className="st-job-title">{fl.title || "Freelancer"}</p>
                    
                    <div className="st-meta">
                      <div className="st-meta-item">
                        <MapPin size={14} />
                        <span>{fl.location || t("findTalent.nations.uz")}</span>
                      </div>
                      <div className="st-meta-item">
                        <Star size={14} className="st-star" fill="currentColor" />
                        <span>{fl.rating || 0}% {t("findTalent.card.success")}</span>
                      </div>
                    </div>

                    <div className="st-stats">
                      <div className="st-stat">
                        <span className="st-stat-val">${fl.hourly_rate || 0}</span>
                        <span className="st-stat-lbl">/{t("findTalent.card.negotiable").includes("hr") ? "hr" : "soat"}</span>
                      </div>
                      <div className="st-stat">
                        <span className="st-stat-val">{fl.completed_jobs || 0}</span>
                        <span className="st-stat-lbl">{t("findTalent.card.jobsDone")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="st-actions">
                    <button className="st-btn st-btn-primary" onClick={() => navigate(`/profile/${fl.id}`)}>
                      {t("savedTalent.viewProfile")}
                    </button>
                    <button className="st-btn st-btn-secondary" onClick={() => navigate(`/messages?userId=${fl.id}`)}>
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="st-empty">
            <div className="st-empty-icon">
              <Star size={48} />
            </div>
            <h2>{searchQuery ? t("savedTalent.emptySearch") : t("savedTalent.empty")}</h2>
            <p>{searchQuery ? t("savedTalent.emptySearchSub") : t("savedTalent.emptySub")}</p>
            {!searchQuery && (
              <button className="st-btn-browse" onClick={() => navigate("/client/talent")}>
                {t("savedTalent.browseTalent")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`st-toast ${toast.type}`}>
          <CheckCircle size={18} />
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}
    </div>
  );
};

export default SavedTalent;
