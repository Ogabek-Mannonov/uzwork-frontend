// src/pages/Client/ContractManagement.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Users, Clock, DollarSign,
  Calendar, MessageSquare, CheckCircle, AlertCircle,
  Eye, Send, Star, X, Search, Filter, ChevronRight,
  Briefcase, TrendingUp, Shield, Award, ExternalLink,
  Plus, Edit, Trash2, Flag, HelpCircle, Upload,
  Save, UserCheck, Handshake, FileSignature
} from "lucide-react";
import "../Client/css/contractmanegment.css";

// Mock data (same as before)
const MOCK_CONTRACTS = [/* same */];
const MOCK_FREELANCERS = [/* same */];
const MOCK_JOBS = [/* same */];

const ContractManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEndModal, setShowEndModal] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [endReason, setEndReason] = useState("");
  const [review, setReview] = useState({
    rating: 5,
    comment: "",
    communication: 5,
    quality: 5,
    deadline: 5
  });

  const [newContract, setNewContract] = useState({
    jobId: "",
    freelancerId: "",
    startDate: "",
    endDate: "",
    amount: "",
    paymentTerms: "fixed",
    milestones: [{ title: "", amount: "", dueDate: "" }]
  });

  // Helper functions (same)
  const filteredContracts = MOCK_CONTRACTS.filter(contract => {
    if (activeTab === "active") return contract.status === "active";
    if (activeTab === "ended") return contract.status === "ended";
    return true;
  }).filter(contract =>
    contract.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (message) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleCreateContract = () => {
    if (!newContract.jobId || !newContract.freelancerId || !newContract.startDate || !newContract.endDate || !newContract.amount) {
      showToast("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      return;
    }
    showToast("Kontrakt muvaffaqiyatli yaratildi!");
    setShowCreateModal(false);
    setNewContract({
      jobId: "",
      freelancerId: "",
      startDate: "",
      endDate: "",
      amount: "",
      paymentTerms: "fixed",
      milestones: [{ title: "", amount: "", dueDate: "" }]
    });
  };

  const handleEndContract = () => {
    if (!endReason) {
      showToast("Iltimos, tugatish sababini tanlang!");
      return;
    }
    showToast("Kontrakt muvaffaqiyatli tugatildi!");
    setShowEndModal(null);
    setEndReason("");
  };

  const handleSubmitReview = () => {
    if (!review.comment.trim()) {
      showToast("Iltimos, fikringizni yozing!");
      return;
    }
    showToast("Review muvaffaqiyatli qoldirildi!");
    setShowReviewModal(null);
    setReview({ rating: 5, comment: "", communication: 5, quality: 5, deadline: 5 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "active":
        return <span className="cm-status-badge cm-active"><CheckCircle size={12} /> Aktiv</span>;
      case "ended":
        return <span className="cm-status-badge cm-ended"><Flag size={12} /> Tugatilgan</span>;
      default:
        return <span className="cm-status-badge">{status}</span>;
    }
  };

  const getMilestoneStatus = (status) => {
    switch(status) {
      case "completed":
        return <span className="cm-milestone-status cm-completed"><CheckCircle size={10} /> Bajarilgan</span>;
      case "in_progress":
        return <span className="cm-milestone-status cm-progress"><Clock size={10} /> Davom etmoqda</span>;
      case "pending":
        return <span className="cm-milestone-status cm-pending"><AlertCircle size={10} /> Kutilmoqda</span>;
      default:
        return null;
    }
  };

  return (
    <div className="cm-page">
      <div className="cm-container">
        {/* Header */}
        <div className="cm-header">
          <button className="cm-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Orqaga</span>
          </button>
          <div>
            <h1>Kontraktlar</h1>
            <p>Kontraktlarni boshqaring, yarating va yakunlang</p>
          </div>
          <button className="cm-create-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Yangi kontrakt
          </button>
        </div>

        {/* Stats */}
        <div className="cm-stats">
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-active">
              <FileText size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">{MOCK_CONTRACTS.filter(c => c.status === "active").length}</span>
              <span className="cm-stat-label">Aktiv kontrakt</span>
            </div>
          </div>
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-total">
              <DollarSign size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">${MOCK_CONTRACTS.reduce((s, c) => s + c.amount, 0).toLocaleString()}</span>
              <span className="cm-stat-label">Umumiy summa</span>
            </div>
          </div>
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-paid">
              <CheckCircle size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">${MOCK_CONTRACTS.reduce((s, c) => s + c.paidAmount, 0).toLocaleString()}</span>
              <span className="cm-stat-label">To'langan</span>
            </div>
          </div>
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-escrow">
              <Shield size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">${MOCK_CONTRACTS.reduce((s, c) => s + c.escrowAmount, 0).toLocaleString()}</span>
              <span className="cm-stat-label">Escrowda</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="cm-tabs">
          <button
            className={`cm-tab-btn ${activeTab === "active" ? "cm-active" : ""}`}
            onClick={() => { setActiveTab("active"); setShowDetails(false); }}
          >
            <FileText size={16} /> Aktiv kontraktlar
          </button>
          <button
            className={`cm-tab-btn ${activeTab === "ended" ? "cm-active" : ""}`}
            onClick={() => { setActiveTab("ended"); setShowDetails(false); }}
          >
            <Flag size={16} /> Tugatilganlar
          </button>
        </div>

        {/* Search */}
        <div className="cm-search">
          <div className="cm-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Kontrakt yoki freelancer bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="cm-search-clear" onClick={() => setSearchTerm("")}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Contracts List */}
        {!showDetails && (
          <div className="cm-contracts-list">
            {filteredContracts.map(contract => (
              <div key={contract.id} className="cm-contract-item">
                <div className="cm-contract-header">
                  <div className="cm-contract-title">
                    <h3>{contract.job.title}</h3>
                    {getStatusBadge(contract.status)}
                  </div>
                  <div className="cm-contract-actions">
                    <button 
                      className="cm-action-btn cm-view"
                      onClick={() => { setSelectedContract(contract); setShowDetails(true); }}
                    >
                      <Eye size={16} /> Batafsil
                    </button>
                  </div>
                </div>

                <div className="cm-contract-body">
                  <div className="cm-freelancer-info">
                    <img src={contract.freelancer.avatar} alt="" className="cm-freelancer-avatar-sm" />
                    <div>
                      <div className="cm-freelancer-name">{contract.freelancer.name}</div>
                      <div className="cm-freelancer-title">{contract.freelancer.title}</div>
                    </div>
                  </div>
                  <div className="cm-contract-details">
                    <div className="cm-detail">
                      <DollarSign size={14} />
                      <span>${contract.amount.toLocaleString()}</span>
                    </div>
                    <div className="cm-detail">
                      <Clock size={14} />
                      <span>{contract.progress}%</span>
                    </div>
                    <div className="cm-detail">
                      <Calendar size={14} />
                      <span>{formatDate(contract.startDate)}</span>
                    </div>
                  </div>
                  <div className="cm-progress-bar">
                    <div className="cm-progress-fill" style={{ width: `${contract.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}

            {filteredContracts.length === 0 && (
              <div className="cm-empty-state">
                <FileText size={48} strokeWidth={1} />
                <h3>Hech qanday kontrakt topilmadi</h3>
                <p>Yangi kontrakt yaratish uchun yuqoridagi tugmani bosing</p>
              </div>
            )}
          </div>
        )}

        {/* Contract Details View */}
        {showDetails && selectedContract && (
          <div className="cm-details-view">
            <button className="cm-back-to-list" onClick={() => setShowDetails(false)}>
              <ArrowLeft size={16} /> Kontraktlar ro'yxatiga
            </button>

            <div className="cm-details-card">
              <div className="cm-details-header">
                <div>
                  <h2>{selectedContract.job.title}</h2>
                  <p className="cm-contract-id">ID: {selectedContract.id}</p>
                </div>
                <div className="cm-details-actions">
                  {selectedContract.status === "active" && (
                    <>
                      <button 
                        className="cm-end-contract-btn"
                        onClick={() => setShowEndModal(selectedContract)}
                      >
                        <Flag size={16} /> Kontraktni tugatish
                      </button>
                      <button 
                        className="cm-review-btn"
                        onClick={() => setShowReviewModal(selectedContract)}
                      >
                        <Star size={16} /> Review qoldirish
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="cm-details-grid">
                {/* Left Column */}
                <div className="cm-details-left">
                  {/* Freelancer Info */}
                  <div className="cm-info-section">
                    <h3>Freelancer ma'lumotlari</h3>
                    <div className="cm-freelancer-card">
                      <img src={selectedContract.freelancer.avatar} alt="" className="cm-freelancer-avatar-lg" />
                      <div className="cm-freelancer-details">
                        <h4>{selectedContract.freelancer.name}</h4>
                        <p>{selectedContract.freelancer.title}</p>
                        <div className="cm-rating">
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <span>{selectedContract.freelancer.rating}</span>
                        </div>
                        <div className="cm-contact-info">
                          <span>✉️ {selectedContract.freelancer.email}</span>
                          <span>📞 {selectedContract.freelancer.phone}</span>
                        </div>
                        <button className="cm-message-btn">
                          <MessageSquare size={14} /> Xabar yozish
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contract Info */}
                  <div className="cm-info-section">
                    <h3>Kontrakt ma'lumotlari</h3>
                    <div className="cm-info-grid">
                      <div className="cm-info-item">
                        <span className="cm-label">Boshlanish sanasi:</span>
                        <span className="cm-value">{formatDate(selectedContract.startDate)}</span>
                      </div>
                      <div className="cm-info-item">
                        <span className="cm-label">Tugash sanasi:</span>
                        <span className="cm-value">{formatDate(selectedContract.endDate)}</span>
                      </div>
                      <div className="cm-info-item">
                        <span className="cm-label">Umumiy summa:</span>
                        <span className="cm-value">${selectedContract.amount.toLocaleString()}</span>
                      </div>
                      <div className="cm-info-item">
                        <span className="cm-label">To'langan:</span>
                        <span className="cm-value cm-paid">${selectedContract.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="cm-info-item">
                        <span className="cm-label">To'lov shartlari:</span>
                        <span className="cm-value">{selectedContract.paymentTerms}</span>
                      </div>
                      <div className="cm-info-item">
                        <span className="cm-label">Escrowda:</span>
                        <span className="cm-value">${selectedContract.escrowAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Milestones */}
                <div className="cm-details-right">
                  <div className="cm-info-section">
                    <h3>Milestones</h3>
                    <div className="cm-milestones-list">
                      {selectedContract.milestones.map(milestone => (
                        <div key={milestone.id} className="cm-milestone-item">
                          <div className="cm-milestone-header">
                            <span className="cm-milestone-title">{milestone.title}</span>
                            <span className="cm-milestone-amount">${milestone.amount}</span>
                          </div>
                          <div className="cm-milestone-meta">
                            {getMilestoneStatus(milestone.status)}
                            <span className="cm-due-date">
                              <Calendar size={10} /> Muddat: {formatDate(milestone.dueDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="cm-info-section">
                    <h3>Loyiha progressi</h3>
                    <div className="cm-progress-large">
                      <div className="cm-progress-bar-large">
                        <div className="cm-progress-fill-large" style={{ width: `${selectedContract.progress}%` }}></div>
                      </div>
                      <div className="cm-progress-percent">{selectedContract.progress}%</div>
                    </div>
                    <div className="cm-last-activity">
                      <Clock size={14} /> Oxirgi aktivlik: {selectedContract.lastActivity}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Contract Modal */}
        {showCreateModal && (
          <div className="cm-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="cm-modal-content cm-create-modal" onClick={e => e.stopPropagation()}>
              <div className="cm-modal-header">
                <h3>Yangi kontrakt yaratish</h3>
                <button className="cm-close-modal" onClick={() => setShowCreateModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="cm-modal-body">
                <div className="cm-form-group">
                  <label>Job tanlash *</label>
                  <select 
                    value={newContract.jobId}
                    onChange={(e) => setNewContract({...newContract, jobId: e.target.value})}
                  >
                    <option value="">Job tanlang</option>
                    {MOCK_JOBS.map(job => (
                      <option key={job.id} value={job.id}>{job.title} - {job.budget}</option>
                    ))}
                  </select>
                </div>

                <div className="cm-form-group">
                  <label>Freelancer tanlash *</label>
                  <select 
                    value={newContract.freelancerId}
                    onChange={(e) => setNewContract({...newContract, freelancerId: e.target.value})}
                  >
                    <option value="">Freelancer tanlang</option>
                    {MOCK_FREELANCERS.map(f => (
                      <option key={f.id} value={f.id}>{f.name} - {f.title}</option>
                    ))}
                  </select>
                </div>

                <div className="cm-form-row">
                  <div className="cm-form-group">
                    <label>Boshlanish sanasi *</label>
                    <input 
                      type="date" 
                      value={newContract.startDate}
                      onChange={(e) => setNewContract({...newContract, startDate: e.target.value})}
                    />
                  </div>
                  <div className="cm-form-group">
                    <label>Tugash sanasi *</label>
                    <input 
                      type="date" 
                      value={newContract.endDate}
                      onChange={(e) => setNewContract({...newContract, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="cm-form-group">
                  <label>Kontrakt summasi ($) *</label>
                  <input 
                    type="number" 
                    placeholder="Masalan: 5000"
                    value={newContract.amount}
                    onChange={(e) => setNewContract({...newContract, amount: e.target.value})}
                  />
                </div>

                <div className="cm-form-group">
                  <label>To'lov shartlari</label>
                  <select 
                    value={newContract.paymentTerms}
                    onChange={(e) => setNewContract({...newContract, paymentTerms: e.target.value})}
                  >
                    <option value="fixed">Fixlangan to'lov</option>
                    <option value="milestone">Milestone bo'yicha</option>
                    <option value="hourly">Soatbay to'lov</option>
                  </select>
                </div>
              </div>
              <div className="cm-modal-footer">
                <button className="cm-cancel-btn" onClick={() => setShowCreateModal(false)}>
                  Bekor qilish
                </button>
                <button className="cm-submit-btn" onClick={handleCreateContract}>
                  <Save size={16} /> Yaratish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* End Contract Modal */}
        {showEndModal && (
          <div className="cm-modal-overlay" onClick={() => setShowEndModal(null)}>
            <div className="cm-modal-content" onClick={e => e.stopPropagation()}>
              <div className="cm-modal-icon cm-warning">
                <Flag size={28} />
              </div>
              <h3 className="cm-modal-title">Kontraktni tugatish</h3>
              <p className="cm-modal-text">"{showEndModal.job.title}" kontraktini tugatmoqchimisiz?</p>
              
              <div className="cm-form-group">
                <label>Tugatish sababi *</label>
                <select value={endReason} onChange={(e) => setEndReason(e.target.value)}>
                  <option value="">Sababni tanlang</option>
                  <option value="completed">Loyiha muvaffaqiyatli tugadi</option>
                  <option value="cancelled">Loyiha bekor qilindi</option>
                  <option value="dispute">Kelishmovchilik</option>
                  <option value="other">Boshqa sabab</option>
                </select>
              </div>

              <div className="cm-form-group">
                <label>Izoh (ixtiyoriy)</label>
                <textarea rows={3} placeholder="Qo'shimcha ma'lumot..."></textarea>
              </div>

              <div className="cm-modal-actions">
                <button className="cm-cancel-btn" onClick={() => setShowEndModal(null)}>
                  Bekor qilish
                </button>
                <button className="cm-confirm-btn cm-danger" onClick={handleEndContract}>
                  Kontraktni tugatish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave Review Modal */}
        {showReviewModal && (
          <div className="cm-modal-overlay" onClick={() => setShowReviewModal(null)}>
            <div className="cm-modal-content" onClick={e => e.stopPropagation()}>
              <div className="cm-modal-icon cm-review">
                <Star size={28} />
              </div>
              <h3 className="cm-modal-title">Review qoldirish</h3>
              <p className="cm-modal-text">"{showReviewModal.freelancer.name}" freelancer haqida fikringiz</p>

              <div className="cm-rating-section">
                <label>Umumiy reyting</label>
                <div className="cm-stars">
                  {[1,2,3,4,5].map(star => (
                    <button 
                      key={star}
                      className="cm-star-btn"
                      onClick={() => setReview({...review, rating: star})}
                    >
                      <Star size={24} fill={review.rating >= star ? "#f59e0b" : "none"} color="#f59e0b" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="cm-rating-details">
                <div className="cm-rating-item">
                  <span>Muloqot</span>
                  <div className="cm-rating-stars">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setReview({...review, communication: star})}>
                        <Star size={16} fill={review.communication >= star ? "#f59e0b" : "none"} color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="cm-rating-item">
                  <span>Sifat</span>
                  <div className="cm-rating-stars">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setReview({...review, quality: star})}>
                        <Star size={16} fill={review.quality >= star ? "#f59e0b" : "none"} color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="cm-rating-item">
                  <span>Muddat</span>
                  <div className="cm-rating-stars">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setReview({...review, deadline: star})}>
                        <Star size={16} fill={review.deadline >= star ? "#f59e0b" : "none"} color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="cm-form-group">
                <label>Izoh *</label>
                <textarea 
                  rows={4} 
                  placeholder="Freelancer haqida fikringizni yozing..."
                  value={review.comment}
                  onChange={(e) => setReview({...review, comment: e.target.value})}
                />
              </div>

              <div className="cm-modal-actions">
                <button className="cm-cancel-btn" onClick={() => setShowReviewModal(null)}>
                  Bekor qilish
                </button>
                <button className="cm-confirm-btn" onClick={handleSubmitReview}>
                  <Send size={16} /> Yuborish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="cm-success-toast">
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractManagement;