// src/api/auth.js
import axios from "axios";
import { disconnectSocket } from "../hooks/useSocket";

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

// --- Silent Refresh Logic ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 xatosi va bu so'rov hali qayta urinilmagan bo'lsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Agar hozirda token yangilanayotgan bo'lsa, so'rovni navbatga qo'yamiz
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        clearAuth();
        return Promise.reject(error);
      }

      try {
        // Tokenni yangilash so'rovi
        // Eslatma: 'api' emas, axios yoki boshqa instance ishlatish tavsiya qilinadi 
        // interseptor cheksiz aylanib qolmasligi uchun. 
        // Lekin bizda /auth/refresh ochiq bo'lishi kerak.
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        saveAuth({ 
            accessToken, 
            refreshToken: newRefreshToken, 
            user: JSON.parse(localStorage.getItem("user")) 
        });

        api.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        // ixtiyoriy: window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
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
    disconnectSocket();
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

/* ===================== ✅ CHANGE PASSWORD ===================== */

/**
 * Change password for logged in user:
 * payload: { current_password, new_password, confirm_password }
 */
export const changePassword = async (payload) => {
  try {
    const res = await api.post("/auth/change-password", payload);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Server error" };
  }
};

/* ===================== ✅ SESSIONS ===================== */

export const getSessions = async () => {
  try {
    const res = await api.get("/auth/sessions");
    return unwrap(res);
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const revokeSession = async (id) => {
  try {
    const res = await api.delete(`/auth/sessions/${id}`);
    return unwrap(res);
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

/* ===================== ✅ SECURITY SETTINGS ===================== */

export const getSecuritySettings = async () => {
  try {
    const res = await api.get("/auth/security-settings");
    return unwrap(res);
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const enable2FA = async (payload) => {
  try {
    const res = await api.post("/auth/2fa/enable", payload);
    return unwrap(res);
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const confirm2FA = async (code) => {
  try {
    const res = await api.post("/auth/2fa/confirm", { code });
    return unwrap(res);
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const disable2FA = async () => {
  try {
    const res = await api.post("/auth/2fa/disable");
    return unwrap(res);
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const verify2FALogin = async (payload) => {
  try {
    const res = await api.post("/auth/2fa/verify-login", payload);
    const body = unwrap(res);
    const data = body?.data;
    if (data?.accessToken || data?.user) saveAuth(data);
    return body;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

/* ===================================================================== */

export default api;
