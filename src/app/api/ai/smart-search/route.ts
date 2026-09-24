// src/app/api/ai/smart-search/route.ts
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

import { parseSmartSearch } from "@/lib/claude/parse-smart-search";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json({ error: "Describí qué estás buscando" }, { status: 400 });
    }
    if (query.length > 300) {
      return NextResponse.json({ error: "La búsqueda es demasiado larga" }, { status: 400 });
    }

    const filters = await parseSmartSearch(query);
    return NextResponse.json({ filters });
  } catch (error: any) {
    const msg = error?.message ?? "Error interno al interpretar la búsqueda";
    const isApiKey = !process.env.ANTHROPIC_API_KEY || msg.includes("API") || msg.includes("401") || msg.includes("403");
    console.error("[smart-search] Error:", msg, { hasKey: !!process.env.ANTHROPIC_API_KEY });
    return NextResponse.json(
      { error: isApiKey ? "ANTHROPIC_API_KEY no configurada en el servidor" : msg },
      { status: 500 },
    );
  }
}
