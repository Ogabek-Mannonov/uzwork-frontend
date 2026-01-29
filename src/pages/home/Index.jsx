import { useState } from "react";
import {
  Home,
  Users,
  Settings,
  FileText,
  ChevronRight,
  ChevronLeft,
  Search,
  Bell,
} from "lucide-react";
import "./homecss/home.css";

function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Bosh sahifa", path: "/" },
    { icon: Users, label: "Foydalanuvchilar", path: "/users" },
    { icon: FileText, label: "Hujjatlar", path: "/documents" },
    { icon: Settings, label: "Sozlamalar", path: "/settings" },
  ];

  return (
    <div className="container">
      {/* Header */}
      <header className={`header ${sidebarOpen ? "header-open" : "header-closed"}`}>
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>

        <div className="header-content">
          {/* Search */}
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Qidiruv..."
              className="search-input"
            />
          </div>

          {/* Right Side */}
          <div className="header-right">
            <div className="toggle-switch">
              <span>Toggle</span>
              <div className="switch">
                <div className="switch-knob"></div>
              </div>
            </div>
            <Bell size={20} className="bell-icon" />
            <Settings size={20} className="settings-icon" />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="toggle-button"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <nav className="nav">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button key={index} className="menu-button">
                <Icon size={20} className="menu-icon" />
                <span className={`menu-label ${sidebarOpen ? "show" : "hide"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main ${sidebarOpen ? "main-open" : "main-closed"}`}>
        {/* Hero Section */}
        <div className="hed-section">
          <div className="hed-content">
            <h1 className="hed-title">UzWork</h1>
            <h2 className="hed-subtitle">
              O'zbekistonning eng arzon freelance platformasi !
            </h2>
            <p className="hed-text">
              Biz bilan o'z ishingizni boshlang — tez, xavfsiz va davomli tekin.
              5 % komissiya • So'mda to'lov • Payme/Click bilan 10 soniyada •
              Mahaliy mijoz va freelancerlar • Pul escrowda 100 % himoyalangan •
              Birinchi loyihangizga 0 % komissiya!
            </p>
          </div>

          <svg
            className="wave-svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C300,120 600,0 900,60 C1050,90 1150,90 1200,60 L1200,120 L0,120 Z"
              fill="white"
              opacity="0.3"
            />
            <path
              d="M0,80 C300,140 600,20 900,80 C1050,110 1150,110 1200,80 L1200,120 L0,120 Z"
              fill="white"
              opacity="0.5"
            />
            <path
              d="M0,90 C300,150 600,30 900,90 C1050,120 1150,120 1200,90 L1200,120 L0,120 Z"
              fill="#f5f5f5"
            />
          </svg>
        </div>
      </main>
    </div>
  );
}

export default Index;
