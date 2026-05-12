// src/api/jobs.js
import api from "./auth";

// ===================== PROJECTS / JOBS =====================

/** Barcha ishlarni olish (public) */
export const getJobs = async (params = {}) => {
  try {
    const res = await api.get("/projects", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bitta ish detail (public) */
export const getJobById = async (id) => {
  try {
    const res = await api.get(`/projects/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

export const getMyJobs = async (params = {}) => {
  try {
    const userStr = localStorage.getItem("user");
    const activeRole = userStr ? JSON.parse(userStr)?.role : null;
    const finalParams = activeRole ? { role: activeRole, ...params } : params;
    const res = await api.get("/projects/my", { params: finalParams });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Tavsiya etilgan ishlar (freelancer uchun) */
export const getRecommendedJobs = async (params = {}) => {
  try {
    const res = await api.get("/projects/recommended", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Saqlangan ishlar */
export const getSavedJobs = async (params = {}) => {
  try {
    const res = await api.get("/projects/saved", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Ish yaratish (client) */
export const createJob = async (payload) => {
  try {
    const res = await api.post("/projects", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Ishni yangilash (client/admin) */
export const updateJob = async (id, payload) => {
  try {
    const res = await api.put(`/projects/${id}`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Ishni o'chirish (client/admin) */
export const deleteJob = async (id) => {
  try {
    const res = await api.delete(`/projects/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Ishni boost (client) */
export const boostJob = async (id) => {
  try {
    const res = await api.post(`/projects/${id}/boost`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Ishni saqlash / unsave */
export const saveJob = async (id) => {
  try {
    const res = await api.post(`/projects/${id}/save`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Ishni xabar berish (report) */
export const reportJob = async (id, payload) => {
  try {
    const res = await api.post(`/projects/${id}/report`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
