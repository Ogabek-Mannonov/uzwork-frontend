// src/api/payments.js
import api from "./auth";

// ===================== PAYMENTS / WALLET =====================

/** Barcha to'lovlar */
export const getPayments = async (params = {}) => {
  try {
    const res = await api.get("/payments", { params });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Balansni olish */
export const getBalance = async () => {
  try {
    const res = await api.get("/payments/balance");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Pul qo'shish (deposit) */
export const deposit = async (payload) => {
  try {
    const res = await api.post("/payments/deposit", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Pul chiqarish (withdraw) */
export const withdraw = async (payload) => {
  try {
    const res = await api.post("/payments/withdraw", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Escrow ushlab turish */
export const escrowHold = async (payload) => {
  try {
    const res = await api.post("/payments/escrow/hold", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Milestone bo'yicha pul chiqarish */
export const releaseMilestone = async (contractId) => {
  try {
    const res = await api.post(`/payments/contracts/${contractId}/release`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bitta to'lov detail */
export const getPaymentDetail = async (id) => {
  try {
    const res = await api.get(`/payments/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Kartalarni olish */
export const getCards = async () => {
  try {
    const res = await api.get("/payments/cards");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Karta qo'shish */
export const addCard = async (payload) => {
  try {
    const res = await api.post("/payments/cards", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Karta o'chirish */
export const deleteCard = async (id) => {
  try {
    const res = await api.delete(`/payments/cards/${id}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
