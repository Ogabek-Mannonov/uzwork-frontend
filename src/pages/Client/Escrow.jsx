// src/pages/Client/EscrowPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, DollarSign, Clock, CheckCircle,
  AlertCircle, Lock, Wallet, Calendar, Users,
  FileText, MessageSquare, Eye, Download, ArrowRight,
  TrendingUp, ShieldCheck, CreditCard, Banknote,
  X, Copy, RefreshCw, HelpCircle, Award,
  Briefcase, Star, MapPin, Phone, Mail
} from "lucide-react";
import "../Client/css/escrow.css";

const Escrow = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showReleaseModal, setShowReleaseModal] = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(null);
  const [releaseAmount, setReleaseAmount] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Mock escrow data
  const escrowBalance = {
    total: 12500,
    held: 8500,
    available: 4000,
    pending: 2500,
    released: 10000,
    disputes: 0
  };

  const escrowTransactions = [
    {
      id: "ESC-001",
      jobTitle: "Full-Stack Web Developer",
      freelancer: "Alisher Eshmatov",
      amount: 3500,
      status: "held",
      date: "2024-01-15",
      releaseDate: "2024-02-15",
      milestones: [
        { name: "Project Setup", amount: 500, status: "released" },
        { name: "Frontend Development", amount: 2000, status: "held" },
        { name: "Backend Development", amount: 1000, status: "held" }
      ]
    },
    {
      id: "ESC-002",
      jobTitle: "Mobile App Developer",
      freelancer: "Madina Salimova",
      amount: 4000,
      status: "held",
      date: "2024-01-10",
      releaseDate: "2024-02-10",
      milestones: [
        { name: "App Setup", amount: 800, status: "released" },
        { name: "Core Features", amount: 1600, status: "released" },
        { name: "Testing", amount: 1600, status: "held" }
      ]
    },
    {
      id: "ESC-003",
      jobTitle: "UI/UX Designer",
      freelancer: "Nilufar Ahmadova",
      amount: 3000,
      status: "released",
      date: "2024-01-05",
      releaseDate: "2024-02-05",
      milestones: [
        { name: "Wireframes", amount: 600, status: "released" },
        { name: "High Fidelity", amount: 1500, status: "released" },
        { name: "Design System", amount: 900, status: "released" }
      ]
    }
  ];

  const activeContracts = [
    {
      id: 1,
      jobTitle: "Full-Stack Web Developer",
      freelancer: "Alisher Eshmatov",
      amount: 5000,
      escrowAmount: 3500,
      releasedAmount: 1500,
      status: "in_progress",
      progress: 35,
      nextMilestone: "Frontend Development - $2000"
    },
    {
      id: 2,
      jobTitle: "Mobile App Developer",
      freelancer: "Madina Salimova",
      amount: 4000,
      escrowAmount: 2400,
      releasedAmount: 1600,
      status: "in_progress",
      progress: 60,
      nextMilestone: "Testing & Deployment - $1600"
    }
  ];

  const showToast = (message) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleReleasePayment = (contract) => {
    setShowReleaseModal(contract);
    setReleaseAmount(contract.nextMilestone?.split(' - $')[1] || contract.escrowAmount.toString());
  };

  const confirmReleasePayment = () => {
    showToast(`$${releaseAmount} to'lov muvaffaqiyatli chiqarildi!`);
    setShowReleaseModal(null);
    setReleaseAmount("");
  };

  const handleDispute = (contract) => {
    setShowDisputeModal(contract);
  };

  const confirmDispute = () => {
    if (!disputeReason) {
      showToast("Iltimos, nizo sababini kiriting!");
      return;
    }
    showToast("Nizo ochildi! Tez orada administrator bilan bog'lanamiz.");
    setShowDisputeModal(null);
    setDisputeReason("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "held":
        return <span className="status-badge held"><Lock size={12} /> Escrowda</span>;
      case "released":
        return <span className="status-badge released"><CheckCircle size={12} /> Chiqarilgan</span>;
      case "pending":
        return <span className="status-badge pending"><Clock size={12} /> Kutilmoqda</span>;
      default:
        return null;
    }
  };

  return (
    <div className="escrow-page">
      <div className="escrow-container">
        {/* Header */}
        <div className="escrow-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Orqaga</span>
          </button>
          <div className="header-info">
            <h1>Escrow tizimi</h1>
            <p>Xavfsiz to'lovlar va mablag' himoyasi</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="escrow-hero">
          <div className="hero-icon">
            <Shield size={48} />
          </div>
          <div className="hero-content">
            <h2>Xavfsiz to'lovlar kafolati</h2>
            <p>Mablag'laringiz to'liq himoyalangan. Ish tugaguniga qadar escrow hisobida saqlanadi.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="escrow-stats">
          <div className="stat-card">
            <div className="stat-icon total">
              <Wallet size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">${escrowBalance.total.toLocaleString()}</span>
              <span className="stat-label">Jami escrowda</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon held">
              <Lock size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">${escrowBalance.held.toLocaleString()}</span>
              <span className="stat-label">USHLAB TURILGAN</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon released">
              <CheckCircle size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">${escrowBalance.released.toLocaleString()}</span>
              <span className="stat-label">CHIQARILGAN</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon disputes">
              <AlertCircle size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{escrowBalance.disputes}</span>
              <span className="stat-label">NIZOLAR</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="escrow-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Wallet size={16} /> Umumiy
          </button>
          <button
            className={`tab-btn ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <FileText size={16} /> Tranzaksiyalar
          </button>
          <button
            className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <Briefcase size={16} /> Aktiv kontraktlar
          </button>
          <button
            className={`tab-btn ${activeTab === "how-it-works" ? "active" : ""}`}
            onClick={() => setActiveTab("how-it-works")}
          >
            <HelpCircle size={16} /> Qanday ishlaydi?
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Escrow Balance Card */}
            <div className="balance-card">
              <div className="balance-header">
                <h3>Escrow hisobingiz</h3>
                <button className="refresh-btn" onClick={() => showToast("Ma'lumotlar yangilandi!")}>
                  <RefreshCw size={14} /> Yangilash
                </button>
              </div>
              <div className="balance-amount">
                <span className="currency">$</span>
                <span className="amount">{escrowBalance.available.toLocaleString()}</span>
              </div>
              <p className="balance-note">Mablag'lar ish tugagandan so'ng chiqariladi</p>
              
              <div className="balance-details">
                <div className="detail-item">
                  <span>Jami tushumlar</span>
                  <strong>${escrowBalance.released.toLocaleString()}</strong>
                </div>
                <div className="detail-item">
                  <span>Kutilayotgan to'lovlar</span>
                  <strong>${escrowBalance.pending.toLocaleString()}</strong>
                </div>
                <div className="detail-item">
                  <span>Escrowda ushlab turilgan</span>
                  <strong>${escrowBalance.held.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Protection Features */}
            <div className="protection-features">
              <h3>Himoya xususiyatlari</h3>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon"><ShieldCheck size={24} /></div>
                  <h4>Xavfsiz to'lov</h4>
                  <p>To'lovlar escrow hisobida saqlanadi</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><Lock size={24} /></div>
                  <h4>To'liq himoya</h4>
                  <p>Mablag'lar ish tugaguniga qadar himoyalangan</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><Clock size={24} /></div>
                  <h4>O'z vaqtida to'lov</h4>
                  <p>Milestone tugaganda avtomatik to'lov</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><AlertCircle size={24} /></div>
                  <h4>Nizolarni hal qilish</h4>
                  <p>24/7 qo'llab-quvvatlash xizmati</p>
                </div>
              </div>
            </div>

            {/* Recent Escrow Transactions */}
            <div className="recent-transactions">
              <div className="section-header">
                <h3>So'nggi tranzaksiyalar</h3>
                <button className="view-all" onClick={() => setActiveTab("transactions")}>
                  Hammasini ko'rish <ArrowRight size={14} />
                </button>
              </div>
              <div className="transactions-list">
                {escrowTransactions.slice(0, 3).map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon">
                      {transaction.status === "held" ? <Lock size={18} /> : <CheckCircle size={18} />}
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-title">{transaction.jobTitle}</div>
                      <div className="transaction-meta">
                        <span>{transaction.freelancer}</span>
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                    <div className="transaction-amount">
                      <span>${transaction.amount.toLocaleString()}</span>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="transactions-full">
            <div className="section-header">
              <h3>Barcha escrow tranzaksiyalari</h3>
              <button className="download-btn">
                <Download size={14} /> Yuklab olish
              </button>
            </div>
            <div className="transactions-table">
              <div className="table-header">
                <div>ID</div>
                <div>Loyiha</div>
                <div>Freelancer</div>
                <div>Summa</div>
                <div>Holat</div>
                <div>Sana</div>
              </div>
              {escrowTransactions.map(transaction => (
                <div key={transaction.id} className="table-row">
                  <div className="cell">{transaction.id}</div>
                  <div className="cell">{transaction.jobTitle}</div>
                  <div className="cell">{transaction.freelancer}</div>
                  <div className="cell amount">${transaction.amount.toLocaleString()}</div>
                  <div className="cell">{getStatusBadge(transaction.status)}</div>
                  <div className="cell date">{formatDate(transaction.date)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Contracts Tab */}
        {activeTab === "active" && (
          <div className="active-contracts">
            {activeContracts.map(contract => (
              <div key={contract.id} className="contract-card">
                <div className="contract-header">
                  <div>
                    <h3>{contract.jobTitle}</h3>
                    <p className="freelancer-name">{contract.freelancer}</p>
                  </div>
                  <div className="contract-amount">
                    <span>Jami: ${contract.amount.toLocaleString()}</span>
                    <span className="escrow-amount">Escrow: ${contract.escrowAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="contract-progress">
                  <div className="progress-header">
                    <span>Loyiha progressi</span>
                    <span className="progress-percent">{contract.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${contract.progress}%` }}></div>
                  </div>
                </div>

                <div className="contract-milestones">
                  <div className="milestone-item released">
                    <CheckCircle size={14} />
                    <span>To'langan: ${contract.releasedAmount.toLocaleString()}</span>
                  </div>
                  <div className="milestone-item held">
                    <Lock size={14} />
                    <span>Escrowda: ${contract.escrowAmount.toLocaleString()}</span>
                  </div>
                  {contract.nextMilestone && (
                    <div className="milestone-item next">
                      <Clock size={14} />
                      <span>Keyingi: {contract.nextMilestone}</span>
                    </div>
                  )}
                </div>

                <div className="contract-actions">
                  <button 
                    className="release-btn"
                    onClick={() => handleReleasePayment(contract)}
                  >
                    <DollarSign size={14} /> To'lovni chiqarish
                  </button>
                  <button 
                    className="dispute-btn"
                    onClick={() => handleDispute(contract)}
                  >
                    <AlertCircle size={14} /> Nizo ochish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How It Works Tab */}
        {activeTab === "how-it-works" && (
          <div className="how-it-works">
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Kontrakt tuziladi</h3>
                  <p>Siz va freelancer o'rtasida kontrakt tuziladi. To'lov escrow hisobiga joylashtiriladi.</p>
                </div>
              </div>
              <div className="step-arrow">↓</div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Ish boshlanadi</h3>
                  <p>Freelancer ishni boshlaydi. Mablag'lar escrowda himoyalangan holda saqlanadi.</p>
                </div>
              </div>
              <div className="step-arrow">↓</div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Milestone tugaydi</h3>
                  <p>Har bir milestone tugagach, siz to'lovni chiqarasiz.</p>
                </div>
              </div>
              <div className="step-arrow">↓</div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>To'lov chiqariladi</h3>
                  <p>Ish tasdiqlangach, pul freelancer hisobiga o'tkaziladi.</p>
                </div>
              </div>
            </div>

            <div className="benefits">
              <h3>Escrow tizimining afzalliklari</h3>
              <div className="benefits-grid">
                <div className="benefit">
                  <Shield size={20} />
                  <div>
                    <h4>Xavfsizlik</h4>
                    <p>Mablag'lar to'liq himoyalangan</p>
                  </div>
                </div>
                <div className="benefit">
                  <Clock size={20} />
                  <div>
                    <h4>Ishonchlilik</h4>
                    <p>To'lovlar kafolatlangan</p>
                  </div>
                </div>
                <div className="benefit">
                  <AlertCircle size={20} />
                  <div>
                    <h4>Nizolarni hal qilish</h4>
                    <p>Professional yordam</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Release Payment Modal */}
        {showReleaseModal && (
          <div className="modal-overlay" onClick={() => setShowReleaseModal(null)}>
            <div className="modal-content release-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-icon success">
                  <DollarSign size={28} />
                </div>
                <h3>To'lovni chiqarish</h3>
                <button className="close-modal" onClick={() => setShowReleaseModal(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p>"{showReleaseModal.jobTitle}" loyihasi uchun to'lovni chiqarmoqchimisiz?</p>
                
                <div className="release-info">
                  <div className="info-row">
                    <span>Freelancer:</span>
                    <strong>{showReleaseModal.freelancer}</strong>
                  </div>
                  <div className="info-row">
                    <span>Summa:</span>
                    <strong className="amount">${releaseAmount}</strong>
                  </div>
                  <div className="info-row">
                    <span>Milestone:</span>
                    <strong>{showReleaseModal.nextMilestone?.split(' - $')[0] || "Final payment"}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label>Izoh (ixtiyoriy)</label>
                  <textarea rows={3} placeholder="Freelancerga xabar qoldirishingiz mumkin..."></textarea>
                </div>

                <div className="warning-note">
                  <AlertCircle size={14} />
                  <span>To'lovni chiqargandan so'ng, pul freelancer hisobiga o'tkaziladi</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowReleaseModal(null)}>
                  Bekor qilish
                </button>
                <button className="confirm-btn" onClick={confirmReleasePayment}>
                  <DollarSign size={16} /> To'lovni chiqarish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="modal-overlay" onClick={() => setShowDisputeModal(null)}>
            <div className="modal-content dispute-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-icon warning">
                  <AlertCircle size={28} />
                </div>
                <h3>Nizo ochish</h3>
                <button className="close-modal" onClick={() => setShowDisputeModal(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p>"{showDisputeModal.jobTitle}" loyihasi uchun nizo ochmoqchimisiz?</p>
                
                <div className="form-group">
                  <label>Nizo sababi *</label>
                  <select value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}>
                    <option value="">Sababni tanlang</option>
                    <option value="work_not_completed">Ish tugallanmagan</option>
                    <option value="quality_issues">Sifat muammolari</option>
                    <option value="deadline_missed">Muddat o'tkazib yuborilgan</option>
                    <option value="communication">Muloqot muammolari</option>
                    <option value="other">Boshqa sabab</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Batafsil ma'lumot</label>
                  <textarea rows={4} placeholder="Nizo haqida batafsil ma'lumot yozing..."></textarea>
                </div>

                <div className="warning-note">
                  <AlertCircle size={14} />
                  <span>Nizo ochilgandan so'ng, administrator tekshiruv o'tkazadi</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowDisputeModal(null)}>
                  Bekor qilish
                </button>
                <button className="confirm-btn danger" onClick={confirmDispute}>
                  <AlertCircle size={16} /> Nizo ochish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="success-toast">
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Escrow;