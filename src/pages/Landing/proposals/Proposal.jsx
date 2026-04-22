import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createProposal } from "../../../api/proposals";
import { getJobById } from "../../../api/jobs";
import {
  ArrowLeft,
  Send,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  Info,
  Calendar,
  Lock,
  Award,
  TrendingUp
} from "lucide-react";
import "./Proposal.css";

export default function Proposal() {
  const { t, i18n } = useTranslation();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  
  // Payment Mode
  const [paymentMode, setPaymentMode] = useState("project"); // "milestone" or "project"
  
  // Form State
  const [milestones, setMilestones] = useState([
    { description: "", due_date: "", amount: "" }
  ]);
  const [projectPrice, setProjectPrice] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [duration, setDuration] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [submitted, setSubmitted] = useState(false);

  const SERVICE_FEE_PCT = 0.10; // 10% fee

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 5000);
  };

  useEffect(() => {
    if (jobId) {
      setJobLoading(true);
      getJobById(jobId).then(res => {
        const project = res?.data?.project || res?.data || res;
        setJob(project);
        setJobLoading(false);
        // Default price from job budget if fixed
        if (project?.job_type === 'fixed' && project.budget_max) {
           setProjectPrice(project.budget_max);
        }
      });
    }
  }, [jobId]);

  // Calculations
  const totalPrice = useMemo(() => {
    if (paymentMode === "project") {
      const p = parseFloat(projectPrice);
      return isNaN(p) ? 0 : p;
    }
    return milestones.reduce((sum, m) => {
      const val = parseFloat(m.amount);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [paymentMode, projectPrice, milestones]);

  const serviceFee = totalPrice * SERVICE_FEE_PCT;
  const youReceive = totalPrice - serviceFee;

  // Milestone Actions
  const addMilestone = () => {
    setMilestones([...milestones, { description: "", due_date: "", amount: "" }]);
  };

  const removeMilestone = (index) => {
    if (milestones.length === 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index, field, value) => {
    const next = [...milestones];
    next[index][field] = value;
    setMilestones(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) { notify(t("submitProposal.toast.coverLetterReq"), "error"); return; }
    if (totalPrice <= 0) { notify(t("submitProposal.toast.priceReq"), "error"); return; }

    setLoading(true);
    const payload = {
      job_id: jobId,
      cover_letter: coverLetter,
      proposed_price: totalPrice,
      proposed_duration: duration,
      milestones: paymentMode === "milestone" ? milestones : [],
      payment_mode: paymentMode
    };

    const res = await createProposal(payload);
    setLoading(false);

    if (res?.success === false) {
      notify(res?.message || t("submitProposal.toast.error"), "error");
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="proposal-page">
        <div className="proposal-success">
          <div className="proposal-success__icon">
            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "20px", borderRadius: "50%" }}>
              <CheckCircle2 size={64} color="#10b981" />
            </div>
          </div>
          <h2 className="proposal-success__title">{t("submitProposal.success.title")}</h2>
          <p className="proposal-success__desc">
            {t("submitProposal.success.desc")}
          </p>
          <div className="proposal-success__actions">
            <button className="proposal-btn--primary" onClick={() => navigate("/my-proposals")}>
              {t("submitProposal.success.myProposals")}
            </button>
            <button className="proposal-btn--outline" onClick={() => navigate("/find-work")}>
              {t("submitProposal.success.findWork")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const jobDateStr = job?.created_at ? new Date(job.created_at).toLocaleDateString(
    i18n.language === 'uz' ? 'uz-UZ' : (i18n.language === 'ru' ? 'ru-RU' : 'en-US')
  ) : "";

  return (
    <div className="proposal-page">
      {/* Toast */}
      {toast.msg && (
        <div className={`proposal-toast ${toast.type === "error" ? "proposal-toast--error" : "proposal-toast--success"}`}>
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}

      <div className="proposal-container">
        <header className="proposal-header">
          <button className="proposal-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> {t("submitProposal.back")}
          </button>
          <h1 className="proposal-title">{t("submitProposal.title")}</h1>
        </header>

        <div className="proposal-grid">
          
          {/* Main Content */}
          <div className="proposal-main-content">

            {/* JOB DETAILS CARD */}
            <section className="proposal-card">
              <div className="proposal-card__header">
                <h2 className="proposal-card__title">{t("submitProposal.sections.jobDetails")}</h2>
              </div>
              <div className="proposal-card__body">
                {jobLoading ? (
                  <div className="proposal-skeleton-text">{t("submitProposal.loading")}</div>
                ) : (
                  <div className="proposal-job-summary">
                    <h3 className="job-title-large">{job?.title}</h3>
                    <div className="job-meta-pills">
                      <span className="job-pill">{job?.category_name || t("submitProposal.job.category")}</span>
                      <span className="job-pill-date">{t("submitProposal.job.posted")}: {jobDateStr}</span>
                    </div>
                    
                    <div className="job-desc-preview">
                      <p>{job?.description}</p>
                    </div>

                    <div className="job-specs">
                      <div className="spec-item">
                        <Award size={18} />
                        <div>
                          <strong>{job?.experience_level || "Ekspert"}</strong>
                          <span>{t("submitProposal.job.experience")}</span>
                        </div>
                      </div>
                      <div className="spec-item">
                        <DollarSign size={18} />
                        <div>
                          <strong>{job?.job_type === 'hourly' ? `$${job?.budget_min}-${job?.budget_max}` : `$${job?.budget_max}`}</strong>
                          <span>{job?.job_type === 'hourly' ? t("findWork.projectCard.hourly") : t("findWork.projectCard.fixed")}</span>
                        </div>
                      </div>
                      <div className="spec-item">
                        <Calendar size={18} />
                        <div>
                          <strong>{job?.duration || "1-3 oy"}</strong>
                          <span>{t("submitProposal.job.duration")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* TERMS SECTION */}
            <section className="proposal-card">
              <div className="proposal-card__header">
                <h2 className="proposal-card__title">{t("submitProposal.sections.terms")}</h2>
              </div>
              <div className="proposal-card__body">
                <div className="payment-mode-shaper">
                  <h4 className="payment-mode-title">{t("submitProposal.terms.paymentHeader")}</h4>
                  
                  <div className="payment-options">
                    <label className={`payment-option ${paymentMode === 'milestone' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMode" 
                        value="milestone" 
                        checked={paymentMode === 'milestone'} 
                        onChange={() => setPaymentMode('milestone')}
                      />
                      <div className="option-content">
                        <strong>{t("submitProposal.terms.milestone.title")}</strong>
                        <p>{t("submitProposal.terms.milestone.desc")}</p>
                      </div>
                    </label>

                    <label className={`payment-option ${paymentMode === 'project' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMode" 
                        value="project" 
                        checked={paymentMode === 'project'} 
                        onChange={() => setPaymentMode('project')}
                      />
                      <div className="option-content">
                        <strong>{t("submitProposal.terms.project.title")}</strong>
                        <p>{t("submitProposal.terms.project.desc")}</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Milestone Editor */}
                {paymentMode === 'milestone' && (
                  <div className="milestones-editor">
                    <h5 className="editor-title">{t("submitProposal.milestones.header")}</h5>
                    <div className="milestone-table">
                      <div className="milestone-table-header">
                        <div className="col-desc">{t("submitProposal.milestones.description")}</div>
                        <div className="col-date">{t("submitProposal.milestones.dueDate")}</div>
                        <div className="col-amt">{t("submitProposal.milestones.amount")}</div>
                        <div className="col-action"></div>
                      </div>
                      {milestones.map((m, idx) => (
                        <div className="milestone-row" key={idx}>
                          <div className="col-idx">{idx + 1}</div>
                          <div className="col-desc">
                            <input 
                              type="text" 
                              placeholder={t("submitProposal.milestones.placeholderDesc")}
                              value={m.description}
                              onChange={e => updateMilestone(idx, 'description', e.target.value)}
                            />
                          </div>
                          <div className="col-date">
                            <input 
                              type="text" 
                              placeholder={t("submitProposal.milestones.placeholderDate")}
                              value={m.due_date}
                              onChange={e => updateMilestone(idx, 'due_date', e.target.value)}
                            />
                          </div>
                          <div className="col-amt">
                            <input 
                              type="number" 
                              placeholder="50" 
                              value={m.amount}
                              onChange={e => updateMilestone(idx, 'amount', e.target.value)}
                            />
                          </div>
                          <div className="col-action">
                             <button type="button" onClick={() => removeMilestone(idx)} className="btn-remove"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addMilestone} className="btn-add-milestone">
                      <Plus size={16} /> {t("submitProposal.milestones.add")}
                    </button>
                  </div>
                )}

                {/* Project Price input */}
                {paymentMode === 'project' && (
                  <div className="project-price-field">
                    <label>{t("submitProposal.project.priceLabel")}</label>
                    <div className="price-input-wrap">
                      <DollarSign size={18} />
                      <input 
                        type="number" 
                        value={projectPrice} 
                        onChange={e => setProjectPrice(e.target.value)}
                        placeholder={t("submitProposal.project.placeholder")}
                      />
                    </div>
                  </div>
                )}

                <div className="fee-calculator">
                  <div className="fee-line">
                    <div className="fee-label">
                      <strong>{t("submitProposal.fee.totalBalance")}</strong>
                      <span>{t("submitProposal.fee.totalDesc")}</span>
                    </div>
                    <div className="fee-value">${totalPrice.toLocaleString()}</div>
                  </div>
                  <div className="fee-line">
                    <div className="fee-label">
                      <strong>{t("submitProposal.fee.serviceFee")}</strong>
                      <span>{t("submitProposal.fee.serviceDesc")}</span>
                    </div>
                    <div className="fee-value">-${serviceFee.toLocaleString()}</div>
                  </div>
                  <hr className="fee-divider" />
                  <div className="fee-line fee-line-total">
                    <div className="fee-label">
                      <strong>{t("submitProposal.fee.receive")}</strong>
                      <span>{t("submitProposal.fee.receiveDesc")}</span>
                    </div>
                    <div className="fee-value">${youReceive.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* DURATION SECTION */}
            <section className="proposal-card">
              <div className="proposal-card__header">
                <h2 className="proposal-card__title">{t("submitProposal.sections.duration")}</h2>
              </div>
              <div className="proposal-card__body">
                <div className="duration-field">
                  <label>{t("submitProposal.duration.label")}</label>
                  <div className="input-with-icon">
                    <Clock size={18} />
                    <select value={duration} onChange={e => setDuration(e.target.value)}>
                      <option value="">{t("submitProposal.duration.placeholder")}</option>
                      <option value="1 oydan kam">{t("submitProposal.duration.less1Month")}</option>
                      <option value="1-3 oy">{t("submitProposal.duration.1To3Months")}</option>
                      <option value="3-6 oy">{t("submitProposal.duration.3To6Months")}</option>
                      <option value="6 oydan ko'p">{t("submitProposal.duration.more6Months")}</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* ADDITIONAL DETAILS SECTION */}
            <section className="proposal-card">
              <div className="proposal-card__header">
                <h2 className="proposal-card__title">{t("submitProposal.sections.additional")}</h2>
              </div>
              <div className="proposal-card__body">
                <div className="cover-letter-field">
                  <label>{t("submitProposal.additional.coverLetter")} <span>*</span></label>
                  <textarea 
                    rows={8}
                    placeholder={t("submitProposal.additional.placeholder")}
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                  />
                </div>
                
                <div className="attachments-field">
                  <label>{t("submitProposal.additional.attachments")}</label>
                  <div className="upload-placeholder">
                    <FileText size={24} />
                    <p>{t("submitProposal.additional.uploadDesc")}</p>
                    <small>{t("submitProposal.additional.uploadLimit")}</small>
                  </div>
                </div>
              </div>
            </section>

            <div className="proposal-form-actions">
              <button 
                type="submit" 
                className="proposal-btn-submit" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <><Loader2 className="spin" style={{ marginRight: 8 }} size={18} /> {t("submitProposal.actions.submitting")}</> : t("submitProposal.actions.submit")}
              </button>
              <button 
                type="button" 
                className="proposal-btn-cancel"
                onClick={() => navigate(-1)}
              >
                {t("submitProposal.actions.cancel")}
              </button>
            </div>

          </div>

          {/* Sidebar (Brief Summary) */}
          <aside className="proposal-sidebar">
             <div className="sidebar-sticky">
                <div className="security-shield">
                   <Lock size={20} />
                   <div>
                     <strong>{t("submitProposal.sidebar.protectionTitle")}</strong>
                     <p>{t("submitProposal.sidebar.protectionDesc")}</p>
                   </div>
                </div>

                <div className="quick-stats">
                   <div className="stat-row">
                     <span>{t("submitProposal.sidebar.jobType")}</span>
                     <strong>{job?.job_type === 'hourly' ? t("findWork.projectCard.hourly") : t("findWork.projectCard.fixed")}</strong>
                   </div>
                   <div className="stat-row">
                     <span>{t("submitProposal.sidebar.experience")}</span>
                     <strong>{job?.experience_level || "Ekspert"}</strong>
                   </div>
                </div>
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
