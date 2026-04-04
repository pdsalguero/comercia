import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { VerifyIdentityModal } from '@/components/auth/VerifyIdentityModal'

export const dynamic = 'force-dynamic'

const navItems = [
  { label: '🏠 Inicio',          href: '/dashboard' },
  { label: '📋 Mis avisos',       href: '/dashboard/my-listings' },
  { label: '🏪 Mi Tienda',        href: '/dashboard/store' },
  { label: '❤️ Favoritos',        href: '/dashboard/favorites' },
  { label: '💬 Mensajes',         href: '/dashboard/messages' },
  { label: '⚙️ Configuración',    href: '/dashboard/settings' },
  { label: '⭐ Planes Pro',       href: '/upgrade' },
]

const adminNavItem = { label: '🛡️ Admin',  href: '/admin' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { count: unreadCount }, { count: listingsCount }, { count: favoritesCount }] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, full_name, avatar_url, is_pro, identity_verified, is_admin')
      .eq('id', user.id)
      .single(),
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false),
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active'),
    supabase
      .from('listing_favorites')
      .select('user_id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  return (
    <div style={{ minHeight: '100vh', background: '#ebebeb' }}>
      <Navbar user={user} initialUnreadCount={unreadCount ?? 0} />
      <div className="dashboard-wrapper" style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 16px" }}>
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            {/* Profile card */}
            <Link href="/dashboard/messages" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '12px', textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: '#3483fa', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 800,
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (profile?.full_name?.[0]?.toUpperCase() ?? profile?.username?.[0]?.toUpperCase() ?? '?')
                  }
                </div>
                {(unreadCount ?? 0) > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    background: '#ef4444', color: '#fff',
                    fontSize: '10px', fontWeight: 700,
                    minWidth: '18px', height: '18px', borderRadius: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px', border: '2px solid #fff',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
                {profile?.full_name ?? 'Usuario'}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                @{profile?.username ?? ''}
              </div>
              {(unreadCount ?? 0) > 0 ? (
                <span style={{ background: '#fef2f2', color: '#ef4444', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                  💬 {unreadCount} mensaje{(unreadCount ?? 0) !== 1 ? 's' : ''} sin leer
                </span>
              ) : profile?.is_pro ? (
                <span style={{ background: '#fff159', color: '#333', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                  ⭐ PRO
                </span>
              ) : null}
            </div>
            </Link>

            {/* Nav */}
            <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
              {[...navItems, ...(profile?.is_admin ? [adminNavItem] : [])].map((item, i, arr) => (
                <Link key={item.href} href={item.href}>
                  <div style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: item.href === '/admin' ? '#f97316' : '#333',
                    borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: item.href === '/admin' ? 700 : 400,
                  }}
                  className="hover:bg-gray-50">
                    <span>{item.label}</span>
                    {item.href === '/dashboard/messages' && (unreadCount ?? 0) > 0 && (
                      <span style={{
                        background: '#ef4444', color: '#fff',
                        fontSize: '11px', fontWeight: 700,
                        padding: '1px 7px', borderRadius: '20px',
                        minWidth: '20px', textAlign: 'center',
                      }}>
                        {unreadCount}
                      </span>
                    )}
                    {item.href === '/dashboard/my-listings' && (listingsCount ?? 0) > 0 && (
                      <span style={{
                        background: '#f1f5f9', color: '#64748b',
                        fontSize: '11px', fontWeight: 700,
                        padding: '1px 7px', borderRadius: '20px',
                        minWidth: '20px', textAlign: 'center',
                      }}>
                        {listingsCount}
                      </span>
                    )}
                    {item.href === '/dashboard/favorites' && (favoritesCount ?? 0) > 0 && (
                      <span style={{
                        background: '#fef2f2', color: '#ef4444',
                        fontSize: '11px', fontWeight: 700,
                        padding: '1px 7px', borderRadius: '20px',
                        minWidth: '20px', textAlign: 'center',
                      }}>
                        {favoritesCount}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Publish CTA */}
            <Link href="/listings/new" style={{ display: 'block', marginTop: '12px' }}>
              <button style={{
                width: '100%',
                background: '#3483fa',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                + Publicar aviso
              </button>
            </Link>
          </aside>

          {/* Main content */}
          <main style={{ minWidth: 0 }}>
            {/* Mobile nav — visible only on mobile */}
            <nav className="dashboard-mobile-nav" style={{ display: 'none' }}>
              <div style={{
                background: '#fff', borderRadius: '10px', marginBottom: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex', flexWrap: 'wrap',
              }}>
                {navItems.map(item => (
                  <Link key={item.href} href={item.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <div style={{
                      padding: '9px 12px', fontSize: '12px',
                      color: '#475569', fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                    }}
                    className="hover:text-indigo-600"
                    >
                      {item.label}
                      {item.href === '/dashboard/messages' && (unreadCount ?? 0) > 0 && (
                        <span style={{
                          background: '#ef4444', color: '#fff',
                          fontSize: '10px', fontWeight: 700,
                          padding: '0 5px', borderRadius: '20px',
                        }}>{unreadCount}</span>
                      )}
                      {item.href === '/dashboard/my-listings' && (listingsCount ?? 0) > 0 && (
                        <span style={{
                          background: '#f1f5f9', color: '#64748b',
                          fontSize: '10px', fontWeight: 700,
                          padding: '0 5px', borderRadius: '20px',
                        }}>{listingsCount}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </nav>
            {children}
          </main>
        </div>
      </div>
      <Footer />
      <VerifyIdentityModal isVerified={!!profile?.identity_verified} />
    </div>
  )
}
