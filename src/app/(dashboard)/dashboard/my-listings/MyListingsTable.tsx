"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DeleteButton } from "./DeleteButton";
import { QuickPriceEdit } from "./QuickPriceEdit";

const STATUS_LABEL: Record<string, string> = {
  active: "Activo", paused: "Pausado", sold: "Vendido", expired: "Vencido", draft: "Borrador",
};
const STATUS_DOT: Record<string, string> = {
  active: "#16a34a", paused: "#ca8a04", sold: "#0369a1", expired: "#dc2626", draft: "#9ca3af",
};
const STATUS_BG: Record<string, string> = {
  active: "#f0fdf4", paused: "#fefce8", sold: "#eff6ff", expired: "#fef2f2", draft: "#f9fafb",
};
const CAT_NAMES: Record<string, string> = {
  electronics: "Tecnología", vehicles: "Vehículos", "real-estate": "Inmuebles",
  clothing: "Ropa", "home-garden": "Hogar", sports: "Deportes",
  tools: "Herramientas", books: "Libros", pets: "Mascotas", services: "Servicios", other: "Otros",
};

interface Listing {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  status: string;
  view_count: number | null;
  favorite_count: number | null;
  featured_level: string | null;
  created_at: string;
  bumped_at: string | null;
  listing_images: { url: string; position: number }[] | null;
  categories: { name: string; slug: string } | null;
  description?: string | null;
}

interface Props {
  listings: Listing[];
  msgCountMap: Record<string, number>;
  onToggleStatus: (id: string, current: string) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onUpdatePrice: (id: string, price: number) => Promise<void>;
  onBulkAction: (ids: string[], action: string) => Promise<void>;
}

function completeness(listing: Listing): string | null {
  const images = listing.listing_images ?? [];
  if (images.length === 0) return "Faltan fotos";
  if (!listing.price || listing.price === 0) return "Sin precio";
  return null;
}

type ConfirmState = { action: string; ids: string[] } | null;

const CONFIRM_CONFIG: Record<string, { title: string; icon: string; confirmLabel: string; confirmColor: string; confirmBg: string; isDanger: boolean }> = {
  delete:   { title: "Eliminar avisos",    icon: "🗑",  confirmLabel: "Sí, eliminar",    confirmColor: "#fff",     confirmBg: "#ef4444", isDanger: true },
  pause:    { title: "Pausar avisos",      icon: "⏸",  confirmLabel: "Sí, pausar",      confirmColor: "#92400e",  confirmBg: "#fef3c7", isDanger: false },
  activate: { title: "Activar avisos",     icon: "▶",  confirmLabel: "Sí, activar",     confirmColor: "#14532d",  confirmBg: "#dcfce7", isDanger: false },
  bump:     { title: "Actualizar avisos",  icon: "↑",  confirmLabel: "Sí, actualizar",  confirmColor: "#1e3a8a",  confirmBg: "#dbeafe", isDanger: false },
};

const BUMP_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

function bumpCooldownRemaining(bumpedAt: string | null): number {
  if (!bumpedAt) return 0;
  return Math.max(0, BUMP_COOLDOWN_MS - (Date.now() - new Date(bumpedAt).getTime()));
}

function formatCooldown(ms: number): string {
  const hours = Math.ceil(ms / (1000 * 60 * 60));
  return hours >= 24 ? `${Math.ceil(hours / 24)}d` : `${hours}h`;
}

export function MyListingsTable({ listings, msgCountMap, onToggleStatus, onDelete, onUpdatePrice, onBulkAction }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [bumpingIds, setBumpingIds] = useState<Set<string>>(new Set());
  const [localBumpedAt, setLocalBumpedAt] = useState<Record<string, string | null>>({});
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const allIds = listings.map(l => l.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }
  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleBulk(action: string) {
    setConfirmState({ action, ids: [...selected] });
  }

  async function executeBulk() {
    if (!confirmState) return;
    setConfirmState(null);
    setBulkLoading(true);
    await onBulkAction(confirmState.ids, confirmState.action);
    setSelected(new Set());
    setBulkLoading(false);
    router.refresh();
  }

  async function handleToggle(id: string, status: string) {
    startTransition(async () => {
      await onToggleStatus(id, status);
      router.refresh();
    });
  }

  async function handleBump(id: string) {
    setBumpingIds(prev => new Set(prev).add(id));
    const res = await fetch("/api/listings/bump", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: id }),
    });
    const data = await res.json();
    if (data.ok) {
      setLocalBumpedAt(prev => ({ ...prev, [id]: new Date().toISOString() }));
      router.refresh();
    }
    setBumpingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  return (
    <div>
      {/* Bulk action bar */}
      {someSelected && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 16px", marginBottom: "10px",
          background: "#1e293b", borderRadius: "10px", flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
            {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
          </span>
          <div style={{ width: "1px", height: "20px", background: "#334155" }} />
          {[
            { action: "activate",   label: "Activar",     color: "#16a34a", bg: "#dcfce7" },
            { action: "pause",      label: "Pausar",      color: "#ca8a04", bg: "#fef9c3" },
            { action: "bump",       label: "Actualizar",  color: "#1d4ed8", bg: "#dbeafe" },
            { action: "delete",     label: "Eliminar",    color: "#dc2626", bg: "#fee2e2" },
          ].map(b => (
            <button key={b.action} onClick={() => handleBulk(b.action)} disabled={bulkLoading}
              style={{
                padding: "5px 12px", borderRadius: "6px", border: "none",
                fontSize: "12px", fontWeight: 700, cursor: bulkLoading ? "wait" : "pointer",
                background: b.bg, color: b.color, opacity: bulkLoading ? 0.6 : 1,
              }}>
              {b.label}
            </button>
          ))}
          <button onClick={() => setSelected(new Set())}
            style={{
              marginLeft: "auto", padding: "5px 10px", borderRadius: "6px",
              border: "1px solid #334155", background: "transparent",
              color: "#94a3b8", fontSize: "12px", cursor: "pointer",
            }}>
            Deseleccionar
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirmState && (() => {
        const cfg = CONFIRM_CONFIG[confirmState.action];
        const n = confirmState.ids.length;
        return (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
            backdropFilter: "blur(2px)",
          }} onClick={() => setConfirmState(null)}>
            <div style={{
              background: "#fff", borderRadius: "16px", padding: "28px 28px 24px",
              width: "360px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              animation: "fadeUp 0.15s ease",
            }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: "36px", marginBottom: "10px", lineHeight: 1 }}>{cfg.icon}</div>
              <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                {cfg.title}
              </h3>
              <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
                {confirmState.action === "delete"
                  ? <>Vas a eliminar <strong>{n} aviso{n !== 1 ? "s" : ""}</strong>. Esta acción <strong>no se puede deshacer</strong>.</>
                  : confirmState.action === "bump"
                  ? <>Vas a actualizar la fecha de <strong>{n} aviso{n !== 1 ? "s" : ""}</strong> activo{n !== 1 ? "s" : ""} para que aparezcan al tope.</>
                  : <>Vas a {confirmState.action === "pause" ? "pausar" : "activar"} <strong>{n} aviso{n !== 1 ? "s" : ""}</strong>.</>
                }
              </p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button onClick={() => setConfirmState(null)} style={{
                  padding: "9px 18px", borderRadius: "8px",
                  border: "1.5px solid #e2e8f0", background: "#fff",
                  fontSize: "13px", fontWeight: 600, color: "#64748b", cursor: "pointer",
                }}>
                  Cancelar
                </button>
                <button onClick={executeBulk} style={{
                  padding: "9px 18px", borderRadius: "8px", border: "none",
                  background: cfg.confirmBg, color: cfg.confirmColor,
                  fontSize: "13px", fontWeight: 700, cursor: "pointer",
                }}>
                  {cfg.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        {/* Header */}
        {listings.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "36px 88px 1fr 130px 170px 110px 1px 220px",
            padding: "10px 20px",
            background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
            fontSize: "11px", fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.05em", alignItems: "center",
          }}>
            <div>
              <input type="checkbox" checked={allSelected} onChange={toggleAll}
                style={{ width: "15px", height: "15px", cursor: "pointer", accentColor: "#6366f1" }} />
            </div>
            <span>Foto</span>
            <span>Publicación</span>
            <span style={{ textAlign: "right" }}>Precio</span>
            <span style={{ textAlign: "center" }}>Estadísticas</span>
            <span style={{ textAlign: "center" }}>Estado</span>
            <span />
            <span style={{ textAlign: "right" }}>Acciones</span>
          </div>
        )}

        {listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 32px", color: "#94a3b8" }}>
            <div style={{ fontSize: "52px", marginBottom: "14px" }}>🔍</div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#64748b", margin: "0 0 6px" }}>No se encontraron resultados</p>
            <p style={{ fontSize: "13px", margin: 0 }}>Probá con otro término o filtro</p>
          </div>
        ) : listings.map((listing, i) => {
          const images = listing.listing_images?.slice().sort((a, b) => a.position - b.position) ?? [];
          const cover = images[0]?.url ?? null;
          const isActive = listing.status === "active";
          const canToggle = listing.status === "active" || listing.status === "paused";
          const tip = completeness(listing);
          const msgs = msgCountMap[listing.id] ?? 0;
          const isSelected = selected.has(listing.id);
          const bumpedAt = localBumpedAt[listing.id] ?? listing.bumped_at ?? null;
          const bumpCooldown = mounted ? bumpCooldownRemaining(bumpedAt) : 0;
          const onBumpCooldown = bumpCooldown > 0;
          const isBumping = bumpingIds.has(listing.id);

          return (
            <div key={listing.id}
              style={{
                display: "grid",
                gridTemplateColumns: "36px 88px 1fr 130px 170px 110px 1px 220px",
                alignItems: "center",
                padding: "12px 20px",
                borderBottom: i < listings.length - 1 ? "1px solid #f1f5f9" : "none",
                background: isSelected ? "#f5f3ff" : undefined,
                transition: "background 0.1s",
              }}
              className="hover:bg-slate-50"
            >
              {/* Checkbox */}
              <div>
                <input type="checkbox" checked={isSelected} onChange={() => toggleOne(listing.id)}
                  style={{ width: "15px", height: "15px", cursor: "pointer", accentColor: "#6366f1" }} />
              </div>

              {/* Photo */}
              <div style={{
                width: "72px", height: "54px", borderRadius: "8px",
                overflow: "hidden", background: "#f0f4ff", border: "1px solid #e2e8f0",
              }}>
                {cover
                  ? <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>📦</div>
                }
              </div>

              {/* Title + meta */}
              <div style={{ paddingRight: "12px" }}>
                <Link href={`/listings/${listing.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "3px", lineHeight: 1.3 }}
                    className="hover:text-blue-600">
                    {listing.title}
                  </div>
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                  {listing.categories?.slug && (
                    <span style={{ fontSize: "10px", fontWeight: 600, color: "#6366f1", background: "#eef2ff", borderRadius: "4px", padding: "1px 5px" }}>
                      {CAT_NAMES[listing.categories.slug] ?? listing.categories.name}
                    </span>
                  )}
                  {listing.featured_level && (
                    <span style={{
                      fontSize: "10px", fontWeight: 700, padding: "1px 5px", borderRadius: "4px",
                      background: listing.featured_level === "gold" ? "#fef3c7" : listing.featured_level === "silver" ? "#ede9fe" : "#fff7ed",
                      color: listing.featured_level === "gold" ? "#92400e" : listing.featured_level === "silver" ? "#5b21b6" : "#9a3412",
                    }}>
                      {listing.featured_level === "gold" ? "👑 Premium" : listing.featured_level === "silver" ? "🚀 Dest." : "⭐ Esencial"}
                    </span>
                  )}
                  <span style={{ fontSize: "10px", color: "#cbd5e1" }}>
                    {new Date(listing.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
                {tip && (
                  <div style={{ marginTop: "5px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "80px", height: "3px", background: "#f1f5f9", borderRadius: "2px" }}>
                      <div style={{ width: tip === "Sin precio" ? "65%" : "40%", height: "100%", background: "#f97316", borderRadius: "2px" }} />
                    </div>
                    <span style={{ fontSize: "10px", color: "#f97316", fontWeight: 600 }}>⚠ {tip}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div style={{ textAlign: "right" }}>
                <QuickPriceEdit
                  listingId={listing.id}
                  price={listing.price ?? 0}
                  currency={listing.currency ?? "ARS"}
                  onSave={onUpdatePrice}
                />
              </div>

              {/* Stats */}
              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                {[
                  { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, val: listing.view_count ?? 0 },
                  { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, val: msgs },
                  { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, val: listing.favorite_count ?? 0 },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                    {s.icon}
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155", lineHeight: 1 }}>{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                  background: STATUS_BG[listing.status] ?? "#f9fafb",
                  color: STATUS_DOT[listing.status] ?? "#6b7280",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: STATUS_DOT[listing.status] ?? "#9ca3af", flexShrink: 0 }} />
                  {STATUS_LABEL[listing.status] ?? listing.status}
                </span>
              </div>

              {/* Separator */}
              <div style={{ width: "1px", height: "32px", background: "#e2e8f0", margin: "0 auto" }} />

              {/* Actions */}
              <div style={{ display: "flex", gap: "5px", justifyContent: "flex-end", alignItems: "center" }}>
                {isActive && (
                  <button
                    onClick={() => !onBumpCooldown && !isBumping && handleBump(listing.id)}
                    disabled={onBumpCooldown || isBumping}
                    title={onBumpCooldown ? `Disponible en ${formatCooldown(bumpCooldown)}` : "Subir al tope de la lista"}
                    style={{
                      background: onBumpCooldown ? "#f8fafc" : "#f0fdf4",
                      color: onBumpCooldown ? "#94a3b8" : "#16a34a",
                      border: `1px solid ${onBumpCooldown ? "#e2e8f0" : "#bbf7d0"}`,
                      borderRadius: "6px", padding: "5px 9px",
                      fontSize: "12px", fontWeight: 700,
                      cursor: onBumpCooldown || isBumping ? "default" : "pointer",
                      whiteSpace: "nowrap",
                    }}>
                    {isBumping ? "↑..." : onBumpCooldown ? `↑ ${formatCooldown(bumpCooldown)}` : "↑ Actualizar"}
                  </button>
                )}
                {canToggle && (
                  <button
                    onClick={() => handleToggle(listing.id, listing.status)}
                    disabled={pending}
                    style={{
                      background: isActive ? "#fef2f2" : "#f0fdf4",
                      color: isActive ? "#dc2626" : "#16a34a",
                      border: `1px solid ${isActive ? "#fecaca" : "#bbf7d0"}`,
                      borderRadius: "6px", padding: "5px 9px",
                      fontSize: "12px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap",
                    }}>
                    {isActive ? "Pausar" : "Activar"}
                  </button>
                )}
                <Link href={`/dashboard/my-listings/${listing.id}/edit`}>
                  <button style={{
                    background: "#f1f5f9", color: "#475569",
                    border: "1px solid #e2e8f0", borderRadius: "6px",
                    padding: "5px 9px", fontSize: "12px", cursor: "pointer", fontWeight: 600,
                  }}>
                    Editar
                  </button>
                </Link>
                <DeleteButton id={listing.id} title={listing.title} onDelete={onDelete} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
