import { NextRequest, NextResponse } from "next/server";
import { getModelosPorMarca } from "@/data/modelos-vehiculos";

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get("brand");
  const tipo = req.nextUrl.searchParams.get("tipo");

  if (!brand || !tipo) return NextResponse.json([]);

  const modelos = getModelosPorMarca(brand, tipo as "auto" | "camioneta");
  return NextResponse.json(modelos);
}
