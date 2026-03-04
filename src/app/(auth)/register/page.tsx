'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep]             = useState<1 | 2>(1)
  const [fullName, setFullName]     = useState('')
  const [username, setUsername]     = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (step === 1) {
      if (!fullName.trim() || !username.trim()) {
        setError('Completá todos los campos.')
        return
      }
      setError('')
      setStep(2)
      return
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, username },
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Ya existe una cuenta con ese email.'
        : 'Ocurrió un error. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const inputStyle = {
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px 12px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    display: 'block',
    marginBottom: '6px',
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      padding: '32px',
      width: '100%',
      maxWidth: '420px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
    }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#333', marginBottom: '6px' }}>
        Crear cuenta gratis
      </h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" style={{ color: '#3483fa', fontWeight: 600 }}>
          Ingresá acá
        </Link>
      </p>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[1, 2].map(s => (
          <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{
              height: '3px',
              borderRadius: '2px',
              background: s <= step ? '#3483fa' : '#eee',
              transition: 'background 0.3s',
            }} />
            <span style={{ fontSize: '11px', color: s <= step ? '#3483fa' : '#bbb' }}>
              {s === 1 ? 'Tus datos' : 'Acceso'}
            </span>
          </div>
        ))}
      </div>

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

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {step === 1 && (
          <>
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Nombre de usuario</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '14px', color: '#999',
                }}>@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="juanperez"
                  required
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                Solo letras, números y guión bajo. No se puede cambiar después.
              </p>
            </div>

            <button
              type="submit"
              style={{
                background: '#3483fa',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '12px',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              Continuar →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repetí tu contraseña"
                required
                style={inputStyle}
              />
              {/* Password strength */}
              {password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '3px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: password.length >= i * 3
                          ? (password.length >= 10 ? '#22c55e' : '#f59e0b')
                          : '#eee',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: password.length >= 10 ? '#22c55e' : '#f59e0b' }}>
                    {password.length < 8 ? 'Muy corta' : password.length < 10 ? 'Aceptable' : '✓ Segura'}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => { setStep(1); setError('') }}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '11px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                ← Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
                  background: loading ? '#a0c4ff' : '#3483fa',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
              </button>
            </div>
          </>
        )}
      </form>

      {step === 1 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#eee' }} />
            <span style={{ fontSize: '12px', color: '#999' }}>o registrate con</span>
            <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          </div>
          <GoogleButton />
        </>
      )}
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
