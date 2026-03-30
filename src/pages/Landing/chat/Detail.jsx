import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChatHistory, sendMessage, markMessagesAsRead } from "../../../api/messages";

export default function ChatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const bottomRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const loadMessages = async () => {
    const res = await getChatHistory(id);
    const data = res?.data || res?.messages || res || [];
    if (Array.isArray(data)) setMessages(data);
    else if (data?.messages) { setMessages(data.messages); setChatInfo(data); }
    setLoading(false);
    await markMessagesAsRead(id);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // polling
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const res = await sendMessage({ chat_id: id, content: text });
    setSending(false);
    if (res?.success !== false) {
      setText("");
      loadMessages();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexShrink: 0 }}>
        <button onClick={() => navigate("/messages")} style={{ background: "none", border: "none", color: "#14a800", cursor: "pointer", fontWeight: 600 }}>←</button>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: "#14a800",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 14
        }}>
          {(chatInfo?.other_user_name || chatInfo?.name || "?")[0]?.toUpperCase()}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          {chatInfo?.other_user_name || chatInfo?.name || `Chat #${id}`}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10,
        background: "#f9f9f9", borderRadius: 12, padding: 16, border: "1px solid #e0e0e0"
      }}>
        {loading && <p style={{ textAlign: "center", color: "#aaa" }}>Yuklanmoqda...</p>}

        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id || i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "70%", padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: isMe ? "#14a800" : "#fff",
                color: isMe ? "#fff" : "#1a1a1a",
                fontSize: 14, lineHeight: 1.5,
                border: isMe ? "none" : "1px solid #e0e0e0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}>
                {msg.content || msg.message}
                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: "right" }}>
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginTop: 12, flexShrink: 0 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Xabar yozing... (Enter — yuborish)"
          rows={2}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 10,
            border: "1px solid #e0e0e0", fontSize: 14, resize: "none",
            lineHeight: 1.5, outline: "none"
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          style={{
            padding: "0 20px", background: text.trim() ? "#14a800" : "#ccc",
            color: "#fff", border: "none", borderRadius: 10, cursor: text.trim() ? "pointer" : "not-allowed",
            fontWeight: 700, fontSize: 14, transition: "background 0.2s"
          }}
        >{sending ? "..." : "Yuborish"}</button>
      </div>
    </div>
  );
}
