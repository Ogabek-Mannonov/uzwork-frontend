import React, { useEffect, useState } from "react";
import { X, ArrowLeft, ExternalLink, Heart, Flag, MapPin, Clock, DollarSign, Award, CheckCircle2, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import "../../assets/style/JobDetailsDrawer.css";

export default function JobDetailsDrawer({ job, isOpen, onClose, onToggleLike, isLiked }) {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        document.body.style.overflow = "unset";
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;
  if (!job) return null;

  let skills = [];
  try {
    if (typeof job?.required_skills === 'string') skills = JSON.parse(job.required_skills);
    else if (Array.isArray(job?.required_skills)) skills = job.required_skills;
  } catch (e) {}

  return (
    <div className={`jd-overlay ${isOpen ? "is-open" : ""}`} onClick={onClose}>
      <div className={`jd-drawer ${isOpen ? "is-open" : ""}`} onClick={(e) => e.stopPropagation()}>
        
        <div className="jd-header">
          <button className="jd-back-btn" onClick={onClose}>
            <ArrowLeft size={24} />
          </button>
          <div className="jd-header-actions">
            <a href={`/job/${job.id}`} className="jd-external-link">
              <ExternalLink size={18} /> {t("findWork.drawer.openNewWindow")}
            </a>
          </div>
        </div>

        <div className="jd-content">
          <div className="jd-main-info">
            <h1 className="jd-title">{job?.title}</h1>
            
            <div className="jd-meta-row">
              <span className="jd-category">{t("info.categories.design")}</span> 
              <span className="jd-posted">{t("findWork.drawer.posted", { date: job?.created_at ? new Date(job.created_at).toLocaleDateString() : t("findWork.drawer.recently") })}</span>
              <span className="jd-location"><MapPin size={14} /> {t("findWork.drawer.worldwide")}</span>
            </div>

            <hr className="jd-divider" />

            <div className="jd-description">
              <p>{job?.description}</p>
            </div>

            <hr className="jd-divider" />

            <div className="jd-details-grid">
              <div className="jd-detail-item">
                <Clock size={20} />
                <div>
                  <span>{t("findWork.drawer.projectType")}</span>
                  <strong>{job.job_type === "fixed" ? t("findWork.projectCard.fixed") : t("findWork.projectCard.hourly")}</strong>
                </div>
              </div>
              <div className="jd-detail-item">
                <Award size={20} />
                <div>
                  <strong>Intermediate</strong>
                  <span>Experience Level</span>
                </div>
              </div>
              <div className="jd-detail-item">
                <DollarSign size={20} />
                <div>
                  <span>{t("findWork.drawer.budget")}</span>
                  <strong>{job.budget_max ? `${Number(job.budget_max).toLocaleString()} ${job.currency || 'UZS'}` : t("findWork.projectCard.recently")}</strong>
                </div>
              </div>
            </div>

            <hr className="jd-divider" />

            <div className="jd-skills-section">
              <h3>{t("findWork.drawer.skillsExpertise")}</h3>
              <div className="jd-tags">
                {skills.map((skill, index) => (
                  <span key={index} className="jd-tag">{skill}</span>
                ))}
              </div>
            </div>

            <hr className="jd-divider" />
            
            <div className="jd-activity-section">
                <h3>{t("findWork.drawer.activityOnJob")}</h3>
                <div className="jd-proposals-stat">
                  {t("findWork.drawer.stats.proposals")}: <strong>{job.proposals_count || 0}</strong>
                </div>
                <div className="jd-stat-line">{t("findWork.drawer.stats.interviewing")}: <span>0</span></div>
                <div className="jd-stat-line">{t("findWork.drawer.stats.invitesSent")}: <span>0</span></div>
            </div>
          </div>

          <div className="jd-sidebar">
            <button className="jd-btn-apply">{t("findWork.drawer.applyNow")}</button>
            <button className={`jd-btn-save ${isLiked ? "active" : ""}`} onClick={onToggleLike}>
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> 
              {isLiked ? t("findWork.drawer.saved") : t("findWork.drawer.saveJob")}
            </button>
            
            <button className="jd-btn-flag"><Flag size={14} /> {t("findWork.drawer.flagInappropriate")}</button>

            <div className="jd-client-info">
              <h3>{t("findWork.drawer.aboutClient")}</h3>
              <div className="jd-stat-line" style={{ marginTop: "12px", color: "var(--brand)" }}>
                <CheckCircle2 size={16} /> 
                <strong>{t("findWork.drawer.paymentVerified")}</strong>
              </div>
              <div className="jd-client-rating">
                <div className="jd-stars">
                  ★★★★★ <span>4.95 {t("findWork.drawer.reviews", { count: 50, rating: "" })}</span>
                </div>
              </div>
              
              <div className="jd-client-meta">
                <div className="jd-meta-item">
                    <strong>Uzbekistan</strong>
                    <span>Tashkent 10:45 PM</span>
                </div>
                <div className="jd-meta-item">
                    <strong>12 {t("findWork.drawer.jobsPosted")}</strong>
                    <span>80% {t("findWork.drawer.hireRate")}, 1 open job</span>
                </div>
                <div className="jd-meta-item">
                    <strong>$5K+ {t("findWork.drawer.totalSpent")}</strong>
                    <span>11 {t("findWork.drawer.hires")}, 0 active</span>
                </div>
              </div>
              
              <p className="jd-member-since">{t("findWork.drawer.memberSince", { date: "Jan 15, 2023" })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
