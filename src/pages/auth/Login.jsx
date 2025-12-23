// Login.jsx
import React, { useState } from 'react';
import { FaUser, FaLock, FaPhoneAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import './authcss/login.css';

const Login = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (!email.trim()) {
        setError("Iltimos, email yoki telefon raqamni kiriting");
      } else {
        setError('');
        setStep('password');
      }
      setLoading(false);
    }, 800);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (!password.trim()) {
        setError("Parolni kiriting");
      } else {
        setError('');
        console.log('Login muvaffaqiyatli:', { email, password, keepLoggedIn });
        // Bu yerda real login API chaqiriladi
      }
      setLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    setStep('email');
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title-login">
          {step === 'email' ? 'Uzworkga kirish' : 'Xush kelibsiz'}
        </h1>

        {error && <div className="alert-error">{error}</div>}

        {/* 1-bosqich: Email / Telefon */}
        {step === 'email' && (
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
                {loading ? 'Tekshirilmoqda...' : 'Davom etish'}
              </button>
            </form>

            <div className="login-or">yoki</div>

            <button className="google-btn">
              <img src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
              Google orqali kirish
            </button>

            <button className="apple-btn">
              <FaPhoneAlt size={20} />
              Telefon raqam orqali kirish
            </button>

            <div className="text-center">
              <p>Hisobingiz yo‘qmi?</p>
              <a href="/signup" className="signup-btn-link">
                Ro‘yxatdan o‘tish
              </a>
            </div>
          </>
        )}

        {/* 2-bosqich: Parol kiritish */}
        {step === 'password' && (
          <>
            <div className="email-preview">{email}</div>

            <form onSubmit={handleLogin}>
              <div className="input-group password-group">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
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

              <button type="submit" className="cont-btn login-btn" disabled={loading}>
                {loading ? 'Yuklanmoqda...' : 'Kirish'}
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
    </div>
  );
};

export default Login;