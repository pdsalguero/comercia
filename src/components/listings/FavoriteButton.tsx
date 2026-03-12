"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  listingId: string;
  /** Tamaño del botón: "card" (círculo pequeño) | "detail" (ancho completo) */
  variant?: "card" | "detail";
}

export function FavoriteButton({ listingId, variant = "card" }: Props) {
  const [favorited, setFavorited] = useState(false);
  const [userId, setUserId]       = useState<string | null>(null);
  const [mounted, setMounted]     = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Load user + initial state
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) { setMounted(true); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("listing_favorites")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .maybeSingle();

      if (!cancelled) {
        setFavorited(!!data);
        setMounted(true);
      }
    })();

    return () => { cancelled = true; };
  }, [listingId]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      if (favorited) {
        await supabase
          .from("listing_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", listingId);
        setFavorited(false);
      } else {
        await supabase
          .from("listing_favorites")
          .insert({ user_id: userId, listing_id: listingId });
        setFavorited(true);
      }
    });
  }

  if (variant === "detail") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending || !mounted}
        style={{
          width: "100%", padding: "10px",
          background: favorited ? "#fff1f2" : "#fff",
          color: favorited ? "#e11d48" : "#64748b",
          border: favorited ? "1px solid #fecdd3" : "1px solid #e2e8f0",
          borderRadius: "8px", fontSize: "13px",
          fontWeight: 600, cursor: mounted ? "pointer" : "default",
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
      disabled={isPending || !mounted}
      style={{
        position: "absolute", top: "8px", right: "8px",
        background: favorited ? "rgba(255,241,242,0.95)" : "rgba(255,255,255,0.9)",
        border: "none", borderRadius: "50%",
        width: "32px", height: "32px",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: mounted ? "pointer" : "default",
        fontSize: "15px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
        transition: "background 0.15s",
      }}
    >
      {favorited ? "❤️" : "🤍"}
    </button>
  );
}
