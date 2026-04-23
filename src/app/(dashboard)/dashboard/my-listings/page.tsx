import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ListingsGrid } from '@/components/dashboard/ListingCardActions'
import { MyListingsSearch } from '@/components/dashboard/MyListingsSearch'
import { MyListingsTable } from './MyListingsTable'
import type { UserListing } from '@/app/(dashboard)/dashboard/actions'

async function updatePrice(id: string, price: number) {
  'use server'
  const supabase = await createClient()
  await supabase.from('listings').update({ price }).eq('id', id)
  revalidatePath('/dashboard/my-listings')
}


export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string; status_filter?: string }>;
}) {
  const { view, q = '', status_filter = '' } = await searchParams;
  const isGrid = view === 'grid';

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, title, description, price, currency, status, condition,
      view_count, favorite_count,
      featured_level, featured_until,
      destacado_activo, destacado_hasta, destacado_tipo,
      created_at, bumped_at, slug,
      listing_images(url, position),
      categories(name, slug)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const active  = listings?.filter(l => l.status === 'active').length ?? 0
  const paused  = listings?.filter(l => l.status === 'paused').length ?? 0
  const expired = listings?.filter(l => l.status === 'expired').length ?? 0
  const total   = listings?.length ?? 0
  const statusCounts: Record<string, number> = { active, paused, expired }

  // Message count per listing
  const allIds = (listings ?? []).map(l => l.id)
  const { data: msgRows } = allIds.length > 0
    ? await supabase.from('messages').select('listing_id').in('listing_id', allIds)
    : { data: [] }
  const msgCountMap: Record<string, number> = {}
  for (const m of (msgRows ?? [])) {
    if (m.listing_id) msgCountMap[m.listing_id] = (msgCountMap[m.listing_id] ?? 0) + 1
  }

  // Filter by search params
  const filteredListings = (listings ?? []).filter(l => {
    if (status_filter && l.status !== status_filter) return false
    if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  const filteredTotal = filteredListings.length

  // Map to UserListing for the shared grid component
  const userListings: UserListing[] = filteredListings.map(l => {
    const images = l.listing_images as { url: string; position: number }[] | null
    const cover = images?.slice().sort((a, b) => a.position - b.position)[0]?.url ?? null
    return {
      id: l.id,
      title: l.title,
      price: l.price,
      status: l.status,
      view_count: l.view_count ?? 0,
      created_at: l.created_at,
      destacado_activo: ((l as any).destacado_activo ?? false) || ['bronze', 'silver', 'gold'].includes(l.featured_level ?? ''),
      destacado_hasta: (l as any).destacado_hasta ?? (l as any).featured_until ?? null,
      destacado_tipo: (l as any).destacado_tipo ?? l.featured_level ?? null,
      bumped_at: (l as any).bumped_at ?? null,
      cover_url: cover,
      msg_count: msgCountMap[l.id] ?? 0,
    }
  })

  async function handleToggle(id: string, current: string) {
    'use server'
    const next = current === 'active' ? 'paused' : 'active'
    const sb = await createClient()
    await sb.from('listings').update({ status: next }).eq('id', id)
    revalidatePath('/dashboard/my-listings')
  }

  async function handleDelete(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const sb = await createClient()
    await sb.from('listings').delete().eq('id', id)
    revalidatePath('/dashboard/my-listings')
  }

  async function handleDeleteById(id: string) {
    'use server'
    const sb = await createClient()
    await sb.from('listings').delete().eq('id', id)
    revalidatePath('/dashboard/my-listings')
  }

  async function bulkAction(ids: string[], action: string) {
    'use server'
    const sb = await createClient()
    const { data: { user: u } } = await sb.auth.getUser()
    if (!u) return
    if (action === 'delete') {
      await sb.from('listings').delete().in('id', ids).eq('user_id', u.id)
    } else if (action === 'activate') {
      await sb.from('listings').update({ status: 'active' }).in('id', ids).eq('user_id', u.id)
    } else if (action === 'pause') {
      await sb.from('listings').update({ status: 'paused' }).in('id', ids).eq('user_id', u.id)
    } else if (action === 'bump') {
      await sb.from('listings').update({ bumped_at: new Date().toISOString() }).in('id', ids).eq('user_id', u.id).eq('status', 'active')
    }
    revalidatePath('/dashboard/my-listings')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Mis avisos</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0' }}>
            {active} activo{active !== 1 ? 's' : ''} · {total} en total
            {(q || status_filter) && filteredTotal !== total && ` · ${filteredTotal} resultado${filteredTotal !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Grid / List toggle — hidden on mobile */}
          <div className="my-listings-view-toggle" style={{ display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <Link href="/dashboard/my-listings" style={{ textDecoration: 'none' }}>
              <div title="Ver en lista" style={{ padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', background: !isGrid ? '#6366f1' : '#fff', color: !isGrid ? '#fff' : '#94a3b8' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="5" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="3" y="17" width="18" height="2" rx="1"/>
                </svg>
              </div>
            </Link>
            <Link href="/dashboard/my-listings?view=grid" style={{ textDecoration: 'none' }}>
              <div title="Ver en grilla" style={{ padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', background: isGrid ? '#6366f1' : '#fff', color: isGrid ? '#fff' : '#94a3b8' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
            </Link>
          </div>
          <Link href="/listings/new">
            <button style={{
              background: '#3483fa', color: '#fff',
              border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontWeight: 700,
              fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span style={{ fontSize: '16px' }}>+</span> Publicar nuevo
            </button>
          </Link>
        </div>
      </div>

      {/* Search + filter */}
      <MyListingsSearch q={q} statusFilter={status_filter} statusCounts={statusCounts} total={total} />

      {/* Mobile: always list view */}
      <div className="my-listings-mobile-grid" style={{ display: 'none' }}>
        <ListingsGrid
          listings={userListings}
          onToggleStatus={handleToggle}
          onDelete={handleDeleteById}
        />
      </div>

      {/* Grid view — mismo componente que el dashboard */}
      {isGrid && (
        <div className="my-listings-desktop-only">
          <ListingsGrid
            listings={userListings}
            onToggleStatus={handleToggle}
            onDelete={handleDeleteById}
          />
        </div>
      )}

      {/* Table */}
      {!isGrid && (
        <div className="my-listings-desktop-only">
          {total === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 32px', color: '#94a3b8', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '52px', marginBottom: '14px' }}>📭</div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748b', margin: '0 0 6px' }}>Todavía no publicaste ningún aviso</p>
              <p style={{ fontSize: '13px', margin: '0 0 20px' }}>Publicá tu primer aviso en segundos con ayuda de IA</p>
              <Link href="/listings/new">
                <button style={{ background: '#3483fa', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                  📸 Publicar con IA
                </button>
              </Link>
            </div>
          ) : (
            <MyListingsTable
              listings={filteredListings as any}
              msgCountMap={msgCountMap}
              onToggleStatus={handleToggle}
              onDelete={handleDelete}
              onUpdatePrice={updatePrice}
              onBulkAction={bulkAction}
            />
          )}
        </div>
      )}
    </div>
  )
}
