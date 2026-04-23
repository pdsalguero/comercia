import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  // getSession decodifica el JWT localmente (sin round-trip de red a Supabase)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // El conteo de no leídos se carga client-side en Navbar via useEffect
  return (
    <div style={{ minHeight: '100vh', background: '#ebebeb' }}>
      <Navbar user={user} initialUnreadCount={0} />
      <main className="py-4">
        {children}
      </main>
      <Footer />
    </div>
  )
}
