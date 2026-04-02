'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INPUT = {
  width: '100%',
  border: '1.5px solid #e2e8f0',
  borderRadius: '10px',
  padding: '11px 14px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box' as const,
  color: '#0f172a',
  background: '#fff',
}

const LABEL = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  display: 'block',
  marginBottom: '6px',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (loginError) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
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
        Bienvenido de vuelta
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>
        ¿No tenés cuenta?{' '}
        <Link href="/register" style={{ color: '#3483fa', fontWeight: 600, textDecoration: 'none' }}>
          Creala gratis
        </Link>
      </p>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '10px 14px',
          fontSize: '13px', color: '#dc2626', marginBottom: '18px',
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={LABEL}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            style={INPUT}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...LABEL, marginBottom: 0 }}>Contraseña</label>
            <Link href="/forgot-password" style={{ fontSize: '13px', color: '#3483fa', textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={INPUT}
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
            marginTop: '4px',
            boxShadow: loading ? 'none' : '0 2px 10px rgba(52,131,250,0.30)',
          }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

    </div>
  )
}
