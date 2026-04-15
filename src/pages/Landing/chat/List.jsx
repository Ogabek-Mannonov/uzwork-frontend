// src/pages/Landing/chat/List.jsx
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { getChats } from "../../../api/messages";
import { getSocket, onSocketReady, normalizeUserStatus } from "../../../hooks/useSocket";
import i18n from "../../../i18n";
import "./chat.css";

// ── helpers ──────────────────────────────────────────────
const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND}${url}`;
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 0) return "";
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return i18n.t("chat.now", "Hozir");
  if (diffMins < 60) return `${diffMins}${i18n.t("chat.min", "m")}`;
  if (diffHours < 24) return `${diffHours}${i18n.t("chat.hour", "s")}`;
  if (diffDays < 7) return `${diffDays}${i18n.t("chat.day", "k")}`;
  return d.toLocaleDateString(i18n.language === 'uz' ? "uz-UZ" : (i18n.language === 'ru' ? "ru-RU" : "en-US"), { month: "short", day: "numeric" });
}

function Avatar({ user, size = "md" }) {
  const name = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "?"
    : "?";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const src = avatarSrc(user?.avatar_url);

  return (
    <div className={`avatar-circle ${size}`}>
      {src ? (
        <img src={src} alt={name} onError={(e) => (e.target.style.display = "none")} />
      ) : (
        initials
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────
export default function ChatPage() {
  const navigate = useNavigate();
  const { id: activeChatId } = useParams();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ── load chats ─────────
  const loadChats = useCallback(async () => {
    try {
      const res = await getChats();
      if (res?.success !== false) {
        const raw = res?.data?.chats || res?.chats || res?.data || res || [];
        setChats(Array.isArray(raw) ? raw : []);
      }
    } catch (e) {
      console.error("Load chats error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Real-time yangilash - har 30 soniyada chatsni yangilab last_seen ni yangilab turadi
  useEffect(() => {
    const interval = setInterval(() => {
      setChats(prev => [...prev]);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load chats完成后, har bir partner uchun statusni Socket orqali so'rash (Telegram kabi)
  useEffect(() => {
    if (chats.length === 0) return;

    const cleanup = onSocketReady((socket) => {
      chats.forEach((chat) => {
        const partner = chat.partner;
        if (partner?.id) {
          console.log("[presence] checkStatus emit (list):", partner.id);
          socket.emit("checkStatus", partner.id);
        }
      });
    });

    return cleanup;
  }, [chats.length]);

  useEffect(() => {
    const socket = getSocket();
    
    const handleNewMessage = (msg) => {
      // O'zimiz yozgan bo'lsak unread countni oshirmaymiz
      const isOur = String(msg.sender_id) === String(currentUser?.id);
      
      setChats(prev => {
        let found = false;
        const updated = prev.map(chat => {
          const cid = chat.chat_id || chat.id;
          if (String(cid) === String(msg.chat_id)) {
            found = true;
            return {
              ...chat,
              last_message_content: msg.content || msg.message,
              last_message_at: msg.created_at,
              unread_count: isOur ? (chat.unread_count || 0) : (chat.unread_count || 0) + 1
            };
          }
          return chat;
        });

        if (!found) {
          loadChats();
          return prev;
        }

        // To make the most recently updated chat jump to top:
        updated.sort((a, b) => new Date(b.last_message_at || b.chat_created_at) - new Date(a.last_message_at || a.chat_created_at));

        return updated;
      });
    };

    const handleRead = ({ chatId }) => {
      setChats(prev => prev.map(c => {
        const cid = c.chat_id || c.id;
        if (String(cid) === String(chatId)) {
          return { ...c, unread_count: 0 };
        }
        return c;
      }));
    };

    socket.off("newMessage", handleNewMessage);
    socket.off("messagesRead", handleRead);
    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleRead);

    // Sidebar'da online statusni real-vaqtda yangilash
    const handleStatus = (data) => {
      const status = normalizeUserStatus(data);
      console.log("[presence] userStatus received (list):", status);

      setChats(prev => prev.map(c => {
        const partner = c.partner;
        if (partner && String(partner.id) === String(status.userId)) {
          const resolvedLastSeen = status.isOnline
            ? null
            : (status.lastSeen || partner.last_seen || partner.lastSeen || new Date().toISOString());

          return {
            ...c,
            partner: {
              ...partner,
              is_online: status.isOnline,
              last_seen: resolvedLastSeen
            }
          };
        }
        return c;
      }));
    };
    socket.off("userStatus", handleStatus);
    socket.on("userStatus", handleStatus);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleRead);
      socket.off("userStatus", handleStatus);
    };
  }, [currentUser?.id, loadChats]);

  // ── helpers ──────────────
  const getPartner = (chat) => chat.partner || null;

  const getPartnerName = (chat) => {
    const p = getPartner(chat);
    if (!p) return i18n.t("chat.unknown", "Noma'lum");
    const full = `${p.first_name || ""} ${p.last_name || ""}`.trim();
    return full || p.username || i18n.t("chat.user", "Foydalanuvchi");
  };

  const getChatType = (chat) => {
    if (chat.contract_id) return i18n.t("chat.contract", "Shartnoma");
    if (chat.job_id) return i18n.t("chat.job", "Ish");
    return null;
  };

  const filteredChats = useMemo(() => {
    return chats.filter((c) => {
      if (!search) return true;
      const name = getPartnerName(c).toLowerCase();
      return name.includes(search.toLowerCase());
    });
  }, [chats, search, i18n.language]);

  const totalUnread = chats.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  const openChat = (chatId) => {
    setSidebarOpen(false);
    navigate(`/messages/${chatId}`);
  };

  // ── render ───────────────
  return (
    <div className="chat-wrapper">
      {/* ── SIDEBAR ── */}
      <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="chat-sidebar-header">
          <h1 className="chat-sidebar-title">
            {i18n.t("chat.messages", "Xabarlar")}
            {totalUnread > 0 && (
              <span
                className="unread-badge"
                style={{ display: "inline-flex", marginLeft: 10, width: "auto", borderRadius: 12, padding: "0 8px" }}
              >
                {totalUnread}
              </span>
            )}
          </h1>
          <div className="chat-search-box">
            <span className="chat-search-icon">🔍</span>
            <input
              type="text"
              placeholder={i18n.t("chat.search", "Qidirish...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="chat-list">
          {loading ? (
            <div className="chat-skeleton">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-avatar" />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="skeleton-bubble" style={{ height: 14, width: "60%", borderRadius: 6 }} />
                    <div className="skeleton-bubble" style={{ height: 12, width: "80%", borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="chat-list-empty">
              <div className="chat-list-empty-icon">💬</div>
              <p>{search ? i18n.t("chat.notFound", "Topilmadi") : i18n.t("chat.noChatsYet", "Hali chatlar yo'q")}</p>
            </div>
          ) : (
              filteredChats.map((chat) => {
                const cid = chat.chat_id || chat.id;
                const partner = getPartner(chat);
                const type = getChatType(chat);
                const isActive = String(cid) === String(activeChatId);
                const hasUnread = chat.unread_count > 0;

              return (
                <div
                  key={cid}
                  className={`chat-item ${isActive ? "active" : ""}`}
                  onClick={() => openChat(cid)}
                >
                  <div className="chat-item-avatar">
                    <Avatar user={partner} size="md" />
                  </div>

                  <div className="chat-item-info">
                    <div className="chat-item-top">
                      <span className="chat-item-name">{getPartnerName(chat)}</span>
                      <span className="chat-item-time">
                        {formatTime(chat.last_message_at || chat.chat_created_at)}
                      </span>
                    </div>
                    <div className="chat-item-bottom">
                      <span className={`chat-item-preview ${hasUnread ? "unread" : ""}`}>
                        {chat.last_message_content
                          ? chat.last_message_content.slice(0, 38) +
                            (chat.last_message_content.length > 38 ? "…" : "")
                          : i18n.t("chat.noMessagesOut", "Xabar yo'q")}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {type && <span className="chat-item-badge">{type}</span>}
                        {hasUnread && (
                          <span className="unread-badge">{chat.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ── CHAT AREA ── */}
      <main className="chat-area">
        {!activeChatId ? (
          <div className="chat-empty-state">
            <div className="chat-empty-state-icon">💬</div>
            <h2>{i18n.t("chat.selectChat", "Suhbat tanlang")}</h2>
            <p>{i18n.t("chat.chooseFromLeft", "Chap tarafdan chatni tanlang yoki yangi muloqot boshlang")}</p>
          </div>
        ) : (
          <Outlet context={{ onBack: () => setSidebarOpen(true), reloadList: loadChats }} />
        )}
      </main>
    </div>
  );
}

