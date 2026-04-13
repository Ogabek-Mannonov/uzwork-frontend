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
        <div>
          <h1 className="f-myjobs__title">{t("myJobsFreelancer.title")}</h1>
          <p style={{ color: "var(--muted)", marginTop: "8px" }}>
            {t("myJobsFreelancer.subtitle")}
          </p>
        </div>
        
        <div className="f-myjobs__stats">
          <div className="f-myjobs__stat-card">
            <span className="f-myjobs__stat-label">{t("myJobsFreelancer.activeProjects")}</span>
            <span className="f-myjobs__stat-value">{stats.activeCount}</span>
          </div>
          <div className="f-myjobs__stat-card">
            <span className="f-myjobs__stat-label">{t("myJobsFreelancer.totalEarnings")}</span>
            <span className="f-myjobs__stat-value">${stats.totalEarned.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="f-myjobs__tabs">
        {["active", "completed", "all"].map(tab => (
          <button 
            key={tab}
            className={`f-myjobs__tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {t(`myJobsFreelancer.tabs.${tab}`)}
          </button>
        ))}
      </div>

      <div className="f-myjobs__filters">
        <div className="f-myjobs__search">
          <Search size={18} className="f-myjobs__search-icon" />
          <input 
            type="text" 
            placeholder={t("myJobsFreelancer.searchPlaceholder")} 
            className="f-myjobs__search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="f-myjobs__empty">
          <AlertCircle size={48} color="#ef4444" />
          <h3 className="f-myjobs__empty-title">{t("chat.error")}</h3>
          <p className="f-myjobs__empty-desc">{error}</p>
        </div>
      ) : filteredContracts.length > 0 ? (
        <div className="f-myjobs__list">
          {filteredContracts.map((contract, index) => (
            <div 
              key={contract.id} 
              className={`contract-card soft-fade-in stagger-${(index % 5) + 1}`}
              onClick={() => navigate(`/contracts/${contract.id}`)}
            >
              <div className="contract-card__main">
                <div className="contract-card__header">
                  <div>
                    <h2 className="contract-card__title">
                      {contract.job_title || contract.title || `Kontrakt #${contract.id}`}
                    </h2>
                    <div className="contract-card__client">
                      <Briefcase size={14} /> 
                      {contract.client_first_name} {contract.client_last_name}
                    </div>
                  </div>
                  <span className={`contract-card__status ${STATUS_MAP[contract.status]?.class || ""}`}>
                    {t(`myJobsFreelancer.tabs.${contract.status}`) || contract.status}
                  </span>
                </div>

                <div className="contract-card__meta">
                  <div className="meta-item">
                    <span className="meta-item__label">{t("myJobsFreelancer.contract.amount")}</span>
                    <span className="meta-item__value">
                      <DollarSign size={14} style={{ marginBottom: "-2px" }} />
                      {contract.total_amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-item__label">{t("myJobsFreelancer.contract.startDate")}</span>
                    <span className="meta-item__value">
                      <Calendar size={14} style={{ marginBottom: "-2px", marginRight: "4px" }} />
                      {contract.created_at ? new Date(contract.created_at).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-item__label">{t("myJobsFreelancer.contract.lastUpdate")}</span>
                    <span className="meta-item__value">
                      <Clock size={14} style={{ marginBottom: "-2px", marginRight: "4px" }} />
                      {contract.updated_at ? new Date(contract.updated_at).toLocaleDateString() : "Yaqinda"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="contract-card__actions">
                <button 
                  className="btn-icon-text btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/messages/${contract.id}`);
                  }}
                >
                  <MessageSquare size={16} /> {t("myJobsFreelancer.contract.chat")}
                </button>
                <button className="btn-icon-text btn-outline">
                  {t("myJobsFreelancer.contract.details")} <ChevronRight size={16} />
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
