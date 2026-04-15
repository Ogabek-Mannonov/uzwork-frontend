// src/hooks/useSocket.js
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

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

  // Agar socket mavjud va ulangan bo'lsa, shuni qaytaramiz
  if (globalSocket?.connected) return globalSocket;

  // Agar socket bor lekin ulanmagan (reconnecting) bo'lsa ham shuni qaytaramiz
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

  // Har safar connect bo'lganda (birinchi marta ham, reconnect bo'lganda ham)
  globalSocket.on("connect", () => {
    console.log("✅ Socket connected:", globalSocket.id);
    emitJoinUser(globalSocket);
  });

  globalSocket.on("connect_error", (err) => {
    console.warn("⚠️ Socket connect error:", err.message);
  });

  globalSocket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
    // io server-side disconnect bo'lsa, manually reconnect qilinmaydi,
    // shuning uchun agar server to'xtatgan bo'lsa socket ni null qilamiz
    if (reason === "io server disconnect") {
      globalSocket = null;
    }
  });

  return globalSocket;
};

export const onSocketReady = (callback) => {
  const socket = getSocket();

  if (socket.connected) {
    callback(socket);
    return () => {};
  }

  const handleConnect = () => callback(socket);
  socket.once("connect", handleConnect);

  if (!socket.active) {
    socket.connect();
  }

  return () => {
    socket.off("connect", handleConnect);
  };
};

export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
};

export default getSocket;
