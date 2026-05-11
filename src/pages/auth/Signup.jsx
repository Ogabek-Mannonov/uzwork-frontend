// src/pages/auth/Signup.jsx
import { useState } from "react";
import { FaBriefcase, FaUser, FaCheckCircle } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./authcss/signup.css";
import { signup as signupRequest, verifySignup } from "../../api/auth";

function Signup() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");


  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    identifier: "",
    password: "",
    country: "Uzbekistan",
    sendEmails: true,
    agreeTerms: false,
    role: "",
  });

  const [createdUserId, setCreatedUserId] = useState(null);
  const [otpCode, setOtpCode] = useState("");

  const handleRoleChange = (e) => {
    setFormData({ ...formData, role: e.target.value });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContinue = () => {
    if (formData.role) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setServerError("");
    setFormData((p) => ({ ...p, role: "" }));
  };

  // Agar user username kiritmasa — avtomatik generatsiya
  const genUsername = () => {
    const isEmail = formData.identifier.includes("@");
    const base =
      (formData.firstName || "user") +
      "_" +
      (formData.lastName || "") +
      "_" +
      (isEmail ? formData.identifier.split("@")[0] : "uzwork");

    const cleaned = base.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
    return cleaned || `user_${Date.now()}`;
  };

  // ✅ Universal saver (token + user) — login dagidek
  const persistAuth = (res) => {
    const token =
      res?.data?.accessToken ||
      res?.data?.token ||
      res?.accessToken ||
      res?.token ||
      res?.data?.access_token ||
      res?.data?.jwt;

    const user =
      res?.data?.user ||
      res?.user ||
      res?.data?.me ||
      res?.me ||
      res?.data?.profile ||
      res?.profile;

    if (token) localStorage.setItem("accessToken", token);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      // user kelmasa ham role bo'lsa saqlab qo'yamiz
      const role =
        res?.data?.role || res?.role || res?.data?.userRole || res?.userRole;
      if (role) localStorage.setItem("user", JSON.stringify({ role }));
    }

    let role =
      res?.data?.user?.role ||
      res?.user?.role ||
      res?.data?.role ||
      res?.role ||
      res?.data?.userRole ||
      res?.userRole;

    if (!role) {
      try {
        const raw = localStorage.getItem("user");
        role = raw ? JSON.parse(raw)?.role : null;
      } catch {
        role = null;
      }
    }

    return { token, role: role ? role.toLowerCase() : null };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // basic validations
    if (!formData.role) {
      setServerError(t("auth.roleNotSelected", "Role tanlanmagan."));
      return;
    }

    if (!formData.agreeTerms) {
      setServerError(t("auth.agreeTermsReq", "Shartlarga rozilik bildiring."));
      return;
    }

    if (!formData.identifier.trim()) {
      setServerError(t("auth.enterEmailPhone", "Email yoki telefon raqamni kiriting."));
      return;
    }

    if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setServerError(
        t("auth.invalidUsername", "Username faqat harflar, raqamlar va _ belgisidan iborat bo‘lishi kerak.")
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        role: formData.role,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        identifier: formData.identifier.trim(),
        password: formData.password,
        username: formData.username.trim()
          ? formData.username.trim()
          : genUsername(),
        display_name: `${formData.firstName} ${formData.lastName}`.trim(),
      };

      const res = await signupRequest(payload);

      if (!res?.success) {
        setServerError(res?.message || t("auth.signupError", "Ro‘yxatdan o‘tishda xato"));
        return;
      }

      if (res?.needs_verification) {
        setCreatedUserId(res.data.userId);
        setStep(3); // OTP step
      } else {
        persistAuth(res);
        if (formData.role === "freelancer") {
          navigate("/onboarding", { replace: true });
        } else {
          setShowSuccess(true);
        }
      }
    } catch (err) {
      setServerError(err?.message || t("auth.serverError", "Server bilan ulanishda xato"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!otpCode.trim()) {
      setServerError(t("auth.enterCode", "Tasdiqlash kodini kiriting."));
      return;
    }

    setSubmitting(true);
    try {
      const res = await verifySignup({ userId: createdUserId, code: otpCode.trim() });
      if (!res?.success) {
        setServerError(res?.message || t("auth.verifyError", "Kodni tasdiqlashda xatolik."));
        return;
      }
      
      const { role } = persistAuth(res);
      const finalRole = role || formData.role;
      
      if (finalRole === "freelancer") {
        navigate("/onboarding", { replace: true });
      } else {
        setShowSuccess(true);
      }
    } catch (err) {
      setServerError(err?.message || t("auth.verifyFail", "Tasdiqlashda xatolik."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoNext = () => {
    // formData.role is always reliable — user selected it themselves
    if (formData.role === "freelancer") {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* ✅ SUCCESS CARD */}
        {showSuccess ? (
          <div className="success-card soft-fade-in">
            <div className="success-icon-wrapper">
              <FaCheckCircle className="success-icon" />
            </div>

            <h2 className="title-signup">{t("auth.signupSuccessTitle", "Muvaffaqiyatli ro‘yxatdan o‘tdingiz!")}</h2>

            <p className="subtitle-signup">
              {formData.role === "freelancer" 
                ? t("auth.signupSuccessDesc_freelancer", "Hisobingiz muvaffaqiyatli yaratildi. Karyerangizni boshlash uchun profilingizni sozlang.")
                : t("auth.signupSuccessDesc", "Hisobingiz muvaffaqiyatli yaratildi. Tizimga kirib ishingizni boshlashingiz mumkin.")
              }
            </p>

            <button className="create-account-btn" onClick={handleGoNext}>
              {t("auth.continue", "Davom etish")}
            </button>
          </div>
        ) : (
          <>
            {step > 1 && (
              <button type="button" className="back-btn" onClick={handleBack}>
                <IoMdArrowRoundBack size={20} />
              </button>
            )}

            <h2 className="title-signup">{t("auth.signUp", "Ro'yxatdan o'tish")}</h2>
            <p className="subtitle-signup">
              {step === 1 
                ? t("auth.selectRoleDesc", "Platformada qaysi maqsadda foydalanmoqchisiz?")
                : t("auth.fillDetailsDesc", "Hisobingizni yaratish uchun quyidagi ma'lumotlarni to'ldiring.")
              }
            </p>

            {serverError && (
              <div
                style={{
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  color: "#dc2626",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: 20,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}
              >
                <FaCheckCircle style={{ transform: 'rotate(45deg)' }} />
                {serverError}
              </div>
            )}

            {/* STEP 1: ROLE */}
            {step === 1 && (
              <div className="soft-fade-in">
                <div className="role-boxes">
                  <div
                    className={`role-box ${formData.role === "client" ? "selected" : ""}`}
                    onClick={() => handleRoleChange({ target: { value: "client" } })}
                  >
                    <div className="role-icon-box">
                      <FaBriefcase size={24} />
                    </div>
                    <h3>{t("auth.iAmClient", "Men ish beruvchiman")}</h3>
                    <p>{t("auth.clientDesc", "Loyiha joylashtirib, mutaxassis yollamoqchiman")}</p>
                  </div>

                  <div
                    className={`role-box ${formData.role === "freelancer" ? "selected" : ""}`}
                    onClick={() => handleRoleChange({ target: { value: "freelancer" } })}
                  >
                    <div className="role-icon-box">
                      <FaUser size={24} />
                    </div>
                    <h3>{t("auth.iAmFreelancer", "Men freelancerman")}</h3>
                    <p>{t("auth.freelancerDesc", "Ish topib, daromad qilmoqchiman")}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!formData.role}
                  className="continue-btn"
                >
                  {t("auth.continue", "Davom etish")}
                </button>
                
                <div className="link-box">
                  <span className="text-center-signup">
                    {t("auth.alreadyHaveAcc", "Hisobingiz bormi?")}{" "}
                    <Link to="/login" className="login-link">
                      {t("auth.login", "Kirish")}
                    </Link>
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: FORM */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="upwork-signup-form soft-fade-in">
                <div className="input-row">
                  <div className="input-group">
                    <label>{t("auth.firstName", "Ismingiz")}</label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Ali"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>{t("auth.lastName", "Familiyangiz")}</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Valiyev"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>{t("auth.username", "Username")}</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="alidev_uz"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <small>{t("auth.optionalUsername", "Ixtiyoriy. Bo‘sh bo'lsa avtomatik yaratiladi.")}</small>
                </div>

                <div className="input-group">
                  <label>{t("auth.emailOrPhone", "Email yoki Telefon")}</label>
                  <input
                    type="text"
                    name="identifier"
                    placeholder="example@gmail.com"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>{t("auth.passwordLabel", "Parol")}</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
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
                    {t("auth.agreePrefix", "Ha, men ")}
                    <a href="#" className="terms-link">{t("auth.terms", "UzWork shartlari")}</a>
                    {" va "}
                    <a href="#" className="terms-link">{t("auth.privacyPolicy", "Siyosati")}</a>
                    {" bilan roziman."}
                  </label>
                </div>

                <button
                  type="submit"
                  className="create-account-btn"
                  disabled={submitting}
                >
                  {submitting ? t("auth.creatingAcc", "Yaratilmoqda...") : t("auth.createAcc", "Hisobni yaratish")}
                </button>
              </form>
            )}

            {/* STEP 3: OTP VERIFICATION */}
            {step === 3 && (
              <div className="soft-fade-in">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                    {t("auth.otpSentDesc", "Siz ko'rsatgan manzilga 6-xonali kod yuborild.")}
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="upwork-signup-form">
                  <div className="input-group">
                    <label>{t("auth.otpLabel", "Tasdiqlash kodi")}</label>
                    <input
                      type="text"
                      className="otp-input"
                      placeholder="000 000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="create-account-btn"
                    disabled={submitting}
                  >
                    {submitting ? t("auth.verifying", "Tasdiqlanmoqda...") : t("auth.verify", "Tasdiqlash")}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;
