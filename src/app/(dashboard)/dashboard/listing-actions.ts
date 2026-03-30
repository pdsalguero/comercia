'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function toggleListingStatus(listingId: string, currentStatus: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const newStatus = currentStatus === 'active' ? 'paused' : 'active'

  await supabase
    .from('listings')
    .update({ status: newStatus })
    .eq('id', listingId)
    .eq('user_id', user.id) // ensures ownership
}

export async function deleteListing(listingId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('user_id', user.id) // ensures ownership
}
