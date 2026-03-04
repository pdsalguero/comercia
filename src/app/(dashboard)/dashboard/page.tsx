import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, price, status, view_count, contact_count, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  const stats = [
    { label: 'Avisos activos',      value: totalListings ?? 0, icon: '📋', color: '#3483fa' },
    { label: 'Mensajes sin leer',   value: totalMessages ?? 0, icon: '💬', color: '#22c55e' },
    { label: 'Vistas totales',      value: 0,                  icon: '👁️', color: '#f59e0b' },
    { label: 'Contactos recibidos', value: 0,                  icon: '📞', color: '#8b5cf6' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg,#1a0533,#3d1a6e,#2563eb)', borderRadius: '8px', padding: '24px 28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          ¡Bienvenido a comercIA! 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '16px' }}>
          Publicá tu primer aviso en 30 segundos con inteligencia artificial.
        </p>
        <Link href="/listings/new">
          <button style={{
            background: '#fff159', color: '#333',
            border: 'none', borderRadius: '4px',
            padding: '10px 20px', fontWeight: 800,
            fontSize: '14px', cursor: 'pointer',
          }}>
            📸 Publicar con IA
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ background: '#fff', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent listings */}
      <div style={{ background: '#fff', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>Mis últimos avisos</h2>
          <Link href="/my-listings" style={{ fontSize: '13px', color: '#3483fa' }}>
            Ver todos →
          </Link>
        </div>

        {!listings || listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#999' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>Todavía no publicaste ningún aviso.</p>
            <Link href="/listings/new">
              <button style={{
                background: '#3483fa', color: '#fff',
                border: 'none', borderRadius: '4px',
                padding: '10px 20px', fontWeight: 700,
                fontSize: '14px', cursor: 'pointer',
              }}>
                Publicar mi primer aviso
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {listings.map(listing => (
              <div key={listing.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 0', borderBottom: '1px solid #f5f5f5',
              }}>
                <div style={{ width: '44px', height: '44px', background: '#f0f4ff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  📦
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{listing.title}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    👁️ {listing.view_count} vistas · 📞 {listing.contact_count} contactos
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#3483fa' }}>
                    ${listing.price.toLocaleString('es-AR')}
                  </div>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600,
                    background: listing.status === 'active' ? '#dcfce7' : '#f3f4f6',
                    color: listing.status === 'active' ? '#16a34a' : '#6b7280',
                  }}>
                    {listing.status === 'active' ? '● Activo' : listing.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
