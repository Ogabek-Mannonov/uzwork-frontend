import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "../components/Theme/ThemeContext";
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
  ShieldCheck,
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
  Printer,
  Copy,
  ExternalLink,
  Heart,
  Bookmark,
  Flag,
  MoreHorizontal,
  Zap,
  XCircle,
  Share2
} from "lucide-react";
import "../Client/css/klient.css";
import { 
  getMyProfile, 
  updateMyProfile, 
  uploadImage, 
  getSecuritySettings,
  getNotifications
} from "../../api/common";
import { 
  getBalance, 
  getCards, 
  addCard, 
  deleteCard, 
  getPayments 
} from "../../api/payments";
import { changePassword } from "../../api/auth";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND}${cleanUrl}`;
}

const Settings = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get("section") || "my-info";
  const [activeSection, setActiveSection] = useState(sectionParam);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);
  const { isDark } = useThemeContext();
  const darkMode = isDark;
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const [userData, setUserData] = useState({
    name: "",
    fullName: "",
    username: "",
    email: "",
    phone: "",
    location: "",
    timezone: "GMT+5",
    language: "English (US)",
    accountType: "Client",
    company: "",
    companyDetails: "",
    bio: "",
    profilePicture: "",
    coverPhoto: "",
    jobSuccessScore: 98,
    totalSpent: 24850,
    pendingAmount: 1200,
    availableBalance: 5000,
    completedJobs: 42,
    activeJobs: 3,
    rating: 4.9
  });

  const [editingSection, setEditingSection] = useState(null); // 'name', 'bio', 'contact'
  const [editFormData, setEditFormData] = useState({});
  const [billingMethods, setBillingMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [securityData, setSecurityData] = useState(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardData, setNewCardData] = useState({ number: "", holder: "", expiry: "", cvc: "" });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const profileRes = await getMyProfile();
      if (profileRes?.data) {
        const u = profileRes.data.user || {};
        const p = profileRes.data.profile || {};
        setUserData(prev => ({
          ...prev,
          name: u.first_name || "",
          fullName: `${u.first_name || ""} ${u.last_name || ""}`.trim() || "",
          username: u.username ? `@${u.username}` : "",
          email: u.email || "",
          phone: u.phone || "",
          location: p.location || "",
          company: p.company_name || "",
          companyDetails: p.company_description || "",
          bio: p.company_description || p.bio || "",
          profilePicture: p.avatar_url || u.avatar_url || "",
          coverPhoto: p.cover_url || "",
          accountType: u.role || "",
          // Backend Stats (Real data integration)
          totalSpent: p.total_spent || 0,
          completedJobs: p.jobs_posted_count || p.completed_jobs || 0,
          activeJobs: p.active_jobs_count || p.active_jobs || 0,
          rating: parseFloat(p.rating || u.rating || 0),
          membership: p.membership_tier || "Client Basic"
        }));
      }

      // Fetch Balance
      const balanceRes = await getBalance();
      if (balanceRes?.success) {
        setUserData(prev => ({
          ...prev,
          availableBalance: balanceRes.data.balance || 0,
        }));
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchSectionData = async (section) => {
    if (!section) return;
    setIsLoading(true);
    try {
      switch(section) {
        case 'billing':
          const [cardsRes, transRes] = await Promise.all([getCards(), getPayments()]);
          if (cardsRes?.success) setBillingMethods(cardsRes.data || []);
          if (transRes?.success) setTransactions(transRes.data || []);
          break;
        case 'password':
          const securityRes = await getSecuritySettings();
          if (securityRes?.success) {
            setSecurityData(securityRes.data);
            setActiveSessions(securityRes.data.activeSessions || []);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error fetching data for ${section}:`, err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSectionData(activeSection);
  }, [activeSection]);

  const navSections = [
    {
      title: t('clientProfile.nav.settings'),
      items: [
        { id: "my-info", label: t('clientProfile.nav.myInfo'), icon: <User size={18} />, badge: null },
        { id: "billing", label: t('clientProfile.nav.billing'), icon: <CreditCard size={18} />, badge: null },
        { id: "password", label: t('clientProfile.nav.password'), icon: <Shield size={18} />, badge: null },
        { id: "teams", label: t('clientProfile.nav.teams'), icon: <Users size={18} />, badge: "2" },
        { id: "membership", label: t('clientProfile.nav.membership'), icon: <Award size={18} />, badge: "Basic" },
        { id: "notifications", label: t('clientProfile.nav.notifications'), icon: <Bell size={18} />, badge: null },
        { id: "tax", label: t('clientProfile.nav.tax'), icon: <FileText size={18} />, badge: null },
        { id: "services", label: t('clientProfile.nav.services'), icon: <Link size={18} />, badge: "3" },
        { id: "appeals", label: t('clientProfile.nav.appeals'), icon: <AlertTriangle size={18} />, badge: null }
      ]
    }
  ];

  // const headerNav = [
  //   { id: "hire", label: "Hire talent", icon: <Briefcase size={16} />, active: activeHeaderTab === "hire" },
  //   { id: "manage", label: "Manage work", icon: <BarChart size={16} />, active: activeHeaderTab === "manage" },
  //   { id: "reports", label: "Reports", icon: <FileText size={16} />, active: activeHeaderTab === "reports" },
  //   { id: "messages", label: "Messages", icon: <MessageCircle size={16} />, active: activeHeaderTab === "messages", badge: notifications }
  // ];

  // const handleHeaderNavClick = (id) => {
  //   setActiveHeaderTab(id);
  //   showMessage("info", `Navigating to ${headerNav.find(item => item.id === id).label}...`);
  // };

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

  // Constants

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });

  const [securitySettings, setSecuritySettings] = useState([
    { 
      id: "two_factor", 
      label: "Two-step verification", 
      description: "Add an extra layer of security to your account by requiring a code from your phone", 
      enabled: false,
      icon: <ShieldCheck size={20} />,
      color: "#3b82f6"
    },
    { 
      id: "biometric", 
      label: "Biometric login", 
      description: "Use your fingerprint or face recognition to log in quickly and securely", 
      enabled: false,
      icon: <Fingerprint size={20} />,
      color: "#ec4899"
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
      id: "password_expiry", 
      label: "Password expiry", 
      description: "Require password change every 90 days for enhanced security", 
      enabled: false,
      icon: <Clock size={20} />,
      color: "#f59e0b"
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState([
    {
      category: "Jobs & Proposals",
      settings: [
        { id: "proposal_received", label: "New proposal received", description: "Notify when a freelancer submits a proposal to your job", enabled: true },
        { id: "proposal_withdrawn", label: "Proposal withdrawn", description: "Notify when a freelancer withdraws their proposal", enabled: false }
      ]
    },
    {
      category: "Payments & Billing",
      settings: [
        { id: "payment_success", label: "Payment successful", description: "Confirm when a payment has been processed correctly", enabled: true },
        { id: "invoice_ready", label: "Invoice ready", description: "Notify when a new invoice is available for download", enabled: true }
      ]
    }
  ]);

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

  const passwordStrengthChecks = [
    { id: "length", label: "At least 8 characters", validator: (pwd) => pwd.length >= 8 },
    { id: "uppercase", label: "One uppercase letter", validator: (pwd) => /[A-Z]/.test(pwd) },
    { id: "lowercase", label: "One lowercase letter", validator: (pwd) => /[a-z]/.test(pwd) },
    { id: "number", label: "One number", validator: (pwd) => /\d/.test(pwd) },
    { id: "special", label: "One special character", validator: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

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

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
      const res = await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword
      });

      if (res?.success === false) throw new Error(res.error || res.message);

      showMessage("success", "Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordValidations({ length: false, uppercase: false, lowercase: false, number: false, special: false, match: false });
    } catch (err) {
      showMessage("error", err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSecurity = (id) => {
    setSecuritySettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    showMessage("success", "Security setting updated");
    // TODO: Connect to updateSecuritySettings API
  };

  const handleToggleNotification = (catIdx, settingId) => {
    setNotificationSettings(prev => {
      const newSettings = [...prev];
      const category = { ...newSettings[catIdx] };
      category.settings = category.settings.map(s => s.id === settingId ? { ...s, enabled: !s.enabled } : s);
      newSettings[catIdx] = category;
      return newSettings;
    });
    showMessage("success", "Notification preference updated");
  };

  const handleRevokeSession = (sessionId) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    showMessage("success", "Session revoked successfully!");
  };

  const handleEnable2FA = () => {
    showMessage("info", "2FA setup wizard will open...");
  };

  const handleSectionEdit = (section, initialData = {}) => {
    setEditingSection(section);
    setEditFormData({ ...userData, ...initialData });
  };

  const handleSectionCancel = () => {
    setEditingSection(null);
    setEditFormData({});
  };

  const handleSectionSave = async (section) => {
    setIsLoading(true);
    try {
      let payload = {};
      
      switch(section) {
        case 'name':
          // Ismni birinchi va oxirgi qismlarga ajratamiz (first_name, last_name)
          const nameParts = editFormData.fullName.trim().split(' ');
          payload = {
            first_name: nameParts[0] || "",
            last_name: nameParts.slice(1).join(' ') || ""
          };
          break;
        case 'bio':
          payload = { 
            company_name: editFormData.company,
            company_description: editFormData.bio 
          };
          break;
        case 'contact':
          payload = {
            location: editFormData.location,
            phone: editFormData.phone,
            timezone: editFormData.timezone
          };
          break;
        default:
          payload = editFormData;
      }

      const res = await updateMyProfile(payload);
      if (res?.success === false) throw new Error(res.error || res.message);

      // Ma'lumotlarni qayta yuklash
      await fetchData();
      
      // LocalStorage ni yangilash (Header va boshqa joylar uchun)
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser };
      if (payload.first_name !== undefined) updatedUser.first_name = payload.first_name;
      if (payload.last_name !== undefined) updatedUser.last_name = payload.last_name;
      // Agar rasm ham yangilangan bo'lsa (buni fetchData qiladi, lekin biz zaxira qilamiz)
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("authChange")); // Globallashgan ma'lumotlarni yangilash

      setEditingSection(null);
      showMessage("success", "Ma'lumotlar muvaffaqiyatli saqlandi!");
    } catch (err) {
      console.error("[Profile Update Error]:", err);
      showMessage("error", err.message || "Ma'lumotlarni saqlashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    showMessage("success", `${!darkMode ? 'Dark' : 'Light'} mode activated`);
  };

  const passwordStrength = calculatePasswordStrength(passwordForm.newPassword);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Rasm hajmini va turini tekshirish (optional but good)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "Rasm hajmi 5MB dan kichik bo'lishi kerak");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file); // Must be 'file' instead of 'image' because multer on backend expects 'file'
      formData.append("type", type); // 'avatar' or 'cover'

      const res = await uploadImage(formData);
      if (res?.success === false) throw new Error(res.message);

      const imageUrl = res.data?.url || res.data?.avatar_url || res.data?.cover_url;
      if (!imageUrl) throw new Error("Rasm manzili qaytarilmadi");

      const payload = type === 'avatar' ? { avatar_url: imageUrl } : { cover_url: imageUrl };
      const updateRes = await updateMyProfile(payload);
      
      if (updateRes?.success === false) throw new Error(updateRes.message || updateRes.error);

      // Muvaffaqiyatli yuklangandan so'ng barcha ma'lumotlarni yangilash
      await fetchData();

      // LocalStorage avatarini yangilash
      if (type === 'avatar') {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.avatar_url = imageUrl;
        localStorage.setItem("user", JSON.stringify(storedUser));
        window.dispatchEvent(new Event("authChange"));
      }

      showMessage("success", `${type === 'avatar' ? 'Profil rasmi' : 'Muqova'} muvaffaqiyatli yangilandi!`);
    } catch (err) {
      console.error("[Image Upload Error]:", err);
      showMessage("error", err.message || "Rasmni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBillingMethod = () => {
    setShowAddCardModal(true);
  };

  const submitNewCard = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Mock payload Construction
      const payload = {
        number: newCardData.number.replace(/\s/g, ''),
        holder: newCardData.holder,
        expiry: newCardData.expiry,
        cvc: newCardData.cvc
      };
      
      const res = await addCard(payload);
      if (res?.success === false) throw new Error(res.message);

      showMessage("success", "New payment method added!");
      setShowAddCardModal(false);
      setNewCardData({ number: "", holder: "", expiry: "", cvc: "" });
      fetchSectionData('billing');
    } catch (err) {
      showMessage("error", err.message || "Failed to add card");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBillingMethod = async (id) => {
    setIsLoading(true);
    try {
      const res = await deleteCard(id);
      if (res?.success === false) throw new Error(res.message);
      showMessage("success", "Card removed successfully");
      fetchSectionData('billing');
    } catch (err) {
      showMessage("error", err.message || "Failed to remove card");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (id, label) => {
    setSearchParams({ section: id });
    setShowMobileMenu(false);
    showMessage("info", `Opening ${label || id}...`);
  };

  return (
    <div className="settings-container">
      
      {/* HEADER
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
            
            <div className="brand-section" style={{ marginRight: '40px' }}>
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
      </header> */}

      {/* MAIN CONTENT */}
      <div className="settings-main no-sidebar">
        
        <main className="settings-content-full">
          
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

          {activeSection === "my-info" && (
            <div className="content-section soft-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h1 className="section-title" style={{ margin: 0, textTransform: 'uppercase', fontSize: '24px', lineHeight: '1', display: 'flex', alignItems: 'center' }}>
                  {t('clientProfile.title')}
                </h1>

              </div>

              <div className="profile-card soft-fade-in stagger-1">
                <div className="profile-cover">
                  <span className="section-badge" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '12px' }}>
                    <ShieldCheck size={14} style={{ marginRight: '6px' }} /> {t('clientProfile.verifiedClient')}
                  </span>
                  <img src={avatarSrc(userData.coverPhoto) || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1400"} alt="Cover" className="cover-image" />
                  <button className="change-cover-btn" onClick={() => document.getElementById('cover-upload-input').click()}>
                    <Camera size={15} /> {t('clientProfile.edit')}
                  </button>
                  <input type="file" id="cover-upload-input" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
                </div>

                <div className="profile-content">
                  <div className="profile-avatar-section">
                    <div className="avatar-wrapper">
                      <img src={avatarSrc(userData.profilePicture) || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300"} alt="Avatar" className="profile-avatar" />
                      <button className="change-avatar-btn" onClick={() => document.getElementById('avatar-upload-input').click()}>
                        <Camera size={14} />
                      </button>
                      <input type="file" id="avatar-upload-input" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                      <span className="avatar-status online" />
                    </div>

                    <div className="profile-name-section">
                      {editingSection === 'name' ? (
                        <div className="inline-edit-container" style={{ padding: '0 0 20px 0' }}>
                          <input 
                            type="text" 
                            value={editFormData.fullName} 
                            onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})} 
                            className="inline-edit-input" 
                            style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}
                            placeholder="To'liq ism"
                          />
                          <div className="inline-edit-actions">
                            <button className="btn-cancel-inline" onClick={handleSectionCancel}>Bekor qilish</button>
                            <button className="btn-save-inline" onClick={() => handleSectionSave('name')}>Saqlash</button>
                          </div>
                        </div>
                      ) : (
                        <div className="section-edit-trigger" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }} onClick={() => handleSectionEdit('name', { fullName: userData.fullName })}>
                          <div>
                            <h2 className="profile-fullname">{userData.fullName || "Mijoz Ismi"}</h2>
                            <p className="profile-email-meta" style={{ margin: 0, fontSize: '16px' }}>{userData.email}</p>
                          </div>
                          <button className="tahrirlash-btn">
                            <Edit size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="profile-badges-row" style={{ marginTop: '60px' }}>
                      <span className="profile-badge-item profile-badge-membership">
                        <Award size={14} /> {t('clientProfile.premiumClient')}
                      </span>
                    </div>
                  </div>

                  <div className="profile-bio-section soft-fade-in stagger-2" style={darkMode ? { background: 'transparent', boxShadow: 'none', border: 'none' } : {}}>
                    {editingSection === 'bio' ? (
                      <div className="inline-edit-container">
                        <input 
                          type="text" 
                          value={editFormData.company} 
                          onChange={(e) => setEditFormData({...editFormData, company: e.target.value})} 
                          className="inline-edit-input" 
                          style={{ marginBottom: '12px' }}
                          placeholder="Kompaniya nomi"
                        />
                        <textarea 
                          value={editFormData.bio} 
                          onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})} 
                          className="inline-edit-textarea" 
                          placeholder="Kompaniya haqida batafsil ma'lumot..."
                        />
                        <div className="inline-edit-actions" style={{ marginTop: '16px' }}>
                          <button className="btn-cancel-inline" onClick={handleSectionCancel}>Bekor qilish</button>
                          <button className="btn-save-inline" onClick={() => handleSectionSave('bio')}>Saqlash</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                          <div>
                            <span className="lux-label" style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: darkMode ? '#ffffff' : '' }}>{t('clientProfile.companyName')}</span>
                            <div className="profile-company-name" style={{ fontSize: '20px', fontWeight: '700', color: darkMode ? '#ffffff' : '' }}>{userData.company || userData.fullName}</div>
                          </div>
                          <button className="tahrirlash-btn" onClick={() => handleSectionEdit('bio', { company: userData.company, bio: userData.bio })}>
                            <Edit size={14} />
                          </button>
                        </div>
                        <div>
                          <span className="lux-label" style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: darkMode ? '#ffffff' : '' }}>{t('clientProfile.companyBio')}</span>
                          <div className="profile-bio-text" style={darkMode ? { background: '#1e293b', color: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(255, 255, 255, 0.1)' } : {}}>
                            {userData.bio || t('clientProfile.noBio')}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="profile-meta-row" style={darkMode ? { background: '#1e293b', borderColor: 'rgba(255, 255, 255, 0.1)' } : {}}>
                      <span className="profile-meta-item" style={darkMode ? { color: 'rgba(255, 255, 255, 0.8)' } : {}}>
                        <MapPin size={16} color="var(--blue)" /> {userData.location || "O'zbekiston"}
                      </span>
                      <span className="profile-meta-item" style={darkMode ? { color: 'rgba(255, 255, 255, 0.8)' } : {}}>
                        <Star size={16} color="#f59e0b" fill="#f59e0b" /> {userData.rating || "5.0"} {t('clientProfile.clientRating')}
                      </span>
                      <span className="profile-meta-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: darkMode ? 'rgba(255, 255, 255, 0.8)' : '' }} onClick={() => handleSectionEdit('contact', { phone: userData.phone, location: userData.location, timezone: userData.timezone })}>
                        <Phone size={16} color="var(--blue)" /> {userData.phone || "+998 -- --- -- --"}
                        <button className="tahrirlash-btn small">
                          <Edit size={12} />
                        </button>
                      </span>
                      {editingSection === 'contact' && (
                        <div className="inline-edit-container" style={{ width: '100%', marginTop: '16px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <input type="text" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="inline-edit-input" placeholder="Telefon" />
                            <input type="text" value={editFormData.location} onChange={(e) => setEditFormData({...editFormData, location: e.target.value})} className="inline-edit-input" placeholder="Manzil" />
                          </div>
                          <input type="text" value={editFormData.timezone} onChange={(e) => setEditFormData({...editFormData, timezone: e.target.value})} className="inline-edit-input" style={{ marginBottom: '12px' }} placeholder="Vaqt mintaqasi" />
                          <div className="inline-edit-actions">
                            <button className="btn-cancel-inline" onClick={handleSectionCancel}>Bekor qilish</button>
                            <button className="btn-save-inline" onClick={() => handleSectionSave('contact')}>Saqlash</button>
                          </div>
                        </div>
                      )}
                      <span className="profile-meta-item" style={darkMode ? { color: 'rgba(255, 255, 255, 0.8)' } : {}}>
                        <Clock size={16} color="var(--blue)" /> {userData.timezone || "Tashkent (UTC+5)"}
                      </span>
                    </div>
                  </div>

                  <div className="unified-stats-grid soft-fade-in stagger-3">
                    <div className="unified-stat-card">
                      <span className="unified-stat-value">{userData.completedJobs || 0}</span>
                      <span className="unified-stat-label">{t('clientProfile.stats.postings')}</span>
                    </div>
                    <div className="unified-stat-card">
                      <span className="unified-stat-value">${(userData.totalSpent / 1000).toFixed(1)}k</span>
                      <span className="unified-stat-label">{t('clientProfile.stats.spending')}</span>
                    </div>
                    <div className="unified-stat-card">
                      <span className="unified-stat-value">{userData.rating || "5.0"}</span>
                      <span className="unified-stat-label">{t('clientProfile.stats.rating')}</span>
                    </div>
                    <div className="unified-stat-card">
                      <span className="unified-stat-value">{userData.activeJobs || 0}</span>
                      <span className="unified-stat-label">{t('clientProfile.stats.active')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI COMMAND CENTER - REIMAGINED */}
              {/* AI COMMAND CENTER - REIMAGINED */}
              <div className="profile-card ai-banner-card soft-fade-in stagger-4" style={{ 
                padding: '32px', 
                border: '1px dashed rgba(59, 130, 246, 0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '-20px', 
                  width: '100px', 
                  height: '100px', 
                  background: 'rgba(59, 130, 246, 0.05)', 
                  borderRadius: '50%', 
                  filter: 'blur(40px)' 
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '12px', 
                      background: 'var(--blue)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)'
                    }}>
                      <Zap size={22} color="white" />
                    </div>
                    <div>
                    <h3 className="ai-banner-title" style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
                        {t('clientProfile.aiCenter.title')}
                      </h3>
                      <span style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {t('clientProfile.aiCenter.subtitle')}
                      </span>
                    </div>
                  </div>
                  <button className="lux-btn-primary ai-banner-btn" style={{ 
                    padding: '8px 24px', 
                    fontSize: '13px', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    {t('clientProfile.aiCenter.manage')}
                  </button>
                </div>
                
                <p className="ai-banner-text" style={{ 
                  fontSize: '15px', 
                  lineHeight: '1.7', 
                  margin: 0, 
                  maxWidth: '700px',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {t('clientProfile.aiCenter.desc')}
                </p>
              </div>


            </div>
          )}

          {/* BILLING & PAYMENTS SECTION */}
          {activeSection === "billing" && (
            <div className="content-section">
              <div className="section-header">
                <div className="header-left">
                  <h1 className="section-title">{t('clientProfile.billing.title')}</h1>
                  <span className="section-badge">
                    <CreditCard size={14} />
                    {t('clientProfile.billing.paymentMethods')}
                  </span>
                </div>
                <button className="btn-primary" onClick={() => handleUserMenuClick("Add funds")}>
                  <Plus size={16} />
                  {t('clientProfile.billing.addFunds')}
                </button>
              </div>
              
              <div className="payment-summary">
                <div className="summary-card gradient">
                  <div className="summary-icon"><DollarSign size={24} /></div>
                  <div className="summary-content">
                    <h3>{t('clientProfile.billing.totalSpent')}</h3>
                    <p className="summary-value">${userData.totalSpent.toLocaleString()}</p>
                    <span className="summary-period">{t('clientProfile.billing.allTime')}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon"><Clock size={24} /></div>
                  <div className="summary-content">
                    <h3>{t('clientProfile.billing.pending')}</h3>
                    <p className="summary-value">${userData.pendingAmount.toLocaleString()}</p>
                    <span className="summary-period">{userData.activeJobs} {t('clientProfile.billing.activeJobs')}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon"><DollarSign size={24} /></div>
                  <div className="summary-content">
                    <h3>{t('clientProfile.billing.balance')}</h3>
                    <p className="summary-value">${userData.availableBalance.toLocaleString()}</p>
                    <span className="summary-period">{t('clientProfile.billing.available')}</span>
                  </div>
                </div>
              </div>
              
              <div className="payment-methods">
                <div className="section-subheader">
                  <h2>{t('clientProfile.billing.paymentMethods')}</h2>
                  <button className="btn-outline" onClick={handleAddBillingMethod}>
                    <Plus size={16} />
                    {t('clientProfile.billing.addMethod')}
                  </button>
                </div>
                
                <div className="methods-grid">
                  {billingMethods.length > 0 ? (
                    billingMethods.map(method => (
                      <div key={method.id} className="method-card">
                        <div className="method-header">
                          {method.type === 'visa' || method.brand === 'visa' ? (
                            <div className="method-brand visa"><CreditCard size={24} /></div>
                          ) : (
                            <div className="method-brand bank"><Building size={24} /></div>
                          )}
                          {method.default && <span className="default-badge">Default</span>}
                        </div>
                        <div className="method-body">
                          <span className="method-number">•••• •••• •••• {method.last4}</span>
                          <span className="method-expiry">Expires {method.exp || method.expiry}</span>
                        </div>
                        <div className="method-footer">
                          <button className="method-action" onClick={() => handleDeleteBillingMethod(method.id)}>Remove</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">{t('clientProfile.billing.noMethods')}</div>
                  )}
                </div>
              </div>
              
              <div className="recent-transactions">
                <div className="section-subheader">
                  <h2>{t('clientProfile.billing.recentTransactions')}</h2>
                  <button className="btn-link" onClick={() => fetchSectionData('billing')}>{t('common.retry')}</button>
                </div>
 Riverside content in Client.jsx:
                
                <div className="transactions-list">
                  {transactions.length > 0 ? (
                    transactions.map(transaction => (
                      <div key={transaction.id} className="transaction-item">
                        <div className="transaction-icon"><Briefcase size={20} /></div>
                        <div className="transaction-details">
                          <h4>{transaction.project || transaction.title || "Payment"}</h4>
                          <p>{transaction.date || transaction.created_at}</p>
                        </div>
                        <div className="transaction-amount">- ${transaction.amount}</div>
                        <span className={`transaction-status ${transaction.status}`}>{transaction.status}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">{t('clientProfile.billing.noTransactions')}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PASSWORD & SECURITY SECTION */}
          {activeSection === "password" && (
            <div className="content-section">
              <div className="section-header">
                <div className="header-left">
                  <h1 className="section-title">{t('clientProfile.security.title')}</h1>
                  <span className="section-badge">
                    <Shield size={14} />
                    {t('clientProfile.security.overview')}
                  </span>
                </div>
              </div>

              <div className="password-card">
                <div className="card-header">
                  <div className="header-icon"><Lock size={24} /></div>
                  <div className="header-info">
                    <h2>{t('clientProfile.security.changePassword')}</h2>
                    <p>{t('clientProfile.security.passwordHint')}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="password-form">
                  <div className="form-group">
                    <label>{t('clientProfile.security.currentPassword')}</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        placeholder="Enter current password"
                        className="password-input"
                        disabled={isLoading}
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
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
                      <button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {passwordForm.newPassword && (
                      <div className="password-strength">
                        <div className="strength-meter">
                          <div className="strength-fill" style={{ width: `${passwordStrength.percentage}%`, backgroundColor: passwordStrength.color }} />
                        </div>
                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label === 'Weak' ? t('findWork.drawer.experienceLevel_entry') : passwordStrength.label} {t('clientProfile.security.updatePassword').split(' ')[0]}
                        </span>
                      </div>
                    )}

                    <div className="password-requirements">
                        <div key={check.id} className={`requirement ${passwordValidations[check.id] ? "valid" : ""}`}>
                          {passwordValidations[check.id] ? <CheckCircle size={14} className="valid-icon" /> : <div className="dot" />}
                          <span>{t(`clientProfile.security.requirements.${check.id}`)}</span>
                        </div>
                      <div className={`requirement ${passwordValidations.match ? "valid" : ""}`}>
                        {passwordValidations.match ? <CheckCircle size={14} className="valid-icon" /> : <div className="dot" />}
                        <span>{t('clientProfile.security.requirements.match')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t('clientProfile.security.confirmPassword')}</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        placeholder="Confirm new password"
                        className="password-input"
                        disabled={isLoading}
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="update-password-btn" disabled={isLoading}>
                    {isLoading ? (
                  <><RefreshCw size={18} className="spinning" />{t('common.saving')}</>
                    ) : (
                      <><Save size={18} />{t('clientProfile.security.updatePassword')}</>
                    )}
                  </button>
                </form>
              </div>

              <div className="security-settings-grid">
                {securitySettings.map(setting => (
                  <div key={setting.id} className="settings-item-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--light-border)', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '10px', backgroundColor: `${setting.color}15`, color: setting.color }}>
                        {setting.icon}
                      </div>
                      <div className="item-info">
                        <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>{setting.label}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--light-text-tertiary)', margin: 0 }}>{setting.description}</p>
                      </div>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={setting.enabled} 
                        onChange={() => handleToggleSecurity(setting.id)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
              </div>

                <div className="security-tip-card">
                  <AlertTriangle size={20} />
                  <div className="tip-content">
                    <h4>{t('clientProfile.security.securityTip')}</h4>
                    <p>{t('clientProfile.security.securityTipDesc')}</p>
                  </div>
                </div>

              <div className="sessions-card">
                <div className="sessions-header">
                  <h2>{t('clientProfile.security.activeSessions')}</h2>
                  <button className="refresh-sessions" onClick={() => handleUserMenuClick("Refresh sessions")}>
                    <RefreshCw size={16} />
                    {t('common.retry')}
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
                          <p className="device-details">{session.browser} • {session.os}</p>
                          <p className="device-location">{session.location} • {session.ip}</p>
                          <span className="last-active">Last active: {session.lastActive}</span>
                        </div>
                      </div>
                      
                        <button className="revoke-btn" onClick={() => handleRevokeSession(session.id)}>
                          {t('clientProfile.security.revokeAccess')}
                        </button>
                    </div>
                  ))}
                </div>

                <div className="sessions-footer">
                  <p>{t('clientProfile.security.passwordExpiryDesc')}</p>
                </div>
              </div>
            </div>
          )}

          {/* TEAMS & MEMBERS SECTION */}
          {activeSection === "teams" && (
            <div className="content-section">
              <div className="section-header">
                <h1 className="section-title">{t('clientProfile.teams.title')}</h1>
                <button className="btn-primary" onClick={() => handleUserMenuClick("Invite member")}>
                  <Plus size={16} />
                  {t('clientProfile.teams.invite')}
                </button>
              </div>
              
              <div className="teams-grid">
                <div className="team-card">
                  <div className="team-header">
                    <Users size={24} />
                    <h2>{t('clientProfile.teams.yourTeam')}</h2>
                  </div>
                  <div className="team-members">
                    <div className="member-item">
                      <img src={userData.profilePicture} alt={userData.name} className="member-avatar" />
                      <div className="member-info">
                        <h3>{userData.fullName}</h3>
                        <p>{t('clientProfile.teams.owner')} • {userData.email}</p>
                      </div>
                      <span className="owner-badge">{t('clientProfile.teams.owner')}</span>
                    </div>
                    <div className="member-item">
                      <div className="member-avatar-placeholder">JD</div>
                      <div className="member-info">
                        <h3>John Doe</h3>
                        <p>{t('clientProfile.teams.admin')} • john@example.com</p>
                      </div>
                      <span className="role-badge">{t('clientProfile.teams.admin')}</span>
                    </div>
                    <div className="member-item">
                      <div className="member-avatar-placeholder">JS</div>
                      <div className="member-info">
                        <h3>Jane Smith</h3>
                        <p>{t('clientProfile.teams.member')} • jane@example.com</p>
                      </div>
                      <span className="role-badge">{t('clientProfile.teams.member')}</span>
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
                <h1 className="section-title">{t('clientProfile.membership.title')}</h1>
              </div>
              
              <div className="membership-card current">
                <div className="membership-header">
                  <Award size={32} />
                  <div>
                    <h2>{t('clientProfile.membership.free')} Membership</h2>
 Riverside content in Client.jsx:
                    <p>{t('clientProfile.membership.free')} • {t('clientProfile.membership.active')}</p>
                  </div>
                </div>
                <div className="membership-features">
                  <h3>{t('clientProfile.membership.currentBenefits')}:</h3>
                  <ul>
                    <li><CheckCircle size={16} /> {t('clientProfile.membership.benefits.proposals5')}</li>
                    <li><CheckCircle size={16} /> {t('clientProfile.membership.benefits.basicVisibility')}</li>
                    <li><CheckCircle size={16} /> {t('clientProfile.membership.benefits.standardSupport')}</li>
                  </ul>
                </div>
              </div>
              
              <div className="membership-plans">
                <h2>{t('clientProfile.membership.availablePlans')}</h2>
                <div className="plans-grid">
                  <div className="plan-card">
                    <h3>Plus</h3>
                    <p className="plan-price">$14.99<span>/month</span></p>
                    <ul>
                      <li><Check size={16} /> {t('clientProfile.membership.benefits.proposals20')}</li>
                      <li><Check size={16} /> {t('clientProfile.membership.benefits.enhancedProfile')}</li>
                      <li><Check size={16} /> {t('clientProfile.membership.benefits.prioritySupport')}</li>
                      <li><Check size={16} /> {t('clientProfile.membership.benefits.analytics')}</li>
                    </ul>
                    <button className="btn-outline" onClick={() => handleUserMenuClick("Upgrade to Plus")}>{t('clientProfile.membership.upgrade')}</button>
                  </div>
                  
                  <div className="plan-card popular">
                    <div className="popular-badge">{t('clientProfile.membership.mostPopular')}</div>
                    <h3>Professional</h3>
                    <p className="plan-price">$29.99<span>/month</span></p>
                    <ul>
                      <li><Check size={16} /> {t('clientProfile.membership.benefits.proposalsUnlimited')}</li>
                      <li><Check size={16} /> {t('clientProfile.membership.benefits.featuredProfile')}</li>
                      <li><Check size={16} /> {t('clientProfile.membership.benefits.premiumSupport')}</li>
                      <li><Check size={16} /> {t('clientProfile.membership.benefits.advancedAnalytics')}</li>
                      <li><Check size={16} /> {t('clientProfile.membership.benefits.skillsAssessments')}</li>
                    </ul>
                    <button className="btn-primary" onClick={() => handleUserMenuClick("Upgrade to Professional")}>{t('clientProfile.membership.upgrade')}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATION SETTINGS SECTION */}
          {activeSection === "notifications" && (
            <div className="content-section">
              <div className="section-header">
                <h1 className="section-title">{t('clientProfile.notifications.title')}</h1>
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
                              onChange={() => handleToggleNotification(idx, setting.id)} 
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
                <h2>{t('clientProfile.notifications.deliveryPreferences')}</h2>
                <div className="preferences-options">
                  <label className="preference-option">
                    <input type="checkbox" defaultChecked onChange={() => handleToggleNotification(0, 'all_email')} />
                    <span>{t('clientProfile.notifications.emailNotifications')}</span>
                  </label>
                  <label className="preference-option">
                    <input type="checkbox" defaultChecked onChange={() => handleToggleNotification(0, 'all_push')} />
                    <span>{t('clientProfile.notifications.pushNotifications')}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ADD CARD MODAL */}
          {showAddCardModal && (
            <div className="modal-overlay">
              <div className="modal-content card-modal">
                <div className="modal-header">
                  <h2>{t('clientProfile.billing.addMethod')}</h2>
                  <button className="close-modal" onClick={() => setShowAddCardModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={submitNewCard} className="add-card-form">
                  <div className="form-group">
                    <label>{t('wallet.cardNumberPlaceholder')}</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      value={newCardData.number}
                      onChange={(e) => setNewCardData({...newCardData, number: e.target.value})}
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('clientProfile.billing.expiryDate')}</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={newCardData.expiry}
                        onChange={(e) => setNewCardData({...newCardData, expiry: e.target.value})}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('clientProfile.billing.cvc')}</label>
                      <input 
                        type="text" 
                        placeholder="***" 
                        value={newCardData.cvc}
                        onChange={(e) => setNewCardData({...newCardData, cvc: e.target.value})}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('clientProfile.billing.cardHolderName')}</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={newCardData.holder}
                      onChange={(e) => setNewCardData({...newCardData, holder: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                    {isLoading ? <RefreshCw size={18} className="spinning" /> : <Save size={18} />}
                    {t('clientProfile.billing.addMethod')}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAX INFORMATION SECTION */}
          {activeSection === "tax" && (
            <div className="content-section">
              <h1 className="section-title">{t('clientProfile.placeholders.taxTitle')}</h1>
              <div className="placeholder-card">
                <FileText size={48} />
                <h2>{t('clientProfile.placeholders.taxComingSoon')}</h2>
                <p>{t('clientProfile.placeholders.taxDesc')}</p>
                <button className="btn-primary" onClick={() => handleUserMenuClick("Upload tax documents")}>
                  <Upload size={16} />
                  {t('clientProfile.placeholders.uploadDocs')}
                </button>
              </div>
            </div>
          )}

          {/* CONNECTED SERVICES SECTION */}
          {activeSection === "services" && (
            <div className="content-section">
              <h1 className="section-title">{t('clientProfile.placeholders.servicesTitle')}</h1>
              <div className="placeholder-card">
                <Link size={48} />
                <h2>{t('clientProfile.placeholders.servicesTitle')}</h2>
                <p>{t('clientProfile.placeholders.servicesDesc')}</p>
                <button className="btn-primary" onClick={() => handleUserMenuClick("Connect new service")}>
                  <Plus size={16} />
                  {t('clientProfile.placeholders.connectService')}
                </button>
              </div>
            </div>
          )}

          {/* APPEALS TRACKER SECTION */}
          {activeSection === "appeals" && (
            <div className="content-section">
              <h1 className="section-title">{t('clientProfile.placeholders.appealsTitle')}</h1>
              <div className="placeholder-card">
                <AlertTriangle size={48} />
                <h2>{t('clientProfile.placeholders.noAppeals')}</h2>
                <p>{t('clientProfile.placeholders.appealsDesc')}</p>
                <button className="btn-outline" onClick={() => handleUserMenuClick("File appeal")}>
                  <FileText size={16} />
                  {t('clientProfile.placeholders.fileAppeal')}
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