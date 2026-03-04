import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #ddd', marginTop: '32px' }}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          <div>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#333' }}>
              comerc<span style={{ color: '#3483fa' }}>IA</span>
            </span>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px', lineHeight: 1.6 }}>
              El marketplace inteligente de San Juan. Publicá en 30 segundos con IA.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '12px' }}>Categorías</h3>
            {['Electrónica','Vehículos','Inmuebles','Ropa','Hogar','Deportes'].map(c => (
              <div key={c} style={{ marginBottom: '6px' }}>
                <Link href={`/category/${c.toLowerCase()}`}
                  style={{ fontSize: '13px', color: '#3483fa' }}
                  className="hover:underline">
                  {c}
                </Link>
              </div>
            ))}
          </div>

          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '12px' }}>Plataforma</h3>
            {[
              { label: 'Publicar aviso', href: '/listings/new' },
              { label: 'Registrarse', href: '/register' },
              { label: 'Ingresar', href: '/login' },
              { label: 'Planes Pro', href: '/upgrade' },
            ].map(l => (
              <div key={l.href} style={{ marginBottom: '6px' }}>
                <Link href={l.href}
                  style={{ fontSize: '13px', color: '#3483fa' }}
                  className="hover:underline">
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '12px' }}>Contacto</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>San Juan, Argentina 🇦🇷</p>
            <a href="mailto:hola@comercia.com.ar"
               style={{ fontSize: '13px', color: '#3483fa' }}
               className="hover:underline block mb-1">
              hola@comercia.com.ar
            </a>
            <a href="https://instagram.com/comercia.ar"
               target="_blank"
               rel="noopener noreferrer"
               style={{ fontSize: '13px', color: '#3483fa' }}
               className="hover:underline block">
              @comercia.ar
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #eee', marginTop: '32px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#999' }}>
            © {new Date().getFullYear()} comercIA. Todos los derechos reservados.
          </span>
          <span style={{ fontSize: '12px', color: '#999' }}>Hecho con IA en San Juan 🇦🇷</span>
        </div>
      </div>
    </footer>
  )
}
