// Login.jsx
import React, { useState } from 'react';
import { FaUser, FaLock, FaPhoneAlt } from 'react-icons/fa'; 
import './authcss/login.css';


const Login = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Bu yerda login logikasi bo'ladi (masalan API chaqiruvi)
    setTimeout(() => {
      if (!email) {
        setError("Iltimos, barcha maydonlarni to'ldiring");
      } else {
        setError('');
        // login muvaffaqiyatli bo'lsa keyingi sahifaga yo'naltirish
        console.log('Login muvaffaqiyatli:', { email });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title-login">Kirish</h1>

        {error && <div className="alert-error">{error}</div>}

        <form className="form-login" onSubmit={handleSubmit}>
          {/* Email maydoni */}
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="email"
              className="login-input"
              placeholder="Email yoki telefon raqam"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Kirish tugmasi */}
          <button type="submit" className="cont-btn" disabled={loading}>
            {loading ? 'Yuklanmoqda...' : 'Kirish'}
          </button>
        </form>

        <div className="login-or">yoki</div>

        {/* Google bilan kirish */}
        <button className="google-btn">
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            width={20}
            height={20}
          />
          Google orqali kirish
        </button>

        {/* Apple bilan kirish (agar kerak bo'lsa) */}
        <button className="apple-btn">
          <FaPhoneAlt size={20} />
          Telefon raqam orqali kirish
        </button>

        {/* Ro'yxatdan o'tish qismi */}
        <div className="text-center">
          <p>Hisobingiz yo'qmi?</p>
          <a href="/signup" className="signup-btn-link">
            Ro'yxatdan o'tish
          </a>
          {/* Agar link ichida span bo'lsa, quyidagicha ham ishlatish mumkin: */}
          {/* 
          <a href="/signup" className="signup-btn-link">
            <span className="link-sign">Ro'yxatdan o'tish</span>
          </a> 
          */}
        </div>
      </div>
    </div>
  );
};

export default Login;