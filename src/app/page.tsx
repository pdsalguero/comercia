import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const categories = [
  { name: 'Electrónica',    slug: 'electronics',  icon: '📱', count: 0 },
  { name: 'Vehículos',      slug: 'vehicles',      icon: '🚗', count: 0 },
  { name: 'Inmuebles',      slug: 'real-estate',   icon: '🏠', count: 0 },
  { name: 'Ropa y Calzado', slug: 'clothing',      icon: '👗', count: 0 },
  { name: 'Hogar y Jardín', slug: 'home-garden',   icon: '🛋️', count: 0 },
  { name: 'Deportes',       slug: 'sports',        icon: '⚽', count: 0 },
  { name: 'Herramientas',   slug: 'tools',         icon: '🔧', count: 0 },
  { name: 'Libros',         slug: 'books',         icon: '📚', count: 0 },
  { name: 'Mascotas',       slug: 'pets',          icon: '🐾', count: 0 },
  { name: 'Otros',          slug: 'other',         icon: '📦', count: 0 },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ebebeb' }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0533 0%, #3d1a6e 50%, #2563eb 100%)',
          borderRadius: '8px',
          padding: '40px 48px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', right: '60px', bottom: '-60px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#fff',
              marginBottom: '16px',
            }}>
              ✨ Publicá en 30 segundos con inteligencia artificial
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '12px', maxWidth: '480px' }}>
              Comprá y vendé en <span style={{ color: '#fff159' }}>San Juan</span>
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginBottom: '24px', maxWidth: '400px' }}>
              Subí una foto y la IA genera el título, descripción y precio sugerido automáticamente.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/listings/new">
                <button style={{
                  background: '#fff159',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px 24px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}>
                  📸 Publicar con IA
                </button>
              </Link>
              <Link href="/listings">
                <button style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}>
                  Ver todos los avisos
                </button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }} className="hidden md:flex">
            {[
              { value: '0', label: 'Avisos activos' },
              { value: '0', label: 'Vendedores' },
              { value: '0%', label: 'Publicados con IA' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.12)', padding: '12px 20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#fff159' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#333', marginBottom: '16px' }}>
            Explorar categorías
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {categories.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}>
                <div style={{
                  border: '1px solid #eee',
                  borderRadius: '6px',
                  padding: '14px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                className="hover:border-blue-400 hover:shadow-sm">
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>{cat.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>{cat.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Feature Banner */}
        <div style={{
          background: 'linear-gradient(90deg, #3483fa 0%, #2968c8 100%)',
          borderRadius: '8px',
          padding: '24px 32px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              🤖 La IA trabaja por vos
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
              Sacá una foto → la IA genera título, descripción y precio sugerido en segundos.
            </p>
          </div>
          <Link href="/listings/new">
            <button style={{
              background: '#fff159',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              Probarlo gratis →
            </button>
          </Link>
        </div>

        {/* How it works */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#333', marginBottom: '24px', textAlign: 'center' }}>
            Publicar nunca fue tan fácil
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { step: '1', icon: '📸', title: 'Sacá una foto', desc: 'Fotografiá lo que querés vender con tu celular o cámara.' },
              { step: '2', icon: '🤖', title: 'La IA hace el trabajo', desc: 'Generamos título, descripción y precio sugerido automáticamente en segundos.' },
              { step: '3', icon: '🚀', title: 'Publicado en 30 segundos', desc: 'Revisá, ajustá si querés y publicá. Llegás a miles de compradores en San Juan.' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#e8f0fe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  margin: '0 auto 12px',
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '6px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div style={{ background: '#fff159', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#333', marginBottom: '8px' }}>
            ¿Tenés algo para vender?
          </h2>
          <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px' }}>
            Publicá gratis hoy y llegá a miles de personas en San Juan.
          </p>
          <Link href="/listings/new">
            <button style={{
              background: '#3483fa',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '14px 32px',
              fontWeight: 800,
              fontSize: '16px',
              cursor: 'pointer',
            }}>
              Publicar aviso gratis
            </button>
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}
