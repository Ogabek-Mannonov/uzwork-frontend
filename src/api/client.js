// src/api/client.js
import api from "./auth";

// ===================== CLIENTS =====================

/** Barcha clientlar (public) */
export const getClients = async (params = {}) => {
  try {
    const res = await api.get("/clients", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bitta client (public) */
export const getClientById = async (id) => {
  try {
    const res = await api.get(`/clients/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Mening profilimni yangilash (client) */
export const updateClientProfile = async (payload) => {
  try {
    const res = await api.put("/clients/me", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
