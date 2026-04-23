import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  // getSession() — solo para display en navbar (nombre, avatar). Las mutaciones
  // usan getUser() en sus propios Server Actions. Intencional para evitar round-trip.
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
