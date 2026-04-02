import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EditForm } from "./EditForm";

async function saveListing(id: string, formData: FormData): Promise<{ error?: string }> {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const title       = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price       = Number(String(formData.get("price") ?? "0").replace(/[^0-9]/g, ""));
  const currency    = formData.get("currency") as string;
  const condition   = formData.get("condition") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const attributesRaw = formData.get("attributes") as string;
  let attributes: Record<string, any> = {};
  try { attributes = JSON.parse(attributesRaw); } catch { /* ignore */ }

  const { error } = await supabase
    .from("listings")
    .update({ title, description, price, currency, condition: condition || null, neighborhood: neighborhood || null, attributes })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/my-listings");
  revalidatePath(`/listings/${id}`);
  return {};
}

async function deleteImage(imageId: string): Promise<void> {
  "use server";
  const supabase = await createClient();
  await supabase.from("listing_images").delete().eq("id", imageId);
  revalidatePath("/my-listings");
}

async function addImage(listingId: string, url: string): Promise<void> {
  "use server";
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("listing_images")
    .select("position")
    .eq("listing_id", listingId)
    .order("position", { ascending: false })
    .limit(1);
  const nextPosition = (existing?.[0]?.position ?? -1) + 1;
  await supabase.from("listing_images").insert({ listing_id: listingId, url, position: nextPosition });
  revalidatePath("/my-listings");
}

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listing } = await supabase
    .from("listings")
    .select(`
      id, title, description, price, currency, condition,
      neighborhood, category_id, attributes, featured_level,
      listing_images(id, url, position)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!listing) notFound();

  const images = ((listing.listing_images as any[]) ?? [])
    .sort((a, b) => a.position - b.position);

  const save = saveListing.bind(null, id);
  const addImg = addImage.bind(null, id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/my-listings" style={{ color: "#64748b", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
          ← Mis avisos
        </Link>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <span style={{ fontSize: "13px", color: "#94a3b8", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {listing.title}
        </span>
      </div>

      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px" }}>Editar aviso</h1>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Los cambios se aplican de inmediato en el aviso publicado.</p>
      </div>

      {/* Upsell destacado */}
      {!listing.featured_level && (
        <div style={{
          background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
          border: "1.5px solid #fde68a",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "14px", color: "#92400e", marginBottom: "2px" }}>
              ⭐ Destacá este aviso y vendé más rápido
            </div>
            <div style={{ fontSize: "12px", color: "#b45309" }}>
              Los avisos destacados reciben hasta 5× más visitas y aparecen primero en los resultados.
            </div>
          </div>
          <Link href={`/upgrade?listing_id=${listing.id}`} style={{
            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
            color: "#fff",
            borderRadius: "8px",
            padding: "9px 20px",
            fontWeight: 800,
            fontSize: "13px",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            Ver planes →
          </Link>
        </div>
      )}

      <EditForm
        listing={{
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          currency: listing.currency,
          condition: listing.condition,
          neighborhood: listing.neighborhood,
          category_id: listing.category_id,
          attributes: listing.attributes as Record<string, any> | null,
        }}
        images={images}
        onSave={save}
        onDeleteImage={deleteImage}
        onAddImage={addImg}
      />
    </div>
  );
}
