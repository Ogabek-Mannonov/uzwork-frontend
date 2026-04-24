// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { FaUser, FaLock, FaPhoneAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import "./authcss/login.css";

import { Toast } from "../components/Toast";
import { 
  login as loginRequest, 
  googleLogin as googleLoginRequest,
  verify2FALogin as verify2FALoginRequest
} from "../../api/auth"; 

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState("email"); // email, password
  const [identifier, setIdentifier] = useState(""); // email yoki phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [showToast, setShowToast] = useState(false);

  const isEmail = (value) => String(value || "").includes("@");

  // ✅ Universal saver (token + user)
  const persistAuth = (res) => {
    // token turli nomlarda kelishi mumkin
    const token =
      res?.data?.accessToken ||
      res?.data?.token ||
      res?.accessToken ||
      res?.token ||
      res?.data?.access_token ||
      res?.data?.jwt;

    // user ham turli nomlarda kelishi mumkin
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
      // user kelmasa ham hech bo'lmasa role bo'lsa saqlaymiz
      const role =
        res?.data?.role || res?.role || res?.data?.userRole || res?.userRole;
      if (role) localStorage.setItem("user", JSON.stringify({ role }));
    }

    // optional: "meni eslab qol"
    if (!keepLoggedIn) {
      // agar siz session storage ishlatmoqchi bo'lsangiz shu yerda qilasiz
      // hozircha o'zgartirmadik
    }

    // role olish (keyin route uchun)
    let role = null;
    try {
      const raw = localStorage.getItem("user");
      role = raw ? (JSON.parse(raw)?.role || "").toLowerCase() : null;
    } catch {
      role = null;
    }

    return { token, role };
  };

  // 1-bosqich: Email/phone kiritish
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(t("auth.enterEmailPhone", "Iltimos, email yoki telefon raqamni kiriting"));
      return;
    }
    setError("");
    setStep("password");
  };

  // 2-bosqich: Parol bilan kirish (backend)
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(t("auth.enterPassword", "Parolni kiriting"));
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
        setError(res?.message || t("auth.loginError", "Kirishda xatolik"));
        return;
      }

      if (res?.requires_2fa) {
        setTwoFactorToken(res.twoFactorToken);
        setStep("2fa");
        setLoading(false);
        return;
      }

      // ✅ ENG MUHIM: user ham token ham localStorage ga yoziladi
      const { token, role } = persistAuth(res);

      if (!token) {
        setError(t("auth.noToken", "Token kelmadi. Backend login response'ni tekshiring."));
        return;
      }

      // ✅ Role bo‘yicha yo‘naltirish
      // Siz hozir hammani /profile ga yuboryapsiz, lekin freelancer bo'lsa /jobs ga ham bo'lishi mumkin
      if (role === "freelancer") navigate("/find-work", { replace: true });
      else if (role === "client") navigate("/profile/client", { replace: true });
      else if (role === "admin") navigate("/home", { replace: true });
      else navigate("/find-work", { replace: true });
    } catch (err) {
      setError(err?.message || t("auth.serverError", "Server bilan ulanishda xato"));
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError(t("auth.enter6DigitCode", "Iltimos, 6 xonali kodni kiriting"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await verify2FALoginRequest({
        twoFactorToken,
        code: verificationCode
      });

      if (!res?.success) {
        setError(res?.message || t("auth.2faError", "Tasdiqlashda xatolik"));
        return;
      }

      const { role } = persistAuth(res);
      
      if (role === "freelancer") navigate("/find-work", { replace: true });
      else if (role === "client") navigate("/profile/client", { replace: true });
      else if (role === "admin") navigate("/home", { replace: true });
      else navigate("/find-work", { replace: true });
    } catch (err) {
      setError(err?.message || t("auth.serverError", "Server bilan ulanishda xato"));
    } finally {
      setLoading(false);
    }
  };

  const gLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
    try {
      setLoading(true);
      setError("");

      const accessToken = tokenResponse?.access_token;
      if (!accessToken) return;

      // Backend expects 'credential' as Google access_token
      // We can pass role if needed (default in backend is freelancer)
      const payload = { credential: accessToken, role: "freelancer" };
      const res = await googleLoginRequest(payload);

      if (!res?.success) {
        setError(res?.message || t("auth.googleError", "Google tizimiga kirishda xato!"));
        return;
      }

      const { token, role } = persistAuth(res);

      if (!token) {
        setError(t("auth.noToken", "Token kelmadi. Backend login response'ni tekshiring."));
        return;
      }

      if (role === "freelancer") navigate("/find-work", { replace: true });
      else if (role === "client") navigate("/profile/client", { replace: true });
      else if (role === "admin") navigate("/home", { replace: true });
      else navigate("/find-work", { replace: true });

    } catch (e) {
      setError(t("auth.googleUnexpectedError", "Google bilan ulanishda kutilmagan xatolik."));
    } finally {
      setLoading(false);
    }
  },
  onError: () => {
    setError(t("auth.googleCancel", "Google tizimida avtorizatsiyadan o‘tish bekor qilindi."));
  }
});

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
          {step === "email" ? t("auth.loginToUzwork", "UzWork'ka kirish") : t("auth.welcome", "Xush kelibsiz")}
        </h1>
        <p className="subtitle-login">
          {step === "email" 
            ? t("auth.loginSubtitle", "Platformaga kirish uchun ma'lumotlaringizni kiriting")
            : t("auth.passwordSubtitle", "Davom etish uchun parolingizni kiriting")
          }
        </p>

        {error && <div className="alert-error">{error}</div>}

      {/* 1-bosqich: Email/phone */}
      {step === "email" && (
        <div className="soft-fade-in">
          <form onSubmit={handleEmailSubmit}>
            <div className="input-group">
              <label>{t("auth.emailOrPhone", "Email yoki Telefon")}</label>
              <input
                type="text"
                className="login-input"
                placeholder="example@gmail.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoFocus
              />
            </div>

            <button type="submit" className="cont-btn" disabled={loading}>
              {loading ? t("auth.checking", "Tekshirilmoqda...") : t("auth.continue", "Davom etish")}
            </button>
          </form>

          <div className="login-or">{t("auth.or", "yoki")}</div>

          <div className="social-btns">
            <button
              className="google-btn"
              onClick={() => gLogin()}
              disabled={loading}
              type="button"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                width={18}
                height={18}
              />
              {t("auth.loginWithGoogle", "Google orqali kirish")}
            </button>

            <button
              className="apple-btn"
              onClick={handlePhoneClick}
              disabled={loading}
              type="button"
            >
              <FaPhoneAlt size={16} />
              {t("auth.loginWithPhone", "Telefon orqali kirish")}
            </button>
          </div>

          <div className="text-center">
            <span>{t("auth.noAccount", "Hisobingiz yo‘qmi?")}</span>
            <a href="/signup" className="signup-btn-link">
              {t("auth.signUp", "Ro‘yxatdan o‘tish")}
            </a>
          </div>
        </div>
      )}

      {/* 2-bosqich: Parol */}
      {step === "password" && (
        <div className="soft-fade-in">
          <span className="email-preview">{identifier}</span>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>{t("auth.passwordLabel", "Parol")}</label>
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="••••••••"
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
                <span>{t("auth.rememberMe", "Meni eslab qol")}</span>
              </label>

              <Link to="/forgot-password" className="forgot-link">
                {t("auth.forgotPassword", "Parolni unutdingizmi?")}
              </Link>
            </div>

            <button
              type="submit"
              className="cont-btn"
              disabled={loading}
            >
              {loading ? t("auth.loading", "Yuklanmoqda...") : t("auth.loginBtn", "Kirish")}
            </button>
          </form>

          <div className="not-you">
            <a href="#" onClick={handleBack} className="not-you-link">
              {t("auth.notYou", "Bu siz emassizmi?")}
            </a>
          </div>
        </div>
      )}

      {/* 3-bosqich: 2FA */}
      {step === "2fa" && (
        <div className="soft-fade-in">
          <p className="subtitle-login" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {t("auth.2faInstruction", "Sizning email manzilingizga 6 xonali tasdiqlash kodi yuborildi.")}
          </p>

          <form onSubmit={handle2FAVerify}>
            <div className="input-group">
              <label>{t("auth.verificationCode", "Tasdiqlash kodi")}</label>
              <input
                type="text"
                className="login-input"
                placeholder="000000"
                maxLength="6"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                autoFocus
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
              />
            </div>

            <button
              type="submit"
              className="cont-btn"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? t("auth.verifying", "Tasdiqlanmoqda...") : t("auth.verifyLogin", "Tasdiqlash va kirish")}
            </button>
          </form>

          <div className="not-you">
            <a href="#" onClick={handleBack} className="not-you-link">
              {t("auth.backToLogin", "Login sahifasiga qaytish")}
            </a>
          </div>
        </div>
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
        message={t("auth.featureUnavail", "Bu xususiyat vaqtinchalik ishlamayapti")}
        onClose={() => setShowToast(false)}
      />
    )}
  </div>
);
};

export default Login;
