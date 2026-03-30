import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDashboardStats, getWeeklyViews, getUserListings, getSmartRecommendations } from './actions'
import { toggleListingStatus, deleteListing } from './listing-actions'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { ListingsGrid } from '@/components/dashboard/ListingCardActions'
import { DashboardRefresher } from '@/components/dashboard/DashboardRefresher'
import type { Recommendation } from './actions'

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, icon, color, suffix,
}: {
  label: string
  value: number
  icon: string
  color: string
  suffix?: string
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px',
      padding: '20px 16px', textAlign: 'center',
      border: '1px solid #e2e8f0',
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

// ─── Pro CTA ──────────────────────────────────────────────────────────────────

function ProCta() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E5BA8, #2563eb)',
      borderRadius: '12px', padding: '24px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '20px', flexWrap: 'wrap',
    }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }}>
          ⭐ Obtené 3x más vistas con Pro
        </h3>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
          Destacá tus avisos y aparecé primero en los resultados de búsqueda.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
          {['Posición prioritaria', 'Badge verificado', 'Estadísticas avanzadas'].map(b => (
            <span key={b} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ✓ {b}
            </span>
          ))}
        </div>
      </div>
      <Link href="/upgrade">
        <button style={{
          background: '#FF8C00', color: '#fff',
          border: 'none', borderRadius: '8px',
          padding: '12px 24px', fontWeight: 800,
          fontSize: '14px', cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>
          Probar 7 días gratis →
        </button>
      </Link>
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
    .select('full_name, is_pro')
    .eq('id', user.id)
    .single()

  const [stats, weeklyViews, listings, recommendations] = await Promise.all([
    getDashboardStats(user.id),
    getWeeklyViews(user.id),
    getUserListings(user.id),
    getSmartRecommendations(user.id),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'vendedor'
  const isPro = profile?.is_pro ?? false
  const weekTotal = weeklyViews.reduce((s, d) => s + d.views, 0)

  // Server actions bound to user (passed to client components)
  async function handleToggle(id: string, current: string) {
    'use server'
    await toggleListingStatus(id, current)
  }
  async function handleDelete(id: string) {
    'use server'
    await deleteListing(id)
  }

  return (
    <>
      <DashboardRefresher />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Hero ── */}
        <div style={{
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
          <KpiCard label="Avisos activos"    value={stats.activeListings}  icon="📋" color="#1E5BA8" />
          <KpiCard label="Vistas totales"    value={stats.totalViews}      icon="👁️" color="#FF8C00" />
          <KpiCard label="Mensajes sin leer" value={stats.unreadMessages}  icon="💬" color="#16a34a" />
          <KpiCard label="Conversión"        value={stats.conversionRate}  icon="📈" color="#7c3aed" suffix="%" />
        </div>

        {/* ── Chart + Recommendations ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'start' }}>

          {/* Chart */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
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
            <WeeklyChart data={weeklyViews} />
          </div>

          {/* Smart Recommendations */}
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

        {/* ── Listings Grid ── */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '18px 20px', borderBottom: '1px solid #f1f5f9',
          }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
              Mis avisos ({listings.length})
            </h2>
            <Link href="/dashboard/my-listings" style={{ fontSize: '13px', color: '#1E5BA8', textDecoration: 'none', fontWeight: 600 }}>
              Ver todos →
            </Link>
          </div>
          <div style={{ padding: '20px' }}>
            <ListingsGrid
              listings={listings}
              onToggleStatus={handleToggle}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* ── Pro CTA (solo si no es pro) ── */}
        {!isPro && <ProCta />}

      </div>
    </>
  )
}
