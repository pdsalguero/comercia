export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ebebeb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Logo */}
      <a href="/" style={{ marginBottom: '24px', textDecoration: 'none' }}>
        <span style={{ fontSize: '28px', fontWeight: 900, color: '#333' }}>
          comerc<span style={{ color: '#3483fa' }}>IA</span>
        </span>
      </a>

      {children}

      <p style={{ marginTop: '24px', fontSize: '12px', color: '#999', textAlign: 'center', maxWidth: '360px' }}>
        Al continuar, aceptás nuestros{' '}
        <a href="#" style={{ color: '#3483fa' }}>Términos y condiciones</a>
        {' '}y nuestra{' '}
        <a href="#" style={{ color: '#3483fa' }}>Política de privacidad</a>.
      </p>
    </div>
  )
}
