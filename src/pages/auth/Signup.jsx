// src/pages/auth/Signup.jsx
import { useState } from 'react';

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'freelancer'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup:', formData);
    // Keyin backend ga ulaymiz
  };

  return (
    <div className="auth-container">
      <div className="auth-card container">
        <h2>Ro'yxatdan o'tish</h2>

        <div className="alert alert-warning">
          ⚠️ Iltimos, haqiqiy ism-familiyangizni kiriting! Keyinchalik pasport tasdiqlashda muammo chiqmasligi uchun bu juda muhim.
        </div>

        <form onSubmit={handleSubmit}>
          <input type="text" name="fullName" placeholder="Ism va familiya" value={formData.fullName} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Telefon (+998...)" value={formData.phone} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Parol" value={formData.password} onChange={handleChange} required />

          <div className="role-selection">
            <label>
              <input type="radio" name="role" value="freelancer" checked={formData.role === 'freelancer'} onChange={handleChange} />
              Freelancer
            </label>
            <label>
              <input type="radio" name="role" value="client" checked={formData.role === 'client'} onChange={handleChange} />
              Mijoz
            </label>
          </div>

          <button type="submit">Ro'yxatdan o'tish</button>
        </form>

        <p className="text-center mt-6">
          Allaqachon hisobingiz bormi? <a href="/login">Kirish</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;