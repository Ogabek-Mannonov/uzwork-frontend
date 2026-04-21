// src/hooks/useSocket.js
import { io } from "socket.io-client";

const VITE_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";
const SOCKET_URL = VITE_URL.replace(/\/api$/, "");

let globalSocket = null;

/**
 * Foydalanuvchi ID sini serverga yuboradi (joinUser).
 * Socket connect yoki reconnect bo'lganda chaqiriladi.
 */
function emitJoinUser(socket) {
  try {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return;
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const u = JSON.parse(userStr);
    if (u && u.id) {
      socket.emit("joinUser", u.id);
      console.log("📡 joinUser emitted for:", u.id);
    }
  } catch (e) {
    console.warn("emitJoinUser error:", e);
  }
}

export function normalizeUserStatus(data) {
  return {
    userId: data?.userId ?? data?.user_id ?? null,
    isOnline: Boolean(data?.isOnline ?? data?.is_online ?? data?.online),
    lastSeen: data?.lastSeen ?? data?.last_seen ?? null,
  };
}

/**
 * Singleton socket instance qaytaradi.
 * Agar socket yo'q yoki disconnect bo'lgan bo'lsa, yangi yaratadi.
 */
export const getSocket = () => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  if (globalSocket?.connected) return globalSocket;
  if (globalSocket) return globalSocket;

  globalSocket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1500,
    timeout: 10000,
  });

  globalSocket.on("connect", () => {
    console.log("✅ Socket connected:", globalSocket.id);
    emitJoinUser(globalSocket);
  });

  // Re-join when auth changes (login/logout/switch role)
  if (typeof window !== "undefined") {
    window.addEventListener("authChange", () => {
      if (globalSocket?.connected) {
        console.log("🔄 Auth change detected, re-emitting joinUser...");
        emitJoinUser(globalSocket);
      }
    });
  }

  globalSocket.on("connect_error", (err) => {
    console.warn("⚠️ Socket connect error:", err.message);
  });

  globalSocket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
    if (reason === "io server disconnect") {
      globalSocket = null;
    }
  });

  return globalSocket;
};

export const onSocketReady = (callback) => {
  const socket = getSocket();
  let cleanup = null;

  const onConnect = () => {
    cleanup = callback(socket);
  };

  if (socket.connected) {
    onConnect();
  } else {
    socket.once("connect", onConnect);
  }

  return () => {
    socket.off("connect", onConnect);
    if (typeof cleanup === "function") {
      cleanup();
    }
  };
};

export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
};

export default getSocket;
