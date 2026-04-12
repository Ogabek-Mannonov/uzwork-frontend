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
    
    if (score <= 2) return { label: "Weak", color: "#dc2626", percentage: 33, message: "Your password is too weak" };
    if (score <= 4) return { label: "Medium", color: "#f59e0b", percentage: 66, message: "Your password could be stronger" };
    return { label: "Strong", color: "#10b981", percentage: 100, message: "Your password is strong" };
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
    <div className="security-page">
      <div className="security-container">
        {/* Header */}
        <div className="security-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Orqaga</span>
          </button>
          <div className="header-info">
            <h1>Parol va Xavfsizlik</h1>
            <p>Parolingizni va xavfsizlik sozlamalarini boshqaring</p>
          </div>
        </div>

        {/* Security Score Card */}
        <div className="security-score-card">
          <div className="score-header">
            <div className="score-icon">
              <ShieldCheck size={32} />
            </div>
            <div className="score-info">
              <h3>Xavfsizlik darajasi: <span className="score-value">85%</span></h3>
              <p>Hisobingiz xavfsizlik holati</p>
            </div>
          </div>
          <div className="score-progress">
            <div className="score-fill" style={{ width: "85%", backgroundColor: "#10b981" }}></div>
          </div>
          <div className="score-items">
            <div className="score-item completed">
              <CheckCircle size={14} />
              <span>Parol kuchi: Yaxshi</span>
            </div>
            <div className="score-item completed">
              <CheckCircle size={14} />
              <span>Email tasdiqlangan</span>
            </div>
            <div className="score-item pending">
              <AlertTriangle size={14} />
              <span>2FA yoqilmagan</span>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="password-card">
          <div className="card-header">
            <div className="header-icon"><Lock size={24} /></div>
            <div className="header-info">
              <h2>Parolni o'zgartirish</h2>
              <p>Parolingiz kamida 8 belgidan iborat bo'lishi va harflar, raqamlar va belgilarni o'z ichiga olishi kerak</p>
            </div>
            <button 
              className="history-btn"
              onClick={() => setShowPasswordHistory(!showPasswordHistory)}
            >
              <Clock size={16} />
              Tarix
            </button>
          </div>

          {/* Password History */}
          {showPasswordHistory && (
            <div className="password-history">
              <h4>So'nggi parol o'zgarishlari</h4>
              <div className="history-list">
                {passwordHistory.map(item => (
                  <div key={item.id} className="history-item">
                    <CheckCircle size={14} className="history-icon" />
                    <span>{item.message}</span>
                    <span className="history-date">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="password-form">
            <div className="form-group">
              <label>Joriy parol</label>
              <div className="password-input-wrapper">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  placeholder="Joriy parolingizni kiriting"
                  className="password-input"
                  disabled={isLoading}
                />
                <button type="button" className="toggle-password" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Yangi parol</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  placeholder="Yangi parol kiriting"
                  className="password-input"
                  disabled={isLoading}
                />
                <button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {passwordForm.newPassword && (
                <>
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div className="strength-fill" style={{ width: `${passwordStrength.percentage}%`, backgroundColor: passwordStrength.color }} />
                    </div>
                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label} parol - {passwordStrength.message}
                    </span>
                  </div>

                  <div className="password-requirements">
                    {passwordStrengthChecks.map(check => (
                      <div key={check.id} className={`requirement ${passwordValidations[check.id] ? "valid" : ""}`}>
                        {passwordValidations[check.id] ? <CheckCircle size={14} className="valid-icon" /> : <div className="dot" />}
                        <span>{check.label}</span>
                      </div>
                    ))}
                    <div className={`requirement ${passwordValidations.match ? "valid" : ""}`}>
                      {passwordValidations.match ? <CheckCircle size={14} className="valid-icon" /> : <div className="dot" />}
                      <span>Parollar mos keladi</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label>Yangi parolni tasdiqlang</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  placeholder="Yangi parolni qayta kiriting"
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
                <><RefreshCw size={18} className="spinning" /> Yangilanmoqda...</>
              ) : (
                <><Save size={18} /> Parolni yangilash</>
              )}
            </button>
          </form>
        </div>

        {/* Security Settings Grid */}
        <div className="security-settings-grid">
        <h2 className="section-subtitle">Xavfsizlik sozlamalari</h2>
          
          <div className="settings-grid">
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
                      {setting.enabled ? "Yoqilgan" : "O'chirilgan"}
                    </span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={setting.enabled} onChange={() => toggleSecuritySetting(setting.id)} />
                    <span className="slider"></span>
                  </label>
                </div>

                {setting.id === "2fa" && !setting.enabled && (
                  <button className="enable-2fa-btn" onClick={handleEnable2FA}>
                    <Shield size={14} />
                    2FA ni sozlash
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Tip */}
        <div className="security-tip-card">
          <AlertTriangle size={20} />
          <div className="tip-content">
            <h4>Xavfsizlik maslahati</h4>
            <p>Hisobingizga qo'shimcha himoya qatlami qo'shish uchun ikki faktorli autentifikatsiyani yoqing.</p>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="sessions-card">
          <div className="sessions-header">
            <h2>Faol seanslar</h2>
            <button className="refresh-sessions" onClick={handleRefreshSessions}>
              <RefreshCw size={16} />
              Yangilash
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
                      {session.current && <span className="current-badge">Hozirgi</span>}
                    </div>
                    <p className="device-details">{session.browser} • {session.os}</p>
                    <p className="device-location">
                      <MapPin size={12} /> {session.location} • {session.ip}
                    </p>
                    <span className="last-active">
                      <Clock size={12} /> Oxirgi faollik: {session.lastActive}
                    </span>
                  </div>
                </div>
                
                {!session.current && (
                  <button className="revoke-btn" onClick={() => handleRevokeSession(session.id)}>
                    <LogOut size={14} /> O'chirish
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="sessions-footer">
            <Shield size={14} />
            <p>Tanimagan seanslarni o'chirishingiz mumkin. Bu qurilmani darhol tizimdan chiqaradi.</p>
          </div>
        </div>

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-icon">
                  <Smartphone size={28} />
                </div>
                <h3>Ikki faktorli autentifikatsiya</h3>
                <button className="close-modal" onClick={() => setShow2FAModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p>QR kodni authenticator ilovangiz bilan skanerlang</p>
                
                <div className="qr-code-container">
                  <div className="qr-code-placeholder">
                    <Smartphone size={48} />
                    <p>Scan this QR code with your authenticator app</p>
                    <p>Secret: JBSWY3DPEHPK3PXP</p>
                  </div>
                </div>
                
                <div className="backup-code">
                  <p>QR kodni skanerlay olmasangiz, ushbu kodni qo'lda kiriting:</p>
                  <code>JBSWY3DPEHPK3PXP</code>
                  <button className="copy-code" onClick={() => copyToClipboard("JBSWY3DPEHPK3PXP")}>
                    <Copy size={14} /> Nusxalash
                  </button>
                </div>

                <div className="form-group">
                  <label>Tasdiqlash kodi</label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="verification-input"
                  />
                </div>

                <div className="backup-codes">
                  <p>Zaxira kodlarini xavfsiz joyda saqlang:</p>
                  <div className="codes-grid">
                    {["123456", "789012", "345678", "901234", "567890", "123789"].map(code => (
                      <span key={code} className="backup-code-item">{code}</span>
                    ))}
                  </div>
                  <button className="download-codes" onClick={() => showSuccess("Zaxira kodlar saqlandi!")}>
                    <Download size={14} /> Zaxira kodlarni yuklab olish
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShow2FAModal(false)}>
                  Bekor qilish
                </button>
                <button className="verify-btn" onClick={handleVerify2FA}>
                  <Shield size={16} /> Tasdiqlash va yoqish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revoke Session Modal */}
        {showRevokeModal && (
          <div className="modal-overlay" onClick={() => setShowRevokeModal(null)}>
            <div className="modal-content revoke-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-icon warning">
                <AlertTriangle size={28} />
              </div>
              <h3>Seansni o'chirish</h3>
              <p>"{showRevokeModal.device}" qurilmasidagi seansni o'chirmoqchimisiz?</p>
              <p className="warning-text">Bu qurilma darhol tizimdan chiqariladi.</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowRevokeModal(null)}>
                  Bekor qilish
                </button>
                <button className="confirm-btn danger" onClick={confirmRevokeSession}>
                  <LogOut size={16} /> O'chirish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="success-toast">
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Error Toast */}
        {showErrorToast && (
          <div className="error-toast">
            <AlertTriangle size={18} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordSecurity;