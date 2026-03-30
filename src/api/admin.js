// src/api/admin.js
import api from "./auth";

// ===================== ADMIN =====================

/** Dashboard statistikasi */
export const getDashboardStats = async () => {
  try {
    const res = await api.get("/admin/dashboard");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Barcha foydalanuvchilar */
export const getUsers = async (params = {}) => {
  try {
    const res = await api.get("/admin/users", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bitta foydalanuvchi */
export const getUserById = async (id) => {
  try {
    const res = await api.get(`/admin/users/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Foydalanuvchini yangilash */
export const updateUserByAdmin = async (id, payload) => {
  try {
    const res = await api.put(`/admin/users/${id}`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Foydalanuvchi statusini yangilash */
export const updateUserStatus = async (id, payload) => {
  try {
    const res = await api.patch(`/admin/users/${id}/status`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Admin: barcha ishlar */
export const getAdminJobs = async (params = {}) => {
  try {
    const res = await api.get("/admin/jobs", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Admin: bitta ish */
export const getAdminJobById = async (id) => {
  try {
    const res = await api.get(`/admin/jobs/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Admin: to'lovlar */
export const getAdminPayments = async () => {
  try {
    const res = await api.get("/admin/payments");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Admin: chatlar */
export const getAdminChats = async () => {
  try {
    const res = await api.get("/admin/chats");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
