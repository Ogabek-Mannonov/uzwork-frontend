// src/api/auth.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "";


const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  // Cookie ishlatmasangiz false qiling:
  withCredentials: false,
});

// Access token ni headerga qo‘shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 bo‘lsa tokenni tozalash (ixtiyoriy, lekin foydali)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    return Promise.reject(err);
  }
);

export const saveAuth = ({ user, accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const unwrap = (res) => res?.data; // axios response -> payload

export const signup = async (payload) => {
  try {
    const res = await api.post("/auth/signup", payload);
    const body = unwrap(res);

    const data = body?.data;
    if (data?.accessToken || data?.user) saveAuth(data);

    return body;
  } catch (err) {
    const msg =
      err?.response?.data?.message || err?.message || "Signup request failed";
    return { success: false, message: msg };
  }
};

export const verifySignup = async (payload) => {
  try {
    const res = await api.post("/auth/verify-signup", payload);
    const body = unwrap(res);

    const data = body?.data;
    if (data?.accessToken || data?.user) saveAuth(data);

    return body;
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || "Verify signup failed";
    return { success: false, message: msg };
  }
};

export const login = async (payload) => {
  try {
    const res = await api.post("/auth/login", payload);
    const body = unwrap(res);

    const data = body?.data;
    if (data?.accessToken || data?.user) saveAuth(data);

    return body;
  } catch (err) {
    const msg =
      err?.response?.data?.message || err?.message || "Login request failed";
    return { success: false, message: msg };
  }
};

export const googleLogin = async (payload) => {
  try {
    const res = await api.post("/auth/google", payload);
    const body = unwrap(res);

    const data = body?.data;
    if (data?.accessToken || data?.user) saveAuth(data);

    return body;
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || "Google login failed";
    return { success: false, message: msg };
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/auth/me");
    return unwrap(res);
  } catch (err) {
    const msg =
      err?.response?.data?.message || err?.message || "Me request failed";
    return { success: false, message: msg };
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (e) {
    // ignore
  } finally {
    clearAuth();
  }
};

/* ===================== ✅ FORGOT / RESET PASSWORD ===================== */

/**
 * Forgot password:
 * payload: { email } OR { phone }
 * Backend always returns success message (privacy-friendly)
 */
export const forgotPassword = async (payload) => {
  try {
    const res = await api.post("/auth/forgot-password", payload);
    return unwrap(res);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Forgot-password request failed";
    return { success: false, message: msg };
  }
};

/**
 * Reset password:
 * payload: { identifier, code, new_password }
 * identifier = email yoki phone
 */
export const resetPassword = async (payload) => {
  try {
    const res = await api.post("/auth/reset-password", payload);
    return unwrap(res);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Reset-password request failed";
    return { success: false, message: msg };
  }
};

/* ===================================================================== */

export default api;
