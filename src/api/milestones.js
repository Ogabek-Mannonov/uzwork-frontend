// src/api/milestones.js
import api from "./auth";

/** Freelancer ishni topshirishi */
export const submitMilestone = async (id, payload) => {
  try {
    const res = await api.post(`/milestones/${id}/submit`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Mijoz ishni qabul qilishi */
export const approveMilestone = async (id, payload) => {
  try {
    const res = await api.post(`/milestones/${id}/approve`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** To'lovni amalga oshirish (escrow release) */
export const releaseMilestone = async (id, payload) => {
  try {
    const res = await api.post(`/milestones/${id}/release`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};

/** Mijoz ishni rad etishi (tuzatish so'rashi) */
export const rejectMilestone = async (id, payload) => {
  try {
    const res = await api.post(`/milestones/${id}/reject`, payload);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
