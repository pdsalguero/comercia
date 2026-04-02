'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useRef } from 'react'

const STATUSES = [
  { value: '',        label: 'Todos' },
  { value: 'active',  label: 'Activos' },
  { value: 'paused',  label: 'Pausados' },
  { value: 'expired', label: 'Vencidos' },
  { value: 'sold',    label: 'Vendidos' },
]

export function MyListingsSearch({ q, statusFilter }: { q: string; statusFilter: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function navigate(newQ?: string, newStatus?: string) {
    const qVal = newQ !== undefined ? newQ : q
    const sVal = newStatus !== undefined ? newStatus : statusFilter
    const params = new URLSearchParams()
    if (qVal) params.set('q', qVal)
    if (sVal) params.set('status_filter', sVal)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          defaultValue={q}
          placeholder="Buscar por título..."
          onChange={e => {
            clearTimeout(timerRef.current)
            const val = e.target.value
            timerRef.current = setTimeout(() => navigate(val), 350)
          }}
          style={{
            width: '100%',
            padding: '9px 12px 9px 36px',
            border: '1.5px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            background: '#f8fafc',
            color: '#1e293b',
          }}
        />
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => navigate(undefined, s.value)}
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1.5px solid',
              borderColor: statusFilter === s.value ? '#6366f1' : '#e2e8f0',
              background: statusFilter === s.value ? '#6366f1' : '#fff',
              color: statusFilter === s.value ? '#fff' : '#64748b',
              transition: 'all 0.15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
