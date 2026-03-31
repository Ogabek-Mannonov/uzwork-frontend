// src/api/ratings.js
import api from "./auth";

// ===================== REVIEWS / RATINGS =====================

/** Barcha reytinglar (public) */
export const getReviews = async (params = {}) => {
  try {
    const res = await api.get("/reviews", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bitta reyting (public) */
export const getReviewById = async (id) => {
  try {
    const res = await api.get(`/reviews/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Foydalanuvchi reytinglari (public) */
export const getUserReviews = async (userId) => {
  try {
    const res = await api.get(`/reviews/user/${userId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Reyting qo'shish */
export const createReview = async (payload) => {
  try {
    const res = await api.post("/reviews", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Reytingni yangilash */
export const updateReview = async (id, payload) => {
  try {
    const res = await api.put(`/reviews/${id}`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
