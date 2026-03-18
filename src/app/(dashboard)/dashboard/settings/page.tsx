'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading]     = useState(false)
  const [saved, setSaved]         = useState(false)
  const [fullName, setFullName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [showPhone, setShowPhone] = useState(true)
  const [location, setLocation]   = useState('')
  const [bio, setBio]             = useState('')
  const [email, setEmail]         = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, location, bio')
        .eq('id', user.id)
        .single()
      if (data) {
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
        setLocation(data.location ?? '')
        setBio(data.bio ?? '')
        // load show_phone separately (column may not exist yet)
        const { data: sp } = await supabase
          .from('profiles')
          .select('show_phone')
          .eq('id', user.id)
          .single()
        if (sp && sp.show_phone !== undefined) setShowPhone(sp.show_phone !== false)
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Base update (always works)
    await supabase.from('profiles').update({
      full_name: fullName,
      phone,
      location,
      bio,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
    // show_phone update (only if column exists — run migration first)
    await supabase.from('profiles').update({ show_phone: showPhone }).eq('id', user.id).throwOnError().catch(() => {})
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Configuración</h1>

      {saved && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Cambios guardados correctamente
        </div>
      )}

      {/* Profile card */}
      <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Datos del perfil</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>Esta información es visible para otros usuarios</p>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Email (readonly) */}
          <Field label="Email" hint="No se puede cambiar">
            <input
              type="email" value={email} disabled
              style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
            />
          </Field>

          {/* Full name */}
          <Field label="Nombre completo">
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Tu nombre completo" style={inputStyle} />
          </Field>

          {/* Phone + toggle */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={labelStyle}>
                Teléfono / WhatsApp
              </label>
              {/* Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ fontSize: '12px', color: showPhone ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                  {showPhone ? 'Visible' : 'Oculto'}
                </span>
                <div
                  onClick={() => setShowPhone(v => !v)}
                  style={{
                    width: '40px', height: '22px', borderRadius: '11px',
                    background: showPhone ? '#22c55e' : '#cbd5e1',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: showPhone ? '21px' : '3px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </label>
            </div>
            <input
              type="tel" value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ej: 2645115818"
              style={{ ...inputStyle, opacity: showPhone ? 1 : 0.5 }}
            />
            {!showPhone && (
              <p style={{ fontSize: '11px', color: '#f59e0b', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Tu teléfono estará oculto y el botón de WhatsApp quedará deshabilitado
              </p>
            )}
          </div>

          {/* Location */}
          <Field label="Barrio / Zona">
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Ej: Rivadavia, Capital" style={inputStyle} />
          </Field>

          {/* Bio */}
          <Field label="Descripción" hint="Contá algo sobre vos o tu negocio">
            <textarea
              value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Vendedor particular, entrego en mano o envío por correo..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
            />
          </Field>

          <button
            type="submit" disabled={loading}
            style={{
              background: loading ? '#93c5fd' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '11px 28px', fontWeight: 700, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer', alignSelf: 'flex-start',
            }}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #fee2e2', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #fee2e2' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626', margin: 0 }}>Zona peligrosa</h2>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Cerrar sesión</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Salís de tu cuenta en este dispositivo</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: '#fff', color: '#dc2626',
              border: '1.5px solid #dc2626', borderRadius: '8px',
              padding: '9px 20px', fontWeight: 700,
              fontSize: '13px', cursor: 'pointer', flexShrink: 0,
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px',
  padding: '10px 14px', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 600, color: '#475569',
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
