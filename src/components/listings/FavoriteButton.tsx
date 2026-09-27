"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite, useFavorites } from "@/lib/favorites-store";

interface Props {
  listingId: string;
  /** "card": círculo sobre la foto | "detail": ancho completo con texto | "icon": corazón suelto
   *  (arriba a la derecha de la tarjeta de la ficha) */
  variant?: "card" | "detail" | "icon";
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

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || !ready}
        aria-pressed={favorited}
        aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
        title={favorited ? "Guardado en favoritos" : "Guardar en favoritos"}
        className="tap-44"
        style={{
          flexShrink: 0, width: "38px", height: "38px", borderRadius: "50%",
          background: favorited ? "#fff1f2" : "#fff",
          border: `1px solid ${favorited ? "#fecdd3" : "#e2e8f0"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "17px", cursor: ready ? "pointer" : "default", padding: 0,
          transition: "all 0.15s",
        }}
      >
        {favorited ? "❤️" : "🤍"}
      </button>
    );
  }

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
      className="tap-44 fav-card"
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
