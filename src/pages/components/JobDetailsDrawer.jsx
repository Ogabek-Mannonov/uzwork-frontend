import React, { useEffect, useState } from "react";
import { X, ArrowLeft, ExternalLink, Heart, Flag, MapPin, Clock, DollarSign, Award, CheckCircle2, Star, Send, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { saveJob } from "../../api/jobs";
import "../../assets/style/JobDetailsDrawer.css";

export default function JobDetailsDrawer({ job, isOpen, onClose, savedIds = [], onSaveToggle }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Determine if this job is currently saved
  const isSaved = savedIds.includes(job?.id);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => {
        clearTimeout(timer);
      };
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        document.body.style.overflow = "unset";
      }, 400);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset"; // Har doim reset qilish
      };
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;
  if (!job) return null;

  // Parse skills
  let skills = [];
  try {
    if (typeof job?.required_skills === "string") skills = JSON.parse(job.required_skills);
    else if (Array.isArray(job?.required_skills)) skills = job.required_skills;
  } catch (e) {}

  // Budget display
  const budgetDisplay = () => {
    if (job.job_type === "hourly") {
      const min = job.budget_min ? `$${Number(job.budget_min).toLocaleString()}` : "";
      const max = job.budget_max ? `$${Number(job.budget_max).toLocaleString()}` : "";
      return min && max ? `${min} – ${max}/soat` : min || max || "Kelishiladi";
    }
    const max = job.budget_max ? `$${Number(job.budget_max).toLocaleString()}` : null;
    const min = job.budget_min ? `$${Number(job.budget_min).toLocaleString()}` : null;
    if (max && min && min !== max) return `${min} – ${max}`;
    return max || min || "Kelishiladi";
  };

  // Handle Apply
  const handleApply = () => {
    onClose();
    navigate(`/proposals/new/${job.id}`);
  };

  // Handle Save toggle
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await saveJob(job.id);
      if (onSaveToggle) onSaveToggle(job.id, res);
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  };

  // Client info from job object (comes from backend JOIN)
  const clientName = [job.client_first_name, job.client_last_name].filter(Boolean).join(" ") || job.client_username || "Mijoz";
  const clientUsername = job.client_username;
  const postedDate = job.created_at ? new Date(job.created_at).toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric" }) : t("findWork.drawer.recently");
  const deadlineDate = job.deadline ? new Date(job.deadline).toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric" }) : null;

  return (
    <div className={`jd-overlay ${isOpen ? "is-open" : ""}`} onClick={onClose}>
      <div className={`jd-drawer ${isOpen ? "is-open" : ""}`} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="jd-header">
          <button className="jd-back-btn" onClick={onClose}>
            <ArrowLeft size={24} />
          </button>
          <div className="jd-header-actions">
            <a href={`/job/${job.id}`} target="_blank" rel="noopener noreferrer" className="jd-external-link">
              <ExternalLink size={18} /> {t("findWork.drawer.openNewWindow")}
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="jd-content">

          {/* Main Info */}
          <div className="jd-main-info">
            <h1 className="jd-title">{job?.title}</h1>

            <div className="jd-meta-row">
              {job.category_name && (
                <span className="jd-category">{job.category_name}</span>
              )}
              <span className="jd-posted">
                {t("findWork.drawer.posted", { date: postedDate })}
              </span>
              <span className="jd-location">
                <MapPin size={14} /> {t("findWork.drawer.worldwide")}
              </span>
            </div>

            <hr className="jd-divider" />

            <div className="jd-description">
              <p>{job?.description}</p>
            </div>

            <hr className="jd-divider" />

            {/* Details Grid */}
            <div className="jd-details-grid">
              <div className="jd-detail-item">
                <Clock size={20} />
                <div>
                  <span>{t("findWork.drawer.projectType")}</span>
                  <strong>
                    {job.job_type === "fixed"
                      ? t("findWork.projectCard.fixed")
                      : t("findWork.projectCard.hourly")}
                  </strong>
                </div>
              </div>
              <div className="jd-detail-item">
                <Award size={20} />
                <div>
                  <span>{t("findWork.drawer.experienceLevel")}</span>
                  <strong>
                    {job.experience_level
                      ? job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)
                      : t("findWork.projectCard.intermediate")}
                  </strong>
                </div>
              </div>
              <div className="jd-detail-item">
                <DollarSign size={20} />
                <div>
                  <span>{t("findWork.drawer.budget")}</span>
                  <strong>{budgetDisplay()}</strong>
                </div>
              </div>
            </div>

            {deadlineDate && (
              <div className="jd-deadline-row">
                <span className="jd-deadline-label">Muddat:</span>
                <span className="jd-deadline-value">{deadlineDate}</span>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <>
                <hr className="jd-divider" />
                <div className="jd-skills-section">
                  <h3>{t("findWork.drawer.skillsExpertise")}</h3>
                  <div className="jd-tags">
                    {skills.map((skill, index) => (
                      <span key={index} className="jd-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <hr className="jd-divider" />

            {/* Activity */}
            <div className="jd-activity-section">
              <h3>{t("findWork.drawer.activityOnJob")}</h3>
              <div className="jd-proposals-stat">
                {t("findWork.drawer.stats.proposals")}: <strong>{job.proposals_count || 0}</strong>
              </div>
              <div className="jd-stat-line">
                {t("findWork.drawer.stats.interviewing")}: <span>0</span>
              </div>
              <div className="jd-stat-line">
                {t("findWork.drawer.stats.invitesSent")}: <span>0</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="jd-sidebar">
            {/* Apply Button */}
            <button className="jd-btn-apply" onClick={handleApply}>
              <Send size={16} style={{ marginBottom: "-2px", marginRight: "6px" }} />
              {t("findWork.drawer.applyNow")}
            </button>

            {/* Save Button */}
            <button
              className={`jd-btn-save ${isSaved ? "active" : ""}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={18} className="jd-spin" />
              ) : (
                <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
              )}
              {isSaved ? t("findWork.drawer.saved") : t("findWork.drawer.saveJob")}
            </button>

            <button className="jd-btn-flag">
              <Flag size={14} /> {t("findWork.drawer.flagInappropriate")}
            </button>

            {/* Client Info — real data from backend */}
            <div className="jd-client-info">
              <h3>{t("findWork.drawer.aboutClient")}</h3>

              <div className="jd-stat-line" style={{ marginTop: "12px", color: "var(--brand)" }}>
                <CheckCircle2 size={16} />
                <strong style={{ marginLeft: "6px" }}>{t("findWork.drawer.paymentVerified")}</strong>
              </div>

              <div className="jd-client-meta" style={{ marginTop: "16px" }}>
                <div className="jd-client-rating">
                <div className="jd-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.floor(job.client_rating || 0) ? "#f59e0b" : "none"} 
                      color={i < Math.floor(job.client_rating || 0) ? "#f59e0b" : "#d1d5db"} 
                    />
                  ))}
                  <span style={{ marginLeft: "4px" }}>
                    {job.client_rating ? Number(job.client_rating).toFixed(1) : "0.0"}
                  </span>
                </div>
              </div>
              
              <div className="jd-client-meta">
                <div className="jd-meta-item">
                  <strong>{job.client_location || "Lokatsiya belgilanmagan"}</strong>
                  <span>{job.client_member_since ? new Date(job.client_member_since).toLocaleDateString() : ""}</span>
                </div>
                <div className="jd-meta-item">
                  <strong>{job.client_total_posted || 0} {t("findWork.drawer.jobsPosted")}</strong>
                  <span>{job.client_hire_rate || 0}% {t("findWork.drawer.hireRate")}</span>
                </div>
                <div className="jd-meta-item">
                  <strong>${Number(job.client_spent_total || 0).toLocaleString()} {t("findWork.drawer.totalSpent")}</strong>
                </div>
              </div>   {job.client_member_since && (
                  <p className="jd-member-since">
                    {t("findWork.drawer.memberSince", {
                      date: new Date(job.client_member_since).toLocaleDateString("uz-UZ", {
                        year: "numeric", month: "short", day: "numeric"
                      })
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
