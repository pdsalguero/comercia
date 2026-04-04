'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 10 ? 2 : password.length < 12 ? 3 : 4
  const strengthColor = ['#e2e8f0', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][strength]
  const strengthLabel = ['', 'Muy corta', 'Débil', 'Aceptable', '✓ Segura'][strength]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 8)  { setError('La contraseña debe tener al menos 8 caracteres.'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (updateError) {
      setError('No se pudo actualizar la contraseña. El link puede haber expirado.')
      return
    }

    router.push('/?password_updated=1')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px',
    padding: '11px 14px', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', color: '#0f172a', background: '#fff',
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '36px 32px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
        Nueva contraseña
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
        Elegí una contraseña segura para tu cuenta.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '10px 14px',
            fontSize: '13px', color: '#dc2626',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
            Nueva contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Mínimo 8 caracteres"
            style={inputStyle}
          />
          {password && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: '3px', borderRadius: '2px',
                    background: i <= strength ? strengthColor : '#e2e8f0',
                    transition: 'background 0.2s',
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: strengthColor }}>{strengthLabel}</span>
            </div>
          )}
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
            Confirmar contraseña
          </label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            placeholder="Repetí tu contraseña"
            style={{
              ...inputStyle,
              borderColor: confirm && confirm !== password ? '#ef4444' : '#e2e8f0',
            }}
          />
          {confirm && confirm !== password && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>Las contraseñas no coinciden</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3483fa, #2563eb)',
            color: '#fff', border: 'none', borderRadius: '10px',
            padding: '12px', fontWeight: 800, fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 2px 10px rgba(52,131,250,0.30)',
          }}
        >
          {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </div>
  )
}
