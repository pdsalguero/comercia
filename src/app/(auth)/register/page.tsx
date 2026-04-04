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
  transition: 'border-color 0.15s',
}

const LABEL = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  display: 'block',
  marginBottom: '6px',
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep]         = useState<1 | 2>(1)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (step === 1) {
      if (!fullName.trim() || !username.trim()) { setError('Completá todos los campos.'); return }
      setError('')
      setStep(2)
      return
    }

    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 8)  { setError('La contraseña debe tener al menos 8 caracteres.'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, username } },
    })

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'Ya existe una cuenta con ese email.'
        : 'Ocurrió un error. Intentá de nuevo.')
      setLoading(false)
      return
    }

    // Si no hay sesión, el email requiere confirmación
    if (!data.session) {
      setError('Revisá tu email para confirmar la cuenta.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 10 ? 2 : password.length < 12 ? 3 : 4
  const strengthColor = ['#e2e8f0', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][strength]
  const strengthLabel = ['', 'Muy corta', 'Débil', 'Aceptable', '✓ Segura'][strength]

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '36px 32px',
      width: '100%',
      maxWidth: '420px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
        Crear cuenta gratis
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" style={{ color: '#3483fa', fontWeight: 600, textDecoration: 'none' }}>
          Ingresá acá
        </Link>
      </p>

      {/* Steps */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
        {(['Tus datos', 'Acceso'] as const).map((label, i) => {
          const s = i + 1
          const active = s <= step
          return (
            <div key={s} style={{ flex: 1 }}>
              <div style={{
                height: '3px', borderRadius: '2px',
                background: active ? '#3483fa' : '#e2e8f0',
                marginBottom: '5px',
                transition: 'background 0.3s',
              }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: active ? '#3483fa' : '#94a3b8' }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '10px 14px',
          fontSize: '13px', color: '#dc2626', marginBottom: '18px',
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {step === 1 && (
          <>
            <div>
              <label style={LABEL}>Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                required
                style={INPUT}
              />
            </div>

            <div>
              <label style={LABEL}>Nombre de usuario</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', fontSize: '14px', color: '#94a3b8',
                }}>@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="juanperez"
                  required
                  style={{ ...INPUT, paddingLeft: '30px' }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
                Solo letras, números y guión bajo.{' '}
                <span style={{ color: '#ef4444' }}>No se puede cambiar después.</span>
              </p>
            </div>

            <button type="submit" style={{
              background: 'linear-gradient(135deg, #3483fa, #2563eb)',
              color: '#fff', border: 'none', borderRadius: '10px',
              padding: '12px', fontWeight: 800, fontSize: '15px',
              cursor: 'pointer', marginTop: '4px',
              boxShadow: '0 2px 10px rgba(52,131,250,0.30)',
            }}>
              Continuar →
            </button>

          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label style={LABEL}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={INPUT}
              />
            </div>

            <div>
              <label style={LABEL}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                style={INPUT}
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
              <label style={LABEL}>Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repetí tu contraseña"
                required
                style={{
                  ...INPUT,
                  borderColor: confirm && confirm !== password ? '#ef4444' : INPUT.border.replace('1.5px solid ', ''),
                }}
              />
              {confirm && confirm !== password && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>Las contraseñas no coinciden</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => { setStep(1); setError('') }}
                style={{
                  flex: 1, background: '#fff', color: '#475569',
                  border: '1.5px solid #e2e8f0', borderRadius: '10px',
                  padding: '11px', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                ← Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3483fa, #2563eb)',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '12px', fontWeight: 800, fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 2px 10px rgba(52,131,250,0.30)',
                }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}

