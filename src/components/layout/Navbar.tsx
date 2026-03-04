'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Main bar — yellow */}
      <div style={{ background: '#fff159', borderBottom: '1px solid #e8d100' }}
           className="px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#333' }}>
              comerc<span style={{ color: '#3483fa' }}>IA</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 flex max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar en San Juan..."
              style={{
                flex: 1,
                border: '1px solid #999',
                borderRight: 'none',
                borderRadius: '2px 0 0 2px',
                padding: '8px 12px',
                fontSize: '14px',
                outline: 'none',
                background: '#fff',
              }}
            />
            <button style={{
              background: '#3483fa',
              border: 'none',
              borderRadius: '0 2px 2px 0',
              padding: '0 16px',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '16px',
            }}>
              🔍
            </button>
          </div>

          {/* Actions — desktop */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <Link href="/login"
              style={{ fontSize: '14px', color: '#333', fontWeight: 600 }}
              className="hover:underline">
              Ingresar
            </Link>
            <Link href="/register"
              style={{ fontSize: '14px', color: '#333' }}
              className="hover:underline">
              Crear cuenta
            </Link>
            <Link href="/listings/new">
              <button style={{
                background: '#3483fa',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 18px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                + Publicar aviso
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Category nav — blue */}
      <div style={{ background: '#3483fa' }} className="hidden md:block">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 py-1.5 overflow-x-auto">
          {[
            { name: 'Electrónica', slug: 'electronics' },
            { name: 'Vehículos', slug: 'vehicles' },
            { name: 'Inmuebles', slug: 'real-estate' },
            { name: 'Ropa', slug: 'clothing' },
            { name: 'Hogar', slug: 'home-garden' },
            { name: 'Deportes', slug: 'sports' },
            { name: 'Herramientas', slug: 'tools' },
            { name: 'Libros', slug: 'books' },
            { name: 'Mascotas', slug: 'pets' },
            { name: 'Otros', slug: 'other' },
          ].map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              style={{ color: '#fff', fontSize: '13px', whiteSpace: 'nowrap', opacity: 0.9 }}
              className="hover:opacity-100 hover:underline"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: '#fff159', borderTop: '1px solid #e8d100' }}
             className="md:hidden px-4 py-3 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Buscar en San Juan..."
            style={{ width: '100%', border: '1px solid #999', borderRadius: '4px', padding: '8px 12px', fontSize: '14px' }}
          />
          <Link href="/listings/new" onClick={() => setMenuOpen(false)}>
            <button style={{ width: '100%', background: '#3483fa', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              + Publicar aviso
            </button>
          </Link>
          <div className="flex gap-4">
            <Link href="/login" style={{ fontSize: '14px', color: '#333', fontWeight: 600 }}>Ingresar</Link>
            <Link href="/register" style={{ fontSize: '14px', color: '#333' }}>Crear cuenta</Link>
          </div>
        </div>
      )}
    </header>
  )
}
