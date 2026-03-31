// src/api/ai.js
import api from "./auth";

// ===================== AI =====================

/** Ish moslashtirish (freelancer uchun) */
export const jobMatch = async (payload) => {
  try {
    const res = await api.post("/ai/job-match", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Tarjima */
export const aiTranslate = async (payload) => {
  try {
    const res = await api.post("/ai/translate", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Portfolio generatsiya */
export const generatePortfolio = async (payload) => {
  try {
    const res = await api.post("/ai/portfolio-generate", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Taklif yozuvchisi */
export const proposalWriter = async (payload) => {
  try {
    const res = await api.post("/ai/proposal-writer", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Taklif bahosi */
export const proposalScore = async (payload) => {
  try {
    const res = await api.post("/ai/proposal-score", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
