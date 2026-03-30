'use server'

import { createClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  activeListings: number
  totalViews: number
  unreadMessages: number
  conversionRate: number
}

export interface WeeklyViewPoint {
  date: string   // "2026-03-30"
  label: string  // "Lun"
  views: number
}

export interface UserListing {
  id: string
  title: string
  price: number
  status: string
  view_count: number
  created_at: string
  destacado_activo: boolean
  destacado_hasta: string | null
  destacado_tipo: string | null
  cover_url: string | null
  msg_count: number
}

export type RecommendationType = 'low_views' | 'high_conversion' | 'expiring' | 'pro_active'

export interface Recommendation {
  type: RecommendationType
  message: string
  listingId?: string
}

// ─── getDashboardStats ─────────────────────────────────────────────────────────

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient()

  const [
    { count: activeListings },
    { data: allListings },
    { count: unreadMessages },
  ] = await Promise.all([
    supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active'),
    supabase
      .from('listings')
      .select('id, view_count')
      .eq('user_id', userId),
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false),
  ])

  const listingIds = (allListings ?? []).map(l => l.id)
  const totalViews = (allListings ?? []).reduce((sum, l) => sum + (l.view_count ?? 0), 0)

  let totalMessages = 0
  if (listingIds.length > 0) {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('listing_id', listingIds)
    totalMessages = count ?? 0
  }

  const conversionRate = totalViews > 0
    ? Math.round((totalMessages / totalViews) * 100)
    : 0

  return {
    activeListings: activeListings ?? 0,
    totalViews,
    unreadMessages: unreadMessages ?? 0,
    conversionRate,
  }
}

// ─── getWeeklyViews ───────────────────────────────────────────────────────────

export async function getWeeklyViews(userId: string): Promise<WeeklyViewPoint[]> {
  const supabase = await createClient()

  const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  // Build last-7-days array
  const days: WeeklyViewPoint[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toISOString().split('T')[0],
      label: DAY_LABELS[d.getDay()],
      views: 0,
    }
  })

  const { data: listings } = await supabase
    .from('listings')
    .select('id')
    .eq('user_id', userId)

  const listingIds = (listings ?? []).map(l => l.id)
  if (listingIds.length === 0) return days

  const since = days[0].date + 'T00:00:00'
  const { data: rows } = await supabase
    .from('listing_views_log')
    .select('created_at')
    .in('listing_id', listingIds)
    .gte('created_at', since)

  for (const row of (rows ?? [])) {
    const date = (row.created_at as string).split('T')[0]
    const point = days.find(d => d.date === date)
    if (point) point.views++
  }

  return days
}

// ─── getUserListings ──────────────────────────────────────────────────────────

export async function getUserListings(userId: string): Promise<UserListing[]> {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, title, price, status, view_count, created_at,
      destacado_activo, destacado_hasta, destacado_tipo,
      listing_images(url, position)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!listings || listings.length === 0) return []

  const listingIds = listings.map(l => l.id)
  const { data: msgs } = await supabase
    .from('messages')
    .select('listing_id')
    .in('listing_id', listingIds)

  const msgMap: Record<string, number> = {}
  for (const m of (msgs ?? [])) {
    if (m.listing_id) msgMap[m.listing_id] = (msgMap[m.listing_id] ?? 0) + 1
  }

  return listings.map(l => {
    const images = (l.listing_images as { url: string; position: number }[] ?? [])
    const cover = images.sort((a, b) => a.position - b.position)[0]?.url ?? null
    return {
      id: l.id,
      title: l.title,
      price: l.price,
      status: l.status,
      view_count: l.view_count ?? 0,
      created_at: l.created_at,
      destacado_activo: l.destacado_activo ?? false,
      destacado_hasta: l.destacado_hasta ?? null,
      destacado_tipo: l.destacado_tipo ?? null,
      cover_url: cover,
      msg_count: msgMap[l.id] ?? 0,
    }
  })
}

// ─── getSmartRecommendations ──────────────────────────────────────────────────

export async function getSmartRecommendations(userId: string): Promise<Recommendation[]> {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, view_count, destacado_activo, destacado_hasta, expires_at')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (!listings || listings.length === 0) return []

  const listingIds = listings.map(l => l.id)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [{ count: weekViews }, { count: totalMsgs }] = await Promise.all([
    supabase
      .from('listing_views_log')
      .select('*', { count: 'exact', head: true })
      .in('listing_id', listingIds)
      .gte('created_at', sevenDaysAgo.toISOString()),
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('listing_id', listingIds),
  ])

  const totalViews = listings.reduce((sum, l) => sum + (l.view_count ?? 0), 0)
  const convRate = totalViews > 0 ? ((totalMsgs ?? 0) / totalViews) * 100 : 0
  const proListing = listings.find(l => l.destacado_activo)
  const recs: Recommendation[] = []

  if (proListing?.destacado_hasta) {
    const fecha = new Date(proListing.destacado_hasta).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'long',
    })
    recs.push({ type: 'pro_active', message: `Destacado activo hasta el ${fecha}` })
  }

  if ((weekViews ?? 0) < 20 && !proListing) {
    recs.push({
      type: 'low_views',
      message: 'Tus avisos tienen pocas vistas esta semana. Destacalos y obtené 3x más visibilidad.',
    })
  }

  if (convRate > 5) {
    recs.push({
      type: 'high_conversion',
      message: `¡Conversión del ${Math.round(convRate)}%! Tus avisos generan contactos. Seguí así.`,
    })
  }

  const inAWeek = new Date()
  inAWeek.setDate(inAWeek.getDate() + 7)
  const now = new Date()

  for (const l of listings) {
    if (l.expires_at) {
      const exp = new Date(l.expires_at)
      if (exp > now && exp <= inAWeek) {
        const days = Math.ceil((exp.getTime() - now.getTime()) / 86_400_000)
        recs.push({
          type: 'expiring',
          message: `"${l.title}" expira en ${days} día${days === 1 ? '' : 's'}. ¿Lo renovás?`,
          listingId: l.id,
        })
      }
    }
  }

  return recs
}
