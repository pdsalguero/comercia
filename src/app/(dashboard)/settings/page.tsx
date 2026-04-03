'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading]   = useState(false)
  const [saved, setSaved]       = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio]           = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
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
      full_name: fullName,
      phone,
      location,
      bio,
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

  const inputStyle = {
    width: '100%', border: '1px solid #ddd', borderRadius: '4px',
    padding: '10px 12px', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#333' }}>Configuración</h1>

      <div style={{ background: '#fff', borderRadius: '8px', padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '20px' }}>
          Datos del perfil
        </h2>

        {saved && (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: '#16a34a', marginBottom: '16px' }}>
            ✅ Cambios guardados correctamente
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Nombre completo</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Teléfono</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="264-XXX-XXXX" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Localidad</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Rivadavia, Capital" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Descripción</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Contá algo sobre vos..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#a0c4ff' : '#3483fa',
              color: '#fff', border: 'none', borderRadius: '4px',
              padding: '11px', fontWeight: 700, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer', alignSelf: 'flex-start',
              minWidth: '140px',
            }}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #fee2e2' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626', marginBottom: '12px' }}>
          Zona peligrosa
        </h2>
        <button
          onClick={handleLogout}
          style={{
            background: '#fff', color: '#dc2626',
            border: '1px solid #dc2626', borderRadius: '4px',
            padding: '10px 20px', fontWeight: 700,
            fontSize: '14px', cursor: 'pointer',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
