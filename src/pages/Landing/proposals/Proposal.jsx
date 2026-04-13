import { useEffect, useState } from "react";
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
  Loader2
} from "lucide-react";
import "./Proposal.css";

export default function Proposal() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [form, setForm] = useState({
    cover_letter: "",
    proposed_price: "",
    proposed_duration: ""
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [submitted, setSubmitted] = useState(false);

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
      });
    }
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cover_letter.trim()) { notify("Qoplov xat yozing!", "error"); return; }
    if (!form.proposed_price) { notify("Narx kiriting!", "error"); return; }

    setLoading(true);
    const res = await createProposal({ project_id: jobId, ...form });
    setLoading(false);

    if (res?.success === false) {
      notify(res?.message || "Xato yuz berdi", "error");
    } else {
      setSubmitted(true);
    }
  };

  // Budget display
  const budgetText = () => {
    if (!job) return "";
    if (job.job_type === "hourly") {
      return `$${Number(job.budget_min || 0).toLocaleString()} – $${Number(job.budget_max || 0).toLocaleString()}/soat`;
    }
    return job.budget_max ? `$${Number(job.budget_max).toLocaleString()}` : "";
  };

  if (submitted) {
    return (
      <div className="proposal-page">
        <div className="proposal-success">
          <div className="proposal-success__icon">
            <CheckCircle2 size={48} color="#10b981" />
          </div>
          <h2 className="proposal-success__title">Taklifingiz yuborildi! 🎉</h2>
          <p className="proposal-success__desc">
            Mijoz sizning taklifingizni ko'rib chiqadi va tez orada bog'lanadi.
          </p>
          <div className="proposal-success__actions">
            <button
              className="proposal-btn proposal-btn--primary"
              onClick={() => navigate("/my-proposals")}
            >
              <FileText size={16} /> Mening takliflarim
            </button>
            <button
              className="proposal-btn proposal-btn--outline"
              onClick={() => navigate("/find-work")}
            >
              Yana ish topish
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

      {/* Back */}
      <button className="proposal-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="proposal-layout">

        {/* LEFT: Form */}
        <div className="proposal-main">
          <div className="proposal-main__header">
            <Send size={24} color="#2563eb" />
            <div>
              <h1 className="proposal-main__title">Taklif yuborish</h1>
              <p className="proposal-main__sub">
                Mijozga o'zingizni tanitib, nima qila olishingizni ko'rsating
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="proposal-form">

            {/* Cover Letter */}
            <div className="proposal-field">
              <label className="proposal-label">
                Qoplov xat (Cover Letter)
                <span className="proposal-req">*</span>
              </label>
              <p className="proposal-hint">
                O'z tajribangiz, ushbu ish uchun nima qila olishingiz va nima uchun siz eng yaxshi tanlov ekanligingizni yozing.
              </p>
              <textarea
                value={form.cover_letter}
                onChange={e => setForm(p => ({ ...p, cover_letter: e.target.value }))}
                placeholder="Salom, men bu loyiha bo'yicha... tajribam bor va... qila olaman. Xususan..."
                rows={10}
                className="proposal-textarea"
                required
              />
              <div className="proposal-char-count">
                {form.cover_letter.length} / 5000 belgi
              </div>
            </div>

            {/* Price & Duration */}
            <div className="proposal-row">
              <div className="proposal-field">
                <label className="proposal-label">
                  Taklif narxi ($)
                  <span className="proposal-req">*</span>
                </label>
                <div className="proposal-input-wrap">
                  <DollarSign size={16} className="proposal-input-icon" />
                  <input
                    type="number"
                    min="1"
                    value={form.proposed_price}
                    onChange={e => setForm(p => ({ ...p, proposed_price: e.target.value }))}
                    placeholder="Masalan: 500"
                    className="proposal-input proposal-input--icon"
                    required
                  />
                </div>
              </div>
              <div className="proposal-field">
                <label className="proposal-label">Bajarish muddati</label>
                <div className="proposal-input-wrap">
                  <Clock size={16} className="proposal-input-icon" />
                  <input
                    type="text"
                    value={form.proposed_duration}
                    onChange={e => setForm(p => ({ ...p, proposed_duration: e.target.value }))}
                    placeholder="Masalan: 2 hafta, 1 oy"
                    className="proposal-input proposal-input--icon"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="proposal-btn proposal-btn--primary proposal-btn--full"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={18} className="proposal-spin" /> Yuborilmoqda...</>
              ) : (
                <><Send size={18} /> Taklif yuborish</>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT: Job Info */}
        <aside className="proposal-aside">
          {jobLoading ? (
            <div className="proposal-aside__loading">
              <Loader2 size={24} className="proposal-spin" />
            </div>
          ) : job ? (
            <div className="proposal-job-card">
              <div className="proposal-job-card__badge">
                <Briefcase size={14} /> {job.job_type === "hourly" ? "Soatbay" : "Belgilangan narx"}
              </div>
              <h2 className="proposal-job-card__title">{job.title}</h2>
              <p className="proposal-job-card__desc">
                {job.description?.slice(0, 200)}{job.description?.length > 200 ? "..." : ""}
              </p>

              {budgetText() && (
                <div className="proposal-job-card__budget">
                  <DollarSign size={16} />
                  <span>{budgetText()}</span>
                </div>
              )}

              {/* Skills */}
              {(() => {
                let skills = [];
                try {
                  skills = typeof job.required_skills === "string"
                    ? JSON.parse(job.required_skills)
                    : job.required_skills || [];
                } catch (e) {}
                return skills.length > 0 ? (
                  <div className="proposal-job-card__skills">
                    {skills.slice(0, 6).map((s, i) => (
                      <span key={i} className="proposal-skill-tag">{s}</span>
                    ))}
                  </div>
                ) : null;
              })()}

              <div className="proposal-job-card__client">
                <CheckCircle2 size={14} color="#2563eb" />
                <span>
                  {job.client_first_name} {job.client_last_name}
                </span>
              </div>
            </div>
          ) : null}

          {/* Tips */}
          <div className="proposal-tips">
            <h4 className="proposal-tips__title">💡 Maslahatlar</h4>
            <ul className="proposal-tips__list">
              <li>Mijozga ism bilan murojaat qiling</li>
              <li>Ushbu loyihadagi o'xshash tajribangizni aytib o'ting</li>
              <li>Loyihani qanday bajarishingizni qisqacha tushuntiring</li>
              <li>Narxingizni asoslab bering</li>
              <li>Portfeldan namuna havolalarini qo'shing</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
