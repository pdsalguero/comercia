export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-60px',
        width: '260px', height: '260px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,131,250,0.20) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo + tagline */}
      <a href="/" style={{ marginBottom: '28px', textDecoration: 'none', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
          comerx<span style={{
            color: '#60a5fa',
            textShadow: '0 0 20px rgba(96,165,250,0.6)',
          }}>IA</span>
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '5px', fontWeight: 500, letterSpacing: '0.5px' }}>
          El marketplace inteligente. Todo con el poder de la IA.
        </div>
      </a>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        {children}
      </div>

      {/* Footer legal */}
      <p style={{ marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', maxWidth: '360px', position: 'relative', zIndex: 1 }}>
        Al continuar, aceptás nuestros{' '}
        <a href="/terminos" style={{ color: 'rgba(255,255,255,0.55)' }}>Términos y condiciones</a>
        {' '}y nuestra{' '}
        <a href="/privacidad" style={{ color: 'rgba(255,255,255,0.55)' }}>Política de privacidad</a>.
      </p>
    </div>
  )
}
