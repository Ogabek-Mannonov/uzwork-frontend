import React, { useEffect, useState } from "react";
import { Briefcase, DollarSign, Clock, CheckCircle2, Loader2, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getMyJobs } from "../../api/jobs";
import { inviteFreelancer } from "../../api/proposals";
import "../../assets/style/InviteDrawer.css";

export default function InviteForm({ freelancer, onInviteSuccess, onBack }) {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const fetchActiveJobs = async () => {
    setLoading(true);
    try {
      const response = await getMyJobs({ status: "open", limit: 100 });
      const allJobs = response?.data?.projects || response?.data || [];
      const activeJobs = allJobs.filter(j => j.status === "active" || j.status === "open");
      setJobs(activeJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedJobId || !freelancer) return;
    
    setSubmitting(true);
    try {
      const res = await inviteFreelancer({
        job_id: selectedJobId,
        freelancer_id: freelancer.id
      });
      
      if (res?.success) {
        onInviteSuccess(freelancer.name || `${freelancer.first_name} ${freelancer.last_name}`, true);
      } else {
        onInviteSuccess(res?.message || t("findTalent.card.inviteError", "Taklif yuborishda xato"), false);
      }
    } catch (err) {
      console.error("Invite error:", err);
      onInviteSuccess(t("findTalent.card.serverError", "Server xatosi"), false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="invite-form-container soft-fade-in">
      <div className="invite-form-header">
        <button className="invite-back-btn" onClick={onBack}>
          <ChevronLeft size={20} /> {t("common.back", "Orqaga")}
        </button>
        <h2 className="invite-form-title">{t("findTalent.drawer.title", "Ishga taklif qilish")}</h2>
      </div>

      <div className="invite-form-content">
        <div className="invite-freelancer-summary">
            <img src={freelancer.avatar || freelancer.avatar_url || `https://ui-avatars.com/api/?name=${freelancer.first_name}+${freelancer.last_name}`} alt="" />
            <div>
                <h4>{freelancer.name || `${freelancer.first_name} ${freelancer.last_name}`}</h4>
                <p>{freelancer.title}</p>
            </div>
        </div>

        <h3 className="id-section-title" style={{ marginTop: '24px' }}>{t("findTalent.drawer.selectJob", "Faol ishni tanlang")}</h3>
        
        {loading ? (
          <div className="id-loading">
            <Loader2 className="id-spinner" size={32} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="id-empty-state">
            <div className="id-empty-icon">
              <Briefcase size={48} strokeWidth={1.5} />
            </div>
            <div className="id-empty-title">{t("findTalent.drawer.noJobs", "Sizda faol ishlar yo'q")}</div>
            <div style={{ fontSize: "14px", marginTop: "8px" }}>
              {t("findTalent.drawer.noJobsDesc", "Mutaxassisni taklif qilish uchun avval ish e'lon qilishingiz kerak.")}
            </div>
          </div>
        ) : (
          <div className="id-job-list">
            {jobs.map(job => (
              <div 
                key={job.id} 
                className={`id-job-card ${selectedJobId === job.id ? "selected" : ""}`}
                onClick={() => setSelectedJobId(job.id)}
              >
                <div className="id-job-header">
                  <div className="id-job-title">{job.title}</div>
                  <div className="id-job-radio">
                    <div className="id-job-radio-inner" />
                  </div>
                </div>
                <div className="id-job-meta">
                  <div className="id-job-meta-item">
                    <DollarSign size={14} />
                    <span>
                      {job.budget_max 
                        ? (job.currency === 'UZS' ? `${Number(job.budget_max).toLocaleString()} UZS` : (job.currency === 'RUB' ? `${job.budget_max} ₽` : `$${job.budget_max}`))
                        : (job.budget_min 
                            ? (job.currency === 'UZS' ? `${Number(job.budget_min).toLocaleString()} UZS` : (job.currency === 'RUB' ? `${job.budget_min} ₽` : `$${job.budget_min}`))
                            : t('myJobs.negotiable', 'Kelishiladi'))
                      }
                    </span>
                  </div>
                  <div className="id-job-meta-item">
                    <Clock size={14} />
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="invite-form-footer">
        <button 
          className="id-submit-btn" 
          disabled={!selectedJobId || submitting || jobs.length === 0}
          onClick={handleInvite}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {submitting ? (
            <Loader2 className="id-spinner" size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          {t("findTalent.drawer.sendInvite", "Taklif yuborish")}
        </button>
      </div>
    </div>
  );
}
