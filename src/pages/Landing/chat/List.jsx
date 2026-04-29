// src/pages/Landing/chat/List.jsx
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { getChats } from "../../../api/messages";
import { getSocket, onSocketReady, normalizeUserStatus } from "../../../hooks/useSocket";
import { Search, MessageSquare, Plus, MessageCircle, Pin, PinOff, Bell, BellOff, Volume2, VolumeX, Trash2 } from "lucide-react";
import i18n from "../../../i18n";
import "./chat.css";

// ── helpers ──────────────────────────────────────────────
const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api\/?$/, "");

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND}${path}`;
}

const parseUTC = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  let s = String(raw).trim();
  if (!s) return null;
  // Z bilan tugasa yoki +/-05:00 kabi offset bo'lsa, uni boricha o'qiymiz
  const hasTZ = /[zZ]$/.test(s) || /[+\-]\d{2}(:?\d{2})?$/.test(s);
  if (!hasTZ) {
    s = s.replace(" ", "T");
    if (!s.includes("Z")) s += "Z";
  }
  const d = new Date(s);
  if (isNaN(d.getTime())) {
    return new Date(String(raw).trim());
  }
  return d;
};

function formatTime(dateStr) {
  const d = parseUTC(dateStr);
  if (!d) return "";
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 0) return "";
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return i18n.t("chat.now", "Hozir");
  if (diffMins < 60) return `${diffMins} m.`;
  if (diffHours < 24) return `${diffHours} s.`;
  if (diffDays < 7) {
    const dayLabel = i18n.language === 'uz' ? 'kun' : (i18n.language === 'ru' ? 'д.' : 'd');
    return `${diffDays} ${dayLabel}`;
  }

  const months = {
    uz: ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"],
    ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  };

  const lang = i18n.language || 'uz';
  const monthList = months[lang] || months.en;
  return `${d.getDate()} ${monthList[d.getMonth()]}`;
}

function Avatar({ user, size = "md" }) {
  const [imgError, setImgError] = useState(false);
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
      {src && !imgError ? (
        <img 
          src={src} 
          alt={name} 
          onError={() => setImgError(true)} 
        />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
    </div>
  );
}

// ── Chat Context Menu ─────────────────────────────────────
function ChatContextMenu({ x, y, chat, isPinned, isMuted, onPin, onMute, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [onClose]);

  const style = { position: "fixed", top: y, left: x, zIndex: 1000 };
  if (x + 180 > window.innerWidth) style.left = x - 180;
  if (y + 160 > window.innerHeight) style.top = y - 160;

  return (
    <div ref={ref} className="msg-context-menu" style={style}>
      <div className="msg-context-item" onClick={(e) => { e.stopPropagation(); onPin(!isPinned); onClose(); }}>
        {isPinned ? <PinOff size={16} style={{ marginRight: 10 }} /> : <Pin size={16} style={{ marginRight: 10 }} />}
        {isPinned ? i18n.t("chat.unpin", "Pin-dan olish") : i18n.t("chat.pin", "Pin qilish")}
      </div>
      <div className="msg-context-item" onClick={(e) => { e.stopPropagation(); onMute(!isMuted); onClose(); }}>
        {isMuted ? <Bell size={16} style={{ marginRight: 10 }} /> : <BellOff size={16} style={{ marginRight: 10 }} />}
        {isMuted ? i18n.t("chat.unmute", "Ovozni yoqish") : i18n.t("chat.mute", "Ovozsiz qilish")}
      </div>
      <div className="msg-context-divider" />
      <div className="msg-context-item danger" onClick={(e) => { e.stopPropagation(); onClose(); }}>
        <Trash2 size={16} style={{ marginRight: 10 }} />
        {i18n.t("chat.deleteChat", "Chatni o'chirish")}
      </div>
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
  const [contextMenu, setContextMenu] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [pinnedChats, setPinnedChats] = useState(() => {
    const saved = localStorage.getItem(`pinned_chats_${currentUser?.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [mutedChats, setMutedChats] = useState(() => {
    const saved = localStorage.getItem(`muted_chats_${currentUser?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`pinned_chats_${currentUser?.id}`, JSON.stringify(pinnedChats));
  }, [pinnedChats, currentUser?.id]);

  useEffect(() => {
    localStorage.setItem(`muted_chats_${currentUser?.id}`, JSON.stringify(mutedChats));
  }, [mutedChats, currentUser?.id]);

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
        updated.sort((a, b) => parseUTC(b.last_message_at || b.chat_created_at) - parseUTC(a.last_message_at || a.chat_created_at));

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
    let list = chats.filter((c) => {
      if (!search) return true;
      const name = getPartnerName(c).toLowerCase();
      return name.includes(search.toLowerCase());
    });

    // Pinned chatlarni tepaga chiqaramiz
    return list.sort((a, b) => {
      const aId = a.chat_id || a.id;
      const bId = b.chat_id || b.id;
      const aPinned = pinnedChats.includes(String(aId));
      const bPinned = pinnedChats.includes(String(bId));
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      // Agar ikkalasi ham pin bo'lsa yoki bo'lmasa, vaqt bo'yicha
      const aTime = parseUTC(a.last_message?.created_at || a.created_at || 0);
      const bTime = parseUTC(b.last_message?.created_at || b.created_at || 0);
      return bTime - aTime;
    });
  }, [chats, search, i18n.language, pinnedChats]);

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
          </h1>
          <div className="chat-search-box">
            <span className="chat-search-icon"><Search size={18} strokeWidth={2.5} /></span>
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
              <div className="chat-list-empty-icon"><MessageSquare size={48} strokeWidth={1.5} style={{ opacity: 0.4 }} /></div>
              <p>{search ? i18n.t("chat.notFound", "Topilmadi") : i18n.t("chat.noChatsYet", "Hali chatlar yo'q")}</p>
            </div>
          ) : (
              filteredChats.map((chat) => {
                const cid = chat.chat_id || chat.id;
                const partner = getPartner(chat);
                const type = getChatType(chat);
                const isActive = String(cid) === String(activeChatId);
                const hasUnread = chat.unread_count > 0;
                const isPinned = pinnedChats.includes(String(cid));
                const isMuted = mutedChats.includes(String(cid));

                return (
                  <div
                    key={cid}
                    className={`chat-item ${isActive ? "active" : ""} ${isPinned ? "pinned" : ""}`}
                    onClick={() => openChat(cid)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY, chat });
                    }}
                  >
                    <div className="chat-item-avatar">
                      <Avatar user={partner} size="md" />
                      <span className={`status-dot ${partner?.is_online ? 'online' : 'offline'}`} />
                    </div>

                    <div className="chat-item-info">
                      <div className="chat-item-top">
                        <span className="chat-item-name">
                          {getPartnerName(chat)}
                          {isMuted && <BellOff size={12} className="muted-icon" style={{ marginLeft: 6, opacity: 0.5 }} />}
                        </span>
                        <span className="chat-item-time">
                          {formatTime(chat.last_message_at || chat.chat_created_at || chat.last_message?.created_at || chat.created_at)}
                        </span>
                      </div>
                      <div className="chat-item-bottom">
                        <span className={`chat-item-preview ${hasUnread ? "unread" : ""}`}>
                          {chat.last_message_content || chat.last_message?.message_text || chat.last_message?.content ? (
                            (chat.last_message_content || chat.last_message?.message_text || chat.last_message?.content).slice(0, 38) +
                            ((chat.last_message_content || chat.last_message?.message_text || chat.last_message?.content).length > 38 ? "…" : "")
                          ) : i18n.t("chat.noMessagesOut", "Xabar yo'q")}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {isPinned && <Pin size={12} className="pinned-icon" style={{ opacity: 0.6 }} />}
                          {type && <span className="chat-item-badge">{type}</span>}
                          {hasUnread && (
                            <span className={`chat-unread-badge ${isMuted ? 'muted' : ''}`}>{chat.unread_count}</span>
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
            <div className="chat-empty-state-icon">
              <MessageCircle size={64} strokeWidth={1.5} />
            </div>
            <h2>{i18n.t("chat.selectChat", "Suhbat tanlang")}</h2>
            <p>{i18n.t("chat.chooseFromLeft", "Chap tarafdan chatni tanlang yoki yangi muloqot boshlang")}</p>
          </div>
        ) : (
          <Outlet context={{ 
            onBack: () => { 
              setSidebarOpen(true); 
              navigate("/messages"); 
            }, 
            reloadList: loadChats 
          }} />
        )}
      </main>

      {contextMenu && (
        <ChatContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          chat={contextMenu.chat}
          isPinned={pinnedChats.includes(String(contextMenu.chat.chat_id || contextMenu.chat.id))}
          isMuted={mutedChats.includes(String(contextMenu.chat.chat_id || contextMenu.chat.id))}
          onPin={(pin) => {
            const cid = String(contextMenu.chat.chat_id || contextMenu.chat.id);
            setPinnedChats(prev => pin ? [...prev, cid] : prev.filter(id => id !== cid));
          }}
          onMute={(mute) => {
            const cid = String(contextMenu.chat.chat_id || contextMenu.chat.id);
            setMutedChats(prev => mute ? [...prev, cid] : prev.filter(id => id !== cid));
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

