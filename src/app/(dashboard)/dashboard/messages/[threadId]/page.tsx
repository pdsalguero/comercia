import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReplyBox from "./ReplyBox";
import ScrollToBottom from "./ScrollToBottom";

export const dynamic = "force-dynamic";

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // threadId = "{listingId|direct}_{otherId}"
  const sep = threadId.lastIndexOf("_");
  const rawListingId = threadId.slice(0, sep);
  const otherId = threadId.slice(sep + 1);
  const listingId = rawListingId === "direct" ? null : rawListingId;

  let query = supabase
    .from("messages")
    .select("id, content, is_read, created_at, sender_id, receiver_id")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  if (listingId) query = query.eq("listing_id", listingId);

  const { data: messages, error: msgError } = await query;

  if (msgError) {
    return (
      <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "16px", color: "#dc2626", fontSize: "13px" }}>
        Error: {msgError.message}
      </div>
    );
  }

  const allMsgs = (messages ?? []).filter((m: any) =>
    (m.sender_id === user.id && m.receiver_id === otherId) ||
    (m.sender_id === otherId && m.receiver_id === user.id)
  );

  // Mark as read
  const unreadIds = allMsgs.filter((m: any) => m.receiver_id === user.id && !m.is_read).map((m: any) => m.id);
  if (unreadIds.length > 0) {
    await supabase.from("messages").update({ is_read: true }).in("id", unreadIds);
  }

  const [{ data: otherProfile }, listingResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, avatar_url").eq("id", otherId).single(),
    listingId
      ? supabase.from("listings").select("id, title, price, listing_images(url, position)").eq("id", listingId).single()
      : Promise.resolve({ data: null }),
  ]);

  let listing: { id: string; title: string; price: number; cover: string | null } | null = null;
  if (listingResult.data) {
    const l = listingResult.data as any;
    const imgs = (l.listing_images ?? []) as { url: string; position: number }[];
    const cover = imgs.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))[0]?.url ?? null;
    listing = { id: l.id, title: l.title, price: l.price, cover };
  }

  const otherName = otherProfile?.full_name ?? "Usuario";
  const otherInitial = otherName[0]?.toUpperCase() ?? "?";

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDayLabel(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = (today.getTime() - msgDay.getTime()) / 86400000;
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  }

  // Group messages by day and consecutive sender
  type MsgGroup = { senderId: string; msgs: typeof allMsgs; dayLabel: string | null };
  const groups: MsgGroup[] = [];
  let lastDay = "";
  let lastSender = "";

  for (const msg of allMsgs) {
    const day = new Date(msg.created_at).toDateString();
    const dayLabel = day !== lastDay ? formatDayLabel(msg.created_at) : null;
    if (dayLabel || msg.sender_id !== lastSender) {
      groups.push({ senderId: msg.sender_id, msgs: [msg], dayLabel });
    } else {
      groups[groups.length - 1].msgs.push(msg);
    }
    lastDay = day;
    lastSender = msg.sender_id;
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 160px)", minHeight: "500px",
      background: "#fff", borderRadius: "12px",
      border: "1px solid #e2e8f0", overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "12px 16px",
        background: "#fff",
        borderBottom: "1px solid #f1f5f9",
        flexShrink: 0,
      }}>
        <Link href="/dashboard/messages" style={{
          width: "32px", height: "32px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#64748b", background: "#f1f5f9", flexShrink: 0,
          textDecoration: "none",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>

        {/* Avatar */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          overflow: "hidden", background: "#6366f1",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, color: "#fff", fontSize: "15px", fontWeight: 700,
        }}>
          {otherProfile?.avatar_url
            ? <img src={otherProfile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : otherInitial
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{otherName}</div>
          {listing && (
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Re: {listing.title}
            </div>
          )}
        </div>

        {/* Listing pill */}
        {listing && (
          <Link href={`/listings/${listing.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: "8px", padding: "6px 10px 6px 6px",
              maxWidth: "200px",
            }}>
              {listing.cover && (
                <img src={listing.cover} alt="" style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover", flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "11px", color: "#0f172a", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {listing.title}
                </div>
                <div style={{ fontSize: "11px", color: "#6366f1", fontWeight: 700 }}>
                  ${listing.price.toLocaleString("es-AR")}
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* ── Messages ── */}
      <div
        id="msg-scroll"
        style={{
          flex: 1, overflowY: "auto",
          padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: "2px",
          background: "#f0f2f5",
        }}
      >
        {allMsgs.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>👋</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>Iniciá la conversación</div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>Escribí tu primer mensaje abajo.</div>
          </div>
        )}

        {groups.map((group, gi) => {
          const isMine = group.senderId === user.id;
          return (
            <div key={gi}>
              {/* Day separator */}
              {group.dayLabel && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "12px 0 8px" }}>
                  <span style={{
                    background: "rgba(255,255,255,0.85)", color: "#64748b",
                    fontSize: "11px", fontWeight: 600,
                    padding: "3px 12px", borderRadius: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}>
                    {group.dayLabel}
                  </span>
                </div>
              )}

              {/* Message group */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: isMine ? "flex-end" : "flex-start", marginBottom: "6px" }}>
                {group.msgs.map((msg: any, mi: number) => {
                  const isLast = mi === group.msgs.length - 1;
                  return (
                    <div key={msg.id} style={{ display: "flex", alignItems: "flex-end", gap: "6px", flexDirection: isMine ? "row-reverse" : "row" }}>
                      {/* Avatar placeholder to keep alignment — only show on last of group */}
                      <div style={{ width: "28px", flexShrink: 0 }}>
                        {!isMine && isLast && (
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: "#6366f1", color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "11px", fontWeight: 700,
                          }}>
                            {otherProfile?.avatar_url
                              ? <img src={otherProfile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                              : otherInitial
                            }
                          </div>
                        )}
                      </div>

                      {/* Bubble */}
                      <div style={{
                        maxWidth: "65%",
                        background: isMine ? "#6366f1" : "#fff",
                        color: isMine ? "#fff" : "#0f172a",
                        borderRadius: isMine
                          ? (isLast ? "18px 18px 4px 18px" : "18px 18px 18px 18px")
                          : (isLast ? "18px 18px 18px 4px" : "18px 18px 18px 18px"),
                        padding: "9px 13px",
                        fontSize: "14px",
                        lineHeight: "1.45",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                        wordBreak: "break-word",
                      }}>
                        <div>{msg.content}</div>
                        <div style={{
                          fontSize: "10px", marginTop: "3px",
                          opacity: 0.6, textAlign: "right",
                          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "3px",
                        }}>
                          {formatTime(msg.created_at)}
                          {isMine && (
                            <svg width="12" height="8" viewBox="0 0 16 11" fill="none">
                              <path d="M1 5.5L5.5 10L15 1" stroke={msg.is_read ? "#a5f3fc" : "rgba(255,255,255,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              {msg.is_read && <path d="M4 5.5L8.5 10L18 1" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <ScrollToBottom hasUnread={unreadIds.length > 0} />
      </div>

      {/* ── Input ── */}
      <ReplyBox listingId={listingId} receiverId={otherId} />
    </div>
  );
}
