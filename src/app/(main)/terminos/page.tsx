import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones | ComerxIA",
  description: "Términos y Condiciones de uso de ComerxIA, el marketplace de clasificados.",
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

export default function TerminosPage() {
  return (
    <div style={S.page}>
      {/* Breadcrumb */}
      <div style={S.breadcrumb}>
        <Link href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Inicio</Link>
        {" › "}
        <span style={{ color: "#475569" }}>Términos y Condiciones</span>
      </div>

      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <h1 style={S.h1}>Términos y Condiciones</h1>
          <p style={{ ...S.meta, margin: 0 }}>
            ComerxIA · Última actualización: 28 de Marzo de 2026
          </p>
        </div>

        <div style={S.body}>

          {/* 1 */}
          <h2 style={S.h2}>1. Información del Prestador de Servicios</h2>
          <p style={S.p}>
            <strong>ComerxIA</strong> es un marketplace digital que facilita la publicación y búsqueda de clasificados en Argentina (<strong>"Plataforma"</strong> o <strong>"Sitio"</strong>).
          </p>
          <table style={S.table}>
            <tbody>
              <tr><td style={{ ...S.td, fontWeight: 700, width: "160px" }}>Sitio Web</td><td style={S.td}>https://comerxia.com.ar</td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Email de Contacto</td><td style={S.td}>contacto@comerxia.com.ar</td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Jurisdicción</td><td style={S.td}>Argentina (Provincia de San Juan)</td></tr>
            </tbody>
          </table>

          {/* 2 */}
          <h2 style={S.h2}>2. Objeto y Ámbito de Aplicación</h2>
          <p style={S.p}>
            Estos Términos y Condiciones (<strong>"T&C"</strong>) regulan el acceso y uso de la Plataforma ComerxIA, así como la publicación de anuncios clasificados, servicios de destacados, y todas las operaciones realizadas a través del sitio.
          </p>
          <div style={S.highlight}>
            Al acceder y utilizar ComerxIA, aceptás sin reservas estos T&C en su totalidad.
          </div>
          <h3 style={S.h3}>2.1 Servicios Ofrecidos</h3>
          <ul style={S.ul}>
            <li>Publicación gratuita de anuncios clasificados</li>
            <li>Sistema de destacados y promoción pagada de anuncios</li>
            <li>Sistema de mensajería entre usuarios</li>
            <li>Búsqueda y filtrado de anuncios</li>
            <li>Tiendas virtuales para vendedores</li>
          </ul>

          {/* 3 */}
          <h2 style={S.h2}>3. Elegibilidad y Registro de Usuarios</h2>
          <h3 style={S.h3}>3.1 Requisitos</h3>
          <p style={S.p}>Para usar ComerxIA, debés:</p>
          <ul style={S.ul}>
            <li>Ser mayor de 18 años</li>
            <li>Tener capacidad legal para contratar</li>
            <li>Proporcionar información veraz, exacta y completa</li>
            <li>Mantener tus datos actualizados</li>
          </ul>
          <h3 style={S.h3}>3.2 Cuenta de Usuario</h3>
          <ul style={S.ul}>
            <li>Sos responsable de mantener la confidencialidad de tu contraseña</li>
            <li>Sos responsable de todas las actividades bajo tu cuenta</li>
            <li><strong>No podés</strong> transferir, vender ni ceder tu cuenta a terceros</li>
            <li>Si detectás acceso no autorizado, notificá inmediatamente a <a href="mailto:contacto@comerxia.com.ar" style={{ color: "#f97316" }}>contacto@comerxia.com.ar</a></li>
          </ul>
          <h3 style={S.h3}>3.3 Suspensión de Cuenta</h3>
          <p style={S.p}>
            ComerxIA se reserva el derecho de suspender o eliminar cuentas que incumplan estos T&C, publiquen contenido prohibido, realicen actividades fraudulentas o generen reportes reiterados de otros usuarios.
          </p>

          {/* 4 */}
          <h2 style={S.h2}>4. Publicación de Anuncios</h2>
          <h3 style={S.h3}>4.1 Contenido Permitido</h3>
          <ul style={S.ul}>
            <li>Vehículos (autos, motos, camiones, etc.)</li>
            <li>Inmuebles (casas, departamentos, terrenos)</li>
            <li>Tecnología y electrodomésticos</li>
            <li>Ropa y accesorios</li>
            <li>Otros bienes tangibles</li>
          </ul>
          <h3 style={S.h3}>4.2 Contenido Prohibido</h3>
          <p style={S.p}><strong>NO está permitido publicar:</strong></p>
          <ul style={S.ul}>
            <li>Drogas o sustancias controladas</li>
            <li>Armas, explosivos o similares</li>
            <li>Documentos falsificados</li>
            <li>Contenido sexual explícito</li>
            <li>Servicios ilegales</li>
            <li>Estafas o esquemas piramidales</li>
            <li>Contenido que infrinja derechos de terceros</li>
            <li>Reproducción no autorizada de fotos o descripciones de otros sitios</li>
          </ul>
          <h3 style={S.h3}>4.3 Responsabilidad por Contenido</h3>
          <p style={S.p}>
            <strong>Vos sos el único responsable</strong> del contenido que publicás. ComerxIA no verifica la veracidad de los anuncios y no es responsable por fraude, estafas, productos dañados o incumplimiento de acuerdos entre usuarios.
          </p>
          <h3 style={S.h3}>4.4 Duración de Anuncios</h3>
          <ul style={S.ul}>
            <li>Anuncios gratuitos: <strong>30 días</strong> (renovables)</li>
            <li>Anuncios destacados: según el plan contratado (7, 15 o 30 días)</li>
            <li>ComerxIA puede eliminar anuncios inactivos de más de 90 días sin previo aviso</li>
          </ul>

          {/* 5 */}
          <h2 style={S.h2}>5. Sistema de Destacados y Pagos</h2>
          <h3 style={S.h3}>5.1 Planes de Destacado</h3>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Plan</th>
                <th style={S.th}>7 días</th>
                <th style={S.th}>15 días</th>
                <th style={S.th}>30 días</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...S.td, fontWeight: 700 }}>Esencial</td>
                <td style={S.td}>$699 ARS</td>
                <td style={S.td}>$1.299 ARS</td>
                <td style={S.td}>$2.499 ARS</td>
              </tr>
              <tr>
                <td style={{ ...S.td, fontWeight: 700 }}>Destacado</td>
                <td style={S.td}>$1.299 ARS</td>
                <td style={S.td}>$2.299 ARS</td>
                <td style={S.td}>$4.199 ARS</td>
              </tr>
              <tr>
                <td style={{ ...S.td, fontWeight: 700 }}>Premium</td>
                <td style={S.td}>$1.799 ARS</td>
                <td style={S.td}>$3.299 ARS</td>
                <td style={S.td}>$6.999 ARS</td>
              </tr>
            </tbody>
          </table>
          <p style={{ ...S.p, fontSize: "12px", color: "#94a3b8" }}>* Los precios pueden cambiar sin previo aviso.</p>
          <h3 style={S.h3}>5.2 Procesamiento de Pagos</h3>
          <ul style={S.ul}>
            <li>Los pagos se procesan a través de <strong>MercadoPago</strong></li>
            <li>ComerxIA <strong>no almacena datos bancarios</strong></li>
            <li>Al pagar, aceptás los T&C de MercadoPago</li>
            <li>El pago es <strong>NO REEMBOLSABLE</strong> una vez confirmado</li>
          </ul>
          <h3 style={S.h3}>5.3 Confirmación de Pago</h3>
          <p style={S.p}>
            Una vez confirmado el pago, el anuncio se destaca <strong>dentro de 5 minutos</strong>. El período de destacado comienza cuando el pago se aprueba.
          </p>

          {/* 6 */}
          <h2 style={S.h2}>6. Sistema de Mensajería</h2>
          <h3 style={S.h3}>6.1 Uso Permitido</h3>
          <p style={S.p}>Solo para comunicación sobre anuncios: consultas, coordinación de entregas y transacciones.</p>
          <h3 style={S.h3}>6.2 Prohibiciones</h3>
          <ul style={S.ul}>
            <li>Spam o mensajes masivos</li>
            <li>Contenido ofensivo o sexual</li>
            <li>Solicitar datos bancarios o personales por este medio</li>
            <li>Links sospechosos a sitios externos</li>
          </ul>
          <h3 style={S.h3}>6.3 Privacidad de Mensajes</h3>
          <p style={S.p}>
            ComerxIA puede monitorear y archivar mensajes ante una denuncia formal. No vende ni comparte datos de conversaciones.
          </p>

          {/* 7 */}
          <h2 style={S.h2}>7. Tiendas Virtuales</h2>
          <p style={S.p}>
            Crear una tienda virtual es <strong>GRATIS</strong>. Podés personalizar tu tienda con logo, descripción y publicar artículos. ComerxIA puede suspender tiendas que violen estos T&C o tengan múltiples reportes de fraude.
          </p>

          {/* 8 */}
          <h2 style={S.h2}>8. Reportes y Denuncias</h2>
          <p style={S.p}>
            Si encontrás contenido inapropiado, usá el botón <strong>"Reportar"</strong> en el anuncio. ComerxIA revisará el reporte en <strong>48 horas</strong>. Los reportes falsos o abusivos pueden resultar en suspensión de cuenta.
          </p>

          {/* 9 */}
          <h2 style={S.h2}>9. Limitaciones de Responsabilidad</h2>
          <p style={S.p}>
            La Plataforma ComerxIA se proporciona <strong>"tal como está"</strong>, sin garantías de disponibilidad 24/7 o ausencia de errores.
          </p>
          <p style={S.p}><strong>ComerxIA NO es responsable por:</strong></p>
          <ul style={S.ul}>
            <li>Pérdida de datos o información</li>
            <li>Daños causados por malware o ataques cibernéticos</li>
            <li>Interrupción del servicio</li>
            <li>Errores de terceros (MercadoPago, proveedores de hosting, etc.)</li>
            <li>Transacciones fraudulentas entre usuarios</li>
            <li>Productos no entregados o dañados</li>
            <li>Disputas entre vendedor y comprador</li>
          </ul>
          <h3 style={S.h3}>9.1 Indemnización</h3>
          <p style={S.p}>
            Al usar ComerxIA, aceptás indemnizar a ComerxIA y sus operadores por demandas de terceros originadas en tu contenido, incumplimiento de estos T&C, o violación de derechos de terceros.
          </p>

          {/* 10 */}
          <h2 style={S.h2}>10. Modificación de Términos</h2>
          <p style={S.p}>
            ComerxIA puede modificar estos T&C en cualquier momento. Te notificaremos por email de cambios importantes. La continuación del uso del sitio implica la aceptación tácita de los nuevos términos. La versión actual siempre estará disponible en esta página.
          </p>

          {/* 11 */}
          <h2 style={S.h2}>11. Terminación de Servicio</h2>
          <p style={S.p}>
            ComerxIA puede dar de baja el servicio por violación de estos T&C, inactividad mayor a 1 año, o razones técnicas/legales, con <strong>30 días de aviso</strong> (excepto en casos de fraude grave). Los saldos pendientes no se reembolsan.
          </p>

          {/* 12 */}
          <h2 style={S.h2}>12. Privacidad de Menores</h2>
          <div style={S.highlight}>
            ComerxIA es SOLO para mayores de 18 años. Si detectamos una cuenta de un menor, la eliminaremos inmediatamente.
          </div>

          {/* 13 */}
          <h2 style={S.h2}>13. Jurisdicción y Ley Aplicable</h2>
          <p style={S.p}>
            Estos T&C se rigen por las <strong>leyes de la República Argentina</strong>, con jurisdicción en los <strong>Tribunales Nacionales de la República Argentina</strong>. Son aplicables la LOPSRCCI, el Código Civil y Comercial Argentino y las Leyes de Defensa del Consumidor.
          </p>

          {/* 14 */}
          <h2 style={S.h2}>14. Contacto y Soporte</h2>
          <table style={S.table}>
            <tbody>
              <tr><td style={{ ...S.td, fontWeight: 700, width: "140px" }}>Email</td><td style={S.td}><a href="mailto:contacto@comerxia.com.ar" style={{ color: "#f97316" }}>contacto@comerxia.com.ar</a></td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Horario</td><td style={S.td}>Lunes a viernes, 9 AM – 6 PM (Hora Argentina)</td></tr>
              <tr><td style={{ ...S.td, fontWeight: 700 }}>Respuesta</td><td style={S.td}>Máximo 48 horas hábiles</td></tr>
            </tbody>
          </table>

          {/* 15 */}
          <h2 style={S.h2}>15. Disposiciones Finales</h2>
          <p style={S.p}>
            Si alguna parte de estos T&C es inválida, el resto permanece vigente. Estos T&C constituyen el acuerdo completo entre vos y ComerxIA y prevalecen sobre cualquier comunicación anterior. El uso del sitio no genera relación de empleo, sociedad ni agencia entre el usuario y ComerxIA.
          </p>

          {/* Footer */}
          <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
            <p style={{ margin: "0 0 8px" }}>Vigente desde el 28 de Marzo de 2026 · <Link href="/privacidad" style={{ color: "#f97316" }}>Política de Privacidad</Link></p>
            <p style={{ margin: 0 }}>Al registrarte y usar ComerxIA confirmás haber leído, entendido y aceptado estos Términos y Condiciones.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
