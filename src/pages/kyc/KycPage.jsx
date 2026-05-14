import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Upload,
  ArrowLeft,
  Clock,
  FileText,
  Camera,
  X,
  ChevronRight,
  Smartphone,
  RefreshCw,
  Wifi,
} from "lucide-react";
import { submitKyc, getKycStatus, createFaceSession, getFaceSessionStatus } from "../../api/kyc";
import { uploadImage } from "../../api/common";
import { getSocket } from "../../hooks/useSocket";
import "./kyc.css";

const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api\/?$/, "");

export default function KycPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [kycData, setKycData]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [step, setStep]         = useState(1); // 1=intro, 2=form, 3=success
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");

  // ── QR Face session state ──────────────────────────────────
  const [faceSession, setFaceSession]   = useState(null); // { token, mobileUrl, qrDataUrl, expiresAt }
  const [faceStatus, setFaceStatus]     = useState("idle"); // idle | loading | waiting | completed | expired | error
  const [faceVerified, setFaceVerified] = useState(false);
  const facePollingRef = useRef(null);

  // ── Form state ─────────────────────────────────────────────
  const [form, setForm] = useState({
    document_type: "passport",
    document_front_url: "",
    document_back_url: "",
    selfie_url: "",
    full_name: "",
    date_of_birth: "",
    document_number: "",
    country: "Uzbekistan",
  });
  const [uploading, setUploading] = useState({ front: false, back: false, selfie: false });

  // ── Socket.io: telefon selfie yuborishini kutish ───────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (data) => {
      setFaceVerified(true);
      setFaceStatus("completed");
      setForm((prev) => ({ ...prev, selfie_url: data.selfie_url || prev.selfie_url }));
      clearInterval(facePollingRef.current);
    };

    socket.on("kyc_face_completed", handler);
    return () => socket.off("kyc_face_completed", handler);
  }, []);

  // ── KYC status fetch ───────────────────────────────────────
  useEffect(() => {
    getKycStatus()
      .then((res) => { if (res?.data) setKycData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Cleanup polling on unmount ─────────────────────────────
  useEffect(() => () => clearInterval(facePollingRef.current), []);

  // ── QR yaratish ────────────────────────────────────────────
  const startFaceSession = useCallback(async () => {
    setFaceStatus("loading");
    setFaceSession(null);

    const res = await createFaceSession();
    if (!res?.success) {
      setFaceStatus("error");
      return;
    }

    setFaceSession(res.data);
    setFaceStatus("waiting");

    // Polling: har 4 soniyada session holatini tekshiramiz
    clearInterval(facePollingRef.current);
    facePollingRef.current = setInterval(async () => {
      const statusRes = await getFaceSessionStatus(res.data.token);
      if (statusRes?.data?.status === "completed") {
        setFaceVerified(true);
        setFaceStatus("completed");
        if (statusRes.data.selfie_url) {
          setForm((prev) => ({ ...prev, selfie_url: statusRes.data.selfie_url }));
        }
        clearInterval(facePollingRef.current);
      }
      // Muddatni tekshirish
      if (Date.now() > res.data.expiresAt) {
        setFaceStatus("expired");
        clearInterval(facePollingRef.current);
      }
    }, 4000);
  }, []);

  // ── Hujjat upload ──────────────────────────────────────────
  const handleUpload = async (field, file) => {
    if (!file) return;
    const key = field === "document_front_url" ? "front" : field === "document_back_url" ? "back" : "selfie";
    setUploading((p) => ({ ...p, [key]: true }));
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await uploadImage(fd);
      const url = res?.data?.url || res?.url || "";
      if (url) setForm((p) => ({ ...p, [field]: url }));
    } catch {
      setError("Fayl yuklashda xato.");
    } finally {
      setUploading((p) => ({ ...p, [key]: false }));
    }
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.document_front_url) { setError("Hujjat old tomonini yuklab qo'ying."); return; }
    if (!form.full_name.trim())   { setError("To'liq ismingizni kiriting."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await submitKyc(form);
      if (res?.success) setStep(3);
      else setError(res?.message || "Xato yuz berdi.");
    } catch (err) {
      setError(err?.response?.data?.message || "So'rov yuborishda xato.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── QR countdown ──────────────────────────────────────────
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!faceSession?.expiresAt || faceStatus !== "waiting") return;
    const iv = setInterval(() => {
      const secs = Math.max(0, Math.floor((faceSession.expiresAt - Date.now()) / 1000));
      setRemaining(secs);
      if (secs === 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [faceSession, faceStatus]);

  // ── Upload box component ───────────────────────────────────
  const DocumentUploadBox = ({ field, label, icon, required }) => {
    const key = field === "document_front_url" ? "front" : field === "document_back_url" ? "back" : "selfie";
    const isUp = uploading[key];
    const url  = form[field];
    return (
      <div className="kyc-upload-box">
        <label className="kyc-upload-label">
          {label} {required && <span className="kyc-required">*</span>}
        </label>
        <div className={`kyc-upload-area ${url ? "has-file" : ""}`}
             onClick={() => document.getElementById(`kyc-file-${field}`).click()}>
          {isUp ? (
            <div className="kyc-upload-loading"><div className="kyc-spinner" /><span>Yuklanmoqda...</span></div>
          ) : url ? (
            <div className="kyc-upload-preview">
              <img src={url.startsWith("http") ? url : `${BACKEND}${url}`} alt={label} className="kyc-preview-img" />
              <button type="button" className="kyc-remove-img"
                      onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, [field]: "" })); }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="kyc-upload-placeholder">
              {icon}<span>Rasm yuklash uchun bosing</span><small>JPG, PNG, max 5MB</small>
            </div>
          )}
        </div>
        <input type="file" id={`kyc-file-${field}`} accept="image/*" style={{ display: "none" }}
               onChange={(e) => handleUpload(field, e.target.files[0])} />
      </div>
    );
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <div className="kyc-page">
      <div className="kyc-loading"><div className="kyc-spinner large" /><p>Yuklanmoqda...</p></div>
    </div>
  );

  // ── Already verified ───────────────────────────────────────
  if (kycData?.is_kyc_verified) return (
    <div className="kyc-page">
      <div className="kyc-container">
        <div className="kyc-card kyc-success-card">
          <div className="kyc-success-icon verified"><CheckCircle size={56} /></div>
          <h1 className="kyc-success-title">Hisobingiz tasdiqlangan!</h1>
          <p className="kyc-success-desc">Profilingizda <strong>✓ Tasdiqlangan</strong> badge ko'rinmoqda.</p>
          <div className="kyc-verified-badge-preview"><CheckCircle size={18} /><span>Tasdiqlangan</span></div>
          <button className="kyc-btn-primary" onClick={() => navigate("/my-profile")}>
            <ArrowLeft size={16} /> Profilga qaytish
          </button>
        </div>
      </div>
    </div>
  );

  // ── Pending ────────────────────────────────────────────────
  if (kycData?.kyc_status === "pending") return (
    <div className="kyc-page">
      <div className="kyc-container">
        <div className="kyc-card kyc-pending-card">
          <div className="kyc-success-icon pending"><Clock size={48} /></div>
          <h1 className="kyc-success-title">Ko'rib chiqilmoqda</h1>
          <p className="kyc-success-desc">1-3 ish kuni ichida natija bildiriladi.</p>
          <div className="kyc-submitted-at">
            Yuborilgan: {kycData?.kyc_submitted_at ? new Date(kycData.kyc_submitted_at).toLocaleDateString("uz-UZ") : "—"}
          </div>
          <button className="kyc-btn-outline" onClick={() => navigate("/my-profile")}>
            <ArrowLeft size={16} /> Profilga qaytish
          </button>
        </div>
      </div>
    </div>
  );

  const isRejected = kycData?.kyc_status === "rejected";

  return (
    <div className="kyc-page">
      <div className="kyc-container">

        {/* ─── Step 1: Intro ─────────────────────────────── */}
        {step === 1 && (
          <div className="kyc-card">
            <button className="kyc-back-btn" onClick={() => navigate("/my-profile")}>
              <ArrowLeft size={16} /> Orqaga
            </button>
            <div className="kyc-intro-icon"><Shield size={48} /></div>
            <h1 className="kyc-title">Shaxsiy ma'lumotlarni tasdiqlash (KYC)</h1>
            <p className="kyc-subtitle">
              Hisobingizni tasdiqlash orqali "✓ Tasdiqlangan" badge oling va mijozlar ishonchini qozonig.
            </p>

            {isRejected && (
              <div className="kyc-alert kyc-alert-danger">
                <AlertCircle size={18} />
                <div>
                  <strong>So'rovingiz rad etildi</strong>
                  <p>{kycData?.kyc_reject_reason || "Sababsiz rad etildi."}</p>
                  <small>Iltimos, to'g'ri hujjatlar bilan qayta urinib ko'ring.</small>
                </div>
              </div>
            )}

            <div className="kyc-steps-preview">
              {[
                { icon: <FileText size={20} />, label: "Hujjat yuklash" },
                { icon: <Smartphone size={20} />, label: "QR orqali selfie" },
                { icon: <CheckCircle size={20} />, label: "Admin tasdiqlaydi" },
                { icon: <Shield size={20} />, label: "Badge olasiz" },
              ].map((s, i) => (
                <div key={i} className="kyc-step-item">
                  <div className="kyc-step-num">{i + 1}</div>
                  <div className="kyc-step-icon">{s.icon}</div>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="kyc-benefits">
              <h3>Nima beradi?</h3>
              <ul>
                <li><CheckCircle size={16} /> Profilida "✓ Tasdiqlangan" badge</li>
                <li><CheckCircle size={16} /> Mijozlar ko'proq ishonadi</li>
                <li><CheckCircle size={16} /> Qidiruv natijalarida yuqori o'rin</li>
                <li><CheckCircle size={16} /> Premium xizmatlarga kirish imkoniyati</li>
              </ul>
            </div>

            <button className="kyc-btn-primary" onClick={() => setStep(2)}>
              Tasdiqlashni boshlash <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ─── Step 2: Form ──────────────────────────────── */}
        {step === 2 && (
          <div className="kyc-card kyc-form-card">
            <button className="kyc-back-btn" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Orqaga
            </button>
            <h2 className="kyc-form-title">Hujjat ma'lumotlari</h2>

            {error && (
              <div className="kyc-alert kyc-alert-danger">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Form inputs */}
            <div className="kyc-form-grid">
              <div className="kyc-form-group">
                <label>Hujjat turi <span className="kyc-required">*</span></label>
                <select className="kyc-select" value={form.document_type}
                        onChange={(e) => setForm((p) => ({ ...p, document_type: e.target.value }))}>
                  <option value="passport">Pasport</option>
                  <option value="id_card">ID karta</option>
                  <option value="driver_license">Haydovchilik guvohnomasi</option>
                </select>
              </div>
              <div className="kyc-form-group">
                <label>To'liq ism (hujjatdagidek) <span className="kyc-required">*</span></label>
                <input type="text" className="kyc-input" placeholder="Jasur Jasurov"
                       value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div className="kyc-form-group">
                <label>Hujjat raqami</label>
                <input type="text" className="kyc-input" placeholder="AB 1234567"
                       value={form.document_number} onChange={(e) => setForm((p) => ({ ...p, document_number: e.target.value }))} />
              </div>
              <div className="kyc-form-group">
                <label>Tug'ilgan sana</label>
                <input type="date" className="kyc-input"
                       value={form.date_of_birth} onChange={(e) => setForm((p) => ({ ...p, date_of_birth: e.target.value }))} />
              </div>
              <div className="kyc-form-group">
                <label>Mamlakat</label>
                <select className="kyc-select" value={form.country}
                        onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}>
                  <option value="Uzbekistan">O'zbekiston</option>
                  <option value="Kazakhstan">Qozog'iston</option>
                  <option value="Russia">Rossiya</option>
                  <option value="Turkey">Turkiya</option>
                  <option value="UAE">BAA</option>
                  <option value="USA">AQSH</option>
                  <option value="Other">Boshqa</option>
                </select>
              </div>
            </div>

            {/* Document uploads */}
            <div className="kyc-uploads-grid">
              <DocumentUploadBox field="document_front_url" label="Hujjat old tomoni" icon={<FileText size={32} />} required />
              <DocumentUploadBox field="document_back_url" label="Hujjat orqa tomoni" icon={<FileText size={32} />} />
            </div>

            {/* ── QR Face verification box ─────────────────── */}
            <div className="kyc-face-section">
              <div className="kyc-face-header">
                <Smartphone size={20} />
                <div>
                  <strong>Yuzni telefon orqali tasdiqlash</strong>
                  <small>QR kodni telefon bilan skaner qiling va selfie tushiring</small>
                </div>
                {faceVerified && <span className="kyc-face-done">✅ Tasdiqlandi</span>}
              </div>

              {/* IDLE */}
              {faceStatus === "idle" && (
                <button className="kyc-qr-trigger" onClick={startFaceSession}>
                  <Camera size={18} /> QR Kod yaratish
                </button>
              )}

              {/* LOADING */}
              {faceStatus === "loading" && (
                <div className="kyc-qr-loading">
                  <div className="kyc-spinner" /> QR yaratilmoqda...
                </div>
              )}

              {/* WAITING — QR ko'rsatish */}
              {faceStatus === "waiting" && faceSession && (
                <div className="kyc-qr-panel">
                  <div className="kyc-qr-left">
                    {faceSession.qrDataUrl ? (
                      <img src={faceSession.qrDataUrl} alt="QR Code" className="kyc-qr-img" />
                    ) : (
                      <div className="kyc-qr-fallback">
                        <span>QR paket o'rnatilmagan</span>
                        <a href={faceSession.mobileUrl} target="_blank" rel="noreferrer" className="kyc-qr-link">
                          Linkni ochish →
                        </a>
                      </div>
                    )}
                    <div className="kyc-qr-timer">
                      <Clock size={13} />
                      {remaining !== null ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")} qoldi` : "..."}
                    </div>
                  </div>
                  <div className="kyc-qr-right">
                    <div className="kyc-qr-step"><span className="kyc-qr-num">1</span> Telefon kamerasini oching</div>
                    <div className="kyc-qr-step"><span className="kyc-qr-num">2</span> QR kodni skaner qiling</div>
                    <div className="kyc-qr-step"><span className="kyc-qr-num">3</span> Selfie tushiring</div>
                    <div className="kyc-qr-step"><span className="kyc-qr-num">4</span> Sahifa avtomatik yangilanadi</div>
                    <div className="kyc-qr-waiting">
                      <Wifi size={14} /> Telefondan signal kutilmoqda...
                    </div>
                    <button className="kyc-qr-refresh" onClick={startFaceSession}>
                      <RefreshCw size={13} /> Yangilash
                    </button>
                  </div>
                </div>
              )}

              {/* COMPLETED */}
              {faceStatus === "completed" && (
                <div className="kyc-face-verified">
                  <CheckCircle size={22} /> Yuzingiz muvaffaqiyatli tasdiqlandi!
                </div>
              )}

              {/* EXPIRED */}
              {faceStatus === "expired" && (
                <div className="kyc-face-expired">
                  <Clock size={16} /> Muddat tugadi.
                  <button onClick={startFaceSession} className="kyc-qr-refresh"><RefreshCw size={13} /> Qayta yaratish</button>
                </div>
              )}

              {/* ERROR */}
              {faceStatus === "error" && (
                <div className="kyc-face-expired">
                  <AlertCircle size={16} /> QR yaratishda xato.
                  <button onClick={startFaceSession} className="kyc-qr-refresh"><RefreshCw size={13} /> Qayta urinish</button>
                </div>
              )}
            </div>

            <div className="kyc-note">
              <Shield size={14} />
              Ma'lumotlaringiz xavfsiz saqlanadi va faqat tekshirish maqsadida ishlatiladi.
            </div>

            <button className="kyc-btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><div className="kyc-spinner small" /> Yuborilmoqda...</> : <>So'rov yuborish <ChevronRight size={16} /></>}
            </button>
          </div>
        )}

        {/* ─── Step 3: Success ───────────────────────────── */}
        {step === 3 && (
          <div className="kyc-card kyc-success-card">
            <div className="kyc-success-icon submitted"><Clock size={56} /></div>
            <h1 className="kyc-success-title">So'rov yuborildi!</h1>
            <p className="kyc-success-desc">
              KYC hujjatlaringiz qabul qilindi. 1-3 ish kuni ichida ko'rib chiqiladi.
            </p>
            <div className="kyc-timeline">
              <div className="kyc-timeline-item active"><CheckCircle size={20} /><span>Hujjatlar yuborildi</span></div>
              <div className="kyc-timeline-item"><Clock size={20} /><span>Admin ko'rib chiqmoqda</span></div>
              <div className="kyc-timeline-item"><Shield size={20} /><span>"✓ Tasdiqlangan" badge beriladi</span></div>
            </div>
            <button className="kyc-btn-primary" onClick={() => navigate("/my-profile")}>
              <ArrowLeft size={16} /> Profilga qaytish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
