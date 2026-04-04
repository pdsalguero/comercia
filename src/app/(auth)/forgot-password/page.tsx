'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    })

    setLoading(false)
    if (resetError) {
      setError('Ocurrió un error. Intentá de nuevo.')
      return
    }
    setSent(true)
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
        Recuperar contraseña
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
        Ingresá tu email y te enviamos un link para restablecer tu contraseña.
      </p>

      {sent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '10px', padding: '16px',
            fontSize: '14px', color: '#15803d',
          }}>
            ✅ Enviamos el link a <strong>{email}</strong>. Revisá tu bandeja de entrada.
          </div>
          <Link href="/login" style={{ fontSize: '13px', color: '#3483fa', fontWeight: 600, textDecoration: 'none' }}>
            ← Volver al login
          </Link>
        </div>
      ) : (
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              style={{
                width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px',
                padding: '11px 14px', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', color: '#0f172a', background: '#fff',
              }}
            />
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
            {loading ? 'Enviando...' : 'Enviar link de recuperación'}
          </button>

          <Link href="/login" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', textAlign: 'center' }}>
            ← Volver al login
          </Link>
        </form>
      )}
    </div>
  )
}
