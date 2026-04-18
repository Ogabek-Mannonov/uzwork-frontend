// src/pages/Landing/chat/Detail.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import {
  getChatHistory,
  sendMessage,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
  uploadVoice,
} from "../../../api/messages";
import { getSocket, onSocketReady, normalizeUserStatus } from "../../../hooks/useSocket";
import { Smile, Globe, Settings2, X, MoreVertical, Copy, Trash2, Edit3, User, Phone, ArrowLeft, Send, Mic, Download, Paperclip } from "lucide-react";
import i18n from "../../../i18n";
import { useTranslation } from "react-i18next";
import { translateToUzbek, translateBatchToUzbek } from "../../../api/translate_service";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

// ── constants ────────────────────────────────────────────
const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

// --- date/image helpers ---
function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND}${url}`;
}

const parseUTC = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  let s = String(raw).trim();
  if (!s) return null;

  // Z bilan tugasa yoki +/-05:00, +/-0500 kabi offset bo'lsa, uni boricha o'qiymiz
  const hasTZ = /[zZ]$/.test(s) || /[+\-]\d{2}(:?\d{2})?$/.test(s);

  if (!hasTZ) {
    // Agar TZ bo'lmasa, har doim UTC (Z) deb hisoblaymiz
    // Space o'rniga T qo'yamiz va oxiriga Z qo'shamiz
    s = s.replace(" ", "T");
    if (!s.includes("Z")) s += "Z";
  }

  const d = new Date(s);
  // Agar Date noto'g'ri bo'lsa (Z qo'shilgach buzilsa), Z'siz o'qib ko'ramiz
  if (isNaN(d.getTime())) {
    return new Date(String(raw).trim());
  }
  return d;
};

function formatMsgTime(dateStr) {
  const d = parseUTC(dateStr);
  if (!d) return "";
  return d.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(dateStr) {
  const d = parseUTC(dateStr);
  if (!d) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDate.getTime() === today.getTime()) return i18n.t("chat.today", "Bugun");
  if (msgDate.getTime() === yesterday.getTime()) return i18n.t("chat.yesterday", "Kecha");

  return d.toLocaleDateString(i18n.language === 'uz' ? "uz-UZ" : (i18n.language === 'ru' ? "ru-RU" : "en-US"), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatLastSeen(dateStr) {
  const d = parseUTC(dateStr);
  if (!d || isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 0) return "";

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Hozirgina online edi";
  if (diffMins < 60) return `${diffMins} daqiqa oldin online edi`;
  if (diffHours < 24) return `${diffHours} soat oldin online edi`;
  return "";
}

function getMsgText(msg) {
  if (!msg) return "";
  // Check common properties
  const content = msg.content || msg.message || msg.message_text || "";
  if (typeof content === "string") return content;
  // If it's an object, try to find a text field
  return content?.content || content?.message || content?.text || content?.message_text || "";
}

function groupMessagesByDate(m) {
  if (!m || m.length === 0) return [];
  // Sort messages to ensure chronological order for grouping
  const sorted = [...m].sort((a, b) => parseUTC(a.created_at) - parseUTC(b.created_at));

  const groups = [];
  let currentDate = null;
  let currentGroup = null;

  sorted.forEach((msg) => {
    const label = formatDateLabel(msg.created_at);
    if (label !== currentDate) {
      currentDate = label;
      currentGroup = {
        date: label,
        messages: [],
        key: `group-${msg.created_at || Date.now()}-${label}`
      };
      groups.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  });
  return groups;
}

// ── Avatar ───────────────────────────────────────────────
function Avatar({ user, size = "sm" }) {
  const name = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "?"
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
        <img
          src={src}
          alt={name}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        initials
      )}
    </div>
  );
}

// ── Context Menu ─────────────────────────────────────────
const QUICK_EMOJIS = ["🤝", "🔥", "❤️", "👌", "😄", "👍"];

function ContextMenu({ x, y, isOwn, onEdit, onDelete, onCopy, onReply, onTranslate, onReact, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Keep menu inside viewport
  const style = { position: "fixed", top: y, left: x, zIndex: 200 };
  if (x + 220 > window.innerWidth) style.left = x - 220;
  if (y + 220 > window.innerHeight) style.top = y - 200;

  return (
    <div ref={ref} className="msg-context-menu" style={style}>
      {/* Emoji reaction row */}
      <div className="msg-context-emojis">
        {QUICK_EMOJIS.map((emoji) => (
          <button key={emoji} className="emoji-react-btn" onClick={() => { onReact?.(emoji); onClose(); }}>
            {emoji}
          </button>
        ))}
        <button className="emoji-react-btn emoji-more" onClick={onClose}>›</button>
      </div>
      <div className="msg-context-divider" />
      {/* Reply */}
      <div className="msg-context-item" onClick={() => { onReply?.(); onClose(); }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
          <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
        </svg>
        {i18n.t("chat.reply", "Reply")}
      </div>
      <div className="msg-context-item" onClick={onCopy}>
        <Copy size={14} strokeWidth={2.2} style={{ marginRight: 8 }} />
        {i18n.t("chat.copy", "Nusxalash")}
      </div>
      <div className="msg-context-item" onClick={() => { onTranslate?.(); onClose(); }}>
        <Globe size={14} strokeWidth={2.2} style={{ marginRight: 8 }} />
        {i18n.t("chat.translate", "Tarjima qilish")}
      </div>
      {isOwn && (
        <>
          <div className="msg-context-item" onClick={onEdit}>
            <Edit3 size={14} strokeWidth={2.2} style={{ marginRight: 8 }} />
            {i18n.t("chat.edit", "Tahrirlash")}
          </div>
          <div className="msg-context-item danger" onClick={onDelete}>
            <Trash2 size={14} strokeWidth={2.2} style={{ marginRight: 8 }} />
            {i18n.t("chat.delete", "O'chirish")}
          </div>
        </>
      )}
    </div>
  );
}

// ── Custom Audio Player ──────────────────────────────────
function CustomAudioPlayer({ src, isOwn }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const animationRef = useRef(null);

  const updateProgress = useCallback(() => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
    if (audioRef.current && !audioRef.current.paused) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current);
    } else {
      audioRef.current.currentTime = (progress / 100) * (audioRef.current.duration || 0);
      audioRef.current.play();
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    cancelAnimationFrame(animationRef.current);
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const box = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - box.left;
    const ratio = Math.max(0, Math.min(1, clickX / box.width));
    const newTime = ratio * (audioRef.current.duration || duration || 0);
    if (!isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setProgress(ratio * 100);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || !time) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const sizeKB = duration > 0 ? (duration * 3.7).toFixed(1) : "11.8";

  const [waveHeights] = useState(() => {
    const pattern = [25, 30, 45, 80, 70, 40, 25, 20, 20, 50, 90, 85, 60, 40, 25, 20, 30, 20, 20, 35, 75, 95, 85, 50, 40, 25, 20, 20];
    return Array.from({ length: 45 }).map((_, i) => {
      let base = pattern[i % pattern.length];
      let noise = (Math.random() - 0.5) * 20;
      let h = base + noise;
      if (h < 15) h = 15;
      if (h > 100) h = 100;
      return h;
    });
  });

  return (
    <div className={`custom-audio-player ${isOwn ? "sent" : "received"}`}>
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
      />
      <button className="play-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
        {isPlaying ? (
          <span style={{ fontSize: 16 }}>⏸</span>
        ) : (
          <span style={{ fontSize: 16, marginLeft: 2 }}>▶</span>
        )}
      </button>

      <div className="audio-right-flex">
        <div className="audio-wave-container" onClick={(e) => { e.stopPropagation(); handleSeek(e); }}>
          <div className="audio-bars base">
            {waveHeights.map((h, i) => (
              <div key={i} className="audio-bar" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="audio-bars active" style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}>
            {waveHeights.map((h, i) => (
              <div key={i} className="audio-bar" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
        <div className="audio-time-size">
          {isPlaying ? formatTime(audioRef.current?.currentTime) : formatTime(duration)}, {sizeKB} KB
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble ───────────────────────────────────────
function MessageBubble({
  msg,
  isOwn,
  isFirst,
  isLast,
  showAvatar,
  partner,
  currentUser,
  onContextMenu,
  allMessages,
  translation,
  allTranslations,
}) {
  const isDeleted = !!msg.deleted_at;
  const isImage = msg.type === "image";
  const isFile = msg.type === "file";
  const isVoice = msg.type === "voice";

  const isOwnVal = String(msg.sender_id) === String(currentUser?.id);
  const senderUser = isOwnVal ? currentUser : partner;

  const repliedId = msg.reply_to_id;
  const repliedMsg = repliedId
    ? allMessages?.find((m) => String(m.id) === String(repliedId)) || msg.replied_message
    : msg.replied_message || null;
  const repliedSenderName = repliedMsg
    ? String(repliedMsg.sender_id) === String(currentUser?.id)
      ? i18n.t("chat.you", "Siz")
      : `${partner?.first_name || ""} ${partner?.last_name || ""}`.trim() || partner?.username
    : null;
  const rawPreview = repliedMsg?.content || repliedMsg?.message || "";
  const repliedPreview = typeof rawPreview === 'string'
    ? (repliedMsg?.type === "voice" ? i18n.t("chat.voiceMsg", "Ovozli xabar") :
      repliedMsg?.type === "image" ? i18n.t("chat.photo", "Rasm") : rawPreview).slice(0, 60)
    : "";

  return (
    <div className={`msg-row ${isOwnVal ? "sent" : "received"}`}>
      {!isOwnVal && (
        <div className="msg-avatar" style={{ visibility: isLast ? "visible" : "hidden" }}>
          <Avatar user={senderUser} size="sm" />
        </div>
      )}

      <div className="msg-content">
        {!isOwnVal && isFirst && partner && (
          <div className="msg-sender-name">
            {`${partner.first_name || ""} ${partner.last_name || ""}`.trim() ||
              partner.username ||
              i18n.t("chat.user", "Foydalanuvchi")}
          </div>
        )}

        <div
          className={`msg-bubble ${isOwnVal ? "sent" : "received"} ${isFirst ? "first" : ""} ${isLast ? "last" : ""}`}
          onContextMenu={(e) => {
            e.preventDefault();
            onContextMenu(e, msg);
          }}
        >
          {repliedMsg && (
            <div className={`msg-reply-preview ${isOwnVal ? "sent" : "received"}`}>
              <div className="msg-reply-sender">{repliedSenderName}</div>
              <div className="msg-reply-text">
                {allTranslations?.[repliedMsg.id] || repliedPreview}
              </div>
            </div>
          )
          /* {repliedMsg && (
            <div className={`msg-reply-preview ${isOwnVal ? "sent" : "received"}`}>
              <div className="msg-reply-sender">{repliedSenderName}</div>
              <div className="msg-reply-text">{repliedPreview}</div>
            </div>
          )} */}

          {isDeleted ? (
            <span className="msg-deleted">🚫 {i18n.t("chat.msgDeleted", "Xabar o'chirildi")}</span>
          ) : isImage && msg.file_url ? (
            <a href={avatarSrc(msg.file_url)} target="_blank" rel="noreferrer">
              <img src={avatarSrc(msg.file_url)} alt="rasm" className="img-bubble" />
            </a>
          ) : isFile && msg.file_url ? (
            <a href={avatarSrc(msg.file_url)} target="_blank" rel="noreferrer"
              className="file-bubble"
              style={{ color: isOwnVal ? "#fff" : "#1a1a1a", textDecoration: "none" }}
            >
              <span className="file-icon"><Paperclip size={20} /></span>
              <div className="file-info">
                <div className="file-name">{msg.file_url.split("/").pop()}</div>
                <div className="file-download">{i18n.t("chat.download", "Yuklab olish")}</div>
              </div>
            </a>
          ) : isVoice && msg.file_url ? (
            <CustomAudioPlayer src={avatarSrc(msg.file_url)} isOwn={isOwnVal} />
          ) : (
            <span
              /* key o'zgarganda React elementni qayta chizadi va animatsiya ishga tushadi */
              key={translation ? "translated" : "original"}
              className="msg-text-content animated-translation"
            >
              {translation ? translation : getMsgText(msg)}
            </span>
          )}

          <div className="msg-time-inline">
            {msg.is_edited && (
              <span className="msg-edited">{i18n.t("chat.edited", "tahrirlangan")}</span>
            )}
            <span>{formatMsgTime(msg.created_at)}</span>
            {isOwnVal && (
              <span className={`msg-read-icon ${msg.is_read ? "read" : "sent"}`}>
                {msg.is_read ? (
                  <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                    <path d="M1 6L4.5 9.5L10.5 1.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 6L8.5 9.5L14.5 1.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5.5L4.5 9L11 1" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            )}
          </div>

          {msg.reactions && msg.reactions.length > 0 && (
            <div className="msg-reactions">
              {msg.reactions.map((r, i) => (
                <span key={i} className="msg-reaction-chip">{r.emoji} {r.count > 1 ? r.count : ""}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────
export default function ChatDetail() {
  const { id: chatId } = useParams();
  const ctx = useOutletContext?.() || {};
  const { onBack, reloadList } = ctx;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const [partner, setPartner] = useState(null);
  const [jobInfo, setJobInfo] = useState(null);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [editingMsg, setEditingMsg] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  const [typingUser, setTypingUser] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [presenceResolved, setPresenceResolved] = useState(false);
  const [showTranslate, setShowTranslate] = useState(true);
  const [translations, setTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAutoTranslateOn, setIsAutoTranslateOn] = useState(false);
  const [visibleMessageIds, setVisibleMessageIds] = useState(new Set());
  const translatingIdsRef = useRef(new Set());
  const processedIdsRef = useRef(new Set());
  const [targetLang, setTargetLang] = useState("uz");
  const [showTranslateSettings, setShowTranslateSettings] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordIntervalRef = useRef(null);
  const isCanceledRef = useRef(false);

  const [toast, setToast] = useState(null);
  const [micError, setMicError] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const observerRef = useRef(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleMessageIds((prev) => {
          const newVisibleIds = new Set(prev);
          entries.forEach((entry) => {
            const msgId = entry.target.getAttribute('data-message-id');
            if (msgId) {
              if (entry.isIntersecting) {
                newVisibleIds.add(msgId);
              } else {
                newVisibleIds.delete(msgId);
              }
            }
          });
          return newVisibleIds;
        });
      },
      {
        root: messagesAreaRef.current,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const messageElements = document.querySelectorAll('.msg-group[data-message-id]');
    messageElements.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages]);

  // Real-time avto-tarjima (Prefetching va Priority tizimi bilan)
  useEffect(() => {
    if (!isAutoTranslateOn) return;

    const runTranslation = async () => {
      // 1. Hali tarjima qilinmagan va o'zimiz yozmagan barcha xabarlarni topamiz
      const allUntranslated = messages.filter(
        (m) =>
          !m.deleted_at &&
          (m.type === "text" || !m.type) &&
          String(m.sender_id) !== String(currentUser?.id) &&
          !translations[m.id] &&
          !translatingIdsRef.current.has(m.id) &&
          !processedIdsRef.current.has(m.id) // <--- Xato bo'lganlarni qayta jo'natmaslik uchun
      );

      // Agar hamma narsa tarjima bo'lib bo'lgan bo'lsa, to'xtaymiz
      if (allUntranslated.length === 0) {
        setIsTranslating(false);
        return;
      }

      // 2. Ko'rinib turgan xabarlarni 1-navbatga (VIP) chiqaramiz
      const visibleUntranslated = allUntranslated.filter(m => visibleMessageIds.has(String(m.id)));

      // 3. Ekranda ko'rinmayotgan xabarlarni eng yangisidan eskisiga qarab taxlaymiz 
      // (chunki user odatda tepaga, ya'ni yaqin tarixga skroll qiladi)
      const hiddenUntranslated = allUntranslated.filter(m => !visibleMessageIds.has(String(m.id)));
      hiddenUntranslated.reverse();

      // Ikkalasini birlashtiramiz (Oldin ko'rinadiganlar, keyin fondagilar)
      const prioritizedMessages = [...visibleUntranslated, ...hiddenUntranslated];

      // 4. Bittada maksimal 30 ta xabarni olib, "qutiga" solamiz (Batch)
      const chunk = prioritizedMessages.slice(0, 30);

      if (chunk.length === 0) return;

      // Statusni "band" qilib belgilaymiz
      chunk.forEach(m => translatingIdsRef.current.add(m.id));
      setIsTranslating(true);

      const batchPayload = chunk.map(m => ({
        id: String(m.id),
        text: getMsgText(m)
      })).filter(m => m.text);

      try {
        if (batchPayload.length > 0) {
          // Bitta API so'rovda 30 ta xabarni tarjima qilamiz
          const newTranslationsMap = await translateBatchToUzbek(batchPayload, targetLang);

          if (Object.keys(newTranslationsMap).length > 0) {
            setTranslations((prev) => ({
              ...prev,
              ...newTranslationsMap
            }));
          }
        }
      } catch (err) {
        console.error("Auto-translate batch error", err);
      } finally {
        chunk.forEach(m => {
          translatingIdsRef.current.delete(m.id);
          processedIdsRef.current.add(m.id); // Bir marta urindik, qayta urinmaymiz
        });

        // E'tibor bering: setIsTranslating(false) ni bu yerda chaqirmaymiz, 
        // chunki dependencydagi `translations` o'zgargani uchun useEffect 
        // o'zi qaytadan ishga tushib, keyingi 30 tani tarjima qilishni boshlaydi.
      }
    };

    runTranslation();
  }, [messages, isAutoTranslateOn, targetLang, visibleMessageIds, translations]);
  // ↑ translations ni qo'shdik, shu sababli biri tugasa, ikkinchisi avtomatik boshlanadi

  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadHistory = useCallback(async () => {
    if (!chatId) return;
    try {
      const res = await getChatHistory(chatId);
      if (res?.success === false) {
        setError(res.message || i18n.t("chat.errorOccurred", "Xato yuz berdi"));
        setLoading(false);
        return;
      }
      const data = res?.data || res;
      const msgs = data?.messages || data || [];
      setMessages(Array.isArray(msgs) ? msgs : []);
      if (data?.partner) setPartner(data.partner);
      if (data?.client || data?.freelancer) {
        const me = currentUser?.id;
        const p =
          data.client?.id === me ? data.freelancer : data.client;
        if (p) setPartner(p);
      }
      if (data?.chat) setChatInfo(data.chat);
      if (data?.job) setJobInfo(data.job);
    } catch (e) {
      setError(i18n.t("chat.failLoadMsgs", "Xabarlarni yuklab bo'lmadi"));
    } finally {
      setLoading(false);
    }
  }, [chatId, currentUser?.id]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setError("");
    setPartner(null);
    setChatInfo(null);
    setJobInfo(null);
    loadHistory();
  }, [chatId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        !e.target.closest('.emoji-toggle-btn') &&
        !e.target.closest('.emoji-picker-container')
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(typingTimerRef.current);
    };
  }, []);

  const handleEmojiSelect = (emoji) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newText = text.substring(0, start) + emoji.native + text.substring(end);
    setText(newText);

    setTimeout(() => {
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + emoji.native.length;
      textareaRef.current.focus();
    }, 0);
  };

  const scrollToBottom = useCallback((behavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [loading]);

  useEffect(() => {
    if (isAtBottomRef.current) scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    const el = messagesAreaRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distFromBottom < 80;
    setShowScrollBtn(distFromBottom > 200);
  };

  useEffect(() => {
    if (!chatId) return;

    const socket = getSocket();
    const readyCleanup = onSocketReady((readySocket) => {
      readySocket.emit("joinChat", chatId);
    });

    const onNew = (msg) => {
      if (String(msg.chat_id) !== String(chatId)) return;
      setMessages((prev) => {
        const exists = prev.some(m =>
          String(m.id) === String(msg.id) ||
          (m.content && msg.content && m.content === msg.content && String(m.sender_id) === String(msg.sender_id) && Math.abs(parseUTC(m.created_at) - parseUTC(msg.created_at)) < 15000)
        );
        if (exists) return prev;

        return [...prev, msg];
      });

      if (String(msg.sender_id) !== String(currentUser?.id)) {
        markMessagesAsRead(chatId).then(() => reloadList?.());
      }

      if (isAtBottomRef.current) {
        scrollToBottom();
      }
    };

    const onEdited = ({ messageId, content, updated_at }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content, updated_at, is_edited: true }
            : m
        )
      );
    };

    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, deleted_at: new Date().toISOString() }
            : m
        )
      );
    };

    const onTyping = (data) => {
      if (data && data.chatId && String(data.chatId) !== String(chatId)) return;
      if (data.userId !== currentUser?.id) setTypingUser(data.username || i18n.t("chat.typing", "Yozmoqda"));
    };
    const onStopTyping = (data) => {
      if (data && data.chatId && String(data.chatId) !== String(chatId)) return;
      setTypingUser(null);
    };
    const onRead = (data) => {
      if (data && data.chatId && String(data.chatId) !== String(chatId)) return;
      setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
    };

    const onReactionAdded = ({ messageId, emoji }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const existing = (m.reactions || []).find((r) => r.emoji === emoji);
          if (existing) {
            return { ...m, reactions: m.reactions.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
          }
          return { ...m, reactions: [...(m.reactions || []), { emoji, count: 1 }] };
        })
      );
    };

    socket.off("newMessage", onNew);
    socket.off("messageEdited", onEdited);
    socket.off("messageDeleted", onDeleted);
    socket.off("userTyping", onTyping);
    socket.off("userStoppedTyping", onStopTyping);
    socket.off("messagesRead", onRead);
    socket.off("reactionAdded", onReactionAdded);

    socket.on("newMessage", onNew);
    socket.on("messageEdited", onEdited);
    socket.on("messageDeleted", onDeleted);
    socket.on("userTyping", onTyping);
    socket.on("userStoppedTyping", onStopTyping);
    socket.on("messagesRead", onRead);
    socket.on("reactionAdded", onReactionAdded);

    markMessagesAsRead(chatId).then(() => reloadList?.());

    return () => {
      socket.off("newMessage", onNew);
      socket.off("messageEdited", onEdited);
      socket.off("messageDeleted", onDeleted);
      socket.off("userTyping", onTyping);
      socket.off("userStoppedTyping", onStopTyping);
      socket.off("messagesRead", onRead);
      socket.off("reactionAdded", onReactionAdded);
      readyCleanup?.();
    };
  }, [chatId, currentUser?.id]);

  useEffect(() => {
    const socket = getSocket();
    const onUserStatus = (data) => {
      const status = normalizeUserStatus(data);
      setPartner(prev => {
        if (!prev?.id) return prev;
        if (String(status.userId) !== String(prev.id)) return prev;
        setPresenceResolved(true);
        const resolvedLastSeen = status.isOnline ? null : (status.lastSeen || null);

        return {
          ...prev,
          is_online: status.isOnline,
          last_seen: resolvedLastSeen
        };
      });
    };
    socket.off("userStatus", onUserStatus);
    socket.on("userStatus", onUserStatus);
    return () => socket.off("userStatus", onUserStatus);
  }, []);

  useEffect(() => {
    if (!partner?.id) return;
    setPresenceResolved(false);
    const cleanup = onSocketReady((socket) => {
      socket.emit("checkStatus", partner.id);
    });
    return cleanup;
  }, [partner?.id]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    autoResizeTextarea(e.target);

    const socket = getSocket();
    socket.emit("typing", {
      chatId,
      userId: currentUser?.id,
      username: `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim(),
    });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("stopTyping", { chatId });
    }, 1500);
  };

  const autoResizeTextarea = (el) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicError(false);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      isCanceledRef.current = false;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        clearInterval(recordIntervalRef.current);
        stream.getTracks().forEach((t) => t.stop());

        if (!isCanceledRef.current) {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          if (isCanceledRef.current) {
            audioChunksRef.current = [];
            return;
          }
          await handleSendVoice(audioBlob);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordTime(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic error:", err);

      let micErrMsg = i18n.t("chat.micError", "Mikrofonga kirish rad etildi");

      if (err.name === "NotAllowedError") {
        // Windows tizimi mikrofonga ruxsat bermagan bo'lishi mumkin
        micErrMsg = i18n.t(
          "chat.micErrorSystem",
          "Mikrofonga ruxsat yo'q. Windows sozlamalarida: Sozlamalar → Maxfiylik → Mikrofon → Brauzerga ruxsat bering"
        );
      } else if (err.name === "NotFoundError") {
        micErrMsg = i18n.t("chat.micNotFound", "Mikrofon topilmadi. Qurilmangizni tekshiring");
      } else if (err.name === "NotReadableError") {
        micErrMsg = i18n.t("chat.micInUse", "Mikrofon boshqa dastur tomonidan ishlatilmoqda");
      }

      setMicError(micErrMsg);
      setTimeout(() => setMicError(false), 8000);
    }
  };

  const cancelRecording = () => {
    isCanceledRef.current = true;
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    clearInterval(recordIntervalRef.current);
  };

  const sendRecording = () => {
    isCanceledRef.current = false;
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    clearInterval(recordIntervalRef.current);
  };

  const handleSendVoice = async (blob) => {
    setSending(true);
    const formData = new FormData();
    formData.append("voice", blob, "voice.webm");

    const uploadRes = await uploadVoice(formData);
    if (!uploadRes?.success) {
      setSending(false);
      notify(uploadRes?.message || i18n.t("chat.voiceUploadFail", "Ovoz yuklanmadi"), "error");
      return;
    }

    const file_url = uploadRes.data?.url || uploadRes.url;
    const voiceReplyId = replyingTo?.id || null;
    setReplyingTo(null);

    const res = await sendMessage({
      chat_id: chatId,
      type: "voice",
      file_url,
      reply_to_id: voiceReplyId || undefined
    });
    setSending(false);

    if (res?.success === false) {
      notify(res.message || i18n.t("chat.sendFail", "Xabar yuborilmadi"), "error");
    } else {
      const newMsg = res?.data?.message || res?.data || res?.message_obj;
      if (newMsg && voiceReplyId) {
        setMessages(prev => {
          if (prev.find(m => String(m.id) === String(newMsg.id))) {
            return prev.map(m => String(m.id) === String(newMsg.id) ? { ...newMsg, reply_to_id: voiceReplyId } : m);
          }
          return [...prev, { ...newMsg, reply_to_id: voiceReplyId }];
        });
      }
      reloadList?.();
    }
  };

  // Avto-tarjimani yoqish/o'chirish tugmasi
  const toggleAutoTranslate = () => {
    if (isAutoTranslateOn) {
      setIsAutoTranslateOn(false);
      setTranslations({}); // O'chganda barcha tarjimalarni tozalash (asliga qaytish)
    } else {
      setIsAutoTranslateOn(true);
    }
  };



  // Real-time avto-tarjima kuzatuvchisi (Messages o'zgarganda ishlaydi)
  useEffect(() => {
    if (!isAutoTranslateOn) return; // Agar rejim o'chiq bo'lsa, ishlamaydi

    const runTranslation = async () => {
      // Faqat sherikning, matnli va HALI TARJIMA QILINMAGAN xabarlarini topamiz
      const untranslatedMessages = messages.filter(
        (m) =>
          !m.deleted_at &&
          (m.type === "text" || !m.type) &&
          String(m.sender_id) !== String(currentUser?.id) &&
          !translations[m.id] // <--- Faqat yangi kelganlari yoki tarjima qilinmaganlari
      );

      if (untranslatedMessages.length === 0) return;

      setIsTranslating(true);
      try {
        const translationPromises = untranslatedMessages.map(async (msg) => {
          const textToTranslate = getMsgText(msg);
          if (textToTranslate) {
            try {
              const translated = await translateToUzbek(textToTranslate, targetLang);
              return { id: msg.id, text: translated };
            } catch (err) {
              console.error("Auto-translate error:", err);
              return { id: msg.id, text: null };
            }
          }
          return null;
        });

        const results = await Promise.all(translationPromises);

        setTranslations((prev) => {
          const newTrans = { ...prev };
          results.forEach((res) => {
            if (res && res.text) {
              newTrans[res.id] = res.text;
            }
          });
          return newTrans;
        });
      } finally {
        setIsTranslating(false);
      }
    };

    runTranslation();
  }, [messages, isAutoTranslateOn, targetLang]);

  // const handleTranslateChat = async () => {
  //   if (isTranslating) return;
  //   setIsTranslating(true);
  //   const newTranslations = { ...translations };

  //   try {
  //     const textMessages = messages.filter(
  //       (m) => !m.deleted_at && (m.type === "text" || !m.type)
  //     );

  //     for (const msg of textMessages) {
  //       const textToTranslate = getMsgText(msg);

  //       if (textToTranslate && !translations[msg.id]) {
  //         try {
  //           const translated = await translateToUzbek(textToTranslate, targetLang);
  //           newTranslations[msg.id] = translated;
  //           setTranslations({ ...newTranslations });
  //         } catch (err) {
  //           console.error("Translation error for msg", msg.id, err);
  //         }
  //       }
  //     }
  //   } finally {
  //     setIsTranslating(false);
  //   }
  // };

  const handleTranslateSingleMessage = async (msg) => {
    console.log("Translating single message:", msg);
    const textToTranslate = getMsgText(msg);

    if (!textToTranslate) {
      console.warn("No text found to translate for msg:", msg.id);
      notify(i18n.t("chat.noTextToTranslate", "Tarjima qilish uchun matn topilmadi"), "error");
      return;
    }

    try {
      notify(i18n.t("chat.translating", "Tarjima qilinmoqda..."), "info");
      const translated = await translateToUzbek(textToTranslate, targetLang);
      console.log("Translation result:", translated);
      if (translated) {
        setTranslations((prev) => {
          const newState = { ...prev, [msg.id]: translated };
          console.log("New translations state for msg", msg.id, ":", newState);
          return newState;
        });
      }
    } catch (err) {
      console.error("Single message translation error", err);
      notify(i18n.t("chat.translationError", "Tarjima qilishda xatolik"), "error");
    }
  };

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;

    if (editingMsg) {
      setText("");
      const targetId = editingMsg.id;
      setEditingMsg(null);
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      const res = await editMessage(targetId, { content });
      if (res?.success === false) notify(res.message || i18n.t("chat.error", "Xato"), "error");
      else {
        setMessages((prev) =>
          prev.map((m) =>
            String(m.id) === String(targetId)
              ? { ...m, content, is_edited: true }
              : m
          )
        );
      }
      return;
    }

    setSending(true);
    const replyId = replyingTo?.id || null;
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setReplyingTo(null);

    const tempId = "temp-" + Date.now();
    const optimisticMsg = {
      id: tempId,
      chat_id: chatId,
      sender_id: currentUser?.id,
      content: content,
      type: "text",
      created_at: new Date().toISOString(),
      reply_to_id: replyId || undefined,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    const socket = getSocket();
    socket.emit("stopTyping", { chatId });

    try {
      const res = await sendMessage({ chat_id: chatId, message_text: content, reply_to_id: replyId || undefined });
      setSending(false);

      if (res?.success === false) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        notify(res.message || i18n.t("chat.sendFail", "Xabar yuborilmadi"), "error");
        setText(content);
      } else if (res?.data || res?.message_obj) {
        const newMsg = res?.data?.message || res?.data || res?.message_obj;
        setMessages((prev) => {
          const exists = prev.some(m => String(m.id) === String(newMsg.id));
          if (exists) {
            return prev.filter(m => m.id !== tempId);
          }
          return prev.map(m => (m.id === tempId ? { ...newMsg, reply_to_id: replyId || undefined } : m));
        });
        reloadList?.();
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setSending(false);
      notify(i18n.t("chat.error", "Xatolik yuz berdi"), "error");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openContextMenu = (e, msg) => {
    if (msg.deleted_at) return;
    const x = Math.min(e.clientX, window.innerWidth - 150);
    const y = Math.min(e.clientY, window.innerHeight - 200);
    setContextMenu({ x, y, msg });
  };

  const handleCopy = () => {
    if (contextMenu?.msg?.content) {
      navigator.clipboard.writeText(contextMenu.msg.content);
      notify(i18n.t("chat.copied", "Nusxalandi ✓"));
    }
    setContextMenu(null);
  };

  const handleEdit = () => {
    const msg = contextMenu?.msg;
    if (!msg || msg.type !== "text") { notify(i18n.t("chat.onlyTextCanBeEdited", "Faqat matn xabarlarni tahrirlash mumkin"), "error"); setContextMenu(null); return; }
    setEditingMsg(msg);
    setText(msg.content || "");
    setContextMenu(null);
    setTimeout(() => {
      textareaRef.current?.focus();
      autoResizeTextarea(textareaRef.current);
    }, 50);
  };

  const handleDelete = async () => {
    const msg = contextMenu?.msg;
    setContextMenu(null);
    if (!msg) return;
    const res = await deleteMessage(msg.id);
    if (res?.success === false) notify(res.message || i18n.t("chat.deleteFail", "O'chirib bo'lmadi"), "error");
    else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? { ...m, deleted_at: new Date().toISOString() }
            : m
        )
      );
    }
  };

  const handleReply = () => {
    const msg = contextMenu?.msg;
    if (!msg) return;
    const senderName = String(msg.sender_id) === String(currentUser?.id)
      ? i18n.t("chat.you", "Siz")
      : `${partner?.first_name || ""} ${partner?.last_name || ""}`.trim() || partner?.username || "";
    const preview = msg.type === "voice"
      ? i18n.t("chat.voiceMsg", "Ovozli xabar")
      : msg.type === "image"
        ? i18n.t("chat.photo", "Rasm")
        : (msg.content || msg.message || "").slice(0, 80);
    setReplyingTo({ id: msg.id, preview, senderName });
    setContextMenu(null);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const val = textareaRef.current.value;
        textareaRef.current.value = "";
        textareaRef.current.value = val;
      }
    }, 150);
  };

  const handleReact = (emoji) => {
    const msg = contextMenu?.msg;
    if (!msg) return;

    const socket = getSocket();
    socket.emit("addReaction", { chatId, messageId: msg.id, emoji });

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id != msg.id) return m;
        const reactions = m.reactions || [];
        const existing = reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return { ...m, reactions: reactions.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
        }
        return { ...m, reactions: [...reactions, { emoji, count: 1 }] };
      })
    );
    setContextMenu(null);
  };

  const partnerName = partner
    ? `${partner.first_name || ""} ${partner.last_name || ""}`.trim() ||
    partner.username ||
    `UID: ${partner.id.slice(0, 5)}`
    : chatInfo?.id
      ? `Chat #${chatInfo.id.slice(0, 8)}`
      : "Foydalanuvchi";

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "superadmin";

  const actualLastSeen = partner?.last_seen || partner?.lastSeen || partner?.last_active || partner?.last_online || null;

  const isComputedOnline = partner?.is_online === true || partner?.isOnline === true || partner?.online === true;
  const canShowOfflineStatus = presenceResolved && !isComputedOnline && !!actualLastSeen;

  const filteredMessages = messages.filter(
    (msg) => !(msg.deleted_at && !isAdmin)
  );

  const grouped = groupMessagesByDate(filteredMessages);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            height: 66,
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 24px",
          }}
        >
          <div className="skeleton-avatar" style={{ width: 42, height: 42 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="skeleton-bubble" style={{ width: 120, height: 14, borderRadius: 6 }} />
            <div className="skeleton-bubble" style={{ width: 80, height: 11, borderRadius: 6 }} />
          </div>
        </div>
        <div className="chat-skeleton" style={{ flex: 1, overflowY: "hidden" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`skeleton-row ${i % 2 === 0 ? "right" : ""}`}>
              <div className="skeleton-avatar" />
              <div className="skeleton-bubble" style={{ width: 180, height: 48, borderRadius: 16 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-error">
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{error}</div>
        <button
          onClick={loadHistory}
          style={{
            background: "#14a800",
            color: "#fff",
            border: "none",
            padding: "8px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {i18n.t("chat.retry", "Qayta urinish")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="chat-detail-wrapper"
      style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden", position: "relative" }}
      onClick={() => contextMenu && setContextMenu(null)}
    >
      <div
        className="chat-detail-main"
        style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", position: "relative", minWidth: 0 }}
      >
        <div className="chat-header">
          <div className="chat-header-left">
            {onBack && (
              <button className="chat-back-btn" onClick={onBack} style={{ display: "flex" }}>
                ←
              </button>
            )}
            <Avatar user={partner} size="md" />
            <div className="chat-header-info">
              <h2 className="chat-header-name">{partnerName}</h2>
              <p className="chat-header-status">
                {typingUser ? (
                  <>
                    <span className="chat-header-status-dot" />
                    <span className="typing">{typingUser} {i18n.t("chat.typingFull", "yozmoqda…")}</span>
                  </>
                ) : isComputedOnline ? (
                  <span className="online">{i18n.t("chat.online", "Online")}</span>
                ) : canShowOfflineStatus ? (
                  <span className="offline-status">{formatLastSeen(actualLastSeen)}</span>
                ) : (
                  <span className="offline-status"></span>
                )}
              </p>
            </div>
          </div>

          <div className="chat-header-right">
            {jobInfo?.title && (
              <span className="chat-header-job" title={jobInfo.title}>
                💼 {jobInfo.title}
              </span>
            )}
            <button
              className="chat-sidebar-toggle-btn"
              onClick={() => setShowInfo(!showInfo)}
              title={i18n.t("chat.info", "Ma'lumot")}
              style={{ marginLeft: '12px' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="15" y1="3" x2="15" y2="21"></line>
              </svg>
            </button>
          </div>
        </div>

        {showTranslate && (
          <TranslateBar
            isTranslating={isTranslating}
            targetLang={targetLang}
            isAutoTranslateOn={isAutoTranslateOn} // <-- Yangi qo'shildi
            showSettings={showTranslateSettings}
            onToggleSettings={() => setShowTranslateSettings(!showTranslateSettings)}
            onSelectLang={(lang) => {
              setTargetLang(lang);
              setShowTranslateSettings(false);
              setTranslations({});
              // Til o'zgarganda tarjimalar tozalanadi, useEffect esa darhol yangi tilga o'giradi
            }}
            onToggleAutoTranslate={toggleAutoTranslate} // <-- handleTranslateChat o'rniga
            onClose={() => {
              setShowTranslate(false);
              setIsAutoTranslateOn(false);
              setTranslations({});
            }}
          />
        )}

        <div
          ref={messagesAreaRef}
          className="chat-messages-area"
          onScroll={handleScroll}
        >
          {messages.length === 0 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                textAlign: "center",
                padding: 40,
                margin: "auto",
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 14 }}>👋</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                {i18n.t("chat.startChat", "Suhbat boshlang!")}
              </div>
              <div style={{ fontSize: 14 }}>
                {partnerName} {i18n.t("chat.sendFirstMsg", "bilan birinchi xabarni yuboring")}
              </div>
            </div>
          )}

          {grouped.map((group) => {
            const msgs = group.messages;
            return (
              <div key={group.key}>
                <div className="date-separator">
                  <div className="date-separator-line" />
                  <span className="date-separator-text">{group.date}</span>
                  <div className="date-separator-line" />
                </div>

                {msgs.map((msg, idx) => {
                  const isOwn = String(msg.sender_id) === String(currentUser?.id);
                  const prevMsg = msgs[idx - 1];
                  const nextMsg = msgs[idx + 1];
                  const isFirst =
                    !prevMsg || String(prevMsg.sender_id) !== String(msg.sender_id);
                  const isLast =
                    !nextMsg || String(nextMsg.sender_id) !== String(msg.sender_id);

                  return (
                    <div
                      key={msg.id || idx}
                      className={`msg-group ${isOwn ? "sent" : "received"}`}
                      data-message-id={msg.id}
                    >
                      <MessageBubble
                        msg={msg}
                        isOwn={isOwn}
                        isFirst={isFirst}
                        isLast={isLast}
                        showAvatar={isLast && !isOwn}
                        partner={partner}
                        currentUser={currentUser}
                        onContextMenu={openContextMenu}
                        allMessages={filteredMessages}
                        translation={translations[msg.id]}
                        allTranslations={translations}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}

          {typingUser && (
            <div className="typing-indicator">
              <Avatar user={partner} size="sm" />
              <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span className="typing-text">{typingUser}</span>
            </div>
          )}

          <div ref={bottomRef} style={{ height: 1 }} />
        </div>

        {showScrollBtn && (
          <button
            className="scroll-to-bottom"
            onClick={() => scrollToBottom()}
            title={i18n.t("chat.scrollDown", "Pastga")}
          >
            <ArrowLeft size={20} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        )}

        <div className="chat-input-area">
          {editingMsg && (
            <div className="edit-mode-bar">
              <Edit3 size={16} color="var(--accent)" />
              <span>{i18n.t("chat.editing", "Tahrirlash:")} {editingMsg.content?.slice(0, 60)}{editingMsg.content?.length > 60 ? "…" : ""}</span>
              <button className="edit-cancel-btn" onClick={() => { setEditingMsg(null); setText(""); }}><X size={18} /></button>
            </div>
          )}

          {replyingTo && (
            <div className="reply-mode-bar">
              <div className="reply-mode-content">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                </svg>
                <div className="reply-mode-text">
                  <span className="reply-mode-sender">{replyingTo.senderName}</span>
                  <span className="reply-mode-preview">{replyingTo.preview}</span>
                </div>
              </div>
              <button className="edit-cancel-btn" onClick={() => setReplyingTo(null)}>×</button>
            </div>
          )}

          <div className="chat-input-container">
            {recording ? (
              <div className="chat-input-bubble recording">
                <div className="record-pulse-dot" />
                <span className="record-time">
                  {Math.floor(recordTime / 60)}:{(recordTime % 60).toString().padStart(2, "0")}
                </span>
                <div style={{ flex: 1 }}></div>
                <button
                  className="record-cancel-btn"
                  onClick={cancelRecording}
                  title={i18n.t("chat.cancel", "Bekor qilish")}
                >
                  <Trash2 size={22} />
                </button>
              </div>
            ) : (
              <div className="chat-input-bubble">
                <button
                  className={`emoji-toggle-btn ${showEmojiPicker ? 'active' : ''}`}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Emojis"
                >
                  <Smile size={26} />
                </button>

                {showEmojiPicker && (
                  <div className="emoji-picker-container" ref={pickerRef}>
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="light"
                      previewPosition="none"
                      skinTonePosition="none"
                      navPosition="bottom"
                      perLine={8}
                      emojiSize={24}
                      emojiButtonSize={34}
                      maxFrequentRows={1}
                    />
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={handleKey}
                  placeholder={i18n.t("chat.typeMsgPlaceholder", "Xabar yozing... ")}
                  rows={1}
                />

                <label className="chat-attach-btn">
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleSendFile(file);
                    }}
                  />
                  <Paperclip size={24} />
                </label>
              </div>
            )}

            {!text.trim() && !editingMsg && !recording ? (
              <div className="mic-button-wrapper">
                {micError && (
                  <div className="mic-error-tooltip">
                    {typeof micError === "string"
                      ? micError
                      : i18n.t("chat.noMicrophone", "Mikrofonga ruxsat yo'q")}
                  </div>
                )}
                <button
                  className="chat-action-circle-btn mic"
                  onClick={startRecording}
                  disabled={sending}
                  title={i18n.t("chat.voiceMsg", "Ovozli xabar")}
                >
                  <Mic size={24} />
                </button>
              </div>
            ) : (
              <button
                className={`chat-action-circle-btn send ${(text.trim() || editingMsg || recording) ? "active" : ""}`}
                onClick={recording ? sendRecording : handleSend}
                disabled={sending || (!text.trim() && !editingMsg && !recording)}
                title={i18n.t("chat.send", "Yuborish")}
              >
                {sending ? (
                  <div style={{ width: 20, height: 20, border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                ) : (
                  <Send size={24} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {showInfo && (
        <aside className="chat-info-sidebar">
          <div className="chat-info-header">
            <button className="chat-header-btn" onClick={() => setShowInfo(false)}>✕</button>
            <h3>{i18n.t("chat.information", "Information")}</h3>
          </div>
          <div className="chat-info-body">
            <div className="chat-info-profile">
              <Avatar user={partner} size="lg" />
              <div className="chat-info-name">{partnerName}</div>
              <div className="chat-info-status">
                {typingUser
                  ? i18n.t("chat.typing", "yozmoqda...")
                  : isComputedOnline
                    ? i18n.t("chat.online", "Online")
                    : canShowOfflineStatus
                      ? formatLastSeen(actualLastSeen)
                      : ""}
              </div>
            </div>

            <div className="chat-info-section">
              <div className="chat-info-row">
                <span className="info-icon"><User size={20} /></span>
                <div className="info-text">
                  <div className="info-val">@{partner?.username || "user"}</div>
                  <div className="info-label">{i18n.t("chat.username", "Username")}</div>
                </div>
              </div>
              <div className="chat-info-row">
                <span className="info-icon"><Phone size={20} /></span>
                <div className="info-text">
                  <div className="info-val">{partner?.phone || i18n.t("chat.hidden", "Yashirin")}</div>
                  <div className="info-label">{i18n.t("chat.mobile", "Mobile")}</div>
                </div>
              </div>
            </div>

            <div className="chat-info-actions">
              <button className="chat-info-danger-btn">{i18n.t("chat.blockUser", "Block User")}</button>
            </div>
          </div>
        </aside>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOwn={String(contextMenu.msg?.sender_id) === String(currentUser?.id)}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReply={handleReply}
          onTranslate={() => handleTranslateSingleMessage(contextMenu.msg)}
          onReact={handleReact}
          onClose={() => setContextMenu(null)}
        />
      )}

      {toast && (
        <div className={`chat-toast ${toast.type || ""}`}>{toast.msg}</div>
      )}
    </div>
  );
}

// ── Translate Bar ────────────────────────────────────────
function TranslateBar({
  onToggleAutoTranslate, // onTranslate o'rniga
  onClose,
  isTranslating,
  targetLang,
  isAutoTranslateOn,     // Yangi parametr
  showSettings,
  onToggleSettings,
  onSelectLang
}) {
  const languages = [
    { id: "uz", label: "O'zbekcha" },
    { id: "ru", label: "Русский" },
    { id: "en", label: "English" },
    { id: "tr", label: "Türkçe" },
    { id: "kk", label: "Қазақша" },
    { id: "ky", label: "Кыргызcha" },
    { id: "tk", label: "Türkmençe" },
    { id: "tg", label: "Тоҷикӣ" },
    { id: "de", label: "Deutsch" },
    { id: "fr", label: "Français" },
    { id: "es", label: "Español" },
    { id: "zh", label: "中文" },
    { id: "ko", label: "한국어" },
    { id: "ar", label: "العربية" },
  ];

  const currentLangLabel = languages.find(l => l.id === targetLang)?.label || "O'zbekcha";

  return (
    <div className="translate-bar-container">
      <div className={`translate-bar ${isTranslating ? 'busy' : ''}`} onClick={!isTranslating ? onToggleAutoTranslate : undefined}>
        <div className="translate-bar-left">
          <span className="translate-icon">
            <Globe size={16} strokeWidth={2.5} className={isTranslating ? 'spin-anim' : ''} />
          </span>
          <span className="translate-text">
            {isTranslating
              ? i18n.t("chat.translating", "Tarjima qilinmoqda...")
              : isAutoTranslateOn
                ? i18n.t("chat.showOriginal", "Aslini ko'rsatish")
                : `${currentLangLabel} tiliga tarjima qilish`}
          </span>
        </div>
        <div className="translate-bar-right">
          <div className="translate-settings-wrapper">
            <button
              className={`translate-settings-btn ${showSettings ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleSettings(); }}
            >
              <Settings2 size={16} strokeWidth={2.5} />
            </button>

            {showSettings && (
              <div className="translate-langs-menu" onClick={(e) => e.stopPropagation()}>
                <div className="translate-menu-header">{i18n.t("chat.chooseLang", "Tilni tanlang")}</div>
                {languages.map((lang) => (
                  <div
                    key={lang.id}
                    className={`translate-lang-item ${targetLang === lang.id ? 'active' : ''}`}
                    onClick={() => onSelectLang(lang.id)}
                  >
                    {lang.label}
                    {targetLang === lang.id && <span className="check-mark">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          {!isTranslating && (
            <button className="translate-settings-btn" onClick={(e) => { e.stopPropagation(); onClose?.(); }}>
              <X size={16} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}