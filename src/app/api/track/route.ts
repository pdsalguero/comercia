import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const page = typeof body.page === "string" ? body.page.slice(0, 100) : "landing";
    const referrer = req.headers.get("referer")?.slice(0, 200) ?? null;

    const service = createServiceClient();
    await service.from("page_views").insert({ page, referrer });

    return NextResponse.json({ ok: true });
  } catch {
    // Non-critical — never fail the page load
    return NextResponse.json({ ok: false });
  }
}
