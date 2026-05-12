import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createProposal } from "../../../api/proposals";
import { getJobById } from "../../../api/jobs";
import Price from "../../components/Currency/Price";
import { useCurrency } from "../../components/Currency/CurrencyContext";
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
  TrendingUp,
  ChevronRight
} from "lucide-react";
import "./Proposal.css";

export default function Proposal() {
  const { t, i18n } = useTranslation();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  
  const [paymentMode, setPaymentMode] = useState("project"); // "milestone" or "project"
  const [milestones, setMilestones] = useState([
    { description: "", due_date: "", amount: "" }
  ]);
  const [projectPrice, setProjectPrice] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [duration, setDuration] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [submitted, setSubmitted] = useState(false);

  const SERVICE_FEE_PCT = 0.10; 

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
        if (project?.job_type === 'fixed' && project.budget_max) {
           setProjectPrice(project.budget_max);
        }
      });
    }
  }, [jobId]);

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
      payment_mode: paymentMode,
      currency: job?.currency || 'UZS'
    };

    const res = await createProposal(payload);
    setLoading(false);

    if (res?.success === false) {
      if (res?.message === "proposals.error.alreadySubmitted") {
        notify(t("submitProposal.error.alreadySubmitted", "Siz bu ishga allaqachon taklif yuborgansiz"), "error");
      } else {
        notify(res?.message || t("submitProposal.toast.error"), "error");
      }
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="pr-page pr-success-page">
        <div className="pr-success">
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "24px", borderRadius: "50%" }}>
              <CheckCircle2 size={64} color="#10b981" />
            </div>
          </div>
          <h2 className="pr-success-title">{t("submitProposal.success.title")}</h2>
          <p className="pr-success-desc">{t("submitProposal.success.desc")}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button className="pr-btn pr-btn-submit" style={{ maxWidth: '100%' }} onClick={() => navigate("/my-proposals")}>
              {t("submitProposal.success.myProposals")}
            </button>
            <button className="pr-btn pr-btn-cancel" onClick={() => navigate("/find-work")}>
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
    <div className="pr-page">
      {toast.msg && (
        <div style={{
          position: "fixed", top: 32, right: 32, zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : "var(--brand)",
          color: "#fff", padding: "16px 28px", borderRadius: 12, fontWeight: 700,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 12
        }}>
          {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {toast.msg}
        </div>
      )}

      <div className="pr-container">
        <header className="pr-header">
          <button className="pr-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> {t("submitProposal.back")}
          </button>
          <h1 className="pr-title">{t("submitProposal.title")}</h1>
        </header>

        <div className="pr-grid">
          <div className="pr-main">
            
            {/* JOB DETAILS */}
            <section className="pr-card">
              <div className="pr-card-header">
                <h2 className="pr-card-title">{t("submitProposal.sections.jobDetails")}</h2>
              </div>
              <div className="pr-card-body">
                {jobLoading ? (
                  <div style={{ color: 'var(--muted)', fontStyle: 'italic' }}>{t("submitProposal.loading")}</div>
                ) : (
                  <div>
                    <h3 className="pr-job-title">{job?.title}</h3>
                    <div className="pr-job-pills">
                      <span className="pr-job-pill">{job?.category_name || t("submitProposal.job.category")}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center' }}>
                        {t("submitProposal.job.posted")}: {jobDateStr}
                      </span>
                    </div>
                    
                    <div className="pr-job-desc">
                      <p>{job?.description}</p>
                    </div>

                    <div className="pr-job-specs">
                      <div className="pr-spec-item">
                        <Award size={20} />
                        <div>
                          <strong>{job?.experience_level || "Ekspert"}</strong>
                          <span>{t("submitProposal.job.experience")}</span>
                        </div>
                      </div>
                      <div className="pr-spec-item">
                        <DollarSign size={20} />
                        <div>
                          <strong>
                            {job?.job_type === 'hourly' 
                              ? <><Price amount={job?.budget_min} currency={job?.currency} /> – <Price amount={job?.budget_max} currency={job?.currency} /></> 
                              : <Price amount={job?.budget_max} currency={job?.currency} />}
                          </strong>
                          <span>{job?.job_type === 'hourly' ? t("findWork.projectCard.hourly") : t("findWork.projectCard.fixed")}</span>
                        </div>
                      </div>
                      <div className="pr-spec-item">
                        <Calendar size={20} />
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

            {/* TERMS */}
            <section className="pr-card">
              <div className="pr-card-header">
                <h2 className="pr-card-title">{t("submitProposal.sections.terms")}</h2>
              </div>
              <div className="pr-card-body">
                <div className="pr-payment-mode">
                  <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: 'var(--text)' }}>
                    {t("submitProposal.terms.paymentHeader")}
                  </h4>
                  
                  <div className="pr-options-grid">
                    <div 
                      className={`pr-option-card ${paymentMode === 'milestone' ? 'active' : ''}`}
                      onClick={() => setPaymentMode('milestone')}
                    >
                      <div style={{ marginTop: 4 }}><div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMode === 'milestone' ? 'var(--brand)' : 'var(--border)'}`, background: paymentMode === 'milestone' ? 'var(--brand)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{paymentMode === 'milestone' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}</div></div>
                      <div>
                        <strong>{t("submitProposal.terms.milestone.title")}</strong>
                        <p>{t("submitProposal.terms.milestone.desc")}</p>
                      </div>
                    </div>

                    <div 
                      className={`pr-option-card ${paymentMode === 'project' ? 'active' : ''}`}
                      onClick={() => setPaymentMode('project')}
                    >
                      <div style={{ marginTop: 4 }}><div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMode === 'project' ? 'var(--brand)' : 'var(--border)'}`, background: paymentMode === 'project' ? 'var(--brand)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{paymentMode === 'project' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}</div></div>
                      <div>
                        <strong>{t("submitProposal.terms.project.title")}</strong>
                        <p>{t("submitProposal.terms.project.desc")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentMode === 'milestone' && (
                  <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
                    <h5 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, color: 'var(--text)' }}>{t("submitProposal.milestones.header")}</h5>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {milestones.map((m, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 140px 120px 40px', gap: 12, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontWeight: 800, color: 'var(--brand)' }}>#{idx+1}</span>
                          <input className="pr-input" placeholder={t("submitProposal.milestones.placeholderDesc")} value={m.description} onChange={e => updateMilestone(idx, 'description', e.target.value)} />
                          <input className="pr-input" placeholder={t("submitProposal.milestones.placeholderDate")} value={m.due_date} onChange={e => updateMilestone(idx, 'due_date', e.target.value)} />
                          <input type="number" className="pr-input" placeholder="Summa" value={m.amount} onChange={e => updateMilestone(idx, 'amount', e.target.value)} />
                          <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => removeMilestone(idx)}><Trash2 size={18} /></button>
                        </div>
                      ))}
                    </div>
                    <button className="pr-btn pr-btn-cancel" style={{ width: '100%', borderStyle: 'dashed', marginTop: 16 }} onClick={addMilestone}>
                      <Plus size={16} /> {t("submitProposal.milestones.add")}
                    </button>
                  </div>
                )}

                {paymentMode === 'project' && (
                  <div className="pr-input-group" style={{ maxWidth: 400 }}>
                    <label>{t("submitProposal.project.priceLabel").replace("($)", `(${job?.currency || 'UZS'})`)}</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand)', fontWeight: 800 }}>
                        {job?.currency === 'USD' ? '$' : job?.currency === 'RUB' ? '₽' : 'UZS'}
                      </div>
                      <input 
                        className="pr-input" 
                        style={{ paddingLeft: job?.currency === 'UZS' ? 52 : 44, fontSize: 20, fontWeight: 800, color: 'var(--brand)' }}
                        type="number" 
                        value={projectPrice} 
                        onChange={e => setProjectPrice(e.target.value)}
                        placeholder={t("submitProposal.project.placeholder")}
                      />
                    </div>
                  </div>
                )}

                <div className="pr-fee-box">
                  <div className="pr-fee-line">
                    <div className="pr-fee-label">
                      <strong>{t("submitProposal.fee.totalBalance")}</strong>
                      <span>{t("submitProposal.fee.totalDesc")}</span>
                    </div>
                    <div className="pr-fee-value"><Price amount={totalPrice} currency={job?.currency} /></div>
                  </div>
                  <div className="pr-fee-line">
                    <div className="pr-fee-label">
                      <strong>{t("submitProposal.fee.serviceFee")}</strong>
                      <span>{t("submitProposal.fee.serviceDesc")}</span>
                    </div>
                    <div className="pr-fee-value" style={{ color: '#ef4444' }}>-<Price amount={serviceFee} currency={job?.currency} /></div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
                  <div className="pr-fee-line pr-fee-total">
                    <div className="pr-fee-label">
                      <strong>{t("submitProposal.fee.receive")}</strong>
                      <span>{t("submitProposal.fee.receiveDesc")}</span>
                    </div>
                    <div className="pr-fee-value"><Price amount={youReceive} currency={job?.currency} /></div>
                  </div>
                </div>
              </div>
            </section>

            {/* DURATION */}
            <section className="pr-card">
              <div className="pr-card-header">
                <h2 className="pr-card-title">{t("submitProposal.sections.duration")}</h2>
              </div>
              <div className="pr-card-body">
                <div className="pr-input-group" style={{ maxWidth: 450 }}>
                  <label>{t("submitProposal.duration.label")}</label>
                  <select className="pr-select" value={duration} onChange={e => setDuration(e.target.value)}>
                    <option value="">{t("submitProposal.duration.placeholder")}</option>
                    <option value="1 oydan kam">{t("submitProposal.duration.less1Month")}</option>
                    <option value="1-3 oy">{t("submitProposal.duration.1To3Months")}</option>
                    <option value="3-6 oy">{t("submitProposal.duration.3To6Months")}</option>
                    <option value="6 oydan ko'p">{t("submitProposal.duration.more6Months")}</option>
                  </select>
                </div>
              </div>
            </section>

            {/* ADDITIONAL */}
            <section className="pr-card">
              <div className="pr-card-header">
                <h2 className="pr-card-title">{t("submitProposal.sections.additional")}</h2>
              </div>
              <div className="pr-card-body">
                <div className="pr-input-group">
                  <label>{t("submitProposal.additional.coverLetter")} <span>*</span></label>
                  <textarea 
                    className="pr-textarea"
                    rows={8}
                    placeholder={t("submitProposal.additional.placeholder")}
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                  />
                </div>
                
                <div className="pr-input-group">
                  <label>{t("submitProposal.additional.attachments")}</label>
                  <div style={{ border: '2px dashed var(--border)', padding: 48, borderRadius: 20, textAlign: 'center', cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--muted)' }}>
                    <FileText size={32} style={{ marginBottom: 12, marginInline: 'auto' }} />
                    <p style={{ fontWeight: 700, color: 'var(--text-2)' }}>{t("submitProposal.additional.uploadDesc")}</p>
                    <small>{t("submitProposal.additional.uploadLimit")}</small>
                  </div>
                </div>
              </div>
            </section>

            <div style={{ display: 'flex', gap: 20, marginTop: 48 }}>
              <button className="pr-btn pr-btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="spin" size={20} /> : t("submitProposal.actions.submit")}
              </button>
              <button className="pr-btn pr-btn-cancel" onClick={() => navigate(-1)}>
                {t("submitProposal.actions.cancel")}
              </button>
            </div>

          </div>

          {/* SIDEBAR */}
          <aside className="pr-sidebar">
             <div className="pr-sidebar-sticky">
                <div className="pr-security">
                   <Lock size={24} />
                   <div>
                     <strong>{t("submitProposal.sidebar.protectionTitle")}</strong>
                     <p>{t("submitProposal.sidebar.protectionDesc")}</p>
                   </div>
                </div>

                <div className="pr-quick-stats">
                   <div className="pr-stat-row">
                     <span>{t("submitProposal.sidebar.jobType")}</span>
                     <strong>{job?.job_type === 'hourly' ? t("findWork.projectCard.hourly") : t("findWork.projectCard.fixed")}</strong>
                   </div>
                   <div className="pr-stat-row">
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
