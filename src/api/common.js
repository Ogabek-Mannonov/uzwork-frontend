// src/api/common.js
import api from "./auth";

// ===================== PROFILE =====================

/** Mening profilim */
export const getMyProfile = async () => {
  try {
    const res = await api.get("/profiles/me");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Foydalanuvchi profili (public) */
export const getUserProfile = async (userId) => {
  try {
    const res = await api.get(`/profiles/${userId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Profilni yangilash */
export const updateMyProfile = async (payload) => {
  try {
    const res = await api.put("/profiles/me", payload);
    return res?.data;
  } catch (err) {
    // [FIX]: Backenddan qaytgan aniq xatolikni (masalan SQL missing column xatosi) ko'rsatish uchun "error" pole'sini ham uzatdik.
    return { 
      success: false, 
      message: err?.response?.data?.message || err?.message, 
      error: err?.response?.data?.error 
    };
  }
};

// ===================== SEARCH =====================

/** Global qidiruv */
export const search = async (query) => {
  try {
    const res = await api.get("/search", { params: { q: query } });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

// ===================== NOTIFICATIONS =====================

/** Bildirishnomalar */
export const getNotifications = async () => {
  try {
    const res = await api.get("/notifications");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bildirishnomani o'qilgan deb belgilash */
export const markNotificationRead = async (id) => {
  try {
    const res = await api.put(`/notifications/${id}/read`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

// ===================== RATINGS =====================

/** Reyting qo'shish */
export const createReview = async (payload) => {
  try {
    const res = await api.post("/reviews", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Reytinglarni olish */
export const getReviews = async (params = {}) => {
  try {
    const res = await api.get("/reviews", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

// ===================== DISPUTES =====================

/** Nizo ochish */
export const createDispute = async (payload) => {
  try {
    const res = await api.post("/disputes", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Mening nizolarim */
export const getMyDisputes = async () => {
  try {
    const res = await api.get("/disputes/my");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

// ===================== UPLOAD =====================

/** Fayl yuklash */
export const uploadFile = async (formData) => {
  try {
    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
