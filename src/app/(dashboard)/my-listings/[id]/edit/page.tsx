import { redirect } from "next/navigation";

// Ruta vieja: la edición vive en /dashboard/my-listings/[id]/edit (igual que /my-listings → /dashboard/my-listings).
export default async function EditListingLegacyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { id } = await params;
  const { upgraded } = await searchParams;
  redirect(`/dashboard/my-listings/${id}/edit${upgraded ? `?upgraded=${upgraded}` : ""}`);
}
