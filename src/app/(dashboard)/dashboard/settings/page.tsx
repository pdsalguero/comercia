'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

type Tab = 'perfil' | 'verificacion' | 'cuenta'
type VerifyStep = 'idle' | 'code'
type PasswordStep = 'idle' | 'sent'

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const initialTab: Tab = searchParams.get('tab') === 'identity' ? 'verificacion' : 'perfil'
  const [tab, setTab] = useState<Tab>(initialTab)

  // Profile
  const [loading, setLoading]         = useState(false)
  const [saved, setSaved]             = useState(false)
  const [fullName, setFullName]       = useState('')
  const [phone, setPhone]             = useState('')
  const [showPhone, setShowPhone]     = useState(true)
  const [location, setLocation]       = useState('')
  const [bio, setBio]                 = useState('')
  const [email, setEmail]             = useState('')
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  // Password reset
  const [passwordStep, setPasswordStep]     = useState<PasswordStep>('idle')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError]   = useState('')

  // Identity verification
  const [identityVerified, setIdentityVerified]   = useState(false)
  const [identityMethod, setIdentityMethod]       = useState<string | null>(null)
  const [verifyStep, setVerifyStep]               = useState<VerifyStep>('idle')
  const [otpCode, setOtpCode]                     = useState('')
  const [verifyLoading, setVerifyLoading]         = useState(false)
  const [verifyError, setVerifyError]             = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, location, bio, show_phone, identity_verified, identity_verified_method, avatar_url')
        .eq('id', user.id)
        .single()
      if (data) {
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
        setLocation(data.location ?? '')
        setBio(data.bio ?? '')
        setAvatarUrl((data as any).avatar_url ?? null)
        if (data.show_phone !== undefined) setShowPhone(data.show_phone !== false)
        setIdentityVerified(data.identity_verified ?? false)
        setIdentityMethod(data.identity_verified_method ?? null)
      }
    }
    load()
  }, [])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAvatarUploading(false); return }
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { alert(`Error al subir imagen: ${upErr.message}`); setAvatarUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: dbErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    if (dbErr) { alert(`Error al guardar avatar: ${dbErr.message}`); setAvatarUploading(false); return }
    setAvatarUrl(publicUrl)
    setAvatarUploading(false)
    router.refresh()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({
      full_name: fullName, phone, location, bio, show_phone: showPhone,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
    setLoading(false)
    if (error) {
      alert(`Error al guardar: ${error.message}`)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handlePasswordReset() {
    setPasswordLoading(true)
    setPasswordError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    })
    setPasswordLoading(false)
    if (error) { setPasswordError('No se pudo enviar el email. Intentá de nuevo.'); return }
    setPasswordStep('sent')
  }

  async function handleSendOtp() {
    setVerifyLoading(true)
    setVerifyError('')
    setOtpCode('')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
    if (error) setVerifyError('No se pudo enviar el código. Intentá más tarde.')
    else setVerifyStep('code')
    setVerifyLoading(false)
  }

  async function handleConfirmOtp() {
    setVerifyLoading(true)
    setVerifyError('')
    const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'email' })
    if (error) {
      setVerifyError('Código incorrecto o expirado.')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          identity_verified: true,
          identity_verified_method: 'email',
          identity_verified_at: new Date().toISOString(),
        }).eq('id', user.id)
      }
      setIdentityVerified(true)
      setIdentityMethod('email')
      setVerifyStep('idle')
      setOtpCode('')
    }
    setVerifyLoading(false)
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'perfil',       label: 'Perfil',         icon: '👤' },
    { id: 'verificacion', label: 'Verificación',    icon: identityVerified ? '✅' : '🛡️' },
    { id: 'cuenta',       label: 'Cuenta',          icon: '⚙️' },
  ]

  return (
    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '14px 12px',
              fontSize: '13px', fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? '#6366f1' : '#64748b',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === t.id ? '2.5px solid #6366f1' : '2.5px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'color 0.15s',
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.id === 'verificacion' && identityVerified && (
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Perfil ── */}
      {tab === 'perfil' && (
        <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {saved && (
            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Cambios guardados correctamente
            </div>
          )}

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: avatarUrl ? 'transparent' : '#3483fa',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid #e2e8f0',
              }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>{fullName?.[0]?.toUpperCase() ?? '?'}</span>
                }
              </div>
              <label style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#2563eb', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Foto de perfil</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                {avatarUploading ? 'Subiendo...' : 'JPG, PNG o WEBP · Máx 2MB'}
              </div>
            </div>
          </div>

          {/* Row 1: Email + Full name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" hint="No se puede cambiar">
              <input type="email" value={email} disabled
                style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
            </Field>
            <Field label="Nombre completo">
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Tu nombre completo" style={inputStyle} />
            </Field>
          </div>

          {/* Row 2: Phone + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone with toggle */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={labelStyle}>Teléfono / WhatsApp</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ fontSize: '11px', color: showPhone ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                    {showPhone ? 'Visible' : 'Oculto'}
                  </span>
                  <div
                    onClick={() => setShowPhone(v => !v)}
                    style={{ width: '36px', height: '20px', borderRadius: '10px', background: showPhone ? '#22c55e' : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                  >
                    <div style={{ position: 'absolute', top: '2px', left: showPhone ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </label>
              </div>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Ej: 2645115818"
                style={{ ...inputStyle, opacity: showPhone ? 1 : 0.5 }} />
            </div>
            <Field label="Localidad">
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Ej: Rivadavia, Capital" style={inputStyle} />
            </Field>
          </div>

          {/* Row 3: Bio */}
          <Field label="Descripción" hint="Visible en tu perfil público">
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Vendedor particular, entrego en mano o envío por correo..."
              rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }} />
          </Field>

          <div>
            <button type="submit" disabled={loading} style={{
              background: loading ? '#93c5fd' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '11px 28px', fontWeight: 700, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      )}

      {/* ── Tab: Verificación ── */}
      {tab === 'verificacion' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Vendedor Identificado</h2>
              {identityVerified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Verificado
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Verificá tu identidad por correo electrónico. Tu perfil mostrará el badge y generarás más confianza con los compradores.
            </p>
          </div>

          {identityVerified ? (
            /* Already verified */
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e40af' }}>Identidad verificada</div>
                <div style={{ fontSize: '13px', color: '#3b82f6', marginTop: '2px' }}>
                  Verificado por {identityMethod === 'email' ? 'correo electrónico' : 'teléfono'}
                </div>
              </div>
            </div>
          ) : verifyStep === 'idle' ? (
            /* Benefits + start */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { icon: '🛡️', title: 'Más confianza', desc: 'Los compradores prefieren vendedores verificados' },
                  { icon: '✅', title: 'Badge visible', desc: 'Aparece en tu perfil y publicaciones' },
                  { icon: '📈', title: 'Mejor posición', desc: 'Tus avisos tienen mejor alcance' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{item.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
              <div>
                <button onClick={handleSendOtp} disabled={verifyLoading}
                  style={{ background: verifyLoading ? '#93c5fd' : 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px', fontWeight: 700, fontSize: '14px', cursor: verifyLoading ? 'not-allowed' : 'pointer' }}>
                  {verifyLoading ? 'Enviando...' : 'Verificar mi identidad →'}
                </button>
                {verifyError && <ErrorMsg>{verifyError}</ErrorMsg>}
              </div>
            </div>
          ) : verifyStep === 'code' ? (
            /* Enter code */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '420px' }}>
              <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '13px', color: '#15803d' }}>
                ✅ Código enviado a <strong>{email}</strong>. Revisá tu bandeja de entrada.
              </div>
              <div>
                <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Ingresá el código que recibiste por email</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="12345678" maxLength={8}
                    style={{ ...inputStyle, flex: 1, fontSize: '22px', letterSpacing: '0.4em', textAlign: 'center', fontWeight: 700 }} />
                  <button onClick={handleConfirmOtp} disabled={verifyLoading || otpCode.length < 5}
                    style={{ background: otpCode.length < 6 ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: otpCode.length < 6 ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
                    {verifyLoading ? 'Verificando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
              {verifyError && <ErrorMsg>{verifyError}</ErrorMsg>}
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={handleSendOtp} disabled={verifyLoading} style={linkBtnStyle}>Reenviar código</button>
                <button onClick={() => { setVerifyStep('idle'); setVerifyError(''); setOtpCode('') }} style={linkBtnStyle}>← Cancelar</button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Tab: Cuenta ── */}
      {tab === 'cuenta' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Mi cuenta</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Gestioná el acceso a tu cuenta</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Sesión activa</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{email}</div>
            </div>
            <button onClick={handleLogout}
              style={{ background: '#fff', color: '#dc2626', border: '1.5px solid #dc2626', borderRadius: '8px', padding: '9px 20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              Cerrar sesión
            </button>
          </div>

          {/* Cambiar contraseña */}
          <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Contraseña</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
              Te enviaremos un link a <strong>{email}</strong> para restablecer tu contraseña.
            </div>
            {passwordStep === 'sent' ? (
              <div style={{ fontSize: '13px', color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px' }}>
                ✅ Link enviado. Revisá tu bandeja de entrada.
              </div>
            ) : (
              <>
                <button
                  onClick={handlePasswordReset}
                  disabled={passwordLoading}
                  style={{ background: passwordLoading ? '#e2e8f0' : '#fff', color: '#334155', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '9px 20px', fontWeight: 600, fontSize: '13px', cursor: passwordLoading ? 'not-allowed' : 'pointer' }}
                >
                  {passwordLoading ? 'Enviando...' : 'Cambiar contraseña'}
                </button>
                {passwordError && <ErrorMsg>{passwordError}</ErrorMsg>}
              </>
            )}
          </div>

          <div style={{ padding: '16px 20px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>Zona peligrosa</div>
            <div style={{ fontSize: '12px', color: '#ef4444' }}>Para eliminar tu cuenta contactá al soporte.</div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px',
  padding: '10px 14px', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s', fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#475569' }

const linkBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#6366f1', fontSize: '12px',
  fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline',
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ ...labelStyle, display: 'block', marginBottom: '6px' }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: '6px', fontSize: '12px' }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', color: '#dc2626' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {children}
    </div>
  )
}
