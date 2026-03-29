const BASE_STYLES = `
  body { margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  table { border-spacing: 0; }
  td { padding: 0; }
  img { border: 0; }
  .wrapper { width: 100%; background: #f1f5f9; padding: 32px 16px; box-sizing: border-box; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1E5BA8 0%, #0f172a 100%); padding: 32px 40px; text-align: center; }
  .logo { font-size: 22px; font-weight: 900; color: #FF8C00; letter-spacing: 0.04em; }
  .logo span { color: #fff; }
  .content { padding: 40px; }
  .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
  .text { font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 16px; }
  .btn-wrap { text-align: center; margin: 32px 0; }
  .btn { display: inline-block; background: #FF8C00; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
  .card-title { font-size: 13px; font-weight: 700; color: #1E5BA8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; }
  .tip { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 14px; color: #374151; line-height: 1.5; }
  .footer { background: #0f172a; padding: 24px 40px; text-align: center; }
  .footer p { font-size: 12px; color: #475569; margin: 4px 0; }
  .footer a { color: #64748b; text-decoration: none; }
  @media (max-width: 600px) {
    .content { padding: 24px 20px !important; }
    .header { padding: 24px 20px !important; }
    .footer { padding: 20px !important; }
  }
`;

function shell(headerContent: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">Comerx<span>IA</span></div>
        ${headerContent}
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ComerxIA · San Juan, Argentina</p>
        <p><a href="https://comerxia.com.ar">comerxia.com.ar</a> · <a href="https://comerxia.com.ar/privacidad">Privacidad</a> · <a href="https://comerxia.com.ar/terminos">Términos</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Template 1: Publicación en vivo ───────────────────────────────────────────

interface ListingPublishedParams {
  userName: string;
  listingTitle: string;
  listingUrl: string;
}

export function listingPublishedTemplate({ userName, listingTitle, listingUrl }: ListingPublishedParams): {
  subject: string;
  html: string;
} {
  const html = shell(
    `<p style="color:#94a3b8; font-size:13px; margin:8px 0 0;">Tu aviso ya está en vivo</p>`,
    `
    <h1 class="title">🎉 ¡Tu publicación está en vivo!</h1>
    <p class="text">Hola <strong>${userName}</strong>, tu aviso fue publicado exitosamente en ComerxIA y ya es visible para miles de compradores.</p>

    <div class="card">
      <div class="card-title">📋 Tu publicación</div>
      <p style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">${listingTitle}</p>
    </div>

    <div class="btn-wrap">
      <a href="${listingUrl}" class="btn">Ver tu publicación →</a>
    </div>

    <div class="card">
      <div class="card-title">💡 Consejos para vender más rápido</div>
      <div class="tip"><span>📸</span><span>Agregá más fotos desde distintos ángulos — los avisos con +5 fotos reciben 3× más consultas.</span></div>
      <div class="tip"><span>✏️</span><span>Describí el estado, marca y modelo con detalle. Cuanta más info, más confianza genera.</span></div>
      <div class="tip"><span>💬</span><span>Respondé las consultas rápido — los compradores contactan al primero que responde.</span></div>
      <div class="tip"><span>⭐</span><span>Destacá tu aviso para aparecer primero en los resultados y recibir 5× más visitas.</span></div>
    </div>

    <p class="text" style="font-size:13px; color:#94a3b8;">Si necesitás editar o pausar tu aviso, podés hacerlo desde <a href="https://comerxia.com.ar/dashboard/my-listings" style="color:#1E5BA8;">Mis avisos</a>.</p>
    `
  );

  return { subject: "🎉 Tu publicación está en vivo — ComerxIA", html };
}

// ── Template 2: Bienvenida ────────────────────────────────────────────────────

export function welcomeEmailTemplate(userName: string): {
  subject: string;
  html: string;
} {
  const html = shell(
    `<p style="color:#94a3b8; font-size:13px; margin:8px 0 0;">Bienvenido al marketplace con IA</p>`,
    `
    <h1 class="title">¡Bienvenido a ComerxIA, ${userName}! 👋</h1>
    <p class="text">Estamos felices de tenerte en la comunidad. ComerxIA es el marketplace más inteligente de Argentina — publicá en 30 segundos con IA y llegá a compradores cerca tuyo.</p>

    <div class="card">
      <div class="card-title">🚀 Qué podés hacer</div>
      <div class="tip"><span>📸</span><span><strong>Publicar gratis:</strong> Sacá una foto y la IA genera el título, descripción y precio sugerido automáticamente.</span></div>
      <div class="tip"><span>🏪</span><span><strong>Crear tu tienda virtual:</strong> Tenés tu propia página con todos tus avisos y tu marca personal.</span></div>
      <div class="tip"><span>💬</span><span><strong>Mensajes directos:</strong> Hablá con compradores y vendedores sin salir de la plataforma.</span></div>
      <div class="tip"><span>⭐</span><span><strong>Destacar avisos:</strong> Aparecé primero en los resultados y vendé hasta 5× más rápido.</span></div>
    </div>

    <div class="btn-wrap">
      <a href="https://comerxia.com.ar/listings/new" class="btn">Crear mi primera publicación →</a>
    </div>

    <p class="text" style="font-size:13px; color:#94a3b8; text-align:center;">¿Tenés alguna duda? Escribinos a <a href="mailto:hola@comerxia.com.ar" style="color:#1E5BA8;">hola@comerxia.com.ar</a> — respondemos en menos de 24 hs.</p>
    `
  );

  return { subject: "¡Bienvenido a ComerxIA! 🎉", html };
}
