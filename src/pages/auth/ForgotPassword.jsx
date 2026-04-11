import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useTranslation } from "react-i18next";

import "./authcss/forgotPassword.css";
import { forgotPassword, resetPassword } from "../../api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // step: request -> reset -> done
  const [step, setStep] = useState("request");

  const [identifier, setIdentifier] = useState(""); // email yoki phone
  const [code, setCode] = useState(""); // otp
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEmail = (v) => String(v || "").includes("@");

  const maskedIdentifier = useMemo(() => {
    const v = identifier.trim();
    if (!v) return "";
    if (v.includes("@")) {
      const [name, domain] = v.split("@");
      const safeName = name.length <= 2 ? `${name}***` : `${name.slice(0, 2)}***`;
      return `${safeName}@${domain}`;
    }
    const digits = v.replace(/\s/g, "");
    if (digits.length <= 6) return `${digits.slice(0, 3)}***`;
    return `${digits.slice(0, 6)}***${digits.slice(-4)}`;
  }, [identifier]);

  const backToLogin = () => navigate("/login", { replace: true });

  const goBack = () => {
    setError("");
    if (step === "reset") {
      setStep("request");
      setCode("");
      setNewPassword("");
      setConfirm("");
      return;
    }
    navigate("/login");
  };

  const normalizePhone = (v) => String(v || "").trim(); // xohlasang keyin tozalaymiz

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");

    const id = identifier.trim();
    if (!id) {
      setError("Iltimos, email yoki telefon raqamni kiriting");
      return;
    }

    setLoading(true);
    try {
      const payload = isEmail(id) ? { email: id } : { phone: normalizePhone(id) };

      const res = await forgotPassword(payload);

      if (!res?.success) {
        setError(res?.message || "Kod yuborishda xatolik");
        return;
      }

      // backend privacy uchun "user topilmadi" demasligi ham mumkin — baribir reset stepga o'tamiz
      setStep("reset");
    } catch (err) {
      setError(err?.message || "Kod yuborishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    const id = identifier.trim();

    if (!code.trim()) {
      setError("Tasdiqlash kodini kiriting");
      return;
    }

    if (!newPassword.trim() || newPassword.trim().length < 8) {
      setError("Yangi parol kamida 8 ta belgidan iborat bo‘lsin");
      return;
    }

    if (newPassword !== confirm) {
      setError("Parollar mos kelmadi");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        identifier: isEmail(id) ? id : normalizePhone(id),
        code: code.trim(),
        new_password: newPassword,
      });

      if (!res?.success) {
        setError(res?.message || "Parolni yangilashda xatolik");
        return;
      }

      setStep("done");
    } catch (err) {
      setError(err?.message || "Parolni yangilashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    const id = identifier.trim();
    if (!id) {
      setStep("request");
      return;
    }

    setLoading(true);
    try {
      const payload = isEmail(id) ? { email: id } : { phone: normalizePhone(id) };
      const res = await forgotPassword(payload);

      if (!res?.success) {
        setError(res?.message || "Kodni qayta yuborishda xatolik");
        return;
      }

      // reset stepda qoladi
    } catch (err) {
      setError(err?.message || "Kodni qayta yuborishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uzfp-container">
      <div className="uzfp-card">
        <button type="button" className="uzfp-backBtn" onClick={goBack} aria-label={t("common.back", "Orqaga")}>
          <IoMdArrowRoundBack />
        </button>

        {step !== "done" && (
          <div className="soft-fade-in">
            <h1 className="uzfp-title">
              {step === "request" ? t("auth.resetPassword", "Parolni tiklash") : t("auth.setNewPassword", "Yangi parol")}
            </h1>
            <p className="uzfp-sub">
              {step === "request" 
                ? t("auth.resetSubtitle", "Email yoki telefon raqamingizni kiriting — tasdiqlash kodi yuboramiz.")
                : t("auth.setCodeSubtitle", "Iltimos, yuborilgan kodni va yangi parolni kiriting.")
              }
            </p>
          </div>
        )}

        {error && <div className="uzfp-alert">{error}</div>}

        {/* STEP 1: REQUEST CODE */}
        {step === "request" && (
          <div className="soft-fade-in">
            <form onSubmit={handleSendCode}>
              <div className="uzfp-inputGroup">
                <FaUser className="uzfp-icon" />
                <input
                  className="uzfp-input"
                  type="text"
                  placeholder={t("auth.emailOrPhone", "Email yoki telefon raqam")}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoFocus
                />
              </div>

              <button className="uzfp-btn uzfp-primary" disabled={loading}>
                {loading ? t("auth.sending", "Yuborilmoqda...") : t("auth.sendCode", "Kod yuborish")}
              </button>

              <div className="uzfp-footer">
                <span>{t("auth.remembered", "Esingizga tushdimi?")}</span>
                <button type="button" className="uzfp-linkBtn" onClick={backToLogin}>
                  {t("auth.loginBtn", "Kirish")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: RESET */}
        {step === "reset" && (
          <div className="soft-fade-in">
            <div className="uzfp-pill">
              {t("auth.codeSentTo", "Kod yuborildi:")} <b>{maskedIdentifier}</b>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="uzfp-inputGroup">
                <span className="uzfp-codeTag">OTP</span>
                <input
                  className="uzfp-input uzfp-codeInput"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                />
              </div>

              <div className="uzfp-inputGroup">
                <FaLock className="uzfp-icon" />
                <input
                  className="uzfp-input"
                  type={showNew ? "text" : "password"}
                  placeholder={t("auth.newPassword", "Yangi parol")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="uzfp-eyeBtn"
                  onClick={() => setShowNew((p) => !p)}
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="uzfp-inputGroup">
                <FaLock className="uzfp-icon" />
                <input
                  className="uzfp-input"
                  type={showConfirm ? "text" : "password"}
                  placeholder={t("auth.confirmPassword", "Parolni tasdiqlang")}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  className="uzfp-eyeBtn"
                  onClick={() => setShowConfirm((p) => !p)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button className="uzfp-btn uzfp-primary" disabled={loading}>
                {loading ? t("auth.updating", "Yangilanmoqda...") : t("auth.updateBtn", "Yangilash")}
              </button>

              <button
                type="button"
                className="uzfp-btn uzfp-ghost"
                onClick={handleResend}
                disabled={loading}
              >
                {t("auth.resendCode", "Kodni qayta yuborish")}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: DONE */}
        {step === "done" && (
          <div className="uzfp-success soft-fade-in">
            <div className="uzfp-successIcon">
              <FaCheckCircle />
            </div>

            <h2 className="uzfp-successTitle">{t("auth.successTitle", "Muvaffaqiyatli!")}</h2>
            <p className="uzfp-successText">
              {t("auth.successDesc", "Parolingiz muvaffaqiyatli yangilandi. Endi yangi parol bilan kirishingiz mumkin.")}
            </p>

            <button className="uzfp-btn uzfp-primary" onClick={backToLogin}>
              {t("auth.goToLogin", "Kirish sahifasiga o'tish")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
