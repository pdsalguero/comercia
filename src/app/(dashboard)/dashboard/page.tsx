import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDashboardStats, getWeeklyViews, getSmartRecommendations, getListingSummary } from './actions'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { DashboardRefresher } from '@/components/dashboard/DashboardRefresher'
import type { Recommendation, TopListing, ListingSummary } from './actions'

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, icon, color, suffix, href,
}: {
  label: string
  value: number
  icon: string
  color: string
  suffix?: string
  href?: string
}) {
  const inner = (
    <div className="dashboard-kpi-card" style={{
      background: '#fff', borderRadius: '12px',
      padding: '20px 16px', textAlign: 'center',
      border: '1px solid #e2e8f0',
      cursor: href ? 'pointer' : 'default',
      transition: 'box-shadow 0.15s',
    }}>
      <div style={{ fontSize: '28px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '32px', fontWeight: 900, color, lineHeight: 1 }}>
        {value.toLocaleString('es-AR')}{suffix}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  )
  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }} className="hover:[&>div]:shadow-md">{inner}</Link>
  }
  return inner
}

// ─── Recommendations ──────────────────────────────────────────────────────────

const REC_CONFIG: Record<string, { icon: string; bg: string; border: string; color: string }> = {
  low_views:       { icon: '📉', bg: '#fff7ed', border: '#fed7aa', color: '#c2410c' },
  high_conversion: { icon: '🚀', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
  expiring:        { icon: '⚠️', bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
  pro_active:      { icon: '⭐', bg: '#fefce8', border: '#fde68a', color: '#92400e' },
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const cfg = REC_CONFIG[rec.type]
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '12px 14px', borderRadius: '10px',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ fontSize: '18px', flexShrink: 0 }}>{cfg.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '13px', color: cfg.color, fontWeight: 500, lineHeight: '1.4' }}>
          {rec.message}
        </p>
        {rec.type === 'low_views' && (
          <Link href="/upgrade" style={{
            display: 'inline-block', marginTop: '6px',
            fontSize: '12px', fontWeight: 700, color: '#FF8C00',
            textDecoration: 'none',
          }}>
            Ver planes →
          </Link>
        )}
        {rec.type === 'expiring' && rec.listingId && (
          <Link href={`/dashboard/my-listings/${rec.listingId}/edit`} style={{
            display: 'inline-block', marginTop: '6px',
            fontSize: '12px', fontWeight: 700, color: '#dc2626',
            textDecoration: 'none',
          }}>
            Renovar →
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Listings Summary ─────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo', paused: 'Pausado', sold: 'Vendido', expired: 'Vencido', draft: 'Borrador',
}
const STATUS_COLOR: Record<string, string> = {
  active: '#16a34a', paused: '#ca8a04', sold: '#0369a1', expired: '#dc2626', draft: '#9ca3af',
}

const RANK_STYLES = [
  { bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#fff' },
  { bg: 'linear-gradient(135deg, #94a3b8, #cbd5e1)', color: '#fff' },
  { bg: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff' },
  { bg: '#f1f5f9', color: '#94a3b8' },
  { bg: '#f1f5f9', color: '#94a3b8' },
]

function TopList({ items, emptyMsg, accent }: { items: TopListing[]; emptyMsg: string; accent: string }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: '#cbd5e1', fontSize: '13px' }}>
        {emptyMsg}
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {items.map((l, i) => {
        const rank = RANK_STYLES[i] ?? RANK_STYLES[3]
        const isTop = i === 0
        return (
          <Link key={l.id} href={`/dashboard/my-listings/${l.id}/edit`} style={{ textDecoration: 'none', display: 'block', width: '100%', minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              background: isTop ? `${accent}08` : 'transparent',
              border: isTop ? `1px solid ${accent}20` : '1px solid transparent',
              transition: 'background 0.1s, border-color 0.1s',
              width: '100%', boxSizing: 'border-box', minWidth: 0,
            }} className="hover:bg-slate-50">
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: rank.bg, color: rank.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 800, flexShrink: 0,
                boxShadow: isTop ? `0 2px 6px ${accent}40` : 'none',
              }}>{i + 1}</div>
              {l.cover_url
                ? <img src={l.cover_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }} />
                : <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📦</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.title}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '3px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748b' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {l.view_count.toLocaleString('es-AR')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748b' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {l.msg_count}
                  </span>
                </div>
              </div>
              {isTop && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" style={{ flexShrink: 0, opacity: 0.6 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function ListingsSummary({ summary }: { summary: ListingSummary }) {
  const { statusCounts, topByViews, topByMessages, totalFavorites } = summary

  return (
    <div className="dashboard-summary-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
        {/* Row 1: title + Ver todos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Mis avisos</h2>
          <Link href="/dashboard/my-listings" style={{ fontSize: '13px', color: '#1E5BA8', textDecoration: 'none', fontWeight: 600 }}>
            Ver todos →
          </Link>
        </div>
        {/* Row 2: status badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'activos',  value: statusCounts.active,  color: '#22c55e', filter: 'active' },
            { label: 'pausados', value: statusCounts.paused,  color: '#eab308', filter: 'paused' },
            { label: 'vencidos', value: statusCounts.expired, color: '#ef4444', filter: 'expired' },
          ].map(s => (
            <Link key={s.label} href={`/dashboard/my-listings?status_filter=${s.filter}`} style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}25`,
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                {s.value} {s.label}
              </span>
            </Link>
          ))}
          {totalFavorites > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#ef4444"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{totalFavorites}</span> favoritos
            </span>
          )}
        </div>
      </div>

      {/* Top lists */}
      {statusCounts.total > 0 ? (
        <div className="dashboard-summary-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '16px 16px 18px 20px', borderRight: '1px solid #f1f5f9', minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Top por vistas</span>
            </div>
            <TopList items={topByViews} emptyMsg="Sin vistas aún." accent="#3b82f6" />
          </div>
          <div style={{ padding: '16px 20px 18px 16px', minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Top por mensajes</span>
            </div>
            <TopList items={topByMessages} emptyMsg="Aún no recibiste mensajes." accent="#22c55e" />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '13px' }}>
          Aún no publicaste ningún aviso.{' '}
          <Link href="/listings/new" style={{ color: '#3483fa', fontWeight: 600, textDecoration: 'none' }}>Publicar ahora →</Link>
        </div>
      )}
    </div>
  )
}

// ─── Dólar Card ───────────────────────────────────────────────────────────────

async function getDolarNacion(): Promise<{ compra: number; venta: number; fechaActualizacion: string } | null> {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 1800 }, // refresca cada 30 min
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function DolarCard() {
  const dolar = await getDolarNacion()
  if (!dolar) return null

  const fecha = dolar.fechaActualizacion
    ? new Date(dolar.fechaActualizacion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '14px 16px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>💵</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Dólar BNA</span>
        </div>
        {fecha && <span style={{ fontSize: '10px', color: '#cbd5e1' }}>Act. {fecha}</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Compra</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
            ${dolar.compra.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '8px 12px' }}>
          <div style={{ fontSize: '11px', color: '#93c5fd', marginBottom: '2px' }}>Venta</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E5BA8' }}>
            ${dolar.venta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const [stats, weeklyViews, recommendations, summary] = await Promise.all([
    getDashboardStats(user.id),
    getWeeklyViews(user.id),
    getSmartRecommendations(user.id),
    getListingSummary(user.id),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'vendedor'
  const weekTotal = weeklyViews.reduce((s, d) => s + d.views, 0)

  return (
    <>
      <DashboardRefresher />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, overflow: 'hidden' }}>

        {/* ── Hero ── */}
        <div className="dashboard-hero" style={{
          background: 'linear-gradient(135deg, #0f172a, #1E5BA8)',
          borderRadius: '12px', padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', flexWrap: 'wrap',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>
              ¡Hola, {firstName}! 👋
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
              {stats.activeListings > 0
                ? `Tenés ${stats.activeListings} aviso${stats.activeListings !== 1 ? 's' : ''} activo${stats.activeListings !== 1 ? 's' : ''} y ${weekTotal} vistas esta semana.`
                : 'Publicá tu primer aviso en 30 segundos con inteligencia artificial.'}
            </p>
          </div>
          <Link href="/listings/new">
            <button style={{
              background: '#FF8C00', color: '#fff',
              border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontWeight: 800,
              fontSize: '14px', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              📸 Publicar con IA
            </button>
          </Link>
        </div>

        {/* ── KPIs ── */}
        <div className="dashboard-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <KpiCard label="Avisos activos"    value={stats.activeListings}  icon="📋" color="#1E5BA8" href="/dashboard/my-listings" />
          <KpiCard label="Mensajes sin leer" value={stats.unreadMessages}  icon="💬" color="#16a34a" href="/dashboard/messages" />
          <KpiCard label="Vistas totales"    value={stats.totalViews}      icon="👁️" color="#FF8C00" />
          <KpiCard label="Conversión"        value={stats.conversionRate}  icon="📈" color="#7c3aed" suffix="%" />
        </div>

        {/* ── Chart + Recommendations ── */}
        <div className="dashboard-chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'stretch' }}>

          {/* Chart */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                  Vistas esta semana
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  {weekTotal} vistas en los últimos 7 días
                </p>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <WeeklyChart data={weeklyViews} />
            </div>
          </div>

          {/* Columna derecha: Dólar + Recomendaciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <DolarCard />
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                💡 Recomendaciones
              </h2>
              {recommendations.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  No hay recomendaciones por ahora. ¡Todo va bien!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recommendations.map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Listings Summary ── */}
        <ListingsSummary summary={summary} />


      </div>
    </>
  )
}
