// src/app/api/ai/analyze-photo/route.ts
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // seconds — needed for Railway / Vercel
import { analyzePhotoWithClaude } from "@/lib/claude/analyze-photo";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const photoEntries = formData.getAll("photos") as File[];
    // Support legacy single-photo field too
    const singlePhoto = formData.get("photo") as File | null;
    const files = photoEntries.length > 0 ? photoEntries : singlePhoto ? [singlePhoto] : [];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No se recibió ninguna foto" },
        { status: 400 },
      );
    }

    // ── Convert all photos to base64 ───────────────────────────
    function detectMime(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
      if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
      if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
      if (bytes[0] === 0x47 && bytes[1] === 0x49) return "image/gif";
      if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
      return "image/jpeg";
    }

    const images = await Promise.all(files.slice(0, 5).map(async (file) => {
      const buffer = await file.arrayBuffer();
      return {
        base64: Buffer.from(buffer).toString("base64"),
        mimeType: detectMime(new Uint8Array(buffer)),
      };
    }));

    // ── Run Claude analysis with all images ────────────────────
    const aiResult = await analyzePhotoWithClaude(images);

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
            source: "comerxia",
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
        model: "claude-sonnet-4-6",
        photos_analyzed: images.length,
        category: aiResult.category_id,
        fields_detected: Object.keys(aiResult.attributes ?? {}).length,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const msg = error?.message ?? "Error interno al analizar la foto";
    const isApiKey = !process.env.ANTHROPIC_API_KEY || msg.includes("API") || msg.includes("401") || msg.includes("403");
    console.error("[analyze-photo] Error:", msg, { hasKey: !!process.env.ANTHROPIC_API_KEY });
    return NextResponse.json(
      {
        error: isApiKey
          ? "ANTHROPIC_API_KEY no configurada en el servidor"
          : msg,
      },
      { status: 500 },
    );
  }
}
