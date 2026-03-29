import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createHash } from "crypto";

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua: string): string {
  if (/edg\//i.test(ua))     return "edge";
  if (/opr\/|opera/i.test(ua)) return "opera";
  if (/chrome/i.test(ua))    return "chrome";
  if (/safari/i.test(ua))    return "safari";
  if (/firefox/i.test(ua))   return "firefox";
  return "other";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip + (process.env.IP_HASH_SALT ?? "comerxia")).digest("hex").slice(0, 16);
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function parseLanguage(acceptLang: string | null): string | null {
  if (!acceptLang) return null;
  const tag = acceptLang.split(",")[0].split(";")[0].trim(); // e.g. "es-AR"
  return tag.slice(0, 10) || null;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const page     = typeof body.page === "string" ? body.page.slice(0, 100) : "landing";
    const ua       = req.headers.get("user-agent") ?? "";
    const referrer = req.headers.get("referer")?.slice(0, 200) ?? null;
    const country  = req.headers.get("cf-ipcountry")?.slice(0, 2) ?? null;
    const language = parseLanguage(req.headers.get("accept-language"));
    const ip       = getIp(req);

    const service = createServiceClient();
    await service.from("page_views").insert({
      page,
      referrer,
      device_type: detectDevice(ua),
      browser:     detectBrowser(ua),
      ip_hash:     hashIp(ip),
      country,
      language,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
