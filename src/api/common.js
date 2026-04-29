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

// ===================== SKILLS =====================

/** Get Skills */
export const getSkills = async (search = "") => {
  try {
    const res = await api.get("/skills", { params: { search } });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message, skills: [] };
  }
};

// ===================== NOTIFICATIONS =====================

/** Bildirishnomalar */
export const getNotifications = async (params = {}) => {
  try {
    const res = await api.get("/notifications/me", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bildirishnomani o'qilgan deb belgilash */
export const markNotificationRead = async (id) => {
  try {
    const res = await api.post(`/notifications/${id}/mark-as-read`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Barcha bildirishnomalarni o'qilgan deb belgilash */
export const markAllNotificationsRead = async () => {
  try {
    const res = await api.post("/notifications/mark-all-read");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Xabarnoma sozlamalarini olish */
export const getNotificationSettings = async () => {
  try {
    const res = await api.get("/notifications/settings");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Xabarnoma sozlamalarini yangilash */
export const updateNotificationSettings = async (payload) => {
  try {
    const res = await api.put("/notifications/settings", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** O'qilmagan takliflar sonini olish */
export const getUnreadProposalsCount = async () => {
  try {
    const res = await api.get("/notifications/unread-proposals-count");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bildirishnomalarni turi bo'yicha o'qilgan deb belgilandi */
export const markAllNotificationsReadByType = async (typePrefix) => {
  try {
    const res = await api.post("/notifications/mark-all-read-by-type", { typePrefix });
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

/** Rasm yuklash (Avatar, Cover) */
export const uploadImage = async (formData) => {
  try {
    const res = await api.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

// ===================== SECURITY =====================

/** Security settings */
export const getSecuritySettings = async () => {
  // Mock data instead of API call
  return {
    success: true,
    data: {
      twoFactorEnabled: false,
      biometricEnabled: false,
      loginNotifications: true,
      sessionTimeout: true,
      passwordStrength: "strong",
      lastPasswordChange: "2024-01-15",
      activeSessions: [
        {
          id: 1,
          device: "Windows PC - Chrome",
          browser: "Chrome 120.0",
          os: "Windows 11",
          location: "Tashkent, Uzbekistan",
          ip: "192.168.1.1",
          lastActive: "Now",
          current: true
        },
        {
          id: 2,
          device: "iPhone 14 Pro",
          browser: "Safari 17.0",
          os: "iOS 17.2",
          location: "Tashkent, Uzbekistan",
          ip: "192.168.1.2",
          lastActive: "2 hours ago",
          current: false
        }
      ]
    }
  };
};

