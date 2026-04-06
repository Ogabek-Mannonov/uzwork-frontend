import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  Gift
} from "lucide-react";
import "../profile/profile-css/profile.css";
import { getMyProfile, updateMyProfile, uploadFile, uploadImage } from "../../api/common";


import { logout } from "../../api/auth";
import { getMyPortfolio, createPortfolioItem, updatePortfolioItem, deletePortfolioItem, getMyCertifications, createCertification, updateCertification, deleteCertification } from "../../api/freelancer";
import { PROFESSIONAL_SKILLS } from "../../utils/skills";


import { useTranslation } from "react-i18next";
import { useThemeContext } from "../../pages/components/Theme/ThemeContext";

const MyProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark } = useThemeContext();

  // const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("my-info");
  // const [activeHeaderTab, setActiveHeaderTab] = useState("find");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // 'name', 'bio', 'rate', 'skills', 'contact'
  const [editFormData, setEditFormData] = useState({});


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
    images: [],
    skills: []
  });
  const [newSkillInput, setNewSkillInput] = useState("");
  
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
            coverPhoto: p.cover_url || "", // Added cover_url
          }));



          if (p.skills && Array.isArray(p.skills)) {
            setSkills(p.skills);
          } else {
            setSkills([]);
          }
        }

        const portRes = await getMyPortfolio();
        // [FIX]: Portfel ma'lumotlari to'g'ridan to'g'ri array emas, balki .data.items ni ichida keladi.
        if (portRes?.data?.items && Array.isArray(portRes.data.items)) {
          setPortfolio(portRes.data.items.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            url: p.project_url,
            images: p.media && p.media.length > 0 ? p.media.map(m => m.url) : [],
            skills: p.skills || [],
            created_at: p.created_at
          })));
        }

        // Sertifikatlarni backenddan olish
        const certRes = await getMyCertifications();
        console.log("[Cert FETCH] backend response:", certRes);
        // Backend response strukturasiga robust ishlov
        const certList = certRes?.data?.certifications || certRes?.data?.items || certRes?.data || certRes?.certifications;
        if (Array.isArray(certList)) {
          setCertificates(certList);
        }
      } catch (err) {
        console.error("fetchData error:", err);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const [userData, setUserData] = useState({
    id: "",
    name: "",
    fullName: "",

    username: "",
    email: "",
    phone: "",
    location: "",
    timezone: "GMT+5",
    language: "English (US)",
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

  const [portfolio, setPortfolio] = useState([
    {
      id: 1,
      title: "E-commerce Platform",
      description: "Full-stack marketplace with 50k+ active users",
      url: "https://example.com/ecommerce",
      images: ["https://images.unsplash.com/photo-1557821552-17105176677c?w=600"],
      skills: ["React", "Node.js", "PostgreSQL"],
      created_at: "2024-01-15"
    },
    {
      id: 2,
      title: "Real-time Analytics Dashboard",
      description: "Data visualization platform for enterprise clients",
      url: "https://example.com/analytics",
      images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600"],
      skills: ["Vue.js", "Python", "Redis"],
      created_at: "2024-02-10"
    },
    {
      id: 3,
      title: "Mobile Banking App",
      description: "Secure fintech solution with biometric auth",
      url: "https://example.com/banking",
      images: ["https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600"],
      skills: ["React Native", "Firebase"],
      created_at: "2024-03-05"
    }
  ]);

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
    setActiveSection(id);
    setShowMobileMenu(false);
    showMessage("info", `Opening ${label}...`);
  };

  const handleUserMenuClick = async (action) => {
    // setShowUserDropdown(false);
    if (action === "Sign Out") {
      setIsLoading(true);
      try {
        await logout();
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (portfolioForm.images.length + files.length <= 5) {
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPortfolioForm(prev => ({
            ...prev,
            images: [...prev.images, reader.result]
          }));
        };
        reader.readAsDataURL(file);
      });
    } else {
      showMessage("error", "Maximum 5 images allowed");
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setPortfolioForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove)
    }));
  };

  const openAddPortfolio = () => {
    setEditingPortfolio(null);
    setPortfolioForm({
      title: "",
      description: "",
      url: "",
      images: [],
      skills: []
    });
    setShowPortfolioModal(true);
  };

  const openEditPortfolio = (item) => {
    setEditingPortfolio(item);
    setPortfolioForm({
      title: item.title,
      description: item.description,
      url: item.url,
      images: [...item.images],
      skills: [...item.skills]
    });
    setShowPortfolioModal(true);
  };

  const handleSavePortfolio = async () => {
    if (!portfolioForm.title.trim() || !portfolioForm.url.trim()) {
      showMessage("error", "Title and URL are required");
      return;
    }

    setIsLoading(true);
    const payload = {
      title: portfolioForm.title,
      description: portfolioForm.description,
      project_url: portfolioForm.url,
      image_url: portfolioForm.images[0] || ""
    };

    try {
      if (editingPortfolio) {
        const res = await updatePortfolioItem(editingPortfolio.id, payload);
        if (res?.success === false) throw new Error(res.message);

        setPortfolio(prev => prev.map(item =>
          item.id === editingPortfolio.id
            ? { ...item, ...portfolioForm }
            : item
        ));
        showMessage("success", "Portfolio updated successfully");
      } else {
        const res = await createPortfolioItem(payload);
        if (res?.success === false) throw new Error(res.message);

        const newItem = {
          id: res?.data?.id || Date.now(),
          ...portfolioForm,
          created_at: new Date().toISOString().split('T')[0]
        };
        setPortfolio(prev => [...prev, newItem]);
        showMessage("success", "Portfolio added successfully");
      }
      setShowPortfolioModal(false);
    } catch (err) {
      showMessage("error", err.message || "Failed to save portfolio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      setIsLoading(true);
      try {
        const res = await deletePortfolioItem(id);
        if (res?.success === false) throw new Error(res.message);
        
        setPortfolio(prev => prev.filter(item => item.id !== id));
        showMessage("success", "Portfolio deleted successfully");
      } catch (err) {
        showMessage("error", err.message || "Failed to delete portfolio");
      } finally {
        setIsLoading(false);
      }
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
      showMessage("success", "CV uploaded successfully!");
    } catch (err) {
      showMessage("error", err.message || "Failed to upload CV");
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
      showMessage("success", "Profile picture updated successfully!");
    } catch (err) {
      showMessage("error", err.message || "Failed to update avatar");
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

  const toggleSecurity = (key) => {
    setSecurityToggles(prev => ({ ...prev, [key]: !prev[key] }));
    showMessage("success", `${key} ${!securityToggles[key] ? "enabled" : "disabled"}`);
  };

  const handlePasswordSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (Object.values(passwordValidations).every(Boolean)) {
        showMessage("success", "Password updated successfully!");
        setPasswordForm({ current: "", new: "", confirm: "" });
      } else {
        showMessage("error", "Please meet all password requirements");
      }
      setIsLoading(false);
    }, 1000);
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
    setIsLoading(true);
    try {
      let payload = {};
      
      switch(section) {
        case 'name':
          payload = {
            first_name: editFormData.fullName.split(' ')[0] || "",
            last_name: editFormData.fullName.split(' ').slice(1).join(' ') || "",
            title: editFormData.title
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
          break;
        case 'skills':
          payload = { skills: skills };
          break;
        default:
          payload = editFormData;
      }

      const res = await updateMyProfile(payload);
      if (res?.success === false) throw new Error(res.error || res.message);

      // Update local state
      setUserData(prev => ({ ...prev, ...editFormData }));
      setEditingSection(null);
      showMessage("success", `${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`);
    } catch (err) {
      showMessage("error", err.message || `Failed to update ${section}`);
    } finally {
      setIsLoading(false);
    }
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
    <div className={`settings-container ${isDark ? "dark" : "light"}`}>
      
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
                  <span className="user-status online"></span>
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
      <div className="settings-main">
        
        {/* SIDEBAR */}
        <aside className={`settings-sidebar ${showMobileMenu ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2>Settings</h2>
            <button className="close-sidebar" onClick={() => setShowMobileMenu(false)}>
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
                        className={`nav-link ${activeSection === item.id ? 'active' : ''}`} 
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
              <HelpCircle size={16} /> {t("profile.helpSupport", "Help & Support")}
            </button>
            <button className="sidebar-footer-btn" onClick={() => handleUserMenuClick("Sign Out")}>
              <LogOut size={16} /> {t("profile.signOut", "Sign Out")}
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="settings-content">
          
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
                  <h1 className="section-title">{t("profile.myInfo", "My Info")}</h1>
                  <span className="section-badge">
                    <User size={14} />{t("profile.professionalProfile", "Professional Profile")}
                  </span>
                </div>
                <a 
                  href={`/profile/${userData.id}`}
                  className="view-profile-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >

                  <Eye size={16} />{t("profile.viewPublicProfile", "View Public Profile")}
                </a>

              </div>
              
              <div className="profile-card soft-fade-in stagger-1">
                <div className="profile-cover">
                  <img src={userData.coverPhoto} alt="Cover" className="cover-image" />
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

                
                <div className="profile-content">
                  {/* Avatar va ism qismi */}
                  <div className="profile-avatar-section">
                    <div className="avatar-wrapper">
                      <img src={userData.profilePicture} alt="Profile" className="profile-avatar" />
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
                      <span className="avatar-status online" />
                    </div>

                    <div className="profile-name-section">
                      {editingSection === 'name' ? (
                        <div className="inline-edit-container">
                          <input 
                            type="text" 
                            value={editFormData.fullName} 
                            onChange={(e) => handleEditInputChange('fullName', e.target.value)} 
                            className="inline-edit-input name-edit-input" 
                            placeholder="Full Name"
                          />
                          <input 
                            type="text" 
                            value={editFormData.title} 
                            onChange={(e) => handleEditInputChange('title', e.target.value)} 
                            className="inline-edit-input" 
                            placeholder="Professional title" 
                          />
                          <div className="inline-edit-actions">
                            <button className="btn-cancel-inline" onClick={handleSectionCancel}>{t("profile.cancel", "Cancel")}</button>
                            <button className="btn-save-inline" onClick={() => handleSectionSave('name')}>
                              {isLoading ? <RefreshCw size={14} className="spinning" /> : <Save size={14} />}
                              {t("profile.save", "Save")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="section-edit-trigger" onClick={() => handleSectionEdit('name', { fullName: userData.fullName, title: userData.title })}>
                          <div>
                            <h2 className="profile-fullname">{userData.fullName}</h2>
                            <p className="profile-title">{userData.title || "Professional title"}</p>
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
                      <span className="profile-badge-item profile-badge-verified">
                        <CheckCircle size={14} />{t("profile.verified", "Verified")}
                      </span>
                    </div>
                  </div>

                  {/* BIO SECTION */}
                  <div className="profile-bio-section soft-fade-in stagger-2">
                    {editingSection === 'bio' ? (
                      <div className="inline-edit-container">
                        <textarea
                          className="inline-edit-textarea"
                          value={editFormData.bio}
                          onChange={(e) => handleEditInputChange('bio', e.target.value)}
                          rows={6}
                          placeholder="Write about your professional experience, skills, and expertise..."
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
                        <div className="profile-bio-text">
                          {userData.bio || t("profile.noBio", "No bio provided. Click to add one.")}
                        </div>
                        <button className="edit-pencil-btn">
                          <Edit size={14} />
                        </button>
                      </div>
                    )}

                    
                    {/* META INFO */}
                    <div className="profile-meta-row">
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
                      <span className="stat-value">${(userData.totalEarned / 1000).toFixed(1)}k</span>
                      <span className="stat-label">{t("profile.totalEarned", "Total Earned")}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{userData.jobsCompleted}</span>
                      <span className="stat-label">{t("profile.jobsCompleted", "Jobs Completed")}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{userData.successScore}%</span>
                      <span className="stat-label">{t("profile.successScore", "Success Score")}</span>
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
                        <button className="edit-pencil-btn visible" onClick={() => handleSectionEdit('contact', { email: userData.email, phone: userData.phone, location: userData.location, language: userData.language })}>
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
                            <input type="text" value={editFormData.location} onChange={(e) => handleEditInputChange('location', e.target.value)} className="inline-edit-input" />
                          </div>
                          <div className="form-group">
                            <label><Globe size={14} /> Language </label>
                            <input type="text" value={editFormData.language} onChange={(e) => handleEditInputChange('language', e.target.value)} className="inline-edit-input" />
                          </div>
                        </div>
                        <div className="inline-edit-actions">
                          <button className="btn-cancel-inline" onClick={handleSectionCancel}>{t("profile.cancel", "Cancel")}</button>
                          <button className="btn-save-inline" onClick={() => handleSectionSave('contact')}>
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
                        <div className="detail-item">
                          <span className="detail-icon"><Globe size={16} /></span>
                          <div className="detail-content">
                            <span className="detail-label">Language</span>
                            <span className="detail-value">{userData.language}</span>
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
                  <h1 className="section-title">Documents & Portfolio</h1>
                  <span className="section-badge">
                    <FileText size={14} />Professional Materials
                  </span>
                </div>
              </div>

              <div className="cv-section-card">
                {/* PORTFOLIO */}
                <div className="cv-upload-area">
                  <div className="cv-section-title-bar">
                    <div>
                      <h2 className="cv-section-main-title">
                        <Briefcase size={20} />Portfolio Projects
                      </h2>
                      <p className="cv-section-desc">Showcase your best work with project images and descriptions</p>

                    </div>
                    <button className="btn-primary" onClick={openAddPortfolio} disabled={isLoading}>
                      <Plus size={16} />Add Project
                    </button>
                  </div>

                  {portfolio.length === 0 ? (
                    <div className="empty-portfolio">
                      <Briefcase size={48} />
                      <h4>No portfolio items yet</h4>
                      <p>Click "Add Project" to showcase your work</p>
                    </div>
                  ) : (
                    <div className="portfolio-upload-grid">
                      {portfolio.map(item => (
                        <div key={item.id} className="portfolio-upload-item">
                          <div className="portfolio-upload-image">
                            <img src={item.images[0] || "https://via.placeholder.com/600x400?text=No+Image"} alt={item.title} />
                            <button className="portfolio-upload-edit" onClick={() => openEditPortfolio(item)} disabled={isLoading}>
                              <Edit size={14} />
                            </button>
                            <button className="portfolio-upload-delete" onClick={() => handleDeletePortfolio(item.id)} disabled={isLoading}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="portfolio-upload-info">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                            <div className="portfolio-upload-meta">
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="portfolio-url">
                                <ExternalLink size={12} />
                                {item.url.length > 30 ? item.url.substring(0, 30) + '...' : item.url}
                              </a>
                              <span className="portfolio-date">{item.created_at}</span>
                            </div>
                            <div className="portfolio-upload-tech">
                              {item.skills.map((skill, i) => <span key={i}>{skill}</span>)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="cv-divider">
                  <span>Resume / CV</span>
                </div>

                {/* CV UPLOAD */}
                <div className="cv-upload-area">
                  <div className="cv-section-title-bar">
                    <div>
                      <h2 className="cv-section-main-title">
                        <FileText size={20} />{userData.cv_url ? "Update Your Resume" : "Upload Your Resume"}
                      </h2>
                      <p className="cv-section-desc">Share your professional CV with potential clients</p>
                    </div>
                  </div>

                  {!userData.cv_url ? (
                    <div className="cv-upload-zone" onClick={() => document.getElementById('cv-file-input').click()}>
                      <Upload size={48} />
                      <h3>Upload Your Resume</h3>
                      <p>Drag and drop your CV here, or click to browse</p>
                      <p className="cv-upload-hint">Supported formats: PDF, DOCX (Max 5MB)</p>
                      <input 
                        type="file" 
                        id="cv-file-input" 
                        style={{ display: 'none' }} 
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvUpload}
                      />
                      <button className="btn-primary" disabled={isLoading}>
                        <Upload size={16} />Browse Files
                      </button>
                    </div>
                  ) : (
                    <div className="cv-current-file">
                      <div className="cv-file-header">
                        <h3>Current Resume</h3>
                        <button className="btn-outline btn-small" onClick={() => document.getElementById('cv-file-input').click()} disabled={isLoading}>
                          <RefreshCw size={14} /> Replace
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
                          <p>Ready to share with clients</p>
                          <div className="cv-file-meta">
                            <span className="cv-file-status cv-file-verified">
                              <CheckCircle size={14} />Professional
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
                            <Eye size={14} />View
                          </a>
                          <button className="btn-outline" onClick={handleDeleteCv} disabled={isLoading}>
                            <Trash2 size={14} />Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                <div className="cv-tips-card">
                  <div className="cv-tips-header">
                    <Info size={20} />
                    <h4>Resume Tips</h4>
                  </div>
                  <ul className="cv-tips-list">
                    <li>Keep your resume concise - 1-2 pages maximum</li>
                    <li>Highlight relevant skills and achievements</li>
                    <li>Use keywords from job descriptions</li>
                    <li>Update regularly with new projects and skills</li>
                    <li>Proofread carefully for errors</li>
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
                    <h3>Change Password</h3>
                    <p>Your password must be at least 8 characters and contain a mix of letters, numbers, and symbols</p>
                  </div>
                </div>
                <div className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        placeholder="Enter current password"
                        className="form-input"
                        value={passwordForm.current}
                        onChange={(e) => handlePasswordChange("current", e.target.value)}
                        disabled={isLoading}
                      />
                      <button className="password-toggle" onClick={() => togglePasswordVisibility("current")} type="button" disabled={isLoading}>
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        placeholder="Enter new password"
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
                          {getPasswordStrengthText()} strength
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="password-requirements-grid">
                    <div className="password-req-item">
                      {passwordValidations.minLength ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className="password-req-item">
                      {passwordValidations.uppercase ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>One uppercase letter</span>
                    </div>
                    <div className="password-req-item">
                      {passwordValidations.lowercase ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>One lowercase letter</span>
                    </div>
                    <div className="password-req-item">
                      {passwordValidations.number ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>One number</span>
                    </div>
                    <div className="password-req-item">
                      {passwordValidations.special ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>One special character</span>
                    </div>
                    <div className="password-req-item">
                      {passwordValidations.match ? <Check size={14} className="req-check" /> : <X size={14} className="req-uncheck" />}
                      <span>Passwords match</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder="Confirm new password"
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
                    {isLoading ? <><RefreshCw size={16} className="spinning" /> Updating...</> : <><Save size={16} />Update Password</>}
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
                      <h4>Two-factor authentication</h4>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <div className="security-option-control">
                    <span className={`toggle-label ${securityToggles.twoFactor ? 'enabled' : 'disabled'}`}>
                      {securityToggles.twoFactor ? "Enabled" : "Disabled"}
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
                  {!securityToggles.twoFactor && (
                    <button className="setup-btn" onClick={() => toggleSecurity("twoFactor")} disabled={isLoading}>
                      <Shield size={14} />Set up 2FA
                    </button>
                  )}
                </div>

                {/* Login Notifications */}
                <div className="security-option-card">
                  <div className="security-option-header">
                    <div className="security-option-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <Bell size={20} style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="security-option-content">
                      <h4>Login notifications</h4>
                      <p>Get notified via email whenever a new device logs into your account</p>
                    </div>
                  </div>
                  <div className="security-option-control">
                    <span className={`toggle-label ${securityToggles.loginNotifications ? 'enabled' : 'disabled'}`}>
                      {securityToggles.loginNotifications ? "Enabled" : "Disabled"}
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
                      <h4>Device management</h4>
                      <p>Manage and review devices that have access to your account</p>
                    </div>
                  </div>
                  <div className="security-option-control">
                    <span className={`toggle-label ${securityToggles.deviceManagement ? 'enabled' : 'disabled'}`}>
                      {securityToggles.deviceManagement ? "Enabled" : "Disabled"}
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
                      <h4>Password expiry</h4>
                      <p>Require password change every 90 days for enhanced security</p>
                    </div>
                  </div>
                  <div className="security-option-control">
                    <span className={`toggle-label ${securityToggles.passwordExpiry ? 'enabled' : 'disabled'}`}>
                      {securityToggles.passwordExpiry ? "Enabled" : "Disabled"}
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
                    <h3>Active Sessions</h3>
                    <p>MacBook Pro</p>
                  </div>
                  <button className="btn-outline" disabled={isLoading}>
                    <RefreshCw size={14} />Refresh
                  </button>
                </div>
                <div className="active-session-item">
                  <div className="session-device-info">
                    <Laptop size={18} />
                    <div>
                      <h4>Chrome 120.0 on macOS</h4>
                      <p>Tashkent, UZ • Last active: now</p>
                    </div>
                  </div>
                  <span className="current-badge">Current</span>
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
                    <h2>{currentPlan.name} Plan</h2>
                    <p className="membership-status">{userData.membershipStatus}</p>
                    <div className="membership-dates">
                      <span>Started: {userData.membershipStartDate}</span>
                      <span>Next billing: {userData.membershipNextBilling}</span>
                    </div>
                  </div>
                  {currentPlan.id !== "basic" && (
                    <button 
                      className="btn-outline" 
                      onClick={handleCancelMembership}
                      disabled={isLoading}
                    >
                      Cancel Membership
                    </button>
                  )}
                </div>

                <div className="membership-features-list">
                  <h3>Your benefits:</h3>
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
                  Monthly
                </span>
                <span className={billingCycle === "yearly" ? "active" : ""} onClick={() => setBillingCycle("yearly")}>
                  Yearly <span className="save-badge">Save 17%</span>
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
                    {plan.popular && <div className="popular-badge">Most Popular</div>}
                    <div className="plan-header" style={{ color: plan.color }}>
                      <div className="plan-icon">{plan.icon}</div>
                      <h3>{plan.name}</h3>
                    </div>
                    
                    <div className="plan-price">
                      {plan.price[billingCycle] === 0 ? (
                        <span className="price-free">Free</span>
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
                        Current Plan
                      </button>
                    ) : (
                      <button 
                        className={`btn-${plan.id === "basic" ? "outline" : "primary"}`}
                        onClick={() => handleUpgradeClick(plan.id)}
                        disabled={isLoading}
                      >
                        {plan.price[billingCycle] === 0 ? "Downgrade" : "Upgrade"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeSection === "notifications" && (
            <div className="content-section">
              <div className="section-header">
                <div className="header-left">
                  <h1 className="section-title">Notification Settings</h1>
                  <span className="section-badge">
                    <Bell size={14} />Manage Alerts
                  </span>
                </div>
              </div>

              <div className="placeholder-card">
                <Bell size={64} />
                <h2>Notification Settings</h2>
                <p>Customize email, push, and in-app notifications for jobs, messages, and updates.</p>
                <p style={{ fontSize: '13px', marginTop: '12px', color: 'var(--light-text-tertiary)' }}>
                  This section is under development and will be available soon.
                </p>
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
                <h2>Appeals Tracker</h2>
                <p>Track your support tickets, disputes, and account-related appeals.</p>
                <p style={{ fontSize: '13px', marginTop: '12px', color: 'var(--light-text-tertiary)' }}>
                  This section is under development and will be available soon.
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
              <h2>Upgrade to {selectedPlanForModal.name}</h2>
              <button className="modal-close" onClick={() => setShowUpgradeModal(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="upgrade-summary">
                <div className="plan-comparison">
                  <div className="current-plan">
                    <h4>Current Plan</h4>
                    <p className="plan-name">{currentPlan.name}</p>
                    <p className="plan-price">
                      {currentPlan.price[billingCycle] === 0 ? "Free" : `$${currentPlan.price[billingCycle]}/${billingCycle === "monthly" ? "mo" : "yr"}`}
                    </p>
                  </div>
                  <div className="upgrade-arrow">
                    <ChevronRight size={24} />
                  </div>
                  <div className="new-plan">
                    <h4>New Plan</h4>
                    <p className="plan-name">{selectedPlanForModal.name}</p>
                    <p className="plan-price">
                      ${selectedPlanForModal.price[billingCycle]}/{billingCycle === "monthly" ? "mo" : "yr"}
                    </p>
                  </div>
                </div>

                <div className="upgrade-benefits">
                  <h4>You'll get:</h4>
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
                  <span>Subtotal</span>
                  <span>${selectedPlanForModal.price[billingCycle]}</span>
                </div>
                <div className="total-row">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="total-row final">
                  <span>Total</span>
                  <span>${selectedPlanForModal.price[billingCycle]}</span>
                </div>
              </div>

              <div className="upgrade-note">
                <Info size={16} />
                <p>You will be charged immediately. Your billing cycle will reset today.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowUpgradeModal(false)} disabled={isLoading}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpgradeConfirm} disabled={isLoading}>
                {isLoading ? <><RefreshCw size={16} className="spinning" /> Processing...</> : `Confirm Upgrade`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTFOLIO MODAL */}
      {showPortfolioModal && (
        <div className="modal-overlay" onClick={() => setShowPortfolioModal(false)}>
          <div className="modal-content portfolio-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPortfolio ? "Edit Project" : "Add New Project"}</h2>
              <button className="modal-close" onClick={() => setShowPortfolioModal(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Title <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter project title"
                  value={portfolioForm.title}
                  onChange={(e) => handlePortfolioInputChange("title", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Describe your project..."
                  value={portfolioForm.description}
                  onChange={(e) => handlePortfolioInputChange("description", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label>Project URL <span className="required">*</span></label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com"
                  value={portfolioForm.url}
                  onChange={(e) => handlePortfolioInputChange("url", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label>Images <span className="optional">(0-5 images)</span></label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="portfolio-images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={isLoading}
                  />
                  <label htmlFor="portfolio-images" className="image-upload-btn" style={{ opacity: isLoading ? 0.6 : 1 }}>
                    <ImageIcon size={20} />
                    <span>Upload Images ({portfolioForm.images.length}/5)</span>
                  </label>
                </div>
                {portfolioForm.images.length > 0 && (
                  <div className="image-preview-grid">
                    {portfolioForm.images.map((img, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={img} alt={`Preview ${index + 1}`} />
                        <button
                          className="image-remove-btn"
                          onClick={() => handleRemoveImage(index)}
                          disabled={isLoading}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Skills/Technologies</label>
                <div className="skills-input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter skill and press Enter"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <button className="btn-secondary" onClick={handleAddSkill} type="button" disabled={isLoading}>
                    <Plus size={16} />Add
                  </button>
                </div>
                {portfolioForm.skills.length > 0 && (
                  <div className="skills-tags">
                    {portfolioForm.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} disabled={isLoading}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowPortfolioModal(false)} disabled={isLoading}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSavePortfolio} disabled={isLoading}>
                {isLoading ? <><RefreshCw size={16} className="spinning" /> Saving...</> : <><Save size={16} /> {editingPortfolio ? "Update Project" : "Add Project"}</>}
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
    </div>
  );
};

export default MyProfile;