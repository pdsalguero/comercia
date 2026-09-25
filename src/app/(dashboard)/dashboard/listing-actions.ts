'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { revalidateHome } from '@/lib/revalidate-home'

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

  revalidateHome()
}

/**
 * Marca un aviso propio como vendido con la fecha real de venta ("2026-03-15"). El trigger
 * listings_sold_at completa hoy si falta y rechaza fechas futuras (ver 20260926000002_sold_listings.sql).
 * Volver a publicarlo es toggleListingStatus (sold → active), que borra la fecha.
 */
export async function markListingSold(listingId: string, soldDate: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!/^\d{4}-\d{2}-\d{2}$/.test(soldDate)) return { ok: false, error: 'Elegí la fecha de venta.' }
  // Mediodía de Argentina: así la fecha no cambia de día al pasar a UTC
  const soldAt = new Date(`${soldDate}T12:00:00-03:00`)
  if (isNaN(soldAt.getTime())) return { ok: false, error: 'La fecha no es válida.' }
  if (soldAt.getTime() > Date.now() + 24 * 3600 * 1000) return { ok: false, error: 'La fecha de venta no puede ser futura.' }

  const { data, error } = await supabase
    .from('listings')
    .update({ status: 'sold', sold_at: soldAt.toISOString() })
    .eq('id', listingId)
    .eq('user_id', user.id) // ensures ownership
    .in('status', ['active', 'paused'])
    .select('id')
  if (error || !data?.length) return { ok: false, error: 'No se pudo marcar como vendido.' }

  revalidatePath('/dashboard/my-listings')
  revalidatePath('/listings/[id]', 'page')
  revalidateHome()
  return { ok: true }
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

  revalidateHome()
}
