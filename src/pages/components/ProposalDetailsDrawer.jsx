import React, { useEffect, useState } from "react";
import { 
  X, 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Mail, 
  Briefcase,
  User,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  FileText
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "../../assets/style/JobDetailsDrawer.css"; // Reuse existing styles

export default function ProposalDetailsDrawer({ proposal, isOpen, onClose }) {
  const { t, i18n } = useTranslation();
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
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;
  if (!proposal) return null;

  const isInvited = proposal.status === "invited";
  const postedDate = new Date(proposal.created_at).toLocaleDateString(
    i18n.language === 'uz' ? 'uz-UZ' : (i18n.language === 'ru' ? 'ru-RU' : 'en-US')
  );

  return (
    <div className={`jd-overlay ${isOpen ? "is-open" : ""}`} onClick={onClose}>
      <div className={`jd-drawer ${isOpen ? "is-open" : ""}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="jd-header">
          <button className="jd-back-btn" onClick={onClose}>
            <ArrowLeft size={24} />
          </button>
          <div className="jd-header-actions">
            <span className="fprop-status-tag" style={{ 
              backgroundColor: isInvited ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.15)",
              color: isInvited ? "#3b82f6" : "#10b981",
              fontSize: "0.8rem",
              padding: "4px 12px",
              borderRadius: "20px"
            }}>
              {t(`myProposals.status.${isInvited ? 'invited' : 'pending'}`)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="jd-content">
          
          <div className="jd-main-info">
            <h1 className="jd-title">{proposal.job_title || t("myProposals.agreement")}</h1>
            
            <div className="jd-meta-row">
              <span className="jd-category">{proposal.status === 'invited' ? t("myProposals.tabs.invitations") : t("myProposals.tabs.applications")}</span>
              <span className="jd-posted">{t("myProposals.stats.date")}: {postedDate}</span>
            </div>

            <hr className="jd-divider" />

            {/* Proposal Details (Bid) */}
            <div className="jd-details-grid" style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="jd-detail-item">
                <DollarSign size={20} color="var(--brand)" />
                <div>
                  <span>{t("myProposals.stats.price")}</span>
                  <strong style={{ color: "var(--brand)", fontSize: "1.2rem" }}>
                    {proposal.proposed_price ? (
                      proposal.currency === 'UZS' ? `${Number(proposal.proposed_price).toLocaleString()} UZS` : (proposal.currency === 'RUB' ? `${proposal.proposed_price} ₽` : `$${proposal.proposed_price}`)
                    ) : t("myProposals.stats.negotiable")}
                  </strong>
                </div>
              </div>
              <div className="jd-detail-item">
                <Clock size={20} />
                <div>
                  <span>{t("myProposals.stats.duration")}</span>
                  <strong>
                    {proposal.proposed_duration ? `${proposal.proposed_duration} ${t("myProposals.stats.days")}` : t("myProposals.stats.agreement")}
                  </strong>
                </div>
              </div>
            </div>

            <hr className="jd-divider" />

            {/* Cover Letter / Invitation Message */}
            <div className="jd-description">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "var(--fprop-text-1)" }}>
                <FileText size={18} /> {isInvited ? t("myProposals.tabs.invitations") : t("myProposals.noCoverLetter").replace(".", "")}
              </h3>
              <p style={{ lineHeight: "1.7", color: "var(--fprop-text-2)" }}>
                {proposal.cover_letter || t("myProposals.noCoverLetter")}
              </p>
            </div>

            {/* Optional: Brief Job Info */}
            <hr className="jd-divider" />
            <div className="jd-activity-section">
              <h3>{t("myProposals.actions.details")}</h3>
              <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>
                {t("myProposals.subtitle")}
              </p>
              <button 
                className="fprop-btn-wow secondary" 
                style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}
                onClick={() => window.open(`/jobs/${proposal.job_id || proposal.project_id}`, '_blank')}
              >
                {t("findWork.drawer.openNewWindow")} <ArrowUpRight size={18} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="jd-sidebar">
            <div className="jd-client-info" style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px" }}>
              <h3 style={{ marginBottom: "20px" }}>{t("findWork.drawer.aboutClient")}</h3>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                {proposal.client_avatar ? (
                  <img src={proposal.client_avatar} alt="" style={{ width: 48, height: 48, borderRadius: "50%" }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--fprop-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={24} color="var(--fprop-text-3)" />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: "600", color: "var(--fprop-text-1)" }}>
                    {proposal.client_first_name} {proposal.client_last_name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--fprop-text-3)" }}>
                    {proposal.client_username ? `@${proposal.client_username}` : t("findWork.drawer.paymentVerified")}
                  </div>
                </div>
              </div>

              <div className="jd-stat-line" style={{ color: "var(--brand)" }}>
                <CheckCircle2 size={16} />
                <strong style={{ marginLeft: "6px" }}>{t("findWork.drawer.paymentVerified")}</strong>
              </div>

              {isInvited && (
                <button 
                  className="jd-btn-apply" 
                  style={{ marginTop: "24px", width: "100%" }}
                  onClick={() => window.location.href = `/proposals/new/${proposal.job_id || proposal.project_id}`}
                >
                  <TrendingUp size={18} style={{ marginRight: "8px" }} />
                  {t("findWork.drawer.applyNow")}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
