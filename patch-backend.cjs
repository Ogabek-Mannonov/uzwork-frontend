const fs = require('fs');

const path = '../uzwork-backend/src/server.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('socket.on("removeReaction"')) {
  // We need to inject removeReaction handler right after addReaction handler
  const targetFn = 'socket.on("addReaction", async ({ chatId, messageId, emoji }) => {';
  
  const removeLogic = `
  socket.on("removeReaction", async ({ chatId, messageId, emoji, userId }) => {
    if (!chatId || !messageId || !emoji) return;
    try {
      const updateQuery = \`
        UPDATE messages
        SET reactions = (
          SELECT COALESCE(
            jsonb_agg(
              CASE 
                WHEN elem->>'emoji' = $1 THEN 
                  CASE 
                    WHEN (elem->>'count')::int > 1 THEN jsonb_set(elem, '{count}', ( (elem->>'count')::int - 1 )::text::jsonb)
                    ELSE NULL
                  END
                ELSE elem
              END
            ) FILTER (WHERE CASE WHEN elem->>'emoji' = $1 THEN (elem->>'count')::int > 1 ELSE true END),
            '[]'::jsonb
          )
          FROM jsonb_array_elements(reactions) AS elem
        )
        WHERE id = $2
        RETURNING reactions;
      \`;
      const res = await pool.query(updateQuery, [emoji, messageId]);
      if (res.rows.length > 0) {
        // Option 1: rely on optimistic frontend
        // io.to(chatId).emit("reactionRemoved", { messageId, emoji, reactions: res.rows[0].reactions });
      }
    } catch (err) {
      console.error("❌ socket removeReaction error:", err.message);
    }
  });

  socket.on("addReaction", async ({ chatId, messageId, emoji }) => {`;

  const newContent = content.replace(targetFn, removeLogic);
  
  if(newContent !== content) {
    fs.writeFileSync(path, newContent, 'utf8');
    console.log("Backend server.js patched successfully.");
  } else {
    console.log("Failed to patch backend server.js - target not found.");
  }
} else {
  console.log("Backend server.js already has removeReaction.");
}
