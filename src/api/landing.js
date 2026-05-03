// src/api/landing.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Landing page uchun barcha real datani olish:
 * - Top freelancerlar
 * - Featured jobs
 * - Popular skills
 * - Platform statistika
 * - Latest reviews
 */
export const getLandingData = async () => {
  try {
    const res = await axios.get(`${API_URL}/landing`);
    return res?.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err?.message };
  }
};
