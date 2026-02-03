// src/api/auth.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // kerak bo‘lsa (hozircha zarar qilmaydi)
});

// Access token ni headerga qo‘shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const saveTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const signup = async (payload) => {
  const res = await api.post("/auth/signup", payload);

  // Backend: { success, data: { user, accessToken, refreshToken } }
  const { data } = res.data || {};
  if (data?.accessToken) saveTokens(data);

  return res.data; // res.data.success, res.data.data.user...
};

export const login = async (payload) => {
  const res = await api.post("/auth/login", payload);

  const { data } = res.data || {};
  if (data?.accessToken) saveTokens(data);

  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const logout = async () => {
  // backend logout hozir tokenni invalid qilmaydi, ammo UI uchun yetarli
  try {
    await api.post("/auth/logout");
  } catch (e) {}
  clearTokens();
};

export default api;
