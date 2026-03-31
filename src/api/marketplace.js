// src/api/marketplace.js
import api from "./auth";

// ===================== MARKETPLACE =====================

/** Marketplace mahsulotlari (public) */
export const getMarketplace = async (params = {}) => {
  try {
    const res = await api.get("/marketplace", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Kategoriyalar (public) */
export const getMarketplaceCategories = async () => {
  try {
    const res = await api.get("/marketplace/categories");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bitta mahsulot (public) */
export const getProductById = async (id) => {
  try {
    const res = await api.get(`/marketplace/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Mahsulot yaratish (freelancer) */
export const createProduct = async (payload) => {
  try {
    const res = await api.post("/marketplace", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Mahsulot sotib olish */
export const buyProduct = async (id) => {
  try {
    const res = await api.post(`/marketplace/${id}/buy`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
