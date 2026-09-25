'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck } from 'lucide-react'
import { markListingSold } from '@/app/(dashboard)/dashboard/listing-actions'

// Fecha de hoy en Argentina, en formato del <input type="date">
function todayAR(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
}

/** Diálogo "Marcar como vendido" con la fecha real de venta (Mis avisos: tarjetas y tabla). */
export function MarkSoldDialog({ listingId, title, onClose }: { listingId: string; title: string; onClose: () => void }) {
  const router = useRouter()
  const today = todayAR()
  const [date, setDate] = useState(today)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function confirm() {
    setError('')
    startTransition(async () => {
      const res = await markListingSold(listingId, date)
      if (!res.ok) { setError(res.error ?? 'No se pudo marcar como vendido.'); return }
      onClose()
      router.refresh()
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mark-sold-title"
      onClick={(e) => { if (e.target === e.currentTarget && !pending) onClose() }}
      onKeyDown={(e) => { if (e.key === 'Escape' && !pending) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
    >
      <div style={{ background: '#fff', borderRadius: '14px', padding: '22px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
        <h2 id="mark-sold-title" style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BadgeCheck size={20} color="#16a34a" aria-hidden="true" /> Marcar como vendido
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
          <strong style={{ color: '#334155' }}>{title}</strong> deja de aparecer en las búsquedas y se muestra
          como vendido, con su último precio, en &quot;Vendidos recientemente&quot;. Lo podés volver a publicar cuando quieras.
        </p>
        <label htmlFor="mark-sold-date" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
          ¿Cuándo lo vendiste?
        </label>
        <input
          id="mark-sold-date"
          type="date"
          value={date}
          max={today}
          min="2000-01-01"
          autoFocus
          onChange={(e) => setDate(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', minHeight: '44px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
        />
        {error && <p role="alert" style={{ margin: '8px 0 0', fontSize: '13px', color: '#dc2626' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            style={{ flex: 1, minHeight: '44px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={pending || !date}
            style={{ flex: 1, minHeight: '44px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: pending ? 'default' : 'pointer', opacity: pending ? 0.7 : 1 }}
          >
            {pending ? 'Guardando…' : 'Marcar vendido'}
          </button>
        </div>
      </div>
    </div>
  )
}
