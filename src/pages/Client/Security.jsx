// src/pages/Client/PasswordSecurity.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Lock, Shield, Eye, EyeOff, Save,
  RefreshCw, CheckCircle, Smartphone, Fingerprint,
  Bell, AlertTriangle, Laptop, Tablet, Smartphone as Mobile,
  MapPin, Clock, LogOut, ShieldCheck, X, Copy,
  Key, UserCheck, Download
} from "lucide-react";
import "../Client/css/security.css";

const PasswordSecurity = () => {
  const navigate = useNavigate();
  
  // ==================== STATE ====================
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordHistory, setPasswordHistory] = useState([
    { id: 1, date: "2024-01-15", message: "Password changed successfully" },
    { id: 2, date: "2023-12-10", message: "Password changed successfully" },
    { id: 3, date: "2023-11-05", message: "Password changed successfully" }
  ]);

  const [securitySettings, setSecuritySettings] = useState([
    {
      id: "2fa",
      label: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      icon: <Smartphone size={20} />,
      enabled: false,
      color: "#3b82f6"
    },
    {
      id: "biometric",
      label: "Biometric Login",
      description: "Use fingerprint or face recognition to log in",
      icon: <Fingerprint size={20} />,
      enabled: false,
      color: "#8b5cf6"
    },
    {
      id: "login_notifications",
      label: "Login Notifications",
      description: "Get notified when a new device logs into your account",
      icon: <Bell size={20} />,
      enabled: true,
      color: "#f59e0b"
    },
    {
      id: "session_timeout",
      label: "Session Timeout",
      description: "Automatically log out after period of inactivity",
      icon: <Clock size={20} />,
      enabled: true,
      color: "#10b981"
    }
  ]);

  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: "Windows PC - Chrome",
      browser: "Chrome 120.0",
      os: "Windows 11",
      location: "Tashkent, Uzbekistan",
      ip: "192.168.1.1",
      lastActive: "Now",
      current: true,
      icon: <Laptop size={20} />
    },
    {
      id: 2,
      device: "iPhone 14 Pro",
      browser: "Safari 17.0",
      os: "iOS 17.2",
      location: "Tashkent, Uzbekistan",
      ip: "192.168.1.2",
      lastActive: "2 hours ago",
      current: false,
      icon: <Mobile size={20} />
    },
    {
      id: 3,
      device: "iPad Pro",
      browser: "Safari 17.0",
      os: "iPadOS 17.2",
      location: "Samarkand, Uzbekistan",
      ip: "192.168.1.3",
      lastActive: "1 day ago",
      current: false,
      icon: <Tablet size={20} />
    }
  ]);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showRevokeModal, setShowRevokeModal] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPasswordHistory, setShowPasswordHistory] = useState(false);

  // ==================== PASSWORD STRENGTH ====================
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { label: "Weak", color: "#ef4444", percentage: 33, message: "Your password is too weak" };
    if (score <= 4) return { label: "Medium", color: "#f59e0b", percentage: 66, message: "Your password could be stronger" };
    return { label: "Strong", color: "#3b82f6", percentage: 100, message: "Your password is strong" };
  };

  const passwordStrength = calculatePasswordStrength(passwordForm.newPassword);

  const passwordStrengthChecks = [
    { id: "length", label: "At least 8 characters" },
    { id: "uppercase", label: "At least one uppercase letter" },
    { id: "lowercase", label: "At least one lowercase letter" },
    { id: "number", label: "At least one number" },
    { id: "special", label: "At least one special character" }
  ];

  const passwordValidations = {
    length: passwordForm.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(passwordForm.newPassword),
    lowercase: /[a-z]/.test(passwordForm.newPassword),
    number: /[0-9]/.test(passwordForm.newPassword),
    special: /[^A-Za-z0-9]/.test(passwordForm.newPassword),
    match: passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword !== ""
  };

  // ==================== HANDLERS ====================
  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword) {
      showError("Please enter your current password");
      return;
    }
    
    if (!passwordForm.newPassword) {
      showError("Please enter a new password");
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      showError("New password must be different from current password");
      return;
    }
    
    if (!passwordValidations.length || !passwordValidations.uppercase || !passwordValidations.number || !passwordValidations.special) {
      showError("Please follow password requirements");
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const newHistory = {
        id: passwordHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        message: "Password changed successfully"
      };
      setPasswordHistory([newHistory, ...passwordHistory]);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsLoading(false);
      showSuccess("Password updated successfully!");
    }, 1500);
  };

  const toggleSecuritySetting = (id) => {
    const setting = securitySettings.find(s => s.id === id);
    
    if (id === "2fa" && !setting.enabled) {
      setShow2FAModal(true);
    } else {
      setSecuritySettings(prev => prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      ));
      showSuccess(`${setting.label} ${!setting.enabled ? "enabled" : "disabled"} successfully!`);
    }
  };

  const handleEnable2FA = () => {
    setShow2FAModal(true);
  };

  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      setShow2FAModal(false);
      setSecuritySettings(prev => prev.map(setting =>
        setting.id === "2fa" ? { ...setting, enabled: true } : setting
      ));
      setVerificationCode("");
      showSuccess("Two-Factor Authentication enabled successfully!");
    } else {
      showError("Please enter a valid 6-digit code");
    }
  };

  const handleRevokeSession = (sessionId) => {
    setShowRevokeModal(activeSessions.find(s => s.id === sessionId));
  };

  const confirmRevokeSession = () => {
    setActiveSessions(prev => prev.filter(session => session.id !== showRevokeModal.id));
    setShowRevokeModal(null);
    showSuccess("Session revoked successfully!");
  };

  const handleRefreshSessions = () => {
    showSuccess("Sessions refreshed!");
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess("Copied to clipboard!");
  };

  return (
    <div className="ps-page">
      <div className="ps-container">
        {/* Header */}
        <div className="ps-header">
          <button className="ps-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Orqaga</span>
          </button>
          <div className="ps-header-info">
            <h1>Parol va Xavfsizlik</h1>
            <p>Parolingizni va xavfsizlik sozlamalarini boshqaring</p>
          </div>
        </div>

        {/* Security Score Card */}
        <div className="ps-score-card">
          <div className="ps-score-header">
            <div className="ps-score-icon">
              <ShieldCheck size={32} />
            </div>
            <div className="ps-score-info">
              <h3>Xavfsizlik darajasi: <span className="ps-score-value">85%</span></h3>
              <p>Hisobingiz xavfsizlik holati</p>
            </div>
          </div>
          <div className="ps-score-progress">
            <div className="ps-score-fill" style={{ width: "85%" }}></div>
          </div>
          <div className="ps-score-items">
            <div className="ps-score-item ps-completed">
              <CheckCircle size={14} />
              <span>Parol kuchi: Yaxshi</span>
            </div>
            <div className="ps-score-item ps-completed">
              <CheckCircle size={14} />
              <span>Email tasdiqlangan</span>
            </div>
            <div className="ps-score-item ps-pending">
              <AlertTriangle size={14} />
              <span>2FA yoqilmagan</span>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="ps-password-card">
          <div className="ps-card-header">
            <div className="ps-header-icon"><Lock size={24} /></div>
            <div className="ps-header-info">
              <h2>Parolni o'zgartirish</h2>
              <p>Parolingiz kamida 8 belgidan iborat bo'lishi va harflar, raqamlar va belgilarni o'z ichiga olishi kerak</p>
            </div>
            <button 
              className="ps-history-btn"
              onClick={() => setShowPasswordHistory(!showPasswordHistory)}
            >
              <Clock size={16} />
              Tarix
            </button>
          </div>

          {/* Password History */}
          {showPasswordHistory && (
            <div className="ps-password-history">
              <h4>So'nggi parol o'zgarishlari</h4>
              <div className="ps-history-list">
                {passwordHistory.map(item => (
                  <div key={item.id} className="ps-history-item">
                    <CheckCircle size={14} className="ps-history-icon" />
                    <span>{item.message}</span>
                    <span className="ps-history-date">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="ps-password-form">
            <div className="ps-form-group">
              <label>Joriy parol</label>
              <div className="ps-password-input-wrapper">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  placeholder="Joriy parolingizni kiriting"
                  className="ps-password-input"
                  disabled={isLoading}
                />
                <button type="button" className="ps-toggle-password" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="ps-form-group">
              <label>Yangi parol</label>
              <div className="ps-password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  placeholder="Yangi parol kiriting"
                  className="ps-password-input"
                  disabled={isLoading}
                />
                <button type="button" className="ps-toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {passwordForm.newPassword && (
                <>
                  <div className="ps-password-strength">
                    <div className="ps-strength-meter">
                      <div className="ps-strength-fill" style={{ width: `${passwordStrength.percentage}%`, backgroundColor: passwordStrength.color }} />
                    </div>
                    <span className="ps-strength-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label} parol - {passwordStrength.message}
                    </span>
                  </div>

                  <div className="ps-password-requirements">
                    {passwordStrengthChecks.map(check => (
                      <div key={check.id} className={`ps-requirement ${passwordValidations[check.id] ? "ps-valid" : ""}`}>
                        {passwordValidations[check.id] ? <CheckCircle size={14} className="ps-valid-icon" /> : <div className="ps-dot" />}
                        <span>{check.label}</span>
                      </div>
                    ))}
                    <div className={`ps-requirement ${passwordValidations.match ? "ps-valid" : ""}`}>
                      {passwordValidations.match ? <CheckCircle size={14} className="ps-valid-icon" /> : <div className="ps-dot" />}
                      <span>Parollar mos keladi</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="ps-form-group">
              <label>Yangi parolni tasdiqlang</label>
              <div className="ps-password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  placeholder="Yangi parolni qayta kiriting"
                  className="ps-password-input"
                  disabled={isLoading}
                />
                <button type="button" className="ps-toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="ps-update-password-btn" disabled={isLoading}>
              {isLoading ? (
                <><RefreshCw size={18} className="ps-spinning" /> Yangilanmoqda...</>
              ) : (
                <><Save size={18} /> Parolni yangilash</>
              )}
            </button>
          </form>
        </div>

        {/* Security Settings Grid */}
        <div className="ps-settings-section">
          <h2 className="ps-section-subtitle">Xavfsizlik sozlamalari</h2>
          
          <div className="ps-settings-grid">
            {securitySettings.map(setting => (
              <div key={setting.id} className="ps-setting-card" style={{ borderColor: `${setting.color}30` }}>
                <div className="ps-setting-header">
                  <div className="ps-setting-icon" style={{ backgroundColor: `${setting.color}15`, color: setting.color }}>
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
                      {setting.enabled ? "Yoqilgan" : "O'chirilgan"}
                    </span>
                  </div>
                  <label className="ps-switch">
                    <input type="checkbox" checked={setting.enabled} onChange={() => toggleSecuritySetting(setting.id)} />
                    <span className="ps-slider"></span>
                  </label>
                </div>

                {setting.id === "2fa" && !setting.enabled && (
                  <button className="ps-enable-2fa-btn" onClick={handleEnable2FA}>
                    <Shield size={14} />
                    2FA ni sozlash
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Tip */}
        <div className="ps-tip-card">
          <AlertTriangle size={20} />
          <div className="ps-tip-content">
            <h4>Xavfsizlik maslahati</h4>
            <p>Hisobingizga qo'shimcha himoya qatlami qo'shish uchun ikki faktorli autentifikatsiyani yoqing.</p>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="ps-sessions-card">
          <div className="ps-sessions-header">
            <h2>Faol seanslar</h2>
            <button className="ps-refresh-sessions" onClick={handleRefreshSessions}>
              <RefreshCw size={16} />
              Yangilash
            </button>
          </div>

          <div className="ps-sessions-list">
            {activeSessions.map(session => (
              <div key={session.id} className={`ps-session-item ${session.current ? "ps-current" : ""}`}>
                <div className="ps-session-device">
                  <div className="ps-device-icon" style={{ backgroundColor: `${session.current ? "#3b82f6" : "#8b5cf6"}15`, color: session.current ? "#3b82f6" : "#8b5cf6" }}>
                    {session.icon}
                  </div>
                  <div className="ps-device-info">
                    <div className="ps-device-header">
                      <h3>{session.device}</h3>
                      {session.current && <span className="ps-current-badge">Hozirgi</span>}
                    </div>
                    <p className="ps-device-details">{session.browser} • {session.os}</p>
                    <p className="ps-device-location">
                      <MapPin size={12} /> {session.location} • {session.ip}
                    </p>
                    <span className="ps-last-active">
                      <Clock size={12} /> Oxirgi faollik: {session.lastActive}
                    </span>
                  </div>
                </div>
                
                {!session.current && (
                  <button className="ps-revoke-btn" onClick={() => handleRevokeSession(session.id)}>
                    <LogOut size={14} /> O'chirish
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="ps-sessions-footer">
            <Shield size={14} />
            <p>Tanimagan seanslarni o'chirishingiz mumkin. Bu qurilmani darhol tizimdan chiqaradi.</p>
          </div>
        </div>

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="ps-modal-overlay" onClick={() => setShow2FAModal(false)}>
            <div className="ps-modal-content" onClick={e => e.stopPropagation()}>
              <div className="ps-modal-header">
                <div className="ps-modal-icon">
                  <Smartphone size={28} />
                </div>
                <h3>Ikki faktorli autentifikatsiya</h3>
                <button className="ps-close-modal" onClick={() => setShow2FAModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="ps-modal-body">
                <p>QR kodni authenticator ilovangiz bilan skanerlang</p>
                
                <div className="ps-qr-code-container">
                  <div className="ps-qr-code-placeholder">
                    <Smartphone size={48} />
                    <p>Scan this QR code with your authenticator app</p>
                    <p>Secret: JBSWY3DPEHPK3PXP</p>
                  </div>
                </div>
                
                <div className="ps-backup-code">
                  <p>QR kodni skanerlay olmasangiz, ushbu kodni qo'lda kiriting:</p>
                  <code>JBSWY3DPEHPK3PXP</code>
                  <button className="ps-copy-code" onClick={() => copyToClipboard("JBSWY3DPEHPK3PXP")}>
                    <Copy size={14} /> Nusxalash
                  </button>
                </div>

                <div className="ps-form-group">
                  <label>Tasdiqlash kodi</label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="ps-verification-input"
                  />
                </div>

                <div className="ps-backup-codes">
                  <p>Zaxira kodlarini xavfsiz joyda saqlang:</p>
                  <div className="ps-codes-grid">
                    {["123456", "789012", "345678", "901234", "567890", "123789"].map(code => (
                      <span key={code} className="ps-backup-code-item">{code}</span>
                    ))}
                  </div>
                  <button className="ps-download-codes" onClick={() => showSuccess("Zaxira kodlar saqlandi!")}>
                    <Download size={14} /> Zaxira kodlarni yuklab olish
                  </button>
                </div>
              </div>
              <div className="ps-modal-footer">
                <button className="ps-cancel-btn" onClick={() => setShow2FAModal(false)}>
                  Bekor qilish
                </button>
                <button className="ps-verify-btn" onClick={handleVerify2FA}>
                  <Shield size={16} /> Tasdiqlash va yoqish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revoke Session Modal */}
        {showRevokeModal && (
          <div className="ps-modal-overlay" onClick={() => setShowRevokeModal(null)}>
            <div className="ps-modal-content ps-revoke-modal" onClick={e => e.stopPropagation()}>
              <div className="ps-modal-icon ps-warning">
                <AlertTriangle size={28} />
              </div>
              <h3>Seansni o'chirish</h3>
              <p>"{showRevokeModal.device}" qurilmasidagi seansni o'chirmoqchimisiz?</p>
              <p className="ps-warning-text">Bu qurilma darhol tizimdan chiqariladi.</p>
              <div className="ps-modal-actions">
                <button className="ps-cancel-btn" onClick={() => setShowRevokeModal(null)}>
                  Bekor qilish
                </button>
                <button className="ps-confirm-btn ps-danger" onClick={confirmRevokeSession}>
                  <LogOut size={16} /> O'chirish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="ps-success-toast">
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Error Toast */}
        {showErrorToast && (
          <div className="ps-error-toast">
            <AlertTriangle size={18} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordSecurity;