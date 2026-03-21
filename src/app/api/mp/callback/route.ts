import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

const BASE = process.env.NEXT_PUBLIC_APP_URL!;

/**
 * MercadoPago redirects here after checkout.
 * Query params: status, external_reference, payment_id, collection_status
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status =
    searchParams.get("status") ??
    searchParams.get("collection_status");
  const externalRef = searchParams.get("external_reference");

  if (status !== "approved" || !externalRef) {
    const parts = (externalRef ?? "").split("|");
    const listingId = parts[0];
    const back = listingId
      ? `${BASE}/upgrade?listing_id=${listingId}&error=1`
      : `${BASE}/upgrade?error=1`;
    return NextResponse.redirect(back);
  }

  const [listingId, planKey, userId] = externalRef.split("|");
  if (!listingId || !planKey || !userId) {
    return NextResponse.redirect(`${BASE}/upgrade?error=1`);
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("listings")
    .update({ featured_level: planKey })
    .eq("id", listingId)
    .eq("user_id", userId);

  if (error) {
    console.error("MP callback — DB error:", error.message);
    return NextResponse.redirect(`${BASE}/upgrade?listing_id=${listingId}&error=1`);
  }

  return NextResponse.redirect(
    `${BASE}/dashboard/my-listings/${listingId}/edit?upgraded=1`
  );
}
