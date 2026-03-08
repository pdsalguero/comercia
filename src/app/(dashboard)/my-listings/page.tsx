import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, title, price, status, condition,
      view_count, contact_count, favorite_count,
      is_featured, created_at, slug,
      listing_images(url, position)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const statusLabel: Record<string, string> = {
    active:  '● Activo',
    paused:  '⏸ Pausado',
    sold:    '✓ Vendido',
    expired: '⏰ Vencido',
    draft:   '✏️ Borrador',
  }

  const statusColor: Record<string, string> = {
    active:  '#dcfce7',
    paused:  '#fef9c3',
    sold:    '#e0f2fe',
    expired: '#fee2e2',
    draft:   '#f3f4f6',
  }

  const statusText: Record<string, string> = {
    active:  '#16a34a',
    paused:  '#ca8a04',
    sold:    '#0369a1',
    expired: '#dc2626',
    draft:   '#6b7280',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#333' }}>Mis avisos</h1>
        <Link href="/listings/new">
          <button style={{
            background: '#3483fa', color: '#fff',
            border: 'none', borderRadius: '4px',
            padding: '10px 18px', fontWeight: 700,
            fontSize: '14px', cursor: 'pointer',
          }}>
            + Publicar nuevo
          </button>
        </Link>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
        {!listings || listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p style={{ fontSize: '15px' }}>Todavía no tenés avisos publicados.</p>
          </div>
        ) : (
          listings.map((listing, i) => (
            <div key={listing.id} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px 20px',
              borderBottom: i < listings.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#f0f4ff' }}>
                {listing.listing_images?.[0]?.url
                  ? <img src={listing.listing_images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
                }
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#333', marginBottom: '3px' }}>
                  {listing.title}
                </div>
                <div style={{ fontSize: '12px', color: '#999', display: 'flex', gap: '12px' }}>
                  <span>👁️ {listing.view_count} vistas</span>
                  <span>📞 {listing.contact_count} contactos</span>
                  <span>❤️ {listing.favorite_count} favoritos</span>
                </div>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 800, color: '#3483fa', marginRight: '8px' }}>
                ${listing.price.toLocaleString('es-AR')}
              </div>

              <span style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                background: statusColor[listing.status] ?? '#f3f4f6',
                color: statusText[listing.status] ?? '#6b7280',
              }}>
                {statusLabel[listing.status] ?? listing.status}
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <Link href={`/my-listings/${listing.id}/edit`}>
                  <button style={{ background: '#f5f5f5', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                    Editar
                  </button>
                </Link>
                {listing.slug && (
                  <Link href={`/listings/${listing.slug}`}>
                    <button style={{ background: '#e8f0fe', color: '#3483fa', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                      Ver
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
