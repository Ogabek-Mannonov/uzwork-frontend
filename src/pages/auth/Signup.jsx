// src/pages/auth/Signup.jsx
import { useState } from "react";
import { FaBriefcase, FaUser } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

import "./authcss/signup.css";
import { signup as signupRequest } from "../../api/auth";

function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "", // ✅ USERNAME QO‘SHILDI
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
    if (formData.role) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setServerError("");
    setFormData({ ...formData, role: "" });
  };

  // Agar user username kiritmasa — avtomatik generatsiya
  const genUsername = () => {
    const base =
      (formData.firstName || "user") +
      "_" +
      (formData.lastName || "") +
      "_" +
      (formData.email ? formData.email.split("@")[0] : "uzwork");

    const cleaned = base.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
    return cleaned || `user_${Date.now()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!formData.agreeTerms) {
      setServerError("Shartlarga rozilik bildiring.");
      return;
    }

    if (!formData.phone.trim()) {
      setServerError("Telefon raqamni kiriting.");
      return;
    }

    if (
      formData.username &&
      !/^[a-zA-Z0-9_]+$/.test(formData.username)
    ) {
      setServerError(
        "Username faqat harflar, raqamlar va _ belgisidan iborat bo‘lishi kerak."
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        role: formData.role,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        username: formData.username.trim()
          ? formData.username.trim()
          : genUsername(),
        display_name: `${formData.firstName} ${formData.lastName}`.trim(),
      };

      const res = await signupRequest(payload);

      if (!res?.success) {
        setServerError(res?.message || "Ro‘yxatdan o‘tishda xato");
        return;
      }

      // Signup OK → profilga
      navigate("/profile");
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Server bilan ulanishda xato"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="title-signup">Ro'yxatdan o'tish</h2>

        {serverError && (
          <div
            style={{
              background: "#ffeded",
              border: "1px solid #ffb3b3",
              color: "#b10000",
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 14,
              fontSize: 14,
            }}
          >
            {serverError}
          </div>
        )}

        {/* STEP 1: ROLE */}
        {step === 1 && (
          <>
            <div className="role-boxes">
              <label className={`role-box ${formData.role === "client" ? "selected" : ""}`}>
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

              <label className={`role-box ${formData.role === "freelancer" ? "selected" : ""}`}>
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

        {/* STEP 2: FORM */}
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
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* ✅ USERNAME */}
              <div className="input-group full-width">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="masalan: ogabek_dev"
                  value={formData.username}
                  onChange={handleChange}
                />
                <small style={{ opacity: 0.7 }}>
                  Ixtiyoriy. Bo‘sh qoldirsangiz avtomatik yaratiladi.
                </small>
              </div>

              <div className="input-group full-width">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group full-width">
                <label>Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+998901234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group full-width">
                <label>Parol</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Kamida 8 ta belgi"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="upwork-checkbox-group"> <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} id="agreeTerms" required /> <label htmlFor="agreeTerms"> Ha, men{" "} <a href="#" className="terms-link"> UzWork shartlari </a> ,{" "} <a href="#" className="terms-link"> Foydalanuvchi kelishuvi </a>{" "} va{" "} <a href="#" className="terms-link"> Maxfiylik siyosati </a>{" "} bilan tanishib chiqdim va roziman. </label> </div>

              <button
                type="submit"
                className="create-account-btn"
                disabled={submitting}
              >
                {submitting ? "Yaratilmoqda..." : "Hisobni yaratish"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;
