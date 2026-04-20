import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Users, Clock, DollarSign,
  Calendar, MessageSquare, CheckCircle, AlertCircle,
  Eye, Send, Star, X, Search, Filter, ChevronRight,
  Briefcase, TrendingUp, Shield, Award, ExternalLink,
  Plus, Edit, Trash2, Flag, HelpCircle, Upload,
  Save, UserCheck, Handshake, FileSignature
} from "lucide-react";
import { getMyContracts, getContractById } from "../../api/contracts";
import "./css/contractmanegment.css";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND}${cleanUrl}`;
}

const ContractManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyContracts();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.contracts)) list = res.contracts;
      else if (Array.isArray(res?.data?.contracts)) list = res.data.contracts;
      
      setContracts(list);
    } catch (err) {
      console.error("Error loading contracts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const handleViewDetails = async (contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
    setDetailsLoading(true);
    try {
      const res = await getContractById(contract.id);
      const fullData = res?.data || res;
      if (fullData) {
        setSelectedContract(fullData);
      }
    } catch (err) {
      console.error("Error loading contract details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    const statusMatch = activeTab === "active" ? c.status === "active" : c.status !== "active";
    const searchMatch = 
      (c.job_title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.freelancer_first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.freelancer_last_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const stats = {
    active: contracts.filter(c => c.status === "active").length,
    total: contracts.reduce((sum, c) => sum + (Number(c.total_amount) || 0), 0),
    paid: contracts.reduce((sum, c) => sum + (Number(c.paid_amount) || 0), 0),
    escrow: contracts.reduce((sum, c) => sum + ((Number(c.total_amount) || 0) - (Number(c.paid_amount) || 0)), 0),
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
      case "completed":
        return <span className="cm-status-badge cm-ended"><CheckCircle size={12} /> Tugatilgan</span>;
      case "cancelled":
        return <span className="cm-status-badge cm-ended" style={{ background: "#fee2e2", color: "#ef4444" }}><X size={12} /> Bekor qilingan</span>;
      default:
        return <span className="cm-status-badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="cm-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader"></div>
          <p style={{ marginTop: 20, color: '#666' }}>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-page">
      <div className="cm-container">
        {/* Header */}
        <div className="cm-header">
          <div className="cm-header-info">
            <h1>Kontraktlar boshqaruvi</h1>
            <p>Barcha loyihalar va ish bosqichlarini bir joyda kuzatib boring</p>
          </div>
          <div className="cm-header-actions" style={{ display: 'flex', gap: '12px' }}>
            <button className="cm-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> Orqaga qaytish
            </button>
            <button className="cm-create-btn" onClick={() => navigate("/client/talent")}>
              <Plus size={18} /> Yangi kontrakt
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="cm-stats">
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-active">
              <FileText size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">{stats.active}</span>
              <span className="cm-stat-label">Aktiv kontrakt</span>
            </div>
          </div>
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-total">
              <DollarSign size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">${stats.total.toLocaleString()}</span>
              <span className="cm-stat-label">Umumiy summa</span>
            </div>
          </div>
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-paid">
              <CheckCircle size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">${stats.paid.toLocaleString()}</span>
              <span className="cm-stat-label">To'langan</span>
            </div>
          </div>
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-escrow">
              <Shield size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">${stats.escrow.toLocaleString()}</span>
              <span className="cm-stat-label">Escrowda</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="cm-tabs">
          <button
            className={`cm-tab-btn ${activeTab === "active" ? "cm-active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <FileText size={16} /> Aktiv kontraktlar
          </button>
          <button
            className={`cm-tab-btn ${activeTab === "ended" ? "cm-active" : ""}`}
            onClick={() => setActiveTab("ended")}
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
        <div className="cm-contracts-list">
          {filteredContracts.map(contract => (
            <div key={contract.id} className="cm-contract-item">
              <div className="cm-contract-header">
                <div className="cm-contract-title">
                  <h3>{contract.job_title || "Loyiha sarlavhasi"}</h3>
                  {getStatusBadge(contract.status)}
                </div>
                <div className="cm-contract-actions">
                  <button 
                    className="cm-action-btn cm-view"
                    onClick={() => handleViewDetails(contract)}
                  >
                    <Eye size={16} /> Batafsil
                  </button>
                </div>
              </div>

              <div className="cm-contract-body">
                <div className="cm-freelancer-info">
                  <div className="cm-avatar-wrapper" 
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => navigate(`/freelancers/${contract.freelancer_id}`)}
                  >
                    {contract.freelancer_avatar_url ? (
                      <img 
                        src={avatarSrc(contract.freelancer_avatar_url)} 
                        alt="Freelancer" 
                        className="cm-avatar-img" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="cm-avatar-placeholder" 
                      style={{ display: contract.freelancer_avatar_url ? 'none' : 'flex' }}
                    >
                      {contract.freelancer_first_name?.[0] || <Users size={16} />}
                    </div>
                  </div>
                  <div>
                    <div 
                      className="cm-freelancer-name" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/freelancers/${contract.freelancer_id}`)}
                    >
                      {`${contract.freelancer_first_name || ""} ${contract.freelancer_last_name || ""}`.trim() || "Freelancer Partner"}
                    </div>
                    <div className="cm-freelancer-actions">
                      <button 
                        className="cm-btn-secondary cm-btn-sm" 
                        onClick={() => navigate(`/freelancers/${contract.freelancer_id}`)}
                      >
                        <Users size={12} /> Profil
                      </button>
                      <button 
                        className="cm-btn-primary cm-btn-sm" 
                        onClick={() => navigate(`/messages/${contract.id}`)}
                      >
                        <MessageSquare size={12} /> Chat
                      </button>
                    </div>
                  </div>
                </div>
                <div className="cm-contract-details">
                  <div className="cm-detail">
                    <DollarSign size={14} />
                    <span>${Number(contract.total_amount).toLocaleString()}</span>
                  </div>
                  <div className="cm-detail">
                    <Clock size={14} />
                    <span>Davom etmoqda</span>
                  </div>
                  <div className="cm-detail">
                    <Calendar size={14} />
                    <span>{formatDate(contract.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredContracts.length === 0 && (
            <div className="cm-empty-state">
              <FileText size={48} strokeWidth={1} />
              <h3>Hech qanday kontrakt topilmadi</h3>
              <p>Hozircha sizda {activeTab === "active" ? "faol" : "yakunlangan"} kontraktlar mavjud emas.</p>
            </div>
          )}
        </div>

        {/* Contract Details Modal */}
        {isModalOpen && selectedContract && (
          <div className="cm-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="cm-modal-content cm-detail-modal" onClick={e => e.stopPropagation()}>
              <div className="cm-modal-header">
                <div className="header-info">
                  <h2>{selectedContract.contract?.job_title || selectedContract.job_title || "Loyiha tafsilotlari"}</h2>
                  <p className="cm-contract-id">ID: #{selectedContract.contract?.id || selectedContract.id}</p>
                </div>
                <button className="cm-close-modal" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {detailsLoading ? (
                <div className="modal-loader-wrap">
                  <div className="loader"></div>
                  <p>Yuklanmoqda...</p>
                </div>
              ) : (
                <div className="cm-modal-body">
                  <div className="cm-details-grid">
                    {/* Left Column */}
                    <div className="cm-details-left">
                      <div className="cm-info-section">
                        <div className="section-header">
                          <Users size={18} />
                          <h3>Freelancer ma'lumotlari</h3>
                        </div>
                        <div className="cm-freelancer-card-alt">
                          {selectedContract.contract?.freelancer_avatar_url ? (
                            <img 
                              src={avatarSrc(selectedContract.contract?.freelancer_avatar_url)} 
                              alt="Freelancer" 
                              className="cm-avatar-lg-img" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="cm-avatar-lg-placeholder"
                            style={{ display: selectedContract.contract?.freelancer_avatar_url ? 'none' : 'flex' }}
                          >
                            {selectedContract.contract?.freelancer_first_name?.[0] || <Users size={24} />}
                          </div>
                          <div className="cm-freelancer-details">
                            <h4>{`${selectedContract.contract?.freelancer_first_name || ""} ${selectedContract.contract?.freelancer_last_name || ""}`}</h4>
                            <p className="cm-freelancer-email">{selectedContract.contract?.freelancer_email}</p>
                            <div className="cm-freelancer-actions">
                              <button 
                                className="cm-btn-secondary cm-btn-sm" 
                                onClick={() => navigate(`/freelancers/${selectedContract.contract?.freelancer_id}`)}
                              >
                                <Users size={14} /> Profilni ko'rish
                              </button>
                              <button 
                                className="cm-btn-primary cm-btn-sm" 
                                onClick={() => navigate(`/messages/${selectedContract.contract?.id || selectedContract.id}`)}
                              >
                                <MessageSquare size={14} /> Chatga o'tish
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="cm-info-section">
                        <div className="section-header">
                          <FileText size={18} />
                          <h3>Kontrakt ma'lumotlari</h3>
                        </div>
                        <div className="cm-info-list">
                          <div className="info-item">
                            <span className="label">Boshlangan sana:</span>
                            <span className="value">{formatDate(selectedContract.contract?.created_at)}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Umumiy summa:</span>
                            <span className="value-price">${Number(selectedContract.contract?.total_amount).toLocaleString()}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Status:</span>
                            <span className="value">{getStatusBadge(selectedContract.contract?.status)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Milestones */}
                    <div className="cm-details-right">
                      <div className="cm-info-section">
                        <div className="section-header">
                          <TrendingUp size={18} />
                          <h3>Ish bosqichlari (Milestones)</h3>
                        </div>
                        <div className="cm-milestones-list-alt">
                          {selectedContract.milestones?.length > 0 ? (
                            selectedContract.milestones.map((m, idx) => (
                              <div key={m.id} className="cm-milestone-card">
                                <div className="milestone-idx">#{idx + 1}</div>
                                <div className="milestone-content">
                                  <div className="milestone-h">
                                    <span className="title">{m.title}</span>
                                    <span className="amount">${m.amount}</span>
                                  </div>
                                  <div className="milestone-b">
                                    <span className={`status-pill ${m.status}`}>
                                      {m.status === 'released' ? 'To\'langan' : m.status === 'submitted' ? 'Yuborilgan' : 'Kutilmoqda'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="no-data">Bosqichlar belgilanmagan.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="cm-modal-footer">
                <button className="cm-primary-btn" onClick={() => setIsModalOpen(false)}>Yopish</button>
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