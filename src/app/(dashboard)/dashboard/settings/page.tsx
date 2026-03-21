'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Tab = 'perfil' | 'verificacion' | 'cuenta'
type VerifyStep = 'idle' | 'choose' | 'phone-input' | 'code'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('perfil')

  // Profile
  const [loading, setLoading]     = useState(false)
  const [saved, setSaved]         = useState(false)
  const [fullName, setFullName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [showPhone, setShowPhone] = useState(true)
  const [location, setLocation]   = useState('')
  const [bio, setBio]             = useState('')
  const [email, setEmail]         = useState('')

  // Identity verification
  const [identityVerified, setIdentityVerified]   = useState(false)
  const [identityMethod, setIdentityMethod]       = useState<string | null>(null)
  const [verifyStep, setVerifyStep]               = useState<VerifyStep>('idle')
  const [verifyMethod, setVerifyMethod]           = useState<'email' | 'phone' | null>(null)
  const [phoneForVerify, setPhoneForVerify]       = useState('')
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
        .select('full_name, phone, location, bio, show_phone, identity_verified, identity_verified_method')
        .eq('id', user.id)
        .single()
      if (data) {
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
        setLocation(data.location ?? '')
        setBio(data.bio ?? '')
        if (data.show_phone !== undefined) setShowPhone(data.show_phone !== false)
        setIdentityVerified(data.identity_verified ?? false)
        setIdentityMethod(data.identity_verified_method ?? null)
        setPhoneForVerify(data.phone ?? '')
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      full_name: fullName, phone, location, bio, show_phone: showPhone,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleSendOtp(method: 'email' | 'phone') {
    setVerifyLoading(true)
    setVerifyError('')
    setOtpCode('')
    if (method === 'email') {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
      if (error) setVerifyError('No se pudo enviar el código. Intentá más tarde.')
      else { setVerifyMethod('email'); setVerifyStep('code') }
    } else {
      if (!phoneForVerify.trim()) { setVerifyError('Ingresá un número de teléfono.'); setVerifyLoading(false); return }
      const normalized = phoneForVerify.startsWith('+') ? phoneForVerify : `+54${phoneForVerify.replace(/^0/, '')}`
      const { error } = await supabase.auth.signInWithOtp({ phone: normalized, options: { shouldCreateUser: false } })
      if (error) setVerifyError('No se pudo enviar el SMS. Verificá el número e incluí código de país.')
      else { setVerifyMethod('phone'); setVerifyStep('code') }
    }
    setVerifyLoading(false)
  }

  async function handleConfirmOtp() {
    setVerifyLoading(true)
    setVerifyError('')
    let err: string | null = null
    if (verifyMethod === 'email') {
      const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'email' })
      if (error) err = 'Código incorrecto o expirado.'
    } else {
      const normalized = phoneForVerify.startsWith('+') ? phoneForVerify : `+54${phoneForVerify.replace(/^0/, '')}`
      const { error } = await supabase.auth.verifyOtp({ phone: normalized, token: otpCode, type: 'sms' })
      if (error) err = 'Código incorrecto o expirado.'
    }
    if (err) {
      setVerifyError(err)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          identity_verified: true,
          identity_verified_method: verifyMethod,
          identity_verified_at: new Date().toISOString(),
        }).eq('id', user.id)
      }
      setIdentityVerified(true)
      setIdentityMethod(verifyMethod)
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

          {/* Row 1: Email + Full name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <Field label="Barrio / Zona">
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
              Verificá tu identidad por email o teléfono. Tu perfil mostrará el badge y generarás más confianza con los compradores.
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
                <button onClick={() => setVerifyStep('choose')}
                  style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                  Verificar mi identidad →
                </button>
              </div>
            </div>
          ) : verifyStep === 'choose' ? (
            /* Choose method */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>¿Cómo querés verificarte?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={() => handleSendOtp('email')} disabled={verifyLoading}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  className="hover:border-blue-400"
                >
                  <span style={{ fontSize: '32px' }}>📧</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Por correo electrónico</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', lineHeight: 1.4 }}>
                    Enviamos un código a<br /><strong style={{ color: '#475569' }}>{email}</strong>
                  </div>
                  {verifyLoading && <span style={{ fontSize: '11px', color: '#6366f1' }}>Enviando...</span>}
                </button>
                <button onClick={() => setVerifyStep('phone-input')} disabled={verifyLoading}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  className="hover:border-blue-400"
                >
                  <span style={{ fontSize: '32px' }}>📱</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Por teléfono (SMS)</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', lineHeight: 1.4 }}>
                    Enviamos un código por<br />mensaje de texto
                  </div>
                </button>
              </div>
              {verifyError && <ErrorMsg>{verifyError}</ErrorMsg>}
              <button onClick={() => { setVerifyStep('idle'); setVerifyError('') }} style={linkBtnStyle}>← Cancelar</button>
            </div>
          ) : verifyStep === 'phone-input' ? (
            /* Phone input */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '420px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Ingresá tu número de teléfono</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="tel" value={phoneForVerify} onChange={e => setPhoneForVerify(e.target.value)}
                  placeholder="+54 264 511 5818" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => handleSendOtp('phone')} disabled={verifyLoading}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: 700, fontSize: '13px', cursor: verifyLoading ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: verifyLoading ? 0.7 : 1 }}>
                  {verifyLoading ? 'Enviando...' : 'Enviar SMS'}
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Incluí el código de país: +54 para Argentina</div>
              {verifyError && <ErrorMsg>{verifyError}</ErrorMsg>}
              <button onClick={() => { setVerifyStep('choose'); setVerifyError('') }} style={linkBtnStyle}>← Volver</button>
            </div>
          ) : verifyStep === 'code' ? (
            /* Enter code */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '420px' }}>
              <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '13px', color: '#15803d' }}>
                {verifyMethod === 'email'
                  ? <>✅ Código enviado a <strong>{email}</strong>. Revisá tu bandeja de entrada.</>
                  : <>✅ Código enviado por SMS al número indicado.</>}
              </div>
              <div>
                <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Código de 6 dígitos</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456" maxLength={6}
                    style={{ ...inputStyle, flex: 1, fontSize: '22px', letterSpacing: '0.4em', textAlign: 'center', fontWeight: 700 }} />
                  <button onClick={handleConfirmOtp} disabled={verifyLoading || otpCode.length < 6}
                    style={{ background: otpCode.length < 6 ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: otpCode.length < 6 ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
                    {verifyLoading ? 'Verificando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
              {verifyError && <ErrorMsg>{verifyError}</ErrorMsg>}
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => verifyMethod === 'email' ? handleSendOtp('email') : handleSendOtp('phone')}
                  disabled={verifyLoading} style={linkBtnStyle}>Reenviar código</button>
                <button onClick={() => { setVerifyStep('choose'); setVerifyError(''); setOtpCode('') }} style={linkBtnStyle}>← Volver</button>
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
