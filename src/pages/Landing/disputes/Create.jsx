import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { getContractById, createContractDispute } from "../../../api/contracts";
import { uploadFile } from "../../../api/common";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Upload, 
  Trash2, 
  Paperclip, 
  ShieldAlert, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import Price from "../../components/Currency/Price";
import "./disputes.css";

export default function CreateDispute() {
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get("contract");
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  // Form states
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("UZS");
  const [evidenceFiles, setEvidenceFiles] = useState([]); // Array of uploaded URLs
  const [uploading, setUploading] = useState(false);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  useEffect(() => {
    if (!contractId) {
      setLoading(false);
      return;
    }
    const fetchContract = async () => {
      try {
        const res = await getContractById(contractId);
        const cData = res?.data?.contract || res?.contract || res;
        if (cData) {
          setContract(cData);
          setAmount(cData.total_amount || "");
          setCurrency(cData.currency || "UZS");
        }
      } catch (err) {
        console.error(err);
        notify("Shartnoma ma'lumotlarini yuklashda xatolik yuz berdi.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [contractId]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const uploadedUrls = [...evidenceFiles];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await uploadFile(formData);
        if (res?.success && res?.data?.url) {
          uploadedUrls.push(res.data.url);
        } else {
          notify(`"${file.name}" yuklashda xatolik yuz berdi: ${res?.message || "Noma'lum xato"}`, "error");
        }
      } catch (err) {
        notify(`"${file.name}" yuklashda server xatoligi yuz berdi.`, "error");
      }
    }

    setEvidenceFiles(uploadedUrls);
    setUploading(false);
  };

  const removeFile = (indexToRemove) => {
    setEvidenceFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contractId) {
      notify("Shartnoma ID ko'rsatilmagan.", "error");
      return;
    }
    if (!reason.trim() || reason.trim().length < 20) {
      notify("Iltimos, nizo sababini batafsilroq tushuntiring (kamida 20 ta harf).", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        contract_id: contractId,
        reason: reason.trim(),
        amount: amount ? Number(amount) : null,
        currency,
        evidence_files: evidenceFiles,
      };

      const res = await createContractDispute(contractId, payload);
      if (res?.success !== false) {
        notify("Nizo muvaffaqiyatli ochildi! Admin tez orada uni ko'rib chiqadi.");
        setTimeout(() => {
          navigate(`/contracts/${contractId}`);
        }, 1500);
      } else {
        notify(res?.message || "Nizo ochishda xatolik yuz berdi.", "error");
      }
    } catch (err) {
      notify("Nizo ochishda server xatosi yuz berdi.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="disp-container">
        <div className="disp-loader">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!contractId) {
    return (
      <div className="disp-container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <XCircle size={60} style={{ color: "#ef4444", marginBottom: 20 }} />
        <h2>Xatolik</h2>
        <p style={{ color: "var(--muted)" }}>Nizo ochish uchun to'g'ri shartnoma ID si yuborilishi kerak.</p>
        <Link to="/contracts" className="disp-btn-outline" style={{ marginTop: 20, display: "inline-flex" }}>
          Shartnomalarga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="disp-container soft-fade-in">
      {toast.msg && (
        <div className={`disp-toast ${toast.type === "error" ? "error" : "success"}`}>
          {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="disp-back-btn">
          <ArrowLeft size={16} /> Shartnomaga qaytish
        </button>
      </div>

      <div className="disp-layout">
        <div className="disp-form-card glass-card">
          <div className="disp-header">
            <div className="disp-header-icon">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h1 className="disp-title">Yangi Nizo Ochish</h1>
              <p className="disp-subtitle">
                Agar shartnoma bo'yicha kelishmovchilik bo'lsa, nizo oching. Admin uni batafsil ko'rib chiqadi va hal qiladi.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label className="disp-label">Nizo sababi va tafsilotlari</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Iltimos, vaziyatni batafsil tushuntiring. Qanday kelishmovchilik yuz berdi? Nima uchun nizo ochmoqchisiz? (kamida 20 ta belgi)..."
                className="disp-textarea"
                rows={6}
                required
              />
              <span className="disp-hint">Batafsil ma'lumot adminlarga qaror qabul qilishda yordam beradi.</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="disp-label">Da'vo qilinayotgan summa</label>
                <div style={{ position: "relative" }}>
                  <DollarSign size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Summani kiriting"
                    className="disp-input"
                    style={{ paddingLeft: 38 }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="disp-label">Valyuta</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="disp-select"
                >
                  <option value="UZS">UZS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="disp-label">Dalillar va Hujjatlar (Evidence Files)</label>
              <div 
                className="disp-upload-zone"
                onClick={() => document.getElementById("disp-file-input").click()}
              >
                <Upload size={32} style={{ color: "var(--brand)", marginBottom: 12 }} />
                <h3>Fayllarni yuklash</h3>
                <p>Skrinshotlar, shartnoma, chat suratlari yoki hujjatlarni tanlang</p>
                <input
                  id="disp-file-input"
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>

              {uploading && (
                <div style={{ color: "var(--brand)", fontSize: 13, fontWeight: 600, marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="disp-spinner"></span> Fayllar yuklanmoqda...
                </div>
              )}

              {evidenceFiles.length > 0 && (
                <div className="disp-files-list">
                  {evidenceFiles.map((url, idx) => {
                    const filename = url.split("/").pop() || `fayl_${idx + 1}`;
                    return (
                      <div key={idx} className="disp-file-item">
                        <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                          <Paperclip size={14} style={{ flexShrink: 0, color: "var(--brand)" }} />
                          <span style={{ fontSize: 13, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {filename}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="disp-btn-outline"
                style={{ flex: 1 }}
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="disp-btn-primary"
                style={{ flex: 1 }}
                disabled={submitting || uploading}
              >
                {submitting ? "Nizo ochilmoqda..." : "Nizo Ochish"}
              </button>
            </div>
          </form>
        </div>

        {/* Info card side panel */}
        {contract && (
          <div className="disp-info-panel glass-card">
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Shartnoma haqida</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span className="disp-info-label">Sarlavha</span>
                <div className="disp-info-value">{contract.job_title || contract.project_title}</div>
              </div>
              <div>
                <span className="disp-info-label">Umumiy budget</span>
                <div className="disp-info-value amount">
                  <Price amount={contract.total_amount} currency={contract.currency || "UZS"} />
                </div>
              </div>
              <div>
                <span className="disp-info-label">Boshlangan sana</span>
                <div className="disp-info-value">
                  {new Date(contract.created_at || contract.start_date).toLocaleDateString()}
                </div>
              </div>
              <div style={{ background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.2)", borderRadius: 12, padding: 16, marginTop: 12 }}>
                <div style={{ display: "flex", gap: 10, color: "#d97706" }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800 }}>Eslatma</h4>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--text-2)" }}>
                      Nizo ochilganidan so'ng ushbu shartnomadagi barcha harakatlar (milestone topshirish/tasdiqlash) to'xtatiladi. Qaror admin tomonidan qabul qilinguniga qadar mablag'lar escrowda qoladi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
