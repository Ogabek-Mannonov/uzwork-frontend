import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getContracts, 
  getMyContracts 
} from "../../../api/contracts";
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  Calendar, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ChevronRight
} from "lucide-react";
import "./contracts.css";

const STATUS_CONFIG = {
  active:    { class: "status-active", label: "Faol", icon: <Clock size={14} /> },
  completed: { class: "status-completed", label: "Yakunlangan", icon: <CheckCircle size={14} /> },
  cancelled: { class: "status-cancelled", label: "Bekor qilingan", icon: <XCircle size={14} /> },
  disputed:  { class: "status-disputed", label: "Nizo", icon: <AlertCircle size={14} /> },
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
          // Normalize API response data structure
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
    <div className="contracts-page">
      <div className="contracts-header">
        <div>
          <h1>Mening Kontraktlarim</h1>
          <p style={{ color: "#666", marginTop: 4 }}>Barcha faol va yakunlangan shartnomalaringizni boshqaring</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div className="contracts-tabs">
          {["all", "active", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              className={`contracts-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "Barchasi" : STATUS_CONFIG[tab]?.label || tab}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: 300 }}>
          <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
          <input 
            type="text" 
            placeholder="Loyiha yoki ism bo'yicha qidirish..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "10px 12px 10px 40px", 
              borderRadius: 12, 
              border: "1px solid #edeef0",
              outline: "none",
              fontSize: 14
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="contracts-grid">
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 160, background: "#f5f6f7", borderRadius: 16, animate: "pulse 2s infinite" }}></div>
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 40, background: "#fff1f0", borderRadius: 16, color: "#cf1322" }}>
          <AlertCircle style={{ marginBottom: 12 }} size={40} />
          <p>{error}</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Kontraktlar topilmadi</h3>
          <p>Hozircha sizda qidiruv mezonlariga mos shartnomalar yo'q.</p>
        </div>
      ) : (
        <div className="contracts-grid">
          {filteredContracts.map((c) => {
            const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.active;
            return (
              <div
                key={c.id}
                className="contract-card"
                onClick={() => navigate(`/contracts/${c.id}`)}
              >
                <div className="contract-card-top">
                  <div>
                    <h3 className="contract-title">
                      {c.job_title || c.project_title || c.title || `Kontrakt #${c.id}`}
                    </h3>
                    <div className="contract-meta">
                      <div className="meta-item">
                        <Users size={14} /> 
                        <span>{c.client_first_name ? `${c.client_first_name} ${c.client_last_name}` : c.client_name || "Mijoz"}</span>
                      </div>
                      <div className="meta-item">
                        <Users size={14} /> 
                        <span>{c.freelancer_first_name ? `${c.freelancer_first_name} ${c.freelancer_last_name}` : c.freelancer_name || "Freelancer"}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`contract-status ${st.class}`}>
                    {st.icon} <span style={{ marginLeft: 6 }}>{st.label}</span>
                  </div>
                </div>

                <div className="contract-card-footer">
                  <div className="contract-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : (c.start_date ? new Date(c.start_date).toLocaleDateString() : "Sana ko'rsatilmagan")}</span>
                    </div>
                    <div className="meta-item">
                      <Briefcase size={14} />
                      <span>{c.milestone_count || 0} ta bosqich</span>
                    </div>
                  </div>
                  <div className="contract-price">
                    💰 ${c.total_amount || 0}
                  </div>
                </div>
                
                <div style={{ position: "absolute", right: 24, bottom: 24, opacity: 0.1 }}>
                  <ChevronRight size={48} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
