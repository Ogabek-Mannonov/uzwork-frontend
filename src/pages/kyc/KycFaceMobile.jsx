// src/pages/kyc/KycFaceMobile.jsx
// Bu sahifa faqat mobil telefon uchun — auth kerak emas
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { checkFaceToken, submitFaceSelfie } from "../../api/kyc";
import { uploadImage } from "../../api/common";
import "./kyc-face-mobile.css";

export default function KycFaceMobile() {
  const { token } = useParams();

  const [phase, setPhase] = useState("loading"); // loading | ready | camera | preview | uploading | success | error | expired
  const [errorMsg, setErrorMsg] = useState("");
  const [capturedImage, setCapturedImage] = useState(null); // base64
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 1. Token tekshirish
  useEffect(() => {
    checkFaceToken(token).then((res) => {
      if (res?.data?.status === "completed") {
        setPhase("success");
      } else if (res?.success) {
        setPhase("ready");
      } else {
        setPhase("expired");
        setErrorMsg(res?.message || "Token yaroqsiz.");
      }
    });
  }, [token]);

  // Kamerani yoqish
  const startCamera = async () => {
    setPhase("camera");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setPhase("error");
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "Kamera ruxsati rad etildi. Brauzer sozlamalaridan ruxsat bering."
          : "Kamera ochilmadi: " + err.message
      );
    }
  };

  // Kamerani o'chirish
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  // Selfie tushirish
  const takeSelfie = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    // Mirror effect (selfie kabi)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    setPhase("preview");
  };

  // Qayta olish
  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Selfie ni backendga yuborish
  const confirmAndSubmit = async () => {
    setPhase("uploading");
    try {
      // base64 → Blob → FormData
      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await uploadImage(formData);
      const imageUrl = uploadRes?.data?.url || uploadRes?.url;

      if (!imageUrl) throw new Error("Rasm yuklanmadi.");

      const submitRes = await submitFaceSelfie(token, imageUrl);
      if (submitRes?.success) {
        setPhase("success");
      } else {
        throw new Error(submitRes?.message || "Xato yuz berdi.");
      }
    } catch (err) {
      setPhase("error");
      setErrorMsg(err.message);
    }
  };

  // Cleanup
  useEffect(() => () => stopCamera(), []);

  return (
    <div className="kfm-root">
      {/* LOADING */}
      {phase === "loading" && (
        <div className="kfm-center">
          <div className="kfm-spinner" />
          <p>Tekshirilmoqda...</p>
        </div>
      )}

      {/* EXPIRED */}
      {phase === "expired" && (
        <div className="kfm-center kfm-error-state">
          <div className="kfm-icon kfm-icon--error">⏱</div>
          <h2>Muddat tugagan</h2>
          <p>{errorMsg}</p>
          <small>Kompyuterda yangi QR kod oling va qayta urinib ko'ring.</small>
        </div>
      )}

      {/* ERROR */}
      {phase === "error" && (
        <div className="kfm-center kfm-error-state">
          <div className="kfm-icon kfm-icon--error">⚠️</div>
          <h2>Xato yuz berdi</h2>
          <p>{errorMsg}</p>
          <button className="kfm-btn kfm-btn--outline" onClick={() => setPhase("ready")}>
            Qayta urinish
          </button>
        </div>
      )}

      {/* SUCCESS */}
      {phase === "success" && (
        <div className="kfm-center kfm-success-state">
          <div className="kfm-icon kfm-icon--success">✅</div>
          <h2>Muvaffaqiyatli!</h2>
          <p>Yuzingiz tasdiqlandi. Kompyuter sahifasiga qaytishingiz mumkin.</p>
          <small>Bu oynani yopishingiz mumkin.</small>
        </div>
      )}

      {/* READY — tushuntirish */}
      {phase === "ready" && (
        <div className="kfm-page">
          <div className="kfm-header">
            <div className="kfm-logo">UzWork KYC</div>
          </div>
          <div className="kfm-content">
            <div className="kfm-icon kfm-icon--blue">🛡️</div>
            <h1>Yuzni tasdiqlash</h1>
            <p>Old kamera yonadi va siz selfie tushirasiz. Bu shaxsingizni tasdiqlash uchun kerak.</p>

            <div className="kfm-tips">
              <div className="kfm-tip">💡 Yaxshi yorug'lik joyda o'tiring</div>
              <div className="kfm-tip">📸 Yuzingiz to'liq ko'rinsin</div>
              <div className="kfm-tip">😐 Neytral ifoda bilan qarang</div>
            </div>

            <button className="kfm-btn kfm-btn--primary" onClick={startCamera}>
              📷 Kamerani yoqish
            </button>
          </div>
        </div>
      )}

      {/* CAMERA */}
      {phase === "camera" && (
        <div className="kfm-camera-page">
          <div className="kfm-camera-header">
            <button className="kfm-back" onClick={() => { stopCamera(); setPhase("ready"); }}>
              ← Orqaga
            </button>
            <span>Selfie tushiring</span>
          </div>

          <div className="kfm-video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="kfm-video"
            />
            <div className="kfm-face-guide">
              <div className="kfm-face-oval" />
              <span className="kfm-face-label">Yuzingizni oval ichiga joylashtiring</span>
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="kfm-shutter-row">
            <button className="kfm-shutter" onClick={takeSelfie}>
              <span className="kfm-shutter-inner" />
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {phase === "preview" && (
        <div className="kfm-preview-page">
          <div className="kfm-camera-header">
            <button className="kfm-back" onClick={retake}>← Qayta olish</button>
            <span>Selfie ko'rib chiqing</span>
          </div>

          <div className="kfm-preview-img-wrapper">
            <img src={capturedImage} alt="Selfie" className="kfm-preview-img" />
          </div>

          <div className="kfm-preview-actions">
            <button className="kfm-btn kfm-btn--outline" onClick={retake}>
              🔄 Qayta tushirish
            </button>
            <button className="kfm-btn kfm-btn--primary" onClick={confirmAndSubmit}>
              ✅ Tasdiqlash
            </button>
          </div>
        </div>
      )}

      {/* UPLOADING */}
      {phase === "uploading" && (
        <div className="kfm-center">
          <div className="kfm-spinner" />
          <p>Yuborilmoqda...</p>
          <small>Iltimos kuting</small>
        </div>
      )}
    </div>
  );
}
