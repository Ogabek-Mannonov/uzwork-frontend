// src/api/messages.js
import api from "./auth";

// ===================== MESSAGES / CHATS =====================

/** Barcha chatlar */
export const getChats = async () => {
  try {
    const res = await api.get("/messages");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Chat tarixi */
export const getChatHistory = async (chatId) => {
  try {
    const res = await api.get(`/messages/${chatId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Xabar yuborish */
export const sendMessage = async (payload) => {
  try {
    const res = await api.post("/messages", payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Xabarlarni o'qilgan deb belgilash */
export const markMessagesAsRead = async (chatId) => {
  try {
    const res = await api.put(`/messages/read/${chatId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Ovozli xabar yuborish */
export const sendVoiceMessage = async (chatId, formData) => {
  try {
    const res = await api.post(`/messages/${chatId}/voice`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Video qo'ng'iroq boshlash */
export const startVideoCall = async (chatId) => {
  try {
    const res = await api.post(`/messages/${chatId}/video-call`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Xabarni tahrirlash */
export const editMessage = async (messageId, payload) => {
  try {
    const res = await api.put(`/messages/${messageId}`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Xabarni o'chirish */
export const deleteMessage = async (messageId) => {
  try {
    const res = await api.delete(`/messages/${messageId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
