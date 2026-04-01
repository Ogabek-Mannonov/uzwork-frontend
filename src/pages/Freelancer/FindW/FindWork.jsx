import { useState } from "react";
import { Search } from "lucide-react";
import "../../../assets/Freelancer/FindW/FindWork.css";
import Projects from "../../components/projectsCards";
import "../../../assets/style/theme.css";

export default function FindWork() {
  const [activeTab, setActiveTab] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "recommended", label: "Tavsiya etilgan" },
    { id: "recent", label: "Eng yangi" },
    { id: "saved", label: "Saqlangan ishlar" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Search mantig'i Projects komponentiga o'tadi
  };

  return (
    <div className="find-work-layout">
      {/* Search & Tabs Header */}
      <section className="fw-header-section">
        <div className="fw-header-content">
          <h1 className="fw-title">Ish qidirish</h1>
          
          <form className="fw-search-container" onSubmit={handleSearch}>
            <Search className="fw-search-icon" size={20} />
            <input 
              type="text" 
              className="fw-search-input"
              placeholder="Qobiliyatlar, ishlar, yoki kalit so'zlarni qidiring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="fw-search-btn">Qidirish</button>
          </form>

          <div className="fw-tabs">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`fw-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="fw-content">
        <Projects activeTab={activeTab} searchQuery={searchQuery} />
      </section>
    </div>
  );
}
