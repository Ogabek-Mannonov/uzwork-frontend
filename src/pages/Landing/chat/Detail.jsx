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
import { getSocket } from "../../../hooks/useSocket";
import i18n from "../../../i18n";
import { useTranslation } from "react-i18next";

// ── constants ────────────────────────────────────────────
const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

// ── helpers ──────────────────────────────────────────────
function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND}${url}`;
}

function formatMsgTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return i18n.t("chat.today", "Bugun");
  if (diffDays === 1) return i18n.t("chat.yesterday", "Kecha");
  return d.toLocaleDateString(i18n.language === 'uz' ? "uz-UZ" : (i18n.language === 'ru' ? "ru-RU" : "en-US"), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;
  let currentGroup = null;

  messages.forEach((msg) => {
    const dateLabel = formatDateLabel(msg.created_at);
    if (dateLabel !== currentDate) {
      currentDate = dateLabel;
      currentGroup = { date: dateLabel, messages: [] };
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
function ContextMenu({ x, y, isOwn, onEdit, onDelete, onCopy, onClose }) {
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
  if (x + 180 > window.innerWidth) style.left = x - 180;
  if (y + 160 > window.innerHeight) style.top = y - 140;

  return (
    <div ref={ref} className="msg-context-menu" style={style}>
      <div className="msg-context-item" onClick={onCopy}>
        📋 {i18n.t("chat.copy", "Nusxalash")}
      </div>
      {isOwn && (
        <>
          <div className="msg-context-item" onClick={onEdit}>
            ✏️ {i18n.t("chat.edit", "Tahrirlash")}
          </div>
          <div
            className="msg-context-item danger"
            onClick={onDelete}
          >
            🗑️ {i18n.t("chat.delete", "O'chirish")}
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

  const togglePlay = () => {
    if(!audioRef.current) return;
    if(isPlaying) audioRef.current.pause();
    else {
      audioRef.current.currentTime = (progress / 100) * (audioRef.current.duration || 0);
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if(!audioRef.current) return;
    if(audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const onLoadedMetadata = () => {
    if(audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e) => {
    if(!audioRef.current) return;
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
    if(isNaN(time) || !time) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`custom-audio-player ${isOwn ? "sent" : "received"}`}>
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={onTimeUpdate}
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
      <div className="audio-wave-container" onClick={(e) => { e.stopPropagation(); handleSeek(e); }}>
        <div className="audio-progress" style={{ width: `${progress}%` }} />
      </div>
      <div className="audio-time">
        {isPlaying ? formatTime(audioRef.current?.currentTime) : formatTime(duration)}
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
}) {
  const isDeleted = !!msg.deleted_at;
  const isImage = msg.type === "image";
  const isFile = msg.type === "file";
  const isVoice = msg.type === "voice";

  const senderUser = isOwn ? currentUser : partner;

  return (
    <div className={`msg-row ${isOwn ? "sent" : "received"}`}>
      {/* Avatar — only last in group */}
      {!isOwn && (
        <div className="msg-avatar" style={{ visibility: isLast ? "visible" : "hidden" }}>
          <Avatar user={senderUser} size="sm" />
        </div>
      )}

      <div className="msg-content">
        {/* Sender name for received first msg */}
        {!isOwn && isFirst && partner && (
          <div className="msg-sender-name">
            {`${partner.first_name || ""} ${partner.last_name || ""}`.trim() ||
              partner.username ||
              i18n.t("chat.user", "Foydalanuvchi")}
          </div>
        )}

        {/* Bubble */}
        <div
          className={`msg-bubble ${isOwn ? "sent" : "received"} ${
            isFirst ? "first" : ""
          } ${isLast ? "last" : ""}`}
          onContextMenu={(e) => {
            e.preventDefault();
            onContextMenu(e, msg);
          }}
        >
          {isDeleted ? (
            <span className="msg-deleted">🚫 {i18n.t("chat.msgDeleted", "Xabar o'chirildi")}</span>
          ) : isImage && msg.file_url ? (
            <a href={avatarSrc(msg.file_url)} target="_blank" rel="noreferrer">
              <img
                src={avatarSrc(msg.file_url)}
                alt="rasm"
                className="img-bubble"
              />
            </a>
          ) : isFile && msg.file_url ? (
            <a
              href={avatarSrc(msg.file_url)}
              target="_blank"
              rel="noreferrer"
              className="file-bubble"
              style={{ color: isOwn ? "#fff" : "#1a1a1a", textDecoration: "none" }}
            >
              <span className="file-icon">📎</span>
              <div className="file-info">
                <div className="file-name">
                  {msg.file_url.split("/").pop()}
                </div>
                <div className="file-download">{i18n.t("chat.download", "Yuklab olish")}</div>
              </div>
            </a>
          ) : isVoice && msg.file_url ? (
            <CustomAudioPlayer src={avatarSrc(msg.file_url)} isOwn={isOwn} />
          ) : (
            <span>{msg.content || msg.message}</span>
          )}
        </div>

        {/* Time & status */}
        {isLast && (
          <div className={`msg-time ${isOwn ? "sent" : "received"}`}>
            {msg.is_edited && (
              <span className="msg-edited">{i18n.t("chat.edited", "tahrirlangan")}</span>
            )}
            <span>{formatMsgTime(msg.created_at)}</span>
            {isOwn && (
              <span className="msg-read-icon">
                {msg.is_read ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────
export default function ChatDetail() {
  const { id: chatId } = useParams();
  const ctx = useOutletContext?.() || {};
  const { onBack, reloadList } = ctx;

  // ── state ───────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const [partner, setPartner] = useState(null);
  const [jobInfo, setJobInfo] = useState(null);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [editingMsg, setEditingMsg] = useState(null); // { id, content }
  const [contextMenu, setContextMenu] = useState(null); // { x, y, msg }

  const [typingUser, setTypingUser] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Ovozli xabar uchun
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordIntervalRef = useRef(null);
  const isCanceledRef = useRef(false);

  const [toast, setToast] = useState(null); // { msg, type }

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ── toast helper ────────────────────────────────────────
  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── load history ────────────────────────────────────────
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

  // ── scroll to bottom ───────────────────────────────────
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

  // scroll detection
  const handleScroll = () => {
    const el = messagesAreaRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distFromBottom < 80;
    setShowScrollBtn(distFromBottom > 200);
  };

  // ── socket ──────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!chatId) return;

    if (currentUser?.id) socket.emit("joinUser", currentUser.id);
    socket.emit("joinChat", chatId);

    const onNew = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (msg.sender_id !== currentUser?.id) {
        markMessagesAsRead(chatId).then(() => reloadList?.());
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

    const onTyping = ({ userId, username }) => {
      if (userId !== currentUser?.id) setTypingUser(username || i18n.t("chat.typing", "Yozmoqda"));
    };
    const onStopTyping = () => setTypingUser(null);
    const onRead = () => {
      setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
    };

    socket.on("newMessage", onNew);
    socket.on("messageEdited", onEdited);
    socket.on("messageDeleted", onDeleted);
    socket.on("userTyping", onTyping);
    socket.on("userStoppedTyping", onStopTyping);
    socket.on("messagesRead", onRead);

    // mark as read on open
    markMessagesAsRead(chatId).then(() => reloadList?.());

    return () => {
      socket.off("newMessage", onNew);
      socket.off("messageEdited", onEdited);
      socket.off("messageDeleted", onDeleted);
      socket.off("userTyping", onTyping);
      socket.off("userStoppedTyping", onStopTyping);
      socket.off("messagesRead", onRead);
    };
  }, [chatId, currentUser?.id]);

  // ── typing emit ────────────────────────────────────────
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

  // ── voice Simple Style ────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      notify(i18n.t("chat.noMicrophone", "Mikrofonga ruxsat yo'q"), "error");
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
    const res = await sendMessage({ chat_id: chatId, type: "voice", file_url });
    setSending(false);
    
    if (res?.success === false) {
      notify(res.message || i18n.t("chat.sendFail", "Xabar yuborilmadi"), "error");
    } else {
      reloadList?.();
    }
  };

  // ── send ────────────────────────────────────────────────
  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;

    if (editingMsg) {
      setText("");
      setEditingMsg(null);
      textareaRef.current && (textareaRef.current.style.height = "auto");
      const res = await editMessage(editingMsg.id, { content });
      if (res?.success === false) notify(res.message || i18n.t("chat.error", "Xato"), "error");
      else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === editingMsg.id
              ? { ...m, content, is_edited: true }
              : m
          )
        );
      }
      return;
    }

    setSending(true);
    setText("");
    textareaRef.current && (textareaRef.current.style.height = "auto");

    const socket = getSocket();
    socket.emit("stopTyping", { chatId });

    // Optimistik yuborish olib tashlandi, faqat socket va bevosita api
    const res = await sendMessage({ chat_id: chatId, message_text: content });
    setSending(false);

    if (res?.success === false) {
      notify(res.message || i18n.t("chat.sendFail", "Xabar yuborilmadi"), "error");
      setText(content);
    } else {
      reloadList?.();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── context menu actions ────────────────────────────────
  const openContextMenu = (e, msg) => {
    if (msg.deleted_at) return;
    setContextMenu({ x: e.clientX, y: e.clientY, msg });
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

  // ── derived ─────────────────────────────────────────────
  const partnerName = partner
    ? `${partner.first_name || ""} ${partner.last_name || ""}`.trim() ||
      partner.username ||
      "Foydalanuvchi"
    : chatInfo?.id
    ? `Chat #${chatInfo.id.slice(0, 8)}`
    : "Foydalanuvchi";

  // O'chirilgan xabarlarni faqat adminlarga ko'rsatamiz
  const filteredMessages = messages.filter(
    (msg) => !(msg.deleted_at && currentUser?.role !== "admin")
  );

  const grouped = groupMessagesByDate(filteredMessages);

  // ── render ───────────────────────────────────────────────
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
      style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}
      onClick={() => contextMenu && setContextMenu(null)}
    >
      {/* ── HEADER ── */}
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
              ) : (
                <span className="online">{i18n.t("chat.online", "Online")}</span>
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
        </div>
      </div>

      {/* ── MESSAGES ── */}
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
            <div key={group.date}>
              {/* Date separator */}
              <div className="date-separator">
                <div className="date-separator-line" />
                <span className="date-separator-text">{group.date}</span>
                <div className="date-separator-line" />
              </div>

              {/* Messages */}
              {msgs.map((msg, idx) => {
                const isOwn = msg.sender_id === currentUser?.id;
                const prevMsg = msgs[idx - 1];
                const nextMsg = msgs[idx + 1];
                const isFirst =
                  !prevMsg || prevMsg.sender_id !== msg.sender_id;
                const isLast =
                  !nextMsg || nextMsg.sender_id !== msg.sender_id;

                return (
                  <div
                    key={msg.id || idx}
                    className={`msg-group ${isOwn ? "sent" : "received"}`}
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
                    />
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Typing indicator */}
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

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          className="scroll-to-bottom"
          onClick={() => scrollToBottom()}
          title={i18n.t("chat.scrollDown", "Pastga")}
        >
          ↓
        </button>
      )}

      {/* ── INPUT AREA ── */}
      <div className="chat-input-area">
        {/* Edit mode bar */}
        {editingMsg && (
          <div className="edit-mode-bar">
            <span>✏️</span>
            <span>{i18n.t("chat.editing", "Tahrirlash:")} {editingMsg.content?.slice(0, 60)}{editingMsg.content?.length > 60 ? "…" : ""}</span>
            <button
              className="edit-cancel-btn"
              onClick={() => { setEditingMsg(null); setText(""); }}
            >
              ×
            </button>
          </div>
        )}

        <div className="chat-input-wrapper">
          {recording ? (
            <div className="recording-ui">
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
                🗑️
              </button>
              <button
                className="record-send-btn"
                onClick={sendRecording}
                title={i18n.t("chat.send", "Yuborish")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKey}
                placeholder={i18n.t("chat.typeMsgPlaceholder", "Xabar yozing... (Enter — yuborish, Shift+Enter — satr)")}
                rows={1}
              />
            </>
          )}

          {/* Action buttons (Right side) */}
          {!text.trim() && !editingMsg && !recording ? (
               <button
                  className="chat-action-btn telegram-mic-btn"
                  onClick={startRecording}
                  disabled={sending}
                  title={i18n.t("chat.voiceMsg", "Ovozli xabar")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
          ) : !recording && (
              <button
                className={`chat-send-btn ${text.trim() ? "active" : ""}`}
                onClick={handleSend}
                disabled={sending || (!text.trim() && !editingMsg)}
                title={i18n.t("chat.send", "Yuborish")}
              >
                  {sending ? (
                    <div style={{ width: 16, height: 16, border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
              </button>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOwn={contextMenu.msg?.sender_id === currentUser?.id}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`chat-toast ${toast.type || ""}`}>{toast.msg}</div>
      )}
    </div>
  );
}
