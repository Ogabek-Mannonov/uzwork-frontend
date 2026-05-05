import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  getContractById, 
  completeContract, 
  cancelContract,
  updateMilestone 
} from "../../../api/contracts";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  DollarSign, 
  Calendar, 
  FileText,
  User,
  ShieldCheck,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { getSocket, onSocketReady, normalizeUserStatus } from "../../../hooks/useSocket";
import Price from "../../components/Currency/Price";
import "./contracts.css";

const STATUS_CONFIG = {
  active:    { class: "cd-status--active", label: "Faol", icon: <Clock size={16} /> },
  completed: { class: "cd-status--completed", label: "Yakunlangan", icon: <CheckCircle size={16} /> },
  cancelled: { class: "cd-status--cancelled", label: "Bekor qilingan", icon: <XCircle size={16} /> },
  disputed:  { class: "cd-status--disputed", label: "Nizo", icon: <AlertCircle size={16} /> },
};

const MILESTONE_STATUS = {
  pending:   { label: "Kutilmoqda", class: "cd-status--pending" },
  submitted: { label: "Ko'rib chiqilmoqda", class: "cd-status--submitted" },
  approved:  { label: "Tasdiqlangan", class: "cd-status--approved" },
  released:  { label: "To'langan", class: "cd-status--released" },
};

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });

  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  }, []);

  const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const avatarSrc = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${BACKEND}${path}`;
  };

  const [partnerStatus, setPartnerStatus] = useState({ isOnline: false, lastSeen: null });

  const PartnerAvatar = ({ src, name }) => {
    const [error, setError] = useState(false);
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    
    if (!src || error) {
      return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div className="cd-partner-ava" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--brand-light, rgba(37, 99, 235, 0.1))", color: "var(--brand, #2563eb)", fontWeight: "bold" }}>
            {initials}
          </div>
          <span className={`cd-status-dot ${partnerStatus.isOnline ? 'online' : 'offline'}`} 
                style={{ position: 'absolute', bottom: -2, right: -2 }}></span>
        </div>
      );
    }

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img 
          src={avatarSrc(src)} 
          alt="" 
          className="cd-partner-ava" 
          onError={() => setError(true)}
        />
        <span className={`cd-status-dot ${partnerStatus.isOnline ? 'online' : 'offline'}`} 
              style={{ position: 'absolute', bottom: -2, right: -2 }}></span>
      </div>
    );
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getContractById(id);
      setData(res?.data || res);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(user);
    } catch (err) {
      notify("Ma'lumotlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => { load(); }, [load]);

  const isClient = data?.contract ? String(currentUser?.id) === String(data.contract.client_id) : false;
  const isFreelancer = data?.contract ? String(currentUser?.id) === String(data.contract.freelancer_id) : false;

  useEffect(() => {
    if (!data?.contract) return;
    const partnerId = isClient ? data.contract.freelancer_id : data.contract.client_id;
    if (!partnerId) return;

    const cleanup = onSocketReady((socket) => {
      socket.emit("checkStatus", partnerId);

      const handleStatus = (data) => {
        const status = normalizeUserStatus(data);
        if (String(status.userId) === String(partnerId)) {
          setPartnerStatus({
            isOnline: status.isOnline,
            lastSeen: status.lastSeen
          });
        }
      };

      socket.on("userStatus", handleStatus);
      return () => socket.off("userStatus", handleStatus);
    });

    return cleanup;
  }, [data?.contract?.id, isClient]);

  const handleMilestoneAction = async (milestoneId, newStatus) => {
    setActionLoading(milestoneId);
    try {
      const res = await updateMilestone(id, { 
        milestone_id: milestoneId, 
        status: newStatus 
      });
      if (res?.success !== false) {
        notify(newStatus === "submitted" ? "Ish ko'rib chiqish uchun yuborildi" : "To'lov tasdiqlandi");
        load();
      } else {
        notify(res?.message || "Xatolik yuz berdi", "error");
      }
    } catch (err) {
      notify("Server xatosi", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleContractAction = async () => {
    const { type } = modal;
    setActionLoading("contract-action");
    try {
      const res = type === "complete" ? await completeContract(id) : await cancelContract(id);
      if (res?.success !== false) {
        notify(type === "complete" ? "Kontrakt muvaffaqiyatli yakunlandi!" : "Kontrakt bekor qilindi");
        setModal({ isOpen: false, type: "", data: null });
        load();
      } else {
        notify(res?.message || "Xatolik yuz berdi", "error");
      }
    } catch (err) {
      notify("Server xatosi", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="cd-container">
      <div className="cd-panel" style={{ height: 600, opacity: 0.5, animation: "pulse 2s infinite" }}></div>
    </div>
  );

  if (!data?.contract) return (
    <div className="cd-container">
      <div style={{ textAlign: "center", padding: 80, background: "var(--surface-2)", borderRadius: 32 }}>
        <XCircle size={64} style={{ color: "#ef4444", marginBottom: 20 }} />
        <h3>Kontrakt topilmadi</h3>
        <button className="cd-btn-premium cd-btn-outline" style={{ marginTop: 20, marginInline: 'auto' }} onClick={() => navigate("/contracts")}>
          Ro'yxatga qaytish
        </button>
      </div>
    </div>
  );

  const { contract, milestones } = data;
  const st = STATUS_CONFIG[contract.status] || STATUS_CONFIG.active;

  return (
    <div className="cd-container">
      {toast.msg && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : "var(--brand)",
          color: "#fff", padding: "16px 24px", borderRadius: 12, fontWeight: 700,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 12
        }}>
          {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {toast.msg}
        </div>
      )}

      <Link to="/contracts" className="cd-back-link">
        <ArrowLeft size={18} /> Orqaga qaytish
      </Link>

      <div className="cd-panel">
        <div className="cd-panel-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span className={`cd-badge ${st.class}`}>
                  {st.icon} <span>{st.label}</span>
                </span>
                <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>#{contract.id}</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 850, margin: 0, color: 'var(--text)' }}>
                {contract.job_title || contract.project_title || "Loyiha sarlavhasi"}
              </h1>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
               <button className="cd-btn-premium cd-btn-outline" onClick={() => navigate(`/messages/${contract.id}`)}>
                 <MessageSquare size={18} /> Chat
               </button>
            </div>
          </div>
        </div>

        <div className="cd-panel-body">
          <div className="cd-meta-grid">
            <div className="cd-meta-card">
              <div className="cd-meta-label">Umumiy Budget</div>
              <div className="cd-meta-value amount"><Price amount={contract.total_amount} currency={contract.currency || 'UZS'} /></div>
            </div>
            
            <div className="cd-meta-card">
              <div className="cd-meta-label">{isClient ? "Mutaxassis" : "Mijoz"}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <PartnerAvatar 
                  src={isClient ? contract.freelancer_avatar_url : contract.client_avatar_url} 
                  name={isClient 
                    ? `${contract.freelancer_first_name || ""} ${contract.freelancer_last_name || ""}`.trim() || contract.freelancer_email
                    : `${contract.client_first_name || ""} ${contract.client_last_name || ""}`.trim() || contract.client_email} 
                />
                <div className="cd-meta-value" style={{ fontSize: 18 }}>
                  {isClient 
                    ? `${contract.freelancer_first_name || ""} ${contract.freelancer_last_name || ""}`.trim() || contract.freelancer_email
                    : `${contract.client_first_name || ""} ${contract.client_last_name || ""}`.trim() || contract.client_email}
                </div>
              </div>
            </div>

            <div className="cd-meta-card">
              <div className="cd-meta-label">Boshlangan Sana</div>
              <div className="cd-meta-value" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Calendar size={18} style={{ color: "var(--brand)" }} />
                {new Date(contract.created_at || contract.start_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="cd-section">
            <h3 className="cd-section-title">
              <FileText size={22} style={{ color: 'var(--brand)' }} /> Loyiha haqida
            </h3>
            <div className="cd-section-content" style={{ color: 'var(--text-2)', lineHeight: '1.8', fontSize: '16px' }}>
              {contract.description || contract.job_description || "Ushbu kontrakt bo'yicha batafsil ma'lumot kiritilmagan."}
            </div>
          </div>

          <div className="cd-section">
            <h3 className="cd-section-title">
              <ShieldCheck size={22} style={{ color: 'var(--brand)' }} /> Ish bosqichlari (Milestones)
            </h3>
            
            <div style={{ display: 'grid', gap: 16 }}>
              {milestones?.length > 0 ? (
                milestones.map((m, idx) => {
                  const mst = MILESTONE_STATUS[m.status] || MILESTONE_STATUS.pending;
                  return (
                    <div key={m.id} className="cd-milestone-item">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: "var(--brand)", background: "rgba(37, 99, 235, 0.1)", padding: "3px 10px", borderRadius: 6 }}>#{idx + 1}</span>
                          <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{m.title}</h4>
                        </div>
                        <div style={{ display: 'flex', gap: 20, fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <DollarSign size={14} style={{ color: 'var(--brand)' }} /> 
                            <Price amount={m.amount} currency={contract.currency || 'UZS'} />
                          </span>
                          <span className={`milestone-status ${mst.class}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                            ● {mst.label}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        {isFreelancer && m.status === "pending" && (
                          <button 
                            className="cd-btn-premium cd-btn-primary" 
                            disabled={actionLoading === m.id}
                            onClick={() => handleMilestoneAction(m.id, "submitted")}
                          >
                            Topshirish
                          </button>
                        )}
                        {isClient && m.status === "submitted" && (
                          <button 
                            className="cd-btn-premium cd-btn-primary" 
                            disabled={actionLoading === m.id}
                            onClick={() => handleMilestoneAction(m.id, "released")}
                          >
                            To'lash
                          </button>
                        )}
                        {(m.status === "released" || m.status === "approved") && (
                          <div style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                            <CheckCircle size={24} /> 
                            <span style={{ fontSize: 14 }}>BAJARILDI</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: 40, textAlign: 'center', background: 'var(--surface-2)', borderRadius: 20 }}>
                  <p style={{ color: "var(--muted)", fontStyle: "italic", margin: 0 }}>Milestone-lar belgilanmagan.</p>
                </div>
              )}
            </div>
          </div>

          {contract.status === "active" && (
            <div className="cd-admin-panel">
              <h4 style={{ fontSize: 18, fontWeight: 850, marginBottom: 8, color: 'var(--text)' }}>Shartnomani boshqarish</h4>
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
                Agar ish to'liq bitgan bo'lsa shartnomani yakunlang. Muammo tug'ilsa bekor qilishingiz yoki nizo ochishingiz mumkin.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {isClient && (
                  <button className="cd-btn-premium cd-btn-primary" onClick={() => setModal({ isOpen: true, type: "complete" })}>
                    <CheckCircle size={18} /> Yakunlash
                  </button>
                )}
                <button className="cd-btn-premium cd-btn-outline" style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }} onClick={() => setModal({ isOpen: true, type: "cancel" })}>
                  <XCircle size={18} /> Bekor qilish
                </button>
                <button className="cd-btn-premium cd-btn-outline" style={{ color: "var(--text)" }} onClick={() => navigate(`/disputes/new?contract=${contract.id}`)}>
                  <AlertCircle size={18} /> Nizo ochish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {modal.isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 10000, display: "flex", 
          alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div className="cd-panel" style={{ maxWidth: 500, width: "100%", padding: 40, textAlign: "center", background: 'var(--surface)' }}>
            <div style={{ 
              width: 80, height: 80, borderRadius: "24px", margin: "0 auto 24px",
              background: modal.type === "complete" ? "rgba(37, 99, 235, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: modal.type === "complete" ? "var(--brand)" : "#ef4444",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {modal.type === "complete" ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 850, marginBottom: 12, color: 'var(--text)' }}>
              {modal.type === "complete" ? "Kontraktni yakunlash" : "Shartnomani bekor qilish"}
            </h3>
            <p style={{ color: "var(--muted)", marginBottom: 32, lineHeight: 1.6 }}>
              {modal.type === "complete" 
                ? "Haqiqatdan ham shartnomani yakunlamoqchimisiz? Qolgan barcha escrow mablag'lari freelancerga o'tkaziladi."
                : "Shartnomani bekor qilmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."}
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              <button 
                className="cd-btn-premium cd-btn-outline" 
                style={{ flex: 1 }} 
                onClick={() => setModal({ isOpen: false, type: "", data: null })}
              >
                Bekor qilish
              </button>
              <button 
                className="cd-btn-premium cd-btn-primary" 
                style={{ flex: 1, background: modal.type === "cancel" ? "#ef4444" : undefined }}
                disabled={actionLoading === "contract-action"}
                onClick={handleContractAction}
              >
                {actionLoading === "contract-action" ? "Yuklanmoqda..." : "Tasdiqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
