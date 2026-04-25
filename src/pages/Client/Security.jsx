import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, Laptop, Smartphone as Mobile,
  Smartphone, Fingerprint, Bell, Clock, X, RefreshCw, LogOut
} from "lucide-react";
import { 
  enable2FA, confirm2FA, disable2FA, getSessions, revokeSession
} from "../../api/auth";
import "../Client/css/security.css";

const PasswordSecurity = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // ==================== STATE ====================
  const [isLoading, setIsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [securitySettings, setSecuritySettings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [faStep, setFaStep] = useState("select");
  const [selectedMethod, setSelectedMethod] = useState("email");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await getSessions();
      if (res.success) {
        setSessions(res.data || []);
      }
    } catch (err) {
      console.error("Sessions fetch error:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setSecuritySettings([
      {
        id: "2fa",
        label: t("profile.security.twoStep", "Ikki bosqichli tasdiqlash"),
        description: t("profile.security.twoStepDesc", "Hisobingizga qo'shimcha xavfsizlik qatlami qo'shing"),
        icon: <Smartphone size={20} />,
        enabled: user.two_factor_enabled || false,
        color: "#3b82f6"
      },
      {
        id: "biometric",
        label: t("profile.security.biometric", "Biometrik kirish"),
        description: t("profile.security.biometricDesc", "Kirish uchun barmoq izi yoki yuzni tanishdan foydalaning"),
        icon: <Fingerprint size={20} />,
        enabled: false,
        color: "#8b5cf6"
      },
      {
        id: "login_notifications",
        label: t("profile.security.loginNotify", "Kirish bildirishnomalari"),
        description: t("profile.security.loginNotifyDesc", "Hisobingizga yangi qurilma kirganda xabar oling"),
        icon: <Bell size={20} />,
        enabled: true,
        color: "#f59e0b"
      },
      {
        id: "session_timeout",
        label: t("profile.security.passwordExpiry", "Parolning amal qilish muddati"),
        description: t("profile.security.passwordExpiryDesc", "Xavfsizlik uchun parolni yangilab turing"),
        icon: <Clock size={20} />,
        enabled: true,
        color: "#10b981"
      }
    ]);
  }, [t]);

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm(t("profile.security.revokeConfirm", "Haqiqatan ham ushbu qurilmadan chiqmoqchimisiz?"))) return;
    
    setIsLoading(true);
    try {
      const res = await revokeSession(sessionId);
      if (res.success) {
        showSuccess(t("profile.security.revokeSuccess", "Sessiya muvaffaqiyatli o'chirildi."));
        fetchSessions();
      } else {
        showError(res.message);
      }
    } catch (err) {
      showError(t("common.error", "Xatolik yuz berdi"));
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (message) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const showError = (message) => {
    setToastMessage(message);
    setShowErrorToast(true);
    setTimeout(() => setShowErrorToast(false), 3000);
  };

  const handleOpen2FAModal = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.email && !user.phone) {
      showError(t("profile.security.contactRequired", "2FA ni yoqish uchun avval profilingizga email yoki telefon qo'shing."));
      return;
    }
    if (user.email) setSelectedMethod("email");
    else if (user.phone) setSelectedMethod("phone");
    
    setFaStep("select");
    setVerificationCode("");
    setShow2FAModal(true);
  };

  const toggleSecuritySetting = async (id) => {
    const setting = securitySettings.find(s => s.id === id);
    if (!setting) return;
    
    if (id === "2fa") {
      if (!setting.enabled) {
        handleOpen2FAModal();
      } else {
        setIsLoading(true);
        const res = await disable2FA();
        setIsLoading(false);
        if (res.success) {
          setSecuritySettings(prev => prev.map(s => s.id === "2fa" ? { ...s, enabled: false } : s));
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          user.two_factor_enabled = false;
          localStorage.setItem("user", JSON.stringify(user));
          showSuccess(t("profile.security.disabled", "Ikki bosqichli tasdiqlash o'chirildi."));
        } else {
          showError(res.message);
        }
      }
    } else {
      setSecuritySettings(prev => prev.map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ));
    }
  };

  const handleSend2FACode = async () => {
    setIsLoading(true);
    const res = await enable2FA({ method: selectedMethod });
    setIsLoading(false);
    if (res.success) {
      setFaStep("verify");
      showSuccess(t("auth.otpSentTitle", "Tasdiqlash kodi yuborildi."));
    } else {
      showError(res.message);
    }
  };

  const handleVerify2FA = async () => {
    if (verificationCode.length === 6) {
      setIsLoading(true);
      const res = await confirm2FA(verificationCode);
      setIsLoading(false);
      if (res.success) {
        setShow2FAModal(false);
        setSecuritySettings(prev => prev.map(setting =>
          setting.id === "2fa" ? { ...setting, enabled: true } : setting
        ));
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.two_factor_enabled = true;
        localStorage.setItem("user", JSON.stringify(user));
        setVerificationCode("");
        showSuccess(t("profile.security.twoFactor.success", "Ikki bosqichli tasdiqlash muvaffaqiyatli yoqildi!"));
      } else {
        showError(res.message);
      }
    } else {
      showError(t("auth.enter6DigitCode", "Iltimos, 6 xonali kodni kiriting"));
    }
  };

  const parseUA = (userAgent) => {
    if (!userAgent) return { browser: "Noma'lum", os: "Noma'lum", device: "desktop" };
    const ua = userAgent.toLowerCase();
    let browser = "Boshqa";
    let os = "Noma'lum";
    let device = "desktop";

    if (ua.includes("chrome")) browser = "Chrome";
    else if (ua.includes("safari")) browser = "Safari";
    else if (ua.includes("firefox")) browser = "Firefox";

    if (ua.includes("windows")) os = "Windows";
    else if (ua.includes("mac os")) os = "Mac OS";
    else if (ua.includes("android")) { os = "Android"; device = "mobile"; }
    else if (ua.includes("iphone") || ua.includes("ipad")) { os = "iOS"; device = "mobile"; }

    return { browser, os, device };
  };

  return (
    <div className="ps-page">
      <div className="ps-container">
        {/* Header */}
        <div className="ps-header">
          <button className="ps-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>{t("common.back", "Orqaga")}</span>
          </button>
          <div className="ps-header-info">
            <h1>{t("profile.security.title", "Parol va Xavfsizlik")}</h1>
            <p>{t("profile.security.overview", "Parolingizni va xavfsizlik sozlamalarini boshqaring")}</p>
          </div>
        </div>

        {/* Security Settings Section */}
        <div className="ps-settings-section">
          <h2 className="ps-section-subtitle">{t("profile.settings", "Xavfsizlik sozlamalari")}</h2>
          <div className="ps-settings-grid">
            {securitySettings.map(setting => (
              <div key={setting.id} className="ps-setting-card">
                <div className="ps-setting-header">
                  <div className="ps-setting-icon" style={{ color: setting.color }}>
                    {setting.icon}
                  </div>
                  <div className="ps-setting-info">
                    <h3>{setting.label}</h3>
                    <p>{setting.description}</p>
                  </div>
                </div>
                
                <div className="ps-setting-footer">
                  <div className="ps-setting-status">
                    <span className={`ps-status-badge ${setting.enabled ? "ps-enabled" : "ps-disabled"}`}>
                      {setting.enabled ? t("profile.security.enabled", "Yoqilgan") : t("profile.security.disabled", "O'chirilgan")}
                    </span>
                  </div>
                  <label className="ps-switch">
                    <input 
                      type="checkbox" 
                      checked={setting.enabled} 
                      onChange={() => toggleSecuritySetting(setting.id)} 
                    />
                    <span className="ps-slider"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="ps-sessions-card">
          <div className="ps-sessions-header">
            <h2>{t("profile.security.activeSessions", "Faol seanslar")}</h2>
            <button className="ps-refresh-btn" onClick={fetchSessions} disabled={sessionsLoading}>
              <RefreshCw size={16} className={sessionsLoading ? "spinning" : ""} />
            </button>
          </div>
          
          <div className="ps-sessions-list">
            {sessions.length === 0 && !sessionsLoading && (
              <p className="ps-no-sessions">{t("profile.security.noSessions", "Faol seanslar topilmadi.")}</p>
            )}
            
            {sessions.map(session => {
              const ua = parseUA(session.user_agent);
              const isCurrent = session.token === localStorage.getItem("refreshToken");
              return (
                <div key={session.id} className="ps-session-item">
                  <div className="ps-session-device">
                    {ua.device === "mobile" ? <Mobile size={20} /> : <Laptop size={20} />}
                    <div className="ps-device-info">
                      <h3>{ua.browser} on {ua.os}</h3>
                      <p>{session.ip_address || "Noma'lum IP"} • {t("profile.security.lastActive", "Oxirgi faollik")}: {new Date(session.last_active).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="ps-session-actions">
                    {isCurrent ? (
                      <span className="ps-current-badge">{t("profile.security.currentSession", "Joriy")}</span>
                    ) : (
                      <button className="ps-revoke-btn" onClick={() => handleRevokeSession(session.id)} disabled={isLoading}>
                        <LogOut size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="ps-modal-overlay">
            <div className="ps-modal-content">
              <div className="ps-modal-header">
                <h3>{faStep === "select" ? t("auth.chooseMethod", "Usulni tanlang") : t("auth.enterCode", "Kodni kiriting")}</h3>
                <button onClick={() => setShow2FAModal(false)} className="ps-close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="ps-modal-body">
                {faStep === "select" ? (
                  <div className="ps-2fa-selection">
                    <p>{t("auth.whereToSend", "Xavfsizlik kodini qayerga yuboraylik?")}</p>
                    <div className="ps-method-options">
                      <div 
                        className={`ps-method-option ${selectedMethod === "email" ? "active" : ""}`}
                        onClick={() => setSelectedMethod("email")}
                      >
                        <div className="ps-method-icon"><Bell size={20} /></div>
                        <div>
                          <strong>Email</strong>
                          <p>{t("auth.emailMethodDesc", "Elektron pochtangizga kod yuboriladi")}</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="ps-primary-btn" 
                      onClick={handleSend2FACode}
                      disabled={isLoading}
                    >
                      {isLoading ? t("common.loading", "Yuborilmoqda...") : t("auth.sendCode", "Kodni yuborish")}
                    </button>
                  </div>
                ) : (
                  <div className="ps-2fa-verify">
                    <div className="ps-2fa-info">
                      {t("auth.otpSentTitle", "Tasdiqlash kodi yuborildi.")}
                    </div>
                    <input 
                      type="text" 
                      placeholder="000000" 
                      maxLength="6"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="ps-code-input"
                    />
                    <button 
                      className="ps-primary-btn" 
                      onClick={handleVerify2FA}
                      disabled={isLoading || verificationCode.length !== 6}
                    >
                      {isLoading ? t("auth.verifying", "Tasdiqlanmoqda...") : t("auth.verify", "Tasdiqlash")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toasts */}
        {showSuccessToast && <div className="ps-success-toast">{toastMessage}</div>}
        {showErrorToast && <div className="ps-error-toast">{toastMessage}</div>}
      </div>
    </div>
  );
};

export default PasswordSecurity;