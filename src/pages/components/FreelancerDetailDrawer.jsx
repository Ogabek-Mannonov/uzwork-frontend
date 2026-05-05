import React, { useEffect, useState, useMemo } from "react";
import { 
  X, MapPin, Star, Zap, Heart, MessageCircle, 
  ExternalLink, Calendar, Briefcase, Award, 
  Clock, CheckCircle2, ChevronRight, Share2, 
  ThumbsUp, UserCheck, BarChart3, Globe,
  FileText, Download, PlayCircle, ArrowLeft
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getFreelancerById, getPublicPortfolio, getPublicCertifications, saveFreelancer } from "../../api/freelancer";
import { getUserReviews, getReviews } from "../../api/ratings";
import { getUserProfile } from "../../api/common";
import { getContracts } from "../../api/contracts";
import Price from "./Currency/Price";
import InviteForm from "./InviteForm";
import "../../assets/style/FreelancerDetailDrawer.css";

export default function FreelancerDetailDrawer({ isOpen, onClose, freelancerId, onInvite, onSaveToggle, initialView = "details" }) {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [certs, setCerts] = useState([]);
  const [activeTab, setActiveTab] = useState("about");
  const [showInvite, setShowInvite] = useState(initialView === "invite");

  useEffect(() => {
    if (isOpen && freelancerId) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setIsAnimating(true), 10);
      fetchAllData();
      if (initialView === "invite") setShowInvite(true);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        document.body.style.overflow = "unset";
        setData(null);
        setActiveTab("about");
        setShowInvite(false);
      }, 400);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, freelancerId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [userRes, portRes, revRes, certRes, contRes] = await Promise.all([
        getUserProfile(freelancerId),
        getPublicPortfolio(freelancerId),
        getReviews({ freelancer_id: freelancerId }),
        getPublicCertifications(freelancerId),
        getContracts({ freelancer_id: freelancerId, status: 'completed' })
      ]);

      if (userRes?.success) {
        const rawData = userRes.data || (userRes.user ? userRes : null);
        if (rawData) {
          const u = rawData.user || {};
          const p = rawData.profile || {};
          setData({
            ...p,
            ...u,
            in_progress_jobs: rawData.in_progress_jobs || 0,
            completed_jobs: rawData.completed_jobs || 0,
            total_reviews: rawData.total_reviews || 0,
            average_rating: rawData.average_rating || 0,
            fullName: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "User",
            languages: p.languages || [],
            skills: Array.isArray(p.skills) ? p.skills : (p.skills ? [p.skills] : []),
          });
        }
      }
      
      if (portRes?.success) setPortfolio(portRes.data.items || portRes.data || []);
      
      // Combine reviews and completed contracts for "Work History"
      const rData = revRes.data?.reviews || revRes.data?.items || revRes.data || [];
      const cData = contRes.data?.contracts || contRes.data || [];
      
      const historyItems = [];
      
      // 1. First add all reviews
      rData.forEach(rev => {
        historyItems.push({
          id: `rev-${rev.id}`,
          job_title: rev.job_title,
          rating: rev.rating,
          comment: rev.comment,
          project_amount: rev.project_amount,
          project_currency: rev.project_currency || 'USD',
          created_at: rev.created_at,
          contract_id: rev.contract_id,
          is_review: true
        });
      });
      
      // 2. Add contracts that DON'T have reviews yet
      cData.forEach(cont => {
        const hasReview = rData.some(r => String(r.contract_id) === String(cont.id));
        if (!hasReview) {
          historyItems.push({
            id: `cont-${cont.id}`,
            job_title: cont.job_title || cont.title,
            rating: null,
            comment: null,
            project_amount: cont.total_amount,
            project_currency: cont.currency || 'USD',
            created_at: cont.completed_at || cont.updated_at || cont.created_at,
            contract_id: cont.id,
            is_review: false
          });
        }
      });
      
      // Sort by date desc
      historyItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(historyItems);

      if (certRes?.success) {
        const cData = certRes.data?.certifications || certRes.data?.items || certRes.data || [];
        setCerts(Array.isArray(cData) ? cData : []);
      }
    } catch (error) {
      console.error("Error fetching freelancer full details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInternal = async () => {
    if (!data) return;
    try {
      const res = await saveFreelancer(data.id);
      if (res?.success) {
        const newState = !data.is_saved;
        setData({ ...data, is_saved: newState });
        onSaveToggle?.(data.name || `${data.first_name} ${data.last_name}`, newState);
      }
    } catch (err) {
      console.error("Error toggling save in drawer:", err);
    }
  };

  if (!isOpen && !isAnimating) return null;

  const tabs = [
    { id: "about", label: t("profile.about", "Haqida") },
    { id: "history", label: t("profile.workHistory", "Ish tarixi"), count: reviews.length },
    { id: "portfolio", label: t("profile.portfolio", "Portfoliyo"), count: portfolio.length },
    { id: "skills", label: t("profile.skills", "Ko'nikmalar") },
    { id: "certs", label: t("profile.certifications", "Sertifikatlar"), count: certs.length }
  ];

  return (
    <div className={`fd-overlay ${isOpen ? "is-open" : ""}`} onClick={onClose}>
      <div className={`fd-drawer ${isOpen ? "is-open" : ""}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Top Control Bar */}
        <div className="fd-controls">
          <button className="fd-control-btn close-btn" onClick={onClose} aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          
          <div className="fd-controls-right">
            <button className="fd-control-btn" title="Share"><Share2 size={18} /></button>
            <button 
              className={`fd-control-btn ${data?.is_saved ? "liked" : ""}`} 
              onClick={handleSaveInternal}
              title="Save"
            >
              <Heart size={18} fill={data?.is_saved ? "#ef4444" : "none"} stroke={data?.is_saved ? "#ef4444" : "currentColor"} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="fd-loading-wrap">
            <div className="fd-shimmer-header" />
            <div className="fd-shimmer-tabs" />
            <div className="fd-shimmer-content" />
          </div>
        ) : !data ? (
          <div className="fd-error-state">
            <CheckCircle2 size={48} color="#ef4444" />
            <p>{t("common.errorLoading", "Ma'lumot yuklashda xatolik")}</p>
          </div>
        ) : (
          <div className="fd-main-scroll custom-scrollbar">
            {/* Header Section */}
            <div className="fd-profile-header">
              <div className="fd-header-left">
                <div className="fd-avatar-container">
                  <img src={data.avatar_url || `https://ui-avatars.com/api/?name=${data.first_name}+${data.last_name}`} alt={data.name} className="fd-avatar" />
                  {data.is_online && <span className="fd-online-indicator" />}
                </div>
                <div className="fd-info-main">
                  <h1 className="fd-name">
                    {data.first_name} {data.last_name}
                    {data.is_verified && <CheckCircle2 size={18} className="fd-verified-icon" />}
                  </h1>
                  <p className="fd-title-text">{data.title}</p>
                  <div className="fd-location-row">
                    <MapPin size={14} />
                    <span>{data.location}</span>
                    <span className="fd-dot">•</span>
                    <Clock size={14} />
                    <span>1:53 am local time</span>
                  </div>
                </div>
              </div>

              <div className="fd-header-actions">
                <div className="fd-quick-stats">
                  <div className="fd-stat-item">
                    <div className="fd-stat-val"><Price amount={data.hourly_rate} currency="USD" />/hr</div>
                    <div className="fd-stat-lbl">Rate</div>
                  </div>
                  <div className="fd-stat-item">
                    <div className="fd-stat-val">100%</div>
                    <div className="fd-stat-lbl">Job Success</div>
                  </div>
                  <div className="fd-stat-item">
                    <div className="fd-stat-val">{data.completed_jobs || 0}</div>
                    <div className="fd-stat-lbl">Total Jobs</div>
                  </div>
                  <div className="fd-stat-item">
                    <div className="fd-stat-val">{data.in_progress_jobs || 0}</div>
                    <div className="fd-stat-lbl">In Progress</div>
                  </div>
                </div>
                <div className="fd-action-buttons">
                  <button className="fd-btn-primary" onClick={() => setShowInvite(true)}>
                    {t("findTalent.card.invite", "Taklif qilish")}
                  </button>
                  <button className="fd-btn-secondary" onClick={() => window.location.href=`/messages?userId=${freelancerId}`}>
                    <MessageCircle size={18} /> {t("findTalent.card.sendMessage", "Xabar yozish")}
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="fd-tabs-nav">
              {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  className={`fd-tab-item ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {tab.count > 0 && <span className="fd-tab-count">{tab.count}</span>}
                </button>
              ))}
              
              <a 
                href={`/profile/${freelancerId}`} 
                target="_blank" 
                rel="noreferrer" 
                className="fd-tab-extra-link"
              >
                {t("findTalent.card.viewFullProfile", "View full profile")}
                <ExternalLink size={14} />
              </a>
            </div>            {/* Tab Content */}
            <div className="fd-tab-content">
              {showInvite ? (
                <InviteForm 
                  freelancer={data}
                  onInviteSuccess={(name, success) => {
                    onInvite?.(data, success);
                    if (success) setShowInvite(false);
                  }}
                  onBack={() => setShowInvite(false)}
                />
              ) : (
                <>
                  {activeTab === "about" && (
                    <div className="fd-about-section soft-fade-in">
                      <h3 className="fd-content-title">{t("profile.about", "Haqida")}</h3>
                      <div className="fd-bio-text">
                        {data.bio ? data.bio : t("profile.noBio", "Biografiya kiritilmagan.")}
                      </div>
                      
                      <div className="fd-metrics-grid">
                        <div className="fd-metric-card">
                          <BarChart3 size={20} />
                          <div>
                            <div className="fd-m-val">98%</div>
                            <div className="fd-m-lbl">Client satisfaction</div>
                          </div>
                        </div>
                        <div className="fd-metric-card">
                          <Clock size={20} />
                          <div>
                            <div className="fd-m-val">24h</div>
                            <div className="fd-m-lbl">Avg. response time</div>
                          </div>
                        </div>
                        <div className="fd-metric-card">
                          <UserCheck size={20} />
                          <div>
                            <div className="fd-m-val">12</div>
                            <div className="fd-m-lbl">Repeat clients</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "portfolio" && (
                    <div className="fd-portfolio-section soft-fade-in">
                      {portfolio.length === 0 ? (
                        <div className="fd-empty-tab">
                          <Briefcase size={40} />
                          <p>{t("profile.noPortfolio", "Portfoliyo hali qo'shilmagan.")}</p>
                        </div>
                      ) : (
                        <div className="fd-portfolio-grid">
                          {portfolio.map(item => (
                            <div key={item.id} className="fd-portfolio-card">
                              <div className="fd-portfolio-thumb">
                                {item.media?.[0]?.url ? (
                                  <img src={item.media[0].url} alt={item.title} />
                                ) : (
                                  <div className="fd-portfolio-placeholder"><FileText size={32} /></div>
                                )}
                                <div className="fd-portfolio-overlay">
                                  <button className="fd-portfolio-view"><PlayCircle size={20} /> View project</button>
                                </div>
                              </div>
                              <div className="fd-portfolio-info">
                                <h4>{item.title}</h4>
                                <p>{item.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "history" && (
                    <div className="fd-history-section soft-fade-in">
                       {reviews.length === 0 ? (
                        <div className="fd-empty-tab">
                          <ThumbsUp size={40} />
                          <p>{t("profile.noHistory", "Ish tarixi hali mavjud emas.")}</p>
                        </div>
                      ) : (
                        <div className="fd-history-list">
                          {reviews.map(rev => (
                            <div key={rev.id} className="fd-history-card">
                              <div className="fd-history-header">
                                <h4 className="fd-history-job-title">{rev.job_title || t("profile.untitledJob", "Loyiha nomi")}</h4>
                                <div className="fd-history-rating">
                                  {rev.rating ? (
                                    <>
                                      <div className="fd-stars">
                                        {[...Array(5)].map((_, i) => (
                                          <Star key={i} size={14} fill={i < rev.rating ? "#f59e0b" : "none"} stroke={i < rev.rating ? "#f59e0b" : "#ccc"} />
                                        ))}
                                      </div>
                                      <span className="fd-rating-num">{rev.rating?.toFixed(1)}</span>
                                    </>
                                  ) : (
                                    <span className="fd-no-feedback">{t("profile.noFeedback", "Fikr bildirilmagan")}</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="fd-history-meta">
                                <div className="fd-meta-item">
                                  <Price amount={rev.project_amount} currency={rev.project_currency || 'USD'} />
                                </div>
                                <div className="fd-meta-sep" />
                                <div className="fd-meta-item">
                                  {t("common.fixedPrice", "Fixed price")}
                                </div>
                                <div className="fd-meta-sep" />
                                <div className="fd-meta-item">
                                  {new Date(rev.created_at).toLocaleDateString()}
                                </div>
                              </div>

                              {rev.comment ? (
                                <div className="fd-history-comment">
                                  <p>"{rev.comment}"</p>
                                </div>
                              ) : (
                                <div className="fd-history-comment empty">
                                  <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>{t("profile.noComment", "Izoh qoldirilmagan.")}</p>
                                </div>
                              )}

                              <div className="fd-history-footer">
                                <div className="fd-client-brief">
                                  <img src={`https://ui-avatars.com/api/?name=Client`} alt="Client" />
                                  <span>{t("profile.verifiedClient", "Tasdiqlangan mijoz")}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "skills" && (
                    <div className="fd-skills-section soft-fade-in">
                      <h3 className="fd-content-title">{t("profile.skills", "Ko'nikmalar va Texnologiyalar")}</h3>
                      <div className="fd-skills-wrap">
                        {(data.skills || []).length > 0 ? (data.skills || []).map(skill => (
                          <span key={skill} className="fd-skill-pill">{skill}</span>
                        )) : (
                          <p style={{ color: '#94a3b8' }}>{t("profile.noSkills", "Ko'nikmalar kiritilmagan")}</p>
                        )}
                      </div>
                      
                      <h3 className="fd-content-title" style={{ marginTop: 48 }}>{t("profile.languages", "Tillar")}</h3>
                      <div className="fd-langs-grid">
                        {(data.languages || data.language || []).length > 0 ? (data.languages || data.language || []).map((lang, idx) => (
                          <div key={idx} className="fd-lang-card">
                            <div className="fd-lang-info">
                              <div className="fd-lang-icon-wrap">
                                <Globe size={18} />
                              </div>
                              <span className="fd-lang-name">{lang.language || lang.name || lang}</span>
                            </div>
                            <span className="fd-lang-level-badge">{lang.proficiency || lang.level || t("profile.basic", "Basic")}</span>
                          </div>
                        )) : (
                          <div className="fd-empty-tab" style={{ padding: '20px 0', gridColumn: '1/-1' }}>
                            <Globe size={32} />
                            <p>{t("profile.noLanguages", "Tillar kiritilmagan")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "certs" && (
                    <div className="fd-certs-section soft-fade-in">
                      {certs.length === 0 ? (
                        <div className="fd-empty-tab">
                          <Award size={40} />
                          <p>{t("profile.noCerts", "Sertifikatlar mavjud emas.")}</p>
                        </div>
                      ) : (
                        <div className="fd-certs-list">
                          {certs.map(cert => (
                            <div key={cert.id} className="fd-cert-card soft-fade-in">
                              <div className="fd-cert-badge-wrap">
                                <Award size={32} />
                              </div>
                              <div className="fd-cert-main-info">
                                <div className="fd-cert-header-row">
                                  <h4 className="fd-cert-name">
                                    {cert.title}
                                    <CheckCircle2 size={16} className="fd-cert-verified" />
                                  </h4>
                                  <span className="fd-cert-year-tag">{cert.issue_year}</span>
                                </div>
                                <div className="fd-cert-issuer-line">
                                  <span>{cert.issuer}</span>
                                  <div className="fd-cert-dot-sep" />
                                  <span>{t("profile.verifiedCredential", "Tasdiqlangan sertifikat")}</span>
                                </div>
                                {cert.certificate_file_url && (
                                  <div className="fd-cert-actions">
                                    <a href={cert.certificate_file_url} target="_blank" rel="noreferrer" className="fd-cert-btn-view">
                                      <ExternalLink size={14} /> {t("profile.viewCredential", "Sertifikatni ko'rish")}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
