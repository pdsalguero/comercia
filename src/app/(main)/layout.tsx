import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PublishFAB } from '@/components/ui/PublishFAB'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: unreadCount } = user
    ? await supabase.from('messages').select('id', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('is_read', false)
    : { count: 0 }

  return (
    <div style={{ minHeight: '100vh', background: '#ebebeb' }}>
      <Navbar user={user} initialUnreadCount={unreadCount ?? 0} />
      <main className="py-4">
        {children}
      </main>
      <Footer />
      <PublishFAB />
    </div>
  )
}
