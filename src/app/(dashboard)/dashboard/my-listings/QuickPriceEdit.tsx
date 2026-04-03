'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  listingId: string
  price: number
  currency: string
  onSave: (id: string, price: number) => Promise<void>
}

export function QuickPriceEdit({ listingId, price, currency, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(price > 0 ? String(price) : '')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function handleSave() {
    const num = Number(value.replace(/\D/g, ''))
    if (isNaN(num) || num === price) { setEditing(false); return }
    setSaving(true)
    await onSave(listingId, num)
    setSaving(false)
    setEditing(false)
  }

  const sym = currency === 'USD' ? 'U$S' : '$'
  const display = price > 0 ? `${sym} ${price.toLocaleString('es-AR')}` : 'Sin precio'

  if (!editing) return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', cursor: 'pointer' }}
      onClick={() => setEditing(true)}
      title="Click para editar precio"
    >
      <span style={{ fontSize: '15px', fontWeight: 800, color: price > 0 ? '#3483fa' : '#f97316' }}>
        {display}
      </span>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{sym}</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={e => setValue(e.target.value.replace(/\D/g, ''))}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
        style={{
          width: '90px', padding: '3px 6px',
          border: '1.5px solid #6366f1', borderRadius: '6px',
          fontSize: '13px', fontWeight: 700, textAlign: 'right',
          outline: 'none', color: '#1e293b',
        }}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: '#6366f1', color: '#fff', border: 'none',
          borderRadius: '5px', padding: '3px 7px',
          fontSize: '11px', fontWeight: 700, cursor: 'pointer',
        }}
      >
        {saving ? '...' : '✓'}
      </button>
      <button
        onClick={() => setEditing(false)}
        style={{
          background: '#f1f5f9', color: '#64748b', border: 'none',
          borderRadius: '5px', padding: '3px 7px',
          fontSize: '11px', cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
  )
}
