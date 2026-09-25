'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { UserListing } from '@/app/(dashboard)/dashboard/actions'
import { absoluteUrl } from '@/lib/site-url'
import { listingUrl } from '@/lib/listing-url'
import { plural } from '@/lib/labels'
import { MarkSoldDialog } from './MarkSoldDialog'
import {
  BadgeCheck, Camera, CheckCircle2, Clock, Eye, ImageOff, Inbox, Link2, MessageSquare, MoreHorizontal, Pause,
  Pencil, Play, Star, Trash2, TrendingUp, type LucideIcon,
} from 'lucide-react'

// ─── Destacar Modal ────────────────────────────────────────────────────────────

// Planes consistentes con /upgrade (PlanCards.tsx)
const PLANS = [
  {
    key: 'bronze_30',
    label: 'Esencial',
    badge: '⭐ ESTÁNDAR',
    days: 30,
    price: 2499,
    color: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
    perks: ['Aparece antes que gratuitos', 'Badge ⭐ Esencial'],
  },
  {
    key: 'silver_30',
    label: 'Destacado',
    badge: '🚀 DESTACADO',
    days: 30,
    price: 4199,
    color: '#1d6fb8',
    bg: '#e8f1fa',
    border: '#b9d4ee',
    perks: ['Posición preferencial', 'Badge 🚀 Destacado'],
    recommended: true,
  },
  {
    key: 'gold_30',
    label: 'Premium',
    badge: '👑 PREMIUM',
    days: 30,
    price: 6999,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    perks: ['Aparece en la home', 'Badge 👑 Premium'],
  },
]

// Mapeo interno (bronze/silver/gold) → nombre de UI
const TIER_LABEL: Record<string, string> = {
  bronze:   '⭐ Esencial',
  silver:   '🚀 Destacado',
  gold:     '👑 Premium',
}

function DestacadoModal({ listingId, onClose }: { listingId: string; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '16px',
          padding: '28px', maxWidth: '520px', width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Destacar aviso
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Obtén más vistas y contactos con nuestros planes
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8', padding: '0 4px' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PLANS.map(plan => (
            <div
              key={plan.key}
              style={{
                border: `2px solid ${plan.recommended ? plan.color : plan.border}`,
                borderRadius: '12px', padding: '14px 16px',
                background: plan.bg,
                position: 'relative',
              }}
            >
              {plan.recommended && (
                <span style={{
                  position: 'absolute', top: '-10px', right: '16px',
                  background: plan.color, color: '#fff',
                  fontSize: '12px', fontWeight: 700,
                  padding: '2px 10px', borderRadius: '20px',
                }}>
                  MÁS ELEGIDO
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: plan.color }}>
                    {plan.badge} · {plan.days} días
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {plan.perks.join(' · ')}
                  </div>
                </div>
                <Link href={`/upgrade?listing_id=${listingId}`} onClick={onClose}>
                  <button style={{
                    background: plan.color,
                    color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '8px 14px',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}>
                    ${plan.price.toLocaleString('es-AR')}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', margin: '12px 0 0' }}>
          Ver todas las duraciones (7, 15, 30 días) en{' '}
          <Link href={`/upgrade?listing_id=${listingId}`} onClick={onClose} style={{ color: '#1E5BA8', fontWeight: 600 }}>
            la página de planes
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── More Menu ────────────────────────────────────────────────────────────────

function MoreMenu({
  listingId,
  title,
  status,
  onClose,
  onToggleStatus,
  onMarkSold,
  onDelete,
  anchor,
}: {
  listingId: string
  title: string
  status: string
  onClose: () => void
  onToggleStatus: () => void
  onMarkSold: () => void
  onDelete: () => void
  anchor: DOMRect | null
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const items: { label: string; Icon: LucideIcon; onClick: () => void; danger?: boolean }[] = [
    {
      label: status === 'active' ? 'Pausar aviso' : status === 'sold' ? 'Volver a publicar' : 'Activar aviso',
      Icon: status === 'active' ? Pause : Play,
      onClick: () => { onToggleStatus(); onClose() },
    },
    ...(status === 'active' || status === 'paused'
      ? [{ label: 'Marcar como vendido', Icon: BadgeCheck, onClick: () => { onMarkSold(); onClose() } }]
      : []),
    {
      label: 'Copiar link',
      Icon: Link2,
      onClick: () => {
        navigator.clipboard.writeText(absoluteUrl(listingUrl(listingId, title)))
        onClose()
      },
    },
    { label: 'Eliminar', Icon: Trash2, onClick: () => { onDelete(); onClose() }, danger: true },
  ]

  const top = anchor ? anchor.top - 4 : 0
  const right = anchor ? window.innerWidth - anchor.right : 0

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top, right,
        transform: 'translateY(-100%)',
        background: '#fff', borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
        border: '1px solid #e2e8f0',
        minWidth: '180px', zIndex: 1000, overflow: 'hidden',
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={item.onClick}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left',
            padding: '0 14px', minHeight: '44px', fontSize: '13px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: item.danger ? '#ef4444' : '#1e293b',
            borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
          }}
          className="hover:bg-gray-50"
        >
          <item.Icon size={15} aria-hidden="true" />
          {item.label}
        </button>
      ))}
    </div>
  )
}

// ─── Listing Card ─────────────────────────────────────────────────────────────

const BUMP_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

function daysOnline(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
}

function bumpCooldownRemaining(bumpedAt: string | null): number {
  if (!bumpedAt) return 0;
  const elapsed = Date.now() - new Date(bumpedAt).getTime();
  return Math.max(0, BUMP_COOLDOWN_MS - elapsed);
}

function formatCooldown(ms: number): string {
  const hours = Math.ceil(ms / (1000 * 60 * 60));
  if (hours >= 24) return `${Math.ceil(hours / 24)}d`;
  return `${hours}h`;
}

interface ListingCardProps {
  listing: UserListing
  onToggleStatus: (id: string, current: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ListingCard({ listing, onToggleStatus, onDelete }: ListingCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSold, setShowSold] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bumping, setBumping] = useState(false)
  const [bumpedAt, setBumpedAt] = useState<string | null>(listing.bumped_at)
  const router = useRouter()

  const conv = listing.view_count > 0
    ? Math.round((listing.msg_count / listing.view_count) * 100)
    : 0

  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    active:  { bg: '#dcfce7', color: '#16a34a', label: '● Activo' },
    paused:  { bg: '#f1f5f9', color: '#64748b', label: '⏸ Pausado' },
    sold:    { bg: '#dbeafe', color: '#2563eb', label: '✓ Vendido' },
    expired: { bg: '#fee2e2', color: '#dc2626', label: '⏱ Expirado' },
  }
  const badge = statusColors[listing.status] ?? { bg: '#f1f5f9', color: '#64748b', label: listing.status }

  async function handleToggle() {
    setLoading(true)
    await onToggleStatus(listing.id, listing.status)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminás "${listing.title}"? Esta acción no se puede deshacer.`)) return
    setLoading(true)
    await onDelete(listing.id)
    router.refresh()
    setLoading(false)
  }

  async function handleBump() {
    setBumping(true)
    const res = await fetch("/api/listings/bump", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: listing.id }),
    })
    const data = await res.json()
    if (data.ok) {
      setBumpedAt(new Date().toISOString())
      router.refresh()
    }
    setBumping(false)
  }

  return (
    <div className="dlc-wrapper" style={{ height: '100%' }}>
      {showModal && (
        <DestacadoModal listingId={listing.id} onClose={() => setShowModal(false)} />
      )}
      {showSold && (
        <MarkSoldDialog listingId={listing.id} title={listing.title} onClose={() => setShowSold(false)} />
      )}

      <div className="dlc-card hover:shadow-md" style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        border: listing.destacado_activo ? '2px solid #FF8C00' : '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.2s, box-shadow 0.2s',
        position: 'relative',
      }}>
        {/* Destacado badge */}
        {listing.destacado_activo && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 2,
            background: '#FF8C00', color: '#fff',
            fontSize: '12px', fontWeight: 700,
            padding: '2px 8px', borderRadius: '20px',
          }}>
            {TIER_LABEL[listing.destacado_tipo ?? ''] ?? '⭐ Esencial'}
          </div>
        )}

        {/* Image */}
        <div className="dlc-image" style={{ height: '140px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
          {listing.cover_url
            ? <img src={listing.cover_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <ImageOff size={32} aria-hidden="true" />
              </div>
            )
          }
        </div>

        {/* Content */}
        <div className="dlc-content" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>

          {/* Title + price */}
          <div>
            <div style={{
              fontSize: '13px', fontWeight: 600, color: '#1e293b',
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              lineHeight: '1.4',
              minHeight: 'calc(1.4em * 2)', // siempre 2 líneas → cards mismo alto
            }}>
              {listing.title}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#1E5BA8', marginTop: '4px' }}>
              ${listing.price.toLocaleString('es-AR')}
            </div>
          </div>

          {/* Stats row — grid de 3 columnas centradas */}
          <div className="dlc-stats" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '4px',
            background: '#f8fafc', borderRadius: '8px',
            padding: '7px 4px',
          }}>
            {[
              { Icon: Eye,           value: listing.view_count, label: 'vistas' },
              { Icon: MessageSquare, value: listing.msg_count,  label: 'mensajes' },
              { Icon: TrendingUp,    value: `${conv}%`,         label: 'conversión' },
            ].map((m, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRight: i < 2 ? '1px solid #e2e8f0' : 'none',
                lineHeight: 1,
              }}>
                <m.Icon size={14} color="#64748b" aria-hidden="true" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                  {m.value}
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>{m.label}</span>
              </div>
            ))}
          </div>

          {/* Days online + status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} aria-hidden="true" />
              {plural(daysOnline(listing.created_at), 'día', 'días')} online
            </span>
            <span style={{
              fontSize: '12px', fontWeight: 600,
              padding: '2px 8px', borderRadius: '20px',
              background: badge.bg, color: badge.color,
            }}>
              {badge.label}
            </span>
          </div>

          {/* Actions — fila superior: Editar + Más; filas inferiores: Subir + Destacar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px' }}>
              <Link href={`/dashboard/my-listings/${listing.id}/edit`}>
                <button style={{
                  width: '100%', height: '32px',
                  border: '1px solid #e2e8f0', borderRadius: '8px',
                  background: '#f8fafc', color: '#475569',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                }}
                  className="hover:bg-gray-100 tap-h-44"
                >
                  <Pencil size={13} aria-hidden="true" />
                  Editar
                </button>
              </Link>

              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => {
                    setMenuAnchor(e.currentTarget.getBoundingClientRect())
                    setShowMenu(v => !v)
                  }}
                  style={{
                    height: '32px', width: '36px',
                    border: '1px solid #e2e8f0', borderRadius: '8px',
                    background: '#f8fafc', cursor: 'pointer', color: '#64748b',
                    fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  className="hover:bg-gray-100 tap-h-44"
                  aria-label="Más opciones"
                  aria-haspopup="menu"
                  aria-expanded={showMenu}
                >
                  <MoreHorizontal size={16} aria-hidden="true" />
                </button>
                {showMenu && (
                  <MoreMenu
                    listingId={listing.id}
                    title={listing.title}
                    status={listing.status}
                    onClose={() => setShowMenu(false)}
                    onToggleStatus={handleToggle}
                    onMarkSold={() => setShowSold(true)}
                    onDelete={handleDelete}
                    anchor={menuAnchor}
                  />
                )}
              </div>
            </div>

            {/* Row 2 — Subir aviso */}
            {listing.status === 'active' && (() => {
              const cooldown = bumpCooldownRemaining(bumpedAt);
              const onCooldown = cooldown > 0;
              return (
                <button
                  className="tap-h-44"
                  onClick={() => !onCooldown && !bumping && handleBump()}
                  disabled={onCooldown || bumping}
                  style={{
                    width: '100%', height: '34px',
                    border: `1px solid ${onCooldown ? '#e2e8f0' : '#22c55e'}`,
                    borderRadius: '8px',
                    background: onCooldown ? '#f8fafc' : '#f0fdf4',
                    color: onCooldown ? '#94a3b8' : '#16a34a',
                    fontSize: '12px', fontWeight: 700,
                    cursor: onCooldown || bumping ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {bumping ? '↑ Actualizando...' : onCooldown ? `↑ Actualizar en ${formatCooldown(cooldown)}` : '↑ Actualizar aviso'}
                </button>
              );
            })()}

            {/* Row 3 — Destacar full width (no en vendidos) */}
            {listing.status !== 'sold' && (
            <button
              className="dlc-destacar-btn tap-h-44"
              onClick={() => !listing.destacado_activo && setShowModal(true)}
              disabled={listing.destacado_activo}
              style={{
                width: '100%', height: '34px',
                border: 'none', borderRadius: '8px',
                background: listing.destacado_activo ? '#e2e8f0' : '#FF8C00',
                color: listing.destacado_activo ? '#94a3b8' : '#fff',
                fontSize: '13px', fontWeight: 700,
                cursor: listing.destacado_activo ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                transition: 'opacity 0.15s',
              }}
            >
              {listing.destacado_activo
                ? <><CheckCircle2 size={14} aria-hidden="true" />Destacado activo</>
                : <><Star size={14} aria-hidden="true" />Destacar aviso</>}
            </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Listings Grid ────────────────────────────────────────────────────────────

interface ListingsGridProps {
  listings: UserListing[]
  onToggleStatus: (id: string, current: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ListingsGrid({ listings, onToggleStatus, onDelete }: ListingsGridProps) {
  if (listings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', color: '#cbd5e1' }}>
          <Inbox size={44} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
          Todavía no publicaste ningún aviso
        </p>
        <p style={{ fontSize: '13px', marginBottom: '20px' }}>
          Publicá tu primer aviso en 30 segundos, solo con una foto
        </p>
        <Link href="/listings/new">
          <button style={{
            background: '#1E5BA8', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '10px 24px',
            fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            minHeight: '44px', display: 'inline-flex', alignItems: 'center', gap: '8px',
          }}>
            <Camera size={16} aria-hidden="true" />
            Publicar con una foto
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="dashboard-listings-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
    }}>
      {listings.map(listing => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
