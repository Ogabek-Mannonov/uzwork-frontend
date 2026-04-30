import { useState, useEffect } from "react";
import { onSocketReady, normalizeUserStatus } from "./useSocket";

/**
 * Foydalanuvchining real-time statusini kuzatish uchun hook.
 * @param {string|number} userId - Kuzatilayotgan foydalanuvchi ID si
 * @returns {object} { isOnline, lastSeen }
 */
export function useUserPresence(userId) {
  const [presence, setPresence] = useState({ isOnline: false, lastSeen: null });

  useEffect(() => {
    if (!userId) return;

    const cleanup = onSocketReady((socket) => {
      // Dastlabki holatni so'rash
      socket.emit("checkStatus", userId);

      const handleStatus = (data) => {
        const status = normalizeUserStatus(data);
        const cleanTargetId = String(userId).trim().toLowerCase();
        const cleanIncomingId = String(status.userId).trim().toLowerCase();
        
        console.log(`[presence-debug] Target: ${cleanTargetId}, Incoming: ${cleanIncomingId}, match: ${cleanTargetId === cleanIncomingId}`);

        if (cleanIncomingId === cleanTargetId) {
          setPresence({
            isOnline: status.isOnline,
            lastSeen: status.lastSeen
          });
        }
      };

      socket.on("userStatus", handleStatus);
      return () => {
        socket.off("userStatus", handleStatus);
      };
    });

    return cleanup;
  }, [userId]);

  return presence;
}

/**
 * Bir nechta foydalanuvchilar statusini bitta ro'yxatda boshqarish uchun hook.
 */
export function useUsersPresence(userIds = []) {
  const [presenceMap, setPresenceMap] = useState({});

  useEffect(() => {
    if (!userIds || userIds.length === 0) return;

    const cleanup = onSocketReady((socket) => {
      // Barcha ID lar uchun statusni so'rash
      userIds.forEach(id => {
        if (id) socket.emit("checkStatus", id);
      });

      const handleStatus = (data) => {
        const status = normalizeUserStatus(data);
        setPresenceMap(prev => ({
          ...prev,
          [String(status.userId).toLowerCase()]: {
            isOnline: status.isOnline,
            lastSeen: status.lastSeen
          }
        }));
      };

      socket.on("userStatus", handleStatus);
      return () => {
        socket.off("userStatus", handleStatus);
      };
    });

    return cleanup;
  }, [JSON.stringify(userIds)]);

  return presenceMap;
}
