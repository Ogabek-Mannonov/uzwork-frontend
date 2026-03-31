// src/api/freelancer.js
import api from "./auth";

// ===================== FREELANCERS =====================

/** Barcha freelancerlar (public) */
export const getFreelancers = async (params = {}) => {
  try {
    const res = await api.get("/freelancers", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Tavsiya etilgan freelancerlar (public) */
export const getRecommendedFreelancers = async () => {
  try {
    const res = await api.get("/freelancers/recommended");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bitta freelancer (public) */
export const getFreelancerById = async (id) => {
  try {
    const res = await api.get(`/freelancers/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Saqlangan freelancerlar (client/admin) */
export const getSavedFreelancers = async () => {
  try {
    const res = await api.get("/freelancers/saved");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Freelancerni saqlash (client/admin) */
export const saveFreelancer = async (id) => {
  try {
    const res = await api.post(`/freelancers/${id}/save`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Premium aktivatsiya (freelancer) */
export const activatePremium = async () => {
  try {
    const res = await api.post("/freelancers/premium");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** AI portfolio generatsiya (freelancer) */
export const aiPortfolio = async (payload) => {
  try {
    const res = await api.post("/freelancers/me/ai-portfolio", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** CV yuklash (freelancer) */
export const uploadCv = async (formData) => {
  try {
    const res = await api.post("/freelancers/me/cv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** CV o'chirish (freelancer) */
export const deleteCv = async () => {
  try {
    const res = await api.delete("/freelancers/me/cv");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Mening portfoliom (freelancer) */
export const getMyPortfolio = async () => {
  try {
    const res = await api.get("/freelancers/me/portfolio");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Freelancer portfolio (public) */
export const getPublicPortfolio = async (freelancerId) => {
  try {
    const res = await api.get(`/freelancers/${freelancerId}/portfolio`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Portfolio element yaratish (freelancer) */
export const createPortfolioItem = async (payload) => {
  try {
    const res = await api.post("/freelancers/me/portfolio", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Portfolio element yangilash (freelancer) */
export const updatePortfolioItem = async (itemId, payload) => {
  try {
    const res = await api.put(`/freelancers/me/portfolio/${itemId}`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Portfolio element o'chirish (freelancer) */
export const deletePortfolioItem = async (itemId) => {
  try {
    const res = await api.delete(`/freelancers/me/portfolio/${itemId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Portfolio mediasi qo'shish (freelancer) */
export const addPortfolioMedia = async (itemId, formData) => {
  try {
    const res = await api.post(`/freelancers/me/portfolio/${itemId}/media`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Portfolio mediasini o'chirish (freelancer) */
export const deletePortfolioMedia = async (itemId, mediaId) => {
  try {
    const res = await api.delete(`/freelancers/me/portfolio/${itemId}/media/${mediaId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
