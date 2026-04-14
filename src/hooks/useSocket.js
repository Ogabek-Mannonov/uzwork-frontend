// src/hooks/useSocket.js
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

let globalSocket = null;

/**
 * Returns a singleton socket instance.
 * Re-creates if token changed.
 */
export const getSocket = () => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  if (globalSocket?.connected) return globalSocket;

  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }

  globalSocket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
    timeout: 10000,
  });

  globalSocket.on("connect", () => {
    console.log("✅ Socket connected:", globalSocket.id);
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (token) {
        // Find user from local storage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u && u.id) {
            globalSocket.emit("joinUser", u.id);
          }
        }
      }
    } catch(e) {}
  });

  globalSocket.on("connect_error", (err) => {
    console.warn("⚠️ Socket connect error:", err.message);
  });

  globalSocket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  return globalSocket;
};

export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
};

export default getSocket;
