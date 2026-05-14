// src/api/kyc.js
import api from "./auth";

/**
 * KYC hujjatlarini topshirish
 */
export const submitKyc = async (data) => {
  try {
    const res = await api.post("/kyc/submit", data);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/**
 * O'z KYC holatini olish
 */
export const getKycStatus = async () => {
  try {
    const res = await api.get("/kyc/status");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/**
 * Admin: KYC so'rovlari ro'yxati
 */
export const getKycList = async ({ status = "pending", limit = 20, offset = 0 } = {}) => {
  try {
    const res = await api.get("/kyc/admin/list", { params: { status, limit, offset } });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/**
 * Admin: KYC ni tasdiqlash
 */
export const approveKyc = async (submissionId) => {
  try {
    const res = await api.post(`/kyc/admin/${submissionId}/approve`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/**
 * Admin: KYC ni rad etish
 */
export const rejectKyc = async (submissionId, reason) => {
  try {
    const res = await api.post(`/kyc/admin/${submissionId}/reject`, { reason });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

// ─── Face Verification ────────────────────────────────────────────────────────

/**
 * Desktop: QR session yaratish
 */
export const createFaceSession = async () => {
  try {
    const res = await api.post('/kyc/face/create-session');
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/**
 * Desktop: Session holatini tekshirish (polling)
 */
export const getFaceSessionStatus = async (token) => {
  try {
    const res = await api.get(`/kyc/face/${token}/status`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/**
 * Mobile: Token haqiqiyligini tekshirish (auth kerak emas)
 */
export const checkFaceToken = async (token) => {
  try {
    const res = await api.get(`/kyc/face/${token}/check`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/**
 * Mobile: Selfie yuborish (auth kerak emas)
 */
export const submitFaceSelfie = async (token, selfie_url) => {
  try {
    const res = await api.post(`/kyc/face/${token}/submit`, { selfie_url });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
