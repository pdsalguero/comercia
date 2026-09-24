import { NextResponse } from 'next/server'

// Esta ruta dejaba que el dueño pusiera featured_level (Premium, Destacado…) en su aviso sin pagar.
// Destacar pasa por /upgrade (Mercado Pago o crédito gratis). Queda respondiendo 410 hasta borrarla.
export async function PATCH() {
  return NextResponse.json({ error: 'Esta acción ya no está disponible. Destacá tu aviso desde /upgrade.' }, { status: 410 })
}
