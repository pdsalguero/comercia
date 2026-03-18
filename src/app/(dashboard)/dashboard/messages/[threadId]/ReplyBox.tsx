"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReplyBox({ listingId, receiverId }: { listingId: string | null; receiverId: string }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [message]);

  async function handleSend() {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, receiver_id: receiverId, content: message.trim() }),
      });
      if (res.ok) {
        setMessage("");
        router.refresh();
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = message.trim().length > 0 && !sending;

  return (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: "8px",
      padding: "10px 14px 12px",
      background: "#fff",
      borderTop: "1px solid #f1f5f9",
      flexShrink: 0,
    }}>
      <div style={{
        flex: 1,
        display: "flex", alignItems: "flex-end",
        background: "#f1f5f9",
        borderRadius: "24px",
        padding: "8px 16px",
        minHeight: "44px",
      }}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribí un mensaje..."
          rows={1}
          style={{
            flex: 1,
            border: "none", outline: "none",
            background: "transparent",
            resize: "none",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#0f172a",
            fontFamily: "inherit",
            padding: 0,
            maxHeight: "120px",
            overflowY: "auto",
          }}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!canSend}
        style={{
          width: "44px", height: "44px",
          borderRadius: "50%",
          background: canSend ? "#6366f1" : "#e2e8f0",
          border: "none",
          cursor: canSend ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.15s, transform 0.1s",
        }}
        onMouseDown={e => { if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.92)"; }}
        onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        {sending ? (
          <div style={{
            width: "16px", height: "16px", border: "2px solid #fff",
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={canSend ? "#fff" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2" fill={canSend ? "#fff" : "#94a3b8"} stroke="none"/>
          </svg>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
