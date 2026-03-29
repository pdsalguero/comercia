import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad | ComerxIA",
  description: "Política de Privacidad de ComerxIA. Conocé cómo recopilamos, usamos y protegemos tus datos.",
};

const S = {
  page: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "32px 16px 80px",
  } as React.CSSProperties,
  breadcrumb: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "28px",
  } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
    overflow: "hidden",
  } as React.CSSProperties,
  header: {
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    padding: "36px 40px",
  } as React.CSSProperties,
  body: {
    padding: "36px 40px",
  } as React.CSSProperties,
  h1: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#fff",
    margin: "0 0 8px",
  } as React.CSSProperties,
  meta: {
    fontSize: "13px",
    color: "#94a3b8",
  } as React.CSSProperties,
  h2: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#0f172a",
    margin: "36px 0 12px",
    paddingBottom: "8px",
    borderBottom: "2px solid #f1f5f9",
  } as React.CSSProperties,
  h3: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#374151",
    margin: "20px 0 8px",
  } as React.CSSProperties,
  p: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: 1.75,
    margin: "0 0 12px",
  } as React.CSSProperties,
  ul: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: 1.75,
    margin: "0 0 12px",
    paddingLeft: "20px",
  } as React.CSSProperties,
  highlight: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "14px 18px",
    fontSize: "13px",
    color: "#1e40af",
    margin: "16px 0",
  } as React.CSSProperties,
  warning: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "10px",
    padding: "14px 18px",
    fontSize: "13px",
    color: "#9a3412",
    margin: "16px 0",
  } as React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "13px",
    margin: "12px 0",
  } as React.CSSProperties,
  th: {
    background: "#f8fafc",
    padding: "10px 14px",
    textAlign: "left" as const,
    fontWeight: 700,
    color: "#374151",
    border: "1px solid #e2e8f0",
  } as React.CSSProperties,
  td: {
    padding: "10px 14px",
    color: "#475569",
    border: "1px solid #e2e8f0",
    verticalAlign: "top" as const,
  } as React.CSSProperties,
};

export default function PrivacidadPage() {
  return (
    <div style={S.page}>
      {/* Breadcrumb */}
      <div style={S.breadcrumb}>
        <Link href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Inicio</Link>
        {" › "}
        <span style={{ color: "#475569" }}>Política de Privacidad</span>
      </div>

      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <h1 style={S.h1}>Política de Privacidad</h1>
          <p style={{ ...S.meta, margin: 0 }}>
            ComerxIA · Última actualización: 28 de Marzo de 2026
          </p>
        </div>

        <div style={S.body}>

          {/* Intro */}
          <div style={S.highlight}>
            ComerxIA valora tu privacidad. Esta Política explica qué datos recopilamos, cómo los usamos, cómo los protegemos y cuáles son tus derechos. Al usar ComerxIA, aceptás esta Política en su totalidad.
          </div>

          {/* 1 */}
          <h2 style={S.h2}>1. Información del Responsable</h2>
          <table style={S.table}>
            <tbody>
              <tr><td style={{ ...S.td, fontWeight: 700, width: "180px" }}>Sitio Web</td><td style={S.td}>https://comerxia.com.ar</td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Email de Privacidad</td><td style={S.td}><a href="mailto:privacidad@comerxia.com.ar" style={{ color: "#f97316" }}>privacidad@comerxia.com.ar</a></td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Jurisdicción</td><td style={S.td}>Argentina (Provincia de San Juan)</td></tr>
            </tbody>
          </table>

          {/* 2 */}
          <h2 style={S.h2}>2. Datos que Recopilamos</h2>

          <h3 style={S.h3}>2.1 Datos que Proporcionás Voluntariamente</h3>
          <p style={S.p}><strong>Registro:</strong> nombre completo, email, teléfono, contraseña (hasheada — no la almacenamos), provincia/localidad.</p>
          <p style={S.p}><strong>Publicación de Anuncios:</strong> descripción, fotos, precio, ubicación, categoría.</p>
          <p style={S.p}><strong>Tienda Virtual:</strong> nombre de tienda, logo/banner, descripción comercial.</p>
          <p style={S.p}><strong>Mensajería:</strong> contenido de mensajes y archivos compartidos entre usuarios.</p>
          <p style={S.p}><strong>Pagos (Destacados):</strong> al pagar a través de MercadoPago, los datos bancarios van directamente a MercadoPago — nosotros solo guardamos fecha de pago, monto y método (ej: "Mercado Pago").</p>

          <h3 style={S.h3}>2.2 Datos Recopilados Automáticamente</h3>
          <p style={S.p}>Cuando navegás ComerxIA, recopilamos automáticamente:</p>
          <ul style={S.ul}>
            <li><strong>Tipo de dispositivo:</strong> móvil, tablet o escritorio (detectado desde el User-Agent)</li>
            <li><strong>Navegador:</strong> Chrome, Firefox, Safari, Edge, u otro</li>
            <li><strong>Dirección IP (anonimizada):</strong> la convertimos en un hash irreversible mediante SHA-256; <strong>no almacenamos la IP real</strong></li>
            <li><strong>País:</strong> detectado a través de cabeceras de red (sin GPS ni geolocalización precisa)</li>
            <li><strong>Idioma:</strong> tu idioma preferido según configuración del navegador</li>
            <li><strong>Referente:</strong> la URL desde la que llegaste al sitio (si aplica)</li>
            <li><strong>Páginas visitadas y anuncios clickeados</strong></li>
          </ul>
          <p style={S.p}><strong>Cookies:</strong> usamos cookies de sesión para mantener tu login y preferencias de usuario.</p>

          <h3 style={S.h3}>2.3 Datos de Terceros</h3>
          <ul style={S.ul}>
            <li><strong>MercadoPago:</strong> confirmación de pago y estado de transacción</li>
            <li><strong>Reportes:</strong> cuando otros usuarios te reportan</li>
          </ul>

          {/* 3 */}
          <h2 style={S.h2}>3. Uso de Datos</h2>
          <h3 style={S.h3}>3.1 Usos Legítimos</h3>
          <ul style={S.ul}>
            <li>Crear y mantener tu cuenta</li>
            <li>Procesar pagos y enviar confirmaciones</li>
            <li>Mostrar anuncios publicados</li>
            <li>Responder consultas de soporte</li>
            <li>Enviar alertas de fraude o seguridad</li>
            <li>Notificar cambios en los Términos y Condiciones</li>
            <li>Analizar uso del sitio para mejorar la experiencia</li>
            <li>Identificar bugs y mejorar el diseño</li>
            <li>Cumplir obligaciones legales</li>
          </ul>
          <h3 style={S.h3}>3.2 Usos NO Permitidos</h3>
          <p style={S.p}><strong>NUNCA usamos tus datos para:</strong></p>
          <ul style={S.ul}>
            <li>Vender datos a terceros (publicitarios, brokers, etc.)</li>
            <li>Compartir con competidores</li>
            <li>Marketing sin consentimiento</li>
            <li>Crear perfiles de discriminación</li>
            <li>Vigilancia de ubicación</li>
          </ul>

          {/* 4 */}
          <h2 style={S.h2}>4. Compartir Datos con Terceros</h2>
          <h3 style={S.h3}>4.1 Compartimos Con</h3>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Proveedor</th>
                <th style={S.th}>Propósito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...S.td, fontWeight: 700 }}>MercadoPago</td>
                <td style={S.td}>Procesamiento de pagos de destacados. Sujeto a su propia política de privacidad.</td>
              </tr>
              <tr>
                <td style={{ ...S.td, fontWeight: 700 }}>Supabase</td>
                <td style={S.td}>Almacenamiento de base de datos (bajo acuerdo de confidencialidad).</td>
              </tr>
              <tr>
                <td style={{ ...S.td, fontWeight: 700 }}>Railway</td>
                <td style={S.td}>Hosting del servidor y despliegue de la aplicación.</td>
              </tr>
            </tbody>
          </table>
          <h3 style={S.h3}>4.2 Órdenes Judiciales</h3>
          <p style={S.p}>
            Si recibimos una orden judicial, te notificaremos (excepto si la ley lo prohíbe), compartiremos solo lo específicamente solicitado y mantendremos registro de la solicitud.
          </p>

          {/* 5 */}
          <h2 style={S.h2}>5. Seguridad de Datos</h2>
          <ul style={S.ul}>
            <li>HTTPS/SSL en todo el sitio</li>
            <li>Contraseñas hasheadas (no reversibles)</li>
            <li>Direcciones IP procesadas como hash irreversible SHA-256</li>
            <li>Datos almacenados en Supabase con encriptación</li>
            <li>Backups automáticos diarios</li>
            <li>Acceso restringido a datos (solo personal autorizado)</li>
          </ul>
          <div style={S.warning}>
            ComerxIA NO es responsable por hacks o ataques cibernéticos, malware en tu dispositivo, ni acceso no autorizado a tu cuenta por pérdida de contraseña. Usá contraseña fuerte y no la compartas.
          </div>

          {/* 6 */}
          <h2 style={S.h2}>6. Retención de Datos</h2>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Dato</th>
                <th style={S.th}>Tiempo</th>
                <th style={S.th}>Razón</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={S.td}>Perfil de usuario</td><td style={S.td}>Mientras está activo</td><td style={S.td}>Funcionamiento</td></tr>
              <tr><td style={S.td}>Anuncios publicados</td><td style={S.td}>90 días post-expiración</td><td style={S.td}>Historial</td></tr>
              <tr><td style={S.td}>Mensajes</td><td style={S.td}>1 año</td><td style={S.td}>Historial de transacciones</td></tr>
              <tr><td style={S.td}>Pagos</td><td style={S.td}>5 años</td><td style={S.td}>Obligación fiscal/legal</td></tr>
              <tr><td style={S.td}>Logs de visitas</td><td style={S.td}>6 meses</td><td style={S.td}>Seguridad y mejora del sitio</td></tr>
              <tr><td style={S.td}>Cookies de sesión</td><td style={S.td}>Según configuración del navegador</td><td style={S.td}>Sesión de usuario</td></tr>
            </tbody>
          </table>
          <p style={S.p}>
            Al eliminar tu cuenta, los anuncios se ocultan inmediatamente, los datos se anonimizan en 30 días, y la información de pagos se conserva 5 años por ley.
          </p>

          {/* 7 */}
          <h2 style={S.h2}>7. Cookies y Tracking</h2>
          <h3 style={S.h3}>7.1 Cookies Usadas</h3>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Cookie</th>
                <th style={S.th}>Tipo</th>
                <th style={S.th}>Propósito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={S.td}><code>session_id</code></td>
                <td style={S.td}>Esencial</td>
                <td style={S.td}>Mantener tu sesión activa</td>
              </tr>
              <tr>
                <td style={S.td}><code>csrf_token</code></td>
                <td style={S.td}>Esencial</td>
                <td style={S.td}>Protección de seguridad</td>
              </tr>
            </tbody>
          </table>
          <p style={S.p}>No usamos cookies de publicidad ni de seguimiento de terceros. El análisis de visitas se realiza con nuestro propio sistema, sin compartir datos con plataformas externas.</p>
          <h3 style={S.h3}>7.2 Gestionar Cookies</h3>
          <p style={S.p}>
            Podés deshabilitar cookies en la configuración de tu navegador (Chrome, Firefox, Safari). Ten en cuenta que deshabilitar cookies esenciales puede afectar el funcionamiento del sitio.
          </p>

          {/* 8 */}
          <h2 style={S.h2}>8. Tus Derechos (LOPSRCCI)</h2>
          <p style={S.p}>Bajo la Ley de Protección de Datos Personales Argentina, tenés derecho a:</p>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Derecho</th>
                <th style={S.th}>Descripción</th>
                <th style={S.th}>Plazo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Acceso</td><td style={S.td}>Solicitar copia de los datos que tenemos sobre vos</td><td style={S.td}>10 días hábiles</td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Rectificación</td><td style={S.td}>Corregir datos inexactos</td><td style={S.td}>5 días hábiles</td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Supresión</td><td style={S.td}>Solicitar que borremos tus datos (salvo obligación legal)</td><td style={S.td}>10 días hábiles</td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Oposición</td><td style={S.td}>Oponerte al uso de datos para ciertos fines</td><td style={S.td}>5 días hábiles</td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Portabilidad</td><td style={S.td}>Recibir tus datos en formato portable (JSON/CSV)</td><td style={S.td}>10 días hábiles</td></tr>
            </tbody>
          </table>
          <h3 style={S.h3}>Cómo Ejercer tus Derechos</h3>
          <p style={S.p}>
            Enviá tu solicitud a <a href="mailto:privacidad@comerxia.com.ar" style={{ color: "#f97316" }}>privacidad@comerxia.com.ar</a> incluyendo: nombre completo, email registrado, tipo de solicitud y descripción.
          </p>

          {/* 9 */}
          <h2 style={S.h2}>9. Privacidad de Menores</h2>
          <div style={S.warning}>
            ComerxIA es SOLO para mayores de 18 años. Si detectamos una cuenta de un menor, la eliminamos inmediatamente sin compartir datos con terceros.
          </div>

          {/* 10 */}
          <h2 style={S.h2}>10. Publicidad y Marketing</h2>
          <p style={S.p}>
            Por defecto <strong>no recibís</strong> emails de promociones ni newsletters. Para activarlos, debés marcar la casilla en configuración. Podés desuscribirte en cualquier momento desde cualquier email de marketing.
          </p>
          <p style={S.p}>ComerxIA <strong>no usa publicidad dirigida de terceros</strong> ni comparte datos de navegación con plataformas publicitarias.</p>

          {/* 11 */}
          <h2 style={S.h2}>11. Transferencia Internacional de Datos</h2>
          <p style={S.p}>
            Los datos se almacenan en servidores de Supabase y Railway (Argentina/USA). Todos los proveedores cuentan con protecciones equivalentes a la legislación argentina y acuerdos de confidencialidad. Se transfiere solo lo mínimo necesario.
          </p>

          {/* 12 */}
          <h2 style={S.h2}>12. Cambios en la Política</h2>
          <p style={S.p}>
            Podemos actualizar esta Política en cualquier momento. Te notificaremos por email de cambios importantes. La continuación del uso del sitio implica aceptación. La versión actual siempre estará disponible en esta página.
          </p>

          {/* 13 */}
          <h2 style={S.h2}>13. Contacto y Reclamos</h2>
          <table style={S.table}>
            <tbody>
              <tr><td style={{ ...S.td, fontWeight: 700, width: "160px" }}>Email de privacidad</td><td style={S.td}><a href="mailto:privacidad@comerxia.com.ar" style={{ color: "#f97316" }}>privacidad@comerxia.com.ar</a></td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Tiempo de respuesta</td><td style={S.td}>Máximo 48 horas</td></tr>
            </tbody>
          </table>
          <p style={S.p}>
            Si considerás que ComerxIA viola tu privacidad y no resolvemos en 30 días, podés denunciar ante los <strong>Juzgados Civiles de Argentina</strong> o la <strong>Defensoría del Consumidor</strong>.
          </p>

          {/* Footer */}
          <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
            <p style={{ margin: "0 0 8px" }}>Vigente desde el 28 de Marzo de 2026 · <Link href="/terminos" style={{ color: "#f97316" }}>Términos y Condiciones</Link></p>
            <p style={{ margin: 0 }}>Al usar ComerxIA aceptás la recopilación y uso de datos conforme a esta Política.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
