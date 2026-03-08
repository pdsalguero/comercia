// src/app/api/ai/analyze-photo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzePhotoWithClaude } from "@/lib/claude/analyze-photo";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const photo = formData.get("photo") as File | null;

    if (!photo) {
      return NextResponse.json(
        { error: "No se recibió ninguna foto" },
        { status: 400 },
      );
    }

    // ── Convert to base64 ──────────────────────────────────────
    const buffer = await photo.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Detect actual MIME type from magic bytes (ignores browser-reported type)
    const bytes = new Uint8Array(buffer);
    let mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";
    if (bytes[0] === 0x89 && bytes[1] === 0x50) mimeType = "image/png";
    else if (bytes[0] === 0xff && bytes[1] === 0xd8) mimeType = "image/jpeg";
    else if (bytes[0] === 0x47 && bytes[1] === 0x49) mimeType = "image/gif";
    else if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) mimeType = "image/webp";

    // ── Run Claude analysis ────────────────────────────────────
    const aiResult = await analyzePhotoWithClaude(base64, mimeType);

    // ── Fetch internal price reference from Supabase ───────────
    let priceData = null;
    try {
      const supabase = await createClient();
      if (aiResult.category_id) {
        const { data: listings } = await supabase
          .from("listings")
          .select("price")
          .eq("category_id", aiResult.category_id)
          .eq("status", "active")
          .gte("created_at", new Date(Date.now() - 90 * 86400000).toISOString())
          .not("price", "is", null);

        if (listings && listings.length >= 3) {
          const prices = listings.map((l) => l.price).sort((a, b) => a - b);
          const trimmed = prices.slice(
            Math.floor(prices.length * 0.1),
            Math.ceil(prices.length * 0.9),
          );
          priceData = {
            source: "comercia",
            count: trimmed.length,
            min: Math.min(...trimmed),
            max: Math.max(...trimmed),
            avg: Math.round(
              trimmed.reduce((a, b) => a + b, 0) / trimmed.length,
            ),
            suggested: trimmed[Math.floor(trimmed.length / 2)],
          };
        }
      }
    } catch {
      // price lookup is non-critical
    }

    // ── Build response ─────────────────────────────────────────
    const response = {
      // Core fields
      title: aiResult.title ?? "",
      description: aiResult.description ?? "",
      category_id: aiResult.category_id ?? 0,
      condition: aiResult.condition ?? "",
      price_suggested: priceData?.suggested ?? aiResult.price_suggested ?? 0,

      // Category-specific attributes (the big one)
      attributes: aiResult.attributes ?? {},

      // Price intelligence
      price_data: priceData,

      // Debug info (remove in prod if desired)
      ai_raw: {
        model: "claude-haiku-4-5-20251001",
        category: aiResult.category_id,
        fields_detected: Object.keys(aiResult.attributes ?? {}).length,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[analyze-photo] Error:", error);
    return NextResponse.json(
      { error: error.message ?? "Error interno al analizar la foto" },
      { status: 500 },
    );
  }
}
