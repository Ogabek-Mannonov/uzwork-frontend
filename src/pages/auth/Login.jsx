// Login.jsx
import React, { useState } from "react";
import { FaUser, FaLock, FaPhoneAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import "./authcss/login.css";

// ==================notification==================
import { Toast } from "../components/Toast";

const Login = () => {
  const [step, setStep] = useState("email"); // email, password, google, phone
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================notification==================
  const [showToast, setShowToast] = useState(false);

  // Email bilan davom etish
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (!email.trim()) {
        setError("Iltimos, email yoki telefon raqamni kiriting");
      } else {
        setError("");
        setStep("password");
      }
      setLoading(false);
    }, 800);
  };

  // Parol bilan kirish
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (!password.trim()) {
        setError("Parolni kiriting");
      } else {
        setError("");
        console.log("Login muvaffaqiyatli:", { email, password, keepLoggedIn });
      }
      setLoading(false);
    }, 1000);
  };

  // Google tugmasi bosilganda
  const handleGoogleClick = () => {
    // setStep("google");
    setShowToast(true);
  };

  // Telefon tugmasi bosilganda
  const handlePhoneClick = () => {
    // setStep("phone");
    setShowToast(true);
  };

  // Orqaga qaytish
  const handleBack = () => {
    setStep("email");
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title-login">
          {step === "email" || step === "google" || step === "phone"
            ? "Uzworkga kirish"
            : "Xush kelibsiz"}
        </h1>

        {error && <div className="alert-error">{error}</div>}

        {/* 1-bosqich: Email kiritish */}
        {step === "email" && (
          <>
            <form onSubmit={handleEmailSubmit}>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  className="login-input"
                  placeholder="Email yoki telefon raqam"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <button type="submit" className="cont-btn" disabled={loading}>
                {loading ? "Tekshirilmoqda..." : "Davom etish"}
              </button>
            </form>

            <div className="login-or">yoki</div>

            {/* Asl Google tugmasi */}
            <button
              className="google-btn"
              onClick={handleGoogleClick}
              disabled={loading}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                width={20}
                height={20}
              />
              Google orqali kirish
            </button>

            {/* Asl Telefon tugmasi */}
            <button
              className="apple-btn"
              onClick={handlePhoneClick}
              disabled={loading}
            >
              <FaPhoneAlt size={20} />
              Telefon orqali kirish
            </button>

            <div className="text-center">
              <p>Hisobingiz yo‘qmi?</p>
              <a href="/signup" className="signup-btn-link">
                Ro‘yxatdan o‘tish
              </a>
            </div>
          </>
        )}

        {/* Parol kiritish */}
        {step === "password" && (
          <>
            <div className="email-preview">{email}</div>

            <form onSubmit={handleLogin}>
              <div className="input-group password-group">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="Parol"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="options-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  />
                  <span>Meni eslab qol</span>
                </label>

                <a href="/forgot-password" className="forgot-link">
                  Parolni unutdingizmi?
                </a>
              </div>

              <button
                type="submit"
                className="cont-btn login-btn"
                disabled={loading}
              >
                {loading ? "Yuklanmoqda..." : "Kirish"}
              </button>
            </form>

            <div className="text-center not-you">
              <a href="#" onClick={handleBack} className="not-you-link">
                Bu siz emassizmi?
              </a>
            </div>
          </>
        )}

        {/* Google bosilganda (demo) */}
        {/* {step === "google" && (
          <>
            <div className="input-group" style={{ marginBottom: "2rem" }}>
              <FaUser className="input-icon" />
              <input
                type="text"
                className="login-input"
                placeholder="Google hisobingiz"
                autoFocus
                readOnly
                value={email || "mannonovogabek270@gmail.com"}
              />
            </div>

            <button className="cont-btn" disabled={loading}>
              {loading ? "Yuklanmoqda..." : "Google bilan kirish"}
            </button>

            <div className="text-center" style={{ marginTop: "2rem" }}>
              <button
                onClick={handleBack}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3498db",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ← Orqaga
              </button>
            </div>
          </>
        )} */}

        {/* Telefon raqami bosilganda */}
        {/* {step === "phone" && (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("SMS kod yuborildi! (demo)");
              }}
            >
              <div className="input-group">
                <FaPhoneAlt className="input-icon" />
                <input
                  type="tel"
                  className="login-input"
                  placeholder="+998 (__) ___ __ __"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
              </div>

              <button type="submit" className="cont-btn" disabled={loading}>
                {loading ? "Yuborilmoqda..." : "Kodni yuborish"}
              </button>
            </form>

            <div className="text-center" style={{ marginTop: "2rem" }}>
              <button
                onClick={handleBack}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3498db",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ← Orqaga
              </button>
            </div>
          </>
        )} */}
      </div>

      {/* Toast xabari */}
      {showToast && (
        <Toast
          message="Bu xususiyat vaqtinchalik ishlamayapti"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Login;
