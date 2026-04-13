import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Award
} from "lucide-react";
import "./Proposal.css";

export default function Proposal() {
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
    if (!coverLetter.trim()) { notify("Murojaat xatingizni yozing!", "error"); return; }
    if (totalPrice <= 0) { notify("Narxni to'g'ri ko'rsating!", "error"); return; }

    setLoading(true);
    const payload = {
      job_id: jobId,
      cover_letter: coverLetter,
      proposed_price: totalPrice,
      proposed_duration: duration, // Actually duration can be complex string now
      milestones: paymentMode === "milestone" ? milestones : [],
      payment_mode: paymentMode
    };

    const res = await createProposal(payload);
    setLoading(false);

    if (res?.success === false) {
      notify(res?.message || "Xato yuz berdi", "error");
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="proposal-page">
        <div className="proposal-success">
          <div className="proposal-success__icon">
            <CheckCircle2 size={64} color="#2563eb" />
          </div>
          <h2 className="proposal-success__title">Taklifingiz muvaffaqiyatli yuborildi!</h2>
          <p className="proposal-success__desc">
            Sizning taklifingiz mijozga yetkazildi. Mijoz loyihani ko'rib chiqqach, chat orqali siz bilan bog'lanishi mumkin.
          </p>
          <div className="proposal-success__actions">
            <button className="proposal-btn proposal-btn--primary" onClick={() => navigate("/my-proposals")}>
              Mening takliflarim
            </button>
            <button className="proposal-btn proposal-btn--outline" onClick={() => navigate("/find-work")}>
              Ish qidirishda davom etish
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <ArrowLeft size={18} /> Orqaga
          </button>
          <h1 className="proposal-title">Taklif yuborish (Submit a proposal)</h1>
        </header>

        <div className="proposal-grid">
          
          {/* Main Content */}
          <div className="proposal-main-content">

            {/* JOB DETAILS CARD */}
            <section className="proposal-card">
              <div className="proposal-card__header">
                <h2 className="proposal-card__title">Loyiha tafsilotlari (Job details)</h2>
              </div>
              <div className="proposal-card__body">
                {jobLoading ? (
                  <div className="proposal-skeleton-text">Yuklanmoqda...</div>
                ) : (
                  <div className="proposal-job-summary">
                    <h3 className="job-title-large">{job?.title}</h3>
                    <div className="job-meta-pills">
                      <span className="job-pill">{job?.category_name || "Dasturlash"}</span>
                      <span className="job-pill-date">Yuborilgan vaqti: {new Date(job?.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="job-desc-preview">
                      <p>{job?.description}</p>
                    </div>

                    <div className="job-specs">
                      <div className="spec-item">
                        <Award size={18} />
                        <div>
                          <strong>{job?.experience_level || 'Ekspert'}</strong>
                          <span>Tajriba darajasi</span>
                        </div>
                      </div>
                      <div className="spec-item">
                        <DollarSign size={18} />
                        <div>
                          <strong>{job?.job_type === 'hourly' ? `$${job?.budget_min}-${job?.budget_max}` : `$${job?.budget_max}`}</strong>
                          <span>{job?.job_type === 'hourly' ? 'Soatbay narx' : 'Belgilangan narx'}</span>
                        </div>
                      </div>
                      <div className="spec-item">
                        <Calendar size={18} />
                        <div>
                          <strong>1-3 oy</strong>
                          <span>Kutilayotgan davr</span>
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
                <h2 className="proposal-card__title">Shartlar (Terms)</h2>
              </div>
              <div className="proposal-card__body">
                <div className="payment-mode-shaper">
                  <h4 className="payment-mode-title">Qanday to'lov olishni xohlaysiz?</h4>
                  
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
                        <strong>Bosqichma-bosqich (By milestone)</strong>
                        <p>Loyihani kichik bo'laklarga bo'ling. Har bir bo'lim yakunlangach haq olasiz.</p>
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
                        <strong>Loyiha yakunida (By project)</strong>
                        <p>Loyiha to'liq topshirilgandan so'ng umumiy summani bir marta qabul qilasiz.</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Milestone Editor */}
                {paymentMode === 'milestone' && (
                  <div className="milestones-editor">
                    <h5 className="editor-title">Nechta bosqichda bajarmoqchisiz?</h5>
                    <div className="milestone-table">
                      <div className="milestone-table-header">
                        <div className="col-desc">Tavsif (Description)</div>
                        <div className="col-date">Muddati (Due date)</div>
                        <div className="col-amt">Narxi ($)</div>
                        <div className="col-action"></div>
                      </div>
                      {milestones.map((m, idx) => (
                        <div className="milestone-row" key={idx}>
                          <div className="col-idx">{idx + 1}</div>
                          <div className="col-desc">
                            <input 
                              type="text" 
                              placeholder="Masalan: Dizaynni yakunlash" 
                              value={m.description}
                              onChange={e => updateMilestone(idx, 'description', e.target.value)}
                            />
                          </div>
                          <div className="col-date">
                            <input 
                              type="text" 
                              placeholder="Masalan: 10-iyun" 
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
                      <Plus size={16} /> Keyingi bosqichni qo'shish
                    </button>
                  </div>
                )}

                {/* Project Price input */}
                {paymentMode === 'project' && (
                  <div className="project-price-field">
                    <label>Loyiha uchun umumiy narx ($)</label>
                    <div className="price-input-wrap">
                      <DollarSign size={18} />
                      <input 
                        type="number" 
                        value={projectPrice} 
                        onChange={e => setProjectPrice(e.target.value)}
                        placeholder="Masalan: 500"
                      />
                    </div>
                  </div>
                )}

                <div className="fee-calculator">
                  <div className="fee-line">
                    <div className="fee-label">
                      <strong>Loyihaning umumiy narxi</strong>
                      <span>Hammasi bo'lib</span>
                    </div>
                    <div className="fee-value">${totalPrice.toLocaleString()}</div>
                  </div>
                  <div className="fee-line">
                    <div className="fee-label">
                      <strong>Xizmat haqi (Service Fee) 10%</strong>
                      <span>Platforma xizmati uchun</span>
                    </div>
                    <div className="fee-value">-${serviceFee.toLocaleString()}</div>
                  </div>
                  <hr className="fee-divider" />
                  <div className="fee-line fee-line-total">
                    <div className="fee-label">
                      <strong>Siz qabul qiladigan summa</strong>
                      <span>Xizmat haqidan tashqari</span>
                    </div>
                    <div className="fee-value">${youReceive.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* DURATION SECTION */}
            <section className="proposal-card">
              <div className="proposal-card__header">
                <h2 className="proposal-card__title">Muddat (Duration)</h2>
              </div>
              <div className="proposal-card__body">
                <div className="duration-field">
                  <label>Loyiha qancha vaqt ichida bajariladi?</label>
                  <div className="input-with-icon">
                    <Clock size={18} />
                    <select value={duration} onChange={e => setDuration(e.target.value)}>
                      <option value="">Muddatni tanlang</option>
                      <option value="1 oydan kam">1 oydan kam</option>
                      <option value="1-3 oy">1-3 oy</option>
                      <option value="3-6 oy">3-6 oy</option>
                      <option value="6 oydan ko'p">6 oydan ko'p</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* ADDITIONAL DETAILS SECTION */}
            <section className="proposal-card">
              <div className="proposal-card__header">
                <h2 className="proposal-card__title">Qo'shimcha ma'lumotlar (Additional details)</h2>
              </div>
              <div className="proposal-card__body">
                <div className="cover-letter-field">
                  <label>Murojaat xati (Cover Letter) <span>*</span></label>
                  <textarea 
                    rows={8}
                    placeholder="O'z tajribangiz va bu loyiha uchun nimalar qila olishingizni yozing..."
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                  />
                </div>
                
                <div className="attachments-field">
                  <label>Fayl biriktirish (Attachments)</label>
                  <div className="upload-placeholder">
                    <FileText size={24} />
                    <p>Fayllarni bu yerga tashlang yoki tanlang</p>
                    <small>Maksimal 10 ta fayl, har biri 25MB gacha</small>
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
                {loading ? <><Loader2 className="spin" size={18} /> Yuborilmoqda...</> : "Taklif yuborish"}
              </button>
              <button 
                type="button" 
                className="proposal-btn-cancel"
                onClick={() => navigate(-1)}
              >
                Bekor qilish
              </button>
            </div>

          </div>

          {/* Sidebar (Brief Summary) */}
          <aside className="proposal-sidebar">
             <div className="sidebar-sticky">
                <div className="security-shield">
                   <Lock size={20} />
                   <div>
                     <strong>Loyihani himoyalash</strong>
                     <p>To'lovlar platforma tomonidan nazorat qilinadi.</p>
                   </div>
                </div>

                <div className="quick-stats">
                   <div className="stat-row">
                     <span>Loyihaning turi</span>
                     <strong>Fixed-price</strong>
                   </div>
                   <div className="stat-row">
                     <span>Tajriba darajasi</span>
                     <strong>Ekspert</strong>
                   </div>
                </div>
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
