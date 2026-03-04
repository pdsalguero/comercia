'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
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
      borderRadius: '8px',
      padding: '32px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
    }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#333', marginBottom: '6px' }}>
        Ingresá a comercIA
      </h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
        ¿No tenés cuenta?{' '}
        <Link href="/register" style={{ color: '#3483fa', fontWeight: 600 }}>
          Creala gratis
        </Link>
      </p>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '13px',
          color: '#dc2626',
          marginBottom: '16px',
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px 12px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
              Contraseña
            </label>
            <a href="#" style={{ fontSize: '13px', color: '#3483fa' }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px 12px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#a0c4ff' : '#3483fa',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '12px',
            fontWeight: 800,
            fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '4px',
          }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: '#eee' }} />
        <span style={{ fontSize: '12px', color: '#999' }}>o continuá con</span>
        <div style={{ flex: 1, height: '1px', background: '#eee' }} />
      </div>

      {/* Google OAuth */}
      <GoogleButton />
    </div>
  )
}

function GoogleButton() {
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <button
      onClick={handleGoogle}
      disabled={loading}
      style={{
        width: '100%',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '11px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#333',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
        <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
        <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
      </svg>
      {loading ? 'Redirigiendo...' : 'Continuar con Google'}
    </button>
  )
}
