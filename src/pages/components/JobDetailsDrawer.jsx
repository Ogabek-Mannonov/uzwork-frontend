import React, { useEffect, useState } from "react";
import { X, ArrowLeft, ExternalLink, Heart, Flag, Share2, MapPin, Calendar, Clock, DollarSign, Award, CheckCircle2, Star } from "lucide-react";
import "../../assets/style/JobDetailsDrawer.css";

export default function JobDetailsDrawer({ job, isOpen, onClose, onToggleLike, isLiked }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Small delay to ensure overlay starts first for better feel
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        document.body.style.overflow = "unset";
      }, 400); // Now matches the 0.4s CSS transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  // Formatting skills
  let skills = [];
  try {
    if (typeof job?.required_skills === 'string') skills = JSON.parse(job.required_skills);
    else if (Array.isArray(job?.required_skills)) skills = job.required_skills;
  } catch (e) {}

  const budgetText = job?.job_type === "fixed" 
    ? `${Number(job?.budget_max).toLocaleString()} ${job?.currency || 'UZS'}`
    : `${Number(job?.budget_min)}–${Number(job?.budget_max)} ${job?.currency || 'UZS'}/soat`;

  return (
    <div className={`jd-overlay ${isOpen ? "is-open" : ""}`} onClick={onClose}>
      <div className={`jd-drawer ${isOpen ? "is-open" : ""}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Navigation */}
        <div className="jd-header">
          <button className="jd-back-btn" onClick={onClose}>
            <ArrowLeft size={24} />
          </button>
          <div className="jd-header-actions">
            <a href={`/jobs/${job?.id}`} target="_blank" rel="noreferrer" className="jd-external-link">
              <ExternalLink size={18} /> Open job in a new window
            </a>
          </div>
        </div>

        <div className="jd-content">
          {/* Main Info Column */}
          <div className="jd-main-info">
            <h1 className="jd-title">{job?.title}</h1>
            
            <div className="jd-meta-row">
              <span className="jd-category">Design & Creative</span> 
              <span className="jd-posted">Posted {job?.created_at ? new Date(job.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}</span>
              <span className="jd-location"><MapPin size={14} /> Worldwide</span>
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
                  <strong>{job?.job_type === 'hourly' ? 'Hourly' : 'Fixed-price'}</strong>
                  <span>Project Type</span>
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
                  <strong>{budgetText}</strong>
                  <span>Budget</span>
                </div>
              </div>
            </div>

            <hr className="jd-divider" />

            <div className="jd-skills-section">
              <h3>Skills and Expertise</h3>
              <div className="jd-tags">
                {skills.map((skill, index) => (
                  <span key={index} className="jd-tag">{skill}</span>
                ))}
              </div>
            </div>

            <hr className="jd-divider" />
            
            <div className="jd-proposals-stat">
                <strong>Activity on this job</strong>
                <div className="jd-stat-line">Proposals: <span>{job?.proposals_count || 0}</span></div>
                <div className="jd-stat-line">Interviewing: <span>0</span></div>
                <div className="jd-stat-line">Invites sent: <span>0</span></div>
            </div>
          </div>

          {/* Right Sidebar Actions */}
          <div className="jd-sidebar">
            <button className="jd-btn-apply">Apply Now</button>
            <button className={`jd-btn-save ${isLiked ? "active" : ""}`} onClick={onToggleLike}>
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> 
              {isLiked ? "Saved" : "Save Job"}
            </button>
            
            <button className="jd-btn-flag"><Flag size={14} /> Flag as inappropriate</button>

            <div className="jd-client-info">
              <h3>About the client</h3>
              <div className="jd-client-stat">
                <CheckCircle2 size={16} color="#2563eb" /> 
                <strong>Payment method verified</strong>
              </div>
              <div className="jd-client-rating">
                <div className="jd-stars">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>4.95 of 50 reviews</span>
                </div>
              </div>
              
              <div className="jd-client-meta">
                <div className="jd-meta-item">
                    <strong>Uzbekistan</strong>
                    <span>Tashkent 10:45 PM</span>
                </div>
                <div className="jd-meta-item">
                    <strong>12 jobs posted</strong>
                    <span>80% hire rate, 1 open job</span>
                </div>
                <div className="jd-meta-item">
                    <strong>$5K+ total spent</strong>
                    <span>11 hires, 0 active</span>
                </div>
              </div>
              
              <p className="jd-member-since">Member since Jan 15, 2023</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
