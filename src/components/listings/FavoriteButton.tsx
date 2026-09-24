"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite, useFavorites } from "@/lib/favorites-store";

interface Props {
  listingId: string;
  /** Tamaño del botón: "card" (círculo pequeño) | "detail" (ancho completo) */
  variant?: "card" | "detail";
}

// Lee de un store compartido (lib/favorites-store): una sola carga por página para todos los corazones.
export function FavoriteButton({ listingId, variant = "card" }: Props) {
  const { ready, userId, favorites, own } = useFavorites();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const favorited = favorites.has(listingId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      router.push("/login");
      return;
    }
    startTransition(() => toggleFavorite(listingId));
  }

  // No se puede guardar un aviso propio: el botón no se muestra.
  if (own.has(listingId)) return null;

  if (variant === "detail") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending || !ready}
        aria-pressed={favorited}
        style={{
          width: "100%", padding: "10px",
          background: favorited ? "#fff1f2" : "#fff",
          color: favorited ? "#e11d48" : "#64748b",
          border: favorited ? "1px solid #fecdd3" : "1px solid #e2e8f0",
          borderRadius: "8px", fontSize: "13px",
          fontWeight: 600, cursor: ready ? "pointer" : "default",
          fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transition: "all 0.15s",
        }}
      >
        {favorited ? "❤️" : "🤍"}
        {favorited ? "Guardado en favoritos" : "Guardar favorito"}
      </button>
    );
  }

  // card variant — small circle
  return (
    <button
      onClick={handleClick}
      disabled={isPending || !ready}
      aria-pressed={favorited}
      aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
      style={{
        position: "absolute", top: "8px", right: "8px",
        background: favorited ? "rgba(255,241,242,0.95)" : "rgba(255,255,255,0.9)",
        border: "none", borderRadius: "50%",
        width: "32px", height: "32px",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: ready ? "pointer" : "default",
        fontSize: "15px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
        transition: "background 0.15s",
      }}
    >
      {favorited ? "❤️" : "🤍"}
    </button>
  );
}
