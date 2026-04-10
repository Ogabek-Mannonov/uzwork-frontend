// src/api/profile.js
import api from "./auth";

/** O'z profilimni olish */
export const getMyProfile = async () => {
  try {
    const res = await api.get("/profiles/me");
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
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Kategoriyalarni olish */
export const getCategories = async () => {
  try {
    const res = await api.get("/profiles/categories");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Boshqa user profilini ko'rish */
export const getUserProfile = async (userId) => {
  try {
    const res = await api.get(`/profiles/${userId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
