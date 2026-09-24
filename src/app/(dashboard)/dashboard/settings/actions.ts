'use server'

// El teléfono y el estado de verificación se leen y se escriben desde el servidor: con la clave anónima
// o la sesión del navegador, `phone` no es legible (solo `public_phone`, que respeta "mostrar teléfono")
// y la verificación de identidad no la puede marcar el propio usuario.
import { createServiceClient } from '@/lib/supabase/service'
import { getSessionUser } from '@/lib/supabase/admin-auth'

export interface MyProfile {
  email: string
  full_name: string | null
  phone: string | null
  location: string | null
  bio: string | null
  show_phone: boolean | null
  identity_verified: boolean | null
  identity_verified_method: string | null
  avatar_url: string | null
}

export async function getMyProfile(): Promise<MyProfile | null> {
  const user = await getSessionUser()
  if (!user) return null
  const { data } = await createServiceClient()
    .from('profiles')
    .select('full_name, phone, location, bio, show_phone, identity_verified, identity_verified_method, avatar_url')
    .eq('id', user.id)
    .maybeSingle()
  return { email: user.email ?? '', ...(data ?? {}) } as MyProfile
}

// Verificación por email: el navegador acaba de validar el código (verifyOtp), lo que crea un inicio de
// sesión. Se acepta solo si ese inicio de sesión es reciente, así no alcanza con llamar a esta acción.
const OTP_WINDOW_MS = 10 * 60 * 1000

export async function markEmailVerified(): Promise<{ ok: boolean }> {
  const user = await getSessionUser()
  if (!user?.last_sign_in_at) return { ok: false }
  if (Date.now() - new Date(user.last_sign_in_at).getTime() > OTP_WINDOW_MS) return { ok: false }
  const { error } = await createServiceClient()
    .from('profiles')
    .update({ identity_verified: true, identity_verified_method: 'email', identity_verified_at: new Date().toISOString() })
    .eq('id', user.id)
  return { ok: !error }
}
