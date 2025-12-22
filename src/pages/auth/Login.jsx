// src/pages/auth/Login.jsx
import { useState } from 'react';
import { login } from '../../api/auth.js';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaGoogle, FaPhone } from 'react-icons/fa';
import './authcss/login.css';

function Login() {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({
        email: formData.emailOrPhone.includes('@') ? formData.emailOrPhone : undefined,
        phone: !formData.emailOrPhone.includes('@') ? formData.emailOrPhone : undefined,
        password: formData.password,
      });
      alert('Muvaffaqiyatli kirish!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Email/telefon yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="title-login">UzWork ga kirish</h2>

        {error && <p className="alert-error">{error}</p>}

        <form className="form-login" onSubmit={handleSubmit}>
          {/* Email/Phone input + icon */}
          <div className="input-group">
            <FaUser className="input-icon" size={20} />
            <input
              className="login-input"
              type="text"
              name="emailOrPhone"
              placeholder="Email yoki telefon"
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
            />
          </div>

          <button className="cont-btn" type="submit" disabled={loading}>
            {loading ? 'Yuklanmoqda...' : 'Davom etish'}
          </button>
        </form>

        <div className="login-or">yoki</div>

        <button className="google-btn" type="button">
          <FaGoogle size={20} className="mr-3" />
          Google orqali davom etish
        </button>

        
        <button className="apple-btn" type="button">
          <FaPhone size={20} className="mr-3" />
          Telefon raqam orqali davom etish
        </button>

        <p className="text-center">
          Hisobingiz yo'qmi?
        </p>

        <button className="signup-btn-link">
          <a className="link-sign" href="/signup">Ro'yxatdan o'tish</a>
        </button>
      </div>
    </div>
  );
}

export default Login;