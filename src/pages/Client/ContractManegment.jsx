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
import { useTranslation } from "react-i18next";
import { getMyContracts, getContractById } from "../../api/contracts";
import Price from "../components/Currency/Price";
import { useCurrency } from "../components/Currency/CurrencyContext";
import "./css/contractmanegment.css";

const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api\/?$/, "");

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND}${cleanUrl}`;
}

const ContractManagement = () => {
  const { t, i18n } = useTranslation();
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
  const { convert, currency: selectedCurrency } = useCurrency();
  
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

  // Modal ochiqligida sahifa skrollini to'xtatib turish
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

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

  const stats = React.useMemo(() => {
    let total = 0;
    let paid = 0;
    contracts.forEach(c => {
      const ccy = c.currency || c.job_currency || 'USD';
      total += convert(Number(c.total_amount) || 0, ccy, selectedCurrency);
      paid += convert(Number(c.paid_amount) || 0, ccy, selectedCurrency);
    });
    return {
      active: contracts.filter(c => c.status === "active").length,
      total,
      paid,
      escrow: total - paid,
    };
  }, [contracts, convert, selectedCurrency]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "active":
        return <span className="cm-status-badge cm-active"><CheckCircle size={12} /> {t('contracts.status.active')}</span>;
      case "completed":
        return <span className="cm-status-badge cm-ended"><CheckCircle size={12} /> {t('contracts.status.completed')}</span>;
      case "cancelled":
        return <span className="cm-status-badge cm-ended" style={{ background: "#fee2e2", color: "#ef4444" }}><X size={12} /> {t('contracts.status.cancelled')}</span>;
      default:
        return <span className="cm-status-badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="cm-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader"></div>
          <p style={{ marginTop: 20, color: '#666' }}>{t('contracts.modal.loading')}</p>
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
            <h1>{t('contracts.title')}</h1>
            <p>{t('contracts.subtitle')}</p>
          </div>
          <div className="cm-header-actions" style={{ display: 'flex', gap: '12px' }}>
            <button className="cm-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> {t('contracts.back')}
            </button>
            <button className="cm-create-btn" onClick={() => navigate("/client/talent")}>
              <Plus size={18} /> {t('contracts.newContract')}
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
              <span className="cm-stat-label">{t('contracts.stats.active')}</span>
            </div>
          </div>
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-total">
              <DollarSign size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">
                <Price amount={stats.total} currency={selectedCurrency} />
              </span>
              <span className="cm-stat-label">{t('contracts.stats.total')}</span>
            </div>
          </div>
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-paid">
              <CheckCircle size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">
                <Price amount={stats.paid} currency={selectedCurrency} />
              </span>
              <span className="cm-stat-label">{t('contracts.stats.paid')}</span>
            </div>
          </div>
          <div className="cm-stat-card">
            <div className="cm-stat-icon cm-escrow">
              <Shield size={20} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-value">
                <Price amount={stats.escrow} currency={selectedCurrency} />
              </span>
              <span className="cm-stat-label">{t('contracts.stats.escrow')}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="cm-tabs">
          <button
            className={`cm-tab-btn ${activeTab === "active" ? "cm-active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <FileText size={16} /> {t('contracts.tabs.active')}
          </button>
          <button
            className={`cm-tab-btn ${activeTab === "ended" ? "cm-active" : ""}`}
            onClick={() => setActiveTab("ended")}
          >
            <Flag size={16} /> {t('contracts.tabs.ended')}
          </button>
        </div>

        {/* Search */}
        <div className="cm-search">
          <div className="cm-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder={t('contracts.searchPlaceholder')}
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
                  <h3>{contract.job_title || t('contracts.card.projectTitle')}</h3>
                  {getStatusBadge(contract.status)}
                </div>
                <div className="cm-contract-actions" style={{ display: "flex", gap: "8px" }}>
                  <button 
                    className="cm-action-btn cm-view"
                    onClick={() => handleViewDetails(contract)}
                  >
                    <Eye size={16} /> {t('contracts.card.viewDetails')}
                  </button>
                  <button 
                    className="cm-action-btn cm-view"
                    style={{ background: "var(--brand, #2563eb)", color: "#fff", borderColor: "var(--brand, #2563eb)" }}
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    <ExternalLink size={16} /> Boshqarish
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
                        <Users size={12} /> {t('contracts.card.profile')}
                      </button>
                      <button 
                        className="cm-btn-primary cm-btn-sm" 
                        onClick={() => navigate(`/messages/${contract.id}`)}
                      >
                        <MessageSquare size={12} /> {t('contracts.card.chat')}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="cm-contract-details">
                  <div className="cm-detail">
                    <DollarSign size={14} />
                    <span><Price amount={contract.total_amount} currency={contract.currency || contract.job_currency || 'USD'} /></span>
                  </div>
                  <div className="cm-detail">
                    <Clock size={14} />
                    <span>{t('contracts.card.ongoing')}</span>
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
              <h3>{t('contracts.card.noContracts')}</h3>
              <p>{t('contracts.card.noContractsSub', { status: activeTab === 'active' ? t('contracts.card.statusActive') : t('contracts.card.statusEnded') })}</p>
            </div>
          )}
        </div>

        {/* Contract Details Modal */}
        {isModalOpen && selectedContract && (
          <div className="cm-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="cm-modal-content cm-detail-modal" onClick={e => e.stopPropagation()}>
              <div className="cm-modal-header">
                <div className="header-info">
                  <h2>{selectedContract.contract?.job_title || selectedContract.job_title || t('contracts.modal.details')}</h2>
                  <p className="cm-contract-id">ID: #{selectedContract.contract?.id || selectedContract.id}</p>
                </div>
                <button className="cm-close-modal" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {detailsLoading ? (
                <div className="modal-loader-wrap">
                  <div className="loader"></div>
                  <p>{t('contracts.modal.loading')}</p>
                </div>
              ) : (
                <div className="cm-modal-body">
                  <div className="cm-details-grid">
                    {/* Left Column */}
                    <div className="cm-details-left">
                      <div className="cm-info-section">
                        <div className="section-header">
                          <Users size={18} />
                          <h3>{t('contracts.modal.freelancerInfo')}</h3>
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
                                <Users size={14} /> {t('contracts.modal.viewProfile')}
                              </button>
                              <button 
                                className="cm-btn-primary cm-btn-sm" 
                                onClick={() => navigate(`/messages/${selectedContract.contract?.id || selectedContract.id}`)}
                              >
                                <MessageSquare size={14} /> {t('contracts.modal.goToChat')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="cm-info-section">
                        <div className="section-header">
                          <FileText size={18} />
                          <h3>{t('contracts.modal.contractInfo')}</h3>
                        </div>
                        <div className="cm-info-list">
                          <div className="info-item">
                            <span className="label">{t('contracts.modal.startDate')}</span>
                            <span className="value">{formatDate(selectedContract.contract?.created_at)}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">{t('contracts.modal.totalAmount')}</span>
                            <span className="value-price">
                              <Price amount={selectedContract.contract?.total_amount || selectedContract.total_amount} currency={selectedContract.contract?.currency || selectedContract.currency || selectedContract.contract?.job_currency || selectedContract.job_currency || 'USD'} />
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="label">{t('contracts.modal.status')}</span>
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
                          <h3>{t('contracts.modal.milestones')}</h3>
                        </div>
                        <div className="cm-milestones-list-alt">
                          {selectedContract.milestones?.length > 0 ? (
                            selectedContract.milestones.map((m, idx) => (
                              <div key={m.id} className="cm-milestone-card">
                                <div className="milestone-idx">#{idx + 1}</div>
                                <div className="milestone-content">
                                  <div className="milestone-h">
                                    <span className="title">{m.title}</span>
                                    <span className="amount"><Price amount={m.amount} currency={selectedContract.contract?.currency || selectedContract.currency || selectedContract.contract?.job_currency || selectedContract.job_currency || 'USD'} /></span>
                                  </div>
                                  <div className="milestone-b">
                                    <span className={`status-pill ${m.status}`}>
                                      {m.status === 'released' ? t('contracts.modal.paid') : m.status === 'submitted' ? t('contracts.modal.submitted') : t('contracts.modal.pending')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="no-data">{t('contracts.modal.milestonesEmpty')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="cm-modal-footer" style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button className="cm-secondary-btn" style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-2)", background: "none", cursor: "pointer" }} onClick={() => setIsModalOpen(false)}>{t('contracts.modal.close')}</button>
                <button 
                  className="cm-primary-btn" 
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  onClick={() => navigate(`/contracts/${selectedContract.contract?.id || selectedContract.id}`)}
                >
                  <ExternalLink size={16} /> Boshqarish & Nizo ochish
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