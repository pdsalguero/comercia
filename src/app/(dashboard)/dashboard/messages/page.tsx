import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch messages (simple query, no joins)
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("id, content, is_read, created_at, sender_id, receiver_id, listing_id")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (msgError) {
    return (
      <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "16px", color: "#dc2626", fontSize: "13px" }}>
        Error al cargar mensajes: {msgError.message} (code: {msgError.code})
      </div>
    );
  }

  const msgList = (messages as any[]) ?? [];

  // Collect unique IDs for related data
  const otherIds = new Set<string>();
  const listingIds = new Set<string>();
  for (const msg of msgList) {
    if (msg.sender_id !== user.id) otherIds.add(msg.sender_id);
    if (msg.receiver_id !== user.id) otherIds.add(msg.receiver_id);
    if (msg.listing_id) listingIds.add(msg.listing_id);
  }

  // Fetch profiles and listings in parallel
  const [{ data: profiles }, { data: listingRows }] = await Promise.all([
    otherIds.size > 0
      ? supabase.from("profiles").select("id, full_name, avatar_url").in("id", Array.from(otherIds))
      : Promise.resolve({ data: [] }),
    listingIds.size > 0
      ? supabase.from("listings").select("id, title, listing_images(url, position)").in("id", Array.from(listingIds))
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]));
  const listingMap = Object.fromEntries((listingRows ?? []).map((l: any) => {
    const imgs = (l.listing_images ?? []) as { url: string; position: number }[];
    const cover = imgs.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url ?? null;
    return [l.id, { title: l.title, cover }];
  }));

  // Group messages into conversations by (listing_id + other_party_id)
  const convMap = new Map<string, { key: string; listingId: string | null; listingTitle: string | null; listingCover: string | null; otherId: string; otherName: string; otherAvatar: string | null; lastMessage: string; lastDate: string; unread: number }>();

  for (const msg of msgList) {
    const isReceiver = msg.receiver_id === user.id;
    const otherId = isReceiver ? msg.sender_id : msg.receiver_id;
    const otherProfile = profileMap[otherId] ?? null;
    const listing = msg.listing_id ? listingMap[msg.listing_id] ?? null : null;
    const key = `${msg.listing_id ?? "direct"}_${otherId}`;

    if (!convMap.has(key)) {
      convMap.set(key, {
        key,
        listingId: msg.listing_id ?? null,
        listingTitle: listing?.title ?? null,
        listingCover: listing?.cover ?? null,
        otherId,
        otherName: otherProfile?.full_name ?? "Usuario",
        otherAvatar: otherProfile?.avatar_url ?? null,
        lastMessage: msg.content,
        lastDate: msg.created_at,
        unread: isReceiver && !msg.is_read ? 1 : 0,
      });
    } else {
      const conv = convMap.get(key)!;
      if (isReceiver && !msg.is_read) conv.unread++;
    }
  }

  const conversations = Array.from(convMap.values());
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = diffMs / 1000 / 3600;
    if (diffH < 1) return "Hace menos de 1h";
    if (diffH < 24) return `Hace ${Math.floor(diffH)}h`;
    if (diffH < 48) return "Ayer";
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
          Mensajes
          {totalUnread > 0 && (
            <span style={{ marginLeft: "8px", background: "#ef4444", color: "#fff", fontSize: "12px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>
              {totalUnread}
            </span>
          )}
        </h1>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: "2px 0 0" }}>
          {conversations.length} conversación{conversations.length !== 1 ? "es" : ""}
        </p>
      </div>

      {/* List */}
      <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        {conversations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 32px", color: "#94a3b8" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#64748b", margin: "0 0 6px" }}>
              No tenés mensajes todavía
            </p>
            <p style={{ fontSize: "13px", margin: 0 }}>
              Cuando contactes a un vendedor o alguien te escriba, aparecerá acá.
            </p>
          </div>
        ) : conversations.map((conv, i) => (
          <Link
            key={conv.key}
            href={`/dashboard/messages/${conv.key}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 20px",
                borderBottom: i < conversations.length - 1 ? "1px solid #f1f5f9" : "none",
                background: conv.unread > 0 ? "#f0f7ff" : "#fff",
              }}
              className="hover:bg-slate-50 transition-colors"
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {conv.otherAvatar
                    ? <img src={conv.otherAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  }
                </div>
                {conv.unread > 0 && (
                  <span style={{ position: "absolute", top: "-2px", right: "-2px", background: "#ef4444", color: "#fff", fontSize: "9px", fontWeight: 800, borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {conv.unread}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: conv.unread > 0 ? 800 : 600, color: "#1e293b" }}>
                    {conv.otherName}
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8", flexShrink: 0, marginLeft: "8px" }}>
                    {formatDate(conv.lastDate)}
                  </span>
                </div>
                {conv.listingTitle && (
                  <div style={{ fontSize: "11px", color: "#6366f1", fontWeight: 600, marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Re: {conv.listingTitle}
                  </div>
                )}
                <div style={{ fontSize: "13px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {conv.lastMessage}
                </div>
              </div>

              {/* Listing thumbnail */}
              {conv.listingCover && (
                <div style={{ width: "44px", height: "44px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#f0f4ff" }}>
                  <img src={conv.listingCover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
