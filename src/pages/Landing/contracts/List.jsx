import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getMyContracts } from "../../../api/contracts";
import { 
  Users, 
  Calendar, 
  Search, 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Briefcase,
  ChevronRight,
  User
} from "lucide-react";
import Price from "../../components/Currency/Price";
import "./contracts.css";

const STATUS_CONFIG = {
  active:    { class: "cl-status--active", label: "Faol", icon: <Clock size={14} /> },
  completed: { class: "cl-status--completed", label: "Yakunlangan", icon: <CheckCircle size={14} /> },
  cancelled: { class: "cl-status--cancelled", label: "Bekor qilingan", icon: <XCircle size={14} /> },
  disputed:  { class: "cl-status--disputed", label: "Nizo", icon: <AlertCircle size={14} /> },
};

export default function ContractsList() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getMyContracts();
        if (res?.success === false) {
          setError(res?.message || "Kontraktlarni yuklashda xatolik");
        } else {
          let list = [];
          if (Array.isArray(res)) list = res;
          else if (Array.isArray(res?.data)) list = res.data;
          else if (Array.isArray(res?.contracts)) list = res.contracts;
          else if (Array.isArray(res?.data?.contracts)) list = res.data.contracts;
          setContracts(list);
        }
      } catch (err) {
        setError("Server bilan bog'lanishda muammo");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesTab = activeTab === "all" || c.status === activeTab;
      const matchesSearch = 
        (c.project_title || c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.freelancer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.client_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [contracts, activeTab, searchTerm]);

  return (
    <div className="cl-page">
      <header className="cl-header">
        <h1 className="cl-title">Mening Kontraktlarim</h1>
        <p className="cl-subtitle">Barcha faol va yakunlangan shartnomalaringizni boshqaring</p>
      </header>

      <div className="cl-controls">
        <div className="cl-tabs-wrapper">
          <div className="cl-tabs">
            {["all", "active", "completed", "cancelled", "disputed"].map((tab) => (
              <button
                key={tab}
                className={`cl-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "all" ? "Barchasi" : STATUS_CONFIG[tab]?.label || tab}
              </button>
            ))}
          </div>
        </div>

        <div className="cl-search-container">
          <Search size={18} className="cl-search-icon" />
          <input 
            type="text" 
            className="cl-search-input"
            placeholder="Loyiha yoki ism bo'yicha qidirish..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="cl-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="cl-card" style={{ height: 180, opacity: 0.5, animation: "pulse 2s infinite" }}></div>
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 60, background: "rgba(239, 68, 68, 0.1)", borderRadius: 24, color: "#ef4444" }}>
          <AlertCircle style={{ marginBottom: 16 }} size={48} />
          <p style={{ fontSize: 18, fontWeight: 600 }}>{error}</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, background: "var(--surface-2)", borderRadius: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3>Kontraktlar topilmadi</h3>
          <p>Hozircha sizda qidiruv mezonlariga mos shartnomalar yo'q.</p>
        </div>
      ) : (
        <div className="cl-list">
          {filteredContracts.map((c) => {
            const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.active;
            return (
              <div
                key={c.id}
                className="cl-card"
                onClick={() => navigate(`/contracts/${c.id}`)}
              >
                <div className="cl-card-main">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <h3 className="cl-card-title">
                        {c.job_title || c.project_title || c.title || `Kontrakt #${c.id}`}
                      </h3>
                      <div className="cl-card-users">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontSize: 14 }}>
                          <User size={14} style={{ color: 'var(--brand)' }} />
                          <span>Mijoz: {c.client_first_name ? `${c.client_first_name} ${c.client_last_name}` : c.client_name || "Mijoz"}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontSize: 14 }}>
                          <User size={14} style={{ color: 'var(--brand)' }} />
                          <span>Freelancer: {c.freelancer_first_name ? `${c.freelancer_first_name} ${c.freelancer_last_name}` : c.freelancer_name || "Freelancer"}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`cl-badge ${st.class}`}>
                      {st.label}
                    </div>
                  </div>

                  <div className="cl-card-grid">
                    <div className="cl-info-block">
                      <span className="cl-info-label">Boshlangan sana</span>
                      <div className="cl-info-value">
                        <Calendar size={14} style={{ marginRight: 6, opacity: 0.6 }} />
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Noma'lum"}
                      </div>
                    </div>
                    <div className="cl-info-block">
                      <span className="cl-info-label">Bosqichlar</span>
                      <div className="cl-info-value">
                        <Briefcase size={14} style={{ marginRight: 6, opacity: 0.6 }} />
                        {c.milestone_count || 0} ta milestone
                      </div>
                    </div>
                    <div className="cl-info-block">
                      <span className="cl-info-label">Umumiy summa</span>
                      <div className="cl-info-value amount">
                        <Price amount={c.total_amount || 0} currency={c.currency || 'UZS'} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cl-card-footer">
                  <div style={{ color: "var(--brand)", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    Batafsil <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
