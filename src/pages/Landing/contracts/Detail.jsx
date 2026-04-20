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
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  MoreVertical,
  XCircle
} from "lucide-react";
import "./contracts.css";

const STATUS_CONFIG = {
  active:    { class: "status-active", label: "Faol", icon: <Clock size={16} /> },
  completed: { class: "status-completed", label: "Yakunlangan", icon: <CheckCircle size={16} /> },
  cancelled: { class: "status-cancelled", label: "Bekor qilingan", icon: <XCircle size={16} /> },
  disputed:  { class: "status-disputed", label: "Nizo", icon: <AlertCircle size={16} /> },
};

const MILESTONE_STATUS = {
  pending:   { label: "Kutilmoqda", color: "#666" },
  submitted: { label: "Ko'rib chiqilmoqda", color: "#2563eb" },
  approved:  { label: "Tasdiqlangan", color: "#14a800" },
  released:  { label: "To'langan", color: "#14a800" },
};

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null); // { contract, milestones, disputes }
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of current action
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });

  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getContractById(id);
      setData(res?.data || res);
      
      // Get role from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(user);
    } catch (err) {
      notify("Ma'lumotlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => { load(); }, [load]);

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
    <div className="contract-detail-container">
      <div style={{ height: 400, background: "#f5f6f7", borderRadius: 20, animate: "pulse 2s infinite" }}></div>
    </div>
  );

  if (!data?.contract) return (
    <div className="contract-detail-container">
      <div className="empty-state">
        <XCircle size={64} color="#ef4444" />
        <h3>Kontrakt topilmadi</h3>
        <button className="btn-outline" style={{ marginTop: 20 }} onClick={() => navigate("/contracts")}>
          Ro'yxatga qaytish
        </button>
      </div>
    </div>
  );

  const { contract, milestones } = data;
  const isClient = String(currentUser?.id) === String(contract.client_id);
  const isFreelancer = String(currentUser?.id) === String(contract.freelancer_id);
  const st = STATUS_CONFIG[contract.status] || STATUS_CONFIG.active;

  return (
    <div className="contract-detail-container">
      {toast.msg && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : "#14a800",
          color: "#fff", padding: "16px 24px", borderRadius: 12, fontWeight: 700,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 12
        }}>
          {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {toast.msg}
        </div>
      )}

      <Link to="/contracts" className="back-link">
        <ArrowLeft size={18} /> Orqaga qaytish
      </Link>

      <div className="contract-panel">
        <div className="panel-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span className={`contract-status ${st.class}`}>
                  {st.icon} <span style={{ marginLeft: 6 }}>{st.label}</span>
                </span>
                <span style={{ fontSize: 13, color: "#999" }}>Shartnoma id: #{contract.id}</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a1a" }}>
                {contract.job_title || contract.project_title || "Loyiha sarlavhasi"}
              </h1>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
               {/* 
                  NOTE: contract detail sahifasida chat_id ni olish uchun 
                  odatda contract.id ishlatiladi, agar chats tableda contract_id bo'lsa.
                  Frontend route /messages/:id shunga mo'ljallangan.
               */}
               <button className="btn-outline" onClick={() => navigate(`/messages/${contract.id}`)}>
                 <MessageSquare size={18} style={{ marginRight: 8 }} /> Chat
               </button>
            </div>
          </div>
        </div>

        <div className="panel-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
            <div className="meta-card" style={{ background: "#f8f9fa", padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", marginBottom: 8 }}>Umumiy Budget</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a" }}>${contract.total_amount}</div>
            </div>
            
            <div className="meta-card" style={{ background: "#f8f9fa", padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", marginBottom: 8 }}>
                {isClient ? "Mutaxassis" : "Mijoz"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, background: "#e0e7ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                  <User size={16} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {isClient 
                    ? `${contract.freelancer_first_name || ""} ${contract.freelancer_last_name || ""}`.trim() || contract.freelancer_email
                    : `${contract.client_first_name || ""} ${contract.client_last_name || ""}`.trim() || contract.client_email}
                </div>
              </div>
            </div>

            <div className="meta-card" style={{ background: "#f8f9fa", padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", marginBottom: 8 }}>Boshlangan Sana</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                <Calendar size={16} color="#999" />
                {new Date(contract.created_at || contract.start_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={20} color="#14a800" /> Loyiha haqida
            </h3>
            <p style={{ color: "#555", lineHeight: 1.7, fontSize: 15 }}>
              {contract.description || contract.job_description || "Ushbu kontrakt bo'yicha batafsil ma'lumot kiritilmagan."}
            </p>
          </div>

          <div className="milestones-section">
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={20} color="#14a800" /> Ish bosqichlari (Milestones)
            </h3>
            
            {milestones?.length > 0 ? (
              milestones.map((m, idx) => {
                const mst = MILESTONE_STATUS[m.status] || MILESTONE_STATUS.pending;
                return (
                  <div key={m.id} className="milestone-item">
                    <div className="milestone-info">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#14a800", background: "#e6f7e6", padding: "2px 8px", borderRadius: 4 }}>
                          #{idx + 1}
                        </span>
                        <h4>{m.title}</h4>
                      </div>
                      <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
                        <span>💰 ${m.amount}</span>
                        <span style={{ color: mst.color, fontWeight: 700 }}>● {mst.label}</span>
                      </div>
                    </div>
                    
                    <div className="milestone-actions">
                      {isFreelancer && m.status === "pending" && (
                        <button 
                          className="btn-primary" 
                          disabled={actionLoading === m.id}
                          onClick={() => handleMilestoneAction(m.id, "submitted")}
                        >
                          Topshirish
                        </button>
                      )}
                      {isClient && m.status === "submitted" && (
                        <button 
                          className="btn-primary" 
                          disabled={actionLoading === m.id}
                          onClick={() => handleMilestoneAction(m.id, "released")}
                        >
                          To'lash
                        </button>
                      )}
                      {(m.status === "released" || m.status === "approved") && (
                        <CheckCircle size={24} color="#14a800" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#999", fontStyle: "italic" }}>Milestone-lar belgilanmagan.</p>
            )}
          </div>

          {contract.status === "active" && (
            <div style={{ marginTop: 60, padding: "32px", background: "#f8f9fa", borderRadius: 20, border: "1px dashed #e0e0e0" }}>
              <h4 style={{ fontWeight: 800, marginBottom: 8 }}>Shartnomani boshqarish</h4>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
                Agar ish to'liq bitgan bo'lsa shartnomani yakunlang. Muammo tug'ilsa bekor qilishingiz yoki nizo ochishingiz mumkin.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {isClient && (
                  <button className="btn-primary" onClick={() => setModal({ isOpen: true, type: "complete" })}>
                    Yakunlash
                  </button>
                )}
                <button className="btn-danger" onClick={() => setModal({ isOpen: true, type: "cancel" })}>
                  Bekor qilish
                </button>
                <button className="btn-outline" style={{ color: "#f57c00" }} onClick={() => navigate(`/disputes/new?contract=${contract.id}`)}>
                  Nizo ochish
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
          background: "rgba(0,0,0,0.6)", zIndex: 10000, display: "flex", 
          alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{ background: "#fff", maxWidth: 450, width: "100%", borderRadius: 24, padding: 32, textAlign: "center" }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
              background: modal.type === "complete" ? "#e6f7e6" : "#ffeef0",
              color: modal.type === "complete" ? "#14a800" : "#ef4444",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {modal.type === "complete" ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
              {modal.type === "complete" ? "Kontraktni yakunlash" : "Shartnomani bekor qilish"}
            </h3>
            <p style={{ color: "#666", marginBottom: 32, lineHeight: 1.6 }}>
              {modal.type === "complete" 
                ? "Haqiqatdan ham shartnomani yakunlamoqchimisiz? Qolgan barcha escrow mablag'lari freelancerga o'tkaziladi."
                : "Shartnomani bekor qilmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                className="btn-outline" 
                style={{ flex: 1 }} 
                onClick={() => setModal({ isOpen: false, type: "", data: null })}
              >
                Bekor qilish
              </button>
              <button 
                className={modal.type === "complete" ? "btn-primary" : "btn-danger"} 
                style={{ flex: 1, border: modal.type === "cancel" ? "none" : undefined, background: modal.type === "cancel" ? "#ef4444" : undefined, color: modal.type === "cancel" ? "#fff" : undefined }}
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
