import { useEffect, useState } from "react";
import { getChats } from "../../../api/messages";
import { useNavigate } from "react-router-dom";

export default function ChatList() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await getChats();
      if (res?.success === false) setError(res?.message || "Xato");
      else setChats(res?.data || res?.chats || res || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Xabarlar</h1>

      {loading && <p style={{ textAlign: "center", color: "#666" }}>Yuklanmoqda...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && chats.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Hali xabarlar yo'q</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/messages/${chat.id}`)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "#fff", border: "1px solid #e0e0e0",
              borderRadius: 12, padding: "16px 20px", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.borderColor = "#14a800"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e0e0e0"; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%", background: "#14a800",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0
            }}>
              {(chat.other_user_name || chat.name || "?")[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>
                  {chat.other_user_name || chat.name || `Chat #${chat.id}`}
                </div>
                {chat.last_message_at && (
                  <div style={{ fontSize: 11, color: "#aaa" }}>
                    {new Date(chat.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {chat.last_message || "Xabar yo'q"}
              </div>
            </div>
            {chat.unread_count > 0 && (
              <span style={{
                background: "#14a800", color: "#fff",
                borderRadius: "50%", width: 20, height: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, flexShrink: 0
              }}>{chat.unread_count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
