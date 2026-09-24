"use client";
// Estado de favoritos compartido por todos los corazones de la página. Antes cada FavoriteButton
// llamaba a auth.getUser() (un pedido a /auth/v1/user) y consultaba su propio aviso: con 7 tarjetas
// eran 7 + 7 pedidos y los corazones aparecían de a uno. Ahora, una vez por carga:
//   - la sesión se lee del almacenamiento local (onAuthStateChange, sin pedido de red);
//   - 2 consultas: los avisos favoritos del usuario y sus propios avisos (en esos no hay corazón).
// La RLS de listing_favorites sigue validando cada alta/baja.
import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

interface FavoritesState {
  /** false hasta saber si hay sesión y, si la hay, hasta cargar las listas */
  ready: boolean;
  userId: string | null;
  favorites: ReadonlySet<string>;
  own: ReadonlySet<string>;
}

const EMPTY: FavoritesState = { ready: false, userId: null, favorites: new Set(), own: new Set() };
let state: FavoritesState = EMPTY;
const listeners = new Set<() => void>();
let started = false;
let loadedFor: string | null | undefined;

function set(next: Partial<FavoritesState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

async function loadFor(userId: string | null) {
  if (loadedFor === userId) return;
  loadedFor = userId;
  if (!userId) {
    set({ ready: true, userId: null, favorites: new Set(), own: new Set() });
    return;
  }
  const supabase = createClient();
  const [favs, mine] = await Promise.all([
    supabase.from("listing_favorites").select("listing_id").eq("user_id", userId),
    supabase.from("listings").select("id").eq("user_id", userId),
  ]);
  if (loadedFor !== userId) return; // cambió la sesión mientras cargaba
  set({
    ready: true,
    userId,
    favorites: new Set((favs.data ?? []).map((r) => r.listing_id as string)),
    own: new Set((mine.data ?? []).map((r) => r.id as string)),
  });
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  // INITIAL_SESSION llega enseguida con la sesión guardada; también avisa al iniciar o cerrar sesión.
  createClient().auth.onAuthStateChange((_event, session) => {
    void loadFor(session?.user?.id ?? null);
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFavorites(): FavoritesState {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

/** Alta/baja optimista; si la base la rechaza, se revierte. */
export async function toggleFavorite(listingId: string): Promise<void> {
  const { userId, favorites } = state;
  if (!userId) return;
  const wasFav = favorites.has(listingId);
  const next = new Set(favorites);
  if (wasFav) next.delete(listingId); else next.add(listingId);
  set({ favorites: next });

  const supabase = createClient();
  const { error } = wasFav
    ? await supabase.from("listing_favorites").delete().eq("user_id", userId).eq("listing_id", listingId)
    : await supabase.from("listing_favorites").insert({ user_id: userId, listing_id: listingId });
  if (error) {
    const reverted = new Set(state.favorites);
    if (wasFav) reverted.add(listingId); else reverted.delete(listingId);
    set({ favorites: reverted });
  }
}
