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

// Mock data
const MOCK_CONTRACTS = [
  {
    id: "CTR-001",
    job: {
      id: 101,
      title: "Full-Stack Web Developer",
      budget: "$5,000",
      type: "Fixed Price"
    },
    freelancer: {
      id: 201,
      name: "Alisher Eshmatov",
      avatar: "https://i.pravatar.cc/150?img=1",
      title: "Senior Full-Stack Developer",
      rating: 4.9,
      email: "alisher@example.com",
      phone: "+998 90 123 45 67"
    },
    startDate: "2024-01-10",
    endDate: "2024-03-10",
    status: "active",
    progress: 35,
    amount: 5000,
    paidAmount: 1750,
    milestones: [
      { id: 1, title: "Project Setup", status: "completed", dueDate: "2024-01-20", amount: 500 },
      { id: 2, title: "Frontend Development", status: "in_progress", dueDate: "2024-02-10", amount: 2000 },
      { id: 3, title: "Backend Development", status: "pending", dueDate: "2024-02-25", amount: 1500 },
      { id: 4, title: "Testing & Deployment", status: "pending", dueDate: "2024-03-10", amount: 1000 }
    ],
    lastActivity: "2 hours ago",
    paymentTerms: "50% upfront, 50% upon completion",
    escrowAmount: 5000,
    releaseDate: "2024-03-15"
  },
  {
    id: "CTR-002",
    job: {
      id: 102,
      title: "Mobile App Developer",
      budget: "$4,000",
      type: "Fixed Price"
    },
    freelancer: {
      id: 202,
      name: "Madina Salimova",
      avatar: "https://i.pravatar.cc/150?img=2",
      title: "React Native Expert",
      rating: 4.8,
      email: "madina@example.com",
      phone: "+998 90 234 56 78"
    },
    startDate: "2024-01-05",
    endDate: "2024-02-20",
    status: "active",
    progress: 60,
    amount: 4000,
    paidAmount: 2400,
    milestones: [
      { id: 1, title: "App Setup & Design", status: "completed", dueDate: "2024-01-15", amount: 800 },
      { id: 2, title: "Core Features", status: "completed", dueDate: "2024-01-30", amount: 1600 },
      { id: 3, title: "Testing & Deployment", status: "in_progress", dueDate: "2024-02-20", amount: 1600 }
    ],
    lastActivity: "1 day ago",
    paymentTerms: "Monthly payment",
    escrowAmount: 4000,
    releaseDate: "2024-02-25"
  },
  {
    id: "CTR-003",
    job: {
      id: 103,
      title: "UI/UX Designer",
      budget: "$3,000",
      type: "Hourly"
    },
    freelancer: {
      id: 203,
      name: "Nilufar Ahmadova",
      avatar: "https://i.pravatar.cc/150?img=4",
      title: "UI/UX Designer",
      rating: 4.9,
      email: "nilufar@example.com",
      phone: "+998 90 345 67 89"
    },
    startDate: "2024-01-12",
    endDate: "2024-02-28",
    status: "ended",
    progress: 100,
    amount: 3000,
    paidAmount: 3000,
    milestones: [
      { id: 1, title: "Wireframes", status: "completed", dueDate: "2024-01-20", amount: 600 },
      { id: 2, title: "High Fidelity Designs", status: "completed", dueDate: "2024-02-10", amount: 1500 },
      { id: 3, title: "Design System", status: "completed", dueDate: "2024-02-28", amount: 900 }
    ],
    lastActivity: "5 days ago",
    paymentTerms: "Fixed price",
    escrowAmount: 0,
    releaseDate: "2024-03-01"
  }
];

const MOCK_FREELANCERS = [
  { id: 301, name: "Jasur Mirzaev", avatar: "https://i.pravatar.cc/150?img=3", title: "Backend Specialist", rating: 4.7, hourly_rate: 40, email: "jasur@example.com" },
  { id: 302, name: "Nilufar Ahmadova", avatar: "https://i.pravatar.cc/150?img=4", title: "UI/UX Designer", rating: 4.9, hourly_rate: 30, email: "nilufar@example.com" },
  { id: 303, name: "Doniyor Karimov", avatar: "https://i.pravatar.cc/150?img=5", title: "DevOps Engineer", rating: 4.6, hourly_rate: 45, email: "doniyor@example.com" },
  { id: 304, name: "Zulfiya Toshmatova", avatar: "https://i.pravatar.cc/150?img=6", title: "Frontend Developer", rating: 4.8, hourly_rate: 22, email: "zulfiya@example.com" }
];

const MOCK_JOBS = [
  { id: 101, title: "Full-Stack Web Developer", budget: "$5,000", type: "Fixed Price" },
  { id: 102, title: "Mobile App Developer", budget: "$4,000", type: "Fixed Price" },
  { id: 103, title: "UI/UX Designer", budget: "$3,000", type: "Hourly" },
  { id: 104, title: "DevOps Engineer", budget: "$6,000", type: "Fixed Price" }
];

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

  // New contract form
  const [newContract, setNewContract] = useState({
    jobId: "",
    freelancerId: "",
    startDate: "",
    endDate: "",
    amount: "",
    paymentTerms: "fixed",
    milestones: [{ title: "", amount: "", dueDate: "" }]
  });

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
        return <span className="status-badge active"><CheckCircle size={12} /> Aktiv</span>;
      case "ended":
        return <span className="status-badge ended"><Flag size={12} /> Tugatilgan</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getMilestoneStatus = (status) => {
    switch(status) {
      case "completed":
        return <span className="milestone-status completed"><CheckCircle size={10} /> Bajarilgan</span>;
      case "in_progress":
        return <span className="milestone-status progress"><Clock size={10} /> Davom etmoqda</span>;
      case "pending":
        return <span className="milestone-status pending"><AlertCircle size={10} /> Kutilmoqda</span>;
      default:
        return null;
    }
  };

  return (
    <div className="contract-mgmt-page">
      <div className="contract-mgmt-container">
        {/* Header */}
        <div className="mgmt-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Orqaga</span>
          </button>
          <div>
            <h1>Kontraktlar</h1>
            <p>Kontraktlarni boshqaring, yarating va yakunlang</p>
          </div>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Yangi kontrakt
          </button>
        </div>

        {/* Stats */}
        <div className="mgmt-stats">
          <div className="stat-card">
            <div className="stat-icon active">
              <FileText size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{MOCK_CONTRACTS.filter(c => c.status === "active").length}</span>
              <span className="stat-label">Aktiv kontrakt</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total">
              <DollarSign size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">${MOCK_CONTRACTS.reduce((s, c) => s + c.amount, 0).toLocaleString()}</span>
              <span className="stat-label">Umumiy summa</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon paid">
              <CheckCircle size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">${MOCK_CONTRACTS.reduce((s, c) => s + c.paidAmount, 0).toLocaleString()}</span>
              <span className="stat-label">To'langan</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon escrow">
              <Shield size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">${MOCK_CONTRACTS.reduce((s, c) => s + c.escrowAmount, 0).toLocaleString()}</span>
              <span className="stat-label">Escrowda</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mgmt-tabs">
          <button
            className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
            onClick={() => { setActiveTab("active"); setShowDetails(false); }}
          >
            <FileText size={16} /> Aktiv kontraktlar
          </button>
          <button
            className={`tab-btn ${activeTab === "ended" ? "active" : ""}`}
            onClick={() => { setActiveTab("ended"); setShowDetails(false); }}
          >
            <Flag size={16} /> Tugatilganlar
          </button>
        </div>

        {/* Search */}
        <div className="mgmt-search">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Kontrakt yoki freelancer bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ============================================
            ACTIVE CONTRACTS LIST
            ============================================ */}
        {!showDetails && (
          <div className="contracts-list">
            {filteredContracts.map(contract => (
              <div key={contract.id} className="contract-item">
                <div className="contract-item-header">
                  <div className="contract-title">
                    <h3>{contract.job.title}</h3>
                    {getStatusBadge(contract.status)}
                  </div>
                  <div className="contract-actions">
                    <button 
                      className="action-btn view"
                      onClick={() => { setSelectedContract(contract); setShowDetails(true); }}
                    >
                      <Eye size={16} /> Batafsil
                    </button>
                  </div>
                </div>

                <div className="contract-item-body">
                  <div className="freelancer-info">
                    <img src={contract.freelancer.avatar} alt="" className="freelancer-avatar-sm" />
                    <div>
                      <div className="freelancer-name">{contract.freelancer.name}</div>
                      <div className="freelancer-title">{contract.freelancer.title}</div>
                    </div>
                  </div>
                  <div className="contract-details">
                    <div className="detail">
                      <DollarSign size={14} />
                      <span>${contract.amount.toLocaleString()}</span>
                    </div>
                    <div className="detail">
                      <Clock size={14} />
                      <span>{contract.progress}%</span>
                    </div>
                    <div className="detail">
                      <Calendar size={14} />
                      <span>{formatDate(contract.startDate)}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${contract.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}

            {filteredContracts.length === 0 && (
              <div className="empty-state">
                <FileText size={48} strokeWidth={1} />
                <h3>Hech qanday kontrakt topilmadi</h3>
                <p>Yangi kontrakt yaratish uchun yuqoridagi tugmani bosing</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            CONTRACT DETAILS VIEW
            ============================================ */}
        {showDetails && selectedContract && (
          <div className="contract-details-view">
            <button className="back-to-list" onClick={() => setShowDetails(false)}>
              <ArrowLeft size={16} /> Kontraktlar ro'yxatiga
            </button>

            <div className="details-card">
              <div className="details-header">
                <div>
                  <h2>{selectedContract.job.title}</h2>
                  <p className="contract-id">ID: {selectedContract.id}</p>
                </div>
                <div className="details-actions">
                  {selectedContract.status === "active" && (
                    <>
                      <button 
                        className="end-contract-btn"
                        onClick={() => setShowEndModal(selectedContract)}
                      >
                        <Flag size={16} /> Kontraktni tugatish
                      </button>
                      <button 
                        className="review-btn"
                        onClick={() => setShowReviewModal(selectedContract)}
                      >
                        <Star size={16} /> Review qoldirish
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="details-grid">
                {/* Left Column */}
                <div className="details-left">
                  {/* Freelancer Info */}
                  <div className="info-section">
                    <h3>Freelancer ma'lumotlari</h3>
                    <div className="freelancer-card">
                      <img src={selectedContract.freelancer.avatar} alt="" className="freelancer-avatar-lg" />
                      <div className="freelancer-details">
                        <h4>{selectedContract.freelancer.name}</h4>
                        <p>{selectedContract.freelancer.title}</p>
                        <div className="rating">
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <span>{selectedContract.freelancer.rating}</span>
                        </div>
                        <div className="contact-info">
                          <span>✉️ {selectedContract.freelancer.email}</span>
                          <span>📞 {selectedContract.freelancer.phone}</span>
                        </div>
                        <button className="message-freelancer-btn">
                          <MessageSquare size={14} /> Xabar yozish
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contract Info */}
                  <div className="info-section">
                    <h3>Kontrakt ma'lumotlari</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Boshlanish sanasi:</span>
                        <span className="value">{formatDate(selectedContract.startDate)}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Tugash sanasi:</span>
                        <span className="value">{formatDate(selectedContract.endDate)}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Umumiy summa:</span>
                        <span className="value">${selectedContract.amount.toLocaleString()}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">To'langan:</span>
                        <span className="value paid">${selectedContract.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">To'lov shartlari:</span>
                        <span className="value">{selectedContract.paymentTerms}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Escrowda:</span>
                        <span className="value">${selectedContract.escrowAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Milestones */}
                <div className="details-right">
                  <div className="info-section">
                    <h3>Milestones</h3>
                    <div className="milestones-list-full">
                      {selectedContract.milestones.map(milestone => (
                        <div key={milestone.id} className="milestone-full">
                          <div className="milestone-header">
                            <span className="milestone-title">{milestone.title}</span>
                            <span className="milestone-amount">${milestone.amount}</span>
                          </div>
                          <div className="milestone-meta">
                            {getMilestoneStatus(milestone.status)}
                            <span className="due-date">
                              <Calendar size={10} /> Muddat: {formatDate(milestone.dueDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="info-section">
                    <h3>Loyiha progressi</h3>
                    <div className="progress-large">
                      <div className="progress-bar-large">
                        <div className="progress-fill-large" style={{ width: `${selectedContract.progress}%` }}></div>
                      </div>
                      <div className="progress-percent">{selectedContract.progress}%</div>
                    </div>
                    <div className="last-activity">
                      <Clock size={14} /> Oxirgi aktivlik: {selectedContract.lastActivity}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            CREATE CONTRACT MODAL
            ============================================ */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content create-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Yangi kontrakt yaratish</h3>
                <button className="close-modal" onClick={() => setShowCreateModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-row">
                  <div className="form-group">
                    <label>Boshlanish sanasi *</label>
                    <input 
                      type="date" 
                      value={newContract.startDate}
                      onChange={(e) => setNewContract({...newContract, startDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tugash sanasi *</label>
                    <input 
                      type="date" 
                      value={newContract.endDate}
                      onChange={(e) => setNewContract({...newContract, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Kontrakt summasi ($) *</label>
                  <input 
                    type="number" 
                    placeholder="Masalan: 5000"
                    value={newContract.amount}
                    onChange={(e) => setNewContract({...newContract, amount: e.target.value})}
                  />
                </div>

                <div className="form-group">
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
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                  Bekor qilish
                </button>
                <button className="submit-btn" onClick={handleCreateContract}>
                  <Save size={16} /> Yaratish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            END CONTRACT MODAL
            ============================================ */}
        {showEndModal && (
          <div className="modal-overlay" onClick={() => setShowEndModal(null)}>
            <div className="modal-content end-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-icon warning">
                <Flag size={28} />
              </div>
              <h3>Kontraktni tugatish</h3>
              <p>"{showEndModal.job.title}" kontraktini tugatmoqchimisiz?</p>
              
              <div className="form-group">
                <label>Tugatish sababi *</label>
                <select value={endReason} onChange={(e) => setEndReason(e.target.value)}>
                  <option value="">Sababni tanlang</option>
                  <option value="completed">Loyiha muvaffaqiyatli tugadi</option>
                  <option value="cancelled">Loyiha bekor qilindi</option>
                  <option value="dispute">Kelishmovchilik</option>
                  <option value="other">Boshqa sabab</option>
                </select>
              </div>

              <div className="form-group">
                <label>Izoh (ixtiyoriy)</label>
                <textarea rows={3} placeholder="Qo'shimcha ma'lumot..."></textarea>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowEndModal(null)}>
                  Bekor qilish
                </button>
                <button className="confirm-btn danger" onClick={handleEndContract}>
                  Kontraktni tugatish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            LEAVE REVIEW MODAL
            ============================================ */}
        {showReviewModal && (
          <div className="modal-overlay" onClick={() => setShowReviewModal(null)}>
            <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-icon review">
                <Star size={28} />
              </div>
              <h3>Review qoldirish</h3>
              <p>"{showReviewModal.freelancer.name}" freelancer haqida fikringiz</p>

              <div className="rating-section">
                <label>Umumiy reyting</label>
                <div className="stars">
                  {[1,2,3,4,5].map(star => (
                    <button 
                      key={star}
                      className={`star-btn ${review.rating >= star ? "active" : ""}`}
                      onClick={() => setReview({...review, rating: star})}
                    >
                      <Star size={24} fill={review.rating >= star ? "#f59e0b" : "none"} color="#f59e0b" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rating-details">
                <div className="rating-item">
                  <span>Muloqot</span>
                  <div className="rating-stars">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setReview({...review, communication: star})}>
                        <Star size={16} fill={review.communication >= star ? "#f59e0b" : "none"} color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rating-item">
                  <span>Sifat</span>
                  <div className="rating-stars">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setReview({...review, quality: star})}>
                        <Star size={16} fill={review.quality >= star ? "#f59e0b" : "none"} color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rating-item">
                  <span>Muddat</span>
                  <div className="rating-stars">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setReview({...review, deadline: star})}>
                        <Star size={16} fill={review.deadline >= star ? "#f59e0b" : "none"} color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Izoh *</label>
                <textarea 
                  rows={4} 
                  placeholder="Freelancer haqida fikringizni yozing..."
                  value={review.comment}
                  onChange={(e) => setReview({...review, comment: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowReviewModal(null)}>
                  Bekor qilish
                </button>
                <button className="confirm-btn" onClick={handleSubmitReview}>
                  <Send size={16} /> Yuborish
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

export default ContractManagement;