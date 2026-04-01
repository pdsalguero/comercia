import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { nuevoMensajeTemplate } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listing_id, receiver_id, content } = await req.json();
  if (!receiver_id || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await supabase.from("messages").insert({
    listing_id: listing_id ?? null,
    sender_id: user.id,
    receiver_id,
    content: content.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notificar al receptor por email (fire-and-forget)
  const service = createServiceClient();
  const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  Promise.all([
    service.auth.admin.getUserById(receiver_id),
    service.from("profiles").select("full_name").eq("id", receiver_id).single(),
    service.from("profiles").select("full_name").eq("id", user.id).single(),
    listing_id
      ? service.from("listings").select("title").eq("id", listing_id).single()
      : Promise.resolve({ data: null }),
  ]).then(([{ data: receiverAuth }, { data: receiverProfile }, { data: senderProfile }, { data: listing }]) => {
    const receiverEmail = receiverAuth?.user?.email;
    if (!receiverEmail) return;

    const receiverName = receiverProfile?.full_name?.split(" ")[0] ?? receiverEmail.split("@")[0];
    const senderName   = senderProfile?.full_name ?? "Alguien";
    const listingTitle = listing?.title ?? "un aviso";

    const { subject, html } = nuevoMensajeTemplate({
      userName:       receiverName,
      senderName,
      listingTitle,
      messagePreview: content.trim(),
      threadUrl:      `${BASE}/dashboard/messages`,
    });

    sendEmail({ to: receiverEmail, subject, html }).catch(console.error);
  }).catch(console.error);

  return NextResponse.json({ ok: true });
}
