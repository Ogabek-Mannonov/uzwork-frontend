// src/api/contracts.js
import api from "./auth";

// ===================== CONTRACTS =====================

/** Barcha kontraktlar (public) */
export const getContracts = async (params = {}) => {
  try {
    const res = await api.get("/contracts", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Mening kontraktlarim */
export const getMyContracts = async () => {
  try {
    const res = await api.get("/contracts/my");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Kontrakt detail */
export const getContractById = async (id) => {
  try {
    const res = await api.get(`/contracts/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Kontraktni yangilash */
export const updateContract = async (id, payload) => {
  try {
    const res = await api.put(`/contracts/${id}`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Milestoneni yangilash */
export const updateMilestone = async (id, payload) => {
  try {
    const res = await api.put(`/contracts/${id}/milestone`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Kontraktni yakunlash (client) */
export const completeContract = async (id) => {
  try {
    const res = await api.post(`/contracts/${id}/complete`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Kontraktni bekor qilish */
export const cancelContract = async (id, payload) => {
  try {
    const res = await api.post(`/contracts/${id}/cancel`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Kontrakt bo'yicha nizoni ochish */
export const createContractDispute = async (id, payload) => {
  try {
    const res = await api.post(`/contracts/${id}/dispute`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
