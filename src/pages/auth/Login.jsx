// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { FaUser, FaLock, FaPhoneAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./authcss/login.css";

import { Toast } from "../components/Toast";
import { login as loginRequest } from "../../api/auth"; // yo‘lni loyihangga mosla

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // email, password
  const [identifier, setIdentifier] = useState(""); // email yoki phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showToast, setShowToast] = useState(false);

  const isEmail = (value) => value.includes("@");

  // 1-bosqich: Email/phone kiritish
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Iltimos, email yoki telefon raqamni kiriting");
      return;
    }
    setError("");
    setStep("password");
  };

  // 2-bosqich: Parol bilan kirish (backend)
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Parolni kiriting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const id = identifier.trim();

      const payload = isEmail(id)
        ? { email: id, password }
        : { phone: id, password };

      const res = await loginRequest(payload);

      if (!res?.success) {
        setError(res?.message || "Kirishda xatolik");
        return;
      }

      // Tokenlar auth.js ichida localStorage ga saqlandi

      // Role bo‘yicha yo‘naltirish (xohlasang o‘zgartirasan)
      const role = res?.data?.user?.role;
      if (role === "client") navigate("/profile"); // vaqtinchalik profilega yonaltirilsin
      else navigate("/profile");
    } catch (err) {
      setError(err?.response?.data?.message || "Server bilan ulanishda xato");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => setShowToast(true);
  const handlePhoneClick = () => setShowToast(true);

  const handleBack = (e) => {
    e?.preventDefault();
    setStep("email");
    setPassword("");
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title-login">
          {step === "email" ? "Uzworkga kirish" : "Xush kelibsiz"}
        </h1>

        {error && <div className="alert-error">{error}</div>}

        {/* 1-bosqich: Email/phone */}
        {step === "email" && (
          <>
            <form onSubmit={handleEmailSubmit}>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  className="login-input"
                  placeholder="Email yoki telefon raqam"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoFocus
                />
              </div>

              <button type="submit" className="cont-btn" disabled={loading}>
                {loading ? "Tekshirilmoqda..." : "Davom etish"}
              </button>
            </form>

            <div className="login-or">yoki</div>

            <button
              className="google-btn"
              onClick={handleGoogleClick}
              disabled={loading}
              type="button"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                width={20}
                height={20}
              />
              Google orqali kirish
            </button>

            <button
              className="apple-btn"
              onClick={handlePhoneClick}
              disabled={loading}
              type="button"
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

        {/* 2-bosqich: Parol */}
        {step === "password" && (
          <>
            <div className="email-preview">{identifier}</div>

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
      </div>

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
