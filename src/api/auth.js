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
  // Mock responses for specific endpoints
  if (config.url === "/profiles/security") {
    return Promise.resolve({
      data: {
        success: true,
        data: {
          twoFactorEnabled: false,
          biometricEnabled: false,
          loginNotifications: true,
          sessionTimeout: true,
          passwordStrength: "strong",
          lastPasswordChange: "2024-01-15",
          activeSessions: [
            {
              id: 1,
              device: "Windows PC - Chrome",
              browser: "Chrome 120.0",
              os: "Windows 11",
              location: "Tashkent, Uzbekistan",
              ip: "192.168.1.1",
              lastActive: "Now",
              current: true
            },
            {
              id: 2,
              device: "iPhone 14 Pro",
              browser: "Safari 17.0",
              os: "iOS 17.2",
              location: "Tashkent, Uzbekistan",
              ip: "192.168.1.2",
              lastActive: "2 hours ago",
              current: false
            }
          ]
        }
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config
    });
  }
  if (config.url === "/freelancers/security/portfolio") {
    return Promise.resolve({
      data: {
        success: true,
        data: [
          {
            id: 1,
            title: "E-commerce Website",
            description: "Full-stack e-commerce platform with React and Node.js",
            technologies: ["React", "Node.js", "MongoDB"],
            image: "https://via.placeholder.com/300x200",
            link: "https://example.com"
          },
          {
            id: 2,
            title: "Mobile App",
            description: "Cross-platform mobile app using React Native",
            technologies: ["React Native", "Firebase"],
            image: "https://via.placeholder.com/300x200",
            link: "https://example.com"
          }
        ]
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config
    });
  }
  if (config.url === "/freelancers/security/certifications") {
    return Promise.resolve({
      data: {
        success: true,
        data: [
          {
            id: 1,
            name: "AWS Certified Developer",
            issuer: "Amazon Web Services",
            issueDate: "2023-06-15",
            expiryDate: "2026-06-15",
            credentialId: "AWS-DEV-123456",
            file: "https://via.placeholder.com/300x200"
          },
          {
            id: 2,
            name: "Google Cloud Professional",
            issuer: "Google Cloud",
            issueDate: "2023-08-20",
            expiryDate: "2026-08-20",
            credentialId: "GC-PRO-789012",
            file: "https://via.placeholder.com/300x200"
          }
        ]
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config
    });
  }

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
