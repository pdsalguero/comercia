'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Refresca los datos del servidor cada 5 minutos via router.refresh()
export function DashboardRefresher() {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [router])

  return null
}
