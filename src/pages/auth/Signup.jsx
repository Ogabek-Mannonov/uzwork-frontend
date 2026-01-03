// src/pages/auth/Signup.jsx
import { useState } from "react";
import { FaBriefcase, FaUser } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";

import "./authcss/signup.css";

function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    country: "Uzbekistan",
    sendEmails: true,
    agreeTerms: false,
    role: "",
  });

  const handleRoleChange = (e) => {
    setFormData({ ...formData, role: e.target.value });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleContinue = () => {
    if (formData.role) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setFormData({ ...formData, role: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert("Shartlarga rozilik bildiring!");
      return;
    }
    console.log("Signup data:", formData);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="title-signup">Ro'yxatdan o'tish</h2>

        {/* Step 1 */}
        {step === 1 && (
          <>
            <div className="role-boxes">
              <label
                className={`role-box ${
                  formData.role === "client" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={formData.role === "client"}
                  onChange={handleRoleChange}
                  className="radio-input"
                />
                <div className="role-content">
                  <FaBriefcase size={60} className="role-icon" />
                  <h3>Men ish beruvchiman</h3>
                  <p>Loyiha joylashtirib, freelancer yollamoqchiman</p>
                </div>
              </label>

              <label
                className={`role-box ${
                  formData.role === "freelancer" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="freelancer"
                  checked={formData.role === "freelancer"}
                  onChange={handleRoleChange}
                  className="radio-input"
                />
                <div className="role-content">
                  <FaUser size={60} className="role-icon" />
                  <h3>Men freelancer man</h3>
                  <p>Ish topib, daromad qilmoqchiman</p>
                </div>
              </label>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!formData.role}
              className="continue-btn"
            >
              Davom etish
            </button>
          </>
        )}

        {/* Step 2*/}
        {step === 2 && (
          <>
            <button type="button" className="back-btn" onClick={handleBack}>
              <IoMdArrowRoundBack />
            </button>
            <div className="selected-role-header">
              <h3 className="selected-role-title">
                {formData.role === "client"
                  ? "Ish beruvchi sifatida"
                  : "Freelancer sifatida"}{" "}
                ro'yxatdan o'tish
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="upwork-signup-form">
              <div className="input-row">
                <div className="input-group">
                  <label>Ismingiz</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder=""
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Familiyangiz</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder=""
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group full-width">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder=""
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group full-width">
                <label>Parol</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Parol (8 yoki undan ko'p belgi)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group full-width">
                <label>Davlat</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="country-select"
                  required
                >
                  <option value="Uzbekistan">O'zbekiston</option>
                  <option value="Kazakhstan">Qozog'iston</option>
                  <option value="Kyrgyzstan">Qirg'iziston</option>
                  <option value="Tajikistan">Tojikiston</option>
                  <option value="Turkmenistan">Turkmaniston</option>
                  <option value="Russia">Rossiya</option>
                  <option value="Turkey">Turkiya</option>
                </select>
              </div>

              <div className="upwork-checkbox-group">
                <input
                  type="checkbox"
                  name="sendEmails"
                  checked={formData.sendEmails}
                  onChange={handleChange}
                  id="sendEmails"
                />
                <label htmlFor="sendEmails">
                  Menga loyiha topish bo'yicha maslahatlar yuborilsin
                </label>
              </div>

              <div className="upwork-checkbox-group">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  id="agreeTerms"
                  required
                />
                <label htmlFor="agreeTerms">
                  Ha, men{" "}
                  <a href="#" className="terms-link">
                    UzWork shartlari
                  </a>
                  ,{" "}
                  <a href="#" className="terms-link">
                    Foydalanuvchi kelishuvi
                  </a>{" "}
                  va{" "}
                  <a href="#" className="terms-link">
                    Maxfiylik siyosati
                  </a>{" "}
                  bilan tanishib chiqdim va roziman.
                </label>
              </div>

              <button type="submit" className="create-account-btn">
                Hisobni yaratish
              </button>
            </form>

            <p className="text-center-signup">
              Allaqachon hisobingiz bormi?{" "}
              <a href="/login" className="login-link">
                Kirish
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;
