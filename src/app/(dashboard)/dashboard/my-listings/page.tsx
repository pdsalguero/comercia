import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { DeleteButton } from './DeleteButton'
import { ListingsGrid } from '@/components/dashboard/ListingCardActions'
import type { UserListing } from '@/app/(dashboard)/dashboard/actions'

async function toggleStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const current = formData.get('status') as string
  const next = current === 'active' ? 'paused' : 'active'
  const supabase = await createClient()
  await supabase.from('listings').update({ status: next }).eq('id', id)
  revalidatePath('/my-listings')
}

async function deleteListing(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('listings').delete().eq('id', id)
  revalidatePath('/my-listings')
}

const CAT_NAMES: Record<string, string> = {
  electronics: "Tecnología",
  vehicles: "Vehículos",
  "real-estate": "Inmuebles",
  clothing: "Ropa y Calzado",
  "home-garden": "Hogar y Muebles",
  sports: "Deportes",
  tools: "Herramientas",
  toys: "Juegos y Juguetes",
  books: "Música, Libros y Revistas",
  pets: "Mascotas",
  "services": "Servicios",
  other: "Otros",
};

const STATUS_LABEL: Record<string, string> = {
  active:  'Activo',
  paused:  'Pausado',
  sold:    'Vendido',
  expired: 'Vencido',
  draft:   'Borrador',
}

const STATUS_DOT: Record<string, string> = {
  active:  '#16a34a',
  paused:  '#ca8a04',
  sold:    '#0369a1',
  expired: '#dc2626',
  draft:   '#9ca3af',
}

const STATUS_BG: Record<string, string> = {
  active:  '#f0fdf4',
  paused:  '#fefce8',
  sold:    '#eff6ff',
  expired: '#fef2f2',
  draft:   '#f9fafb',
}

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const isGrid = view === 'grid';

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, title, price, currency, status, condition,
      view_count, favorite_count,
      featured_level, featured_until,
      destacado_activo, destacado_hasta, destacado_tipo,
      created_at, slug,
      listing_images(url, position),
      categories(name, slug)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const active = listings?.filter(l => l.status === 'active').length ?? 0
  const total  = listings?.length ?? 0

  // Message count per listing
  const allIds = (listings ?? []).map(l => l.id)
  const { data: msgRows } = allIds.length > 0
    ? await supabase.from('messages').select('listing_id').in('listing_id', allIds)
    : { data: [] }
  const msgCountMap: Record<string, number> = {}
  for (const m of (msgRows ?? [])) {
    if (m.listing_id) msgCountMap[m.listing_id] = (msgCountMap[m.listing_id] ?? 0) + 1
  }

  // Map to UserListing for the shared grid component
  const userListings: UserListing[] = (listings ?? []).map(l => {
    const images = l.listing_images as { url: string; position: number }[] | null
    const cover = images?.slice().sort((a, b) => a.position - b.position)[0]?.url ?? null
    return {
      id: l.id,
      title: l.title,
      price: l.price,
      status: l.status,
      view_count: l.view_count ?? 0,
      created_at: l.created_at,
      destacado_activo: ((l as any).destacado_activo ?? false) || !!l.featured_level,
      destacado_hasta: (l as any).destacado_hasta ?? (l as any).featured_until ?? null,
      destacado_tipo: (l as any).destacado_tipo ?? l.featured_level ?? null,
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

  async function handleDelete(id: string) {
    'use server'
    const sb = await createClient()
    await sb.from('listings').delete().eq('id', id)
    revalidatePath('/dashboard/my-listings')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Mis avisos</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0' }}>
            {active} activo{active !== 1 ? 's' : ''} · {total} en total
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Grid / List toggle */}
          <div style={{ display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <Link href="/my-listings" style={{ textDecoration: 'none' }}>
              <div title="Ver en lista" style={{ padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', background: !isGrid ? '#6366f1' : '#fff', color: !isGrid ? '#fff' : '#94a3b8' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="5" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="3" y="17" width="18" height="2" rx="1"/>
                </svg>
              </div>
            </Link>
            <Link href="/my-listings?view=grid" style={{ textDecoration: 'none' }}>
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

      {/* Grid view — mismo componente que el dashboard */}
      {isGrid && (
        <ListingsGrid
          listings={userListings}
          onToggleStatus={handleToggle}
          onDelete={handleDelete}
        />
      )}

      {/* Table */}
      {!isGrid && <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>

        {/* Column headers */}
        {total > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '72px 1fr 110px 160px 100px 180px',
            gap: '0',
            padding: '10px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '11px', fontWeight: 700,
            color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Foto</span>
            <span>Publicación</span>
            <span style={{ textAlign: 'right' }}>Precio</span>
            <span style={{ textAlign: 'center' }}>Estadísticas</span>
            <span style={{ textAlign: 'center' }}>Estado</span>
            <span style={{ textAlign: 'right' }}>Acciones</span>
          </div>
        )}

        {!listings || listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 32px', color: '#94a3b8' }}>
            <div style={{ fontSize: '52px', marginBottom: '14px' }}>📭</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748b', margin: '0 0 6px' }}>
              Todavía no publicaste ningún aviso
            </p>
            <p style={{ fontSize: '13px', margin: '0 0 20px' }}>
              Publicá tu primer aviso en segundos con ayuda de IA
            </p>
            <Link href="/listings/new">
              <button style={{
                background: '#3483fa', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '11px 24px',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              }}>
                📸 Publicar con IA
              </button>
            </Link>
          </div>
        ) : (
          listings.map((listing, i) => {
            const images = listing.listing_images as { url: string; position: number }[] | null
            const cover = images?.slice().sort((a, b) => a.position - b.position)[0]?.url ?? null
            const canToggle = listing.status === 'active' || listing.status === 'paused'
            const isActive = listing.status === 'active'

            return (
              <div
                key={listing.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr 110px 160px 100px 180px',
                  alignItems: 'center',
                  gap: '0',
                  padding: '14px 20px',
                  borderBottom: i < listings.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.1s',
                }}
                className="hover:bg-slate-50"
              >
                {/* Photo */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '8px',
                  overflow: 'hidden', flexShrink: 0, background: '#f0f4ff',
                  border: '1px solid #e2e8f0',
                }}>
                  {cover
                    ? <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>📦</div>
                  }
                </div>

                {/* Title + meta */}
                <div style={{ paddingRight: '12px' }}>
                  <Link href={`/listings/${listing.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '3px', lineHeight: 1.3 }}
                      className="hover:text-blue-600">
                      {listing.title}
                    </div>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {(listing as any).categories?.slug && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', background: '#eef2ff', borderRadius: '4px', padding: '1px 6px' }}>
                        {CAT_NAMES[(listing as any).categories.slug] ?? (listing as any).categories.name}
                      </span>
                    )}
                    {listing.featured_level && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
                        background: listing.featured_level === 'gold' ? '#fef3c7' : listing.featured_level === 'silver' ? '#ede9fe' : '#fff7ed',
                        color: listing.featured_level === 'gold' ? '#92400e' : listing.featured_level === 'silver' ? '#5b21b6' : '#9a3412',
                      }}>
                        {listing.featured_level === 'gold' ? '👑 Premium' : listing.featured_level === 'silver' ? '🚀 Destacado' : '⭐ Estándar'}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(listing.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', fontSize: '15px', fontWeight: 800, color: '#3483fa' }}>
                  {listing.currency === 'USD' ? 'U$S' : '$'}{listing.price?.toLocaleString('es-AR')}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{listing.view_count}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>vistas</div>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{msgCountMap[listing.id] ?? 0}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>mensajes</div>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{listing.favorite_count}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>favs</div>
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    background: STATUS_BG[listing.status] ?? '#f9fafb',
                    color: STATUS_DOT[listing.status] ?? '#6b7280',
                    border: `1px solid ${STATUS_DOT[listing.status] ?? '#e5e7eb'}22`,
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_DOT[listing.status] ?? '#9ca3af', flexShrink: 0 }} />
                    {STATUS_LABEL[listing.status] ?? listing.status}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                  {canToggle && (
                    <form action={toggleStatus}>
                      <input type="hidden" name="id" value={listing.id} />
                      <input type="hidden" name="status" value={listing.status} />
                      <button
                        type="submit"
                        style={{
                          background: isActive ? '#fef2f2' : '#f0fdf4',
                          color: isActive ? '#dc2626' : '#16a34a',
                          border: `1px solid ${isActive ? '#fecaca' : '#bbf7d0'}`,
                          borderRadius: '6px', padding: '5px 10px',
                          fontSize: '12px', cursor: 'pointer', fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isActive ? 'Pausar' : 'Activar'}
                      </button>
                    </form>
                  )}
                  <Link href={`/dashboard/my-listings/${listing.id}/edit`}>
                    <button style={{
                      background: '#f1f5f9', color: '#475569',
                      border: '1px solid #e2e8f0', borderRadius: '6px',
                      padding: '5px 10px', fontSize: '12px',
                      cursor: 'pointer', fontWeight: 600,
                    }}>
                      Editar
                    </button>
                  </Link>
                  <DeleteButton id={listing.id} title={listing.title} onDelete={deleteListing} />
                </div>
              </div>
            )
          })
        )}
      </div>}
    </div>
  )
}
