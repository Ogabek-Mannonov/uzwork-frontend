// src/pages/Client/ActiveContracts.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Users, Clock, DollarSign,
  Calendar, MessageSquare, CheckCircle, AlertCircle,
  MoreHorizontal, Eye, Send, Star, X,
  Search, Filter, ChevronRight, Briefcase,
  TrendingUp, Shield, Award, ExternalLink
} from "lucide-react";
import "../Client/css/contract.css";

// Mock data
const MOCK_CONTRACTS = [
  {
    id: 1,
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
      completed_projects: 45
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
    nextMilestone: "Frontend Development - Due in 5 days"
  },
  {
    id: 2,
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
      completed_projects: 32
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
    nextMilestone: "Testing & Deployment - Due in 8 days"
  },
  {
    id: 3,
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
      completed_projects: 38
    },
    startDate: "2024-01-12",
    endDate: "2024-02-28",
    status: "active",
    progress: 25,
    amount: 3000,
    paidAmount: 750,
    milestones: [
      { id: 1, title: "Wireframes", status: "completed", dueDate: "2024-01-20", amount: 600 },
      { id: 2, title: "High Fidelity Designs", status: "in_progress", dueDate: "2024-02-10", amount: 1500 },
      { id: 3, title: "Design System", status: "pending", dueDate: "2024-02-28", amount: 900 }
    ],
    lastActivity: "5 hours ago",
    nextMilestone: "High Fidelity Designs - Due in 12 days"
  }
];

const ActiveContracts = () => {
  const navigate = useNavigate();
  const [contracts] = useState(MOCK_CONTRACTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(null);
  const [releaseAmount, setReleaseAmount] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const filteredContracts = contracts.filter(contract =>
    contract.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case "completed":
        return <span className="status-badge completed"><CheckCircle size={12} /> Bajarilgan</span>;
      case "in_progress":
        return <span className="status-badge in-progress"><Clock size={12} /> Davom etmoqda</span>;
      case "pending":
        return <span className="status-badge pending"><AlertCircle size={12} /> Kutilmoqda</span>;
      default:
        return null;
    }
  };

  const handleReleasePayment = (milestone) => {
    setShowReleaseModal(milestone);
    setReleaseAmount(milestone.amount.toString());
  };

  const confirmReleasePayment = async () => {
    try {
      console.log("Releasing payment:", releaseAmount);
      setShowReleaseModal(null);
      setReleaseAmount("");
      showToast("To'lov muvaffaqiyatli amalga oshirildi!");
    } catch (error) {
      console.error("Error releasing payment:", error);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="contracts-page">
      <div className="contracts-container">
        {/* Header */}
        <div className="contracts-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> ⬅️
          </button>
          <div>
            <h1>Aktiv kontraktlar</h1>
            <p>Joriy faol kontraktlaringizni boshqaring</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="contracts-stats">
          <div className="stat-card">
            <div className="stat-icon active">
              <FileText size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{contracts.length}</span>
              <span className="stat-label">Aktiv kontrakt</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total">
              <DollarSign size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">
                ${contracts.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
              </span>
              <span className="stat-label">Umumiy summa</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon paid">
              <CheckCircle size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">
                ${contracts.reduce((sum, c) => sum + c.paidAmount, 0).toLocaleString()}
              </span>
              <span className="stat-label">To'langan</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">
                ${contracts.reduce((sum, c) => sum + (c.amount - c.paidAmount), 0).toLocaleString()}
              </span>
              <span className="stat-label">Kutilayotgan</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="contracts-search">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Kontrakt, job yoki freelancer bo'yicha qidirish..."
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

        {/* Contracts List */}
        <div className="contracts-list">
          {filteredContracts.map(contract => {
            const daysLeft = calculateDaysLeft(contract.endDate);
            
            return (
              <div key={contract.id} className="contract-card">
                <div className="contract-header">
                  <div className="contract-title">
                    <h3>{contract.job.title}</h3>
                    <span className="contract-type">{contract.job.type}</span>
                  </div>
                  <button 
                    className="details-btn"
                    onClick={() => navigate(`/client/contract/${contract.id}`)}
                  >
                    <Eye size={16} /> Batafsil
                  </button>
                </div>

                <div className="contract-body">
                  {/* Freelancer Info */}
                  <div className="freelancer-section">
                    <img 
                      src={contract.freelancer.avatar} 
                      alt={contract.freelancer.name}
                      className="freelancer-avatar"
                    />
                    <div className="freelancer-info">
                      <div className="freelancer-name">
                        {contract.freelancer.name}
                        <div className="rating">
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <span>{contract.freelancer.rating}</span>
                        </div>
                      </div>
                      <div className="freelancer-title">{contract.freelancer.title}</div>
                      <div className="freelancer-stats">
                        <span className="stat">
                          <Briefcase size={12} />
                          {contract.freelancer.completed_projects} loyiha
                        </span>
                        <span className="stat">
                          <MessageSquare size={12} />
                          Oxirgi aktivlik: {contract.lastActivity}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="message-btn"
                      onClick={() => navigate(`/messages/${contract.freelancer.id}`)}
                    >
                      <MessageSquare size={16} /> Xabar yozish
                    </button>
                  </div>

                  {/* Progress Section */}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Loyiha progressi</span>
                      <span className="progress-percent">{contract.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${contract.progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-dates">
                      <span>
                        <Calendar size={12} />
                        Boshlangan: {formatDate(contract.startDate)}
                      </span>
                      <span className={daysLeft < 7 ? "urgent" : ""}>
                        <Clock size={12} />
                        {daysLeft > 0 
                          ? `${daysLeft} kun qoldi` 
                          : "Muddat o'tgan"}
                      </span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="payment-info">
                    <div className="payment-row">
                      <span>Umumiy summa:</span>
                      <strong>${contract.amount.toLocaleString()}</strong>
                    </div>
                    <div className="payment-row">
                      <span>To'langan:</span>
                      <strong className="paid">${contract.paidAmount.toLocaleString()}</strong>
                    </div>
                    <div className="payment-row">
                      <span>Kutilayotgan:</span>
                      <strong className="pending">
                        ${(contract.amount - contract.paidAmount).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Milestones Preview */}
                  <div className="milestones-preview">
                    <div className="milestones-header">
                      <span>Milestones</span>
                      <button 
                        className="view-all-milestones"
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowMilestoneModal(true);
                        }}
                      >
                        Hammasini ko'rish <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="milestones-list">
                      {contract.milestones.slice(0, 3).map(milestone => (
                        <div key={milestone.id} className="milestone-item">
                          <div className="milestone-info">
                            <span className="milestone-title">{milestone.title}</span>
                            <span className="milestone-amount">${milestone.amount}</span>
                          </div>
                          <div className="milestone-status">
                            {getStatusBadge(milestone.status)}
                            <span className="milestone-date">
                              <Calendar size={10} />
                              {formatDate(milestone.dueDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Milestone Alert */}
                  {contract.nextMilestone && (
                    <div className="next-milestone-alert">
                      <AlertCircle size={16} />
                      <span>Keyingi milestone: {contract.nextMilestone}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredContracts.length === 0 && (
          <div className="empty-state">
            <FileText size={48} strokeWidth={1} />
            <h3>Hech qanday aktiv kontrakt topilmadi</h3>
            <p>Sizning aktiv kontraktlaringiz bu yerda ko'rinadi</p>
            <button 
              className="browse-btn"
              onClick={() => navigate("/client/talent")}
            >
              <Users size={16} /> Freelancer qidirish
            </button>
          </div>
        )}

        {/* Milestones Modal */}
        {showMilestoneModal && selectedContract && (
          <div className="modal-overlay" onClick={() => setShowMilestoneModal(false)}>
            <div className="modal-content milestones-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Milestones - {selectedContract.job.title}</h3>
                <button className="close-modal" onClick={() => setShowMilestoneModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="milestones-full-list">
                  {selectedContract.milestones.map(milestone => (
                    <div key={milestone.id} className="milestone-full-item">
                      <div className="milestone-full-header">
                        <div className="milestone-full-title">
                          <span className="title">{milestone.title}</span>
                          {getStatusBadge(milestone.status)}
                        </div>
                        <div className="milestone-full-amount">
                          ${milestone.amount.toLocaleString()}
                        </div>
                      </div>
                      <div className="milestone-full-details">
                        <span className="due-date">
                          <Calendar size={12} />
                          Muddat: {formatDate(milestone.dueDate)}
                        </span>
                        {milestone.status === "in_progress" && (
                          <button 
                            className="release-payment-btn"
                            onClick={() => handleReleasePayment(milestone)}
                          >
                            <DollarSign size={14} /> To'lovni chiqarish
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
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
                <h3>To'lovni chiqarish</h3>
                <button className="close-modal" onClick={() => setShowReleaseModal(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="release-info">
                  <div className="info-row">
                    <span>Milestone:</span>
                    <strong>{showReleaseModal.title}</strong>
                  </div>
                  <div className="info-row">
                    <span>Summa:</span>
                    <strong className="amount">${showReleaseModal.amount}</strong>
                  </div>
                </div>
                <div className="form-group">
                  <label>Izoh (ixtiyoriy)</label>
                  <textarea
                    placeholder="Freelancerga xabar qoldirishingiz mumkin..."
                    rows={4}
                  />
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
                <button className="submit-btn" onClick={confirmReleasePayment}>
                  <DollarSign size={16} /> To'lovni chiqarish
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

export default ActiveContracts;