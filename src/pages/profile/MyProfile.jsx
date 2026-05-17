import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSocket } from "../../hooks/useSocket";

import {
  User,
  Settings as SettingsIcon,
  CreditCard,
  Shield,
  Award,
  Bell,
  FileText,
  AlertTriangle,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  HelpCircle,
  Briefcase,
  MessageCircle,
  BarChart,
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
  Check,
  AlertCircle,
  Info,
  Lock,
  Camera,
  Star,
  Code,
  Palette,
  Monitor,
  Package,
  ExternalLink,
  Link2,
  Image as ImageIcon,
  Video,
  Music,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Zap,
  Fingerprint,
  Smartphone,
  Laptop,
  Clock,
  RefreshCw,
  Crown,
  Sparkles,
  Rocket,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  UserCheck,
  UserX,
  Users,
  Key,
  ShieldCheck
} from "lucide-react";
import "../profile/profile-css/profile.css";
import { 
  getMyProfile, 
  updateMyProfile, 
  uploadFile, 
  uploadImage, 
  getNotificationSettings, 
  updateNotificationSettings,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from "../../api/common";
import { 
  logout,
  forgotPassword, 
  resetPassword, 
  enable2FA, 
  confirm2FA, 
  disable2FA,
  changePassword,
  getSessions,
  revokeSession
} from "../../api/auth";
import { getCategories } from "../../api/profile";

// Notification icon helper (same as dropdown)
const getNotifIcon = (type) => {
  switch (type) {
    case 'proposal_received':   return { icon: <Briefcase size={18} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' };
    case 'proposal_accepted':   return { icon: <UserCheck size={18} />, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
    case 'proposal_rejected':   return { icon: <UserX size={18} />, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
    case 'job_invitation':      return { icon: <ArrowUpRight size={18} />, color: '#f97316', bg: 'rgba(249,115,22,0.15)' };
    case 'contract_started':    return { icon: <CheckCircle size={18} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' };
    case 'contract_completed':  return { icon: <Lock size={18} />, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
    case 'contract_cancelled':  return { icon: <AlertTriangle size={18} />, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
    case 'milestone_submitted': return { icon: <Info size={18} />, color: '#f97316', bg: 'rgba(249,115,22,0.15)' };
    case 'milestone_approved':  return { icon: <CheckCircle size={18} />, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
    case 'payment_received':    return { icon: <ArrowDownLeft size={18} />, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
    case 'payment_sent':        return { icon: <ArrowUpRight size={18} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' };
    case 'withdrawal_request':  return { icon: <DollarSign size={18} />, color: '#f97316', bg: 'rgba(249,115,22,0.15)' };
    case 'escrow_hold':         return { icon: <Lock size={18} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' };
    case 'dispute_opened':      return { icon: <AlertCircle size={18} />, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
    case 'dispute_resolved':    return { icon: <CheckCircle size={18} />, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
    case 'new_review':          return { icon: <Star size={18} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' };
    case 'new_job_posted':      return { icon: <Briefcase size={18} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' };
    case 'verification_status': return { icon: <UserCheck size={18} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' };
    default:                    return { icon: <Bell size={18} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' };
  }
};


import { getMyPortfolio, createPortfolioItem, updatePortfolioItem, deletePortfolioItem, addPortfolioMedia, deletePortfolioMedia, getMyCertifications, createCertification, updateCertification, deleteCertification } from "../../api/freelancer";
import { PROFESSIONAL_SKILLS } from "../../utils/skills";


import { useTranslation } from "react-i18next";
import { useThemeContext } from "../../pages/components/Theme/ThemeContext";
import Price from "../components/Currency/Price";

const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api\/?$/, "");

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  
  // Ensure we don't have double slashes if the URL already starts with one
  // or add a slash if it's missing.
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND}${cleanUrl}`;
}

function getInitials(name) {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : "";
}

function AvatarImage({ src, name, size = 40, className = "" }) {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    const initials = getInitials(name);
    return (
      <div 
        className={`${className} initials-avatar`} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'linear-gradient(135deg, var(--blue, #3b82f6), var(--blue-dark, #2563eb))', 
          color: '#fff', 
          fontWeight: '700',
          fontSize: size > 100 ? '3rem' : size > 60 ? '2.2rem' : size > 40 ? '1.5rem' : '1rem',
          borderRadius: '50%',
          aspectRatio: '1/1',
          width: `${size}px`,
          height: `${size}px`
        }}
      >
        {initials || <User size={size * 0.5} />}
      </div>
    );
  }

  return (
    <img 
      src={avatarSrc(src)} 
      alt={name || "Avatar"} 
      className={className}
      onError={() => setError(true)}
      onContextMenu={(e) => e.preventDefault()}
      draggable="false"
      style={{ objectFit: 'cover', borderRadius: '50%', width: `${size}px`, height: `${size}px`, userSelect: 'none', WebkitUserDrag: 'none' }}
    />
  );
}

const MyProfile = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useThemeContext();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get('section') || 'my-info';
  // const [activeHeaderTab, setActiveHeaderTab] = useState("find");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // 'name', 'bio', 'rate', 'skills', 'contact'
  const [editFormData, setEditFormData] = useState({});
  const [categories, setCategories] = useState([]); // State for categories


  // const [showUserDropdown, setShowUserDropdown] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  // const [notifications, setNotifications] = useState(3);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Password visibility states
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingCert, setEditingCert] = useState(null); // null = add, obj = edit
  const [certForm, setCertForm] = useState({ title: "", issuer: "", issue_year: "", issue_month: "", credential_id: "", credential_url: "" });
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    url: "",
    media: [], // { id, url, type } - existing from server
    files: [], // [File, File] - new ones to upload
    skills: []
  });
  const [newSkillInput, setNewSkillInput] = useState("");
  const [portSkillSuggestions, setPortSkillSuggestions] = useState([]);
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [editingLangIdx, setEditingLangIdx] = useState(null);
  const [langForm, setLangForm] = useState({ language: "", proficiency: "Conversational" });
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });
  
  const [securityToggles, setSecurityToggles] = useState({
    twoFactor: false,
    deviceManagement: true,
    loginNotifications: true,
    passwordExpiry: false
  });

  // Membership state
  const [billingCycle, setBillingCycle] = useState("monthly");
  // selectedPlan o'rniga to'g'ridan-to'g'ri planId ishlatamiz
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);

  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [tempSkills, setTempSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState([
    {
      category: "profile.notifications.categories.jobs",
      settings: [
        { id: "proposal_received", label: "profile.notifications.items.proposal_received.label", description: "profile.notifications.items.proposal_received.desc", enabled: true },
        { id: "proposal_withdrawn", label: "profile.notifications.items.proposal_withdrawn.label", description: "profile.notifications.items.proposal_withdrawn.desc", enabled: false }
      ]
    },
    {
      category: "profile.notifications.categories.payments",
      settings: [
        { id: "payment_success", label: "profile.notifications.items.payment_success.label", description: "profile.notifications.items.payment_success.desc", enabled: true },
        { id: "invoice_ready", label: "profile.notifications.items.invoice_ready.label", description: "profile.notifications.items.invoice_ready.desc", enabled: true }
      ]
    }
  ]);

  const [deliveryPrefs, setDeliveryPrefs] = useState({
    email: true,
    push: true
  });

  const [allNotifications, setAllNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState("email"); // email, reset
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");

  // 2FA Modal States
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [faStep, setFaStep] = useState("select"); // select, verify
  const [verificationCode, setVerificationCode] = useState("");

  // Contact Confirmation Modal States
  const [contactUpdatePending, setContactUpdatePending] = useState(null); // stores payload when modal is open
  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const profileRes = await getMyProfile();
        if (profileRes?.data) {
          // [FIX]: Backenddan ma'lumotlar { user: {...}, profile: {...} } shaklida keladi.
          // Oldin to'g'ridan to'g'ri .data ga murojaat qilingani uchun hamma qiymat undefined bo'lib qolardi.
          const u = profileRes.data.user || {};
          const p = profileRes.data.profile || {};
          setUserData(prev => ({
            ...prev,
            id: u.id || "",
            name: u.first_name || "",
            fullName: `${u.first_name || ""} ${u.last_name || ""}`.trim() || "",
            username: u.username ? `@${u.username}` : "",
            email: u.email || "",
            phone: u.phone || "",
            location: p.location || "",
            title: p.title || "",
            bio: p.bio || "",
            profilePicture: p.avatar_url || u.avatar_url || "",
            hourlyRate: p.hourly_rate || 0,
            cv_url: p.cv_url || "",
            coverPhoto: p.cover_url || "",
            languages: p.languages || [],
            category_id: p.category_id || null,
            categoryName: p.category_name || "",
            jobsCompleted: profileRes.data.completed_jobs || p.completed_jobs || 0,
            activeProjects: profileRes.data.in_progress_jobs || profileRes.data.active_projects || 0,
            totalEarned: profileRes.data.total_earned || p.total_earned || 0,
            successScore: profileRes.data.job_success_score || p.job_success_score || 0,
            rating: profileRes.data.average_rating || p.average_rating || 0,
            // KYC ma'lumotlari
            is_kyc_verified: u.is_kyc_verified || false,
            kyc_status: u.kyc_status || 'none',
          }));



          if (p.skills && Array.isArray(p.skills)) {
            setSkills(p.skills);
          } else {
            setSkills([]);
          }
        }

        const portRes = await getMyPortfolio();
        console.log("[Portfolio FETCH] backend response:", portRes);
        
        // Robust handling of portfolio data structure
        const portItems = portRes?.data?.items || portRes?.data || portRes || [];
        
        if (Array.isArray(portItems)) {
          setPortfolio(portItems.map(p => ({
            id: p.id,
            title: p.title,
            role: p.role || "",
            description: p.description,
            url: p.project_url || p.url,
            media: p.media || p.portfolio_media || [],
            skills: p.skills || [],
            created_at: p.created_at
          })));
        } else if (portRes?.success && portRes?.data?.items) {
           // Fallback for some specific structures
           setPortfolio(portRes.data.items);
        }

        // Sertifikatlarni backenddan olish
        const certRes = await getMyCertifications();
        console.log("[Cert FETCH] backend response:", certRes);
        // Backend response strukturasiga robust ishlov
        const certList = certRes?.data?.certifications || certRes?.data?.items || certRes?.data || certRes?.certifications;
        if (Array.isArray(certList)) {
          setCertificates(certList);
        }

        // Fetch categories for editing
        const catRes = await getCategories();
        if (catRes?.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        } else if (Array.isArray(catRes)) {
          setCategories(catRes);
        }

        // Fetch notification settings
        const notiSettingsRes = await getNotificationSettings();
        if (notiSettingsRes?.success) {
          const s = notiSettingsRes.data;
          setNotificationSettings([
            {
              category: "profile.notifications.categories.jobs",
              settings: [
                { id: "proposal_received", label: "profile.notifications.items.proposal_received.label", description: "profile.notifications.items.proposal_received.desc", enabled: s.proposal_received },
                { id: "proposal_withdrawn", label: "profile.notifications.items.proposal_withdrawn.label", description: "profile.notifications.items.proposal_withdrawn.desc", enabled: s.proposal_withdrawn }
              ]
            },
            {
              category: "profile.notifications.categories.payments",
              settings: [
                { id: "payment_success", label: "profile.notifications.items.payment_success.label", description: "profile.notifications.items.payment_success.desc", enabled: s.payment_success },
                { id: "invoice_ready", label: "profile.notifications.items.invoice_ready.label", description: "profile.notifications.items.invoice_ready.desc", enabled: s.invoice_ready }
              ]
            }
          ]);
          setDeliveryPrefs({
            email: s.email_notifications,
            push: s.push_notifications
          });
        }

        // Fetch all notifications for history
        setNotifLoading(true);
        const notifsRes = await getNotifications({ limit: 50 });
        if (notifsRes?.success) {
          setAllNotifications(notifsRes.data.notifications || []);
        }
        setNotifLoading(false);
      } catch (err) {
        console.error("fetchData error:", err);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Update portfolio skill suggestions
  useEffect(() => {
    if (newSkillInput.trim().length > 0) {
      const filtered = PROFESSIONAL_SKILLS.filter(s => 
        s.toLowerCase().includes(newSkillInput.toLowerCase()) && 
        !portfolioForm.skills.includes(s)
      ).slice(0, 5);
      setPortSkillSuggestions(filtered);
    } else {
      setPortSkillSuggestions([]);
    }
  }, [newSkillInput, portfolioForm.skills]);

  const [userData, setUserData] = useState({
    id: "",
    name: "",
    fullName: "",

    username: "",
    email: "",
    phone: "",
    location: "",
    timezone: "GMT+5",
    languages: [],
    accountType: "Freelancer",
    membership: "Pro",
    membershipStatus: "Active",
    membershipStartDate: "",
    membershipNextBilling: "",
    title: "",
    bio: "",
    profilePicture: "",
    coverPhoto: "", // Updated
    hourlyRate: 0,

    totalEarned: 0,
    jobsCompleted: 0,
    activeProjects: 0,
    rating: 0,
    successScore: 0,
    responseTime: "< 1 hour",
    availability: "Available now",
    cv_url: "", // NEW: Added CVS link
  });


  const [skills, setSkills] = useState([]);

  const [certificates, setCertificates] = useState([]);

  const [portfolio, setPortfolio] = useState([]);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Membership plans
  const membershipPlans = [
    {
      id: "basic",
      name: "Basic",
      icon: <Star size={24} />,
      price: {
        monthly: 0,
        yearly: 0
      },
      features: [
        "5 job proposals per month",
        "Basic profile visibility",
        "Standard support (24h response)",
        "Basic analytics",
        "5MB portfolio space",
        "Basic search ranking"
      ],
      limitations: [
        "No skill assessments",
        "No featured profile",
        "Limited search visibility",
        "No priority support"
      ],
      color: "#64748b",
      popular: false,
      current: userData.membership === "Basic"
    },
    {
      id: "plus",
      name: "Plus",
      icon: <Zap size={24} />,
      price: {
        monthly: 14.99,
        yearly: 149.99
      },
      yearlyDiscount: 17,
      features: [
        "20 job proposals per month",
        "Enhanced profile visibility",
        "Priority support (12h response)",
        "Advanced analytics",
        "50MB portfolio space",
        "Better search ranking",
        "5 skill assessments per month",
        "Profile badge"
      ],
      limitations: [
        "No featured profile",
        "No exclusive events"
      ],
      color: "#3b82f6",
      popular: false,
      current: userData.membership === "Plus"
    },
    {
      id: "professional",
      name: "Professional",
      icon: <Crown size={24} />,
      price: {
        monthly: 29.99,
        yearly: 299.99
      },
      yearlyDiscount: 17,
      features: [
        "Unlimited job proposals",
        "Featured profile visibility",
        "Premium support (4h response)",
        "Real-time analytics",
        "500MB portfolio space",
        "Top search ranking",
        "Unlimited skill assessments",
        "Exclusive profile badge",
        "Early access to new features",
        "Invitation to exclusive events"
      ],
      limitations: [],
      color: "#8b5cf6",
      popular: true,
      current: userData.membership === "Professional" || userData.membership === "Pro"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: <Rocket size={24} />,
      price: {
        monthly: 59.99,
        yearly: 599.99
      },
      yearlyDiscount: 17,
      features: [
        "Unlimited everything",
        "Verified expert badge",
        "Dedicated account manager",
        "API access",
        "Custom analytics",
        "White-label options",
        "Team management",
        "Bulk job posting",
        "Advanced security",
        "SLA guarantee"
      ],
      limitations: [],
      color: "#f59e0b",
      popular: false,
      current: userData.membership === "Enterprise"
    }
  ];

  // Current membership details
  const currentPlan = membershipPlans.find(plan => plan.current) || membershipPlans[2]; // Professional default

  const navSections = [
    {
      title: t("profile.settings", "SETTINGS").toUpperCase(),
      items: [
        { id: "my-info", label: t("profile.myInfo", "My Info"), icon: <User size={18} />, badge: null },
        { id: "cv-upload", label: t("profile.cvUpload", "CV Upload"), icon: <FileText size={18} />, badge: null },
        { id: "billing", label: t("profile.billing", "Billing & Payments"), icon: <CreditCard size={18} />, badge: null },
        { id: "password", label: t("profile.password", "Password & Security"), icon: <Shield size={18} />, badge: null },
        { id: "membership", label: t("profile.membership", "Membership"), icon: <Award size={18} />, badge: userData.membership },
        { id: "notifications", label: t("profile.notifications", "Notification Settings"), icon: <Bell size={18} />, badge: null },
        { id: "appeals", label: t("profile.appeals", "Appeals Tracker"), icon: <AlertTriangle size={18} />, badge: null }
      ]
    }
  ];

  // const headerNav = [
  //   { id: "find", label: "Find work", icon: <Search size={16} />, active: activeHeaderTab === "find" },
  //   { id: "manage", label: "My jobs", icon: <BarChart size={16} />, active: activeHeaderTab === "manage" },
  //   { id: "reports", label: "Reports", icon: <FileText size={16} />, active: activeHeaderTab === "reports" },
  //   { id: "messages", label: "Messages", icon: <MessageCircle size={16} />, active: activeHeaderTab === "messages", badge: notifications }
  // ];

  // const handleHeaderNavClick = (id) => {
  //   setActiveHeaderTab(id);
  //   showMessage("info", `Navigating to ${headerNav.find(item => item.id === id).label}...`);
  // };

  // const handleSearch = (e) => {
  //   e.preventDefault();
  //   if (searchQuery.trim()) {
  //     showMessage("info", `Searching for: ${searchQuery}`);
  //   }
  // };

  const handleSectionChange = (id, label) => {
    navigate(`/profile?section=${id}`);
    setShowMobileMenu(false);
    showMessage("info", `Opening ${label}...`);
  };

  const handleUserMenuClick = async (action) => {
    // setShowUserDropdown(false);
    if (action === "Sign Out") {
      setIsLoading(true);
      try {
        await logout();
        window.dispatchEvent(new Event("authChange"));
        navigate("/login");
      } catch (err) {
        showMessage("error", "Logout failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      showMessage("info", `${action} clicked`);
    }
  };


  useEffect(() => {
    if (skillSearch.trim()) {
      const filtered = PROFESSIONAL_SKILLS.filter(
        skill => 
          skill.toLowerCase().includes(skillSearch.toLowerCase()) && 
          !tempSkills.includes(skill)
      ).slice(0, 10);
      setSkillSuggestions(filtered);
      setActiveSuggestion(0);
    } else {
      setSkillSuggestions([]);
    }
  }, [skillSearch, tempSkills]);

  const handleAddSkillFromList = (skill) => {
    if (skill && !tempSkills.includes(skill) && tempSkills.length < 20) {
      setTempSkills([...tempSkills, skill]);
      setSkillSearch("");
      setSkillSuggestions([]);
    }
  };

  const handleEditInputChange = (field, value) => {

    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field, value) => {

    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (skillName) => {
    if (skillName && !skills.includes(skillName)) {
      setSkills([...skills, skillName]);
      showMessage("success", "Skill added successfully");
    }
  };

  const removeSkill = (skillName) => {
    setSkills(skills.filter(s => s !== skillName));
    showMessage("success", "Skill removed");
  };

  const handlePortfolioInputChange = (field, value) => {
    setPortfolioForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !portfolioForm.skills.includes(newSkillInput.trim())) {
      setPortfolioForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkillInput.trim()]
      }));
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setPortfolioForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handlePortfolioFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if ((portfolioForm.media.length + portfolioForm.files.length + files.length) <= 10) {
      setPortfolioForm(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }));
    } else {
      showMessage("error", t("profile.maxFilesError", "Maksimal 10 ta fayl ruxsat etilgan"));
    }
  };

  const handleRemovePortfolioFile = (indexToRemove) => {
    setPortfolioForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== indexToRemove)
    }));
  };

  const handleRemoveExistingMedia = async (mediaId) => {
    if (!editingPortfolio) return;
    try {
      const res = await deletePortfolioMedia(editingPortfolio.id, mediaId);
      if (res?.success) {
        setPortfolioForm(prev => ({
          ...prev,
          media: prev.media.filter(m => m.id !== mediaId)
        }));
        showMessage("success", t("profile.mediaDeleted", "Media o'chirildi"));
      }
    } catch (err) {
      showMessage("error", t("profile.mediaDeleteError", "Media o'chirishda xatolik"));
    }
  };

  const openAddLanguage = () => {
    setEditingLangIdx(null);
    setLangForm({ language: "", proficiency: "Conversational" });
    setShowLanguageModal(true);
  };

  const openEditLanguage = (langObj, idx) => {
    setEditingLangIdx(idx);
    setLangForm({ language: langObj.language, proficiency: langObj.proficiency });
    setShowLanguageModal(true);
  };

  const handleDeleteLanguage = async (idx) => {
    setIsLoading(true);
    try {
      const newLanguages = userData.languages.filter((_, i) => i !== idx);
      await updateMyProfile({ languages: newLanguages });
      setUserData(prev => ({ ...prev, languages: newLanguages }));
      showMessage("success", t("profile.skillsUpdated", "Language deleted successfully"));
    } catch (error) {
      showMessage("error", "Failed to delete language");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLanguage = async () => {
    if (!langForm.language.trim() || !langForm.proficiency) {
      showMessage("error", "Language and proficiency are required");
      return;
    }

    setIsLoading(true);
    try {
      const newLanguages = [...userData.languages];
      if (editingLangIdx !== null) {
        newLanguages[editingLangIdx] = langForm;
      } else {
        newLanguages.push(langForm);
      }
      
      await updateMyProfile({ languages: newLanguages });
      setUserData(prev => ({ ...prev, languages: newLanguages }));
      
      // Sync localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, languages: newLanguages }));
      window.dispatchEvent(new Event("authChange"));

      setShowLanguageModal(false);
      showMessage("success", t("profile.skillsUpdated", "Languages updated successfully"));
    } catch (error) {
      showMessage("error", "Failed to save language");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddPortfolio = () => {
    setEditingPortfolio(null);
    setPortfolioForm({
      title: "",
      role: "",
      description: "",
      url: "",
      media: [],
      files: [],
      skills: []
    });
    setShowPortfolioModal(true);
  };

  const openEditPortfolio = (item) => {
    setEditingPortfolio(item);
    setPortfolioForm({
      title: item.title,
      role: item.role || "",
      description: item.description,
      url: item.url || item.project_url || "",
      media: item.media || [],
      files: [],
      skills: item.skills || []
    });
    setShowPortfolioModal(true);
  };

  const handleSavePortfolio = async () => {
    if (!portfolioForm.title.trim()) {
      showMessage("error", t("profile.titleRequired", "Sarlavha majburiy"));
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: portfolioForm.title,
        role: portfolioForm.role,
        description: portfolioForm.description,
        project_url: portfolioForm.url,
        skills: portfolioForm.skills,
        is_featured: false
      };

      let itemId = editingPortfolio?.id;
      
      if (editingPortfolio) {
        await updatePortfolioItem(itemId, payload);
      } else {
        const res = await createPortfolioItem(payload);
        if (!res?.success) throw new Error(res.message);
        itemId = res.data.item.id;
      }

      // Upload new files
      if (portfolioForm.files.length > 0) {
        const uploadErrors = [];
        for (const file of portfolioForm.files) {
          const formData = new FormData();
          formData.append("media", file);
          const mediaRes = await addPortfolioMedia(itemId, formData);
          if (!mediaRes?.success) {
            uploadErrors.push(file.name);
            console.error("Media upload failed:", file.name, mediaRes?.message);
          }
        }
        if (uploadErrors.length > 0) {
          showMessage("error", `Media yuklanmadi: ${uploadErrors.join(", ")}`);
        }
      }

      // Refresh data
      const portRes = await getMyPortfolio();
      const portItems = portRes?.data?.items || portRes?.data || portRes || [];
      
      if (Array.isArray(portItems)) {
        setPortfolio(portItems.map(p => ({
          id: p.id,
          title: p.title,
          role: p.role || "",
          description: p.description,
          url: p.project_url || p.url,
          media: p.media || p.portfolio_media || [],
          skills: p.skills || [],
          created_at: p.created_at
        })));
      }

      setShowPortfolioModal(false);
      showMessage("success", t("profile.messages.portfolioSaved"));
    } catch (err) {
      console.error("Save portfolio error:", err);
      showMessage("error", err.message || t("profile.messages.saveError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (window.confirm(t("profile.messages.deleteConfirm"))) {
      setIsLoading(true);
      try {
        const res = await deletePortfolioItem(id);
        if (res?.success === false) throw new Error(res.message);
        
        setPortfolio(prev => prev.filter(item => item.id !== id));
        showMessage("success", t("profile.messages.portfolioDeleted"));
      } catch (err) {
        showMessage("error", err.message || t("profile.messages.deleteError"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleNotification = async (catIdx, settingId) => {
    let newValue = false;
    setNotificationSettings(prev => {
      const newSettings = [...prev];
      const category = { ...newSettings[catIdx] };
      category.settings = category.settings.map(s => {
        if (s.id === settingId) {
          newValue = !s.enabled;
          return { ...s, enabled: newValue };
        }
        return s;
      });
      newSettings[catIdx] = category;
      return newSettings;
    });

    try {
      await updateNotificationSettings({ [settingId]: newValue });
      showMessage("success", t("profile.messages.notifSettingUpdated"));
    } catch (err) {
      showMessage("error", t("profile.messages.saveError"));
    }
  };

  const handleToggleDeliveryPref = async (type) => {
    const newValue = !deliveryPrefs[type];
    setDeliveryPrefs(prev => ({ ...prev, [type]: newValue }));
    
    try {
      const payload = type === 'email' 
        ? { email_notifications: newValue } 
        : { push_notifications: newValue };
      await updateNotificationSettings(payload);
      showMessage("success", t("profile.messages.deliverySettingUpdated"));
    } catch (err) {
      showMessage("error", t("profile.messages.saveError"));
    }
  };

  const handleMarkNotifRead = async (id) => {
    const res = await markNotificationRead(id);
    if (res?.success) {
      setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsRead();
    if (res?.success) {
      setAllNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      showMessage("success", t("profile.messages.allRead"));
    }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const ext = file.name.split('.').pop().toLowerCase();
    const isDoc = allowedTypes.includes(file.type) || ["pdf", "doc", "docx"].includes(ext);

    if (!isDoc) {
      showMessage("error", "Only PDF and Word documents are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "File size must be less than 5MB.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await uploadFile(formData);
      if (!uploadRes.success) throw new Error(uploadRes.message);

      const cvUrl = uploadRes.data.url;
      const updateRes = await updateMyProfile({ cv_url: cvUrl });
      if (!updateRes.success) throw new Error(updateRes.message || updateRes.error);

      setUserData(prev => ({ ...prev, cv_url: cvUrl }));
      showMessage("success", t("profile.messages.cvUploaded"));
    } catch (err) {
      showMessage("error", err.message || t("profile.messages.saveError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      showMessage("error", "Only JPG, PNG and WebP images are allowed.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar"); // Send type for resizing

      const uploadRes = await uploadImage(formData);
      if (!uploadRes.success) throw new Error(uploadRes.message);

      const imageUrl = uploadRes.data.url;
      // Update profile with new avatar_url
      const updateRes = await updateMyProfile({ avatar_url: imageUrl });
      if (!updateRes.success) throw new Error(updateRes.message || updateRes.error);

      setUserData(prev => ({ ...prev, profilePicture: imageUrl }));
      
      // Sync localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, avatar_url: imageUrl }));
      window.dispatchEvent(new Event("authChange"));

      showMessage("success", t("profile.messages.avatarUpdated"));
    } catch (err) {
      showMessage("error", err.message || t("profile.messages.saveError"));
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith("image/")) {
      showMessage("error", "Please upload an image file.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "cover"); // Send type for resizing

      const uploadRes = await uploadImage(formData);
      if (!uploadRes.success) throw new Error(uploadRes.message);

      const imageUrl = uploadRes.data.url;
      // Update profile with new cover_url
      const updateRes = await updateMyProfile({ cover_url: imageUrl });
      if (!updateRes.success) throw new Error(updateRes.message || updateRes.error);

      setUserData(prev => ({ ...prev, coverPhoto: imageUrl }));
      showMessage("success", "Cover photo updated successfully!");
    } catch (err) {
      showMessage({ type: "error", text: err.message || "Failed to update cover" });
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const handleDeleteCv = async () => {

    if (!window.confirm("Are you sure you want to delete your CV?")) return;

    setIsLoading(true);
    try {
      const updateRes = await updateMyProfile({ cv_url: null });
      if (!updateRes.success) throw new Error(updateRes.message || updateRes.error);

      setUserData(prev => ({ ...prev, cv_url: "" }));
      showMessage("success", "CV deleted successfully");
    } catch (err) {
      showMessage("error", err.message || "Failed to delete CV");
    } finally {
      setIsLoading(false);
    }
  };

  // Password functions
  const handlePasswordChange = (field, value) => {
    const updated = { ...passwordForm, [field]: value };
    setPasswordForm(updated);

    if (field === "new") {
      const validations = {
        minLength: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        match: value === updated.confirm && value !== ""
      };
      setPasswordValidations(validations);

      const score = Object.values(validations).filter(Boolean).length;
      setPasswordStrength(score);
    }

    if (field === "confirm") {
      setPasswordValidations(prev => ({
        ...prev,
        match: value === updated.new && value !== ""
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await getSessions();
      if (res.success) {
        setSessions(res.data || []);
      }
    } catch (err) {
      console.error("Fetch sessions error:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'security') {
      fetchSessions();
    }
  }, [activeSection]);

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm("Haqiqatan ham ushbu qurilmadan chiqmoqchimisiz?")) return;
    
    setIsLoading(true);
    try {
      const res = await revokeSession(sessionId);
      if (res.success) {
        showMessage("success", "Sessiya muvaffaqiyatli yopildi");
        fetchSessions();
      } else {
        showMessage("error", res.message);
      }
    } catch (err) {
      showMessage("error", "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const parseUA = (ua) => {
    if (!ua || ua.includes("Eski seans")) {
      return { browser: "Eski seans", os: "Noma'lum qurilma", device: "desktop" };
    }
    const lower = ua.toLowerCase();
    let browser = "Brauzer";
    let os = "Operatsion tizim";
    let device = "desktop";

    if (lower.includes("chrome")) browser = "Chrome";
    else if (lower.includes("firefox")) browser = "Firefox";
    else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
    else if (lower.includes("edge")) browser = "Edge";
    else if (lower.includes("opera") || lower.includes("opr")) browser = "Opera";

    if (lower.includes("win")) os = "Windows";
    else if (lower.includes("mac")) os = "macOS";
    else if (lower.includes("linux")) os = "Linux";
    else if (lower.includes("android")) { os = "Android"; device = "mobile"; }
    else if (lower.includes("iphone") || lower.includes("ipad")) { os = "iOS"; device = "mobile"; }

    return { browser, os, device };
  };

  const toggleSecurity = async (id) => {
    if (id === "twoFactor") {
      if (securityToggles.twoFactor) {
        // Disable 2FA
        if (window.confirm("Ikki bosqichli tasdiqlashni o'chirmoqchimisiz?")) {
          setIsLoading(true);
          try {
            const res = await disable2FA();
            if (res.success) {
              setSecurityToggles(prev => ({ ...prev, twoFactor: false }));
              const user = JSON.parse(localStorage.getItem("user") || "{}");
              user.two_factor_enabled = false;
              localStorage.setItem("user", JSON.stringify(user));
              showMessage("success", "Ikki bosqichli tasdiqlash o'chirildi");
            } else {
              showMessage("error", res.message);
            }
          } catch (err) {
            showMessage("error", "Xatolik yuz berdi");
          } finally {
            setIsLoading(false);
          }
        }
      } else {
        // Enable 2FA - Open Modal
        setFaStep("select");
        setVerificationCode("");
        setShow2FAModal(true);
      }
      return;
    }
    setSecurityToggles(prev => ({ ...prev, [id]: !prev[id] }));
    showMessage("success", `${id} updated successfully`);
  };

  // 2FA Handlers
  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      showMessage("error", "6 xonali kodni kiriting");
      return;
    }
    setIsLoading(true);
    const res = await confirm2FA(verificationCode);
    setIsLoading(false);
    if (res.success) {
      setShow2FAModal(false);
      setSecurityToggles(prev => ({ ...prev, twoFactor: true }));
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.two_factor_enabled = true;
      localStorage.setItem("user", JSON.stringify(user));
      showMessage("success", "Ikki bosqichli tasdiqlash yoqildi!");
    } else {
      showMessage("error", res.message);
    }
  };

  const handleSend2FACode = async () => {
    setIsLoading(true);
    const res = await enable2FA("email");
    setIsLoading(false);
    if (res.success) {
      setFaStep("verify");
      showMessage("success", "Tasdiqlash kodi emailingizga yuborildi");
    } else {
      showMessage("error", res.message);
    }
  };

  // Forgot Password Handlers
  const handleOpenForgotModal = () => {
    setForgotEmail(userData.email || "");
    setForgotStep("email");
    setForgotCode("");
    setForgotNewPassword("");
    setShowForgotModal(true);
  };

  const handleSendForgotCode = async () => {
    if (!forgotEmail) {
      showMessage("error", "Email kiritilmadi");
      return;
    }
    setIsLoading(true);
    const res = await forgotPassword({ identifier: forgotEmail });
    setIsLoading(false);
    if (res.success) {
      setForgotStep("reset");
      showMessage("success", "Tasdiqlash kodi emailingizga yuborildi");
    } else {
      showMessage("error", res.message);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotCode || !forgotNewPassword) {
      showMessage("error", "Kod va yangi parolni kiriting");
      return;
    }
    if (forgotNewPassword.length < 8) {
      showMessage("error", "Parol kamida 8 ta belgidan iborat bo'lishi kerak");
      return;
    }
    setIsLoading(true);
    const res = await resetPassword({
      identifier: forgotEmail,
      code: forgotCode,
      new_password: forgotNewPassword
    });
    setIsLoading(false);
    if (res.success) {
      setShowForgotModal(false);
      showMessage("success", "Parol muvaffaqiyatli yangilandi! Endi yangi parol bilan kiring.");
    } else {
      showMessage("error", res.message);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      showMessage("error", "Barcha maydonlarni to'ldiring");
      return;
    }

    if (!Object.values(passwordValidations).every(Boolean)) {
      showMessage("error", "Parol talablarga javob bermaydi");
      return;
    }

    setIsLoading(true);
    try {
      const res = await changePassword({
        current_password: passwordForm.current,
        new_password: passwordForm.new,
        confirm_password: passwordForm.confirm
      });
      
      if (res.success) {
        showMessage("success", "Parol muvaffaqiyatli yangilandi!");
        setPasswordForm({ current: "", new: "", confirm: "" });
        setPasswordValidations({
          minLength: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
          match: false
        });
      } else {
        showMessage("error", res.message || "Parolni yangilashda xatolik");
      }
    } catch (err) {
      showMessage("error", "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "#ef4444";
    if (passwordStrength <= 4) return "#f59e0b";
    return "#10b981";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };

  const handleSectionEdit = (section, initialData = {}) => {
    if (section === 'skills') {
      setTempSkills([...skills]);
      setShowSkillsModal(true);
      return;
    }
    setEditingSection(section);
    setEditFormData({ ...userData, ...initialData });
  };

  const handleSectionCancel = () => {
    setEditingSection(null);
    setEditFormData({});
  };

  const handleSectionSave = async (section) => {
    let payload = {};
    
    switch(section) {
      case 'name':
        payload = {
          first_name: editFormData.fullName.split(' ')[0] || "",
          last_name: editFormData.fullName.split(' ').slice(1).join(' ') || "",
          title: editFormData.title,
          category_id: editFormData.category_id
        };
        break;
      case 'bio':
        payload = { bio: editFormData.bio };
        break;
      case 'rate':
        payload = { hourly_rate: Number(editFormData.hourlyRate) || 0 };
        break;
      case 'contact':
        payload = {
          location: editFormData.location,
          email: editFormData.email,
          phone: editFormData.phone
        };
        // Use a small timeout to ensure the state update doesn't conflict with the current click event
        setTimeout(() => {
          setContactUpdatePending(payload);
        }, 10);
        return;
      case 'skills':
        payload = { skills: skills };
        break;
      default:
        payload = editFormData;
    }

    await performSave(section, payload);
  };

  const performSave = async (section, payload) => {
    setIsLoading(true);
    try {
      const res = await updateMyProfile(payload);
      if (res?.success === false) throw new Error(res.error || res.message);

      // Update local state
      setUserData(prev => ({ ...prev, ...editFormData }));
      
      // [SYNC]: Update localStorage for header consistency
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser };
      if (payload.first_name !== undefined) updatedUser.first_name = payload.first_name;
      if (payload.last_name !== undefined) updatedUser.last_name = payload.last_name;
      if (payload.email !== undefined) updatedUser.email = payload.email;
      if (payload.phone !== undefined) updatedUser.phone = payload.phone;
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("authChange"));

      setEditingSection(null);
      showMessage("success", `${section.charAt(0).toUpperCase() + section.slice(1)} muvaffaqiyatli yangilandi!`);
    } catch (err) {
      showMessage("error", err.message || `Failed to update ${section}`);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmContactSave = async () => {
    if (!contactUpdatePending) return;
    const payload = contactUpdatePending;
    setContactUpdatePending(null);
    await performSave('contact', payload);
  };

  const handleSave = async () => {
    // This was the old global save, we keep it for now but we will use handleSectionSave mostly
    await handleSectionSave(editingSection || 'all');
  };


  // =================== Certificate functions (API) ===================
  const openAddCert = () => {
    setEditingCert(null);
    setCertForm({ title: "", issuer: "", issue_year: "", issue_month: "", credential_id: "", credential_url: "" });
    setShowCertModal(true);
  };

  const openEditCert = (cert) => {
    setEditingCert(cert);
    setCertForm({
      title: cert.title || "",
      issuer: cert.issuer || "",
      issue_year: cert.issue_year || "",
      issue_month: cert.issue_month || "",
      credential_id: cert.credential_id || "",
      credential_url: cert.credential_url || ""
    });
    setShowCertModal(true);
  };

  const handleSaveCert = async () => {
    if (!certForm.title.trim()) {
      showMessage("error", "Sertifikat nomi majburiy!");
      return;
    }
    setCertLoading(true);
    try {
      const payload = {
        title: certForm.title.trim(),
        issuer: certForm.issuer.trim() || null,
        issue_year: certForm.issue_year ? parseInt(certForm.issue_year) : null,
        issue_month: certForm.issue_month ? parseInt(certForm.issue_month) : null,
        credential_id: certForm.credential_id.trim() || null,
        credential_url: certForm.credential_url.trim() || null
      };

      if (editingCert) {
        const res = await updateCertification(editingCert.id, payload);
        console.log("[Cert UPDATE] backend response:", res);
        if (res?.success === false) throw new Error(res.message);
        // Backend response strukturasiga robust ishlov: data.certification, data, yoki certification
        const updatedCert = res?.data?.certification || res?.data || res?.certification || { ...editingCert, ...payload };
        setCertificates(prev => prev.map(c => c.id === editingCert.id ? updatedCert : c));
        showMessage("success", "Sertifikat yangilandi!");
      } else {
        const res = await createCertification(payload);
        console.log("[Cert CREATE] backend response:", res);
        if (res?.success === false) throw new Error(res.message);
        // Backend response strukturasiga robust ishlov: data.certification, data, yoki certification
        const newCert = res?.data?.certification || res?.data || res?.certification || { id: Date.now(), ...payload };
        setCertificates(prev => [...prev, newCert]);
        showMessage("success", "Sertifikat qo'shildi!");
      }
      setShowCertModal(false);
    } catch (err) {
      console.error("[Cert SAVE] xato:", err);
      showMessage("error", err.message || "Sertifikatni saqlashda xato");
    } finally {
      setCertLoading(false);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm("Sertifikatni o'chirishni tasdiqlaysizmi?")) return;
    setCertLoading(true);
    try {
      const res = await deleteCertification(id);
      if (res?.success === false) throw new Error(res.message);
      setCertificates(prev => prev.filter(c => c.id !== id));
      showMessage("success", "Sertifikat o'chirildi!");
    } catch (err) {
      showMessage("error", err.message || "O'chirishda xato");
    } finally {
      setCertLoading(false);
    }
  };

  // Membership functions
  const handleUpgradeClick = (planId) => {
    const plan = membershipPlans.find(p => p.id === planId);
    setSelectedPlanForModal(plan);
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUserData(prev => ({
        ...prev,
        membership: selectedPlanForModal.name,
        membershipStatus: "Active"
      }));
      setShowUpgradeModal(false);
      setIsLoading(false);
      showMessage("success", `Successfully upgraded to ${selectedPlanForModal.name} plan!`);
    }, 1500);
  };

  const handleCancelMembership = () => {
    if (window.confirm("Are you sure you want to cancel your membership? This action cannot be undone.")) {
      setIsLoading(true);
      setTimeout(() => {
        setUserData(prev => ({
          ...prev,
          membership: "Basic",
          membershipStatus: "Cancelled"
        }));
        setIsLoading(false);
        showMessage("info", "Your membership has been cancelled");
      }, 1500);
    }
  };

  return (
    <div id="my-profile-root" className={`settings-container ${isDark ? "dark" : "light"}`}>
      
      {/* HEADER
      <header className="settings-header">
        <div className="header-container">
          <div className="header-left">
            <button 
              className="mobile-menu-btn" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
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
                placeholder="Search jobs, skills, freelancers..." 
                className="search-input" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              {searchQuery && (
                <button type="button" className="search-clear" onClick={() => setSearchQuery("")}>
                  <X size={14} />
                </button>
              )}
              <kbd className="search-shortcut">⌘K</kbd>
            </form>
            
            <div className="header-actions">
              <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="notification-btn" onClick={() => setNotifications(0)}>
                <Bell size={18} />
                {notifications > 0 && <span className="notification-badge"></span>}
              </button>
              <div className="user-profile" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                <div className="user-avatar-wrapper">
                  <img src={userData.profilePicture} alt="User" className="user-avatar" />
                  <span className={`user-status ${getSocket()?.connected ? 'online' : 'offline'}`}></span>
                </div>
                <div className="user-details">
                  <span className="user-display-name">{userData.name}</span>
                  <span className="user-role">Freelancer</span>
                </div>
                <ChevronDown size={16} className={`dropdown-icon ${showUserDropdown ? 'open' : ''}`} />
              </div>
              {showUserDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <img src={userData.profilePicture} alt="User" className="dropdown-avatar" />
                    <div>
                      <h4>{userData.fullName}</h4>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-menu">
                    <button onClick={() => handleUserMenuClick("Profile")}>
                      <User size={14} /> My Profile
                    </button>
                    <button onClick={() => handleUserMenuClick("Settings")}>
                      <SettingsIcon size={14} /> Settings
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
      <div id="my-profile-settings-main" className="settings-main">
        
        {/* SIDEBAR DELETED */}

        {/* CONTENT AREA */}
        <main id="my-profile-settings-content" className="settings-content" style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", padding: "24px 24px" }}>
          
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
              <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h1 className="section-title" style={{ margin: 0, textTransform: 'uppercase', fontSize: '24px', lineHeight: '1', display: 'flex', alignItems: 'center' }}>
                  {t("profile.myInfo", "My Info")}
                </h1>
                <a 
                  href={`/profile/${userData.id}`}
                  className="view-profile-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', height: 'fit-content' }}
                >
                  <Eye size={16} />{t("profile.viewPublicProfile", "View Public Profile")}
                </a>
              </div>
              
              <div id="my-profile-main-card" className="profile-card soft-fade-in stagger-1">
                <div className="profile-cover" style={{ position: 'relative' }}>
                  <span className="section-badge" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: 'var(--surface, rgba(255,255,255,0.9))', color: 'var(--blue, #3b82f6)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <User size={14} />{t("profile.professionalProfile", "Professional Profile")}
                  </span>
                  <img src={avatarSrc(userData.coverPhoto)} alt="Cover" className="cover-image" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <button className="change-cover-btn" onClick={() => document.getElementById('cover-upload-input').click()} disabled={isLoading}>
                    <Camera size={15} /> {t("profile.edit", "Edit")}
                  </button>
                  <input 
                    type="file" 
                    id="cover-upload-input" 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                    onChange={handleCoverUpload} 
                  />
                </div>

                
                <div id="my-profile-content-area" className="profile-content">
                  {/* Avatar va ism qismi */}
                  <div className="profile-avatar-section">
                    <div className="avatar-wrapper">
                      <AvatarImage src={userData.profilePicture} name={userData.fullName} size={150} className="profile-avatar" />
                      <button className="change-avatar-btn" onClick={() => document.getElementById('avatar-upload-input').click()} disabled={isLoading}>
                        <Camera size={14} />
                      </button>
                      <input 
                        type="file" 
                        id="avatar-upload-input" 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                        onChange={handleAvatarUpload} 
                      />
                      <span className={`avatar-status ${getSocket()?.connected ? 'online' : 'offline'}`} />
                    </div>

                    <div className="profile-name-section">
                      {editingSection === 'name' ? (
                        <div className="inline-edit-container">
                          <input 
                            type="text" 
                            value={editFormData.fullName} 
                            onChange={(e) => handleEditInputChange('fullName', e.target.value)} 
                            className="inline-edit-input name-edit-input" 
                            placeholder={t("profile.fullNamePlaceholder", "Full Name")}
                          />
                          <input 
                            type="text" 
                            value={editFormData.title} 
                            onChange={(e) => handleEditInputChange('title', e.target.value)} 
                            className="inline-edit-input" 
                            placeholder={t("profile.titlePlaceholder", "Professional title")} 
                          />
                          <select 
                            value={editFormData.category_id || ""} 
                            onChange={(e) => handleEditInputChange('category_id', e.target.value)}
                            className="inline-edit-input"
                            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '12px' }}
                          >
                            <option value="">{t("profile.selectCategory", "Sohangizni tanlang")}</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <div className="inline-edit-actions">
                            <button className="btn-cancel-inline" onClick={handleSectionCancel}>{t("profile.cancel", "Cancel")}</button>
                            <button className="btn-save-inline" onClick={() => handleSectionSave('name')}>
                              {isLoading ? <RefreshCw size={14} className="spinning" /> : <Save size={14} />}
                              {t("profile.save", "Save")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="section-edit-trigger" onClick={() => handleSectionEdit('name', { fullName: userData.fullName, title: userData.title, category_id: userData.category_id })}>
                          <div>
                            <h2 className="profile-fullname">{userData.fullName}</h2>
                            <p className="profile-title">{userData.title || t("profile.titlePlaceholder", "Professional title")}</p>
                            {userData.categoryName && (
                              <span style={{ fontSize: '12px', background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', marginBottom: '8px', display: 'inline-block' }}>
                                {userData.categoryName}
                              </span>
                            )}
                            <p className="profile-username">{userData.username}</p>
                          </div>
                          <button className="edit-pencil-btn">
                            <Edit size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    
                    {/* Badges */}
                    <div className="profile-badges-row">
                      <span className="profile-badge-item profile-badge-membership">
                        <Award size={14} />{userData.membership}
                      </span>
                      {userData.is_kyc_verified ? (
                        <span className="profile-badge-item profile-badge-verified" title="KYC tasdiqlangan">
                          <CheckCircle size={14} />{t("profile.verified", "Tasdiqlangan")}
                        </span>
                      ) : userData.kyc_status === 'pending' ? (
                        <span className="profile-badge-item" style={{ background: 'rgba(234,179,8,0.12)', color: '#b45309', borderColor: 'rgba(234,179,8,0.3)', cursor: 'default' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginRight: 4 }} />
                          {t("profile.kycPending", "Tekshirilmoqda")}
                        </span>
                      ) : (
                        <button
                          className="profile-badge-item"
                          style={{ background: 'rgba(59,130,246,0.08)', color: '#2563eb', borderColor: 'rgba(59,130,246,0.25)', cursor: 'pointer', border: '1px solid', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
                          onClick={() => navigate('/kyc')}
                          title="Hisobingizni tasdiqlash uchun KYC o'ting"
                        >
                          <Shield size={13} /> {t("profile.kycVerify", "Tasdiqlash")}
                        </button>
                      )}
                    </div>

                  </div>

                  {/* BIO SECTION */}
                  <div id="my-profile-bio-section" className="profile-bio-section soft-fade-in stagger-2">
                    {editingSection === 'bio' ? (
                      <div className="inline-edit-container">
                        <textarea
                          className="inline-edit-textarea"
                          value={editFormData.bio}
                          onChange={(e) => handleEditInputChange('bio', e.target.value)}
                          rows={6}
                          placeholder={t("profile.bioPlaceholder", "Write about your professional experience, skills, and expertise...")}
                          disabled={isLoading}
                        />
                        <div className="inline-edit-actions">
                          <button className="btn-cancel-inline" onClick={handleSectionCancel}>{t("profile.cancel", "Cancel")}</button>
                          <button className="btn-save-inline" onClick={() => handleSectionSave('bio')}>
                            {isLoading ? <RefreshCw size={14} className="spinning" /> : <Save size={14} />}
                            {t("profile.save", "Save")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="section-edit-trigger bio-edit-trigger" onClick={() => handleSectionEdit('bio', { bio: userData.bio })}>
                        <div id="my-profile-bio-box" className="profile-bio-text">
                          {userData.bio || t("profile.noBio", "No bio provided. Click to add one.")}
                        </div>
                        <button className="edit-pencil-btn">
                          <Edit size={14} />
                        </button>
                      </div>
                    )}

                    
                    {/* META INFO */}
                    <div id="my-profile-meta-bar" className="profile-meta-row">
                      <span className="profile-meta-item">
                        <MapPin size={14} />
                        {userData.location}
                      </span>
                      <span className="profile-meta-item">
                        <Star size={14} fill="currentColor" />
                        {userData.rating} {t("profile.rating", "rating")}
                      </span>
                      {editingSection === 'rate' ? (
                        <div className="inline-edit-container meta-edit-inline">
                          <div className="rate-input-group">
                            <DollarSign size={14} />
                            <input 
                              type="number" 
                              value={editFormData.hourlyRate} 
                              onChange={(e) => handleEditInputChange('hourlyRate', e.target.value)}
                              className="inline-edit-input rate-input"
                            />
                            <span>/hr</span>
                          </div>
                          <div className="inline-edit-actions">
                            <button className="btn-cancel-inline" onClick={handleSectionCancel}>{t("profile.cancel", "Cancel")}</button>
                            <button className="btn-save-inline" onClick={() => handleSectionSave('rate')}>
                              {isLoading ? <RefreshCw size={14} className="spinning" /> : <Save size={14} />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="profile-meta-item section-edit-trigger" onClick={() => handleSectionEdit('rate', { hourlyRate: userData.hourlyRate })}>
                          <DollarSign size={14} />
                          ${userData.hourlyRate}/hr
                          <button className="edit-pencil-btn mini">
                            <Edit size={10} />
                          </button>
                        </span>
                      )}
                      <span className="profile-meta-item">
                        <Zap size={14} />
                        {userData.availability}
                      </span>
                    </div>

                  </div>
                  
                  {/* STATS */}
                  <div className="profile-stats soft-fade-in stagger-3">
                    <div className="stat-item">
                      <span className="stat-value"><Price amount={userData.totalEarned} currency="UZS" /></span>
                      <span className="stat-label">{t("profile.totalEarned", "Total Earned")}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{userData.jobsCompleted}</span>
                      <span className="stat-label">{t("profile.jobsCompleted", "Jobs Completed")}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{parseFloat(userData.rating || 0).toFixed(1)}</span>
                      <span className="stat-label">{t("profile.rating", "Reyting")}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{userData.activeProjects}</span>
                      <span className="stat-label">{t("profile.activeProjects", "Active Projects")}</span>
                    </div>
                  </div>

                  <div className="freelancer-section soft-fade-in stagger-4">
                    <div className="freelancer-section-header">
                      <div>
                        <h3 className="freelancer-section-title">
                          <Code size={18} />{t("profile.skillsExpertise", "Skills & Expertise")}
                        </h3>
                        <p className="freelancer-section-subtitle">{t("profile.skillsDesc", "Your professional capabilities")}</p>
                      </div>
                      <button className="edit-pencil-btn visible" onClick={() => handleSectionEdit('skills')}>
                        <Edit size={14} />
                      </button>
                    </div>

                    <div className="skills-grid">
                      {skills.length > 0 ? (
                        skills.map((skill, idx) => (
                          <div key={idx} className="skill-card-simple">
                            <span className="skill-name">{skill}</span>
                          </div>
                        ))
                      ) : (
                        <p className="no-data-text">{t("profile.noSkills", "No skills added yet.")}</p>
                      )}
                    </div>
                  </div>

                  {/* LANGUAGES SECTION */}
                  <div className="freelancer-section soft-fade-in stagger-4-5">
                    <div className="freelancer-section-header">
                      <div>
                        <h3 className="freelancer-section-title">
                          <Globe size={18} />{t("profile.languages", "Languages")}
                        </h3>
                        <p className="freelancer-section-subtitle">{t("profile.languagesDesc", "Select languages you can speak and write")}</p>
                      </div>
                      <button className="upw-cert-add-btn" onClick={openAddLanguage}>
                        <Plus size={14} />
                        {t("profile.addLanguage", "Add Language")}
                      </button>
                    </div>

                    <div className="portfolio-grid">
                      {userData.languages && userData.languages.length > 0 ? (
                        userData.languages.map((lang, idx) => (
                          <div key={idx} className="portfolio-card" style={{ padding: '20px', minHeight: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: isDark ? '#e0e0e0' : '#1f2937' }}>{lang.language}</h4>
                              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                                {lang.proficiency === 'Basic' ? t("profile.profBasic", "Basic") : 
                                 lang.proficiency === 'Conversational' ? t("profile.profConversational", "Conversational") : 
                                 lang.proficiency === 'Fluent' ? t("profile.profFluent", "Fluent") : 
                                 lang.proficiency === 'Native/Bilingual' ? t("profile.profNativeBilingual", "Native/Bilingual") : lang.proficiency}
                              </span>
                            </div>
                            <div className="cert-actions" style={{ position: 'relative', top: 0, right: 0, opacity: 1, background: 'transparent', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button className="upw-cert-btn-icon upw-cert-btn-edit" onClick={() => openEditLanguage(lang, idx)} title={t("profile.editLanguage", "Edit Language")}>
                                <Edit size={14} />
                              </button>
                              <button className="upw-cert-btn-icon upw-cert-btn-delete" onClick={() => handleDeleteLanguage(idx)} title={t("profile.deleteLanguage", "Delete")}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state-container" style={{ gridColumn: '1 / -1' }}>
                          <Globe size={40} className="empty-state-icon" />
                          <p className="empty-state-text">{t("profile.noLanguagesAdded", "No languages added yet")}</p>
                          <button className="btn-outline" onClick={openAddLanguage}>
                            <Plus size={14} />{t("profile.addLanguage", "Add Language")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* DOCUMENTS SECTION */}
                  <div className="freelancer-section soft-fade-in stagger-5">

                    <div className="freelancer-section-header">
                      <div>
                        <h3 className="freelancer-section-title">
                          <Package size={18} />{t("profile.documents", "Documents")}
                        </h3>
                        <p className="freelancer-section-subtitle">{t("profile.docsDesc", "Resume and professional documents")}</p>
                      </div>
                    </div>
                    <div className="quick-link-card" onClick={() => handleSectionChange('cv-upload', 'CV Upload')}>
                      <div className="quick-link-icon quick-link-cv">
                        <FileText size={24} />
                      </div>
                      <div className="quick-link-content">
                        <h4>{t("profile.resumeUploadTitle", "Resume / CV Upload")}</h4>
                        <p>{t("profile.resumeUploadDesc", "Upload and manage your professional CV")}</p>
                      </div>
                      <ExternalLink size={18} className="quick-link-arrow" />
                    </div>
                  </div>

                  <div className="freelancer-section soft-fade-in stagger-6">
                    <div className="freelancer-section-header">
                      <div>
                        <h3 className="freelancer-section-title">
                          <Award size={18} />{t("profile.certifications")}
                        </h3>
                        <p className="freelancer-section-subtitle">{t("profile.certificationsDesc")}</p>
                      </div>
                      <button className="upw-cert-add-btn" onClick={openAddCert} disabled={certLoading}>
                        <Plus size={15} /> {t("profile.addCertification")}
                      </button>
                    </div>

                    {certLoading && certificates.length === 0 ? (
                      <div className="upw-cert-loading">
                        <RefreshCw size={20} className="spinning" />
                        <span>{t("profile.certLoading")}</span>
                      </div>
                    ) : certificates.length === 0 ? (
                      <div className="upw-cert-empty">
                        <div className="upw-cert-empty-icon">
                          <Award size={32} />
                        </div>
                        <div className="upw-cert-empty-text">
                          <p className="upw-cert-empty-title">{t("profile.noCertificates")}</p>
                          <p className="upw-cert-empty-sub">{t("profile.noCertificatesDesc")}</p>
                        </div>
                        <button className="upw-cert-empty-btn" onClick={openAddCert}>
                          <Plus size={14} /> {t("profile.addCertification")}
                        </button>
                      </div>
                    ) : (
                      <div className="upw-cert-list">
                        {certificates.map((cert) => (
                          <div key={cert.id} className="upw-cert-card">
                            <div className="upw-cert-accent" />
                            <div className="upw-cert-card-icon">
                              <Award size={22} />
                            </div>
                            <div className="upw-cert-card-body">
                              <div className="upw-cert-card-top">
                                <div className="upw-cert-card-titles">
                                  <h4 className="upw-cert-title">{cert.title}</h4>
                                  {cert.issuer && (
                                    <p className="upw-cert-issuer">{cert.issuer}</p>
                                  )}
                                </div>
                                <div className="upw-cert-card-actions">
                                  <button
                                    className="upw-cert-btn-icon upw-cert-btn-edit"
                                    onClick={() => openEditCert(cert)}
                                    disabled={certLoading}
                                    title={t("profile.editCertification")}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    className="upw-cert-btn-icon upw-cert-btn-delete"
                                    onClick={() => handleDeleteCert(cert.id)}
                                    disabled={certLoading}
                                    title={t("profile.certCancel")}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              <div className="upw-cert-card-meta">
                                {(cert.issue_month || cert.issue_year) && (
                                  <span className="upw-cert-meta-tag">
                                    <Calendar size={12} />
                                    {cert.issue_month
                                      ? `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][cert.issue_month - 1]} ${cert.issue_year || ""}`
                                      : cert.issue_year}{" "}{t("profile.certIssued")}
                                  </span>
                                )}
                                {cert.credential_id && (
                                  <span className="upw-cert-meta-tag">
                                    <Shield size={12} />
                                    ID: {cert.credential_id}
                                  </span>
                                )}
                              </div>

                              {cert.credential_url && (
                                <a
                                  href={cert.credential_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="upw-cert-verify-link"
                                >
                                  <ExternalLink size={13} />
                                  {t("profile.showCredential")}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>



                  {/* CONTACT DETAILS */}
                  <div className="freelancer-section">
                    <div className="freelancer-section-header">
                      <h3 className="freelancer-section-title">
                        <Mail size={18} />{t("profile.contactDetails", "Contact Details")}
                      </h3>
                      {editingSection !== 'contact' && (
                        <button className="edit-pencil-btn visible" onClick={() => handleSectionEdit('contact', { email: userData.email, phone: userData.phone, location: userData.location })}>
                          <Edit size={14} />
                        </button>
                      )}
                    </div>

                    {editingSection === 'contact' ? (
                      <div className="inline-edit-container contact-edit-container">
                        <div className="details-grid editing">
                          <div className="form-group">
                            <label><Mail size={14} /> {t("profile.email", "Email")}</label>
                            <input type="email" value={editFormData.email} onChange={(e) => handleEditInputChange('email', e.target.value)} className="inline-edit-input" />
                          </div>
                          <div className="form-group">
                            <label><Phone size={14} /> {t("profile.phone", "Phone")}</label>
                            <input type="tel" value={editFormData.phone} onChange={(e) => handleEditInputChange('phone', e.target.value)} className="inline-edit-input" />
                          </div>
                          <div className="form-group">
                            <label><MapPin size={14} /> {t("profile.location", "Location")}</label>
                            <select 
                              value={editFormData.location} 
                              onChange={(e) => handleEditInputChange('location', e.target.value)} 
                              className="inline-edit-select"
                            >
                              <option value="">{t("profile.selectLocation", "Joylashuvni tanlang")}</option>
                              <option value="Uzbekistan">O'zbekiston</option>
                              <option value="Kazakhstan">Qozog'iston</option>
                              <option value="Kyrgyzstan">Qirg'iziston</option>
                              <option value="Tajikistan">Tojikiston</option>
                              <option value="Turkmenistan">Turkmaniston</option>
                              <option value="Russia">Rossiya</option>
                              <option value="Turkey">Turkiya</option>
                              <option value="UAE">BAA</option>
                              <option value="USA">AQSH</option>
                              <option value="Germany">Germaniya</option>
                              <option value="China">Xitoy</option>
                              <option value="United Kingdom">Buyuk Britaniya</option>
                              <option value="South Korea">Janubiy Koreya</option>
                              <option value="Japan">Yaponiya</option>
                            </select>
                          </div>
                        </div>
                        <div className="inline-edit-actions">
                          <button className="btn-cancel-inline" onClick={handleSectionCancel}>{t("profile.cancel", "Cancel")}</button>
                          <button className="btn-save-inline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSectionSave('contact'); }}>
                            {isLoading ? <RefreshCw size={14} className="spinning" /> : <Save size={14} />}
                            {t("profile.save", "Save")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-icon"><Mail size={16} /></span>
                          <div className="detail-content">
                            <span className="detail-label">{t("profile.email", "Email")}</span>
                            <div className="detail-value-wrapper">
                              <span className="detail-value">{userData.email}</span>
                              <span className="verified-tag">{t("profile.verified", "Verified")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon"><Phone size={16} /></span>
                          <div className="detail-content">
                            <span className="detail-label">{t("profile.phone", "Phone")}</span>
                            <span className="detail-value">{userData.phone}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon"><MapPin size={16} /></span>
                          <div className="detail-content">
                            <span className="detail-label">{t("profile.location", "Location")}</span>
                            <span className="detail-value">{userData.location}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>


                </div>
              </div>
            </div>
          )}
          {/* CV UPLOAD SECTION */}
          {activeSection === "cv-upload" && (
            <div className="content-section">
              <div className="section-header">
                <div className="header-left">
                  <h1 className="section-title">{t("profile.documentsPortfolio", "Documents & Portfolio")}</h1>
                  <span className="section-badge">
                    <FileText size={14} />{t("profile.professionalMaterials", "Professional Materials")}
                  </span>
                </div>
              </div>

              <div className="cv-section-card">
                {/* PORTFOLIO */}
                  <div className="portfolio-premium-section">
                    <div className="portfolio-premium-header">
                      <div className="portfolio-header-content">
                        <div className="portfolio-header-icon">
                          <Briefcase size={22} />
                        </div>
                        <div>
                          <h2>{t("profile.portfolioProjects", "Portfolio Projects")}</h2>
                          <p>{t("profile.portfolioDesc2", "Showcase your best work with project images and descriptions")}</p>
                        </div>
                      </div>
                      <button className="btn-add-premium" onClick={openAddPortfolio} disabled={isLoading}>
                        <Plus size={18} /> {t("profile.addProject", "Add Project")}
                      </button>
                    </div>

                    {portfolio.length === 0 ? (
                      <div className="portfolio-empty-state">
                        <div className="empty-state-icon-box">
                          <Briefcase size={48} />
                        </div>
                        <h3>{t("profile.noPortfolioItems", "No portfolio items yet")}</h3>
                        <p>{t("profile.noPortfolioHint", "Click \"Add Project\" to showcase your work")}</p>
                        <button className="btn-outline-premium" onClick={openAddPortfolio}>
                          <Plus size={16} /> {t("profile.addProject", "Add Project")}
                        </button>
                      </div>
                    ) : (
                      <div className="up-portfolio-grid">
                        {portfolio.map(item => (
                          <div key={item.id} className="up-portfolio-card" onClick={() => openEditPortfolio(item)}>
                            <div className="up-card-cover">
                              <img 
                                src={item.media && item.media.length > 0 ? avatarSrc(item.media[0].url) : "https://via.placeholder.com/600x400?text=No+Media"} 
                                alt={item.title} 
                              />
                              <div className="up-card-actions" onClick={(e) => e.stopPropagation()}>
                                <button className="up-action-btn" onClick={() => openEditPortfolio(item)} title={t("profile.edit", "Edit")}>
                                  <Edit size={14} />
                                </button>
                                <button className="up-action-btn" onClick={() => handleDeletePortfolio(item.id)} title={t("profile.delete", "Delete")}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="up-card-type-icon">
                                <ImageIcon size={16} />
                              </div>
                            </div>
                            <div className="up-card-content">
                              <h3 className="up-card-title">{item.title}</h3>
                              {item.role && <p className="up-card-role">{item.role}</p>}
                              
                              <div className="up-card-skills">
                                {item.skills && item.skills.slice(0, 3).map((skill, sIdx) => (
                                  <span key={sIdx} className="up-mini-skill">{skill}</span>
                                ))}
                                {item.skills && item.skills.length > 3 && (
                                  <span className="up-mini-skill">+{item.skills.length - 3}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                <div className="cv-divider">
                  <span>{t("profile.resumeCV", "Resume / CV")}</span>
                </div>

                {/* CV UPLOAD */}
                <div className="cv-upload-area">
                  <div className="cv-section-title-bar">
                    <div>
                      <h2 className="cv-section-main-title">
                        <FileText size={20} />{userData.cv_url ? t("profile.updateResume", "Update Your Resume") : t("profile.uploadResume", "Upload Your Resume")}
                      </h2>
                      <p className="cv-section-desc">{t("profile.shareCV", "Share your professional CV with potential clients")}</p>
                    </div>
                  </div>

                  {!userData.cv_url ? (
                    <div className="cv-upload-zone" onClick={() => document.getElementById('cv-file-input').click()}>
                      <Upload size={48} />
                      <h3>{t("profile.uploadResumeHere", "Upload Your Resume")}</h3>
                      <p>{t("profile.dragDropCV", "Drag and drop your CV here, or click to browse")}</p>
                      <p className="cv-upload-hint">{t("profile.cvFormats", "Supported formats: PDF, DOCX (Max 5MB)")}</p>
                      <input 
                        type="file" 
                        id="cv-file-input" 
                        style={{ display: 'none' }} 
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvUpload}
                      />
                      <button className="btn-primary" disabled={isLoading}>
                        <Upload size={16} />{t("profile.browseFiles", "Browse Files")}
                      </button>
                    </div>
                  ) : (
                    <div className="cv-current-file">
                      <div className="cv-file-header">
                        <h3>{t("profile.currentResume", "Current Resume")}</h3>
                        <button className="btn-outline btn-small" onClick={() => document.getElementById('cv-file-input').click()} disabled={isLoading}>
                          <RefreshCw size={14} /> {t("profile.replace", "Replace")}
                        </button>
                        <input 
                          type="file" 
                          id="cv-file-input" 
                          style={{ display: 'none' }} 
                          accept=".pdf,.doc,.docx"
                          onChange={handleCvUpload}
                        />
                      </div>
                      <div className="cv-file-item">
                        <div className="cv-file-icon">
                          <FileText size={32} />
                        </div>
                        <div className="cv-file-info">
                          <h4>{userData.cv_url.split('/').pop() || "Your_Resume.pdf"}</h4>
                          <p>{t("profile.readyToShare", "Ready to share with clients")}</p>
                          <div className="cv-file-meta">
                            <span className="cv-file-status cv-file-verified">
                              <CheckCircle size={14} />{t("profile.professional", "Professional")}
                            </span>
                          </div>
                        </div>
                        <div className="cv-file-actions">
                          <a 
                            href={userData.cv_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-secondary"
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            <Eye size={14} />{t("profile.viewCV", "View")}
                          </a>
                          <button className="btn-outline" onClick={handleDeleteCv} disabled={isLoading}>
                            <Trash2 size={14} />{t("profile.deleteCV", "Delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                <div className="cv-tips-card">
                  <div className="cv-tips-header">
                    <Info size={20} />
                    <h4>{t("profile.resumeTips", "Resume Tips")}</h4>
                  </div>
                  <ul className="cv-tips-list">
                    <li>{t("profile.cvTip1", "Keep your resume concise - 1-2 pages maximum")}</li>
                    <li>{t("profile.cvTip2", "Highlight relevant skills and achievements")}</li>
                    <li>{t("profile.cvTip3", "Use keywords from job descriptions")}</li>
                    <li>{t("profile.cvTip4", "Update regularly with new projects and skills")}</li>
                    <li>{t("profile.cvTip5", "Proofread carefully for errors")}</li>
                  </ul>
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
                    <Shield size={14} />Security Overview
                  </span>
                </div>
              </div>

              {/* Change Password Card */}
              <div className="password-card">
                <div className="password-card-header">
                  <div className="password-card-icon">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3>{t("profile.security.changePassword")}</h3>
                    <p>{t("profile.security.passwordHint")}</p>
                  </div>
                </div>
                <div className="password-form">
                  <div className="form-group">
                    <label>{t("profile.security.currentPassword")}</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        placeholder={t("profile.security.passwordPlaceholder")}
                        className="form-input"
                        value={passwordForm.current}
                        onChange={(e) => handlePasswordChange("current", e.target.value)}
                        disabled={isLoading}
                      />
                      <button className="password-toggle" onClick={() => togglePasswordVisibility("current")} type="button" disabled={isLoading}>
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="fr-sec-forgot-link-wrapper">
                      <button 
                        type="button" 
                        onClick={handleOpenForgotModal}
                        className="fr-sec-forgot-btn"
                      >
                        Parolni unutdingizmi?
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t("profile.security.newPassword")}</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        placeholder={t("profile.security.newPasswordPlaceholder")}
                        className="form-input"
                        value={passwordForm.new}
                        onChange={(e) => handlePasswordChange("new", e.target.value)}
                        disabled={isLoading}
                      />
                      <button className="password-toggle" onClick={() => togglePasswordVisibility("new")} type="button" disabled={isLoading}>
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordForm.new && (
                      <div className="password-strength">
                        <div className="password-strength-bar">
                          <div
                            className="password-strength-fill"
                            style={{ width: `${(passwordStrength / 6) * 100}%`, background: getPasswordStrengthColor() }}
                          ></div>
                        </div>
                        <span className="password-strength-text" style={{ color: getPasswordStrengthColor() }}>
                          {getPasswordStrengthText()} {t("profile.security.strength", "strength")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="password-requirements-grid">
                    <div className="password-req-item">
                      {passwordValidations.minLength ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>{t("profile.security.requirements.length")}</span>
                    </div>
                    <div className="password-req-item">
                      {passwordValidations.uppercase ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>{t("profile.security.requirements.uppercase")}</span>
                    </div>
                    <div className="password-req-item">
                      {passwordValidations.lowercase ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>{t("profile.security.requirements.lowercase")}</span>
                    </div>
                    <div className="password-req-item">
                      {passwordValidations.number ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>{t("profile.security.requirements.number")}</span>
                    </div>
                    <div className="password-req-item">
                      {passwordValidations.special ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>{t("profile.security.requirements.special")}</span>
                    </div>
                    <div className="password-req-item">
                      {passwordValidations.match ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>{t("profile.security.requirements.match")}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t("profile.security.confirmPassword")}</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder={t("profile.security.confirmPasswordPlaceholder")}
                        className="form-input"
                        value={passwordForm.confirm}
                        onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                        disabled={isLoading}
                      />
                      <button className="password-toggle" onClick={() => togglePasswordVisibility("confirm")} type="button" disabled={isLoading}>
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button className="btn-primary" onClick={handlePasswordSubmit} disabled={isLoading}>
                    {isLoading ? <><RefreshCw size={16} className="spinning" /> {t("profile.security.updating")}</> : <><Save size={16} />{t("profile.security.updatePassword")}</>}
                  </button>
                </div>
              </div>

              {/* Security Options Grid */}
              <div className="security-options-grid">
                {/* Two-Factor Authentication */}
                <div className="security-option-card">
                  <div className="security-option-header">
                    <div className="security-option-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                      <Fingerprint size={20} style={{ color: 'var(--blue)' }} />
                    </div>
                    <div className="security-option-content">
                      <h4>{t("profile.security.twoStep")}</h4>
                      <p>{t("profile.security.twoStepDesc")}</p>
                    </div>
                  </div>
                  <div className="security-option-control">
                    <span className={`toggle-label ${securityToggles.twoFactor ? 'enabled' : 'disabled'}`}>
                      {securityToggles.twoFactor ? t("profile.security.enabled") : t("profile.security.disabled")}
                    </span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={securityToggles.twoFactor}
                        onChange={() => toggleSecurity("twoFactor")}
                        disabled={isLoading}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Login Notifications */}
                <div className="security-option-card">
                  <div className="security-option-header">
                    <div className="security-option-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <Bell size={20} style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="security-option-content">
                      <h4>{t("profile.security.loginNotify")}</h4>
                      <p>{t("profile.security.loginNotifyDesc")}</p>
                    </div>
                  </div>
                  <div className="security-option-control">
                    <span className={`toggle-label ${securityToggles.loginNotifications ? 'enabled' : 'disabled'}`}>
                      {securityToggles.loginNotifications ? t("profile.security.enabled") : t("profile.security.disabled")}
                    </span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={securityToggles.loginNotifications}
                        onChange={() => toggleSecurity("loginNotifications")}
                        disabled={isLoading}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Device Management */}
                <div className="security-option-card">
                  <div className="security-option-header">
                    <div className="security-option-icon" style={{ background: 'rgba(147, 51, 234, 0.15)' }}>
                      <Smartphone size={20} style={{ color: '#8b5cf6' }} />
                    </div>
                    <div className="security-option-content">
                      <h4>{t("profile.security.deviceManagement")}</h4>
                      <p>{t("profile.security.deviceManagementDesc")}</p>
                    </div>
                  </div>
                  <div className="security-option-control">
                    <span className={`toggle-label ${securityToggles.deviceManagement ? 'enabled' : 'disabled'}`}>
                      {securityToggles.deviceManagement ? t("profile.security.enabled") : t("profile.security.disabled")}
                    </span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={securityToggles.deviceManagement}
                        onChange={() => toggleSecurity("deviceManagement")}
                        disabled={isLoading}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Password Expiry */}
                <div className="security-option-card">
                  <div className="security-option-header">
                    <div className="security-option-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                      <Clock size={20} style={{ color: 'var(--warning)' }} />
                    </div>
                    <div className="security-option-content">
                      <h4>{t("profile.security.passwordExpiry")}</h4>
                      <p>{t("profile.security.passwordExpiryDesc")}</p>
                    </div>
                  </div>
                  <div className="security-option-control">
                    <span className={`toggle-label ${securityToggles.passwordExpiry ? 'enabled' : 'disabled'}`}>
                      {securityToggles.passwordExpiry ? t("profile.security.enabled") : t("profile.security.disabled")}
                    </span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={securityToggles.passwordExpiry}
                        onChange={() => toggleSecurity("passwordExpiry")}
                        disabled={isLoading}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Security Tip */}
              <div className="security-tip-card">
                <AlertTriangle size={20} />
                <div>
                  <h4>Security Tip</h4>
                  <p>Enable two-factor authentication to add an extra layer of security to your account.</p>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="password-card">
                <div className="password-card-header">
                  <div>
                    <h3>{t("profile.security.activeSessions", "Faol seanslar")}</h3>
                    <p>{t("profile.security.deviceManagementDesc", "Siz tizimga kirgan barcha faol qurilmalar ro'yxati")}</p>
                  </div>
                  <button 
                    className="btn-outline" 
                    onClick={fetchSessions} 
                    disabled={sessionsLoading}
                  >
                    <RefreshCw size={14} className={sessionsLoading ? "spinning" : ""} />
                    {sessionsLoading ? t("common.loading", "Yuklanmoqda...") : t("profile.security.refresh", "Yangilash")}
                  </button>
                </div>
                
                <div className="sessions-list">
                  {sessions.length === 0 && !sessionsLoading && (
                    <p style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
                      {t("profile.security.noSessions", "Faol seanslar topilmadi.")}
                    </p>
                  )}
                  
                  {sessions.map((session) => {
                    const ua = parseUA(session.user_agent);
                    const isCurrent = session.token === localStorage.getItem("refreshToken"); // Approximate check
                    
                    return (
                      <div className="active-session-item" key={session.id}>
                        <div className="session-device-info">
                          {ua.device === "mobile" ? <Smartphone size={18} /> : <Laptop size={18} />}
                          <div>
                            <h4>{ua.browser} on {ua.os}</h4>
                            <p>
                              {session.ip_address || "Noma'lum IP"} • 
                              {t("profile.security.lastActive", "Oxirgi faollik")}: {new Date(session.last_active).toLocaleString('uz-UZ', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="session-actions">
                          {isCurrent ? (
                            <span className="current-badge">{t("profile.security.currentSession", "Joriy")}</span>
                          ) : (
                            <button 
                              className="fr-sec-revoke-btn" 
                              onClick={() => handleRevokeSession(session.id)}
                              disabled={isLoading}
                            >
                              {t("profile.security.revokeAccess", "Kirishni bekor qilish")}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                    <CreditCard size={14} />Payment Methods
                  </span>
                </div>
              </div>

              <div className="placeholder-card">
                <CreditCard size={64} />
                <h2>Billing & Payments</h2>
                <p>Payment methods, transaction history, and invoices management.</p>
                <p style={{ fontSize: '13px', marginTop: '12px', color: 'var(--light-text-tertiary)' }}>
                  This section is under development and will be available soon.
                </p>
              </div>
            </div>
          )}

          {/* MEMBERSHIP SECTION */}
          {activeSection === "membership" && (
            <div className="content-section">
              <div className="section-header">
                <div className="header-left">
                  <h1 className="section-title">Membership</h1>
                  <span className="section-badge">
                    <Award size={14} />Current: {userData.membership}
                  </span>
                </div>
              </div>

              {/* Current Membership Card */}
              <div className="membership-current-card">
                <div className="membership-current-header">
                  <div className="membership-current-icon">
                    {currentPlan.icon}
                  </div>
                  <div className="membership-current-info">
                    <h2>{t("profile.upgrade.currentPlan", { plan: t("clientProfile.membership." + currentPlan.id) })}</h2>
                    <p className="membership-status">{userData.membershipStatus}</p>
                    <div className="membership-dates">
                      <span>{t("profile.upgrade.started")}: {userData.membershipStartDate}</span>
                      <span>{t("profile.upgrade.nextBilling")}: {userData.membershipNextBilling}</span>
                    </div>
                  </div>
                  {currentPlan.id !== "basic" && (
                    <button 
                      className="btn-outline" 
                      onClick={handleCancelMembership}
                      disabled={isLoading}
                    >
                      {t("profile.upgrade.cancelMembership")}
                    </button>
                  )}
                </div>

                <div className="membership-features-list">
                  <h3>{t("profile.upgrade.benefits")}:</h3>
                  <div className="features-grid">
                    {currentPlan.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <CheckCircle size={16} className="feature-check" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="billing-cycle-toggle">
                <span className={billingCycle === "monthly" ? "active" : ""} onClick={() => setBillingCycle("monthly")}>
                  {t("profile.upgrade.monthly")}
                </span>
                <span className={billingCycle === "yearly" ? "active" : ""} onClick={() => setBillingCycle("yearly")}>
                  {t("profile.upgrade.yearly")} <span className="save-badge">{t("profile.upgrade.save17")}</span>
                </span>
              </div>

              {/* Available Plans */}
              <div className="membership-plans-grid">
                {membershipPlans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className={`membership-plan-card ${plan.popular ? 'popular' : ''} ${plan.current ? 'current' : ''}`}
                    style={{ borderColor: plan.color }}
                  >
                    {plan.popular && <div className="popular-badge">{t("profile.upgrade.mostPopular")}</div>}
                    <div className="plan-header" style={{ color: plan.color }}>
                      <div className="plan-icon">{plan.icon}</div>
                      <h3>{t("clientProfile.membership." + plan.id)}</h3>
                    </div>
                    
                    <div className="plan-price">
                      {plan.price[billingCycle] === 0 ? (
                        <span className="price-free">{t("profile.upgrade.free")}</span>
                      ) : (
                        <>
                          <span className="price">${plan.price[billingCycle]}</span>
                          <span className="period">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                        </>
                      )}
                    </div>

                    <div className="plan-features">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="plan-feature">
                          <Check size={14} className="feature-icon" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="plan-feature limitation">
                          <X size={14} className="feature-icon" />
                          <span>{limitation}</span>
                        </div>
                      ))}
                    </div>

                    {plan.current ? (
                      <button className="btn-outline" disabled>
                        {t("profile.upgrade.currentPlanShort")}
                      </button>
                    ) : (
                      <button 
                        className={`btn-${plan.id === "basic" ? "outline" : "primary"}`}
                        onClick={() => handleUpgradeClick(plan.id)}
                        disabled={isLoading}
                      >
                        {plan.price[billingCycle] === 0 ? t("profile.upgrade.downgrade") : t("profile.upgrade.upgrade")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SECTION (SETTINGS) */}
          {activeSection === "notifications" && (
            <div className="content-section profile-notifications">
              <div className="section-header">
                <div className="header-left">
                  <h1 className="section-title">{t("profile.notifications.title")}</h1>
                </div>
              </div>

              <div className="notifications-grid">
                {notificationSettings.map((category, idx) => (
                  <div key={category.category} className="notification-card">
                    <div className="category-header">
                      <Bell size={18} className="category-icon" />
                      <h3>{t(category.category)}</h3>
                    </div>
                    <div className="settings-list">
                      {category.settings.map(setting => (
                        <div key={setting.id} className="setting-item">
                          <div className="setting-info">
                            <h4>{t(setting.label)}</h4>
                            <p>{t(setting.description)}</p>
                          </div>
                          <label className="uzwork-switch">
                            <input 
                              type="checkbox" 
                              checked={setting.enabled} 
                              onChange={() => handleToggleNotification(idx, setting.id)}
                            />
                            <span className="uzwork-slider"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="delivery-preferences">
                <h2 className="delivery-title">{t("profile.notifications.deliveryPreferences")}</h2>
                <div className="delivery-options">
                  <label className="delivery-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={deliveryPrefs.email} 
                      onChange={() => handleToggleDeliveryPref('email')} 
                      className="delivery-checkbox"
                    />
                    <span className="checkbox-custom"></span>
                    <span className="delivery-label-text">{t("profile.notifications.email")}</span>
                  </label>
                  <label className="delivery-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={deliveryPrefs.push} 
                      onChange={() => handleToggleDeliveryPref('push')} 
                      className="delivery-checkbox"
                    />
                    <span className="checkbox-custom"></span>
                    <span className="delivery-label-text">{t("profile.notifications.push")}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ALL NOTIFICATIONS SECTION (HISTORY) */}
          {activeSection === "all-notifications" && (
            <div className="content-section profile-all-notifications">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="header-left">
                  <h1 className="section-title">{t('notifications.allNotifications')}</h1>
                </div>
                {allNotifications.some(n => !n.is_read) && (
                  <button 
                    onClick={handleMarkAllRead}
                    style={{ background: 'none', border: 'none', color: 'var(--blue, #3b82f6)', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle size={16} />
                    {t('notifications.markAllRead')}
                  </button>
                )}
              </div>

              <div className="notifications-list-container">
                {notifLoading ? (
                  <div className="notif-loading-state">{t('notifications.loading')}</div>
                ) : allNotifications.length > 0 ? (
                  <div className="notif-history-list">
                    {allNotifications.map((n, idx) => {
                      const { icon, color, bg } = getNotifIcon(n.type);

                      // Smart body with data field fallback
                      let d = {};
                      try { d = typeof n.data === 'string' ? JSON.parse(n.data || '{}') : (n.data || {}); } catch {}
                      const clientName = d.clientName || d.client_name || n.sender_name || n.senderName;
                      const jobTitle   = d.jobTitle   || d.job_title;

                      const getBody = () => {
                        const lang = i18n.language;
                        if (n.type === 'job_invitation') {
                          if (clientName && jobTitle) {
                            if (lang === 'ru') return `${clientName} пригласил вас в проект "${jobTitle}".`;
                            if (lang === 'en') return `${clientName} invited you to the project "${jobTitle}".`;
                            return `${clientName} sizni "${jobTitle}" loyihasiga taklif qildi.`;
                          }
                          if (jobTitle) {
                            if (lang === 'ru') return `Вы получили приглашение в проект "${jobTitle}".`;
                            if (lang === 'en') return `You have been invited to the project "${jobTitle}".`;
                            return `"${jobTitle}" loyihasiga taklif qabul qildingiz.`;
                          }
                        }
                        if (n.type === 'proposal_accepted' && jobTitle) {
                          if (lang === 'ru') return `Ваше предложение по проекту "${jobTitle}" было принято.`;
                          if (lang === 'en') return `Your proposal for "${jobTitle}" has been accepted.`;
                          return `"${jobTitle}" loyihasiga taklifingiz qabul qilindi.`;
                        }
                        if (n.type === 'proposal_rejected' && jobTitle) {
                          if (lang === 'ru') return `Ваше предложение по проекту "${jobTitle}" было отклонено.`;
                          if (lang === 'en') return `Your proposal for "${jobTitle}" has been rejected.`;
                          return `"${jobTitle}" loyihasiga taklifingiz rad etildi.`;
                        }
                        if (n.type === 'new_job_posted' && jobTitle) {
                          if (lang === 'ru') return `Размещена новая вакансия по вашим навыкам: "${jobTitle}"`;
                          if (lang === 'en') return `A new job matching your skills: "${jobTitle}"`;
                          return `Ko'nikmalaringizga mos yangi loyiha: "${jobTitle}"`;
                        }
                        return lang === 'en' && n.body_en ? n.body_en
                             : lang === 'ru' && n.body_ru ? n.body_ru
                             : n.message || '';
                      };

                      return (
                        <div 
                          key={n.id} 
                          className={`notif-history-item ${!n.is_read ? 'unread' : ''}`}
                          onClick={() => !n.is_read && handleMarkNotifRead(n.id)}
                        >
                          <div className="notif-history-icon" style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: bg,
                            color: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {icon}
                          </div>
                          <div className="notif-history-content">
                            <div className="notif-history-header">
                              <h4>
                                {i18n.language === 'en' && n.title_en ? n.title_en : 
                                 i18n.language === 'ru' && n.title_ru ? n.title_ru : 
                                 n.title || t(`notifications.types.${n.type}`, { defaultValue: t('notifications.title') })}
                              </h4>
                              <span className="notif-history-time">
                                {new Date(n.created_at).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US')} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p>{getBody()}</p>
                          </div>
                          {!n.is_read && (
                            <div className="unread-status-dot"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="notif-empty-state">
                    <Bell size={48} />
                    <p>{t('notifications.empty')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* APPEALS SECTION */}
          {activeSection === "appeals" && (
            <div className="content-section">
              <div className="section-header">
                <div className="header-left">
                  <h1 className="section-title">Appeals Tracker</h1>
                  <span className="section-badge">
                    <AlertTriangle size={14} />Support Requests
                  </span>
                </div>
              </div>

              <div className="placeholder-card">
                <AlertTriangle size={64} />
                <h2>{t("profile.appeals.title")}</h2>
                <p>{t("profile.appeals.desc")}</p>
                <p style={{ fontSize: '13px', marginTop: '12px', color: 'var(--light-text-tertiary)' }}>
                  {t("profile.appeals.underDevelopment")}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && selectedPlanForModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("profile.upgrade.title", { plan: selectedPlanForModal.name })}</h2>
              <button className="modal-close" onClick={() => setShowUpgradeModal(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="upgrade-summary">
                <div className="plan-comparison">
                  <div className="current-plan">
                    <h4>{t("profile.upgrade.current")}</h4>
                    <p className="plan-name">{currentPlan.name}</p>
                    <p className="plan-price">
                      {currentPlan.price[billingCycle] === 0 ? "Free" : `$${currentPlan.price[billingCycle]}/${billingCycle === "monthly" ? "mo" : "yr"}`}
                    </p>
                  </div>
                  <div className="upgrade-arrow">
                    <ChevronRight size={24} />
                  </div>
                  <div className="new-plan">
                    <h4>{t("profile.upgrade.new")}</h4>
                    <p className="plan-name">{selectedPlanForModal.name}</p>
                    <p className="plan-price">
                      ${selectedPlanForModal.price[billingCycle]}/{billingCycle === "monthly" ? "mo" : "yr"}
                    </p>
                  </div>
                </div>

                <div className="upgrade-benefits">
                  <h4>{t("profile.upgrade.benefits")}</h4>
                  <ul>
                    {selectedPlanForModal.features
                      .filter(feature => !currentPlan.features.includes(feature))
                      .slice(0, 5)
                      .map((feature, index) => (
                        <li key={index}>
                          <CheckCircle size={16} className="benefit-icon" />
                          {feature}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="upgrade-total">
                <div className="total-row">
                  <span>{t("profile.upgrade.subtotal")}</span>
                  <span>${selectedPlanForModal.price[billingCycle]}</span>
                </div>
                <div className="total-row">
                  <span>{t("profile.upgrade.tax")}</span>
                  <span>$0.00</span>
                </div>
                <div className="total-row final">
                  <span>{t("profile.upgrade.total")}</span>
                  <span>${selectedPlanForModal.price[billingCycle]}</span>
                </div>
              </div>

              <div className="upgrade-note">
                <Info size={16} />
                <p>{t("profile.upgrade.note")}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowUpgradeModal(false)} disabled={isLoading}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpgradeConfirm} disabled={isLoading}>
                {isLoading ? <><RefreshCw size={16} className="spinning" /> {t("profile.upgrade.processing")}</> : t("profile.upgrade.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTFOLIO MODAL - UPWORK REDESIGN */}
      {showPortfolioModal && (
        <div className="portfolio-modal-overlay" onClick={() => !isLoading && setShowPortfolioModal(false)}>
          <div className="portfolio-upwork-modal" onClick={(e) => e.stopPropagation()}>
            <div className="up-modal-header">
              <h2>{editingPortfolio ? t("profile.editProject", "Edit portfolio project") : t("profile.addProject", "Add a new portfolio project")}</h2>
              <p className="up-modal-sub">{t("profile.allFieldsRequired", "All fields are required unless otherwise indicated.")}</p>
              <button className="up-modal-close" onClick={() => setShowPortfolioModal(false)} disabled={isLoading}>
                <X size={24} />
              </button>
            </div>

            <div className="up-modal-body">
              <div className="up-form-group">
                <label>{t("profile.projectTitle", "Project title")} <span className="req">*</span></label>
                <input
                  type="text"
                  className="up-input"
                  placeholder={t("profile.enterTitle", "Enter a brief but descriptive title.")}
                  value={portfolioForm.title}
                  onChange={(e) => handlePortfolioInputChange("title", e.target.value.slice(0, 70))}
                  disabled={isLoading}
                />
                <div className="up-field-count">{70 - (portfolioForm.title?.length || 0)} {t("profile.charsLeft", "characters left")}</div>
              </div>

              <div className="up-form-row">
                <div className="up-form-group half">
                  <label>{t("profile.yourRole", "Your role")} <span className="optional">(optional)</span></label>
                  <input
                    type="text"
                    className="up-input"
                    placeholder={t("profile.rolePlaceholder", "e.g., Front-end engineer or Marketing analyst")}
                    value={portfolioForm.role || ""}
                    onChange={(e) => handlePortfolioInputChange("role", e.target.value.slice(0, 100))}
                    disabled={isLoading}
                  />
                  <div className="up-field-count">{100 - (portfolioForm.role?.length || 0)} {t("profile.charsLeft", "characters left")}</div>
                </div>

                <div className="up-form-group half">
                  <label>{t("profile.projectUrl", "Project URL")} <span className="optional">(optional)</span></label>
                  <input
                    type="url"
                    className="up-input"
                    placeholder="https://example.com"
                    value={portfolioForm.url || ""}
                    onChange={(e) => handlePortfolioInputChange("url", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="up-form-group">
                <label>{t("profile.projectDesc", "Project description")} <span className="req">*</span></label>
                <textarea
                  className="up-textarea"
                  rows={4}
                  placeholder={t("profile.descPlaceholder", "Briefly describe the project's goals, your solution and the impact you made here.")}
                  value={portfolioForm.description}
                  onChange={(e) => handlePortfolioInputChange("description", e.target.value.slice(0, 600))}
                  disabled={isLoading}
                />
                <div className="up-field-count">{600 - (portfolioForm.description?.length || 0)} {t("profile.charsLeft", "characters left")}</div>
              </div>

              <div className="up-form-group">
                <label>{t("profile.skillsDeliverables", "Skills and deliverables")} <span className="req">*</span></label>
                <div className="up-skill-input-box">
                  <div className="up-skills-selection">
                    {portfolioForm.skills.map((skill, idx) => (
                      <span key={idx} className="up-skill-tag">
                        {skill}
                        <button onClick={() => setPortfolioForm(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                    <input
                      type="text"
                      className="up-skill-ghost-input"
                      placeholder={t("profile.typeToAddSkill", "Type to add skills relevant to this project")}
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      disabled={isLoading || portfolioForm.skills.length >= 10}
                    />
                  </div>

                  {portSkillSuggestions.length > 0 && (
                    <div className="up-skill-suggestions-container">
                      <div className="up-skill-suggestions">
                        {portSkillSuggestions.map((suggestion, idx) => (
                          <div 
                            key={idx} 
                            className="up-suggestion-item"
                            onClick={() => {
                              if (portfolioForm.skills.length < 10) {
                                handlePortfolioInputChange("skills", [...portfolioForm.skills, suggestion]);
                                setNewSkillInput("");
                                setPortSkillSuggestions([]);
                              }
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="up-field-count">{10 - portfolioForm.skills.length} {t("profile.skillsLeft", "skills left")}</div>
                </div>

              <div className="up-form-group">
                <label>{t("profile.projectMedia", "Project Media")}</label>
                <div className="up-media-dropzone" onClick={() => document.getElementById('up-portfolio-files').click()}>
                  <input
                    type="file"
                    id="up-portfolio-files"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handlePortfolioFileSelect}
                    style={{ display: 'none' }}
                    disabled={isLoading}
                  />
                  <div className="up-media-icons">
                    <div className="up-media-circle"><ImageIcon size={24} /></div>
                    <div className="up-media-circle"><Video size={24} /></div>
                    <div className="up-media-circle text">T</div>
                    <div className="up-media-circle"><Link2 size={24} /></div>
                    <div className="up-media-circle"><FileText size={24} /></div>
                    <div className="up-media-circle"><Music size={24} /></div>
                  </div>
                  <p className="up-media-add-text">{t("profile.addPortfolioContent", "Add content")}</p>
                </div>

                {/* Media Previews */}
                {(portfolioForm.media.length > 0 || portfolioForm.files.length > 0) && (
                  <div className="up-media-previews">
                    {portfolioForm.media.map((med) => (
                      <div key={med.id} className="up-preview-item">
                        {med.media_type === 'image' ? (
                          <img src={avatarSrc(med.url)} alt="existing" />
                        ) : (
                          <div className="up-file-icon"><FileText size={32} /></div>
                        )}
                        <button className="up-remove-media" onClick={() => handleRemoveExistingMedia(med.id)} disabled={isLoading}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {portfolioForm.files.map((file, idx) => (
                      <div key={`new-${idx}`} className="up-preview-item new">
                        {file.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(file)} alt="new" />
                        ) : (
                          <div className="up-file-icon"><FileText size={32} /></div>
                        )}
                        <div className="up-new-label">New</div>
                        <button className="up-remove-media" onClick={() => handleRemovePortfolioFile(idx)} disabled={isLoading}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="up-modal-footer">
              <button className="up-btn-link" onClick={() => setShowPortfolioModal(false)} disabled={isLoading}>
                {t("profile.saveAsDraft", "Save as draft")}
              </button>
              <button className="up-btn-primary" onClick={handleSavePortfolio} disabled={isLoading}>
                {isLoading ? <RefreshCw size={18} className="spinning" /> : t("profile.nextPreview", "Next: Preview")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CERTIFICATION MODAL (Upwork Style) ===== */}
      {showCertModal && (
        <div className="modal-overlay" onClick={() => !certLoading && setShowCertModal(false)}>
          <div className="upw-cert-modal" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="upw-cert-modal-header">
              <div className="upw-cert-modal-header-left">
                <div className="upw-cert-modal-icon">
                  <Award size={20} />
                </div>
                <div>
                  <h2>{editingCert ? t("profile.editCertification") : t("profile.addCertificationTitle")}</h2>
                  <p>{t("profile.certSubtitle")}</p>
                </div>
              </div>
              <button className="upw-cert-modal-close" onClick={() => setShowCertModal(false)} disabled={certLoading}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="upw-cert-modal-body">

              {/* Certification name */}
              <div className="upw-cert-field">
                <label>
                  {t("profile.certNameLabel")} <span className="upw-cert-required">{t("profile.certRequired")}</span>
                </label>
                <input
                  type="text"
                  className="upw-cert-input"
                  placeholder={t("profile.certNamePlaceholder")}
                  value={certForm.title}
                  onChange={(e) => setCertForm(p => ({ ...p, title: e.target.value }))}
                  disabled={certLoading}
                  autoFocus
                />
              </div>

              {/* Issuing organization */}
              <div className="upw-cert-field">
                <label>{t("profile.certIssuerLabel")}</label>
                <input
                  type="text"
                  className="upw-cert-input"
                  placeholder={t("profile.certIssuerPlaceholder")}
                  value={certForm.issuer}
                  onChange={(e) => setCertForm(p => ({ ...p, issuer: e.target.value }))}
                  disabled={certLoading}
                />
              </div>

              {/* Issue date */}
              <div className="upw-cert-field">
                <label>{t("profile.certIssueDateLabel")} <span className="upw-cert-optional">{t("profile.certOptional")}</span></label>
                <div className="upw-cert-date-row">
                  <select
                    className="upw-cert-input upw-cert-select"
                    value={certForm.issue_month}
                    onChange={(e) => setCertForm(p => ({ ...p, issue_month: e.target.value }))}
                    disabled={certLoading}
                  >
                    <option value="">{t("profile.certMonth")}</option>
                    {["January","February","March","April","May","June",
                      "July","August","September","October","November","December"].map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="upw-cert-input upw-cert-year"
                    placeholder={t("profile.certYear")}
                    min="1990"
                    max={new Date().getFullYear()}
                    value={certForm.issue_year}
                    onChange={(e) => setCertForm(p => ({ ...p, issue_year: e.target.value }))}
                    disabled={certLoading}
                  />
                </div>
              </div>

              {/* Credential ID */}
              <div className="upw-cert-field">
                <label>{t("profile.certIdLabel")} <span className="upw-cert-optional">{t("profile.certOptional")}</span></label>
                <input
                  type="text"
                  className="upw-cert-input"
                  placeholder={t("profile.certIdPlaceholder")}
                  value={certForm.credential_id}
                  onChange={(e) => setCertForm(p => ({ ...p, credential_id: e.target.value }))}
                  disabled={certLoading}
                />
              </div>

              {/* Credential URL */}
              <div className="upw-cert-field">
                <label>{t("profile.certUrlLabel")} <span className="upw-cert-optional">{t("profile.certOptional")}</span></label>
                <div className="upw-cert-url-wrapper">
                  <Globe size={15} className="upw-cert-url-icon" />
                  <input
                    type="url"
                    className="upw-cert-input upw-cert-input-url"
                    placeholder={t("profile.certUrlPlaceholder")}
                    value={certForm.credential_url}
                    onChange={(e) => setCertForm(p => ({ ...p, credential_url: e.target.value }))}
                    disabled={certLoading}
                  />
                </div>
                <p className="upw-cert-hint">
                  <CheckCircle size={12} /> {t("profile.certUrlHint")}
                </p>
              </div>

              {/* Info banner */}
              <div className="upw-cert-info-banner">
                <Info size={14} />
                <span>
                  {t("profile.certPdfHint")} <strong>{t("profile.certPdfHint2")}</strong> {t("profile.certPdfHint3")}
                </span>
              </div>

            </div>

            {/* Footer */}
            <div className="upw-cert-modal-footer">
              <button
                className="upw-cert-modal-cancel"
                onClick={() => setShowCertModal(false)}
                disabled={certLoading}
              >
                {t("profile.certCancel")}
              </button>
              <button
                className="upw-cert-modal-save"
                onClick={handleSaveCert}
                disabled={certLoading || !certForm.title.trim()}
              >
                {certLoading && <RefreshCw size={15} className="spinning" />}
                {editingCert ? t("profile.certSaveChanges") : t("profile.addCertification")}
              </button>
            </div>
          </div>
        </div>
      )}


      {showSkillsModal && (
        <div className="modal-overlay" onClick={() => setShowSkillsModal(false)}>
          <div className="modal-content skills-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("profile.editSkills", "Edit skills")}</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowSkillsModal(false)}
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>{t("profile.yourSkills", "Your skills")}</label>
                <div className="skills-tag-input-container">
                  <div className="skills-tags-wrap">
                    {tempSkills.map((skill, idx) => (
                      <span key={idx} className="skill-tag-editable">
                        {skill}
                        <button 
                          onClick={() => setTempSkills(tempSkills.filter(s => s !== skill))}
                          disabled={isLoading}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="tag-input-bare"
                      placeholder={t("profile.searchSkills", "Search skills")}
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setActiveSuggestion(prev => Math.min(prev + 1, skillSuggestions.length - 1));
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setActiveSuggestion(prev => Math.max(prev - 1, 0));
                        } else if (e.key === "Enter") {
                          e.preventDefault();
                          if (skillSuggestions.length > 0) {
                            handleAddSkillFromList(skillSuggestions[activeSuggestion]);
                          }
                        }
                      }}
                      disabled={isLoading}
                    />

                    {skillSearch && (
                      <button 
                        className="clear-search-btn" 
                        onClick={() => {
                          setSkillSearch("");
                          setSkillSuggestions([]);
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}

                    {skillSuggestions.length > 0 && (

                      <div className="skills-suggestions-list">
                        {skillSuggestions.map((suggestion, index) => (
                          <div
                            key={suggestion}
                            className={`suggestion-item ${index === activeSuggestion ? "active" : ""}`}
                            onClick={() => handleAddSkillFromList(suggestion)}
                            onMouseEnter={() => setActiveSuggestion(index)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <span className="skills-count-hint">
                {t("profile.maxSkillsHint", "Maximum 20 skills.")}
              </span>
              <div className="modal-footer-btns">
                <button 
                  className="btn-cancel-flat" 
                  onClick={() => setShowSkillsModal(false)}
                  disabled={isLoading}
                >
                  {t("profile.cancel", "Cancel")}
                </button>
                <button 
                  className="btn-save-premium" 
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const res = await updateMyProfile({ skills: tempSkills });
                      if (!res.success) throw new Error(res.message);
                      setSkills(tempSkills);
                      setShowSkillsModal(false);
                      showMessage("success", t("profile.skillsUpdated", "Skills updated successfully!"));
                    } catch (err) {
                      showMessage("error", err.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? <RefreshCw size={16} className="spinning" /> : t("profile.save", "Save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showLanguageModal && (
        <div className="modal-overlay" onClick={() => setShowLanguageModal(false)}>
          <div className="modal-content skills-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLangIdx !== null ? t("profile.editLanguage", "Edit Language") : t("profile.addLanguage", "Add Language")}</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowLanguageModal(false)}
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: isDark ? '#e0e0e0' : '#4b5563', fontSize: '14px', fontWeight: '500' }}>
                  {t("profile.language", "Language")}
                </label>
                <select 
                  className="inline-edit-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`, background: isDark ? '#374151' : 'white', color: isDark ? '#f9fafb' : '#1f2937' }}
                  value={langForm.language}
                  onChange={(e) => setLangForm(p => ({ ...p, language: e.target.value }))}
                >
                  <option value="">{t("profile.chooseLanguage", "Choose Language")}</option>
                  <option value="English">English</option>
                  <option value="Uzbek">Uzbek</option>
                  <option value="Russian">Russian</option>
                  <option value="Turkish">Turkish</option>
                  <option value="Kazakh">Kazakh</option>
                  <option value="Tajik">Tajik</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Korean">Korean</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', color: isDark ? '#e0e0e0' : '#4b5563', fontSize: '14px', fontWeight: '500' }}>
                  {t("profile.languageLevel", "Proficiency Level")}
                </label>
                <select 
                  className="inline-edit-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`, background: isDark ? '#374151' : 'white', color: isDark ? '#f9fafb' : '#1f2937' }}
                  value={langForm.proficiency}
                  onChange={(e) => setLangForm(p => ({ ...p, proficiency: e.target.value }))}
                >
                  <option value="Basic">{t("profile.profBasic", "Basic")}</option>
                  <option value="Conversational">{t("profile.profConversational", "Conversational")}</option>
                  <option value="Fluent">{t("profile.profFluent", "Fluent")}</option>
                  <option value="Native/Bilingual">{t("profile.profNativeBilingual", "Native/Bilingual")}</option>
                </select>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <div className="modal-footer-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  className="btn-cancel-flat" 
                  onClick={() => setShowLanguageModal(false)}
                  disabled={isLoading}
                >
                  {t("profile.cancel", "Cancel")}
                </button>
                <button 
                  className="btn-save-premium" 
                  onClick={handleSaveLanguage}
                  disabled={isLoading}
                >
                  {isLoading ? <RefreshCw size={16} className="spinning" /> : t("profile.save", "Save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fr-sec-modal-overlay" onClick={() => !isLoading && setShow2FAModal(false)}>
          <div className="fr-sec-modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => !isLoading && setShow2FAModal(false)} className="fr-sec-close-btn" disabled={isLoading}>
              <X size={18} />
            </button>

            <div className="fr-sec-modal-header">
              <div className="fr-sec-modal-icon-wrapper">
                <ShieldCheck size={32} />
              </div>
              <h3>{faStep === "select" ? "Usulni tanlang" : "Kodni kiriting"}</h3>
            </div>

            <div className="fr-sec-modal-body">
              {faStep === "select" ? (
                <div className="fr-sec-2fa-selection">
                  <p className="fr-sec-2fa-info">Xavfsizlik kodini qayerga yuboraylik?</p>
                  <div className="fr-sec-method-options">
                    <div 
                      className={`fr-sec-method-card active`}
                    >
                      <div className="fr-sec-method-icon"><Mail size={24} /></div>
                      <div className="fr-sec-method-details">
                        <h4>Email manzil</h4>
                        <p>{userData.email}</p>
                      </div>
                      <div className="fr-sec-method-check"><CheckCircle size={20} /></div>
                    </div>
                  </div>
                  <button className="fr-sec-primary-btn" onClick={handleSend2FACode} disabled={isLoading}>
                    {isLoading ? <RefreshCw size={18} className="spinning" /> : <Shield size={18} />}
                    <span>{isLoading ? "Yuborilmoqda..." : "Davom etish"}</span>
                  </button>
                </div>
              ) : (
                <div className="fr-sec-2fa-verify">
                  <p className="fr-sec-2fa-info">Emailingizga yuborilgan 6 xonali kodni kiriting.</p>
                  <div className="fr-sec-otp-input-container">
                    <input 
                      type="text" 
                      maxLength="6"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="fr-sec-otp-input"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>
                  <button className="fr-sec-primary-btn" onClick={handleVerify2FA} disabled={isLoading || verificationCode.length !== 6}>
                    {isLoading ? <RefreshCw size={18} className="spinning" /> : <Check size={18} />}
                    <span>{isLoading ? "Tasdiqlanmoqda..." : "Tasdiqlash"}</span>
                  </button>
                  <button className="fr-sec-secondary-btn" onClick={() => setFaStep("select")} disabled={isLoading}>
                    Orqaga qaytish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fr-sec-modal-overlay" onClick={() => !isLoading && setShowForgotModal(false)}>
          <div className="fr-sec-modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => !isLoading && setShowForgotModal(false)} className="fr-sec-close-btn" disabled={isLoading}>
              <X size={18} />
            </button>

            <div className="fr-sec-modal-header">
              <div className="fr-sec-modal-icon-wrapper forgot-icon">
                <Key size={32} />
              </div>
              <h3>{forgotStep === "email" ? "Parolni tiklash" : "Yangi parol"}</h3>
            </div>

            <div className="fr-sec-modal-body">
              {forgotStep === "email" ? (
                <div className="fr-sec-forgot-email-step">
                  <p className="fr-sec-2fa-info">
                    Tasdiqlash kodini quyidagi pochtaga yuboramizmi?
                  </p>
                  <div className="fr-sec-input-group">
                    <input 
                      type="email" 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="fr-sec-premium-input"
                      placeholder="Email manzilingiz"
                      disabled={isLoading}
                    />
                  </div>
                  <button 
                    className="fr-sec-primary-btn" 
                    onClick={handleSendForgotCode}
                    disabled={isLoading || !forgotEmail}
                  >
                    {isLoading ? <RefreshCw size={18} className="spinning" /> : <Mail size={18} />}
                    <span>{isLoading ? "Yuborilmoqda..." : "Kodni yuborish"}</span>
                  </button>
                </div>
              ) : (
                <div className="fr-sec-forgot-reset-step">
                  <p className="fr-sec-2fa-info">
                    Emailingizga yuborilgan 6 xonali kodni va yangi parolni kiriting.
                  </p>
                  <div className="fr-sec-input-group">
                    <label className="fr-sec-input-label">Tasdiqlash kodi</label>
                    <input 
                      type="text" 
                      maxLength="6"
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      className="fr-sec-premium-input otp-input"
                      placeholder="000000"
                    />
                  </div>
                  <div className="fr-sec-input-group reset-pass-group">
                    <label className="fr-sec-input-label">Yangi parol</label>
                    <input 
                      type="password" 
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="fr-sec-premium-input"
                      placeholder="Kamida 8 ta belgi"
                    />
                  </div>
                  <button 
                    className="fr-sec-primary-btn" 
                    onClick={handleResetPassword}
                    disabled={isLoading || forgotCode.length !== 6 || forgotNewPassword.length < 8}
                  >
                    {isLoading ? <RefreshCw size={18} className="spinning" /> : <CheckCircle size={18} />}
                    <span>{isLoading ? "Saqlanmoqda..." : "Parolni yangilash"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* CONTACT CONFIRMATION MODAL */}
      {contactUpdatePending && (
        <div className="contact-confirm-modal-overlay" onClick={() => !isLoading && setContactUpdatePending(null)}>
          <div className="contact-confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-premium" onClick={() => setContactUpdatePending(null)} disabled={isLoading}>
              <X size={20} />
            </button>

            <div className="modal-header-premium">
              <div className="modal-icon-badge">
                <ShieldCheck size={32} />
              </div>
              <h2>{t("profile.contactUpdateConfirmTitle", "Tasdiqlash kerak")}</h2>
              <p>{t("profile.contactUpdateConfirmDesc", "Aloqa ma'lumotlarini o'zgartirish profilingiz xavfsizligiga ta'sir qilishi mumkin.")}</p>
            </div>
            
            <div className="modal-body-premium">
              <div className="comparison-stack">
                {/* Email Comparison */}
                <div className="comparison-item">
                  <span className="comp-label">{t("profile.email", "Email")}</span>
                  <div className="comp-values">
                    <span className="comp-old">{userData.email}</span>
                    <ArrowUpRight size={14} className="comp-arrow" />
                    <span className="comp-new">{contactUpdatePending?.email}</span>
                  </div>
                </div>

                {/* Phone Comparison */}
                <div className="comparison-item">
                  <span className="comp-label">{t("profile.phone", "Telefon")}</span>
                  <div className="comp-values">
                    <span className="comp-old">{userData.phone}</span>
                    <ArrowUpRight size={14} className="comp-arrow" />
                    <span className="comp-new">{contactUpdatePending?.phone}</span>
                  </div>
                </div>

                {/* Location Comparison */}
                <div className="comparison-item">
                  <span className="comp-label">{t("profile.location", "Joylashuv")}</span>
                  <div className="comp-values">
                    <span className="comp-old">{userData.location}</span>
                    <ArrowUpRight size={14} className="comp-arrow" />
                    <span className="comp-new">{contactUpdatePending?.location}</span>
                  </div>
                </div>
              </div>

              <div className="modal-notice-premium">
                <Info size={18} style={{ flexShrink: 0 }} />
                <p>{t("profile.contactUpdateNotice", "O'zgarishlar darhol barcha qurilmalarda kuchga kiradi.")}</p>
              </div>

              <div className="modal-actions-premium">
                <button className="btn-confirm-premium" onClick={confirmContactSave} disabled={isLoading}>
                  {isLoading ? <RefreshCw size={18} className="spinning" /> : <CheckCircle size={18} />}
                  <span>{t("profile.confirm", "Tasdiqlash va saqlash")}</span>
                </button>
                <button className="btn-cancel-premium" onClick={() => setContactUpdatePending(null)} disabled={isLoading}>
                  {t("profile.cancel", "Bekor qilish")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;