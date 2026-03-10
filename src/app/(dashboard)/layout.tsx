import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const navItems = [
  { label: '🏠 Inicio',          href: '/dashboard' },
  { label: '📋 Mis avisos',       href: '/my-listings' },
  { label: '❤️ Favoritos',        href: '/favorites' },
  { label: '💬 Mensajes',         href: '/messages' },
  { label: '⚙️ Configuración',    href: '/settings' },
  { label: '⭐ Planes Pro',       href: '/upgrade' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, is_pro')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ minHeight: '100vh', background: '#ebebeb' }}>
      <Navbar />
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Sidebar */}
          <aside>
            {/* Profile card */}
            <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '12px', textAlign: 'center' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: '#3483fa', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 800, margin: '0 auto 10px',
              }}>
                {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
                {profile?.full_name ?? 'Usuario'}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                @{profile?.username ?? ''}
              </div>
              {profile?.is_pro && (
                <span style={{ background: '#fff159', color: '#333', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                  ⭐ PRO
                </span>
              )}
            </div>

            {/* Nav */}
            <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
              {navItems.map((item, i) => (
                <Link key={item.href} href={item.href}>
                  <div style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#333',
                    borderBottom: i < navItems.length - 1 ? '1px solid #f5f5f5' : 'none',
                    cursor: 'pointer',
                  }}
                  className="hover:bg-gray-50">
                    {item.label}
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
          <main>
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
