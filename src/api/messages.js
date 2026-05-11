// src/api/messages.js
import api from "./auth";

// ─── CHATS ──────────────────────────────────────────────

/** Barcha chatlarni olish */
export const getChats = async () => {
  try {
    const res = await api.get("/messages");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** O'qilmagan xabarlar sonini olish */
export const getUnreadMessagesCount = async () => {
  try {
    const res = await api.get("/messages/unread/count");
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Bitta chatning tarixini olish */
export const getChatHistory = async (chatId) => {
  try {
    const res = await api.get(`/messages/${chatId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/**
 * Proposal bo'yicha chatni topish yoki yaratish
 */
export const findOrCreateProposalChat = async (proposalId) => {
  try {
    const res = await api.post(`/messages/find-or-create/${proposalId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/**
 * Contract bo'yicha chatni topish yoki yaratish
 */
export const findOrCreateContractChat = async (contractId) => {
  try {
    const res = await api.post(`/messages/find-or-create-by-contract/${contractId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/**
 * Xabar yuborish
 * Backend kutadi: { chat_id, message_text, type?, file_url? }
 */
export const sendMessage = async ({ chat_id, message_text, type = "text", file_url, reply_to_id, metadata }) => {
  try {
    const res = await api.post("/messages", { chat_id, message_text, type, file_url, reply_to_id, metadata });
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

/** Xabarni tahrirlash */
export const editMessage = async (messageId, { content }) => {
  try {
    const res = await api.put(`/messages/${messageId}`, { content });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Xabarni o'chirish (soft delete) */
export const deleteMessage = async (messageId) => {
  try {
    const res = await api.delete(`/messages/${messageId}`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Ovozli xabar uchun maxsus upload */
export const uploadVoice = async (formData) => {
  try {
    const res = await api.post(`/upload/voice`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Umumiy fayllarni (rasm, video, pdf, v.k) yuklash uchun */
export const uploadFile = async (formData) => {
  try {
    const res = await api.post(`/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Video qo'ng'iroq boshlash */
export const startVideoCall = async (chatId, video_call_link) => {
  try {
    const res = await api.post(`/messages/${chatId}/video-call`, { video_call_link });
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
