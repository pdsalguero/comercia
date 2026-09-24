import { notFound } from "next/navigation";
import { isKnownCategorySlug } from "@/lib/category-meta";

// Valida el slug ANTES del loading.tsx de esta ruta: si notFound() se llama recién en page.tsx, la
// respuesta ya salió con estado 200 (streaming) y /category/<inexistente> no devolvía un 404 real.
export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isKnownCategorySlug(slug)) notFound();
  return children;
}
