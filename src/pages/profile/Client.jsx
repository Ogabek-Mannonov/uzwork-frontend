import React, { useState, useEffect } from "react";
import {
  User,
  Settings as SettingsIcon,
  CreditCard,
  Shield,
  Users,
  Award,
  Bell,
  FileText,
  Link,
  AlertTriangle,
  ChevronRight,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  HelpCircle,
  Briefcase,
  MessageCircle,
  BarChart,
  Clock,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit,
  Eye,
  EyeOff,
  Save,
  Moon,
  Sun,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Info,
  Lock,
  Key,
  Fingerprint,
  Smartphone,
  Laptop,
  Globe2,
  DollarSign,
  Calendar,
  Camera,
  Image as ImageIcon,
  Home,
  Star,
  TrendingUp,
  Award as Trophy,
  Building,
  Palette,
  RefreshCw,
  LogIn,
  UserPlus,
  Filter,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Printer,
  Copy,
  ExternalLink,
  Heart,
  Bookmark,
  Flag,
  MoreHorizontal
} from "lucide-react";
import "./profile-css/klient.css";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("my-info");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [activeHeaderTab, setActiveHeaderTab] = useState("hire");
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const [userData, setUserData] = useState({
    name: "Ogabek",
    fullName: "Ogabek Karimov",
    username: "@ogabek_k",
    email: "ogabek.k@gmail.com",
    phone: "+998 90 123 45 67",
    location: "Tashkent, Uzbekistan",
    timezone: "GMT+5",
    language: "English (US)",
    accountType: "Client Account",
    membership: "Basic",
    company: "Ogabek Karimov",
    companyDetails: "Freelance Designer",
    bio: "Experienced UI/UX designer with 5+ years of experience creating beautiful and functional digital products.",
    profilePicture: "https://i.pravatar.cc/300?img=8",
    coverPhoto: "https://images.unsplash.com/photo-1579547944212-c4f4961a8dd8?w=1200",
    jobSuccessScore: 98,
    totalSpent: 24850,
    pendingAmount: 1200,
    availableBalance: 5000,
    completedJobs: 42,
    activeJobs: 3,
    rating: 4.9
  });

  // Navigation sections
  const navSections = [
    {
      title: "SETTINGS",
      items: [
        { id: "my-info", label: "My Info", icon: <User size={18} />, badge: null },
        { id: "billing", label: "Billing & Payments", icon: <CreditCard size={18} />, badge: null },
        { id: "password", label: "Password & Security", icon: <Shield size={18} />, badge: null },
        { id: "teams", label: "Teams & Members", icon: <Users size={18} />, badge: "2" },
        { id: "membership", label: "Membership", icon: <Award size={18} />, badge: "Basic" },
        { id: "notifications", label: "Notification Settings", icon: <Bell size={18} />, badge: null },
        { id: "tax", label: "Tax Information", icon: <FileText size={18} />, badge: null },
        { id: "services", label: "Connected Services", icon: <Link size={18} />, badge: "3" },
        { id: "appeals", label: "Appeals Tracker", icon: <AlertTriangle size={18} />, badge: null }
      ]
    }
  ];

  // Header navigation
  const headerNav = [
    { id: "hire", label: "Hire talent", icon: <Briefcase size={16} />, active: activeHeaderTab === "hire" },
    { id: "manage", label: "Manage work", icon: <BarChart size={16} />, active: activeHeaderTab === "manage" },
    { id: "reports", label: "Reports", icon: <FileText size={16} />, active: activeHeaderTab === "reports" },
    { id: "messages", label: "Messages", icon: <MessageCircle size={16} />, active: activeHeaderTab === "messages", badge: notifications }
  ];

  // Header actions handlers
  const handleHeaderNavClick = (id) => {
    setActiveHeaderTab(id);
    showMessage("info", `Navigating to ${headerNav.find(item => item.id === id).label}...`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showMessage("info", `Searching for "${searchQuery}"...`);
    }
  };

  const handleNotificationClick = () => {
    setNotifications(0);
    showMessage("success", "All notifications marked as read");
  };

  const handleUserMenuClick = (action) => {
    setShowUserMenu(false);
    showMessage("info", `${action} clicked`);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  // Notification settings
  const notificationSettings = [
    {
      category: "Job Opportunities",
      settings: [
        { id: "job_alerts", label: "Job alerts", description: "Get notified about new jobs matching your skills", enabled: true },
        { id: "proposal_updates", label: "Proposal updates", description: "Updates on your job proposals", enabled: true },
        { id: "client_messages", label: "Client messages", description: "Direct messages from clients", enabled: true }
      ]
    },
    {
      category: "Account Activity",
      settings: [
        { id: "login_alerts", label: "Login alerts", description: "Get notified of new sign-ins to your account", enabled: true },
        { id: "payment_updates", label: "Payment updates", description: "Payment confirmations and receipts", enabled: true },
        { id: "security_alerts", label: "Security alerts", description: "Important security notifications", enabled: true }
      ]
    },
    {
      category: "Marketing",
      settings: [
        { id: "newsletter", label: "Newsletter", description: "Receive our monthly newsletter", enabled: false },
        { id: "promotions", label: "Promotions", description: "Special offers and promotions", enabled: false },
        { id: "tips", label: "Tips & resources", description: "Helpful tips and resources", enabled: true }
      ]
    }
  ];

  // Billing methods
  const billingMethods = [
    { id: 1, type: "visa", last4: "4242", exp: "12/25", default: true },
    { id: 2, type: "bank", account: "**** 1234", bank: "Kapital Bank", default: false }
  ];

  // Transactions
  const transactions = [
    {
      id: 1,
      project: "E-commerce Website Development",
      freelancer: "Alisher E.",
      date: "Jan 15, 2024",
      amount: 1200,
      type: "payment",
      status: "completed"
    },
    {
      id: 2,
      project: "Mobile App UI Design",
      freelancer: "Nilufar A.",
      date: "Jan 10, 2024",
      amount: 850,
      type: "payment",
      status: "completed"
    },
    {
      id: 3,
      project: "Logo Design",
      freelancer: "Jasur M.",
      date: "Jan 5, 2024",
      amount: 350,
      type: "payment",
      status: "completed"
    }
  ];

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Password validation state
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState([
    { 
      id: "2fa", 
      label: "Two-factor authentication", 
      description: "Add an extra layer of security to your account", 
      enabled: false,
      icon: <Fingerprint size={20} />,
      color: "#3b82f6"
    },
    { 
      id: "login_notify", 
      label: "Login notifications", 
      description: "Get notified via email whenever a new device logs into your account", 
      enabled: true,
      icon: <Bell size={20} />,
      color: "#10b981"
    },
    { 
      id: "device_management", 
      label: "Device management", 
      description: "Manage and review devices that have access to your account", 
      enabled: true,
      icon: <Smartphone size={20} />,
      color: "#8b5cf6"
    },
    { 
      id: "password_expiry", 
      label: "Password expiry", 
      description: "Require password change every 90 days for enhanced security", 
      enabled: false,
      icon: <Clock size={20} />,
      color: "#f59e0b"
    }
  ]);

  // Active sessions
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: "MacBook Pro",
      browser: "Chrome 120.0",
      location: "Tashkent, Uzbekistan",
      ip: "192.168.1.1",
      lastActive: "now",
      current: true,
      icon: <Laptop size={20} />,
      os: "macOS"
    },
    {
      id: 2,
      device: "iPhone 14",
      browser: "Safari",
      location: "Tashkent, Uzbekistan",
      ip: "192.168.1.2",
      lastActive: "2 days ago",
      current: false,
      icon: <Smartphone size={20} />,
      os: "iOS"
    },
    {
      id: 3,
      device: "Windows PC",
      browser: "Firefox",
      location: "Moscow, Russia",
      ip: "192.168.1.3",
      lastActive: "1 week ago",
      current: false,
      icon: <Globe2 size={20} />,
      os: "Windows"
    }
  ]);

  // Password strength checks
  const passwordStrengthChecks = [
    { id: "length", label: "At least 8 characters", validator: (pwd) => pwd.length >= 8 },
    { id: "uppercase", label: "One uppercase letter", validator: (pwd) => /[A-Z]/.test(pwd) },
    { id: "lowercase", label: "One lowercase letter", validator: (pwd) => /[a-z]/.test(pwd) },
    { id: "number", label: "One number", validator: (pwd) => /\d/.test(pwd) },
    { id: "special", label: "One special character", validator: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    strength = checks.filter(Boolean).length;
    return {
      score: strength,
      percentage: (strength / 5) * 100,
      label: strength <= 2 ? "Weak" : strength <= 4 ? "Medium" : "Strong",
      color: strength <= 2 ? "#ef4444" : strength <= 4 ? "#f59e0b" : "#10b981"
    };
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle password change
  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    
    if (field === "newPassword") {
      const validations = {
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      };
      setPasswordValidations(prev => ({ ...prev, ...validations }));
    }
    
    if (field === "confirmPassword" || field === "newPassword") {
      const match = field === "confirmPassword" 
        ? value === passwordForm.newPassword 
        : passwordForm.confirmPassword === value;
      setPasswordValidations(prev => ({ ...prev, match }));
    }
  };

  // Handle update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword) {
      showMessage("error", "Please enter your current password");
      return;
    }
    
    if (!passwordForm.newPassword) {
      showMessage("error", "Please enter a new password");
      return;
    }
    
    if (!passwordForm.confirmPassword) {
      showMessage("error", "Please confirm your new password");
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }
    
    const strength = calculatePasswordStrength(passwordForm.newPassword);
    if (strength.score < 3) {
      showMessage("error", "Password is too weak. Please choose a stronger password.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showMessage("success", "Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordValidations({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        match: false
      });
    } catch (err) {
      console.error("Password update error:", err);
      showMessage("error", "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle security setting
  const toggleSecuritySetting = (id) => {
    setSecuritySettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
    
    const setting = securitySettings.find(s => s.id === id);
    showMessage("success", `${setting.label} ${!setting.enabled ? 'enabled' : 'disabled'} successfully!`);
  };

  // Handle revoke session
  const handleRevokeSession = (sessionId) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    showMessage("success", "Session revoked successfully!");
  };

  // Handle enable 2FA
  const handleEnable2FA = () => {
    showMessage("info", "2FA setup wizard will open...");
  };

  // Handle save profile
  const handleSaveProfile = () => {
    setIsEditing(false);
    showMessage("success", "Profile updated successfully!");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    showMessage("success", `${!darkMode ? 'Dark' : 'Light'} mode activated`);
  };

  const passwordStrength = calculatePasswordStrength(passwordForm.newPassword);

  // Handle section change
  const handleSectionChange = (id, label) => {
    setActiveSection(id);
    setShowMobileMenu(false);
    showMessage("info", `Opening ${label}...`);
  };

  return (
    <div className={`settings-container ${darkMode ? 'dark' : 'light'}`}>
      
      {/* HEADER */}
      <header className="settings-header">
        <div className="header-container">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            
            <div className="brand-section">
              <div className="logo" onClick={() => handleUserMenuClick("Logo")}>
                <span className="logo-text">UzWork</span>
                <span className="logo-tm">®</span>
              </div>
            </div>
            
            <nav className="header-nav">
              {headerNav.map((item) => (
                <button 
                  key={item.id}
                  className={`nav-item ${item.active ? 'active' : ''}`}
                  onClick={() => handleHeaderNavClick(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="header-right">
            <form onSubmit={handleSearch} className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search talent, jobs, messages..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="search-clear" 
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <div className="search-shortcut">⌘K</div>
            </form>
            
            <div className="header-actions">
              <button className="cl-theme-toggle" onClick={toggleDarkMode} aria-label="Toggle theme">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <button className="notification-btn" onClick={handleNotificationClick} aria-label="Notifications">
                <Bell size={18} />
                {notifications > 0 && <span className="notification-badge"></span>}
              </button>
              
              <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="user-avatar-wrapper">
                  <img 
                    src={userData.profilePicture} 
                    alt="Profile" 
                    className="user-avatar" 
                  />
                  <span className="user-status online"></span>
                </div>
                <div className="user-details">
                  <span className="user-display-name">{userData.name}</span>
                  <span className="user-role">Client</span>
                </div>
                <ChevronDown size={16} className={`dropdown-icon ${showUserMenu ? 'open' : ''}`} />
              </div>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <img src={userData.profilePicture} alt={userData.name} className="dropdown-avatar" />
                    <div>
                      <h4>{userData.fullName}</h4>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-menu">
                    <button onClick={() => handleUserMenuClick("Profile")}>
                      <User size={14} /> Profile
                    </button>
                    <button onClick={() => handleUserMenuClick("Settings")}>
                      <SettingsIcon size={14} /> Settings
                    </button>
                    <button onClick={() => handleUserMenuClick("Help")}>
                      <HelpCircle size={14} /> Help
                    </button>
                    <hr />
                    <button onClick={() => handleUserMenuClick("Sign Out")}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="settings-main">
        
        {/* SIDEBAR - FIXED */}
        <aside className={`settings-sidebar ${showMobileMenu ? 'open' : ''}`}>
          <div className="cl-sidebar-header">
            <h2>Settings</h2>
            <button 
              className="close-sidebar"
              onClick={() => setShowMobileMenu(false)}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
          
          <nav className="sidebar-nav">
            {navSections.map((section, idx) => (
              <div key={idx} className="nav-section">
                <h3 className="section-title">{section.title}</h3>
                <ul className="nav-list">
                  {section.items.map(item => (
                    <li key={item.id}>
                      <button
                        className={`cl-nav-link ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => handleSectionChange(item.id, item.label)}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                        {item.badge && <span className="nav-badge">{item.badge}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          
          <div className="sidebar-footer">
            <button className="sidebar-footer-btn" onClick={() => handleUserMenuClick("Help & Support")}>
              <HelpCircle size={16} />
              Help & Support
            </button>
            <button className="sidebar-footer-btn" onClick={() => handleUserMenuClick("Sign Out")}>
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="settings-content">
          
          {/* Global Message Banner */}
          {message.text && (
            <div className={`message-banner ${message.type}`}>
              {message.type === "success" && <CheckCircle size={20} />}
              {message.type === "error" && <AlertCircle size={20} />}
              {message.type === "info" && <Info size={20} />}
              <span>{message.text}</span>
              <button className="close-message" onClick={() => setMessage({ type: "", text: "" })}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* MY INFO SECTION */}
          {activeSection === "my-info" && (
            <div className="content-section">
              <div className="section-header">
                <div className="header-left">
                  <h1 className="section-title">My Info</h1>
                  <span className="section-badge">
                    <User size={14} />
                    Personal Information
                  </span>
                </div>
                <button 
                  className={`edit-btn ${isEditing ? 'editing' : ''}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <X size={16} />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit size={16} />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
              
              <div className="profile-card">
                <div className="profile-cover">
                  <img src={userData.coverPhoto} alt="Cover" className="cover-image" />
                  {isEditing && (
                    <button className="change-cover-btn" onClick={() => handleUserMenuClick("Change cover")}>
                      <Camera size={16} />
                      Change Cover
                    </button>
                  )}
                </div>
                
                <div className="profile-content">
                  <div className="profile-avatar-section">
                    <div className="avatar-wrapper">
                      <img 
                        src={userData.profilePicture} 
                        alt="Profile" 
                        className="profile-avatar" 
                      />
                      {isEditing && (
                        <button className="change-avatar-btn" onClick={() => handleUserMenuClick("Change avatar")}>
                          <Camera size={14} />
                        </button>
                      )}
                      <span className="avatar-status online"></span>
                    </div>
                    
                    <div className="profile-name-section">
                      <div className="name-wrapper">
                        <h2>{userData.fullName}</h2>
                        <div className="profile-badges">
                          <span className="badge membership">
                            <Award size={12} />
                            {userData.membership}
                          </span>
                          <span className="badge verified">
                            <CheckCircle size={12} />
                            Verified
                          </span>
                        </div>
                      </div>
                      <p className="profile-username">{userData.username}</p>
                      <p className="profile-company">{userData.company}</p>
                    </div>
                  </div>
                  
                  <div className="profile-stats">
                    <div className="stat-item">
                      <span className="stat-value">{userData.completedJobs}</span>
                      <span className="stat-label">Jobs Posted</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">${(userData.totalSpent / 1000).toFixed(1)}k</span>
                      <span className="stat-label">Total Spent</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{userData.rating}</span>
                      <span className="stat-label">Rating</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{userData.activeJobs}</span>
                      <span className="stat-label">Active</span>
                    </div>
                  </div>
                  
                  <div className="profile-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-icon">
                          <Mail size={16} />
                        </span>
                        <div className="detail-content">
                          <span className="detail-label">Email</span>
                          {isEditing ? (
                            <input
                              type="email"
                              value={userData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <div className="detail-value-wrapper">
                              <span className="detail-value">{userData.email}</span>
                              <span className="verified-tag">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">
                          <Phone size={16} />
                        </span>
                        <div className="detail-content">
                          <span className="detail-label">Phone</span>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={userData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span className="detail-value">{userData.phone}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">
                          <MapPin size={16} />
                        </span>
                        <div className="detail-content">
                          <span className="detail-label">Location</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={userData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span className="detail-value">{userData.location}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">
                          <Globe size={16} />
                        </span>
                        <div className="detail-content">
                          <span className="detail-label">Timezone</span>
                          {isEditing ? (
                            <select 
                              value={userData.timezone}
                              onChange={(e) => handleInputChange('timezone', e.target.value)}
                              className="edit-select"
                            >
                              <option>GMT+5 (Tashkent)</option>
                              <option>GMT+6 (Almaty)</option>
                              <option>GMT+3 (Moscow)</option>
                            </select>
                          ) : (
                            <span className="detail-value">{userData.timezone}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">
                          <Users size={16} />
                        </span>
                        <div className="detail-content">
                          <span className="detail-label">Language</span>
                          {isEditing ? (
                            <select 
                              value={userData.language}
                              onChange={(e) => handleInputChange('language', e.target.value)}
                              className="edit-select"
                            >
                              <option>English (US)</option>
                              <option>Russian</option>
                              <option>Uzbek</option>
                            </select>
                          ) : (
                            <span className="detail-value">{userData.language}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">
                          <Building size={16} />
                        </span>
                        <div className="detail-content">
                          <span className="detail-label">Company</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={userData.companyDetails}
                              onChange={(e) => handleInputChange('companyDetails', e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span className="detail-value">{userData.companyDetails}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bio-section">
                      <span className="bio-label">Bio</span>
                      {isEditing ? (
                        <textarea
                          value={userData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          className="edit-textarea"
                          rows="4"
                        />
                      ) : (
                        <p className="bio-text">{userData.bio}</p>
                      )}
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="profile-actions">
                      <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                        Cancel
                      </button>
                      <button className="btn-primary" onClick={handleSaveProfile}>
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BILLING & PAYMENTS SECTION */}
          {activeSection === "billing" && (
            <div className="content-section">
              <div className="section-header">
                <div className="header-left">
                  <h1 className="section-title">Billing & Payments</h1>
                  <span className="section-badge">
                    <CreditCard size={14} />
                    Payment Methods
                  </span>
                </div>
                <button className="btn-primary" onClick={() => handleUserMenuClick("Add funds")}>
                  <Plus size={16} />
                  Add Funds
                </button>
              </div>
              
              <div className="payment-summary">
                <div className="summary-card gradient">
                  <div className="summary-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="summary-content">
                    <h3>Total Spent</h3>
                    <p className="summary-value">${userData.totalSpent.toLocaleString()}</p>
                    <span className="summary-period">All time</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">
                    <Clock size={24} />
                  </div>
                  <div className="summary-content">
                    <h3>Pending</h3>
                    <p className="summary-value">${userData.pendingAmount.toLocaleString()}</p>
                    <span className="summary-period">{userData.activeJobs} active jobs</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">
                    <Wallet size={24} />
                  </div>
                  <div className="summary-content">
                    <h3>Balance</h3>
                    <p className="summary-value">${userData.availableBalance.toLocaleString()}</p>
                    <span className="summary-period">Available</span>
                  </div>
                </div>
              </div>
              
              <div className="payment-methods">
                <div className="section-subheader">
                  <h2>Payment Methods</h2>
                  <button className="btn-outline" onClick={() => handleUserMenuClick("Add payment method")}>
                    <Plus size={16} />
                    Add Method
                  </button>
                </div>
                
                <div className="methods-grid">
                  {billingMethods.map(method => (
                    <div key={method.id} className="method-card">
                      <div className="method-header">
                        {method.type === 'visa' ? (
                          <div className="method-brand visa">
                            <CreditCard size={24} />
                          </div>
                        ) : (
                          <div className="method-brand bank">
                            <Building size={24} />
                          </div>
                        )}
                        {method.default && <span className="default-badge">Default</span>}
                      </div>
                      <div className="method-body">
                        {method.type === 'visa' ? (
                          <>
                            <span className="method-number">•••• •••• •••• {method.last4}</span>
                            <span className="method-expiry">Expires {method.exp}</span>
                          </>
                        ) : (
                          <>
                            <span className="method-bank">{method.bank}</span>
                            <span className="method-account">Account {method.account}</span>
                          </>
                        )}
                      </div>
                      <div className="method-footer">
                        <button className="method-action" onClick={() => handleUserMenuClick("Edit method")}>Edit</button>
                        <button className="method-action" onClick={() => handleUserMenuClick("Remove method")}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="recent-transactions">
                <div className="section-subheader">
                  <h2>Recent Transactions</h2>
                  <button className="btn-link" onClick={() => handleUserMenuClick("View all transactions")}>View All</button>
                </div>
                
                <div className="transactions-list">
                  {transactions.map(transaction => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-icon">
                        <Briefcase size={20} />
                      </div>
                      <div className="transaction-details">
                        <h4>{transaction.project}</h4>
                        <p>Paid to {transaction.freelancer} • {transaction.date}</p>
                      </div>
                      <div className="transaction-amount">- ${transaction.amount}</div>
                      <span className="transaction-status completed">Completed</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASSWORD & SECURITY SECTION */}
          {activeSection === "password" && (
            <div className="content-section">
              <div className="section-header">
                <div className="header-left">
                  <h1 className="section-title">Password & Security</h1>
                  <span className="section-badge">
                    <Shield size={14} />
                    Security Overview
                  </span>
                </div>
              </div>

              {/* CHANGE PASSWORD CARD */}
              <div className="password-card">
                <div className="card-header">
                  <div className="header-icon">
                    <Lock size={24} />
                  </div>
                  <div className="header-info">
                    <h2>Change Password</h2>
                    <p>Your password must be at least 8 characters and contain a mix of letters, numbers, and symbols</p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        placeholder="Enter current password"
                        className="password-input"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        placeholder="Enter new password"
                        className="password-input"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {passwordForm.newPassword && (
                      <div className="password-strength">
                        <div className="strength-meter">
                          <div 
                            className="strength-fill" 
                            style={{ 
                              width: `${passwordStrength.percentage}%`,
                              backgroundColor: passwordStrength.color
                            }}
                          />
                        </div>
                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label} Password
                        </span>
                      </div>
                    )}

                    {/* Password Requirements */}
                    <div className="password-requirements">
                      {passwordStrengthChecks.map(check => (
                        <div 
                          key={check.id} 
                          className={`requirement ${passwordValidations[check.id] ? "valid" : ""}`}
                        >
                          {passwordValidations[check.id] ? (
                            <CheckCircle size={14} className="valid-icon" />
                          ) : (
                            <div className="dot" />
                          )}
                          <span>{check.label}</span>
                        </div>
                      ))}
                      <div className={`requirement ${passwordValidations.match ? "valid" : ""}`}>
                        {passwordValidations.match ? (
                          <CheckCircle size={14} className="valid-icon" />
                        ) : (
                          <div className="dot" />
                        )}
                        <span>Passwords match</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        placeholder="Confirm new password"
                        className="password-input"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="update-password-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={18} className="spinning" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* SECURITY SETTINGS */}
              <div className="security-settings-grid">
                {securitySettings.map(setting => (
                  <div key={setting.id} className="security-setting-card" style={{ borderColor: `${setting.color}30` }}>
                    <div className="setting-header">
                      <div className="setting-icon" style={{ backgroundColor: `${setting.color}15`, color: setting.color }}>
                        {setting.icon}
                      </div>
                      <div className="setting-info">
                        <h3>{setting.label}</h3>
                        <p>{setting.description}</p>
                      </div>
                    </div>
                    
                    <div className="setting-footer">
                      <div className="setting-status">
                        <span className={`status-badge ${setting.enabled ? "enabled" : "disabled"}`}>
                          {setting.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={setting.enabled}
                          onChange={() => toggleSecuritySetting(setting.id)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {setting.id === "2fa" && !setting.enabled && (
                      <button className="enable-2fa-btn" onClick={handleEnable2FA}>
                        <Shield size={14} />
                        Set up 2FA
                      </button>
                    )}
                  </div>
                ))}

                {/* Security Tip Card */}
                <div className="security-tip-card">
                  <AlertTriangle size={20} />
                  <div className="tip-content">
                    <h4>Security Tip</h4>
                    <p>Enable two-factor authentication to add an extra layer of security to your account.</p>
                  </div>
                </div>
              </div>

              {/* ACTIVE SESSIONS */}
              <div className="sessions-card">
                <div className="sessions-header">
                  <h2>Active Sessions</h2>
                  <button className="refresh-sessions" onClick={() => handleUserMenuClick("Refresh sessions")}>
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>

                <div className="sessions-list">
                  {activeSessions.map(session => (
                    <div key={session.id} className={`session-item ${session.current ? "current" : ""}`}>
                      <div className="session-device">
                        <div className="device-icon" style={{ backgroundColor: `${session.current ? "#3b82f6" : "#8b5cf6"}15`, color: session.current ? "#3b82f6" : "#8b5cf6" }}>
                          {session.icon}
                        </div>
                        <div className="device-info">
                          <div className="device-header">
                            <h3>{session.device}</h3>
                            {session.current && <span className="current-badge">Current</span>}
                          </div>
                          <p className="device-details">
                            {session.browser} • {session.os}
                          </p>
                          <p className="device-location">
                            {session.location} • {session.ip}
                          </p>
                          <span className="last-active">
                            Last active: {session.lastActive}
                          </span>
                        </div>
                      </div>
                      
                      {!session.current && (
                        <button 
                          className="revoke-btn"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="sessions-footer">
                  <p>You can revoke access for any session you don't recognize. This will immediately sign out that device.</p>
                </div>
              </div>
            </div>
          )}

          {/* TEAMS & MEMBERS SECTION */}
          {activeSection === "teams" && (
            <div className="content-section">
              <div className="section-header">
                <h1 className="section-title">Teams & Members</h1>
                <button className="btn-primary" onClick={() => handleUserMenuClick("Invite member")}>
                  <Plus size={16} />
                  Invite Member
                </button>
              </div>
              
              <div className="teams-grid">
                <div className="team-card">
                  <div className="team-header">
                    <Users size={24} />
                    <h2>Your Team</h2>
                  </div>
                  <div className="team-members">
                    <div className="member-item">
                      <img src={userData.profilePicture} alt={userData.name} className="member-avatar" />
                      <div className="member-info">
                        <h3>{userData.fullName}</h3>
                        <p>Owner • {userData.email}</p>
                      </div>
                      <span className="owner-badge">Owner</span>
                    </div>
                    
                    <div className="member-item">
                      <div className="member-avatar-placeholder">JD</div>
                      <div className="member-info">
                        <h3>John Doe</h3>
                        <p>Admin • john@example.com</p>
                      </div>
                      <span className="role-badge">Admin</span>
                    </div>
                    
                    <div className="member-item">
                      <div className="member-avatar-placeholder">JS</div>
                      <div className="member-info">
                        <h3>Jane Smith</h3>
                        <p>Member • jane@example.com</p>
                      </div>
                      <span className="role-badge">Member</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEMBERSHIP SECTION */}
          {activeSection === "membership" && (
            <div className="content-section">
              <div className="section-header">
                <h1 className="section-title">Membership</h1>
              </div>
              
              <div className="membership-card current">
                <div className="membership-header">
                  <Award size={32} />
                  <div>
                    <h2>Basic Membership</h2>
                    <p>Free • Active</p>
                  </div>
                </div>
                
                <div className="membership-features">
                  <h3>Current benefits:</h3>
                  <ul>
                    <li><CheckCircle size={16} /> Up to 5 job proposals per month</li>
                    <li><CheckCircle size={16} /> Basic profile visibility</li>
                    <li><CheckCircle size={16} /> Standard support</li>
                  </ul>
                </div>
              </div>
              
              <div className="membership-plans">
                <h2>Available Plans</h2>
                <div className="plans-grid">
                  <div className="plan-card">
                    <h3>Plus</h3>
                    <p className="plan-price">$14.99<span>/month</span></p>
                    <ul>
                      <li><Check size={16} /> 20 job proposals</li>
                      <li><Check size={16} /> Enhanced profile</li>
                      <li><Check size={16} /> Priority support</li>
                      <li><Check size={16} /> Analytics</li>
                    </ul>
                    <button className="btn-outline" onClick={() => handleUserMenuClick("Upgrade to Plus")}>Upgrade</button>
                  </div>
                  
                  <div className="plan-card popular">
                    <div className="popular-badge">Most Popular</div>
                    <h3>Professional</h3>
                    <p className="plan-price">$29.99<span>/month</span></p>
                    <ul>
                      <li><Check size={16} /> Unlimited proposals</li>
                      <li><Check size={16} /> Featured profile</li>
                      <li><Check size={16} /> Premium support</li>
                      <li><Check size={16} /> Advanced analytics</li>
                      <li><Check size={16} /> Skill assessments</li>
                    </ul>
                    <button className="btn-primary" onClick={() => handleUserMenuClick("Upgrade to Professional")}>Upgrade</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATION SETTINGS SECTION */}
          {activeSection === "notifications" && (
            <div className="content-section">
              <div className="section-header">
                <h1 className="section-title">Notification Settings</h1>
              </div>
              
              <div className="notifications-grid">
                {notificationSettings.map((category, idx) => (
                  <div key={idx} className="notification-card">
                    <div className="notification-card-header">
                      <Bell size={18} />
                      <h2>{category.category}</h2>
                    </div>
                    <div className="notification-card-body">
                      {category.settings.map(setting => (
                        <div key={setting.id} className="notification-setting">
                          <div className="setting-info">
                            <h3>{setting.label}</h3>
                            <p>{setting.description}</p>
                          </div>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={setting.enabled} 
                              onChange={() => handleUserMenuClick(`Toggle ${setting.label}`)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="delivery-preferences">
                <h2>Delivery Preferences</h2>
                <div className="preferences-options">
                  <label className="preference-option">
                    <input type="checkbox" defaultChecked onChange={() => handleUserMenuClick("Toggle email notifications")} />
                    <span>Email notifications</span>
                  </label>
                  <label className="preference-option">
                    <input type="checkbox" defaultChecked onChange={() => handleUserMenuClick("Toggle push notifications")} />
                    <span>Push notifications</span>
                  </label>
                  <label className="preference-option">
                    <input type="checkbox" onChange={() => handleUserMenuClick("Toggle SMS notifications")} />
                    <span>SMS notifications</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAX INFORMATION SECTION */}
          {activeSection === "tax" && (
            <div className="content-section">
              <h1 className="section-title">Tax Information</h1>
              <div className="placeholder-card">
                <FileText size={48} />
                <h2>Tax Information Coming Soon</h2>
                <p>Your tax documents and information will appear here</p>
                <button className="btn-primary" onClick={() => handleUserMenuClick("Upload tax documents")}>
                  <Upload size={16} />
                  Upload Documents
                </button>
              </div>
            </div>
          )}

          {/* CONNECTED SERVICES SECTION */}
          {activeSection === "services" && (
            <div className="content-section">
              <h1 className="section-title">Connected Services</h1>
              <div className="placeholder-card">
                <Link size={48} />
                <h2>Connected Services</h2>
                <p>Manage your connected accounts and integrations</p>
                <button className="btn-primary" onClick={() => handleUserMenuClick("Connect new service")}>
                  <Plus size={16} />
                  Connect Service
                </button>
              </div>
            </div>
          )}

          {/* APPEALS TRACKER SECTION */}
          {activeSection === "appeals" && (
            <div className="content-section">
              <h1 className="section-title">Appeals Tracker</h1>
              <div className="placeholder-card">
                <AlertTriangle size={48} />
                <h2>No Active Appeals</h2>
                <p>You don't have any active appeals at this time</p>
                <button className="btn-outline" onClick={() => handleUserMenuClick("File appeal")}>
                  <FileText size={16} />
                  File an Appeal
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;