import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Briefcase, 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { getMyContracts } from "../../api/contracts";
import Price from "../components/Currency/Price";
import "./MyJobs.css";

const STATUS_MAP = {
  active: { label: "Faol", class: "status--active" },
  completed: { label: "Yakunlangan", class: "status--completed" },
  cancelled: { label: "Bekor qilingan", class: "status--cancelled" },
  disputed: { label: "Nizo", class: "status--disputed" }
};

const FreelancerMyJobs = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const res = await getMyContracts();
        if (res?.success) {
          setContracts(res?.data?.contracts || res?.contracts || res?.data || []);
        } else {
          setError(res?.message || "Shartnomalarni yuklashda xato yuz berdi");
        }
      } catch (err) {
        setError("Server bilan ulanishda xato");
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesTab = activeTab === "all" || c.status === activeTab;
      const matchesSearch = (c.job_title || c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.client_first_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [contracts, activeTab, searchTerm]);

  const stats = useMemo(() => {
    const activeCount = contracts.filter(c => c.status === "active").length;
    const totalEarned = contracts
      .filter(c => c.status === "completed")
      .reduce((sum, c) => sum + (Number(c.total_amount) || 0), 0);
    
    return { activeCount, totalEarned };
  }, [contracts]);

  if (loading) {
    return (
      <div className="f-myjobs__loading">
        <div className="loader-spin"></div>
      </div>
    );
  }

  return (
    <div className="f-myjobs soft-fade-in">
      <div className="f-myjobs__header">
        <div className="f-myjobs__header-content">
          <h1 className="f-myjobs__title">{t("myJobsFreelancer.title", "Mening ishlarim")}</h1>
          <p className="f-myjobs__subtitle">
            {t("myJobsFreelancer.subtitle", "Barcha faol va yakunlangan loyihalaringizni boshqaring")}
          </p>
        </div>
        
        <div className="f-myjobs__stats">
          <div className="f-myjobs__stat-card glass-card">
            <div className="f-myjobs__stat-icon active-icon">
              <Briefcase size={20} />
            </div>
            <div className="f-myjobs__stat-info">
              <span className="f-myjobs__stat-label">{t("myJobsFreelancer.activeProjects", "Faol loyihalar")}</span>
              <span className="f-myjobs__stat-value">{stats.activeCount}</span>
            </div>
          </div>
          <div className="f-myjobs__stat-card glass-card">
            <div className="f-myjobs__stat-icon earned-icon">
              <DollarSign size={20} />
            </div>
            <div className="f-myjobs__stat-info">
              <span className="f-myjobs__stat-label">{t("myJobsFreelancer.totalEarnings", "Umumiy daromad")}</span>
              <span className="f-myjobs__stat-value">
                <Price amount={stats.totalEarned} currency="UZS" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="f-myjobs__controls">
        <div className="f-myjobs__tabs-wrapper">
          <div className="f-myjobs__tabs">
            {["active", "completed", "all"].map(tab => (
              <button 
                key={tab}
                className={`f-myjobs__tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`myJobsFreelancer.tabs.${tab}`, tab === "active" ? "Faol" : tab === "completed" ? "Yakunlangan" : "Barchasi")}
              </button>
            ))}
          </div>
        </div>

        <div className="f-myjobs__search-container">
          <Search size={18} className="f-myjobs__search-icon" />
          <input 
            type="text" 
            placeholder={t("myJobsFreelancer.searchPlaceholder", "Loyiha yoki mijoz nomi bo'yicha qidirish...")} 
            className="f-myjobs__search-input glass-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="f-myjobs__empty glass-card">
          <AlertCircle size={48} className="text-danger" />
          <h3 className="f-myjobs__empty-title">{t("chat.error", "Xato")}</h3>
          <p className="f-myjobs__empty-desc">{error}</p>
        </div>
      ) : filteredContracts.length > 0 ? (
        <div className="f-myjobs__list">
          {filteredContracts.map((contract, index) => (
            <div 
              key={contract.id} 
              className={`contract-card glass-card soft-fade-in stagger-${(index % 5) + 1}`}
              onClick={() => navigate(`/contracts/${contract.id}`)}
            >
              <div className="contract-card__main">
                <div className="contract-card__header">
                  <div className="contract-card__info">
                    <h2 className="contract-card__title">
                      {contract.job_title || contract.title || `Kontrakt #${contract.id}`}
                    </h2>
                    <div className="contract-card__client">
                      <div className="client-avatar-mini">
                        {contract.client_first_name?.[0] || "M"}
                      </div>
                      <span>{contract.client_first_name} {contract.client_last_name}</span>
                    </div>
                  </div>
                  <div className={`contract-status-badge ${STATUS_MAP[contract.status]?.class || ""}`}>
                    <div className="status-dot"></div>
                    {t(`myJobsFreelancer.tabs.${contract.status}`, STATUS_MAP[contract.status]?.label) || contract.status}
                  </div>
                </div>

                <div className="contract-card__grid">
                  <div className="card-stat">
                    <span className="card-stat__label">{t("myJobsFreelancer.contract.amount", "Summa")}</span>
                    <span className="card-stat__value amount">
                      <Price amount={contract.total_amount} currency={contract.currency || contract.job_currency || 'UZS'} />
                    </span>
                  </div>
                  <div className="card-stat">
                    <span className="card-stat__label">{t("myJobsFreelancer.contract.startDate", "Boshlangan sana")}</span>
                    <span className="card-stat__value">
                      {contract.created_at ? new Date(contract.created_at).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="card-stat">
                    <span className="card-stat__label">{t("myJobsFreelancer.contract.lastUpdate", "Oxirgi yangilanish")}</span>
                    <span className="card-stat__value">
                      {contract.updated_at ? new Date(contract.updated_at).toLocaleDateString() : "Yaqinda"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="contract-card__footer">
                <button 
                  className="btn-chat-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/messages/${contract.id}`);
                  }}
                >
                  <MessageSquare size={18} />
                  <span>{t("myJobsFreelancer.contract.chat", "Chat")}</span>
                </button>
                <button className="btn-details-action">
                  <span>{t("myJobsFreelancer.contract.details", "Batafsil")}</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="f-myjobs__empty">
          <div className="f-myjobs__empty-icon">
            <Briefcase size={32} />
          </div>
          <h3 className="f-myjobs__empty-title">{t("myJobsFreelancer.empty.noProjects")}</h3>
          <p className="f-myjobs__empty-desc">
            {t("myJobsFreelancer.empty.desc", { 
              status: t(`myJobsFreelancer.tabs.${activeTab}`).toLowerCase() 
            })}
          </p>
          <button 
            className="btn-icon-text btn-primary" 
            style={{ marginTop: "24px" }}
            onClick={() => navigate("/find-work")}
          >
            {t("myJobsFreelancer.empty.findWork")}
          </button>
        </div>
      )}
    </div>
  );
};

export default FreelancerMyJobs;
